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

## 二、RPC 注册表（64 个方法 → Map）—— 进行中，7/64 已搬

### 先纠正两个数

1. **是 64 个方法，不是 63**：交接单原先的「63」是统计口径漏了 `agentPreset.list`
   （首字母大写的域名被正则 `[a-z]+` 排除）。真实清单：
   `mobile` 36、`session` 10、`workspace` 6、`pair` 4、`push` 3、`settings` 3、
   `subagent` 1、`agentPreset` 1 = **64**（+6 个 HTTP 面 = 70 契约面）。
2. 交接单里的 `md5 = 5ae4718a…` **取数口径未复现**（试过多种拼接/排序都不等）。
   现在改用可复现的基线：`.dsh-scratch/core-methods.txt`（搬迁前从 switch 抽出的 64 个名字）
   + `.dsh-scratch/rpc-diff.mjs`（把「switch case ∪ rpc 注册表键」与基线逐字 diff，
   并打印 `md5(union)`，当前 **ae0e06a3fa5f5608ef58e0149a10f72e**）。**以这个脚本为准。**

### 已建成的基础设施

```
src/host/rpc/index.js    createRpcRegistry({ domains }) → Map<method, handler>
src/host/rpc/settings.js settings.read / settings.describe / settings.mutate   ✅
src/host/rpc/subagent.js subagent.list                                        ✅
src/host/rpc/push.js     push.config / push.subscribe / push.unsubscribe       ✅
```

- handler 签名统一 `(payload, bag) => Result`，`bag` 目前只有 `{ deviceId }`
- **注册表不捕获异常**：抛错仍由 `handleRpc` 原有的 try/catch 包成错误信封，错误码语义不变
- `dispatchRpc` 先查注册表，未命中再落 switch（**迁移期混合派发**，方法集合任何时刻都完整）
- 域工厂接收依赖（`getService / devices / persistDevices / deliverNotify / …`），
  可变状态（如 `notifyConfig`）用 `getX()/setX()` 访问器注入，别传值
- core 里后声明的依赖（`sc`、`deviceTokensOf`、`subagentParent`）用 getter/箭头推迟取值，避开 TDZ

### 搬一个域的标准动作（剩下的 57 个照这个做）

1. 新建 `src/host/rpc/<domain>.js`，导出 `create<Domain>Rpc(deps)`，方法体从 switch **原样复制**
2. core：加 import、把域加进 `rpcRegistry` 的 `domains` 数组、删掉对应 `case`（原位置留指针注释）
3. **方法集合校验**：`node .dsh-scratch/rpc-diff.mjs` → 必须仍是 64、md5 仍是 `ae0e06a3…`
4. **行为校验**：写一个只读探针（照 `.dsh-scratch/settings-probe.mjs` / `rpc-probe2.mjs`），
   reload 前后各跑一次、`diff` 输出
5. `node --check` → 热重载 → `npm run smoke` → commit → push → 镜像 `pull --ff-only`

### 剩余工作

| 域 | 方法数 | 备注 |
| --- | --- | --- |
| `mobile` | 36 | 最大，建议再拆成 mobile-read / mobile-write / mobile-plugin 三份 |
| `session` | 10 | 依赖 `controller`（`sc()`）、`captureSession` 等 |
| `workspace` | 6 | |
| `pair` | 4 | 含设备表写操作，注意 `persistDevices` |
| `agentPreset` | 1 | 可与 `session` 合一个文件 |

验收（沿用）：64 个方法名集合 diff 为空；故意让一个 handler 抛错，其它方法/设备不受影响；
8 次加载 pageerror = 0。

⚠️ 写探针的坑：**别拿 `session.list` 第一条当参数** —— 列表按 updatedAt 排序，两次运行之间
会变，会造成「搬前有数据、搬后空」的假 diff（本轮 `subagent.list` 就踩过）。
用写死的 `sessionId`，或先取稳定的那个。

## 三、纪律（沿用）

- 纯搬迁，行为零变化；某一步对不上就回退该步并如实报告
- 每步 `node --check` → 热重载 → 冒烟 → commit → push → `cd E:/desk/dsh-mobile && git pull --ff-only`
- `assets/mobile.bundle.js(.map)` 不提交（由 lead 统一重建）
- 热重载：备份 `~/.dsh/profiles/desktop/cordis.patch.yml` → 末尾加注释 → 等 12s → 原字节还原（sha256 前后一致）
- 冒烟口径不要写死条目数：命令面板行数 = 2 local + 6 host + **技能源条数**，**会漂移**
  （同一台机实测 20 → 30 → 34，随 skill 目录扩容；历史上的 36 是另一时刻的观测值）。
  搬前搬后一致的是**分类与行结构**（3 行首页 / 7 个工具栏按钮 / 面板行分类），不是固定行数

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
4. **外部 actor 会掐宿主**：本轮 22:34–22:40 观察到 `~/.dsh/profiles/desktop/cordis.patch.yml`
   的 mtime 每隔 1–2 分钟被**外部**改动并触发 reload（不是本会话操作；同一时期还两次出现
   「13 个 tracked 文件被删」）。后果：SSE 长连接被掐、40s 心跳窗口测不完整。
   所以「长窗口」验证要挑安静窗口单独跑（`.dsh-scratch/hb-forensics.mjs` 是取证脚本），
   全量回归里被掐断的那条按**环境事件**记，别判成搬迁回归。

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
- 2026-10-19 `4b83f7b` **RPC 注册表 1/7**：建 `src/host/rpc/index.js`（Map + 校验）与
  `settings.js`；`dispatchRpc` 改为「注册表优先、switch 兜底」；settings 三个方法输出
  搬迁前后逐字节相同。
- 2026-10-19 `04ed1ac` **RPC 注册表 2–3/7**：`subagent.js`（1）、`push.js`（3）；
  方法集合 57(switch) + 7(注册表) = 64，md5 `ae0e06a3…` 与基线一致。
- **下一步**：继续搬 57 个方法（mobile 36 / session 10 / workspace 6 / pair 4 / agentPreset 1），
  照「二、标准动作」五步做，每搬一个域跑一次 `rpc-diff.mjs` + 前后探针 diff。

## 本轮验收结果（独立复核：sse-verifier 用自建脚本，不采信 lead 数据）

| 判据 | g2 `952345f` | g3 `834acf2` | g4 `7bbfd3f` |
| --- | --- | --- | --- |
| `assistant/chunk` | **0**（bug 现场） | 157 | 163 / 350 / 363（三次） |
| follow 重启信号 `session/subscribed` | 1 | 0 | 0 |
| `assistant/message` / `step/end` / `turn/end` | 2 / 2 / 2 | 2 / 2 / 2 | 2 / 2 / 2 |
| `session/queue` 帧 + 形状 | 3 条，合规 | 2 条，合规 | 3 条，合规（非空 items=1，126ms） |
| 心跳 `: ping` | 4 次 / 40s，10.0s 间隔 | 被 reload 打断 | **4 次 / 45s，精确 10.0s 间隔** |
| 8 次加载 `pageerror` | 0 | 0 | 0 |
| UI | 首页 3 行 / 工具栏 7 按钮 | 同 | 同；命令面板 2+6+技能源（漂移） |

`node --check` 双绿、`npm run smoke` 6/6 在每一组都跑过；`core.js` 5,759 → **5,228** 行，
`sse.js` 81 → **677** 行。RPC 方法名集合 `c178c9e` vs `HEAD` 逐字 diff 为空
（64 vs 64，md5 `ae0e06a3…`；交接单原写的 63 是正则漏了 `agentPreset.list`）。
