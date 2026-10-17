# dsh-mobile

**掌上 dsh** —— dsh 的独立手机端页面：6 位码配对、设备信任、工作区/会话浏览，并可直接在手机上发消息。可经公网反代访问。

设计语言对齐 dsh：DeepSeek 品牌蓝 `#4D6BFE`、亮/暗双主题、大圆角与 Montserrat 风格的简洁排版。图标为原创（品牌火花 + 听筒轮廓）。

## 能力（首版 v0.1）

- **`/m/` 手机页面** —— 未配对进入配对屏，已配对进入工作区/会话/聊天 UI。
- **6 位码配对** —— 手机发起配对显示 6 位码 → 桌面在 `/m/admin`（仅回环可达）批准 → 手机自动进入应用，凭 HttpOnly 设备 cookie 长期信任。
- **工作区 / 会话浏览** —— 按工作区分组，展示最近会话。
- **会话历史 + 发消息** —— 读取会话消息并轮询刷新，手机端发送 prompt（走 `sessionController.prompt` 的排队模式）。
- **设备管理** —— `/m/admin` 可撤销已配对设备；闲置设备自动清理。

## 安装

在 Harness 内用插件管理器安装本目录（bundle），或在 profile 里加回依赖后由 `plugin_manager install_bundle` 安装。运行时零 npm 依赖。

```sh
# 手动安装（示例，实际用插件管理器的 install_bundle）
```

## 配对流程

1. 手机打开 `https://<你的域名>/m/`（或局域网 `http://<主机IP>:<端口>/m/`）。
2. 点「开始配对」，记下 6 位码。
3. 在宿主机浏览器打开 `http://127.0.0.1:<端口>/m/admin`（仅回环可访问），看到相同 6 位码后点「批准」。
4. 手机自动进入应用。

## 公网访问

本插件只挂在 dsh 现有的 `webServer` 上，**不改变其绑定**。公网可达需要部署侧满足两点：

1. dsh 的 webserver 绑定 `0.0.0.0`（例如在 profile patch 里覆盖 `@deepseek-ai/dsh-host-webserver` 的 `host`/`port`）。
2. 反向代理把公网域名转发到该宿主机端口（已有 Lucky 反代 `https://dshm.elysia.xin:45632` → 后端 `192.168.3.45:19387` 时可复用）。

`publicBaseUrl` 配置项仅用于在 `/m/admin` 展示公网地址，不参与安全判定。

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
