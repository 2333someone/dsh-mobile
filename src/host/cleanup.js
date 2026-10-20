/**
 * 手机端「删除」的宿主实现：归档墓碑、会话目录回收站、本会话写过的文件清单。
 *
 * 为什么不能直接调宿主删除：dsh 的会话存储后端在文档里明确写了「不删除会话
 * 文件 —— 日志在 root 下累积，直到外部移除；seam 无删除接口」。所以真正意义上的
 * 删除只能由外部移动/移除会话目录。这里把「外部移除」做成可恢复的回收站：
 *
 *   · purge 前先归档（workspaceRegistry 的全局归档集合）—— 所有设备的列表立即
 *     不再显示它，不必等宿主重扫磁盘；
 *   · 会话目录（~/.dsh/sessions/<--cwd-->/<id>/）整体移到 ~/.dsh/dsh-mobile-trash/；
 *   · 投影缓存（~/.dsh/storages/session_projcache/sessions/<id>.json）一并移除；
 *   · 每一次移动都写 journal，undo/restore 就是把文件原样搬回去 + 反归档。
 *
 * 文件清单只来自两处：会话日志里 write/edit 类工具调用的 file_path（可靠），
 * 以及会话目录里的日志文件本身。所有删除都先校验路径确实出现在清单里，
 * 并且只接受普通文件（不删目录、不跟符号链接）。
 */
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync, realpathSync, copyFileSync, unlinkSync } from 'node:fs'
import { homedir } from 'node:os'
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { zstdDecompressSync } from 'node:zlib'

const DSH_HOME = join(homedir(), '.dsh')

/** 会话日志根（可用 DSH_SESSIONS_DIR 覆盖，与宿主保持一致）。 */
export const SESSIONS_ROOT = process.env.DSH_SESSIONS_DIR || join(DSH_HOME, 'sessions')
/** 回收站根：会话目录与文件都先搬到这里。 */
export const TRASH_ROOT = process.env.DSH_MOBILE_TRASH_DIR || join(DSH_HOME, 'dsh-mobile-trash')
const PROJ_CACHE_ROOT = process.env.DSH_PROJ_CACHE_DIR || join(DSH_HOME, 'storages', 'session_projcache', 'sessions')
const JOURNAL_FILE = join(TRASH_ROOT, 'journal.json')
/** 单个会话最多列出的文件数（防止异常日志把手机撑爆）。 */
const MAX_FILES = 2000
const MAX_TRASH_ENTRIES = 200
const EDIT_TOOLS = new Set(['write', 'edit', 'multi_edit', 'apply_patch', 'write_file', 'create_file', 'str_replace', 'write_text_file'])

function ensureDir(path) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true })
}

/** 会话 id 只允许安全字符；去掉可能存在的 session- 前缀。 */
export function normalizeSessionId(raw) {
  const value = String(raw === undefined || raw === null ? '' : raw).trim()
  if (!/^(?:session-)?[A-Za-z0-9][A-Za-z0-9._-]{0,119}$/.test(value)) return ''
  return value.startsWith('session-') ? value.slice('session-'.length) : value
}

/** 会话 id 在日志/接口里的两种写法（有的地方带 session- 前缀）。 */
export function sessionIdVariants(raw) {
  const id = normalizeSessionId(raw)
  if (id === '') return []
  return [`session-${id}`, id]
}

/**
 * 定位会话目录：~/.dsh/sessions/<--cwd-->/<session-id>/。
 * 目录名有 `session-<id>` 与 `<id>` 两种历史写法，都认。
 */
export function findSessionDir(sessionId) {
  const variants = sessionIdVariants(sessionId)
  if (variants.length === 0) return undefined
  let entries = []
  try {
    entries = readdirSync(SESSIONS_ROOT)
  } catch {
    return undefined
  }
  for (const name of entries) {
    const workspaceDir = join(SESSIONS_ROOT, name)
    let isDir = false
    try {
      isDir = statSync(workspaceDir).isDirectory()
    } catch {
      isDir = false
    }
    if (!isDir) continue
    for (const variant of variants) {
      const candidate = join(workspaceDir, variant)
      try {
        if (statSync(candidate).isDirectory()) return candidate
      } catch {}
    }
  }
  return undefined
}

/** 会话目录里的日志文件（session*.jsonl[.zstd]），优先最新版本。 */
function sessionLogFiles(dir) {
  let names = []
  try {
    names = readdirSync(dir).filter((name) => /^session(?:\.[vV][0-9]+)?\.jsonl(?:\.zstd)?$/.test(name))
  } catch {
    return []
  }
  if (names.length === 0) return []
  const versionOf = (name) => {
    const match = /^session\.[vV]([0-9]+)\.jsonl/.exec(name)
    return match === null ? 0 : Number(match[1])
  }
  const best = names.reduce((top, name) => (versionOf(name) > versionOf(top) ? name : top), names[0])
  const compressed = `${best}.zstd`
  const chosen = names.includes(compressed) ? compressed : best
  return [chosen]
}

/**
 * 解压会话日志。会话日志是**追加写的多个 zstd frame**，Node 的
 * zstdDecompressSync 只解第一帧（实测 13MB → 200 字节），所以按 magic
 * 切帧逐个解压再拼接（zstd magic 落在压缩数据内部概率极低；失败则退回整块解）。
 */
function decompressSessionLog(buffer) {
  const MAGIC = Buffer.from([0x28, 0xb5, 0x2f, 0xfd])
  const offsets = []
  let at = 0
  while ((at = buffer.indexOf(MAGIC, at)) !== -1) {
    offsets.push(at)
    at += MAGIC.length
  }
  if (offsets.length <= 1) {
    try {
      return zstdDecompressSync(buffer)
    } catch {
      return buffer
    }
  }
  offsets.push(buffer.length)
  const parts = []
  for (let index = 0; index < offsets.length - 1; index += 1) {
    try {
      parts.push(zstdDecompressSync(buffer.subarray(offsets[index], offsets[index + 1])))
    } catch {}
  }
  return parts.length === 0 ? buffer : Buffer.concat(parts)
}

/** 会话目录里所有文件的体积信息（用于删除确认页）。 */
export function sessionDirInfo(sessionId) {
  const dir = findSessionDir(sessionId)
  if (dir === undefined) return { found: false }
  const files = []
  let bytes = 0
  let newest = 0
  try {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name)
      try {
        const stat = statSync(path)
        if (!stat.isFile()) continue
        files.push({ name, bytes: stat.size, mtime: stat.mtimeMs })
        bytes += stat.size
        newest = Math.max(newest, stat.mtimeMs)
      } catch {}
    }
  } catch {}
  return { found: true, dir, files, bytes, newest }
}

/** 从会话日志里收集 write/edit 类工具调用写过的文件（去重、附带次数）。 */
export function sessionWrittenFiles(sessionId) {
  const dir = findSessionDir(sessionId)
  if (dir === undefined) return new Map()
  const out = new Map()
  const logFiles = sessionLogFiles(dir)
  for (const name of logFiles) {
    let raw
    try {
      raw = readFileSync(join(dir, name))
    } catch {
      continue
    }
    let text
    try {
      text = (name.endsWith('.zstd') ? decompressSessionLog(raw) : raw).toString('utf8')
    } catch {
      continue
    }
    let start = 0
    while (start < text.length) {
      const end = text.indexOf('\n', start)
      const line = text.slice(start, end === -1 ? text.length : end)
      start = end === -1 ? text.length : end + 1
      if (line === '' || !line.includes('"tool-call"')) continue
      let event
      try {
        event = JSON.parse(line)
      } catch {
        continue
      }
      const content = event && event.data && event.data.message && event.data.message.content
      if (!Array.isArray(content)) continue
      for (const part of content) {
        if (!part || part.type !== 'tool-call' || !EDIT_TOOLS.has(part.name)) continue
        let args
        try {
          args = JSON.parse(part.arguments)
        } catch {
          continue
        }
        if (!args || typeof args !== 'object') continue
        const paths = []
        if (typeof args.file_path === 'string' && args.file_path !== '') paths.push(args.file_path)
        if (typeof args.path === 'string' && args.path !== '') paths.push(args.path)
        if (Array.isArray(args.paths)) {
          for (const item of args.paths) if (typeof item === 'string' && item !== '') paths.push(item)
        }
        for (const path of paths) {
          const existing = out.get(path)
          out.set(path, { path, count: (existing === undefined ? 0 : existing.count) + 1, tool: part.name })
        }
        if (out.size >= MAX_FILES) return out
      }
    }
  }
  return out
}

/** realpath（文件不存在时返回 undefined）；用于路径边界校验。 */
function realpathOrUndefined(path) {
  try {
    return realpathSync(path)
  } catch {
    return undefined
  }
}

export function isInside(parent, child) {
  const rel = relative(parent, child)
  return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel)
}

/**
 * 会话可删除文件清单（给手机端确认页）：
 *   logs      会话目录里的日志文件（删掉=会话记录本身）
 *   generated 会话日志里 write/edit 写过的、现在仍然存在的普通文件
 * 每项都带 absolute path、bytes、insideWorkspace，外部的默认不勾选。
 */
export function listSessionFiles(sessionId, cwd) {
  const dir = findSessionDir(sessionId)
  const base = dir === undefined ? undefined : resolve(dir)
  const workspace = typeof cwd === 'string' && cwd !== '' ? resolve(cwd) : undefined
  const workspaceReal = workspace === undefined ? undefined : (realpathOrUndefined(workspace) || workspace)
  const logs = []
  if (base !== undefined) {
    try {
      for (const name of readdirSync(base)) {
        const path = join(base, name)
        try {
          const stat = statSync(path)
          if (!stat.isFile()) continue
          logs.push({ group: 'logs', path, name, bytes: stat.size, mtime: stat.mtimeMs, insideWorkspace: false })
        } catch {}
      }
    } catch {}
  }
  const generated = []
  for (const record of sessionWrittenFiles(sessionId).values()) {
    // 日志里的路径可能是绝对路径，也可能是相对当时 cwd 的路径；两种基准都试。
    const candidates = []
    if (isAbsolute(record.path)) candidates.push(resolve(record.path))
    else {
      if (workspace !== undefined) candidates.push(resolve(workspace, record.path))
      candidates.push(resolve(record.path))
    }
    let path
    let stat
    for (const candidate of candidates) {
      try {
        const probe = statSync(candidate)
        if (probe.isFile()) { path = candidate; stat = probe; break }
      } catch {}
    }
    if (path === undefined) continue
    if (!stat.isFile()) continue
    const real = realpathOrUndefined(path)
    if (real === undefined) continue
    // 符号链接不提供删除（避免把链接目标删掉/穿越到别处）。
    try {
      if (lstatSync(path).isSymbolicLink()) continue
    } catch {}
    const inside = workspaceReal !== undefined && workspace !== undefined
      ? isInside(workspace, path) || isInside(workspaceReal, real)
      : false
    generated.push({
      group: 'generated',
      path,
      name: basename(path),
      bytes: stat.size,
      mtime: stat.mtimeMs,
      insideWorkspace: inside,
      tool: record.tool,
      count: record.count,
    })
  }
  generated.sort((a, b) => b.mtime - a.mtime)
  return {
    found: dir !== undefined,
    dir,
    cwd: workspace,
    groups: [
      { kind: 'logs', title: '会话日志', files: logs },
      { kind: 'generated', title: '本会话写过的文件', files: generated.slice(0, MAX_FILES) },
    ],
    bytes: [...logs, ...generated].reduce((sum, file) => sum + file.bytes, 0),
  }
}

/* ── 回收站 ─────────────────────────────────────────────────────────────── */

function readJournal() {
  try {
    const parsed = JSON.parse(readFileSync(JOURNAL_FILE, 'utf8'))
    return Array.isArray(parsed) ? parsed.filter((entry) => entry && typeof entry.id === 'string') : []
  } catch {
    return []
  }
}

function writeJournal(entries) {
  ensureDir(TRASH_ROOT)
  const tmp = `${JOURNAL_FILE}.tmp`
  writeFileSync(tmp, JSON.stringify(entries.slice(-MAX_TRASH_ENTRIES), null, 2))
  try {
    renameSync(tmp, JOURNAL_FILE)
  } catch {
    writeFileSync(JOURNAL_FILE, JSON.stringify(entries.slice(-MAX_TRASH_ENTRIES), null, 2))
  }
}

function newTrashId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function moveIntoTrash(id, kind, from) {
  const targetDir = join(TRASH_ROOT, id, kind)
  ensureDir(targetDir)
  const target = join(targetDir, basename(from))
  try {
    renameSync(from, target)
  } catch {
    // 跨盘/占用时退化为复制 + 删除；目录用 cpSync。
    if (statSync(from).isDirectory()) {
      copyDir(from, target)
      rmSync(from, { recursive: true, force: true })
    } else {
      copyFileSync(from, target)
      unlinkSync(from)
    }
  }
  return target
}

function copyDir(from, to) {
  ensureDir(to)
  for (const name of readdirSync(from)) {
    const source = join(from, name)
    const target = join(to, name)
    const stat = statSync(source)
    if (stat.isDirectory()) copyDir(source, target)
    else copyFileSync(source, target)
  }
}

/**
 * 把会话目录整体搬进回收站（hard=true 时直接彻底删除）。
 * 返回 journal entry（hard 模式下也留一条不含路径的墓碑，便于审计）。
 */
export function trashSessionDir(sessionId, options = {}) {
  const info = sessionDirInfo(sessionId)
  if (!info.found) return { ok: false, error: { code: 'not-found', message: '找不到会话目录（可能已经被删除）' } }
  const id = newTrashId()
  const hard = options.hard === true
  let entry
  if (hard) {
    rmSync(info.dir, { recursive: true, force: true })
    entry = { id, kind: 'session', sessionId: String(sessionId), hard: true, removedAt: Date.now(), items: [{ kind: 'session-dir', from: info.dir, to: undefined }] }
  } else {
    const target = moveIntoTrash(id, 'session', info.dir)
    entry = { id, kind: 'session', sessionId: String(sessionId), hard: false, removedAt: Date.now(), items: [{ kind: 'session-dir', from: info.dir, to: target }] }
  }
  removeProjectionCache(sessionId)
  const journal = readJournal()
  journal.push(entry)
  writeJournal(journal)
  return { ok: true, entry }
}

/** 删除会话目录里的投影缓存（否则列表重建时可能残留标题）。 */
export function removeProjectionCache(sessionId) {
  for (const variant of sessionIdVariants(sessionId)) {
    try {
      const path = join(PROJ_CACHE_ROOT, `${variant}.json`)
      if (existsSync(path)) rmSync(path, { force: true })
    } catch {}
  }
}

/** 把清单里的文件移到回收站（或彻底删除）；路径必须出现在 listSessionFiles 里。 */
export function trashSessionFiles(sessionId, paths, cwd, options = {}) {
  if (!Array.isArray(paths) || paths.length === 0) return { ok: false, error: { code: 'bad-request', message: '没有选中文件' } }
  const allowed = new Map()
  for (const group of listSessionFiles(sessionId, cwd).groups) {
    for (const file of group.files) allowed.set(resolve(file.path), file)
  }
  const id = newTrashId()
  const hard = options.hard === true
  const moved = []
  const missing = []
  for (const raw of paths) {
    if (typeof raw !== 'string' || raw === '') continue
    const path = resolve(raw)
    const file = allowed.get(path)
    if (file === undefined) {
      missing.push(path)
      continue
    }
    try {
      if (hard) {
        rmSync(path, { force: true })
        moved.push({ from: path, to: undefined, kind: 'file' })
      } else {
        const target = moveIntoTrash(id, 'files', path)
        moved.push({ from: path, to: target, kind: 'file' })
      }
    } catch (err) {
      missing.push(path)
    }
  }
  if (moved.length === 0) {
    return { ok: false, error: { code: 'not-found', message: missing.length === 0 ? '没有可删除的文件' : `文件不可删除：${missing.join('、')}` } }
  }
  if (!hard) {
    const journal = readJournal()
    journal.push({ id, kind: 'files', sessionId: String(sessionId), hard: false, removedAt: Date.now(), items: moved })
    writeJournal(journal)
  }
  return { ok: true, moved, missing, trashId: hard ? undefined : id }
}

export function listTrash() {
  return readJournal().slice().reverse().map((entry) => ({
    id: entry.id,
    kind: entry.kind,
    sessionId: entry.sessionId,
    hard: entry.hard === true,
    removedAt: entry.removedAt,
    items: Array.isArray(entry.items) ? entry.items.map((item) => ({ kind: item.kind, from: item.from, to: item.to })) : [],
  }))
}

/** 撤销一次回收站记录：把文件搬回原位（目标已存在则拒绝，不覆盖）。 */
export function restoreTrash(entryId) {
  const journal = readJournal()
  const entry = journal.find((candidate) => candidate.id === entryId)
  if (entry === undefined) return { ok: false, error: { code: 'not-found', message: '回收站记录不存在' } }
  if (entry.hard === true) return { ok: false, error: { code: 'purged', message: '该记录是彻底删除，无法恢复' } }
  const restored = []
  for (const item of entry.items || []) {
    if (typeof item.to !== 'string' || typeof item.from !== 'string') continue
    if (!existsSync(item.to)) continue
    if (existsSync(item.from)) return { ok: false, error: { code: 'exists', message: `目标已存在，未恢复：${item.from}` } }
    ensureDir(dirname(item.from))
    try {
      renameSync(item.to, item.from)
    } catch {
      if (statSync(item.to).isDirectory()) {
        copyDir(item.to, item.from)
        rmSync(item.to, { recursive: true, force: true })
      } else {
        copyFileSync(item.to, item.from)
        unlinkSync(item.to)
      }
    }
    restored.push({ from: item.from, to: item.to })
  }
  const remaining = journal.filter((candidate) => candidate.id !== entryId)
  writeJournal(remaining)
  try {
    const dir = join(TRASH_ROOT, entryId)
    if (existsSync(dir)) rmSync(dir, { recursive: true, force: true })
  } catch {}
  return { ok: true, restored, entry }
}

/** 清空回收站（保留 journal 的硬删除墓碑记录）。 */
export function emptyTrash() {
  const journal = readJournal()
  const keep = []
  let removed = 0
  for (const entry of journal) {
    if (entry.hard === true) {
      keep.push(entry)
      continue
    }
    try {
      const dir = join(TRASH_ROOT, entry.id)
      if (existsSync(dir)) rmSync(dir, { recursive: true, force: true })
      removed += 1
    } catch {
      keep.push(entry)
    }
  }
  writeJournal(keep)
  return { ok: true, removed }
}

/** 回收站当前占用体积（设置页显示用）。 */
export function trashStats() {
  const journal = readJournal()
  let entries = 0
  const sessionIds = new Set()
  for (const entry of journal) {
    if (entry.hard === true) continue
    entries += 1
    if (typeof entry.sessionId === 'string') sessionIds.add(entry.sessionId)
  }
  return { entries, sessions: sessionIds.size }
}

/* ── 工作区目录回收 ───────────────────────────────────────────────────────── */

/**
 * 把整个工作区目录搬进回收站。调用方必须已经让用户输入过路径确认；
 * 这里再做一层硬护栏：主目录、~/.dsh、插件自身目录、盘符根一律拒绝。
 */
export function trashWorkspaceDir(workspacePath, options = {}) {
  const path = resolve(String(workspacePath || ''))
  if (!isAbsolute(path) || !existsSync(path)) {
    return { ok: false, error: { code: 'not-found', message: '工作区目录不存在' } }
  }
  let stat
  try {
    stat = statSync(path)
  } catch {
    return { ok: false, error: { code: 'not-found', message: '工作区目录不可读' } }
  }
  if (!stat.isDirectory()) return { ok: false, error: { code: 'bad-request', message: '不是目录' } }
  const real = realpathOrUndefined(path) || path
  const home = resolve(homedir())
  const dsh = resolve(DSH_HOME)
  const plugin = options.pluginDir === undefined ? undefined : resolve(String(options.pluginDir))
  const refuse = (message) => ({ ok: false, error: { code: 'refused', message } })
  if (real === home) return refuse('不能删除用户主目录')
  if (real === resolve(real, '..')) return refuse('不能删除盘符根目录')
  if (real === dsh || isInside(real, dsh)) return refuse('不能删除 ~/.dsh 内部目录')
  if (plugin !== undefined && (real === plugin || isInside(real, plugin) || isInside(plugin, real))) {
    return refuse('该目录包含 dsh-mobile 插件自身，拒绝删除')
  }
  const id = newTrashId()
  const target = moveIntoTrash(id, 'workspace', real)
  const journal = readJournal()
  journal.push({ id, kind: 'workspace', hard: false, removedAt: Date.now(), items: [{ kind: 'workspace-dir', from: real, to: target }] })
  writeJournal(journal)
  return { ok: true, entry: journal[journal.length - 1] }
}
