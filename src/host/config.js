/**
 * 宿主配置与常量：端口/生命周期/上限、权限预设文案、发送模式、压缩阈值、余额接口。
 * 纯常量与无状态小工具（从原 index.js 顶层原样搬出）。
 */
import { homedir } from 'node:os'
import { join } from 'node:path'
import { readFileSync } from 'node:fs'

// ── 插件自身版本 + 更新源 ───────────────────────────────────────────────────
// 版本唯一真值 = **根** package.json（不是 mobile-src/package.json 里那份
// vendored dsh-palm 的 1.6.0）。手机端「关于」显示、构建期 pin、更新比对都用它。
export const PLUGIN_VERSION = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
).version
// 「检查更新」由宿主 GET config.updateUrl（手机浏览器直连第三方更新源会撞
// CORS，所以请求必须在宿主进程里发）。超时短一点：设置页只等一次点击。
export const UPDATE_FETCH_TIMEOUT_MS = 10 * 1000

/**
 * 版本比较：按点分数字段逐段比，忽略前缀 v 与预发布/构建后缀。
 * 返回 >0 表示 a 比 b 新，0 表示相同，<0 表示更旧。
 */
export function compareVersions(a, b) {
  const parse = (text) => String(text ?? '')
    .trim()
    .replace(/^v/i, '')
    .split('-')[0]
    .split('.')
    .map((part) => {
      const n = Number.parseInt(part, 10)
      return Number.isFinite(n) ? n : 0
    })
  const left = parse(a)
  const right = parse(b)
  const length = Math.max(left.length, right.length)
  for (let i = 0; i < length; i++) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

export const USAGE_CACHE_TTL_MS = 60 * 1000
export const BALANCE_FETCH_TIMEOUT_MS = 20 * 1000
export const DEEPSEEK_BALANCE_URL = 'https://api.deepseek.com/user/balance'
export const DEEPSEEK_BALANCE_NAME = 'DeepSeek'
export const DEEPSEEK_BALANCE_BASE_URL = 'https://api.deepseek.com/'
export const SEND_MODE_DEFAULT = 'queue'
export const SEND_MODE_STEER = 'steer'
export const SEND_MODE_QUEUE = 'queue'
export const COMPRESSIBLE_TYPE = /^(?:text\/|application\/(?:json|javascript|xml)|image\/svg\+xml)/i
export const MIN_COMPRESS_BYTES = 2048
export function defaultDevicesFile() {
  return join(homedir(), '.dsh', 'dsh-mobile-devices.json')
}

// ── HTTP helpers ────────────────────────────────────────────────────────────
// 文本类响应按 Accept-Encoding 压缩。
// 实测（本机直连 19387，未经过反代）：/m/ 404KB、bundle 646KB、theme.css 129KB，
// 合计 1.18MB 且无 Content-Encoding —— 弱网（Slow-4G 节流）首屏 8.6s，
// 压缩后约 0.3MB，首屏降到 2.5～3.5s 量级。压缩只对文本生效，图片/字体原样。
export const TOKEN_TTL_MS = 5 * 60 * 1000
export const IDLE_EXPIRE_MS = 7 * 24 * 3600 * 1000
export const SWEEP_INTERVAL_MS = 60 * 1000
// 手机待处理项寿命：桌面侧不受影响，只是手机上过久没处理就不用再等。
export const PENDING_TTL_MS = 30 * 60 * 1000
export const PENDING_SWEEP_MS = 60 * 1000
export const MAX_DEVICES = 16
export const DEFAULT_MOBILE_PORT = 19387
// 固定配对码：手机端不再随机、也不会过期；留空则回退为随机 6 位码。
export const DEFAULT_PAIR_CODE = '123456'
export const SMALL_BODY = 64 * 1024
export const PROMPT_BODY = 2 * 1024 * 1024
/** 手机端「添加文件」的单个文件上限（宿主侧最终把关；客户端也会先挡一次）。 */
export const MOBILE_FILE_MAX_BYTES = 24 * 1024 * 1024
// 手机点命令后的单次执行上限：bundle 侧 mobile.commandExec 的 fetch 超时是 180s，
// 宿主这里留 30s 余量，避免「前端已放弃、宿主还在 await」的悬挂。
export const COMMAND_EXEC_TIMEOUT_MS = 150 * 1000
// 技能目录读取上限：sessionSkillCatalog.list 要做一次 provider 发现（可能要读
// SKILL.md 目录），冷启动偶尔慢；15s 足够，且不让手机面板无限转圈。
export const SKILL_CATALOG_TIMEOUT_MS = 15 * 1000

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
export const PERMISSION_LABELS = {
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
export const PERMISSION_DESCS = {
  'read-only': '只读，不会改动任何文件',
  'workspace-write': '可在当前工作区内读写文件',
  'danger-full-access': '放开全部权限，风险自负',
  auto: '自动审查，按需授予',
  custom: '自定义权限配置',
}

/** 取选项中文名：命中映射则用中文，否则原样返回，绝不返回空串。 */
export function permissionLabel(text) {
  const key = typeof text === 'string' ? text.trim() : ''
  if (key === '') return ''
  const hit = PERMISSION_LABELS[key] || PERMISSION_LABELS[key.toLowerCase()]
  return hit || key
}

/** 取选项中文说明：命中映射则用中文，取不到就返回空串（面板会跳过副标题）。 */
export function permissionDesc(value, description) {
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
export const SSE_HEARTBEAT_MS = 10000
// 并发 SSE 订阅上限：一台设备重连风暴不能无限持有宿主流与心跳定时器。
export const MAX_SSE_SUBSCRIBERS = 8
// 每台设备的 SSE mux 同时跟随的会话数上限（手机同时只看很少几个会话）。
export const MAX_FOLLOWED_PER_DEVICE = 4
// follow 流异常后的重试退避。
export const FOLLOW_RETRY_MS = 3000
/**
 * 「没人再看这个会话」多久之后拆掉它的 follow 宿主流。
 * 必须明显长于 bundle 的 observe 重申周期（30s）与一次 SSE 重连的时间，
 * 否则换页/锁屏会被误判成离开 —— 那反倒把正在看的东西拆了。
 */
export const OBSERVE_TTL_MS = 5 * 60 * 1000
// 每个被观察会话最多重服务商 N 次，之后放弃该会话（手机重开会重新登记）。
export const MAX_FOLLOW_RESTARTS = 5
// 每个 SSE 连接的最大寿命上限：宿主不支持 reopen 时靠它回收资源。
export const SSE_MAX_LIFETIME_MS = 30 * 60 * 1000
/**
 * 每台设备都收的 mux 帧类型（不管它打开了哪个会话）：控制镜像、会话列表状态、
 * 审批/提问面板 —— 都是不跟着当前聊天走的全局面。其余帧是会话作用域的，按设备路由
 *（见 openMux 的 muxVisibleTo），手机不必为没打开的会话付隧道流量。
 * 与 dsh-palm 的 MUX_ALWAYS_FORWARDED 同义。
 */
export const MUX_ALWAYS_FORWARDED = new Set([
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
export const FOLLOW_ASSISTANT_STREAM = true
/**
 * 一轮流式里最多记住多少个已推 chunk 的 index（去重集合上限）。
 * 一轮正常是几百到几千个 chunk；封顶是为了长回复下不去无界增长。
 */
export const STREAM_SEEN_INDEX_MAX = 5000
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
export const STREAM_SEQ_SLOTS = 1e6

// 本文件位于 src/host/，资源仍在仓库根的 assets/。
export const COOKIE_NAME = 'dsh_mobile'
export const MOBILE_ROOT = '/m/'
export const API_PREFIX = '/m/api'
export const BUNDLE_URL = '/m/mobile.js'
export const MANIFEST_URL = '/m/manifest.webmanifest'
export const ICON_SVG_URL = '/m/icon.svg'
export const THEME_URL = '/m/theme.css'
export const ICON_192_URL = '/m/icon-192.png'
export const ICON_512_URL = '/m/icon-512.png'
export const APPLE_TOUCH_URL = '/m/apple-touch-icon.png'
// 鲸鱼尾 APNG，与桌面 DSH 同一张图；现在只用在底部「输出中」状态行（mask 画形状）。
export const WHALE_URL = '/m/whale.png'
// 浏览器推送能力自检页（只读诊断，不配对/不写设备/不订阅）。
export const PUSH_CHECK_URL = '/m/push-check'
// ── 只读截图路由：GET /m/shot/<file> → ~/.dsh/dsh-mobile-shots/<file> ────────
// 手机网页端看对话时，主机本地路径（C:\...）的图片必然裂图 —— 手机浏览器访问不到
// 主机磁盘。这里把主机上的截图目录只读地映射成一个 https 绝对 URL：
//   https://<公网域名>:45632/m/shot/<file>.png
// 安全取舍见 serveShot() 的注释（匿名只读 + 单层文件名白名单 + 扩展名白名单）。
export const SHOT_PREFIX = '/m/shot'
/** 文件下载路由前缀：GET /m/file/<token> → 会话工作区里的文件（带 Content-Disposition）。 */
export const FILE_PREFIX = '/m/file'
/** 下载令牌有效期（毫秒）。 */
export const FILE_TOKEN_TTL_MS = 10 * 60 * 1000
// 只允许单层文件名：不含 / \ : % 与空白，天然挡住目录穿越（.. 另做显式检查）。
export const SHOT_NAME = /^[A-Za-z0-9._-]+$/
export const SHOT_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}
export const SHOT_DIR = join(homedir(), '.dsh', 'dsh-mobile-shots')

