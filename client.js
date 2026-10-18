/**
 * dsh-mobile 客户端半：在 dsh 设置面板注册「掌上 dsh」设置段。
 * - 展示访问地址（局域网 + 公网，可复制）
 * - 生成 6 位配对码（桌面出码，手机在 /m/ 输入），带倒计时
 * - 已配对设备管理（撤销需二次确认）
 *
 * 通过浏览器 fetch 直连同源的 /m/api/*（桌面 GUI 请求来自回环，满足 host 端的
 * loopback 校验）。样式走主题 token，动画遵循 prefers-reduced-motion。
 */
window.__ModuleLoader__.load({
  id: 'dsh-mobile',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useState, useEffect, useCallback, useRef } = React

    const CSS = `
.dm-wrap { display: flex; flex-direction: column; gap: 16px; padding: 4px 2px; }
.dm-card {
  border: 1px solid var(--dsw-alias-border-l1, #e6e7ec);
  background: var(--dsw-alias-bg-layer-1, #f5f6f8);
  border-radius: 16px; padding: 18px;
  animation: dm-in .34s cubic-bezier(.2,.75,.25,1) both;
}
.dm-card:nth-child(2) { animation-delay: .06s; }
.dm-card:nth-child(3) { animation-delay: .12s; }
.dm-title { margin: 0; font-size: 14px; font-weight: 600; color: var(--dsw-alias-label-primary, #1b1c20); }
.dm-sub { margin: 6px 0 0; font-size: 12.5px; line-height: 18px; color: var(--dsw-alias-label-secondary, #6b6e78); }
.dm-urlRow { display: flex; align-items: center; gap: 8px; margin-top: 10px; }
.dm-url {
  flex: 1; min-width: 0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12.5px; color: #4D6BFE; word-break: break-all;
}
.dm-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  border: 1px solid #4D6BFE; border-radius: 10px; padding: 9px 16px;
  font-size: 13px; font-weight: 600; cursor: pointer;
  background: #4D6BFE; color: #fff;
  transition: background-color .16s ease, transform .09s ease, box-shadow .16s ease, opacity .16s ease;
}
.dm-btn:hover { background: #5f7bff; border-color: #5f7bff; box-shadow: 0 4px 14px rgba(77,107,254,.28); }
.dm-btn:active { transform: scale(.97); }
.dm-btn:focus-visible { outline: 2px solid #4D6BFE; outline-offset: 2px; }
.dm-btn[disabled] { opacity: .6; cursor: default; transform: none; box-shadow: none; }
.dm-ghost {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  border: 1px solid var(--dsw-alias-border-l2, #d0d2da); border-radius: 10px;
  padding: 9px 16px; font-size: 13px; font-weight: 500; cursor: pointer;
  background: transparent; color: var(--dsw-alias-label-primary, #1b1c20);
  transition: background-color .16s ease, border-color .16s ease, transform .09s ease;
}
.dm-ghost:hover { background: rgba(127,127,127,.08); }
.dm-ghost:active { transform: scale(.97); }
.dm-ghost:focus-visible { outline: 2px solid #4D6BFE; outline-offset: 2px; }
.dm-danger {
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid #e5484d; border-radius: 10px; padding: 7px 12px;
  font-size: 12.5px; font-weight: 500; cursor: pointer; background: transparent; color: #e5484d;
  transition: background-color .16s ease, color .16s ease, transform .09s ease;
}
.dm-danger:hover { background: rgba(229,72,77,.1); }
.dm-danger:active { transform: scale(.96); }
.dm-danger[data-confirm="true"] { background: #e5484d; color: #fff; }
.dm-copy {
  flex: none; border: 1px solid var(--dsw-alias-border-l2, #d0d2da); background: transparent;
  color: var(--dsw-alias-label-secondary, #6b6e78); border-radius: 8px; padding: 5px 10px;
  font-size: 11.5px; cursor: pointer; transition: background-color .15s, color .15s, transform .09s;
}
.dm-copy:hover { background: rgba(127,127,127,.1); }
.dm-copy:active { transform: scale(.95); }
.dm-copy[data-copied="true"] { border-color: #18a058; color: #18a058; }
.dm-code {
  margin: 14px 0 2px; text-align: center;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 40px; font-weight: 700; letter-spacing: 8px; color: #4D6BFE;
  animation: dm-pop .4s cubic-bezier(.2,.8,.25,1.1) both;
}
.dm-codeExpired { opacity: .45; text-decoration: line-through; }
.dm-count { text-align: center; font-size: 12px; color: var(--dsw-alias-label-secondary, #6b6e78); }
.dm-count b { color: #4D6BFE; font-weight: 600; font-variant-numeric: tabular-nums; }
.dm-row {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 11px 0; border-top: 1px solid var(--dsw-alias-border-l1, #e6e7ec);
  animation: dm-in .28s ease both;
}
.dm-row:first-of-type { border-top: 0; }
.dm-name { font-size: 13.5px; font-weight: 500; color: var(--dsw-alias-label-primary, #1b1c20); }
.dm-detail { font-size: 12px; color: var(--dsw-alias-label-secondary, #6b6e78); margin-top: 2px; }
.dm-muted { color: var(--dsw-alias-label-secondary, #6b6e78); font-size: 13px; }
.dm-err { color: var(--dsw-alias-state-error-primary, #e5484d); font-size: 12.5px; margin-top: 10px; }
.dm-domain { margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--dsw-alias-border-l2, #d0d2da); }
.dm-domainHead { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; }
.dm-domainLabel { font-size: 12.5px; font-weight: 600; color: var(--dsw-alias-label-primary, #1b1c20); }
.dm-domainHint { font-size: 11.5px; color: var(--dsw-alias-label-secondary, #6b6e78); }
.dm-input {
  flex: 1; min-width: 0; height: 34px; padding: 0 10px; border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2, #d0d2da); background: transparent;
  color: var(--dsw-alias-label-primary, #1b1c20); font-size: 12.5px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
.dm-input::placeholder { color: var(--dsw-alias-label-secondary, #9aa0ad); }
.dm-input:focus { outline: none; border-color: #4D6BFE; box-shadow: 0 0 0 2px rgba(77,107,254,.16); }
.dm-btnSm { padding: 8px 14px; font-size: 12.5px; }
.dm-actions { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 12px; }
.dm-spin {
  width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff; border-radius: 50%;
  animation: dm-rot .8s linear infinite;
}
.dm-spinGhost {
  width: 14px; height: 14px; border: 2px solid rgba(77,107,254,.25);
  border-top-color: #4D6BFE; border-radius: 50%;
  animation: dm-rot .8s linear infinite;
}
.dm-live { display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; color: var(--dsw-alias-label-secondary, #6b6e78); }
.dm-liveDot { width: 7px; height: 7px; border-radius: 50%; background: #18a058; box-shadow: 0 0 0 0 rgba(24,160,88,.45); animation: dm-pulse 2s infinite; }
.dm-liveDotOff { background: #b8bcc6; animation: none; }
@keyframes dm-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes dm-pop { 0% { opacity: 0; transform: scale(.86); } 62% { transform: scale(1.05); } 100% { opacity: 1; transform: scale(1); } }
@keyframes dm-rot { to { transform: rotate(360deg); } }
@keyframes dm-pulse { 0% { box-shadow: 0 0 0 0 rgba(24,160,88,.45); } 70% { box-shadow: 0 0 0 6px rgba(24,160,88,0); } 100% { box-shadow: 0 0 0 0 rgba(24,160,88,0); } }
@media (prefers-reduced-motion: reduce) {
  .dm-card, .dm-row, .dm-code { animation: none !important; }
  .dm-btn, .dm-ghost, .dm-danger, .dm-copy { transition: none !important; }
  .dm-liveDot { animation: none !important; }
  .dm-spin, .dm-spinGhost { animation-duration: 1.6s !important; }
}
`

    function fmt(ms) {
      if (!ms) return '—'
      const d = new Date(ms)
      const now = new Date()
      const sameDay = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
      return sameDay
        ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    function remaining(expiresAt, now) {
      const ms = Math.max(0, (expiresAt || 0) - now)
      const s = Math.ceil(ms / 1000)
      const m = Math.floor(s / 60)
      return `${String(m).padStart(1, '0')}:${String(s % 60).padStart(2, '0')}`
    }

    /**
     * UA → 「平台 · 浏览器」+ 能拿到的型号。与宿主端 describeDeviceUA 同一套规则：
     * 华为 ArkWeb 的 UA 把型号写死成 "Phone"（只有 OpenHarmony/HarmonyOS + 浏览器），
     * 夸克等 Android UA 常带型号（如 PLQ110），Windows/iOS 则只能给平台。
     */
    function describeDeviceUA(userAgent) {
      const ua = String(userAgent || '')
      const grab = (re) => {
        const hit = re.exec(ua)
        return hit && typeof hit[1] === 'string' ? hit[1] : ''
      }
      let platform = ''
      if (/OpenHarmony|HarmonyOS/i.test(ua)) {
        const v = grab(/OpenHarmony\s+([\d.]+)/i) || grab(/HarmonyOS\s+([\d.]+)/i)
        platform = v === '' ? 'HarmonyOS' : 'HarmonyOS ' + v
      } else if (/Android/i.test(ua)) {
        const v = grab(/Android\s+([\d.]+)/i)
        platform = v === '' ? 'Android' : 'Android ' + v
      } else if (/iPhone|iPad|iPod/i.test(ua)) {
        platform = 'iOS'
      } else if (/Windows NT 10/i.test(ua)) {
        platform = 'Windows'
      } else if (/Macintosh|Mac OS X/i.test(ua)) {
        platform = 'macOS'
      } else if (/Linux/i.test(ua)) {
        platform = 'Linux'
      }
      let browser = ''
      const browsers = [
        [/HuaweiBrowser\/([\d.]+)/i, '华为浏览器'],
        [/Quark\/([\d.]+)/i, '夸克'],
        [/MicroMessenger\/([\d.]+)/i, '微信'],
        [/Edg\/([\d.]+)/i, 'Edge'],
        [/Firefox\/([\d.]+)/i, 'Firefox'],
        [/Chrome\/([\d.]+)/i, 'Chrome'],
        [/Version\/([\d.]+)[\s\S]*Safari/i, 'Safari'],
      ]
      for (const [re, name] of browsers) {
        const v = grab(re)
        if (v !== '') {
          browser = name + ' ' + v.split('.')[0]
          break
        }
      }
      let model = ''
      if (!/OpenHarmony|HarmonyOS/i.test(ua)) {
        if (/iPhone/i.test(ua)) model = 'iPhone'
        else if (/iPad/i.test(ua)) model = 'iPad'
        else if (/Android/i.test(ua)) {
          const hit = /Android[^;)]*;\s*(?:[A-Za-z]{2}-[A-Za-z]{2};\s*)?([^;)]+?)\s*(?:Build\/|\))/i.exec(ua)
          const token = hit && typeof hit[1] === 'string' ? hit[1].replace(/^U;\s*/i, '').trim() : ''
          if (token.length >= 2 && !/^wv$/i.test(token) && !/^Android$/i.test(token)) model = token.slice(0, 40)
        }
      }
      return { model, platform, browser, label: [platform, browser].filter((s) => s !== '').join(' · ') }
    }

    /** 已配对设备 → 列表两行：手动改名优先，其次型号 / 「平台 · 浏览器」。 */
    function describeDevice(d) {
      const info = describeDeviceUA(d.userAgent)
      const model = typeof d.model === 'string' && d.model !== '' ? d.model : info.model
      const label = typeof d.label === 'string' && d.label !== '' ? d.label : info.label
      const name = typeof d.name === 'string' && d.name !== '' && d.name !== '手机设备' ? d.name : ''
      const title = name || model || label || '设备'
      const bits = []
      if (model !== '' && model !== title) bits.push(model)
      if (label !== '' && label !== title) bits.push(label)
      // 不再显示 deviceId（e4430… 这种十六进制串）：设备已经能靠型号/平台区分，
      // 长串只会把第二行挤满；内部仍用它做 key / 撤销请求。
      bits.push('最近活跃 ' + fmt(d.lastSeenAt))
      return { title, detail: bits.join(' · ') }
    }

    /**
     * 访问地址里「局域网」只保留 RFC1918 私网地址。
     * 有些机器上会多出 VPN / 虚拟网卡的公网段 IPv4（例如 2.0.1.1/24），
     * 那不是手机能用来直连的入口，混进来就会显示成三条地址。
     */
    function lanOnly(urls) {
      const isPrivate = (host) =>
        host.startsWith('10.') || host.startsWith('192.168.') || /^172\.(1[6-9]|2\d|3[01])\./.test(host)
      return (Array.isArray(urls) ? urls : []).filter((u) => {
        try {
          return isPrivate(new URL(u).hostname)
        } catch {
          return false
        }
      })
    }

    async function copyText(text) {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text)
          return true
        }
      } catch {}
      try {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        const ok = document.execCommand('copy')
        document.body.removeChild(ta)
        return ok
      } catch {
        return false
      }
    }

    function MobileSettings() {
      const [status, setStatus] = useState(null)
      const [code, setCode] = useState(null)
      const [issuing, setIssuing] = useState(false)
      const [err, setErr] = useState('')
      const [copied, setCopied] = useState('')
      const [confirmRevoke, setConfirmRevoke] = useState('')
      const [now, setNow] = useState(() => Date.now())
      const [domainDraft, setDomainDraft] = useState('')
      const [domainBusy, setDomainBusy] = useState(false)
      const [domainErr, setDomainErr] = useState('')
      const domainEdited = useRef(false)
      const confirmTimer = useRef()
      const copyTimer = useRef()

      const refresh = useCallback(() => {
        fetch('/m/api/status')
          .then((r) => r.json())
          .then((j) => {
            if (!j || !j.ok) return
            setStatus(j)
            // 域名输入框：用户正在编辑时不要被轮询覆盖。
            if (!domainEdited.current) setDomainDraft((j.addresses && j.addresses.publicBase) || '')
            // 宿主端已有待配对码时同步显示（例如另一处生成）。
            if (j.pending) setCode((cur) => cur ?? { code: j.pending.code, expiresAt: j.pending.expiresAt })
          })
          .catch(() => {})
      }, [])

      useEffect(() => {
        refresh()
        const t = setInterval(refresh, 4000)
        return () => clearInterval(t)
      }, [refresh])

      // 倒计时 tick
      useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 1000)
        return () => clearInterval(t)
      }, [])

      useEffect(() => () => {
        clearTimeout(confirmTimer.current)
        clearTimeout(copyTimer.current)
      }, [])

      const issue = () => {
        if (issuing) return
        setErr('')
        setIssuing(true)
        fetch('/m/api/pair/issue', { method: 'POST' })
          .then((r) => r.json())
          .then((j) => {
            if (j && j.ok) setCode({ code: j.code, expiresAt: j.expiresAt })
            else setErr((j && j.error) || '生成失败')
          })
          .catch(() => setErr('生成失败：无法访问宿主机'))
          .finally(() => setIssuing(false))
      }

      const revoke = (deviceId) => {
        if (confirmRevoke !== deviceId) {
          setConfirmRevoke(deviceId)
          clearTimeout(confirmTimer.current)
          confirmTimer.current = setTimeout(() => setConfirmRevoke(''), 3000)
          return
        }
        clearTimeout(confirmTimer.current)
        setConfirmRevoke('')
        fetch('/m/api/device/revoke', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId }),
        }).then(() => refresh()).catch(() => {})
      }

      /** 保存 / 清除公网域名（空串 = 清除，回到 profile 配置）。 */
      const saveDomain = (value) => {
        if (domainBusy) return
        setDomainErr('')
        setDomainBusy(true)
        fetch('/m/api/domain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: value }),
        })
          .then((r) => r.json())
          .then((j) => {
            if (j && j.ok) {
              domainEdited.current = false
              refresh()
            } else {
              setDomainErr((j && j.error) || '保存失败')
            }
          })
          .catch(() => setDomainErr('保存失败：无法访问宿主机'))
          .finally(() => setDomainBusy(false))
      }

      const clearDomain = () => {
        setDomainDraft('')
        saveDomain('')
      }

      const onCopy = async (url) => {
        const ok = await copyText(url)
        if (!ok) return
        setCopied(url)
        clearTimeout(copyTimer.current)
        copyTimer.current = setTimeout(() => setCopied(''), 1800)
      }

      const addrs = (status && status.addresses) || { lan: [], publicBase: null }
      const devices = (status && status.devices) || []
      const urls = [...lanOnly(addrs.lan), ...(addrs.publicBase ? [addrs.publicBase] : [])]
      // 「清除」只在用户自己填过域名时出现；没填时 publicBase 来自 profile 配置，
      // 清掉只会回到配置值，按钮会误导。
      const hasDomainOverride = addrs.publicBaseCustom === true
      const isFixed = !!(code && (code.fixed === true || code.expiresAt > now + 86400000))
      const expired = code && !isFixed ? now > code.expiresAt : false

      return h('div', { className: 'dm-wrap' },
        h('style', { dangerouslySetInnerHTML: { __html: CSS } }),

        // ── 访问地址 ──
        h('div', { className: 'dm-card' },
          h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 } },
            h('p', { className: 'dm-title' }, '访问地址'),
            h('span', { className: 'dm-live' },
              h('span', { className: 'dm-liveDot' + (urls.length ? '' : ' dm-liveDotOff') }),
              urls.length ? '就绪' : '未监听'),
          ),
          h('p', { className: 'dm-sub' }, '手机浏览器打开以下任意地址，输入配对码即可使用。'),
          urls.length
            ? urls.map((u, i) =>
                h('div', { key: u, className: 'dm-urlRow' },
                  h('span', { className: 'dm-url' }, `${u}/m/`),
                  h('button', {
                    type: 'button',
                    className: 'dm-copy',
                    'data-copied': copied === u ? 'true' : 'false',
                    onClick: () => onCopy(`${u}/m/`),
                  }, copied === u ? '已复制' : '复制'),
                ),
              )
            : h('p', { className: 'dm-muted', style: { marginTop: 10 } }, '未检测到地址：请确认插件已启用，或在下面填写公网域名。'),

          // 公网域名：反代 / 隧道的对外地址。填了之后会出现在上面的地址里，
          // 手机直接打开「域名/m/」，配对时只需要输入配对码。
          h('div', { className: 'dm-domain' },
            h('div', { className: 'dm-domainHead' },
              h('span', { className: 'dm-domainLabel' }, '公网域名'),
              h('span', { className: 'dm-domainHint' }, '可选 · 反向代理 / 隧道地址'),
            ),
            h('div', { className: 'dm-urlRow' },
              h('input', {
                className: 'dm-input',
                value: domainDraft,
                placeholder: 'https://example.com:45632',
                spellCheck: false,
                autoCapitalize: 'none',
                autoCorrect: 'off',
                onChange: (e) => {
                  domainEdited.current = true
                  setDomainDraft(e.target.value)
                  setDomainErr('')
                },
                onKeyDown: (e) => {
                  if (e.key === 'Enter') saveDomain(domainDraft.trim())
                },
              }),
              h('button', {
                type: 'button',
                className: 'dm-btn dm-btnSm',
                disabled: domainBusy,
                onClick: () => saveDomain(domainDraft.trim()),
              }, domainBusy ? '保存中…' : '保存'),
              addrs.publicBaseCustom
                ? h('button', {
                    type: 'button',
                    className: 'dm-ghost dm-btnSm',
                    disabled: domainBusy,
                    onClick: clearDomain,
                  }, '清除')
                : null,
            ),
            domainErr ? h('p', { className: 'dm-err' }, domainErr) : null,
          ),
        ),

        // ── 手机配对 ──
        h('div', { className: 'dm-card' },
          h('p', { className: 'dm-title' }, '手机配对'),
          h('p', { className: 'dm-sub' }, '在手机 /m/ 页输入下方配对码即可；固定码长期有效，无需反复配对。'),
          code
            ? h('div', null,
                h('div', { className: 'dm-code' + (expired ? ' dm-codeExpired' : '') }, code.code),
                h('p', { className: 'dm-count' },
                  isFixed
                    ? '固定配对码 · 长期有效'
                    : expired
                      ? '配对码已过期，请重新生成'
                      : h('span', null, '剩余 ', h('b', null, remaining(code.expiresAt, now))),
                ),
                h('div', { className: 'dm-actions' },
                  h('button', { type: 'button', className: 'dm-ghost', onClick: issue, disabled: issuing },
                    issuing ? h('span', { className: 'dm-spinGhost' }) : null,
                    issuing ? '生成中…' : '重新生成'),
                ),
              )
            : h('div', { className: 'dm-actions' },
                h('button', { type: 'button', className: 'dm-btn', onClick: issue, disabled: issuing },
                  issuing ? h('span', { className: 'dm-spin' }) : null,
                  issuing ? '生成中…' : '生成配对码'),
              ),
          err ? h('p', { className: 'dm-err' }, err) : null,
        ),

        // ── 已配对设备 ──
        h('div', { className: 'dm-card' },
          h('p', { className: 'dm-title' }, `已配对设备（${devices.length}）`),
          devices.length === 0
            ? h('p', { className: 'dm-muted', style: { marginTop: 8 } }, '还没有设备。用上面的配对码在手机上配对后，这里会显示。')
            : devices.map((d, i) => {
                const desc = describeDevice(d)
                return h('div', { key: d.deviceId, className: 'dm-row', style: { animationDelay: `${i * 40}ms` } },
                  h('div', null,
                    h('div', { className: 'dm-name', title: d.userAgent || '' }, desc.title),
                    h('div', { className: 'dm-detail' }, desc.detail),
                  ),
                  h('button', {
                    type: 'button',
                    className: 'dm-danger',
                    'data-confirm': confirmRevoke === d.deviceId ? 'true' : 'false',
                    onClick: () => revoke(d.deviceId),
                  }, confirmRevoke === d.deviceId ? '确认撤销？' : '撤销'),
                )
              }),
        ),
      )
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('settings.section', () => ctx.slots.register({
          name: 'settings.section',
          id: 'dsh-mobile',
          order: 100,
          label: '掌上 dsh',
        }, MobileSettings))
      },
    }
  },
})
