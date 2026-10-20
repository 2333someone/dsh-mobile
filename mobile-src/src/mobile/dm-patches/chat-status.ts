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
        // 回合已结束（状态词是「已完成 / 失败 / 中断」）却还留着当前步骤行时，
        // 藏掉那条动态行、把「✓ 已完成 · 用时 N 秒」露出来。
        // 否则删掉工具行之后（例如只有一次提问的一轮）会停在「思考中」，看着像还在跑。
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

    // ── 4d) 头行只显示状态词/工具描述，不显示正文碎片 ────────────────────
    // 这一行钉在卡片顶部，bundle 原先在这里放「最新一段思考原文」或工具参数。
    // 现在按**阶段**归一（跑马灯在 §4e 接管）：
    //   · 思考阶段（.chat-step-icon 带 chat-step-icon-thinking）→ 有思考段就
    //     镜像「深度思考 · N 行」，否则「思考中」；
    //   · 工具阶段 → 保留 bundle 的整行描述（工具名 · 参数摘要），见 progressiveStep。
    function isThinkingStep(el) {
      var cur = el;
      while (cur && cur.nodeType === 1 && !cur.classList.contains('chat-proc-current')) cur = cur.parentNode;
      if (!cur || cur.nodeType !== 1) return true;
      var icon = cur.querySelector('.chat-step-icon');
      if (!icon) return true;
      return icon.classList.contains('chat-step-icon-thinking');
    }

    var VARIANT_LABELS = {
      bash: '执行命令中', code: '运行代码中', read: '读取文件中', write: '写入文件中',
      edit: '编辑文件中', search: '搜索中', fetch: '抓取网页中', web: '联网搜索中',
      image: '查看图片中', tool: '调用工具中'
    };

    function toolLabelOf(el) {
      var cur = el;
      while (cur && cur.nodeType === 1 && !cur.classList.contains('chat-proc-current')) cur = cur.parentNode;
      var icon = cur && cur.nodeType === 1 ? cur.querySelector('.chat-step-icon') : null;
      if (icon) {
        var m = /chat-step-icon-([a-z]+)/.exec(String(icon.className || ''));
        if (m && VARIANT_LABELS[m[1]]) return VARIANT_LABELS[m[1]];
      }
      return '调用工具中';
    }

    function phaseLabelOf(el) {
      var head = el;
      while (head && head.nodeType === 1 && !head.classList.contains('chat-proc-head')) head = head.parentNode;
      var icon = head && head.nodeType === 1 ? head.querySelector('.chat-step-icon') : null;
      if (icon && !icon.classList.contains('chat-step-icon-thinking')) {
        var m = /chat-step-icon-([a-z]+)/.exec(String(icon.className || ''));
        if (m && VARIANT_LABELS[m[1]]) return VARIANT_LABELS[m[1]];
        return '调用工具中';
      }
      return '思考中';
    }

    /**
     * 就地改文字时给一个 140ms 的淡入过渡。
     *
     * 思考/工具那一行动态改文案（「思考中」→「已完成 · 用时 5 秒」、工具描述变化）
     * 是就地把文本节点改掉，不触发任何挂载动画，看起来就是「啪」地换了。
     * 这里在改完之后跑一个很短的透明度过渡：够轻，不会闪。
     */
    function softFade(el) {
      if (!el || typeof el.animate !== 'function') return;
      try {
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      } catch (e) { /* 忽略 */ }
      try {
        el.animate([{ opacity: 0.35 }, { opacity: 1 }], { duration: 140, easing: 'ease-out' });
      } catch (e) { /* 老内核忽略 */ }
    }

    function progressiveStep() {
      var nodes = document.querySelectorAll(STEP_TEXT);
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        var textNode = null;
        var raw = '';
        var kids = el.childNodes;
        for (var k = 0; k < kids.length; k++) {
          var n = kids[k];
          if (n.nodeType !== 3) continue;
          if (textNode === null) {
            textNode = n;
            raw = n.nodeValue || '';
          } else if (n.nodeValue !== '') {
            n.nodeValue = '';
          }
        }
        raw = trim(raw);
        // 回合已结束（head 里有「用时 N 秒」）：这一轮可能已经没有工具行可显示
        // （唯一的工具被「提问」卡片取代），动态行会停在「思考中」。这里直接写
        // 「已完成 · 用时 N 秒」，与折叠头那句一致。
        var headEl = el;
        while (headEl && headEl.nodeType === 1 && !headEl.classList.contains('chat-proc-head')) headEl = headEl.parentNode;
        var timeEl = headEl && headEl.nodeType === 1 ? headEl.querySelector('.chat-proc-time') : null;
        if (timeEl) {
          var doneText = '已完成 · ' + trim(timeEl.textContent || '');
          if (textNode !== null) {
            if (textNode.nodeValue !== doneText) { textNode.nodeValue = doneText; softFade(el); }
          } else {
            el.appendChild(document.createTextNode(doneText));
          }
          continue;
        }
        // 思考阶段：固定状态词（有思考段时镜像它的行数文案）。
        if (isThinkingStep(el)) {
          var thinkText = thinkingLabelOf(el);
          var nextThink = thinkText === '' ? '思考中' : thinkText;
          if (textNode !== null) {
            if (textNode.nodeValue !== nextThink) { textNode.nodeValue = nextThink; softFade(el); }
          } else {
            el.appendChild(document.createTextNode(nextThink));
          }
          continue;
        }
        // 工具阶段：bundle 写的已经是「工具名 · 参数摘要」的整行描述，原样保留，
        // 单行省略号交给注入的 CSS（不换词、不滚动）；只有空文本才兜底状态词，
        // 保证这一行任何时刻都不是空的。
        if (raw === '') {
          var fallback = toolLabelOf(el);
          if (textNode !== null) { textNode.nodeValue = fallback; softFade(el); }
          else el.appendChild(document.createTextNode(fallback));
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
              var msg;
              try { msg = JSON.parse(data); } catch (e) { return; }
              // mux 帧是 {type:'server-request', payload: frame} 信封；兼容直接帧。
              var frame = msg && msg.type === 'server-request' ? msg.payload : msg;
              if (!frame || typeof frame !== 'object') return;
              if (frame.type !== 'session/event' || !frame.event) return;
              var event = frame.event;
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

    // ── 4e) 滚动字幕（.chat-proc-think）也只显示状态词 ─────────────────────
    // bundle 在头行渲染 .chat-proc-think > .chat-proc-think-run，内容是
    // **最新一段思考的原文**（滚动宽度超过就做跑马灯）。它和 §4d 是同一处症状：
    // 思考原文被钉在卡片顶部，工具一来又换成别的 —— 看起来就是「工具调用把
    // 思考顶掉、最新内容显示在上面」。
    // 现在头行是**静态单行**（滚动动画由注入的 CSS 关掉，见 §6 的 style）：
    //   · 思考阶段 → 状态词「思考中」；
    //   · 工具阶段 → bundle 算好的整行描述（「运行命令 · pytest -q」/
    //     「工具 · wait_agent · {...}」），一行放不下就省略号。
    // 工具阶段这行描述在 DOM 里看不到（头行被跑马灯占着），只能从 React 的 props
    // 里读 model.current.text；读不到就退回状态词，任何时刻都不留空行。
    function reactCurrentOf(el) {
      try {
        var keys = Object.keys(el);
        var key = '';
        for (var i = 0; i < keys.length; i++) {
          if (keys[i].indexOf('__reactFiber$') === 0 || keys[i].indexOf('__reactInternalInstance$') === 0) {
            key = keys[i];
            break;
          }
        }
        if (key === '') return null;
        var fiber = el[key];
        for (var guard = 0; fiber && guard < 40; guard++) {
          var props = fiber.memoizedProps;
          if (props && props.model && props.model.current) return props.model.current;
          fiber = fiber.return;
        }
      } catch (e) {}
      return null;
    }

    // 把文本写进 bundle 的文本节点（React 持有它，改 nodeValue 不会摘节点）；
    // 节点不存在时补一个 —— bundle 传空串时 React 不建 text node，药丸就空了。
    function setRunText(el, text) {
      var first = null;
      var kids = el.childNodes;
      for (var k = 0; k < kids.length; k++) {
        var n = kids[k];
        if (n.nodeType !== 3) continue;
        if (first === null) first = n;
        else if (n.nodeValue !== '') n.nodeValue = '';
      }
      if (first !== null) {
        if (first.nodeValue !== text) first.nodeValue = text;
      } else if (text !== '') {
        el.appendChild(document.createTextNode(text));
      }
    }

    function normalizeProcThink() {
      var runs = document.querySelectorAll('.chat-proc-think-run');
      for (var i = 0; i < runs.length; i++) {
        var el = runs[i];
        var thinking = isThinkingStep(el);
        // 思考阶段：**保留 bundle 的思考原文，并让它继续跑马灯滚动**（用户明确要求）。
        // 但若上一拍工具阶段被我们写成了工具描述（图标已经翻回思考、文字却还是工具名
        // ——就是用户说的「图标和命令不同步」），这里把它还原回原文再交给跑马灯。
        if (thinking) {
          if (el.__dmWrote !== undefined && el.__dmOrig !== undefined) {
            setRunText(el, el.__dmOrig);
            el.__dmWrote = undefined;
          }
          continue;
        }
        // 跑马灯是「首尾两份」实现无缝循环：aria-hidden 那份是副本。工具阶段头行改成
        // 静态单行（放不下省略号、不滚动），副本只会变成重复字，清空它。
        var dup = el.getAttribute && el.getAttribute('aria-hidden') === 'true';
        if (dup) {
          setRunText(el, '');
          continue;
        }
        // 上一版这里还会把原文累计到卡片下方（§6），已按用户要求回退，只保留归一。
        var card = el.closest ? el.closest('.chat-proc') : null;
        var label;
        if (card && card.classList.contains('chat-proc-running')) {
          // 工具阶段：显示 bundle 计算好的整行描述（工具名 + 参数摘要）。
          // 它只在 React 的 props 里（头行被跑马灯占着），运行中的卡每帧对一次。
          var info = reactCurrentOf(el);
          label = info !== null && info.kind === 'tool' && info.text ? info.text : phaseLabelOf(el);
        } else {
          // 已结算的卡：描述不会再变，沿用上次写好的，省掉每帧读 props。
          label = el.__dmWrote || phaseLabelOf(el);
        }
        if (label === '') label = '调用工具中';
        // 第一次覆盖前把原文留一份：切回思考阶段时用它还原，避免「工具名」粘在
        // 思考步骤上（跑马灯也就没法显示真正的思考原文）。
        if (el.__dmWrote === undefined) el.__dmOrig = el.textContent;
        el.__dmWrote = label;
        setRunText(el, label);
        // CSS 已经用 transform:none !important 把跑马灯按住；再把 bundle 用
        // Web Animations API 建的那条无限动画 cancel 掉，省掉一个常驻动画。
        // 动画在 bundle 的 effect 里创建（晚于本帧的 rAF），所以先探几帧再放弃，
        // 避免对短文本（本来就没有动画）每帧都探测。
        var track = el.parentNode;
        if (track && track.classList && track.classList.contains('chat-proc-think-track') &&
            track.getAnimations && !track.__dmAnimOff) {
          try {
            var anims = track.getAnimations();
            if (anims.length > 0) {
              for (var a = 0; a < anims.length; a++) anims[a].cancel();
              track.__dmAnimOff = true;
            } else {
              track.__dmAnimProbe = (track.__dmAnimProbe || 0) + 1;
              if (track.__dmAnimProbe > 30) track.__dmAnimOff = true;
            }
          } catch (e) {
            track.__dmAnimOff = true;
          }
        }
      }
    }

    function installHeadStyle() {
      if (document.getElementById('dm-proc-head-style')) return;
      var style = document.createElement('style');
      style.id = 'dm-proc-head-style';
      // 颜色全走主题 token（tokens.ts 的三段调色板），深浅色自动可读；
      // 只在 token 缺失时用后面的浅色兜底。
      style.textContent = [
        // ── 头行只做静态单行：绝不滚动，放不下就省略号 ──────────────────
        // bundle 的跑马灯用 Web Animations API 平移 .chat-proc-think-track；
        // 我们把文本换成状态词/工具描述后它仍在跑（还会把 32px 间隔转到可视区），
        // 这就是「空药丸」的来源。这里用 !important 盖掉动画（动画在层叠里低于
        // author !important），并把第二份副本直接藏掉。
        // 思考阶段的头行是源码里的 ThinkMarquee（WAAPI 平移 .chat-proc-think-track）。
        // 之前为了「静态单行」把 track 的 animation/transform 全 !important 按住，
        // 等于把跑马灯掐死；用户要求思考文字继续滚，这里不再覆盖这几条，只保留
        // 单行与省略号所需的最小约束。
        '.chat-proc-think{overflow:hidden!important;min-width:0!important;white-space:nowrap!important;}',
        '.chat-proc-current-text{overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;}',
        // ── 折叠栏「第二行闪现」────────────────────────────────────────────
        // 头行有两行：.chat-proc-label（状态词 + 用时）与 .chat-proc-current（当前步骤）。
        // 运行中 bundle 会同时渲染两行，两行都可见就是用户看到的「突然多出一行」；
        // 原来只靠 JS 在下一帧给第一行加 .dm-proc-dup 隐藏 —— 进聊天页首帧来不及，
        // 于是闪一下再消失。这里改由 CSS 在样式计算阶段直接隐藏，与渲染同帧生效，
        // 不再依赖 JS 时机；不支持的旧内核仍由 dedupeProcCurrent() 兜底。
        '.chat-proc-head:has(.chat-proc-current) .chat-proc-label{display:none!important;}',
      ].join('');
      (document.head || document.documentElement).appendChild(style);
    }

    // 思考步骤的图标是 bundle 自己画的「云朵」SVG（不是 emoji，emoji→SVG 的映射
    // 碰不到它），而用户指定思考中要用**四角星**。这里直接把那条 path 的 d 换掉，
    // 并在 flush 里与文字同一拍执行（否则会出现「文字已换、图标还停在云朵」的滞后）。
    // 用户给的参考：**实心四角星（凹边 sparkle）**，不是描边星形。
    // 24×24 视框、四条边向中心内凹的贝塞尔曲线，fill=currentColor、无描边 ——
    // 在 18px 下与其它步骤图标同重量，且和「工具」类图标一眼区分。
    var THINK_STAR_PATH = 'M12 3C12.9 8.1 15.9 11.1 21 12 15.9 12.9 12.9 15.9 12 21 11.1 15.9 8.1 12.9 3 12 8.1 11.1 11.1 8.1 12 3Z';

    function paintStar(path) {
      if (path.getAttribute('d') !== THINK_STAR_PATH) path.setAttribute('d', THINK_STAR_PATH);
      if (path.getAttribute('fill') !== 'currentColor') path.setAttribute('fill', 'currentColor');
      if (path.getAttribute('stroke') !== 'none') path.setAttribute('stroke', 'none');
    }

    function overrideThinkGlyph() {
      var paths = document.querySelectorAll('.chat-step-icon-thinking svg path, .chat-proc-lead-running svg path');
      for (var i = 0; i < paths.length; i++) paintStar(paths[i]);
    }

    function flush() {
      queued = false;
      try { renameProcState(); } catch (e) {}
      try { dedupeProcCurrent(); } catch (e) {}
      try { progressiveStep(); } catch (e) {}
      try { overrideThinkGlyph(); } catch (e) {}
      // 文字改完立刻同步图标（emoji→SVG 的替换在另一个注入脚本里），避免图标比文字慢一拍。
      try { if (window.__dmEmojiFlush) window.__dmEmojiFlush(); } catch (e) {}
      try { normalizeProcThink(); } catch (e) {}
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
    //
    if (window.__dmMutationBus) {
      window.__dmMutationBus.subscribe(schedule, { attributes: true });
    } else {
      var mo = new MutationObserver(function () {
        schedule();
      });
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

    // 头行静态单行（关掉跑马灯）/ 空行兜底所需的样式：一启动就装上，
    // 不等第一段思考出现（否则起手那一下还是空药丸）。
    try { installHeadStyle(); } catch (e) {}

    // 必须在 bundle 的模块脚本执行前装上（本脚本是内联 classic，早于 deferred
    // module），这样 mux 的 new EventSource 才会经过我们的包装。
    watchTurnEnd();
    schedule();
  } catch (e) {}
})();
</script>`
