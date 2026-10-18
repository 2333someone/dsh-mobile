/**
 * dsh-mobile —— 掌上 dsh。
 *
 * 手机端「照搬 dsh-palm」：直接复用它的独立手机 bundle（React 内联、挂 #root），
 * 由本插件实现它期望的 /m/api/<method> RPC 协议（会话/工作区/模型/历史等）。
 * dsh-palm 的 host 端在 0.2.1 已不可用（settings.installSection 被移除），所以
 * 只复用它的手机 bundle，host 侧按 0.2.1 原生服务重写。
 *
 * 双 HTTP 面：
 * - 共享 webServer（回环）：供桌面 GUI 设置面板同源调用。
 * - 独立监听 0.0.0.0:<mobilePort>（默认 19387）：供手机/局域网/公网反代访问。
 *
 * 配对：桌面设置页出 6 位码 → 手机输码 → HttpOnly 设备 cookie。
 *
 * 手机 bundle 与 PWA 资源来自 dsh-palm（Apache-2.0），见 NOTICE。
 */
import { createServer } from 'node:http'
import { randomBytes, randomInt } from 'node:crypto'
import { homedir, networkInterfaces } from 'node:os'
import { join, basename } from 'node:path'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export const name = 'dsh-mobile'
// workspace.* 走 ctx.workspaceController，subagent.list 走 ctx.subagents，
// mobile.listDirectory 走 ctx.directoryPickerController —— 三者必须显式 inject，
// 否则 Cordis 会以「cannot get property ... without inject」拒绝读取，
// 靠加载顺序碰运气只会拿到 undefined（新建工作区由此白屏）。
export const inject = [
  'webServer',
  'sessionController',
  'workspaceRegistry',
  'workspaceController',
  'subagents',
  'directoryPickerController',
  'credentials',
  'deepseekAccount',
  // 手机工具栏「权限」按钮：读/切权限预设需要这两个服务。
  // permissionPresets 提供 catalog()（可选预设）/ current(session) / set(session, name)；
  // sessions 用来把 sessionId 解析成 Session 对象（上面两个方法收的是 Session，不是 id）。
  'permissionPresets',
  'sessions',
  // 排队消息（需求 C）：读 agent.inbox.nextTurn / nextStep 推 session/queue 帧。
  // agents 提供 sessionId → Agent（含 inbox）的解析；不加会「cannot get without inject」。
  'agents',
]

const COOKIE_NAME = 'dsh_mobile'
const MOBILE_ROOT = '/m/'
const API_PREFIX = '/m/api'
const BUNDLE_URL = '/m/mobile.js'
const MANIFEST_URL = '/m/manifest.webmanifest'
const ICON_SVG_URL = '/m/icon.svg'
const THEME_URL = '/m/theme.css'
const ICON_192_URL = '/m/icon-192.png'
const ICON_512_URL = '/m/icon-512.png'
const APPLE_TOUCH_URL = '/m/apple-touch-icon.png'
// 鲸鱼尾 APNG，与桌面 DSH 同一张图；现在只用在底部「输出中」状态行（mask 画形状）。
const WHALE_URL = '/m/whale.png'
// 浏览器推送能力自检页（只读诊断，不配对/不写设备/不订阅）。
const PUSH_CHECK_URL = '/m/push-check'
const TOKEN_TTL_MS = 5 * 60 * 1000
const IDLE_EXPIRE_MS = 7 * 24 * 3600 * 1000
const SWEEP_INTERVAL_MS = 60 * 1000
// 手机待处理项寿命：桌面侧不受影响，只是手机上过久没处理就不用再等。
const PENDING_TTL_MS = 30 * 60 * 1000
const PENDING_SWEEP_MS = 60 * 1000
const MAX_DEVICES = 16
const DEFAULT_MOBILE_PORT = 19387
// 固定配对码：手机端不再随机、也不会过期；留空则回退为随机 6 位码。
const DEFAULT_PAIR_CODE = '123456'
const SMALL_BODY = 64 * 1024
const PROMPT_BODY = 2 * 1024 * 1024

// ── 权限预设中文化 ────────────────────────────────────────────────────────
// 宿主 permissionPresets.catalog() 返回的 options 是原始英文。实测返回：
//   { value: 'read-only',          name: 'read-only'          }
//   { value: 'workspace-write',    name: 'workspace-write'    }
//   { value: 'danger-full-access', name: 'danger-full-access' }
//   { value: 'auto',               name: 'auto'               }
// name 与 value 是同一个串，且不带 description。直接透传给手机端就全是英文，
// 所以在这里统一换成中文。
//
// 两条硬规则：
//  ① 只翻译展示用的 name / description，绝不碰 value —— value 是回传宿主
//     pp.set(session, name) 的标识，改成中文会切不动甚至报错。
//  ② 未命中的一律保留原文，绝不丢选项、绝不返回空白。
//
// 措辞对齐宿主自带 Web UI 的中文标签（仅可查看 / 工作区内修改 / 完全权限 /
// 自动审查），手机端和桌面端看起来一致。
const PERMISSION_LABELS = {
  'read-only': '仅可查看',
  'workspace-write': '工作区内修改',
  'danger-full-access': '完全权限',
  auto: '自动审查',
  custom: '自定义',
  // 宿主 UI 的英文标题式写法，某些版本会直接拿它当 name。
  'Read Only': '仅可查看',
  'Workspace Write': '工作区内修改',
  'Full access': '完全权限',
  'Auto review': '自动审查',
  Custom: '自定义',
}

// 选项副标题。实测 catalog 目前不返回 description，这里按预设值补一句说明，
// 让手机面板上有解释，而不是孤零零四个词。
const PERMISSION_DESCS = {
  'read-only': '只读，不会改动任何文件',
  'workspace-write': '可在当前工作区内读写文件',
  'danger-full-access': '放开全部权限，风险自负',
  auto: '自动审查，按需授予',
  custom: '自定义权限配置',
}

/** 取选项中文名：命中映射则用中文，否则原样返回，绝不返回空串。 */
function permissionLabel(text) {
  const key = typeof text === 'string' ? text.trim() : ''
  if (key === '') return ''
  const hit = PERMISSION_LABELS[key] || PERMISSION_LABELS[key.toLowerCase()]
  return hit || key
}

/** 取选项中文说明：命中映射则用中文，取不到就返回空串（面板会跳过副标题）。 */
function permissionDesc(value, description) {
  const raw = typeof description === 'string' ? description.trim() : ''
  if (raw !== '') return permissionLabel(raw)
  const key = typeof value === 'string' ? value.trim() : ''
  return (key && PERMISSION_DESCS[key]) || ''
}

// ── SSE events.mux 常量 ────────────────────────────────────────────────────
// 手机 bundle 的 MuxClient 用 EventSource('/m/api/events.mux') 收帧，失败退化为轮询
//（聊天 1.5s / 子代理 8s）。这里把它接成真正的 SSE，让消息与事件即时到达。
// SSE 保活间隔：必须短于 bundle 的 stall 阈值（12s；活着时放宽到 36s），否则手机会
// 判定 SSE 停滞并重启轮询。
const SSE_HEARTBEAT_MS = 10000
// 并发 SSE 订阅上限：一台设备重连风暴不能无限持有宿主流与心跳定时器。
const MAX_SSE_SUBSCRIBERS = 8
// 每台设备的 SSE mux 同时跟随的会话数上限（手机同时只看很少几个会话）。
const MAX_FOLLOWED_PER_DEVICE = 4
// follow 流异常后的重试退避。
const FOLLOW_RETRY_MS = 3000
/**
 * 「没人再看这个会话」多久之后拆掉它的 follow 宿主流。
 * 必须明显长于 bundle 的 observe 重申周期（30s）与一次 SSE 重连的时间，
 * 否则换页/锁屏会被误判成离开 —— 那反倒把正在看的东西拆了。
 */
const OBSERVE_TTL_MS = 5 * 60 * 1000
// 每个被观察会话最多重服务商 N 次，之后放弃该会话（手机重开会重新登记）。
const MAX_FOLLOW_RESTARTS = 5
// 每个 SSE 连接的最大寿命上限：宿主不支持 reopen 时靠它回收资源。
const SSE_MAX_LIFETIME_MS = 30 * 60 * 1000
/**
 * 每台设备都收的 mux 帧类型（不管它打开了哪个会话）：控制镜像、会话列表状态、
 * 审批/提问面板 —— 都是不跟着当前聊天走的全局面。其余帧是会话作用域的，按设备路由
 *（见 openMux 的 muxVisibleTo），手机不必为没打开的会话付隧道流量。
 * 与 dsh-palm 的 MUX_ALWAYS_FORWARDED 同义。
 */
const MUX_ALWAYS_FORWARDED = new Set([
  'session/subscribed',
  'session/queue',
  'session/jobs',
  'session/projection',
  'session/added',
  'session/removed',
  'session/status',
  'session/activity',
  'session/error',
  'approval/requested',
  'approval/resolved',
  'question/requested',
  'question/resolved',
  'stream/error',
])
/**
 * 手机聊天页流式同步：模型逐字生成时，手机上也要同步逐字出现。
 *
 * 第一层：宿主的 sessionController.follow() 只有在请求里显式带 `assistantStream: true`
 * 时才产出 `{type:'assistant-stream', frame}` 帧 —— 契约里它是 optional 的 opt-in，
 * 不带就一帧都没有。这是「手机要等整条消息生成完才显示」的源头。
 *
 * 第二层（更关键）：手机 bundle 的 mux 解析器 `Pn()` 只认 15 种帧类型，
 * **`assistant-stream` 并不在其中**（它在 bundle 里只作为依赖自检的文案字符串出现一次）。
 * 直接把 `{type:'assistant-stream'}` 推下去会被 `Pn()` 静默丢弃，做了也白做。
 *
 * bundle 真正用来渲染流式气泡的是 `session/event` + 事件类型 `assistant/chunk`
 *（bundle reducer `Ke()`：`case 'assistant/chunk': case 'message/chunk': it(...)`；
 *  `it()` 走 `ze()` 归一化，认 `{chunk:{type:'text-delta'|'reasoning-delta', text}}`，
 *  靠 `{turn,step}` 或 `id` 定位到同一个待定气泡后做文本累加）。
 *
 * 所以宿主帧必须在**服务端**翻译成 `session/event`，再按 mux 信封推给手机。
 * 已核实的宿主帧契约（SessionAssistantStreamFrame）：
 *   start : { type:'start', attemptId, revision, startedAfterSeq, turn, step }
 *   chunk : { type:'chunk', attemptId, revision, index, time, chunk:JsonValue }
 *   end   : { type:'end',   attemptId, revision, index, outcome:{kind:'committed'|'abandoned',...} }
 */
const FOLLOW_ASSISTANT_STREAM = true
/**
 * 一轮流式里最多记住多少个已推 chunk 的 index（去重集合上限）。
 * 一轮正常是几百到几千个 chunk；封顶是为了长回复下不去无界增长。
 */
const STREAM_SEEN_INDEX_MAX = 5000
/**
 * 合成 chunk seq 的「小数槽」数：seq = startedAfterSeq + (index+1)/STREAM_SEQ_SLOTS。
 *
 * **必须是小数，不能是整数**，这是「手机上只显示半截」的根因，别改回去：
 *
 * ① bundle 的事件存储 `Dt.fold()` 只接受 `seq > state.maxSeq` 的事件
 *   （`for (let e of t) e.seq <= n || Ke(state, e)`），而 `Ke()` 每帧都把
 *   `maxSeq = max(maxSeq, seq)`。也就是说任何 seq 不大于已见最大值的帧都会被**静默丢弃**。
 * ② 宿主给「已落盘事件」分配的 seq 是**整数且连续**的：一轮开始时最后一个是
 *   startedAfterSeq = B，那这一轮的第一条 assistant/message 就是 B+1、tool/call 是 B+2……
 *   而 chunk 是在 message **落盘之前**推送的。
 * ③ 若 chunk 取整数 seq（旧实现 B+index+1），2298 个 chunk 会把手机端的 maxSeq
 *   顶到 B+2298；随后真正的 assistant/message(B+1)、tool/call(B+2)、step/end、
 *   turn/end(B+N) 全部因 `seq <= maxSeq` 被丢 —— 手机永远收不到最终消息与工具步骤，
 *   气泡停在「思考中 / 正在回答」，正文只有流式残段。（SSE 侧还有同样语义的
 *   seqWatermark，见 openMux：那一层也会把真事件当重复丢掉。）
 * ④ 因此 chunk 的 seq 必须落在开区间 (B, B+1) 里：既大于历史（fold 不会丢），
 *   又严格小于这一轮任何已落盘事件（真事件永远能通过）。用 index 做分子、
 *   1e6 做分母：5000 个 chunk 只占 0.005，离 1 还很远；index 就算异常大也钳到 999999，
 *   保证永不越界（越界就又回到被丢弃的老毛病）。
 */
const STREAM_SEQ_SLOTS = 1e6

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

function sendBuffer(res, status, type, buf) {
  send(res, status, { 'Content-Type': type, 'Cache-Control': 'public, max-age=3600' }, buf)
}

function readBody(req, maxBytes = SMALL_BODY) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (c) => {
      size += c.length
      if (size > maxBytes) {
        reject(new Error('body too large'))
        req.destroy()
        return
      }
      chunks.push(c)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

async function readJsonBody(req, budget = SMALL_BODY) {
  const raw = await readBody(req, budget)
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    throw new Error('invalid json body')
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
    .filter((a) => !a.startsWith('169.254.'))
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

// ── notify config (persisted) ───────────────────────────────────────────────
function loadNotifyConfig(file) {
  const defaults = {
    turnThresholdMs: 60000,
    turnCooldownMs: 300000,
    hideDetails: false,
    kinds: { jobs: false, todo: true, turns: true },
    channels: {},
  }
  try {
    if (!existsSync(file)) return defaults
    const saved = JSON.parse(readFileSync(file, 'utf8'))
    if (!saved || typeof saved !== 'object') return defaults
    return {
      ...defaults,
      ...saved,
      kinds: { ...defaults.kinds, ...(saved.kinds || {}) },
      channels: { ...(saved.channels || {}) },
    }
  } catch {
    return defaults
  }
}

function saveNotifyConfig(file, config) {
  try {
    const dir = join(file, '..')
    if (dir && !existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(file, JSON.stringify(config, null, 2))
  } catch (err) {
    console.error('[dsh-mobile] failed to persist notify config:', err && err.message)
  }
}

function notifyChannelsView(channels) {
  const ch = channels || {}
  const has = (v) => typeof v === 'string' && v.trim() !== ''
  return {
    serverchan: { configured: has(ch.serverchan && ch.serverchan.sendKey) },
    bark: { configured: has(ch.bark && ch.bark.key) },
    telegram: { configured: has(ch.telegram && ch.telegram.botToken) && has(ch.telegram && ch.telegram.chatId) },
    wxpusher: { configured: has(ch.wxpusher && ch.wxpusher.spt) },
    pushplus: { configured: has(ch.pushplus && ch.pushplus.token) },
  }
}

// ── 发送模式（sendMode）持久化 ──────────────────────────────────────────────
//
// 用户在「设置 → 发送模式」里选的「排队 / 直接插入」要能跨刷新、跨重连记住。
// 选的是**插件自己的配置文件**，不走宿主 settings 命名空间，理由：
//   ① 宿主的 settings.mutate 在本插件里明确返回 not-found（手机端设置只读），
//      要在官方命名空间里写，得先给插件注册一个 ns + schema，牵动 Loader 配置，
//      属于「两条路都做一半」的诱饵；
//   ② 这个值语义上就是本插件（手机端）的行为开关，不是宿主共享设置；
//   ③ 读写路径都在本文件内（mobile.preferences / session.prompt 两个 RPC），
//      一处实现即可闭环，不依赖宿主版本。
// 因此：单一实现，存 ~/.dsh/dsh-mobile-sendmode.json，与 notify config 同构。
const SEND_MODE_DEFAULT = 'queue'
const SEND_MODE_STEER = 'steer'
const SEND_MODE_QUEUE = 'queue'
/** 只接受 'queue' / 'steer'；别的（含空串/未设置）一律回落到默认 queue。 */
function normalizeSendMode(value) {
  return value === SEND_MODE_STEER ? SEND_MODE_STEER : SEND_MODE_QUEUE
}

function loadSendMode(file) {
  try {
    if (!existsSync(file)) return SEND_MODE_DEFAULT
    const saved = JSON.parse(readFileSync(file, 'utf8'))
    // 兼容两种落盘形态：裸字符串（早期/手写）与 { sendMode } 对象。
    const raw = (saved && typeof saved === 'object') ? saved.sendMode : saved
    return normalizeSendMode(typeof raw === 'string' ? raw : SEND_MODE_DEFAULT)
  } catch {
    return SEND_MODE_DEFAULT
  }
}

function saveSendMode(file, mode) {
  try {
    const dir = join(file, '..')
    if (dir && !existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(file, JSON.stringify({ sendMode: normalizeSendMode(mode) }, null, 2))
  } catch (err) {
    console.error('[dsh-mobile] failed to persist send mode:', err && err.message)
  }
}

/** 通过已配置的第三方通道投递一条通知；无通道时返回 false。 */
async function deliverNotify(config, event) {
  if (typeof fetch !== 'function') return false
  const channels = (config && config.channels) || {}
  const title = String((event && event.title) || 'dsh')
  const body = String((event && event.body) || '')
  const jobs = []
  if (channels.wxpusher && channels.wxpusher.spt) {
    jobs.push(fetch('https://wxpusher.zjiecode.com/api/send/message/simple-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spt: channels.wxpusher.spt, summary: title, content: body }),
    }))
  }
  if (channels.serverchan && channels.serverchan.sendKey) {
    jobs.push(fetch(`https://sctapi.ftqq.com/${encodeURIComponent(channels.serverchan.sendKey)}.send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `title=${encodeURIComponent(title)}&desp=${encodeURIComponent(body)}`,
    }))
  }
  if (channels.bark && channels.bark.key) {
    jobs.push(fetch(`https://api.day.app/${encodeURIComponent(channels.bark.key)}/${encodeURIComponent(title)}/${encodeURIComponent(body)}`))
  }
  if (channels.telegram && channels.telegram.botToken && channels.telegram.chatId) {
    jobs.push(fetch(`https://api.telegram.org/bot${channels.telegram.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: channels.telegram.chatId, text: `${title}\n${body}` }),
    }))
  }
  if (jobs.length === 0) return false
  const results = await Promise.allSettled(jobs)
  return results.some((r) => r.status === 'fulfilled')
}

/** 语音转写：按顺序尝试 OpenAI 兼容的 /audio/transcriptions 服务。 */
async function transcribeAudio(base64Audio, services) {
  if (typeof fetch !== 'function') return null
  if (typeof base64Audio !== 'string' || base64Audio === '') return null
  const list = (Array.isArray(services) ? services : []).filter(
    (s) => s && typeof s.baseURL === 'string' && s.baseURL.trim() !== '',
  )
  if (list.length === 0) return null
  let buffer
  try {
    buffer = Buffer.from(base64Audio, 'base64')
  } catch {
    return null
  }
  for (const svc of list) {
    try {
      const base = String(svc.baseURL).trim().replace(/\/+$/, '')
      const url = base.endsWith('/audio/transcriptions') ? base : `${base}/audio/transcriptions`
      const form = new FormData()
      form.append('file', new Blob([buffer], { type: 'audio/wav' }), 'audio.wav')
      if (typeof svc.model === 'string' && svc.model !== '') form.append('model', svc.model)
      const headers = {}
      if (typeof svc.apiKey === 'string' && svc.apiKey !== '') headers.Authorization = `Bearer ${svc.apiKey}`
      const res = await fetch(url, { method: 'POST', headers, body: form })
      if (!res.ok) continue
      const json = await res.json()
      const text = typeof json.text === 'string' ? json.text.trim() : ''
      if (text !== '') return text
    } catch {}
  }
  return null
}

// ── message text extraction (fallback simple API) ───────────────────────────
function textOfEventData(data) {
  if (!data || typeof data !== 'object') return ''
  const msg = 'message' in data ? data.message : data
  if (!msg || !Array.isArray(msg.content)) return ''
  return msg.content
    .filter((b) => b && b.type === 'text')
    .map((b) => String(b.text || ''))
    .join('')
}

// ── 用量页：DeepSeek 官方余额（宿主代理查询） ──────────────────────────────
//
// 手机设置页「用量 / 套餐与配额」的数据取值全部发生在宿主进程内：
// bundle 只拿到拼好的展示字符串，任何 API Key / 平台 token 都不会出现在
// 返回体里（19387 可能经公网反代，用例 BUILD-MOB-003）。
const USAGE_CACHE_TTL_MS = 60 * 1000
const BALANCE_FETCH_TIMEOUT_MS = 20 * 1000
const DEEPSEEK_BALANCE_URL = 'https://api.deepseek.com/user/balance'
const DEEPSEEK_BALANCE_NAME = 'DeepSeek'
const DEEPSEEK_BALANCE_BASE_URL = 'https://api.deepseek.com/'

/** 读取 0/1/多个钱包里的第一个可用数字；不是数字就跳过。 */
function firstNumericWallet(list) {
  if (!Array.isArray(list)) return undefined
  const hit = list.find((w) => w && typeof w === 'object')
  if (hit === undefined) return undefined
  return hit
}

/**
 * 把平台余额的最小保证形状压成一行 Row（本金钱包优先，其次赠送钱包）。
 *
 * 参数是 duck-typed 的：上游可能会在 `value` / `bonusWallets` 里给出多个钱包，
 * 我们只读 `{ currency, balance }` 两个字段，多出来的字段一律丢弃，
 * 也就不存在「多带一个 token 字段就顺手下发给手机」的可能。
 * @returns `1.23 CNY` 形式的展示串；拿不到合法形状时 undefined。
 */
function balanceRow(list) {
  const wallet = firstNumericWallet(list)
  if (wallet === undefined) return undefined
  const amount = wallet.balance
  if (amount === undefined || amount === null || amount === '') return undefined
  const digits = Number(amount)
  if (!Number.isFinite(digits)) return undefined
  const currency = typeof wallet.currency === 'string' && wallet.currency !== '' ? wallet.currency : 'CNY'
  return `${digits.toFixed(2)} ${currency}`
}

/** 按 (ctx, ref-name) 解析命中的 API Key。CredentialRef 是 `/^[A-Za-z_][A-Za-z0-9_]*$/` 品牌的字符串。 */
async function apiKeyValue(ctx, name) {
  const credentials = typeof ctx.get === 'function' ? ctx.get('credentials') : undefined
  if (credentials === undefined || typeof credentials.resolve !== 'function') return undefined
  try {
    const hit = credentials.resolve(name)
    const value = (await hit)?.value
    return typeof value === 'string' && value !== '' ? value : undefined
  } catch {
    return undefined
  }
}

/** 用给定 key 直查官方 /user/balance，超时软失败。成功返回金额+币种，否则抛错。 */
async function queryOfficialBalance(apiKey) {
  const response = await fetch(DEEPSEEK_BALANCE_URL, {
    method: 'GET',
    headers: { accept: 'application/json', authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(BALANCE_FETCH_TIMEOUT_MS),
  })
  if (!response.ok) {
    throw new Error(`DeepSeek balance endpoint returned ${response.status}`)
  }
  const payload = await response.json()
  const infos = Array.isArray(payload?.balance_infos) ? payload.balance_infos[0] : undefined
  if (!infos || typeof infos !== 'object') throw new Error('DeepSeek balance response has no balance_infos')
  const currency = typeof infos.currency === 'string' && infos.currency !== '' ? infos.currency : 'CNY'
  if (infos.total_balance === undefined || infos.total_balance === null || infos.total_balance === '') {
    throw new Error('DeepSeek balance response has no total_balance')
  }
  const digits = Number(infos.total_balance)
  if (!Number.isFinite(digits)) throw new Error('DeepSeek balance response total_balance is not numeric')
  return `${digits.toFixed(2)} ${currency}`
}

// 从宿主 `deepseekAccount` 服务读取平台登录态下的余额，返回 Row（展示串）或 undefined。
// getBalance 要求 AccountClientMetadata 三个必填字段；宿主据此派生平台请求头。
async function readAccountBalance(ctx) {
  const account = typeof ctx.get === 'function' ? ctx.get('deepseekAccount') : undefined
  if (account === undefined || typeof account.getBalance !== 'function') return undefined
  const client = {
    version: 'dsh-mobile',
    locale: 'zh',
    // AccountClientMetadata.timezoneOffsetSeconds：UTC 以东为正，JS 的 getTimezoneOffset() 符号相反。
    timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60,
  }
  let result
  try {
    result = await account.getBalance(client)
  } catch {
    return undefined
  }
  if (!result || result.status !== 'ready') return undefined
  // 钱包本身就是 {currency, balance}；拼串后原始对象不再外流。
  return balanceRow(result.value) ?? balanceRow(result.bonusWallets)
}

// ── assets ──────────────────────────────────────────────────────────────────
const assetCache = new Map()
function asset(name) {
  if (!assetCache.has(name)) {
    assetCache.set(name, readFileSync(join(__dirname, 'assets', name)))
  }
  return assetCache.get(name)
}
function assetText(name) {
  return asset(name).toString('utf8')
}

// ── 可见视口高度变量 --dm-vh ──────────────────────────────────────────────
// 手机端右侧竖向滚动条的第二层根因（第一层是 7729f83 修的 body 站位按钮）。
//
// bundle 的根容器（assets/mobile.bundle.js，禁止改）这样写：
//     #root { height: 100vh; height: 100dvh; }
// 100dvh 是对的，但**老 WebView（夸克 Quark / 鸿蒙 ArkWeb）不认 dvh**
// → 整条声明作废 → 落到上一行的 100vh 兜底。而 100vh 是**大视口高度**
// （地址栏收起时的高度），比当前可见区高 K px，于是 #root 被撑成
// 「可见高 + K」，文档溢出 K → 视口右侧冒出一条竖向滚动条。
//
// 修法：这里算出**实际可见高度**，写进 documentElement 的 --dm-vh，
// 由 theme.css 的 `height: var(--dm-vh, 100vh)` 覆盖掉那条 100vh 兜底。
//
// 必须放在最前面：--dm-vh 要在首帧之前就有值，否则第一帧仍是溢出布局；
// 本脚本只写 style、不碰 DOM 结构，先跑对后面的注入脚本无副作用。
//
// 防键盘抖动（红线）：visualViewport 在地址栏收展、软键盘弹出时高频变化。
//   ① rAF 合并：一帧内的多次事件只写一次属性；
//   ② 2px 阈值：变化不足 2px 直接忽略。取 2 而不是 1，是因为高度要先
//      Math.round 成整像素，而键盘动画期间的亚像素噪声经取整后**恰好会
//      产生 1px 的假变化**；阈值取 2 才能把这批噪声全部滤掉（仿真实测：
//      阈值 1 时 844±0.5 的噪声仍会写 2 次，阈值 2 时为 0 次）。
//      真实视口变化（地址栏收展几十 px、软键盘几百 px）远大于它，不受影响。
// 只有超阈值才真正触发一次 style 写入 + 重排。
//
// ── 另一个更隐蔽的坑：WebView 误报离线导致「丢图」 ─────────────────────
// bundle 的发消息路径里有一道硬拦截（assets/mobile.bundle.js，禁止改）：
//     if (navigator.onLine === false) {
//       ...
//       Ze.length > 0 && K('图片需联网发送，本次仅保存文本'); // ← 图片被丢掉
//       // 只把 text 存进离线 outbox，然后 return
//     }
// 也就是说：只要 WebView 把 navigator.onLine 误报成 false，用户选好的图片
// 就不会进 content，会话里那条 user/message 只剩 text 块 —— 正是「间歇性丢图」。
// 夸克 / 鸿蒙 ArkWeb 在代理网络、无默认路由、从后台恢复等场景会误报离线。
//
// 修法：在任何页面脚本（包括 bundle 的 module）之前，把 navigator.onLine 的
// **读取结果**固定为 true。只改这一个属性，不动 navigator 的其它字段，也不改
// 网络栈本身：真正断网时 prompt 请求照样失败并弹出「发送失败」，而不是把图片
// 静默吞掉。defineProperty 在个别 WebView 上会抛（属性不可配置），try/catch
// 静默跳过 —— 页面继续按原样运行，最坏退回旧行为，不影响其它功能。
//
// 位置：必须放进 <head>、在 bundle 之前。bundle 是 type="module"（defer），
// 发送时读的又是实时值；head 里的同步脚本仍然最早，能覆盖「模块初始化时读一次」
// 的实现，也不会被 bundle 的加载时机影响。
const ONLINE_GUARD_HTML = `<script>
(function () {
  /* dm-online-guard: Android/HarmonyOS WebViews may misreport navigator.onLine === false */
  try {
    Object.defineProperty(navigator, 'onLine', {
      get: function () { return true; },
      configurable: true
    });
  } catch (e) {}
})();
</script>`

const VIEWPORT_VH_HTML = `<script>
(function () {
  var KEY = '--dm-vh';
  var THRESHOLD = 2; // px：小于这个变化量就不写，专治键盘/地址栏动画的抖动
  var last = -1;
  var frame = 0;

  function measure() {
    var vv = window.visualViewport;
    var h;
    if (vv && typeof vv.height === 'number' && vv.height > 0) {
      // visualViewport.height = **当前可见**高度（已扣掉地址栏/键盘），单位是
      // CSS px。双指放大时它会变小（scale=2 → 只看得到一半的 CSS px），
      // 乘回 scale 还原成「布局视口坐标系」下的可见高度，避免缩放把应用缩小。
      var s = typeof vv.scale === 'number' && vv.scale > 0 ? vv.scale : 1;
      h = vv.height * s;
    } else {
      // 老 WebView 没有 visualViewport：innerHeight 就是可见高度
      // （100vh 之所以偏大，是因为它取的是大视口）。
      h = window.innerHeight;
    }
    // 上限兜底：永远不超过布局视口高度。万一上面算出偏大的值，也不会把文档
    // 撑出滚动条 —— 这是「兜底的兜底」，正常情况下不生效。
    var cap = document.documentElement.clientHeight;
    if (typeof cap === 'number' && cap > 0 && h > cap) h = cap;
    return Math.round(h);
  }

  function apply() {
    frame = 0;
    var h = measure();
    if (h <= 0) return;
    if (last >= 0 && Math.abs(h - last) < THRESHOLD) return; // 不显著 → 不写、不重排
    last = h;
    document.documentElement.style.setProperty(KEY, h + 'px');
  }

  // 一帧内的多次事件合并成一次写入。
  function schedule() {
    if (frame) return;
    frame = (window.requestAnimationFrame || function (fn) { return window.setTimeout(fn, 16); })(apply);
  }

  apply(); // 首帧：必须在 bundle 的 #root 渲染前就把值写好

  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('orientationchange', schedule, { passive: true });
  if (window.visualViewport) {
    // 地址栏收展、软键盘弹出都走这里（部分 WebView 上 window.resize 不触发）。
    window.visualViewport.addEventListener('resize', schedule, { passive: true });
    window.visualViewport.addEventListener('scroll', schedule, { passive: true });
  }
  // 兜底：极老 WebView 上 visualViewport 缺失、resize 也不触发时，
  // 低频轮询（1s）仍能跟上地址栏收展；阈值保证它平时不产生任何写入。
  window.setInterval(schedule, 1000);
})();
</script>`

// 输入框上方工具行：+ / 模型 / 上下文用量 图标；模型打开底部上滑抽屉。
// 另：运行中且输入框有文字时，把「停止」按钮改成「发送」（排队发送）。
const MODEL_BUTTON_HTML = `<button id="dm-model-btn" type="button" aria-label="模型"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M9 9h6M9 12h6M9 15h3"/></svg></button><script>
(function () {
  var btn = document.getElementById('dm-model-btn');
  if (!btn) return;
  var lastSessionId = '';

  // 本页脚本先于 bundle 执行：拦截 RPC 请求，自动记住当前会话 id。
  var origFetch = window.fetch;
  if (typeof origFetch === 'function') {
    window.fetch = function (input, init) {
      try {
        var url = typeof input === 'string' ? input : (input && input.url) || '';
        if (url.indexOf('/m/api/') >= 0 && init && typeof init.body === 'string') {
          var body = JSON.parse(init.body);
          if (body && body.payload && typeof body.payload.sessionId === 'string' && body.payload.sessionId) {
            lastSessionId = body.payload.sessionId;
          }
        }
      } catch (e) {}
      return origFetch.apply(this, arguments);
    };
  }

  function toolsRow() { return document.querySelector('.chat-tools'); }
  function pill() { return document.querySelector('.chat-pill[aria-label^="切换模型"]'); }
  function sheetOpen() {
    var b = document.querySelector('.sheet-backdrop');
    return !!(b && b.getBoundingClientRect().width > 0);
  }
  function inputEl() { return document.querySelector('.chat-input'); }
  function rpc(method, payload) {
    return fetch('/m/api/' + method, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rpcId: 'dm-' + Date.now(), payload: payload }),
    }).then(function (r) { return r.json(); }).then(function (j) { return j ? j.result : null; });
  }
  function currentSession() {
    try {
      var s = new URL(location.href).searchParams.get('session');
      if (s) return s;
    } catch (e) {}
    return lastSessionId;
  }

  // 把「+」和模型按钮放进输入框上方的工具行（同一层，随页面出现）。
  function ensureTools() {
    var t = toolsRow();
    if (!t) return;
    var row = document.getElementById('dm-tools');
    if (!row) {
      row = document.createElement('div');
      row.id = 'dm-tools';
      var attach = document.createElement('button');
      attach.type = 'button';
      attach.className = 'dm-tool-btn';
      attach.setAttribute('aria-label', '添加内容');
      attach.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
      attach.onclick = function (e) {
        e.preventDefault();
        var b = document.querySelector('.chat-attach-btn[aria-label="添加内容"]');
        if (b) b.click();
      };
      row.appendChild(attach);
      row.appendChild(btn);
    }
    if (row.parentNode !== t) t.insertBefore(row, t.firstChild);
    // 上下文圆环也并入同一组图标，保持完全一致的外观与排列。
    var ctx = document.querySelector('.chat-context');
    if (ctx && ctx.parentNode !== row) row.appendChild(ctx);
  }

  btn.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (sheetOpen()) {
      document.querySelector('.sheet-backdrop').click();
      return;
    }
    var p = pill();
    if (!p) return;
    // 打开内联面板（被 CSS 隐藏），再点「全部…」唤起底部抽屉（模型 + 思考强度）。
    p.click();
    setTimeout(function () {
      var more = document.querySelector('.chat-picker-more');
      if (more) more.click();
      else {
        var scrim = document.querySelector('.chat-picker-scrim');
        if (scrim) scrim.click();
      }
    }, 60);
  });

  // 运行中：输入框有文字时，点「停止」按钮改为排队发送。
  function queueSend(text) {
    var sid = currentSession();
    if (!sid) return;
    rpc('session.prompt', {
      sessionId: sid,
      mode: 'queue',
      content: [{ type: 'text', text: text }],
    }).then(function (res) {
      if (!res || !res.ok) return;
      var ta = inputEl();
      if (!ta) return;
      try {
        var setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
        setter.call(ta, '');
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      } catch (e) {
        ta.value = '';
      }
    });
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    var stopBtn = t && t.closest ? t.closest('.chat-send-stop') : null;
    if (!stopBtn) return;
    var ta = inputEl();
    if (!ta) return;
    var text = (ta.value || '').trim();
    if (text === '') return; // 空输入：保持停止
    e.preventDefault();
    e.stopPropagation();
    queueSend(text);
  }, true);

  // 空白会话还没有用量投影：bundle 只渲染裸文本「上下文 --」（被 CSS 的 font-size:0
  // 藏掉），于是 32px 的用量按钮看上去是空的 —— 用户报的「用量图标不见了」就是它，
  // 不是被我们的 CSS 主动 display:none 掉的。两个补丁各管一半：
  //   · theme.css 用 .chat-context:not(:has(.chat-context-ring))::before 补一个 0% 空环；
  //   · 这里补点击：bundle 的 onClick 在 li===undefined 时什么都不做（pi()），
  //     点开一个只有「0 / 暂无用量」的面板，不伪造任何数字。
  // 有真用量后 bundle 会渲染出 .chat-context-ring，这段逻辑自动让位给它的原生抽屉。
  var ctxPanel = null;
  function closeCtxPanel() {
    if (ctxPanel) ctxPanel.classList.remove('dm-perm-open');
  }
  function openCtxPanel() {
    if (!ctxPanel) {
      var back = document.createElement('div');
      back.className = 'dm-perm-backdrop';
      var sheet = document.createElement('div');
      sheet.className = 'dm-perm-sheet';
      var head = document.createElement('div');
      head.className = 'dm-perm-head';
      var title = document.createElement('div');
      title.className = 'dm-perm-title';
      title.textContent = '上下文用量';
      var close = document.createElement('button');
      close.className = 'dm-perm-close';
      close.type = 'button';
      close.textContent = '✕';
      close.setAttribute('aria-label', '关闭');
      close.onclick = function (e) { e.preventDefault(); closeCtxPanel(); };
      head.appendChild(title);
      head.appendChild(close);
      var body = document.createElement('div');
      body.className = 'dm-perm-body';
      var row = document.createElement('div');
      row.className = 'dm-perm-row';
      var main = document.createElement('div');
      main.className = 'dm-perm-main';
      var name = document.createElement('div');
      name.className = 'dm-perm-name';
      name.textContent = '已使用 0%';
      var sub = document.createElement('div');
      sub.className = 'dm-perm-sub';
      sub.textContent = '会话还没有发出第一条消息，暂无上下文用量。发一条消息后，这里会显示真实的占用比例。';
      main.appendChild(name);
      main.appendChild(sub);
      row.appendChild(main);
      body.appendChild(row);
      sheet.appendChild(head);
      sheet.appendChild(body);
      back.appendChild(sheet);
      back.addEventListener('click', function (e) { if (e.target === back) closeCtxPanel(); });
      document.body.appendChild(back);
      ctxPanel = back;
    }
    ctxPanel.classList.add('dm-perm-open');
  }

  // 捕获阶段拦截：只有「没有真圆环」的空白会话才归我们处理；
  // 有圆环时原样放行，交给 bundle 自己的用量抽屉（含它自己的收起动画）。
  document.addEventListener('click', function (e) {
    var t = e.target;
    var ring = t && t.closest ? t.closest('.chat-context') : null;
    if (!ring) return;
    if (ring.querySelector('.chat-context-ring')) return;
    e.preventDefault();
    e.stopPropagation();
    openCtxPanel();
  }, true);

  setInterval(ensureTools, 120);
  ensureTools();
})();
</script>`

// 弹窗关闭过渡：点空白处先播「从上往下缩回」动画，再交给 bundle 真正关闭。
// 只监听 *.sheet-backdrop（+ / 模型抽屉）与上下文抽屉自己的遮罩，
// 点击顺序：document 捕获阶段拦截 → 阻止 React 立即卸载 → 动画结束补一次
// 带 bypass 标记的点击（本次不再拦截）→ React onClose 生效。
const SHEET_CLOSE_HTML = `<script>
(function () {
  // 与 theme.css 的 dm-sheet-down 时长保持一致（280ms），留一点余量。
  var DURATION = 280;
  var EXTRA = 40;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function playing(el) {
    return !!(el && el.getAttribute('data-dm-closing') === '1');
  }
  function begin(el) {
    if (!el) return;
    el.setAttribute('data-dm-closing', '1');
    el.classList.add('dm-closing');
  }
  // 动画结束后补发点击：带上 bypass 标记，让本监听器放行一次。
  function replay(trigger) {
    if (!trigger) return;
    trigger.removeAttribute('data-dm-closing');
    trigger.setAttribute('data-dm-bypass', '1');
    trigger.click();
  }

  function animateSheet(backdrop) {
    begin(backdrop);
    begin(backdrop.querySelector('.sheet'));
    window.setTimeout(function () { replay(backdrop); }, DURATION + EXTRA);
  }

  // 上下文用量抽屉：遮罩和抽屉是两个独立节点，关闭后由 scrim 的 onClick 生效。
  function animateContext(close) {
    var pop = document.querySelector('.chat-context-pop');
    var scrim = document.querySelector('.chat-context-pop-scrim');
    if (!pop) return false;
    begin(pop);
    begin(scrim);
    window.setTimeout(function () {
      if (scrim) {
        scrim.removeAttribute('data-dm-closing');
        scrim.classList.remove('dm-closing');
      }
      close();
    }, DURATION + EXTRA);
    return true;
  }

  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || !target.closest) return;

    // 1) 底部抽屉（+ / 模型 / 运行状态等）：点在遮罩空白处才收起。
    var backdrop = target.closest('.sheet-backdrop');
    if (backdrop) {
      if (backdrop.getAttribute('data-dm-bypass') === '1') {
        backdrop.removeAttribute('data-dm-bypass');
        return;
      }
      if (target.closest('.sheet')) return; // 点抽屉内容，走它自己的处理
      event.preventDefault();
      event.stopPropagation();
      if (playing(backdrop)) return;
      animateSheet(backdrop);
      return;
    }

    // 2) 上下文用量抽屉的遮罩。
    var scrim = target.closest('.chat-context-pop-scrim');
    if (scrim) {
      if (scrim.getAttribute('data-dm-bypass') === '1') {
        scrim.removeAttribute('data-dm-bypass');
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      if (playing(scrim)) return;
      animateContext(function () {
        scrim.setAttribute('data-dm-bypass', '1');
        scrim.click();
      });
      return;
    }

    // 3) 再点一次同一个「上下文」按钮收起，也走同一段动画。
    var ring = target.closest('.chat-context[aria-expanded="true"]');
    if (ring) {
      if (ring.getAttribute('data-dm-bypass') === '1') {
        ring.removeAttribute('data-dm-bypass');
        return;
      }
      var pop = document.querySelector('.chat-context-pop');
      if (!pop) return;
      event.preventDefault();
      event.stopPropagation();
      // 已经有一段收起动画在跑：这次点击直接吞掉，避免重复计时器。
      if (playing(ring) || playing(pop)) return;
      ring.setAttribute('data-dm-closing', '1');
      animateContext(function () {
        ring.removeAttribute('data-dm-closing');
        ring.setAttribute('data-dm-bypass', '1');
        ring.click();
      });
    }
  }, true);
})();
</script>`

// emoji 图标替换：bundle 里这些图标是纯文本节点，CSS 换不掉，只能运行时把命中的
// emoji 换成同尺寸的行内描边 SVG。只精确匹配下表里的序列（含 FE0F 变体选择器），
// ▾/▸ 折叠箭头和正文里的 emoji 都不会被碰到。
// 用 splitText 切出 emoji，再把该文本节点「搬」进 display:none 的 .dm-emoji-src
// 并在前面插入 <svg>：只搬不换、不用 replaceChild、绝不 innerHTML 重写整个节点。
// （replaceChild 摘掉文本节点后 React 仍持有它，重渲染时会去更新一个已脱离文档
//  的孤儿节点 —— 图标不更新、还会重复堆叠。与 TURN_PILL_HTML 同一套哲学。）
const EMOJI_ICON_HTML = `<script>
(function () {
  try {
    if (!document.body) return;
    var NS = 'http://www.w3.org/2000/svg';
    // 统一 24×24 viewBox / fill=none / stroke=currentColor / stroke-width 1.8 / 圆头圆角。
    var ICONS = {
      search: '<circle cx="11" cy="11" r="6.4"/><path d="M15.8 15.8 20 20"/>',
      read: '<path d="M3 7.2A2.2 2.2 0 0 1 5.2 5h3.3l2 2.4H18.8A2.2 2.2 0 0 1 21 9.6v6.2A2.2 2.2 0 0 1 18.8 18H5.2A2.2 2.2 0 0 1 3 15.8z"/>',
      gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 3.6v2.3M12 18.1v2.3M4.7 7.9l2 1.1M17.3 15l2 1.1M4.7 16.1l2-1.1M17.3 8.9l2-1.1"/>',
      pencil: '<path d="M4.6 19.4l1-4L16.7 4.3a2.1 2.1 0 0 1 3 3L8.6 18.4z"/><path d="M14.7 6.3l3 3"/>',
      code: '<path d="M9 7.4 4.7 12 9 16.6"/><path d="M15 7.4 19.3 12 15 16.6"/><path d="M13.6 5.6 10 18.4"/>',
      tool: '<path d="M14.6 6.4a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.8 7.8l-7 7a2.1 2.1 0 1 1-3-3l7-7a6 6 0 0 1 7.8-7.8l-3.8 3.8z"/>',
      running: '<path d="M7.5 4h9"/><path d="M7.5 20h9"/><path d="M8.7 4 12 12l-3.3 8"/><path d="M15.3 4 12 12l3.3 8"/>',
      failed: '<path d="M6.6 6.6 17.4 17.4"/><path d="M17.4 6.6 6.6 17.4"/>',
      stopped: '<rect x="5.6" y="5.6" width="12.8" height="12.8" rx="2.4"/>',
      done: '<path d="M5 12.7 9.4 17 19 6.8"/>',
      warning: '<path d="M12 4.7 20.2 19H3.8z"/><path d="M12 10.1v3.4"/><path d="M12 16.3v.5"/>',
      // 思考中（原 💭 emoji）：云朵状思维气泡 + 三个实心点。
      // 与其它工具图标同一套 24×24 / stroke=currentColor / 1.8 / 圆头风格，
      // 但要把「这是思考」和「这是某个工具」在形状上区分开。
      thinking: '<path d="M8.3 16.5h7.6a3.6 3.6 0 0 0 .5-7.1 4.9 4.9 0 0 0-9.3-1 3.4 3.4 0 0 0 1.2 8.1Z"/><circle cx="9.5" cy="12.7" r=".9" fill="currentColor" stroke="none"/><circle cx="12.3" cy="12.7" r=".9" fill="currentColor" stroke="none"/><circle cx="15.1" cy="12.7" r=".9" fill="currentColor" stroke="none"/>',
      // ── 宿主唤醒消息卡（.chat-trigger-icon）用的 8 个 emoji ──
      // bundle 的 wt 表：agent-message 📨 / team-message 👥 / subagent-settled 🧩 /
      // webhook 🔔 / schedule ⏰ / tool-jobs ⚙️ / cordis-host-runner 🔌 / goal 🎯。
      // 用户要求聊天页不要出现 emoji，这里逐个换成同风格描边图标。
      inbox: '<path d="M3.6 7.6h16.8v8.8H3.6z"/><path d="m3.6 8.4 8.4 5.6 8.4-5.6"/>',
      people: '<circle cx="9" cy="9.2" r="2.6"/><path d="M4.4 18.4a4.6 4.6 0 0 1 9.2 0"/><circle cx="16.6" cy="10.4" r="2"/><path d="M14.9 18.4a4 4 0 0 1 5.1-3.2"/>',
      puzzle: '<path d="M9.6 4.6h2.1a1.7 1.7 0 0 1 0 3.4h-.4v2.9h2.9v-.4a1.7 1.7 0 0 1 3.4 0v2.1a2 2 0 0 1-2 2h-2.9v3.2a1.7 1.7 0 0 1-3.4 0v-1.6H6.9a2 2 0 0 1-2-2v-2.1a2 2 0 0 1 2-2h1.6V6.6a2 2 0 0 1 1.1-2Z"/>',
      bell: '<path d="M18 8.6a6 6 0 1 0-12 0c0 4.4-1.5 5.9-2 6.7-.3.5 0 1.2.7 1.2h14.6c.7 0 1-.7.7-1.2-.5-.8-2-2.3-2-6.7z"/><path d="M13.7 19.4a2 2 0 0 1-3.4 0"/>',
      clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7.4V12l3.2 1.9"/>',
      plug: '<path d="M9 3.6v4.1M15 3.6v4.1"/><path d="M7 7.7h10v2.1a5 5 0 0 1-10 0z"/><path d="M12 14.8v4.6"/>',
      target: '<circle cx="12" cy="12" r="7.6"/><circle cx="12" cy="12" r="3.4"/><circle cx="12" cy="12" r=".7" fill="currentColor" stroke="none"/>'
    };
    // [emoji 序列, 图标 key, 作用域 class]：只精确匹配这些序列（含 FE0F 变体选择器），
    // 不模糊匹配；作用域用祖先 class 限定，正文里同款 emoji（以及第二批才做的通知映射
    // 📨👥🧩🔔⏰⚙️🔌🎯）都不会被替换。
    var MAP = [
      // 工具步骤行（容器是 .chat-step-icon，bundle 里根本不存在 chat-tool-lead）：
      // search / read / bash / write|edit / code / 其它
      ['\\u{1F50D}', 'search', 'chat-step-icon'],
      ['\\u{1F4C2}', 'read', 'chat-step-icon'],
      ['\\u2699\\uFE0F', 'gear', 'chat-step-icon'],
      ['\\u2699', 'gear', 'chat-step-icon'],
      ['\\u270F\\uFE0F', 'pencil', 'chat-step-icon'],
      ['\\u270F', 'pencil', 'chat-step-icon'],
      ['\\u{1F4BB}', 'code', 'chat-step-icon'],
      ['\\u{1F527}', 'tool', 'chat-step-icon'],
      // 思考中的 💭：用户要求统一成 SVG，不要 emoji。
      // thinking 变体同时带 .chat-step-icon 与 .chat-step-icon-thinking 两个 class，
      // 所以作用域仍用 chat-step-icon 就能命中；气泡本身是工具行的图标位置。
      ['\\u{1F4AD}\\uFE0F', 'thinking', 'chat-step-icon'],
      ['\\u{1F4AD}', 'thinking', 'chat-step-icon'],
      // 宿主唤醒消息卡：📨👥🧩🔔⏰⚙️🔌🎯 全换成 SVG（作用域 .chat-trigger-icon）。
      ['\\u{1F4E8}', 'inbox', 'chat-trigger-icon'],
      ['\\u{1F465}', 'people', 'chat-trigger-icon'],
      ['\\u{1F9E9}', 'puzzle', 'chat-trigger-icon'],
      ['\\u{1F514}', 'bell', 'chat-trigger-icon'],
      ['\\u{23F0}', 'clock', 'chat-trigger-icon'],
      ['\\u2699\\uFE0F', 'gear', 'chat-trigger-icon'],
      ['\\u2699', 'gear', 'chat-trigger-icon'],
      ['\\u{1F50C}', 'plug', 'chat-trigger-icon'],
      ['\\u{1F3AF}', 'target', 'chat-trigger-icon'],
      // 过程卡状态符号：运行 / 失败 / 中断 / 完成
      ['\\u23F3', 'running', 'chat-proc-lead'],
      ['\\u274C', 'failed', 'chat-proc-lead'],
      ['\\u23F9\\uFE0F', 'stopped', 'chat-proc-lead'],
      ['\\u23F9', 'stopped', 'chat-proc-lead'],
      ['\\u2705', 'done', 'chat-proc-lead'],
      ['\\u2714\\uFE0F', 'done', 'chat-proc-lead'],
      ['\\u2714', 'done', 'chat-proc-lead'],
      // 报错计数「⚠ N 处报错」
      ['\\u26A0\\uFE0F', 'warning', 'chat-proc-errors'],
      ['\\u26A0', 'warning', 'chat-proc-errors'],
      // 思考块（.chat-step-icon-thinking / 💭）也统一换成了 thinking SVG，
      // 不再保留 emoji（鲸鱼尾仍在底部「输出中」状态行，见 CHAT_STATUS_HTML）。
    ];

    function makeIcon(key) {
      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'dm-icon dm-icon-' + key);
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', '1.8');
      svg.setAttribute('stroke-linecap', 'round');
      svg.setAttribute('stroke-linejoin', 'round');
      svg.setAttribute('aria-hidden', 'true');
      svg.innerHTML = ICONS[key];
      return svg;
    }

    // 向上找祖先：命中 scope class 才算在目标容器内（React 会把 class 挂在 span 上，
    // 容器自身也可能带多个 class，这里用 classList.contains 精确判断）。
    function inScope(node, scope) {
      var p = node.parentNode;
      var guard = 0;
      while (p && guard++ < 12) {
        if (p.classList && p.classList.contains(scope)) return true;
        var cls = p.getAttribute && p.getAttribute('class');
        if (typeof cls === 'string' && cls.split(/\s+/).indexOf(scope) >= 0) return true;
        p = p.parentNode;
      }
      return false;
    }

    // 单个文本节点：命中就建 slot（图标 + 隐藏原文）。残余文本由 installSlot
    // 自己递归扫完，所以这里命中一次即可结束。
    function scanNode(node) {
      var guard = 0;
      while (node && node.parentNode && guard++ < 60) {
        // React 改写过的 slot 内容：不新建结构，只更新图标。
        if (isSlot(node.parentNode) && refreshSlot(node)) return;
        var text = node.nodeValue || '';
        var seq = null;
        var key = null;
        var at = -1;
        var scope = null;
        for (var i = 0; i < MAP.length; i++) {
          var idx = text.indexOf(MAP[i][0]);
          if (idx < 0) continue;
          // 取最靠前的；同一位置取更长的序列（优先带 FE0F 的变体）。
          if (at < 0 || idx < at || (idx === at && MAP[i][0].length > (seq ? seq.length : 0))) {
            at = idx;
            seq = MAP[i][0];
            key = MAP[i][1];
            scope = MAP[i][2];
          }
        }
        if (seq && scope && !inScope(node, scope)) {
          // 命中了序列但不在目标容器里（正文/通知等）：跳过，别替换。
          seq = null;
          key = null;
        }
        if (!seq) return;
        installSlot(node, seq, key);
        return;
      }
    }

    // 防重入标记打在稳定的 slot 元素上（文本节点会被 splitText 切成新的，
    // 标记打在它身上会丢）—— slot 只建一次，之后每次重扫只是更新图标。
    function isSlot(node) {
      return !!(node && node.nodeType === 1 && node.dmEmojiSlot);
    }

    // 在 emoji 处建一个稳定的 slot 结构（只建一次）：
    //   <svg class="dm-icon dm-icon-done">                      ← 真正显示的图标
    //   <span class="dm-emoji-src" style="display:none">⏳</span> ← 原文搬进这里
    // 关键：只「搬」不「换」。emoji 文本节点被 appendChild 进 slot，实例始终
    // 留在文档里，React 以后 nodeValue 更新（⏳→✅）照旧生效。若像以前那样
    // replaceChild 摘掉它，React 就会去更新一个已脱离文档的孤儿节点：图标不再
    // 更新，且重渲染产出的新文本会被再替换一次，图标重复堆叠。
    // 文本里 emoji 两侧还有别的字符时，残余部分会被切回父级继续扫描。
    function installSlot(textNode, seq, key) {
      var parent = textNode.parentNode;
      if (!parent) return null;
      var at = (textNode.nodeValue || '').indexOf(seq);
      if (at < 0) return null;
      // 先把 emoji 精确切成一个单独的文本节点，两侧残余留在父级继续扫。
      var target = textNode;
      if (at > 0) target = textNode.splitText(at);
      var rest = target.splitText(seq.length);

      var slot = document.createElement('span');
      slot.className = 'dm-emoji-src';
      slot.setAttribute('aria-hidden', 'true');
      slot.dmEmojiSlot = 1;
      parent.insertBefore(slot, target);
      slot.appendChild(target); // 搬，不删：节点实例保持同一份
      slot.dmIconSeq = seq;
      syncIcon(slot, key);
      if (rest && rest.nodeValue) {
        // 残尾（emoji 后面的「5 处报错」之类）留在父级显示；打上归属标记，
        // 下次 React 把整段重写回来时要先清掉它，否则会出现重复的旧文本。
        rest.dmEmojiRest = 1;
        rest.dmEmojiOwner = slot;
        scanNode(rest);
      }
      return slot;
    }

    // 让 slot 前面的 svg 与当前 emoji 对应：已经是对的就不动，变了就换掉旧的，
    // 同一个 slot 永远只留一个图标（不会两个并存）。
    function syncIcon(slot, key) {
      if (!slot || !slot.parentNode) return;
      var want = key || '';
      if (slot.getAttribute('data-dm-icon') === want) return;
      var parent = slot.parentNode;
      // 摘掉挂在 slot 前面的旧图标（可能不止一个，保险起见循环清干净）。
      var prev = slot.previousSibling;
      while (prev && prev.nodeType === 1) {
        var cls = prev.getAttribute && prev.getAttribute('class');
        if (typeof cls !== 'string' || cls.indexOf('dm-icon') < 0) break;
        var dead = prev;
        prev = prev.previousSibling;
        parent.removeChild(dead);
      }
      if (want) parent.insertBefore(makeIcon(want), slot);
      slot.setAttribute('data-dm-icon', want);
    }

    // slot 里的 emoji 被 React 改写了（⏳→✅、🔧→🔍）：按新内容换图标。
    // 改型后可能不再精确等于原 seq，所以整段重新匹配一次。
    function refreshSlot(textNode) {
      var slot = textNode.parentNode;
      if (!slot || !slot.parentNode) return false;
      var text = textNode.nodeValue || '';
      var seq = null;
      var key = null;
      var scope = null;
      for (var i = 0; i < MAP.length; i++) {
        if (text.indexOf(MAP[i][0]) < 0) continue;
        if (seq === null || MAP[i][0].length > seq.length) {
          seq = MAP[i][0];
          key = MAP[i][1];
          scope = MAP[i][2];
        }
      }
      // 整段正好是某个 emoji：直接换图标（最常见：⏳→✅、🔧→🔍）。
      if (seq !== null && seq === text) {
        slot.dmIconSeq = seq;
        syncIcon(slot, (!scope || inScope(textNode, scope)) ? key : '');
        return true;
      }
      // React 把整行（含残尾）重写进这个节点了：清掉上一次切出去的残尾，
      // 否则旧文本会留在 DOM 里，读出来变成「⚠ 5 处报错 3 处报错」。
      var parent0 = slot.parentNode;
      if (parent0) {
        var restSnapshot = parent0.childNodes ? Array.prototype.slice.call(parent0.childNodes) : [];
        for (var k = 0; k < restSnapshot.length; k++) {
          var sib = restSnapshot[k];
          if (sib && sib.dmEmojiRest && sib.dmEmojiOwner === slot && sib.parentNode) {
            sib.parentNode.removeChild(sib);
          }
        }
      }
      // emoji 没了，或夹进了别的内容：拆掉 slot，把文本还给父级重新扫一遍。
      var parent = slot.parentNode;
      var held = textNode;
      slot.removeChild(held);
      parent.insertBefore(held, slot);
      parent.removeChild(slot);
      // 顺手清掉散落在它前面的孤立图标，避免留下无主 svg。
      var prev = held.previousSibling;
      while (prev && prev.nodeType === 1) {
        var cls = prev.getAttribute && prev.getAttribute('class');
        if (typeof cls !== 'string' || cls.indexOf('dm-icon') < 0) break;
        var dead = prev;
        prev = prev.previousSibling;
        parent.removeChild(dead);
      }
      scanNode(held);
      return true;
    }

    function skip(node) {
      var p = node.parentNode;
      if (!p || !p.nodeName) return true;
      var n = p.nodeName;
      return n === 'SCRIPT' || n === 'STYLE' || n === 'NOSCRIPT' || n === 'TEXTAREA';
    }

    // 全程可重入：slot 已存在时 scanNode 只是刷新图标、不再新建结构，所以
    // 每次 flush 走一遍全树也不会重复堆叠。防重入标记打在 slot 元素上
    // （dmEmojiSlot），文本节点上不再打标记 —— 它会被 splitText 切成新实例。
    function walk(root) {
      if (!root) return;
      if (root.nodeType === 3) {
        if (!skip(root)) scanNode(root);
        return;
      }
      if (root.nodeType !== 1) return;
      var tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
      var n = tw.nextNode();
      while (n) {
        var next = tw.nextNode();
        if (!skip(n)) scanNode(n);
        n = next;
      }
    }

    var queued = false;
    function flush() {
      queued = false;
      try {
        walk(document.body);
      } catch (e) {}
    }
    function schedule() {
      if (queued) return;
      queued = true;
      if (window.requestAnimationFrame) window.requestAnimationFrame(flush);
      else window.setTimeout(flush, 0);
    }

    var mo = new MutationObserver(function (records) {
      // 文本节点不再打标记（会被 splitText 切掉）；槽位状态存在 slot 元素上，
      // 这里只负责触发一次 flush。
      schedule();
    });
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });
    schedule();
  } catch (e) {}
})();
</script>`

// 轮次药丸（.chat-jump-turns）改造：
//  1) 中间分隔线：把 label 里的 "/" 文本换成一条短横线（.dm-turn-sep），
//     两个数字分别包进 .dm-turn-cur / .dm-turn-total —— 配合 theme.css 的
//     flex 纵向堆叠，读起来就是「当前在上、横线、总数在下」。
//  2) 关掉长按刮擦：document 捕获阶段对该按钮的 pointerdown/move/up/
//     cancel/lostpointercapture 调 stopImmediatePropagation，React 的监听
//     挂在 #root 上（document 是祖先，捕获阶段先到），bundle 的
//     wr/Tr/Er/Dr 完全收不到事件，刮擦层再也不会出现。
//  3) 点击 = 打开清单：打开清单的 setState（dn）在 bundle 模块闭包里，
//     外部调不到；bundle 的 onClick 只在 e.detail===0（键盘触发）时才
//     dn(!0)，真实点击 detail>0 不走那条分支。所以吞掉真实点击，补发一个
//     detail:0 的合成 click —— React 的 onClick 看到 detail 0 就照原逻辑
//     打开轮次清单。（不用「合成 pointerdown/up」：合成的 pointerId 不是活动
//     指针，wr 里的 setPointerCapture 会抛 NotFoundError。）
//     全程 try/catch，失败只退化为「单击无反应」，不会报错、也不会恢复刮擦。
const TURN_PILL_HTML = `<script>
(function () {
  var PILL = '.chat-jump-turns';
  var LABEL = '.chat-jump-turns-label';
  var SEP = 'dm-turn-sep';
  var BLOCKED = ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'lostpointercapture'];

  function closest(node, sel) {
    return node && node.closest ? node.closest(sel) : null;
  }

  // ── 1) 中间分隔线：把 "/" 换成一条短横线 ─────────────────────────────
  // 关键：只「搬」不「换」。bundle 渲染 [当前轮, "/", 总轮] 三个文本节点，
  // 这里把每个文本节点 appendChild 进自建的 span —— 文本节点实例始终不变，
  // React 以后改数字（commitTextUpdate: node.nodeValue = …）照旧生效。
  // 如果改写成「删掉原节点、插入新节点」，React 会去更新一个已脱离文档的
  // 节点，数字就再也不变了。
  function decorate(label) {
    if (!label) return false;
    var texts = [];
    for (var i = 0; i < label.childNodes.length; i++) {
      if (label.childNodes[i].nodeType === 3) texts.push(label.childNodes[i]);
    }
    // 已处理过，且 React 没有往 label 下再挂新的裸文本节点：保持原样（幂等）。
    // 若 React 重建了子节点（换会话等），下面会重新包裹一次。
    if (label.querySelector('.' + SEP) && texts.length === 0) return true;
    if (texts.length < 3 && !label.querySelector('.' + SEP)) return false;

    var curSpan = document.createElement('span');
    curSpan.className = 'dm-turn-cur';
    var totalSpan = document.createElement('span');
    totalSpan.className = 'dm-turn-total';
    var sepSpan = document.createElement('span');
    sepSpan.className = SEP;
    sepSpan.setAttribute('aria-hidden', 'true');
    var slashSpan = document.createElement('span');
    slashSpan.className = 'dm-turn-slash'; // theme.css: display:none
    slashSpan.setAttribute('aria-hidden', 'true');

    curSpan.appendChild(texts[0]);
    slashSpan.appendChild(texts[1]);
    totalSpan.appendChild(texts[texts.length - 1]);

    var frag = document.createDocumentFragment();
    frag.appendChild(curSpan);
    frag.appendChild(sepSpan);
    frag.appendChild(totalSpan);
    frag.appendChild(slashSpan);
    while (label.firstChild) label.removeChild(label.firstChild);
    label.appendChild(frag);
    return true;
  }

  function scan() {
    try {
      var labels = document.querySelectorAll(LABEL);
      for (var i = 0; i < labels.length; i++) decorate(labels[i]);
      var pills = document.querySelectorAll(PILL);
      for (var k = 0; k < pills.length; k++) {
        var p = pills[k];
        if (!p.getAttribute('title')) p.setAttribute('title', '点按查看轮次清单');
      }
    } catch (e) {}
  }

  // ── 2) 关掉长按刮擦 ─────────────────────────────────────────────────
  // 只掐事件传播、不 preventDefault：焦点与页面滚动照旧。
  for (var b = 0; b < BLOCKED.length; b++) {
    document.addEventListener(BLOCKED[b], function (event) {
      var pill = closest(event.target, PILL);
      if (!pill) return;
      if (pill.getAttribute('data-dm-bypass') === '1') return; // 放行一轮
      event.stopImmediatePropagation();
    }, true);
  }

  // ── 3) 单击 = 打开轮次清单 ──────────────────────────────────────────
  document.addEventListener('click', function (event) {
    var pill = closest(event.target, PILL);
    if (!pill) return;
    if (pill.getAttribute('data-dm-bypass') === '1') {
      pill.removeAttribute('data-dm-bypass');
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    // 降级：构造不出 MouseEvent 就什么都不做 —— 单击无反应，但刮擦已禁用。
    if (typeof window.MouseEvent !== 'function') return;
    try {
      pill.setAttribute('data-dm-bypass', '1');
      pill.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: 0,
        view: window,
        button: 0,
        buttons: 0
      }));
    } catch (e) {
      try { pill.removeAttribute('data-dm-bypass'); } catch (e2) {}
    }
  }, true);

  // ── 药丸出现 / 换会话重建后重新处理（decorate 幂等，不会重入）────────
  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    window.setTimeout(function () { pending = false; scan(); }, 60);
  }
  try {
    var mo = new MutationObserver(schedule);
    mo.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true
    });
  } catch (e) {}
  setInterval(scan, 400);
  scan();
})();
</script>`


// 顶栏「子代理」入口：只在聊天页（顶栏右侧含 aria-label="更多" 的按钮）的
// 「更多」按钮之前插一个自绘图标；点击弹出自绘面板（列表 → 聊天内容两个视图）。
// 面板自己走 /m/api/subagent.list 与 /m/api/session.history 两个 RPC，
// 不碰 bundle 的路由／导航栈，也不改它的 React 树（按钮是同层兄弟节点）。
const SUBAGENT_BTN_HTML = `<button id="dm-subagent-btn" class="mobile-iconbtn" type="button" aria-label="子代理" title="子代理任务"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5.5" r="2.6"/><circle cx="5" cy="17" r="2.6"/><circle cx="19" cy="17" r="2.6"/><path d="M12 8.1V14M12 14H6.8M12 14h5.2"/></svg></button><script>
(function () {
  var btn = document.getElementById('dm-subagent-btn');
  if (!btn) return;

  var REFRESH_MS = 8000;    // 面板打开时的轮询间隔
  var BG_REFRESH_MS = 8000; // 后台预取间隔（与面板轮询一致）
  var panel = null;      // 遮罩节点（.dm-subagent-backdrop）
  var timer = null;      // 面板打开时的列表/聊天轮询
  var bgTimer = null;    // 后台预取轮询（与面板是否打开无关）
  var view = 'list';     // 'list' | 'chat'
  var chatSid = '';
  var lastSessionId = '';

  // ── 预取缓存 ────────────────────────────────────────────────────────────
  // 之前是「点开面板 → 才发 subagent.list → 等响应才渲染」，首屏必然空一段。
  // 现在改成进聊天页就后台预取并缓存（按会话 id 存），点开面板先用缓存立即渲染。
  //
  // 缓存三态必须分清，否则会把「还没拉到」误报成「确实没有」：
  //   CACHE_SID === '' 或 cacheRows === null → 还没拉成功过（渲染「加载中…」）
  //   cacheRows.length === 0                → 拉成功且确实为空（渲染「当前没有子代理」）
  //   cacheRows.length > 0                  → 有数据（渲染列表）
  var CACHE_SID = '';
  var cacheRows = null;     // null = 未知；数组 = 已知（可能为空数组）
  var cacheFetchedAt = 0;
  var inflight = null;      // 正在飞的请求，调用点共享，避免重复打 RPC
  var inflightSid = '';
  var bgSid = '';           // 后台预取当前服务的会话 id
  var lastFailAt = 0;       // 上次请求失败的时间（按会话区分），用于退避
  var lastFailSid = '';
  var RETRY_GAP_MS = 1500;

  // 与 MODEL_BUTTON_HTML 同一手法：拦截 fetch 记住当前会话 id。
  var origFetch = window.fetch;
  if (typeof origFetch === 'function') {
    window.fetch = function (input, init) {
      try {
        var url = typeof input === 'string' ? input : (input && input.url) || '';
        if (url.indexOf('/m/api/') >= 0 && init && typeof init.body === 'string') {
          var body = JSON.parse(init.body);
          if (body && body.payload && typeof body.payload.sessionId === 'string' && body.payload.sessionId) {
            lastSessionId = body.payload.sessionId;
          }
        }
      } catch (e) {}
      return origFetch.apply(this, arguments);
    };
  }

  function currentSession() {
    try {
      var s = new URL(location.href).searchParams.get('session');
      if (s) return s;
    } catch (e) {}
    return lastSessionId;
  }

  function rpc(method, payload) {
    return fetch('/m/api/' + method, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rpcId: 'dm-sub-' + Date.now(), payload: payload })
    }).then(function (r) { return r.json(); }).then(function (j) { return j ? j.result : null; });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function excerpt(s, n) {
    var t = String(s == null ? '' : s).replace(/\\s+/g, ' ').trim();
    return t.length > n ? t.slice(0, n) + '…' : t;
  }
  // 事件里的文本内容：content 数组（[{type:'text',text}]）或裸字符串都收下。
  function textOf(content) {
    if (typeof content === 'string') return content;
    if (!Array.isArray(content)) return '';
    var out = [];
    for (var i = 0; i < content.length; i++) {
      var p = content[i];
      if (typeof p === 'string') out.push(p);
      else if (p && p.type === 'text' && typeof p.text === 'string') out.push(p.text);
    }
    return out.join(' ').trim();
  }

  // 只取推理块：子代理的某些步骤 only-reasoning（没有 text 块），
  // 面板里如果只认 text 就会显示「(无文本)」，等于把过程信息丢了。
  function reasoningOf(content) {
    if (!Array.isArray(content)) return '';
    var out = [];
    for (var i = 0; i < content.length; i++) {
      var p = content[i];
      if (!p || p.type !== 'reasoning') continue;
      out.push(String(p.text || ''));
    }
    return out.join('');
  }


  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  // ── 列表读取：统一走这里，命中缓存就同步返回 ──────────────────────────
  // 返回 null 表示「这份缓存不属于当前会话」；返回数组表示已知结果（可能为空）。
  function cachedRows(sid) {
    if (!sid || CACHE_SID !== sid) return null;
    return cacheRows;
  }

  // 会话切换：缓存作废（同一会话内不清，避免刷新时闪一下「加载中」）。
  function invalidateCache(sid) {
    if (CACHE_SID !== '' && CACHE_SID !== sid) {
      CACHE_SID = '';
      cacheRows = null;
      cacheFetchedAt = 0;
    }
  }

  // 与旧版 renderList 的过滤口径一致：只留 kind==='child'。
  //
  // 但**字段要收全**：宿主 listDescendants 每行实际返回
  //   { id, label, mode:'one-shot'|'continuable'|'external', activity:'running'|'inactive',
  //     kind:'child'|'diagnostic', parentId, depth, hasChildren }
  //（已核宿主源码：spread identity, kind:"child", parentId, depth, activity, hasChildren:children.length>0）。
  // 旧版只取 id/label/activity 三个，mode/depth/hasChildren/parentId 全丢 —— 数据本来就有，
  // 是这里没往外面带。面板据此渲染类型、层级、是否有子级。
  //
  // 各字段都做了类型收敛（缺字段、类型不对一律落默认值），
  // 保证「宿主少给字段」时面板照常画，不会因为 undefined 拼出 "undefined" 字样。
  function rowsOf(res) {
    var entries = (res && res.ok && res.value && Array.isArray(res.value.entries)) ? res.value.entries : [];
    var rows = [];
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (!e || e.kind !== 'child') continue;
      rows.push({
        id: String(e.id || ''),
        label: typeof e.label === 'string' ? e.label : '',
        activity: typeof e.activity === 'string' ? e.activity : '',
        // mode 决定「一次性 / 可继续 / 外部」，未知就存 'unknown'（下面渲染成「—」）。
        mode: (e.mode === 'one-shot' || e.mode === 'continuable' || e.mode === 'external') ? e.mode : 'unknown',
        // depth：宿主给的是数字层级（根的直接子级为 0）。非法值一律当第 1 层。
        depth: (typeof e.depth === 'number' && isFinite(e.depth) && e.depth >= 0) ? Math.floor(e.depth) : 0,
        hasChildren: e.hasChildren === true,
        parentId: typeof e.parentId === 'string' ? e.parentId : '',
      });
    }
    return rows;
  }

  // 类型 → 中文标签（手机屏幕窄，用短词）。
  var MODE_LABEL = { 'one-shot': '一次性', 'continuable': '可继续', 'external': '外部', 'unknown': '未知' };
  function modeLabel(m) {
    return MODE_LABEL[m] || '未知';
  }

  // 发一次真实请求。同一会话的并发调用共用一个 promise（去重）。
  // 限流只在「同一个会话上一次请求刚失败」时生效，避免被 interval 密集重放；
  // 不能对所有请求一刀切，否则切会话后的首次预取会被上一次的时间戳挡掉。
  function fetchList(sid) {
    if (!sid) return null;
    if (inflight && inflightSid === sid) return inflight;
    var now = Date.now();
    if (lastFailSid === sid && now - lastFailAt < RETRY_GAP_MS) return null;
    inflightSid = sid;
    var committed = false;
    inflight = rpc('subagent.list', { parentSessionId: sid }).then(function (res) {
      if (inflightSid === sid) {
        var rows = rowsOf(res);
        CACHE_SID = sid;
        cacheRows = rows;
        cacheFetchedAt = Date.now();
        committed = true;
        return rows;
      }
      return null;
    }).catch(function () {
      if (inflightSid === sid && !committed) {
        lastFailSid = sid;
        lastFailAt = Date.now();
      }
      return null;   // 失败不许出弹窗；缓存保持原样，下次轮询自然会再试
    }).then(function (rows) {
      inflight = null;
      // 后台刷新也要让面板跟着变（不只是点开那一次）：
      // 每次「真实发生请求且写入缓存」后同步一次，内容没变 paintList 会自己不动 DOM。
      if (committed) syncPanel(sid);
      return rows;
    });
    return inflight;
  }

  // 后台预取：拿到会话就拉一次，之后由 bgTimer 低频刷新。整段 try/catch，
  // 请求失败静默。这里必须每次都真发请求（同一会话的并发由 fetchList 去重），
  // 否则「拉过一次就不再拉」，缓存会一直停在旧数据上。
  // 仅当缓存刚刚写入（<1s，比如刚被点开面板那次请求刷新过）时跳过，避免连发。
  function tickPrefetch() {
    try {
      var sid = currentSession();
      invalidateCache(sid);
      bgSid = sid;
      if (!sid) return;
      if (cachedRows(sid) !== null && Date.now() - cacheFetchedAt < 1000) return;
      fetchList(sid);
    } catch (e) {}
  }

  // 缓存更新后，若面板正停留在列表视图，就把最新内容同步上去。
  // paintList 内部有 diff：内容没变就不动 DOM，所以不会闪。
  function syncPanel(sid) {
    try {
      if (!panel || view !== 'list') return;
      if (!panel.back.classList.contains('dm-subagent-open')) return;
      if (currentSession() !== sid) return;
      var rows = cachedRows(sid);
      if (rows !== null) paintList(rows);
    } catch (e) {}
  }

  // 幂等：ensure() 每 400ms 跑一次，若这里无条件 stop/start，8s 的后台计时器
  // 会被反复重置、永远走不到刷新。所以只在「没起」或「会话变了」时才重启，
  // 顺带也就完成了「切会话 → 缓存失效 → 重新预取」。
  function startBg() {
    var sid = currentSession();
    try {
      invalidateCache(sid);
    } catch (e) {}
    if (bgTimer !== null && bgSid === sid) return;   // 已在为这个会话预取
    stopBg();
    bgSid = sid;
    tickPrefetch();
    bgTimer = window.setInterval(function () {
      try {
        // 页面不可见时不必浪费请求；下一次 tick 会补上。
        if (document.visibilityState && document.visibilityState !== 'visible') return;
        tickPrefetch();
      } catch (e) {}
    }, BG_REFRESH_MS);
  }
  function stopBg() {
    if (bgTimer !== null) { window.clearInterval(bgTimer); bgTimer = null; }
    bgSid = '';
  }

  // ── 面板骨架：一次性建好，之后只换 body 内容 ─────────────────────────
  function build() {
    var back = el('div', 'dm-subagent-backdrop');
    var sheet = el('div', 'dm-subagent-sheet');
    var head = el('div', 'dm-subagent-head');
    var back2 = el('button', 'dm-subagent-back', '← 返回列表');
    back2.type = 'button';
    var title = el('div', 'dm-subagent-title', '子代理');
    var close = el('button', 'dm-subagent-close', '✕');
    close.type = 'button';
    close.setAttribute('aria-label', '关闭');
    head.appendChild(back2);
    head.appendChild(title);
    head.appendChild(close);
    var body = el('div', 'dm-subagent-body');
    sheet.appendChild(head);
    sheet.appendChild(body);
    back.appendChild(sheet);
    document.body.appendChild(back);

    back.addEventListener('click', function (e) {
      if (e.target !== back) return;   // 点面板内部不关
      closePanel();
    });
    close.addEventListener('click', function (e) { e.preventDefault(); closePanel(); });
    back2.addEventListener('click', function (e) {
      e.preventDefault();
      if (view !== 'list') { view = 'list'; chatSid = ''; renderList(true); }
    });

    panel = { back: back, sheet: sheet, head: head, title: title, back2: back2, body: body };
    return panel;
  }

  function openPanel() {
    if (!panel) build();
    panel.back.classList.add('dm-subagent-open');
    if (view !== 'list') { view = 'list'; chatSid = ''; }
    renderList(true);
    startTimer();
  }

  // 收起动画：先挂 .dm-closing 让 CSS 反向播放（面板下滑 + 背景淡出），
  // 动画结束后才真正移除 .dm-subagent-open。用 data 标记防止重复触发。
  function closePanel() {
    stopTimer();
    if (!panel) return;
    var back = panel.back;
    if (!back.classList.contains('dm-subagent-open')) return;
    if (back.getAttribute('data-dm-closing') === '1') return;
    back.setAttribute('data-dm-closing', '1');
    back.classList.add('dm-closing');
    var sheet = back.querySelector('.dm-subagent-sheet');
    if (sheet) sheet.classList.add('dm-closing');
    window.setTimeout(function () {
      back.classList.remove('dm-subagent-open');
      back.classList.remove('dm-closing');
      back.removeAttribute('data-dm-closing');
      if (sheet) sheet.classList.remove('dm-closing');
    }, 200);
  }

  function startTimer() {
    stopTimer();
    timer = window.setInterval(function () {
      if (document.visibilityState && document.visibilityState !== 'visible') return;
      if (view === 'list') renderList(false);
      else renderChat();
    }, REFRESH_MS);
  }
  function stopTimer() {
    if (timer !== null) { window.clearInterval(timer); timer = null; }
  }

  // ── 列表视图 ──────────────────────────────────────────────────────────
  // 点开面板时：先用缓存同步渲染（0 延迟），再后台发一次请求按返回刷新。
  // 缓存里没有当前会话的数据时，才显示「加载中…」。
  function renderList(showLoading) {
    if (!panel) return;
    view = 'list';
    panel.back2.classList.remove('dm-subagent-show');

    var sid = currentSession();
    if (!sid) {
      panel.title.textContent = '子代理';
      writeBody('<p class="dm-subagent-hint">未识别到当前会话</p>');
      return;
    }

    var known = cachedRows(sid);
    if (known !== null) {
      // 有缓存：立刻画出来，不等网络。
      paintList(known);
    } else {
      panel.title.textContent = '子代理';
      writeBody('<p class="dm-subagent-hint dm-subagent-loading">加载中…</p>');
    }

    // 无论有没有缓存都再取一次新鲜数据：返回后 paintList 只在真的变了才动 DOM，
    // 所以点开面板既不会空白，也不会因为刷新而闪烁。
    var p = fetchList(sid);
    if (!p) return;
    p.then(function (rows) {
      if (!panel || view !== 'list') return;
      if (!rows) return;              // 请求失败：保留原样，下次轮询再试
      if (currentSession() !== sid) return;  // 期间切了会话：丢弃这次结果
      paintList(rows);
    }).catch(function () {});
  }

  // ── 排序：运行中（running）排最前，其余（空闲）跟在后面 ──────────────
  // 只在渲染前排，不碰 rowsOf／预取缓存／三态逻辑，也不改宿主 subagent.list 数据。
  //
  // 稳定性（关键）：同组内保持原始相对顺序。这里用「原下标做次级键」的显式稳定
  // 排序，不依赖引擎 Array#sort 是否稳定；于是「同一份数据 → 每次都得到完全相同
  // 的行序列 → 完全相同的 HTML 字符串」，setBody 的 data-dm-html 整段 diff 就不会
  // 每次刷新都判定为「变了」而重画 DOM（列表不会乱跳／闪烁）。
  //
  // 健壮性：activity 缺失、不是字符串、不是 'running' 一律当作空闲（rank=1），不抛错。
  function sortRowsRunningFirst(rows) {
    try {
      if (!Array.isArray(rows)) return [];
      if (rows.length < 2) return rows.slice();
      var decorated = [];
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i] || {};
        var act = (r && typeof r.activity === 'string') ? r.activity : '';
        decorated.push({ row: r, rank: act === 'running' ? 0 : 1, idx: i });
      }
      decorated.sort(function (a, b) {
        if (a.rank !== b.rank) return a.rank - b.rank;   // running(0) 先于 其它(1)
        return a.idx - b.idx;                            // 同组内保持原顺序
      });
      var out = [];
      for (var k = 0; k < decorated.length; k++) out.push(decorated[k].row);
      return out;
    } catch (e) {
      return Array.isArray(rows) ? rows.slice() : [];
    }
  }

  // 把一组 rows 画进面板。与上一屏内容一致就整段不动 DOM（避免闪烁／丢焦点）。
  function paintList(rowsIn) {
    if (!panel) return;
    view = 'list';
    panel.back2.classList.remove('dm-subagent-show');

    // 渲染前排序；返回的是新数组，不会就地打乱传入的缓存数组。
    var rows = sortRowsRunningFirst(rowsIn);

    // 标题：总数保持不变；有运行中的再补一个「N 个运行中」。
    // 标题走 textContent，不参与 body 的 data-dm-html diff，所以不影响防抖机制。
    var runCount = 0;
    for (var n = 0; n < rows.length; n++) {
      if (rows[n] && rows[n].activity === 'running') runCount++;
    }
    panel.title.textContent = '子代理 · ' + rows.length + ' 个' +
      (runCount > 0 ? ' · ' + runCount + ' 个运行中' : '');

    if (rows.length === 0) {
      setBody('<p class="dm-subagent-hint">当前没有子代理</p>');
      return;
    }

    var html = '';
    for (var k = 0; k < rows.length; k++) {
      var r = rows[k];
      var running = r.activity === 'running';
      // 层级：缩进 + 「第 N 层」文字。缩进按 depth 递增（最多 3 级，避免窄屏挤没字），
      // 文字版给读屏与看不清缩进的场景兜底。
      var dep = (typeof r.depth === 'number' && r.depth > 0) ? r.depth : 0;
      var indent = dep > 3 ? 3 : dep;
      // 有子级：一个「有下级」标记（不展开，只是提示这行下面还有挂载的子代理）。
      var kids = r.hasChildren ? '<span class="dm-subagent-kids" title="有下级">有下级</span>' : '';
      html +=
        '<button type="button" class="dm-subagent-row" data-sid="' + esc(r.id) + '"' +
          ' data-depth="' + dep + '" data-mode="' + esc(r.mode || 'unknown') + '">' +
          '<span class="dm-subagent-indent' + (indent > 0 ? ' dm-subagent-indent-' + indent : '') + '"></span>' +
          '<span class="dm-subagent-dot' + (running ? ' dm-subagent-dot-run' : '') + '"></span>' +
          '<span class="dm-subagent-main">' +
            '<span class="dm-subagent-label">' + esc(r.label || r.id.slice(0, 8)) + '</span>' +
            '<span class="dm-subagent-sub">' +
              // 状态文案（运行中 / 空闲）—— 面板的主信息，必须一直显示。
              '<span class="dm-subagent-state' + (running ? ' dm-subagent-state-run' : '') + '">' +
                (running ? '运行中' : '空闲') + '</span>' +
              '<span class="dm-subagent-mode">' + esc(modeLabel(r.mode)) + '</span>' +
              '<span class="dm-subagent-depth">第 ' + (dep + 1) + ' 层</span>' +
              kids +
            '</span>' +
          '</span>' +
          '<span class="dm-subagent-chev">›</span>' +
        '</button>';
    }
    setBody(html);
  }

  // 内容没变就不碰 innerHTML —— 这是「刷新不闪烁」的关键。
  // 标记始终跟随真实内容：任何直接写入也走 writeBody，标记就不会指向旧内容，
  // 列表 ↔ 聊天视图来回切时也才不会误判成「没变」而漏画。
  function writeBody(html) {
    if (!panel) return;
    panel.body.setAttribute('data-dm-html', html);
    panel.body.innerHTML = html;
  }
  function setBody(html) {
    if (!panel) return;
    if (panel.body.getAttribute('data-dm-html') === html) return;
    writeBody(html);
  }

  // 聊天内容视图的行 HTML（原来用 DOM fragment 拼，改为字符串才能参与 diff）。
  function fragHtml(items) {
    var html = '';
    for (var k = 0; k < items.length; k++) {
      var it = items[k];
      var icon = it.role === 'user' ? '我' : (it.role === 'assistant' ? 'AI' : '⚙');
      html +=
        '<div class="dm-subagent-msg dm-subagent-msg-' + it.role + '">' +
          '<span class="dm-subagent-who">' + icon + '</span>' +
          '<span class="dm-subagent-text">' + esc(it.text || '(无文本)') + '</span>' +
        '</div>';
    }
    return html;
  }

  // ── 聊天内容视图 ──────────────────────────────────────────────────────
  function renderChat() {
    if (!panel) return;
    view = 'chat';
    panel.back2.classList.add('dm-subagent-show');
    panel.title.textContent = '子代理 · ' + chatSid.slice(0, 8);
    writeBody('<p class="dm-subagent-hint dm-subagent-loading">加载中…</p>');

    // 带上 parentSessionId：宿主读子代理会话必须走 durable 父地址
    //（{kind:'subagent'}），父 id 由列表视图所在的当前会话直接给出。
    //
    // subscribe=true：告诉服务端「这台设备开始看这个子代理会话」，由它 ensureFollow()
    // 起宿主流 → 之后子代理的增量随 SSE 到达（边跑边显示）。
    // 这里必须**先登记订阅再拉历史**，否则订阅晚于历史请求时，
    // 落在两者之间的增量就没有人推，会永久丢字。
    rpc('session.history', {
      sessionId: chatSid,
      maxMessages: 50,
      parentSessionId: currentSession(),
      subscribe: true,
    }).then(function (res) {
      if (!panel || view !== 'chat') return;
      var ok = !!(res && res.ok && res.value);
      var events = ok && Array.isArray(res.value.events) ? res.value.events : [];
      var items = [];
      for (var i = 0; i < events.length; i++) {
        var ev = events[i] && events[i].event;
        if (!ev || typeof ev.type !== 'string') continue;
        var data = (ev.data && typeof ev.data === 'object') ? ev.data : {};
        if (ev.type === 'user/message') {
          items.push({ role: 'user', text: excerpt(textOf(data.content), 120) });
        } else if (ev.type === 'assistant/message') {
          var m = (data.message && typeof data.message === 'object') ? data.message : data;
          // 先取正文；没有正文的步骤（只产出了推理）用 reasoning 兜底，
          // 否则整行只剩「(无文本)」，过程信息等于没显示。
          var body = textOf(m.content);
          if (!body) body = reasoningOf(m.content);
          items.push({ role: 'assistant', text: excerpt(body, 220) });
        } else if (ev.type === 'tool/call') {
          // 工具行带上参数摘要：只显示工具名的话，用户看不出这一步到底在干什么。
          var toolName = String(data.name || '工具');
          var argText = '';
          try {
            var rawArgs = data.arguments;
            var parsed = typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs;
            if (parsed && typeof parsed === 'object') {
              var keys = Object.keys(parsed).slice(0, 2);
              argText = keys.map(function (k) {
                var v = parsed[k];
                var str = typeof v === 'string' ? v : JSON.stringify(v);
                return k + '=' + String(str == null ? '' : str).replace(/\s+/g, ' ').slice(0, 60);
              }).join(' ');
            }
          } catch (e) {}
          items.push({ role: 'tool', text: toolName + (argText ? ' · ' + argText : '') });
        }
      }
      if (items.length === 0) {
        writeBody('<p class="dm-subagent-hint">无法加载该子代理的会话内容</p>');
        return;
      }
      writeBody(fragHtml(items));
    }).catch(function () {
      if (!panel || view !== 'chat') return;
      writeBody('<p class="dm-subagent-hint">无法加载该子代理的会话内容</p>');
    });
  }

  // 行点击：取 data-sid，切成聊天内容视图。
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var row = t.closest('.dm-subagent-row');
    if (!row) return;
    var sid = row.getAttribute('data-sid');
    if (!sid) return;
    e.preventDefault();
    chatSid = sid;
    renderChat();
  });

  btn.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (panel && panel.back.classList.contains('dm-subagent-open')) closePanel();
    else openPanel();
  });

  // ── 只在聊天页显示：顶栏右侧含 aria-label="更多" 的按钮即认定为聊天页 ──
  function slot() {
    var slots = document.querySelectorAll('.mobile-headerSlot-right');
    for (var i = 0; i < slots.length; i++) {
      var s = slots[i];
      // 聊天页特征：右侧槽里有一个「更多」按钮。
      var more = s.querySelector('button[aria-label="更多"]');
      if (more) return { slot: s, more: more };
    }
    return null;
  }

  function ensure() {
    var found = slot();
    if (!found) {
      // 不在聊天页（或顶栏暂未渲染）：把按钮摘下来，避免出现在别的页面。
      if (btn.parentNode) btn.parentNode.removeChild(btn);
      // 离开聊天页就关面板并停掉所有轮询，别在后台白打请求。
      if (panel && panel.back.classList.contains('dm-subagent-open')) closePanel();
      stopBg();
      return;
    }
    if (btn.parentNode !== found.slot) found.slot.insertBefore(btn, found.more);
    else if (btn.nextSibling !== found.more) found.slot.insertBefore(btn, found.more);
    // 进聊天页：起后台预取（内部自带会话失效判断，重复调用安全）。
    startBg();
  }

  // ── 对外暴露一个只读快照 + 开面板的入口 ────────────────────────────────
  // 工具行里的「子代理状态」图标（SUBAGENT_STATUS_BTN_HTML）要显示运行中数量、
  // 点击要打开本面板。它在本脚本之后执行、且是另一个闭包，唯一不新增轮询、
  // 又不重画面板的办法就是复用这里的预取缓存与 openPanel：这里挂一个 hub，
  // 状态图标只读快照（纯内存，不发 RPC），点击调 openPanel。
  try {
    window.__dmSubagentHub = {
      // { sid, known:boolean, total:number, running:number }
      // known=false 表示「还没拉到当前会话的数据」，图标据此保持隐藏。
      snapshot: function () {
        try {
          var sid = currentSession();
          var rows = cachedRows(sid);
          if (rows === null) return { sid: sid, known: false, total: 0, running: 0 };
          var running = 0;
          for (var i = 0; i < rows.length; i++) {
            if (rows[i] && rows[i].activity === 'running') running++;
          }
          return { sid: sid, known: true, total: rows.length, running: running };
        } catch (e) {
          return { sid: '', known: false, total: 0, running: 0 };
        }
      },
      openPanel: function () { try { openPanel(); } catch (e) {} },
    };
  } catch (e) {}

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    window.setTimeout(function () { pending = false; ensure(); }, 60);
  }
  try {
    var mo = new MutationObserver(schedule);
    mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
  } catch (e) {}
  setInterval(ensure, 400);
  ensure();
})();
</script>`

// 工具行右侧「审批提醒」图标：有待处理的审批 / 提问时亮起并带数字角标，点开
// 自绘浮层重新列出它们（可反复开关 —— 用户「不小心关掉」的那张卡片就是从这里
// 再打开的），并可在浮层内直接允许 / 拒绝。
//
// 数据全部走已有 RPC：mobile.pending（列举）/ mobile.respond（应答），
// 与 bundle 的审批卡片同源同权限，不新增任何服务端接口。
const APPROVAL_BTN_HTML = `<button id="dm-approval-btn" class="dm-tool-btn" type="button" aria-label="审批提醒" title="审批提醒"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8.6a6 6 0 1 0-12 0c0 4.4-1.5 5.9-2 6.7-.3.5 0 1.2.7 1.2h14.6c.7 0 1-.7.7-1.2-.5-.8-2-2.3-2-6.7z"/><path d="M13.7 19.4a2 2 0 0 1-3.4 0"/></svg><span id="dm-approval-badge" class="dm-icon-badge"></span></button><script>
(function () {
  var btn = document.getElementById('dm-approval-btn');
  if (!btn) return;
  var badge = document.getElementById('dm-approval-badge');

  var POLL_MS = 6000;       // 角标轮询（复用已有 mobile.pending，与 bundle 同频量级）
  var PANEL_MS = 4000;      // 浮层打开时的刷新间隔
  var lastSessionId = '';
  var panel = null;
  var bgTimer = null;
  var busy = false;
  var snap = { approvals: [], questions: [] };

  // 与 MODEL_BUTTON_HTML 同一手法：拦截 fetch 记住当前会话 id。
  var origFetch = window.fetch;
  if (typeof origFetch === 'function') {
    window.fetch = function (input, init) {
      try {
        var url = typeof input === 'string' ? input : (input && input.url) || '';
        if (url.indexOf('/m/api/') >= 0 && init && typeof init.body === 'string') {
          var body = JSON.parse(init.body);
          if (body && body.payload && typeof body.payload.sessionId === 'string' && body.payload.sessionId) {
            lastSessionId = body.payload.sessionId;
          }
        }
      } catch (e) {}
      return origFetch.apply(this, arguments);
    };
  }

  function currentSession() {
    try {
      var s = new URL(location.href).searchParams.get('session');
      if (s) return s;
    } catch (e) {}
    return lastSessionId;
  }

  function rpc(method, payload) {
    return fetch('/m/api/' + method, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rpcId: 'dm-appr-' + Date.now(), payload: payload })
    }).then(function (r) { return r.json(); }).then(function (j) { return j ? j.result : null; });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // ── 待处理计数：审批按条计，提问按 rpcId 归组后计「批」 ──────────────────
  function groups() {
    var out = [];
    var seen = Object.create(null);
    var qs = Array.isArray(snap.questions) ? snap.questions : [];
    for (var i = 0; i < qs.length; i++) {
      var it = qs[i];
      if (!it || typeof it.rpcId !== 'string' || it.rpcId === '') continue;
      if (seen[it.rpcId]) { seen[it.rpcId].items.push(it); continue; }
      var g = { rpcId: it.rpcId, items: [it] };
      seen[it.rpcId] = g;
      out.push(g);
    }
    return out;
  }
  function count() {
    var a = Array.isArray(snap.approvals) ? snap.approvals.length : 0;
    return a + groups().length;
  }

  function paintBadge() {
    var n = count();
    if (n <= 0) {
      // 常驻显示（用户要求）：没有子代理时保留图标本体，只清掉角标并把图标转灰，
      // 不再加 .dm-icon-hidden / aria-hidden —— 否则工具栏里这个按钮会整块消失。
      btn.classList.remove('dm-icon-hidden');
      btn.removeAttribute('aria-hidden');
      btn.classList.add('dm-icon-idle');
      if (badge) { badge.textContent = ''; badge.classList.remove('dm-icon-badge-show'); }
      return;
    }
    btn.classList.remove('dm-icon-hidden');
    btn.removeAttribute('aria-hidden');
    btn.classList.remove('dm-icon-idle');
    if (badge) {
      badge.textContent = n > 99 ? '99+' : String(n);
      badge.classList.add('dm-icon-badge-show');
    }
  }

  // ── 浮层骨架（一次性建好，之后只换 body） ───────────────────────────────
  function build() {
    var back = el('div', 'dm-approval-backdrop');
    var sheet = el('div', 'dm-approval-sheet');
    var head = el('div', 'dm-approval-head');
    var title = el('div', 'dm-approval-title', '待处理');
    var close = el('button', 'dm-approval-close', '✕');
    close.type = 'button';
    close.setAttribute('aria-label', '关闭');
    head.appendChild(title);
    head.appendChild(close);
    var body = el('div', 'dm-approval-body');
    var status = el('div', 'dm-approval-status');
    sheet.appendChild(head);
    sheet.appendChild(body);
    sheet.appendChild(status);
    back.appendChild(sheet);
    document.body.appendChild(back);

    back.addEventListener('click', function (e) {
      if (e.target !== back) return;
      closePanel();
    });
    close.addEventListener('click', function (e) { e.preventDefault(); closePanel(); });

    panel = { back: back, body: body, title: title, status: status };
    return panel;
  }

  function setStatus(text, kind) {
    if (!panel) return;
    var cls = 'dm-approval-status';
    if (text) cls += ' dm-approval-status-show';
    if (kind) cls += ' dm-approval-status-' + kind;
    panel.status.className = cls;
    panel.status.textContent = text || '';
  }

  function openPanel() {
    if (!panel) build();
    panel.back.classList.add('dm-approval-open');
    setStatus('');
    paint();
    refresh();
  }
  // 收起动画（同子代理面板）：先反向播放动画，结束再移除 open。
  function closePanel() {
    if (!panel) return;
    var back = panel.back;
    if (!back.classList.contains('dm-approval-open')) { setStatus(''); return; }
    if (back.getAttribute('data-dm-closing') === '1') return;
    back.setAttribute('data-dm-closing', '1');
    back.classList.add('dm-closing');
    var sheet = back.querySelector('.dm-approval-sheet');
    if (sheet) sheet.classList.add('dm-closing');
    window.setTimeout(function () {
      back.classList.remove('dm-approval-open');
      back.classList.remove('dm-closing');
      back.removeAttribute('data-dm-closing');
      if (sheet) sheet.classList.remove('dm-closing');
      setStatus('');
    }, 200);
  }
  function isOpen() {
    return !!panel && panel.back.classList.contains('dm-approval-open');
  }

  // 审批卡片：工具名 + 原因 + 允许一次 / 拒绝。
  function approvalCard(a) {
    var card = el('div', 'dm-approval-card');
    card.setAttribute('data-kind', 'approval');
    card.setAttribute('data-approval-id', String(a.approvalId || ''));
    card.setAttribute('data-rpc', String(a.rpcId || ''));
    card.appendChild(el('div', 'dm-approval-card-title', '审批 · ' + (a.toolName || '工具')));
    if (a.reason) card.appendChild(el('div', 'dm-approval-card-sub', String(a.reason)));
    var acts = el('div', 'dm-approval-acts');
    var allow = el('button', 'dm-approval-act dm-approval-allow', '允许一次');
    allow.type = 'button';
    allow.setAttribute('data-outcome', 'allowed-once');
    var deny = el('button', 'dm-approval-act dm-approval-deny', '拒绝');
    deny.type = 'button';
    deny.setAttribute('data-outcome', 'rejected');
    acts.appendChild(allow);
    acts.appendChild(deny);
    card.appendChild(acts);
    return card;
  }

  // 提问卡片：按批（rpcId）分组，每组渲染若干问题（单选 / 多选）+ 提交。
  function questionCard(g) {
    var card = el('div', 'dm-approval-card');
    card.setAttribute('data-kind', 'question');
    card.setAttribute('data-rpc', String(g.rpcId || ''));
    card.appendChild(el('div', 'dm-approval-card-title', '提问'));
    var items = Array.isArray(g.items) ? g.items : [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i] || {};
      var id = String(it.id == null ? i : it.id);
      var box = el('div', 'dm-approval-q');
      box.setAttribute('data-q-id', id);
      if (it.header) box.appendChild(el('div', 'dm-approval-q-header', String(it.header)));
      box.appendChild(el('div', 'dm-approval-q-text', String(it.question || '问题')));
      if (it.detail) box.appendChild(el('div', 'dm-approval-q-detail', String(it.detail)));
      var opts = Array.isArray(it.options) ? it.options : [];
      var list = el('div', 'dm-approval-q-opts');
      var multi = it.multiSelect === true;
      for (var k = 0; k < opts.length; k++) {
        var o = opts[k] || {};
        var label = el('label', 'dm-approval-opt');
        var input = document.createElement('input');
        input.type = multi ? 'checkbox' : 'radio';
        input.name = 'dmq-' + String(g.rpcId || '') + '-' + id;
        input.value = String(o.label == null ? '' : o.label);
        label.appendChild(input);
        label.appendChild(el('span', 'dm-approval-opt-label', input.value));
        if (o.description) label.appendChild(el('span', 'dm-approval-opt-desc', String(o.description)));
        list.appendChild(label);
      }
      box.appendChild(list);
      card.appendChild(box);
    }
    var submit = el('button', 'dm-approval-submit', '提交');
    submit.type = 'button';
    card.appendChild(submit);
    return card;
  }

  function paint() {
    if (!panel) return;
    var body = panel.body;
    body.innerHTML = '';
    var n = count();
    panel.title.textContent = '待处理 · ' + n + ' 项';
    if (n === 0) {
      body.appendChild(el('p', 'dm-approval-hint', '当前没有待处理的审批或提问'));
      return;
    }
    var aps = Array.isArray(snap.approvals) ? snap.approvals : [];
    for (var i = 0; i < aps.length; i++) {
      if (!aps[i]) continue;
      body.appendChild(approvalCard(aps[i]));
    }
    var gs = groups();
    for (var k = 0; k < gs.length; k++) body.appendChild(questionCard(gs[k]));
  }

  function refresh() {
    var sid = currentSession();
    return rpc('mobile.pending', { sessionId: sid }).then(function (res) {
      if (!res || !res.ok || !res.value) return false;
      var v = res.value;
      snap = {
        approvals: Array.isArray(v.approvals) ? v.approvals : [],
        questions: Array.isArray(v.questions) ? v.questions : [],
      };
      paintBadge();
      if (isOpen()) paint();
      return true;
    }).catch(function () { return false; });
  }

  // ── 应答 ────────────────────────────────────────────────────────────────
  function respondApproval(card, outcome) {
    if (busy) return;
    busy = true;
    setStatus('提交中…');
    var aid = card.getAttribute('data-approval-id') || '';
    rpc('mobile.respond', {
      rpcId: card.getAttribute('data-rpc') || '',
      response: { sessionId: currentSession(), approvalId: aid, outcome: outcome }
    }).then(function (res) {
      busy = false;
      if (!isOpen()) return;
      if (!res || !res.ok) {
        setStatus((res && res.error && res.error.message) ? res.error.message : '处理失败', 'err');
        return;
      }
      setStatus(outcome === 'rejected' ? '已拒绝' : '已允许', 'ok');
      refresh();
    }).catch(function () {
      busy = false;
      if (!isOpen()) return;
      setStatus('处理失败', 'err');
    });
  }

  // 提问应答：answers = [{ id, selected:[label…] }]，与 bundle 提交的同形。
  function submitQuestion(card) {
    if (busy) return;
    var boxes = card.querySelectorAll('.dm-approval-q');
    var answers = [];
    for (var i = 0; i < boxes.length; i++) {
      var box = boxes[i];
      var id = box.getAttribute('data-q-id') || '';
      var inputs = box.querySelectorAll('input');
      var selected = [];
      for (var k = 0; k < inputs.length; k++) {
        if (inputs[k].checked) selected.push(inputs[k].value);
      }
      answers.push({ id: id, selected: selected });
    }
    busy = true;
    setStatus('提交中…');
    rpc('mobile.respond', {
      rpcId: card.getAttribute('data-rpc') || '',
      response: { sessionId: currentSession(), answer: { answers: answers } }
    }).then(function (res) {
      busy = false;
      if (!isOpen()) return;
      if (!res || !res.ok) {
        setStatus((res && res.error && res.error.message) ? res.error.message : '提交失败', 'err');
        return;
      }
      setStatus('已提交', 'ok');
      refresh();
    }).catch(function () {
      busy = false;
      if (!isOpen()) return;
      setStatus('提交失败', 'err');
    });
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var act = t.closest('.dm-approval-act');
    if (act) {
      var c1 = act.closest('.dm-approval-card');
      if (!c1 || c1.getAttribute('data-kind') !== 'approval') return;
      e.preventDefault();
      respondApproval(c1, act.getAttribute('data-outcome') || 'rejected');
      return;
    }
    if (t.closest('.dm-approval-submit')) {
      var c2 = t.closest('.dm-approval-card');
      if (!c2 || c2.getAttribute('data-kind') !== 'question') return;
      e.preventDefault();
      submitQuestion(c2);
    }
  });

  btn.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (isOpen()) closePanel();
    else openPanel();
  });

  // ── 只在聊天页显示：与权限按钮同一判据 ──────────────────────────────────
  function isChatPage() {
    var slots = document.querySelectorAll('.mobile-headerSlot-right');
    for (var i = 0; i < slots.length; i++) {
      if (slots[i].querySelector('button[aria-label="更多"]')) return true;
    }
    return false;
  }

  function startPoll() {
    if (bgTimer !== null) return;
    refresh();
    bgTimer = window.setInterval(function () {
      try {
        if (document.visibilityState && document.visibilityState !== 'visible') return;
        refresh();
      } catch (e) {}
    }, POLL_MS);
  }
  function stopPoll() {
    if (bgTimer !== null) { window.clearInterval(bgTimer); bgTimer = null; }
  }

  // 幂等：位置对了就不动，避免被 MutationObserver 反复插入而抖动。
  function ensure() {
    var row = document.getElementById('dm-tools');
    var tools = document.querySelector('.chat-tools');
    if (!row || !tools || !isChatPage()) {
      if (btn.parentNode) btn.parentNode.removeChild(btn);
      btn.classList.add('dm-icon-hidden');
      if (isOpen()) closePanel();
      stopPoll();
      return;
    }
    var perm = document.getElementById('dm-perm-btn');
    if (btn.parentNode !== row) {
      if (perm && perm.parentNode === row) row.insertBefore(btn, perm.nextSibling);
      else row.appendChild(btn);
    } else if (perm && perm.parentNode === row && perm.nextSibling !== btn) {
      row.insertBefore(btn, perm.nextSibling);
    }
    startPoll();
  }

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    window.setTimeout(function () { pending = false; ensure(); }, 60);
  }
  try {
    var mo = new MutationObserver(schedule);
    mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
  } catch (e) {}
  setInterval(ensure, 400);
  ensure();
})();
</script>`

// 工具行最右侧「子代理状态」图标：当前会话有子代理时才出现，运行中带绿色数字角标，
// 全部空闲时图标转灰；点击打开已有的子代理面板（SUBAGENT_BTN_HTML 那个，不重画）。
//
// 数据不新增轮询：只读 SUBAGENT_BTN_HTML 挂在 window 上的快照（它自己在后台预取
// subagent.list），本脚本每 1s 做一次纯内存同步，一个 RPC 都不发。
const SUBAGENT_STATUS_BTN_HTML = `<button id="dm-subagent-status-btn" class="dm-tool-btn" type="button" aria-label="子代理状态" title="子代理状态"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5.5" r="2.6"/><circle cx="5" cy="17" r="2.6"/><circle cx="19" cy="17" r="2.6"/><path d="M12 8.1V14M12 14H6.8M12 14h5.2"/></svg><span id="dm-subagent-status-badge" class="dm-icon-badge"></span></button><script>
(function () {
  var btn = document.getElementById('dm-subagent-status-btn');
  if (!btn) return;
  var badge = document.getElementById('dm-subagent-status-badge');

  var SYNC_MS = 1000;   // 纯内存同步（读快照），不发任何 RPC
  function hub() {
    try { return window.__dmSubagentHub || null; } catch (e) { return null; }
  }

  function hide() {
    btn.classList.add('dm-icon-hidden');
    btn.setAttribute('aria-hidden', 'true');
    if (badge) { badge.textContent = ''; badge.classList.remove('dm-icon-badge-show'); }
  }

  function sync() {
    var h = hub();
    if (!h || typeof h.snapshot !== 'function') { hide(); return; }
    var s = h.snapshot();
    if (!s || !s.known || !(s.total > 0)) { hide(); return; }   // 没子代理 / 还没拉到 → 隐藏
    btn.classList.remove('dm-icon-hidden');
    btn.removeAttribute('aria-hidden');
    var running = s.running > 0;
    btn.classList.toggle('dm-icon-idle', !running);
    if (badge) {
      if (running) {
        badge.textContent = s.running > 99 ? '99+' : String(s.running);
        badge.classList.add('dm-icon-badge-show');
      } else {
        badge.textContent = '';
        badge.classList.remove('dm-icon-badge-show');
      }
    }
    btn.setAttribute('title', running ? ('子代理 · ' + s.running + ' 个运行中') : ('子代理 · ' + s.total + ' 个（空闲）'));
  }

  btn.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    var h = hub();
    if (h && typeof h.openPanel === 'function') { h.openPanel(); return; }
    // 兜底：hub 还没挂上（子代理脚本尚未执行完）时点它自己的按钮，效果一致。
    var b = document.getElementById('dm-subagent-btn');
    if (b) b.click();
  });

  function isChatPage() {
    var slots = document.querySelectorAll('.mobile-headerSlot-right');
    for (var i = 0; i < slots.length; i++) {
      if (slots[i].querySelector('button[aria-label="更多"]')) return true;
    }
    return false;
  }

  // 幂等：位置对了就不动。
  function ensure() {
    var row = document.getElementById('dm-tools');
    var tools = document.querySelector('.chat-tools');
    if (!row || !tools || !isChatPage()) {
      if (btn.parentNode) btn.parentNode.removeChild(btn);
      hide();
      return;
    }
    // 审批图标的右边 = 本图标；审批图标不在行内就挂末尾（下一轮再排正）。
    var appr = document.getElementById('dm-approval-btn');
    if (btn.parentNode !== row) {
      if (appr && appr.parentNode === row) row.insertBefore(btn, appr.nextSibling);
      else row.appendChild(btn);
    } else if (appr && appr.parentNode === row && appr.nextSibling !== btn) {
      row.insertBefore(btn, appr.nextSibling);
    }
    sync();
  }

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    window.setTimeout(function () { pending = false; ensure(); }, 60);
  }
  try {
    var mo = new MutationObserver(schedule);
    mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
  } catch (e) {}
  setInterval(ensure, 400);
  setInterval(sync, SYNC_MS);
  hide();
  ensure();
})();
</script>`
// 权限预设切换：工具栏「上下文用量」右边一个盾牌按钮，点开自绘面板列出宿主
// permissionPresets.catalog() 的预设并切换。
//
// 为什么不复用 bundle 自带的权限面板：它靠 slash 命令 `/permission <name>` 切换，
// 而本插件的 mobile.commandExec 一直是 not-supported，于是手机上永远切不动。
// 这里改走专用的 mobile.permissions.get / .set 两个 RPC，与 bundle 解耦。
const PERMISSION_BTN_HTML = `<button id="dm-perm-btn" class="dm-tool-btn" type="button" aria-label="权限" title="权限"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 2.8v5.4c0 4.2-2.9 7.6-7 8.5-4.1-.9-7-4.3-7-8.5V5.8L12 3z"/><path d="M9.2 12.1l2 2 3.6-3.8"/></svg></button><script>
(function () {
  var btn = document.getElementById('dm-perm-btn');
  if (!btn) return;

  var lastSessionId = '';
  var panel = null;
  var busy = false;

  // 与 MODEL_BUTTON_HTML 同一手法：拦截 fetch 记住当前会话 id。
  var origFetch = window.fetch;
  if (typeof origFetch === 'function') {
    window.fetch = function (input, init) {
      try {
        var url = typeof input === 'string' ? input : (input && input.url) || '';
        if (url.indexOf('/m/api/') >= 0 && init && typeof init.body === 'string') {
          var body = JSON.parse(init.body);
          if (body && body.payload && typeof body.payload.sessionId === 'string' && body.payload.sessionId) {
            lastSessionId = body.payload.sessionId;
          }
        }
      } catch (e) {}
      return origFetch.apply(this, arguments);
    };
  }

  function currentSession() {
    try {
      var s = new URL(location.href).searchParams.get('session');
      if (s) return s;
    } catch (e) {}
    return lastSessionId;
  }

  function rpc(method, payload) {
    return fetch('/m/api/' + method, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rpcId: 'dm-perm-' + Date.now(), payload: payload })
    }).then(function (r) { return r.json(); }).then(function (j) { return j ? j.result : null; });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function build() {
    var back = el('div', 'dm-perm-backdrop');
    var sheet = el('div', 'dm-perm-sheet');
    var head = el('div', 'dm-perm-head');
    var title = el('div', 'dm-perm-title', '权限');
    var close = el('button', 'dm-perm-close', '✕');
    close.type = 'button';
    close.setAttribute('aria-label', '关闭');
    head.appendChild(title);
    head.appendChild(close);
    var body = el('div', 'dm-perm-body');
    var status = el('div', 'dm-perm-status');
    sheet.appendChild(head);
    sheet.appendChild(body);
    sheet.appendChild(status);
    back.appendChild(sheet);
    document.body.appendChild(back);

    back.addEventListener('click', function (e) {
      if (e.target !== back) return;   // 点面板内部不关
      closePanel();
    });
    close.addEventListener('click', function (e) { e.preventDefault(); closePanel(); });

    panel = { back: back, body: body, status: status };
    return panel;
  }

  function setStatus(text, kind) {
    if (!panel) return;
    var cls = 'dm-perm-status';
    if (text) cls += ' dm-perm-status-show';
    if (kind) cls += ' dm-perm-status-' + kind;
    panel.status.className = cls;
    panel.status.textContent = text || '';
  }

  // 渲染选项列表。available=false（宿主没装配权限预设服务）时给空态，
  // 不伪造任何选项 —— 宁可什么都不显示，也不能让人误以为切成功了。
  function paint(res) {
    if (!panel) return;
    var body = panel.body;
    body.innerHTML = '';
    if (!res || !res.ok || !res.value) {
      body.appendChild(el('p', 'dm-perm-hint', '加载失败，请重试'));
      return;
    }
    var v = res.value;
    var opts = Array.isArray(v.options) ? v.options : [];
    if (v.available === false || opts.length === 0) {
      body.appendChild(el('p', 'dm-perm-hint', '当前没有可用的权限预设'));
      return;
    }
    for (var i = 0; i < opts.length; i++) {
      var o = opts[i];
      if (!o || typeof o.value !== 'string' || typeof o.name !== 'string') continue;
      var on = o.value === v.currentValue;
      var row = el('button', 'dm-perm-row' + (on ? ' dm-perm-row-on' : ''));
      row.type = 'button';
      row.setAttribute('data-value', o.value);
      // 记住中文名，切换成功后的提示要用它，而不是回显英文的 value。
      row.setAttribute('data-label', o.name);
      var main = el('div', 'dm-perm-main');
      main.appendChild(el('div', 'dm-perm-name', esc(o.name)));
      if (o.description) main.appendChild(el('div', 'dm-perm-sub', esc(o.description)));
      row.appendChild(main);
      if (on) row.appendChild(el('span', 'dm-perm-check', '✓'));
      body.appendChild(row);
    }
  }

  function open() {
    if (!panel) build();
    panel.back.classList.add('dm-perm-open');
    setStatus('');
    load();
  }

  // 收起动画（同上）：先反向播放，结束再移除 open。
  function closePanel() {
    if (!panel) return;
    var back = panel.back;
    if (!back.classList.contains('dm-perm-open')) { setStatus(''); return; }
    if (back.getAttribute('data-dm-closing') === '1') return;
    back.setAttribute('data-dm-closing', '1');
    back.classList.add('dm-closing');
    var sheet = back.querySelector('.dm-perm-sheet');
    if (sheet) sheet.classList.add('dm-closing');
    window.setTimeout(function () {
      back.classList.remove('dm-perm-open');
      back.classList.remove('dm-closing');
      back.removeAttribute('data-dm-closing');
      if (sheet) sheet.classList.remove('dm-closing');
      setStatus('');
    }, 200);
  }

  function load() {
    if (!panel) return;
    panel.body.innerHTML = '';
    panel.body.appendChild(el('p', 'dm-perm-hint dm-perm-loading', '加载中…'));
    setStatus('');
    return rpc('mobile.permissions.get', { sessionId: currentSession() }).then(function (res) {
      if (!panel || !panel.back.classList.contains('dm-perm-open')) return;
      paint(res);
    }).catch(function () {
      if (!panel || !panel.back.classList.contains('dm-perm-open')) return;
      panel.body.innerHTML = '';
      panel.body.appendChild(el('p', 'dm-perm-hint', '加载失败，请重试'));
    });
  }

  // 按 value 找中文名，用于切换成功后的提示（不回显英文 value）。
  function labelOf(opts, value) {
    opts = Array.isArray(opts) ? opts : [];
    for (var i = 0; i < opts.length; i++) {
      if (opts[i] && opts[i].value === value && typeof opts[i].name === 'string') return opts[i].name;
    }
    return value;
  }

  // 切换：成功后用 set 返回的视图直接重绘（宿主回读的真实生效值），不用前端猜。
  function select(value, fallbackLabel) {
    if (busy) return;
    busy = true;
    setStatus('切换中…');
    rpc('mobile.permissions.set', { sessionId: currentSession(), preset: value }).then(function (res) {
      busy = false;
      if (!panel || !panel.back.classList.contains('dm-perm-open')) return;
      if (!res || !res.ok) {
        var msg = (res && res.error && res.error.message) ? res.error.message : '切换失败';
        setStatus(msg, 'err');
        return;
      }
      paint(res);
      // 提示用中文名：优先取服务端回读的视图，其次取点中那行的中文名。
      var shown = (res.value && Array.isArray(res.value.options))
        ? labelOf(res.value.options, (res.value.currentValue || value))
        : '';
      setStatus('已切换：' + (shown || fallbackLabel || value), 'ok');
    }).catch(function () {
      busy = false;
      if (!panel || !panel.back.classList.contains('dm-perm-open')) return;
      setStatus('切换失败', 'err');
    });
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var row = t.closest('.dm-perm-row');
    if (!row) return;
    var v = row.getAttribute('data-value');
    if (!v) return;
    e.preventDefault();
    if (row.classList.contains('dm-perm-row-on')) { closePanel(); return; }
    select(v, row.getAttribute('data-label') || '');
  });

  btn.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (panel && panel.back.classList.contains('dm-perm-open')) closePanel();
    else open();
  });

  // ── 只在聊天页显示 ──
  // 判据与子代理按钮一致（顶栏右侧有「更多」按钮），外加工具栏本身存在：
  // #dm-tools 由 MODEL_BUTTON_HTML 创建并塞进 .chat-tools，它存在即说明在聊天页。
  function isChatPage() {
    var slots = document.querySelectorAll('.mobile-headerSlot-right');
    for (var i = 0; i < slots.length; i++) {
      if (slots[i].querySelector('button[aria-label="更多"]')) return true;
    }
    return false;
  }

  // 幂等：每次都先判断位置，只在位置不对时才搬动；否则会随 MutationObserver
  // 反复 insertBefore，把按钮和 .chat-context 的位置来回抖。
  function ensure() {
    var row = document.getElementById('dm-tools');
    var tools = document.querySelector('.chat-tools');
    if (!row || !tools || !isChatPage()) {
      if (btn.parentNode) btn.parentNode.removeChild(btn);
      if (panel && panel.back.classList.contains('dm-perm-open')) closePanel();
      return;
    }
    var ctxEl = row.querySelector('.chat-context');
    if (btn.parentNode !== row) {
      // 圆环还没被搬进来时先挂末尾，等下一轮它出现了再挪到它右边。
      if (ctxEl) row.insertBefore(btn, ctxEl.nextSibling);
      else row.appendChild(btn);
      return;
    }
    if (ctxEl && ctxEl.nextSibling !== btn) row.insertBefore(btn, ctxEl.nextSibling);
  }

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    window.setTimeout(function () { pending = false; ensure(); }, 60);
  }
  try {
    var mo = new MutationObserver(schedule);
    mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
  } catch (e) {}
  setInterval(ensure, 400);
  ensure();
})();
</script>`

// 聊天模式（Agent 预设）按钮：**只在还没有发出第一条消息的空白会话里出现**。
//
// 为什么需要它：bundle 只在「新建会话」时把 agentPreset 带进 session.create
// （`ae({workspaceId, agentPreset: D})`），会话一旦建好就再没有切换入口；手机
// 会话页连宿主自带的预设卡片也没有。宿主侧 agentPresets.select(agent, preset)
// 恰好支持「首条消息之前」改绑（它自己读 turnBoundary 投影：已开轮次就抛
// agent-preset/locked，不会静默改一个已经聊起来的会话），所以这里只在空白
// 会话显示按钮，选中时走专用 RPC mobile.setAgentPreset。
//
// 显隐判据用 DOM（轻量，不发 RPC、不读历史）：
//   .chat-scroll 里没有任何 .chat-msg（含 pending 的）→ 还没有消息；
//   历史仍在加载（.chat-typing 的文案不是「还没有消息…」）时先不显示，
//   避免进页面的一瞬间闪一下再消失。
// 选项列表来自 agentPreset.list（宿主 agentPresets.remoteExportList），
// 不硬编码任何预设名 —— 宿主没给 name 就显示 id。
const PRESET_BTN_HTML = `<button id="dm-preset-btn" class="dm-tool-btn" type="button" aria-label="聊天模式" title="聊天模式"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.4 3.6 7.6 12 11.8l8.4-4.2z"/><path d="M3.6 12.1 12 16.3l8.4-4.2"/><path d="M3.6 16.6 12 20.8l8.4-4.2"/></svg></button><script>
(function () {
  var btn = document.getElementById('dm-preset-btn');
  if (!btn) return;

  var lastSessionId = '';
  var panel = null;
  var busy = false;
  var currentPreset = '';
  // 宿主确认过「这个会话已经开过轮次」的 id：一旦确认就一直隐藏（比 DOM 判据硬，
  // 换会话时自动失效）。
  var startedSession = '';
  var toastTimer = 0;

  // 与 MODEL_BUTTON_HTML 同一手法：拦截 fetch 记住当前会话 id（手机页路由不带 query）。
  // 顺带盯 session.prompt：**发第一条消息的请求一发出就收起按钮** —— 不依赖 bundle
  // 之后是否真的把消息节点渲染出来（手机端实测偶发：消息已落盘、列表却不刷新）。
  var origFetch = window.fetch;
  if (typeof origFetch === 'function') {
    window.fetch = function (input, init) {
      try {
        var url = typeof input === 'string' ? input : (input && input.url) || '';
        if (url.indexOf('/m/api/') >= 0 && init && typeof init.body === 'string') {
          var method = url.slice(url.indexOf('/m/api/') + 7).split('?')[0];
          var body = JSON.parse(init.body);
          var payload = body && body.payload;
          if (payload && typeof payload.sessionId === 'string' && payload.sessionId) {
            lastSessionId = payload.sessionId;
            if (method === 'session.prompt') markStarted(payload.sessionId);
          }
        }
      } catch (e) {}
      return origFetch.apply(this, arguments);
    };
  }

  // 一旦确认这个会话「已经不是第一条消息之前」，就锁死隐藏；换会话自动失效。
  function markStarted(sid) {
    var id = sid || currentSession();
    if (id !== '') startedSession = id;
    btn.classList.add('dm-icon-hidden');
    btn.setAttribute('aria-hidden', 'true');
  }

  function currentSession() {
    try {
      var s = new URL(location.href).searchParams.get('session');
      if (s) return s;
    } catch (e) {}
    return lastSessionId;
  }

  function rpc(method, payload) {
    return fetch('/m/api/' + method, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rpcId: 'dm-preset-' + Date.now(), payload: payload })
    }).then(function (r) { return r.json(); }).then(function (j) { return j ? j.result : null; });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  // 轻提示：复用 bundle 自己的 .toast-host / .toast，样式跟原生保持一致。
  function toast(text) {
    try {
      var host = document.createElement('div');
      host.className = 'toast-host';
      host.setAttribute('role', 'status');
      var item = document.createElement('div');
      item.className = 'toast';
      item.textContent = text;
      host.appendChild(item);
      document.body.appendChild(host);
      if (toastTimer) window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(function () {
        try { if (host.parentNode) host.parentNode.removeChild(host); } catch (e) {}
      }, 2200);
    } catch (e) {}
  }

  // 面板容器沿用 .dm-perm-* 那套浮层（同一风格、颜色全走主题变量），
  // 只有行用 data-preset 标记；权限面板的全局点击处理只认 .dm-perm-row[data-value]，
  // 不会误吃这里的点击。
  function build() {
    var back = el('div', 'dm-perm-backdrop');
    var sheet = el('div', 'dm-perm-sheet');
    var head = el('div', 'dm-perm-head');
    var title = el('div', 'dm-perm-title', '聊天模式');
    var close = el('button', 'dm-perm-close', '✕');
    close.type = 'button';
    close.setAttribute('aria-label', '关闭');
    head.appendChild(title);
    head.appendChild(close);
    var body = el('div', 'dm-perm-body');
    var status = el('div', 'dm-perm-status');
    sheet.appendChild(head);
    sheet.appendChild(body);
    sheet.appendChild(status);
    back.appendChild(sheet);
    document.body.appendChild(back);

    back.addEventListener('click', function (e) {
      if (e.target !== back) return;   // 点面板内部不关
      closePanel();
    });
    close.addEventListener('click', function (e) { e.preventDefault(); closePanel(); });

    panel = { back: back, body: body, status: status, list: [] };
    return panel;
  }

  function setStatus(text, kind) {
    if (!panel) return;
    var cls = 'dm-perm-status';
    if (text) cls += ' dm-perm-status-show';
    if (kind) cls += ' dm-perm-status-' + kind;
    panel.status.className = cls;
    panel.status.textContent = text || '';
  }

  function labelOf(id) {
    var list = (panel && Array.isArray(panel.list)) ? panel.list : [];
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].id === id) {
        return (typeof list[i].name === 'string' && list[i].name !== '') ? list[i].name : id;
      }
    }
    return id;
  }

  function render() {
    if (!panel) return;
    var body = panel.body;
    body.innerHTML = '';
    var list = Array.isArray(panel.list) ? panel.list : [];
    if (list.length === 0) {
      body.appendChild(el('p', 'dm-perm-hint', '宿主没有注册任何 Agent 预设'));
      return;
    }
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      if (!p || typeof p.id !== 'string' || p.id === '') continue;
      var label = (typeof p.name === 'string' && p.name !== '') ? p.name : p.id;
      var on = p.id === currentPreset;
      var row = el('button', 'dm-perm-row' + (on ? ' dm-perm-row-on' : ''));
      row.type = 'button';
      row.setAttribute('data-preset', p.id);
      row.setAttribute('data-label', label);
      if (typeof p.broken === 'string' && p.broken !== '') {
        row.disabled = true;
        row.setAttribute('data-broken', '1');
      }
      var main = el('div', 'dm-perm-main');
      // 「（默认）」是宿主 roster 里的 isDefault，不是前端猜的。
      main.appendChild(el('div', 'dm-perm-name', esc(label) + (p.isDefault === true ? '（默认）' : '')));
      if (typeof p.description === 'string' && p.description !== '') {
        main.appendChild(el('div', 'dm-perm-sub', esc(p.description)));
      } else if (typeof p.broken === 'string' && p.broken !== '') {
        main.appendChild(el('div', 'dm-perm-sub', '不可用：' + esc(p.broken)));
      }
      row.appendChild(main);
      if (on) row.appendChild(el('span', 'dm-perm-check', '✓'));
      body.appendChild(row);
    }
  }

  function paint(res) {
    if (!panel) return;
    if (!res || !res.ok || !res.value) {
      panel.list = [];
      render();
      panel.body.appendChild(el('p', 'dm-perm-hint', '加载失败，请重试'));
      return;
    }
    panel.list = Array.isArray(res.value.presets) ? res.value.presets : [];
    if (typeof res.value.current === 'string' && res.value.current !== '') currentPreset = res.value.current;
    // 宿主用 turnBoundary 投影算出来的权威判据：blank === false 说明已经开过
    // 轮次，立刻收起按钮，不再依赖聊天 DOM 是否已经渲染出消息节点。
    if (res.value.blank === false) markStarted();
    render();
  }

  function rememberButtonLabel(id) {
    var label = labelOf(id);
    btn.setAttribute('title', '聊天模式：' + label);
    btn.setAttribute('aria-label', '聊天模式：' + label);
    return label;
  }

  function open() {
    if (!panel) build();
    panel.back.classList.add('dm-perm-open');
    setStatus('');
    load();
  }

  function closePanel() {
    if (!panel) return;
    panel.back.classList.remove('dm-perm-open');
    setStatus('');
  }

  function load() {
    if (!panel) return;
    panel.body.innerHTML = '';
    panel.body.appendChild(el('p', 'dm-perm-hint dm-perm-loading', '加载中…'));
    setStatus('');
    return rpc('agentPreset.list', { sessionId: currentSession() }).then(function (res) {
      if (!panel || !panel.back.classList.contains('dm-perm-open')) return;
      paint(res);
    }).catch(function () {
      if (!panel || !panel.back.classList.contains('dm-perm-open')) return;
      panel.body.innerHTML = '';
      panel.body.appendChild(el('p', 'dm-perm-hint', '加载失败，请重试'));
    });
  }

  function select(id, fallbackLabel) {
    if (busy) return;
    var sid = currentSession();
    if (sid === '') { setStatus('拿不到会话 ID，请重新进入该会话', 'err'); return; }
    busy = true;
    setStatus('切换中…');
    rpc('mobile.setAgentPreset', { sessionId: sid, agentPreset: id }).then(function (res) {
      busy = false;
      if (!panel) return;
      if (!res || !res.ok) {
        var msg = (res && res.error && res.error.message) ? res.error.message : '切换失败';
        setStatus(msg, 'err');
        return;
      }
      currentPreset = (res.value && typeof res.value.agentPreset === 'string' && res.value.agentPreset !== '')
        ? res.value.agentPreset
        : id;
      render();
      var shown = rememberButtonLabel(currentPreset) || fallbackLabel || id;
      setStatus('已切换：' + shown, 'ok');
      toast('已切换聊天模式：' + shown);
      window.setTimeout(closePanel, 900);
    }).catch(function () {
      busy = false;
      if (!panel) return;
      setStatus('切换失败', 'err');
    });
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var row = t.closest('.dm-perm-row[data-preset]');
    if (!row) return;
    e.preventDefault();
    var id = row.getAttribute('data-preset');
    if (!id) return;
    if (row.classList.contains('dm-perm-row-on')) { closePanel(); return; }
    select(id, row.getAttribute('data-label') || '');
  });

  btn.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (panel && panel.back.classList.contains('dm-perm-open')) closePanel();
    else open();
  });

  // ── 只在「聊天页 + 空白会话」显示 ──
  function isChatPage() {
    var slots = document.querySelectorAll('.mobile-headerSlot-right');
    for (var i = 0; i < slots.length; i++) {
      if (slots[i].querySelector('button[aria-label="更多"]')) return true;
    }
    return false;
  }

  // 空白 = 聊天页里一条消息节点都没有，且空态文案已经出现（历史加载完成）。
  // 另加两条「正忙」判据：一轮在跑（停止按钮/输出中状态行）时也不算空白 ——
  // 手机端偶发消息节点晚一拍才渲染，这几条能保证发出一瞬间按钮就消失。
  function isBlankChat() {
    var scroll = document.querySelector('.chat-scroll');
    if (!scroll) return false;
    if (scroll.querySelector('.chat-msg')) return false;
    if (document.querySelector('.chat-send-stop')) return false;    // 正在生成
    if (document.querySelector('.chat-turn-status')) return false;  // 「输出中」状态行
    var typing = scroll.querySelector('.chat-typing');
    if (!typing) return false;
    return String(typing.textContent || '').indexOf('还没有消息') >= 0;
  }

  function ensure() {
    var row = document.getElementById('dm-tools');
    var tools = document.querySelector('.chat-tools');
    if (!row || !tools || !isChatPage()) {
      if (btn.parentNode) btn.parentNode.removeChild(btn);
      if (panel && panel.back.classList.contains('dm-perm-open')) closePanel();
      return;
    }
    // 落位：上下文用量按钮左边（模式紧挨着模型/用量）。只在不在行内时搬一次，
    // 之后不再抢位置 —— 权限按钮也按「紧跟 .chat-context」自我排序，反复
    // insertBefore 会互相把对方拽着来回跳。
    if (btn.parentNode !== row) {
      var ctxEl = row.querySelector('.chat-context');
      if (ctxEl && ctxEl.parentNode === row) row.insertBefore(btn, ctxEl);
      else row.appendChild(btn);
    }
    var sid = currentSession();
    if (startedSession !== '' && sid !== startedSession) startedSession = '';  // 换会话：重置
    var blank = isBlankChat() && !(sid !== '' && sid === startedSession);
    btn.classList.toggle('dm-icon-hidden', !blank);
    if (blank) btn.removeAttribute('aria-hidden');
    else btn.setAttribute('aria-hidden', 'true');
  }

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    window.setTimeout(function () { pending = false; ensure(); }, 60);
  }
  try {
    var mo = new MutationObserver(schedule);
    mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
  } catch (e) {}
  setInterval(ensure, 300);
  ensure();
})();
</script>`

// 发送模式（需求 B 的前端侧）：按设置改写 session.prompt 的 mode。
//
// bundle 里 ce() 把 mode 写死成 `queue`（`await m('session.prompt',{sessionId:e,mode:'queue',content:t})`），
// bundle 不可改，所以唯一可行的切入点是它下面的 window.fetch —— 与 MODEL_BUTTON_HTML
// 同一手法：在请求发出前把 body 里的 mode 换成用户选的那个值。
//
// 设置值从 mobile.preferences 读（宿主下发），并缓存在 localStorage 供首帧使用。
const SEND_MODE_HTML = `<script>
(function () {
  var KEY = 'dm.sendMode';
  var mode = 'queue';

  function valid(v) { return v === 'steer' || v === 'queue'; }

  try {
    var cached = localStorage.getItem(KEY);
    if (valid(cached)) mode = cached;
  } catch (e) {}

  // 只改 session.prompt 的 mode：别的请求一律原样放行。
  var origFetch = window.fetch;
  if (typeof origFetch === 'function') {
    window.fetch = function (input, init) {
      try {
        var url = typeof input === 'string' ? input : (input && input.url) || '';
        if (url.indexOf('/m/api/session.prompt') >= 0 && init && typeof init.body === 'string') {
          var body = JSON.parse(init.body);
          if (body && body.payload && typeof body.payload === 'object') {
            body.payload.mode = mode;
            init = { ...init, body: JSON.stringify(body) };
          }
        }
      } catch (e) {}
      return origFetch.apply(this, arguments.length ? [input, init] : arguments);
    };
  }

  function rpc(method, payload) {
    return fetch('/m/api/' + method, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rpcId: 'dm-' + Date.now(), payload: payload || {} }),
    }).then(function (r) { return r.json(); }).then(function (j) { return j ? j.result : null; });
  }

  // 启动时拉一次真值（宿主是唯一权威；localStorage 只是首帧缓存）。
  function syncFromHost() {
    return rpc('mobile.preferences', {}).then(function (res) {
      var v = res && res.ok && res.value ? res.value.sendMode : undefined;
      if (!valid(v)) return;
      mode = v;
      try { localStorage.setItem(KEY, v); } catch (e) {}
      window.dispatchEvent(new CustomEvent('dm:sendmode', { detail: { sendMode: v } }));
    }).catch(function () {});
  }

  // 给设置页脚本用：读 / 写。
  window.__dmSendMode = {
    get: function () { return mode; },
    set: function (next) {
      if (!valid(next)) return Promise.resolve(mode);
      return rpc('mobile.preferences', { sendMode: next }).then(function () {
        mode = next;
        try { localStorage.setItem(KEY, next); } catch (e) {}
        window.dispatchEvent(new CustomEvent('dm:sendmode', { detail: { sendMode: next } }));
        return mode;
      });
    },
  };

  syncFromHost();
})();
</script>`

// 设置页「发送模式」行（需求 A）。
//
// 注入点：设置页的「对话」分组（.settings-group 里含「自动滚动 / 震动」的那个 ul）。
// 识别方式：找标题为「对话」的 .settings-groupTitle，取它所在的 ul —— 与本机语言一致，
// 不依赖英文文案。找不到就挂到设置页滚动容器 .mobile-scroll 末尾，绝不静默失败。
//
// 交互：行内是一个真正的原生 <select>（排队 / 直接插入），只有下拉能改值；
// 整行不再 click toggle —— 行是 <div>，点击行不会触发任何写操作。
// change → window.__dmSendMode.set(v) → 成功后刷新显示 + 提示「已保存」。
const SEND_MODE_SETTINGS_HTML = `<script>
(function () {
  var LABELS = {
    queue: '排队（等当前回复结束）',
    steer: '直接插入（插队立即生效）',
  };
  var SHORT = { queue: '排队', steer: '直接插入' };
  var OPTIONS = [
    { value: 'queue', text: SHORT.queue },
    { value: 'steer', text: SHORT.steer },
  ];

  function settingsPage() {
    // 设置页标志：有搜索框 .settings-search 且标题是「设置」。
    var title = document.querySelector('.mobile-title');
    var hasSearch = !!document.querySelector('.settings-search');
    if (!hasSearch) return null;
    if (title && String(title.textContent || '').indexOf('设置') < 0) return null;
    return document.querySelector('.mobile-scroll');
  }

  function chatGroup() {
    var titles = document.querySelectorAll('.settings-groupTitle');
    for (var i = 0; i < titles.length; i++) {
      var text = String(titles[i].textContent || '');
      if (text.indexOf('对话') >= 0) return titles[i].closest('ul');
    }
    return null;
  }

  function build() {
    var li = document.createElement('li');
    // 注意：必须是 div，不能是 button —— <select> 嵌在 <button> 里是非法 HTML，
    // 而且 button 的点击会与下拉冲突。行本身不再是「点了就切换」的按钮。
    var row = document.createElement('div');
    row.className = 'settings-row dm-sendmode-row';
    row.id = 'dm-sendmode-row';

    var icon = document.createElement('span');
    icon.className = 'card-icon dm-sendmode-icon';
    // 图标：单色内联 SVG 纸飞机（发送的通用语义），stroke 用 currentColor 继承
    // 本行图标的灰色 --text-secondary，与设置页其它行的单色图标一致。
    // 不要用箭头类字符（如 U+21A9）：它在部分浏览器/字体下会被渲染成彩色 emoji，
    // 语义也不是「发送」。
    icon.innerHTML =
      '<span aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M21 3 3 10.5l7 2.2L12.2 21 21 3Z"/>' +
      '<path d="M10 12.7 21 3"/>' +
      '</svg>' +
      '</span>';

    var main = document.createElement('span');
    main.className = 'card-main';
    var title = document.createElement('span');
    title.className = 'card-title';
    var titleText = document.createElement('span');
    titleText.className = 'card-titleText';
    titleText.textContent = '发送模式';
    title.appendChild(titleText);
    var desc = document.createElement('span');
    desc.className = 'card-desc dm-sendmode-desc';
    desc.id = 'dm-sendmode-desc';
    main.appendChild(title);
    main.appendChild(desc);

    // 右侧操作区：真·原生 <select>，复用 bundle 的 .settings-input 外观。
    var action = document.createElement('span');
    action.className = 'card-action dm-sendmode-action';
    var select = document.createElement('select');
    select.className = 'settings-input dm-sendmode-select';
    select.id = 'dm-sendmode-select';
    select.setAttribute('aria-label', '发送模式');
    for (var i = 0; i < OPTIONS.length; i++) {
      var opt = document.createElement('option');
      opt.value = OPTIONS[i].value;
      opt.textContent = OPTIONS[i].text;
      select.appendChild(opt);
    }
    action.appendChild(select);

    row.appendChild(icon);
    row.appendChild(main);
    row.appendChild(action);
    li.appendChild(row);
    return li;
  }

  function current() {
    return window.__dmSendMode && typeof window.__dmSendMode.get === 'function'
      ? window.__dmSendMode.get()
      : 'queue';
  }

  // paint() 是唯一的显示出口：desc 文字 + 下拉选中项 + aria-label，
  // dm:sendmode 事件（含别的设备改了值）也走这里，所以下拉会跟着变。
  function paint() {
    var row = document.getElementById('dm-sendmode-row');
    if (!row) return;
    var m = current();
    if (m !== 'steer') m = 'queue';
    var select = document.getElementById('dm-sendmode-select');
    var desc = document.getElementById('dm-sendmode-desc');
    if (select && select.value !== m) select.value = m;
    if (desc) desc.textContent = LABELS[m] || LABELS.queue;
    row.setAttribute('aria-label', '发送模式：' + SHORT[m]);
  }

  function ensure() {
    var scroll = settingsPage();
    if (!scroll) return;
    var row = document.getElementById('dm-sendmode-row');
    if (row) { paint(); return; }

    var li = build();
    var group = chatGroup();
    if (group) group.appendChild(li);
    else scroll.appendChild(li);
    paint();

    var select = document.getElementById('dm-sendmode-select');
    if (!select) return;
    if (!window.__dmSendMode) { select.disabled = true; return; }

    // 只有下拉能改值：点击行不再切换。
    select.addEventListener('click', function (e) { e.stopPropagation(); });
    select.addEventListener('change', function () {
      var next = select.value === 'steer' ? 'steer' : 'queue';
      select.disabled = true;
      window.__dmSendMode.set(next).then(function () {
        select.disabled = false;
        paint();
        flash();
      }, function () {
        select.disabled = false;
        paint(); // 失败就回滚到宿主真值
      });
    });
  }

  // 一行提示：复用 bundle 自带的 settings-saved 样式，不新增全局样式。
  function flash() {
    var scroll = settingsPage();
    if (!scroll) return;
    var tip = document.createElement('p');
    tip.className = 'mobile-pad settings-saved';
    tip.setAttribute('role', 'status');
    tip.textContent = '已保存';
    scroll.insertBefore(tip, scroll.firstChild);
    setTimeout(function () { if (tip.parentNode) tip.parentNode.removeChild(tip); }, 1600);
  }

  window.addEventListener('dm:sendmode', paint);
  setInterval(ensure, 500);
  ensure();
})();
</script>`

// 排队消息的位置（需求 C）：让 bundle 的 .queue-dock 显示在聊天工具栏（.chat-tools）
// 那一行**上面**，但绝不移动节点本身。
//
// 这个节点是 React 持有的：Ho() 被渲染成 .chat-composer 的第一个子元素。旧实现用
// insertBefore 把它挪到 .chat-tools 之前，队列清空时 React 仍按「原父节点」做
// removeChild，而节点早已不在那里 → `Failed to execute 'removeChild' on 'Node'`
// → 整棵 React 树卸载，整页白屏。所以位置改用纯 CSS 表达，DOM 树一个节点都不动。
//
// 做法：节点留在 .chat-composer 里，由 theme.css 把它 position:absolute 到
// composer 上方；本脚本只量高度，把「工具栏（含运行状态条）+ 8px」写进根节点的
// --dm-queue-lift。绝对定位的包含块就是 position:relative 的 .chat-composer：
//   · 键盘弹起 / composer 变高时自动跟随，不用读 visualViewport；
//   · 滚动消息区不影响它（composer 不在滚动容器里），不需要 scroll 监听；
//   · 不占文档流，所以没有排队项时一点空白都不留。
// 没有 .queue-dock（Ho() 返回 null）时本脚本什么都不做。
const QUEUE_DOCK_PLACE_HTML = `<script>
(function () {
  try {
    if (!document.documentElement || window.__dmQueueDock) return;
    window.__dmQueueDock = true;

    var root = document.documentElement;
    var raf = 0;
    var last = -1;
    var lastSpace = -1;

    function composer() { return document.querySelector('.chat-composer'); }
    function dock() { return document.querySelector('.chat-composer > .queue-dock[data-queue-dock]'); }
    function tools() { return document.querySelector('.chat-tools'); }

    // 工具栏上方可能还有一条运行状态条（.chat-status-strip：任务 / 后台任务 / 子代理）。
    // dock 要排在整摞底栏控件的上面，否则会正好盖住那一行。只认这一个 class，并且它
    // 必须是 .chat-tools 的前一个兄弟（bundle 的渲染顺序）；隐藏（尺寸为 0）时不算。
    function topOfStack(t) {
      var top = t.getBoundingClientRect().top;
      var prev = t.previousElementSibling;
      if (prev && prev.classList && prev.classList.contains('chat-status-strip')) {
        var r = prev.getBoundingClientRect();
        if (r.height > 0 && r.width > 0 && r.top < top) top = r.top;
      }
      return top;
    }

    function update() {
      raf = 0;
      var c = composer();
      if (!c) return;
      var d = dock();
      if (!d) return;             // 没有排队消息：Ho() 返回 null，不留任何空白
      var t = tools();
      if (!t || !t.parentNode) return;
      var cr = c.getBoundingClientRect();
      var tr = t.getBoundingClientRect();
      // 布局不认识（页面切换中、工具栏被隐藏）时保持上一次的有效值，不写坏变量。
      if (cr.width <= 0 || cr.height <= 0 || tr.width <= 0) return;
      var lift = Math.round(cr.top - topOfStack(t) + 8);
      if (!isFinite(lift) || lift <= 0 || lift > 600) return;
      // 给消息区补的底部留白 = dock 自身高度 + 8px：dock 是浮层，不补的话
      // 滚到最底时最后一条消息会被它盖住。dock 消失后 :has() 规则整体失效，
      // 不占任何空间，所以这里的旧值不用清。
      var space = Math.round(d.getBoundingClientRect().height + 8);
      if (space > 0 && space !== lastSpace) {
        lastSpace = space;
        root.style.setProperty('--dm-queue-space', space + 'px');
      }
      if (lift === last) return;
      last = lift;
      root.style.setProperty('--dm-queue-lift', lift + 'px');
    }

    function schedule() {
      if (raf) return;
      raf = (window.requestAnimationFrame || function (fn) { return setTimeout(fn, 16); })(update);
    }

    // 队列出现/消失、状态条出现、键盘压缩工具栏……都会动到高度：Observer 覆盖结构变化，
    // resize 覆盖视口变化。rAF 合并，同一帧里只量一次。
    try {
      var mo = new MutationObserver(schedule);
      mo.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'hidden']
      });
    } catch (e) {}
    window.addEventListener('resize', schedule);
    // 兜底：字体加载 / 工具栏内部换行等不产生上述变化的情况；低频，开销可忽略。
    setInterval(schedule, 1000);
    update();
  } catch (e) {}
})();
</script>`

// 聊天状态词 + 「输出中」行的鲸鱼尾（需求：手机上两处微调）。
//
// 1) 过程卡的状态词：bundle 把状态词渲染成 <span class="chat-proc-state">深度求索中</span>
//    （另外三个是 已完成 / 已中断 / 失败）。整个折叠块展示的本来就是思考过程，叫
//    「深度求索中」不准确 —— 这里在运行时把该 span 里的文本节点改成「思考中」。
//    只认这两个 class 与这个词，正文里的同名词不会被误伤；React 以后把状态改成
//    已完成/失败时会照常覆盖 nodeValue，所以替换必须每次走一遍（Observer + 幂等）。
//
// 2) 底部 <div class="chat-turn-status"> 状态行在输出时渲染「输出中」+ 三个呼吸点。
//    鲸鱼尾挂在折叠块图标位置不直观，改成插在这一行文字前面；只在「输出中」时出现，
//    「后台处理中 / 连接中断」不显示。鲸鱼尾复用 .dm-whale 的 mask + currentColor
//    （见 theme.css），颜色自动继承该行的 var(--accent)。
//
// 3) 工具栏上方的运行状态条 .chat-status-strip 会把「子代理 N 个运行中」拼进
//    .chat-status-text（bundle: parts.push('子代理 ' + i + ' 个运行中')）。工具栏
//    已经有带数字角标的子代理图标，这段文字冗余：按 ` · ` 拆段后丢掉「子代理 …」
//    段，其余（任务 x/y、后台任务 N 个）原样拼回；若过滤后整条为空，则隐藏整条
//    strip。React 重渲染把原文案写回来时，Observer 会再过滤一遍。
//
// 全程幂等：每次 flush 先看现状再动 DOM，自己触发的 mutation 不会造成循环。
const CHAT_STATUS_HTML = `<script>
(function () {
  try {
    if (!document.body) return;

    var PROC_STATE = '.chat-proc-state';
    var TURN = '.chat-turn-status';
    var TURN_CLASS = 'chat-turn-status';
    var FROM = '深度求索中';   // bundle 里 Mc.running
    var TO = '思考中';
    var WHALE = 'dm-turn-whale';
    var RUNNING = '输出中';
    // 用户要求：底部状态行文案由「输出中」改成「深度求索中」（与过程卡用词统一）。
    // 只换**可见文本**；aria-label 仍是 bundle 写的「输出中」，鲸鱼尾/状态判定
    // 两种写法都认（见 turnState 的归一化）。
    var RUNNING_TEXT = '深度求索中';
    // 原始 SSE 收到当前会话的 turn/end 后置位，下一轮 turn/start 复位（见 §5）。
    // 只在「turn/end 被 fold 丢掉、状态行卡在输出中」时起作用，正常回合用不到。
    var TURN_ENDED = false;

    function trim(s) {
      return (s || '').replace(/^\\s+|\\s+$/g, '');
    }

    // ── 1) 状态词：只改 .chat-proc-state 下「恰好是这个词」的文本节点 ───────
    // 不写 el.textContent：React 持有那个文本节点实例，重写会把它摘掉，
    // 之后状态变化就更新不到 DOM 了。直接把 nodeValue 改掉，实例仍在原位。
    function renameProcState() {
      var list = document.querySelectorAll(PROC_STATE);
      for (var i = 0; i < list.length; i++) {
        var kids = list[i].childNodes;
        for (var k = 0; k < kids.length; k++) {
          var n = kids[k];
          if (n.nodeType !== 3) continue;
          var v = n.nodeValue;
          if (v === FROM) n.nodeValue = TO;
          // 容错：万一前后带了空白（不会出现在当前 bundle 里），保留空白只换词。
          else if (v && trim(v) === FROM) n.nodeValue = v.replace(FROM, TO);
        }
      }
    }

    // ── 2) 「输出中」行的鲸鱼尾 ────────────────────────────────────────────
    function ownWhale(row) {
      for (var i = 0; i < row.childNodes.length; i++) {
        var n = row.childNodes[i];
        if (n.nodeType === 1 && n.classList && n.classList.contains(WHALE)) return n;
      }
      return null;
    }

    // 状态词只从 aria-label / 纯文本取（呼吸点是没有文字的 span，读不出来）。
    // aria-label 是 bundle 同步写的（输出中 / 后台处理中 / 连接中断），最可靠；
    // 万一以后没了 aria-label，再退回文本节点。
    function turnState(row) {
      var label = row.getAttribute && row.getAttribute('aria-label');
      var v = label ? trim(label) : '';
      if (v === '') {
        var kids = row.childNodes;
        for (var i = 0; i < kids.length; i++) {
          if (kids[i].nodeType === 3) v += kids[i].nodeValue;
        }
        v = trim(v);
      }
      // 「输出中」是 bundle 的原文案；状态行文字会被 §2b 改成「深度求索中」，
      // 两种写法都视为运行中，鲸鱼尾逻辑不用改。
      if (v === RUNNING_TEXT) return RUNNING;
      return v;
    }

    // ── 2b) 状态行文案：输出中 → 深度求索中 ──────────────────────────────
    // 只改文本节点的 nodeValue（React 持有该节点，重写 textContent 会让它失联），
    // 呼吸点（.chat-turn-dots）是元素、不受影响。React 写回原文案时 Observer 再改。
    function renameTurnText() {
      var rows = document.querySelectorAll(TURN);
      for (var i = 0; i < rows.length; i++) {
        var kids = rows[i].childNodes;
        for (var k = 0; k < kids.length; k++) {
          var n = kids[k];
          if (n.nodeType !== 3) continue;
          if (trim(n.nodeValue) === RUNNING && n.nodeValue !== RUNNING_TEXT) {
            n.nodeValue = RUNNING_TEXT;
          }
        }
      }
    }

    function syncTurn() {
      var rows = document.querySelectorAll(TURN);
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var whale = ownWhale(row);
        var show = !TURN_ENDED && turnState(row) === RUNNING;
        if (show && !whale) {
          var w = document.createElement('span');
          // 空元素：形状由 theme.css 的 mask 画、颜色由 currentColor 给。
          w.className = 'dm-whale ' + WHALE;
          w.setAttribute('aria-hidden', 'true');
          row.insertBefore(w, row.firstChild);
        } else if (!show && whale) {
          row.removeChild(whale);
        }
      }
      sweepWhales();
    }

    // 全局兜底（不依赖状态行还在我们以为的位置上）：
    //   · 状态行被 React 移除 / 换成别的节点后，若鲸鱼尾还连着，父容器已不是
    //     「输出中」状态行 —— 摘掉；
    //   · 同一行被重复插入了第二只 —— 只保留第一只；
    //   · 原始 SSE 已报过 turn/end —— 状态行哪怕还卡在「输出中」也不留鲸鱼尾。
    // 每次 flush 都跑，幂等；自己 remove 的节点不会再次命中。
    function sweepWhales() {
      var all = document.querySelectorAll('.' + WHALE);
      var keptRow = null;
      for (var i = 0; i < all.length; i++) {
        var w = all[i];
        var row = w.parentNode;
        var ok = !TURN_ENDED && row && row.nodeType === 1 &&
          row.classList && row.classList.contains(TURN_CLASS) &&
          turnState(row) === RUNNING;
        if (ok && keptRow !== row) {
          keptRow = row;
          continue;
        }
        if (w.parentNode) w.parentNode.removeChild(w);
      }
    }

    // ── 3) 状态条去掉「子代理 N 个运行中」段 ──────────────────────────────
    // 只认 bundle 的固定文案：以「子代理 」开头，且以「 个运行中」或「 个」结尾。
    // 「任务 1/2」「后台任务 1 个(运行中)」不以这个前缀开头，原样保留。
    var STATUS_TEXT = '.chat-status-text';
    var STATUS_STRIP = '.chat-status-strip';
    var STATUS_SEP = ' · ';
    var STATUS_HIDDEN = 'data-dm-status-hidden';

    function isSubagentPart(part) {
      return part.indexOf('子代理 ') === 0 &&
        (/ 个运行中$/.test(part) || / 个$/.test(part));
    }

    // null = 没有子代理段（不用动 DOM）；'' = 整条都该去掉；其它 = 过滤后的文本。
    function filterStatus(raw) {
      var parts = raw.split(STATUS_SEP);
      var kept = [];
      var dropped = false;
      for (var i = 0; i < parts.length; i++) {
        if (isSubagentPart(parts[i])) {
          dropped = true;
          continue;
        }
        kept.push(parts[i]);
      }
      if (!dropped) return null;
      return kept.length ? kept.join(STATUS_SEP) : '';
    }

    // 只改 React 持有的那个文本节点的 nodeValue；不 replaceChild、不写 textContent，
    // 否则 React 之后的重渲染会写到被摘掉的旧节点上，DOM 就再也不更新了。
    function writeStatusText(el, text) {
      var first = null;
      var kids = el.childNodes;
      for (var i = 0; i < kids.length; i++) {
        if (kids[i].nodeType !== 3) continue;
        if (!first) first = kids[i];
        else if (kids[i].nodeValue) kids[i].nodeValue = '';
      }
      if (first) {
        if (first.nodeValue !== text) first.nodeValue = text;
      } else if (text) {
        el.appendChild(document.createTextNode(text));
      }
    }

    // 显隐只撤销自己设的那一次，避免和 bundle / CSS 自己的显示规则打架。
    function setStripHidden(strip, hide) {
      if (!strip) return;
      if (hide) {
        if (strip.style.display !== 'none') strip.style.display = 'none';
        if (strip.getAttribute(STATUS_HIDDEN) === null) {
          strip.setAttribute(STATUS_HIDDEN, '');
        }
      } else if (strip.getAttribute(STATUS_HIDDEN) !== null) {
        strip.style.display = '';
        strip.removeAttribute(STATUS_HIDDEN);
      }
    }

    // 幂等：自己写回的文本不含「子代理 」，下一轮什么都不做；React 若把原文案
    // 写回来，Observer 会再进来过滤一次，两边不会互相触发成死循环。
    function syncStatusText() {
      var list = document.querySelectorAll(STATUS_TEXT);
      for (var i = 0; i < list.length; i++) {
        var el = list[i];
        var raw = el.textContent || '';
        var next = filterStatus(raw);
        var strip = el.closest ? el.closest(STATUS_STRIP) : null;
        if (next === null) {
          // 已经是不含子代理段的文案：若之前整条被藏起来，这时恢复显示。
          if (raw) setStripHidden(strip, false);
          continue;
        }
        writeStatusText(el, next);
        setStripHidden(strip, next === '');
      }
    }

    // ── 4) 去掉过程卡里重复的「思考中」 ───────────────────────────────────
    // 过程卡 head 有两行：
    //   第一行 .chat-proc-line.chat-proc-label → .chat-proc-state（状态词，已改成「思考中」）
    //   第二行 .chat-proc-line.chat-proc-current → .chat-proc-current-text（当前步骤）
    // 思考阶段两行都是「思考中」，同一个词出现两次。
    //
    // **不能整行隐藏**：原来把第二行 display:none 掉，思考时卡片矮一行、工具调用一来
    // 第二行又冒出来，视觉上就是「突然多出一行」——卡片高度来回跳。
    // 现在的做法是只隐藏**第一行里那个重复的状态词文字**（图标/用时都留着，行高不变），
    // 于是：
    //   · 思考阶段：第一行的「思考中」隐去，第二行的「思考中」可见 → 只出现一次，高度不变
    //   · 工具阶段：第一行「思考中」恢复，第二行变成「运行命令」→ 两行共存，高度也不变
    // 挂自己的 class + CSS display:none，不动 React 的节点与文字。
    var CUR_LINE = '.chat-proc-current';
    var CUR_TEXT = '.chat-proc-current-text';
    var DUP = 'dm-proc-dup';

    function dedupeProcCurrent() {
      var heads = document.querySelectorAll('.chat-proc-head');
      for (var i = 0; i < heads.length; i++) {
        var head = heads[i];
        var state = head.querySelector(PROC_STATE);
        var cur = head.querySelector(CUR_LINE);
        if (!state) continue;
        // 运行中（有当前步骤行）时，把第一行**整行**藏起来 —— 那一行是
        // 「沙漏图标 + 状态词 + 用时」，运行中只留下面那行动态状态（图标随步骤变），
        // 否则会出现「沙漏占一行 + 动态行又一行」的两层图标。
        // 回合结束后 bundle 会移除 .chat-proc-current，这里自然回到
        // 「✓ 已完成 · 用时 N 秒」的原样；两种状态下 head 都是一行高，不会跳。
        var line = state;
        while (line && line.nodeType === 1 && !line.classList.contains('chat-proc-label')) {
          line = line.parentNode;
        }
        if (!line || line.nodeType !== 1) line = null;
        var target = line || state;
        if (cur && !target.classList.contains(DUP)) target.classList.add(DUP);
        else if (!cur && target.classList.contains(DUP)) target.classList.remove(DUP);
      }
    }

    // ── 4b) 当前步骤 → 进行时中文（单行动态状态 + 图标随步骤变）────────────
    // bundle 给 .chat-proc-current-text 的是**动作名**：「思考中」「运行命令」
    // 「写入」「读取」「编辑」「搜索内容」「查找文件」「抓取网页」「联网搜索」
    // 「查看图片」「运行代码」「工具」…… 用户希望看到「正在做什么」的进行时说法：
    //     思考中 / 调用工具中 / 写入文件中 / 执行命令中 / 读取文件中 / 搜索中 ……
    // 只改文本节点的 nodeValue（不写 textContent、不 replaceChild），React 若写回
    // 原文案，MutationObserver 会再改一次；值已经对就不动，避免自激循环。
    var STEP_TEXT = '.chat-proc-current-text';
    var STEP_LABELS = {
      '思考中': '思考中',
      '正在回答': '正在回答',
      '运行命令': '执行命令中',
      '运行代码': '运行代码中',
      '写入': '写入文件中',
      '编辑': '编辑文件中',
      '读取': '读取文件中',
      '搜索': '搜索中',
      '搜索内容': '搜索中',
      '查找文件': '查找文件中',
      '抓取网页': '抓取网页中',
      '联网搜索': '联网搜索中',
      '查看图片': '查看图片中',
      '工具': '调用工具中',
      '调用工具': '调用工具中'
    };

    function progressiveStep() {
      var nodes = document.querySelectorAll(STEP_TEXT);
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        var kids = el.childNodes;
        for (var k = 0; k < kids.length; k++) {
          var n = kids[k];
          if (n.nodeType !== 3) continue;
          var raw = trim(n.nodeValue || '');
          if (raw === '') continue;
          // 已经是进行时（以「中」结尾）就不用再改，避免「执行命令中中」。
          if (/中$/.test(raw)) continue;
          var next = STEP_LABELS[raw];
          if (next === undefined) next = raw + '中';   // 未知动作：兜底加「中」
          if (n.nodeValue !== next) n.nodeValue = next;
        }
      }
    }

    // ── 5) 原始 SSE 的 turn/end：状态行卡住时也要摘掉鲸鱼尾 ────────────────
    // bundle 的 mux 只 fold seq 大于水位的事件；一旦 turn/end 被当成旧事件丢掉，
    // 它的 live-turn 状态就永远为 true —— 状态行不消失、aria-label 一直是
    // 「输出中」，只靠 §2 的 DOM 判据永远清不掉鲸鱼尾，只能刷新网页。
    // 这里旁听 /m/api/events.mux 的原始 SSE 帧：收到当前会话的 turn/end 就把
    // TURN_ENDED 置位，下一次 flush 摘掉鲸鱼尾；turn/start 复位。
    // 只 addEventListener，不碰 onmessage / onerror / close，也不改事件数据；
    // 解析前先做子串预判，流式 chunk 不会额外 JSON.parse。
    // 会话假设：mux 一次只 observe 当前会话，所以它的 session/event 都属于本页。
    function watchTurnEnd() {
      var Native = window.EventSource;
      if (!Native || Native.__dmWhalePatched) return;
      function Wrapped(url, opts) {
        var es = new Native(url, opts);
        try {
          if (String(url).indexOf('/events.mux') >= 0) {
            es.addEventListener('message', function (ev) {
              var data = ev && ev.data;
              if (typeof data !== 'string') return;
              if (data.indexOf('turn/end') < 0 && data.indexOf('turn/start') < 0) return;
              var msg;
              try { msg = JSON.parse(data); } catch (e) { return; }
              var event = msg && msg.event;
              if (!event || msg.type !== 'session/event') return;
              if (event.type === 'turn/start') {
                if (TURN_ENDED) { TURN_ENDED = false; schedule(); }
              } else if (event.type === 'turn/end') {
                if (!TURN_ENDED) { TURN_ENDED = true; schedule(); }
              }
            });
          }
        } catch (e) {}
        return es;
      }
      try {
        Wrapped.prototype = Native.prototype;
        if (Native.CONNECTING !== undefined) Wrapped.CONNECTING = Native.CONNECTING;
        if (Native.OPEN !== undefined) Wrapped.OPEN = Native.OPEN;
        if (Native.CLOSED !== undefined) Wrapped.CLOSED = Native.CLOSED;
        Wrapped.__dmWhalePatched = true;
        window.EventSource = Wrapped;
      } catch (e) {}
    }

    function flush() {
      queued = false;
      try { renameProcState(); } catch (e) {}
      try { dedupeProcCurrent(); } catch (e) {}
      try { progressiveStep(); } catch (e) {}
      try { renameTurnText(); } catch (e) {}
      try { syncTurn(); } catch (e) {}
      try { syncStatusText(); } catch (e) {}
    }

    var queued = false;
    function schedule() {
      if (queued) return;
      queued = true;
      if (window.requestAnimationFrame) window.requestAnimationFrame(flush);
      else window.setTimeout(flush, 0);
    }

    var mo = new MutationObserver(schedule);
    // characterData 覆盖状态词变化（React 只改 nodeValue），childList 覆盖
    // 行/折叠块的挂载与卸载，aria-label 覆盖状态行自身的状态切换。
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['aria-label']
    });
    // 必须在 bundle 的模块脚本执行前装上（本脚本是内联 classic，早于 deferred
    // module），这样 mux 的 new EventSource 才会经过我们的包装。
    watchTurnEnd();
    schedule();
  } catch (e) {}
})();
</script>`

// ── 发送时的「图片解码竞态」守卫（注入脚本，必须在 bundle 之前执行）───────────
// bundle 选图后是异步解码/压缩的（FileReader → Image → canvas 重编码到 256KB 内）：
//     ni = useCallback(e => { qi(e).then(({ image }) => Qe(t => [...t, image])) }, [])
// 而发送回调 ri() 读的是「此刻」已附加的数组 Ze。用户在解码完成前点发送时：
//   · 有文字 → ri() 照常发送，content 里只有 text，图片静默丢失（连 toast 都没有）；
//   · 没文字 → ri() 直接 return，这一下点击完全没有反应。
// 实测（CPU 6x 节流模拟手机）：3.1MB 照片解码+压缩 ~0.9s，14MB 高熵图 ~3.0s；
// 选图后 20–30ms 内点发送，请求体 content 就只有 ["text"]。手机上「选完图顺手点
// 发送」是常见操作，所以这条路径会间歇性丢图 —— 而且比「误报离线」更隐蔽，
// 因为它不弹任何提示。
//
// 注入脚本改不了 bundle 的内部状态，但可以拦住「发送」这个动作本身：
//   · 选图（file input 的 change）或粘贴图片时，把待解码张数记在 pending 里；
//   · 待发送栏 .chat-attach-item 每出现一张，pending 减一；解码失败的 toast
//     （「该图片无法解码」「最多附加 4 张图片」）也减一，避免永久挂住；
//   · pending > 0 时在 window 捕获阶段吞掉「发送」点击 / 回车，解码完成后自动
//     重放一次点击（btn.click() 是真实 DOM 事件，React 的委托监听照样收得到）。
// 代价：解码期间点发送会晚 1~3 秒才真正发出（超过 10s 兜底放行，不会卡死）；
// 等待超过 0.4s 才插一条 toast 说明原因。解码已完成（绝大多数情况）时 pending
// 为 0，这层拦截完全不介入，行为与原来一致。
// 注意：整段是模板字面量，里面不要出现反引号和反斜杠（`\` 会被吞掉）。
const SEND_DECODE_GUARD_HTML = `<script>
(function () {
  try {
    // 解码迟迟不回来（超大图/低端机）也要把消息放出去，不能永久卡住发送。
    var MAX_HOLD_MS = 10000;
    // 等这么久还没发出去才插说明，小图几十毫秒就解码完，不要闪一下。
    var HINT_AFTER_MS = 400;
    var pending = 0;
    var pendingAt = 0;
    var baseline = 0;
    var polling = false;
    var waiting = false;
    var replaying = false;
    var hint = null;
    var seenToasts = typeof WeakSet === 'function' ? new WeakSet() : null;

    function attachCount() {
      try {
        return document.querySelectorAll('.chat-attach-item').length;
      } catch (e) {
        return baseline;
      }
    }

    function syncAttach() {
      var now = attachCount();
      if (now > baseline) pending = Math.max(0, pending - (now - baseline));
      baseline = now;
    }

    function scanToasts() {
      if (seenToasts === null) return;
      var list = document.querySelectorAll('.toast');
      for (var i = 0; i < list.length; i++) {
        var t = list[i];
        if (seenToasts.has(t)) continue;
        seenToasts.add(t);
        var s = t.textContent || '';
        if (s.indexOf('无法解码') >= 0 || s.indexOf('最多附加') >= 0) {
          pending = Math.max(0, pending - 1);
        }
      }
    }

    function startPoll() {
      if (polling) return;
      polling = true;
      var timer = setInterval(function () {
        syncAttach();
        scanToasts();
        // 切走会话 / 退出聊天页时待发送栏整个消失，解码结果不会再来 ——
        // 不能把它当成「仍在解码」，否则下一条消息会被一直挂住。
        if (composerGone()) pending = 0;
        if (pending <= 0) {
          clearInterval(timer);
          polling = false;
        }
      }, 120);
    }

    function composerGone() {
      try {
        return document.querySelector('textarea.chat-input') === null;
      } catch (e) {
        return false;
      }
    }

    function addPending(n) {
      if (!(n > 0)) return;
      syncAttach();
      pending += n;
      pendingAt = Date.now();
      startPoll();
    }

    // 选图和「粘贴图片」都走 bundle 里同一个异步解码函数 ni()。
    document.addEventListener('change', function (e) {
      var t = e.target;
      if (t === null || t.tagName !== 'INPUT' || t.type !== 'file') return;
      addPending(t.files === null || t.files === undefined ? 0 : t.files.length);
    }, true);

    document.addEventListener('paste', function (e) {
      try {
        var dt = e.clipboardData;
        if (dt === null || dt === undefined || dt.items === null || dt.items === undefined) return;
        var n = 0;
        for (var i = 0; i < dt.items.length; i++) {
          var it = dt.items[i];
          if (it !== null && it.kind === 'file' && (it.type || '').indexOf('image/') === 0) n++;
        }
        addPending(n);
      } catch (err) {}
    }, true);

    function isPending() {
      if (pending <= 0) return false;
      if (Date.now() - pendingAt > MAX_HOLD_MS) {
        pending = 0;
        return false;
      }
      return true;
    }

    function sendButton() {
      try {
        var b = document.querySelector('.chat-send');
        if (b === null) return null;
        // 会话在跑的时候这个按钮是「停止」，绝不能拦。
        if (b.getAttribute('aria-label') !== '发送') return null;
        return b;
      } catch (e) {
        return null;
      }
    }

    function showHint() {
      if (hint !== null) return;
      try {
        var host = document.createElement('div');
        host.className = 'toast-host';
        host.setAttribute('role', 'status');
        var item = document.createElement('div');
        item.className = 'toast';
        item.textContent = '图片处理中，马上发送…';
        host.appendChild(item);
        document.body.appendChild(host);
        hint = host;
      } catch (e) {
        hint = null;
      }
    }

    function hideHint() {
      if (hint === null) return;
      try {
        if (hint.parentNode !== null) hint.parentNode.removeChild(hint);
      } catch (e) {}
      hint = null;
    }

    function chatInput() {
      try {
        return document.querySelector('textarea.chat-input');
      } catch (e) {
        return null;
      }
    }

    // 重放一次「发送」。两种发送态要用两种入口，不能用同一个按钮：
    //   · Agent 空闲：.chat-send 的 aria-label 是「发送」，点它 = bundle 的 ri()；
    //   · Agent 在跑：.chat-send 变成「停止」，点它等于取消这一轮 —— 绝不能点。
    //     此时唯一的发送入口是输入框的回车（bundle 的 onKeyDown → ri()，mode:'queue'，
    //     宿主会把消息排进队列），所以补发一个真实的 Enter 键盘事件。
    // 旧实现只有「点按钮」一条路：排队发送被拦下后 sendButton() 恒为 null，于是每次
    // 都在这里静默放弃 —— 这一下回车凭空消失，文字和图片都留在输入框里。
    function replaySend(origin) {
      // 输入框必须是当初被拦下的那个节点：用户在这几百毫秒里切走会话时 React 会换掉
      // 整个 composer，这时重放会把「上一句」发到新会话里去 —— 宁可不发。
      var ta = chatInput();
      if (origin !== undefined && ta !== origin) return;
      replaying = true;
      try {
        var btn = sendButton();
        if (btn !== null && btn.disabled !== true) {
          btn.click();
          return;
        }
        if (ta === null) return;
        var ev;
        try {
          ev = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true
          });
        } catch (e) {
          ev = document.createEvent('KeyboardEvent');
          ev.initKeyboardEvent('keydown', true, true, window, 'Enter', 0, '', false, '');
        }
        ta.dispatchEvent(ev);
      } finally {
        replaying = false;
      }
    }

    function holdAndSend() {
      if (waiting) return;
      var origin = chatInput();
      if (origin === null) return;
      waiting = true;
      var started = Date.now();
      var hintTimer = setTimeout(function () {
        if (waiting) showHint();
      }, HINT_AFTER_MS);
      var tick = function () {
        // 收手条件只有一个：输入框没了或被换掉（切走会话/退出聊天页）。**不能**用
        // 「发送按钮不在」当收手条件 —— Agent 在跑时它本来就是「停止」键，而排队
        // 发送走的正是回车，收手就等于把这次发送吞掉。
        if (chatInput() !== origin) {
          waiting = false;
          clearTimeout(hintTimer);
          hideHint();
          return;
        }
        if (isPending() && Date.now() - started <= MAX_HOLD_MS + 500) {
          setTimeout(tick, 80);
          return;
        }
        waiting = false;
        clearTimeout(hintTimer);
        hideHint();
        // 重放前重新查一次：等待期间 React 可能已经换过节点 / 换过发送态。
        replaySend(origin);
      };
      setTimeout(tick, 80);
    }

    window.addEventListener('click', function (e) {
      try {
        if (replaying) return;
        var t = e.target;
        if (t === null || typeof t.closest !== 'function') return;
        if (t.closest('.chat-send') === null) return;
        if (sendButton() === null) return;
        if (!isPending()) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        holdAndSend();
      } catch (err) {}
    }, true);

    // 回车发送（设置项 mobileEnterToSend）：bundle 把该设置写进了 textarea 的
    // enterkeyhint（send / enter），用它判断这一下回车到底是不是「发送」。
    window.addEventListener('keydown', function (e) {
      try {
        if (replaying) return;
        if (e.key !== 'Enter' || e.shiftKey === true || e.isComposing === true) return;
        var t = e.target;
        if (t === null || t.tagName !== 'TEXTAREA') return;
        if (String(t.className).indexOf('chat-input') < 0) return;
        if (t.getAttribute('enterkeyhint') !== 'send') return;
        if (!isPending()) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        holdAndSend();
      } catch (err) {}
    }, true);
  } catch (e) {}
})();
</script>`

/**
 * 会话模式状态图标（只读）。
 *
 * 用户明确要求：聊天页**只显示状态**。模式只在「新建会话」时选择（会话列表页的
 * Agent 模式卡片 → session.create({agentPreset})）；会话一旦建立，宿主的
 * agentPresets.select() 也只允许在首条消息之前改绑，之后抛 agent-preset/locked。
 * 所以聊天页不再提供任何切换入口：
 *   · 常驻 .chat-tools（发送按钮上方那一行），有没有消息都显示；
 *   · standard / ptc / minimal / cordis 四套单色描边图标，靠形状区分；
 *   · aria-label / title = 「当前模式：<中文名>」；
 *   · 点击只弹一条只读提示，不弹列表、不调用任何写 RPC。
 *
 * 真值来源（按优先级，绝不伪造）：
 *   ① session.list 每条会话的 projections.values.agentPreset —— 宿主对所有会话
 *      都算了这个投影，一次请求就能拿到全量映射，最省也最稳；
 *   ② 该会话 session.history 的 projections.values.agentPreset（列表里没有时兜底）；
 *   ③ 仍然取不到 → standard（宿主默认）。
 *
 * 原 PRESET_BTN_HTML（空白会话可点击切换）仍在页面上，它负责把按钮插进
 * #dm-tools、并把自己的图标写进 innerHTML。本脚本：
 *   · 每 300ms 与 MutationObserver 双保险地把图标/文案改回「当前模式」；
 *   · 用**捕获阶段**的 click 拦截，抢先消掉原脚本的切换面板（不再有切换入口）。
 */
const PRESET_STATUS_HTML = `<script>
(function () {
  try {
    if (window.__dmPresetStatus) return;
    window.__dmPresetStatus = true;

    // 中文名以需求表为准（宿主 preset 定义只有 id/order）。
    var NAMES = { standard: '默认模式', ptc: 'PTC 模式', minimal: '最简模式', cordis: '工具创造模式' };

    // 四套单色描边图标：同一 24×24 坐标系、stroke=currentColor、1.8、round。
    var ICONS = {
      standard: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.4 3.6 7.6 12 11.8l8.4-4.2z"/><path d="M3.6 12.1 12 16.3l8.4-4.2"/><path d="M3.6 16.6 12 20.8l8.4-4.2"/></svg>',
      ptc: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.1"/><path d="M12 4.2v2.2M12 17.6v2.2M19.8 12h-2.2M6.4 12H4.2M17.5 6.5l-1.6 1.6M8.1 15.9l-1.6 1.6M17.5 17.5l-1.6-1.6M8.1 8.1 6.5 6.5"/></svg>',
      minimal: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 8.5h13M7.5 12h9M9.5 15.5h5"/></svg>',
      cordis: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2.1"/><circle cx="5.4" cy="6.6" r="1.7"/><circle cx="18.6" cy="6.6" r="1.7"/><circle cx="12" cy="19.2" r="1.7"/><path d="M10.6 10.3 6.9 7.9M13.4 10.3l3.7-2.4M12 14.1v3.4"/></svg>'
    };

    var preset = 'standard';
    var lastSid = '';
    var cache = null;        // { at, map }
    var toastTimer = 0;

    function button() { return document.getElementById('dm-preset-btn'); }
    function labelOf(id) { return NAMES[id] || id || NAMES.standard; }

    function paint(id) {
      preset = id && ICONS[id] ? id : 'standard';
      var b = button();
      if (!b) return;
      var html = ICONS[preset];
      // 只在内容确实不同时才写，避免和原脚本互相刷屏造成抖动。
      if (b.getAttribute('data-dm-preset-painted') !== preset) {
        b.innerHTML = html;
        b.setAttribute('data-dm-preset-painted', preset);
      }
      b.setAttribute('data-preset', preset);
      var t = '当前模式：' + labelOf(preset);
      if (b.getAttribute('aria-label') !== t) {
        b.setAttribute('aria-label', t);
        b.setAttribute('title', t);
      }
    }

    function rpc(method, payload) {
      return fetch('/m/api/' + method, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rpcId: 'dm-preset-status-' + Date.now(), payload: payload || {} })
      }).then(function (r) { return r.json(); }).then(function (j) { return j ? j.result : null; })
        .catch(function () { return null; });
    }

    // ① session.list 的投影（一次请求拿到全量映射，5 秒缓存）
    function fromList(sid) {
      var now = Date.now();
      if (cache && now - cache.at < 5000) return Promise.resolve(cache.map[sid] || null);
      return rpc('session.list', {}).then(function (res) {
        var items = (res && res.ok && res.value && Array.isArray(res.value.items)) ? res.value.items : [];
        var map = {};
        for (var i = 0; i < items.length; i++) {
          var it = items[i];
          var values = it && it.projections && it.projections.values;
          if (values && typeof values.agentPreset === 'string' && values.agentPreset !== '') {
            map[it.sessionId] = values.agentPreset;
          }
        }
        cache = { at: Date.now(), map: map };
        return map[sid] || null;
      });
    }

    // ② 该会话 history 的投影（列表里查不到时兜底）
    function fromHistory(sid) {
      return rpc('session.history', { sessionId: sid, maxMessages: 8 }).then(function (res) {
        var v = res && res.ok ? res.value : null;
        var values = v && v.projections && v.projections.values;
        return (values && typeof values.agentPreset === 'string' && values.agentPreset !== '')
          ? values.agentPreset : null;
      });
    }

    // 当前会话 id：URL 带就用，否则从 fetch 的 payload.sessionId 记下来。
    function currentSession() {
      try {
        var u = new URL(location.href);
        var q = u.searchParams.get('session');
        if (q) return q;
      } catch (e) {}
      return lastSid;
    }

    var origFetch = window.fetch;
    if (typeof origFetch === 'function') {
      window.fetch = function (input, init) {
        try {
          var url = typeof input === 'string' ? input : (input && input.url) || '';
          if (url.indexOf('/m/api/') >= 0 && init && typeof init.body === 'string') {
            var body = JSON.parse(init.body);
            var payload = body && body.payload;
            if (payload && typeof payload.sessionId === 'string' && payload.sessionId !== '') {
              if (lastSid !== payload.sessionId) {
                lastSid = payload.sessionId;
                // 换会话：先把图标归位到默认，再异步读真值（不显示上一个会话的模式）。
                paint('standard');
                refresh();
              }
            }
          }
        } catch (e) {}
        return origFetch.apply(this, arguments);
      };
    }

    var inFlight = '';
    function refresh() {
      var sid = currentSession();
      if (!sid || sid === inFlight) return;
      inFlight = sid;
      fromList(sid).then(function (id) {
        return id !== null ? id : fromHistory(sid);
      }).then(function (id) {
        if (currentSession() !== sid) return;   // 期间换过会话，丢弃过期结果
        paint(id === null ? 'standard' : id);
      }).catch(function () { /* 保持默认，不弹错 */ }).then(function () {
        if (inFlight === sid) inFlight = '';
      });
    }

    // 只读提示：复用 bundle 的 .toast-host / .toast，深浅主题自动跟随。
    // 这个点击路径不打开任何面板、也不发写请求 —— 聊天页不可能改变模式。
    function toast() {
      try {
        if (toastTimer) window.clearTimeout(toastTimer);
        var host = document.createElement('div');
        host.className = 'toast-host';
        host.setAttribute('role', 'status');
        var item = document.createElement('div');
        item.className = 'toast';
        item.textContent = '当前模式：' + labelOf(preset) + ' · 模式在新建会话时选择';
        host.appendChild(item);
        document.body.appendChild(host);
        toastTimer = window.setTimeout(function () {
          try { if (host.parentNode) host.parentNode.removeChild(host); } catch (e) {}
        }, 2200);
      } catch (e) {}
    }

    // 捕获阶段抢先处理：#dm-preset-btn 的点击一律只弹只读提示，
    // 原 PRESET_BTN_HTML 的切换面板（冒泡阶段监听）再也收不到这次点击。
    window.addEventListener('click', function (e) {
      var t = e.target;
      while (t && t !== document && t.id !== 'dm-preset-btn') t = t.parentNode;
      if (!t || t.id !== 'dm-preset-btn') return;
      e.preventDefault();
      e.stopImmediatePropagation();
      toast();
    }, true);

    // 原脚本会周期性重写按钮内容与 aria-label：这里盯着写回的状态图标。
    function ensure() {
      var b = button();
      if (!b) return;
      if (b.classList.contains('dm-icon-hidden')) b.classList.remove('dm-icon-hidden');
      // 原脚本在会话已开始时会给按钮加 aria-hidden="true"。按钮现在是常驻状态，
      // 必须去掉它 —— 否则读屏器会整颗忽略这个「当前模式」状态图标。
      if (b.getAttribute('aria-hidden') === 'true') b.removeAttribute('aria-hidden');
      if (b.getAttribute('data-dm-preset-painted') !== preset) paint(preset);
      if (currentSession() !== '' && preset === 'standard') refresh();
    }

    try {
      var mo = new MutationObserver(function () { ensure(); });
      mo.observe(document.documentElement || document.body, {
        childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'aria-label', 'title', 'aria-hidden']
      });
    } catch (e) {}
    setInterval(ensure, 300);
    setInterval(refresh, 4000);
    refresh();
  } catch (e) {}
})();
</script>`

/**
 * 流式输出时把聊天区钉在底部（只写 .chat-scroll.scrollTop）。
 *
 * 需求：模型生成中要能看到最新内容，但**不能和用户抢滚动条**。
 *   · 只在「正在生成」窗口内跟随：旁听 /m/api/events.mux，见到
 *     **只有 text-delta（结论正文）才开启跟随**，reasoning-delta（思考）不跟随；
 *     turn/start 与 turn/end 复位；
 *   · 用户往上滚（离底 > 120px）就停跟随，滚回底部附近（< 80px）恢复；
 *   · 切会话 / 加载历史不动滚动位置（那时没有生成中的帧）；
 *   · 只改 .chat-scroll 的 scrollTop，**不移动任何 React 节点**、不碰整页滚动。
 */
const CHAT_AUTOSCROLL_HTML = `<script>
(function () {
  try {
    if (window.__dmAutoScroll) return;
    window.__dmAutoScroll = true;

    var FOLLOW_STOP = 120;   // 离底超过这个距离：用户在看上面，停止跟随
    var FOLLOW_RESUME = 80;  // 离底小于这个距离：认为回到末尾，恢复跟随
    // 只在**结论正文**流式输出时跟随：宿主的流式帧里 reasoning-delta 是思考、
    // text-delta 才是最终正文。思考/工具阶段完全不干预，用户可以自由上下翻记录。
    var answering = false;
    var follow = true;
    var raf = 0;
    var lastTop = -1;        // 上一次由本脚本钉住时的 scrollTop

    function scroller() { return document.querySelector('.chat-scroll'); }
    function distance(el) { return el.scrollHeight - el.scrollTop - el.clientHeight; }

    function tick() {
      raf = 0;
      if (!answering || !follow) return;
      var el = scroller();
      if (!el) return;
      var d = distance(el);
      // 内容变高也会拉大离底距离，但**不会**让 scrollTop 变小；scrollTop 明显
      // 变小只可能是用户往上滑。必须在写入 scrollTop 之前判断：rAF 有可能抢在
      // scroll 事件之前执行，否则用户刚滑走就会被钉回底部。
      if (lastTop >= 0 && el.scrollTop <= lastTop - 16 && d > FOLLOW_STOP) {
        follow = false;
        return;
      }
      el.scrollTop = el.scrollHeight;
      lastTop = el.scrollTop;
    }
    function schedule() { if (!raf) raf = window.requestAnimationFrame(tick); }

    // 用户手动滚动：按离底距离决定停/恢复跟随（捕获阶段拿所有滚动事件）。
    document.addEventListener('scroll', function (e) {
      var el = e.target;
      if (!el || el.nodeType !== 1 || !el.classList || !el.classList.contains('chat-scroll')) return;
      var d = distance(el);
      // 只在上滑离开底部时**停止**跟随；恢复跟随必须由用户点「回到最新消息」显式发起，
      // 否则用户正在往上翻历史时，只要手指滑过底部附近就会被重新"吸"回去。
      if (d > FOLLOW_STOP) follow = false;
    }, true);

    // 恢复跟随的唯一入口：底部那个「回到最新消息」圆钮（bundle 的 .chat-jump-latest）。
    // 只旁听点击（捕获阶段、不 preventDefault 也不 stopPropagation），
    // bundle 自己的 onClick 会把界面滚到底，这里只负责把跟随状态打开。
    document.addEventListener('click', function (e) {
      var t = e.target;
      while (t && t !== document && !(t.classList && t.classList.contains('chat-jump-latest'))) {
        t = t.parentNode;
      }
      if (!t || t === document || !t.classList || !t.classList.contains('chat-jump-latest')) return;
      follow = true;
      answering = false;   // 等本轮正文的下一个 text-delta 再接管
      schedule();
    }, true);

    // 新内容进来 → 若在跟随就贴底。
    try {
      var mo = new MutationObserver(schedule);
      mo.observe(document.documentElement || document.body, { childList: true, subtree: true, characterData: true });
    } catch (e) {}

    // 旁听 SSE 判定「正在生成」：不改 onmessage/onerror，只加 addEventListener。
    try {
      var Native = window.EventSource;
      if (typeof Native === 'function') {
        var Wrapped = function (url, cfg) {
          var es = new Native(url, cfg);
          try {
            if (String(url).indexOf('/m/api/events.mux') >= 0) {
              es.addEventListener('message', function (ev) {
                var raw = ev && ev.data ? String(ev.data) : '';
                if (raw === '') return;
                // 先子串预判，避免每个 chunk 都 JSON.parse。
                if (raw.indexOf('turn/start') >= 0) {
                  // 新的一轮：进入思考/工具阶段，不跟随，也不动滚动位置。
                  // **不要**在这里把 follow 打开 —— 是否跟随由用户决定（上滑=停，
                  // 点「回到最新消息」=恢复），否则用户正翻历史时会被新回合硬拽下去。
                  answering = false;
                } else if (raw.indexOf('text-delta') >= 0) {
                  // 结论正文开始流式：第一次到达时贴底一次，之后持续跟随。
                  if (!answering) {
                    answering = true;
                    // 只在"用户仍在跟随"时才贴底；如果他已经上滑在翻历史，
                    // 就静静把正文写进去，等他点「回到最新消息」再回来。
                    if (follow) {
                      var el0 = scroller();
                      if (el0) el0.scrollTop = el0.scrollHeight;
                    }
                  }
                  if (follow) schedule();
                } else if (raw.indexOf('turn/end') >= 0) {
                  answering = false;
                }
                // reasoning-delta（思考过程）刻意不处理：那时不该自动滚动。
              });
            }
          } catch (e) {}
          return es;
        };
        Wrapped.prototype = Native.prototype;
        Wrapped.CONNECTING = Native.CONNECTING;
        Wrapped.OPEN = Native.OPEN;
        Wrapped.CLOSED = Native.CLOSED;
        window.EventSource = Wrapped;
      }
    } catch (e) {}

    // 兜底：某些情况下 SSE 旁听不到（重连/换实现），只要还标记着生成中就继续跟。
    setInterval(function () { if (answering) schedule(); }, 900);
  } catch (e) {}
})();
</script>`

/**
 * 图标与文字的光学垂直对齐（运行时按真实字体度量计算）。
 *
 * 问题背景：
 *   bundle 里这些行的结构是 [图标 span][文字 span][图标/箭头 span] 的 flex 行，
 *   图标是 SVG（或 emoji），文字是中文。行用 align-items:center 居中的是**行盒**，
 *   而中文字形在行盒里的**墨迹位置由字体的 ascent/descent 决定** —— 不同字体
 *   （电脑上的 Chromium 默认字体 vs 鸿蒙 ArkWeb 的系统字体）差别可达 1~2px。
 *   所以任何写死的像素补偿都只能对某一种字体成立。
 *   右侧的展开箭头 ▾ 是**文字字符**，与标题共用基线，天然对齐 —— 这正是对照。
 *
 * 做法：
 *   用 canvas 的 measureText 取到当前元素实际字体下的：
 *     · fontBoundingBoxAscent/Descent —— 字体用于排行盒的 ascent/descent
 *     · actualBoundingBoxAscent/Descent —— 这段文字**墨迹**的上下边界
 *   由此算出「墨迹中心相对行盒中心的偏移」，再把图标整体平移这个量。
 *   → 不论手机用什么字体，都按它自己的度量对齐。
 *
 * 触发：字体加载完成、DOM 变化（rAF 合并）、resize、每 1.2s 兜底。
 * 只写 icon.style.transform，不动 DOM 结构、不改 React 节点。
 */
const ICON_OPTICAL_ALIGN_HTML = `<script>
(function () {
  try {
    if (window.__dmIconAlign) return;
    window.__dmIconAlign = true;

    // [行选择器, 图标选择器, 文字选择器]
    var PAIRS = [
      ['.chat-step-head', '.chat-step-icon', '.chat-step-title'],
      ['.chat-proc-current', '.chat-step-icon', '.chat-proc-current-text'],
      ['.chat-trigger-head', '.chat-trigger-icon', '.chat-trigger-title'],
      ['.chat-disclosure-head', '.chat-disclosure-icon', '.chat-disclosure-label'],
      ['.chat-think-head', '.chat-think-icon', '.chat-think-label']
    ];

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var cache = {};   // 字体 + 文本 → 偏移

    // 返回「墨迹中心相对行盒中心」的偏移（px，向下为正）；算不出返回 null。
    function inkOffset(el) {
      var cs = window.getComputedStyle(el);
      var text = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (text === '') return null;
      var fontSize = parseFloat(cs.fontSize) || 13;
      var lineHeight = cs.lineHeight === 'normal' ? fontSize * 1.2 : parseFloat(cs.lineHeight);
      if (!(lineHeight > 0)) return null;
      var font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
      var key = font + '|' + lineHeight + '|' + text;
      if (cache[key] !== undefined) return cache[key];

      ctx.font = font;
      var m;
      try { m = ctx.measureText(text); } catch (e) { return null; }
      var FA = m.fontBoundingBoxAscent;
      var FD = m.fontBoundingBoxDescent;
      var AA = m.actualBoundingBoxAscent;
      var AD = m.actualBoundingBoxDescent;
      if (!(FA > 0) || !(FD >= 0) || !(AA >= 0) || !(AD >= 0)) return null;

      // 行盒里文字内容区垂直居中（半行距），据此得到基线位置
      var halfLeading = (lineHeight - (FA + FD)) / 2;
      var baseline = halfLeading + FA;
      // 墨迹中心 = 基线 - (上升 - 下降)/2
      var inkCenter = baseline - (AA - AD) / 2;
      var offset = inkCenter - lineHeight / 2;
      // 合理范围保护：超过 3px 说明度量异常，宁可不改
      if (!isFinite(offset) || Math.abs(offset) > 3) offset = null;
      cache[key] = offset;
      return offset;
    }

    function apply() {
      for (var p = 0; p < PAIRS.length; p++) {
        var rows = document.querySelectorAll(PAIRS[p][0]);
        for (var i = 0; i < rows.length; i++) {
          var row = rows[i];
          var icon = row.querySelector(PAIRS[p][1]);
          var text = row.querySelector(PAIRS[p][2]);
          if (!icon || !text) continue;
          var off = inkOffset(text);
          if (off === null) continue;
          var v = (Math.round(off * 10) / 10) + 'px';
          if (icon.style.transform !== 'translateY(' + v + ')') {
            icon.style.transform = 'translateY(' + v + ')';
          }
        }
      }
    }

    var queued = false;
    function schedule() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(function () {
        queued = false;
        try { apply(); } catch (e) {}
      });
    }

    try {
      var mo = new MutationObserver(schedule);
      mo.observe(document.documentElement || document.body, { childList: true, subtree: true, characterData: true });
    } catch (e) {}
    window.addEventListener('resize', schedule);
    // 字体晚到（自定义字体/系统字体异步加载）时重新算一次
    try {
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
    } catch (e) {}
    setInterval(schedule, 1200);
    schedule();
  } catch (e) {}
})();
</script>`

function mobilePageHtml() {
  return [
    '<!doctype html>',
    '<html lang="zh-CN">',
    '<head>',
    '<meta charset="utf-8">',
    // 必须最早：先把 navigator.onLine 的误报按住，bundle 才不会在发送时丢掉图片。
    ONLINE_GUARD_HTML,
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content">',
    '<meta name="theme-color" content="#f5f5f7">',
    '<meta name="referrer" content="no-referrer">',
    '<meta name="mobile-web-app-capable" content="yes">',
    '<meta name="apple-mobile-web-app-capable" content="yes">',
    '<meta name="apple-mobile-web-app-title" content="dsh">',
    '<link rel="manifest" href="/m/manifest.webmanifest">',
    '<link rel="apple-touch-icon" href="/m/apple-touch-icon.png">',
    '<link rel="icon" href="/m/icon.svg">',
    '<title>dsh</title>',
    '<link rel="stylesheet" href="/m/theme.css">',
    '</head>',
    '<body>',
    '<div id="root"></div>',
    // 在 bundle 之前注册：拦住「图片还没解码完就点发送」的一次点击，解码完成后自动重发。
    SEND_DECODE_GUARD_HTML,
    '<script type="module" src="/m/mobile.js"></script>',
    VIEWPORT_VH_HTML,
    MODEL_BUTTON_HTML,
    SHEET_CLOSE_HTML,
    EMOJI_ICON_HTML,
    TURN_PILL_HTML,
    SUBAGENT_BTN_HTML,
    PERMISSION_BTN_HTML,
    APPROVAL_BTN_HTML,
    SUBAGENT_STATUS_BTN_HTML,
    PRESET_BTN_HTML,
    PRESET_STATUS_HTML,
    SEND_MODE_HTML,
    SEND_MODE_SETTINGS_HTML,
    QUEUE_DOCK_PLACE_HTML,
    CHAT_STATUS_HTML,
    CHAT_AUTOSCROLL_HTML,
    ICON_OPTICAL_ALIGN_HTML,
    '</body>',
    '</html>',
  ].join('')
}

/**
 * 浏览器推送能力自检页（只读）。
 *
 * 用途：确认用户的手机浏览器（这里是鸿蒙上的夸克浏览器）到底支不支持 Web Push。
 * Web Push 的硬性前置条件有三条，缺一不可：
 *   ① 安全上下文（HTTPS，或 localhost）——http 下 isSecureContext 为 false；
 *   ② Service Worker 可用且能注册成功；
 *   ③ PushManager 存在。
 * 只要有一条不满足，浏览器通知就做不成。页面把所有条件逐项摊开显示，
 * 并如实暴露「/m/service-worker.js 目前 404」这类事实。
 *
 * 本页严格只读：不配对、不写设备表、不调用 pushManager.subscribe()。
 */
function pushCheckPageHtml() {
  const pageJs = `
(function () {
  var $ = function (id) { return document.getElementById(id) }

  function mark(el, state) {
    // state: 'ok' | 'no' | 'warn'
    el.classList.remove('pc-ok', 'pc-no', 'pc-warn')
    el.classList.add('pc-' + state)
  }

  function icon(state) {
    return state === 'ok' ? '✅' : state === 'no' ? '❌' : '⚠️'
  }

  function setRow(id, state, valueText) {
    var row = $(id)
    if (!row) return
    var cell = row.querySelector('.pc-icon')
    var val = row.querySelector('.pc-value')
    if (cell) { cell.textContent = icon(state); mark(cell, state) }
    if (val) {
      val.textContent = valueText
      val.classList.remove('pc-ok', 'pc-no', 'pc-warn')
      val.classList.add('pc-' + state)
    }
  }

  function addNote(id, text) {
    var row = $(id)
    if (!row) return
    var p = document.createElement('p')
    p.className = 'pc-note'
    p.textContent = text
    row.appendChild(p)
  }

  var results = {}

  // ── 1. 安全上下文 ────────────────────────────────────────────────────
  var secure = window.isSecureContext === true
  results.secure = secure
  setRow('row-secure', secure ? 'ok' : 'no', secure ? 'true（安全上下文）' : 'false（非安全上下文）')
  if (!secure) {
    addNote('row-secure', '这是协议硬性要求：非 HTTPS（且非 localhost）时浏览器根本不暴露 Push API，Web Push 必定不可用。请改用 https 地址打开本页。')
  }

  // ── 2. 访问协议 / 地址 ───────────────────────────────────────────────
  setRow('row-proto',
    location.protocol === 'https:' ? 'ok' : 'no',
    location.protocol.replace(':', '').toUpperCase())
  $('pc-origin').textContent = location.origin || location.href

  // ── 3. Service Worker ────────────────────────────────────────────────
  var hasSw = 'serviceWorker' in navigator
  results.sw = hasSw
  setRow('row-sw', hasSw ? 'ok' : 'no', hasSw ? '存在（navigator.serviceWorker）' : '不存在')

  // ── 4. PushManager ───────────────────────────────────────────────────
  var hasPush = 'PushManager' in window
  results.push = hasPush
  setRow('row-push', hasPush ? 'ok' : 'no', hasPush ? '存在（window.PushManager）' : '不存在')

  // ── 5. Notification API ──────────────────────────────────────────────
  var hasNotif = 'Notification' in window
  results.notif = hasNotif
  setRow('row-notif', hasNotif ? 'ok' : 'no', hasNotif ? '存在（window.Notification）' : '不存在')

  // ── 6. 通知权限 ──────────────────────────────────────────────────────
  var perm = hasNotif ? Notification.permission : 'unsupported'
  results.perm = perm
  var permState = perm === 'granted' ? 'ok' : perm === 'denied' ? 'no' : 'warn'
  var permText = { granted: 'granted（已授权）', denied: 'denied（已被拒绝）', default: 'default（尚未询问）', unsupported: '不支持（无 Notification API）' }[perm] || String(perm)
  setRow('row-perm', permState, permText)
  if (perm === 'denied') {
    addNote('row-perm', '权限已被拒绝：浏览器不会再弹窗，需要到浏览器「网站设置 → 通知」里手动改回允许。')
  }

  // ── 9. User-Agent ────────────────────────────────────────────────────
  var ua = navigator.userAgent || '（无法读取）'
  $('pc-ua').textContent = ua
  var isQuark = /Quark/i.test(ua)
  var chromeVer = /Chrome\\/([0-9]+)/.exec(ua)
  setRow('row-ua', 'warn', ua)
  addNote('row-ua',
    (isQuark ? '识别为夸克浏览器（Quark）。' : '未识别到 Quark 字样——请确认是不是在用夸克打开。') +
    (chromeVer ? '内核 Chrome ' + chromeVer[1] + '。' : '未识别到 Chrome 版本号。'))

  // ── 7. 请求权限（按钮，用户主动触发） ────────────────────────────────
  var permBtn = $('pc-perm-btn')
  permBtn.addEventListener('click', function () {
    if (!hasNotif) {
      $('pc-perm-result').textContent = '❌ 浏览器没有 Notification API，无法请求权限。'
      return
    }
    $('pc-perm-result').textContent = '⏳ 正在请求…'
    var done = function (p) {
      var st = p === 'granted' ? 'ok' : p === 'denied' ? 'no' : 'warn'
      setRow('row-perm', st, '请求后：' + p)
      $('pc-perm-result').textContent = p === 'granted'
        ? '✅ 授权成功（' + p + '）'
        : p === 'denied'
          ? '❌ 被拒绝（' + p + '）：需到浏览器网站设置里手动允许。'
          : '⚠️ 未作出选择（' + p + '）'
      render()
    }
    try {
      // 兼容两种签名：新浏览器返回 Promise，老的用回调。
      var r = Notification.requestPermission(function (p) { done(p) })
      if (r && typeof r.then === 'function') r.then(done, function () { done(Notification.permission) })
    } catch (e) {
      $('pc-perm-result').textContent = '❌ 请求权限抛出异常：' + ((e && e.message) || e)
    }
  })

  // ── 8. SW 注册 + 订阅可用性 ──────────────────────────────────────────
  var swDone = false
  var subDone = false

  function runSw() {
    if (!hasSw) {
      setRow('row-swreg', 'no', '跳过：无 Service Worker API')
      setRow('row-sub', 'no', '跳过：Service Worker 不可注册')
      return Promise.resolve()
    }
    setRow('row-swreg', 'warn', '正在注册 /m/service-worker.js …')
    // scope '/m/' 与 bundle 注册时用的完全一致。
    return navigator.serviceWorker.register('/m/service-worker.js', { scope: '/m/' })
      .then(function (reg) {
        swDone = true
        setRow('row-swreg', 'ok', '注册成功（scope ' + reg.scope + '）')
        addNote('row-swreg', '注册成功说明浏览器支持 Service Worker。')
        return checkSub(reg)
      })
      .catch(function (err) {
        var msg = (err && err.message) || String(err)
        setRow('row-swreg', 'no', '注册失败：' + msg)
        addNote('row-swreg', '注册失败最常见的两个原因：① 非安全上下文（http 打开）；② /m/service-worker.js 这个地址返回了非 200/非 JS（当前插件还没给它配路由，所以会 404）。')
        setRow('row-sub', 'no', '跳过：Service Worker 注册失败')
        subDone = true
      })
  }

  function checkSub(reg) {
    if (!hasPush) {
      setRow('row-sub', 'no', '不可用：无 PushManager')
      subDone = true
      return Promise.resolve()
    }
    setRow('row-sub', 'warn', '正在读取已有订阅…')
    // 只读：getSubscription() 不会创建新订阅、不会触发任何推送。
    return reg.pushManager.getSubscription().then(function (sub) {
      if (sub) {
        setRow('row-sub', 'ok', '存在已有订阅（endpoint 可解析）')
        addNote('row-sub', '浏览器允许读取订阅对象，说明 PushManager 基本可用。真正的可用性还要看能否成功 subscribe()，本页不会去订阅。')
      } else {
        setRow('row-sub', 'warn', '暂无订阅，但 pushManager 可访问（未实际订阅）')
        addNote('row-sub', '能读到 pushManager 说明 API 存在。是否真能订阅成功、以及鸿蒙无 GMS 时能否收到 FCM 推送，仍需实测。')
      }
      subDone = true
    }).catch(function (err) {
      setRow('row-sub', 'no', '读取订阅失败：' + ((err && err.message) || err))
      subDone = true
    })
  }

  // ── 总结论 ───────────────────────────────────────────────────────────
  function render() {
    var box = $('pc-verdict')
    var title = $('pc-verdict-title')
    var desc = $('pc-verdict-desc')
    var ok = results.secure && results.sw && results.push && results.notif
    var missing = []
    if (!results.secure) missing.push('安全上下文（HTTPS）')
    if (!results.sw) missing.push('Service Worker')
    if (!results.push) missing.push('PushManager')
    if (!results.notif) missing.push('Notification API')

    box.classList.remove('pc-v-ok', 'pc-v-no', 'pc-v-warn')
    if (missing.length > 0) {
      box.classList.add('pc-v-no')
      title.textContent = '❌ 结论：Web Push 不可用'
      desc.textContent = '缺失：' + missing.join('、') + '。浏览器通知这条路走不通，需要改用第三方渠道（如 Bark / WxPusher）。'
      return
    }
    if (swDone && subDone) {
      box.classList.add('pc-v-ok')
      title.textContent = '✅ 结论：前置条件都满足'
      desc.textContent = 'HTTPS + Service Worker + PushManager 三者齐备。请注意：这只能说明浏览器「可能」支持，鸿蒙无 GMS 时真正的 FCM 推送仍可能收不到，需要一次真实订阅+发送测试才能确认。'
      return
    }
    box.classList.add('pc-v-warn')
    title.textContent = '⚠️ 结论：API 存在，但 Service Worker 尚未验证成功'
    desc.textContent = '浏览器有 PushManager，但 SW 注册/订阅读取还没成功完成（见上面两项）。在 SW 真正注册成功之前，Web Push 无法工作。'
  }

  render()
  runSw().then(function () { render() })

  // 重新检测：整页刷新最干净（SW 注册状态不会被残留状态干扰）。
  $('pc-reload').addEventListener('click', function () { location.reload() })
})();
`

  return [
    '<!doctype html>',
    '<html lang="zh-CN">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">',
    '<meta name="referrer" content="no-referrer">',
    '<meta name="theme-color" content="#f5f5f7">',
    '<title>浏览器推送能力自检</title>',
    '<link rel="stylesheet" href="/m/theme.css">',
    '</head>',
    '<body class="pc-body">',
    '<main class="pc-page">',
    '<h1 class="pc-title">浏览器推送能力自检</h1>',

    '<div class="pc-banner">',
    '<p class="pc-banner-title">⚠️ Web Push 需要三样东西，缺一不可</p>',
    '<p class="pc-banner-body"><b>HTTPS</b>（安全上下文） + <b>Service Worker</b> + <b>PushManager</b>。<br>',
    '通过 <b>http</b> 访问时必定不可用——这是浏览器协议的硬性要求，不是配置问题。</p>',
    '</div>',

    '<section class="pc-card">',
    '<h2 class="pc-h2">访问地址</h2>',
    '<p class="pc-kv">当前地址：<code id="pc-origin"></code></p>',
    '<p class="pc-hint">若上面是 <code>http://</code> 开头，请改用 https 的公网地址重新打开本页：</p>',
    '<ul class="pc-urls">',
    '<li><span class="pc-tag pc-tag-no">http</span> <code>http://192.168.3.45:19387/m/push-check</code> — 局域网，必定不可用（仅用于对照）</li>',
    '<li><span class="pc-tag pc-tag-ok">https</span> <code>https://dshm.elysia.xin:45632/m/push-check</code> — 公网反代，<b>用这个测</b></li>',
    '</ul>',
    '</section>',

    '<section class="pc-card">',
    '<h2 class="pc-h2">逐项检测</h2>',
    '<ul class="pc-list">',
    '<li class="pc-row" id="row-secure"><span class="pc-icon"></span><span class="pc-label">安全上下文 <i>window.isSecureContext</i></span><span class="pc-value"></span></li>',
    '<li class="pc-row" id="row-proto"><span class="pc-icon"></span><span class="pc-label">访问协议 <i>location.protocol</i></span><span class="pc-value"></span></li>',
    '<li class="pc-row" id="row-sw"><span class="pc-icon"></span><span class="pc-label">Service Worker <i>navigator.serviceWorker</i></span><span class="pc-value"></span></li>',
    '<li class="pc-row" id="row-push"><span class="pc-icon"></span><span class="pc-label">PushManager <i>window.PushManager</i></span><span class="pc-value"></span></li>',
    '<li class="pc-row" id="row-notif"><span class="pc-icon"></span><span class="pc-label">Notification API <i>window.Notification</i></span><span class="pc-value"></span></li>',
    '<li class="pc-row" id="row-perm"><span class="pc-icon"></span><span class="pc-label">通知权限 <i>Notification.permission</i></span><span class="pc-value"></span></li>',
    '<li class="pc-row" id="row-swreg"><span class="pc-icon"></span><span class="pc-label">SW 注册 <i>register(\'/m/service-worker.js\')</i></span><span class="pc-value"></span></li>',
    '<li class="pc-row" id="row-sub"><span class="pc-icon"></span><span class="pc-label">订阅可用性 <i>getSubscription()</i>（只读）</span><span class="pc-value"></span></li>',
    '<li class="pc-row" id="row-ua"><span class="pc-icon"></span><span class="pc-label">User-Agent</span><span class="pc-value"></span></li>',
    '</ul>',
    '</section>',

    '<section class="pc-card">',
    '<h2 class="pc-h2">请求通知权限</h2>',
    '<p class="pc-hint">点下面的按钮会调用 <code>Notification.requestPermission()</code>，由浏览器弹窗询问。本页不会真的订阅、不会配对设备。</p>',
    '<button type="button" class="pc-btn" id="pc-perm-btn">请求通知权限</button>',
    '<p class="pc-result" id="pc-perm-result"></p>',
    '</section>',

    '<section class="pc-card pc-verdict" id="pc-verdict">',
    '<p class="pc-verdict-title" id="pc-verdict-title">检测中…</p>',
    '<p class="pc-verdict-desc" id="pc-verdict-desc"></p>',
    '</section>',

    '<section class="pc-card">',
    '<h2 class="pc-h2">User-Agent 全文</h2>',
    '<p class="pc-ua" id="pc-ua"></p>',
    '<p class="pc-hint">用来确认是不是夸克浏览器，以及它的 Chromium 内核版本。</p>',
    '</section>',

    '<button type="button" class="pc-btn pc-btn-ghost" id="pc-reload">重新检测</button>',
    '<p class="pc-foot">本页只读：不配对、不写设备、不创建订阅。</p>',
    '</main>',
    '<script>' + pageJs + '</script>',
    '</body>',
    '</html>',
  ].join('')
}

function manifestJson() {
  return JSON.stringify({
    id: MOBILE_ROOT,
    name: 'dsh 掌上助手',
    short_name: 'dsh',
    start_url: MOBILE_ROOT,
    scope: MOBILE_ROOT,
    display: 'standalone',
    background_color: '#151424',
    theme_color: '#f3f5f9',
    icons: [
      { src: '/m/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/m/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  }, null, 2)
}

// ── apply ───────────────────────────────────────────────────────────────────
export function apply(ctx, config) {
  const cfg = {
    enabled: true,
    publicBaseUrl: '',
    mobilePort: DEFAULT_MOBILE_PORT,
    mobileHost: '0.0.0.0',
    devicesFile: defaultDevicesFile(),
    pairCode: DEFAULT_PAIR_CODE,
    pushConfigFile: join(homedir(), '.dsh', 'dsh-mobile-push.json'),
    // 发送模式（排队 / 直接插入）的落盘位置：与推送配置分开存，互不牵连。
    sendModeFile: join(homedir(), '.dsh', 'dsh-mobile-sendmode.json'),
    transcribeServices: [],
    // 手机端模型列表里隐藏的老模型（DeepSeek v3.x / R1 与旧混元）；可在配置里覆盖。
    hiddenModels: [
      'cn:deepseek-v3-1-lkeap',
      'cn:deepseek-v3-1',
      'cn:deepseek-v3-0324-lkeap',
      'cn:deepseek-r1-0528-lkeap',
      'cn:deepseek-v3-0324',
      'cn:deepseek-v3-2-volc',
      'cn:hunyuan-2.0-instruct',
      'cn:hunyuan-chat',
    ],
    ...(config || {}),
  }

  if (!cfg.enabled) return

  const devices = loadDevices(cfg.devicesFile)
  let pairToken = null // { code, expiresAt, fixed }
  let notifyConfig = loadNotifyConfig(cfg.pushConfigFile)
  // 发送模式：手机端唯一一处真值；下发 mobile.preferences，写回 session.prompt。
  let sendMode = loadSendMode(cfg.sendModeFile)
  const cookieName = COOKIE_NAME
  // 用量页缓存：60 秒 TTL，只缓存查询成功的视图（含数据采集时刻 fetchedAt）。
  let usageCache = { at: 0, view: null }

  function deviceTokensOf(req) {
    const header = req.headers.cookie
    if (!header) return []
    const out = []
    for (const part of String(header).split(';')) {
      const i = part.indexOf('=')
      if (i < 0) continue
      if (part.slice(0, i).trim() !== cookieName) continue
      out.push(decodeURIComponent(part.slice(i + 1).trim()))
    }
    return out
  }

  function authenticatedDevice(req) {
    // 容忍历史遗留：Path=/ 与 Path=/m 可能同时存在同名 cookie，任一有效即通过。
    for (const token of deviceTokensOf(req)) {
      for (const [deviceId, d] of devices) {
        if (d.token === token) {
          d.lastSeenAt = Date.now()
          return { deviceId, ...d }
        }
      }
    }
    return null
  }

  function fixedPairCode() {
    return String(cfg.pairCode == null ? '' : cfg.pairCode).trim()
  }

  function createDevice(userAgent) {
    if (devices.size >= MAX_DEVICES) return null
    const now = Date.now()
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
    return { deviceId, token }
  }

  function issuePairToken() {
    const fixed = fixedPairCode()
    if (fixed !== '') {
      // 固定码：永不过期，随时可配（不再随机、不再 5 分钟失效）。
      pairToken = { code: fixed, expiresAt: Number.MAX_SAFE_INTEGER, fixed: true }
      return pairToken
    }
    pairToken = { code: String(randomInt(0, 1e6)).padStart(6, '0'), expiresAt: Date.now() + TOKEN_TTL_MS, fixed: false }
    return pairToken
  }

  function acceptPairCode(code, userAgent) {
    const input = String(code == null ? '' : code).trim()
    const fixed = fixedPairCode()
    if (fixed !== '') {
      if (input !== fixed) return null
      return createDevice(userAgent)
    }
    const now = Date.now()
    if (!pairToken || pairToken.code !== input || now > pairToken.expiresAt) {
      if (pairToken && now > pairToken.expiresAt) pairToken = null
      return null
    }
    const created = createDevice(userAgent)
    if (created) pairToken = null
    return created
  }

  function accessAddresses() {
    const port = Number(cfg.mobilePort) || DEFAULT_MOBILE_PORT
    const lan = lanIPv4Addresses().map((a) => `http://${a}:${port}`)
    const publicBase = typeof cfg.publicBaseUrl === 'string' && cfg.publicBaseUrl.trim() !== ''
      ? cfg.publicBaseUrl.trim().replace(/\/+$/, '')
      : null
    return { lan, publicBase, port }
  }

  // ── settings-panel endpoints (simple JSON) ────────────────────────────────
  function me(req, res) {
    const device = authenticatedDevice(req)
    if (!device) return sendJson(res, 401, { ok: false, paired: false })
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
        if (!result) return sendJson(res, 200, { ok: false, error: '配对码无效或已过期' })
        const maxAge = Math.round(IDLE_EXPIRE_MS / 1000)
        sendJson(res, 200, { ok: true, paired: true, deviceId: result.deviceId }, {
          'Set-Cookie': `${cookieName}=${result.token}; Path=/m; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`,
        })
      })
      .catch((err) => sendJson(res, 400, { ok: false, error: String((err && err.message) || err) }))
  }

  function pairAcceptCompat(req, res) {
    readJsonBody(req, SMALL_BODY)
      .then((body) => {
        const code = typeof body.code === 'string' ? body.code : ''
        const token = typeof body.token === 'string' ? body.token : ''
        const secret = code !== '' ? code : token
        const result = acceptPairCode(secret, req.headers['user-agent'])
        if (!result) {
          // dsh-palm 契约：无效 → 404 {ok:false,code:'invalid'}
          sendJson(res, 404, { ok: false, code: 'invalid' })
          return
        }
        const maxAge = Math.round(IDLE_EXPIRE_MS / 1000)
        // dsh-palm 用 Path=/；手机 bundle 的探测请求会带上它。
        sendJson(res, 200, { ok: true, deviceId: result.deviceId }, {
          'Set-Cookie': `${cookieName}=${result.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`,
        })
      })
      .catch(() => sendJson(res, 400, { ok: false, code: 'bad-payload' }))
  }

  function status(req, res) {
    const now = Date.now()
    const devicesView = [...devices.entries()].map(([deviceId, d]) => ({
      deviceId, name: d.name || '设备', createdAt: d.createdAt, lastSeenAt: d.lastSeenAt, userAgent: d.userAgent || '',
    }))
    const fixed = fixedPairCode()
    const pending = fixed !== ''
      ? { code: fixed, expiresAt: Number.MAX_SAFE_INTEGER, fixed: true }
      : (pairToken && now <= pairToken.expiresAt ? { code: pairToken.code, expiresAt: pairToken.expiresAt, fixed: false } : null)
    sendJson(res, 200, { ok: true, addresses: accessAddresses(), devices: devicesView, pending })
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

  function requireLoopback(req, res, fn) {
    if (!isLoopback(req)) return sendJson(res, 403, { ok: false, error: 'forbidden: this endpoint is host-only' })
    fn(req, res)
  }

  // ── RPC adapter (dsh-palm protocol) ───────────────────────────────────────
  const sc = () => ctx.sessionController
  const wr = () => ctx.workspaceRegistry
  // 与上面同款：ctx.get 是「按名取服务」的宽容读法，取不到返回 undefined 而不抛。
  // 调用处一律先判空，再决定降级（空列表 / 报错），绝不直接对 undefined 取方法。
  const wc = () => (typeof ctx.get === 'function' ? ctx.get('workspaceController') : undefined)
  const dp = () => (typeof ctx.get === 'function' ? ctx.get('directoryPickerController') : undefined)

  // ── 会话历史读取 ──────────────────────────────────────────────────────────
  //
  // 子代理（origin:'subagent'）的会话不能用 {kind:'session', sessionId} 读：
  // 宿主的 validateAddress 会直接抛 session/agent-busy（"subagent Sessions
  // require their durable parent address"）—— 于是事件数永远是 0，看上去就像
  // "读不到"。子代理必须走 durable 父地址：
  //   {kind:'subagent', parentSessionId, childSessionId, mode}
  // mode 取 'unknown' 可匹配 one-shot / continuable / external 任意一种，
  // 省一次目录查询。follow 取 cursor 与 page 取事件用的是同一个 address。
  //
  // 子代理 id → 父会话 id。subagent.list 每次返回都会顺手登记（每行自带
  // parentId），所以面板的「先列子代理、再点开看聊天」路径永远命中缓存，
  // 从不需要下面的反查扫描。
  const subagentParent = new Map()

  function recordSubagentParents(rows) {
    if (!Array.isArray(rows)) return
    for (const r of rows) {
      if (r && typeof r.id === 'string' && typeof r.parentId === 'string' && r.parentId !== '') {
        subagentParent.set(r.id, r.parentId)
      }
    }
  }

  // 认父：① 缓存 ② 调用方给的根会话 id ③ 最后才反查。
  // 反查只缓存未命中时走一次：遍历当前会话列表逐个 listDescendants 找命中项，
  // 结果进缓存，同一个子代理只付一次代价。
  async function parentOfSubagent(childSessionId, hint) {
    const cached = subagentParent.get(childSessionId)
    if (cached !== undefined) return cached
    if (typeof hint === 'string' && hint !== '' && hint !== childSessionId) return hint
    try {
      const subagents = typeof ctx.get === 'function' ? ctx.get('subagents') : undefined
      if (subagents && typeof subagents.listDescendants === 'function') {
        const { items = [] } = await sc().list({}, new AbortController().signal)
        for (const it of items) {
          const root = it && it.sessionId
          if (typeof root !== 'string' || root === '' || root === childSessionId) continue
          try {
            const rows = await subagents.listDescendants(root, new AbortController().signal)
            recordSubagentParents(rows)
            if (subagentParent.has(childSessionId)) return subagentParent.get(childSessionId)
          } catch {}
        }
      }
    } catch {}
    return undefined
  }

  // 普通会话一条路走完；子代理若按普通地址读不到（宿主抛 session/agent-busy），
  // 认父后用 durable 父地址重试一次。已认父时先走父地址，省掉那次注定失败的尝试。
  async function readHistory(sessionId, beforeSeq, maxMessages, parentHint) {
    const cached = subagentParent.get(sessionId)
    const knownParent = cached !== undefined
      ? cached
      : (typeof parentHint === 'string' && parentHint !== '' && parentHint !== sessionId ? parentHint : undefined)
    if (knownParent !== undefined) {
      const viaParent = await readHistoryAs(beforeSeq, maxMessages, {
        kind: 'subagent',
        parentSessionId: knownParent,
        childSessionId: sessionId,
        mode: 'unknown',
      })
      if (viaParent.events.length > 0) return viaParent
    }
    const direct = await readHistoryAs(beforeSeq, maxMessages, { kind: 'session', sessionId })
    if (direct.events.length > 0 || knownParent !== undefined) return direct
    const found = await parentOfSubagent(sessionId, parentHint)
    if (found === undefined) return direct
    const retry = await readHistoryAs(beforeSeq, maxMessages, {
      kind: 'subagent',
      parentSessionId: found,
      childSessionId: sessionId,
      mode: 'unknown',
    })
    return retry.events.length > 0 ? retry : direct
  }

  async function readHistoryAs(beforeSeq, maxMessages, address) {
    const controller = sc()
    const signal = new AbortController().signal
    let cursor
    let projections
    try {
      const frames = controller.follow({ address }, signal)
      for await (const f of frames) {
        if (f && f.type === 'snapshot') {
          cursor = f.cursor
          projections = f.projections
          break
        }
      }
    } catch {
      cursor = undefined
    }
    if (cursor === undefined) return { events: [], hasMore: false }
    const page = await controller.page(
      {
        address,
        throughSeq: cursor,
        ...(beforeSeq === undefined ? {} : { beforeSeq }),
        maxMessages: Math.max(1, Math.min(Number(maxMessages) || 50, 200)),
      },
      signal,
    )
    const events = (page.records || []).map((r) => ({ event: r.event }))
    return {
      events,
      hasMore: !!page.hasMore,
      ...(projections ? { projections } : {}),
    }
  }

  function toWorkspaceView(w) {
    return {
      workspaceId: String(w.id),
      path: w.path,
      title: w.title || basename(w.path),
      sessionIds: [...(w.sessionIds || [])],
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
    }
  }

  // ── 待处理注册表：让手机接管 approval / ask_user_question 轮次 ──────────────
  //
  // 两个宿主应答点都是 Agent-scoped 的 waterfall：
  //   'approval/request'        (ApprovalService.decide → ctx.waterfall)
  //   'user-questions/request'  (UserQuestionService.ask → ctx.waterfall)
  // 桌面 GUI 的应答者会 await 用户点击，只有在用户点了之后才 settle；我们用
  // prepend:true 插到它前面，于是 waterfall 形状是
  //   us(outer) → desktop(next) → inner fallback('unavailable' / NO_PROVIDER)
  // 我们把 desktop 的 next() 与「手机应答」race：谁先到用谁，都没到就原样等桌面。
  // 因此：手机不答 ⇒ 行为与未装本插件逐字相同，绝不自动批准、绝不挂死会话。
  //
  // rpcId 只存在内存里；进程重启会丢，届时条目自然过期。
  const pending = {
    approvals: new Map(), // rpcId -> entry（含 resolve）
    questions: new Map(), // rpcId -> entry（含 resolve）
    byApprovalId: new Map(), // approvalId -> rpcId（bundle 按 approvalId 应答）
  }

  function approvalView(entry) {
    return {
      rpcId: entry.rpcId,
      approvalId: entry.approvalId,
      toolName: entry.toolName,
      ...(entry.callId === undefined ? {} : { callId: entry.callId }),
      // 手机优先展示中文；没有中文就退回宿主的原始 reason。
      ...(entry.reason === undefined ? {} : { reason: mobileReason(entry) }),
    }
  }

  function mobileReason(entry) {
    const candidates = [entry.displayReason?.zh, entry.displayReason?.en, entry.reason]
    const picked = candidates.filter((v) => typeof v === 'string' && v.trim() !== '')
    return picked[0] ?? entry.reason
  }

  // bundle 的提问 UI（yl）消费「拍平」数组：SSE 帧做的是
  // `questions.map(item => ({ rpcId, ...item }))`，yl 内部再按最后一项的 rpcId 归组
  //（同一个 rpcId = 同一批问题）。所以轮询必须返回同形状的拍平项：
  // 同一批的每一项都要带上相同的 rpcId，不能返回 { rpcId, questions: [...] } 嵌套体。
  function questionView(entry) {
    const items = Array.isArray(entry.questions) ? entry.questions : []
    return items.map((item) => ({
      rpcId: entry.rpcId,
      callId: entry.callId,
      ...(item && typeof item === 'object' ? item : {}),
    }))
  }

  /**
   * 把一次审批登记进手机待处理表。
   * @returns entry，或在拿不到 sessionId 时 undefined（此时宿主行为须完全不变）。
   */
  function registerApproval(req) {
    const agent = req && req.agent
    const sessionId = agent && agent.id
    if (!sessionId) return undefined
    const approvalId = randomBytes(12).toString('hex')
    const rpcId = `${sessionId}${'\u0000'}ap${'\u0000'}${approvalId}`
    const entry = {
      rpcId,
      sessionId,
      approvalId,
      toolName: req && typeof req.toolName === 'string' ? req.toolName : 'unknown',
      ...(req && req.callId !== undefined ? { callId: req.callId } : {}),
      ...(req && req.reason !== undefined ? { reason: req.reason } : {}),
      ...(req && req.displayReason !== undefined ? { displayReason: req.displayReason } : {}),
      expiresAt: Date.now() + PENDING_TTL_MS,
      resolve: undefined,
      wait: undefined,
    }
    entry.wait = new Promise((resolve) => {
      entry.resolve = (value) => {
        entry.resolve = () => {}
        resolve(value)
      }
    })
    // 抛错前的兜底：没人应答也不能让 unhandled rejection 炸掉进程。
    entry.wait.catch(() => {})
    pending.approvals.set(rpcId, entry)
    pending.byApprovalId.set(approvalId, rpcId)
    // 实时面：有 SSE 连着就立刻把卡片推下去，不等手机下一次轮询。
    emitMux({
      type: 'approval/requested',
      sessionId,
      approvalId,
      toolName: typeof entry.toolName === 'string' ? entry.toolName : 'unknown',
      ...(entry.callId === undefined ? {} : { callId: entry.callId }),
      ...(entry.reason === undefined ? {} : { reason: mobileReason(entry) }),
    }, rpcId)
    return entry
  }

  /** 同上，登记一次 ask_user_question 轮次。 */
  function registerQuestion(req) {
    const agent = req && req.agent
    const sessionId = agent && agent.id
    if (!sessionId) return undefined
    const callId = req && req.wait && req.wait.callId !== undefined ? String(req.wait.callId) : ''
    const rpcId = `${sessionId}${'\u0000'}q${'\u0000'}${callId}`
    const existing = pending.questions.get(rpcId)
    // 同一个 callId 重复提问（重连、重试）沿用已有条目，避免多条待处理卡互相挤掉。
    if (existing !== undefined) return existing
    const entry = {
      rpcId,
      sessionId,
      callId,
      questions: Array.isArray(req && req.questions) ? req.questions : [],
      expiresAt: Date.now() + PENDING_TTL_MS,
      resolve: undefined,
      wait: undefined,
    }
    entry.wait = new Promise((resolve) => {
      entry.resolve = (value) => {
        entry.resolve = () => {}
        resolve(value)
      }
    })
    entry.wait.catch(() => {})
    pending.questions.set(rpcId, entry)
    // 实时面：同上，提问卡片立即推送，不等轮询。
    emitMux({
      type: 'question/requested',
      sessionId,
      questions: entry.questions,
    }, rpcId)
    return entry
  }

  /**
   * 把待处理项移出登记表。这是唯一的统一出口（race 抢答、超时回收、手机应答、
   * 桌面抢答都会走到这里），所以「这轮结束了」的实时帧也在这里推：
   * 有 SSE 连着就立刻把卡片收回，不等手机下次轮询发现它没了。
   */
  function dropPending(map, key, indexKey, entry, outcome) {
    const wasPending = map.has(key)
    map.delete(key)
    if (indexKey !== undefined && pending.byApprovalId.get(indexKey) === key) pending.byApprovalId.delete(indexKey)
    // 标记成永不超时：下一次 sweep 不会再重复处理同一条目。
    entry.expiresAt = Number.POSITIVE_INFINITY
    if (!wasPending || typeof entry.sessionId !== 'string') return
    if (map === pending.approvals) {
      emitMux({
        type: 'approval/resolved',
        sessionId: entry.sessionId,
        approvalId: entry.approvalId,
        outcome: typeof outcome === 'string' ? outcome : 'cancelled',
      }, entry.rpcId)
    } else {
      emitMux({
        type: 'question/resolved',
        sessionId: entry.sessionId,
        questionRpcId: entry.rpcId,
        outcome: outcome === 'answered' ? 'answered' : 'cancelled',
      }, entry.rpcId)
    }
  }

  /**
   * 桌面先答就用桌面的，手机先答就用手机的；谁都没答就交给 next() 一直等下去
   * （桌面 UI 会等到用户点按钮为止，与没有本插件时完全一致）。
   */
  async function settleApproval(entry, next) {
    const desktop = Promise.resolve()
      .then(() => next())
      .catch(() => undefined)
    try {
      const first = await Promise.race([desktop, entry.wait])
      dropPending(pending.approvals, entry.rpcId, entry.approvalId, entry, typeof first === 'string' ? first : undefined)
      if (first !== undefined) {
        // 手机抢到了：桌面 card 仍在等用户点按钮（或 delegate 后被丢弃），兜底防 unhandled。
        desktop.catch(() => {})
        return first
      }
      // 手机这条超时/过期：桌面那条还活着，原样等它。
      return await desktop
    } catch (error) {
      dropPending(pending.approvals, entry.rpcId, entry.approvalId, entry)
      throw error
    }
  }

  /** 提问同上。 */
  async function settleQuestionRace(entry, next) {
    const desktop = Promise.resolve()
      .then(() => next())
      .catch(() => undefined)
    try {
      const first = await Promise.race([desktop, entry.wait])
      dropPending(pending.questions, entry.rpcId, undefined, entry, first === undefined ? undefined : 'answered')
      if (first !== undefined) {
        // 手机抢到了：桌面 card 会随 claim 释放或用户离开回收，这里兜底防 unhandled。
        desktop.catch(() => {})
        return first
      }
      return await desktop
    } catch (error) {
      dropPending(pending.questions, entry.rpcId, undefined, entry)
      throw error
    }
  }

  /** waterfall 监听器：登记手机待处理项，并把 next() 与手机应答 race。 */
  function claimApproval(req, next) {
    try {
      const entry = registerApproval(req)
      if (entry === undefined) return next()
      return settleApproval(entry, next)
    } catch {
      // 登记失败绝不能影响宿主审批链：原样交还桌面。
      return next()
    }
  }

  /** waterfall 监听器：提问同上。 */
  function claimQuestion(req, next) {
    try {
      const entry = registerQuestion(req)
      if (entry === undefined) return next()
      return settleQuestionRace(entry, next)
    } catch {
      return next()
    }
  }

  function purgePending(now = Date.now()) {
    for (const [rpcId, entry] of [...pending.approvals]) {
      if (entry.expiresAt > now) continue
      // 放开手机那条等待链：desktop 分支依然活着，会话不会挂死。
      dropPending(pending.approvals, rpcId, entry.approvalId, entry)
      entry.resolve(undefined)
    }
    for (const [rpcId, entry] of [...pending.questions]) {
      if (entry.expiresAt > now) continue
      dropPending(pending.questions, rpcId, undefined, entry)
      entry.resolve(undefined)
    }
  }

  /** 防御式取 permissionPresets 服务：没装配该插件时返回 undefined，由调用方降级。 */
  function permissionPresets() {
    const pp = typeof ctx.get === 'function' ? ctx.get('permissionPresets') : undefined
    return pp || undefined
  }

  /** sessionId → Session 对象；permissionPresets 的 current/set 收的是 Session。 */
  function sessionById(sessionId) {
    const id = String(sessionId || '')
    if (id === '') return undefined
    const store = typeof ctx.get === 'function' ? ctx.get('sessions') : undefined
    if (!store || typeof store.get !== 'function') return undefined
    try {
      return store.get(id)
    } catch {
      return undefined
    }
  }

  /**
   * 四个 Agent 预设的中文名与一句话说明。
   *
   * 宿主 profile 里的 preset 定义只有 id/order，**没有 name/description**，
   * 所以 `agentPreset.list` 原样透传时，手机端的模式列表只能显示英文 id
   *（`standard` / `ptc` / `minimal` / `cordis`），对用户毫无意义。
   * bundle 的消费点是：
   *   · 下拉列表 `.sheet-option-title` = `e.name ?? e.id`，副标题 = `e.description`
   *   · 列表页卡片 `.mobile-presetTriggerTitle` = `Ge.name ?? D`，desc 同名字段
   * 因此在这一层补中文名与说明即可（不改 bundle、也不用动宿主 profile）。
   * 宿主若将来自己提供了 name/description，下面的实现优先用宿主的，不会被覆盖。
   */
  const PRESET_TEXT = {
    standard: {
      name: '默认模式',
      description: '完整工具集（命令、文件、搜索、任务、技能），适合日常使用',
    },
    ptc: {
      name: 'PTC 模式',
      description: '在默认工具集之上增加工具展示，工具调用过程更清晰',
    },
    minimal: {
      name: '最简模式',
      description: '只保留文件与终端工具，响应更快、更省 token',
    },
    cordis: {
      name: '工具创造模式',
      description: '用于编写与调试插件/工具（Cordis 组合）',
    },
  }

  /**
   * 决定一次 prompt 真正采用的发送模式（需求 B 的宿主侧兜底）。
   *
   * 优先级：请求显式带的 mode > 用户存的设置 > 默认 queue。
   * 「显式带」只认 'steer'/'queue' 两个合法值；bundle 写死的 mode:`queue`
   * 会走第一档（与默认同值，不改变既有行为），注入脚本改写后才真正切到 steer。
   */
  function resolveSendMode(requested) {
    if (requested === SEND_MODE_STEER || requested === SEND_MODE_QUEUE) return requested
    return sendMode
  }

  /** 手机端读设置用：把当前发送模式随启动探针一起下发。 */
  function sendModeView() {
    return { sendMode, mobileEnterToSend: true }
  }

  /**
   * 读当前权限视图，结构对齐 bundle 的解码器（{ options:[{value,name,description?}], currentValue }）。
   *
   * 一律返回 ok:true 的空/降级结构，绝不因为服务缺失而抛错或返回 ok:false：
   * bundle 会把 rejection 吞掉并保持「加载中」，面板就永远打不开了。
   */
  function readPermissionView(payload) {
    const empty = { options: [], currentValue: '', available: false }
    const pp = permissionPresets()
    if (!pp) return empty
    let options = []
    let defaultPreset = ''
    try {
      const catalog = typeof pp.catalog === 'function' ? pp.catalog() : undefined
      // catalog() 返回 { options, defaultOptions, defaultPreset }；
      // options 已含「当前存活的 auto」，defaultOptions 只含静态配置的预设。
      const raw = (catalog && Array.isArray(catalog.options)) ? catalog.options : []
      options = raw
        .map((o) => {
          if (!o || typeof o !== 'object') return null
          const value = typeof o.value === 'string' ? o.value : ''
          const name = typeof o.name === 'string' ? o.name : ''
          if (value === '' || name === '') return null
          // 只翻译展示文案：value 原样保留（切权限时回传给宿主 pp.set 的标识），
          // name 走中文映射，未命中则保留原文，绝不丢弃选项。
          const desc = permissionDesc(value, typeof o.description === 'string' ? o.description : '')
          return {
            value,
            name: permissionLabel(name),
            ...(desc !== '' ? { description: desc } : {}),
          }
        })
        .filter(Boolean)
      defaultPreset = (catalog && typeof catalog.defaultPreset === 'string') ? catalog.defaultPreset : ''
    } catch {
      return empty
    }
    let currentValue = ''
    const session = sessionById(payload && payload.sessionId)
    if (session) {
      try {
        if (typeof pp.current === 'function') currentValue = String(pp.current(session) || '')
      } catch {
        currentValue = ''
      }
    }
    // 会话已结束/拿不到时，回落到默认预设，至少让面板有别的东西可显示。
    if (currentValue === '' && defaultPreset !== '') currentValue = defaultPreset
    return { options, currentValue, available: true, defaultPreset }
  }

  async function dispatchRpc(method, payload, rpcContext) {
    const controller = sc()
    switch (method) {
      case 'session.list': {
        const { items = [] } = await controller.list({ cursor: payload.cursor }, new AbortController().signal)
        // 归档过滤：sessionController.list() 只回答「会话存不存在」，它不知道归档集合。
        // 归档是 workspaceRegistry 的职责 —— 它的 getter 注释写明这是
        // 「registry-global archive set: sessions hidden from every grouping surface」，
        // 桌面端就是拿这个集合自己从列表里剔除的。手机端走同一个 RPC，少了这一步
        // 就会出现「点了删除、列表里还在」。取不到 registry（未 inject / 版本差异）
        // 时退化为不过滤，而不是让整个列表报错。
        let hidden = null
        try {
          const reg = wr()
          const ids = reg && reg.archivedSessionIds
          if (Array.isArray(ids) && ids.length > 0) hidden = new Set(ids)
        } catch (err) {
          console.error('[dsh-mobile] archivedSessionIds unavailable:', err && err.message)
        }
        const visible = hidden === null ? items : items.filter((item) => !hidden.has(item.sessionId))
        return { ok: true, value: { items: visible } }
      }
      case 'session.history': {
        if (!payload.sessionId) return { ok: false, error: { code: 'bad-request', message: 'sessionId required' } }
        const parentHint = typeof payload.parentSessionId === 'string' ? payload.parentSessionId : undefined
        // 子代理面板点开某行看聊天时带 subscribe:true —— 表示「这台设备开始看这个会话」。
        // 登记后 openMux 的 syncTimer 会为它起宿主流，子代理的增量就随 SSE 边跑边到，
        // 而不是等下次轮询才整段出现。
        //
        // 必须在 readHistory 之前登记：历史是既成事实，增量是未来；登记晚于读历史的话，
        // 落在两者之间的增量无人推送，会永久丢字。
        //
        // 用 addObservationExtra（并集）而不是 addObservation（赋值）——
        // 面板浮在当前聊天页之上，看子代理不等于离开主会话，两条流都要留着。
        if (payload.subscribe === true && rpcContext && typeof rpcContext.deviceId === 'string') {
          const sid = String(payload.sessionId)
          // 子代理会话必须走 durable 父地址，先把父子关系记住（每行自带 parentId）。
          if (typeof parentHint === 'string' && parentHint !== '' && parentHint !== sid) {
            subagentParent.set(sid, parentHint)
          }
          addObservationExtra(rpcContext.deviceId, sid)
          ensureFollow(sid)
        }
        return {
          ok: true,
          value: await readHistory(payload.sessionId, payload.beforeSeq, payload.maxMessages, parentHint),
        }
      }
      case 'session.prompt': {
        const requestId = `req-${randomBytes(8).toString('hex')}`
        await controller.prompt(
          {
            requestId,
            sessionId: payload.sessionId,
            // 发送模式生效点（需求 B）。
            // bundle 里 ce() 写死 mode:`queue`，改不了；所以真值来源是两条：
            //   ① 注入脚本在发消息前按设置改写 payload.mode（前端默认路径）；
            //   ② 宿主这里读已存的 sendMode 兜底（payload 没带时也一定生效）。
            // 两条都不依赖对方：只有前端改写时用它，前端没改写时用它存的默认值。
            mode: resolveSendMode(payload.mode),
            content: Array.isArray(payload.content) ? payload.content : [],
            ...(payload.clientTimeZone ? { clientTimeZone: payload.clientTimeZone } : {}),
          },
          new AbortController().signal,
        )
        // Agent 忙时这条消息会进队列（Agent 空闲时直接进会话，队列为空帧）。
        // 宿主 prompt() 返回不等于消息已落盘，晚一拍再读才拿得到 inbox 的新行。
        if (typeof setTimeout === 'function') {
          setTimeout(() => emitQueue(payload.sessionId), 120)
        }
        return { ok: true, value: { accepted: true } }
      }
      case 'session.create': {
        const value = await controller.create({
          ...(payload.workspaceId ? { workspaceId: payload.workspaceId } : {}),
          ...(payload.cwd ? { cwd: payload.cwd } : {}),
          ...(payload.sessionId ? { sessionId: payload.sessionId } : {}),
          ...(payload.agentPreset ? { agentPreset: payload.agentPreset } : {}),
        })
        return { ok: true, value: { sessionId: value.sessionId, ...(value.agentPreset ? { agentPreset: value.agentPreset } : {}) } }
      }
      case 'session.models': {
        const catalog = await controller.modelCatalog()
        const hidden = new Set((Array.isArray(cfg.hiddenModels) ? cfg.hiddenModels : []).map(String))
        // 手机端不展示模型英文简介：bundle 会在模型名下方渲染 description。
        const groups = (catalog.groups || [])
          .map((g) => ({
            ...g,
            models: (g.models || [])
              .filter((m) => !hidden.has(m.id))
              .map((m) => {
                const { description, ...model } = m
                return model
              }),
          }))
          .filter((g) => g.models.length > 0)
        return {
          ok: true,
          value: {
            current: catalog.default,
            routable: (catalog.routableProviders || []).length > 0,
            groups,
            failures: catalog.failures || [],
          },
        }
      }
      case 'session.selectModel': {
        const value = await controller.selectModel({
          sessionId: payload.sessionId,
          provider: payload.provider,
          model: payload.model,
          ...(payload.reasoningEffort ? { reasoningEffort: payload.reasoningEffort } : {}),
        })
        return { ok: true, value: { selected: value.selected } }
      }
      case 'session.rename': {
        const value = await controller.rename({ sessionId: payload.sessionId, title: payload.title })
        return { ok: true, value: { title: value.title, seq: value.seq } }
      }
      case 'session.cancel': {
        controller.cancel({ sessionId: payload.sessionId })
        return { ok: true, value: { accepted: true } }
      }
      case 'session.updateQueue': {
        await controller.updateQueue({ sessionId: payload.sessionId, itemId: payload.itemId, action: payload.action })
        // 编辑/移除/插队都改了队列：立刻重推一帧，dock 当场增删行。
        // 先清指纹，避免「内容变了但结构相同」被判重吃掉。
        forgetQueue(payload.sessionId)
        emitQueue(payload.sessionId)
        return { ok: true, value: { accepted: true } }
      }
      case 'session.search': {
        const value = await controller.search({ query: payload.query }, new AbortController().signal)
        return { ok: true, value: { items: value.items || [], hasMore: !!value.hasMore } }
      }
      case 'workspace.list': {
        const items = (wr() ? wr().list() : []).map(toWorkspaceView)
        return { ok: true, value: { items, archivedSessionIds: [] } }
      }
      case 'workspace.create': {
        const controller = wc()
        if (!controller || typeof controller.create !== 'function') {
          return { ok: false, error: { code: 'unavailable', message: '工作区服务不可用' } }
        }
        // bundle 的 dir-browser 只传 path（L(path)），title 是可选的。
        const value = await controller.create({
          ...(payload.path ? { path: payload.path } : {}),
          ...(payload.title ? { title: payload.title } : {}),
        })
        // 契约：{ workspace: {...}, created: boolean }；bundle 读的是 .workspace。
        return { ok: true, value }
      }
      case 'workspace.rename': {
        const controller = wc()
        if (!controller || typeof controller.rename !== 'function') {
          return { ok: false, error: { code: 'unavailable', message: '工作区服务不可用' } }
        }
        const value = await controller.rename({ workspaceId: payload.workspaceId, title: payload.title })
        return { ok: true, value }
      }
      case 'workspace.delete': {
        const controller = wc()
        if (!controller || typeof controller.delete !== 'function') {
          return { ok: false, error: { code: 'unavailable', message: '工作区服务不可用' } }
        }
        await controller.delete({ workspaceId: payload.workspaceId })
        return { ok: true, value: { deleted: true } }
      }
      case 'workspace.archiveSession': {
        // 契约（宿主 api-workspace-controller）：archiveSession({ sessionId, stopActivity })
        // → { archivedSessionIds }。registry 上这个方法接收 (sessionId, options)，
        // 把归档集合装进自己的状态；它**不会**替我们过滤 session.list，
        // 所以上面那条 list 必须自己按 archivedSessionIds 剔除（已加）。
        let archived = []
        try {
          const reg = wr()
          const result = await reg.archiveSession(payload.sessionId, { stopActivity: true })
          const ids = result && result.value && result.value.archivedSessionIds
          if (Array.isArray(ids) && ids.length > 0) archived = ids
          else if (Array.isArray(reg.archivedSessionIds)) archived = [...reg.archivedSessionIds]
        } catch (err) {
          const message = err && err.message ? err.message : String(err)
          console.error('[dsh-mobile] archiveSession failed:', message)
          return { ok: false, error: { code: 'archive-failed', message } }
        }
        if (archived.length === 0) archived = [String(payload.sessionId)]
        return { ok: true, value: { archivedSessionIds: archived } }
      }
      case 'mobile.preferences': {
        // 手机 bundle 的启动探针；形态必须匹配 dsh-palm，否则会判定「连不上 host」。
        // 复用它做「发送模式」的读+写通道（需求 A）：
        //   读：不带 sendMode → 返回 { mobileEnterToSend, sendMode }
        //   写：带 payload.sendMode（'queue'|'steer'）→ 落盘并返回新值
        // 复用而不是新增 RPC，是因为 bundle 启动时必定调它一次，
        // 设置页不用等别的往返就能拿到当前值。
        const requested = payload && typeof payload === 'object' ? payload.sendMode : undefined
        if (requested === SEND_MODE_STEER || requested === SEND_MODE_QUEUE) {
          sendMode = normalizeSendMode(requested)
          saveSendMode(cfg.sendModeFile, sendMode)
          // 立刻把新值扇出给所有在线手机：设置页开在另一台设备/标签上也应同步。
          if (typeof emitMux === 'function') {
            emitMux({ type: 'mobile/preferences', sendMode, mobileEnterToSend: true })
          }
        }
        return { ok: true, value: sendModeView() }
      }
      case 'mobile.runningSessions': {
        const { items = [] } = await controller.list({}, new AbortController().signal)
        return { ok: true, value: { sessionIds: items.filter((it) => it.running).map((it) => it.sessionId) } }
      }
      case 'mobile.pending': {
        purgePending()
        const sessionId = typeof payload.sessionId === 'string' ? payload.sessionId : ''
        const approvals = []
        const questions = []
        for (const entry of pending.approvals.values()) {
          if (sessionId !== '' && entry.sessionId !== sessionId) continue
          approvals.push(approvalView(entry))
        }
        for (const entry of pending.questions.values()) {
          if (sessionId !== '' && entry.sessionId !== sessionId) continue
          // questionView 返回拍平后的数组（每项自带 rpcId），直接展开进 questions。
          questions.push(...questionView(entry))
        }
        return { ok: true, value: { approvals, questions } }
      }
      // ── 设置页 ──
      case 'settings.read':
      case 'settings.describe': {
        const settings = typeof ctx.get === 'function' ? ctx.get('settings') : undefined
        if (!settings || typeof settings.describe !== 'function') {
          return { ok: true, value: { writable: false, hasDocument: false, namespaces: [] } }
        }
        let list
        try {
          list = settings.describe({ redactSecrets: true })
        } catch {
          list = []
        }
        const namespaces = (Array.isArray(list) ? list : []).map((d) => ({
          ns: d.ns,
          schema: d.schema,
          value: d.value,
          ...(d.base !== undefined ? { base: d.base } : {}),
          ...(d.user !== undefined ? { user: d.user } : {}),
          applies: d.applies || 'live',
          secrets: Array.isArray(d.secrets) ? d.secrets : [],
          revision: d.revision,
        }))
        return { ok: true, value: { writable: false, hasDocument: false, namespaces } }
      }
      case 'settings.mutate': {
        return { ok: false, error: { code: 'not-found', message: '设置项不可用' } }
      }
      // ── 设备管理 ──
      case 'pair.devices': {
        const list = [...devices.entries()].map(([deviceId, d]) => ({
          deviceId,
          name: d.name || '设备',
          createdAt: d.createdAt,
          lastSeenAt: d.lastSeenAt,
          userAgent: d.userAgent || '',
          primary: d.primary === true,
        }))
        return { ok: true, value: { devices: list, maxDevices: MAX_DEVICES } }
      }
      case 'pair.revoke': {
        const removed = devices.delete(String(payload.deviceId || ''))
        if (removed) persistDevices(cfg.devicesFile, devices)
        return { ok: true, value: { removed } }
      }
      case 'pair.rename': {
        const d = devices.get(String(payload.deviceId || ''))
        if (!d) return { ok: false, error: { code: 'not-found', message: '设备不存在' } }
        const name = String(payload.name || '').trim().slice(0, 40)
        if (name !== '') d.name = name
        persistDevices(cfg.devicesFile, devices)
        return { ok: true, value: { ok: true } }
      }
      case 'pair.setPrimary': {
        const target = String(payload.deviceId || '')
        if (!devices.has(target)) return { ok: false, error: { code: 'not-found', message: '设备不存在' } }
        for (const [, d] of devices) d.primary = false
        devices.get(target).primary = true
        persistDevices(cfg.devicesFile, devices)
        return { ok: true, value: { ok: true } }
      }
      // ── 预设 / 子代理 ──────────────────────────────────────────────────
      //
      // agentPreset.list 的真实数据面。bundle（assets/mobile.bundle.js，禁止改）
      // 对这个返回值的消费点只有两处，字段就是它们读到的那些：
      //   ① 会话页：`ie().then(t => { let n = t.presets.filter(e => e.broken === void 0);
      //        O((n.find(e => e.isDefault) ?? n[0])?.id) })` —— 读 presets[]、id、name、
      //      description、isDefault（`broken` 的行会被过滤掉，`trust` 只用于显示「本地」）。
      //   ② 设置页 `zu()`：`agent-presets.default` 的候选值就是 `t.map(e => e.id)`。
      // 所以必须给真实 presets，且 isDefault 只能由宿主算：registry 的 list() 不带它，
      // 带它的是 remoteExportList()（也就是 Remote 名 list 的那个方法）。
      // 服务缺失/读失败一律 ok:true + 空数组 —— bundle 的 .then 必须能安全跑完。
      case 'agentPreset.list': {
        const svc = typeof ctx.get === 'function' ? ctx.get('agentPresets') : undefined
        if (!svc || (typeof svc.remoteExportList !== 'function' && typeof svc.list !== 'function')) {
          return { ok: true, value: { presets: [], authorable: false, hasDocument: false } }
        }
        try {
          const defaultId = typeof svc.defaultId === 'string' ? svc.defaultId : ''
          let rows
          if (typeof svc.remoteExportList === 'function') {
            const roster = await svc.remoteExportList()
            rows = roster && Array.isArray(roster.presets) ? roster.presets : []
          } else {
            rows = await svc.list()
          }
          const presets = (Array.isArray(rows) ? rows : [])
            .map((row) => {
              const r = row && typeof row === 'object' ? row : {}
              const id = r.id === undefined ? '' : String(r.id)
              // 宿主 preset 定义没有 name/description：用 PRESET_TEXT 补中文，
              // 宿主自己提供了就优先用宿主的（见常量上方的注释）。
              const zh = PRESET_TEXT[id] || {}
              const name = typeof r.name === 'string' && r.name !== '' ? r.name : zh.name
              const description =
                typeof r.description === 'string' && r.description !== '' ? r.description : zh.description
              return {
                id,
                ...(name !== undefined ? { name } : {}),
                ...(description !== undefined ? { description } : {}),
                ...(typeof r.order === 'number' ? { order: r.order } : {}),
                isDefault: id !== '' && (r.isDefault === true || id === defaultId),
                ...(typeof r.broken === 'string' && r.broken !== '' ? { broken: r.broken } : {}),
              }
            })
            .filter((row) => row.id !== '')
          // 当前会话绑定的预设 + 是否还是空白会话（都只有活着的 Agent 读得到；
          // 读不到就不返回这两个字段，前端会退回 DOM 判据，绝不猜）。
          let current
          let blank
          const sidForRead = typeof payload?.sessionId === 'string' ? payload.sessionId : ''
          if (sidForRead !== '') {
            try {
              const agents = typeof ctx.get === 'function' ? ctx.get('agents') : undefined
              const agent = agents && typeof agents.get === 'function' ? agents.get(sidForRead) : undefined
              if (agent) {
                if (typeof svc.composedPreset === 'function') {
                  const id = svc.composedPreset(agent.ctx)
                  if (typeof id === 'string' && id !== '') current = id
                }
                // 与 agentPresets.select() 同一条判据：turnBoundary 有开着的轮次
                // 或已经跑过轮次，就不再是「首条消息之前」。
                const projections = typeof ctx.get === 'function' ? ctx.get('sessionProjections') : undefined
                if (projections && typeof projections.stateOf === 'function') {
                  const boundary = projections.stateOf(agent.session, 'turnBoundary')
                  if (boundary && typeof boundary === 'object') {
                    const open = boundary.openTurnStartSeq !== null && boundary.openTurnStartSeq !== undefined
                    const ran = typeof boundary.lastTurn === 'number' && boundary.lastTurn > 0
                    blank = !open && !ran
                  }
                }
              }
            } catch {
              /* 读不到就省略：不给前端伪造一个「当前模式」或「空白」 */
            }
          }
          return {
            ok: true,
            value: {
              presets,
              authorable: false,
              hasDocument: false,
              ...(current ? { current } : {}),
              ...(blank === undefined ? {} : { blank }),
            },
          }
        } catch {
          return { ok: true, value: { presets: [], authorable: false, hasDocument: false } }
        }
      }
      // 切换某个**空白会话**的 Agent 预设（手机工具栏「聊天模式」按钮）。
      // 宿主 agentPresets.select(agent, preset) 自己读 turnBoundary 投影：首条消息
      // 之前才允许改绑，已开轮次抛 agent-preset/locked —— 这里不重复判断，只把
      // 真实结果（成功的新 id / 失败的 code+message）如实回传，前端不猜。
      case 'mobile.setAgentPreset': {
        const sid = String(payload && payload.sessionId ? payload.sessionId : '')
        const wanted = String(payload && payload.agentPreset ? payload.agentPreset : '').trim()
        if (sid === '' || wanted === '') {
          return { ok: false, error: { code: 'bad-request', message: '缺少会话或模式标识' } }
        }
        const svc = typeof ctx.get === 'function' ? ctx.get('agentPresets') : undefined
        if (!svc || typeof svc.select !== 'function') {
          return { ok: false, error: { code: 'unavailable', message: '宿主未提供 Agent 预设服务，无法在已建会话上切换模式' } }
        }
        let agent
        try {
          const agents = typeof ctx.get === 'function' ? ctx.get('agents') : undefined
          agent = agents && typeof agents.get === 'function' ? agents.get(sid) : undefined
          if (!agent) {
            const ctrl = sc()
            if (!ctrl || typeof ctrl.resolveAgent !== 'function') {
              return { ok: false, error: { code: 'unavailable', message: '会话控制器不可用，无法切到该会话' } }
            }
            const found = await ctrl.resolveAgent(sid)
            if (found && found.error) {
              return { ok: false, error: { code: found.error.code || 'not-found', message: found.error.message || '会话不可用' } }
            }
            agent = found && found.agent
          }
        } catch (err) {
          return { ok: false, error: { code: 'internal', message: String((err && err.message) || err) } }
        }
        if (!agent) return { ok: false, error: { code: 'not-found', message: '会话没有可用的 Agent' } }
        try {
          const selected = await svc.select(agent, wanted)
          return { ok: true, value: { sessionId: sid, agentPreset: selected } }
        } catch (err) {
          return {
            ok: false,
            error: {
              code: err && err.code ? String(err.code) : 'error',
              message: err && err.message ? String(err.message) : '切换失败',
            },
          }
        }
      }
      case 'subagent.list': {
        const parentSessionId = typeof payload?.parentSessionId === 'string' ? payload.parentSessionId : ''
        if (parentSessionId === '') return { ok: true, value: { entries: [], parentAvailable: false } }
        const subagents = typeof ctx.get === 'function' ? ctx.get('subagents') : undefined
        if (!subagents || typeof subagents.listDescendants !== 'function') {
          return { ok: true, value: { entries: [], parentAvailable: false } }
        }
        try {
          const rows = await subagents.listDescendants(parentSessionId, new AbortController().signal)
          // 顺手登记「子代理 id → 父会话 id」：面板点开某行看聊天时要用父地址读，
          // 这里记住了就免去反查（每行自带 parentId，本函数的入参就是它）。
          recordSubagentParents(rows)
          return { ok: true, value: { entries: rows, parentAvailable: rows.length > 0 } }
        } catch {
          return { ok: true, value: { entries: [], parentAvailable: false } }
        }
      }
      // ── 命令 / 搜索 ──
      case 'mobile.commands': {
        return { ok: true, value: { items: [] } }
      }
      case 'mobile.commandExec': {
        return { ok: false, error: { code: 'not-supported', message: '命令执行暂未开放' } }
      }
      // ── 权限预设（手机工具栏「权限」按钮） ──────────────────────────────
      // bundle 自带的权限面板走两条通道：会话投影 projections.values.permissions
      // （读）和 slash 命令 `/permission <name>`（写）。后者在本插件里没有实现，
      // 所以手机上一直切不动权限。这里补一对专用 RPC，由自绘面板直接调用。
      case 'mobile.permissions.get': {
        return { ok: true, value: readPermissionView(payload) }
      }
      case 'mobile.permissions.set': {
        const name = String((payload && payload.preset) || '').trim()
        if (name === '') {
          return { ok: false, error: { code: 'bad-request', message: '缺少权限预设名' } }
        }
        const view = readPermissionView(payload)
        // 敏感操作：只允许切到宿主 catalog 里真实存在的预设值。
        // view.options 是从 catalog() 现读的，未知名一律拒绝，绝不静默放宽权限。
        const known = view.options.some((o) => o.value === name)
        if (!known) {
          return {
            ok: false,
            error: {
              // 提示里列出的是「中文名（英文值）」：既看得懂，又能照着确认真实标识。
              code: 'unknown-preset',
              message: `未知权限预设「${name}」（可用：${view.options.map((o) => `${o.name}（${o.value}）`).join('、') || '无'}）`,
            },
          }
        }
        const pp = permissionPresets()
        if (!pp || typeof pp.set !== 'function') {
          return { ok: false, error: { code: 'unavailable', message: '权限预设服务不可用，无法切换' } }
        }
        const session = sessionById(payload && payload.sessionId)
        if (!session) {
          return { ok: false, error: { code: 'not-found', message: '会话不存在或已结束' } }
        }
        try {
          pp.set(session, name)
        } catch (error) {
          return {
            ok: false,
            error: { code: 'set-failed', message: error instanceof Error ? error.message : String(error) },
          }
        }
        // 切完立即回读，让面板拿到宿主真实生效的值（而不是前端猜的值）。
        return { ok: true, value: readPermissionView(payload) }
      }
      case 'mobile.searchAll':
      case 'mobile.searchMessages': {
        return { ok: true, value: { items: [], hasMore: false } }
      }
      // ── 通知 / 推送 ──
      case 'mobile.notifyEvents': {
        return { ok: true, value: { items: [] } }
      }
      case 'push.config': {
        const body = payload || {}
        if (body.test === true) {
          deliverNotify(notifyConfig, { title: 'dsh 掌上 · 测试通知', body: '收到这条说明推送通道工作正常。' }).catch(() => {})
          return { ok: true, value: { sent: true } }
        }
        if (body.get === true) {
          const c = notifyConfig
          return {
            ok: true,
            value: {
              turnThresholdMs: c.turnThresholdMs,
              turnCooldownMs: c.turnCooldownMs,
              hideDetails: c.hideDetails === true,
              kinds: {
                jobs: !!(c.kinds && c.kinds.jobs === true),
                todo: !(c.kinds && c.kinds.todo === false),
                turns: !!(c.kinds && c.kinds.turns === true),
              },
              vapidPublicKey: '',
              channels: notifyChannelsView(c.channels),
            },
          }
        }
        const patch = body.set
        if (!patch || typeof patch !== 'object') {
          return { ok: false, error: { code: 'bad-request', message: '缺少配置内容' } }
        }
        const next = { ...notifyConfig }
        if (typeof patch.turnThresholdMs === 'number' && Number.isFinite(patch.turnThresholdMs)) next.turnThresholdMs = Math.max(0, Math.round(patch.turnThresholdMs))
        if (typeof patch.turnCooldownMs === 'number' && Number.isFinite(patch.turnCooldownMs)) next.turnCooldownMs = Math.max(0, Math.round(patch.turnCooldownMs))
        if (typeof patch.hideDetails === 'boolean') next.hideDetails = patch.hideDetails
        if (patch.kinds && typeof patch.kinds === 'object') next.kinds = { ...(notifyConfig.kinds || {}), ...patch.kinds }
        if (patch.channels && typeof patch.channels === 'object') {
          const merged = { ...(notifyConfig.channels || {}) }
          for (const [k, v] of Object.entries(patch.channels)) {
            if (v && typeof v === 'object') merged[k] = { ...(merged[k] || {}), ...v }
          }
          next.channels = merged
        }
        notifyConfig = next
        saveNotifyConfig(cfg.pushConfigFile, notifyConfig)
        return { ok: true, value: { stored: true } }
      }
      case 'push.subscribe':
      case 'push.unsubscribe': {
        return { ok: true, value: { ok: true } }
      }
      // ── 语音 / 附件 / 文件 ──
      case 'mobile.voiceServices': {
        const list = Array.isArray(cfg.transcribeServices) ? cfg.transcribeServices : []
        return {
          ok: true,
          value: {
            services: list.map((s) => ({ name: s.name || '转写服务', baseURL: s.baseURL || '', model: s.model || '' })),
          },
        }
      }
      case 'mobile.transcribe': {
        const text = await transcribeAudio(payload.audio, payload.services)
        if (text === null) {
          return {
            ok: false,
            error: {
              code: 'transcribe-failed',
              message: '转写失败：请在手机「设置 → 语音服务」添加一个 OpenAI 兼容的转写服务',
            },
          }
        }
        return { ok: true, value: { text } }
      }
      case 'mobile.readAttachment': {
        // 0.1.5 起消息事件只带 attachmentId 引用；宿主按「该会话确实引用过这张图」授权。
        const sessionId = typeof payload.sessionId === 'string' ? payload.sessionId : ''
        const attachmentId = typeof payload.attachmentId === 'string' ? payload.attachmentId : ''
        if (sessionId === '' || attachmentId === '') {
          return { ok: false, error: { code: 'invalid-request', message: '缺少会话或附件标识' } }
        }
        const result = await sc().attachment({ sessionId, attachmentId })
        const mediaType = typeof result?.attachment?.mediaType === 'string' ? result.attachment.mediaType : 'image/jpeg'
        const data = typeof result?.data === 'string' ? result.data : ''
        if (data === '') {
          return { ok: false, error: { code: 'internal', message: '图片读取失败' } }
        }
        return { ok: true, value: { mediaType, dataUrl: `data:${mediaType};base64,${data}` } }
      }
      case 'mobile.readFile': {
        return { ok: false, error: { code: 'unavailable', message: '文件预览暂未开放' } }
      }
      case 'mobile.listDirectory': {
        //
        // 「新建工作区」→ 目录选择页（bundle 的 dir-browser / Dd）进来这里。
        // 该组件渲染时无条件做 n.crumbs.map(...) 与 n.entries.map(...)，所以
        // 返回体必须同时带上 crumbs 和 entries 两个数组；以前这里返回
        // { entries: [] }（没有 crumbs），组件一渲染就抛
        // "Cannot read properties of undefined (reading 'map')" —— 页面白屏。
        //
        // 目录读取一律走宿主的 directoryPickerController（受控、可取消、带
        // home/crumbs/truncated），绝不用裸 fs.readdir 打开任意路径。
        //
        const picker = dp()
        if (!picker || typeof picker.list !== 'function') {
          return { ok: false, error: { code: 'unavailable', message: '目录浏览不可用（宿主未提供 directoryPickerController）' } }
        }
        const requested = typeof payload?.path === 'string' && payload.path !== '' ? payload.path : undefined
        try {
          const listing = await picker.list(requested, new AbortController().signal)
          // 契约（@deepseek-ai/dsh-host-directory-picker/types#DirectoryListing）：
          //   { path, home, crumbs[], entries[], truncated }
          // 每项 { name, path, hidden }。这里再兜一层底：即使宿主少给了字段，
          // 也要保证两个数组存在，永不把 undefined 交给 .map()。
          const crumbs = Array.isArray(listing?.crumbs) ? listing.crumbs : []
          const entries = Array.isArray(listing?.entries) ? listing.entries : []
          return {
            ok: true,
            value: {
              path: typeof listing?.path === 'string' ? listing.path : (requested ?? ''),
              home: typeof listing?.home === 'string' ? listing.home : '',
              crumbs,
              entries,
              truncated: listing?.truncated === true,
            },
          }
        } catch (err) {
          return {
            ok: false,
            error: {
              code: 'list-failed',
              message: (err && err.message) || '读取目录失败',
            },
          }
        }
      }
      case 'mobile.previews': {
        // bundle 的调用点是 `(await m('mobile.previews', {sessionIds})).items`，
        // 然后对结果直接 `for (const x of items)`。这里返回空对象 `{}` 时
        // `.items` 是 undefined，页面就会稳定抛 `TypeError: e is not iterable`
        //（会话摘要预取静默失败）。契约要求 items 是数组，空也要给 []。
        return { ok: true, value: { items: [] } }
      }
      case 'mobile.readChat': {
        return { ok: false, error: { code: 'unavailable', message: '折叠会话读取不可用' } }
      }
      case 'mobile.respond': {
        // bundle 发的是 { rpcId, response: {...} }，dispatchRpc 拿到的是 envelope.payload，
        // 所以 payload.response 就是那个 response；为稳妥起见两种形态都兼容。
        const response = payload && typeof payload.response === 'object' && payload.response !== null ? payload.response : payload
        const sessionId = typeof response.sessionId === 'string' ? response.sessionId : ''
        // ── 形态 A：审批应答 ──
        if (typeof response.approvalId === 'string' && response.approvalId !== '') {
          const rpcId = pending.byApprovalId.get(response.approvalId)
          const entry = rpcId === undefined ? undefined : pending.approvals.get(rpcId)
          if (entry === undefined) {
            return { ok: false, error: { code: 'not-pending', message: '该审批已不存在或已处理' } }
          }
          if (sessionId !== '' && entry.sessionId !== sessionId) {
            return { ok: false, error: { code: 'session-mismatch', message: '会话不匹配' } }
          }
          const allowed = new Set(['allowed-once', 'rejected', 'cancelled'])
          const outcome = response.outcome
          if (typeof outcome !== 'string' || !allowed.has(outcome)) {
            // 红线：不认识的结果一律拒绝，绝不隐式批准。
            return { ok: false, error: { code: 'bad-request', message: `outcome 必须是 ${[...allowed].join(' / ')}` } }
          }
          dropPending(pending.approvals, rpcId, response.approvalId, entry, outcome)
          entry.resolve(outcome)
          return { ok: true, value: { accepted: true } }
        }
        // ── 形态 B：提问应答 ──
        if (response.answer !== undefined && response.answer !== null) {
          const answer = response.answer
          if (!answer || typeof answer !== 'object' || !Array.isArray(answer.answers)) {
            return { ok: false, error: { code: 'bad-request', message: 'answer 必须是 { answers: [...] }' } }
          }
          // bundle 用 rpcId 定位提问条目（relayQ 发送 { rpcId, response:{ sessionId, answer } }）。
          const rpcId = typeof payload.rpcId === 'string' ? payload.rpcId : ''
          const entry = rpcId === '' ? undefined : pending.questions.get(rpcId)
          if (entry === undefined) {
            return { ok: false, error: { code: 'not-pending', message: '该提问已不存在或已回答' } }
          }
          if (sessionId !== '' && entry.sessionId !== sessionId) {
            return { ok: false, error: { code: 'session-mismatch', message: '会话不匹配' } }
          }
          dropPending(pending.questions, rpcId, undefined, entry, 'answered')
          entry.resolve(answer)
          return { ok: true, value: { accepted: true } }
        }
        return { ok: false, error: { code: 'bad-request', message: '缺少 approvalId 或 answer' } }
      }
      // ── 诊断 ──
      case 'mobile.latestVersion': {
        return { ok: true, value: { latest: '0.1.0', isNewer: false } }
      }
      // ── 用量 / 套餐与配额：只报 DeepSeek 官方余额 ────────────────────────
      // 数据一律在宿主进程内取：优先平台登录态（不需要 API Key），取不到再回退到
      // Key 直查；两者都拿不到就 no-key。**切忌返回 ok:false**：bundle 挂载时
      // F().then(...) 的 rejection 是被吞掉的，那时页面会永远卡在「加载中…」。
      case 'mobile.usage': {
        const usageBody = payload && typeof payload === 'object' ? payload : {}
        const usageNow = Date.now()
        if (usageBody.refresh !== true && usageCache.view !== null && usageNow - usageCache.at < USAGE_CACHE_TTL_MS) {
          return { ok: true, value: usageCache.view }
        }
        let usageProviders = []
        let usageFailed = false
        try {
          // 链路 A：平台登录态下的钱包余额，不需要任何 API Key。
          const viaAccount = await readAccountBalance(ctx)
          if (viaAccount !== undefined) {
            usageProviders = [{
              name: DEEPSEEK_BALANCE_NAME,
              baseURL: DEEPSEEK_BALANCE_BASE_URL,
              status: 'ok',
              kind: 'balance',
              balance: viaAccount,
              fetchedAt: usageNow,
            }]
          } else {
            // 链路 B：回退到 Key 直查官方 /user/balance。
            const apiKey = await apiKeyValue(ctx, 'DEEPSEEK_API_KEY')
            if (apiKey === undefined) {
              usageProviders = [{ name: DEEPSEEK_BALANCE_NAME, status: 'no-key', kind: 'balance', fetchedAt: usageNow }]
            } else {
              const direct = await queryOfficialBalance(apiKey)
              usageProviders = [{
                name: DEEPSEEK_BALANCE_NAME,
                baseURL: DEEPSEEK_BALANCE_BASE_URL,
                status: 'ok',
                kind: 'balance',
                balance: direct,
                fetchedAt: usageNow,
              }]
            }
          }
        } catch {
          // 超时 / 网络 / 解析失败都不该让页面卡住，也不冲掉上一次的好结果。
          usageFailed = true
          usageProviders = [{ name: DEEPSEEK_BALANCE_NAME, status: 'error', kind: 'balance', fetchedAt: usageNow }]
        }
        const usageView = { providers: usageProviders, fetchedAt: usageNow }
        // 成功才写缓存；失败保留旧值（首次失败时 usageCache.view 仍是 null）。
        if (!usageFailed) usageCache = { at: usageNow, view: usageView }
        if (usageCache.view === null) return { ok: true, value: usageView }
        return { ok: true, value: usageCache.view }
      }
      case 'mobile.error':
      case 'mobile.perf':
      case 'mobile.diagnostics': {
        return { ok: true, value: {} }
      }
      case 'mobile.observe': {
        // 手机不开 SSE 帧告诉我们它在看哪个会话（没有 handshake 帧），而是通过这条 RPC
        // 每 30s 重申一次。它是 mux 订阅语义的全部来源：登记这条 exclusive recurring，
        // openMux 的 syncTimer 就会为它起/停对应的 follow 流。
        const deviceId = rpcContext && rpcContext.deviceId
        if (typeof deviceId !== 'string') return { ok: true, value: {} }
        const sessionId = payload && typeof payload.sessionId === 'string' && payload.sessionId !== ''
          ? payload.sessionId
          : undefined
        if (sessionId === undefined) releaseDevice(deviceId)
        else addObservation(deviceId, sessionId)
        return { ok: true, value: {} }
      }
      default:
        return { ok: false, error: { code: 'not-supported', message: `method ${method} is not implemented by dsh-mobile` } }
    }
  }

  async function handleRpc(req, res, method) {
    const device = authenticatedDevice(req)
    if (!device) {
      req.resume()
      sendJson(res, 403, { ok: false, error: { code: 'unpaired', message: 'mobile session is not paired' } })
      return
    }
    let envelope
    try {
      const budget = method === 'session.prompt'
        ? PROMPT_BODY
        : method === 'mobile.transcribe' ? 12 * 1024 * 1024 : SMALL_BODY
      envelope = await readJsonBody(req, budget)
    } catch {
      sendJson(res, 400, { ok: false, error: { code: 'bad-request', message: 'invalid json body' } })
      return
    }
    const rpcId = typeof envelope.rpcId === 'string' ? envelope.rpcId : ''
    if (!rpcId) {
      sendJson(res, 400, { ok: false, error: { code: 'bad-request', message: 'missing rpcId' } })
      return
    }
    let result
    try {
      result = await dispatchRpc(method, envelope.payload || {}, { deviceId: device.deviceId })
    } catch (err) {
      const record = err && typeof err === 'object' ? err : {}
      result = {
        ok: false,
        error: {
          code: typeof record.code === 'string' ? record.code : 'internal',
          message: (err && err.message) || String(err),
          details: record.details || {},
        },
      }
    }
    sendJson(res, 200, { type: 'server-response', rpcId, result })
  }

  // ── SSE: /m/api/events.mux ─────────────────────────────────────────────────
  //
  // 帧信封契约来自手机 bundle 的 Pn() 解析器：
  //   { type:'server-request', rpcId:<string>, method:'events.mux', payload:<frame> }
  // payload.type 必须落在 bundle 的 15 项集合里（否则整帧静默丢弃），且 session/event
  // 的 payload.event 必须是对象。漏了外信封 = 手机静默丢弃 = 退回轮询，务必带上。
  //
  // 订阅语义（与 dsh-palm 一致）：**没有 handshake 帧**。手机从不用 mux 帧告诉我们它在
  // 看哪个会话 —— dsh-palm 里也没有 session/subscribed 的生产者。它改用一条独立的
  // `mobile.observe` RPC 每 30s 重申一次（bundle: `oe(e); setInterval(n, 3e4)`）。
  // 所以宿主必须自己立一张「设备 → 会话」路由表，由它决定要 follow 哪些会话，
  // 也决定 session/event 这类会话帧推给谁（省手机的移动流量）。
  //
  // 数据源，全部用宿主 0.2.1 的真实能力：
  //   ① session/event   ← sessionController.follow({address}, signal)（按会话）
  //   ② 会话列表五事件  ← ctx.on('api-session/*', …, {global:true})
  //   ③ approval/提问   ← 复用现有 pending 注册表（登记推 requested，落定推 resolved）
  // 后台任务 session/jobs：宿主没有非 RPC 的公开能力 → 不伪造，保持不推（bundle 会降级）。

  /** deviceId → 该设备正在看的会话集合（生命周期 = SSE 连接）。 */
  const observers = new Map()

  /**
   * deviceId → 最近一次声明在看的会话（**不随流关闭清掉**）。
   * 只用于新流进场时补一帧队列：流断了之后 observers 会被 releaseDevice 清空，
   * 而 bundle 下一次 observe 重申要等最多 30s —— 期间新流拿不到任何队列帧，
   * dock 就停在断流前的条数上。用它把这段空窗抹掉。
   */
  const lastObservedByDevice = new Map()

  /**
   * 登记一台设备正在看的会话。
   *
   * **这是「在看哪个会话」的赋值，不是累加**：bundle 的
   * `D.current?.observe(i.kind==='chat' ? i.session.sessionId : undefined)`
   * 永远只可能是「某一条路由」，所以 observe 到新会话 = 离开旧会话
   *（与 dsh-palm 的 SessionObserverRegistry.observe 同语义：覆盖登记）。
   * 旧会话的 follow 由「僵尸 follow 回收」effect 在 OBSERVE_TTL_MS 宽限期后摘掉。
   */
  function addObservation(deviceId, sessionId) {
    let set = observers.get(deviceId)
    if (set === undefined) {
      set = new Set()
      observers.set(deviceId, set)
    }
    // 重申即续命：回收器以此为计时基准。
    lastObserved.set(sessionId, Date.now())
    lastObservedByDevice.set(deviceId, sessionId)
    if (set.size === 1 && set.has(sessionId)) {
      // observe 每 30s 重申一次。重申不做「立刻补帧」（指纹会挡住重复），但正是
      // 一次天然的补漏时机：流断过 / 帧丢过时，这里会把当前队列重新推给每条流
      //（每流指纹不同才写，没变化时零成本）。没有这一步，丢帧只能等队列再变。
      emitQueue(sessionId)
      return
    }
    set.clear()
    set.add(sessionId)
    // 手机切到这个会话：立刻补一帧当前队列，省掉最多 30s 的 observe 重申空窗。
    forgetQueue(sessionId)
    emitQueue(sessionId)
  }

  /**
   * 追加登记一个「额外在看」的会话（子代理聊天视图用）。
   *
   * 与 addObservation 的区别：addObservation 是**赋值**（覆盖登记，手机换会话即离开旧的），
   * 这里是**并集**——子代理面板浮在当前聊天页之上，点开子代理不等于离开主会话，
   * 两条流都要继续收。主会话仍由 bundle 自己的 mobile.observe 独占维护。
   */
  function addObservationExtra(deviceId, sessionId) {
    let set = observers.get(deviceId)
    if (set === undefined) {
      set = new Set()
      observers.set(deviceId, set)
    }
    // 重申即续命：回收器以此为计时基准（面板打开期间每次渲染都会重申）。
    lastObserved.set(sessionId, Date.now())
    set.add(sessionId)
  }

  function removeObservation(deviceId, sessionId) {
    const set = observers.get(deviceId)
    if (set === undefined) return
    set.delete(sessionId)
    if (set.size === 0) observers.delete(deviceId)
  }

  function observedSessions(deviceId) {
    const set = observers.get(deviceId)
    return set === undefined ? [] : [...set]
  }

  /** 设备断开（SSE 流结束）时释放它的登记。 */
  function releaseDevice(deviceId) {
    for (const sessionId of observedSessions(deviceId)) removeObservation(deviceId, sessionId)
    observers.delete(deviceId)
  }

  /** SSE 是否推某帧给某设备：全局面总推，会话帧只推手机正在看的那个。 */
  function muxVisibleTo(deviceId, frame) {
    // 控制镜像 / 会话列表状态 / 审批 / 提问 / 错误 —— 手机上的全局面
    //（任务条、名单、待处理面板），与 dsh-palm 的 MUX_ALWAYS_FORWARDED 同义。
    if (MUX_ALWAYS_FORWARDED.has(frame.type)) return true
    const sessionId = frame.sessionId
    if (typeof sessionId !== 'string') return true
    const set = observers.get(deviceId)
    return set !== undefined && set.has(sessionId)
  }
  /**
   * session/event 的来源之一：sessionController.follow({address}, signal)。
   *
   * **生命周期挂在「正在看的那个会话」上，而不是挂在单次 SSE 连接上**：手机的 SSE 会
   * 因隧道抖动/锁屏/后台等各种原因频繁重连，而 bundle 的 `mobile.observe` 重申是
   * 每 30s 一次。若把 follow 绑在某条 SSE 连接上，每次重连都可能落到
   * 「重连 → 下一次 observe 重申」这段最坏 30s 的空窗里，期间会话产生的事件没人跟进。
   * 所以这里按 sessionId 做单例，断开 SSE 不拆 follow；只有「再没有设备在看」时才回收。
   */
  const follows = new Map() // sessionId -> { ref: AbortController, task }
  /** sessionId -> 最近一次有设备声明在看它的时刻（回收器的计时基准）。 */
  const lastObserved = new Map()

  /** 还有设备在看这个会话吗。 */
  function anyoneObserving(sessionId) {
    for (const set of observers.values()) {
      if (set.has(sessionId)) return true
    }
    return false
  }

  /**
   * 某会话最后一次「有人在看」的时刻。
   * 用它而不是「当前有没有人在看」做回收判据：手机每次 SSE 重连后要等下一次 observe
   * 重申（最多 30s）才重新出现在 observers 里，这中间它其实还在前台看着。
   */
  function lastObservedAt(sessionId) {
    return lastObserved.get(sessionId) ?? 0
  }

  // ── 流式增量：宿主 assistant-stream 帧 → 手机 session/event ────────────────
  /**
   * sessionId -> 当前这一轮流式 attempt 的去重/顺序状态。
   * `attemptId` 变了就换一套：新一轮的 index 从 0 重来，不能和上一轮混着判重。
   */
  const streamStates = new Map()

  /**
   * sessionId -> 已经流经本服务的最大「已落盘事件」seq（整数，宿主分配）。
   *
   * 只用于给合成 chunk 选一个合法 seq 区间：手机 bundle 的 fold() 只接受
   * `seq > maxSeq` 的事件（见 STREAM_SEQ_SLOTS 注释），而 chunk 又必须排在
   * 「下一条会落盘的事件」之前。所以每个 chunk 的 seq 取
   * `lastPersisted + slot/1e6`，落在 (lastPersisted, lastPersisted+1) 里：
   * 既比手机已见过的所有事件新，又比下一条真事件（整数 lastPersisted+1）旧。
   *
   * follow 的 snapshot / event 帧都要更新它 —— 漏一帧，后续 chunk 就会落到
   * 真事件后面被 bundle 丢弃。
   */
  const lastPersistedSeq = new Map()

  /**
   * sessionId -> 最近一条已落盘 `step/start` 的 { turn, step }。
   *
   * **为什么必须从真事件兜底**：`start` 帧只在 attempt 刚创建时发一次。手机
   * （或本插件的 follow）在生成中途才接上时，follow 的 snapshot 里带的是
   * `assistantStream.activeAttempt`，后面的 chunk 帧不会再配一个 start。此时
   * `st.turn/st.step` 是空的，合成出来的 `assistant/chunk` 就缺 `{turn,step}`
   * —— bundle 的 `it()` 只能按 turn/step 找待定气泡，找不到就**每个 chunk 新建
   * 一条消息**（实测 408 个 chunk 全都没有 turn/step）。
   *
   * 兜底值取自真事件里的 `step/start`（follow 与全局总线都会送）：它先于该步的
   * 任何 chunk 落盘，所以中途接上也能拿到正确的 turn/step。
   */
  const lastStep = new Map()

  /** 记下真事件里的 turn/step 边界（step/start、turn/start 都带 turn，step/start 另带 step）。 */
  function noteStepEvent(sessionId, event) {
    if (!event || typeof event !== 'object') return
    if (event.type !== 'step/start' && event.type !== 'turn/start') return
    const data = event.data && typeof event.data === 'object' ? event.data : {}
    const turn = typeof data.turn === 'number' ? data.turn : undefined
    const step = typeof data.step === 'number' ? data.step : undefined
    if (turn === undefined) return
    const prev = lastStep.get(sessionId)
    // 只进不退：乱序/重放不会把 turn 拉回去。
    if (prev !== undefined && (prev.turn > turn || (prev.turn === turn && (prev.step ?? -1) > (step ?? -1)))) return
    lastStep.set(sessionId, { turn, ...(step === undefined ? {} : { step }) })
    if (lastStep.size > 256) {
      for (const k of [...lastStep.keys()].slice(0, lastStep.size - 256)) lastStep.delete(k)
    }
  }

  /**
   * 取（必要时新建）某会话当前 attempt 的流式状态。
   *
   * **只按 (sessionId, attemptId) 取，不把 revision 当身份的一部分。**
   *
   * 坑（已核宿主源码 `AssistantStreamAttempt`）：`revision` 是**每个 chunk 都递增**的
   * —— `push()` 里 emit 的是 `revision: this.nextRevision()`，start/chunk/end 各调一次。
   * 它不是「一轮的身份」，而是「帧的序号」。若把 `st.revision !== revision` 当作换新一轮
   * 的判据，状态会在**每一个 chunk 上被整块重置**，于是：
   *   ① start 里记下的 seqBase（startedAfterSeq）丢失 → 合成 seq 退回从 1 开始，
   *      bundle 的 fold() 按 seq 排序时把正在生成的气泡排到已有历史消息**前面**；
   *   ② start 里记下的 turn/step 丢失 → 每个 chunk 都定位不到同一个待定气泡，
   *      逐字效果退化成「每来一个字就新开一个气泡」。
   * 真正的「换一轮」是 attemptId 变了（新一轮 index 从 0 重来），只按它判。
   */
  function streamStateFor(sessionId, attemptId, revision) {
    const key = `${sessionId}\u0000${attemptId ?? ''}`
    let st = streamStates.get(key)
    if (st === undefined || st.attemptId !== attemptId) {
      // 换 attempt：上一套状态整块作废（同时把旧的收走，避免 Map 膨胀）。
      if (st !== undefined) streamStates.delete(key)
      st = {
        key,
        attemptId,
        revision,
        seen: new Set(),
        lastIndex: -1,
        turn: undefined,
        step: undefined,
        seq: 0,
        seqBase: 0,
      }
      streamStates.set(key, st)
      // 兜底上限：异常多的 attemptId 时不让 Map 无界增长。
      if (streamStates.size > 64) {
        for (const k of [...streamStates.keys()].slice(0, streamStates.size - 64)) streamStates.delete(k)
      }
    } else if (typeof revision === 'number') {
      // 同一轮内的后续帧：只把 revision 往前推（它是帧序号，不是身份）。
      st.revision = revision
    }
    return st
  }

  /**
   * 把宿主的一个 assistant-stream 帧翻译成手机 bundle 认识的 `session/event`。
   *
   * 只翻译 `chunk`（`start` 用来记 turn/step，`end` 用来收尾）：
   * 逐字效果全靠 chunk，而 start/end 没有对应的 bundle 事件类型，
   * 硬造一个反而会让 reducer 走进未知分支。
   *
   * @returns 合成的事件对象；返回 undefined 表示该帧不必推给手机。
   */
  function assistantStreamEvent(sessionId, frame) {
    if (!frame || typeof frame !== 'object') return undefined
    const attemptId = typeof frame.attemptId === 'string' ? frame.attemptId : undefined
    const revision = typeof frame.revision === 'number' ? frame.revision : undefined

    // start：只记 turn/step，供后续 chunk 定位同一个气泡。不推帧。
    if (frame.type === 'start') {
      const st = streamStateFor(sessionId, attemptId, revision)
      if (typeof frame.turn === 'number') st.turn = frame.turn
      if (typeof frame.step === 'number') st.step = frame.step
      // startedAfterSeq = 「这一轮开始时，会话里最后一个已落盘的 seq」。
      // 合成 chunk 的 seq 必须以它为基准，否则 fold() 按 seq 排序时会把正在生成的
      // 气泡排到已有历史消息**前面**去（假 seq 从 0 起会闹这个笑话）。
      if (typeof frame.startedAfterSeq === 'number' && Number.isFinite(frame.startedAfterSeq)) {
        st.seqBase = frame.startedAfterSeq
      }
      return undefined
    }
    // end：收尾，丢弃这一轮的状态。不推帧。
    if (frame.type === 'end') {
      const st = streamStates.get(`${sessionId}\u0000${attemptId ?? ''}`)
      if (st !== undefined) streamStates.delete(st.key)
      return undefined
    }
    if (frame.type !== 'chunk') return undefined

    const st = streamStateFor(sessionId, attemptId, revision)
    // ── 去重：同一个 index 只推一次（重复推会让气泡里的字重复出现）──────────
    if (typeof frame.index === 'number' && Number.isFinite(frame.index)) {
      if (st.seen.has(frame.index)) return undefined
      if (st.seen.size >= STREAM_SEEN_INDEX_MAX) {
        // 触顶：退化成「只接受递增的 index」，不再无界记录。
        if (frame.index <= st.lastIndex) return undefined
      } else {
        st.seen.add(frame.index)
      }
      // ── 顺序：乱序会让气泡里的字错乱，落后的 index 直接丢 ──────────────────
      //（宿主按 index 递增产出；真乱序时丢一个字好过把整段文字打乱）
      if (frame.index < st.lastIndex) return undefined
      st.lastIndex = frame.index
    }

    // bundle 的 `ze()` 归一化器只认 chunk.type ∈ {'text-delta','reasoning-delta'}，
    // 且 text 是非空字符串；其余（如 tool-call-delta）它直接返回 null → 不渲染。
    const chunk = frame.chunk
    if (!chunk || typeof chunk !== 'object') return undefined
    if (chunk.type !== 'text-delta' && chunk.type !== 'reasoning-delta') return undefined
    if (typeof chunk.text !== 'string' || chunk.text === '') return undefined

    // 合成 assistant/chunk 事件。seq 必须落在 (lastPersisted, lastPersisted+1)
    // 这个**开区间**里 —— 见 STREAM_SEQ_SLOTS 的注释：用整数（旧实现 startedAfterSeq+index+1）
    // 会把手机端的 maxSeq 顶到真事件之后，随后落盘的 assistant/message、tool/call、
    // step/end、turn/end 全部被 bundle 的 fold() 当「旧事件」丢掉，手机只剩半截流式文本。
    // 基准取「已经流过去的真事件里最大的 seq」而不是只取 startedAfterSeq：宿主一轮里
    // 会连续落盘多条事件，每落一条水位就抬一次，chunk 必须跟着抬，否则会被判旧。
    let slot = typeof frame.index === 'number' && Number.isFinite(frame.index) ? frame.index + 1 : ++st.seq
    return buildAssistantChunkEvent(sessionId, st, slot, frame.time, chunk)
  }

  /**
   * 用「流式状态 + slot」合成一条 `assistant/chunk` 事件（live chunk 与快照补放共用）。
   *
   * `slot` 是桶内序号（1..STREAM_SEQ_SLOTS-1），seq = base + slot/STREAM_SEQ_SLOTS，
   * 因此同一 attempt 内严格递增，且恒小于 base+1（= 下一条已落盘事件）。
   */
  function buildAssistantChunkEvent(sessionId, st, slot, rawTime, chunk) {
    let s = typeof slot === 'number' && Number.isFinite(slot) ? Math.floor(slot) : ++st.seq
    if (!Number.isFinite(s) || s < 1) s = ++st.seq
    if (s > STREAM_SEQ_SLOTS - 1) s = STREAM_SEQ_SLOTS - 1
    const base = Math.max(st.seqBase, lastPersistedSeq.get(sessionId) ?? 0)
    const seq = base + s / STREAM_SEQ_SLOTS
    st.seq = s
    const time = typeof rawTime === 'number' && Number.isFinite(rawTime) ? rawTime : Date.now()
    const data = { chunk: { type: chunk.type, text: chunk.text } }
    // turn/step 优先用 attempt 的 start 帧；没接上 start 时退回最近一条 step/start。
    // 少了它 bundle 无法把逐字增量累加进同一个待定气泡（每个 chunk 会变成一条新消息）。
    const fallback = lastStep.get(sessionId)
    const turn = st.turn !== undefined ? st.turn : fallback?.turn
    const step = st.step !== undefined ? st.step : fallback?.step
    if (turn !== undefined) data.turn = turn
    if (step !== undefined) data.step = step
    return { type: 'assistant/chunk', seq, time, data }
  }

  /**
   * 把 compact 快照流（`AssistantStreamAccumulator.snapshot()` 的 records）展开成
   * 逐 token 的 `{ time, chunk }`。
   *
   * 快照是压缩格式（同一条消息的连续 delta 合并成 `{type:'text-chunks', dt, texts}`），
   * 不能直接喂给 bundle —— `ze()` 只认 `{chunk:{type:'text-delta'|'reasoning-delta',text}}`。
   * 这里按宿主 `expandAssistantStream()` 的同一语义展开；tool-call 片段 bundle 不渲染，跳过。
   */
  function expandSnapshotStream(stream) {
    const out = []
    if (!Array.isArray(stream)) return out
    for (const record of stream) {
      if (!record || typeof record !== 'object') continue
      if (record.type === 'chunk') {
        if (record.chunk && typeof record.chunk === 'object') out.push({ time: record.time, chunk: record.chunk })
        continue
      }
      if (record.type !== 'text-chunks' && record.type !== 'reasoning-chunks') continue
      const texts = Array.isArray(record.texts) ? record.texts : []
      const dt = Array.isArray(record.dt) ? record.dt : []
      let time = typeof record.time0 === 'number' && Number.isFinite(record.time0) ? record.time0 : Date.now()
      for (let i = 0; i < texts.length; i += 1) {
        if (i > 0) time += typeof dt[i - 1] === 'number' && Number.isFinite(dt[i - 1]) ? dt[i - 1] : 0
        out.push({
          time,
          chunk: {
            type: record.type === 'text-chunks' ? 'text-delta' : 'reasoning-delta',
            ...(typeof record.index === 'number' ? { index: record.index } : {}),
            text: texts[i],
          },
        })
      }
    }
    return out
  }

  /**
   * follow 的 snapshot 里带着 `assistantStream.activeAttempt`：**当前正在生成的那一步**
   * 已经产出的全部片段（compact 格式）+ 它的 attemptId / turn / step / startedAfterSeq。
   *
   * 手机在生成中途打开会话时，follow 才刚建立，start 帧早就发过了 —— 不补放这段快照，
   * 手机就永远缺前半段正文（用户看到的「只显示一半」），而且后续 chunk 没有 turn/step，
   * 每个 token 都会新开一条消息。这里把它补成正常的 assistant/chunk 序列。
   *
   * 只在「这个 attempt 还没有 live 帧进来」时补放一次：follow 重连会重发同一个
   * activeAttempt，重放会重复推字（seq 已被水位挡掉一部分，但不能依赖它）。
   */
  function replayAssistantSnapshot(sessionId, snapshot) {
    if (!snapshot || typeof snapshot !== 'object') return
    const attempt = snapshot.activeAttempt
    if (!attempt || typeof attempt !== 'object') return
    const attemptId = typeof attempt.attemptId === 'string' ? attempt.attemptId : undefined
    if (attemptId === undefined) return
    const revision = typeof snapshot.revision === 'number' ? snapshot.revision : undefined
    const st = streamStateFor(sessionId, attemptId, revision)
    if (typeof attempt.turn === 'number') st.turn = attempt.turn
    if (typeof attempt.step === 'number') st.step = attempt.step
    if (typeof attempt.startedAfterSeq === 'number' && Number.isFinite(attempt.startedAfterSeq)) {
      st.seqBase = attempt.startedAfterSeq
    }
    // 已经有 live chunk 进状态了：说明启动顺序不是「snapshot → chunk」，别重放。
    if (st.lastIndex >= 0) return
    const expanded = expandSnapshotStream(attempt.stream)
    let slot = 0
    for (const { time, chunk } of expanded) {
      if (!chunk || typeof chunk !== 'object') continue
      if (chunk.type !== 'text-delta' && chunk.type !== 'reasoning-delta') continue
      if (typeof chunk.text !== 'string' || chunk.text === '') continue
      slot += 1
      emitMux({ type: 'session/event', sessionId, event: buildAssistantChunkEvent(sessionId, st, slot, time, chunk) })
    }
    if (typeof attempt.nextIndex === 'number' && Number.isFinite(attempt.nextIndex)) {
      // 后续 live chunk 的 index 从 nextIndex 起（快照已包含 0..nextIndex-1 的**全部** chunk，
      // 包括我们不渲染的 tool-call 片段），所以增量判重的水位直接对齐到 nextIndex-1。
      st.lastIndex = Math.max(st.lastIndex, attempt.nextIndex - 1)
    }
  }


  /** 起（或复用）某会话的 follow 单例。幂等。 */
  function ensureFollow(sessionId) {
    const existing = follows.get(sessionId)
    if (existing !== undefined) return existing
    const ref = new AbortController()
    const state = { ref, task: undefined }
    const task = (async () => {
      let restarts = 0
      let triedParentLookup = false
      while (!ref.signal.aborted && restarts <= MAX_FOLLOW_RESTARTS) {
        try {
          const frames = sc().follow(
            { address: addressForSession(sessionId), assistantStream: FOLLOW_ASSISTANT_STREAM },
            ref.signal,
          )
          for await (const f of frames) {
            if (ref.signal.aborted) return
            if (!f) continue
            if (f.type === 'snapshot') {
              // 快照里的 records 是已经存在的历史，不重推（聊天窗自己读过历史）。
              // 只告诉手机「从 lastSeq 起之后的事件会实时到达」，bundle 据此刷新缓存。
              if (typeof f.cursor === 'number') {
                // 合成 chunk 的 seq 基准：订阅那一刻会话的最后一个已落盘 seq。
                lastPersistedSeq.set(sessionId, f.cursor)
              }
              // 正在生成中的那一步：快照带着已产出的片段，补放给手机，
              // 否则中途进场（手机在桌面生成到一半时打开会话）会永久缺前半段正文。
              replayAssistantSnapshot(sessionId, f.assistantStream)
              if (typeof f.cursor === 'number') {
                emitMux({ type: 'session/subscribed', sessionId, lastSeq: f.cursor })
                // bundle 收到 session/subscribed 会把队列缓存和 dock 一起清空
                //（rememberSubscribed → cachedQueueBySession.delete，chat 监听里 Mt([])）。
                // 跟随流重启（断线/重连/换会话）都会走这里，所以必须紧接着补一帧当前
                // 队列，否则「已经在排队的消息」会被这次清空从界面上抹掉，而每流指纹
                // 又认为早就推过了 —— 要等到队列下次变化才恢复。
                forgetQueue(sessionId)
                emitQueue(sessionId)
              }
              continue
            }
            if (f.type === 'event' && f.event) {
              // 真事件把水位往前推：后续 chunk 的 seq 必须落在它之后、
              // 下一条真事件之前（见 STREAM_SEQ_SLOTS）。
              if (typeof f.event.seq === 'number') {
                const prev = lastPersistedSeq.get(sessionId)
                if (prev === undefined || f.event.seq > prev) lastPersistedSeq.set(sessionId, f.event.seq)
              }
              // 记下 turn/step 边界：中途接上（没见到 start 帧）时给 chunk 兜底。
              noteStepEvent(sessionId, f.event)
              emitMux({ type: 'session/event', sessionId, event: f.event })
              continue
            }
            // ── 流式增量 → 手机能渲染的 session/event ────────────────────────
            if (f.type === 'assistant-stream' && f.frame) {
              const ev = assistantStreamEvent(sessionId, f.frame)
              if (ev !== undefined) emitMux({ type: 'session/event', sessionId, event: ev })
            }
          }
          if (ref.signal.aborted) return
          // 流自然结束（宿主重载 / 会话消失）：只要还有人在看就退避重试。
          if (!anyoneObserving(sessionId)) return
          restarts += 1
          await new Promise((r) => setTimeout(r, FOLLOW_RETRY_MS))
        } catch (err) {
          if (ref.signal.aborted) return
          // 没认过父的子代理会在这里撞上 session/agent-busy：认父后重试一次。
          if (!triedParentLookup && !subagentParent.has(sessionId)) {
            triedParentLookup = true
            try {
              const parent = await parentOfSubagent(sessionId, undefined)
              if (parent !== undefined && parent !== sessionId) {
                subagentParent.set(sessionId, parent)
                continue
              }
            } catch {}
          }
          if (!anyoneObserving(sessionId)) return
          restarts += 1
          await new Promise((r) => setTimeout(r, FOLLOW_RETRY_MS))
        }
      }
    })()
    task.catch(() => {})
    task.then(() => {
      if (follows.get(sessionId) === state) follows.delete(sessionId)
    })
    state.task = task
    follows.set(sessionId, state)
    return state
  }

  /** 停止某会话的 follow，释放宿主流。 */
  function stopFollow(sessionId) {
    const state = follows.get(sessionId)
    if (state === undefined) return
    follows.delete(sessionId)
    if (!anyoneObserving(sessionId)) lastObserved.delete(sessionId)
    // 拆流时把该会话的流式去重状态一并收走，避免重连后拿旧 index 判重误丢新一轮的字。
    for (const [key, st] of [...streamStates]) {
      if (key.startsWith(`${sessionId}\u0000`)) streamStates.delete(st.key)
    }
    try {
      state.ref.abort()
    } catch {}
  }

  /** 所有存活的 SSE 连接（扇出目标）。 */
  const muxStreams = new Set()

  /** 一帧 → 一条 SSE data 行；不可序列化时返回 undefined。 */
  function muxLineOf(frame, rpcId) {
    try {
      const wire = {
        type: 'server-request',
        rpcId: rpcId || `mux-${randomBytes(8).toString('hex')}`,
        method: 'events.mux',
        payload: frame,
      }
      return `data: ${JSON.stringify(wire)}\n\n`
    } catch {
      return undefined // 不可序列化的帧宁可不推，也不能拖垮整条流
    }
  }

  /** 向所有 SSE 连接推一帧。frame 必须是 bundle 认识的 mux 帧形。 */
  function emitMux(frame, rpcId) {
    const line = muxLineOf(frame, rpcId)
    if (line === undefined) return
    for (const stream of [...muxStreams]) stream.write(line, frame)
  }

  // ── 排队消息（需求 C 的数据面）：session/queue 帧 ───────────────────────────
  //
  // bundle 的排队 UI（.queue-dock，「N 条排队」+ 展开 + 编辑 + 移除）本来就是现成的，
  // 之前一直不显示，是因为**没有任何地方推 session/queue 帧**——它只出现在 bundle 的
  // 可识别帧集合里（Nn），宿主侧从未产生。
  //
  // bundle 的消费方式（务必按它来，不凭猜）：
  //   Mn():   n.type===`session/queue` && this.rememberQueue(n)
  //   rememberQueue: (e.items??[]).map(e => le({id:String(e.id), placement:e.placement, message:e.message}))
  //   le():   message.content 是 text 数组时拼成 text；editable = 全是 text
  //   Ho():   e.filter(e => e.placement === `queued`) —— 只有 placement==='queued' 的行进 dock
  // 所以帧形必须是：{ type:'session/queue', sessionId, items:[{id, placement:'queued', message:{content:[{type:'text',text}]}}] }
  // 且它已在 MUX_ALWAYS_FORWARDED 里，所有设备都收（不按会话过滤）。

  // 每条流的「某会话上一次收到的队列指纹」记在 stream.queueFp（见 emitQueue）。
  // 这里刻意不再保留会话级的全局指纹：全局指纹会让重连后的新流以为「已经推过了」，
  // 于是断流期间变化的队列永远补不回来。

  /** 把一个 inbox 消息（UserMessage）翻成 bundle 的 le() 认得的行。 */
  function queueItemView(message, placement) {
    if (!message || typeof message !== 'object') return undefined
    const id = typeof message.id === 'string' ? message.id : (message.id === undefined ? '' : String(message.id))
    if (id === '') return undefined
    // content 两种形态都要兜住：数组（常规）与字符串（历史上的简化形态）。
    const raw = Array.isArray(message.content)
      ? message.content
      : typeof message.content === 'string' ? [{ type: 'text', text: message.content }] : []
    const content = []
    for (const b of raw) {
      if (!b || typeof b !== 'object') continue
      if (typeof b.text === 'string') {
        content.push({ type: 'text', text: b.text })
        continue
      }
      // 非文本块（图片等）原样保留：bundle 的 le() 会把它们渲染成 `[类型]`
      // 并把 editable 判为 false（dock 就不给编辑框）—— 比丢掉或伪造 text 诚实。
      content.push({ type: typeof b.type === 'string' ? b.type : 'text' })
    }
    return { id, placement, message: { content } }
  }

  /**
   * 读某会话当前的排队项，推一帧 session/queue。
   * 数据源是宿主 agent.inbox（nextTurn = 等当前轮结束的排队，nextStep = 插队的）。
   * 失败一律静默：队列显示是增强，不能因为读不到就把 SSE 流搞坏。
   */
  function emitQueue(sessionId) {
    const sid = String(sessionId || '')
    if (sid === '') return
    let items
    try {
      const store = typeof ctx.get === 'function' ? ctx.get('agents') : undefined
      const agent = store && typeof store.get === 'function' ? store.get(sid) : undefined
      const inbox = agent && agent.inbox
      if (!inbox) {
        // 没有活着的 Agent = 没有排队项：推一次空帧让 dock 收起（幂等且便宜）。
        items = []
      } else {
        const nextTurn = Array.isArray(inbox.nextTurn) ? inbox.nextTurn : []
        const nextStep = Array.isArray(inbox.nextStep) ? inbox.nextStep : []
        items = []
        for (const m of nextTurn) {
          const view = queueItemView(m, 'queued')
          if (view) items.push(view)
        }
        for (const m of nextStep) {
          // placement 用 'steering'：bundle 的 CSS 会给它加左侧强调条，
          // 但 Ho() 只筛 'queued'，所以它不会污染「N 条排队」的计数 —— 正是想要的。
          const view = queueItemView(m, 'steering')
          if (view) items.push(view)
        }
      }
    } catch {
      return
    }
    const fingerprint = JSON.stringify(items)
    // 指纹必须按「每条 SSE 流」各记一份，不能是按会话一份：
    //   · 手机锁屏/切后台/隧道抖动时流会断，这期间 emitQueue 推的帧没人收；
    //   · 一条流只可能收到「它连上之后」的帧。若指纹是会话级的，重连时新流看到的
    //     指纹已经是最新的，于是**永远不再补发**——dock 就停在断流前的条数上
    //     （实测：宿主 inbox 7 条，界面停在「5 条排队」，等 30s 也不动）。
    // 每流一份之后，新流的表是空的，一进场就会收到当前完整队列。
    const line = muxLineOf({ type: 'session/queue', sessionId: sid, items })
    if (line === undefined) return
    for (const stream of [...muxStreams]) {
      if (stream.closed) continue
      if (!(stream.queueFp instanceof Map)) continue
      if (stream.queueFp.get(sid) === fingerprint) continue
      stream.queueFp.set(sid, fingerprint)
      stream.write(line, { type: 'session/queue', sessionId: sid, items })
    }
  }

  /** 让某会话的队列帧对每条流重新可见（下次 emitQueue 必推）。 */
  function forgetQueue(sessionId) {
    const sid = String(sessionId || '')
    if (sid === '') return
    for (const stream of muxStreams) {
      if (stream.queueFp instanceof Map) stream.queueFp.delete(sid)
    }
  }

  /**
   * 子代理会话必须走 durable 父地址，否则宿主 validateAddress 会抛 session/agent-busy
   *（本插件已有此经验）。认过父的直接用，没认过父先按普通地址走，撞错再认父重试。
   */
  function addressForSession(sessionId) {
    const parent = subagentParent.get(sessionId)
    if (parent !== undefined && parent !== sessionId) {
      return { kind: 'subagent', parentSessionId: parent, childSessionId: sessionId, mode: 'unknown' }
    }
    return { kind: 'session', sessionId }
  }

  /** 开一个 SSE 连接。每次 GET /m/api/events.mux 一个。 */
  function openMux(req, res) {
    if ((req.method || 'GET').toUpperCase() !== 'GET') {
      res.statusCode = 405
      res.end()
      return
    }
    // 鉴权：未配对设备拒绝（沿用 authenticatedDevice）。bundle 的 Fn() 把 403/401 判成
    // unpaired 并走降级路径 —— 与今天 404 的降级结果一致，行为不改变。
    const device = authenticatedDevice(req)
    if (!device) {
      req.resume()
      sendJson(res, 403, { ok: false, error: { code: 'unpaired', message: 'mobile session is not paired' } })
      return
    }
    // 并发上限：一次重连风暴不能无限持有宿主流与心跳定时器。EventSource 会自动重连。
    if (muxStreams.size >= MAX_SSE_SUBSCRIBERS) {
      sendJson(res, 429, { ok: false, error: { code: 'too-many-events', message: 'too many live streams' } })
      return
    }
    const deviceId = device.deviceId

    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      // Nginx 一类反代会缓冲 SSE：显式关掉。
      'X-Accel-Buffering': 'no',
    })
    try {
      if (res.socket && typeof res.socket.setNoDelay === 'function') res.socket.setNoDelay(true)
    } catch {}
    try {
      if (typeof res.flushHeaders === 'function') res.flushHeaders()
    } catch {}

    const controller = new AbortController()
    let heartbeat
    let syncTimer
    let lifetimeTimer

    const stream = {
      deviceId,
      closed: false,
      // 每会话已推过的最大 seq：follow 重启/重试会重放同一批事件，靠它去重。
      seqWatermark: new Map(),
      // 每会话已推过的队列指纹：**每条流独立**。新流 / 重连流天然是空表，
      // 所以断流期间变过的队列会在它进场时补发（详见 emitQueue 的注释）。
      queueFp: new Map(),
      write(line, frame) {
        if (this.closed) return
        // 路由过滤：手机不看的会话，其事件不过隧道（省移动流量）。
        if (!muxVisibleTo(this.deviceId, frame)) return
        // 去重：session/event 按 (sessionId → maxSeq) 水位，只推严格递增的 seq。
        if (frame.type === 'session/event' && frame.event && typeof frame.event.seq === 'number') {
          const last = this.seqWatermark.get(frame.sessionId)
          if (last !== undefined && frame.event.seq <= last) return
          this.seqWatermark.set(frame.sessionId, frame.event.seq)
        }
        try {
          res.write(line)
        } catch {
          closeStream()
        }
      },
      close() {
        closeStream()
      },
    }
    muxStreams.add(stream)

    // 新流进场先补一份当前队列（零成本：每流指纹为空 / 与当前值相同就不写）。
    // 断流期间队列变过的帧只推给了当时还活着的流，新流永远等不到它们；
    // 观察登记也可能已随上一条流被 releaseDevice 清掉，所以用 lastObservedByDevice
    // 兜住「同一个聊天页刚重连、还没来得及 observe 重申」的这段空窗。
    {
      const watching = observedSessions(deviceId)
      if (watching.length === 0) {
        const last = lastObservedByDevice.get(deviceId)
        if (typeof last === 'string' && last !== '') emitQueue(last)
      } else {
        for (const watched of watching) emitQueue(watched)
      }
    }

    function closeStream() {
      if (stream.closed) return
      stream.closed = true
      muxStreams.delete(stream)
      controller.abort()
      if (heartbeat !== undefined) clearInterval(heartbeat)
      if (syncTimer !== undefined) clearInterval(syncTimer)
      if (lifetimeTimer !== undefined) clearTimeout(lifetimeTimer)
      // SSE 流是观察登记的生命周期：**这台设备已经没有活着的流**才释放登记。
      //
      // 不能无条件 releaseDevice：同一台设备天然会并存多条流 —— EventSource 重连时
      // 新旧两条会短暂重叠，同一个 token 也可能同时开在几个标签页/客户端上。任何一条
      // 关闭就把整台设备的 observations 清空（releaseDevice 是设备级的），剩下那条
      // 流会立刻失去路由：session/event 被 muxVisibleTo 判成「设备没在看」而丢弃，
      // 正在生成的回复就停在中途、最终 assistant/message 也永远收不到 —— 这正是
      // 手机端「只显示一半 / 停在思考中」的复现路径之一（实测 2 条流时消息 0 送达，
      // 单条流时 100% 送达）。所以按设备做引用计数，最后一条流关闭时才释放。
      const deviceStillStreaming = [...muxStreams].some((s) => s.deviceId === deviceId)
      if (!deviceStillStreaming) releaseDevice(deviceId)
      try {
        res.end()
      } catch {}
    }
    const onClose = () => closeStream()
    // 关闭必须是幂等的：不论是从 socket 关闭、器纤卸载还是显式调用过来，都只走一次。
    res.on('close', onClose)
    req.on('close', onClose)
    req.on('error', onClose)

    /** 设备被桌面撤销/停用后立即断流，不等下次重连（与 dsh-palm 同）。 */
    function deviceStillPaired() {
      const found = devices.get(deviceId)
      if (found === undefined) return false
      for (const token of deviceTokensOf(req)) {
        if (found.token === token) {
          found.lastSeenAt = Date.now()
          return true
        }
      }
      return false
    }

    heartbeat = setInterval(() => {
      if (stream.closed) return
      if (!deviceStillPaired()) {
        closeStream()
        return
      }
      // 注释心跳：代理/浏览器不会因为空闲超时掐断长连接。必须短于 bundle 的 stall 阈值
      //（活着 36s / 未活 12s，见 MuxClient.isSseStalled）。
      try {
        res.write(': ping\n\n')
      } catch {
        closeStream()
      }
    }, SSE_HEARTBEAT_MS)

    // 开场快照：手机可能在待处理项出现的那一刻没有活着的流（后台/锁屏/隧道抖动/正在重连），
    // 于是它从没收到过那条 approval/requested。这里在新流建立后立刻补发一份，
    // 手机一连上就能看到仍在等它的卡片（客户端按 approvalId / rpcId 幂等）。
    purgePending()
    for (const entry of [...pending.approvals.values()]) {
      if (typeof entry.sessionId !== 'string' || typeof entry.approvalId !== 'string') continue
      emitMux({
        type: 'approval/requested',
        sessionId: entry.sessionId,
        approvalId: entry.approvalId,
        toolName: typeof entry.toolName === 'string' ? entry.toolName : 'unknown',
        ...(entry.callId === undefined ? {} : { callId: entry.callId }),
        ...(entry.reason === undefined ? {} : { reason: mobileReason(entry) }),
      }, entry.rpcId)
    }
    for (const entry of [...pending.questions.values()]) {
      if (typeof entry.sessionId !== 'string') continue
      emitMux({
        type: 'question/requested',
        sessionId: entry.sessionId,
        questions: Array.isArray(entry.questions) ? entry.questions : [],
      }, entry.rpcId)
    }

    // 把设备的观察集合同步到 follow 单例：这条 SSE 连接看什么，就确保什么有人在跟进。
    // 设备换会话时旧的 follow 不会立刻停 —— 由下面的 OBSERVE_TTL_MS 宽限期回收，
    // 这样手机短时回来还能续上同一条宿主流（不需要从零重放）。
    syncTimer = setInterval(() => {
      if (stream.closed) return
      if (!deviceStillPaired()) {
        closeStream()
        return
      }
      for (const sessionId of observedSessions(deviceId)) ensureFollow(sessionId)
      // 队列补漏：Agent 消费掉排队项（轮次结束/开始新回合）时没有通知我们，
      // 靠这个 2s 节拍把变化推下去。emitQueue 内部按指纹去重，没变化就不推帧。
      for (const sessionId of observedSessions(deviceId)) emitQueue(sessionId)
    }, 2000)

    // 连接寿命上限：超长挂机也回收一次（手机的 EventSource 会自动重连并重新 observe）。
    // follow 单例不随它回收 —— 回收的是这条 socket，不是会话跟随。
    lifetimeTimer = setTimeout(closeStream, SSE_MAX_LIFETIME_MS)
  }
  // ── API dispatch ──────────────────────────────────────────────────────────
  async function handleApi(req, res, url) {
    const sub = url.pathname.slice(API_PREFIX.length)
    const method = (req.method || 'GET').toUpperCase()
    const key = `${method} ${sub}`

    // settings panel (simple JSON)
    switch (key) {
      case 'GET /me':
        return me(req, res)
      case 'POST /pair/issue':
        return requireLoopback(req, res, pairIssue)
      case 'POST /pair/accept':
        return pairAccept(req, res)
      case 'GET /status':
        return requireLoopback(req, res, status)
      case 'POST /device/revoke':
        return requireLoopback(req, res, revokeDevice)
      default:
        break
    }

    // dsh-palm RPC: POST /m/api/<method>
    if (method === 'POST' && sub.startsWith('/') && sub.indexOf('/', 1) === -1 && sub.includes('.')) {
      return handleRpc(req, res, sub.slice(1))
    }

    // SSE：实时 mux 流。手机用它取代轮询；拿不到就退化为轮询（与 404 时同一结果）。
    if (sub === '/events.mux') return openMux(req, res)
    // events.notify 未实现：保持 404，bundle 会降级（通知走轮询/Web Push）。
    if (sub === '/events.notify') {
      res.statusCode = 404
      res.end()
      return
    }

    sendJson(res, 404, { ok: false, error: 'not found' })
  }

  // ── request router (both HTTP faces) ──────────────────────────────────────
  async function routeRequest(req, res) {
    let url
    try {
      url = new URL(req.url || '/', 'http://localhost')
    } catch {
      sendJson(res, 400, { ok: false, error: 'bad url' })
      return
    }
    const path = url.pathname
    if (path === '/m') {
      res.statusCode = 302
      res.setHeader('Location', MOBILE_ROOT)
      res.end()
      return
    }
    // dsh-palm 手机 bundle 的配对端点（它写死调用 /api/pair/accept）。
    if (path === '/api/pair/accept') {
      if ((req.method || 'GET').toUpperCase() !== 'POST') {
        res.statusCode = 405
        res.end()
        return
      }
      return pairAcceptCompat(req, res)
    }
    if (path === MOBILE_ROOT) return sendHtml(res, 200, mobilePageHtml())
    // 只读自检：不需要登录/配对，任何能访问到本插件的人都能打开。
    if (path === PUSH_CHECK_URL) return sendHtml(res, 200, pushCheckPageHtml())
    if (path === BUNDLE_URL) return sendBuffer(res, 200, 'text/javascript; charset=utf-8', asset('mobile.bundle.js'))
    if (path === MANIFEST_URL) return sendText(res, 200, 'application/manifest+json', manifestJson())
    if (path === ICON_SVG_URL) return sendBuffer(res, 200, 'image/svg+xml', asset('icon.svg'))
    if (path === ICON_192_URL) return sendBuffer(res, 200, 'image/png', asset('icon-192.png'))
    if (path === ICON_512_URL) return sendBuffer(res, 200, 'image/png', asset('icon-512.png'))
    if (path === APPLE_TOUCH_URL) return sendBuffer(res, 200, 'image/png', asset('apple-touch-icon.png'))
    if (path === WHALE_URL) return sendBuffer(res, 200, 'image/png', asset('whale.png'))
    if (path === THEME_URL) {
      // 每次请求实时读盘：改 theme.css 后刷新手机即生效，不用重启 dsh。
      let css = ''
      try {
        css = readFileSync(join(__dirname, 'assets', 'theme.css'), 'utf8')
      } catch {}
      res.setHeader('Cache-Control', 'no-store')
      return sendText(res, 200, 'text/css; charset=utf-8', css)
    }
    if (path === API_PREFIX || path.startsWith(API_PREFIX + '/')) return handleApi(req, res, url)
    sendJson(res, 404, { ok: false, error: 'not found' })
  }

  // ── face 1: shared webServer (GUI settings panel) ─────────────────────────
  ctx.effect(() => {
    const routes = [
      { kind: 'exact', path: '/m', handler: (req, res) => routeRequest(req, res) },
      { kind: 'exact', path: '/api/pair/accept', handler: (req, res) => routeRequest(req, res) },
      { kind: 'exact', path: MOBILE_ROOT, handler: (req, res) => routeRequest(req, res) },
      { kind: 'exact', path: PUSH_CHECK_URL, handler: (req, res) => routeRequest(req, res) },
      { kind: 'exact', path: BUNDLE_URL, handler: (req, res) => routeRequest(req, res) },
      { kind: 'exact', path: MANIFEST_URL, handler: (req, res) => routeRequest(req, res) },
      { kind: 'exact', path: ICON_SVG_URL, handler: (req, res) => routeRequest(req, res) },
      { kind: 'exact', path: ICON_192_URL, handler: (req, res) => routeRequest(req, res) },
      { kind: 'exact', path: ICON_512_URL, handler: (req, res) => routeRequest(req, res) },
      { kind: 'exact', path: APPLE_TOUCH_URL, handler: (req, res) => routeRequest(req, res) },
      { kind: 'exact', path: WHALE_URL, handler: (req, res) => routeRequest(req, res) },
      { kind: 'exact', path: THEME_URL, handler: (req, res) => routeRequest(req, res) },
      { kind: 'prefix', path: API_PREFIX, handler: (req, res) => routeRequest(req, res) },
    ]
    const disposers = routes.map((r) => ctx.webServer.register(r))
    return () => {
      for (const dispose of disposers) dispose()
    }
  }, 'dsh-mobile: webServer routes')

  // ── face 2: dedicated 0.0.0.0 listener (phone / LAN / public) ─────────────
  ctx.effect(() => {
    const port = Number(cfg.mobilePort) || DEFAULT_MOBILE_PORT
    const host = cfg.mobileHost || '0.0.0.0'
    const server = createServer((req, res) => {
      routeRequest(req, res).catch((err) => {
        try {
          sendJson(res, 500, { ok: false, error: String((err && err.message) || err) })
        } catch {}
      })
    })
    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        console.warn(`[dsh-mobile] 端口 ${port} 已被占用，手机独立监听未启动。可改 config.mobilePort。`)
      } else {
        console.error('[dsh-mobile] mobile listener error:', err && err.message)
      }
    })
    server.listen(port, host, () => console.log(`[dsh-mobile] mobile listener on http://${host}:${port}/m/`))
    return () => {
      // 先强拆 keep-alive 连接：否则 close() 会等手机/浏览器的长连接结束，
      // 清理函数不返回会把 HMR 事务一直挂住（表现为 "HMR transactions cannot be nested"）。
      try {
        server.closeAllConnections?.()
      } catch {}
      try {
        server.close()
      } catch {}
    }
  }, 'dsh-mobile: mobile listener')

  // ── 手机待处理：审批 ────────────────────────────────────────────────────────
  // prepend:true 把我们插到现有（桌面 GUI）应答者之前，于是 next 就是桌面应答者。
  // claimApproval 把桌面 next() 与「手机应答」race 起来：谁先到用谁；两边都不动时
  // 完全等同于没装本插件（桌面 card 一直等到用户点按钮）。
  ctx.effect(() => {
    const dispose = ctx.on('approval/request', claimApproval, { prepend: true })
    return () => {
      dispose?.()
      for (const [, entry] of pending.approvals) {
        entry.expiresAt = Number.POSITIVE_INFINITY
        entry.resolve(undefined)
      }
      pending.approvals.clear()
      pending.byApprovalId.clear()
    }
  }, 'dsh-mobile: approval pending registry')

  // ── 手机待处理：提问 ────────────────────────────────────────────────────────
  // 与审批同理：桌面 UI 的 card 会 await 用户点选项后才 next()，我们不抢占。
  ctx.effect(() => {
    const dispose = ctx.on('user-questions/request', claimQuestion, { prepend: true })
    return () => {
      dispose?.()
      for (const [, entry] of pending.questions) {
        entry.expiresAt = Number.POSITIVE_INFINITY
        entry.resolve(undefined)
      }
      pending.questions.clear()
    }
  }, 'dsh-mobile: user-questions pending registry')

  /**
   * session/event 的第二条来源：宿主事件总线（`ctx.on('session/event', …, {global:true})`）。
   *
   * 这是 dsh-palm 的关键设计（api-proxy-mux.ts 顶部注释）：必须**一次性全局注册**，
   * 而不是按会话懒注册，否则「会话变有趣」到「手机开始订阅」之间存在一段空窗，
   * 那段空窗里的事件没有任何补偿路径，会变成永久空洞。
   *
   * 与 follow 并存而不是互相替代：两条同源（follow 内部读的就是这条总线），重复投递
   * 由每连接的 seq 水位去重掉，不会重复到达手机。两者任一可用即可送达。
   */
  ctx.effect(() => {
    try {
      return ctx.on('session/event', (session, event) => {
        if (!session || typeof session.id !== 'string') return
        if (!event || typeof event !== 'object') return
        // 总线与 follow 是两条独立来源，谁先到不确定。这里也必须推进「已落盘 seq」水位：
        // 否则总线先送来 seq 20，随后 follow 里的 chunk 仍按旧基准算 seq（< 20），
        // 会被手机 bundle 的 fold() 当旧事件丢掉，流式就断在半路。
        if (typeof event.seq === 'number') {
          const prev = lastPersistedSeq.get(session.id)
          if (prev === undefined || event.seq > prev) lastPersistedSeq.set(session.id, event.seq)
        }
        // 与 follow 同一条兜底：中途接上的 attempt 没有 start 帧，turn/step 取自真事件。
        noteStepEvent(session.id, event)
        emitMux({ type: 'session/event', sessionId: session.id, event })
      }, { global: true })
    } catch {
      return undefined // 总线不可用：follow 仍在提供 session/event
    }
  }, 'dsh-mobile: sse session event bus')

  // ── SSE 实时面：会话投影（session/projection）← sessionController.control() ───
  //
  // 宿主的 control 流就是 sessionProjections 的变更总线：一条 baseline + 之后的
  // 变更帧（本版只产生 projection 一种，见 SessionControlController.broadcast）。
  // 手机用它更新聊天页的权限开关（permissions）与上下文压力条（contextPressure）——
  // 这两块原先只在拉取 session.history 时才会动。
  // 只在有 SSE 连接时才 opened 流：没手机在线就不占这条宿主流。
  ctx.effect(() => {
    const controllerRef = new AbortController()
    let disposed = false
    const task = (async () => {
      try {
        // 等第一个手机连上再开，避免空闲时白挂一条宿主流。
        while (!disposed && muxStreams.size === 0) {
          await new Promise((r) => setTimeout(r, 1000))
          if (controllerRef.signal.aborted) return
        }
        if (disposed || controllerRef.signal.aborted) return
        const frames = sc().control(controllerRef.signal)
        for await (const frame of frames) {
          if (disposed || controllerRef.signal.aborted) return
          if (!frame) continue
          if (frame.type === 'baseline') {
            // 开场基线：把所有会话的投影当前值一次性给出去。
            const value = frame.value || {}
            const projections = value.projections || {}
            for (const [sessionId, block] of Object.entries(projections)) {
              const values = (block && block.values) || {}
              const asOfSeq = block && typeof block.asOfSeq === 'number' ? block.asOfSeq : 0
              for (const [key, v] of Object.entries(values)) {
                emitMux({ type: 'session/projection', sessionId, key, value: v, seq: asOfSeq })
              }
            }
            continue
          }
          if (frame.type === 'projection') {
            emitMux({
              type: 'session/projection',
              sessionId: frame.sessionId,
              key: frame.key,
              value: frame.value,
              seq: typeof frame.seq === 'number' ? frame.seq : 0,
            })
          }
        }
      } catch {
        // 流结束/中止：best-effort，下一次会把新值推下去。
      }
    })()
    task.catch(() => {})
    return () => {
      disposed = true
      controllerRef.abort()
    }
  }, 'dsh-mobile: sse control stream')

  // ── SSE 实时面：会话列表的五个宿主事件 → 同名 mux 帧 ────────────────────────
  //
  // 桌面端 SessionController 自己消费的就是这五条总线事件
  //（session-created / disposed / agent-status / api-session/activity / agent-error），
  // 手机端的列表原先只能靠 session.list 拉取，于是桌面端新建/关闭会话、running 点、
  // 活动时间排序都要等下次拉取才更新。这里一次性注册（不像 follow 那样按会话注册），
  // 因为「会话变有趣」到「手机开始订阅」之间的空窗没有任何补偿路径。
  //
  // global:true —— Cordis 的 dispatch 默认只挑当前 Context 子树里的钩子，而宿主的
  // SessionController 挂在根 Context 上；不设 global 就收不到任何一条。
  // 注册失败（宿主版本变了/名字改了）只是「列表退回拉取驱动」，不影响其余功能。
  ctx.effect(() => {
    const disposers = []
    try {
      disposers.push(
        ctx.on('api-session/added', (summary) => {
          if (!summary || typeof summary !== 'object') return
          emitMux({ type: 'session/added', summary })
        }, { global: true }),
        ctx.on('api-session/removed', (sessionId) => {
          if (typeof sessionId !== 'string' || sessionId === '') return
          emitMux({ type: 'session/removed', sessionId })
          // 会话没了：所有设备都不该再观察它。
          for (const deviceId of [...observers.keys()]) removeObservation(deviceId, sessionId)
          for (const stream of muxStreams) stream.seqWatermark.delete(sessionId)
          forgetQueue(sessionId)
        }, { global: true }),
        ctx.on('api-session/status', (sessionId, running) => {
          if (typeof sessionId !== 'string' || sessionId === '') return
          if (typeof running !== 'boolean') return
          emitMux({ type: 'session/status', sessionId, running })
        }, { global: true }),
        ctx.on('api-session/activity', (sessionId, updatedAt) => {
          if (typeof sessionId !== 'string' || sessionId === '') return
          if (typeof updatedAt !== 'number' || !Number.isFinite(updatedAt)) return
          emitMux({ type: 'session/activity', sessionId, updatedAt })
        }, { global: true }),
        ctx.on('api-session/error', (sessionId, message) => {
          if (typeof sessionId !== 'string' || sessionId === '') return
          if (typeof message !== 'string') return
          emitMux({ type: 'session/error', sessionId, message })
        }, { global: true }),
      )
    } catch {
      // 总线不可用：列表退回拉取驱动，功能不坏。
    }
    return () => {
      for (const dispose of disposers) dispose?.()
    }
  }, 'dsh-mobile: sse session list')

  // ── 僵尸 follow 回收 ──────────────────────────────────────────────────────
  // follow 的生命周期挂在「会话」而不是挂在 SSE 连接上（见 ensureFollow），所以它需要一个
  // 独立的回收器：没人再看某个会话超过 OBSERVE_TTL_MS 就把它的宿主流拆掉。
  // 宽限期必须明显长于 bundle 的 observe 重申周期（30s）与一次 SSE 重连的时间，否则
  // 换页/锁屏会被误判为离开，反而把正在看的东西拆了。
  ctx.effect(() => {
    const timer = setInterval(() => {
      try {
        const now = Date.now()
        for (const sessionId of [...follows.keys()]) {
          if (anyoneObserving(sessionId)) continue
          if (now - lastObservedAt(sessionId) <= OBSERVE_TTL_MS) continue
          stopFollow(sessionId)
        }
      } catch {}
    }, Math.max(5000, Math.round(OBSERVE_TTL_MS / 6)))
    timer.unref?.()
    return () => {
      clearInterval(timer)
      // 插件卸载：所有 follow 一并收掉，绝不留宿主流。
      for (const sessionId of [...follows.keys()]) stopFollow(sessionId)
    }
  }, 'dsh-mobile: follow reaper')

  // ── 待处理项过期回收 ────────────────────────────────────────────────────────
  ctx.effect(() => {
    const timer = setInterval(purgePending, PENDING_SWEEP_MS)
    timer.unref?.()
    return () => clearInterval(timer)
  }, 'dsh-mobile: pending sweep')

  // ── presence sweep ────────────────────────────────────────────────────────
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

  // 完成通知：轮询 running 集合，running → idle 时经已配置通道投递一条。
  ctx.effect(() => {
    let primed = false
    let lastRunning = new Set()
    const timer = setInterval(async () => {
      try {
        const { items = [] } = await sc().list({}, new AbortController().signal)
        const running = new Set(items.filter((it) => it.running).map((it) => it.sessionId))
        if (primed && !(notifyConfig.kinds && notifyConfig.kinds.turns === false)) {
          for (const id of lastRunning) {
            if (running.has(id)) continue
            const item = items.find((it) => it.sessionId === id)
            const proj = item && item.projections && item.projections.values
            const title = (proj && typeof proj.title === 'string' && proj.title) || (item && item.cwd ? basename(item.cwd) : '会话')
            deliverNotify(notifyConfig, { title: `${title} · 任务完成`, body: '这一轮已经跑完了。' }).catch(() => {})
          }
        }
        lastRunning = running
        primed = true
      } catch {}
    }, 10000)
    timer.unref?.()
    return () => clearInterval(timer)
  }, 'dsh-mobile: completion notify')

  console.log(`[dsh-mobile] mounted: mobile bundle on webServer + 0.0.0.0:${cfg.mobilePort} (devices: ${devices.size})`)
}
