import { iconMarkup } from '../design/icons.tsx'

/**
 * 迁移 A：1:1 搬自宿主 index.js 的 `HOST_PAGES_HTML` 注入字符串。
 * 工作区页顶栏的「插件」「自动化」两个入口及其页面。
 *
 * 只搬位置、不改写：内容仍是当年的 HTML + 内联脚本，由
 * `dm-pages/index.ts` 在 bundle 启动时按原顺序安装到 document。
 */
// ── 工作区页左上角「插件」「自动化」入口 + 两个宿主信息页 ─────────────────────
// 数据来源（全部宿主真实服务，不写死、不造假）：
//   · 插件页   ← ctx.get('pluginManager').listBundles() + listPlugins()
//     @deepseek-ai/dsh-plugin-manager 的公开方法；桌面「插件」页用的就是这两个
//     （ui-plugin-manager client 调 ctx.remote.pluginManager.listBundles/listPlugins）。
//   · 自动化页 ← ctx.get('schedule').catalog()
//     @deepseek-ai/dsh-schedule 的公开方法，返回宿主全部 active/inactive 定时任务；
//     桌面「自动化任务」页同源（ui-schedule client 调 ctx.remote.schedule.catalog()）。
// 服务用 ctx.get 惰性读取，而不是写进静态 inject：这两个服务在没有 profileContext
// 的环境会被禁用，硬 inject 会让整个手机插件加载失败；取不到时 RPC 返回
// service_unavailable，页面显示错误态，绝不补假数据。
//
// 按钮只在「工作区列表页」出现：bundle 里只有该页的顶栏有 aria-label="设置" 齿轮。
// 两个按钮是 header 的直接子节点 + 绝对定位（同 48px / 同 top:50% / 同 .mobile-iconbtn
// 规格），并给 header 加 .dm-header-extras 把首列从 48px 扩到 148px —— 标题会自动在
// 剩余空间重新居中，320/360/390 宽都不会被按钮压住（见 theme.css 同名段落）。
//
// 两个入口图标取自宿主自己的图标定义（web shell 的 IconPluginPinwheelOutlineRegular /
// IconClockOutlineRegular，16×16、stroke 1px 描边风格），path d 原样照搬。
/**
 * 页面入口与内置配置四行的图标：全部来自 design/icons.tsx（桌面端同一份 svg）。
 * 组 2（页面入口）跟桌面端规格；组 1（聊天工具栏）不在这里，保持原样。
 */
const ENTRY_PLUGINS_ICON = iconMarkup('pagePlugins', { size: 20 })
const ENTRY_AUTOMATIONS_ICON = iconMarkup('pageAutomations', { size: 20 })
const CONFIG_ART_SVG: Readonly<Record<string, string>> = {
  subagent: iconMarkup('pageBuiltinSubagent', { size: 36 }),
  'web-search': iconMarkup('pageBuiltinWebSearch', { size: 36 }),
  'agent-loop': iconMarkup('pageBuiltinAgentLoop', { size: 36 }),
  shell: iconMarkup('pageBuiltinTerminal', { size: 36 }),
}

export const HOST_PAGES_HTML = `<button id="dm-plugins-btn" class="mobile-iconbtn dm-header-btn" type="button" aria-label="插件" title="插件">${ENTRY_PLUGINS_ICON}</button><button id="dm-automation-btn" class="mobile-iconbtn dm-header-btn" type="button" aria-label="自动化" title="自动化">${ENTRY_AUTOMATIONS_ICON}</button>
<div id="dm-host-pages">
<section id="dm-page-plugins" class="dm-page" hidden aria-label="插件">
<header class="dm-page-header"><button class="dm-page-iconbtn" type="button" aria-label="返回" data-dm-back="plugins"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button><h1 class="dm-page-title">插件</h1><button class="dm-page-iconbtn" type="button" aria-label="刷新插件" data-dm-refresh="plugins"><svg class="dm-page-refresh-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19.49 8.66A8.2 8.2 0 1 1 11.71 3.80"/><path d="M16.31 3.64L11.64 1.56L11.79 6.05Z" fill="currentColor" stroke="currentColor" stroke-width="0.55" stroke-linejoin="round"/></svg></button></header>
<div class="dm-page-body" data-dm-body="plugins"><p class="dm-page-state">加载中…</p></div>
</section>
<section id="dm-page-plugin-detail" class="dm-page dm-page-detail" hidden aria-label="插件详情">
<header class="dm-page-header"><button class="dm-page-iconbtn" type="button" aria-label="返回插件列表" data-dm-back="detail"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button><h1 class="dm-page-title">插件</h1><span class="dm-page-iconbtn dm-page-spacer" aria-hidden="true"></span></header>
<div class="dm-page-body" id="dm-plugin-detail-body"><p class="dm-page-state">加载中…</p></div>
</section>
<section id="dm-page-automations" class="dm-page" hidden aria-label="自动化任务">
<header class="dm-page-header dm-page-header-auto"><button class="dm-page-iconbtn" type="button" aria-label="返回" data-dm-back="automations"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button><h1 class="dm-page-title">自动化任务</h1><button class="dm-page-new" type="button" data-dm-new="1">＋ 新建</button></header>
<div class="dm-page-body" data-dm-body="automations">
<div class="dm-auto-toolbar">
<div class="dm-auto-tabs" role="tablist"><button class="dm-auto-tab" type="button" role="tab" data-dm-tab="all">全部</button><button class="dm-auto-tab" type="button" role="tab" data-dm-tab="active">已开启</button><button class="dm-auto-tab" type="button" role="tab" data-dm-tab="inactive">已结束</button></div>
<div class="dm-auto-search"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/></svg><input type="search" inputmode="search" placeholder="搜索自动化任务" aria-label="搜索自动化任务" data-dm-search="1"></div>
</div>
<div class="dm-auto-list" data-dm-auto-list="1"><p class="dm-page-state">加载中…</p></div>
</div>
</section>
<section id="dm-page-cfg" class="dm-page dm-page-cfg" hidden aria-label="内置插件配置">
<header class="dm-page-header"><button class="dm-page-iconbtn" type="button" aria-label="返回插件列表" data-dm-cfg-back="1"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button><h1 class="dm-page-title" data-dm-cfg-title>内置插件配置</h1><button class="dm-page-iconbtn" type="button" aria-label="重新读取配置" data-dm-cfg-refresh="1"><svg class="dm-page-refresh-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19.49 8.66A8.2 8.2 0 1 1 11.71 3.80"/><path d="M16.31 3.64L11.64 1.56L11.79 6.05Z" fill="currentColor" stroke="currentColor" stroke-width="0.55" stroke-linejoin="round"/></svg></button></header>
<div class="dm-page-body" data-dm-cfg-body><p class="dm-page-state">加载中…</p></div>
</section>
<section id="dm-page-models" class="dm-page dm-page-models" hidden aria-label="模型">
<header class="dm-page-header"><button class="dm-page-iconbtn" type="button" aria-label="返回设置" data-dm-mc-back="1"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button><h1 class="dm-page-title" data-dm-mc-title>模型</h1><button class="dm-page-iconbtn" type="button" aria-label="刷新模型" data-dm-mc-refresh="1"><svg class="dm-page-refresh-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19.49 8.66A8.2 8.2 0 1 1 11.71 3.80"/><path d="M16.31 3.64L11.64 1.56L11.79 6.05Z" fill="currentColor" stroke="currentColor" stroke-width="0.55" stroke-linejoin="round"/></svg></button></header>
<div class="dm-page-body" data-dm-mc-body><p class="dm-page-state">加载中…</p></div>
</section>
</div>
<div class="dm-toast" id="dm-toast" role="status" aria-live="polite" hidden></div>
<script>
(function () {
  'use strict';

  // 页面注册表：kind → 宿主 RPC。标题/方法都只在这里出现一次。
  var PAGES = {
    plugins: { el: 'dm-page-plugins', method: 'mobile.plugins', title: '插件' },
    automations: { el: 'dm-page-automations', method: 'mobile.automations', title: '自动化任务' }
  };
  // 宿主图标 path 原文（16×16 描边；来自 web shell 的 primitives 图标组件）。
  var ICON_PINWHEEL = '<svg class="dm-clock" width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" aria-hidden="true"><path d="M7.84457 5.06199C11.6605 4.93876 14.7962 6.14848 14.8484 7.76397C14.8875 8.97461 13.1838 10.0696 10.7215 10.5942"/><path d="M5.12742 8.07731C5.00419 4.26138 6.21391 1.12568 7.8294 1.07351C9.04004 1.03441 10.135 2.73808 10.6596 5.20037"/><path d="M8.02457 10.6802C4.20865 10.8034 1.07294 9.5937 1.02077 7.97821C0.981678 6.76758 2.68535 5.67262 5.14763 5.14798"/><path d="M10.7476 7.89535C10.8708 11.7113 9.66109 14.847 8.0456 14.8991C6.83496 14.9382 5.74 13.2346 5.21536 10.7723"/></svg>';
  var ICON_CLOCK = '<svg class="dm-clock" width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" aria-hidden="true"><path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"/><path d="M8 4.31V8.46L11 10.08"/></svg>';
  // 内置插件配置四行的图标：宿主 web shell 的 PluginArtwork* 组件（36×36 多色 SVG），
  // 从 asar 的 @deepseek-ai/dsh-client-ui-primitives（打包进 dsh-web-frontend 的
  // index-*.js）提取，path/gradient/fill 原样，仅由 CSS 缩放到列表/详情尺寸。
  //   subagent  = PluginArtworkSubagent  (蓝绿方块渐变)
  //   web-search= PluginArtworkSearch    (彩色放大镜)
  //   agent-loop= PluginArtworkLoop      (紫色循环)
  //   shell     = PluginArtworkTerminal  (蓝色 >_)
  var CONFIG_ART = ${JSON.stringify(CONFIG_ART_SVG)};
  var current = null;      // { kind, el } —— 当前打开的信息页（列表层）
  var detailName = null;   // 当前打开的插件详情（bundle name 或 entry:entryId）
  var seq = 0;             // 每次 load 递增，晚到的响应不许覆盖新页面
  var loading = {};
  var pluginsValue = null; // mobile.plugins 最近一次成功的结果（value）
  var autoValue = null;    // mobile.automations 最近一次成功的结果（value）
  var autoTab = 'active';  // 桌面默认选中「已开启」
  var autoQuery = '';
  var toastTimer = null;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function localized(value) {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') return value.zh || value.en || '';
    return '';
  }
  function shortName(name) {
    var text = String(name || '');
    if (text.charAt(0) === '@') {
      var slash = text.indexOf('/');
      if (slash >= 0) return text.slice(slash + 1);
    }
    return text;
  }
  function firstChar(text) {
    var value = String(text || '').trim();
    return value === '' ? '?' : value.slice(0, 1).toUpperCase();
  }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function fmtWhen(iso) {
    if (!iso) return '';
    var date = new Date(iso);
    if (isNaN(date.getTime())) return String(iso);
    return (date.getMonth() + 1) + '-' + pad2(date.getDate()) + ' ' + pad2(date.getHours()) + ':' + pad2(date.getMinutes());
  }
  function duration(seconds) {
    var value = Number(seconds);
    if (!isFinite(value) || value <= 0) return '';
    if (value % 86400 === 0) return (value / 86400) + ' 天';
    if (value % 3600 === 0) return (value / 3600) + ' 小时';
    if (value % 60 === 0) return (value / 60) + ' 分钟';
    return value + ' 秒';
  }
  var WEEK = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  function rpc(method, payload) {
    return fetch('/m/api/' + method, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rpcId: 'dm-host-' + Date.now() + '-' + Math.random().toString(36).slice(2), payload: payload || {} })
    }).then(function (res) {
      return res.json().then(function (json) { return json; }, function () { return null; });
    }).then(function (json) {
      if (!json || !json.result) throw new Error('宿主没有返回 RPC 结果（HTTP 异常或响应为空）');
      return json.result;
    });
  }

  function toast(text) {
    var el = document.getElementById('dm-toast');
    if (!el) return;
    el.textContent = String(text == null ? '' : text);
    el.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 2800);
  }

  function pageBody(kind) {
    return document.querySelector('[data-dm-body="' + kind + '"]');
  }

  // ── 顶栏两个入口：只在工作区列表页（存在设置齿轮）出现 ───────────────────
  function workspaceHeader() {
    var gear = document.querySelector('.mobile-header .mobile-headerSlot-right > button[aria-label="设置"]');
    return gear ? gear.closest('.mobile-header') : null;
  }
  // 按钮模板：两个入口按钮被 append 进 React 管的 .mobile-header 里，
  // 一旦离开工作区页，React 卸载 header 会把它们一起带走。旧实现只判断
  // "parentNode 不是 header 就 append"，按钮已被销毁时 getElementById 返回 null，
  // 于是返回工作区后按钮永久消失（用户反馈：进过别的页面再回来就没了）。
  // 这里在启动时保留 outerHTML 作为模板，缺失时按原样重建（点击是 document 委托，
  // 重建不会丢事件）。
  var btnTemplate = (function () {
    var p = document.getElementById('dm-plugins-btn');
    var a = document.getElementById('dm-automation-btn');
    return p && a ? { html: p.outerHTML + a.outerHTML } : null;
  })();
  function rebuildButtons(header) {
    if (!btnTemplate) return false;
    var wrap = document.createElement("div");
    wrap.innerHTML = btnTemplate.html;
    var p = wrap.querySelector('#dm-plugins-btn');
    var a = wrap.querySelector('#dm-automation-btn');
    if (!p || !a) return false;
    header.appendChild(p);
    header.appendChild(a);
    return true;
  }
  function syncHeader() {
    var header = workspaceHeader();
    var headers = document.querySelectorAll('.mobile-header');
    for (var i = 0; i < headers.length; i++) headers[i].classList.toggle('dm-header-extras', headers[i] === header);
    if (!header) return;
    var plugins = document.getElementById('dm-plugins-btn');
    var automation = document.getElementById('dm-automation-btn');
    if (!plugins || !automation) { rebuildButtons(header); return; }
    if (plugins.parentNode !== header) header.appendChild(plugins);
    if (automation.parentNode !== header) header.appendChild(automation);
  }
  var syncQueued = false;
  function queueSync() {
    if (syncQueued) return;
    syncQueued = true;
    var run = function () { syncQueued = false; try { syncHeader(); } catch (e) {} };
    if (window.requestAnimationFrame) window.requestAnimationFrame(run);
    else window.setTimeout(run, 0);
  }

  // ── 打开 / 关闭信息页（pushState 让安卓返回键也能退）────────────────────
  function openPage(kind) {
    var cfg = PAGES[kind];
    if (!cfg) return;
    var el = document.getElementById(cfg.el);
    if (!el) return;
    if (current && current.kind === kind) { loadPage(kind); return; }
    if (current) closePage(true);
    closeDetail(true);
    current = { kind: kind, el: el };
    el.hidden = false;
    document.documentElement.classList.add('dm-host-page-open');
    try { history.pushState({ dmHostPage: kind }, '', '#/dm-' + kind); } catch (e) {}
    loadPage(kind);
  }
  function closePage(fromPop) {
    if (!current) return;
    var el = current.el;
    current = null;
    el.hidden = true;
    document.documentElement.classList.remove('dm-host-page-open');
    if (!fromPop) { try { history.back(); } catch (e) {} }
  }
  function openDetail(key) {
    var found = detailOf(key);
    if (!found) return;
    detailName = key;
    var el = document.getElementById('dm-page-plugin-detail');
    if (!el) return;
    el.hidden = false;
    document.documentElement.classList.add('dm-host-page-open');
    renderDetail(found);
    try { history.pushState({ dmHostDetail: key }, '', '#/dm-plugin/' + encodeURIComponent(key)); } catch (e) {}
  }
  function closeDetail(fromPop) {
    if (detailName === null) return;
    detailName = null;
    var el = document.getElementById('dm-page-plugin-detail');
    if (el) el.hidden = true;
    if (!fromPop) { try { history.back(); } catch (e) {} }
  }

  window.addEventListener('popstate', function (event) {
    // 从其它页面返回时立刻重建顶栏入口（否则要等 1s 的兜底定时器）。
    queueSync();
    var state = event && event.state;
    if (detailName !== null) {
      if (!state || !state.dmHostDetail) { closeDetail(true); return; }
    }
    if (current && (!state || state.dmHostPage !== current.kind)) closePage(true);
  });

  // ── 插件：数据加载 ──────────────────────────────────────────────────────
  // 刷新反馈：请求在飞时让右上角图标转一圈（只对带 data-dm-refresh 的页生效）。
  // 转的是 <svg> 本身，transform-origin 默认就在它的 20×20 盒子中心。
  function setPageRefreshing(kind, on) {
    var btn = document.querySelector('[data-dm-refresh="' + kind + '"]');
    if (!btn) return;
    if (on) {
      btn.classList.add('dm-spinning');
      btn.setAttribute('aria-busy', 'true');
    } else {
      btn.classList.remove('dm-spinning');
      btn.removeAttribute('aria-busy');
    }
  }
  function loadPage(kind) {
    var cfg = PAGES[kind];
    var body = pageBody(kind);
    if (!cfg || !body) return;
    if (kind === 'plugins') {
      if (pluginsValue) { renderPlugins(); return; }
      body.innerHTML = '<p class="dm-page-state">加载中…</p>';
    } else {
      autoQuery = '';
      autoTab = 'active';
      var search = document.querySelector('[data-dm-search]');
      if (search) search.value = '';
      if (autoValue) { renderAutomations(); return; }
      // 自动化页的 Tab/搜索框是静态节点，不能连容器一起 innerHTML 覆盖；
      // 只把「列表区」置为加载态。
      var autoList = document.querySelector('[data-dm-auto-list]');
      if (autoList) autoList.innerHTML = '<p class="dm-page-state">加载中…</p>';
    }
    var my = ++seq;
    loading[kind] = my;
    setPageRefreshing(kind, true);
    rpc(cfg.method).then(function (result) {
      if (loading[kind] !== my) return;
      setPageRefreshing(kind, false);
      if (!result || result.ok !== true) {
        renderPageError(kind, result && result.error ? result.error : { code: 'unknown', message: '宿主返回了无法识别的结果' });
        return;
      }
      if (kind === 'plugins') { pluginsValue = result.value || {}; renderPlugins(); }
      else { autoValue = result.value || {}; renderAutomations(); }
    }).catch(function (error) {
      if (loading[kind] !== my) return;
      setPageRefreshing(kind, false);
      renderPageError(kind, { code: 'network_error', message: (error && error.message) || String(error) });
    });
  }

  function renderPageError(kind, error) {
    // 自动化页只替换列表区，保留顶部 Tab/搜索框（它们不依赖 RPC 结果）。
    var body = kind === 'automations' ? document.querySelector('[data-dm-auto-list]') : pageBody(kind);
    if (!body) return;
    var code = error && error.code ? String(error.code) : 'unknown';
    var message = error && error.message ? String(error.message) : '未知错误';
    var retry = kind === 'plugins' ? 'plugins' : 'automations';
    body.innerHTML = '<div class="dm-page-state dm-page-error">' +
      '<p class="dm-page-stateTitle">读取失败</p>' +
      '<p class="dm-page-stateText">' + esc(message) + '</p>' +
      '<p class="dm-page-stateCode">' + esc(code) + '</p>' +
      '<button class="dm-page-retry" type="button" data-dm-retry="' + retry + '">重试</button>' +
      '</div>';
  }

  function iconHtml(icon, title, size) {
    var cls = 'dm-card-icon' + (size === 'lg' ? ' dm-card-icon-lg' : '');
    if (typeof icon === 'string' && icon.indexOf('data:image/') === 0) {
      return '<img class="' + cls + '" src="' + esc(icon) + '" alt="" loading="lazy">';
    }
    return '<span class="' + cls + ' dm-card-icon-letter" aria-hidden="true">' + esc(firstChar(title)) + '</span>';
  }
  /** 内置配置页四行：优先用宿主原始彩色图标，没有再退回 meta.icon / 首字母。 */
  function configArtIcon(configPage, icon, title, size) {
    var svg = configPage && CONFIG_ART[configPage] ? CONFIG_ART[configPage] : '';
    if (svg) {
      return '<span class="dm-card-icon dm-card-icon-art' + (size === 'lg' ? ' dm-card-icon-lg' : '') + '" aria-hidden="true">' + svg + '</span>';
    }
    return iconHtml(icon, title, size);
  }

  function switchHtml(checked, attrs, disabled, label) {
    return '<button class="dm-switch" type="button" role="switch" aria-checked="' + (checked ? 'true' : 'false') + '" aria-label="' + esc(label || '启停') + '"' +
      (attrs || '') + (disabled ? ' disabled' : '') + '><span class="dm-switch-knob"></span></button>';
  }

  function sectionHtml(title, countText, rowsHtml) {
    if (!rowsHtml) return '';
    return '<section class="dm-section"><div class="dm-section-head"><span class="dm-section-title">' + esc(title) + '</span><span class="dm-section-count">' + esc(countText) + '</span></div>' + rowsHtml + '</section>';
  }

  // ── 插件：列表（内置插件配置 / 实验性插件 / 已安装插件）─────────────────
  function renderPlugins() {
    var body = pageBody('plugins');
    if (!body) return;
    var value = pluginsValue || {};
    var groups = value.groups || {};
    var basic = Array.isArray(groups.basic) ? groups.basic : [];
    var extensions = Array.isArray(groups.extensions) ? groups.extensions : [];
    var installed = Array.isArray(groups.installed) ? groups.installed : [];
    var total = basic.length + extensions.length + installed.length;
    body.setAttribute('data-dm-count', String(total));
    body.setAttribute('data-dm-counts', JSON.stringify({ basic: basic.length, extensions: extensions.length, installed: installed.length }));
    if (total === 0) {
      body.innerHTML = '<div class="dm-page-state dm-page-empty"><p class="dm-page-stateTitle">宿主没有可展示的插件</p><p class="dm-page-stateText">pluginManager 的真实返回里没有内置配置行、实验性包或已安装包。这里只展示宿主数据，不补示例。</p></div>';
      return;
    }
    var html = '';
    html += sectionHtml('内置插件配置', '共 ' + basic.length + ' 个', basic.map(function (item) {
      // 桌面这四行的标题/说明来自页面自己的文案（子智能体 / 网页搜索 / 终端），
      // 不是 client 包的 meta.title（「…设置」）；宿主已把两者一起下发。
      var title = item.configPage && item.configPageTitle
        ? item.configPageTitle
        : (localized(item.meta && item.meta.title) || shortName(item.moduleName));
      var description = item.configPage && item.configPageDescription
        ? item.configPageDescription
        : localized(item.meta && item.meta.description);
      // 有真实配置页的行（子智能体 / 网页搜索 / 终端）直接进配置页；
      // 其余行仍走原来的 entry 详情（宿主没给可写命名空间时就只能只读展示）。
      var openAttr = item.configPage
        ? 'data-dm-cfg-open="' + esc(item.configPage) + '"'
        : 'data-open-entry="' + esc(item.entryId) + '"';
      var badge = item.configPage ? '<span class="dm-badge-config">可配置</span>' : '';
      return '<div class="dm-card" ' + openAttr + ' role="button" tabindex="0">' +
        configArtIcon(item.configPage, item.meta && item.meta.icon, title) +
        '<div class="dm-card-main"><div class="dm-card-titleRow"><span class="dm-card-title">' + esc(title) + '</span>' + badge + '</div>' +
        (description ? '<div class="dm-card-desc">' + esc(description) + '</div>' : '') +
        '<div class="dm-card-sub">' + esc(item.moduleName) + '</div></div>' +
        '<span class="dm-chevron" aria-hidden="true">›</span></div>';
    }).join(''));
    html += sectionHtml('实验性插件', '共 ' + extensions.length + ' 个', extensions.map(function (bundle) {
      return bundleRowHtml(bundle, true);
    }).join(''));
    html += sectionHtml('已安装插件', '共 ' + installed.length + ' 个', installed.map(function (bundle) {
      return bundleRowHtml(bundle, false);
    }).join(''));
    body.innerHTML = html;
  }

  function bundleRowHtml(bundle, experimental) {
    var title = localized(bundle.meta && bundle.meta.title) || shortName(bundle.name);
    var description = bundle.description || localized(bundle.meta && bundle.meta.description);
    var protectedMobile = bundle.name === 'dsh-mobile';
    var badge = experimental ? '<span class="dm-badge dm-badge-beta">实验性</span>' : '';
    var side = switchHtml(bundle.enabled, ' data-toggle-bundle="' + esc(bundle.name) + '"', protectedMobile, '启停 ' + title);
    if (protectedMobile) side += '<span class="dm-card-note">手机端插件，请在桌面端停用</span>';
    var meta = [];
    if (bundle.version) meta.push('v' + bundle.version);
    if (bundle.pluginCount) meta.push(bundle.pluginCount + ' 个组件');
    return '<div class="dm-card" data-open-bundle="' + esc(bundle.name) + '" role="button" tabindex="0">' +
      iconHtml(bundle.meta && bundle.meta.icon, title) +
      '<div class="dm-card-main"><div class="dm-card-titleRow"><span class="dm-card-title">' + esc(title) + '</span>' + badge + '</div>' +
      (description ? '<div class="dm-card-desc">' + esc(description) + '</div>' : '') +
      (meta.length ? '<div class="dm-card-sub">' + esc(meta.join(' · ')) + '</div>' : '') +
      '</div><div class="dm-card-side">' + side + '</div></div>';
  }

  // ── 插件：详情（bundle 详情 / 内置插件 entry 详情）──────────────────────
  function detailOf(key) {
    if (!pluginsValue || !pluginsValue.groups) return null;
    var groups = pluginsValue.groups;
    var lists = ['basic', 'extensions', 'installed'];
    if (key.indexOf('entry:') === 0) {
      var entryId = key.slice('entry:'.length);
      var basic = groups.basic || [];
      for (var i = 0; i < basic.length; i++) if (basic[i].entryId === entryId) return { type: 'entry', item: basic[i] };
      return null;
    }
    for (var j = 0; j < lists.length; j++) {
      var list = groups[lists[j]] || [];
      for (var k = 0; k < list.length; k++) if (list[k].name === key) return { type: 'bundle', bundle: list[k], experimental: lists[j] === 'extensions' };
    }
    return null;
  }

  function renderDetail(found) {
    var body = document.getElementById('dm-plugin-detail-body');
    if (!body) return;
    if (found.type === 'entry') renderEntryDetail(body, found.item);
    else renderBundleDetail(body, found.bundle, found.experimental);
  }

  function renderEntryDetail(body, item) {
    var title = item.configPage && item.configPageTitle
      ? item.configPageTitle
      : (localized(item.meta && item.meta.title) || shortName(item.moduleName));
    var description = localized(item.meta && item.meta.description);
    var running = item.enabled === true;
    var readOnly = typeof item.readOnlyReason === 'string' && item.readOnlyReason !== '';
    var toggle = switchHtml(running, ' data-toggle-entry="' + esc(item.entryId) + '"', readOnly, '启停 ' + title);
    var html = '<div class="dm-detail-hero">' + configArtIcon(item.configPage, item.meta && item.meta.icon, title, 'lg') +
      '<div class="dm-detail-head"><div class="dm-card-titleRow"><span class="dm-detail-title">' + esc(title) + '</span>' +
      '<span class="dm-badge ' + (running ? 'dm-badge-on' : 'dm-badge-off') + '">' + (running ? '运行中' : '已停用') + '</span></div>' +
      '<div class="dm-card-sub">' + esc(item.moduleName) + '</div></div>' +
      '<div class="dm-card-side">' + toggle + '</div></div>';
    if (description) html += '<p class="dm-detail-desc">' + esc(description) + '</p>';
    if (item.configPage) {
      // 有真实配置页：详情里也给一个入口按钮（点行同样直达）。
      html += '<button class="dm-detail-primary" type="button" data-dm-cfg-open="' + esc(item.configPage) + '">打开配置</button>' +
        '<div class="dm-detail-note">字段与桌面端同名页面一致：值读宿主 settings，保存写 profile 的 cordis.patch.yml 并走正常 Loader 应用。</div>';
    } else {
      html += '<div class="dm-detail-note">这是内置插件的桌面端配置入口。手机端只读展示，配置请在桌面端修改。</div>';
    }
    html += '<section class="dm-section"><div class="dm-section-head"><span class="dm-section-title">来源信息</span></div>' +
      '<dl class="dm-detail-dl"><dt>entry id</dt><dd>' + esc(item.entryId) + '</dd><dt>包名</dt><dd>' + esc(item.moduleName) + '</dd><dt>运行状态</dt><dd>' + esc(running ? '运行中' : '已停用') + '</dd>' +
      (readOnly ? '<dt>只读原因</dt><dd>' + esc(item.readOnlyReason) + '</dd>' : '') + '</dl></section>';
    body.innerHTML = html;
  }

  function renderBundleDetail(body, bundle, experimental) {
    var title = localized(bundle.meta && bundle.meta.title) || shortName(bundle.name);
    var description = bundle.description || localized(bundle.meta && bundle.meta.description);
    var protectedMobile = bundle.name === 'dsh-mobile';
    var rows = Array.isArray(bundle.rows) ? bundle.rows : [];
    var runningRows = rows.filter(function (row) { return row.enabled === true; }).length;
    var badges = '';
    if (bundle.version) badges += '<span class="dm-badge dm-badge-version">v' + esc(bundle.version) + '</span>';
    if (experimental || bundle.official) badges += '<span class="dm-badge dm-badge-beta">实验性</span>';
    var toggle = switchHtml(bundle.enabled, ' data-toggle-bundle="' + esc(bundle.name) + '"', protectedMobile, '启停 ' + title);
    var html = '<div class="dm-detail-hero">' + iconHtml(bundle.meta && bundle.meta.icon, title, 'lg') +
      '<div class="dm-detail-head"><div class="dm-card-titleRow"><span class="dm-detail-title">' + esc(title) + '</span>' + badges + '</div>' +
      '<div class="dm-card-sub">' + esc(bundle.name) + '</div></div>' +
      '<div class="dm-card-side">' + toggle + '</div></div>';
    if (protectedMobile) html += '<div class="dm-detail-note">手机端插件：这里不能关闭，请在桌面端停用。</div>';
    // 可卸载的包：只做占位。removeBundle 不可逆（且 dsh-mobile 自己也被管理），
    // 本期不实现卸载，点击/悬浮都提示去桌面端。
    if (bundle.removable && bundle.installed) {
      html += '<div class="dm-detail-actions"><button class="dm-danger-btn" type="button" data-dm-uninstall="' + esc(bundle.name) + '" title="请在桌面端卸载" aria-disabled="true">卸载</button><span class="dm-detail-actions-note">卸载是不可逆操作，请在桌面端进行</span></div>';
    }
    if (description) html += '<p class="dm-detail-desc">' + esc(description) + '</p>';
    if (rows.length > 0) {
      html += '<section class="dm-section"><div class="dm-section-head"><span class="dm-section-title">包含的组件</span><span class="dm-section-count">共 ' + rows.length + ' 个 · ' + runningRows + ' 运行中</span></div>' +
        rows.map(function (row) { return componentRowHtml(row); }).join('') + '</section>';
    }
    var sourceLabel = bundle.source
      ? bundle.source
      : (bundle.availability === 'installation' ? '内置（DSH 安装包）' : bundle.availability === 'profile' ? 'profile 包' : String(bundle.availability || '未知'));
    html += '<section class="dm-section"><div class="dm-section-head"><span class="dm-section-title">来源信息</span></div>' +
      '<dl class="dm-detail-dl"><dt>代码来源</dt><dd>' + esc(sourceLabel) + '</dd><dt>当前版本</dt><dd>' + esc(bundle.version ? 'v' + bundle.version : '未知') + '</dd></dl></section>';
    body.innerHTML = html;
  }

  function componentRowHtml(row) {
    var title = localized(row.meta && row.meta.title) || shortName(row.moduleName);
    var description = localized(row.meta && row.meta.description);
    var stateText = row.enabled ? '运行中' : (row.hasLiveEntry ? '已停用' : '未加载');
    var attrs = row.hasLiveEntry && row.entryId ? ' data-toggle-entry="' + esc(row.entryId) + '"' : '';
    var toggle = row.hasLiveEntry && row.entryId
      ? switchHtml(row.enabled, attrs, false, '启停 ' + title)
      : '<span class="dm-badge dm-badge-off">未加载</span>';
    return '<div class="dm-card dm-card-component">' + iconHtml(row.meta && row.meta.icon, title) +
      '<div class="dm-card-main"><div class="dm-card-titleRow"><span class="dm-card-title">' + esc(title) + '</span>' +
      '<span class="dm-dot ' + (row.enabled ? 'is-on' : 'is-off') + '"></span><span class="dm-dot-text">' + esc(stateText) + '</span></div>' +
      (description ? '<div class="dm-card-desc">' + esc(description) + '</div>' : '') +
      '<div class="dm-card-sub">' + esc((row.entryId || row.rowId) + ' · ' + row.moduleName) + '</div></div>' +
      '<div class="dm-card-side">' + toggle + '</div></div>';
  }

  // ── 自动化：列表 / Tab / 搜索 ───────────────────────────────────────────
  function triggerText(record) {
    var kind = String(record.kind || '');
    if (kind === 'at') return '一次性';
    if (kind === 'after') return '一次性 · 延时 ' + (duration(record.afterSeconds) || '') + '后';
    if (kind === 'every') return '每 ' + duration(record.everySeconds);
    if (kind === 'daily') return '每天 ' + String(record.time || '') + (record.timeZone ? ' · ' + record.timeZone : '');
    if (kind === 'weekly') {
      var days = [];
      if (Array.isArray(record.weekdays)) for (var i = 0; i < record.weekdays.length; i++) days.push(WEEK[Number(record.weekdays[i]) - 1] || ('第' + record.weekdays[i] + '天'));
      return '每周 ' + days.join('、') + ' ' + String(record.time || '') + (record.timeZone ? ' · ' + record.timeZone : '');
    }
    if (kind === 'cron') return 'cron ' + String(record.expression || '') + (record.timeZone ? ' · ' + record.timeZone : '');
    return kind ? ('未知触发（' + kind + '）') : '未知触发';
  }

  function automationRows() {
    var value = autoValue || {};
    var items = Array.isArray(value.items) ? value.items : [];
    var query = autoQuery.trim().toLowerCase();
    return items.filter(function (item) {
      if (autoTab === 'active' && item.status !== 'active') return false;
      if (autoTab === 'inactive' && item.status !== 'inactive') return false;
      if (query === '') return true;
      var haystack = (String(item.title || '') + '\\n' + String(item.prompt || '')).toLowerCase();
      return haystack.indexOf(query) >= 0;
    });
  }

  function renderAutomations() {
    var body = pageBody('automations');
    if (!body) return;
    var value = autoValue || {};
    var counts = value.counts || {};
    var visible = automationRows();
    body.setAttribute('data-dm-count', String(visible.length));
    body.setAttribute('data-dm-total', String(Array.isArray(value.items) ? value.items.length : 0));
    var tabs = document.querySelectorAll('[data-dm-tab]');
    for (var i = 0; i < tabs.length; i++) {
      var selected = tabs[i].getAttribute('data-dm-tab') === autoTab;
      tabs[i].classList.toggle('is-active', selected);
      tabs[i].setAttribute('aria-selected', selected ? 'true' : 'false');
    }
    var list = document.querySelector('[data-dm-auto-list]');
    if (!list) return;
    if (visible.length === 0) {
      list.innerHTML = '<div class="dm-page-state dm-page-empty dm-auto-empty">' +
        '<div class="dm-empty-clock" aria-hidden="true">' + ICON_CLOCK.replace('width="20" height="20"', 'width="34" height="34"') + '</div>' +
        '<p class="dm-page-stateTitle">还没有自动化任务，在会话中创建的任务会显示在这里</p>' +
        '<button class="dm-page-retry" type="button" data-dm-new="1">新建自动化任务</button></div>';
      return;
    }
    var html = '<div class="dm-auto-summary">共 ' + visible.length + ' 条' + (autoTab === 'active' ? '进行中' : autoTab === 'inactive' ? '已结束' : '') +
      (typeof counts.total === 'number' ? ' · 宿主共 ' + counts.total + ' 条' : '') + '</div>';
    for (var j = 0; j < visible.length; j++) {
      var item = visible[j];
      var title = String(item.title || '').trim() || String(item.prompt || '').trim().slice(0, 40) || '(未命名任务)';
      var when = fmtWhen(item.scheduledAt);
      var meta = [triggerText(item)];
      if (when) meta.push(item.status === 'active' ? '下次运行 ' + when : '原定 ' + when);
      if (item.lastDelivery && item.lastDelivery.deliveredAt) meta.push('上次投递 ' + fmtWhen(item.lastDelivery.deliveredAt));
      html += '<div class="dm-auto-row" data-dm-row="automation">' +
        '<span class="dm-auto-icon" aria-hidden="true">' + ICON_CLOCK + '</span>' +
        '<div class="dm-auto-main"><div class="dm-auto-title">' + esc(title) + '</div>' +
        '<div class="dm-auto-meta">' + esc(meta.join(' · ')) + '</div>' +
        (item.prompt && item.prompt !== title ? '<div class="dm-auto-prompt">' + esc(item.prompt) + '</div>' : '') +
        '</div>' +
        '<span class="dm-badge ' + (item.status === 'active' ? 'dm-badge-on' : 'dm-badge-off') + '">' + (item.status === 'active' ? '已开启' : '已结束') + '</span>' +
        '</div>';
    }
    list.innerHTML = html;
  }

  // ── 事件：入口 / 返回 / 刷新 / 重试 / Tab / 搜索 / 开关 ──────────────────
  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || !target.closest) return;
    var opener = target.closest('#dm-plugins-btn, #dm-automation-btn');
    if (opener) {
      event.preventDefault();
      openPage(opener.id === 'dm-plugins-btn' ? 'plugins' : 'automations');
      return;
    }
    var back = target.closest('[data-dm-back]');
    if (back) {
      event.preventDefault();
      var which = back.getAttribute('data-dm-back');
      if (which === 'detail') closeDetail(false);
      else closePage(false);
      return;
    }
    var refresh = target.closest('[data-dm-refresh]');
    if (refresh) {
      event.preventDefault();
      if (refresh.getAttribute('data-dm-refresh') === 'plugins') { pluginsValue = null; }
      loadPage(refresh.getAttribute('data-dm-refresh'));
      return;
    }
    var retry = target.closest('[data-dm-retry]');
    if (retry) {
      event.preventDefault();
      var kind = retry.getAttribute('data-dm-retry');
      if (kind === 'plugins') pluginsValue = null; else autoValue = null;
      loadPage(kind);
      return;
    }
    if (target.closest('[data-dm-uninstall]')) {
      event.preventDefault();
      toast('请在桌面端卸载');
      return;
    }
    if (target.closest('[data-dm-new]')) {
      event.preventDefault();
      toast('请在桌面端或会话中创建自动化任务');
      return;
    }
    var tab = target.closest('[data-dm-tab]');
    if (tab) {
      event.preventDefault();
      autoTab = tab.getAttribute('data-dm-tab');
      renderAutomations();
      return;
    }
    var toggleBundle = target.closest('[data-toggle-bundle]');
    if (toggleBundle) {
      event.preventDefault();
      event.stopPropagation();
      toggleBundleState(toggleBundle, toggleBundle.getAttribute('data-toggle-bundle'));
      return;
    }
    var toggleEntry = target.closest('[data-toggle-entry]');
    if (toggleEntry) {
      event.preventDefault();
      event.stopPropagation();
      toggleEntryState(toggleEntry, toggleEntry.getAttribute('data-toggle-entry'));
      return;
    }
    var openBundle = target.closest('[data-open-bundle]');
    if (openBundle) {
      event.preventDefault();
      openDetail(openBundle.getAttribute('data-open-bundle'));
      return;
    }
    var openEntry = target.closest('[data-open-entry]');
    if (openEntry) {
      event.preventDefault();
      openDetail('entry:' + openEntry.getAttribute('data-open-entry'));
    }
  });

  document.addEventListener('input', function (event) {
    var target = event.target;
    if (!target || !target.getAttribute) return;
    if (target.getAttribute('data-dm-search') === '1') {
      autoQuery = target.value || '';
      renderAutomations();
    }
  });

  // 开关：乐观更新 → 真正调宿主 → 失败回滚并提示；成功静默刷新缓存。
  function setSwitch(button, checked) {
    button.setAttribute('aria-checked', checked ? 'true' : 'false');
  }
  /** 从最近一次 mobile.plugins 结果里读某个 bundle 的真实 enabled。 */
  function bundleEnabledNow(name) {
    var groups = (pluginsValue && pluginsValue.groups) || {};
    var lists = ['basic', 'extensions', 'installed'];
    for (var i = 0; i < lists.length; i++) {
      var list = groups[lists[i]] || [];
      for (var j = 0; j < list.length; j++) if (list[j].name === name) return list[j].enabled === true;
    }
    return null;
  }
  function entryEnabledNow(entryId) {
    var groups = (pluginsValue && pluginsValue.groups) || {};
    var basic = groups.basic || [];
    for (var i = 0; i < basic.length; i++) if (basic[i].entryId === entryId) return basic[i].enabled === true;
    var lists = ['extensions', 'installed'];
    for (var k = 0; k < lists.length; k++) {
      var rows = (groups[lists[k]] || []).reduce(function (all, bundle) { return all.concat(bundle.rows || []); }, []);
      for (var r = 0; r < rows.length; r++) if (rows[r].entryId === entryId) return rows[r].enabled === true;
    }
    return null;
  }
  /** 连接断开后的对账：重取插件数据，若已达成目标就刷新视图，否则回滚。 */
  function reconcileToggle(button, before, next, kind, key) {
    var attempts = 0;
    var done = false;
    function retry() {
      attempts++;
      rpc('mobile.plugins').then(function (result) {
        if (done) return;
        if (!result || result.ok !== true) throw new Error('rpc');
        pluginsValue = result.value || {};
        var actual = kind === 'bundle' ? bundleEnabledNow(key) : entryEnabledNow(key);
        if (actual === next) {
          done = true;
          if (current && current.kind === 'plugins') renderPlugins();
          if (detailName !== null) {
            var found = detailOf(detailName);
            if (found) renderDetail(found);
          }
          toast('已保存并生效');
          return;
        }
        if (attempts < 5) { setTimeout(retry, 1200); return; }
        done = true;
        setSwitch(button, before);
        toast('启停失败：宿主状态未变化');
      }).catch(function () {
        if (done) return;
        if (attempts < 5) { setTimeout(retry, 1200); return; }
        done = true;
        setSwitch(button, before);
        toast('启停失败：连接中断');
      });
    }
    setTimeout(retry, 900);
  }

  function toggleBundleState(button, name) {
    if (button.disabled) return;
    var before = button.getAttribute('aria-checked') === 'true';
    var next = !before;
    setSwitch(button, next);
    button.disabled = true;
    rpc('mobile.pluginBundleEnabled', { name: name, enabled: next }).then(function (result) {
      if (!result || result.ok !== true) throw result && result.error ? result.error : new Error('宿主没有返回结果');
      var application = result.value && result.value.application;
      if (application === 'restart-required') toast('已保存，重启 DSH 后生效');
      else if (application === 'overridden') toast('已保存，但被更高优先级配置覆盖');
      refreshPluginsSilently();
    }).catch(function () {
      // 启停会触发 HMR：宿主 reconcile 期间本插件的 HTTP server 可能被重建，
      // 于是这次请求的连接会断（fetch 报 network error），但宿主其实已经生效。
      // 所以失败后不立刻回滚，而是重取真实状态：与目标一致就算成功。
      reconcileToggle(button, before, next, 'bundle', name);
    }).then(function () { button.disabled = false; });
  }
  function toggleEntryState(button, entryId) {
    if (button.disabled) return;
    var before = button.getAttribute('aria-checked') === 'true';
    var next = !before;
    setSwitch(button, next);
    button.disabled = true;
    rpc('mobile.pluginEntryEnabled', { entryId: entryId, enabled: next }).then(function (result) {
      if (!result || result.ok !== true) throw result && result.error ? result.error : new Error('宿主没有返回结果');
      var application = result.value && result.value.application;
      if (application === 'restart-required') toast('已保存，重启 DSH 后生效');
      refreshPluginsSilently();
    }).catch(function () {
      reconcileToggle(button, before, next, 'entry', entryId);
    }).then(function () { button.disabled = false; });
  }

  // 静默重取：不闪 loading，只更新缓存并按当前视图重渲染（保留详情页）。
  function refreshPluginsSilently() {
    rpc('mobile.plugins').then(function (result) {
      if (!result || result.ok !== true) return;
      pluginsValue = result.value || {};
      if (current && current.kind === 'plugins') renderPlugins();
      if (detailName !== null) {
        var found = detailOf(detailName);
        if (found) renderDetail(found);
      }
    }).catch(function () {});
  }

  // 刷新后如果地址栏还残留 #/dm-*，先清掉，避免和 SPA 的空白 hash 状态混淆。
  if (location.hash.indexOf('#/dm-') === 0) {
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
  }

  // 工作区 ⇄ 会话切换时 header 会重渲染：MutationObserver + 1s 兜底轮询双保险。
  try {
    var mo = new MutationObserver(queueSync);
    mo.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
  setInterval(function () { try { syncHeader(); } catch (e) {} }, 1000);
  queueSync();
})();
</script>`
