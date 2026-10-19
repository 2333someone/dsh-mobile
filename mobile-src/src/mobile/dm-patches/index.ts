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

const PATCH_ORDER: readonly string[] = [
  SEND_DECODE_GUARD_HTML,
  SHEET_CLOSE_HTML,
  PERMISSION_BTN_HTML
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
