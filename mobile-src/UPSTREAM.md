# Vendored mobile UI source (dsh-palm fork)

## Baseline

- Upstream project: **dsh-palm** — <https://github.com/Eternalloveone/dsh-palm>
- Baseline release: **v1.6.0** (published 2026-10-14)
- Source obtained from the release tarball:
  `https://codeload.github.com/Eternalloveone/dsh-palm/tar.gz/refs/tags/v1.6.0`
  → `packages/dsh-palm/src/**` (Apache-2.0, see `LICENSE-APACHE`)
- This directory is a **fork**, not a submodule or a pinned dependency. Once vendored,
  we do **not** follow upstream feature work. Upstream is kept only as reference
  material for bug fixes we want to cherry-pick by hand.

## What we build

`../assets/mobile.bundle.js` — the single ES module served to the phone at `/m/mobile.js`.
`build.mjs` uses esbuild with the same entry/options as upstream's `tsdown.config.ts`
(`format=esm`, `platform=browser`, `target=es2022`, `jsx=automatic`, minify, no externals).

```sh
cd mobile-src
npm ci           # only needed once / after package-lock.json changes
npm run build    # writes ../assets/mobile.bundle.js (+ .map)
```

Build output is deterministic for a given `src/` + lockfile; rebuilds should produce
byte-identical files (`sha256sum ../assets/mobile.bundle.js`).

## Local changes carried in this fork (vs v1.6.0)

1. **Send-mode row in Settings** (`src/mobile/views/SettingsView.tsx`, 外观 group):
   the row reads/writes `window.__dmSendMode` (owned by the host plugin's injected
   `SEND_MODE_HTML`), so the phone stores its send mode on the host instead of a
   page-local default. Styled by `assets/theme.css` (`.dm-sendmode-select`).
2. **Balance label** (`SettingsView.tsx`, usage card): `账户余额` → `充值余额`
   to match the wording used on the desktop side.

Everything else is upstream v1.6.0 as published. Host-side behaviours that used to be
patched into the shipped bundle by hand now live where they belong:

- “关于 / 反馈” copy and the GitHub link are rewritten at runtime by the host plugin's
  DOM patch (`index.js`, `SETTINGS_SCOPE_HTML` block) — no source change needed.
- The web-search artwork in the builtin-plugin rows is host-side (`index.js`,
  `HOST_PAGES_HTML` → `CONFIG_ART['web-search']`) — not part of this bundle.

## Updating

Do not `git pull` upstream into this tree. If a specific upstream fix is wanted, read
the upstream commit, re-implement it here, run `npm run build`, and commit both the
source change and the rebuilt `assets/mobile.bundle.js` in the same commit.
