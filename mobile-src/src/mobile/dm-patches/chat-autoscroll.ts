/**
 * 迁移 C：1:1 搬自宿主 index.js 的 `CHAT_AUTOSCROLL_HTML` 注入字符串。
 * 自动滚动（上滑停止 / 回底恢复 / 发送贴底）
 *
 * 由 `dm-patches/index.ts` 在 bundle 启动时按原顺序安装。
 */
export const CHAT_AUTOSCROLL_HTML = `<script>
(function () {
  try {
    if (window.__dmAutoScroll) return;
    window.__dmAutoScroll = true;

    var FOLLOW_STOP = 120;   // 离底超过这个距离：用户在看上面，停止跟随
    var FOLLOW_RESUME = 80;  // 离底小于这个距离：认为回到末尾，恢复跟随
    // 只在**结论正文**流式输出时跟随：宿主的流式帧里 reasoning-delta 是思考、
    // text-delta 才是最终正文。思考/工具阶段完全不干预，用户可以自由上下翻记录。
    var answering = false;
    var follow = true;
    var raf = 0;
    var lastTop = -1;        // 上一次由本脚本钉住时的 scrollTop
    var pinUntil = 0;        // 发送/自己消息出现后强制贴底的截止时间
    var programmaticUntil = 0; // 本脚本写入 scrollTop 的静默窗口（避免自激）
    var lastUserText = '';   // 最新一条用户消息的文本签名

    function scroller() { return document.querySelector('.chat-scroll'); }
    function distance(el) { return el.scrollHeight - el.scrollTop - el.clientHeight; }

    // 把视口钉到底部，并同步 lastTop，避免下一帧 tick 把自己的写入误判成"用户上滑"。
    function pinBottom() {
      var el = scroller();
      if (!el) return;
      programmaticUntil = Date.now() + 250;
      el.scrollTop = el.scrollHeight;
      lastTop = el.scrollTop;
    }

    function tick() {
      raf = 0;
      var el = scroller();
      if (!el) return;
      // 发送后/自己消息落地后的强制贴底窗口：不受 answering 限制（思考阶段也要到底）。
      if (Date.now() < pinUntil) {
        pinBottom();
        return;
      }
      if (!answering || !follow) return;
      var d = distance(el);
      // 内容变高也会拉大离底距离，但**不会**让 scrollTop 变小；scrollTop 明显
      // 变小只可能是用户往上滑。必须在写入 scrollTop 之前判断：rAF 有可能抢在
      // scroll 事件之前执行，否则用户刚滑走就会被钉回底部。
      if (lastTop >= 0 && el.scrollTop <= lastTop - 16 && d > FOLLOW_STOP) {
        follow = false;
        return;
      }
      el.scrollTop = el.scrollHeight;
      lastTop = el.scrollTop;
    }
    function schedule() { if (!raf) raf = window.requestAnimationFrame(tick); }

    // 用户手动滚动：按离底距离决定停/恢复跟随（捕获阶段拿所有滚动事件）。
    document.addEventListener('scroll', function (e) {
      var el = e.target;
      if (!el || el.nodeType !== 1 || !el.classList || !el.classList.contains('chat-scroll')) return;
      // 本脚本自己写入 scrollTop 引起的滚动不算用户滚动，避免自激。
      if (Date.now() < programmaticUntil) return;
      var d = distance(el);
      // 阈值滞回：>120 停止跟随；<=80 恢复跟随；80~120 之间保持原状态，避免抖动。
      if (d > FOLLOW_STOP) follow = false;
      else if (d <= FOLLOW_RESUME) follow = true;
    }, true);

    // 恢复跟随的唯一入口：底部那个「回到最新消息」圆钮（bundle 的 .chat-jump-latest）。
    // 只旁听点击（捕获阶段、不 preventDefault 也不 stopPropagation），
    // bundle 自己的 onClick 会把界面滚到底，这里只负责把跟随状态打开。
    document.addEventListener('click', function (e) {
      var t = e.target;
      while (t && t !== document && !(t.classList && t.classList.contains('chat-jump-latest'))) {
        t = t.parentNode;
      }
      if (!t || t === document || !t.classList || !t.classList.contains('chat-jump-latest')) return;
      follow = true;
      answering = false;   // 等本轮正文的下一个 text-delta 再接管
      schedule();
    }, true);

    // 点发送/停止按钮：无论当前在什么位置，先回到跟随并立即贴底；思考阶段也生效。
    document.addEventListener('click', function (e) {
      var t = e.target;
      while (t && t !== document && !(t.classList && (t.classList.contains('chat-send') || t.classList.contains('chat-send-stop')))) {
        t = t.parentNode;
      }
      if (!t || t === document || !t.classList) return;
      follow = true;
      pinUntil = Date.now() + 1500;
      pinBottom();
      schedule();
    }, true);

    // 自己发的消息落地：最新一条用户气泡文本变化 → 强制贴底（不是加载更早/虚拟列表重排）。
    function checkUserMessage() {
      var msgs = document.querySelectorAll('.chat-msg-user');
      if (msgs.length === 0) return;
      var last = msgs[msgs.length - 1];
      var text = (last.innerText || '').trim().slice(0, 60);
      if (lastUserText === '') { lastUserText = text; return; }
      if (text !== lastUserText && last.parentElement && last.parentElement.lastElementChild === last) {
        lastUserText = text;
        follow = true;
        pinUntil = Date.now() + 1500;
        pinBottom();
        schedule();
      } else {
        lastUserText = text;
      }
    }

    // 新内容进来 → 若在跟随就贴底。

    function onMutation() {
      checkUserMessage();
      schedule();
    }
    try {
      if (window.__dmMutationBus) window.__dmMutationBus.subscribe(onMutation, { frame: true });
      else {
        var mo = new MutationObserver(onMutation);
        mo.observe(document.documentElement || document.body, { childList: true, subtree: true, characterData: true });
      }
    } catch (e) {}

    // 旁听 SSE 判定「正在生成」：不改 onmessage/onerror，只加 addEventListener。
    try {
      var Native = window.EventSource;
      if (typeof Native === 'function') {
        var Wrapped = function (url, cfg) {
          var es = new Native(url, cfg);
          try {
            if (String(url).indexOf('/m/api/events.mux') >= 0) {
              es.addEventListener('message', function (ev) {
                var raw = ev && ev.data ? String(ev.data) : '';
                if (raw === '') return;
                // 先子串预判，避免每个 chunk 都 JSON.parse。
                if (raw.indexOf('turn/start') >= 0) {
                  // 新的一轮：进入思考/工具阶段，不跟随，也不动滚动位置。
                  // **不要**在这里把 follow 打开 —— 是否跟随由用户决定（上滑=停，
                  // 点「回到最新消息」=恢复），否则用户正翻历史时会被新回合硬拽下去。
                  answering = false;
                } else if (raw.indexOf('text-delta') >= 0) {
                  // 结论正文开始流式：第一次到达时贴底一次，之后持续跟随。
                  if (!answering) {
                    answering = true;
                    // 只在"用户仍在跟随"时才贴底；如果他已经上滑在翻历史，
                    // 就静静把正文写进去，等他点「回到最新消息」再回来。
                    if (follow) {
                      var el0 = scroller();
                      if (el0) el0.scrollTop = el0.scrollHeight;
                    }
                  }
                  if (follow) schedule();
                } else if (raw.indexOf('turn/end') >= 0) {
                  answering = false;
                }
                // reasoning-delta（思考过程）刻意不处理：那时不该自动滚动。
              });
            }
          } catch (e) {}
          return es;
        };
        Wrapped.prototype = Native.prototype;
        Wrapped.CONNECTING = Native.CONNECTING;
        Wrapped.OPEN = Native.OPEN;
        Wrapped.CLOSED = Native.CLOSED;
        window.EventSource = Wrapped;
      }
    } catch (e) {}

    // 只读状态：便于验收脚本判断 follow/answering，不参与任何行为。
    window.__dmAutoScrollState = function () {
      return { follow: follow, answering: answering, lastTop: lastTop, distance: (function () { var el = scroller(); return el ? distance(el) : null; })() };
    };

    // 兜底：某些情况下 SSE 旁听不到（重连/换实现），只要还标记着生成中就继续跟。
    setInterval(function () { if (answering || Date.now() < pinUntil) schedule(); }, 900);
  } catch (e) {}
})();
</script>`
