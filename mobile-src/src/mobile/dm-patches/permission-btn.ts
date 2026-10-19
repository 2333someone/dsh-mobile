/**
 * 迁移 C：1:1 搬自宿主 index.js 的 `PERMISSION_BTN_HTML` 注入字符串。
 * 工具栏「权限」按钮
 *
 * 由 `dm-patches/index.ts` 在 bundle 启动时按原顺序安装。
 */
// 权限预设切换：工具栏「上下文用量」右边一个盾牌按钮，点开自绘面板列出宿主
// permissionPresets.catalog() 的预设并切换。
//
// 为什么不复用 bundle 自带的权限面板：它靠 slash 命令 `/permission <name>` 切换，
// 而本插件的 mobile.commandExec 一直是 not-supported，于是手机上永远切不动。
// 这里改走专用的 mobile.permissions.get / .set 两个 RPC，与 bundle 解耦。
export const PERMISSION_BTN_HTML = `<button id="dm-perm-btn" class="dm-tool-btn" type="button" aria-label="权限" title="权限"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 2.8v5.4c0 4.2-2.9 7.6-7 8.5-4.1-.9-7-4.3-7-8.5V5.8L12 3z"/><path d="M9.2 12.1l2 2 3.6-3.8"/></svg></button><script>
(function () {
  var btn = document.getElementById('dm-perm-btn');
  if (!btn) return;

  var lastSessionId = '';
  var panel = null;
  var busy = false;

  // 与 MODEL_BUTTON_HTML 同一手法：拦截 fetch 记住当前会话 id。
  var origFetch = window.fetch;
  if (typeof origFetch === 'function') {
    window.fetch = function (input, init) {
      try {
        var url = typeof input === 'string' ? input : (input && input.url) || '';
        if (url.indexOf('/m/api/') >= 0 && init && typeof init.body === 'string') {
          var body = JSON.parse(init.body);
          if (body && body.payload && typeof body.payload.sessionId === 'string' && body.payload.sessionId) {
            lastSessionId = body.payload.sessionId;
          }
        }
      } catch (e) {}
      return origFetch.apply(this, arguments);
    };
  }

  function currentSession() {
    try {
      var s = new URL(location.href).searchParams.get('session');
      if (s) return s;
    } catch (e) {}
    return lastSessionId;
  }

  function rpc(method, payload) {
    return fetch('/m/api/' + method, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rpcId: 'dm-perm-' + Date.now(), payload: payload })
    }).then(function (r) { return r.json(); }).then(function (j) { return j ? j.result : null; });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function build() {
    var back = el('div', 'dm-perm-backdrop');
    var sheet = el('div', 'dm-perm-sheet');
    var head = el('div', 'dm-perm-head');
    var title = el('div', 'dm-perm-title', '权限');
    var close = el('button', 'dm-perm-close', '✕');
    close.type = 'button';
    close.setAttribute('aria-label', '关闭');
    head.appendChild(title);
    head.appendChild(close);
    var body = el('div', 'dm-perm-body');
    var status = el('div', 'dm-perm-status');
    sheet.appendChild(head);
    sheet.appendChild(body);
    sheet.appendChild(status);
    back.appendChild(sheet);
    document.body.appendChild(back);

    back.addEventListener('click', function (e) {
      if (e.target !== back) return;   // 点面板内部不关
      closePanel();
    });
    close.addEventListener('click', function (e) { e.preventDefault(); closePanel(); });

    panel = { back: back, body: body, status: status };
    return panel;
  }

  function setStatus(text, kind) {
    if (!panel) return;
    var cls = 'dm-perm-status';
    if (text) cls += ' dm-perm-status-show';
    if (kind) cls += ' dm-perm-status-' + kind;
    panel.status.className = cls;
    panel.status.textContent = text || '';
  }

  // 渲染选项列表。available=false（宿主没装配权限预设服务）时给空态，
  // 不伪造任何选项 —— 宁可什么都不显示，也不能让人误以为切成功了。
  function paint(res) {
    if (!panel) return;
    var body = panel.body;
    body.innerHTML = '';
    if (!res || !res.ok || !res.value) {
      body.appendChild(el('p', 'dm-perm-hint', '加载失败，请重试'));
      return;
    }
    var v = res.value;
    var opts = Array.isArray(v.options) ? v.options : [];
    if (v.available === false || opts.length === 0) {
      body.appendChild(el('p', 'dm-perm-hint', '当前没有可用的权限预设'));
      return;
    }
    for (var i = 0; i < opts.length; i++) {
      var o = opts[i];
      if (!o || typeof o.value !== 'string' || typeof o.name !== 'string') continue;
      var on = o.value === v.currentValue;
      var row = el('button', 'dm-perm-row' + (on ? ' dm-perm-row-on' : ''));
      row.type = 'button';
      row.setAttribute('data-value', o.value);
      // 记住中文名，切换成功后的提示要用它，而不是回显英文的 value。
      row.setAttribute('data-label', o.name);
      var main = el('div', 'dm-perm-main');
      main.appendChild(el('div', 'dm-perm-name', esc(o.name)));
      if (o.description) main.appendChild(el('div', 'dm-perm-sub', esc(o.description)));
      row.appendChild(main);
      if (on) row.appendChild(el('span', 'dm-perm-check', '✓'));
      body.appendChild(row);
    }
  }

  function open() {
    if (!panel) build();
    panel.back.classList.add('dm-perm-open');
    setStatus('');
    load();
  }

  // 收起动画（同上）：先反向播放，结束再移除 open。
  function closePanel() {
    if (!panel) return;
    var back = panel.back;
    if (!back.classList.contains('dm-perm-open')) { setStatus(''); return; }
    if (back.getAttribute('data-dm-closing') === '1') return;
    back.setAttribute('data-dm-closing', '1');
    back.classList.add('dm-closing');
    var sheet = back.querySelector('.dm-perm-sheet');
    if (sheet) sheet.classList.add('dm-closing');
    window.setTimeout(function () {
      back.classList.remove('dm-perm-open');
      back.classList.remove('dm-closing');
      back.removeAttribute('data-dm-closing');
      if (sheet) sheet.classList.remove('dm-closing');
      setStatus('');
    }, 200);
  }

  function load() {
    if (!panel) return;
    panel.body.innerHTML = '';
    panel.body.appendChild(el('p', 'dm-perm-hint dm-perm-loading', '加载中…'));
    setStatus('');
    return rpc('mobile.permissions.get', { sessionId: currentSession() }).then(function (res) {
      if (!panel || !panel.back.classList.contains('dm-perm-open')) return;
      paint(res);
    }).catch(function () {
      if (!panel || !panel.back.classList.contains('dm-perm-open')) return;
      panel.body.innerHTML = '';
      panel.body.appendChild(el('p', 'dm-perm-hint', '加载失败，请重试'));
    });
  }

  // 按 value 找中文名，用于切换成功后的提示（不回显英文 value）。
  function labelOf(opts, value) {
    opts = Array.isArray(opts) ? opts : [];
    for (var i = 0; i < opts.length; i++) {
      if (opts[i] && opts[i].value === value && typeof opts[i].name === 'string') return opts[i].name;
    }
    return value;
  }

  // 切换：成功后用 set 返回的视图直接重绘（宿主回读的真实生效值），不用前端猜。
  function select(value, fallbackLabel) {
    if (busy) return;
    busy = true;
    setStatus('切换中…');
    rpc('mobile.permissions.set', { sessionId: currentSession(), preset: value }).then(function (res) {
      busy = false;
      if (!panel || !panel.back.classList.contains('dm-perm-open')) return;
      if (!res || !res.ok) {
        var msg = (res && res.error && res.error.message) ? res.error.message : '切换失败';
        setStatus(msg, 'err');
        return;
      }
      paint(res);
      // 提示用中文名：优先取服务端回读的视图，其次取点中那行的中文名。
      var shown = (res.value && Array.isArray(res.value.options))
        ? labelOf(res.value.options, (res.value.currentValue || value))
        : '';
      setStatus('已切换：' + (shown || fallbackLabel || value), 'ok');
    }).catch(function () {
      busy = false;
      if (!panel || !panel.back.classList.contains('dm-perm-open')) return;
      setStatus('切换失败', 'err');
    });
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var row = t.closest('.dm-perm-row');
    if (!row) return;
    var v = row.getAttribute('data-value');
    if (!v) return;
    e.preventDefault();
    if (row.classList.contains('dm-perm-row-on')) { closePanel(); return; }
    select(v, row.getAttribute('data-label') || '');
  });

  btn.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (panel && panel.back.classList.contains('dm-perm-open')) closePanel();
    else open();
  });

  // ── 只在聊天页显示 ──
  // 判据与子代理按钮一致（顶栏右侧有「更多」按钮），外加工具栏本身存在：
  // #dm-tools 由 MODEL_BUTTON_HTML 创建并塞进 .chat-tools，它存在即说明在聊天页。
  function isChatPage() {
    var slots = document.querySelectorAll('.mobile-headerSlot-right');
    for (var i = 0; i < slots.length; i++) {
      if (slots[i].querySelector('button[aria-label="更多"]')) return true;
    }
    return false;
  }

  // 幂等：每次都先判断位置，只在位置不对时才搬动；否则会随 MutationObserver
  // 反复 insertBefore，把按钮和 .chat-context 的位置来回抖。
  function ensure() {
    var row = document.getElementById('dm-tools');
    var tools = document.querySelector('.chat-tools');
    if (!row || !tools || !isChatPage()) {
      if (btn.parentNode) btn.parentNode.removeChild(btn);
      if (panel && panel.back.classList.contains('dm-perm-open')) closePanel();
      return;
    }
    var ctxEl = row.querySelector('.chat-context');
    if (btn.parentNode !== row) {
      // 圆环还没被搬进来时先挂末尾，等下一轮它出现了再挪到它右边。
      if (ctxEl) row.insertBefore(btn, ctxEl.nextSibling);
      else row.appendChild(btn);
      return;
    }
    if (ctxEl && ctxEl.nextSibling !== btn) row.insertBefore(btn, ctxEl.nextSibling);
  }

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    window.setTimeout(function () { pending = false; ensure(); }, 60);
  }
  try {
    if (window.__dmMutationBus) window.__dmMutationBus.subscribe(schedule);
    else {
      var mo = new MutationObserver(schedule);
      mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
    }
  } catch (e) {}
  if (window.__dmEnsureTick) window.__dmEnsureTick.add(ensure, 800, function () { return !!document.querySelector('.chat-composer'); }); else setInterval(ensure, 800);
  ensure();
})();
</script>`
