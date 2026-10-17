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
export const inject = ['webServer', 'sessionController', 'workspaceRegistry', 'credentials', 'deepseekAccount']

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
  const timeoutController = new AbortController()
  const timeoutTimer = setTimeout(() => timeoutController.abort(), BALANCE_FETCH_TIMEOUT_MS)
  timeoutTimer.unref?.()
  let response
  try {
    response = await fetch(DEEPSEEK_BALANCE_URL, {
      method: 'GET',
      headers: { accept: 'application/json', authorization: `Bearer ${apiKey}` },
      signal: timeoutController.signal,
    })
  } catch (error) {
    if (timeoutController.signal.aborted) throw new Error('DeepSeek balance query timed out')
    throw error
  } finally {
    clearTimeout(timeoutTimer)
  }
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
// ▾/▸ 折叠箭头和正文里的 emoji 都不会被碰到。用 splitText + replaceChild 做替换，
// 绝不 innerHTML 重写整个节点（会毁掉 React 状态与事件）。
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
      // 工具步骤行：search / read / bash / write|edit / code / 其它
      ['\\u{1F50D}', 'search', 'chat-tool-lead'],
      ['\\u{1F4C2}', 'read', 'chat-tool-lead'],
      ['\\u2699\\uFE0F', 'gear', 'chat-tool-lead'],
      ['\\u2699', 'gear', 'chat-tool-lead'],
      ['\\u270F\\uFE0F', 'pencil', 'chat-tool-lead'],
      ['\\u270F', 'pencil', 'chat-tool-lead'],
      ['\\u{1F4BB}', 'code', 'chat-tool-lead'],
      ['\\u{1F527}', 'tool', 'chat-tool-lead'],
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

    // 单个文本节点：命中就切出该 emoji 换成 <svg>，剩余文本继续扫，直到没有命中。
    function scanNode(node) {
      var guard = 0;
      while (node && node.parentNode && guard++ < 60) {
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
        if (!seq) {
          node.dmIconDone = 1;
          return;
        }
        var target = node;
        if (at > 0) target = target.splitText(at);
        var rest = target.splitText(seq.length);
        target.parentNode.replaceChild(makeIcon(key), target);
        node = rest;
      }
    }

    function skip(node) {
      var p = node.parentNode;
      if (!p || !p.nodeName) return true;
      var n = p.nodeName;
      return n === 'SCRIPT' || n === 'STYLE' || n === 'NOSCRIPT' || n === 'TEXTAREA';
    }

    function walk(root) {
      if (!root) return;
      if (root.nodeType === 3) {
        if (!root.dmIconDone && !skip(root)) scanNode(root);
        return;
      }
      if (root.nodeType !== 1) return;
      var tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
      var n = tw.nextNode();
      while (n) {
        var next = tw.nextNode();
        if (!n.dmIconDone && !skip(n)) scanNode(n);
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
      for (var i = 0; i < records.length; i++) {
        // React 改写了文本：清掉标记，下次 flush 重新扫这个节点。
        if (records[i].type === 'characterData' && records[i].target) records[i].target.dmIconDone = 0;
      }
      schedule();
    });
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });
    schedule();
  } catch (e) {}
})();
</script>`

// 轮次药丸（.chat-jump-turns）改造：
//  1) 把 label 里的 "/" 文本节点换成一条短横线（.dm-turn-sep），两个数字分别
//     包进 .dm-turn-cur / .dm-turn-total —— 配合 theme.css 的 flex 纵向堆叠，
//     读起来就是「当前在上、横线、总数在下」。
//  2) 关掉长按刮擦：在捕获阶段吞掉该按钮的 pointerdown/move/up/cancel/
//     lostpointercapture，bundle 的 wr/Tr/Er/Dr 完全收不到事件。
//     但打开清单的 setState（dn）在模块闭包里，脚本调不到；而 bundle 的
//     onClick 只在 e.detail===0（键盘）时才 dn(!0)。于是「点击」改为：
//     给按钮打上 data-dm-bypass 让拦截器放行一轮，再派发一对合成的
//     pointerdown/pointerup（同一坐标 = 未移动），Er 就会走 !t.moved 分支
//     调 dn(!0) 打开轮次清单。全程 try/catch，失败只退化为「点不开」，
//     不会报错、也不会恢复刮擦。
const TURN_PILL_HTML = `<script>
(function () {
  var PILL = '.chat-jump-turns';
  var LABEL = '.chat-jump-turns-label';
  var SEP = 'dm-turn-sep';
  var POINTER_EVENTS = ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'lostpointercapture'];
  var done = new WeakSet();

  function pillOf(node) {
    return node && node.closest ? node.closest(PILL) : null;
  }

  // ── 1) 分隔线：把 "/" 换成横线元素 ───────────────────────────────────
  // bundle 渲染的是「当前轮」「/」「总轮」三个文本节点；React 只会改文本
  // 节点的 data，不会重建它们，所以替换一次即可长期有效。数字变化后重跑
  // 也只是把同样的结构再确认一遍（幂等）。
  function decorate(label) {
    if (!label || done.has(label)) return;
    var sep = label.querySelector('.' + SEP);
    if (sep) { done.add(label); return; }
    var texts = [];
    for (var i = 0; i < label.childNodes.length; i++) {
      var n = label.childNodes[i];
      if (n.nodeType === 3) texts.push(n);
    }
    if (texts.length < 3) return; // 结构不是 [cur, "/", total]，不动

    var cur = texts[0];
    var slash = texts[1];
    var total = texts[texts.length - 1];

    // 数字各包一层 span（顺便把 tabular-nums 用上，避免位数变化时抖动）
    var curSpan = document.createElement('span');
    curSpan.className = 'dm-turn-cur';
    curSpan.textContent = cur.nodeValue || '';
    var totalSpan = document.createElement('span');
    totalSpan.className = 'dm-turn-total';
    totalSpan.textContent = total.nodeValue || '';

    var sepSpan = document.createElement('span');
    sepSpan.className = SEP;
    sepSpan.setAttribute('aria-hidden', 'true');

    // 顺序：当前 → 横线 → 总数；中间的 "/" 与其它文本节点清空（保留节点，
    // 免得 React 按索引更新时对不上）。
    label.replaceChild(curSpan, cur);
    slash.nodeValue = '';
    if (total !== slash) total.nodeValue = '';
    for (var j = 0; j < texts.length; j++) {
      var t = texts[j];
      if (t !== cur && t !== slash && t !== total) t.nodeValue = '';
    }
    label.insertBefore(sepSpan, total.parentNode === label ? total : null);
    label.replaceChild(totalSpan, total);

    // 上面的 insertBefore 在 total 之前插入，但 flex 纵向容器里空文本节点
    // 不占位；再兜一层：确保 DOM 顺序是 curSpan, sepSpan, totalSpan。
    if (curSpan.nextSibling !== sepSpan) label.insertBefore(sepSpan, curSpan.nextSibling);
    if (sepSpan.nextSibling !== totalSpan) label.appendChild(totalSpan);

    done.add(label);

    // 数字变化：React 改的是 span 里的文本，用 characterData 观察不到了，
    // 但 span 引用不变，无需处理；真正会重建的是 label 本身（整块重渲染），
    // 那时 MutationObserver 会拿到新节点重新 decorate。
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

  // ── 2) 关掉刮擦手势 ─────────────────────────────────────────────────
  for (var e = 0; e < POINTER_EVENTS.length; e++) {
    document.addEventListener(POINTER_EVENTS[e], function (event) {
      var pill = pillOf(event.target);
      if (!pill) return;
      if (pill.getAttribute('data-dm-bypass') === '1') return; // 放行一次
      // 只掐掉 bundle 的手势逻辑；原生默认行为（焦点、滚动）不受影响。
      event.stopImmediatePropagation();
    }, true);
  }

  // ── 3) 点击 = 打开轮次清单 ──────────────────────────────────────────
  // bundle 的 Er 在「未移动」的 pointerup 上调 dn(!0)。合成的 pointer 事件
  // 需要 pointerId/isPrimary 等字段，老浏览器没有 PointerEvent 构造器的
  // 话就直接放弃（此时单击无反应，但刮擦仍已禁用）。
  var canSynthesize = typeof window.PointerEvent === 'function';

  function fireTap(pill) {
    if (!canSynthesize) return false;
    try {
      var r = pill.getBoundingClientRect();
      var x = Math.round(r.left + r.width / 2);
      var y = Math.round(r.top + r.height / 2);
      var opts = {
        bubbles: true,
        cancelable: true,
        composed: true,
        pointerId: 1,
        pointerType: 'touch',
        isPrimary: true,
        clientX: x,
        clientY: y,
        screenX: x,
        screenY: y,
        buttons: 1,
      };
      pill.setAttribute('data-dm-bypass', '1');
      try {
        pill.dispatchEvent(new PointerEvent('pointerdown', opts));
        opts.buttons = 0;
        pill.dispatchEvent(new PointerEvent('pointerup', opts));
      } finally {
        pill.removeAttribute('data-dm-bypass');
      }
      return true;
    } catch (err) {
      try { pill.removeAttribute('data-dm-bypass'); } catch (e2) {}
      return false;
    }
  }

  document.addEventListener('click', function (event) {
    var pill = pillOf(event.target);
    if (!pill) return;
    // 键盘触发（detail===0）时 bundle 自己会 dn(!0)，不要重复派发。
    if (event.detail === 0) return;
    event.preventDefault();
    event.stopPropagation();
    fireTap(pill);
  }, true);

  // ── 观察 DOM，药丸出现 / 重渲染后重新处理 ────────────────────────────
  try {
    var mo = new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        var rec = records[i];
        if (rec.type === 'characterData') {
          // 数字文本变了：找到所属 label，重新对齐结构（幂等，已处理会跳过）。
          var label = rec.target.parentNode;
          if (label && label.closest) {
            var l = label.closest(LABEL);
            if (l) {
              done.delete(l);
              decorate(l);
            }
          }
        }
      }
      scan();
    });
    mo.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  } catch (e) {
    setInterval(scan, 500);
  }
  setInterval(scan, 300);
  scan();
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

  async function readHistory(sessionId, beforeSeq, maxMessages) {
    const controller = sc()
    const signal = new AbortController().signal
    let cursor
    let projections
    try {
      const frames = controller.follow({ address: { kind: 'session', sessionId } }, signal)
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
        address: { kind: 'session', sessionId },
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
        return { ok: true, value: await readHistory(payload.sessionId, payload.beforeSeq, payload.maxMessages) }
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
        const value = await ctx.workspaceController.create({
          ...(payload.path ? { path: payload.path } : {}),
          ...(payload.title ? { title: payload.title } : {}),
        })
        return { ok: true, value }
      }
      case 'workspace.rename': {
        const value = await ctx.workspaceController.rename({ workspaceId: payload.workspaceId, title: payload.title })
        return { ok: true, value }
      }
      case 'workspace.delete': {
        await ctx.workspaceController.delete({ workspaceId: payload.workspaceId })
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
        return { ok: true, value: { entries: [], parentAvailable: false } }
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
        return { ok: true, value: { entries: [] } }
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
      case 'mobile.usage': {
        return { ok: true, value: { providers: [] } }
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
