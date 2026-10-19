/**
 * 迁移 C：1:1 搬自宿主 index.js 的 `ADD_SHEET_FILTER_HTML` 注入字符串。
 * 添加提供商面板的过滤/滚动补丁
 *
 * 由 `dm-patches/index.ts` 在 bundle 启动时按原顺序安装。
 */
// ── 「＋ 添加内容」面板只留附件动作 ────────────────────────────────────────
// bundle 把 mobile.commands 的命令也渲染进这个面板（/goal、/plan…）。用户要求
// 命令只出现在「/」面板，这里只保留「图片 / 拍照」。不改 mobile.commands RPC
// （那条数据同时喂「/」面板），只裁这个 menu 的 DOM。
export const ADD_SHEET_FILTER_HTML = `
<script>
(function () {
  try {
    if (window.__dmAddSheetFilter) return;
    window.__dmAddSheetFilter = true;

    // 「＋ 添加内容」面板：bundle 把 mobile.commands 的命令也塞了进来（/goal、/plan…），
    // 用户要求这里只留附件相关（图片 / 拍照），命令只在「/」面板出现。
    // 注意：**不改 mobile.commands RPC** —— 那条数据同时喂「/」面板，改了就两边都没了。
    var MENU = '[role="menu"][aria-label="添加内容"]';

    function apply() {
      var menus = document.querySelectorAll(MENU);
      for (var i = 0; i < menus.length; i++) {
        var menu = menus[i];
        var opts = menu.querySelectorAll('.sheet-option');
        var hidden = 0;
        for (var j = 0; j < opts.length; j++) {
          var title = opts[j].querySelector('.sheet-option-title');
          var text = title ? String(title.textContent || '').replace(/^\s+/, '') : '';
          if (text.charAt(0) === '/') {
            if (opts[j].style.display !== 'none') opts[j].style.display = 'none';
            hidden += 1;
          }
        }
        // 命令块前面那条分隔线也收起（否则面板底部留一条突兀的横线）
        var dividers = menu.querySelectorAll('.sheet-option-divider');
        for (var k = 0; k < dividers.length; k++) {
          var want = hidden > 0 ? 'none' : '';
          if (dividers[k].style.display !== want) dividers[k].style.display = want;
        }
        if (menu.getAttribute('data-dm-add-filtered') !== String(hidden)) {
          menu.setAttribute('data-dm-add-filtered', String(hidden));
        }
      }
    }

    var queued = false;
    function schedule() {
      if (queued) return;
      queued = true;
      window.setTimeout(function () {
        queued = false;
        try { apply(); } catch (e) {}
      }, 60);
    }
    try {
      if (window.__dmMutationBus) window.__dmMutationBus.subscribe(schedule); else new MutationObserver(schedule).observe(document.documentElement || document.body, { childList: true, subtree: true });
    } catch (e) {}
    window.setInterval(function () { try { apply(); } catch (e) {} }, 500);
    apply();
  } catch (e) {}
})();
</script>
`
