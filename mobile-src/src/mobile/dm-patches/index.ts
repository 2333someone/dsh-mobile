/**
 * 迁移 C：行为补丁的安装器。
 *
 * 这些补丁以前是宿主 index.js 的 `*_HTML` 注入字符串；现在源码在 dm-patches/，
 * 由 bundle 启动时按原注入顺序安装（<template> 解析 → 节点挂 body → 重建
 * <script> 同步执行）。需要更早执行的基础设施（ONLINE_GUARD / MUTATION_BUS /
 * VIEWPORT_VH）仍留在 HTML 里注入，不在这里。
 */
import { SEND_DECODE_GUARD_HTML } from './send-decode-guard.ts'
import { SHEET_CLOSE_HTML } from './sheet-close.ts'
import { PERMISSION_BTN_HTML } from './permission-btn.ts'
import { SEND_MODE_HTML } from './send-mode.ts'
import { CHAT_STATUS_HTML } from './chat-status.ts'
import { SEND_MODE_SETTINGS_HTML } from './send-mode-settings.ts'
import { DEVICE_INFO_HTML } from './device-info.ts'
import { NOTIFY_LAYOUT_HTML } from './notify-layout.ts'
import { ADD_SHEET_FILTER_HTML } from './add-sheet-filter.ts'
import { CHAT_AUTOSCROLL_HTML } from './chat-autoscroll.ts'
import { LOAD_OLDER_ALIGN_HTML } from './load-older-align.ts'

const PATCH_ORDER: readonly string[] = [
  SEND_DECODE_GUARD_HTML,
  SHEET_CLOSE_HTML,
  PERMISSION_BTN_HTML,
  SEND_MODE_HTML,
  CHAT_STATUS_HTML,
  SEND_MODE_SETTINGS_HTML,
  DEVICE_INFO_HTML,
  NOTIFY_LAYOUT_HTML,
  ADD_SHEET_FILTER_HTML,
  CHAT_AUTOSCROLL_HTML,
  LOAD_OLDER_ALIGN_HTML
]

let installed = false

/** 把已搬迁的行为补丁按原顺序挂到 document 上（幂等）。 */
export function installDmPatches(): void {
  if (installed || typeof document === 'undefined') return
  installed = true
  for (const html of PATCH_ORDER) installOne(html)
}

function installOne(html: string): void {
  const template = document.createElement('template')
  template.innerHTML = html
  const nodes = Array.from(template.content.childNodes)
  for (const node of nodes) {
    if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'SCRIPT') {
      const script = document.createElement('script')
      script.textContent = (node as HTMLScriptElement).textContent ?? ''
      document.body.appendChild(script)
      continue
    }
    document.body.appendChild(node)
  }
}
