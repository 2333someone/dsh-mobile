#!/usr/bin/env node
/**
 * dsh-mobile 契约冒烟（单层，不做测试金字塔）。
 *
 * 直接 `node test/smoke.mjs`（或 `npm run smoke`）跑，只依赖 Node 18+ 的 fetch，
 * 不引 vitest/jest。每条打印 `PASS/FAIL + 耗时`，任一失败退出码 1。
 *
 * 配置（环境变量，都有默认值）：
 *   DSH_MOBILE_BASE    默认 http://127.0.0.1:19387
 *   DSH_MOBILE_COOKIE  完整 cookie 串（如 `dsh_mobile=...`）；缺省时读
 *                      ~/.dsh/dsh-mobile-devices.json 里第一个设备的 token
 *
 * 安全边界：
 *   · 只创建一个临时会话并在 finally 里 archiveSession 归档；
 *   · 不注册/撤销设备，不写任何文件，不改 cordis.patch.yml；
 *   · 配对接口只用「无效 code」探测契约（404 invalid），不会真配对出设备。
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = (process.env.DSH_MOBILE_BASE || 'http://127.0.0.1:19387').replace(/\/+$/, '')
const DEVICES_FILE = join(homedir(), '.dsh', 'dsh-mobile-devices.json')
// 复用同一个「已归档探测会话」：归档只是从列表隐藏，工作区的 N 会话计数仍会 +1，
// 每跑一次都新建会持续污染用户数据。复用后只有首次建一次。
const REUSE_FILE = join(tmpdir(), 'dsh-mobile-smoke-session')

function readReuseSession() {
  try {
    const id = readFileSync(REUSE_FILE, 'utf8').trim()
    return id.startsWith('session-') ? id : ''
  } catch {
    return ''
  }
}
function rememberReuseSession(id) {
  try {
    writeFileSync(REUSE_FILE, id)
  } catch {
    /* 写不进临时目录就退化为每次新建（会多一个归档会话，不影响可见列表） */
  }
}

function resolveCookie() {
  const fromEnv = process.env.DSH_MOBILE_COOKIE || process.env.DSH_MOBILE_TOKEN || ''
  if (fromEnv !== '') return fromEnv.includes('=') ? fromEnv : `dsh_mobile=${fromEnv}`
  try {
    if (!existsSync(DEVICES_FILE)) return ''
    const table = JSON.parse(readFileSync(DEVICES_FILE, 'utf8'))
    for (const entry of Object.values(table)) {
      if (entry && typeof entry.token === 'string' && entry.token !== '') return `dsh_mobile=${entry.token}`
    }
  } catch {
    /* 读不到就走无 cookie 分支（配对检查会如实报 FAIL） */
  }
  return ''
}

const COOKIE = resolveCookie()

/** POST /m/api/<method>，返回解析后的 envelope（{ok,value|error}）。 */
async function rpc(method, payload = {}) {
  const res = await fetch(`${BASE}/m/api/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(COOKIE ? { Cookie: COOKIE } : {}) },
    body: JSON.stringify({ rpcId: `smoke-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, payload }),
  })
  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(`${method}: HTTP ${res.status} 非 JSON：${text.slice(0, 120)}`)
  }
  if (!json || typeof json !== 'object' || !json.result) {
    throw new Error(`${method}: envelope 缺 result（HTTP ${res.status}）：${text.slice(0, 160)}`)
  }
  return { status: res.status, envelope: json, result: json.result }
}

/** 断言工具：报错即让当前检查 FAIL。 */
function assert(cond, message) {
  if (!cond) throw new Error(message)
}
function isArray(v) {
  return Array.isArray(v)
}
function okValue(result, method) {
  assert(result.ok === true, `${method}: ok !== true（${JSON.stringify(result.error || result).slice(0, 160)}）`)
  assert(result.value !== undefined && result.value !== null, `${method}: 缺 value`)
  return result.value
}

/* ── 检查实现 ──────────────────────────────────────────────────────────── */

async function checkShell() {
  const headers = { 'Accept-Encoding': 'gzip, br', ...(COOKIE ? { Cookie: COOKIE } : {}) }
  const res = await fetch(`${BASE}/m/`, { headers })
  const html = await res.text()
  assert(res.status === 200, `/m/ 期望 200，实际 ${res.status}`)
  const ref = /mobile\.js\?v=[A-Za-z0-9_-]+/.exec(html)
  assert(ref !== null, `/m/ 未引用 mobile.js?v=…（HTML ${html.length}B）`)
  const encoding = (res.headers.get('content-encoding') || '').toLowerCase()
  assert(encoding === 'gzip' || encoding === 'br', `/m/ 未启用压缩：content-encoding=${encoding || '(none)'}`)
  const js = await fetch(`${BASE}/m/mobile.js`, { headers })
  assert(js.status === 200, `/m/mobile.js 期望 200，实际 ${js.status}`)
  const jsEncoding = (js.headers.get('content-encoding') || '').toLowerCase()
  assert(jsEncoding === 'gzip' || jsEncoding === 'br', `/m/mobile.js 未启用压缩：${jsEncoding || '(none)'}`)
  await js.arrayBuffer()
  return `${ref[0]} · /m/=${encoding} · mobile.js=${jsEncoding}`
}

async function checkPairingGate() {
  // 真实契约：/m/ 永远是静态外壳（HTML 里没有设备数据），门禁在 API 层；
  // 未配对不是重定向，而是 /m/api/* 返回 401/403，bundle 自己在页面里显示配对界面。
  const noCookie = await fetch(`${BASE}/m/api/session.list`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rpcId: 'smoke-nocookie', payload: {} }),
  })
  assert([401, 403].includes(noCookie.status), `无 cookie 访问 /m/api/session.list 期望 401/403，实际 ${noCookie.status}`)
  const shell = await fetch(`${BASE}/m/`)
  const shellHtml = await shell.text()
  assert(shell.status === 200, `无 cookie 的 /m/ 期望 200（静态外壳），实际 ${shell.status}`)
  assert(!/session-[0-9a-f-]{8,}/.test(shellHtml), '无 cookie 的 /m/ 外壳泄漏了会话 id')
  // 配对端点：必须在 /api/pair/accept（不是 /m/api/pair/accept）。无效 code
  // 必须回 404 + {ok:false,code:'invalid'}，证明路由存在且能读 JSON body。
  const pair = await fetch(`${BASE}/api/pair/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'smoke-invalid-code' }),
  })
  const pairJson = await pair.json().catch(() => null)
  assert(pair.status === 404, `/api/pair/accept 无效 code 期望 404，实际 ${pair.status}`)
  assert(pairJson && pairJson.ok === false && pairJson.code === 'invalid', `/api/pair/accept 无效 code 的响应形状不对：${JSON.stringify(pairJson).slice(0, 120)}`)
  assert(COOKIE !== '', '缺少 cookie：先配对一台设备，或设置 DSH_MOBILE_COOKIE')
  const paired = await fetch(`${BASE}/m/`, { headers: { Cookie: COOKIE } })
  const pairedHtml = await paired.text()
  assert(paired.status === 200 && /mobile\.js\?v=/.test(pairedHtml), `基线 cookie 的 /m/ 期望 200 + 应用壳，实际 ${paired.status}`)
  const pairedApi = await rpc('session.list')
  assert(pairedApi.result.ok === true, '基线 cookie 的 session.list 不 ok')
  return 'API 门禁=403 · /api/pair/accept invalid=404 · 基线 cookie=200'
}

async function checkSessionAndWorkspaceList() {
  const sessions = okValue((await rpc('session.list')).result, 'session.list')
  assert(isArray(sessions.items), 'session.list: value.items 不是数组')
  if (sessions.items.length > 0) {
    const first = sessions.items[0]
    for (const key of ['sessionId', 'updatedAt']) assert(key in first, `session.list: item 缺 ${key}`)
  }
  const spaces = okValue((await rpc('workspace.list')).result, 'workspace.list')
  assert(isArray(spaces.items), 'workspace.list: value.items 不是数组')
  assert(isArray(spaces.archivedSessionIds), 'workspace.list: value.archivedSessionIds 不是数组')
  if (spaces.items.length > 0) {
    const first = spaces.items[0]
    for (const key of ['workspaceId', 'path', 'title', 'sessionIds']) assert(key in first, `workspace.list: item 缺 ${key}`)
  }
  return `sessions=${sessions.items.length} · workspaces=${spaces.items.length}`
}

async function checkSessionRoundTrip() {
  const marker = `smoke-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  let sessionId = readReuseSession()
  let reused = false

  /** 发一条带 marker 的消息，轮询 history 直到读到它（<=20s）。 */
  async function probe(sid) {
    const prompt = (await rpc('session.prompt', {
      sessionId: sid,
      mode: 'queue',
      content: [{ type: 'text', text: `smoke probe ${marker}` }],
    })).result
    assert(prompt.ok === true, `session.prompt: ${JSON.stringify(prompt.error || prompt).slice(0, 160)}`)
    const deadline = Date.now() + 20_000
    let seen = false
    let historyShape = ''
    while (Date.now() < deadline) {
      const history = okValue((await rpc('session.history', { sessionId: sid, maxMessages: 20 })).result, 'session.history')
      assert(isArray(history.events), 'session.history: value.events 不是数组')
      if (history.events.length > 0) {
        const first = history.events[0]
        if (historyShape === '') historyShape = `events=${history.events.length}, keys=${Object.keys(first).join('|')}`
        seen = history.events.some((row) => {
          const ev = row && row.event
          if (!ev || ev.type !== 'user/message' || !ev.data) return false
          const content = ev.data.content
          const text = isArray(content)
            ? content.map((part) => (part && part.type === 'text' ? part.text : '')).join(' ')
            : typeof content === 'string' ? content : ''
          return String(text).includes(marker)
        })
      }
      if (seen) break
      await new Promise((resolve) => setTimeout(resolve, 400))
    }
    assert(seen, `session.history 20s 内没读到本次 user/message（${historyShape || 'events=0'}）`)
  }

  try {
    if (sessionId !== '') {
      try {
        // 复用会话上次是被归档的；归档态下 prompt 会被接受但 agent 不跑，
        // history 里不会出现 user/message —— 必须先解档再探测，最后再归档。
        await rpc('workspace.unarchiveSession', { sessionId })
        await probe(sessionId)
        reused = true
      } catch {
        sessionId = ''   // 复用失败（会话被清理等）→ 退回新建
      }
    }
    if (sessionId === '') {
      const spaces = okValue((await rpc('workspace.list')).result, 'workspace.list')
      assert(spaces.items.length > 0, 'workspace.list 为空，无法创建临时会话')
      const created = okValue((await rpc('session.create', { workspaceId: spaces.items[0].workspaceId })).result, 'session.create')
      sessionId = String(created.sessionId || '')
      assert(sessionId.startsWith('session-'), `session.create: sessionId 形状不对（${sessionId}）`)
      rememberReuseSession(sessionId)
      await probe(sessionId)
    }
    return `${sessionId.slice(0, 18)}… ${reused ? '复用已归档探测会话' : '新建探测会话'} · prompt→history 命中 user/message`
  } finally {
    if (sessionId !== '') {
      try {
        const archived = (await rpc('workspace.archiveSession', { sessionId })).result
        assert(archived.ok === true, `archiveSession 失败：${JSON.stringify(archived.error || archived).slice(0, 120)}`)
      } catch (error) {
        console.error(`  ! 临时会话归档失败，需人工清理 ${sessionId}: ${error && error.message}`)
      }
    }
  }
}

async function checkMobileSurfaces() {
  const pending = okValue((await rpc('mobile.pending')).result, 'mobile.pending')
  for (const key of ['approvals', 'questions', 'sessions']) assert(isArray(pending[key]), `mobile.pending: ${key} 不是数组`)
  const sessions = okValue((await rpc('session.list')).result, 'session.list')
  const sid = sessions.items.length > 0 ? sessions.items[0].sessionId : ''
  const commands = okValue((await rpc('mobile.commands', sid ? { sessionId: sid } : {})).result, 'mobile.commands')
  assert('available' in commands, 'mobile.commands: 缺 available')
  assert(isArray(commands.items), 'mobile.commands: items 不是数组')
  const models = okValue((await rpc('mobile.modelsCenter.get')).result, 'mobile.modelsCenter.get')
  assert('available' in models && 'readOnly' in models, 'mobile.modelsCenter.get: 缺 available/readOnly')
  assert(isArray(models.providers), 'mobile.modelsCenter.get: providers 不是数组')
  assert('defaultModel' in models, 'mobile.modelsCenter.get: 缺 defaultModel')
  return `pending={approvals:${pending.approvals.length},questions:${pending.questions.length}} · commands=${commands.items.length} · providers=${models.providers.length}`
}

async function checkStaticAssets() {
  for (const path of ['/m/theme.css', '/m/mobile.js']) {
    const res = await fetch(`${BASE}${path}`, { headers: COOKIE ? { Cookie: COOKIE } : {} })
    assert(res.status === 200, `${path} 期望 200，实际 ${res.status}`)
    const type = (res.headers.get('content-type') || '').toLowerCase()
    assert(type.includes('css') || type.includes('javascript'), `${path} content-type 异常：${type || '(none)'}`)
    await res.arrayBuffer()
  }
  return '/m/theme.css=200 · /m/mobile.js=200'
}

/* ── 运行器 ────────────────────────────────────────────────────────────── */

const CHECKS = [
  ['1. /m/ 应用壳（bundle 引用 + gzip/br）', checkShell],
  ['2. 配对门禁（无 cookie vs 基线 cookie）', checkPairingGate],
  ['3. session.list / workspace.list 结构', checkSessionAndWorkspaceList],
  ['4. 会话往返（create→prompt→history→archive）', checkSessionRoundTrip],
  ['5. mobile.pending / commands / modelsCenter', checkMobileSurfaces],
  ['6. 静态资源（theme.css / mobile.js）', checkStaticAssets],
]

async function main() {
  const startedAt = Date.now()
  console.log(`dsh-mobile 契约冒烟 · base=${BASE} · cookie=${COOKIE ? '已配置' : '缺失'}`)
  console.log('─'.repeat(78))
  let failed = 0
  for (const [name, fn] of CHECKS) {
    const started = Date.now()
    try {
      const detail = await fn()
      const ms = Date.now() - started
      console.log(`PASS  ${name}  ${String(ms).padStart(4)}ms${detail ? `  · ${detail}` : ''}`)
    } catch (error) {
      failed += 1
      const ms = Date.now() - started
      console.log(`FAIL  ${name}  ${String(ms).padStart(4)}ms  · ${error && error.message ? error.message : error}`)
    }
  }
  const total = Date.now() - startedAt
  console.log('─'.repeat(78))
  const passed = CHECKS.length - failed
  console.log(`${failed === 0 ? 'ALL PASS' : 'FAILED'}  ${passed}/${CHECKS.length} · 总耗时 ${total}ms`)
  if (failed > 0) process.exitCode = 1
}

main().catch((error) => {
  console.error('smoke 运行器异常：', error)
  process.exitCode = 1
})
