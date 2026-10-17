/**
 * dsh-mobile —— 独立手机端页面（host-only bundle，零运行时依赖）。
 *
 * 首版能力：
 * - /m/       手机页面：未配对进入配对屏；已配对进入工作区/会话 UI。
 * - /m/api    移动端 RPC：pair/request、pair/status、workspaces、sessions、
 *             session、session/create、session/prompt、me、pair/approve、
 *             devices、device/revoke。
 * - /m/admin  桌面审批页（仅回环可达）：列出待配对请求并批准、管理已配对设备。
 *
 * 配对：手机请求配对 → 手机显示 6 位码 → 桌面在 /m/admin 批准 → 手机轮询获得
 * HttpOnly 设备 cookie。一次性待配对 token，5 分钟过期。
 *
 * 复用 dsh 的 webServer 服务（不改变其绑定）；公网可达性由部署侧的反代 +
 * webserver 0.0.0.0 绑定决定。
 */
import { randomBytes, randomInt } from 'node:crypto'
import { homedir, networkInterfaces } from 'node:os'
import { join, basename } from 'node:path'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export const name = 'dsh-mobile'
export const inject = ['webServer', 'sessionController', 'workspaceRegistry']

const COOKIE_NAME = 'dsh_mobile'
const MOBILE_ROOT = '/m/'
const API_PREFIX = '/m/api'
const ADMIN_PATH = '/m/admin'
const ICON_PATH = '/m/icon.svg'
const TOKEN_TTL_MS = 5 * 60 * 1000
const IDLE_EXPIRE_MS = 7 * 24 * 3600 * 1000
const SWEEP_INTERVAL_MS = 60 * 1000
const MAX_DEVICES = 16

const __dirname = fileURLToPath(new URL('.', import.meta.url))

function defaultDevicesFile() {
  return join(homedir(), '.dsh', 'dsh-mobile-devices.json')
}

// ── HTTP helpers ────────────────────────────────────────────────────────────
function send(res, status, headers, body) {
  res.statusCode = status
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v)
  res.end(body)
}

function sendJson(res, status, obj, extraHeaders = {}) {
  send(res, status, { 'Content-Type': 'application/json; charset=utf-8', ...extraHeaders }, JSON.stringify(obj))
}

function sendHtml(res, status, html) {
  send(res, status, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }, html)
}

function sendText(res, status, type, text) {
  send(res, status, { 'Content-Type': type }, text)
}

function readBody(req, maxBytes = 1 << 20) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (c) => {
      size += c.length
      if (size > maxBytes) {
        reject(new Error('request body too large'))
        req.destroy()
        return
      }
      chunks.push(c)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

async function readJsonBody(req) {
  const raw = await readBody(req)
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    throw new Error('invalid JSON body')
  }
}

function parseCookies(req) {
  const out = {}
  const header = req.headers.cookie
  if (!header) return out
  for (const part of String(header).split(';')) {
    const i = part.indexOf('=')
    if (i < 0) continue
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim())
  }
  return out
}

function isLoopback(req) {
  const a = (req.socket && req.socket.remoteAddress) || ''
  return a === '127.0.0.1' || a === '::1' || a === '::ffff:127.0.0.1' || a === '::ffff:7f00:1'
}

function lanIPv4Addresses() {
  return Object.values(networkInterfaces())
    .flat()
    .filter((i) => i && i.family === 'IPv4' && !i.internal)
    .map((i) => i.address)
}

// ── device store ────────────────────────────────────────────────────────────
function loadDevices(file) {
  const out = new Map()
  try {
    if (!existsSync(file)) return out
    const saved = JSON.parse(readFileSync(file, 'utf8'))
    if (saved && typeof saved === 'object') {
      for (const [id, d] of Object.entries(saved)) {
        if (d && typeof d === 'object' && typeof d.token === 'string') out.set(id, d)
      }
    }
  } catch {}
  return out
}

function persistDevices(file, devices) {
  try {
    const dir = join(file, '..')
    if (dir && !existsSync(dir)) mkdirSync(dir, { recursive: true })
    const obj = {}
    for (const [id, d] of devices) obj[id] = d
    writeFileSync(file, JSON.stringify(obj, null, 2))
  } catch (err) {
    console.error('[dsh-mobile] failed to persist device store:', err && err.message)
  }
}

// ── message text extraction ─────────────────────────────────────────────────
function textOfEventData(data) {
  if (!data || typeof data !== 'object') return ''
  // assistant/message wraps the message as { message, stream, usage }
  const msg = 'message' in data ? data.message : data
  if (!msg || !Array.isArray(msg.content)) return ''
  return msg.content
    .filter((b) => b && b.type === 'text')
    .map((b) => String(b.text || ''))
    .join('')
}

// ── assets (read lazily, cached) ────────────────────────────────────────────
let mobileHtmlCache
function mobileHtml() {
  if (mobileHtmlCache === undefined) {
    mobileHtmlCache = readFileSync(join(__dirname, 'assets', 'mobile.html'), 'utf8')
  }
  return mobileHtmlCache
}

let iconSvgCache
function iconSvg() {
  if (iconSvgCache === undefined) {
    iconSvgCache = readFileSync(join(__dirname, 'assets', 'icon.svg'), 'utf8')
  }
  return iconSvgCache
}

// ── apply ───────────────────────────────────────────────────────────────────
export function apply(ctx, config) {
  const cfg = {
    enabled: true,
    publicBaseUrl: '',
    devicesFile: defaultDevicesFile(),
    ...(config || {}),
  }

  if (!cfg.enabled) return

  const devices = loadDevices(cfg.devicesFile)
  let pending = null // { requestId, code, createdAt, expiresAt, approved, deviceId, token }

  const cookieName = COOKIE_NAME

  function deviceTokenOf(req) {
    return parseCookies(req)[cookieName] || null
  }

  function authenticatedDevice(req) {
    const token = deviceTokenOf(req)
    if (!token) return null
    for (const [deviceId, d] of devices) {
      if (d.token === token) {
        d.lastSeenAt = Date.now()
        return { deviceId, ...d }
      }
    }
    return null
  }

  function issuePending() {
    const now = Date.now()
    pending = {
      requestId: randomBytes(12).toString('hex'),
      code: String(randomInt(0, 1e6)).padStart(6, '0'),
      createdAt: now,
      expiresAt: now + TOKEN_TTL_MS,
      approved: false,
      deviceId: null,
      token: null,
    }
    return pending
  }

  function approvePending(requestId, userAgent) {
    if (!pending || pending.requestId !== requestId || pending.approved) return null
    if (Date.now() > pending.expiresAt) {
      pending = null
      return null
    }
    if (devices.size >= MAX_DEVICES) return null
    const token = randomBytes(24).toString('hex')
    const deviceId = randomBytes(8).toString('hex')
    devices.set(deviceId, {
      token,
      name: '手机设备',
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
      userAgent: String(userAgent || '').slice(0, 180),
    })
    persistDevices(cfg.devicesFile, devices)
    pending.approved = true
    pending.deviceId = deviceId
    pending.token = token
    return { deviceId, token }
  }

  // ── LAN / public addresses for the admin page ─────────────────────────────
  function accessAddresses() {
    const port = ctx.webServer && typeof ctx.webServer.port === 'number' ? ctx.webServer.port : null
    const lan = port ? lanIPv4Addresses().map((a) => `http://${a}:${port}`) : []
    const publicBase = typeof cfg.publicBaseUrl === 'string' && cfg.publicBaseUrl.trim() !== '' ? cfg.publicBaseUrl.trim().replace(/\/+$/, '') : null
    return { lan, publicBase }
  }

  // ── API handlers ──────────────────────────────────────────────────────────
  async function pairRequest(_req, res) {
    const p = issuePending()
    sendJson(res, 200, { ok: true, code: p.code, requestId: p.requestId, expiresAt: p.expiresAt })
  }

  function pairStatus(req, res, url) {
    const requestId = url.searchParams.get('requestId')
    if (!pending || pending.requestId !== requestId) {
      sendJson(res, 200, { ok: true, status: 'expired' })
      return
    }
    if (Date.now() > pending.expiresAt) {
      pending = null
      sendJson(res, 200, { ok: true, status: 'expired' })
      return
    }
    if (pending.approved) {
      const token = pending.token
      const maxAge = Math.round(IDLE_EXPIRE_MS / 1000)
      sendJson(
        res,
        200,
        { ok: true, status: 'approved', deviceId: pending.deviceId },
        { 'Set-Cookie': `${cookieName}=${token}; Path=/m; HttpOnly; SameSite=Lax; Max-Age=${maxAge}` },
      )
      pending = null
      return
    }
    sendJson(res, 200, { ok: true, status: 'pending' })
  }

  function me(req, res) {
    const device = authenticatedDevice(req)
    if (!device) {
      sendJson(res, 401, { ok: false, paired: false })
      return
    }
    sendJson(res, 200, { ok: true, paired: true, deviceName: device.name })
  }

  function listWorkspaces(_req, res) {
    const list = (ctx.workspaceRegistry && typeof ctx.workspaceRegistry.list === 'function' ? ctx.workspaceRegistry.list() : [])
      .map((w) => ({ id: w.id, title: w.title || basename(w.path), path: w.path }))
    sendJson(res, 200, { ok: true, items: list })
  }

  async function listSessions(_req, res, url) {
    const workspaceId = url.searchParams.get('workspaceId') || null
    const sc = ctx.sessionController
    const { items = [] } = await sc.list({}, new AbortController().signal)
    const rows = items.map((it) => {
      let title = typeof it.projections?.values?.title === 'string' && it.projections.values.title !== '' ? it.projections.values.title : null
      if (!title && it.cwd) title = basename(it.cwd)
      if (!title) title = '会话'
      return {
        sessionId: it.sessionId,
        title,
        updatedAt: it.updatedAt,
        running: !!it.running,
        blank: !!it.blank,
        cwd: it.cwd || null,
      }
    })
    sendJson(res, 200, { ok: true, items: rows, workspaceId })
  }

  async function getSession(_req, res, url) {
    const sessionId = url.searchParams.get('sessionId')
    const maxMessages = Number(url.searchParams.get('maxMessages') || 50)
    if (!sessionId) {
      sendJson(res, 400, { ok: false, error: 'sessionId required' })
      return
    }
    const sc = ctx.sessionController
    const signal = new AbortController().signal
    // 从 follow 打开帧取 throughSeq 游标（session.page 必填）。
    let cursor
    try {
      const frames = sc.follow({ address: { kind: 'session', sessionId } }, signal)
      for await (const f of frames) {
        if (f && f.type === 'snapshot') {
          cursor = f.cursor
          break
        }
      }
    } catch {
      cursor = undefined
    }
    if (cursor === undefined) {
      sendJson(res, 200, { ok: true, messages: [], hasMore: false })
      return
    }
    const page = await sc.page(
      { address: { kind: 'session', sessionId }, throughSeq: cursor, maxMessages: Math.max(1, Math.min(maxMessages, 200)) },
      signal,
    )
    const messages = []
    for (const rec of page.records || []) {
      const ev = rec && rec.event
      if (!ev) continue
      if (ev.type === 'user/message' || ev.type === 'assistant/message') {
        const text = textOfEventData(ev.data)
        if (text === '') continue
        messages.push({ role: ev.type === 'user/message' ? 'user' : 'assistant', text, seq: ev.seq, time: ev.time })
      }
    }
    sendJson(res, 200, { ok: true, messages, hasMore: !!page.hasMore })
  }

  async function createSession(req, res) {
    const body = await readJsonBody(req)
    const sc = ctx.sessionController
    const value = await sc.create({ ...(body.workspaceId ? { workspaceId: body.workspaceId } : {}) })
    sendJson(res, 200, { ok: true, sessionId: value.sessionId })
  }

  async function promptSession(req, res) {
    const body = await readJsonBody(req)
    const text = String(body.text || '').trim()
    if (!body.sessionId || text === '') {
      sendJson(res, 400, { ok: false, error: 'sessionId and text required' })
      return
    }
    const sc = ctx.sessionController
    const requestId = `req-${randomBytes(8).toString('hex')}`
    await sc.prompt(
      { requestId, sessionId: body.sessionId, mode: 'queue', content: [{ type: 'text', text }] },
      new AbortController().signal,
    )
    sendJson(res, 200, { ok: true, accepted: true })
  }

  function approveHandler(req, res) {
    readJsonBody(req)
      .then((body) => {
        const result = approvePending(String(body.requestId || ''), req.headers['user-agent'])
        if (!result) {
          sendJson(res, 200, { ok: false, error: 'no pending request matches (expired or already approved)' })
          return
        }
        sendJson(res, 200, { ok: true, approved: true, deviceId: result.deviceId })
      })
      .catch((err) => sendJson(res, 400, { ok: false, error: String(err && err.message) }))
  }

  function listDevices(_req, res) {
    const items = [...devices.entries()].map(([deviceId, d]) => ({
      deviceId,
      name: d.name || '设备',
      createdAt: d.createdAt,
      lastSeenAt: d.lastSeenAt,
      userAgent: d.userAgent || '',
    }))
    sendJson(res, 200, { ok: true, items })
  }

  function revokeDevice(req, res) {
    readJsonBody(req)
      .then((body) => {
        const deviceId = String(body.deviceId || '')
        const removed = devices.delete(deviceId)
        if (removed) persistDevices(cfg.devicesFile, devices)
        sendJson(res, 200, { ok: true, removed })
      })
      .catch((err) => sendJson(res, 400, { ok: false, error: String(err && err.message) }))
  }

  function requireLoopback(req, res, fn) {
    if (!isLoopback(req)) {
      sendJson(res, 403, { ok: false, error: 'forbidden: this endpoint is host-only' })
      return
    }
    fn(req, res)
  }

  function pendingInfo(_req, res) {
    const p = pending && Date.now() <= pending.expiresAt ? pending : null
    sendJson(res, 200, {
      ok: true,
      pending: p ? { code: p.code, requestId: p.requestId, expiresAt: p.expiresAt, approved: p.approved } : null,
    })
  }

  async function handleApi(req, res) {
    let url
    try {
      url = new URL(req.url || '/', 'http://localhost')
    } catch {
      sendJson(res, 400, { ok: false, error: 'bad url' })
      return
    }
    const sub = url.pathname.slice(API_PREFIX.length).replace(/\/+$/, '')
    const method = (req.method || 'GET').toUpperCase()
    const key = `${method} ${sub}`

    const pairedRequired = ['GET /workspaces', 'GET /sessions', 'GET /session', 'POST /session/create', 'POST /session/prompt', 'GET /me']
    if (pairedRequired.includes(key) && !authenticatedDevice(req)) {
      sendJson(res, 401, { ok: false, paired: false })
      return
    }

    try {
      switch (key) {
        case 'POST /pair/request':
          return await pairRequest(req, res)
        case 'GET /pair/status':
          return pairStatus(req, res, url)
        case 'GET /me':
          return me(req, res)
        case 'GET /workspaces':
          return listWorkspaces(req, res)
        case 'GET /sessions':
          return await listSessions(req, res, url)
        case 'GET /session':
          return await getSession(req, res, url)
        case 'POST /session/create':
          return await createSession(req, res)
        case 'POST /session/prompt':
          return await promptSession(req, res)
        case 'POST /pair/approve':
          return requireLoopback(req, res, approveHandler)
        case 'GET /pending':
          return requireLoopback(req, res, pendingInfo)
        case 'GET /devices':
          return requireLoopback(req, res, listDevices)
        case 'POST /device/revoke':
          return requireLoopback(req, res, revokeDevice)
        default:
          return sendJson(res, 404, { ok: false, error: 'not found' })
      }
    } catch (err) {
      sendJson(res, 500, { ok: false, error: String((err && err.message) || err) })
    }
  }

  // ── admin page (loopback only) ────────────────────────────────────────────
  function serveAdmin(req, res) {
    if (!isLoopback(req)) {
      sendText(res, 403, 'text/plain; charset=utf-8', 'dsh-mobile: 该页面仅限宿主机访问')
      return
    }
    sendHtml(res, 200, adminHtml())
  }

  function adminHtml() {
    const { lan, publicBase } = accessAddresses()
    const addresses = [...lan, ...(publicBase ? [publicBase] : [])]
    const urlRows = addresses.map((a) => `<div class="url">${a}/m/</div>`).join('')
    return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>dsh mobile · 设备审批</title>
<style>
:root{--brand:#4D6BFE;--bg:#fff;--bg1:#f5f6f8;--fg:#1b1c20;--fg2:#6b6e78;--border:#e6e7ec;--err:#e5484d}
@media (prefers-color-scheme:dark){:root{--bg:#151517;--bg1:#1e1f24;--fg:#f2f3f5;--fg2:#9a9ea8;--border:#2b2d33}}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,"PingFang SC","Microsoft YaHei",sans-serif;background:var(--bg);color:var(--fg)}
.wrap{max-width:640px;margin:0 auto;padding:24px 16px 80px}
.brand{display:flex;align-items:center;gap:10px;margin-bottom:20px}
.brand svg{width:28px;height:28px}
.brand h1{font-size:18px;font-weight:600;margin:0}
.sub{color:var(--fg2);font-size:13px;line-height:20px;margin:4px 0 16px}
.card{background:var(--bg1);border:1px solid var(--border);border-radius:16px;padding:16px;margin-bottom:16px}
.card h2{font-size:14px;font-weight:600;margin:0 0 10px}
.url{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;color:var(--brand);padding:4px 0;word-break:break-all}
.row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0;border-top:1px solid var(--border)}
.row:first-of-type{border-top:0}
.name{font-weight:500;font-size:14px}
.detail{color:var(--fg2);font-size:12px}
.btn{border:0;border-radius:10px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer;background:var(--brand);color:#fff}
.btn.ghost{background:transparent;border:1px solid var(--border);color:var(--fg)}
.btn.danger{background:transparent;border:1px solid var(--err);color:var(--err)}
.code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:34px;font-weight:700;letter-spacing:6px;color:var(--brand);text-align:center;margin:10px 0}
.muted{color:var(--fg2);font-size:13px;text-align:center}
</style>
</head>
<body>
<div class="wrap">
  <div class="brand">${iconSvg()}<h1>dsh mobile · 设备审批</h1></div>
  <p class="sub">手机打开下方地址 → 点「开始配对」拿到 6 位码 → 回到本页批准。本页仅宿主机（回环）可访问。</p>
  <div class="card">
    <h2>待配对请求</h2>
    <div id="pending">加载中…</div>
  </div>
  <div class="card">
    <h2>已配对设备</h2>
    <div id="devices">加载中…</div>
  </div>
  <div class="card">
    <h2>访问地址</h2>
    ${urlRows || '<div class="muted">未检测到局域网地址；请配置 publicBaseUrl 或绑定 0.0.0.0。</div>'}
  </div>
</div>
<script>
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))
function time(ms){ if(!ms) return '—'; const d=new Date(ms); return d.toLocaleString() }
async function refresh(){
  const [penBox, d] = await Promise.all([
    fetch('/m/api/pending').then(r=>r.json()).catch(()=>({ok:false})),
    fetch('/m/api/devices').then(r=>r.json()).catch(()=>({items:[]}))
  ])
  const pen = document.getElementById('pending')
  if (penBox && penBox.ok && penBox.pending) {
    const q = penBox.pending
    pen.innerHTML = '<div class="code">'+esc(q.code)+'</div><div class="muted">'+esc(q.requestId.slice(0,8))+' · 过期 '+new Date(q.expiresAt).toLocaleTimeString()+'</div><div style="margin-top:12px;text-align:center"><button class="btn" onclick="approve(\''+esc(q.requestId)+'\')">批准此设备</button></div>'
  } else {
    pen.innerHTML = '<div class="muted">无待配对请求。请在手机上点「开始配对」。</div>'
  }
  const items = d.items || []
  const dev = document.getElementById('devices')
  if (!items.length) dev.innerHTML = '<div class="muted">尚无已配对设备</div>'
  else dev.innerHTML = items.map(it => '<div class="row"><div><div class="name">'+esc(it.name)+'</div><div class="detail">'+esc(it.deviceId)+' · 最近 '+time(it.lastSeenAt)+'</div></div><button class="btn danger" onclick="revoke(\''+esc(it.deviceId)+'\')">撤销</button></div>').join('')
}
async function approve(id){
  const r = await fetch('/m/api/pair/approve', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({requestId:id})}).then(r=>r.json())
  alert(r && r.ok ? '已批准，手机会自动进入应用。' : '批准失败：'+(r && r.error || '未知'))
  refresh()
}
async function revoke(id){
  await fetch('/m/api/device/revoke', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({deviceId:id})})
  refresh()
}
setInterval(refresh, 2500)
refresh()
</script>
</body>
</html>`
  }

  // ── page / icon / redirect ────────────────────────────────────────────────
  function servePage(_req, res) {
    sendHtml(res, 200, mobileHtml())
  }

  function serveIcon(_req, res) {
    sendText(res, 200, 'image/svg+xml', iconSvg())
  }

  function redirectToRoot(_req, res) {
    res.statusCode = 302
    res.setHeader('Location', MOBILE_ROOT)
    res.end()
  }

  // ── register routes + sweep ───────────────────────────────────────────────
  ctx.effect(() => {
    const routes = [
      { kind: 'exact', path: '/m', handler: redirectToRoot },
      { kind: 'exact', path: MOBILE_ROOT, handler: servePage },
      { kind: 'exact', path: ICON_PATH, handler: serveIcon },
      { kind: 'exact', path: ADMIN_PATH, handler: serveAdmin },
      { kind: 'prefix', path: API_PREFIX, handler: handleApi },
    ]
    const disposers = routes.map((r) => ctx.webServer.register(r))
    return () => {
      for (const dispose of disposers) dispose()
    }
  }, 'dsh-mobile: routes')

  ctx.effect(() => {
    const timer = setInterval(() => {
      const now = Date.now()
      for (const [deviceId, d] of devices) {
        if (now - (d.lastSeenAt || d.createdAt) > IDLE_EXPIRE_MS) devices.delete(deviceId)
      }
      if (pending && now > pending.expiresAt) pending = null
    }, SWEEP_INTERVAL_MS)
    timer.unref?.()
    return () => clearInterval(timer)
  }, 'dsh-mobile: sweep')

  console.log(`[dsh-mobile] mounted: /m/ page, /m/api RPC, /m/admin approval (devices: ${devices.size})`)
}
