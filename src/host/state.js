/**
 * 宿主共享状态容器（ctxBag 的第一层）。
 *
 * 这些是**运行时可变容器**，不是模块级全局：由 core 的 createHost 创建一次，
 * 再以别名（devices/observers/...）交给闭包内的函数，以及后续搬出的 devices/sse
 * 模块使用。搬出模块时只要把 `state` 传进去即可，不需要再靠闭包捕获。
 */
export function createHostState({ devices }) {
  return {
    // 设备表：deviceId -> { token, createdAt, lastSeenAt, ... }
    devices,
    // 当前待用的 6 位配对码（null = 没有有效码）
    pairToken: null,
    // 待处理：approval / question 的 rpcId 注册表（含 resolve）
    pending: {
      approvals: new Map(),
      questions: new Map(),
      byApprovalId: new Map(),
    },
    // SSE：设备正在看的会话、观察时间、follow 单例、流集合、每轮流式状态
    observers: new Map(),
    lastObservedByDevice: new Map(),
    lastObserved: new Map(),
    follows: new Map(),
    streamStates: new Map(),
    muxStreams: new Set(),
    lastPersistedSeq: new Map(),
    lastStep: new Map(),
  }
}
