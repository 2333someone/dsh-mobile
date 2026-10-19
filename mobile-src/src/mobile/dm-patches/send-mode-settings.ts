/**
 * 迁移 C：1:1 搬自宿主 index.js 的 `SEND_MODE_SETTINGS_HTML` 注入字符串。
 * 设置页发送模式选项
 *
 * 由 `dm-patches/index.ts` 在 bundle 启动时按原顺序安装。
 */
// 设置页「发送模式」行（需求 A）。
//
// 注入点：设置页的「对话」分组（.settings-group 里含「自动滚动 / 震动」的那个 ul）。
// 识别方式：找标题为「对话」的 .settings-groupTitle，取它所在的 ul —— 与本机语言一致，
// 不依赖英文文案。找不到就挂到设置页滚动容器 .mobile-scroll 末尾，绝不静默失败。
//
// 交互：行内是一个真正的原生 <select>（排队 / 直接插入），只有下拉能改值；
// 整行不再 click toggle —— 行是 <div>，点击行不会触发任何写操作。
// change → window.__dmSendMode.set(v) → 成功后刷新显示 + 提示「已保存」。
export const SEND_MODE_SETTINGS_HTML = `<script>
(function () {
  var LABELS = {
    queue: '排队（等当前回复结束）',
    steer: '直接插入（插队立即生效）',
  };
  var SHORT = { queue: '排队', steer: '直接插入' };
  var OPTIONS = [
    { value: 'queue', text: SHORT.queue },
    { value: 'steer', text: SHORT.steer },
  ];

  function settingsPage() {
    // 设置页标志。原来只认「搜索框 .settings-search 已渲染」，而它比设置分组晚约
    // 250ms 才出现 —— 于是「发送模式」这一行总是比其它行动态晚一拍冒出来。
    // 现在两种判据任一成立即可：搜索框、或已渲染出设置分组标题。
    // 聊天页/列表页都没有 .settings-groupTitle，所以不会误判。
    var title = document.querySelector('.mobile-title');
    var titleText = title ? String(title.textContent || '') : '';
    var hasSearch = !!document.querySelector('.settings-search');
    var hasGroups = document.querySelectorAll('.settings-groupTitle').length > 0;
    if (!hasSearch && !hasGroups) return null;
    // 有搜索框但标题明确不是「设置」→ 说明还在别的页面，不动。
    if (hasSearch && titleText !== '' && titleText.indexOf('设置') < 0) return null;
    return document.querySelector('.mobile-scroll');
  }

  function chatGroup() {
    var titles = document.querySelectorAll('.settings-groupTitle');
    for (var i = 0; i < titles.length; i++) {
      var text = String(titles[i].textContent || '');
      if (text.indexOf('对话') >= 0) return titles[i].closest('ul');
    }
    return null;
  }

  function build() {
    var li = document.createElement('li');
    // 注意：必须是 div，不能是 button —— <select> 嵌在 <button> 里是非法 HTML，
    // 而且 button 的点击会与下拉冲突。行本身不再是「点了就切换」的按钮。
    var row = document.createElement('div');
    row.className = 'settings-row dm-sendmode-row';
    row.id = 'dm-sendmode-row';

    var icon = document.createElement('span');
    icon.className = 'card-icon dm-sendmode-icon';
    // 图标：单色内联 SVG 纸飞机（发送的通用语义），stroke 用 currentColor 继承
    // 本行图标的灰色 --text-secondary，与设置页其它行的单色图标一致。
    // 不要用箭头类字符（如 U+21A9）：它在部分浏览器/字体下会被渲染成彩色 emoji，
    // 语义也不是「发送」。
    // 图标：队列语义，但**刻意做简**——设置页其它行都是 19~20px 的细线条图标，
  // 这里如果画三条粗矩形 + 箭头，缩到同样尺寸会糊成一团、视觉也比邻行重。
  // 只保留三根等距横线（队列/列表），与邻行的线条密度一致。
  icon.innerHTML =
      '<span aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M6.5 8.5h11"/>' +
      '<path d="M6.5 12h11"/>' +
      '<path d="M6.5 15.5h11"/>' +
      '</svg>' +
      '</span>';

    var main = document.createElement('span');
    main.className = 'card-main';
    var title = document.createElement('span');
    title.className = 'card-title';
    var titleText = document.createElement('span');
    titleText.className = 'card-titleText';
    titleText.textContent = '发送模式';
    title.appendChild(titleText);
    var desc = document.createElement('span');
    desc.className = 'card-desc dm-sendmode-desc';
    desc.id = 'dm-sendmode-desc';
    main.appendChild(title);
    main.appendChild(desc);

    // 右侧操作区：真·原生 <select>，复用 bundle 的 .settings-input 外观。
    var action = document.createElement('span');
    action.className = 'card-action dm-sendmode-action';
    var select = document.createElement('select');
    select.className = 'settings-input dm-sendmode-select';
    select.id = 'dm-sendmode-select';
    select.setAttribute('aria-label', '发送模式');
    for (var i = 0; i < OPTIONS.length; i++) {
      var opt = document.createElement('option');
      opt.value = OPTIONS[i].value;
      opt.textContent = OPTIONS[i].text;
      select.appendChild(opt);
    }
    action.appendChild(select);

    row.appendChild(icon);
    row.appendChild(main);
    row.appendChild(action);
    li.appendChild(row);
    return li;
  }

  function current() {
    return window.__dmSendMode && typeof window.__dmSendMode.get === 'function'
      ? window.__dmSendMode.get()
      : 'queue';
  }

  // paint() 是唯一的显示出口：desc 文字 + 下拉选中项 + aria-label，
  // dm:sendmode 事件（含别的设备改了值）也走这里，所以下拉会跟着变。
  function paint() {
    var row = document.getElementById('dm-sendmode-row');
    if (!row) return;
    var m = current();
    if (m !== 'steer') m = 'queue';
    var select = document.getElementById('dm-sendmode-select');
    var desc = document.getElementById('dm-sendmode-desc');
    if (select && select.value !== m) select.value = m;
    if (desc) desc.textContent = LABELS[m] || LABELS.queue;
    row.setAttribute('aria-label', '发送模式：' + SHORT[m]);
  }

  function ensure() {
    var scroll = settingsPage();
    if (!scroll) return;
    var row = document.getElementById('dm-sendmode-row');
    if (row) { paint(); return; }

    // 必须等「对话」分组渲染出来再插入：否则会先落到 .mobile-scroll 顶部，
        // 位置错在第一个分组之上。分组没到时直接返回，等 observer 下一次触发。
        var group = chatGroup();
        if (!group) return;
        var li = build();
        group.appendChild(li);
        paint();

    var select = document.getElementById('dm-sendmode-select');
    if (!select) return;
    if (!window.__dmSendMode) { select.disabled = true; return; }

    // 只有下拉能改值：点击行不再切换。
    select.addEventListener('click', function (e) { e.stopPropagation(); });
    select.addEventListener('change', function () {
      var next = select.value === 'steer' ? 'steer' : 'queue';
      select.disabled = true;
      window.__dmSendMode.set(next).then(function () {
        select.disabled = false;
        paint();
        flash();
      }, function () {
        select.disabled = false;
        paint(); // 失败就回滚到宿主真值
      });
    });
  }

  // 一行提示：复用 bundle 自带的 settings-saved 样式，不新增全局样式。
  function flash() {
    var scroll = settingsPage();
    if (!scroll) return;
    var tip = document.createElement('p');
    tip.className = 'mobile-pad settings-saved';
    tip.setAttribute('role', 'status');
    tip.textContent = '已保存';
    scroll.insertBefore(tip, scroll.firstChild);
    setTimeout(function () { if (tip.parentNode) tip.parentNode.removeChild(tip); }, 1600);
  }

  window.addEventListener('dm:sendmode', paint);
  // 设置页是 SPA 渲染的：原来靠 500ms 轮询等它出现，所以「发送模式」这一行会
  // 明显晚一拍才冒出来（用户反馈"单独加载、后面才出现"）。
  // 改成 MutationObserver：设置页一挂载就（在下一帧）插入，几乎与其它行同时出现；
  // 保留 2s 的低频兜底，应对极端情况下 observer 没触发的场景。
  var queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    (window.requestAnimationFrame || function (fn) { return setTimeout(fn, 16); })(function () {
      queued = false;
      try { ensure(); } catch (e) {}
    });
  }
  try {
    var mo = new MutationObserver(schedule);
    mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
  } catch (e) {}
  setInterval(schedule, 2000);
  ensure();
  ensure();
})();
</script>`
