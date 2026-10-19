/**
 * 迁移 B：工具栏/行内控件的安装器。
 *
 * 这些控件以前是宿主 index.js 的 `*_HTML` 注入字符串，由 `/m/` 的 HTML 在
 * <body> 末尾内联；现在源码在 dm-toolbar/，由 bundle 启动时安装。与索引顺序
 * 保持一致（模型 → emoji → 轮次 → 子代理 → 审批 → 状态 → 预设 → 队列 →
 * 用量 → 待处理 → 设置徽标），因为后面的脚本会复用前面创建的 DOM 钩子。
 *
 * 安装方式与 A 批一致：<template> 解析 → 节点按序挂 <body> → 重建 <script>
 * 同步执行；只做搬家，不改页面行为与视觉。
 */
import { USAGE_INLINE_HTML } from './usage-inline.ts'

const TOOLBAR_ORDER: readonly string[] = [
  USAGE_INLINE_HTML
]

let installed = false

/** 把已搬迁的控件按原顺序挂到 document 上（幂等）。 */
export function installDmToolbar(): void {
  if (installed || typeof document === 'undefined') return
  installed = true
  for (const html of TOOLBAR_ORDER) installOne(html)
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
