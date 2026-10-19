/**
 * 迁移 B：1:1 搬自宿主 index.js 的 `TURN_PILL_HTML` 注入字符串。
 * 聊天页的「第 N 轮」胶囊。
 *
 * 只搬位置、不改写：内容仍是原来的 HTML + 内联脚本，由
 * `dm-toolbar/index.ts` 在 bundle 启动时按原顺序安装到 document。
 */
// 轮次药丸（.chat-jump-turns）改造：
//  1) 中间分隔线：把 label 里的 "/" 文本换成一条短横线（.dm-turn-sep），
//     两个数字分别包进 .dm-turn-cur / .dm-turn-total —— 配合 theme.css 的
//     flex 纵向堆叠，读起来就是「当前在上、横线、总数在下」。
//  2) 关掉长按刮擦：document 捕获阶段对该按钮的 pointerdown/move/up/
//     cancel/lostpointercapture 调 stopImmediatePropagation，React 的监听
//     挂在 #root 上（document 是祖先，捕获阶段先到），bundle 的
//     wr/Tr/Er/Dr 完全收不到事件，刮擦层再也不会出现。
//  3) 点击 = 打开清单：打开清单的 setState（dn）在 bundle 模块闭包里，
//     外部调不到；bundle 的 onClick 只在 e.detail===0（键盘触发）时才
//     dn(!0)，真实点击 detail>0 不走那条分支。所以吞掉真实点击，补发一个
//     detail:0 的合成 click —— React 的 onClick 看到 detail 0 就照原逻辑
//     打开轮次清单。（不用「合成 pointerdown/up」：合成的 pointerId 不是活动
//     指针，wr 里的 setPointerCapture 会抛 NotFoundError。）
//     全程 try/catch，失败只退化为「单击无反应」，不会报错、也不会恢复刮擦。
export const TURN_PILL_HTML = `<script>
(function () {
  var PILL = '.chat-jump-turns';
  var LABEL = '.chat-jump-turns-label';
  var SEP = 'dm-turn-sep';
  var BLOCKED = ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'lostpointercapture'];

  function closest(node, sel) {
    return node && node.closest ? node.closest(sel) : null;
  }

  // ── 1) 中间分隔线：把 "/" 换成一条短横线 ─────────────────────────────
  // 关键：只「搬」不「换」。bundle 渲染 [当前轮, "/", 总轮] 三个文本节点，
  // 这里把每个文本节点 appendChild 进自建的 span —— 文本节点实例始终不变，
  // React 以后改数字（commitTextUpdate: node.nodeValue = …）照旧生效。
  // 如果改写成「删掉原节点、插入新节点」，React 会去更新一个已脱离文档的
  // 节点，数字就再也不变了。
  function decorate(label) {
    if (!label) return false;
    var texts = [];
    for (var i = 0; i < label.childNodes.length; i++) {
      if (label.childNodes[i].nodeType === 3) texts.push(label.childNodes[i]);
    }
    // 已处理过，且 React 没有往 label 下再挂新的裸文本节点：保持原样（幂等）。
    // 若 React 重建了子节点（换会话等），下面会重新包裹一次。
    if (label.querySelector('.' + SEP) && texts.length === 0) return true;
    if (texts.length < 3 && !label.querySelector('.' + SEP)) return false;

    var curSpan = document.createElement('span');
    curSpan.className = 'dm-turn-cur';
    var totalSpan = document.createElement('span');
    totalSpan.className = 'dm-turn-total';
    var sepSpan = document.createElement('span');
    sepSpan.className = SEP;
    sepSpan.setAttribute('aria-hidden', 'true');
    var slashSpan = document.createElement('span');
    slashSpan.className = 'dm-turn-slash'; // theme.css: display:none
    slashSpan.setAttribute('aria-hidden', 'true');

    curSpan.appendChild(texts[0]);
    slashSpan.appendChild(texts[1]);
    totalSpan.appendChild(texts[texts.length - 1]);

    var frag = document.createDocumentFragment();
    frag.appendChild(curSpan);
    frag.appendChild(sepSpan);
    frag.appendChild(totalSpan);
    frag.appendChild(slashSpan);
    while (label.firstChild) label.removeChild(label.firstChild);
    label.appendChild(frag);
    return true;
  }

  function scan() {
    try {
      var labels = document.querySelectorAll(LABEL);
      for (var i = 0; i < labels.length; i++) decorate(labels[i]);
      var pills = document.querySelectorAll(PILL);
      for (var k = 0; k < pills.length; k++) {
        var p = pills[k];
        if (!p.getAttribute('title')) p.setAttribute('title', '点按查看轮次清单');
      }
    } catch (e) {}
  }

  // ── 2) 关掉长按刮擦 ─────────────────────────────────────────────────
  // 只掐事件传播、不 preventDefault：焦点与页面滚动照旧。
  for (var b = 0; b < BLOCKED.length; b++) {
    document.addEventListener(BLOCKED[b], function (event) {
      var pill = closest(event.target, PILL);
      if (!pill) return;
      if (pill.getAttribute('data-dm-bypass') === '1') return; // 放行一轮
      event.stopImmediatePropagation();
    }, true);
  }

  // ── 3) 单击 = 打开轮次清单 ──────────────────────────────────────────
  document.addEventListener('click', function (event) {
    var pill = closest(event.target, PILL);
    if (!pill) return;
    if (pill.getAttribute('data-dm-bypass') === '1') {
      pill.removeAttribute('data-dm-bypass');
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    // 降级：构造不出 MouseEvent 就什么都不做 —— 单击无反应，但刮擦已禁用。
    if (typeof window.MouseEvent !== 'function') return;
    try {
      pill.setAttribute('data-dm-bypass', '1');
      pill.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: 0,
        view: window,
        button: 0,
        buttons: 0
      }));
    } catch (e) {
      try { pill.removeAttribute('data-dm-bypass'); } catch (e2) {}
    }
  }, true);

  // ── 药丸出现 / 换会话重建后重新处理（decorate 幂等，不会重入）────────
  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    window.setTimeout(function () { pending = false; scan(); }, 60);
  }
  try {
    if (window.__dmMutationBus) window.__dmMutationBus.subscribe(schedule);
    else {
      var mo = new MutationObserver(schedule);
      mo.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true
    });
    }
  } catch (e) {}
  if (window.__dmEnsureTick) window.__dmEnsureTick.add(scan, 800, function () { return !!document.querySelector('.chat-jump-turns'); }); else setInterval(scan, 800);
  scan();
})();
</script>`
