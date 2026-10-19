/**
 * push.* 域（3 个方法）：通知配置的读写 + 订阅开关（订阅目前是空实现，保留是为了
 * 让 bundle 的调用不报 not-supported）。
 *
 * 从 `core.js` 搬出。`notifyConfig` 是 core 里的可变状态（`let`），所以这里不拿值，
 * 走 `getNotifyConfig()` / `setNotifyConfig()` 访问器；其余依赖都由 core 注入。
 */
export function createPushRpc({ getNotifyConfig, setNotifyConfig, deliverNotify, notifyChannelsView, saveNotifyConfig }) {
  return {
    'push.config': (payload) => {
      const body = payload || {}
      if (body.test === true) {
        deliverNotify(getNotifyConfig(), { title: 'dsh 掌上 · 测试通知', body: '收到这条说明推送通道工作正常。' }).catch(() => {})
        return { ok: true, value: { sent: true } }
      }
      if (body.get === true) {
        const c = getNotifyConfig()
        return {
          ok: true,
          value: {
            turnThresholdMs: c.turnThresholdMs,
            turnCooldownMs: c.turnCooldownMs,
            hideDetails: c.hideDetails === true,
            kinds: {
              jobs: !!(c.kinds && c.kinds.jobs === true),
              todo: !(c.kinds && c.kinds.todo === false),
              turns: !!(c.kinds && c.kinds.turns === true),
            },
            vapidPublicKey: '',
            channels: notifyChannelsView(c.channels),
          },
        }
      }
      const patch = body.set
      if (!patch || typeof patch !== 'object') {
        return { ok: false, error: { code: 'bad-request', message: '缺少配置内容' } }
      }
      const current = getNotifyConfig()
      const next = { ...current }
      if (typeof patch.turnThresholdMs === 'number' && Number.isFinite(patch.turnThresholdMs)) next.turnThresholdMs = Math.max(0, Math.round(patch.turnThresholdMs))
      if (typeof patch.turnCooldownMs === 'number' && Number.isFinite(patch.turnCooldownMs)) next.turnCooldownMs = Math.max(0, Math.round(patch.turnCooldownMs))
      if (typeof patch.hideDetails === 'boolean') next.hideDetails = patch.hideDetails
      if (patch.kinds && typeof patch.kinds === 'object') next.kinds = { ...(current.kinds || {}), ...patch.kinds }
      if (patch.channels && typeof patch.channels === 'object') {
        const merged = { ...(current.channels || {}) }
        for (const [k, v] of Object.entries(patch.channels)) {
          if (v && typeof v === 'object') merged[k] = { ...(merged[k] || {}), ...v }
        }
        next.channels = merged
      }
      setNotifyConfig(next)
      saveNotifyConfig(next)
      return { ok: true, value: { stored: true } }
    },
    'push.subscribe': async () => ({ ok: true, value: { ok: true } }),
    'push.unsubscribe': async () => ({ ok: true, value: { ok: true } }),
  }
}
