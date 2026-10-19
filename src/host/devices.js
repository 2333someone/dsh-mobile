/**
 * 设备表与配对相关：持久化（devices.json）、公网基址、受保护会话清单。
 * 纯文件/JSON 读写（从原 index.js 顶层原样搬出）；内存中的设备 Map 与配对码
 * 状态仍由 core 的 createHost 闭包持有，等 RPC 注册表那轮再显式化。
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { randomBytes, randomInt } from 'node:crypto'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { MAX_DEVICES, TOKEN_TTL_MS, COOKIE_NAME } from './config.js'
export function normalizePublicBase(value) {
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

export function loadPublicBase(file) {
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

export function savePublicBase(file, value) {
  try {
    const dir = join(file, '..')
    if (dir && !existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(file, JSON.stringify({ publicBaseUrl: value }, null, 2))
  } catch (err) {
    console.warn('[dsh-mobile] failed to save public domain:', err && err.message)
  }
}

export function loadDevices(file) {
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

export function persistDevices(file, devices) {
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

export function protectedSessionsFile() {
  return join(homedir(), '.dsh', 'dsh-mobile-protected.json')
}

export function loadProtectedSessionIds() {
  try {
    const raw = readFileSync(protectedSessionsFile(), 'utf8')
    const parsed = JSON.parse(raw)
    const list = Array.isArray(parsed) ? parsed : Array.isArray(parsed.sessionIds) ? parsed.sessionIds : []
    return new Set(list.filter((id) => typeof id === 'string' && id !== ''))
  } catch {
    return new Set()
  }
}


/**
 * 有状态的设备/配对运行时：设备表与配对码都在 state bag 上，持久化复用本模块的 persistDevices。
 * core 创建一次后解构使用（纯搬迁，行为不变）。
 */
export function createDeviceAuth({ state, cfg }) {
  const devices = state.devices
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

    function fixedPairCode() {
      return String(cfg.pairCode == null ? '' : cfg.pairCode).trim()
    }

    function issuePairToken() {
      const fixed = fixedPairCode()
      if (fixed !== '') {
        // 固定码：永不过期，随时可配（不再随机、不再 5 分钟失效）。
        state.pairToken = { code: fixed, expiresAt: Number.MAX_SAFE_INTEGER, fixed: true }
        return state.pairToken
      }
      state.pairToken = { code: String(randomInt(0, 1e6)).padStart(6, '0'), expiresAt: Date.now() + TOKEN_TTL_MS, fixed: false }
      return state.pairToken
    }

    function acceptPairCode(code, userAgent) {
      const input = String(code == null ? '' : code).trim()
      const fixed = fixedPairCode()
      if (fixed !== '') {
        if (input !== fixed) return null
        return createDevice(userAgent)
      }
      const now = Date.now()
      if (!state.pairToken || state.pairToken.code !== input || now > state.pairToken.expiresAt) {
        if (state.pairToken && now > state.pairToken.expiresAt) state.pairToken = null
        return null
      }
      const created = createDevice(userAgent)
      if (created) state.pairToken = null
      return created
    }

  return { deviceTokensOf, authenticatedDevice, describeDeviceUA, createDevice,
    fixedPairCode, issuePairToken, acceptPairCode }
}
