/**
 * dsh-mobile 客户端半：在 dsh 设置面板注册「掌上 dsh」设置段。
 * - 展示访问地址（局域网 + 公网）
 * - 生成 6 位配对码（桌面出码，手机在 /m/ 输入）
 * - 已配对设备管理（撤销）
 *
 * 通过浏览器 fetch 直连同源的 /m/api/*（桌面 GUI 请求来自回环，满足
 * host 端的 loopback 校验）。
 */
window.__ModuleLoader__.load({
  id: 'dsh-mobile',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    // 复用 dsh 主题 token，自动跟随亮/暗主题
    const css = {
      wrap: { display: 'flex', flexDirection: 'column', gap: 20, padding: '4px 2px' },
      card: {
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'var(--dsw-alias-bg-layer-1)',
        borderRadius: 16,
        padding: 18,
      },
      title: { margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--dsw-alias-label-primary)' },
      sub: { margin: '6px 0 0', fontSize: 12.5, lineHeight: '18px', color: 'var(--dsw-alias-label-secondary)' },
      url: { display: 'block', marginTop: 8, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12.5, color: 'var(--dsw-alias-brand-primary)', wordBreak: 'break-all' },
      code: { margin: '14px 0 4px', textAlign: 'center', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 40, fontWeight: 700, letterSpacing: 8, color: 'var(--dsw-alias-brand-primary)' },
      btn: {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        border: 0, borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 600,
        cursor: 'pointer', background: 'var(--dsw-alias-brand-primary)', color: '#fff',
      },
      btnGhost: {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 10, padding: '9px 16px',
        fontSize: 13, fontWeight: 500, cursor: 'pointer', background: 'transparent',
        color: 'var(--dsw-alias-label-primary)',
      },
      btnDanger: {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid var(--dsw-alias-state-error-primary)', borderRadius: 10, padding: '7px 12px',
        fontSize: 12.5, fontWeight: 500, cursor: 'pointer', background: 'transparent',
        color: 'var(--dsw-alias-state-error-primary)',
      },
      row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderTop: '1px solid var(--dsw-alias-border-l1)' },
      name: { fontSize: 13.5, fontWeight: 500, color: 'var(--dsw-alias-label-primary)' },
      detail: { fontSize: 12, color: 'var(--dsw-alias-label-secondary)', marginTop: 2 },
      muted: { color: 'var(--dsw-alias-label-secondary)', fontSize: 13 },
      err: { color: 'var(--dsw-alias-state-error-primary)', fontSize: 12.5, marginTop: 8 },
    }

    function fmt(ms) {
      if (!ms) return '—'
      const d = new Date(ms)
      const now = new Date()
      const sameDay = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
      return sameDay
        ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    function MobileSettings() {
      const [status, setStatus] = React.useState(null)
      const [code, setCode] = React.useState(null)
      const [err, setErr] = React.useState('')

      const refresh = React.useCallback(() => {
        fetch('/m/api/status')
          .then((r) => r.json())
          .then((j) => { if (j && j.ok) setStatus(j) })
          .catch(() => {})
      }, [])

      React.useEffect(() => {
        refresh()
        const t = setInterval(refresh, 5000)
        return () => clearInterval(t)
      }, [refresh])

      const issue = () => {
        setErr('')
        fetch('/m/api/pair/issue', { method: 'POST' })
          .then((r) => r.json())
          .then((j) => {
            if (j && j.ok) setCode({ code: j.code, expiresAt: j.expiresAt })
            else setErr((j && j.error) || '生成失败')
          })
          .catch(() => setErr('生成失败：无法访问宿主机'))
      }

      const revoke = (deviceId) => {
        fetch('/m/api/device/revoke', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId }),
        }).then(() => refresh())
      }

      const addrs = (status && status.addresses) || { lan: [], publicBase: null }
      const devices = (status && status.devices) || []
      const urls = [...addrs.lan, ...(addrs.publicBase ? [addrs.publicBase] : [])]

      return h('div', { style: css.wrap },
        h('div', { style: css.card },
          h('p', { style: css.title }, '访问地址'),
          h('p', { style: css.sub }, '手机浏览器打开以下任意地址，输入配对码即可使用。'),
          urls.length
            ? urls.map((u, i) => h('span', { key: i, style: css.url }, `${u}/m/`))
            : h('p', { style: css.muted }, '未检测到局域网地址；请配置 publicBaseUrl 或让 webserver 绑定 0.0.0.0。'),
        ),
        h('div', { style: css.card },
          h('p', { style: css.title }, '手机配对'),
          h('p', { style: css.sub }, '生成一个 6 位配对码，5 分钟内有效；在手机 /m/ 页输入即完成配对。'),
          code
            ? h('div', null,
                h('div', { style: css.code }, code.code),
                h('p', { style: { ...css.sub, textAlign: 'center' } }, `有效期至 ${fmt(code.expiresAt)}`),
                h('div', { style: { textAlign: 'center', marginTop: 10 } },
                  h('button', { style: css.btnGhost, onClick: issue }, '重新生成')),
              )
            : h('div', { style: { marginTop: 12 } },
                h('button', { style: css.btn, onClick: issue }, '生成配对码')),
          err ? h('p', { style: css.err }, err) : null,
        ),
        h('div', { style: css.card },
          h('p', { style: css.title }, `已配对设备（${devices.length}）`),
          devices.length === 0
            ? h('p', { style: { ...css.muted, marginTop: 8 } }, '还没有设备。用上面的配对码在手机上配对后，这里会显示。')
            : devices.map((d, i) =>
                h('div', { key: d.deviceId, style: { ...css.row, borderTop: i === 0 ? 0 : undefined } },
                  h('div', null,
                    h('div', { style: css.name }, d.name || '设备'),
                    h('div', { style: css.detail }, `${d.deviceId} · 最近活跃 ${fmt(d.lastSeenAt)}`),
                  ),
                  h('button', { style: css.btnDanger, onClick: () => revoke(d.deviceId) }, '撤销'),
                ),
              ),
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
