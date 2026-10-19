/**
 * 迁移 B：1:1 搬自宿主 index.js 的 `MODEL_BUTTON_HTML` 注入字符串。
 * 工具栏「模型」按钮（打开 bundle 的模型抽屉）。
 *
 * 只搬位置、不改写：内容仍是原来的 HTML + 内联脚本，由
 * `dm-toolbar/index.ts` 在 bundle 启动时按原顺序安装到 document。
 */
// 输入框上方工具行：+ / 模型 / 上下文用量 图标；模型打开底部上滑抽屉。
// 另：运行中且输入框有文字时，把「停止」按钮改成「发送」（排队发送）。
export const MODEL_BUTTON_HTML = `<button id="dm-model-btn" type="button" aria-label="模型"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M9 9h6M9 12h6M9 15h3"/></svg></button><script>
(function () {
  var btn = document.getElementById('dm-model-btn');
  if (!btn) return;
  var lastSessionId = '';

  // 本页脚本先于 bundle 执行：拦截 RPC 请求，自动记住当前会话 id。
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

  function toolsRow() { return document.querySelector('.chat-tools'); }
  function pill() { return document.querySelector('.chat-pill[aria-label^="切换模型"]'); }
  function sheetOpen() {
    var b = document.querySelector('.sheet-backdrop');
    return !!(b && b.getBoundingClientRect().width > 0);
  }
  function inputEl() { return document.querySelector('.chat-input'); }
  function rpc(method, payload) {
    return fetch('/m/api/' + method, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rpcId: 'dm-' + Date.now(), payload: payload }),
    }).then(function (r) { return r.json(); }).then(function (j) { return j ? j.result : null; });
  }
  function currentSession() {
    try {
      var s = new URL(location.href).searchParams.get('session');
      if (s) return s;
    } catch (e) {}
    return lastSessionId;
  }

  // 把「+」和模型按钮放进输入框上方的工具行（同一层，随页面出现）。
  function ensureTools() {
    var t = toolsRow();
    if (!t) return;
    var row = document.getElementById('dm-tools');
    if (!row) {
      row = document.createElement('div');
      row.id = 'dm-tools';
      var attach = document.createElement('button');
      attach.type = 'button';
      attach.className = 'dm-tool-btn';
      attach.setAttribute('aria-label', '添加内容');
      attach.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
      attach.onclick = function (e) {
        e.preventDefault();
        var b = document.querySelector('.chat-attach-btn[aria-label="添加内容"]');
        if (b) b.click();
      };
      row.appendChild(attach);
      row.appendChild(btn);
    }
    if (row.parentNode !== t) t.insertBefore(row, t.firstChild);
    // 上下文圆环也并入同一组图标，保持完全一致的外观与排列。
    var ctx = document.querySelector('.chat-context');
    if (ctx && ctx.parentNode !== row) row.appendChild(ctx);
  }

  btn.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (sheetOpen()) {
      document.querySelector('.sheet-backdrop').click();
      return;
    }
    var p = pill();
    if (!p) return;
    // 打开内联面板（被 CSS 隐藏），再点「全部…」唤起底部抽屉（模型 + 思考强度）。
    p.click();
    setTimeout(function () {
      var more = document.querySelector('.chat-picker-more');
      if (more) more.click();
      else {
        var scrim = document.querySelector('.chat-picker-scrim');
        if (scrim) scrim.click();
      }
    }, 60);
  });

  // 运行中：输入框有文字时，点「停止」按钮改为排队发送。
  function queueSend(text) {
    var sid = currentSession();
    if (!sid) return;
    rpc('session.prompt', {
      sessionId: sid,
      mode: 'queue',
      content: [{ type: 'text', text: text }],
    }).then(function (res) {
      if (!res || !res.ok) return;
      var ta = inputEl();
      if (!ta) return;
      try {
        var setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
        setter.call(ta, '');
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      } catch (e) {
        ta.value = '';
      }
    });
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    var stopBtn = t && t.closest ? t.closest('.chat-send-stop') : null;
    if (!stopBtn) return;
    var ta = inputEl();
    if (!ta) return;
    var text = (ta.value || '').trim();
    if (text === '') return; // 空输入：保持停止
    e.preventDefault();
    e.stopPropagation();
    queueSend(text);
  }, true);

  // 空白会话还没有用量投影：bundle 只渲染裸文本「上下文 --」（被 CSS 的 font-size:0
  // 藏掉），于是 32px 的用量按钮看上去是空的 —— 用户报的「用量图标不见了」就是它，
  // 不是被我们的 CSS 主动 display:none 掉的。两个补丁各管一半：
  //   · theme.css 用 .chat-context:not(:has(.chat-context-ring))::before 补一个 0% 空环；
  //   · 这里补点击：bundle 的 onClick 在 li===undefined 时什么都不做（pi()），
  //     点开一个只有「0 / 暂无用量」的面板，不伪造任何数字。
  // 有真用量后 bundle 会渲染出 .chat-context-ring，这段逻辑自动让位给它的原生抽屉。
  var ctxPanel = null;
  function closeCtxPanel() {
    if (ctxPanel) ctxPanel.classList.remove('dm-perm-open');
  }
  function openCtxPanel() {
    if (!ctxPanel) {
      var back = document.createElement('div');
      back.className = 'dm-perm-backdrop';
      var sheet = document.createElement('div');
      sheet.className = 'dm-perm-sheet';
      var head = document.createElement('div');
      head.className = 'dm-perm-head';
      var title = document.createElement('div');
      title.className = 'dm-perm-title';
      title.textContent = '上下文用量';
      var close = document.createElement('button');
      close.className = 'dm-perm-close';
      close.type = 'button';
      close.textContent = '✕';
      close.setAttribute('aria-label', '关闭');
      close.onclick = function (e) { e.preventDefault(); closeCtxPanel(); };
      head.appendChild(title);
      head.appendChild(close);
      var body = document.createElement('div');
      body.className = 'dm-perm-body';
      var row = document.createElement('div');
      row.className = 'dm-perm-row';
      var main = document.createElement('div');
      main.className = 'dm-perm-main';
      var name = document.createElement('div');
      name.className = 'dm-perm-name';
      name.textContent = '已使用 0%';
      var sub = document.createElement('div');
      sub.className = 'dm-perm-sub';
      sub.textContent = '会话还没有发出第一条消息，暂无上下文用量。发一条消息后，这里会显示真实的占用比例。';
      main.appendChild(name);
      main.appendChild(sub);
      row.appendChild(main);
      body.appendChild(row);
      sheet.appendChild(head);
      sheet.appendChild(body);
      back.appendChild(sheet);
      back.addEventListener('click', function (e) { if (e.target === back) closeCtxPanel(); });
      document.body.appendChild(back);
      ctxPanel = back;
    }
    ctxPanel.classList.add('dm-perm-open');
  }

  // 捕获阶段拦截：只有「没有真圆环」的空白会话才归我们处理；
  // 有圆环时原样放行，交给 bundle 自己的用量抽屉（含它自己的收起动画）。
  document.addEventListener('click', function (e) {
    var t = e.target;
    var ring = t && t.closest ? t.closest('.chat-context') : null;
    if (!ring) return;
    if (ring.querySelector('.chat-context-ring')) return;
    e.preventDefault();
    e.stopPropagation();
    openCtxPanel();
  }, true);

  // 「/」命令按钮与其余控件**同帧**出现：command-panel 的 ensure 由统一 tick 驱动，
  // 而它注册得比本脚本早 —— 进聊天页的那次唤醒里它先跑（那时 #dm-tools 还没建），
  // 只能等 600ms 的普通总线切片再补进来（实测 / = 683ms，其余控件 = 16ms）。
  // 行是本脚本建的，所以在「React 把 .chat-tools 提交进 DOM」的微任务阶段先把行建好，
  // 再同步唤醒一次 tick：/ 的 ensure 这一轮就能看到行，和其它控件一起在首帧前落位
  // （实测最大最小差 ≤2ms）。观察器只在「行不存在且 .chat-tools 存在」时干活，其余
  // 情况一次 getElementById 就返回。
  function adoptBeforeFirstPaint() {
    try {
      if (document.getElementById('dm-tools')) return;
      if (!document.querySelector('.chat-tools')) return;
      ensureTools();
      var row = document.getElementById('dm-tools');
      if (!row) return;
      var tick = window.__dmEnsureTick;
      if (tick && typeof tick.wake === 'function') tick.wake();
      // / 的 ensure 在本轮唤醒里先于其它「按锚点自我排序」的控件跑，会落在行中段；
      // 这里补到最后，保持原有顺序（…权限 / 铃铛 / 子代理 / 命令）。
      var cmd = document.getElementById('dm-cmd-btn');
      if (cmd && cmd.parentNode === row) row.appendChild(cmd);
    } catch (e) {}
  }
  try {
    if (typeof MutationObserver === 'function') {
      new MutationObserver(adoptBeforeFirstPaint).observe(document.documentElement, { childList: true, subtree: true });
    }
  } catch (e) {}

  if (window.__dmEnsureTick) window.__dmEnsureTick.add(ensureTools, 240, function () { return !!document.querySelector('.chat-composer'); }); else setInterval(ensureTools, 240);
  ensureTools();
})();
</script>`
