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
      warning: '<path d="M12 4.7 20.2 19H3.8z"/><path d="M12 10.1v3.4"/><path d="M12 16.3v.5"/>'
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
      ['\\u26A0', 'warning', 'chat-proc-errors']
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

  // 与旧版 renderList 完全一致的洗数据：只留 kind==='child'。
  function rowsOf(res) {
    var entries = (res && res.ok && res.value && Array.isArray(res.value.entries)) ? res.value.entries : [];
    var rows = [];
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (!e || e.kind !== 'child') continue;
      rows.push({ id: String(e.id || ''), label: e.label, activity: e.activity });
    }
    return rows;
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

  function closePanel() {
    stopTimer();
    if (panel) panel.back.classList.remove('dm-subagent-open');
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
      html +=
        '<button type="button" class="dm-subagent-row" data-sid="' + esc(r.id) + '">' +
          '<span class="dm-subagent-dot' + (running ? ' dm-subagent-dot-run' : '') + '"></span>' +
          '<span class="dm-subagent-main">' +
            '<span class="dm-subagent-label">' + esc(r.label || r.id.slice(0, 8)) + '</span>' +
            '<span class="dm-subagent-sub">' + (running ? '运行中' : '空闲') + '</span>' +
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
    rpc('session.history', { sessionId: chatSid, maxMessages: 50, parentSessionId: currentSession() }).then(function (res) {
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
          items.push({ role: 'assistant', text: excerpt(textOf(m.content), 160) });
        } else if (ev.type === 'tool/call') {
          items.push({ role: 'tool', text: String(data.name || '工具') });
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

function mobilePageHtml() {
  return [
    '<!doctype html>',
    '<html lang="zh-CN">',
    '<head>',
    '<meta charset="utf-8">',
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
    '<script type="module" src="/m/mobile.js"></script>',
    MODEL_BUTTON_HTML,
    SHEET_CLOSE_HTML,
    EMOJI_ICON_HTML,
    TURN_PILL_HTML,
    SUBAGENT_BTN_HTML,
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
    return entry
  }

  function dropPending(map, key, indexKey, entry) {
    map.delete(key)
    if (indexKey !== undefined && pending.byApprovalId.get(indexKey) === key) pending.byApprovalId.delete(indexKey)
    // 标记成永不超时：下一次 sweep 不会再重复处理同一条目。
    entry.expiresAt = Number.POSITIVE_INFINITY
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
      dropPending(pending.approvals, entry.rpcId, entry.approvalId, entry)
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
      dropPending(pending.questions, entry.rpcId, undefined, entry)
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

  async function dispatchRpc(method, payload) {
    const controller = sc()
    switch (method) {
      case 'session.list': {
        const { items = [] } = await controller.list({ cursor: payload.cursor }, new AbortController().signal)
        return { ok: true, value: { items } }
      }
      case 'session.history': {
        if (!payload.sessionId) return { ok: false, error: { code: 'bad-request', message: 'sessionId required' } }
        const parentHint = typeof payload.parentSessionId === 'string' ? payload.parentSessionId : undefined
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
            mode: payload.mode === 'steer' ? 'steer' : 'queue',
            content: Array.isArray(payload.content) ? payload.content : [],
            ...(payload.clientTimeZone ? { clientTimeZone: payload.clientTimeZone } : {}),
          },
          new AbortController().signal,
        )
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
        await wr().archiveSession(payload.sessionId, { stopActivity: true })
        return { ok: true, value: { archivedSessionIds: [] } }
      }
      case 'mobile.preferences': {
        // 手机 bundle 的启动探针；形态必须匹配 dsh-palm，否则会判定「连不上 host」。
        return { ok: true, value: { mobileEnterToSend: true } }
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
      // ── 预设 / 子代理 ──
      case 'agentPreset.list': {
        return { ok: true, value: { presets: [], authorable: false, hasDocument: false } }
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
        return { ok: true, value: {} }
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
          dropPending(pending.approvals, rpcId, response.approvalId, entry)
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
          dropPending(pending.questions, rpcId, undefined, entry)
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
      case 'mobile.diagnostics':
      case 'mobile.observe': {
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
      result = await dispatchRpc(method, envelope.payload || {})
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

    // SSE endpoints not implemented: answer 404 so the phone falls back to polling.
    if (sub === '/events.mux' || sub === '/events.notify') {
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
    if (path === BUNDLE_URL) return sendBuffer(res, 200, 'text/javascript; charset=utf-8', asset('mobile.bundle.js'))
    if (path === MANIFEST_URL) return sendText(res, 200, 'application/manifest+json', manifestJson())
    if (path === ICON_SVG_URL) return sendBuffer(res, 200, 'image/svg+xml', asset('icon.svg'))
    if (path === ICON_192_URL) return sendBuffer(res, 200, 'image/png', asset('icon-192.png'))
    if (path === ICON_512_URL) return sendBuffer(res, 200, 'image/png', asset('icon-512.png'))
    if (path === APPLE_TOUCH_URL) return sendBuffer(res, 200, 'image/png', asset('apple-touch-icon.png'))
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
      { kind: 'exact', path: BUNDLE_URL, handler: (req, res) => routeRequest(req, res) },
      { kind: 'exact', path: MANIFEST_URL, handler: (req, res) => routeRequest(req, res) },
      { kind: 'exact', path: ICON_SVG_URL, handler: (req, res) => routeRequest(req, res) },
      { kind: 'exact', path: ICON_192_URL, handler: (req, res) => routeRequest(req, res) },
      { kind: 'exact', path: ICON_512_URL, handler: (req, res) => routeRequest(req, res) },
      { kind: 'exact', path: APPLE_TOUCH_URL, handler: (req, res) => routeRequest(req, res) },
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
