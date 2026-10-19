/**
 * 迁移 C：1:1 搬自宿主 index.js 的 `CHAT_STATUS_HTML` 注入字符串。
 * 聊天输入区的状态行（正在生成/输出中）
 *
 * 由 `dm-patches/index.ts` 在 bundle 启动时按原顺序安装。
 */
// 聊天状态词 + 「输出中」行的鲸鱼尾（需求：手机上两处微调）。
//
// 1) 过程卡的状态词：bundle 把状态词渲染成 <span class="chat-proc-state">深度求索中</span>
//    （另外三个是 已完成 / 已中断 / 失败）。整个折叠块展示的本来就是思考过程，叫
//    「深度求索中」不准确 —— 这里在运行时把该 span 里的文本节点改成「思考中」。
//    只认这两个 class 与这个词，正文里的同名词不会被误伤；React 以后把状态改成
//    已完成/失败时会照常覆盖 nodeValue，所以替换必须每次走一遍（Observer + 幂等）。
//
// 2) 底部 <div class="chat-turn-status"> 状态行在输出时渲染「输出中」+ 三个呼吸点。
//    鲸鱼尾挂在折叠块图标位置不直观，改成插在这一行文字前面；只在「输出中」时出现，
//    「后台处理中 / 连接中断」不显示。鲸鱼尾复用 .dm-whale 的 mask + currentColor
//    （见 theme.css），颜色自动继承该行的 var(--accent)。
//
// 3) 工具栏上方的运行状态条 .chat-status-strip 会把「子代理 N 个运行中」拼进
//    .chat-status-text（bundle: parts.push('子代理 ' + i + ' 个运行中')）。工具栏
//    已经有带数字角标的子代理图标，这段文字冗余：按 ` · ` 拆段后丢掉「子代理 …」
//    段，其余（任务 x/y、后台任务 N 个）原样拼回；若过滤后整条为空，则隐藏整条
//    strip。React 重渲染把原文案写回来时，Observer 会再过滤一遍。
//
// 全程幂等：每次 flush 先看现状再动 DOM，自己触发的 mutation 不会造成循环。
export const CHAT_STATUS_HTML = `<script>
(function () {
  try {
    if (!document.body) return;

    var PROC_STATE = '.chat-proc-state';
    var TURN = '.chat-turn-status';
    var TURN_CLASS = 'chat-turn-status';
    var FROM = '深度求索中';   // bundle 里 Mc.running
    var TO = '思考中';
    var WHALE = 'dm-turn-whale';
    var RUNNING = '输出中';
    // 用户要求：底部状态行文案由「输出中」改成「深度求索中」（与过程卡用词统一）。
    // 只换**可见文本**；aria-label 仍是 bundle 写的「输出中」，鲸鱼尾/状态判定
    // 两种写法都认（见 turnState 的归一化）。
    var RUNNING_TEXT = '深度求索中';
    // 原始 SSE 收到当前会话的 turn/end 后置位，下一轮 turn/start 复位（见 §5）。
    // 只在「turn/end 被 fold 丢掉、状态行卡在输出中」时起作用，正常回合用不到。
    var TURN_ENDED = false;

    function trim(s) {
      return (s || '').replace(/^\\s+|\\s+$/g, '');
    }

    // ── 1) 状态词：只改 .chat-proc-state 下「恰好是这个词」的文本节点 ───────
    // 不写 el.textContent：React 持有那个文本节点实例，重写会把它摘掉，
    // 之后状态变化就更新不到 DOM 了。直接把 nodeValue 改掉，实例仍在原位。
    function renameProcState() {
      var list = document.querySelectorAll(PROC_STATE);
      for (var i = 0; i < list.length; i++) {
        var kids = list[i].childNodes;
        for (var k = 0; k < kids.length; k++) {
          var n = kids[k];
          if (n.nodeType !== 3) continue;
          var v = n.nodeValue;
          if (v === FROM) n.nodeValue = TO;
          // 容错：万一前后带了空白（不会出现在当前 bundle 里），保留空白只换词。
          else if (v && trim(v) === FROM) n.nodeValue = v.replace(FROM, TO);
        }
      }
    }

    // ── 2) 「输出中」行的鲸鱼尾 ────────────────────────────────────────────
    function ownWhale(row) {
      for (var i = 0; i < row.childNodes.length; i++) {
        var n = row.childNodes[i];
        if (n.nodeType === 1 && n.classList && n.classList.contains(WHALE)) return n;
      }
      return null;
    }

    // 状态词只从 aria-label / 纯文本取（呼吸点是没有文字的 span，读不出来）。
    // aria-label 是 bundle 同步写的（输出中 / 后台处理中 / 连接中断），最可靠；
    // 万一以后没了 aria-label，再退回文本节点。
    function turnState(row) {
      var label = row.getAttribute && row.getAttribute('aria-label');
      var v = label ? trim(label) : '';
      if (v === '') {
        var kids = row.childNodes;
        for (var i = 0; i < kids.length; i++) {
          if (kids[i].nodeType === 3) v += kids[i].nodeValue;
        }
        v = trim(v);
      }
      // 「输出中」是 bundle 的原文案；状态行文字会被 §2b 改成「深度求索中」，
      // 两种写法都视为运行中，鲸鱼尾逻辑不用改。
      if (v === RUNNING_TEXT) return RUNNING;
      return v;
    }

    // ── 2b) 状态行文案：输出中 → 深度求索中 ──────────────────────────────
    // 只改文本节点的 nodeValue（React 持有该节点，重写 textContent 会让它失联），
    // 呼吸点（.chat-turn-dots）是元素、不受影响。React 写回原文案时 Observer 再改。
    function renameTurnText() {
      var rows = document.querySelectorAll(TURN);
      for (var i = 0; i < rows.length; i++) {
        var kids = rows[i].childNodes;
        for (var k = 0; k < kids.length; k++) {
          var n = kids[k];
          if (n.nodeType !== 3) continue;
          if (trim(n.nodeValue) === RUNNING && n.nodeValue !== RUNNING_TEXT) {
            n.nodeValue = RUNNING_TEXT;
          }
        }
      }
    }

    // ── 2c) 运行中显示已用时：深度求索中，用时 N 秒 ─────────────────────────
    // 起点 = 原始 SSE 的 turn/start（§5 的 EventSource 包装里置位）；没收到
    // turn/start（例如刚进页面时回合已经在跑）时退回「第一次看到运行中的状态行」。
    // 每秒刷新走共享的 __dmEnsureTick，不新开 setInterval；turn 结束后停表、把最后
    // 一次的用时原样保留（不跳回 0），下一轮 turn/start 重新计时。
    var turnStart = 0;
    var elapsedEl = null;
    var ELAPSED_CLASS = 'dm-turn-elapsed';

    function fmtElapsed(ms) {
      var total = Math.floor(ms / 1000);
      if (total < 0) total = 0;
      if (total < 60) return total + ' 秒';
      return Math.floor(total / 60) + ' 分 ' + (total % 60) + ' 秒';
    }

    function syncElapsed() {
      var rows = document.querySelectorAll(TURN);
      var row = rows.length ? rows[0] : null;
      if (!row) { elapsedEl = null; return; }
      var running = !TURN_ENDED && turnState(row) === RUNNING;
      if (!running) return;                       // 结束态：冻结在最后一秒，不重写
      var textNode = null;
      for (var k = 0; k < row.childNodes.length; k++) {
        var n = row.childNodes[k];
        if (n.nodeType === 3 && trim(n.nodeValue) !== '') { textNode = n; break; }
      }
      if (!textNode) return;
      if (turnStart === 0) turnStart = Date.now();
      if (!elapsedEl || elapsedEl.parentNode !== row) {
        elapsedEl = document.createElement('span');
        elapsedEl.className = ELAPSED_CLASS;
        // 等宽数字：秒数跳动时行宽不抖，320 下不换行、不挤压。
        elapsedEl.style.fontVariantNumeric = 'tabular-nums';
        row.insertBefore(elapsedEl, textNode.nextSibling);
      }
      var label = '，用时 ' + fmtElapsed(Date.now() - turnStart);
      if (elapsedEl.textContent !== label) elapsedEl.textContent = label;
    }

    function syncTurn() {
      var rows = document.querySelectorAll(TURN);
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var whale = ownWhale(row);
        var show = !TURN_ENDED && turnState(row) === RUNNING;
        if (show && !whale) {
          var w = document.createElement('span');
          // 空元素：形状由 theme.css 的 mask 画、颜色由 currentColor 给。
          w.className = 'dm-whale ' + WHALE;
          w.setAttribute('aria-hidden', 'true');
          row.insertBefore(w, row.firstChild);
        } else if (!show && whale) {
          row.removeChild(whale);
        }
      }
      sweepWhales();
    }

    // 全局兜底（不依赖状态行还在我们以为的位置上）：
    //   · 状态行被 React 移除 / 换成别的节点后，若鲸鱼尾还连着，父容器已不是
    //     「输出中」状态行 —— 摘掉；
    //   · 同一行被重复插入了第二只 —— 只保留第一只；
    //   · 原始 SSE 已报过 turn/end —— 状态行哪怕还卡在「输出中」也不留鲸鱼尾。
    // 每次 flush 都跑，幂等；自己 remove 的节点不会再次命中。
    function sweepWhales() {
      var all = document.querySelectorAll('.' + WHALE);
      var keptRow = null;
      for (var i = 0; i < all.length; i++) {
        var w = all[i];
        var row = w.parentNode;
        var ok = !TURN_ENDED && row && row.nodeType === 1 &&
          row.classList && row.classList.contains(TURN_CLASS) &&
          turnState(row) === RUNNING;
        if (ok && keptRow !== row) {
          keptRow = row;
          continue;
        }
        if (w.parentNode) w.parentNode.removeChild(w);
      }
    }

    // ── 3) 状态条去掉「子代理 N 个运行中」段 ──────────────────────────────
    // 只认 bundle 的固定文案：以「子代理 」开头，且以「 个运行中」或「 个」结尾。
    // 「任务 1/2」「后台任务 1 个(运行中)」不以这个前缀开头，原样保留。
    var STATUS_TEXT = '.chat-status-text';
    var STATUS_STRIP = '.chat-status-strip';
    var STATUS_SEP = ' · ';
    var STATUS_HIDDEN = 'data-dm-status-hidden';

    function isSubagentPart(part) {
      return part.indexOf('子代理 ') === 0 &&
        (/ 个运行中$/.test(part) || / 个$/.test(part));
    }

    // null = 没有子代理段（不用动 DOM）；'' = 整条都该去掉；其它 = 过滤后的文本。
    function filterStatus(raw) {
      var parts = raw.split(STATUS_SEP);
      var kept = [];
      var dropped = false;
      for (var i = 0; i < parts.length; i++) {
        if (isSubagentPart(parts[i])) {
          dropped = true;
          continue;
        }
        kept.push(parts[i]);
      }
      if (!dropped) return null;
      return kept.length ? kept.join(STATUS_SEP) : '';
    }

    // 只改 React 持有的那个文本节点的 nodeValue；不 replaceChild、不写 textContent，
    // 否则 React 之后的重渲染会写到被摘掉的旧节点上，DOM 就再也不更新了。
    function writeStatusText(el, text) {
      var first = null;
      var kids = el.childNodes;
      for (var i = 0; i < kids.length; i++) {
        if (kids[i].nodeType !== 3) continue;
        if (!first) first = kids[i];
        else if (kids[i].nodeValue) kids[i].nodeValue = '';
      }
      if (first) {
        if (first.nodeValue !== text) first.nodeValue = text;
      } else if (text) {
        el.appendChild(document.createTextNode(text));
      }
    }

    // 显隐只撤销自己设的那一次，避免和 bundle / CSS 自己的显示规则打架。
    function setStripHidden(strip, hide) {
      if (!strip) return;
      if (hide) {
        if (strip.style.display !== 'none') strip.style.display = 'none';
        if (strip.getAttribute(STATUS_HIDDEN) === null) {
          strip.setAttribute(STATUS_HIDDEN, '');
        }
      } else if (strip.getAttribute(STATUS_HIDDEN) !== null) {
        strip.style.display = '';
        strip.removeAttribute(STATUS_HIDDEN);
      }
    }

    // 幂等：自己写回的文本不含「子代理 」，下一轮什么都不做；React 若把原文案
    // 写回来，Observer 会再进来过滤一次，两边不会互相触发成死循环。
    function syncStatusText() {
      var list = document.querySelectorAll(STATUS_TEXT);
      for (var i = 0; i < list.length; i++) {
        var el = list[i];
        var raw = el.textContent || '';
        var next = filterStatus(raw);
        var strip = el.closest ? el.closest(STATUS_STRIP) : null;
        if (next === null) {
          // 已经是不含子代理段的文案：若之前整条被藏起来，这时恢复显示。
          if (raw) setStripHidden(strip, false);
          continue;
        }
        writeStatusText(el, next);
        setStripHidden(strip, next === '');
      }
    }

    // ── 4) 去掉过程卡里重复的「思考中」 ───────────────────────────────────
    // 过程卡 head 有两行：
    //   第一行 .chat-proc-line.chat-proc-label → .chat-proc-state（状态词，已改成「思考中」）
    //   第二行 .chat-proc-line.chat-proc-current → .chat-proc-current-text（当前步骤）
    // 思考阶段两行都是「思考中」，同一个词出现两次。
    //
    // **不能整行隐藏**：原来把第二行 display:none 掉，思考时卡片矮一行、工具调用一来
    // 第二行又冒出来，视觉上就是「突然多出一行」——卡片高度来回跳。
    // 现在的做法是只隐藏**第一行里那个重复的状态词文字**（图标/用时都留着，行高不变），
    // 于是：
    //   · 思考阶段：第一行的「思考中」隐去，第二行的「思考中」可见 → 只出现一次，高度不变
    //   · 工具阶段：第一行「思考中」恢复，第二行变成「运行命令」→ 两行共存，高度也不变
    // 挂自己的 class + CSS display:none，不动 React 的节点与文字。
    var CUR_LINE = '.chat-proc-current';
    var CUR_TEXT = '.chat-proc-current-text';
    var DUP = 'dm-proc-dup';

    function dedupeProcCurrent() {
      var heads = document.querySelectorAll('.chat-proc-head');
      for (var i = 0; i < heads.length; i++) {
        var head = heads[i];
        var state = head.querySelector(PROC_STATE);
        var cur = head.querySelector(CUR_LINE);
        if (!state) continue;
        // 运行中（有当前步骤行）时，把第一行**整行**藏起来 —— 那一行是
        // 「沙漏图标 + 状态词 + 用时」，运行中只留下面那行动态状态（图标随步骤变），
        // 否则会出现「沙漏占一行 + 动态行又一行」的两层图标。
        // 回合结束后 bundle 会移除 .chat-proc-current，这里自然回到
        // 「✓ 已完成 · 用时 N 秒」的原样；两种状态下 head 都是一行高，不会跳。
        var line = state;
        while (line && line.nodeType === 1 && !line.classList.contains('chat-proc-label')) {
          line = line.parentNode;
        }
        if (!line || line.nodeType !== 1) line = null;
        var target = line || state;
        if (cur && !target.classList.contains(DUP)) target.classList.add(DUP);
        else if (!cur && target.classList.contains(DUP)) target.classList.remove(DUP);
      }
    }

    // ── 4b) 当前步骤 → 进行时中文（单行动态状态 + 图标随步骤变）────────────
    // bundle 给 .chat-proc-current-text 的是**动作名**：「思考中」「运行命令」
    // 「写入」「读取」「编辑」「搜索内容」「查找文件」「抓取网页」「联网搜索」
    // 「查看图片」「运行代码」「工具」…… 用户希望看到「正在做什么」的进行时说法：
    //     思考中 / 调用工具中 / 写入文件中 / 执行命令中 / 读取文件中 / 搜索中 ……
    // 只改文本节点的 nodeValue（不写 textContent、不 replaceChild），React 若写回
    // 原文案，MutationObserver 会再改一次；值已经对就不动，避免自激循环。
    var STEP_TEXT = '.chat-proc-current-text';
    var STEP_LABELS = {
      '思考中': '思考中',
      '正在回答': '正在回答',
      '运行命令': '执行命令中',
      '运行代码': '运行代码中',
      '写入': '写入文件中',
      '编辑': '编辑文件中',
      '读取': '读取文件中',
      '搜索': '搜索中',
      '搜索内容': '搜索中',
      '查找文件': '查找文件中',
      '抓取网页': '抓取网页中',
      '联网搜索': '联网搜索中',
      '查看图片': '查看图片中',
      '工具': '调用工具中',
      '调用工具': '调用工具中'
    };

    // ── 4c) 思考阶段的行数文案 ──────────────────────────────────────────────
    // 过程卡展开后，下面每一段思考都是「✦ 深度思考 · N 行」；主展开栏却一直写
    // 「思考中」，信息量对不上。这里把 head 上的「思考中」镜像成同一张卡里
    // **最后一段**思考的行数文案（N 随流式增长实时更新）；卡片收起、下面还
    // 没有这一行时退回「思考中」。
    var THINK_LABEL = '.chat-think-label';
    var THINK_TEXT_RE = /^深度思考\s*·\s*\d+\s*行$/;

    function thinkingLabelOf(el) {
      // el 是 head 内的 .chat-proc-current-text：向上找到同一张过程卡。
      var card = el;
      while (card && card.nodeType === 1 && !card.classList.contains('chat-proc')) {
        card = card.parentNode;
      }
      if (!card || card.nodeType !== 1) return '';
      var labels = card.querySelectorAll(THINK_LABEL);
      var text = '';
      for (var i = 0; i < labels.length; i++) {
        var t = trim(labels[i].textContent || '');
        if (t !== '') text = t;   // 取最后一个：最新一段思考
      }
      return text;
    }

    function progressiveStep() {
      var nodes = document.querySelectorAll(STEP_TEXT);
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        var kids = el.childNodes;
        for (var k = 0; k < kids.length; k++) {
          var n = kids[k];
          if (n.nodeType !== 3) continue;
          var raw = trim(n.nodeValue || '');
          if (raw === '') continue;
          // 思考阶段：显示和下面那一行一样的「深度思考 · N 行」。
          if (raw === '思考中' || THINK_TEXT_RE.test(raw)) {
            var thinkText = thinkingLabelOf(el);
            var nextThink = thinkText === '' ? '思考中' : thinkText;
            if (n.nodeValue !== nextThink) n.nodeValue = nextThink;
            continue;
          }
          // 已经是进行时（以「中」结尾）就不用再改，避免「执行命令中中」。
          if (/中$/.test(raw)) continue;
          var next = STEP_LABELS[raw];
          if (next === undefined) next = raw + '中';   // 未知动作：兜底加「中」
          if (n.nodeValue !== next) n.nodeValue = next;
        }
      }
    }

    // ── 5) 原始 SSE 的 turn/end：状态行卡住时也要摘掉鲸鱼尾 ────────────────
    // bundle 的 mux 只 fold seq 大于水位的事件；一旦 turn/end 被当成旧事件丢掉，
    // 它的 live-turn 状态就永远为 true —— 状态行不消失、aria-label 一直是
    // 「输出中」，只靠 §2 的 DOM 判据永远清不掉鲸鱼尾，只能刷新网页。
    // 这里旁听 /m/api/events.mux 的原始 SSE 帧：收到当前会话的 turn/end 就把
    // TURN_ENDED 置位，下一次 flush 摘掉鲸鱼尾；turn/start 复位。
    // 只 addEventListener，不碰 onmessage / onerror / close，也不改事件数据；
    // 解析前先做子串预判，流式 chunk 不会额外 JSON.parse。
    // 会话假设：mux 一次只 observe 当前会话，所以它的 session/event 都属于本页。
    function watchTurnEnd() {
      var Native = window.EventSource;
      if (!Native || Native.__dmWhalePatched) return;
      function Wrapped(url, opts) {
        var es = new Native(url, opts);
        try {
          if (String(url).indexOf('/events.mux') >= 0) {
            es.addEventListener('message', function (ev) {
              var data = ev && ev.data;
              if (typeof data !== 'string') return;
              if (data.indexOf('turn/end') < 0 && data.indexOf('turn/start') < 0) return;
              var msg;
              try { msg = JSON.parse(data); } catch (e) { return; }
              var event = msg && msg.event;
              if (!event || msg.type !== 'session/event') return;
              if (event.type === 'turn/start') {
                turnStart = Date.now();
                if (TURN_ENDED) { TURN_ENDED = false; schedule(); }
              } else if (event.type === 'turn/end') {
                if (!TURN_ENDED) { TURN_ENDED = true; schedule(); }
              }
            });
          }
        } catch (e) {}
        return es;
      }
      try {
        Wrapped.prototype = Native.prototype;
        if (Native.CONNECTING !== undefined) Wrapped.CONNECTING = Native.CONNECTING;
        if (Native.OPEN !== undefined) Wrapped.OPEN = Native.OPEN;
        if (Native.CLOSED !== undefined) Wrapped.CLOSED = Native.CLOSED;
        Wrapped.__dmWhalePatched = true;
        window.EventSource = Wrapped;
      } catch (e) {}
    }

    function flush() {
      queued = false;
      try { renameProcState(); } catch (e) {}
      try { dedupeProcCurrent(); } catch (e) {}
      try { progressiveStep(); } catch (e) {}
      try { renameTurnText(); } catch (e) {}
      try { syncElapsed(); } catch (e) {}
      try { syncTurn(); } catch (e) {}
      try { syncStatusText(); } catch (e) {}
    }

    var queued = false;
    function schedule() {
      if (queued) return;
      queued = true;
      if (window.requestAnimationFrame) window.requestAnimationFrame(flush);
      else window.setTimeout(flush, 0);
    }

    // characterData 覆盖状态词变化（React 只改 nodeValue），childList 覆盖
    // 行/折叠块的挂载与卸载，aria-label 覆盖状态行自身的状态切换。
    if (window.__dmMutationBus) window.__dmMutationBus.subscribe(schedule, { attributes: true });
    else {
      var mo = new MutationObserver(schedule);
      mo.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['aria-label']
    });
    }
    // 用时每秒刷新：复用共享 ensure tick（120ms 一条表，任务按 period 到期才跑），
    // 不新开 setInterval；状态行不在时 ready() 为假，整条 tick 会自己停表。
    if (window.__dmEnsureTick) window.__dmEnsureTick.add(syncElapsed, 1000, function () { return !!document.querySelector(TURN); });

    // 必须在 bundle 的模块脚本执行前装上（本脚本是内联 classic，早于 deferred
    // module），这样 mux 的 new EventSource 才会经过我们的包装。
    watchTurnEnd();
    schedule();
  } catch (e) {}
})();
</script>`
