/**
 * 迁移 B：1:1 搬自宿主 index.js 的 `APPROVAL_BTN_HTML` 注入字符串。
 * 工具栏「审批提醒」铃铛 + 未处理橙点。
 *
 * 只搬位置、不改写：内容仍是原来的 HTML + 内联脚本，由
 * `dm-toolbar/index.ts` 在 bundle 启动时按原顺序安装到 document。
 */
// 工具行右侧「审批提醒」图标：有待处理的审批 / 提问时亮起并带数字角标，点开
// 自绘浮层重新列出它们（可反复开关 —— 用户「不小心关掉」的那张卡片就是从这里
// 再打开的），并可在浮层内直接允许 / 拒绝。
//
// 数据全部走已有 RPC：mobile.pending（列举）/ mobile.respond（应答），
// 与 bundle 的审批卡片同源同权限，不新增任何服务端接口。
export const APPROVAL_BTN_HTML = `<button id="dm-approval-btn" class="dm-tool-btn" type="button" aria-label="审批提醒" title="审批提醒"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8.6a6 6 0 1 0-12 0c0 4.4-1.5 5.9-2 6.7-.3.5 0 1.2.7 1.2h14.6c.7 0 1-.7.7-1.2-.5-.8-2-2.3-2-6.7z"/><path d="M13.7 19.4a2 2 0 0 1-3.4 0"/></svg><span id="dm-approval-badge" class="dm-icon-badge"></span></button><script>
(function () {
  var btn = document.getElementById('dm-approval-btn');
  if (!btn) return;
  var badge = document.getElementById('dm-approval-badge');

  var POLL_MS = 6000;       // 角标轮询（复用已有 mobile.pending，与 bundle 同频量级）
  var PANEL_MS = 4000;      // 浮层打开时的刷新间隔
  var lastSessionId = '';
  var panel = null;
  var bgTimer = null;
  var busy = false;
  var snap = { approvals: [], questions: [] };

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
      body: JSON.stringify({ rpcId: 'dm-appr-' + Date.now(), payload: payload })
    }).then(function (r) { return r.json(); }).then(function (j) { return j ? j.result : null; });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // ── 待处理计数：审批按条计，提问按 rpcId 归组后计「批」 ──────────────────
  function groups() {
    var out = [];
    var seen = Object.create(null);
    var qs = Array.isArray(snap.questions) ? snap.questions : [];
    for (var i = 0; i < qs.length; i++) {
      var it = qs[i];
      if (!it || typeof it.rpcId !== 'string' || it.rpcId === '') continue;
      if (seen[it.rpcId]) { seen[it.rpcId].items.push(it); continue; }
      var g = { rpcId: it.rpcId, items: [it] };
      seen[it.rpcId] = g;
      out.push(g);
    }
    return out;
  }
  function count() {
    var a = Array.isArray(snap.approvals) ? snap.approvals.length : 0;
    return a + groups().length;
  }

  function paintBadge() {
    var n = count();
    if (n <= 0) {
      // 常驻显示（用户要求）：没有子代理时保留图标本体，只清掉角标并把图标转灰，
      // 不再加 .dm-icon-hidden / aria-hidden —— 否则工具栏里这个按钮会整块消失。
      btn.classList.remove('dm-icon-hidden');
      btn.removeAttribute('aria-hidden');
      btn.classList.add('dm-icon-idle');
      if (badge) { badge.textContent = ''; badge.classList.remove('dm-icon-badge-show'); }
      return;
    }
    btn.classList.remove('dm-icon-hidden');
    btn.removeAttribute('aria-hidden');
    btn.classList.remove('dm-icon-idle');
    if (badge) {
      badge.textContent = n > 99 ? '99+' : String(n);
      badge.classList.add('dm-icon-badge-show');
    }
  }

  // ── 浮层骨架（一次性建好，之后只换 body） ───────────────────────────────
  function build() {
    var back = el('div', 'dm-approval-backdrop');
    var sheet = el('div', 'dm-approval-sheet');
    var head = el('div', 'dm-approval-head');
    var title = el('div', 'dm-approval-title', '待处理');
    var close = el('button', 'dm-approval-close', '✕');
    close.type = 'button';
    close.setAttribute('aria-label', '关闭');
    head.appendChild(title);
    head.appendChild(close);
    var body = el('div', 'dm-approval-body');
    var status = el('div', 'dm-approval-status');
    sheet.appendChild(head);
    sheet.appendChild(body);
    sheet.appendChild(status);
    back.appendChild(sheet);
    document.body.appendChild(back);

    back.addEventListener('click', function (e) {
      if (e.target !== back) return;
      closePanel();
    });
    close.addEventListener('click', function (e) { e.preventDefault(); closePanel(); });

    panel = { back: back, body: body, title: title, status: status };
    return panel;
  }

  function setStatus(text, kind) {
    if (!panel) return;
    var cls = 'dm-approval-status';
    if (text) cls += ' dm-approval-status-show';
    if (kind) cls += ' dm-approval-status-' + kind;
    panel.status.className = cls;
    panel.status.textContent = text || '';
  }

  function openPanel() {
    if (!panel) build();
    panel.back.classList.add('dm-approval-open');
    setStatus('');
    paint();
    refresh();
  }
  // 收起动画（同子代理面板）：先反向播放动画，结束再移除 open。
  function closePanel() {
    if (!panel) return;
    var back = panel.back;
    if (!back.classList.contains('dm-approval-open')) { setStatus(''); return; }
    if (back.getAttribute('data-dm-closing') === '1') return;
    back.setAttribute('data-dm-closing', '1');
    back.classList.add('dm-closing');
    var sheet = back.querySelector('.dm-approval-sheet');
    if (sheet) sheet.classList.add('dm-closing');
    window.setTimeout(function () {
      back.classList.remove('dm-approval-open');
      back.classList.remove('dm-closing');
      back.removeAttribute('data-dm-closing');
      if (sheet) sheet.classList.remove('dm-closing');
      setStatus('');
    }, 200);
  }
  function isOpen() {
    return !!panel && panel.back.classList.contains('dm-approval-open');
  }

  // 审批卡片：工具名 + 原因 + 允许一次 / 拒绝。
  function approvalCard(a) {
    var card = el('div', 'dm-approval-card');
    card.setAttribute('data-kind', 'approval');
    card.setAttribute('data-approval-id', String(a.approvalId || ''));
    card.setAttribute('data-rpc', String(a.rpcId || ''));
    card.appendChild(el('div', 'dm-approval-card-title', '审批 · ' + (a.toolName || '工具')));
    if (a.reason) card.appendChild(el('div', 'dm-approval-card-sub', String(a.reason)));
    var acts = el('div', 'dm-approval-acts');
    var allow = el('button', 'dm-approval-act dm-approval-allow', '允许一次');
    allow.type = 'button';
    allow.setAttribute('data-outcome', 'allowed-once');
    var deny = el('button', 'dm-approval-act dm-approval-deny', '拒绝');
    deny.type = 'button';
    deny.setAttribute('data-outcome', 'rejected');
    acts.appendChild(allow);
    acts.appendChild(deny);
    card.appendChild(acts);
    return card;
  }

  // 提问卡片：按批（rpcId）分组，每组渲染若干问题（单选 / 多选）+ 提交。
  function questionCard(g) {
    var card = el('div', 'dm-approval-card');
    card.setAttribute('data-kind', 'question');
    card.setAttribute('data-rpc', String(g.rpcId || ''));
    card.appendChild(el('div', 'dm-approval-card-title', '提问'));
    var items = Array.isArray(g.items) ? g.items : [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i] || {};
      var id = String(it.id == null ? i : it.id);
      var box = el('div', 'dm-approval-q');
      box.setAttribute('data-q-id', id);
      if (it.header) box.appendChild(el('div', 'dm-approval-q-header', String(it.header)));
      box.appendChild(el('div', 'dm-approval-q-text', String(it.question || '问题')));
      if (it.detail) box.appendChild(el('div', 'dm-approval-q-detail', String(it.detail)));
      var opts = Array.isArray(it.options) ? it.options : [];
      var list = el('div', 'dm-approval-q-opts');
      var multi = it.multiSelect === true;
      for (var k = 0; k < opts.length; k++) {
        var o = opts[k] || {};
        var label = el('label', 'dm-approval-opt');
        var input = document.createElement('input');
        input.type = multi ? 'checkbox' : 'radio';
        input.name = 'dmq-' + String(g.rpcId || '') + '-' + id;
        input.value = String(o.label == null ? '' : o.label);
        label.appendChild(input);
        label.appendChild(el('span', 'dm-approval-opt-label', input.value));
        if (o.description) label.appendChild(el('span', 'dm-approval-opt-desc', String(o.description)));
        list.appendChild(label);
      }
      box.appendChild(list);
      card.appendChild(box);
    }
    var submit = el('button', 'dm-approval-submit', '提交');
    submit.type = 'button';
    card.appendChild(submit);
    return card;
  }

  function paint() {
    if (!panel) return;
    var body = panel.body;
    body.innerHTML = '';
    var n = count();
    panel.title.textContent = '待处理 · ' + n + ' 项';
    if (n === 0) {
      body.appendChild(el('p', 'dm-approval-hint', '当前没有待处理的审批或提问'));
      return;
    }
    var aps = Array.isArray(snap.approvals) ? snap.approvals : [];
    for (var i = 0; i < aps.length; i++) {
      if (!aps[i]) continue;
      body.appendChild(approvalCard(aps[i]));
    }
    var gs = groups();
    for (var k = 0; k < gs.length; k++) body.appendChild(questionCard(gs[k]));
  }

  function refresh() {
    var sid = currentSession();
    return rpc('mobile.pending', { sessionId: sid }).then(function (res) {
      if (!res || !res.ok || !res.value) return false;
      var v = res.value;
      snap = {
        approvals: Array.isArray(v.approvals) ? v.approvals : [],
        questions: Array.isArray(v.questions) ? v.questions : [],
      };
      paintBadge();
      if (isOpen()) paint();
      return true;
    }).catch(function () { return false; });
  }

  // ── 应答 ────────────────────────────────────────────────────────────────
  function respondApproval(card, outcome) {
    if (busy) return;
    busy = true;
    setStatus('提交中…');
    var aid = card.getAttribute('data-approval-id') || '';
    rpc('mobile.respond', {
      rpcId: card.getAttribute('data-rpc') || '',
      response: { sessionId: currentSession(), approvalId: aid, outcome: outcome }
    }).then(function (res) {
      busy = false;
      if (!isOpen()) return;
      if (!res || !res.ok) {
        setStatus((res && res.error && res.error.message) ? res.error.message : '处理失败', 'err');
        return;
      }
      setStatus(outcome === 'rejected' ? '已拒绝' : '已允许', 'ok');
      refresh();
    }).catch(function () {
      busy = false;
      if (!isOpen()) return;
      setStatus('处理失败', 'err');
    });
  }

  // 提问应答：answers = [{ id, selected:[label…] }]，与 bundle 提交的同形。
  function submitQuestion(card) {
    if (busy) return;
    var boxes = card.querySelectorAll('.dm-approval-q');
    var answers = [];
    for (var i = 0; i < boxes.length; i++) {
      var box = boxes[i];
      var id = box.getAttribute('data-q-id') || '';
      var inputs = box.querySelectorAll('input');
      var selected = [];
      for (var k = 0; k < inputs.length; k++) {
        if (inputs[k].checked) selected.push(inputs[k].value);
      }
      answers.push({ id: id, selected: selected });
    }
    busy = true;
    setStatus('提交中…');
    rpc('mobile.respond', {
      rpcId: card.getAttribute('data-rpc') || '',
      response: { sessionId: currentSession(), answer: { answers: answers } }
    }).then(function (res) {
      busy = false;
      if (!isOpen()) return;
      if (!res || !res.ok) {
        setStatus((res && res.error && res.error.message) ? res.error.message : '提交失败', 'err');
        return;
      }
      setStatus('已提交', 'ok');
      refresh();
    }).catch(function () {
      busy = false;
      if (!isOpen()) return;
      setStatus('提交失败', 'err');
    });
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var act = t.closest('.dm-approval-act');
    if (act) {
      var c1 = act.closest('.dm-approval-card');
      if (!c1 || c1.getAttribute('data-kind') !== 'approval') return;
      e.preventDefault();
      respondApproval(c1, act.getAttribute('data-outcome') || 'rejected');
      return;
    }
    if (t.closest('.dm-approval-submit')) {
      var c2 = t.closest('.dm-approval-card');
      if (!c2 || c2.getAttribute('data-kind') !== 'question') return;
      e.preventDefault();
      submitQuestion(c2);
    }
  });

  btn.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (isOpen()) closePanel();
    else openPanel();
  });

  // ── 只在聊天页显示：与权限按钮同一判据 ──────────────────────────────────
  function isChatPage() {
    var slots = document.querySelectorAll('.mobile-headerSlot-right');
    for (var i = 0; i < slots.length; i++) {
      if (slots[i].querySelector('button[aria-label="更多"]')) return true;
    }
    return false;
  }

  function startPoll() {
    if (bgTimer !== null) return;
    refresh();
    bgTimer = window.setInterval(function () {
      try {
        if (document.visibilityState && document.visibilityState !== 'visible') return;
        refresh();
      } catch (e) {}
    }, POLL_MS);
  }
  function stopPoll() {
    if (bgTimer !== null) { window.clearInterval(bgTimer); bgTimer = null; }
  }

  // 幂等：位置对了就不动，避免被 MutationObserver 反复插入而抖动。
  function ensure() {
    var row = document.getElementById('dm-tools');
    var tools = document.querySelector('.chat-tools');
    if (!row || !tools || !isChatPage()) {
      if (btn.parentNode) btn.parentNode.removeChild(btn);
      btn.classList.add('dm-icon-hidden');
      if (isOpen()) closePanel();
      stopPoll();
      return;
    }
    var perm = document.getElementById('dm-perm-btn');
    if (btn.parentNode !== row) {
      if (perm && perm.parentNode === row) row.insertBefore(btn, perm.nextSibling);
      else row.appendChild(btn);
    } else if (perm && perm.parentNode === row && perm.nextSibling !== btn) {
      row.insertBefore(btn, perm.nextSibling);
    }
    startPoll();
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
