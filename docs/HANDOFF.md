# 交接单：宿主架构收尾（SSE 状态 + RPC 注册表）

状态：`src/host/` 已有 7 个模块；`index.js` 35 行；`core.js` 5,759 行。
本轮只做完 pages.js，下面两件事按「每轮一件」的纪律留给下一轮。

## 一、SSE 状态搬出闭包（约 760 行，13 个函数）

位置：`src/host/core.js` 4389–5150 行。

函数清单：`addObservation / addObservationExtra / removeObservation / releaseDevice /
noteStepEvent / streamStateFor / assistantStreamEvent / replayAssistantSnapshot /
ensureFollow / stopFollow / emitQueue / forgetQueue / openMux`（含内部 `closeStream`、
心跳与生命期定时器）。

依赖（需要作为 host 回调注入）：
`sc()`（sessionController）、`agents`、`sendJson / readJsonBody / authenticatedDevice`、
`emitMux`（已在 sse.js）、`queueItemView / muxLineOf`（已在 sse.js）、`pending`、
`pending.byApprovalId`、state bag 中各容器、`parentOfSubagent`、`ctx.get('subagents')`、
`MUX_ALWAYS_FORWARDED` / `MAX_*` 常量。

### 施工顺序
1. 新建 `createSseRuntime({ state, host })`，`host` 用对象字面量一次性列全
2. 按依赖从下往上搬：`forgetQueue` → `assistantStreamEvent` / `streamStateFor` / `noteStepEvent`
   → `emitQueue` → `ensureFollow` / `stopFollow` → `openMux`（含 closeStream / 定时器）
3. 函数体里的裸标识符逐个改成 `host.xxx`（约 200+ 处）

### 每搬 2–3 个函数必须做的回归（唯一能证明没搬坏的方式）
- `GET /m/api/events.mux` 能收到帧
- 建临时会话 → `session.prompt` → SSE 收到 `user/message`（打印帧类型/条数）
- 对某会话 `stopFollow` 后再 prompt，确认不再推该会话帧
- 等 ≥30s 确认 `: ping` 心跳
- 8 次加载 `/m/` pageerror = 0
- 归档临时会话；不碰基线设备

## 二、RPC 注册表（70 个 case → Map）

1. 先建 `src/host/rpc/index.js`：`Map<method, handler>` + 统一 `{ ok:false, error:{code,message} }` 包装
2. 再按域拆 `session / workspace / settings / models / plugins / device / mobile`
3. handler 签名统一 `(payload, bag) => Promise<Result>`

验收：
- **70 个方法名集合前后 diff 为空**
- 故意让一个 handler 抛错，其它方法与其它设备不受影响
- 8 次加载 pageerror = 0

## 三、纪律（沿用）

- 纯搬迁，行为零变化；某一步对不上就回退该步并如实报告
- 每步 `node --check` → 热重载 → 冒烟 → commit → push → `cd E:/desk/dsh-mobile && git pull --ff-only`
- `assets/mobile.bundle.js(.map)` 不提交（由 lead 统一重建）
- 热重载：备份 `~/.dsh/profiles/desktop/cordis.patch.yml` → 末尾加注释 → 等 12s → 原字节还原（sha256 前后一致）
- 冒烟口径不要写死条目数：命令面板行数随技能目录变化（当前 36 行），用「搬前搬后一致」或从 RPC 取真实条数
