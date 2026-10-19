/**
 * 迁移 A：1:1 搬自宿主 index.js 的 `MODELS_CENTER_HTML` 注入字符串。
 * 设置 → 主机配置 →「模型」：隐藏其它行 + 自绘模型中心页。
 *
 * 只搬位置、不改写：内容仍是当年的 HTML + 内联脚本，由
 * `dm-pages/index.ts` 在 bundle 启动时按原顺序安装到 document。
 */
// ── 设置 → 主机配置 → 模型：只保留「模型」行 + 自绘模型页 ──────────────────
// 隐藏只在「主机配置」组内按行标题精确匹配（不改 settings.read：bundle 的
// ui-theme/分组详情页共用同一份 namespaces）；点「模型」行由本脚本接管，
// 打开下面这个页面。数据全部来自宿主 RPC mobile.modelsCenter.get。
export const MODELS_CENTER_HTML = `<script>
(function () {
  'use strict';

  // 页面进出场统一走 bundle 的 page-motion（window.__dmPageMotion）：进入滑入淡入、
  // 返回滑出淡出；入口没装好时退回瞬时开关。
  function showPage(el) {
    var m = window.__dmPageMotion;
    if (m) { m.show(el); return; }
    el.hidden = false;
  }
  function hidePage(el) {
    var m = window.__dmPageMotion;
    if (m) { m.hide(el); return; }
    el.hidden = true;
  }

  // ── 设置页「主机配置」：只保留「模型」一行 ────────────────────────────────
  //
  // 不改 settings.read：bundle 的 ui-theme（主题偏好）与分组详情页共用那份
  // namespaces，按组过滤会连带把它们拿掉。这里只在该 settings-group 内按行标题
  // 精确匹配隐藏，MutationObserver 在 React 重渲染后补隐藏，绝不碰其它分组。
  var GROUP_TITLE = '主机配置';
  var KEEP_ROW = '模型';
  var GROUP_DESC = '模型提供方 · 密钥 · 默认模型';
  var hideHits = 0;

  function settingsGroup() {
    var groups = document.querySelectorAll('.settings-group');
    for (var i = 0; i < groups.length; i++) {
      var title = groups[i].querySelector('.settings-groupTitle');
      if (title && String(title.textContent || '').indexOf(GROUP_TITLE) === 0) return groups[i];
    }
    return null;
  }

  function applySettingsFilter() {
    var group = settingsGroup();
    if (!group) return;
    var rows = group.querySelectorAll(':scope > li');
    for (var i = 0; i < rows.length; i++) {
      var li = rows[i];
      var button = li.querySelector('.mobile-row');
      if (!button) continue;
      // 「用量」行由设置页范围标签脚本（SETTINGS_SCOPE_HTML）插到本组、与「模型」并列；
      // 这里必须同样放行，否则每秒一次的过滤会把它 display:none 掉。
      if (button.hasAttribute('data-dm-usage-row')) continue;
      var titleEl = button.querySelector('.card-titleText');
      var title = String(titleEl && titleEl.textContent ? titleEl.textContent : '').trim();
      if (title === KEEP_ROW) {
        if (li.style.display === 'none') li.style.display = '';
        li.setAttribute('data-dm-models-row', '1');
      } else {
        if (li.style.display !== 'none') li.style.display = 'none';
        li.removeAttribute('data-dm-models-row');
      }
    }
    var desc = group.querySelector('.settings-groupDesc');
    if (desc && desc.textContent !== GROUP_DESC) desc.textContent = GROUP_DESC;
    hideHits += 1;
  }

  var filterQueued = false;
  function scheduleSettingsFilter() {
    if (filterQueued) return;
    filterQueued = true;
    window.setTimeout(function () {
      filterQueued = false;
      try { applySettingsFilter(); } catch (e) {}
    }, 60);
  }
  try {
    if (window.__dmMutationBus) window.__dmMutationBus.subscribe(scheduleSettingsFilter); else new MutationObserver(scheduleSettingsFilter).observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
  window.setInterval(function () { try { applySettingsFilter(); } catch (e) {} }, 1000);
  applySettingsFilter();

  // ── 模型页（自绘，数据全部来自宿主）──────────────────────────────────────
  var PAGE = document.getElementById('dm-page-models');
  if (!PAGE) return;
  var BODY = PAGE.querySelector('[data-dm-mc-body]');
  var TITLE = PAGE.querySelector('[data-dm-mc-title]');
  var opened = false;
  var loading = false;
  var data = null;
  var errorText = null;
  var status = null;
  var loadNonce = 0;
  var sheet = null;      // 当前弹出面板（添加/编辑/删除/替换 Key/默认模型）
  var openForm = null;   // 卡片内联表单：{ kind:'edit'|'key', route, error, draft }（同一时间只展开一个）
  var busy = false;

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function rpc(method, payload) {
    return fetch('/m/api/' + method, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rpcId: 'dm-mc-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        payload: payload || {},
      }),
    }).then(function (res) {
      return res.json().catch(function () { return null; });
    }).then(function (json) {
      if (!json || !json.result) throw new Error('宿主没有返回 RPC 结果（连接可能因插件重载中断）');
      return json.result;
    });
  }

  function renderState(text, cls, withRetry) {
    BODY.innerHTML = '<div class="dm-page-state ' + (cls || '') + '">' +
      '<p class="dm-page-stateText">' + esc(text) + '</p>' +
      (withRetry ? '<button class="dm-page-retry" type="button" data-dm-mc-retry="1">重试</button>' : '') +
      '</div>';
  }

  function setStatus(kind, text) {
    status = text ? { kind: kind, text: text } : null;
    var el = BODY.querySelector('[data-dm-mc-status]');
    if (!el) return;
    if (!status) { el.textContent = ''; el.className = 'dm-cfg-status'; return; }
    el.textContent = status.text;
    el.className = 'dm-cfg-status is-' + status.kind;
  }

  function badge(text, tone) {
    return '<span class="dm-cfg-badge' + (tone ? ' ' + tone : '') + '">' + esc(text) + '</span>';
  }

  function sourceLabel(item) {
    if (item.source === 'account') return 'DeepSeek 账号';
    if (item.source === 'deepseek') return 'DeepSeek 官方 API';
    if (item.source === 'profile') return '已配置';
    if (item.source === 'registered') return '已注册';
    return '目录可选';
  }

  function providerOf(route) {
    if (!data || !Array.isArray(data.providers)) return null;
    for (var i = 0; i < data.providers.length; i++) if (data.providers[i].provider === route) return data.providers[i];
    return null;
  }

  function inlineFieldHtml(label, name, value, opts) {
    var options = opts || {};
    var input;
    if (options.select) {
      input = '<select class="dm-cfg-input" data-dm-mc-inline="' + esc(name) + '">' + options.select.map(function (choice) {
        return '<option value="' + esc(choice.value) + '"' + (String(value) === String(choice.value) ? ' selected' : '') + '>' + esc(choice.label) + '</option>';
      }).join('') + '</select>';
    } else if (options.textarea) {
      input = '<textarea class="dm-cfg-input dm-mc-textarea" rows="' + (options.rows || 5) + '" data-dm-mc-inline="' + esc(name) + '"' +
        (options.placeholder ? ' placeholder="' + esc(options.placeholder) + '"' : '') + '>' + esc(value) + '</textarea>';
    } else {
      input = '<input class="dm-cfg-input" type="' + (options.type || 'text') + '" autocomplete="' + (options.type === 'password' ? 'new-password' : 'off') + '"' +
        ' autocapitalize="off" spellcheck="false" data-dm-mc-inline="' + esc(name) + '" value="' + esc(value) + '"' +
        (options.placeholder ? ' placeholder="' + esc(options.placeholder) + '"' : '') + '>';
    }
    return '<div class="dm-mc-formRow"><label class="dm-cfg-label">' + esc(label) + '</label>' + input +
      (options.hint ? '<p class="dm-cfg-hint">' + esc(options.hint) + '</p>' : '') + '</div>';
  }

  // 卡片内联表单：默认收起，点「编辑 / 替换 API Key」才在卡片里展开（同一时间只开一个）。
  function inlineFormHtml(item) {
    var form = openForm;
    var draft = form.draft || {};
    var html = '<div class="dm-mc-inlineForm" data-dm-mc-inline-box="' + esc(item.provider) + '">';
    if (form.kind === 'key') {
      html += '<p class="dm-cfg-hint">凭据引用 ' + esc(item.apiKeyRef || '') + ' · 只写宿主凭据库，不回显。</p>' +
        inlineFieldHtml('API Key', 'key', '', { type: 'password', placeholder: (item.credential && item.credential.configured) ? '已配置；留空表示保持当前密钥' : '输入 API 密钥' });
    } else {
      var profile = (data.profiles && data.profiles[item.provider] && typeof data.profiles[item.provider] === 'object') ? data.profiles[item.provider] : {};
      html += inlineFieldHtml('显示名称', 'displayName', draft.displayName !== undefined ? draft.displayName : (profile.displayName || item.displayName || ''), { placeholder: '留空使用默认名称' });
      html += inlineFieldHtml('API 协议', 'api', draft.api !== undefined ? draft.api : (profile.api || item.api || 'openai-completions'), {
        select: [
          { value: 'openai-completions', label: 'openai-completions' },
          { value: 'openai-responses', label: 'openai-responses' },
          { value: 'anthropic-messages', label: 'anthropic-messages' },
        ],
      });
      html += inlineFieldHtml('API 地址', 'baseURL', draft.baseURL !== undefined ? draft.baseURL : (profile.baseURL || item.baseURL || ''), { placeholder: 'https://gateway.example/v1' });
      html += inlineFieldHtml('模型（每行一个，可写 id=显示名）', 'models', draft.modelsText !== undefined ? draft.modelsText : modelsTextOf(profile.models || item.models || []), { textarea: true, rows: 5 });
      html += inlineFieldHtml('API Key', 'key', '', { type: 'password', placeholder: (item.credential && item.credential.configured) ? '已配置；留空表示保持当前密钥' : '输入 API 密钥' });
    }
    if (form.error) html += '<p class="dm-cfg-invalid">' + esc(form.error) + '</p>';
    html += '<div class="dm-mc-sheetActions"><button class="dm-cfg-save" type="button" data-dm-mc-inline-save="1"' + (busy ? ' disabled' : '') + '>' + esc(busy ? '保存中…' : '保存') + '</button>' +
      '<button class="dm-mc-btn" type="button" data-dm-mc-inline-cancel="1">取消</button></div></div>';
    return html;
  }

  function readInlineField(name) {
    var box = PAGE.querySelector('[data-dm-mc-inline-box]');
    var el = box ? box.querySelector('[data-dm-mc-inline="' + name + '"]') : null;
    return el ? String(el.value == null ? '' : el.value) : '';
  }

  function submitInline() {
    if (busy || !openForm) return;
    var route = openForm.route;
    var payload;
    var intent;
    if (openForm.kind === 'key') {
      var keyValue = readInlineField('key');
      openForm.draft = { key: keyValue };
      if (keyValue === '') { openForm.error = '请输入 API Key'; render(); return; }
      var keyItem = providerOf(route);
      payload = { action: 'setKey', ref: keyItem ? keyItem.apiKeyRef : '', value: keyValue };
      intent = { kind: 'key', ref: payload.ref };
    } else {
      openForm.draft = {
        displayName: readInlineField('displayName'),
        api: readInlineField('api'),
        baseURL: readInlineField('baseURL'),
        modelsText: readInlineField('models'),
        key: readInlineField('key'),
      };
      payload = {
        action: 'saveProvider', mode: 'edit', route: route,
        displayName: openForm.draft.displayName, api: openForm.draft.api,
        baseURL: openForm.draft.baseURL, models: parseModelsText(openForm.draft.modelsText),
        key: openForm.draft.key,
      };
      intent = { kind: 'provider', route: route, key: payload.key !== '' };
    }
    busy = true;
    openForm.error = null;
    render();
    var target = openForm;
    rpc('mobile.modelsCenter.save', payload).then(function (result) {
      settleSave(intent, result, null, function (landed, message, res) {
        if (openForm === target) openForm = landed ? null : target;
        if (!landed && openForm) openForm.error = message || '保存失败';
        render();
        if (!landed) { setStatus('err', '保存失败：' + (message || '回读未看到目标值')); return; }
        var mismatches = (res && res.value && Array.isArray(res.value.mismatches)) ? res.value.mismatches : [];
        if (mismatches.length > 0) setStatus('err', '已提交，但宿主回读不一致：' + mismatches.map(function (item) { return item.field; }).join('、'));
        else setStatus('ok', message ? '已保存并应用到宿主（写入时连接中断一次，回读已确认）。' : '已保存并应用到宿主（回读已确认）。');
      });
    }).catch(function (err) {
      settleSave(intent, null, err, function (landed, message) {
        if (openForm === target) openForm = landed ? null : target;
        if (!landed && openForm) openForm.error = message || '保存失败';
        render();
        setStatus(landed ? 'ok' : 'err', landed ? '已保存并应用到宿主（写入时连接中断一次，回读已确认）。' : '保存失败：' + (message || ''));
      });
    });
  }

  function providerCard(item) {
    var badges = '';
    if (item.registered) badges += badge('已注册', 'is-on');
    if (item.configured) badges += badge('已配置', 'is-on');
    if (item.error) badges += badge('异常', 'is-off');
    var meta = [];
    if (item.credential) meta.push(item.credential.configured ? 'API Key 已配置' : 'API Key 未配置');
    if (item.models && item.models.length > 0) meta.push(item.models.length + ' 个模型');
    if (item.api) meta.push(item.api);
    var expanded = openForm !== null && openForm.route === item.provider;
    var actions = '';
    if (item.provider === 'deepseek-official' && item.credential) {
      actions += '<button class="dm-mc-btn" type="button" data-dm-mc-key="' + esc(item.provider) + '">' + (expanded && openForm.kind === 'key' ? '收起' : '替换 API Key') + '</button>';
    }
    if (item.source === 'profile' || item.removable) {
      actions += '<button class="dm-mc-btn" type="button" data-dm-mc-edit="' + esc(item.provider) + '">' + (expanded && openForm.kind === 'edit' ? '收起' : '编辑') + '</button>';
      if (item.removable) actions += '<button class="dm-mc-btn is-danger" type="button" data-dm-mc-remove="' + esc(item.provider) + '">删除</button>';
    }
    var html = '<div class="dm-mc-card" data-dm-mc-provider="' + esc(item.provider) + '">' +
      '<div class="dm-mc-head"><span class="dm-mc-name">' + esc(item.displayName || item.provider) + '</span>' +
      '<span class="dm-mc-badges">' + badges + '</span></div>' +
      '<div class="dm-mc-sub">' + esc(item.provider) + ' · ' + esc(sourceLabel(item)) + '</div>';
    if (meta.length > 0) html += '<div class="dm-mc-meta">' + esc(meta.join(' · ')) + '</div>';
    if (item.baseURL) html += '<div class="dm-mc-meta dm-mc-endpoint">' + esc(item.baseURL) + '</div>';
    if (item.modelsError) html += '<p class="dm-cfg-hint dm-cfg-warn">模型清单读取失败：' + esc(item.modelsError) + '</p>';
    if (item.error) html += '<p class="dm-cfg-hint dm-cfg-warn">' + esc(item.error) + '</p>';
    if (actions !== '') html += '<div class="dm-mc-actions">' + actions + '</div>';
    if (expanded) html += inlineFormHtml(item);
    html += '</div>';
    return html;
  }

  function render() {
    if (!data) {
      renderState('还没有模型数据', 'dm-page-empty', true);
      return;
    }
    if (data.available !== true) {
      renderState(data.reason || '宿主没有提供模型服务', 'dm-page-error', true);
      return;
    }
    var readOnly = data.readOnly === true;
    var html = '';

    // DeepSeek 账号
    html += '<div class="dm-mc-section"><h2 class="dm-cfg-sectionTitle">DeepSeek 账号</h2>';
    var account = data.account || { available: false };
    if (account.available !== true) {
      html += '<div class="dm-mc-card"><p class="dm-cfg-hint">' + esc(account.reason || '宿主账号服务不可用') + '</p></div>';
    } else {
      var signedIn = account.status === 'signed-in';
      html += '<div class="dm-mc-card"><div class="dm-mc-head"><span class="dm-mc-name">DeepSeek 账号</span>' +
        (signedIn ? badge('已登录', 'is-on') : badge('未登录', 'is-off')) + '</div>' +
        '<p class="dm-cfg-hint">' + (signedIn ? '已在本机保存 DeepSeek 账号授权，可直接使用账号模型。' : '尚未登录。手机端暂不支持登录/退出，请在桌面端操作。') + '</p>';
      if (account.attempt && account.attempt.phase) {
        html += '<p class="dm-cfg-hint dm-cfg-warn">登录进行中：' + esc(account.attempt.phase) + '</p>';
      }
      // 账号链接做成按钮、右对齐放在卡片右下角（用户要求）；只在宿主真给了 URL 时渲染。
      var links = [];
      if (account.links && account.links.usageUrl) {
        links.push('<a class="dm-mc-btn dm-mc-linkBtn" role="button" href="' + esc(account.links.usageUrl) + '" target="_blank" rel="noopener noreferrer">用量</a>');
      }
      if (account.links && account.links.topUpUrl) {
        links.push('<a class="dm-mc-btn dm-mc-linkBtn" role="button" href="' + esc(account.links.topUpUrl) + '" target="_blank" rel="noopener noreferrer">充值</a>');
      }
      if (links.length > 0) html += '<div class="dm-mc-links">' + links.join('') + '</div>';
      html += '</div>';
    }
    html += '</div>';

    // 默认模型：标题行只留标题，「编辑」按钮放到卡片内部右下角（用户要求）。
    html += '<div class="dm-mc-section"><h2 class="dm-cfg-sectionTitle">默认模型</h2>';
    var model = data.defaultModel;
    if (!model) {
      html += '<div class="dm-mc-card"><p class="dm-cfg-hint">宿主没有返回默认模型。</p></div>';
    } else {
      var nameOf = function (provider, id) {
        var item = providerOf(provider);
        if (!item) return null;
        for (var i = 0; i < (item.models || []).length; i++) if (item.models[i].id === id) return item.models[i].name;
        return null;
      };
      html += '<div class="dm-mc-card"><div class="dm-mc-head"><span class="dm-mc-name">' +
        esc(nameOf(model.provider, model.model) || model.model) + '</span>' +
        (model.overridden ? badge('已覆盖') : '') + '</div>' +
        '<div class="dm-mc-sub">' + esc(model.provider) + ' · ' + esc(model.model) + '</div>' +
        '<div class="dm-mc-meta">推理强度：' + esc(model.reasoningEffort || '默认') + '</div>' +
        (readOnly ? '' : '<div class="dm-mc-cardFoot"><button class="dm-mc-btn" type="button" data-dm-mc-default-edit="1">编辑</button></div>') +
        '</div>';
    }
    html += '</div>';

    // 提供商列表
    var providers = Array.isArray(data.providers) ? data.providers : [];
    html += '<div class="dm-mc-section"><h2 class="dm-cfg-sectionTitle">提供商（' + providers.length + ' 个）</h2>';
    if (providers.length === 0) {
      html += '<div class="dm-mc-card"><p class="dm-cfg-hint">宿主当前没有可用的模型提供商。</p></div>';
    } else {
      for (var i = 0; i < providers.length; i++) html += providerCard(providers[i]);
    }
    if (!readOnly) html += '<button class="dm-mc-addRow" type="button" data-dm-mc-add="1">＋ 添加模型提供商</button>';
    html += '</div>';

    html += '<p class="dm-cfg-footnote">数据来自宿主 llm / credentials / deepseekAccount / agentDefaultModel 的实时读取。' +
      (readOnly ? '当前部署的设置文档只读。' : '保存会写入 profile 的 cordis.patch.yml 并走正常 Loader 路径应用，插件可能短暂重载。') +
      '</p>';
    html += '<div class="dm-cfg-footer"><p class="dm-cfg-status" data-dm-mc-status="1"></p></div>';
    BODY.innerHTML = html;
    setStatus(status && status.kind, status && status.text);
    renderSheet();
  }

  // ── 弹出面板（添加 / 编辑 / 删除 / 替换 Key / 默认模型）────────────────────
  function sheetHost() {
    var host = PAGE.querySelector('[data-dm-mc-sheethost]');
    if (!host) {
      host = document.createElement('div');
      host.className = 'dm-mc-sheetHost';
      host.setAttribute('data-dm-mc-sheethost', '1');
      host.hidden = true;
      PAGE.appendChild(host);
    }
    return host;
  }

  function fieldHtml(label, name, value, opts) {
    var options = opts || {};
    var input;
    if (options.select) {
      var items = options.select.map(function (choice) {
        return '<option value="' + esc(choice.value) + '"' + (String(value) === String(choice.value) ? ' selected' : '') + '>' + esc(choice.label) + '</option>';
      }).join('');
      input = '<select class="dm-cfg-input" data-dm-mc-field="' + esc(name) + '"' + (options.disabled ? ' disabled' : '') + '>' + items + '</select>';
    } else if (options.textarea) {
      input = '<textarea class="dm-cfg-input dm-mc-textarea" rows="' + (options.rows || 3) + '" data-dm-mc-field="' + esc(name) + '"' +
        (options.placeholder ? ' placeholder="' + esc(options.placeholder) + '"' : '') + '>' + esc(value) + '</textarea>';
    } else {
      input = '<input class="dm-cfg-input" type="' + (options.type || 'text') + '" autocomplete="' + (options.type === 'password' ? 'new-password' : 'off') + '"' +
        ' autocapitalize="off" spellcheck="false" data-dm-mc-field="' + esc(name) + '"' +
        ' value="' + esc(value) + '"' +
        (options.placeholder ? ' placeholder="' + esc(options.placeholder) + '"' : '') +
        (options.disabled ? ' disabled' : '') + '>';
    }
    return '<div class="dm-mc-formRow"><label class="dm-cfg-label">' + esc(label) + '</label>' + input +
      (options.hint ? '<p class="dm-cfg-hint">' + esc(options.hint) + '</p>' : '') + '</div>';
  }

  function sheetErrorHtml() {
    if (!sheet || !sheet.error) return '';
    return '<p class="dm-cfg-invalid dm-mc-sheetErr">' + esc(sheet.error) + '</p>';
  }

  function sheetHeader(title) {
    return '<div class="dm-mc-sheetHead"><span class="dm-mc-sheetTitle">' + esc(title) + '</span>' +
      '<button class="dm-mc-btn" type="button" aria-label="关闭" data-dm-mc-sheet-close="1">✕</button></div>';
  }

  function sheetFooter(label) {
    return '<div class="dm-mc-sheetActions">' +
      '<button class="dm-cfg-save" type="button" data-dm-mc-save="1"' + (busy ? ' disabled' : '') + '>' + esc(busy ? '保存中…' : label || '保存') + '</button>' +
      '</div>';
  }

  // 每个页签自己的「取消 / 保存」：取消只是关面板，保存成功后由 settleSave 关面板并刷新。
  function sheetFooterRow(label) {
    return '<div class="dm-mc-sheetActions">' +
      '<button class="dm-mc-btn" type="button" data-dm-mc-sheet-close="1">取消</button>' +
      (label === null || label === undefined ? '' :
        '<button class="dm-cfg-save" type="button" data-dm-mc-save="1"' + (busy ? ' disabled' : '') + '>' +
        esc(busy ? '保存中…' : label) + '</button>') +
      '</div>';
  }

  function catalogChoices() {
    if (!data || !Array.isArray(data.catalog)) return [];
    var configured = {};
    (data.providers || []).forEach(function (item) { if (item.configured) configured[item.provider] = true; });
    return data.catalog.filter(function (item) { return !configured[item.provider]; });
  }

  // ── 添加面板：两段式切换（第三方目录 / 自定义 API）─────────────────────
  // 两个页签共用一个面板：切走前把输入存进 sheet.draft[tab]，切回来再填回去，
  // 所以「填一半 → 切走 → 切回」不会丢内容。
  var ADD_THIRD_HINT = '从内置目录中选择 OpenAI、Anthropic、Kimi 等提供商，填入其 API 密钥即可使用。';
  var ADD_CUSTOM_HINT = '连接中转站、自部署服务或其他兼容 OpenAI / Anthropic 协议的接口，需填写 API 地址、协议和模型。';

  function addDraftOf(tab) {
    if (!sheet || sheet.kind !== 'add') return {};
    if (!sheet.draft || typeof sheet.draft !== 'object') sheet.draft = {};
    if (!sheet.draft[tab] || typeof sheet.draft[tab] !== 'object') sheet.draft[tab] = {};
    return sheet.draft[tab];
  }

  function captureAddDraft() {
    if (!sheet || sheet.kind !== 'add') return;
    if (sheet.tab === 'custom') {
      var custom = addDraftOf('custom');
      custom.route = readField('route');
      custom.displayName = readField('displayName');
      custom.api = readField('api');
      custom.baseURL = readField('baseURL');
      custom.key = readField('key');
      custom.modelsText = readField('models');
    } else if (sheet.picked) {
      var third = addDraftOf('third');
      third.displayName = readField('displayName');
      third.api = readField('api');
      third.baseURL = readField('baseURL');
      third.key = readField('key');
    }
  }

  function addSegHtml() {
    var tab = sheet.tab === 'custom' ? 'custom' : 'third';
    var seg = function (value, label) {
      return '<button class="dm-mc-segBtn' + (tab === value ? ' is-on' : '') + '" type="button" role="tab"' +
        ' aria-selected="' + (tab === value ? 'true' : 'false') + '" data-dm-mc-tab="' + value + '">' + label + '</button>';
    };
    return '<div class="dm-mc-seg" role="tablist" aria-label="添加方式">' +
      seg('third', '第三方模型提供商') + seg('custom', '自定义模型 API') + '</div>';
  }

  function addThirdListHtml(query) {
    var choices = catalogChoices().filter(function (item) {
      return query === '' || String(item.provider + ' ' + (item.displayName || '')).toLowerCase().indexOf(query) >= 0;
    });
    var html = '<p class="dm-cfg-hint dm-mc-addHint">' + ADD_THIRD_HINT + '</p>' +
      '<input class="dm-cfg-input dm-mc-search" type="search" placeholder="搜索提供商目录" data-dm-mc-catsearch="1" value="' + esc(query) + '">' +
      '<div class="dm-mc-list" data-dm-mc-catlist="1">';
    if (choices.length === 0) {
      html += '<p class="dm-cfg-hint">' + (query === '' ? '目录中的提供商都已添加。' : '没有匹配的提供商。') + '</p>';
    } else {
      for (var i = 0; i < choices.length; i++) {
        var entry = choices[i];
        html += '<button class="dm-mc-listItem" type="button" data-dm-mc-cat="' + esc(entry.provider) + '">' +
          '<span class="dm-mc-listName">' + esc(entry.displayName || entry.provider) + '</span>' +
          '<span class="dm-mc-listSub">' + esc(entry.provider) + (entry.defaultBaseURL ? ' · ' + esc(entry.defaultBaseURL) : '') + '</span></button>';
      }
    }
    html += '</div>' + sheetFooterRow(null);
    return html;
  }

  function addThirdFormHtml() {
    var third = addDraftOf('third');
    var catalogEntry = null;
    (data.catalog || []).forEach(function (entry) { if (entry.provider === sheet.picked) catalogEntry = entry; });
    return '<p class="dm-cfg-hint dm-mc-addHint">' + ADD_THIRD_HINT + '</p>' +
      '<div class="dm-mc-picked"><span class="dm-mc-pickedName">' +
      esc((catalogEntry && (catalogEntry.displayName || catalogEntry.provider)) || sheet.picked) +
      '</span><button class="dm-mc-btn" type="button" data-dm-mc-backlist="1">重新选择</button></div>' +
      fieldHtml('Provider ID', 'route', sheet.picked, { disabled: true }) +
      fieldHtml('显示名称', 'displayName', third.displayName || '', { placeholder: '留空使用默认名称' }) +
      fieldHtml('API 地址', 'baseURL', third.baseURL || ((catalogEntry && catalogEntry.defaultBaseURL) || ''), { placeholder: 'https://gateway.example/v1', hint: '含 API 前缀；程序会按协议追加路径。' }) +
      fieldHtml('API 协议', 'api', third.api || 'openai-completions', {
        select: [
          { value: 'openai-completions', label: 'openai-completions（OpenAI 兼容 /chat/completions）' },
          { value: 'openai-responses', label: 'openai-responses（OpenAI Responses）' },
          { value: 'anthropic-messages', label: 'anthropic-messages（Anthropic Messages）' },
        ],
      }) +
      fieldHtml('API Key', 'key', third.key || '', { type: 'password', placeholder: '输入 API 密钥（可留空，之后用编辑补）' }) +
      sheetErrorHtml() + sheetFooterRow('保存');
  }

  function addCustomFormHtml() {
    var custom = addDraftOf('custom');
    return '<p class="dm-cfg-hint dm-mc-addHint">' + ADD_CUSTOM_HINT + '</p>' +
      fieldHtml('Provider ID', 'route', custom.route || '', { placeholder: '例如 my-gateway', hint: '以小写字母开头的标识，在请求中唯一标识该提供商，并用于派生凭据名。' }) +
      fieldHtml('显示名称', 'displayName', custom.displayName || '', { placeholder: '留空使用默认名称' }) +
      fieldHtml('API 地址', 'baseURL', custom.baseURL || '', { placeholder: 'https://gateway.example/v1' }) +
      fieldHtml('API 协议', 'api', custom.api || 'openai-completions', {
        select: [
          { value: 'openai-completions', label: 'openai-completions（OpenAI 兼容 /chat/completions）' },
          { value: 'openai-responses', label: 'openai-responses（OpenAI Responses）' },
          { value: 'anthropic-messages', label: 'anthropic-messages（Anthropic Messages）' },
        ],
      }) +
      fieldHtml('API Key', 'key', custom.key || '', { type: 'password', placeholder: '输入 API 密钥' }) +
      fieldHtml('模型目录（每行一个，可写 id=显示名）', 'models', custom.modelsText || '', { textarea: true, rows: 5, placeholder: 'gpt-4o' }) +
      sheetErrorHtml() + sheetFooterRow('创建提供商');
  }

  function renderSheet() {
    var host = sheetHost();
    if (!sheet) {
      host.hidden = true;
      host.innerHTML = '';
      return;
    }
    host.hidden = false;
    var body = '';
    if (sheet.kind === 'add') {
      body = sheetHeader('添加模型提供商') + addSegHtml() +
        (sheet.tab === 'custom'
          ? addCustomFormHtml()
          : (sheet.picked ? addThirdFormHtml() : addThirdListHtml(String(sheet.query || '').toLowerCase())));
    } else if (sheet.kind === 'catalog') {
      var query = String(sheet.query || '').toLowerCase();
      var choices = catalogChoices().filter(function (item) {
        if (query === '') return true;
        return String(item.provider + ' ' + (item.displayName || '')).toLowerCase().indexOf(query) >= 0;
      });
      body = sheetHeader('添加模型提供商') +
        '<p class="dm-cfg-hint">第三方模型提供商：从内置目录中选择 OpenAI、Anthropic、Kimi 等，填入 API 密钥即可使用。</p>' +
        '<input class="dm-cfg-input dm-mc-search" type="search" placeholder="搜索提供商目录" data-dm-mc-catsearch="1" value="' + esc(sheet.query || '') + '">' +
        '<div class="dm-mc-list" data-dm-mc-catlist="1">';
      if (choices.length === 0) {
        body += '<p class="dm-cfg-hint">' + (query === '' ? '目录中的提供商都已添加。' : '没有匹配的提供商。') + '</p>';
      } else {
        for (var i = 0; i < choices.length; i++) {
          var entry = choices[i];
          body += '<button class="dm-mc-listItem" type="button" data-dm-mc-cat="' + esc(entry.provider) + '">' +
            '<span class="dm-mc-listName">' + esc(entry.displayName || entry.provider) + '</span>' +
            '<span class="dm-mc-listSub">' + esc(entry.provider) + (entry.defaultBaseURL ? ' · ' + esc(entry.defaultBaseURL) : '') + '</span>' +
            '</button>';
        }
      }
      body += '</div>' +
        '<button class="dm-mc-btn dm-mc-customBtn" type="button" data-dm-mc-custom="1">自定义模型 API（baseURL + 协议 + 模型 + 密钥）</button>' +
        sheetErrorHtml();
    } else if (sheet.kind === 'provider') {
      var mode = sheet.mode;
      var isEdit = mode === 'edit';
      var title = isEdit ? '编辑 ' + (sheet.route || '') : (mode === 'catalog' ? '添加 ' + (sheet.displayName || sheet.route || '') : '自定义模型 API');
      body = sheetHeader(title);
      if (isEdit) {
        body += fieldHtml('Provider ID', 'route', sheet.route, { disabled: true, hint: 'Provider ID 不可修改' });
      } else if (mode === 'custom') {
        body += fieldHtml('Provider ID', 'route', sheet.route || '', { placeholder: '例如 my-gateway', hint: '以小写字母开头的标识，用于派生凭据名；规则 ^[a-z][a-z0-9]*(-[a-z0-9]+)*$' });
      } else {
        body += fieldHtml('Provider ID', 'route', sheet.route, { disabled: true });
      }
      body += fieldHtml('显示名称', 'displayName', sheet.displayName || '', { placeholder: '留空使用默认名称' });
      body += fieldHtml('API 协议', 'api', sheet.api || 'openai-completions', {
        select: [
          { value: 'openai-completions', label: 'openai-completions（OpenAI 兼容 /chat/completions）' },
          { value: 'openai-responses', label: 'openai-responses（OpenAI Responses）' },
          { value: 'anthropic-messages', label: 'anthropic-messages（Anthropic Messages）' },
        ],
      });
      body += fieldHtml('API 地址', 'baseURL', sheet.baseURL || '', { placeholder: 'https://gateway.example/v1', hint: '含 API 前缀的地址；程序会按协议追加 /chat/completions、/responses 或 /messages。' });
      body += fieldHtml('模型（每行一个，可写 id=显示名）', 'models', sheet.modelsText || '', { textarea: true, rows: 5, placeholder: 'gpt-4o\\nclaude-3-5-sonnet=Claude 3.5 Sonnet' });
      body += fieldHtml('API Key', 'key', '', { type: 'password', placeholder: sheet.keyConfigured ? '已配置；留空表示保持当前密钥' : '输入 API 密钥' });
      body += sheetErrorHtml() + sheetFooter();
    } else if (sheet.kind === 'key') {
      var item = providerOf(sheet.route);
      body = sheetHeader('替换 API Key') +
        '<p class="dm-cfg-hint">' + esc(item ? (item.displayName || item.provider) : sheet.route) + ' · 凭据引用 ' + esc(sheet.ref || '') + '</p>' +
        fieldHtml('API Key', 'key', '', { type: 'password', placeholder: sheet.configured ? '已配置；留空表示不修改' : '输入 API 密钥' }) +
        '<p class="dm-cfg-hint">密钥只写入宿主凭据库，不回显，也不写进设置文件。</p>' +
        sheetErrorHtml() + sheetFooter('保存密钥');
    } else if (sheet.kind === 'default') {
      var choicesProviders = (data.providers || []).filter(function (item) { return (item.models || []).length > 0; });
      body = sheetHeader('默认模型') +
        fieldHtml('提供商', 'provider', sheet.provider || (data.defaultModel ? data.defaultModel.provider : ''), {
          select: choicesProviders.map(function (item) { return { value: item.provider, label: item.displayName || item.provider }; }),
        }) +
        fieldHtml('模型', 'model', sheet.model || (data.defaultModel ? data.defaultModel.model : ''), {
          select: (function () {
            var item = providerOf(sheet.provider || (data.defaultModel ? data.defaultModel.provider : ''));
            return (item && item.models ? item.models : []).map(function (model) { return { value: model.id, label: model.name || model.id }; });
          })(),
        }) +
        fieldHtml('推理强度', 'reasoningEffort', sheet.reasoningEffort || (data.defaultModel && data.defaultModel.reasoningEffort) || '', {
          select: [
            { value: '', label: '默认（不指定）' },
            { value: 'off', label: 'off' },
            { value: 'low', label: 'low' },
            { value: 'medium', label: 'medium' },
            { value: 'high', label: 'high' },
            { value: 'xhigh', label: 'xhigh' },
            { value: 'max', label: 'max' },
          ],
        }) +
        sheetErrorHtml() + sheetFooterRow('应用默认模型');
    } else if (sheet.kind === 'delete') {
      var target = providerOf(sheet.route);
      body = sheetHeader('删除 ' + (target ? target.displayName || target.provider : sheet.route) + '？') +
        '<p class="dm-cfg-hint">删除会移除该提供商的配置' +
        (sheet.removeKey ? '和存储的 API 密钥' : '；其使用的凭证由其他位置管理，将会保留') + '。</p>' +
        (sheet.removeKey ? '<label class="dm-mc-check"><input type="checkbox" data-dm-mc-removekey="1" checked> 同时删除存储的 API 密钥</label>' : '') +
        sheetErrorHtml() +
        '<div class="dm-mc-sheetActions"><button class="dm-mc-btn" type="button" data-dm-mc-sheet-close="1">取消</button>' +
        '<button class="dm-mc-btn is-danger" type="button" data-dm-mc-confirm-delete="1"' + (busy ? ' disabled' : '') + '>' + esc(busy ? '删除中…' : '删除') + '</button></div>';
    }
    host.innerHTML = '<div class="dm-mc-mask" data-dm-mc-mask="1"></div><div class="dm-mc-sheet">' + body + '</div>';
  }

  function openSheet(next) {
    sheet = next;
    sheet.error = null;
    busy = false;
    renderSheet();
  }
  function closeSheet() {
    sheet = null;
    busy = false;
    renderSheet();
  }

  function readField(name) {
    var el = PAGE.querySelector('[data-dm-mc-field="' + name + '"]');
    return el ? String(el.value == null ? '' : el.value) : '';
  }

  function parseModelsText(text) {
    var out = [];
    var lines = String(text || '').split('\\n');
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (line === '') continue;
      var idx = line.indexOf('=');
      if (idx > 0) out.push({ id: line.slice(0, idx).trim(), name: line.slice(idx + 1).trim() });
      else out.push({ id: line });
    }
    return out;
  }

  function modelsTextOf(list) {
    return (Array.isArray(list) ? list : []).map(function (model) {
      return model.name && model.name !== model.id ? model.id + '=' + model.name : model.id;
    }).join('\\n');
  }


  // 写配置会触发 Loader 应用：本插件连接可能断一次。所以保存后一律重取宿主状态，
  // 以「目标效果是否真的出现」判定成功，而不是把网络错误当失败。
  function refetchModels(attempt) {
    var tries = attempt || 0;
    return rpc('mobile.modelsCenter.get').then(function (result) {
      return result && result.ok === true ? result.value : null;
    }).catch(function () {
      if (tries >= 9) return null;
      return new Promise(function (resolve) { setTimeout(resolve, 700); }).then(function () { return refetchModels(tries + 1); });
    });
  }

  function intentLanded(page, intent) {
    if (!page || page.available !== true) return false;
    var providers = Array.isArray(page.providers) ? page.providers : [];
    var find = function (route) {
      for (var i = 0; i < providers.length; i++) if (providers[i].provider === route) return providers[i];
      return null;
    };
    if (intent.kind === 'key') {
      var owner = null;
      for (var i = 0; i < providers.length; i++) if (providers[i].apiKeyRef === intent.ref) owner = providers[i];
      return !!(owner && owner.credential && owner.credential.configured === true);
    }
    if (intent.kind === 'default') {
      return !!(page.defaultModel && page.defaultModel.provider === intent.provider && page.defaultModel.model === intent.model);
    }
    if (intent.kind === 'provider') {
      var item = find(intent.route);
      if (!item || item.configured !== true) return false;
      if (intent.key === true && (!item.credential || item.credential.configured !== true)) return false;
      return true;
    }
    if (intent.kind === 'remove') {
      var gone = find(intent.route);
      return !(gone && gone.configured === true);
    }
    return false;
  }

  function settleSave(intent, result, error, onSettled) {
    refetchModels().then(function (fresh) {
      busy = false;
      if (fresh) data = fresh;
      var landed = intentLanded(data, intent);
      var message = error
        ? String((error && error.message) || error)
        : ((result && result.ok !== true && result.error && result.error.message) || null);
      if (onSettled !== undefined) { onSettled(landed, message, result); return; }
      if (landed) {
        var mismatches = (result && result.value && Array.isArray(result.value.mismatches)) ? result.value.mismatches : [];
        sheet = null;
        render();
        if (mismatches.length > 0) setStatus('err', '已提交，但宿主回读不一致：' + mismatches.map(function (item) { return item.field; }).join('、'));
        else setStatus('ok', message ? '已保存并应用到宿主（写入时连接中断一次，回读已确认）。' : '已保存并应用到宿主（回读已确认）。');
      } else {
        if (sheet) sheet.error = message || '宿主没有返回保存结果，且回读未看到目标值';
        render();
        setStatus('err', '保存失败：' + (message || '回读未看到目标值'));
      }
    });
  }

  function submitSheet() {
    if (busy || !sheet) return;
    var action = '';
    var payload = {};
    if (sheet.kind === 'key') {
      var key = readField('key');
      if (key === '') { sheet.error = '请输入 API Key'; renderSheet(); return; }
      action = 'setKey';
      payload = { action: action, ref: sheet.ref, value: key };
    } else if (sheet.kind === 'default') {
      action = 'setDefaultModel';
      payload = { action: action, provider: readField('provider'), model: readField('model'), reasoningEffort: readField('reasoningEffort') };
      if (payload.model === '') { sheet.error = '请选择模型'; renderSheet(); return; }
    } else if (sheet.kind === 'add') {
      captureAddDraft();
      action = 'saveProvider';
      if (sheet.tab === 'custom') {
        var customDraft = addDraftOf('custom');
        payload = {
          action: action, mode: 'custom', route: String(customDraft.route || ''),
          displayName: String(customDraft.displayName || ''), api: String(customDraft.api || ''),
          baseURL: String(customDraft.baseURL || ''), models: parseModelsText(String(customDraft.modelsText || '')),
          key: String(customDraft.key || ''),
        };
      } else if (sheet.picked) {
        var thirdDraft = addDraftOf('third');
        payload = {
          action: action, mode: 'catalog', route: sheet.picked,
          displayName: String(thirdDraft.displayName || ''), api: String(thirdDraft.api || ''),
          baseURL: String(thirdDraft.baseURL || ''), key: String(thirdDraft.key || ''),
        };
        if (payload.baseURL === '') delete payload.baseURL;
      } else {
        sheet.error = '请先从目录中选择一个提供商，或切到「自定义模型 API」';
        renderSheet();
        return;
      }
    } else if (sheet.kind === 'provider') {
      action = 'saveProvider';
      payload = {
        action: action,
        mode: sheet.mode,
        route: sheet.mode === 'custom' ? readField('route') : sheet.route,
        displayName: readField('displayName'),
        api: readField('api'),
        baseURL: readField('baseURL'),
        models: parseModelsText(readField('models')),
        key: readField('key'),
      };
      if (sheet.mode === 'catalog') {
        // 目录提供商沿用内置地址/协议/模型，不强制填模型清单。
        if (payload.baseURL === '') delete payload.baseURL;
        if (payload.api === '') delete payload.api;
        if (payload.models.length === 0) delete payload.models;
      }
    } else if (sheet.kind === 'delete') {
      if (busy) return;
      busy = true;
      renderSheet();
      var removeKeyEl = PAGE.querySelector('[data-dm-mc-removekey]');
      var removeIntent = { kind: 'remove', route: sheet.route };
      rpc('mobile.modelsCenter.save', { action: 'removeProvider', route: sheet.route, removeKey: !!(removeKeyEl && removeKeyEl.checked) }).then(function (result) {
        settleSave(removeIntent, result, null);
      }).catch(function (err) {
        settleSave(removeIntent, null, err);
      });
      return;
    }
    busy = true;
    sheet.error = null;
    renderSheet();
    var intent = sheet.kind === 'key'
      ? { kind: 'key', ref: payload.ref }
      : sheet.kind === 'default'
        ? { kind: 'default', provider: payload.provider, model: payload.model }
        : { kind: 'provider', route: payload.route, key: payload.key !== '' };
    rpc('mobile.modelsCenter.save', payload).then(function (result) {
      settleSave(intent, result, null);
    }).catch(function (err) {
      settleSave(intent, null, err);
    });
  }

  // ── 事件 ────────────────────────────────────────────────────────────────
  PAGE.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || !target.closest) return;
    if (target.closest('[data-dm-mc-back]')) { event.preventDefault(); closeModelsPage(false); return; }
    if (target.closest('[data-dm-mc-refresh]') || target.closest('[data-dm-mc-retry]')) { event.preventDefault(); load(); return; }
    if (target.closest('[data-dm-mc-sheet-close]') || target.closest('[data-dm-mc-mask]')) { event.preventDefault(); closeSheet(); return; }
    if (target.closest('[data-dm-mc-add]')) {
      event.preventDefault();
      openForm = null;
      sheet = { kind: 'add', tab: 'third', query: '', error: null, picked: null, draft: { custom: {}, third: {} } };
      renderSheet();
      return;
    }
    var tabBtn = target.closest('[data-dm-mc-tab]');
    if (tabBtn) {
      event.preventDefault();
      if (!sheet || sheet.kind !== 'add') return;
      captureAddDraft();
      sheet.tab = tabBtn.getAttribute('data-dm-mc-tab') === 'custom' ? 'custom' : 'third';
      renderSheet();
      return;
    }
    if (target.closest('[data-dm-mc-backlist]')) {
      event.preventDefault();
      if (sheet && sheet.kind === 'add') { captureAddDraft(); sheet.picked = null; renderSheet(); }
      return;
    }
    if (target.closest('[data-dm-mc-custom]')) {
      event.preventDefault();
      if (sheet && sheet.kind === 'add') { captureAddDraft(); sheet.tab = 'custom'; renderSheet(); }
      return;
    }
    var cat = target.closest('[data-dm-mc-cat]');
    if (cat) {
      event.preventDefault();
      if (!sheet || sheet.kind !== 'add') return;
      captureAddDraft();
      var pickedRoute = cat.getAttribute('data-dm-mc-cat');
      var catalogEntry = null;
      (data.catalog || []).forEach(function (item) { if (item.provider === pickedRoute) catalogEntry = item; });
      sheet.tab = 'third';
      sheet.picked = pickedRoute;
      var thirdDraft = addDraftOf('third');
      thirdDraft.displayName = catalogEntry && catalogEntry.displayName ? catalogEntry.displayName : pickedRoute;
      thirdDraft.api = 'openai-completions';
      thirdDraft.baseURL = catalogEntry && catalogEntry.defaultBaseURL ? catalogEntry.defaultBaseURL : '';
      thirdDraft.key = '';
      renderSheet();
      return;
    }
    var edit = target.closest('[data-dm-mc-edit]');
    if (edit) {
      event.preventDefault();
      var editRoute = edit.getAttribute('data-dm-mc-edit');
      if (openForm && openForm.route === editRoute && openForm.kind === 'edit') openForm = null;
      else openForm = { kind: 'edit', route: editRoute, error: null, draft: {} };
      sheet = null;
      renderSheet();
      render();
      return;
    }
    var keyBtn = target.closest('[data-dm-mc-key]');
    if (keyBtn) {
      event.preventDefault();
      var keyRoute = keyBtn.getAttribute('data-dm-mc-key');
      if (openForm && openForm.route === keyRoute && openForm.kind === 'key') openForm = null;
      else openForm = { kind: 'key', route: keyRoute, error: null, draft: {} };
      sheet = null;
      renderSheet();
      render();
      return;
    }
    if (target.closest('[data-dm-mc-inline-cancel]')) { event.preventDefault(); openForm = null; render(); return; }
    if (target.closest('[data-dm-mc-inline-save]')) { event.preventDefault(); submitInline(); return; }
    var remove = target.closest('[data-dm-mc-remove]');
    if (remove) {
      event.preventDefault();
      var removeItem = providerOf(remove.getAttribute('data-dm-mc-remove'));
      openSheet({ kind: 'delete', route: remove.getAttribute('data-dm-mc-remove'), removeKey: !!(removeItem && removeItem.apiKeyRef && removeItem.apiKeyRef === String(removeItem.provider).toUpperCase().replace(/[^A-Z0-9]+/g, '_') + '_API_KEY') });
      return;
    }
    if (target.closest('[data-dm-mc-default-edit]')) {
      event.preventDefault();
      openSheet({
        kind: 'default',
        provider: data.defaultModel ? data.defaultModel.provider : '',
        model: data.defaultModel ? data.defaultModel.model : '',
        reasoningEffort: data.defaultModel ? data.defaultModel.reasoningEffort : '',
      });
      return;
    }
    if (target.closest('[data-dm-mc-save]')) { event.preventDefault(); submitSheet(); return; }
    if (target.closest('[data-dm-mc-confirm-delete]')) { event.preventDefault(); submitSheet(); }
  });

  PAGE.addEventListener('input', function (event) {
    var target = event.target;
    if (!target || !target.getAttribute) return;
    if (target.getAttribute('data-dm-mc-catsearch') !== null && sheet && (sheet.kind === 'add' || sheet.kind === 'catalog')) {
      sheet.query = String(target.value || '');
      var list = PAGE.querySelector('[data-dm-mc-catlist]');
      if (!list) return;
      var query = sheet.query.toLowerCase();
      var choices = catalogChoices().filter(function (item) {
        if (query === '') return true;
        return String(item.provider + ' ' + (item.displayName || '')).toLowerCase().indexOf(query) >= 0;
      });
      var html = '';
      if (choices.length === 0) html = '<p class="dm-cfg-hint">没有匹配的提供商。</p>';
      else for (var i = 0; i < choices.length; i++) {
        var entry = choices[i];
        html += '<button class="dm-mc-listItem" type="button" data-dm-mc-cat="' + esc(entry.provider) + '">' +
          '<span class="dm-mc-listName">' + esc(entry.displayName || entry.provider) + '</span>' +
          '<span class="dm-mc-listSub">' + esc(entry.provider) + (entry.defaultBaseURL ? ' · ' + esc(entry.defaultBaseURL) : '') + '</span>' +
          '</button>';
      }
      list.innerHTML = html;
    }
  });

  PAGE.addEventListener('change', function (event) {
    var target = event.target;
    if (!target || !target.getAttribute) return;
    if (target.getAttribute('data-dm-mc-field') === 'provider' && sheet && sheet.kind === 'default') {
      sheet.provider = String(target.value || '');
      var item = providerOf(sheet.provider);
      sheet.model = item && item.models && item.models[0] ? item.models[0].id : '';
      renderSheet();
    }
  });

  function load() {
    var nonce = ++loadNonce;
    loading = true;
    errorText = null;
    setStatus(null, '');
    renderState('读取宿主模型目录…', 'dm-page-loading');
    rpc('mobile.modelsCenter.get').then(function (result) {
      if (nonce !== loadNonce || !opened) return;
      loading = false;
      if (!result || result.ok !== true) {
        errorText = (result && result.error && result.error.message) || '宿主没有返回模型数据';
        renderState('读取失败：' + errorText, 'dm-page-error', true);
        return;
      }
      data = result.value;
      render();
    }).catch(function (err) {
      if (nonce !== loadNonce || !opened) return;
      loading = false;
      errorText = (err && err.message) || String(err);
      renderState('读取失败：' + errorText, 'dm-page-error', true);
    });
  }

  function openModelsPage() {
    if (opened) { load(); return; }
    opened = true;
    showPage(PAGE);
    if (TITLE) TITLE.textContent = '模型';
    try { history.pushState({ dmModels: 1 }, '', '#/dm-models'); } catch (e) {}
    renderState('加载中…', 'dm-page-loading');
    load();
  }

  function closeModelsPage(fromPop) {
    if (!opened) return;
    opened = false;
    sheet = null;
    renderSheet();
    hidePage(PAGE);
    if (!fromPop) { try { history.back(); } catch (e) {} }
  }

  window.addEventListener('popstate', function (event) {
    var stateValue = event && event.state;
    if (opened && (!stateValue || stateValue.dmModels !== 1)) closeModelsPage(true);
  });

  // 只拦「主机配置」组里标题为「模型」的那一行；其它行/其它分组不碰。
  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || !target.closest) return;
    var row = target.closest('.mobile-row');
    if (!row) return;
    var group = row.closest('.settings-group');
    if (!group) return;
    var groupTitle = group.querySelector('.settings-groupTitle');
    if (!groupTitle || String(groupTitle.textContent || '').indexOf(GROUP_TITLE) !== 0) return;
    var titleEl = row.querySelector('.card-titleText');
    if (String(titleEl && titleEl.textContent ? titleEl.textContent : '').trim() !== KEEP_ROW) return;
    event.preventDefault();
    event.stopPropagation();
    openModelsPage();
  }, true);

  window.__dmModelsPage = {
    open: openModelsPage,
    close: closeModelsPage,
    refresh: load,
    state: function () {
      return {
        opened: opened,
        loading: loading,
        error: errorText,
        hideHits: hideHits,
        sheet: sheet ? { kind: sheet.kind, route: sheet.route || null, mode: sheet.mode || null, error: sheet.error || null } : null,
        visibleRows: (function () {
          var group = settingsGroup();
          if (!group) return null;
          var out = [];
          var rows = group.querySelectorAll(':scope > li');
          for (var i = 0; i < rows.length; i++) {
            var button = rows[i].querySelector('.mobile-row');
            if (!button) continue;
            if (rows[i].style.display === 'none') continue;
            var titleEl = button.querySelector('.mobile-row .card-titleText') || button.querySelector('.card-titleText');
            out.push(String(titleEl && titleEl.textContent ? titleEl.textContent : '').trim());
          }
          return out;
        })(),
        data: data ? { available: data.available, counts: data.counts, account: data.account, defaultModel: data.defaultModel } : null,
      };
    },
  };
})();
</script>`
