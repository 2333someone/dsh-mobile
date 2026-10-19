// 构建手机端 bundle：mobile-src/src/mobile/index.tsx → ../assets/mobile.bundle.js
//
// 上游（dsh-palm v1.6.0）用 tsdown 打包；这里换成 esbuild 最小链（见 package.json
// 的 devDependencies），参数对齐上游 tsdown.config.ts：
//   format=esm / platform=browser / target=es2022 / jsx=automatic / minify=true
// 另外两处是 esbuild 特有的必要项：
//   · charset=utf8 —— 不写的话 esbuild 会把所有中文转义成 \uXXXX，产物多 ~30KB；
//   · define process.env.NODE_ENV=production —— 走 React 的生产分支。
//
// 产物是可复现的：同一份 src + 同一份 lockfile（npm ci）得到相同字节。
// sourcemap 只写外部 map（不含 sourcesContent），源码就在本目录，调试时按路径打开即可。
import { build } from 'esbuild'
import { readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const outfile = join(here, '..', 'assets', 'mobile.bundle.js')
const started = Date.now()

// 源码里 `import pkg from '../../../package.json'` 只用到 pkg.version。
// 上游（rollup/rolldown + json 插件）会把整个 JSON 裁成只用到的字段；esbuild 没有
// 字段级 tree-shaking，会把 name/description/devDependencies 一起内联进 bundle。
// 这个 onLoad 把本目录的 package.json 换成只含 version 的最小 JSON：
//   · 产物与上游一致（只有 `1.6.0` 一个常量，不带本仓库的包名/依赖清单）；
//   · 源码保持原样（不为了构建改业务文件）。
// node_modules 里的 package.json 不匹配这个绝对路径过滤，照常解析。
const pkgVersion = JSON.parse(readFileSync(join(here, 'package.json'), 'utf8')).version
const pinPkgVersion = {
  name: 'pin-pkg-version',
  setup(builder) {
    const filter = new RegExp(`${join(here, 'package.json').replace(/\\/g, '\\\\')}$`)
    builder.onLoad({ filter }, () => ({
      contents: JSON.stringify({ version: pkgVersion }),
      loader: 'json',
    }))
  },
}

await build({
  entryPoints: [join(here, 'src', 'mobile', 'index.tsx')],
  outfile,
  bundle: true,
  minify: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  jsx: 'automatic',
  charset: 'utf8',
  define: { 'process.env.NODE_ENV': '"production"' },
  legalComments: 'none',
  sourcemap: 'external',
  sourcesContent: false,
  plugins: [pinPkgVersion],
  logLevel: 'info',
})

console.log(`[mobile-src] built ${outfile} (${statSync(outfile).size} bytes) in ${Date.now() - started}ms`)
