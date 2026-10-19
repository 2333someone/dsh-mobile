/**
 * 迁移 B：1:1 搬自宿主 index.js 的 `USAGE_INLINE_HTML` 注入字符串。
 * 设置 → 用量：把余额行内联到设置页。
 *
 * 只搬位置、不改写：内容仍是原来的 HTML + 内联脚本，由
 * `dm-toolbar/index.ts` 在 bundle 启动时按原顺序安装到 document。
 */
export const USAGE_INLINE_HTML = `<script>
(function () {
  try {
    if (window.__dmUsageInline) return;
    window.__dmUsageInline = true;
    var lastClick = 0;

    // 折叠态的「用量」行：settings-row 按钮，标题文本里含「用量」。
    function collapsedRow() {
      var rows = document.querySelectorAll('button.settings-row');
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        var t = r.querySelector('.card-titleText');
        if (!t || (t.textContent || '').indexOf('用量') < 0) continue;
        return r;
      }
      return null;
    }

    function ensure() {
      var card = document.querySelector('.usage-card');
      if (card) { autoRefresh(card); return; }              // 已展开：只负责自动同步
      var r = collapsedRow();
      if (!r) return;
      var now = Date.now();
      if (now - lastClick < 900) return;                    // 防抖，避免连点
      lastClick = now;
      try { r.click(); } catch (e) {}
    }

    // 进设置自动同步：点一次「刷新」。用户要求把刷新按钮隐藏，但隐藏的元素
    // 仍能被脚本 .click()，于是既能自动取最新余额，又不占界面。
    var lastRefresh = 0;
    function autoRefresh(card) {
      if (Date.now() - lastRefresh < 5000) return;
      var btns = card.querySelectorAll('.usage-actions > button');
      if (btns.length < 2) return;
      var refresh = btns[btns.length - 1];
      if (refresh.disabled) return;
      lastRefresh = Date.now();
      try { refresh.click(); } catch (e) {}
    }

    try {
      var mo = new MutationObserver(ensure);
      mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
    } catch (e) {}
    setInterval(ensure, 1200);
    ensure();
  } catch (e) {}
})();
</script>`
