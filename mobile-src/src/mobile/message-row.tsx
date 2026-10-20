/**
 * MessageRow: one rendered message row — the assistant/user/command card
 * with its reasoning disclosure, tool disclosure, markdown body, diff
 * artifacts, fail tag and footer (time).
 *
 * Memoized: live streaming updates exactly one message object per frame, so
 * unchanged rows skip re-rendering their markdown/sub-components.
 * @module dsh-palm/mobile/message-row
 */

import { Fragment, memo, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode, type Ref } from 'react'
import { formatTime } from './views/App.tsx'
import type { MessageImage, RenderMessage, ToolCallInfo, ToolDiffView } from './messages.ts'
import { triggerTitleOf } from './messages.ts'

/**
 * 两种卡片头左侧图形的**唯一来源**（「收到任务消息」卡 / 过程卡）。
 *
 * 以前这里用的是两枚系统 emoji（📨 / ⏳💭），字形来自 emoji 字体：粗细、基线、
 * 颜色都跟聊天页其它图标对不上（用户原话「风格 图标位置」）。现在统一成同一套
 * 描边规格：24 视框 / 18px 渲染 / stroke 1.75 / 圆头圆角 / currentColor（颜色由
 * CSS 的 token 给）。形状本身保持原有的语义（信封 = 收到消息，云朵 = 思考）。
 */
function CardGlyph({ shape }: { readonly shape: 'inbox' | 'thinking' }) {
  return (
    <svg
      className="chat-card-glyph"
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {shape === 'inbox' ? (
        <>
          <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
          <path d="M4.2 7.4 12 12.9l7.8-5.5" />
        </>
      ) : (
        <path d="M7.2 18.5h9.6a4.15 4.15 0 0 0 .42-8.28A5.6 5.6 0 0 0 6.5 9.1a4.75 4.75 0 0 0 .7 9.4Z" />
      )}
    </svg>
  )
}
import { cachedAttachmentUrl, loadAttachmentUrl } from './attachment-images.ts'
import { CollapsibleText, MarkdownText } from './markdown-text.tsx'
import { diffTallyOf, formatDuration, isRowRunning, processErrorsText, processFilesText, processHeadText, processModel, processStateText, processStepsText, processTimeText, toolDiffLines, visibleRowCount, type ProcessModel, type ProcessOutcome, type ProcessReasoningRow } from './process-rows.ts'
import { stepModel, type StepVariant } from './step-view.ts'

/**
 * 用户消息里的「已上传文件」块：发送时我们把工作区路径写进 prompt（见 ChatView.send），
 * 回显出来的 user/message 是一段纯文本。这里把那段拎出来渲染成可点的文件胶囊，
 * 正文只保留用户自己写的话 —— 否则一串 `.dsh-uploads/…` 只能看着，没法预览/下载。
 */
const UPLOAD_BLOCK_RE = /\n*已上传文件（可直接用文件工具读取）：\n((?:- [^\n]+\n?)+)/

function splitUploadedFiles(text: string): { body: string; files: string[] } {
  const match = UPLOAD_BLOCK_RE.exec(text)
  if (match === null) return { body: text, files: [] }
  const files = match[1]!
    .split('\n')
    .map(line => line.replace(/^-\s*/, '').trim())
    .filter(line => line !== '')
  return { body: text.replace(UPLOAD_BLOCK_RE, '').trimEnd(), files }
}

function fileNameOf(path: string): string {
  const parts = path.split(/[\/]/).filter(part => part !== '')
  const last = parts[parts.length - 1] ?? path
  // 上传时加了 `<时间戳>-` 前缀，展示时去掉，回到用户选的原文件名。
  return last.replace(/^\d{10,}-/, '')
}

export const MessageRow = memo(function MessageRow({ message, sessionId, showToolCalls, showSystemMessages, showTime = true, focused = false, focusedQuery, style, onRegenerate, onOpenFile, clockOffsetMs, liveTurnStartAt, liveTurn }: {
  message: RenderMessage
  /**
   * 会话 id：图片字节按会话授权读取（见 attachment-images.ts）。每个真实调用点
   * （ChatView）都传；缺省时带图片的消息只显示文本——测试里折叠图片需显式传。
   */
  sessionId?: string
  /** 点开交付物/产出文件时的回调（ChatView 传入，打开文件预览面板）。 */
  onOpenFile?: (path: string) => void
  showToolCalls: boolean
  showSystemMessages: boolean
  /** Timestamp de-dup: hidden when a later row shares this row's minute. */
  showTime?: boolean
  /** Search-hit locate highlight (one-shot CSS animation). */
  focused?: boolean
  focusedQuery?: string
  /** Optional inline style on the row's root element (e.g. content-visibility). */
  style?: CSSProperties
  /**
   * 页级回合锚点（ChatView 从 turn/start、历史尾页或 reconcile 探针恢复的那一个）。
   * 行内秒表拿不到自己的 turnStartAt 时改用它，否则中途重载会从头开始数。
   */
  liveTurnStartAt?: number
  /**
   * 当前活跃轮次的轮号（ChatView 从宿主 turn/start..turn/end 推出来的那一个）。
   * 宿主按步发 assistant/message，一行会在回合中途就被定格（pending 已落、工具
   * 也全返回了），只靠行内字段它会被当成"已结束"；这一行的 turn 等于活跃轮次时
   * 它才是运行中（见 process-rows.ts 的 isRowRunning）。
   */
  liveTurn?: number
  /**
   * Host clock minus local clock (ms), for the running process head's timer.
   * A plain number: it changes only when a frame re-calibrates the skew, so
   * memoized rows are not re-rendered once per second.
   */
  clockOffsetMs?: number
  /** Regenerate affordance: shown on the last settled assistant reply. */
  onRegenerate?: () => void
}) {
  const focusSeqAttr = message.startSeq ?? message.seq
  // 宿主唤醒消息（子代理/任务/定时/团队/外部事件…）在手机端也出卡，与桌面端
  // ui-chat 的 TurnTriggerNodeView 对齐：标题按 source.kind 取（文案与桌面端 locale
  // 的 message.trigger.* 一致），卡面只有标题与时间，正文点开才看 —— 默认折叠，
  // 保持输出界面干净。其余注入行（压缩检查点/指令/skill 目录/运行时上下文）照旧不渲染。
  if (message.kind === 'user'
    && message.sourceKind !== undefined
    && message.sourceKind !== 'user') {
    // 标题表是唯一真源（messages.ts 的 triggerTitleOf）：与"是否透明"共用同一张 kind 表，
    // 不会再出现"这个来源出卡、那个来源却被折掉"的两份清单漂移。
    const triggerTitle = triggerTitleOf(message.sourceKind)
    if (triggerTitle !== undefined) {
      const pad = (value: number): string => String(value).padStart(2, '0')
      const at = new Date(message.time)
      const clock = `${pad(at.getHours())}:${pad(at.getMinutes())}`
      return (
        <details
          data-mid={message.id}
          data-message-id={message.id}
          data-row-seq={focusSeqAttr}
          className={'chat-trigger' + (focused ? ' chat-msg-focus' : '')}
          style={style}
        >
          <summary className="chat-trigger-head">
            <span className="chat-trigger-icon" aria-hidden><CardGlyph shape="inbox" /></span>
            <span className="chat-trigger-title">{triggerTitle}</span>
            {showTime && <span className="chat-trigger-time">{clock}</span>}
            <span className="chat-trigger-caret" aria-hidden>▾</span>
          </summary>
          <div className="chat-trigger-body">
            <p className="chat-trigger-note">这条通知触发了本轮回复。</p>
            {message.text.trim() !== '' && <div className="chat-trigger-text">{message.text}</div>}
          </div>
        </details>
      )
    }
    if (!showSystemMessages) return null
  }
  // Command cards render before the empty-text guard: a running card has no
  // result text yet but must stay visible (it is the in-stream feedback).
  if (message.kind === 'command') {
    return (
      <div
        data-mid={message.id}
        data-message-id={message.id}
        data-row-seq={focusSeqAttr}
        className={'chat-command' + (message.commandPhase === 'error' ? ' chat-command-error' : '') + (focused ? ' chat-msg-focus' : '')}
        style={style}
        role="status"
      >
        <span className="chat-command-name">{message.commandLine ?? '命令'}</span>
        <span className="chat-command-result">
          {message.commandPhase === 'running' ? '执行中…' : message.text}
        </span>
      </div>
    )
  }
  // Turn tail (the desktop's `turn-tail` node): what the turn cost and what it
  // handed back — on the phone, a report card under the turn it closes. Every
  // entry is tappable and opens the file preview (text/image inline).
  if (message.kind === 'turn') {
    // 计时已经在过程组折叠头里（本轮用了 X），这里只报"交回了什么"：
    // 没有交付物也没有产出文件时不弹卡片，免得每次回复尾巴都挂个空壳。
    const reportCount = (message.deliverables?.length ?? 0) + (message.produced?.length ?? 0)
    if (reportCount === 0) return null
    return (
      <div
        data-mid={message.id}
        data-message-id={message.id}
        data-row-seq={focusSeqAttr}
        className="chat-turn-tail"
        style={style}
      >
        <div className="chat-turn-tail-head">
          <span className="chat-turn-tail-title">本轮产出</span>
          <span className="chat-turn-tail-count">{reportCount} 个文件</span>
        </div>
        {message.deliverables !== undefined && message.deliverables.length > 0 && (
          <div className="chat-turn-tail-section">
            <span className="chat-turn-tail-label">交付物</span>
            {message.deliverables.map(file => (
              <button
                type="button"
                key={file.path}
                className="chat-turn-tail-file"
                onClick={() => { onOpenFile?.(file.path) }}
              >
                <span className="chat-turn-tail-file-name">
                  {file.description ?? baseName(file.path)}
                  <span className="chat-turn-tail-badge">已交付</span>
                </span>
                <span className="chat-turn-tail-file-path">{file.path}</span>
              </button>
            ))}
          </div>
        )}
        {message.produced !== undefined && message.produced.length > 0 && (
          <div className="chat-turn-tail-section">
            <span className="chat-turn-tail-label">本轮产出文件</span>
            {message.produced.map(path => (
              <button
                type="button"
                key={path}
                className="chat-turn-tail-file"
                onClick={() => { onOpenFile?.(path) }}
              >
                <span className="chat-turn-tail-file-path">{path}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
  const uploaded = message.kind === 'user' ? splitUploadedFiles(message.text) : { body: message.text, files: [] }
  const hasReasoning = message.kind === 'assistant' && message.reasoning !== undefined && message.reasoning !== ''
  const hasTools = showToolCalls && message.kind === 'assistant' && message.tools !== undefined && message.tools.length > 0
  const hasText = message.text !== ''
  const hasFailTag = message.failed === true
  // 图片：纯图片消息文本为空，若不算进"有内容"这一关，整行会被下面的空行守卫丢掉。
  const images = sessionId !== undefined && message.images !== undefined && message.images.length > 0
    ? message.images
    : undefined
  const hasImages = images !== undefined
  // Flow rows with at least one non-empty text run carry visible content even
  // when `text` is empty (tool-interleaved turns put their payload in flow).
  const hasFlowText = message.flow !== undefined
    && message.flow.some(part => part.kind === 'text' && part.text !== '')
  if (!hasReasoning && !hasTools && !hasText && !hasFailTag && !hasFlowText && !hasImages) {
    return null
  }
  return (
    <div
      data-mid={message.id}
      data-message-id={message.id}
      data-row-seq={focusSeqAttr}
      className={`chat-msg chat-msg-${message.kind}${message.pending === true ? ' chat-msg-pending' : ''}${message.failed === true ? ' chat-msg-failed' : ''}${focused ? ' chat-msg-focus' : ''}`}
      style={style}
    >
      {message.kind === 'assistant' ? (
        <AssistantBody message={message} showToolCalls={showToolCalls} forceOpen={focused} focusedQuery={focused ? focusedQuery : undefined} sessionId={sessionId} clockOffsetMs={clockOffsetMs} liveTurnStartAt={liveTurnStartAt} liveTurn={liveTurn} />
      ) : (
        <>
          {uploaded.files.length === 0 ? (
            <CollapsibleText text={message.text} forceOpen={focused} highlightQuery={focused ? focusedQuery : undefined} />
          ) : (
            <>
              {uploaded.body !== '' && (
                <CollapsibleText text={uploaded.body} forceOpen={focused} highlightQuery={focused ? focusedQuery : undefined} />
              )}
              <div className="chat-msg-files" role="list" aria-label="已上传文件">
                {uploaded.files.map((file, index) => (
                  <a
                    key={`${file}-${String(index)}`}
                    className="chat-msg-file file-link"
                    data-path={file}
                    role="listitem"
                    href="#"
                    onClick={(event) => { event.preventDefault() }}
                  >
                    <span className="chat-msg-file-name">{fileNameOf(file)}</span>
                    <span className="chat-msg-file-hint">查看 / 下载</span>
                  </a>
                ))}
              </div>
            </>
          )}
          {images !== undefined && sessionId !== undefined && (
            <MessageImages sessionId={sessionId} images={images} />
          )}
        </>
      )}
      {message.failed === true && <span className="chat-msg-failtag">本次回复失败</span>}
      {message.maxTokens === true && <div className="chat-msg-maxtokens">已达到输出 token 上限，回答被截断。发送“继续”可让模型接着输出。</div>}
      <span className="chat-msg-footer">
        {showTime && <span className="chat-msg-time">{formatTime(message.time)}</span>}
        {message.kind === 'assistant' && onRegenerate !== undefined && (
          <button type="button" className="chat-msg-regenerate" onClick={onRegenerate} aria-label="重新生成回复">
            <span className="chat-msg-regenerate-icon" aria-hidden>↻</span>
            重新生成
          </button>
        )}
      </span>
    </div>
  )
})

/**
 * 一条消息里的图片组。
 *
 * 事件里只有引用，字节挂载时按需取（内容寻址缓存，重挂不再请求）。取字节失败
 * 只影响这一张图：显示可点重试的占位，而不是让整行消失。
 */
function MessageImages({ sessionId, images }: { sessionId: string; images: readonly MessageImage[] }) {
  return (
    <div className="chat-msg-images" role="list" aria-label="消息图片">
      {images.map(image => <MessageImageTile key={image.attachmentId} sessionId={sessionId} image={image} />)}
    </div>
  )
}

/** 单张图片：占位 → data URL；点一下由 ChatView 的滚动点击处理开全屏。 */
function MessageImageTile({ sessionId, image }: { sessionId: string; image: MessageImage }) {
  const [url, setUrl] = useState<string | undefined>(() => cachedAttachmentUrl(image.attachmentId))
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const label = image.name !== undefined && image.name !== '' ? image.name : '图片'

  useEffect(() => {
    if (url !== undefined) return
    let cancelled = false
    void loadAttachmentUrl(sessionId, image.attachmentId).then((loaded) => {
      if (cancelled) return
      if (loaded === undefined) setFailed(true)
      else {
        setFailed(false)
        setUrl(loaded)
      }
    })
    return () => { cancelled = true }
  }, [sessionId, image.attachmentId, url, attempt])

  if (url === undefined) {
    return (
      <button
        type="button"
        role="listitem"
        className={`chat-msg-image chat-msg-image-placeholder${failed ? ' chat-msg-image-failed' : ''}`}
        aria-label={failed ? `${label}，加载失败，点击重试` : `${label}，加载中`}
        onClick={() => {
          if (!failed) return
          setFailed(false)
          setAttempt(value => value + 1)
        }}
      >
        {failed ? '图片加载失败，点击重试' : '图片加载中…'}
      </button>
    )
  }
  return (
    <img
      className="chat-msg-image"
      role="listitem"
      src={url}
      alt={label}
      loading="lazy"
      {...(image.width > 0 ? { width: image.width } : {})}
      {...(image.height > 0 ? { height: image.height } : {})}
    />
  )
}

/**
 * Per-step body of a coalesced turn: each folded step renders as its own
 * anchored block (`data-step-seq`) so a search-hit locate can scroll to the
 * exact step. The streaming tail (the pending current step, whose text is the
 * part of `message.text` beyond the joined finalized steps) renders as a
 * final pending block — keeping the same per-step DOM for pending and settled
 * so the turn never re-lays.
 */
/**
 * 一轮的"过程组"（桌面端 turn-process 的对应物）：思考与工具调用混排在同一棵
 * 子树里，默认折叠成一行 —— 头里只有这一轮花了多久、走了几步、改了多少行，
 * 答案和报告卡留在组外，回复永远不被步骤淹掉。
 *
 * 行不编号（用户拍板乙）：层级只靠缩进和行首字形区分。
 * 没有可展开的行时头是静态的（纯文本回复也照样显示用时），与桌面端一致。
 */
/**
 * 1Hz 的行内时钟：只在"运行中"挂定时器，而且时钟状态长在这一行里。
 * 不能把秒数做成从 ChatView 传下来的 prop —— 那个数字每秒都变，
 * 会把整份列表所有行一起重渲染（每行都 memo 也挡不住新值）。
 */
function useLiveClock(active: boolean): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    setNow(Date.now())
    const id = setInterval(() => { setNow(Date.now()) }, 1_000)
    return () => { clearInterval(id) }
  }, [active])
  return now
}

/**
 * 折叠过程卡标题行的思考跑马灯：数据是当前 turn 最新一段 reasoning 的尾部。
 *
 * 速度模型（用户要求「文字滚多快跟着真实思考速度走，dsh 就是这样」）：
 *   · 每 500ms 采样一次 reasoning 的**全量**长度（用 growth，不是截断后的显示文本），
 *     取最近 1.5s 的滑动窗口算「字符/秒」产出速率；
 *   · 目标速率 = clamp(cps / 30, 0.06, 2.5)：基准 30 字/秒 = 1 倍速（60px/s），
 *     产出快就滚得快；思考暂停（cps=0）时降到 0.06 倍（接近停住），不再匀速空滚；
 *   · 动画用 Web Animations API（百分比关键帧，文本变长也不用重建），调速只改
 *     playbackRate —— 不会重置 currentTime，位移天然连续；每 500ms 向目标插值 35%，
 *     避免速度抖动；
 *   · prefers-reduced-motion 下不创建动画（CSS 静态截断 + 隐藏第二段）。
 */
const MARQUEE_BASE_CPS = 30
const MARQUEE_MIN_RATE = 0.06
const MARQUEE_MAX_RATE = 2.5
const MARQUEE_PX_PER_SEC = 60

function ThinkMarquee({ text, growth }: { readonly text: string; readonly growth: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const trackRef = useRef<HTMLSpanElement>(null)
  const animRef = useRef<Animation | null>(null)
  const rateRef = useRef(0.25)
  const growthRef = useRef(growth)
  const [overflow, setOverflow] = useState(false)

  // 溢出才滚：ResizeObserver 量容器与内容；短文本保持静态省略号。
  useEffect(() => {
    const el = ref.current
    if (el === null) return undefined
    const measure = (): void => { setOverflow(el.scrollWidth > el.clientWidth + 1) }
    measure()
    if (typeof ResizeObserver === 'undefined') return undefined
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => { ro.disconnect() }
  }, [text])

  // 一条常驻的无限循环动画。只用百分比关键帧（-50% - 16px），文本增长不重建动画，
  // 所以改速度时 currentTime 与 transform 都不跳。
  useEffect(() => {
    const track = trackRef.current
    if (!overflow || track === null || typeof track.animate !== 'function') return undefined
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const run = track.firstElementChild
    const runW = run === null ? 0 : run.getBoundingClientRect().width
    const duration = Math.max(4000, ((runW + 32) / MARQUEE_PX_PER_SEC) * 1000)
    let anim: Animation
    try {
      anim = track.animate(
        [{ transform: 'translateX(0%)' }, { transform: 'translateX(calc(-50% - 16px))' }],
        { duration, iterations: Infinity, easing: 'linear' },
      )
    } catch (error) {
      return undefined
    }
    anim.playbackRate = rateRef.current
    animRef.current = anim
    return () => {
      if (animRef.current === anim) animRef.current = null
      anim.cancel()
    }
  }, [overflow])

  // 最新 reasoning 长度每个渲染都写进 ref：采样 effect 只挂一次（如果把它挂到
  // growth 上，流式时每个 chunk 都会清掉重挂 500ms 定时器，速率就永远采不到）。
  growthRef.current = growth

  // 产出速率采样 → 目标播放速率（插值后写回动画）。
  useEffect(() => {
    let last = growthRef.current
    const samples: Array<{ t: number; v: number }> = []
    const id = window.setInterval(() => {
      const now = performance.now()
      const value = growthRef.current
      if (value < last) { samples.length = 0 }       // 换了一段 reasoning：窗口重置
      last = value
      samples.push({ t: now, v: value })
      while (samples.length > 4) samples.shift()      // 4 × 500ms = 1.5s 窗口
      const first = samples[0]
      const seconds = (now - first.t) / 1000
      const cps = seconds > 0.3 ? Math.max(0, (value - first.v) / seconds) : 0
      const target = Math.min(MARQUEE_MAX_RATE, Math.max(MARQUEE_MIN_RATE, cps / MARQUEE_BASE_CPS))
      rateRef.current += (target - rateRef.current) * 0.35
      const anim = animRef.current
      if (anim !== null) anim.playbackRate = rateRef.current
      try {
        const tr = trackRef.current
        if (tr !== null) tr.dataset.dmMarquee = JSON.stringify({ cps: +cps.toFixed(1), target: +target.toFixed(2), rate: +rateRef.current.toFixed(2), samples: samples.length, growth: growthRef.current })
      } catch (error) {}
    }, 500)
    return () => { window.clearInterval(id) }
  }, [])

  return (
    <span ref={ref} className={'chat-proc-think' + (overflow ? ' chat-proc-think-scroll' : '')} title={text}>
      <span ref={trackRef} className="chat-proc-think-track">
        <span className="chat-proc-think-run">{text}</span>
        {overflow && <span className="chat-proc-think-run" aria-hidden>{text}</span>}
      </span>
    </span>
  )
}

function ProcessGroup({ message, model, showToolCalls, focusedQuery, sessionId, clockOffsetMs, liveTurnStartAt, liveTurn }: {
  message: RenderMessage
  model: ProcessModel
  showToolCalls: boolean
  focusedQuery?: string
  sessionId?: string
  clockOffsetMs?: number
  liveTurnStartAt?: number
  liveTurn?: number
}) {
  const [open, setOpen] = useState(false)
  // 与 processOutcome / currentStepOf 共用同一个"还在跑"判据：只认 pending 会让
  // 运行中的卡片读成"已完成"，秒表也会消失；按步定格的行只有活跃轮次能救它。
  const running = isRowRunning(message, liveTurn)
  // 折叠头跑马灯的文本：当前 turn 最新一段 reasoning 的尾部（≤200 字）。数据就在
  // 过程行里（reasoning 段已折叠进 model.rows），不需要新的数据通道；没有 reasoning
  // 时为空串，标题行回退到原来的动作名，绝不留空。
  const liveThinking = useMemo(() => {
    for (let i = model.rows.length - 1; i >= 0; i--) {
      const row = model.rows[i]
      if (row.kind !== 'reasoning') continue
      const flat = row.text.replace(/\s+/gu, ' ').trim()
      if (flat !== '') return flat.slice(-200)
    }
    return ''
  }, [model.rows])
  // 产出速率用「全量 reasoning 长度」算（显示的是尾部 200 字，长度会提前封顶，
  // 用它测速会在 200 字后误判成"思考暂停"）。
  const liveThinkingGrowth = useMemo(() => {
    for (let i = model.rows.length - 1; i >= 0; i--) {
      const row = model.rows[i]
      if (row.kind === 'reasoning') return row.text.length
    }
    return 0
  }, [model.rows])
  // turn 结束后保留最后一次文本（不闪回「思考中」）：只在观察到运行中时冻结。
  const [frozenThinking, setFrozenThinking] = useState('')
  useEffect(() => {
    if (running && liveThinking !== '') setFrozenThinking(liveThinking)
  }, [running, liveThinking])
  const thinkingText = running ? liveThinking : frozenThinking
  // 秒表走宿主时间：偏移量来自 frameEvent.time 与本地时间的差，
  // 否则手机 NTP 与宿主差几秒，秒表就和桌面端对不上。
  const now = useLiveClock(running)
  // 锚点只认**宿主时间**：行上的 turnStartAt（turn/end 盖的）与页级 liveTurnStartAt
  // （ChatView 从宿主帧推出来的）。原先兜底用的 firstSeenAt 是"手机第一次看到这一行"的
  // 本地时间 —— 中途打开页面、或回合在手机连上之前就开始时，它比宿主真正的回合开始晚
  // 一大截，真机表现就是"手机读数比桌面端偏小"。拿不到宿主锚点就干脆不报秒表（宁缺勿错）。
  const clockAnchor = message.turnStartAt ?? liveTurnStartAt
  const targetElapsed = running && clockAnchor !== undefined
    ? Math.max(0, now + (clockOffsetMs ?? 0) - clockAnchor)
    : undefined
  // 显示值**只增不减**：宿主偏移每帧都可能被重新校准，偏移的微抖会让秒数来回跳
  // （真机"一直在闪"：3 秒 → 2 秒 → 3 秒）。校准造成的**向上升**照旧立刻生效
  // （未校准 → 校准 +3 秒，必须变成 1分3秒），只挡住"往回跳"这一种。
  // 锚点换了（新一轮）就重新起算。
  const elapsedRef = useRef<{ anchor: number | undefined; elapsed: number }>({ anchor: undefined, elapsed: 0 })
  if (elapsedRef.current.anchor !== clockAnchor) elapsedRef.current = { anchor: clockAnchor, elapsed: 0 }
  if (targetElapsed !== undefined && targetElapsed > elapsedRef.current.elapsed) {
    elapsedRef.current = { anchor: clockAnchor, elapsed: targetElapsed }
  }
  const liveElapsedMs = running && clockAnchor !== undefined ? elapsedRef.current.elapsed : undefined
  // 结束时间以 turn/end 盖上的 durationMs 为准；窗口没收到 turn/end 时退回
  // turn/start 与最后一次触碰的时间差（中断的回合也能给出可信的耗时）。
  const durationMs = message.durationMs
    ?? (message.turnStartAt !== undefined ? Math.max(0, message.time - message.turnStartAt) : undefined)
  const outcome: ProcessOutcome = running ? 'running' : (model.outcome === 'running' ? 'ok' : model.outcome)
  const head = processHeadText(model, {
    running,
    durationMs,
    ...(liveElapsedMs !== undefined ? { liveElapsedMs } : {}),
  })
  const stateText = processStateText(outcome)
  const timeText = processTimeText(outcome, {
    durationMs,
    ...(liveElapsedMs !== undefined ? { liveElapsedMs } : {}),
  })
  const current = model.current
  // 报错信号：只在这轮真有条目报错的工具步骤时才出现，比状态词弱一档（第三档灰、
  // 更小一号），没有就什么也不留（不留空占位）。stopped（中断）不算报错。
  const errorsText = processErrorsText(model)
  const headLabel = errorsText === '' ? head : `${head}，${errorsText}`
  // 灰阶里不出现红绿数字：改动量写成一句人话，放第二行右侧；本回合确定没改动任何
  // 文件时也明说（只有回合结束后才敢下这个结论，运行中返回空串）。
  const filesText = processFilesText(model, !running)
  // 步数移出卡面：展开体首行才报「共 N 步」（关掉"显示工具调用"时不声称步数）。
  const stepsText = processStepsText(model, showToolCalls)
  const visibleRows = visibleRowCount(model, showToolCalls)
  // 行首符号（系统 emoji，动作由 CSS 给，结算后动画自动停止）：
  // 运行中给云朵 SVG（与「收到任务消息」卡同一套描边规格：18px / 1.75 / 圆头）；
  // 结束后**按结果**给符号：成功 ✅ / 失败 ❌ / 中断 ⏹️。此前一律显示 ✓，
  // 失败与中断也挂个对勾，属于误导。
  const leadIcon = model.outcome === 'failed' ? '❌' : model.outcome === 'stopped' ? '⏹️' : '✅'
  const lead = (
    <span className={`chat-proc-lead${running ? ' chat-proc-lead-running' : ''}`} aria-hidden>
      {running ? <CardGlyph shape="thinking" /> : leadIcon}
    </span>
  )
  if (visibleRows === 0) {
    return (
      <div className="chat-proc" data-proc-rows="0">
        <div className="chat-proc-head chat-proc-head-static" role="status" aria-label={headLabel}>
          <span className="chat-proc-line chat-proc-label">
            {lead}
            <span className="chat-proc-state">{stateText}</span>
            {errorsText !== '' && <span className="chat-proc-errors">{errorsText}</span>}
            {timeText !== '' && <span className="chat-proc-time">{timeText}</span>}
          </span>
          {current !== undefined && (
            <span className="chat-proc-line chat-proc-current">
              <span className="chat-proc-current-text">{current.text}</span>
            </span>
          )}
        </div>
      </div>
    )
  }
  return (
    <div className={`chat-proc${open ? ' chat-proc-open' : ''}${running ? ' chat-proc-running' : ''}`} data-proc-rows={visibleRows}>
      <button
        type="button"
        className="chat-proc-head"
        aria-expanded={open}
        onClick={() => { setOpen(value => !value) }}
      >
        <span className="chat-proc-line chat-proc-label">
          {lead}
          <span className="chat-proc-state">{stateText}</span>
          {errorsText !== '' && <span className="chat-proc-errors">{errorsText}</span>}
          {timeText !== '' && <span className="chat-proc-time">{timeText}</span>}
        </span>
        {current !== undefined && (
          <span className="chat-proc-line chat-proc-current">
            {/* 非工具步骤（思考中 / 正在回答）也给行首符号：💭 + 轻微呼吸。
                此前只有工具族才渲染，折叠卡第二行因此比展开后的每一行都少一个符号。
                运行命令时齿轮加转：只有在跑的那一步才转，结算后必须停。 */}
            <span className={`chat-step-icon${current.variant === undefined ? ' chat-step-icon-thinking' : ''}${running && current.variant === 'bash' ? ' chat-step-icon-spin' : ''}`} aria-hidden>
              {current.variant === undefined ? <CardGlyph shape="thinking" /> : stepIcon(current.variant)}
            </span>
            {thinkingText !== '' ? <ThinkMarquee text={thinkingText} growth={liveThinkingGrowth} /> : <span className="chat-proc-current-text">{current.text}</span>}
            {filesText !== '' && <span className="chat-proc-meta">{filesText}</span>}
          </span>
        )}
        <span className="chat-proc-caret" aria-hidden>{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="chat-proc-body">
          {stepsText !== '' && <div className="chat-proc-steps">{stepsText}</div>}
          <ProcessRows message={message} model={model} showToolCalls={showToolCalls} focusedQuery={focusedQuery} sessionId={sessionId} />
        </div>
      )}
    </div>
  )
}

/** 展开体：思考块、工具行、步骤之间的叙述文本、diff 卡，全按事件顺序排。 */
function ProcessRows({ message, model, showToolCalls, focusedQuery, sessionId }: {
  message: RenderMessage
  model: ProcessModel
  showToolCalls: boolean
  focusedQuery?: string
  sessionId?: string
}) {
  const nodes: ReactNode[] = []
  let pendingTools: ToolCallInfo[] = []
  let key = 0
  let textIndex = 0
  const flush = (): void => {
    if (pendingTools.length > 0) {
      nodes.push(<ArtifactCards key={`card-${key}`} tools={pendingTools} />)
      key += 1
      pendingTools = []
    }
  }
  for (const row of model.rows) {
    if (row.kind === 'reasoning') {
      flush()
      nodes.push(<ThinkBlock key={row.key} row={row} />)
      continue
    }
    if (row.kind === 'tool') {
      // 提问不走工具行：它有自己的「提问 · N/M 已回答」记录（QuestionRecords），
      // 原始行只会在记录上方再放一遍 JSON 参数，纯噪音（桌面同样只留卡）。
      if (row.tool.name === 'ask_user_question' && row.tool.question !== undefined) {
        flush()
        continue
      }
      // 工具行跟着开关走；diff 卡不跟 —— 卡是这一轮的产出（改了哪些文件），
      // 关掉"显示工具调用"是想少看过程噪音，不是想看不到改动。
      if (showToolCalls) nodes.push(<ToolStep key={row.key} tool={row.tool} />)
      if (row.tool.view !== undefined) pendingTools.push(row.tool)
      else flush()
      continue
    }
    flush()
    // Legacy flows carry no part seq: fall back to the coalesced step seq so a
    // search-hit locate can still scroll to this step.
    const stepSeq = row.seq ?? message.stepSeqs?.[textIndex]
    const body = <MarkdownText text={row.text} pending={message.pending === true} forceOpen={focusedQuery !== undefined} highlightQuery={focusedQuery} sessionId={sessionId} />
    nodes.push(stepSeq === undefined
      ? <Fragment key={row.key}>{body}</Fragment>
      : <div key={row.key} className="chat-flow-text" data-step-seq={stepSeq} data-part-id={`text-${textIndex}`}>{body}</div>)
    textIndex += 1
  }
  flush()
  return <>{nodes}</>
}

/**
 * 一段思考：缩进、左侧强调线。折叠时只说"深度思考 · 42 行"，展开才读正文
 * （正文不长时一次给全，不做二级折叠——少一次点击）。
 */
function ThinkBlock({ row }: { row: ProcessReasoningRow }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="chat-think">
      <button
        type="button"
        className="chat-think-head"
        aria-expanded={open}
        onClick={() => { setOpen(value => !value) }}
      >
        <span className="chat-think-icon" aria-hidden>✦</span>
        <span className="chat-think-label">深度思考 · {row.lines} 行</span>
        <span className="chat-think-caret" aria-hidden>{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className="chat-think-body">{row.text}</div>}
    </div>
  )
}

/**
 * One process-timeline row (the phone's `ToolRow`): state dot, family glyph,
 * the act's title and the args-derived summary. Tapping reveals the raw
 * arguments; the diff content itself stays in the message body where it
 * already renders at its call time point.
 */
function ToolStep({ tool }: { tool: ToolCallInfo }) {
  const [open, setOpen] = useState(false)
  const model = stepModel(tool)
  const state = tool.state ?? 'running'
  const tally = tool.view === undefined ? undefined : diffTallyOf(tool.view)
  return (
    <div className="chat-step" data-state={state}>
      <button
        type="button"
        className="chat-step-head"
        aria-expanded={open}
        onClick={() => { setOpen(value => !value) }}
      >
        <span className="chat-step-icon" aria-hidden>{stepIcon(model.variant)}</span>
        <span className="chat-step-title">{model.title}</span>
        <span className="chat-step-summary">{model.summary}</span>
        <span className={`chat-step-state chat-step-state-${state}`}>{STEP_STATE_LABELS[state] ?? state}</span>
        {tally !== undefined && (
          <span className="chat-step-tally" aria-hidden>
            <span className="chat-step-tally-add">+{tally.adds}</span>
            <span className="chat-step-tally-del">−{tally.dels}</span>
          </span>
        )}
        <span className="chat-step-caret" aria-hidden>{open ? '▾' : '▸'}</span>
      </button>
      {open && tool.arguments !== undefined && (
        <pre className="chat-tool-args">{tool.arguments}</pre>
      )}
    </div>
  )
}

/** 步骤状态用中文写出来：不靠颜色也能读（用户是普通用户，不是看色卡的）。 */
const STEP_STATE_LABELS: Record<string, string> = {
  running: '运行中',
  ok: '完成',
  error: '失败',
  stopped: '已中断',
}

/** 每步行首符号（手机端用 emoji 集；桌面端对应的是 figma 那套静态 SVG 图标）。 */
function stepIcon(variant: StepVariant): ReactNode {
  if (variant === 'search') return '🔍'
  if (variant === 'read') return '📂'
  if (variant === 'bash') return '⚙️'
  if (variant === 'write' || variant === 'edit') return '✏️'
  if (variant === 'code') return '💻'
  return '🔧'
}

/**
 * The settled message body rendered in event order: text runs and diff
 * artifacts interleaved at their call time points (a write mid-turn shows
 * its diff right where the model called it, not stacked at the end).
 * Consecutive tool parts merge into one artifact card (multi-file edits
 * stay a single card); tool parts without a diff view render nothing.
 */
function AssistantBody({ message, showToolCalls, forceOpen, focusedQuery, sessionId, clockOffsetMs, liveTurnStartAt, liveTurn }: {
  message: RenderMessage
  showToolCalls: boolean
  forceOpen: boolean
  focusedQuery?: string
  sessionId?: string
  clockOffsetMs?: number
  liveTurnStartAt?: number
  liveTurn?: number
}) {
  // 判据的第二行（第二行状态词）与头的状态词必须同源：[liveTurn] 也要进依赖，
  // 否则活跃轮次一变（turn/end 到了、下一轮开了）这一行的第二行不会重算。
  const model = useMemo(() => processModel(message, liveTurn), [message, liveTurn])
  // 有过程行，或者至少有一枚回合时钟（纯文本回复也要显示"本轮用了 X"）。
  // 注意：这个开关只挡工具行，不挡整组 —— 关掉工具调用不该连带丢掉思考与用时。
  const visibleRows = visibleRowCount(model, showToolCalls)
  // 提问记录：ask_user_question 的问答历史（不跟「显示工具调用」开关，它是对话内容）
  // 同一 callId 只留一份（合并/回放可能给出重复条目），避免记录被算两遍。
  const questionTools = (() => {
    const seen = new Set<string>()
    const out: ToolCallInfo[] = []
    for (const tool of message.tools ?? []) {
      if (tool.question === undefined || seen.has(tool.callId)) continue
      seen.add(tool.callId)
      out.push(tool)
    }
    return out
  })()
  // 一轮里只有提问时，过程组没有行可显示：留着只剩「思考中 / 未改动文件」的空壳，纯噪音。
  const questionOnly = visibleRows === 0 && questionTools.length > 0
  const showGroup = !questionOnly && (visibleRows > 0 || message.durationMs !== undefined || message.turnStartAt !== undefined)
  const answer = model.answer
  return (
    <>
      {showGroup && <ProcessGroup message={message} model={model} showToolCalls={showToolCalls} focusedQuery={focusedQuery} sessionId={sessionId} clockOffsetMs={clockOffsetMs} liveTurnStartAt={liveTurnStartAt} liveTurn={liveTurn} />}
      {questionTools.length > 0 && <QuestionRecords tools={questionTools} />}
      {answer !== undefined && answer !== '' && (model.answerSeq === undefined ? (
        <MarkdownText text={answer} pending={message.pending === true} forceOpen={forceOpen} highlightQuery={focusedQuery} sessionId={sessionId} />
      ) : (
        <div className="chat-flow-text chat-flow-answer" data-step-seq={model.answerSeq} data-part-id="answer">
          <MarkdownText text={answer} pending={message.pending === true} forceOpen={forceOpen} highlightQuery={focusedQuery} sessionId={sessionId} />
        </div>
      ))}
    </>
  )
}

/**
 * 聊天历史里的「提问 · N/M 已回答」记录。
 *
 * 桌面端由 `dsh-client-ui-user-questions` 渲染成一张卡（读宿主投影）。手机端没有那条
 * 渲染路径，而本部署的 `userQuestions` 投影并不产出 settled，所以这里直接读
 * `messages.ts` 从 tool/call + tool/result 事件折出来的记录：折叠时只显示计数，
 * 展开才逐条列出「问了什么 / 选了什么」。
 */
function QuestionRecords({ tools }: { tools: ToolCallInfo[] }) {
  const items = tools.flatMap(tool => tool.question?.items ?? [])
  const total = items.length
  const answered = items.filter(item => item.selected.length > 0 || item.custom !== undefined).length
  // 条目多时才折叠，常用的 1~2 条直接铺开：用户要的是"一眼看到问题和我选了什么"，
  // 而不是点开才知道。（桌面的那张卡也是把问题与答案直接列出来的。）
  const [open, setOpen] = useState(items.length <= 2)
  if (total === 0) return null
  const pending = total - answered
  return (
    <div className="chat-qa">
      <div className="chat-qa-head">
        <span className="chat-qa-icon" aria-hidden>?</span>
        <span className="chat-qa-title">提问</span>
        <span className={`chat-qa-count${pending > 0 ? ' chat-qa-count-pending' : ''}`}>
          {answered}/{total} {pending > 0 ? '待回答' : '已回答'}
        </span>
        {items.length > 2 && (
          <button
            type="button"
            className="chat-qa-toggle"
            onClick={() => setOpen(value => !value)}
            aria-expanded={open}
          >
            {open ? '收起' : `展开 ${String(items.length)} 条`}
          </button>
        )}
      </div>
      {open && (
        <ul className="chat-qa-list">
          {items.map((item, index) => {
            const answeredText = item.selected.length > 0
              ? item.selected.join('、')
              : (item.custom !== undefined ? item.custom : '')
            return (
              <li key={`${item.id}-${String(index)}`} className="chat-qa-item">
                <div className="chat-qa-q">
                  {item.header === undefined ? item.question : <><span className="chat-qa-header">{item.header}</span>{item.question}</>}
                </div>
                {answeredText === ''
                  ? <div className="chat-qa-a chat-qa-a-empty">未回答</div>
                  : (
                    <div className="chat-qa-a">
                      <span className="chat-qa-a-label">选</span>
                      <span className="chat-qa-a-value">{answeredText}</span>
                    </div>
                  )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/**
 * Diff artifacts (write/edit) rendered directly in the message body — the
 * phone's take on the desktop diff card, visible without expanding the
 * tool disclosure. The tool disclosure keeps the call name only.
 *
 * Every diff view of the turn merges into ONE card: a single head with the
 * file tally, per-file diffs below (each file keeps its path header). A
 * multi-file edit no longer stacks one folded card per write call.
 */
function ArtifactCards({ tools }: { tools: ToolCallInfo[] }) {
  // The merged view must keep a STABLE reference across streaming chunks:
  // the fold keeps the tools array identity while only the text grows, so
  // memoizing on `tools` lets ArtifactCard's tally and ToolDiffCard's rows
  // survive the per-chunk re-render instead of re-deriving the whole diff
  // (and re-reading scrollHeight) on every token.
  const merged = useMemo(() => {
    const cards = tools.filter(tool => tool.view !== undefined)
    if (cards.length === 0) return undefined
    return {
      card: 'diff' as const,
      title: cards.length === 1
        ? (cards[0]?.view?.title ?? cards[0]?.name ?? '')
        : `编辑了 ${cards.length} 个文件`,
      diffs: cards.flatMap(card => card.view?.diffs ?? []),
    }
  }, [tools])
  if (merged === undefined) return null
  return <ArtifactCard tool={{ ...tools.find(tool => tool.view !== undefined)!, view: merged }} />
}

/**
 * One collapsible diff artifact: the title row (Write/Edit + file) is
 * always visible with a +/- line tally; the red/green body stays folded
 * until tapped — a long mutation never pushes the reply off screen.
 */
function ArtifactCard({ tool }: { tool: ToolCallInfo }) {
  const [open, setOpen] = useState(false)
  const diffRef = useRef<HTMLDivElement | null>(null)
  const view = tool.view
  const tally = useMemo(() => diffTallyOf(view), [view])
  // Clamp the diff body to its actual content height with a max-height
  // transition: expanding, collapsing and streamed growth (more files
  // landing mid-turn — "edited N files" 3 → 11) animate smoothly instead
  // of snapping, so the paragraph below the card never jumps. Runs when
  // the open state or the view content changes; a stable view across
  // streaming chunks skips the (synchronous reflow) scrollHeight read.
  useEffect(() => {
    const el = diffRef.current
    if (el !== null) el.style.maxHeight = open ? `${el.scrollHeight}px` : '0px'
  }, [open, view])
  if (view === undefined) return null
  return (
    <div className="chat-artifact">
      <button
        type="button"
        className="chat-artifact-head"
        aria-expanded={open}
        onClick={() => { setOpen(value => !value) }}
      >
        <span className="chat-artifact-title">{view.title ?? tool.name}</span>
        <span className="chat-artifact-summary">
          <span className="chat-artifact-stat chat-artifact-stat-add">+{tally.adds}</span>
          <span className="chat-artifact-stat chat-artifact-stat-del">−{tally.dels}</span>
        </span>
        <span className="chat-artifact-caret" aria-hidden>{open ? '▾' : '▸'}</span>
      </button>
      {open && <ToolDiffCard view={view} diffRef={diffRef} />}
    </div>
  )
}

/**
 * One file mutation (write/edit) rendered as removed/added lines — the
 * phone's take on the desktop diff card. The host presenter ships the
 * change as `{ path, oldText, newText }` per file; every old-side line
 * draws red, every new-side line green, reusing the DiffView palette.
 */
function ToolDiffCard({ view, diffRef }: { view: ToolDiffView; diffRef?: Ref<HTMLDivElement> }) {
  const rows = useMemo(() => {
    const out: Array<{ kind: 'path' | 'del' | 'add'; text: string }> = []
    for (const diff of view.diffs) {
      out.push({ kind: 'path', text: diff.path })
      if (diff.oldText !== null) {
        for (const line of toolDiffLines(diff.oldText)) out.push({ kind: 'del', text: line })
      }
      for (const line of toolDiffLines(diff.newText)) out.push({ kind: 'add', text: line })
    }
    return out
  }, [view])
  return (
    <div ref={diffRef} className="chat-tool-diff" style={{ maxHeight: 0 }}>
      {rows.map((row, index) => (
        <div
          key={index}
          className={'chat-tool-diff-row' + (row.kind === 'del' ? ' chat-tool-diff-del' : row.kind === 'add' ? ' chat-tool-diff-add' : ' chat-tool-diff-path')}
        >
          {row.kind !== 'path' && (
            <span className="chat-tool-diff-sign" aria-hidden>{row.kind === 'del' ? '−' : '+'}</span>
          )}
          <span className="chat-tool-diff-text">{row.text}</span>
        </div>
      ))}
    </div>
  )
}

/** Last path segment (a deliverable's label when the host gave no description). */
function baseName(path: string): string {
  const parts = path.split(/[\\/]/)
  return parts[parts.length - 1] || path
}
