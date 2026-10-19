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
import { textOfEventData, muxLineOf, queueItemView, createMuxRuntime } from './sse.js'
import { createHostState } from './state.js'
import { normalizePublicBase, loadPublicBase, savePublicBase, loadDevices, persistDevices, protectedSessionsFile, loadProtectedSessionIds, createDeviceAuth } from './devices.js'
import { USAGE_CACHE_TTL_MS, BALANCE_FETCH_TIMEOUT_MS, DEEPSEEK_BALANCE_URL, DEEPSEEK_BALANCE_NAME, DEEPSEEK_BALANCE_BASE_URL, SEND_MODE_DEFAULT, SEND_MODE_STEER, SEND_MODE_QUEUE, COMPRESSIBLE_TYPE, MIN_COMPRESS_BYTES, defaultDevicesFile, TOKEN_TTL_MS, IDLE_EXPIRE_MS, SWEEP_INTERVAL_MS, PENDING_TTL_MS, PENDING_SWEEP_MS, MAX_DEVICES, DEFAULT_MOBILE_PORT, DEFAULT_PAIR_CODE, SMALL_BODY, PROMPT_BODY, COMMAND_EXEC_TIMEOUT_MS, SKILL_CATALOG_TIMEOUT_MS, PERMISSION_LABELS, PERMISSION_DESCS, permissionLabel, permissionDesc, SSE_HEARTBEAT_MS, MAX_SSE_SUBSCRIBERS, MAX_FOLLOWED_PER_DEVICE, FOLLOW_RETRY_MS, OBSERVE_TTL_MS, MAX_FOLLOW_RESTARTS, SSE_MAX_LIFETIME_MS, MUX_ALWAYS_FORWARDED, FOLLOW_ASSISTANT_STREAM, STREAM_SEEN_INDEX_MAX, STREAM_SEQ_SLOTS, COOKIE_NAME, MOBILE_ROOT, API_PREFIX, BUNDLE_URL, MANIFEST_URL, ICON_SVG_URL, THEME_URL, ICON_192_URL, ICON_512_URL, APPLE_TOUCH_URL, WHALE_URL, PUSH_CHECK_URL, SHOT_PREFIX, SHOT_NAME, SHOT_TYPES, SHOT_DIR } from './config.js'
import { assetCache, asset, bundleVersion, assetText, __dirname, ensureShotDir } from './assets.js'
import { compressCache, compressFor, send, sendJson, sendHtml, sendText, sendBuffer, readBody, readJsonBody, parseCookies, isLoopback, lanIPv4Addresses } from './http.js'



// bundle/theme 这类 Buffer 会被 asset() 按 mtime 缓存复用，这里也按对象缓存压缩结果，
// 避免每次请求重复压缩 646KB。字符串响应（HTML）本身每请求重建，只能现压。






// ── device store ────────────────────────────────────────────────────────────




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


// ── 用量页：DeepSeek 官方余额（宿主代理查询） ──────────────────────────────
//
// 手机设置页「用量 / 套餐与配额」的数据取值全部发生在宿主进程内：
// bundle 只拿到拼好的展示字符串，任何 API Key / 平台 token 都不会出现在
// 返回体里（19387 可能经公网反代，用例 BUILD-MOB-003）。

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

/**
 * 通知设置页标记。
 *
 * 通知页（设置 → 通知）由 bundle 渲染，内部用 .settings-field 的竖排结构：
 * 标题 → 控件 → 说明。用户希望改成「左边标题、右边参数」的横向行，但 bundle
 * 禁止修改，只能由 theme.css 覆盖。CSS 又没法按页面标题选父级，所以这里在
 * <body> 上挂一个 .dm-notify-page（当前页标题是「通知」时），theme.css 用
 * body.dm-notify-page 作用域；挂在 body 上不会被 React 重渲染抹掉。
 */


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
    // 唤醒时立刻跑一次 tick：否则要等下一个 120ms 周期，进页面时控件会滞后。
    wake: function () {
      startTick();
      try { tick(); } catch (e) {}
    }
  };
  normalListeners.push(ensureTick.wake);

  // 进聊天页时 composer 会重新挂载。那一刻立刻唤醒一次 ensure tick，否则要等 600ms 切片
  // + 各任务 800ms 周期，用户会看到「工具栏图标后来才蹦出来」。
  // 只在 composer 元素身份变化（挂载/卸载）时唤醒一次，不挂全帧通道 —— 我们的控件写入
  // 会再次触发总线，全帧唤醒会形成「写入→通知→再写入」的循环。
  var composerSeen = null;
  frameListeners.push(function () {
    var c = document.querySelector('.chat-composer');
    if (c === composerSeen) return;
    composerSeen = c;
    if (c) ensureTick.wake();
  });

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
    `<script type="module" src="/m/mobile.js?v=${bundleVersion()}"></script>`,
    VIEWPORT_VH_HTML,
    // 聊天/待发送图片的全屏预览（捕获阶段委托，抢在 bundle 自带 lightbox 之前）。
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
    '<li><span class="pc-tag pc-tag-no">http</span> <code>http://192.168.1.10:19387/m/push-check</code> — 局域网，必定不可用（仅用于对照）</li>',
    '<li><span class="pc-tag pc-tag-ok">https</span> <code>https://your-host.example.com:45632/m/push-check</code> — 公网反代，<b>用这个测</b></li>',
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
// ── 受保护会话 ──────────────────────────────────────────────────────────────
// 记录在 ~/.dsh/dsh-mobile-protected.json（{ "sessionIds": [...] }）。
// 手机端不允许归档这些会话；插件加载/热重载时还会把它们从归档集合里恢复，
// 防止滑动删除、清理脚本之类的操作把用户主会话误归档（列表里「消失」）。




/**
 * 宿主实现：HTTP 两个 face、设备/配对、SSE、RPC、页面渲染。
 * 由入口 index.js 的 apply() 调用；纯搬迁自原 index.js，行为不变。
 */
export function createHost(ctx, config) {
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

  const state = createHostState({ devices: loadDevices(cfg.devicesFile) })
  const devices = state.devices
  const { muxVisibleTo, emitMux } = createMuxRuntime({ state })
  const {
    deviceTokensOf, authenticatedDevice, describeDeviceUA, createDevice,
    fixedPairCode, issuePairToken, acceptPairCode,
  } = createDeviceAuth({ state, cfg })
  let notifyConfig = loadNotifyConfig(cfg.pushConfigFile)
  // 发送模式：手机端唯一一处真值；下发 mobile.preferences，写回 session.prompt。
  let sendMode = loadSendMode(cfg.sendModeFile)
  // 设置面板里填的公网域名；空字符串表示沿用 profile 配置里的 publicBaseUrl。
  let publicBaseOverride = loadPublicBase(cfg.publicBaseFile)
  const cookieName = COOKIE_NAME
  // 用量页缓存：60 秒 TTL，只缓存查询成功的视图（含数据采集时刻 fetchedAt）。
  let usageCache = { at: 0, view: null }







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
      : (state.pairToken && now <= state.pairToken.expiresAt ? { code: state.pairToken.code, expiresAt: state.pairToken.expiresAt, fixed: false } : null)
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
  // 待处理注册表：容器在 state.js（ctxBag），这里用别名保持原引用。
  const pending = state.pending

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
    // 系统通知面：页面在后台/锁屏时 events.notify 会弹通知 + 震动。
    // 「隐藏详情」开关走服务端 notifyConfig.hideDetails（与第三方推送同一份配置）。
    const hideNotificationDetail = !!(notifyConfig && notifyConfig.hideDetails === true)
    const approvalTitle = `需要审批 · ${typeof entry.toolName === 'string' ? entry.toolName : '工具'}`
    const approvalBody = hideNotificationDetail ? '有一个审批正等着你处理' : (mobileReason(entry) || '有一个审批正等着你处理')
    emitNotify({
      title: approvalTitle,
      body: approvalBody,
      id: `approval-${approvalId}`,
      sessionId,
    })
    // 浏览器通知不可用（页面已关/权限没给）时，已配置的第三方通道仍能提醒。
    deliverNotify(notifyConfig, { title: approvalTitle, body: approvalBody }).catch(() => {})
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
    // 系统通知面：提问也要提醒（否则手机在后台时同样静默）。
    const firstQuestion = entry.questions[0] && typeof entry.questions[0].question === 'string'
      ? entry.questions[0].question
      : ''
    const questionBody = notifyConfig && notifyConfig.hideDetails === true ? '有一个提问正等着你' : (firstQuestion || '有一个提问正等着你')
    emitNotify({
      title: '需要你回答',
      body: questionBody,
      id: `question-${rpcId}`,
      sessionId,
    })
    deliverNotify(notifyConfig, { title: '需要你回答', body: questionBody }).catch(() => {})
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
  // 说明：移动端页面（原 HOST_PAGES_HTML 注入，现 mobile-src/src/mobile/dm-pages/host-pages.ts）只认这三个方法；数据全部来自
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
        // 受保护会话：任何来源都不许从手机端归档（桌面端仍可操作）。
        if (loadProtectedSessionIds().has(String((payload && payload.sessionId) || ''))) {
          return { ok: false, error: { code: 'protected', message: '该会话受保护，不能从手机端归档' } }
        }
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
      case 'workspace.unarchiveSession': {
        // 反归档：把会话从 registry 的归档集合里移除（宿主 setState 会持久化），
        // 用来恢复滑动删除误伤的会话。幂等：不在集合里时什么也不做。
        let archived = []
        try {
          const reg = wr()
          if (!reg || typeof reg.unarchiveSession !== 'function') {
            return { ok: false, error: { code: 'unavailable', message: '宿主工作区服务不支持反归档' } }
          }
          await reg.unarchiveSession(String((payload && payload.sessionId) || ''))
          if (Array.isArray(reg.archivedSessionIds)) archived = [...reg.archivedSessionIds]
        } catch (err) {
          const message = err && err.message ? err.message : String(err)
          console.error('[dsh-mobile] unarchiveSession failed:', message)
          return { ok: false, error: { code: 'unarchive-failed', message } }
        }
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
  const observers = state.observers

  /**
   * deviceId → 最近一次声明在看的会话（**不随流关闭清掉**）。
   * 只用于新流进场时补一帧队列：流断了之后 observers 会被 releaseDevice 清空，
   * 而 bundle 下一次 observe 重申要等最多 30s —— 期间新流拿不到任何队列帧，
   * dock 就停在断流前的条数上。用它把这段空窗抹掉。
   */
  const lastObservedByDevice = state.lastObservedByDevice

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

  /**
   * session/event 的来源之一：sessionController.follow({address}, signal)。
   *
   * **生命周期挂在「正在看的那个会话」上，而不是挂在单次 SSE 连接上**：手机的 SSE 会
   * 因隧道抖动/锁屏/后台等各种原因频繁重连，而 bundle 的 `mobile.observe` 重申是
   * 每 30s 一次。若把 follow 绑在某条 SSE 连接上，每次重连都可能落到
   * 「重连 → 下一次 observe 重申」这段最坏 30s 的空窗里，期间会话产生的事件没人跟进。
   * 所以这里按 sessionId 做单例，断开 SSE 不拆 follow；只有「再没有设备在看」时才回收。
   */
  const follows = state.follows // sessionId -> { ref: AbortController, task }
  /** sessionId -> 最近一次有设备声明在看它的时刻（回收器的计时基准）。 */
  const lastObserved = state.lastObserved

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
  const streamStates = state.streamStates

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
  const lastPersistedSeq = state.lastPersistedSeq

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
  const lastStep = state.lastStep

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
  const muxStreams = state.muxStreams

  /** 一帧 → 一条 SSE data 行；不可序列化时返回 undefined。 */


  /** 向所有 SSE 连接推一帧。frame 必须是 bundle 认识的 mux 帧形。 */


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

  // ── 浏览器通知流：GET /m/api/events.notify ────────────────────────────────
  // 手机 bundle 在页面切到后台时会订阅这条 SSE（bundle 的 mr() / _r()）：
  // 收到 {type:'notify', payload:{title, body, id, sessionId}} 就弹系统通知，
  // 并按「震动」开关 navigator.vibrate(15)。以前这里固定 404，于是
  // 「dsh 端审批出现了，手机没有任何提醒」——只剩前台铃铛角标。
  // 现在审批/提问登记时各推一帧；没有手机连着时零开销。
  const notifyStreams = new Set()

  function emitNotify(event) {
    if (notifyStreams.size === 0) return
    const json = JSON.stringify({ type: 'notify', payload: event })
    for (const stream of [...notifyStreams]) stream.write(json)
  }

  function openNotify(req, res) {
    if ((req.method || 'GET').toUpperCase() !== 'GET') {
      res.statusCode = 405
      res.end()
      return
    }
    // 与 events.mux 同一套鉴权：未配对设备 403（bundle 会走降级路径）。
    const device = authenticatedDevice(req)
    if (!device) {
      req.resume()
      sendJson(res, 403, { ok: false, error: { code: 'unpaired', message: 'mobile session is not paired' } })
      return
    }
    if (notifyStreams.size >= MAX_SSE_SUBSCRIBERS) {
      sendJson(res, 429, { ok: false, error: { code: 'too-many-events', message: 'too many live streams' } })
      return
    }
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    })
    try {
      if (res.socket && typeof res.socket.setNoDelay === 'function') res.socket.setNoDelay(true)
    } catch {}
    try {
      if (typeof res.flushHeaders === 'function') res.flushHeaders()
    } catch {}

    let heartbeat
    const stream = {
      deviceId: device.deviceId,
      closed: false,
      write(json) {
        if (this.closed) return
        try {
          res.write(`data: ${json}\n\n`)
        } catch {
          closeStream()
        }
      },
    }
    function closeStream() {
      if (stream.closed) return
      stream.closed = true
      notifyStreams.delete(stream)
      clearInterval(heartbeat)
      try {
        res.end()
      } catch {}
    }
    notifyStreams.add(stream)
    try {
      res.write(': notify\n\n')
    } catch {}
    heartbeat = setInterval(() => {
      if (stream.closed) return
      // 设备被撤销/停用后立即断流（与 mux 一致）。
      if (devices.get(stream.deviceId) === undefined) {
        closeStream()
        return
      }
      try {
        res.write(': ping\n\n')
      } catch {
        closeStream()
      }
    }, SSE_HEARTBEAT_MS)
    req.on('close', closeStream)
    res.on('close', closeStream)
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
    // SSE：浏览器通知流（页面在后台时 bundle 用它弹系统通知 + 震动）。
    if (sub === '/events.notify') return openNotify(req, res)

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
      // 页面引用的是 mobile.js?v=<bundle 版本>：同一版本内容永不变化，可以长缓存。
      // 否则每次打开/刷新手机页面都要重传 1.1MB（br 288KB），弱网下就是"加载很慢"。
      // 版本升级时 HTML 里的 ?v 会变 → 自然重新拉取；没有 ?v 的请求（手输地址/旧书签）
      // 仍走 no-store，避免拿到旧模块。
      const versioned = url.searchParams.has('v')
      return sendBuffer(res, 200, 'text/javascript; charset=utf-8', asset('mobile.bundle.js'), {
        'Cache-Control': versioned ? 'public, max-age=31536000, immutable' : 'no-store',
      })
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
      if (state.pairToken && now > state.pairToken.expiresAt) state.pairToken = null
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

  // 受保护会话：加载/热重载后自动反归档（幂等；registry 未就绪就跳过）。
  // 延迟执行，等宿主的 workspaceRegistry 完成装配。
  {
    const protectedIds = loadProtectedSessionIds()
    if (protectedIds.size > 0) {
      const timer = setTimeout(() => {
        try {
          const reg = wr()
          if (!reg || typeof reg.unarchiveSession !== 'function') return
          for (const id of protectedIds) {
            Promise.resolve(reg.unarchiveSession(id)).catch(() => {})
          }
        } catch {}
      }, 1500)
      timer.unref?.()
    }
  }

  console.log(`[dsh-mobile] mounted: mobile bundle on webServer + 0.0.0.0:${cfg.mobilePort} (devices: ${devices.size})`)
}
