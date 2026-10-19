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
import { join, basename, resolve as resolvePath, relative as relativePath, isAbsolute as isAbsolutePath, extname } from 'node:path'
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync, realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { gzipSync, brotliCompressSync, constants as zlibConstants } from 'node:zlib'

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
// ── 只读截图路由：GET /m/shot/<file> → ~/.dsh/dsh-mobile-shots/<file> ────────
// 手机网页端看对话时，主机本地路径（C:\...）的图片必然裂图 —— 手机浏览器访问不到
// 主机磁盘。这里把主机上的截图目录只读地映射成一个 https 绝对 URL：
//   https://<公网域名>:45632/m/shot/<file>.png
// 安全取舍见 serveShot() 的注释（匿名只读 + 单层文件名白名单 + 扩展名白名单）。
const SHOT_PREFIX = '/m/shot'
// 只允许单层文件名：不含 / \ : % 与空白，天然挡住目录穿越（.. 另做显式检查）。
const SHOT_NAME = /^[A-Za-z0-9._-]+$/
const SHOT_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}
const SHOT_DIR = join(homedir(), '.dsh', 'dsh-mobile-shots')

function ensureShotDir() {
  try {
    mkdirSync(SHOT_DIR, { recursive: true })
  } catch {}
}
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
// 手机点命令后的单次执行上限：bundle 侧 mobile.commandExec 的 fetch 超时是 180s，
// 宿主这里留 30s 余量，避免「前端已放弃、宿主还在 await」的悬挂。
const COMMAND_EXEC_TIMEOUT_MS = 150 * 1000
// 技能目录读取上限：sessionSkillCatalog.list 要做一次 provider 发现（可能要读
// SKILL.md 目录），冷启动偶尔慢；15s 足够，且不让手机面板无限转圈。
const SKILL_CATALOG_TIMEOUT_MS = 15 * 1000

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
// 文本类响应按 Accept-Encoding 压缩。
// 实测（本机直连 19387，未经过反代）：/m/ 404KB、bundle 646KB、theme.css 129KB，
// 合计 1.18MB 且无 Content-Encoding —— 弱网（Slow-4G 节流）首屏 8.6s，
// 压缩后约 0.3MB，首屏降到 2.5～3.5s 量级。压缩只对文本生效，图片/字体原样。
const COMPRESSIBLE_TYPE = /^(?:text\/|application\/(?:json|javascript|xml)|image\/svg\+xml)/i
const MIN_COMPRESS_BYTES = 2048
// bundle/theme 这类 Buffer 会被 asset() 按 mtime 缓存复用，这里也按对象缓存压缩结果，
// 避免每次请求重复压缩 646KB。字符串响应（HTML）本身每请求重建，只能现压。
const compressCache = new WeakMap()

function compressFor(req, headers, body) {
  const type = String(headers['Content-Type'] || '')
  if (!COMPRESSIBLE_TYPE.test(type)) return null
  const ae = String((req && req.headers && req.headers['accept-encoding']) || '')
  const wantBr = /\bbr\b/.test(ae)
  const wantGzip = /\bgzip\b/.test(ae)
  if (!wantBr && !wantGzip) return null
  const isBuf = Buffer.isBuffer(body)
  const buf = isBuf ? body : Buffer.from(body, 'utf8')
  if (buf.length < MIN_COMPRESS_BYTES) return null
  let entry = null
  if (isBuf) {
    entry = compressCache.get(body)
    if (!entry) { entry = {}; compressCache.set(body, entry) }
  }
  try {
    if (wantBr) {
      if (!entry || !entry.br) {
        const br = brotliCompressSync(buf, { params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 5 } })
        if (entry) entry.br = br
        return { buf: br, enc: 'br' }
      }
      return { buf: entry.br, enc: 'br' }
    }
    if (!entry || !entry.gz) {
      const gz = gzipSync(buf, { level: 6 })
      if (entry) entry.gz = gz
      return { buf: gz, enc: 'gzip' }
    }
    return { buf: entry.gz, enc: 'gzip' }
  } catch (e) {
    return null
  }
}

function send(res, status, headers, body) {
  res.statusCode = status
  const outHeaders = { ...headers }
  const packed = compressFor(res.req, outHeaders, body)
  if (packed) {
    outHeaders['Content-Encoding'] = packed.enc
    outHeaders['Vary'] = 'Accept-Encoding'
    outHeaders['Content-Length'] = String(packed.buf.length)
    body = packed.buf
  } else if (typeof body === 'string' || Buffer.isBuffer(body)) {
    const len = Buffer.isBuffer(body) ? body.length : Buffer.byteLength(body)
    if (!outHeaders['Content-Length']) outHeaders['Content-Length'] = String(len)
  }
  for (const [k, v] of Object.entries(outHeaders)) res.setHeader(k, v)
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

function sendBuffer(res, status, type, buf, headers) {
  // headers 可覆盖默认头：bundle 这类会随插件更新的资源必须 no-store，
  // 否则默认的 public,max-age=3600 会让手机缓存一小时（改了代码也看不到）。
  send(res, status, { 'Content-Type': type, 'Cache-Control': 'public, max-age=3600', ...(headers || {}) }, buf)
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
  // 只认 RFC1918 私网地址：虚拟网卡 / VPN / 代理常会冒出一个公网段 IPv4
  //（本机就有一条 2.0.1.1/24 的「以太网 2」），它既不是局域网、也不是给手机
  // 用的入口，混进地址列表只会让人以为「为什么有三个地址」。
  // 排序：192.168.* 最常见，排前面；其次 10.*；最后 172.16–31.*。
  const isPrivate = (ip) =>
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip)
  const rank = (ip) => (ip.startsWith('192.168.') ? 0 : ip.startsWith('10.') ? 1 : 2)
  const out = []
  for (const list of Object.values(networkInterfaces())) {
    for (const i of list || []) {
      if (!i || i.family !== 'IPv4' || i.internal) continue
      if (!isPrivate(i.address)) continue
      if (!out.includes(i.address)) out.push(i.address)
    }
  }
  return out.sort((a, b) => rank(a) - rank(b))
}

// ── public domain (publicBaseUrl) ───────────────────────────────────────────
// 公网域名支持在桌面设置面板里直接填（原来只能改 profile 配置）。落盘到
// ~/.dsh/dsh-mobile-public.json，优先于 profile 的 publicBaseUrl；空串表示
// 回到配置值。只接受 http(s)://host[:port][/path]，去掉 query/hash 与尾斜杠。
function normalizePublicBase(value) {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (raw === '') return ''
  try {
    const url = new URL(raw)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (url.hostname === '') return null
    url.hash = ''
    url.search = ''
    return url.toString().replace(/\/+$/, '')
  } catch {
    return null
  }
}

function loadPublicBase(file) {
  try {
    if (!existsSync(file)) return ''
    const saved = JSON.parse(readFileSync(file, 'utf8'))
    const raw = saved && typeof saved === 'object' ? saved.publicBaseUrl : saved
    const normalized = normalizePublicBase(raw)
    return normalized === null ? '' : normalized
  } catch {
    return ''
  }
}

function savePublicBase(file, value) {
  try {
    const dir = join(file, '..')
    if (dir && !existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(file, JSON.stringify({ publicBaseUrl: value }, null, 2))
  } catch (err) {
    console.warn('[dsh-mobile] failed to save public domain:', err && err.message)
  }
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
/**
 * 余额展示串：与官方余额卡一致，用货币符号而不是币种代码。
 *   13.75 CNY → ¥13.75
 *   13.75 USD → $13.75
 * 未知币种保留 "13.75 XXX" 的通用写法，绝不丢单位。
 */
function formatBalanceAmount(digits, currency) {
  const num = digits.toFixed(2)
  if (currency === 'CNY' || currency === 'RMB') return '¥' + num
  if (currency === 'USD') return '$' + num
  return num + ' ' + currency
}

function balanceRow(list) {
  const wallet = firstNumericWallet(list)
  if (wallet === undefined) return undefined
  const amount = wallet.balance
  if (amount === undefined || amount === null || amount === '') return undefined
  const digits = Number(amount)
  if (!Number.isFinite(digits)) return undefined
  const currency = typeof wallet.currency === 'string' && wallet.currency !== '' ? wallet.currency : 'CNY'
  return formatBalanceAmount(digits, currency)
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
  return formatBalanceAmount(digits, currency)
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
/**
 * 读取 assets 下的静态资源，**按文件 mtime/size 失效**。
 *
 * 原来是"首次读盘后永久缓存"：改了 mobile.bundle.js 之后即使重载插件，
 * 线上拿到的还是旧内容（只有重启 dsh 才会重新读）—— bundle 里的改动因此
 * 无法通过普通 reload 生效。现在每次请求 stat 一次（开销可忽略），
 * mtime 或大小变了就重新读盘；其余情况仍走内存缓存。
 */
function asset(name) {
  const file = join(__dirname, 'assets', name)
  let mtimeMs = 0
  let size = -1
  try {
    const st = statSync(file)
    mtimeMs = st.mtimeMs
    size = st.size
  } catch {}
  const hit = assetCache.get(name)
  if (hit !== undefined && hit.mtimeMs === mtimeMs && hit.size === size) return hit.data
  const data = readFileSync(file)
  assetCache.set(name, { mtimeMs, size, data })
  return data
}
/** bundle 版本号：用 mtime，bundle 一变 URL 就变，手机不会再用旧模块。 */
function bundleVersion() {
  try { return String(Math.floor(statSync(join(__dirname, 'assets', 'mobile.bundle.js')).mtimeMs)) } catch { return '0' }
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

  if (window.__dmEnsureTick) window.__dmEnsureTick.add(ensureTools, 240, function () { return !!document.querySelector('.chat-composer'); }); else setInterval(ensureTools, 240);
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
      // inbox（📨 收到任务消息）：圆角信封 + 折线封盖，不要尖直角 —— 18px 下仍是一眼信封。
      inbox: '<rect x="3.1" y="5.9" width="17.8" height="12.2" rx="2.4"/><path d="M4.6 8.1 12 13.2l7.4-5.1"/>',
      people: '<circle cx="9" cy="9.2" r="2.6"/><path d="M4.4 18.4a4.6 4.6 0 0 1 9.2 0"/><circle cx="16.6" cy="10.4" r="2"/><path d="M14.9 18.4a4 4 0 0 1 5.1-3.2"/>',
      // puzzle（🧩 子任务状态更新）：经典拼图块 = 圆角方片 + 顶部一个半圆凸起，
      // 一条闭合 path 描边；原来那条多段凹凸在小尺寸下糊成一团，这里减到 1 个凸起。
      puzzle: '<path d="M10.2 4.7C10.2 2.7 13.8 2.7 13.8 4.7H17A2.3 2.3 0 0 1 19.3 7v3.2C21.3 10.2 21.3 13.8 19.3 13.8V17a2.3 2.3 0 0 1-2.3 2.3H7A2.3 2.3 0 0 1 4.7 17V7A2.3 2.3 0 0 1 7 4.7z"/>',
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

    // 文本节点不再打标记（会被 splitText 切掉）；槽位状态存在 slot 元素上，
    // 这里只负责触发一次 flush。
    if (window.__dmMutationBus) window.__dmMutationBus.subscribe(schedule);
    else {
      var mo = new MutationObserver(schedule);
      mo.observe(document.body, { childList: true, subtree: true, characterData: true });
    }
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
    if (window.__dmMutationBus) window.__dmMutationBus.subscribe(schedule);
    else {
      var mo = new MutationObserver(schedule);
      mo.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true
    });
    }
  } catch (e) {}
  if (window.__dmEnsureTick) window.__dmEnsureTick.add(scan, 800, function () { return !!document.querySelector('.chat-jump-turns'); }); else setInterval(scan, 800);
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
  // 聊天视图状态（新→旧顺序、增量前插、30s 对账）。null 表示当前不在聊天视图。
  //   { sid, parent, itemSeq, seenSeq, live, es, reconcileTimer, list, pendingNew }
  var chat = null;
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
      if (view !== 'list') { stopChat(); view = 'list'; chatSid = ''; renderList(true); }
    });
    // 滚动策略：停在顶部就继续保持贴顶（新消息前插后仍看得到最新）；一旦下滑
    // 读旧消息，就不再抢滚动位置（前插时会补偿 scrollTop，见 prependHtml）。
    body.addEventListener('scroll', function () {
      if (!chat) return;
      if (chatAtTop()) hideNewTip(true);
    }, { passive: true });

    panel = { back: back, sheet: sheet, head: head, title: title, back2: back2, body: body };
    return panel;
  }

  function openPanel() {
    if (!panel) build();
    panel.back.classList.add('dm-subagent-open');
    if (view !== 'list') { stopChat(); view = 'list'; chatSid = ''; }
    renderList(true);
    startTimer();
  }

  // 收起动画：先挂 .dm-closing 让 CSS 反向播放（面板下滑 + 背景淡出），
  // 动画结束后才真正移除 .dm-subagent-open。用 data 标记防止重复触发。
  function closePanel() {
    stopTimer();
    stopChat();     // 离开面板：关 EventSource、停对账定时器，无泄漏
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
      // 聊天视图不再定时整段重绘：它由 SSE 增量 + 30s 对账维护（见 openChat/startChatStream），
      // 整段 innerHTML 重绘既会闪，也会把 scrollTop 打回 0。列表视图照旧低频刷新。
      if (view === 'list') renderList(false);
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

  // ── 聊天内容视图：最新消息在最上面（新→旧），首屏一次拉取 + SSE 前插 ──────
  //
  // 用户要求（task-4 rev5）：子代理聊天记录「最新在最上面、从下往上排」，打开就停在
  // 顶部看最新，不需要往下翻。旧实现每 8s 用 session.history 整段重绘
  // （writeBody → innerHTML=），既闪，又把 scrollTop 打回 0；顺序还是旧→新，
  // 于是「停在顶部 = 看到最旧一条」。
  //
  // 现在：
  //   · 打开一次 session.history（subscribe:true 先登记 → 宿主为该会话起 follow）；
  //   · 之后消费 /m/api/events.mux 的 session/event 帧（user/message、assistant/message、
  //     tool/call、assistant/chunk）**前插到最上面**，不整段重绘；
  //   · 30s 低频对账：只补 seq 缺口（正常情况 0 次 DOM 变更）；
  //   · 滚动：停在顶部 → 前插后仍贴顶；已下滑看旧消息 → 插入多少补偿多少 scrollTop
  //     （视觉位置不动），并给一个「↑ 有 N 条新消息」提示；
  //   · 离开聊天视图 / 收起面板 → 关 EventSource、停对账定时器。
  var CHAT_RECONCILE_MS = 30000;
  var CHAT_TOP_PX = 8;

  function chatAtTop() {
    if (!panel) return true;
    return panel.body.scrollTop <= CHAT_TOP_PX;
  }

  // 把一条消息插到最上面。返回插入的节点。
  //
  // 两种滚动策略都在这里落地：
  //   · 用户原本停在顶部：插完仍然 scrollTop=0（新内容立刻可见）；
  //   · 用户已经下滑在读旧消息：scrollTop 加上新增高度，正在看的那条不动，
  //     并亮出「有新消息」提示（点一下回到顶部）。
  function prependHtml(html) {
    if (!chat || !chat.list || !panel) return null;
    var body = panel.body;
    var wasTop = body.scrollTop <= CHAT_TOP_PX;
    var beforeHeight = body.scrollHeight;
    chat.list.insertAdjacentHTML('afterbegin', html);
    var node = chat.list.firstElementChild;
    if (wasTop) {
      body.scrollTop = 0;
    } else {
      body.scrollTop = body.scrollTop + (body.scrollHeight - beforeHeight);
      showNewTip();
    }
    return node;
  }

  function ensureNewTip() {
    if (!panel) return null;
    if (panel.newTip) return panel.newTip;
    var tip = el('button', 'dm-subagent-newtip', '↑ 有新消息');
    tip.type = 'button';
    tip.hidden = true;
    tip.addEventListener('click', function (e) {
      e.preventDefault();
      if (!panel) return;
      panel.body.scrollTop = 0;
      hideNewTip(true);
    });
    panel.sheet.appendChild(tip);
    panel.newTip = tip;
    return tip;
  }
  function showNewTip() {
    if (!chat) return;
    var tip = ensureNewTip();
    if (!tip) return;
    chat.pendingNew = (chat.pendingNew || 0) + 1;
    tip.textContent = '↑ 有 ' + chat.pendingNew + ' 条新消息';
    tip.hidden = false;
  }
  function hideNewTip(reset) {
    if (panel && panel.newTip) panel.newTip.hidden = true;
    if (reset && chat) chat.pendingNew = 0;
  }

  function msgHtml(item, extraClass) {
    var icon = item.role === 'user' ? '我' : (item.role === 'assistant' ? 'AI' : '⚙');
    return '<div class="dm-subagent-msg dm-subagent-msg-' + item.role + (extraClass ? ' ' + extraClass : '') + '">' +
      '<span class="dm-subagent-who">' + icon + '</span>' +
      '<span class="dm-subagent-text">' + esc(item.text || '(无文本)') + '</span>' +
      '</div>';
  }

  // 单条事件 → 一行消息（映射口径与旧 renderChat 完全一致，只是顺序改为前插）。
  function itemOfEvent(ev) {
    if (!ev || typeof ev.type !== 'string') return null;
    var data = (ev.data && typeof ev.data === 'object') ? ev.data : {};
    var seq = (typeof ev.seq === 'number' && isFinite(ev.seq)) ? ev.seq : undefined;
    if (ev.type === 'user/message') {
      return { role: 'user', text: excerpt(textOf(data.content), 120), seq: seq };
    }
    if (ev.type === 'assistant/message') {
      var m = (data.message && typeof data.message === 'object') ? data.message : data;
      var body = textOf(m.content);
      if (!body) body = reasoningOf(m.content);
      return { role: 'assistant', text: excerpt(body, 220), seq: seq };
    }
    if (ev.type === 'tool/call') {
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
      return { role: 'tool', text: toolName + (argText ? ' · ' + argText : ''), seq: seq };
    }
    return null;
  }

  function prependItem(item) {
    if (!chat || !chat.list || !item) return false;
    if (typeof item.seq === 'number') {
      // seq 单调递增：SSE 与 30s 对账可能各带一份同一条事件，这里一并去重。
      if (item.seq <= chat.itemSeq) return false;
      chat.itemSeq = item.seq;
    }
    prependHtml(msgHtml(item));
    return true;
  }

  // 流式气泡：同一个 turn/step 的 text-delta 累加进同一个 DOM 节点（它始终在最上面）。
  //
  // 文字用**一个文本节点**更新（textNode.data += …），而不是 element.textContent = …：
  // 后者每次都会「删掉旧文本节点 + 插一个新节点」，几百个 chunk 就是几百次 childList
  // 增删（实测 527 added / 523 removed）；改文本节点后只剩 characterData 变更，
  // 流式期间消息容器的子节点数量保持不变。
  function liveBubble(key) {
    if (!chat) return null;
    if (chat.live && chat.live.key === key) return chat.live;
    finalizeLive();
    if (!chat.list) return null;
    var node = prependHtml(msgHtml({ role: 'assistant', text: '' }, 'dm-subagent-msg-live'));
    var textEl = node ? node.querySelector('.dm-subagent-text') : null;
    var textNode = null;
    if (textEl) {
      textEl.textContent = '';
      textNode = document.createTextNode('');
      textEl.appendChild(textNode);
    }
    chat.live = { key: key, node: node, textEl: textEl, textNode: textNode, text: '' };
    return chat.live;
  }
  function writeLiveText(live, text) {
    if (!live) return;
    live.text = text;
    if (live.textNode) live.textNode.data = text;
    else if (live.textEl) live.textEl.textContent = text;
  }
  function appendChunk(data) {
    if (!chat || !panel) return;
    var chunk = data && data.chunk;
    if (!chunk || typeof chunk !== 'object') return;
    if (chunk.type !== 'text-delta') return;   // reasoning-delta 不显示，避免与正文混在一起
    if (typeof chunk.text !== 'string' || chunk.text === '') return;
    var key = String(data.turn === undefined ? '' : data.turn) + ':' + String(data.step === undefined ? '' : data.step);
    var live = liveBubble(key);
    if (!live) return;
    var body = panel.body;
    var wasTop = body.scrollTop <= CHAT_TOP_PX;
    var beforeHeight = body.scrollHeight;
    writeLiveText(live, live.text + chunk.text);
    if (wasTop) body.scrollTop = 0;
    else {
      var delta = body.scrollHeight - beforeHeight;
      if (delta > 0) body.scrollTop += delta;
    }
  }
  function finalizeLive(finalText) {
    if (!chat || !chat.live) return false;
    if (typeof finalText === 'string' && finalText !== '') writeLiveText(chat.live, finalText);
    if (chat.live.node) chat.live.node.classList.remove('dm-subagent-msg-live');
    chat.live = null;
    return true;
  }

  // 定稿用的完整正文（不走 excerpt）：流式气泡里已经显示了多少字就保持多少，
  // 否则「流式时是全文、定稿瞬间被截成 220 字」会让文字回缩一下。
  function fullAssistantText(ev) {
    var data = (ev && ev.data && typeof ev.data === 'object') ? ev.data : {};
    var m = (data.message && typeof data.message === 'object') ? data.message : data;
    return textOf(m.content) || reasoningOf(m.content);
  }

  // 一条已落盘事件：先让流式气泡定稿，再按 seq 单调前插（重复事件自然被丢弃）。
  function handleSessionEvent(ev) {
    if (!chat || !ev) return;
    var item = itemOfEvent(ev);
    if (!item) return;
    if (typeof item.seq === 'number') chat.seenSeq = Math.max(chat.seenSeq, item.seq);
    if (item.role === 'assistant' && chat.live) {
      // 同一步的最终消息：复用流式气泡节点（不新建、不闪），文字换成完整定稿内容。
      finalizeLive(fullAssistantText(ev) || item.text);
      if (typeof item.seq === 'number' && item.seq > chat.itemSeq) chat.itemSeq = item.seq;
      return;
    }
    if (item.role === 'user') finalizeLive();
    prependItem(item);
  }

  function createChatShell() {
    if (!panel) return null;
    panel.body.removeAttribute('data-dm-html');
    panel.body.innerHTML = '';
    var list = el('div', 'dm-subagent-chat');
    list.setAttribute('data-dm-chat', '1');
    panel.body.appendChild(list);
    return list;
  }

  function stopChat() {
    if (!chat) return;
    var old = chat;
    chat = null;
    try { if (old.es) old.es.close(); } catch (e) {}
    if (old.reconcileTimer !== null && old.reconcileTimer !== undefined) window.clearInterval(old.reconcileTimer);
    if (panel) {
      panel.body.removeAttribute('data-dm-chat-sid');
      // 恢复浏览器默认的滚动锚定（聊天视图里是我们自己接管补偿的）。
      panel.body.style.overflowAnchor = '';
      if (panel.newTip) panel.newTip.hidden = true;
    }
  }

  // 30s 低频对账：只把「本页里有、我们还没画」的事件补上；不清空、不重置滚动。
  function reconcileChat() {
    if (!chat || view !== 'chat') return;
    var target = chat;
    rpc('session.history', {
      sessionId: target.sid,
      maxMessages: 25,
      parentSessionId: target.parent,
      subscribe: true,
    }).then(function (res) {
      if (!chat || chat !== target || view !== 'chat') return;
      if (!res || !res.ok || !res.value) return;
      var events = Array.isArray(res.value.events) ? res.value.events : [];
      for (var i = 0; i < events.length; i++) {
        var ev = events[i] && events[i].event;
        if (ev) handleSessionEvent(ev);
      }
    }).catch(function () {});
  }

  function startChatStream(target) {
    if (!target || target.es) return;
    try {
      // 自己开一条 mux 连接（不复用 bundle 的）：只认当前子代理会话的帧。
      var es = new EventSource('/m/api/events.mux');
      target.es = es;
      es.addEventListener('message', function (msg) {
        if (!chat || chat !== target) return;
        var raw = msg && msg.data ? String(msg.data) : '';
        if (raw === '') return;
        // 先子串预判：绝大多数帧与本会话无关，避免每个 chunk 都 JSON.parse。
        if (raw.indexOf('session/event') < 0 && raw.indexOf('assistant/chunk') < 0) return;
        var wire;
        try { wire = JSON.parse(raw); } catch (e) { return; }
        if (!wire || wire.type !== 'server-request') return;
        var frame = wire.payload;
        if (!frame || frame.type !== 'session/event') return;
        if (frame.sessionId !== target.sid) return;
        var ev = frame.event;
        if (!ev || typeof ev !== 'object') return;
        if (ev.type === 'assistant/chunk') appendChunk(ev.data);
        else handleSessionEvent(ev);
      });
      es.addEventListener('open', function () {
        // 重连后可能漏帧：立刻对账一次（仍然只补差异）。
        if (chat === target) reconcileChat();
      });
    } catch (e) {}
    target.reconcileTimer = window.setInterval(function () {
      if (document.visibilityState && document.visibilityState !== 'visible') return;
      if (chat !== target || view !== 'chat') return;
      reconcileChat();
    }, CHAT_RECONCILE_MS);
  }

  // ── 打开某条子代理的聊天内容 ──────────────────────────────────────────
  function openChat(sid) {
    if (!panel || !sid) return;
    if (chat && chat.sid === sid && view === 'chat') return;
    stopChat();
    view = 'chat';
    panel.back2.classList.add('dm-subagent-show');
    panel.title.textContent = '子代理 · ' + String(sid).slice(0, 8);
    chat = {
      sid: sid,
      parent: currentSession(),
      itemSeq: -1,
      seenSeq: -1,
      live: null,
      es: null,
      reconcileTimer: null,
      list: null,
      pendingNew: 0,
    };
    var target = chat;
    chat.list = createChatShell();
    panel.body.setAttribute('data-dm-chat-sid', sid);
    // 聊天视图自己补偿前插带来的高度差，关掉浏览器的滚动锚定，行为才可预测。
    panel.body.style.overflowAnchor = 'none';
    panel.body.scrollTop = 0;
    hideNewTip(true);
    if (!chat.list) return;
    chat.list.innerHTML = '<p class="dm-subagent-hint dm-subagent-loading">加载中…</p>';

    // 带上 parentSessionId：宿主读子代理会话必须走 durable 父地址；
    // subscribe=true 必须在读历史**之前**登记，否则两者之间的增量没人推。
    rpc('session.history', {
      sessionId: sid,
      maxMessages: 50,
      parentSessionId: target.parent,
      subscribe: true,
    }).then(function (res) {
      if (!chat || chat !== target || view !== 'chat') return;
      target.list.innerHTML = '';
      var ok = !!(res && res.ok && res.value);
      var events = ok && Array.isArray(res.value.events) ? res.value.events : [];
      // 只画能显示的事件（user / assistant / tool），保持宿主给的旧→新顺序。
      var items = [];
      for (var i = 0; i < events.length; i++) {
        var ev = events[i] && events[i].event;
        if (!ev) continue;
        var item = itemOfEvent(ev);
        if (item) items.push(item);
      }
      if (items.length === 0) {
        target.list.innerHTML = '<p class="dm-subagent-hint">无法加载该子代理的会话内容</p>';
        return;
      }
      // 反转渲染：最新一条在最上面，旧消息往下排。
      var html = '';
      for (var k = items.length - 1; k >= 0; k -= 1) html += msgHtml(items[k]);
      target.list.innerHTML = html;
      var newest = -1;
      for (var m = 0; m < items.length; m += 1) {
        if (typeof items[m].seq === 'number') newest = Math.max(newest, items[m].seq);
      }
      target.itemSeq = newest;
      target.seenSeq = newest;
      // 打开即停在顶部：顶部就是最新消息。
      panel.body.scrollTop = 0;
      startChatStream(target);
    }).catch(function () {
      if (!chat || chat !== target || view !== 'chat') return;
      target.list.innerHTML = '<p class="dm-subagent-hint">无法加载该子代理的会话内容</p>';
    });
  }

  // 行点击：取 data-sid，切成聊天内容视图（增量模式）。
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var row = t.closest('.dm-subagent-row');
    if (!row) return;
    var sid = row.getAttribute('data-sid');
    if (!sid) return;
    e.preventDefault();
    chatSid = sid;
    openChat(sid);
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
      // 聊天视图自检快照（只读，测试/排查用）：确认 EventSource 已释放、增量游标位置。
      chatState: function () {
        try {
          if (!chat) return { open: false };
          return {
            open: true,
            sid: chat.sid,
            itemSeq: chat.itemSeq,
            seenSeq: chat.seenSeq,
            nodes: chat.list ? chat.list.children.length : 0,
            live: chat.live !== null,
            atTop: chatAtTop(),
            pendingNew: chat.pendingNew || 0,
            esReadyState: chat.es ? chat.es.readyState : -1,
            reconciling: chat.reconcileTimer !== null,
          };
        } catch (e) {
          return { open: false };
        }
      },
    };
  } catch (e) {}

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    window.setTimeout(function () { pending = false; ensure(); }, 60);
  }
  try {
    if (window.__dmMutationBus) window.__dmMutationBus.subscribe(schedule);
    else {
      var mo = new MutationObserver(schedule);
      mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
    }
  } catch (e) {}
  if (window.__dmEnsureTick) window.__dmEnsureTick.add(ensure, 800, function () { return !!document.querySelector('.chat-composer'); }); else setInterval(ensure, 800);
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
    if (window.__dmMutationBus) window.__dmMutationBus.subscribe(schedule);
    else {
      var mo = new MutationObserver(schedule);
      mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
    }
  } catch (e) {}
  if (window.__dmEnsureTick) window.__dmEnsureTick.add(ensure, 800, function () { return !!document.querySelector('.chat-composer'); }); else setInterval(ensure, 800);
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
    if (window.__dmMutationBus) window.__dmMutationBus.subscribe(schedule);
    else {
      var mo = new MutationObserver(schedule);
      mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
    }
  } catch (e) {}
  if (window.__dmEnsureTick) window.__dmEnsureTick.add(ensure, 800, function () { return !!document.querySelector('#dm-tools, .chat-tools'); }); else setInterval(ensure, 800);
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
    if (window.__dmMutationBus) window.__dmMutationBus.subscribe(schedule);
    else {
      var mo = new MutationObserver(schedule);
      mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
    }
  } catch (e) {}
  if (window.__dmEnsureTick) window.__dmEnsureTick.add(ensure, 800, function () { return !!document.querySelector('.chat-composer'); }); else setInterval(ensure, 800);
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
    if (window.__dmMutationBus) window.__dmMutationBus.subscribe(schedule);
    else {
      var mo = new MutationObserver(schedule);
      mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
    }
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
    // 设置页标志。原来只认「搜索框 .settings-search 已渲染」，而它比设置分组晚约
    // 250ms 才出现 —— 于是「发送模式」这一行总是比其它行动态晚一拍冒出来。
    // 现在两种判据任一成立即可：搜索框、或已渲染出设置分组标题。
    // 聊天页/列表页都没有 .settings-groupTitle，所以不会误判。
    var title = document.querySelector('.mobile-title');
    var titleText = title ? String(title.textContent || '') : '';
    var hasSearch = !!document.querySelector('.settings-search');
    var hasGroups = document.querySelectorAll('.settings-groupTitle').length > 0;
    if (!hasSearch && !hasGroups) return null;
    // 有搜索框但标题明确不是「设置」→ 说明还在别的页面，不动。
    if (hasSearch && titleText !== '' && titleText.indexOf('设置') < 0) return null;
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
    // 图标：队列语义，但**刻意做简**——设置页其它行都是 19~20px 的细线条图标，
  // 这里如果画三条粗矩形 + 箭头，缩到同样尺寸会糊成一团、视觉也比邻行重。
  // 只保留三根等距横线（队列/列表），与邻行的线条密度一致。
  icon.innerHTML =
      '<span aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M6.5 8.5h11"/>' +
      '<path d="M6.5 12h11"/>' +
      '<path d="M6.5 15.5h11"/>' +
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

    // 必须等「对话」分组渲染出来再插入：否则会先落到 .mobile-scroll 顶部，
        // 位置错在第一个分组之上。分组没到时直接返回，等 observer 下一次触发。
        var group = chatGroup();
        if (!group) return;
        var li = build();
        group.appendChild(li);
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
  // 设置页是 SPA 渲染的：原来靠 500ms 轮询等它出现，所以「发送模式」这一行会
  // 明显晚一拍才冒出来（用户反馈"单独加载、后面才出现"）。
  // 改成 MutationObserver：设置页一挂载就（在下一帧）插入，几乎与其它行同时出现；
  // 保留 2s 的低频兜底，应对极端情况下 observer 没触发的场景。
  var queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    (window.requestAnimationFrame || function (fn) { return setTimeout(fn, 16); })(function () {
      queued = false;
      try { ensure(); } catch (e) {}
    });
  }
  try {
    var mo = new MutationObserver(schedule);
    mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
  } catch (e) {}
  setInterval(schedule, 2000);
  ensure();
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
      if (window.__dmMutationBus) window.__dmMutationBus.subscribe(schedule);
      else {
        var mo = new MutationObserver(schedule);
        mo.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'hidden']
      });
      }
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

    // ── 4c) 思考阶段的行数文案 ──────────────────────────────────────────────
    // 过程卡展开后，下面每一段思考都是「✦ 深度思考 · N 行」；主展开栏却一直写
    // 「思考中」，信息量对不上。这里把 head 上的「思考中」镜像成同一张卡里
    // **最后一段**思考的行数文案（N 随流式增长实时更新）；卡片收起、下面还
    // 没有这一行时退回「思考中」。
    var THINK_LABEL = '.chat-think-label';
    var THINK_TEXT_RE = /^深度思考\s*·\s*\d+\s*行$/;

    function thinkingLabelOf(el) {
      // el 是 head 内的 .chat-proc-current-text：向上找到同一张过程卡。
      var card = el;
      while (card && card.nodeType === 1 && !card.classList.contains('chat-proc')) {
        card = card.parentNode;
      }
      if (!card || card.nodeType !== 1) return '';
      var labels = card.querySelectorAll(THINK_LABEL);
      var text = '';
      for (var i = 0; i < labels.length; i++) {
        var t = trim(labels[i].textContent || '');
        if (t !== '') text = t;   // 取最后一个：最新一段思考
      }
      return text;
    }

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
          // 思考阶段：显示和下面那一行一样的「深度思考 · N 行」。
          if (raw === '思考中' || THINK_TEXT_RE.test(raw)) {
            var thinkText = thinkingLabelOf(el);
            var nextThink = thinkText === '' ? '思考中' : thinkText;
            if (n.nodeValue !== nextThink) n.nodeValue = nextThink;
            continue;
          }
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

    // characterData 覆盖状态词变化（React 只改 nodeValue），childList 覆盖
    // 行/折叠块的挂载与卸载，aria-label 覆盖状态行自身的状态切换。
    if (window.__dmMutationBus) window.__dmMutationBus.subscribe(schedule, { attributes: true });
    else {
      var mo = new MutationObserver(schedule);
      mo.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['aria-label']
    });
    }
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
      if (window.__dmMutationBus) window.__dmMutationBus.subscribe(ensure, { attributes: true });
      else {
        var mo = new MutationObserver(function () { ensure(); });
        mo.observe(document.documentElement || document.body, {
        childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'aria-label', 'title', 'aria-hidden']
      });
      }
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
/**
 * 设备型号上报（手机端页面加载时执行一次）。
 *
 * 为什么要客户端上报：UA 里不一定有型号（华为 ArkWeb 写死 "Phone"）。
 * Chromium 的高熵 Client Hints 能给出真实型号（`navigator.userAgentData
 * .getHighEntropyValues(['model','platform','platformVersion'])`），但它只在
 * 页面里拿得到，必须由手机自己 POST 回宿主。
 *
 * 宿主侧 mobile.reportDevice 会把它写进设备表（并顺手把默认名「手机设备」
 * 换成型号/平台标签）；拿不到 model 的浏览器留着 UA，由宿主解析出
 * 「平台 · 浏览器」兜底，所以不会白跑。
 */
const DEVICE_INFO_HTML = `<script>
(function () {
  try {
    var send = function (info) {
      try {
        fetch('/m/api/mobile.reportDevice', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({
            type: 'client-request',
            rpcId: 'dev-' + String(Date.now()),
            method: 'mobile.reportDevice',
            payload: info
          })
        }).catch(function () {});
      } catch (e) {}
    };
    var ua = typeof navigator === 'object' && typeof navigator.userAgent === 'string' ? navigator.userAgent : '';
    var data = typeof navigator === 'object' ? navigator.userAgentData : null;
    if (data && typeof data.getHighEntropyValues === 'function') {
      data.getHighEntropyValues(['model', 'platform', 'platformVersion']).then(function (v) {
        send({
          model: v && typeof v.model === 'string' ? v.model : '',
          platform: v && typeof v.platform === 'string' ? v.platform : '',
          platformVersion: v && typeof v.platformVersion === 'string' ? v.platformVersion : '',
          ua: ua
        });
      }, function () {
        send({ ua: ua });
      });
    } else {
      send({ ua: ua });
    }
  } catch (e) {}
})();
</script>`

/**
 * 通知设置页标记。
 *
 * 通知页（设置 → 通知）由 bundle 渲染，内部用 .settings-field 的竖排结构：
 * 标题 → 控件 → 说明。用户希望改成「左边标题、右边参数」的横向行，但 bundle
 * 禁止修改，只能由 theme.css 覆盖。CSS 又没法按页面标题选父级，所以这里在
 * <body> 上挂一个 .dm-notify-page（当前页标题是「通知」时），theme.css 用
 * body.dm-notify-page 作用域；挂在 body 上不会被 React 重渲染抹掉。
 */
const NOTIFY_LAYOUT_HTML = `<script>
(function () {
  try {
    if (!document.body) return;
    function mark() {
      var titles = document.querySelectorAll('.mobile-title');
      var on = false;
      for (var i = 0; i < titles.length; i++) {
        var text = titles[i].textContent || '';
        if (text.trim() === '通知') { on = true; break; }
      }
      var body = document.body;
      if (on) {
        if (!body.classList.contains('dm-notify-page')) body.classList.add('dm-notify-page');
      } else if (body.classList.contains('dm-notify-page')) {
        body.classList.remove('dm-notify-page');
      }
    }
    mark();
    var queued = false;
    var mo = new MutationObserver(function () {
      if (queued) return;
      queued = true;
      var run = function () { queued = false; mark(); };
      if (window.requestAnimationFrame) window.requestAnimationFrame(run);
      else window.setTimeout(run, 0);
    });
    mo.observe(document.body, { childList: true, subtree: true });
  } catch (e) {}
})();
</script>`

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
      if (window.__dmMutationBus) window.__dmMutationBus.subscribe(schedule, { frame: true });
      else {
        var mo = new MutationObserver(schedule);
        mo.observe(document.documentElement || document.body, { childList: true, subtree: true, characterData: true });
      }
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
// ── 「加载更早」后的视口对准 ────────────────────────────────────────────────
//
// bundle 的 Wr() 取完更早一页后，会把 scrollTop 设为「点之前的位置 + Σ 估算行高」，
// 目的是让用户原来看着的那段内容留在原地。但：
//   · Ll(row) 只是估算（真实高度要等渲染后由 be.current 量出来），prepend 的那批
//     行基本都没量过；
//   · 设置 scrollTop 的那一帧内容还没长到最终高度，浏览器会把值 clamp 到当时的
//     scrollHeight；
//   · 列表够长时还有虚拟窗口 u.slice(Si, Ci)，视口上方用 Oi 占位。
// 结果就是落在 prepend 块中间某个 assistant/思考折叠上，而本轮 user 提问气泡被
// 留在视口上方（实测：scrollTop 11560→3032，新 user 气泡在视口上方 2960px）。
//
// 这里只做一件事：用户点了聊天记录里的「加载更早」之后，把新 prepend 进来的
// 第一个 .chat-msg-user 对到视口顶部；钉几帧盖过 bundle 自己的 rAF 修正，然后
// 交还控制权。用户一滑动/滚轮就立刻放弃，之后不再干预。
const LOAD_OLDER_ALIGN_HTML = `<script>
(function () {
  try {
    if (window.__dmOlderAlign) return;
    window.__dmOlderAlign = true;

    var OFFSET = 8;        // 提问气泡离视口顶部的留白
    var PIN_FRAMES = 24;   // 钉住约 0.4s，盖过 bundle prepend 后的 rAF 补偿
    var WAIT_FRAMES = 900; // 最多等约 15s（与 bundle 的请求超时一致）
    var state = null;      // { before, target, waiting, pinLeft, triedTop }

    function scroller() { return document.querySelector('.chat-scroll'); }

    function firstNewUser(sc, before) {
      var list = sc.querySelectorAll('.chat-msg-user');
      for (var i = 0; i < list.length; i++) {
        var mid = list[i].getAttribute('data-mid');
        if (mid && !before[mid]) return list[i];
      }
      return null;
    }

    function align(sc, el) {
      var top = el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop;
      var want = Math.max(0, top - OFFSET);
      if (Math.abs(sc.scrollTop - want) > 1) sc.scrollTop = want;
    }

    function stop() { state = null; }

    function tick() {
      if (state === null) return;
      var sc = scroller();
      if (sc === null) {
        if (--state.waiting > 0) window.requestAnimationFrame(tick); else stop();
        return;
      }
      var el = state.target;
      if (el === null || !el.isConnected) el = firstNewUser(sc, state.before);
      if (el !== null) {
        state.target = el;
        align(sc, el);
        if (--state.pinLeft > 0) { window.requestAnimationFrame(tick); return; }
        stop();
        return;
      }
      // 兜底：新气泡可能还在虚拟窗口之外（视口上方被 Oi 占位盖住）。先把
      // scrollTop 拉到 0 逼 bundle 把窗口算到头部，下一帧再找。
      if (!state.triedTop && state.waiting < WAIT_FRAMES - 90) {
        state.triedTop = true;
        sc.scrollTop = 0;
      }
      if (--state.waiting > 0) { window.requestAnimationFrame(tick); return; }
      stop();
    }

    function begin(sc) {
      var before = {};
      var list = sc.querySelectorAll('.chat-msg-user');
      for (var i = 0; i < list.length; i++) {
        var mid = list[i].getAttribute('data-mid');
        if (mid) before[mid] = true;
      }
      state = { before: before, target: null, waiting: WAIT_FRAMES, pinLeft: PIN_FRAMES, triedTop: false };
      window.requestAnimationFrame(tick);
    }

    // 只认聊天记录里的按钮：bundle 的报错页重试按钮也用 .chat-load-older，
    // 但它不在 .chat-scroll 里，必须排除。捕获阶段旁听，不阻止 bundle 的处理。
    document.addEventListener('click', function (e) {
      var t = e.target;
      while (t && t !== document && !(t.classList && t.classList.contains('chat-load-older'))) t = t.parentNode;
      if (!t || t === document || !t.classList || !t.classList.contains('chat-load-older')) return;
      var sc = scroller();
      if (sc === null || !sc.contains(t)) return;
      begin(sc);
    }, true);

    // 用户手动滚动就放弃自动对准（点按钮本身的那次触摸不算）。
    ['touchstart', 'wheel', 'keydown'].forEach(function (type) {
      document.addEventListener(type, function (e) {
        if (state === null) return;
        var t = e.target;
        if (t && t.closest && t.closest('.chat-load-older')) return;
        var sc = scroller();
        if (sc !== null && t instanceof Node && sc.contains(t)) stop();
      }, true);
    });

    // 供验收脚本观察状态（不影响页面逻辑）。
    window.__dmOlderAlignState = function () {
      if (state === null) return null;
      return { waiting: state.waiting, pinned: state.target !== null, triedTop: state.triedTop };
    };
  } catch (e) {}
})();
</script>`

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
    var cache = {};   // 字体 + 文本 → 墨迹中心相对基线的偏移
    var DEBUG = /[?&]dmdebug=1/.test(location.search);
    // 用户可调的最终微调（px）：?dmiconshift=1.5 让所有图标整体下移 1.5px。
    // 给"换一台设备/换一个字体仍差一点"留一个不用改代码的旋钮。
    var SHIFT = 0;
    try {
      var shiftMatch = /[?&]dmiconshift=(-?[0-9.]+)/.exec(location.search);
      if (shiftMatch) SHIFT = parseFloat(shiftMatch[1]) || 0;
    } catch (e) {}

    // 把这段文字用**当前元素的实际字体**画到 canvas 上，逐像素扫出墨迹上下边界，
    // 得到「墨迹中心相对基线」的偏移（px，基线以上为负）。
    // 不依赖 fontBoundingBox 等各引擎不一致的度量字段。
    function inkCenterFromBaseline(font, text, fontSize) {
      var key = font + '|' + text;
      if (cache[key] !== undefined) return cache[key];
      var pad = Math.ceil(fontSize * 3);
      ctx.font = font;
      var m;
      try { m = ctx.measureText(text); } catch (e) { cache[key] = null; return null; }
      var w = Math.ceil(m.width) + pad * 2;
      var h = Math.ceil(fontSize * 5) + pad * 2;
      if (w <= 0 || h <= 0 || w > 4096) { cache[key] = null; return null; }
      canvas.width = w;
      canvas.height = h;
      ctx.font = font;                 // 改尺寸会重置状态
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#000';
      var baselineY = pad + fontSize * 2;
      try { ctx.fillText(text, pad, baselineY); } catch (e) { cache[key] = null; return null; }
      var data;
      try { data = ctx.getImageData(0, 0, w, h).data; } catch (e) { cache[key] = null; return null; }
      var top = -1, bottom = -1;
      for (var y = 0; y < h; y++) {
        var has = false;
        for (var x = 0; x < w; x++) { if (data[(y * w + x) * 4 + 3] > 24) { has = true; break; } }
        if (has) { if (top < 0) top = y; bottom = y; }
      }
      var result = (top < 0) ? null : ((top + bottom) / 2 - baselineY);
      cache[key] = result;
      return result;
    }

    // 零宽探针：inline-block 的底边正好落在文字基线上。
    // 用它把「基线在页面上的绝对 Y」量出来 —— 不再依赖任何字体度量推算。
    function baselineOf(textEl) {
      var probe = textEl.__dmBaselineProbe;
      if (!probe || !probe.isConnected || probe.parentNode !== textEl) {
        probe = document.createElement('span');
        probe.setAttribute('aria-hidden', 'true');
        probe.style.cssText = 'display:inline-block;width:0;height:0;overflow:hidden;vertical-align:baseline';
        textEl.appendChild(probe);
        textEl.__dmBaselineProbe = probe;
      }
      var r = probe.getBoundingClientRect();
      return r.bottom;
    }

    // 让一个图标以「同行文字的墨迹中心」为准做垂直对齐。
    function alignOne(icon, textEl) {
      var cs = window.getComputedStyle(textEl);
      var text = (textEl.textContent || '').replace(/[ \\t\\r\\n]+/g, ' ').trim();
      if (text === '') return null;
      var fontSize = parseFloat(cs.fontSize) || 13;
      var font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
      var inkRel = inkCenterFromBaseline(font, text, fontSize);
      if (inkRel === null) return null;
      var baselineY = baselineOf(textEl);
      var targetCenter = baselineY + inkRel;
      // 先清掉自己上次的位移，再量当前位置，避免累积
      icon.style.transform = 'none';
      var ir = icon.getBoundingClientRect();
      if (!(ir.height > 0)) return null;
      var delta = targetCenter - (ir.top + ir.height / 2) + SHIFT;
      if (!isFinite(delta) || Math.abs(delta) > 8) return null;
      var v = (Math.round(delta * 10) / 10) + 'px';
      if (delta !== 0) icon.style.transform = 'translateY(' + v + ')';
      return delta;
    }

    function paintDebug(deltas) {
      if (!DEBUG) return;
      try {
        var box = document.getElementById('dm-align-debug');
        if (!box) {
          box = document.createElement('div');
          box.id = 'dm-align-debug';
          box.style.cssText = 'position:fixed;left:6px;top:6px;z-index:99999;background:rgba(0,0,0,.82);color:#ff5c5c;font:11px/1.5 monospace;padding:6px 8px;border-radius:8px;white-space:pre;pointer-events:none';
          document.body.appendChild(box);
        }
        box.textContent = deltas.length ? deltas.join(String.fromCharCode(10)) : 'no rows';
      } catch (e) {}
    }

    function apply() {
      var deltas = [];
      for (var p = 0; p < PAIRS.length; p++) {
        var rows = document.querySelectorAll(PAIRS[p][0]);
        for (var i = 0; i < rows.length; i++) {
          var row = rows[i];
          var icon = row.querySelector(PAIRS[p][1]);
          var text = row.querySelector(PAIRS[p][2]);
          if (!icon || !text) continue;
          var d = alignOne(icon, text);
          if (d === null) continue;
          if (DEBUG && deltas.length < 6) {
            deltas.push((d >= 0 ? '+' : '') + (Math.round(d * 100) / 100) + '  ' + ((text.textContent || '').trim().slice(0, 10) || '(empty)') + '  ' + window.getComputedStyle(text).fontSize);
          }
        }
      }
      paintDebug(deltas);
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
      if (window.__dmMutationBus) window.__dmMutationBus.subscribe(schedule);
      else {
        var mo = new MutationObserver(schedule);
        mo.observe(document.documentElement || document.body, { childList: true, subtree: true, characterData: true });
      }
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

/**
 * 聊天输入框：单行文字按「实际字体墨迹中心」垂直居中。
 *
 * 问题：`.chat-input` 是 <textarea>，单行时文字位置由「行盒 + 字体度量」决定。
 * 原来写死 padding-top/bottom 11px + line-height 22px（几何上正好 46px），
 * 但不同机型/字体下 CJK 墨迹在行盒里的位置并不对称，用户仍看到「文字偏上」，
 * 而且偏多少随字体变化，写死像素调不准。
 *
 * 做法（与 ICON_OPTICAL_ALIGN 同一套思路，不猜、不硬编码）：
 *   1. 用 canvas 以输入框的真实 font 画出占位文本，逐像素扫出墨迹上下边界，
 *      得到「墨迹中心相对基线」的偏移 inkRel；
 *   2. 用同字体/同行高的隐藏探针量出「基线相对内容盒顶部」的位置 baseline；
 *   3. 于是墨迹中心相对内容盒顶部 = baseline + inkRel；
 *   4. 反解 padding：让墨迹中心落在盒子垂直中线上，padding-bottom 取剩余高度。
 * 只在**单行**时接管；一旦换行（多行输入）就把内联 padding 撤掉，回落到
 * CSS 的 11/11 对称值，避免多行时上紧下松。
 *
 * ⚠️ 高度必须从「基线」量，不能从「当前高度」反推：
 *   bundle 的 `.chat-input` 带 `field-sizing: content`（bundle CSS，禁止改），
 *   输入框高度 = 内容高 + padding + 边框。若拿当前高度反推 padding，写进去的
 *   padding 本身又参与高度计算 —— 任何一次临时变高（草稿折行成两行）都会被
 *   固化成新的下限，删光文字后输入框再也缩不回 44/46px。
 *   所以每次先撤掉内联 padding、量出「单行基线高度」，再用它算居中 padding：
 *   基线只由字体/行高/CSS 决定，算出来的 padding 之和恰好等于基线内容框，
 *   高度不会漂移。多行判定也改用「基线内容高 > 1.5 行高」，不再依赖
 *   scrollHeight —— 在 field-sizing: content 下输入框跟着内容长高，
 *   scrollHeight 永远等于 clientHeight，旧判据永远不会命中。
 *
 * 兼容性：measureText / getImageData 不可用时直接放弃（保持 CSS 原值），
 * 不抛错、不影响输入。字体加载完成后再重量一次（首帧可能是回退字体）。
 */
const INPUT_TEXT_CENTER_HTML = `<script>
(function () {
  try {
    if (window.__dmInputCenter) return;
    window.__dmInputCenter = true;

    var inkCache = {};
    var lastKey = '';
    var lastPads = null;
    // 单行文字整体上移的默认量（px）。用户反馈：几何居中后仍觉得略低；
    // 先上移 1px，仍偏低，再上移 1px → 共 2px。
    var DEFAULT_BIAS = 2;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext ? canvas.getContext('2d') : null;

    function inkCenterFromBaseline(font, text, fontSize) {
      if (!ctx) return null;
      var key = font + '|' + text;
      if (Object.prototype.hasOwnProperty.call(inkCache, key)) return inkCache[key];
      var pad = Math.ceil(fontSize * 3);
      ctx.font = font;
      var m;
      try { m = ctx.measureText(text); } catch (e) { inkCache[key] = null; return null; }
      var w = Math.ceil(m.width) + pad * 2;
      var h = Math.ceil(fontSize * 5) + pad * 2;
      if (!(w > 0) || !(h > 0) || w > 4096) { inkCache[key] = null; return null; }
      canvas.width = w;
      canvas.height = h;
      ctx.font = font;
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#000';
      var baselineY = pad + fontSize * 2;
      try { ctx.fillText(text, pad, baselineY); } catch (e) { inkCache[key] = null; return null; }
      var data;
      try { data = ctx.getImageData(0, 0, w, h).data; } catch (e) { inkCache[key] = null; return null; }
      var top = -1;
      var bottom = -1;
      for (var y = 0; y < h; y++) {
        var has = false;
        for (var x = 0; x < w; x++) {
          if (data[(y * w + x) * 4 + 3] > 24) { has = true; break; }
        }
        if (has) { if (top < 0) top = y; bottom = y; }
      }
      var out = top < 0 ? null : ((top + bottom) / 2 - baselineY);
      inkCache[key] = out;
      return out;
    }

    function baselineInLineBox(el, sample, lineHeight) {
      var cs = window.getComputedStyle(el);
      var box = document.createElement('div');
      box.setAttribute('aria-hidden', 'true');
      box.style.cssText = 'position:fixed;left:-9999px;top:0;visibility:hidden;pointer-events:none;' +
        'margin:0;padding:0;border:0;white-space:pre;' +
        'font:' + cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + '/' + lineHeight + 'px ' + cs.fontFamily + ';' +
        'line-height:' + lineHeight + 'px';
      box.textContent = sample;
      var probe = document.createElement('span');
      probe.style.cssText = 'display:inline-block;width:0;height:0;overflow:hidden;vertical-align:baseline';
      box.appendChild(probe);
      document.body.appendChild(box);
      var b = box.getBoundingClientRect();
      var p = probe.getBoundingClientRect();
      document.body.removeChild(box);
      if (!(b.height > 0)) return null;
      return p.bottom - b.top;
    }

    function clearInline(el) {
      try {
        if (el.style.getPropertyValue('padding-top') !== '') el.style.removeProperty('padding-top');
        if (el.style.getPropertyValue('padding-bottom') !== '') el.style.removeProperty('padding-bottom');
      } catch (e) {}
      el.__dmInputCentered = false;
    }

    // 撤掉本脚本写的内联 padding，回到 CSS 基线（theme.css 的 11/11），
    // 再量「单行时输入框本来该有多高」。基线只由字体/行高/CSS 决定，
    // 与上一次写过什么 padding 无关；因此不会像「按当前高度反推」那样
    // 把任何一次临时变高固化成新的下限（输入框再也缩不回去的根因）。
    function measureBase(el) {
      clearInline(el);
      var cs = window.getComputedStyle(el);
      var height = el.getBoundingClientRect().height || el.offsetHeight || 0;
      return {
        height: height,
        pt: parseFloat(cs.paddingTop) || 0,
        pb: parseFloat(cs.paddingBottom) || 0,
        btop: parseFloat(cs.borderTopWidth) || 0,
        bbot: parseFloat(cs.borderBottomWidth) || 0
      };
    }

    function apply() {
      var el = document.querySelector('.chat-input');
      if (!el || el.nodeType !== 1) return;
      var cs = window.getComputedStyle(el);
      var fontSize = parseFloat(cs.fontSize) || 16;
      var lineHeight = parseFloat(cs.lineHeight);
      if (!(lineHeight > 0)) lineHeight = fontSize * 1.4;

      // 显式换行 → 多行，不接管
      if (String(el.value || '').indexOf('\\n') >= 0) { clearInline(el); lastKey = ''; return; }

      // 关键顺序：先回到基线再量。.chat-input 带 field-sizing: content，
      // 内联 padding 是高度的组成部分，用「当前高度」反推会自我维持。
      var base = measureBase(el);
      if (!(base.height > 0)) return;
      var contentH = base.height - base.btop - base.bbot - base.pt - base.pb;
      // 视觉折行（内容高明显超过一行）→ 多行，不接管，保持 CSS 11/11
      if (contentH > lineHeight * 1.5 + 1) { lastKey = ''; return; }

      var sample = (el.getAttribute('placeholder') || '').trim() || '\\u8bf4\\u70b9\\u4ec0\\u4e48';
      var font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;

      // 视觉偏置（px）：纯几何居中后肉眼仍觉得文字略低，整体上移一点。
      // 运行时可改 window.__dmInputBias 微调（下次 apply 生效）；调好写回 DEFAULT_BIAS。
      var BIAS = (typeof window.__dmInputBias === 'number' && isFinite(window.__dmInputBias))
        ? window.__dmInputBias
        : DEFAULT_BIAS;

      var key = [font, sample, lineHeight, base.height, base.btop, base.bbot, BIAS].join('|');

      // 基线没变就复用上次算好的 padding。measureBase 已经把内联值撤掉了，
      // 所以这里必须重新写回去，不能像旧实现那样直接 return（否则会停在未居中状态）。
      var pads = lastPads;
      if (key !== lastKey || pads === null) {
        var inkRel = inkCenterFromBaseline(font, sample, fontSize);
        if (inkRel === null) { lastKey = ''; lastPads = null; return; }
        var baseline = baselineInLineBox(el, sample, lineHeight);
        if (baseline === null) { lastKey = ''; lastPads = null; return; }

        var inkCenter = baseline + inkRel;                 // 墨迹中心 → 相对内容盒顶部
        var pt = base.height / 2 - base.btop - inkCenter - BIAS; // 几何居中，再整体上移 BIAS
        var pb = base.height - base.btop - base.bbot - lineHeight - pt;
        if (!isFinite(pt) || !isFinite(pb)) { lastKey = ''; lastPads = null; return; }
        if (pt < 0 || pb < 0 || pt > 30 || pb > 30) { lastKey = ''; lastPads = null; return; }

        pads = {
          vt: (Math.round(pt * 100) / 100) + 'px',
          vb: (Math.round(pb * 100) / 100) + 'px'
        };
        lastKey = key;
        lastPads = pads;
      }

      try {
        el.style.setProperty('padding-top', pads.vt, 'important');
        el.style.setProperty('padding-bottom', pads.vb, 'important');
      } catch (e) { return; }
      el.__dmInputCentered = true;
      el.setAttribute('data-dm-input-centered', '1');
    }

    var queued = false;
    function schedule() {
      if (queued) return;
      queued = true;
      var run = function () {
        queued = false;
        try { apply(); } catch (e) {}
      };
      if (window.requestAnimationFrame) window.requestAnimationFrame(run);
      else window.setTimeout(run, 0);
    }

    if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
      document.fonts.ready.then(function () {
        lastKey = '';
        schedule();
      }).catch(function () {});
    }
    window.addEventListener('resize', function () { lastKey = ''; schedule(); }, true);
    document.addEventListener('DOMContentLoaded', schedule);
    // 轮询而不是全量 MutationObserver：流式输出时 DOM 每秒变几十次，
    // 全量观察会让这里反复重算 canvas；600ms 一次足够。基线 key 不变时
    // 直接复用上次算好的 padding（不重跑 canvas/探针），只重新写回内联值。
    setInterval(schedule, 600);
    schedule();
  } catch (e) {}
})();
</script>`

/**
 * 设置页「用量」：直接平铺，不需要先点开再点收起。
 *
 * bundle 的这块是折叠式的：
 *   · 收起态渲染一行 <button class="settings-row">（标题「用量」+ 余额摘要 + › 箭头），
 *     onClick 里 setState(true)；
 *   · 展开态才渲染 <li class="usage-card">（余额明细）以及 actions 里的
 *     「收起」「刷新」两个按钮。
 * 用户要求：内容直接显示，不要再点开/收起。
 *
 * 做法：检测到折叠行就**替用户点一下**（React 状态照常走），展开后把
 * 「收起」按钮隐藏（见 theme.css）。展开态下那一行本身就不会渲染，所以
 * 页面上不会再有箭头/收起入口，效果等于"永久平铺"。
 * 若 React 因其它原因回到收起态，MutationObserver 会再次点开。
 */
const USAGE_INLINE_HTML = `<script>
(function () {
  try {
    if (window.__dmUsageInline) return;
    window.__dmUsageInline = true;
    var lastClick = 0;

    // 折叠态的「用量」行：settings-row 按钮，标题文本里含「用量」。
    function collapsedRow() {
      var rows = document.querySelectorAll('button.settings-row');
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        var t = r.querySelector('.card-titleText');
        if (!t || (t.textContent || '').indexOf('用量') < 0) continue;
        return r;
      }
      return null;
    }

    function ensure() {
      var card = document.querySelector('.usage-card');
      if (card) { autoRefresh(card); return; }              // 已展开：只负责自动同步
      var r = collapsedRow();
      if (!r) return;
      var now = Date.now();
      if (now - lastClick < 900) return;                    // 防抖，避免连点
      lastClick = now;
      try { r.click(); } catch (e) {}
    }

    // 进设置自动同步：点一次「刷新」。用户要求把刷新按钮隐藏，但隐藏的元素
    // 仍能被脚本 .click()，于是既能自动取最新余额，又不占界面。
    var lastRefresh = 0;
    function autoRefresh(card) {
      if (Date.now() - lastRefresh < 5000) return;
      var btns = card.querySelectorAll('.usage-actions > button');
      if (btns.length < 2) return;
      var refresh = btns[btns.length - 1];
      if (refresh.disabled) return;
      lastRefresh = Date.now();
      try { refresh.click(); } catch (e) {}
    }

    try {
      var mo = new MutationObserver(ensure);
      mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
    } catch (e) {}
    setInterval(ensure, 1200);
    ensure();
  } catch (e) {}
})();
</script>`

const COMMAND_PANEL_HTML = `<button id="dm-cmd-btn" class="dm-tool-btn" type="button" aria-label="命令" title="命令（/）"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.2 4 8.8 20"/></svg></button><script>
(function () {
  try {
    if (window.__dmCommandPanel) return;
    window.__dmCommandPanel = true;
    var btn = document.getElementById('dm-cmd-btn');
    if (!btn) return;

    // 命令面板：数据全部来自宿主命令注册表（RPC：mobile.commands / mobile.commandExec），
    // 这里只做呈现与过滤，不内置任何命令名 —— 宿主没注册的命令不会出现在面板里。
    var panel = null;
    // hostCount / skillCount 分来源计数（DOM 证据用）；items 是合并后的展示列表。
    var state = { items: [], reason: '', skillsReason: '', filter: '', hostCount: 0, skillCount: 0 };
    var lastSessionId = '';

    // 与 MODEL_BUTTON_HTML 同一手法：拦截 RPC 请求，自动记住当前会话 id。
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
      var id = 'dm-cmd-' + Date.now() + '-' + Math.floor(Math.random() * 1e6);
      return fetch('/m/api/' + method, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rpcId: id, payload: payload })
      }).then(function (r) { return r.json(); }).then(function (j) { return j ? j.result : null; });
    }

    function el(tag, cls, text) {
      var n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text !== undefined && text !== null) n.textContent = String(text);
      return n;
    }

    // ── 来源区分：宿主命令 / 本机动作 / 技能 ───────────────────────────────────
    // 桌面的 / 菜单是三类来源合并出来的：
    //   1) 宿主命令注册表（commands.list）
    //   2) client 端 commandUi 贡献：文件（ui-conversation client.js:19694，
    //      kind:"action" → inputHub.pickFiles）、模型（ui-model-selection
    //      client.js:1869，kind:"popupSelect" → 模型目录选择器）
    //   3) skill source（ui-skill client.js:419，skills.list → 插入 /name + 空格）
    // 手机页面没有第 2 类 client 插件，所以「文件」「模型」用手机本机动作等价实现，
    // 行上标「本机」，绝不混进 mobile.commands 的返回（bundle 的「＋」面板也用那份）。
    var LOCAL_ACTIONS = [
      {
        name: 'file', cmdName: '文件', label: '文件', description: '从相册或相机添加', group: '添加', source: 'local',
        keywords: ['附件', '图片', '拍照', '相册', '上传'],
      },
      {
        name: 'model', cmdName: '模型', label: '模型', description: '选择本会话使用的模型', group: '指令', source: 'local',
        keywords: ['切换模型', '模型目录', '思考强度'],
      },
    ];
    // ── 中文文案（命令）：按宿主命令 name 查表，命中才覆盖 ─────────────────────
    // 来源（不是自翻）：桌面 @deepseek-ai/dsh-client-ui-commands/lib/client.js 的
    // zh 字典（label.goal=目标、description.goal=设置或查看长期任务目标、
    // label.plan…、label.export=下载日志 …）；model 来自
    // ui-model-selection 的 command.label/description；file 来自 ui-conversation 的
    // input.file（桌面没有独立描述，手机端用「从相册或相机添加」）。orchestrate 由
    // 动态插件注册、宿主没有中文文案，这里给等价中文。
    // 命令名（斜杠后那串）永远保持英文 —— 宿主只解析 /goal 这种形态；中文只是
    // 标题与说明。未命中的新命令不覆盖，回退宿主英文文案（不隐藏）。
    var COMMAND_ZH = {
      goal: { label: '目标', description: '设置或查看长期任务目标' },
      plan: { label: '计划', description: '进入或退出计划模式' },
      feedback: { label: '反馈', description: '发送关于当前会话的反馈' },
      compact: { label: '压缩', description: '压缩以上对话内容' },
      permission: { label: '权限', description: '切换权限预设（沙箱模式与审批策略）' },
      export: { label: '下载日志', description: '将当前会话内容导出为 ZIP' },
      model: { label: '模型', description: '选择本会话使用的模型' },
      file: { label: '文件', description: '从相册或相机添加' },
      orchestrate: { label: '编排', description: '让本回合进入纯编排模式（可带任务参数；不带参数=仅本回合）' },
    };

    // ── 中文文案（技能）：按技能名查表，命中才覆盖 ─────────────────────────────
    // 宿主 skill 没有 locale 字典（SKILL.md 只有英文 description），所以这 16 条是
    // 按各 SKILL.md 英文描述人工写的，不是机器翻译；命中用中文，未命中的新技能
    // 回退宿主英文 description（不隐藏）。技能名同样保持英文。
    var SKILL_ZH = {
      'agent-experience': '编写或修改面向模型的工具定义（名称、描述、参数 schema、系统提示段），以及设计技能、上下文加载与多步工作流',
      'computer-use': '通过 orca computer 控制本地可见应用窗口：辅助功能树、点击、输入、菜单、对话框与截图；适用于原生应用与外部浏览器窗口',
      'cordis-composition-reference': '编写或阅读本 harness 的 Cordis bundle patch 或 agent preset 时使用，需要 Loader YAML 方言或可安装插件包清单',
      'cordis-plugin-development': '设计、评审、增删、启停、安装、配置或调试本 harness 配置档中的插件、bundle、页面、面板、工具或 MCP 连接',
      'diagnose-windows-sandbox-acl': 'Windows 上出现意料之外的 DSH 沙箱访问被拒时使用（工作区写入/列目录失败，或本应可读的路径读不到）；内置命令会检查并修复 ACL',
      'editing-cordis-compositions': '创建、修改或校验本 harness 的 agent preset 或其它 Cordis 组合，包括判断放宿主还是预设、以及确认预设能挂载',
      'find-skills': '帮助用户发现并安装 agent 技能（用户问「怎么做 X」「找一个技能」「有没有能…的技能」或想扩展能力时）',
      office: '创建、编辑、检查或转换 Office 文档、表格、演示文稿与 PDF；加载后选择合适的工作流',
      'office-docx': '创建、读取、编辑并校验 Word 文档（.docx）',
      'office-export-pdf': '用 LibreOffice Kit 把 Office 文档转换为 PDF',
      'office-pptx': '创建、读取、编辑并校验 PowerPoint 演示文稿（.pptx）',
      'office-recalculate': '用 LibreOffice Kit 刷新表格公式缓存并校验计算结果',
      'office-render': '用 LibreOffice Kit 渲染文档图片或检查页面布局',
      'office-xlsx': '读取、创建、编辑并校验 Excel 工作簿、数据与公式（.xlsx）',
      'orca-cli': '通过 orca CLI 操作 Orca 管理的工作树、文件夹上下文、终端、仓库、自动化、产物、技能共享、工作树评论与内嵌浏览器',
      orchestration: '编排受监督的 Orca 工作者：线程消息、阻塞式问答、任务派发、worker_done/escalation 等待、任务 DAG、决策门、协调循环与跨 agent 拆分',
    };

    function localOf(name) {
      for (var i = 0; i < LOCAL_ACTIONS.length; i++) {
        if (LOCAL_ACTIONS[i].name !== name) continue;
        var copy = {};
        for (var k in LOCAL_ACTIONS[i]) {
          if (Object.prototype.hasOwnProperty.call(LOCAL_ACTIONS[i], k)) copy[k] = LOCAL_ACTIONS[i][k];
        }
        return copy;
      }
      return null;
    }

    // 宿主命令 + 本机动作 + 技能 → 与桌面 SECTION_ROWS 同序的一张展示列表：
    //   添加：文件（本机）/ 目标 / 计划 / 反馈
    //   指令：压缩 / 权限 / 模型（本机）/ 导出 / 其余宿主命令
    //   技能：宿主 sessionSkillCatalog 的真实技能（单独一组，绝不与宿主命令混排）
    function mergeItems(hostItems, skillItems) {
      var add = [];
      var commands = [];
      for (var i = 0; i < hostItems.length; i++) {
        var it = hostItems[i];
        if (!it || typeof it.name !== 'string' || it.name === '') continue;
        it.source = 'host';
        // 展示层中文化：命中 COMMAND_ZH 才覆盖 label/description；未命中的新命令
        // 保留宿主返回的英文文案（不隐藏、不翻译）。宿主英文 description 塞进
        // keywords，保证用英文也能搜到（搜索同时匹配中文说明与英文命令名）。
        var zh = COMMAND_ZH[it.name];
        if (zh) {
          if (typeof it.description === 'string' && it.description !== '') {
            it.keywords = (Array.isArray(it.keywords) ? it.keywords : []).concat([it.description]);
          }
          it.label = zh.label;
          it.description = zh.description;
        }
        // 命令名也中文化：面板显示/插入 /目标；宿主只认英文，执行前由
        // mobile.commandExec 的 canonicalCommandLine() 映射回去。data-name 仍存英文。
        it.cmdName = zh ? zh.label : it.name;
        if (it.group === '添加') {
          add.push(it);
          continue;
        }
        // mobile.commands 会把没有 definitionId 的宿主命令归到「技能」段（旧逻辑：
        // 那时还没有真技能来源）。真技能现在由 mobile.skills 单独提供，宿主命令
        // 一律收进「指令」段末尾（桌面 ui-commands 对未列出的命令也是这么排的），
        // 否则 orchestrate 这类命令会和真技能挤在同一组，来源就混了。
        it.group = '指令';
        commands.push(it);
      }
      var file = localOf('file');
      if (file) add.unshift(file);
      var model = localOf('model');
      if (model) {
        var after = -1;
        for (var c = 0; c < commands.length; c++) {
          if (commands[c].name === 'permission') after = c;
        }
        commands.splice(after + 1, 0, model);
      }
      var out = add.concat(commands);
      for (var s = 0; s < skillItems.length; s++) {
        var sk = skillItems[s];
        if (!sk || typeof sk.name !== 'string' || sk.name === '') continue;
        var desc = typeof sk.description === 'string' ? sk.description : '';
        // 技能中文文案：按 name 查 SKILL_ZH，命中用中文；未命中的新技能回退宿主
        // 英文 description（不隐藏）。英文原文仍进 keywords，便于英文检索。
        var zhSkill = SKILL_ZH[sk.name];
        if (typeof zhSkill === 'string' && zhSkill !== '') desc = zhSkill;
        // 与桌面 ui-skill 的候选描述完全一致：modelInvocable=false（仅用户可调用）
        // 前缀「仅用户 · 」（client.js:427-430）。
        if (sk.modelInvocable === false && desc !== '') desc = '仅用户 · ' + desc;
        var skillKeywords = [];
        if (typeof sk.whenToUse === 'string' && sk.whenToUse !== '') skillKeywords.push(sk.whenToUse);
        if (typeof sk.description === 'string' && sk.description !== '') skillKeywords.push(sk.description);
        out.push({
          name: sk.name,
          // 技能标识是宿主英文名，无法中文化：显示与插入都用英文 /name。
          cmdName: sk.name,
          label: sk.name,
          description: desc,
          group: '技能',
          source: 'skill',
          disabled: sk.userInvocable === false,
          keywords: skillKeywords,
        });
      }
      return out;
    }

    function build() {
      var back = document.createElement('div');
      back.className = 'dm-perm-backdrop dm-cmd-backdrop';
      var sheet = document.createElement('div');
      sheet.className = 'dm-perm-sheet dm-cmd-sheet';
      var head = document.createElement('div');
      head.className = 'dm-perm-head dm-cmd-head';
      var title = el('div', 'dm-perm-title', '命令与技能');
      var close = el('button', 'dm-perm-close', '✕');
      close.type = 'button';
      close.setAttribute('aria-label', '关闭');
      head.appendChild(title);
      head.appendChild(close);

      var searchRow = el('div', 'dm-cmd-searchrow');
      var search = document.createElement('input');
      search.className = 'dm-cmd-search';
      search.type = 'search';
      search.autocomplete = 'off';
      search.setAttribute('placeholder', '搜索命令或技能');
      search.setAttribute('aria-label', '搜索命令或技能');
      searchRow.appendChild(search);

      var body = el('div', 'dm-perm-body dm-cmd-body');
      var status = el('div', 'dm-perm-status');

      sheet.appendChild(head);
      sheet.appendChild(searchRow);
      sheet.appendChild(body);
      sheet.appendChild(status);
      back.appendChild(sheet);
      document.body.appendChild(back);

      back.addEventListener('click', function (e) { if (e.target === back) closePanel(); });
      close.addEventListener('click', function (e) { e.preventDefault(); closePanel(); });
      search.addEventListener('input', function () {
        state.filter = search.value || '';
        paint();
      });

      // 下滑关闭：只监听头部，避免和列表本身的滚动抢触摸事件。
      var startY = 0;
      head.addEventListener('touchstart', function (e) {
        if (e.touches && e.touches.length === 1) startY = e.touches[0].clientY;
      }, { passive: true });
      head.addEventListener('touchmove', function (e) {
        if (!e.touches || e.touches.length !== 1) return;
        if (e.touches[0].clientY - startY > 70) {
          startY = 1e9;
          closePanel();
        }
      }, { passive: true });

      panel = { back: back, body: body, status: status, search: search };
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

    function haystack(it) {
      // 中文命令名（cmdName）、中文说明、英文命令名（name）与关键词都参与搜索。
      var parts = [it.name || '', it.cmdName || '', it.label || '', it.description || ''];
      var kw = it.keywords;
      if (kw && kw.length) parts = parts.concat(kw);
      return parts.join(' ').toLowerCase();
    }

    // ── 行首图标：与宿主（桌面端 / 命令菜单）同一套 16×16 线性图标 ──────────────
    // 路径直接取自宿主 client-ui-primitives 的 *Regular 图标（file 用回形针、
    // goal 准星、plan 计划页、feedback 纸飞机、compact 圆环、permission 盾牌、
    // model 数据库、export 下载）。技能组的命令是动态名字，统一用技能图标；
    // 其它未知命令留一个空盒子，保证文字仍然对齐（和宿主菜单一致）。
    var CMD_ICONS = {
      file: { vb: '0 0 16 16', html: '<path d="M12.75 4.5V9.5C12.75 10.7598 12.2496 11.968 11.3588 12.8588C10.468 13.7496 9.25978 14.25 8 14.25C6.74022 14.25 5.53204 13.7496 4.64124 12.8588C3.75045 11.968 3.25 10.7598 3.25 9.5V5C3.25 4.13805 3.59241 3.3114 4.2019 2.7019C4.8114 2.09241 5.63805 1.75 6.5 1.75C7.36195 1.75 8.1886 2.09241 8.7981 2.7019C9.40759 3.3114 9.75 4.13805 9.75 5V9.5C9.75 9.96413 9.56563 10.4092 9.23744 10.7374C8.90925 11.0656 8.46413 11.25 8 11.25C7.53587 11.25 7.09075 11.0656 6.76256 10.7374C6.43437 10.4092 6.25 9.96413 6.25 9.5V5.5" fill="none" stroke="currentColor"/>' },
      goal: { vb: '0 0 16 16', html: '<path d="M14.5001 8C14.5 9.28552 14.1188 10.5422 13.4045 11.611C12.6903 12.6799 11.6752 13.5129 10.4875 14.0049C9.29982 14.4968 7.99295 14.6255 6.73212 14.3747C5.4713 14.124 4.31314 13.505 3.4041 12.596C2.49514 11.687 1.87614 10.5288 1.62537 9.26798C1.37459 8.00716 1.50331 6.70028 1.99525 5.51261C2.48719 4.32494 3.32025 3.30981 4.3891 2.59557C5.45795 1.88134 6.71458 1.50008 8.0001 1.5" fill="none" stroke="currentColor"/><path d="M11.5 8C11.5001 8.69227 11.2948 9.36901 10.9102 9.94463C10.5257 10.5202 9.97901 10.9689 9.33944 11.2338C8.69986 11.4987 7.99609 11.5681 7.31712 11.433C6.63816 11.2979 6.01449 10.9645 5.52501 10.475C5.03548 9.98552 4.70209 9.36185 4.56702 8.68289C4.43195 8.00392 4.50127 7.30015 4.76619 6.66057C5.03112 6.021 5.47976 5.47436 6.05538 5.08978C6.631 4.70519 7.30774 4.49995 8.00001 4.5" fill="none" stroke="currentColor"/><path d="M8.00024 7.99976L11.2 4.80005" fill="none" stroke="currentColor"/><path d="M12.4719 5.62245C12.4246 5.66972 12.3569 5.69025 12.2913 5.67715L10.7814 5.37555C10.7022 5.35972 10.6402 5.29781 10.6244 5.2186L10.3228 3.70866C10.3097 3.6431 10.3302 3.57533 10.3775 3.52806L12.1826 1.723C12.2863 1.61929 12.4627 1.65879 12.5122 1.79684L12.9271 2.95225C12.9472 3.00847 12.9915 3.05272 13.0477 3.07291L14.2031 3.48774C14.3412 3.5373 14.3807 3.71368 14.277 3.81739L12.4719 5.62245Z" fill="none" stroke="currentColor"/>' },
      plan: { vb: '0 0 16 16', html: '<path d="M4.9375 5.90295H11.0625" fill="none" stroke="currentColor"/><path d="M4.9375 9.02991H8.27841" fill="none" stroke="currentColor"/><path d="M12.5 1.32617C13.3039 1.32617 14 1.95171 14 2.77637V7.61328L13 8.68164V2.77637C13 2.55186 12.8007 2.32617 12.5 2.32617H3.5C3.1993 2.32617 3 2.55186 3 2.77637V13.2246C3.00044 13.4489 3.19963 13.6738 3.5 13.6738H8.32812L7.39258 14.6738H3.5C2.69637 14.6738 2.00042 14.0489 2 13.2246V2.77637C2 1.95171 2.69613 1.32617 3.5 1.32617H12.5Z" fill="currentColor" stroke="none"/><path d="M8.97212 14.3693C9.17511 14.5723 9.37811 14.7753 9.5811 14.9783C9.67012 14.8953 9.75914 14.8123 9.84815 14.7293C11.4505 13.2352 13.0528 11.7411 14.6551 10.247C14.7441 10.164 14.8331 10.081 14.9221 9.99803C14.5989 9.6748 14.2756 9.35157 13.9524 9.02834C13.8694 9.11736 13.7864 9.20637 13.7034 9.29539C12.2093 10.8977 10.7152 12.5 9.22113 14.1023C9.13813 14.1913 9.05513 14.2803 8.97212 14.3693Z" fill="currentColor" stroke="none"/><path d="M11.6323 13.7841C11.6323 14.0395 11.6323 14.295 11.6323 14.5504C11.6812 14.5523 11.7301 14.5543 11.779 14.5562C12.659 14.5913 13.539 14.6263 14.419 14.6614C14.4679 14.6633 14.5168 14.6653 14.5657 14.6672C14.5657 14.3339 14.5657 14.0006 14.5657 13.6672C14.5168 13.6692 14.4679 13.6711 14.419 13.6731C13.539 13.7081 12.659 13.7432 11.779 13.7783C11.7301 13.7802 11.6812 13.7821 11.6323 13.7841Z" fill="currentColor" stroke="none"/>' },
      feedback: { vb: '0 0 16 16', html: '<path d="M4.74024 9.11029L1.82882 7.79865C1.75022 7.76323 1.75026 7.65161 1.82889 7.61626L12.9665 2.60943C13.0354 2.57846 13.1125 2.63213 13.1073 2.70749L12.3914 13.1388C12.3864 13.2117 12.3073 13.2548 12.2433 13.2194L6.12677 9.83657" fill="none" stroke="currentColor"/><path d="M8.44336 11.0825L6.2832 13.2843C6.22048 13.3482 6.11182 13.3038 6.11182 13.2143V9.86772C6.11182 9.84165 6.122 9.8166 6.1402 9.79793L12.972 2.78748" fill="none" stroke="currentColor"/>' },
      compact: { vb: '0 0 16 16', html: '<path d="M8 14.5C11.5899 14.5 14.5 11.5899 14.5 8C14.5 4.41015 11.5899 1.5 8 1.5C4.41015 1.5 1.5 4.41015 1.5 8C1.5 11.5899 4.41015 14.5 8 14.5Z" fill="none" stroke="currentColor" opacity="0.35"/><path d="M8 1.5C8.85359 1.5 9.69883 1.66813 10.4874 1.99478C11.2761 2.32144 11.9926 2.80022 12.5962 3.40381C13.1998 4.00739 13.6786 4.72394 14.0052 5.51256C14.3319 6.30117 14.5 7.14641 14.5 8" fill="none" stroke="currentColor"/>' },
      permission: { vb: '0 0 16 16', html: '<path d="M6.59624 2.14853C7.50155 1.80917 8.49914 1.80919 9.40444 2.14859L13.9245 3.84317V7.11961C13.9245 11.6089 10.5565 13.5975 8.00035 14.5779C5.44423 13.5975 2.07544 11.6089 2.07544 7.11961V3.84317L6.59624 2.14853Z" fill="none" stroke="currentColor" stroke-linejoin="round"/><path d="M8 4.39209V9.89209" fill="none" stroke="currentColor"/><path d="M8 10.8081V11.8081" fill="none" stroke="currentColor"/>' },
      model: { vb: '0 0 16 16', html: '<path d="M7.8667 0.349609C8.96906 0.349634 10.0601 0.481272 11.0317 0.735352C11.9973 0.987845 12.8453 1.362 13.4644 1.84766C14.0744 2.32629 14.507 2.95539 14.5161 3.69336H14.5171V8.53516C14.0843 8.32076 13.6108 8.17679 13.1108 8.11816C13.1831 7.96848 13.2162 7.82856 13.2163 7.70312V5.76758C12.6269 6.16618 11.8739 6.47995 11.0317 6.7002C10.0602 6.95423 8.96896 7.08494 7.8667 7.08496C6.76461 7.08493 5.67411 6.95415 4.70264 6.7002C3.85994 6.48006 3.10694 6.1662 2.51709 5.76758V7.70312L2.521 7.78418C2.56374 8.19554 2.93361 8.74414 3.91357 9.23145C4.9281 9.73585 6.35004 10.0371 7.8667 10.0371C8.26373 10.0371 8.6543 10.0141 9.03271 9.97461C8.75596 10.3799 8.54664 10.8349 8.42041 11.3232C8.23666 11.3313 8.0518 11.3369 7.8667 11.3369C6.20108 11.3369 4.57025 11.01 3.33447 10.3955C3.04163 10.2499 2.76658 10.0836 2.51709 9.90039V11.6738C2.51728 12.1379 2.88589 12.7556 3.92236 13.292C4.93457 13.8157 6.35342 14.1289 7.8667 14.1289C8.12318 14.1289 8.37694 14.1161 8.62646 14.0986C8.82021 14.5535 9.08999 14.9682 9.41943 15.3271C8.91285 15.3934 8.39149 15.4287 7.8667 15.4287C6.19761 15.4287 4.56379 15.0869 3.32568 14.4463C2.11244 13.8185 1.21649 12.8562 1.21631 11.6738V3.76367C1.21595 3.74853 1.21438 3.733 1.21436 3.71777C1.21436 2.96917 1.65103 2.33053 2.26807 1.84668C2.88747 1.36112 3.73675 0.987685 4.70264 0.735352C5.67413 0.481376 6.76457 0.349636 7.8667 0.349609ZM7.8667 1.65039C6.86269 1.65042 5.88326 1.77028 5.03076 1.99316C4.17183 2.2176 3.50421 2.52956 3.06982 2.87012C2.65043 3.19909 2.52622 3.48898 2.51709 3.69336V3.74414C2.52719 3.94845 2.65185 4.23772 3.06982 4.56543C3.50425 4.90601 4.17172 5.21795 5.03076 5.44238C5.88326 5.66527 6.8627 5.78513 7.8667 5.78516C8.8707 5.78513 9.85015 5.66525 10.7026 5.44238C11.5611 5.21787 12.2286 4.9049 12.6626 4.56445C13.0982 4.22252 13.2163 3.9231 13.2163 3.71777L13.2104 3.63574C13.1818 3.43623 13.044 3.16941 12.6626 2.87012C12.2286 2.52957 11.5614 2.21773 10.7026 1.99316C9.85009 1.77025 8.8708 1.65041 7.8667 1.65039Z" fill="currentColor" stroke="none"/><path d="M12.8936 10.0361L13.2061 10.5566C13.2296 10.5959 13.2651 10.6562 13.3027 10.707C13.3469 10.7666 13.4148 10.8431 13.5195 10.9023C13.6244 10.9617 13.725 10.9801 13.7988 10.9873C13.8619 10.9934 13.9318 10.9932 13.9775 10.9932H14.6162L14.8896 11.4502L14.5947 11.9443C14.5698 11.9859 14.5312 12.0483 14.5029 12.1084C14.4781 12.1611 14.4514 12.2312 14.4395 12.3164L14.4326 12.4072L14.4395 12.4971C14.4514 12.5825 14.4781 12.6532 14.5029 12.7061C14.5312 12.7661 14.5689 12.8287 14.5938 12.8701L14.8896 13.3633L14.6162 13.8213H13.9775C13.9318 13.8213 13.8619 13.821 13.7988 13.8271C13.7433 13.8326 13.6728 13.8442 13.5967 13.875L13.5195 13.9121C13.4148 13.9714 13.3469 14.0478 13.3027 14.1074C13.265 14.1583 13.2296 14.2186 13.2061 14.2578L12.8936 14.7783H12.3115L11.999 14.2578C11.9755 14.2186 11.9401 14.1583 11.9023 14.1074C11.8693 14.0628 11.823 14.0083 11.7578 13.959L11.6855 13.9121L11.6074 13.875C11.5316 13.8445 11.4615 13.8325 11.4062 13.8271C11.3432 13.821 11.2733 13.8213 11.2275 13.8213H10.5889L10.3135 13.3633L10.6104 12.8701C10.6352 12.8287 10.6739 12.7661 10.7021 12.7061C10.7352 12.6357 10.7724 12.534 10.7725 12.4072C10.7724 12.2804 10.7352 12.1788 10.7021 12.1084C10.6739 12.0483 10.6353 11.9859 10.6104 11.9443L10.3135 11.4502L10.5889 10.9932H11.2275C11.2733 10.9932 11.3432 10.9934 11.4062 10.9873C11.4801 10.9801 11.5808 10.9616 11.6855 10.9023C11.7903 10.843 11.8582 10.7666 11.9023 10.707C11.94 10.6562 11.9755 10.5959 11.999 10.5566L12.3115 10.0361H12.8936Z" fill="none" stroke="currentColor"/>' },
      export: { vb: '0 0 16 16', html: '<path d="M8 1.95317V10.0469" fill="none" stroke="currentColor"/><path d="M4.25 6.29688L8 10.0469L11.75 6.29688" fill="none" stroke="currentColor"/><path d="M1.5 10.0469V13.158C1.5 13.3937 1.60536 13.6198 1.79289 13.7865C1.98043 13.9532 2.23478 14.0469 2.5 14.0469H13.5C13.7652 14.0469 14.0196 13.9532 14.2071 13.7865C14.3946 13.6198 14.5 13.3937 14.5 13.158V10.0469" fill="none" stroke="currentColor"/>' },
      skill: { vb: '0 0 17 17', html: '<path d="M4.57788 5.77124H10.7029" fill="none" stroke="currentColor"/><path d="M4.57788 8.89819H7.91879" fill="none" stroke="currentColor"/><path d="M12.1404 1.19446C12.9442 1.19446 13.6404 1.81999 13.6404 2.64465V8.89856H12.6404V2.64465C12.6404 2.42015 12.4411 2.19446 12.1404 2.19446H3.14038C2.83968 2.19446 2.64038 2.42015 2.64038 2.64465V13.0929C2.64082 13.3172 2.84001 13.5421 3.14038 13.5421H8.88159V14.5421H3.14038C2.33675 14.5421 1.6408 13.9172 1.64038 13.0929V2.64465C1.64038 1.81999 2.33651 1.19446 3.14038 1.19446H12.1404Z" fill="currentColor" stroke="none"/><path d="M12.0051 15.1056C12.0051 13.6395 10.8166 12.451 9.35059 12.451C10.8166 12.451 12.0051 11.2626 12.0051 9.79651C12.0051 11.2626 13.1936 12.451 14.6597 12.451C13.1936 12.451 12.0051 13.6395 12.0051 15.1056Z" fill="none" stroke="currentColor"/>' },
      // 编排（orchestrate）：一个节点向右分出两条箭头 —— 与「纯编排模式」的语义对应。
      // 宿主 command descriptor 没有 icon 字段，这里补一个自绘内联图标；尺寸按
      // 24×24 / stroke 1.8（与其它 16×16 / stroke 1.2 图标的视觉粗细一致：
      // 1.8/24 = 1.2/16），圆头圆角，颜色 currentColor 跟随主题。
      orchestrate: { vb: '0 0 24 24', sw: '1.8', html: '<circle cx="4.5" cy="12" r="2.1" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.6 12H10.4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.4 12L15.2 7.2H19.1" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 5.1L19.1 7.2L17 9.3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.4 12L15.2 16.8H19.1" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 14.7L19.1 16.8L17 18.9" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>' },
    };

    // 图标键：文件/模型等本机动作按 name 命中；技能统一用「技能」图标；
    // 没有任何命中时返回空（渲染成空盒子，保持文字对齐，但验收要求 0 个空图标）。
    function iconKeyOf(it) {
      var key = it && typeof it.name === 'string' ? it.name : '';
      if (CMD_ICONS[key]) return key;
      if (it && it.group === '技能') return 'skill';
      return '';
    }

    function iconHtml(it) {
      var key = iconKeyOf(it);
      var icon = key === '' ? undefined : CMD_ICONS[key];
      if (!icon) return '';
      return '<svg class="dm-cmd-icon" viewBox="' + icon.vb + '" fill="none" stroke="currentColor" stroke-width="' + (icon.sw || '1.2') + '" aria-hidden="true">' + icon.html + '</svg>';
    }

    // 一行 = [图标] [/name 中文标签] [右侧说明，单行省略]
    // 与桌面 / 菜单同款：不再放来源徽标、不再放尖括号参数占位（用户明确说没用且乱）。
    // 说明右对齐、约占 46%，完整文本进 title（桌面悬浮/手机长按可见）；技能与命令
    // 用同一套结构，只是分组标题不同。
    function rowOf(it) {
      var row = document.createElement('button');
      row.type = 'button';
      row.className = 'dm-perm-row dm-cmd-row';
      row.setAttribute('data-name', it.name);
      if (it.source) row.setAttribute('data-source', it.source);
      if (it.group) row.setAttribute('data-group', it.group);
      row.setAttribute('data-icon', iconKeyOf(it));
      var icon = iconHtml(it);
      var iconBox = el('span', 'dm-cmd-iconbox');
      if (icon !== '') iconBox.innerHTML = icon;
      row.appendChild(iconBox);
      var left = el('span', 'dm-cmd-left');
      // 命令名也中文化：/目标、/压缩…；技能保持 /英文技能名（宿主标识无法中文化）。
      // 英文命令名放进 title（桌面悬浮可见）且 data-name 仍是英文，映射与测试都不受影响。
      var code = el('span', 'dm-cmd-code', '/' + (it.cmdName || it.name));
      if (it.cmdName && it.cmdName !== it.name) code.title = it.name;
      left.appendChild(code);
      row.appendChild(left);
      if (it.description) {
        var desc = el('span', 'dm-cmd-desc', it.description);
        desc.title = it.description;
        row.appendChild(desc);
      }
      if (it.disabled) {
        row.disabled = true;
        row.classList.add('dm-cmd-row-disabled');
      }
      row.addEventListener('click', function (e) { e.preventDefault(); pick(it, row); });
      return row;
    }

    function paint() {
      if (!panel) return;
      var body = panel.body;
      body.innerHTML = '';
      var q = String(state.filter || '').trim().toLowerCase();
      var groups = [];
      var index = {};
      var shown = 0;
      for (var i = 0; i < state.items.length; i++) {
        var it = state.items[i];
        if (!it || typeof it.name !== 'string' || it.name === '') continue;
        if (q !== '' && haystack(it).indexOf(q) < 0) continue;
        var g = typeof it.group === 'string' && it.group !== '' ? it.group : '其它';
        if (!index[g]) {
          index[g] = { label: g, items: [] };
          groups.push(index[g]);
        }
        index[g].items.push(it);
        shown += 1;
      }
      body.setAttribute('data-dm-cmd-shown', String(shown));
      if (state.items.length === 0) {
        body.appendChild(el('p', 'dm-perm-hint', state.reason || '宿主没有返回任何命令'));
        return;
      }
      if (shown === 0) {
        body.appendChild(el('p', 'dm-perm-hint', '没有匹配「' + q + '」的命令'));
        return;
      }
      for (var gi = 0; gi < groups.length; gi++) {
        body.appendChild(el('div', 'dm-cmd-group', groups[gi].label));
        for (var ri = 0; ri < groups[gi].items.length; ri++) body.appendChild(rowOf(groups[gi].items[ri]));
      }
    }

    function pick(it, row) {
      // 与桌面宿主一致：选中命令 = 把 '/name '（末尾一个空格）插进输入框，不执行、
      // 不发请求。用户补完参数后按发送，bundle 的发送路径会拦下以 / 开头的整行并调
      // mobile.commandExec（bundle @316472：n.startsWith('/') && 无引用 && 无附件
      // → Mr(n)，Mr 就是 mobile.commandExec）。技能同理，只是宿主 pre-step 会再注入
      // skill 正文。这里绝不再自己弹参数框或直接执行。
      if (it.source === 'local') {
        runLocal(it);
        return;
      }
      // 插入中文命令名（/目标 ），与面板显示一致；宿主只认英文，执行前由
      // mobile.commandExec 的 canonicalCommandLine() 映射回 /goal。技能仍是英文名。
      insertLine('/' + (it.cmdName || it.name) + ' ', it.source === 'skill' ? it.name : '');
    }

    // 本机动作：先判断入口在不在，再收起面板，等收起动画（200ms）走完才点 ——
    // 面板是整屏遮罩，立刻点会被它的 pointer-events 吃掉。
    function runLocal(it) {
      var target = null;
      if (it.name === 'file') {
        // 与 composer 的「＋」同一个按钮（bundle: chat-attach-btn aria-label 添加内容）。
        target = document.querySelector('.chat-attach-btn[aria-label="添加内容"]');
      } else if (it.name === 'model') {
        // 与 composer 的模型 pill 同一个入口：优先用本插件已有的模型按钮（它会
        // 直接打开底部「模型与思考强度」抽屉），没有就退回原生 pill。
        target = document.getElementById('dm-model-btn');
        if (!target) target = document.querySelector('.chat-pill[aria-label^="切换模型"]');
      }
      if (!target) {
        setStatus('当前页面没有「' + (it.label || it.name) + '」入口', 'err');
        return;
      }
      setStatus('');
      closePanel();
      window.setTimeout(function () {
        try { target.click(); } catch (e) {}
      }, 220);
      try { document.body.setAttribute('data-dm-cmd-local-last', it.name); } catch (e) {}
    }

    // 把命令插进 composer：不发送、不执行。先插入再收起面板 —— textarea 在遮罩
    // 下面，插入是同步的，用户看到的就是面板收起后输入框里已经有 '/name '。
    function insertLine(line, skillName) {
      if (!panel) return;
      if (!insertComposer(line)) {
        setStatus('当前不在输入框页面，无法插入命令', 'err');
        return;
      }
      // DOM 证据：最后一次插入的整行（只有命令名，不含会话内容）。
      try {
        document.body.setAttribute('data-dm-cmd-last-insert', line.trim());
        if (skillName) document.body.setAttribute('data-dm-cmd-last-skill', skillName);
      } catch (e) {}
      closePanel();
    }

    // 往 composer 落文本：bundle 的 textarea 是受控组件，必须用原生 value setter +
    // input 事件（与本插件「停止→排队发送」清空输入框同一手法）。
    function insertComposer(text) {
      var ta = document.querySelector('textarea.chat-input');
      if (!ta) return false;
      var current = ta.value || '';
      var prefix = current === '' || /\s$/.test(current) ? '' : ' ';
      var next = current + prefix + text;
      try {
        var setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
        setter.call(ta, next);
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      } catch (e) {
        ta.value = next;
        try { ta.dispatchEvent(new Event('input', { bubbles: true })); } catch (e2) {}
      }
      try {
        ta.focus();
        var end = ta.value.length;
        ta.setSelectionRange(end, end);
      } catch (e) {}
      return true;
    }

    function load() {
      if (!panel) return Promise.resolve();
      state.items = [];
      state.reason = '';
      state.skillsReason = '';
      state.hostCount = 0;
      state.skillCount = 0;
      panel.body.innerHTML = '';
      panel.body.appendChild(el('p', 'dm-perm-hint dm-perm-loading', '加载中…'));
      setStatus('');
      var sid = currentSession();
      if (!sid) {
        state.reason = '当前不在会话里，没有可用的命令';
        paint();
        return Promise.resolve();
      }
      // 两个数据源并行取，一次绘制：宿主命令注册表 + 宿主技能目录。
      var commandsReq = rpc('mobile.commands', { sessionId: sid }).catch(function () { return null; });
      var skillsReq = rpc('mobile.skills', { sessionId: sid }).catch(function () { return null; });
      return Promise.all([commandsReq, skillsReq]).then(function (both) {
        if (!panel || !panel.back.classList.contains('dm-perm-open')) return;
        var cmdRes = both[0];
        var skillRes = both[1];
        var hostItems = [];
        var skillItems = [];
        var live = false;
        var cmdOk = !!(cmdRes && cmdRes.ok);
        if (cmdOk) {
          var cv = cmdRes.value || {};
          hostItems = Array.isArray(cv.items) ? cv.items : [];
          state.reason = typeof cv.reason === 'string' ? cv.reason : '';
          live = cv.live === true;
          if (cv.available === false && state.reason === '') state.reason = '宿主命令服务不可用';
        } else {
          state.reason = (cmdRes && cmdRes.error && cmdRes.error.message) ? cmdRes.error.message : '命令列表加载失败';
        }
        var skillOk = !!(skillRes && skillRes.ok);
        if (skillOk) {
          var sv = skillRes.value || {};
          skillItems = Array.isArray(sv.items) ? sv.items : [];
          if (sv.available === false) {
            state.skillsReason = typeof sv.reason === 'string' && sv.reason !== '' ? sv.reason : '宿主技能目录不可用';
          }
        } else {
          state.skillsReason = (skillRes && skillRes.error && skillRes.error.message) ? skillRes.error.message : '技能目录加载失败';
        }
        state.hostCount = hostItems.length;
        state.skillCount = skillItems.length;
        state.items = mergeItems(hostItems, skillItems);
        // DOM 证据：三类来源分别计数，自动化可直接核对
        // 「技能组条数 = mobile.skills 返回条数」「宿主命令 = mobile.commands 条数」。
        try {
          panel.back.setAttribute('data-dm-cmd-count', String(state.items.length));
          document.body.setAttribute('data-dm-cmd-count', String(state.items.length));
          document.body.setAttribute('data-dm-host-count', String(state.hostCount));
          document.body.setAttribute('data-dm-skill-count', String(state.skillCount));
          document.body.setAttribute('data-dm-local-count', String(LOCAL_ACTIONS.length));
          document.body.setAttribute('data-dm-cmd-live', live ? '1' : '0');
        } catch (e) {}
        if (state.skillsReason !== '') {
          setStatus('技能目录不可用：' + state.skillsReason, 'err');
        } else if (!cmdOk) {
          setStatus(state.reason || '宿主命令服务不可用', 'err');
        } else if (!live) {
          setStatus('该会话当前没有活动 Agent：执行命令时会先唤醒它', '');
        }
        paint();
      }).catch(function () {
        if (!panel) return;
        state.items = mergeItems([], []);
        state.hostCount = 0;
        state.skillCount = 0;
        state.reason = '命令列表加载失败，请重试';
        paint();
      });
    }

    function open() {
      if (!panel) build();
      state.filter = '';
      if (panel.search) panel.search.value = '';
      panel.back.classList.add('dm-perm-open');
      panel.back.removeAttribute('data-dm-closing');
      load();
    }

    function isOpen() {
      return !!(panel && panel.back.classList.contains('dm-perm-open'));
    }

    function closePanel() {
      if (!panel) return;
      var back = panel.back;
      if (!back.classList.contains('dm-perm-open')) { setStatus(''); return; }
      if (back.getAttribute('data-dm-closing') === '1') return;
      back.setAttribute('data-dm-closing', '1');
      back.classList.add('dm-closing');
      var sheet = back.querySelector('.dm-cmd-sheet');
      if (sheet) sheet.classList.add('dm-closing');
      window.setTimeout(function () {
        back.classList.remove('dm-perm-open');
        back.classList.remove('dm-closing');
        back.removeAttribute('data-dm-closing');
        if (sheet) sheet.classList.remove('dm-closing');
        setStatus('');
      }, 200);
    }

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (isOpen()) closePanel();
      else open();
    });

    // 只在聊天页显示：判据与权限/子代理按钮一致，外加 #dm-tools 行存在。
    function isChatPage() {
      var slots = document.querySelectorAll('.mobile-headerSlot-right');
      for (var i = 0; i < slots.length; i++) {
        if (slots[i].querySelector('button[aria-label="更多"]')) return true;
      }
      return false;
    }

    function ensure() {
      var row = document.getElementById('dm-tools');
      var tools = document.querySelector('.chat-tools');
      if (!row || !tools || !isChatPage()) {
        if (btn.parentNode) btn.parentNode.removeChild(btn);
        if (isOpen()) closePanel();
        return;
      }
      // 只负责「在不在这一行」：其他按钮各自用 insertBefore 抢自己的锚点，
      // 这里 appendChild 到行尾，不和他们争顺序（否则会互相来回搬）。
      if (btn.parentNode !== row) row.appendChild(btn);
    }

    var pending = false;
    function schedule() {
      if (pending) return;
      pending = true;
      window.setTimeout(function () { pending = false; ensure(); }, 60);
    }
    try {
      if (window.__dmMutationBus) window.__dmMutationBus.subscribe(schedule);
      else {
        var mo = new MutationObserver(schedule);
        mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
      }
    } catch (e) {}
    if (window.__dmEnsureTick) window.__dmEnsureTick.add(ensure, 800, function () { return !!document.querySelector('.chat-composer'); }); else setInterval(ensure, 800);
    ensure();
  } catch (e) {}
})();
</script>`

// ── 工作区页左上角「插件」「自动化」入口 + 两个宿主信息页 ─────────────────────
// 数据来源（全部宿主真实服务，不写死、不造假）：
//   · 插件页   ← ctx.get('pluginManager').listBundles() + listPlugins()
//     @deepseek-ai/dsh-plugin-manager 的公开方法；桌面「插件」页用的就是这两个
//     （ui-plugin-manager client 调 ctx.remote.pluginManager.listBundles/listPlugins）。
//   · 自动化页 ← ctx.get('schedule').catalog()
//     @deepseek-ai/dsh-schedule 的公开方法，返回宿主全部 active/inactive 定时任务；
//     桌面「自动化任务」页同源（ui-schedule client 调 ctx.remote.schedule.catalog()）。
// 服务用 ctx.get 惰性读取，而不是写进静态 inject：这两个服务在没有 profileContext
// 的环境会被禁用，硬 inject 会让整个手机插件加载失败；取不到时 RPC 返回
// service_unavailable，页面显示错误态，绝不补假数据。
//
// 按钮只在「工作区列表页」出现：bundle 里只有该页的顶栏有 aria-label="设置" 齿轮。
// 两个按钮是 header 的直接子节点 + 绝对定位（同 48px / 同 top:50% / 同 .mobile-iconbtn
// 规格），并给 header 加 .dm-header-extras 把首列从 48px 扩到 148px —— 标题会自动在
// 剩余空间重新居中，320/360/390 宽都不会被按钮压住（见 theme.css 同名段落）。
//
// 两个入口图标取自宿主自己的图标定义（web shell 的 IconPluginPinwheelOutlineRegular /
// IconClockOutlineRegular，16×16、stroke 1px 描边风格），path d 原样照搬。
const HOST_PAGES_HTML = `<button id="dm-plugins-btn" class="mobile-iconbtn dm-header-btn" type="button" aria-label="插件" title="插件"><svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" aria-hidden="true"><path d="M7.84457 5.06199C11.6605 4.93876 14.7962 6.14848 14.8484 7.76397C14.8875 8.97461 13.1838 10.0696 10.7215 10.5942"/><path d="M5.12742 8.07731C5.00419 4.26138 6.21391 1.12568 7.8294 1.07351C9.04004 1.03441 10.135 2.73808 10.6596 5.20037"/><path d="M8.02457 10.6802C4.20865 10.8034 1.07294 9.5937 1.02077 7.97821C0.981678 6.76758 2.68535 5.67262 5.14763 5.14798"/><path d="M10.7476 7.89535C10.8708 11.7113 9.66109 14.847 8.0456 14.8991C6.83496 14.9382 5.74 13.2346 5.21536 10.7723"/></svg></button><button id="dm-automation-btn" class="mobile-iconbtn dm-header-btn" type="button" aria-label="自动化" title="自动化"><svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" aria-hidden="true"><path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"/><path d="M8 4.31V8.46L11 10.08"/></svg></button>
<div id="dm-host-pages">
<section id="dm-page-plugins" class="dm-page" hidden aria-label="插件">
<header class="dm-page-header"><button class="dm-page-iconbtn" type="button" aria-label="返回" data-dm-back="plugins"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button><h1 class="dm-page-title">插件</h1><button class="dm-page-iconbtn" type="button" aria-label="刷新插件" data-dm-refresh="plugins"><svg class="dm-page-refresh-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19.49 8.66A8.2 8.2 0 1 1 11.71 3.80"/><path d="M16.31 3.64L11.64 1.56L11.79 6.05Z" fill="currentColor" stroke="currentColor" stroke-width="0.55" stroke-linejoin="round"/></svg></button></header>
<div class="dm-page-body" data-dm-body="plugins"><p class="dm-page-state">加载中…</p></div>
</section>
<section id="dm-page-plugin-detail" class="dm-page dm-page-detail" hidden aria-label="插件详情">
<header class="dm-page-header"><button class="dm-page-iconbtn" type="button" aria-label="返回插件列表" data-dm-back="detail"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button><h1 class="dm-page-title">插件</h1><span class="dm-page-iconbtn dm-page-spacer" aria-hidden="true"></span></header>
<div class="dm-page-body" id="dm-plugin-detail-body"><p class="dm-page-state">加载中…</p></div>
</section>
<section id="dm-page-automations" class="dm-page" hidden aria-label="自动化任务">
<header class="dm-page-header dm-page-header-auto"><button class="dm-page-iconbtn" type="button" aria-label="返回" data-dm-back="automations"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button><h1 class="dm-page-title">自动化任务</h1><button class="dm-page-new" type="button" data-dm-new="1">＋ 新建</button></header>
<div class="dm-page-body" data-dm-body="automations">
<div class="dm-auto-toolbar">
<div class="dm-auto-tabs" role="tablist"><button class="dm-auto-tab" type="button" role="tab" data-dm-tab="all">全部</button><button class="dm-auto-tab" type="button" role="tab" data-dm-tab="active">已开启</button><button class="dm-auto-tab" type="button" role="tab" data-dm-tab="inactive">已结束</button></div>
<div class="dm-auto-search"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/></svg><input type="search" inputmode="search" placeholder="搜索自动化任务" aria-label="搜索自动化任务" data-dm-search="1"></div>
</div>
<div class="dm-auto-list" data-dm-auto-list="1"><p class="dm-page-state">加载中…</p></div>
</div>
</section>
<section id="dm-page-cfg" class="dm-page dm-page-cfg" hidden aria-label="内置插件配置">
<header class="dm-page-header"><button class="dm-page-iconbtn" type="button" aria-label="返回插件列表" data-dm-cfg-back="1"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button><h1 class="dm-page-title" data-dm-cfg-title>内置插件配置</h1><button class="dm-page-iconbtn" type="button" aria-label="重新读取配置" data-dm-cfg-refresh="1"><svg class="dm-page-refresh-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19.49 8.66A8.2 8.2 0 1 1 11.71 3.80"/><path d="M16.31 3.64L11.64 1.56L11.79 6.05Z" fill="currentColor" stroke="currentColor" stroke-width="0.55" stroke-linejoin="round"/></svg></button></header>
<div class="dm-page-body" data-dm-cfg-body><p class="dm-page-state">加载中…</p></div>
</section>
<section id="dm-page-models" class="dm-page dm-page-models" hidden aria-label="模型">
<header class="dm-page-header"><button class="dm-page-iconbtn" type="button" aria-label="返回设置" data-dm-mc-back="1"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button><h1 class="dm-page-title" data-dm-mc-title>模型</h1><button class="dm-page-iconbtn" type="button" aria-label="刷新模型" data-dm-mc-refresh="1"><svg class="dm-page-refresh-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19.49 8.66A8.2 8.2 0 1 1 11.71 3.80"/><path d="M16.31 3.64L11.64 1.56L11.79 6.05Z" fill="currentColor" stroke="currentColor" stroke-width="0.55" stroke-linejoin="round"/></svg></button></header>
<div class="dm-page-body" data-dm-mc-body><p class="dm-page-state">加载中…</p></div>
</section>
</div>
<div class="dm-toast" id="dm-toast" role="status" aria-live="polite" hidden></div>
<script>
(function () {
  'use strict';

  // 页面注册表：kind → 宿主 RPC。标题/方法都只在这里出现一次。
  var PAGES = {
    plugins: { el: 'dm-page-plugins', method: 'mobile.plugins', title: '插件' },
    automations: { el: 'dm-page-automations', method: 'mobile.automations', title: '自动化任务' }
  };
  // 宿主图标 path 原文（16×16 描边；来自 web shell 的 primitives 图标组件）。
  var ICON_PINWHEEL = '<svg class="dm-clock" width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" aria-hidden="true"><path d="M7.84457 5.06199C11.6605 4.93876 14.7962 6.14848 14.8484 7.76397C14.8875 8.97461 13.1838 10.0696 10.7215 10.5942"/><path d="M5.12742 8.07731C5.00419 4.26138 6.21391 1.12568 7.8294 1.07351C9.04004 1.03441 10.135 2.73808 10.6596 5.20037"/><path d="M8.02457 10.6802C4.20865 10.8034 1.07294 9.5937 1.02077 7.97821C0.981678 6.76758 2.68535 5.67262 5.14763 5.14798"/><path d="M10.7476 7.89535C10.8708 11.7113 9.66109 14.847 8.0456 14.8991C6.83496 14.9382 5.74 13.2346 5.21536 10.7723"/></svg>';
  var ICON_CLOCK = '<svg class="dm-clock" width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" aria-hidden="true"><path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"/><path d="M8 4.31V8.46L11 10.08"/></svg>';
  // 内置插件配置四行的图标：宿主 web shell 的 PluginArtwork* 组件（36×36 多色 SVG），
  // 从 asar 的 @deepseek-ai/dsh-client-ui-primitives（打包进 dsh-web-frontend 的
  // index-*.js）提取，path/gradient/fill 原样，仅由 CSS 缩放到列表/详情尺寸。
  //   subagent  = PluginArtworkSubagent  (蓝绿方块渐变)
  //   web-search= PluginArtworkSearch    (彩色放大镜)
  //   agent-loop= PluginArtworkLoop      (紫色循环)
  //   shell     = PluginArtworkTerminal  (蓝色 >_)
  var CONFIG_ART = {
    'subagent': '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="14.9893" y="15.1877" width="12.2365" height="12.2365" rx="2" fill="url(#dsh_plugin_art_CU_0a)" fill-opacity="0.8"></rect><rect x="8.87109" y="9.0697" width="12.2365" height="12.2365" rx="2" fill="url(#dsh_plugin_art_CU_0b)" fill-opacity="0.8"></rect><defs><linearGradient id="dsh_plugin_art_CU_0a" x1="21.1075" y1="15.1877" x2="21.1075" y2="27.4243" gradientUnits="userSpaceOnUse"><stop stop-color="#45E7A4"></stop><stop offset="1" stop-color="#05909D"></stop></linearGradient><linearGradient id="dsh_plugin_art_CU_0b" x1="14.9894" y1="9.0697" x2="14.9894" y2="21.3063" gradientUnits="userSpaceOnUse"><stop stop-color="#69B9FF"></stop><stop offset="1" stop-color="#324DE2"></stop></linearGradient></defs></svg>',
    'web-search': '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M26.5362 26.9865L22.3813 22.8317" stroke="#658EFF" stroke-width="3"></path><g clip-path="url(#dsh_plugin_art_$U_0ring)"><g transform="matrix(0.0119394 -0.00173904 0.00173904 0.0119394 15.7661 16.2159)"><foreignObject x="-958.94" y="-958.94" width="1917.88" height="1917.88"><div style="background:conic-gradient(from 90deg, rgb(65, 225, 172) 0deg, rgb(101, 142, 255) 62.0619deg, rgb(65, 225, 172) 360deg);height:100%;width:100%"></div></foreignObject></g></g><defs><clipPath id="dsh_plugin_art_$U_0ring"><path d="M21.9717 16.2159H19.9717C19.9717 18.5386 18.0888 20.4215 15.7661 20.4215V22.4215V24.4215C20.2979 24.4215 23.9717 20.7478 23.9717 16.2159H21.9717ZM15.7661 22.4215V20.4215C13.4434 20.4215 11.5605 18.5386 11.5605 16.2159H9.56055H7.56055C7.56055 20.7478 11.2343 24.4215 15.7661 24.4215V22.4215ZM9.56055 16.2159H11.5605C11.5605 13.8933 13.4434 12.0104 15.7661 12.0104V10.0104V8.01038C11.2343 8.01038 7.56055 11.6841 7.56055 16.2159H9.56055ZM15.7661 10.0104V12.0104C18.0888 12.0104 19.9717 13.8933 19.9717 16.2159H21.9717H23.9717C23.9717 11.6841 20.2979 8.01038 15.7661 8.01038V10.0104Z"></path></clipPath></defs></svg>',
    'agent-loop': '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.0486 28.4901C12.0858 28.4901 7.25195 23.6562 7.25195 17.6934C13.2148 17.6934 18.0486 22.5272 18.0486 28.4901Z" fill="#A797FC"></path><path d="M18.0486 6.89667C12.0858 6.89667 7.25195 11.7305 7.25195 17.6934C13.2148 17.6934 18.0486 12.8595 18.0486 6.89667Z" fill="url(#dsh_plugin_art_bU_0a)"></path><path d="M18.0485 28.4901C24.0114 28.4901 28.8452 23.6562 28.8452 17.6934C22.8824 17.6934 18.0485 22.5272 18.0485 28.4901Z" fill="#4561EE"></path><path d="M18.0485 6.89667C24.0114 6.89667 28.8452 11.7305 28.8452 17.6934C22.8824 17.6934 18.0485 12.8595 18.0485 6.89667Z" fill="#658EFF"></path><defs><linearGradient id="dsh_plugin_art_bU_0a" x1="16.7911" y1="16.1655" x2="8.98192" y2="8.74289" gradientUnits="userSpaceOnUse"><stop stop-color="#A23AE7"></stop><stop offset="1" stop-color="#E2E2E2"></stop></linearGradient></defs></svg>',
    'shell': '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 11L16.606 17.606C16.6841 17.6841 16.6841 17.8107 16.606 17.8888L10 24.4948" stroke="#679EFE" stroke-width="3.5"></path><path d="M20.1211 24.4946H26.8685" stroke="#679EFE" stroke-width="3.5"></path></svg>'
  };

  var current = null;      // { kind, el } —— 当前打开的信息页（列表层）
  var detailName = null;   // 当前打开的插件详情（bundle name 或 entry:entryId）
  var seq = 0;             // 每次 load 递增，晚到的响应不许覆盖新页面
  var loading = {};
  var pluginsValue = null; // mobile.plugins 最近一次成功的结果（value）
  var autoValue = null;    // mobile.automations 最近一次成功的结果（value）
  var autoTab = 'active';  // 桌面默认选中「已开启」
  var autoQuery = '';
  var toastTimer = null;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function localized(value) {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') return value.zh || value.en || '';
    return '';
  }
  function shortName(name) {
    var text = String(name || '');
    if (text.charAt(0) === '@') {
      var slash = text.indexOf('/');
      if (slash >= 0) return text.slice(slash + 1);
    }
    return text;
  }
  function firstChar(text) {
    var value = String(text || '').trim();
    return value === '' ? '?' : value.slice(0, 1).toUpperCase();
  }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function fmtWhen(iso) {
    if (!iso) return '';
    var date = new Date(iso);
    if (isNaN(date.getTime())) return String(iso);
    return (date.getMonth() + 1) + '-' + pad2(date.getDate()) + ' ' + pad2(date.getHours()) + ':' + pad2(date.getMinutes());
  }
  function duration(seconds) {
    var value = Number(seconds);
    if (!isFinite(value) || value <= 0) return '';
    if (value % 86400 === 0) return (value / 86400) + ' 天';
    if (value % 3600 === 0) return (value / 3600) + ' 小时';
    if (value % 60 === 0) return (value / 60) + ' 分钟';
    return value + ' 秒';
  }
  var WEEK = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  function rpc(method, payload) {
    return fetch('/m/api/' + method, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rpcId: 'dm-host-' + Date.now() + '-' + Math.random().toString(36).slice(2), payload: payload || {} })
    }).then(function (res) {
      return res.json().then(function (json) { return json; }, function () { return null; });
    }).then(function (json) {
      if (!json || !json.result) throw new Error('宿主没有返回 RPC 结果（HTTP 异常或响应为空）');
      return json.result;
    });
  }

  function toast(text) {
    var el = document.getElementById('dm-toast');
    if (!el) return;
    el.textContent = String(text == null ? '' : text);
    el.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 2800);
  }

  function pageBody(kind) {
    return document.querySelector('[data-dm-body="' + kind + '"]');
  }

  // ── 顶栏两个入口：只在工作区列表页（存在设置齿轮）出现 ───────────────────
  function workspaceHeader() {
    var gear = document.querySelector('.mobile-header .mobile-headerSlot-right > button[aria-label="设置"]');
    return gear ? gear.closest('.mobile-header') : null;
  }
  // 按钮模板：两个入口按钮被 append 进 React 管的 .mobile-header 里，
  // 一旦离开工作区页，React 卸载 header 会把它们一起带走。旧实现只判断
  // "parentNode 不是 header 就 append"，按钮已被销毁时 getElementById 返回 null，
  // 于是返回工作区后按钮永久消失（用户反馈：进过别的页面再回来就没了）。
  // 这里在启动时保留 outerHTML 作为模板，缺失时按原样重建（点击是 document 委托，
  // 重建不会丢事件）。
  var btnTemplate = (function () {
    var p = document.getElementById('dm-plugins-btn');
    var a = document.getElementById('dm-automation-btn');
    return p && a ? { html: p.outerHTML + a.outerHTML } : null;
  })();
  function rebuildButtons(header) {
    if (!btnTemplate) return false;
    var wrap = document.createElement("div");
    wrap.innerHTML = btnTemplate.html;
    var p = wrap.querySelector('#dm-plugins-btn');
    var a = wrap.querySelector('#dm-automation-btn');
    if (!p || !a) return false;
    header.appendChild(p);
    header.appendChild(a);
    return true;
  }
  function syncHeader() {
    var header = workspaceHeader();
    var headers = document.querySelectorAll('.mobile-header');
    for (var i = 0; i < headers.length; i++) headers[i].classList.toggle('dm-header-extras', headers[i] === header);
    if (!header) return;
    var plugins = document.getElementById('dm-plugins-btn');
    var automation = document.getElementById('dm-automation-btn');
    if (!plugins || !automation) { rebuildButtons(header); return; }
    if (plugins.parentNode !== header) header.appendChild(plugins);
    if (automation.parentNode !== header) header.appendChild(automation);
  }
  var syncQueued = false;
  function queueSync() {
    if (syncQueued) return;
    syncQueued = true;
    var run = function () { syncQueued = false; try { syncHeader(); } catch (e) {} };
    if (window.requestAnimationFrame) window.requestAnimationFrame(run);
    else window.setTimeout(run, 0);
  }

  // ── 打开 / 关闭信息页（pushState 让安卓返回键也能退）────────────────────
  function openPage(kind) {
    var cfg = PAGES[kind];
    if (!cfg) return;
    var el = document.getElementById(cfg.el);
    if (!el) return;
    if (current && current.kind === kind) { loadPage(kind); return; }
    if (current) closePage(true);
    closeDetail(true);
    current = { kind: kind, el: el };
    el.hidden = false;
    document.documentElement.classList.add('dm-host-page-open');
    try { history.pushState({ dmHostPage: kind }, '', '#/dm-' + kind); } catch (e) {}
    loadPage(kind);
  }
  function closePage(fromPop) {
    if (!current) return;
    var el = current.el;
    current = null;
    el.hidden = true;
    document.documentElement.classList.remove('dm-host-page-open');
    if (!fromPop) { try { history.back(); } catch (e) {} }
  }
  function openDetail(key) {
    var found = detailOf(key);
    if (!found) return;
    detailName = key;
    var el = document.getElementById('dm-page-plugin-detail');
    if (!el) return;
    el.hidden = false;
    document.documentElement.classList.add('dm-host-page-open');
    renderDetail(found);
    try { history.pushState({ dmHostDetail: key }, '', '#/dm-plugin/' + encodeURIComponent(key)); } catch (e) {}
  }
  function closeDetail(fromPop) {
    if (detailName === null) return;
    detailName = null;
    var el = document.getElementById('dm-page-plugin-detail');
    if (el) el.hidden = true;
    if (!fromPop) { try { history.back(); } catch (e) {} }
  }

  window.addEventListener('popstate', function (event) {
    // 从其它页面返回时立刻重建顶栏入口（否则要等 1s 的兜底定时器）。
    queueSync();
    var state = event && event.state;
    if (detailName !== null) {
      if (!state || !state.dmHostDetail) { closeDetail(true); return; }
    }
    if (current && (!state || state.dmHostPage !== current.kind)) closePage(true);
  });

  // ── 插件：数据加载 ──────────────────────────────────────────────────────
  // 刷新反馈：请求在飞时让右上角图标转一圈（只对带 data-dm-refresh 的页生效）。
  // 转的是 <svg> 本身，transform-origin 默认就在它的 20×20 盒子中心。
  function setPageRefreshing(kind, on) {
    var btn = document.querySelector('[data-dm-refresh="' + kind + '"]');
    if (!btn) return;
    if (on) {
      btn.classList.add('dm-spinning');
      btn.setAttribute('aria-busy', 'true');
    } else {
      btn.classList.remove('dm-spinning');
      btn.removeAttribute('aria-busy');
    }
  }
  function loadPage(kind) {
    var cfg = PAGES[kind];
    var body = pageBody(kind);
    if (!cfg || !body) return;
    if (kind === 'plugins') {
      if (pluginsValue) { renderPlugins(); return; }
      body.innerHTML = '<p class="dm-page-state">加载中…</p>';
    } else {
      autoQuery = '';
      autoTab = 'active';
      var search = document.querySelector('[data-dm-search]');
      if (search) search.value = '';
      if (autoValue) { renderAutomations(); return; }
      // 自动化页的 Tab/搜索框是静态节点，不能连容器一起 innerHTML 覆盖；
      // 只把「列表区」置为加载态。
      var autoList = document.querySelector('[data-dm-auto-list]');
      if (autoList) autoList.innerHTML = '<p class="dm-page-state">加载中…</p>';
    }
    var my = ++seq;
    loading[kind] = my;
    setPageRefreshing(kind, true);
    rpc(cfg.method).then(function (result) {
      if (loading[kind] !== my) return;
      setPageRefreshing(kind, false);
      if (!result || result.ok !== true) {
        renderPageError(kind, result && result.error ? result.error : { code: 'unknown', message: '宿主返回了无法识别的结果' });
        return;
      }
      if (kind === 'plugins') { pluginsValue = result.value || {}; renderPlugins(); }
      else { autoValue = result.value || {}; renderAutomations(); }
    }).catch(function (error) {
      if (loading[kind] !== my) return;
      setPageRefreshing(kind, false);
      renderPageError(kind, { code: 'network_error', message: (error && error.message) || String(error) });
    });
  }

  function renderPageError(kind, error) {
    // 自动化页只替换列表区，保留顶部 Tab/搜索框（它们不依赖 RPC 结果）。
    var body = kind === 'automations' ? document.querySelector('[data-dm-auto-list]') : pageBody(kind);
    if (!body) return;
    var code = error && error.code ? String(error.code) : 'unknown';
    var message = error && error.message ? String(error.message) : '未知错误';
    var retry = kind === 'plugins' ? 'plugins' : 'automations';
    body.innerHTML = '<div class="dm-page-state dm-page-error">' +
      '<p class="dm-page-stateTitle">读取失败</p>' +
      '<p class="dm-page-stateText">' + esc(message) + '</p>' +
      '<p class="dm-page-stateCode">' + esc(code) + '</p>' +
      '<button class="dm-page-retry" type="button" data-dm-retry="' + retry + '">重试</button>' +
      '</div>';
  }

  function iconHtml(icon, title, size) {
    var cls = 'dm-card-icon' + (size === 'lg' ? ' dm-card-icon-lg' : '');
    if (typeof icon === 'string' && icon.indexOf('data:image/') === 0) {
      return '<img class="' + cls + '" src="' + esc(icon) + '" alt="" loading="lazy">';
    }
    return '<span class="' + cls + ' dm-card-icon-letter" aria-hidden="true">' + esc(firstChar(title)) + '</span>';
  }
  /** 内置配置页四行：优先用宿主原始彩色图标，没有再退回 meta.icon / 首字母。 */
  function configArtIcon(configPage, icon, title, size) {
    var svg = configPage && CONFIG_ART[configPage] ? CONFIG_ART[configPage] : '';
    if (svg) {
      return '<span class="dm-card-icon dm-card-icon-art' + (size === 'lg' ? ' dm-card-icon-lg' : '') + '" aria-hidden="true">' + svg + '</span>';
    }
    return iconHtml(icon, title, size);
  }

  function switchHtml(checked, attrs, disabled, label) {
    return '<button class="dm-switch" type="button" role="switch" aria-checked="' + (checked ? 'true' : 'false') + '" aria-label="' + esc(label || '启停') + '"' +
      (attrs || '') + (disabled ? ' disabled' : '') + '><span class="dm-switch-knob"></span></button>';
  }

  function sectionHtml(title, countText, rowsHtml) {
    if (!rowsHtml) return '';
    return '<section class="dm-section"><div class="dm-section-head"><span class="dm-section-title">' + esc(title) + '</span><span class="dm-section-count">' + esc(countText) + '</span></div>' + rowsHtml + '</section>';
  }

  // ── 插件：列表（内置插件配置 / 实验性插件 / 已安装插件）─────────────────
  function renderPlugins() {
    var body = pageBody('plugins');
    if (!body) return;
    var value = pluginsValue || {};
    var groups = value.groups || {};
    var basic = Array.isArray(groups.basic) ? groups.basic : [];
    var extensions = Array.isArray(groups.extensions) ? groups.extensions : [];
    var installed = Array.isArray(groups.installed) ? groups.installed : [];
    var total = basic.length + extensions.length + installed.length;
    body.setAttribute('data-dm-count', String(total));
    body.setAttribute('data-dm-counts', JSON.stringify({ basic: basic.length, extensions: extensions.length, installed: installed.length }));
    if (total === 0) {
      body.innerHTML = '<div class="dm-page-state dm-page-empty"><p class="dm-page-stateTitle">宿主没有可展示的插件</p><p class="dm-page-stateText">pluginManager 的真实返回里没有内置配置行、实验性包或已安装包。这里只展示宿主数据，不补示例。</p></div>';
      return;
    }
    var html = '';
    html += sectionHtml('内置插件配置', '共 ' + basic.length + ' 个', basic.map(function (item) {
      // 桌面这四行的标题/说明来自页面自己的文案（子智能体 / 网页搜索 / 终端），
      // 不是 client 包的 meta.title（「…设置」）；宿主已把两者一起下发。
      var title = item.configPage && item.configPageTitle
        ? item.configPageTitle
        : (localized(item.meta && item.meta.title) || shortName(item.moduleName));
      var description = item.configPage && item.configPageDescription
        ? item.configPageDescription
        : localized(item.meta && item.meta.description);
      // 有真实配置页的行（子智能体 / 网页搜索 / 终端）直接进配置页；
      // 其余行仍走原来的 entry 详情（宿主没给可写命名空间时就只能只读展示）。
      var openAttr = item.configPage
        ? 'data-dm-cfg-open="' + esc(item.configPage) + '"'
        : 'data-open-entry="' + esc(item.entryId) + '"';
      var badge = item.configPage ? '<span class="dm-badge-config">可配置</span>' : '';
      return '<div class="dm-card" ' + openAttr + ' role="button" tabindex="0">' +
        configArtIcon(item.configPage, item.meta && item.meta.icon, title) +
        '<div class="dm-card-main"><div class="dm-card-titleRow"><span class="dm-card-title">' + esc(title) + '</span>' + badge + '</div>' +
        (description ? '<div class="dm-card-desc">' + esc(description) + '</div>' : '') +
        '<div class="dm-card-sub">' + esc(item.moduleName) + '</div></div>' +
        '<span class="dm-chevron" aria-hidden="true">›</span></div>';
    }).join(''));
    html += sectionHtml('实验性插件', '共 ' + extensions.length + ' 个', extensions.map(function (bundle) {
      return bundleRowHtml(bundle, true);
    }).join(''));
    html += sectionHtml('已安装插件', '共 ' + installed.length + ' 个', installed.map(function (bundle) {
      return bundleRowHtml(bundle, false);
    }).join(''));
    body.innerHTML = html;
  }

  function bundleRowHtml(bundle, experimental) {
    var title = localized(bundle.meta && bundle.meta.title) || shortName(bundle.name);
    var description = bundle.description || localized(bundle.meta && bundle.meta.description);
    var protectedMobile = bundle.name === 'dsh-mobile';
    var badge = experimental ? '<span class="dm-badge dm-badge-beta">实验性</span>' : '';
    var side = switchHtml(bundle.enabled, ' data-toggle-bundle="' + esc(bundle.name) + '"', protectedMobile, '启停 ' + title);
    if (protectedMobile) side += '<span class="dm-card-note">手机端插件，请在桌面端停用</span>';
    var meta = [];
    if (bundle.version) meta.push('v' + bundle.version);
    if (bundle.pluginCount) meta.push(bundle.pluginCount + ' 个组件');
    return '<div class="dm-card" data-open-bundle="' + esc(bundle.name) + '" role="button" tabindex="0">' +
      iconHtml(bundle.meta && bundle.meta.icon, title) +
      '<div class="dm-card-main"><div class="dm-card-titleRow"><span class="dm-card-title">' + esc(title) + '</span>' + badge + '</div>' +
      (description ? '<div class="dm-card-desc">' + esc(description) + '</div>' : '') +
      (meta.length ? '<div class="dm-card-sub">' + esc(meta.join(' · ')) + '</div>' : '') +
      '</div><div class="dm-card-side">' + side + '</div></div>';
  }

  // ── 插件：详情（bundle 详情 / 内置插件 entry 详情）──────────────────────
  function detailOf(key) {
    if (!pluginsValue || !pluginsValue.groups) return null;
    var groups = pluginsValue.groups;
    var lists = ['basic', 'extensions', 'installed'];
    if (key.indexOf('entry:') === 0) {
      var entryId = key.slice('entry:'.length);
      var basic = groups.basic || [];
      for (var i = 0; i < basic.length; i++) if (basic[i].entryId === entryId) return { type: 'entry', item: basic[i] };
      return null;
    }
    for (var j = 0; j < lists.length; j++) {
      var list = groups[lists[j]] || [];
      for (var k = 0; k < list.length; k++) if (list[k].name === key) return { type: 'bundle', bundle: list[k], experimental: lists[j] === 'extensions' };
    }
    return null;
  }

  function renderDetail(found) {
    var body = document.getElementById('dm-plugin-detail-body');
    if (!body) return;
    if (found.type === 'entry') renderEntryDetail(body, found.item);
    else renderBundleDetail(body, found.bundle, found.experimental);
  }

  function renderEntryDetail(body, item) {
    var title = item.configPage && item.configPageTitle
      ? item.configPageTitle
      : (localized(item.meta && item.meta.title) || shortName(item.moduleName));
    var description = localized(item.meta && item.meta.description);
    var running = item.enabled === true;
    var readOnly = typeof item.readOnlyReason === 'string' && item.readOnlyReason !== '';
    var toggle = switchHtml(running, ' data-toggle-entry="' + esc(item.entryId) + '"', readOnly, '启停 ' + title);
    var html = '<div class="dm-detail-hero">' + configArtIcon(item.configPage, item.meta && item.meta.icon, title, 'lg') +
      '<div class="dm-detail-head"><div class="dm-card-titleRow"><span class="dm-detail-title">' + esc(title) + '</span>' +
      '<span class="dm-badge ' + (running ? 'dm-badge-on' : 'dm-badge-off') + '">' + (running ? '运行中' : '已停用') + '</span></div>' +
      '<div class="dm-card-sub">' + esc(item.moduleName) + '</div></div>' +
      '<div class="dm-card-side">' + toggle + '</div></div>';
    if (description) html += '<p class="dm-detail-desc">' + esc(description) + '</p>';
    if (item.configPage) {
      // 有真实配置页：详情里也给一个入口按钮（点行同样直达）。
      html += '<button class="dm-detail-primary" type="button" data-dm-cfg-open="' + esc(item.configPage) + '">打开配置</button>' +
        '<div class="dm-detail-note">字段与桌面端同名页面一致：值读宿主 settings，保存写 profile 的 cordis.patch.yml 并走正常 Loader 应用。</div>';
    } else {
      html += '<div class="dm-detail-note">这是内置插件的桌面端配置入口。手机端只读展示，配置请在桌面端修改。</div>';
    }
    html += '<section class="dm-section"><div class="dm-section-head"><span class="dm-section-title">来源信息</span></div>' +
      '<dl class="dm-detail-dl"><dt>entry id</dt><dd>' + esc(item.entryId) + '</dd><dt>包名</dt><dd>' + esc(item.moduleName) + '</dd><dt>运行状态</dt><dd>' + esc(running ? '运行中' : '已停用') + '</dd>' +
      (readOnly ? '<dt>只读原因</dt><dd>' + esc(item.readOnlyReason) + '</dd>' : '') + '</dl></section>';
    body.innerHTML = html;
  }

  function renderBundleDetail(body, bundle, experimental) {
    var title = localized(bundle.meta && bundle.meta.title) || shortName(bundle.name);
    var description = bundle.description || localized(bundle.meta && bundle.meta.description);
    var protectedMobile = bundle.name === 'dsh-mobile';
    var rows = Array.isArray(bundle.rows) ? bundle.rows : [];
    var runningRows = rows.filter(function (row) { return row.enabled === true; }).length;
    var badges = '';
    if (bundle.version) badges += '<span class="dm-badge dm-badge-version">v' + esc(bundle.version) + '</span>';
    if (experimental || bundle.official) badges += '<span class="dm-badge dm-badge-beta">实验性</span>';
    var toggle = switchHtml(bundle.enabled, ' data-toggle-bundle="' + esc(bundle.name) + '"', protectedMobile, '启停 ' + title);
    var html = '<div class="dm-detail-hero">' + iconHtml(bundle.meta && bundle.meta.icon, title, 'lg') +
      '<div class="dm-detail-head"><div class="dm-card-titleRow"><span class="dm-detail-title">' + esc(title) + '</span>' + badges + '</div>' +
      '<div class="dm-card-sub">' + esc(bundle.name) + '</div></div>' +
      '<div class="dm-card-side">' + toggle + '</div></div>';
    if (protectedMobile) html += '<div class="dm-detail-note">手机端插件：这里不能关闭，请在桌面端停用。</div>';
    // 可卸载的包：只做占位。removeBundle 不可逆（且 dsh-mobile 自己也被管理），
    // 本期不实现卸载，点击/悬浮都提示去桌面端。
    if (bundle.removable && bundle.installed) {
      html += '<div class="dm-detail-actions"><button class="dm-danger-btn" type="button" data-dm-uninstall="' + esc(bundle.name) + '" title="请在桌面端卸载" aria-disabled="true">卸载</button><span class="dm-detail-actions-note">卸载是不可逆操作，请在桌面端进行</span></div>';
    }
    if (description) html += '<p class="dm-detail-desc">' + esc(description) + '</p>';
    if (rows.length > 0) {
      html += '<section class="dm-section"><div class="dm-section-head"><span class="dm-section-title">包含的组件</span><span class="dm-section-count">共 ' + rows.length + ' 个 · ' + runningRows + ' 运行中</span></div>' +
        rows.map(function (row) { return componentRowHtml(row); }).join('') + '</section>';
    }
    var sourceLabel = bundle.source
      ? bundle.source
      : (bundle.availability === 'installation' ? '内置（DSH 安装包）' : bundle.availability === 'profile' ? 'profile 包' : String(bundle.availability || '未知'));
    html += '<section class="dm-section"><div class="dm-section-head"><span class="dm-section-title">来源信息</span></div>' +
      '<dl class="dm-detail-dl"><dt>代码来源</dt><dd>' + esc(sourceLabel) + '</dd><dt>当前版本</dt><dd>' + esc(bundle.version ? 'v' + bundle.version : '未知') + '</dd></dl></section>';
    body.innerHTML = html;
  }

  function componentRowHtml(row) {
    var title = localized(row.meta && row.meta.title) || shortName(row.moduleName);
    var description = localized(row.meta && row.meta.description);
    var stateText = row.enabled ? '运行中' : (row.hasLiveEntry ? '已停用' : '未加载');
    var attrs = row.hasLiveEntry && row.entryId ? ' data-toggle-entry="' + esc(row.entryId) + '"' : '';
    var toggle = row.hasLiveEntry && row.entryId
      ? switchHtml(row.enabled, attrs, false, '启停 ' + title)
      : '<span class="dm-badge dm-badge-off">未加载</span>';
    return '<div class="dm-card dm-card-component">' + iconHtml(row.meta && row.meta.icon, title) +
      '<div class="dm-card-main"><div class="dm-card-titleRow"><span class="dm-card-title">' + esc(title) + '</span>' +
      '<span class="dm-dot ' + (row.enabled ? 'is-on' : 'is-off') + '"></span><span class="dm-dot-text">' + esc(stateText) + '</span></div>' +
      (description ? '<div class="dm-card-desc">' + esc(description) + '</div>' : '') +
      '<div class="dm-card-sub">' + esc((row.entryId || row.rowId) + ' · ' + row.moduleName) + '</div></div>' +
      '<div class="dm-card-side">' + toggle + '</div></div>';
  }

  // ── 自动化：列表 / Tab / 搜索 ───────────────────────────────────────────
  function triggerText(record) {
    var kind = String(record.kind || '');
    if (kind === 'at') return '一次性';
    if (kind === 'after') return '一次性 · 延时 ' + (duration(record.afterSeconds) || '') + '后';
    if (kind === 'every') return '每 ' + duration(record.everySeconds);
    if (kind === 'daily') return '每天 ' + String(record.time || '') + (record.timeZone ? ' · ' + record.timeZone : '');
    if (kind === 'weekly') {
      var days = [];
      if (Array.isArray(record.weekdays)) for (var i = 0; i < record.weekdays.length; i++) days.push(WEEK[Number(record.weekdays[i]) - 1] || ('第' + record.weekdays[i] + '天'));
      return '每周 ' + days.join('、') + ' ' + String(record.time || '') + (record.timeZone ? ' · ' + record.timeZone : '');
    }
    if (kind === 'cron') return 'cron ' + String(record.expression || '') + (record.timeZone ? ' · ' + record.timeZone : '');
    return kind ? ('未知触发（' + kind + '）') : '未知触发';
  }

  function automationRows() {
    var value = autoValue || {};
    var items = Array.isArray(value.items) ? value.items : [];
    var query = autoQuery.trim().toLowerCase();
    return items.filter(function (item) {
      if (autoTab === 'active' && item.status !== 'active') return false;
      if (autoTab === 'inactive' && item.status !== 'inactive') return false;
      if (query === '') return true;
      var haystack = (String(item.title || '') + '\\n' + String(item.prompt || '')).toLowerCase();
      return haystack.indexOf(query) >= 0;
    });
  }

  function renderAutomations() {
    var body = pageBody('automations');
    if (!body) return;
    var value = autoValue || {};
    var counts = value.counts || {};
    var visible = automationRows();
    body.setAttribute('data-dm-count', String(visible.length));
    body.setAttribute('data-dm-total', String(Array.isArray(value.items) ? value.items.length : 0));
    var tabs = document.querySelectorAll('[data-dm-tab]');
    for (var i = 0; i < tabs.length; i++) {
      var selected = tabs[i].getAttribute('data-dm-tab') === autoTab;
      tabs[i].classList.toggle('is-active', selected);
      tabs[i].setAttribute('aria-selected', selected ? 'true' : 'false');
    }
    var list = document.querySelector('[data-dm-auto-list]');
    if (!list) return;
    if (visible.length === 0) {
      list.innerHTML = '<div class="dm-page-state dm-page-empty dm-auto-empty">' +
        '<div class="dm-empty-clock" aria-hidden="true">' + ICON_CLOCK.replace('width="20" height="20"', 'width="34" height="34"') + '</div>' +
        '<p class="dm-page-stateTitle">还没有自动化任务，在会话中创建的任务会显示在这里</p>' +
        '<button class="dm-page-retry" type="button" data-dm-new="1">新建自动化任务</button></div>';
      return;
    }
    var html = '<div class="dm-auto-summary">共 ' + visible.length + ' 条' + (autoTab === 'active' ? '进行中' : autoTab === 'inactive' ? '已结束' : '') +
      (typeof counts.total === 'number' ? ' · 宿主共 ' + counts.total + ' 条' : '') + '</div>';
    for (var j = 0; j < visible.length; j++) {
      var item = visible[j];
      var title = String(item.title || '').trim() || String(item.prompt || '').trim().slice(0, 40) || '(未命名任务)';
      var when = fmtWhen(item.scheduledAt);
      var meta = [triggerText(item)];
      if (when) meta.push(item.status === 'active' ? '下次运行 ' + when : '原定 ' + when);
      if (item.lastDelivery && item.lastDelivery.deliveredAt) meta.push('上次投递 ' + fmtWhen(item.lastDelivery.deliveredAt));
      html += '<div class="dm-auto-row" data-dm-row="automation">' +
        '<span class="dm-auto-icon" aria-hidden="true">' + ICON_CLOCK + '</span>' +
        '<div class="dm-auto-main"><div class="dm-auto-title">' + esc(title) + '</div>' +
        '<div class="dm-auto-meta">' + esc(meta.join(' · ')) + '</div>' +
        (item.prompt && item.prompt !== title ? '<div class="dm-auto-prompt">' + esc(item.prompt) + '</div>' : '') +
        '</div>' +
        '<span class="dm-badge ' + (item.status === 'active' ? 'dm-badge-on' : 'dm-badge-off') + '">' + (item.status === 'active' ? '已开启' : '已结束') + '</span>' +
        '</div>';
    }
    list.innerHTML = html;
  }

  // ── 事件：入口 / 返回 / 刷新 / 重试 / Tab / 搜索 / 开关 ──────────────────
  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || !target.closest) return;
    var opener = target.closest('#dm-plugins-btn, #dm-automation-btn');
    if (opener) {
      event.preventDefault();
      openPage(opener.id === 'dm-plugins-btn' ? 'plugins' : 'automations');
      return;
    }
    var back = target.closest('[data-dm-back]');
    if (back) {
      event.preventDefault();
      var which = back.getAttribute('data-dm-back');
      if (which === 'detail') closeDetail(false);
      else closePage(false);
      return;
    }
    var refresh = target.closest('[data-dm-refresh]');
    if (refresh) {
      event.preventDefault();
      if (refresh.getAttribute('data-dm-refresh') === 'plugins') { pluginsValue = null; }
      loadPage(refresh.getAttribute('data-dm-refresh'));
      return;
    }
    var retry = target.closest('[data-dm-retry]');
    if (retry) {
      event.preventDefault();
      var kind = retry.getAttribute('data-dm-retry');
      if (kind === 'plugins') pluginsValue = null; else autoValue = null;
      loadPage(kind);
      return;
    }
    if (target.closest('[data-dm-uninstall]')) {
      event.preventDefault();
      toast('请在桌面端卸载');
      return;
    }
    if (target.closest('[data-dm-new]')) {
      event.preventDefault();
      toast('请在桌面端或会话中创建自动化任务');
      return;
    }
    var tab = target.closest('[data-dm-tab]');
    if (tab) {
      event.preventDefault();
      autoTab = tab.getAttribute('data-dm-tab');
      renderAutomations();
      return;
    }
    var toggleBundle = target.closest('[data-toggle-bundle]');
    if (toggleBundle) {
      event.preventDefault();
      event.stopPropagation();
      toggleBundleState(toggleBundle, toggleBundle.getAttribute('data-toggle-bundle'));
      return;
    }
    var toggleEntry = target.closest('[data-toggle-entry]');
    if (toggleEntry) {
      event.preventDefault();
      event.stopPropagation();
      toggleEntryState(toggleEntry, toggleEntry.getAttribute('data-toggle-entry'));
      return;
    }
    var openBundle = target.closest('[data-open-bundle]');
    if (openBundle) {
      event.preventDefault();
      openDetail(openBundle.getAttribute('data-open-bundle'));
      return;
    }
    var openEntry = target.closest('[data-open-entry]');
    if (openEntry) {
      event.preventDefault();
      openDetail('entry:' + openEntry.getAttribute('data-open-entry'));
    }
  });

  document.addEventListener('input', function (event) {
    var target = event.target;
    if (!target || !target.getAttribute) return;
    if (target.getAttribute('data-dm-search') === '1') {
      autoQuery = target.value || '';
      renderAutomations();
    }
  });

  // 开关：乐观更新 → 真正调宿主 → 失败回滚并提示；成功静默刷新缓存。
  function setSwitch(button, checked) {
    button.setAttribute('aria-checked', checked ? 'true' : 'false');
  }
  /** 从最近一次 mobile.plugins 结果里读某个 bundle 的真实 enabled。 */
  function bundleEnabledNow(name) {
    var groups = (pluginsValue && pluginsValue.groups) || {};
    var lists = ['basic', 'extensions', 'installed'];
    for (var i = 0; i < lists.length; i++) {
      var list = groups[lists[i]] || [];
      for (var j = 0; j < list.length; j++) if (list[j].name === name) return list[j].enabled === true;
    }
    return null;
  }
  function entryEnabledNow(entryId) {
    var groups = (pluginsValue && pluginsValue.groups) || {};
    var basic = groups.basic || [];
    for (var i = 0; i < basic.length; i++) if (basic[i].entryId === entryId) return basic[i].enabled === true;
    var lists = ['extensions', 'installed'];
    for (var k = 0; k < lists.length; k++) {
      var rows = (groups[lists[k]] || []).reduce(function (all, bundle) { return all.concat(bundle.rows || []); }, []);
      for (var r = 0; r < rows.length; r++) if (rows[r].entryId === entryId) return rows[r].enabled === true;
    }
    return null;
  }
  /** 连接断开后的对账：重取插件数据，若已达成目标就刷新视图，否则回滚。 */
  function reconcileToggle(button, before, next, kind, key) {
    var attempts = 0;
    var done = false;
    function retry() {
      attempts++;
      rpc('mobile.plugins').then(function (result) {
        if (done) return;
        if (!result || result.ok !== true) throw new Error('rpc');
        pluginsValue = result.value || {};
        var actual = kind === 'bundle' ? bundleEnabledNow(key) : entryEnabledNow(key);
        if (actual === next) {
          done = true;
          if (current && current.kind === 'plugins') renderPlugins();
          if (detailName !== null) {
            var found = detailOf(detailName);
            if (found) renderDetail(found);
          }
          toast('已保存并生效');
          return;
        }
        if (attempts < 5) { setTimeout(retry, 1200); return; }
        done = true;
        setSwitch(button, before);
        toast('启停失败：宿主状态未变化');
      }).catch(function () {
        if (done) return;
        if (attempts < 5) { setTimeout(retry, 1200); return; }
        done = true;
        setSwitch(button, before);
        toast('启停失败：连接中断');
      });
    }
    setTimeout(retry, 900);
  }

  function toggleBundleState(button, name) {
    if (button.disabled) return;
    var before = button.getAttribute('aria-checked') === 'true';
    var next = !before;
    setSwitch(button, next);
    button.disabled = true;
    rpc('mobile.pluginBundleEnabled', { name: name, enabled: next }).then(function (result) {
      if (!result || result.ok !== true) throw result && result.error ? result.error : new Error('宿主没有返回结果');
      var application = result.value && result.value.application;
      if (application === 'restart-required') toast('已保存，重启 DSH 后生效');
      else if (application === 'overridden') toast('已保存，但被更高优先级配置覆盖');
      refreshPluginsSilently();
    }).catch(function () {
      // 启停会触发 HMR：宿主 reconcile 期间本插件的 HTTP server 可能被重建，
      // 于是这次请求的连接会断（fetch 报 network error），但宿主其实已经生效。
      // 所以失败后不立刻回滚，而是重取真实状态：与目标一致就算成功。
      reconcileToggle(button, before, next, 'bundle', name);
    }).then(function () { button.disabled = false; });
  }
  function toggleEntryState(button, entryId) {
    if (button.disabled) return;
    var before = button.getAttribute('aria-checked') === 'true';
    var next = !before;
    setSwitch(button, next);
    button.disabled = true;
    rpc('mobile.pluginEntryEnabled', { entryId: entryId, enabled: next }).then(function (result) {
      if (!result || result.ok !== true) throw result && result.error ? result.error : new Error('宿主没有返回结果');
      var application = result.value && result.value.application;
      if (application === 'restart-required') toast('已保存，重启 DSH 后生效');
      refreshPluginsSilently();
    }).catch(function () {
      reconcileToggle(button, before, next, 'entry', entryId);
    }).then(function () { button.disabled = false; });
  }

  // 静默重取：不闪 loading，只更新缓存并按当前视图重渲染（保留详情页）。
  function refreshPluginsSilently() {
    rpc('mobile.plugins').then(function (result) {
      if (!result || result.ok !== true) return;
      pluginsValue = result.value || {};
      if (current && current.kind === 'plugins') renderPlugins();
      if (detailName !== null) {
        var found = detailOf(detailName);
        if (found) renderDetail(found);
      }
    }).catch(function () {});
  }

  // 刷新后如果地址栏还残留 #/dm-*，先清掉，避免和 SPA 的空白 hash 状态混淆。
  if (location.hash.indexOf('#/dm-') === 0) {
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
  }

  // 工作区 ⇄ 会话切换时 header 会重渲染：MutationObserver + 1s 兜底轮询双保险。
  try {
    var mo = new MutationObserver(queueSync);
    mo.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
  setInterval(function () { try { syncHeader(); } catch (e) {} }, 1000);
  queueSync();
})();
</script>`

// ── 内置插件配置页（插件 → 子智能体 / 网页搜索 / 终端）────────────────────
// 桌面这三页在宿主侧只用三个服务：@deepseek-ai/dsh-settings（describe/mutate，
// 内部走 configEditor.edit() → 正常 Loader 应用）、@deepseek-ai/dsh-credentials
// （API Key 只写不读明文）、@deepseek-ai/dsh-llm（模型候选）。
// 这里的脚本只做「渲染 / 暂存 / 提交 / 按宿主回读重绘」：
//   · 初始值、默认值、override 状态全部来自 /m/api/mobile.builtinConfig.get；
//   · 保存失败时用宿主回传的最新状态整页重绘（= 回滚），并显示宿主原文；
//   · API Key 只有一个密码输入框，永远不回填、不显示明文，只显示已配置/未配置。
const BUILTIN_CONFIG_HTML = `<script>
(function () {
  'use strict';

  // ── 内置插件配置页（子智能体 / 网页搜索 / 终端）────────────────────────────
  // 数据全部来自宿主：/m/api/mobile.builtinConfig.* 三个方法内部读
  // @deepseek-ai/dsh-settings 的 describe()（已脱敏）+ credentials.describe()。
  // 本脚本只做「渲染 / 暂存 / 提交 / 按宿主回读重绘」，不缓存任何默认值；
  // 保存失败时用宿主返回的最新状态整页重绘（= 回滚），并显示宿主原文。
  var PAGE_EL = document.getElementById('dm-page-cfg');
  if (!PAGE_EL) return;
  var BODY_EL = PAGE_EL.querySelector('[data-dm-cfg-body]');
  var TITLE_EL = PAGE_EL.querySelector('[data-dm-cfg-title]');

  var SAVE_IDLE = '保存';
  var SAVE_BUSY = '保存中…';
  var MODEL_HINT = '至少选择一个模型。已保存但当前不可用的模型仍会保留，也可以移除。';

  var openKey = null;      // 当前打开的配置页 key
  var payload = null;      // 宿主导出的页面数据（唯一真值来源）
  var stagedMode = null;   // 网页搜索：暂存的开关位置 'api' | 'messages'
  var stagedFields = {};   // ns|key -> 输入框文本（开关切走的那一组也不丢草稿）
  var stagedModels = null; // 模型 key -> true
  var stagedEnabled = null;// 模型选择开关的暂存值
  var resetFields = {};    // ns|key -> true（点了「恢复默认」，保存时发 unset）
  var saving = false;
  var status = null;       // { kind: 'ok' | 'err' | 'info', text }
  var loadNonce = 0;

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function rpc(method, body) {
    return fetch('/m/api/' + method, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rpcId: 'dm-cfg-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        payload: body || {}
      })
    }).then(function (res) {
      return res.json().catch(function () { return null; });
    }).then(function (json) {
      if (!json || !json.result) throw new Error('宿主没有返回 RPC 结果（连接可能因插件重载中断）');
      return json.result;
    });
  }

  function dataKey(ns, key) { return String(ns) + '|' + String(key); }
  function modelKey(route) { return String(route.provider) + '|' + String(route.model); }

  function sectionOf(ns) {
    if (!payload || !Array.isArray(payload.sections)) return null;
    for (var i = 0; i < payload.sections.length; i++) {
      if (payload.sections[i].ns === ns) return payload.sections[i];
    }
    return null;
  }

  function fieldOf(ns, key) {
    var section = sectionOf(ns);
    if (!section || !Array.isArray(section.fields)) return null;
    for (var i = 0; i < section.fields.length; i++) {
      if (section.fields[i].key === key) return section.fields[i];
    }
    return null;
  }

  function defaultText(field) {
    if (!field) return '';
    var value = field.value;
    if (value === null || value === undefined) return '';
    return String(value);
  }

  function inputText(ns, key) {
    var keyText = dataKey(ns, key);
    if (Object.prototype.hasOwnProperty.call(stagedFields, keyText)) return stagedFields[keyText];
    return defaultText(fieldOf(ns, key));
  }

  function overlayFields() {
    var inputs = BODY_EL.querySelectorAll('[data-dm-cfg-input]');
    for (var i = 0; i < inputs.length; i++) {
      stagedFields[inputs[i].getAttribute('data-dm-cfg-input')] = inputs[i].value;
    }
  }

  // ── 类型解析（宿主端 builtinCoerce 是最终裁决；这里只做即时提示）──────────
  function parseField(field, text) {
    if (!field) return { kind: 'skip' };
    var trimmed = String(text == null ? '' : text).trim();
    if (field.kind === 'int') {
      if (trimmed === '') return { kind: 'unset' };
      if (!/^-?(0|[1-9][0-9]*)$/.test(trimmed)) return { kind: 'invalid', message: field.invalid || '请输入整数。' };
      var num = Number(trimmed);
      if (!isFinite(num) || Math.floor(num) !== num) return { kind: 'invalid', message: field.invalid || '请输入整数。' };
      if (typeof field.min === 'number' && num < field.min) return { kind: 'invalid', message: field.invalid || ('不能小于 ' + field.min + '。') };
      if (typeof field.max === 'number' && num > field.max) return { kind: 'invalid', message: field.invalid || ('不能大于 ' + field.max + '。') };
      return { kind: 'set', value: num };
    }
    if (field.kind === 'text') {
      if (trimmed === '') return { kind: 'unset' };
      return { kind: 'set', value: String(text) };
    }
    return { kind: 'skip' };
  }

  function sameValue(left, right) {
    return JSON.stringify(left === undefined ? null : left) === JSON.stringify(right === undefined ? null : right);
  }

  // ── 渲染 ────────────────────────────────────────────────────────────────
  function renderState(text, cls) {
    BODY_EL.innerHTML = '<div class="dm-page-state ' + (cls || '') + '">' +
      '<p class="dm-page-stateText">' + esc(text) + '</p>' +
      '<button class="dm-page-retry" type="button" data-dm-cfg-retry="1">重试</button>' +
      '</div>';
  }

  function overrideBadge(field, keyText) {
    if (!field || !field.overridden) return '';
    return '<span class="dm-cfg-badge">已覆盖</span>' +
      '<button class="dm-cfg-reset" type="button" data-dm-cfg-reset="' + esc(keyText) + '">恢复默认</button>';
  }

  function fieldHtml(section, field) {
    var keyText = dataKey(section.ns, field.key);
    var id = 'dm-cfg-' + String(section.ns).replace(/[^a-zA-Z0-9_-]/g, '-') + '-' + String(field.key).replace(/[^a-zA-Z0-9_-]/g, '-');
    var text = inputText(section.ns, field.key);
    var reset = resetFields[keyText] === true;
    return '<div class="dm-cfg-field" data-dm-cfg-field="' + esc(keyText) + '">' +
      '<div class="dm-cfg-labelRow">' +
        '<label class="dm-cfg-label" for="' + esc(id) + '">' + esc(field.label) + '</label>' +
        overrideBadge(field, keyText) +
      '</div>' +
      '<input id="' + esc(id) + '" class="dm-cfg-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false"' +
        ' inputmode="' + (field.kind === 'int' ? 'numeric' : 'text') + '"' +
        ' value="' + esc(text) + '" data-dm-cfg-input="' + esc(keyText) + '">' +
      (field.hint ? '<p class="dm-cfg-hint">' + esc(field.hint) + '</p>' : '') +
      (reset ? '<p class="dm-cfg-hint dm-cfg-resetHint">保存后该字段回到继承的默认值（删除 override）。</p>' : '') +
      '<p class="dm-cfg-invalid" hidden></p>' +
      '</div>';
  }

  function switchHtml() {
    var info = payload.webSearch && payload.webSearch.switch;
    if (!info) return '';
    var on = stagedMode === 'api';
    return '<div class="dm-cfg-field dm-cfg-switchRow">' +
      '<div class="dm-cfg-labelRow">' +
        '<span class="dm-cfg-label">' + esc(info.label) + '</span>' +
        (info.overridden ? '<span class="dm-cfg-badge">已覆盖</span>' : '') +
        '<label class="dm-cfg-toggle"><input type="checkbox" data-dm-cfg-switch="1"' + (on ? ' checked' : '') + '>' +
          '<span class="dm-cfg-track" aria-hidden="true"></span></label>' +
      '</div>' +
      '<p class="dm-cfg-hint">' + esc(info.hint) +
        (info.link ? ' <a class="dm-cfg-link" href="' + esc(info.link) + '" target="_blank" rel="noopener noreferrer">' + esc(info.linkLabel || info.link) + '</a>' : '') +
      '</p>' +
      '<p class="dm-cfg-hint">切换后基础地址与次数上限会换成对应接口的字段；保存时先写接口参数、最后写开关。</p>' +
      '</div>';
  }

  function apiKeyHtml() {
    var info = payload.webSearch && payload.webSearch.apiKey;
    if (!info || info.available !== true) {
      return '<div class="dm-cfg-field">' +
        '<div class="dm-cfg-labelRow"><span class="dm-cfg-label">API Key</span>' +
          '<span class="dm-cfg-badge is-off">不可用</span></div>' +
        '<p class="dm-cfg-hint">宿主的凭据服务不可用，暂时无法读取或写入密钥。</p></div>';
    }
    return '<div class="dm-cfg-field">' +
      '<div class="dm-cfg-labelRow"><span class="dm-cfg-label">API Key</span>' +
        '<span class="dm-cfg-badge ' + (info.configured ? 'is-on' : 'is-off') + '">' + (info.configured ? '已配置' : '未配置') + '</span></div>' +
      '<input class="dm-cfg-input" type="password" autocomplete="new-password" autocapitalize="off" spellcheck="false"' +
        ' value="" placeholder="' + (info.configured ? '已配置；留空表示保持当前密钥' : '填写 API Key') + '"' +
        ' data-dm-cfg-apikey="1"' + (info.writable ? '' : ' disabled') + '>' +
      '<p class="dm-cfg-hint">只写宿主凭据库（引用 ' + esc(info.ref) + '），不写入设置文件；密钥不会回显，留空表示不修改。</p>' +
      '</div>';
  }

  function modelsHtml() {
    var info = payload.models;
    var section = sectionOf('subagent-model-selection-settings');
    if (!info || info.available !== true) {
      return '<div class="dm-cfg-section"><h2 class="dm-cfg-sectionTitle">模型选择</h2>' +
        '<p class="dm-cfg-hint">宿主的 llm 服务不可用，无法读取模型清单。</p></div>';
    }
    var enabledField = fieldOf('subagent-model-selection-settings', 'enabled');
    var enabled = stagedEnabled !== null ? stagedEnabled : (enabledField && enabledField.value === true);
    var selected = stagedModels || {};
    var groups = Array.isArray(info.groups) ? info.groups : [];
    var known = {};
    var html = '';
    for (var i = 0; i < groups.length; i++) {
      var group = groups[i] || {};
      var models = Array.isArray(group.models) ? group.models : [];
      if (models.length === 0) continue;
      html += '<div class="dm-cfg-modelGroup"><p class="dm-cfg-provider">' + esc(group.name || group.id) + '</p>';
      for (var j = 0; j < models.length; j++) {
        var model = models[j] || {};
        var keyText = modelKey({ provider: group.id, model: model.id });
        known[keyText] = true;
        html += '<label class="dm-cfg-model"><input type="checkbox" data-dm-cfg-model="' + esc(keyText) + '"' +
          (selected[keyText] ? ' checked' : '') + (enabled ? '' : ' disabled') + '>' +
          '<span class="dm-cfg-modelText"><span class="dm-cfg-modelName">' + esc(model.name || model.id) + '</span>' +
          '<span class="dm-cfg-modelRoute">' + esc(group.name || group.id) + ' · ' + esc(group.id) + '/' + esc(model.id) + '</span></span></label>';
      }
      html += '</div>';
    }
    var missing = [];
    for (var k in selected) if (selected[k] && !known[k]) missing.push(k);
    if (missing.length > 0) {
      html += '<div class="dm-cfg-modelGroup"><p class="dm-cfg-provider">已保存但当前不可用</p>';
      for (var m = 0; m < missing.length; m++) {
        var parts = missing[m].split('|');
        html += '<label class="dm-cfg-model"><input type="checkbox" data-dm-cfg-model="' + esc(missing[m]) + '" checked' +
          (enabled ? '' : ' disabled') + '>' +
          '<span class="dm-cfg-modelText"><span class="dm-cfg-modelName">' + esc(parts[1]) + '</span>' +
          '<span class="dm-cfg-modelRoute">' + esc(parts[0]) + ' · 当前不可用</span></span></label>';
      }
      html += '</div>';
    }
    if (Array.isArray(info.failures) && info.failures.length > 0) {
      var names = [];
      for (var f = 0; f < info.failures.length; f++) {
        var failure = info.failures[f] || {};
        names.push(String(failure.name || failure.id || '') + '：' + String(failure.message || '读取失败'));
      }
      html += '<p class="dm-cfg-hint dm-cfg-warn">部分模型提供方读取失败（' + esc(names.join('；')) + '）。</p>';
    }
    if (html === '') html = '<p class="dm-cfg-hint">当前没有模型提供方公布模型。</p>';

    return '<div class="dm-cfg-section">' +
      '<h2 class="dm-cfg-sectionTitle">' + esc(section && section.title ? section.title : '模型选择') + '</h2>' +
      '<div class="dm-cfg-field dm-cfg-switchRow">' +
        '<div class="dm-cfg-labelRow">' +
          '<label class="dm-cfg-label" for="dm-cfg-model-enabled">允许 Agent 为子智能体选择模型</label>' +
          (enabledField && enabledField.overridden ? '<span class="dm-cfg-badge">已覆盖</span>' : '') +
          '<label class="dm-cfg-toggle"><input id="dm-cfg-model-enabled" type="checkbox" data-dm-cfg-models-on="1"' + (enabled ? ' checked' : '') + '>' +
            '<span class="dm-cfg-track" aria-hidden="true"></span></label>' +
        '</div>' +
        '<p class="dm-cfg-hint">开启后，Agent 可以从下方授权模型中，为每个子智能体选择提供方、模型和推理强度。仅影响新会话。</p>' +
        (enabled ? '' : '<p class="dm-cfg-hint dm-cfg-offHint">当前关闭：子智能体使用配置的默认模型或继承父 Agent 的模型；已选模型会保留。</p>') +
      '</div>' +
      '<div class="dm-cfg-field">' +
        '<div class="dm-cfg-labelRow"><span class="dm-cfg-label">Agent 可选择的模型</span>' +
          '<span class="dm-cfg-badge is-off" data-dm-cfg-modelcount="1">已选 ' + countSelected(selected) + ' 个</span></div>' +
        '<div class="dm-cfg-models">' + html + '</div>' +
        '<p class="dm-cfg-hint">' + esc(MODEL_HINT) + '</p>' +
        '<p class="dm-cfg-invalid" data-dm-cfg-modelinvalid="1" hidden></p>' +
      '</div></div>';
  }

  function countSelected(selected) {
    var count = 0;
    for (var keyText in selected) if (selected[keyText]) count += 1;
    return count;
  }

  function render() {
    if (!payload) return;
    var html = '';
    var sections = Array.isArray(payload.sections) ? payload.sections : [];
    if (payload.description) html += '<p class="dm-cfg-desc">' + esc(payload.description) + '</p>';
    if (payload.key === 'web-search') {
      html += switchHtml() + apiKeyHtml();
      // 当前生效的接口段由「暂存的开关位置」决定，而不是宿主加载时的 activeNs ——
      // 用户刚切换开关时 payload 还是旧模式，用 activeNs 会把字段留在另一组。
      var active = null;
      for (var a = 0; a < sections.length; a++) {
        if (sections[a].kind === stagedMode) { active = sections[a]; break; }
      }
      if (!active && payload.webSearch && payload.webSearch.activeNs) active = sectionOf(payload.webSearch.activeNs);
      if (active) {
        html += '<div class="dm-cfg-section">' +
          '<h2 class="dm-cfg-sectionTitle">' + (stagedMode === 'api' ? 'Web 搜索 / 抓取 API' : 'DeepSeek Messages') + '</h2>';
        for (var i = 0; i < active.fields.length; i++) {
          if (active.fields[i].hidden) continue;
          html += fieldHtml(active, active.fields[i]);
        }
        html += '</div>';
      } else {
        html += '<div class="dm-cfg-section"><p class="dm-cfg-hint">宿主没有提供所选接口的配置段。</p></div>';
      }
    } else {
      for (var j = 0; j < sections.length; j++) {
        var section = sections[j];
        if (payload.key === 'subagent' && section.ns === 'subagent-model-selection-settings') continue;
        var visible = [];
        for (var k = 0; k < section.fields.length; k++) if (!section.fields[k].hidden) visible.push(section.fields[k]);
        if (visible.length === 0) continue;
        html += '<div class="dm-cfg-section">';
        if (section.title) html += '<h2 class="dm-cfg-sectionTitle">' + esc(section.title) + '</h2>';
        for (var n = 0; n < visible.length; n++) html += fieldHtml(section, visible[n]);
        html += '</div>';
      }
      if (payload.key === 'subagent') html += modelsHtml();
    }
    html += '<p class="dm-cfg-footnote">保存会写入 profile 的 cordis.patch.yml，并走宿主正常 Loader 路径应用；' +
      '插件可能因此重载，本页会在保存后重新读取宿主状态。</p>';
    html += '<div class="dm-cfg-footer">' +
      '<button class="dm-cfg-save" type="button" data-dm-cfg-save="1" disabled>' + SAVE_IDLE + '</button>' +
      '<p class="dm-cfg-status" data-dm-cfg-status="1"></p>' +
      '</div>';
    BODY_EL.innerHTML = html;
    renderStatus();
    refreshDirty();
  }

  function renderStatus() {
    var el = BODY_EL.querySelector('[data-dm-cfg-status]');
    if (!el) return;
    if (!status) { el.textContent = ''; el.className = 'dm-cfg-status'; return; }
    el.textContent = status.text;
    el.className = 'dm-cfg-status is-' + status.kind;
  }

  function setStatus(kind, text) {
    status = text ? { kind: kind, text: text } : null;
    renderStatus();
  }

  // ── 收集改动：返回 { ops, apiKey, invalid } ─────────────────────────────
  function collect() {
    var result = { ops: [], apiKey: null, invalid: null };
    if (!payload) return result;
    var byNs = {};
    function bucket(ns) {
      if (!byNs[ns]) {
        var section = sectionOf(ns);
        // expect：客户端读到的原始值。宿主写前逐个比对它来做并发保护 ——
        // pwsh-sandbox 这类含 !!js 的 entry 的 revision 会在宿主自己的 reconcile 里
        // 每写一次 +2，无法当并发令牌用（详见宿主端 mobile.builtinConfig.save 注释）。
        byNs[ns] = { ns: ns, expect: {}, sets: [], unsets: [] };
        result.ops.push(byNs[ns]);
      }
      return byNs[ns];
    }
    function remember(target, key, value) {
      target.expect[key] = value === undefined ? null : value;
    }
    function markField(target, field) {
      // 字段从 payload 来，field.value 就是这一页读到的宿主值。
      remember(target, field.key, field.value);
    }

    var sections = Array.isArray(payload.sections) ? payload.sections : [];
    for (var i = 0; i < sections.length; i++) {
      var section = sections[i];
      if (payload.key === 'web-search' && section.ns === 'web') continue;              // 开关单独处理
      if (payload.key === 'subagent' && section.ns === 'subagent-model-selection-settings') continue; // 模型单独处理
      for (var j = 0; j < section.fields.length; j++) {
        var field = section.fields[j];
        if (field.hidden) continue;
        var keyText = dataKey(section.ns, field.key);
        var target = bucket(section.ns);
        if (resetFields[keyText]) {
          // 「恢复默认」= 删除 override（不是把默认值写进 profile）。
          // settings.mutate 的 unset 会回落到继承层值，configEditor.edit 再把「与继承层
          // 相同」的字段从 patch 行里删掉 —— 与桌面 resetField 同一语义。
          markField(target, field);
          target.unsets.push({ path: [field.key] });
          continue;
        }
        var parsed = parseField(field, inputText(section.ns, field.key));
        if (parsed.kind === 'invalid') { result.invalid = parsed.message; return result; }
        if (parsed.kind === 'unset') {
          if (field.overridden) { markField(target, field); target.unsets.push({ path: [field.key] }); }
          continue;
        }
        if (parsed.kind === 'set' && !sameValue(parsed.value, field.value)) {
          markField(target, field);
          target.sets.push({ path: [field.key], value: parsed.value });
        }
      }
    }

    if (payload.key === 'subagent') {
      var sel = stagedModels || {};
      var allowedField = fieldOf('subagent-model-selection-settings', 'allowedModels');
      var stored = allowedField && Array.isArray(allowedField.value) ? allowedField.value : [];
      var baseline = {};
      for (var s = 0; s < stored.length; s++) baseline[modelKey(stored[s])] = true;
      var desired = [];
      for (var modelId in sel) {
        if (!sel[modelId]) continue;
        var parts = modelId.split('|');
        desired.push({ provider: parts[0], model: parts.slice(1).join('|') });
      }
      var enabledField = fieldOf('subagent-model-selection-settings', 'enabled');
      var enabledNow = !!(stagedEnabled !== null ? stagedEnabled : (enabledField && enabledField.value === true));
      if (enabledNow && desired.length === 0) { result.invalid = '保存前请至少选择一个模型。'; return result; }
      var modelsDirty = Object.keys(sel).length !== Object.keys(baseline).length ||
        Object.keys(sel).some(function (key) { return !baseline[key]; });
      var enabledDirty = enabledField ? enabledNow !== (enabledField.value === true) : false;
      if (modelsDirty || enabledDirty) {
        var modelTarget = bucket('subagent-model-selection-settings');
        if (enabledDirty) {
          remember(modelTarget, 'enabled', enabledField ? enabledField.value : null);
          modelTarget.sets.push({ path: ['enabled'], value: enabledNow });
        }
        if (modelsDirty) {
          remember(modelTarget, 'allowedModels', allowedField ? allowedField.value : []);
          if (desired.length === 0 && !enabledNow) modelTarget.unsets.push({ path: ['allowedModels'] });
          else modelTarget.sets.push({ path: ['allowedModels'], value: desired });
        }
      }
    }

    if (payload.key === 'web-search' && payload.webSearch && payload.webSearch.switch) {
      var info = payload.webSearch.switch;
      var wantApi = stagedMode === 'api';
      if (wantApi !== (payload.webSearch.mode === 'api')) {
        var webTarget = bucket(info.ns);
        var target = wantApi ? info.on : info.off;
        var names = ['searchProvider', 'fetchProvider'];
        for (var f = 0; f < names.length; f++) {
          var name = names[f];
          var webField = fieldOf(info.ns, name);
          remember(webTarget, name, webField ? webField.value : null);
          if (info.base && info.base[name] === target[name]) webTarget.unsets.push({ path: [name] });
          else webTarget.sets.push({ path: [name], value: target[name] });
        }
      }
    }

    var kept = [];
    for (var o = 0; o < result.ops.length; o++) {
      if (result.ops[o].sets.length > 0 || result.ops[o].unsets.length > 0) kept.push(result.ops[o]);
    }
    result.ops = kept;

    var keyInput = BODY_EL.querySelector('[data-dm-cfg-apikey]');
    if (keyInput && keyInput.value !== '' && payload.webSearch && payload.webSearch.apiKey && payload.webSearch.apiKey.available) {
      result.apiKey = { ref: payload.webSearch.apiKey.ref, value: keyInput.value };
    }
    return result;
  }

  function refreshDirty() {
    if (!payload) return;
    var button = BODY_EL.querySelector('[data-dm-cfg-save]');
    if (!button) return;
    var collected = collect();
    var dirty = collected.ops.length > 0 || collected.apiKey !== null;
    button.disabled = saving || collected.invalid !== null || !dirty;
    button.textContent = saving ? SAVE_BUSY : SAVE_IDLE;

    var sections = Array.isArray(payload.sections) ? payload.sections : [];
    for (var i = 0; i < sections.length; i++) {
      var section = sections[i];
      for (var j = 0; j < section.fields.length; j++) {
        var field = section.fields[j];
        if (field.hidden) continue;
        var keyText = dataKey(section.ns, field.key);
        var wraps = BODY_EL.querySelectorAll('[data-dm-cfg-field]');
        var wrap = null;
        for (var w = 0; w < wraps.length; w++) {
          if (wraps[w].getAttribute('data-dm-cfg-field') === keyText) { wrap = wraps[w]; break; }
        }
        if (!wrap) continue;
        var box = wrap.querySelector('.dm-cfg-invalid');
        if (!box) continue;
        var parsed = resetFields[keyText] ? { kind: 'ok' } : parseField(field, inputText(section.ns, field.key));
        if (parsed.kind === 'invalid') { box.textContent = parsed.message; box.hidden = false; wrap.classList.add('is-invalid'); }
        else { box.textContent = ''; box.hidden = true; wrap.classList.remove('is-invalid'); }
      }
    }
    var modelBox = BODY_EL.querySelector('[data-dm-cfg-modelinvalid]');
    if (modelBox) {
      if (collected.invalid === '保存前请至少选择一个模型。') { modelBox.textContent = collected.invalid; modelBox.hidden = false; }
      else { modelBox.textContent = ''; modelBox.hidden = true; }
    }
  }

  // ── 打开 / 加载 / 关闭 / 保存 ───────────────────────────────────────────
  function resetStaging() {
    stagedMode = null;
    stagedFields = {};
    stagedModels = null;
    stagedEnabled = null;
    resetFields = {};
    status = null;
  }

  function applyPayload(next) {
    payload = next;
    stagedFields = {};
    resetFields = {};
    if (payload && payload.key === 'web-search' && payload.webSearch) {
      stagedMode = payload.webSearch.mode === 'api' ? 'api' : 'messages';
    } else {
      stagedMode = null;
    }
    if (payload && payload.key === 'subagent') {
      var allowed = fieldOf('subagent-model-selection-settings', 'allowedModels');
      var stored = allowed && Array.isArray(allowed.value) ? allowed.value : [];
      stagedModels = {};
      for (var i = 0; i < stored.length; i++) stagedModels[modelKey(stored[i])] = true;
      var enabled = fieldOf('subagent-model-selection-settings', 'enabled');
      stagedEnabled = enabled ? enabled.value === true : false;
    } else {
      stagedModels = null;
      stagedEnabled = null;
    }
    if (TITLE_EL) TITLE_EL.textContent = payload && payload.title ? payload.title : '内置插件配置';
  }

  function open(key) {
    if (!key) return;
    if (openKey === key) { load(key); return; }
    openKey = key;
    payload = null;
    resetStaging();
    PAGE_EL.hidden = false;
    try { history.pushState({ dmBuiltinConfig: key }, '', '#/dm-config/' + key); } catch (e) {}
    if (TITLE_EL) TITLE_EL.textContent = '加载中…';
    renderState('加载中…', 'dm-page-loading');
    load(key);
  }

  function close(fromPop) {
    if (openKey === null) return;
    openKey = null;
    payload = null;
    resetStaging();
    PAGE_EL.hidden = true;
    if (!fromPop) { try { history.back(); } catch (e) {} }
  }

  function load(key) {
    var nonce = ++loadNonce;
    rpc('mobile.builtinConfig.get', { page: key }).then(function (result) {
      if (nonce !== loadNonce || openKey !== key) return;
      if (!result || result.ok !== true) {
        renderState('读取失败：' + ((result && result.error && result.error.message) || '宿主没有返回有效数据'), 'dm-page-error');
        return;
      }
      applyPayload(result.value);
      render();
    }).catch(function (error) {
      if (nonce !== loadNonce || openKey !== key) return;
      renderState('读取失败：' + ((error && error.message) || String(error)), 'dm-page-error');
    });
  }

  // 写配置会触发 Loader 应用：本插件的 HTTP server 可能在写入落盘后立刻被重建，
  // 于是这次请求的连接被断开（fetch 报 network error），但宿主其实已经写入。
  // 所以连接断了不能直接判失败：重取宿主状态，按「目标值是否真的落地」判定。
  function refetchPage(key, attempt) {
    var tries = attempt || 0;
    return rpc('mobile.builtinConfig.get', { page: key }).then(function (result) {
      if (result && result.ok === true) return result.value;
      return null;
    }).catch(function () {
      if (tries >= 9) return null;
      return new Promise(function (resolve) { setTimeout(resolve, 700); }).then(function () {
        return refetchPage(key, tries + 1);
      });
    });
  }

  function pageSection(pageData, ns) {
    var list = pageData && Array.isArray(pageData.sections) ? pageData.sections : [];
    for (var i = 0; i < list.length; i++) if (list[i].ns === ns) return list[i];
    return null;
  }

  function pageField(pageData, ns, key) {
    var section = pageSection(pageData, ns);
    var fields = section && Array.isArray(section.fields) ? section.fields : [];
    for (var i = 0; i < fields.length; i++) if (fields[i].key === key) return fields[i];
    return null;
  }

  function intentLanded(pageData, ops, apiKey) {
    for (var i = 0; i < ops.length; i++) {
      var plan = ops[i];
      var section = pageSection(pageData, plan.ns);
      if (!section) return false;
      for (var j = 0; j < plan.sets.length; j++) {
        var field = pageField(pageData, plan.ns, plan.sets[j].path[0]);
        if (!field || JSON.stringify(field.value) !== JSON.stringify(plan.sets[j].value)) return false;
      }
      for (var k = 0; k < plan.unsets.length; k++) {
        var unsetField = pageField(pageData, plan.ns, plan.unsets[k].path[0]);
        if (!unsetField || unsetField.overridden !== false) return false;
      }
    }
    if (apiKey) {
      var info = pageData && pageData.webSearch ? pageData.webSearch.apiKey : null;
      if (!info || info.configured !== true) return false;
    }
    return true;
  }

  function save() {
    if (saving || !payload) return;
    var collected = collect();
    if (collected.invalid) { setStatus('err', collected.invalid); return; }
    if (collected.ops.length === 0 && collected.apiKey === null) return;
    var pageKey = payload.key;
    saving = true;
    setStatus('info', '保存中…（写入会走宿主 Loader 应用，插件可能短暂重载）');
    refreshDirty();
    var body = { page: pageKey, sections: collected.ops };
    if (collected.apiKey) body.apiKey = collected.apiKey;
    rpc('mobile.builtinConfig.save', body).then(function (result) {
      saving = false;
      if (!result || result.ok !== true) {
        var error = (result && result.error) || { code: 'unknown', message: '宿主没有返回保存结果' };
        // 失败回滚：宿主把最新状态放在 value.page，按它整页重绘；草稿丢弃。
        if (result && result.value && result.value.page) {
          applyPayload(result.value.page);
          render();
        } else {
          refreshDirty();
        }
        if (error.code === 'settings_conflict') {
          setStatus('err', '设置已在其他位置更新，本次没有覆盖，表单已按宿主最新值回滚：' + error.message);
        } else {
          setStatus('err', '保存失败（表单已按宿主最新值回滚）：' + error.message);
        }
        return;
      }
      applyPayload(result.value.page);
      render();
      if (Array.isArray(result.value.mismatches) && result.value.mismatches.length > 0) {
        var names = result.value.mismatches.map(function (item) { return (item.path && item.path.join('.')) || item.ns; });
        setStatus('err', '已提交，但宿主回读不一致（' + names.join('、') + '）：可能被上层配置覆盖。');
        return;
      }
      setStatus('ok', '已保存并应用到宿主（回读已确认）。');
    }).catch(function () {
      // 连接被重载打断：以宿主回读为准，而不是把「网络错误」当失败。
      refetchPage(pageKey).then(function (fresh) {
        saving = false;
        if (!fresh) {
          refreshDirty();
          setStatus('err', '保存结果未知：写入时连接中断（插件重载），且暂时读不到宿主状态。请稍后点右上角刷新确认。');
          return;
        }
        applyPayload(fresh);
        render();
        if (intentLanded(fresh, collected.ops, collected.apiKey)) {
          setStatus('ok', '已保存并应用到宿主（写入时插件重载、连接中断一次；回读已确认）。');
          return;
        }
        setStatus('err', '保存未落地：宿主在写入时重载、连接中断，回读仍看不到新值。请重试。');
      });
    });
  }

  // ── 事件（全部委托，重绘后无需重绑）──────────────────────────────────
  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || !target.closest) return;
    var opener = target.closest('[data-dm-cfg-open]');
    if (opener) { event.preventDefault(); open(opener.getAttribute('data-dm-cfg-open')); return; }
    if (target.closest('[data-dm-cfg-back]')) { event.preventDefault(); close(false); return; }
    if (target.closest('[data-dm-cfg-refresh]')) {
      event.preventDefault();
      if (openKey) { renderState('刷新中…', 'dm-page-loading'); load(openKey); }
      return;
    }
    var reset = target.closest('[data-dm-cfg-reset]');
    if (reset) {
      event.preventDefault();
      overlayFields();
      var resetKey = reset.getAttribute('data-dm-cfg-reset');
      if (resetFields[resetKey]) delete resetFields[resetKey];
      else resetFields[resetKey] = true;
      render();
      return;
    }
    if (target.closest('[data-dm-cfg-save]')) { event.preventDefault(); save(); return; }
    if (target.closest('[data-dm-cfg-retry]')) { event.preventDefault(); if (openKey) load(openKey); }
  });

  document.addEventListener('input', function (event) {
    var target = event.target;
    if (!target || !target.getAttribute) return;
    if (target.getAttribute('data-dm-cfg-input') !== null) {
      var keyText = target.getAttribute('data-dm-cfg-input');
      stagedFields[keyText] = target.value;
      if (resetFields[keyText]) delete resetFields[keyText];
      refreshDirty();
      return;
    }
    if (target.getAttribute('data-dm-cfg-apikey') !== null) refreshDirty();
  });

  document.addEventListener('change', function (event) {
    var target = event.target;
    if (!target || !target.getAttribute) return;
    if (target.getAttribute('data-dm-cfg-switch') !== null) {
      overlayFields();
      stagedMode = target.checked ? 'api' : 'messages';
      render();
      return;
    }
    if (target.getAttribute('data-dm-cfg-models-on') !== null) {
      overlayFields();
      stagedEnabled = target.checked;
      render();
      return;
    }
    if (target.getAttribute('data-dm-cfg-model') !== null) {
      var keyText = target.getAttribute('data-dm-cfg-model');
      if (!stagedModels) stagedModels = {};
      if (target.checked) stagedModels[keyText] = true;
      else delete stagedModels[keyText];
      render();
    }
  });

  window.addEventListener('popstate', function (event) {
    var stateValue = event && event.state;
    if (openKey !== null && (!stateValue || stateValue.dmBuiltinConfig !== openKey)) close(true);
  });

  // 插件页的行也可以直接调这个入口（两条路都通）
  window.__dmOpenBuiltinConfig = open;
})();
</script>`

// ── 设置 → 主机配置 → 模型：只保留「模型」行 + 自绘模型页 ──────────────────
// 隐藏只在「主机配置」组内按行标题精确匹配（不改 settings.read：bundle 的
// ui-theme/分组详情页共用同一份 namespaces）；点「模型」行由本脚本接管，
// 打开下面这个页面。数据全部来自宿主 RPC mobile.modelsCenter.get。
const MODELS_CENTER_HTML = `<script>
(function () {
  'use strict';

  // ── 设置页「主机配置」：只保留「模型」一行 ────────────────────────────────
  //
  // 不改 settings.read：bundle 的 ui-theme（主题偏好）与分组详情页共用那份
  // namespaces，按组过滤会连带把它们拿掉。这里只在该 settings-group 内按行标题
  // 精确匹配隐藏，MutationObserver 在 React 重渲染后补隐藏，绝不碰其它分组。
  var GROUP_TITLE = '主机配置';
  var KEEP_ROW = '模型';
  var GROUP_DESC = '模型提供方 · 密钥 · 默认模型';
  var hideHits = 0;

  function settingsGroup() {
    var groups = document.querySelectorAll('.settings-group');
    for (var i = 0; i < groups.length; i++) {
      var title = groups[i].querySelector('.settings-groupTitle');
      if (title && String(title.textContent || '').indexOf(GROUP_TITLE) === 0) return groups[i];
    }
    return null;
  }

  function applySettingsFilter() {
    var group = settingsGroup();
    if (!group) return;
    var rows = group.querySelectorAll(':scope > li');
    for (var i = 0; i < rows.length; i++) {
      var li = rows[i];
      var button = li.querySelector('.mobile-row');
      if (!button) continue;
      // 「用量」行由设置页范围标签脚本（SETTINGS_SCOPE_HTML）插到本组、与「模型」并列；
      // 这里必须同样放行，否则每秒一次的过滤会把它 display:none 掉。
      if (button.hasAttribute('data-dm-usage-row')) continue;
      var titleEl = button.querySelector('.card-titleText');
      var title = String(titleEl && titleEl.textContent ? titleEl.textContent : '').trim();
      if (title === KEEP_ROW) {
        if (li.style.display === 'none') li.style.display = '';
        li.setAttribute('data-dm-models-row', '1');
      } else {
        if (li.style.display !== 'none') li.style.display = 'none';
        li.removeAttribute('data-dm-models-row');
      }
    }
    var desc = group.querySelector('.settings-groupDesc');
    if (desc && desc.textContent !== GROUP_DESC) desc.textContent = GROUP_DESC;
    hideHits += 1;
  }

  var filterQueued = false;
  function scheduleSettingsFilter() {
    if (filterQueued) return;
    filterQueued = true;
    window.setTimeout(function () {
      filterQueued = false;
      try { applySettingsFilter(); } catch (e) {}
    }, 60);
  }
  try {
    if (window.__dmMutationBus) window.__dmMutationBus.subscribe(scheduleSettingsFilter); else new MutationObserver(scheduleSettingsFilter).observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
  window.setInterval(function () { try { applySettingsFilter(); } catch (e) {} }, 1000);
  applySettingsFilter();

  // ── 模型页（自绘，数据全部来自宿主）──────────────────────────────────────
  var PAGE = document.getElementById('dm-page-models');
  if (!PAGE) return;
  var BODY = PAGE.querySelector('[data-dm-mc-body]');
  var TITLE = PAGE.querySelector('[data-dm-mc-title]');
  var opened = false;
  var loading = false;
  var data = null;
  var errorText = null;
  var status = null;
  var loadNonce = 0;
  var sheet = null;      // 当前弹出面板（添加/编辑/删除/替换 Key/默认模型）
  var openForm = null;   // 卡片内联表单：{ kind:'edit'|'key', route, error, draft }（同一时间只展开一个）
  var busy = false;

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function rpc(method, payload) {
    return fetch('/m/api/' + method, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rpcId: 'dm-mc-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        payload: payload || {},
      }),
    }).then(function (res) {
      return res.json().catch(function () { return null; });
    }).then(function (json) {
      if (!json || !json.result) throw new Error('宿主没有返回 RPC 结果（连接可能因插件重载中断）');
      return json.result;
    });
  }

  function renderState(text, cls, withRetry) {
    BODY.innerHTML = '<div class="dm-page-state ' + (cls || '') + '">' +
      '<p class="dm-page-stateText">' + esc(text) + '</p>' +
      (withRetry ? '<button class="dm-page-retry" type="button" data-dm-mc-retry="1">重试</button>' : '') +
      '</div>';
  }

  function setStatus(kind, text) {
    status = text ? { kind: kind, text: text } : null;
    var el = BODY.querySelector('[data-dm-mc-status]');
    if (!el) return;
    if (!status) { el.textContent = ''; el.className = 'dm-cfg-status'; return; }
    el.textContent = status.text;
    el.className = 'dm-cfg-status is-' + status.kind;
  }

  function badge(text, tone) {
    return '<span class="dm-cfg-badge' + (tone ? ' ' + tone : '') + '">' + esc(text) + '</span>';
  }

  function sourceLabel(item) {
    if (item.source === 'account') return 'DeepSeek 账号';
    if (item.source === 'deepseek') return 'DeepSeek 官方 API';
    if (item.source === 'profile') return '已配置';
    if (item.source === 'registered') return '已注册';
    return '目录可选';
  }

  function providerOf(route) {
    if (!data || !Array.isArray(data.providers)) return null;
    for (var i = 0; i < data.providers.length; i++) if (data.providers[i].provider === route) return data.providers[i];
    return null;
  }

  function inlineFieldHtml(label, name, value, opts) {
    var options = opts || {};
    var input;
    if (options.select) {
      input = '<select class="dm-cfg-input" data-dm-mc-inline="' + esc(name) + '">' + options.select.map(function (choice) {
        return '<option value="' + esc(choice.value) + '"' + (String(value) === String(choice.value) ? ' selected' : '') + '>' + esc(choice.label) + '</option>';
      }).join('') + '</select>';
    } else if (options.textarea) {
      input = '<textarea class="dm-cfg-input dm-mc-textarea" rows="' + (options.rows || 5) + '" data-dm-mc-inline="' + esc(name) + '"' +
        (options.placeholder ? ' placeholder="' + esc(options.placeholder) + '"' : '') + '>' + esc(value) + '</textarea>';
    } else {
      input = '<input class="dm-cfg-input" type="' + (options.type || 'text') + '" autocomplete="' + (options.type === 'password' ? 'new-password' : 'off') + '"' +
        ' autocapitalize="off" spellcheck="false" data-dm-mc-inline="' + esc(name) + '" value="' + esc(value) + '"' +
        (options.placeholder ? ' placeholder="' + esc(options.placeholder) + '"' : '') + '>';
    }
    return '<div class="dm-mc-formRow"><label class="dm-cfg-label">' + esc(label) + '</label>' + input +
      (options.hint ? '<p class="dm-cfg-hint">' + esc(options.hint) + '</p>' : '') + '</div>';
  }

  // 卡片内联表单：默认收起，点「编辑 / 替换 API Key」才在卡片里展开（同一时间只开一个）。
  function inlineFormHtml(item) {
    var form = openForm;
    var draft = form.draft || {};
    var html = '<div class="dm-mc-inlineForm" data-dm-mc-inline-box="' + esc(item.provider) + '">';
    if (form.kind === 'key') {
      html += '<p class="dm-cfg-hint">凭据引用 ' + esc(item.apiKeyRef || '') + ' · 只写宿主凭据库，不回显。</p>' +
        inlineFieldHtml('API Key', 'key', '', { type: 'password', placeholder: (item.credential && item.credential.configured) ? '已配置；留空表示保持当前密钥' : '输入 API 密钥' });
    } else {
      var profile = (data.profiles && data.profiles[item.provider] && typeof data.profiles[item.provider] === 'object') ? data.profiles[item.provider] : {};
      html += inlineFieldHtml('显示名称', 'displayName', draft.displayName !== undefined ? draft.displayName : (profile.displayName || item.displayName || ''), { placeholder: '留空使用默认名称' });
      html += inlineFieldHtml('API 协议', 'api', draft.api !== undefined ? draft.api : (profile.api || item.api || 'openai-completions'), {
        select: [
          { value: 'openai-completions', label: 'openai-completions' },
          { value: 'openai-responses', label: 'openai-responses' },
          { value: 'anthropic-messages', label: 'anthropic-messages' },
        ],
      });
      html += inlineFieldHtml('API 地址', 'baseURL', draft.baseURL !== undefined ? draft.baseURL : (profile.baseURL || item.baseURL || ''), { placeholder: 'https://gateway.example/v1' });
      html += inlineFieldHtml('模型（每行一个，可写 id=显示名）', 'models', draft.modelsText !== undefined ? draft.modelsText : modelsTextOf(profile.models || item.models || []), { textarea: true, rows: 5 });
      html += inlineFieldHtml('API Key', 'key', '', { type: 'password', placeholder: (item.credential && item.credential.configured) ? '已配置；留空表示保持当前密钥' : '输入 API 密钥' });
    }
    if (form.error) html += '<p class="dm-cfg-invalid">' + esc(form.error) + '</p>';
    html += '<div class="dm-mc-sheetActions"><button class="dm-cfg-save" type="button" data-dm-mc-inline-save="1"' + (busy ? ' disabled' : '') + '>' + esc(busy ? '保存中…' : '保存') + '</button>' +
      '<button class="dm-mc-btn" type="button" data-dm-mc-inline-cancel="1">取消</button></div></div>';
    return html;
  }

  function readInlineField(name) {
    var box = PAGE.querySelector('[data-dm-mc-inline-box]');
    var el = box ? box.querySelector('[data-dm-mc-inline="' + name + '"]') : null;
    return el ? String(el.value == null ? '' : el.value) : '';
  }

  function submitInline() {
    if (busy || !openForm) return;
    var route = openForm.route;
    var payload;
    var intent;
    if (openForm.kind === 'key') {
      var keyValue = readInlineField('key');
      openForm.draft = { key: keyValue };
      if (keyValue === '') { openForm.error = '请输入 API Key'; render(); return; }
      var keyItem = providerOf(route);
      payload = { action: 'setKey', ref: keyItem ? keyItem.apiKeyRef : '', value: keyValue };
      intent = { kind: 'key', ref: payload.ref };
    } else {
      openForm.draft = {
        displayName: readInlineField('displayName'),
        api: readInlineField('api'),
        baseURL: readInlineField('baseURL'),
        modelsText: readInlineField('models'),
        key: readInlineField('key'),
      };
      payload = {
        action: 'saveProvider', mode: 'edit', route: route,
        displayName: openForm.draft.displayName, api: openForm.draft.api,
        baseURL: openForm.draft.baseURL, models: parseModelsText(openForm.draft.modelsText),
        key: openForm.draft.key,
      };
      intent = { kind: 'provider', route: route, key: payload.key !== '' };
    }
    busy = true;
    openForm.error = null;
    render();
    var target = openForm;
    rpc('mobile.modelsCenter.save', payload).then(function (result) {
      settleSave(intent, result, null, function (landed, message, res) {
        if (openForm === target) openForm = landed ? null : target;
        if (!landed && openForm) openForm.error = message || '保存失败';
        render();
        if (!landed) { setStatus('err', '保存失败：' + (message || '回读未看到目标值')); return; }
        var mismatches = (res && res.value && Array.isArray(res.value.mismatches)) ? res.value.mismatches : [];
        if (mismatches.length > 0) setStatus('err', '已提交，但宿主回读不一致：' + mismatches.map(function (item) { return item.field; }).join('、'));
        else setStatus('ok', message ? '已保存并应用到宿主（写入时连接中断一次，回读已确认）。' : '已保存并应用到宿主（回读已确认）。');
      });
    }).catch(function (err) {
      settleSave(intent, null, err, function (landed, message) {
        if (openForm === target) openForm = landed ? null : target;
        if (!landed && openForm) openForm.error = message || '保存失败';
        render();
        setStatus(landed ? 'ok' : 'err', landed ? '已保存并应用到宿主（写入时连接中断一次，回读已确认）。' : '保存失败：' + (message || ''));
      });
    });
  }

  function providerCard(item) {
    var badges = '';
    if (item.registered) badges += badge('已注册', 'is-on');
    if (item.configured) badges += badge('已配置', 'is-on');
    if (item.error) badges += badge('异常', 'is-off');
    var meta = [];
    if (item.credential) meta.push(item.credential.configured ? 'API Key 已配置' : 'API Key 未配置');
    if (item.models && item.models.length > 0) meta.push(item.models.length + ' 个模型');
    if (item.api) meta.push(item.api);
    var expanded = openForm !== null && openForm.route === item.provider;
    var actions = '';
    if (item.provider === 'deepseek-official' && item.credential) {
      actions += '<button class="dm-mc-btn" type="button" data-dm-mc-key="' + esc(item.provider) + '">' + (expanded && openForm.kind === 'key' ? '收起' : '替换 API Key') + '</button>';
    }
    if (item.source === 'profile' || item.removable) {
      actions += '<button class="dm-mc-btn" type="button" data-dm-mc-edit="' + esc(item.provider) + '">' + (expanded && openForm.kind === 'edit' ? '收起' : '编辑') + '</button>';
      if (item.removable) actions += '<button class="dm-mc-btn is-danger" type="button" data-dm-mc-remove="' + esc(item.provider) + '">删除</button>';
    }
    var html = '<div class="dm-mc-card" data-dm-mc-provider="' + esc(item.provider) + '">' +
      '<div class="dm-mc-head"><span class="dm-mc-name">' + esc(item.displayName || item.provider) + '</span>' +
      '<span class="dm-mc-badges">' + badges + '</span></div>' +
      '<div class="dm-mc-sub">' + esc(item.provider) + ' · ' + esc(sourceLabel(item)) + '</div>';
    if (meta.length > 0) html += '<div class="dm-mc-meta">' + esc(meta.join(' · ')) + '</div>';
    if (item.baseURL) html += '<div class="dm-mc-meta dm-mc-endpoint">' + esc(item.baseURL) + '</div>';
    if (item.modelsError) html += '<p class="dm-cfg-hint dm-cfg-warn">模型清单读取失败：' + esc(item.modelsError) + '</p>';
    if (item.error) html += '<p class="dm-cfg-hint dm-cfg-warn">' + esc(item.error) + '</p>';
    if (actions !== '') html += '<div class="dm-mc-actions">' + actions + '</div>';
    if (expanded) html += inlineFormHtml(item);
    html += '</div>';
    return html;
  }

  function render() {
    if (!data) {
      renderState('还没有模型数据', 'dm-page-empty', true);
      return;
    }
    if (data.available !== true) {
      renderState(data.reason || '宿主没有提供模型服务', 'dm-page-error', true);
      return;
    }
    var readOnly = data.readOnly === true;
    var html = '';

    // DeepSeek 账号
    html += '<div class="dm-mc-section"><h2 class="dm-cfg-sectionTitle">DeepSeek 账号</h2>';
    var account = data.account || { available: false };
    if (account.available !== true) {
      html += '<div class="dm-mc-card"><p class="dm-cfg-hint">' + esc(account.reason || '宿主账号服务不可用') + '</p></div>';
    } else {
      var signedIn = account.status === 'signed-in';
      html += '<div class="dm-mc-card"><div class="dm-mc-head"><span class="dm-mc-name">DeepSeek 账号</span>' +
        (signedIn ? badge('已登录', 'is-on') : badge('未登录', 'is-off')) + '</div>' +
        '<p class="dm-cfg-hint">' + (signedIn ? '已在本机保存 DeepSeek 账号授权，可直接使用账号模型。' : '尚未登录。手机端暂不支持登录/退出，请在桌面端操作。') + '</p>';
      if (account.attempt && account.attempt.phase) {
        html += '<p class="dm-cfg-hint dm-cfg-warn">登录进行中：' + esc(account.attempt.phase) + '</p>';
      }
      // 账号链接做成按钮、右对齐放在卡片右下角（用户要求）；只在宿主真给了 URL 时渲染。
      var links = [];
      if (account.links && account.links.usageUrl) {
        links.push('<a class="dm-mc-btn dm-mc-linkBtn" role="button" href="' + esc(account.links.usageUrl) + '" target="_blank" rel="noopener noreferrer">用量</a>');
      }
      if (account.links && account.links.topUpUrl) {
        links.push('<a class="dm-mc-btn dm-mc-linkBtn" role="button" href="' + esc(account.links.topUpUrl) + '" target="_blank" rel="noopener noreferrer">充值</a>');
      }
      if (links.length > 0) html += '<div class="dm-mc-links">' + links.join('') + '</div>';
      html += '</div>';
    }
    html += '</div>';

    // 默认模型：标题行只留标题，「编辑」按钮放到卡片内部右下角（用户要求）。
    html += '<div class="dm-mc-section"><h2 class="dm-cfg-sectionTitle">默认模型</h2>';
    var model = data.defaultModel;
    if (!model) {
      html += '<div class="dm-mc-card"><p class="dm-cfg-hint">宿主没有返回默认模型。</p></div>';
    } else {
      var nameOf = function (provider, id) {
        var item = providerOf(provider);
        if (!item) return null;
        for (var i = 0; i < (item.models || []).length; i++) if (item.models[i].id === id) return item.models[i].name;
        return null;
      };
      html += '<div class="dm-mc-card"><div class="dm-mc-head"><span class="dm-mc-name">' +
        esc(nameOf(model.provider, model.model) || model.model) + '</span>' +
        (model.overridden ? badge('已覆盖') : '') + '</div>' +
        '<div class="dm-mc-sub">' + esc(model.provider) + ' · ' + esc(model.model) + '</div>' +
        '<div class="dm-mc-meta">推理强度：' + esc(model.reasoningEffort || '默认') + '</div>' +
        (readOnly ? '' : '<div class="dm-mc-cardFoot"><button class="dm-mc-btn" type="button" data-dm-mc-default-edit="1">编辑</button></div>') +
        '</div>';
    }
    html += '</div>';

    // 提供商列表
    var providers = Array.isArray(data.providers) ? data.providers : [];
    html += '<div class="dm-mc-section"><h2 class="dm-cfg-sectionTitle">提供商（' + providers.length + ' 个）</h2>';
    if (providers.length === 0) {
      html += '<div class="dm-mc-card"><p class="dm-cfg-hint">宿主当前没有可用的模型提供商。</p></div>';
    } else {
      for (var i = 0; i < providers.length; i++) html += providerCard(providers[i]);
    }
    if (!readOnly) html += '<button class="dm-mc-addRow" type="button" data-dm-mc-add="1">＋ 添加模型提供商</button>';
    html += '</div>';

    html += '<p class="dm-cfg-footnote">数据来自宿主 llm / credentials / deepseekAccount / agentDefaultModel 的实时读取。' +
      (readOnly ? '当前部署的设置文档只读。' : '保存会写入 profile 的 cordis.patch.yml 并走正常 Loader 路径应用，插件可能短暂重载。') +
      '</p>';
    html += '<div class="dm-cfg-footer"><p class="dm-cfg-status" data-dm-mc-status="1"></p></div>';
    BODY.innerHTML = html;
    setStatus(status && status.kind, status && status.text);
    renderSheet();
  }

  // ── 弹出面板（添加 / 编辑 / 删除 / 替换 Key / 默认模型）────────────────────
  function sheetHost() {
    var host = PAGE.querySelector('[data-dm-mc-sheethost]');
    if (!host) {
      host = document.createElement('div');
      host.className = 'dm-mc-sheetHost';
      host.setAttribute('data-dm-mc-sheethost', '1');
      host.hidden = true;
      PAGE.appendChild(host);
    }
    return host;
  }

  function fieldHtml(label, name, value, opts) {
    var options = opts || {};
    var input;
    if (options.select) {
      var items = options.select.map(function (choice) {
        return '<option value="' + esc(choice.value) + '"' + (String(value) === String(choice.value) ? ' selected' : '') + '>' + esc(choice.label) + '</option>';
      }).join('');
      input = '<select class="dm-cfg-input" data-dm-mc-field="' + esc(name) + '"' + (options.disabled ? ' disabled' : '') + '>' + items + '</select>';
    } else if (options.textarea) {
      input = '<textarea class="dm-cfg-input dm-mc-textarea" rows="' + (options.rows || 3) + '" data-dm-mc-field="' + esc(name) + '"' +
        (options.placeholder ? ' placeholder="' + esc(options.placeholder) + '"' : '') + '>' + esc(value) + '</textarea>';
    } else {
      input = '<input class="dm-cfg-input" type="' + (options.type || 'text') + '" autocomplete="' + (options.type === 'password' ? 'new-password' : 'off') + '"' +
        ' autocapitalize="off" spellcheck="false" data-dm-mc-field="' + esc(name) + '"' +
        ' value="' + esc(value) + '"' +
        (options.placeholder ? ' placeholder="' + esc(options.placeholder) + '"' : '') +
        (options.disabled ? ' disabled' : '') + '>';
    }
    return '<div class="dm-mc-formRow"><label class="dm-cfg-label">' + esc(label) + '</label>' + input +
      (options.hint ? '<p class="dm-cfg-hint">' + esc(options.hint) + '</p>' : '') + '</div>';
  }

  function sheetErrorHtml() {
    if (!sheet || !sheet.error) return '';
    return '<p class="dm-cfg-invalid dm-mc-sheetErr">' + esc(sheet.error) + '</p>';
  }

  function sheetHeader(title) {
    return '<div class="dm-mc-sheetHead"><span class="dm-mc-sheetTitle">' + esc(title) + '</span>' +
      '<button class="dm-mc-btn" type="button" aria-label="关闭" data-dm-mc-sheet-close="1">✕</button></div>';
  }

  function sheetFooter(label) {
    return '<div class="dm-mc-sheetActions">' +
      '<button class="dm-cfg-save" type="button" data-dm-mc-save="1"' + (busy ? ' disabled' : '') + '>' + esc(busy ? '保存中…' : label || '保存') + '</button>' +
      '</div>';
  }

  // 每个页签自己的「取消 / 保存」：取消只是关面板，保存成功后由 settleSave 关面板并刷新。
  function sheetFooterRow(label) {
    return '<div class="dm-mc-sheetActions">' +
      '<button class="dm-mc-btn" type="button" data-dm-mc-sheet-close="1">取消</button>' +
      (label === null || label === undefined ? '' :
        '<button class="dm-cfg-save" type="button" data-dm-mc-save="1"' + (busy ? ' disabled' : '') + '>' +
        esc(busy ? '保存中…' : label) + '</button>') +
      '</div>';
  }

  function catalogChoices() {
    if (!data || !Array.isArray(data.catalog)) return [];
    var configured = {};
    (data.providers || []).forEach(function (item) { if (item.configured) configured[item.provider] = true; });
    return data.catalog.filter(function (item) { return !configured[item.provider]; });
  }

  // ── 添加面板：两段式切换（第三方目录 / 自定义 API）─────────────────────
  // 两个页签共用一个面板：切走前把输入存进 sheet.draft[tab]，切回来再填回去，
  // 所以「填一半 → 切走 → 切回」不会丢内容。
  var ADD_THIRD_HINT = '从内置目录中选择 OpenAI、Anthropic、Kimi 等提供商，填入其 API 密钥即可使用。';
  var ADD_CUSTOM_HINT = '连接中转站、自部署服务或其他兼容 OpenAI / Anthropic 协议的接口，需填写 API 地址、协议和模型。';

  function addDraftOf(tab) {
    if (!sheet || sheet.kind !== 'add') return {};
    if (!sheet.draft || typeof sheet.draft !== 'object') sheet.draft = {};
    if (!sheet.draft[tab] || typeof sheet.draft[tab] !== 'object') sheet.draft[tab] = {};
    return sheet.draft[tab];
  }

  function captureAddDraft() {
    if (!sheet || sheet.kind !== 'add') return;
    if (sheet.tab === 'custom') {
      var custom = addDraftOf('custom');
      custom.route = readField('route');
      custom.displayName = readField('displayName');
      custom.api = readField('api');
      custom.baseURL = readField('baseURL');
      custom.key = readField('key');
      custom.modelsText = readField('models');
    } else if (sheet.picked) {
      var third = addDraftOf('third');
      third.displayName = readField('displayName');
      third.api = readField('api');
      third.baseURL = readField('baseURL');
      third.key = readField('key');
    }
  }

  function addSegHtml() {
    var tab = sheet.tab === 'custom' ? 'custom' : 'third';
    var seg = function (value, label) {
      return '<button class="dm-mc-segBtn' + (tab === value ? ' is-on' : '') + '" type="button" role="tab"' +
        ' aria-selected="' + (tab === value ? 'true' : 'false') + '" data-dm-mc-tab="' + value + '">' + label + '</button>';
    };
    return '<div class="dm-mc-seg" role="tablist" aria-label="添加方式">' +
      seg('third', '第三方模型提供商') + seg('custom', '自定义模型 API') + '</div>';
  }

  function addThirdListHtml(query) {
    var choices = catalogChoices().filter(function (item) {
      return query === '' || String(item.provider + ' ' + (item.displayName || '')).toLowerCase().indexOf(query) >= 0;
    });
    var html = '<p class="dm-cfg-hint dm-mc-addHint">' + ADD_THIRD_HINT + '</p>' +
      '<input class="dm-cfg-input dm-mc-search" type="search" placeholder="搜索提供商目录" data-dm-mc-catsearch="1" value="' + esc(query) + '">' +
      '<div class="dm-mc-list" data-dm-mc-catlist="1">';
    if (choices.length === 0) {
      html += '<p class="dm-cfg-hint">' + (query === '' ? '目录中的提供商都已添加。' : '没有匹配的提供商。') + '</p>';
    } else {
      for (var i = 0; i < choices.length; i++) {
        var entry = choices[i];
        html += '<button class="dm-mc-listItem" type="button" data-dm-mc-cat="' + esc(entry.provider) + '">' +
          '<span class="dm-mc-listName">' + esc(entry.displayName || entry.provider) + '</span>' +
          '<span class="dm-mc-listSub">' + esc(entry.provider) + (entry.defaultBaseURL ? ' · ' + esc(entry.defaultBaseURL) : '') + '</span></button>';
      }
    }
    html += '</div>' + sheetFooterRow(null);
    return html;
  }

  function addThirdFormHtml() {
    var third = addDraftOf('third');
    var catalogEntry = null;
    (data.catalog || []).forEach(function (entry) { if (entry.provider === sheet.picked) catalogEntry = entry; });
    return '<p class="dm-cfg-hint dm-mc-addHint">' + ADD_THIRD_HINT + '</p>' +
      '<div class="dm-mc-picked"><span class="dm-mc-pickedName">' +
      esc((catalogEntry && (catalogEntry.displayName || catalogEntry.provider)) || sheet.picked) +
      '</span><button class="dm-mc-btn" type="button" data-dm-mc-backlist="1">重新选择</button></div>' +
      fieldHtml('Provider ID', 'route', sheet.picked, { disabled: true }) +
      fieldHtml('显示名称', 'displayName', third.displayName || '', { placeholder: '留空使用默认名称' }) +
      fieldHtml('API 地址', 'baseURL', third.baseURL || ((catalogEntry && catalogEntry.defaultBaseURL) || ''), { placeholder: 'https://gateway.example/v1', hint: '含 API 前缀；程序会按协议追加路径。' }) +
      fieldHtml('API 协议', 'api', third.api || 'openai-completions', {
        select: [
          { value: 'openai-completions', label: 'openai-completions（OpenAI 兼容 /chat/completions）' },
          { value: 'openai-responses', label: 'openai-responses（OpenAI Responses）' },
          { value: 'anthropic-messages', label: 'anthropic-messages（Anthropic Messages）' },
        ],
      }) +
      fieldHtml('API Key', 'key', third.key || '', { type: 'password', placeholder: '输入 API 密钥（可留空，之后用编辑补）' }) +
      sheetErrorHtml() + sheetFooterRow('保存');
  }

  function addCustomFormHtml() {
    var custom = addDraftOf('custom');
    return '<p class="dm-cfg-hint dm-mc-addHint">' + ADD_CUSTOM_HINT + '</p>' +
      fieldHtml('Provider ID', 'route', custom.route || '', { placeholder: '例如 my-gateway', hint: '以小写字母开头的标识，在请求中唯一标识该提供商，并用于派生凭据名。' }) +
      fieldHtml('显示名称', 'displayName', custom.displayName || '', { placeholder: '留空使用默认名称' }) +
      fieldHtml('API 地址', 'baseURL', custom.baseURL || '', { placeholder: 'https://gateway.example/v1' }) +
      fieldHtml('API 协议', 'api', custom.api || 'openai-completions', {
        select: [
          { value: 'openai-completions', label: 'openai-completions（OpenAI 兼容 /chat/completions）' },
          { value: 'openai-responses', label: 'openai-responses（OpenAI Responses）' },
          { value: 'anthropic-messages', label: 'anthropic-messages（Anthropic Messages）' },
        ],
      }) +
      fieldHtml('API Key', 'key', custom.key || '', { type: 'password', placeholder: '输入 API 密钥' }) +
      fieldHtml('模型目录（每行一个，可写 id=显示名）', 'models', custom.modelsText || '', { textarea: true, rows: 5, placeholder: 'gpt-4o' }) +
      sheetErrorHtml() + sheetFooterRow('创建提供商');
  }

  function renderSheet() {
    var host = sheetHost();
    if (!sheet) {
      host.hidden = true;
      host.innerHTML = '';
      return;
    }
    host.hidden = false;
    var body = '';
    if (sheet.kind === 'add') {
      body = sheetHeader('添加模型提供商') + addSegHtml() +
        (sheet.tab === 'custom'
          ? addCustomFormHtml()
          : (sheet.picked ? addThirdFormHtml() : addThirdListHtml(String(sheet.query || '').toLowerCase())));
    } else if (sheet.kind === 'catalog') {
      var query = String(sheet.query || '').toLowerCase();
      var choices = catalogChoices().filter(function (item) {
        if (query === '') return true;
        return String(item.provider + ' ' + (item.displayName || '')).toLowerCase().indexOf(query) >= 0;
      });
      body = sheetHeader('添加模型提供商') +
        '<p class="dm-cfg-hint">第三方模型提供商：从内置目录中选择 OpenAI、Anthropic、Kimi 等，填入 API 密钥即可使用。</p>' +
        '<input class="dm-cfg-input dm-mc-search" type="search" placeholder="搜索提供商目录" data-dm-mc-catsearch="1" value="' + esc(sheet.query || '') + '">' +
        '<div class="dm-mc-list" data-dm-mc-catlist="1">';
      if (choices.length === 0) {
        body += '<p class="dm-cfg-hint">' + (query === '' ? '目录中的提供商都已添加。' : '没有匹配的提供商。') + '</p>';
      } else {
        for (var i = 0; i < choices.length; i++) {
          var entry = choices[i];
          body += '<button class="dm-mc-listItem" type="button" data-dm-mc-cat="' + esc(entry.provider) + '">' +
            '<span class="dm-mc-listName">' + esc(entry.displayName || entry.provider) + '</span>' +
            '<span class="dm-mc-listSub">' + esc(entry.provider) + (entry.defaultBaseURL ? ' · ' + esc(entry.defaultBaseURL) : '') + '</span>' +
            '</button>';
        }
      }
      body += '</div>' +
        '<button class="dm-mc-btn dm-mc-customBtn" type="button" data-dm-mc-custom="1">自定义模型 API（baseURL + 协议 + 模型 + 密钥）</button>' +
        sheetErrorHtml();
    } else if (sheet.kind === 'provider') {
      var mode = sheet.mode;
      var isEdit = mode === 'edit';
      var title = isEdit ? '编辑 ' + (sheet.route || '') : (mode === 'catalog' ? '添加 ' + (sheet.displayName || sheet.route || '') : '自定义模型 API');
      body = sheetHeader(title);
      if (isEdit) {
        body += fieldHtml('Provider ID', 'route', sheet.route, { disabled: true, hint: 'Provider ID 不可修改' });
      } else if (mode === 'custom') {
        body += fieldHtml('Provider ID', 'route', sheet.route || '', { placeholder: '例如 my-gateway', hint: '以小写字母开头的标识，用于派生凭据名；规则 ^[a-z][a-z0-9]*(-[a-z0-9]+)*$' });
      } else {
        body += fieldHtml('Provider ID', 'route', sheet.route, { disabled: true });
      }
      body += fieldHtml('显示名称', 'displayName', sheet.displayName || '', { placeholder: '留空使用默认名称' });
      body += fieldHtml('API 协议', 'api', sheet.api || 'openai-completions', {
        select: [
          { value: 'openai-completions', label: 'openai-completions（OpenAI 兼容 /chat/completions）' },
          { value: 'openai-responses', label: 'openai-responses（OpenAI Responses）' },
          { value: 'anthropic-messages', label: 'anthropic-messages（Anthropic Messages）' },
        ],
      });
      body += fieldHtml('API 地址', 'baseURL', sheet.baseURL || '', { placeholder: 'https://gateway.example/v1', hint: '含 API 前缀的地址；程序会按协议追加 /chat/completions、/responses 或 /messages。' });
      body += fieldHtml('模型（每行一个，可写 id=显示名）', 'models', sheet.modelsText || '', { textarea: true, rows: 5, placeholder: 'gpt-4o\\nclaude-3-5-sonnet=Claude 3.5 Sonnet' });
      body += fieldHtml('API Key', 'key', '', { type: 'password', placeholder: sheet.keyConfigured ? '已配置；留空表示保持当前密钥' : '输入 API 密钥' });
      body += sheetErrorHtml() + sheetFooter();
    } else if (sheet.kind === 'key') {
      var item = providerOf(sheet.route);
      body = sheetHeader('替换 API Key') +
        '<p class="dm-cfg-hint">' + esc(item ? (item.displayName || item.provider) : sheet.route) + ' · 凭据引用 ' + esc(sheet.ref || '') + '</p>' +
        fieldHtml('API Key', 'key', '', { type: 'password', placeholder: sheet.configured ? '已配置；留空表示不修改' : '输入 API 密钥' }) +
        '<p class="dm-cfg-hint">密钥只写入宿主凭据库，不回显，也不写进设置文件。</p>' +
        sheetErrorHtml() + sheetFooter('保存密钥');
    } else if (sheet.kind === 'default') {
      var choicesProviders = (data.providers || []).filter(function (item) { return (item.models || []).length > 0; });
      body = sheetHeader('默认模型') +
        fieldHtml('提供商', 'provider', sheet.provider || (data.defaultModel ? data.defaultModel.provider : ''), {
          select: choicesProviders.map(function (item) { return { value: item.provider, label: item.displayName || item.provider }; }),
        }) +
        fieldHtml('模型', 'model', sheet.model || (data.defaultModel ? data.defaultModel.model : ''), {
          select: (function () {
            var item = providerOf(sheet.provider || (data.defaultModel ? data.defaultModel.provider : ''));
            return (item && item.models ? item.models : []).map(function (model) { return { value: model.id, label: model.name || model.id }; });
          })(),
        }) +
        fieldHtml('推理强度', 'reasoningEffort', sheet.reasoningEffort || (data.defaultModel && data.defaultModel.reasoningEffort) || '', {
          select: [
            { value: '', label: '默认（不指定）' },
            { value: 'off', label: 'off' },
            { value: 'low', label: 'low' },
            { value: 'medium', label: 'medium' },
            { value: 'high', label: 'high' },
            { value: 'xhigh', label: 'xhigh' },
            { value: 'max', label: 'max' },
          ],
        }) +
        sheetErrorHtml() + sheetFooterRow('应用默认模型');
    } else if (sheet.kind === 'delete') {
      var target = providerOf(sheet.route);
      body = sheetHeader('删除 ' + (target ? target.displayName || target.provider : sheet.route) + '？') +
        '<p class="dm-cfg-hint">删除会移除该提供商的配置' +
        (sheet.removeKey ? '和存储的 API 密钥' : '；其使用的凭证由其他位置管理，将会保留') + '。</p>' +
        (sheet.removeKey ? '<label class="dm-mc-check"><input type="checkbox" data-dm-mc-removekey="1" checked> 同时删除存储的 API 密钥</label>' : '') +
        sheetErrorHtml() +
        '<div class="dm-mc-sheetActions"><button class="dm-mc-btn" type="button" data-dm-mc-sheet-close="1">取消</button>' +
        '<button class="dm-mc-btn is-danger" type="button" data-dm-mc-confirm-delete="1"' + (busy ? ' disabled' : '') + '>' + esc(busy ? '删除中…' : '删除') + '</button></div>';
    }
    host.innerHTML = '<div class="dm-mc-mask" data-dm-mc-mask="1"></div><div class="dm-mc-sheet">' + body + '</div>';
  }

  function openSheet(next) {
    sheet = next;
    sheet.error = null;
    busy = false;
    renderSheet();
  }
  function closeSheet() {
    sheet = null;
    busy = false;
    renderSheet();
  }

  function readField(name) {
    var el = PAGE.querySelector('[data-dm-mc-field="' + name + '"]');
    return el ? String(el.value == null ? '' : el.value) : '';
  }

  function parseModelsText(text) {
    var out = [];
    var lines = String(text || '').split('\\n');
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (line === '') continue;
      var idx = line.indexOf('=');
      if (idx > 0) out.push({ id: line.slice(0, idx).trim(), name: line.slice(idx + 1).trim() });
      else out.push({ id: line });
    }
    return out;
  }

  function modelsTextOf(list) {
    return (Array.isArray(list) ? list : []).map(function (model) {
      return model.name && model.name !== model.id ? model.id + '=' + model.name : model.id;
    }).join('\\n');
  }


  // 写配置会触发 Loader 应用：本插件连接可能断一次。所以保存后一律重取宿主状态，
  // 以「目标效果是否真的出现」判定成功，而不是把网络错误当失败。
  function refetchModels(attempt) {
    var tries = attempt || 0;
    return rpc('mobile.modelsCenter.get').then(function (result) {
      return result && result.ok === true ? result.value : null;
    }).catch(function () {
      if (tries >= 9) return null;
      return new Promise(function (resolve) { setTimeout(resolve, 700); }).then(function () { return refetchModels(tries + 1); });
    });
  }

  function intentLanded(page, intent) {
    if (!page || page.available !== true) return false;
    var providers = Array.isArray(page.providers) ? page.providers : [];
    var find = function (route) {
      for (var i = 0; i < providers.length; i++) if (providers[i].provider === route) return providers[i];
      return null;
    };
    if (intent.kind === 'key') {
      var owner = null;
      for (var i = 0; i < providers.length; i++) if (providers[i].apiKeyRef === intent.ref) owner = providers[i];
      return !!(owner && owner.credential && owner.credential.configured === true);
    }
    if (intent.kind === 'default') {
      return !!(page.defaultModel && page.defaultModel.provider === intent.provider && page.defaultModel.model === intent.model);
    }
    if (intent.kind === 'provider') {
      var item = find(intent.route);
      if (!item || item.configured !== true) return false;
      if (intent.key === true && (!item.credential || item.credential.configured !== true)) return false;
      return true;
    }
    if (intent.kind === 'remove') {
      var gone = find(intent.route);
      return !(gone && gone.configured === true);
    }
    return false;
  }

  function settleSave(intent, result, error, onSettled) {
    refetchModels().then(function (fresh) {
      busy = false;
      if (fresh) data = fresh;
      var landed = intentLanded(data, intent);
      var message = error
        ? String((error && error.message) || error)
        : ((result && result.ok !== true && result.error && result.error.message) || null);
      if (onSettled !== undefined) { onSettled(landed, message, result); return; }
      if (landed) {
        var mismatches = (result && result.value && Array.isArray(result.value.mismatches)) ? result.value.mismatches : [];
        sheet = null;
        render();
        if (mismatches.length > 0) setStatus('err', '已提交，但宿主回读不一致：' + mismatches.map(function (item) { return item.field; }).join('、'));
        else setStatus('ok', message ? '已保存并应用到宿主（写入时连接中断一次，回读已确认）。' : '已保存并应用到宿主（回读已确认）。');
      } else {
        if (sheet) sheet.error = message || '宿主没有返回保存结果，且回读未看到目标值';
        render();
        setStatus('err', '保存失败：' + (message || '回读未看到目标值'));
      }
    });
  }

  function submitSheet() {
    if (busy || !sheet) return;
    var action = '';
    var payload = {};
    if (sheet.kind === 'key') {
      var key = readField('key');
      if (key === '') { sheet.error = '请输入 API Key'; renderSheet(); return; }
      action = 'setKey';
      payload = { action: action, ref: sheet.ref, value: key };
    } else if (sheet.kind === 'default') {
      action = 'setDefaultModel';
      payload = { action: action, provider: readField('provider'), model: readField('model'), reasoningEffort: readField('reasoningEffort') };
      if (payload.model === '') { sheet.error = '请选择模型'; renderSheet(); return; }
    } else if (sheet.kind === 'add') {
      captureAddDraft();
      action = 'saveProvider';
      if (sheet.tab === 'custom') {
        var customDraft = addDraftOf('custom');
        payload = {
          action: action, mode: 'custom', route: String(customDraft.route || ''),
          displayName: String(customDraft.displayName || ''), api: String(customDraft.api || ''),
          baseURL: String(customDraft.baseURL || ''), models: parseModelsText(String(customDraft.modelsText || '')),
          key: String(customDraft.key || ''),
        };
      } else if (sheet.picked) {
        var thirdDraft = addDraftOf('third');
        payload = {
          action: action, mode: 'catalog', route: sheet.picked,
          displayName: String(thirdDraft.displayName || ''), api: String(thirdDraft.api || ''),
          baseURL: String(thirdDraft.baseURL || ''), key: String(thirdDraft.key || ''),
        };
        if (payload.baseURL === '') delete payload.baseURL;
      } else {
        sheet.error = '请先从目录中选择一个提供商，或切到「自定义模型 API」';
        renderSheet();
        return;
      }
    } else if (sheet.kind === 'provider') {
      action = 'saveProvider';
      payload = {
        action: action,
        mode: sheet.mode,
        route: sheet.mode === 'custom' ? readField('route') : sheet.route,
        displayName: readField('displayName'),
        api: readField('api'),
        baseURL: readField('baseURL'),
        models: parseModelsText(readField('models')),
        key: readField('key'),
      };
      if (sheet.mode === 'catalog') {
        // 目录提供商沿用内置地址/协议/模型，不强制填模型清单。
        if (payload.baseURL === '') delete payload.baseURL;
        if (payload.api === '') delete payload.api;
        if (payload.models.length === 0) delete payload.models;
      }
    } else if (sheet.kind === 'delete') {
      if (busy) return;
      busy = true;
      renderSheet();
      var removeKeyEl = PAGE.querySelector('[data-dm-mc-removekey]');
      var removeIntent = { kind: 'remove', route: sheet.route };
      rpc('mobile.modelsCenter.save', { action: 'removeProvider', route: sheet.route, removeKey: !!(removeKeyEl && removeKeyEl.checked) }).then(function (result) {
        settleSave(removeIntent, result, null);
      }).catch(function (err) {
        settleSave(removeIntent, null, err);
      });
      return;
    }
    busy = true;
    sheet.error = null;
    renderSheet();
    var intent = sheet.kind === 'key'
      ? { kind: 'key', ref: payload.ref }
      : sheet.kind === 'default'
        ? { kind: 'default', provider: payload.provider, model: payload.model }
        : { kind: 'provider', route: payload.route, key: payload.key !== '' };
    rpc('mobile.modelsCenter.save', payload).then(function (result) {
      settleSave(intent, result, null);
    }).catch(function (err) {
      settleSave(intent, null, err);
    });
  }

  // ── 事件 ────────────────────────────────────────────────────────────────
  PAGE.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || !target.closest) return;
    if (target.closest('[data-dm-mc-back]')) { event.preventDefault(); closeModelsPage(false); return; }
    if (target.closest('[data-dm-mc-refresh]') || target.closest('[data-dm-mc-retry]')) { event.preventDefault(); load(); return; }
    if (target.closest('[data-dm-mc-sheet-close]') || target.closest('[data-dm-mc-mask]')) { event.preventDefault(); closeSheet(); return; }
    if (target.closest('[data-dm-mc-add]')) {
      event.preventDefault();
      openForm = null;
      sheet = { kind: 'add', tab: 'third', query: '', error: null, picked: null, draft: { custom: {}, third: {} } };
      renderSheet();
      return;
    }
    var tabBtn = target.closest('[data-dm-mc-tab]');
    if (tabBtn) {
      event.preventDefault();
      if (!sheet || sheet.kind !== 'add') return;
      captureAddDraft();
      sheet.tab = tabBtn.getAttribute('data-dm-mc-tab') === 'custom' ? 'custom' : 'third';
      renderSheet();
      return;
    }
    if (target.closest('[data-dm-mc-backlist]')) {
      event.preventDefault();
      if (sheet && sheet.kind === 'add') { captureAddDraft(); sheet.picked = null; renderSheet(); }
      return;
    }
    if (target.closest('[data-dm-mc-custom]')) {
      event.preventDefault();
      if (sheet && sheet.kind === 'add') { captureAddDraft(); sheet.tab = 'custom'; renderSheet(); }
      return;
    }
    var cat = target.closest('[data-dm-mc-cat]');
    if (cat) {
      event.preventDefault();
      if (!sheet || sheet.kind !== 'add') return;
      captureAddDraft();
      var pickedRoute = cat.getAttribute('data-dm-mc-cat');
      var catalogEntry = null;
      (data.catalog || []).forEach(function (item) { if (item.provider === pickedRoute) catalogEntry = item; });
      sheet.tab = 'third';
      sheet.picked = pickedRoute;
      var thirdDraft = addDraftOf('third');
      thirdDraft.displayName = catalogEntry && catalogEntry.displayName ? catalogEntry.displayName : pickedRoute;
      thirdDraft.api = 'openai-completions';
      thirdDraft.baseURL = catalogEntry && catalogEntry.defaultBaseURL ? catalogEntry.defaultBaseURL : '';
      thirdDraft.key = '';
      renderSheet();
      return;
    }
    var edit = target.closest('[data-dm-mc-edit]');
    if (edit) {
      event.preventDefault();
      var editRoute = edit.getAttribute('data-dm-mc-edit');
      if (openForm && openForm.route === editRoute && openForm.kind === 'edit') openForm = null;
      else openForm = { kind: 'edit', route: editRoute, error: null, draft: {} };
      sheet = null;
      renderSheet();
      render();
      return;
    }
    var keyBtn = target.closest('[data-dm-mc-key]');
    if (keyBtn) {
      event.preventDefault();
      var keyRoute = keyBtn.getAttribute('data-dm-mc-key');
      if (openForm && openForm.route === keyRoute && openForm.kind === 'key') openForm = null;
      else openForm = { kind: 'key', route: keyRoute, error: null, draft: {} };
      sheet = null;
      renderSheet();
      render();
      return;
    }
    if (target.closest('[data-dm-mc-inline-cancel]')) { event.preventDefault(); openForm = null; render(); return; }
    if (target.closest('[data-dm-mc-inline-save]')) { event.preventDefault(); submitInline(); return; }
    var remove = target.closest('[data-dm-mc-remove]');
    if (remove) {
      event.preventDefault();
      var removeItem = providerOf(remove.getAttribute('data-dm-mc-remove'));
      openSheet({ kind: 'delete', route: remove.getAttribute('data-dm-mc-remove'), removeKey: !!(removeItem && removeItem.apiKeyRef && removeItem.apiKeyRef === String(removeItem.provider).toUpperCase().replace(/[^A-Z0-9]+/g, '_') + '_API_KEY') });
      return;
    }
    if (target.closest('[data-dm-mc-default-edit]')) {
      event.preventDefault();
      openSheet({
        kind: 'default',
        provider: data.defaultModel ? data.defaultModel.provider : '',
        model: data.defaultModel ? data.defaultModel.model : '',
        reasoningEffort: data.defaultModel ? data.defaultModel.reasoningEffort : '',
      });
      return;
    }
    if (target.closest('[data-dm-mc-save]')) { event.preventDefault(); submitSheet(); return; }
    if (target.closest('[data-dm-mc-confirm-delete]')) { event.preventDefault(); submitSheet(); }
  });

  PAGE.addEventListener('input', function (event) {
    var target = event.target;
    if (!target || !target.getAttribute) return;
    if (target.getAttribute('data-dm-mc-catsearch') !== null && sheet && (sheet.kind === 'add' || sheet.kind === 'catalog')) {
      sheet.query = String(target.value || '');
      var list = PAGE.querySelector('[data-dm-mc-catlist]');
      if (!list) return;
      var query = sheet.query.toLowerCase();
      var choices = catalogChoices().filter(function (item) {
        if (query === '') return true;
        return String(item.provider + ' ' + (item.displayName || '')).toLowerCase().indexOf(query) >= 0;
      });
      var html = '';
      if (choices.length === 0) html = '<p class="dm-cfg-hint">没有匹配的提供商。</p>';
      else for (var i = 0; i < choices.length; i++) {
        var entry = choices[i];
        html += '<button class="dm-mc-listItem" type="button" data-dm-mc-cat="' + esc(entry.provider) + '">' +
          '<span class="dm-mc-listName">' + esc(entry.displayName || entry.provider) + '</span>' +
          '<span class="dm-mc-listSub">' + esc(entry.provider) + (entry.defaultBaseURL ? ' · ' + esc(entry.defaultBaseURL) : '') + '</span>' +
          '</button>';
      }
      list.innerHTML = html;
    }
  });

  PAGE.addEventListener('change', function (event) {
    var target = event.target;
    if (!target || !target.getAttribute) return;
    if (target.getAttribute('data-dm-mc-field') === 'provider' && sheet && sheet.kind === 'default') {
      sheet.provider = String(target.value || '');
      var item = providerOf(sheet.provider);
      sheet.model = item && item.models && item.models[0] ? item.models[0].id : '';
      renderSheet();
    }
  });

  function load() {
    var nonce = ++loadNonce;
    loading = true;
    errorText = null;
    setStatus(null, '');
    renderState('读取宿主模型目录…', 'dm-page-loading');
    rpc('mobile.modelsCenter.get').then(function (result) {
      if (nonce !== loadNonce || !opened) return;
      loading = false;
      if (!result || result.ok !== true) {
        errorText = (result && result.error && result.error.message) || '宿主没有返回模型数据';
        renderState('读取失败：' + errorText, 'dm-page-error', true);
        return;
      }
      data = result.value;
      render();
    }).catch(function (err) {
      if (nonce !== loadNonce || !opened) return;
      loading = false;
      errorText = (err && err.message) || String(err);
      renderState('读取失败：' + errorText, 'dm-page-error', true);
    });
  }

  function openModelsPage() {
    if (opened) { load(); return; }
    opened = true;
    PAGE.hidden = false;
    if (TITLE) TITLE.textContent = '模型';
    try { history.pushState({ dmModels: 1 }, '', '#/dm-models'); } catch (e) {}
    renderState('加载中…', 'dm-page-loading');
    load();
  }

  function closeModelsPage(fromPop) {
    if (!opened) return;
    opened = false;
    sheet = null;
    renderSheet();
    PAGE.hidden = true;
    if (!fromPop) { try { history.back(); } catch (e) {} }
  }

  window.addEventListener('popstate', function (event) {
    var stateValue = event && event.state;
    if (opened && (!stateValue || stateValue.dmModels !== 1)) closeModelsPage(true);
  });

  // 只拦「主机配置」组里标题为「模型」的那一行；其它行/其它分组不碰。
  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || !target.closest) return;
    var row = target.closest('.mobile-row');
    if (!row) return;
    var group = row.closest('.settings-group');
    if (!group) return;
    var groupTitle = group.querySelector('.settings-groupTitle');
    if (!groupTitle || String(groupTitle.textContent || '').indexOf(GROUP_TITLE) !== 0) return;
    var titleEl = row.querySelector('.card-titleText');
    if (String(titleEl && titleEl.textContent ? titleEl.textContent : '').trim() !== KEEP_ROW) return;
    event.preventDefault();
    event.stopPropagation();
    openModelsPage();
  }, true);

  window.__dmModelsPage = {
    open: openModelsPage,
    close: closeModelsPage,
    refresh: load,
    state: function () {
      return {
        opened: opened,
        loading: loading,
        error: errorText,
        hideHits: hideHits,
        sheet: sheet ? { kind: sheet.kind, route: sheet.route || null, mode: sheet.mode || null, error: sheet.error || null } : null,
        visibleRows: (function () {
          var group = settingsGroup();
          if (!group) return null;
          var out = [];
          var rows = group.querySelectorAll(':scope > li');
          for (var i = 0; i < rows.length; i++) {
            var button = rows[i].querySelector('.mobile-row');
            if (!button) continue;
            if (rows[i].style.display === 'none') continue;
            var titleEl = button.querySelector('.mobile-row .card-titleText') || button.querySelector('.card-titleText');
            out.push(String(titleEl && titleEl.textContent ? titleEl.textContent : '').trim());
          }
          return out;
        })(),
        data: data ? { available: data.available, counts: data.counts, account: data.account, defaultModel: data.defaultModel } : null,
      };
    },
  };
})();
</script>`

// ── 设置页：范围标签（本机 / 同步桌面 / 桌面端）+ 用量行 + 两处清理 ────────
// 1) 每个设置行标题后补一个范围徽标，复用 bundle 自己的 .settings-badge-*
//    （与顶部 .settings-legend 完全同色同规格）；bundle 的「只读」红徽标
//    （settings-badge-ro）原地改成「桌面端」灰徽标，sync 保留不叠加。
//    「本机」= 只写 localStorage / 只影响手机；「同步桌面」= 写宿主并影响桌面；
//    「桌面端」= 手机只读。逐项判定依据见交付报告（每项都核实过读写落点）。
// 2) 「用量」不再单独成组、不再自动展开成余额卡：改成一行的入口（放在
//    「主机配置」组里，与「模型」并列），右侧显示当前余额，点开是我们自绘的
//    用量详情页（dm-page 壳 + 刷新），数据仍来自宿主 RPC mobile.usage。
// 3) 「关于」页清空项目介绍（保留版本号、检查更新、依赖自检）；
//    「反馈与建议」不再指向别人的仓库：地址改由插件 config.githubUrl 提供，
//    未配置时只 toast「GitHub 地址待填写」，点击不会打开任何链接。
const SETTINGS_SCOPE_HTML = `<script>
(function () {
  try {
    if (window.__dmSettingsScope) return;
    window.__dmSettingsScope = true;

    // ── 设置项范围标签（本机 / 同步桌面 / 桌面端）──────────────────────────
    // 判定依据见报告：按「值存在哪、桌面端会不会跟着变、手机能不能改」三项核实，
    // 逐行写死映射（标题即稳定锚点；bundle 的标题是硬编码中文）。
    //   phone   → localStorage / 仅手机行为
    //   sync    → 写宿主（profile config / settings namespace / 宿主 JSON）且桌面端共享
    //   desktop → 手机只读，只能去桌面端看/改
    var SCOPE_OF = {
      // 外观（全部 localStorage）
      '主题': 'phone',
      '字体大小': 'phone',
      '消息密度': 'phone',
      '代码块行号': 'phone',
      // 对话：自动滚动/震动 localStorage；发送模式写宿主 JSON 但只被手机发消息读取
      '自动滚动': 'phone',
      '震动': 'phone',
      '发送模式': 'phone',
      // 用量：RPC mobile.usage 只读（宿主查余额，没有写入口）
      '用量': 'desktop',
      // 通知子页走 push.config → 宿主 ~/.dsh/dsh-mobile-push.json
      '通知': 'sync',
      // 语音：手机端服务在 localStorage，桌面端已配置服务只读
      '语音服务': 'phone',
      // 设备：宿主 devices JSON，配对域，桌面无对应设置
      '设备管理': 'phone',
      // 主机配置（写 profile cordis.patch.yml → 桌面共享）
      '通用': 'sync',
      '模型': 'sync',
      '搜索': 'desktop',
      '记忆': 'desktop',
      '工具': 'sync',
      '系统': 'desktop',
      // 通用
      '清除缓存': 'phone',
      '反馈与建议': 'phone',
      '关于': 'desktop'
    };
    var LABEL = { phone: '本机', sync: '同步桌面', desktop: '桌面端' };
    var SCOPE_CLASS = 'settings-badge settings-badge-';

    function rowTitle(row) {
      var t = row.querySelector('.card-title > .card-titleText');
      if (!t) t = row.querySelector('.card-titleText');
      return t ? (t.textContent || '').replace(/\s+/g, ' ').trim() : '';
    }

    function makeBadge(scope) {
      var s = document.createElement('span');
      s.className = SCOPE_CLASS + scope;
      s.setAttribute('data-dm-scope', scope);
      s.textContent = LABEL[scope];
      return s;
    }

    // bundle 自带的「只读」红徽标（settings-badge-ro）原地改成「桌面端」灰徽标：
    // 只改同一个 DOM 节点的 class/文本，不 replaceChild —— React 手里握着该节点引用，
    // 换节点会让它在卸载时 removeChild 一个已不存在的子节点而报错。
    function normalizeRo(node) {
      if (!node || !node.classList) return false;
      if (!node.classList.contains('settings-badge-ro')) return false;
      node.className = SCOPE_CLASS + 'desktop';
      node.textContent = LABEL.desktop;
      node.setAttribute('data-dm-scope', 'desktop');
      return true;
    }

    function applyRow(row) {
      var title = rowTitle(row);
      var scope = SCOPE_OF[title];
      if (!scope) return false;
      var box = row.querySelector('.card-title');
      if (!box) return false;

      // 先归一化 bundle 的只读徽标（主机配置里「搜索/系统」这类整行只读）
      var ro = box.querySelector('.settings-badge-ro');
      if (ro) normalizeRo(ro);

      // 清理可能重复的「我们加的」徽标（React 重挂后可能留下孤儿）
      var ours = box.querySelectorAll('[data-dm-scope]');
      if (ours.length > 1) {
        for (var i = 1; i < ours.length; i++) {
          if (ours[i].parentNode) ours[i].parentNode.removeChild(ours[i]);
        }
      }
      if (ours.length > 0) {
        var mine = box.querySelector('[data-dm-scope]');
        if (mine.getAttribute('data-dm-scope') !== scope) {
          // 映射改了（例如 bundle 自己变成 desktop）时以映射为准，保持同一节点
          mine.className = SCOPE_CLASS + scope;
          mine.setAttribute('data-dm-scope', scope);
          mine.textContent = LABEL[scope];
        }
        return true;
      }

      // bundle 已经渲染了范围徽标（sync）就不再叠加 —— 文字与三档语义一致
      if (box.querySelector('.settings-badge-sync, .settings-badge-phone, .settings-badge-desktop')) return true;

      box.appendChild(makeBadge(scope));
      return true;
    }

    // 用量在进入设置时会被注入脚本自动展开成 li.usage-card（没有行），标在卡片头。
    function applyUsageCard() {
      var card = document.querySelector('li.usage-card');
      if (!card) return;
      var head = card.querySelector('.usage-providerHead') || card;
      if (head.querySelector('[data-dm-scope]')) return;
      var name = head.querySelector('.usage-providerName');
      var badge = makeBadge('desktop');
      if (name && name.parentNode === head && name.nextSibling) head.insertBefore(badge, name.nextSibling);
      else head.appendChild(badge);
    }

    // ── 「关于」页：清空项目介绍，只保留版本号 ─────────────────────────────
    // bundle 里那段是：「掌上 DSH（dsh-palm）· 版本 X」 + <br> + 「DSH 移动端界面：…」。
    // 用户要求清空项目介绍、保留版本号与「检查更新 / 依赖自检」。
    // 做法：整段 <p> 隐藏（不动 React 管理的文本节点，避免卸载时 removeChild 报错），
    // 在它前面插一行只含版本号的 <p class="sheet-confirm-desc">。
    function cleanAbout() {
      var sheets = document.querySelectorAll('.sheet[aria-label="关于"]');
      for (var i = 0; i < sheets.length; i++) {
        var body = sheets[i].querySelector('.sheet-body');
        if (!body) continue;
        // 已经插过版本行就跳过（否则会在自己的节点上反复处理，越插越多）
        if (body.querySelector('[data-dm-about-line]')) continue;
        var candidates = body.querySelectorAll('.sheet-confirm-desc');
        for (var j = 0; j < candidates.length; j++) {
          var p = candidates[j];
          if (p.hasAttribute('data-dm-about') || p.hasAttribute('data-dm-about-line')) continue;
          if ((p.textContent || '').indexOf('掌上 DSH') < 0) continue;
          var version = '';
          for (var n = p.firstChild; n; n = n.nextSibling) {
            if (n.nodeName === 'BR') break;
            version += n.textContent || '';
          }
          version = version.replace(/\s+$/, '');
          p.setAttribute('data-dm-about', '1');
          p.style.display = 'none';
          var line = document.createElement('p');
          line.className = 'sheet-confirm-desc dm-about-line';
          line.setAttribute('data-dm-about-line', '1');
          line.textContent = version;
          body.insertBefore(line, p);
          break;
        }
      }
    }

    // ── 「反馈与建议」：清空指向别人仓库的那句，地址改由插件 config.githubUrl 提供 ──
    // 未配置时 desc 清空、点击只弹 toast，绝不打开 dsh-palm 的仓库。
    var githubUrl = '';
    var prefsAsked = false;

    function toast(text) {
      try {
        var host = document.getElementById('dm-scope-toast');
        if (!host || !host.parentNode) {
          host = document.createElement('div');
          host.id = 'dm-scope-toast';
          host.className = 'toast-host';
          document.body.appendChild(host);
        }
        var item = document.createElement('div');
        item.className = 'toast';
        item.textContent = text;
        host.appendChild(item);
        window.setTimeout(function () {
          item.className = 'toast toast-out';
          window.setTimeout(function () {
            if (item.parentNode) item.parentNode.removeChild(item);
          }, 240);
        }, 2000);
      } catch (e) {}
    }

    function feedbackRow() {
      var rows = document.querySelectorAll('.settings-row');
      for (var i = 0; i < rows.length; i++) {
        var t = rows[i].querySelector('.card-titleText');
        if (t && (t.textContent || '').replace(/\s+/g, ' ').trim() === '反馈与建议') return rows[i];
      }
      return null;
    }

    function feedbackText() {
      return githubUrl === '' ? '' : '在 GitHub 反馈问题';
    }

    function paintFeedback() {
      var row = feedbackRow();
      if (!row) return;
      row.setAttribute('data-dm-feedback', githubUrl === '' ? 'pending' : 'ok');
      var desc = row.querySelector('.card-desc');
      if (!desc) return;
      var text = feedbackText();
      var first = desc.firstChild;
      // 只改文本节点的数据，不增删节点：React 手里握着的还是同一个 text node，卸载安全。
      if (first && first.nodeType === 3) {
        if (first.nodeValue !== text) first.nodeValue = text;
      } else if (desc.textContent !== text) {
        desc.textContent = text;
      }
      desc.style.display = text === '' ? 'none' : '';
    }

    function loadGithubUrl() {
      if (prefsAsked) return;
      prefsAsked = true;
      fetch('/m/api/mobile.preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rpcId: 'dm-scope-' + Date.now(), payload: {} })
      }).then(function (r) { return r.json(); }).then(function (j) {
        var v = j && j.result && j.result.ok ? j.result.value : null;
        if (v && typeof v.githubUrl === 'string') githubUrl = v.githubUrl.trim();
        paintFeedback();
      }).catch(function () {
        prefsAsked = false;
      });
    }

    // 捕获阶段拦截点击：bundle 的 onClick 会把 window.open 指向 dsh-palm 仓库，
    // 这里先拦下，未配置地址就只 toast；配置了才打开用户自己的地址。
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      // 被隐藏的独立「用量」分组里那行折叠行，会被 USAGE_INLINE_HTML 自动点击展开，
      // 展开后它还会每 5 秒点一次「刷新」去拉余额；这里把隐藏组内的点击拦掉。
      var hiddenGroup = t.closest('ul.settings-group');
      if (hiddenGroup && hiddenGroup.style.display === 'none') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      var row = t.closest('.settings-row');
      if (!row) return;
      var title = row.querySelector('.card-titleText');
      if (!title || (title.textContent || '').replace(/\s+/g, ' ').trim() !== '反馈与建议') return;
      e.preventDefault();
      e.stopPropagation();
      if (githubUrl === '') {
        toast('GitHub 地址待填写');
        return;
      }
      try {
        window.open(githubUrl, '_blank', 'noopener');
      } catch (err) {}
    }, true);

    // ── 用量：并进「主机配置」分组，点击进入独立详情页 ───────────────────────
    // 用户要求：不再单独成组、不再自动展开成余额卡；改成和「模型」并列的一行，
    // 右侧显示当前余额，点开是详情页（dm-page 壳，带刷新）。
    var USAGE_ICON = '<span class="card-icon"><span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="6.5" width="17" height="12" rx="3"/><path d="M3.5 10.6h17"/><path d="M15.7 14.3h1.6"/></svg></span></span>';
    var usageBusy = false;
    var usageView = null;
    var usageFetchedAt = 0;

    function esc(s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }
    function pad2(n) { return (n < 10 ? '0' : '') + n; }
    function fmtTime(ms) {
      var d = new Date(ms);
      if (isNaN(d.getTime())) return '';
      return (d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
    }

    function groupByTitle(prefix) {
      var uls = document.querySelectorAll('ul.settings-group');
      for (var i = 0; i < uls.length; i++) {
        var h = uls[i].querySelector('.settings-groupTitle');
        if (h && (h.textContent || '').replace(/\s+/g, ' ').trim().indexOf(prefix) === 0) return uls[i];
      }
      return null;
    }

    function ensureUsageRow() {
      var host = groupByTitle('主机配置');
      if (!host) return;
      // 独立的「用量 套餐与配额」分组（含组头）隐藏掉，合并进主机配置
      var standalone = groupByTitle('用量');
      if (standalone && standalone !== host) standalone.style.display = 'none';

      var row = document.getElementById('dm-usage-row');
      if (!row) {
        var li = document.createElement('li');
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'mobile-row';
        btn.id = 'dm-usage-row';
        // 「主机配置」组里只保留「模型」的过滤脚本（MODELS_CENTER_HTML）按这个标记放行，
        // 否则它每秒一次的过滤会把本行 display:none 掉。
        btn.setAttribute('data-dm-usage-row', '1');
        btn.innerHTML = USAGE_ICON +
          '<span class="card-main"><span class="card-title"><span class="card-titleText">用量</span></span>' +
          '<span class="card-desc">套餐与配额</span></span>' +
          '<span class="card-action"><span class="settings-rowValue" data-dm-usage-value>—</span>' +
          '<span class="mobile-chevron" aria-hidden="true">›</span></span>';
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          openUsagePage();
        });
        li.appendChild(btn);
        row = li;
      }
      if (row.parentNode !== host) {
        // 排在「模型」行后面（与宿主行同构：li > button.mobile-row）
        var modelLi = null;
        var buttons = host.querySelectorAll('button.mobile-row');
        for (var j = 0; j < buttons.length; j++) {
          var t = buttons[j].querySelector('.card-titleText');
          if (t && (t.textContent || '').trim() === '模型') { modelLi = buttons[j].parentNode; break; }
        }
        if (modelLi && modelLi.parentNode === host) host.insertBefore(row, modelLi.nextSibling);
        else host.appendChild(row);
      }
      loadUsage(false);
    }

    function usageSummary(view) {
      var providers = view && Array.isArray(view.providers) ? view.providers : [];
      for (var i = 0; i < providers.length; i++) {
        if (providers[i] && providers[i].status === 'ok' && typeof providers[i].balance === 'string') return providers[i].balance;
      }
      return providers.length === 0 ? '—' : '暂不可用';
    }

    function loadUsage(refresh) {
      if (usageBusy) return;
      // 防抖：ensure() 会被 MutationObserver + 500ms 兜底反复调用，这里保证
      // 非强制刷新时 30 秒内最多读一次（宿主侧另有 60s 缓存，不会更慢）。
      if (refresh !== true && usageFetchedAt !== 0 && Date.now() - usageFetchedAt < 30000) return;
      usageBusy = true;
      usageFetchedAt = Date.now();
      fetch('/m/api/mobile.usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rpcId: 'dm-usage-' + Date.now(), payload: refresh === true ? { refresh: true } : {} })
      }).then(function (r) { return r.json(); }).then(function (j) {
        usageBusy = false;
        if (!j || !j.result) return;
        if (!j.result.ok) {
          usageView = { error: (j.result.error && j.result.error.message) || '读取失败' };
        } else {
          usageView = j.result.value || {};
        }
        paintUsageRow();
        paintUsagePage();
      }).catch(function () {
        usageBusy = false;
        if (!usageView) usageView = { error: '网络异常，读取失败' };
        paintUsageRow();
        paintUsagePage();
      });
    }

    function paintUsageRow() {
      var el = document.querySelector('[data-dm-usage-value]');
      if (!el) return;
      el.textContent = usageView && usageView.error ? '—' : usageSummary(usageView);
    }

    function usagePage() {
      var page = document.getElementById('dm-page-usage');
      if (page) return page;
      page = document.createElement('section');
      page.id = 'dm-page-usage';
      page.className = 'dm-page dm-page-usage';
      page.setAttribute('hidden', '');
      page.setAttribute('aria-label', '用量');
      page.innerHTML =
        '<header class="dm-page-header">' +
        '<button class="dm-page-iconbtn" type="button" aria-label="返回设置" data-dm-usage-back="1"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>' +
        '<h1 class="dm-page-title">用量</h1>' +
        '<button class="dm-page-iconbtn" type="button" aria-label="刷新用量" data-dm-usage-refresh="1"><svg class="dm-page-refresh-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19.49 8.66A8.2 8.2 0 1 1 11.71 3.80"/><path d="M16.31 3.64L11.64 1.56L11.79 6.05Z" fill="currentColor" stroke="currentColor" stroke-width="0.55" stroke-linejoin="round"/></svg></button>' +
        '</header>' +
        '<div class="dm-page-body" data-dm-usage-body><p class="dm-page-state">加载中…</p></div>';
      document.body.appendChild(page);
      page.querySelector('[data-dm-usage-back]').addEventListener('click', function () {
        page.hidden = true;
      });
      page.querySelector('[data-dm-usage-refresh]').addEventListener('click', function () {
        var icon = page.querySelector('[data-dm-usage-refresh]');
        if (icon) icon.classList.add('dm-spinning');
        loadUsage(true);
        window.setTimeout(function () {
          if (icon) icon.classList.remove('dm-spinning');
        }, 900);
      });
      return page;
    }

    function paintUsagePage() {
      var page = document.getElementById('dm-page-usage');
      if (!page) return;
      var body = page.querySelector('[data-dm-usage-body]');
      if (!body) return;
      if (!usageView) {
        body.innerHTML = '<p class="dm-page-state">加载中…</p>';
        return;
      }
      if (usageView.error) {
        body.innerHTML = '<p class="dm-page-state">' + esc(usageView.error) + '</p>';
        return;
      }
      var providers = Array.isArray(usageView.providers) ? usageView.providers : [];
      if (providers.length === 0) {
        body.innerHTML = '<p class="dm-page-state">宿主没有返回任何用量提供方</p>';
        return;
      }
      var html = '<p class="dm-page-summary"><span>数据来自宿主 · 只读</span><span></span></p>';
      for (var i = 0; i < providers.length; i++) {
        var p = providers[i] || {};
        var state = p.status === 'ok' ? '可用' : (p.status === 'no-key' ? '未配置密钥' : '读取失败');
        html += '<div class="dm-page-row">' +
          '<div class="dm-page-rowTop"><span class="dm-page-rowName">' + esc(p.name || '用量') + '</span>' +
          '<span class="dm-page-badge">' + esc(p.kind === 'balance' ? '余额' : state) + '</span></div>' +
          (p.baseURL ? '<div class="dm-page-rowSub">' + esc(p.baseURL) + '</div>' : '') +
          '<div class="dm-page-rowMeta">' + esc(p.status === 'ok' && p.balance ? p.balance : state) + '</div>' +
          '</div>';
      }
      if (usageView.fetchedAt !== undefined) {
        html += '<p class="dm-page-summary"><span>更新时间 ' + esc(fmtTime(usageView.fetchedAt)) + '</span><span></span></p>';
      }
      body.innerHTML = html;
    }

    function openUsagePage() {
      var page = usagePage();
      page.hidden = false;
      paintUsagePage();
      if (!usageView || usageView.error) loadUsage(false);
    }

    function ensure() {
      // 只在设置页生效：.settings-legend 是 bundle 渲染图例的容器。
      if (!document.querySelector('.settings-legend')) {
        var pg = document.getElementById('dm-page-usage');
        if (pg && !pg.hidden) pg.hidden = true;
        return;
      }
      var rows = document.querySelectorAll('.settings-row, .mobile-row');
      for (var i = 0; i < rows.length; i++) applyRow(rows[i]);
      applyUsageCard();
      cleanAbout();
      loadGithubUrl();
      paintFeedback();
      ensureUsageRow();
    }

    var queued = false;
    function schedule() {
      if (queued) return;
      queued = true;
      window.setTimeout(function () { queued = false; ensure(); }, 60);
    }
    try {
      if (window.__dmMutationBus) window.__dmMutationBus.subscribe(schedule);
      else {
        var mo = new MutationObserver(schedule);
        mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
      }
    } catch (e) {}
    setInterval(ensure, 500);
    ensure();
  } catch (e) {}
})();
</script>`

// ── 「＋ 添加内容」面板只留附件动作 ────────────────────────────────────────
// bundle 把 mobile.commands 的命令也渲染进这个面板（/goal、/plan…）。用户要求
// 命令只出现在「/」面板，这里只保留「图片 / 拍照」。不改 mobile.commands RPC
// （那条数据同时喂「/」面板），只裁这个 menu 的 DOM。
const ADD_SHEET_FILTER_HTML = `
<script>
(function () {
  try {
    if (window.__dmAddSheetFilter) return;
    window.__dmAddSheetFilter = true;

    // 「＋ 添加内容」面板：bundle 把 mobile.commands 的命令也塞了进来（/goal、/plan…），
    // 用户要求这里只留附件相关（图片 / 拍照），命令只在「/」面板出现。
    // 注意：**不改 mobile.commands RPC** —— 那条数据同时喂「/」面板，改了就两边都没了。
    var MENU = '[role="menu"][aria-label="添加内容"]';

    function apply() {
      var menus = document.querySelectorAll(MENU);
      for (var i = 0; i < menus.length; i++) {
        var menu = menus[i];
        var opts = menu.querySelectorAll('.sheet-option');
        var hidden = 0;
        for (var j = 0; j < opts.length; j++) {
          var title = opts[j].querySelector('.sheet-option-title');
          var text = title ? String(title.textContent || '').replace(/^\s+/, '') : '';
          if (text.charAt(0) === '/') {
            if (opts[j].style.display !== 'none') opts[j].style.display = 'none';
            hidden += 1;
          }
        }
        // 命令块前面那条分隔线也收起（否则面板底部留一条突兀的横线）
        var dividers = menu.querySelectorAll('.sheet-option-divider');
        for (var k = 0; k < dividers.length; k++) {
          var want = hidden > 0 ? 'none' : '';
          if (dividers[k].style.display !== want) dividers[k].style.display = want;
        }
        if (menu.getAttribute('data-dm-add-filtered') !== String(hidden)) {
          menu.setAttribute('data-dm-add-filtered', String(hidden));
        }
      }
    }

    var queued = false;
    function schedule() {
      if (queued) return;
      queued = true;
      window.setTimeout(function () {
        queued = false;
        try { apply(); } catch (e) {}
      }, 60);
    }
    try {
      if (window.__dmMutationBus) window.__dmMutationBus.subscribe(schedule); else new MutationObserver(schedule).observe(document.documentElement || document.body, { childList: true, subtree: true });
    } catch (e) {}
    window.setInterval(function () { try { apply(); } catch (e) {} }, 500);
    apply();
  } catch (e) {}
})();
</script>
`

// ── 全屏图片预览（待发送缩略图 + 聊天图片共用一套 overlay）──────────────────
// 用户诉求：输入框上方「待发送」缩略图点了没反应；聊天里的图片又太大（CSS 侧限高，
// 见 theme.css 的 .chat-md img 规则）。
//
// 来源：
//   · .chat-attach-img      —— 待发送缩略图（以及 .chat-attach-item 空白处）
//   · img.chat-msg-image    —— 已发送的用户图片
//   · .chat-md img          —— assistant markdown 里的图片
// 手法：document 捕获阶段事件委托（React 重渲染后仍然有效）。命中后必须
// preventDefault + stopPropagation —— bundle 在 .chat-scroll 的 onClick 里也会对
// 任意 img 打开它自己的 .lightbox-backdrop；不拦住就会出现「我们的 overlay +
// bundle lightbox」两层遮罩（已实测该行为）。
// 关闭：点遮罩 / 右上角 ✕ / ESC（桌面）。打开期间锁 body 滚动，关闭后恢复原值。
// 不拦截 .chat-attach-remove（× 移除）与 .chat-attach-btn（＋）：它们照常工作。
// 关闭 200ms 后移除节点；再次打开复用同一套构建逻辑，不残留节点。
const IMAGE_PREVIEW_HTML = `
<script>
(function () {
  try {
    if (window.__dmImagePreview) return;
    window.__dmImagePreview = true;

    var overlay = null;      // { back, img }
    var prevOverflow = null; // 打开前的 body.style.overflow（关闭时原样恢复）
    var closeTimer = 0;

    function hitSource(target) {
      if (!target || !target.closest) return null;
      // overlay 自己的点击交给元素自身处理，避免重复打开/误判
      if (target.closest('.dm-imgpreview')) return null;
      // 移除按钮 / 添加按钮：绝不拦截
      if (target.closest('.chat-attach-remove')) return null;
      if (target.closest('.chat-attach-btn')) return null;
      // 链接里的图片保持跳转行为（与 bundle 自身的判定一致）
      if (target.closest('a')) return null;
      var attach = target.closest('.chat-attach-img');
      if (attach) return attach;
      var item = target.closest('.chat-attach-item');
      if (item) {
        var inner = item.querySelector('.chat-attach-img');
        if (inner) return inner;
      }
      var img = target.closest('img');
      if (!img) return null;
      if (img.classList && img.classList.contains('chat-msg-image')) return img;
      if (img.closest && img.closest('.chat-md')) return img;
      return null;
    }

    function shouldSkip(src) {
      if (typeof src !== 'string' || src === '') return true;
      // 图标是 svg data URL，不该放大（bundle 自己的 lightbox 也跳过这一类）
      if (src.indexOf('data:image/svg') === 0) return true;
      return false;
    }

    function build() {
      var back = document.createElement('div');
      back.className = 'dm-imgpreview';
      back.setAttribute('role', 'dialog');
      back.setAttribute('aria-modal', 'true');
      back.setAttribute('aria-label', '图片预览');
      var img = document.createElement('img');
      img.className = 'dm-imgpreview-img';
      img.alt = '图片预览';
      img.draggable = false;
      var close = document.createElement('button');
      close.type = 'button';
      close.className = 'dm-imgpreview-close';
      close.setAttribute('aria-label', '关闭');
      close.textContent = '✕';
      back.appendChild(img);
      back.appendChild(close);
      back.addEventListener('click', function (e) {
        // 点图片本体不关闭；点遮罩关闭
        if (e.target === back) closePreview();
      });
      close.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        closePreview();
      });
      overlay = { back: back, img: img };
      return overlay;
    }

    function openPreview(src, alt) {
      if (overlay) teardown();
      build();
      overlay.img.src = src;
      overlay.img.alt = alt && alt !== '' ? alt : '图片预览';
      document.body.appendChild(overlay.back);
      if (prevOverflow === null) prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      try { document.body.setAttribute('data-dm-imgpreview', 'open'); } catch (e) {}
      // 下一帧再加 open 类，让 200ms 的透明度过渡真的跑起来
      window.requestAnimationFrame(function () {
        if (overlay) overlay.back.classList.add('dm-imgpreview-open');
      });
    }

    function closePreview() {
      if (!overlay) return;
      var back = overlay.back;
      if (back.classList.contains('dm-imgpreview-closing')) return;
      back.classList.remove('dm-imgpreview-open');
      back.classList.add('dm-imgpreview-closing');
      if (closeTimer) window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(teardown, 200);
    }

    function teardown() {
      if (closeTimer) {
        window.clearTimeout(closeTimer);
        closeTimer = 0;
      }
      if (overlay) {
        if (overlay.back.parentNode) overlay.back.parentNode.removeChild(overlay.back);
        overlay = null;
      }
      // 恢复打开前的滚动状态（可能是空串，也可能已被其它弹层设成 hidden）
      if (prevOverflow !== null) {
        document.body.style.overflow = prevOverflow;
        prevOverflow = null;
      }
      try { document.body.removeAttribute('data-dm-imgpreview'); } catch (e) {}
    }

    // 捕获阶段：必须比 bundle 在 .chat-scroll 上的 onClick（冒泡）更早拿到点击
    document.addEventListener('click', function (e) {
      var img = hitSource(e.target);
      if (!img) return;
      var src = img.currentSrc || img.src || img.getAttribute('src') || '';
      if (shouldSkip(src)) return;
      e.preventDefault();
      e.stopPropagation();
      // DOM 证据：最后一次预览来源（只有 class 名，不含会话内容）
      try {
        document.body.setAttribute('data-dm-imgpreview-from', String(img.className || 'img'));
      } catch (err) {}
      openPreview(src, img.getAttribute('alt') || '');
    }, true);

    // ESC 关闭（桌面浏览器 / 外接键盘）
    document.addEventListener('keydown', function (e) {
      if (!overlay) return;
      if (e.key !== 'Escape' && e.key !== 'Esc') return;
      e.preventDefault();
      e.stopPropagation();
      closePreview();
    }, true);
  } catch (e) {}
})();
</script>
`

// ── 工作区待处理标记（提问/审批）────────────────────────────────────────────
// 问题：Agent 在「当前没打开的会话」里 ask_user_question 时，bundle 只轮询当前会
// 话的 mobile.pending（SSE live 60s / 非 live 1.5s），工作区列表上没有任何标志，
// 用户不知道 AI 在等他回答 —— 任务直接卡死。
// 方案（用户最终要求）：
//   · 全局每 5s 不带 sessionId 调 mobile.pending；有 pending 的会话行，左侧那条
//     状态竖条变橙色（.dm-pending）；其所属工作区行左侧竖条同样变橙（.dm-pending-ws）。
//     没有顶部提示条、没有红点/红字；pending 清零后自动恢复。
//   · 聊天页：当前会话若有 pending 审批，工具栏铃铛 #dm-approval-btn 右上角出现
//     橙色小圆点（.dm-approval-pending）；提问不点亮铃铛（走聊天里的提问卡）。
// 数据全部来自宿主 RPC（mobile.pending 的 sessions 汇总 + session.list 的标题/cwd），
// 不造假。会话→行仍用标题精确匹配；标题重复（歧义）时宁可不标，避免标错会话。
const PENDING_ALERTS_HTML = `<script>
(function () {
  'use strict';
  var GLOBAL_POLL_MS = 5000;
  var CHAT_POLL_MS = 1000;
  var sessionsById = new Map();   // sessionId -> { title, cwd }
  var titleToSid = new Map();     // 唯一标题 -> sessionId
  var pendingById = new Map();    // sessionId -> { approvals, questions, total }
  var lastSessionId = '';
  var queued = false;
  var globalBusy = false;

  function rpc(method, payload) {
    return fetch('/m/api/' + method, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rpcId: 'dm-pending-' + Date.now() + '-' + Math.random().toString(36).slice(2), payload: payload || {} })
    }).then(function (res) { return res.json(); }).then(function (json) {
      return json && json.result ? json.result : null;
    });
  }

  // 拦截 fetch 记住「当前正在看的会话」（bundle 的请求体里都带 payload.sessionId）。
  var origFetch = window.fetch;
  if (typeof origFetch === 'function') {
    window.fetch = function (input, init) {
      try {
        var url = typeof input === 'string' ? input : (input && input.url) || '';
        if (url.indexOf('/m/api/') >= 0 && init && typeof init.body === 'string') {
          var body = JSON.parse(init.body);
          var sid = body && body.payload && body.payload.sessionId;
          if (typeof sid === 'string' && sid !== '' && sid !== lastSessionId) {
            lastSessionId = sid;
            setTimeout(applyChat, 0);
          }
        }
      } catch (e) {}
      return origFetch.apply(this, arguments);
    };
  }

  // 工作区层页面 = 不是聊天页、不是自绘全屏页，且有项目列表/会话行的标志元素。
  function isWorkspaceLevel() {
    if (document.querySelector('.chat-composer')) return false;
    if (document.querySelector('.dm-page:not([hidden])') !== null) return false;
    return document.querySelector('.mobile-new, .mobile-quickchip, .sess-titleline') !== null;
  }
  function baseName(path) {
    var text = String(path == null ? '' : path);
    var slash = text.split('/');
    var last = slash[slash.length - 1];
    var back = String.fromCharCode(92);
    var parts = last.split(back);
    return parts[parts.length - 1].trim().toLowerCase();
  }

  /** session.list → sessionId/标题唯一映射；标题重复的会话不参与 DOM 匹配。 */
  function buildSessionMap(items) {
    sessionsById = new Map();
    var byTitle = new Map();
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (!item || typeof item.sessionId !== 'string') continue;
      var values = item.projections && item.projections.values;
      var title = values && typeof values.title === 'string' ? values.title.trim() : '';
      if (title === '') continue;
      sessionsById.set(item.sessionId, { title: title, cwd: typeof item.cwd === 'string' ? item.cwd : '' });
      var list = byTitle.get(title);
      if (list === undefined) byTitle.set(title, [item.sessionId]);
      else list.push(item.sessionId);
    }
    titleToSid = new Map();
    byTitle.forEach(function (ids, title) {
      if (ids.length === 1) titleToSid.set(title, ids[0]);
    });
  }

  function clearMarks() {
    var marked = document.querySelectorAll('.mobile-row.dm-pending, .mobile-row.dm-pending-ws');
    for (var i = 0; i < marked.length; i++) {
      marked[i].classList.remove('dm-pending');
      marked[i].classList.remove('dm-pending-ws');
      marked[i].removeAttribute('data-dm-pending');
      marked[i].removeAttribute('data-dm-pending-ws');
    }
  }

  function applyWorkspace() {
    if (!isWorkspaceLevel()) { clearMarks(); return; }
    var rows = document.querySelectorAll('.mobile-row');
    var pendingCwds = new Map(); // workspace basename -> pending session count
    pendingById.forEach(function (info, sid) {
      if (!info || Number(info.total) <= 0) return;
      var session = sessionsById.get(sid);
      var base = session ? baseName(session.cwd) : '';
      if (base === '') return;
      pendingCwds.set(base, (pendingCwds.get(base) || 0) + 1);
    });
    // 工作区标题出现多次时无法确定归属，宁可不标。
    var wsTitleCount = new Map();
    for (var i = 0; i < rows.length; i++) {
      var t = rows[i].querySelector('.ws-icon') === null ? null : rows[i].querySelector('.card-titleText');
      if (t === null) continue;
      var key = String(t.textContent == null ? '' : t.textContent).trim().toLowerCase();
      if (key !== '') wsTitleCount.set(key, (wsTitleCount.get(key) || 0) + 1);
    }

    var markedSession = new Set();
    var markedWs = new Set();
    for (var j = 0; j < rows.length; j++) {
      var row = rows[j];
      var titleEl = row.querySelector('.sess-title');
      if (titleEl !== null) {
        var title = String(titleEl.textContent == null ? '' : titleEl.textContent).trim();
        var sid = titleToSid.get(title);
        var info = sid === undefined ? undefined : pendingById.get(sid);
        if (info !== undefined && Number(info.total) > 0) {
          row.classList.add('dm-pending');
          row.setAttribute('data-dm-pending', '1');
          markedSession.add(row);
        }
        continue;
      }
      var wsTitleEl = row.querySelector('.ws-icon') === null ? null : row.querySelector('.card-titleText');
      if (wsTitleEl !== null) {
        var wsKey = String(wsTitleEl.textContent == null ? '' : wsTitleEl.textContent).trim().toLowerCase();
        if (wsKey !== '' && (wsTitleCount.get(wsKey) || 0) === 1 && pendingCwds.has(wsKey)) {
          row.classList.add('dm-pending-ws');
          row.setAttribute('data-dm-pending-ws', '1');
          markedWs.add(row);
        }
      }
    }
    var all = document.querySelectorAll('.mobile-row.dm-pending, .mobile-row.dm-pending-ws');
    for (var k = 0; k < all.length; k++) {
      if (!markedSession.has(all[k]) && !markedWs.has(all[k])) {
        all[k].classList.remove('dm-pending');
        all[k].classList.remove('dm-pending-ws');
        all[k].removeAttribute('data-dm-pending');
        all[k].removeAttribute('data-dm-pending-ws');
      }
    }
  }

  // 聊天页：当前会话有 pending 审批 → 铃铛右上角橙点；提问不点亮铃铛。
  function applyChat() {
    var button = document.getElementById('dm-approval-btn');
    if (button === null) return;
    var onChat = document.querySelector('.chat-composer') !== null;
    var info = lastSessionId !== '' ? pendingById.get(lastSessionId) : undefined;
    var hasApproval = onChat && info !== undefined && Number(info.approvals) > 0;
    if (hasApproval) button.classList.add('dm-approval-pending');
    else button.classList.remove('dm-approval-pending');
  }

  function refreshGlobal() {
    if (globalBusy) return;
    globalBusy = true;
    Promise.all([rpc('mobile.pending', {}), rpc('session.list', {})]).then(function (results) {
      globalBusy = false;
      var pendingResult = results[0];
      var listResult = results[1];
      if (!pendingResult || pendingResult.ok !== true || !pendingResult.value) return;
      if (listResult && listResult.ok === true && listResult.value && Array.isArray(listResult.value.items)) {
        buildSessionMap(listResult.value.items);
      }
      pendingById = new Map();
      var rows = Array.isArray(pendingResult.value.sessions) ? pendingResult.value.sessions : [];
      for (var i = 0; i < rows.length; i++) {
        var item = rows[i];
        if (item && typeof item.sessionId === 'string' && Number(item.total) > 0) pendingById.set(item.sessionId, item);
      }
      applyWorkspace();
      applyChat();
    }).catch(function () { globalBusy = false; });
  }

  // 聊天页快速轮询（1s）：当前会话的审批状态，保证进会话 1s 内铃铛亮起/熄灭。
  function refreshChat() {
    if (lastSessionId === '' || document.querySelector('.chat-composer') === null) return;
    rpc('mobile.pending', { sessionId: lastSessionId }).then(function (result) {
      if (!result || result.ok !== true || !result.value) return;
      var approvals = Array.isArray(result.value.approvals) ? result.value.approvals.length : 0;
      var questions = Array.isArray(result.value.questions) ? result.value.questions.length : 0;
      pendingById.set(lastSessionId, { sessionId: lastSessionId, approvals: approvals, questions: questions, total: approvals + questions });
      applyChat();
    }).catch(function () {});
  }

  function scheduleApply() {
    if (queued) return;
    queued = true;
    var run = function () { queued = false; try { applyWorkspace(); applyChat(); } catch (e) {} };
    if (window.requestAnimationFrame) window.requestAnimationFrame(run);
    else window.setTimeout(run, 0);
  }

  try {
    var mo = new MutationObserver(scheduleApply);
    mo.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
  setInterval(function () { try { refreshGlobal(); } catch (e) {} }, GLOBAL_POLL_MS);
  setInterval(function () { try { refreshChat(); } catch (e) {} }, CHAT_POLL_MS);
  refreshGlobal();
})();
</script>`

// ── 共享 MutationObserver + 统一 ensure tick（性能）──────────────────────
// 聊天页空闲时 16 个脚本各自 observe 整个 documentElement，DOM 每秒变几百次；
// 另外 7 条 120/400ms ensure 定时器在任何页面都空跑。实测长会话空闲 30s 主线程
// 14.9%、MO 回调 13,000。这里做两件事（行为不变，只收敛触发频率）：
//   ① 合并成 1 个结构化 observer（childList/characterData）+ 1 个属性 observer
//      （只有真正依赖属性变化的 PRESET_STATUS / CHAT_STATUS 订阅）；结构化变化
//      按 200ms 时间片分发给普通订阅者，自动滚动/图标光学对齐用 {frame:true}
//      走 rAF，保持低延迟。
//   ② 6 条 400ms ensure + 1 条 120ms ensureTools 共用一条 120ms tick；任务带
//      ready() 谓词，目标元素不在时直接跳过，连续 3 个 tick 无事可做就停表；
//      DOM 一有变化（bus 通知）就重新唤醒，进入目标页面后立即恢复。
// 兜底：若本脚本未执行/失败，调用方保留旧的独立 observer / setInterval 分支。
const MUTATION_BUS_HTML = `<script>
(function () {
  if (window.__dmMutationBus) return;
  var frameListeners = [];
  var normalListeners = [];
  var attrListeners = [];
  var frameQueued = false;
  var normalTimer = 0;
  var attrTimer = 0;
  function notify(list) {
    var snapshot = list.slice();
    for (var i = 0; i < snapshot.length; i++) {
      try { snapshot[i](); } catch (e) {}
    }
  }
  function scheduleFrame() {
    if (frameQueued) return;
    frameQueued = true;
    if (window.requestAnimationFrame) window.requestAnimationFrame(function () { frameQueued = false; notify(frameListeners); });
    else window.setTimeout(function () { frameQueued = false; notify(frameListeners); }, 0);
  }
  function scheduleNormal() {
    if (normalTimer !== 0) return;
    normalTimer = window.setTimeout(function () { normalTimer = 0; notify(normalListeners); }, 600);
  }
  function scheduleAttr() {
    if (attrTimer !== 0) return;
    attrTimer = window.setTimeout(function () { attrTimer = 0; notify(attrListeners); }, 400);
  }
  try {
    var structural = new MutationObserver(function () {
      if (frameListeners.length > 0) scheduleFrame();
      if (normalListeners.length > 0) scheduleNormal();
    });
    structural.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    var attributes = new MutationObserver(function () {
      if (attrListeners.length > 0) scheduleAttr();
    });
    attributes.observe(document.documentElement, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class', 'aria-label', 'title', 'aria-hidden', 'style', 'hidden']
    });
  } catch (e) { return; }

  // ── 统一 ensure tick：120ms 一条表，任务按各自 period 到期才跑；全都不 ready 就停表。
  var tasks = [];
  var tickTimer = 0;
  var idleTicks = 0;
  function tick() {
    var now = Date.now();
    var ran = false;
    for (var i = 0; i < tasks.length; i++) {
      var task = tasks[i];
      if (now < task.next) continue;
      if (task.ready && !task.ready()) continue;
      task.next = now + task.period;
      ran = true;
      try { task.fn(); } catch (e) {}
    }
    if (ran) { idleTicks = 0; return; }
    idleTicks++;
    if (idleTicks >= 3) {
      idleTicks = 0;
      window.clearInterval(tickTimer);
      tickTimer = 0;
    }
  }
  function startTick() {
    if (tickTimer !== 0) return;
    idleTicks = 0;
    tickTimer = window.setInterval(tick, 120);
  }
  var ensureTick = {
    add: function (fn, period, ready) {
      tasks.push({ fn: fn, period: typeof period === 'number' && period > 0 ? period : 120, ready: typeof ready === 'function' ? ready : null, next: 0 });
      startTick();
    },
    wake: startTick
  };
  normalListeners.push(ensureTick.wake);

  window.__dmMutationBus = {
    subscribe: function (listener, options) {
      if (typeof listener !== 'function') return;
      if (options && options.frame === true) frameListeners.push(listener);
      else if (options && options.attributes === true) attrListeners.push(listener);
      else normalListeners.push(listener);
    }
  };
  window.__dmEnsureTick = ensureTick;
  startTick();
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
    MUTATION_BUS_HTML,
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
    `<script type="module" src="/m/mobile.js?v=${bundleVersion()}"></script>`,
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
    QUEUE_DOCK_PLACE_HTML,
    CHAT_STATUS_HTML,
    CHAT_AUTOSCROLL_HTML,
    LOAD_OLDER_ALIGN_HTML,
    ICON_OPTICAL_ALIGN_HTML,
    INPUT_TEXT_CENTER_HTML,
    USAGE_INLINE_HTML,
    HOST_PAGES_HTML,
    PENDING_ALERTS_HTML,
    BUILTIN_CONFIG_HTML,
    MODELS_CENTER_HTML,
    SETTINGS_SCOPE_HTML,
    COMMAND_PANEL_HTML,
    ADD_SHEET_FILTER_HTML,
    // 聊天/待发送图片的全屏预览（捕获阶段委托，抢在 bundle 自带 lightbox 之前）。
    IMAGE_PREVIEW_HTML,
    DEVICE_INFO_HTML,
    NOTIFY_LAYOUT_HTML,
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
    // 设置面板里填的公网域名（publicBaseUrl 的运行时覆盖；空 = 用上面的配置值）。
    publicBaseFile: join(homedir(), '.dsh', 'dsh-mobile-public.json'),
    // 「设置 → 通用 → 反馈与建议」要打开的 GitHub 地址（issue 新建页）。
    // 默认空 = 还没填自己的仓库：手机端 desc 清空、点击只 toast「GitHub 地址待填写」，
    // 绝不回落到别人的仓库（bundle 里写死的 dsh-palm 链接由注入脚本拦掉）。
    githubUrl: '',
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
  // 设置面板里填的公网域名；空字符串表示沿用 profile 配置里的 publicBaseUrl。
  let publicBaseOverride = loadPublicBase(cfg.publicBaseFile)
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

  /**
   * 从 UA 里尽量认出「平台 · 浏览器」，顺带给出能拿到的型号。
   *
   * UA 里能稳定读到平台（Android / HarmonyOS / iOS / Windows / macOS）和浏览器
   * （华为浏览器 / 夸克 / Edge / Chrome / Safari…），部分 Android UA 还带型号
   * （例如夸克：`Android 16; zh-CN; PLQ110 Build/…`）。
   * 但华为 ArkWeb 的 UA 把型号写死成 `Phone`（`(Phone; OpenHarmony 7.0; Android 10)`），
   * 拿不到真实型号 —— 这种就只能显示「HarmonyOS x · 华为浏览器 y」，
   * 精确型号靠手机端上报的 Client Hints（navigator.userAgentData.model）。
   */
  function describeDeviceUA(userAgent) {
    const ua = String(userAgent || '')
    const grab = (re) => {
      const hit = re.exec(ua)
      return hit && typeof hit[1] === 'string' ? hit[1] : ''
    }
    let platform = ''
    if (/OpenHarmony|HarmonyOS/i.test(ua)) {
      const v = grab(/OpenHarmony\s+([\d.]+)/i) || grab(/HarmonyOS\s+([\d.]+)/i)
      platform = v === '' ? 'HarmonyOS' : 'HarmonyOS ' + v
    } else if (/Android/i.test(ua)) {
      const v = grab(/Android\s+([\d.]+)/i)
      platform = v === '' ? 'Android' : 'Android ' + v
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
      platform = 'iOS'
    } else if (/Windows NT 10/i.test(ua)) {
      platform = 'Windows'
    } else if (/Macintosh|Mac OS X/i.test(ua)) {
      platform = 'macOS'
    } else if (/Linux/i.test(ua)) {
      platform = 'Linux'
    }
    let browser = ''
    const browsers = [
      [/HuaweiBrowser\/([\d.]+)/i, '华为浏览器'],
      [/Quark\/([\d.]+)/i, '夸克'],
      [/MicroMessenger\/([\d.]+)/i, '微信'],
      [/Edg\/([\d.]+)/i, 'Edge'],
      [/Firefox\/([\d.]+)/i, 'Firefox'],
      [/Chrome\/([\d.]+)/i, 'Chrome'],
      [/Version\/([\d.]+)[\s\S]*Safari/i, 'Safari'],
    ]
    for (const [re, name] of browsers) {
      const v = grab(re)
      if (v !== '') {
        browser = name + ' ' + v.split('.')[0]
        break
      }
    }
    let model = ''
    if (!/OpenHarmony|HarmonyOS/i.test(ua)) {
      if (/iPhone/i.test(ua)) model = 'iPhone'
      else if (/iPad/i.test(ua)) model = 'iPad'
      else if (/Android/i.test(ua)) {
        const hit = /Android[^;)]*;\s*(?:[A-Za-z]{2}-[A-Za-z]{2};\s*)?([^;)]+?)\s*(?:Build\/|\))/i.exec(ua)
        const token = hit && typeof hit[1] === 'string' ? hit[1].replace(/^U;\s*/i, '').trim() : ''
        if (token.length >= 2 && !/^wv$/i.test(token) && !/^Android$/i.test(token)) model = token.slice(0, 40)
      }
    }
    const label = [platform, browser].filter((s) => s !== '').join(' · ')
    return { model, platform, browser, label }
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
    // 优先用设置面板里填的域名；没有才回落到 profile 配置。
    const fromConfig = typeof cfg.publicBaseUrl === 'string' ? cfg.publicBaseUrl.trim().replace(/\/+$/, '') : ''
    const publicBase = publicBaseOverride !== '' ? publicBaseOverride : (fromConfig !== '' ? fromConfig : null)
    return { lan, publicBase, publicBaseCustom: publicBaseOverride !== '', port }
  }

  /** 设置面板保存/清除公网域名（loopback-only）。 */
  function setPublicBase(req, res) {
    readJsonBody(req)
      .then((body) => {
        const raw = body && typeof body.url === 'string' ? body.url.trim() : ''
        if (raw === '') {
          publicBaseOverride = ''
          savePublicBase(cfg.publicBaseFile, '')
          return sendJson(res, 200, { ok: true, publicBase: accessAddresses().publicBase })
        }
        const normalized = normalizePublicBase(raw)
        if (normalized === null) {
          return sendJson(res, 400, { ok: false, error: '域名格式不对：需要 http(s)://主机[:端口]' })
        }
        publicBaseOverride = normalized
        savePublicBase(cfg.publicBaseFile, normalized)
        sendJson(res, 200, { ok: true, publicBase: normalized })
      })
      .catch((err) => sendJson(res, 400, { ok: false, error: String((err && err.message) || err) }))
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
    const devicesView = [...devices.entries()].map(([deviceId, d]) => {
      const info = describeDeviceUA(d.userAgent)
      return {
        deviceId,
        name: d.name || '设备',
        createdAt: d.createdAt,
        lastSeenAt: d.lastSeenAt,
        userAgent: d.userAgent || '',
        // 手机端上报过 Client Hints 就优先用它，否则用 UA 解析出来的兜底标签。
        model: d.model || info.model || '',
        label: info.label || '',
        platform: d.platform || info.platform || '',
      }
    })
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

  /**
   * readHistoryAs：取一页历史，并在「加载更早」时把窗口对齐到 turn 起点。
   *
   * `controller.page({ beforeSeq, maxMessages })` 是按消息/条数切窗的 —— 它不认识 turn
   * 边界，所以「加载更早」取到的窗口经常落在某一轮的中间（首条是 assistant/message，
   * 甚至落在一段 reasoning 后面），手机上渲染出来就是顶部半截思考折叠。
   */
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

    const limit = Math.max(1, Math.min(Number(maxMessages) || 50, 200))
    const pageWindow = async (seq) => {
      const page = await controller.page(
        {
          address,
          throughSeq: cursor,
          ...(seq === undefined ? {} : { beforeSeq: seq }),
          maxMessages: limit,
        },
        signal,
      )
      return { records: Array.isArray(page.records) ? page.records : [], hasMore: !!page.hasMore }
    }

    const toEvents = (records) => records.map((r) => ({ event: r.event }))
    const isUserMessage = (record) => {
      const event = record && record.event
      return event !== null && typeof event === 'object' && event.type === 'user/message'
    }
    const firstUserIndex = (records) => {
      for (let index = 0; index < records.length; index += 1) {
        if (isUserMessage(records[index])) return index
      }
      return -1
    }
    const firstSeqOf = (records) => {
      for (const record of records) {
        const event = record && record.event
        if (event !== null && typeof event === 'object' && typeof event.seq === 'number' && Number.isFinite(event.seq)) {
          return event.seq
        }
      }
      return undefined
    }

    const first = await pageWindow(beforeSeq)
    // 首屏（无 beforeSeq）与其他读取路径一律保持原样：只取最新一页，不做任何裁剪。
    if (beforeSeq === undefined) {
      return {
        events: toEvents(first.records),
        hasMore: first.hasMore,
        ...(projections ? { projections } : {}),
      }
    }

    // ── 「加载更早」：把窗口对齐到 turn 起点（user/message）───────────────────
    // 宿主一页 ≈ 一两百条事件，正常情况下一页里就有 user/message，从它开始返回即可。
    // 若整页都属于同一个更早的 turn（一条 user/message 都没有），就用本页最早的 seq
    // 再往前取一页并合并后重试 —— 最多 3 页，避免极端会话把一次点击拖成很多次宿主查询。
    let records = first.records
    let hasMore = first.hasMore
    let found = firstUserIndex(records)
    let rounds = 0
    while (found < 0 && rounds < 2) {
      const earliest = firstSeqOf(records)
      if (!hasMore || earliest === undefined || records.length === 0) break
      const older = await pageWindow(earliest)
      if (older.records.length === 0) {
        hasMore = older.hasMore
        break
      }
      records = [...older.records, ...records]
      hasMore = older.hasMore
      rounds += 1
      found = firstUserIndex(records)
    }
    if (found > 0) {
      // 丢掉窗口里第一个不完整 turn 的全部事件，从它的 user/message 开始。
      records = records.slice(found)
    } else if (found < 0) {
      // 单个 turn 的事件超过 3 页：本页整体不可用，交回空窗口 + hasMore，让前端继续往前取。
      records = []
      hasMore = true
    }

    return {
      events: toEvents(records),
      hasMore,
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

  /** 会话创建时写死的 cwd（Session.header.cwd）；手机端读本地文件要按它解析。 */
  function sessionCwd(sessionId) {
    const session = sessionById(sessionId)
    const header = session && session.header
    return header && typeof header.cwd === 'string' ? header.cwd : ''
  }

  /**
   * 手机端本地图片预览允许的扩展名 → media type。
   *
   * bundle 的 markdown 渲染器把 `![](路径)` 落成
   * `<img class="md-local-img" data-local-src="路径">`，再由 local-images 逻辑调
   * `mobile.readFile` 换 data URL。以前这个 RPC 是个 unavailable 桩，聊天里的
   * 本地图片于是全部停在 failed 态（红虚线框 + alt），即用户看到的
   * 「图片发送失败」。这里只放开图片，且只读会话工作区内的文件。
   */
  const PREVIEW_IMAGE_MIME = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
    '.avif': 'image/avif',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml',
  }
  // base64 会再胖 1/3：8MB 原图 ≈ 11MB JSON，手机上再大就卡了。
  const PREVIEW_IMAGE_MAX_BYTES = 8 * 1024 * 1024

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

  /**
   * 手机端读设置用：把当前发送模式 + 反馈 GitHub 地址随启动探针一起下发。
   * githubUrl 为空串表示还没配置：设置页「反馈与建议」会清空描述并在点击时只 toast。
   */
  function sendModeView() {
    const url = typeof cfg.githubUrl === 'string' ? cfg.githubUrl.trim() : ''
    return { sendMode, mobileEnterToSend: true, githubUrl: url }
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

  // ── 宿主命令（工具栏「/」面板） ───────────────────────────────────────────
  // 真实契约（@deepseek-ai/dsh-commands：asar 内 lib/index.js + typert 的 Service 反射）：
  //   · ctx.commands.list(agent) -> readonly CommandDescriptor[]
  //       CommandDescriptor = { definitionId?, name, description, input?: { hint, attachments? } }
  //     入参 agent 不是 sessionId，而是宿主 registry 里的活 Agent（Agent = { id, session, ctx, inbox, ... }）；
  //     它同时是「作用域键」：全局层 + 该 Agent 作用域链上的覆盖层合并后按 name 排序返回。
  //   · ctx.commands.execute(agent, line, submittedAttachments, signal)
  //       -> Promise<CommandExecution | undefined>
  //       CommandExecution = { commandId, result: { kind:'success', text?, sourceEventSeq? }
  //                                            | { kind:'error', text } }
  //     行首必须是 /name（parseCommand 用 /^\/([a-z][a-z0-9_-]*)(?=$|[\t\n\r ])/）；
  //     名字未知或语法不合法时返回 undefined；execute 内部拿 agent.session 追加
  //     command/run、command/done 两条生命周期事件 —— 所以 agent 必须是真 Agent，
  //     伪造对象（只有 id）会在 appendLifecycle 处炸掉。
  // 结论：手机端点条目走「真执行」，而不是「把 /name 插进输入框」——
  //   宿主只在 UI 适配器里解析斜杠命令（bundle 的 session.prompt 是纯 prompt 通道、
  //   不解析斜杠），插进输入框只会把 /compact 当普通文本发给模型，什么也不会发生。
  /** 宿主命令服务（没装配 @deepseek-ai/dsh-commands 时为 undefined）。 */
  function commandService() {
    const svc = typeof ctx.get === 'function' ? ctx.get('commands') : undefined
    return svc && typeof svc.list === 'function' ? svc : undefined
  }

  /** sessionId → 活 Agent（只认 registry 里真实存在的；冷会话返回 undefined）。 */
  function liveAgentOf(sessionId) {
    const id = String(sessionId || '')
    if (id === '') return undefined
    const store = typeof ctx.get === 'function' ? ctx.get('agents') : undefined
    if (!store || typeof store.get !== 'function') return undefined
    try {
      return store.get(id)
    } catch {
      return undefined
    }
  }

  /**
   * 命令来源分组：definitionId 是命令包自己给的稳定身份
   * （`CommandDefinitionId("@deepseek-ai/dsh-command-compact")` 这类）。
   * 这里只做「包名 → 中文分组名」的展示映射，未知包原样显示包名 ——
   * 不猜、不硬编码任何命令。
   */
  const COMMAND_SOURCE_LABELS = {
    'dsh-command-compact': '核心指令',
    'dsh-command-feedback': '核心指令',
    'dsh-command-goal': '核心指令',
    'dsh-permission-presets': '权限',
    'dsh-plan-mode': '计划',
    'dsh-session-log-export': '导出',
  }

  /**
   * 中文检索别名：取自宿主各命令包自带的 locale/zh.json 的 meta.title
   * （例如 @deepseek-ai/dsh-command-compact 的「上下文压缩命令」）。
   * 只影响手机端的展示与搜索；命令是否存在、叫什么、能不能执行一律由
   * ctx.commands.list() 决定 —— 注册表里没有的命令这里也变不出来。
   */
  const COMMAND_ALIASES = {
    compact: { label: '压缩', keywords: ['上下文压缩', '压缩上下文'] },
    feedback: { label: '反馈', keywords: ['记录反馈', '会话反馈'] },
    goal: { label: '目标', keywords: ['长任务目标', '长期任务'] },
    permission: { label: '权限', keywords: ['权限预设', '沙箱模式'] },
    plan: { label: '计划', keywords: ['计划模式'] },
    export: { label: '导出', keywords: ['下载会话日志', '会话日志'] },
  }

  // 与宿主命令菜单一致的分段与顺序（桌面 @deepseek-ai/dsh-client-ui-commands
  // 的 SECTION_ROWS）：
  //   添加：文件 / 目标 / 计划 / 反馈
  //   指令：压缩 / 权限 / 模型 / 导出，其余宿主命令按注册表顺序接在后面
  //   技能：技能系统注册的命令统一放最后（宿主命令表里它们没有 definitionId）
  // 手机端拿不到桌面端的 file / model 两个 client-side 命令，缺了就只显示实际
  // 存在的条目，绝不伪造。
  const HOST_ADD_ORDER = ['file', 'goal', 'plan', 'feedback']
  const HOST_COMMAND_ORDER = ['compact', 'permission', 'model', 'export']

  function commandSectionOf(name, sourceKey) {
    if (HOST_ADD_ORDER.indexOf(name) >= 0) return '添加'
    if (HOST_COMMAND_ORDER.indexOf(name) >= 0) return '指令'
    // 技能命令由技能系统注册，宿主命令注册表里没有 definitionId；没有来源的
    // 其它命令按宿主「未列出的收进指令段末尾」处理，只有像技能的才进技能段。
    if (sourceKey === '' || /skill/i.test(sourceKey)) return '技能'
    return '指令'
  }

  function commandSourceOf(definitionId) {
    const raw = typeof definitionId === 'string' ? definitionId : ''
    if (raw === '') return { key: '', label: '未标注来源' }
    const pkg = raw.startsWith('@deepseek-ai/') ? raw.slice('@deepseek-ai/'.length) : raw
    return { key: pkg, label: COMMAND_SOURCE_LABELS[pkg] || pkg }
  }

  /**
   * 当前会话可用的宿主命令目录。
   * available=false 表示宿主根本没装配命令服务（如实上报，不拿空列表冒充成功）。
   * live=false 表示会话还没有活 Agent：此时 list 读到的就是全局命令层
   * （作用域层只能由活 Agent 的 ctx 注册出来，所以这个结果是精确的而非近似）。
   */
  // ── 中文命令名 → 宿主真实英文名 ─────────────────────────────────────────────
  // 用户要求「命令名本身也中文化」：手机 `/` 面板显示并插入 `/目标 `，而宿主只解析
  // 英文命令名（/goal）。所以 mobile.commandExec 在执行前把第一个 token 映射回英文，
  // 其余参数原样保留；英文名原样透传（向后兼容）；未命中的中文名不做处理，交给宿主
  // → 走现有 unknown-command，绝不当普通文本静默发送。
  const COMMAND_NAME_BY_ZH = {
    目标: 'goal',
    计划: 'plan',
    反馈: 'feedback',
    压缩: 'compact',
    权限: 'permission',
    下载日志: 'export',
    导出: 'export',
    模型: 'model',
    编排: 'orchestrate',
  }

  function canonicalCommandLine(line) {
    const text = String(line)
    const match = /^(\s*)\/([^\s/]+)([\s\S]*)$/.exec(text)
    if (!match) return text
    const english = COMMAND_NAME_BY_ZH[match[2]]
    if (english === undefined) return text
    return match[1] + '/' + english + match[3]
  }

  function commandCatalog(payload) {
    const svc = commandService()
    if (!svc) {
      return { available: false, items: [], live: false, reason: '宿主未装配命令服务（@deepseek-ai/dsh-commands）' }
    }
    const sessionId = payload && typeof payload.sessionId === 'string' ? payload.sessionId : ''
    if (sessionId === '') {
      return { available: false, items: [], live: false, reason: '缺少 sessionId，无法确定命令作用域' }
    }
    const agent = liveAgentOf(sessionId)
    let descriptors = []
    try {
      descriptors = svc.list(agent || { id: sessionId })
    } catch (err) {
      return {
        available: false,
        items: [],
        live: agent !== undefined,
        reason: `读取命令列表失败：${err && err.message ? err.message : String(err)}`,
      }
    }
    const items = []
    const seen = new Set()
    for (const descriptor of Array.isArray(descriptors) ? descriptors : []) {
      const name = descriptor && typeof descriptor.name === 'string' ? descriptor.name : ''
      if (name === '' || seen.has(name)) continue
      seen.add(name)
      const alias = COMMAND_ALIASES[name] || {}
      const hint = descriptor.input && typeof descriptor.input.hint === 'string' ? descriptor.input.hint : ''
      const source = commandSourceOf(descriptor.definitionId)
      items.push({
        name,
        label: alias.label || name,
        description: typeof descriptor.description === 'string' ? descriptor.description : '',
        hint,
        needsInput: hint !== '',
        keywords: Array.isArray(alias.keywords) ? alias.keywords.slice() : [],
        source: source.key,
        group: source.label,
      })
    }
    // 按宿主菜单重排：添加 → 指令（固定顺序优先，其余按注册表顺序）→ 技能。
    // panel 是按 items 的顺序「遇到新 group 就画一个小标题」，所以排完序分组
    // 自然就是宿主的三段。
    const appearOrder = new Map(items.map((it, index) => [it.name, index]))
    const rankOf = (order, name) => {
      const index = order.indexOf(name)
      return index < 0 ? 1e6 : index
    }
    for (const it of items) it.group = commandSectionOf(it.name, it.source)
    const sectionRank = (it) => (it.group === '添加' ? 0 : it.group === '指令' ? 1 : 2)
    items.sort((a, b) => {
      const bySection = sectionRank(a) - sectionRank(b)
      if (bySection !== 0) return bySection
      if (a.group === '添加') return rankOf(HOST_ADD_ORDER, a.name) - rankOf(HOST_ADD_ORDER, b.name)
      if (a.group === '指令') {
        const byFixed = rankOf(HOST_COMMAND_ORDER, a.name) - rankOf(HOST_COMMAND_ORDER, b.name)
        if (byFixed !== 0) return byFixed
      }
      return appearOrder.get(a.name) - appearOrder.get(b.name)
    })
    return { available: true, items, live: agent !== undefined, sessionId }
  }

  /**
   * 执行一条宿主命令。
   * 冷会话（手机只是打开看历史、没有活 Agent）先走 sessionController.resolveAgent()
   * 现挂一个 Agent —— 与桌面端点开会话是同一条路，不是伪造对象。
   */
  async function commandExecute(payload) {
    const svc = commandService()
    if (!svc || typeof svc.execute !== 'function') {
      return { ok: false, error: { code: 'unavailable', message: '宿主未装配命令服务，无法执行' } }
    }
    const sessionId = payload && typeof payload.sessionId === 'string' ? payload.sessionId : ''
    if (sessionId === '') return { ok: false, error: { code: 'bad-request', message: '缺少 sessionId' } }
    let line = payload && typeof payload.line === 'string' ? payload.line : ''
    if (line === '') {
      let name = payload && typeof payload.name === 'string' ? payload.name.trim() : ''
      name = COMMAND_NAME_BY_ZH[name] || name
      if (!/^[a-z][a-z0-9_-]*$/.test(name)) {
        return { ok: false, error: { code: 'bad-request', message: '命令名不合法' } }
      }
      const args = payload.args === undefined || payload.args === null ? '' : String(payload.args)
      line = args === '' ? `/${name}` : `/${name} ${args}`
    }
    // 面板插入的是中文命令名（/目标 clear），这里映射回宿主英文名（/goal clear）。
    line = canonicalCommandLine(line)
    let agent = liveAgentOf(sessionId)
    if (!agent) {
      const sessionController = sc()
      if (!sessionController || typeof sessionController.resolveAgent !== 'function') {
        return { ok: false, error: { code: 'no-agent', message: '会话当前没有活动 Agent，无法执行命令' } }
      }
      try {
        const resolved = await sessionController.resolveAgent(sessionId)
        agent = resolved && resolved.agent ? resolved.agent : resolved && resolved.id ? resolved : undefined
      } catch (err) {
        return {
          ok: false,
          error: {
            code: (err && err.code) || 'session-unavailable',
            message: `无法激活该会话：${err && err.message ? err.message : String(err)}`,
          },
        }
      }
    }
    if (!agent) return { ok: false, error: { code: 'no-agent', message: '会话当前没有活动 Agent，无法执行命令' } }
    const abort = new AbortController()
    const timer = setTimeout(() => abort.abort(), COMMAND_EXEC_TIMEOUT_MS)
    try {
      const execution = await svc.execute(agent, line, [], abort.signal)
      if (execution === undefined) {
        return {
          ok: false,
          error: { code: 'unknown-command', message: `宿主没有可执行的命令 ${line.split(/\s/)[0]}` },
        }
      }
      const result = (execution && execution.result) || {}
      return {
        ok: true,
        value: {
          commandId: execution && execution.commandId !== undefined ? String(execution.commandId) : '',
          kind: result.kind === 'success' ? 'success' : 'error',
          text: typeof result.text === 'string' ? result.text : '',
        },
      }
    } catch (err) {
      if (abort.signal.aborted) {
        return { ok: false, error: { code: 'timeout', message: '命令执行超时（宿主未在时限内返回）' } }
      }
      return {
        ok: false,
        error: { code: 'command-failed', message: err && err.message ? String(err.message) : '命令执行失败' },
      }
    } finally {
      clearTimeout(timer)
    }
  }
  /**
   * 当前会话的「技能」目录 —— 桌面 `/` 菜单「技能」组的同源实现。
   *
   * 桌面实现（asar 依据，写进代码便于日后核对）：
   *   · client：@deepseek-ai/dsh-client-ui-skill/lib/client.js:419-471 注册 `/` source，
   *     candidates() 调 `ctx.remote.skills.list({ sessionId })`，onPick 只返回
   *     `{ text: '/name ' }`（落进草稿，不直接发消息）。
   *   · host：@deepseek-ai/dsh-api-session-controller/lib/index.js:2344
   *     `SessionSkillCatalog.list({ sessionId }, signal)`（service 名
   *     `sessionSkillCatalog`，`super(ctx, "sessionSkillCatalog", { namespace: "skills" })`）
   *     自己把 sessionId 解析成：cwd（projections.workingDirectory → header.cwd →
   *     workingDirectory.defaultDirectory，活 Agent 再 ensure）+ 会话 preset 的 skills 层
   *     （presets.serviceFor(live, 'skills') 或宿主 ctx.get('skills')）+ scope
   *     （活 Agent 或 preset standing scope lease），最后 filter(isUserInvocable)。
   *
   * 手机插件里拿不到 scope key / standing lease（那要 agentPresets.acquireScope），
   * 所以必须复用这个「按 sessionId 一步到位」的服务，而不是手拼
   * `ctx.skills.list({ cwd, scope })` —— 后者在冷会话上拿不到 preset 层。
   *
   * 返回形状与 Remote 的 SkillListValue 一致（只读投影，不加载 skill body）：
   *   { name, description, whenToUse?, modelInvocable, path? }
   * 服务/会话不可用时如实返回错误，不拿空列表冒充成功。
   */
  async function skillCatalog(payload) {
    const sessionId = payload && typeof payload.sessionId === 'string' ? payload.sessionId : ''
    const catalog = hostService('sessionSkillCatalog')
    if (!catalog || typeof catalog.list !== 'function') {
      return serviceUnavailable('sessionSkillCatalog', '宿主未装配技能目录服务（sessionSkillCatalog）')
    }
    if (sessionId === '') {
      return { ok: false, error: { code: 'bad-request', message: '缺少 sessionId，无法确定技能视图' } }
    }
    const abort = new AbortController()
    const timer = setTimeout(() => abort.abort(), SKILL_CATALOG_TIMEOUT_MS)
    try {
      const result = await catalog.list({ sessionId }, abort.signal)
      const skills = result && Array.isArray(result.skills) ? result.skills : []
      const items = []
      for (const skill of skills) {
        const name = skill && typeof skill.name === 'string' ? skill.name : ''
        if (name === '') continue
        // 只投影手机需要的字段；modelInvocable 决定面板描述前缀（桌面同款「仅用户 · 」）。
        items.push({
          name,
          description: typeof skill.description === 'string' ? skill.description : '',
          whenToUse: typeof skill.whenToUse === 'string' ? skill.whenToUse : '',
          modelInvocable: skill.modelInvocable !== false,
          path: typeof skill.path === 'string' ? skill.path : '',
        })
      }
      return { ok: true, value: { available: true, items, sessionId } }
    } catch (err) {
      if (abort.signal.aborted) {
        return { ok: true, value: { available: false, items: [], reason: '技能目录读取超时' } }
      }
      return {
        ok: true,
        value: {
          available: false,
          items: [],
          reason: `技能目录读取失败：${err && err.message ? err.message : String(err)}`,
        },
      }
    } finally {
      clearTimeout(timer)
    }
  }
  /**
   * 惰性读取宿主服务（不写进静态 inject）。
   *
   * cordis 的 ctx.get 是明确的「不需要 inject 的读取入口」
   *（cordis/lib/index.js:756 "Read a service from the store without the inject requirement"）。
   * 这里必须用它而不是往 inject 数组里加名字：pluginManager 在
   * `disabled: !!js '!ctx.get(''profileContext'')'` 的条件下只在桌面 profile 启用，
   * schedule 也可能被用户 patch 禁用；硬 inject 会让整个手机插件加载失败。
   * 取不到就返回 undefined，由 RPC 返回 service_unavailable —— 不编数据。
   */
  function hostService(name) {
    const read = (fn) => {
      try {
        const value = typeof fn === 'function' ? fn(name) : undefined
        return value && (typeof value === 'object' || typeof value === 'function') ? value : undefined
      } catch {
        return undefined
      }
    }
    const direct = read((key) => ctx.get(key))
    if (direct) return direct
    return read((key) => ctx.reflect && ctx.reflect.get && ctx.reflect.get(key))
  }

  function serviceUnavailable(service, message) {
    return {
      ok: false,
      error: {
        code: 'service_unavailable',
        message,
        details: { service },
      },
    }
  }

  // ══ 内置插件配置（子智能体 / 网页搜索 / 终端）══════════════════════════════
  // 桌面「插件 → 内置插件配置」那三页（asar: @deepseek-ai/dsh-client-ui-settings-
  // subagent / -web-search / -shell 的 client.js）在宿主侧只用三个服务：
  //
  //   · @deepseek-ai/dsh-settings —— describe({redactSecrets:true}) 读；
  //     mutate(ns, ops, expectedRevision) 写。它内部调用 configEditor.edit()，
  //     所以写入与桌面完全同路：校验 volatile 字段 → 改 profile 的 cordis.patch.yml
  //     → 走正常 Loader reconcile 应用（asar: dsh-settings/lib/index.js:413/488/501、
  //     dsh-config-editor/lib/index.js:edit）。secret（API Key）由 describe 剔除。
  //   · @deepseek-ai/dsh-credentials —— API Key 只走 describe/set，回显只有
  //     {configured, writable}，明文永不进入 RPC 响应。
  //   · @deepseek-ai/dsh-llm —— 子智能体「可配置模型」候选（桌面 remote.session.
  //     modelCatalog 是同一 llm 注册表的投影，这里直接读注册表，少一层）。
  //
  // 每个 section 的 ns 就是 profile patch 的 entry id（= settings.describe().ns =
  // configEditor.configuration()[].entry.options.id）。字段白名单同时是写入校验：
  // 只接受这里声明过的 key，拒绝任意 config 注入。
  const BUILTIN_CONFIG_PAGES = [
    {
      key: 'subagent',
      title: '子智能体',
      description: '设置子智能体的递归层级、数量和模型。',
      requires: ['subagent'],
      sections: [
        {
          ns: 'subagent',
          title: '运行限制',
          fields: [
            {
              key: 'maxDepth',
              kind: 'int',
              min: 0,
              label: '最大递归深度',
              hint: '限制 Agent 创建子智能体的递归层级：0 = 禁用子智能体，1 = 仅允许主 Agent 创建子智能体。',
              invalid: '请输入不小于 0 的整数。',
            },
            {
              key: 'maxActiveSubagents',
              kind: 'int',
              min: 1,
              label: '子智能体并行数量上限',
              hint: '同一主 Agent 下，所有递归层级同时存活的子智能体总数，主 Agent 不计入。达到上限时，新的启动请求会被拒绝。',
              invalid: '请输入不小于 1 的整数。',
            },
          ],
        },
        {
          ns: 'subagent-model-selection-settings',
          title: '模型选择',
          fields: [
            {
              key: 'enabled',
              kind: 'bool',
              label: '允许 Agent 为子智能体选择模型',
              hint: '开启后，Agent 可以从授权模型中，为每个子智能体选择提供方、模型和推理强度。仅影响新会话。',
            },
            {
              key: 'allowedModels',
              kind: 'models',
              label: 'Agent 可选择的模型',
              hint: '至少选择一个模型。已保存但当前不可用的模型仍会保留，也可以移除。',
            },
          ],
        },
      ],
    },
    {
      key: 'agent-loop',
      title: 'Agent 循环',
      description: '控制 Agent 派发工具调用的方式。',
      requires: ['agent-loop'],
      sections: [
        {
          ns: 'agent-loop',
          title: null,
          fields: [
            {
              key: 'maxParallelToolCalls',
              kind: 'int',
              min: 1,
              label: '并行工具调用数',
              hint: '同一步内最多同时运行多少个可并行的调用。',
              invalid: '请输入不小于 1 的整数。',
            },
          ],
        },
      ],
    },
    {
      key: 'web-search',
      title: '网页搜索',
      description: '设置 DeepSeek 的搜索提供方。',
      requires: ['web-search-deepseek'],
      sections: [
        // 顺序即写入顺序：与桌面 save() 一致 —— 先写两个 provider section，
        // 最后写 web 的 provider 选择，这样开关落地时它引用的端点已经生效。
        {
          ns: 'web-search-deepseek',
          kind: 'messages',
          title: null,
          fields: [
            {
              key: 'baseURL',
              kind: 'text',
              role: 'endpoint',
              label: 'Messages API 基础地址',
              hint: '填写含 API 前缀的地址，例如 https://api.deepseek.com/anthropic/v1；程序追加 /messages，留空恢复默认。',
            },
            {
              key: 'maxUses',
              kind: 'int',
              min: 1,
              role: 'limit',
              label: '单次请求最多搜索次数',
              hint: '辅助模型在一次 Messages 请求内最多可执行的搜索次数，仅适用于 Messages API。',
              invalid: '请输入不小于 1 的整数。',
            },
          ],
        },
        {
          ns: 'web-deepseek-api',
          kind: 'api',
          title: null,
          fields: [
            {
              key: 'baseURL',
              kind: 'text',
              role: 'endpoint',
              label: 'Search / Fetch API 基础地址',
              hint: '填写含 API 前缀的地址，例如 https://api.deepseek.com/v1/tools；程序追加 /search 或 /fetch，留空恢复默认。',
            },
            {
              key: 'count',
              kind: 'int',
              min: 1,
              max: 50,
              role: 'limit',
              label: '每次搜索结果数',
              hint: '每个查询返回的结果条数，须为 1–50 的整数，默认 10；不控制搜索调用次数。',
              invalid: '请填 1–50 的整数；留空表示使用默认值。',
            },
          ],
        },
        {
          ns: 'web',
          title: null,
          switch: {
            label: '启用新版 Web 搜索 API',
            hint: '默认关闭，搜索通过 DeepSeek Messages 完成。新版 Web 搜索 API 功能与计费详见',
            link: 'https://api-docs.deepseek.com/zh-cn/guides/search',
            linkLabel: '网页搜索与抓取指南',
            on: { searchProvider: 'deepseek-search-api', fetchProvider: 'deepseek-fetch-api' },
            off: { searchProvider: 'deepseek-official', fetchProvider: 'http' },
          },
          fields: [
            { key: 'searchProvider', kind: 'provider', hidden: true },
            { key: 'fetchProvider', kind: 'provider', hidden: true },
          ],
        },
      ],
    },
    {
      key: 'shell',
      title: '终端',
      description: '限制每条命令最多能跑多久、最多输出多少内容。',
      requiresOneOf: ['pwsh-sandbox', 'bash-sandbox'],
      sections: [
        {
          ns: null,
          nsCandidates: ['pwsh-sandbox', 'bash-sandbox'],
          title: null,
          fields: [
            {
              key: 'timeoutMs',
              kind: 'int',
              min: 1,
              label: '命令超时（毫秒）',
              hint: '单条命令允许运行多久，超时即终止。',
              invalid: '请输入不小于 1 的整数。',
            },
            {
              key: 'maxOutputBytes',
              kind: 'int',
              min: 1,
              label: '单流输出上限（字节）',
              hint: '超出部分会转存到临时文件，而不是被丢弃。',
              invalid: '请输入不小于 1 的整数。',
            },
          ],
        },
      ],
    },
  ]

  const BUILTIN_DEFAULT_API_KEY_REF = 'DEEPSEEK_API_KEY'

  /** 读宿主 settings 的 describe()（强制脱敏），按 ns 建索引；服务缺失或读取失败时返回 null。 */
  function builtinSettingsRows() {
    const settings = hostService('settings')
    if (!settings || typeof settings.describe !== 'function') return null
    let list
    try {
      // redactSecrets 必传：secret 字段（API Key）留在宿主进程里，绝不下发到手机。
      list = settings.describe({ redactSecrets: true })
    } catch {
      // Loader 正在 reconcile 时 configuration() 可能短暂不可读，交给调用方给明确错误。
      return null
    }
    const rows = new Map()
    if (Array.isArray(list)) {
      for (const row of list) {
        if (row && typeof row.ns === 'string' && row.ns !== '') rows.set(row.ns, row)
      }
    }
    return rows
  }

  /** 页面定义按 key 查；未知 key 返回 null。 */
  function builtinPageFor(key) {
    return BUILTIN_CONFIG_PAGES.find((page) => page.key === key) || null
  }

  /** 该配置页此刻是否真的可配置（= 宿主 serve 了它需要的 settings ns）。 */
  function builtinConfigPageAvailable(key) {
    const page = builtinPageFor(key)
    if (!page) return false
    const rows = builtinSettingsRows()
    if (!rows) return false
    return builtinPageAvailable(page, rows)
  }

  /** 终端的 ns 是运行时探测的：Windows 上是 pwsh-sandbox，POSIX 上是 bash-sandbox。 */
  function builtinResolveNs(section, rows) {
    if (typeof section.ns === 'string' && section.ns !== '') return section.ns
    const candidates = Array.isArray(section.nsCandidates) ? section.nsCandidates : []
    for (const ns of candidates) if (rows.has(ns)) return ns
    return null
  }

  function builtinPageAvailable(page, rows) {
    const required = Array.isArray(page.requires) ? page.requires : []
    for (const ns of required) if (!rows.has(ns)) return false
    const anyOf = Array.isArray(page.requiresOneOf) ? page.requiresOneOf : []
    if (anyOf.length > 0) {
      let found = false
      for (const ns of anyOf) if (rows.has(ns)) found = true
      if (!found) return false
    }
    return true
  }

  function builtinOwn(value, key) {
    return value !== null && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, key)
  }

  /** 一个 section → 手机端表单模型（值来自宿主 describe().value/base/user）。 */
  function builtinSectionPayload(section, rows) {
    const ns = builtinResolveNs(section, rows)
    const row = ns === null ? undefined : rows.get(ns)
    const value = row && row.value !== null && typeof row.value === 'object' ? row.value : {}
    const base = row && row.base !== null && typeof row.base === 'object' ? row.base : {}
    const user = row && row.user !== null && typeof row.user === 'object' ? row.user : {}
    const fields = section.fields.map((def) => {
      const field = {
        key: def.key,
        kind: def.kind,
        label: typeof def.label === 'string' ? def.label : def.key,
        hidden: def.hidden === true,
        // overridden 决定「已覆盖 / 恢复默认」是否出现：user 是 profile patch 里
        // 显式写过的字段投影（projectForm 会丢掉没写的 key）。
        overridden: builtinOwn(user, def.key),
        value: builtinOwn(value, def.key) ? value[def.key] : null,
        base: builtinOwn(base, def.key) ? base[def.key] : null,
      }
      if (typeof def.role === 'string') field.role = def.role
      if (typeof def.hint === 'string') field.hint = def.hint
      if (typeof def.invalid === 'string') field.invalid = def.invalid
      if (Number.isFinite(def.min)) field.min = def.min
      if (Number.isFinite(def.max)) field.max = def.max
      return field
    })
    return {
      ns,
      title: typeof section.title === 'string' ? section.title : null,
      kind: typeof section.kind === 'string' ? section.kind : null,
      available: row !== undefined,
      revision: row && Number.isSafeInteger(row.revision) ? row.revision : null,
      fields,
    }
  }

  /** 网页搜索的开关：写 `web` 的 searchProvider/fetchProvider（桌面同一语义）。 */
  function builtinSwitchPayload(page, rows, mode) {
    const section = page.sections.find((item) => item.switch !== undefined)
    if (!section) return null
    const spec = section.switch
    const row = rows.get(section.ns)
    const value = row && row.value !== null && typeof row.value === 'object' ? row.value : {}
    const base = row && row.base !== null && typeof row.base === 'object' ? row.base : {}
    const user = row && row.user !== null && typeof row.user === 'object' ? row.user : {}
    return {
      ns: section.ns,
      revision: row && Number.isSafeInteger(row.revision) ? row.revision : null,
      label: spec.label,
      hint: spec.hint,
      link: spec.link,
      linkLabel: spec.linkLabel,
      value: mode === 'api',
      overridden: builtinOwn(user, 'searchProvider') || builtinOwn(user, 'fetchProvider'),
      base: { searchProvider: builtinOwn(base, 'searchProvider') ? base.searchProvider : null, fetchProvider: builtinOwn(base, 'fetchProvider') ? base.fetchProvider : null },
      on: spec.on,
      off: spec.off,
    }
  }

  /** 所选接口段声明的凭据引用（apiKeyEnv），缺省回落到 DEEPSEEK_API_KEY。 */
  function builtinApiKeyRef(page, rows, mode) {
    const section = page.sections.find((item) => item.kind === mode)
    const row = section ? rows.get(builtinResolveNs(section, rows)) : undefined
    const value = row && row.value !== null && typeof row.value === 'object' ? row.value : {}
    const declared = value.apiKeyEnv
    return typeof declared === 'string' && declared !== '' ? declared : BUILTIN_DEFAULT_API_KEY_REF
  }

  /** 只回答「配置了没有 / 能不能写」，绝不带明文。 */
  async function builtinApiKeyInfo(ref) {
    const credentials = hostService('credentials')
    if (!credentials || typeof credentials.describe !== 'function') {
      return { ref, available: false, configured: false, writable: false }
    }
    try {
      const info = await credentials.describe(ref)
      return {
        ref,
        available: true,
        configured: info !== undefined && info !== null && info.configured === true,
        writable: info === undefined || info === null || info.writable !== false,
      }
    } catch (err) {
      return {
        ref,
        available: false,
        configured: false,
        writable: false,
        message: err && err.message ? String(err.message) : String(err),
      }
    }
  }

  /** 子智能体「可配置模型」候选：直接读宿主 llm 注册表（与桌面 modelCatalog 同源）。 */
  async function builtinModelCatalog() {
    const llm = hostService('llm')
    if (!llm || typeof llm.listProviders !== 'function' || typeof llm.listModels !== 'function') {
      return { available: false, groups: [], failures: [] }
    }
    let providers
    try {
      providers = llm.listProviders()
    } catch (err) {
      return { available: false, groups: [], failures: [], message: err && err.message ? String(err.message) : String(err) }
    }
    const groups = []
    const failures = []
    for (const provider of Array.isArray(providers) ? providers : []) {
      if (!provider || typeof provider.id !== 'string' || provider.id === '') continue
      const name = typeof provider.name === 'string' && provider.name !== '' ? provider.name : provider.id
      try {
        const models = await llm.listModels(provider.id)
        const items = (Array.isArray(models) ? models : [])
          .filter((model) => model && typeof model.id === 'string' && model.id !== '')
          .map((model) => ({ id: model.id, name: typeof model.name === 'string' && model.name !== '' ? model.name : model.id }))
        if (items.length > 0) groups.push({ id: provider.id, name, models: items })
      } catch (err) {
        failures.push({ id: provider.id, name, message: err && err.message ? String(err.message) : String(err) })
      }
    }
    return { available: true, groups, failures }
  }

  /** 整页快照：三页共用同一构建入口，页面渲染所需数据一次给全。 */
  async function builtinConfigPayload(page) {
    const rows = builtinSettingsRows()
    if (!rows) {
      return {
        key: page.key,
        title: page.title,
        description: page.description,
        available: false,
        reason: '宿主的 settings 服务不可用（profile 未加载 settings 插件）',
        sections: [],
      }
    }
    const available = builtinPageAvailable(page, rows)
    const sections = page.sections.map((section) => builtinSectionPayload(section, rows))
    const payload = {
      key: page.key,
      title: page.title,
      description: page.description,
      available,
      sections,
    }
    if (page.key === 'web-search') {
      const web = rows.get('web')
      const webValue = web && web.value !== null && typeof web.value === 'object' ? web.value : {}
      const mode = webValue.searchProvider === 'deepseek-search-api' ? 'api' : 'messages'
      const active = sections.find((section) => section.kind === mode)
      const ref = builtinApiKeyRef(page, rows, mode)
      payload.webSearch = {
        mode,
        activeNs: active ? active.ns : null,
        switch: builtinSwitchPayload(page, rows, mode),
        apiKey: await builtinApiKeyInfo(ref),
      }
    }
    if (page.key === 'subagent') payload.models = await builtinModelCatalog()
    return payload
  }

  /** 写入值校验：与客户端的即时校验同规则，宿主在这里是最终裁决。 */
  function builtinCoerceField(def, value) {
    if (def.kind === 'int') {
      if (typeof value !== 'number' || !Number.isSafeInteger(value)) return { ok: false, message: `${def.label} 需要整数` }
      if (Number.isFinite(def.min) && value < def.min) return { ok: false, message: `${def.label} 不能小于 ${def.min}` }
      if (Number.isFinite(def.max) && value > def.max) return { ok: false, message: `${def.label} 不能大于 ${def.max}` }
      return { ok: true, value }
    }
    if (def.kind === 'bool') {
      return typeof value === 'boolean' ? { ok: true, value } : { ok: false, message: `${def.label} 需要布尔值` }
    }
    if (def.kind === 'text' || def.kind === 'provider') {
      return typeof value === 'string' ? { ok: true, value } : { ok: false, message: `${def.label} 需要文本` }
    }
    if (def.kind === 'models') {
      if (!Array.isArray(value)) return { ok: false, message: '模型清单需要数组' }
      const routes = []
      for (const item of value) {
        if (!item || typeof item.provider !== 'string' || item.provider === '' || typeof item.model !== 'string' || item.model === '') {
          return { ok: false, message: '模型清单里的每一项都需要 provider 与 model' }
        }
        routes.push({ provider: item.provider, model: item.model })
      }
      return { ok: true, value: routes }
    }
    return { ok: false, message: `未知字段类型 ${String(def.kind)}` }
  }

  function builtinFieldDef(section, key) {
    return section.fields.find((def) => def.key === key) || null
  }

  /** 保存后的回读校验：宿主状态里必须真能看到刚写进去的值。 */
  function builtinMismatches(fresh, plans) {
    const out = []
    if (!fresh || !Array.isArray(fresh.sections)) return out
    for (const plan of plans) {
      const section = fresh.sections.find((item) => item.ns === plan.ns)
      if (!section) {
        out.push({ ns: plan.ns, path: [], message: '宿主不再提供该配置命名空间' })
        continue
      }
      for (const op of plan.ops) {
        if (op.op !== 'set') continue
        const field = section.fields.find((item) => item.key === op.path[0])
        if (!field) continue
        if (JSON.stringify(field.value) !== JSON.stringify(op.value)) {
          out.push({ ns: plan.ns, path: op.path, expected: op.value, actual: field.value })
        }
      }
    }
    return out
  }

  // ── RPC：mobile.builtinConfig.pages / get / save ──────────────────────────
  // 说明：移动端页面（HOST_PAGES_HTML 同款注入）只认这三个方法；数据全部来自
  // 上面的宿主服务，任何服务缺失都返回明确的 code/message，绝不兜造默认值。
  const BUILTIN_CONFIG_CASES = {
    'mobile.builtinConfig.pages': async () => {
      const rows = builtinSettingsRows()
      if (!rows) return serviceUnavailable('settings', '宿主的设置服务未启用（profile 未加载 settings 插件），无法读取内置插件配置')
      const pages = BUILTIN_CONFIG_PAGES
        .filter((page) => builtinPageAvailable(page, rows))
        .map((page) => ({ key: page.key, title: page.title, description: page.description }))
      return { ok: true, value: { pages } }
    },

    'mobile.builtinConfig.get': async (payload) => {
      const key = payload && typeof payload.page === 'string' ? payload.page : ''
      const page = BUILTIN_CONFIG_PAGES.find((item) => item.key === key)
      if (!page) return { ok: false, error: { code: 'unknown-page', message: `未知的配置页：${key || '(空)'}` } }
      const rows = builtinSettingsRows()
      if (!rows) return serviceUnavailable('settings', '宿主的设置服务不可用，无法读取配置')
      return { ok: true, value: await builtinConfigPayload(page) }
    },

    'mobile.builtinConfig.save': async (payload) => {
      const key = payload && typeof payload.page === 'string' ? payload.page : ''
      const page = BUILTIN_CONFIG_PAGES.find((item) => item.key === key)
      if (!page) return { ok: false, error: { code: 'unknown-page', message: `未知的配置页：${key || '(空)'}` } }
      const settings = hostService('settings')
      if (!settings || typeof settings.mutate !== 'function') {
        return serviceUnavailable('settings', '宿主的设置服务未启用（profile 未加载 settings 插件），无法保存')
      }
      const rows = builtinSettingsRows()
      if (!rows) return serviceUnavailable('settings', '宿主的设置服务不可用，无法保存')

      // 字段白名单 + 类型校验：只接受本页声明过的 ns/key，拒绝任意 config 注入。
      const plans = []
      const submitted = Array.isArray(payload.sections) ? payload.sections : []
      for (const section of submitted) {
        const ns = section && typeof section.ns === 'string' ? section.ns : ''
        const def = page.sections.find((item) => builtinResolveNs(item, rows) === ns)
        if (!def) return { ok: false, error: { code: 'bad-request', message: `本页不允许写入命名空间 ${ns || '(空)'}` } }
        const ops = []
        const sets = Array.isArray(section.sets) ? section.sets : []
        for (const op of sets) {
          const path = Array.isArray(op && op.path) ? op.path.map(String) : []
          if (path.length !== 1) return { ok: false, error: { code: 'bad-request', message: '只接受一层的字段路径' } }
          const fieldDef = builtinFieldDef(def, path[0])
          if (!fieldDef) return { ok: false, error: { code: 'bad-request', message: `本页不允许写入字段 ${path.join('.')}` } }
          const coerced = builtinCoerceField(fieldDef, op && op.value)
          if (!coerced.ok) return { ok: false, error: { code: 'invalid-value', message: coerced.message } }
          ops.push({ op: 'set', path, value: coerced.value })
        }
        const unsets = Array.isArray(section.unsets) ? section.unsets : []
        for (const op of unsets) {
          const path = Array.isArray(op && op.path) ? op.path.map(String) : []
          if (path.length !== 1) return { ok: false, error: { code: 'bad-request', message: '只接受一层的字段路径' } }
          if (!builtinFieldDef(def, path[0])) return { ok: false, error: { code: 'bad-request', message: `本页不允许重置字段 ${path.join('.')}` } }
          ops.push({ op: 'unset', path })
        }
        if (ops.length === 0) continue
        // 乐观并发检查用「客户端读到的字段值」而不是 revision —— 原因见下面写循环前的注释。
        const expect = {}
        const rawExpect = section.expect !== null && typeof section.expect === 'object' ? section.expect : {}
        for (const key of Object.keys(rawExpect)) {
          if (builtinFieldDef(def, key)) expect[key] = rawExpect[key]
        }
        plans.push({ ns, ops, expect, order: page.sections.findIndex((item) => builtinResolveNs(item, rows) === ns) })
      }
      plans.sort((left, right) => left.order - right.order)

      const hasApiKey = payload.apiKey !== null && typeof payload.apiKey === 'object'
        && typeof payload.apiKey.value === 'string' && payload.apiKey.value !== ''
      if (plans.length === 0 && !hasApiKey) {
        return { ok: false, error: { code: 'nothing-to-save', message: '没有需要保存的改动' } }
      }

      const applied = []
      // 并发保护不用 settings.mutate 的 expectedRevision，而是自己比对「客户端读到的值」：
      //   宿主对含 !!js 的 entry（如 pwsh-sandbox 的 disabled: !!js ...）在
      //   configEditor.edit() 自己的 pre-reconcile 阶段就会让该 ns 的 revision +2，
      //   于是任何带 revision 的写入都必然抛 SETTINGS_CONFLICT（实测 expected 136 /
      //   now 138，连续三次都一样）——revision 在这类 entry 上根本不可用作并发令牌。
      //   这里改成写前逐个字段比对：客户端读到的值若已被别处改动就拒绝写入并把
      //   宿主当前值带回；语义（不覆盖别人的修改）不变，且对这类 entry 稳定。
      const beforeWrite = await builtinConfigPayload(page)
      for (const plan of plans) {
        const section = Array.isArray(beforeWrite.sections) ? beforeWrite.sections.find((item) => item.ns === plan.ns) : undefined
        if (!section) {
          return {
            ok: false,
            error: { code: 'settings_write_failed', message: `宿主不再提供配置命名空间 ${plan.ns}`, details: { ns: plan.ns, applied } },
            value: { page: beforeWrite },
          }
        }
        for (const op of plan.ops) {
          const key = op.path[0]
          if (!Object.prototype.hasOwnProperty.call(plan.expect, key)) continue
          const field = section.fields.find((item) => item.key === key)
          const currentValue = field ? field.value : null
          if (JSON.stringify(currentValue === undefined ? null : currentValue) !== JSON.stringify(plan.expect[key] === undefined ? null : plan.expect[key])) {
            const label = field && field.label ? field.label : key
            return {
              ok: false,
              error: {
                code: 'settings_conflict',
                message: `「${label}」已在其他位置被改成 ${JSON.stringify(currentValue)}（你读到的是 ${JSON.stringify(plan.expect[key])}），本次没有覆盖；表单已按宿主最新值刷新。`,
                details: { ns: plan.ns, path: op.path, expected: plan.expect[key], actual: currentValue, applied },
              },
              value: { page: beforeWrite },
            }
          }
        }
      }
      for (const plan of plans) {
        try {
          // 必须走 callOutsideHmr：本插件的 HTTP handler 可能仍带着上一次 HMR reload
          // 留下的 AsyncLocalStorage 标记，而 configEditor.edit() 内部会
          // hmr.runExclusive(...)，嵌套会被宿主直接拒绝（"HMR transactions cannot be
          // nested"）。pluginManager 启停那边踩过同一个坑，这里用同一个出口。
          // 不带 expectedRevision：并发保护已在上面的字段级比对里做完。
          await callOutsideHmr(() => settings.mutate(plan.ns, plan.ops))
          applied.push({ ns: plan.ns, ok: true })
        } catch (err) {
          const conflict = err !== undefined && err !== null && err.code === 'SETTINGS_CONFLICT'
          const message = err && err.message ? String(err.message) : String(err)
          return {
            ok: false,
            error: {
              code: conflict ? 'settings_conflict' : 'settings_write_failed',
              message: conflict
                ? `设置已在其他位置更新（${plan.ns}），本次没有覆盖：${message}`
                : `宿主拒绝了写入（${plan.ns}）：${message}`,
              details: { ns: plan.ns, applied },
            },
            // 回滚依据：把宿主最新状态带回，客户端按它整页重绘。
            value: { page: await builtinConfigPayload(page) },
          }
        }
      }

      // API Key：只写凭据库，不进 config；空输入一律视为「不修改」。
      let apiKeyApplied = null
      if (hasApiKey) {
        if (page.key !== 'web-search') {
          return { ok: false, error: { code: 'bad-request', message: '本页不接受 API Key 写入' } }
        }
        const web = rows.get('web')
        const webValue = web && web.value !== null && typeof web.value === 'object' ? web.value : {}
        const mode = webValue.searchProvider === 'deepseek-search-api' ? 'api' : 'messages'
        const expectedRef = builtinApiKeyRef(page, rows, mode)
        const requestedRef = typeof payload.apiKey.ref === 'string' && payload.apiKey.ref !== '' ? payload.apiKey.ref : expectedRef
        if (requestedRef !== expectedRef) {
          return { ok: false, error: { code: 'bad-request', message: 'API Key 只能写入本页声明的凭据引用' } }
        }
        const credentials = hostService('credentials')
        if (!credentials || typeof credentials.set !== 'function') {
          return serviceUnavailable('credentials', '宿主的凭据服务未启用，无法保存 API Key')
        }
        try {
          await callOutsideHmr(() => credentials.set(expectedRef, payload.apiKey.value))
          apiKeyApplied = { ref: expectedRef }
        } catch (err) {
          return {
            ok: false,
            error: {
              code: 'credential_write_failed',
              message: `宿主拒绝了 API Key 写入：${err && err.message ? String(err.message) : String(err)}`,
              details: { applied },
            },
            value: { page: await builtinConfigPayload(page) },
          }
        }
      }

      // 回读：保存成功必须能在宿主状态里看到新值（Loader reconcile 之后）。
      const fresh = await builtinConfigPayload(page)
      return {
        ok: true,
        value: {
          page: fresh,
          applied,
          apiKey: apiKeyApplied,
          mismatches: builtinMismatches(fresh, plans),
        },
      }
    },
  }

    // ══ 模型中心（设置 → 主机配置 → 模型）══════════════════════════════════════
    //
    // 桌面「模型」页（@deepseek-ai/dsh-client-ui-settings-models）用的同一组宿主能力：
    //   · llm.listProviders() / listModels()        —— 已注册路由 + 实际可用模型
    //   · llm.listConfigurableProviders()           —— 内置目录（pi-ai 42 个）+ 已配置 profile
    //   · credentials.describe / set / unset        —— provider API Key（refs 半，绝不取值）
    //   · deepseekAccount.getState()                —— DeepSeek 账号登录态（grant 存在 credentials.records）
    //   · agentDefaultModel.currentSelection()      —— 默认模型
    //
    // 写路径（阶段二）：settings.mutate('llm-pi-ai', …)、credentials.set/unset、
    // agentDefaultModel.saveSelection()；三者都经 callOutsideHmr（configEditor.edit
    // 内部会 hmr.runExclusive，嵌套会被宿主拒绝）。
    const MODELS_PI_AI_NS = 'llm-pi-ai'
    const MODELS_DEEPSEEK_NS = 'llm-deepseek'
    const MODELS_DEFAULT_NS = 'agent-default-model'
    const MODELS_ROUTE_DEEPSEEK = 'deepseek-official'
    const MODELS_ROUTE_ACCOUNT = 'deepseek-account'
    const MODELS_DEFAULT_DEEPSEEK_REF = 'DEEPSEEK_API_KEY'
    const MODELS_PROTOCOLS = ['openai-completions', 'openai-responses', 'anthropic-messages']
    // 与桌面自定义表单同一规则（asar: dsh-client-ui-settings-models 里 ROUTE_PATTERN）。
    const MODELS_PROVIDER_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/

    /** 桌面同款：没声明 apiKeyEnv 的 route 按 `<PROVIDER>_API_KEY` 派生凭据引用。 */
    function modelsKeyRef(provider) {
      return `${String(provider).toUpperCase().replace(/[^A-Z0-9]+/g, '_')}_API_KEY`
    }

    function modelsObjectOf(value) {
      return value !== null && typeof value === 'object' && !Array.isArray(value) ? value : {}
    }

    function modelsStringsOf(value) {
      return Array.isArray(value) ? value.filter((item) => typeof item === 'string' && item !== '') : []
    }

    function modelsModelViews(value) {
      if (!Array.isArray(value)) return []
      const out = []
      for (const model of value) {
        if (!model || typeof model.id !== 'string' || model.id === '') continue
        out.push({ id: model.id, name: typeof model.name === 'string' && model.name !== '' ? model.name : model.id })
      }
      return out
    }

    function modelsErrText(error) {
      if (error === undefined || error === null) return null
      if (typeof error === 'string') return error
      if (typeof error.message === 'string' && error.message !== '') return error.message
      return String(error)
    }

    /** 只回答「配置了没有 / 能不能写」，绝不把值带回手机。 */
    async function modelsCredentialInfo(credentials, ref) {
      if (!credentials || typeof credentials.describe !== 'function') {
        return { ref, available: false, configured: false, writable: false }
      }
      try {
        const info = await credentials.describe(ref)
        return {
          ref,
          available: true,
          configured: info !== undefined && info !== null && info.configured === true,
          writable: info === undefined || info === null || info.writable !== false,
        }
      } catch (err) {
        return { ref, available: false, configured: false, writable: false, error: modelsErrText(err) }
      }
    }

    /** DeepSeek 账号：只读快照（status + links + 登录进度），不做手机端登录/退出。 */
    async function modelsAccountView() {
      const account = hostService('deepseekAccount')
      if (!account || typeof account.getState !== 'function') {
        return { available: false, reason: '宿主 deepseekAccount 服务不可用' }
      }
      try {
        const state = await account.getState()
        const view = {
          available: true,
          status: state && state.status === 'credential-stored' ? 'signed-in' : 'signed-out',
          links: {
            usageUrl: state && state.links && typeof state.links.usageUrl === 'string' ? state.links.usageUrl : null,
            topUpUrl: state && state.links && typeof state.links.topUpUrl === 'string' ? state.links.topUpUrl : null,
          },
        }
        if (state && state.attempt && typeof state.attempt === 'object' && typeof state.attempt.phase === 'string') {
          view.attempt = { phase: state.attempt.phase }
        }
        return view
      } catch (err) {
        return { available: false, reason: modelsErrText(err) }
      }
    }

    function modelsSelectionView(selection) {
      if (!selection || typeof selection !== 'object') return null
      const provider = typeof selection.provider === 'string' ? selection.provider : ''
      const model = typeof selection.model === 'string' ? selection.model : ''
      if (provider === '' || model === '') return null
      return {
        provider,
        model,
        reasoningEffort: typeof selection.reasoningEffort === 'string' ? selection.reasoningEffort : null,
        overridden: false,
      }
    }

    /** 页面排序与桌面一致：DeepSeek 账号 → DeepSeek 官方 → 已配置 → 其它已注册。 */
    function modelsProviderOrder(left, right) {
      const rank = (item) => (item.provider === MODELS_ROUTE_ACCOUNT ? 0 : item.provider === MODELS_ROUTE_DEEPSEEK ? 1 : item.configured ? 2 : 3)
      const diff = rank(left) - rank(right)
      return diff !== 0 ? diff : left.provider.localeCompare(right.provider)
    }

    /** 模型中心整页快照：全部来自宿主，绝不写死目录或默认值。 */
    async function modelsCenterPayload() {
      const llm = hostService('llm')
      if (!llm || typeof llm.listProviders !== 'function') {
        return {
          available: false,
          reason: '宿主 llm 服务不可用（profile 未加载 llm 插件）',
          providers: [],
          catalog: [],
        }
      }
      const rows = builtinSettingsRows()
      const piRow = rows ? rows.get(MODELS_PI_AI_NS) : undefined
      const piValue = modelsObjectOf(piRow && piRow.value)
      const piUser = modelsObjectOf(piRow && piRow.user)
      const profiles = modelsObjectOf(piValue.providers)
      const userProfiles = modelsObjectOf(piUser.providers)
      const deepseekRow = rows ? rows.get(MODELS_DEEPSEEK_NS) : undefined
      const deepseekValue = modelsObjectOf(deepseekRow && deepseekRow.value)

      let directory = []
      try {
        directory = typeof llm.listConfigurableProviders === 'function' ? llm.listConfigurableProviders() : []
      } catch {
        directory = []
      }
      let registered = []
      try {
        registered = llm.listProviders()
      } catch {
        registered = []
      }

      const providerMap = new Map()
      const ensure = (id) => {
        if (!providerMap.has(id)) {
          providerMap.set(id, {
            provider: id,
            displayName: id,
            registered: false,
            configured: false,
            declared: false,
            editable: false,
            removable: false,
            settingsNs: '',
            settingsPath: [],
            apiKeyRef: null,
            api: null,
            baseURL: null,
            defaultBaseURL: null,
            baseURLEnv: [],
            nativeAuth: null,
            models: [],
            modelsError: null,
            credential: null,
            source: 'catalog',
            error: null,
          })
        }
        return providerMap.get(id)
      }

      for (const entry of Array.isArray(directory) ? directory : []) {
        if (!entry || typeof entry.provider !== 'string' || entry.provider === '') continue
        const item = ensure(entry.provider)
        if (typeof entry.displayName === 'string' && entry.displayName !== '') item.displayName = entry.displayName
        if (typeof entry.settingsNs === 'string') item.settingsNs = entry.settingsNs
        if (Array.isArray(entry.settingsPath)) {
          item.settingsPath = entry.settingsPath.filter((key) => typeof key === 'string')
        }
        if (entry.declared === true) item.declared = true
        if (typeof entry.defaultBaseURL === 'string' && entry.defaultBaseURL !== '') item.defaultBaseURL = entry.defaultBaseURL
        item.baseURLEnv = modelsStringsOf(entry.baseURLEnv)
        if (entry.nativeAuth && typeof entry.nativeAuth === 'object') {
          item.nativeAuth = { env: modelsStringsOf(entry.nativeAuth.env), oauth: entry.nativeAuth.oauth === true }
        }
        if (entry.error !== undefined && entry.error !== null) item.error = modelsErrText(entry.error)
      }

      for (const info of Array.isArray(registered) ? registered : []) {
        if (!info || typeof info.id !== 'string' || info.id === '') continue
        const item = ensure(info.id)
        item.registered = true
        if (typeof info.name === 'string' && info.name !== '') item.displayName = info.name
      }

      for (const item of providerMap.values()) {
        if (item.provider === MODELS_ROUTE_ACCOUNT) {
          item.source = 'account'
          item.displayName = item.displayName || 'DeepSeek Account'
          item.configured = true
          continue
        }
        if (item.provider === MODELS_ROUTE_DEEPSEEK) {
          item.source = 'deepseek'
          item.configured = true
          item.editable = true
          item.settingsNs = MODELS_DEEPSEEK_NS
          item.settingsPath = []
          item.apiKeyRef = typeof deepseekValue.apiKeyEnv === 'string' && deepseekValue.apiKeyEnv !== ''
            ? deepseekValue.apiKeyEnv
            : MODELS_DEFAULT_DEEPSEEK_REF
          item.baseURL = typeof deepseekValue.baseURL === 'string' && deepseekValue.baseURL !== '' ? deepseekValue.baseURL : null
          item.models = modelsModelViews(deepseekValue.models)
          continue
        }
        const profile = modelsObjectOf(profiles[item.provider])
        const hasProfile = Object.prototype.hasOwnProperty.call(profiles, item.provider)
        item.configured = hasProfile
        item.removable = hasProfile && Object.prototype.hasOwnProperty.call(userProfiles, item.provider)
        item.editable = item.registered || hasProfile || item.settingsPath.length > 0
        item.apiKeyRef = typeof profile.apiKeyEnv === 'string' && profile.apiKeyEnv !== ''
          ? profile.apiKeyEnv
          : modelsKeyRef(item.provider)
        if (typeof profile.api === 'string' && MODELS_PROTOCOLS.includes(profile.api)) item.api = profile.api
        item.baseURL = typeof profile.baseURL === 'string' && profile.baseURL !== '' ? profile.baseURL : item.defaultBaseURL
        const profileModels = modelsModelViews(profile.models)
        if (profileModels.length > 0) item.models = profileModels
        item.source = hasProfile ? 'profile' : (item.registered ? 'registered' : 'catalog')
      }

      // 已注册路由以 llm.listModels() 的实际清单为准（覆盖 profile 里手写的目录）。
      for (const item of providerMap.values()) {
        if (!item.registered) continue
        try {
          const models = await llm.listModels(item.provider)
          item.models = modelsModelViews(models)
        } catch (err) {
          item.modelsError = modelsErrText(err)
        }
      }

      const credentials = hostService('credentials')
      const refCache = new Map()
      for (const item of providerMap.values()) {
        if (typeof item.apiKeyRef !== 'string' || item.apiKeyRef === '') continue
        if (!refCache.has(item.apiKeyRef)) refCache.set(item.apiKeyRef, await modelsCredentialInfo(credentials, item.apiKeyRef))
        item.credential = refCache.get(item.apiKeyRef)
      }

      const account = await modelsAccountView()
      let defaultModel = null
      const defaultService = hostService('agentDefaultModel')
      if (defaultService && typeof defaultService.currentSelection === 'function') {
        try {
          defaultModel = modelsSelectionView(defaultService.currentSelection())
        } catch {
          defaultModel = null
        }
      }
      if (defaultModel !== null && rows && rows.has(MODELS_DEFAULT_NS)) {
        const row = rows.get(MODELS_DEFAULT_NS)
        const user = modelsObjectOf(row && row.user)
        defaultModel.overridden = typeof user.provider === 'string' && user.provider !== ''
      }

      // 页面列表只列「已注册或已配置」的；完整目录单独给「添加」用。
      const providers = [...providerMap.values()].filter((item) => item.registered || item.configured)
      const catalog = [...providerMap.values()].filter((item) => item.registered !== true)
      providers.sort(modelsProviderOrder)
      catalog.sort((left, right) => left.provider.localeCompare(right.provider))

      const settings = hostService('settings')
      return {
        available: true,
        // 阶段二才会真正写；这里如实告诉客户端当前宿主能不能写。
        readOnly: !(settings && typeof settings.mutate === 'function'),
        account,
        defaultModel,
        providers,
        catalog,
        // 原始 llm-pi-ai.providers：编辑已有 provider 时宿主端合并用（profile 里不含密钥）。
        profiles,
        counts: {
          providers: providers.length,
          catalog: catalog.length,
          configured: providers.filter((item) => item.configured).length,
          registered: providers.filter((item) => item.registered).length,
        },
        protocols: MODELS_PROTOCOLS,
      }
    }

    const MODELS_TRIMMED = (value) => (typeof value === 'string' ? value.trim() : '')

    /** 把客户端提交的模型清单收敛成宿主 schema 认的形状（id 必填、去重、上限 200）。 */
    function modelsNormalizeModels(value) {
      if (!Array.isArray(value)) return { ok: false, message: '模型清单需要数组' }
      const seen = new Set()
      const out = []
      for (const item of value) {
        let id = ''
        let name = ''
        if (typeof item === 'string') id = MODELS_TRIMMED(item)
        else if (item !== null && typeof item === 'object') {
          id = MODELS_TRIMMED(item.id)
          name = MODELS_TRIMMED(item.name)
        }
        if (id === '') return { ok: false, message: '每个模型都需要非空的模型 ID' }
        if (seen.has(id)) return { ok: false, message: `模型 ID 重复：${id}` }
        seen.add(id)
        out.push(name !== '' && name !== id ? { id, name } : { id })
        if (out.length > 200) return { ok: false, message: '模型数量过多（最多 200 个）' }
      }
      if (out.length === 0) return { ok: false, message: '至少需要一个模型' }
      return { ok: true, value: out }
    }

    function modelsBadRequest(message) {
      return { ok: false, error: { code: 'bad-request', message } }
    }

    /** 写完之后回读比对：客户端据此判断「真的落地了」，不是只信写接口的返回。 */
    function modelsCenterMismatches(action, payload, fresh) {
      const out = []
      if (!fresh || fresh.available !== true) {
        out.push({ field: 'available', message: '宿主模型服务不可用' })
        return out
      }
      const providerOf = (route) => (Array.isArray(fresh.providers) ? fresh.providers.find((item) => item.provider === route) : undefined)
      if (action === 'setKey') {
        const ref = typeof payload.ref === 'string' ? payload.ref : ''
        const owner = (fresh.providers || []).find((item) => item.apiKeyRef === ref)
        if (!owner || !owner.credential || owner.credential.configured !== true) {
          out.push({ field: 'credential', message: `宿主回读显示 ${ref} 仍未配置` })
        }
      } else if (action === 'setDefaultModel') {
        const model = fresh.defaultModel
        if (!model || model.provider !== payload.provider || model.model !== payload.model) {
          out.push({ field: 'defaultModel', message: '宿主回读的默认模型与提交值不一致' })
        }
      } else if (action === 'saveProvider') {
        const route = typeof payload.route === 'string' ? payload.route : ''
        const item = providerOf(route)
        if (!item || item.configured !== true) {
          out.push({ field: 'providers', message: `宿主回读不到已配置的 ${route}` })
        } else if (typeof payload.key === 'string' && payload.key !== '') {
          if (!item.credential || item.credential.configured !== true) {
            out.push({ field: 'credential', message: `${route} 的 API Key 未落地` })
          }
        }
      } else if (action === 'removeProvider') {
        const route = typeof payload.route === 'string' ? payload.route : ''
        const item = providerOf(route)
        if (item && item.configured === true) out.push({ field: 'providers', message: `宿主回读仍存在 ${route}` })
      }
      return out
    }

    /**
     * 模型中心写入口。每个动作都先按「宿主当前真值」做白名单校验（ref / route /
     * profile 都来自刚才的 modelsCenterPayload()，不认客户端自报），再走
     * callOutsideHmr（configEditor.edit 内部会 hmr.runExclusive，嵌套会被宿主拒绝）。
     */
    async function modelsCenterSave(payload) {
      const action = payload && typeof payload.action === 'string' ? payload.action : ''
      if (!['setKey', 'setDefaultModel', 'saveProvider', 'removeProvider'].includes(action)) {
        return modelsBadRequest(`未知操作：${action || '(空)'}`)
      }
      const before = await modelsCenterPayload()
      if (before.available !== true) {
        return serviceUnavailable('llm', before.reason || '宿主模型服务不可用')
      }
      const settings = hostService('settings')
      const credentials = hostService('credentials')
      const defaultService = hostService('agentDefaultModel')
      const providerOf = (route) => (before.providers || []).find((item) => item.provider === route)
      const applied = []

      try {
        if (action === 'setKey') {
          const ref = MODELS_TRIMMED(payload.ref)
          const value = typeof payload.value === 'string' ? payload.value : ''
          const allowed = new Set((before.providers || []).map((item) => item.apiKeyRef).filter((item) => typeof item === 'string' && item !== ''))
          if (!allowed.has(ref)) return modelsBadRequest(`不允许写入凭据 ${ref || '(空)'}`)
          if (value === '') return modelsBadRequest('API Key 不能为空；要移除请用删除提供商')
          if (!credentials || typeof credentials.set !== 'function') {
            return serviceUnavailable('credentials', '宿主的凭据服务未启用，无法保存 API Key')
          }
          await callOutsideHmr(() => credentials.set(ref, value))
          applied.push({ action, ref })
        } else if (action === 'setDefaultModel') {
          if (!defaultService || typeof defaultService.saveSelection !== 'function') {
            return serviceUnavailable('agentDefaultModel', '宿主的默认模型服务未启用')
          }
          const provider = MODELS_TRIMMED(payload.provider)
          const model = MODELS_TRIMMED(payload.model)
          const item = providerOf(provider)
          if (!item) return modelsBadRequest(`未知的提供商 ${provider || '(空)'}`)
          if (!(item.models || []).some((entry) => entry.id === model)) {
            return modelsBadRequest(`${provider} 没有模型 ${model || '(空)'}`)
          }
          const selection = { provider, model }
          if (typeof payload.reasoningEffort === 'string' && payload.reasoningEffort !== '') {
            selection.reasoningEffort = payload.reasoningEffort
          }
          await callOutsideHmr(() => defaultService.saveSelection(selection))
          applied.push({ action, provider, model })
        } else if (action === 'saveProvider') {
          if (!settings || typeof settings.mutate !== 'function') {
            return serviceUnavailable('settings', '宿主的设置服务未启用，无法保存提供商')
          }
          const route = MODELS_TRIMMED(payload.route)
          if (!MODELS_PROVIDER_PATTERN.test(route)) {
            return modelsBadRequest('Provider ID 需以小写字母开头，之后仅限小写字母、数字和短横线')
          }
          if (route === MODELS_ROUTE_DEEPSEEK || route === MODELS_ROUTE_ACCOUNT) {
            return modelsBadRequest('内置提供商（DeepSeek / DeepSeek 账号）不能在手机上新增或修改')
          }
          const existing = providerOf(route)
          const isEdit = existing !== undefined && existing.configured === true
          const mode = payload.mode === 'catalog' ? 'catalog' : isEdit ? 'edit' : 'custom'
          if (!isEdit) {
            const catalogEntry = (before.catalog || []).find((item) => item.provider === route)
            if (mode === 'catalog' && !catalogEntry) return modelsBadRequest(`目录里没有提供商 ${route}`)
          }
          const current = (before.profiles || {})[route]
          const profile = isEdit && current !== null && typeof current === 'object' ? { ...current } : {}
          const displayName = MODELS_TRIMMED(payload.displayName)
          if (displayName !== '') profile.displayName = displayName
          const protocol = MODELS_TRIMMED(payload.api)
          if (mode !== 'edit' || protocol !== '') {
            if (!MODELS_PROTOCOLS.includes(protocol)) {
              return modelsBadRequest('请选择有效的 API 协议（openai-completions / openai-responses / anthropic-messages）')
            }
            profile.api = protocol
          }
          const baseURL = MODELS_TRIMMED(payload.baseURL)
          if (mode !== 'edit' || baseURL !== '') {
            if (!/^https?:\/\//i.test(baseURL)) return modelsBadRequest('API 地址需以 http:// 或 https:// 开头')
            profile.baseURL = baseURL
          }
          if (Array.isArray(payload.models)) {
            const normalized = modelsNormalizeModels(payload.models)
            if (!normalized.ok) return modelsBadRequest(normalized.message)
            profile.models = normalized.value
          } else if (mode === 'custom') {
            return modelsBadRequest('自定义模型 API 至少需要一个模型')
          }
          if (typeof profile.apiKeyEnv !== 'string' || profile.apiKeyEnv === '') profile.apiKeyEnv = modelsKeyRef(route)
          await callOutsideHmr(() => settings.mutate(MODELS_PI_AI_NS, [{ op: 'set', path: ['providers', route], value: profile }]))
          applied.push({ action, route, mode: isEdit ? 'edit' : mode })
          const key = typeof payload.key === 'string' ? payload.key : ''
          if (key !== '') {
            if (!credentials || typeof credentials.set !== 'function') {
              return serviceUnavailable('credentials', '宿主的凭据服务未启用，无法保存 API Key')
            }
            await callOutsideHmr(() => credentials.set(profile.apiKeyEnv, key))
            applied.push({ action: 'setKey', ref: profile.apiKeyEnv })
          }
        } else if (action === 'removeProvider') {
          if (!settings || typeof settings.mutate !== 'function') {
            return serviceUnavailable('settings', '宿主的设置服务未启用，无法删除提供商')
          }
          const route = MODELS_TRIMMED(payload.route)
          const existing = providerOf(route)
          if (!existing || existing.configured !== true || existing.removable !== true) {
            return modelsBadRequest(`提供商 ${route || '(空)'} 不是可删除的自定义配置`)
          }
          const managedRef = existing.apiKeyRef
          if (payload.removeKey === true && typeof managedRef === 'string' && managedRef !== '' && managedRef === modelsKeyRef(route)) {
            if (!credentials || typeof credentials.unset !== 'function') {
              return serviceUnavailable('credentials', '宿主的凭据服务未启用，无法删除 API Key')
            }
            await callOutsideHmr(() => credentials.unset(managedRef))
            applied.push({ action: 'unsetKey', ref: managedRef })
          }
          await callOutsideHmr(() => settings.mutate(MODELS_PI_AI_NS, [{ op: 'unset', path: ['providers', route] }]))
          applied.push({ action, route })
        }
      } catch (err) {
        const fresh = await modelsCenterPayload()
        return {
          ok: false,
          error: {
            code: 'models_write_failed',
            message: err && err.message ? String(err.message) : String(err),
            details: { action, applied },
          },
          value: { page: fresh },
        }
      }

      const fresh = await modelsCenterPayload()
      return {
        ok: true,
        value: {
          page: fresh,
          applied,
          action,
          mismatches: modelsCenterMismatches(action, payload, fresh),
        },
      }
    }

    const MODELS_CENTER_CASES = {
      'mobile.modelsCenter.get': async () => ({ ok: true, value: await modelsCenterPayload() }),
      'mobile.modelsCenter.save': async (payload) => modelsCenterSave(payload),
    }

  /**
   * 在 HMR 事务上下文之外执行回调。
   *
   * 为什么需要：本插件的 HTTP server 若是在一次 HMR reload 中重建的，那么之后所有
   * 由这些 request handler 发起的异步调用都会继承 HMR 的 AsyncLocalStorage 标记
   *（dsh-hmr 用 `executing.getStore() === true` 判断「已在事务里」）。此时
   * pluginManager.setBundleEnabled 会走 hmr.runExclusive，直接报
   * "HMR transactions cannot be nested"，导致手机端开关永远失败。
   * `hmr.executing` 是 dsh-hmr 实例上的真实 AsyncLocalStorage，用它的 exit()
   * 退回事务外再调用，就能和桌面端一样正常启停（此时由 hmr.runExclusive 自己再开事务）。
   */
  async function callOutsideHmr(operation) {
    const hmr = hostService('hmr')
    const store = hmr && hmr.executing
    if (store && typeof store.exit === 'function') {
      return await store.exit(operation)
    }
    return await operation()
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
          observeSession(rpcContext.deviceId, sid)
          // ── B：进会话立即补发该会话当前 pending 的卡片请求帧 ────────────────
          // bundle 的提问卡/审批卡只靠：①提问发生当时的 mux 帧；②会话内
          // mobile.pending 轮询（SSE live 时 60s、非 live 1.5s）。所以「提问发生在
          // 另一个会话、之后才点进来」时，要等最多 60s 才看到卡片，用户以为卡死。
          // 这里在登记观察之后，把该会话仍在等待的项按 openMux 开场快照同款帧
          // 补发一次（envelope rpcId = entry.rpcId）：bundle 对 question 按 rpcId、
          // 对 approval 按 approvalId 去重，因此重复补发不会出现多张卡。
          purgePending()
          for (const entry of pending.approvals.values()) {
            if (entry.sessionId !== sid || typeof entry.approvalId !== 'string') continue
            emitMux({
              type: 'approval/requested',
              sessionId: sid,
              approvalId: entry.approvalId,
              toolName: typeof entry.toolName === 'string' ? entry.toolName : 'unknown',
              ...(entry.callId === undefined ? {} : { callId: entry.callId }),
              ...(entry.reason === undefined ? {} : { reason: mobileReason(entry) }),
            }, entry.rpcId)
          }
          for (const entry of pending.questions.values()) {
            if (entry.sessionId !== sid) continue
            emitMux({
              type: 'question/requested',
              sessionId: sid,
              questions: Array.isArray(entry.questions) ? entry.questions : [],
            }, entry.rpcId)
          }
        }
        return {
          ok: true,
          value: await readHistory(payload.sessionId, payload.beforeSeq, payload.maxMessages, parentHint),
        }
      }
      case 'session.prompt': {
        const requestId = `req-${randomBytes(8).toString('hex')}`
        const content = Array.isArray(payload.content) ? payload.content : []
        const requestedMode = resolveSendMode(payload.mode)
        // ── steer 带附件会丢图：自动降级为 queue ─────────────────────────
        // 复现结论（lead 用手机 RPC 实测）：sendMode=steer 时，
        //   session.prompt { mode:'steer', content:[text, image(有效PNG)] }
        // 返回 ok:true / accepted:true，但 session.history 里**没有任何 image 事件**，
        // user/message 只剩 text —— 宿主 steer 通道接受附件块却静默丢弃；
        // 同一 content 走 queue 通道则完整保留 image（之前已验证）。
        // 所以这里做插件侧兜底：只要内容里含非 text 块（image / file 等），
        // 一律改用 queue 发送，宁可晚一拍也不能丢用户的图片。
        // 纯文本 steer 不受影响，仍按 steer 发送；queue 路径原样不变。
        const hasNonTextBlock = content.some(
          (block) => block !== null && typeof block === 'object' && block.type !== 'text',
        )
        const mode = requestedMode === SEND_MODE_STEER && hasNonTextBlock ? SEND_MODE_QUEUE : requestedMode
        // ── 发消息前先登记「这台设备在看这个会话」────────────────────────
        // 现象：部分会话发出消息后气泡不即时出现，退出重进才看到。
        // 根因：本 case 原来只调 controller.prompt + emitQueue，没有登记观察；
        // 而移动端气泡靠 SSE（events.mux）推 session/event，宿主流只会跟随
        // observers 里登记过的会话。没在这里登记时，设备收不到该会话的帧，
        // 直到退出重进走 session.history(subscribe:true) 才补登记 —— 于是表现为
        // 「发完不出现，重进才见」。
        // 用 addObservationExtra（并集）而不是 addObservation（赋值）：prompt 可能
        // 发往当前会话之外的会话（如多会话并行），不能把设备正在看的会话覆盖掉；
        // ensureFollow 幂等，已在跟随时直接复用。
        if (rpcContext && typeof rpcContext.deviceId === 'string' && payload.sessionId) {
          const sid = String(payload.sessionId)
          observeSession(rpcContext.deviceId, sid)
        }
        await controller.prompt(
          {
            requestId,
            sessionId: payload.sessionId,
            // 发送模式生效点（需求 B）。
            // bundle 里 ce() 写死 mode:`queue`，改不了；所以真值来源是两条：
            //   ① 注入脚本在发消息前按设置改写 payload.mode（前端默认路径）；
            //   ② 宿主这里读已存的 sendMode 兜底（payload 没带时也一定生效）。
            // 两条都不依赖对方：只有前端改写时用它，前端没改写时用它存的默认值。
            mode,
            content,
            ...(payload.clientTimeZone ? { clientTimeZone: payload.clientTimeZone } : {}),
          },
          new AbortController().signal,
        )
        // Agent 忙时这条消息会进队列（Agent 空闲时直接进会话，队列为空帧）。
        // 宿主 prompt() 返回不等于消息已落盘，晚一拍再读才拿得到 inbox 的新行。
        if (typeof setTimeout === 'function') {
          setTimeout(() => emitQueue(payload.sessionId), 120)
        }
        const value = mode === requestedMode
          ? { accepted: true }
          : { accepted: true, degraded: true, requestedMode, mode }
        return { ok: true, value }
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
        // 全局视角（A：工作区角标用）：approvals/questions 保持原有形状不变
        //（bundle 只解构这两个字段），额外追加 sessions 汇总 —— 按 sessionId
        // 聚合待处理条数，供注入脚本在工作区列表上标「N 个会话等待回复」。
        // 带 sessionId 调用时只汇总该会话，行为对既有调用完全无影响。
        const bySession = new Map()
        const bump = (entry, kind) => {
          const sid = entry && typeof entry.sessionId === 'string' ? entry.sessionId : ''
          if (sid === '') return
          let row = bySession.get(sid)
          if (row === undefined) {
            row = { sessionId: sid, approvals: 0, questions: 0, total: 0 }
            bySession.set(sid, row)
          }
          row[kind] += 1
          row.total += 1
        }
        for (const entry of pending.approvals.values()) {
          if (sessionId !== '' && entry.sessionId !== sessionId) continue
          bump(entry, 'approvals')
        }
        for (const entry of pending.questions.values()) {
          if (sessionId !== '' && entry.sessionId !== sessionId) continue
          bump(entry, 'questions')
        }
        return { ok: true, value: { approvals, questions, sessions: [...bySession.values()] } }
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
        // 外观偏好按设备独立：bundle 每次启动都会读 ui-theme.preference 并应用
        // （Fr(value)），如果不覆盖，它就会用宿主那份跨端同步值把手机上刚设的
        // 深色顶掉 —— 表现就是「设成深色，刷新又变浅色」。
        // 这里把该设备自己的选择回填进去，手机之间/桌面端互不影响。
        const settingsDevice = rpcContext && typeof rpcContext.deviceId === 'string'
          ? devices.get(rpcContext.deviceId)
          : undefined
        const deviceTheme = settingsDevice && typeof settingsDevice.theme === 'string' ? settingsDevice.theme : ''
        if (deviceTheme === 'dark' || deviceTheme === 'light' || deviceTheme === 'system') {
          for (const entry of namespaces) {
            if (entry.ns !== 'ui-theme') continue
            const value = entry.value && typeof entry.value === 'object' ? { ...entry.value } : {}
            value.preference = deviceTheme
            entry.value = value
          }
        }
        return { ok: true, value: { writable: false, hasDocument: false, namespaces } }
      }
      case 'settings.mutate': {
        // 手机端只开放「外观偏好」这一项，而且是**按设备**存：
        //   · 写宿主 ui-theme 是跨端同步设置，手机上换深色会把桌面 GUI 一起改掉；
        //   · 用户预期是「手机自己的主题跟着手机走」，所以存进设备表，
        //     启动时再由上面的 settings.read 回填给 bundle。
        const targetId = rpcContext && typeof rpcContext.deviceId === 'string' ? rpcContext.deviceId : ''
        const target = devices.get(targetId)
        if (!target) return { ok: false, error: { code: 'unpaired', message: '设备未配对' } }
        const ns = typeof payload?.ns === 'string' ? payload.ns : ''
        if (ns !== 'ui-theme') {
          return { ok: false, error: { code: 'forbidden', message: '该设置项不允许在手机端修改' } }
        }
        const ops = Array.isArray(payload?.ops) ? payload.ops : []
        let nextTheme = ''
        for (const op of ops) {
          if (!op || op.op !== 'set' || !Array.isArray(op.path) || op.path.length !== 1 || op.path[0] !== 'preference') {
            return { ok: false, error: { code: 'bad-request', message: '只支持设置外观偏好' } }
          }
          if (op.value !== 'dark' && op.value !== 'light' && op.value !== 'system') {
            return { ok: false, error: { code: 'bad-request', message: '外观偏好只能是 dark / light / system' } }
          }
          nextTheme = op.value
        }
        if (nextTheme !== '' && target.theme !== nextTheme) {
          target.theme = nextTheme
          persistDevices(cfg.devicesFile, devices)
        }
        return { ok: true, value: { ok: true } }
      }
      // ── 设备管理 ──
      case 'pair.devices': {
        const list = [...devices.entries()].map(([deviceId, d]) => {
          const info = describeDeviceUA(d.userAgent)
          return {
            deviceId,
            name: d.name || '设备',
            createdAt: d.createdAt,
            lastSeenAt: d.lastSeenAt,
            userAgent: d.userAgent || '',
            model: d.model || info.model || '',
            label: info.label || '',
            platform: d.platform || info.platform || '',
            primary: d.primary === true,
          }
        })
        return { ok: true, value: { devices: list, maxDevices: MAX_DEVICES } }
      }
      case 'mobile.reportDevice': {
        // 手机端页面加载时上报 Client Hints（navigator.userAgentData 的
        // model / platform / platformVersion）与 UA。宿主记进设备表：
        //   · 设备管理第一行显示真实型号（有的话）；
        //   · 拿不到型号的浏览器（鸿蒙 UA 写死 "Phone"）仍由 UA 兜底出
        //     「平台 · 浏览器」，不会又退回「手机设备」；
        //   · 仍是默认名「手机设备」时，顺手把 name 换成型号/标签，
        //     手机端自己的设备面板也能看到（bundle 只读 name）。
        const deviceId = rpcContext && typeof rpcContext.deviceId === 'string' ? rpcContext.deviceId : ''
        const target = devices.get(deviceId)
        if (!target) return { ok: false, error: { code: 'not-found', message: '设备不存在' } }
        const before = JSON.stringify([target.name, target.model, target.platform, target.platformVersion, target.userAgent])
        const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
        const ua = text(payload?.ua, 180)
        if (ua !== '') target.userAgent = ua
        const info = describeDeviceUA(ua !== '' ? ua : target.userAgent)
        const model = text(payload?.model, 60) || info.model
        const platform = text(payload?.platform, 40)
        const platformVersion = text(payload?.platformVersion, 20)
        if (model !== '') target.model = model
        if (platform !== '') target.platform = platform
        if (platformVersion !== '') target.platformVersion = platformVersion
        if (target.name === undefined || target.name === '' || target.name === '手机设备') {
          const autoName = model !== '' ? model : info.label
          if (autoName !== '') target.name = autoName.slice(0, 40)
        }
        // 每次开页面都上报一次；内容没变就不落盘（避免无意义的写文件）。
        if (JSON.stringify([target.name, target.model, target.platform, target.platformVersion, target.userAgent]) !== before) {
          persistDevices(cfg.devicesFile, devices)
        }
        return { ok: true, value: { ok: true } }
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
        return { ok: true, value: commandCatalog(payload) }
      }
      case 'mobile.commandExec': {
        const executed = await commandExecute(payload)
        return executed
      }
      // 技能目录：桌面 `/` 菜单「技能」组的数据源（宿主 sessionSkillCatalog）。
      // 与 mobile.commands 分开两个 RPC —— 命令注册表与技能目录是两套来源，
      // 面板要按来源分组，不能混成一个数组。
      case 'mobile.skills': {
        return await skillCatalog(payload)
      }
      // ── 权限预设（手机工具栏「权限」按钮） ──────────────────────────────
      // bundle 自带的权限面板走两条通道：会话投影 projections.values.permissions
      // （读）和 slash 命令 `/permission <name>`（写）。后者在本插件里没有实现，
      // 所以手机上一直切不动权限。这里补一对专用 RPC，由自绘面板直接调用。
      // ── 插件页：宿主 pluginManager 的真实插件包清单 ───────────────────────
      // 数据源：@deepseek-ai/dsh-plugin-manager 的 listBundles()
      //（asar: dsh/node_modules/@deepseek-ai/dsh-plugin-manager/lib/index.js:1681）。
      // 桌面「插件管理」页用的是同一个方法（ui-plugin-manager client 调
      // ctx.remote.pluginManager.listBundles()），remote 只是把原始数组包成
      // { ok, value } 信封；这里直接在宿主进程里拿原始数组，字段完全一致。
      // 只投影手机需要的字段，不把 meta 等内部对象整包下发。
      // ── 插件页：宿主 pluginManager 的真实数据 ─────────────────────────────
      // 数据源（asar: dsh/node_modules/@deepseek-ai/dsh-plugin-manager/lib/index.js）：
      //   · listBundles() 1681 行 —— 插件包（已安装 / 官方可选 / 实验性）。
      //   · listPlugins() 1656 行 —— Loader 里每个插件行（含 meta 标题/描述/图标）。
      // 桌面「插件」页（ui-plugin-manager client）用的就是这两个方法：先
      // ctx.remote.pluginManager.listBundles() + listPlugins()，再按
      // BUILTIN_PROFILE_BUNDLES / official / MORE_BUNDLES 分成「内置插件配置 /
      // 实验性插件 / 已安装插件」三组。这里把同一份原始数据交给手机端分组。
      // ── 插件页：宿主 pluginManager 的真实数据 ─────────────────────────────
      // 数据源（asar: dsh/node_modules/@deepseek-ai/dsh-plugin-manager/lib/index.js）：
      //   · listBundles() 1681 行 —— 插件包（已安装 / 官方可选 / 实验性）。
      //   · listPlugins() 1656 行 —— Loader 里每个插件行（含 meta 标题/描述/图标）。
      // 桌面「插件」页（ui-plugin-manager client）用的就是这两个方法：先
      // ctx.remote.pluginManager.listBundles() + listPlugins()，再按
      // BUILTIN_PROFILE_BUNDLES / official / MORE_BUNDLES 分成「内置插件配置 /
      // 实验性插件 / 已安装插件」三组。这里把同一份原始数据交给手机端分组。
      // ── 插件页：宿主 pluginManager 的真实数据（列表 + 分组 + 详情）───────
      // 数据源（asar: dsh/node_modules/@deepseek-ai/dsh-plugin-manager/lib/index.js）：
      //   · listBundles() 1681 行 —— 插件包，含 rows（包内组件）、source（代码来源）、
      //     official/optional/removable/installed、meta（标题/描述/data URL 图标）。
      //   · listPlugins() 1656 行 —— Loader 里每个插件行（entryId/moduleName/enabled/
      //     fiberPhase/meta）；用来给 bundle rows 补「运行状态」，以及取「内置插件配置」
      //     那四行（它们的 meta.description.en 明确写着 dsh web client's Plugins page）。
      // 分组与桌面 ui-plugin-manager client 完全同源（client.js:598508 附近）：
      //   listed = 排除 BUILTIN_PROFILE_BUNDLES 后 installed||official||error 的 bundle
      //   已安装插件 = !official；实验性插件 = official && (!MORE_BUNDLES 或 enabled)
      // 两份名字表 COPY 自宿主 client（宿主自己也是硬编码这两张表，不是我们发明的）。
      case 'mobile.plugins': {
        const manager = hostService('pluginManager')
        if (!manager || typeof manager.listBundles !== 'function') {
          return serviceUnavailable('pluginManager', '宿主的插件管理服务未启用（profile 未加载 plugin-manager）')
        }
        let bundles
        let inventory
        try {
          [bundles, inventory] = await Promise.all([
            manager.listBundles(),
            typeof manager.listPlugins === 'function' ? manager.listPlugins() : Promise.resolve([]),
          ])
        } catch (err) {
          return {
            ok: false,
            error: {
              code: 'plugin_inventory_failed',
              message: `读取插件清单失败：${(err && err.message) || String(err)}`,
            },
          }
        }

        // 桌面插件页排除的基础 profile bundle（宿主 client.js 里的同名集合）。
        const BUILTIN_PROFILE_BUNDLES = new Set([
          '@deepseek-ai/dsh-base',
          '@deepseek-ai/dsh-web-app',
          '@deepseek-ai/dsh-headless',
          '@deepseek-ai/dsh-sdk-app',
          '@deepseek-ai/dsh-acp-app',
          '@deepseek-ai/dsh-sdk-minimal',
        ])
        // 桌面「更多」列表里的可选 bundle（宿主 client.js 的 MORE_BUNDLES）。
        const MORE_BUNDLES = new Set([
          '@deepseek-ai/dsh-experimental-tool-worktree',
          '@deepseek-ai/dsh-experimental-cot-translation-bundle',
          '@deepseek-ai/dsh-experimental-terminal-bundle',
          '@deepseek-ai/dsh-experimental-session-search',
          '@deepseek-ai/dsh-experimental-session-titles-bundle',
          '@deepseek-ai/dsh-experimental-badge-skill-bundle',
          '@deepseek-ai/dsh-experimental-ralph-bundle',
          '@deepseek-ai/dsh-experimental-plugin-market-bundle',
          '@deepseek-ai/dsh-subagent-codex',
          '@deepseek-ai/dsh-subagent-claude-code',
        ])
        // 桌面实验性分组的显示顺序（EXTENSION_BUNDLES）；不在表里的排后面。
        const EXTENSION_ORDER = [
          '@deepseek-ai/dsh-experimental-agent-team-profile',
          '@deepseek-ai/dsh-experimental-voice-input-bundle',
          '@deepseek-ai/dsh-experimental-auto-review',
          '@deepseek-ai/dsh-experimental-inspector-profile',
        ]
        // 「内置插件配置」里各行的显示顺序（与桌面插件页 basic 分组一致）：
        // 子智能体 / 网页搜索 / Agent 循环 / 终端。
        // 注意：listPlugins 的 moduleName 是 scoped 包名（@deepseek-ai/dsh-client-ui-…），
        // 所以下面统一按「最后一段包名」匹配，别写 endsWith('/ui-settings-…')（永远 false）。
        const BASIC_ORDER = [
          'dsh-client-ui-settings-subagent',
          'dsh-client-ui-settings-web-search',
          'dsh-client-ui-settings-agent-loop',
          'dsh-client-ui-settings-shell',
        ]
        // 最后一段包名 → 手机端内置配置页的 page key。
        // 这张表是「哪几行能打开真实配置页」的唯一出处：值必须与
        // BUILTIN_CONFIG_PAGES 的 key 对齐，且宿主确实 serve 了对应 ns 才算可配置。
        const BASIC_CONFIG_PAGE = {
          'dsh-client-ui-settings-subagent': 'subagent',
          'dsh-client-ui-settings-web-search': 'web-search',
          'dsh-client-ui-settings-agent-loop': 'agent-loop',
          'dsh-client-ui-settings-shell': 'shell',
        }
        const moduleSegment = (moduleName) => {
          const text = typeof moduleName === 'string' ? moduleName : ''
          const cut = text.lastIndexOf('/')
          return cut < 0 ? text : text.slice(cut + 1)
        }

        // meta.title/description 有两种真实形态（asar: dsh-app-boot readPluginMeta）：
        //   · 字符串（包名兜底）；· 本地化对象 { zh, en }（包自带 locale 的 meta.title）。
        // 原样下发，前端 zh 优先。icon 是 data URL（svg/png），可直接 <img>。
        const localizedOf = (value) => {
          if (typeof value === 'string') return value
          if (!value || typeof value !== 'object') return null
          const out = {}
          for (const key of ['zh', 'en']) {
            if (typeof value[key] === 'string' && value[key] !== '') out[key] = value[key]
          }
          return Object.keys(out).length > 0 ? out : null
        }
        const metaOf = (meta) => (meta && typeof meta === 'object'
          ? {
              title: localizedOf(meta.title),
              description: localizedOf(meta.description),
              icon: typeof meta.icon === 'string' ? meta.icon : null,
              version: typeof meta.version === 'string' ? meta.version : null,
              error: typeof meta.error === 'string' ? meta.error : null,
            }
          : null)

        const entries = Array.isArray(inventory) ? inventory : []
        const liveById = new Map()
        for (const entry of entries) {
          if (entry && typeof entry.entryId === 'string') liveById.set(entry.entryId, entry)
        }
        const projectRow = (row) => {
          const live = row && typeof row.entryId === 'string' ? liveById.get(row.entryId) : undefined
          return {
            rowId: row && typeof row.rowId === 'string' ? row.rowId : '',
            moduleName: row && typeof row.moduleName === 'string' ? row.moduleName : '',
            entryId: row && typeof row.entryId === 'string' ? row.entryId : null,
            meta: row ? metaOf(row.meta) : null,
            hasLiveEntry: live !== undefined,
            enabled: live ? live.enabled === true : false,
            fiberPhase: live && typeof live.fiberPhase === 'string' ? live.fiberPhase : null,
          }
        }
        const bundleItems = (Array.isArray(bundles) ? bundles : [])
          .filter((bundle) => bundle && typeof bundle.name === 'string')
          .map((bundle) => ({
            name: bundle.name,
            version: typeof bundle.version === 'string' ? bundle.version : null,
            description: typeof bundle.description === 'string' ? bundle.description : null,
            enabled: bundle.enabled === true,
            installed: bundle.installed === true,
            official: bundle.official === true,
            optional: bundle.optional === true,
            removable: bundle.removable === true,
            availability: typeof bundle.availability === 'string' ? bundle.availability : null,
            readOnlyReason: typeof bundle.readOnlyReason === 'string' ? bundle.readOnlyReason : null,
            source: typeof bundle.source === 'string' ? bundle.source : null,
            pluginCount: Array.isArray(bundle.rows) ? bundle.rows.length : 0,
            rows: (Array.isArray(bundle.rows) ? bundle.rows : []).map(projectRow),
            meta: metaOf(bundle.meta),
            error: bundle.error && typeof bundle.error.code === 'string' ? { code: bundle.error.code } : null,
          }))
        const listed = bundleItems.filter((bundle) => !BUILTIN_PROFILE_BUNDLES.has(bundle.name) && (bundle.installed || bundle.official || bundle.error !== null))
        const installed = listed.filter((bundle) => !bundle.official).sort((a, b) => a.name.localeCompare(b.name))
        const official = listed.filter((bundle) => bundle.official)
        const rank = (name) => {
          const index = EXTENSION_ORDER.indexOf(name)
          return index < 0 ? EXTENSION_ORDER.length : index
        }
        const extensions = official
          .filter((bundle) => !MORE_BUNDLES.has(bundle.name) || bundle.enabled)
          .sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name))

        // 内置插件配置：桌面 basic 分组来自 client 的 plugins.row.config 槽位；
        // 宿主侧没有槽位视图，但这几行在 listPlugins 里的 description 明确写着
        // "on the dsh web client's Plugins page"，用这个真实字段分流（不写死标题）。
        // configPage 只在宿主真的 serve 了对应 settings ns 时才有值 —— 没有可写的
        // 命名空间时这一行仍然只能看详情，绝不假装能配置。
        const basic = entries
          .filter((entry) => {
            const meta = entry && entry.meta
            const description = meta && meta.description
            return description && typeof description === 'object' && typeof description.en === 'string' && description.en.includes("web client's Plugins page")
          })
          .map((entry) => {
            const segment = moduleSegment(entry && entry.moduleName)
            const pageKey = Object.prototype.hasOwnProperty.call(BASIC_CONFIG_PAGE, segment) ? BASIC_CONFIG_PAGE[segment] : null
            const configurable = pageKey !== null && builtinConfigPageAvailable(pageKey)
            const configPage = configurable ? builtinPageFor(pageKey) : null
            const configPageTitle = configPage ? configPage.title : null
            const configPageDescription = configPage ? configPage.description : null
            return {
              entryId: entry.entryId,
              moduleName: entry.moduleName,
              enabled: entry.enabled === true,
              fiberPhase: typeof entry.fiberPhase === 'string' ? entry.fiberPhase : null,
              readOnlyReason: typeof entry.readOnlyReason === 'string' ? entry.readOnlyReason : null,
              meta: metaOf(entry.meta),
              configPage: configurable ? pageKey : null,
              // 桌面插件页这四行的标题/说明取页面自己的文案（子智能体 / 网页搜索 / 终端），
              // 不是 client 包的 meta.title（那是「…设置」）。这里按桌面取齐。
              configPageTitle,
              configPageDescription,
            }
          })
          .sort((a, b) => {
            const rankOf = (item) => {
              const index = BASIC_ORDER.indexOf(moduleSegment(item.moduleName))
              return index < 0 ? BASIC_ORDER.length : index
            }
            return rankOf(a) - rankOf(b)
          })

        return {
          ok: true,
          value: {
            groups: { basic, extensions, installed },
            counts: {
              basic: basic.length,
              extensions: extensions.length,
              installed: installed.length,
            },
            source: 'pluginManager.listBundles() + listPlugins()',
          },
        }
      }

      // ── 插件启停：bundle 开关 / 组件开关（宿主真实接口）─────────────────────
      // setBundleEnabled(name, enabled) 与 setPluginEnabled(entryId, enabled) 是
      // pluginManager 的公开方法（asar lib 1949 / 1930 行）。两者都把失败放进
      // 返回值 result.error（不 throw），result.application 会告诉我们是否 applied。
      case 'mobile.pluginBundleEnabled': {
        const manager = hostService('pluginManager')
        if (!manager || typeof manager.setBundleEnabled !== 'function') {
          return serviceUnavailable('pluginManager', '宿主的插件管理服务未启用，无法启停插件包')
        }
        const name = payload && typeof payload.name === 'string' ? payload.name : ''
        const enabled = payload && payload.enabled === true
        if (name === '') return { ok: false, error: { code: 'bad-request', message: '缺少插件包名 name' } }
        // 安全例外：dsh-mobile 自己就是手机端入口。手机上关掉它 = HTTP 服务随之停止，
        // 手机会永久失去入口，只能去桌面端恢复。桌面端仍可正常停用。
        if (name === 'dsh-mobile' && !enabled) {
          return { ok: false, error: { code: 'mobile_bundle_protected', message: 'dsh-mobile 是手机端入口，不能在手机上关闭；请到桌面端停用。' } }
        }
        let result
        try {
          result = await callOutsideHmr(() => manager.setBundleEnabled(name, enabled))
        } catch (err) {
          return { ok: false, error: { code: 'plugin_toggle_failed', message: (err && err.message) || String(err) } }
        }
        if (result && result.error) {
          return {
            ok: false,
            error: {
              code: typeof result.error.code === 'string' ? result.error.code : 'plugin_toggle_failed',
              message: typeof result.error.message === 'string' ? result.error.message : `宿主拒绝启停 ${name}`,
              // 把宿主原始结果带回去，便于区分「无 HMR / 被覆盖 / 文件锁冲突」等原因。
              details: { host: result },
            },
          }
        }
        return {
          ok: true,
          value: {
            name,
            enabled,
            application: result && typeof result.application === 'string' ? result.application : 'applied',
            changed: result ? result.changed === true : false,
          },
        }
      }
      case 'mobile.pluginEntryEnabled': {
        const manager = hostService('pluginManager')
        if (!manager || typeof manager.setPluginEnabled !== 'function') {
          return serviceUnavailable('pluginManager', '宿主的插件管理服务未启用，无法启停插件组件')
        }
        const entryId = payload && typeof payload.entryId === 'string' ? payload.entryId : ''
        const enabled = payload && payload.enabled === true
        if (entryId === '') return { ok: false, error: { code: 'bad-request', message: '缺少插件 entryId' } }
        let result
        try {
          result = await callOutsideHmr(() => manager.setPluginEnabled(entryId, enabled))
        } catch (err) {
          return { ok: false, error: { code: 'plugin_toggle_failed', message: (err && err.message) || String(err) } }
        }
        if (result && result.error) {
          return {
            ok: false,
            error: {
              code: typeof result.error.code === 'string' ? result.error.code : 'plugin_toggle_failed',
              message: typeof result.error.message === 'string' ? result.error.message : `宿主拒绝启停 ${entryId}`,
              details: { host: result },
            },
          }
        }
        return {
          ok: true,
          value: {
            entryId,
            enabled,
            application: result && typeof result.application === 'string' ? result.application : 'applied',
            changed: result ? result.changed === true : false,
          },
        }
      }

      case 'mobile.automations': {
        const schedule = hostService('schedule')
        if (!schedule || typeof schedule.catalog !== 'function') {
          return serviceUnavailable('schedule', '宿主的定时任务服务未启用（schedule 插件未加载）')
        }
        let catalog
        try {
          catalog = await schedule.catalog()
        } catch (err) {
          return {
            ok: false,
            error: {
              code: 'schedule_catalog_failed',
              message: `读取自动化任务失败：${(err && err.message) || String(err)}`,
            },
          }
        }
        const records = Array.isArray(catalog) ? catalog : []
        const items = records.map((record) => {
          const task = record && typeof record === 'object' ? record : {}
          const item = {
            id: typeof task.id === 'string' ? task.id : '',
            kind: typeof task.kind === 'string' ? task.kind : '',
            title: typeof task.title === 'string' ? task.title : '',
            prompt: typeof task.prompt === 'string' ? task.prompt : '',
            scheduledAt: typeof task.scheduledAt === 'string' ? task.scheduledAt : '',
            status: task.status === 'inactive' ? 'inactive' : 'active',
            sessionId: typeof task.sessionId === 'string' ? task.sessionId : '',
          }
          if (Number.isSafeInteger(task.afterSeconds)) item.afterSeconds = task.afterSeconds
          if (Number.isSafeInteger(task.everySeconds)) item.everySeconds = task.everySeconds
          if (typeof task.time === 'string') item.time = task.time
          if (typeof task.timeZone === 'string') item.timeZone = task.timeZone
          if (Array.isArray(task.weekdays)) item.weekdays = task.weekdays.filter((day) => Number.isSafeInteger(day))
          if (typeof task.expression === 'string') item.expression = task.expression
          // lastDelivery 的 schema 是 { scheduledAt, deliveredAt, messageId }（严格三键），
          // 只取投递时间给页面显示「上次投递」，不额外加工。
          if (task.lastDelivery && typeof task.lastDelivery.deliveredAt === 'string') {
            item.lastDelivery = { deliveredAt: task.lastDelivery.deliveredAt }
          }
          return item
        })
        return {
          ok: true,
          value: {
            items,
            counts: {
              total: items.length,
              active: items.filter((item) => item.status === 'active').length,
            },
            source: 'schedule.catalog()',
          },
        }
      }

      // ── 内置插件配置：子智能体 / 网页搜索 / 终端 ───────────────────────────
      // 三个方法共用同一套宿主语义（见 BUILTIN_CONFIG_PAGES 上方的注释）：
      //   · pages —— 哪几页此刻真的可配置（宿主 serve 了对应 settings ns）；
      //   · get   —— 一页的全部字段值 / 继承值 / override 状态（secret 已脱敏）；
      //   · save  —— 字段白名单校验 → settings.mutate(ns, ops, revision) → 回读校验。
      // 写入失败（含 revision 冲突）时把宿主最新状态一起带回，客户端据此整页回滚。
      case 'mobile.builtinConfig.pages':
      case 'mobile.builtinConfig.get':
      case 'mobile.builtinConfig.save': {
        const handle = BUILTIN_CONFIG_CASES[method]
        if (typeof handle !== 'function') {
          return { ok: false, error: { code: 'unknown-method', message: `未知的内置插件配置方法：${method}` } }
        }
        return handle(payload)
      }

      // ── 模型中心：设置 → 主机配置 → 模型 ───────────────────────────────────
      case 'mobile.modelsCenter.get':
      case 'mobile.modelsCenter.save': {
        const handle = MODELS_CENTER_CASES[method]
        if (typeof handle !== 'function') {
          return { ok: false, error: { code: 'unknown-method', message: `未知的模型中心方法：${method}` } }
        }
        return handle(payload)
      }

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
        // 手机端 markdown 里的本地图片（`![](相对路径)`）走这里：
        // bundle 只把路径写进 <img data-local-src>，随后用 mobile.readFile
        // 换 data URL。相对路径按会话 cwd 解析，realpath 之后必须仍在工作区
        // 内（挡 ../ 与符号链接逃逸），并且只接受图片、有大小上限。
        const requested = typeof payload?.path === 'string' ? payload.path.trim() : ''
        const sessionId = typeof payload?.sessionId === 'string' ? payload.sessionId : ''
        if (requested === '') {
          return { ok: false, error: { code: 'invalid-request', message: '缺少文件路径' } }
        }
        const cwd = sessionCwd(sessionId)
        let rootDir = cwd
        if (rootDir === '' && sessionId !== '') {
          // 不在活会话表里（历史会话被恢复/未打开）：退回会话列表里那条记录的 cwd。
          try {
            const { items = [] } = await sc().list({}, new AbortController().signal)
            const hit = items.find((it) => it && it.sessionId === sessionId)
            if (hit && typeof hit.cwd === 'string') rootDir = hit.cwd
          } catch {}
        }
        if (rootDir === '') {
          return { ok: false, error: { code: 'unavailable', message: '无法确定会话工作区' } }
        }
        let realRoot
        let realPath
        try {
          realRoot = realpathSync(rootDir)
          realPath = realpathSync(resolvePath(realRoot, requested))
        } catch {
          return { ok: false, error: { code: 'not-found', message: '文件不存在' } }
        }
        const rel = relativePath(realRoot, realPath)
        const inside = rel === '' || (!isAbsolutePath(rel) && rel.split(/[\\/]/)[0] !== '..')
        if (!inside) {
          return { ok: false, error: { code: 'forbidden', message: '只能读取工作区内的文件' } }
        }
        const mediaType = PREVIEW_IMAGE_MIME[extname(realPath).toLowerCase()]
        if (mediaType === undefined) {
          return { ok: false, error: { code: 'unsupported', message: '只支持图片预览' } }
        }
        let stat
        try {
          stat = statSync(realPath)
        } catch {
          return { ok: false, error: { code: 'not-found', message: '文件不存在' } }
        }
        if (!stat.isFile()) {
          return { ok: false, error: { code: 'invalid-request', message: '不是文件' } }
        }
        if (stat.size > PREVIEW_IMAGE_MAX_BYTES) {
          return { ok: false, error: { code: 'too-large', message: '图片太大（上限 8MB）' } }
        }
        let base64
        try {
          base64 = readFileSync(realPath).toString('base64')
        } catch {
          return { ok: false, error: { code: 'internal', message: '图片读取失败' } }
        }
        return {
          ok: true,
          value: {
            kind: 'image',
            mediaType,
            dataUrl: `data:${mediaType};base64,${base64}`,
            name: basename(realPath),
            path: realPath,
          },
        }
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
      case 'mobile.perf': {
        return { ok: true, value: {} }
      }
      // 设置 → 关于 →「依赖自检」：bundle 直接渲染 value.checks.map(...)，
      // 返回 {} 会让 ot.checks 是 undefined → undefined.map → 整页「页面出错了」白屏。
      // 空数组语义 = 「没有可报告的诊断项」：本插件目前不统计宿主总线帧数
      // （session.control / session/event / agent/assistant-stream 的 frames），
      // 所以如实给空数组，绝不伪造 ✓ 结果。
      case 'mobile.diagnostics': {
        return { ok: true, value: { checks: [] } }
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

  /**
   * 让这台设备开始跟随某个会话 —— 全插件唯一的「并集登记」出口。
   *
   * 语义 = addObservationExtra（并集，不顶掉其它会话）+ ensureFollow（幂等起流）。
   * 两处 RPC（session.history 的 subscribe 分支、session.prompt）都必须走这里。
   * 历史教训：这段逻辑曾各写一遍，于是
   *   · fccb115：单条 SSE 关闭误清设备级观察集 → 回复停在中途；
   *   · 312b954：session.prompt 漏了登记 → 发消息不出现气泡、退出重进才见。
   * 收敛成一个函数，避免第三次漏写。
   *
   * 注意：mobile.observe 不能走这里 —— 那是 bundle 每 30s 重申一次的**独占**语义
   * （addObservation 会整体替换该设备的观察集），和这里的并集追加不是一回事。
   */
  function observeSession(deviceId, sessionId) {
    addObservationExtra(deviceId, sessionId)
    ensureFollow(sessionId)
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
      case 'POST /domain':
        return requireLoopback(req, res, setPublicBase)
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

  // ── 只读截图路由：GET|HEAD /m/shot/<file> ───────────────────────────────────
  // 截图落在 ~/.dsh/dsh-mobile-shots/（唯一写入方是宿主侧脚本/人工），这里只读。
  //
  // 为什么允许匿名（不校验配对 cookie）：
  //   · 手机里的 <img src> 是浏览器原生图片加载，不会带我们的 Cookie/Authorization；
  //     一旦要求配对，这个路由在手机上就永远是 401，等于没做。
  //   · 代价被三重限制兜住：只读、只认单层文件名、只认 5 种图片扩展名 —— 暴露面是
  //     「这个目录里的图片」，不是「任意文件」。截图内容是主动贴进对话的界面证据，
  //     不含密钥；真正的写/敏感操作仍全部走 /m/api 的配对鉴权。
  //
  // 防目录穿越（多层，任何一层失手都还有下一层）：
  //   1. new URL(...).pathname 已规范化 /../；%2f 这类编码保留在原样里；
  //   2. 解码后必须整体匹配 ^[A-Za-z0-9._-]+$ —— 含 / \ : % 一律 400；
  //   3. 显式拒绝 "."、".."；
  //   4. resolve(join(SHOT_DIR, name)) 后再用 relative(SHOT_DIR, full) 复核，
  //      落点不在目录内（以 .. 开头或成绝对路径）再 400。
  function serveShot(req, res, path) {
    const method = (req.method || 'GET').toUpperCase()
    if (method !== 'GET' && method !== 'HEAD') {
      res.setHeader('Allow', 'GET, HEAD')
      return sendJson(res, 405, { ok: false, error: 'method not allowed' })
    }
    const raw = path.length > SHOT_PREFIX.length ? path.slice(SHOT_PREFIX.length + 1) : ''
    let name = raw
    try {
      name = decodeURIComponent(raw)
    } catch {
      return sendJson(res, 400, { ok: false, error: 'bad name' })
    }
    if (name === '' || name === '.' || name === '..' || !SHOT_NAME.test(name)) {
      return sendJson(res, 400, { ok: false, error: 'bad name' })
    }
    const type = SHOT_TYPES[extname(name).toLowerCase()]
    if (type === undefined) return sendJson(res, 400, { ok: false, error: 'unsupported type' })
    ensureShotDir()
    const root = resolvePath(SHOT_DIR)
    const full = resolvePath(join(root, name))
    const rel = relativePath(root, full)
    if (rel === '' || rel.startsWith('..') || isAbsolutePath(rel)) {
      return sendJson(res, 400, { ok: false, error: 'bad name' })
    }
    let info
    try {
      info = statSync(full)
    } catch {
      return sendJson(res, 404, { ok: false, error: 'not found' })
    }
    if (!info.isFile()) return sendJson(res, 404, { ok: false, error: 'not found' })
    // 符号链接防线：目录里若有人放了 evil.png → C:\...\secret，单靠文件名白名单
    // 挡不住。realpath 之后再判一次落点，越界一律 404（不泄露目标是否存在）。
    let real
    try {
      real = realpathSync(full)
    } catch {
      return sendJson(res, 404, { ok: false, error: 'not found' })
    }
    const realRel = relativePath(root, real)
    if (realRel === '' || realRel.startsWith('..') || isAbsolutePath(realRel)) {
      return sendJson(res, 404, { ok: false, error: 'not found' })
    }
    let buf
    try {
      buf = readFileSync(real)
    } catch {
      return sendJson(res, 404, { ok: false, error: 'not found' })
    }
    // no-store：同一用例重跑会用同名文件覆盖，缓存会让手机一直看到旧图。
    // 显式 Content-Length：HEAD 也要给出大小（Node 对 HEAD 会省略 body，但不会补这个头）。
    res.setHeader('Content-Length', String(buf.length))
    return sendBuffer(res, 200, type, buf, { 'Cache-Control': 'no-store' })
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
    if (path === BUNDLE_URL) {
      // bundle 会随插件更新（例如把设置行内建进去）。必须显式 no-store：
      // 1) sendBuffer 默认 public,max-age=3600，先 setHeader 会被它覆盖；
      // 2) 浏览器启发式缓存也会留下旧模块。
      return sendBuffer(res, 200, 'text/javascript; charset=utf-8', asset('mobile.bundle.js'), { 'Cache-Control': 'no-store' })
    }
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
    // 只读截图：/m/shot/<file>。放在 /m/api 之后是因为前缀互不重叠，放哪都一样；
    // 单独一个分支，绝不影响上面任何既有路由的行为。
    if (path === SHOT_PREFIX || path.startsWith(SHOT_PREFIX + '/')) return serveShot(req, res, path)
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
    // 截图目录先建好：手机端第一次 <img> 请求前它就该存在（人工/脚本往里放图）。
    ensureShotDir()
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
      let changed = false
      for (const [deviceId, d] of devices) {
        if (now - (d.lastSeenAt || d.createdAt) > IDLE_EXPIRE_MS) {
          devices.delete(deviceId)
          changed = true
        }
      }
      // 过期设备必须落盘：否则设备文件永久累积，且进程重启后 loadDevices 会把
      // 过期设备连同 token 一起复活（重新可认证、配对名额被死设备占住）。
      if (changed) {
        try { persistDevices(cfg.devicesFile, devices) } catch (e) {}
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
