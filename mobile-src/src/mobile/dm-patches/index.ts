/**
 * 迁移 C：行为补丁的安装器（见各模块头注释）。
 * 需要早于 bundle 的基础设施（ONLINE_GUARD / MUTATION_BUS / VIEWPORT_VH）仍在
 * HTML 里注入；其余由这里在 bundle 启动时按原顺序安装。
 */
import { SEND_DECODE_GUARD_HTML } from './send-decode-guard.ts'
import { SHEET_CLOSE_HTML } from './sheet-close.ts'
import { PERMISSION_BTN_HTML } from './permission-btn.ts'
import { SEND_MODE_HTML } from './send-mode.ts'
import { CHAT_STATUS_HTML } from './chat-status.ts'
// SEND_MODE_SETTINGS_HTML 不再安装：SettingsView 自己已经渲染了「发送模式」行
//（见 views/SettingsView.tsx 的 sendmode 行，绑定同一个 window.__dmSendMode），
// 再注入一份会在设置页出现两行同样的设置（一行在「外观」、一行在「对话」），
// 用户会看到重复项。文件先留着，方便需要时对照。
import { DEVICE_INFO_HTML } from './device-info.ts'
import { NOTIFY_LAYOUT_HTML } from './notify-layout.ts'
import { IMAGE_PREVIEW_HTML } from './image-preview.ts'
import { CHAT_AUTOSCROLL_HTML } from './chat-autoscroll.ts'
import { LOAD_OLDER_ALIGN_HTML } from './load-older-align.ts'

const PATCH_ORDER: readonly string[] = [
  SEND_DECODE_GUARD_HTML,
  SHEET_CLOSE_HTML,
  PERMISSION_BTN_HTML,
  SEND_MODE_HTML,
  CHAT_STATUS_HTML,
  DEVICE_INFO_HTML,
  NOTIFY_LAYOUT_HTML,
  IMAGE_PREVIEW_HTML,
  CHAT_AUTOSCROLL_HTML,
  LOAD_OLDER_ALIGN_HTML
]

let installed = false

export function installDmPatches(): void {
  if (installed || typeof document === 'undefined') return
  installed = true
  for (const html of PATCH_ORDER) installOne(html)
}

function installOne(html: string): void {
  const template = document.createElement('template')
  template.innerHTML = html
  const nodes = Array.from(template.content.childNodes)
  for (const node of nodes) {
    if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'SCRIPT') {
      const script = document.createElement('script')
      script.textContent = (node as HTMLScriptElement).textContent ?? ''
      document.body.appendChild(script)
      continue
    }
    document.body.appendChild(node)
  }
}
