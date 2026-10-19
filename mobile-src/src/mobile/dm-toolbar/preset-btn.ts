/**
 * 迁移 B：1:1 搬自宿主 index.js 的 `PRESET_BTN_HTML` 注入字符串。
 * 工具栏「聊天模式」（agent preset）按钮。
 *
 * 只搬位置、不改写：内容仍是原来的 HTML + 内联脚本，由
 * `dm-toolbar/index.ts` 在 bundle 启动时按原顺序安装到 document。
 */
// 聊天模式（Agent 预设）按钮：**只在还没有发出第一条消息的空白会话里出现**。
//
// 为什么需要它：bundle 只在「新建会话」时把 agentPreset 带进 session.create
// （`ae({workspaceId, agentPreset: D})`），会话一旦建好就再没有切换入口；手机
// 会话页连宿主自带的预设卡片也没有。宿主侧 agentPresets.select(agent, preset)
// 恰好支持「首条消息之前」改绑（它自己读 turnBoundary 投影：已开轮次就抛
// agent-preset/locked，不会静默改一个已经聊起来的会话），所以这里只在空白
// 会话显示按钮，选中时走专用 RPC mobile.setAgentPreset。
//
// 显隐判据用 DOM（轻量，不发 RPC、不读历史）：
//   .chat-scroll 里没有任何 .chat-msg（含 pending 的）→ 还没有消息；
//   历史仍在加载（.chat-typing 的文案不是「还没有消息…」）时先不显示，
//   避免进页面的一瞬间闪一下再消失。
// 选项列表来自 agentPreset.list（宿主 agentPresets.remoteExportList），
// 不硬编码任何预设名 —— 宿主没给 name 就显示 id。
export const PRESET_BTN_HTML = `<button id="dm-preset-btn" class="dm-tool-btn" type="button" aria-label="聊天模式" title="聊天模式"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.4 3.6 7.6 12 11.8l8.4-4.2z"/><path d="M3.6 12.1 12 16.3l8.4-4.2"/><path d="M3.6 16.6 12 20.8l8.4-4.2"/></svg></button><script>
(function () {
  var btn = document.getElementById('dm-preset-btn');
  if (!btn) return;

  var lastSessionId = '';
  var panel = null;
  var busy = false;
  var currentPreset = '';
  // 宿主确认过「这个会话已经开过轮次」的 id：一旦确认就一直隐藏（比 DOM 判据硬，
  // 换会话时自动失效）。
  var startedSession = '';
  var toastTimer = 0;

  // 与 MODEL_BUTTON_HTML 同一手法：拦截 fetch 记住当前会话 id（手机页路由不带 query）。
  // 顺带盯 session.prompt：**发第一条消息的请求一发出就收起按钮** —— 不依赖 bundle
  // 之后是否真的把消息节点渲染出来（手机端实测偶发：消息已落盘、列表却不刷新）。
  var origFetch = window.fetch;
  if (typeof origFetch === 'function') {
    window.fetch = function (input, init) {
      try {
        var url = typeof input === 'string' ? input : (input && input.url) || '';
        if (url.indexOf('/m/api/') >= 0 && init && typeof init.body === 'string') {
          var method = url.slice(url.indexOf('/m/api/') + 7).split('?')[0];
          var body = JSON.parse(init.body);
          var payload = body && body.payload;
          if (payload && typeof payload.sessionId === 'string' && payload.sessionId) {
            lastSessionId = payload.sessionId;
            if (method === 'session.prompt') markStarted(payload.sessionId);
          }
        }
      } catch (e) {}
      return origFetch.apply(this, arguments);
    };
  }

  // 一旦确认这个会话「已经不是第一条消息之前」，就锁死隐藏；换会话自动失效。
  function markStarted(sid) {
    var id = sid || currentSession();
    if (id !== '') startedSession = id;
    btn.classList.add('dm-icon-hidden');
    btn.setAttribute('aria-hidden', 'true');
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
      body: JSON.stringify({ rpcId: 'dm-preset-' + Date.now(), payload: payload })
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

  // 轻提示：复用 bundle 自己的 .toast-host / .toast，样式跟原生保持一致。
  function toast(text) {
    try {
      var host = document.createElement('div');
      host.className = 'toast-host';
      host.setAttribute('role', 'status');
      var item = document.createElement('div');
      item.className = 'toast';
      item.textContent = text;
      host.appendChild(item);
      document.body.appendChild(host);
      if (toastTimer) window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(function () {
        try { if (host.parentNode) host.parentNode.removeChild(host); } catch (e) {}
      }, 2200);
    } catch (e) {}
  }

  // 面板容器沿用 .dm-perm-* 那套浮层（同一风格、颜色全走主题变量），
  // 只有行用 data-preset 标记；权限面板的全局点击处理只认 .dm-perm-row[data-value]，
  // 不会误吃这里的点击。
  function build() {
    var back = el('div', 'dm-perm-backdrop');
    var sheet = el('div', 'dm-perm-sheet');
    var head = el('div', 'dm-perm-head');
    var title = el('div', 'dm-perm-title', '聊天模式');
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

    panel = { back: back, body: body, status: status, list: [] };
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

  function labelOf(id) {
    var list = (panel && Array.isArray(panel.list)) ? panel.list : [];
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].id === id) {
        return (typeof list[i].name === 'string' && list[i].name !== '') ? list[i].name : id;
      }
    }
    return id;
  }

  function render() {
    if (!panel) return;
    var body = panel.body;
    body.innerHTML = '';
    var list = Array.isArray(panel.list) ? panel.list : [];
    if (list.length === 0) {
      body.appendChild(el('p', 'dm-perm-hint', '宿主没有注册任何 Agent 预设'));
      return;
    }
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      if (!p || typeof p.id !== 'string' || p.id === '') continue;
      var label = (typeof p.name === 'string' && p.name !== '') ? p.name : p.id;
      var on = p.id === currentPreset;
      var row = el('button', 'dm-perm-row' + (on ? ' dm-perm-row-on' : ''));
      row.type = 'button';
      row.setAttribute('data-preset', p.id);
      row.setAttribute('data-label', label);
      if (typeof p.broken === 'string' && p.broken !== '') {
        row.disabled = true;
        row.setAttribute('data-broken', '1');
      }
      var main = el('div', 'dm-perm-main');
      // 「（默认）」是宿主 roster 里的 isDefault，不是前端猜的。
      main.appendChild(el('div', 'dm-perm-name', esc(label) + (p.isDefault === true ? '（默认）' : '')));
      if (typeof p.description === 'string' && p.description !== '') {
        main.appendChild(el('div', 'dm-perm-sub', esc(p.description)));
      } else if (typeof p.broken === 'string' && p.broken !== '') {
        main.appendChild(el('div', 'dm-perm-sub', '不可用：' + esc(p.broken)));
      }
      row.appendChild(main);
      if (on) row.appendChild(el('span', 'dm-perm-check', '✓'));
      body.appendChild(row);
    }
  }

  function paint(res) {
    if (!panel) return;
    if (!res || !res.ok || !res.value) {
      panel.list = [];
      render();
      panel.body.appendChild(el('p', 'dm-perm-hint', '加载失败，请重试'));
      return;
    }
    panel.list = Array.isArray(res.value.presets) ? res.value.presets : [];
    if (typeof res.value.current === 'string' && res.value.current !== '') currentPreset = res.value.current;
    // 宿主用 turnBoundary 投影算出来的权威判据：blank === false 说明已经开过
    // 轮次，立刻收起按钮，不再依赖聊天 DOM 是否已经渲染出消息节点。
    if (res.value.blank === false) markStarted();
    render();
  }

  function rememberButtonLabel(id) {
    var label = labelOf(id);
    btn.setAttribute('title', '聊天模式：' + label);
    btn.setAttribute('aria-label', '聊天模式：' + label);
    return label;
  }

  function open() {
    if (!panel) build();
    panel.back.classList.add('dm-perm-open');
    setStatus('');
    load();
  }

  function closePanel() {
    if (!panel) return;
    panel.back.classList.remove('dm-perm-open');
    setStatus('');
  }

  function load() {
    if (!panel) return;
    panel.body.innerHTML = '';
    panel.body.appendChild(el('p', 'dm-perm-hint dm-perm-loading', '加载中…'));
    setStatus('');
    return rpc('agentPreset.list', { sessionId: currentSession() }).then(function (res) {
      if (!panel || !panel.back.classList.contains('dm-perm-open')) return;
      paint(res);
    }).catch(function () {
      if (!panel || !panel.back.classList.contains('dm-perm-open')) return;
      panel.body.innerHTML = '';
      panel.body.appendChild(el('p', 'dm-perm-hint', '加载失败，请重试'));
    });
  }

  function select(id, fallbackLabel) {
    if (busy) return;
    var sid = currentSession();
    if (sid === '') { setStatus('拿不到会话 ID，请重新进入该会话', 'err'); return; }
    busy = true;
    setStatus('切换中…');
    rpc('mobile.setAgentPreset', { sessionId: sid, agentPreset: id }).then(function (res) {
      busy = false;
      if (!panel) return;
      if (!res || !res.ok) {
        var msg = (res && res.error && res.error.message) ? res.error.message : '切换失败';
        setStatus(msg, 'err');
        return;
      }
      currentPreset = (res.value && typeof res.value.agentPreset === 'string' && res.value.agentPreset !== '')
        ? res.value.agentPreset
        : id;
      render();
      var shown = rememberButtonLabel(currentPreset) || fallbackLabel || id;
      setStatus('已切换：' + shown, 'ok');
      toast('已切换聊天模式：' + shown);
      window.setTimeout(closePanel, 900);
    }).catch(function () {
      busy = false;
      if (!panel) return;
      setStatus('切换失败', 'err');
    });
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var row = t.closest('.dm-perm-row[data-preset]');
    if (!row) return;
    e.preventDefault();
    var id = row.getAttribute('data-preset');
    if (!id) return;
    if (row.classList.contains('dm-perm-row-on')) { closePanel(); return; }
    select(id, row.getAttribute('data-label') || '');
  });

  btn.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (panel && panel.back.classList.contains('dm-perm-open')) closePanel();
    else open();
  });

  // ── 只在「聊天页 + 空白会话」显示 ──
  function isChatPage() {
    var slots = document.querySelectorAll('.mobile-headerSlot-right');
    for (var i = 0; i < slots.length; i++) {
      if (slots[i].querySelector('button[aria-label="更多"]')) return true;
    }
    return false;
  }

  // 空白 = 聊天页里一条消息节点都没有，且空态文案已经出现（历史加载完成）。
  // 另加两条「正忙」判据：一轮在跑（停止按钮/输出中状态行）时也不算空白 ——
  // 手机端偶发消息节点晚一拍才渲染，这几条能保证发出一瞬间按钮就消失。
  function isBlankChat() {
    var scroll = document.querySelector('.chat-scroll');
    if (!scroll) return false;
    if (scroll.querySelector('.chat-msg')) return false;
    if (document.querySelector('.chat-send-stop')) return false;    // 正在生成
    if (document.querySelector('.chat-turn-status')) return false;  // 「输出中」状态行
    var typing = scroll.querySelector('.chat-typing');
    if (!typing) return false;
    return String(typing.textContent || '').indexOf('还没有消息') >= 0;
  }

  function ensure() {
    var row = document.getElementById('dm-tools');
    var tools = document.querySelector('.chat-tools');
    if (!row || !tools || !isChatPage()) {
      if (btn.parentNode) btn.parentNode.removeChild(btn);
      if (panel && panel.back.classList.contains('dm-perm-open')) closePanel();
      return;
    }
    // 落位：上下文用量按钮左边（模式紧挨着模型/用量）。只在不在行内时搬一次，
    // 之后不再抢位置 —— 权限按钮也按「紧跟 .chat-context」自我排序，反复
    // insertBefore 会互相把对方拽着来回跳。
    if (btn.parentNode !== row) {
      var ctxEl = row.querySelector('.chat-context');
      if (ctxEl && ctxEl.parentNode === row) row.insertBefore(btn, ctxEl);
      else row.appendChild(btn);
    }
    var sid = currentSession();
    if (startedSession !== '' && sid !== startedSession) startedSession = '';  // 换会话：重置
    var blank = isBlankChat() && !(sid !== '' && sid === startedSession);
    btn.classList.toggle('dm-icon-hidden', !blank);
    if (blank) btn.removeAttribute('aria-hidden');
    else btn.setAttribute('aria-hidden', 'true');
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
  setInterval(ensure, 300);
  ensure();
})();
</script>`
