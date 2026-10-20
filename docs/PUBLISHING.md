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

---

## 已完成的发布与收录（2026-10-20）

| 项 | 状态 |
| --- | --- |
| npm | `dsh-mobile-web`：0.1.0 → **0.1.2（latest）** |
| 源码仓库 | https://github.com/2333someone/dsh-mobile （已转 **public**） |
| 市场收录 issue | https://github.com/polang233/dsh-plugin-index/issues/9 |
| 市场收录 PR | https://github.com/polang233/dsh-plugin-index/pull/10 （只改 `data/sources.json`，+12 行） |
| 镜像 | gitea `origin`、GitHub `github`、本机 `E:` 镜像三者一致 |

## 更新机制（重要，别搞混）

- **谁决定装哪个版本：npm**。用户点「更新」时 DSH 从 npm 拉新版本，**不看 GitHub**。
- **GitHub 的作用**：市场审核时确认「源码公开 + 许可证明确」；转 public 是收录的硬条件。
- **市场索引的作用**：只决定「能不能被搜到 / 能不能显示更新按钮」。
  它默认跟踪 npm 的 `latest` 标签（见 CONTRIBUTING），所以发新版本后**不需要重新提交收录**。
- **本机（`link:` 安装）不需要更新**：手机端资产改完刷新手机页即生效；宿主代码改完重载插件即可。

## 发版清单

```bash
# 1) main 上改代码、验证、提交
# 2) 把改动带到发布分支并 bump
git checkout publish/dsh-mobile-web
git checkout main -- <改动的文件>
node -e "…把 package.json 的 version +1…"
git commit -am "release: x.y.z — …" && npm publish
# 3) 推三处
git push origin <branch> && git push github <branch>
git checkout main && git push origin main && git push github main
cd E:/desk/dsh-mobile && git pull --ff-only
```

---

## 发布纪律（2026-10-20 用户明确要求）

> 代码提交/发布会跑在测试前面，是不允许的。**必须先在作者自己的环境实测通过，再对外发布。**

固定流程：

1. **改代码 → 提交到 main**；
2. **本机（`link:` 安装）自测**：刷新手机页就是最新代码（资产按 mtime 读盘），逐项过下面清单；
3. **用户点头后**，才做发布：`cd publish/dsh-mobile-web` → bump 版本 → `npm publish`；
4. 发布后**确认无误**，再去市场提 PR / 重开 issue；
5. 任何一步发现不对，先回滚（`npm dist-tag add <pkg>@<已验证版本> latest`），不要带着未验证版本往前推。

### 自查清单（每次发布前至少过一遍）

- [ ] 折叠栏：进聊天页不再闪「第二行」；头行单行省略、无横向滚动
- [ ] 设置页：徽标细边框、右上角「?」可开说明、发送模式只有一行且在「对话」组
- [ ] 插件页：说明是具体中文、`更多 N 个` 能原地展开/收起
- [ ] 命令面板：文件/目标/计划(日历)/反馈/压缩/权限/模型(圆柱)/下载日志，图标风格一致
- [ ] 代码块动作栏：复制=两张纸、下载、新窗口打开，均正常
- [ ] 聊天：发消息、流式逐字、审批/提问、切换会话
- [ ] `npm run smoke` = ALL PASS 6/6；手机页 `pageerror = 0`

### 当前状态（2026-10-20）

- npm `latest` 已从 0.1.2 **回退到 0.1.1**；0.1.2 仍可按精确版本安装用于测试
  （`npm i dsh-mobile-web@0.1.2`），但普通安装/更新拿到的是 0.1.1。
- 市场 issue #9 与 PR #10 均已**关闭**并留言「待作者实测后再提」，测试通过后重开。
