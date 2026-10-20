# 发布到 npm + 进插件市场

> 目标：让任何人不用 Git 地址、不拷本地文件，直接 `dsh plugin add dsh-mobile-web` 或在
> 「插件 → 添加插件」里搜到就能装。

## 为什么换了包名

`dsh-mobile` 这个 npm 名已被 **saya-ch** 占用（89 个版本，latest 0.6.13，
https://www.npmjs.com/package/dsh-mobile ），且是同类产品（DSH 移动端访问插件）。
`npm publish` 会直接拒绝：

```
You cannot publish over the previously published versions: 0.1.0.
```

所以本分支把包名改成 **`dsh-mobile-web`**（已确认 npm 上可用）。改的只有 `package.json`
的发布元数据；插件内部的行 id / 模块名仍是 `dsh-mobile`，不影响功能。

## 发布前检查（当前状态）

| 要求 | 状态 |
| --- | --- |
| 公开源码仓库 | ✅ https://github.com/2333someone/dsh-mobile |
| 明确许可证 | ✅ MIT（`LICENSE` + `package.json`） |
| 包内声明 `dsh.bundle.patch` | ✅ `package.json` → `dsh.bundle.patch = ./cordis.patch.yml`，补丁文件已在 `files` 白名单内 |
| 可安装的 npm 版本 | ⬜ **待发布**（发布后即有发布时间） |
| 包内带 Logo | ✅ `exports["./icon"] = ./assets/icon.svg`（市场「优先审核」项） |
| 无运行时依赖 / 无需构建 | ✅ 直接可装，手机端 JS 已打包在 `assets/mobile.bundle.js` |

打包核对：`npm publish --dry-run` → 28 个文件、约 574 KB，含 `index.js`、`client.js`、
`cordis.patch.yml`、`src/host/**`、`assets/**`、`locale/**`。

## 发布步骤（需要你自己的 npm 账号）

```bash
cd C:/Users/XQQ/Documents/deepseek-harness/default-workspace/dsh-mobile
git checkout publish/dsh-mobile-web      # 发布分支（main 上包名仍是 dsh-mobile）

npm login                                 # 浏览器/邮箱 + 2FA
npm whoami                                # 确认身份

npm publish                               # unscoped 包默认 public
# 若将来改用 scoped 名（如 @you/dsh-mobile）则必须：
# npm publish --access public

npm view dsh-mobile-web version           # 确认已上线
```

发布后 npmmirror 会自动同步（国内用户走镜像安装），通常几分钟内生效。

> ⚠️ `npm publish` 不可撤销（72 小时内可用 `npm unpublish <name>@<version>` 撤回，
> 且版本号会作废）。发布前把版本号定好：首次建议就发 `0.1.0`。

## 版本升级

```bash
npm version patch        # 0.1.0 → 0.1.1（生成 commit + tag）
npm publish
git push origin HEAD --tags && git push github HEAD --tags
```

## 收录进插件市场（dshopen.org）

市场只认 **npm 包名**，收录后「添加插件」里就能搜到。

### 方式一：提 issue（最省事）

打开 https://github.com/polang233/dsh-plugin-index/issues/new?template=plugin.yml ，
按模板填：

- **插件地址**：`dsh-mobile-web`
- **简短说明**：
  > 掌上 dsh —— 手机端完整聊天界面。6 位码配对后在手机浏览器打开 `/m/`，即可看工作区/
  > 会话、收发消息、审批与提问、实时流式输出；支持局域网直连与公网反代，可装成 PWA。
- **补充信息**：源码 https://github.com/2333someone/dsh-mobile ，MIT，包内自带图标。

### 方式二：提 PR

在 `data/sources.json` 追加（`category` 用已有分类，`integrations` 最贴切）：

```json
{
  "name": "dsh-mobile-web",
  "title": { "en": "Pocket DSH", "zh": "掌上 dsh" },
  "description": {
    "en": "Full chat UI for phones: 6-digit pairing, live session mirroring over SSE, approvals and streaming replies, LAN or reverse-proxy access, installable as a PWA.",
    "zh": "手机端完整聊天界面：6 位码配对、SSE 实时跟随会话、审批与流式回复，支持局域网或公网反代，可装成 PWA。"
  },
  "category": "integrations"
}
```

然后 `pnpm install --frozen-lockfile --ignore-scripts && pnpm test && pnpm build && pnpm validate`，
一并提交 `public/` 生成物。

收录门槛（来自 CONTRIBUTING）：**有公开 npm 版本和发布时间**、声明 `dsh.bundle.patch`
且补丁文件在发布包内、**公开源码 + 明确许可证**、用途清楚。四条我们都满足（只差 npm 版本）。

## 已知注意事项

1. **内部行 id 仍是 `dsh-mobile`**：如果用户同时安装了 `saya-ch/dsh-mobile` 和本插件，
   profile 里会出现两个同名行 id。目前按「二选一」预期，未改名；要彻底避免需要同时改
   `cordis.patch.yml` 的 `id`/`name`、`index.js` 的 `name` 导出与 `client.js` 的注册 id，
   并迁移已有 profile —— 体积不小，等确实需要共存时再做。
2. **修改包名后本机安装会失配**：本机 profile 的依赖键是 `dsh-mobile`（`link:` 指向仓库）。
   发布分支的包名是 `dsh-mobile-web`，所以**不要在本机 checkout 该分支后跑 pnpm install**，
   只在发布分支上执行 `npm publish` 即可；日常开发仍在 `main`。
3. 市场收录由维护者核对包的归属/用途/发布记录，合并前可能要求补充中英文介绍或截图。
