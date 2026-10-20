/**
 * dsh-mobile 客户端半：在 dsh 设置面板注册「掌上 dsh」设置段。
 * - 展示访问地址（局域网 + 公网，可复制）
 * - 生成 6 位配对码（桌面出码，手机在 /m/ 输入），带倒计时
 * - 已配对设备管理（撤销需二次确认）
 *
 * 通过浏览器 fetch 直连同源的 /m/api/*（桌面 GUI 请求来自回环，满足 host 端的
 * loopback 校验）。样式走主题 token，动画遵循 prefers-reduced-motion。
 */
window.__ModuleLoader__.load({
  id: 'dsh-mobile',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useState, useEffect, useCallback, useRef } = React


    // ── QR 生成（qrcode-generator 2.0.4，MIT，Copyright (c) 2009 Kazuhiko Arase）──
    // 无构建步骤的手写 client.js 不能 require npm 包；这里内联一个 MIT 的极简
    // byte-mode 编码器（约 21KB，esbuild 压缩），在客户端直接算矩阵并绘制 SVG。
    var __qrGen=(()=>{var or=(L,T)=>()=>{try{return T||L((T={exports:{}}).exports,T),T.exports}catch(N){throw T=0,N}};var vr=or((W,V)=>{var $=(function(){var L=function(x,w){var g=236,l=17,n=x,s=N[w],t=null,r=0,h=null,i=[],v={},_=function(a,f){r=n*4+17,t=(function(e){for(var u=new Array(e),o=0;o<e;o+=1){u[o]=new Array(e);for(var d=0;d<e;d+=1)u[o][d]=null}return u})(r),B(0,0),B(r-7,0),B(0,r-7),E(),C(),m(a,f),n>=7&&O(a),h==null&&(h=ir(n,s,i)),U(h,f)},B=function(a,f){for(var e=-1;e<=7;e+=1)if(!(a+e<=-1||r<=a+e))for(var u=-1;u<=7;u+=1)f+u<=-1||r<=f+u||(0<=e&&e<=6&&(u==0||u==6)||0<=u&&u<=6&&(e==0||e==6)||2<=e&&e<=4&&2<=u&&u<=4?t[a+e][f+u]=!0:t[a+e][f+u]=!1)},y=function(){for(var a=0,f=0,e=0;e<8;e+=1){_(!0,e);var u=P.getLostPoint(v);(e==0||a>u)&&(a=u,f=e)}return f},C=function(){for(var a=8;a<r-8;a+=1)t[a][6]==null&&(t[a][6]=a%2==0);for(var f=8;f<r-8;f+=1)t[6][f]==null&&(t[6][f]=f%2==0)},E=function(){for(var a=P.getPatternPosition(n),f=0;f<a.length;f+=1)for(var e=0;e<a.length;e+=1){var u=a[f],o=a[e];if(t[u][o]==null)for(var d=-2;d<=2;d+=1)for(var c=-2;c<=2;c+=1)d==-2||d==2||c==-2||c==2||d==0&&c==0?t[u+d][o+c]=!0:t[u+d][o+c]=!1}},O=function(a){for(var f=P.getBCHTypeNumber(n),e=0;e<18;e+=1){var u=!a&&(f>>e&1)==1;t[Math.floor(e/3)][e%3+r-8-3]=u}for(var e=0;e<18;e+=1){var u=!a&&(f>>e&1)==1;t[e%3+r-8-3][Math.floor(e/3)]=u}},m=function(a,f){for(var e=s<<3|f,u=P.getBCHTypeInfo(e),o=0;o<15;o+=1){var d=!a&&(u>>o&1)==1;o<6?t[o][8]=d:o<8?t[o+1][8]=d:t[r-15+o][8]=d}for(var o=0;o<15;o+=1){var d=!a&&(u>>o&1)==1;o<8?t[8][r-o-1]=d:o<9?t[8][15-o-1+1]=d:t[8][15-o-1]=d}t[r-8][8]=!a},U=function(a,f){for(var e=-1,u=r-1,o=7,d=0,c=P.getMaskFunction(f),p=r-1;p>0;p-=2)for(p==6&&(p-=1);;){for(var b=0;b<2;b+=1)if(t[u][p-b]==null){var D=!1;d<a.length&&(D=(a[d]>>>o&1)==1);var A=c(u,p-b);A&&(D=!D),t[u][p-b]=D,o-=1,o==-1&&(d+=1,o=7)}if(u+=e,u<0||r<=u){u-=e,e=-e;break}}},H=function(a,f){for(var e=0,u=0,o=0,d=new Array(f.length),c=new Array(f.length),p=0;p<f.length;p+=1){var b=f[p].dataCount,D=f[p].totalCount-b;u=Math.max(u,b),o=Math.max(o,D),d[p]=new Array(b);for(var A=0;A<d[p].length;A+=1)d[p][A]=255&a.getBuffer()[A+e];e+=b;var R=P.getErrorCorrectPolynomial(D),I=K(d[p],R.getLength()-1),S=I.mod(R);c[p]=new Array(R.getLength()-1);for(var A=0;A<c[p].length;A+=1){var X=A+S.getLength()-c[p].length;c[p][A]=X>=0?S.getAt(X):0}}for(var Z=0,A=0;A<f.length;A+=1)Z+=f[A].totalCount;for(var J=new Array(Z),Q=0,A=0;A<u;A+=1)for(var p=0;p<f.length;p+=1)A<d[p].length&&(J[Q]=d[p][A],Q+=1);for(var A=0;A<o;A+=1)for(var p=0;p<f.length;p+=1)A<c[p].length&&(J[Q]=c[p][A],Q+=1);return J},ir=function(a,f,e){for(var u=Y.getRSBlocks(a,f),o=G(),d=0;d<e.length;d+=1){var c=e[d];o.put(c.getMode(),4),o.put(c.getLength(),P.getLengthInBits(c.getMode(),a)),c.write(o)}for(var p=0,d=0;d<u.length;d+=1)p+=u[d].dataCount;if(o.getLengthInBits()>p*8)throw"code length overflow. ("+o.getLengthInBits()+">"+p*8+")";for(o.getLengthInBits()+4<=p*8&&o.put(0,4);o.getLengthInBits()%8!=0;)o.putBit(!1);for(;!(o.getLengthInBits()>=p*8||(o.put(g,8),o.getLengthInBits()>=p*8));)o.put(l,8);return H(o,u)};v.addData=function(a,f){f=f||"Byte";var e=null;switch(f){case"Numeric":e=q(a);break;case"Alphanumeric":e=z(a);break;case"Byte":e=rr(a);break;case"Kanji":e=tr(a);break;default:throw"mode:"+f}i.push(e),h=null},v.isDark=function(a,f){if(a<0||r<=a||f<0||r<=f)throw a+","+f;return t[a][f]},v.getModuleCount=function(){return r},v.make=function(){if(n<1){for(var a=1;a<40;a++){for(var f=Y.getRSBlocks(a,s),e=G(),u=0;u<i.length;u++){var o=i[u];e.put(o.getMode(),4),e.put(o.getLength(),P.getLengthInBits(o.getMode(),a)),o.write(e)}for(var d=0,u=0;u<f.length;u++)d+=f[u].dataCount;if(e.getLengthInBits()<=d*8)break}n=a}_(!1,y())},v.createTableTag=function(a,f){a=a||2,f=typeof f=="undefined"?a*4:f;var e="";e+='<table style="',e+=" border-width: 0px; border-style: none;",e+=" border-collapse: collapse;",e+=" padding: 0px; margin: "+f+"px;",e+='">',e+="<tbody>";for(var u=0;u<v.getModuleCount();u+=1){e+="<tr>";for(var o=0;o<v.getModuleCount();o+=1)e+='<td style="',e+=" border-width: 0px; border-style: none;",e+=" border-collapse: collapse;",e+=" padding: 0px; margin: 0px;",e+=" width: "+a+"px;",e+=" height: "+a+"px;",e+=" background-color: ",e+=v.isDark(u,o)?"#000000":"#ffffff",e+=";",e+='"/>';e+="</tr>"}return e+="</tbody>",e+="</table>",e},v.createSvgTag=function(a,f,e,u){var o={};typeof arguments[0]=="object"&&(o=arguments[0],a=o.cellSize,f=o.margin,e=o.alt,u=o.title),a=a||2,f=typeof f=="undefined"?a*4:f,e=typeof e=="string"?{text:e}:e||{},e.text=e.text||null,e.id=e.text?e.id||"qrcode-description":null,u=typeof u=="string"?{text:u}:u||{},u.text=u.text||null,u.id=u.text?u.id||"qrcode-title":null;var d=v.getModuleCount()*a+f*2,c,p,b,D,A="",R;for(R="l"+a+",0 0,"+a+" -"+a+",0 0,-"+a+"z ",A+='<svg version="1.1" xmlns="http://www.w3.org/2000/svg"',A+=o.scalable?"":' width="'+d+'px" height="'+d+'px"',A+=' viewBox="0 0 '+d+" "+d+'" ',A+=' preserveAspectRatio="xMinYMin meet"',A+=u.text||e.text?' role="img" aria-labelledby="'+F([u.id,e.id].join(" ").trim())+'"':"",A+=">",A+=u.text?'<title id="'+F(u.id)+'">'+F(u.text)+"</title>":"",A+=e.text?'<description id="'+F(e.id)+'">'+F(e.text)+"</description>":"",A+='<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>',A+='<path d="',b=0;b<v.getModuleCount();b+=1)for(D=b*a+f,c=0;c<v.getModuleCount();c+=1)v.isDark(b,c)&&(p=c*a+f,A+="M"+p+","+D+R);return A+='" stroke="transparent" fill="black"/>',A+="</svg>",A},v.createDataURL=function(a,f){a=a||2,f=typeof f=="undefined"?a*4:f;var e=v.getModuleCount()*a+f*2,u=f,o=e-f;return fr(e,e,function(d,c){if(u<=d&&d<o&&u<=c&&c<o){var p=Math.floor((d-u)/a),b=Math.floor((c-u)/a);return v.isDark(b,p)?0:1}else return 1})},v.createImgTag=function(a,f,e){a=a||2,f=typeof f=="undefined"?a*4:f;var u=v.getModuleCount()*a+f*2,o="";return o+="<img",o+=' src="',o+=v.createDataURL(a,f),o+='"',o+=' width="',o+=u,o+='"',o+=' height="',o+=u,o+='"',e&&(o+=' alt="',o+=F(e),o+='"'),o+="/>",o};var F=function(a){for(var f="",e=0;e<a.length;e+=1){var u=a.charAt(e);switch(u){case"<":f+="&lt;";break;case">":f+="&gt;";break;case"&":f+="&amp;";break;case'"':f+="&quot;";break;default:f+=u;break}}return f},ur=function(a){var f=1;a=typeof a=="undefined"?f*2:a;var e=v.getModuleCount()*f+a*2,u=a,o=e-a,d,c,p,b,D,A={"\u2588\u2588":"\u2588","\u2588 ":"\u2580"," \u2588":"\u2584","  ":" "},R={"\u2588\u2588":"\u2580","\u2588 ":"\u2580"," \u2588":" ","  ":" "},I="";for(d=0;d<e;d+=2){for(p=Math.floor((d-u)/f),b=Math.floor((d+1-u)/f),c=0;c<e;c+=1)D="\u2588",u<=c&&c<o&&u<=d&&d<o&&v.isDark(p,Math.floor((c-u)/f))&&(D=" "),u<=c&&c<o&&u<=d+1&&d+1<o&&v.isDark(b,Math.floor((c-u)/f))?D+=" ":D+="\u2588",I+=a<1&&d+1>=o?R[D]:A[D];I+=`
    `}return e%2&&a>0?I.substring(0,I.length-e-1)+Array(e+1).join("\u2580"):I.substring(0,I.length-1)};return v.createASCII=function(a,f){if(a=a||1,a<2)return ur(f);a-=1,f=typeof f=="undefined"?a*2:f;var e=v.getModuleCount()*a+f*2,u=f,o=e-f,d,c,p,b,D=Array(a+1).join("\u2588\u2588"),A=Array(a+1).join("  "),R="",I="";for(d=0;d<e;d+=1){for(p=Math.floor((d-u)/a),I="",c=0;c<e;c+=1)b=1,u<=c&&c<o&&u<=d&&d<o&&v.isDark(p,Math.floor((c-u)/a))&&(b=0),I+=b?D:A;for(p=0;p<a;p+=1)R+=I+`
    `}return R.substring(0,R.length-1)},v.renderTo2dContext=function(a,f){f=f||2;for(var e=v.getModuleCount(),u=0;u<e;u++)for(var o=0;o<e;o++)a.fillStyle=v.isDark(u,o)?"black":"white",a.fillRect(o*f,u*f,f,f)},v};L.stringToBytesFuncs={default:function(x){for(var w=[],g=0;g<x.length;g+=1){var l=x.charCodeAt(g);w.push(l&255)}return w}},L.stringToBytes=L.stringToBytesFuncs.default,L.createStringToBytes=function(x,w){var g=(function(){for(var n=nr(x),s=function(){var C=n.read();if(C==-1)throw"eof";return C},t=0,r={};;){var h=n.read();if(h==-1)break;var i=s(),v=s(),_=s(),B=String.fromCharCode(h<<8|i),y=v<<8|_;r[B]=y,t+=1}if(t!=w)throw t+" != "+w;return r})(),l=63;return function(n){for(var s=[],t=0;t<n.length;t+=1){var r=n.charCodeAt(t);if(r<128)s.push(r);else{var h=g[n.charAt(t)];typeof h=="number"?(h&255)==h?s.push(h):(s.push(h>>>8),s.push(h&255)):s.push(l)}}return s}};var T={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8},N={L:1,M:0,Q:3,H:2},k={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7},P=(function(){var x=[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],w=1335,g=7973,l=21522,n={},s=function(t){for(var r=0;t!=0;)r+=1,t>>>=1;return r};return n.getBCHTypeInfo=function(t){for(var r=t<<10;s(r)-s(w)>=0;)r^=w<<s(r)-s(w);return(t<<10|r)^l},n.getBCHTypeNumber=function(t){for(var r=t<<12;s(r)-s(g)>=0;)r^=g<<s(r)-s(g);return t<<12|r},n.getPatternPosition=function(t){return x[t-1]},n.getMaskFunction=function(t){switch(t){case k.PATTERN000:return function(r,h){return(r+h)%2==0};case k.PATTERN001:return function(r,h){return r%2==0};case k.PATTERN010:return function(r,h){return h%3==0};case k.PATTERN011:return function(r,h){return(r+h)%3==0};case k.PATTERN100:return function(r,h){return(Math.floor(r/2)+Math.floor(h/3))%2==0};case k.PATTERN101:return function(r,h){return r*h%2+r*h%3==0};case k.PATTERN110:return function(r,h){return(r*h%2+r*h%3)%2==0};case k.PATTERN111:return function(r,h){return(r*h%3+(r+h)%2)%2==0};default:throw"bad maskPattern:"+t}},n.getErrorCorrectPolynomial=function(t){for(var r=K([1],0),h=0;h<t;h+=1)r=r.multiply(K([1,M.gexp(h)],0));return r},n.getLengthInBits=function(t,r){if(1<=r&&r<10)switch(t){case T.MODE_NUMBER:return 10;case T.MODE_ALPHA_NUM:return 9;case T.MODE_8BIT_BYTE:return 8;case T.MODE_KANJI:return 8;default:throw"mode:"+t}else if(r<27)switch(t){case T.MODE_NUMBER:return 12;case T.MODE_ALPHA_NUM:return 11;case T.MODE_8BIT_BYTE:return 16;case T.MODE_KANJI:return 10;default:throw"mode:"+t}else if(r<41)switch(t){case T.MODE_NUMBER:return 14;case T.MODE_ALPHA_NUM:return 13;case T.MODE_8BIT_BYTE:return 16;case T.MODE_KANJI:return 12;default:throw"mode:"+t}else throw"type:"+r},n.getLostPoint=function(t){for(var r=t.getModuleCount(),h=0,i=0;i<r;i+=1)for(var v=0;v<r;v+=1){for(var _=0,B=t.isDark(i,v),y=-1;y<=1;y+=1)if(!(i+y<0||r<=i+y))for(var C=-1;C<=1;C+=1)v+C<0||r<=v+C||y==0&&C==0||B==t.isDark(i+y,v+C)&&(_+=1);_>5&&(h+=3+_-5)}for(var i=0;i<r-1;i+=1)for(var v=0;v<r-1;v+=1){var E=0;t.isDark(i,v)&&(E+=1),t.isDark(i+1,v)&&(E+=1),t.isDark(i,v+1)&&(E+=1),t.isDark(i+1,v+1)&&(E+=1),(E==0||E==4)&&(h+=3)}for(var i=0;i<r;i+=1)for(var v=0;v<r-6;v+=1)t.isDark(i,v)&&!t.isDark(i,v+1)&&t.isDark(i,v+2)&&t.isDark(i,v+3)&&t.isDark(i,v+4)&&!t.isDark(i,v+5)&&t.isDark(i,v+6)&&(h+=40);for(var v=0;v<r;v+=1)for(var i=0;i<r-6;i+=1)t.isDark(i,v)&&!t.isDark(i+1,v)&&t.isDark(i+2,v)&&t.isDark(i+3,v)&&t.isDark(i+4,v)&&!t.isDark(i+5,v)&&t.isDark(i+6,v)&&(h+=40);for(var O=0,v=0;v<r;v+=1)for(var i=0;i<r;i+=1)t.isDark(i,v)&&(O+=1);var m=Math.abs(100*O/r/r-50)/5;return h+=m*10,h},n})(),M=(function(){for(var x=new Array(256),w=new Array(256),g=0;g<8;g+=1)x[g]=1<<g;for(var g=8;g<256;g+=1)x[g]=x[g-4]^x[g-5]^x[g-6]^x[g-8];for(var g=0;g<255;g+=1)w[x[g]]=g;var l={};return l.glog=function(n){if(n<1)throw"glog("+n+")";return w[n]},l.gexp=function(n){for(;n<0;)n+=255;for(;n>=256;)n-=255;return x[n]},l})();function K(x,w){if(typeof x.length=="undefined")throw x.length+"/"+w;var g=(function(){for(var n=0;n<x.length&&x[n]==0;)n+=1;for(var s=new Array(x.length-n+w),t=0;t<x.length-n;t+=1)s[t]=x[t+n];return s})(),l={};return l.getAt=function(n){return g[n]},l.getLength=function(){return g.length},l.multiply=function(n){for(var s=new Array(l.getLength()+n.getLength()-1),t=0;t<l.getLength();t+=1)for(var r=0;r<n.getLength();r+=1)s[t+r]^=M.gexp(M.glog(l.getAt(t))+M.glog(n.getAt(r)));return K(s,0)},l.mod=function(n){if(l.getLength()-n.getLength()<0)return l;for(var s=M.glog(l.getAt(0))-M.glog(n.getAt(0)),t=new Array(l.getLength()),r=0;r<l.getLength();r+=1)t[r]=l.getAt(r);for(var r=0;r<n.getLength();r+=1)t[r]^=M.gexp(M.glog(n.getAt(r))+s);return K(t,0).mod(n)},l}var Y=(function(){var x=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12,7,37,13],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],w=function(n,s){var t={};return t.totalCount=n,t.dataCount=s,t},g={},l=function(n,s){switch(s){case N.L:return x[(n-1)*4+0];case N.M:return x[(n-1)*4+1];case N.Q:return x[(n-1)*4+2];case N.H:return x[(n-1)*4+3];default:return}};return g.getRSBlocks=function(n,s){var t=l(n,s);if(typeof t=="undefined")throw"bad rs block @ typeNumber:"+n+"/errorCorrectionLevel:"+s;for(var r=t.length/3,h=[],i=0;i<r;i+=1)for(var v=t[i*3+0],_=t[i*3+1],B=t[i*3+2],y=0;y<v;y+=1)h.push(w(_,B));return h},g})(),G=function(){var x=[],w=0,g={};return g.getBuffer=function(){return x},g.getAt=function(l){var n=Math.floor(l/8);return(x[n]>>>7-l%8&1)==1},g.put=function(l,n){for(var s=0;s<n;s+=1)g.putBit((l>>>n-s-1&1)==1)},g.getLengthInBits=function(){return w},g.putBit=function(l){var n=Math.floor(w/8);x.length<=n&&x.push(0),l&&(x[n]|=128>>>w%8),w+=1},g},q=function(x){var w=T.MODE_NUMBER,g=x,l={};l.getMode=function(){return w},l.getLength=function(t){return g.length},l.write=function(t){for(var r=g,h=0;h+2<r.length;)t.put(n(r.substring(h,h+3)),10),h+=3;h<r.length&&(r.length-h==1?t.put(n(r.substring(h,h+1)),4):r.length-h==2&&t.put(n(r.substring(h,h+2)),7))};var n=function(t){for(var r=0,h=0;h<t.length;h+=1)r=r*10+s(t.charAt(h));return r},s=function(t){if("0"<=t&&t<="9")return t.charCodeAt(0)-48;throw"illegal char :"+t};return l},z=function(x){var w=T.MODE_ALPHA_NUM,g=x,l={};l.getMode=function(){return w},l.getLength=function(s){return g.length},l.write=function(s){for(var t=g,r=0;r+1<t.length;)s.put(n(t.charAt(r))*45+n(t.charAt(r+1)),11),r+=2;r<t.length&&s.put(n(t.charAt(r)),6)};var n=function(s){if("0"<=s&&s<="9")return s.charCodeAt(0)-48;if("A"<=s&&s<="Z")return s.charCodeAt(0)-65+10;switch(s){case" ":return 36;case"$":return 37;case"%":return 38;case"*":return 39;case"+":return 40;case"-":return 41;case".":return 42;case"/":return 43;case":":return 44;default:throw"illegal char :"+s}};return l},rr=function(x){var w=T.MODE_8BIT_BYTE,g=x,l=L.stringToBytes(x),n={};return n.getMode=function(){return w},n.getLength=function(s){return l.length},n.write=function(s){for(var t=0;t<l.length;t+=1)s.put(l[t],8)},n},tr=function(x){var w=T.MODE_KANJI,g=x,l=L.stringToBytesFuncs.SJIS;if(!l)throw"sjis not supported.";(function(t,r){var h=l(t);if(h.length!=2||(h[0]<<8|h[1])!=r)throw"sjis not supported."})("\u53CB",38726);var n=l(x),s={};return s.getMode=function(){return w},s.getLength=function(t){return~~(n.length/2)},s.write=function(t){for(var r=n,h=0;h+1<r.length;){var i=(255&r[h])<<8|255&r[h+1];if(33088<=i&&i<=40956)i-=33088;else if(57408<=i&&i<=60351)i-=49472;else throw"illegal char at "+(h+1)+"/"+i;i=(i>>>8&255)*192+(i&255),t.put(i,13),h+=2}if(h<r.length)throw"illegal char at "+(h+1)},s},j=function(){var x=[],w={};return w.writeByte=function(g){x.push(g&255)},w.writeShort=function(g){w.writeByte(g),w.writeByte(g>>>8)},w.writeBytes=function(g,l,n){l=l||0,n=n||g.length;for(var s=0;s<n;s+=1)w.writeByte(g[s+l])},w.writeString=function(g){for(var l=0;l<g.length;l+=1)w.writeByte(g.charCodeAt(l))},w.toByteArray=function(){return x},w.toString=function(){var g="";g+="[";for(var l=0;l<x.length;l+=1)l>0&&(g+=","),g+=x[l];return g+="]",g},w},er=function(){var x=0,w=0,g=0,l="",n={},s=function(r){l+=String.fromCharCode(t(r&63))},t=function(r){if(!(r<0)){if(r<26)return 65+r;if(r<52)return 97+(r-26);if(r<62)return 48+(r-52);if(r==62)return 43;if(r==63)return 47}throw"n:"+r};return n.writeByte=function(r){for(x=x<<8|r&255,w+=8,g+=1;w>=6;)s(x>>>w-6),w-=6},n.flush=function(){if(w>0&&(s(x<<6-w),x=0,w=0),g%3!=0)for(var r=3-g%3,h=0;h<r;h+=1)l+="="},n.toString=function(){return l},n},nr=function(x){var w=x,g=0,l=0,n=0,s={};s.read=function(){for(;n<8;){if(g>=w.length){if(n==0)return-1;throw"unexpected end of file./"+n}var r=w.charAt(g);if(g+=1,r=="=")return n=0,-1;if(r.match(/^\s$/))continue;l=l<<6|t(r.charCodeAt(0)),n+=6}var h=l>>>n-8&255;return n-=8,h};var t=function(r){if(65<=r&&r<=90)return r-65;if(97<=r&&r<=122)return r-97+26;if(48<=r&&r<=57)return r-48+52;if(r==43)return 62;if(r==47)return 63;throw"c:"+r};return s},ar=function(x,w){var g=x,l=w,n=new Array(x*w),s={};s.setPixel=function(i,v,_){n[v*g+i]=_},s.write=function(i){i.writeString("GIF87a"),i.writeShort(g),i.writeShort(l),i.writeByte(128),i.writeByte(0),i.writeByte(0),i.writeByte(0),i.writeByte(0),i.writeByte(0),i.writeByte(255),i.writeByte(255),i.writeByte(255),i.writeString(","),i.writeShort(0),i.writeShort(0),i.writeShort(g),i.writeShort(l),i.writeByte(0);var v=2,_=r(v);i.writeByte(v);for(var B=0;_.length-B>255;)i.writeByte(255),i.writeBytes(_,B,255),B+=255;i.writeByte(_.length-B),i.writeBytes(_,B,_.length-B),i.writeByte(0),i.writeString(";")};var t=function(i){var v=i,_=0,B=0,y={};return y.write=function(C,E){if(C>>>E)throw"length over";for(;_+E>=8;)v.writeByte(255&(C<<_|B)),E-=8-_,C>>>=8-_,B=0,_=0;B=C<<_|B,_=_+E},y.flush=function(){_>0&&v.writeByte(B)},y},r=function(i){for(var v=1<<i,_=(1<<i)+1,B=i+1,y=h(),C=0;C<v;C+=1)y.add(String.fromCharCode(C));y.add(String.fromCharCode(v)),y.add(String.fromCharCode(_));var E=j(),O=t(E);O.write(v,B);var m=0,U=String.fromCharCode(n[m]);for(m+=1;m<n.length;){var H=String.fromCharCode(n[m]);m+=1,y.contains(U+H)?U=U+H:(O.write(y.indexOf(U),B),y.size()<4095&&(y.size()==1<<B&&(B+=1),y.add(U+H)),U=H)}return O.write(y.indexOf(U),B),O.write(_,B),O.flush(),E.toByteArray()},h=function(){var i={},v=0,_={};return _.add=function(B){if(_.contains(B))throw"dup key:"+B;i[B]=v,v+=1},_.size=function(){return v},_.indexOf=function(B){return i[B]},_.contains=function(B){return typeof i[B]!="undefined"},_};return s},fr=function(x,w,g){for(var l=ar(x,w),n=0;n<w;n+=1)for(var s=0;s<x;s+=1)l.setPixel(s,n,g(s,n));var t=j();l.write(t);for(var r=er(),h=t.toByteArray(),i=0;i<h.length;i+=1)r.writeByte(h[i]);return r.flush(),"data:image/gif;base64,"+r};return L})();(function(){$.stringToBytesFuncs["UTF-8"]=function(L){function T(N){for(var k=[],P=0;P<N.length;P++){var M=N.charCodeAt(P);M<128?k.push(M):M<2048?k.push(192|M>>6,128|M&63):M<55296||M>=57344?k.push(224|M>>12,128|M>>6&63,128|M&63):(P++,M=65536+((M&1023)<<10|N.charCodeAt(P)&1023),k.push(240|M>>18,128|M>>12&63,128|M>>6&63,128|M&63))}return k}return T(L)}})();(function(L){typeof define=="function"&&define.amd?define([],L):typeof W=="object"&&(V.exports=L())})(function(){return $})});return vr();})();


    const CSS = `
.dm-wrap { display: flex; flex-direction: column; gap: 16px; padding: 4px 2px; }
.dm-card {
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-1);
  border-radius: 16px; padding: 18px;
  animation: dm-in .34s cubic-bezier(.2,.75,.25,1) both;
}
.dm-card:nth-child(2) { animation-delay: .06s; }
.dm-card:nth-child(3) { animation-delay: .12s; }
.dm-title { margin: 0; font-size: 14px; font-weight: 600; color: var(--dsw-alias-label-primary); }
.dm-sub { margin: 6px 0 0; font-size: 12.5px; line-height: 18px; color: var(--dsw-alias-label-secondary); }
.dm-urlRow { display: flex; align-items: center; gap: 8px; margin-top: 10px; }
.dm-url {
  flex: 1; min-width: 0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12.5px; color: var(--dsw-alias-label-primary); word-break: break-all;
}
.dm-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  border: 1px solid var(--dsw-alias-label-primary); border-radius: 10px; padding: 9px 16px;
  font-size: 13px; font-weight: 600; cursor: pointer;
  background: var(--dsw-alias-label-primary); color: var(--dsw-alias-bg-layer-1);
  transition: background-color .16s ease, transform .09s ease, box-shadow .16s ease, opacity .16s ease;
}
.dm-btn:hover { background: var(--dsw-alias-label-primary); border-color: var(--dsw-alias-label-primary); box-shadow: 0 4px 14px var(--dsw-alias-bg-layer-1); }
.dm-btn:active { transform: scale(.97); }
.dm-btn:focus-visible { outline: 2px solid var(--dsw-alias-label-primary); outline-offset: 2px; }
.dm-btn[disabled] { opacity: .6; cursor: default; transform: none; box-shadow: none; }
.dm-ghost {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px;
  padding: 9px 16px; font-size: 13px; font-weight: 500; cursor: pointer;
  background: transparent; color: var(--dsw-alias-label-primary);
  transition: background-color .16s ease, border-color .16s ease, transform .09s ease;
}
.dm-ghost:hover { background: var(--dsw-alias-bg-layer-1); }
.dm-ghost:active { transform: scale(.97); }
.dm-ghost:focus-visible { outline: 2px solid var(--dsw-alias-label-primary); outline-offset: 2px; }
.dm-danger {
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid var(--dsw-alias-state-error-primary); border-radius: 10px; padding: 7px 12px;
  font-size: 12.5px; font-weight: 500; cursor: pointer; background: transparent; color: var(--dsw-alias-state-error-primary);
  transition: background-color .16s ease, color .16s ease, transform .09s ease;
}
.dm-danger:hover { background: var(--dsw-alias-bg-layer-1); }
.dm-danger:active { transform: scale(.96); }
.dm-danger[data-confirm="true"] { background: var(--dsw-alias-state-error-primary); color: var(--dsw-alias-bg-layer-1); }
.dm-copy {
  flex: none; border: 1px solid var(--dsw-alias-border-l2); background: transparent;
  color: var(--dsw-alias-label-secondary); border-radius: 8px; padding: 5px 10px;
  font-size: 11.5px; cursor: pointer; transition: background-color .15s, color .15s, transform .09s;
}
.dm-copy:hover { background: var(--dsw-alias-bg-layer-1); }
.dm-copy:active { transform: scale(.95); }
.dm-copy[data-copied="true"] { border-color: var(--dsw-alias-label-primary); color: var(--dsw-alias-label-primary); }
.dm-code {
  margin: 8px 0 2px; text-align: center;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 30px; font-weight: 700; letter-spacing: 6px; color: var(--dsw-alias-label-primary);
  animation: dm-pop .4s cubic-bezier(.2,.8,.25,1.1) both;
}
.dm-codeExpired { opacity: .45; text-decoration: line-through; }
.dm-count { text-align: center; font-size: 12px; color: var(--dsw-alias-label-secondary); }
.dm-count b { color: var(--dsw-alias-label-primary); font-weight: 600; font-variant-numeric: tabular-nums; }
.dm-row {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 11px 0; border-top: 1px solid var(--dsw-alias-border-l1);
  animation: dm-in .28s ease both;
}
.dm-row:first-of-type { border-top: 0; }
.dm-name { font-size: 13.5px; font-weight: 500; color: var(--dsw-alias-label-primary); }
.dm-detail { font-size: 12px; color: var(--dsw-alias-label-secondary); margin-top: 2px; }
.dm-muted { color: var(--dsw-alias-label-secondary); font-size: 13px; }
.dm-err { color: var(--dsw-alias-state-error-primary); font-size: 12.5px; margin-top: 10px; }
.dm-domain { margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--dsw-alias-border-l2); }
.dm-domainHead { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; }
.dm-domainLabel { font-size: 12.5px; font-weight: 600; color: var(--dsw-alias-label-primary); }
.dm-domainHint { font-size: 11.5px; color: var(--dsw-alias-label-secondary); }
.dm-input {
  flex: 1; min-width: 0; height: 34px; padding: 0 10px; border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2); background: transparent;
  color: var(--dsw-alias-label-primary); font-size: 12.5px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
.dm-input::placeholder { color: var(--dsw-alias-label-secondary); }
.dm-input:focus { outline: none; border-color: var(--dsw-alias-label-primary); box-shadow: 0 0 0 2px var(--dsw-alias-bg-layer-1); }
.dm-btnSm { padding: 8px 14px; font-size: 12.5px; }
.dm-actions { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 12px; }
.dm-spin {
  width: 14px; height: 14px; border: 2px solid var(--dsw-alias-bg-layer-1);
  border-top-color: var(--dsw-alias-bg-layer-1); border-radius: 50%;
  animation: dm-rot .8s linear infinite;
}
.dm-spinGhost {
  width: 14px; height: 14px; border: 2px solid var(--dsw-alias-bg-layer-1);
  border-top-color: var(--dsw-alias-label-primary); border-radius: 50%;
  animation: dm-rot .8s linear infinite;
}
.dm-live { display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; color: var(--dsw-alias-label-secondary); }
.dm-liveDot { width: 7px; height: 7px; border-radius: 50%; background: var(--dsw-alias-label-primary); box-shadow: 0 0 0 0 var(--dsw-alias-bg-layer-1); animation: dm-pulse 2s infinite; }
.dm-liveDotOff { background: var(--dsw-alias-label-secondary); animation: none; }
/* ── 连接二维码：单码 + 地址切换器（与设置卡片同一套 token/圆角/间距）── */
.dm-cardHead { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
/* 二维码卡：主视觉只有一张码、一行地址、一行提示、两条折叠备用路径 */
/* 引导式两步：① 选择网络（radio 列表） ② 扫码连接（140–150px 小码） */
/* 连接向导：只用 DSH 主题 token（无自定义配色 / 阴影 / 装饰） */
.dm-help {
  border: 0; background: transparent; padding: 0;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px; line-height: 1; cursor: help;
}
.dm-page { margin-top: 8px; }
.dm-stepText { margin: 0 0 6px; font-size: 11.5px; line-height: 16px; color: var(--dsw-alias-label-secondary); }
.dm-pageTitle { margin: 0 0 8px; font-size: 13px; font-weight: 600; line-height: 19px; color: var(--dsw-alias-label-primary); }
.dm-netList { list-style: none; margin: 0; padding: 0; }
.dm-netItem + .dm-netItem { border-top: 1px solid var(--dsw-alias-border-l1); }
.dm-netRow {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 2px; cursor: pointer;
  font-size: 12.5px; line-height: 18px; color: var(--dsw-alias-label-primary);
}
.dm-netRowUnset { color: var(--dsw-alias-label-secondary); }
.dm-netRadio { flex: none; margin: 0; }
.dm-netLabel { flex: none; font-weight: 500; }
.dm-netAddr {
  flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11.5px; color: var(--dsw-alias-label-secondary);
}
.dm-netUnsetText { flex: 1; min-width: 0; font-size: 11.5px; color: var(--dsw-alias-label-secondary); }
.dm-netEdit, .dm-netOpen {
  flex: none; border: 0; background: transparent; padding: 0 2px;
  color: var(--dsw-alias-label-secondary); font-size: 12px; cursor: pointer;
}
.dm-netEdit { text-decoration: underline; }
.dm-remoteForm { margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--dsw-alias-border-l1); }
.dm-remoteHint { margin: 0 0 6px; font-size: 11.5px; line-height: 16px; color: var(--dsw-alias-label-secondary); }
.dm-remoteRow { display: flex; align-items: center; gap: 8px; }
.dm-input {
  flex: 1; min-width: 0; height: 32px; padding: 0 10px; border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2); background: transparent;
  color: var(--dsw-alias-label-primary); font-size: 12.5px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
.dm-input:focus { outline: none; border-color: var(--dsw-alias-border-l2); }
.dm-stepBtn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 7px 14px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px;
  background: transparent; color: var(--dsw-alias-label-primary);
  font-size: 12.5px; font-weight: 500; line-height: 18px; cursor: pointer;
}
.dm-stepBtn:hover { background: var(--dsw-alias-bg-layer-1); }
.dm-stepBtn:disabled { opacity: 0.55; cursor: default; }
.dm-stepBtnPrimary { font-weight: 600; }
.dm-pageActions { display: flex; align-items: center; gap: 8px; margin-top: 12px; }
.dm-pageTools { display: flex; align-items: center; gap: 12px; margin-top: 6px; }
.dm-toolBtn {
  display: inline-flex; align-items: center; gap: 4px;
  border: 0; background: transparent; padding: 0;
  color: var(--dsw-alias-label-secondary); font-size: 11.5px; line-height: 16px; cursor: pointer;
}
.dm-toolGlyph { display: inline-flex; align-items: center; justify-content: center; }
.dm-qrCard {
  display: inline-grid; place-items: center; padding: 8px;
  border-radius: 10px; border: 1px solid var(--dsw-alias-border-l1);
  /* 二维码白底是扫码必需（黑白对比），不属于面板配色 */
  background: #ffffff;
}
.dm-qrCard svg { display: block; }
.dm-scanHint { margin: 8px 0 0; font-size: 12px; line-height: 17px; color: var(--dsw-alias-label-secondary); }
.dm-summaryLine { margin: 0; font-size: 12.5px; line-height: 18px; color: var(--dsw-alias-label-secondary); }
.dm-devicesOneLine { margin: 10px 2px 0; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); }
.dm-cardTight { padding: 12px 16px; }
.dm-collapse { margin-top: 14px; border-top: 1px dashed var(--dsw-alias-border-l2); padding-top: 10px; }
.dm-collapseHead { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 4px 0; border: 0; background: transparent; cursor: pointer; color: var(--dsw-alias-label-secondary); font-size: 12.5px; font-weight: 500; }
.dm-collapseCaret { font-size: 12px; }
.dm-collapseBody { padding-top: 10px; }
@keyframes dm-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes dm-pop { 0% { opacity: 0; transform: scale(.86); } 62% { transform: scale(1.05); } 100% { opacity: 1; transform: scale(1); } }
@keyframes dm-rot { to { transform: rotate(360deg); } }
/* ── 定稿（A · 极简留白）：大字级对比 + 留白分组，全部 DSH token ── */
.dm-connectCard { position: relative; border: 0; background: transparent; padding: 24px 24px 16px; }
.dm-connectHead { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 20px; }
.dm-headRight { flex: none; display: inline-flex; align-items: center; gap: 8px; }
.dm-pageTitle { margin: 0; font-size: 16px; font-weight: 600; letter-spacing: -0.2px; line-height: 22px; color: var(--dsw-alias-label-primary); }
.dm-stepTag { flex: none; padding-top: 2px; font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-tertiary); font-variant-numeric: tabular-nums; }
.dm-page.dm-inner { padding: 0; background: transparent; border: 0; animation: dm-page-in 160ms ease both; }
@keyframes dm-page-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) { .dm-page.dm-inner { animation: none; } }
.dm-netList { margin: 0; }
.dm-netItem + .dm-netItem { margin: 0 6px; }
.dm-netRow { min-height: 44px; padding: 0 2px; }
.dm-qrStage { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.dm-qrWrap { flex: 1; display: flex; justify-content: center; padding: 4px 0; }
.dm-qrCard { padding: 8px; border-radius: 12px; border: 1px solid var(--dsw-alias-border-l1); background: #ffffff; }
.dm-scanHint { text-align: center; margin: 8px 0 0; }
.dm-pageTools { justify-content: center; margin-top: 10px; }
.dm-pageActions { margin-top: 20px; }
.dm-navRow { display: flex; justify-content: flex-end; margin-top: 16px; }
.dm-arrow {
  flex: none; display: inline-flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 2px; min-width: 48px; min-height: 56px; padding: 6px;
  border: 0; background: transparent; cursor: pointer;
  color: var(--dsw-alias-label-tertiary);
  transition: color 120ms ease;
}
.dm-arrow:hover, .dm-arrow:active, .dm-arrow:focus-visible { color: var(--dsw-alias-label-primary); }
.dm-arrow:disabled { opacity: 0.4; cursor: default; }
.dm-arrowGlyph { font-size: 20px; line-height: 20px; }
.dm-arrowLabel { font-size: 12px; line-height: 16px; color: var(--dsw-alias-label-tertiary); }
.dm-arrow:hover .dm-arrowLabel, .dm-arrow:active .dm-arrowLabel { color: var(--dsw-alias-label-primary); }
@media (prefers-reduced-motion: reduce) { .dm-arrow { transition: none; } }
.dm-stepBtn { height: 36px; padding: 0 16px; border-radius: 8px; }
.dm-stepBtnPrimary {
  border-color: transparent;
  background: var(--dsw-alias-button-primary-fill);
  color: var(--dsw-alias-label-primary-foreground);
  font-weight: 600;
}
.dm-stepBtnPrimary:hover { background: var(--dsw-alias-button-primary-hover); }
.dm-stepBtnGhost { border-color: transparent; background: transparent; padding: 0 8px; font-weight: 400; }
.dm-stepBtnGhost:hover { background: var(--dsw-alias-interactive-bg-hover); }
.dm-summaryLine { margin-top: 2px; }
.dm-devicesOneLine { margin: 4px 2px 0; }
@keyframes dm-pulse { 0% { box-shadow: 0 0 0 0 var(--dsw-alias-bg-layer-1); } 70% { box-shadow: 0 0 0 6px var(--dsw-alias-bg-layer-1); } 100% { box-shadow: 0 0 0 0 var(--dsw-alias-bg-layer-1); } }
@media (prefers-reduced-motion: reduce) {
  .dm-card, .dm-row, .dm-code { animation: none !important; }
  .dm-btn, .dm-ghost, .dm-danger, .dm-copy { transition: none !important; }
  .dm-liveDot { animation: none !important; }
  .dm-spin, .dm-spinGhost { animation-duration: 1.6s !important; }
}
`

    function fmt(ms) {
      if (!ms) return '—'
      const d = new Date(ms)
      const now = new Date()
      const sameDay = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
      return sameDay
        ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    function remaining(expiresAt, now) {
      const ms = Math.max(0, (expiresAt || 0) - now)
      const s = Math.ceil(ms / 1000)
      const m = Math.floor(s / 60)
      return `${String(m).padStart(1, '0')}:${String(s % 60).padStart(2, '0')}`
    }

    /**
     * UA → 「平台 · 浏览器」+ 能拿到的型号。与宿主端 describeDeviceUA 同一套规则：
     * 华为 ArkWeb 的 UA 把型号写死成 "Phone"（只有 OpenHarmony/HarmonyOS + 浏览器），
     * 夸克等 Android UA 常带型号（如 PLQ110），Windows/iOS 则只能给平台。
     */
    function describeDeviceUA(userAgent) {
      const ua = String(userAgent || '')
      const grab = (re) => {
        const hit = re.exec(ua)
        return hit && typeof hit[1] === 'string' ? hit[1] : ''
      }
      let platform = ''
      if (/OpenHarmony|HarmonyOS/i.test(ua)) {
        const v = grab(/OpenHarmony\s+([\d.]+)/i) || grab(/HarmonyOS\s+([\d.]+)/i)
        platform = v === '' ? 'HarmonyOS' : 'HarmonyOS ' + v
      } else if (/Android/i.test(ua)) {
        const v = grab(/Android\s+([\d.]+)/i)
        platform = v === '' ? 'Android' : 'Android ' + v
      } else if (/iPhone|iPad|iPod/i.test(ua)) {
        platform = 'iOS'
      } else if (/Windows NT 10/i.test(ua)) {
        platform = 'Windows'
      } else if (/Macintosh|Mac OS X/i.test(ua)) {
        platform = 'macOS'
      } else if (/Linux/i.test(ua)) {
        platform = 'Linux'
      }
      let browser = ''
      const browsers = [
        [/HuaweiBrowser\/([\d.]+)/i, '华为浏览器'],
        [/Quark\/([\d.]+)/i, '夸克'],
        [/MicroMessenger\/([\d.]+)/i, '微信'],
        [/Edg\/([\d.]+)/i, 'Edge'],
        [/Firefox\/([\d.]+)/i, 'Firefox'],
        [/Chrome\/([\d.]+)/i, 'Chrome'],
        [/Version\/([\d.]+)[\s\S]*Safari/i, 'Safari'],
      ]
      for (const [re, name] of browsers) {
        const v = grab(re)
        if (v !== '') {
          browser = name + ' ' + v.split('.')[0]
          break
        }
      }
      let model = ''
      if (!/OpenHarmony|HarmonyOS/i.test(ua)) {
        if (/iPhone/i.test(ua)) model = 'iPhone'
        else if (/iPad/i.test(ua)) model = 'iPad'
        else if (/Android/i.test(ua)) {
          const hit = /Android[^;)]*;\s*(?:[A-Za-z]{2}-[A-Za-z]{2};\s*)?([^;)]+?)\s*(?:Build\/|\))/i.exec(ua)
          const token = hit && typeof hit[1] === 'string' ? hit[1].replace(/^U;\s*/i, '').trim() : ''
          if (token.length >= 2 && !/^wv$/i.test(token) && !/^Android$/i.test(token)) model = token.slice(0, 40)
        }
      }
      return { model, platform, browser, label: [platform, browser].filter((s) => s !== '').join(' · ') }
    }

    /** 已配对设备 → 列表两行：手动改名优先，其次型号 / 「平台 · 浏览器」。 */
    function describeDevice(d) {
      const info = describeDeviceUA(d.userAgent)
      const model = typeof d.model === 'string' && d.model !== '' ? d.model : info.model
      const label = typeof d.label === 'string' && d.label !== '' ? d.label : info.label
      const name = typeof d.name === 'string' && d.name !== '' && d.name !== '手机设备' ? d.name : ''
      const title = name || model || label || '设备'
      const bits = []
      if (model !== '' && model !== title) bits.push(model)
      if (label !== '' && label !== title) bits.push(label)
      // 不再显示 deviceId（e4430… 这种十六进制串）：设备已经能靠型号/平台区分，
      // 长串只会把第二行挤满；内部仍用它做 key / 撤销请求。
      bits.push('最近活跃 ' + fmt(d.lastSeenAt))
      return { title, detail: bits.join(' · ') }
    }

    /**
     * 访问地址里「局域网」只保留 RFC1918 私网地址。
     * 有些机器上会多出 VPN / 虚拟网卡的公网段 IPv4（例如 2.0.1.1/24），
     * 那不是手机能用来直连的入口，混进来就会显示成三条地址。
     */
    /**
     * 扫码即配对的链接：手机打开 /m/ 后自动用 ?code= 完成配对（与手输 6 位码
     * 等价），不需要再手动确认。
     * @param base - 地址（含协议/端口，不含尾斜杠）
     * @param code - 6 位配对码
     */
    function qrUrl(base, code) {
      const origin = String(base || '').replace(/\/+$/, '')
      return origin + '/m/?code=' + encodeURIComponent(String(code))
    }

    /**
     * 把文本生成二维码 SVG 字符串（quiet zone 4 个模块）。
     * @param text - 要编码的 URL
     * @param size - 渲染边长（px）
     */
    function qrSvg(text, size, quietZone) {
      let qr = null
      for (let v = 1; v <= 40; v += 1) {
        try {
          const candidate = __qrGen(v, 'M')
          candidate.addData(text)
          candidate.make()
          qr = candidate
          break
        } catch (e) { /* 容量不够就换下一个版本 */ }
      }
      if (!qr) return ''
      const n = qr.getModuleCount()
      // 二维码右下角要叠两个小图标按钮：留 8 个模块的静区，图标只压在静区上，
      // 不遮挡任何数据模块（不牺牲可扫性）。
      const quiet = quietZone === undefined ? 4 : quietZone
      const total = n + quiet * 2
      let path = ''
      for (let r = 0; r < n; r += 1) {
        for (let c = 0; c < n; c += 1) {
          if (!qr.isDark(r, c)) continue
          path += 'M' + (c + quiet) + ' ' + (r + quiet) + 'h1v1h-1z'
        }
      }
      return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size +
        '" viewBox="0 0 ' + total + ' ' + total + '" shape-rendering="crispEdges" role="img" aria-label="连接二维码">' +
        '<rect width="' + total + '" height="' + total + '" fill="#fff"></rect>' +
        '<path d="' + path + '" fill="#000"></path></svg>'
    }

    function lanOnly(urls) {
      const isPrivate = (host) =>
        host.startsWith('10.') || host.startsWith('192.168.') || /^172\.(1[6-9]|2\d|3[01])\./.test(host)
      return (Array.isArray(urls) ? urls : []).filter((u) => {
        try {
          return isPrivate(new URL(u).hostname)
        } catch {
          return false
        }
      })
    }

    async function copyText(text) {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text)
          return true
        }
      } catch {}
      try {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        const ok = document.execCommand('copy')
        document.body.removeChild(ta)
        return ok
      } catch {
        return false
      }
    }

    function MobileSettings() {
      const [status, setStatus] = useState(null)
      const [code, setCode] = useState(null)
      const [issuing, setIssuing] = useState(false)
      const [err, setErr] = useState('')
      const [copied, setCopied] = useState('')
      const [confirmRevoke, setConfirmRevoke] = useState('')
      const [domainDraft, setDomainDraft] = useState('')
      const [domainBusy, setDomainBusy] = useState(false)
      const [domainErr, setDomainErr] = useState('')
      // 连接二维码：当前选中的地址 + 切换面板 + 「远程连接（可选）」折叠区
      const [selectedBase, setSelectedBase] = useState('')
      const [wizardStep, setWizardStep] = useState(1)   // 1 / 2 / 0=完成后的摘要态
      const [remoteOpen, setRemoteOpen] = useState(false)
      // 手动重画二维码用：固定配对码下重画不改变内容，但保留入口以防宿主轮换码。
      const [qrVersion, setQrVersion] = useState(0)
      const domainEdited = useRef(false)
      const confirmTimer = useRef()
      const copyTimer = useRef()

      const refresh = useCallback(() => {
        fetch('/m/api/status')
          .then((r) => r.json())
          .then((j) => {
            if (!j || !j.ok) return
            setStatus(j)
            // 域名输入框：用户正在编辑时不要被轮询覆盖。
            if (!domainEdited.current) setDomainDraft((j.addresses && j.addresses.publicBase) || '')
            // 宿主端已有待配对码时同步显示（例如另一处生成）。
            if (j.pending) setCode((cur) => cur ?? { code: j.pending.code, expiresAt: j.pending.expiresAt })
          })
          .catch(() => {})
      }, [])

      useEffect(() => {
        refresh()
        const t = setInterval(refresh, 4000)
        return () => clearInterval(t)
      }, [refresh])

      useEffect(() => () => {
        clearTimeout(confirmTimer.current)
        clearTimeout(copyTimer.current)
      }, [])

      const issue = () => {
        if (issuing) return
        setErr('')
        setIssuing(true)
        fetch('/m/api/pair/issue', { method: 'POST' })
          .then((r) => r.json())
          .then((j) => {
            if (j && j.ok) setCode({ code: j.code, expiresAt: j.expiresAt })
            else setErr((j && j.error) || '生成失败')
          })
          .catch(() => setErr('生成失败：无法访问宿主机'))
          .finally(() => setIssuing(false))
      }

      const revoke = (deviceId) => {
        if (confirmRevoke !== deviceId) {
          setConfirmRevoke(deviceId)
          clearTimeout(confirmTimer.current)
          confirmTimer.current = setTimeout(() => setConfirmRevoke(''), 3000)
          return
        }
        clearTimeout(confirmTimer.current)
        setConfirmRevoke('')
        fetch('/m/api/device/revoke', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId }),
        }).then(() => refresh()).catch(() => {})
      }

      /** 保存 / 清除公网域名（空串 = 清除，回到 profile 配置）。 */
      const saveDomain = (value) => {
        if (domainBusy) return
        setDomainErr('')
        setDomainBusy(true)
        fetch('/m/api/domain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: value }),
        })
          .then((r) => r.json())
          .then((j) => {
            if (j && j.ok) {
              domainEdited.current = false
              setRemoteOpen(false)
              refresh()
            } else {
              setDomainErr((j && j.error) || '保存失败')
            }
          })
          .catch(() => setDomainErr('保存失败：无法访问宿主机'))
          .finally(() => setDomainBusy(false))
      }

      const clearDomain = () => {
        setDomainDraft('')
        saveDomain('')
      }

      const onCopy = async (url) => {
        const ok = await copyText(url)
        if (!ok) return
        setCopied(url)
        clearTimeout(copyTimer.current)
        copyTimer.current = setTimeout(() => setCopied(''), 1800)
      }

      const addrs = (status && status.addresses) || { lan: [], publicBase: null }
      const devices = (status && status.devices) || []
      const lanBases = lanOnly(addrs.lan)
      const publicBase = addrs.publicBase || ''
      const urls = [...lanBases, ...(publicBase ? [publicBase] : [])]
      // 「清除」只在用户自己填过域名时出现；没填时 publicBase 来自 profile 配置，
      // 清掉只会回到配置值，按钮会误导。
      const hasDomainOverride = addrs.publicBaseCustom === true
      // 二维码内部仍用 6 位配对码拼 ?code=，但它不再作为 UI 概念出现。
      const pairingCode = code ? String(code.code || '') : ''
      const candidates = [...lanBases, ...(publicBase ? [publicBase] : [])]
      // 默认选中规则（用户口径）：配了公网地址 → 默认公网（在家在外都能连）；
      // 没配 → 默认第一个局域网地址。用户手动切换后保持其选择。
      const defaultBase = publicBase !== '' ? publicBase : (lanBases[0] || '')
      const activeBase = candidates.indexOf(selectedBase) >= 0 ? selectedBase : defaultBase
      const isPublicSelected = activeBase !== '' && activeBase === publicBase
      const qrText = pairingCode && activeBase ? qrUrl(activeBase, pairingCode) : ''
      const displayAddr = (base) => String(base || '').replace(/^https?:\/\//, '').replace(/\/+$/, '')
      const selectedReason = publicBase !== '' ? '已配置公网地址，默认选公网' : '未配置公网地址，默认选第一个局域网地址'

      // 全部解释性文字都收进标题旁的 (?)：正文只留步骤标题与最必要的一行。
      // 所有解释都收在这里；正文只保留步骤必要的两行字。
      const HELP_TEXT = [
        '扫码即连：手机扫码后自动配对，无需输入配对码。',
        '扫不开 / 没反应：多半是手机与电脑不在同一网络（例如电脑有线、手机用流量），把手机接到同一 Wi-Fi，或选择「公网」。',
        '公网地址需要一条反向代理 / 隧道（frp、Cloudflare Tunnel、Tailscale 均可）。',
      ].join(' ')

      // 分页导航箭头：左=上一步，右=下一步/完成；热区 ≥40×40，视觉 20px。
      const navArrow = (direction, label, glyph, onClick, disabled) => h('button', {
        type: 'button',
        className: 'dm-arrow dm-arrow-' + direction,
        'aria-label': label,
        title: label,
        disabled: disabled === true,
        onClick: onClick,
      },
        h('span', { className: 'dm-arrowGlyph' }, glyph),
        h('span', { className: 'dm-arrowLabel' }, label),
      )

      const regenerate = () => {
        setQrVersion((v) => v + 1)
        issue()
      }

      const copyGlyph = copied === qrText
        ? h('span', { className: 'dm-toolGlyph' }, '✓')
        : h('span', {
            className: 'dm-toolGlyph',
            dangerouslySetInnerHTML: {
              __html: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><rect x="5.5" y="5.5" width="8" height="8" rx="1.6"></rect><path d="M10.5 3.5H3.9A1.4 1.4 0 0 0 2.5 4.9v6.6"></path></svg>',
            },
          })

      // ── 第 1 页：选择网络（原生 radio，不用自绘圆圈/填色）──
      const netOptions = lanBases.map((base) => ({ base: base, kind: 'lan', configured: true }))
      netOptions.push({ base: publicBase, kind: 'public', configured: publicBase !== '' })

      const netNodes = netOptions.map((option) => {
        const active = option.configured && option.base === activeBase
        const label = option.kind === 'public' ? '公网' : '局域网'
        return h('li', { key: option.kind + ':' + option.base, className: 'dm-netItem' },
          h('label', { className: 'dm-netRow' + (option.configured ? '' : ' dm-netRowUnset') },
            h('input', {
              type: 'radio',
              name: 'dm-connect-net',
              className: 'dm-netRadio',
              checked: active,
              disabled: !option.configured,
              'data-kind': option.kind,
              'data-base': option.base,
              onChange: () => {
                if (!option.configured) { setRemoteOpen(true); return }
                setSelectedBase(option.base)
                setRemoteOpen(false)
              },
            }),
            h('span', { className: 'dm-netLabel' }, label),
            option.configured
              ? h('code', { className: 'dm-netAddr' }, displayAddr(option.base))
              : h('span', { className: 'dm-netUnsetText' }, '未配置'),
            option.kind === 'public' && option.configured
              ? h('button', {
                  type: 'button',
                  className: 'dm-netEdit',
                  onClick: (event) => { event.preventDefault(); setRemoteOpen(true) },
                }, '编辑')
              : null,
            option.configured
              ? null
              : h('button', {
                  type: 'button',
                  className: 'dm-netOpen',
                  onClick: (event) => { event.preventDefault(); setRemoteOpen(true) },
                }, '›'),
          ),
        )
      })

      const remoteFormNode = remoteOpen
        ? h('div', { className: 'dm-remoteForm' },
            h('p', { className: 'dm-remoteHint' }, '公网域名（可选，不在同一局域网时使用）'),
            h('div', { className: 'dm-remoteRow' },
              h('input', {
                className: 'dm-input',
                value: domainDraft,
                placeholder: 'https://example.com:45632',
                spellCheck: false,
                autoCapitalize: 'none',
                autoCorrect: 'off',
                onChange: (e) => {
                  domainEdited.current = true
                  setDomainDraft(e.target.value)
                  setDomainErr('')
                },
                onKeyDown: (e) => {
                  if (e.key === 'Enter') saveDomain(domainDraft.trim())
                },
              }),
              h('button', {
                type: 'button',
                className: 'dm-stepBtn',
                disabled: domainBusy,
                onClick: () => saveDomain(domainDraft.trim()),
              }, domainBusy ? '保存中…' : '保存'),
              addrs.publicBaseCustom
                ? h('button', { type: 'button', className: 'dm-stepBtn', disabled: domainBusy, onClick: clearDomain }, '清除')
                : null,
            ),
            domainErr ? h('p', { className: 'dm-err' }, domainErr) : null,
          )
        : null

      const step1Node = h('div', { key: 'connect-page-1', className: 'dm-page dm-inner' },
        h('div', { className: 'dm-connectHead' },
          h('p', { className: 'dm-pageTitle' }, '选择手机连接的网络'),
          h('span', { className: 'dm-headRight' },
            h('span', { className: 'dm-stepTag' }, '1/2'),
            h('span', { className: 'dm-help', role: 'note', tabIndex: 0, title: HELP_TEXT, 'aria-label': HELP_TEXT }, '?'),
          ),
        ),
        h('ul', { className: 'dm-netList' }, netNodes),
        remoteFormNode,
        h('div', { className: 'dm-navRow' },
          navArrow('right', '下一步', '›', () => setWizardStep(2), activeBase === ''),
        ),
      )

      // ── 第 2 页：扫码连接（160px 二维码，1px hairline，无投影）──
      const qrCardNode = h('div', { className: 'dm-qrCard', 'data-qr-url': qrText },
        h('div', { dangerouslySetInnerHTML: { __html: qrSvg(qrText, 124) } }),
      )

      const step2Node = h('div', { key: 'connect-page-2', className: 'dm-page dm-inner' },
        h('div', { className: 'dm-connectHead' },
          h('p', { className: 'dm-pageTitle' }, '用手机扫描二维码'),
          h('span', { className: 'dm-headRight' },
            h('span', { className: 'dm-stepTag' }, '2/2'),
            h('span', { className: 'dm-help', role: 'note', tabIndex: 0, title: HELP_TEXT, 'aria-label': HELP_TEXT }, '?'),
          ),
        ),
        h('div', { className: 'dm-qrStage' },
          navArrow('left', '上一步', '‹', () => setWizardStep(1)),
          h('div', { className: 'dm-qrWrap' },
            pairingCode && activeBase
              ? qrCardNode
              : h('p', { className: 'dm-muted' }, '正在生成二维码…'),
          ),
          navArrow('right', '完成', '›', () => setWizardStep(0)),
        ),
        h('p', { className: 'dm-scanHint' }, '扫码后自动配对，无需输入配对码'),
        h('div', { className: 'dm-pageTools' },
          h('button', {
            type: 'button',
            className: 'dm-toolBtn',
            'aria-label': '复制链接',
            title: '复制链接',
            onClick: () => onCopy(qrText),
          }, copyGlyph, h('span', null, copied === qrText ? '已复制' : '复制链接')),
          h('button', {
            type: 'button',
            className: 'dm-toolBtn',
            'aria-label': '刷新二维码',
            title: '刷新二维码',
            onClick: regenerate,
          }, '刷新'),
        ),
      )

      // 完成后：摘要态（可重新进入向导）
      const summaryNode = h('div', { key: 'connect-page-0', className: 'dm-page dm-inner' },
        h('div', { className: 'dm-connectHead' },
          h('p', { className: 'dm-pageTitle' }, '连接手机'),
          h('span', { className: 'dm-headRight' },
            h('span', { className: 'dm-stepTag' }, '完成'),
            h('span', { className: 'dm-help', role: 'note', tabIndex: 0, title: HELP_TEXT, 'aria-label': HELP_TEXT }, '?'),
          ),
        ),
        h('p', { className: 'dm-summaryLine' }, activeBase ? ('已选择 ' + displayAddr(activeBase)) : '未选择网络'),
        h('div', { className: 'dm-pageActions' },
          h('button', { type: 'button', className: 'dm-stepBtn dm-stepBtnGhost', onClick: () => setWizardStep(1) }, '重新设置'),
        ),
      )

      const wizardNode = wizardStep === 1 ? step1Node : wizardStep === 2 ? step2Node : summaryNode

      const errNode = err ? h('p', { className: 'dm-err' }, err) : null

      const deviceRowNodes = devices.map((d, i) => {
        const desc = describeDevice(d)
        return h('div', { key: d.deviceId, className: 'dm-row', style: { animationDelay: (i * 40) + 'ms' } },
          h('div', null,
            h('div', { className: 'dm-name', title: d.userAgent || '' }, desc.title),
            h('div', { className: 'dm-detail' }, desc.detail),
          ),
          h('button', {
            type: 'button',
            className: 'dm-danger',
            'data-confirm': confirmRevoke === d.deviceId ? 'true' : 'false',
            onClick: () => revoke(d.deviceId),
          }, confirmRevoke === d.deviceId ? '确认撤销？' : '撤销'),
        )
      })

      const devicesNode = devices.length === 0
        ? h('p', { className: 'dm-devicesOneLine' }, '已配对设备 · 暂无')
        : h('div', { className: 'dm-card dm-cardTight' },
            h('p', { className: 'dm-title' }, '已配对设备（' + devices.length + '）'),
            deviceRowNodes,
          )

      useEffect(() => {
        // 配置变化（新增/清除公网域名、网卡增减）时回到默认选择；
        // 同一批候选里用户切换过的选择保持不动。
        setSelectedBase((current) => (candidates.indexOf(current) >= 0 ? current : defaultBase))
      }, [publicBase, lanBases.join('|')])

      useEffect(() => {
        // 公网域名刚配置好（'' → 非空）：自动选中公网并出码，符合「保存后自动出码」。
        if (publicBase !== '') setSelectedBase(publicBase)
      }, [publicBase])

      useEffect(() => {
        // 二维码内部依赖 ?code=：状态里没有码时静默取一次；配对码不再作为
        // UI 概念出现（宿主默认是固定码，取一次即可长期有效）。
        if (!code && !issuing) issue()
      }, [code, issuing])

      return h('div', { className: 'dm-wrap' },
        h('style', { dangerouslySetInnerHTML: { __html: CSS } }),

        // ── 连接二维码（主路径：单码 + 地址切换；备用：配对码 / 远程连接 折叠）──
        h('div', { className: 'dm-card dm-connectCard', 'data-qr-card': '1' },
          wizardNode,
          errNode,
        ),
        devicesNode,
      )
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('settings.section', () => ctx.slots.register({
          name: 'settings.section',
          id: 'dsh-mobile',
          order: 100,
          label: '掌上 dsh',
        }, MobileSettings))
      },
    }
  },
})
