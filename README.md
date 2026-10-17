# dsh-mobile

**掌上 dsh** —— dsh 的手机端插件。手机页面直接复用 [dsh-palm](https://github.com/Eternalloveone/dsh-palm) 的完整手机 UI（独立 React bundle：会话列表、聊天页、工具卡、推理块、Markdown/代码块、模型选择等），由本插件按 dsh 0.2.1 的原生服务实现它期望的 `/m/api/<method>` RPC 协议。

> dsh-palm 的 host 端在 0.2.1 已不可用（`settings.installSection` 被移除），因此只复用它的**手机 bundle 与 PWA 资源**（Apache-2.0，见 [NOTICE](NOTICE)），host 侧重写。

## 能力

- **完整手机端 UI**（dsh-palm bundle）：`/m/` 聊天页、会话/工作区浏览、模型选择、工具卡与推理块展示。
- **6 位码配对**：桌面 dsh 设置页「掌上 dsh」出码 → 手机 `/m/` 输码 → HttpOnly 设备 cookie。
- **RPC 协议**：`POST /m/api/<method>`（`{rpcId, payload}` → `{type:'server-response', rpcId, result}`），已实现 `session.list/history/prompt/create/models/selectModel/rename/cancel/updateQueue/search` 与 `workspace.list/create/rename/delete/archiveSession`。
- **双 HTTP 面**：GUI 的 webServer（回环，供设置面板）+ 独立监听 `0.0.0.0:19387`（手机/局域网/公网反代）。
- **设置页面板**：dsh 设置 →「掌上 dsh」：访问地址、生成配对码、设备撤销。
- **弹窗关闭过渡**：输入框上方「+ / 模型 / 上下文」三个按钮打开的底部抽屉，点空白处收起时自上而下缩回（280ms，遵循 `prefers-reduced-motion`），不再瞬间消失。

## 安装

`plugin_manager install_bundle` 指向本目录。安装后**刷新一次 dsh 页面**以加载客户端设置段。

## 使用

1. 电脑：dsh **设置 → 掌上 dsh** →「生成配对码」。
2. 手机：打开 `http://<主机IP>:19387/m/`（或公网地址），输入 6 位码。
3. 配对后进入完整聊天界面。

公网：本插件监听 `0.0.0.0:19387`，已有反代（如 `https://dshm.elysia.xin:45632` → `192.168.3.45:19387`）可直接复用，无需改 GUI 的绑定与动态端口。

## 配置

```yaml
- id: dsh-mobile
  name: 'dsh-mobile'
  config:
    enabled: true
    mobilePort: 19387
    mobileHost: '0.0.0.0'
    publicBaseUrl: 'https://dshm.elysia.xin:45632'
    devicesFile: ''   # 默认 ~/.dsh/dsh-mobile-devices.json
```

## 已知限制（相对 dsh-palm 原版）

- **实时推送未接**：`/m/api/events.mux` / `events.notify` 返回 404，手机端退回轮询（原版 README 所述 fallback）；消息不丢，但不如原版即时。
- **审批/提问应答未接**：`respond` 方法未实现，手机端无法替 agent 确认工具调用/回答 ask_user_question；这类轮次需在桌面处理。
- 手机端设备管理页（`pair.devices` 等本地方法）未接，设备管理请在桌面设置页操作。

## 开发提示

- `assets/theme.css` 每次请求实时读盘：改完刷新手机页面即生效，无需重启 dsh。
- 宿主端 `index.js` 由 dsh 进程加载，保存后不会自动重载。未开 HMR 目录监听时，可临时在 `~/.dsh/profiles/desktop/cordis.patch.yml` 末尾加一行注释，触发 profile reconcile 自动重载插件（随后还原注释即可），或重启一次 dsh。

## License

MIT（插件代码）；手机 bundle 与 PWA 资源来自 dsh-palm，Apache-2.0，见 NOTICE。
