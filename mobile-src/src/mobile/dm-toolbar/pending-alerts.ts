/**
 * 迁移 B：1:1 搬自宿主 index.js 的 `PENDING_ALERTS_HTML` 注入字符串。
 * 工作区/会话行的待处理橙条 + 铃铛橙点数据源。
 *
 * 只搬位置、不改写：内容仍是原来的 HTML + 内联脚本，由
 * `dm-toolbar/index.ts` 在 bundle 启动时按原顺序安装到 document。
 */
// ── 工作区待处理标记（提问/审批）────────────────────────────────────────────
// 问题：Agent 在「当前没打开的会话」里 ask_user_question 时，bundle 只轮询当前会
// 话的 mobile.pending（SSE live 60s / 非 live 1.5s），工作区列表上没有任何标志，
// 用户不知道 AI 在等他回答 —— 任务直接卡死。
// 方案（用户最终要求）：
//   · 全局每 5s 不带 sessionId 调 mobile.pending；有 pending 的会话行，左侧那条
//     状态竖条变橙色（.dm-pending）；其所属工作区行左侧竖条同样变橙（.dm-pending-ws）。
//     没有顶部提示条、没有红点/红字；pending 清零后自动恢复。
//   · 聊天页：当前会话若有 pending 审批，工具栏铃铛 #dm-approval-btn 右上角出现
//     橙色小圆点（.dm-approval-pending）；提问不点亮铃铛（走聊天里的提问卡）。
// 数据全部来自宿主 RPC（mobile.pending 的 sessions 汇总 + session.list 的标题/cwd），
// 不造假。会话→行仍用标题精确匹配；标题重复（歧义）时宁可不标，避免标错会话。
export const PENDING_ALERTS_HTML = `<script>
(function () {
  'use strict';
  var GLOBAL_POLL_MS = 5000;
  var CHAT_POLL_MS = 1000;
  var sessionsById = new Map();   // sessionId -> { title, cwd }
  var titleToSid = new Map();     // 唯一标题 -> sessionId
  var pendingById = new Map();    // sessionId -> { approvals, questions, total }
  var lastSessionId = '';
  var queued = false;
  var globalBusy = false;

  function rpc(method, payload) {
    return fetch('/m/api/' + method, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rpcId: 'dm-pending-' + Date.now() + '-' + Math.random().toString(36).slice(2), payload: payload || {} })
    }).then(function (res) { return res.json(); }).then(function (json) {
      return json && json.result ? json.result : null;
    });
  }

  // 拦截 fetch 记住「当前正在看的会话」（bundle 的请求体里都带 payload.sessionId）。
  var origFetch = window.fetch;
  if (typeof origFetch === 'function') {
    window.fetch = function (input, init) {
      try {
        var url = typeof input === 'string' ? input : (input && input.url) || '';
        if (url.indexOf('/m/api/') >= 0 && init && typeof init.body === 'string') {
          var body = JSON.parse(init.body);
          var sid = body && body.payload && body.payload.sessionId;
          if (typeof sid === 'string' && sid !== '' && sid !== lastSessionId) {
            lastSessionId = sid;
            setTimeout(applyChat, 0);
          }
        }
      } catch (e) {}
      return origFetch.apply(this, arguments);
    };
  }

  // 工作区层页面 = 不是聊天页、不是自绘全屏页，且有项目列表/会话行的标志元素。
  function isWorkspaceLevel() {
    if (document.querySelector('.chat-composer')) return false;
    if (document.querySelector('.dm-page:not([hidden])') !== null) return false;
    return document.querySelector('.mobile-new, .mobile-quickchip, .sess-titleline') !== null;
  }
  function baseName(path) {
    var text = String(path == null ? '' : path);
    var slash = text.split('/');
    var last = slash[slash.length - 1];
    var back = String.fromCharCode(92);
    var parts = last.split(back);
    return parts[parts.length - 1].trim().toLowerCase();
  }

  /** session.list → sessionId/标题唯一映射；标题重复的会话不参与 DOM 匹配。 */
  function buildSessionMap(items) {
    sessionsById = new Map();
    var byTitle = new Map();
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (!item || typeof item.sessionId !== 'string') continue;
      var values = item.projections && item.projections.values;
      var title = values && typeof values.title === 'string' ? values.title.trim() : '';
      if (title === '') continue;
      sessionsById.set(item.sessionId, { title: title, cwd: typeof item.cwd === 'string' ? item.cwd : '' });
      var list = byTitle.get(title);
      if (list === undefined) byTitle.set(title, [item.sessionId]);
      else list.push(item.sessionId);
    }
    titleToSid = new Map();
    byTitle.forEach(function (ids, title) {
      if (ids.length === 1) titleToSid.set(title, ids[0]);
    });
  }

  function clearMarks() {
    var marked = document.querySelectorAll('.mobile-row.dm-pending, .mobile-row.dm-pending-ws');
    for (var i = 0; i < marked.length; i++) {
      marked[i].classList.remove('dm-pending');
      marked[i].classList.remove('dm-pending-ws');
      marked[i].removeAttribute('data-dm-pending');
      marked[i].removeAttribute('data-dm-pending-ws');
    }
  }

  function applyWorkspace() {
    if (!isWorkspaceLevel()) { clearMarks(); return; }
    var rows = document.querySelectorAll('.mobile-row');
    var pendingCwds = new Map(); // workspace basename -> pending session count
    pendingById.forEach(function (info, sid) {
      if (!info || Number(info.total) <= 0) return;
      var session = sessionsById.get(sid);
      var base = session ? baseName(session.cwd) : '';
      if (base === '') return;
      pendingCwds.set(base, (pendingCwds.get(base) || 0) + 1);
    });
    // 工作区标题出现多次时无法确定归属，宁可不标。
    var wsTitleCount = new Map();
    for (var i = 0; i < rows.length; i++) {
      var t = rows[i].querySelector('.ws-icon') === null ? null : rows[i].querySelector('.card-titleText');
      if (t === null) continue;
      var key = String(t.textContent == null ? '' : t.textContent).trim().toLowerCase();
      if (key !== '') wsTitleCount.set(key, (wsTitleCount.get(key) || 0) + 1);
    }

    var markedSession = new Set();
    var markedWs = new Set();
    for (var j = 0; j < rows.length; j++) {
      var row = rows[j];
      var titleEl = row.querySelector('.sess-title');
      if (titleEl !== null) {
        var title = String(titleEl.textContent == null ? '' : titleEl.textContent).trim();
        var sid = titleToSid.get(title);
        var info = sid === undefined ? undefined : pendingById.get(sid);
        if (info !== undefined && Number(info.total) > 0) {
          row.classList.add('dm-pending');
          row.setAttribute('data-dm-pending', '1');
          markedSession.add(row);
        }
        continue;
      }
      var wsTitleEl = row.querySelector('.ws-icon') === null ? null : row.querySelector('.card-titleText');
      if (wsTitleEl !== null) {
        var wsKey = String(wsTitleEl.textContent == null ? '' : wsTitleEl.textContent).trim().toLowerCase();
        if (wsKey !== '' && (wsTitleCount.get(wsKey) || 0) === 1 && pendingCwds.has(wsKey)) {
          row.classList.add('dm-pending-ws');
          row.setAttribute('data-dm-pending-ws', '1');
          markedWs.add(row);
        }
      }
    }
    var all = document.querySelectorAll('.mobile-row.dm-pending, .mobile-row.dm-pending-ws');
    for (var k = 0; k < all.length; k++) {
      if (!markedSession.has(all[k]) && !markedWs.has(all[k])) {
        all[k].classList.remove('dm-pending');
        all[k].classList.remove('dm-pending-ws');
        all[k].removeAttribute('data-dm-pending');
        all[k].removeAttribute('data-dm-pending-ws');
      }
    }
  }

  // 聊天页：当前会话有 pending 审批 → 铃铛右上角橙点；提问不点亮铃铛。
  function applyChat() {
    var button = document.getElementById('dm-approval-btn');
    if (button === null) return;
    var onChat = document.querySelector('.chat-composer') !== null;
    var info = lastSessionId !== '' ? pendingById.get(lastSessionId) : undefined;
    var hasApproval = onChat && info !== undefined && Number(info.approvals) > 0;
    if (hasApproval) button.classList.add('dm-approval-pending');
    else button.classList.remove('dm-approval-pending');
  }

  function refreshGlobal() {
    if (globalBusy) return;
    globalBusy = true;
    Promise.all([rpc('mobile.pending', {}), rpc('session.list', {})]).then(function (results) {
      globalBusy = false;
      var pendingResult = results[0];
      var listResult = results[1];
      if (!pendingResult || pendingResult.ok !== true || !pendingResult.value) return;
      if (listResult && listResult.ok === true && listResult.value && Array.isArray(listResult.value.items)) {
        buildSessionMap(listResult.value.items);
      }
      pendingById = new Map();
      var rows = Array.isArray(pendingResult.value.sessions) ? pendingResult.value.sessions : [];
      for (var i = 0; i < rows.length; i++) {
        var item = rows[i];
        if (item && typeof item.sessionId === 'string' && Number(item.total) > 0) pendingById.set(item.sessionId, item);
      }
      applyWorkspace();
      applyChat();
    }).catch(function () { globalBusy = false; });
  }

  // 聊天页快速轮询（1s）：当前会话的审批状态，保证进会话 1s 内铃铛亮起/熄灭。
  function refreshChat() {
    if (lastSessionId === '' || document.querySelector('.chat-composer') === null) return;
    rpc('mobile.pending', { sessionId: lastSessionId }).then(function (result) {
      if (!result || result.ok !== true || !result.value) return;
      var approvals = Array.isArray(result.value.approvals) ? result.value.approvals.length : 0;
      var questions = Array.isArray(result.value.questions) ? result.value.questions.length : 0;
      pendingById.set(lastSessionId, { sessionId: lastSessionId, approvals: approvals, questions: questions, total: approvals + questions });
      applyChat();
    }).catch(function () {});
  }

  function scheduleApply() {
    if (queued) return;
    queued = true;
    var run = function () { queued = false; try { applyWorkspace(); applyChat(); } catch (e) {} };
    if (window.requestAnimationFrame) window.requestAnimationFrame(run);
    else window.setTimeout(run, 0);
  }

  try {
    var mo = new MutationObserver(scheduleApply);
    mo.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
  setInterval(function () { try { refreshGlobal(); } catch (e) {} }, GLOBAL_POLL_MS);
  setInterval(function () { try { refreshChat(); } catch (e) {} }, CHAT_POLL_MS);
  refreshGlobal();
})();
</script>`
