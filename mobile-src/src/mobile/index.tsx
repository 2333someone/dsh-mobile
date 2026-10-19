/**
 * Mobile surface entry: the standalone phone UI served at /m. Boots its own
 * React tree (no main-UI module loader), talks to the host over the shared
 * /api transport with the paired-device cookie, and renders a deliberately
 * thin three-level surface:
 *   workspaces (landing, no new-session homepage) → sessions (paged) →
 *   chat (history paged on demand + live mux stream + prompt input).
 */

import { createRoot } from 'react-dom/client'
import { App } from './views/App.tsx'
import { ErrorBoundary } from './error-boundary.tsx'
import { mobileCss } from './mobile-styles.ts'
import { initMobileTheme } from './mobile-theme.ts'
import { applyDisplayPrefs } from './display-prefs.ts'
import { registerMobilePwa } from '../mobile-pwa.ts'
import { consumeMobilePairUrl } from './pairing.ts'
import { installDmPages } from './dm-pages/index.ts'
import { installPageMotion } from './dm-pages/page-motion.ts'
import { installDmToolbar } from './dm-toolbar/index.ts'
import { installDmPatches } from './dm-patches/index.ts'
import { installInputCenter } from './dm-patches/input-center.ts'

// Apply the persisted (or default system) theme and the local display
// preferences before first paint, so the page never flashes the wrong look.
initMobileTheme()
applyDisplayPrefs()

// Inject the standalone stylesheet (the page has no shell to load it for us).
const style = document.createElement('style')
style.dataset.plugin = 'dsh-palm/mobile'
style.textContent = mobileCss
document.head.appendChild(style)

// 迁移 A：这四个页面型注入已从宿主 index.js 搬到这里（见 dm-pages/）。
// 在 React 挂载前安装，保持「页面 DOM 先于应用」的原有时序。
// 注入页面的进出场动画入口要先装（内联脚本通过 window.__dmPageMotion 调用）。
installPageMotion()
installDmPages()
// 迁移 B：工具栏/行内控件（原 index.js 的 *_HTML 注入）。
installDmToolbar()
// 迁移 C：行为补丁（原 index.js 的 *_HTML 注入）。
installDmPatches()
installInputCenter()

const root = document.getElementById('root')
if (root === null) throw new Error('mobile: #root missing')
void bootMobile(root)

async function bootMobile(mount: HTMLElement): Promise<void> {
  const pair = await consumeMobilePairUrl(window.location.href)
  if (pair.kind === 'accepted') {
    window.location.replace(pair.path)
    return
  }
  if (pair.kind === 'failed') window.history.replaceState(null, '', pair.path)

  void registerMobilePwa()
  createRoot(mount).render(
    <ErrorBoundary>
      <App initialPairError={pair.kind === 'failed' ? pair.message : undefined} />
    </ErrorBoundary>,
  )
}
