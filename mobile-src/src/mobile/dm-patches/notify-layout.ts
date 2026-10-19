/**
 * 迁移 C：1:1 搬自宿主 index.js 的 `NOTIFY_LAYOUT_HTML` 注入字符串。
 * 通知页布局补丁
 *
 * 由 `dm-patches/index.ts` 在 bundle 启动时按原顺序安装。
 */
export const NOTIFY_LAYOUT_HTML = `<script>
(function () {
  try {
    if (!document.body) return;
    function mark() {
      var titles = document.querySelectorAll('.mobile-title');
      var on = false;
      for (var i = 0; i < titles.length; i++) {
        var text = titles[i].textContent || '';
        if (text.trim() === '通知') { on = true; break; }
      }
      var body = document.body;
      if (on) {
        if (!body.classList.contains('dm-notify-page')) body.classList.add('dm-notify-page');
      } else if (body.classList.contains('dm-notify-page')) {
        body.classList.remove('dm-notify-page');
      }
    }
    mark();
    var queued = false;
    var mo = new MutationObserver(function () {
      if (queued) return;
      queued = true;
      var run = function () { queued = false; mark(); };
      if (window.requestAnimationFrame) window.requestAnimationFrame(run);
      else window.setTimeout(run, 0);
    });
    mo.observe(document.body, { childList: true, subtree: true });
  } catch (e) {}
})();
</script>`
