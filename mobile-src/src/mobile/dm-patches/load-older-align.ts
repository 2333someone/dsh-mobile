/**
 * 迁移 C：1:1 搬自宿主 index.js 的 `LOAD_OLDER_ALIGN_HTML` 注入字符串。
 * 加载更早后把提问气泡对到视口顶部
 *
 * 由 `dm-patches/index.ts` 在 bundle 启动时按原顺序安装。
 */
// ── 「加载更早」后的视口对准 ────────────────────────────────────────────────
//
// bundle 的 Wr() 取完更早一页后，会把 scrollTop 设为「点之前的位置 + Σ 估算行高」，
// 目的是让用户原来看着的那段内容留在原地。但：
//   · Ll(row) 只是估算（真实高度要等渲染后由 be.current 量出来），prepend 的那批
//     行基本都没量过；
//   · 设置 scrollTop 的那一帧内容还没长到最终高度，浏览器会把值 clamp 到当时的
//     scrollHeight；
//   · 列表够长时还有虚拟窗口 u.slice(Si, Ci)，视口上方用 Oi 占位。
// 结果就是落在 prepend 块中间某个 assistant/思考折叠上，而本轮 user 提问气泡被
// 留在视口上方（实测：scrollTop 11560→3032，新 user 气泡在视口上方 2960px）。
//
// 这里只做一件事：用户点了聊天记录里的「加载更早」之后，把新 prepend 进来的
// 第一个 .chat-msg-user 对到视口顶部；钉几帧盖过 bundle 自己的 rAF 修正，然后
// 交还控制权。用户一滑动/滚轮就立刻放弃，之后不再干预。
export const LOAD_OLDER_ALIGN_HTML = `<script>
(function () {
  try {
    if (window.__dmOlderAlign) return;
    window.__dmOlderAlign = true;

    var OFFSET = 8;        // 提问气泡离视口顶部的留白
    var PIN_FRAMES = 24;   // 钉住约 0.4s，盖过 bundle prepend 后的 rAF 补偿
    var WAIT_FRAMES = 900; // 最多等约 15s（与 bundle 的请求超时一致）
    var state = null;      // { before, target, waiting, pinLeft, triedTop }

    function scroller() { return document.querySelector('.chat-scroll'); }

    function firstNewUser(sc, before) {
      var list = sc.querySelectorAll('.chat-msg-user');
      for (var i = 0; i < list.length; i++) {
        var mid = list[i].getAttribute('data-mid');
        if (mid && !before[mid]) return list[i];
      }
      return null;
    }

    function align(sc, el) {
      var top = el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop;
      var want = Math.max(0, top - OFFSET);
      if (Math.abs(sc.scrollTop - want) > 1) sc.scrollTop = want;
    }

    function stop() { state = null; }

    function tick() {
      if (state === null) return;
      var sc = scroller();
      if (sc === null) {
        if (--state.waiting > 0) window.requestAnimationFrame(tick); else stop();
        return;
      }
      var el = state.target;
      if (el === null || !el.isConnected) el = firstNewUser(sc, state.before);
      if (el !== null) {
        state.target = el;
        align(sc, el);
        if (--state.pinLeft > 0) { window.requestAnimationFrame(tick); return; }
        stop();
        return;
      }
      // 兜底：新气泡可能还在虚拟窗口之外（视口上方被 Oi 占位盖住）。先把
      // scrollTop 拉到 0 逼 bundle 把窗口算到头部，下一帧再找。
      if (!state.triedTop && state.waiting < WAIT_FRAMES - 90) {
        state.triedTop = true;
        sc.scrollTop = 0;
      }
      if (--state.waiting > 0) { window.requestAnimationFrame(tick); return; }
      stop();
    }

    function begin(sc) {
      var before = {};
      var list = sc.querySelectorAll('.chat-msg-user');
      for (var i = 0; i < list.length; i++) {
        var mid = list[i].getAttribute('data-mid');
        if (mid) before[mid] = true;
      }
      state = { before: before, target: null, waiting: WAIT_FRAMES, pinLeft: PIN_FRAMES, triedTop: false };
      window.requestAnimationFrame(tick);
    }

    // 只认聊天记录里的按钮：bundle 的报错页重试按钮也用 .chat-load-older，
    // 但它不在 .chat-scroll 里，必须排除。捕获阶段旁听，不阻止 bundle 的处理。
    document.addEventListener('click', function (e) {
      var t = e.target;
      while (t && t !== document && !(t.classList && t.classList.contains('chat-load-older'))) t = t.parentNode;
      if (!t || t === document || !t.classList || !t.classList.contains('chat-load-older')) return;
      var sc = scroller();
      if (sc === null || !sc.contains(t)) return;
      begin(sc);
    }, true);

    // 用户手动滚动就放弃自动对准（点按钮本身的那次触摸不算）。
    ['touchstart', 'wheel', 'keydown'].forEach(function (type) {
      document.addEventListener(type, function (e) {
        if (state === null) return;
        var t = e.target;
        if (t && t.closest && t.closest('.chat-load-older')) return;
        var sc = scroller();
        if (sc !== null && t instanceof Node && sc.contains(t)) stop();
      }, true);
    });

    // 供验收脚本观察状态（不影响页面逻辑）。
    window.__dmOlderAlignState = function () {
      if (state === null) return null;
      return { waiting: state.waiting, pinned: state.target !== null, triedTop: state.triedTop };
    };
  } catch (e) {}
})();
</script>`
