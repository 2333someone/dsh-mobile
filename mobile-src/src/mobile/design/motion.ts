/**
 * 动效体系（task-30，混搭方向）。
 *
 * 四个数字管住全站节奏：fast 120（按压/勾选）、base 200（浮层/页面切换）、
 * slow 280（底部 sheet 上滑）。曲线统一 `cubic-bezier(.2,0,0,1)`；按压反馈
 * `scale(.97)`；列表/分组入场按 50ms 递增错峰（最多 7 项，之后不再叠加延迟）。
 *
 * `motionCss()` 把这些写成 CSS 变量 + 可复用的工具类/关键帧，并在最后统一
 * 兜底 `prefers-reduced-motion: reduce`：所有动画/过渡降级成瞬变。
 *
 * 注意：动画一律只动 `transform` / `opacity`（合成层），不触发布局。
 */

export const duration = {
  /** 按压、勾选这类即时反馈 */
  fast: 120,
  /** 浮层进出、页面切换 */
  base: 200,
  /** 底部 sheet 上滑 */
  slow: 280,
} as const

export const easing = {
  /** 主曲线：先快后缓，观感「跟手」 */
  standard: 'cubic-bezier(.2, 0, 0, 1)',
  /** 收起/离场：直接收干净 */
  exit: 'cubic-bezier(.4, 0, 1, 1)',
} as const

export const press = {
  /** 按压缩放 */
  scale: 0.97,
} as const

export const stagger = {
  /** 相邻项延迟 */
  step: 50,
  /** 最多作用到第几项（之后同批出现） */
  max: 7,
} as const

/**
 * 生成动效 token + 关键帧 + 工具类的 CSS。
 *
 * 类名：
 *   `.dm-pressable`      —— 按压缩放
 *   `.dm-enter`          —— 入场淡入上浮
 *   `.dm-stagger > *`    —— 子项错峰入场（前 7 个各有延迟）
 *   `.dm-sheet-enter`    —— 底部 sheet 上滑入场
 * 关键帧：dm-fade-in / dm-rise-in / dm-sheet-in / dm-press-in。
 */
export function motionCss(): string {
  const delays = Array.from({ length: stagger.max }, (_, i) => {
    const nth = i + 1
    return `.dm-stagger > *:nth-child(${nth}) { animation-delay: ${i * stagger.step}ms; }`
  }).join('\n')

  return `/* ── motion tokens（src/mobile/design/motion.ts 生成，勿手改） ──────── */
:root {
  --duration-fast: ${duration.fast}ms;
  --duration-base: ${duration.base}ms;
  --duration-slow: ${duration.slow}ms;
  --ease-standard: ${easing.standard};
  --ease-exit: ${easing.exit};
  --press-scale: ${press.scale};
  --stagger-step: ${stagger.step}ms;
}

@keyframes dm-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes dm-rise-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes dm-sheet-in {
  from { opacity: 0.4; transform: translateY(14%); }
  to { opacity: 1; transform: translateY(0); }
}

.dm-enter {
  animation: dm-fade-in var(--duration-base) var(--ease-standard) both;
}
.dm-rise {
  animation: dm-rise-in var(--duration-base) var(--ease-standard) both;
}
.dm-stagger > * {
  animation: dm-rise-in var(--duration-base) var(--ease-standard) both;
}
${delays}

/* 按压反馈：只动 transform，120ms 收放。 */
.dm-pressable {
  transition: transform var(--duration-fast) var(--ease-standard);
  will-change: transform;
}
.dm-pressable:active {
  transform: scale(var(--press-scale));
}

/* 无障碍：减少动态效果时全部瞬变（含第三方样式里的动画）。 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 1ms !important;
    animation-delay: 0ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
    scroll-behavior: auto !important;
  }
}`
}
