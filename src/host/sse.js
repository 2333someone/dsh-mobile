/**
 * SSE 帧的纯函数部分：事件文本提取、mux 帧序列化、队列项视图。
 * 连接/观察者/follow 等有状态编排仍在 core（RPC 注册表轮再显式化 ctxBag）。
 */
import { randomBytes } from 'node:crypto'
import { MUX_ALWAYS_FORWARDED, STREAM_SEEN_INDEX_MAX, STREAM_SEQ_SLOTS, FOLLOW_ASSISTANT_STREAM, FOLLOW_RETRY_MS, MAX_FOLLOW_RESTARTS } from './config.js'

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
  const lastPersistedSeq = state.lastPersistedSeq
  const follows = state.follows
  const observers = state.observers
  const lastObserved = state.lastObserved
  // emitMux 与本运行时同属 sse.js：直接由同一个 state bag 再取一份，
  // 不额外要求宿主注入（两份都只是 state 上的无状态包装）。
  const { emitMux } = createMuxRuntime({ state })
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

    /**
     * 用「流式状态 + slot」合成一条 `assistant/chunk` 事件（live chunk 与快照补放共用）。
     *
     * `slot` 是桶内序号（1..STREAM_SEQ_SLOTS-1），seq = base + slot/STREAM_SEQ_SLOTS，
     * 因此同一 attempt 内严格递增，且恒小于 base+1（= 下一条已落盘事件）。
     */
    function buildAssistantChunkEvent(sessionId, st, slot, rawTime, chunk) {
      let s = typeof slot === 'number' && Number.isFinite(slot) ? Math.floor(slot) : ++st.seq
      if (!Number.isFinite(s) || s < 1) s = ++st.seq
      if (s > STREAM_SEQ_SLOTS - 1) s = STREAM_SEQ_SLOTS - 1
      const base = Math.max(st.seqBase, lastPersistedSeq.get(sessionId) ?? 0)
      const seq = base + s / STREAM_SEQ_SLOTS
      st.seq = s
      const time = typeof rawTime === 'number' && Number.isFinite(rawTime) ? rawTime : Date.now()
      const data = { chunk: { type: chunk.type, text: chunk.text } }
      // turn/step 优先用 attempt 的 start 帧；没接上 start 时退回最近一条 step/start。
      // 少了它 bundle 无法把逐字增量累加进同一个待定气泡（每个 chunk 会变成一条新消息）。
      const fallback = lastStep.get(sessionId)
      const turn = st.turn !== undefined ? st.turn : fallback?.turn
      const step = st.step !== undefined ? st.step : fallback?.step
      if (turn !== undefined) data.turn = turn
      if (step !== undefined) data.step = step
      return { type: 'assistant/chunk', seq, time, data }
    }

    /**
     * 把 compact 快照流（`AssistantStreamAccumulator.snapshot()` 的 records）展开成
     * 逐 token 的 `{ time, chunk }`。
     *
     * 快照是压缩格式（同一条消息的连续 delta 合并成 `{type:'text-chunks', dt, texts}`），
     * 不能直接喂给 bundle —— `ze()` 只认 `{chunk:{type:'text-delta'|'reasoning-delta',text}}`。
     * 这里按宿主 `expandAssistantStream()` 的同一语义展开；tool-call 片段 bundle 不渲染，跳过。
     */
    function expandSnapshotStream(stream) {
      const out = []
      if (!Array.isArray(stream)) return out
      for (const record of stream) {
        if (!record || typeof record !== 'object') continue
        if (record.type === 'chunk') {
          if (record.chunk && typeof record.chunk === 'object') out.push({ time: record.time, chunk: record.chunk })
          continue
        }
        if (record.type !== 'text-chunks' && record.type !== 'reasoning-chunks') continue
        const texts = Array.isArray(record.texts) ? record.texts : []
        const dt = Array.isArray(record.dt) ? record.dt : []
        let time = typeof record.time0 === 'number' && Number.isFinite(record.time0) ? record.time0 : Date.now()
        for (let i = 0; i < texts.length; i += 1) {
          if (i > 0) time += typeof dt[i - 1] === 'number' && Number.isFinite(dt[i - 1]) ? dt[i - 1] : 0
          out.push({
            time,
            chunk: {
              type: record.type === 'text-chunks' ? 'text-delta' : 'reasoning-delta',
              ...(typeof record.index === 'number' ? { index: record.index } : {}),
              text: texts[i],
            },
          })
        }
      }
      return out
    }

    /**
     * follow 的 snapshot 里带着 `assistantStream.activeAttempt`：**当前正在生成的那一步**
     * 已经产出的全部片段（compact 格式）+ 它的 attemptId / turn / step / startedAfterSeq。
     *
     * 手机在生成中途打开会话时，follow 才刚建立，start 帧早就发过了 —— 不补放这段快照，
     * 手机就永远缺前半段正文（用户看到的「只显示一半」），而且后续 chunk 没有 turn/step，
     * 每个 token 都会新开一条消息。这里把它补成正常的 assistant/chunk 序列。
     *
     * 只在「这个 attempt 还没有 live 帧进来」时补放一次：follow 重连会重发同一个
     * activeAttempt，重放会重复推字（seq 已被水位挡掉一部分，但不能依赖它）。
     */
    function replayAssistantSnapshot(sessionId, snapshot) {
      if (!snapshot || typeof snapshot !== 'object') return
      const attempt = snapshot.activeAttempt
      if (!attempt || typeof attempt !== 'object') return
      const attemptId = typeof attempt.attemptId === 'string' ? attempt.attemptId : undefined
      if (attemptId === undefined) return
      const revision = typeof snapshot.revision === 'number' ? snapshot.revision : undefined
      const st = streamStateFor(sessionId, attemptId, revision)
      if (typeof attempt.turn === 'number') st.turn = attempt.turn
      if (typeof attempt.step === 'number') st.step = attempt.step
      if (typeof attempt.startedAfterSeq === 'number' && Number.isFinite(attempt.startedAfterSeq)) {
        st.seqBase = attempt.startedAfterSeq
      }
      // 已经有 live chunk 进状态了：说明启动顺序不是「snapshot → chunk」，别重放。
      if (st.lastIndex >= 0) return
      const expanded = expandSnapshotStream(attempt.stream)
      let slot = 0
      for (const { time, chunk } of expanded) {
        if (!chunk || typeof chunk !== 'object') continue
        if (chunk.type !== 'text-delta' && chunk.type !== 'reasoning-delta') continue
        if (typeof chunk.text !== 'string' || chunk.text === '') continue
        slot += 1
        emitMux({ type: 'session/event', sessionId, event: buildAssistantChunkEvent(sessionId, st, slot, time, chunk) })
      }
      if (typeof attempt.nextIndex === 'number' && Number.isFinite(attempt.nextIndex)) {
        // 后续 live chunk 的 index 从 nextIndex 起（快照已包含 0..nextIndex-1 的**全部** chunk，
        // 包括我们不渲染的 tool-call 片段），所以增量判重的水位直接对齐到 nextIndex-1。
        st.lastIndex = Math.max(st.lastIndex, attempt.nextIndex - 1)
      }
    }

    /** 还有设备在看这个会话吗。 */
    function anyoneObserving(sessionId) {
      for (const set of observers.values()) {
        if (set.has(sessionId)) return true
      }
      return false
    }

    /**
     * 某会话最后一次「有人在看」的时刻。
     * 用它而不是「当前有没有人在看」做回收判据：手机每次 SSE 重连后要等下一次 observe
     * 重申（最多 30s）才重新出现在 observers 里，这中间它其实还在前台看着。
     */
    function lastObservedAt(sessionId) {
      return lastObserved.get(sessionId) ?? 0
    }

    /**
     * 子代理会话必须走 durable 父地址，否则宿主 validateAddress 会抛 session/agent-busy
     *（本插件已有此经验）。认过父的直接用，没认过父先按普通地址走，撞错再认父重试。
     */
    function addressForSession(sessionId) {
      const parent = host.subagentParent.get(sessionId)
      if (parent !== undefined && parent !== sessionId) {
        return { kind: 'subagent', parentSessionId: parent, childSessionId: sessionId, mode: 'unknown' }
      }
      return { kind: 'session', sessionId }
    }

    /** 起（或复用）某会话的 follow 单例。幂等。 */
    function ensureFollow(sessionId) {
      const existing = follows.get(sessionId)
      if (existing !== undefined) return existing
      const ref = new AbortController()
      const entry = { ref, task: undefined }
      const task = (async () => {
        let restarts = 0
        let triedParentLookup = false
        while (!ref.signal.aborted && restarts <= MAX_FOLLOW_RESTARTS) {
          try {
            const frames = host.follow(
              { address: addressForSession(sessionId), assistantStream: FOLLOW_ASSISTANT_STREAM },
              ref.signal,
            )
            for await (const f of frames) {
              if (ref.signal.aborted) return
              if (!f) continue
              if (f.type === 'snapshot') {
                // 快照里的 records 是已经存在的历史，不重推（聊天窗自己读过历史）。
                // 只告诉手机「从 lastSeq 起之后的事件会实时到达」，bundle 据此刷新缓存。
                if (typeof f.cursor === 'number') {
                  // 合成 chunk 的 seq 基准：订阅那一刻会话的最后一个已落盘 seq。
                  lastPersistedSeq.set(sessionId, f.cursor)
                }
                // 正在生成中的那一步：快照带着已产出的片段，补放给手机，
                // 否则中途进场（手机在桌面生成到一半时打开会话）会永久缺前半段正文。
                replayAssistantSnapshot(sessionId, f.assistantStream)
                if (typeof f.cursor === 'number') {
                  emitMux({ type: 'session/subscribed', sessionId, lastSeq: f.cursor })
                  // bundle 收到 session/subscribed 会把队列缓存和 dock 一起清空
                  //（rememberSubscribed → cachedQueueBySession.delete，chat 监听里 Mt([])）。
                  // 跟随流重启（断线/重连/换会话）都会走这里，所以必须紧接着补一帧当前
                  // 队列，否则「已经在排队的消息」会被这次清空从界面上抹掉，而每流指纹
                  // 又认为早就推过了 —— 要等到队列下次变化才恢复。
                  forgetQueue(sessionId)
                  emitQueue(sessionId)
                }
                continue
              }
              if (f.type === 'event' && f.event) {
                // 真事件把水位往前推：后续 chunk 的 seq 必须落在它之后、
                // 下一条真事件之前（见 STREAM_SEQ_SLOTS）。
                if (typeof f.event.seq === 'number') {
                  const prev = lastPersistedSeq.get(sessionId)
                  if (prev === undefined || f.event.seq > prev) lastPersistedSeq.set(sessionId, f.event.seq)
                }
                // 记下 turn/step 边界：中途接上（没见到 start 帧）时给 chunk 兜底。
                noteStepEvent(sessionId, f.event)
                emitMux({ type: 'session/event', sessionId, event: f.event })
                continue
              }
              // ── 流式增量 → 手机能渲染的 session/event ────────────────────────
              if (f.type === 'assistant-stream' && f.frame) {
                const ev = assistantStreamEvent(sessionId, f.frame)
                if (ev !== undefined) emitMux({ type: 'session/event', sessionId, event: ev })
              }
            }
            if (ref.signal.aborted) return
            // 流自然结束（宿主重载 / 会话消失）：只要还有人在看就退避重试。
            if (!anyoneObserving(sessionId)) return
            restarts += 1
            await new Promise((r) => setTimeout(r, FOLLOW_RETRY_MS))
          } catch (err) {
            if (ref.signal.aborted) return
            // 没认过父的子代理会在这里撞上 session/agent-busy：认父后重试一次。
            if (!triedParentLookup && !host.subagentParent.has(sessionId)) {
              triedParentLookup = true
              try {
                const parent = await host.parentOfSubagent(sessionId, undefined)
                if (parent !== undefined && parent !== sessionId) {
                  host.subagentParent.set(sessionId, parent)
                  continue
                }
              } catch {}
            }
            if (!anyoneObserving(sessionId)) return
            restarts += 1
            await new Promise((r) => setTimeout(r, FOLLOW_RETRY_MS))
          }
        }
      })()
      task.catch(() => {})
      task.then(() => {
        if (follows.get(sessionId) === entry) follows.delete(sessionId)
      })
      entry.task = task
      follows.set(sessionId, entry)
      return entry
    }

    /** 停止某会话的 follow，释放宿主流。 */
    function stopFollow(sessionId) {
      const entry = follows.get(sessionId)
      if (entry === undefined) return
      follows.delete(sessionId)
      if (!anyoneObserving(sessionId)) lastObserved.delete(sessionId)
      // 拆流时把该会话的流式去重状态一并收走，避免重连后拿旧 index 判重误丢新一轮的字。
      for (const [key, st] of [...streamStates]) {
        if (key.startsWith(`${sessionId}\u0000`)) streamStates.delete(st.key)
      }
      try {
        entry.ref.abort()
      } catch {}
    }

  return {
    forgetQueue, streamStateFor, noteStepEvent, assistantStreamEvent, emitQueue,
    replayAssistantSnapshot, anyoneObserving, lastObservedAt, ensureFollow, stopFollow,
  }
}
