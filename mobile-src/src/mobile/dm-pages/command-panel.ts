import { ICONS, iconParts, type IconName } from '../design/icons.tsx'

/**
 * 迁移 A：1:1 搬自宿主 index.js 的 `COMMAND_PANEL_HTML` 注入字符串。
 * 工具栏「/」命令面板：宿主命令 + 本机动作 + 技能组。
 *
 * 只搬位置、不改写：内容仍是当年的 HTML + 内联脚本，由
 * `dm-pages/index.ts` 在 bundle 启动时按原顺序安装到 document。
 */
/**
 * 命令面板的图标：
 *   · 宿主命令 9 条（添加 / 指令）带图标，全部来自 `design/icons.tsx`（唯一图标源），
 *     这里只做「名字 → catalog 键」的映射（**不在这里画任何形状**）：
 *     file/goal/plan/feedback/compact/permission/model/export 与桌面 ui-commands 的
 *     HOST_FACES 一一对应；orchestrate 桌面没有 → catalog 里是本仓库自绘项
 *     （commandOrchestrate，source 标注 `ours`，风格对齐同组桌面图标）。
 *   · 技能行**不渲染图标**（用户拍板「严格照桌面」）：桌面 `/` 菜单的技能候选只有
 *     名称 + 描述，ui-skill 的 candidates 不带图标字段。技能行的文字通过
 *     `.dm-cmd-row-noicon` 的左侧缩进与命令行文字对齐，不生成空的图标占位元素。
 */
type IconKey = IconName

const ICON_CATALOG: Readonly<Record<string, IconKey>> = {
  // 宿主命令 / 本机动作（与桌面命令 face 同名）；技能行没有图标，不在此表。
  file: 'commandFile',
  goal: 'commandGoal',
  plan: 'commandPlan',
  feedback: 'commandFeedback',
  compact: 'commandCompact',
  permission: 'commandPermission',
  model: 'commandModel',
  export: 'commandExport',
  orchestrate: 'commandOrchestrate',
}

const CMD_ICON_PARTS: Readonly<Record<string, { vb: string; html: string; sw?: string }>> = (() => {
  const out: Record<string, { vb: string; html: string; sw?: string }> = {}
  for (const [logical, catalogKey] of Object.entries(ICON_CATALOG)) {
    const parts = iconParts(catalogKey)
    // 图标根属性用 camelCase（strokeWidth），兼容 kebab-case 写法。
    const sw = parts.rootAttrs['stroke-width'] ?? parts.rootAttrs.strokeWidth
    out[logical] = { vb: parts.viewBox, html: parts.inner, ...(sw === undefined ? {} : { sw: String(sw) }) }
  }
  return out
})()

/** 逻辑键 → 出处（打印/验收用：包名 + 文件 + 图标键）。 */
const CMD_ICON_SOURCES: Readonly<Record<string, string>> = (() => {
  const out: Record<string, string> = {}
  for (const [logical, catalogKey] of Object.entries(ICON_CATALOG)) {
    const meta = ICONS[catalogKey]
    out[logical] = meta.borrowed === undefined ? meta.source : `${meta.source}（借用：${meta.borrowed}）`
  }
  return out
})()

export const COMMAND_PANEL_HTML = `<button id="dm-cmd-btn" class="dm-tool-btn" type="button" aria-label="命令" title="命令（/）"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.2 4 8.8 20"/></svg></button><script>
(function () {
  try {
    if (window.__dmCommandPanel) return;
    window.__dmCommandPanel = true;
    var btn = document.getElementById('dm-cmd-btn');
    if (!btn) return;

    // 命令面板：数据全部来自宿主命令注册表（RPC：mobile.commands / mobile.commandExec），
    // 这里只做呈现与过滤，不内置任何命令名 —— 宿主没注册的命令不会出现在面板里。
    var panel = null;
    // hostCount / skillCount 分来源计数（DOM 证据用）；items 是合并后的展示列表。
    var state = { items: [], reason: '', skillsReason: '', filter: '', hostCount: 0, skillCount: 0 };
    var lastSessionId = '';

    // 与 MODEL_BUTTON_HTML 同一手法：拦截 RPC 请求，自动记住当前会话 id。
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
      var id = 'dm-cmd-' + Date.now() + '-' + Math.floor(Math.random() * 1e6);
      return fetch('/m/api/' + method, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rpcId: id, payload: payload })
      }).then(function (r) { return r.json(); }).then(function (j) { return j ? j.result : null; });
    }

    function el(tag, cls, text) {
      var n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text !== undefined && text !== null) n.textContent = String(text);
      return n;
    }

    // ── 来源区分：宿主命令 / 本机动作 / 技能 ───────────────────────────────────
    // 桌面的 / 菜单是三类来源合并出来的：
    //   1) 宿主命令注册表（commands.list）
    //   2) client 端 commandUi 贡献：文件（ui-conversation client.js:19694，
    //      kind:"action" → inputHub.pickFiles）、模型（ui-model-selection
    //      client.js:1869，kind:"popupSelect" → 模型目录选择器）
    //   3) skill source（ui-skill client.js:419，skills.list → 插入 /name + 空格）
    // 手机页面没有第 2 类 client 插件，所以「文件」「模型」用手机本机动作等价实现，
    // 行上标「本机」，绝不混进 mobile.commands 的返回（bundle 的「＋」面板也用那份）。
    var LOCAL_ACTIONS = [
      {
        name: 'file', cmdName: '文件', label: '文件', description: '从相册或相机添加', group: '添加', source: 'local',
        keywords: ['附件', '图片', '拍照', '相册', '上传'],
      },
      {
        name: 'model', cmdName: '模型', label: '模型', description: '选择本会话使用的模型', group: '指令', source: 'local',
        keywords: ['切换模型', '模型目录', '思考强度'],
      },
    ];
    // ── 中文文案（命令）：按宿主命令 name 查表，命中才覆盖 ─────────────────────
    // 来源（不是自翻）：桌面 @deepseek-ai/dsh-client-ui-commands/lib/client.js 的
    // zh 字典（label.goal=目标、description.goal=设置或查看长期任务目标、
    // label.plan…、label.export=下载日志 …）；model 来自
    // ui-model-selection 的 command.label/description；file 来自 ui-conversation 的
    // input.file（桌面没有独立描述，手机端用「从相册或相机添加」）。orchestrate 由
    // 动态插件注册、宿主没有中文文案，这里给等价中文。
    // 命令名（斜杠后那串）永远保持英文 —— 宿主只解析 /goal 这种形态；中文只是
    // 标题与说明。未命中的新命令不覆盖，回退宿主英文文案（不隐藏）。
    var COMMAND_ZH = {
      goal: { label: '目标', description: '设置或查看长期任务目标' },
      plan: { label: '计划', description: '进入或退出计划模式' },
      feedback: { label: '反馈', description: '发送关于当前会话的反馈' },
      compact: { label: '压缩', description: '压缩以上对话内容' },
      permission: { label: '权限', description: '切换权限预设（沙箱模式与审批策略）' },
      export: { label: '下载日志', description: '将当前会话内容导出为 ZIP' },
      model: { label: '模型', description: '选择本会话使用的模型' },
      file: { label: '文件', description: '从相册或相机添加' },
      orchestrate: { label: '编排', description: '让本回合进入纯编排模式（可带任务参数；不带参数=仅本回合）' },
    };

    // ── 中文文案（技能）：按技能名查表，命中才覆盖 ─────────────────────────────
    // 宿主 skill 没有 locale 字典（SKILL.md 只有英文 description），所以这 16 条是
    // 按各 SKILL.md 英文描述人工写的，不是机器翻译；命中用中文，未命中的新技能
    // 回退宿主英文 description（不隐藏）。技能名同样保持英文。
    var SKILL_ZH = {
      'agent-experience': '编写或修改面向模型的工具定义（名称、描述、参数 schema、系统提示段），以及设计技能、上下文加载与多步工作流',
      'computer-use': '通过 orca computer 控制本地可见应用窗口：辅助功能树、点击、输入、菜单、对话框与截图；适用于原生应用与外部浏览器窗口',
      'cordis-composition-reference': '编写或阅读本 harness 的 Cordis bundle patch 或 agent preset 时使用，需要 Loader YAML 方言或可安装插件包清单',
      'cordis-plugin-development': '设计、评审、增删、启停、安装、配置或调试本 harness 配置档中的插件、bundle、页面、面板、工具或 MCP 连接',
      'diagnose-windows-sandbox-acl': 'Windows 上出现意料之外的 DSH 沙箱访问被拒时使用（工作区写入/列目录失败，或本应可读的路径读不到）；内置命令会检查并修复 ACL',
      'editing-cordis-compositions': '创建、修改或校验本 harness 的 agent preset 或其它 Cordis 组合，包括判断放宿主还是预设、以及确认预设能挂载',
      'find-skills': '帮助用户发现并安装 agent 技能（用户问「怎么做 X」「找一个技能」「有没有能…的技能」或想扩展能力时）',
      office: '创建、编辑、检查或转换 Office 文档、表格、演示文稿与 PDF；加载后选择合适的工作流',
      'office-docx': '创建、读取、编辑并校验 Word 文档（.docx）',
      'office-export-pdf': '用 LibreOffice Kit 把 Office 文档转换为 PDF',
      'office-pptx': '创建、读取、编辑并校验 PowerPoint 演示文稿（.pptx）',
      'office-recalculate': '用 LibreOffice Kit 刷新表格公式缓存并校验计算结果',
      'office-render': '用 LibreOffice Kit 渲染文档图片或检查页面布局',
      'office-xlsx': '读取、创建、编辑并校验 Excel 工作簿、数据与公式（.xlsx）',
      'orca-cli': '通过 orca CLI 操作 Orca 管理的工作树、文件夹上下文、终端、仓库、自动化、产物、技能共享、工作树评论与内嵌浏览器',
      orchestration: '编排受监督的 Orca 工作者：线程消息、阻塞式问答、任务派发、worker_done/escalation 等待、任务 DAG、决策门、协调循环与跨 agent 拆分',
    };

    function localOf(name) {
      for (var i = 0; i < LOCAL_ACTIONS.length; i++) {
        if (LOCAL_ACTIONS[i].name !== name) continue;
        var copy = {};
        for (var k in LOCAL_ACTIONS[i]) {
          if (Object.prototype.hasOwnProperty.call(LOCAL_ACTIONS[i], k)) copy[k] = LOCAL_ACTIONS[i][k];
        }
        return copy;
      }
      return null;
    }

    // 宿主命令 + 本机动作 + 技能 → 与桌面 SECTION_ROWS 同序的一张展示列表：
    //   添加：文件（本机）/ 目标 / 计划 / 反馈
    //   指令：压缩 / 权限 / 模型（本机）/ 导出 / 其余宿主命令
    //   技能：宿主 sessionSkillCatalog 的真实技能（单独一组，绝不与宿主命令混排）
    function mergeItems(hostItems, skillItems) {
      var add = [];
      var commands = [];
      for (var i = 0; i < hostItems.length; i++) {
        var it = hostItems[i];
        if (!it || typeof it.name !== 'string' || it.name === '') continue;
        it.source = 'host';
        // 展示层中文化：命中 COMMAND_ZH 才覆盖 label/description；未命中的新命令
        // 保留宿主返回的英文文案（不隐藏、不翻译）。宿主英文 description 塞进
        // keywords，保证用英文也能搜到（搜索同时匹配中文说明与英文命令名）。
        var zh = COMMAND_ZH[it.name];
        if (zh) {
          if (typeof it.description === 'string' && it.description !== '') {
            it.keywords = (Array.isArray(it.keywords) ? it.keywords : []).concat([it.description]);
          }
          it.label = zh.label;
          it.description = zh.description;
        }
        // 命令名也中文化：面板显示/插入 /目标；宿主只认英文，执行前由
        // mobile.commandExec 的 canonicalCommandLine() 映射回去。data-name 仍存英文。
        it.cmdName = zh ? zh.label : it.name;
        if (it.group === '添加') {
          add.push(it);
          continue;
        }
        // mobile.commands 会把没有 definitionId 的宿主命令归到「技能」段（旧逻辑：
        // 那时还没有真技能来源）。真技能现在由 mobile.skills 单独提供，宿主命令
        // 一律收进「指令」段末尾（桌面 ui-commands 对未列出的命令也是这么排的），
        // 否则 orchestrate 这类命令会和真技能挤在同一组，来源就混了。
        it.group = '指令';
        commands.push(it);
      }
      var file = localOf('file');
      if (file) add.unshift(file);
      var model = localOf('model');
      if (model) {
        var after = -1;
        for (var c = 0; c < commands.length; c++) {
          if (commands[c].name === 'permission') after = c;
        }
        commands.splice(after + 1, 0, model);
      }
      var out = add.concat(commands);
      for (var s = 0; s < skillItems.length; s++) {
        var sk = skillItems[s];
        if (!sk || typeof sk.name !== 'string' || sk.name === '') continue;
        var desc = typeof sk.description === 'string' ? sk.description : '';
        // 技能中文文案：按 name 查 SKILL_ZH，命中用中文；未命中的新技能回退宿主
        // 英文 description（不隐藏）。英文原文仍进 keywords，便于英文检索。
        var zhSkill = SKILL_ZH[sk.name];
        if (typeof zhSkill === 'string' && zhSkill !== '') desc = zhSkill;
        // 与桌面 ui-skill 的候选描述完全一致：modelInvocable=false（仅用户可调用）
        // 前缀「仅用户 · 」（client.js:427-430）。
        if (sk.modelInvocable === false && desc !== '') desc = '仅用户 · ' + desc;
        var skillKeywords = [];
        if (typeof sk.whenToUse === 'string' && sk.whenToUse !== '') skillKeywords.push(sk.whenToUse);
        if (typeof sk.description === 'string' && sk.description !== '') skillKeywords.push(sk.description);
        out.push({
          name: sk.name,
          // 技能标识是宿主英文名，无法中文化：显示与插入都用英文 /name。
          cmdName: sk.name,
          label: sk.name,
          description: desc,
          group: '技能',
          source: 'skill',
          disabled: sk.userInvocable === false,
          keywords: skillKeywords,
        });
      }
      return out;
    }

    function build() {
      var back = document.createElement('div');
      back.className = 'dm-perm-backdrop dm-cmd-backdrop';
      var sheet = document.createElement('div');
      sheet.className = 'dm-perm-sheet dm-cmd-sheet';
      var head = document.createElement('div');
      head.className = 'dm-perm-head dm-cmd-head';
      var title = el('div', 'dm-perm-title', '命令与技能');
      var close = el('button', 'dm-perm-close', '✕');
      close.type = 'button';
      close.setAttribute('aria-label', '关闭');
      head.appendChild(title);
      head.appendChild(close);

      var searchRow = el('div', 'dm-cmd-searchrow');
      var search = document.createElement('input');
      search.className = 'dm-cmd-search';
      search.type = 'search';
      search.autocomplete = 'off';
      search.setAttribute('placeholder', '搜索命令或技能');
      search.setAttribute('aria-label', '搜索命令或技能');
      searchRow.appendChild(search);

      var body = el('div', 'dm-perm-body dm-cmd-body');
      var status = el('div', 'dm-perm-status');

      sheet.appendChild(head);
      sheet.appendChild(searchRow);
      sheet.appendChild(body);
      sheet.appendChild(status);
      back.appendChild(sheet);
      document.body.appendChild(back);

      back.addEventListener('click', function (e) { if (e.target === back) closePanel(); });
      close.addEventListener('click', function (e) { e.preventDefault(); closePanel(); });
      search.addEventListener('input', function () {
        state.filter = search.value || '';
        paint();
      });

      // 下滑关闭：只监听头部，避免和列表本身的滚动抢触摸事件。
      var startY = 0;
      head.addEventListener('touchstart', function (e) {
        if (e.touches && e.touches.length === 1) startY = e.touches[0].clientY;
      }, { passive: true });
      head.addEventListener('touchmove', function (e) {
        if (!e.touches || e.touches.length !== 1) return;
        if (e.touches[0].clientY - startY > 70) {
          startY = 1e9;
          closePanel();
        }
      }, { passive: true });

      panel = { back: back, body: body, status: status, search: search };
      return panel;
    }

    function setStatus(text, kind) {
      if (!panel) return;
      var cls = 'dm-perm-status';
      if (text) cls += ' dm-perm-status-show';
      if (kind) cls += ' dm-perm-status-' + kind;
      panel.status.className = cls;
      panel.status.textContent = text || '';
    }

    function haystack(it) {
      // 中文命令名（cmdName）、中文说明、英文命令名（name）与关键词都参与搜索。
      var parts = [it.name || '', it.cmdName || '', it.label || '', it.description || ''];
      var kw = it.keywords;
      if (kw && kw.length) parts = parts.concat(kw);
      return parts.join(' ').toLowerCase();
    }

    // ── 行首图标：只有「添加 / 指令」两组的命令带图标，全部来自 design/icons.tsx ──
    // 宿主命令与桌面 ui-commands 的 HOST_FACES 一一对应；orchestrate 桌面没有 →
    // catalog 里是本仓库自绘项（source = ours）。技能行严格照桌面：不渲染图标。
    var CMD_ICONS = ${JSON.stringify(CMD_ICON_PARTS)};
    var CMD_ICON_SOURCES = ${JSON.stringify(CMD_ICON_SOURCES)};
    window.__dmCommandIconSources = CMD_ICON_SOURCES;

    // 图标键：命令/本机动作按 name 命中；技能行（group=技能）没有图标。
    function iconKeyOf(it) {
      if (it && it.group === '技能') return '';
      var key = it && typeof it.name === 'string' ? it.name : '';
      return CMD_ICONS[key] ? key : '';
    }

    // 尺寸归一：所有行统一 16×16 渲染（桌面命令 face 的默认尺寸），描边用图标
    // 自己的 rootProps（16 视框 = 1）。inline style 覆盖 theme.css 里 19px 的旧值，
    // 行高/字号/间距一律不动。
    function iconHtml(it) {
      var key = iconKeyOf(it);
      var icon = key === '' ? undefined : CMD_ICONS[key];
      if (!icon) return '';
      // 图标按 16px 画，与同组其它命令图标一致；stroke-width 仍按 16 视框给值
      //（倍率为 1），所以描边就是 1px，和「文件/目标/反馈」那几颗完全相同。
      var ICON_BOX = 16;
      var ICON_SW = (icon.sw === undefined ? 1.2 : Number(icon.sw)) * (16 / ICON_BOX);
      return '<svg class="dm-cmd-icon" width="' + ICON_BOX + '" height="' + ICON_BOX + '" viewBox="' + icon.vb + '" fill="none" stroke="currentColor" stroke-width="' + ICON_SW.toFixed(3) + '" style="width:' + ICON_BOX + 'px;height:' + ICON_BOX + 'px" aria-hidden="true">' + icon.html + '</svg>';
    }

    // 一行 = [图标（仅命令行）] [/name 中文标签] [右侧说明，单行省略]
    // 与桌面 / 菜单同款：不再放来源徽标、不再放尖括号参数占位（用户明确说没用且乱）。
    // 技能行严格照桌面：**不渲染图标元素**，用 .dm-cmd-row-noicon 的缩进让文字与
    // 命令行文字同一条左边线（不留空图标盒子）。
    function rowOf(it) {
      var row = document.createElement('button');
      row.type = 'button';
      row.className = 'dm-perm-row dm-cmd-row';
      row.setAttribute('data-name', it.name);
      if (it.source) row.setAttribute('data-source', it.source);
      if (it.group) row.setAttribute('data-group', it.group);
      var iconKey = iconKeyOf(it);
      row.setAttribute('data-icon', iconKey);
      if (iconKey !== '') row.setAttribute('data-icon-src', CMD_ICON_SOURCES[iconKey] || iconKey);
      if (iconKey !== '') {
        var icon = iconHtml(it);
        var iconBox = el('span', 'dm-cmd-iconbox');
        iconBox.innerHTML = icon;
        row.appendChild(iconBox);
      } else {
        row.classList.add('dm-cmd-row-noicon');
      }
      var left = el('span', 'dm-cmd-left');
      // 命令名也中文化：/目标、/压缩…；技能保持 /英文技能名（宿主标识无法中文化）。
      // 英文命令名放进 title（桌面悬浮可见）且 data-name 仍是英文，映射与测试都不受影响。
      var code = el('span', 'dm-cmd-code', '/' + (it.cmdName || it.name));
      if (it.cmdName && it.cmdName !== it.name) code.title = it.name;
      left.appendChild(code);
      row.appendChild(left);
      if (it.description) {
        var desc = el('span', 'dm-cmd-desc', it.description);
        desc.title = it.description;
        row.appendChild(desc);
      }
      if (it.disabled) {
        row.disabled = true;
        row.classList.add('dm-cmd-row-disabled');
      }
      row.addEventListener('click', function (e) { e.preventDefault(); pick(it, row); });
      return row;
    }

    function paint() {
      if (!panel) return;
      var body = panel.body;
      body.innerHTML = '';
      var q = String(state.filter || '').trim().toLowerCase();
      var groups = [];
      var index = {};
      var shown = 0;
      for (var i = 0; i < state.items.length; i++) {
        var it = state.items[i];
        if (!it || typeof it.name !== 'string' || it.name === '') continue;
        if (q !== '' && haystack(it).indexOf(q) < 0) continue;
        var g = typeof it.group === 'string' && it.group !== '' ? it.group : '其它';
        if (!index[g]) {
          index[g] = { label: g, items: [] };
          groups.push(index[g]);
        }
        index[g].items.push(it);
        shown += 1;
      }
      body.setAttribute('data-dm-cmd-shown', String(shown));
      if (state.items.length === 0) {
        body.appendChild(el('p', 'dm-perm-hint', state.reason || '宿主没有返回任何命令'));
        return;
      }
      if (shown === 0) {
        body.appendChild(el('p', 'dm-perm-hint', '没有匹配「' + q + '」的命令'));
        return;
      }
      for (var gi = 0; gi < groups.length; gi++) {
        body.appendChild(el('div', 'dm-cmd-group', groups[gi].label));
        for (var ri = 0; ri < groups[gi].items.length; ri++) body.appendChild(rowOf(groups[gi].items[ri]));
      }
    }

    function pick(it, row) {
      // 与桌面宿主一致：选中命令 = 把 '/name '（末尾一个空格）插进输入框，不执行、
      // 不发请求。用户补完参数后按发送，bundle 的发送路径会拦下以 / 开头的整行并调
      // mobile.commandExec（bundle @316472：n.startsWith('/') && 无引用 && 无附件
      // → Mr(n)，Mr 就是 mobile.commandExec）。技能同理，只是宿主 pre-step 会再注入
      // skill 正文。这里绝不再自己弹参数框或直接执行。
      if (it.source === 'local') {
        runLocal(it);
        return;
      }
      // 插入中文命令名（/目标 ），与面板显示一致；宿主只认英文，执行前由
      // mobile.commandExec 的 canonicalCommandLine() 映射回 /goal。技能仍是英文名。
      insertLine('/' + (it.cmdName || it.name) + ' ', it.source === 'skill' ? it.name : '');
    }

    // 本机动作：先判断入口在不在，再收起面板，等收起动画（200ms）走完才点 ——
    // 面板是整屏遮罩，立刻点会被它的 pointer-events 吃掉。
    function runLocal(it) {
      var target = null;
      if (it.name === 'file') {
        // 与 composer 的「＋」同一个按钮（bundle: chat-attach-btn aria-label 添加内容）。
        target = document.querySelector('.chat-attach-btn[aria-label="添加内容"]');
      } else if (it.name === 'model') {
        // 与 composer 的模型 pill 同一个入口：优先用本插件已有的模型按钮（它会
        // 直接打开底部「模型与思考强度」抽屉），没有就退回原生 pill。
        target = document.getElementById('dm-model-btn');
        if (!target) target = document.querySelector('.chat-pill[aria-label^="切换模型"]');
      }
      if (!target) {
        setStatus('当前页面没有「' + (it.label || it.name) + '」入口', 'err');
        return;
      }
      setStatus('');
      closePanel();
      window.setTimeout(function () {
        try { target.click(); } catch (e) {}
      }, 220);
      try { document.body.setAttribute('data-dm-cmd-local-last', it.name); } catch (e) {}
    }

    // 把命令插进 composer：不发送、不执行。先插入再收起面板 —— textarea 在遮罩
    // 下面，插入是同步的，用户看到的就是面板收起后输入框里已经有 '/name '。
    function insertLine(line, skillName) {
      if (!panel) return;
      if (!insertComposer(line)) {
        setStatus('当前不在输入框页面，无法插入命令', 'err');
        return;
      }
      // DOM 证据：最后一次插入的整行（只有命令名，不含会话内容）。
      try {
        document.body.setAttribute('data-dm-cmd-last-insert', line.trim());
        if (skillName) document.body.setAttribute('data-dm-cmd-last-skill', skillName);
      } catch (e) {}
      closePanel();
    }

    // 往 composer 落文本：bundle 的 textarea 是受控组件，必须用原生 value setter +
    // input 事件（与本插件「停止→排队发送」清空输入框同一手法）。
    function insertComposer(text) {
      var ta = document.querySelector('textarea.chat-input');
      if (!ta) return false;
      var current = ta.value || '';
      var prefix = current === '' || /\s$/.test(current) ? '' : ' ';
      var next = current + prefix + text;
      try {
        var setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
        setter.call(ta, next);
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      } catch (e) {
        ta.value = next;
        try { ta.dispatchEvent(new Event('input', { bubbles: true })); } catch (e2) {}
      }
      try {
        ta.focus();
        var end = ta.value.length;
        ta.setSelectionRange(end, end);
      } catch (e) {}
      return true;
    }

    function load() {
      if (!panel) return Promise.resolve();
      state.items = [];
      state.reason = '';
      state.skillsReason = '';
      state.hostCount = 0;
      state.skillCount = 0;
      panel.body.innerHTML = '';
      panel.body.appendChild(el('p', 'dm-perm-hint dm-perm-loading', '加载中…'));
      setStatus('');
      var sid = currentSession();
      if (!sid) {
        state.reason = '当前不在会话里，没有可用的命令';
        paint();
        return Promise.resolve();
      }
      // 两个数据源并行取，一次绘制：宿主命令注册表 + 宿主技能目录。
      var commandsReq = rpc('mobile.commands', { sessionId: sid }).catch(function () { return null; });
      var skillsReq = rpc('mobile.skills', { sessionId: sid }).catch(function () { return null; });
      return Promise.all([commandsReq, skillsReq]).then(function (both) {
        if (!panel || !panel.back.classList.contains('dm-perm-open')) return;
        var cmdRes = both[0];
        var skillRes = both[1];
        var hostItems = [];
        var skillItems = [];
        var live = false;
        var cmdOk = !!(cmdRes && cmdRes.ok);
        if (cmdOk) {
          var cv = cmdRes.value || {};
          hostItems = Array.isArray(cv.items) ? cv.items : [];
          state.reason = typeof cv.reason === 'string' ? cv.reason : '';
          live = cv.live === true;
          if (cv.available === false && state.reason === '') state.reason = '宿主命令服务不可用';
        } else {
          state.reason = (cmdRes && cmdRes.error && cmdRes.error.message) ? cmdRes.error.message : '命令列表加载失败';
        }
        var skillOk = !!(skillRes && skillRes.ok);
        if (skillOk) {
          var sv = skillRes.value || {};
          skillItems = Array.isArray(sv.items) ? sv.items : [];
          if (sv.available === false) {
            state.skillsReason = typeof sv.reason === 'string' && sv.reason !== '' ? sv.reason : '宿主技能目录不可用';
          }
        } else {
          state.skillsReason = (skillRes && skillRes.error && skillRes.error.message) ? skillRes.error.message : '技能目录加载失败';
        }
        state.hostCount = hostItems.length;
        state.skillCount = skillItems.length;
        state.items = mergeItems(hostItems, skillItems);
        // DOM 证据：三类来源分别计数，自动化可直接核对
        // 「技能组条数 = mobile.skills 返回条数」「宿主命令 = mobile.commands 条数」。
        try {
          panel.back.setAttribute('data-dm-cmd-count', String(state.items.length));
          document.body.setAttribute('data-dm-cmd-count', String(state.items.length));
          document.body.setAttribute('data-dm-host-count', String(state.hostCount));
          document.body.setAttribute('data-dm-skill-count', String(state.skillCount));
          document.body.setAttribute('data-dm-local-count', String(LOCAL_ACTIONS.length));
          document.body.setAttribute('data-dm-cmd-live', live ? '1' : '0');
        } catch (e) {}
        if (state.skillsReason !== '') {
          setStatus('技能目录不可用：' + state.skillsReason, 'err');
        } else if (!cmdOk) {
          setStatus(state.reason || '宿主命令服务不可用', 'err');
        } else if (!live) {
          setStatus('该会话当前没有活动 Agent：执行命令时会先唤醒它', '');
        }
        paint();
      }).catch(function () {
        if (!panel) return;
        state.items = mergeItems([], []);
        state.hostCount = 0;
        state.skillCount = 0;
        state.reason = '命令列表加载失败，请重试';
        paint();
      });
    }

    function open() {
      if (!panel) build();
      state.filter = '';
      if (panel.search) panel.search.value = '';
      panel.back.classList.add('dm-perm-open');
      panel.back.removeAttribute('data-dm-closing');
      load();
    }

    function isOpen() {
      return !!(panel && panel.back.classList.contains('dm-perm-open'));
    }

    function closePanel() {
      if (!panel) return;
      var back = panel.back;
      if (!back.classList.contains('dm-perm-open')) { setStatus(''); return; }
      if (back.getAttribute('data-dm-closing') === '1') return;
      back.setAttribute('data-dm-closing', '1');
      back.classList.add('dm-closing');
      var sheet = back.querySelector('.dm-cmd-sheet');
      if (sheet) sheet.classList.add('dm-closing');
      window.setTimeout(function () {
        back.classList.remove('dm-perm-open');
        back.classList.remove('dm-closing');
        back.removeAttribute('data-dm-closing');
        if (sheet) sheet.classList.remove('dm-closing');
        setStatus('');
      }, 200);
    }

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (isOpen()) closePanel();
      else open();
    });

    // 只在聊天页显示：判据与权限/子代理按钮一致，外加 #dm-tools 行存在。
    function isChatPage() {
      var slots = document.querySelectorAll('.mobile-headerSlot-right');
      for (var i = 0; i < slots.length; i++) {
        if (slots[i].querySelector('button[aria-label="更多"]')) return true;
      }
      return false;
    }

    function ensure() {
      var row = document.getElementById('dm-tools');
      var tools = document.querySelector('.chat-tools');
      if (!row || !tools || !isChatPage()) {
        if (btn.parentNode) btn.parentNode.removeChild(btn);
        if (isOpen()) closePanel();
        return;
      }
      // 只负责「在不在这一行」：其他按钮各自用 insertBefore 抢自己的锚点，
      // 这里 appendChild 到行尾，不和他们争顺序（否则会互相来回搬）。
      if (btn.parentNode !== row) row.appendChild(btn);
    }

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
  } catch (e) {}
})();
</script>`
