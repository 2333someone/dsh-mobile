
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
