# dsh-mobile 契约（RPC + HTTP）

本文件是**手机端与宿主之间的接口契约**，也是 `npm run smoke` 的判据来源。
改返回字段 / 改路由前先读这里；改完同步更新本文件与 `test/smoke.mjs`。

- 冒烟：`npm run smoke`（等价 `node test/smoke.mjs`）。默认打 `http://127.0.0.1:19387`，
  用 `DSH_MOBILE_BASE` / `DSH_MOBILE_COOKIE` 覆盖；cookie 缺省读
  `~/.dsh/dsh-mobile-devices.json` 里第一台设备。
- 单次运行约 1s，6 条检查；任何一条 FAIL → 退出码 1。
- 约束：冒烟只复用一个**已归档探测会话**做 prompt→history 往返（首次会新建一次并归档），
  不注册设备、不写 `cordis.patch.yml`、不写仓库文件。

---

## 1. 传输层

### 1.1 RPC 信封

```
POST /m/api/<method>
Content-Type: application/json
Cookie: dsh_mobile=<device token>

{ "rpcId": "<string>", "payload": { ... } }
```

成功：

```json
{ "type": "server-response", "rpcId": "<string>", "result": { "ok": true, "value": { ... } } }
```

失败（HTTP 仍可能是 200，**必须看 `result.ok`**）：

```json
{ "type": "server-response", "rpcId": "<string>", "result": { "ok": false, "error": { "code": "bad-request", "message": "…" } } }
```

- 鉴权：未配对 / cookie 无效 → HTTP **401/403**（不是重定向）。
- `payload` 大小上限：普通方法 1MB 级，`session.prompt` 与 `mobile.transcribe` 单独放大
  （音频约 12MB）。
- SSE 长连接：`GET /m/api/events.mux`（实时帧）、`GET /m/api/events.notify`（通知）。

### 1.2 页面与静态资源

| 路由 | 说明 |
| --- | --- |
| `GET /m` | 302 → `/m/` |
| `GET /m/` | 手机页外壳。**永远 200**；未配对也返回静态外壳，门禁在 API 层。带 cookie 时 HTML 引用 `mobile.js?v=<bundle 版本>`；启用 gzip/br |
| `GET /m/mobile.js` | 打包后的前端 bundle；带 `?v=` 时 `Cache-Control: public, max-age=31536000, immutable`，不带时 `no-store` |
| `GET /m/theme.css` | 补充样式表（桌面/移动共用主题层） |
| `GET /m/shot/<file>` | 只读截图：只读 `~/.dsh/dsh-mobile-shots/<file>`，不需要配对 |
| `GET /m/manifest.webmanifest`、`/m/icon*.png`、`/m/apple-touch-icon.png` | PWA 资源 |

### 1.3 配对端点（重要）

| 路由 | 说明 |
| --- | --- |
| **`POST /api/pair/accept`** | **手机端配对入口**。JSON body：`{ "code": "<配对码>" }` 或 `{ "token": "<一次性 token>" }`。成功 → `200 { ok:true, deviceId }` + `Set-Cookie: dsh_mobile=…; Path=/; HttpOnly; SameSite=Lax`；无效码 → `404 { ok:false, code:"invalid" }` |
| `POST /api/pair/issue` | 桌面/回环侧签发配对码（仅回环） |
| `GET /api/pair/status` | 桌面面板状态流（仅回环） |
| `POST /api/device/revoke`、`POST /api/domain` | 桌面设置面板（仅回环） |

> ⚠️ **不要写成 `/m/api/pair/accept`**。`/m/api/pair/accept` 会落进回环设置面板的
> `POST /pair/accept` 处理器（`requireLoopback` 路径、语义不同），手机端从它读不到
> 配对 body。手机 bundle 里写死的地址就是 `/api/pair/accept`，宿主也在 `routeRequest`
> 里用 `pairAcceptCompat` 精确接住它（读 JSON body、回 `Set-Cookie`）。

---

## 2. RPC 方法表

`payload` 列只列**关键入参**（省略的字段有默认值）。`value` 列是 `result.value` 的顶层形状。
共 **64 个 RPC 方法**；加上第 1 节的 6 类 HTTP 契约面（页面 / bundle / 样式 / RPC 信封 /
SSE / 截图），即对外 **70 个契约面**。

### 2.1 session.*

| 方法 | 关键入参 | value 形状 |
| --- | --- | --- |
| `session.list` | `cursor?` | `{ items: SessionView[] }`（已剔除归档集合；item 至少含 `sessionId`、`updatedAt`，通常还有 `title`/`agentAvailable`/`formatStatus`） |
| `session.history` | `sessionId`、`beforeSeq?`、`maxMessages?`、`parentSessionId?`、`subscribe?` | `{ sessionId, events: [{ seq, event }], hasMore, projections }`；`subscribe:true` 会为设备登记跟随 |
| `session.prompt` | `sessionId`、`content: [{type:'text',text} | {type:'image',…}]`、`mode?: 'queue'|'steer'`、`clientTimeZone?` | 控制器结果（含 `accepted`；queue/steer 取决于 `mode`，带非文本块时强制 queue） |
| `session.create` | `workspaceId?`、`cwd?`、`sessionId?`、`agentPreset?` | `{ sessionId, agentPreset? }` |
| `session.models` | — | `{ current, routable, groups, failures }` |
| `session.selectModel` | `sessionId`、`provider`、`model`、`reasoningEffort?` | `{ selected }` |
| `session.rename` | `sessionId`、`title` | `{ title, seq }` |
| `session.cancel` | `sessionId` | `{ accepted: true }` |
| `session.updateQueue` | `sessionId`、`itemId`、`action` | `{ accepted: true }` |
| `session.search` | `query`、`limit?` | `{ items, hasMore }` |

### 2.2 workspace.*

| 方法 | 关键入参 | value 形状 |
| --- | --- | --- |
| `workspace.list` | — | `{ items: [{ workspaceId, path, title, sessionIds }], archivedSessionIds }` |
| `workspace.create` | `path`、`title?` | `{ workspace, created }`（bundle 读 `.workspace`） |
| `workspace.rename` | `workspaceId`、`title` | 控制器结果（工作区视图） |
| `workspace.delete` | `workspaceId` | `{ deleted: true }` |
| `workspace.archiveSession` | `sessionId` | `{ archivedSessionIds }`；受保护会话 → `code:'protected'` |
| `workspace.unarchiveSession` | `sessionId` | `{ archivedSessionIds }` |

### 2.3 mobile.*（只读面）

| 方法 | 关键入参 | value 形状 |
| --- | --- | --- |
| `mobile.preferences` | — | `{ sendMode, mobileEnterToSend, githubUrl, version }` |
| `mobile.runningSessions` | — | `{ sessionIds }` |
| `mobile.pending` | `sessionId?` | `{ approvals, questions, sessions }`（不传 sessionId = 全局汇总） |
| `mobile.commands` | `sessionId?` | `{ available, items, live, sessionId, reason? }` |
| `mobile.skills` | `sessionId` | `{ available, items, sessionId, reason? }` |
| `mobile.plugins` | — | `{ groups: { basic, extensions, installed }, counts, source }` |
| `mobile.automations` | — | `{ items, counts: { total, active }, source }` |
| `mobile.builtinConfig.pages` | — | `{ pages }` |
| `mobile.builtinConfig.get` | `page`（如 `subagent`） | `{ key, title, description, available, sections, models }` |
| `mobile.modelsCenter.get` | — | `{ available, readOnly, account, defaultModel, providers, catalog, profiles, counts, protocols }` |
| `mobile.permissions.get` | `sessionId?` | `{ options, currentValue, available, defaultPreset }` |
| `mobile.searchAll` | `query` | `{ items, hasMore }` |
| `mobile.searchMessages` | `query`、`sessionId?` | `{ items, hasMore }` |
| `mobile.notifyEvents` | — | `{ items }` |
| `mobile.voiceServices` | — | `{ services: [{ name, baseURL, model }] }` |
| `mobile.listDirectory` | `path?` | 目录视图（`path`、`home`、目录项） |
| `mobile.previews` | — | `{ items }` |
| `mobile.readChat` | `sessionId`、`parentSessionId?`、分页参数 | 聊天记录视图 |
| `mobile.readAttachment` | `sessionId`、`attachmentId` | `{ mediaType, dataUrl }` |
| `mobile.readFile` | `path`、`sessionId?` | `{ kind, dataUrl?, name? }`（图片上限 8MB） |
| `mobile.latestVersion` | — | `{ configured, current, latest, url, isNewer }`（自有更新源） |
| `mobile.usage` | — | `{ providers, fetchedAt }` |
| `mobile.diagnostics` | — | `{ checks }` |
| `mobile.perf` | — | `{}`（帧计数快照） |
| `mobile.observe` | `sessionId` | `{}`（登记观察） |

### 2.4 mobile.*（写入 / 动作）

| 方法 | 关键入参 | value 形状 |
| --- | --- | --- |
| `mobile.commandExec` | `sessionId`、`name`、`args?` | 命令执行结果 |
| `mobile.setAgentPreset` | `sessionId`、`agentPreset` | `{ sessionId, agentPreset }` |
| `mobile.pluginBundleEnabled` | `name`、`enabled` | `{ application }`；`dsh-mobile` 自身受保护 → `code:'mobile_bundle_protected'` |
| `mobile.pluginEntryEnabled` | `entryId`、`enabled` | `{ application }` |
| `mobile.builtinConfig.save` | `page`、`values` | 保存结果 |
| `mobile.modelsCenter.save` | 模型中心变更 payload | 保存结果 |
| `mobile.permissions.set` | `sessionId`、`preset` | 权限视图（同 `permissions.get`） |
| `mobile.respond` | `sessionId`、`requestId`、`response` | 响应结果 |
| `mobile.reportDevice` | `clientHints?` | `{ ok: true }` |
| `mobile.error` | 客户端错误信息 | 上报结果 |
| `mobile.transcribe` | `audio`（base64 WAV）、`services?` | `{ text }` |

### 2.5 settings.*

| 方法 | 关键入参 | value 形状 |
| --- | --- | --- |
| `settings.read` | — | `{ writable, hasDocument, namespaces }` |
| `settings.describe` | — | `{ writable, hasDocument, namespaces }` |
| `settings.mutate` | `ns`、`ops` | `{ ok: true }`（手机端只允许外观偏好 `ui-theme`） |

### 2.6 pair.* / agentPreset / subagent / push

| 方法 | 关键入参 | value 形状 |
| --- | --- | --- |
| `pair.devices` | — | `{ devices, maxDevices }` |
| `pair.revoke` | `deviceId` | `{ removed }` |
| `pair.rename` | `deviceId`、`name` | `{ ok: true }` |
| `pair.setPrimary` | `deviceId` | `{ ok: true }` |
| `agentPreset.list` | `sessionId?` | `{ presets, authorable, hasDocument, current?, blank? }` |
| `subagent.list` | `parentSessionId` | `{ entries: [{ id, label, mode, activity, kind, parentId, depth, hasChildren }], parentAvailable }`（只把 `kind:'child'` 当子代理） |
| `push.config` | `GET`=读；`POST`=`{ …配置 }` | 读：配置视图；写：`{ stored: true }`（另有测试推送 `{ sent: true }`） |
| `push.subscribe` | 订阅信息 | 订阅结果 |
| `push.unsubscribe` | — | `{ ok: true }` |

---

## 3. 冒烟覆盖（`test/smoke.mjs`）

| # | 检查 | 判据 |
| --- | --- | --- |
| 1 | `/m/` 应用壳 | 200；HTML 含 `mobile.js?v=`；`Accept-Encoding: gzip, br` 时 `content-encoding` 生效；`/m/mobile.js` 同样压缩 |
| 2 | 配对门禁 | 无 cookie 调 API → 401/403；无 cookie 的 `/m/` 仍是静态外壳且不含会话 id；`/api/pair/accept` 无效 code → 404 `{ok:false,code:'invalid'}`；基线 cookie → 200 且 API ok |
| 3 | 列表结构 | `session.list.value.items` 是数组、item 有 `sessionId/updatedAt`；`workspace.list.value.items` 有 `workspaceId/path/title/sessionIds`，`archivedSessionIds` 是数组 |
| 4 | 会话往返 | `session.create` → `session.prompt` → 轮询 `session.history`（≤20s）读到本次 `user/message` → `workspace.archiveSession`（复用已归档探测会话，避免每跑一次污染工作区会话数） |
| 5 | 移动面 | `mobile.pending` 三个数组；`mobile.commands` 有 `available` + `items`；`mobile.modelsCenter.get` 有 `available/readOnly/defaultModel` 且 `providers` 是数组 |
| 6 | 静态资源 | `/m/theme.css`、`/m/mobile.js` 均 200 且 content-type 正确 |

故障注入验证：把 `session.list` 的 `items` 改成字符串（本地代理代答）后，
冒烟输出 `FAIL 3. … value.items 不是数组` 且退出码 1 —— 改坏一个返回字段能被立刻发现。

---

## 4. 变更流程

1. 改返回字段/路由 → 同步改本文件与 `test/smoke.mjs` 的断言。
2. 跑 `npm run smoke`（干净服务上应 ≤60s 全绿）。
3. 前端（`mobile-src/`）消费新字段时，先在本文档登记形状，再改代码。
