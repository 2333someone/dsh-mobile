/**
 * 迁移 A：1:1 搬自宿主 index.js 的 `BUILTIN_CONFIG_HTML` 注入字符串。
 * 内置插件配置四页（子智能体 / 网页搜索 / Agent 循环 / 终端）。
 *
 * 只搬位置、不改写：内容仍是当年的 HTML + 内联脚本，由
 * `dm-pages/index.ts` 在 bundle 启动时按原顺序安装到 document。
 */
// ── 内置插件配置页（插件 → 子智能体 / 网页搜索 / 终端）────────────────────
// 桌面这三页在宿主侧只用三个服务：@deepseek-ai/dsh-settings（describe/mutate，
// 内部走 configEditor.edit() → 正常 Loader 应用）、@deepseek-ai/dsh-credentials
// （API Key 只写不读明文）、@deepseek-ai/dsh-llm（模型候选）。
// 这里的脚本只做「渲染 / 暂存 / 提交 / 按宿主回读重绘」：
//   · 初始值、默认值、override 状态全部来自 /m/api/mobile.builtinConfig.get；
//   · 保存失败时用宿主回传的最新状态整页重绘（= 回滚），并显示宿主原文；
//   · API Key 只有一个密码输入框，永远不回填、不显示明文，只显示已配置/未配置。
export const BUILTIN_CONFIG_HTML = `<script>
(function () {
  'use strict';

  // ── 内置插件配置页（子智能体 / 网页搜索 / 终端）────────────────────────────
  // 数据全部来自宿主：/m/api/mobile.builtinConfig.* 三个方法内部读
  // @deepseek-ai/dsh-settings 的 describe()（已脱敏）+ credentials.describe()。
  // 本脚本只做「渲染 / 暂存 / 提交 / 按宿主回读重绘」，不缓存任何默认值；
  // 保存失败时用宿主返回的最新状态整页重绘（= 回滚），并显示宿主原文。
  var PAGE_EL = document.getElementById('dm-page-cfg');
  if (!PAGE_EL) return;
  var BODY_EL = PAGE_EL.querySelector('[data-dm-cfg-body]');
  var TITLE_EL = PAGE_EL.querySelector('[data-dm-cfg-title]');

  var SAVE_IDLE = '保存';
  var SAVE_BUSY = '保存中…';
  var MODEL_HINT = '至少选择一个模型。已保存但当前不可用的模型仍会保留，也可以移除。';

  var openKey = null;      // 当前打开的配置页 key
  var payload = null;      // 宿主导出的页面数据（唯一真值来源）
  var stagedMode = null;   // 网页搜索：暂存的开关位置 'api' | 'messages'
  var stagedFields = {};   // ns|key -> 输入框文本（开关切走的那一组也不丢草稿）
  var stagedModels = null; // 模型 key -> true
  var stagedEnabled = null;// 模型选择开关的暂存值
  var resetFields = {};    // ns|key -> true（点了「恢复默认」，保存时发 unset）
  var saving = false;
  var status = null;       // { kind: 'ok' | 'err' | 'info', text }
  var loadNonce = 0;

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function rpc(method, body) {
    return fetch('/m/api/' + method, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rpcId: 'dm-cfg-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        payload: body || {}
      })
    }).then(function (res) {
      return res.json().catch(function () { return null; });
    }).then(function (json) {
      if (!json || !json.result) throw new Error('宿主没有返回 RPC 结果（连接可能因插件重载中断）');
      return json.result;
    });
  }

  function dataKey(ns, key) { return String(ns) + '|' + String(key); }
  function modelKey(route) { return String(route.provider) + '|' + String(route.model); }

  function sectionOf(ns) {
    if (!payload || !Array.isArray(payload.sections)) return null;
    for (var i = 0; i < payload.sections.length; i++) {
      if (payload.sections[i].ns === ns) return payload.sections[i];
    }
    return null;
  }

  function fieldOf(ns, key) {
    var section = sectionOf(ns);
    if (!section || !Array.isArray(section.fields)) return null;
    for (var i = 0; i < section.fields.length; i++) {
      if (section.fields[i].key === key) return section.fields[i];
    }
    return null;
  }

  function defaultText(field) {
    if (!field) return '';
    var value = field.value;
    if (value === null || value === undefined) return '';
    return String(value);
  }

  function inputText(ns, key) {
    var keyText = dataKey(ns, key);
    if (Object.prototype.hasOwnProperty.call(stagedFields, keyText)) return stagedFields[keyText];
    return defaultText(fieldOf(ns, key));
  }

  function overlayFields() {
    var inputs = BODY_EL.querySelectorAll('[data-dm-cfg-input]');
    for (var i = 0; i < inputs.length; i++) {
      stagedFields[inputs[i].getAttribute('data-dm-cfg-input')] = inputs[i].value;
    }
  }

  // ── 类型解析（宿主端 builtinCoerce 是最终裁决；这里只做即时提示）──────────
  function parseField(field, text) {
    if (!field) return { kind: 'skip' };
    var trimmed = String(text == null ? '' : text).trim();
    if (field.kind === 'int') {
      if (trimmed === '') return { kind: 'unset' };
      if (!/^-?(0|[1-9][0-9]*)$/.test(trimmed)) return { kind: 'invalid', message: field.invalid || '请输入整数。' };
      var num = Number(trimmed);
      if (!isFinite(num) || Math.floor(num) !== num) return { kind: 'invalid', message: field.invalid || '请输入整数。' };
      if (typeof field.min === 'number' && num < field.min) return { kind: 'invalid', message: field.invalid || ('不能小于 ' + field.min + '。') };
      if (typeof field.max === 'number' && num > field.max) return { kind: 'invalid', message: field.invalid || ('不能大于 ' + field.max + '。') };
      return { kind: 'set', value: num };
    }
    if (field.kind === 'text') {
      if (trimmed === '') return { kind: 'unset' };
      return { kind: 'set', value: String(text) };
    }
    return { kind: 'skip' };
  }

  function sameValue(left, right) {
    return JSON.stringify(left === undefined ? null : left) === JSON.stringify(right === undefined ? null : right);
  }

  // ── 渲染 ────────────────────────────────────────────────────────────────
  function renderState(text, cls) {
    BODY_EL.innerHTML = '<div class="dm-page-state ' + (cls || '') + '">' +
      '<p class="dm-page-stateText">' + esc(text) + '</p>' +
      '<button class="dm-page-retry" type="button" data-dm-cfg-retry="1">重试</button>' +
      '</div>';
  }

  function overrideBadge(field, keyText) {
    if (!field || !field.overridden) return '';
    return '<span class="dm-cfg-badge">已覆盖</span>' +
      '<button class="dm-cfg-reset" type="button" data-dm-cfg-reset="' + esc(keyText) + '">恢复默认</button>';
  }

  function fieldHtml(section, field) {
    var keyText = dataKey(section.ns, field.key);
    var id = 'dm-cfg-' + String(section.ns).replace(/[^a-zA-Z0-9_-]/g, '-') + '-' + String(field.key).replace(/[^a-zA-Z0-9_-]/g, '-');
    var text = inputText(section.ns, field.key);
    var reset = resetFields[keyText] === true;
    return '<div class="dm-cfg-field" data-dm-cfg-field="' + esc(keyText) + '">' +
      '<div class="dm-cfg-labelRow">' +
        '<label class="dm-cfg-label" for="' + esc(id) + '">' + esc(field.label) + '</label>' +
        overrideBadge(field, keyText) +
      '</div>' +
      '<input id="' + esc(id) + '" class="dm-cfg-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false"' +
        ' inputmode="' + (field.kind === 'int' ? 'numeric' : 'text') + '"' +
        ' value="' + esc(text) + '" data-dm-cfg-input="' + esc(keyText) + '">' +
      (field.hint ? '<p class="dm-cfg-hint">' + esc(field.hint) + '</p>' : '') +
      (reset ? '<p class="dm-cfg-hint dm-cfg-resetHint">保存后该字段回到继承的默认值（删除 override）。</p>' : '') +
      '<p class="dm-cfg-invalid" hidden></p>' +
      '</div>';
  }

  function switchHtml() {
    var info = payload.webSearch && payload.webSearch.switch;
    if (!info) return '';
    var on = stagedMode === 'api';
    return '<div class="dm-cfg-field dm-cfg-switchRow">' +
      '<div class="dm-cfg-labelRow">' +
        '<span class="dm-cfg-label">' + esc(info.label) + '</span>' +
        (info.overridden ? '<span class="dm-cfg-badge">已覆盖</span>' : '') +
        '<label class="dm-cfg-toggle"><input type="checkbox" data-dm-cfg-switch="1"' + (on ? ' checked' : '') + '>' +
          '<span class="dm-cfg-track" aria-hidden="true"></span></label>' +
      '</div>' +
      '<p class="dm-cfg-hint">' + esc(info.hint) +
        (info.link ? ' <a class="dm-cfg-link" href="' + esc(info.link) + '" target="_blank" rel="noopener noreferrer">' + esc(info.linkLabel || info.link) + '</a>' : '') +
      '</p>' +
      '<p class="dm-cfg-hint">切换后基础地址与次数上限会换成对应接口的字段；保存时先写接口参数、最后写开关。</p>' +
      '</div>';
  }

  function apiKeyHtml() {
    var info = payload.webSearch && payload.webSearch.apiKey;
    if (!info || info.available !== true) {
      return '<div class="dm-cfg-field">' +
        '<div class="dm-cfg-labelRow"><span class="dm-cfg-label">API Key</span>' +
          '<span class="dm-cfg-badge is-off">不可用</span></div>' +
        '<p class="dm-cfg-hint">宿主的凭据服务不可用，暂时无法读取或写入密钥。</p></div>';
    }
    return '<div class="dm-cfg-field">' +
      '<div class="dm-cfg-labelRow"><span class="dm-cfg-label">API Key</span>' +
        '<span class="dm-cfg-badge ' + (info.configured ? 'is-on' : 'is-off') + '">' + (info.configured ? '已配置' : '未配置') + '</span></div>' +
      '<input class="dm-cfg-input" type="password" autocomplete="new-password" autocapitalize="off" spellcheck="false"' +
        ' value="" placeholder="' + (info.configured ? '已配置；留空表示保持当前密钥' : '填写 API Key') + '"' +
        ' data-dm-cfg-apikey="1"' + (info.writable ? '' : ' disabled') + '>' +
      '<p class="dm-cfg-hint">只写宿主凭据库（引用 ' + esc(info.ref) + '），不写入设置文件；密钥不会回显，留空表示不修改。</p>' +
      '</div>';
  }

  function modelsHtml() {
    var info = payload.models;
    var section = sectionOf('subagent-model-selection-settings');
    if (!info || info.available !== true) {
      return '<div class="dm-cfg-section"><h2 class="dm-cfg-sectionTitle">模型选择</h2>' +
        '<p class="dm-cfg-hint">宿主的 llm 服务不可用，无法读取模型清单。</p></div>';
    }
    var enabledField = fieldOf('subagent-model-selection-settings', 'enabled');
    var enabled = stagedEnabled !== null ? stagedEnabled : (enabledField && enabledField.value === true);
    var selected = stagedModels || {};
    var groups = Array.isArray(info.groups) ? info.groups : [];
    var known = {};
    var html = '';
    for (var i = 0; i < groups.length; i++) {
      var group = groups[i] || {};
      var models = Array.isArray(group.models) ? group.models : [];
      if (models.length === 0) continue;
      html += '<div class="dm-cfg-modelGroup"><p class="dm-cfg-provider">' + esc(group.name || group.id) + '</p>';
      for (var j = 0; j < models.length; j++) {
        var model = models[j] || {};
        var keyText = modelKey({ provider: group.id, model: model.id });
        known[keyText] = true;
        html += '<label class="dm-cfg-model"><input type="checkbox" data-dm-cfg-model="' + esc(keyText) + '"' +
          (selected[keyText] ? ' checked' : '') + (enabled ? '' : ' disabled') + '>' +
          '<span class="dm-cfg-modelText"><span class="dm-cfg-modelName">' + esc(model.name || model.id) + '</span>' +
          '<span class="dm-cfg-modelRoute">' + esc(group.name || group.id) + ' · ' + esc(group.id) + '/' + esc(model.id) + '</span></span></label>';
      }
      html += '</div>';
    }
    var missing = [];
    for (var k in selected) if (selected[k] && !known[k]) missing.push(k);
    if (missing.length > 0) {
      html += '<div class="dm-cfg-modelGroup"><p class="dm-cfg-provider">已保存但当前不可用</p>';
      for (var m = 0; m < missing.length; m++) {
        var parts = missing[m].split('|');
        html += '<label class="dm-cfg-model"><input type="checkbox" data-dm-cfg-model="' + esc(missing[m]) + '" checked' +
          (enabled ? '' : ' disabled') + '>' +
          '<span class="dm-cfg-modelText"><span class="dm-cfg-modelName">' + esc(parts[1]) + '</span>' +
          '<span class="dm-cfg-modelRoute">' + esc(parts[0]) + ' · 当前不可用</span></span></label>';
      }
      html += '</div>';
    }
    if (Array.isArray(info.failures) && info.failures.length > 0) {
      var names = [];
      for (var f = 0; f < info.failures.length; f++) {
        var failure = info.failures[f] || {};
        names.push(String(failure.name || failure.id || '') + '：' + String(failure.message || '读取失败'));
      }
      html += '<p class="dm-cfg-hint dm-cfg-warn">部分模型提供方读取失败（' + esc(names.join('；')) + '）。</p>';
    }
    if (html === '') html = '<p class="dm-cfg-hint">当前没有模型提供方公布模型。</p>';

    return '<div class="dm-cfg-section">' +
      '<h2 class="dm-cfg-sectionTitle">' + esc(section && section.title ? section.title : '模型选择') + '</h2>' +
      '<div class="dm-cfg-field dm-cfg-switchRow">' +
        '<div class="dm-cfg-labelRow">' +
          '<label class="dm-cfg-label" for="dm-cfg-model-enabled">允许 Agent 为子智能体选择模型</label>' +
          (enabledField && enabledField.overridden ? '<span class="dm-cfg-badge">已覆盖</span>' : '') +
          '<label class="dm-cfg-toggle"><input id="dm-cfg-model-enabled" type="checkbox" data-dm-cfg-models-on="1"' + (enabled ? ' checked' : '') + '>' +
            '<span class="dm-cfg-track" aria-hidden="true"></span></label>' +
        '</div>' +
        '<p class="dm-cfg-hint">开启后，Agent 可以从下方授权模型中，为每个子智能体选择提供方、模型和推理强度。仅影响新会话。</p>' +
        (enabled ? '' : '<p class="dm-cfg-hint dm-cfg-offHint">当前关闭：子智能体使用配置的默认模型或继承父 Agent 的模型；已选模型会保留。</p>') +
      '</div>' +
      '<div class="dm-cfg-field">' +
        '<div class="dm-cfg-labelRow"><span class="dm-cfg-label">Agent 可选择的模型</span>' +
          '<span class="dm-cfg-badge is-off" data-dm-cfg-modelcount="1">已选 ' + countSelected(selected) + ' 个</span></div>' +
        '<div class="dm-cfg-models">' + html + '</div>' +
        '<p class="dm-cfg-hint">' + esc(MODEL_HINT) + '</p>' +
        '<p class="dm-cfg-invalid" data-dm-cfg-modelinvalid="1" hidden></p>' +
      '</div></div>';
  }

  function countSelected(selected) {
    var count = 0;
    for (var keyText in selected) if (selected[keyText]) count += 1;
    return count;
  }

  function render() {
    if (!payload) return;
    var html = '';
    var sections = Array.isArray(payload.sections) ? payload.sections : [];
    if (payload.description) html += '<p class="dm-cfg-desc">' + esc(payload.description) + '</p>';
    if (payload.key === 'web-search') {
      html += switchHtml() + apiKeyHtml();
      // 当前生效的接口段由「暂存的开关位置」决定，而不是宿主加载时的 activeNs ——
      // 用户刚切换开关时 payload 还是旧模式，用 activeNs 会把字段留在另一组。
      var active = null;
      for (var a = 0; a < sections.length; a++) {
        if (sections[a].kind === stagedMode) { active = sections[a]; break; }
      }
      if (!active && payload.webSearch && payload.webSearch.activeNs) active = sectionOf(payload.webSearch.activeNs);
      if (active) {
        html += '<div class="dm-cfg-section">' +
          '<h2 class="dm-cfg-sectionTitle">' + (stagedMode === 'api' ? 'Web 搜索 / 抓取 API' : 'DeepSeek Messages') + '</h2>';
        for (var i = 0; i < active.fields.length; i++) {
          if (active.fields[i].hidden) continue;
          html += fieldHtml(active, active.fields[i]);
        }
        html += '</div>';
      } else {
        html += '<div class="dm-cfg-section"><p class="dm-cfg-hint">宿主没有提供所选接口的配置段。</p></div>';
      }
    } else {
      for (var j = 0; j < sections.length; j++) {
        var section = sections[j];
        if (payload.key === 'subagent' && section.ns === 'subagent-model-selection-settings') continue;
        var visible = [];
        for (var k = 0; k < section.fields.length; k++) if (!section.fields[k].hidden) visible.push(section.fields[k]);
        if (visible.length === 0) continue;
        html += '<div class="dm-cfg-section">';
        if (section.title) html += '<h2 class="dm-cfg-sectionTitle">' + esc(section.title) + '</h2>';
        for (var n = 0; n < visible.length; n++) html += fieldHtml(section, visible[n]);
        html += '</div>';
      }
      if (payload.key === 'subagent') html += modelsHtml();
    }
    html += '<p class="dm-cfg-footnote">保存会写入 profile 的 cordis.patch.yml，并走宿主正常 Loader 路径应用；' +
      '插件可能因此重载，本页会在保存后重新读取宿主状态。</p>';
    html += '<div class="dm-cfg-footer">' +
      '<button class="dm-cfg-save" type="button" data-dm-cfg-save="1" disabled>' + SAVE_IDLE + '</button>' +
      '<p class="dm-cfg-status" data-dm-cfg-status="1"></p>' +
      '</div>';
    BODY_EL.innerHTML = html;
    renderStatus();
    refreshDirty();
  }

  function renderStatus() {
    var el = BODY_EL.querySelector('[data-dm-cfg-status]');
    if (!el) return;
    if (!status) { el.textContent = ''; el.className = 'dm-cfg-status'; return; }
    el.textContent = status.text;
    el.className = 'dm-cfg-status is-' + status.kind;
  }

  function setStatus(kind, text) {
    status = text ? { kind: kind, text: text } : null;
    renderStatus();
  }

  // ── 收集改动：返回 { ops, apiKey, invalid } ─────────────────────────────
  function collect() {
    var result = { ops: [], apiKey: null, invalid: null };
    if (!payload) return result;
    var byNs = {};
    function bucket(ns) {
      if (!byNs[ns]) {
        var section = sectionOf(ns);
        // expect：客户端读到的原始值。宿主写前逐个比对它来做并发保护 ——
        // pwsh-sandbox 这类含 !!js 的 entry 的 revision 会在宿主自己的 reconcile 里
        // 每写一次 +2，无法当并发令牌用（详见宿主端 mobile.builtinConfig.save 注释）。
        byNs[ns] = { ns: ns, expect: {}, sets: [], unsets: [] };
        result.ops.push(byNs[ns]);
      }
      return byNs[ns];
    }
    function remember(target, key, value) {
      target.expect[key] = value === undefined ? null : value;
    }
    function markField(target, field) {
      // 字段从 payload 来，field.value 就是这一页读到的宿主值。
      remember(target, field.key, field.value);
    }

    var sections = Array.isArray(payload.sections) ? payload.sections : [];
    for (var i = 0; i < sections.length; i++) {
      var section = sections[i];
      if (payload.key === 'web-search' && section.ns === 'web') continue;              // 开关单独处理
      if (payload.key === 'subagent' && section.ns === 'subagent-model-selection-settings') continue; // 模型单独处理
      for (var j = 0; j < section.fields.length; j++) {
        var field = section.fields[j];
        if (field.hidden) continue;
        var keyText = dataKey(section.ns, field.key);
        var target = bucket(section.ns);
        if (resetFields[keyText]) {
          // 「恢复默认」= 删除 override（不是把默认值写进 profile）。
          // settings.mutate 的 unset 会回落到继承层值，configEditor.edit 再把「与继承层
          // 相同」的字段从 patch 行里删掉 —— 与桌面 resetField 同一语义。
          markField(target, field);
          target.unsets.push({ path: [field.key] });
          continue;
        }
        var parsed = parseField(field, inputText(section.ns, field.key));
        if (parsed.kind === 'invalid') { result.invalid = parsed.message; return result; }
        if (parsed.kind === 'unset') {
          if (field.overridden) { markField(target, field); target.unsets.push({ path: [field.key] }); }
          continue;
        }
        if (parsed.kind === 'set' && !sameValue(parsed.value, field.value)) {
          markField(target, field);
          target.sets.push({ path: [field.key], value: parsed.value });
        }
      }
    }

    if (payload.key === 'subagent') {
      var sel = stagedModels || {};
      var allowedField = fieldOf('subagent-model-selection-settings', 'allowedModels');
      var stored = allowedField && Array.isArray(allowedField.value) ? allowedField.value : [];
      var baseline = {};
      for (var s = 0; s < stored.length; s++) baseline[modelKey(stored[s])] = true;
      var desired = [];
      for (var modelId in sel) {
        if (!sel[modelId]) continue;
        var parts = modelId.split('|');
        desired.push({ provider: parts[0], model: parts.slice(1).join('|') });
      }
      var enabledField = fieldOf('subagent-model-selection-settings', 'enabled');
      var enabledNow = !!(stagedEnabled !== null ? stagedEnabled : (enabledField && enabledField.value === true));
      if (enabledNow && desired.length === 0) { result.invalid = '保存前请至少选择一个模型。'; return result; }
      var modelsDirty = Object.keys(sel).length !== Object.keys(baseline).length ||
        Object.keys(sel).some(function (key) { return !baseline[key]; });
      var enabledDirty = enabledField ? enabledNow !== (enabledField.value === true) : false;
      if (modelsDirty || enabledDirty) {
        var modelTarget = bucket('subagent-model-selection-settings');
        if (enabledDirty) {
          remember(modelTarget, 'enabled', enabledField ? enabledField.value : null);
          modelTarget.sets.push({ path: ['enabled'], value: enabledNow });
        }
        if (modelsDirty) {
          remember(modelTarget, 'allowedModels', allowedField ? allowedField.value : []);
          if (desired.length === 0 && !enabledNow) modelTarget.unsets.push({ path: ['allowedModels'] });
          else modelTarget.sets.push({ path: ['allowedModels'], value: desired });
        }
      }
    }

    if (payload.key === 'web-search' && payload.webSearch && payload.webSearch.switch) {
      var info = payload.webSearch.switch;
      var wantApi = stagedMode === 'api';
      if (wantApi !== (payload.webSearch.mode === 'api')) {
        var webTarget = bucket(info.ns);
        var target = wantApi ? info.on : info.off;
        var names = ['searchProvider', 'fetchProvider'];
        for (var f = 0; f < names.length; f++) {
          var name = names[f];
          var webField = fieldOf(info.ns, name);
          remember(webTarget, name, webField ? webField.value : null);
          if (info.base && info.base[name] === target[name]) webTarget.unsets.push({ path: [name] });
          else webTarget.sets.push({ path: [name], value: target[name] });
        }
      }
    }

    var kept = [];
    for (var o = 0; o < result.ops.length; o++) {
      if (result.ops[o].sets.length > 0 || result.ops[o].unsets.length > 0) kept.push(result.ops[o]);
    }
    result.ops = kept;

    var keyInput = BODY_EL.querySelector('[data-dm-cfg-apikey]');
    if (keyInput && keyInput.value !== '' && payload.webSearch && payload.webSearch.apiKey && payload.webSearch.apiKey.available) {
      result.apiKey = { ref: payload.webSearch.apiKey.ref, value: keyInput.value };
    }
    return result;
  }

  function refreshDirty() {
    if (!payload) return;
    var button = BODY_EL.querySelector('[data-dm-cfg-save]');
    if (!button) return;
    var collected = collect();
    var dirty = collected.ops.length > 0 || collected.apiKey !== null;
    button.disabled = saving || collected.invalid !== null || !dirty;
    button.textContent = saving ? SAVE_BUSY : SAVE_IDLE;

    var sections = Array.isArray(payload.sections) ? payload.sections : [];
    for (var i = 0; i < sections.length; i++) {
      var section = sections[i];
      for (var j = 0; j < section.fields.length; j++) {
        var field = section.fields[j];
        if (field.hidden) continue;
        var keyText = dataKey(section.ns, field.key);
        var wraps = BODY_EL.querySelectorAll('[data-dm-cfg-field]');
        var wrap = null;
        for (var w = 0; w < wraps.length; w++) {
          if (wraps[w].getAttribute('data-dm-cfg-field') === keyText) { wrap = wraps[w]; break; }
        }
        if (!wrap) continue;
        var box = wrap.querySelector('.dm-cfg-invalid');
        if (!box) continue;
        var parsed = resetFields[keyText] ? { kind: 'ok' } : parseField(field, inputText(section.ns, field.key));
        if (parsed.kind === 'invalid') { box.textContent = parsed.message; box.hidden = false; wrap.classList.add('is-invalid'); }
        else { box.textContent = ''; box.hidden = true; wrap.classList.remove('is-invalid'); }
      }
    }
    var modelBox = BODY_EL.querySelector('[data-dm-cfg-modelinvalid]');
    if (modelBox) {
      if (collected.invalid === '保存前请至少选择一个模型。') { modelBox.textContent = collected.invalid; modelBox.hidden = false; }
      else { modelBox.textContent = ''; modelBox.hidden = true; }
    }
  }

  // ── 打开 / 加载 / 关闭 / 保存 ───────────────────────────────────────────
  function resetStaging() {
    stagedMode = null;
    stagedFields = {};
    stagedModels = null;
    stagedEnabled = null;
    resetFields = {};
    status = null;
  }

  function applyPayload(next) {
    payload = next;
    stagedFields = {};
    resetFields = {};
    if (payload && payload.key === 'web-search' && payload.webSearch) {
      stagedMode = payload.webSearch.mode === 'api' ? 'api' : 'messages';
    } else {
      stagedMode = null;
    }
    if (payload && payload.key === 'subagent') {
      var allowed = fieldOf('subagent-model-selection-settings', 'allowedModels');
      var stored = allowed && Array.isArray(allowed.value) ? allowed.value : [];
      stagedModels = {};
      for (var i = 0; i < stored.length; i++) stagedModels[modelKey(stored[i])] = true;
      var enabled = fieldOf('subagent-model-selection-settings', 'enabled');
      stagedEnabled = enabled ? enabled.value === true : false;
    } else {
      stagedModels = null;
      stagedEnabled = null;
    }
    if (TITLE_EL) TITLE_EL.textContent = payload && payload.title ? payload.title : '内置插件配置';
  }

  function open(key) {
    if (!key) return;
    if (openKey === key) { load(key); return; }
    openKey = key;
    payload = null;
    resetStaging();
    PAGE_EL.hidden = false;
    try { history.pushState({ dmBuiltinConfig: key }, '', '#/dm-config/' + key); } catch (e) {}
    if (TITLE_EL) TITLE_EL.textContent = '加载中…';
    renderState('加载中…', 'dm-page-loading');
    load(key);
  }

  function close(fromPop) {
    if (openKey === null) return;
    openKey = null;
    payload = null;
    resetStaging();
    PAGE_EL.hidden = true;
    if (!fromPop) { try { history.back(); } catch (e) {} }
  }

  function load(key) {
    var nonce = ++loadNonce;
    rpc('mobile.builtinConfig.get', { page: key }).then(function (result) {
      if (nonce !== loadNonce || openKey !== key) return;
      if (!result || result.ok !== true) {
        renderState('读取失败：' + ((result && result.error && result.error.message) || '宿主没有返回有效数据'), 'dm-page-error');
        return;
      }
      applyPayload(result.value);
      render();
    }).catch(function (error) {
      if (nonce !== loadNonce || openKey !== key) return;
      renderState('读取失败：' + ((error && error.message) || String(error)), 'dm-page-error');
    });
  }

  // 写配置会触发 Loader 应用：本插件的 HTTP server 可能在写入落盘后立刻被重建，
  // 于是这次请求的连接被断开（fetch 报 network error），但宿主其实已经写入。
  // 所以连接断了不能直接判失败：重取宿主状态，按「目标值是否真的落地」判定。
  function refetchPage(key, attempt) {
    var tries = attempt || 0;
    return rpc('mobile.builtinConfig.get', { page: key }).then(function (result) {
      if (result && result.ok === true) return result.value;
      return null;
    }).catch(function () {
      if (tries >= 9) return null;
      return new Promise(function (resolve) { setTimeout(resolve, 700); }).then(function () {
        return refetchPage(key, tries + 1);
      });
    });
  }

  function pageSection(pageData, ns) {
    var list = pageData && Array.isArray(pageData.sections) ? pageData.sections : [];
    for (var i = 0; i < list.length; i++) if (list[i].ns === ns) return list[i];
    return null;
  }

  function pageField(pageData, ns, key) {
    var section = pageSection(pageData, ns);
    var fields = section && Array.isArray(section.fields) ? section.fields : [];
    for (var i = 0; i < fields.length; i++) if (fields[i].key === key) return fields[i];
    return null;
  }

  function intentLanded(pageData, ops, apiKey) {
    for (var i = 0; i < ops.length; i++) {
      var plan = ops[i];
      var section = pageSection(pageData, plan.ns);
      if (!section) return false;
      for (var j = 0; j < plan.sets.length; j++) {
        var field = pageField(pageData, plan.ns, plan.sets[j].path[0]);
        if (!field || JSON.stringify(field.value) !== JSON.stringify(plan.sets[j].value)) return false;
      }
      for (var k = 0; k < plan.unsets.length; k++) {
        var unsetField = pageField(pageData, plan.ns, plan.unsets[k].path[0]);
        if (!unsetField || unsetField.overridden !== false) return false;
      }
    }
    if (apiKey) {
      var info = pageData && pageData.webSearch ? pageData.webSearch.apiKey : null;
      if (!info || info.configured !== true) return false;
    }
    return true;
  }

  function save() {
    if (saving || !payload) return;
    var collected = collect();
    if (collected.invalid) { setStatus('err', collected.invalid); return; }
    if (collected.ops.length === 0 && collected.apiKey === null) return;
    var pageKey = payload.key;
    saving = true;
    setStatus('info', '保存中…（写入会走宿主 Loader 应用，插件可能短暂重载）');
    refreshDirty();
    var body = { page: pageKey, sections: collected.ops };
    if (collected.apiKey) body.apiKey = collected.apiKey;
    rpc('mobile.builtinConfig.save', body).then(function (result) {
      saving = false;
      if (!result || result.ok !== true) {
        var error = (result && result.error) || { code: 'unknown', message: '宿主没有返回保存结果' };
        // 失败回滚：宿主把最新状态放在 value.page，按它整页重绘；草稿丢弃。
        if (result && result.value && result.value.page) {
          applyPayload(result.value.page);
          render();
        } else {
          refreshDirty();
        }
        if (error.code === 'settings_conflict') {
          setStatus('err', '设置已在其他位置更新，本次没有覆盖，表单已按宿主最新值回滚：' + error.message);
        } else {
          setStatus('err', '保存失败（表单已按宿主最新值回滚）：' + error.message);
        }
        return;
      }
      applyPayload(result.value.page);
      render();
      if (Array.isArray(result.value.mismatches) && result.value.mismatches.length > 0) {
        var names = result.value.mismatches.map(function (item) { return (item.path && item.path.join('.')) || item.ns; });
        setStatus('err', '已提交，但宿主回读不一致（' + names.join('、') + '）：可能被上层配置覆盖。');
        return;
      }
      setStatus('ok', '已保存并应用到宿主（回读已确认）。');
    }).catch(function () {
      // 连接被重载打断：以宿主回读为准，而不是把「网络错误」当失败。
      refetchPage(pageKey).then(function (fresh) {
        saving = false;
        if (!fresh) {
          refreshDirty();
          setStatus('err', '保存结果未知：写入时连接中断（插件重载），且暂时读不到宿主状态。请稍后点右上角刷新确认。');
          return;
        }
        applyPayload(fresh);
        render();
        if (intentLanded(fresh, collected.ops, collected.apiKey)) {
          setStatus('ok', '已保存并应用到宿主（写入时插件重载、连接中断一次；回读已确认）。');
          return;
        }
        setStatus('err', '保存未落地：宿主在写入时重载、连接中断，回读仍看不到新值。请重试。');
      });
    });
  }

  // ── 事件（全部委托，重绘后无需重绑）──────────────────────────────────
  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || !target.closest) return;
    var opener = target.closest('[data-dm-cfg-open]');
    if (opener) { event.preventDefault(); open(opener.getAttribute('data-dm-cfg-open')); return; }
    if (target.closest('[data-dm-cfg-back]')) { event.preventDefault(); close(false); return; }
    if (target.closest('[data-dm-cfg-refresh]')) {
      event.preventDefault();
      if (openKey) { renderState('刷新中…', 'dm-page-loading'); load(openKey); }
      return;
    }
    var reset = target.closest('[data-dm-cfg-reset]');
    if (reset) {
      event.preventDefault();
      overlayFields();
      var resetKey = reset.getAttribute('data-dm-cfg-reset');
      if (resetFields[resetKey]) delete resetFields[resetKey];
      else resetFields[resetKey] = true;
      render();
      return;
    }
    if (target.closest('[data-dm-cfg-save]')) { event.preventDefault(); save(); return; }
    if (target.closest('[data-dm-cfg-retry]')) { event.preventDefault(); if (openKey) load(openKey); }
  });

  document.addEventListener('input', function (event) {
    var target = event.target;
    if (!target || !target.getAttribute) return;
    if (target.getAttribute('data-dm-cfg-input') !== null) {
      var keyText = target.getAttribute('data-dm-cfg-input');
      stagedFields[keyText] = target.value;
      if (resetFields[keyText]) delete resetFields[keyText];
      refreshDirty();
      return;
    }
    if (target.getAttribute('data-dm-cfg-apikey') !== null) refreshDirty();
  });

  document.addEventListener('change', function (event) {
    var target = event.target;
    if (!target || !target.getAttribute) return;
    if (target.getAttribute('data-dm-cfg-switch') !== null) {
      overlayFields();
      stagedMode = target.checked ? 'api' : 'messages';
      render();
      return;
    }
    if (target.getAttribute('data-dm-cfg-models-on') !== null) {
      overlayFields();
      stagedEnabled = target.checked;
      render();
      return;
    }
    if (target.getAttribute('data-dm-cfg-model') !== null) {
      var keyText = target.getAttribute('data-dm-cfg-model');
      if (!stagedModels) stagedModels = {};
      if (target.checked) stagedModels[keyText] = true;
      else delete stagedModels[keyText];
      render();
    }
  });

  window.addEventListener('popstate', function (event) {
    var stateValue = event && event.state;
    if (openKey !== null && (!stateValue || stateValue.dmBuiltinConfig !== openKey)) close(true);
  });

  // 插件页的行也可以直接调这个入口（两条路都通）
  window.__dmOpenBuiltinConfig = open;
})();
</script>`
