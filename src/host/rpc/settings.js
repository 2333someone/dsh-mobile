/**
 * settings.* 域（3 个方法）：宿主设置页的只读视图 + 手机端唯一可写的「外观偏好」。
 *
 * 从 `core.js` 的 switch 原样搬出。依赖由 `core.js` 一次性注入：
 *   · `getService(name)` —— 取宿主服务（这里是 `settings`）
 *   · `devices`          —— 设备表（外观偏好按设备存）
 *   · `persistDevices()` —— 落盘设备表
 * handler 的第二个参数 `bag` 是每请求上下文，这里只用到 `bag.deviceId`。
 */
export function createSettingsRpc({ getService, devices, persistDevices }) {
  /**
   * settings.read / settings.describe 共用：返回 namespaces 列表，
   * 并把**本设备**自己选的外观偏好回填进 ui-theme。
   */
  function readSettings(payload, bag) {
    const settings = getService('settings')
    if (!settings || typeof settings.describe !== 'function') {
      return { ok: true, value: { writable: false, hasDocument: false, namespaces: [] } }
    }
    let list
    try {
      list = settings.describe({ redactSecrets: true })
    } catch {
      list = []
    }
    const namespaces = (Array.isArray(list) ? list : []).map((d) => ({
      ns: d.ns,
      schema: d.schema,
      value: d.value,
      ...(d.base !== undefined ? { base: d.base } : {}),
      ...(d.user !== undefined ? { user: d.user } : {}),
      applies: d.applies || 'live',
      secrets: Array.isArray(d.secrets) ? d.secrets : [],
      revision: d.revision,
    }))
    // 外观偏好按设备独立：bundle 每次启动都会读 ui-theme.preference 并应用
    // （Fr(value)），如果不覆盖，它就会用宿主那份跨端同步值把手机上刚设的
    // 深色顶掉 —— 表现就是「设成深色，刷新又变浅色」。
    // 这里把该设备自己的选择回填进去，手机之间/桌面端互不影响。
    const settingsDevice = bag && typeof bag.deviceId === 'string'
      ? devices.get(bag.deviceId)
      : undefined
    const deviceTheme = settingsDevice && typeof settingsDevice.theme === 'string' ? settingsDevice.theme : ''
    if (deviceTheme === 'dark' || deviceTheme === 'light' || deviceTheme === 'system') {
      for (const entry of namespaces) {
        if (entry.ns !== 'ui-theme') continue
        const value = entry.value && typeof entry.value === 'object' ? { ...entry.value } : {}
        value.preference = deviceTheme
        entry.value = value
      }
    }
    return { ok: true, value: { writable: false, hasDocument: false, namespaces } }
  }

  return {
    'settings.read': readSettings,
    'settings.describe': readSettings,
    'settings.mutate': (payload, bag) => {
      // 手机端只开放「外观偏好」这一项，而且是**按设备**存：
      //   · 写宿主 ui-theme 是跨端同步设置，手机上换深色会把桌面 GUI 一起改掉；
      //   · 用户预期是「手机自己的主题跟着手机走」，所以存进设备表，
      //     启动时再由上面的 settings.read 回填给 bundle。
      const targetId = bag && typeof bag.deviceId === 'string' ? bag.deviceId : ''
      const target = devices.get(targetId)
      if (!target) return { ok: false, error: { code: 'unpaired', message: '设备未配对' } }
      const ns = typeof payload?.ns === 'string' ? payload.ns : ''
      if (ns !== 'ui-theme') {
        return { ok: false, error: { code: 'forbidden', message: '该设置项不允许在手机端修改' } }
      }
      const ops = Array.isArray(payload?.ops) ? payload.ops : []
      let nextTheme = ''
      for (const op of ops) {
        if (!op || op.op !== 'set' || !Array.isArray(op.path) || op.path.length !== 1 || op.path[0] !== 'preference') {
          return { ok: false, error: { code: 'bad-request', message: '只支持设置外观偏好' } }
        }
        if (op.value !== 'dark' && op.value !== 'light' && op.value !== 'system') {
          return { ok: false, error: { code: 'bad-request', message: '外观偏好只能是 dark / light / system' } }
        }
        nextTheme = op.value
      }
      if (nextTheme !== '' && target.theme !== nextTheme) {
        target.theme = nextTheme
        persistDevices()
      }
      return { ok: true, value: { ok: true } }
    },
  }
}
