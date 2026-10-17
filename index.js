/**
 * dsh-mobile —— 掌上 dsh（host 半 + 客户端设置页）。
 *
 * host 半（本文件）：
 * - /m/       手机页面（未配对输入 6 位码；已配对进入工作区/会话/聊天 UI）
 * - /m/api    移动端 RPC + 桌面设置页 RPC
 * - /m/icon.svg  插件图标
 *
 * 配对（dsh-palm 方向）：桌面设置页「生成配对码」→ 手机在 /m/ 输入该 6 位码
 * → 宿主机校验后下发 HttpOnly 设备 cookie。一次性 token，5 分钟过期。
 *
 * 客户端设置页（client.js）在 dsh 设置面板注册「掌上 dsh」段：出码、设备管理、
 * 访问地址展示。
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
  let pairToken = null // { code, expiresAt } —— 桌面出码后待手机输入

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

  function issuePairToken() {
    const now = Date.now()
    pairToken = {
      code: String(randomInt(0, 1e6)).padStart(6, '0'),
      expiresAt: now + TOKEN_TTL_MS,
    }
    return pairToken
  }

  function acceptPairCode(code, userAgent) {
    const now = Date.now()
    if (!pairToken || pairToken.code !== String(code).trim() || now > pairToken.expiresAt) {
      if (pairToken && now > pairToken.expiresAt) pairToken = null
      return null
    }
    if (devices.size >= MAX_DEVICES) return null
    const token = randomBytes(24).toString('hex')
    const deviceId = randomBytes(8).toString('hex')
    devices.set(deviceId, {
      token,
      name: '手机设备',
      createdAt: now,
      lastSeenAt: now,
      userAgent: String(userAgent || '').slice(0, 180),
    })
    persistDevices(cfg.devicesFile, devices)
    pairToken = null
    return { deviceId, token }
  }

  function accessAddresses() {
    const port = ctx.webServer && typeof ctx.webServer.port === 'number' ? ctx.webServer.port : null
    const lan = port ? lanIPv4Addresses().map((a) => `http://${a}:${port}`) : []
    const publicBase = typeof cfg.publicBaseUrl === 'string' && cfg.publicBaseUrl.trim() !== '' ? cfg.publicBaseUrl.trim().replace(/\/+$/, '') : null
    return { lan, publicBase }
  }

  // ── API handlers ──────────────────────────────────────────────────────────
  function me(req, res) {
    const device = authenticatedDevice(req)
    if (!device) {
      sendJson(res, 401, { ok: false, paired: false })
      return
    }
    sendJson(res, 200, { ok: true, paired: true, deviceName: device.name })
  }

  function pairIssue(_req, res) {
    const t = issuePairToken()
    sendJson(res, 200, { ok: true, code: t.code, expiresAt: t.expiresAt })
  }

  function pairAccept(req, res) {
    readJsonBody(req)
      .then((body) => {
        const result = acceptPairCode(String(body.code || ''), req.headers['user-agent'])
        if (!result) {
          sendJson(res, 200, { ok: false, error: '配对码无效或已过期' })
          return
        }
        const maxAge = Math.round(IDLE_EXPIRE_MS / 1000)
        sendJson(
          res,
          200,
          { ok: true, paired: true, deviceId: result.deviceId },
          { 'Set-Cookie': `${cookieName}=${result.token}; Path=/m; HttpOnly; SameSite=Lax; Max-Age=${maxAge}` },
        )
      })
      .catch((err) => sendJson(res, 400, { ok: false, error: String((err && err.message) || err) }))
  }

  function status(_req, res) {
    const now = Date.now()
    const devicesView = [...devices.entries()].map(([deviceId, d]) => ({
      deviceId,
      name: d.name || '设备',
      createdAt: d.createdAt,
      lastSeenAt: d.lastSeenAt,
      userAgent: d.userAgent || '',
    }))
    const pending = pairToken && now <= pairToken.expiresAt
      ? { code: pairToken.code, expiresAt: pairToken.expiresAt }
      : null
    sendJson(res, 200, { ok: true, addresses: accessAddresses(), devices: devicesView, pending })
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
        const removed = devices.delete(String(body.deviceId || ''))
        if (removed) persistDevices(cfg.devicesFile, devices)
        sendJson(res, 200, { ok: true, removed })
      })
      .catch((err) => sendJson(res, 400, { ok: false, error: String((err && err.message) || err) }))
  }

  function listWorkspaces(_req, res) {
    const list = (ctx.workspaceRegistry && typeof ctx.workspaceRegistry.list === 'function' ? ctx.workspaceRegistry.list() : [])
      .map((w) => ({ id: w.id, title: w.title || basename(w.path), path: w.path }))
    sendJson(res, 200, { ok: true, items: list })
  }

  async function listSessions(_req, res) {
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
    sendJson(res, 200, { ok: true, items: rows })
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

  function requireLoopback(req, res, fn) {
    if (!isLoopback(req)) {
      sendJson(res, 403, { ok: false, error: 'forbidden: this endpoint is host-only' })
      return
    }
    fn(req, res)
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
        case 'GET /me':
          return me(req, res)
        case 'POST /pair/issue':
          return requireLoopback(req, res, pairIssue)
        case 'POST /pair/accept':
          return pairAccept(req, res)
        case 'GET /status':
          return requireLoopback(req, res, status)
        case 'GET /devices':
          return requireLoopback(req, res, listDevices)
        case 'POST /device/revoke':
          return requireLoopback(req, res, revokeDevice)
        case 'GET /workspaces':
          return listWorkspaces(req, res)
        case 'GET /sessions':
          return await listSessions(req, res)
        case 'GET /session':
          return await getSession(req, res, url)
        case 'POST /session/create':
          return await createSession(req, res)
        case 'POST /session/prompt':
          return await promptSession(req, res)
        default:
          return sendJson(res, 404, { ok: false, error: 'not found' })
      }
    } catch (err) {
      sendJson(res, 500, { ok: false, error: String((err && err.message) || err) })
    }
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
      if (pairToken && now > pairToken.expiresAt) pairToken = null
    }, SWEEP_INTERVAL_MS)
    timer.unref?.()
    return () => clearInterval(timer)
  }, 'dsh-mobile: sweep')

  console.log(`[dsh-mobile] mounted: /m/ page + /m/api RPC (devices: ${devices.size})`)
}
