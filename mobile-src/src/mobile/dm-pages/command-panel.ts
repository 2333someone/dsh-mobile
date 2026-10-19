/**
 * 迁移 A：1:1 搬自宿主 index.js 的 `COMMAND_PANEL_HTML` 注入字符串。
 * 工具栏「/」命令面板：宿主命令 + 本机动作 + 技能组。
 *
 * 只搬位置、不改写：内容仍是当年的 HTML + 内联脚本，由
 * `dm-pages/index.ts` 在 bundle 启动时按原顺序安装到 document。
 */
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

    // ── 行首图标：与宿主（桌面端 / 命令菜单）同一套 16×16 线性图标 ──────────────
    // 路径直接取自宿主 client-ui-primitives 的 *Regular 图标（file 用回形针、
    // goal 准星、plan 计划页、feedback 纸飞机、compact 圆环、permission 盾牌、
    // model 数据库、export 下载）。技能组的命令是动态名字，统一用技能图标；
    // 其它未知命令留一个空盒子，保证文字仍然对齐（和宿主菜单一致）。
    var CMD_ICONS = {
      file: { vb: '0 0 16 16', html: '<path d="M12.75 4.5V9.5C12.75 10.7598 12.2496 11.968 11.3588 12.8588C10.468 13.7496 9.25978 14.25 8 14.25C6.74022 14.25 5.53204 13.7496 4.64124 12.8588C3.75045 11.968 3.25 10.7598 3.25 9.5V5C3.25 4.13805 3.59241 3.3114 4.2019 2.7019C4.8114 2.09241 5.63805 1.75 6.5 1.75C7.36195 1.75 8.1886 2.09241 8.7981 2.7019C9.40759 3.3114 9.75 4.13805 9.75 5V9.5C9.75 9.96413 9.56563 10.4092 9.23744 10.7374C8.90925 11.0656 8.46413 11.25 8 11.25C7.53587 11.25 7.09075 11.0656 6.76256 10.7374C6.43437 10.4092 6.25 9.96413 6.25 9.5V5.5" fill="none" stroke="currentColor"/>' },
      goal: { vb: '0 0 16 16', html: '<path d="M14.5001 8C14.5 9.28552 14.1188 10.5422 13.4045 11.611C12.6903 12.6799 11.6752 13.5129 10.4875 14.0049C9.29982 14.4968 7.99295 14.6255 6.73212 14.3747C5.4713 14.124 4.31314 13.505 3.4041 12.596C2.49514 11.687 1.87614 10.5288 1.62537 9.26798C1.37459 8.00716 1.50331 6.70028 1.99525 5.51261C2.48719 4.32494 3.32025 3.30981 4.3891 2.59557C5.45795 1.88134 6.71458 1.50008 8.0001 1.5" fill="none" stroke="currentColor"/><path d="M11.5 8C11.5001 8.69227 11.2948 9.36901 10.9102 9.94463C10.5257 10.5202 9.97901 10.9689 9.33944 11.2338C8.69986 11.4987 7.99609 11.5681 7.31712 11.433C6.63816 11.2979 6.01449 10.9645 5.52501 10.475C5.03548 9.98552 4.70209 9.36185 4.56702 8.68289C4.43195 8.00392 4.50127 7.30015 4.76619 6.66057C5.03112 6.021 5.47976 5.47436 6.05538 5.08978C6.631 4.70519 7.30774 4.49995 8.00001 4.5" fill="none" stroke="currentColor"/><path d="M8.00024 7.99976L11.2 4.80005" fill="none" stroke="currentColor"/><path d="M12.4719 5.62245C12.4246 5.66972 12.3569 5.69025 12.2913 5.67715L10.7814 5.37555C10.7022 5.35972 10.6402 5.29781 10.6244 5.2186L10.3228 3.70866C10.3097 3.6431 10.3302 3.57533 10.3775 3.52806L12.1826 1.723C12.2863 1.61929 12.4627 1.65879 12.5122 1.79684L12.9271 2.95225C12.9472 3.00847 12.9915 3.05272 13.0477 3.07291L14.2031 3.48774C14.3412 3.5373 14.3807 3.71368 14.277 3.81739L12.4719 5.62245Z" fill="none" stroke="currentColor"/>' },
      plan: { vb: '0 0 16 16', html: '<path d="M4.9375 5.90295H11.0625" fill="none" stroke="currentColor"/><path d="M4.9375 9.02991H8.27841" fill="none" stroke="currentColor"/><path d="M12.5 1.32617C13.3039 1.32617 14 1.95171 14 2.77637V7.61328L13 8.68164V2.77637C13 2.55186 12.8007 2.32617 12.5 2.32617H3.5C3.1993 2.32617 3 2.55186 3 2.77637V13.2246C3.00044 13.4489 3.19963 13.6738 3.5 13.6738H8.32812L7.39258 14.6738H3.5C2.69637 14.6738 2.00042 14.0489 2 13.2246V2.77637C2 1.95171 2.69613 1.32617 3.5 1.32617H12.5Z" fill="currentColor" stroke="none"/><path d="M8.97212 14.3693C9.17511 14.5723 9.37811 14.7753 9.5811 14.9783C9.67012 14.8953 9.75914 14.8123 9.84815 14.7293C11.4505 13.2352 13.0528 11.7411 14.6551 10.247C14.7441 10.164 14.8331 10.081 14.9221 9.99803C14.5989 9.6748 14.2756 9.35157 13.9524 9.02834C13.8694 9.11736 13.7864 9.20637 13.7034 9.29539C12.2093 10.8977 10.7152 12.5 9.22113 14.1023C9.13813 14.1913 9.05513 14.2803 8.97212 14.3693Z" fill="currentColor" stroke="none"/><path d="M11.6323 13.7841C11.6323 14.0395 11.6323 14.295 11.6323 14.5504C11.6812 14.5523 11.7301 14.5543 11.779 14.5562C12.659 14.5913 13.539 14.6263 14.419 14.6614C14.4679 14.6633 14.5168 14.6653 14.5657 14.6672C14.5657 14.3339 14.5657 14.0006 14.5657 13.6672C14.5168 13.6692 14.4679 13.6711 14.419 13.6731C13.539 13.7081 12.659 13.7432 11.779 13.7783C11.7301 13.7802 11.6812 13.7821 11.6323 13.7841Z" fill="currentColor" stroke="none"/>' },
      feedback: { vb: '0 0 16 16', html: '<path d="M4.74024 9.11029L1.82882 7.79865C1.75022 7.76323 1.75026 7.65161 1.82889 7.61626L12.9665 2.60943C13.0354 2.57846 13.1125 2.63213 13.1073 2.70749L12.3914 13.1388C12.3864 13.2117 12.3073 13.2548 12.2433 13.2194L6.12677 9.83657" fill="none" stroke="currentColor"/><path d="M8.44336 11.0825L6.2832 13.2843C6.22048 13.3482 6.11182 13.3038 6.11182 13.2143V9.86772C6.11182 9.84165 6.122 9.8166 6.1402 9.79793L12.972 2.78748" fill="none" stroke="currentColor"/>' },
      compact: { vb: '0 0 16 16', html: '<path d="M8 14.5C11.5899 14.5 14.5 11.5899 14.5 8C14.5 4.41015 11.5899 1.5 8 1.5C4.41015 1.5 1.5 4.41015 1.5 8C1.5 11.5899 4.41015 14.5 8 14.5Z" fill="none" stroke="currentColor" opacity="0.35"/><path d="M8 1.5C8.85359 1.5 9.69883 1.66813 10.4874 1.99478C11.2761 2.32144 11.9926 2.80022 12.5962 3.40381C13.1998 4.00739 13.6786 4.72394 14.0052 5.51256C14.3319 6.30117 14.5 7.14641 14.5 8" fill="none" stroke="currentColor"/>' },
      permission: { vb: '0 0 16 16', html: '<path d="M6.59624 2.14853C7.50155 1.80917 8.49914 1.80919 9.40444 2.14859L13.9245 3.84317V7.11961C13.9245 11.6089 10.5565 13.5975 8.00035 14.5779C5.44423 13.5975 2.07544 11.6089 2.07544 7.11961V3.84317L6.59624 2.14853Z" fill="none" stroke="currentColor" stroke-linejoin="round"/><path d="M8 4.39209V9.89209" fill="none" stroke="currentColor"/><path d="M8 10.8081V11.8081" fill="none" stroke="currentColor"/>' },
      model: { vb: '0 0 16 16', html: '<path d="M7.8667 0.349609C8.96906 0.349634 10.0601 0.481272 11.0317 0.735352C11.9973 0.987845 12.8453 1.362 13.4644 1.84766C14.0744 2.32629 14.507 2.95539 14.5161 3.69336H14.5171V8.53516C14.0843 8.32076 13.6108 8.17679 13.1108 8.11816C13.1831 7.96848 13.2162 7.82856 13.2163 7.70312V5.76758C12.6269 6.16618 11.8739 6.47995 11.0317 6.7002C10.0602 6.95423 8.96896 7.08494 7.8667 7.08496C6.76461 7.08493 5.67411 6.95415 4.70264 6.7002C3.85994 6.48006 3.10694 6.1662 2.51709 5.76758V7.70312L2.521 7.78418C2.56374 8.19554 2.93361 8.74414 3.91357 9.23145C4.9281 9.73585 6.35004 10.0371 7.8667 10.0371C8.26373 10.0371 8.6543 10.0141 9.03271 9.97461C8.75596 10.3799 8.54664 10.8349 8.42041 11.3232C8.23666 11.3313 8.0518 11.3369 7.8667 11.3369C6.20108 11.3369 4.57025 11.01 3.33447 10.3955C3.04163 10.2499 2.76658 10.0836 2.51709 9.90039V11.6738C2.51728 12.1379 2.88589 12.7556 3.92236 13.292C4.93457 13.8157 6.35342 14.1289 7.8667 14.1289C8.12318 14.1289 8.37694 14.1161 8.62646 14.0986C8.82021 14.5535 9.08999 14.9682 9.41943 15.3271C8.91285 15.3934 8.39149 15.4287 7.8667 15.4287C6.19761 15.4287 4.56379 15.0869 3.32568 14.4463C2.11244 13.8185 1.21649 12.8562 1.21631 11.6738V3.76367C1.21595 3.74853 1.21438 3.733 1.21436 3.71777C1.21436 2.96917 1.65103 2.33053 2.26807 1.84668C2.88747 1.36112 3.73675 0.987685 4.70264 0.735352C5.67413 0.481376 6.76457 0.349636 7.8667 0.349609ZM7.8667 1.65039C6.86269 1.65042 5.88326 1.77028 5.03076 1.99316C4.17183 2.2176 3.50421 2.52956 3.06982 2.87012C2.65043 3.19909 2.52622 3.48898 2.51709 3.69336V3.74414C2.52719 3.94845 2.65185 4.23772 3.06982 4.56543C3.50425 4.90601 4.17172 5.21795 5.03076 5.44238C5.88326 5.66527 6.8627 5.78513 7.8667 5.78516C8.8707 5.78513 9.85015 5.66525 10.7026 5.44238C11.5611 5.21787 12.2286 4.9049 12.6626 4.56445C13.0982 4.22252 13.2163 3.9231 13.2163 3.71777L13.2104 3.63574C13.1818 3.43623 13.044 3.16941 12.6626 2.87012C12.2286 2.52957 11.5614 2.21773 10.7026 1.99316C9.85009 1.77025 8.8708 1.65041 7.8667 1.65039Z" fill="currentColor" stroke="none"/><path d="M12.8936 10.0361L13.2061 10.5566C13.2296 10.5959 13.2651 10.6562 13.3027 10.707C13.3469 10.7666 13.4148 10.8431 13.5195 10.9023C13.6244 10.9617 13.725 10.9801 13.7988 10.9873C13.8619 10.9934 13.9318 10.9932 13.9775 10.9932H14.6162L14.8896 11.4502L14.5947 11.9443C14.5698 11.9859 14.5312 12.0483 14.5029 12.1084C14.4781 12.1611 14.4514 12.2312 14.4395 12.3164L14.4326 12.4072L14.4395 12.4971C14.4514 12.5825 14.4781 12.6532 14.5029 12.7061C14.5312 12.7661 14.5689 12.8287 14.5938 12.8701L14.8896 13.3633L14.6162 13.8213H13.9775C13.9318 13.8213 13.8619 13.821 13.7988 13.8271C13.7433 13.8326 13.6728 13.8442 13.5967 13.875L13.5195 13.9121C13.4148 13.9714 13.3469 14.0478 13.3027 14.1074C13.265 14.1583 13.2296 14.2186 13.2061 14.2578L12.8936 14.7783H12.3115L11.999 14.2578C11.9755 14.2186 11.9401 14.1583 11.9023 14.1074C11.8693 14.0628 11.823 14.0083 11.7578 13.959L11.6855 13.9121L11.6074 13.875C11.5316 13.8445 11.4615 13.8325 11.4062 13.8271C11.3432 13.821 11.2733 13.8213 11.2275 13.8213H10.5889L10.3135 13.3633L10.6104 12.8701C10.6352 12.8287 10.6739 12.7661 10.7021 12.7061C10.7352 12.6357 10.7724 12.534 10.7725 12.4072C10.7724 12.2804 10.7352 12.1788 10.7021 12.1084C10.6739 12.0483 10.6353 11.9859 10.6104 11.9443L10.3135 11.4502L10.5889 10.9932H11.2275C11.2733 10.9932 11.3432 10.9934 11.4062 10.9873C11.4801 10.9801 11.5808 10.9616 11.6855 10.9023C11.7903 10.843 11.8582 10.7666 11.9023 10.707C11.94 10.6562 11.9755 10.5959 11.999 10.5566L12.3115 10.0361H12.8936Z" fill="none" stroke="currentColor"/>' },
      export: { vb: '0 0 16 16', html: '<path d="M8 1.95317V10.0469" fill="none" stroke="currentColor"/><path d="M4.25 6.29688L8 10.0469L11.75 6.29688" fill="none" stroke="currentColor"/><path d="M1.5 10.0469V13.158C1.5 13.3937 1.60536 13.6198 1.79289 13.7865C1.98043 13.9532 2.23478 14.0469 2.5 14.0469H13.5C13.7652 14.0469 14.0196 13.9532 14.2071 13.7865C14.3946 13.6198 14.5 13.3937 14.5 13.158V10.0469" fill="none" stroke="currentColor"/>' },
      skill: { vb: '0 0 17 17', html: '<path d="M4.57788 5.77124H10.7029" fill="none" stroke="currentColor"/><path d="M4.57788 8.89819H7.91879" fill="none" stroke="currentColor"/><path d="M12.1404 1.19446C12.9442 1.19446 13.6404 1.81999 13.6404 2.64465V8.89856H12.6404V2.64465C12.6404 2.42015 12.4411 2.19446 12.1404 2.19446H3.14038C2.83968 2.19446 2.64038 2.42015 2.64038 2.64465V13.0929C2.64082 13.3172 2.84001 13.5421 3.14038 13.5421H8.88159V14.5421H3.14038C2.33675 14.5421 1.6408 13.9172 1.64038 13.0929V2.64465C1.64038 1.81999 2.33651 1.19446 3.14038 1.19446H12.1404Z" fill="currentColor" stroke="none"/><path d="M12.0051 15.1056C12.0051 13.6395 10.8166 12.451 9.35059 12.451C10.8166 12.451 12.0051 11.2626 12.0051 9.79651C12.0051 11.2626 13.1936 12.451 14.6597 12.451C13.1936 12.451 12.0051 13.6395 12.0051 15.1056Z" fill="none" stroke="currentColor"/>' },
      // 编排（orchestrate）：一个节点向右分出两条箭头 —— 与「纯编排模式」的语义对应。
      // 宿主 command descriptor 没有 icon 字段，这里补一个自绘内联图标；尺寸按
      // 24×24 / stroke 1.8（与其它 16×16 / stroke 1.2 图标的视觉粗细一致：
      // 1.8/24 = 1.2/16），圆头圆角，颜色 currentColor 跟随主题。
      orchestrate: { vb: '0 0 24 24', sw: '1.8', html: '<circle cx="4.5" cy="12" r="2.1" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.6 12H10.4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.4 12L15.2 7.2H19.1" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 5.1L19.1 7.2L17 9.3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.4 12L15.2 16.8H19.1" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 14.7L19.1 16.8L17 18.9" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>' },
    };

    // 图标键：文件/模型等本机动作按 name 命中；技能统一用「技能」图标；
    // 没有任何命中时返回空（渲染成空盒子，保持文字对齐，但验收要求 0 个空图标）。
    function iconKeyOf(it) {
      var key = it && typeof it.name === 'string' ? it.name : '';
      if (CMD_ICONS[key]) return key;
      if (it && it.group === '技能') return 'skill';
      return '';
    }

    function iconHtml(it) {
      var key = iconKeyOf(it);
      var icon = key === '' ? undefined : CMD_ICONS[key];
      if (!icon) return '';
      return '<svg class="dm-cmd-icon" viewBox="' + icon.vb + '" fill="none" stroke="currentColor" stroke-width="' + (icon.sw || '1.2') + '" aria-hidden="true">' + icon.html + '</svg>';
    }

    // 一行 = [图标] [/name 中文标签] [右侧说明，单行省略]
    // 与桌面 / 菜单同款：不再放来源徽标、不再放尖括号参数占位（用户明确说没用且乱）。
    // 说明右对齐、约占 46%，完整文本进 title（桌面悬浮/手机长按可见）；技能与命令
    // 用同一套结构，只是分组标题不同。
    function rowOf(it) {
      var row = document.createElement('button');
      row.type = 'button';
      row.className = 'dm-perm-row dm-cmd-row';
      row.setAttribute('data-name', it.name);
      if (it.source) row.setAttribute('data-source', it.source);
      if (it.group) row.setAttribute('data-group', it.group);
      row.setAttribute('data-icon', iconKeyOf(it));
      var icon = iconHtml(it);
      var iconBox = el('span', 'dm-cmd-iconbox');
      if (icon !== '') iconBox.innerHTML = icon;
      row.appendChild(iconBox);
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
