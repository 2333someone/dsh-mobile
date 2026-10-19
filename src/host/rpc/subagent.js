/**
 * subagent.* 域（1 个方法）：列出某会话的子代理。
 *
 * 从 `core.js` 搬出。顺手登记「子代理 id → 父会话 id」的缓存（`recordSubagentParents`
 * 是 core 里那张 `subagentParent` 表的写入口，面板点开某行看聊天时要用父地址读）。
 */
export function createSubagentRpc({ getService, recordSubagentParents }) {
  return {
    'subagent.list': async (payload) => {
      const parentSessionId = typeof payload?.parentSessionId === 'string' ? payload.parentSessionId : ''
      if (parentSessionId === '') return { ok: true, value: { entries: [], parentAvailable: false } }
      const subagents = getService('subagents')
      if (!subagents || typeof subagents.listDescendants !== 'function') {
        return { ok: true, value: { entries: [], parentAvailable: false } }
      }
      try {
        const rows = await subagents.listDescendants(parentSessionId, new AbortController().signal)
        // 顺手登记「子代理 id → 父会话 id」：面板点开某行看聊天时要用父地址读，
        // 这里记住了就免去反查（每行自带 parentId，本函数的入参就是它）。
        recordSubagentParents(rows)
        return { ok: true, value: { entries: rows, parentAvailable: rows.length > 0 } }
      } catch {
        return { ok: true, value: { entries: [], parentAvailable: false } }
      }
    },
  }
}
