/**
 * 顶栏左上角的三枚入口：设置 / 插件 / 自动化。
 *
 * 历史包袱：这三个入口以前是「注入脚本先找到顶栏里 aria-label="设置" 的齿轮，再把
 * 插件 / 自动化两个按钮 append 到它旁边」。dsh-palm v1.6.0 的工作区列表页不再渲染
 * 齿轮（只有项目页有），锚点一消失，两个按钮就永远 display:none；而且往 React 管的
 * header 里 append / 搬动节点，是历史 removeChild 崩溃的同类隐患。
 *
 * 现在改由 bundle 自己渲染，**只在工作区列表页**出现（项目页顶栏按用户要求只留返回键）：
 *   · 设置     —— 调用调用方传入的 onOpenSettings，接到 App 的 navigate({ kind: 'settings' })，
 *                渲染的就是 bundle 原生 SettingsView（原来项目页齿轮打开的是同一个页面），
 *                不是另做的设置页；返回直接回工作区。
 *   · 插件 / 自动化 —— 调用 dm-pages/host-pages 暴露的 openHostPage()，打开已有的宿主
 *                信息页；页面尚未安装好时 openHostPage() 会做存在性判断后静默 no-op，
 *                按钮不会抛错。
 *
 * 几何：48×48、间距 4，沿用 bundle 的 .mobile-iconbtn 规格（不重画、不换风格）。
 * 三枚按钮在 header 左侧 slot 的普通流里（不绝对定位、不搬运 DOM）：
 *   工作区页  [设置][插件][自动化]
 * 首列宽度由 header 上的 .dm-header-actions 用 max-content 自适应（见
 * mobile-styles.ts），标题仍在 minmax(0, 1fr) 列里居中，不会被按钮压住。
 *
 * 图标归一（2026-10 用户反馈「设置比另外两个偏大/偏粗」）：
 *   · 三枚图标统一成 24×24 viewBox + 20×20 渲染 + stroke-width 1.5 + round 线端线接
 *     （渲染后实际描边 20/24×1.5 = 1.25px，三枚完全一致）。
 *   · 墨迹（含描边）外接盒统一到 17.5px：三个形状原始墨迹大小不同（齿轮 23.5、
 *     插件 22.5、自动化 19.5 用户单位），只做等比缩放 + 描边反向补偿，形状不动。
 *   · 插件 / 自动化仍是 design/icons.tsx 的桌面原始 path（16×16 视框），先 1.5×
 *     映射进 24 视框，再参与上面的墨迹归一。
 *   · 三者缩放都以视框中心 (12,12) 为基准 ⇒ 墨迹中心天然同高（实测三者中心均 -0.17px）。
 */
import type { ReactNode } from 'react'
import { iconParts } from '../design/icons.tsx'
import { openHostPage } from '../dm-pages/host-pages.ts'

export interface HeaderActionsProps {
  /** 打开 bundle 原生设置页（与项目页齿轮原来的 handler 相同）。 */
  readonly onOpenSettings?(): void
}

/* ── 图标归一：三枚入口共用同一套根属性 ─────────────────────────────── */

/** 三枚图标的统一渲染尺寸（px）。 */
const ICON_SIZE = 20
/** 三枚图标的统一视框（24×24）。 */
const ICON_VIEWBOX = '0 0 24 24'
/** 三枚图标的统一描边（24 视框下 1.5 ⇒ 20px 渲染时 1.25px）。 */
const ICON_STROKE = 1.5
/** 三枚图标统一后的**墨迹外接盒**目标尺寸（css px，含描边）。 */
const ICON_INK_PX = 17.5
/** 目标墨迹尺寸换算到 24 视框的用户单位（1 单位 = 20/24 css px）。 */
const ICON_INK_UNITS = (ICON_INK_PX * 24) / ICON_SIZE
/**
 * 三枚图标各自的原始墨迹外接盒（24 视框用户单位，含描边），由 path 几何算出：
 *   · 齿轮：path 跨 1..23 ⇒ 22 + 描边 1.5 = 23.5
 *   · 插件（16 视框 ×1.5 映射后）：path 跨 1..15 ⇒ 14×1.5 = 21 + 1.5 = 22.5
 *   · 自动化（同上）：钟面 r=6 ⇒ 12×1.5 = 18 + 1.5 = 19.5
 * 三者形状不同、原始墨迹大小不同，只做**等比缩放**补到同一墨迹尺寸，形状不动。
 */
const INK_UNITS = { gear: 23.5, pagePlugins: 22.5, pageAutomations: 19.5 } as const

/** 图标外壳：把视框 / 尺寸 / 描边 / 线端 / 线接固定成一份，三枚图标等大等粗。 */
function Glyph({ children }: { readonly children: ReactNode }) {
  return (
    <svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox={ICON_VIEWBOX}
      fill="none"
      stroke="currentColor"
      strokeWidth={ICON_STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

/** 绕视框中心 (12,12) 等比缩放：只归一墨迹大小，不位移、不重画。 */
function ScaleAboutCenter({ scale, children }: { readonly scale: number; readonly children: ReactNode }) {
  return <g transform={`translate(12 12) scale(${scale}) translate(-12 -12)`}>{children}</g>
}

/**
 * 描边补偿：缩放会把描边一起放大/缩小，这里按累计缩放 S 反算属性值，
 * 保证屏幕上的实际描边始终是 ICON_STROKE × 20/24 = 1.25px。
 */
function strokeFor(cumulativeScale: number): number {
  return ICON_STROKE / cumulativeScale
}

/**
 * bundle 顶栏原来的「设置」齿轮：path 逐字节取自 dsh-palm SessionListView 的齿轮，
 * 只做等比缩放（原墨迹 23.5 → 目标 21 单位）与描边补偿，形状未改。
 */
function GearGlyph() {
  const scale = ICON_INK_UNITS / INK_UNITS.gear
  return (
    <Glyph>
      <ScaleAboutCenter scale={scale}>
        <g strokeWidth={strokeFor(scale)}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
        </g>
      </ScaleAboutCenter>
    </Glyph>
  )
}

/**
 * 桌面端页面图标（插件 / 自动化）：原始 path 来自 design/icons.tsx（16×16 视框），
 * 只做「缩放 + 描边补偿」把它放进统一的视框与墨迹尺寸，形状一个点都没改。
 */
function DesktopGlyph({ name }: { readonly name: 'pagePlugins' | 'pageAutomations' }) {
  const parts = iconParts(name)
  const factor = 24 / parts.size
  const scale = ICON_INK_UNITS / INK_UNITS[name]
  return (
    <Glyph>
      <ScaleAboutCenter scale={scale}>
        <g transform={`scale(${factor})`} strokeWidth={strokeFor(scale * factor)}>
          <g dangerouslySetInnerHTML={{ __html: parts.inner }} />
        </g>
      </ScaleAboutCenter>
    </Glyph>
  )
}

/**
 * Render the three top-left header entries.
 * @param props - the settings opener.
 * @returns the button group.
 */
export function HeaderActions({ onOpenSettings }: HeaderActionsProps) {
  return (
    <div className="dm-header-action-group">
      <button type="button" className="mobile-iconbtn" aria-label="设置" title="设置" onClick={() => { onOpenSettings?.() }}>
        <GearGlyph />
      </button>
      <button
        type="button"
        className="mobile-iconbtn"
        aria-label="插件"
        title="插件"
        onClick={() => { openHostPage('plugins') }}
      >
        <DesktopGlyph name="pagePlugins" />
      </button>
      <button
        type="button"
        className="mobile-iconbtn"
        aria-label="自动化"
        title="自动化"
        onClick={() => { openHostPage('automations') }}
      >
        <DesktopGlyph name="pageAutomations" />
      </button>
    </div>
  )
}
