/**
 * 迁移 C：1:1 搬自宿主 index.js 的 `DEVICE_INFO_HTML` 注入字符串。
 * 设备信息（当前设备/平台）
 *
 * 由 `dm-patches/index.ts` 在 bundle 启动时按原顺序安装。
 */
export const DEVICE_INFO_HTML = `<script>
(function () {
  try {
    var send = function (info) {
      try {
        fetch('/m/api/mobile.reportDevice', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({
            type: 'client-request',
            rpcId: 'dev-' + String(Date.now()),
            method: 'mobile.reportDevice',
            payload: info
          })
        }).catch(function () {});
      } catch (e) {}
    };
    var ua = typeof navigator === 'object' && typeof navigator.userAgent === 'string' ? navigator.userAgent : '';
    var data = typeof navigator === 'object' ? navigator.userAgentData : null;
    if (data && typeof data.getHighEntropyValues === 'function') {
      data.getHighEntropyValues(['model', 'platform', 'platformVersion']).then(function (v) {
        send({
          model: v && typeof v.model === 'string' ? v.model : '',
          platform: v && typeof v.platform === 'string' ? v.platform : '',
          platformVersion: v && typeof v.platformVersion === 'string' ? v.platformVersion : '',
          ua: ua
        });
      }, function () {
        send({ ua: ua });
      });
    } else {
      send({ ua: ua });
    }
  } catch (e) {}
})();
</script>`
