/**
 * SSE 帧的纯函数部分：事件文本提取、mux 帧序列化、队列项视图。
 * 连接/观察者/follow 等有状态编排仍在 core（RPC 注册表轮再显式化 ctxBag）。
 */
import { randomBytes } from 'node:crypto'
import { MUX_ALWAYS_FORWARDED, STREAM_SEEN_INDEX_MAX, STREAM_SEQ_SLOTS } from './config.js'

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

/**
 * mux 运行时：帧过滤与扇出（容器来自 state bag）。
 * core 创建一次后解构使用；有状态的 openMux/follow 编排仍留在 core，
 * 等下一步与注册表一起显式化。
 */
export function createMuxRuntime({ state }) {
    // 容器来自 state bag（core 里同一份引用）。之前这里漏了取用，
    // muxVisibleTo/emitMux 会在运行时抛 "observers / muxStreams is not defined"。
    const observers = state.observers
    const muxStreams = state.muxStreams
    function muxVisibleTo(deviceId, frame) {
      // 控制镜像 / 会话列表状态 / 审批 / 提问 / 错误 —— 手机上的全局面
      //（任务条、名单、待处理面板），与 dsh-palm 的 MUX_ALWAYS_FORWARDED 同义。
      if (MUX_ALWAYS_FORWARDED.has(frame.type)) return true
      const sessionId = frame.sessionId
      if (typeof sessionId !== 'string') return true
      const set = observers.get(deviceId)
      return set !== undefined && set.has(sessionId)
    }

    function emitMux(frame, rpcId) {
      const line = muxLineOf(frame, rpcId)
      if (line === undefined) return
      for (const stream of [...muxStreams]) stream.write(line, frame)
    }

  return { muxVisibleTo, emitMux }
}

/**
 * 有状态的 SSE 运行时：队列帧与指纹 + assistant-stream → session/event 的帧翻译。
 * 容器来自 state bag；宿主侧能力（读 inbox 等）由 `host` 注入，没有隐式闭包捕获。
 */
export function createSseRuntime({ state, host = {} }) {
  const muxStreams = state.muxStreams
  const streamStates = state.streamStates
  const lastStep = state.lastStep
    function forgetQueue(sessionId) {
      const sid = String(sessionId || '')
      if (sid === '') return
      for (const stream of muxStreams) {
        if (stream.queueFp instanceof Map) stream.queueFp.delete(sid)
      }
    }

    function streamStateFor(sessionId, attemptId, revision) {
      const key = `${sessionId}\u0000${attemptId ?? ''}`
      let st = streamStates.get(key)
      if (st === undefined || st.attemptId !== attemptId) {
        // 换 attempt：上一套状态整块作废（同时把旧的收走，避免 Map 膨胀）。
        if (st !== undefined) streamStates.delete(key)
        st = {
          key,
          attemptId,
          revision,
          seen: new Set(),
          lastIndex: -1,
          turn: undefined,
          step: undefined,
          seq: 0,
          seqBase: 0,
        }
        streamStates.set(key, st)
        // 兜底上限：异常多的 attemptId 时不让 Map 无界增长。
        if (streamStates.size > 64) {
          for (const k of [...streamStates.keys()].slice(0, streamStates.size - 64)) streamStates.delete(k)
        }
      } else if (typeof revision === 'number') {
        // 同一轮内的后续帧：只把 revision 往前推（它是帧序号，不是身份）。
        st.revision = revision
      }
      return st
    }

    function noteStepEvent(sessionId, event) {
      if (!event || typeof event !== 'object') return
      if (event.type !== 'step/start' && event.type !== 'turn/start') return
      const data = event.data && typeof event.data === 'object' ? event.data : {}
      const turn = typeof data.turn === 'number' ? data.turn : undefined
      const step = typeof data.step === 'number' ? data.step : undefined
      if (turn === undefined) return
      const prev = lastStep.get(sessionId)
      // 只进不退：乱序/重放不会把 turn 拉回去。
      if (prev !== undefined && (prev.turn > turn || (prev.turn === turn && (prev.step ?? -1) > (step ?? -1)))) return
      lastStep.set(sessionId, { turn, ...(step === undefined ? {} : { step }) })
      if (lastStep.size > 256) {
        for (const k of [...lastStep.keys()].slice(0, lastStep.size - 256)) lastStep.delete(k)
      }
    }

    function assistantStreamEvent(sessionId, frame) {
      if (!frame || typeof frame !== 'object') return undefined
      const attemptId = typeof frame.attemptId === 'string' ? frame.attemptId : undefined
      const revision = typeof frame.revision === 'number' ? frame.revision : undefined

      // start：只记 turn/step，供后续 chunk 定位同一个气泡。不推帧。
      if (frame.type === 'start') {
        const st = streamStateFor(sessionId, attemptId, revision)
        if (typeof frame.turn === 'number') st.turn = frame.turn
        if (typeof frame.step === 'number') st.step = frame.step
        // startedAfterSeq = 「这一轮开始时，会话里最后一个已落盘的 seq」。
        // 合成 chunk 的 seq 必须以它为基准，否则 fold() 按 seq 排序时会把正在生成的
        // 气泡排到已有历史消息**前面**去（假 seq 从 0 起会闹这个笑话）。
        if (typeof frame.startedAfterSeq === 'number' && Number.isFinite(frame.startedAfterSeq)) {
          st.seqBase = frame.startedAfterSeq
        }
        return undefined
      }
      // end：收尾，丢弃这一轮的状态。不推帧。
      if (frame.type === 'end') {
        const st = streamStates.get(`${sessionId}\u0000${attemptId ?? ''}`)
        if (st !== undefined) streamStates.delete(st.key)
        return undefined
      }
      if (frame.type !== 'chunk') return undefined

      const st = streamStateFor(sessionId, attemptId, revision)
      // ── 去重：同一个 index 只推一次（重复推会让气泡里的字重复出现）──────────
      if (typeof frame.index === 'number' && Number.isFinite(frame.index)) {
        if (st.seen.has(frame.index)) return undefined
        if (st.seen.size >= STREAM_SEEN_INDEX_MAX) {
          // 触顶：退化成「只接受递增的 index」，不再无界记录。
          if (frame.index <= st.lastIndex) return undefined
        } else {
          st.seen.add(frame.index)
        }
        // ── 顺序：乱序会让气泡里的字错乱，落后的 index 直接丢 ──────────────────
        //（宿主按 index 递增产出；真乱序时丢一个字好过把整段文字打乱）
        if (frame.index < st.lastIndex) return undefined
        st.lastIndex = frame.index
      }

      // bundle 的 `ze()` 归一化器只认 chunk.type ∈ {'text-delta','reasoning-delta'}，
      // 且 text 是非空字符串；其余（如 tool-call-delta）它直接返回 null → 不渲染。
      const chunk = frame.chunk
      if (!chunk || typeof chunk !== 'object') return undefined
      if (chunk.type !== 'text-delta' && chunk.type !== 'reasoning-delta') return undefined
      if (typeof chunk.text !== 'string' || chunk.text === '') return undefined

      // 合成 assistant/chunk 事件。seq 必须落在 (lastPersisted, lastPersisted+1)
      // 这个**开区间**里 —— 见 STREAM_SEQ_SLOTS 的注释：用整数（旧实现 startedAfterSeq+index+1）
      // 会把手机端的 maxSeq 顶到真事件之后，随后落盘的 assistant/message、tool/call、
      // step/end、turn/end 全部被 bundle 的 fold() 当「旧事件」丢掉，手机只剩半截流式文本。
      // 基准取「已经流过去的真事件里最大的 seq」而不是只取 startedAfterSeq：宿主一轮里
      // 会连续落盘多条事件，每落一条水位就抬一次，chunk 必须跟着抬，否则会被判旧。
      let slot = typeof frame.index === 'number' && Number.isFinite(frame.index) ? frame.index + 1 : ++st.seq
      return buildAssistantChunkEvent(sessionId, st, slot, frame.time, chunk)
    }

    /**
     * 读某会话当前的排队项，推一帧 session/queue。
     * 数据源由宿主注入：`host.getQueueItems(sessionId)` 返回 `[{ message, placement }]`
     *（宿主侧取自 agent.inbox：nextTurn = 等当前轮结束的排队，nextStep = 插队的）。
     * 失败一律静默：队列显示是增强，不能因为读不到就把 SSE 流搞坏。
     */
    function emitQueue(sessionId) {
      const sid = String(sessionId || '')
      if (sid === '') return
      let items
      try {
        const rows = host.getQueueItems(sid)
        items = []
        for (const row of Array.isArray(rows) ? rows : []) {
          const view = queueItemView(row && row.message, row && row.placement)
          if (view) items.push(view)
        }
      } catch {
        return
      }
      const fingerprint = JSON.stringify(items)
      // 指纹必须按「每条 SSE 流」各记一份，不能是按会话一份：
      //   · 手机锁屏/切后台/隧道抖动时流会断，这期间 emitQueue 推的帧没人收；
      //   · 一条流只可能收到「它连上之后」的帧。若指纹是会话级的，重连时新流看到的
      //     指纹已经是最新的，于是**永远不再补发**——dock 就停在断流前的条数上
      //     （实测：宿主 inbox 7 条，界面停在「5 条排队」，等 30s 也不动）。
      // 每流一份之后，新流的表是空的，一进场就会收到当前完整队列。
      const line = muxLineOf({ type: 'session/queue', sessionId: sid, items })
      if (line === undefined) return
      for (const stream of [...muxStreams]) {
        if (stream.closed) continue
        if (!(stream.queueFp instanceof Map)) continue
        if (stream.queueFp.get(sid) === fingerprint) continue
        stream.queueFp.set(sid, fingerprint)
        stream.write(line, { type: 'session/queue', sessionId: sid, items })
      }
    }

  return { forgetQueue, streamStateFor, noteStepEvent, assistantStreamEvent, emitQueue }
}
