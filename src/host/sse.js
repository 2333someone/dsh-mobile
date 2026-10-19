/**
 * SSE 帧的纯函数部分：事件文本提取、mux 帧序列化、队列项视图。
 * 连接/观察者/follow 等有状态编排仍在 core（RPC 注册表轮再显式化 ctxBag）。
 */
import { randomBytes } from 'node:crypto'

export function textOfEventData(data) {
if (!data || typeof data !== 'object') return ''
const msg = 'message' in data ? data.message : data
if (!msg || !Array.isArray(msg.content)) return ''
return msg.content
    .filter((b) => b && b.type === 'text')
    .map((b) => String(b.text || ''))
    .join('')
}

export function muxLineOf(frame, rpcId) {
    try {
      const wire = {
        type: 'server-request',
        rpcId: rpcId || `mux-${randomBytes(8).toString('hex')}`,
        method: 'events.mux',
        payload: frame,
      }
      return `data: ${JSON.stringify(wire)}\n\n`
    } catch {
      return undefined // 不可序列化的帧宁可不推，也不能拖垮整条流
    }
}

export function queueItemView(message, placement) {
    if (!message || typeof message !== 'object') return undefined
    const id = typeof message.id === 'string' ? message.id : (message.id === undefined ? '' : String(message.id))
    if (id === '') return undefined
    // content 两种形态都要兜住：数组（常规）与字符串（历史上的简化形态）。
    const raw = Array.isArray(message.content)
      ? message.content
      : typeof message.content === 'string' ? [{ type: 'text', text: message.content }] : []
    const content = []
    for (const b of raw) {
      if (!b || typeof b !== 'object') continue
      if (typeof b.text === 'string') {
        content.push({ type: 'text', text: b.text })
        continue
      }
      // 非文本块（图片等）原样保留：bundle 的 le() 会把它们渲染成 `[类型]`
      // 并把 editable 判为 false（dock 就不给编辑框）—— 比丢掉或伪造 text 诚实。
      content.push({ type: typeof b.type === 'string' ? b.type : 'text' })
    }
    return { id, placement, message: { content } }
}
