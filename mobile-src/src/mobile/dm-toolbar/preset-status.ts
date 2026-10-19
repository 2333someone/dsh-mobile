/**
 * 迁移 B：1:1 搬自宿主 index.js 的 `PRESET_STATUS_HTML` 注入字符串。
 * 预设状态行（当前 agent preset 提示）。
 *
 * 只搬位置、不改写：内容仍是原来的 HTML + 内联脚本，由
 * `dm-toolbar/index.ts` 在 bundle 启动时按原顺序安装到 document。
 */
export const PRESET_STATUS_HTML = `<script>
(function () {
  try {
    if (window.__dmPresetStatus) return;
    window.__dmPresetStatus = true;

    // 中文名以需求表为准（宿主 preset 定义只有 id/order）。
    var NAMES = { standard: '默认模式', ptc: 'PTC 模式', minimal: '最简模式', cordis: '工具创造模式' };

    // 四套单色描边图标：同一 24×24 坐标系、stroke=currentColor、1.8、round。
    var ICONS = {
      standard: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.4 3.6 7.6 12 11.8l8.4-4.2z"/><path d="M3.6 12.1 12 16.3l8.4-4.2"/><path d="M3.6 16.6 12 20.8l8.4-4.2"/></svg>',
      ptc: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.1"/><path d="M12 4.2v2.2M12 17.6v2.2M19.8 12h-2.2M6.4 12H4.2M17.5 6.5l-1.6 1.6M8.1 15.9l-1.6 1.6M17.5 17.5l-1.6-1.6M8.1 8.1 6.5 6.5"/></svg>',
      minimal: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 8.5h13M7.5 12h9M9.5 15.5h5"/></svg>',
      cordis: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2.1"/><circle cx="5.4" cy="6.6" r="1.7"/><circle cx="18.6" cy="6.6" r="1.7"/><circle cx="12" cy="19.2" r="1.7"/><path d="M10.6 10.3 6.9 7.9M13.4 10.3l3.7-2.4M12 14.1v3.4"/></svg>'
    };

    var preset = 'standard';
    var lastSid = '';
    var cache = null;        // { at, map }
    var toastTimer = 0;

    function button() { return document.getElementById('dm-preset-btn'); }
    function labelOf(id) { return NAMES[id] || id || NAMES.standard; }

    function paint(id) {
      preset = id && ICONS[id] ? id : 'standard';
      var b = button();
      if (!b) return;
      var html = ICONS[preset];
      // 只在内容确实不同时才写，避免和原脚本互相刷屏造成抖动。
      if (b.getAttribute('data-dm-preset-painted') !== preset) {
        b.innerHTML = html;
        b.setAttribute('data-dm-preset-painted', preset);
      }
      b.setAttribute('data-preset', preset);
      var t = '当前模式：' + labelOf(preset);
      if (b.getAttribute('aria-label') !== t) {
        b.setAttribute('aria-label', t);
        b.setAttribute('title', t);
      }
    }

    function rpc(method, payload) {
      return fetch('/m/api/' + method, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rpcId: 'dm-preset-status-' + Date.now(), payload: payload || {} })
      }).then(function (r) { return r.json(); }).then(function (j) { return j ? j.result : null; })
        .catch(function () { return null; });
    }

    // ① session.list 的投影（一次请求拿到全量映射，5 秒缓存）
    function fromList(sid) {
      var now = Date.now();
      if (cache && now - cache.at < 5000) return Promise.resolve(cache.map[sid] || null);
      return rpc('session.list', {}).then(function (res) {
        var items = (res && res.ok && res.value && Array.isArray(res.value.items)) ? res.value.items : [];
        var map = {};
        for (var i = 0; i < items.length; i++) {
          var it = items[i];
          var values = it && it.projections && it.projections.values;
          if (values && typeof values.agentPreset === 'string' && values.agentPreset !== '') {
            map[it.sessionId] = values.agentPreset;
          }
        }
        cache = { at: Date.now(), map: map };
        return map[sid] || null;
      });
    }

    // ② 该会话 history 的投影（列表里查不到时兜底）
    function fromHistory(sid) {
      return rpc('session.history', { sessionId: sid, maxMessages: 8 }).then(function (res) {
        var v = res && res.ok ? res.value : null;
        var values = v && v.projections && v.projections.values;
        return (values && typeof values.agentPreset === 'string' && values.agentPreset !== '')
          ? values.agentPreset : null;
      });
    }

    // 当前会话 id：URL 带就用，否则从 fetch 的 payload.sessionId 记下来。
    function currentSession() {
      try {
        var u = new URL(location.href);
        var q = u.searchParams.get('session');
        if (q) return q;
      } catch (e) {}
      return lastSid;
    }

    var origFetch = window.fetch;
    if (typeof origFetch === 'function') {
      window.fetch = function (input, init) {
        try {
          var url = typeof input === 'string' ? input : (input && input.url) || '';
          if (url.indexOf('/m/api/') >= 0 && init && typeof init.body === 'string') {
            var body = JSON.parse(init.body);
            var payload = body && body.payload;
            if (payload && typeof payload.sessionId === 'string' && payload.sessionId !== '') {
              if (lastSid !== payload.sessionId) {
                lastSid = payload.sessionId;
                // 换会话：先把图标归位到默认，再异步读真值（不显示上一个会话的模式）。
                paint('standard');
                refresh();
              }
            }
          }
        } catch (e) {}
        return origFetch.apply(this, arguments);
      };
    }

    var inFlight = '';
    function refresh() {
      var sid = currentSession();
      if (!sid || sid === inFlight) return;
      inFlight = sid;
      fromList(sid).then(function (id) {
        return id !== null ? id : fromHistory(sid);
      }).then(function (id) {
        if (currentSession() !== sid) return;   // 期间换过会话，丢弃过期结果
        paint(id === null ? 'standard' : id);
      }).catch(function () { /* 保持默认，不弹错 */ }).then(function () {
        if (inFlight === sid) inFlight = '';
      });
    }

    // 只读提示：复用 bundle 的 .toast-host / .toast，深浅主题自动跟随。
    // 这个点击路径不打开任何面板、也不发写请求 —— 聊天页不可能改变模式。
    function toast() {
      try {
        if (toastTimer) window.clearTimeout(toastTimer);
        var host = document.createElement('div');
        host.className = 'toast-host';
        host.setAttribute('role', 'status');
        var item = document.createElement('div');
        item.className = 'toast';
        item.textContent = '当前模式：' + labelOf(preset) + ' · 模式在新建会话时选择';
        host.appendChild(item);
        document.body.appendChild(host);
        toastTimer = window.setTimeout(function () {
          try { if (host.parentNode) host.parentNode.removeChild(host); } catch (e) {}
        }, 2200);
      } catch (e) {}
    }

    // 捕获阶段抢先处理：#dm-preset-btn 的点击一律只弹只读提示，
    // 原 PRESET_BTN_HTML 的切换面板（冒泡阶段监听）再也收不到这次点击。
    window.addEventListener('click', function (e) {
      var t = e.target;
      while (t && t !== document && t.id !== 'dm-preset-btn') t = t.parentNode;
      if (!t || t.id !== 'dm-preset-btn') return;
      e.preventDefault();
      e.stopImmediatePropagation();
      toast();
    }, true);

    // 原脚本会周期性重写按钮内容与 aria-label：这里盯着写回的状态图标。
    function ensure() {
      var b = button();
      if (!b) return;
      if (b.classList.contains('dm-icon-hidden')) b.classList.remove('dm-icon-hidden');
      // 原脚本在会话已开始时会给按钮加 aria-hidden="true"。按钮现在是常驻状态，
      // 必须去掉它 —— 否则读屏器会整颗忽略这个「当前模式」状态图标。
      if (b.getAttribute('aria-hidden') === 'true') b.removeAttribute('aria-hidden');
      if (b.getAttribute('data-dm-preset-painted') !== preset) paint(preset);
      if (currentSession() !== '' && preset === 'standard') refresh();
    }

    try {
      if (window.__dmMutationBus) window.__dmMutationBus.subscribe(ensure, { attributes: true });
      else {
        var mo = new MutationObserver(function () { ensure(); });
        mo.observe(document.documentElement || document.body, {
        childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'aria-label', 'title', 'aria-hidden']
      });
      }
    } catch (e) {}
    setInterval(ensure, 300);
    setInterval(refresh, 4000);
    refresh();
  } catch (e) {}
})();
</script>`
