/**
 * 迁移 B：1:1 搬自宿主 index.js 的 `SUBAGENT_BTN_HTML` 注入字符串。
 * 子代理面板入口按钮 + 面板。
 *
 * 只搬位置、不改写：内容仍是原来的 HTML + 内联脚本，由
 * `dm-toolbar/index.ts` 在 bundle 启动时按原顺序安装到 document。
 */
// 顶栏「子代理」入口：只在聊天页（顶栏右侧含 aria-label="更多" 的按钮）的
// 「更多」按钮之前插一个自绘图标；点击弹出自绘面板（列表 → 聊天内容两个视图）。
// 面板自己走 /m/api/subagent.list 与 /m/api/session.history 两个 RPC，
// 不碰 bundle 的路由／导航栈，也不改它的 React 树（按钮是同层兄弟节点）。
export const SUBAGENT_BTN_HTML = `<button id="dm-subagent-btn" class="mobile-iconbtn" type="button" aria-label="子代理" title="子代理任务"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5.5" r="2.6"/><circle cx="5" cy="17" r="2.6"/><circle cx="19" cy="17" r="2.6"/><path d="M12 8.1V14M12 14H6.8M12 14h5.2"/></svg></button><script>
(function () {
  var btn = document.getElementById('dm-subagent-btn');
  if (!btn) return;

  var REFRESH_MS = 8000;    // 面板打开时的轮询间隔
  var BG_REFRESH_MS = 8000; // 后台预取间隔（与面板轮询一致）
  var panel = null;      // 遮罩节点（.dm-subagent-backdrop）
  var timer = null;      // 面板打开时的列表/聊天轮询
  var bgTimer = null;    // 后台预取轮询（与面板是否打开无关）
  var view = 'list';     // 'list' | 'chat'
  var chatSid = '';
  // 聊天视图状态（新→旧顺序、增量前插、30s 对账）。null 表示当前不在聊天视图。
  //   { sid, parent, itemSeq, seenSeq, live, es, reconcileTimer, list, pendingNew }
  var chat = null;
  var lastSessionId = '';

  // ── 预取缓存 ────────────────────────────────────────────────────────────
  // 之前是「点开面板 → 才发 subagent.list → 等响应才渲染」，首屏必然空一段。
  // 现在改成进聊天页就后台预取并缓存（按会话 id 存），点开面板先用缓存立即渲染。
  //
  // 缓存三态必须分清，否则会把「还没拉到」误报成「确实没有」：
  //   CACHE_SID === '' 或 cacheRows === null → 还没拉成功过（渲染「加载中…」）
  //   cacheRows.length === 0                → 拉成功且确实为空（渲染「当前没有子代理」）
  //   cacheRows.length > 0                  → 有数据（渲染列表）
  var CACHE_SID = '';
  var cacheRows = null;     // null = 未知；数组 = 已知（可能为空数组）
  var cacheFetchedAt = 0;
  var inflight = null;      // 正在飞的请求，调用点共享，避免重复打 RPC
  var inflightSid = '';
  var bgSid = '';           // 后台预取当前服务的会话 id
  var lastFailAt = 0;       // 上次请求失败的时间（按会话区分），用于退避
  var lastFailSid = '';
  var RETRY_GAP_MS = 1500;

  // 与 MODEL_BUTTON_HTML 同一手法：拦截 fetch 记住当前会话 id。
  var origFetch = window.fetch;
  if (typeof origFetch === 'function') {
    window.fetch = function (input, init) {
      try {
        var url = typeof input === 'string' ? input : (input && input.url) || '';
        if (url.indexOf('/m/api/') >= 0 && init && typeof init.body === 'string') {
          var body = JSON.parse(init.body);
          if (body && body.payload && typeof body.payload.sessionId === 'string' && body.payload.sessionId) {
            lastSessionId = body.payload.sessionId;
          }
        }
      } catch (e) {}
      return origFetch.apply(this, arguments);
    };
  }

  function currentSession() {
    try {
      var s = new URL(location.href).searchParams.get('session');
      if (s) return s;
    } catch (e) {}
    return lastSessionId;
  }

  function rpc(method, payload) {
    return fetch('/m/api/' + method, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rpcId: 'dm-sub-' + Date.now(), payload: payload })
    }).then(function (r) { return r.json(); }).then(function (j) { return j ? j.result : null; });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function excerpt(s, n) {
    var t = String(s == null ? '' : s).replace(/\\s+/g, ' ').trim();
    return t.length > n ? t.slice(0, n) + '…' : t;
  }
  // 事件里的文本内容：content 数组（[{type:'text',text}]）或裸字符串都收下。
  function textOf(content) {
    if (typeof content === 'string') return content;
    if (!Array.isArray(content)) return '';
    var out = [];
    for (var i = 0; i < content.length; i++) {
      var p = content[i];
      if (typeof p === 'string') out.push(p);
      else if (p && p.type === 'text' && typeof p.text === 'string') out.push(p.text);
    }
    return out.join(' ').trim();
  }

  // 只取推理块：子代理的某些步骤 only-reasoning（没有 text 块），
  // 面板里如果只认 text 就会显示「(无文本)」，等于把过程信息丢了。
  function reasoningOf(content) {
    if (!Array.isArray(content)) return '';
    var out = [];
    for (var i = 0; i < content.length; i++) {
      var p = content[i];
      if (!p || p.type !== 'reasoning') continue;
      out.push(String(p.text || ''));
    }
    return out.join('');
  }


  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  // ── 列表读取：统一走这里，命中缓存就同步返回 ──────────────────────────
  // 返回 null 表示「这份缓存不属于当前会话」；返回数组表示已知结果（可能为空）。
  function cachedRows(sid) {
    if (!sid || CACHE_SID !== sid) return null;
    return cacheRows;
  }

  // 会话切换：缓存作废（同一会话内不清，避免刷新时闪一下「加载中」）。
  function invalidateCache(sid) {
    if (CACHE_SID !== '' && CACHE_SID !== sid) {
      CACHE_SID = '';
      cacheRows = null;
      cacheFetchedAt = 0;
    }
  }

  // 与旧版 renderList 的过滤口径一致：只留 kind==='child'。
  //
  // 但**字段要收全**：宿主 listDescendants 每行实际返回
  //   { id, label, mode:'one-shot'|'continuable'|'external', activity:'running'|'inactive',
  //     kind:'child'|'diagnostic', parentId, depth, hasChildren }
  //（已核宿主源码：spread identity, kind:"child", parentId, depth, activity, hasChildren:children.length>0）。
  // 旧版只取 id/label/activity 三个，mode/depth/hasChildren/parentId 全丢 —— 数据本来就有，
  // 是这里没往外面带。面板据此渲染类型、层级、是否有子级。
  //
  // 各字段都做了类型收敛（缺字段、类型不对一律落默认值），
  // 保证「宿主少给字段」时面板照常画，不会因为 undefined 拼出 "undefined" 字样。
  function rowsOf(res) {
    var entries = (res && res.ok && res.value && Array.isArray(res.value.entries)) ? res.value.entries : [];
    var rows = [];
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (!e || e.kind !== 'child') continue;
      rows.push({
        id: String(e.id || ''),
        label: typeof e.label === 'string' ? e.label : '',
        activity: typeof e.activity === 'string' ? e.activity : '',
        // mode 决定「一次性 / 可继续 / 外部」，未知就存 'unknown'（下面渲染成「—」）。
        mode: (e.mode === 'one-shot' || e.mode === 'continuable' || e.mode === 'external') ? e.mode : 'unknown',
        // depth：宿主给的是数字层级（根的直接子级为 0）。非法值一律当第 1 层。
        depth: (typeof e.depth === 'number' && isFinite(e.depth) && e.depth >= 0) ? Math.floor(e.depth) : 0,
        hasChildren: e.hasChildren === true,
        parentId: typeof e.parentId === 'string' ? e.parentId : '',
      });
    }
    return rows;
  }

  // 类型 → 中文标签（手机屏幕窄，用短词）。
  var MODE_LABEL = { 'one-shot': '一次性', 'continuable': '可继续', 'external': '外部', 'unknown': '未知' };
  function modeLabel(m) {
    return MODE_LABEL[m] || '未知';
  }

  // 发一次真实请求。同一会话的并发调用共用一个 promise（去重）。
  // 限流只在「同一个会话上一次请求刚失败」时生效，避免被 interval 密集重放；
  // 不能对所有请求一刀切，否则切会话后的首次预取会被上一次的时间戳挡掉。
  function fetchList(sid) {
    if (!sid) return null;
    if (inflight && inflightSid === sid) return inflight;
    var now = Date.now();
    if (lastFailSid === sid && now - lastFailAt < RETRY_GAP_MS) return null;
    inflightSid = sid;
    var committed = false;
    inflight = rpc('subagent.list', { parentSessionId: sid }).then(function (res) {
      if (inflightSid === sid) {
        var rows = rowsOf(res);
        CACHE_SID = sid;
        cacheRows = rows;
        cacheFetchedAt = Date.now();
        committed = true;
        return rows;
      }
      return null;
    }).catch(function () {
      if (inflightSid === sid && !committed) {
        lastFailSid = sid;
        lastFailAt = Date.now();
      }
      return null;   // 失败不许出弹窗；缓存保持原样，下次轮询自然会再试
    }).then(function (rows) {
      inflight = null;
      // 后台刷新也要让面板跟着变（不只是点开那一次）：
      // 每次「真实发生请求且写入缓存」后同步一次，内容没变 paintList 会自己不动 DOM。
      if (committed) syncPanel(sid);
      return rows;
    });
    return inflight;
  }

  // 后台预取：拿到会话就拉一次，之后由 bgTimer 低频刷新。整段 try/catch，
  // 请求失败静默。这里必须每次都真发请求（同一会话的并发由 fetchList 去重），
  // 否则「拉过一次就不再拉」，缓存会一直停在旧数据上。
  // 仅当缓存刚刚写入（<1s，比如刚被点开面板那次请求刷新过）时跳过，避免连发。
  function tickPrefetch() {
    try {
      var sid = currentSession();
      invalidateCache(sid);
      bgSid = sid;
      if (!sid) return;
      if (cachedRows(sid) !== null && Date.now() - cacheFetchedAt < 1000) return;
      fetchList(sid);
    } catch (e) {}
  }

  // 缓存更新后，若面板正停留在列表视图，就把最新内容同步上去。
  // paintList 内部有 diff：内容没变就不动 DOM，所以不会闪。
  function syncPanel(sid) {
    try {
      if (!panel || view !== 'list') return;
      if (!panel.back.classList.contains('dm-subagent-open')) return;
      if (currentSession() !== sid) return;
      var rows = cachedRows(sid);
      if (rows !== null) paintList(rows);
    } catch (e) {}
  }

  // 幂等：ensure() 每 400ms 跑一次，若这里无条件 stop/start，8s 的后台计时器
  // 会被反复重置、永远走不到刷新。所以只在「没起」或「会话变了」时才重启，
  // 顺带也就完成了「切会话 → 缓存失效 → 重新预取」。
  function startBg() {
    var sid = currentSession();
    try {
      invalidateCache(sid);
    } catch (e) {}
    if (bgTimer !== null && bgSid === sid) return;   // 已在为这个会话预取
    stopBg();
    bgSid = sid;
    tickPrefetch();
    bgTimer = window.setInterval(function () {
      try {
        // 页面不可见时不必浪费请求；下一次 tick 会补上。
        if (document.visibilityState && document.visibilityState !== 'visible') return;
        tickPrefetch();
      } catch (e) {}
    }, BG_REFRESH_MS);
  }
  function stopBg() {
    if (bgTimer !== null) { window.clearInterval(bgTimer); bgTimer = null; }
    bgSid = '';
  }

  // ── 面板骨架：一次性建好，之后只换 body 内容 ─────────────────────────
  function build() {
    var back = el('div', 'dm-subagent-backdrop');
    var sheet = el('div', 'dm-subagent-sheet');
    var head = el('div', 'dm-subagent-head');
    var back2 = el('button', 'dm-subagent-back', '← 返回列表');
    back2.type = 'button';
    var title = el('div', 'dm-subagent-title', '子代理');
    var close = el('button', 'dm-subagent-close', '✕');
    close.type = 'button';
    close.setAttribute('aria-label', '关闭');
    head.appendChild(back2);
    head.appendChild(title);
    head.appendChild(close);
    var body = el('div', 'dm-subagent-body');
    sheet.appendChild(head);
    sheet.appendChild(body);
    back.appendChild(sheet);
    document.body.appendChild(back);

    back.addEventListener('click', function (e) {
      if (e.target !== back) return;   // 点面板内部不关
      closePanel();
    });
    close.addEventListener('click', function (e) { e.preventDefault(); closePanel(); });
    back2.addEventListener('click', function (e) {
      e.preventDefault();
      if (view !== 'list') { stopChat(); view = 'list'; chatSid = ''; renderList(true); }
    });
    // 滚动策略：停在顶部就继续保持贴顶（新消息前插后仍看得到最新）；一旦下滑
    // 读旧消息，就不再抢滚动位置（前插时会补偿 scrollTop，见 prependHtml）。
    body.addEventListener('scroll', function () {
      if (!chat) return;
      if (chatAtTop()) hideNewTip(true);
    }, { passive: true });

    panel = { back: back, sheet: sheet, head: head, title: title, back2: back2, body: body };
    return panel;
  }

  function openPanel() {
    if (!panel) build();
    panel.back.classList.add('dm-subagent-open');
    if (view !== 'list') { stopChat(); view = 'list'; chatSid = ''; }
    renderList(true);
    startTimer();
  }

  // 收起动画：先挂 .dm-closing 让 CSS 反向播放（面板下滑 + 背景淡出），
  // 动画结束后才真正移除 .dm-subagent-open。用 data 标记防止重复触发。
  function closePanel() {
    stopTimer();
    stopChat();     // 离开面板：关 EventSource、停对账定时器，无泄漏
    if (!panel) return;
    var back = panel.back;
    if (!back.classList.contains('dm-subagent-open')) return;
    if (back.getAttribute('data-dm-closing') === '1') return;
    back.setAttribute('data-dm-closing', '1');
    back.classList.add('dm-closing');
    var sheet = back.querySelector('.dm-subagent-sheet');
    if (sheet) sheet.classList.add('dm-closing');
    window.setTimeout(function () {
      back.classList.remove('dm-subagent-open');
      back.classList.remove('dm-closing');
      back.removeAttribute('data-dm-closing');
      if (sheet) sheet.classList.remove('dm-closing');
    }, 200);
  }

  function startTimer() {
    stopTimer();
    timer = window.setInterval(function () {
      if (document.visibilityState && document.visibilityState !== 'visible') return;
      // 聊天视图不再定时整段重绘：它由 SSE 增量 + 30s 对账维护（见 openChat/startChatStream），
      // 整段 innerHTML 重绘既会闪，也会把 scrollTop 打回 0。列表视图照旧低频刷新。
      if (view === 'list') renderList(false);
    }, REFRESH_MS);
  }
  function stopTimer() {
    if (timer !== null) { window.clearInterval(timer); timer = null; }
  }

  // ── 列表视图 ──────────────────────────────────────────────────────────
  // 点开面板时：先用缓存同步渲染（0 延迟），再后台发一次请求按返回刷新。
  // 缓存里没有当前会话的数据时，才显示「加载中…」。
  function renderList(showLoading) {
    if (!panel) return;
    view = 'list';
    panel.back2.classList.remove('dm-subagent-show');

    var sid = currentSession();
    if (!sid) {
      panel.title.textContent = '子代理';
      writeBody('<p class="dm-subagent-hint">未识别到当前会话</p>');
      return;
    }

    var known = cachedRows(sid);
    if (known !== null) {
      // 有缓存：立刻画出来，不等网络。
      paintList(known);
    } else {
      panel.title.textContent = '子代理';
      writeBody('<p class="dm-subagent-hint dm-subagent-loading">加载中…</p>');
    }

    // 无论有没有缓存都再取一次新鲜数据：返回后 paintList 只在真的变了才动 DOM，
    // 所以点开面板既不会空白，也不会因为刷新而闪烁。
    var p = fetchList(sid);
    if (!p) return;
    p.then(function (rows) {
      if (!panel || view !== 'list') return;
      if (!rows) return;              // 请求失败：保留原样，下次轮询再试
      if (currentSession() !== sid) return;  // 期间切了会话：丢弃这次结果
      paintList(rows);
    }).catch(function () {});
  }

  // ── 排序：运行中（running）排最前，其余（空闲）跟在后面 ──────────────
  // 只在渲染前排，不碰 rowsOf／预取缓存／三态逻辑，也不改宿主 subagent.list 数据。
  //
  // 稳定性（关键）：同组内保持原始相对顺序。这里用「原下标做次级键」的显式稳定
  // 排序，不依赖引擎 Array#sort 是否稳定；于是「同一份数据 → 每次都得到完全相同
  // 的行序列 → 完全相同的 HTML 字符串」，setBody 的 data-dm-html 整段 diff 就不会
  // 每次刷新都判定为「变了」而重画 DOM（列表不会乱跳／闪烁）。
  //
  // 健壮性：activity 缺失、不是字符串、不是 'running' 一律当作空闲（rank=1），不抛错。
  function sortRowsRunningFirst(rows) {
    try {
      if (!Array.isArray(rows)) return [];
      if (rows.length < 2) return rows.slice();
      var decorated = [];
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i] || {};
        var act = (r && typeof r.activity === 'string') ? r.activity : '';
        decorated.push({ row: r, rank: act === 'running' ? 0 : 1, idx: i });
      }
      decorated.sort(function (a, b) {
        if (a.rank !== b.rank) return a.rank - b.rank;   // running(0) 先于 其它(1)
        return a.idx - b.idx;                            // 同组内保持原顺序
      });
      var out = [];
      for (var k = 0; k < decorated.length; k++) out.push(decorated[k].row);
      return out;
    } catch (e) {
      return Array.isArray(rows) ? rows.slice() : [];
    }
  }

  // 把一组 rows 画进面板。与上一屏内容一致就整段不动 DOM（避免闪烁／丢焦点）。
  function paintList(rowsIn) {
    if (!panel) return;
    view = 'list';
    panel.back2.classList.remove('dm-subagent-show');

    // 渲染前排序；返回的是新数组，不会就地打乱传入的缓存数组。
    var rows = sortRowsRunningFirst(rowsIn);

    // 标题：总数保持不变；有运行中的再补一个「N 个运行中」。
    // 标题走 textContent，不参与 body 的 data-dm-html diff，所以不影响防抖机制。
    var runCount = 0;
    for (var n = 0; n < rows.length; n++) {
      if (rows[n] && rows[n].activity === 'running') runCount++;
    }
    panel.title.textContent = '子代理 · ' + rows.length + ' 个' +
      (runCount > 0 ? ' · ' + runCount + ' 个运行中' : '');

    if (rows.length === 0) {
      setBody('<p class="dm-subagent-hint">当前没有子代理</p>');
      return;
    }

    var html = '';
    for (var k = 0; k < rows.length; k++) {
      var r = rows[k];
      var running = r.activity === 'running';
      // 层级：缩进 + 「第 N 层」文字。缩进按 depth 递增（最多 3 级，避免窄屏挤没字），
      // 文字版给读屏与看不清缩进的场景兜底。
      var dep = (typeof r.depth === 'number' && r.depth > 0) ? r.depth : 0;
      var indent = dep > 3 ? 3 : dep;
      // 有子级：一个「有下级」标记（不展开，只是提示这行下面还有挂载的子代理）。
      var kids = r.hasChildren ? '<span class="dm-subagent-kids" title="有下级">有下级</span>' : '';
      html +=
        '<button type="button" class="dm-subagent-row" data-sid="' + esc(r.id) + '"' +
          ' data-depth="' + dep + '" data-mode="' + esc(r.mode || 'unknown') + '">' +
          '<span class="dm-subagent-indent' + (indent > 0 ? ' dm-subagent-indent-' + indent : '') + '"></span>' +
          '<span class="dm-subagent-dot' + (running ? ' dm-subagent-dot-run' : '') + '"></span>' +
          '<span class="dm-subagent-main">' +
            '<span class="dm-subagent-label">' + esc(r.label || r.id.slice(0, 8)) + '</span>' +
            '<span class="dm-subagent-sub">' +
              // 状态文案（运行中 / 空闲）—— 面板的主信息，必须一直显示。
              '<span class="dm-subagent-state' + (running ? ' dm-subagent-state-run' : '') + '">' +
                (running ? '运行中' : '空闲') + '</span>' +
              '<span class="dm-subagent-mode">' + esc(modeLabel(r.mode)) + '</span>' +
              '<span class="dm-subagent-depth">第 ' + (dep + 1) + ' 层</span>' +
              kids +
            '</span>' +
          '</span>' +
          '<span class="dm-subagent-chev">›</span>' +
        '</button>';
    }
    setBody(html);
  }

  // 内容没变就不碰 innerHTML —— 这是「刷新不闪烁」的关键。
  // 标记始终跟随真实内容：任何直接写入也走 writeBody，标记就不会指向旧内容，
  // 列表 ↔ 聊天视图来回切时也才不会误判成「没变」而漏画。
  function writeBody(html) {
    if (!panel) return;
    panel.body.setAttribute('data-dm-html', html);
    panel.body.innerHTML = html;
  }
  function setBody(html) {
    if (!panel) return;
    if (panel.body.getAttribute('data-dm-html') === html) return;
    writeBody(html);
  }

  // ── 聊天内容视图：最新消息在最上面（新→旧），首屏一次拉取 + SSE 前插 ──────
  //
  // 用户要求（task-4 rev5）：子代理聊天记录「最新在最上面、从下往上排」，打开就停在
  // 顶部看最新，不需要往下翻。旧实现每 8s 用 session.history 整段重绘
  // （writeBody → innerHTML=），既闪，又把 scrollTop 打回 0；顺序还是旧→新，
  // 于是「停在顶部 = 看到最旧一条」。
  //
  // 现在：
  //   · 打开一次 session.history（subscribe:true 先登记 → 宿主为该会话起 follow）；
  //   · 之后消费 /m/api/events.mux 的 session/event 帧（user/message、assistant/message、
  //     tool/call、assistant/chunk）**前插到最上面**，不整段重绘；
  //   · 30s 低频对账：只补 seq 缺口（正常情况 0 次 DOM 变更）；
  //   · 滚动：停在顶部 → 前插后仍贴顶；已下滑看旧消息 → 插入多少补偿多少 scrollTop
  //     （视觉位置不动），并给一个「↑ 有 N 条新消息」提示；
  //   · 离开聊天视图 / 收起面板 → 关 EventSource、停对账定时器。
  var CHAT_RECONCILE_MS = 30000;
  var CHAT_TOP_PX = 8;

  function chatAtTop() {
    if (!panel) return true;
    return panel.body.scrollTop <= CHAT_TOP_PX;
  }

  // 把一条消息插到最上面。返回插入的节点。
  //
  // 两种滚动策略都在这里落地：
  //   · 用户原本停在顶部：插完仍然 scrollTop=0（新内容立刻可见）；
  //   · 用户已经下滑在读旧消息：scrollTop 加上新增高度，正在看的那条不动，
  //     并亮出「有新消息」提示（点一下回到顶部）。
  function prependHtml(html) {
    if (!chat || !chat.list || !panel) return null;
    var body = panel.body;
    var wasTop = body.scrollTop <= CHAT_TOP_PX;
    var beforeHeight = body.scrollHeight;
    chat.list.insertAdjacentHTML('afterbegin', html);
    var node = chat.list.firstElementChild;
    if (wasTop) {
      body.scrollTop = 0;
    } else {
      body.scrollTop = body.scrollTop + (body.scrollHeight - beforeHeight);
      showNewTip();
    }
    return node;
  }

  function ensureNewTip() {
    if (!panel) return null;
    if (panel.newTip) return panel.newTip;
    var tip = el('button', 'dm-subagent-newtip', '↑ 有新消息');
    tip.type = 'button';
    tip.hidden = true;
    tip.addEventListener('click', function (e) {
      e.preventDefault();
      if (!panel) return;
      panel.body.scrollTop = 0;
      hideNewTip(true);
    });
    panel.sheet.appendChild(tip);
    panel.newTip = tip;
    return tip;
  }
  function showNewTip() {
    if (!chat) return;
    var tip = ensureNewTip();
    if (!tip) return;
    chat.pendingNew = (chat.pendingNew || 0) + 1;
    tip.textContent = '↑ 有 ' + chat.pendingNew + ' 条新消息';
    tip.hidden = false;
  }
  function hideNewTip(reset) {
    if (panel && panel.newTip) panel.newTip.hidden = true;
    if (reset && chat) chat.pendingNew = 0;
  }

  function msgHtml(item, extraClass) {
    var icon = item.role === 'user' ? '我' : (item.role === 'assistant' ? 'AI' : '⚙');
    return '<div class="dm-subagent-msg dm-subagent-msg-' + item.role + (extraClass ? ' ' + extraClass : '') + '">' +
      '<span class="dm-subagent-who">' + icon + '</span>' +
      '<span class="dm-subagent-text">' + esc(item.text || '(无文本)') + '</span>' +
      '</div>';
  }

  // 单条事件 → 一行消息（映射口径与旧 renderChat 完全一致，只是顺序改为前插）。
  function itemOfEvent(ev) {
    if (!ev || typeof ev.type !== 'string') return null;
    var data = (ev.data && typeof ev.data === 'object') ? ev.data : {};
    var seq = (typeof ev.seq === 'number' && isFinite(ev.seq)) ? ev.seq : undefined;
    if (ev.type === 'user/message') {
      return { role: 'user', text: excerpt(textOf(data.content), 120), seq: seq };
    }
    if (ev.type === 'assistant/message') {
      var m = (data.message && typeof data.message === 'object') ? data.message : data;
      var body = textOf(m.content);
      if (!body) body = reasoningOf(m.content);
      return { role: 'assistant', text: excerpt(body, 220), seq: seq };
    }
    if (ev.type === 'tool/call') {
      var toolName = String(data.name || '工具');
      var argText = '';
      try {
        var rawArgs = data.arguments;
        var parsed = typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs;
        if (parsed && typeof parsed === 'object') {
          var keys = Object.keys(parsed).slice(0, 2);
          argText = keys.map(function (k) {
            var v = parsed[k];
            var str = typeof v === 'string' ? v : JSON.stringify(v);
            return k + '=' + String(str == null ? '' : str).replace(/\s+/g, ' ').slice(0, 60);
          }).join(' ');
        }
      } catch (e) {}
      return { role: 'tool', text: toolName + (argText ? ' · ' + argText : ''), seq: seq };
    }
    return null;
  }

  function prependItem(item) {
    if (!chat || !chat.list || !item) return false;
    if (typeof item.seq === 'number') {
      // seq 单调递增：SSE 与 30s 对账可能各带一份同一条事件，这里一并去重。
      if (item.seq <= chat.itemSeq) return false;
      chat.itemSeq = item.seq;
    }
    prependHtml(msgHtml(item));
    return true;
  }

  // 流式气泡：同一个 turn/step 的 text-delta 累加进同一个 DOM 节点（它始终在最上面）。
  //
  // 文字用**一个文本节点**更新（textNode.data += …），而不是 element.textContent = …：
  // 后者每次都会「删掉旧文本节点 + 插一个新节点」，几百个 chunk 就是几百次 childList
  // 增删（实测 527 added / 523 removed）；改文本节点后只剩 characterData 变更，
  // 流式期间消息容器的子节点数量保持不变。
  function liveBubble(key) {
    if (!chat) return null;
    if (chat.live && chat.live.key === key) return chat.live;
    finalizeLive();
    if (!chat.list) return null;
    var node = prependHtml(msgHtml({ role: 'assistant', text: '' }, 'dm-subagent-msg-live'));
    var textEl = node ? node.querySelector('.dm-subagent-text') : null;
    var textNode = null;
    if (textEl) {
      textEl.textContent = '';
      textNode = document.createTextNode('');
      textEl.appendChild(textNode);
    }
    chat.live = { key: key, node: node, textEl: textEl, textNode: textNode, text: '' };
    return chat.live;
  }
  function writeLiveText(live, text) {
    if (!live) return;
    live.text = text;
    if (live.textNode) live.textNode.data = text;
    else if (live.textEl) live.textEl.textContent = text;
  }
  function appendChunk(data) {
    if (!chat || !panel) return;
    var chunk = data && data.chunk;
    if (!chunk || typeof chunk !== 'object') return;
    if (chunk.type !== 'text-delta') return;   // reasoning-delta 不显示，避免与正文混在一起
    if (typeof chunk.text !== 'string' || chunk.text === '') return;
    var key = String(data.turn === undefined ? '' : data.turn) + ':' + String(data.step === undefined ? '' : data.step);
    var live = liveBubble(key);
    if (!live) return;
    var body = panel.body;
    var wasTop = body.scrollTop <= CHAT_TOP_PX;
    var beforeHeight = body.scrollHeight;
    writeLiveText(live, live.text + chunk.text);
    if (wasTop) body.scrollTop = 0;
    else {
      var delta = body.scrollHeight - beforeHeight;
      if (delta > 0) body.scrollTop += delta;
    }
  }
  function finalizeLive(finalText) {
    if (!chat || !chat.live) return false;
    if (typeof finalText === 'string' && finalText !== '') writeLiveText(chat.live, finalText);
    if (chat.live.node) chat.live.node.classList.remove('dm-subagent-msg-live');
    chat.live = null;
    return true;
  }

  // 定稿用的完整正文（不走 excerpt）：流式气泡里已经显示了多少字就保持多少，
  // 否则「流式时是全文、定稿瞬间被截成 220 字」会让文字回缩一下。
  function fullAssistantText(ev) {
    var data = (ev && ev.data && typeof ev.data === 'object') ? ev.data : {};
    var m = (data.message && typeof data.message === 'object') ? data.message : data;
    return textOf(m.content) || reasoningOf(m.content);
  }

  // 一条已落盘事件：先让流式气泡定稿，再按 seq 单调前插（重复事件自然被丢弃）。
  function handleSessionEvent(ev) {
    if (!chat || !ev) return;
    var item = itemOfEvent(ev);
    if (!item) return;
    if (typeof item.seq === 'number') chat.seenSeq = Math.max(chat.seenSeq, item.seq);
    if (item.role === 'assistant' && chat.live) {
      // 同一步的最终消息：复用流式气泡节点（不新建、不闪），文字换成完整定稿内容。
      finalizeLive(fullAssistantText(ev) || item.text);
      if (typeof item.seq === 'number' && item.seq > chat.itemSeq) chat.itemSeq = item.seq;
      return;
    }
    if (item.role === 'user') finalizeLive();
    prependItem(item);
  }

  function createChatShell() {
    if (!panel) return null;
    panel.body.removeAttribute('data-dm-html');
    panel.body.innerHTML = '';
    var list = el('div', 'dm-subagent-chat');
    list.setAttribute('data-dm-chat', '1');
    panel.body.appendChild(list);
    return list;
  }

  function stopChat() {
    if (!chat) return;
    var old = chat;
    chat = null;
    try { if (old.es) old.es.close(); } catch (e) {}
    if (old.reconcileTimer !== null && old.reconcileTimer !== undefined) window.clearInterval(old.reconcileTimer);
    if (panel) {
      panel.body.removeAttribute('data-dm-chat-sid');
      // 恢复浏览器默认的滚动锚定（聊天视图里是我们自己接管补偿的）。
      panel.body.style.overflowAnchor = '';
      if (panel.newTip) panel.newTip.hidden = true;
    }
  }

  // 30s 低频对账：只把「本页里有、我们还没画」的事件补上；不清空、不重置滚动。
  function reconcileChat() {
    if (!chat || view !== 'chat') return;
    var target = chat;
    rpc('session.history', {
      sessionId: target.sid,
      maxMessages: 25,
      parentSessionId: target.parent,
      subscribe: true,
    }).then(function (res) {
      if (!chat || chat !== target || view !== 'chat') return;
      if (!res || !res.ok || !res.value) return;
      var events = Array.isArray(res.value.events) ? res.value.events : [];
      for (var i = 0; i < events.length; i++) {
        var ev = events[i] && events[i].event;
        if (ev) handleSessionEvent(ev);
      }
    }).catch(function () {});
  }

  function startChatStream(target) {
    if (!target || target.es) return;
    try {
      // 自己开一条 mux 连接（不复用 bundle 的）：只认当前子代理会话的帧。
      var es = new EventSource('/m/api/events.mux');
      target.es = es;
      es.addEventListener('message', function (msg) {
        if (!chat || chat !== target) return;
        var raw = msg && msg.data ? String(msg.data) : '';
        if (raw === '') return;
        // 先子串预判：绝大多数帧与本会话无关，避免每个 chunk 都 JSON.parse。
        if (raw.indexOf('session/event') < 0 && raw.indexOf('assistant/chunk') < 0) return;
        var wire;
        try { wire = JSON.parse(raw); } catch (e) { return; }
        if (!wire || wire.type !== 'server-request') return;
        var frame = wire.payload;
        if (!frame || frame.type !== 'session/event') return;
        if (frame.sessionId !== target.sid) return;
        var ev = frame.event;
        if (!ev || typeof ev !== 'object') return;
        if (ev.type === 'assistant/chunk') appendChunk(ev.data);
        else handleSessionEvent(ev);
      });
      es.addEventListener('open', function () {
        // 重连后可能漏帧：立刻对账一次（仍然只补差异）。
        if (chat === target) reconcileChat();
      });
    } catch (e) {}
    target.reconcileTimer = window.setInterval(function () {
      if (document.visibilityState && document.visibilityState !== 'visible') return;
      if (chat !== target || view !== 'chat') return;
      reconcileChat();
    }, CHAT_RECONCILE_MS);
  }

  // ── 打开某条子代理的聊天内容 ──────────────────────────────────────────
  function openChat(sid) {
    if (!panel || !sid) return;
    if (chat && chat.sid === sid && view === 'chat') return;
    stopChat();
    view = 'chat';
    panel.back2.classList.add('dm-subagent-show');
    panel.title.textContent = '子代理 · ' + String(sid).slice(0, 8);
    chat = {
      sid: sid,
      parent: currentSession(),
      itemSeq: -1,
      seenSeq: -1,
      live: null,
      es: null,
      reconcileTimer: null,
      list: null,
      pendingNew: 0,
    };
    var target = chat;
    chat.list = createChatShell();
    panel.body.setAttribute('data-dm-chat-sid', sid);
    // 聊天视图自己补偿前插带来的高度差，关掉浏览器的滚动锚定，行为才可预测。
    panel.body.style.overflowAnchor = 'none';
    panel.body.scrollTop = 0;
    hideNewTip(true);
    if (!chat.list) return;
    chat.list.innerHTML = '<p class="dm-subagent-hint dm-subagent-loading">加载中…</p>';

    // 带上 parentSessionId：宿主读子代理会话必须走 durable 父地址；
    // subscribe=true 必须在读历史**之前**登记，否则两者之间的增量没人推。
    rpc('session.history', {
      sessionId: sid,
      maxMessages: 50,
      parentSessionId: target.parent,
      subscribe: true,
    }).then(function (res) {
      if (!chat || chat !== target || view !== 'chat') return;
      target.list.innerHTML = '';
      var ok = !!(res && res.ok && res.value);
      var events = ok && Array.isArray(res.value.events) ? res.value.events : [];
      // 只画能显示的事件（user / assistant / tool），保持宿主给的旧→新顺序。
      var items = [];
      for (var i = 0; i < events.length; i++) {
        var ev = events[i] && events[i].event;
        if (!ev) continue;
        var item = itemOfEvent(ev);
        if (item) items.push(item);
      }
      if (items.length === 0) {
        target.list.innerHTML = '<p class="dm-subagent-hint">无法加载该子代理的会话内容</p>';
        return;
      }
      // 反转渲染：最新一条在最上面，旧消息往下排。
      var html = '';
      for (var k = items.length - 1; k >= 0; k -= 1) html += msgHtml(items[k]);
      target.list.innerHTML = html;
      var newest = -1;
      for (var m = 0; m < items.length; m += 1) {
        if (typeof items[m].seq === 'number') newest = Math.max(newest, items[m].seq);
      }
      target.itemSeq = newest;
      target.seenSeq = newest;
      // 打开即停在顶部：顶部就是最新消息。
      panel.body.scrollTop = 0;
      startChatStream(target);
    }).catch(function () {
      if (!chat || chat !== target || view !== 'chat') return;
      target.list.innerHTML = '<p class="dm-subagent-hint">无法加载该子代理的会话内容</p>';
    });
  }

  // 行点击：取 data-sid，切成聊天内容视图（增量模式）。
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var row = t.closest('.dm-subagent-row');
    if (!row) return;
    var sid = row.getAttribute('data-sid');
    if (!sid) return;
    e.preventDefault();
    chatSid = sid;
    openChat(sid);
  });

  btn.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (panel && panel.back.classList.contains('dm-subagent-open')) closePanel();
    else openPanel();
  });

  // ── 只在聊天页显示：顶栏右侧含 aria-label="更多" 的按钮即认定为聊天页 ──
  function slot() {
    var slots = document.querySelectorAll('.mobile-headerSlot-right');
    for (var i = 0; i < slots.length; i++) {
      var s = slots[i];
      // 聊天页特征：右侧槽里有一个「更多」按钮。
      var more = s.querySelector('button[aria-label="更多"]');
      if (more) return { slot: s, more: more };
    }
    return null;
  }

  function ensure() {
    var found = slot();
    if (!found) {
      // 不在聊天页（或顶栏暂未渲染）：把按钮摘下来，避免出现在别的页面。
      if (btn.parentNode) btn.parentNode.removeChild(btn);
      // 离开聊天页就关面板并停掉所有轮询，别在后台白打请求。
      if (panel && panel.back.classList.contains('dm-subagent-open')) closePanel();
      stopBg();
      return;
    }
    if (btn.parentNode !== found.slot) found.slot.insertBefore(btn, found.more);
    else if (btn.nextSibling !== found.more) found.slot.insertBefore(btn, found.more);
    // 进聊天页：起后台预取（内部自带会话失效判断，重复调用安全）。
    startBg();
  }

  // ── 对外暴露一个只读快照 + 开面板的入口 ────────────────────────────────
  // 工具行里的「子代理状态」图标（SUBAGENT_STATUS_BTN_HTML）要显示运行中数量、
  // 点击要打开本面板。它在本脚本之后执行、且是另一个闭包，唯一不新增轮询、
  // 又不重画面板的办法就是复用这里的预取缓存与 openPanel：这里挂一个 hub，
  // 状态图标只读快照（纯内存，不发 RPC），点击调 openPanel。
  try {
    window.__dmSubagentHub = {
      // { sid, known:boolean, total:number, running:number }
      // known=false 表示「还没拉到当前会话的数据」，图标据此保持隐藏。
      snapshot: function () {
        try {
          var sid = currentSession();
          var rows = cachedRows(sid);
          if (rows === null) return { sid: sid, known: false, total: 0, running: 0 };
          var running = 0;
          for (var i = 0; i < rows.length; i++) {
            if (rows[i] && rows[i].activity === 'running') running++;
          }
          return { sid: sid, known: true, total: rows.length, running: running };
        } catch (e) {
          return { sid: '', known: false, total: 0, running: 0 };
        }
      },
      openPanel: function () { try { openPanel(); } catch (e) {} },
      // 聊天视图自检快照（只读，测试/排查用）：确认 EventSource 已释放、增量游标位置。
      chatState: function () {
        try {
          if (!chat) return { open: false };
          return {
            open: true,
            sid: chat.sid,
            itemSeq: chat.itemSeq,
            seenSeq: chat.seenSeq,
            nodes: chat.list ? chat.list.children.length : 0,
            live: chat.live !== null,
            atTop: chatAtTop(),
            pendingNew: chat.pendingNew || 0,
            esReadyState: chat.es ? chat.es.readyState : -1,
            reconciling: chat.reconcileTimer !== null,
          };
        } catch (e) {
          return { open: false };
        }
      },
    };
  } catch (e) {}

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    window.setTimeout(function () { pending = false; ensure(); }, 60);
  }
  try {
    if (window.__dmMutationBus) window.__dmMutationBus.subscribe(schedule);
    else {
      var mo = new MutationObserver(schedule);
      mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
    }
  } catch (e) {}
  if (window.__dmEnsureTick) window.__dmEnsureTick.add(ensure, 800, function () { return !!document.querySelector('.chat-composer'); }); else setInterval(ensure, 800);
  ensure();
})();
</script>`
