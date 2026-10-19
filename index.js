/**
 * dsh-mobile —— 掌上 dsh（宿主入口）。
 *
 * 入口只做装配：导出插件 name/inject，apply() 把 ctx/config 交给 src/host/core.js。
 * 宿主实现（HTTP 两个 face、设备表、SSE、RPC、页面渲染）在 src/host/ 下。
 */
import { createHost } from './src/host/core.js'

export const name = 'dsh-mobile'
// workspace.* 走 ctx.workspaceController，subagent.list 走 ctx.subagents，
// mobile.listDirectory 走 ctx.directoryPickerController —— 三者必须显式 inject，
// 否则 Cordis 会以「cannot get property ... without inject」拒绝读取，
// 靠加载顺序碰运气只会拿到 undefined（新建工作区由此白屏）。
export const inject = [
  'webServer',
  'sessionController',
  'workspaceRegistry',
  'workspaceController',
  'subagents',
  'directoryPickerController',
  'credentials',
  'deepseekAccount',
  // 手机工具栏「权限」按钮：读/切权限预设需要这两个服务。
  // permissionPresets 提供 catalog()（可选预设）/ current(session) / set(session, name)；
  // sessions 用来把 sessionId 解析成 Session 对象（上面两个方法收的是 Session，不是 id）。
  'permissionPresets',
  'sessions',
  // 排队消息（需求 C）：读 agent.inbox.nextTurn / nextStep 推 session/queue 帧。
  // agents 提供 sessionId → Agent（含 inbox）的解析；不加会「cannot get without inject」。
  'agents',
]

export function apply(ctx, config) {
  return createHost(ctx, config)
}
