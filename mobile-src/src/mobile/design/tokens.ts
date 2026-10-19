/**
 * 设计 token（task-30，混搭方向：B 的视觉语言 + A/B 之间的密度）。
 *
 * 唯一真值：配色 / 圆角 / 间距 / 字体 / 阴影 / 玻璃 / 页面柔光都在这里。
 * `mobile-styles.ts` 用它生成的 CSS（`tokensCss()`）替换原来的三份手写调色板，
 * 组件样式一律只引用 `var(--*)`，不再写字面色值。
 *
 * 方向定稿（lead 拍板）：
 *   · 视觉语言 = 候选 B：卡片 18 / 浮层 28 圆角、柔光阴影、强调色 #6d5efc、玻璃浮层；
 *   · 密度 = A 与 B 之间：列表行高 72px；
 *   · 玻璃只用于浮层（输入栏 / 工具栏 / 命令面板遮罩），不整页铺；
 *   · 组 1 聊天工具栏图标原样不动（图标规格另见 `design/icons.tsx`）。
 *
 * token 命名沿用 surface / text / border / accent / status / card / fill /
 * code / diff / chrome 这些既有前缀，保证 `mobile-styles.ts`、`theme.css`
 * 和迁移进来的页面模块都能直接复用，不需要一次性大改选择器。
 */

/** 一组完整配色。键名 = CSS 变量名去掉 `--` 前缀。 */
export interface Palette {
  // surfaces
  'bg-page': string
  'bg-surface': string
  'bg-elevated': string
  'bg-input': string
  'dialog-bg': string
  'toast-bg': string
  'toast-text': string
  // text ladder
  'text-primary': string
  'text-secondary': string
  'text-tertiary': string
  'text-quaternary': string
  'text-muted': string
  // borders
  'border-default': string
  'border-subtle': string
  'border-focus': string
  // accent + status
  accent: string
  'accent-contrast': string
  'accent-soft': string
  'accent-glow': string
  positive: string
  warning: string
  danger: string
  'danger-soft': string
  // unified card spec
  'card-bg': string
  'card-border': string
  'card-shadow': string
  'shadow-lg': string
  // interaction washes
  fill: string
  'fill-strong': string
  // code blocks
  'code-bg': string
  'code-text': string
  'code-border': string
  'code-head-bg': string
  'code-head-border': string
  // syntax tokens
  'tok-keyword': string
  'tok-string': string
  'tok-comment': string
  'tok-number': string
  'tok-type': string
  'tok-func': string
  'tok-prop': string
  // diff view
  'diff-add': string
  'diff-del': string
  'diff-add-bg': string
  'diff-del-bg': string
  'diff-add-word': string
  'diff-del-word': string
  // chrome / overlays
  backdrop: string
  'header-bg': string
  'glass-bg': string
  'glass-border': string
  /** 页面柔光（仅背景 image，不铺内容区）。 */
  'bg-glow': string
}

/** 浅色调色板。 */
export const paletteLight: Palette = {
  'bg-page': '#f4f5fb',
  'bg-surface': '#ffffff',
  'bg-elevated': '#eef0f8',
  'bg-input': '#ffffff',
  'dialog-bg': '#ffffff',
  'toast-bg': '#16162a',
  'toast-text': '#ffffff',
  'text-primary': '#16162a',
  'text-secondary': '#4b4b63',
  'text-tertiary': '#6f6f8a',
  'text-quaternary': '#9a9ab0',
  'text-muted': '#b8b8c8',
  'border-default': '#e4e5ef',
  'border-subtle': '#edeef5',
  'border-focus': '#6d5efc',
  accent: '#6d5efc',
  'accent-contrast': '#ffffff',
  'accent-soft': 'rgba(109, 94, 252, 0.12)',
  'accent-glow': 'rgba(109, 94, 252, 0.28)',
  positive: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  'danger-soft': 'rgba(239, 68, 68, 0.1)',
  'card-bg': '#ffffff',
  'card-border': 'rgba(24, 24, 40, 0.045)',
  'card-shadow': '0 6px 20px rgba(76, 84, 150, 0.1), 0 1px 2px rgba(76, 84, 150, 0.06)',
  'shadow-lg': '0 18px 44px rgba(24, 24, 40, 0.18)',
  fill: 'rgba(24, 24, 40, 0.04)',
  'fill-strong': 'rgba(24, 24, 40, 0.075)',
  'code-bg': '#e8ecf2',
  'code-text': '#3a3f52',
  'code-border': '#d0d7de',
  'code-head-bg': '#dfe4ec',
  'code-head-border': '#d0d7de',
  'tok-keyword': '#a626a4',
  'tok-string': '#50a14f',
  'tok-comment': '#a0a1a7',
  'tok-number': '#986801',
  'tok-type': '#e45649',
  'tok-func': '#4078f2',
  'tok-prop': '#986801',
  'diff-add': '#22c55e',
  'diff-del': '#ef4444',
  'diff-add-bg': 'rgba(34, 197, 94, 0.12)',
  'diff-del-bg': 'rgba(239, 68, 68, 0.12)',
  'diff-add-word': 'rgba(34, 197, 94, 0.22)',
  'diff-del-word': 'rgba(239, 68, 68, 0.22)',
  backdrop: 'rgba(15, 18, 34, 0.45)',
  'header-bg': 'rgba(244, 245, 251, 0.84)',
  'glass-bg': 'rgba(255, 255, 255, 0.72)',
  'glass-border': 'rgba(24, 24, 40, 0.06)',
  'bg-glow':
    'radial-gradient(680px 260px at 78% -8%, rgba(109, 94, 252, 0.12), transparent 62%), radial-gradient(520px 220px at -8% 2%, rgba(236, 72, 153, 0.075), transparent 58%)',
}

/** 深色调色板。 */
export const paletteDark: Palette = {
  'bg-page': '#0b0b12',
  'bg-surface': '#16161f',
  'bg-elevated': '#1d1d29',
  'bg-input': '#16161f',
  'dialog-bg': '#1c1c28',
  'toast-bg': '#2a2a3a',
  'toast-text': '#f0f0f5',
  'text-primary': '#f0f0f5',
  'text-secondary': '#a5a5ba',
  'text-tertiary': '#70708a',
  'text-quaternary': '#5a5a72',
  'text-muted': '#40405a',
  'border-default': '#26263a',
  'border-subtle': '#1e1e2c',
  'border-focus': '#4b3fd6',
  accent: '#6d5efc',
  'accent-contrast': '#ffffff',
  'accent-soft': 'rgba(109, 94, 252, 0.16)',
  'accent-glow': 'rgba(109, 94, 252, 0.34)',
  positive: '#4ade80',
  warning: '#fbbf24',
  danger: '#f87171',
  'danger-soft': 'rgba(248, 113, 113, 0.14)',
  'card-bg': '#16161f',
  'card-border': 'rgba(255, 255, 255, 0.05)',
  'card-shadow': '0 8px 26px rgba(0, 0, 0, 0.45)',
  'shadow-lg': '0 22px 56px rgba(0, 0, 0, 0.6)',
  fill: 'rgba(255, 255, 255, 0.05)',
  'fill-strong': 'rgba(255, 255, 255, 0.085)',
  'code-bg': '#161b22',
  'code-text': '#b8bad0',
  'code-border': '#30363d',
  'code-head-bg': '#1c2128',
  'code-head-border': '#30363d',
  'tok-keyword': '#c678dd',
  'tok-string': '#98c379',
  'tok-comment': '#5c6370',
  'tok-number': '#d19a66',
  'tok-type': '#e5c07b',
  'tok-func': '#61afef',
  'tok-prop': '#d19a66',
  'diff-add': '#4ade80',
  'diff-del': '#f87171',
  'diff-add-bg': 'rgba(74, 222, 128, 0.1)',
  'diff-del-bg': 'rgba(248, 113, 113, 0.1)',
  'diff-add-word': 'rgba(74, 222, 128, 0.25)',
  'diff-del-word': 'rgba(248, 113, 113, 0.25)',
  backdrop: 'rgba(0, 0, 0, 0.6)',
  'header-bg': 'rgba(11, 11, 18, 0.82)',
  'glass-bg': 'rgba(22, 22, 31, 0.66)',
  'glass-border': 'rgba(255, 255, 255, 0.07)',
  'bg-glow':
    'radial-gradient(680px 260px at 78% -8%, rgba(109, 94, 252, 0.16), transparent 62%), radial-gradient(520px 220px at -8% 2%, rgba(236, 72, 153, 0.07), transparent 58%)',
}

/* ── 非颜色 token ─────────────────────────────────────────────────────── */

/** 圆角阶梯（混搭：卡片 18 / 浮层 28，菜单 16，chip 12）。 */
export const radii = {
  chip: 12,
  card: 18,
  sheet: 28,
  menu: 16,
  capsule: 999,
  full: 9999,
} as const

/** 间距阶梯（4px 网格）。 */
export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
} as const

/** 字号阶梯（5 档；正文字号 15，标题 17）。 */
export const type = {
  xs: 11,
  sm: 12,
  md: 13,
  base: 15,
  lg: 17,
} as const

/** 阴影三档：卡片 / 浮层 / 按下（按下用纯色 wash，不用阴影）。 */
export const shadow = {
  card: paletteLight['card-shadow'],
  float: paletteLight['shadow-lg'],
} as const

/** 玻璃：只给浮层用（输入栏 / 工具栏 / 命令面板遮罩）。 */
export const glass = {
  blur: 16,
  saturate: 1.4,
} as const

/** 行高 token（密度 = A 与 B 之间）。 */
export const rowHeight = {
  /** 列表卡片行高 */
  card: 72,
  /** 工具栏图标热区 */
  tool: 34,
} as const

/** 字体栈。 */
export const fontSans =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'PingFang SC', 'Noto Sans SC', 'Segoe UI', sans-serif"

/** 等宽字体栈。 */
export const fontMono =
  "'SF Mono', 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"

function decls(palette: Palette): string {
  return Object.entries(palette)
    .map(([key, value]) => `  --${key}: ${value};`)
    .join('\n')
}

const staticTokens = `  --font-sans: ${fontSans};
  --font-mono: ${fontMono};
  --radius-chip: ${radii.chip}px;
  --radius-card: ${radii.card}px;
  --radius-sheet: ${radii.sheet}px;
  --radius-menu: ${radii.menu}px;
  --radius-capsule: ${radii.capsule}px;
  --radius-full: ${radii.full}px;
  --space-1: ${space[1]}px;
  --space-2: ${space[2]}px;
  --space-3: ${space[3]}px;
  --space-4: ${space[4]}px;
  --space-5: ${space[5]}px;
  --space-6: ${space[6]}px;
  --space-8: ${space[8]}px;
  --text-xs: ${type.xs}px;
  --text-sm: ${type.sm}px;
  --text-md: ${type.md}px;
  --text-base: ${type.base}px;
  --text-lg: ${type.lg}px;
  --glass-blur: ${glass.blur}px;
  --glass-saturate: ${glass.saturate};
  --row-height: ${rowHeight.card}px;
  --tool-height: ${rowHeight.tool}px;`

/**
 * 生成设计 token 的 CSS 文本：`<style>` 里直接插值使用。
 *
 * 输出三段（浅色默认 / 显式深色 / 系统深色），与 `mobile-theme.ts` 的
 * `data-theme` 约定一致 —— 系统模式不 pin 调色板时由媒体查询接管。
 */
export function tokensCss(): string {
  return `/* ── design tokens（src/mobile/design/tokens.ts 生成，勿手改） ─────── */
:root {
${decls(paletteLight)}
${staticTokens}
}
:root[data-theme='dark'] {
${decls(paletteDark)}
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
${decls(paletteDark)
  .split('\n')
  .map((line) => '  ' + line)
  .join('\n')}
  }
}`
}
