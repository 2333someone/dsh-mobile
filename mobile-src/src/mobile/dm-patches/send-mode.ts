/**
 * 迁移 C：1:1 搬自宿主 index.js 的 `SEND_MODE_HTML` 注入字符串。
 * 发送模式（排队/直接插入）选择行
 *
 * 由 `dm-patches/index.ts` 在 bundle 启动时按原顺序安装。
 */
// 发送模式（需求 B 的前端侧）：按设置改写 session.prompt 的 mode。
//
// bundle 里 ce() 把 mode 写死成 `queue`（`await m('session.prompt',{sessionId:e,mode:'queue',content:t})`），
// bundle 不可改，所以唯一可行的切入点是它下面的 window.fetch —— 与 MODEL_BUTTON_HTML
// 同一手法：在请求发出前把 body 里的 mode 换成用户选的那个值。
//
// 设置值从 mobile.preferences 读（宿主下发），并缓存在 localStorage 供首帧使用。
export const SEND_MODE_HTML = `<script>
(function () {
  var KEY = 'dm.sendMode';
  var mode = 'queue';

  function valid(v) { return v === 'steer' || v === 'queue'; }

  try {
    var cached = localStorage.getItem(KEY);
    if (valid(cached)) mode = cached;
  } catch (e) {}

  // 只改 session.prompt 的 mode：别的请求一律原样放行。
  var origFetch = window.fetch;
  if (typeof origFetch === 'function') {
    window.fetch = function (input, init) {
      try {
        var url = typeof input === 'string' ? input : (input && input.url) || '';
        if (url.indexOf('/m/api/session.prompt') >= 0 && init && typeof init.body === 'string') {
          var body = JSON.parse(init.body);
          if (body && body.payload && typeof body.payload === 'object') {
            body.payload.mode = mode;
            init = { ...init, body: JSON.stringify(body) };
          }
        }
      } catch (e) {}
      return origFetch.apply(this, arguments.length ? [input, init] : arguments);
    };
  }

  function rpc(method, payload) {
    return fetch('/m/api/' + method, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rpcId: 'dm-' + Date.now(), payload: payload || {} }),
    }).then(function (r) { return r.json(); }).then(function (j) { return j ? j.result : null; });
  }

  // 启动时拉一次真值（宿主是唯一权威；localStorage 只是首帧缓存）。
  function syncFromHost() {
    return rpc('mobile.preferences', {}).then(function (res) {
      var v = res && res.ok && res.value ? res.value.sendMode : undefined;
      if (!valid(v)) return;
      mode = v;
      try { localStorage.setItem(KEY, v); } catch (e) {}
      window.dispatchEvent(new CustomEvent('dm:sendmode', { detail: { sendMode: v } }));
    }).catch(function () {});
  }

  // 给设置页脚本用：读 / 写。
  window.__dmSendMode = {
    get: function () { return mode; },
    set: function (next) {
      if (!valid(next)) return Promise.resolve(mode);
      return rpc('mobile.preferences', { sendMode: next }).then(function () {
        mode = next;
        try { localStorage.setItem(KEY, next); } catch (e) {}
        window.dispatchEvent(new CustomEvent('dm:sendmode', { detail: { sendMode: next } }));
        return mode;
      });
    },
  };

  syncFromHost();
})();
</script>`
