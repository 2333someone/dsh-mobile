# dsh-mobile

**掌上 dsh** —— dsh 的独立手机端插件：在 dsh **设置页**提供「掌上 dsh」面板（出码配对、设备管理、访问地址），手机端通过 `/m/` 页面浏览工作区/会话并发消息。可经公网反代访问。

设计语言对齐 dsh：DeepSeek 品牌蓝 `#4D6BFE`、亮/暗双主题、大圆角排版。图标为原创（品牌火花 + 听筒轮廓）。

## 能力（v0.1）

- **dsh 设置页「掌上 dsh」面板**（客户端 `settings.section`）：
  - 展示访问地址（局域网 + 公网）
  - 生成 6 位配对码（桌面出码）
  - 已配对设备列表 + 撤销
- **`/m/` 手机页面** —— 未配对输入 6 位码；已配对进入工作区/会话/聊天 UI。
- **6 位码配对** —— 桌面出码 → 手机输码 → 宿主机校验后下发 HttpOnly 设备 cookie（5 分钟有效，一次性）。
- **工作区 / 会话浏览 + 发消息** —— 按工作区分组，读取会话历史并轮询刷新，手机端发送 prompt（`sessionController.prompt` 排队模式）。
- **零运行时 npm 依赖**（host 端只依赖 dsh 注入的服务；客户端用浏览器内置 React）。

## 安装

在 Harness 内用插件管理器安装本目录（bundle）；或 `plugin_manager install_bundle` 指向本目录。安装后**刷新一次 dsh 页面**（客户端模块按需打包，需重新加载才会注册设置段）。

## 配对流程

1. 电脑上打开 dsh **设置 → 掌上 dsh**，点「生成配对码」，记下 6 位码。
2. 手机浏览器打开 `/m/`（见面板里的访问地址），输入这 6 位码点「配对」。
3. 配对成功，手机自动进入应用。

## 公网访问

本插件只挂在 dsh 现有的 `webServer` 上，**不改变其绑定**。公网可达需要部署侧满足两点：

1. dsh 的 webserver 绑定 `0.0.0.0`（在 profile patch 里覆盖 `@deepseek-ai/dsh-host-webserver` 的 `host`/`port`）。
2. 反向代理把公网域名转发到该宿主机端口（已有 Lucky 反代 `https://dshm.elysia.xin:45632` → 后端 `192.168.3.45:19387` 时可复用）。

`publicBaseUrl` 配置项用于在设置面板展示公网地址（不参与安全判定）。

## 配置

```yaml
- id: dsh-mobile
  name: 'dsh-mobile'
  config:
    enabled: true
    publicBaseUrl: 'https://dshm.elysia.xin:45632'   # 可选，仅展示
    devicesFile: ''                                   # 可选，默认 ~/.dsh/dsh-mobile-devices.json
```

## License

MIT
