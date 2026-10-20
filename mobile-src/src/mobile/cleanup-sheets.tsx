/**
 * 删除/清理相关的底部弹层与动效组件。
 *
 * 交互模型（对齐「权限全在操作人手里，我们只多做一层提醒」）：
 *   · 归档        —— 可逆，直接执行 + 撤销条；
 *   · 仅本机隐藏  —— 只写本机 localStorage，可逆；
 *   · 管理文件    —— 勾选清单 →「移到回收站」（默认，可撤销）或「彻底删除」；
 *   · 永久删除会话 —— 红色危险区，必须**按住 1.2 秒**（带进度环 + 轻震）才执行；
 *     宿主侧先归档墓碑再把会话目录搬进回收站，仍可在回收站恢复。
 *
 * 动效原则：只给「状态变化」做动效（弹层上滑、进度环、行收起、撤销条滑入），
 * 不做装饰性动画；`prefers-reduced-motion` 下全部退化成瞬时切换。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Sheet } from './sheet.tsx'
import { ConfirmDialog } from './dialog.tsx'
import { toast } from './toast.tsx'
import { buzz } from './display-prefs.ts'
import { CheckIcon, ClockIcon, FolderIcon, InfoIcon, PinIcon, TrashIcon } from './icons.tsx'
import { errorText } from './views/App.tsx'
import {
  deleteSessionFiles, emptyTrash, formatBytes, purgeSession, purgeWorkspace, readTrash,
  restoreTrashEntry, sessionFiles,
  type PurgeSessionResult, type SessionFileEntry, type SessionFilesResult, type TrashEntry,
} from './cleanup-api.ts'

/* ── 按住确认按钮 ─────────────────────────────────────────────────────────── */

const HOLD_DEFAULT_MS = 1200
const RING_RADIUS = 18
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

/**
 * 按住才能触发的危险按钮：按住时进度环走完 100% 才执行，提前松手回弹。
 * 用 rAF 而不是 CSS 动画，确保「松手位置 = 进度」且能随时取消。
 */
export function HoldButton({ label, note, danger = false, disabled = false, holdMs = HOLD_DEFAULT_MS, onComplete }: {
  label: string
  note?: string
  danger?: boolean
  disabled?: boolean
  holdMs?: number
  onComplete(): void
}) {
  const [progress, setProgress] = useState(0)
  const frame = useRef<number | undefined>(undefined)
  const startedAt = useRef(0)
  const fired = useRef(false)

  const stop = useCallback(() => {
    if (frame.current !== undefined) {
      cancelAnimationFrame(frame.current)
      frame.current = undefined
    }
    setProgress(0)
  }, [])

  useEffect(() => () => {
    if (frame.current !== undefined) cancelAnimationFrame(frame.current)
  }, [])

  const begin = (): void => {
    if (disabled || fired.current) return
    startedAt.current = performance.now()
    buzz()
    const tick = (now: number): void => {
      const value = Math.min(1, (now - startedAt.current) / holdMs)
      setProgress(value)
      if (value >= 1) {
        fired.current = true
        frame.current = undefined
        setProgress(1)
        onComplete()
        return
      }
      frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
  }

  const release = (): void => {
    if (fired.current) return
    stop()
  }

  const offset = RING_CIRCUMFERENCE * (1 - progress)
  return (
    <button
      type="button"
      className={'dm-hold' + (danger ? ' dm-hold-danger' : '') + (progress > 0 ? ' dm-hold-active' : '')}
      disabled={disabled}
      onPointerDown={(event) => { event.preventDefault(); begin() }}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerLeave={release}
      onContextMenu={(event) => { event.preventDefault() }}
    >
      <span className="dm-hold-ringWrap" aria-hidden>
        <svg className="dm-hold-ring" viewBox="0 0 44 44">
          <circle className="dm-hold-ring-track" cx="22" cy="22" r={RING_RADIUS} />
          <circle
            className="dm-hold-ring-fill"
            cx="22"
            cy="22"
            r={RING_RADIUS}
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="dm-hold-ringLabel">{Math.round(progress * 100)}</span>
      </span>
      <span className="dm-hold-copy">
        <span className="dm-hold-title">{label}</span>
        <span className="dm-hold-note">{note ?? `按住 ${(holdMs / 1000).toFixed(1)} 秒`}</span>
      </span>
    </button>
  )
}

/* ── 会话动作面板 ─────────────────────────────────────────────────────────── */

/** One row in the session action sheet. */
function ActionItem({ icon, title, desc, danger = false, onClick, delay = 0 }: {
  icon: React.ReactNode
  title: string
  desc?: string
  danger?: boolean
  onClick(): void
  delay?: number
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className={'sheet-option dm-action-item' + (danger ? ' dm-action-danger' : '')}
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      <span className="dm-action-icon" aria-hidden>{icon}</span>
      <span className="sheet-option-copy">
        <span className="sheet-option-title">{title}</span>
        {desc !== undefined && <span className="sheet-option-desc">{desc}</span>}
      </span>
    </button>
  )
}

/** 长按/更多弹出的会话动作面板。 */
export function SessionActionsSheet({ session, pinned = false, onClose, onTogglePin, onArchive, onLocalHide, onFiles, onPurge }: {
  session: { sessionId: string; title: string; running?: boolean }
  pinned?: boolean
  onClose(): void
  onTogglePin(): void
  onArchive(): void
  onLocalHide(): void
  onFiles(): void
  onPurge(): void
}) {
  useEffect(() => { buzz() }, [])
  return (
    <Sheet title={session.title || '会话操作'} onClose={onClose}>
      <div role="menu" aria-label="会话操作" className="dm-action-list">
        <ActionItem
          icon={<PinIcon />}
          title={pinned ? '取消置顶' : '置顶会话'}
          onClick={onTogglePin}
          delay={0}
        />
        <ActionItem
          icon={<ArchiveIcon />}
          title="归档（所有设备隐藏）"
          desc="从所有设备的列表移除，会话记录保留，可随时恢复"
          onClick={onArchive}
          delay={30}
        />
        <ActionItem
          icon={<EyeOffIcon />}
          title="仅本机隐藏"
          desc="只在这台手机上不再显示，其他设备不受影响"
          onClick={onLocalHide}
          delay={60}
        />
        <ActionItem
          icon={<FolderIcon />}
          title="管理会话文件…"
          desc="清理会话日志、这个会话写过的文件（先移入回收站）"
          onClick={onFiles}
          delay={90}
        />
        <div className="dm-action-sep" aria-hidden />
        <ActionItem
          icon={<TrashIcon />}
          title="永久删除会话…"
          desc="从磁盘移除会话记录；不可直接恢复，但会在回收站保留一段时间"
          danger
          onClick={onPurge}
          delay={120}
        />
        {session.running === true && (
          <p className="dm-action-warn" role="status">
            <InfoIcon /> 会话正在运行：永久删除会被拒绝，请先停止这一轮。
          </p>
        )}
      </div>
    </Sheet>
  )
}

/* ── 永久删除会话 ─────────────────────────────────────────────────────────── */

/** 永久删除确认：先看清会删掉什么，再按住确认。 */
export function PurgeSessionSheet({ session, onClose, onDone }: {
  session: { sessionId: string; title: string; running?: boolean }
  onClose(): void
  onDone(result: PurgeSessionResult): void
}) {
  const [files, setFiles] = useState<SessionFilesResult | undefined>(undefined)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    void sessionFiles(session.sessionId).then(
      (result) => { if (!cancelled) setFiles(result) },
      () => { if (!cancelled) setFiles({ found: false, groups: [], bytes: 0 }) },
    )
    return () => { cancelled = true }
  }, [session.sessionId])

  const generatedCount = files === undefined ? undefined : (files.groups.find(group => group.kind === 'generated')?.files.length ?? 0)
  const logBytes = files === undefined ? undefined : (files.groups.find(group => group.kind === 'logs')?.files.reduce((sum, file) => sum + file.bytes, 0) ?? 0)

  const confirm = (): void => {
    if (busy) return
    setBusy(true)
    setError(undefined)
    void purgeSession(session.sessionId).then(
      (result) => { setBusy(false); onDone(result) },
      (reason: unknown) => { setBusy(false); setError(errorText(reason)) },
    )
  }

  return (
    <Sheet title="永久删除会话" onClose={busy ? () => {} : onClose}>
      <div className="dm-purge">
        <p className="dm-purge-title">{session.title || '未命名会话'}</p>
        <div className="dm-purge-facts">
          <span className="dm-fact">
            <b>{logBytes === undefined ? '…' : formatBytes(logBytes)}</b>
            <i>会话日志</i>
          </span>
          <span className="dm-fact">
            <b>{generatedCount === undefined ? '…' : generatedCount}</b>
            <i>写过的文件</i>
          </span>
          <span className="dm-fact">
            <b>{files !== undefined && files.found ? '有' : '无'}</b>
            <i>磁盘记录</i>
          </span>
        </div>
        <p className="dm-purge-note">
          删除后：所有设备的列表都会立即移除它；会话目录先移入宿主回收站
          （可在「设置 → 回收站」恢复），确认无误后再清空回收站即可彻底删除。
          工作区里生成的文件不会自动删除，可在「管理会话文件」里单独清理。
        </p>
        {session.running === true && (
          <p className="dm-purge-error" role="alert">
            <InfoIcon /> 会话正在运行，删除会被宿主拒绝。请先停止这一轮。
          </p>
        )}
        {error !== undefined && <p className="dm-purge-error" role="alert">{error}</p>}
        <HoldButton
          danger
          disabled={busy || session.running === true}
          label={busy ? '正在删除…' : '按住永久删除'}
          note={busy ? '请稍候' : '按住 1.2 秒，松手即取消'}
          onComplete={confirm}
        />
      </div>
    </Sheet>
  )
}

/* ── 文件管理 ─────────────────────────────────────────────────────────────── */

function fileKey(file: SessionFileEntry): string {
  return file.path.toLowerCase()
}

/** 勾选/清理一个会话的文件（日志 + 本会话写过的文件）。 */
export function SessionFilesSheet({ session, onClose }: {
  session: { sessionId: string; title: string }
  onClose(): void
}) {
  const [data, setData] = useState<SessionFilesResult | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [confirmHard, setConfirmHard] = useState(false)

  const load = useCallback((): void => {
    setError(undefined)
    void sessionFiles(session.sessionId).then(
      (result) => {
        setData(result)
        setSelected(new Set())
      },
      (reason: unknown) => setError(errorText(reason)),
    )
  }, [session.sessionId])

  useEffect(() => { load() }, [load])

  const allFiles = useMemo(() => (data === undefined ? [] : data.groups.flatMap(group => group.files)), [data])
  const selectedFiles = useMemo(() => allFiles.filter(file => selected.has(fileKey(file))), [allFiles, selected])
  const selectedBytes = selectedFiles.reduce((sum, file) => sum + file.bytes, 0)

  const toggle = (file: SessionFileEntry): void => {
    setSelected((previous) => {
      const next = new Set(previous)
      const key = fileKey(file)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      buzz()
      return next
    })
  }

  const remove = (hard: boolean): void => {
    if (busy || selectedFiles.length === 0) return
    setBusy(true)
    setConfirmHard(false)
    void deleteSessionFiles(session.sessionId, selectedFiles.map(file => file.path), hard).then(
      (result) => {
        setBusy(false)
        const count = result.moved.length
        toast(hard ? `已彻底删除 ${count} 个文件` : `已将 ${count} 个文件移入回收站`)
        load()
      },
      (reason: unknown) => {
        setBusy(false)
        toast(`删除失败：${errorText(reason)}`)
      },
    )
  }

  return (
    <Sheet title="管理会话文件" onClose={busy ? () => {} : onClose}>
      <div className="dm-files">
        {error !== undefined && <p className="dm-purge-error" role="alert">{error}</p>}
        {data === undefined && error === undefined && <p className="dm-files-loading" role="status">正在读取文件清单…</p>}
        {data !== undefined && data.found === false && (
          <p className="dm-files-loading">找不到这个会话的磁盘记录（可能已经被删除）。</p>
        )}
        {data !== undefined && data.found && data.groups.map((group) => (
          <section key={group.kind} className="dm-files-group">
            <header className="dm-files-groupHead">
              <span className="dm-files-groupTitle">{group.title}</span>
              <span className="dm-files-groupSize">{formatBytes(group.files.reduce((sum, file) => sum + file.bytes, 0))}</span>
            </header>
            {group.files.length === 0 && <p className="dm-files-empty">没有可清理的文件</p>}
            {group.files.map((file) => {
              const checked = selected.has(fileKey(file))
              return (
                <button
                  key={fileKey(file)}
                  type="button"
                  className={'dm-file-row' + (checked ? ' dm-file-checked' : '') + (file.insideWorkspace ? '' : ' dm-file-outside')}
                  onClick={() => toggle(file)}
                >
                  <span className={'dm-check' + (checked ? ' dm-check-on' : '')} aria-hidden>
                    {checked && <CheckIcon />}
                  </span>
                  <span className="dm-file-main">
                    <span className="dm-file-name">{file.name}</span>
                    <span className="dm-file-path">{file.path}</span>
                  </span>
                  <span className="dm-file-size">{formatBytes(file.bytes)}</span>
                  {!file.insideWorkspace && group.kind === 'generated' && (
                    <span className="dm-file-badge" title="位于会话工作区之外">外部</span>
                  )}
                </button>
              )
            })}
          </section>
        ))}
        {data !== undefined && data.found && (
          <p className="dm-files-note">
            提示：外部文件指不在会话工作区内的路径（例如临时目录或其他仓库）。默认先移入回收站，
            可在「设置 → 回收站」恢复。
          </p>
        )}
      </div>
      <div className="dm-files-footer">
        <button
          type="button"
          className="dm-btn dm-btn-ghost"
          disabled={busy || selectedFiles.length === 0}
          onClick={() => setConfirmHard(true)}
        >
          彻底删除
        </button>
        <button
          type="button"
          className="dm-btn dm-btn-primary"
          disabled={busy || selectedFiles.length === 0}
          onClick={() => remove(false)}
        >
          {busy ? '处理中…' : `移到回收站${selectedFiles.length > 0 ? `（${formatBytes(selectedBytes)}）` : ''}`}
        </button>
      </div>
      {confirmHard && selectedFiles.length > 0 && (
        <ConfirmDialog
          title="彻底删除文件"
          body={<>将永久删除选中的 {selectedFiles.length} 个文件（{formatBytes(selectedBytes)}），不进入回收站，无法恢复。</>}
          confirmLabel="彻底删除"
          tone="danger"
          onCancel={() => setConfirmHard(false)}
          onConfirm={() => remove(true)}
        />
      )}
    </Sheet>
  )
}

/* ── 回收站 ───────────────────────────────────────────────────────────────── */

/** 回收站：恢复误删 + 清空。 */
export function TrashSheet({ onClose }: { onClose(): void }) {
  const [items, setItems] = useState<TrashEntry[] | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)
  const [busy, setBusy] = useState(false)
  const [confirmEmpty, setConfirmEmpty] = useState(false)

  const load = useCallback((): void => {
    void readTrash().then(
      (result) => { setItems(result.items); setError(undefined) },
      (reason: unknown) => setError(errorText(reason)),
    )
  }, [])

  useEffect(() => { load() }, [load])

  const restore = (entry: TrashEntry): void => {
    if (busy) return
    setBusy(true)
    void restoreTrashEntry(entry.id).then(
      () => { setBusy(false); toast('已恢复'); load() },
      (reason: unknown) => { setBusy(false); toast(`恢复失败：${errorText(reason)}`) },
    )
  }

  const clear = (): void => {
    if (busy) return
    setBusy(true)
    setConfirmEmpty(false)
    void emptyTrash().then(
      (result) => { setBusy(false); toast(`已清空回收站（${result.removed} 项）`); load() },
      (reason: unknown) => { setBusy(false); toast(`清空失败：${errorText(reason)}`) },
    )
  }

  return (
    <Sheet title="回收站" onClose={busy ? () => {} : onClose}>
      <div className="dm-trash">
        {error !== undefined && <p className="dm-purge-error">{error}</p>}
        {items === undefined && error === undefined && <p className="dm-files-loading" role="status">正在读取回收站…</p>}
        {items !== undefined && items.length === 0 && (
          <p className="dm-trash-empty">回收站是空的。</p>
        )}
        {items !== undefined && items.map((entry) => (
          <div key={entry.id} className="dm-trash-row">
            <span className="dm-trash-icon" aria-hidden>
              {entry.kind === 'session' ? <TrashIcon /> : entry.kind === 'workspace' ? <FolderIcon /> : <FolderIcon />}
            </span>
            <span className="dm-trash-main">
              <span className="dm-trash-title">
                {entry.kind === 'session' ? '会话' : entry.kind === 'workspace' ? '工作区目录' : '会话文件'}
                {entry.hard && <span className="dm-trash-hard">已彻底删除</span>}
              </span>
              <span className="dm-trash-sub">
                {new Date(entry.removedAt).toLocaleString()} · {entry.items.length} 项
              </span>
            </span>
            {!entry.hard && (
              <button type="button" className="dm-btn dm-btn-sm" disabled={busy} onClick={() => restore(entry)}>
                恢复
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="dm-files-footer">
        <button
          type="button"
          className="dm-btn dm-btn-danger"
          disabled={busy || items === undefined || items.length === 0}
          onClick={() => setConfirmEmpty(true)}
        >
          清空回收站
        </button>
      </div>
      {confirmEmpty && (
        <ConfirmDialog
          title="清空回收站"
          body="回收站里的会话与文件将被永久删除，无法恢复。确定继续吗？"
          confirmLabel="清空"
          tone="danger"
          onCancel={() => setConfirmEmpty(false)}
          onConfirm={clear}
        />
      )}
    </Sheet>
  )
}

/* ── 工作区清理 ───────────────────────────────────────────────────────────── */

/** 工作区级清理：删会话 + 可选把目录移入回收站。 */
export function PurgeWorkspaceSheet({ workspace, onClose, onDone }: {
  workspace: { workspaceId: string; title: string; path: string; sessionCount: number }
  onClose(): void
  onDone(): void
}) {
  const [deleteSessions, setDeleteSessions] = useState(true)
  const [moveDir, setMoveDir] = useState(false)
  const [typed, setTyped] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  const pathOk = typed.trim() === workspace.path
  const canRun = !busy && (deleteSessions || moveDir) && (!moveDir || pathOk)

  const run = (): void => {
    if (!canRun) return
    setBusy(true)
    setError(undefined)
    void purgeWorkspace(workspace.workspaceId, {
      deleteWorkspaceFiles: moveDir,
      ...(moveDir ? { confirmPath: workspace.path } : {}),
    }).then(
      (result) => {
        setBusy(false)
        onDone()
        toast(`已清理 ${result.purged.length} 个会话${moveDir ? '，目录已移入回收站' : ''}`)
      },
      (reason: unknown) => { setBusy(false); setError(errorText(reason)) },
    )
  }

  return (
    <Sheet title="清理工作区" onClose={busy ? () => {} : onClose}>
      <div className="dm-files">
        <p className="dm-purge-title">{workspace.title}</p>
        <p className="dm-purge-note">{workspace.path}</p>
        <button
          type="button"
          className={'dm-file-row' + (deleteSessions ? ' dm-file-checked' : '')}
          onClick={() => setDeleteSessions(value => !value)}
        >
          <span className={'dm-check' + (deleteSessions ? ' dm-check-on' : '')} aria-hidden>{deleteSessions && <CheckIcon />}</span>
          <span className="dm-file-main">
            <span className="dm-file-name">删除该工作区的 {workspace.sessionCount} 个会话</span>
            <span className="dm-file-path">受保护/运行中的会话会跳过</span>
          </span>
        </button>
        <button
          type="button"
          className={'dm-file-row' + (moveDir ? ' dm-file-checked' : '')}
          onClick={() => setMoveDir(value => !value)}
        >
          <span className={'dm-check' + (moveDir ? ' dm-check-on' : '')} aria-hidden>{moveDir && <CheckIcon />}</span>
          <span className="dm-file-main">
            <span className="dm-file-name">把工作区目录移入回收站</span>
            <span className="dm-file-path">危险：会移动整个目录（可从回收站恢复）</span>
          </span>
        </button>
        {moveDir && (
          <label className="dm-confirm-path">
            <span>输入目录路径确认：</span>
            <input value={typed} onChange={(event) => setTyped(event.target.value)} placeholder={workspace.path} autoCapitalize="off" autoCorrect="off" spellCheck={false} />
          </label>
        )}
        {error !== undefined && <p className="dm-purge-error">{error}</p>}
      </div>
      <div className="dm-files-footer">
        <button type="button" className="dm-btn dm-btn-ghost" disabled={busy} onClick={onClose}>取消</button>
        <button type="button" className="dm-btn dm-btn-danger" disabled={!canRun} onClick={run}>
          {busy ? '处理中…' : '清理并移除工作区'}
        </button>
      </div>
    </Sheet>
  )
}

/* ── 撤销条 ───────────────────────────────────────────────────────────────── */

/** 底部撤销条：6 秒内可撤销；右侧倒计时进度条。 */
export function UndoBar({ message, onUndo, onExpire }: {
  message: string
  onUndo(): void
  onExpire(): void
}) {
  const [leaving, setLeaving] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => {
    timer.current = setTimeout(() => {
      setLeaving(true)
      timer.current = setTimeout(onExpire, 220)
    }, 6000)
    return () => {
      if (timer.current !== undefined) clearTimeout(timer.current)
    }
  }, [onExpire])
  return (
    <div className={'dm-undo' + (leaving ? ' dm-undo-out' : '')} role="status" aria-live="polite">
      <span className="dm-undo-text">{message}</span>
      <button
        type="button"
        className="dm-undo-btn"
        onClick={() => {
          if (timer.current !== undefined) clearTimeout(timer.current)
          onUndo()
        }}
      >
        撤销
      </button>
      <span className="dm-undo-progress" aria-hidden />
    </div>
  )
}

/* ── 小图标（面板内联，避免为一个图标改 icons.tsx） ─────────────────────── */

function ArchiveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <rect x="3.5" y="4.5" width="17" height="4" rx="1.2" />
      <path d="M5 8.5v9a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 17.5v-9" />
      <path d="M10 12.5h4" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M4 4l16 16" />
      <path d="M9.9 5.2A9.4 9.4 0 0 1 12 5c5 0 8.6 4.3 9.5 6-.3.6-1 1.6-2 2.5" />
      <path d="M6.2 7.2C4.4 8.5 3.1 10.2 2.5 11c.9 1.7 4.5 6 9.5 6 1 0 1.9-.2 2.8-.5" />
      <path d="M10.5 10.7a2 2 0 0 0 2.8 2.8" />
    </svg>
  )
}

/** 回收站入口行（设置页用）。 */
export function TrashEntryRow({ onOpen }: { onOpen(): void }) {
  return (
    <button type="button" className="settings-row dm-trash-entry" onClick={onOpen}>
      <span className="dm-action-icon" aria-hidden><TrashIcon /></span>
      <span className="settings-rowMain">
        <span className="settings-rowLabel">回收站</span>
        <span className="settings-rowDesc">恢复误删的会话与文件，或彻底清空</span>
      </span>
      <span className="settings-rowValue">›</span>
    </button>
  )
}

/** 供设置页/列表页复用的小时钟（回收站时间显示）。 */
export function TrashClock() {
  return <ClockIcon />
}
