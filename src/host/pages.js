/**
 * 页面与注入脚本：/m/ 的 HTML、推送自检页、PWA manifest，以及必须在 bundle
 * 之前执行的三个内联脚本（在线守卫、视口高度、变更总线）。
 * 纯搬自 core.js 顶层，无闭包依赖。
 */
import { bundleVersion } from './assets.js'
import { MOBILE_ROOT } from './config.js'

export const ONLINE_GUARD_HTML = `<script>
(function () {
  /* dm-online-guard: Android/HarmonyOS WebViews may misreport navigator.onLine === false */
  try {
    Object.defineProperty(navigator, 'onLine', {
      get: function () { return true; },
      configurable: true
    });
  } catch (e) {}
})();
</script>`

export const VIEWPORT_VH_HTML = `<script>
(function () {
  var KEY = '--dm-vh';
  var THRESHOLD = 2; // px：小于这个变化量就不写，专治键盘/地址栏动画的抖动
  var last = -1;
  var frame = 0;

  function measure() {
    var vv = window.visualViewport;
    var h;
    if (vv && typeof vv.height === 'number' && vv.height > 0) {
      // visualViewport.height = **当前可见**高度（已扣掉地址栏/键盘），单位是
      // CSS px。双指放大时它会变小（scale=2 → 只看得到一半的 CSS px），
      // 乘回 scale 还原成「布局视口坐标系」下的可见高度，避免缩放把应用缩小。
      var s = typeof vv.scale === 'number' && vv.scale > 0 ? vv.scale : 1;
      h = vv.height * s;
    } else {
      // 老 WebView 没有 visualViewport：innerHeight 就是可见高度
      // （100vh 之所以偏大，是因为它取的是大视口）。
      h = window.innerHeight;
    }
    // 上限兜底：永远不超过布局视口高度。万一上面算出偏大的值，也不会把文档
    // 撑出滚动条 —— 这是「兜底的兜底」，正常情况下不生效。
    var cap = document.documentElement.clientHeight;
    if (typeof cap === 'number' && cap > 0 && h > cap) h = cap;
    return Math.round(h);
  }

  function apply() {
    frame = 0;
    var h = measure();
    if (h <= 0) return;
    if (last >= 0 && Math.abs(h - last) < THRESHOLD) return; // 不显著 → 不写、不重排
    last = h;
    document.documentElement.style.setProperty(KEY, h + 'px');
  }

  // 一帧内的多次事件合并成一次写入。
  function schedule() {
    if (frame) return;
    frame = (window.requestAnimationFrame || function (fn) { return window.setTimeout(fn, 16); })(apply);
  }

  apply(); // 首帧：必须在 bundle 的 #root 渲染前就把值写好

  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('orientationchange', schedule, { passive: true });
  if (window.visualViewport) {
    // 地址栏收展、软键盘弹出都走这里（部分 WebView 上 window.resize 不触发）。
    window.visualViewport.addEventListener('resize', schedule, { passive: true });
    window.visualViewport.addEventListener('scroll', schedule, { passive: true });
  }
  // 兜底：极老 WebView 上 visualViewport 缺失、resize 也不触发时，
  // 低频轮询（1s）仍能跟上地址栏收展；阈值保证它平时不产生任何写入。
  window.setInterval(schedule, 1000);
})();
</script>`

export const MUTATION_BUS_HTML = `<script>
(function () {
  if (window.__dmMutationBus) return;
  var frameListeners = [];
  var normalListeners = [];
  var attrListeners = [];
  var frameQueued = false;
  var normalTimer = 0;
  var attrTimer = 0;
  function notify(list) {
    var snapshot = list.slice();
    for (var i = 0; i < snapshot.length; i++) {
      try { snapshot[i](); } catch (e) {}
    }
  }
  function scheduleFrame() {
    if (frameQueued) return;
    frameQueued = true;
    if (window.requestAnimationFrame) window.requestAnimationFrame(function () { frameQueued = false; notify(frameListeners); });
    else window.setTimeout(function () { frameQueued = false; notify(frameListeners); }, 0);
  }
  function scheduleNormal() {
    if (normalTimer !== 0) return;
    normalTimer = window.setTimeout(function () { normalTimer = 0; notify(normalListeners); }, 600);
  }
  function scheduleAttr() {
    if (attrTimer !== 0) return;
    attrTimer = window.setTimeout(function () { attrTimer = 0; notify(attrListeners); }, 400);
  }
  try {
    var structural = new MutationObserver(function () {
      if (frameListeners.length > 0) scheduleFrame();
      if (normalListeners.length > 0) scheduleNormal();
    });
    structural.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    var attributes = new MutationObserver(function () {
      if (attrListeners.length > 0) scheduleAttr();
    });
    attributes.observe(document.documentElement, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class', 'aria-label', 'title', 'aria-hidden', 'style', 'hidden']
    });
  } catch (e) { return; }

  // ── 统一 ensure tick：120ms 一条表，任务按各自 period 到期才跑；全都不 ready 就停表。
  var tasks = [];
  var tickTimer = 0;
  var idleTicks = 0;
  function tick() {
    var now = Date.now();
    var ran = false;
    for (var i = 0; i < tasks.length; i++) {
      var task = tasks[i];
      if (now < task.next) continue;
      if (task.ready && !task.ready()) continue;
      task.next = now + task.period;
      ran = true;
      try { task.fn(); } catch (e) {}
    }
    if (ran) { idleTicks = 0; return; }
    idleTicks++;
    if (idleTicks >= 3) {
      idleTicks = 0;
      window.clearInterval(tickTimer);
      tickTimer = 0;
    }
  }
  function startTick() {
    if (tickTimer !== 0) return;
    idleTicks = 0;
    tickTimer = window.setInterval(tick, 120);
  }
  var ensureTick = {
    add: function (fn, period, ready) {
      tasks.push({ fn: fn, period: typeof period === 'number' && period > 0 ? period : 120, ready: typeof ready === 'function' ? ready : null, next: 0 });
      startTick();
    },
    // 唤醒时立刻跑一次 tick：否则要等下一个 120ms 周期，进页面时控件会滞后。
    wake: function () {
      startTick();
      try { tick(); } catch (e) {}
    }
  };
  normalListeners.push(ensureTick.wake);

  // 进聊天页时 composer 会重新挂载。那一刻立刻唤醒一次 ensure tick，否则要等 600ms 切片
  // + 各任务 800ms 周期，用户会看到「工具栏图标后来才蹦出来」。
  // 只在 composer 元素身份变化（挂载/卸载）时唤醒一次，不挂全帧通道 —— 我们的控件写入
  // 会再次触发总线，全帧唤醒会形成「写入→通知→再写入」的循环。
  var composerSeen = null;
  frameListeners.push(function () {
    var c = document.querySelector('.chat-composer');
    if (c === composerSeen) return;
    composerSeen = c;
    if (c) ensureTick.wake();
  });

  window.__dmMutationBus = {
    subscribe: function (listener, options) {
      if (typeof listener !== 'function') return;
      if (options && options.frame === true) frameListeners.push(listener);
      else if (options && options.attributes === true) attrListeners.push(listener);
      else normalListeners.push(listener);
    }
  };
  window.__dmEnsureTick = ensureTick;
  startTick();
})();
</script>`

export function mobilePageHtml() {
  return [
    '<!doctype html>',
    '<html lang="zh-CN">',
    '<head>',
    '<meta charset="utf-8">',
    // 必须最早：先把 navigator.onLine 的误报按住，bundle 才不会在发送时丢掉图片。
    ONLINE_GUARD_HTML,
    MUTATION_BUS_HTML,
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content">',
    '<meta name="theme-color" content="#f5f5f7">',
    '<meta name="referrer" content="no-referrer">',
    '<meta name="mobile-web-app-capable" content="yes">',
    '<meta name="apple-mobile-web-app-capable" content="yes">',
    '<meta name="apple-mobile-web-app-title" content="dsh">',
    '<link rel="manifest" href="/m/manifest.webmanifest">',
    '<link rel="apple-touch-icon" href="/m/apple-touch-icon.png">',
    '<link rel="icon" href="/m/icon.svg">',
    '<title>dsh</title>',
    '<link rel="stylesheet" href="/m/theme.css">',
    '</head>',
    '<body>',
    '<div id="root"></div>',
    // 在 bundle 之前注册：拦住「图片还没解码完就点发送」的一次点击，解码完成后自动重发。
    `<script type="module" src="/m/mobile.js?v=${bundleVersion()}"></script>`,
    VIEWPORT_VH_HTML,
    // 聊天/待发送图片的全屏预览（捕获阶段委托，抢在 bundle 自带 lightbox 之前）。
    '</body>',
    '</html>',
  ].join('')
}

export function pushCheckPageHtml() {
  const pageJs = `
(function () {
  var $ = function (id) { return document.getElementById(id) }

  function mark(el, state) {
    // state: 'ok' | 'no' | 'warn'
    el.classList.remove('pc-ok', 'pc-no', 'pc-warn')
    el.classList.add('pc-' + state)
  }

  function icon(state) {
    return state === 'ok' ? '✅' : state === 'no' ? '❌' : '⚠️'
  }

  function setRow(id, state, valueText) {
    var row = $(id)
    if (!row) return
    var cell = row.querySelector('.pc-icon')
    var val = row.querySelector('.pc-value')
    if (cell) { cell.textContent = icon(state); mark(cell, state) }
    if (val) {
      val.textContent = valueText
      val.classList.remove('pc-ok', 'pc-no', 'pc-warn')
      val.classList.add('pc-' + state)
    }
  }

  function addNote(id, text) {
    var row = $(id)
    if (!row) return
    var p = document.createElement('p')
    p.className = 'pc-note'
    p.textContent = text
    row.appendChild(p)
  }

  var results = {}

  // ── 1. 安全上下文 ────────────────────────────────────────────────────
  var secure = window.isSecureContext === true
  results.secure = secure
  setRow('row-secure', secure ? 'ok' : 'no', secure ? 'true（安全上下文）' : 'false（非安全上下文）')
  if (!secure) {
    addNote('row-secure', '这是协议硬性要求：非 HTTPS（且非 localhost）时浏览器根本不暴露 Push API，Web Push 必定不可用。请改用 https 地址打开本页。')
  }

  // ── 2. 访问协议 / 地址 ───────────────────────────────────────────────
  setRow('row-proto',
    location.protocol === 'https:' ? 'ok' : 'no',
    location.protocol.replace(':', '').toUpperCase())
  $('pc-origin').textContent = location.origin || location.href

  // ── 3. Service Worker ────────────────────────────────────────────────
  var hasSw = 'serviceWorker' in navigator
  results.sw = hasSw
  setRow('row-sw', hasSw ? 'ok' : 'no', hasSw ? '存在（navigator.serviceWorker）' : '不存在')

  // ── 4. PushManager ───────────────────────────────────────────────────
  var hasPush = 'PushManager' in window
  results.push = hasPush
  setRow('row-push', hasPush ? 'ok' : 'no', hasPush ? '存在（window.PushManager）' : '不存在')

  // ── 5. Notification API ──────────────────────────────────────────────
  var hasNotif = 'Notification' in window
  results.notif = hasNotif
  setRow('row-notif', hasNotif ? 'ok' : 'no', hasNotif ? '存在（window.Notification）' : '不存在')

  // ── 6. 通知权限 ──────────────────────────────────────────────────────
  var perm = hasNotif ? Notification.permission : 'unsupported'
  results.perm = perm
  var permState = perm === 'granted' ? 'ok' : perm === 'denied' ? 'no' : 'warn'
  var permText = { granted: 'granted（已授权）', denied: 'denied（已被拒绝）', default: 'default（尚未询问）', unsupported: '不支持（无 Notification API）' }[perm] || String(perm)
  setRow('row-perm', permState, permText)
  if (perm === 'denied') {
    addNote('row-perm', '权限已被拒绝：浏览器不会再弹窗，需要到浏览器「网站设置 → 通知」里手动改回允许。')
  }

  // ── 9. User-Agent ────────────────────────────────────────────────────
  var ua = navigator.userAgent || '（无法读取）'
  $('pc-ua').textContent = ua
  var isQuark = /Quark/i.test(ua)
  var chromeVer = /Chrome\\/([0-9]+)/.exec(ua)
  setRow('row-ua', 'warn', ua)
  addNote('row-ua',
    (isQuark ? '识别为夸克浏览器（Quark）。' : '未识别到 Quark 字样——请确认是不是在用夸克打开。') +
    (chromeVer ? '内核 Chrome ' + chromeVer[1] + '。' : '未识别到 Chrome 版本号。'))

  // ── 7. 请求权限（按钮，用户主动触发） ────────────────────────────────
  var permBtn = $('pc-perm-btn')
  permBtn.addEventListener('click', function () {
    if (!hasNotif) {
      $('pc-perm-result').textContent = '❌ 浏览器没有 Notification API，无法请求权限。'
      return
    }
    $('pc-perm-result').textContent = '⏳ 正在请求…'
    var done = function (p) {
      var st = p === 'granted' ? 'ok' : p === 'denied' ? 'no' : 'warn'
      setRow('row-perm', st, '请求后：' + p)
      $('pc-perm-result').textContent = p === 'granted'
        ? '✅ 授权成功（' + p + '）'
        : p === 'denied'
          ? '❌ 被拒绝（' + p + '）：需到浏览器网站设置里手动允许。'
          : '⚠️ 未作出选择（' + p + '）'
      render()
    }
    try {
      // 兼容两种签名：新浏览器返回 Promise，老的用回调。
      var r = Notification.requestPermission(function (p) { done(p) })
      if (r && typeof r.then === 'function') r.then(done, function () { done(Notification.permission) })
    } catch (e) {
      $('pc-perm-result').textContent = '❌ 请求权限抛出异常：' + ((e && e.message) || e)
    }
  })

  // ── 8. SW 注册 + 订阅可用性 ──────────────────────────────────────────
  var swDone = false
  var subDone = false

  function runSw() {
    if (!hasSw) {
      setRow('row-swreg', 'no', '跳过：无 Service Worker API')
      setRow('row-sub', 'no', '跳过：Service Worker 不可注册')
      return Promise.resolve()
    }
    setRow('row-swreg', 'warn', '正在注册 /m/service-worker.js …')
    // scope '/m/' 与 bundle 注册时用的完全一致。
    return navigator.serviceWorker.register('/m/service-worker.js', { scope: '/m/' })
      .then(function (reg) {
        swDone = true
        setRow('row-swreg', 'ok', '注册成功（scope ' + reg.scope + '）')
        addNote('row-swreg', '注册成功说明浏览器支持 Service Worker。')
        return checkSub(reg)
      })
      .catch(function (err) {
        var msg = (err && err.message) || String(err)
        setRow('row-swreg', 'no', '注册失败：' + msg)
        addNote('row-swreg', '注册失败最常见的两个原因：① 非安全上下文（http 打开）；② /m/service-worker.js 这个地址返回了非 200/非 JS（当前插件还没给它配路由，所以会 404）。')
        setRow('row-sub', 'no', '跳过：Service Worker 注册失败')
        subDone = true
      })
  }

  function checkSub(reg) {
    if (!hasPush) {
      setRow('row-sub', 'no', '不可用：无 PushManager')
      subDone = true
      return Promise.resolve()
    }
    setRow('row-sub', 'warn', '正在读取已有订阅…')
    // 只读：getSubscription() 不会创建新订阅、不会触发任何推送。
    return reg.pushManager.getSubscription().then(function (sub) {
      if (sub) {
        setRow('row-sub', 'ok', '存在已有订阅（endpoint 可解析）')
        addNote('row-sub', '浏览器允许读取订阅对象，说明 PushManager 基本可用。真正的可用性还要看能否成功 subscribe()，本页不会去订阅。')
      } else {
        setRow('row-sub', 'warn', '暂无订阅，但 pushManager 可访问（未实际订阅）')
        addNote('row-sub', '能读到 pushManager 说明 API 存在。是否真能订阅成功、以及鸿蒙无 GMS 时能否收到 FCM 推送，仍需实测。')
      }
      subDone = true
    }).catch(function (err) {
      setRow('row-sub', 'no', '读取订阅失败：' + ((err && err.message) || err))
      subDone = true
    })
  }

  // ── 总结论 ───────────────────────────────────────────────────────────
  function render() {
    var box = $('pc-verdict')
    var title = $('pc-verdict-title')
    var desc = $('pc-verdict-desc')
    var ok = results.secure && results.sw && results.push && results.notif
    var missing = []
    if (!results.secure) missing.push('安全上下文（HTTPS）')
    if (!results.sw) missing.push('Service Worker')
    if (!results.push) missing.push('PushManager')
    if (!results.notif) missing.push('Notification API')

    box.classList.remove('pc-v-ok', 'pc-v-no', 'pc-v-warn')
    if (missing.length > 0) {
      box.classList.add('pc-v-no')
      title.textContent = '❌ 结论：Web Push 不可用'
      desc.textContent = '缺失：' + missing.join('、') + '。浏览器通知这条路走不通，需要改用第三方渠道（如 Bark / WxPusher）。'
      return
    }
    if (swDone && subDone) {
      box.classList.add('pc-v-ok')
      title.textContent = '✅ 结论：前置条件都满足'
      desc.textContent = 'HTTPS + Service Worker + PushManager 三者齐备。请注意：这只能说明浏览器「可能」支持，鸿蒙无 GMS 时真正的 FCM 推送仍可能收不到，需要一次真实订阅+发送测试才能确认。'
      return
    }
    box.classList.add('pc-v-warn')
    title.textContent = '⚠️ 结论：API 存在，但 Service Worker 尚未验证成功'
    desc.textContent = '浏览器有 PushManager，但 SW 注册/订阅读取还没成功完成（见上面两项）。在 SW 真正注册成功之前，Web Push 无法工作。'
  }

  render()
  runSw().then(function () { render() })

  // 重新检测：整页刷新最干净（SW 注册状态不会被残留状态干扰）。
  $('pc-reload').addEventListener('click', function () { location.reload() })
})();
`

  return [
    '<!doctype html>',
    '<html lang="zh-CN">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">',
    '<meta name="referrer" content="no-referrer">',
    '<meta name="theme-color" content="#f5f5f7">',
    '<title>浏览器推送能力自检</title>',
    '<link rel="stylesheet" href="/m/theme.css">',
    '</head>',
    '<body class="pc-body">',
    '<main class="pc-page">',
    '<h1 class="pc-title">浏览器推送能力自检</h1>',

    '<div class="pc-banner">',
    '<p class="pc-banner-title">⚠️ Web Push 需要三样东西，缺一不可</p>',
    '<p class="pc-banner-body"><b>HTTPS</b>（安全上下文） + <b>Service Worker</b> + <b>PushManager</b>。<br>',
    '通过 <b>http</b> 访问时必定不可用——这是浏览器协议的硬性要求，不是配置问题。</p>',
    '</div>',

    '<section class="pc-card">',
    '<h2 class="pc-h2">访问地址</h2>',
    '<p class="pc-kv">当前地址：<code id="pc-origin"></code></p>',
    '<p class="pc-hint">若上面是 <code>http://</code> 开头，请改用 https 的公网地址重新打开本页：</p>',
    '<ul class="pc-urls">',
    '<li><span class="pc-tag pc-tag-no">http</span> <code>http://192.168.1.10:19387/m/push-check</code> — 局域网，必定不可用（仅用于对照）</li>',
    '<li><span class="pc-tag pc-tag-ok">https</span> <code>https://your-host.example.com:45632/m/push-check</code> — 公网反代，<b>用这个测</b></li>',
    '</ul>',
    '</section>',

    '<section class="pc-card">',
    '<h2 class="pc-h2">逐项检测</h2>',
    '<ul class="pc-list">',
    '<li class="pc-row" id="row-secure"><span class="pc-icon"></span><span class="pc-label">安全上下文 <i>window.isSecureContext</i></span><span class="pc-value"></span></li>',
    '<li class="pc-row" id="row-proto"><span class="pc-icon"></span><span class="pc-label">访问协议 <i>location.protocol</i></span><span class="pc-value"></span></li>',
    '<li class="pc-row" id="row-sw"><span class="pc-icon"></span><span class="pc-label">Service Worker <i>navigator.serviceWorker</i></span><span class="pc-value"></span></li>',
    '<li class="pc-row" id="row-push"><span class="pc-icon"></span><span class="pc-label">PushManager <i>window.PushManager</i></span><span class="pc-value"></span></li>',
    '<li class="pc-row" id="row-notif"><span class="pc-icon"></span><span class="pc-label">Notification API <i>window.Notification</i></span><span class="pc-value"></span></li>',
    '<li class="pc-row" id="row-perm"><span class="pc-icon"></span><span class="pc-label">通知权限 <i>Notification.permission</i></span><span class="pc-value"></span></li>',
    '<li class="pc-row" id="row-swreg"><span class="pc-icon"></span><span class="pc-label">SW 注册 <i>register(\'/m/service-worker.js\')</i></span><span class="pc-value"></span></li>',
    '<li class="pc-row" id="row-sub"><span class="pc-icon"></span><span class="pc-label">订阅可用性 <i>getSubscription()</i>（只读）</span><span class="pc-value"></span></li>',
    '<li class="pc-row" id="row-ua"><span class="pc-icon"></span><span class="pc-label">User-Agent</span><span class="pc-value"></span></li>',
    '</ul>',
    '</section>',

    '<section class="pc-card">',
    '<h2 class="pc-h2">请求通知权限</h2>',
    '<p class="pc-hint">点下面的按钮会调用 <code>Notification.requestPermission()</code>，由浏览器弹窗询问。本页不会真的订阅、不会配对设备。</p>',
    '<button type="button" class="pc-btn" id="pc-perm-btn">请求通知权限</button>',
    '<p class="pc-result" id="pc-perm-result"></p>',
    '</section>',

    '<section class="pc-card pc-verdict" id="pc-verdict">',
    '<p class="pc-verdict-title" id="pc-verdict-title">检测中…</p>',
    '<p class="pc-verdict-desc" id="pc-verdict-desc"></p>',
    '</section>',

    '<section class="pc-card">',
    '<h2 class="pc-h2">User-Agent 全文</h2>',
    '<p class="pc-ua" id="pc-ua"></p>',
    '<p class="pc-hint">用来确认是不是夸克浏览器，以及它的 Chromium 内核版本。</p>',
    '</section>',

    '<button type="button" class="pc-btn pc-btn-ghost" id="pc-reload">重新检测</button>',
    '<p class="pc-foot">本页只读：不配对、不写设备、不创建订阅。</p>',
    '</main>',
    '<script>' + pageJs + '</script>',
    '</body>',
    '</html>',
  ].join('')
}

export function manifestJson() {
  return JSON.stringify({
    id: MOBILE_ROOT,
    name: 'dsh 掌上助手',
    short_name: 'dsh',
    start_url: MOBILE_ROOT,
    scope: MOBILE_ROOT,
    display: 'standalone',
    background_color: '#151424',
    theme_color: '#f3f5f9',
    icons: [
      { src: '/m/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/m/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  }, null, 2)
}
