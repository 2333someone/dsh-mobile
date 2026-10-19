/**
 * 迁移 B：1:1 搬自宿主 index.js 的 `EMOJI_ICON_HTML` 注入字符串。
 * 输入框的 emoji 图标。
 *
 * 只搬位置、不改写：内容仍是原来的 HTML + 内联脚本，由
 * `dm-toolbar/index.ts` 在 bundle 启动时按原顺序安装到 document。
 */
// emoji 图标替换：bundle 里这些图标是纯文本节点，CSS 换不掉，只能运行时把命中的
// emoji 换成同尺寸的行内描边 SVG。只精确匹配下表里的序列（含 FE0F 变体选择器），
// ▾/▸ 折叠箭头和正文里的 emoji 都不会被碰到。
// 用 splitText 切出 emoji，再把该文本节点「搬」进 display:none 的 .dm-emoji-src
// 并在前面插入 <svg>：只搬不换、不用 replaceChild、绝不 innerHTML 重写整个节点。
// （replaceChild 摘掉文本节点后 React 仍持有它，重渲染时会去更新一个已脱离文档
//  的孤儿节点 —— 图标不更新、还会重复堆叠。与 TURN_PILL_HTML 同一套哲学。）
export const EMOJI_ICON_HTML = `<script>
(function () {
  try {
    if (!document.body) return;
    var NS = 'http://www.w3.org/2000/svg';
    // 统一 24×24 viewBox / fill=none / stroke=currentColor / stroke-width 1.8 / 圆头圆角。
    var ICONS = {
      search: '<circle cx="11" cy="11" r="6.4"/><path d="M15.8 15.8 20 20"/>',
      read: '<path d="M3 7.2A2.2 2.2 0 0 1 5.2 5h3.3l2 2.4H18.8A2.2 2.2 0 0 1 21 9.6v6.2A2.2 2.2 0 0 1 18.8 18H5.2A2.2 2.2 0 0 1 3 15.8z"/>',
      gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 3.6v2.3M12 18.1v2.3M4.7 7.9l2 1.1M17.3 15l2 1.1M4.7 16.1l2-1.1M17.3 8.9l2-1.1"/>',
      pencil: '<path d="M4.6 19.4l1-4L16.7 4.3a2.1 2.1 0 0 1 3 3L8.6 18.4z"/><path d="M14.7 6.3l3 3"/>',
      code: '<path d="M9 7.4 4.7 12 9 16.6"/><path d="M15 7.4 19.3 12 15 16.6"/><path d="M13.6 5.6 10 18.4"/>',
      tool: '<path d="M14.6 6.4a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.8 7.8l-7 7a2.1 2.1 0 1 1-3-3l7-7a6 6 0 0 1 7.8-7.8l-3.8 3.8z"/>',
      running: '<path d="M7.5 4h9"/><path d="M7.5 20h9"/><path d="M8.7 4 12 12l-3.3 8"/><path d="M15.3 4 12 12l3.3 8"/>',
      failed: '<path d="M6.6 6.6 17.4 17.4"/><path d="M17.4 6.6 6.6 17.4"/>',
      stopped: '<rect x="5.6" y="5.6" width="12.8" height="12.8" rx="2.4"/>',
      done: '<path d="M5 12.7 9.4 17 19 6.8"/>',
      warning: '<path d="M12 4.7 20.2 19H3.8z"/><path d="M12 10.1v3.4"/><path d="M12 16.3v.5"/>',
      // 思考中（原 💭 emoji）：云朵状思维气泡 + 三个实心点。
      // 与其它工具图标同一套 24×24 / stroke=currentColor / 1.8 / 圆头风格，
      // 但要把「这是思考」和「这是某个工具」在形状上区分开。
      thinking: '<path d="M8.3 16.5h7.6a3.6 3.6 0 0 0 .5-7.1 4.9 4.9 0 0 0-9.3-1 3.4 3.4 0 0 0 1.2 8.1Z"/><circle cx="9.5" cy="12.7" r=".9" fill="currentColor" stroke="none"/><circle cx="12.3" cy="12.7" r=".9" fill="currentColor" stroke="none"/><circle cx="15.1" cy="12.7" r=".9" fill="currentColor" stroke="none"/>',
      // ── 宿主唤醒消息卡（.chat-trigger-icon）用的 8 个 emoji ──
      // bundle 的 wt 表：agent-message 📨 / team-message 👥 / subagent-settled 🧩 /
      // webhook 🔔 / schedule ⏰ / tool-jobs ⚙️ / cordis-host-runner 🔌 / goal 🎯。
      // 用户要求聊天页不要出现 emoji，这里逐个换成同风格描边图标。
      // inbox（📨 收到任务消息）：圆角信封 + 折线封盖，不要尖直角 —— 18px 下仍是一眼信封。
      inbox: '<rect x="3.1" y="5.9" width="17.8" height="12.2" rx="2.4"/><path d="M4.6 8.1 12 13.2l7.4-5.1"/>',
      people: '<circle cx="9" cy="9.2" r="2.6"/><path d="M4.4 18.4a4.6 4.6 0 0 1 9.2 0"/><circle cx="16.6" cy="10.4" r="2"/><path d="M14.9 18.4a4 4 0 0 1 5.1-3.2"/>',
      // puzzle（🧩 子任务状态更新）：经典拼图块 = 圆角方片 + 顶部一个半圆凸起，
      // 一条闭合 path 描边；原来那条多段凹凸在小尺寸下糊成一团，这里减到 1 个凸起。
      puzzle: '<path d="M10.2 4.7C10.2 2.7 13.8 2.7 13.8 4.7H17A2.3 2.3 0 0 1 19.3 7v3.2C21.3 10.2 21.3 13.8 19.3 13.8V17a2.3 2.3 0 0 1-2.3 2.3H7A2.3 2.3 0 0 1 4.7 17V7A2.3 2.3 0 0 1 7 4.7z"/>',
      bell: '<path d="M18 8.6a6 6 0 1 0-12 0c0 4.4-1.5 5.9-2 6.7-.3.5 0 1.2.7 1.2h14.6c.7 0 1-.7.7-1.2-.5-.8-2-2.3-2-6.7z"/><path d="M13.7 19.4a2 2 0 0 1-3.4 0"/>',
      clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7.4V12l3.2 1.9"/>',
      plug: '<path d="M9 3.6v4.1M15 3.6v4.1"/><path d="M7 7.7h10v2.1a5 5 0 0 1-10 0z"/><path d="M12 14.8v4.6"/>',
      target: '<circle cx="12" cy="12" r="7.6"/><circle cx="12" cy="12" r="3.4"/><circle cx="12" cy="12" r=".7" fill="currentColor" stroke="none"/>'
    };
    // [emoji 序列, 图标 key, 作用域 class]：只精确匹配这些序列（含 FE0F 变体选择器），
    // 不模糊匹配；作用域用祖先 class 限定，正文里同款 emoji（以及第二批才做的通知映射
    // 📨👥🧩🔔⏰⚙️🔌🎯）都不会被替换。
    var MAP = [
      // 工具步骤行（容器是 .chat-step-icon，bundle 里根本不存在 chat-tool-lead）：
      // search / read / bash / write|edit / code / 其它
      ['\\u{1F50D}', 'search', 'chat-step-icon'],
      ['\\u{1F4C2}', 'read', 'chat-step-icon'],
      ['\\u2699\\uFE0F', 'gear', 'chat-step-icon'],
      ['\\u2699', 'gear', 'chat-step-icon'],
      ['\\u270F\\uFE0F', 'pencil', 'chat-step-icon'],
      ['\\u270F', 'pencil', 'chat-step-icon'],
      ['\\u{1F4BB}', 'code', 'chat-step-icon'],
      ['\\u{1F527}', 'tool', 'chat-step-icon'],
      // 思考中的 💭：用户要求统一成 SVG，不要 emoji。
      // thinking 变体同时带 .chat-step-icon 与 .chat-step-icon-thinking 两个 class，
      // 所以作用域仍用 chat-step-icon 就能命中；气泡本身是工具行的图标位置。
      ['\\u{1F4AD}\\uFE0F', 'thinking', 'chat-step-icon'],
      ['\\u{1F4AD}', 'thinking', 'chat-step-icon'],
      // 宿主唤醒消息卡：📨👥🧩🔔⏰⚙️🔌🎯 全换成 SVG（作用域 .chat-trigger-icon）。
      ['\\u{1F4E8}', 'inbox', 'chat-trigger-icon'],
      ['\\u{1F465}', 'people', 'chat-trigger-icon'],
      ['\\u{1F9E9}', 'puzzle', 'chat-trigger-icon'],
      ['\\u{1F514}', 'bell', 'chat-trigger-icon'],
      ['\\u{23F0}', 'clock', 'chat-trigger-icon'],
      ['\\u2699\\uFE0F', 'gear', 'chat-trigger-icon'],
      ['\\u2699', 'gear', 'chat-trigger-icon'],
      ['\\u{1F50C}', 'plug', 'chat-trigger-icon'],
      ['\\u{1F3AF}', 'target', 'chat-trigger-icon'],
      // 过程卡状态符号：运行 / 失败 / 中断 / 完成
      ['\\u23F3', 'running', 'chat-proc-lead'],
      ['\\u274C', 'failed', 'chat-proc-lead'],
      ['\\u23F9\\uFE0F', 'stopped', 'chat-proc-lead'],
      ['\\u23F9', 'stopped', 'chat-proc-lead'],
      ['\\u2705', 'done', 'chat-proc-lead'],
      ['\\u2714\\uFE0F', 'done', 'chat-proc-lead'],
      ['\\u2714', 'done', 'chat-proc-lead'],
      // 报错计数「⚠ N 处报错」
      ['\\u26A0\\uFE0F', 'warning', 'chat-proc-errors'],
      ['\\u26A0', 'warning', 'chat-proc-errors'],
      // 思考块（.chat-step-icon-thinking / 💭）也统一换成了 thinking SVG，
      // 不再保留 emoji（鲸鱼尾仍在底部「输出中」状态行，见 CHAT_STATUS_HTML）。
    ];

    function makeIcon(key) {
      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'dm-icon dm-icon-' + key);
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', '1.8');
      svg.setAttribute('stroke-linecap', 'round');
      svg.setAttribute('stroke-linejoin', 'round');
      svg.setAttribute('aria-hidden', 'true');
      svg.innerHTML = ICONS[key];
      return svg;
    }

    // 向上找祖先：命中 scope class 才算在目标容器内（React 会把 class 挂在 span 上，
    // 容器自身也可能带多个 class，这里用 classList.contains 精确判断）。
    function inScope(node, scope) {
      var p = node.parentNode;
      var guard = 0;
      while (p && guard++ < 12) {
        if (p.classList && p.classList.contains(scope)) return true;
        var cls = p.getAttribute && p.getAttribute('class');
        if (typeof cls === 'string' && cls.split(/\s+/).indexOf(scope) >= 0) return true;
        p = p.parentNode;
      }
      return false;
    }

    // 单个文本节点：命中就建 slot（图标 + 隐藏原文）。残余文本由 installSlot
    // 自己递归扫完，所以这里命中一次即可结束。
    function scanNode(node) {
      var guard = 0;
      while (node && node.parentNode && guard++ < 60) {
        // React 改写过的 slot 内容：不新建结构，只更新图标。
        if (isSlot(node.parentNode) && refreshSlot(node)) return;
        var text = node.nodeValue || '';
        var seq = null;
        var key = null;
        var at = -1;
        var scope = null;
        for (var i = 0; i < MAP.length; i++) {
          var idx = text.indexOf(MAP[i][0]);
          if (idx < 0) continue;
          // 取最靠前的；同一位置取更长的序列（优先带 FE0F 的变体）。
          if (at < 0 || idx < at || (idx === at && MAP[i][0].length > (seq ? seq.length : 0))) {
            at = idx;
            seq = MAP[i][0];
            key = MAP[i][1];
            scope = MAP[i][2];
          }
        }
        if (seq && scope && !inScope(node, scope)) {
          // 命中了序列但不在目标容器里（正文/通知等）：跳过，别替换。
          seq = null;
          key = null;
        }
        if (!seq) return;
        installSlot(node, seq, key);
        return;
      }
    }

    // 防重入标记打在稳定的 slot 元素上（文本节点会被 splitText 切成新的，
    // 标记打在它身上会丢）—— slot 只建一次，之后每次重扫只是更新图标。
    function isSlot(node) {
      return !!(node && node.nodeType === 1 && node.dmEmojiSlot);
    }

    // 在 emoji 处建一个稳定的 slot 结构（只建一次）：
    //   <svg class="dm-icon dm-icon-done">                      ← 真正显示的图标
    //   <span class="dm-emoji-src" style="display:none">⏳</span> ← 原文搬进这里
    // 关键：只「搬」不「换」。emoji 文本节点被 appendChild 进 slot，实例始终
    // 留在文档里，React 以后 nodeValue 更新（⏳→✅）照旧生效。若像以前那样
    // replaceChild 摘掉它，React 就会去更新一个已脱离文档的孤儿节点：图标不再
    // 更新，且重渲染产出的新文本会被再替换一次，图标重复堆叠。
    // 文本里 emoji 两侧还有别的字符时，残余部分会被切回父级继续扫描。
    function installSlot(textNode, seq, key) {
      var parent = textNode.parentNode;
      if (!parent) return null;
      var at = (textNode.nodeValue || '').indexOf(seq);
      if (at < 0) return null;
      // 先把 emoji 精确切成一个单独的文本节点，两侧残余留在父级继续扫。
      var target = textNode;
      if (at > 0) target = textNode.splitText(at);
      var rest = target.splitText(seq.length);

      var slot = document.createElement('span');
      slot.className = 'dm-emoji-src';
      slot.setAttribute('aria-hidden', 'true');
      slot.dmEmojiSlot = 1;
      parent.insertBefore(slot, target);
      slot.appendChild(target); // 搬，不删：节点实例保持同一份
      slot.dmIconSeq = seq;
      syncIcon(slot, key);
      if (rest && rest.nodeValue) {
        // 残尾（emoji 后面的「5 处报错」之类）留在父级显示；打上归属标记，
        // 下次 React 把整段重写回来时要先清掉它，否则会出现重复的旧文本。
        rest.dmEmojiRest = 1;
        rest.dmEmojiOwner = slot;
        scanNode(rest);
      }
      return slot;
    }

    // 让 slot 前面的 svg 与当前 emoji 对应：已经是对的就不动，变了就换掉旧的，
    // 同一个 slot 永远只留一个图标（不会两个并存）。
    function syncIcon(slot, key) {
      if (!slot || !slot.parentNode) return;
      var want = key || '';
      if (slot.getAttribute('data-dm-icon') === want) return;
      var parent = slot.parentNode;
      // 摘掉挂在 slot 前面的旧图标（可能不止一个，保险起见循环清干净）。
      var prev = slot.previousSibling;
      while (prev && prev.nodeType === 1) {
        var cls = prev.getAttribute && prev.getAttribute('class');
        if (typeof cls !== 'string' || cls.indexOf('dm-icon') < 0) break;
        var dead = prev;
        prev = prev.previousSibling;
        parent.removeChild(dead);
      }
      if (want) parent.insertBefore(makeIcon(want), slot);
      slot.setAttribute('data-dm-icon', want);
    }

    // slot 里的 emoji 被 React 改写了（⏳→✅、🔧→🔍）：按新内容换图标。
    // 改型后可能不再精确等于原 seq，所以整段重新匹配一次。
    function refreshSlot(textNode) {
      var slot = textNode.parentNode;
      if (!slot || !slot.parentNode) return false;
      var text = textNode.nodeValue || '';
      var seq = null;
      var key = null;
      var scope = null;
      for (var i = 0; i < MAP.length; i++) {
        if (text.indexOf(MAP[i][0]) < 0) continue;
        if (seq === null || MAP[i][0].length > seq.length) {
          seq = MAP[i][0];
          key = MAP[i][1];
          scope = MAP[i][2];
        }
      }
      // 整段正好是某个 emoji：直接换图标（最常见：⏳→✅、🔧→🔍）。
      if (seq !== null && seq === text) {
        slot.dmIconSeq = seq;
        syncIcon(slot, (!scope || inScope(textNode, scope)) ? key : '');
        return true;
      }
      // React 把整行（含残尾）重写进这个节点了：清掉上一次切出去的残尾，
      // 否则旧文本会留在 DOM 里，读出来变成「⚠ 5 处报错 3 处报错」。
      var parent0 = slot.parentNode;
      if (parent0) {
        var restSnapshot = parent0.childNodes ? Array.prototype.slice.call(parent0.childNodes) : [];
        for (var k = 0; k < restSnapshot.length; k++) {
          var sib = restSnapshot[k];
          if (sib && sib.dmEmojiRest && sib.dmEmojiOwner === slot && sib.parentNode) {
            sib.parentNode.removeChild(sib);
          }
        }
      }
      // emoji 没了，或夹进了别的内容：拆掉 slot，把文本还给父级重新扫一遍。
      var parent = slot.parentNode;
      var held = textNode;
      slot.removeChild(held);
      parent.insertBefore(held, slot);
      parent.removeChild(slot);
      // 顺手清掉散落在它前面的孤立图标，避免留下无主 svg。
      var prev = held.previousSibling;
      while (prev && prev.nodeType === 1) {
        var cls = prev.getAttribute && prev.getAttribute('class');
        if (typeof cls !== 'string' || cls.indexOf('dm-icon') < 0) break;
        var dead = prev;
        prev = prev.previousSibling;
        parent.removeChild(dead);
      }
      scanNode(held);
      return true;
    }

    function skip(node) {
      var p = node.parentNode;
      if (!p || !p.nodeName) return true;
      var n = p.nodeName;
      return n === 'SCRIPT' || n === 'STYLE' || n === 'NOSCRIPT' || n === 'TEXTAREA';
    }

    // 全程可重入：slot 已存在时 scanNode 只是刷新图标、不再新建结构，所以
    // 每次 flush 走一遍全树也不会重复堆叠。防重入标记打在 slot 元素上
    // （dmEmojiSlot），文本节点上不再打标记 —— 它会被 splitText 切成新实例。
    function walk(root) {
      if (!root) return;
      if (root.nodeType === 3) {
        if (!skip(root)) scanNode(root);
        return;
      }
      if (root.nodeType !== 1) return;
      var tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
      var n = tw.nextNode();
      while (n) {
        var next = tw.nextNode();
        if (!skip(n)) scanNode(n);
        n = next;
      }
    }

    var queued = false;
    function flush() {
      queued = false;
      try {
        walk(document.body);
      } catch (e) {}
    }
    function schedule() {
      if (queued) return;
      queued = true;
      if (window.requestAnimationFrame) window.requestAnimationFrame(flush);
      else window.setTimeout(flush, 0);
    }

    // 文本节点不再打标记（会被 splitText 切掉）；槽位状态存在 slot 元素上，
    // 这里只负责触发一次 flush。
    if (window.__dmMutationBus) window.__dmMutationBus.subscribe(schedule);
    else {
      var mo = new MutationObserver(schedule);
      mo.observe(document.body, { childList: true, subtree: true, characterData: true });
    }
    schedule();
  } catch (e) {}
})();
</script>`
