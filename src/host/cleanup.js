/**
 * 手机端「删除」的宿主实现：会话目录、会话文件、工作区目录的**永久删除**。
 *
 * 设计原则（用户明确要求）：删除就是删除，不做回收站。
 *   · 会话删除 = 归档墓碑（让所有设备立刻从列表消失）+ rm -rf 会话目录；
 *   · 文件删除 = 从「会话日志 write/edit 白名单」里校验后 rm；
 *   · 工作区目录删除 = 输入完整路径确认后 rm -rf，但保留硬护栏
 *     （主目录 / ~/.dsh / 插件自身目录 / 盘符根一律拒绝）。
 *
 * dsh 的会话存储后端没有删除接口（文档：「不删除会话文件，直到外部移除」），
 * 所以外部移除会话目录就是唯一正确的实现；投影缓存在这里一并清掉。
 */
import { existsSync, lstatSync, readFileSync, readdirSync, realpathSync, rmSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path'
import { zstdDecompressSync } from 'node:zlib'

const DSH_HOME = join(homedir(), '.dsh')

/** 会话日志根（可用 DSH_SESSIONS_DIR 覆盖，与宿主保持一致）。 */
export const SESSIONS_ROOT = process.env.DSH_SESSIONS_DIR || join(DSH_HOME, 'sessions')
const PROJ_CACHE_ROOT = process.env.DSH_PROJ_CACHE_DIR || join(DSH_HOME, 'storages', 'session_projcache', 'sessions')
/** 单个会话最多列出的文件数（防止异常日志把手机撑爆）。 */
const MAX_FILES = 2000
const EDIT_TOOLS = new Set(['write', 'edit', 'multi_edit', 'apply_patch', 'write_file', 'create_file', 'str_replace', 'write_text_file'])

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
  return [names.includes(compressed) ? compressed : best]
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
  for (const name of sessionLogFiles(dir)) {
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

/** 删除会话目录里的投影缓存（否则列表重建时可能残留标题）。 */
export function removeProjectionCache(sessionId) {
  for (const variant of sessionIdVariants(sessionId)) {
    try {
      const path = join(PROJ_CACHE_ROOT, `${variant}.json`)
      if (existsSync(path)) rmSync(path, { force: true })
    } catch {}
  }
}

/** 永久删除会话目录（rm -rf）；返回被删目录与体积。 */
export function purgeSessionDir(sessionId) {
  const info = sessionDirInfo(sessionId)
  if (!info.found) return { ok: false, error: { code: 'not-found', message: '找不到会话目录（可能已经被删除）' } }
  try {
    rmSync(info.dir, { recursive: true, force: true })
  } catch (err) {
    return { ok: false, error: { code: 'delete-failed', message: err && err.message ? err.message : String(err) } }
  }
  removeProjectionCache(sessionId)
  return { ok: true, dir: info.dir, bytes: info.bytes }
}

/**
 * 永久删除清单里的文件；路径必须出现在 listSessionFiles 的白名单里。
 * 任何不在白名单里的路径都不会被碰。
 */
export function purgeSessionFiles(sessionId, paths, cwd) {
  if (!Array.isArray(paths) || paths.length === 0) return { ok: false, error: { code: 'bad-request', message: '没有选中文件' } }
  const allowed = new Map()
  for (const group of listSessionFiles(sessionId, cwd).groups) {
    for (const file of group.files) allowed.set(resolve(file.path), file)
  }
  const removed = []
  const skipped = []
  for (const raw of paths) {
    if (typeof raw !== 'string' || raw === '') continue
    const path = resolve(raw)
    if (!allowed.has(path)) {
      skipped.push(path)
      continue
    }
    try {
      rmSync(path, { force: true })
      removed.push({ path })
    } catch {
      skipped.push(path)
    }
  }
  if (removed.length === 0) {
    return { ok: false, error: { code: 'not-found', message: skipped.length === 0 ? '没有可删除的文件' : `文件不可删除：${skipped.join('、')}` } }
  }
  return { ok: true, removed, skipped }
}

/* ── 工作区目录 ─────────────────────────────────────────────────────────── */

/**
 * 永久删除整个工作区目录。调用方必须已经让用户输入过路径确认；
 * 这里再做一层硬护栏：主目录、~/.dsh、插件自身目录、盘符根一律拒绝。
 */
export function purgeWorkspaceDir(workspacePath, options = {}) {
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
  if (real === dirname(real)) return refuse('不能删除盘符根目录')
  if (real === dsh || isInside(real, dsh)) return refuse('不能删除 ~/.dsh 内部目录')
  if (plugin !== undefined && (real === plugin || isInside(real, plugin) || isInside(plugin, real))) {
    return refuse('该目录包含 dsh-mobile 插件自身，拒绝删除')
  }
  try {
    rmSync(real, { recursive: true, force: true })
  } catch (err) {
    return { ok: false, error: { code: 'delete-failed', message: err && err.message ? err.message : String(err) } }
  }
  return { ok: true, dir: real }
}
