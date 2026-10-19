/**
 * 迁移 C：1:1 搬自宿主 index.js 的 `IMAGE_PREVIEW_HTML` 注入字符串。
 * 图片全屏预览（点击图片/待发送缩略图打开）
 */
// ── 全屏图片预览（待发送缩略图 + 聊天图片共用一套 overlay）──────────────────
// 用户诉求：输入框上方「待发送」缩略图点了没反应；聊天里的图片又太大（CSS 侧限高，
// 见 theme.css 的 .chat-md img 规则）。
//
// 来源：
//   · .chat-attach-img      —— 待发送缩略图（以及 .chat-attach-item 空白处）
//   · img.chat-msg-image    —— 已发送的用户图片
//   · .chat-md img          —— assistant markdown 里的图片
// 手法：document 捕获阶段事件委托（React 重渲染后仍然有效）。命中后必须
// preventDefault + stopPropagation —— bundle 在 .chat-scroll 的 onClick 里也会对
// 任意 img 打开它自己的 .lightbox-backdrop；不拦住就会出现「我们的 overlay +
// bundle lightbox」两层遮罩（已实测该行为）。
// 关闭：点遮罩 / 右上角 ✕ / ESC（桌面）。打开期间锁 body 滚动，关闭后恢复原值。
// 不拦截 .chat-attach-remove（× 移除）与 .chat-attach-btn（＋）：它们照常工作。
// 关闭 200ms 后移除节点；再次打开复用同一套构建逻辑，不残留节点。
export const IMAGE_PREVIEW_HTML = `
<script>
(function () {
  try {
    if (window.__dmImagePreview) return;
    window.__dmImagePreview = true;

    var overlay = null;      // { back, img }
    var prevOverflow = null; // 打开前的 body.style.overflow（关闭时原样恢复）
    var closeTimer = 0;

    function hitSource(target) {
      if (!target || !target.closest) return null;
      // overlay 自己的点击交给元素自身处理，避免重复打开/误判
      if (target.closest('.dm-imgpreview')) return null;
      // 移除按钮 / 添加按钮：绝不拦截
      if (target.closest('.chat-attach-remove')) return null;
      if (target.closest('.chat-attach-btn')) return null;
      // 链接里的图片保持跳转行为（与 bundle 自身的判定一致）
      if (target.closest('a')) return null;
      var attach = target.closest('.chat-attach-img');
      if (attach) return attach;
      var item = target.closest('.chat-attach-item');
      if (item) {
        var inner = item.querySelector('.chat-attach-img');
        if (inner) return inner;
      }
      var img = target.closest('img');
      if (!img) return null;
      if (img.classList && img.classList.contains('chat-msg-image')) return img;
      if (img.closest && img.closest('.chat-md')) return img;
      return null;
    }

    function shouldSkip(src) {
      if (typeof src !== 'string' || src === '') return true;
      // 图标是 svg data URL，不该放大（bundle 自己的 lightbox 也跳过这一类）
      if (src.indexOf('data:image/svg') === 0) return true;
      return false;
    }

    function build() {
      var back = document.createElement('div');
      back.className = 'dm-imgpreview';
      back.setAttribute('role', 'dialog');
      back.setAttribute('aria-modal', 'true');
      back.setAttribute('aria-label', '图片预览');
      var img = document.createElement('img');
      img.className = 'dm-imgpreview-img';
      img.alt = '图片预览';
      img.draggable = false;
      var close = document.createElement('button');
      close.type = 'button';
      close.className = 'dm-imgpreview-close';
      close.setAttribute('aria-label', '关闭');
      close.textContent = '✕';
      back.appendChild(img);
      back.appendChild(close);
      back.addEventListener('click', function (e) {
        // 点图片本体不关闭；点遮罩关闭
        if (e.target === back) closePreview();
      });
      close.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        closePreview();
      });
      overlay = { back: back, img: img };
      return overlay;
    }

    function openPreview(src, alt) {
      if (overlay) teardown();
      build();
      overlay.img.src = src;
      overlay.img.alt = alt && alt !== '' ? alt : '图片预览';
      document.body.appendChild(overlay.back);
      if (prevOverflow === null) prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      try { document.body.setAttribute('data-dm-imgpreview', 'open'); } catch (e) {}
      // 下一帧再加 open 类，让 200ms 的透明度过渡真的跑起来
      window.requestAnimationFrame(function () {
        if (overlay) overlay.back.classList.add('dm-imgpreview-open');
      });
    }

    function closePreview() {
      if (!overlay) return;
      var back = overlay.back;
      if (back.classList.contains('dm-imgpreview-closing')) return;
      back.classList.remove('dm-imgpreview-open');
      back.classList.add('dm-imgpreview-closing');
      if (closeTimer) window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(teardown, 200);
    }

    function teardown() {
      if (closeTimer) {
        window.clearTimeout(closeTimer);
        closeTimer = 0;
      }
      if (overlay) {
        if (overlay.back.parentNode) overlay.back.parentNode.removeChild(overlay.back);
        overlay = null;
      }
      // 恢复打开前的滚动状态（可能是空串，也可能已被其它弹层设成 hidden）
      if (prevOverflow !== null) {
        document.body.style.overflow = prevOverflow;
        prevOverflow = null;
      }
      try { document.body.removeAttribute('data-dm-imgpreview'); } catch (e) {}
    }

    // 捕获阶段：必须比 bundle 在 .chat-scroll 上的 onClick（冒泡）更早拿到点击
    document.addEventListener('click', function (e) {
      var img = hitSource(e.target);
      if (!img) return;
      var src = img.currentSrc || img.src || img.getAttribute('src') || '';
      if (shouldSkip(src)) return;
      e.preventDefault();
      e.stopPropagation();
      // DOM 证据：最后一次预览来源（只有 class 名，不含会话内容）
      try {
        document.body.setAttribute('data-dm-imgpreview-from', String(img.className || 'img'));
      } catch (err) {}
      openPreview(src, img.getAttribute('alt') || '');
    }, true);

    // ESC 关闭（桌面浏览器 / 外接键盘）
    document.addEventListener('keydown', function (e) {
      if (!overlay) return;
      if (e.key !== 'Escape' && e.key !== 'Esc') return;
      e.preventDefault();
      e.stopPropagation();
      closePreview();
    }, true);
  } catch (e) {}
})();
</script>
`
