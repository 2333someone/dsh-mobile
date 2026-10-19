# 交接单：宿主架构收尾（SSE 状态 + RPC 注册表）

状态：`src/host/` 已有 8 个模块；`index.js` 35 行；`core.js` **5,228 行**（本轮起点 5,759）；
`sse.js` **677 行**（本轮起点 81）。**SSE 状态已全部搬完**（group 1–4），
剩下的 `RPC 注册表` 是下一轮的独立项目。

## 一、SSE 状态搬出闭包 —— ✅ 已完成（group 1–4）

`createSseRuntime({ state, host })` 现在持有整个 SSE 运行时，`core.js` 里只剩
`state` 别名、`getQueueItems` 注入点和路由调用点。

| 组 | commit | 内容 |
| --- | --- | --- |
| 1 | `2abbc66` | `forgetQueue / streamStateFor / noteStepEvent / assistantStreamEvent`（无 host 依赖） |
| 2 | `952345f` | `emitQueue` + 注入 `getQueueItems(sessionId)` |
| 3 | `834acf2` | `ensureFollow / stopFollow / anyoneObserving / lastObservedAt / addressForSession / replayAssistantSnapshot / buildAssistantChunkEvent / expandSnapshotStream` + 修 group-1 遗留 bug（见下） |
| 4 | `7bbfd3f` | `openMux`（含 `closeStream`、`: ping` 心跳、2s 观察同步节拍、连接寿命定时器、开场 pending 快照） |

注入清单（`host`，全部集中在 `core.js` 顶部那一个对象字面量里）：
`getQueueItems`、`follow`（`sessionController.follow` 的箭头包装，避开 `sc` 的 TDZ）、
`subagentParent`（getter）、`parentOfSubagent`、`authenticatedDevice` / `deviceTokensOf`
（getter，二者在 `createDeviceAuth` 之后才声明）、`devices`、`mobileReason`、
`purgePending`、`observedSessions`、`releaseDevice`。

state bag 依赖（`src/host/state.js` 已有，不需要再加）：`observers`、`lastObserved`、
`lastObservedByDevice`、`follows`、`streamStates`、`muxStreams`、`lastPersistedSeq`、
`lastStep`、`pending`。

### ⚠️ 本轮发现并修复的既有 bug（`2abbc66` 引入）

group 1 把 `assistantStreamEvent` 搬进 `sse.js` 时，**漏搬它的依赖
`buildAssistantChunkEvent`，也没 import**：`sse.js:200` 指向未定义标识符。
纯函数复现（`.dsh-scratch/prove-chunk-bug.mjs`）：

```
createSseRuntime(...).assistantStreamEvent(sid, {type:'chunk', chunk:{type:'text-delta',text:'x'}})
→ ReferenceError: buildAssistantChunkEvent is not defined
```

后果：每来一个 live chunk，`ensureFollow` 的 `for-await` 就抛 → `catch` → 3s 退避重启
follow，手机端流式逐字退化（不是白屏，所以冒烟与 8 次加载都发现不了）。
group 3 已把 `buildAssistantChunkEvent / expandSnapshotStream` 搬回流式状态组，修复后
真跑实测 `assistant/chunk` 101 条且都带 `turn/step`。

**教训**：搬家必须 grep 全部引用；`node --check` 与冒烟**都查不出未定义标识符**，
只有「真跑一轮生成 + 单测直接调用」能查出来。

### 回归口径（保持）

- `node --check src/host/core.js && node --check src/host/sse.js`
- `npm run smoke`（ALL PASS 6/6）
- **单测** `.dsh-scratch/unit-sse-g3.mjs`：假 host 驱动 `ensureFollow`（snapshot/event/chunk
  四种帧）+ `stopFollow` 收尾，14 条断言，不碰宿主、秒级，改 follow/stream 必跑
- **真回归** `.dsh-scratch/live-follow-check.mjs`：临时会话 → prompt → SSE 收 `user/message`
  与 `assistant/chunk`（带 turn/step）→ 切走观察后（**不 prompt**）该会话帧 = 0 → 归档
- **SSE 面** `.dsh-scratch/lead-sse-check.mjs` / `.dsh-scratch/verify-sse.mjs`（后者由
  sse-verifier 维护：帧直方图 / queue 形状 / 40s 心跳 / 8 次加载 pageerror / HEAD 指纹）

⚠️ 两个容易写出假 FAIL 的坑：
1. `session.prompt` 内部会 `observeSession`（并集重新登记观察），这是刻意的
   （修「发完气泡不出现、退出重进才见」）。所以「切走后 prompt 还能收到帧」是**正确行为**，
   不能拿来验证 `stopFollow`；要验就用「切走后不 prompt」的静默窗口，或直接信单测。
2. `session/queue` 在 `MUX_ALWAYS_FORWARDED` 里，任何会话的队列帧都推给所有流；
   断言只校验**形状**，别断言 `sessionId` 等于刚 observe 的那个。

## 二、RPC 注册表（70 个 case → Map）—— 下一轮的独立项目

1. 先建 `src/host/rpc/index.js`：`Map<method, handler>` + 统一 `{ ok:false, error:{code,message} }` 包装
2. 再按域拆 `session / workspace / settings / models / plugins / device / mobile`
3. handler 签名统一 `(payload, bag) => Promise<Result>`

动手前先把方法名**枚举出来对账**：当前 `core.js` 里带点的 `case 'x.y'` 有 **63 个唯一值**，
而 `docs/CONTRACT.md` 记的是 **64 个 RPC 方法**（+6 个 HTTP 面 = 70）。差的这一个要先查清
（大概率在 switch 之外单独接了），否则「方法集合 diff 为空」这条验收从一开始就不成立。

验收：
- **70 个方法名集合前后 diff 为空**
- 故意让一个 handler 抛错，其它方法与其它设备不受影响
- 8 次加载 pageerror = 0

> 本轮已用更直接的方式核对过一次：`git diff c178c9e..HEAD -- src/host/core.js` 里
> **没有任何 `case '...'` 行变化**，且新旧方法名集合逐字 diff 为空（63 vs 63）。
> 交接单原来给的 `md5 = 5ae4718a…` 取数口径未复现（试了 3 种配方都不等），
> 下一轮请先确认 md5 是怎么算的，否则别拿它当判据。

## 三、纪律（沿用）

- 纯搬迁，行为零变化；某一步对不上就回退该步并如实报告
- 每步 `node --check` → 热重载 → 冒烟 → commit → push → `cd E:/desk/dsh-mobile && git pull --ff-only`
- `assets/mobile.bundle.js(.map)` 不提交（由 lead 统一重建）
- 热重载：备份 `~/.dsh/profiles/desktop/cordis.patch.yml` → 末尾加注释 → 等 12s → 原字节还原（sha256 前后一致）
- 冒烟口径不要写死条目数：命令面板行数随技能目录变化（当前 36 行），用「搬前搬后一致」或从 RPC 取真实条数

### 本轮新增的保命操作

1. **WIP 先存档再 reload**：`git diff > .dsh-scratch/wip-<step>.patch`。本轮曾两次遇到
   「工作区里一批 tracked 文件在 reload 前后被外部删除」（13 个文件，含 `index.js`、
   `src/host/core.js`、`src/host/sse.js`），第二次直接把未提交的 group 3 改动清空。
   恢复方法：`git checkout -- <精确路径>`（1 秒），再 `git apply .dsh-scratch/wip-*.patch`。
   **触发条件未知**（不是 sync 进程、不是 git stash；`.dsh-scratch/` 与 node_modules 不受影响），
   但「先存档再 reload」能把损失压到 0。
2. **插件掉线先看文件在不在**：`curl 127.0.0.1:19387/m/` 连不上时，先
   `ls index.js src/host/core.js`；入口文件被删 → reload 必然 import 失败，
   与代码改动无关。恢复文件后重新触发热重载即可。
3. **大段搬迁用脚本抽取**（`.dsh-scratch/apply-g4.mjs`）：openMux 185 行是先按 marker 切片、
   正则改写 `host.*`、再拼回 `sse.js`，避免手抄漏标识符。这类脚本可直接复用。

## 进度记录

- 2026-10-19 `2abbc66` **group 1 完成**：`forgetQueue / streamStateFor / noteStepEvent /
  assistantStreamEvent` 进 `createSseRuntime({ state })`。`sse.js` 81 → 204 行。
- 2026-10-19 `952345f` **group 2 完成**：`emitQueue` 搬入，注入 `getQueueItems`；
  8 个调用点靠解构保持不变。冒烟 6/6、`session/queue` 帧形状实测通过。
- 2026-10-19 `834acf2` **group 3 完成 + 修复 group-1 回归**：follow 生命周期 8 个函数搬入；
  `buildAssistantChunkEvent / expandSnapshotStream` 补搬（修复 ReferenceError）；
  单测 14/14、真跑 `assistant/chunk` 101 条带 turn/step。
- 2026-10-19 `7bbfd3f` **group 4 完成**：`openMux` 整块搬入（含心跳 / 同步节拍 / 寿命定时器）；
  实测 events.mux 200、`: ping`、381 帧、queue 形状正确，live-follow 全 PASS。
- **下一步**：RPC 注册表（`src/host/rpc/`，7 个域文件），先对账 63 vs 64 的方法名差异。
