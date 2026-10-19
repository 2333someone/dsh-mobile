/**
 * 迁移 B：1:1 搬自宿主 index.js 的 `QUEUE_DOCK_PLACE_HTML` 注入字符串。
 * 排队消息 dock 的占位/定位补丁。
 *
 * 只搬位置、不改写：内容仍是原来的 HTML + 内联脚本，由
 * `dm-toolbar/index.ts` 在 bundle 启动时按原顺序安装到 document。
 */
// 排队消息的位置（需求 C）：让 bundle 的 .queue-dock 显示在聊天工具栏（.chat-tools）
// 那一行**上面**，但绝不移动节点本身。
//
// 这个节点是 React 持有的：Ho() 被渲染成 .chat-composer 的第一个子元素。旧实现用
// insertBefore 把它挪到 .chat-tools 之前，队列清空时 React 仍按「原父节点」做
// removeChild，而节点早已不在那里 → `Failed to execute 'removeChild' on 'Node'`
// → 整棵 React 树卸载，整页白屏。所以位置改用纯 CSS 表达，DOM 树一个节点都不动。
//
// 做法：节点留在 .chat-composer 里，由 theme.css 把它 position:absolute 到
// composer 上方；本脚本只量高度，把「工具栏（含运行状态条）+ 8px」写进根节点的
// --dm-queue-lift。绝对定位的包含块就是 position:relative 的 .chat-composer：
//   · 键盘弹起 / composer 变高时自动跟随，不用读 visualViewport；
//   · 滚动消息区不影响它（composer 不在滚动容器里），不需要 scroll 监听；
//   · 不占文档流，所以没有排队项时一点空白都不留。
// 没有 .queue-dock（Ho() 返回 null）时本脚本什么都不做。
export const QUEUE_DOCK_PLACE_HTML = `<script>
(function () {
  try {
    if (!document.documentElement || window.__dmQueueDock) return;
    window.__dmQueueDock = true;

    var root = document.documentElement;
    var raf = 0;
    var last = -1;
    var lastSpace = -1;

    function composer() { return document.querySelector('.chat-composer'); }
    function dock() { return document.querySelector('.chat-composer > .queue-dock[data-queue-dock]'); }
    function tools() { return document.querySelector('.chat-tools'); }

    // 工具栏上方可能还有一条运行状态条（.chat-status-strip：任务 / 后台任务 / 子代理）。
    // dock 要排在整摞底栏控件的上面，否则会正好盖住那一行。只认这一个 class，并且它
    // 必须是 .chat-tools 的前一个兄弟（bundle 的渲染顺序）；隐藏（尺寸为 0）时不算。
    function topOfStack(t) {
      var top = t.getBoundingClientRect().top;
      var prev = t.previousElementSibling;
      if (prev && prev.classList && prev.classList.contains('chat-status-strip')) {
        var r = prev.getBoundingClientRect();
        if (r.height > 0 && r.width > 0 && r.top < top) top = r.top;
      }
      return top;
    }

    function update() {
      raf = 0;
      var c = composer();
      if (!c) return;
      var d = dock();
      if (!d) return;             // 没有排队消息：Ho() 返回 null，不留任何空白
      var t = tools();
      if (!t || !t.parentNode) return;
      var cr = c.getBoundingClientRect();
      var tr = t.getBoundingClientRect();
      // 布局不认识（页面切换中、工具栏被隐藏）时保持上一次的有效值，不写坏变量。
      if (cr.width <= 0 || cr.height <= 0 || tr.width <= 0) return;
      var lift = Math.round(cr.top - topOfStack(t) + 8);
      if (!isFinite(lift) || lift <= 0 || lift > 600) return;
      // 给消息区补的底部留白 = dock 自身高度 + 8px：dock 是浮层，不补的话
      // 滚到最底时最后一条消息会被它盖住。dock 消失后 :has() 规则整体失效，
      // 不占任何空间，所以这里的旧值不用清。
      var space = Math.round(d.getBoundingClientRect().height + 8);
      if (space > 0 && space !== lastSpace) {
        lastSpace = space;
        root.style.setProperty('--dm-queue-space', space + 'px');
      }
      if (lift === last) return;
      last = lift;
      root.style.setProperty('--dm-queue-lift', lift + 'px');
    }

    function schedule() {
      if (raf) return;
      raf = (window.requestAnimationFrame || function (fn) { return setTimeout(fn, 16); })(update);
    }

    // 队列出现/消失、状态条出现、键盘压缩工具栏……都会动到高度：Observer 覆盖结构变化，
    // resize 覆盖视口变化。rAF 合并，同一帧里只量一次。
    try {
      if (window.__dmMutationBus) window.__dmMutationBus.subscribe(schedule);
      else {
        var mo = new MutationObserver(schedule);
        mo.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'hidden']
      });
      }
    } catch (e) {}
    window.addEventListener('resize', schedule);
    // 兜底：字体加载 / 工具栏内部换行等不产生上述变化的情况；低频，开销可忽略。
    setInterval(schedule, 1000);
    update();
  } catch (e) {}
})();
</script>`
