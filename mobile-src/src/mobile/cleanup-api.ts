/**
 * 删除/清理相关的手机端 API 与本地状态：
 *   · 会话文件清单（日志 + 本会话写过的文件）
 *   · 文件删除（回收站 / 彻底删除）
 *   · 会话永久删除（归档墓碑 + 会话目录进回收站）
 *   · 回收站列表 / 恢复 / 清空
 *   · 仅本机隐藏（localStorage；不动宿主）
 *
 * 宿主实现见 src/host/cleanup.js；所有会破坏数据的动作都在宿主执行，
 * 这里只负责发起与本地缓存。
 */
import { callUnary } from './rpc.ts'

/** One deletable file inside a session's cleanup list. */
export interface SessionFileEntry {
  group: 'logs' | 'generated'
  path: string
  name: string
  bytes: number
  mtime: number
  insideWorkspace: boolean
  tool?: string
  count?: number
}

/** Grouped session-file listing returned by `session.files.list`. */
export interface SessionFilesResult {
  found: boolean
  dir?: string
  cwd?: string
  groups: Array<{ kind: 'logs' | 'generated'; title: string; files: SessionFileEntry[] }>
  bytes: number
}

/** One trash journal entry (a reversible deletion). */
export interface TrashEntry {
  id: string
  kind: 'session' | 'files' | 'workspace'
  sessionId?: string
  title?: string
  hard: boolean
  removedAt: number
  items: Array<{ kind: string; from: string; to?: string }>
}

/** Result of a permanent session delete. */
export interface PurgeSessionResult {
  sessionId: string
  trashId?: string
  hard: boolean
  dir?: string
}

/** List the files a session can clean (log + files it wrote). */
export async function sessionFiles(sessionId: string): Promise<SessionFilesResult> {
  return await callUnary<SessionFilesResult>('session.files.list', { sessionId })
}

/** Move (or permanently delete) selected files from the session's list. */
export async function deleteSessionFiles(sessionId: string, paths: string[], hard = false): Promise<{
  moved: Array<{ from: string; to?: string; kind: string }>
  missing: string[]
  trashId?: string
}> {
  return await callUnary('session.files.delete', { sessionId, paths, hard })
}

/** Permanently delete a session: archive tombstone + session dir to trash. */
export async function purgeSession(sessionId: string, options: { hard?: boolean; allowProtected?: boolean; title?: string } = {}): Promise<PurgeSessionResult> {
  return await callUnary<PurgeSessionResult>('session.purge', {
    sessionId,
    ...(options.hard === true ? { hard: true } : {}),
    ...(options.allowProtected === true ? { allowProtected: true } : {}),
    ...(options.title === undefined ? {} : { title: options.title }),
  })
}

/** Undo an archive from the action sheet (host unarchive). */
export async function unarchiveSession(sessionId: string): Promise<{ archivedSessionIds: string[] }> {
  return await callUnary<{ archivedSessionIds: string[] }>('workspace.unarchiveSession', { sessionId })
}

/** Read the trash journal + counters. */
export async function readTrash(): Promise<{ items: TrashEntry[]; stats: { entries: number; sessions: number } }> {
  return await callUnary('trash.list', {})
}

/** Restore one trash entry (session records also get unarchived host-side). */
export async function restoreTrashEntry(entryId: string): Promise<{ restored: Array<{ from: string; to: string }> }> {
  return await callUnary('trash.restore', { entryId })
}

/** Permanently drop everything still in the trash. */
export async function emptyTrash(): Promise<{ removed: number }> {
  return await callUnary('trash.empty', {})
}

/** Remove + clean a workspace (sessions first, optional dir move to trash). */
export async function purgeWorkspace(workspaceId: string, options: {
  deleteWorkspaceFiles?: boolean
  confirmPath?: string
} = {}): Promise<{
  purged: string[]
  skipped: Array<{ sessionId: string; reason: string }>
  failed: Array<{ sessionId: string; reason?: string }>
  workspaceTrashId?: string
}> {
  return await callUnary('workspace.purge', {
    workspaceId,
    ...(options.deleteWorkspaceFiles === true ? { deleteWorkspaceFiles: true } : {}),
    ...(options.confirmPath === undefined ? {} : { confirmPath: options.confirmPath }),
  })
}

/* ── 仅本机隐藏（localStorage，与宿主无关） ─────────────────────────────── */

const LOCAL_HIDDEN_KEY = 'dsh.palm.hiddenSessions'
const listeners = new Set<(ids: ReadonlySet<string>) => void>()

function readLocalHidden(): Set<string> {
  try {
    const raw = localStorage.getItem(LOCAL_HIDDEN_KEY)
    const parsed: unknown = raw === null ? [] : JSON.parse(raw)
    return new Set(Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [])
  } catch {
    return new Set()
  }
}

let localHiddenCache: Set<string> | undefined

/** Current device-local hidden session ids. */
export function getLocalHidden(): ReadonlySet<string> {
  if (localHiddenCache === undefined) localHiddenCache = readLocalHidden()
  return localHiddenCache
}

/** Subscribe to device-local hide changes (returns the unsubscribe). */
export function onLocalHiddenChange(listener: (ids: ReadonlySet<string>) => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

function writeLocalHidden(ids: Set<string>): void {
  localHiddenCache = ids
  try {
    localStorage.setItem(LOCAL_HIDDEN_KEY, JSON.stringify([...ids]))
  } catch {}
  for (const listener of [...listeners]) listener(ids)
}

/** Hide one session on this device only (host data untouched). */
export function hideSessionLocally(sessionId: string): void {
  const ids = new Set(getLocalHidden())
  ids.add(sessionId)
  writeLocalHidden(ids)
}

/** Undo {@link hideSessionLocally}. */
export function unhideSessionLocally(sessionId: string): void {
  const ids = new Set(getLocalHidden())
  if (!ids.delete(sessionId)) return
  writeLocalHidden(ids)
}

/** Human readable byte size (B / KB / MB / GB). */
export function formatBytes(bytes: number | undefined): string {
  if (bytes === undefined || !Number.isFinite(bytes) || bytes < 0) return '—'
  if (bytes < 1024) return `${Math.round(bytes)} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10240 ? 1 : 0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}
