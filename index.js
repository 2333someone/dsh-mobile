/**
 * dsh-mobile —— 掌上 dsh（宿主入口）。
 *
 * 入口只做装配：导出插件 name/inject，apply() 把 ctx/config 交给 src/host/core.js。
 * 宿主实现（HTTP 两个 face、设备表、SSE、RPC、页面渲染）在 src/host/ 下。
 */
import { createHost } from './src/host/core.js'

export const name = 'dsh-mobile'

/**
 * 必需服务只保留 `webServer`（挂路由用）。
 *
 * 其余服务（sessionController / workspaceRegistry / workspaceController / subagents /
 * directoryPickerController / credentials / deepseekAccount / permissionPresets /
 * sessions / agents）**一律改成运行时 `ctx.get(name)` 惰性读取**，而不是写进 inject。
 *
 * 原因：Cordis 的 inject 是「硬依赖」——只要有一个服务不存在，插件会永远停在
 * `pending (waiting for services: …)`，**永远不激活**，连带客户端半边（设置页）也不会加载。
 * 2026-10-21 就有用户在另一台机器上（服务名/版本不一致）遇到这个：插件显示已启用，
 * 但设置里没有「掌上 dsh」。
 *
 * 改成惰性读取后：缺服务也能激活，只是对应功能降级（缺什么会在启动日志里列出来）。
 */
export const inject = ['webServer']

export function apply(ctx, config) {
  return createHost(ctx, config)
}
