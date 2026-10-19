/**
 * 迁移 A：四个「页面型注入」的安装器。
 *
 * 这四个页面以前是宿主 index.js 里的 `*_HTML` 字符串，由 `/m/` 的 HTML 直接
 * 内联进 <body>；现在源码归属到 mobile-src，但仍保持原来的形状（HTML 标记 +
 * 一段内联脚本），因为本批只做「搬家 + 归属」，不做 React 重写。
 *
 * 安装时机要尽量贴近原来的行为：
 *   · 原来：HTML 解析到 </body> 前，这些 <script> 按出现顺序同步执行；
 *   · 现在：bundle 是 type="module"（defer），模块一执行就调用本函数 ——
 *     仍在 React 挂载之前，且宿主其余内联脚本（设置范围徽标、图片预览、
 *     待处理提示等）已经先执行完，与原来「页面前、其余脚本后」的相对顺序
 *     相反，但两边没有相互依赖（迁移前已核对：没有其它脚本引用这四个页面
 *     的 id/类名，它们引用的 __dmEnsureTick / __dmMutationBus 也都由更早的
 *     内联脚本定义）。
 *
 * 顺序必须与原来 index.js 注入列表一致：HOST_PAGES → BUILTIN_CONFIG →
 * MODELS_CENTER → COMMAND_PANEL（后者依赖前者留下的导航/观察钩子）。
 */
import { HOST_PAGES_HTML } from './host-pages.ts'
import { BUILTIN_CONFIG_HTML } from './builtin-config.ts'
import { MODELS_CENTER_HTML } from './models-center.ts'
import { COMMAND_PANEL_HTML } from './command-panel.ts'

const PAGE_ORDER: readonly string[] = [
  HOST_PAGES_HTML,
  BUILTIN_CONFIG_HTML,
  MODELS_CENTER_HTML,
  COMMAND_PANEL_HTML,
]

let installed = false

/** 把四个页面按原顺序挂到 document 上（幂等；只应调用一次）。 */
export function installDmPages(): void {
  if (installed || typeof document === 'undefined') return
  installed = true
  for (const html of PAGE_ORDER) installOne(html)
}

/**
 * 还原浏览器解析内联 HTML 的效果：用 <template> 解析（不执行、不加载资源），
 * 再把节点按顺序挂到 <body>；其中 <script> 换成新元素追加，追加即同步执行。
 * 原来的内联脚本也留在 DOM 里，这里同样保留，行为一致。
 */
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
