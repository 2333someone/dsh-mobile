/**
 * Landing level: the workspace roster. The mobile surface opens straight
 * here — no new-session homepage — and every workspace row is a thin
 * fetch from workspace.list (the roster is small; sessions are not loaded
 * until a workspace is opened).
 *
 * UI (2026-08 refactor): a quick-action bar (search / pinned / recent), the
 * roster grouped by project kind (active = last opened, code, test) with a
 * 3px accent rail on the current workspace, type-tinted icons over mono
 * paths, a dashed create card + FAB, and a long-press action menu
 * (pin / rename / delete — rename+delete go through the host workspace RPCs;
 * pinning and the recent marker are local-only preferences).
 */

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * 上一次成功取到的工作区列表（跨挂载保留）。
 * workspace.list 在巨型工作区上可以慢到分钟级（宿主会扫描工作区与会话），而"从会话
 * 清单返回工作区列表"每次都会重新挂载并重新拉一次 ⇒ 返回时要干等很久（真机反馈）。
 * 有这份缓存就能先渲染、后台再刷新；首屏那条路同理（SessionListView 给它 2.5s 预算）。
 */
let workspaceRowsCache: WorkspaceRow[] | undefined
import type { MouseEvent as ReactMouseEvent } from 'react'
import type { WorkspaceView as WorkspaceRow } from '../../api-proxy-types'
import { deleteWorkspace, listWorkspaces, listDirectory, listDirectoryRoots, makeDirectory, createWorkspace, renameWorkspace, searchAll, searchMessages, type DirectoryListing, type DirectoryEntry, type SessionSearchHit } from '../api.ts'
import { errorText } from './App.tsx'
import { compactPath, dominantPathPrefix } from '../ui-text.ts'
import { Sheet } from '../sheet.tsx'
import { ConfirmDialog, PromptDialog } from '../dialog.tsx'
import { PurgeWorkspaceSheet } from '../cleanup-sheets.tsx'
import { toast } from '../toast.tsx'
import { CheckIcon, ClockIcon, CloseIcon, FolderIcon, FolderPlusIcon, InboxIcon, PinIcon, PlusIcon, SearchIcon } from '../icons.tsx'
import { HeaderActions } from '../dm-header/index.tsx'

/* ── local preferences (pin / recent) ────────────────────────────────── */

const PINNED_KEY = 'dsh.palm.pinnedWorkspaces'
/** Ordered recent-workspace ids, newest first (v2 list format). */
const RECENTS_KEY = 'dsh.palm.recentWorkspaces'
/** Legacy single-value key (v1); read for one-time migration then dropped. */
const LEGACY_RECENT_KEY = 'dsh.palm.recentWorkspace'
/** First-run welcome card: shown once after pairing, dismissible. */
const WELCOME_KEY = 'dsh.palm.welcomeSeen'
/** How many recents are retained in storage. */
const RECENTS_LIMIT = 5
/** How many recents surface as the 活跃项目 group on the roster. */
export const ACTIVE_RECENT_LIMIT = 3

/** Read the pinned workspace id list (localStorage, best effort). */
function readPinned(): string[] {
  try {
    const raw = localStorage.getItem(PINNED_KEY)
    const parsed: unknown = raw === null ? [] : JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

function writePinned(ids: string[]): void {
  try { localStorage.setItem(PINNED_KEY, JSON.stringify(ids)) } catch { /* non-fatal */ }
}

/** Dedupe an id list preserving first-occurrence order, capped at the limit. */
function capRecents(ids: readonly string[]): string[] {
  const out: string[] = []
  for (const id of ids) {
    if (out.includes(id)) continue
    out.push(id)
    if (out.length >= RECENTS_LIMIT) break
  }
  return out
}

/**
 * Read the ordered recent-workspace list (newest first, bounded). The v1
 * format was a single plain-text id under another key; a v1 value found here
 * migrates once into the list key and the legacy key is removed.
 */
function readRecents(): string[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY)
    if (raw !== null) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed)) return capRecents(parsed.filter((id): id is string => typeof id === 'string'))
    }
  } catch { /* fall through to migration */ }
  // v1 single-value migration: `recentWorkspace` held one plain id.
  try {
    const legacy = localStorage.getItem(LEGACY_RECENT_KEY)
    if (legacy !== null && legacy !== '') {
      const migrated = capRecents([legacy])
      localStorage.setItem(RECENTS_KEY, JSON.stringify(migrated))
      localStorage.removeItem(LEGACY_RECENT_KEY)
      return migrated
    }
  } catch { /* non-fatal */ }
  return []
}

function writeRecents(ids: readonly string[]): void {
  const capped = capRecents(ids)
  try { localStorage.setItem(RECENTS_KEY, JSON.stringify(capped)) } catch { /* non-fatal */ }
}

/** Move one id to the front of the list (a fresh open) and persist. */
function pushRecent(ids: readonly string[], id: string): string[] {
  const next = capRecents([id, ...ids.filter(existing => existing !== id)])
  writeRecents(next)
  return next
}

/** Drop one id (workspace deleted) and persist. */
function removeRecent(ids: readonly string[], id: string): string[] {
  const next = ids.filter(existing => existing !== id)
  writeRecents(next)
  return next
}

/* ── project-kind classification ─────────────────────────────────────── */

/** Project kind driving icon tint + roster grouping. */
type WorkspaceKind = 'active' | 'test' | 'code' | 'plain'

/** Explicit project kind picked by the user at creation time (phone-local).
 *  Keyed by workspaceId; absent means "let the heuristic decide". */
type ExplicitKind = 'code' | 'test'

const WORKSPACE_KINDS_KEY = 'dsh.palm.workspaceKinds'

function readExplicitKinds(): Record<string, ExplicitKind> {
  try {
    const raw = localStorage.getItem(WORKSPACE_KINDS_KEY)
    const parsed: unknown = raw === null ? {} : JSON.parse(raw)
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const out: Record<string, ExplicitKind> = {}
    for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (value === 'code' || value === 'test') out[id] = value
    }
    return out
  } catch {
    return {}
  }
}

function writeExplicitKinds(kinds: Record<string, ExplicitKind>): void {
  try {
    localStorage.setItem(WORKSPACE_KINDS_KEY, JSON.stringify(kinds))
  } catch {}
}

/** 用户自建分类：显示名称 + 顺序都本地保存。 */
interface WorkspaceCategory {
  id: string
  name: string
}

const CATEGORIES_KEY = 'dsh.palm.workspaceCategories'
const CATEGORY_MAP_KEY = 'dsh.palm.workspaceCategoryMap'

function readCategories(): WorkspaceCategory[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY)
    const parsed: unknown = raw === null ? [] : JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item): item is { id: string; name: string } => {
        return item !== null && typeof item === 'object'
          && typeof (item as { id?: unknown }).id === 'string'
          && typeof (item as { name?: unknown }).name === 'string'
          && (item as { name: string }).name.trim() !== ''
      })
      .map((item) => ({ id: item.id, name: item.name.trim() }))
  } catch {
    return []
  }
}

function writeCategories(list: WorkspaceCategory[]): void {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(list))
  } catch {}
}

function readCategoryMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CATEGORY_MAP_KEY)
    const parsed: unknown = raw === null ? {} : JSON.parse(raw)
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const out: Record<string, string> = {}
    for (const [workspaceId, categoryId] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof categoryId === 'string') out[workspaceId] = categoryId
    }
    return out
  } catch {
    return {}
  }
}

function writeCategoryMap(map: Record<string, string>): void {
  try {
    localStorage.setItem(CATEGORY_MAP_KEY, JSON.stringify(map))
  } catch {}
}

/** Heuristic split: the most-recently opened workspaces (up to
 *  {@link ACTIVE_RECENT_LIMIT}) are "active"; paths that look like test rigs
 *  (test/spec/benchmark segments) group under 测试项目; workspaces without
 *  any session yet stay "plain" gray. An explicit kind chosen by the user
 *  always wins over the heuristic (so a project created under 测试项目 stays
 *  there instead of jumping to 活跃项目 on first open). */
export function workspaceKind(workspace: WorkspaceRow, recents: readonly string[], explicit?: Record<string, ExplicitKind>): WorkspaceKind {
  const preferred = explicit === undefined ? undefined : explicit[workspace.workspaceId]
  if (preferred === 'code' || preferred === 'test') return preferred
  if (recents.slice(0, ACTIVE_RECENT_LIMIT).includes(workspace.workspaceId)) return 'active'
  if (/\b(test|tests|testing|spec|specs|benchmark|e2e)\b/i.test(workspace.path.replace(/[\\/]+/g, ' '))
    || /\b(test|tests|testing|spec|specs|benchmark|e2e)\b/i.test(workspace.title)) return 'test'
  if ((workspace.sessionIds ?? []).length === 0) return 'plain'
  return 'code'
}

const KIND_LABEL: Record<WorkspaceKind, string> = {
  active: '活跃项目',
  code: '代码项目',
  test: '测试项目',
  plain: '其他',
}

const KIND_ICON_CLASS: Record<WorkspaceKind, string> = {
  active: 'ws-icon-active',
  code: 'ws-icon-code',
  test: 'ws-icon-test',
  plain: 'ws-icon-plain',
}

/** Roster group order + the empty-group placeholder copy. */
const GROUP_ORDER: ReadonlyArray<{ kind: WorkspaceKind; placeholder: string | null }> = [
  { kind: 'active', placeholder: null },
  { kind: 'code', placeholder: '暂无代码项目' },
  { kind: 'test', placeholder: '暂无测试项目' },
  { kind: 'plain', placeholder: null },
]

/* ── directory browser (create flow) ─────────────────────────────────── */

/** Props for the directory browser. */
interface DirectoryBrowserProps {
  onCancel(): void
  onPick(workspace: WorkspaceRow, categoryId?: string): void
  /** Preset category when the user entered from a category's「新建」. */
  initialCategory?: string
}

/**
 * Render the directory browser for creating a new workspace.
 */
function DirectoryBrowser({ onCancel, onPick, initialCategory }: DirectoryBrowserProps) {
  const [listing, setListing] = useState<DirectoryListing | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)
  const [creating, setCreating] = useState(false)
  const [path, setPath] = useState<string | undefined>(undefined)
  const [reload, setReload] = useState(0)
  const [folderPrompt, setFolderPrompt] = useState(false)
  const [folderBusy, setFolderBusy] = useState(false)
  const [folderError, setFolderError] = useState<string | undefined>(undefined)
  const [roots, setRoots] = useState<Array<{ name: string; path: string }>>([])
  const [jumpPrompt, setJumpPrompt] = useState(false)

  useEffect(() => {
    let alive = true
    void listDirectoryRoots().then(
      (result) => { if (alive) setRoots(result.roots) },
      () => {},
    )
    return () => { alive = false }
  }, [])

  useEffect(() => {
    let cancelled = false
    setError(undefined)
    setListing(undefined)
    void listDirectory(path).then(
      (res) => {
        if (cancelled) return
        setListing(res)
      },
      (reason: unknown) => {
        if (cancelled) return
        setError(errorText(reason))
      },
    )
    return () => { cancelled = true }
  }, [path, reload])

  /** 在当前目录下新建一个文件夹（宿主 workspace.create 只接受已存在目录）。 */
  const handleMakeFolder = async (name: string) => {
    if (listing === undefined || folderBusy) return
    setFolderBusy(true)
    setFolderError(undefined)
    try {
      const result = await makeDirectory(listing.path, name)
      setFolderPrompt(false)
      // 直接进入新文件夹：目录是空的，确认无误后点「选择此目录」。
      setPath(result.path)
    } catch (reason: unknown) {
      setFolderError(errorText(reason))
    } finally {
      setFolderBusy(false)
    }
  }

  const handleCreate = async () => {
    if (listing === undefined || creating) return
    setCreating(true)
    setError(undefined)
    try {
      const result = await createWorkspace(listing.path)
      onPick(result.workspace, initialCategory)
    } catch (reason: unknown) {
      setCreating(false)
      setError(errorText(reason))
    }
  }

  return (
    <div className="mobile dir-browser">
      <header className="mobile-header">
        <div className="mobile-headerSlot">
          <button type="button" className="mobile-headerAction" onClick={onCancel}>返回</button>
        </div>
        <h1 className="mobile-title">选择目录</h1>
        <div className="mobile-headerSlot mobile-headerSlot-right" />
      </header>

      {roots.length > 0 && (
        <div className="dir-drives" role="toolbar" aria-label="盘符">
          {roots.map((root) => {
            const current = listing !== undefined && listing.path.toUpperCase().startsWith(root.path.toUpperCase())
            return (
              <button
                key={root.path}
                type="button"
                className={'dir-drive' + (current ? ' dir-drive-on' : '')}
                onClick={() => { setPath(root.path) }}
              >
                {root.name}
              </button>
            )
          })}
          <button type="button" className="dir-drive dir-drive-jump" onClick={() => { setJumpPrompt(true) }}>
            跳转…
          </button>
        </div>
      )}
      {listing !== undefined && (
        <div className="dir-crumbs">
          {listing.crumbs.map((crumb, idx) => (
            <span key={crumb.path}>
              <button
                type="button"
                className="dir-crumb"
                onClick={() => setPath(crumb.path)}
              >
                {crumb.name || '/'}
              </button>
              {idx < listing.crumbs.length - 1 && <span className="dir-crumb-separator">/</span>}
            </span>
          ))}
        </div>
      )}

      {error !== undefined ? (
        <div className="mobile-empty">
          <p className="mobile-error">{error}</p>
          <button type="button" className="mobile-button" onClick={() => setReload(n => n + 1)}>重试</button>
        </div>
      ) : listing === undefined ? (
        <div className="mobile-empty">
          <p className="mobile-muted">加载中…</p>
        </div>
      ) : (
        <ul className="mobile-list">
          {listing.entries.length === 0 ? (
            <div className="mobile-empty dir-empty">
              <p className="mobile-muted">空目录</p>
            </div>
          ) : (
            listing.entries.map((entry: DirectoryEntry) => (
              <li key={entry.path}>
                <button
                  type="button"
                  className={`mobile-row dir-entry ${entry.hidden ? 'dir-entry-hidden' : ''}`}
                  onClick={() => setPath(entry.path)}
                >
                  <span className="mobile-rowMain">
                    <span className="mobile-rowTitle">{entry.name}</span>
                  </span>
                  <span className="mobile-chevron" aria-hidden>›</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}

      <div className="dir-select">
        {folderError !== undefined && <p className="mobile-error" role="alert">{folderError}</p>}
        <button
          type="button"
          className="mobile-button mobile-button-muted"
          disabled={listing === undefined || creating || folderBusy}
          onClick={() => { setFolderError(undefined); setFolderPrompt(true) }}
        >
          新建文件夹
        </button>
        <button
          type="button"
          className="mobile-button"
          disabled={listing === undefined || creating}
          onClick={() => void handleCreate()}
        >
          {creating ? '创建中…' : '选择此目录'}
        </button>
      </div>
      {jumpPrompt && listing !== undefined && (
        <PromptDialog
          title="跳转到目录"
          initial={listing.path}
          confirmLabel="跳转"
          onCancel={() => { setJumpPrompt(false) }}
          onConfirm={(value) => {
            setJumpPrompt(false)
            const next = value.trim()
            if (next !== '') setPath(next)
          }}
        />
      )}
      {folderPrompt && listing !== undefined && (
        <PromptDialog
          title="新建文件夹"
          initial=""
          confirmLabel={folderBusy ? '创建中…' : '创建'}
          busy={folderBusy}
          onCancel={() => { setFolderPrompt(false) }}
          onConfirm={(value) => { void handleMakeFolder(value) }}
        />
      )}
    </div>
  )
}

/* ── long-press action menu ──────────────────────────────────────────── */

/** The workspace the long-press menu is open for. */
interface MenuTarget {
  workspace: WorkspaceRow
}

/** Props for the workspace action menu. */
interface WorkspaceMenuProps {
  onMoveCategory(): void
  onPurge(workspace: WorkspaceRow): void
  target: MenuTarget
  pinned: boolean
  onClose(): void
  onPinnedChange(): void
  onRename(workspace: WorkspaceRow): void
  onDelete(workspace: WorkspaceRow): void
}

/** Long-press menu: pin toggle, rename, delete (bottom sheet, one column). */
function WorkspaceMenu({ target, pinned, onClose, onPinnedChange, onRename, onDelete, onPurge, onMoveCategory }: WorkspaceMenuProps) {
  const { workspace } = target
  const actions: Array<{ key: string; label: string; danger?: boolean; run(): void }> = [
    {
      key: 'pin',
      label: pinned ? '取消固定' : '固定到顶部',
      run: () => { onPinnedChange() },
    },
    { key: 'rename', label: '重命名', run: () => { onRename(workspace) } },
    { key: 'move', label: '移动到分类…', run: () => { onMoveCategory() } },
    { key: 'delete', label: '移除工作区（保留文件）', danger: true, run: () => { onDelete(workspace) } },
    { key: 'purge', label: '清理工作区…', danger: true, run: () => { onPurge(workspace) } },
  ]
  return (
    <Sheet title={workspace.title} onClose={onClose}>
      <div role="menu" aria-label={`工作区操作：${workspace.title}`}>
        {actions.map(action => (
          <button
            key={action.key}
            type="button"
            role="menuitem"
            className="sheet-option"
            onClick={() => { onClose(); action.run() }}
          >
            <span className="sheet-option-copy">
              <span className="sheet-option-title" style={action.danger ? { color: 'var(--danger)' } : undefined}>
                {action.label}
              </span>
            </span>
          </button>
        ))}
      </div>
    </Sheet>
  )
}

/* ── skeleton + empty states ─────────────────────────────────────────── */

/** Three shimmering placeholder cards while the roster loads. */
function RosterSkeleton() {
  return (
    <div aria-hidden="true" role="presentation">
      {[0, 1, 2].map(index => (
        <div className="skel-row" key={index}>
          <div className="skel skel-icon" />
          <div className="skel-lines">
            <div className="skel skel-line-title" />
            <div className="skel skel-line-sub" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── workspace roster ────────────────────────────────────────────────── */

/** Props for the workspace roster. */
export interface WorkspaceViewProps {
  /** Workspace carried by the pairing link; opened after the roster loads. */
  initialWorkspaceId?: string
  /** Open one workspace's session list. */
  onPick(workspace: WorkspaceRow): void
  /** Open the bundle's native settings page — the same React route the project
   *  page gear opens (SettingsView), reached from the top-left 设置 button. */
  onOpenSettings?(): void
  /** Locate a search hit's session (in-app navigation across workspaces). */
  onLocateSession?(sessionId: string, workspaceId: string, seq?: number, query?: string, messageId?: string, partId?: string): void
  /** Open a search hit that belongs to NO workspace (standalone session):
   *  the app opens the chat directly — the last resort for unattributable
   *  hits, instead of a dead label + toast. */
  onOpenDirect?(hit: { sessionId: string; title?: string; snippet?: string }, seq?: number, query?: string, messageId?: string, partId?: string): void
  /** Restore the search surface when the app returns here after a search-hit
   *  locate (open + term). Consumed once on mount. */
  initialSearch?: { open: boolean; term: string }
  /** Report the live search-surface state so the app can restore it the next
   *  time the user returns from a located chat. */
  onSearchSnapshot?(open: boolean, term: string): void
  /** The app cleared its one-shot restore (called after initialSearch is
   *  applied), so a later manual visit does not restore the search again. */
  onSearchApplied?(): void
  /** Open the global run-overview page (cross-session background tasks). */
  onOpenRunOverview?(): void
  /** Current live background-task count across all sessions (badge on the
   *  run-overview quick chip; undefined hides the count). */
  runOverviewLive?: number
}

/**
 * Render the workspace roster.
 * @param props - the pick action.
 * @returns the roster.
 */
export function WorkspaceView({ initialWorkspaceId, onPick, onOpenSettings, onLocateSession, onOpenDirect, initialSearch, onSearchSnapshot, onSearchApplied, onOpenRunOverview, runOverviewLive }: WorkspaceViewProps) {
  const [items, setItems] = useState<WorkspaceRow[] | undefined>(() => workspaceRowsCache)
  const [error, setError] = useState<string | undefined>(undefined)
  // Bumped by the retry button to re-run the roster fetch effect.
  const [reload, setReload] = useState(0)
  const [isCreating, setIsCreating] = useState(false)
  /** Preset category when entering the directory browser from a category. */
  const [createCategory, setCreateCategory] = useState<string | undefined>(undefined)
  /** Phone-local explicit kinds (legacy; migrated into categories below). */
  const [explicitKinds, setExplicitKinds] = useState<Record<string, ExplicitKind>>(() => readExplicitKinds())
  /** User-defined categories + workspace → category mapping. */
  const [categories, setCategories] = useState<WorkspaceCategory[]>(() => readCategories())
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>(() => readCategoryMap())
  const [categoryPrompt, setCategoryPrompt] = useState(false)
  const [categoryMenu, setCategoryMenu] = useState<string | undefined>(undefined)
  const [renamingCategory, setRenamingCategory] = useState<WorkspaceCategory | undefined>(undefined)
  const [moveTarget, setMoveTarget] = useState<WorkspaceRow | undefined>(undefined)
  // Quick-bar state: search field, pinned-only filter, recent jump.
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  // Restore the search surface once, when the app returns from a located chat.
  const appliedInitialSearchRef = useRef(false)
  useEffect(() => {
    if (appliedInitialSearchRef.current) return
    if (initialSearch !== undefined && initialSearch.open) {
      appliedInitialSearchRef.current = true
      setSearchOpen(true)
      setSearch(initialSearch.term)
      onSearchApplied?.()
    }
  }, [initialSearch, onSearchApplied])
  // Report the live search-surface state so the app can restore it on return.
  useEffect(() => {
    onSearchSnapshot?.(searchOpen, search)
  }, [searchOpen, search, onSearchSnapshot])
  /** Global session hits (the home search spans workspaces, with attribution). */
  const [globalHits, setGlobalHits] = useState<SessionSearchHit[]>([])
  const [globalBusy, setGlobalBusy] = useState(false)
  const [globalDone, setGlobalDone] = useState(false)
  /** Result cap reached: more hits exist but are folded (refine the query). */
  const [globalHasMore, setGlobalHasMore] = useState(false)
  /** The host's substring backfill covered only the most recent sessions:
   *  an empty (or short) result must not read as "not on host". */
  const [globalPartial, setGlobalPartial] = useState(false)
  /** The search hit currently locating its first matched message. */
  const [pinnedOnly, setPinnedOnly] = useState(false)
  const [pinned, setPinned] = useState<string[]>(() => readPinned())
  /** Ordered recent workspace ids (newest first); the first few render as the
   *  活跃项目 group and the jump chip targets the newest. */
  const [recents, setRecents] = useState<readonly string[]>(() => readRecents())

  /** Explicit kind wins; otherwise the original heuristic. */
  const kindOf = useCallback((workspace: WorkspaceRow): WorkspaceKind => (
    workspaceKind(workspace, recents, explicitKinds)
  ), [recents, explicitKinds])

  // 旧版「显式代码/测试项目」迁移成正式分类：一次性的，之后以分类为准。
  useEffect(() => {
    if (categories.length > 0) return
    const entries = Object.entries(explicitKinds)
    if (entries.length === 0) return
    const nextCategories: WorkspaceCategory[] = []
    const nextMap: Record<string, string> = {}
    for (const [workspaceId, kind] of entries) {
      const name = kind === 'test' ? '测试项目' : '代码项目'
      let category = nextCategories.find((item) => item.name === name)
      if (category === undefined) {
        category = { id: `cat-${Date.now()}-${nextCategories.length}`, name }
        nextCategories.push(category)
      }
      nextMap[workspaceId] = category.id
    }
    setCategories(nextCategories)
    setCategoryMap(nextMap)
    writeCategories(nextCategories)
    writeCategoryMap(nextMap)
    try { localStorage.removeItem(WORKSPACE_KINDS_KEY) } catch {}
    setExplicitKinds({})
    // 只在挂载时迁移一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** 把工作区放进/移出分类。 */
  const setWorkspaceCategory = useCallback((workspaceId: string, categoryId: string | undefined) => {
    setCategoryMap((previous) => {
      const next = { ...previous }
      if (categoryId === undefined) delete next[workspaceId]
      else next[workspaceId] = categoryId
      writeCategoryMap(next)
      return next
    })
  }, [])

  const addCategory = useCallback((name: string) => {
    const trimmed = name.trim()
    if (trimmed === '') return
    setCategories((previous) => {
      const next = [...previous, { id: `cat-${Date.now()}-${previous.length}`, name: trimmed }]
      writeCategories(next)
      return next
    })
  }, [])

  const renameCategory = useCallback((id: string, name: string) => {
    const trimmed = name.trim()
    if (trimmed === '') return
    setCategories((previous) => {
      const next = previous.map((item) => (item.id === id ? { ...item, name: trimmed } : item))
      writeCategories(next)
      return next
    })
    setRenamingCategory(undefined)
  }, [])

  const deleteCategory = useCallback((id: string) => {
    setCategories((previous) => {
      const next = previous.filter((item) => item.id !== id)
      writeCategories(next)
      return next
    })
    setCategoryMap((previous) => {
      const next = { ...previous }
      for (const [workspaceId, categoryId] of Object.entries(next)) {
        if (categoryId === id) delete next[workspaceId]
      }
      writeCategoryMap(next)
      return next
    })
    setCategoryMenu(undefined)
  }, [])
  // Long-press menu + confirm/prompt dialogs.
  const [menu, setMenu] = useState<MenuTarget | undefined>(undefined)
  const [renaming, setRenaming] = useState<WorkspaceRow | undefined>(undefined)
  const [deleting, setDeleting] = useState<WorkspaceRow | undefined>(undefined)
  const [purging, setPurging] = useState<WorkspaceRow | undefined>(undefined)
  const [busy, setBusy] = useState(false)
  // Long-press detection: 500ms touch hold, cancelled on move/end.
  const pressTimerRef = useRef<number | undefined>(undefined)

  // First-run welcome card (dismissed once, stored on the device).
  const [welcomeHidden, setWelcomeHidden] = useState(() => {
    try { return localStorage.getItem(WELCOME_KEY) === '1' } catch { return false }
  })
  const dismissWelcome = (): void => {
    setWelcomeHidden(true)
    try { localStorage.setItem(WELCOME_KEY, '1') } catch { /* non-fatal */ }
  }

  // Global session search: debounced host lookup, independent of the local
  // workspace-name filter; hits render as a second group with locate links.
  useEffect(() => {
    const term = search.trim()
    if (term === '') {
      setGlobalHits([])
      setGlobalDone(false)
      setGlobalBusy(false)
      setGlobalHasMore(false)
      setGlobalPartial(false)
      return
    }
    setGlobalBusy(true)
    setGlobalDone(false)
    setGlobalPartial(false)
    let cancelled = false
    const timer = setTimeout(() => {
      void searchAll(term).then(
        (result) => {
          if (cancelled) return
          setGlobalHits(result.items)
          setGlobalHasMore(result.hasMore)
          setGlobalPartial(result.partial === true)
          setGlobalDone(true)
          setGlobalBusy(false)
        },
        () => {
          if (!cancelled) {
            setGlobalHits([])
            setGlobalDone(true)
            setGlobalBusy(false)
          }
        },
      )
    }, 250)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [search])

  /** Open a search hit straight to its first matched message: lazy message
   *  locate for the seq (cached), then in-app/deep-link navigation. A missed
   *  locate degrades to opening the session. A tap on another hit supersedes
   *  the in-flight locate (the loser neither navigates nor clears the
   *  indicator), and a late locate result after the degrade path never
   *  double-fires the navigation. */
  const locateHit = (hit: SessionSearchHit, term: string): void => {
    if (hit.kind === 'message' && hit.seq !== undefined) {
      locateSession(hit, hit.seq, term, hit.messageId, hit.partId)
      return
    }
    // A message hit without a seq, or a TITLE hit (session name matched):
    // resolve the first message containing the term so the tap still jumps
    // to the relevant message instead of opening the session at the tail.
    void searchMessages(hit.sessionId, term).then(
      (result) => {
        const first = result.items[0]
        locateSession(hit, first?.seq, term, first?.messageId, first?.partId)
      },
      () => { locateSession(hit, undefined, term) },
    )
  }

  /** Resolve a search hit's owning workspace: prefer the host attribution,
   *  fall back to the LOCAL roster's attach relation (this phone already
   *  holds every workspace with its sessionIds — immune to host
   *  attribution gaps). The host-resolved workspace title labels the row
   *  even before the roster finishes loading. */
  const resolveOwner = (hit: { sessionId: string; workspaceId?: string; workspaceTitle?: string }): { workspaceId?: string; title?: string } => {
    if (hit.workspaceId !== undefined) {
      const byId = (items ?? []).find(workspace => workspace.workspaceId === hit.workspaceId)
      return { workspaceId: hit.workspaceId, title: byId?.title ?? hit.workspaceTitle }
    }
    const byAttach = (items ?? []).find(workspace =>
      (workspace.sessionIds ?? []).map(String).includes(hit.sessionId))
    return byAttach === undefined
      ? {}
      : { workspaceId: byAttach.workspaceId, title: byAttach.title }
  }

  /** Locate a global search hit: in-app navigation when the parent offers it,
   *  deep link as the standalone fallback. An optional message seq scrolls the
   *  session straight to the matched message. A hit that belongs to NO
   *  workspace (standalone session) opens directly through the parent's
   *  onOpenDirect instead of dying with a toast. */
  const locateSession = (hit: { sessionId: string; workspaceId?: string; title?: string; snippet?: string; messageId?: string; partId?: string }, seq?: number, query?: string, messageId?: string, partId?: string): void => {
    const owner = resolveOwner(hit)
    if (owner.workspaceId !== undefined && onLocateSession !== undefined) {
      const stableMessageId = messageId ?? hit.messageId
      const stablePartId = partId ?? hit.partId
      onLocateSession(
        hit.sessionId,
        owner.workspaceId,
        seq,
        query,
        ...([stableMessageId, stablePartId].some(value => value !== undefined) ? [stableMessageId, stablePartId] : []),
      )
      return
    }
    if (owner.workspaceId === undefined) {
      if (onOpenDirect !== undefined) {
        const stableMessageId = messageId ?? hit.messageId
        const stablePartId = partId ?? hit.partId
        onOpenDirect(
          hit,
          seq,
          query,
          ...([stableMessageId, stablePartId].some(value => value !== undefined) ? [stableMessageId, stablePartId] : []),
        )
        return
      }
      toast('未找到该会话所属的工作区')
      return
    }
    const url = new URL(window.location.href)
    url.searchParams.set('workspace', owner.workspaceId)
    url.searchParams.set('session', hit.sessionId)
    if (seq !== undefined) url.searchParams.set('seq', String(seq))
    window.location.href = `${url.pathname}${url.search}`
  }

  useEffect(() => {
    let cancelled = false
    void listWorkspaces().then(
      (rows) => {
        if (cancelled) return
        const target = initialWorkspaceId === undefined
          ? undefined
          : rows.find(workspace => workspace.workspaceId === initialWorkspaceId)
        if (target !== undefined) {
          onPick(target)
          return
        }
        workspaceRowsCache = rows
        setItems(rows)
      },
      (reason: unknown) => {
        if (cancelled) return
        setError(errorText(reason))
      },
    )
    return () => { cancelled = true }
  }, [initialWorkspaceId, onPick, reload])

  /** Open a workspace: remember it as the most recent one first. */
  const pick = useCallback((workspace: WorkspaceRow) => {
    setRecents(previous => pushRecent(previous, workspace.workspaceId))
    onPick(workspace)
  }, [onPick])

  /** Jump straight into the newest-opened workspace. */
  const jumpRecent = useCallback(() => {
    const newest = recents[0]
    const target = newest === undefined ? undefined : items?.find(workspace => workspace.workspaceId === newest)
    if (target === undefined) {
      toast('还没有访问记录')
      return
    }
    pick(target)
  }, [items, recents, pick])

  const clearPressTimer = useCallback(() => {
    if (pressTimerRef.current !== undefined) {
      clearTimeout(pressTimerRef.current)
      pressTimerRef.current = undefined
    }
  }, [])

  useEffect(() => () => { clearPressTimer() }, [clearPressTimer])

  // The workspace id whose long-press has fired; the browser still emits a
  // trailing click after the touch, which must be swallowed — navigating
  // AND opening the menu is a race the user sees as "the row jumps away".
  const pressConsumedRef = useRef<string | undefined>(undefined)

  /** Long-press (touch) opens the action menu; contextmenu covers mouse. */
  const pressHandlers = (workspace: WorkspaceRow) => ({
    onTouchStart: () => {
      clearPressTimer()
      pressConsumedRef.current = undefined
      pressTimerRef.current = window.setTimeout(() => {
        pressTimerRef.current = undefined
        pressConsumedRef.current = workspace.workspaceId
        setMenu({ workspace })
      }, 500)
    },
    onTouchMove: clearPressTimer,
    onTouchEnd: clearPressTimer,
    onClick: (event: ReactMouseEvent) => {
      if (pressConsumedRef.current === workspace.workspaceId) {
        // Long-press just opened the menu for THIS row: drop the trailing
        // click instead of navigating.
        pressConsumedRef.current = undefined
        event.preventDefault()
        return
      }
      pick(workspace)
    },
    onContextMenu: (event: ReactMouseEvent) => {
      event.preventDefault()
      setMenu({ workspace })
    },
  })

  const togglePin = useCallback((workspace: WorkspaceRow) => {
    const wasPinned = pinned.includes(workspace.workspaceId)
    const next = wasPinned
      ? pinned.filter(id => id !== workspace.workspaceId)
      : [...pinned, workspace.workspaceId]
    setPinned(next)
    writePinned(next)
    toast(wasPinned ? '已取消固定' : '已固定')
  }, [pinned])

  const handleRename = useCallback(async (workspace: WorkspaceRow, title: string) => {
    setBusy(true)
    try {
      const { workspace: updated } = await renameWorkspace(workspace.workspaceId, title)
      setItems(previous => previous?.map(row => row.workspaceId === updated.workspaceId ? updated : row) ?? previous)
      setRenaming(undefined)
      toast('已重命名')
    } catch (reason: unknown) {
      toast(errorText(reason))
    } finally {
      setBusy(false)
    }
  }, [])

  const handleDelete = useCallback(async (workspace: WorkspaceRow) => {
    setBusy(true)
    try {
      await deleteWorkspace(workspace.workspaceId)
      setItems(previous => previous?.filter(row => row.workspaceId !== workspace.workspaceId) ?? previous)
      // Deleting a recent workspace must not leave a dangling entry (the jump
      // chip / active group would point at a workspace that no longer exists).
      setRecents(previous => removeRecent(previous, workspace.workspaceId))
      setDeleting(undefined)
      toast('已删除工作区（目录与会话保留）')
    } catch (reason: unknown) {
      toast(errorText(reason))
    } finally {
      setBusy(false)
    }
  }, [])

  if (isCreating) {
    return (
      <DirectoryBrowser
        initialCategory={createCategory}
        onCancel={() => { setIsCreating(false); setCreateCategory(undefined) }}
        onPick={(workspace, categoryId) => {
          if (categoryId !== undefined) setWorkspaceCategory(workspace.workspaceId, categoryId)
          pick(workspace)
        }}
      />
    )
  }

  const term = search.trim().toLowerCase()
  const visible = (items ?? [])
    .filter(workspace => term === '' || workspace.title.toLowerCase().includes(term))
    .filter(workspace => !pinnedOnly || pinned.includes(workspace.workspaceId))
  // Path compression: hide the parent prefix most roster rows share.
  const pathPrefix = dominantPathPrefix((items ?? []).map(workspace => workspace.path))
  // Pinned workspaces float to the top inside their kind group.
  const ordered = [...visible].sort((a, b) => {
    const pinA = pinned.includes(a.workspaceId) ? 0 : 1
    const pinB = pinned.includes(b.workspaceId) ? 0 : 1
    return pinA - pinB
  })
  // The active group renders in recency order (newest first); pinned rows
  // still lead it. Other groups keep the host's stable order.
  const recentOrder = new Map(recents.map((id, index) => [id, index]))
  const groups: Array<{ kind: WorkspaceKind; rows: WorkspaceRow[] }> = GROUP_ORDER
    .map(({ kind }) => ({
      kind,
      rows: kind === 'active'
        ? ordered
          .filter(workspace => kindOf(workspace) === kind)
          .sort((a, b) => {
            const pinA = pinned.includes(a.workspaceId) ? 0 : 1
            const pinB = pinned.includes(b.workspaceId) ? 0 : 1
            if (pinA !== pinB) return pinA - pinB
            return (recentOrder.get(a.workspaceId) ?? Infinity) - (recentOrder.get(b.workspaceId) ?? Infinity)
          })
        : ordered.filter(workspace => kindOf(workspace) === kind),
    }))
    .filter(group => group.rows.length > 0)
  const emptyPlaceholders = GROUP_ORDER.filter(({ kind, placeholder }) =>
    placeholder !== null && !ordered.some(workspace => kindOf(workspace) === kind))
  const pinnedCount = pinned.length

  // 分类模式：一旦用户建了分类，就用「分类 + 未分类」替换启发式分组。
  const assignedToCategory = (workspace: WorkspaceRow): boolean =>
    categories.some((category) => categoryMap[workspace.workspaceId] === category.id)
  const categoryGroups = categories.map((category) => ({
    key: category.id,
    title: category.name,
    categoryId: category.id as string | undefined,
    rows: ordered.filter((workspace) => categoryMap[workspace.workspaceId] === category.id),
    placeholder: '还没有工作区' as string | null,
  }))
  const renderGroups: Array<{
    key: string
    title: string
    categoryId: string | undefined
    rows: WorkspaceRow[]
    placeholder: string | null
  }> = categories.length === 0
    ? groups.map((group) => ({
      key: group.kind,
      title: KIND_LABEL[group.kind],
      categoryId: undefined,
      rows: group.rows,
      placeholder: null,
    }))
    : [
      ...categoryGroups,
      {
        key: '__none__',
        title: '未分类',
        categoryId: undefined,
        rows: ordered.filter((workspace) => !assignedToCategory(workspace)),
        placeholder: null,
      },
    ]
  const visibleGroups = renderGroups.filter((group) => group.rows.length > 0 || group.placeholder !== null)

  const body = (() => {
    if (error !== undefined) {
      return (
        <div className="mobile-empty">
          <div className="empty-icon"><InboxIcon /></div>
          <p className="empty-title">加载失败</p>
          <p className="empty-desc">{error}</p>
          <button
            type="button"
            className="mobile-button"
            onClick={() => { setError(undefined); setItems(undefined); setReload(n => n + 1) }}
          >
            重试
          </button>
        </div>
      )
    }
    if (items === undefined) {
      return <RosterSkeleton />
    }
    if (visible.length === 0) {
      if (pinnedOnly && pinnedCount === 0) {
        return (
          <div className="mobile-empty">
            <div className="empty-icon"><PinIcon /></div>
            <p className="empty-title">还没有固定的工作区</p>
            <p className="empty-desc">长按工作区卡片即可固定，固定后会置顶显示</p>
          </div>
        )
      }
      if (term !== '') {
        // The home search spans workspaces: only the empty state once the
        // global session lookup has settled AND found nothing either.
        if (globalBusy) {
          return (
            <div className="mobile-empty">
              <div className="empty-icon"><SearchIcon /></div>
              <p className="empty-title">正在搜索全部会话…</p>
            </div>
          )
        }
        if (globalDone && globalHits.length === 0) {
          return (
            <div className="mobile-empty">
              <div className="empty-icon"><SearchIcon /></div>
              <p className="empty-title">没有匹配的工作区或会话</p>
              <p className="empty-desc">
                工作区按名称匹配，会话按名称与可见正文匹配
                {globalPartial && <>；更早的会话未在本次扫描范围内</>}
              </p>
            </div>
          )
        }
        // 会话命中存在：落进下方列表渲染（工作区组为空，仅会话组显示）
      } else {
        return (
          <div className="mobile-empty">
            <div className="empty-icon"><FolderPlusIcon /></div>
            <p className="empty-title">暂无工作区</p>
            <p className="empty-desc">新建一个工作区，把项目目录挂进来就能开始会话</p>
          </div>
        )
      }
    }
    return (
      <ul className="mobile-list">
        {visibleGroups.map(group => (
          <li key={group.key} style={{ listStyle: 'none' }}>
            {group.categoryId !== undefined ? (
              <div className="mobile-groupTitle dm-cat-head">
                <span
                  className="dm-cat-name"
                  onContextMenu={(event) => { event.preventDefault(); setCategoryMenu(group.categoryId) }}
                >
                  {group.title}
                </span>
                <span className="dm-cat-actions">
                  <button
                    type="button"
                    className="dm-cat-btn"
                    aria-label={`在「${group.title}」新建工作区`}
                    onClick={() => { setCreateCategory(group.categoryId); setIsCreating(true) }}
                  >
                    <PlusIcon />
                  </button>
                  <button
                    type="button"
                    className="dm-cat-btn"
                    aria-label="分类操作"
                    onClick={() => setCategoryMenu(group.categoryId)}
                  >
                    ⋯
                  </button>
                </span>
              </div>
            ) : (
              <div className="mobile-groupTitle">{group.title}</div>
            )}
            {group.rows.length === 0 && group.placeholder !== null && (
              <div className="mobile-empty-group">
                <span>{group.placeholder}</span>
                <button
                  type="button"
                  className="mobile-empty-groupBtn"
                  onClick={() => { setCreateCategory(group.categoryId); setIsCreating(true) }}
                >
                  新建
                </button>
              </div>
            )}
            {group.rows.map(workspace => {
              const kind = kindOf(workspace)
              const isPinned = pinned.includes(workspace.workspaceId)
              const count = (workspace.sessionIds ?? []).length
              return (
                <button
                  type="button"
                  key={workspace.workspaceId}
                  className={`mobile-row${kind === 'active' ? ' mobile-row-active' : ''}`}
                  {...pressHandlers(workspace)}
                >
                  <span className={`ws-icon ${KIND_ICON_CLASS[kind]}`}>
                    <span aria-hidden><FolderIcon /></span>
                  </span>
                  <span className="card-main">
                    <span className="card-title">
                      <span className="card-titleText">{workspace.title}</span>
                      {isPinned && <span className="ws-pin" aria-label="已固定"><PinIcon /></span>}
                    </span>
                    <span className="card-subtitle">{compactPath(workspace.path, pathPrefix)}</span>
                  </span>
                  <span className="card-action">
                    {count > 0 && <span className="card-badge">{count} 会话</span>}
                    <span className="mobile-chevron" aria-hidden>›</span>
                  </span>
                </button>
              )
            })}
          </li>
        ))}
        {categories.length === 0 && !pinnedOnly && term === '' && emptyPlaceholders.map(({ kind, placeholder }) => (
          <li key={`empty-${kind}`} style={{ listStyle: 'none' }}>
            <div className="mobile-groupTitle">{KIND_LABEL[kind]}</div>
            <div className="mobile-empty-group">
              <span>{placeholder}</span>
              <button type="button" className="mobile-empty-groupBtn" onClick={() => {
                setCreateCategory(undefined)
                setIsCreating(true)
              }}>创建</button>
            </div>
          </li>
        ))}
        {term !== '' && globalBusy && (
          <li style={{ listStyle: 'none' }}>
            <p className="mobile-muted mobile-pad" role="status">正在搜索全部会话…</p>
          </li>
        )}
        {term !== '' && !globalBusy && globalHits.length > 0 && (
          <li style={{ listStyle: 'none' }}>
            <div className="mobile-groupTitle">会话</div>
            {globalHits.map(hit => {
              const owner = resolveOwner(hit)
              const title = (hit.title ?? hit.snippet.trim().slice(0, 24)) || '匹配会话'
              return (
                <li key={`${hit.kind}:${hit.sessionId}`} style={{ listStyle: 'none' }}>
                  <button
                    type="button"
                    className="mobile-row"
                    onClick={() => { void locateHit(hit, term) }}
                  >
                    <span className="card-icon">
                      <span className="sess-check" aria-hidden><CheckIcon /></span>
                    </span>
                    <span className="card-main">
                      <span className="sess-titleline">
                        <span className="sess-title">{title}</span>
                        <span className="sess-sep" aria-hidden>·</span>
                        <span className="sess-time">{owner.title ?? '未分组'}</span>
                      </span>
                      <span className="card-desc">{hit.snippet}</span>
                    </span>
                    <span className="card-action">
                      <span className="mobile-chevron" aria-hidden>›</span>
                    </span>
                  </button>
                </li>
              )
            })}
            {globalHasMore && (
              <li style={{ listStyle: 'none' }}>
                <p className="search-hitsNote mobile-pad">结果较多，仅显示前若干条——请细化关键词</p>
              </li>
            )}
            {!globalHasMore && globalPartial && (
              <li style={{ listStyle: 'none' }}>
                <p className="search-hitsNote mobile-pad">已扫描最近的会话，更早的会话可能未覆盖</p>
              </li>
            )}
          </li>
        )}
        {!pinnedOnly && term === '' && (
          <li style={{ listStyle: 'none' }}>
            <button type="button" className="mobile-createCard" onClick={() => { setCreateCategory(undefined); setIsCreating(true) }}>
              <PlusIcon />
              新建工作区
            </button>
            <button type="button" className="mobile-createCard mobile-createCategory" onClick={() => setCategoryPrompt(true)}>
              <PlusIcon />
              新建分类
            </button>
          </li>
        )}
      </ul>
    )
  })()

  return (
    <div className="mobile">
      <header className={`mobile-header${searchOpen ? '' : ' dm-header-actions'}`}>
        <div className="mobile-headerSlot">
          {searchOpen
            ? (
              <button type="button" className="mobile-back" aria-label="返回" onClick={() => { setSearchOpen(false); setSearch('') }}>‹</button>
            )
            : (
              // 左上角三枚入口：设置 / 插件 / 自动化（只在这页出现）。
              <HeaderActions onOpenSettings={onOpenSettings} />
            )}
        </div>
        {searchOpen ? (
          <div className="mobile-headerSearch">
            <input
              type="search"
              className="mobile-headerSearchInput"
              placeholder="搜索工作区或会话…"
              aria-label="搜索工作区和会话"
              autoFocus
              value={search}
              onChange={(event) => { setSearch(event.target.value) }}
            />
          </div>
        ) : (
          <h1 className="mobile-title">工作区</h1>
        )}
        <div className="mobile-headerSlot mobile-headerSlot-right">
          {searchOpen ? (
            <button type="button" className="mobile-iconbtn" aria-label="取消搜索" onClick={() => { setSearchOpen(false); setSearch('') }}>
              <CloseIcon />
            </button>
          ) : (
            // 主题切换按钮已按用户要求删除（改主题走「设置 → 主题」），
            // 右槽只留搜索，保持右对齐、不留空档。
            <button type="button" className="mobile-iconbtn" aria-label="搜索工作区和会话" onClick={() => { setSearchOpen(true) }}>
              <SearchIcon />
            </button>
          )}
        </div>
      </header>
      <div className="mobile-quickbar" role="toolbar" aria-label="快捷操作">
        <button
          type="button"
          className={`mobile-quickchip${pinnedOnly ? ' mobile-quickchip-on' : ''}`}
          aria-pressed={pinnedOnly}
          onClick={() => { setPinnedOnly(value => !value) }}
        >
          <PinIcon />
          固定{pinnedCount > 0 ? ` ${pinnedCount}` : ''}
        </button>
        <button type="button" className="mobile-quickchip" onClick={jumpRecent}>
          <ClockIcon />
          最近访问
        </button>
        {onOpenRunOverview !== undefined && (
          <button
            type="button"
            className={'mobile-quickchip' + (runOverviewLive !== undefined && runOverviewLive > 0 ? ' mobile-quickchip-live' : '')}
            aria-label={runOverviewLive !== undefined && runOverviewLive > 0 ? `运行中 ${runOverviewLive} 个会话` : '运行中'}
            onClick={onOpenRunOverview}
          >
            <span className={runOverviewLive !== undefined && runOverviewLive > 0 ? 'quick-live-dot' : 'quick-live-dot quick-live-dot-off'} aria-hidden />
            运行中
            {runOverviewLive !== undefined && runOverviewLive > 0 && (
              <span className="quick-live-count">{runOverviewLive}</span>
            )}
          </button>
        )}
      </div>
      {!welcomeHidden && (
        <div className="mobile-welcome" role="note">
          <div className="mobile-welcomeCopy">
            <p className="mobile-welcomeTitle">配对成功 🎉 三步上手</p>
            <p className="mobile-welcomeDesc">
              ① 点一个工作区开始对话<br />
              ② 左上角 设置 → 通知：配好任务完成提醒<br />
              ③ 设置 → 用量：随时查看余额与配额
            </p>
          </div>
          <button type="button" className="mobile-welcomeClose" onClick={dismissWelcome}>知道了</button>
        </div>
      )}
      {body}
      {menu !== undefined && (
        <WorkspaceMenu
          target={menu}
          pinned={pinned.includes(menu.workspace.workspaceId)}
          onClose={() => { setMenu(undefined) }}
          onPinnedChange={() => { togglePin(menu.workspace) }}
          onRename={(workspace) => { setMenu(undefined); setRenaming(workspace) }}
          onDelete={(workspace) => { setMenu(undefined); setDeleting(workspace) }}
          onPurge={(workspace) => { setMenu(undefined); setPurging(workspace) }}
          onMoveCategory={() => {
            const workspace = menu?.workspace
            setMenu(undefined)
            if (workspace !== undefined) setMoveTarget(workspace)
          }}
        />
      )}
      {categoryPrompt && (
        <PromptDialog
          title="新建分类"
          initial=""
          confirmLabel="创建"
          onCancel={() => { setCategoryPrompt(false) }}
          onConfirm={(value) => { setCategoryPrompt(false); addCategory(value) }}
        />
      )}
      {categoryMenu !== undefined && (
        <Sheet
          title={categories.find((item) => item.id === categoryMenu)?.name ?? '分类'}
          onClose={() => { setCategoryMenu(undefined) }}
        >
          <div role="menu" aria-label="分类操作">
            <button
              type="button"
              role="menuitem"
              className="sheet-option"
              onClick={() => {
                const category = categories.find((item) => item.id === categoryMenu)
                setCategoryMenu(undefined)
                if (category !== undefined) setRenamingCategory(category)
              }}
            >
              <span className="sheet-option-copy"><span className="sheet-option-title">重命名分类</span></span>
            </button>
            <button
              type="button"
              role="menuitem"
              className="sheet-option"
              onClick={() => { if (categoryMenu !== undefined) deleteCategory(categoryMenu) }}
            >
              <span className="sheet-option-copy">
                <span className="sheet-option-title" style={{ color: 'var(--danger)' }}>删除分类（工作区回到未分类）</span>
              </span>
            </button>
          </div>
        </Sheet>
      )}
      {renamingCategory !== undefined && (
        <PromptDialog
          title="重命名分类"
          initial={renamingCategory.name}
          confirmLabel="保存"
          onCancel={() => { setRenamingCategory(undefined) }}
          onConfirm={(value) => { renameCategory(renamingCategory.id, value) }}
        />
      )}
      {moveTarget !== undefined && (
        <Sheet title="移动到分类" onClose={() => { setMoveTarget(undefined) }}>
          <div role="menu" aria-label="移动到分类">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                role="menuitem"
                className="sheet-option"
                onClick={() => {
                  setWorkspaceCategory(moveTarget.workspaceId, category.id)
                  setMoveTarget(undefined)
                  toast(`已移动到「${category.name}」`)
                }}
              >
                <span className="sheet-option-copy"><span className="sheet-option-title">{category.name}</span></span>
              </button>
            ))}
            <button
              type="button"
              role="menuitem"
              className="sheet-option"
              onClick={() => {
                setWorkspaceCategory(moveTarget.workspaceId, undefined)
                setMoveTarget(undefined)
                toast('已移出分类')
              }}
            >
              <span className="sheet-option-copy">
                <span className="sheet-option-title" style={{ color: 'var(--text-tertiary)' }}>未分类</span>
              </span>
            </button>
            {categories.length === 0 && (
              <p className="settings-note">还没有分类，先点「新建分类」。</p>
            )}
          </div>
        </Sheet>
      )}
      {renaming !== undefined && (
        <PromptDialog
          title="重命名工作区"
          initial={renaming.title}
          confirmLabel="保存"
          busy={busy}
          onCancel={() => { setRenaming(undefined) }}
          onConfirm={(value) => { void handleRename(renaming, value) }}
        />
      )}
      {deleting !== undefined && (
        <ConfirmDialog
          title="删除工作区"
          body={<>确定删除「{deleting.title}」吗？目录、文件与会话记录都会保留，仅移除这里的工作区入口。</>}
          confirmLabel="删除"
          tone="danger"
          busy={busy}
          onCancel={() => { setDeleting(undefined) }}
          onConfirm={() => { void handleDelete(deleting) }}
        />
      )}
      {purging !== undefined && (
        <PurgeWorkspaceSheet
          workspace={{
            workspaceId: purging.workspaceId,
            title: purging.title,
            path: purging.path,
            sessionCount: (purging.sessionIds ?? []).length,
          }}
          onClose={() => { setPurging(undefined) }}
          onDone={() => {
            setItems(previous => previous?.filter(row => row.workspaceId !== purging.workspaceId) ?? previous)
            setRecents(previous => removeRecent(previous, purging.workspaceId))
            setPurging(undefined)
          }}
        />
      )}
    </div>
  )
}
