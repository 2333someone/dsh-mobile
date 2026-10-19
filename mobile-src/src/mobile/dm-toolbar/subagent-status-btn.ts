/**
 * 迁移 B：1:1 搬自宿主 index.js 的 `SUBAGENT_STATUS_BTN_HTML` 注入字符串。
 * 子代理状态按钮（运行中的子代理数）。
 *
 * 只搬位置、不改写：内容仍是原来的 HTML + 内联脚本，由
 * `dm-toolbar/index.ts` 在 bundle 启动时按原顺序安装到 document。
 */
// 工具行最右侧「子代理状态」图标：当前会话有子代理时才出现，运行中带绿色数字角标，
// 全部空闲时图标转灰；点击打开已有的子代理面板（SUBAGENT_BTN_HTML 那个，不重画）。
//
// 数据不新增轮询：只读 SUBAGENT_BTN_HTML 挂在 window 上的快照（它自己在后台预取
// subagent.list），本脚本每 1s 做一次纯内存同步，一个 RPC 都不发。
export const SUBAGENT_STATUS_BTN_HTML = `<button id="dm-subagent-status-btn" class="dm-tool-btn" type="button" aria-label="子代理状态" title="子代理状态"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5.5" r="2.6"/><circle cx="5" cy="17" r="2.6"/><circle cx="19" cy="17" r="2.6"/><path d="M12 8.1V14M12 14H6.8M12 14h5.2"/></svg><span id="dm-subagent-status-badge" class="dm-icon-badge"></span></button><script>
(function () {
  var btn = document.getElementById('dm-subagent-status-btn');
  if (!btn) return;
  var badge = document.getElementById('dm-subagent-status-badge');

  var SYNC_MS = 1000;   // 纯内存同步（读快照），不发任何 RPC
  function hub() {
    try { return window.__dmSubagentHub || null; } catch (e) { return null; }
  }

  function hide() {
    btn.classList.add('dm-icon-hidden');
    btn.setAttribute('aria-hidden', 'true');
    if (badge) { badge.textContent = ''; badge.classList.remove('dm-icon-badge-show'); }
  }

  function sync() {
    var h = hub();
    if (!h || typeof h.snapshot !== 'function') { hide(); return; }
    var s = h.snapshot();
    if (!s || !s.known || !(s.total > 0)) { hide(); return; }   // 没子代理 / 还没拉到 → 隐藏
    btn.classList.remove('dm-icon-hidden');
    btn.removeAttribute('aria-hidden');
    var running = s.running > 0;
    btn.classList.toggle('dm-icon-idle', !running);
    if (badge) {
      if (running) {
        badge.textContent = s.running > 99 ? '99+' : String(s.running);
        badge.classList.add('dm-icon-badge-show');
      } else {
        badge.textContent = '';
        badge.classList.remove('dm-icon-badge-show');
      }
    }
    btn.setAttribute('title', running ? ('子代理 · ' + s.running + ' 个运行中') : ('子代理 · ' + s.total + ' 个（空闲）'));
  }

  btn.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    var h = hub();
    if (h && typeof h.openPanel === 'function') { h.openPanel(); return; }
    // 兜底：hub 还没挂上（子代理脚本尚未执行完）时点它自己的按钮，效果一致。
    var b = document.getElementById('dm-subagent-btn');
    if (b) b.click();
  });

  function isChatPage() {
    var slots = document.querySelectorAll('.mobile-headerSlot-right');
    for (var i = 0; i < slots.length; i++) {
      if (slots[i].querySelector('button[aria-label="更多"]')) return true;
    }
    return false;
  }

  // 幂等：位置对了就不动。
  function ensure() {
    var row = document.getElementById('dm-tools');
    var tools = document.querySelector('.chat-tools');
    if (!row || !tools || !isChatPage()) {
      if (btn.parentNode) btn.parentNode.removeChild(btn);
      hide();
      return;
    }
    // 审批图标的右边 = 本图标；审批图标不在行内就挂末尾（下一轮再排正）。
    var appr = document.getElementById('dm-approval-btn');
    if (btn.parentNode !== row) {
      if (appr && appr.parentNode === row) row.insertBefore(btn, appr.nextSibling);
      else row.appendChild(btn);
    } else if (appr && appr.parentNode === row && appr.nextSibling !== btn) {
      row.insertBefore(btn, appr.nextSibling);
    }
    sync();
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
  if (window.__dmEnsureTick) window.__dmEnsureTick.add(ensure, 800, function () { return !!document.querySelector('#dm-tools, .chat-tools'); }); else setInterval(ensure, 800);
  setInterval(sync, SYNC_MS);
  hide();
  ensure();
})();
</script>`
