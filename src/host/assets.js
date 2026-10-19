/**
 * 静态资源：assets/ 下 bundle/图标/主题，带 mtime 校验的进程内缓存。
 * 本文件位于 src/host/，仓库根的 assets/ 用两个 ../ 定位。
 */
import { readFileSync, existsSync, mkdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SHOT_DIR } from './config.js'

export const assetCache = new Map()
/**
 * 读取 assets 下的静态资源，**按文件 mtime/size 失效**。
 *
 * 原来是"首次读盘后永久缓存"：改了 mobile.bundle.js 之后即使重载插件，
 * 线上拿到的还是旧内容（只有重启 dsh 才会重新读）—— bundle 里的改动因此
 * 无法通过普通 reload 生效。现在每次请求 stat 一次（开销可忽略），
 * mtime 或大小变了就重新读盘；其余情况仍走内存缓存。
 */
export function asset(name) {
  const file = join(__dirname, 'assets', name)
  let mtimeMs = 0
  let size = -1
  try {
    const st = statSync(file)
    mtimeMs = st.mtimeMs
    size = st.size
  } catch {}
  const hit = assetCache.get(name)
  if (hit !== undefined && hit.mtimeMs === mtimeMs && hit.size === size) return hit.data
  const data = readFileSync(file)
  assetCache.set(name, { mtimeMs, size, data })
  return data
}
/** bundle 版本号：用 mtime，bundle 一变 URL 就变，手机不会再用旧模块。 */
export function bundleVersion() {
  try { return String(Math.floor(statSync(join(__dirname, 'assets', 'mobile.bundle.js')).mtimeMs)) } catch { return '0' }
}

export function assetText(name) {
  return asset(name).toString('utf8')
}

// ── 可见视口高度变量 --dm-vh ──────────────────────────────────────────────
// 手机端右侧竖向滚动条的第二层根因（第一层是 7729f83 修的 body 站位按钮）。
//
// bundle 的根容器（assets/mobile.bundle.js，禁止改）这样写：
//     #root { height: 100vh; height: 100dvh; }
// 100dvh 是对的，但**老 WebView（夸克 Quark / 鸿蒙 ArkWeb）不认 dvh**
// → 整条声明作废 → 落到上一行的 100vh 兜底。而 100vh 是**大视口高度**
// （地址栏收起时的高度），比当前可见区高 K px，于是 #root 被撑成
// 「可见高 + K」，文档溢出 K → 视口右侧冒出一条竖向滚动条。
//
// 修法：这里算出**实际可见高度**，写进 documentElement 的 --dm-vh，
// 由 theme.css 的 `height: var(--dm-vh, 100vh)` 覆盖掉那条 100vh 兜底。
//
// 必须放在最前面：--dm-vh 要在首帧之前就有值，否则第一帧仍是溢出布局；
// 本脚本只写 style、不碰 DOM 结构，先跑对后面的注入脚本无副作用。
//
// 防键盘抖动（红线）：visualViewport 在地址栏收展、软键盘弹出时高频变化。
//   ① rAF 合并：一帧内的多次事件只写一次属性；
//   ② 2px 阈值：变化不足 2px 直接忽略。取 2 而不是 1，是因为高度要先
//      Math.round 成整像素，而键盘动画期间的亚像素噪声经取整后**恰好会
//      产生 1px 的假变化**；阈值取 2 才能把这批噪声全部滤掉（仿真实测：
//      阈值 1 时 844±0.5 的噪声仍会写 2 次，阈值 2 时为 0 次）。
//      真实视口变化（地址栏收展几十 px、软键盘几百 px）远大于它，不受影响。
// 只有超阈值才真正触发一次 style 写入 + 重排。
//
// ── 另一个更隐蔽的坑：WebView 误报离线导致「丢图」 ─────────────────────
// bundle 的发消息路径里有一道硬拦截（assets/mobile.bundle.js，禁止改）：
//     if (navigator.onLine === false) {
//       ...
//       Ze.length > 0 && K('图片需联网发送，本次仅保存文本'); // ← 图片被丢掉
//       // 只把 text 存进离线 outbox，然后 return
//     }
// 也就是说：只要 WebView 把 navigator.onLine 误报成 false，用户选好的图片
// 就不会进 content，会话里那条 user/message 只剩 text 块 —— 正是「间歇性丢图」。
// 夸克 / 鸿蒙 ArkWeb 在代理网络、无默认路由、从后台恢复等场景会误报离线。
//
// 修法：在任何页面脚本（包括 bundle 的 module）之前，把 navigator.onLine 的
// **读取结果**固定为 true。只改这一个属性，不动 navigator 的其它字段，也不改
// 网络栈本身：真正断网时 prompt 请求照样失败并弹出「发送失败」，而不是把图片
// 静默吞掉。defineProperty 在个别 WebView 上会抛（属性不可配置），try/catch
// 静默跳过 —— 页面继续按原样运行，最坏退回旧行为，不影响其它功能。
//
// 位置：必须放进 <head>、在 bundle 之前。bundle 是 type="module"（defer），
// 发送时读的又是实时值；head 里的同步脚本仍然最早，能覆盖「模块初始化时读一次」
// 的实现，也不会被 bundle 的加载时机影响。
export const __dirname = fileURLToPath(new URL('../../', import.meta.url))
export function ensureShotDir() {
  try {
    mkdirSync(SHOT_DIR, { recursive: true })
  } catch {}
}
