/**
 * 设备表与配对相关：持久化（devices.json）、公网基址、受保护会话清单。
 * 纯文件/JSON 读写（从原 index.js 顶层原样搬出）；内存中的设备 Map 与配对码
 * 状态仍由 core 的 createHost 闭包持有，等 RPC 注册表那轮再显式化。
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
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

