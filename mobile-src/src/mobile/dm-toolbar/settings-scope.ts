/**
 * 迁移 B：1:1 搬自宿主 index.js 的 `SETTINGS_SCOPE_HTML` 注入字符串。
 * 设置页每个选项的范围徽标（本机/同步桌面/桌面端）。
 *
 * 只搬位置、不改写：内容仍是原来的 HTML + 内联脚本，由
 * `dm-toolbar/index.ts` 在 bundle 启动时按原顺序安装到 document。
 */
// ── 设置页：范围标签（本机 / 同步桌面 / 桌面端）+ 用量行 + 两处清理 ────────
// 1) 每个设置行标题后补一个范围徽标，复用 bundle 自己的 .settings-badge-*
//    （与顶部 .settings-legend 完全同色同规格）；bundle 的「只读」红徽标
//    （settings-badge-ro）原地改成「桌面端」灰徽标，sync 保留不叠加。
//    「本机」= 只写 localStorage / 只影响手机；「同步桌面」= 写宿主并影响桌面；
//    「桌面端」= 手机只读。逐项判定依据见交付报告（每项都核实过读写落点）。
// 2) 「用量」不再单独成组、不再自动展开成余额卡：改成一行的入口（放在
//    「主机配置」组里，与「模型」并列），右侧显示当前余额，点开是我们自绘的
//    用量详情页（dm-page 壳 + 刷新），数据仍来自宿主 RPC mobile.usage。
// 3) 「关于」页清空项目介绍（保留版本号、检查更新、依赖自检）；
//    「反馈与建议」不再指向别人的仓库：地址改由插件 config.githubUrl 提供，
//    未配置时只 toast「GitHub 地址待填写」，点击不会打开任何链接。
export const SETTINGS_SCOPE_HTML = `<script>
(function () {
  try {
    if (window.__dmSettingsScope) return;
    window.__dmSettingsScope = true;

    // ── 设置项范围标签（本机 / 同步桌面 / 桌面端）──────────────────────────
    // 判定依据见报告：按「值存在哪、桌面端会不会跟着变、手机能不能改」三项核实，
    // 逐行写死映射（标题即稳定锚点；bundle 的标题是硬编码中文）。
    //   phone   → localStorage / 仅手机行为
    //   sync    → 写宿主（profile config / settings namespace / 宿主 JSON）且桌面端共享
    //   desktop → 手机只读，只能去桌面端看/改
    var SCOPE_OF = {
      // 外观（全部 localStorage）
      '主题': 'phone',
      '字体大小': 'phone',
      '消息密度': 'phone',
      '代码块行号': 'phone',
      // 对话：自动滚动/震动 localStorage；发送模式写宿主 JSON 但只被手机发消息读取
      '自动滚动': 'phone',
      '震动': 'phone',
      '发送模式': 'phone',
      // 用量：RPC mobile.usage 只读（宿主查余额，没有写入口）
      '用量': 'desktop',
      // 通知子页走 push.config → 宿主 ~/.dsh/dsh-mobile-push.json
      '通知': 'sync',
      // 设备：宿主 devices JSON，配对域，桌面无对应设置
      '设备管理': 'phone',
      // 主机配置（写 profile cordis.patch.yml → 桌面共享）
      '通用': 'sync',
      '模型': 'sync',
      '搜索': 'desktop',
      '记忆': 'desktop',
      '工具': 'sync',
      '系统': 'desktop',
      // 通用
      '清除缓存': 'phone',
      '反馈与建议': 'phone',
      '关于': 'desktop'
    };
    var LABEL = { phone: '本机', sync: '同步桌面', desktop: '桌面端' };
    var SCOPE_CLASS = 'settings-badge settings-badge-';

    function rowTitle(row) {
      var t = row.querySelector('.card-title > .card-titleText');
      if (!t) t = row.querySelector('.card-titleText');
      return t ? (t.textContent || '').replace(/\s+/g, ' ').trim() : '';
    }

    function makeBadge(scope) {
      var s = document.createElement('span');
      s.className = SCOPE_CLASS + scope;
      s.setAttribute('data-dm-scope', scope);
      s.textContent = LABEL[scope];
      return s;
    }

    // bundle 自带的「只读」红徽标（settings-badge-ro）原地改成「桌面端」灰徽标：
    // 只改同一个 DOM 节点的 class/文本，不 replaceChild —— React 手里握着该节点引用，
    // 换节点会让它在卸载时 removeChild 一个已不存在的子节点而报错。
    function normalizeRo(node) {
      if (!node || !node.classList) return false;
      if (!node.classList.contains('settings-badge-ro')) return false;
      node.className = SCOPE_CLASS + 'desktop';
      node.textContent = LABEL.desktop;
      node.setAttribute('data-dm-scope', 'desktop');
      return true;
    }

    function applyRow(row) {
      var title = rowTitle(row);
      var scope = SCOPE_OF[title];
      if (!scope) return false;
      var box = row.querySelector('.card-title');
      if (!box) return false;

      // 先归一化 bundle 的只读徽标（主机配置里「搜索/系统」这类整行只读）
      var ro = box.querySelector('.settings-badge-ro');
      if (ro) normalizeRo(ro);

      // 清理可能重复的「我们加的」徽标（React 重挂后可能留下孤儿）
      var ours = box.querySelectorAll('[data-dm-scope]');
      if (ours.length > 1) {
        for (var i = 1; i < ours.length; i++) {
          if (ours[i].parentNode) ours[i].parentNode.removeChild(ours[i]);
        }
      }
      if (ours.length > 0) {
        var mine = box.querySelector('[data-dm-scope]');
        if (mine.getAttribute('data-dm-scope') !== scope) {
          // 映射改了（例如 bundle 自己变成 desktop）时以映射为准，保持同一节点
          mine.className = SCOPE_CLASS + scope;
          mine.setAttribute('data-dm-scope', scope);
          mine.textContent = LABEL[scope];
        }
        return true;
      }

      // bundle 已经渲染了范围徽标（sync）就不再叠加 —— 文字与三档语义一致
      if (box.querySelector('.settings-badge-sync, .settings-badge-phone, .settings-badge-desktop')) return true;

      box.appendChild(makeBadge(scope));
      return true;
    }

    // 用量在进入设置时会被注入脚本自动展开成 li.usage-card（没有行），标在卡片头。
    function applyUsageCard() {
      var card = document.querySelector('li.usage-card');
      if (!card) return;
      var head = card.querySelector('.usage-providerHead') || card;
      if (head.querySelector('[data-dm-scope]')) return;
      var name = head.querySelector('.usage-providerName');
      var badge = makeBadge('desktop');
      if (name && name.parentNode === head && name.nextSibling) head.insertBefore(badge, name.nextSibling);
      else head.appendChild(badge);
    }

    // ── 「关于」页：清空项目介绍，只保留版本号 ─────────────────────────────
    // bundle 里那段是：「掌上 DSH（dsh-palm）· 版本 X」 + <br> + 「DSH 移动端界面：…」。
    // 用户要求清空项目介绍、保留版本号与「检查更新 / 依赖自检」。
    // 做法：整段 <p> 隐藏（不动 React 管理的文本节点，避免卸载时 removeChild 报错），
    // 在它前面插一行只含版本号的 <p class="sheet-confirm-desc">。
    function cleanAbout() {
      var sheets = document.querySelectorAll('.sheet[aria-label="关于"]');
      for (var i = 0; i < sheets.length; i++) {
        var body = sheets[i].querySelector('.sheet-body');
        if (!body) continue;
        // 已经插过版本行就跳过（否则会在自己的节点上反复处理，越插越多）
        if (body.querySelector('[data-dm-about-line]')) continue;
        var candidates = body.querySelectorAll('.sheet-confirm-desc');
        for (var j = 0; j < candidates.length; j++) {
          var p = candidates[j];
          if (p.hasAttribute('data-dm-about') || p.hasAttribute('data-dm-about-line')) continue;
          if ((p.textContent || '').indexOf('掌上 DSH') < 0) continue;
          var version = '';
          for (var n = p.firstChild; n; n = n.nextSibling) {
            if (n.nodeName === 'BR') break;
            version += n.textContent || '';
          }
          version = version.replace(/\s+$/, '');
          p.setAttribute('data-dm-about', '1');
          p.style.display = 'none';
          var line = document.createElement('p');
          line.className = 'sheet-confirm-desc dm-about-line';
          line.setAttribute('data-dm-about-line', '1');
          line.textContent = version;
          body.insertBefore(line, p);
          break;
        }
      }
    }

    // ── 「反馈与建议」：清空指向别人仓库的那句，地址改由插件 config.githubUrl 提供 ──
    // 未配置时 desc 清空、点击只弹 toast，绝不打开 dsh-palm 的仓库。
    var githubUrl = '';
    var prefsAsked = false;

    function toast(text) {
      try {
        var host = document.getElementById('dm-scope-toast');
        if (!host || !host.parentNode) {
          host = document.createElement('div');
          host.id = 'dm-scope-toast';
          host.className = 'toast-host';
          document.body.appendChild(host);
        }
        var item = document.createElement('div');
        item.className = 'toast';
        item.textContent = text;
        host.appendChild(item);
        window.setTimeout(function () {
          item.className = 'toast toast-out';
          window.setTimeout(function () {
            if (item.parentNode) item.parentNode.removeChild(item);
          }, 240);
        }, 2000);
      } catch (e) {}
    }

    function feedbackRow() {
      var rows = document.querySelectorAll('.settings-row');
      for (var i = 0; i < rows.length; i++) {
        var t = rows[i].querySelector('.card-titleText');
        if (t && (t.textContent || '').replace(/\s+/g, ' ').trim() === '反馈与建议') return rows[i];
      }
      return null;
    }

    function feedbackText() {
      return githubUrl === '' ? '' : '在 GitHub 反馈问题';
    }

    function paintFeedback() {
      var row = feedbackRow();
      if (!row) return;
      row.setAttribute('data-dm-feedback', githubUrl === '' ? 'pending' : 'ok');
      var desc = row.querySelector('.card-desc');
      if (!desc) return;
      var text = feedbackText();
      var first = desc.firstChild;
      // 只改文本节点的数据，不增删节点：React 手里握着的还是同一个 text node，卸载安全。
      if (first && first.nodeType === 3) {
        if (first.nodeValue !== text) first.nodeValue = text;
      } else if (desc.textContent !== text) {
        desc.textContent = text;
      }
      desc.style.display = text === '' ? 'none' : '';
    }

    function loadGithubUrl() {
      if (prefsAsked) return;
      prefsAsked = true;
      fetch('/m/api/mobile.preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rpcId: 'dm-scope-' + Date.now(), payload: {} })
      }).then(function (r) { return r.json(); }).then(function (j) {
        var v = j && j.result && j.result.ok ? j.result.value : null;
        if (v && typeof v.githubUrl === 'string') githubUrl = v.githubUrl.trim();
        paintFeedback();
      }).catch(function () {
        prefsAsked = false;
      });
    }

    // 捕获阶段拦截点击：bundle 的 onClick 会把 window.open 指向 dsh-palm 仓库，
    // 这里先拦下，未配置地址就只 toast；配置了才打开用户自己的地址。
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      // 被隐藏的独立「用量」分组里那行折叠行，会被 USAGE_INLINE_HTML 自动点击展开，
      // 展开后它还会每 5 秒点一次「刷新」去拉余额；这里把隐藏组内的点击拦掉。
      var hiddenGroup = t.closest('ul.settings-group');
      if (hiddenGroup && hiddenGroup.style.display === 'none') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      var row = t.closest('.settings-row');
      if (!row) return;
      var title = row.querySelector('.card-titleText');
      if (!title || (title.textContent || '').replace(/\s+/g, ' ').trim() !== '反馈与建议') return;
      e.preventDefault();
      e.stopPropagation();
      if (githubUrl === '') {
        toast('GitHub 地址待填写');
        return;
      }
      try {
        window.open(githubUrl, '_blank', 'noopener');
      } catch (err) {}
    }, true);

    // ── 用量：并进「主机配置」分组，点击进入独立详情页 ───────────────────────
    // 用户要求：不再单独成组、不再自动展开成余额卡；改成和「模型」并列的一行，
    // 右侧显示当前余额，点开是详情页（dm-page 壳，带刷新）。
    var USAGE_ICON = '<span class="card-icon"><span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="6.5" width="17" height="12" rx="3"/><path d="M3.5 10.6h17"/><path d="M15.7 14.3h1.6"/></svg></span></span>';
    var usageBusy = false;
    var usageView = null;
    var usageFetchedAt = 0;

    function esc(s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }
    function pad2(n) { return (n < 10 ? '0' : '') + n; }
    function fmtTime(ms) {
      var d = new Date(ms);
      if (isNaN(d.getTime())) return '';
      return (d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
    }

    function groupByTitle(prefix) {
      var uls = document.querySelectorAll('ul.settings-group');
      for (var i = 0; i < uls.length; i++) {
        var h = uls[i].querySelector('.settings-groupTitle');
        if (h && (h.textContent || '').replace(/\s+/g, ' ').trim().indexOf(prefix) === 0) return uls[i];
      }
      return null;
    }

    function ensureUsageRow() {
      var host = groupByTitle('主机配置');
      if (!host) return;
      // 独立的「用量 套餐与配额」分组（含组头）隐藏掉，合并进主机配置
      var standalone = groupByTitle('用量');
      if (standalone && standalone !== host) standalone.style.display = 'none';

      var row = document.getElementById('dm-usage-row');
      if (!row) {
        var li = document.createElement('li');
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'mobile-row';
        btn.id = 'dm-usage-row';
        // 「主机配置」组里只保留「模型」的过滤脚本（mobile-src/src/mobile/dm-pages/models-center.ts）按这个标记放行，
        // 否则它每秒一次的过滤会把本行 display:none 掉。
        btn.setAttribute('data-dm-usage-row', '1');
        btn.innerHTML = USAGE_ICON +
          '<span class="card-main"><span class="card-title"><span class="card-titleText">用量</span></span>' +
          '<span class="card-desc">套餐与配额</span></span>' +
          '<span class="card-action"><span class="settings-rowValue" data-dm-usage-value>—</span>' +
          '<span class="mobile-chevron" aria-hidden="true">›</span></span>';
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          openUsagePage();
        });
        li.appendChild(btn);
        row = li;
      }
      if (row.parentNode !== host) {
        // 排在「模型」行后面（与宿主行同构：li > button.mobile-row）
        var modelLi = null;
        var buttons = host.querySelectorAll('button.mobile-row');
        for (var j = 0; j < buttons.length; j++) {
          var t = buttons[j].querySelector('.card-titleText');
          if (t && (t.textContent || '').trim() === '模型') { modelLi = buttons[j].parentNode; break; }
        }
        if (modelLi && modelLi.parentNode === host) host.insertBefore(row, modelLi.nextSibling);
        else host.appendChild(row);
      }
      loadUsage(false);
    }

    function usageSummary(view) {
      var providers = view && Array.isArray(view.providers) ? view.providers : [];
      for (var i = 0; i < providers.length; i++) {
        if (providers[i] && providers[i].status === 'ok' && typeof providers[i].balance === 'string') return providers[i].balance;
      }
      return providers.length === 0 ? '—' : '暂不可用';
    }

    function loadUsage(refresh) {
      if (usageBusy) return;
      // 防抖：ensure() 会被 MutationObserver + 500ms 兜底反复调用，这里保证
      // 非强制刷新时 30 秒内最多读一次（宿主侧另有 60s 缓存，不会更慢）。
      if (refresh !== true && usageFetchedAt !== 0 && Date.now() - usageFetchedAt < 30000) return;
      usageBusy = true;
      usageFetchedAt = Date.now();
      fetch('/m/api/mobile.usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rpcId: 'dm-usage-' + Date.now(), payload: refresh === true ? { refresh: true } : {} })
      }).then(function (r) { return r.json(); }).then(function (j) {
        usageBusy = false;
        if (!j || !j.result) return;
        if (!j.result.ok) {
          usageView = { error: (j.result.error && j.result.error.message) || '读取失败' };
        } else {
          usageView = j.result.value || {};
        }
        paintUsageRow();
        paintUsagePage();
      }).catch(function () {
        usageBusy = false;
        if (!usageView) usageView = { error: '网络异常，读取失败' };
        paintUsageRow();
        paintUsagePage();
      });
    }

    function paintUsageRow() {
      var el = document.querySelector('[data-dm-usage-value]');
      if (!el) return;
      el.textContent = usageView && usageView.error ? '—' : usageSummary(usageView);
    }

    function usagePage() {
      var page = document.getElementById('dm-page-usage');
      if (page) return page;
      page = document.createElement('section');
      page.id = 'dm-page-usage';
      page.className = 'dm-page dm-page-usage';
      page.setAttribute('hidden', '');
      page.setAttribute('aria-label', '用量');
      page.innerHTML =
        '<header class="dm-page-header">' +
        '<button class="dm-page-iconbtn" type="button" aria-label="返回设置" data-dm-usage-back="1"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>' +
        '<h1 class="dm-page-title">用量</h1>' +
        '<button class="dm-page-iconbtn" type="button" aria-label="刷新用量" data-dm-usage-refresh="1"><svg class="dm-page-refresh-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19.49 8.66A8.2 8.2 0 1 1 11.71 3.80"/><path d="M16.31 3.64L11.64 1.56L11.79 6.05Z" fill="currentColor" stroke="currentColor" stroke-width="0.55" stroke-linejoin="round"/></svg></button>' +
        '</header>' +
        '<div class="dm-page-body" data-dm-usage-body><p class="dm-page-state">加载中…</p></div>';
      document.body.appendChild(page);
      page.querySelector('[data-dm-usage-back]').addEventListener('click', function () {
        page.hidden = true;
      });
      page.querySelector('[data-dm-usage-refresh]').addEventListener('click', function () {
        var icon = page.querySelector('[data-dm-usage-refresh]');
        if (icon) icon.classList.add('dm-spinning');
        loadUsage(true);
        window.setTimeout(function () {
          if (icon) icon.classList.remove('dm-spinning');
        }, 900);
      });
      return page;
    }

    function paintUsagePage() {
      var page = document.getElementById('dm-page-usage');
      if (!page) return;
      var body = page.querySelector('[data-dm-usage-body]');
      if (!body) return;
      if (!usageView) {
        body.innerHTML = '<p class="dm-page-state">加载中…</p>';
        return;
      }
      if (usageView.error) {
        body.innerHTML = '<p class="dm-page-state">' + esc(usageView.error) + '</p>';
        return;
      }
      var providers = Array.isArray(usageView.providers) ? usageView.providers : [];
      if (providers.length === 0) {
        body.innerHTML = '<p class="dm-page-state">宿主没有返回任何用量提供方</p>';
        return;
      }
      var html = '<p class="dm-page-summary"><span>数据来自宿主 · 只读</span><span></span></p>';
      for (var i = 0; i < providers.length; i++) {
        var p = providers[i] || {};
        var state = p.status === 'ok' ? '可用' : (p.status === 'no-key' ? '未配置密钥' : '读取失败');
        html += '<div class="dm-page-row">' +
          '<div class="dm-page-rowTop"><span class="dm-page-rowName">' + esc(p.name || '用量') + '</span>' +
          '<span class="dm-page-badge">' + esc(p.kind === 'balance' ? '余额' : state) + '</span></div>' +
          (p.baseURL ? '<div class="dm-page-rowSub">' + esc(p.baseURL) + '</div>' : '') +
          '<div class="dm-page-rowMeta">' + esc(p.status === 'ok' && p.balance ? p.balance : state) + '</div>' +
          '</div>';
      }
      if (usageView.fetchedAt !== undefined) {
        html += '<p class="dm-page-summary"><span>更新时间 ' + esc(fmtTime(usageView.fetchedAt)) + '</span><span></span></p>';
      }
      body.innerHTML = html;
    }

    function openUsagePage() {
      var page = usagePage();
      page.hidden = false;
      paintUsagePage();
      if (!usageView || usageView.error) loadUsage(false);
    }

    function ensure() {
      // 只在设置页生效：.settings-legend 是 bundle 渲染图例的容器。
      if (!document.querySelector('.settings-legend')) {
        var pg = document.getElementById('dm-page-usage');
        if (pg && !pg.hidden) pg.hidden = true;
        return;
      }
      var rows = document.querySelectorAll('.settings-row, .mobile-row');
      for (var i = 0; i < rows.length; i++) applyRow(rows[i]);
      applyUsageCard();
      cleanAbout();
      loadGithubUrl();
      paintFeedback();
      ensureUsageRow();
    }

    var queued = false;
    function schedule() {
      if (queued) return;
      queued = true;
      window.setTimeout(function () { queued = false; ensure(); }, 60);
    }
    try {
      if (window.__dmMutationBus) window.__dmMutationBus.subscribe(schedule);
      else {
        var mo = new MutationObserver(schedule);
        mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
      }
    } catch (e) {}
    setInterval(ensure, 500);
    ensure();
  } catch (e) {}
})();
</script>`
