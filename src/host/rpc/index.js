/**
 * RPC 注册表：方法名 → handler。
 *
 * 迁移期与 `core.js` 里的 switch **并存**：注册表优先命中，未命中的继续走 switch。
 * 这样每搬一个域，方法集合与方法语义都保持逐字不变（可拿
 * `.dsh-scratch/rpc-diff.mjs` 把「switch case ∪ 注册表键」和基线方法表比一遍）。
 *
 * handler 签名统一为 `(payload, bag) => Promise<Result>`：
 *   · `payload` = RPC 的 payload
 *   · `bag`     = 每请求上下文（当前只有 `{ deviceId }`）
 *   · 返回      = `{ ok: true, value }` 或 `{ ok: false, error: { code, message, ... } }`
 *
 * 这里**不捕获异常**：抛错仍由 `handleRpc` 原有的 try/catch 包成错误信封，
 * 免得迁移顺带改掉错误码语义。
 */
export function createRpcRegistry({ domains = [] } = {}) {
  const table = new Map()
  for (const domain of domains) {
    if (!domain || typeof domain !== 'object') throw new Error('RPC 域必须是对象字面量')
    for (const [method, handler] of Object.entries(domain)) {
      if (typeof handler !== 'function') throw new Error(`RPC handler 不是函数：${method}`)
      if (table.has(method)) throw new Error(`重复注册的 RPC 方法：${method}`)
      table.set(method, handler)
    }
  }
  return {
    get: (method) => table.get(method),
    has: (method) => table.has(method),
    names: () => [...table.keys()].sort(),
    size: () => table.size,
  }
}
