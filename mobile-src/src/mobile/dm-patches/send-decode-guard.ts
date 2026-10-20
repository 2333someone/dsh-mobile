/**
 * 迁移 C：1:1 搬自宿主 index.js 的 `SEND_DECODE_GUARD_HTML` 注入字符串。
 * 发送前等图片解码完成（拦截一次点击后重放）
 *
 * 由 `dm-patches/index.ts` 在 bundle 启动时按原顺序安装。
 */
// ── 发送时的「图片解码竞态」守卫（注入脚本，必须在 bundle 之前执行）───────────
// bundle 选图后是异步解码/压缩的（FileReader → Image → canvas 重编码到 256KB 内）：
//     ni = useCallback(e => { qi(e).then(({ image }) => Qe(t => [...t, image])) }, [])
// 而发送回调 ri() 读的是「此刻」已附加的数组 Ze。用户在解码完成前点发送时：
//   · 有文字 → ri() 照常发送，content 里只有 text，图片静默丢失（连 toast 都没有）；
//   · 没文字 → ri() 直接 return，这一下点击完全没有反应。
// 实测（CPU 6x 节流模拟手机）：3.1MB 照片解码+压缩 ~0.9s，14MB 高熵图 ~3.0s；
// 选图后 20–30ms 内点发送，请求体 content 就只有 ["text"]。手机上「选完图顺手点
// 发送」是常见操作，所以这条路径会间歇性丢图 —— 而且比「误报离线」更隐蔽，
// 因为它不弹任何提示。
//
// 注入脚本改不了 bundle 的内部状态，但可以拦住「发送」这个动作本身：
//   · 选图（file input 的 change）或粘贴图片时，把待解码张数记在 pending 里；
//   · 待发送栏 .chat-attach-item 每出现一张，pending 减一；解码失败的 toast
//     （「该图片无法解码」「最多附加 4 张图片」）也减一，避免永久挂住；
//   · pending > 0 时在 window 捕获阶段吞掉「发送」点击 / 回车，解码完成后自动
//     重放一次点击（btn.click() 是真实 DOM 事件，React 的委托监听照样收得到）。
// 代价：解码期间点发送会晚 1~3 秒才真正发出（超过 10s 兜底放行，不会卡死）；
// 等待超过 0.4s 才插一条 toast 说明原因。解码已完成（绝大多数情况）时 pending
// 为 0，这层拦截完全不介入，行为与原来一致。
// 注意：整段是模板字面量，里面不要出现反引号和反斜杠（`\` 会被吞掉）。
export const SEND_DECODE_GUARD_HTML = `<script>
(function () {
  try {
    // 解码迟迟不回来（超大图/低端机）也要把消息放出去，不能永久卡住发送。
    var MAX_HOLD_MS = 10000;
    // 等这么久还没发出去才插说明，小图几十毫秒就解码完，不要闪一下。
    var HINT_AFTER_MS = 400;
    var pending = 0;
    var pendingAt = 0;
    var baseline = 0;
    var polling = false;
    var waiting = false;
    var replaying = false;
    var hint = null;
    var seenToasts = typeof WeakSet === 'function' ? new WeakSet() : null;

    function attachCount() {
      try {
        return document.querySelectorAll('.chat-attach-item').length;
      } catch (e) {
        return baseline;
      }
    }

    function syncAttach() {
      var now = attachCount();
      if (now > baseline) pending = Math.max(0, pending - (now - baseline));
      baseline = now;
    }

    function scanToasts() {
      if (seenToasts === null) return;
      var list = document.querySelectorAll('.toast');
      for (var i = 0; i < list.length; i++) {
        var t = list[i];
        if (seenToasts.has(t)) continue;
        seenToasts.add(t);
        var s = t.textContent || '';
        if (s.indexOf('无法解码') >= 0 || s.indexOf('最多附加') >= 0) {
          pending = Math.max(0, pending - 1);
        }
      }
    }

    function startPoll() {
      if (polling) return;
      polling = true;
      var timer = setInterval(function () {
        syncAttach();
        scanToasts();
        // 切走会话 / 退出聊天页时待发送栏整个消失，解码结果不会再来 ——
        // 不能把它当成「仍在解码」，否则下一条消息会被一直挂住。
        if (composerGone()) pending = 0;
        if (pending <= 0) {
          clearInterval(timer);
          polling = false;
        }
      }, 120);
    }

    function composerGone() {
      try {
        return document.querySelector('textarea.chat-input') === null;
      } catch (e) {
        return false;
      }
    }

    function addPending(n) {
      if (!(n > 0)) return;
      syncAttach();
      pending += n;
      pendingAt = Date.now();
      startPoll();
    }

    // 选图走 bundle 里同一个异步解码函数 ni()。注意：只统计**图片** ——
    // 「＋ → 文件」用的是同一个 input[type=file]，把非图片也记成 pending 会让
    // 发送被永久拦住（并弹出「图片处理中，马上发送…」）。
    document.addEventListener('change', function (e) {
      var t = e.target;
      if (t === null || t.tagName !== 'INPUT' || t.type !== 'file') return;
      var files = t.files === null || t.files === undefined ? [] : t.files;
      var n = 0;
      for (var i = 0; i < files.length; i++) {
        var f = files[i];
        if (f && typeof f.type === 'string' && f.type.indexOf('image/') === 0) n++;
      }
      if (n > 0) addPending(n);
    }, true);

    document.addEventListener('paste', function (e) {
      try {
        var dt = e.clipboardData;
        if (dt === null || dt === undefined || dt.items === null || dt.items === undefined) return;
        var n = 0;
        for (var i = 0; i < dt.items.length; i++) {
          var it = dt.items[i];
          if (it !== null && it.kind === 'file' && (it.type || '').indexOf('image/') === 0) n++;
        }
        addPending(n);
      } catch (err) {}
    }, true);

    function isPending() {
      if (pending <= 0) return false;
      if (Date.now() - pendingAt > MAX_HOLD_MS) {
        pending = 0;
        return false;
      }
      return true;
    }

    function sendButton() {
      try {
        var b = document.querySelector('.chat-send');
        if (b === null) return null;
        // 会话在跑的时候这个按钮是「停止」，绝不能拦。
        if (b.getAttribute('aria-label') !== '发送') return null;
        return b;
      } catch (e) {
        return null;
      }
    }

    function showHint() {
      if (hint !== null) return;
      try {
        var host = document.createElement('div');
        host.className = 'toast-host';
        host.setAttribute('role', 'status');
        var item = document.createElement('div');
        item.className = 'toast';
        item.textContent = '图片处理中，马上发送…';
        host.appendChild(item);
        document.body.appendChild(host);
        hint = host;
      } catch (e) {
        hint = null;
      }
    }

    function hideHint() {
      if (hint === null) return;
      try {
        if (hint.parentNode !== null) hint.parentNode.removeChild(hint);
      } catch (e) {}
      hint = null;
    }

    function chatInput() {
      try {
        return document.querySelector('textarea.chat-input');
      } catch (e) {
        return null;
      }
    }

    // 重放一次「发送」。两种发送态要用两种入口，不能用同一个按钮：
    //   · Agent 空闲：.chat-send 的 aria-label 是「发送」，点它 = bundle 的 ri()；
    //   · Agent 在跑：.chat-send 变成「停止」，点它等于取消这一轮 —— 绝不能点。
    //     此时唯一的发送入口是输入框的回车（bundle 的 onKeyDown → ri()，mode:'queue'，
    //     宿主会把消息排进队列），所以补发一个真实的 Enter 键盘事件。
    // 旧实现只有「点按钮」一条路：排队发送被拦下后 sendButton() 恒为 null，于是每次
    // 都在这里静默放弃 —— 这一下回车凭空消失，文字和图片都留在输入框里。
    function replaySend(origin) {
      // 输入框必须是当初被拦下的那个节点：用户在这几百毫秒里切走会话时 React 会换掉
      // 整个 composer，这时重放会把「上一句」发到新会话里去 —— 宁可不发。
      var ta = chatInput();
      if (origin !== undefined && ta !== origin) return;
      replaying = true;
      try {
        var btn = sendButton();
        if (btn !== null && btn.disabled !== true) {
          btn.click();
          return;
        }
        if (ta === null) return;
        var ev;
        try {
          ev = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true
          });
        } catch (e) {
          ev = document.createEvent('KeyboardEvent');
          ev.initKeyboardEvent('keydown', true, true, window, 'Enter', 0, '', false, '');
        }
        ta.dispatchEvent(ev);
      } finally {
        replaying = false;
      }
    }

    function holdAndSend() {
      if (waiting) return;
      var origin = chatInput();
      if (origin === null) return;
      waiting = true;
      var started = Date.now();
      var hintTimer = setTimeout(function () {
        if (waiting) showHint();
      }, HINT_AFTER_MS);
      var tick = function () {
        // 收手条件只有一个：输入框没了或被换掉（切走会话/退出聊天页）。**不能**用
        // 「发送按钮不在」当收手条件 —— Agent 在跑时它本来就是「停止」键，而排队
        // 发送走的正是回车，收手就等于把这次发送吞掉。
        if (chatInput() !== origin) {
          waiting = false;
          clearTimeout(hintTimer);
          hideHint();
          return;
        }
        if (isPending() && Date.now() - started <= MAX_HOLD_MS + 500) {
          setTimeout(tick, 80);
          return;
        }
        waiting = false;
        clearTimeout(hintTimer);
        hideHint();
        // 重放前重新查一次：等待期间 React 可能已经换过节点 / 换过发送态。
        replaySend(origin);
      };
      setTimeout(tick, 80);
    }

    window.addEventListener('click', function (e) {
      try {
        if (replaying) return;
        var t = e.target;
        if (t === null || typeof t.closest !== 'function') return;
        if (t.closest('.chat-send') === null) return;
        if (sendButton() === null) return;
        if (!isPending()) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        holdAndSend();
      } catch (err) {}
    }, true);

    // 回车发送（设置项 mobileEnterToSend）：bundle 把该设置写进了 textarea 的
    // enterkeyhint（send / enter），用它判断这一下回车到底是不是「发送」。
    window.addEventListener('keydown', function (e) {
      try {
        if (replaying) return;
        if (e.key !== 'Enter' || e.shiftKey === true || e.isComposing === true) return;
        var t = e.target;
        if (t === null || t.tagName !== 'TEXTAREA') return;
        if (String(t.className).indexOf('chat-input') < 0) return;
        if (t.getAttribute('enterkeyhint') !== 'send') return;
        if (!isPending()) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        holdAndSend();
      } catch (err) {}
    }, true);
  } catch (e) {}
})();
</script>`
