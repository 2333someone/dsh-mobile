## 这次为什么设置页还是不出来（0.1.7 修）

`dsh.client` 里写了非法的 `inject` 字段：

```json
"client": { "platform": "web", "immediately": true,
            "inject": ["@deepseek-ai/dsh-client-ui-settings"] }
```

`WebBootEntry.inject` 的语义是**依赖其它 bundle 入口的 id**，而
`@deepseek-ai/dsh-client-ui-settings` 是 shell 内置模块（PLATFORM_MODULES 基线），
不是 bundle 入口。于是客户端半边一直在等一个永不出现的依赖，模块从不 materialize，
`settings.section` 里就永远没有我们那一项（用 cordis inspect 查实际 occupants，
只有 account/general/models/plugins/agent-presets 五个官方项）。

参考一个能正常出设置页的已发布插件（dsh-session-purge），它只写
`"client": { "platform": "web" }`。

0.1.7 的修法：

1. `dsh.client` 只留 `{ platform: 'web', immediately: true }`；
2. `client.js` 里 `__ModuleLoader__.load({ id })` 的 id 改成 **包名**
   `dsh-mobile-web`（shell 按包名做 entry id 对照）；
3. 仓库 `package.json` 的 name 也统一为 `dsh-mobile-web`，`cordis.patch.yml`
   的 `name` 同样是 `dsh-mobile-web` —— 从此 npm 安装 / Git 安装 / link 安装
   三者的模块名一致，不再需要发布分支单独改 patch。
