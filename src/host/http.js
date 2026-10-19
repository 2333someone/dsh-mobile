/**
 * HTTP 基础：响应写入、gzip/brotli、请求体读取、Cookie、回环/局域网地址。
 * 无闭包依赖（从原 index.js 顶层原样搬出）。
 */
import { networkInterfaces } from 'node:os'
import { gzipSync, brotliCompressSync, constants as zlibConstants } from 'node:zlib'
import { COMPRESSIBLE_TYPE, MIN_COMPRESS_BYTES, SMALL_BODY } from './config.js'

export const compressCache = new WeakMap()

export function compressFor(req, headers, body) {
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

export function send(res, status, headers, body) {
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

export function sendJson(res, status, obj, extraHeaders = {}) {
  send(res, status, { 'Content-Type': 'application/json; charset=utf-8', ...extraHeaders }, JSON.stringify(obj))
}

export function sendHtml(res, status, html) {
  send(res, status, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }, html)
}

export function sendText(res, status, type, text) {
  send(res, status, { 'Content-Type': type }, text)
}

export function sendBuffer(res, status, type, buf, headers) {
  // headers 可覆盖默认头：bundle 这类会随插件更新的资源必须 no-store，
  // 否则默认的 public,max-age=3600 会让手机缓存一小时（改了代码也看不到）。
  send(res, status, { 'Content-Type': type, 'Cache-Control': 'public, max-age=3600', ...(headers || {}) }, buf)
}

export function readBody(req, maxBytes = SMALL_BODY) {
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

export async function readJsonBody(req, budget = SMALL_BODY) {
  const raw = await readBody(req, budget)
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    throw new Error('invalid json body')
  }
}

export function parseCookies(req) {
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

export function isLoopback(req) {
  const a = (req.socket && req.socket.remoteAddress) || ''
  return a === '127.0.0.1' || a === '::1' || a === '::ffff:127.0.0.1' || a === '::ffff:7f00:1'
}

export function lanIPv4Addresses() {
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
