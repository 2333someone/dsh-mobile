/**
 * 自绘页面（插件 / 自动化 / 插件详情 / 模型中心 / 内置配置）的进出场动画。
 *
 * 这些页面是「注入 HTML + 内联脚本」的固定层（`.dm-page`），开关一直是
 * `el.hidden = true/false` —— 切换是瞬时的。用户要求每个入口都要有过渡动画，
 * 而内联脚本不能 import 模块，所以把开关收拢成这一个全局入口：
 *   show → 从右滑入 20px + 淡入（200ms / cubic-bezier(.2,0,0,1)，均为 motion token）
 *   hide → 反向滑出 + 淡出，动画结束才真正 hidden（避免当场消失）
 *
 * 约束：
 *   · 只动 transform / opacity（合成层，不触发布局）；
 *   · `prefers-reduced-motion: reduce` 时直接瞬变（与 design/motion.ts 的兜底一致）；
 *   · 连点安全：show/hide 会先取消对方留下的类与定时器，页面不会卡在半透明状态。
 */
export const PAGE_MOTION_MS = 200
const ENTER_CLASS = 'dm-page-enter'
const LEAVE_CLASS = 'dm-page-leave'
const timers = new WeakMap<Element, number>()

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function clearTimer(el: Element): void {
  const timer = timers.get(el)
  if (timer !== undefined) {
    window.clearTimeout(timer)
    timers.delete(el)
  }
}

/** 打开一个 `.dm-page` 层：显示 + 滑入淡入。 */
export function showPage(el: Element | null): void {
  if (!(el instanceof HTMLElement)) return
  clearTimer(el)
  el.classList.remove(LEAVE_CLASS)
  el.hidden = false
  el.classList.remove(ENTER_CLASS)
  if (prefersReducedMotion()) return
  // 强制重排：连续两次打开同一个页面时，动画也能从头重播。
  void el.offsetWidth
  el.classList.add(ENTER_CLASS)
  timers.set(el, window.setTimeout(() => {
    el.classList.remove(ENTER_CLASS)
    timers.delete(el)
  }, PAGE_MOTION_MS + 40))
}

/** 关闭一个 `.dm-page` 层：滑出淡出，动画结束后才 hidden。 */
export function hidePage(el: Element | null, done?: () => void): void {
  if (!(el instanceof HTMLElement)) return
  clearTimer(el)
  el.classList.remove(ENTER_CLASS)
  if (prefersReducedMotion() || el.hidden) {
    el.classList.remove(LEAVE_CLASS)
    el.hidden = true
    done?.()
    return
  }
  el.classList.add(LEAVE_CLASS)
  timers.set(el, window.setTimeout(() => {
    el.classList.remove(LEAVE_CLASS)
    el.hidden = true
    timers.delete(el)
    done?.()
  }, PAGE_MOTION_MS + 40))
}

/** 安装全局入口（`window.__dmPageMotion`），供内联脚本调用。 */
export function installPageMotion(): void {
  ;(window as Window & {
    __dmPageMotion?: { show: typeof showPage; hide: typeof hidePage }
  }).__dmPageMotion = { show: showPage, hide: hidePage }
}
