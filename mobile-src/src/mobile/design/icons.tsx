/**
 * 全项目唯一图标来源（task-33）。**任何 UI 要图标都从这里 import，不要自绘。**
 *
 * 两组，规格可以不同，不要强行归一：
 *   1. `group: 'toolbar'` —— 聊天页工具栏（用户已认可现状）。
 *      svg 原样搬自本仓库 `index.js` 的注入脚本（COMMAND_PANEL_HTML / MODEL_BUTTON_HTML /
 *      PERMISSION_BTN_HTML / APPROVAL_BTN_HTML / PRESET_BTN_HTML / SUBAGENT_BTN_HTML /
 *      SUBAGENT_STATUS_BTN_HTML），24×24 / stroke 1.8（`/` 图标 2.0）/ 20px 渲染。
 *      **禁止重新设计、禁止改描边宽度/尺寸/颜色**（用户对现状满意，改动即回归失败）。
 *
 *   2. `group: 'desktop'` —— 其余位置一律用桌面端同一份 svg。
 *      来源：asar 内 `@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js`
 *      （primitives 实现，所有 `@deepseek-ai/dsh-client-ui-*` 包共用的图标集），
 *      以及 `@deepseek-ai/dsh-client-ui-plugin-manager` 的多色 PluginArtwork 组件。
 *      path / fill / stroke 全部原样保留（多色 fill 仍是多色），尺寸/描边跟随桌面端组件的
 *      default size 与 stroke-width（Regular=1、Medium=1.3）。
 *
 * 每个条目的 `source` / `chunkOffset` / `defIdent` 可直接回到 asar 里核对（grep 组件名或偏移）。
 */
import type { SVGProps } from 'react'

export type IconGroup = 'toolbar' | 'desktop'

export interface IconMeta {
  readonly group: IconGroup
  /** 渲染默认尺寸（px）：组 1 = 注入按钮的 20px；组 2 = 桌面组件的 default size。 */
  readonly size: number
  readonly viewBox: string
  /** 桌面端 svg 根属性原样（fill / stroke / stroke-width 等，驼峰化后交给 React）。 */
  readonly rootProps: Readonly<Record<string, string | number>>
  /** svg 内部原始标记（path / g / defs…，逐字节来自桌面端，不重绘）。 */
  readonly inner: string
  /** 用途（中文，UI 里哪一处用）。 */
  readonly use: string
  /** 出处：包名 + 文件（+ 组件名 / 偏移）。 */
  readonly source: string
  /** 桌面端 export map 里的压缩标识符（grep 用）。 */
  readonly defIdent?: string
  /** 桌面端 bundle 里的字节偏移（export map 命中点）。 */
  readonly chunkOffset?: number
  /** 非空表示「桌面端没有对应图标，临时借用」的说明（不许静默自绘）。 */
  readonly borrowed?: string
}

export type IconName =
  | 'toolbarCommand'
  | 'toolbarModel'
  | 'toolbarAttach'
  | 'toolbarPermission'
  | 'toolbarApproval'
  | 'toolbarPreset'
  | 'toolbarSubagent'
  | 'toolbarSubagentStatus'
  | 'toolbarPresetStandard'
  | 'toolbarPresetPtc'
  | 'toolbarPresetMinimal'
  | 'toolbarPresetCordis'
  | 'pageBuiltinSubagent'
  | 'pageBuiltinWebSearch'
  | 'pageBuiltinAgentLoop'
  | 'pageBuiltinTerminal'
  | 'pagePlugins'
  | 'pageAutomations'
  | 'pageModels'
  | 'pageUsage'
  | 'pageVoice'
  | 'pageNotifications'
  | 'statusRunning'
  | 'statusSuccess'
  | 'statusFailed'
  | 'statusWarning'
  | 'statusWarningTriangle'
  | 'actionExpand'
  | 'actionCollapse'
  | 'actionBack'
  | 'actionOpen'
  | 'actionClose'
  | 'actionDelete'
  | 'actionRefresh'
  | 'actionSearch'
  | 'actionCopy'
  | 'actionMore'
  | 'actionAdd'
  | 'actionEdit'
  | 'actionCheck'
  | 'actionDownload'
  | 'actionAttach'
  | 'actionInfo'
  | 'actionSend'
  | 'commandGoal'
  | 'commandPlan'
  | 'commandFeedback'
  | 'commandCompact'
  | 'commandPermission'
  | 'commandExport'
  | 'commandFile'
  | 'commandModel'

export const ICONS: Readonly<Record<IconName, IconMeta>> = {
  'toolbarCommand': {
    group: 'toolbar',
    size: 20,
    viewBox: '0 0 24 24',
    rootProps: {"viewBox":"0 0 24 24","fill":"none","stroke":"currentColor","strokeWidth":2,"strokeLinecap":"round","strokeLinejoin":"round"},
    inner: "<path d=\"M15.2 4 8.8 20\"/>",
    use: "/ 命令按钮（COMMAND_PANEL_HTML）",
    source: "index.js COMMAND_PANEL_HTML 注入 svg（原样，禁止改描边/尺寸/颜色）",
  },
  'toolbarModel': {
    group: 'toolbar',
    size: 20,
    viewBox: '0 0 24 24',
    rootProps: {"viewBox":"0 0 24 24","fill":"none","stroke":"currentColor","strokeWidth":1.8,"strokeLinecap":"round","strokeLinejoin":"round"},
    inner: "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"4\"/><path d=\"M9 9h6M9 12h6M9 15h3\"/>",
    use: "模型按钮（MODEL_BUTTON_HTML）",
    source: "index.js MODEL_BUTTON_HTML 注入 svg（原样，禁止改描边/尺寸/颜色）",
  },
  'toolbarAttach': {
    group: 'toolbar',
    size: 20,
    viewBox: '0 0 24 24',
    rootProps: {"viewBox":"0 0 24 24","fill":"none","stroke":"currentColor","strokeWidth":1.8,"strokeLinecap":"round"},
    inner: "<path d=\"M12 5v14M5 12h14\"/>",
    use: "添加内容/附件「+」按钮（MODEL_BUTTON_HTML 内 ensureTools）",
    source: "index.js MODEL_BUTTON_HTML 注入 svg（原样，禁止改描边/尺寸/颜色）",
  },
  'toolbarPermission': {
    group: 'toolbar',
    size: 20,
    viewBox: '0 0 24 24',
    rootProps: {"viewBox":"0 0 24 24","fill":"none","stroke":"currentColor","strokeWidth":1.8,"strokeLinecap":"round","strokeLinejoin":"round"},
    inner: "<path d=\"M12 3l7 2.8v5.4c0 4.2-2.9 7.6-7 8.5-4.1-.9-7-4.3-7-8.5V5.8L12 3z\"/><path d=\"M9.2 12.1l2 2 3.6-3.8\"/>",
    use: "权限按钮（PERMISSION_BTN_HTML）",
    source: "index.js PERMISSION_BTN_HTML 注入 svg（原样，禁止改描边/尺寸/颜色）",
  },
  'toolbarApproval': {
    group: 'toolbar',
    size: 20,
    viewBox: '0 0 24 24',
    rootProps: {"viewBox":"0 0 24 24","fill":"none","stroke":"currentColor","strokeWidth":1.8,"strokeLinecap":"round","strokeLinejoin":"round"},
    inner: "<path d=\"M18 8.6a6 6 0 1 0-12 0c0 4.4-1.5 5.9-2 6.7-.3.5 0 1.2.7 1.2h14.6c.7 0 1-.7.7-1.2-.5-.8-2-2.3-2-6.7z\"/><path d=\"M13.7 19.4a2 2 0 0 1-3.4 0\"/>",
    use: "审批铃铛（APPROVAL_BTN_HTML）",
    source: "index.js APPROVAL_BTN_HTML 注入 svg（原样，禁止改描边/尺寸/颜色）",
  },
  'toolbarPreset': {
    group: 'toolbar',
    size: 20,
    viewBox: '0 0 24 24',
    rootProps: {"viewBox":"0 0 24 24","fill":"none","stroke":"currentColor","strokeWidth":1.8,"strokeLinecap":"round","strokeLinejoin":"round"},
    inner: "<path d=\"M12 3.4 3.6 7.6 12 11.8l8.4-4.2z\"/><path d=\"M3.6 12.1 12 16.3l8.4-4.2\"/><path d=\"M3.6 16.6 12 20.8l8.4-4.2\"/>",
    use: "聊天模式/预设（PRESET_BTN_HTML）",
    source: "index.js PRESET_BTN_HTML 注入 svg（原样，禁止改描边/尺寸/颜色）",
  },
  'toolbarSubagent': {
    group: 'toolbar',
    size: 20,
    viewBox: '0 0 24 24',
    rootProps: {"viewBox":"0 0 24 24","fill":"none","stroke":"currentColor","strokeWidth":1.8,"strokeLinecap":"round","strokeLinejoin":"round"},
    inner: "<circle cx=\"12\" cy=\"5.5\" r=\"2.6\"/><circle cx=\"5\" cy=\"17\" r=\"2.6\"/><circle cx=\"19\" cy=\"17\" r=\"2.6\"/><path d=\"M12 8.1V14M12 14H6.8M12 14h5.2\"/>",
    use: "子代理（SUBAGENT_BTN_HTML）",
    source: "index.js SUBAGENT_BTN_HTML 注入 svg（原样，禁止改描边/尺寸/颜色）",
  },
  'toolbarSubagentStatus': {
    group: 'toolbar',
    size: 20,
    viewBox: '0 0 24 24',
    rootProps: {"viewBox":"0 0 24 24","fill":"none","stroke":"currentColor","strokeWidth":1.8,"strokeLinecap":"round","strokeLinejoin":"round"},
    inner: "<circle cx=\"12\" cy=\"5.5\" r=\"2.6\"/><circle cx=\"5\" cy=\"17\" r=\"2.6\"/><circle cx=\"19\" cy=\"17\" r=\"2.6\"/><path d=\"M12 8.1V14M12 14H6.8M12 14h5.2\"/>",
    use: "子代理状态（SUBAGENT_STATUS_BTN_HTML）",
    source: "index.js SUBAGENT_STATUS_BTN_HTML 注入 svg（原样，禁止改描边/尺寸/颜色）",
  },
  'toolbarPresetStandard': {
    group: 'toolbar',
    size: 20,
    viewBox: '0 0 24 24',
    rootProps: {"viewBox":"0 0 24 24","fill":"none","stroke":"currentColor","strokeWidth":1.8,"strokeLinecap":"round","strokeLinejoin":"round"},
    inner: "<path d=\"M12 3.4 3.6 7.6 12 11.8l8.4-4.2z\"/><path d=\"M3.6 12.1 12 16.3l8.4-4.2\"/><path d=\"M3.6 16.6 12 20.8l8.4-4.2\"/>",
    use: "聊天模式/预设按钮：默认模式（PRESET_STATUS_HTML ICONS.standard）",
    source: "index.js PRESET_STATUS_HTML 内的 ICONS.standard（按当前预设整体替换预设按钮内容；原样搬，禁止改）",
  },
  'toolbarPresetPtc': {
    group: 'toolbar',
    size: 20,
    viewBox: '0 0 24 24',
    rootProps: {"viewBox":"0 0 24 24","fill":"none","stroke":"currentColor","strokeWidth":1.8,"strokeLinecap":"round","strokeLinejoin":"round"},
    inner: "<circle cx=\"12\" cy=\"12\" r=\"3.1\"/><path d=\"M12 4.2v2.2M12 17.6v2.2M19.8 12h-2.2M6.4 12H4.2M17.5 6.5l-1.6 1.6M8.1 15.9l-1.6 1.6M17.5 17.5l-1.6-1.6M8.1 8.1 6.5 6.5\"/>",
    use: "聊天模式/预设按钮：PTC 模式（PRESET_STATUS_HTML ICONS.ptc）",
    source: "index.js PRESET_STATUS_HTML 内的 ICONS.ptc（按当前预设整体替换预设按钮内容；原样搬，禁止改）",
  },
  'toolbarPresetMinimal': {
    group: 'toolbar',
    size: 20,
    viewBox: '0 0 24 24',
    rootProps: {"viewBox":"0 0 24 24","fill":"none","stroke":"currentColor","strokeWidth":1.8,"strokeLinecap":"round","strokeLinejoin":"round"},
    inner: "<path d=\"M5.5 8.5h13M7.5 12h9M9.5 15.5h5\"/>",
    use: "聊天模式/预设按钮：最简模式（PRESET_STATUS_HTML ICONS.minimal）",
    source: "index.js PRESET_STATUS_HTML 内的 ICONS.minimal（按当前预设整体替换预设按钮内容；原样搬，禁止改）",
  },
  'toolbarPresetCordis': {
    group: 'toolbar',
    size: 20,
    viewBox: '0 0 24 24',
    rootProps: {"viewBox":"0 0 24 24","fill":"none","stroke":"currentColor","strokeWidth":1.8,"strokeLinecap":"round","strokeLinejoin":"round"},
    inner: "<circle cx=\"12\" cy=\"12\" r=\"2.1\"/><circle cx=\"5.4\" cy=\"6.6\" r=\"1.7\"/><circle cx=\"18.6\" cy=\"6.6\" r=\"1.7\"/><circle cx=\"12\" cy=\"19.2\" r=\"1.7\"/><path d=\"M10.6 10.3 6.9 7.9M13.4 10.3l3.7-2.4M12 14.1v3.4\"/>",
    use: "聊天模式/预设按钮：工具创造模式（PRESET_STATUS_HTML ICONS.cordis）",
    source: "index.js PRESET_STATUS_HTML 内的 ICONS.cordis（按当前预设整体替换预设按钮内容；原样搬，禁止改）",
  },
  'pageBuiltinSubagent': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 36 36',
    rootProps: {"viewBox":"0 0 36 36","fill":"none"},
    inner: "<rect x=\"14.9893\" y=\"15.1877\" width=\"12.2365\" height=\"12.2365\" rx=\"2\" fill=\"url(#dsh_plugin_art_CU_0a)\" fill-opacity=\"0.8\"></rect><rect x=\"8.87109\" y=\"9.0697\" width=\"12.2365\" height=\"12.2365\" rx=\"2\" fill=\"url(#dsh_plugin_art_CU_0b)\" fill-opacity=\"0.8\"></rect><defs><linearGradient id=\"dsh_plugin_art_CU_0a\" x1=\"21.1075\" y1=\"15.1877\" x2=\"21.1075\" y2=\"27.4243\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#45E7A4\"></stop><stop offset=\"1\" stop-color=\"#05909D\"></stop></linearGradient><linearGradient id=\"dsh_plugin_art_CU_0b\" x1=\"14.9894\" y1=\"9.0697\" x2=\"14.9894\" y2=\"21.3063\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#69B9FF\"></stop><stop offset=\"1\" stop-color=\"#324DE2\"></stop></linearGradient></defs>",
    use: "内置插件配置：子智能体（桌面 PluginArtworkSubagent）",
    source: "@deepseek-ai/dsh-client-ui-plugin-manager/lib/client.js（PluginArtwork* 由 @deepseek-ai/dsh-web-frontend primitives 提供；本仓库 task-5 已原样搬入 index.js BUILTIN_CONFIG_HTML 的 CONFIG_ART）",
  },
  'pageBuiltinWebSearch': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 36 36',
    rootProps: {"viewBox":"0 0 36 36","fill":"none"},
    inner: "<path d=\"M26.5362 26.9865L22.3813 22.8317\" stroke=\"#658EFF\" stroke-width=\"3\"></path><g clip-path=\"url(#dsh_plugin_art_$U_0ring)\"><g transform=\"matrix(0.0119394 -0.00173904 0.00173904 0.0119394 15.7661 16.2159)\"><foreignObject x=\"-958.94\" y=\"-958.94\" width=\"1917.88\" height=\"1917.88\"><div style=\"background:conic-gradient(from 90deg, rgb(65, 225, 172) 0deg, rgb(101, 142, 255) 62.0619deg, rgb(65, 225, 172) 360deg);height:100%;width:100%\"></div></foreignObject></g></g><defs><clipPath id=\"dsh_plugin_art_$U_0ring\"><path d=\"M21.9717 16.2159H19.9717C19.9717 18.5386 18.0888 20.4215 15.7661 20.4215V22.4215V24.4215C20.2979 24.4215 23.9717 20.7478 23.9717 16.2159H21.9717ZM15.7661 22.4215V20.4215C13.4434 20.4215 11.5605 18.5386 11.5605 16.2159H9.56055H7.56055C7.56055 20.7478 11.2343 24.4215 15.7661 24.4215V22.4215ZM9.56055 16.2159H11.5605C11.5605 13.8933 13.4434 12.0104 15.7661 12.0104V10.0104V8.01038C11.2343 8.01038 7.56055 11.6841 7.56055 16.2159H9.56055ZM15.7661 10.0104V12.0104C18.0888 12.0104 19.9717 13.8933 19.9717 16.2159H21.9717H23.9717C23.9717 11.6841 20.2979 8.01038 15.7661 8.01038V10.0104Z\"></path></clipPath></defs>",
    use: "内置插件配置：网页搜索（桌面 PluginArtworkSearch）",
    source: "@deepseek-ai/dsh-client-ui-plugin-manager/lib/client.js（PluginArtwork* 由 @deepseek-ai/dsh-web-frontend primitives 提供；本仓库 task-5 已原样搬入 index.js BUILTIN_CONFIG_HTML 的 CONFIG_ART）",
  },
  'pageBuiltinAgentLoop': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 36 36',
    rootProps: {"viewBox":"0 0 36 36","fill":"none"},
    inner: "<path d=\"M18.0486 28.4901C12.0858 28.4901 7.25195 23.6562 7.25195 17.6934C13.2148 17.6934 18.0486 22.5272 18.0486 28.4901Z\" fill=\"#A797FC\"></path><path d=\"M18.0486 6.89667C12.0858 6.89667 7.25195 11.7305 7.25195 17.6934C13.2148 17.6934 18.0486 12.8595 18.0486 6.89667Z\" fill=\"url(#dsh_plugin_art_bU_0a)\"></path><path d=\"M18.0485 28.4901C24.0114 28.4901 28.8452 23.6562 28.8452 17.6934C22.8824 17.6934 18.0485 22.5272 18.0485 28.4901Z\" fill=\"#4561EE\"></path><path d=\"M18.0485 6.89667C24.0114 6.89667 28.8452 11.7305 28.8452 17.6934C22.8824 17.6934 18.0485 12.8595 18.0485 6.89667Z\" fill=\"#658EFF\"></path><defs><linearGradient id=\"dsh_plugin_art_bU_0a\" x1=\"16.7911\" y1=\"16.1655\" x2=\"8.98192\" y2=\"8.74289\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#A23AE7\"></stop><stop offset=\"1\" stop-color=\"#E2E2E2\"></stop></linearGradient></defs>",
    use: "内置插件配置：Agent 循环（桌面 PluginArtworkLoop）",
    source: "@deepseek-ai/dsh-client-ui-plugin-manager/lib/client.js（PluginArtwork* 由 @deepseek-ai/dsh-web-frontend primitives 提供；本仓库 task-5 已原样搬入 index.js BUILTIN_CONFIG_HTML 的 CONFIG_ART）",
  },
  'pageBuiltinTerminal': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 36 36',
    rootProps: {"viewBox":"0 0 36 36","fill":"none"},
    inner: "<path d=\"M10 11L16.606 17.606C16.6841 17.6841 16.6841 17.8107 16.606 17.8888L10 24.4948\" stroke=\"#679EFE\" stroke-width=\"3.5\"></path><path d=\"M20.1211 24.4946H26.8685\" stroke=\"#679EFE\" stroke-width=\"3.5\"></path>",
    use: "内置插件配置：终端（桌面 PluginArtworkTerminal）",
    source: "@deepseek-ai/dsh-client-ui-plugin-manager/lib/client.js（PluginArtwork* 由 @deepseek-ai/dsh-web-frontend primitives 提供；本仓库 task-5 已原样搬入 index.js BUILTIN_CONFIG_HTML 的 CONFIG_ART）",
  },
  'pagePlugins': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<path d=\"M7.84457 5.06199C11.6605 4.93876 14.7962 6.14848 14.8484 7.76397C14.8875 8.97461 13.1838 10.0696 10.7215 10.5942\" stroke=\"currentColor\"></path><path d=\"M5.12742 8.07731C5.00419 4.26138 6.21391 1.12568 7.8294 1.07351C9.04004 1.03441 10.135 2.73808 10.6596 5.20037\" stroke=\"currentColor\"></path><path d=\"M8.02457 10.6802C4.20865 10.8034 1.07294 9.5937 1.02077 7.97821C0.981678 6.76758 2.68535 5.67262 5.14763 5.14798\" stroke=\"currentColor\"></path><path d=\"M10.7476 7.89535C10.8708 11.7113 9.66109 14.847 8.0456 14.8991C6.83496 14.9382 5.74 13.2346 5.21536 10.7723\" stroke=\"currentColor\"></path>",
    use: "页面入口：插件（桌面 ui-plugin-manager 的插件图标）",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconPluginPinwheelOutlineRegular",
    defIdent: 'iD',
    chunkOffset: 863355,
  },
  'pageAutomations': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<path d=\"M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z\" stroke=\"currentColor\"></path><path d=\"M8 4.31V8.46L11 10.08\" stroke=\"currentColor\"></path>",
    use: "页面入口：自动化（桌面 schedule 事件用的时钟图标）",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconClockOutlineRegular",
    defIdent: 'NP',
    chunkOffset: 860617,
  },
  'pageModels': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1.3},
    inner: "<path d=\"M7.8667 0.349609C8.96906 0.349634 10.0601 0.481272 11.0317 0.735352C11.9973 0.987845 12.8453 1.362 13.4644 1.84766C14.0744 2.32629 14.507 2.95539 14.5161 3.69336H14.5171V8.53516C14.0843 8.32076 13.6108 8.17679 13.1108 8.11816C13.1831 7.96848 13.2162 7.82856 13.2163 7.70312V5.76758C12.6269 6.16618 11.8739 6.47995 11.0317 6.7002C10.0602 6.95423 8.96896 7.08494 7.8667 7.08496C6.76461 7.08493 5.67411 6.95415 4.70264 6.7002C3.85994 6.48006 3.10694 6.1662 2.51709 5.76758V7.70312L2.521 7.78418C2.56374 8.19554 2.93361 8.74414 3.91357 9.23145C4.9281 9.73585 6.35004 10.0371 7.8667 10.0371C8.26373 10.0371 8.6543 10.0141 9.03271 9.97461C8.75596 10.3799 8.54664 10.8349 8.42041 11.3232C8.23666 11.3313 8.0518 11.3369 7.8667 11.3369C6.20108 11.3369 4.57025 11.01 3.33447 10.3955C3.04163 10.2499 2.76658 10.0836 2.51709 9.90039V11.6738C2.51728 12.1379 2.88589 12.7556 3.92236 13.292C4.93457 13.8157 6.35342 14.1289 7.8667 14.1289C8.12318 14.1289 8.37694 14.1161 8.62646 14.0986C8.82021 14.5535 9.08999 14.9682 9.41943 15.3271C8.91285 15.3934 8.39149 15.4287 7.8667 15.4287C6.19761 15.4287 4.56379 15.0869 3.32568 14.4463C2.11244 13.8185 1.21649 12.8562 1.21631 11.6738V3.76367C1.21595 3.74853 1.21438 3.733 1.21436 3.71777C1.21436 2.96917 1.65103 2.33053 2.26807 1.84668C2.88747 1.36112 3.73675 0.987685 4.70264 0.735352C5.67413 0.481376 6.76457 0.349636 7.8667 0.349609ZM7.8667 1.65039C6.86269 1.65042 5.88326 1.77028 5.03076 1.99316C4.17183 2.2176 3.50421 2.52956 3.06982 2.87012C2.65043 3.19909 2.52622 3.48898 2.51709 3.69336V3.74414C2.52719 3.94845 2.65185 4.23772 3.06982 4.56543C3.50425 4.90601 4.17172 5.21795 5.03076 5.44238C5.88326 5.66527 6.8627 5.78513 7.8667 5.78516C8.8707 5.78513 9.85015 5.66525 10.7026 5.44238C11.5611 5.21787 12.2286 4.9049 12.6626 4.56445C13.0982 4.22252 13.2163 3.9231 13.2163 3.71777L13.2104 3.63574C13.1818 3.43623 13.044 3.16941 12.6626 2.87012C12.2286 2.52957 11.5614 2.21773 10.7026 1.99316C9.85009 1.77025 8.8708 1.65041 7.8667 1.65039Z\" fill=\"currentColor\"></path><path d=\"M12.8936 10.0361L13.2061 10.5566C13.2296 10.5959 13.2651 10.6562 13.3027 10.707C13.3469 10.7666 13.4148 10.8431 13.5195 10.9023C13.6244 10.9617 13.725 10.9801 13.7988 10.9873C13.8619 10.9934 13.9318 10.9932 13.9775 10.9932H14.6162L14.8896 11.4502L14.5947 11.9443C14.5698 11.9859 14.5312 12.0483 14.5029 12.1084C14.4781 12.1611 14.4514 12.2312 14.4395 12.3164L14.4326 12.4072L14.4395 12.4971C14.4514 12.5825 14.4781 12.6532 14.5029 12.7061C14.5312 12.7661 14.5689 12.8287 14.5938 12.8701L14.8896 13.3633L14.6162 13.8213H13.9775C13.9318 13.8213 13.8619 13.821 13.7988 13.8271C13.7433 13.8326 13.6728 13.8442 13.5967 13.875L13.5195 13.9121C13.4148 13.9714 13.3469 14.0478 13.3027 14.1074C13.265 14.1583 13.2296 14.2186 13.2061 14.2578L12.8936 14.7783H12.3115L11.999 14.2578C11.9755 14.2186 11.9401 14.1583 11.9023 14.1074C11.8693 14.0628 11.823 14.0083 11.7578 13.959L11.6855 13.9121L11.6074 13.875C11.5316 13.8445 11.4615 13.8325 11.4062 13.8271C11.3432 13.821 11.2733 13.8213 11.2275 13.8213H10.5889L10.3135 13.3633L10.6104 12.8701C10.6352 12.8287 10.6739 12.7661 10.7021 12.7061C10.7352 12.6357 10.7724 12.534 10.7725 12.4072C10.7724 12.2804 10.7352 12.1788 10.7021 12.1084C10.6739 12.0483 10.6353 11.9859 10.6104 11.9443L10.3135 11.4502L10.5889 10.9932H11.2275C11.2733 10.9932 11.3432 10.9934 11.4062 10.9873C11.4801 10.9801 11.5808 10.9616 11.6855 10.9023C11.7903 10.843 11.8582 10.7666 11.9023 10.707C11.94 10.6562 11.9755 10.5959 11.999 10.5566L12.3115 10.0361H12.8936Z\" stroke=\"currentColor\" stroke-miterlimit=\"10\"></path>",
    use: "页面入口：模型中心（桌面设置 nav id=models 的图标）",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconDataOutlineMedium",
    defIdent: 'LP',
    chunkOffset: 861222,
  },
  'pageUsage': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<path d=\"M3.4041 13.096C2.49514 12.187 1.87614 11.0288 1.62537 9.76798C1.37459 8.50716 1.50331 7.20028 1.99525 6.01261C2.48719 4.82494 3.32025 3.80981 4.3891 3.09557C5.45795 2.38134 6.71458 2.00008 8.0001 2C9.28563 2.00008 10.5423 2.38134 11.6111 3.09557C12.68 3.80981 13.513 4.82494 14.005 6.01261C14.4969 7.20028 14.6256 8.50716 14.3748 9.76798C14.1241 11.0288 13.5051 12.187 12.5961 13.096\" stroke=\"currentColor\"></path><path d=\"M8 8.49994L11.6114 4.88855\" stroke=\"currentColor\"></path><path d=\"M8 9.75C8.69036 9.75 9.25 9.19036 9.25 8.5C9.25 7.80964 8.69036 7.25 8 7.25C7.30964 7.25 6.75 7.80964 6.75 8.5C6.75 9.19036 7.30964 9.75 8 9.75Z\" fill=\"currentColor\"></path>",
    use: "页面入口：用量/余额（桌面 chat 的 usage/performance 仪表图标）",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconGaugeOutlineRegular",
    defIdent: 'DP',
    chunkOffset: 862093,
  },
  'pageVoice': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<rect x=\"4.5+r/2\" y=\"1+r/2\" rx=\"(7-r)/2\"></rect><path d=\"M2.35 8.675C3.075 11.3 5.2 13.125 8 13.125C10.8 13.125 12.925 11.3 13.65 8.675M8 13.125V15\"></path>",
    use: "页面入口：语音（桌面 primitives 的麦克风图标；当前 client 未使用，但属于桌面图标集）",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconMicrophoneOutlineRegular",
    defIdent: 'FD',
    chunkOffset: 862677,
  },
  'pageNotifications': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 17 17',
    rootProps: {"viewBox":"0 0 17 17","fill":"none","strokeWidth":1},
    inner: "<path d=\"M4.09372 11.9895L3.11865 14.0387\" stroke=\"currentColor\"></path><path d=\"M12.1392 11.9895L13.1143 14.0387\" stroke=\"currentColor\"></path><path d=\"M8.11646 4.78442V8.03442L10.6165 9.53442\" stroke=\"currentColor\"></path><path d=\"M8.11646 13.4094C11.154 13.4094 13.6165 10.947 13.6165 7.90942C13.6165 4.87186 11.154 2.40942 8.11646 2.40942C5.07889 2.40942 2.61646 4.87186 2.61646 7.90942C2.61646 10.947 5.07889 13.4094 8.11646 13.4094Z\" stroke=\"currentColor\"></path><path d=\"M1.75952 4.74323C2.30657 3.65639 3.12646 2.73047 4.12926 2.05542\" stroke=\"currentColor\"></path><path d=\"M14.3345 4.74323C13.7874 3.65639 12.9675 2.73047 11.9647 2.05542\" stroke=\"currentColor\"></path>",
    use: "页面入口：通知（桌面没有铃铛图标，借用闹钟；见 MISSING 清单）",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconAlarmClockOutlineRegular",
    defIdent: 'sD',
    chunkOffset: 859646,
    borrowed: "桌面端图标集没有铃铛/通知图标，临时借用 IconAlarmClockOutlineRegular（闹钟）；不算自绘，但与桌面通知语义并非一一对应",
  },
  'statusRunning': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<path d=\"M12.596 12.596C11.687 13.5049 10.5288 14.1239 9.26798 14.3747C8.00716 14.6255 6.70028 14.4968 5.51261 14.0048C4.32494 13.5129 3.30981 12.6798 2.59557 11.611C1.88134 10.5421 1.50008 9.2855 1.5 7.99998C1.50008 6.71446 1.88134 5.45783 2.59557 4.38898C3.30981 3.32013 4.32494 2.48707 5.51261 1.99513C6.70028 1.50319 8.00716 1.37447 9.26798 1.62524C10.5288 1.87602 11.687 2.49502 12.596 3.40398\" stroke=\"currentColor\"></path>",
    use: "状态：运行中（桌面 loading）",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconLoadingOutlineRegular",
    defIdent: 'yy',
    chunkOffset: 862617,
  },
  'statusSuccess': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 36 36',
    rootProps: {"viewBox":"0 0 36 36","fill":"none","strokeWidth":1},
    inner: "<path d=\"M28.1936 14.6936L19.8066 23.0806C19.2373 23.65 18.7159 24.1742 18.24 24.5571C17.7389 24.9602 17.1365 25.3359 16.3657 25.458C15.9581 25.5225 15.5428 25.5225 15.1353 25.458C14.3645 25.3359 13.7621 24.9602 13.261 24.5571C12.7851 24.1742 12.2637 23.65 11.6943 23.0806L7.80737 19.1936L10.1936 16.8074L14.0806 20.6943C14.7033 21.317 15.0763 21.6873 15.377 21.9292C15.6523 22.1507 15.7109 22.1325 15.6626 22.1248C15.7208 22.1339 15.7802 22.1339 15.8384 22.1248C15.7901 22.1325 15.8486 22.1507 16.124 21.9292C16.4247 21.6873 16.7977 21.317 17.4204 20.6943L25.8074 12.3074L28.1936 14.6936Z\" fill=\"currentColor\"></path><path d=\"M32.8496 18.0005C32.8496 9.79906 26.2019 3.15137 18.0005 3.15137C9.79906 3.15137 3.15137 9.79906 3.15137 18.0005C3.15137 26.2019 9.79906 32.8496 18.0005 32.8496C26.2019 32.8496 32.8496 26.2019 32.8496 18.0005ZM35.7764 18.0005C35.7764 27.8173 27.8173 35.7764 18.0005 35.7764C8.18363 35.7764 0.224609 27.8173 0.224609 18.0005C0.224609 8.18363 8.18363 0.224609 18.0005 0.224609C27.8173 0.224609 35.7764 8.18363 35.7764 18.0005Z\" fill=\"currentColor\"></path>",
    use: "状态：成功（桌面 plugin-manager 的 check-circle-fill）",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconCheckCircleFillRegular",
    defIdent: 'AN',
    chunkOffset: 860053,
  },
  'statusFailed': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M15 8A7 7 0 1 1 1 8A7 7 0 1 1 15 8ZM6.409 10.652L5.348 9.591L6.939 8L5.348 6.409L6.409 5.348L8 6.939L9.591 5.348L10.652 6.409L9.061 8L10.652 9.591L9.591 10.652L8 9.061Z\" fill=\"currentColor\"></path>",
    use: "状态：失败（桌面 plan 的 close-circle-fill）",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconCloseCircleFillRegular",
    defIdent: 'rN',
    chunkOffset: 860673,
  },
  'statusWarning': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<path d=\"M8 14.5C11.5899 14.5 14.5 11.5899 14.5 8C14.5 4.41015 11.5899 1.5 8 1.5C4.41015 1.5 1.5 4.41015 1.5 8C1.5 11.5899 4.41015 14.5 8 14.5Z\" stroke=\"currentColor\"></path><path d=\"M8 4.29199V9.79199\" stroke=\"currentColor\"></path><path d=\"M8 10.708V11.708\" stroke=\"currentColor\"></path>",
    use: "状态：警告（桌面 toast 警告）",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconWarningOutlineRegular",
    defIdent: 'cy',
    chunkOffset: 864619,
  },
  'statusWarningTriangle': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<path d=\"M6.87 2.6a1.33 1.33 0 0 1 2.26 0l5.34 9.33A1.33 1.33 0 0 1 13.33 14H2.67a1.33 1.33 0 0 1-1.14-2.07Z\" stroke=\"currentColor\"></path><path d=\"M8 6v3m0 2.33h.01\" stroke=\"currentColor\"></path>",
    use: "状态：警告（桌面 sidebar 文档预览的三角警告）",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconWarningTriangleOutlineRegular",
    defIdent: 'FN',
    chunkOffset: 864684,
  },
  'actionExpand': {
    group: 'desktop',
    size: 14,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<path d=\"M4 6L7.29289 9.29289C7.68342 9.68342 8.31658 9.68342 8.70711 9.29289L12 6\" stroke=\"currentColor\"></path>",
    use: "操作：展开",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconChevronDownOutlineRegular",
    defIdent: 'Nv',
    chunkOffset: 860294,
  },
  'actionCollapse': {
    group: 'desktop',
    size: 14,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<path d=\"M12 10L8.70711 6.70711C8.31658 6.31658 7.68342 6.31658 7.29289 6.70711L4 10\" stroke=\"currentColor\"></path>",
    use: "操作：收起",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconChevronUpOutlineRegular",
    defIdent: 'Fv',
    chunkOffset: 860489,
  },
  'actionBack': {
    group: 'desktop',
    size: 14,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<path d=\"M10 4L6.70711 7.29289C6.31658 7.68342 6.31658 8.31658 6.70711 8.70711L10 12\" stroke=\"currentColor\"></path>",
    use: "操作：返回/后退",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconChevronLeftOutlineRegular",
    defIdent: 'qT',
    chunkOffset: 860359,
  },
  'actionOpen': {
    group: 'desktop',
    size: 14,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<path d=\"M6 12L9.29289 8.70711C9.68342 8.31658 9.68342 7.68342 9.29289 7.29289L6 4\" stroke=\"currentColor\"></path>",
    use: "操作：进入/下一级",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconChevronRightOutlineRegular",
    defIdent: 'GT',
    chunkOffset: 860425,
  },
  'actionClose': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<path d=\"M2.5 2.5L13.5 13.5\" stroke=\"currentColor\"></path><path d=\"M13.5 2.5L2.5 13.5\" stroke=\"currentColor\"></path>",
    use: "操作：关闭",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconCloseOutlineRegular",
    defIdent: 'ru',
    chunkOffset: 860776,
  },
  'actionDelete': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<path d=\"M1.28149 3.88831H14.7187\" stroke=\"currentColor\"></path><path d=\"M5.41602 3.88833V2.47962C5.41602 2.29282 5.52492 2.11366 5.71876 1.98157C5.9126 1.84948 6.17551 1.77527 6.44964 1.77527H9.55053C9.82466 1.77527 10.0876 1.84948 10.2814 1.98157C10.4753 2.11366 10.5842 2.29282 10.5842 2.47962V3.88833\" stroke=\"currentColor\"></path><path d=\"M2.57349 3.88831L3.19366 13.2943C3.21937 13.5502 3.33952 13.7872 3.53065 13.9593C3.72178 14.1313 3.97016 14.2259 4.22729 14.2246H11.7728C12.0299 14.2259 12.2783 14.1313 12.4694 13.9593C12.6605 13.7872 12.7807 13.5502 12.8064 13.2943L13.4266 3.88831\" stroke=\"currentColor\"></path><path d=\"M6.44946 6.98926V11.1238\" stroke=\"currentColor\"></path><path d=\"M9.55054 6.98926V11.1238\" stroke=\"currentColor\"></path>",
    use: "操作：删除",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconTrashOutlineRegular",
    defIdent: 'NN',
    chunkOffset: 864287,
  },
  'actionRefresh': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<path d=\"M14.5001 8C14.5 9.28552 14.1188 10.5422 13.4045 11.611C12.6903 12.6799 11.6752 13.5129 10.4875 14.0049C9.29982 14.4968 7.99295 14.6255 6.73212 14.3747C5.4713 14.124 4.31314 13.505 3.4041 12.596C2.49514 11.687 1.87614 10.5288 1.62537 9.26798C1.37459 8.00716 1.50331 6.70028 1.99525 5.51261C2.48719 4.32494 3.32025 3.30981 4.3891 2.59557C5.45795 1.88134 6.71458 1.50008 8.0001 1.5C9.9001 1.5 11.7001 2.3 13.0001 3.6L14.5001 5.1\" stroke=\"currentColor\"></path><path d=\"M14.4999 1.5V5.1H10.8999\" stroke=\"currentColor\"></path>",
    use: "操作：刷新",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconRefreshOutlineRegular",
    defIdent: 'Jv',
    chunkOffset: 863645,
  },
  'actionSearch': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<path d=\"M6.58727 11.8586C9.55061 11.8586 11.9529 9.45637 11.9529 6.49304C11.9529 3.5297 9.55061 1.12744 6.58727 1.12744C3.62394 1.12744 1.22168 3.5297 1.22168 6.49304C1.22168 9.45637 3.62394 11.8586 6.58727 11.8586Z\" stroke=\"currentColor\"></path><path d=\"M10.2991 10.3933L14.7783 14.8725\" stroke=\"currentColor\"></path>",
    use: "操作：搜索",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconSearchOutlineRegular",
    defIdent: 'TT',
    chunkOffset: 863758,
  },
  'actionCopy': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<rect x=\"1.52075\" y=\"4.07373\" rx=\"2\" stroke=\"currentColor\"></rect><path d=\"M11.9792 1.53296C13.36 1.53296 14.4792 2.65225 14.4792 4.03296V9.42847C14.4792 10.3756 13.9521 11.1987 13.1755 11.6228V10.3298C13.3652 10.0787 13.4792 9.7674 13.4792 9.42847V4.03296C13.4792 3.20453 12.8077 2.53296 11.9792 2.53296H6.58374C6.27966 2.53301 5.99684 2.6235 5.7605 2.77905H4.42358C4.85652 2.03463 5.66056 1.53304 6.58374 1.53296H11.9792Z\" fill=\"currentColor\"></path>",
    use: "操作：复制",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconCopyOutlineRegular",
    defIdent: 't4',
    chunkOffset: 861078,
  },
  'actionMore': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<path d=\"M3 9C3.55228 9 4 8.55228 4 8C4 7.44772 3.55228 7 3 7C2.44772 7 2 7.44772 2 8C2 8.55228 2.44772 9 3 9Z\" fill=\"currentColor\"></path><path d=\"M8 9C8.55228 9 9 8.55228 9 8C9 7.44772 8.55228 7 8 7C7.44772 7 7 7.44772 7 8C7 8.55228 7.44772 9 8 9Z\" fill=\"currentColor\"></path><path d=\"M13 9C13.5523 9 14 8.55228 14 8C14 7.44772 13.5523 7 13 7C12.4477 7 12 7.44772 12 8C12 8.55228 12.4477 9 13 9Z\" fill=\"currentColor\"></path>",
    use: "操作：更多",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconEllipsisOutlineRegular",
    defIdent: 'UT',
    chunkOffset: 861628,
  },
  'actionAdd': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<path d=\"M8 2V14\" stroke=\"currentColor\"></path><path d=\"M2 8H14\" stroke=\"currentColor\"></path>",
    use: "操作：新增",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconPlusOutlineRegular",
    defIdent: 'Ov',
    chunkOffset: 863416,
  },
  'actionEdit': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<path d=\"M8.85596 2.69971H4.19971C3.37141 2.69971 2.69992 3.37146 2.69971 4.19971V11.8003C2.69992 12.6285 3.37141 13.3003 4.19971 13.3003H11.8003C12.6283 13.2999 13.3001 12.6283 13.3003 11.8003V7.89893H14.3003V11.8003C14.3001 13.1806 13.1806 14.2999 11.8003 14.3003H4.19971C2.81913 14.3003 1.69992 13.1808 1.69971 11.8003V4.19971C1.69992 2.81918 2.81913 1.69971 4.19971 1.69971H8.85596V2.69971Z\" fill=\"currentColor\"></path><path d=\"M7.7849 8.23878L13.888 2.13574\" stroke=\"currentColor\"></path>",
    use: "操作：编辑",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconEditOutlineRegular",
    defIdent: '_N',
    chunkOffset: 861573,
  },
  'actionCheck': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<path d=\"M2.25 8.5L5.49732 11.7473C5.90519 12.1552 6.57263 12.1344 6.95426 11.7018L13.75 4\" stroke=\"currentColor\"></path>",
    use: "操作：勾选",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconCheckOutlineRegular",
    defIdent: 'Io',
    chunkOffset: 860174,
  },
  'actionDownload': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<path d=\"M8 1.95317V10.0469\" stroke=\"currentColor\"></path><path d=\"M4.25 6.29688L8 10.0469L11.75 6.29688\" stroke=\"currentColor\"></path><path d=\"M1.5 10.0469V13.158C1.5 13.3937 1.60536 13.6198 1.79289 13.7865C1.98043 13.9532 2.23478 14.0469 2.5 14.0469H13.5C13.7652 14.0469 14.0196 13.9532 14.2071 13.7865C14.3946 13.6198 14.5 13.3937 14.5 13.158V10.0469\" stroke=\"currentColor\"></path>",
    use: "操作：下载/导出",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconDownloadOutlineRegular",
    defIdent: 'QN',
    chunkOffset: 861518,
  },
  'actionAttach': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<path d=\"M12.75 4.5V9.5C12.75 10.7598 12.2496 11.968 11.3588 12.8588C10.468 13.7496 9.25978 14.25 8 14.25C6.74022 14.25 5.53204 13.7496 4.64124 12.8588C3.75045 11.968 3.25 10.7598 3.25 9.5V5C3.25 4.13805 3.59241 3.3114 4.2019 2.7019C4.8114 2.09241 5.63805 1.75 6.5 1.75C7.36195 1.75 8.1886 2.09241 8.7981 2.7019C9.40759 3.3114 9.75 4.13805 9.75 5V9.5C9.75 9.96413 9.56563 10.4092 9.23744 10.7374C8.90925 11.0656 8.46413 11.25 8 11.25C7.53587 11.25 7.09075 11.0656 6.76256 10.7374C6.43437 10.4092 6.25 9.96413 6.25 9.5V5.5\" stroke=\"currentColor\"></path>",
    use: "操作：附件",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconPaperclipOutlineRegular",
    defIdent: 'GN',
    chunkOffset: 862969,
  },
  'actionInfo': {
    group: 'desktop',
    size: 14,
    viewBox: '0 0 14 14',
    rootProps: {"viewBox":"0 0 14 14","fill":"none","strokeWidth":1},
    inner: "<path d=\"M12.5757 7.00012C12.5757 3.92085 10.0794 1.42463 7.00012 1.42456C3.9208 1.42456 1.42456 3.9208 1.42456 7.00012C1.42463 10.0794 3.92085 12.5757 7.00012 12.5757C10.0793 12.5756 12.5756 10.0793 12.5757 7.00012ZM13.8002 7.00012C13.8001 10.7559 10.7559 13.8001 7.00012 13.8002C3.2443 13.8002 0.199291 10.7559 0.199219 7.00012C0.199219 3.24426 3.24426 0.199219 7.00012 0.199219C10.7559 0.199291 13.8002 3.2443 13.8002 7.00012Z\" fill=\"currentColor\"></path><path d=\"M7.6127 3.18921V4.55986H6.38735V3.18921H7.6127Z\" fill=\"currentColor\"></path><path d=\"M7.6127 5.68921V10.8109H6.38735V5.68921H7.6127Z\" fill=\"currentColor\"></path>",
    use: "操作：信息",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconInfoOutlineRegular",
    defIdent: 'By',
    chunkOffset: 862249,
  },
  'actionSend': {
    group: 'desktop',
    size: 14,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<path d=\"M6.97211 1.94476C7.55785 1.35914 8.50767 1.35919 9.09343 1.94476L13.921 6.77228L13.2138 7.47939L8.38632 2.65187C8.19108 2.45682 7.87443 2.45677 7.67922 2.65187L2.74397 7.58711L2.03687 6.88L6.97211 1.94476Z\" fill=\"currentColor\"></path><path d=\"M7.97571 14.5732L8.02421 2.34139\" stroke=\"currentColor\"></path>",
    use: "操作：发送",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconSendOutlineRegular",
    defIdent: 'RP',
    chunkOffset: 863811,
  },
  'commandGoal': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<path d=\"M14.5001 8C14.5 9.28552 14.1188 10.5422 13.4045 11.611C12.6903 12.6799 11.6752 13.5129 10.4875 14.0049C9.29982 14.4968 7.99295 14.6255 6.73212 14.3747C5.4713 14.124 4.31314 13.505 3.4041 12.596C2.49514 11.687 1.87614 10.5288 1.62537 9.26798C1.37459 8.00716 1.50331 6.70028 1.99525 5.51261C2.48719 4.32494 3.32025 3.30981 4.3891 2.59557C5.45795 1.88134 6.71458 1.50008 8.0001 1.5\" stroke=\"currentColor\"></path><path d=\"M11.5 8C11.5001 8.69227 11.2948 9.36901 10.9102 9.94463C10.5257 10.5202 9.97901 10.9689 9.33944 11.2338C8.69986 11.4987 7.99609 11.5681 7.31712 11.433C6.63816 11.2979 6.01449 10.9645 5.52501 10.475C5.03548 9.98552 4.70209 9.36185 4.56702 8.68289C4.43195 8.00392 4.50127 7.30015 4.76619 6.66057C5.03112 6.021 5.47976 5.47436 6.05538 5.08978C6.631 4.70519 7.30774 4.49995 8.00001 4.5\" stroke=\"currentColor\"></path><path d=\"M8.00024 7.99976L11.2 4.80005\" stroke=\"currentColor\"></path><path d=\"M12.4719 5.62245C12.4246 5.66972 12.3569 5.69025 12.2913 5.67715L10.7814 5.37555C10.7022 5.35972 10.6402 5.29781 10.6244 5.2186L10.3228 3.70866C10.3097 3.6431 10.3302 3.57533 10.3775 3.52806L12.1826 1.723C12.2863 1.61929 12.4627 1.65879 12.5122 1.79684L12.9271 2.95225C12.9472 3.00847 12.9915 3.05272 13.0477 3.07291L14.2031 3.48774C14.3412 3.5373 14.3807 3.71368 14.277 3.81739L12.4719 5.62245Z\" stroke=\"currentColor\"></path>",
    use: "命令面板：/goal（桌面 ui-commands HOST_FACES 的图标）",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconGoalOutlineRegular",
    defIdent: 'JP',
    chunkOffset: 862198,
  },
  'commandPlan': {
    group: 'desktop',
    size: 14,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<path d=\"M4.9375 5.90295H11.0625\" stroke=\"currentColor\"></path><path d=\"M4.9375 9.02991H8.27841\" stroke=\"currentColor\"></path><path d=\"M12.5 1.32617C13.3039 1.32617 14 1.95171 14 2.77637V7.61328L13 8.68164V2.77637C13 2.55186 12.8007 2.32617 12.5 2.32617H3.5C3.1993 2.32617 3 2.55186 3 2.77637V13.2246C3.00044 13.4489 3.19963 13.6738 3.5 13.6738H8.32812L7.39258 14.6738H3.5C2.69637 14.6738 2.00042 14.0489 2 13.2246V2.77637C2 1.95171 2.69613 1.32617 3.5 1.32617H12.5Z\" fill=\"currentColor\"></path><path d=\"M8.97212 14.3693C9.17511 14.5723 9.37811 14.7753 9.5811 14.9783C9.67012 14.8953 9.75914 14.8123 9.84815 14.7293C11.4505 13.2352 13.0528 11.7411 14.6551 10.247C14.7441 10.164 14.8331 10.081 14.9221 9.99803C14.5989 9.6748 14.2756 9.35157 13.9524 9.02834C13.8694 9.11736 13.7864 9.20637 13.7034 9.29539C12.2093 10.8977 10.7152 12.5 9.22113 14.1023C9.13813 14.1913 9.05513 14.2803 8.97212 14.3693Z\" fill=\"currentColor\"></path><path d=\"M11.6323 13.7841C11.6323 14.0395 11.6323 14.295 11.6323 14.5504C11.6812 14.5523 11.7301 14.5543 11.779 14.5562C12.659 14.5913 13.539 14.6263 14.419 14.6614C14.4679 14.6633 14.5168 14.6653 14.5657 14.6672C14.5657 14.3339 14.5657 14.0006 14.5657 13.6672C14.5168 13.6692 14.4679 13.6711 14.419 13.6731C13.539 13.7081 12.659 13.7432 11.779 13.7783C11.7301 13.7802 11.6812 13.7821 11.6323 13.7841Z\" fill=\"currentColor\"></path>",
    use: "命令面板：/plan（桌面 ui-commands HOST_FACES 的图标）",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconPlanOutlineRegular",
    defIdent: 'mD',
    chunkOffset: 863243,
  },
  'commandFeedback': {
    group: 'desktop',
    size: 14,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<path d=\"M4.74024 9.11029L1.82882 7.79865C1.75022 7.76323 1.75026 7.65161 1.82889 7.61626L12.9665 2.60943C13.0354 2.57846 13.1125 2.63213 13.1073 2.70749L12.3914 13.1388C12.3864 13.2117 12.3073 13.2548 12.2433 13.2194L6.12677 9.83657\" stroke=\"currentColor\"></path><path d=\"M8.44336 11.0825L6.2832 13.2843C6.22048 13.3482 6.11182 13.3038 6.11182 13.2143V9.86772C6.11182 9.84165 6.122 9.8166 6.1402 9.79793L12.972 2.78748\" stroke=\"currentColor\"></path>",
    use: "命令面板：/feedback（桌面 ui-commands HOST_FACES 的图标）",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconPaperPlaneOutlineRegular",
    defIdent: 'BN',
    chunkOffset: 862907,
  },
  'commandCompact': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<path opacity=\"0.35\" d=\"M8 14.5C11.5899 14.5 14.5 11.5899 14.5 8C14.5 4.41015 11.5899 1.5 8 1.5C4.41015 1.5 1.5 4.41015 1.5 8C1.5 11.5899 4.41015 14.5 8 14.5Z\" stroke=\"currentColor\"></path><path d=\"M8 1.5C8.85359 1.5 9.69883 1.66813 10.4874 1.99478C11.2761 2.32144 11.9926 2.80022 12.5962 3.40381C13.1998 4.00739 13.6786 4.72394 14.0052 5.51256C14.3319 6.30117 14.5 7.14641 14.5 8\" stroke=\"currentColor\"></path>",
    use: "命令面板：/compact（桌面 ui-commands HOST_FACES 的图标）",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconCompactOutlineRegular",
    defIdent: 'vD',
    chunkOffset: 860882,
  },
  'commandPermission': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<path d=\"M6.59624 2.14853C7.50155 1.80917 8.49914 1.80919 9.40444 2.14859L13.9245 3.84317V7.11961C13.9245 11.6089 10.5565 13.5975 8.00035 14.5779C5.44423 13.5975 2.07544 11.6089 2.07544 7.11961V3.84317L6.59624 2.14853Z\" stroke=\"currentColor\" stroke-linejoin=\"round\"></path><path d=\"M8 4.39209V9.89209\" stroke=\"currentColor\"></path><path d=\"M8 10.8081V11.8081\" stroke=\"currentColor\"></path>",
    use: "命令面板：/permission（桌面 ui-commands HOST_FACES 的图标）",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· PermissionIconFullAccessRegular",
    defIdent: '_A',
    chunkOffset: 865223,
  },
  'commandExport': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<path d=\"M8 1.95317V10.0469\" stroke=\"currentColor\"></path><path d=\"M4.25 6.29688L8 10.0469L11.75 6.29688\" stroke=\"currentColor\"></path><path d=\"M1.5 10.0469V13.158C1.5 13.3937 1.60536 13.6198 1.79289 13.7865C1.98043 13.9532 2.23478 14.0469 2.5 14.0469H13.5C13.7652 14.0469 14.0196 13.9532 14.2071 13.7865C14.3946 13.6198 14.5 13.3937 14.5 13.158V10.0469\" stroke=\"currentColor\"></path>",
    use: "命令面板：/export（桌面 ui-commands HOST_FACES 的图标）",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconDownloadOutlineRegular",
    defIdent: 'QN',
    chunkOffset: 861518,
  },
  'commandFile': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<path d=\"M12.75 4.5V9.5C12.75 10.7598 12.2496 11.968 11.3588 12.8588C10.468 13.7496 9.25978 14.25 8 14.25C6.74022 14.25 5.53204 13.7496 4.64124 12.8588C3.75045 11.968 3.25 10.7598 3.25 9.5V5C3.25 4.13805 3.59241 3.3114 4.2019 2.7019C4.8114 2.09241 5.63805 1.75 6.5 1.75C7.36195 1.75 8.1886 2.09241 8.7981 2.7019C9.40759 3.3114 9.75 4.13805 9.75 5V9.5C9.75 9.96413 9.56563 10.4092 9.23744 10.7374C8.90925 11.0656 8.46413 11.25 8 11.25C7.53587 11.25 7.09075 11.0656 6.76256 10.7374C6.43437 10.4092 6.25 9.96413 6.25 9.5V5.5\" stroke=\"currentColor\"></path>",
    use: "命令面板：/file（桌面 ui-conversation 注册的 file 命令图标）",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconPaperclipOutlineRegular",
    defIdent: 'GN',
    chunkOffset: 862969,
  },
  'commandModel': {
    group: 'desktop',
    size: 16,
    viewBox: '0 0 16 16',
    rootProps: {"viewBox":"0 0 16 16","fill":"none","strokeWidth":1},
    inner: "<path d=\"M7.8667 0.349609C8.96906 0.349634 10.0601 0.481272 11.0317 0.735352C11.9973 0.987845 12.8453 1.362 13.4644 1.84766C14.0744 2.32629 14.507 2.95539 14.5161 3.69336H14.5171V8.53516C14.0843 8.32076 13.6108 8.17679 13.1108 8.11816C13.1831 7.96848 13.2162 7.82856 13.2163 7.70312V5.76758C12.6269 6.16618 11.8739 6.47995 11.0317 6.7002C10.0602 6.95423 8.96896 7.08494 7.8667 7.08496C6.76461 7.08493 5.67411 6.95415 4.70264 6.7002C3.85994 6.48006 3.10694 6.1662 2.51709 5.76758V7.70312L2.521 7.78418C2.56374 8.19554 2.93361 8.74414 3.91357 9.23145C4.9281 9.73585 6.35004 10.0371 7.8667 10.0371C8.26373 10.0371 8.6543 10.0141 9.03271 9.97461C8.75596 10.3799 8.54664 10.8349 8.42041 11.3232C8.23666 11.3313 8.0518 11.3369 7.8667 11.3369C6.20108 11.3369 4.57025 11.01 3.33447 10.3955C3.04163 10.2499 2.76658 10.0836 2.51709 9.90039V11.6738C2.51728 12.1379 2.88589 12.7556 3.92236 13.292C4.93457 13.8157 6.35342 14.1289 7.8667 14.1289C8.12318 14.1289 8.37694 14.1161 8.62646 14.0986C8.82021 14.5535 9.08999 14.9682 9.41943 15.3271C8.91285 15.3934 8.39149 15.4287 7.8667 15.4287C6.19761 15.4287 4.56379 15.0869 3.32568 14.4463C2.11244 13.8185 1.21649 12.8562 1.21631 11.6738V3.76367C1.21595 3.74853 1.21438 3.733 1.21436 3.71777C1.21436 2.96917 1.65103 2.33053 2.26807 1.84668C2.88747 1.36112 3.73675 0.987685 4.70264 0.735352C5.67413 0.481376 6.76457 0.349636 7.8667 0.349609ZM7.8667 1.65039C6.86269 1.65042 5.88326 1.77028 5.03076 1.99316C4.17183 2.2176 3.50421 2.52956 3.06982 2.87012C2.65043 3.19909 2.52622 3.48898 2.51709 3.69336V3.74414C2.52719 3.94845 2.65185 4.23772 3.06982 4.56543C3.50425 4.90601 4.17172 5.21795 5.03076 5.44238C5.88326 5.66527 6.8627 5.78513 7.8667 5.78516C8.8707 5.78513 9.85015 5.66525 10.7026 5.44238C11.5611 5.21787 12.2286 4.9049 12.6626 4.56445C13.0982 4.22252 13.2163 3.9231 13.2163 3.71777L13.2104 3.63574C13.1818 3.43623 13.044 3.16941 12.6626 2.87012C12.2286 2.52957 11.5614 2.21773 10.7026 1.99316C9.85009 1.77025 8.8708 1.65041 7.8667 1.65039Z\" fill=\"currentColor\"></path><path d=\"M12.8936 10.0361L13.2061 10.5566C13.2296 10.5959 13.2651 10.6562 13.3027 10.707C13.3469 10.7666 13.4148 10.8431 13.5195 10.9023C13.6244 10.9617 13.725 10.9801 13.7988 10.9873C13.8619 10.9934 13.9318 10.9932 13.9775 10.9932H14.6162L14.8896 11.4502L14.5947 11.9443C14.5698 11.9859 14.5312 12.0483 14.5029 12.1084C14.4781 12.1611 14.4514 12.2312 14.4395 12.3164L14.4326 12.4072L14.4395 12.4971C14.4514 12.5825 14.4781 12.6532 14.5029 12.7061C14.5312 12.7661 14.5689 12.8287 14.5938 12.8701L14.8896 13.3633L14.6162 13.8213H13.9775C13.9318 13.8213 13.8619 13.821 13.7988 13.8271C13.7433 13.8326 13.6728 13.8442 13.5967 13.875L13.5195 13.9121C13.4148 13.9714 13.3469 14.0478 13.3027 14.1074C13.265 14.1583 13.2296 14.2186 13.2061 14.2578L12.8936 14.7783H12.3115L11.999 14.2578C11.9755 14.2186 11.9401 14.1583 11.9023 14.1074C11.8693 14.0628 11.823 14.0083 11.7578 13.959L11.6855 13.9121L11.6074 13.875C11.5316 13.8445 11.4615 13.8325 11.4062 13.8271C11.3432 13.821 11.2733 13.8213 11.2275 13.8213H10.5889L10.3135 13.3633L10.6104 12.8701C10.6352 12.8287 10.6739 12.7661 10.7021 12.7061C10.7352 12.6357 10.7724 12.534 10.7725 12.4072C10.7724 12.2804 10.7352 12.1788 10.7021 12.1084C10.6739 12.0483 10.6353 11.9859 10.6104 11.9443L10.3135 11.4502L10.5889 10.9932H11.2275C11.2733 10.9932 11.3432 10.9934 11.4062 10.9873C11.4801 10.9801 11.5808 10.9616 11.6855 10.9023C11.7903 10.843 11.8582 10.7666 11.9023 10.707C11.94 10.6562 11.9755 10.5959 11.999 10.5566L12.3115 10.0361H12.8936Z\" stroke=\"currentColor\" stroke-miterlimit=\"10\"></path>",
    use: "命令面板：/model（桌面 ui-model-selection 注册的 model 命令图标）",
    source: "@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js（primitives 实现，字节偏移见 meta）· IconDataOutlineRegular",
    defIdent: 'OP',
    chunkOffset: 861247,
  },
}

/** 枚举全部图标（回归/测试用）。 */
export function listIcons(): IconMeta[] {
  return Object.values(ICONS)
}

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  readonly name: IconName
  /** 覆盖默认尺寸（默认取 IconMeta.size）。 */
  readonly size?: number
}

/**
 * 渲染一个图标：`<Icon name="actionSearch" />`。
 *
 * 桌面端原 svg 的根属性（fill/stroke/stroke-width/linecap…）与内部 path 都原样输出，
 * 只由 `width/height` 决定渲染尺寸；额外 props（onClick、aria-label…）透传给 <svg>。
 */
export function Icon({ name, size, className, ...rest }: IconProps) {
  const def: IconMeta | undefined = ICONS[name]
  if (def === undefined) return null
  const dimension = size ?? def.size
  return (
    <svg
      {...(def.rootProps as SVGProps<SVGSVGElement>)}
      width={dimension}
      height={dimension}
      className={className}
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: def.inner }}
      {...rest}
    />
  )
}

/**
 * 桌面端图标集里**没有**对应用法的项：如实列出，等 lead 决策，不静默自绘。
 * （A/B 批次接线时：这些位置暂时保留 bundle 现有图标，或按 lead 决定另找桌面端出处。）
 */
export const MISSING_DESKTOP_ICONS = [
  { what: "设备管理", why: "桌面端图标集没有手机/设备类图标（primitives 199 个导出里无 Phone/Device/Mobile/Monitor）。移动端配对是 dsh-palm 自己的页面，桌面无对应入口。" },
  { what: "通知（铃铛）", why: "桌面端没有铃铛/Notification 图标；已临时借用 IconAlarmClockOutlineRegular（pageNotifications，条目里 borrowed 有说明）。" },
  { what: "待处理指示（点/条）", why: "桌面端用纯色状态点（primitives 的 StateDot，CSS 圆点），不是 svg 图标；本模块不提供伪图标。" },
  { what: "/orchestrate 命令图标", why: "该命令由本机插件注册，桌面端命令表（ui-commands 的 HOST_FACES）只有 goal/plan/feedback/compact/permission/export 六个 faces，没有 orchestrate 的图标；桌面端对这种命令不显示图标，因此本模块也不给。" },
] as const

/* ── 给非 React 的旧模块（页面型注入字符串）用 ───────────────────────────
   迁移进来的 dm-pages/dm-toolbar 模块是「HTML 字符串 + 内联脚本」，不能直接
   `import { Icon }`；它们统一改用下面两个纯字符串 helper 取同一份桌面 svg，
   这样图标仍然只有 design/icons.tsx 一个来源。 */

/** 渲染一个图标需要的原始片段。 */
export interface IconParts {
  /** svg viewBox（桌面端原值） */
  readonly viewBox: string
  /** 根上的原始属性（fill / stroke / stroke-width 等，kebab-case） */
  readonly rootAttrs: Readonly<Record<string, string | number>>
  /** svg 内部标记（path / g / defs，原样） */
  readonly inner: string
  /** 桌面端默认尺寸 */
  readonly size: number
}

/** 取一个图标的原始片段（不渲染，供字符串模板拼接）。 */
export function iconParts(name: IconName): IconParts {
  const def = ICONS[name]
  return {
    viewBox: def.viewBox,
    rootAttrs: def.rootProps,
    inner: def.inner,
    size: def.size,
  }
}

export interface IconMarkupOptions {
  /** 覆盖默认尺寸（px） */
  readonly size?: number
  /** 追加到 svg 上的额外属性串（例如 `class="dm-cmd-icon" aria-hidden="true"`） */
  readonly attrs?: string
}

/**
 * 生成一个图标的 svg 字符串（给旧模块的模板字符串用）。
 *
 * 与 `<Icon>` 输出同一份 viewBox / 根属性 / path，只是序列化成文本；
 * 尺寸默认取桌面端 default size，可显式覆盖。
 */
export function iconMarkup(name: IconName, options: IconMarkupOptions = {}): string {
  const def = ICONS[name]
  const dimension = options.size ?? def.size
  const attrs = Object.entries(def.rootProps)
    .map(([key, value]) => `${key}="${String(value)}"`)
    .join(' ')
  const extra = options.attrs ? ` ${options.attrs}` : ''
  return `<svg width="${dimension}" height="${dimension}" ${attrs}${extra}>${def.inner}</svg>`
}
