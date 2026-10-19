/**
 * 迁移 C 内化：输入框单行文字的垂直居中。
 *
 * 旧实现用 canvas 量字体墨迹、再用零宽探针反解基线，最后写 padding —— 那是在
 * 拿不到 bundle 源码时的妥协。现在直接约定：
 *   · 单行 = `.chat-input` 用 9px / 13px 的上下内边距（整体上移 2px，高度不变）；
 *   · 多行 = 回到 11px / 11px。
 * 本模块只负责在「有没有显式换行 / 有没有折行」变化时切换 class；
 * 具体像素在 assets/theme.css 的 `.dm-input-multiline` 规则里，不再测量墨迹。
 */
const MULTILINE = 'dm-input-multiline'

function target(): HTMLTextAreaElement | null {
  return document.querySelector('.chat-input') as HTMLTextAreaElement | null
}

function sync(el: HTMLTextAreaElement): void {
  const style = window.getComputedStyle(el)
  const size = parseFloat(style.fontSize) || 16
  let lineHeight = parseFloat(style.lineHeight)
  if (!(lineHeight > 0)) lineHeight = size * 1.4
  const explicitBreak = String(el.value || '').includes('\n')
  const pt = parseFloat(style.paddingTop) || 0
  const pb = parseFloat(style.paddingBottom) || 0
  const content = el.scrollHeight - pt - pb
  const wrapped = content > lineHeight * 1.5 + 1
  el.classList.toggle(MULTILINE, explicitBreak || wrapped)
}

let bound: HTMLTextAreaElement | null = null

function ensure(): void {
  const el = target()
  if (el === null) {
    bound = null
    return
  }
  if (el !== bound) {
    bound = el
    el.addEventListener('input', () => sync(el), { passive: true })
  }
  sync(el)
}

/** 在 bundle 启动时挂上（幂等）；轮询由 __dmEnsureTick 或 500ms 兜底驱动。 */
export function installInputCenter(): void {
  if (typeof document === 'undefined') return
  const tick = window as unknown as { __dmEnsureTick?: { add: (fn: () => void, ms: number, ready: () => boolean) => void } }
  if (tick.__dmEnsureTick) tick.__dmEnsureTick.add(ensure, 400, () => target() !== null)
  else window.setInterval(ensure, 500)
  ensure()
}
