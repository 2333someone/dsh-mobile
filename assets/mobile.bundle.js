var e=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports),t=e((e=>{
/**
* @license React
* react.production.min.js
*
* Copyright (c) Facebook, Inc. and its affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var t=Symbol.for(`react.element`),n=Symbol.for(`react.portal`),r=Symbol.for(`react.fragment`),i=Symbol.for(`react.strict_mode`),a=Symbol.for(`react.profiler`),o=Symbol.for(`react.provider`),s=Symbol.for(`react.context`),c=Symbol.for(`react.forward_ref`),l=Symbol.for(`react.suspense`),u=Symbol.for(`react.memo`),d=Symbol.for(`react.lazy`),f=Symbol.iterator;function p(e){return typeof e!=`object`||!e?null:(e=f&&e[f]||e[`@@iterator`],typeof e==`function`?e:null)}var m={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},h=Object.assign,g={};function _(e,t,n){this.props=e,this.context=t,this.refs=g,this.updater=n||m}_.prototype.isReactComponent={},_.prototype.setState=function(e,t){if(typeof e!=`object`&&typeof e!=`function`&&e!=null)throw Error(`setState(...): takes an object of state variables to update or a function which returns an object of state variables.`);this.updater.enqueueSetState(this,e,t,`setState`)},_.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,`forceUpdate`)};function v(){}v.prototype=_.prototype;function y(e,t,n){this.props=e,this.context=t,this.refs=g,this.updater=n||m}var b=y.prototype=new v;b.constructor=y,h(b,_.prototype),b.isPureReactComponent=!0;var x=Array.isArray,S=Object.prototype.hasOwnProperty,C={current:null},w={key:!0,ref:!0,__self:!0,__source:!0};function T(e,n,r){var i,a={},o=null,s=null;if(n!=null)for(i in n.ref!==void 0&&(s=n.ref),n.key!==void 0&&(o=``+n.key),n)S.call(n,i)&&!w.hasOwnProperty(i)&&(a[i]=n[i]);var c=arguments.length-2;if(c===1)a.children=r;else if(1<c){for(var l=Array(c),u=0;u<c;u++)l[u]=arguments[u+2];a.children=l}if(e&&e.defaultProps)for(i in c=e.defaultProps,c)a[i]===void 0&&(a[i]=c[i]);return{$$typeof:t,type:e,key:o,ref:s,props:a,_owner:C.current}}function ee(e,n){return{$$typeof:t,type:e.type,key:n,ref:e.ref,props:e.props,_owner:e._owner}}function te(e){return typeof e==`object`&&!!e&&e.$$typeof===t}function E(e){var t={"=":`=0`,":":`=2`};return`$`+e.replace(/[=:]/g,function(e){return t[e]})}var D=/\/+/g;function O(e,t){return typeof e==`object`&&e&&e.key!=null?E(``+e.key):t.toString(36)}function ne(e,r,i,a,o){var s=typeof e;(s===`undefined`||s===`boolean`)&&(e=null);var c=!1;if(e===null)c=!0;else switch(s){case`string`:case`number`:c=!0;break;case`object`:switch(e.$$typeof){case t:case n:c=!0}}if(c)return c=e,o=o(c),e=a===``?`.`+O(c,0):a,x(o)?(i=``,e!=null&&(i=e.replace(D,`$&/`)+`/`),ne(o,r,i,``,function(e){return e})):o!=null&&(te(o)&&(o=ee(o,i+(!o.key||c&&c.key===o.key?``:(``+o.key).replace(D,`$&/`)+`/`)+e)),r.push(o)),1;if(c=0,a=a===``?`.`:a+`:`,x(e))for(var l=0;l<e.length;l++){s=e[l];var u=a+O(s,l);c+=ne(s,r,i,u,o)}else if(u=p(e),typeof u==`function`)for(e=u.call(e),l=0;!(s=e.next()).done;)s=s.value,u=a+O(s,l++),c+=ne(s,r,i,u,o);else if(s===`object`)throw r=String(e),Error(`Objects are not valid as a React child (found: `+(r===`[object Object]`?`object with keys {`+Object.keys(e).join(`, `)+`}`:r)+`). If you meant to render a collection of children, use an array instead.`);return c}function k(e,t,n){if(e==null)return e;var r=[],i=0;return ne(e,r,``,``,function(e){return t.call(n,e,i++)}),r}function re(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(t){(e._status===0||e._status===-1)&&(e._status=1,e._result=t)},function(t){(e._status===0||e._status===-1)&&(e._status=2,e._result=t)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var A={current:null},j={transition:null},ie={ReactCurrentDispatcher:A,ReactCurrentBatchConfig:j,ReactCurrentOwner:C};e.Children={map:k,forEach:function(e,t,n){k(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return k(e,function(){t++}),t},toArray:function(e){return k(e,function(e){return e})||[]},only:function(e){if(!te(e))throw Error(`React.Children.only expected to receive a single React element child.`);return e}},e.Component=_,e.Fragment=r,e.Profiler=a,e.PureComponent=y,e.StrictMode=i,e.Suspense=l,e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=ie,e.cloneElement=function(e,n,r){if(e==null)throw Error(`React.cloneElement(...): The argument must be a React element, but you passed `+e+`.`);var i=h({},e.props),a=e.key,o=e.ref,s=e._owner;if(n!=null){if(n.ref!==void 0&&(o=n.ref,s=C.current),n.key!==void 0&&(a=``+n.key),e.type&&e.type.defaultProps)var c=e.type.defaultProps;for(l in n)S.call(n,l)&&!w.hasOwnProperty(l)&&(i[l]=n[l]===void 0&&c!==void 0?c[l]:n[l])}var l=arguments.length-2;if(l===1)i.children=r;else if(1<l){c=Array(l);for(var u=0;u<l;u++)c[u]=arguments[u+2];i.children=c}return{$$typeof:t,type:e.type,key:a,ref:o,props:i,_owner:s}},e.createContext=function(e){return e={$$typeof:s,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},e.Provider={$$typeof:o,_context:e},e.Consumer=e},e.createElement=T,e.createFactory=function(e){var t=T.bind(null,e);return t.type=e,t},e.createRef=function(){return{current:null}},e.forwardRef=function(e){return{$$typeof:c,render:e}},e.isValidElement=te,e.lazy=function(e){return{$$typeof:d,_payload:{_status:-1,_result:e},_init:re}},e.memo=function(e,t){return{$$typeof:u,type:e,compare:t===void 0?null:t}},e.startTransition=function(e){var t=j.transition;j.transition={};try{e()}finally{j.transition=t}},e.unstable_act=function(){throw Error(`act(...) is not supported in production builds of React.`)},e.useCallback=function(e,t){return A.current.useCallback(e,t)},e.useContext=function(e){return A.current.useContext(e)},e.useDebugValue=function(){},e.useDeferredValue=function(e){return A.current.useDeferredValue(e)},e.useEffect=function(e,t){return A.current.useEffect(e,t)},e.useId=function(){return A.current.useId()},e.useImperativeHandle=function(e,t,n){return A.current.useImperativeHandle(e,t,n)},e.useInsertionEffect=function(e,t){return A.current.useInsertionEffect(e,t)},e.useLayoutEffect=function(e,t){return A.current.useLayoutEffect(e,t)},e.useMemo=function(e,t){return A.current.useMemo(e,t)},e.useReducer=function(e,t,n){return A.current.useReducer(e,t,n)},e.useRef=function(e){return A.current.useRef(e)},e.useState=function(e){return A.current.useState(e)},e.useSyncExternalStore=function(e,t,n){return A.current.useSyncExternalStore(e,t,n)},e.useTransition=function(){return A.current.useTransition()},e.version=`18.2.0`})),n=e(((e,n)=>{n.exports=t()})),r=e((e=>{
/**
* @license React
* scheduler.production.min.js
*
* Copyright (c) Facebook, Inc. and its affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
function t(e,t){var n=e.length;e.push(t);a:for(;0<n;){var r=n-1>>>1,a=e[r];if(0<i(a,t))e[r]=t,e[n]=a,n=r;else break a}}function n(e){return e.length===0?null:e[0]}function r(e){if(e.length===0)return null;var t=e[0],n=e.pop();if(n!==t){e[0]=n;a:for(var r=0,a=e.length,o=a>>>1;r<o;){var s=2*(r+1)-1,c=e[s],l=s+1,u=e[l];if(0>i(c,n))l<a&&0>i(u,c)?(e[r]=u,e[l]=n,r=l):(e[r]=c,e[s]=n,r=s);else if(l<a&&0>i(u,n))e[r]=u,e[l]=n,r=l;else break a}}return t}function i(e,t){var n=e.sortIndex-t.sortIndex;return n===0?e.id-t.id:n}if(typeof performance==`object`&&typeof performance.now==`function`){var a=performance;e.unstable_now=function(){return a.now()}}else{var o=Date,s=o.now();e.unstable_now=function(){return o.now()-s}}var c=[],l=[],u=1,d=null,f=3,p=!1,m=!1,h=!1,g=typeof setTimeout==`function`?setTimeout:null,_=typeof clearTimeout==`function`?clearTimeout:null,v=typeof setImmediate<`u`?setImmediate:null;typeof navigator<`u`&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function y(e){for(var i=n(l);i!==null;){if(i.callback===null)r(l);else if(i.startTime<=e)r(l),i.sortIndex=i.expirationTime,t(c,i);else break;i=n(l)}}function b(e){if(h=!1,y(e),!m){if(n(c)!==null)m=!0,k(x);else{var t=n(l);t!==null&&re(b,t.startTime-e)}}}function x(t,i){m=!1,h&&(h=!1,_(w),w=-1),p=!0;var a=f;try{for(y(i),d=n(c);d!==null&&(!(d.expirationTime>i)||t&&!te());){var o=d.callback;if(typeof o==`function`){d.callback=null,f=d.priorityLevel;var s=o(d.expirationTime<=i);i=e.unstable_now(),typeof s==`function`?d.callback=s:d===n(c)&&r(c),y(i)}else r(c);d=n(c)}if(d!==null)var u=!0;else{var g=n(l);g!==null&&re(b,g.startTime-i),u=!1}return u}finally{d=null,f=a,p=!1}}var S=!1,C=null,w=-1,T=5,ee=-1;function te(){return!(e.unstable_now()-ee<T)}function E(){if(C!==null){var t=e.unstable_now();ee=t;var n=!0;try{n=C(!0,t)}finally{n?D():(S=!1,C=null)}}else S=!1}var D;if(typeof v==`function`)D=function(){v(E)};else if(typeof MessageChannel<`u`){var O=new MessageChannel,ne=O.port2;O.port1.onmessage=E,D=function(){ne.postMessage(null)}}else D=function(){g(E,0)};function k(e){C=e,S||(S=!0,D())}function re(t,n){w=g(function(){t(e.unstable_now())},n)}e.unstable_IdlePriority=5,e.unstable_ImmediatePriority=1,e.unstable_LowPriority=4,e.unstable_NormalPriority=3,e.unstable_Profiling=null,e.unstable_UserBlockingPriority=2,e.unstable_cancelCallback=function(e){e.callback=null},e.unstable_continueExecution=function(){m||p||(m=!0,k(x))},e.unstable_forceFrameRate=function(e){0>e||125<e?console.error(`forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported`):T=0<e?Math.floor(1e3/e):5},e.unstable_getCurrentPriorityLevel=function(){return f},e.unstable_getFirstCallbackNode=function(){return n(c)},e.unstable_next=function(e){switch(f){case 1:case 2:case 3:var t=3;break;default:t=f}var n=f;f=t;try{return e()}finally{f=n}},e.unstable_pauseExecution=function(){},e.unstable_requestPaint=function(){},e.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var n=f;f=e;try{return t()}finally{f=n}},e.unstable_scheduleCallback=function(r,i,a){var o=e.unstable_now();switch(typeof a==`object`&&a?(a=a.delay,a=typeof a==`number`&&0<a?o+a:o):a=o,r){case 1:var s=-1;break;case 2:s=250;break;case 5:s=1073741823;break;case 4:s=1e4;break;default:s=5e3}return s=a+s,r={id:u++,callback:i,priorityLevel:r,startTime:a,expirationTime:s,sortIndex:-1},a>o?(r.sortIndex=a,t(l,r),n(c)===null&&r===n(l)&&(h?(_(w),w=-1):h=!0,re(b,a-o))):(r.sortIndex=s,t(c,r),m||p||(m=!0,k(x))),r},e.unstable_shouldYield=te,e.unstable_wrapCallback=function(e){var t=f;return function(){var n=f;f=t;try{return e.apply(this,arguments)}finally{f=n}}}})),i=e(((e,t)=>{t.exports=r()})),a=e((e=>{
/**
* @license React
* react-dom.production.min.js
*
* Copyright (c) Facebook, Inc. and its affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var t=n(),r=i();function a(e){for(var t=`https://reactjs.org/docs/error-decoder.html?invariant=`+e,n=1;n<arguments.length;n++)t+=`&args[]=`+encodeURIComponent(arguments[n]);return`Minified React error #`+e+`; visit `+t+` for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`}var o=new Set,s={};function c(e,t){l(e,t),l(e+`Capture`,t)}function l(e,t){for(s[e]=t,e=0;e<t.length;e++)o.add(t[e])}var u=!(typeof window>`u`||window.document===void 0||window.document.createElement===void 0),d=Object.prototype.hasOwnProperty,f=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,p={},m={};function h(e){return d.call(m,e)?!0:d.call(p,e)?!1:f.test(e)?m[e]=!0:(p[e]=!0,!1)}function g(e,t,n,r){if(n!==null&&n.type===0)return!1;switch(typeof t){case`function`:case`symbol`:return!0;case`boolean`:return r?!1:n===null?(e=e.toLowerCase().slice(0,5),e!==`data-`&&e!==`aria-`):!n.acceptsBooleans;default:return!1}}function _(e,t,n,r){if(t==null||g(e,t,n,r))return!0;if(r)return!1;if(n!==null)switch(n.type){case 3:return!t;case 4:return!1===t;case 5:return isNaN(t);case 6:return isNaN(t)||1>t}return!1}function v(e,t,n,r,i,a,o){this.acceptsBooleans=t===2||t===3||t===4,this.attributeName=r,this.attributeNamespace=i,this.mustUseProperty=n,this.propertyName=e,this.type=t,this.sanitizeURL=a,this.removeEmptyString=o}var y={};`children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style`.split(` `).forEach(function(e){y[e]=new v(e,0,!1,e,null,!1,!1)}),[[`acceptCharset`,`accept-charset`],[`className`,`class`],[`htmlFor`,`for`],[`httpEquiv`,`http-equiv`]].forEach(function(e){var t=e[0];y[t]=new v(t,1,!1,e[1],null,!1,!1)}),[`contentEditable`,`draggable`,`spellCheck`,`value`].forEach(function(e){y[e]=new v(e,2,!1,e.toLowerCase(),null,!1,!1)}),[`autoReverse`,`externalResourcesRequired`,`focusable`,`preserveAlpha`].forEach(function(e){y[e]=new v(e,2,!1,e,null,!1,!1)}),`allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope`.split(` `).forEach(function(e){y[e]=new v(e,3,!1,e.toLowerCase(),null,!1,!1)}),[`checked`,`multiple`,`muted`,`selected`].forEach(function(e){y[e]=new v(e,3,!0,e,null,!1,!1)}),[`capture`,`download`].forEach(function(e){y[e]=new v(e,4,!1,e,null,!1,!1)}),[`cols`,`rows`,`size`,`span`].forEach(function(e){y[e]=new v(e,6,!1,e,null,!1,!1)}),[`rowSpan`,`start`].forEach(function(e){y[e]=new v(e,5,!1,e.toLowerCase(),null,!1,!1)});var b=/[\-:]([a-z])/g;function x(e){return e[1].toUpperCase()}`accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height`.split(` `).forEach(function(e){var t=e.replace(b,x);y[t]=new v(t,1,!1,e,null,!1,!1)}),`xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type`.split(` `).forEach(function(e){var t=e.replace(b,x);y[t]=new v(t,1,!1,e,`http://www.w3.org/1999/xlink`,!1,!1)}),[`xml:base`,`xml:lang`,`xml:space`].forEach(function(e){var t=e.replace(b,x);y[t]=new v(t,1,!1,e,`http://www.w3.org/XML/1998/namespace`,!1,!1)}),[`tabIndex`,`crossOrigin`].forEach(function(e){y[e]=new v(e,1,!1,e.toLowerCase(),null,!1,!1)}),y.xlinkHref=new v(`xlinkHref`,1,!1,`xlink:href`,`http://www.w3.org/1999/xlink`,!0,!1),[`src`,`href`,`action`,`formAction`].forEach(function(e){y[e]=new v(e,1,!1,e.toLowerCase(),null,!0,!0)});function S(e,t,n,r){var i=y.hasOwnProperty(t)?y[t]:null;(i===null?r||!(2<t.length)||t[0]!==`o`&&t[0]!==`O`||t[1]!==`n`&&t[1]!==`N`:i.type!==0)&&(_(t,n,i,r)&&(n=null),r||i===null?h(t)&&(n===null?e.removeAttribute(t):e.setAttribute(t,``+n)):i.mustUseProperty?e[i.propertyName]=n===null?i.type!==3&&``:n:(t=i.attributeName,r=i.attributeNamespace,n===null?e.removeAttribute(t):(i=i.type,n=i===3||i===4&&!0===n?``:``+n,r?e.setAttributeNS(r,t,n):e.setAttribute(t,n))))}var C=t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,w=Symbol.for(`react.element`),T=Symbol.for(`react.portal`),ee=Symbol.for(`react.fragment`),te=Symbol.for(`react.strict_mode`),E=Symbol.for(`react.profiler`),D=Symbol.for(`react.provider`),O=Symbol.for(`react.context`),ne=Symbol.for(`react.forward_ref`),k=Symbol.for(`react.suspense`),re=Symbol.for(`react.suspense_list`),A=Symbol.for(`react.memo`),j=Symbol.for(`react.lazy`),ie=Symbol.for(`react.offscreen`),ae=Symbol.iterator;function M(e){return typeof e!=`object`||!e?null:(e=ae&&e[ae]||e[`@@iterator`],typeof e==`function`?e:null)}var N=Object.assign,oe;function se(e){if(oe===void 0)try{throw Error()}catch(e){var t=e.stack.trim().match(/\n( *(at )?)/);oe=t&&t[1]||``}return`
`+oe+e}var ce=!1;function le(e,t){if(!e||ce)return``;ce=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(t){if(t=function(){throw Error()},Object.defineProperty(t.prototype,"props",{set:function(){throw Error()}}),typeof Reflect==`object`&&Reflect.construct){try{Reflect.construct(t,[])}catch(e){var r=e}Reflect.construct(e,[],t)}else{try{t.call()}catch(e){r=e}e.call(t.prototype)}}else{try{throw Error()}catch(e){r=e}e()}}catch(t){if(t&&r&&typeof t.stack==`string`){for(var i=t.stack.split(`
`),a=r.stack.split(`
`),o=i.length-1,s=a.length-1;1<=o&&0<=s&&i[o]!==a[s];)s--;for(;1<=o&&0<=s;o--,s--)if(i[o]!==a[s]){if(o!==1||s!==1)do if(o--,s--,0>s||i[o]!==a[s]){var c=`
`+i[o].replace(` at new `,` at `);return e.displayName&&c.includes(`<anonymous>`)&&(c=c.replace(`<anonymous>`,e.displayName)),c}while(1<=o&&0<=s);break}}}finally{ce=!1,Error.prepareStackTrace=n}return(e=e?e.displayName||e.name:``)?se(e):``}function ue(e){switch(e.tag){case 5:return se(e.type);case 16:return se(`Lazy`);case 13:return se(`Suspense`);case 19:return se(`SuspenseList`);case 0:case 2:case 15:return e=le(e.type,!1),e;case 11:return e=le(e.type.render,!1),e;case 1:return e=le(e.type,!0),e;default:return``}}function de(e){if(e==null)return null;if(typeof e==`function`)return e.displayName||e.name||null;if(typeof e==`string`)return e;switch(e){case ee:return`Fragment`;case T:return`Portal`;case E:return`Profiler`;case te:return`StrictMode`;case k:return`Suspense`;case re:return`SuspenseList`}if(typeof e==`object`)switch(e.$$typeof){case O:return(e.displayName||`Context`)+`.Consumer`;case D:return(e._context.displayName||`Context`)+`.Provider`;case ne:var t=e.render;return e=e.displayName,e||=(e=t.displayName||t.name||``,e===``?`ForwardRef`:`ForwardRef(`+e+`)`),e;case A:return t=e.displayName||null,t===null?de(e.type)||`Memo`:t;case j:t=e._payload,e=e._init;try{return de(e(t))}catch{}}return null}function fe(e){var t=e.type;switch(e.tag){case 24:return`Cache`;case 9:return(t.displayName||`Context`)+`.Consumer`;case 10:return(t._context.displayName||`Context`)+`.Provider`;case 18:return`DehydratedFragment`;case 11:return e=t.render,e=e.displayName||e.name||``,t.displayName||(e===``?`ForwardRef`:`ForwardRef(`+e+`)`);case 7:return`Fragment`;case 5:return t;case 4:return`Portal`;case 3:return`Root`;case 6:return`Text`;case 16:return de(t);case 8:return t===te?`StrictMode`:`Mode`;case 22:return`Offscreen`;case 12:return`Profiler`;case 21:return`Scope`;case 13:return`Suspense`;case 19:return`SuspenseList`;case 25:return`TracingMarker`;case 1:case 0:case 17:case 2:case 14:case 15:if(typeof t==`function`)return t.displayName||t.name||null;if(typeof t==`string`)return t}return null}function P(e){switch(typeof e){case`boolean`:case`number`:case`string`:case`undefined`:return e;case`object`:return e;default:return``}}function pe(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()===`input`&&(t===`checkbox`||t===`radio`)}function F(e){var t=pe(e)?`checked`:`value`,n=Object.getOwnPropertyDescriptor(e.constructor.prototype,t),r=``+e[t];if(!e.hasOwnProperty(t)&&n!==void 0&&typeof n.get==`function`&&typeof n.set==`function`){var i=n.get,a=n.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return i.call(this)},set:function(e){r=``+e,a.call(this,e)}}),Object.defineProperty(e,t,{enumerable:n.enumerable}),{getValue:function(){return r},setValue:function(e){r=``+e},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function me(e){e._valueTracker||=F(e)}function he(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),r=``;return e&&(r=pe(e)?e.checked?`true`:`false`:e.value),e=r,e!==n&&(t.setValue(e),!0)}function ge(e){if(e||=typeof document<`u`?document:void 0,e===void 0)return null;try{return e.activeElement||e.body}catch{return e.body}}function _e(e,t){var n=t.checked;return N({},t,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n??e._wrapperState.initialChecked})}function ve(e,t){var n=t.defaultValue==null?``:t.defaultValue,r=t.checked==null?t.defaultChecked:t.checked;n=P(t.value==null?n:t.value),e._wrapperState={initialChecked:r,initialValue:n,controlled:t.type===`checkbox`||t.type===`radio`?t.checked!=null:t.value!=null}}function ye(e,t){t=t.checked,t!=null&&S(e,`checked`,t,!1)}function be(e,t){ye(e,t);var n=P(t.value),r=t.type;if(n!=null)r===`number`?(n===0&&e.value===``||e.value!=n)&&(e.value=``+n):e.value!==``+n&&(e.value=``+n);else if(r===`submit`||r===`reset`){e.removeAttribute(`value`);return}t.hasOwnProperty(`value`)?Se(e,t.type,n):t.hasOwnProperty(`defaultValue`)&&Se(e,t.type,P(t.defaultValue)),t.checked==null&&t.defaultChecked!=null&&(e.defaultChecked=!!t.defaultChecked)}function xe(e,t,n){if(t.hasOwnProperty(`value`)||t.hasOwnProperty(`defaultValue`)){var r=t.type;if(!(r!==`submit`&&r!==`reset`||t.value!==void 0&&t.value!==null))return;t=``+e._wrapperState.initialValue,n||t===e.value||(e.value=t),e.defaultValue=t}n=e.name,n!==``&&(e.name=``),e.defaultChecked=!!e._wrapperState.initialChecked,n!==``&&(e.name=n)}function Se(e,t,n){(t!==`number`||ge(e.ownerDocument)!==e)&&(n==null?e.defaultValue=``+e._wrapperState.initialValue:e.defaultValue!==``+n&&(e.defaultValue=``+n))}var I=Array.isArray;function L(e,t,n,r){if(e=e.options,t){t={};for(var i=0;i<n.length;i++)t[`$`+n[i]]=!0;for(n=0;n<e.length;n++)i=t.hasOwnProperty(`$`+e[n].value),e[n].selected!==i&&(e[n].selected=i),i&&r&&(e[n].defaultSelected=!0)}else{for(n=``+P(n),t=null,i=0;i<e.length;i++){if(e[i].value===n){e[i].selected=!0,r&&(e[i].defaultSelected=!0);return}t!==null||e[i].disabled||(t=e[i])}t!==null&&(t.selected=!0)}}function Ce(e,t){if(t.dangerouslySetInnerHTML!=null)throw Error(a(91));return N({},t,{value:void 0,defaultValue:void 0,children:``+e._wrapperState.initialValue})}function we(e,t){var n=t.value;if(n==null){if(n=t.children,t=t.defaultValue,n!=null){if(t!=null)throw Error(a(92));if(I(n)){if(1<n.length)throw Error(a(93));n=n[0]}t=n}t??=``,n=t}e._wrapperState={initialValue:P(n)}}function Te(e,t){var n=P(t.value),r=P(t.defaultValue);n!=null&&(n=``+n,n!==e.value&&(e.value=n),t.defaultValue==null&&e.defaultValue!==n&&(e.defaultValue=n)),r!=null&&(e.defaultValue=``+r)}function Ee(e){var t=e.textContent;t===e._wrapperState.initialValue&&t!==``&&t!==null&&(e.value=t)}function De(e){switch(e){case`svg`:return`http://www.w3.org/2000/svg`;case`math`:return`http://www.w3.org/1998/Math/MathML`;default:return`http://www.w3.org/1999/xhtml`}}function Oe(e,t){return e==null||e===`http://www.w3.org/1999/xhtml`?De(t):e===`http://www.w3.org/2000/svg`&&t===`foreignObject`?`http://www.w3.org/1999/xhtml`:e}var R,z=function(e){return typeof MSApp<`u`&&MSApp.execUnsafeLocalFunction?function(t,n,r,i){MSApp.execUnsafeLocalFunction(function(){return e(t,n,r,i)})}:e}(function(e,t){if(e.namespaceURI!==`http://www.w3.org/2000/svg`||`innerHTML`in e)e.innerHTML=t;else{for(R||=document.createElement(`div`),R.innerHTML=`<svg>`+t.valueOf().toString()+`</svg>`,t=R.firstChild;e.firstChild;)e.removeChild(e.firstChild);for(;t.firstChild;)e.appendChild(t.firstChild)}});function B(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var V={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},ke=[`Webkit`,`ms`,`Moz`,`O`];Object.keys(V).forEach(function(e){ke.forEach(function(t){t=t+e.charAt(0).toUpperCase()+e.substring(1),V[t]=V[e]})});function Ae(e,t,n){return t==null||typeof t==`boolean`||t===``?``:n||typeof t!=`number`||t===0||V.hasOwnProperty(e)&&V[e]?(``+t).trim():t+`px`}function je(e,t){for(var n in e=e.style,t)if(t.hasOwnProperty(n)){var r=n.indexOf(`--`)===0,i=Ae(n,t[n],r);n===`float`&&(n=`cssFloat`),r?e.setProperty(n,i):e[n]=i}}var Me=N({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function Ne(e,t){if(t){if(Me[e]&&(t.children!=null||t.dangerouslySetInnerHTML!=null))throw Error(a(137,e));if(t.dangerouslySetInnerHTML!=null){if(t.children!=null)throw Error(a(60));if(typeof t.dangerouslySetInnerHTML!=`object`||!(`__html`in t.dangerouslySetInnerHTML))throw Error(a(61))}if(t.style!=null&&typeof t.style!=`object`)throw Error(a(62))}}function Pe(e,t){if(e.indexOf(`-`)===-1)return typeof t.is==`string`;switch(e){case`annotation-xml`:case`color-profile`:case`font-face`:case`font-face-src`:case`font-face-uri`:case`font-face-format`:case`font-face-name`:case`missing-glyph`:return!1;default:return!0}}var Fe=null;function Ie(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var Le=null,Re=null,ze=null;function Be(e){if(e=G(e)){if(typeof Le!=`function`)throw Error(a(280));var t=e.stateNode;t&&(t=zi(t),Le(e.stateNode,e.type,t))}}function Ve(e){Re?ze?ze.push(e):ze=[e]:Re=e}function He(){if(Re){var e=Re,t=ze;if(ze=Re=null,Be(e),t)for(e=0;e<t.length;e++)Be(t[e])}}function Ue(e,t){return e(t)}function We(){}var Ge=!1;function Ke(e,t,n){if(Ge)return e(t,n);Ge=!0;try{return Ue(e,t,n)}finally{Ge=!1,(Re!==null||ze!==null)&&(We(),He())}}function qe(e,t){var n=e.stateNode;if(n===null)return null;var r=zi(n);if(r===null)return null;n=r[t];a:switch(t){case`onClick`:case`onClickCapture`:case`onDoubleClick`:case`onDoubleClickCapture`:case`onMouseDown`:case`onMouseDownCapture`:case`onMouseMove`:case`onMouseMoveCapture`:case`onMouseUp`:case`onMouseUpCapture`:case`onMouseEnter`:(r=!r.disabled)||(e=e.type,r=e!==`button`&&e!==`input`&&e!==`select`&&e!==`textarea`),e=!r;break a;default:e=!1}if(e)return null;if(n&&typeof n!=`function`)throw Error(a(231,t,typeof n));return n}var Je=!1;if(u)try{var Ye={};Object.defineProperty(Ye,"passive",{get:function(){Je=!0}}),window.addEventListener(`test`,Ye,Ye),window.removeEventListener(`test`,Ye,Ye)}catch{Je=!1}function Xe(e,t,n,r,i,a,o,s,c){var l=Array.prototype.slice.call(arguments,3);try{t.apply(n,l)}catch(e){this.onError(e)}}var Ze=!1,Qe=null,$e=!1,et=null,tt={onError:function(e){Ze=!0,Qe=e}};function nt(e,t,n,r,i,a,o,s,c){Ze=!1,Qe=null,Xe.apply(tt,arguments)}function rt(e,t,n,r,i,o,s,c,l){if(nt.apply(this,arguments),Ze){if(Ze){var u=Qe;Ze=!1,Qe=null}else throw Error(a(198));$e||($e=!0,et=u)}}function it(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,t.flags&4098&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function at(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function ot(e){if(it(e)!==e)throw Error(a(188))}function st(e){var t=e.alternate;if(!t){if(t=it(e),t===null)throw Error(a(188));return t===e?e:null}for(var n=e,r=t;;){var i=n.return;if(i===null)break;var o=i.alternate;if(o===null){if(r=i.return,r!==null){n=r;continue}break}if(i.child===o.child){for(o=i.child;o;){if(o===n)return ot(i),e;if(o===r)return ot(i),t;o=o.sibling}throw Error(a(188))}if(n.return!==r.return)n=i,r=o;else{for(var s=!1,c=i.child;c;){if(c===n){s=!0,n=i,r=o;break}if(c===r){s=!0,r=i,n=o;break}c=c.sibling}if(!s){for(c=o.child;c;){if(c===n){s=!0,n=o,r=i;break}if(c===r){s=!0,r=o,n=i;break}c=c.sibling}if(!s)throw Error(a(189))}}if(n.alternate!==r)throw Error(a(190))}if(n.tag!==3)throw Error(a(188));return n.stateNode.current===n?e:t}function ct(e){return e=st(e),e===null?null:lt(e)}function lt(e){if(e.tag===5||e.tag===6)return e;for(e=e.child;e!==null;){var t=lt(e);if(t!==null)return t;e=e.sibling}return null}var ut=r.unstable_scheduleCallback,dt=r.unstable_cancelCallback,ft=r.unstable_shouldYield,pt=r.unstable_requestPaint,H=r.unstable_now,mt=r.unstable_getCurrentPriorityLevel,ht=r.unstable_ImmediatePriority,gt=r.unstable_UserBlockingPriority,_t=r.unstable_NormalPriority,vt=r.unstable_LowPriority,yt=r.unstable_IdlePriority,bt=null,xt=null;function St(e){if(xt&&typeof xt.onCommitFiberRoot==`function`)try{xt.onCommitFiberRoot(bt,e,void 0,(e.current.flags&128)==128)}catch{}}var Ct=Math.clz32?Math.clz32:Et,wt=Math.log,Tt=Math.LN2;function Et(e){return e>>>=0,e===0?32:31-(wt(e)/Tt|0)|0}var Dt=64,Ot=4194304;function kt(e){switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return e&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return e}}function At(e,t){var n=e.pendingLanes;if(n===0)return 0;var r=0,i=e.suspendedLanes,a=e.pingedLanes,o=n&268435455;if(o!==0){var s=o&~i;s===0?(a&=o,a!==0&&(r=kt(a))):r=kt(s)}else o=n&~i,o===0?a!==0&&(r=kt(a)):r=kt(o);if(r===0)return 0;if(t!==0&&t!==r&&(t&i)===0&&(i=r&-r,a=t&-t,i>=a||i===16&&a&4194240))return t;if(r&4&&(r|=n&16),t=e.entangledLanes,t!==0)for(e=e.entanglements,t&=r;0<t;)n=31-Ct(t),i=1<<n,r|=e[n],t&=~i;return r}function jt(e,t){switch(e){case 1:case 2:case 4:return t+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Mt(e,t){for(var n=e.suspendedLanes,r=e.pingedLanes,i=e.expirationTimes,a=e.pendingLanes;0<a;){var o=31-Ct(a),s=1<<o,c=i[o];c===-1?((s&n)===0||(s&r)!==0)&&(i[o]=jt(s,t)):c<=t&&(e.expiredLanes|=s),a&=~s}}function Nt(e){return e=e.pendingLanes&-1073741825,e===0?e&1073741824?1073741824:0:e}function Pt(){var e=Dt;return Dt<<=1,!(Dt&4194240)&&(Dt=64),e}function Ft(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function It(e,t,n){e.pendingLanes|=t,t!==536870912&&(e.suspendedLanes=0,e.pingedLanes=0),e=e.eventTimes,t=31-Ct(t),e[t]=n}function Lt(e,t){var n=e.pendingLanes&~t;e.pendingLanes=t,e.suspendedLanes=0,e.pingedLanes=0,e.expiredLanes&=t,e.mutableReadLanes&=t,e.entangledLanes&=t,t=e.entanglements;var r=e.eventTimes;for(e=e.expirationTimes;0<n;){var i=31-Ct(n),a=1<<i;t[i]=0,r[i]=-1,e[i]=-1,n&=~a}}function Rt(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var r=31-Ct(n),i=1<<r;i&t|e[r]&t&&(e[r]|=t),n&=~i}}var U=0;function zt(e){return e&=-e,1<e?4<e?e&268435455?16:536870912:4:1}var Bt,Vt,Ht,Ut,Wt,Gt=!1,Kt=[],qt=null,Jt=null,Yt=null,Xt=new Map,Zt=new Map,Qt=[],$t=`mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit`.split(` `);function en(e,t){switch(e){case`focusin`:case`focusout`:qt=null;break;case`dragenter`:case`dragleave`:Jt=null;break;case`mouseover`:case`mouseout`:Yt=null;break;case`pointerover`:case`pointerout`:Xt.delete(t.pointerId);break;case`gotpointercapture`:case`lostpointercapture`:Zt.delete(t.pointerId)}}function tn(e,t,n,r,i,a){return e===null||e.nativeEvent!==a?(e={blockedOn:t,domEventName:n,eventSystemFlags:r,nativeEvent:a,targetContainers:[i]},t!==null&&(t=G(t),t!==null&&Vt(t)),e):(e.eventSystemFlags|=r,t=e.targetContainers,i!==null&&t.indexOf(i)===-1&&t.push(i),e)}function nn(e,t,n,r,i){switch(t){case`focusin`:return qt=tn(qt,e,t,n,r,i),!0;case`dragenter`:return Jt=tn(Jt,e,t,n,r,i),!0;case`mouseover`:return Yt=tn(Yt,e,t,n,r,i),!0;case`pointerover`:var a=i.pointerId;return Xt.set(a,tn(Xt.get(a)||null,e,t,n,r,i)),!0;case`gotpointercapture`:return a=i.pointerId,Zt.set(a,tn(Zt.get(a)||null,e,t,n,r,i)),!0}return!1}function rn(e){var t=Li(e.target);if(t!==null){var n=it(t);if(n!==null){if(t=n.tag,t===13){if(t=at(n),t!==null){e.blockedOn=t,Wt(e.priority,function(){Ht(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function an(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=gn(e.domEventName,e.eventSystemFlags,t[0],e.nativeEvent);if(n===null){n=e.nativeEvent;var r=new n.constructor(n.type,n);Fe=r,n.target.dispatchEvent(r),Fe=null}else return t=G(n),t!==null&&Vt(t),e.blockedOn=n,!1;t.shift()}return!0}function on(e,t,n){an(e)&&n.delete(t)}function sn(){Gt=!1,qt!==null&&an(qt)&&(qt=null),Jt!==null&&an(Jt)&&(Jt=null),Yt!==null&&an(Yt)&&(Yt=null),Xt.forEach(on),Zt.forEach(on)}function cn(e,t){e.blockedOn===t&&(e.blockedOn=null,Gt||(Gt=!0,r.unstable_scheduleCallback(r.unstable_NormalPriority,sn)))}function ln(e){function t(t){return cn(t,e)}if(0<Kt.length){cn(Kt[0],e);for(var n=1;n<Kt.length;n++){var r=Kt[n];r.blockedOn===e&&(r.blockedOn=null)}}for(qt!==null&&cn(qt,e),Jt!==null&&cn(Jt,e),Yt!==null&&cn(Yt,e),Xt.forEach(t),Zt.forEach(t),n=0;n<Qt.length;n++)r=Qt[n],r.blockedOn===e&&(r.blockedOn=null);for(;0<Qt.length&&(n=Qt[0],n.blockedOn===null);)rn(n),n.blockedOn===null&&Qt.shift()}var un=C.ReactCurrentBatchConfig,dn=!0;function fn(e,t,n,r){var i=U,a=un.transition;un.transition=null;try{U=1,mn(e,t,n,r)}finally{U=i,un.transition=a}}function pn(e,t,n,r){var i=U,a=un.transition;un.transition=null;try{U=4,mn(e,t,n,r)}finally{U=i,un.transition=a}}function mn(e,t,n,r){if(dn){var i=gn(e,t,n,r);if(i===null)li(e,t,r,hn,n),en(e,r);else if(nn(i,e,t,n,r))r.stopPropagation();else if(en(e,r),t&4&&-1<$t.indexOf(e)){for(;i!==null;){var a=G(i);if(a!==null&&Bt(a),a=gn(e,t,n,r),a===null&&li(e,t,r,hn,n),a===i)break;i=a}i!==null&&r.stopPropagation()}else li(e,t,r,null,n)}}var hn=null;function gn(e,t,n,r){if(hn=null,e=Ie(r),e=Li(e),e!==null){if(t=it(e),t===null)e=null;else if(n=t.tag,n===13){if(e=at(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}return hn=e,null}function _n(e){switch(e){case`cancel`:case`click`:case`close`:case`contextmenu`:case`copy`:case`cut`:case`auxclick`:case`dblclick`:case`dragend`:case`dragstart`:case`drop`:case`focusin`:case`focusout`:case`input`:case`invalid`:case`keydown`:case`keypress`:case`keyup`:case`mousedown`:case`mouseup`:case`paste`:case`pause`:case`play`:case`pointercancel`:case`pointerdown`:case`pointerup`:case`ratechange`:case`reset`:case`resize`:case`seeked`:case`submit`:case`touchcancel`:case`touchend`:case`touchstart`:case`volumechange`:case`change`:case`selectionchange`:case`textInput`:case`compositionstart`:case`compositionend`:case`compositionupdate`:case`beforeblur`:case`afterblur`:case`beforeinput`:case`blur`:case`fullscreenchange`:case`focus`:case`hashchange`:case`popstate`:case`select`:case`selectstart`:return 1;case`drag`:case`dragenter`:case`dragexit`:case`dragleave`:case`dragover`:case`mousemove`:case`mouseout`:case`mouseover`:case`pointermove`:case`pointerout`:case`pointerover`:case`scroll`:case`toggle`:case`touchmove`:case`wheel`:case`mouseenter`:case`mouseleave`:case`pointerenter`:case`pointerleave`:return 4;case`message`:switch(mt()){case ht:return 1;case gt:return 4;case _t:case vt:return 16;case yt:return 536870912;default:return 16}default:return 16}}var vn=null,yn=null,bn=null;function xn(){if(bn)return bn;var e,t=yn,n=t.length,r,i=`value`in vn?vn.value:vn.textContent,a=i.length;for(e=0;e<n&&t[e]===i[e];e++);var o=n-e;for(r=1;r<=o&&t[n-r]===i[a-r];r++);return bn=i.slice(e,1<r?1-r:void 0)}function Sn(e){var t=e.keyCode;return`charCode`in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Cn(){return!0}function wn(){return!1}function Tn(e){function t(t,n,r,i,a){for(var o in this._reactName=t,this._targetInst=r,this.type=n,this.nativeEvent=i,this.target=a,this.currentTarget=null,e)e.hasOwnProperty(o)&&(t=e[o],this[o]=t?t(i):i[o]);return this.isDefaultPrevented=(i.defaultPrevented==null?!1===i.returnValue:i.defaultPrevented)?Cn:wn,this.isPropagationStopped=wn,this}return N(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var e=this.nativeEvent;e&&(e.preventDefault?e.preventDefault():typeof e.returnValue!=`unknown`&&(e.returnValue=!1),this.isDefaultPrevented=Cn)},stopPropagation:function(){var e=this.nativeEvent;e&&(e.stopPropagation?e.stopPropagation():typeof e.cancelBubble!=`unknown`&&(e.cancelBubble=!0),this.isPropagationStopped=Cn)},persist:function(){},isPersistent:Cn}),t}var En={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Dn=Tn(En),On=N({},En,{view:0,detail:0}),kn=Tn(On),An,jn,Mn,Nn=N({},On,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Wn,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return`movementX`in e?e.movementX:(e!==Mn&&(Mn&&e.type===`mousemove`?(An=e.screenX-Mn.screenX,jn=e.screenY-Mn.screenY):jn=An=0,Mn=e),An)},movementY:function(e){return`movementY`in e?e.movementY:jn}}),Pn=Tn(Nn),Fn=Tn(N({},Nn,{dataTransfer:0})),In=Tn(N({},On,{relatedTarget:0})),Ln=Tn(N({},En,{animationName:0,elapsedTime:0,pseudoElement:0})),Rn=Tn(N({},En,{clipboardData:function(e){return`clipboardData`in e?e.clipboardData:window.clipboardData}})),zn=Tn(N({},En,{data:0})),Bn={Esc:`Escape`,Spacebar:` `,Left:`ArrowLeft`,Up:`ArrowUp`,Right:`ArrowRight`,Down:`ArrowDown`,Del:`Delete`,Win:`OS`,Menu:`ContextMenu`,Apps:`ContextMenu`,Scroll:`ScrollLock`,MozPrintableKey:`Unidentified`},Vn={8:`Backspace`,9:`Tab`,12:`Clear`,13:`Enter`,16:`Shift`,17:`Control`,18:`Alt`,19:`Pause`,20:`CapsLock`,27:`Escape`,32:` `,33:`PageUp`,34:`PageDown`,35:`End`,36:`Home`,37:`ArrowLeft`,38:`ArrowUp`,39:`ArrowRight`,40:`ArrowDown`,45:`Insert`,46:`Delete`,112:`F1`,113:`F2`,114:`F3`,115:`F4`,116:`F5`,117:`F6`,118:`F7`,119:`F8`,120:`F9`,121:`F10`,122:`F11`,123:`F12`,144:`NumLock`,145:`ScrollLock`,224:`Meta`},Hn={Alt:`altKey`,Control:`ctrlKey`,Meta:`metaKey`,Shift:`shiftKey`};function Un(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=Hn[e])?!!t[e]:!1}function Wn(){return Un}var Gn=Tn(N({},On,{key:function(e){if(e.key){var t=Bn[e.key]||e.key;if(t!==`Unidentified`)return t}return e.type===`keypress`?(e=Sn(e),e===13?`Enter`:String.fromCharCode(e)):e.type===`keydown`||e.type===`keyup`?Vn[e.keyCode]||`Unidentified`:``},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Wn,charCode:function(e){return e.type===`keypress`?Sn(e):0},keyCode:function(e){return e.type===`keydown`||e.type===`keyup`?e.keyCode:0},which:function(e){return e.type===`keypress`?Sn(e):e.type===`keydown`||e.type===`keyup`?e.keyCode:0}})),Kn=Tn(N({},Nn,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0})),qn=Tn(N({},On,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Wn})),Jn=Tn(N({},En,{propertyName:0,elapsedTime:0,pseudoElement:0})),Yn=Tn(N({},Nn,{deltaX:function(e){return`deltaX`in e?e.deltaX:`wheelDeltaX`in e?-e.wheelDeltaX:0},deltaY:function(e){return`deltaY`in e?e.deltaY:`wheelDeltaY`in e?-e.wheelDeltaY:`wheelDelta`in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0})),Xn=[9,13,27,32],Zn=u&&`CompositionEvent`in window,Qn=null;u&&`documentMode`in document&&(Qn=document.documentMode);var $n=u&&`TextEvent`in window&&!Qn,er=u&&(!Zn||Qn&&8<Qn&&11>=Qn),tr=` `,nr=!1;function rr(e,t){switch(e){case`keyup`:return Xn.indexOf(t.keyCode)!==-1;case`keydown`:return t.keyCode!==229;case`keypress`:case`mousedown`:case`focusout`:return!0;default:return!1}}function ir(e){return e=e.detail,typeof e==`object`&&`data`in e?e.data:null}var ar=!1;function or(e,t){switch(e){case`compositionend`:return ir(t);case`keypress`:return t.which===32?(nr=!0,tr):null;case`textInput`:return e=t.data,e===tr&&nr?null:e;default:return null}}function sr(e,t){if(ar)return e===`compositionend`||!Zn&&rr(e,t)?(e=xn(),bn=yn=vn=null,ar=!1,e):null;switch(e){case`paste`:return null;case`keypress`:if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case`compositionend`:return er&&t.locale!==`ko`?null:t.data;default:return null}}var cr={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function lr(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t===`input`?!!cr[e.type]:t===`textarea`}function ur(e,t,n,r){Ve(r),t=di(t,`onChange`),0<t.length&&(n=new Dn(`onChange`,`change`,null,n,r),e.push({event:n,listeners:t}))}var dr=null,fr=null;function pr(e){ii(e,0)}function mr(e){if(he(Ri(e)))return e}function hr(e,t){if(e===`change`)return t}var gr=!1;if(u){var _r;if(u){var vr=`oninput`in document;if(!vr){var yr=document.createElement(`div`);yr.setAttribute(`oninput`,`return;`),vr=typeof yr.oninput==`function`}_r=vr}else _r=!1;gr=_r&&(!document.documentMode||9<document.documentMode)}function br(){dr&&(dr.detachEvent(`onpropertychange`,xr),fr=dr=null)}function xr(e){if(e.propertyName===`value`&&mr(fr)){var t=[];ur(t,fr,e,Ie(e)),Ke(pr,t)}}function Sr(e,t,n){e===`focusin`?(br(),dr=t,fr=n,dr.attachEvent(`onpropertychange`,xr)):e===`focusout`&&br()}function Cr(e){if(e===`selectionchange`||e===`keyup`||e===`keydown`)return mr(fr)}function wr(e,t){if(e===`click`)return mr(t)}function Tr(e,t){if(e===`input`||e===`change`)return mr(t)}function Er(e,t){return e===t&&(e!==0||1/e==1/t)||e!==e&&t!==t}var Dr=typeof Object.is==`function`?Object.is:Er;function Or(e,t){if(Dr(e,t))return!0;if(typeof e!=`object`||!e||typeof t!=`object`||!t)return!1;var n=Object.keys(e),r=Object.keys(t);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var i=n[r];if(!d.call(t,i)||!Dr(e[i],t[i]))return!1}return!0}function kr(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function Ar(e,t){var n=kr(e);e=0;for(var r;n;){if(n.nodeType===3){if(r=e+n.textContent.length,e<=t&&r>=t)return{node:n,offset:t-e};e=r}a:{for(;n;){if(n.nextSibling){n=n.nextSibling;break a}n=n.parentNode}n=void 0}n=kr(n)}}function jr(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?jr(e,t.parentNode):`contains`in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function Mr(){for(var e=window,t=ge();t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href==`string`}catch{n=!1}if(n)e=t.contentWindow;else break;t=ge(e.document)}return t}function Nr(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t===`input`&&(e.type===`text`||e.type===`search`||e.type===`tel`||e.type===`url`||e.type===`password`)||t===`textarea`||e.contentEditable===`true`)}function Pr(e){var t=Mr(),n=e.focusedElem,r=e.selectionRange;if(t!==n&&n&&n.ownerDocument&&jr(n.ownerDocument.documentElement,n)){if(r!==null&&Nr(n)){if(t=r.start,e=r.end,e===void 0&&(e=t),`selectionStart`in n)n.selectionStart=t,n.selectionEnd=Math.min(e,n.value.length);else if(e=(t=n.ownerDocument||document)&&t.defaultView||window,e.getSelection){e=e.getSelection();var i=n.textContent.length,a=Math.min(r.start,i);r=r.end===void 0?a:Math.min(r.end,i),!e.extend&&a>r&&(i=r,r=a,a=i),i=Ar(n,a);var o=Ar(n,r);i&&o&&(e.rangeCount!==1||e.anchorNode!==i.node||e.anchorOffset!==i.offset||e.focusNode!==o.node||e.focusOffset!==o.offset)&&(t=t.createRange(),t.setStart(i.node,i.offset),e.removeAllRanges(),a>r?(e.addRange(t),e.extend(o.node,o.offset)):(t.setEnd(o.node,o.offset),e.addRange(t)))}}for(t=[],e=n;e=e.parentNode;)e.nodeType===1&&t.push({element:e,left:e.scrollLeft,top:e.scrollTop});for(typeof n.focus==`function`&&n.focus(),n=0;n<t.length;n++)e=t[n],e.element.scrollLeft=e.left,e.element.scrollTop=e.top}}var Fr=u&&`documentMode`in document&&11>=document.documentMode,Ir=null,Lr=null,Rr=null,zr=!1;function Br(e,t,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;zr||Ir==null||Ir!==ge(r)||(r=Ir,`selectionStart`in r&&Nr(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),Rr&&Or(Rr,r)||(Rr=r,r=di(Lr,`onSelect`),0<r.length&&(t=new Dn(`onSelect`,`select`,null,t,n),e.push({event:t,listeners:r}),t.target=Ir)))}function Vr(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n[`Webkit`+e]=`webkit`+t,n[`Moz`+e]=`moz`+t,n}var Hr={animationend:Vr(`Animation`,`AnimationEnd`),animationiteration:Vr(`Animation`,`AnimationIteration`),animationstart:Vr(`Animation`,`AnimationStart`),transitionend:Vr(`Transition`,`TransitionEnd`)},Ur={},Wr={};u&&(Wr=document.createElement(`div`).style,`AnimationEvent`in window||(delete Hr.animationend.animation,delete Hr.animationiteration.animation,delete Hr.animationstart.animation),`TransitionEvent`in window||delete Hr.transitionend.transition);function Gr(e){if(Ur[e])return Ur[e];if(!Hr[e])return e;var t=Hr[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in Wr)return Ur[e]=t[n];return e}var Kr=Gr(`animationend`),qr=Gr(`animationiteration`),Jr=Gr(`animationstart`),Yr=Gr(`transitionend`),Xr=new Map,Zr=`abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel`.split(` `);function Qr(e,t){Xr.set(e,t),c(t,[e])}for(var $r=0;$r<Zr.length;$r++){var ei=Zr[$r];Qr(ei.toLowerCase(),`on`+(ei[0].toUpperCase()+ei.slice(1)))}Qr(Kr,`onAnimationEnd`),Qr(qr,`onAnimationIteration`),Qr(Jr,`onAnimationStart`),Qr(`dblclick`,`onDoubleClick`),Qr(`focusin`,`onFocus`),Qr(`focusout`,`onBlur`),Qr(Yr,`onTransitionEnd`),l(`onMouseEnter`,[`mouseout`,`mouseover`]),l(`onMouseLeave`,[`mouseout`,`mouseover`]),l(`onPointerEnter`,[`pointerout`,`pointerover`]),l(`onPointerLeave`,[`pointerout`,`pointerover`]),c(`onChange`,`change click focusin focusout input keydown keyup selectionchange`.split(` `)),c(`onSelect`,`focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange`.split(` `)),c(`onBeforeInput`,[`compositionend`,`keypress`,`textInput`,`paste`]),c(`onCompositionEnd`,`compositionend focusout keydown keypress keyup mousedown`.split(` `)),c(`onCompositionStart`,`compositionstart focusout keydown keypress keyup mousedown`.split(` `)),c(`onCompositionUpdate`,`compositionupdate focusout keydown keypress keyup mousedown`.split(` `));var ti=`abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting`.split(` `),ni=new Set(`cancel close invalid load scroll toggle`.split(` `).concat(ti));function ri(e,t,n){var r=e.type||`unknown-event`;e.currentTarget=n,rt(r,t,void 0,e),e.currentTarget=null}function ii(e,t){t=!!(t&4);for(var n=0;n<e.length;n++){var r=e[n],i=r.event;r=r.listeners;a:{var a=void 0;if(t)for(var o=r.length-1;0<=o;o--){var s=r[o],c=s.instance,l=s.currentTarget;if(s=s.listener,c!==a&&i.isPropagationStopped())break a;ri(i,s,l),a=c}else for(o=0;o<r.length;o++){if(s=r[o],c=s.instance,l=s.currentTarget,s=s.listener,c!==a&&i.isPropagationStopped())break a;ri(i,s,l),a=c}}}if($e)throw e=et,$e=!1,et=null,e}function W(e,t){var n=t[Pi];n===void 0&&(n=t[Pi]=new Set);var r=e+`__bubble`;n.has(r)||(ci(t,e,2,!1),n.add(r))}function ai(e,t,n){var r=0;t&&(r|=4),ci(n,e,r,t)}var oi=`_reactListening`+Math.random().toString(36).slice(2);function si(e){if(!e[oi]){e[oi]=!0,o.forEach(function(t){t!==`selectionchange`&&(ni.has(t)||ai(t,!1,e),ai(t,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[oi]||(t[oi]=!0,ai(`selectionchange`,!1,t))}}function ci(e,t,n,r){switch(_n(t)){case 1:var i=fn;break;case 4:i=pn;break;default:i=mn}n=i.bind(null,t,n,e),i=void 0,!Je||t!==`touchstart`&&t!==`touchmove`&&t!==`wheel`||(i=!0),r?i===void 0?e.addEventListener(t,n,!0):e.addEventListener(t,n,{capture:!0,passive:i}):i===void 0?e.addEventListener(t,n,!1):e.addEventListener(t,n,{passive:i})}function li(e,t,n,r,i){var a=r;if(!(t&1)&&!(t&2)&&r!==null)a:for(;;){if(r===null)return;var o=r.tag;if(o===3||o===4){var s=r.stateNode.containerInfo;if(s===i||s.nodeType===8&&s.parentNode===i)break;if(o===4)for(o=r.return;o!==null;){var c=o.tag;if((c===3||c===4)&&(c=o.stateNode.containerInfo,c===i||c.nodeType===8&&c.parentNode===i))return;o=o.return}for(;s!==null;){if(o=Li(s),o===null)return;if(c=o.tag,c===5||c===6){r=a=o;continue a}s=s.parentNode}}r=r.return}Ke(function(){var r=a,i=Ie(n),o=[];a:{var s=Xr.get(e);if(s!==void 0){var c=Dn,l=e;switch(e){case`keypress`:if(Sn(n)===0)break a;case`keydown`:case`keyup`:c=Gn;break;case`focusin`:l=`focus`,c=In;break;case`focusout`:l=`blur`,c=In;break;case`beforeblur`:case`afterblur`:c=In;break;case`click`:if(n.button===2)break a;case`auxclick`:case`dblclick`:case`mousedown`:case`mousemove`:case`mouseup`:case`mouseout`:case`mouseover`:case`contextmenu`:c=Pn;break;case`drag`:case`dragend`:case`dragenter`:case`dragexit`:case`dragleave`:case`dragover`:case`dragstart`:case`drop`:c=Fn;break;case`touchcancel`:case`touchend`:case`touchmove`:case`touchstart`:c=qn;break;case Kr:case qr:case Jr:c=Ln;break;case Yr:c=Jn;break;case`scroll`:c=kn;break;case`wheel`:c=Yn;break;case`copy`:case`cut`:case`paste`:c=Rn;break;case`gotpointercapture`:case`lostpointercapture`:case`pointercancel`:case`pointerdown`:case`pointermove`:case`pointerout`:case`pointerover`:case`pointerup`:c=Kn}var u=!!(t&4),d=!u&&e===`scroll`,f=u?s===null?null:s+`Capture`:s;u=[];for(var p=r,m;p!==null;){m=p;var h=m.stateNode;if(m.tag===5&&h!==null&&(m=h,f!==null&&(h=qe(p,f),h!=null&&u.push(ui(p,h,m)))),d)break;p=p.return}0<u.length&&(s=new c(s,l,null,n,i),o.push({event:s,listeners:u}))}}if(!(t&7)){a:{if(s=e===`mouseover`||e===`pointerover`,c=e===`mouseout`||e===`pointerout`,s&&n!==Fe&&(l=n.relatedTarget||n.fromElement)&&(Li(l)||l[Ni]))break a;if((c||s)&&(s=i.window===i?i:(s=i.ownerDocument)?s.defaultView||s.parentWindow:window,c?(l=n.relatedTarget||n.toElement,c=r,l=l?Li(l):null,l!==null&&(d=it(l),l!==d||l.tag!==5&&l.tag!==6)&&(l=null)):(c=null,l=r),c!==l)){if(u=Pn,h=`onMouseLeave`,f=`onMouseEnter`,p=`mouse`,(e===`pointerout`||e===`pointerover`)&&(u=Kn,h=`onPointerLeave`,f=`onPointerEnter`,p=`pointer`),d=c==null?s:Ri(c),m=l==null?s:Ri(l),s=new u(h,p+`leave`,c,n,i),s.target=d,s.relatedTarget=m,h=null,Li(i)===r&&(u=new u(f,p+`enter`,l,n,i),u.target=m,u.relatedTarget=d,h=u),d=h,c&&l)b:{for(u=c,f=l,p=0,m=u;m;m=fi(m))p++;for(m=0,h=f;h;h=fi(h))m++;for(;0<p-m;)u=fi(u),p--;for(;0<m-p;)f=fi(f),m--;for(;p--;){if(u===f||f!==null&&u===f.alternate)break b;u=fi(u),f=fi(f)}u=null}else u=null;c!==null&&pi(o,s,c,u,!1),l!==null&&d!==null&&pi(o,d,l,u,!0)}}a:{if(s=r?Ri(r):window,c=s.nodeName&&s.nodeName.toLowerCase(),c===`select`||c===`input`&&s.type===`file`)var g=hr;else if(lr(s)){if(gr)g=Tr;else{g=Cr;var _=Sr}}else(c=s.nodeName)&&c.toLowerCase()===`input`&&(s.type===`checkbox`||s.type===`radio`)&&(g=wr);if(g&&=g(e,r)){ur(o,g,n,i);break a}_&&_(e,s,r),e===`focusout`&&(_=s._wrapperState)&&_.controlled&&s.type===`number`&&Se(s,`number`,s.value)}switch(_=r?Ri(r):window,e){case`focusin`:(lr(_)||_.contentEditable===`true`)&&(Ir=_,Lr=r,Rr=null);break;case`focusout`:Rr=Lr=Ir=null;break;case`mousedown`:zr=!0;break;case`contextmenu`:case`mouseup`:case`dragend`:zr=!1,Br(o,n,i);break;case`selectionchange`:if(Fr)break;case`keydown`:case`keyup`:Br(o,n,i)}var v;if(Zn)b:{switch(e){case`compositionstart`:var y=`onCompositionStart`;break b;case`compositionend`:y=`onCompositionEnd`;break b;case`compositionupdate`:y=`onCompositionUpdate`;break b}y=void 0}else ar?rr(e,n)&&(y=`onCompositionEnd`):e===`keydown`&&n.keyCode===229&&(y=`onCompositionStart`);y&&(er&&n.locale!==`ko`&&(ar||y!==`onCompositionStart`?y===`onCompositionEnd`&&ar&&(v=xn()):(vn=i,yn=`value`in vn?vn.value:vn.textContent,ar=!0)),_=di(r,y),0<_.length&&(y=new zn(y,e,null,n,i),o.push({event:y,listeners:_}),v?y.data=v:(v=ir(n),v!==null&&(y.data=v)))),(v=$n?or(e,n):sr(e,n))&&(r=di(r,`onBeforeInput`),0<r.length&&(i=new zn(`onBeforeInput`,`beforeinput`,null,n,i),o.push({event:i,listeners:r}),i.data=v))}ii(o,t)})}function ui(e,t,n){return{instance:e,listener:t,currentTarget:n}}function di(e,t){for(var n=t+`Capture`,r=[];e!==null;){var i=e,a=i.stateNode;i.tag===5&&a!==null&&(i=a,a=qe(e,n),a!=null&&r.unshift(ui(e,a,i)),a=qe(e,t),a!=null&&r.push(ui(e,a,i))),e=e.return}return r}function fi(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5);return e||null}function pi(e,t,n,r,i){for(var a=t._reactName,o=[];n!==null&&n!==r;){var s=n,c=s.alternate,l=s.stateNode;if(c!==null&&c===r)break;s.tag===5&&l!==null&&(s=l,i?(c=qe(n,a),c!=null&&o.unshift(ui(n,c,s))):i||(c=qe(n,a),c!=null&&o.push(ui(n,c,s)))),n=n.return}o.length!==0&&e.push({event:t,listeners:o})}var mi=/\r\n?/g,hi=/\u0000|\uFFFD/g;function gi(e){return(typeof e==`string`?e:``+e).replace(mi,`
`).replace(hi,``)}function _i(e,t,n){if(t=gi(t),gi(e)!==t&&n)throw Error(a(425))}function vi(){}var yi=null,bi=null;function xi(e,t){return e===`textarea`||e===`noscript`||typeof t.children==`string`||typeof t.children==`number`||typeof t.dangerouslySetInnerHTML==`object`&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Si=typeof setTimeout==`function`?setTimeout:void 0,Ci=typeof clearTimeout==`function`?clearTimeout:void 0,wi=typeof Promise==`function`?Promise:void 0,Ti=typeof queueMicrotask==`function`?queueMicrotask:wi===void 0?Si:function(e){return wi.resolve(null).then(e).catch(Ei)};function Ei(e){setTimeout(function(){throw e})}function Di(e,t){var n=t,r=0;do{var i=n.nextSibling;if(e.removeChild(n),i&&i.nodeType===8){if(n=i.data,n===`/$`){if(r===0){e.removeChild(i),ln(t);return}r--}else n!==`$`&&n!==`$?`&&n!==`$!`||r++}n=i}while(n);ln(t)}function Oi(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t===`$`||t===`$!`||t===`$?`)break;if(t===`/$`)return null}}return e}function ki(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n===`$`||n===`$!`||n===`$?`){if(t===0)return e;t--}else n===`/$`&&t++}e=e.previousSibling}return null}var Ai=Math.random().toString(36).slice(2),ji=`__reactFiber$`+Ai,Mi=`__reactProps$`+Ai,Ni=`__reactContainer$`+Ai,Pi=`__reactEvents$`+Ai,Fi=`__reactListeners$`+Ai,Ii=`__reactHandles$`+Ai;function Li(e){var t=e[ji];if(t)return t;for(var n=e.parentNode;n;){if(t=n[Ni]||n[ji]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=ki(e);e!==null;){if(n=e[ji])return n;e=ki(e)}return t}e=n,n=e.parentNode}return null}function G(e){return e=e[ji]||e[Ni],!e||e.tag!==5&&e.tag!==6&&e.tag!==13&&e.tag!==3?null:e}function Ri(e){if(e.tag===5||e.tag===6)return e.stateNode;throw Error(a(33))}function zi(e){return e[Mi]||null}var Bi=[],Vi=-1;function K(e){return{current:e}}function Hi(e){0>Vi||(e.current=Bi[Vi],Bi[Vi]=null,Vi--)}function q(e,t){Vi++,Bi[Vi]=e.current,e.current=t}var Ui={},Wi=K(Ui),Gi=K(!1),Ki=Ui;function qi(e,t){var n=e.type.contextTypes;if(!n)return Ui;var r=e.stateNode;if(r&&r.__reactInternalMemoizedUnmaskedChildContext===t)return r.__reactInternalMemoizedMaskedChildContext;var i={},a;for(a in n)i[a]=t[a];return r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=t,e.__reactInternalMemoizedMaskedChildContext=i),i}function Ji(e){return e=e.childContextTypes,e!=null}function Yi(){Hi(Gi),Hi(Wi)}function Xi(e,t,n){if(Wi.current!==Ui)throw Error(a(168));q(Wi,t),q(Gi,n)}function Zi(e,t,n){var r=e.stateNode;if(t=t.childContextTypes,typeof r.getChildContext!=`function`)return n;for(var i in r=r.getChildContext(),r)if(!(i in t))throw Error(a(108,fe(e)||`Unknown`,i));return N({},n,r)}function Qi(e){return e=(e=e.stateNode)&&e.__reactInternalMemoizedMergedChildContext||Ui,Ki=Wi.current,q(Wi,e),q(Gi,Gi.current),!0}function $i(e,t,n){var r=e.stateNode;if(!r)throw Error(a(169));n?(e=Zi(e,t,Ki),r.__reactInternalMemoizedMergedChildContext=e,Hi(Gi),Hi(Wi),q(Wi,e)):Hi(Gi),q(Gi,n)}var ea=null,ta=!1,na=!1;function ra(e){ea===null?ea=[e]:ea.push(e)}function ia(e){ta=!0,ra(e)}function aa(){if(!na&&ea!==null){na=!0;var e=0,t=U;try{var n=ea;for(U=1;e<n.length;e++){var r=n[e];do r=r(!0);while(r!==null)}ea=null,ta=!1}catch(t){throw ea!==null&&(ea=ea.slice(e+1)),ut(ht,aa),t}finally{U=t,na=!1}}return null}var oa=[],sa=0,ca=null,la=0,J=[],ua=0,da=null,fa=1,pa=``;function ma(e,t){oa[sa++]=la,oa[sa++]=ca,ca=e,la=t}function ha(e,t,n){J[ua++]=fa,J[ua++]=pa,J[ua++]=da,da=e;var r=fa;e=pa;var i=32-Ct(r)-1;r&=~(1<<i),n+=1;var a=32-Ct(t)+i;if(30<a){var o=i-i%5;a=(r&(1<<o)-1).toString(32),r>>=o,i-=o,fa=1<<32-Ct(t)+i|n<<i|r,pa=a+e}else fa=1<<a|n<<i|r,pa=e}function ga(e){e.return!==null&&(ma(e,1),ha(e,1,0))}function _a(e){for(;e===ca;)ca=oa[--sa],oa[sa]=null,la=oa[--sa],oa[sa]=null;for(;e===da;)da=J[--ua],J[ua]=null,pa=J[--ua],J[ua]=null,fa=J[--ua],J[ua]=null}var va=null,ya=null,ba=!1,xa=null;function Sa(e,t){var n=Jl(5,null,null,0);n.elementType=`DELETED`,n.stateNode=t,n.return=e,t=e.deletions,t===null?(e.deletions=[n],e.flags|=16):t.push(n)}function Ca(e,t){switch(e.tag){case 5:var n=e.type;return t=t.nodeType!==1||n.toLowerCase()!==t.nodeName.toLowerCase()?null:t,t!==null&&(e.stateNode=t,va=e,ya=Oi(t.firstChild),!0);case 6:return t=e.pendingProps===``||t.nodeType!==3?null:t,t!==null&&(e.stateNode=t,va=e,ya=null,!0);case 13:return t=t.nodeType===8?t:null,t!==null&&(n=da===null?null:{id:fa,overflow:pa},e.memoizedState={dehydrated:t,treeContext:n,retryLane:1073741824},n=Jl(18,null,null,0),n.stateNode=t,n.return=e,e.child=n,va=e,ya=null,!0);default:return!1}}function wa(e){return!!(e.mode&1)&&!(e.flags&128)}function Ta(e){if(ba){var t=ya;if(t){var n=t;if(!Ca(e,t)){if(wa(e))throw Error(a(418));t=Oi(n.nextSibling);var r=va;t&&Ca(e,t)?Sa(r,n):(e.flags=e.flags&-4097|2,ba=!1,va=e)}}else{if(wa(e))throw Error(a(418));e.flags=e.flags&-4097|2,ba=!1,va=e}}}function Ea(e){for(e=e.return;e!==null&&e.tag!==5&&e.tag!==3&&e.tag!==13;)e=e.return;va=e}function Da(e){if(e!==va)return!1;if(!ba)return Ea(e),ba=!0,!1;var t;if((t=e.tag!==3)&&!(t=e.tag!==5)&&(t=e.type,t=t!==`head`&&t!==`body`&&!xi(e.type,e.memoizedProps)),t&&=ya){if(wa(e))throw Oa(),Error(a(418));for(;t;)Sa(e,t),t=Oi(t.nextSibling)}if(Ea(e),e.tag===13){if(e=e.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(a(317));a:{for(e=e.nextSibling,t=0;e;){if(e.nodeType===8){var n=e.data;if(n===`/$`){if(t===0){ya=Oi(e.nextSibling);break a}t--}else n!==`$`&&n!==`$!`&&n!==`$?`||t++}e=e.nextSibling}ya=null}}else ya=va?Oi(e.stateNode.nextSibling):null;return!0}function Oa(){for(var e=ya;e;)e=Oi(e.nextSibling)}function ka(){ya=va=null,ba=!1}function Aa(e){xa===null?xa=[e]:xa.push(e)}var ja=C.ReactCurrentBatchConfig;function Ma(e,t){if(e&&e.defaultProps){for(var n in t=N({},t),e=e.defaultProps,e)t[n]===void 0&&(t[n]=e[n]);return t}return t}var Na=K(null),Pa=null,Fa=null,Ia=null;function La(){Ia=Fa=Pa=null}function Ra(e){var t=Na.current;Hi(Na),e._currentValue=t}function za(e,t,n){for(;e!==null;){var r=e.alternate;if((e.childLanes&t)===t?r!==null&&(r.childLanes&t)!==t&&(r.childLanes|=t):(e.childLanes|=t,r!==null&&(r.childLanes|=t)),e===n)break;e=e.return}}function Ba(e,t){Pa=e,Ia=Fa=null,e=e.dependencies,e!==null&&e.firstContext!==null&&((e.lanes&t)!==0&&(Ps=!0),e.firstContext=null)}function Va(e){var t=e._currentValue;if(Ia!==e){if(e={context:e,memoizedValue:t,next:null},Fa===null){if(Pa===null)throw Error(a(308));Fa=e,Pa.dependencies={lanes:0,firstContext:e}}else Fa=Fa.next=e}return t}var Ha=null;function Ua(e){Ha===null?Ha=[e]:Ha.push(e)}function Wa(e,t,n,r){var i=t.interleaved;return i===null?(n.next=n,Ua(t)):(n.next=i.next,i.next=n),t.interleaved=n,Ga(e,r)}function Ga(e,t){e.lanes|=t;var n=e.alternate;for(n!==null&&(n.lanes|=t),n=e,e=e.return;e!==null;)e.childLanes|=t,n=e.alternate,n!==null&&(n.childLanes|=t),n=e,e=e.return;return n.tag===3?n.stateNode:null}var Ka=!1;function qa(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function Ja(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,effects:e.effects})}function Ya(e,t){return{eventTime:e,lane:t,tag:0,payload:null,callback:null,next:null}}function Xa(e,t,n){var r=e.updateQueue;if(r===null)return null;if(r=r.shared,Q&2){var i=r.pending;return i===null?t.next=t:(t.next=i.next,i.next=t),r.pending=t,Ga(e,n)}return i=r.interleaved,i===null?(t.next=t,Ua(r)):(t.next=i.next,i.next=t),r.interleaved=t,Ga(e,n)}function Za(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,n&4194240)){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,Rt(e,n)}}function Qa(e,t){var n=e.updateQueue,r=e.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var i=null,a=null;if(n=n.firstBaseUpdate,n!==null){do{var o={eventTime:n.eventTime,lane:n.lane,tag:n.tag,payload:n.payload,callback:n.callback,next:null};a===null?i=a=o:a=a.next=o,n=n.next}while(n!==null);a===null?i=a=t:a=a.next=t}else i=a=t;n={baseState:r.baseState,firstBaseUpdate:i,lastBaseUpdate:a,shared:r.shared,effects:r.effects},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}function $a(e,t,n,r){var i=e.updateQueue;Ka=!1;var a=i.firstBaseUpdate,o=i.lastBaseUpdate,s=i.shared.pending;if(s!==null){i.shared.pending=null;var c=s,l=c.next;c.next=null,o===null?a=l:o.next=l,o=c;var u=e.alternate;u!==null&&(u=u.updateQueue,s=u.lastBaseUpdate,s!==o&&(s===null?u.firstBaseUpdate=l:s.next=l,u.lastBaseUpdate=c))}if(a!==null){var d=i.baseState;o=0,u=l=c=null,s=a;do{var f=s.lane,p=s.eventTime;if((r&f)===f){u!==null&&(u=u.next={eventTime:p,lane:0,tag:s.tag,payload:s.payload,callback:s.callback,next:null});a:{var m=e,h=s;switch(f=t,p=n,h.tag){case 1:if(m=h.payload,typeof m==`function`){d=m.call(p,d,f);break a}d=m;break a;case 3:m.flags=m.flags&-65537|128;case 0:if(m=h.payload,f=typeof m==`function`?m.call(p,d,f):m,f==null)break a;d=N({},d,f);break a;case 2:Ka=!0}}s.callback!==null&&s.lane!==0&&(e.flags|=64,f=i.effects,f===null?i.effects=[s]:f.push(s))}else p={eventTime:p,lane:f,tag:s.tag,payload:s.payload,callback:s.callback,next:null},u===null?(l=u=p,c=d):u=u.next=p,o|=f;if(s=s.next,s===null){if(s=i.shared.pending,s===null)break;f=s,s=f.next,f.next=null,i.lastBaseUpdate=f,i.shared.pending=null}}while(1);if(u===null&&(c=d),i.baseState=c,i.firstBaseUpdate=l,i.lastBaseUpdate=u,t=i.shared.interleaved,t!==null){i=t;do o|=i.lane,i=i.next;while(i!==t)}else a===null&&(i.shared.lanes=0);Xc|=o,e.lanes=o,e.memoizedState=d}}function eo(e,t,n){if(e=t.effects,t.effects=null,e!==null)for(t=0;t<e.length;t++){var r=e[t],i=r.callback;if(i!==null){if(r.callback=null,r=n,typeof i!=`function`)throw Error(a(191,i));i.call(r)}}}var to=new t.Component().refs;function no(e,t,n,r){t=e.memoizedState,n=n(r,t),n=n==null?t:N({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var ro={isMounted:function(e){return(e=e._reactInternals)?it(e)===e:!1},enqueueSetState:function(e,t,n){e=e._reactInternals;var r=ml(),i=hl(e),a=Ya(r,i);a.payload=t,n!=null&&(a.callback=n),t=Xa(e,a,i),t!==null&&(gl(t,e,i,r),Za(t,e,i))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var r=ml(),i=hl(e),a=Ya(r,i);a.tag=1,a.payload=t,n!=null&&(a.callback=n),t=Xa(e,a,i),t!==null&&(gl(t,e,i,r),Za(t,e,i))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=ml(),r=hl(e),i=Ya(n,r);i.tag=2,t!=null&&(i.callback=t),t=Xa(e,i,r),t!==null&&(gl(t,e,r,n),Za(t,e,r))}};function io(e,t,n,r,i,a,o){return e=e.stateNode,typeof e.shouldComponentUpdate==`function`?e.shouldComponentUpdate(r,a,o):t.prototype&&t.prototype.isPureReactComponent?!Or(n,r)||!Or(i,a):!0}function ao(e,t,n){var r=!1,i=Ui,a=t.contextType;return typeof a==`object`&&a?a=Va(a):(i=Ji(t)?Ki:Wi.current,r=t.contextTypes,a=(r=r!=null)?qi(e,i):Ui),t=new t(n,a),e.memoizedState=t.state!==null&&t.state!==void 0?t.state:null,t.updater=ro,e.stateNode=t,t._reactInternals=e,r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=i,e.__reactInternalMemoizedMaskedChildContext=a),t}function oo(e,t,n,r){e=t.state,typeof t.componentWillReceiveProps==`function`&&t.componentWillReceiveProps(n,r),typeof t.UNSAFE_componentWillReceiveProps==`function`&&t.UNSAFE_componentWillReceiveProps(n,r),t.state!==e&&ro.enqueueReplaceState(t,t.state,null)}function so(e,t,n,r){var i=e.stateNode;i.props=n,i.state=e.memoizedState,i.refs=to,qa(e);var a=t.contextType;typeof a==`object`&&a?i.context=Va(a):(a=Ji(t)?Ki:Wi.current,i.context=qi(e,a)),i.state=e.memoizedState,a=t.getDerivedStateFromProps,typeof a==`function`&&(no(e,t,a,n),i.state=e.memoizedState),typeof t.getDerivedStateFromProps==`function`||typeof i.getSnapshotBeforeUpdate==`function`||typeof i.UNSAFE_componentWillMount!=`function`&&typeof i.componentWillMount!=`function`||(t=i.state,typeof i.componentWillMount==`function`&&i.componentWillMount(),typeof i.UNSAFE_componentWillMount==`function`&&i.UNSAFE_componentWillMount(),t!==i.state&&ro.enqueueReplaceState(i,i.state,null),$a(e,n,i,r),i.state=e.memoizedState),typeof i.componentDidMount==`function`&&(e.flags|=4194308)}function co(e,t,n){if(e=n.ref,e!==null&&typeof e!=`function`&&typeof e!=`object`){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(a(309));var r=n.stateNode}if(!r)throw Error(a(147,e));var i=r,o=``+e;return t!==null&&t.ref!==null&&typeof t.ref==`function`&&t.ref._stringRef===o?t.ref:(t=function(e){var t=i.refs;t===to&&(t=i.refs={}),e===null?delete t[o]:t[o]=e},t._stringRef=o,t)}if(typeof e!=`string`)throw Error(a(284));if(!n._owner)throw Error(a(290,e))}return e}function lo(e,t){throw e=Object.prototype.toString.call(t),Error(a(31,e===`[object Object]`?`object with keys {`+Object.keys(t).join(`, `)+`}`:e))}function uo(e){var t=e._init;return t(e._payload)}function fo(e){function t(t,n){if(e){var r=t.deletions;r===null?(t.deletions=[n],t.flags|=16):r.push(n)}}function n(n,r){if(!e)return null;for(;r!==null;)t(n,r),r=r.sibling;return null}function r(e,t){for(e=new Map;t!==null;)t.key===null?e.set(t.index,t):e.set(t.key,t),t=t.sibling;return e}function i(e,t){return e=Zl(e,t),e.index=0,e.sibling=null,e}function o(t,n,r){return t.index=r,e?(r=t.alternate,r===null?(t.flags|=2,n):(r=r.index,r<n?(t.flags|=2,n):r)):(t.flags|=1048576,n)}function s(t){return e&&t.alternate===null&&(t.flags|=2),t}function c(e,t,n,r){return t===null||t.tag!==6?(t=tu(n,e.mode,r),t.return=e,t):(t=i(t,n),t.return=e,t)}function l(e,t,n,r){var a=n.type;return a===ee?d(e,t,n.props.children,r,n.key):t!==null&&(t.elementType===a||typeof a==`object`&&a&&a.$$typeof===j&&uo(a)===t.type)?(r=i(t,n.props),r.ref=co(e,t,n),r.return=e,r):(r=Ql(n.type,n.key,n.props,null,e.mode,r),r.ref=co(e,t,n),r.return=e,r)}function u(e,t,n,r){return t===null||t.tag!==4||t.stateNode.containerInfo!==n.containerInfo||t.stateNode.implementation!==n.implementation?(t=nu(n,e.mode,r),t.return=e,t):(t=i(t,n.children||[]),t.return=e,t)}function d(e,t,n,r,a){return t===null||t.tag!==7?(t=$l(n,e.mode,r,a),t.return=e,t):(t=i(t,n),t.return=e,t)}function f(e,t,n){if(typeof t==`string`&&t!==``||typeof t==`number`)return t=tu(``+t,e.mode,n),t.return=e,t;if(typeof t==`object`&&t){switch(t.$$typeof){case w:return n=Ql(t.type,t.key,t.props,null,e.mode,n),n.ref=co(e,null,t),n.return=e,n;case T:return t=nu(t,e.mode,n),t.return=e,t;case j:var r=t._init;return f(e,r(t._payload),n)}if(I(t)||M(t))return t=$l(t,e.mode,n,null),t.return=e,t;lo(e,t)}return null}function p(e,t,n,r){var i=t===null?null:t.key;if(typeof n==`string`&&n!==``||typeof n==`number`)return i===null?c(e,t,``+n,r):null;if(typeof n==`object`&&n){switch(n.$$typeof){case w:return n.key===i?l(e,t,n,r):null;case T:return n.key===i?u(e,t,n,r):null;case j:return i=n._init,p(e,t,i(n._payload),r)}if(I(n)||M(n))return i===null?d(e,t,n,r,null):null;lo(e,n)}return null}function m(e,t,n,r,i){if(typeof r==`string`&&r!==``||typeof r==`number`)return e=e.get(n)||null,c(t,e,``+r,i);if(typeof r==`object`&&r){switch(r.$$typeof){case w:return e=e.get(r.key===null?n:r.key)||null,l(t,e,r,i);case T:return e=e.get(r.key===null?n:r.key)||null,u(t,e,r,i);case j:var a=r._init;return m(e,t,n,a(r._payload),i)}if(I(r)||M(r))return e=e.get(n)||null,d(t,e,r,i,null);lo(t,r)}return null}function h(i,a,s,c){for(var l=null,u=null,d=a,h=a=0,g=null;d!==null&&h<s.length;h++){d.index>h?(g=d,d=null):g=d.sibling;var _=p(i,d,s[h],c);if(_===null){d===null&&(d=g);break}e&&d&&_.alternate===null&&t(i,d),a=o(_,a,h),u===null?l=_:u.sibling=_,u=_,d=g}if(h===s.length)return n(i,d),ba&&ma(i,h),l;if(d===null){for(;h<s.length;h++)d=f(i,s[h],c),d!==null&&(a=o(d,a,h),u===null?l=d:u.sibling=d,u=d);return ba&&ma(i,h),l}for(d=r(i,d);h<s.length;h++)g=m(d,i,h,s[h],c),g!==null&&(e&&g.alternate!==null&&d.delete(g.key===null?h:g.key),a=o(g,a,h),u===null?l=g:u.sibling=g,u=g);return e&&d.forEach(function(e){return t(i,e)}),ba&&ma(i,h),l}function g(i,s,c,l){var u=M(c);if(typeof u!=`function`)throw Error(a(150));if(c=u.call(c),c==null)throw Error(a(151));for(var d=u=null,h=s,g=s=0,_=null,v=c.next();h!==null&&!v.done;g++,v=c.next()){h.index>g?(_=h,h=null):_=h.sibling;var y=p(i,h,v.value,l);if(y===null){h===null&&(h=_);break}e&&h&&y.alternate===null&&t(i,h),s=o(y,s,g),d===null?u=y:d.sibling=y,d=y,h=_}if(v.done)return n(i,h),ba&&ma(i,g),u;if(h===null){for(;!v.done;g++,v=c.next())v=f(i,v.value,l),v!==null&&(s=o(v,s,g),d===null?u=v:d.sibling=v,d=v);return ba&&ma(i,g),u}for(h=r(i,h);!v.done;g++,v=c.next())v=m(h,i,g,v.value,l),v!==null&&(e&&v.alternate!==null&&h.delete(v.key===null?g:v.key),s=o(v,s,g),d===null?u=v:d.sibling=v,d=v);return e&&h.forEach(function(e){return t(i,e)}),ba&&ma(i,g),u}function _(e,r,a,o){if(typeof a==`object`&&a&&a.type===ee&&a.key===null&&(a=a.props.children),typeof a==`object`&&a){switch(a.$$typeof){case w:a:{for(var c=a.key,l=r;l!==null;){if(l.key===c){if(c=a.type,c===ee){if(l.tag===7){n(e,l.sibling),r=i(l,a.props.children),r.return=e,e=r;break a}}else if(l.elementType===c||typeof c==`object`&&c&&c.$$typeof===j&&uo(c)===l.type){n(e,l.sibling),r=i(l,a.props),r.ref=co(e,l,a),r.return=e,e=r;break a}n(e,l);break}t(e,l),l=l.sibling}a.type===ee?(r=$l(a.props.children,e.mode,o,a.key),r.return=e,e=r):(o=Ql(a.type,a.key,a.props,null,e.mode,o),o.ref=co(e,r,a),o.return=e,e=o)}return s(e);case T:a:{for(l=a.key;r!==null;){if(r.key===l){if(r.tag===4&&r.stateNode.containerInfo===a.containerInfo&&r.stateNode.implementation===a.implementation){n(e,r.sibling),r=i(r,a.children||[]),r.return=e,e=r;break a}n(e,r);break}t(e,r),r=r.sibling}r=nu(a,e.mode,o),r.return=e,e=r}return s(e);case j:return l=a._init,_(e,r,l(a._payload),o)}if(I(a))return h(e,r,a,o);if(M(a))return g(e,r,a,o);lo(e,a)}return typeof a==`string`&&a!==``||typeof a==`number`?(a=``+a,r!==null&&r.tag===6?(n(e,r.sibling),r=i(r,a),r.return=e,e=r):(n(e,r),r=tu(a,e.mode,o),r.return=e,e=r),s(e)):n(e,r)}return _}var po=fo(!0),mo=fo(!1),ho={},go=K(ho),_o=K(ho),vo=K(ho);function yo(e){if(e===ho)throw Error(a(174));return e}function bo(e,t){switch(q(vo,t),q(_o,e),q(go,ho),e=t.nodeType,e){case 9:case 11:t=(t=t.documentElement)?t.namespaceURI:Oe(null,``);break;default:e=e===8?t.parentNode:t,t=e.namespaceURI||null,e=e.tagName,t=Oe(t,e)}Hi(go),q(go,t)}function xo(){Hi(go),Hi(_o),Hi(vo)}function So(e){yo(vo.current);var t=yo(go.current),n=Oe(t,e.type);t!==n&&(q(_o,e),q(go,n))}function Co(e){_o.current===e&&(Hi(go),Hi(_o))}var wo=K(0);function To(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data===`$?`||n.data===`$!`))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!==void 0){if(t.flags&128)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var Eo=[];function Do(){for(var e=0;e<Eo.length;e++)Eo[e]._workInProgressVersionPrimary=null;Eo.length=0}var Oo=C.ReactCurrentDispatcher,ko=C.ReactCurrentBatchConfig,Ao=0,Y=null,jo=null,Mo=null,No=!1,Po=!1,Fo=0,Io=0;function Lo(){throw Error(a(321))}function Ro(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!Dr(e[n],t[n]))return!1;return!0}function zo(e,t,n,r,i,o){if(Ao=o,Y=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,Oo.current=e===null||e.memoizedState===null?xs:Ss,e=n(r,i),Po){o=0;do{if(Po=!1,Fo=0,25<=o)throw Error(a(301));o+=1,Mo=jo=null,t.updateQueue=null,Oo.current=Cs,e=n(r,i)}while(Po)}if(Oo.current=bs,t=jo!==null&&jo.next!==null,Ao=0,Mo=jo=Y=null,No=!1,t)throw Error(a(300));return e}function Bo(){var e=Fo!==0;return Fo=0,e}function Vo(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Mo===null?Y.memoizedState=Mo=e:Mo=Mo.next=e,Mo}function Ho(){if(jo===null){var e=Y.alternate;e=e===null?null:e.memoizedState}else e=jo.next;var t=Mo===null?Y.memoizedState:Mo.next;if(t!==null)Mo=t,jo=e;else{if(e===null)throw Error(a(310));jo=e,e={memoizedState:jo.memoizedState,baseState:jo.baseState,baseQueue:jo.baseQueue,queue:jo.queue,next:null},Mo===null?Y.memoizedState=Mo=e:Mo=Mo.next=e}return Mo}function Uo(e,t){return typeof t==`function`?t(e):t}function Wo(e){var t=Ho(),n=t.queue;if(n===null)throw Error(a(311));n.lastRenderedReducer=e;var r=jo,i=r.baseQueue,o=n.pending;if(o!==null){if(i!==null){var s=i.next;i.next=o.next,o.next=s}r.baseQueue=i=o,n.pending=null}if(i!==null){o=i.next,r=r.baseState;var c=s=null,l=null,u=o;do{var d=u.lane;if((Ao&d)===d)l!==null&&(l=l.next={lane:0,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null}),r=u.hasEagerState?u.eagerState:e(r,u.action);else{var f={lane:d,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null};l===null?(c=l=f,s=r):l=l.next=f,Y.lanes|=d,Xc|=d}u=u.next}while(u!==null&&u!==o);l===null?s=r:l.next=c,Dr(r,t.memoizedState)||(Ps=!0),t.memoizedState=r,t.baseState=s,t.baseQueue=l,n.lastRenderedState=r}if(e=n.interleaved,e!==null){i=e;do o=i.lane,Y.lanes|=o,Xc|=o,i=i.next;while(i!==e)}else i===null&&(n.lanes=0);return[t.memoizedState,n.dispatch]}function Go(e){var t=Ho(),n=t.queue;if(n===null)throw Error(a(311));n.lastRenderedReducer=e;var r=n.dispatch,i=n.pending,o=t.memoizedState;if(i!==null){n.pending=null;var s=i=i.next;do o=e(o,s.action),s=s.next;while(s!==i);Dr(o,t.memoizedState)||(Ps=!0),t.memoizedState=o,t.baseQueue===null&&(t.baseState=o),n.lastRenderedState=o}return[o,r]}function Ko(){}function qo(e,t){var n=Y,r=Ho(),i=t(),o=!Dr(r.memoizedState,i);if(o&&(r.memoizedState=i,Ps=!0),r=r.queue,is(Xo.bind(null,n,r,e),[e]),r.getSnapshot!==t||o||Mo!==null&&Mo.memoizedState.tag&1){if(n.flags|=2048,$o(9,Yo.bind(null,n,r,i,t),void 0,null),Uc===null)throw Error(a(349));Ao&30||Jo(n,t,i)}return i}function Jo(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=Y.updateQueue,t===null?(t={lastEffect:null,stores:null},Y.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function Yo(e,t,n,r){t.value=n,t.getSnapshot=r,Zo(t)&&Qo(e)}function Xo(e,t,n){return n(function(){Zo(t)&&Qo(e)})}function Zo(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!Dr(e,n)}catch{return!0}}function Qo(e){var t=Ga(e,1);t!==null&&gl(t,e,1,-1)}function X(e){var t=Vo();return typeof e==`function`&&(e=e()),t.memoizedState=t.baseState=e,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Uo,lastRenderedState:e},t.queue=e,e=e.dispatch=gs.bind(null,Y,e),[t.memoizedState,e]}function $o(e,t,n,r){return e={tag:e,create:t,destroy:n,deps:r,next:null},t=Y.updateQueue,t===null?(t={lastEffect:null,stores:null},Y.updateQueue=t,t.lastEffect=e.next=e):(n=t.lastEffect,n===null?t.lastEffect=e.next=e:(r=n.next,n.next=e,e.next=r,t.lastEffect=e)),e}function es(){return Ho().memoizedState}function ts(e,t,n,r){var i=Vo();Y.flags|=e,i.memoizedState=$o(1|t,n,void 0,r===void 0?null:r)}function ns(e,t,n,r){var i=Ho();r=r===void 0?null:r;var a=void 0;if(jo!==null){var o=jo.memoizedState;if(a=o.destroy,r!==null&&Ro(r,o.deps)){i.memoizedState=$o(t,n,a,r);return}}Y.flags|=e,i.memoizedState=$o(1|t,n,a,r)}function rs(e,t){return ts(8390656,8,e,t)}function is(e,t){return ns(2048,8,e,t)}function as(e,t){return ns(4,2,e,t)}function os(e,t){return ns(4,4,e,t)}function ss(e,t){if(typeof t==`function`)return e=e(),t(e),function(){t(null)};if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function cs(e,t,n){return n=n==null?null:n.concat([e]),ns(4,4,ss.bind(null,t,e),n)}function ls(){}function us(e,t){var n=Ho();t=t===void 0?null:t;var r=n.memoizedState;return r!==null&&t!==null&&Ro(t,r[1])?r[0]:(n.memoizedState=[e,t],e)}function ds(e,t){var n=Ho();t=t===void 0?null:t;var r=n.memoizedState;return r!==null&&t!==null&&Ro(t,r[1])?r[0]:(e=e(),n.memoizedState=[e,t],e)}function fs(e,t,n){return Ao&21?(Dr(n,t)||(n=Pt(),Y.lanes|=n,Xc|=n,e.baseState=!0),t):(e.baseState&&(e.baseState=!1,Ps=!0),e.memoizedState=n)}function ps(e,t){var n=U;U=n!==0&&4>n?n:4,e(!0);var r=ko.transition;ko.transition={};try{e(!1),t()}finally{U=n,ko.transition=r}}function ms(){return Ho().memoizedState}function hs(e,t,n){var r=hl(e);if(n={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null},_s(e))vs(t,n);else if(n=Wa(e,t,n,r),n!==null){var i=ml();gl(n,e,r,i),ys(n,t,r)}}function gs(e,t,n){var r=hl(e),i={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null};if(_s(e))vs(t,i);else{var a=e.alternate;if(e.lanes===0&&(a===null||a.lanes===0)&&(a=t.lastRenderedReducer,a!==null))try{var o=t.lastRenderedState,s=a(o,n);if(i.hasEagerState=!0,i.eagerState=s,Dr(s,o)){var c=t.interleaved;c===null?(i.next=i,Ua(t)):(i.next=c.next,c.next=i),t.interleaved=i;return}}catch{}n=Wa(e,t,i,r),n!==null&&(i=ml(),gl(n,e,r,i),ys(n,t,r))}}function _s(e){var t=e.alternate;return e===Y||t!==null&&t===Y}function vs(e,t){Po=No=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function ys(e,t,n){if(n&4194240){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,Rt(e,n)}}var bs={readContext:Va,useCallback:Lo,useContext:Lo,useEffect:Lo,useImperativeHandle:Lo,useInsertionEffect:Lo,useLayoutEffect:Lo,useMemo:Lo,useReducer:Lo,useRef:Lo,useState:Lo,useDebugValue:Lo,useDeferredValue:Lo,useTransition:Lo,useMutableSource:Lo,useSyncExternalStore:Lo,useId:Lo,unstable_isNewReconciler:!1},xs={readContext:Va,useCallback:function(e,t){return Vo().memoizedState=[e,t===void 0?null:t],e},useContext:Va,useEffect:rs,useImperativeHandle:function(e,t,n){return n=n==null?null:n.concat([e]),ts(4194308,4,ss.bind(null,t,e),n)},useLayoutEffect:function(e,t){return ts(4194308,4,e,t)},useInsertionEffect:function(e,t){return ts(4,2,e,t)},useMemo:function(e,t){var n=Vo();return t=t===void 0?null:t,e=e(),n.memoizedState=[e,t],e},useReducer:function(e,t,n){var r=Vo();return t=n===void 0?t:n(t),r.memoizedState=r.baseState=t,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:t},r.queue=e,e=e.dispatch=hs.bind(null,Y,e),[r.memoizedState,e]},useRef:function(e){var t=Vo();return e={current:e},t.memoizedState=e},useState:X,useDebugValue:ls,useDeferredValue:function(e){return Vo().memoizedState=e},useTransition:function(){var e=X(!1),t=e[0];return e=ps.bind(null,e[1]),Vo().memoizedState=e,[t,e]},useMutableSource:function(){},useSyncExternalStore:function(e,t,n){var r=Y,i=Vo();if(ba){if(n===void 0)throw Error(a(407));n=n()}else{if(n=t(),Uc===null)throw Error(a(349));Ao&30||Jo(r,t,n)}i.memoizedState=n;var o={value:n,getSnapshot:t};return i.queue=o,rs(Xo.bind(null,r,o,e),[e]),r.flags|=2048,$o(9,Yo.bind(null,r,o,n,t),void 0,null),n},useId:function(){var e=Vo(),t=Uc.identifierPrefix;if(ba){var n=pa,r=fa;n=(r&~(1<<32-Ct(r)-1)).toString(32)+n,t=`:`+t+`R`+n,n=Fo++,0<n&&(t+=`H`+n.toString(32)),t+=`:`}else n=Io++,t=`:`+t+`r`+n.toString(32)+`:`;return e.memoizedState=t},unstable_isNewReconciler:!1},Ss={readContext:Va,useCallback:us,useContext:Va,useEffect:is,useImperativeHandle:cs,useInsertionEffect:as,useLayoutEffect:os,useMemo:ds,useReducer:Wo,useRef:es,useState:function(){return Wo(Uo)},useDebugValue:ls,useDeferredValue:function(e){return fs(Ho(),jo.memoizedState,e)},useTransition:function(){return[Wo(Uo)[0],Ho().memoizedState]},useMutableSource:Ko,useSyncExternalStore:qo,useId:ms,unstable_isNewReconciler:!1},Cs={readContext:Va,useCallback:us,useContext:Va,useEffect:is,useImperativeHandle:cs,useInsertionEffect:as,useLayoutEffect:os,useMemo:ds,useReducer:Go,useRef:es,useState:function(){return Go(Uo)},useDebugValue:ls,useDeferredValue:function(e){var t=Ho();return jo===null?t.memoizedState=e:fs(t,jo.memoizedState,e)},useTransition:function(){return[Go(Uo)[0],Ho().memoizedState]},useMutableSource:Ko,useSyncExternalStore:qo,useId:ms,unstable_isNewReconciler:!1};function ws(e,t){try{var n=``,r=t;do n+=ue(r),r=r.return;while(r);var i=n}catch(e){i=`
Error generating stack: `+e.message+`
`+e.stack}return{value:e,source:t,stack:i,digest:null}}function Ts(e,t,n){return{value:e,source:null,stack:n??null,digest:t??null}}function Es(e,t){try{console.error(t.value)}catch(e){setTimeout(function(){throw e})}}var Ds=typeof WeakMap==`function`?WeakMap:Map;function Os(e,t,n){n=Ya(-1,n),n.tag=3,n.payload={element:null};var r=t.value;return n.callback=function(){il||(il=!0,al=r),Es(e,t)},n}function ks(e,t,n){n=Ya(-1,n),n.tag=3;var r=e.type.getDerivedStateFromError;if(typeof r==`function`){var i=t.value;n.payload=function(){return r(i)},n.callback=function(){Es(e,t)}}var a=e.stateNode;return a!==null&&typeof a.componentDidCatch==`function`&&(n.callback=function(){Es(e,t),typeof r!=`function`&&(ol===null?ol=new Set([this]):ol.add(this));var n=t.stack;this.componentDidCatch(t.value,{componentStack:n===null?``:n})}),n}function As(e,t,n){var r=e.pingCache;if(r===null){r=e.pingCache=new Ds;var i=new Set;r.set(t,i)}else i=r.get(t),i===void 0&&(i=new Set,r.set(t,i));i.has(n)||(i.add(n),e=Vl.bind(null,e,t,n),t.then(e,e))}function js(e){do{var t;if((t=e.tag===13)&&(t=e.memoizedState,t=t===null||t.dehydrated!==null),t)return e;e=e.return}while(e!==null);return null}function Ms(e,t,n,r,i){return e.mode&1?(e.flags|=65536,e.lanes=i,e):(e===t?e.flags|=65536:(e.flags|=128,n.flags|=131072,n.flags&=-52805,n.tag===1&&(n.alternate===null?n.tag=17:(t=Ya(-1,1),t.tag=2,Xa(n,t,1))),n.lanes|=1),e)}var Ns=C.ReactCurrentOwner,Ps=!1;function Fs(e,t,n,r){t.child=e===null?mo(t,null,n,r):po(t,e.child,n,r)}function Is(e,t,n,r,i){n=n.render;var a=t.ref;return Ba(t,i),r=zo(e,t,n,r,a,i),n=Bo(),e!==null&&!Ps?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~i,nc(e,t,i)):(ba&&n&&ga(t),t.flags|=1,Fs(e,t,r,i),t.child)}function Ls(e,t,n,r,i){if(e===null){var a=n.type;return typeof a==`function`&&!Yl(a)&&a.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(t.tag=15,t.type=a,Rs(e,t,a,r,i)):(e=Ql(n.type,null,r,t,t.mode,i),e.ref=t.ref,e.return=t,t.child=e)}if(a=e.child,(e.lanes&i)===0){var o=a.memoizedProps;if(n=n.compare,n=n===null?Or:n,n(o,r)&&e.ref===t.ref)return nc(e,t,i)}return t.flags|=1,e=Zl(a,r),e.ref=t.ref,e.return=t,t.child=e}function Rs(e,t,n,r,i){if(e!==null){var a=e.memoizedProps;if(Or(a,r)&&e.ref===t.ref){if(Ps=!1,t.pendingProps=r=a,(e.lanes&i)!==0)e.flags&131072&&(Ps=!0);else return t.lanes=e.lanes,nc(e,t,i)}}return Vs(e,t,n,r,i)}function zs(e,t,n){var r=t.pendingProps,i=r.children,a=e===null?null:e.memoizedState;if(r.mode===`hidden`){if(!(t.mode&1))t.memoizedState={baseLanes:0,cachePool:null,transitions:null},q(qc,Kc),Kc|=n;else{if(!(n&1073741824))return e=a===null?n:a.baseLanes|n,t.lanes=t.childLanes=1073741824,t.memoizedState={baseLanes:e,cachePool:null,transitions:null},t.updateQueue=null,q(qc,Kc),Kc|=e,null;t.memoizedState={baseLanes:0,cachePool:null,transitions:null},r=a===null?n:a.baseLanes,q(qc,Kc),Kc|=r}}else a===null?r=n:(r=a.baseLanes|n,t.memoizedState=null),q(qc,Kc),Kc|=r;return Fs(e,t,i,n),t.child}function Bs(e,t){var n=t.ref;(e===null&&n!==null||e!==null&&e.ref!==n)&&(t.flags|=512,t.flags|=2097152)}function Vs(e,t,n,r,i){var a=Ji(n)?Ki:Wi.current;return a=qi(t,a),Ba(t,i),n=zo(e,t,n,r,a,i),r=Bo(),e!==null&&!Ps?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~i,nc(e,t,i)):(ba&&r&&ga(t),t.flags|=1,Fs(e,t,n,i),t.child)}function Hs(e,t,n,r,i){if(Ji(n)){var a=!0;Qi(t)}else a=!1;if(Ba(t,i),t.stateNode===null)tc(e,t),ao(t,n,r),so(t,n,r,i),r=!0;else if(e===null){var o=t.stateNode,s=t.memoizedProps;o.props=s;var c=o.context,l=n.contextType;typeof l==`object`&&l?l=Va(l):(l=Ji(n)?Ki:Wi.current,l=qi(t,l));var u=n.getDerivedStateFromProps,d=typeof u==`function`||typeof o.getSnapshotBeforeUpdate==`function`;d||typeof o.UNSAFE_componentWillReceiveProps!=`function`&&typeof o.componentWillReceiveProps!=`function`||(s!==r||c!==l)&&oo(t,o,r,l),Ka=!1;var f=t.memoizedState;o.state=f,$a(t,r,o,i),c=t.memoizedState,s!==r||f!==c||Gi.current||Ka?(typeof u==`function`&&(no(t,n,u,r),c=t.memoizedState),(s=Ka||io(t,n,s,r,f,c,l))?(d||typeof o.UNSAFE_componentWillMount!=`function`&&typeof o.componentWillMount!=`function`||(typeof o.componentWillMount==`function`&&o.componentWillMount(),typeof o.UNSAFE_componentWillMount==`function`&&o.UNSAFE_componentWillMount()),typeof o.componentDidMount==`function`&&(t.flags|=4194308)):(typeof o.componentDidMount==`function`&&(t.flags|=4194308),t.memoizedProps=r,t.memoizedState=c),o.props=r,o.state=c,o.context=l,r=s):(typeof o.componentDidMount==`function`&&(t.flags|=4194308),r=!1)}else{o=t.stateNode,Ja(e,t),s=t.memoizedProps,l=t.type===t.elementType?s:Ma(t.type,s),o.props=l,d=t.pendingProps,f=o.context,c=n.contextType,typeof c==`object`&&c?c=Va(c):(c=Ji(n)?Ki:Wi.current,c=qi(t,c));var p=n.getDerivedStateFromProps;(u=typeof p==`function`||typeof o.getSnapshotBeforeUpdate==`function`)||typeof o.UNSAFE_componentWillReceiveProps!=`function`&&typeof o.componentWillReceiveProps!=`function`||(s!==d||f!==c)&&oo(t,o,r,c),Ka=!1,f=t.memoizedState,o.state=f,$a(t,r,o,i);var m=t.memoizedState;s!==d||f!==m||Gi.current||Ka?(typeof p==`function`&&(no(t,n,p,r),m=t.memoizedState),(l=Ka||io(t,n,l,r,f,m,c)||!1)?(u||typeof o.UNSAFE_componentWillUpdate!=`function`&&typeof o.componentWillUpdate!=`function`||(typeof o.componentWillUpdate==`function`&&o.componentWillUpdate(r,m,c),typeof o.UNSAFE_componentWillUpdate==`function`&&o.UNSAFE_componentWillUpdate(r,m,c)),typeof o.componentDidUpdate==`function`&&(t.flags|=4),typeof o.getSnapshotBeforeUpdate==`function`&&(t.flags|=1024)):(typeof o.componentDidUpdate!=`function`||s===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof o.getSnapshotBeforeUpdate!=`function`||s===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),t.memoizedProps=r,t.memoizedState=m),o.props=r,o.state=m,o.context=c,r=l):(typeof o.componentDidUpdate!=`function`||s===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof o.getSnapshotBeforeUpdate!=`function`||s===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),r=!1)}return Us(e,t,n,r,a,i)}function Us(e,t,n,r,i,a){Bs(e,t);var o=!!(t.flags&128);if(!r&&!o)return i&&$i(t,n,!1),nc(e,t,a);r=t.stateNode,Ns.current=t;var s=o&&typeof n.getDerivedStateFromError!=`function`?null:r.render();return t.flags|=1,e!==null&&o?(t.child=po(t,e.child,null,a),t.child=po(t,null,s,a)):Fs(e,t,s,a),t.memoizedState=r.state,i&&$i(t,n,!0),t.child}function Ws(e){var t=e.stateNode;t.pendingContext?Xi(e,t.pendingContext,t.pendingContext!==t.context):t.context&&Xi(e,t.context,!1),bo(e,t.containerInfo)}function Gs(e,t,n,r,i){return ka(),Aa(i),t.flags|=256,Fs(e,t,n,r),t.child}var Ks={dehydrated:null,treeContext:null,retryLane:0};function qs(e){return{baseLanes:e,cachePool:null,transitions:null}}function Js(e,t,n){var r=t.pendingProps,i=wo.current,a=!1,o=!!(t.flags&128),s;if((s=o)||(s=e!==null&&e.memoizedState===null?!1:!!(i&2)),s?(a=!0,t.flags&=-129):(e===null||e.memoizedState!==null)&&(i|=1),q(wo,i&1),e===null)return Ta(t),e=t.memoizedState,e!==null&&(e=e.dehydrated,e!==null)?(t.lanes=t.mode&1?e.data===`$!`?8:1073741824:1,null):(o=r.children,e=r.fallback,a?(r=t.mode,a=t.child,o={mode:`hidden`,children:o},!(r&1)&&a!==null?(a.childLanes=0,a.pendingProps=o):a=eu(o,r,0,null),e=$l(e,r,n,null),a.return=t,e.return=t,a.sibling=e,t.child=a,t.child.memoizedState=qs(n),t.memoizedState=Ks,e):Ys(t,o));if(i=e.memoizedState,i!==null&&(s=i.dehydrated,s!==null))return Zs(e,t,o,r,s,i,n);if(a){a=r.fallback,o=t.mode,i=e.child,s=i.sibling;var c={mode:`hidden`,children:r.children};return!(o&1)&&t.child!==i?(r=t.child,r.childLanes=0,r.pendingProps=c,t.deletions=null):(r=Zl(i,c),r.subtreeFlags=i.subtreeFlags&14680064),s===null?(a=$l(a,o,n,null),a.flags|=2):a=Zl(s,a),a.return=t,r.return=t,r.sibling=a,t.child=r,r=a,a=t.child,o=e.child.memoizedState,o=o===null?qs(n):{baseLanes:o.baseLanes|n,cachePool:null,transitions:o.transitions},a.memoizedState=o,a.childLanes=e.childLanes&~n,t.memoizedState=Ks,r}return a=e.child,e=a.sibling,r=Zl(a,{mode:`visible`,children:r.children}),!(t.mode&1)&&(r.lanes=n),r.return=t,r.sibling=null,e!==null&&(n=t.deletions,n===null?(t.deletions=[e],t.flags|=16):n.push(e)),t.child=r,t.memoizedState=null,r}function Ys(e,t){return t=eu({mode:`visible`,children:t},e.mode,0,null),t.return=e,e.child=t}function Xs(e,t,n,r){return r!==null&&Aa(r),po(t,e.child,null,n),e=Ys(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function Zs(e,t,n,r,i,o,s){if(n)return t.flags&256?(t.flags&=-257,r=Ts(Error(a(422))),Xs(e,t,s,r)):t.memoizedState===null?(o=r.fallback,i=t.mode,r=eu({mode:`visible`,children:r.children},i,0,null),o=$l(o,i,s,null),o.flags|=2,r.return=t,o.return=t,r.sibling=o,t.child=r,t.mode&1&&po(t,e.child,null,s),t.child.memoizedState=qs(s),t.memoizedState=Ks,o):(t.child=e.child,t.flags|=128,null);if(!(t.mode&1))return Xs(e,t,s,null);if(i.data===`$!`){if(r=i.nextSibling&&i.nextSibling.dataset,r)var c=r.dgst;return r=c,o=Error(a(419)),r=Ts(o,r,void 0),Xs(e,t,s,r)}if(c=(s&e.childLanes)!==0,Ps||c){if(r=Uc,r!==null){switch(s&-s){case 4:i=2;break;case 16:i=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:i=32;break;case 536870912:i=268435456;break;default:i=0}i=(i&(r.suspendedLanes|s))===0?i:0,i!==0&&i!==o.retryLane&&(o.retryLane=i,Ga(e,i),gl(r,e,i,-1))}return Al(),r=Ts(Error(a(421))),Xs(e,t,s,r)}return i.data===`$?`?(t.flags|=128,t.child=e.child,t=Ul.bind(null,e),i._reactRetry=t,null):(e=o.treeContext,ya=Oi(i.nextSibling),va=t,ba=!0,xa=null,e!==null&&(J[ua++]=fa,J[ua++]=pa,J[ua++]=da,fa=e.id,pa=e.overflow,da=t),t=Ys(t,r.children),t.flags|=4096,t)}function Qs(e,t,n){e.lanes|=t;var r=e.alternate;r!==null&&(r.lanes|=t),za(e.return,t,n)}function $s(e,t,n,r,i){var a=e.memoizedState;a===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:i}:(a.isBackwards=t,a.rendering=null,a.renderingStartTime=0,a.last=r,a.tail=n,a.tailMode=i)}function ec(e,t,n){var r=t.pendingProps,i=r.revealOrder,a=r.tail;if(Fs(e,t,r.children,n),r=wo.current,r&2)r=r&1|2,t.flags|=128;else{if(e!==null&&e.flags&128)a:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Qs(e,n,t);else if(e.tag===19)Qs(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break a;for(;e.sibling===null;){if(e.return===null||e.return===t)break a;e=e.return}e.sibling.return=e.return,e=e.sibling}r&=1}if(q(wo,r),!(t.mode&1))t.memoizedState=null;else switch(i){case`forwards`:for(n=t.child,i=null;n!==null;)e=n.alternate,e!==null&&To(e)===null&&(i=n),n=n.sibling;n=i,n===null?(i=t.child,t.child=null):(i=n.sibling,n.sibling=null),$s(t,!1,i,n,a);break;case`backwards`:for(n=null,i=t.child,t.child=null;i!==null;){if(e=i.alternate,e!==null&&To(e)===null){t.child=i;break}e=i.sibling,i.sibling=n,n=i,i=e}$s(t,!0,n,null,a);break;case`together`:$s(t,!1,null,null,void 0);break;default:t.memoizedState=null}return t.child}function tc(e,t){!(t.mode&1)&&e!==null&&(e.alternate=null,t.alternate=null,t.flags|=2)}function nc(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),Xc|=t.lanes,(n&t.childLanes)===0)return null;if(e!==null&&t.child!==e.child)throw Error(a(153));if(t.child!==null){for(e=t.child,n=Zl(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=Zl(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function rc(e,t,n){switch(t.tag){case 3:Ws(t),ka();break;case 5:So(t);break;case 1:Ji(t.type)&&Qi(t);break;case 4:bo(t,t.stateNode.containerInfo);break;case 10:var r=t.type._context,i=t.memoizedProps.value;q(Na,r._currentValue),r._currentValue=i;break;case 13:if(r=t.memoizedState,r!==null)return r.dehydrated===null?(n&t.child.childLanes)===0?(q(wo,wo.current&1),e=nc(e,t,n),e===null?null:e.sibling):Js(e,t,n):(q(wo,wo.current&1),t.flags|=128,null);q(wo,wo.current&1);break;case 19:if(r=(n&t.childLanes)!==0,e.flags&128){if(r)return ec(e,t,n);t.flags|=128}if(i=t.memoizedState,i!==null&&(i.rendering=null,i.tail=null,i.lastEffect=null),q(wo,wo.current),r)break;return null;case 22:case 23:return t.lanes=0,zs(e,t,n)}return nc(e,t,n)}var ic=function(e,t){for(var n=t.child;n!==null;){if(n.tag===5||n.tag===6)e.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===t)break;for(;n.sibling===null;){if(n.return===null||n.return===t)return;n=n.return}n.sibling.return=n.return,n=n.sibling}},ac=function(e,t,n,r){var i=e.memoizedProps;if(i!==r){e=t.stateNode,yo(go.current);var a=null;switch(n){case`input`:i=_e(e,i),r=_e(e,r),a=[];break;case`select`:i=N({},i,{value:void 0}),r=N({},r,{value:void 0}),a=[];break;case`textarea`:i=Ce(e,i),r=Ce(e,r),a=[];break;default:typeof i.onClick!=`function`&&typeof r.onClick==`function`&&(e.onclick=vi)}Ne(n,r);var o;for(u in n=null,i)if(!r.hasOwnProperty(u)&&i.hasOwnProperty(u)&&i[u]!=null){if(u===`style`){var c=i[u];for(o in c)c.hasOwnProperty(o)&&(n||={},n[o]=``)}else u!==`dangerouslySetInnerHTML`&&u!==`children`&&u!==`suppressContentEditableWarning`&&u!==`suppressHydrationWarning`&&u!==`autoFocus`&&(s.hasOwnProperty(u)?a||=[]:(a||=[]).push(u,null))}for(u in r){var l=r[u];if(c=i?.[u],r.hasOwnProperty(u)&&l!==c&&(l!=null||c!=null)){if(u===`style`){if(c){for(o in c)!c.hasOwnProperty(o)||l&&l.hasOwnProperty(o)||(n||={},n[o]=``);for(o in l)l.hasOwnProperty(o)&&c[o]!==l[o]&&(n||={},n[o]=l[o])}else n||(a||=[],a.push(u,n)),n=l}else u===`dangerouslySetInnerHTML`?(l=l?l.__html:void 0,c=c?c.__html:void 0,l!=null&&c!==l&&(a||=[]).push(u,l)):u===`children`?typeof l!=`string`&&typeof l!=`number`||(a||=[]).push(u,``+l):u!==`suppressContentEditableWarning`&&u!==`suppressHydrationWarning`&&(s.hasOwnProperty(u)?(l!=null&&u===`onScroll`&&W(`scroll`,e),a||c===l||(a=[])):(a||=[]).push(u,l))}}n&&(a||=[]).push(`style`,n);var u=a;(t.updateQueue=u)&&(t.flags|=4)}},oc=function(e,t,n,r){n!==r&&(t.flags|=4)};function sc(e,t){if(!ba)switch(e.tailMode){case`hidden`:t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case`collapsed`:n=e.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:r.sibling=null}}function cc(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,r=0;if(t)for(var i=e.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags&14680064,r|=i.flags&14680064,i.return=e,i=i.sibling;else for(i=e.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags,r|=i.flags,i.return=e,i=i.sibling;return e.subtreeFlags|=r,e.childLanes=n,t}function lc(e,t,n){var r=t.pendingProps;switch(_a(t),t.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return cc(t),null;case 1:return Ji(t.type)&&Yi(),cc(t),null;case 3:return r=t.stateNode,xo(),Hi(Gi),Hi(Wi),Do(),r.pendingContext&&(r.context=r.pendingContext,r.pendingContext=null),(e===null||e.child===null)&&(Da(t)?t.flags|=4:e===null||e.memoizedState.isDehydrated&&!(t.flags&256)||(t.flags|=1024,xa!==null&&(bl(xa),xa=null))),cc(t),null;case 5:Co(t);var i=yo(vo.current);if(n=t.type,e!==null&&t.stateNode!=null)ac(e,t,n,r,i),e.ref!==t.ref&&(t.flags|=512,t.flags|=2097152);else{if(!r){if(t.stateNode===null)throw Error(a(166));return cc(t),null}if(e=yo(go.current),Da(t)){r=t.stateNode,n=t.type;var o=t.memoizedProps;switch(r[ji]=t,r[Mi]=o,e=!!(t.mode&1),n){case`dialog`:W(`cancel`,r),W(`close`,r);break;case`iframe`:case`object`:case`embed`:W(`load`,r);break;case`video`:case`audio`:for(i=0;i<ti.length;i++)W(ti[i],r);break;case`source`:W(`error`,r);break;case`img`:case`image`:case`link`:W(`error`,r),W(`load`,r);break;case`details`:W(`toggle`,r);break;case`input`:ve(r,o),W(`invalid`,r);break;case`select`:r._wrapperState={wasMultiple:!!o.multiple},W(`invalid`,r);break;case`textarea`:we(r,o),W(`invalid`,r)}for(var c in Ne(n,o),i=null,o)if(o.hasOwnProperty(c)){var l=o[c];c===`children`?typeof l==`string`?r.textContent!==l&&(!0!==o.suppressHydrationWarning&&_i(r.textContent,l,e),i=[`children`,l]):typeof l==`number`&&r.textContent!==``+l&&(!0!==o.suppressHydrationWarning&&_i(r.textContent,l,e),i=[`children`,``+l]):s.hasOwnProperty(c)&&l!=null&&c===`onScroll`&&W(`scroll`,r)}switch(n){case`input`:me(r),xe(r,o,!0);break;case`textarea`:me(r),Ee(r);break;case`select`:case`option`:break;default:typeof o.onClick==`function`&&(r.onclick=vi)}r=i,t.updateQueue=r,r!==null&&(t.flags|=4)}else{c=i.nodeType===9?i:i.ownerDocument,e===`http://www.w3.org/1999/xhtml`&&(e=De(n)),e===`http://www.w3.org/1999/xhtml`?n===`script`?(e=c.createElement(`div`),e.innerHTML=`<script><\/script>`,e=e.removeChild(e.firstChild)):typeof r.is==`string`?e=c.createElement(n,{is:r.is}):(e=c.createElement(n),n===`select`&&(c=e,r.multiple?c.multiple=!0:r.size&&(c.size=r.size))):e=c.createElementNS(e,n),e[ji]=t,e[Mi]=r,ic(e,t,!1,!1),t.stateNode=e;a:{switch(c=Pe(n,r),n){case`dialog`:W(`cancel`,e),W(`close`,e),i=r;break;case`iframe`:case`object`:case`embed`:W(`load`,e),i=r;break;case`video`:case`audio`:for(i=0;i<ti.length;i++)W(ti[i],e);i=r;break;case`source`:W(`error`,e),i=r;break;case`img`:case`image`:case`link`:W(`error`,e),W(`load`,e),i=r;break;case`details`:W(`toggle`,e),i=r;break;case`input`:ve(e,r),i=_e(e,r),W(`invalid`,e);break;case`option`:i=r;break;case`select`:e._wrapperState={wasMultiple:!!r.multiple},i=N({},r,{value:void 0}),W(`invalid`,e);break;case`textarea`:we(e,r),i=Ce(e,r),W(`invalid`,e);break;default:i=r}for(o in Ne(n,i),l=i,l)if(l.hasOwnProperty(o)){var u=l[o];o===`style`?je(e,u):o===`dangerouslySetInnerHTML`?(u=u?u.__html:void 0,u!=null&&z(e,u)):o===`children`?typeof u==`string`?(n!==`textarea`||u!==``)&&B(e,u):typeof u==`number`&&B(e,``+u):o!==`suppressContentEditableWarning`&&o!==`suppressHydrationWarning`&&o!==`autoFocus`&&(s.hasOwnProperty(o)?u!=null&&o===`onScroll`&&W(`scroll`,e):u!=null&&S(e,o,u,c))}switch(n){case`input`:me(e),xe(e,r,!1);break;case`textarea`:me(e),Ee(e);break;case`option`:r.value!=null&&e.setAttribute(`value`,``+P(r.value));break;case`select`:e.multiple=!!r.multiple,o=r.value,o==null?r.defaultValue!=null&&L(e,!!r.multiple,r.defaultValue,!0):L(e,!!r.multiple,o,!1);break;default:typeof i.onClick==`function`&&(e.onclick=vi)}switch(n){case`button`:case`input`:case`select`:case`textarea`:r=!!r.autoFocus;break a;case`img`:r=!0;break a;default:r=!1}}r&&(t.flags|=4)}t.ref!==null&&(t.flags|=512,t.flags|=2097152)}return cc(t),null;case 6:if(e&&t.stateNode!=null)oc(e,t,e.memoizedProps,r);else{if(typeof r!=`string`&&t.stateNode===null)throw Error(a(166));if(n=yo(vo.current),yo(go.current),Da(t)){if(r=t.stateNode,n=t.memoizedProps,r[ji]=t,(o=r.nodeValue!==n)&&(e=va,e!==null))switch(e.tag){case 3:_i(r.nodeValue,n,!!(e.mode&1));break;case 5:!0!==e.memoizedProps.suppressHydrationWarning&&_i(r.nodeValue,n,!!(e.mode&1))}o&&(t.flags|=4)}else r=(n.nodeType===9?n:n.ownerDocument).createTextNode(r),r[ji]=t,t.stateNode=r}return cc(t),null;case 13:if(Hi(wo),r=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(ba&&ya!==null&&t.mode&1&&!(t.flags&128))Oa(),ka(),t.flags|=98560,o=!1;else if(o=Da(t),r!==null&&r.dehydrated!==null){if(e===null){if(!o)throw Error(a(318));if(o=t.memoizedState,o=o===null?null:o.dehydrated,!o)throw Error(a(317));o[ji]=t}else ka(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;cc(t),o=!1}else xa!==null&&(bl(xa),xa=null),o=!0;if(!o)return t.flags&65536?t:null}return t.flags&128?(t.lanes=n,t):(r=r!==null,r!==(e!==null&&e.memoizedState!==null)&&r&&(t.child.flags|=8192,t.mode&1&&(e===null||wo.current&1?Jc===0&&(Jc=3):Al())),t.updateQueue!==null&&(t.flags|=4),cc(t),null);case 4:return xo(),e===null&&si(t.stateNode.containerInfo),cc(t),null;case 10:return Ra(t.type._context),cc(t),null;case 17:return Ji(t.type)&&Yi(),cc(t),null;case 19:if(Hi(wo),o=t.memoizedState,o===null)return cc(t),null;if(r=!!(t.flags&128),c=o.rendering,c===null){if(r)sc(o,!1);else{if(Jc!==0||e!==null&&e.flags&128)for(e=t.child;e!==null;){if(c=To(e),c!==null){for(t.flags|=128,sc(o,!1),r=c.updateQueue,r!==null&&(t.updateQueue=r,t.flags|=4),t.subtreeFlags=0,r=n,n=t.child;n!==null;)o=n,e=r,o.flags&=14680066,c=o.alternate,c===null?(o.childLanes=0,o.lanes=e,o.child=null,o.subtreeFlags=0,o.memoizedProps=null,o.memoizedState=null,o.updateQueue=null,o.dependencies=null,o.stateNode=null):(o.childLanes=c.childLanes,o.lanes=c.lanes,o.child=c.child,o.subtreeFlags=0,o.deletions=null,o.memoizedProps=c.memoizedProps,o.memoizedState=c.memoizedState,o.updateQueue=c.updateQueue,o.type=c.type,e=c.dependencies,o.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),n=n.sibling;return q(wo,wo.current&1|2),t.child}e=e.sibling}o.tail!==null&&H()>nl&&(t.flags|=128,r=!0,sc(o,!1),t.lanes=4194304)}}else{if(!r){if(e=To(c),e!==null){if(t.flags|=128,r=!0,n=e.updateQueue,n!==null&&(t.updateQueue=n,t.flags|=4),sc(o,!0),o.tail===null&&o.tailMode===`hidden`&&!c.alternate&&!ba)return cc(t),null}else 2*H()-o.renderingStartTime>nl&&n!==1073741824&&(t.flags|=128,r=!0,sc(o,!1),t.lanes=4194304)}o.isBackwards?(c.sibling=t.child,t.child=c):(n=o.last,n===null?t.child=c:n.sibling=c,o.last=c)}return o.tail===null?(cc(t),null):(t=o.tail,o.rendering=t,o.tail=t.sibling,o.renderingStartTime=H(),t.sibling=null,n=wo.current,q(wo,r?n&1|2:n&1),t);case 22:case 23:return El(),r=t.memoizedState!==null,e!==null&&e.memoizedState!==null!==r&&(t.flags|=8192),r&&t.mode&1?Kc&1073741824&&(cc(t),t.subtreeFlags&6&&(t.flags|=8192)):cc(t),null;case 24:return null;case 25:return null}throw Error(a(156,t.tag))}function uc(e,t){switch(_a(t),t.tag){case 1:return Ji(t.type)&&Yi(),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return xo(),Hi(Gi),Hi(Wi),Do(),e=t.flags,e&65536&&!(e&128)?(t.flags=e&-65537|128,t):null;case 5:return Co(t),null;case 13:if(Hi(wo),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(a(340));ka()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return Hi(wo),null;case 4:return xo(),null;case 10:return Ra(t.type._context),null;case 22:case 23:return El(),null;case 24:return null;default:return null}}var dc=!1,fc=!1,pc=typeof WeakSet==`function`?WeakSet:Set,Z=null;function mc(e,t){var n=e.ref;if(n!==null){if(typeof n==`function`)try{n(null)}catch(n){Bl(e,t,n)}else n.current=null}}function hc(e,t,n){try{n()}catch(n){Bl(e,t,n)}}var gc=!1;function _c(e,t){if(yi=dn,e=Mr(),Nr(e)){if(`selectionStart`in e)var n={start:e.selectionStart,end:e.selectionEnd};else a:{n=(n=e.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var i=r.anchorOffset,o=r.focusNode;r=r.focusOffset;try{n.nodeType,o.nodeType}catch{n=null;break a}var s=0,c=-1,l=-1,u=0,d=0,f=e,p=null;b:for(;;){for(var m;f!==n||i!==0&&f.nodeType!==3||(c=s+i),f!==o||r!==0&&f.nodeType!==3||(l=s+r),f.nodeType===3&&(s+=f.nodeValue.length),(m=f.firstChild)!==null;)p=f,f=m;for(;;){if(f===e)break b;if(p===n&&++u===i&&(c=s),p===o&&++d===r&&(l=s),(m=f.nextSibling)!==null)break;f=p,p=f.parentNode}f=m}n=c===-1||l===-1?null:{start:c,end:l}}else n=null}n||={start:0,end:0}}else n=null;for(bi={focusedElem:e,selectionRange:n},dn=!1,Z=t;Z!==null;)if(t=Z,e=t.child,t.subtreeFlags&1028&&e!==null)e.return=t,Z=e;else for(;Z!==null;){t=Z;try{var h=t.alternate;if(t.flags&1024)switch(t.tag){case 0:case 11:case 15:break;case 1:if(h!==null){var g=h.memoizedProps,_=h.memoizedState,v=t.stateNode;v.__reactInternalSnapshotBeforeUpdate=v.getSnapshotBeforeUpdate(t.elementType===t.type?g:Ma(t.type,g),_)}break;case 3:var y=t.stateNode.containerInfo;y.nodeType===1?y.textContent=``:y.nodeType===9&&y.documentElement&&y.removeChild(y.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(a(163))}}catch(e){Bl(t,t.return,e)}if(e=t.sibling,e!==null){e.return=t.return,Z=e;break}Z=t.return}return h=gc,gc=!1,h}function vc(e,t,n){var r=t.updateQueue;if(r=r===null?null:r.lastEffect,r!==null){var i=r=r.next;do{if((i.tag&e)===e){var a=i.destroy;i.destroy=void 0,a!==void 0&&hc(t,n,a)}i=i.next}while(i!==r)}}function yc(e,t){if(t=t.updateQueue,t=t===null?null:t.lastEffect,t!==null){var n=t=t.next;do{if((n.tag&e)===e){var r=n.create;n.destroy=r()}n=n.next}while(n!==t)}}function bc(e){var t=e.ref;if(t!==null){var n=e.stateNode;switch(e.tag){case 5:e=n;break;default:e=n}typeof t==`function`?t(e):t.current=e}}function xc(e){var t=e.alternate;t!==null&&(e.alternate=null,xc(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&(delete t[ji],delete t[Mi],delete t[Pi],delete t[Fi],delete t[Ii])),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}function Sc(e){return e.tag===5||e.tag===3||e.tag===4}function Cc(e){a:for(;;){for(;e.sibling===null;){if(e.return===null||Sc(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.flags&2||e.child===null||e.tag===4)continue a;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function wc(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.nodeType===8?n.parentNode.insertBefore(e,t):n.insertBefore(e,t):(n.nodeType===8?(t=n.parentNode,t.insertBefore(e,n)):(t=n,t.appendChild(e)),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=vi));else if(r!==4&&(e=e.child,e!==null))for(wc(e,t,n),e=e.sibling;e!==null;)wc(e,t,n),e=e.sibling}function Tc(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(r!==4&&(e=e.child,e!==null))for(Tc(e,t,n),e=e.sibling;e!==null;)Tc(e,t,n),e=e.sibling}var Ec=null,Dc=!1;function Oc(e,t,n){for(n=n.child;n!==null;)kc(e,t,n),n=n.sibling}function kc(e,t,n){if(xt&&typeof xt.onCommitFiberUnmount==`function`)try{xt.onCommitFiberUnmount(bt,n)}catch{}switch(n.tag){case 5:fc||mc(n,t);case 6:var r=Ec,i=Dc;Ec=null,Oc(e,t,n),Ec=r,Dc=i,Ec!==null&&(Dc?(e=Ec,n=n.stateNode,e.nodeType===8?e.parentNode.removeChild(n):e.removeChild(n)):Ec.removeChild(n.stateNode));break;case 18:Ec!==null&&(Dc?(e=Ec,n=n.stateNode,e.nodeType===8?Di(e.parentNode,n):e.nodeType===1&&Di(e,n),ln(e)):Di(Ec,n.stateNode));break;case 4:r=Ec,i=Dc,Ec=n.stateNode.containerInfo,Dc=!0,Oc(e,t,n),Ec=r,Dc=i;break;case 0:case 11:case 14:case 15:if(!fc&&(r=n.updateQueue,r!==null&&(r=r.lastEffect,r!==null))){i=r=r.next;do{var a=i,o=a.destroy;a=a.tag,o!==void 0&&(a&2||a&4)&&hc(n,t,o),i=i.next}while(i!==r)}Oc(e,t,n);break;case 1:if(!fc&&(mc(n,t),r=n.stateNode,typeof r.componentWillUnmount==`function`))try{r.props=n.memoizedProps,r.state=n.memoizedState,r.componentWillUnmount()}catch(e){Bl(n,t,e)}Oc(e,t,n);break;case 21:Oc(e,t,n);break;case 22:n.mode&1?(fc=(r=fc)||n.memoizedState!==null,Oc(e,t,n),fc=r):Oc(e,t,n);break;default:Oc(e,t,n)}}function Ac(e){var t=e.updateQueue;if(t!==null){e.updateQueue=null;var n=e.stateNode;n===null&&(n=e.stateNode=new pc),t.forEach(function(t){var r=Wl.bind(null,e,t);n.has(t)||(n.add(t),t.then(r,r))})}}function jc(e,t){var n=t.deletions;if(n!==null)for(var r=0;r<n.length;r++){var i=n[r];try{var o=e,s=t,c=s;a:for(;c!==null;){switch(c.tag){case 5:Ec=c.stateNode,Dc=!1;break a;case 3:Ec=c.stateNode.containerInfo,Dc=!0;break a;case 4:Ec=c.stateNode.containerInfo,Dc=!0;break a}c=c.return}if(Ec===null)throw Error(a(160));kc(o,s,i),Ec=null,Dc=!1;var l=i.alternate;l!==null&&(l.return=null),i.return=null}catch(e){Bl(i,t,e)}}if(t.subtreeFlags&12854)for(t=t.child;t!==null;)Mc(t,e),t=t.sibling}function Mc(e,t){var n=e.alternate,r=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(jc(t,e),Nc(e),r&4){try{vc(3,e,e.return),yc(3,e)}catch(t){Bl(e,e.return,t)}try{vc(5,e,e.return)}catch(t){Bl(e,e.return,t)}}break;case 1:jc(t,e),Nc(e),r&512&&n!==null&&mc(n,n.return);break;case 5:if(jc(t,e),Nc(e),r&512&&n!==null&&mc(n,n.return),e.flags&32){var i=e.stateNode;try{B(i,``)}catch(t){Bl(e,e.return,t)}}if(r&4&&(i=e.stateNode,i!=null)){var o=e.memoizedProps,s=n===null?o:n.memoizedProps,c=e.type,l=e.updateQueue;if(e.updateQueue=null,l!==null)try{c===`input`&&o.type===`radio`&&o.name!=null&&ye(i,o),Pe(c,s);var u=Pe(c,o);for(s=0;s<l.length;s+=2){var d=l[s],f=l[s+1];d===`style`?je(i,f):d===`dangerouslySetInnerHTML`?z(i,f):d===`children`?B(i,f):S(i,d,f,u)}switch(c){case`input`:be(i,o);break;case`textarea`:Te(i,o);break;case`select`:var p=i._wrapperState.wasMultiple;i._wrapperState.wasMultiple=!!o.multiple;var m=o.value;m==null?p!==!!o.multiple&&(o.defaultValue==null?L(i,!!o.multiple,o.multiple?[]:``,!1):L(i,!!o.multiple,o.defaultValue,!0)):L(i,!!o.multiple,m,!1)}i[Mi]=o}catch(t){Bl(e,e.return,t)}}break;case 6:if(jc(t,e),Nc(e),r&4){if(e.stateNode===null)throw Error(a(162));i=e.stateNode,o=e.memoizedProps;try{i.nodeValue=o}catch(t){Bl(e,e.return,t)}}break;case 3:if(jc(t,e),Nc(e),r&4&&n!==null&&n.memoizedState.isDehydrated)try{ln(t.containerInfo)}catch(t){Bl(e,e.return,t)}break;case 4:jc(t,e),Nc(e);break;case 13:jc(t,e),Nc(e),i=e.child,i.flags&8192&&(o=i.memoizedState!==null,i.stateNode.isHidden=o,!o||i.alternate!==null&&i.alternate.memoizedState!==null||(tl=H())),r&4&&Ac(e);break;case 22:if(d=n!==null&&n.memoizedState!==null,e.mode&1?(fc=(u=fc)||d,jc(t,e),fc=u):jc(t,e),Nc(e),r&8192){if(u=e.memoizedState!==null,(e.stateNode.isHidden=u)&&!d&&e.mode&1)for(Z=e,d=e.child;d!==null;){for(f=Z=d;Z!==null;){switch(p=Z,m=p.child,p.tag){case 0:case 11:case 14:case 15:vc(4,p,p.return);break;case 1:mc(p,p.return);var h=p.stateNode;if(typeof h.componentWillUnmount==`function`){r=p,n=p.return;try{t=r,h.props=t.memoizedProps,h.state=t.memoizedState,h.componentWillUnmount()}catch(e){Bl(r,n,e)}}break;case 5:mc(p,p.return);break;case 22:if(p.memoizedState!==null){Lc(f);continue}}m===null?Lc(f):(m.return=p,Z=m)}d=d.sibling}a:for(d=null,f=e;;){if(f.tag===5){if(d===null){d=f;try{i=f.stateNode,u?(o=i.style,typeof o.setProperty==`function`?o.setProperty(`display`,`none`,`important`):o.display=`none`):(c=f.stateNode,l=f.memoizedProps.style,s=l!=null&&l.hasOwnProperty(`display`)?l.display:null,c.style.display=Ae(`display`,s))}catch(t){Bl(e,e.return,t)}}}else if(f.tag===6){if(d===null)try{f.stateNode.nodeValue=u?``:f.memoizedProps}catch(t){Bl(e,e.return,t)}}else if((f.tag!==22&&f.tag!==23||f.memoizedState===null||f===e)&&f.child!==null){f.child.return=f,f=f.child;continue}if(f===e)break a;for(;f.sibling===null;){if(f.return===null||f.return===e)break a;d===f&&(d=null),f=f.return}d===f&&(d=null),f.sibling.return=f.return,f=f.sibling}}break;case 19:jc(t,e),Nc(e),r&4&&Ac(e);break;case 21:break;default:jc(t,e),Nc(e)}}function Nc(e){var t=e.flags;if(t&2){try{a:{for(var n=e.return;n!==null;){if(Sc(n)){var r=n;break a}n=n.return}throw Error(a(160))}switch(r.tag){case 5:var i=r.stateNode;r.flags&32&&(B(i,``),r.flags&=-33),Tc(e,Cc(e),i);break;case 3:case 4:var o=r.stateNode.containerInfo;wc(e,Cc(e),o);break;default:throw Error(a(161))}}catch(t){Bl(e,e.return,t)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function Pc(e,t,n){Z=e,Fc(e,t,n)}function Fc(e,t,n){for(var r=!!(e.mode&1);Z!==null;){var i=Z,a=i.child;if(i.tag===22&&r){var o=i.memoizedState!==null||dc;if(!o){var s=i.alternate,c=s!==null&&s.memoizedState!==null||fc;s=dc;var l=fc;if(dc=o,(fc=c)&&!l)for(Z=i;Z!==null;)o=Z,c=o.child,o.tag===22&&o.memoizedState!==null||c===null?Rc(i):(c.return=o,Z=c);for(;a!==null;)Z=a,Fc(a,t,n),a=a.sibling;Z=i,dc=s,fc=l}Ic(e,t,n)}else i.subtreeFlags&8772&&a!==null?(a.return=i,Z=a):Ic(e,t,n)}}function Ic(e){for(;Z!==null;){var t=Z;if(t.flags&8772){var n=t.alternate;try{if(t.flags&8772)switch(t.tag){case 0:case 11:case 15:fc||yc(5,t);break;case 1:var r=t.stateNode;if(t.flags&4&&!fc){if(n===null)r.componentDidMount();else{var i=t.elementType===t.type?n.memoizedProps:Ma(t.type,n.memoizedProps);r.componentDidUpdate(i,n.memoizedState,r.__reactInternalSnapshotBeforeUpdate)}}var o=t.updateQueue;o!==null&&eo(t,o,r);break;case 3:var s=t.updateQueue;if(s!==null){if(n=null,t.child!==null)switch(t.child.tag){case 5:n=t.child.stateNode;break;case 1:n=t.child.stateNode}eo(t,s,n)}break;case 5:var c=t.stateNode;if(n===null&&t.flags&4){n=c;var l=t.memoizedProps;switch(t.type){case`button`:case`input`:case`select`:case`textarea`:l.autoFocus&&n.focus();break;case`img`:l.src&&(n.src=l.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(t.memoizedState===null){var u=t.alternate;if(u!==null){var d=u.memoizedState;if(d!==null){var f=d.dehydrated;f!==null&&ln(f)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(a(163))}fc||t.flags&512&&bc(t)}catch(e){Bl(t,t.return,e)}}if(t===e){Z=null;break}if(n=t.sibling,n!==null){n.return=t.return,Z=n;break}Z=t.return}}function Lc(e){for(;Z!==null;){var t=Z;if(t===e){Z=null;break}var n=t.sibling;if(n!==null){n.return=t.return,Z=n;break}Z=t.return}}function Rc(e){for(;Z!==null;){var t=Z;try{switch(t.tag){case 0:case 11:case 15:var n=t.return;try{yc(4,t)}catch(e){Bl(t,n,e)}break;case 1:var r=t.stateNode;if(typeof r.componentDidMount==`function`){var i=t.return;try{r.componentDidMount()}catch(e){Bl(t,i,e)}}var a=t.return;try{bc(t)}catch(e){Bl(t,a,e)}break;case 5:var o=t.return;try{bc(t)}catch(e){Bl(t,o,e)}}}catch(e){Bl(t,t.return,e)}if(t===e){Z=null;break}var s=t.sibling;if(s!==null){s.return=t.return,Z=s;break}Z=t.return}}var zc=Math.ceil,Bc=C.ReactCurrentDispatcher,Vc=C.ReactCurrentOwner,Hc=C.ReactCurrentBatchConfig,Q=0,Uc=null,Wc=null,Gc=0,Kc=0,qc=K(0),Jc=0,Yc=null,Xc=0,Zc=0,Qc=0,$c=null,el=null,tl=0,nl=1/0,rl=null,il=!1,al=null,ol=null,sl=!1,cl=null,ll=0,ul=0,dl=null,fl=-1,pl=0;function ml(){return Q&6?H():fl===-1?fl=H():fl}function hl(e){return e.mode&1?Q&2&&Gc!==0?Gc&-Gc:ja.transition===null?(e=U,e===0?(e=window.event,e=e===void 0?16:_n(e.type),e):e):(pl===0&&(pl=Pt()),pl):1}function gl(e,t,n,r){if(50<ul)throw ul=0,dl=null,Error(a(185));It(e,n,r),(!(Q&2)||e!==Uc)&&(e===Uc&&(!(Q&2)&&(Zc|=n),Jc===4&&Sl(e,Gc)),_l(e,r),n===1&&Q===0&&!(t.mode&1)&&(nl=H()+500,ta&&aa()))}function _l(e,t){var n=e.callbackNode;Mt(e,t);var r=At(e,e===Uc?Gc:0);if(r===0)n!==null&&dt(n),e.callbackNode=null,e.callbackPriority=0;else if(t=r&-r,e.callbackPriority!==t){if(n!=null&&dt(n),t===1)e.tag===0?ia(Cl.bind(null,e)):ra(Cl.bind(null,e)),Ti(function(){!(Q&6)&&aa()}),n=null;else{switch(zt(r)){case 1:n=ht;break;case 4:n=gt;break;case 16:n=_t;break;case 536870912:n=yt;break;default:n=_t}n=Kl(n,vl.bind(null,e))}e.callbackPriority=t,e.callbackNode=n}}function vl(e,t){if(fl=-1,pl=0,Q&6)throw Error(a(327));var n=e.callbackNode;if(Rl()&&e.callbackNode!==n)return null;var r=At(e,e===Uc?Gc:0);if(r===0)return null;if(r&30||(r&e.expiredLanes)!==0||t)t=jl(e,r);else{t=r;var i=Q;Q|=2;var o=kl();(Uc!==e||Gc!==t)&&(rl=null,nl=H()+500,Dl(e,t));do try{Nl();break}catch(t){Ol(e,t)}while(1);La(),Bc.current=o,Q=i,Wc===null?(Uc=null,Gc=0,t=Jc):t=0}if(t!==0){if(t===2&&(i=Nt(e),i!==0&&(r=i,t=yl(e,i))),t===1)throw n=Yc,Dl(e,0),Sl(e,r),_l(e,H()),n;if(t===6)Sl(e,r);else{if(i=e.current.alternate,!(r&30)&&!xl(i)&&(t=jl(e,r),t===2&&(o=Nt(e),o!==0&&(r=o,t=yl(e,o))),t===1))throw n=Yc,Dl(e,0),Sl(e,r),_l(e,H()),n;switch(e.finishedWork=i,e.finishedLanes=r,t){case 0:case 1:throw Error(a(345));case 2:Il(e,el,rl);break;case 3:if(Sl(e,r),(r&130023424)===r&&(t=tl+500-H(),10<t)){if(At(e,0)!==0)break;if(i=e.suspendedLanes,(i&r)!==r){ml(),e.pingedLanes|=e.suspendedLanes&i;break}e.timeoutHandle=Si(Il.bind(null,e,el,rl),t);break}Il(e,el,rl);break;case 4:if(Sl(e,r),(r&4194240)===r)break;for(t=e.eventTimes,i=-1;0<r;){var s=31-Ct(r);o=1<<s,s=t[s],s>i&&(i=s),r&=~o}if(r=i,r=H()-r,r=(120>r?120:480>r?480:1080>r?1080:1920>r?1920:3e3>r?3e3:4320>r?4320:1960*zc(r/1960))-r,10<r){e.timeoutHandle=Si(Il.bind(null,e,el,rl),r);break}Il(e,el,rl);break;case 5:Il(e,el,rl);break;default:throw Error(a(329))}}}return _l(e,H()),e.callbackNode===n?vl.bind(null,e):null}function yl(e,t){var n=$c;return e.current.memoizedState.isDehydrated&&(Dl(e,t).flags|=256),e=jl(e,t),e!==2&&(t=el,el=n,t!==null&&bl(t)),e}function bl(e){el===null?el=e:el.push.apply(el,e)}function xl(e){for(var t=e;;){if(t.flags&16384){var n=t.updateQueue;if(n!==null&&(n=n.stores,n!==null))for(var r=0;r<n.length;r++){var i=n[r],a=i.getSnapshot;i=i.value;try{if(!Dr(a(),i))return!1}catch{return!1}}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function Sl(e,t){for(t&=~Qc,t&=~Zc,e.suspendedLanes|=t,e.pingedLanes&=~t,e=e.expirationTimes;0<t;){var n=31-Ct(t),r=1<<n;e[n]=-1,t&=~r}}function Cl(e){if(Q&6)throw Error(a(327));Rl();var t=At(e,0);if(!(t&1))return _l(e,H()),null;var n=jl(e,t);if(e.tag!==0&&n===2){var r=Nt(e);r!==0&&(t=r,n=yl(e,r))}if(n===1)throw n=Yc,Dl(e,0),Sl(e,t),_l(e,H()),n;if(n===6)throw Error(a(345));return e.finishedWork=e.current.alternate,e.finishedLanes=t,Il(e,el,rl),_l(e,H()),null}function wl(e,t){var n=Q;Q|=1;try{return e(t)}finally{Q=n,Q===0&&(nl=H()+500,ta&&aa())}}function Tl(e){cl!==null&&cl.tag===0&&!(Q&6)&&Rl();var t=Q;Q|=1;var n=Hc.transition,r=U;try{if(Hc.transition=null,U=1,e)return e()}finally{U=r,Hc.transition=n,Q=t,!(Q&6)&&aa()}}function El(){Kc=qc.current,Hi(qc)}function Dl(e,t){e.finishedWork=null,e.finishedLanes=0;var n=e.timeoutHandle;if(n!==-1&&(e.timeoutHandle=-1,Ci(n)),Wc!==null)for(n=Wc.return;n!==null;){var r=n;switch(_a(r),r.tag){case 1:r=r.type.childContextTypes,r!=null&&Yi();break;case 3:xo(),Hi(Gi),Hi(Wi),Do();break;case 5:Co(r);break;case 4:xo();break;case 13:Hi(wo);break;case 19:Hi(wo);break;case 10:Ra(r.type._context);break;case 22:case 23:El()}n=n.return}if(Uc=e,Wc=e=Zl(e.current,null),Gc=Kc=t,Jc=0,Yc=null,Qc=Zc=Xc=0,el=$c=null,Ha!==null){for(t=0;t<Ha.length;t++)if(n=Ha[t],r=n.interleaved,r!==null){n.interleaved=null;var i=r.next,a=n.pending;if(a!==null){var o=a.next;a.next=i,r.next=o}n.pending=r}Ha=null}return e}function Ol(e,t){do{var n=Wc;try{if(La(),Oo.current=bs,No){for(var r=Y.memoizedState;r!==null;){var i=r.queue;i!==null&&(i.pending=null),r=r.next}No=!1}if(Ao=0,Mo=jo=Y=null,Po=!1,Fo=0,Vc.current=null,n===null||n.return===null){Jc=1,Yc=t,Wc=null;break}a:{var o=e,s=n.return,c=n,l=t;if(t=Gc,c.flags|=32768,typeof l==`object`&&l&&typeof l.then==`function`){var u=l,d=c,f=d.tag;if(!(d.mode&1)&&(f===0||f===11||f===15)){var p=d.alternate;p?(d.updateQueue=p.updateQueue,d.memoizedState=p.memoizedState,d.lanes=p.lanes):(d.updateQueue=null,d.memoizedState=null)}var m=js(s);if(m!==null){m.flags&=-257,Ms(m,s,c,o,t),m.mode&1&&As(o,u,t),t=m,l=u;var h=t.updateQueue;if(h===null){var g=new Set;g.add(l),t.updateQueue=g}else h.add(l);break a}if(!(t&1)){As(o,u,t),Al();break a}l=Error(a(426))}else if(ba&&c.mode&1){var _=js(s);if(_!==null){!(_.flags&65536)&&(_.flags|=256),Ms(_,s,c,o,t),Aa(ws(l,c));break a}}o=l=ws(l,c),Jc!==4&&(Jc=2),$c===null?$c=[o]:$c.push(o),o=s;do{switch(o.tag){case 3:o.flags|=65536,t&=-t,o.lanes|=t;var v=Os(o,l,t);Qa(o,v);break a;case 1:c=l;var y=o.type,b=o.stateNode;if(!(o.flags&128)&&(typeof y.getDerivedStateFromError==`function`||b!==null&&typeof b.componentDidCatch==`function`&&(ol===null||!ol.has(b)))){o.flags|=65536,t&=-t,o.lanes|=t;var x=ks(o,c,t);Qa(o,x);break a}}o=o.return}while(o!==null)}Fl(n)}catch(e){t=e,Wc===n&&n!==null&&(Wc=n=n.return);continue}break}while(1)}function kl(){var e=Bc.current;return Bc.current=bs,e===null?bs:e}function Al(){(Jc===0||Jc===3||Jc===2)&&(Jc=4),Uc===null||!(Xc&268435455)&&!(Zc&268435455)||Sl(Uc,Gc)}function jl(e,t){var n=Q;Q|=2;var r=kl();(Uc!==e||Gc!==t)&&(rl=null,Dl(e,t));do try{Ml();break}catch(t){Ol(e,t)}while(1);if(La(),Q=n,Bc.current=r,Wc!==null)throw Error(a(261));return Uc=null,Gc=0,Jc}function Ml(){for(;Wc!==null;)Pl(Wc)}function Nl(){for(;Wc!==null&&!ft();)Pl(Wc)}function Pl(e){var t=Gl(e.alternate,e,Kc);e.memoizedProps=e.pendingProps,t===null?Fl(e):Wc=t,Vc.current=null}function Fl(e){var t=e;do{var n=t.alternate;if(e=t.return,t.flags&32768){if(n=uc(n,t),n!==null){n.flags&=32767,Wc=n;return}if(e!==null)e.flags|=32768,e.subtreeFlags=0,e.deletions=null;else{Jc=6,Wc=null;return}}else if(n=lc(n,t,Kc),n!==null){Wc=n;return}if(t=t.sibling,t!==null){Wc=t;return}Wc=t=e}while(t!==null);Jc===0&&(Jc=5)}function Il(e,t,n){var r=U,i=Hc.transition;try{Hc.transition=null,U=1,Ll(e,t,n,r)}finally{Hc.transition=i,U=r}return null}function Ll(e,t,n,r){do Rl();while(cl!==null);if(Q&6)throw Error(a(327));n=e.finishedWork;var i=e.finishedLanes;if(n===null)return null;if(e.finishedWork=null,e.finishedLanes=0,n===e.current)throw Error(a(177));e.callbackNode=null,e.callbackPriority=0;var o=n.lanes|n.childLanes;if(Lt(e,o),e===Uc&&(Wc=Uc=null,Gc=0),!(n.subtreeFlags&2064)&&!(n.flags&2064)||sl||(sl=!0,Kl(_t,function(){return Rl(),null})),o=!!(n.flags&15990),n.subtreeFlags&15990||o){o=Hc.transition,Hc.transition=null;var s=U;U=1;var c=Q;Q|=4,Vc.current=null,_c(e,n),Mc(n,e),Pr(bi),dn=!!yi,bi=yi=null,e.current=n,Pc(n,e,i),pt(),Q=c,U=s,Hc.transition=o}else e.current=n;if(sl&&(sl=!1,cl=e,ll=i),o=e.pendingLanes,o===0&&(ol=null),St(n.stateNode,r),_l(e,H()),t!==null)for(r=e.onRecoverableError,n=0;n<t.length;n++)i=t[n],r(i.value,{componentStack:i.stack,digest:i.digest});if(il)throw il=!1,e=al,al=null,e;return ll&1&&e.tag!==0&&Rl(),o=e.pendingLanes,o&1?e===dl?ul++:(ul=0,dl=e):ul=0,aa(),null}function Rl(){if(cl!==null){var e=zt(ll),t=Hc.transition,n=U;try{if(Hc.transition=null,U=16>e?16:e,cl===null)var r=!1;else{if(e=cl,cl=null,ll=0,Q&6)throw Error(a(331));var i=Q;for(Q|=4,Z=e.current;Z!==null;){var o=Z,s=o.child;if(Z.flags&16){var c=o.deletions;if(c!==null){for(var l=0;l<c.length;l++){var u=c[l];for(Z=u;Z!==null;){var d=Z;switch(d.tag){case 0:case 11:case 15:vc(8,d,o)}var f=d.child;if(f!==null)f.return=d,Z=f;else for(;Z!==null;){d=Z;var p=d.sibling,m=d.return;if(xc(d),d===u){Z=null;break}if(p!==null){p.return=m,Z=p;break}Z=m}}}var h=o.alternate;if(h!==null){var g=h.child;if(g!==null){h.child=null;do{var _=g.sibling;g.sibling=null,g=_}while(g!==null)}}Z=o}}if(o.subtreeFlags&2064&&s!==null)s.return=o,Z=s;else b:for(;Z!==null;){if(o=Z,o.flags&2048)switch(o.tag){case 0:case 11:case 15:vc(9,o,o.return)}var v=o.sibling;if(v!==null){v.return=o.return,Z=v;break b}Z=o.return}}var y=e.current;for(Z=y;Z!==null;){s=Z;var b=s.child;if(s.subtreeFlags&2064&&b!==null)b.return=s,Z=b;else b:for(s=y;Z!==null;){if(c=Z,c.flags&2048)try{switch(c.tag){case 0:case 11:case 15:yc(9,c)}}catch(e){Bl(c,c.return,e)}if(c===s){Z=null;break b}var x=c.sibling;if(x!==null){x.return=c.return,Z=x;break b}Z=c.return}}if(Q=i,aa(),xt&&typeof xt.onPostCommitFiberRoot==`function`)try{xt.onPostCommitFiberRoot(bt,e)}catch{}r=!0}return r}finally{U=n,Hc.transition=t}}return!1}function zl(e,t,n){t=ws(n,t),t=Os(e,t,1),e=Xa(e,t,1),t=ml(),e!==null&&(It(e,1,t),_l(e,t))}function Bl(e,t,n){if(e.tag===3)zl(e,e,n);else for(;t!==null;){if(t.tag===3){zl(t,e,n);break}if(t.tag===1){var r=t.stateNode;if(typeof t.type.getDerivedStateFromError==`function`||typeof r.componentDidCatch==`function`&&(ol===null||!ol.has(r))){e=ws(n,e),e=ks(t,e,1),t=Xa(t,e,1),e=ml(),t!==null&&(It(t,1,e),_l(t,e));break}}t=t.return}}function Vl(e,t,n){var r=e.pingCache;r!==null&&r.delete(t),t=ml(),e.pingedLanes|=e.suspendedLanes&n,Uc===e&&(Gc&n)===n&&(Jc===4||Jc===3&&(Gc&130023424)===Gc&&500>H()-tl?Dl(e,0):Qc|=n),_l(e,t)}function Hl(e,t){t===0&&(e.mode&1?(t=Ot,Ot<<=1,!(Ot&130023424)&&(Ot=4194304)):t=1);var n=ml();e=Ga(e,t),e!==null&&(It(e,t,n),_l(e,n))}function Ul(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),Hl(e,n)}function Wl(e,t){var n=0;switch(e.tag){case 13:var r=e.stateNode,i=e.memoizedState;i!==null&&(n=i.retryLane);break;case 19:r=e.stateNode;break;default:throw Error(a(314))}r!==null&&r.delete(t),Hl(e,n)}var Gl=function(e,t,n){if(e!==null){if(e.memoizedProps!==t.pendingProps||Gi.current)Ps=!0;else{if((e.lanes&n)===0&&!(t.flags&128))return Ps=!1,rc(e,t,n);Ps=!!(e.flags&131072)}}else Ps=!1,ba&&t.flags&1048576&&ha(t,la,t.index);switch(t.lanes=0,t.tag){case 2:var r=t.type;tc(e,t),e=t.pendingProps;var i=qi(t,Wi.current);Ba(t,n),i=zo(null,t,r,e,i,n);var o=Bo();return t.flags|=1,typeof i==`object`&&i&&typeof i.render==`function`&&i.$$typeof===void 0?(t.tag=1,t.memoizedState=null,t.updateQueue=null,Ji(r)?(o=!0,Qi(t)):o=!1,t.memoizedState=i.state!==null&&i.state!==void 0?i.state:null,qa(t),i.updater=ro,t.stateNode=i,i._reactInternals=t,so(t,r,e,n),t=Us(null,t,r,!0,o,n)):(t.tag=0,ba&&o&&ga(t),Fs(null,t,i,n),t=t.child),t;case 16:r=t.elementType;a:{switch(tc(e,t),e=t.pendingProps,i=r._init,r=i(r._payload),t.type=r,i=t.tag=Xl(r),e=Ma(r,e),i){case 0:t=Vs(null,t,r,e,n);break a;case 1:t=Hs(null,t,r,e,n);break a;case 11:t=Is(null,t,r,e,n);break a;case 14:t=Ls(null,t,r,Ma(r.type,e),n);break a}throw Error(a(306,r,``))}return t;case 0:return r=t.type,i=t.pendingProps,i=t.elementType===r?i:Ma(r,i),Vs(e,t,r,i,n);case 1:return r=t.type,i=t.pendingProps,i=t.elementType===r?i:Ma(r,i),Hs(e,t,r,i,n);case 3:a:{if(Ws(t),e===null)throw Error(a(387));r=t.pendingProps,o=t.memoizedState,i=o.element,Ja(e,t),$a(t,r,null,n);var s=t.memoizedState;if(r=s.element,o.isDehydrated){if(o={element:r,isDehydrated:!1,cache:s.cache,pendingSuspenseBoundaries:s.pendingSuspenseBoundaries,transitions:s.transitions},t.updateQueue.baseState=o,t.memoizedState=o,t.flags&256){i=ws(Error(a(423)),t),t=Gs(e,t,r,n,i);break a}if(r!==i){i=ws(Error(a(424)),t),t=Gs(e,t,r,n,i);break a}for(ya=Oi(t.stateNode.containerInfo.firstChild),va=t,ba=!0,xa=null,n=mo(t,null,r,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling}else{if(ka(),r===i){t=nc(e,t,n);break a}Fs(e,t,r,n)}t=t.child}return t;case 5:return So(t),e===null&&Ta(t),r=t.type,i=t.pendingProps,o=e===null?null:e.memoizedProps,s=i.children,xi(r,i)?s=null:o!==null&&xi(r,o)&&(t.flags|=32),Bs(e,t),Fs(e,t,s,n),t.child;case 6:return e===null&&Ta(t),null;case 13:return Js(e,t,n);case 4:return bo(t,t.stateNode.containerInfo),r=t.pendingProps,e===null?t.child=po(t,null,r,n):Fs(e,t,r,n),t.child;case 11:return r=t.type,i=t.pendingProps,i=t.elementType===r?i:Ma(r,i),Is(e,t,r,i,n);case 7:return Fs(e,t,t.pendingProps,n),t.child;case 8:return Fs(e,t,t.pendingProps.children,n),t.child;case 12:return Fs(e,t,t.pendingProps.children,n),t.child;case 10:a:{if(r=t.type._context,i=t.pendingProps,o=t.memoizedProps,s=i.value,q(Na,r._currentValue),r._currentValue=s,o!==null){if(Dr(o.value,s)){if(o.children===i.children&&!Gi.current){t=nc(e,t,n);break a}}else for(o=t.child,o!==null&&(o.return=t);o!==null;){var c=o.dependencies;if(c!==null){s=o.child;for(var l=c.firstContext;l!==null;){if(l.context===r){if(o.tag===1){l=Ya(-1,n&-n),l.tag=2;var u=o.updateQueue;if(u!==null){u=u.shared;var d=u.pending;d===null?l.next=l:(l.next=d.next,d.next=l),u.pending=l}}o.lanes|=n,l=o.alternate,l!==null&&(l.lanes|=n),za(o.return,n,t),c.lanes|=n;break}l=l.next}}else if(o.tag===10)s=o.type===t.type?null:o.child;else if(o.tag===18){if(s=o.return,s===null)throw Error(a(341));s.lanes|=n,c=s.alternate,c!==null&&(c.lanes|=n),za(s,n,t),s=o.sibling}else s=o.child;if(s!==null)s.return=o;else for(s=o;s!==null;){if(s===t){s=null;break}if(o=s.sibling,o!==null){o.return=s.return,s=o;break}s=s.return}o=s}}Fs(e,t,i.children,n),t=t.child}return t;case 9:return i=t.type,r=t.pendingProps.children,Ba(t,n),i=Va(i),r=r(i),t.flags|=1,Fs(e,t,r,n),t.child;case 14:return r=t.type,i=Ma(r,t.pendingProps),i=Ma(r.type,i),Ls(e,t,r,i,n);case 15:return Rs(e,t,t.type,t.pendingProps,n);case 17:return r=t.type,i=t.pendingProps,i=t.elementType===r?i:Ma(r,i),tc(e,t),t.tag=1,Ji(r)?(e=!0,Qi(t)):e=!1,Ba(t,n),ao(t,r,i),so(t,r,i,n),Us(null,t,r,!0,e,n);case 19:return ec(e,t,n);case 22:return zs(e,t,n)}throw Error(a(156,t.tag))};function Kl(e,t){return ut(e,t)}function ql(e,t,n,r){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Jl(e,t,n,r){return new ql(e,t,n,r)}function Yl(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Xl(e){if(typeof e==`function`)return+!!Yl(e);if(e!=null){if(e=e.$$typeof,e===ne)return 11;if(e===A)return 14}return 2}function Zl(e,t){var n=e.alternate;return n===null?(n=Jl(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&14680064,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n}function Ql(e,t,n,r,i,o){var s=2;if(r=e,typeof e==`function`)Yl(e)&&(s=1);else if(typeof e==`string`)s=5;else a:switch(e){case ee:return $l(n.children,i,o,t);case te:s=8,i|=8;break;case E:return e=Jl(12,n,t,i|2),e.elementType=E,e.lanes=o,e;case k:return e=Jl(13,n,t,i),e.elementType=k,e.lanes=o,e;case re:return e=Jl(19,n,t,i),e.elementType=re,e.lanes=o,e;case ie:return eu(n,i,o,t);default:if(typeof e==`object`&&e)switch(e.$$typeof){case D:s=10;break a;case O:s=9;break a;case ne:s=11;break a;case A:s=14;break a;case j:s=16,r=null;break a}throw Error(a(130,e==null?e:typeof e,``))}return t=Jl(s,n,t,i),t.elementType=e,t.type=r,t.lanes=o,t}function $l(e,t,n,r){return e=Jl(7,e,r,t),e.lanes=n,e}function eu(e,t,n,r){return e=Jl(22,e,r,t),e.elementType=ie,e.lanes=n,e.stateNode={isHidden:!1},e}function tu(e,t,n){return e=Jl(6,e,null,t),e.lanes=n,e}function nu(e,t,n){return t=Jl(4,e.children===null?[]:e.children,e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}function ru(e,t,n,r,i){this.tag=t,this.containerInfo=e,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=Ft(0),this.expirationTimes=Ft(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Ft(0),this.identifierPrefix=r,this.onRecoverableError=i,this.mutableSourceEagerHydrationData=null}function iu(e,t,n,r,i,a,o,s,c){return e=new ru(e,t,n,s,c),t===1?(t=1,!0===a&&(t|=8)):t=0,a=Jl(3,null,null,t),e.current=a,a.stateNode=e,a.memoizedState={element:r,isDehydrated:n,cache:null,transitions:null,pendingSuspenseBoundaries:null},qa(a),e}function au(e,t,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:T,key:r==null?null:``+r,children:e,containerInfo:t,implementation:n}}function ou(e){if(!e)return Ui;e=e._reactInternals;a:{if(it(e)!==e||e.tag!==1)throw Error(a(170));var t=e;do{switch(t.tag){case 3:t=t.stateNode.context;break a;case 1:if(Ji(t.type)){t=t.stateNode.__reactInternalMemoizedMergedChildContext;break a}}t=t.return}while(t!==null);throw Error(a(171))}if(e.tag===1){var n=e.type;if(Ji(n))return Zi(e,n,t)}return t}function su(e,t,n,r,i,a,o,s,c){return e=iu(n,r,!0,e,i,a,o,s,c),e.context=ou(null),n=e.current,r=ml(),i=hl(n),a=Ya(r,i),a.callback=t??null,Xa(n,a,i),e.current.lanes=i,It(e,i,r),_l(e,r),e}function cu(e,t,n,r){var i=t.current,a=ml(),o=hl(i);return n=ou(n),t.context===null?t.context=n:t.pendingContext=n,t=Ya(a,o),t.payload={element:e},r=r===void 0?null:r,r!==null&&(t.callback=r),e=Xa(i,t,o),e!==null&&(gl(e,i,o,a),Za(e,i,o)),o}function lu(e){if(e=e.current,!e.child)return null;switch(e.child.tag){case 5:return e.child.stateNode;default:return e.child.stateNode}}function uu(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function du(e,t){uu(e,t),(e=e.alternate)&&uu(e,t)}function fu(){return null}var pu=typeof reportError==`function`?reportError:function(e){console.error(e)};function mu(e){this._internalRoot=e}hu.prototype.render=mu.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(a(409));cu(e,t,null,null)},hu.prototype.unmount=mu.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;Tl(function(){cu(null,e,null,null)}),t[Ni]=null}};function hu(e){this._internalRoot=e}hu.prototype.unstable_scheduleHydration=function(e){if(e){var t=Ut();e={blockedOn:null,target:e,priority:t};for(var n=0;n<Qt.length&&t!==0&&t<Qt[n].priority;n++);Qt.splice(n,0,e),n===0&&rn(e)}};function gu(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function _u(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11&&(e.nodeType!==8||e.nodeValue!==` react-mount-point-unstable `))}function vu(){}function yu(e,t,n,r,i){if(i){if(typeof r==`function`){var a=r;r=function(){var e=lu(o);a.call(e)}}var o=su(t,r,e,0,null,!1,!1,``,vu);return e._reactRootContainer=o,e[Ni]=o.current,si(e.nodeType===8?e.parentNode:e),Tl(),o}for(;i=e.lastChild;)e.removeChild(i);if(typeof r==`function`){var s=r;r=function(){var e=lu(c);s.call(e)}}var c=iu(e,0,!1,null,null,!1,!1,``,vu);return e._reactRootContainer=c,e[Ni]=c.current,si(e.nodeType===8?e.parentNode:e),Tl(function(){cu(t,c,n,r)}),c}function bu(e,t,n,r,i){var a=n._reactRootContainer;if(a){var o=a;if(typeof i==`function`){var s=i;i=function(){var e=lu(o);s.call(e)}}cu(t,o,e,i)}else o=yu(n,t,e,i,r);return lu(o)}Bt=function(e){switch(e.tag){case 3:var t=e.stateNode;if(t.current.memoizedState.isDehydrated){var n=kt(t.pendingLanes);n!==0&&(Rt(t,n|1),_l(t,H()),!(Q&6)&&(nl=H()+500,aa()))}break;case 13:Tl(function(){var t=Ga(e,1);t!==null&&gl(t,e,1,ml())}),du(e,1)}},Vt=function(e){if(e.tag===13){var t=Ga(e,134217728);t!==null&&gl(t,e,134217728,ml()),du(e,134217728)}},Ht=function(e){if(e.tag===13){var t=hl(e),n=Ga(e,t);n!==null&&gl(n,e,t,ml()),du(e,t)}},Ut=function(){return U},Wt=function(e,t){var n=U;try{return U=e,t()}finally{U=n}},Le=function(e,t,n){switch(t){case`input`:if(be(e,n),t=n.name,n.type===`radio`&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll(`input[name=`+JSON.stringify(``+t)+`][type="radio"]`),t=0;t<n.length;t++){var r=n[t];if(r!==e&&r.form===e.form){var i=zi(r);if(!i)throw Error(a(90));he(r),be(r,i)}}}break;case`textarea`:Te(e,n);break;case`select`:t=n.value,t!=null&&L(e,!!n.multiple,t,!1)}},Ue=wl,We=Tl;var xu={usingClientEntryPoint:!1,Events:[G,Ri,zi,Ve,He,wl]},Su={findFiberByHostInstance:Li,bundleType:0,version:`18.2.0`,rendererPackageName:`react-dom`},Cu={bundleType:Su.bundleType,version:Su.version,rendererPackageName:Su.rendererPackageName,rendererConfig:Su.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:C.ReactCurrentDispatcher,findHostInstanceByFiber:function(e){return e=ct(e),e===null?null:e.stateNode},findFiberByHostInstance:Su.findFiberByHostInstance||fu,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:`18.2.0-next-9e3b772b8-20220608`};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<`u`){var wu=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!wu.isDisabled&&wu.supportsFiber)try{bt=wu.inject(Cu),xt=wu}catch{}}e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=xu,e.createPortal=function(e,t){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!gu(t))throw Error(a(200));return au(e,t,null,n)},e.createRoot=function(e,t){if(!gu(e))throw Error(a(299));var n=!1,r=``,i=pu;return t!=null&&(!0===t.unstable_strictMode&&(n=!0),t.identifierPrefix!==void 0&&(r=t.identifierPrefix),t.onRecoverableError!==void 0&&(i=t.onRecoverableError)),t=iu(e,1,!1,null,null,n,!1,r,i),e[Ni]=t.current,si(e.nodeType===8?e.parentNode:e),new mu(t)},e.findDOMNode=function(e){if(e==null)return null;if(e.nodeType===1)return e;var t=e._reactInternals;if(t===void 0)throw typeof e.render==`function`?Error(a(188)):(e=Object.keys(e).join(`,`),Error(a(268,e)));return e=ct(t),e=e===null?null:e.stateNode,e},e.flushSync=function(e){return Tl(e)},e.hydrate=function(e,t,n){if(!_u(t))throw Error(a(200));return bu(null,e,t,!0,n)},e.hydrateRoot=function(e,t,n){if(!gu(e))throw Error(a(405));var r=n!=null&&n.hydratedSources||null,i=!1,o=``,s=pu;if(n!=null&&(!0===n.unstable_strictMode&&(i=!0),n.identifierPrefix!==void 0&&(o=n.identifierPrefix),n.onRecoverableError!==void 0&&(s=n.onRecoverableError)),t=su(t,null,e,1,n??null,i,!1,o,s),e[Ni]=t.current,si(e),r)for(e=0;e<r.length;e++)n=r[e],i=n._getVersion,i=i(n._source),t.mutableSourceEagerHydrationData==null?t.mutableSourceEagerHydrationData=[n,i]:t.mutableSourceEagerHydrationData.push(n,i);return new hu(t)},e.render=function(e,t,n){if(!_u(t))throw Error(a(200));return bu(null,e,t,!1,n)},e.unmountComponentAtNode=function(e){if(!_u(e))throw Error(a(40));return e._reactRootContainer?(Tl(function(){bu(null,null,e,!1,function(){e._reactRootContainer=null,e[Ni]=null})}),!0):!1},e.unstable_batchedUpdates=wl,e.unstable_renderSubtreeIntoContainer=function(e,t,n,r){if(!_u(n))throw Error(a(200));if(e==null||e._reactInternals===void 0)throw Error(a(38));return bu(e,t,n,!1,r)},e.version=`18.2.0-next-9e3b772b8-20220608`})),o=e(((e,t)=>{function n(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>`u`||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!=`function`))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n)}catch(e){console.error(e)}}n(),t.exports=a()})),s=e((e=>{var t=o();e.createRoot=t.createRoot,e.hydrateRoot=t.hydrateRoot})),c=n(),l=s(),u=class extends Error{constructor(e){super(e),this.name=`RpcTransportError`}},d=class extends Error{error;constructor(e){super(e.message),this.name=`RpcCallError`,this.error=e}};let f=0;function p(){let e=typeof crypto<`u`&&typeof crypto.randomUUID==`function`?crypto.randomUUID():`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`;return f+=1,`${e}-${f.toString(36)}`}async function m(e,t,n,r=6e4){let i=p(),a=new AbortController,o=!1,s;r>0&&(s=setTimeout(()=>{o=!0,a.abort()},r));let c=()=>{a.abort()};n?.addEventListener(`abort`,c,{once:!0});let l;try{try{l=await fetch(`/m/api/${e}`,{method:`POST`,headers:{"content-type":`application/json`},body:JSON.stringify({type:`client-request`,rpcId:i,method:e,payload:t}),signal:a.signal})}catch(e){let t;throw t=e instanceof DOMException&&e.name===`AbortError`?o?`timeout`:`aborted`:e instanceof Error?e.message:String(e),new u(o?`请求超时，请重试`:`transport failed: ${t}`)}if(!l.ok){let e;if(l.status!==403)try{let t=await l.json();typeof t?.error?.message==`string`&&(e=t.error.message)}catch{}throw new u(e===void 0?`HTTP ${String(l.status)}`:e)}let n;try{n=await l.json()}catch(e){throw e instanceof DOMException&&e.name===`AbortError`?new u(o?`请求超时，请重试`:`请求超时或已取消，请重试`):new u(`malformed response body`)}let r=n;if(r?.type!==`server-response`||r.rpcId!==i)throw new u(`response envelope mismatch`);let s=r.result;if(s?.ok===!0)return s.value;throw s?.ok===!1&&s.error!==void 0?new d(s.error):new u(`malformed result envelope`)}finally{s!==void 0&&clearTimeout(s),n?.removeEventListener(`abort`,c)}}async function h(){return await m(`settings.read`,{})}async function g(e,t,n){let r={ns:e,ops:t};n!==void 0&&(r.expectedRevision=n),await m(`settings.mutate`,r)}let _,v;async function y(){let e=v;if(e!==void 0&&Date.now()-e.at<5e3)return e.items;let t=_;if(t!==void 0)return t;let n=m(`workspace.list`,{}).then(({items:e})=>(v={at:Date.now(),items:e},e)).finally(()=>{_=void 0});return _=n,n}async function b(){return await m(`mobile.preferences`,{})}async function x(){return await m(`push.config`,{get:!0})}async function S(e){await m(`push.config`,{set:e})}async function C(){await m(`push.config`,{test:!0})}async function w(e){await m(`push.subscribe`,{subscription:e})}async function T(){await m(`push.unsubscribe`,{})}async function ee(){return await m(`mobile.notifyEvents`,{})}async function te(){return await m(`mobile.latestVersion`,{})}async function E(e,t){return await m(`mobile.readAttachment`,{sessionId:e,attachmentId:t})}async function D(){return await m(`mobile.diagnostics`,{})}async function O(e,t){return await m(`mobile.perf`,{capture:e,label:t})}async function ne(e,t){return await m(`mobile.error`,{report:e,label:t})}async function k(){return await m(`mobile.runningSessions`,{})}async function re(e,t){return await m(`session.list`,{...e===void 0?{}:{cursor:e},...t===void 0?{}:{workspaceId:t}})}async function A(e){return await m(`mobile.searchAll`,{query:e})}async function j(e,t){return await m(`mobile.searchMessages`,{sessionId:e,query:t})}async function ie(){return await m(`agentPreset.list`,{})}async function ae(e={}){return await m(`session.create`,e)}async function M(e,t,n=25,r){return await m(`session.history`,{sessionId:e,maxMessages:n,...t===void 0?{}:{beforeSeq:t}},r)}async function N(e,t,n=25,r){return await m(`mobile.readChat`,{sessionId:e,...t===void 0?{}:{beforeSeq:t},...n===25?{}:{maxRows:n}},r)}async function oe(e,t){await m(`mobile.observe`,e===void 0?{}:{sessionId:e},t)}async function se(e,t){let n=e.filter(e=>e!==``).slice(0,200);return n.length===0?[]:(await m(`mobile.previews`,{sessionIds:n},t)).items}async function ce(e,t){await m(`session.prompt`,{sessionId:e,mode:`queue`,content:t})}function le(e){let t=Array.isArray(e.message?.content)?e.message.content:[],n=t.length>0&&t.every(e=>e.type===`text`&&typeof e.text==`string`),r=n?t.map(e=>e.text).join(``):t.map(e=>e.type===`text`&&typeof e.text==`string`?e.text:`[${e.type??`内容`}]`).join(` `).trim();return{id:e.id,placement:e.placement,text:r,editable:n}}async function ue(e,t,n){await m(`session.updateQueue`,{sessionId:e,itemId:t,action:n})}async function de(e){return(await m(`mobile.commands`,{sessionId:e})).items??[]}async function fe(e,t){return await m(`mobile.commandExec`,{sessionId:e,line:t},void 0,18e4)}async function P(e,t){return(await m(`mobile.transcribe`,{audio:e,services:t},void 0,18e4)).text}async function pe(){return(await m(`mobile.voiceServices`,{})).services}async function F(e){return await m(`mobile.usage`,e===!0?{refresh:!0}:{})}async function me(e,t){return await m(`session.rename`,{sessionId:e,title:t})}async function he(e){return await m(`session.cancel`,{sessionId:e})}async function ge(e){return await m(`subagent.list`,{parentSessionId:e})}async function _e(e){return await m(`session.models`,{sessionId:e})}async function ve(e,t){return await m(`session.selectModel`,{sessionId:e,provider:t.provider,model:t.model,...t.reasoningEffort===void 0?{}:{reasoningEffort:t.reasoningEffort}})}async function ye(e){return await m(`mobile.pending`,{sessionId:e})}async function be(e,t,n,r){await m(`mobile.respond`,{rpcId:e,response:{sessionId:t,approvalId:n,outcome:r}})}async function xe(e,t,n){await m(`mobile.respond`,{rpcId:e,response:{sessionId:t,answer:n}})}async function Se(e){return await m(`mobile.listDirectory`,e===void 0?{}:{path:e})}async function I(e,t){return await m(`mobile.readFile`,t===void 0?{path:e}:{path:e,sessionId:t})}async function L(e){return await m(`workspace.create`,{path:e})}async function Ce(e,t){return await m(`workspace.rename`,{workspaceId:e,title:t})}async function we(e){return await m(`workspace.delete`,{workspaceId:e})}async function Te(e){return await m(`workspace.archiveSession`,{sessionId:e})}async function Ee(){return await m(`pair.devices`,{})}async function De(e){return await m(`pair.revoke`,{deviceId:e})}async function Oe(e,t){return await m(`pair.rename`,{deviceId:e,name:t})}async function R(e){return await m(`pair.setPrimary`,{deviceId:e})}function z(e){return typeof e==`object`&&!!e&&!Array.isArray(e)}function B(e){return typeof e==`string`?e:void 0}function V(e){return typeof e==`number`&&Number.isFinite(e)?e:void 0}const ke=[`pending`,`in_progress`,`completed`];function Ae(e){if(!z(e))return;let t=e.todos;if(!Array.isArray(t))return;let n=[];for(let e of t){if(!z(e))return;let t=B(e.content),r=B(e.status);if(t===void 0||r===void 0||!ke.includes(r))return;n.push({content:t,status:r})}return n}function je(e,t){if(t.type===`todo/write`){let n=Ae(t.data);return n===void 0?e:{seq:t.seq,items:n}}if(t.type===`turn/end`&&e!==void 0)return{seq:e.seq,items:e.items.map(e=>e.status===`in_progress`?{...e,status:`completed`}:e)};if(t.type!==`turn/start`)return e}function Me(e){let t;for(let n of e)t=je(t,n);return t}function Ne(e,t){return`${e}#${String(t)}`}function Pe(e){return Le(e,`text`)}function Fe(e){if(!Array.isArray(e))return[];let t=[];for(let n of e){if(typeof n!=`object`||!n)continue;let e=n;if(e.type!==`image`)continue;let r=z(e.attachment)?e.attachment:e,i=B(r.attachmentId),a=B(r.mediaType);if(i===void 0||a===void 0)continue;let o=V(r.bytes),s=B(r.name);t.push({attachmentId:i,mediaType:a,width:V(r.width)??0,height:V(r.height)??0,...o===void 0?{}:{bytes:o},...s===void 0?{}:{name:s}})}return t}function Ie(e){return Le(e,`reasoning`)}function Le(e,t){if(!Array.isArray(e))return``;let n=``;for(let r of e){if(!z(r)||r.type!==t)continue;let e=B(r.text);e!==void 0&&(n+=e)}return n}function Re(e){if(!Array.isArray(e))return[];let t=[];for(let n of e){if(!z(n))continue;let e=n.type;if(e!==`text`&&e!==`reasoning`)continue;let r=B(n.text);r!==void 0&&r!==``&&t.push(e===`reasoning`?{kind:`reasoning`,text:r}:{kind:`text`,text:r})}return t}function ze(e){if(!z(e))return null;let t,n=`text`,r,i,a,o=e.chunk;if(z(o)){if(o.type!==`text-delta`&&o.type!==`reasoning-delta`)return null;t=B(o.text),n=o.type===`reasoning-delta`?`reasoning`:`text`,i=V(e.turn),a=V(e.step),r=B(e.messageId)??B(e.id)}else t=B(e.text),n=B(e.kind)===`reasoning`?`reasoning`:`text`,r=B(e.messageId)??B(e.id),i=V(e.turn),a=V(e.step);if(t===void 0)return null;let s={text:t,kind:n};return r!==void 0&&(s.id=r),i!==void 0&&(s.turn=i),a!==void 0&&(s.step=a),s}function Be(e,t){let n=e===void 0?[]:[...e],r={messages:n,byId:new Map,pendingByTurnStep:new Map,turnStepMessage:new Map,messageTurn:new Map,toolNames:new Map,turnStarts:new Map,presented:new Map,maxSeq:t??-1};for(let e of n){if(e.seq>r.maxSeq&&(r.maxSeq=e.seq),r.byId.set(e.id,e),e.kind!==`assistant`)continue;let t=He(e.id),n=Ve(e.turn,e.step)??(t===void 0?void 0:Ve(t.turn,t.step));n!==void 0&&(r.turnStepMessage.set(n,e),e.pending===!0&&r.pendingByTurnStep.set(n,e)),e.turn===void 0?t!==void 0&&r.messageTurn.set(e.id,t.turn):r.messageTurn.set(e.id,e.turn),e.tools!==void 0&&e.tools.length>0&&r.toolNames.set(e.id,new Set(e.tools.map(e=>e.name)))}return r}function Ve(e,t){return e===void 0||t===void 0?void 0:`${e}.${t}`}function He(e){if(!e.startsWith(`assistant,`))return;let t=e.slice(10),n=t.indexOf(`#`),r=n===-1?t:t.slice(0,n),i=r.indexOf(`.`);if(i<=0||i===r.length-1)return;let a=Number(r.slice(0,i)),o=Number(r.slice(i+1));if(!(!Number.isInteger(a)||!Number.isInteger(o)))return{turn:a,step:o}}function Ue(e,t,n){let r=e.messages.indexOf(t);if(r===-1&&(r=e.messages.findIndex(e=>e.id===t.id),r===-1&&t.turn!==void 0))for(let n=e.messages.length-1;n>=0;--n){let i=e.messages[n];if(i!==void 0&&i.kind===`assistant`&&i.turn===t.turn){r=n;break}}r===-1?e.messages.push(n):e.messages[r]=n,e.byId.delete(t.id),e.byId.set(n.id,n)}function We(e,t,n,r){t!==void 0&&(e.pendingByTurnStep.get(t)===n&&e.pendingByTurnStep.set(t,r),e.turnStepMessage.get(t)===n&&e.turnStepMessage.set(t,r))}function Ge(e){let t=Ve(e.turn,e.step);if(t!==void 0)return t;let n=He(e.id);return n===void 0?void 0:Ve(n.turn,n.step)}function Ke(e,t){switch(t.seq>e.maxSeq&&(e.maxSeq=t.seq),t.type){case`user/message`:qe(e,t);break;case`assistant/message`:Je(e,t);break;case`assistant/chunk`:case`message/chunk`:it(e,t);break;case`message/update`:ot(e,t);break;case`message/delete`:ct(e,t);break;case`turn/end`:gt(e,t);break;case`tool/call`:lt(e,t);break;case`tool/result`:ut(e,t);break;case`turn/start`:H(e,t);break;case`deliverables/presented`:mt(e,t);break;case`command/run`:ft(e,t);break;case`command/done`:pt(e,t)}}function qe(e,t){let n=z(t.data)?t.data:{},r=B(n.id)??Ne(`user`,t.seq),i=Pe(n.content),a=Fe(n.content),o=B((z(n.source)?n.source:{}).kind),s=e.byId.get(r);if(s!==void 0){Ue(e,s,{...s,...o===void 0?{}:{sourceKind:o},...a.length>0?{images:a}:{},text:i,seq:t.seq,time:t.time});return}let c={id:r,kind:`user`,text:i,...a.length>0?{images:a}:{},...o===void 0?{}:{sourceKind:o},seq:t.seq,time:t.time};e.messages.push(c),e.byId.set(r,c)}function Je(e,t){let n=z(t.data)?t.data:{},r=z(n.message)?n.message:n,i=B(r.id)??B(n.id)??Ne(`assistant`,t.seq),a=V(n.turn),o=V(n.step),s=Pe(r.content),c=Ie(r.content),l=Ve(a,o),u=Ye(n),d=e.byId.get(i);if(d===void 0&&l!==void 0&&(d=e.pendingByTurnStep.get(l)),d!==void 0){let n={...d,id:d.id.includes(`#`)?i:d.id,text:s,...c===``?{}:{reasoning:c},flow:$e(d.flow,d.text,s,t.seq),...u===void 0?{}:{usage:u},seq:t.seq,time:t.time,pending:!1,...o===void 0?{}:{step:o}};if(Ue(e,d,n),We(e,l,d,n),a!==void 0&&e.messageTurn.set(n.id,a),d.id!==n.id){let t=e.toolNames.get(d.id);t!==void 0&&(e.toolNames.delete(d.id),e.toolNames.set(n.id,t)),e.messageTurn.delete(d.id),l!==void 0&&e.pendingByTurnStep.delete(l)}return}let f=Re(r.content),p={id:i,kind:`assistant`,text:s,...f.length>0?{flow:f}:s===``?{}:{flow:[{kind:`text`,text:s}]},...c===``?{}:{reasoning:c},...u===void 0?{}:{usage:u},...a===void 0?{}:{turn:a},...o===void 0?{}:{step:o},seq:t.seq,time:t.time};if(e.messages.push(p),e.byId.set(i,p),l!==void 0&&(e.pendingByTurnStep.delete(l),e.turnStepMessage.set(l,p)),a!==void 0&&e.messageTurn.set(i,a),a!==void 0&&e.turnStepMessage.size>1)for(let[t,n]of e.turnStepMessage){if(n===p)continue;let r=Number(t.slice(0,t.indexOf(`.`)));Number.isInteger(r)&&r<a&&e.turnStepMessage.delete(t)}}function Ye(e){let t=e.usage;if(!z(t))return;let n=V(t.inputTokens),r=V(t.outputTokens);if(n===void 0||r===void 0)return;let i={inputTokens:n,outputTokens:r},a=V(t.cacheReadTokens),o=V(t.cacheWriteTokens);return a!==void 0&&(i.cacheReadTokens=a),o!==void 0&&(i.cacheWriteTokens=o),i}function Xe(e,t,n){if(e===void 0||e.length===0)return[{kind:`text`,text:t,...n===void 0?{}:{seq:n}}];let r=e[e.length-1];return r.kind===`text`&&(n===void 0||r.seq===void 0||r.seq===n)?[...e.slice(0,-1),{kind:`text`,text:r.text+t,...r.seq!==void 0||n!==void 0?{seq:r.seq??n}:{}}]:[...e,{kind:`text`,text:t,...n===void 0?{}:{seq:n}}]}function Ze(e,t){if(e===void 0||e.length===0)return[{kind:`reasoning`,text:t}];let n=e[e.length-1];return n!==void 0&&n.kind===`reasoning`?[...e.slice(0,-1),{kind:`reasoning`,text:n.text+t,...n.seq===void 0?{}:{seq:n.seq}}]:[...e,{kind:`reasoning`,text:t}]}function Qe(e,t){return[...e??[],{kind:`tool`,callId:t}]}function $e(e,t,n,r){if(n===t)return e??[];let i=(e??[]).filter(e=>e.kind!==`text`);return n===``?i:[...i,{kind:`text`,text:n,seq:r}]}function et(e,t){if(e===void 0)return t;if(t===void 0)return e;let n=new Set;for(let r of[e,t])for(let e of r.replace(/^使用\s*/,``).split(` / `)){let t=e.trim();t!==``&&t!==`undefined`&&n.add(t)}return n.size===0?void 0:`使用 ${[...n].join(` / `)}`}function tt(e,t){return e===void 0||e.some(e=>e.kind!==`tool`&&e.seq!==void 0)?e:e.map(e=>e.kind===`tool`?e:{...e,seq:t})}function nt(e,t){if(e===void 0)return t??[];if(t===void 0)return e;let n=[...e],r=t[0];if(r!==void 0&&r.kind===`text`){let e=n[n.length-1];if(e!==void 0&&e.kind===`text`&&(e.seq===void 0||r.seq===void 0||e.seq===r.seq))return n[n.length-1]={kind:`text`,text:e.text+(e.text!==``&&r.text!==``?`

`:``)+r.text,...e.seq!==void 0||r.seq!==void 0?{seq:e.seq??r.seq}:{}},[...n,...t.slice(1)]}return[...n,...t]}function rt(e,t){if(t===void 0)return{};let n=e.turnStarts.get(t);return{turn:t,...n===void 0?{}:{turnStartAt:n}}}function it(e,t){let n=ze(t.data);if(n===null)return;let r=Ve(n.turn,n.step),i;if(n.id===void 0?r!==void 0&&(i=e.pendingByTurnStep.get(r)??e.turnStepMessage.get(r)):(i=e.byId.get(n.id),i===void 0&&r!==void 0&&(i=e.pendingByTurnStep.get(r)??e.turnStepMessage.get(r))),i!==void 0&&i.kind===`assistant`){let a=n.kind===`reasoning`?{...i,reasoning:(i.reasoning??``)+n.text,seq:t.seq,time:t.time,flow:Ze(i.flow,n.text)}:{...i,text:i.text+n.text,seq:t.seq,time:t.time,flow:Xe(i.flow,n.text)};Ue(e,i,a),We(e,r,i,a);return}let a=n.id??Ne(r===void 0?`assistant`:`assistant,${r}`,t.seq),o=n.kind===`reasoning`?{id:a,kind:`assistant`,text:``,reasoning:n.text,seq:t.seq,time:t.time,firstSeenAt:t.time,pending:!0,flow:[{kind:`reasoning`,text:n.text}],...rt(e,n.turn),...n.step===void 0?{}:{step:n.step}}:{id:a,kind:`assistant`,text:n.text,seq:t.seq,time:t.time,firstSeenAt:t.time,pending:!0,flow:[{kind:`text`,text:n.text,seq:t.seq}],...rt(e,n.turn),...n.step===void 0?{}:{step:n.step}};e.messages.push(o),e.byId.set(a,o),r!==void 0&&(e.pendingByTurnStep.set(r,o),e.turnStepMessage.set(r,o)),n.turn!==void 0&&e.messageTurn.set(a,n.turn)}function at(e,t){let n=z(t.data)?t.data:{},r=B(n.id);if(r!==void 0){let t=e.byId.get(r);if(t!==void 0)return t}let i=V(n.seq??n.messageSeq);if(i!==void 0)return e.messages.find(e=>e.seq===i)}function ot(e,t){let n=at(e,t);if(n===void 0)return;let r=B((z(t.data)?t.data:{}).text),i={...n,...r===void 0?{}:{text:r},seq:t.seq,time:t.time};Ue(e,n,i),We(e,Ge(n),n,i)}function st(e,t){let n=e.messages.indexOf(t);n!==-1&&e.messages.splice(n,1),e.byId.delete(t.id),e.messageTurn.delete(t.id),e.toolNames.delete(t.id);for(let[n,r]of e.turnStepMessage)r===t&&e.turnStepMessage.delete(n);for(let[n,r]of e.pendingByTurnStep)r===t&&e.pendingByTurnStep.delete(n)}function ct(e,t){let n=at(e,t);n!==void 0&&st(e,n)}function lt(e,t){let n=z(t.data)?t.data:{},r=B(n.name);if(r===void 0)return;let i=V(n.turn),a=V(n.step),o=Ve(i,a),s=o===void 0?void 0:e.turnStepMessage.get(o);if(s===void 0&&o!==void 0){let n=Ne(`assistant,${o}`,t.seq),r={id:n,kind:`assistant`,text:``,seq:t.seq,time:t.time,firstSeenAt:t.time,pending:!0,turn:i,step:a};e.messages.push(r),e.byId.set(n,r),e.turnStepMessage.set(o,r),e.pendingByTurnStep.set(o,r),i!==void 0&&e.messageTurn.set(n,i),s=r}if(s===void 0&&i!==void 0)for(let t=e.messages.length-1;t>=0;t--){let n=e.messages[t];if(n!==void 0&&n.kind===`assistant`&&e.messageTurn.get(n.id)===i){s=n;break}}if(s===void 0&&i===void 0)for(let t=e.messages.length-1;t>=0;t--){let n=e.messages[t];if(n!==void 0&&n.kind===`assistant`){s=n;break}}if(s===void 0)return;let c=e.toolNames.get(s.id)??new Set,l=!c.has(r);l&&(c.add(r),e.toolNames.set(s.id,c));let u=B(n.callId)??`${r}#${String(t.seq)}`,d=B(n.arguments),f=dt(t.view),p=s.tools??[],m=p.findIndex(e=>e.callId===u),h=m===-1,g=h?[...p,{callId:u,name:r,state:`running`,...d===void 0?{}:{arguments:d},...f===void 0?{}:{view:f}}]:p.map((e,t)=>t===m?{...e,...d===void 0?{}:{arguments:d},...f===void 0?{}:{view:f}}:e),_={...s,...l?{toolSummary:`使用 ${[...c].join(` / `)}`}:{},...h||d!==void 0?{tools:g}:{},...h?{flow:Qe(s.flow,u)}:{},seq:t.seq,time:t.time};Ue(e,s,_),We(e,o,s,_)}function ut(e,t){let n=z(t.data)?t.data:{},r=z(n.message)?n.message:{},i=B((z(r.source)?r.source:{}).callId);if(i===void 0)return;let a=dt(t.view),o=r.isError===!0||r.error!==void 0?`error`:`ok`;for(let n of e.messages){if(n.kind!==`assistant`||n.tools===void 0)continue;let r=n.tools.findIndex(e=>e.callId===i);if(r===-1)continue;let s=n.tools.map((e,t)=>t===r?{...e,state:o,...a===void 0?{}:{view:a}}:e),c={...n,tools:s,seq:t.seq,time:t.time};Ue(e,n,c),We(e,Ge(n),n,c);return}}function dt(e){if(!z(e))return;let t=e.view;if(!z(t)||t.card!==`diff`)return;let n=t.diffs;if(!Array.isArray(n))return;let r=[];for(let e of n){if(!z(e))return;let t=B(e.path),n=B(e.newText);if(t===void 0||n===void 0)return;let i=e.oldText;r.push({path:t,oldText:typeof i==`string`?i:null,newText:n})}let i=B(t.title);return{card:`diff`,...i===void 0?{}:{title:i},diffs:r}}function ft(e,t){let n=z(t.data)?t.data:{},r=B(n.commandId)??Ne(`command`,t.seq),i=e.byId.get(r);if(i!==void 0&&i.kind===`command`&&i.commandPhase!==`running`)return;let a=B(n.name)??``,o=B(n.args)??``,s={id:r,kind:`command`,text:``,commandLine:o===``?`/${a}`:`/${a} ${o}`,commandPhase:`running`,seq:t.seq,time:t.time};i===void 0?(e.messages.push(s),e.byId.set(s.id,s)):Ue(e,i,s)}function pt(e,t){let n=z(t.data)?t.data:{},r=B(n.commandId)??Ne(`command`,t.seq),i=B(n.kind)===`error`?`error`:`success`,a=B(n.text)??``,o=e.byId.get(r),s=o!==void 0&&o.kind===`command`?o.commandLine:void 0,c={id:r,kind:`command`,text:a===``?s===void 0?`命令已执行`:`${s} · 已执行`:a,...s===void 0?{}:{commandLine:s},commandPhase:i,seq:t.seq,time:t.time};o===void 0?(e.messages.push(c),e.byId.set(c.id,c)):Ue(e,o,c)}function H(e,t){let n=V((z(t.data)?t.data:{}).turn);n!==void 0&&e.turnStarts.set(n,t.time)}function mt(e,t){let n=z(t.data)?t.data:{},r=V(n.turn),i=n.files;if(r===void 0||!Array.isArray(i))return;let a=e.presented.get(r)??[],o=new Set(a.map(e=>e.path)),s=[...a];for(let e of i){if(!z(e))continue;let t=B(e.path);if(t===void 0||o.has(t))continue;let n=B(e.description);o.add(t),s.push(n===void 0?{path:t}:{path:t,description:n})}s.length!==a.length&&e.presented.set(r,s)}function ht(e){let t=[],n=new Set;for(let r of e)for(let e of r.tools??[])for(let r of e.view?.diffs??[])n.has(r.path)||(n.add(r.path),t.push(r.path));return t}function gt(e,t){let n=z(t.data)?t.data:{},r=V(n.turn),i=z(n.reason)?n.reason:{},a=i.kind===`error`,o=i.kind===`max-tokens`,s=r===void 0?void 0:e.turnStarts.get(r),c=s===void 0?void 0:Math.max(0,t.time-s),l;if(l=r===void 0?e.messages.filter(e=>e.kind===`assistant`):e.messages.filter(t=>t.kind===`assistant`&&e.messageTurn.get(t.id)===r),l.length===0)for(let t=e.messages.length-1;t>=0;t--){let n=e.messages[t];if(n!==void 0&&n.kind===`assistant`){l=[n];break}}for(let n of l){let r=n.pending===!0,i=(n.tools??[]).some(e=>e.state===`running`),l={...n,...i?{tools:(n.tools??[]).map(e=>e.state===`running`?{...e,state:`stopped`}:e)}:{},...r?{pending:!1}:{},...a?{failed:!0}:{},...o?{maxTokens:!0}:{},...c===void 0?{}:{durationMs:c},...s===void 0?{}:{turnStartAt:s},time:t.time};Ue(e,n,l),We(e,Ge(n),n,l)}let u=r===void 0?void 0:e.presented.get(r),d=new Set((u??[]).map(e=>e.path)),f=ht(l).filter(e=>!d.has(e));if(!((u?.length??0)>0||f.length>0))return;let p=`turn-tail:${r??`last`}`,m={id:p,kind:`turn`,text:``,seq:t.seq,time:t.time,...r===void 0?{}:{turn:r},...c===void 0?{}:{durationMs:c},...u===void 0?{}:{deliverables:u},...f.length>0?{produced:f}:{}},h=e.byId.get(p);h===void 0?(e.messages.push(m),e.byId.set(p,m)):Ue(e,h,m)}function _t(e,t){return new Dt(t).fold(e)}function vt(e){for(let t=e.length-1;t>=0;t--){let n=e[t]?.type;if(n===`turn/end`)return;if(n===`turn/start`)return e[t]?.time}}function yt(e){return e.kind===`user`&&e.sourceKind!==void 0&&e.sourceKind!==`user`&&!xt(e.sourceKind)}const bt=new Set([`agent-message`,`team-message`,`subagent-settled`,`webhook`,`schedule`,`tool-jobs`,`cordis-host-runner`,`goal`]);function xt(e){return bt.has(e)}const St={"agent-message":`收到任务消息`,"team-message":`收到团队消息`,"subagent-settled":`子任务状态更新`,webhook:`收到外部事件`,schedule:`定时任务`,"tool-jobs":`后台任务状态更新`,"cordis-host-runner":`插件状态更新`,goal:`继续执行目标`};function Ct(e){return xt(e)?St[e]:void 0}const wt={"agent-message":`📨`,"team-message":`👥`,"subagent-settled":`🧩`,webhook:`🔔`,schedule:`⏰`,"tool-jobs":`⚙️`,"cordis-host-runner":`🔌`,goal:`🎯`};function Tt(e){return xt(e)?wt[e]:void 0}function Et(e){let t=[];for(let n of e){let e=t.length>0?t[t.length-1]:void 0;if(yt(n)){if(e!==void 0&&e.kind===`assistant`)continue;t.push(n);continue}if(e!==void 0&&e.kind===`assistant`&&n.kind===`assistant`&&e.turn!==void 0&&n.turn!==void 0&&e.turn===n.turn){let r={...e,text:e.text+(e.text!==``&&n.text!==``?`

`:``)+n.text,...e.reasoning!==void 0||n.reasoning!==void 0?{reasoning:(e.reasoning??``)+((e.reasoning??``)!==``&&(n.reasoning??``)!==``?`

`:``)+(n.reasoning??``)}:{},...e.tools!==void 0||n.tools!==void 0?{tools:[...e.tools??[],...n.tools??[]]}:{},...e.flow!==void 0||n.flow!==void 0?{flow:nt(tt(e.flow,e.seq),tt(n.flow,n.seq))}:{},...e.toolSummary!==void 0||n.toolSummary!==void 0?{toolSummary:et(e.toolSummary,n.toolSummary)}:{},startSeq:e.startSeq??e.seq,seq:n.seq,stepSeqs:[...e.stepSeqs??[e.startSeq??e.seq],n.seq],stepTexts:[...e.stepTexts??[e.text],n.text],time:n.time,pending:n.pending===!0,...n.failed===!0?{failed:!0}:{},...n.maxTokens===!0?{maxTokens:!0}:{},...n.usage===void 0?{}:{usage:n.usage},...e.turnStartAt!==void 0||n.turnStartAt!==void 0?{turnStartAt:e.turnStartAt??n.turnStartAt}:{},...e.durationMs!==void 0||n.durationMs!==void 0?{durationMs:n.durationMs??e.durationMs}:{},...e.firstSeenAt!==void 0||n.firstSeenAt!==void 0?{firstSeenAt:e.firstSeenAt??n.firstSeenAt}:{}};t[t.length-1]=r}else t.push(n)}return t}var Dt=class{state;snapshotList;constructor(e,t){this.state=Be(e,t)}get lastSeq(){return this.state.maxSeq}fold(e){let t=[...e].sort((e,t)=>e.seq-t.seq),n=this.state.maxSeq,r=!1;for(let e of t)e.seq<=n||(Ke(this.state,e),r=!0);return!r&&this.snapshotList!==void 0||(this.snapshotList=Ot(this.state)),this.snapshotList}seed(e){this.state=Be(e),this.snapshotList=void 0}prepend(e){this.state=Be([...e,...this.state.messages]),this.snapshotList=void 0}snapshot(){return this.snapshotList===void 0&&(this.snapshotList=Ot(this.state)),this.snapshotList}};function Ot(e){let t=[...e.messages],n=!0;for(let e=1;e<t.length;e+=1){let r=t[e-1],i=t[e];if(r.seq>i.seq){n=!1;break}}return n?t:t.sort((e,t)=>e.seq-t.seq)}const kt=[];let At=0,jt=!1;const Mt=new Set;function Nt(e){return Mt.add(e),()=>{Mt.delete(e)}}function Pt(e){for(let t of Mt)try{t(e)}catch{}}function Ft(e,t=240){let n=e.replace(/\s+/g,` `).trim();return n.length<=t?n:`${n.slice(0,t-1)}…`}function It(e){let t=/([^\s()/\\]+):(\d+):(\d+)/.exec(e);return t===null?void 0:`${t[1]}:${t[2]}:${t[3]}`}function Lt(e){if(typeof e!=`string`)return;let t=[];for(let n of e.split(`
`).slice(1)){let e=It(n);if(e!==void 0&&!t.includes(e)&&t.push(e),t.length>=3)break}return t.length===0?void 0:t}function Rt(){return typeof performance>`u`?Date.now():performance.now()}function U(e){let t=Ft(e.message===``?`unknown error`:e.message),n=e.source===void 0||e.source===``?void 0:Ft(e.source,120);At+=1;let r=kt.find(r=>r.kind===e.kind&&r.message===t&&r.source===n);if(r!==void 0){r.count+=1,kt.splice(kt.indexOf(r),1),kt.unshift(r),Pt(r);return}let i={kind:e.kind,message:t,at:Rt(),count:1};n!==void 0&&(i.source=n);let a=Lt(e.stack);a!==void 0&&(i.frames=a),kt.unshift(i),kt.length>20&&(kt.length=20),Pt(i)}function zt(){return kt.map(e=>({...e,...e.frames===void 0?{}:{frames:[...e.frames]}}))}function Bt(){let e={};for(let t of kt)e[t.kind]=(e[t.kind]??0)+t.count;return{total:At,kinds:e,recent:zt()}}function Vt(){kt.length=0,At=0}function Ht(e){if(e instanceof Error)return{message:e.message===``?e.name:e.message,stack:e.stack};if(typeof e==`string`)return{message:e};try{let t=JSON.stringify(e);return{message:typeof t==`string`?t:String(e)}}catch{return{message:Object.prototype.toString.call(e)}}}function Ut(){jt||typeof window>`u`||(jt=!0,window.addEventListener(`error`,e=>{let t=e.target,n=t?.tagName;if(t!=null&&n!==void 0&&typeof n==`string`){let e=t,r=((e.src??e.href??``).split(/[?#]/)[0]??``).split(`/`).pop()??``;U({kind:`resource`,message:`${n.toLowerCase()} 加载失败`,source:r===``?void 0:r});return}let r=e.error,i=e.filename===void 0||e.filename===``?void 0:It(`${e.filename}:${e.lineno??0}:${e.colno??0}`);U({kind:`error`,message:e.message??``,source:i,stack:r?.stack})},!0),window.addEventListener(`unhandledrejection`,e=>{let t=Ht(e.reason);U({kind:`rejection`,message:t.message,stack:t.stack})}))}function Wt(){if(!(typeof navigator>`u`))return navigator.storage}let Gt={persisted:!1},Kt=!1;function qt(){return{...Gt}}async function Jt(e){try{if(typeof e.persisted==`function`&&(Gt.persisted=await e.persisted()),typeof e.estimate==`function`){let t=await e.estimate();typeof t.usage==`number`&&(Gt.usage=t.usage),typeof t.quota==`number`&&(Gt.quota=t.quota)}Gt.at=Date.now(),delete Gt.note}catch{Gt.note=`denied`,Gt.at=Date.now()}}async function Yt(){let e=Wt();if(e===void 0){Gt={...Gt,note:`unsupported`};return}if(!Kt){Kt=!0;try{typeof e.persist==`function`&&(Gt.persisted=await e.persist())}catch{}await Jt(e)}}const Xt=[],Zt=[],Qt=new Map;let $t=null;function en(){try{if(typeof localStorage<`u`&&localStorage.getItem(`dsh.palm.perf`)===`1`)return!0}catch{}return!!(typeof location<`u`&&/\bperf=1\b/.test(location.search))}function tn(){return $t===null&&($t=en()),$t}function nn(){$t=null}function rn(e){Xt.length>=2048&&Xt.shift(),Xt.push(e),e.stage===`recv`&&e.seq!==void 0&&(Qt.size>=512&&Qt.clear(),Qt.set(e.seq,e.t))}function an(){return tn()}function on(e,t={}){tn()&&rn({t:performance.now(),stage:e,seq:t.seq,frame:t.frame,detail:t.detail})}function sn(e,t){tn()&&(Zt.push({kind:e,at:performance.now(),detail:t}),Zt.length>256&&Zt.shift())}const cn=[],ln=[];let un=null,dn=0,fn=0,pn,mn=!1;function hn(e){un===null&&(un=e)}function gn(e){if(un===null)return;let t=un;un=null,dn+=Math.max(0,e-t),fn+=1,ln.push({from:t,to:e}),ln.length>32&&ln.shift()}function _n(e){return un!==null&&e>=un||ln.some(t=>e>=t.from&&e<=t.to)}function vn(){mn||typeof document>`u`||(mn=!0,document.hidden&&hn(performance.now()),document.addEventListener(`visibilitychange`,()=>{document.hidden?hn(performance.now()):gn(performance.now())}))}function yn(){if(pn!==void 0)return;let e=globalThis.PerformanceObserver;if(e!==void 0)try{let t=new e(e=>{for(let t of e.getEntries())cn.unshift({at:t.startTime,ms:t.duration,suspended:_n(t.startTime)});cn.length>64&&(cn.length=64)});t.observe({entryTypes:[`longtask`]}),pn=t}catch{pn=void 0}}let bn=!1,xn=0,Sn=0,Cn=0;function wn(){if(bn||!tn())return;bn=!0,vn(),yn();let e=t=>{if(!tn()){bn=!1;return}if(Cn!==0){let e=t-Cn;xn+=1,e>50&&(Sn+=1)}Cn=t,requestAnimationFrame(e)};requestAnimationFrame(e)}function Tn(e,t){return e.length===0?0:e[Math.min(e.length-1,Math.max(0,Math.ceil(e.length*t)-1))]}function En(e,t){if(t.length===0)return{name:e,n:0,avg:0,p50:0,p95:0,max:0};let n=[...t].sort((e,t)=>e-t);return{name:e,n:t.length,avg:Math.round(t.reduce((e,t)=>e+t,0)/t.length*1e3)/1e3,p50:Math.round(Tn(n,.5)*1e3)/1e3,p95:Math.round(Tn(n,.95)*1e3)/1e3,max:Math.round(n[n.length-1]*1e3)/1e3}}function Dn(e){let t=[];for(let n of Xt){if(n.stage!==e||n.seq===void 0)continue;let r=Qt.get(n.seq);r!==void 0&&t.push(Math.max(0,n.t-r))}return t}function On(){return{armed:tn(),capturedAt:new Date().toISOString(),marks:[...Xt],anomalies:[...Zt],frames:{sampled:xn,long:Sn},spansMs:{state:Dn(`state`),commit:Dn(`commit`)},longTasks:[...cn],suspension:{hiddenMs:Math.round(dn),hiddenCount:fn},errors:Bt(),storage:qt()}}function kn(){let e=On();return{armed:e.armed,marks:e.marks.length,anomalies:e.anomalies,frames:e.frames,spans:{toState:En(`state`,e.spansMs.state),toCommit:En(`commit`,e.spansMs.commit)},longTasks:{...En(`longTask`,e.longTasks.filter(e=>!e.suspended).map(e=>e.ms)),suspended:e.longTasks.filter(e=>e.suspended).length,recent:e.longTasks.slice(0,8)},suspension:e.suspension,errors:{total:e.errors.total,kinds:e.errors.kinds,recent:e.errors.recent.slice(0,5)},storage:e.storage}}function An(){Xt.length=0,Zt.length=0,Qt.clear(),xn=0,Sn=0,Cn=0,cn.length=0,ln.length=0,un=null,dn=0,fn=0,Vt(),$t=null}function jn(){if(!(typeof window>`u`))try{window.__dshPalmPerf={toJSON:On,stats:kn,clear:An,refresh:nn}}catch{}}function Mn(e){return new EventSource(e)}const Nn=new Set([`session/event`,`session/subscribed`,`approval/requested`,`approval/resolved`,`question/requested`,`question/resolved`,`session/queue`,`session/jobs`,`session/projection`,`session/added`,`session/removed`,`session/status`,`session/activity`,`session/error`,`stream/error`]);function Pn(e){let t;try{t=JSON.parse(e)}catch{return}if(typeof t!=`object`||!t)return;let n=t;if(n.type!==`server-request`||typeof n.rpcId!=`string`||typeof n.method!=`string`)return;let r=n.payload;if(typeof r!=`object`||!r)return;let i=r.type;if(!(typeof i!=`string`||!Nn.has(i))){if(i===`session/event`){let e=r.event;if(typeof e!=`object`||!e)return}return{frame:r,rpcId:n.rpcId}}}function Fn(e){return e instanceof u?e.message===`HTTP 403`||e.message===`HTTP 401`||e.message.includes(`unpaired`):!1}var In=class{sourceFactory;pollLatest;pollIntervalMs;stallThresholdMs;now;onUnpaired;listeners=new Set;cachedJobsBySession=new Map;cachedQueueBySession=new Map;runningSessionIds=new Set;source;stopped=!1;paused=!1;url;lastEventSeqBySession=new Map;observeSessionId;lastDataAt=0;sseAlive=!1;pollWatermark=new Map;tickTimer;polling=!1;nextPollAt=0;pollDelayMs;constructor(e=`/m/api/events.mux`,t={}){this.url=e,this.sourceFactory=t.sourceFactory??Mn,this.pollLatest=t.pollLatest??((e,t)=>M(e,t,50)),this.pollIntervalMs=t.pollIntervalMs??3e3,this.pollDelayMs=this.pollIntervalMs,this.stallThresholdMs=t.stallThresholdMs??12e3,this.now=t.now??(()=>Date.now()),this.onUnpaired=t.onUnpaired}start(){this.stopped=!1,this.paused=!1,this.lastDataAt=this.now(),this.source===void 0&&this.connect(),this.startTick()}stop(){this.stopped=!0,this.stopTick(),this.stopPolling(),this.closeSource(),this.observeSessionId=void 0,this.nextPollAt=0}pause(){this.stopped||this.paused||(this.paused=!0,this.stopTick(),this.stopPolling(),this.closeSource())}onFrame(e){return this.listeners.add(e),()=>{this.listeners.delete(e)}}isSseLive(){return!this.stopped&&!this.isSseStalled()}observe(e){let t=this.observeSessionId!==e;if(this.observeSessionId=e,e===void 0){this.stopPolling(),this.stopTick();return}if(this.startTick(),!this.paused){if(t){this.pollDelayMs=this.pollIntervalMs,this.nextPollAt=0;for(let t of this.pollWatermark.keys())t!==e&&this.pollWatermark.delete(t)}!this.polling&&!this.stopped&&this.isSseStalled()&&this.startPolling()}}poke(){this.stopped||this.paused||(this.pollDelayMs=this.pollIntervalMs,this.nextPollAt=0)}resync(){if(this.stopped)return;let e=this.paused;if(this.paused=!1,this.startTick(),e||this.now()-this.lastDataAt>this.stallThresholdMs){this.closeSource(),this.connect(),this.observeSessionId!==void 0&&this.startPolling();return}this.poke()}connect(){this.sseAlive=!1;let e=this.sourceFactory(this.url);this.source=e,e.onmessage=e=>{this.handleMessage(e.data)},e.onerror=()=>{if(this.stopped&&this.source===e){this.closeSource();return}this.sseAlive=!1,this.observeSessionId!==void 0&&this.startPolling()}}startTick(){if(this.tickTimer!==void 0)return;let e=Math.min(this.pollIntervalMs,1e3);this.tickTimer=setInterval(()=>{this.tick()},e)}stopTick(){this.tickTimer!==void 0&&(clearInterval(this.tickTimer),this.tickTimer=void 0)}tick(){if(!this.stopped&&this.observeSessionId!==void 0){if(this.polling){this.now()>=this.nextPollAt&&(this.nextPollAt=1/0,this.pollTick());return}this.isSseStalled()&&this.startPolling()}}isSseStalled(){let e=this.sseAlive?this.stallThresholdMs*3:this.stallThresholdMs;return this.now()-this.lastDataAt>e}startPolling(){this.polling||this.stopped||this.paused||(this.polling=!0,this.pollDelayMs=this.pollIntervalMs,this.nextPollAt=1/0,this.pollTick())}stopPolling(){this.polling=!1,this.pollDelayMs=this.pollIntervalMs,this.nextPollAt=0}async pollTick(){let e=this.observeSessionId;if(e===void 0){this.stopPolling();return}let t=0,n=e=>{let t=e?.event?.seq;return typeof t==`number`?t:-1};try{let r=this.pollWatermark.get(e)??-1,i=r>=0,a=r,o=1/0,s,c=[],l=!1;for(let u=0;u<10;u+=1){if(this.observeSessionId!==e){l=!0,c.length=0;break}let u=[...(s===void 0?await this.pollLatest(e):await this.pollLatest(e,s)).events].sort((e,t)=>n(e)-n(t)),d=0;for(let t of u){let i=n(t);i<=r||i>=o||(i>a&&(a=i),d+=1,c.push({seq:i,frame:{type:`session/event`,sessionId:e,event:t.event}}))}t+=d;let f=u.length>0?n(u[0]??{event:void 0}):-1;if(d===0||f===-1||!i){l=!0;break}if(f<=r+1){l=!0;break}o=f,s=f}l?this.pollWatermark.set(e,a):console.warn(`poll gap refill hit the 10-page cap; events above seq ${r} will be re-fetched next poll`),c.sort((e,t)=>e.seq-t.seq);for(let e of c)this.emit(e.frame)}catch(e){if(Fn(e)){this.stop(),this.onUnpaired?.();return}}finally{this.pollDelayMs=t>0?this.pollIntervalMs:Math.min(6e4,this.pollDelayMs+this.pollIntervalMs),this.polling&&this.observeSessionId===e&&(this.nextPollAt=this.now()+this.pollDelayMs)}}handleMessage(e){if(typeof e!=`string`||e===``)return;let t=Pn(e);if(t===void 0)return;let n=t.frame,r=n.event?.seq;if(an()&&(on(`recv`,{seq:typeof r==`number`?r:void 0,frame:n.type}),n.type===`session/event`&&typeof r==`number`)){let e=n.sessionId;if(e!==void 0){let t=this.lastEventSeqBySession.get(e);t!==void 0&&r>t+1&&sn(`seq-gap`,`session=${e} last=${t} got=${r}`),this.lastEventSeqBySession.set(e,r)}}this.sseAlive=!0,this.lastDataAt=this.now(),this.polling&&this.stopPolling(),n.type===`session/jobs`&&this.rememberJobs(n),n.type===`session/queue`&&this.rememberQueue(n),n.type===`session/subscribed`&&this.rememberSubscribed(n),this.trackTurnState(n),this.emit(n,t.rpcId)}trackTurnState(e){if(e.type!==`session/event`)return;let t=e.event?.type,n=String(e.sessionId);t===`turn/start`?this.runningSessionIds.add(n):t===`turn/end`&&this.runningSessionIds.delete(n)}runningSessionsSnapshot(){return[...this.runningSessionIds]}rememberJobs(e){let t=String(e.sessionId);if(this.cachedJobsBySession.size>=64&&!this.cachedJobsBySession.has(t)){let e=this.cachedJobsBySession.keys().next().value;e!==void 0&&this.cachedJobsBySession.delete(e)}this.cachedJobsBySession.set(t,e.jobs)}cachedJobsFor(e){return this.cachedJobsBySession.get(e)}jobsSnapshot(){let e=[];for(let[t,n]of this.cachedJobsBySession)e.push({sessionId:t,jobs:n});return e}liveJobCount(){let e=0;for(let t of this.cachedJobsBySession.values())for(let n of t)(n.status===`running`||n.status===`stopping`)&&(e+=1);return e}rememberQueue(e){let t=String(e.sessionId),n=(e.items??[]).map(e=>le({id:String(e.id),placement:e.placement,message:e.message}));this.cachedQueueBySession.set(t,n)}rememberSubscribed(e){let t=String(e.sessionId);this.cachedQueueBySession.delete(t),this.cachedJobsBySession.delete(t)}cachedQueueFor(e){return this.cachedQueueBySession.get(e)}emit(e,t){for(let n of this.listeners)try{n(e,t)}catch{}}closeSource(){let e=this.source;if(this.source=void 0,e!==void 0){e.onmessage=null,e.onerror=null;try{e.close()}catch{}}}};const Ln=`dsh.palm.fontScale`,Rn=`dsh.palm.density`,zn=`dsh.palm.lineNumbers`,Bn=`dsh.palm.autoScroll`;function Vn(e){try{let t=localStorage.getItem(e);return t===``?void 0:t??void 0}catch{return}}function Hn(e,t){try{localStorage.setItem(e,t)}catch{}}function Un(){let e=Vn(Ln);return e===`small`||e===`large`?e:`standard`}function Wn(e){Hn(Ln,e),$n()}const Gn={small:`小`,standard:`标准`,large:`大`};function Kn(){return Vn(Rn)===`compact`?`compact`:`cozy`}function qn(e){Hn(Rn,e),$n()}const Jn={compact:`紧凑`,cozy:`舒适`};function Yn(){return Vn(zn)===`1`}function Xn(e){Hn(zn,e?`1`:`0`),$n()}function Zn(){return Vn(Bn)!==`0`}function Qn(e){Hn(Bn,e?`1`:`0`)}function $n(){if(typeof document>`u`)return;let e=document.documentElement,t=Un();t===`standard`?delete e.dataset.fontScale:e.dataset.fontScale=t;let n=Kn();n===`cozy`?delete e.dataset.density:e.dataset.density=n,Yn()?e.dataset.lineNumbers=`1`:delete e.dataset.lineNumbers}const er=`dsh.palm.haptics`;function tr(){return Vn(er)!==`0`}function nr(e){Hn(er,e?`1`:`0`)}function rr(){if(tr())try{typeof navigator<`u`&&typeof navigator.vibrate==`function`&&navigator.vibrate(15)}catch{}}let ir;function ar(){return typeof Notification<`u`}function or(){return ar()?Notification.permission:`unsupported`}async function sr(){return ar()?await Notification.requestPermission():`unsupported`}function cr(){return typeof navigator<`u`&&navigator.serviceWorker!==void 0&&typeof PushManager<`u`}async function lr(){if(cr())return await(await navigator.serviceWorker.ready).pushManager.getSubscription()??void 0}async function ur(){if(!cr()||Notification.permission!==`granted`)return!1;let e=await x();if(e.vapidPublicKey===void 0)return!1;let t=await(await navigator.serviceWorker.ready).pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:fr(e.vapidPublicKey)}),n=t.getKey(`p256dh`),r=t.getKey(`auth`);return await w({endpoint:t.endpoint,keys:{p256dh:n===null?``:pr(n),auth:r===null?``:pr(r)}}),!0}async function dr(){if(!cr())return;let e=await(await navigator.serviceWorker.ready).pushManager.getSubscription();e!==null&&await e.unsubscribe(),await T()}function fr(e){let t=(e+`=`.repeat((4-e.length%4)%4)).replace(/-/g,`+`).replace(/_/g,`/`),n=atob(t),r=new Uint8Array(n.length);for(let e=0;e<n.length;e++)r[e]=n.charCodeAt(e);return r}function pr(e){let t=new Uint8Array(e),n=``;for(let e of t)n+=String.fromCharCode(e);return btoa(n).replace(/\+/g,`-`).replace(/\//g,`_`).replace(/=+$/,``)}function mr(){ir!==void 0||!ar()||Notification.permission===`granted`&&(typeof document<`u`&&document.visibilityState===`visible`||(ir=new EventSource(`/m/api/events.notify`),ir.onmessage=e=>{try{let t=JSON.parse(e.data);if(t.type!==`notify`)return;_r(t.payload)}catch{}},ir.onerror=()=>{}))}function hr(){ir?.close(),ir=void 0}function gr(e){let t=new URL(`/m/`,window.location.origin);return e.workspaceId!==void 0&&t.searchParams.set(`workspace`,e.workspaceId),t.searchParams.set(`session`,e.sessionId),t.toString()}function _r(e){if(document.visibilityState===`visible`)return;rr();let t=new Notification(e.title,{body:e.body,tag:e.id,data:{sessionId:e.sessionId,workspaceId:e.workspaceId}});t.onclick=()=>{t.close(),window.focus(),window.location.href=gr(e)}}function vr(){return typeof document>`u`||document.visibilityState!==`hidden`}function yr(e){if(typeof document>`u`)return()=>{};let t=()=>{e(vr())};return document.addEventListener(`visibilitychange`,t),()=>{document.removeEventListener(`visibilitychange`,t)}}function br(){let[e,t]=(0,c.useState)(vr);return(0,c.useEffect)(()=>yr(t),[]),e}const xr=`dsh.remote.theme`;let Sr=wr()??`system`;const Cr=new Set;function wr(){try{let e=localStorage.getItem(xr);return e===`dark`||e===`light`||e===`system`?e:void 0}catch{return}}function Tr(e){try{localStorage.setItem(xr,e)}catch{}}function Er(){return typeof window<`u`&&typeof window.matchMedia==`function`&&window.matchMedia(`(prefers-color-scheme: dark)`).matches}function Dr(e=Sr){return e===`system`?Er()?`dark`:`light`:e}function Or(e){if(typeof document>`u`)return;document.documentElement.dataset.theme=e;let t=document.querySelector(`meta[name="theme-color"]`);t!==null&&(t.content=Dr(e)===`dark`?`#0a0a0f`:`#f5f5f7`)}const kr={media:void 0,onChange:void 0,sync(){let e=Sr===`system`&&typeof window<`u`&&typeof window.matchMedia==`function`;e&&this.media===void 0?(this.media=window.matchMedia(`(prefers-color-scheme: dark)`),this.onChange=()=>{Or(Sr);for(let e of[...Cr])e()},typeof this.media.addEventListener==`function`?this.media.addEventListener(`change`,this.onChange):typeof this.media.addListener==`function`&&this.media.addListener(this.onChange)):!e&&this.media!==void 0&&(typeof this.media.removeEventListener==`function`&&this.onChange!==void 0&&this.media.removeEventListener(`change`,this.onChange),this.media=void 0,this.onChange=void 0)}};function Ar(){return Sr}function jr(){return Dr()}function Mr(e){return Cr.add(e),()=>{Cr.delete(e)}}function Nr(e){if(e!==Sr){Sr=e,Tr(e),kr.sync(),Or(e);for(let e of[...Cr])e()}}function Pr(){let e=Dr()===`light`?`dark`:`light`;return Nr(e),e}function Fr(e){Nr(e)}function Ir(){kr.sync(),Or(Sr)}const Lr=new Map;function Rr(e){for(let[t,n]of Lr){let r=n.rows.filter(t=>t.sessionId!==e);r.length!==n.rows.length&&(Lr.set(t,{...n,rows:r}),si(t,{rows:r,cursor:n.cursor,hasMore:n.hasMore}))}xi(e),Ei(e)}const zr=`dsh-palm.list.v1.`,Br=`dsh-palm.prev.v1`,Vr=`dsh-palm.scroll.v1.`,Hr=`dsh-palm.draft.v1.`,Ur=`dsh-palm.reading.v2.`,Wr=`dsh-palm.reading.v1.`,Gr=`dsh-palm.cache-index.v1`,Kr=864e5;function qr(){return Br}function Jr(e){if(e!==null)try{return JSON.parse(e)}catch{return}}function Yr(e,t){try{localStorage.setItem(e,t),Xr(e)}catch{}}function Xr(e){try{let t=Jr(localStorage.getItem(Gr))??[];if(t.includes(e))return;t.push(e),localStorage.setItem(Gr,JSON.stringify(t))}catch{}}function Zr(){return Jr(ei(Gr))??[]}function Qr(e){if(e.length!==0){for(let t of e)try{localStorage.removeItem(t)}catch{}try{let t=Zr().filter(t=>!e.includes(t));localStorage.setItem(Gr,JSON.stringify(t))}catch{}}}function $r(){return typeof localStorage<`u`}function ei(e){try{return localStorage.getItem(e)}catch{return null}}const ti=new Map;let ni,ri=!1;function ii(){ri||typeof document>`u`||(ri=!0,document.addEventListener(`pagehide`,()=>{ai()}),document.addEventListener(`visibilitychange`,()=>{document.visibilityState===`hidden`&&ai()}))}function W(e,t){ti.set(e,t),ii(),ni===void 0&&(ni=setTimeout(()=>{ai()},5e3))}function ai(){if(ni!==void 0&&(clearTimeout(ni),ni=void 0),ti.size===0)return;let e=[...ti.values()];ti.clear();for(let t of e)t()}function oi(){ni!==void 0&&(clearTimeout(ni),ni=void 0),ti.clear()}function si(e,t){W(`${zr}${e}`,()=>{ui(e,t)})}function ci(e){if(e.size===0)return;let t=new Map(e);W(qr(),()=>{mi(t)})}function li(e){if(!$r())return;let t=Jr(ei(zr+e));if(!(t===void 0||t.v!==1||!Array.isArray(t.rows))&&!t.rows.some(e=>typeof e!=`object`||!e||typeof e.sessionId!=`string`)&&!(Date.now()-t.savedAt>Kr))return t}function ui(e,t){Yr(zr+e,JSON.stringify({v:1,...t,savedAt:Date.now()}))}function di(e){if(!$r())return 0;let t=Number(ei(Vr+e)??``);return Number.isFinite(t)&&t>0?t:0}function fi(e,t){Yr(Vr+e,String(Math.max(0,t)))}function pi(){let e=new Map;if(!$r())return e;let t=Jr(ei(qr()));if(t===void 0)return e;for(let[n,r]of Object.entries(t))typeof n==`string`&&typeof r==`string`&&r!==``&&e.set(n,r);return e}function mi(e){if(!$r()||e.size===0)return;let t={};for(let[n,r]of e)t[n]=r;let n=JSON.stringify(t);for(;Object.keys(t).length>500||n.length>524288;){let e=Object.keys(t)[0];if(e===void 0)break;delete t[e],n=JSON.stringify(t)}Yr(qr(),n)}const hi=`dsh-palm.pin.v1`;function gi(){if(!$r())return new Set;let e=Jr(ei(hi));return Array.isArray(e)?new Set(e.filter(e=>typeof e==`string`)):new Set}function _i(e){Yr(hi,JSON.stringify([...e]))}const vi=6048e5;function yi(e){if(!$r())return``;let t=Jr(ei(Hr+e));return t===void 0||typeof t.v!=`string`||Date.now()-t.t>vi?``:t.v}function bi(e,t){if(t===``){xi(e);return}Yr(Hr+e,JSON.stringify({t:Date.now(),v:t.slice(0,4096)})),Si()}function xi(e){Qr([Hr+e])}function Si(){let e=Zr().filter(e=>e.startsWith(Hr));e.length<=50||Qr(e.map(e=>({key:e,t:Jr(ei(e))?.t??0})).sort((e,t)=>e.t-t.t).slice(0,e.length-50).map(e=>e.key))}const Ci=6048e5;function wi(e){if(!$r())return;let t=Jr(ei(Ur+e));if(!(t===void 0||typeof t.v!=`number`||t.v<=0)&&!(Date.now()-t.t>Ci))return t.v}function Ti(e,t){t<=0||(Yr(Ur+e,JSON.stringify({t:Date.now(),v:t})),Di())}function Ei(e){Qr([Ur+e])}function Di(){let e=Zr().filter(e=>e.startsWith(Ur));e.length<=50||Qr(e.map(e=>({key:e,t:Jr(ei(e))?.t??0})).sort((e,t)=>e.t-t.t).slice(0,e.length-50).map(e=>e.key))}function Oi(){$r()&&(oi(),Qr(Zr().filter(e=>e.startsWith(zr)||e.startsWith(Vr)||e.startsWith(Hr)||e.startsWith(Ur)||e.startsWith(Wr)||e===Br||e===hi)))}function ki(){if(!$r())return;let e=Date.now();Qr(Zr().filter(t=>{if(t.startsWith(Wr))return!0;if(t.startsWith(zr)){let n=Jr(ei(t));return n===void 0||e-n.savedAt>Kr}if(t.startsWith(Hr)){let n=Jr(ei(t));return n===void 0||e-n.t>vi}if(t.startsWith(Ur)){let n=Jr(ei(t));return n===void 0||e-n.t>Ci}return!1}))}const Ai=`history`;function ji(){return new Promise((e,t)=>{if(typeof indexedDB>`u`){t(Error(`indexedDB unavailable`));return}let n=indexedDB.open(`dsh-palm`,2);n.onupgradeneeded=()=>{let e=n.result;e.objectStoreNames.contains(`outbox`)||e.createObjectStore(`outbox`,{keyPath:`id`}),e.objectStoreNames.contains(Ai)||e.createObjectStore(Ai,{keyPath:`key`})},n.onsuccess=()=>{e(n.result)},n.onerror=()=>{t(n.error??Error(`indexedDB open failed`))}})}async function Mi(e){try{let t=await ji();try{let n=await new Promise((n,r)=>{let i=t.transaction(Ai,`readonly`).objectStore(Ai).get(e);i.onsuccess=()=>{n(i.result)},i.onerror=()=>{r(i.error??Error(`indexedDB read failed`))}});return n===void 0||n.v!==1||Date.now()-n.savedAt>864e5?void 0:n.page}finally{t.close()}}catch{return}}async function Ni(e,t){let n=!1;try{let r=await ji();try{await new Promise((n,i)=>{let a=r.transaction(Ai,`readwrite`);a.objectStore(Ai).put({key:e,v:1,savedAt:Date.now(),page:t}),a.oncomplete=()=>{n()},a.onerror=()=>{i(a.error??Error(`indexedDB write failed`))},a.onabort=()=>{i(a.error??Error(`indexedDB write aborted`))}}),await Pi(r),n=!0}finally{r.close()}}catch{}n&&Yt()}async function Pi(e){try{let t=await new Promise((t,n)=>{let r=e.transaction(Ai,`readonly`).objectStore(Ai).getAll();r.onsuccess=()=>{t((r.result??[]).map(e=>({key:e.key,savedAt:e.savedAt})))},r.onerror=()=>{n(r.error??Error(`indexedDB read failed`))}});if(t.length<=50)return;let n=t.sort((e,t)=>e.savedAt-t.savedAt).slice(0,t.length-50).map(e=>e.key);await new Promise((t,r)=>{let i=e.transaction(Ai,`readwrite`),a=i.objectStore(Ai);for(let e of n)a.delete(e);i.oncomplete=()=>{t()},i.onerror=()=>{r(i.error??Error(`indexedDB trim failed`))},i.onabort=()=>{r(i.error??Error(`indexedDB trim aborted`))}})}catch{}}async function Fi(){try{let e=await ji();try{await new Promise((t,n)=>{let r=e.transaction(Ai,`readwrite`);r.objectStore(Ai).clear(),r.oncomplete=()=>{t()},r.onerror=()=>{n(r.error??Error(`indexedDB clear failed`))},r.onabort=()=>{n(r.error??Error(`indexedDB clear aborted`))}})}finally{e.close()}}catch{}}function Ii({send:e,delayMs:t=2e3}){let n=new Set,r=[],i,a=!1,o=()=>{i=void 0;let t=r;r=[];for(let r of t)if(!n.has(r)){n.add(r);try{e(r)}catch{}}},s=()=>{a||(i!==void 0&&clearTimeout(i),i=setTimeout(o,t))},c=Nt(e=>{n.has(e)||(r.includes(e)||r.push(e),s())});return()=>{a=!0,c(),i!==void 0&&clearTimeout(i),i=void 0}}
/**
* @license React
* react-jsx-runtime.production.min.js
*
* Copyright (c) Facebook, Inc. and its affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var Li=e((e=>{var t=n(),r=Symbol.for(`react.element`),i=Symbol.for(`react.fragment`),a=Object.prototype.hasOwnProperty,o=t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,s={key:!0,ref:!0,__self:!0,__source:!0};function c(e,t,n){var i,c={},l=null,u=null;for(i in n!==void 0&&(l=``+n),t.key!==void 0&&(l=``+t.key),t.ref!==void 0&&(u=t.ref),t)a.call(t,i)&&!s.hasOwnProperty(i)&&(c[i]=t[i]);if(e&&e.defaultProps)for(i in t=e.defaultProps,t)c[i]===void 0&&(c[i]=t[i]);return{$$typeof:r,type:e,key:l,ref:u,props:c,_owner:o.current}}e.Fragment=i,e.jsx=c,e.jsxs=c})),G=e(((e,t)=>{t.exports=Li()}))();const Ri=[],zi=new Set;let Bi=1;function Vi(){for(let e of[...zi])e([...Ri])}function K(e){let t=Bi++;Ri.push({id:t,text:e,leaving:!1}),Vi(),setTimeout(()=>{let e=Ri.find(e=>e.id===t);e!==void 0&&(e.leaving=!0,Vi(),setTimeout(()=>{let e=Ri.findIndex(e=>e.id===t);e!==-1&&(Ri.splice(e,1),Vi())},200))},2200)}function Hi(){let[e,t]=(0,c.useState)(Ri);return(0,c.useEffect)(()=>(zi.add(t),()=>{zi.delete(t)}),[]),e.length===0?null:(0,G.jsx)(`div`,{className:`toast-host`,role:`status`,"aria-live":`polite`,children:e.map(e=>(0,G.jsx)(`div`,{className:`toast`+(e.leaving?` toast-out`:``),children:e.text},e.id))})}const q=new Set([`image/jpeg`,`image/png`,`image/webp`,`image/gif`]);function Ui(e){return q.has(e)}const Wi=262144;function Gi(e,t){let n=/^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/s.exec(e);if(n)return{type:`image`,mediaType:n[1],data:n[2],name:t}}function Ki(e,t){let n=[];e.trim()!==``&&n.push({type:`text`,text:e});for(let e of t){let t=Gi(e.dataUrl,e.name);t!==void 0&&n.push(t)}return n}async function qi(e,t=Wi){let n=await Ji(e);if(!Ui(e.type))return{image:{dataUrl:n,mediaType:e.type,name:e.name},failed:!0};try{return{image:{dataUrl:await Xi(n,e.type,t),mediaType:`image/jpeg`,name:e.name},failed:!1}}catch{return{image:{dataUrl:n,mediaType:e.type,name:e.name},failed:!0}}}function Ji(e){return new Promise((t,n)=>{let r=new FileReader;r.onload=()=>t(String(r.result??``)),r.onerror=()=>n(r.error??Error(`read failed`)),r.readAsDataURL(e)})}function Yi(){return new Promise(e=>{setTimeout(e,0)})}function Xi(e,t,n=Wi){return new Promise((t,r)=>{let i=new Image;i.onload=async()=>{try{let a=document.createElement(`canvas`),o=a.getContext(`2d`);if(o===null){r(Error(`canvas 2d unavailable`));return}let s=Math.max(i.width,i.height),c=Math.min(1,1600/s),l=Math.max(1,Math.round(i.width*c)),u=Math.max(1,Math.round(i.height*c)),d=.9,f=e;for(;;){a.width=l,a.height=u,o.clearRect(0,0,l,u),o.drawImage(i,0,0,l,u);let e=a.toDataURL(`image/jpeg`,d);if(e.length<=n||l<=16||u<=16){f=e;break}d>.5?d-=.1:(l=Math.max(16,Math.round(l*.9)),u=Math.max(16,Math.round(u*.9))),await Yi()}t(f)}catch(e){r(e)}},i.onerror=()=>r(Error(`image decode failed`)),i.src=e})}function Zi(e,t=4){let n=e?.items;if(n===void 0)return[];let r=[];for(let e=0;e<n.length&&r.length<t;e++){let t=n[e];if(t.kind===`file`&&t.type.startsWith(`image/`)){let e=t.getAsFile();e!==null&&r.push(e)}}return r}const Qi=new Set;function $i(e=64){let t=new Map;return{store:t,note(n,r){let i=t.get(n);for(i===void 0&&(i=new Set,t.set(n,i)),i.add(r);i.size>e;){let e=i.values().next().value;if(e===void 0)break;i.delete(e)}},forSession(e){return t.get(e)??Qi},clear(){t.clear()}}}const ea=$i();function ta(e,t){ea.note(e,t)}function na(e){return ea.forSession(e)}function ra(e){if(e.length===0)return[];let t=e[e.length-1].rpcId;return e.filter(e=>e.rpcId===t)}function ia(e,t,n){let r=t.filter(e=>!n.has(e.rpcId));if(r.length>0)return r;let i=e.filter(e=>!n.has(e.rpcId));return i.length===e.length?e:i}const aa=$i();function oa(e,t){aa.note(e,t)}function sa(e){return aa.forSession(e)}function ca(e,t,n){let r=t.filter(e=>!n.has(e.approvalId));if(r.length>0)return r;let i=e.filter(e=>!n.has(e.approvalId));return i.length===e.length?e:i}function la({title:e,onClose:t,children:n}){let[r,i]=(0,c.useState)(0),[a,o]=(0,c.useState)(!1),s=(0,c.useRef)(!1),l=(0,c.useRef)(0),u=(0,c.useRef)(0);return(0,c.useEffect)(()=>{let e=e=>{e.key===`Escape`&&t()};return window.addEventListener(`keydown`,e),()=>{window.removeEventListener(`keydown`,e)}},[t]),(0,c.useEffect)(()=>{let e=document.body.style.overflow;return document.body.style.overflow=`hidden`,()=>{document.body.style.overflow=e}},[]),(0,G.jsx)(`div`,{className:`sheet-backdrop`,onClick:t,children:(0,G.jsxs)(`div`,{className:`sheet`+(a?` sheet-full`:``),role:`dialog`,"aria-modal":`true`,"aria-label":e,style:r>0?{transform:`translateY(${r}px)`,transition:`none`}:void 0,onClick:e=>{e.stopPropagation()},children:[(0,G.jsxs)(`div`,{className:`sheet-grab`,onTouchStart:e=>{s.current=!0,u.current=0,l.current=e.touches[0]?.clientY??0},onTouchMove:e=>{if(!s.current)return;let t=(e.touches[0]?.clientY??0)-l.current;u.current=t,i(a?Math.max(0,t):t)},onTouchEnd:()=>{if(!s.current)return;s.current=!1;let e=u.current;u.current=0,e>80?t():!a&&e<-40&&o(!0),i(0)},children:[(0,G.jsx)(`div`,{className:`sheet-handle`,"aria-hidden":!0,onClick:()=>{t()}}),(0,G.jsx)(`div`,{className:`sheet-title`,children:e})]}),(0,G.jsx)(`div`,{className:`sheet-body`,children:n})]})})}function J(e){return{viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:1.8,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":!0,focusable:!1,...e}}function ua(e){return(0,G.jsxs)(`svg`,{...J(e),children:[(0,G.jsx)(`circle`,{cx:`11`,cy:`11`,r:`7`}),(0,G.jsx)(`path`,{d:`m20 20-3.8-3.8`})]})}function da(e){return(0,G.jsxs)(`svg`,{...J(e),children:[(0,G.jsx)(`path`,{d:`M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6`}),(0,G.jsx)(`path`,{d:`M10 19a2 2 0 0 0 4 0`})]})}function fa(e){return(0,G.jsxs)(`svg`,{...J(e),children:[(0,G.jsx)(`path`,{d:`M12 17v5`}),(0,G.jsx)(`path`,{d:`M9 3h6l-1 7 3.5 3H5.5L9 10Z`})]})}function pa(e){return(0,G.jsxs)(`svg`,{...J(e),children:[(0,G.jsx)(`circle`,{cx:`12`,cy:`12`,r:`9`}),(0,G.jsx)(`path`,{d:`M12 7v5l3.5 2`})]})}function ma(e){return(0,G.jsx)(`svg`,{...J(e),children:(0,G.jsx)(`path`,{d:`M3 7.5A2.5 2.5 0 0 1 5.5 5h4l2 2.5h7A2.5 2.5 0 0 1 21 10v7a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17Z`})})}function ha(e){return(0,G.jsxs)(`svg`,{...J(e),children:[(0,G.jsx)(`path`,{d:`M3 7.5A2.5 2.5 0 0 1 5.5 5h4l2 2.5h7A2.5 2.5 0 0 1 21 10v7a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17Z`}),(0,G.jsx)(`path`,{d:`M12 10.5v5M9.5 13h5`})]})}function ga(e){return(0,G.jsx)(`svg`,{...J(e),children:(0,G.jsx)(`path`,{d:`M21 12a8 8 0 0 1-8 8H4l2.2-3.3A8 8 0 1 1 21 12Z`})})}function _a(e){return(0,G.jsx)(`svg`,{...J(e),strokeWidth:2.2,children:(0,G.jsx)(`path`,{d:`M12 5v14M5 12h14`})})}function va(e){return(0,G.jsx)(`svg`,{...J(e),children:(0,G.jsx)(`path`,{d:`m6 14 6-6 6 6`})})}function ya(e){return(0,G.jsx)(`svg`,{...J(e),children:(0,G.jsx)(`path`,{d:`m6 10 6 6 6-6`})})}function ba(e){return(0,G.jsx)(`svg`,{...J(e),strokeWidth:2,children:(0,G.jsx)(`path`,{d:`M5 12h13M13 6.5 18.5 12 13 17.5`})})}function xa(e){return(0,G.jsxs)(`svg`,{...J(e),children:[(0,G.jsx)(`path`,{d:`M3 13.5 5.7 5.6A1.5 1.5 0 0 1 7.1 4.5h9.8a1.5 1.5 0 0 1 1.4 1.1L21 13.5V18a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18Z`}),(0,G.jsx)(`path`,{d:`M3 13.5h5l1 2h6l1-2h5`})]})}function Sa(e){return(0,G.jsxs)(`svg`,{...J(e),children:[(0,G.jsx)(`path`,{d:`M4 8h10M18 8h2M4 16h4M12 16h8`}),(0,G.jsx)(`circle`,{cx:`16`,cy:`8`,r:`2.2`}),(0,G.jsx)(`circle`,{cx:`10`,cy:`16`,r:`2.2`})]})}function Ca(e){return(0,G.jsxs)(`svg`,{...J(e),children:[(0,G.jsx)(`circle`,{cx:`12`,cy:`12`,r:`9`}),(0,G.jsx)(`path`,{d:`M12 3a9 9 0 0 1 0 18Z`,fill:`currentColor`,stroke:`none`})]})}function wa(e){return(0,G.jsxs)(`svg`,{...J(e),children:[(0,G.jsx)(`circle`,{cx:`12`,cy:`12`,r:`9`}),(0,G.jsx)(`path`,{d:`M9.6 9.2a2.5 2.5 0 1 1 3.4 2.9c-.7.3-1 .8-1 1.6`}),(0,G.jsx)(`path`,{d:`M12 17h.01`})]})}function Ta(e){return(0,G.jsxs)(`svg`,{...J(e),children:[(0,G.jsx)(`path`,{d:`M4 7h16M9 7V5h6v2M6.5 7l1 12.2a1.5 1.5 0 0 0 1.5 1.3h6a1.5 1.5 0 0 0 1.5-1.3l1-12.2`}),(0,G.jsx)(`path`,{d:`M10 11v5M14 11v5`})]})}function Ea(e){return(0,G.jsx)(`svg`,{...J(e),children:(0,G.jsx)(`path`,{d:`M5 19 11 5h2l6 14M7.5 14h9`})})}function Da(e){return(0,G.jsxs)(`svg`,{...J(e),children:[(0,G.jsx)(`rect`,{x:`4`,y:`5`,width:`16`,height:`5`,rx:`1.5`}),(0,G.jsx)(`rect`,{x:`4`,y:`14`,width:`16`,height:`5`,rx:`1.5`})]})}function Oa(e){return(0,G.jsx)(`svg`,{...J(e),children:(0,G.jsx)(`path`,{d:`M5 9h14M5 15h14M10 4 8 20M16 4l-2 16`})})}function ka(e){return(0,G.jsxs)(`svg`,{...J(e),children:[(0,G.jsx)(`path`,{d:`M12 4v11M7.5 11 12 15.5 16.5 11`}),(0,G.jsx)(`path`,{d:`M5 19.5h14`})]})}function Aa(e){return(0,G.jsxs)(`svg`,{...J(e),children:[(0,G.jsx)(`rect`,{x:`9`,y:`3`,width:`6`,height:`18`,rx:`1.5`}),(0,G.jsx)(`path`,{d:`M11 18h2`}),(0,G.jsx)(`path`,{d:`M5.5 9.5v5M3.5 11v2M18.5 9.5v5M20.5 11v2`})]})}function ja(e){return(0,G.jsxs)(`svg`,{...J(e),children:[(0,G.jsx)(`circle`,{cx:`12`,cy:`12`,r:`9`}),(0,G.jsx)(`path`,{d:`M12 11v5M12 8h.01`})]})}function Ma(e){return(0,G.jsx)(`svg`,{...J(e),strokeWidth:2.4,children:(0,G.jsx)(`path`,{d:`M5.5 12h.01M12 12h.01M18.5 12h.01`})})}function Na(e){return(0,G.jsxs)(`svg`,{...J(e),children:[(0,G.jsx)(`rect`,{x:`9`,y:`9`,width:`11`,height:`11`,rx:`2`}),(0,G.jsx)(`path`,{d:`M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5`})]})}function Pa(e){return(0,G.jsxs)(`svg`,{...J(e),children:[(0,G.jsx)(`path`,{d:`m14.5 5.5 4 4L8 20l-4.6 1L4.5 16Z`}),(0,G.jsx)(`path`,{d:`m12.5 7.5 4 4`})]})}function Fa(e){return(0,G.jsx)(`svg`,{...J(e),strokeWidth:2,children:(0,G.jsx)(`path`,{d:`m5 12.5 4.5 4.5L19 7.5`})})}function Ia(e){return(0,G.jsxs)(`svg`,{...J(e),children:[(0,G.jsx)(`rect`,{x:`9`,y:`3`,width:`6`,height:`11`,rx:`3`}),(0,G.jsx)(`path`,{d:`M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6`})]})}function La(e){return(0,G.jsx)(`svg`,{...J(e),strokeWidth:2,children:(0,G.jsx)(`path`,{d:`m6 6 12 12M18 6 6 18`})})}function Ra(e){return(0,G.jsxs)(`svg`,{...J(e),children:[(0,G.jsx)(`path`,{d:`M12 4v9`}),(0,G.jsx)(`path`,{d:`M7.5 9.5 12 14l4.5-4.5`}),(0,G.jsx)(`path`,{d:`M5 19h14`})]})}function za(e){return(0,G.jsxs)(`svg`,{...J(e),children:[(0,G.jsx)(`path`,{d:`M14 4h6v6`}),(0,G.jsx)(`path`,{d:`M20 4 11 13`}),(0,G.jsx)(`path`,{d:`M19 14v5a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4 19V7a1.5 1.5 0 0 1 1.5-1.5H10`})]})}function Ba(e){return(0,G.jsx)(`svg`,{...J(e),children:(0,G.jsx)(`path`,{d:`M7 5.5v13l11-6.5Z`})})}function Va(e){return(0,G.jsxs)(`svg`,{...J(e),strokeWidth:1.7,children:[(0,G.jsx)(`rect`,{x:`6`,y:`6`,width:`12`,height:`12`,rx:`2`}),(0,G.jsx)(`rect`,{x:`10`,y:`10`,width:`4`,height:`4`,rx:`0.5`}),(0,G.jsx)(`path`,{d:`M9 2.5v3M15 2.5v3M9 18.5v3M15 18.5v3M2.5 9h3M2.5 15h3M18.5 9h3M18.5 15h3`})]})}function Ha(e){return(0,G.jsxs)(`svg`,{...J(e),strokeWidth:1.7,children:[(0,G.jsx)(`path`,{d:`M12 3 5 5.5v5.2c0 4.3 2.9 7.6 7 9.3 4.1-1.7 7-5 7-9.3V5.5Z`}),(0,G.jsx)(`path`,{d:`m9 11.5 2.2 2.2L15.5 9`})]})}function Ua(e){return(0,G.jsxs)(`svg`,{...J(e),strokeWidth:1.7,children:[(0,G.jsx)(`path`,{d:`M4.5 19a8.5 8.5 0 1 1 15 0`}),(0,G.jsx)(`path`,{d:`m12 16 2.6-3`}),(0,G.jsx)(`path`,{d:`M12 16v-3`})]})}const Wa={running:`运行中`,stopping:`停止中`,completed:`已完成`,killed:`已终止`,failed:`失败`},Ga={running:`running`,stopping:`stopping`,completed:`completed`,killed:`killed`,failed:`failed`},Ka={subagent:`子代理`,bash:`命令`,pwsh:`命令`,"pty-send":`终端`};function qa(e){return Ka[e]??e}function Ja(e){let t=new Date(e);return`${String(t.getHours()).padStart(2,`0`)}:${String(t.getMinutes()).padStart(2,`0`)}`}function Ya(e,t){let n=Math.max(0,Math.round((t-e)/1e3));return n<60?`${n} 秒`:`${Math.round(n/60)} 分钟`}function Xa({job:e}){let t=Ga[e.status]??`running`,n=e.finishedAt===void 0?`开始于 ${Ja(e.startedAt)}`:`${Ja(e.startedAt)} → ${Ja(e.finishedAt)} · 用时 ${Ya(e.startedAt,e.finishedAt)}`;return(0,G.jsxs)(`div`,{className:`chat-task-row`,role:`listitem`,children:[(0,G.jsx)(`span`,{className:`chat-task-dot chat-task-dot-${t}`,"aria-hidden":!0}),(0,G.jsxs)(`span`,{className:`chat-task-copy`,children:[(0,G.jsx)(`span`,{className:`chat-task-label`,children:e.label}),(0,G.jsxs)(`span`,{className:`chat-task-meta`,children:[qa(e.kind),` · `,Wa[e.status]??e.status,e.detail!==void 0&&e.detail!==``?` · ${e.detail}`:``]}),(0,G.jsx)(`span`,{className:`chat-task-time`,children:n})]})]})}const Za=8e3;async function Qa(e){let t;try{t=await ge(e)}catch{return}let n=[];for(let e of t.entries)e.kind===`child`&&n.push({id:e.id,label:e.label??e.id,activity:e.activity});return n}async function $a(e){return await Qa(e)??[]}function eo(e){return e.filter(e=>e.activity===`running`)}function to(e){let t=0;for(let n of e)n.activity===`running`&&(t+=1);return t}function no(e){return[...e].sort((e,t)=>Number(t.activity===`running`)-Number(e.activity===`running`))}const ro=new Set([`running`,`stopping`]);function io(e){let t=0;for(let n of e)ro.has(n.status)&&(t+=1);return t}function ao(e){let t=0;for(let n of e)n.status===`completed`&&(t+=1);return{done:t,total:e.length}}function oo({item:e}){return(0,G.jsxs)(`li`,{className:`chat-run-todo chat-run-todo-${e.status}`,children:[(0,G.jsx)(`span`,{className:`chat-run-todo-mark`,"aria-hidden":!0,children:e.status===`completed`?`✓`:e.status===`in_progress`?`●`:`○`}),(0,G.jsx)(`span`,{className:`chat-run-todo-content`,children:e.content})]})}function so({node:e}){let t=e.activity===`running`;return(0,G.jsxs)(`div`,{className:`chat-subagent-row`,role:`listitem`,children:[(0,G.jsx)(`span`,{className:`chat-subagent-dot`+(t?` chat-subagent-dot-running`:``),"aria-hidden":!0}),(0,G.jsxs)(`span`,{className:`chat-subagent-copy`,children:[(0,G.jsx)(`span`,{className:`chat-subagent-label`,children:e.label}),(0,G.jsx)(`span`,{className:`chat-subagent-meta`,children:t?`运行中`:`空闲`})]})]})}function co({nodes:e}){let[t,n]=(0,c.useState)(!1),r=(0,c.useMemo)(()=>no(e),[e]),i=Math.max(0,r.length-5),a=t||i===0?r:r.slice(0,5),o=to(e);return(0,G.jsxs)(`section`,{className:`chat-run-section`,"aria-label":`子代理`,children:[(0,G.jsxs)(`div`,{className:`chat-run-section-head`,children:[(0,G.jsx)(`span`,{className:`chat-run-section-title`,children:`子代理`}),(0,G.jsx)(`span`,{className:`chat-run-section-count`,children:o>0?`${o} 个运行中`:`${e.length} 个`})]}),(0,G.jsx)(`div`,{className:`chat-subagent-list`,role:`list`,"aria-label":`子代理列表`,children:a.map(e=>(0,G.jsx)(so,{node:e},e.id))}),i>0&&(0,G.jsx)(`button`,{type:`button`,className:`chat-run-fold`,onClick:()=>{n(e=>!e)},children:t?`收起`:`… 还有 ${i} 个子代理`})]})}function lo({todo:e,jobs:t,subagents:n,onOpen:r}){let i=(0,c.useMemo)(()=>{let r=[];if(e!==void 0&&e.items.length>0){let{done:t,total:n}=ao(e.items);r.push(`任务 ${t}/${n}`)}if(t.length>0){let e=io(t);r.push(e>0?`后台任务 ${e} 个运行中`:`后台任务 ${t.length} 个`)}let i=to(n);return i>0&&r.push(`子代理 ${i} 个运行中`),r},[e,t,n]);if(i.length===0)return null;let a=e!==void 0&&e.items.some(e=>e.status===`in_progress`)||io(t)>0||to(n)>0;return(0,G.jsxs)(`button`,{type:`button`,className:`chat-status-strip`,onClick:r,children:[(0,G.jsx)(`span`,{className:`chat-status-dot`+(a?` chat-status-dot-live`:``),"aria-hidden":!0}),(0,G.jsx)(`span`,{className:`chat-status-text`,children:i.join(` · `)})]})}function uo({todo:e,jobs:t,subagents:n,onClose:r}){let i=e!==void 0&&e.items.length>0;return!i&&t.length===0&&n.length===0?null:(0,G.jsxs)(la,{title:`运行状态`,onClose:r,children:[n.length>0&&(0,G.jsx)(co,{nodes:n}),i&&(0,G.jsxs)(`section`,{className:`chat-run-section`,"aria-label":`任务清单`,children:[(0,G.jsxs)(`div`,{className:`chat-run-section-head`,children:[(0,G.jsx)(`span`,{className:`chat-run-section-title`,children:`任务清单`}),(0,G.jsx)(`span`,{className:`chat-run-section-count`,children:(()=>{let{done:t,total:n}=ao(e.items);return`${t}/${n}`})()})]}),(0,G.jsx)(`ul`,{className:`chat-run-todo-list`,children:e.items.map((e,t)=>(0,G.jsx)(oo,{item:e},t))})]}),t.length>0&&(0,G.jsxs)(`section`,{className:`chat-run-section`,"aria-label":`后台任务`,children:[(0,G.jsxs)(`div`,{className:`chat-run-section-head`,children:[(0,G.jsx)(`span`,{className:`chat-run-section-title`,children:`后台任务`}),(0,G.jsx)(`span`,{className:`chat-run-section-count`,children:(()=>{let e=io(t);return e>0?`${e} 个运行中`:`${t.length} 个`})()})]}),(0,G.jsx)(`div`,{className:`chat-run-job-list`,role:`list`,"aria-label":`后台任务列表`,children:[...t].sort((e,t)=>Number(ro.has(t.status))-Number(ro.has(e.status))).map(e=>(0,G.jsx)(Xa,{job:e},e.id))})]})]})}function fo(e){if(window.self!==window.parent)try{window.parent.postMessage(e,window.location.origin)}catch{}}async function po(e,t=`已复制`){try{if(typeof navigator<`u`&&navigator.clipboard!==void 0)return await navigator.clipboard.writeText(e),K(t),!0;throw Error(`clipboard unavailable`)}catch{}try{let n=document.createElement(`textarea`);n.value=e,n.setAttribute(`readonly`,``),n.style.position=`fixed`,n.style.opacity=`0`,document.body.appendChild(n),n.select();let r=document.execCommand(`copy`);return n.remove(),K(r?t:`复制失败`),r}catch{return K(`复制失败`),!1}}async function mo(e){if(typeof navigator<`u`&&typeof navigator.share==`function`)try{await navigator.share({text:e});return}catch(e){if(e instanceof DOMException&&e.name===`AbortError`)return}await po(e,`已复制，可粘贴分享`)}function ho(e){fo({type:`insertCode`,code:e}),window.dshInsertCode?.(e),K(`已插入到编辑器`)}function go(e,t){let n;try{n=`data:text/plain;base64,`+btoa(unescape(encodeURIComponent(e)))}catch{let t=new Blob([e],{type:`text/plain;charset=utf-8`});n=URL.createObjectURL(t)}let r=!1;try{r=window.open(n,`_blank`)!==null}catch{r=!1}if(!r){let e=document.createElement(`a`);e.href=n,e.download=`code.${t}`,document.body.appendChild(e),e.click(),e.remove()}K(r?`已在新标签页打开`:`已下载代码文件`)}function _o(e){if(fo({type:`openFile`,path:e}),typeof window.dshOpenFile==`function`){window.dshOpenFile(e);return}K(`当前环境不支持打开文件`)}async function vo(e,t){fo({type:`runCode`,code:e,lang:t});let n=window.dshRunCode;if(typeof n!=`function`)return null;try{let r=await n(e,t);return r===void 0?null:{output:r.output,...r.error===!0?{error:!0}:{}}}catch(e){return{output:e instanceof Error?e.message:String(e),error:!0}}}function yo(){return(0,G.jsxs)(`svg`,{viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.8`,strokeLinecap:`round`,"aria-hidden":!0,children:[(0,G.jsx)(`circle`,{cx:`12`,cy:`12`,r:`4.2`}),(0,G.jsx)(`path`,{d:`M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5 5l1.7 1.7M17.3 17.3 19 19M19 5l-1.7 1.7M6.7 17.3 5 19`})]})}function bo(){return(0,G.jsx)(`svg`,{viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.8`,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":!0,children:(0,G.jsx)(`path`,{d:`M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z`})})}function xo(){let e=(0,c.useSyncExternalStore)(Mr,jr)===`dark`;return(0,G.jsx)(`button`,{type:`button`,className:`mobile-theme-toggle`,"aria-label":e?`切换到浅色`:`切换到深色`,onClick:()=>{g(`ui-theme`,[{op:`set`,path:[`preference`],value:Pr()===`dark`?`dark`:`light`}]).catch(()=>{})},children:e?(0,G.jsx)(yo,{}):(0,G.jsx)(bo,{})})}function So(e){return e.split(/[\\/]+/).filter(Boolean)}function Co(e,t=.6){if(e.length<2)return``;let n=e.map(So),r=Math.min(...n.map(e=>e.length)),i=Math.ceil(e.length*t),a=[];for(let e=0;e<r;e++){let t=new Map;for(let r of n){let n=r[e]??``;t.set(n,(t.get(n)??0)+1)}let r=``,o=0;for(let[e,n]of t)n>o&&(r=e,o=n);if(o<i)break;a.push(r)}if(a.length===0)return``;let o=n.filter(e=>a.every((t,n)=>e[n]===t));return o.length<2?``:o[0]?.slice(0,a.length).join(`/`)??``}function wo(e,t,n=28){let r=e;if(t!==``){let n=So(t),i=So(e);i.length>n.length&&n.every((e,t)=>i[t]===e)&&(r=`…`+i.slice(n.length).join(`\\`))}if(r.length<=n)return r;let i=So(r.startsWith(`…`)?r.slice(1):r);return i.length<2?r.slice(0,n-1)+`…`:`…`+(i[0]??``).slice(0,10)+`…`+(i[i.length-1]??``).slice(0,10)}function To(e,t){return e.length<=t?e:e.slice(0,t)+`…`}function Eo(e){let t=/^\s*```([\w+-]*)\s*\n/.exec(e);if(t!==null){let e=t[1]??``;return e===``?`[代码]`:`[代码] ${e}`}return To(e.trimStart().split(`
`,1)[0]??``,30)}function Do(e){return e.map(()=>!0)}const Oo=`outbox`,ko=`history`,Ao=[];let Y=!1,jo=!1;function Mo(){return new Promise((e,t)=>{if(typeof indexedDB>`u`){t(Error(`indexedDB unavailable`));return}let n=indexedDB.open(`dsh-palm`,2);n.onupgradeneeded=()=>{let e=n.result;e.objectStoreNames.contains(Oo)||e.createObjectStore(Oo,{keyPath:`id`}),e.objectStoreNames.contains(ko)||e.createObjectStore(ko,{keyPath:`key`})},n.onsuccess=()=>{e(n.result)},n.onerror=()=>{t(n.error??Error(`indexedDB open failed`))}})}async function No(e,t){let n=await Mo();try{return await new Promise((r,i)=>{let a=t(n.transaction(Oo,e).objectStore(Oo));a.onsuccess=()=>{r(a.result)},a.onerror=()=>{i(a.error??Error(`indexedDB request failed`))}})}finally{n.close()}}async function Po(){if(Ao.length===0)return;let e=await Mo();try{await new Promise((t,n)=>{let r=e.transaction(Oo,`readwrite`),i=r.objectStore(Oo);for(let e of Ao)i.put(e);r.oncomplete=()=>{t()},r.onerror=()=>{n(r.error??Error(`indexedDB transaction failed`))},r.onabort=()=>{n(r.error??Error(`indexedDB transaction aborted`))}}),Ao.length=0,Y=!1}finally{e.close()}}async function Fo(e){if(!Y)try{await No(`readwrite`,t=>t.put(e));return}catch{Y=!0}Ao.push(e)}async function Io(){try{let e=await No(`readonly`,e=>e.getAll());if(Ao.length>0)try{await Po()}catch{}let t=new Map;for(let n of e)t.set(n.id,n);for(let e of Ao)t.has(e.id)||t.set(e.id,e);return Y=!1,[...t.values()].sort((e,t)=>e.queuedAt-t.queuedAt)}catch{return Y=!0,[...Ao].sort((e,t)=>e.queuedAt-t.queuedAt)}}async function Lo(e){let t=Ao.findIndex(t=>t.id===e);t!==-1&&Ao.splice(t,1);try{await No(`readwrite`,t=>t.delete(e))}catch{Y=!0}}async function Ro(e){let t=await Io();for(let n of t)n.sessionId===e&&await Lo(n.id)}var zo=class extends Error{constructor(e=`permanent outbox failure`){super(e),this.name=`PermanentOutboxError`}};async function Bo(e,t){let n=Ao.find(t=>t.id===e);n!==void 0&&t(n);try{let n=await Mo();try{await new Promise((r,i)=>{let a=n.transaction(Oo,`readwrite`),o=a.objectStore(Oo),s=o.get(e);s.onsuccess=()=>{let e=s.result;e!==void 0&&(t(e),o.put(e))},a.oncomplete=()=>{r()},a.onerror=()=>{i(a.error??Error(`indexedDB transaction failed`))},a.onabort=()=>{i(a.error??Error(`indexedDB transaction aborted`))}})}finally{n.close()}}catch{Y=!0}}async function Vo(e){if(jo)return{sent:0,failed:0};jo=!0;try{let t=await Io(),n=0,r=0;for(let i of t)if(i.sending!==!0)try{await Bo(i.id,e=>{e.sending=!0}),await e(i),await Lo(i.id),n+=1}catch(e){e instanceof zo?await Lo(i.id):await Bo(i.id,e=>{e.sending=!1}),r+=1}return{sent:n,failed:r}}finally{jo=!1}}function Ho({items:e,running:t,onEdit:n,onRemove:r,onSteer:i}){let[a,o]=(0,c.useState)(!1),[s,l]=(0,c.useState)(null),[u,d]=(0,c.useState)(``),f=(0,c.useRef)(!1),[p,m]=(0,c.useState)(!1),h=e.filter(e=>e.placement===`queued`);if(h.length===0)return null;let g=h.length===1||a,_=e=>{l(e.id),d(e.text)},v=async()=>{if(!(s===null||f.current)){f.current=!0,m(!0);try{await n(s,u)}finally{f.current=!1,m(!1),l(null)}}},y=async(e,t)=>{if(!f.current){f.current=!0,m(!0);try{await e(t)}finally{f.current=!1,m(!1)}}};return(0,G.jsxs)(`div`,{className:`queue-dock`,"data-queue-dock":``,children:[h.length>1&&(0,G.jsxs)(`button`,{type:`button`,className:`queue-dockHead`,"aria-expanded":a,onClick:()=>{o(e=>!e)},children:[(0,G.jsxs)(`span`,{className:`queue-dockCount`,children:[h.length,` 条排队`]}),(0,G.jsx)(`span`,{className:`queue-dockChevron`,"aria-hidden":!0,children:a?`收起`:`展开`})]}),g&&(0,G.jsx)(`ul`,{className:`queue-dockList`,children:h.map(e=>(0,G.jsx)(`li`,{className:`queue-dockRow`,children:s===e.id?(0,G.jsxs)(`div`,{className:`queue-dockEdit`,children:[(0,G.jsx)(`input`,{className:`queue-dockInput`,value:u,autoFocus:!0,onChange:e=>{d(e.target.value)},onKeyDown:e=>{e.key===`Enter`&&v(),e.key===`Escape`&&l(null)}}),(0,G.jsx)(`button`,{type:`button`,className:`queue-dockBtn queue-dockBtn-primary`,onClick:()=>{v()},children:`保存`}),(0,G.jsx)(`button`,{type:`button`,className:`queue-dockBtn`,onClick:()=>{l(null)},children:`取消`})]}):(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(`span`,{className:`queue-dockText`,title:e.text,children:e.text}),(0,G.jsxs)(`span`,{className:`queue-dockActions`,children:[(0,G.jsx)(`button`,{type:`button`,className:`queue-dockBtn`,"aria-label":`编辑排队消息`,title:e.editable?void 0:`仅纯文本消息可编辑`,disabled:!e.editable||p,onClick:()=>{_(e)},children:`编辑`}),(0,G.jsx)(`button`,{type:`button`,className:`queue-dockBtn`,"aria-label":`删除排队消息`,disabled:p,onClick:()=>{y(r,e.id)},children:`删除`}),(0,G.jsx)(`button`,{type:`button`,className:`queue-dockBtn queue-dockBtn-primary`,"aria-label":`插话发送`,disabled:!t||p,title:t?void 0:`仅运行中可插话发送`,onClick:()=>{y(i,e.id)},children:`插话`})]})]})},e.id))})]})}const Uo={ts:{label:`TypeScript`,runnable:!1,ext:`ts`,kind:`code`},typescript:{label:`TypeScript`,runnable:!1,ext:`ts`,kind:`code`},js:{label:`JavaScript`,runnable:!1,ext:`js`,kind:`code`},javascript:{label:`JavaScript`,runnable:!1,ext:`js`,kind:`code`},jsx:{label:`JSX`,runnable:!1,ext:`jsx`,kind:`code`},tsx:{label:`TSX`,runnable:!1,ext:`tsx`,kind:`code`},py:{label:`Python`,runnable:!0,ext:`py`,kind:`python`},python:{label:`Python`,runnable:!0,ext:`py`,kind:`python`},bash:{label:`Bash`,runnable:!0,ext:`sh`,kind:`bash`},sh:{label:`Bash`,runnable:!0,ext:`sh`,kind:`bash`},shell:{label:`Bash`,runnable:!0,ext:`sh`,kind:`bash`},zsh:{label:`Bash`,runnable:!0,ext:`sh`,kind:`bash`},json:{label:`JSON`,runnable:!1,ext:`json`,kind:`config`},yaml:{label:`YAML`,runnable:!1,ext:`yml`,kind:`config`},yml:{label:`YAML`,runnable:!1,ext:`yml`,kind:`config`},html:{label:`HTML`,runnable:!1,ext:`html`,kind:`markup`},xml:{label:`XML`,runnable:!1,ext:`xml`,kind:`markup`},css:{label:`CSS`,runnable:!1,ext:`css`,kind:`code`},rust:{label:`Rust`,runnable:!1,ext:`rs`,kind:`code`},rs:{label:`Rust`,runnable:!1,ext:`rs`,kind:`code`},go:{label:`Go`,runnable:!1,ext:`go`,kind:`code`},java:{label:`Java`,runnable:!1,ext:`java`,kind:`code`},cpp:{label:`C++`,runnable:!1,ext:`cpp`,kind:`code`},"c++":{label:`C++`,runnable:!1,ext:`cpp`,kind:`code`},c:{label:`C`,runnable:!1,ext:`c`,kind:`code`},md:{label:`Markdown`,runnable:!1,ext:`md`,kind:`markup`},markdown:{label:`Markdown`,runnable:!1,ext:`md`,kind:`markup`},sql:{label:`SQL`,runnable:!1,ext:`sql`,kind:`sql`},text:{label:`Text`,runnable:!1,ext:`txt`,kind:`config`}};function Wo(e){let t=e.trim().toLowerCase(),n=Uo[t];return n===void 0?{label:e.trim()===``?`text`:e.trim(),runnable:!1,ext:`txt`}:n}const Go={code:new Set(`abstract.as.async.await.break.case.catch.class.const.continue.default.delete.do.else.enum.export.extends.finally.for.from.function.get.if.implements.import.in.instanceof.interface.let.module.namespace.new.of.package.private.protected.public.readonly.return.set.static.super.switch.this.throw.try.type.typeof.undefined.var.void.while.with.yield.null.true.false.fn.impl.struct.match.mut.move.pub.ref.trait.use.where.func.range.defer.chan.go.nil.def.lambda`.split(`.`)),python:new Set(`and.as.assert.async.await.break.class.continue.def.del.elif.else.except.False.finally.for.from.global.if.import.in.is.lambda.None.nonlocal.not.or.pass.raise.return.True.try.while.with.yield.self.print`.split(`.`)),bash:new Set(`if.then.else.elif.fi.for.while.until.do.done.case.esac.function.in.select.time.local.export.readonly.return.break.continue.shift.source.alias.echo.set.unset.true.false.test.exit`.split(`.`)),sql:new Set(`SELECT.FROM.WHERE.INSERT.INTO.VALUES.UPDATE.SET.DELETE.CREATE.TABLE.ALTER.ADD.DROP.INDEX.VIEW.JOIN.INNER.LEFT.RIGHT.FULL.OUTER.CROSS.ON.AS.AND.OR.NOT.NULL.IS.IN.LIKE.BETWEEN.GROUP.BY.ORDER.HAVING.LIMIT.OFFSET.UNION.ALL.DISTINCT.PRIMARY.KEY.FOREIGN.REFERENCES.CONSTRAINT.DEFAULT.UNIQUE.CHECK.CASE.WHEN.THEN.ELSE.END.EXISTS.COUNT.SUM.AVG.MIN.MAX.CAST.IF.WITH.RECURSIVE.ASC.DESC.DATABASE`.split(`.`)),markup:new Set(`html.head.body.title.meta.link.script.style.div.span.p.h1.h2.h3.h4.h5.h6.ul.ol.li.table.tr.td.th.thead.tbody.a.img.input.button.form.header.footer.nav.section.article.aside.main.select.option.textarea.label.video.audio.iframe.pre.code.br.hr.strong.em.b.i.u.s.blockquote.q.mark.doctype.template.slot.picture.source.summary.details.figure.figcaption.canvas.svg.path.defs.linearGradient`.split(`.`)),config:new Set([`true`,`false`,`null`,`yes`,`no`,`on`,`off`,`version`,`name`,`type`,`id`,`env`,`node`,`extends`,`default`,`required`])};function Ko(e,t){return t===`sql`?e.toUpperCase():e}function qo(e){return e.replace(/[&<>"']/g,e=>e===`&`?`&amp;`:e===`<`?`&lt;`:e===`>`?`&gt;`:e===`"`?`&quot;`:`&#39;`)}const Jo=/("[^"\n]*")|('(?:[^'\n\\]|\\.)*')|(`[^`\n]*`)|(\/\/[^\n]*)|(\/\*.*?\*\/|\s#[^\n]*)|(\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|(\b[A-Za-z_][A-Za-z0-9_]*\b)/g;function Yo(e,t,n){if(n&&/^\s*#/.test(e))return`<span class="tok tok-comment">${qo(e)}</span>`;let r=Go[t],i=``,a=0;Jo.lastIndex=0;let o;for(;(o=Jo.exec(e))!==null;){let s=o.index,[c,l,u,d,f,p,m,h]=o;i+=qo(e.slice(a,s));let g=c,_=``;if(l!==void 0||u!==void 0||d!==void 0)_=` tok-string`;else if(f!==void 0||p!==void 0&&(p.trimStart().startsWith(`/*`)||n&&p.trimStart().startsWith(`#`)))_=` tok-comment`;else if(m!==void 0)_=` tok-number`;else if(h!==void 0){if(g=h,r.has(Ko(h,t)))_=` tok-keyword`;else if(/^[A-Z]/.test(h))_=` tok-type`;else{let n=e.slice(s+h.length),r=e.slice(Math.max(0,s-1),s);t===`markup`&&(r===`<`||r===` `)||n.startsWith(`:`)&&(r===` `||r===``||r===`"`||r===`'`)?_=` tok-prop`:n.startsWith(`(`)&&(_=` tok-func`)}}i+=_===``?qo(g):`<span class="tok${_}">${qo(g)}</span>`,a=s+c.length}return i+=qo(e.slice(a)),i===``?` `:i}const Xo=new Map;function Zo(e,t){let n=t.trim().toLowerCase(),r=n+`\0`+e,i=Xo.get(r);if(i!==void 0)return i;let a=Uo[n];if(a===void 0||a.kind===`config`)return null;let o=a.kind===`python`||a.kind===`bash`||a.kind===`sql`,s=`<pre class="shiki" tabindex="0"><code>${e.split(`
`).map(e=>`<span class="line">${Yo(e,a.kind,o)}</span>`).join(`
`)}</code></pre>`;return Xo.size>=200&&Xo.clear(),Xo.set(r,s),s}const Qo={"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`};function X(e){return e.replace(/[&<>"']/g,e=>Qo[e]??e)}function $o(e){let t=e.trim();if(t===``)return null;if(t.startsWith(`#`))return t;if(t.startsWith(`//`))return null;let n=/^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(t);if(n===null)return t;let r=n[1].toLowerCase();return r===`http`||r===`https`||r===`mailto`?t:null}const es=/\.(?:png|jpe?g|gif|webp|bmp|svg|avif|ico)$/i,ts=/^[A-Za-z]:[\\/]/,ns=/^[A-Za-z][A-Za-z0-9+.-]*:/;function rs(e){let t=e.trim().replace(/[?#][\s\S]*$/,``);if(t===``||t.startsWith(`//`)||ns.test(t)&&!ts.test(t)||!es.test(t))return null;try{return decodeURIComponent(t)}catch{return null}}function is(e,t){let n=0;for(let r=t;r<e.length;r+=1){let t=e[r];if(t===`(`)n+=1;else if(t===`)`){if(n===0)return r;--n}}return-1}const as=/(?:[A-Za-z]:[\\/]|\.{1,2}[\\/])?(?:[\w@.-]+[\\/])+[\w@.-]+\.(?:[A-Za-z0-9]{1,8})/y;function os(e,t){let n=e[t];if(n===void 0||!/[\w./\\]/.test(n))return null;let r=t>0?e[t-1]:``;if(r!==``&&/[\w:/.@]/.test(r))return null;as.lastIndex=t;let i=as.exec(e);if(i===null)return null;let a=i[0];return!/[\\/]/.test(a)||/^[a-z][a-z0-9+.-]*:\/\//i.test(a)||/^www\./i.test(a)?null:{path:a,end:t+a.length}}function ss(e){let t=``,n=0,r=e.length;for(;n<r;){let r=e[n];if(r==="`"){let r=e.indexOf("`",n+1);if(r!==-1){let i=e.slice(n+1,r),a=os(i,0);if(a!==null&&a.end===i.length){t+=`<code><a class="file-link" data-path="`+X(a.path)+`">`+X(a.path)+`</a></code>`,n=r+1;continue}t+=`<code>`+X(i)+`</code>`,n=r+1;continue}}if(r===`!`&&e[n+1]===`[`){let r=e.indexOf(`](`,n+2);if(r!==-1){let i=is(e,r+2);if(i!==-1){let a=e.slice(n+2,r),o=e.slice(r+2,i),s=rs(o);if(s!==null)t+=`<img class="md-local-img" data-local-src="`+X(s)+`" alt="`+X(a)+`" loading="lazy" decoding="async" />`;else{let e=$o(o);if(e===null)t+=X(a);else{let n=X(e).replace(/\s+/g,`%20`);t+=`<img alt="`+X(a)+`" src="`+n+`" loading="lazy" decoding="async" />`}}n=i+1;continue}}}if(r===`[`){let r=e.indexOf(`](`,n+1);if(r!==-1){let i=is(e,r+2);if(i!==-1){let a=e.slice(n+1,r),o=$o(e.slice(r+2,i));t+=o===null?ss(a):`<a href="`+X(o)+`" target="_blank" rel="noopener noreferrer">`+ss(a)+`</a>`,n=i+1;continue}}}let i=os(e,n);if(i!==null){t+=`<a class="file-link" data-path="`+X(i.path)+`">`+X(i.path)+`</a>`,n=i.end;continue}if(r===`*`&&e[n+1]===`*`){let r=e.indexOf(`**`,n+2);if(r!==-1){t+=`<strong>`+ss(e.slice(n+2,r))+`</strong>`,n=r+2;continue}}if(r===`*`&&e[n-1]!==`*`&&e[n+1]!==`*`){let r=e.indexOf(`*`,n+1);if(r!==-1&&e[r+1]!==`*`){t+=`<em>`+ss(e.slice(n+1,r))+`</em>`,n=r+1;continue}}if(r===`~`&&e[n+1]===`~`){let r=e.indexOf(`~~`,n+2);if(r!==-1){t+=`<del>`+ss(e.slice(n+2,r))+`</del>`,n=r+2;continue}}if(r===`
`){t+=`<br />`,n+=1;continue}t+=X(r),n+=1}return t}const cs=/<think\b[^>]*>/i,ls=/<\/think\s*>/i;function us(e,t){let n=e===``?`text`:e,r=t.split(`
`).map(e=>`<span class="code-line">`+(X(e)||` `)+`</span>`).join(``);return`<div class="code-block" data-lang="`+X(n)+`"><div class="code-head"><span class="code-lang">`+X(n)+`</span><div class="code-actions"><button type="button" class="code-btn code-copy" aria-label="复制代码"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5"/></svg></button><button type="button" class="code-btn code-insert" aria-label="插入到编辑器"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 4v9"/><path d="M7.5 9.5 12 14l4.5-4.5"/><path d="M5 19h14"/></svg></button><button type="button" class="code-btn code-open" aria-label="新标签页打开"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M19 14v5a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4 19V7a1.5 1.5 0 0 1 1.5-1.5H10"/></svg></button></div></div><div class="code-body"><pre><code>`+r+`</code></pre></div></div>`}function ds(e){return`<div class="diff-block" data-lang="diff"><div class="diff-head"><span class="diff-label">变更对比</span></div><div class="diff-body"><pre><code>`+e.split(`
`).map(e=>`<span class="code-line">`+(X(e)||` `)+`</span>`).join(``)+`</code></pre></div></div>`}function fs(e){return`<details class="chat-disclosure think-block"><summary class="chat-disclosure-head"><span class="chat-disclosure-icon"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/></svg></span><span class="chat-disclosure-label">思考过程</span><span class="chat-disclosure-caret"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 14 6-6 6 6"/></svg></span></summary><div class="chat-disclosure-body think-body">`+X(e)+`</div></details>`}function ps(e){switch(e.type){case`paragraph`:return`<p>`+e.html+`</p>`;case`heading`:return`<h`+e.level+`>`+e.html+`</h`+e.level+`>`;case`hr`:return`<hr />`;case`list`:return(e.ordered?`<ol>`:`<ul>`)+e.items.map(e=>`<li>`+e+`</li>`).join(``)+(e.ordered?`</ol>`:`</ul>`);case`table`:{let t=`<thead><tr>`+e.head.map(e=>`<th>`+e+`</th>`).join(``)+`</tr></thead>`,n=e.rows.length>0?`<tbody>`+e.rows.map(e=>`<tr>`+e.map(e=>`<td>`+e+`</td>`).join(``)+`</tr>`).join(``)+`</tbody>`:``;return`<table>`+t+n+`</table>`}case`quote`:return`<blockquote><p>`+e.html+`</p></blockquote>`;case`code`:return e.diff?ds(e.code):us(e.lang,e.code);case`think`:return fs(e.text)}}function ms(e){let t=e.replace(/\r\n/g,`
`).split(`
`),n=[],r=0,i=t.length,a=e=>{e.length!==0&&(n.push({type:`paragraph`,html:ss(e.join(`
`))}),e.length=0)},o=[];for(;r<i;){let e=t[r],s=/^```([\w+-]*)\s*$/.exec(e);if(s!==null){a(o);let e=s[1]??``;r+=1;let c=[];for(;r<i&&!/^```\s*$/.test(t[r]);)c.push(t[r]),r+=1;r+=1,n.push({type:`code`,lang:e,code:c.join(`
`),diff:e.toLowerCase()===`diff`});continue}if(/^tool_result</.test(e)){a(o);let s=[e];for(r+=1;r<i&&s.length<12&&/^(<\/|\s*\|)/.test(t[r]);)s.push(t[r]),r+=1;n.push({type:`code`,lang:``,code:s.join(`
`),diff:!1});continue}let c=cs.exec(e);if(c!==null){a(o);let s=e.slice(0,c.index),l=e.slice(c.index+c[0].length),u=0,d=ls.exec(l);if(d===null)for(u=1;u<i-r&&(d=ls.exec(t[r+u]??``),d===null);)u+=1;if(d===null){o.push(e),r+=1;continue}let f=[];if(u===0)f.push(l.slice(0,d.index));else{f.push(l);for(let e=r+1;e<r+u;e+=1)f.push(t[e]??``);f.push((t[r+u]??``).slice(0,d.index))}let p=f.join(`
`).trim();s.trim()!==``&&n.push({type:`paragraph`,html:ss(s)}),p!==``&&n.push({type:`think`,text:p});let m=u===0?l.slice(d.index+d[0].length):(t[r+u]??``).slice(d.index+d[0].length);m.trim()!==``&&o.push(m),r+=u+1;continue}let l=/^(#{1,6})\s+(.*)$/.exec(e);if(l!==null){a(o),n.push({type:`heading`,level:l[1].length,html:ss(l[2]??``)}),r+=1;continue}if(/^\s*(---+|\*\*\*+|___+)\s*$/.test(e)){a(o),n.push({type:`hr`}),r+=1;continue}if(e.includes(`|`)&&r+1<i&&/^\s*\|?[\s:|-]+\|?\s*$/.test(t[r+1])&&t[r+1].includes(`-`)){a(o);let s=gs(e);r+=2;let c=[];for(;r<i&&t[r].includes(`|`);)c.push(gs(t[r])),r+=1;n.push({type:`table`,head:s.map(e=>ss(e)),rows:c.map(e=>e.map(e=>ss(e)))});continue}if(/^>\s?(.*)$/.exec(e)!==null){a(o);let e=[];for(;r<i;){let n=/^>\s?(.*)$/.exec(t[r]);if(n===null)break;e.push(n[1]??``),r+=1}n.push({type:`quote`,html:e.map(e=>ss(e)).join(`<br />`)});continue}if(/^\s*([-*+])\s+(.*)$/.exec(e)!==null){a(o);let e=[];for(;r<i;){let n=/^\s*([-*+])\s+(.*)$/.exec(t[r]);if(n===null)break;e.push(ss(n[2]??``)),r+=1}n.push({type:`list`,ordered:!1,items:e});continue}if(/^\s*\d+[.)]\s+(.*)$/.exec(e)!==null){a(o);let e=[];for(;r<i;){let n=/^\s*\d+[.)]\s+(.*)$/.exec(t[r]);if(n===null)break;e.push(ss(n[1]??``)),r+=1}n.push({type:`list`,ordered:!0,items:e});continue}if(e.trim()===``){a(o),r+=1;continue}o.push(e),r+=1}return a(o),n}function hs(e){let t=ms(e),n=[],r=[],i=0,a=()=>{r.length!==0&&(n.push({kind:`html`,id:i,html:r.join(`
`)}),i+=1,r=[])};for(let e of t)e.type===`code`?(a(),e.diff?n.push({kind:`diff`,id:i,text:e.code}):n.push({kind:`code`,id:i,lang:e.lang,code:e.code}),i+=1):e.type===`think`?(a(),n.push({kind:`think`,id:i,text:e.text}),i+=1):r.push(ps(e));return a(),n}function gs(e){let t=e.trim(),n=t.startsWith(`|`)?t.slice(1):t;return(n.endsWith(`|`)?n.slice(0,-1):n).split(`|`).map(e=>e.trim())}const _s=/^```([\w+-]*)\s*$/,vs=/^```\s*$/;function ys(e,t){let n=e.replace(/\r\n/g,`
`),r=n.length;(t>r||t<0)&&(t=0);let i=[],a=t,o=null,s=t,c=()=>{o!==null&&o.length>0&&i.push({kind:`html`,html:`<p>`+ss(o.join(`
`))+`</p>`}),o=null};for(;a<r;){let e=n.indexOf(`
`,a),t=e===-1?n.slice(a):n.slice(a,e),l=e===-1?r:e+1,u=_s.exec(t);if(u!==null){c();let e=u[1]??``,t=-1,o=-1,s=l;for(;s<r;){let e=n.indexOf(`
`,s),i=e===-1?n.slice(s):n.slice(s,e);if(vs.test(i)){t=s,o=e===-1?r:e+1;break}s=e===-1?r:e+1}if(t===-1)break;let d=n.slice(l,t).replace(/\n$/,``);e.toLowerCase()===`diff`?i.push({kind:`diff`,text:d}):i.push({kind:`code`,lang:e,code:d}),a=o;continue}let d=cs.exec(t);if(d!==null){if(c(),d.index>0){let e=t.slice(0,d.index);e.trim()!==``&&i.push({kind:`html`,html:`<p>`+ss(e)+`</p>`})}let e=t.slice(d.index+d[0].length),u=ls.exec(e);if(u!==null){let t=e.slice(0,u.index).trim();t!==``&&i.push({kind:`think`,text:t});let n=e.slice(u.index+u[0].length);n.trim()!==``&&(o=[n],s=a+d.index+d[0].length+u.index+u[0].length),a=l;continue}let f=[e],p=l,m=!1;for(;p<r;){let e=n.indexOf(`
`,p),t=e===-1?n.slice(p):n.slice(p,e),c=ls.exec(t);if(c!==null){let n=[...f,t.slice(0,c.index)].join(`
`).trim();n!==``&&i.push({kind:`think`,text:n});let l=t.slice(c.index+c[0].length);l.trim()!==``&&(o=[l],s=p+c.index+c[0].length),a=e===-1?r:e+1,m=!0;break}f.push(t),p=e===-1?r:e+1}if(!m)break;continue}if(o===null&&(o=[],s=a),t.trim()===``){c(),a=l;continue}o.push(t),a=l}return o!==null&&o.length>0&&(a=s),{blocks:i,stableLen:a,tail:n.slice(a)}}function bs(){return new Promise(e=>{setTimeout(e,0)})}const xs=(0,c.memo)(function({lang:e,code:t}){let n=(0,c.useMemo)(()=>Wo(e),[e]),r=(0,c.useMemo)(()=>t.split(`
`),[t]),i=r.length>20,[a,o]=(0,c.useState)(null),[s,l]=(0,c.useState)(!1),u=(0,c.useRef)(void 0),[d,f]=(0,c.useState)(!1),[p,m]=(0,c.useState)({running:!1}),h=i&&!d,g=r.length>1e3&&!h,_=h?Math.min(r.length,60):r.length,v=_===r.length?t:r.slice(0,_).join(`
`),y=h&&r.length>_?r.slice(_):void 0;return(0,c.useEffect)(()=>()=>{u.current!==void 0&&window.clearTimeout(u.current)},[]),(0,c.useEffect)(()=>{f(!1)},[t]),(0,c.useEffect)(()=>{if(g){let t=!1,n=v.split(`
`),r=Math.ceil(n.length/300),i=``,a=0;return(async()=>{for(;a<r&&!t;){let s=a*300,c=Zo(n.slice(s,s+300).join(`
`),e);if(c===null||t)return;let l=c.indexOf(`<code>`),u=c.lastIndexOf(`</code>`);if(l===-1||u===-1)return;i+=c.slice(l+6,u),a+=1,a<r&&(i+=`
`),o(`<pre class="shiki" tabindex="0"><code>`+i+`</code></pre>`),await bs()}})(),()=>{t=!0}}let t=!1,n,r=()=>{t||o(Zo(v,e))};return n=typeof requestIdleCallback==`function`?requestIdleCallback(r):window.setTimeout(r,0),()=>{t=!0,n!==void 0&&(typeof requestIdleCallback==`function`?cancelIdleCallback(n):window.clearTimeout(n))}},[v,e,g]),(0,G.jsxs)(`div`,{className:`code-block`,"data-lang":e===``?`text`:e,children:[(0,G.jsxs)(`div`,{className:`code-head`,children:[(0,G.jsx)(`span`,{className:`code-lang`,children:n.label}),(0,G.jsxs)(`div`,{className:`code-actions`,children:[n.runnable&&(0,G.jsx)(`button`,{type:`button`,className:`code-btn`,"aria-label":`运行代码`,disabled:p.running,onClick:()=>{p.running||(m({running:!0}),vo(t,e).then(e=>{if(e===null){m({running:!1}),K(`当前环境不支持代码执行`);return}m({running:!1,result:e})}))},children:(0,G.jsx)(Ba,{width:16,height:16})}),(0,G.jsxs)(`button`,{type:`button`,className:`code-btn`+(s?` code-btn-done`:``),"aria-label":`复制代码`,onClick:()=>{l(!0),u.current!==void 0&&window.clearTimeout(u.current),u.current=window.setTimeout(()=>{u.current=void 0,l(!1)},1500),po(t,`已复制到剪贴板`)},children:[s?(0,G.jsx)(Fa,{width:16,height:16}):(0,G.jsx)(Na,{width:16,height:16}),s&&(0,G.jsx)(`span`,{className:`code-btn-label`,children:`已复制`})]}),(0,G.jsx)(`button`,{type:`button`,className:`code-btn`,"aria-label":`插入到编辑器`,onClick:()=>{ho(t)},children:(0,G.jsx)(Ra,{width:16,height:16})}),(0,G.jsx)(`button`,{type:`button`,className:`code-btn`,"aria-label":`新标签页打开`,onClick:()=>{go(t,n.ext)},children:(0,G.jsx)(za,{width:16,height:16})})]})]}),(0,G.jsxs)(`div`,{className:`code-body-zone`,children:[(0,G.jsxs)(`div`,{className:`code-body`+(h?` code-body-folded`:``),children:[a===null?(0,G.jsx)(`pre`,{children:(0,G.jsx)(`code`,{children:r.slice(0,_).map((e,t)=>(0,G.jsx)(`span`,{className:`code-line`,children:e===``?` `:X(e)},t))})}):(0,G.jsx)(`div`,{className:`code-fade`,dangerouslySetInnerHTML:{__html:a}}),y!==void 0&&(0,G.jsx)(`pre`,{className:`code-tail-plain`,children:(0,G.jsx)(`code`,{children:y.map((e,t)=>(0,G.jsx)(`span`,{className:`code-line`,children:e===``?` `:X(e)},t))})})]}),h&&(0,G.jsx)(`div`,{className:`code-fold-mask`,"aria-hidden":`true`})]}),i&&(0,G.jsx)(`button`,{type:`button`,className:`code-fold-btn`,onClick:()=>{f(e=>!e)},children:h?`展开全部`:`收起`}),p.result!==void 0&&(0,G.jsx)(`pre`,{className:`code-run`+(p.result.error===!0?` code-run-error`:` code-run-ok`),children:p.result.output})]})});function Ss(e){let t=e.trim();return/^[ab]\//.test(t)?t.slice(2):t}const Cs=/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/;function ws(e){let t=e.replace(/\r\n/g,`
`).split(`
`);t.length>0&&t[t.length-1]===``&&e.endsWith(`
`)&&t.pop();let n,r,i=0;for(;i<t.length;){let e=t[i],a=/^---\s+(.*)$/.exec(e);if(a!==null){n=Ss(a[1]),i+=1;continue}let o=/^\+\+\+\s+(.*)$/.exec(e);if(o!==null){r=Ss(o[1]),i+=1;continue}break}let a=[],o,s=0,c=0;for(;i<t.length;){let e=t[i],n=Cs.exec(e);if(n!==null){o={oldStart:Number(n[1]),oldLines:n[2]===void 0?1:Number(n[2]),newStart:Number(n[3]),newLines:n[4]===void 0?1:Number(n[4]),lines:[]},a.push(o),s=o.oldStart,c=o.newStart,i+=1;continue}if(o===void 0&&(o={oldStart:1,oldLines:0,newStart:1,newLines:0,lines:[]},a.push(o),s=1,c=1),e.startsWith(`\\`)){i+=1;continue}e.startsWith(`+`)?(o.lines.push({type:`add`,newNo:c,text:e.slice(1)}),c+=1):e.startsWith(`-`)?(o.lines.push({type:`del`,oldNo:s,text:e.slice(1)}),s+=1):(o.lines.push({type:`ctx`,oldNo:s,newNo:c,text:e.startsWith(` `)?e.slice(1):e}),s+=1,c+=1),i+=1}return Ts(a),{...n===void 0?{}:{oldFile:n},...r===void 0?{}:{newFile:r},hunks:a.map(e=>({oldStart:e.oldStart,oldLines:e.oldLines,newStart:e.newStart,newLines:e.newLines,lines:e.lines.map(e=>({type:e.type,...e.oldNo===void 0?{}:{oldNo:e.oldNo},...e.newNo===void 0?{}:{newNo:e.newNo},text:e.text,...e.words===void 0?{}:{words:e.words}}))}))}}function Ts(e){for(let t of e){let e=t.lines,n=0;for(;n<e.length;){let t=e[n].type;if(t!==`add`&&t!==`del`){n+=1;continue}let r=[];for(;n<e.length&&e[n].type===t;)r.push(e[n]),n+=1;let i=t===`add`?`del`:`add`,a=[];for(;n<e.length&&e[n].type===i;)a.push(e[n]),n+=1;let o=Math.max(r.length,a.length);for(let e=0;e<o;e+=1){let t=r[e],n=a[e];if(t!==void 0&&n!==void 0){let{oldWords:e,newWords:r}=Ds(t.text,n.text);t.words=e,n.words=r}else t===void 0?n!==void 0&&(n.words=[{text:n.text,kind:n.type===`add`?`add`:`del`}]):t.words=[{text:t.text,kind:t.type===`add`?`add`:`del`}]}}}}function Es(e){return e.match(/\S+|\s+/g)??[]}function Ds(e,t){let n=Es(e),r=Es(t),i=n.length,a=r.length;if(i*a>2e4){let e=0;for(;e<i&&e<a&&n[e]===r[e];)e+=1;let t=0;for(;t<i-e&&t<a-e&&n[i-1-t]===r[a-1-t];)t+=1;let o=[],s=[];for(let t=0;t<e;t+=1)o.push({text:n[t],kind:`same`}),s.push({text:r[t],kind:`same`});for(let r=e;r<i-t;r+=1)o.push({text:n[r],kind:/^\s+$/.test(n[r])?`same`:`del`});for(let n=e;n<a-t;n+=1)s.push({text:r[n],kind:/^\s+$/.test(r[n])?`same`:`add`});for(let e=i-t;e<i;e+=1)o.push({text:n[e],kind:`same`});for(let e=a-t;e<a;e+=1)s.push({text:r[e],kind:`same`});return{oldWords:o,newWords:s}}let o=Array.from({length:i+1},()=>Array(a+1).fill(0));for(let e=i-1;e>=0;--e)for(let t=a-1;t>=0;--t)o[e][t]=n[e]===r[t]?o[e+1][t+1]+1:Math.max(o[e+1][t],o[e][t+1]);let s=[],c=[],l=0,u=0;for(;l<i&&u<a;)n[l]===r[u]?(s.push({text:n[l],kind:`same`}),c.push({text:r[u],kind:`same`}),l+=1,u+=1):o[l+1][u]>=o[l][u+1]?(s.push({text:n[l],kind:/^\s+$/.test(n[l])?`same`:`del`}),l+=1):(c.push({text:r[u],kind:/^\s+$/.test(r[u])?`same`:`add`}),u+=1);for(;l<i;)s.push({text:n[l],kind:/^\s+$/.test(n[l])?`same`:`del`}),l+=1;for(;u<a;)c.push({text:r[u],kind:/^\s+$/.test(r[u])?`same`:`add`}),u+=1;return{oldWords:s,newWords:c}}function Os(e,t,n){let r=[];return e.hunks.forEach((e,i)=>{e.lines.forEach((e,a)=>{let o=`${i}:${a}`;(e.type===`ctx`||e.type===`add`&&t.has(o)||e.type===`del`&&n.has(o))&&r.push(e.text)})}),r.join(`
`)}const ks=(0,c.memo)(function({text:e}){let t=(0,c.useMemo)(()=>ws(e),[e]),[n,r]=(0,c.useState)(`view`),[i,a]=(0,c.useState)(new Set),[o,s]=(0,c.useState)(new Set),[l,u]=(0,c.useState)(!1),d=t.newFile??t.oldFile,f=(0,c.useMemo)(()=>t.hunks.reduce((e,t)=>e+t.lines.length,0),[t]),p=f>200&&!l,m=p?[...t.hunks.slice(0,2),...t.hunks.slice(-2)]:t.hunks,h=p?t.hunks.length-2-2:0,g=p?f-m.reduce((e,t)=>e+t.lines.length,0):0,_=(0,c.useMemo)(()=>{let e=0,n=0,r=0,a=0;return t.hunks.forEach((t,s)=>{t.lines.forEach((t,c)=>{let l=`${s}:${c}`;t.type===`add`?(e+=1,i.has(l)&&(r+=1)):t.type===`del`&&(n+=1,o.has(l)&&(a+=1))})}),{adds:e,dels:n,acceptedAdds:r,rejectedDels:a,remaining:e-r+n-a}},[t,i,o]),v=(0,c.useMemo)(()=>n===`rejected`?``:n===`applied`&&i.size===0&&o.size===0?Os(t,As(t,`add`),new Set):Os(t,i,o),[t,n,i,o]),y=(e,t)=>{t!==`ctx`&&(t===`add`?a(t=>{let n=new Set(t);return n.has(e)?n.delete(e):n.add(e),n}):s(t=>{let n=new Set(t);return n.has(e)?n.delete(e):n.add(e),n}))},b=()=>{if(i.size===0&&o.size===0){K(`请先逐行选择要接受或拒绝的行`);return}r(`applied`)},x=()=>{r(`view`),a(new Set),s(new Set)},S=()=>{r(`view`),a(new Set),s(new Set)},C=(0,G.jsxs)(`div`,{className:`diff-body`+(n===`review`?` diff-reviewing`:``),children:[m.map((e,r)=>(0,G.jsxs)(`div`,{className:`diff-hunk`,children:[t.hunks.length>1&&(0,G.jsxs)(`div`,{className:`diff-hunk-head`,children:[`@@ -`,e.oldStart,`,`,e.oldLines,` +`,e.newStart,`,`,e.newLines,` @@`]}),e.lines.map((e,t)=>{let a=`${r}:${t}`;return(0,G.jsx)(js,{line:e,reviewing:n===`review`,accepted:i.has(a),rejected:o.has(a),onToggle:()=>{y(a,e.type)}},a)})]},r)),p&&(0,G.jsxs)(`div`,{className:`diff-fold`,children:[(0,G.jsxs)(`span`,{className:`diff-fold-text`,children:[`… 已折叠 `,h,` 个 hunk / `,g,` 行`]}),(0,G.jsx)(`button`,{type:`button`,className:`diff-fold-btn`,onClick:()=>{u(!0)},children:`展开全部`})]}),n===`review`&&(0,G.jsxs)(`div`,{className:`diff-review-foot`,children:[(0,G.jsxs)(`span`,{className:`diff-review-summary`,children:[`接受 `,_.acceptedAdds,` 行 / 拒绝 `,_.rejectedDels,` 行 / 剩余 `,_.remaining,` 行`]}),(0,G.jsx)(`button`,{type:`button`,className:`diff-confirm diff-cancel`,onClick:x,children:`取消`}),(0,G.jsx)(`button`,{type:`button`,className:`diff-confirm`,onClick:b,children:`确认`})]})]});return(0,G.jsxs)(`div`,{className:`diff-block`,"data-lang":`diff`,children:[(0,G.jsxs)(`div`,{className:`diff-head`,children:[(0,G.jsxs)(`span`,{className:`diff-title`,children:[(0,G.jsx)(`span`,{className:`diff-label`,children:`变更对比`}),d!==void 0&&(0,G.jsx)(`span`,{className:`diff-file`,children:d})]}),(0,G.jsx)(`div`,{className:`diff-actions`,children:n===`view`&&(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(`button`,{type:`button`,className:`diff-btn diff-accept`,onClick:()=>{r(`applied`)},children:`接受`}),(0,G.jsx)(`button`,{type:`button`,className:`diff-btn diff-reject`,onClick:()=>{r(`rejected`)},children:`拒绝`}),(0,G.jsx)(`button`,{type:`button`,className:`diff-btn diff-review`,onClick:()=>{r(`review`)},children:`逐行审阅`})]})})]}),n===`applied`||n===`rejected`?(0,G.jsxs)(G.Fragment,{children:[(0,G.jsxs)(`div`,{className:`diff-applied`,children:[(0,G.jsx)(`span`,{className:`diff-applied-tag`+(n===`rejected`?` diff-applied-tag-rejected`:``),children:n===`applied`?`已应用`:`已拒绝`}),n===`applied`&&i.size+o.size>0&&(0,G.jsxs)(`span`,{className:`diff-applied-summary`,children:[`接受 `,_.acceptedAdds,` 行 / 拒绝 `,_.rejectedDels,` 行`]}),n===`applied`&&v!==``&&(0,G.jsx)(`button`,{type:`button`,className:`diff-undo`,onClick:()=>{po(v,`已复制结果代码`)},children:`复制结果`}),n===`rejected`&&(0,G.jsx)(`button`,{type:`button`,className:`diff-undo`,onClick:S,children:`重新生成`}),(0,G.jsx)(`button`,{type:`button`,className:`diff-undo`,onClick:S,children:`撤销`})]}),(0,G.jsx)(`div`,{className:`diff-dimmed`,children:C})]}):C]})});function As(e,t){let n=new Set;return e.hunks.forEach((e,r)=>{e.lines.forEach((e,i)=>{e.type===t&&n.add(`${r}:${i}`)})}),n}function js({line:e,reviewing:t,accepted:n,rejected:r,onToggle:i}){let a=e.type===`add`?` diff-add`:e.type===`del`?` diff-del`:``,o=e.type===`add`&&n||e.type===`del`&&r;return(0,G.jsxs)(`div`,{className:`diff-row`+(t?` diff-row-review`:``)+a+(o?` diff-decided`:``),children:[t&&(0,G.jsxs)(`div`,{className:`diff-review-cell`,children:[e.type===`add`&&(0,G.jsx)(`button`,{type:`button`,className:`diff-line-btn diff-line-add-btn`+(n?` diff-line-btn-on`:``),"aria-label":`接受该行`,onClick:i,children:`+`}),e.type===`del`&&(0,G.jsx)(`button`,{type:`button`,className:`diff-line-btn diff-line-del-btn`+(r?` diff-line-btn-on`:``),"aria-label":`拒绝该行`,onClick:i,children:`−`})]}),(0,G.jsx)(`span`,{className:`diff-oldno`,children:e.oldNo??``}),(0,G.jsx)(`span`,{className:`diff-newno`,children:e.newNo??``}),(0,G.jsx)(`span`,{className:`diff-text`,dangerouslySetInnerHTML:{__html:Ms(e)}})]})}function Ms(e){let t=e.words;if(t===void 0||t.length===0)return X(e.text);let n=``;for(let e of t){let t=X(e.text);e.kind===`add`?n+=`<span class="diff-word-add">`+t+`</span>`:e.kind===`del`?n+=`<span class="diff-word-del">`+t+`</span>`:n+=t}return n}const Ns={ts:`ts`,tsx:`tsx`,js:`js`,jsx:`jsx`,mjs:`js`,cjs:`js`,py:`py`,sh:`sh`,bash:`sh`,zsh:`sh`,json:`json`,yaml:`yaml`,yml:`yaml`,html:`html`,xml:`xml`,htm:`html`,css:`css`,rs:`rs`,go:`go`,java:`java`,cpp:`cpp`,cc:`cpp`,cxx:`cpp`,h:`cpp`,hpp:`cpp`,c:`c`,md:`md`,markdown:`md`,sql:`sql`,txt:`text`,log:`text`,gitignore:`text`,toml:`text`};function Ps(e){let t=e.split(/[\\/]/).pop()??``,n=t.lastIndexOf(`.`),r=n>0?t.slice(n+1).toLowerCase():t.toLowerCase();return r===`gitignore`||r===`dockerignore`?`text`:Ns[r]??`text`}function Fs(e){let t=e.split(/[\\/]/).pop()??``,n=t.lastIndexOf(`.`),r=n>0?t.slice(n+1).toLowerCase():``;return r===`md`||r===`markdown`||r===`mdx`}function Is(e){let t=e.split(/[\\/]/).pop()??``,n=t.lastIndexOf(`.`),r=n>0?t.slice(n+1).toLowerCase():``;return r===`html`||r===`htm`}function Ls({path:e,sessionId:t,onClose:n}){let[r,i]=(0,c.useState)({status:`loading`});(0,c.useEffect)(()=>{let n=!0;return i({status:`loading`}),I(e,t).then(e=>{n&&i({status:`ready`,preview:e})},e=>{if(!n)return;let t=e instanceof Error?e.message:`文件不可读`;i({status:`error`,message:t})}),()=>{n=!1}},[e,t]);let a=r.status===`ready`?r.preview:null,o=a?.kind===`image`,s=a===null?e.split(/[\\/]/).pop()??e:a.name;return(0,G.jsxs)(la,{title:s,onClose:n,children:[r.status===`loading`&&(0,G.jsx)(`div`,{className:`fp-loading`,children:`正在读取文件…`}),r.status===`error`&&(0,G.jsx)(`div`,{className:`fp-error`,children:r.message}),a!==null&&(0,G.jsxs)(G.Fragment,{children:[(0,G.jsxs)(`div`,{className:`fp-actions`,children:[(0,G.jsx)(`span`,{className:`fp-path`,title:a.path,children:a.path}),!o&&(0,G.jsxs)(`button`,{type:`button`,className:`fp-copy`,onClick:()=>{po(a.text,`已复制文件原文`)},children:[(0,G.jsx)(Na,{}),`复制原文`]})]}),o?(0,G.jsx)(`div`,{className:`fp-image-wrap`,children:(0,G.jsx)(`img`,{className:`fp-image`,src:a.dataUrl,alt:a.name,draggable:!1})}):(0,G.jsx)(Rs,{path:a.path,text:a.text})]})]})}function Rs({path:e,text:t}){let n=Zo(t,Ps(e)),r=e.split(/[\\/]/).pop()??e,i=Fs(e),a=Is(e),o=(0,c.useMemo)(()=>i?hs(t):null,[i,t]);return o===null?a?(0,G.jsx)(`iframe`,{className:`fp-html`,sandbox:``,title:r,srcDoc:t}):n===null?(0,G.jsx)(zs,{text:t,children:(0,G.jsx)(`pre`,{className:`fp-body fp-plain`,children:X(t)})}):(0,G.jsx)(zs,{text:t,children:(0,G.jsx)(`div`,{className:`fp-body`,dangerouslySetInnerHTML:{__html:n}})}):(0,G.jsx)(`div`,{className:`chat-md-body fp-md`,children:o.map(e=>e.kind===`think`?null:e.kind===`html`?(0,G.jsx)(`div`,{className:`md-html`,dangerouslySetInnerHTML:{__html:e.html}},e.id):e.kind===`code`?(0,G.jsx)(xs,{lang:e.lang,code:e.code},e.id):(0,G.jsx)(ks,{text:e.text},e.id))})}function zs({text:e,children:t}){let n=(0,c.useMemo)(()=>e.split(`
`).length,[e]),[r,i]=(0,c.useState)(!1),a=n>60,o=a&&!r;return(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(`div`,{className:`fp-scroll`+(o?` fp-scroll-folded`:``),children:t}),a&&(0,G.jsx)(`button`,{type:`button`,className:`fp-fold-btn`,onClick:()=>{i(e=>!e)},children:o?`展开全部（共 ${n} 行）`:`收起`})]})}function Bs({src:e,alt:t,onClose:n}){let[r,i]=(0,c.useState)(`fit`),a=(0,c.useRef)(0);return(0,c.useEffect)(()=>{let e=e=>{e.key===`Escape`&&n()};return window.addEventListener(`keydown`,e),()=>{window.removeEventListener(`keydown`,e)}},[n]),(0,c.useEffect)(()=>{let e=document.body.style.overflow;return document.body.style.overflow=`hidden`,()=>{document.body.style.overflow=e}},[]),(0,G.jsxs)(`div`,{className:`lightbox-backdrop`,role:`dialog`,"aria-modal":`true`,"aria-label":t,onClick:n,children:[(0,G.jsx)(`button`,{type:`button`,className:`lightbox-close`,"aria-label":`关闭`,onClick:n,children:(0,G.jsx)(La,{})}),(0,G.jsx)(`div`,{className:`lightbox-stage`+(r===`full`?` lightbox-stage-full`:``),onClick:e=>{e.stopPropagation()},children:(0,G.jsx)(`img`,{className:`lightbox-img`,src:e,alt:t,onClick:()=>{let e=Date.now();if(e-a.current<300){i(e=>e===`fit`?`full`:`fit`),a.current=0;return}a.current=e},draggable:!1})}),(0,G.jsx)(`div`,{className:`lightbox-hint`,"aria-hidden":!0,children:`双击放大/还原 · 点背景关闭`})]})}const Vs=16e3;function Hs(){return typeof navigator>`u`||typeof navigator.mediaDevices?.getUserMedia!=`function`||typeof AudioContext!=`function`&&typeof window.webkitAudioContext!=`function`?!1:window.isSecureContext===!0}function Us(e,t){let n=new Int16Array(e.length);for(let t=0;t<e.length;t++){let r=Math.max(-1,Math.min(1,e[t]));n[t]=r<0?r*32768:r*32767}let r=new ArrayBuffer(44),i=new DataView(r),a=(e,t)=>{for(let n=0;n<t.length;n++)i.setUint8(e+n,t.charCodeAt(n))},o=n.length*2;a(0,`RIFF`),i.setUint32(4,36+o,!0),a(8,`WAVE`),a(12,`fmt `),i.setUint32(16,16,!0),i.setUint16(20,1,!0),i.setUint16(22,1,!0),i.setUint32(24,t,!0),i.setUint32(28,t*2,!0),i.setUint16(32,2,!0),i.setUint16(34,16,!0),a(36,`data`),i.setUint32(40,o,!0);let s=new Uint8Array(44+o);s.set(new Uint8Array(r),0),s.set(new Uint8Array(n.buffer),44);let c=``;for(let e=0;e<s.length;e+=32768)c+=String.fromCharCode(...s.subarray(e,e+32768));return btoa(c)}async function Ws(e){if(!Hs())throw Error(`此浏览器不支持录音（需要 HTTPS 访问）`);let t;try{t=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:!0,noiseSuppression:!0}})}catch(t){if(e?.signal?.aborted===!0)throw Error(`录音已取消`);let n=t instanceof DOMException?t.name:``;throw Error(n===`NotAllowedError`?`麦克风权限被拒绝，请在浏览器设置中允许`:n===`NotFoundError`?`没有找到可用的麦克风`:`录音启动失败`)}if(e?.signal?.aborted===!0){for(let e of t.getTracks())e.stop();throw Error(`录音已取消`)}let n=new(typeof AudioContext==`function`?AudioContext:window.webkitAudioContext)({sampleRate:Vs}),r=n.createMediaStreamSource(t),i=n.createScriptProcessor(4096,1,1),a=[],o=0,s=!1;i.onaudioprocess=t=>{if(s)return;let n=t.inputBuffer.getChannelData(0);a.push(new Float32Array(n)),o+=n.length,o/Vs*1e3>=6e4&&(s=!0,l(),e?.onTimeout?.())},r.connect(i);let c=n.createGain();c.gain.value=0,i.connect(c),c.connect(n.destination);let l=()=>{s=!0;try{i.disconnect()}catch{}try{r.disconnect()}catch{}try{c.disconnect()}catch{}for(let e of t.getTracks())e.stop();n.close().catch(()=>{})};return e?.signal!==void 0&&e.signal.addEventListener(`abort`,l,{once:!0}),{stop(){let e=new Float32Array(o),t=0;for(let n of a)e.set(n,t),t+=n.length;let r=Us(e,n.sampleRate);return l(),e.length/n.sampleRate<.4?Promise.reject(Error(`录音太短，请按住后说话至少 1 秒`)):Promise.resolve(r)},cancel(){l()}}}const Gs=`dsh.palm.voiceServices`;function Ks(){try{let e=localStorage.getItem(Gs);if(e===null||e===``)return[];let t=JSON.parse(e);return Array.isArray(t)?t.filter(e=>{if(typeof e!=`object`||!e)return!1;let t=e;return typeof t.id==`string`&&typeof t.name==`string`&&typeof t.baseURL==`string`&&typeof t.apiKey==`string`&&typeof t.model==`string`}):[]}catch{return[]}}function qs(e){try{localStorage.setItem(Gs,JSON.stringify(e))}catch{}}function Js(){return Ks()}function Ys(e){let t=Ks(),n=t.findIndex(t=>t.id===e.id);n===-1?t.push(e):t[n]=e,qs(t.slice(0,8)),tc()}function Xs(e){qs(Ks().filter(t=>t.id!==e)),tc()}function Zs(e){let t=Ks(),n=t.findIndex(t=>t.id===e);if(n<=0)return;let[r]=t.splice(n,1);t.splice(n-1,0,r),qs(t),tc()}function Qs(e){let t=Ks(),n=t.findIndex(t=>t.id===e);if(n===-1||n>=t.length-1)return;let[r]=t.splice(n,1);t.splice(n+1,0,r),qs(t),tc()}function $s(e){qs(Ks().filter(e=>e.name!==`host 配置`).slice(0,8)),tc()}const ec=new Set;function tc(){for(let e of ec)e()}function nc(e){return ec.add(e),()=>{ec.delete(e)}}function rc({title:e,body:t,confirmLabel:n,tone:r=`primary`,busy:i=!1,onConfirm:a,onCancel:o}){return(0,c.useEffect)(()=>{let e=e=>{e.key===`Escape`&&o()};window.addEventListener(`keydown`,e);let t=document.body.style.overflow;return document.body.style.overflow=`hidden`,()=>{window.removeEventListener(`keydown`,e),document.body.style.overflow=t}},[o]),(0,G.jsx)(`div`,{className:`dialog-backdrop`,onClick:o,children:(0,G.jsxs)(`div`,{className:`dialog`,role:`alertdialog`,"aria-modal":`true`,"aria-label":e,onClick:e=>{e.stopPropagation()},children:[(0,G.jsx)(`h2`,{className:`dialog-title`,children:e}),(0,G.jsx)(`div`,{className:`dialog-body`,children:t}),(0,G.jsxs)(`div`,{className:`dialog-actions`,children:[(0,G.jsx)(`button`,{type:`button`,className:`dialog-btn`,disabled:i,onClick:o,children:`取消`}),(0,G.jsx)(`button`,{type:`button`,className:`dialog-btn ${r===`danger`?`dialog-btn-danger`:`dialog-btn-primary`}`,disabled:i,onClick:a,children:i?`处理中…`:n})]})]})})}function ic({title:e,initial:t,confirmLabel:n,busy:r=!1,onConfirm:i,onCancel:a}){let[o,s]=(0,c.useState)(t),l=(0,c.useRef)(null);(0,c.useEffect)(()=>{l.current?.select();let e=e=>{e.key===`Escape`&&a()};window.addEventListener(`keydown`,e);let t=document.body.style.overflow;return document.body.style.overflow=`hidden`,()=>{window.removeEventListener(`keydown`,e),document.body.style.overflow=t}},[a]);let u=()=>{let e=o.trim();e!==``&&i(e)};return(0,G.jsx)(`div`,{className:`dialog-backdrop`,onClick:a,children:(0,G.jsxs)(`div`,{className:`dialog`,role:`dialog`,"aria-modal":`true`,"aria-label":e,onClick:e=>{e.stopPropagation()},children:[(0,G.jsx)(`h2`,{className:`dialog-title`,children:e}),(0,G.jsx)(`input`,{ref:l,className:`dialog-input`,value:o,"aria-label":e,disabled:r,onChange:e=>{s(e.target.value)},onKeyDown:e=>{e.key===`Enter`&&(e.preventDefault(),u())}}),(0,G.jsxs)(`div`,{className:`dialog-actions`,children:[(0,G.jsx)(`button`,{type:`button`,className:`dialog-btn`,disabled:r,onClick:a,children:`取消`}),(0,G.jsx)(`button`,{type:`button`,className:`dialog-btn dialog-btn-primary`,disabled:r||o.trim()===``,onClick:u,children:r?`保存中…`:n})]})]})})}const ac=new Map,oc=new Map;function sc(e){let t=ac.get(e);if(t!==void 0)return ac.delete(e),ac.set(e,t),t}async function cc(e,t){let n=sc(t);if(n!==void 0)return n;let r=oc.get(t);if(r!==void 0)return await r;let i=E(e,t).then(e=>{if(ac.set(t,e.dataUrl),ac.size>16){let e=ac.keys().next();e.done||ac.delete(e.value)}return e.dataUrl}).catch(()=>void 0).finally(()=>{oc.delete(t)});return oc.set(t,i),await i}const lc=new Map,uc=new Map;function dc(e,t){return e+`\0`+t}function fc(e,t){let n=dc(e,t),r=lc.get(n);if(r!==void 0)return lc.delete(n),lc.set(n,r),r}async function pc(e,t){let n=fc(e,t);if(n!==void 0)return n;let r=dc(e,t),i=uc.get(r);if(i!==void 0)return await i;let a=I(t,e).then(e=>{if(e.kind===`image`){if(lc.set(r,e.dataUrl),lc.size>16){let e=lc.keys().next();e.done||lc.delete(e.value)}return e.dataUrl}}).catch(()=>void 0).finally(()=>{uc.delete(r)});return uc.set(r,a),await a}function Z(e){let t=e.trimEnd();if(t===``)return``;let n=t.lastIndexOf(`
`),r=n===-1?t:t.slice(n+1);return r.trim()===``?``:r}function mc(e){let t=e.trim();if(t===``)return``;let n=t.indexOf(`
`);return n===-1?t:t.slice(0,n)}function hc({text:e,pending:t,label:n=`深度思考`}){let[r,i]=(0,c.useState)(!1),[a,o]=(0,c.useState)(!1),s=(0,c.useRef)(null),l=t?Z(e):mc(e),u=(0,c.useMemo)(()=>e.split(`
`),[e]),d=Math.max(0,u.length-5);(0,c.useEffect)(()=>{let e=s.current;r&&a&&e&&(e.scrollTop=e.scrollHeight)},[r,a,e]);let f=r&&!a&&d>0?u.slice(0,5).join(`
`)+`
…`:e;return(0,G.jsxs)(`div`,{className:`chat-disclosure chat-reasoning${r?` chat-disclosure-open`:``}`,"data-pending":t||void 0,children:[(0,G.jsxs)(`button`,{type:`button`,className:`chat-disclosure-head`,"aria-expanded":r,onClick:()=>{i(e=>!e)},children:[(0,G.jsx)(`span`,{className:`chat-disclosure-icon`,"aria-hidden":!0,children:(0,G.jsx)(ua,{})}),(0,G.jsx)(`span`,{className:`chat-disclosure-label`,children:t?`思考中…`:n}),!r&&(0,G.jsx)(`span`,{className:`chat-disclosure-summary`,children:l}),(0,G.jsx)(`span`,{className:`chat-disclosure-caret`,"aria-hidden":!0,children:(0,G.jsx)(va,{})})]}),r&&(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(`div`,{className:`chat-disclosure-body`,ref:s,children:f}),d>0&&(0,G.jsx)(`button`,{type:`button`,className:`chat-reasoning-more`,onClick:()=>{o(e=>!e)},children:a?`收起`:`还有 ${d} 行思考...`})]})]})}function gc({text:e,pending:t,forceOpen:n=!1,highlightQuery:r,sessionId:i}){let[a,o]=(0,c.useState)(n);(0,c.useEffect)(()=>{n&&o(!0)},[n]);let s=(0,c.useRef)(null),l=(0,c.useRef)(0),u=(0,c.useRef)(null),d=(0,c.useRef)(null),f=e=>{let t=d.current;if(t!==null&&e.startsWith(t.text)){let n=e.slice(t.text.length),r=t.html+X(n).replace(/\n/g,`<br />`);return d.current={text:e,html:r},r}let n=X(e).replace(/\n/g,`<br />`);return d.current={text:e,html:n},n},p=e=>e.length>2e3?f(e):X(e).replace(/(^|[^`])`([^`\n]+)`(?=$|[^`])/g,`$1<code>$2</code>`).replace(/\*\*([^*\n]+)\*\*/g,`<strong>$1</strong>`).replace(/(^|[^*])\*([^*\n]+)\*(?=$|[^*])/g,`$1<em>$2</em>`).replace(/~~([^~\n]+)~~/g,`<del>$1</del>`).replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g,(e,t,n)=>{let r=$o(n);return r===null?e:`<a href="${X(r)}" target="_blank" rel="noopener noreferrer">${t}</a>`}).split(/\n{2,}/).map(e=>`<p>${e.replace(/\n/g,`<br />`)}</p>`).join(``),[m,h]=(0,c.useState)(()=>t?[{kind:`html`,id:0,html:p(e)}]:hs(e)),g=(0,c.useRef)(t?``:e),_=(0,c.useRef)(t?e:``);(0,c.useEffect)(()=>{if(t){if(s.current!==null&&e===_.current)return;_.current=e;let t=s.current;t===null&&(t={blocks:[],stableLen:0},s.current=t);let n=u.current,r=e=>e.replace(/\r\n/g,`
`);n!==null&&t.stableLen>0&&r(e).slice(0,t.stableLen)!==r(n).slice(0,t.stableLen)&&(t.blocks=[],t.stableLen=0,l.current=0),u.current=e;let i=ys(e,t.stableLen);for(let e of i.blocks){let n=t.blocks[t.blocks.length-1];e.kind===`html`&&n!==void 0&&n.block.kind===`html`?t.blocks[t.blocks.length-1]={id:n.id,block:{kind:`html`,html:n.block.html+e.html}}:(t.blocks.push({id:l.current,block:e}),l.current+=1)}if(t.stableLen=i.stableLen,t.blocks.length===0){h([{kind:`html`,id:0,html:p(e)}]);return}h([...t.blocks.map(e=>({id:e.id,...e.block})),...i.tail===``?[]:[{kind:`html`,id:-1,html:p(i.tail)}]]);return}e!==g.current&&(g.current=e,s.current=null,u.current=null,h(hs(e)))},[e,t]);let v=!t&&e.length>6e3,y=v&&!a,b=(0,c.useRef)(null);return(0,c.useEffect)(()=>{let e=b.current;if(e===null||i===void 0)return;let t=e.querySelectorAll(`img.md-local-img[data-local-src]`);for(let e of t){if(e.dataset.localState!==void 0)continue;let t=e.getAttribute(`data-local-src`);t!==null&&t!==``&&(e.dataset.localState=`loading`,pc(i,t).then(t=>{if(e.isConnected){if(t===void 0){e.dataset.localState=`failed`;return}e.dataset.localState=`loaded`,e.src=t}}))}},[m,i]),(0,G.jsxs)(`div`,{className:`chat-msg-text chat-md`+(y?` chat-md-collapsed`:``),children:[(0,G.jsxs)(`div`,{className:`chat-md-body`,ref:b,children:[m.map(e=>e.kind===`think`?null:e.kind===`html`?(0,G.jsx)(`div`,{className:`md-html`,dangerouslySetInnerHTML:{__html:yc(e.html,r)}},e.id):e.kind===`code`?(0,G.jsx)(xs,{lang:e.lang,code:e.code},e.id):(0,G.jsx)(ks,{text:e.text},e.id)),m.some(e=>e.kind===`think`)&&(0,G.jsx)(`div`,{className:`chat-md-notes`,children:m.map(e=>e.kind===`think`?(0,G.jsx)(hc,{text:e.text,pending:!1,label:`思考过程`},e.id):null)})]}),v&&(0,G.jsx)(`button`,{type:`button`,className:`chat-msg-toggle`,onClick:()=>{o(e=>!e)},children:a?`收起`:`展开全文（`+e.length+` 字）`})]})}function _c({text:e,forceOpen:t=!1,highlightQuery:n}){let[r,i]=(0,c.useState)(t);(0,c.useEffect)(()=>{t&&i(!0)},[t]);let a=e=>bc(e,n);if(e.length<=6e3)return(0,G.jsx)(`span`,{className:`chat-msg-text`,children:a(e)});let o=r?e:e.slice(0,800);return(0,G.jsxs)(`span`,{className:`chat-msg-text`,children:[a(o),r?``:`…`,(0,G.jsx)(`button`,{type:`button`,className:`chat-msg-toggle`,onClick:()=>{i(e=>!e)},children:r?`收起`:`展开全文（${e.length} 字）`})]})}function vc(e){let t=e?.trim();if(t===void 0||t===``)return;let n=t.split(/\s+/).filter(Boolean).map(e=>e.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`));return new RegExp(n.sort((e,t)=>t.length-e.length).join(`|`),`gi`)}function yc(e,t){let n=vc(t);return n===void 0?e:e.split(/(<[^>]+>)/g).map(e=>e.startsWith(`<`)?e:e.replace(n,e=>`<mark class="chat-search-mark">${e}</mark>`)).join(``)}function bc(e,t){let n=vc(t);if(n===void 0)return e;let r=[],i=0;for(let t of e.matchAll(n)){let n=t.index;n>i&&r.push(e.slice(i,n)),r.push((0,G.jsx)(`mark`,{className:`chat-search-mark`,children:t[0]},`${n}:${t[0]}`)),i=n+t[0].length}return i<e.length&&r.push(e.slice(i)),r}const xc={bash:`bash`,pwsh:`bash`,read:`read`,read_image:`read`,web_fetch:`read`,web_search:`search`,grep:`search`,glob:`search`,write:`write`,edit:`edit`,run_code:`code`},Sc={search:`搜索`,read:`读取`,bash:`运行命令`,write:`写入`,edit:`编辑`,code:`运行代码`,others:`工具`},Cc={pwsh:`运行命令`,read_image:`查看图片`,web_fetch:`抓取网页`,web_search:`联网搜索`,grep:`搜索内容`,glob:`查找文件`},wc={bash:[`description`,`command`],read:[`path`,`file_path`,`url`],search:[`query`,`pattern`,`url`],write:[`path`,`file_path`],edit:[`path`,`file_path`],code:[`description`],others:[]},Tc=[`path`,`file_path`],Ec=new Set([`read`,`write`,`edit`]);function Dc(e){let t=e.indexOf(`
`);return t===-1?e:e.slice(0,t)}function Oc(e){try{let t=JSON.parse(e);return typeof t==`object`&&t&&!Array.isArray(t)?t:void 0}catch{return}}function kc(e,t){for(let n of t){let t=e[n];if(typeof t==`string`&&t!==``)return t}}function Ac(e){return xc[e]??`others`}function jc(e){let t=Ac(e.name),n=e.arguments??``,r=n===``?void 0:Oc(n),i=``;if(r!==void 0){let e=t===`search`&&Array.isArray(r.queries)?r.queries:void 0;if(e!==void 0){let t=e.filter(e=>typeof e==`string`&&e!==``);t.length>0&&(i=t.map(Dc).join(`，`))}if(i===``&&(i=kc(r,wc[t])??``),i===``){for(let e of Object.values(r))if(typeof e==`string`&&e!==``){i=e;break}}}i===``&&(i=n===``?e.name:n),i=Dc(i);let a=Ec.has(t)&&r!==void 0?kc(r,Tc):void 0,o=Cc[e.name];return{variant:t,title:o??Sc[t],summary:t===`others`&&o===void 0&&n!==``?`${e.name} · ${i}`:i,...a===void 0?{}:{filePath:Dc(a)}}}const Mc={running:`深度求索中`,ok:`已完成`,stopped:`已中断`,failed:`失败`};function Nc(e){return Mc[e]}function Pc(e,t){return e.pending===!0||(e.tools??[]).some(e=>e.state===`running`)||t!==void 0&&e.turn!==void 0&&e.turn===t}function Fc(e,t){return Pc(e,t)?`running`:e.failed===!0?`failed`:e.maxTokens===!0||(e.tools??[]).some(e=>e.state===`stopped`)?`stopped`:`ok`}function Ic(e){if(e===void 0)return{adds:0,dels:0};let t=0,n=0;for(let r of e.diffs)r.oldText!==null&&(n+=Lc(r.oldText).length),t+=Lc(r.newText).length;return{adds:t,dels:n}}function Lc(e){return e===``?[]:(e.endsWith(`
`)?e.slice(0,-1):e).split(`
`)}function Rc(e){let t=Math.max(0,Math.round(e/1e3)),n=Math.floor(t/3600),r=Math.floor(t%3600/60),i=t%60;return n>0?`${n}小时${r}分`:r>0?`${r}分${i}秒`:`${i}秒`}function zc(e){return e.split(`
`).length}function Bc(e){let t=0,n=0;for(let r of e){let e=Ic(r.view);t+=e.adds,n+=e.dels}return{adds:t,dels:n}}function Vc(e,t,n,r){for(let e=t.length-1;e>=0;e--){let i=t[e];if(i!==void 0&&i.kind===`text`&&(i.seq!==void 0&&r!==void 0&&i.seq===r||i.text===n))return e}return-1}function Hc(e,t){let n=e.flow??[],r=new Map((e.tools??[]).map(e=>[e.callId,e])),i=e.stepSeqs,a=e.stepTexts,o=i!==void 0&&a!==void 0&&i.length===a.length&&a.length>=2,s=o?a[a.length-1]??``:``,c=o?i[i.length-1]:void 0,l=o&&s.trim()!==``,u=Pc(e,t),d,f,p=-1,m=!1;if(l)d=s,f=c,p=Vc(e,n,s,c);else if(!o){let t=n.filter(e=>e.kind===`text`&&e.text.trim()!==``);if(m=!0,e.text.trim()!==``)d=e.text,f=t[0]?.seq;else if(t.length>0){let e=t[t.length-1];e!==void 0&&(d=e.text,f=e.seq)}}else if(u)for(let e=n.length-1;e>=0;e--){let t=n[e];if(t!==void 0&&t.kind===`text`&&t.text.trim()!==``){d=t.text,f=t.seq,p=e;break}}let h=[],g=0,_=0;for(let e=0;e<n.length;e++){let t=n[e];if(t!==void 0&&e!==p){if(t.kind===`reasoning`){if(t.text.trim()===``)continue;_+=1,h.push({kind:`reasoning`,key:`r${e}`,text:t.text,lines:zc(t.text)})}else if(t.kind===`tool`){let n=r.get(t.callId);if(n===void 0)continue;g+=1,h.push({kind:`tool`,key:`t${e}`,tool:n})}else!m&&t.text.trim()!==``&&h.push({kind:`text`,key:`x${e}`,text:t.text,...t.seq===void 0?{}:{seq:t.seq}})}}let v=new Set;for(let e of n)e.kind===`tool`&&v.add(e.callId);for(let t of e.tools??[])v.has(t.callId)||(g+=1,h.push({kind:`tool`,key:`t-${t.callId}`,tool:t}));if(_===0&&(e.reasoning??``).trim()!==``){let t=e.reasoning??``;h.unshift({kind:`reasoning`,key:`r-merged`,text:t,lines:zc(t)}),_=1}d===void 0&&h.length===0&&e.text.trim()!==``&&(d=e.text);let y=Q(e,h,t),b=new Set,x=``,S=0;for(let t of e.tools??[]){t.state===`error`&&(S+=1);for(let e of t.view?.diffs??[])b.add(e.path);x===``&&t.view!==void 0&&(x=t.view.title??t.name)}let C=Bc(e.tools??[]);return{rows:h,answer:d,answerSeq:f,toolCount:g,reasoningCount:_,current:y,outcome:Fc(e,t),changedFiles:b.size,errorCount:S,artifactTitle:x,artifactCount:h.filter(e=>e.kind===`tool`&&e.tool.view!==void 0).length,tallyAdds:C.adds,tallyDels:C.dels}}function Q(e,t,n){if(Pc(e,n)){let n=[...e.flow??[]].reverse().find(e=>e.kind!==`text`||e.text.trim()!==``);if(n===void 0||n.kind===`reasoning`)return{kind:`thinking`,text:`思考中`};if(n.kind===`text`)return{kind:`answering`,text:`正在回答`};let r=t.find(e=>e.kind===`tool`&&e.tool.callId===n.callId);return r===void 0||r.kind!==`tool`?{kind:`thinking`,text:`思考中`}:r.tool.state===`running`?Uc(r.tool):{kind:`thinking`,text:`思考中`}}for(let e=t.length-1;e>=0;--e){let n=t[e];if(n!==void 0){if(n.kind===`tool`)return Uc(n.tool);if(n.kind===`reasoning`)return{kind:`thinking`,text:`深度思考 ${n.lines} 行`}}}}function Uc(e){let t=jc(e);return{kind:`tool`,text:t.summary===``?t.title:`${t.title} · ${t.summary}`,variant:t.variant}}function Wc(e,t){return e.changedFiles>0?`改了 ${e.changedFiles} 个文件`:t?`未改动文件`:``}function Gc(e,t){let n=t?e.toolCount:0;return n>0?`共 ${n} 步`:``}function Kc(e){return e.errorCount>0?`⚠ ${e.errorCount} 处报错`:``}function qc(e,t){return t?e.rows.length:e.rows.filter(e=>e.kind!==`tool`).length+e.artifactCount}function Jc(e,t){let n=t.running?`running`:e.outcome===`running`?`ok`:e.outcome,r=Yc(n,t);return r===``?Nc(n):`${Nc(n)}，${r}`}function Yc(e,t){return e===`running`?t.liveElapsedMs===void 0||t.liveElapsedMs<3e3?``:`用时${Rc(t.liveElapsedMs)}`:t.durationMs===void 0?``:`用时${Rc(t.durationMs)}`}const Xc=(0,c.memo)(function({message:e,sessionId:t,showToolCalls:n,showSystemMessages:r,showTime:i=!0,focused:a=!1,focusedQuery:o,style:s,onRegenerate:c,onOpenFile:l,clockOffsetMs:u,liveTurnStartAt:d,liveTurn:f}){let p=e.startSeq??e.seq;if(e.kind===`user`&&e.sourceKind!==void 0&&e.sourceKind!==`user`){let t=Ct(e.sourceKind);if(t!==void 0){let n=e=>String(e).padStart(2,`0`),r=new Date(e.time),o=`${n(r.getHours())}:${n(r.getMinutes())}`;return(0,G.jsxs)(`details`,{"data-mid":e.id,"data-message-id":e.id,"data-row-seq":p,className:`chat-trigger`+(a?` chat-msg-focus`:``),style:s,children:[(0,G.jsxs)(`summary`,{className:`chat-trigger-head`,children:[(0,G.jsx)(`span`,{className:`chat-trigger-icon`,"aria-hidden":!0,children:Tt(e.sourceKind)}),(0,G.jsx)(`span`,{className:`chat-trigger-title`,children:t}),i&&(0,G.jsx)(`span`,{className:`chat-trigger-time`,children:o}),(0,G.jsx)(`span`,{className:`chat-trigger-caret`,"aria-hidden":!0,children:`▾`})]}),(0,G.jsxs)(`div`,{className:`chat-trigger-body`,children:[(0,G.jsx)(`p`,{className:`chat-trigger-note`,children:`这条通知触发了本轮回复。`}),e.text.trim()!==``&&(0,G.jsx)(`div`,{className:`chat-trigger-text`,children:e.text})]})]})}if(!r)return null}if(e.kind===`command`)return(0,G.jsxs)(`div`,{"data-mid":e.id,"data-message-id":e.id,"data-row-seq":p,className:`chat-command`+(e.commandPhase===`error`?` chat-command-error`:``)+(a?` chat-msg-focus`:``),style:s,role:`status`,children:[(0,G.jsx)(`span`,{className:`chat-command-name`,children:e.commandLine??`命令`}),(0,G.jsx)(`span`,{className:`chat-command-result`,children:e.commandPhase===`running`?`执行中…`:e.text})]});if(e.kind===`turn`){let t=(e.deliverables?.length??0)+(e.produced?.length??0);return t===0?null:(0,G.jsxs)(`div`,{"data-mid":e.id,"data-message-id":e.id,"data-row-seq":p,className:`chat-turn-tail`,style:s,children:[(0,G.jsxs)(`div`,{className:`chat-turn-tail-head`,children:[(0,G.jsx)(`span`,{className:`chat-turn-tail-title`,children:`本轮产出`}),(0,G.jsxs)(`span`,{className:`chat-turn-tail-count`,children:[t,` 个文件`]})]}),e.deliverables!==void 0&&e.deliverables.length>0&&(0,G.jsxs)(`div`,{className:`chat-turn-tail-section`,children:[(0,G.jsx)(`span`,{className:`chat-turn-tail-label`,children:`交付物`}),e.deliverables.map(e=>(0,G.jsxs)(`button`,{type:`button`,className:`chat-turn-tail-file`,onClick:()=>{l?.(e.path)},children:[(0,G.jsxs)(`span`,{className:`chat-turn-tail-file-name`,children:[e.description??ul(e.path),(0,G.jsx)(`span`,{className:`chat-turn-tail-badge`,children:`已交付`})]}),(0,G.jsx)(`span`,{className:`chat-turn-tail-file-path`,children:e.path})]},e.path))]}),e.produced!==void 0&&e.produced.length>0&&(0,G.jsxs)(`div`,{className:`chat-turn-tail-section`,children:[(0,G.jsx)(`span`,{className:`chat-turn-tail-label`,children:`本轮产出文件`}),e.produced.map(e=>(0,G.jsx)(`button`,{type:`button`,className:`chat-turn-tail-file`,onClick:()=>{l?.(e)},children:(0,G.jsx)(`span`,{className:`chat-turn-tail-file-path`,children:e})},e))]})]})}let m=e.kind===`assistant`&&e.reasoning!==void 0&&e.reasoning!==``,h=n&&e.kind===`assistant`&&e.tools!==void 0&&e.tools.length>0,g=e.text!==``,_=e.failed===!0,v=t!==void 0&&e.images!==void 0&&e.images.length>0?e.images:void 0,y=v!==void 0,b=e.flow!==void 0&&e.flow.some(e=>e.kind===`text`&&e.text!==``);return!m&&!h&&!g&&!_&&!b&&!y?null:(0,G.jsxs)(`div`,{"data-mid":e.id,"data-message-id":e.id,"data-row-seq":p,className:`chat-msg chat-msg-${e.kind}${e.pending===!0?` chat-msg-pending`:``}${e.failed===!0?` chat-msg-failed`:``}${a?` chat-msg-focus`:``}`,style:s,children:[e.kind===`assistant`?(0,G.jsx)(ol,{message:e,showToolCalls:n,forceOpen:a,focusedQuery:a?o:void 0,sessionId:t,clockOffsetMs:u,liveTurnStartAt:d,liveTurn:f}):(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(_c,{text:e.text,forceOpen:a,highlightQuery:a?o:void 0}),v!==void 0&&t!==void 0&&(0,G.jsx)(Zc,{sessionId:t,images:v})]}),e.failed===!0&&(0,G.jsx)(`span`,{className:`chat-msg-failtag`,children:`本次回复失败`}),e.maxTokens===!0&&(0,G.jsx)(`div`,{className:`chat-msg-maxtokens`,children:`已达到输出 token 上限，回答被截断。发送“继续”可让模型接着输出。`}),(0,G.jsxs)(`span`,{className:`chat-msg-footer`,children:[i&&(0,G.jsx)(`span`,{className:`chat-msg-time`,children:Ud(e.time)}),e.kind===`assistant`&&c!==void 0&&(0,G.jsxs)(`button`,{type:`button`,className:`chat-msg-regenerate`,onClick:c,"aria-label":`重新生成回复`,children:[(0,G.jsx)(`span`,{className:`chat-msg-regenerate-icon`,"aria-hidden":!0,children:`↻`}),`重新生成`]})]})]})});function Zc({sessionId:e,images:t}){return(0,G.jsx)(`div`,{className:`chat-msg-images`,role:`list`,"aria-label":`消息图片`,children:t.map(t=>(0,G.jsx)(Qc,{sessionId:e,image:t},t.attachmentId))})}function Qc({sessionId:e,image:t}){let[n,r]=(0,c.useState)(()=>sc(t.attachmentId)),[i,a]=(0,c.useState)(!1),[o,s]=(0,c.useState)(0),l=t.name!==void 0&&t.name!==``?t.name:`图片`;return(0,c.useEffect)(()=>{if(n!==void 0)return;let i=!1;return cc(e,t.attachmentId).then(e=>{i||(e===void 0?a(!0):(a(!1),r(e)))}),()=>{i=!0}},[e,t.attachmentId,n,o]),n===void 0?(0,G.jsx)(`button`,{type:`button`,role:`listitem`,className:`chat-msg-image chat-msg-image-placeholder${i?` chat-msg-image-failed`:``}`,"aria-label":i?`${l}，加载失败，点击重试`:`${l}，加载中`,onClick:()=>{i&&(a(!1),s(e=>e+1))},children:i?`图片加载失败，点击重试`:`图片加载中…`}):(0,G.jsx)(`img`,{className:`chat-msg-image`,role:`listitem`,src:n,alt:l,loading:`lazy`,...t.width>0?{width:t.width}:{},...t.height>0?{height:t.height}:{}})}function $c(e){let[t,n]=(0,c.useState)(()=>Date.now());return(0,c.useEffect)(()=>{if(!e)return;n(Date.now());let t=setInterval(()=>{n(Date.now())},1e3);return()=>{clearInterval(t)}},[e]),t}function el({message:e,model:t,showToolCalls:n,focusedQuery:r,sessionId:i,clockOffsetMs:a,liveTurnStartAt:o,liveTurn:s}){let[l,u]=(0,c.useState)(!1),d=Pc(e,s),f=$c(d),p=e.turnStartAt??o,m=d&&p!==void 0?Math.max(0,f+(a??0)-p):void 0,h=(0,c.useRef)({anchor:void 0,elapsed:0});h.current.anchor!==p&&(h.current={anchor:p,elapsed:0}),m!==void 0&&m>h.current.elapsed&&(h.current={anchor:p,elapsed:m});let g=d&&p!==void 0?h.current.elapsed:void 0,_=e.durationMs??(e.turnStartAt===void 0?void 0:Math.max(0,e.time-e.turnStartAt)),v=d?`running`:t.outcome===`running`?`ok`:t.outcome,y=Jc(t,{running:d,durationMs:_,...g===void 0?{}:{liveElapsedMs:g}}),b=Nc(v),x=Yc(v,{durationMs:_,...g===void 0?{}:{liveElapsedMs:g}}),S=t.current,C=Kc(t),w=C===``?y:`${y}，${C}`,T=Wc(t,!d),ee=Gc(t,n),te=qc(t,n),E=d?`⏳`:t.outcome===`failed`?`❌`:t.outcome===`stopped`?`⏹️`:`✅`,D=(0,G.jsx)(`span`,{className:`chat-proc-lead${d?` chat-proc-lead-running`:``}`,"aria-hidden":!0,children:E});return te===0?(0,G.jsx)(`div`,{className:`chat-proc`,"data-proc-rows":`0`,children:(0,G.jsxs)(`div`,{className:`chat-proc-head chat-proc-head-static`,role:`status`,"aria-label":w,children:[(0,G.jsxs)(`span`,{className:`chat-proc-line chat-proc-label`,children:[D,(0,G.jsx)(`span`,{className:`chat-proc-state`,children:b}),C!==``&&(0,G.jsx)(`span`,{className:`chat-proc-errors`,children:C}),x!==``&&(0,G.jsx)(`span`,{className:`chat-proc-time`,children:x})]}),S!==void 0&&(0,G.jsx)(`span`,{className:`chat-proc-line chat-proc-current`,children:(0,G.jsx)(`span`,{className:`chat-proc-current-text`,children:S.text})})]})}):(0,G.jsxs)(`div`,{className:`chat-proc${l?` chat-proc-open`:``}${d?` chat-proc-running`:``}`,"data-proc-rows":te,children:[(0,G.jsxs)(`button`,{type:`button`,className:`chat-proc-head`,"aria-expanded":l,onClick:()=>{u(e=>!e)},children:[(0,G.jsxs)(`span`,{className:`chat-proc-line chat-proc-label`,children:[D,(0,G.jsx)(`span`,{className:`chat-proc-state`,children:b}),C!==``&&(0,G.jsx)(`span`,{className:`chat-proc-errors`,children:C}),x!==``&&(0,G.jsx)(`span`,{className:`chat-proc-time`,children:x})]}),S!==void 0&&(0,G.jsxs)(`span`,{className:`chat-proc-line chat-proc-current`,children:[(0,G.jsx)(`span`,{className:`chat-step-icon${S.variant===void 0?` chat-step-icon-thinking`:``}${d&&S.variant===`bash`?` chat-step-icon-spin`:``}`,"aria-hidden":!0,children:S.variant===void 0?`💭`:al(S.variant)}),(0,G.jsx)(`span`,{className:`chat-proc-current-text`,children:S.text}),T!==``&&(0,G.jsx)(`span`,{className:`chat-proc-meta`,children:T})]}),(0,G.jsx)(`span`,{className:`chat-proc-caret`,"aria-hidden":!0,children:l?`▾`:`▸`})]}),l&&(0,G.jsxs)(`div`,{className:`chat-proc-body`,children:[ee!==``&&(0,G.jsx)(`div`,{className:`chat-proc-steps`,children:ee}),(0,G.jsx)(tl,{message:e,model:t,showToolCalls:n,focusedQuery:r,sessionId:i})]})]})}function tl({message:e,model:t,showToolCalls:n,focusedQuery:r,sessionId:i}){let a=[],o=[],s=0,l=0,u=()=>{o.length>0&&(a.push((0,G.jsx)(sl,{tools:o},`card-${s}`)),s+=1,o=[])};for(let s of t.rows){if(s.kind===`reasoning`){u(),a.push((0,G.jsx)(nl,{row:s},s.key));continue}if(s.kind===`tool`){n&&a.push((0,G.jsx)(rl,{tool:s.tool},s.key)),s.tool.view===void 0?u():o.push(s.tool);continue}u();let t=s.seq??e.stepSeqs?.[l],d=(0,G.jsx)(gc,{text:s.text,pending:e.pending===!0,forceOpen:r!==void 0,highlightQuery:r,sessionId:i});a.push(t===void 0?(0,G.jsx)(c.Fragment,{children:d},s.key):(0,G.jsx)(`div`,{className:`chat-flow-text`,"data-step-seq":t,"data-part-id":`text-${l}`,children:d},s.key)),l+=1}return u(),(0,G.jsx)(G.Fragment,{children:a})}function nl({row:e}){let[t,n]=(0,c.useState)(!1);return(0,G.jsxs)(`div`,{className:`chat-think`,children:[(0,G.jsxs)(`button`,{type:`button`,className:`chat-think-head`,"aria-expanded":t,onClick:()=>{n(e=>!e)},children:[(0,G.jsx)(`span`,{className:`chat-think-icon`,"aria-hidden":!0,children:`✦`}),(0,G.jsxs)(`span`,{className:`chat-think-label`,children:[`深度思考 · `,e.lines,` 行`]}),(0,G.jsx)(`span`,{className:`chat-think-caret`,"aria-hidden":!0,children:t?`▾`:`▸`})]}),t&&(0,G.jsx)(`div`,{className:`chat-think-body`,children:e.text})]})}function rl({tool:e}){let[t,n]=(0,c.useState)(!1),r=jc(e),i=e.state??`running`,a=e.view===void 0?void 0:Ic(e.view);return(0,G.jsxs)(`div`,{className:`chat-step`,"data-state":i,children:[(0,G.jsxs)(`button`,{type:`button`,className:`chat-step-head`,"aria-expanded":t,onClick:()=>{n(e=>!e)},children:[(0,G.jsx)(`span`,{className:`chat-step-icon`,"aria-hidden":!0,children:al(r.variant)}),(0,G.jsx)(`span`,{className:`chat-step-title`,children:r.title}),(0,G.jsx)(`span`,{className:`chat-step-summary`,children:r.summary}),(0,G.jsx)(`span`,{className:`chat-step-state chat-step-state-${i}`,children:il[i]??i}),a!==void 0&&(0,G.jsxs)(`span`,{className:`chat-step-tally`,"aria-hidden":!0,children:[(0,G.jsxs)(`span`,{className:`chat-step-tally-add`,children:[`+`,a.adds]}),(0,G.jsxs)(`span`,{className:`chat-step-tally-del`,children:[`−`,a.dels]})]}),(0,G.jsx)(`span`,{className:`chat-step-caret`,"aria-hidden":!0,children:t?`▾`:`▸`})]}),t&&e.arguments!==void 0&&(0,G.jsx)(`pre`,{className:`chat-tool-args`,children:e.arguments})]})}const il={running:`运行中`,ok:`完成`,error:`失败`,stopped:`已中断`};function al(e){return e===`search`?`🔍`:e===`read`?`📂`:e===`bash`?`⚙️`:e===`write`||e===`edit`?`✏️`:e===`code`?`💻`:`🔧`}function ol({message:e,showToolCalls:t,forceOpen:n,focusedQuery:r,sessionId:i,clockOffsetMs:a,liveTurnStartAt:o,liveTurn:s}){let l=(0,c.useMemo)(()=>Hc(e,s),[e,s]),u=qc(l,t)>0||e.durationMs!==void 0||e.turnStartAt!==void 0,d=l.answer;return(0,G.jsxs)(G.Fragment,{children:[u&&(0,G.jsx)(el,{message:e,model:l,showToolCalls:t,focusedQuery:r,sessionId:i,clockOffsetMs:a,liveTurnStartAt:o,liveTurn:s}),d!==void 0&&d!==``&&(l.answerSeq===void 0?(0,G.jsx)(gc,{text:d,pending:e.pending===!0,forceOpen:n,highlightQuery:r,sessionId:i}):(0,G.jsx)(`div`,{className:`chat-flow-text chat-flow-answer`,"data-step-seq":l.answerSeq,"data-part-id":`answer`,children:(0,G.jsx)(gc,{text:d,pending:e.pending===!0,forceOpen:n,highlightQuery:r,sessionId:i})}))]})}function sl({tools:e}){let t=(0,c.useMemo)(()=>{let t=e.filter(e=>e.view!==void 0);if(t.length!==0)return{card:`diff`,title:t.length===1?t[0]?.view?.title??t[0]?.name??``:`编辑了 ${t.length} 个文件`,diffs:t.flatMap(e=>e.view?.diffs??[])}},[e]);return t===void 0?null:(0,G.jsx)(cl,{tool:{...e.find(e=>e.view!==void 0),view:t}})}function cl({tool:e}){let[t,n]=(0,c.useState)(!1),r=(0,c.useRef)(null),i=e.view,a=(0,c.useMemo)(()=>Ic(i),[i]);return(0,c.useEffect)(()=>{let e=r.current;e!==null&&(e.style.maxHeight=t?`${e.scrollHeight}px`:`0px`)},[t,i]),i===void 0?null:(0,G.jsxs)(`div`,{className:`chat-artifact`,children:[(0,G.jsxs)(`button`,{type:`button`,className:`chat-artifact-head`,"aria-expanded":t,onClick:()=>{n(e=>!e)},children:[(0,G.jsx)(`span`,{className:`chat-artifact-title`,children:i.title??e.name}),(0,G.jsxs)(`span`,{className:`chat-artifact-summary`,children:[(0,G.jsxs)(`span`,{className:`chat-artifact-stat chat-artifact-stat-add`,children:[`+`,a.adds]}),(0,G.jsxs)(`span`,{className:`chat-artifact-stat chat-artifact-stat-del`,children:[`−`,a.dels]})]}),(0,G.jsx)(`span`,{className:`chat-artifact-caret`,"aria-hidden":!0,children:t?`▾`:`▸`})]}),t&&(0,G.jsx)(ll,{view:i,diffRef:r})]})}function ll({view:e,diffRef:t}){let n=(0,c.useMemo)(()=>{let t=[];for(let n of e.diffs){if(t.push({kind:`path`,text:n.path}),n.oldText!==null)for(let e of Lc(n.oldText))t.push({kind:`del`,text:e});for(let e of Lc(n.newText))t.push({kind:`add`,text:e})}return t},[e]);return(0,G.jsx)(`div`,{ref:t,className:`chat-tool-diff`,style:{maxHeight:0},children:n.map((e,t)=>(0,G.jsxs)(`div`,{className:`chat-tool-diff-row`+(e.kind===`del`?` chat-tool-diff-del`:e.kind===`add`?` chat-tool-diff-add`:` chat-tool-diff-path`),children:[e.kind!==`path`&&(0,G.jsx)(`span`,{className:`chat-tool-diff-sign`,"aria-hidden":!0,children:e.kind===`del`?`−`:`+`}),(0,G.jsx)(`span`,{className:`chat-tool-diff-text`,children:e.text})]},t))})}function ul(e){let t=e.split(/[\\/]/);return t[t.length-1]||e}function dl(e){if(!fl(e))return;let t=Array.isArray(e.options)?e.options:[],n=[];for(let e of t){if(!fl(e))continue;let t=typeof e.value==`string`?e.value:void 0,r=typeof e.name==`string`?e.name:void 0;t!==void 0&&r!==void 0&&n.push({value:t,name:r,...typeof e.description==`string`?{description:e.description}:{}})}let r=typeof e.currentValue==`string`?e.currentValue:void 0;if(r!==void 0&&n.length!==0)return{options:n,currentValue:r}}function fl(e){return typeof e==`object`&&!!e&&!Array.isArray(e)}function pl({commands:e,onPickImage:t,onPickCamera:n,onPickCommand:r,onClose:i}){return(0,G.jsx)(la,{title:`添加内容`,onClose:i,children:(0,G.jsxs)(`div`,{role:`menu`,"aria-label":`添加内容`,children:[(0,G.jsxs)(`button`,{type:`button`,role:`menuitem`,className:`sheet-option`,onClick:t,children:[(0,G.jsxs)(`span`,{className:`sheet-option-copy`,children:[(0,G.jsx)(`span`,{className:`sheet-option-title`,children:`图片`}),(0,G.jsx)(`span`,{className:`sheet-option-desc`,children:`从相册选择`})]}),(0,G.jsxs)(`svg`,{viewBox:`0 0 16 16`,width:`18`,height:`18`,"aria-hidden":`true`,focusable:`false`,children:[(0,G.jsx)(`rect`,{x:`1.5`,y:`1.5`,width:`13`,height:`13`,rx:`2.5`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.6`}),(0,G.jsx)(`circle`,{cx:`6`,cy:`6`,r:`1.6`,fill:`currentColor`}),(0,G.jsx)(`path`,{d:`M2 11.5 L5.5 8 L8 10.5 L10.5 8 L14 11.5`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.6`,strokeLinejoin:`round`})]})]}),(0,G.jsxs)(`button`,{type:`button`,role:`menuitem`,className:`sheet-option`,onClick:n,children:[(0,G.jsxs)(`span`,{className:`sheet-option-copy`,children:[(0,G.jsx)(`span`,{className:`sheet-option-title`,children:`拍照`}),(0,G.jsx)(`span`,{className:`sheet-option-desc`,children:`调用相机拍摄`})]}),(0,G.jsxs)(`svg`,{viewBox:`0 0 16 16`,width:`18`,height:`18`,"aria-hidden":`true`,focusable:`false`,children:[(0,G.jsx)(`path`,{d:`M2 5.5 A1.5 1.5 0 0 1 3.5 4 H5 L6 2.5 H10 L11 4 H12.5 A1.5 1.5 0 0 1 14 5.5 V12 A1.5 1.5 0 0 1 12.5 13.5 H3.5 A1.5 1.5 0 0 1 2 12 Z`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.6`,strokeLinejoin:`round`}),(0,G.jsx)(`circle`,{cx:`8`,cy:`8.75`,r:`2.4`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.6`})]})]}),(0,G.jsx)(`div`,{className:`sheet-option-divider`,role:`separator`}),e===void 0?(0,G.jsx)(`p`,{className:`sheet-note`,children:`命令加载中…`}):e.length===0?(0,G.jsx)(`p`,{className:`sheet-note`,children:`没有可用命令`}):e.map(e=>(0,G.jsx)(`button`,{type:`button`,role:`menuitem`,className:`sheet-option`,onClick:()=>{r(`/${e.name}`)},children:(0,G.jsxs)(`span`,{className:`sheet-option-copy`,children:[(0,G.jsxs)(`span`,{className:`sheet-option-title`,children:[`/`,e.name]}),(0,G.jsx)(`span`,{className:`sheet-option-desc`,children:e.description})]})},e.name))]})})}function ml({sessionId:e,current:t,onCurrent:n,onClose:r}){let[i,a]=(0,c.useState)({status:`loading`}),[o,s]=(0,c.useState)(!1),[l,u]=(0,c.useState)(void 0),d=(0,c.useCallback)(()=>{a({status:`loading`}),_e(e).then(e=>{a({status:`ready`,data:e})},e=>{a({status:`error`,message:$(e)})})},[e]);(0,c.useEffect)(()=>{d()},[d]);let f=(0,c.useCallback)(t=>{o||(s(!0),u(void 0),ve(e,t).then(e=>{s(!1),n(e.selected),r()},e=>{s(!1),u($(e))}))},[o,e,n,r]);if(i.status===`loading`)return(0,G.jsx)(la,{title:`模型与思考强度`,onClose:r,children:(0,G.jsx)(`div`,{className:`sheet-status`,children:`正在加载模型目录…`})});if(i.status===`error`)return(0,G.jsx)(la,{title:`模型与思考强度`,onClose:r,children:(0,G.jsxs)(`div`,{className:`sheet-status sheet-status-error`,children:[(0,G.jsx)(`span`,{children:i.message}),Zd(i.message)!==void 0&&(0,G.jsx)(`span`,{className:`sheet-hint`,children:Zd(i.message)}),(0,G.jsx)(`button`,{type:`button`,className:`chat-load-older`,onClick:d,children:`重试`})]})});let{data:p}=i,m=t??p.current,h=p.groups.flatMap(e=>e.models.map(t=>({group:e,model:t}))),g=h.find(e=>e.group.id===m.provider&&e.model.id===m.model)?.model.reasoning,_=m.reasoningEffort??g?.defaultEffort,v=g===void 0?[]:[...g.defaultEffort===void 0?[{key:`provider-default`,effort:void 0,label:`跟随模型默认`}]:[],...g.efforts.map(e=>({key:`effort:${e.id}`,effort:e.id,label:e.name,description:e.description}))];return(0,G.jsxs)(la,{title:`模型与思考强度`,onClose:r,children:[l!==void 0&&(0,G.jsx)(`p`,{className:`sheet-error`,children:l}),l!==void 0&&Zd(l)!==void 0&&(0,G.jsx)(`p`,{className:`sheet-hint`,children:Zd(l)}),p.failures.map(e=>(0,G.jsxs)(`p`,{className:`sheet-error`,children:[e.name,`: `,e.message]},e.id)),p.groups.length===0&&h.length===0&&(0,G.jsx)(`div`,{className:`sheet-status`,children:`没有可用的模型`}),p.groups.map(e=>(0,G.jsxs)(`div`,{className:`sheet-section`,children:[(0,G.jsx)(`div`,{className:`sheet-section-title`,children:e.name}),e.models.map(t=>{let n=m.provider===e.id&&m.model===t.id;return(0,G.jsxs)(`button`,{type:`button`,className:`sheet-option${n?` sheet-option-selected`:``}`,disabled:o,onClick:()=>{f({provider:e.id,model:t.id,...t.reasoning?.defaultEffort===void 0?{}:{reasoningEffort:t.reasoning.defaultEffort}})},children:[(0,G.jsxs)(`span`,{className:`sheet-option-copy`,children:[(0,G.jsx)(`span`,{className:`sheet-option-title`,children:t.name}),t.description!==void 0&&(0,G.jsx)(`span`,{className:`sheet-option-desc`,children:t.description})]}),n&&(0,G.jsx)(`span`,{className:`sheet-option-check`,"aria-hidden":!0,children:`√`})]},t.id)})]},e.id)),v.length>0&&(0,G.jsxs)(`div`,{className:`sheet-section`,children:[(0,G.jsx)(`div`,{className:`sheet-section-title`,children:`思考强度`}),v.map(e=>{let t=_===e.effort;return(0,G.jsxs)(`button`,{type:`button`,className:`sheet-option${t?` sheet-option-selected`:``}`,disabled:o,onClick:()=>{f({provider:m.provider,model:m.model,...e.effort===void 0?{}:{reasoningEffort:e.effort}})},children:[(0,G.jsx)(`span`,{className:`sheet-option-copy`,children:(0,G.jsx)(`span`,{className:`sheet-option-title`,children:e.label})}),t&&(0,G.jsx)(`span`,{className:`sheet-option-check`,"aria-hidden":!0,children:`√`})]},e.key)})]})]})}function hl({sessionId:e,value:t,onChanged:n,onClose:r}){let[i,a]=(0,c.useState)(null),[o,s]=(0,c.useState)(!1),[l,u]=(0,c.useState)(void 0),d=(0,c.useCallback)(t=>{o||(s(!0),u(void 0),fe(e,`/permission ${t}`).then(e=>{if(s(!1),a(null),!e.matched){u(`权限命令未在宿主注册，无法切换`);return}n(t),r()},e=>{s(!1),a(null),u($(e))}))},[o,e,n,r]),f=e=>{if(e===t.currentValue){r();return}if(e===`danger-full-access`){a(e);return}d(e)};return i===null?(0,G.jsxs)(la,{title:`权限`,onClose:r,children:[l!==void 0&&(0,G.jsx)(`p`,{className:`sheet-error`,children:l}),t.options.map(e=>{let n=e.value===t.currentValue;return(0,G.jsxs)(`button`,{type:`button`,className:`sheet-option${n?` sheet-option-selected`:``}`,disabled:o,onClick:()=>{f(e.value)},children:[(0,G.jsxs)(`span`,{className:`sheet-option-copy`,children:[(0,G.jsx)(`span`,{className:`sheet-option-title`,children:e.name}),e.description!==void 0&&(0,G.jsx)(`span`,{className:`sheet-option-desc`,children:e.description})]}),n&&(0,G.jsx)(`span`,{className:`sheet-option-check`,"aria-hidden":!0,children:`√`})]},e.value)})]}):(0,G.jsxs)(la,{title:`确认完全权限`,onClose:()=>{a(null)},children:[(0,G.jsx)(`p`,{className:`sheet-confirm-desc`,children:`开启完全权限后，远程会话可以在工作区内执行任意操作（包括运行命令、修改所有文件与访问凭证）。 仅在您信任当前设备和网络时开启。`}),l!==void 0&&(0,G.jsx)(`p`,{className:`sheet-error`,children:l}),(0,G.jsxs)(`div`,{className:`sheet-confirm-actions`,children:[(0,G.jsx)(`button`,{type:`button`,className:`mobile-button`,disabled:o,onClick:()=>{a(null)},children:`取消`}),(0,G.jsx)(`button`,{type:`button`,className:`sheet-confirm-danger`,disabled:o,onClick:()=>{d(i)},children:o?`提交中…`:`确认开启`})]})]})}function gl({entries:e,currentTurn:t,onPick:n,onClose:r}){return(0,G.jsx)(la,{title:`轮次 · 共 ${e.length} 轮`,onClose:r,children:e.length===0?(0,G.jsx)(`p`,{className:`sheet-note`,children:`当前会话没有可跳转的轮次`}):(0,G.jsx)(`div`,{className:`turn-list`,role:`list`,"aria-label":`轮次清单`,children:e.map(e=>{let r=e.turn===t;return(0,G.jsxs)(`button`,{type:`button`,role:`listitem`,className:`turn-row`+(r?` turn-row-current`:``),onClick:()=>{n(e)},children:[(0,G.jsx)(`span`,{className:`turn-row-accent`,"aria-hidden":!0}),(0,G.jsxs)(`span`,{className:`turn-row-copy`,children:[(0,G.jsxs)(`span`,{className:`turn-row-head`,children:[(0,G.jsxs)(`span`,{className:`turn-row-num`,children:[`#`,e.turn]}),(0,G.jsx)(`span`,{className:`turn-row-prompt`,children:e.prompt})]}),(0,G.jsx)(`span`,{className:`turn-row-response`,children:e.response})]}),!e.loaded&&(0,G.jsx)(`span`,{className:`turn-row-dot`,"aria-hidden":!0,title:`未加载`})]},e.turn)})})})}function _l({approval:e,sessionId:t,onResolved:n}){let[r,i]=(0,c.useState)(!1),[a,o]=(0,c.useState)(void 0),s=a=>{r||(i(!0),o(void 0),be(e.rpcId,t,e.approvalId,a).then(()=>{n(e.approvalId)},e=>{i(!1),o(e instanceof Error?e.message:String(e))}))};return(0,G.jsxs)(`div`,{className:`chat-approval-panel`,role:`alert`,children:[(0,G.jsxs)(`div`,{className:`chat-approval-header`,children:[(0,G.jsx)(`span`,{className:`chat-tool-pill`,children:e.toolName}),e.reason!==void 0&&(0,G.jsx)(`span`,{className:`chat-approval-reason`,children:e.reason})]}),a!==void 0&&(0,G.jsx)(`p`,{className:`chat-approval-error`,children:a}),(0,G.jsxs)(`div`,{className:`chat-approval-actions`,children:[(0,G.jsx)(`button`,{type:`button`,className:`chat-approval-allow`,disabled:r,onClick:()=>{s(`allowed-once`)},children:r?`提交中…`:`允许一次`}),(0,G.jsx)(`button`,{type:`button`,className:`chat-approval-reject`,disabled:r,onClick:()=>{s(`rejected`)},children:`拒绝`})]})]})}function vl(e){return e.map(e=>`${e.rpcId}\u0000${e.id}`).join(`|`)}function yl({questions:e,sessionId:t,onResolved:n}){let r=ra(e),[i,a]=(0,c.useState)(()=>new Map(r.map(e=>[e.id,{selected:[],custom:``}]))),[o,s]=(0,c.useState)(()=>vl(r)),[l,u]=(0,c.useState)(!1),[d,f]=(0,c.useState)(void 0);(0,c.useEffect)(()=>{let e=vl(r);e!==o&&(s(e),a(new Map(r.map(e=>[e.id,{selected:[],custom:``}]))))},[r,o]);let p=(e,t,n)=>{a(r=>{let i=new Map(r),a=i.get(e)??{selected:[],custom:``};if(n){let n=new Set(a.selected);n.has(t)?n.delete(t):n.add(t),i.set(e,{...a,selected:[...n]})}else i.set(e,{...a,selected:[t]});return i})},m=(e,t)=>{a(n=>{let r=new Map(n),i=r.get(e)??{selected:[],custom:``};return r.set(e,{...i,custom:t}),r})};return(0,G.jsxs)(`div`,{className:`chat-question-panel`,role:`form`,"aria-label":`问题`,children:[r.map(e=>{let t=i.get(e.id)??{selected:[],custom:``};return(0,G.jsxs)(`div`,{className:`chat-question-group`,children:[e.header!==void 0&&(0,G.jsx)(`div`,{className:`chat-question-header`,children:e.header}),(0,G.jsx)(`div`,{className:`chat-question-text`,children:e.question}),e.detail!==void 0&&(0,G.jsx)(`div`,{className:`chat-question-detail`,children:e.detail}),e.options!==void 0&&e.options.length>0&&(0,G.jsx)(`div`,{className:`chat-question-options`,role:`group`,"aria-label":e.question,children:e.options.map(n=>{let r=t.selected.includes(n.label);return(0,G.jsxs)(`label`,{className:`chat-question-option${r?` chat-question-option-selected`:``}`,children:[(0,G.jsx)(`input`,{type:e.multiSelect?`checkbox`:`radio`,name:`q-${e.id}`,checked:r,onChange:()=>{p(e.id,n.label,e.multiSelect===!0)}}),(0,G.jsx)(`span`,{className:`chat-question-option-label`,children:n.label}),n.description!==void 0&&(0,G.jsx)(`span`,{className:`chat-question-option-desc`,children:n.description})]},n.label)})}),(0,G.jsx)(`textarea`,{className:`chat-question-custom`,placeholder:`自定义回答（可选）`,rows:2,value:t.custom,onChange:t=>{m(e.id,t.target.value)}})]},e.id)}),d!==void 0&&(0,G.jsx)(`p`,{className:`chat-approval-error`,children:d}),(0,G.jsx)(`button`,{type:`button`,className:`chat-question-submit`,disabled:l,onClick:()=>{if(l||r.length===0)return;let e=r[0].rpcId;u(!0),f(void 0),xe(e,t,{answers:r.map(e=>{let t=i.get(e.id)??{selected:[],custom:``};return{id:e.id,selected:t.selected,...t.custom.trim()===``?{}:{custom:t.custom.trim()}}})}).then(()=>{n(e)},e=>{u(!1),f(e instanceof Error?e.message:String(e))})},children:l?`提交中…`:`提交回答`})]})}function bl(e){return typeof e==`object`&&!!e&&!Array.isArray(e)}function xl(e){let t=Array.isArray(e)?e:bl(e)&&Array.isArray(e.turns)?e.turns:[],n=[];for(let e of t){if(!bl(e))continue;let t=e.turn,r=e.seq,i=e.prompt,a=e.response;typeof t!=`number`||!Number.isFinite(t)||typeof r!=`number`||!Number.isFinite(r)||typeof i==`string`&&typeof a==`string`&&n.push({turn:t,seq:r,prompt:i,response:a,loaded:!1})}return n}function Sl(e,t){let n=new Map;for(let t of e)n.has(t.turn)||n.set(t.turn,t);for(let e of t)(e.loaded||!n.has(e.turn))&&n.set(e.turn,e);return[...n.values()].sort((e,t)=>e.turn-t.turn)}function Cl(e,t){if(e.length===0)return;let n=Math.min(Math.max(t,0),e.length-1);for(let t=n;t<e.length;t++){let n=e[t]?.turn;if(n!==void 0)return n}for(let t=n-1;t>=0;t--){let n=e[t]?.turn;if(n!==void 0)return n}}function wl(e){let t=new Map,n;for(let r of e){if(r.kind===`user`||r.kind===`command`){n={text:r.text,seq:r.startSeq??r.seq};continue}if(r.kind!==`assistant`||r.turn===void 0)continue;let e=r.startSeq??r.seq,i=t.get(r.turn);i===void 0?t.set(r.turn,{seq:e,prompt:n?.text??``,response:r.text}):(e<i.seq&&(i.seq=e),i.prompt===``&&n!==void 0&&(i.prompt=n.text),i.response===``&&(i.response=r.text)),n=void 0}return[...t.entries()].map(([e,t])=>({turn:e,seq:t.seq,prompt:t.prompt,response:t.response,loaded:!0})).sort((e,t)=>e.turn-t.turn)}function Tl(e,t,n,r){if(r<=1)return 0;let i=n-t;if(!(i>0))return 0;let a=(Math.min(Math.max(e,t),n)-t)/i;return Math.min(r-1,Math.max(0,Math.round(a*(r-1))))}function El(e,t,n){let r=e.findIndex(e=>e.turn===t);return r>=0?r:e.findIndex(e=>n>=(e.startSeq??e.seq)&&n<=e.seq)}function Dl(e,t){return t<=1?0:e/(t-1)*100}function Ol({entries:e,index:t}){let n=e.length,r=Math.min(Math.max(t,0),Math.max(0,n-1)),i=e[r],a=e[n-1]?.turn??0,o=Dl(r,n),s=i?.prompt===``?`（这一轮没有提问）`:i?.prompt,c=i?.response===``?`（没有回复预览）`:i?.response;return(0,G.jsxs)(`div`,{className:`turn-scrub`,role:`status`,"aria-live":`polite`,"aria-label":`轮次刮擦`,children:[(0,G.jsxs)(`div`,{className:`turn-scrub-head`,children:[(0,G.jsxs)(`span`,{className:`turn-scrub-num`,children:[`第 `,i?.turn??0,` / `,a,` 轮`]}),(0,G.jsx)(`span`,{className:`turn-scrub-title`,children:s})]}),(0,G.jsx)(`div`,{className:`turn-scrub-sub`,children:c}),(0,G.jsxs)(`div`,{className:`turn-scrub-track`,children:[(0,G.jsx)(`div`,{className:`turn-scrub-rail`}),(0,G.jsx)(`div`,{className:`turn-scrub-fill`,style:{width:`${o}%`}}),n<=40&&e.map((e,t)=>(0,G.jsx)(`i`,{className:`turn-scrub-tick`+(t===r?` turn-scrub-tick-at`:``),style:{left:`${Dl(t,n)}%`}},e.turn)),(0,G.jsx)(`div`,{className:`turn-scrub-knob`,style:{left:`${o}%`}})]}),(0,G.jsx)(`div`,{className:`turn-scrub-hint`,children:i?.loaded===!0?`左右拖动选轮次 · 松手跳转`:`左右拖动选轮次 · 松手跳转（需先载入历史）`})]})}function kl(e){return e.turn!==void 0&&e.step!==void 0?`t${e.turn}.${e.step}`:e.id}function Al(e){let t;for(let n of e)n.kind===`assistant`&&n.turn!==void 0&&(t===void 0||n.turn>t)&&(t=n.turn);return t}function jl(e){let t=e.data;if(typeof t!=`object`||!t||Array.isArray(t))return;let n=t.turn;return typeof n==`number`&&Number.isFinite(n)?n:void 0}function Ml(){return Math.max(70,window.innerWidth-30)}function Nl(e){return e>=1e6?`${(e/1e6).toFixed(1).replace(/\.0$/,``)}M`:e>=1e3?`${Math.round(e/1e3)}k`:String(e)}function Pl(e){let t=e.split(`-`).filter(Boolean);return t.length<=2?e:t.slice(-2).join(`-`)}function Fl(e){if(e===`danger-full-access`)return`full`;if(e.includes(`write`))return`write`;if(e.includes(`read`))return`read`}function Il(e){return e.replace(/\\/g,`\\\\`).replace(/"/g,`\\"`)}function Ll(e){if(e.kind===`user`){let t=Math.max(1,Math.ceil(e.text.length/38)),n=(e.images?.length??0)*220;return 28+t*22+n}let t=20;e.reasoning!==void 0&&e.reasoning!==``&&(t+=32),e.tools!==void 0&&e.tools.length>0&&(t+=28);let n=e.text;if(n===``)return t+24;let r=!e.pending&&n.length>6e3,i=r?800:n.length,a=Math.max(1,Math.ceil(i/38));return t+=Math.min(a,12)*22,r&&(t+=30),t+16}function Rl(e){return/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e)?e.split(`-`).map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(` `):e}function zl({session:e,mux:t,onBack:n,showToolCalls:r,showSystemMessages:i,initialFocusSeq:a,initialFocusMessageId:o,initialFocusPartId:s,initialFocusQuery:l}){let[u,f]=(0,c.useState)([]),p=br(),m=e=>{f(Et(e))},[h,g]=(0,c.useState)(!1),_=(0,c.useRef)(()=>{}),v=(0,c.useRef)(!1),[y,x]=(0,c.useState)(!0),[S,C]=(0,c.useState)(void 0),[w,T]=(0,c.useState)(()=>yi(e.sessionId)),ee=(0,c.useRef)(w);ee.current=w;let[te,E]=(0,c.useState)(!1),D=(0,c.useRef)(te);D.current=te;let O=(0,c.useRef)(void 0),ne=(0,c.useRef)(!1),k=(0,c.useRef)(void 0),A=(0,c.useRef)(u),[j,ie]=(0,c.useState)({start:0,end:0}),ae=(0,c.useRef)(j);ae.current=j;let N=(0,c.useRef)(void 0),oe=(0,c.useRef)(0),se=(0,c.useRef)(!1),pe=(0,c.useRef)(!1),F=(0,c.useRef)(0),ge=(0,c.useRef)(0),be=(0,c.useRef)(new Map),[xe,Se]=(0,c.useState)(0);A.current=u;let I=(0,c.useRef)(!0),L=(0,c.useRef)([]),Ce=(0,c.useRef)(void 0),we=(0,c.useRef)([]),Ee=(0,c.useRef)(void 0),De=(0,c.useCallback)(()=>{Ee.current===void 0&&(Ee.current=requestAnimationFrame(()=>{Ee.current=void 0;let e=we.current;if(we.current=[],e.length===0)return;let t=Ce.current,n=e[e.length-1];on(`state`,{seq:n?.seq,frame:`session/event`,detail:`batch:${e.length}`}),f(n=>Et(t===void 0?_t(e,n):t.fold(e)))}))},[]),Oe=(0,c.useRef)(!1),R=(0,c.useRef)(void 0),z=(0,c.useRef)(0),B=(0,c.useRef)(void 0),[V,ke]=(0,c.useState)(void 0),[je,Me]=(0,c.useState)(void 0),[Ne,Pe]=(0,c.useState)(void 0),[Fe,Ie]=(0,c.useState)(null),[Le,Re]=(0,c.useState)(null),[ze,Be]=(0,c.useState)(null),[Ve,He]=(0,c.useState)(null),[Ue,We]=(0,c.useState)(!1),[Ge,Ke]=(0,c.useState)(!1),[qe,Je]=(0,c.useState)({status:`idle`}),[Ye,Xe]=(0,c.useState)(!1),[Ze,Qe]=(0,c.useState)([]),$e=(0,c.useRef)(Ze);(0,c.useEffect)(()=>{$e.current=Ze},[Ze]),(0,c.useEffect)(()=>{if(w===``){xi(e.sessionId);return}let t=setTimeout(()=>{bi(e.sessionId,w)},1500);return()=>{clearTimeout(t)}},[w,e.sessionId]),(0,c.useEffect)(()=>()=>{ee.current!==``&&bi(e.sessionId,ee.current)},[e.sessionId]);let et=(0,c.useRef)(null),tt=(0,c.useRef)(null),[nt,rt]=(0,c.useState)(void 0),[it,at]=(0,c.useState)(void 0),[ot,st]=(0,c.useState)(!1),[ct,lt]=(0,c.useState)(()=>typeof navigator<`u`&&navigator.onLine===!1),[ut,dt]=(0,c.useState)(0),[ft,pt]=(0,c.useState)([]),[H,mt]=(0,c.useState)(!1),[ht,gt]=(0,c.useState)(``),[vt,yt]=(0,c.useState)(`recording`),bt=(0,c.useRef)(void 0),xt=(0,c.useRef)(!0),St=(0,c.useRef)(void 0),[Ct,wt]=(0,c.useState)(!0),[Tt,Ot]=(0,c.useState)(!1),[kt,At]=(0,c.useState)(void 0),[jt,Mt]=(0,c.useState)(()=>t?.cachedQueueFor(e.sessionId)??[]),[Nt,Pt]=(0,c.useState)(null),Ft=(0,c.useRef)(Date.now()),It=(0,c.useRef)(0),Lt=(0,c.useRef)(Date.now()),[Rt,U]=(0,c.useState)(!1),[zt,Bt]=(0,c.useState)(!1),[Vt,Ht]=(0,c.useState)(()=>t?.cachedJobsFor(e.sessionId)??[]),[Ut,Wt]=(0,c.useState)(void 0),Gt=(0,c.useCallback)(e=>{e!==void 0&&Wt(t=>t!==void 0&&e.seq<=t.seq?t:e)},[]),Kt=(0,c.useCallback)(e=>{let t=Ae(e.data);t!==void 0&&Gt({seq:e.seq,items:t})},[Gt]),qt=(0,c.useCallback)(()=>{Wt(e=>e===void 0?e:{seq:e.seq,items:e.items.map(e=>e.status===`in_progress`?{...e,status:`completed`}:e)})},[]),[Jt,Yt]=(0,c.useState)([]),[Xt,Zt]=(0,c.useState)(!1),[Qt,$t]=(0,c.useState)(!1),[en,tn]=(0,c.useState)([]),[nn,rn]=(0,c.useState)([]),[an,sn]=(0,c.useState)(e.title),[cn,ln]=(0,c.useState)(!1),[un,dn]=(0,c.useState)(!1),[fn,pn]=(0,c.useState)(void 0),mn=(0,c.useMemo)(()=>Sl(xl(fn),wl(u)),[fn,u]),hn=mn[mn.length-1]?.turn??0,gn=(0,c.useMemo)(()=>xl(fn).reduce((e,t)=>Math.max(e,t.turn),0),[fn]),_n=gn>0?gn:hn,[vn,yn]=(0,c.useState)(0),bn=vn>0?vn:hn,[xn,Sn]=(0,c.useState)(()=>wi(e.sessionId)),Cn=(0,c.useRef)(vn);Cn.current=vn;let wn=(0,c.useRef)(mn);wn.current=mn;let Tn=(0,c.useRef)(_n);Tn.current=_n;let En=(0,c.useRef)(e.sessionId);En.current=e.sessionId;let Dn=(0,c.useRef)(void 0),On=(0,c.useRef)(void 0),kn=(0,c.useRef)(void 0),An=(0,c.useRef)(0),[jn,Mn]=(0,c.useState)(void 0),Nn=(0,c.useRef)(void 0),[Pn,Fn]=(0,c.useState)(!1),[In,Ln]=(0,c.useState)(!1),[Rn,zn]=(0,c.useState)(void 0),[Bn,Vn]=(0,c.useState)(void 0),[Hn]=(0,c.useState)(()=>Zn());(0,c.useEffect)(()=>{let e=!1;return b().then(t=>{e||wt(t.mobileEnterToSend!==!1)},()=>{}),()=>{e=!0}},[]);let Un=(0,c.useCallback)(()=>{Io().then(e=>{dt(e.length),pt(e)})},[]);(0,c.useEffect)(()=>{let e=()=>{lt(typeof navigator<`u`&&navigator.onLine===!1),Un()};return e(),window.addEventListener(`online`,e),window.addEventListener(`offline`,e),()=>{window.removeEventListener(`online`,e),window.removeEventListener(`offline`,e)}},[Un]);let Wn=(0,c.useCallback)(e=>{Lo(e).then(()=>{Un()})},[Un]),Gn=(0,c.useCallback)(()=>{Vo(e=>ce(e.sessionId,Bl(e.text))).then(({sent:e,failed:n})=>{e>0&&K(n>0?`已同步 ${e} 条，${n} 条待重试`:`已同步 ${e} 条消息`),Un(),e>0&&t?.poke()})},[t,Un]),Kn=(0,c.useCallback)(async(t,n)=>{try{await ue(e.sessionId,t,{kind:`edit`,content:[{type:`text`,text:n}]})}catch{K(`消息已开始发送，无法编辑`)}},[e.sessionId]),qn=(0,c.useCallback)(async t=>{try{await ue(e.sessionId,t,{kind:`remove`})}catch{K(`消息已开始发送，无法删除`)}},[e.sessionId]),Jn=(0,c.useCallback)(async t=>{try{await ue(e.sessionId,t,{kind:`steer`})}catch(e){let t=e instanceof d?e.error.code:void 0;if(t===`steer-unavailable`){K(`当前轮次已结束，无法插话`),Ot(!1),At(void 0),Pt(null);return}K(t===`queue-item-not-found`?`消息已开始发送，无法插话`:`插话失败`)}},[e.sessionId]);(0,c.useEffect)(()=>{ct||Io().then(e=>{e.length!==0&&Gn()})},[ct,Gn]),(0,c.useEffect)(()=>{if(!Ye||nt!==void 0)return;let t=!1;return de(e.sessionId).then(e=>{t||rt(e)},()=>{t||rt([])}),()=>{t=!0}},[Ye,nt,e.sessionId]);let Yn=(0,c.useCallback)((t,n,r)=>{let i=t.to+1,a=()=>{$d(e.sessionId,i,n).then(e=>{if(r())return;let n=Ce.current,o=Et(e.rows).filter(e=>(e.startSeq??e.seq)>=t.from);o.length>0&&(n===void 0?f(e=>Et([...o,...e])):(n.prepend(o),f(Et(n.snapshot()))));let s=o.length>0?o[0]?.startSeq??o[0]?.seq:void 0;s===void 0||s<=t.from||!e.hasMore||s>=i||(i=s,a())},e=>{r()||console.warn(`history gap refill failed`,e)})};a()},[e.sessionId]);(0,c.useEffect)(()=>{let t=!1,n=new AbortController,r=setTimeout(()=>{n.abort(new DOMException(`history load timed out`,`TimeoutError`))},3e4);I.current=!0,L.current=[],Oe.current=!1,R.current=void 0,v.current=!1,Ce.current=void 0,we.current=[],Ee.current!==void 0&&(cancelAnimationFrame(Ee.current),Ee.current=void 0),sn(e.title),pr.current=!1,fr.current=void 0,x(!0),C(void 0),f([]),tn([]),rn([]),Me(void 0),Wt(void 0),Ot(e.running===!0),At(void 0),Pt(null);let i=!1,a=!1;return Mi(e.sessionId).then(e=>{if(t||i||e===void 0)return;a=!0;let n=new Dt(e.rows,e.maxSeq);Ce.current=n,m(n.fold([])),g(e.hasMore),x(!1)}),$d(e.sessionId,void 0,n.signal).then(e=>{if(t)return;i=!0;let r=L.current;L.current=[],I.current=!1;let o=new Dt(e.rows,e.maxSeq);Ce.current=o,m(o.fold(r)),g(e.hasMore),e.todo!==void 0&&Gt(e.todo),e.hasMore&&!v.current&&!a&&(v.current=!0,_.current(!0)),x(!1),e.turnStartAt!==void 0&&(Pt(t=>t??e.turnStartAt??null),Ot(!0),At(void 0));let s=e.projections?.values;if(ke(dl(s?.permissions)),Me(Vl(s?.contextPressure)),pn(s?.turnOutline),R.current!==void 0){let e=R.current;R.current=void 0,Oe.current=!1,Yn(e,n.signal,()=>t)}},e=>{if(t)return;let n=L.current;if(L.current=[],I.current=!1,n.length>0){let e=Ce.current;f(Et(e===void 0?_t(n):e.fold(n)))}C($(e)),x(!1)}),_e(e.sessionId).then(e=>{t||(Pe(e.current),Je(t=>t.status===`idle`?{status:`ready`,data:e}:t))},e=>{t||Je(t=>t.status===`idle`?{status:`error`,message:$(e)}:t)}),()=>{t=!0,clearTimeout(r),n.abort()}},[e.sessionId]),(0,c.useEffect)(()=>{if(t!==void 0)return t.onFrame((t,n)=>{let r=t.event;if(typeof r?.time==`number`&&Number.isFinite(r.time)&&r.type!==`turn/start`&&(It.current=r.time-Date.now()),Lt.current=Date.now(),U(!1),Bt(!1),t.type===`session/event`){if(t.sessionId!==e.sessionId)return;let n=t.view===void 0?t.event:{...t.event,view:t.view};if(typeof n.type==`string`&&(n.type===`turn/start`&&(Ot(!0),U(!1),At(jl(n)),Pt(typeof n.time==`number`&&Number.isFinite(n.time)?n.time:Date.now()),Qn.current(),Wt(void 0),(0,c.startTransition)(()=>{Mt([])})),n.type===`turn/end`&&(Ot(!1),At(void 0),Pt(null),qt()),n.type===`todo/write`&&(0,c.startTransition)(()=>{Kt(n)})),I.current){if(L.current.length>=500){let e=L.current.shift();if(e!==void 0){let t=R.current;R.current=t===void 0?{from:e.seq,to:e.seq}:{from:Math.min(t.from,e.seq),to:Math.max(t.to,e.seq)}}Oe.current||=(console.warn(`history tail is slow: live buffer reached 500 events; the dropped seq window will be re-fetched`),!0)}L.current.push(n);return}we.current.push(n),De();return}if(t.type===`session/projection`&&t.sessionId===e.sessionId){t.key===`permissions`&&ke(dl(t.value)),t.key===`contextPressure`&&Me(Vl(t.value));return}if(t.type===`session/jobs`&&t.sessionId===e.sessionId){(0,c.startTransition)(()=>{Ht(t.jobs)});return}if(t.type===`session/subscribed`&&t.sessionId===e.sessionId){(0,c.startTransition)(()=>{Mt([]),Ht([])});return}if(t.type===`session/queue`&&t.sessionId===e.sessionId){(0,c.startTransition)(()=>{Mt((t.items??[]).map(e=>le({id:String(e.id),placement:e.placement,message:e.message})))});return}if(!(!(`sessionId`in t)||t.sessionId!==e.sessionId)){if(t.type===`approval/requested`){(0,c.startTransition)(()=>{tn(r=>sa(e.sessionId).has(t.approvalId)||r.some(e=>e.approvalId===t.approvalId)?r:[...r,{rpcId:n??``,approvalId:t.approvalId,toolName:t.toolName,callId:t.callId,reason:t.reason}])});return}if(t.type===`approval/resolved`){(0,c.startTransition)(()=>{tn(e=>e.filter(e=>e.approvalId!==t.approvalId))});return}if(t.type===`question/requested`){let r=t.questions.map(e=>({rpcId:n??``,...e})).filter(t=>!na(e.sessionId).has(t.rpcId));(0,c.startTransition)(()=>{rn(r)});return}if(t.type===`question/resolved`){(0,c.startTransition)(()=>{rn([])});return}}})},[t,e.sessionId]),(0,c.useEffect)(()=>{if(!Tt||!p)return;let n=!1,r,i=()=>{if(n)return;ye(e.sessionId).then(t=>{n||(0,c.startTransition)(()=>{tn(n=>ca(n,t.approvals,sa(e.sessionId))),rn(n=>ia(n,t.questions,na(e.sessionId)))})},()=>{});let a=t?.isSseLive()??!0;r=setTimeout(i,a?6e4:1500)};return i(),()=>{n=!0,r!==void 0&&clearTimeout(r)}},[Tt,e.sessionId,t,p]),(0,c.useEffect)(()=>{if(!Tt||!p)return;let n=!1,r=0,i=setInterval(()=>{t?.isSseLive()===!0&&Date.now()-Lt.current<1e4||re().then(t=>{if(n)return;r=0,Bt(!1);let i=t.items.find(t=>t.sessionId===e.sessionId);(i===void 0||i.running===!1)&&M(e.sessionId,void 0,1).then(e=>{if(!n)for(let t=e.events.length-1;t>=0;t--){let n=e.events[t]?.event?.type;if(n===`turn/end`){Ot(!1),At(void 0),qt();return}if(n===`turn/start`){let n=e.events[t]?.event?.time;typeof n==`number`&&Number.isFinite(n)&&Pt(e=>e??n);return}}},()=>{})},()=>{n||(r+=1,r>=3&&Bt(!0))})},1e4);return()=>{n=!0,clearInterval(i)}},[Tt,e.sessionId,qt,p]);let Xn=(0,c.useCallback)(()=>{$a(e.sessionId).then(e=>{(0,c.startTransition)(()=>{Yt(e)})},()=>{})},[e.sessionId]),Qn=(0,c.useRef)(Xn);Qn.current=Xn,(0,c.useEffect)(()=>{Xn()},[Xn]),(0,c.useEffect)(()=>{if(!Tt||!p)return;let e=setInterval(()=>{Qn.current()},Za);return()=>{clearInterval(e)}},[Tt,p]);let[,$n]=(0,c.useState)(0),er=Nt??(Tt?Ft.current:null),tr=Tt?kt??Al(u):void 0;(0,c.useEffect)(()=>{if(er===null){U(!1),$n(0);return}if(!p)return;let e=er,t=()=>{let t=Date.now()-Lt.current>6e3;U(e=>e===t?e:t),$n(Math.max(0,Date.now()+It.current-e))};t();let n=setInterval(t,1e3);return()=>clearInterval(n)},[er,p]);let[nr,rr]=(0,c.useState)(0);(0,c.useEffect)(()=>{if(u.length<120){k.current=void 0;return}let e=[0],t=0;for(let n of u)t+=n.pending===!0?96:be.current.get(n.id)??Ll(n),e.push(t);k.current=e},[u,xe,nr]);let ir=(0,c.useCallback)(()=>{let e=k.current;if(e===void 0||ti.current)return;let t=O.current,n=A.current.length;if(ae.current.end===n&&F.current<=80)return;let r=(t?.scrollTop??oe.current)-ge.current,i=0,a=n-1;for(;i<a;){let t=i+a+1>>1;e[t]!==void 0&&e[t]<=r?i=t:a=t-1}let o=Math.max(0,i-20),s=A.current[n-1],c=s!==void 0&&s.pending===!0?n:Math.min(n,i+24+20);ie(e=>e.start===o&&e.end===c?e:{start:o,end:c})},[]),ar=(0,c.useCallback)(()=>{N.current===void 0&&(N.current=requestAnimationFrame(()=>{N.current=void 0,ir()}))},[ir]),or=(0,c.useCallback)(()=>{let e=A.current[A.current.length-1];e!==void 0&&(vr.current=Math.max(vr.current,e.turn??0)),_r(0)},[]),sr=e=>{let t=A.current,n=t.length;if(n===0)return;let r=k.current,i;if(r!==void 0){let t=e-ge.current,a=0,o=n-1;for(;a<o;){let e=a+o+1>>1;r[e]!==void 0&&r[e]<=t?a=e:o=e-1}i=a}else{let r=0;i=n-1;for(let a=0;a<n;a++)if(r+=Ll(t[a]),r>e){i=a;break}}return Cl(t,i)},cr=(0,c.useCallback)(()=>{let e=O.current;if(e===void 0)return;oe.current=e.scrollTop;let t=e.scrollHeight-e.scrollTop-e.clientHeight;F.current=t;let n=se.current;n?se.current=!1:ei.current=!1,hr(t>80);let r=t>80;if(!n){let t=sr(e.scrollTop)??0;yn(t),Dn.current!==void 0&&window.clearTimeout(Dn.current),Dn.current=window.setTimeout(()=>{if(Dn.current=void 0,!r)return;let e=Tn.current;t>0&&t!==e&&Ti(En.current,t)},1e3)}t<=80&&or(),ar()},[or,ar]);(0,c.useEffect)(()=>()=>{N.current!==void 0&&cancelAnimationFrame(N.current),Ee.current!==void 0&&cancelAnimationFrame(Ee.current)},[]),(0,c.useEffect)(()=>(Sn(wi(e.sessionId)),()=>{Dn.current!==void 0&&(window.clearTimeout(Dn.current),Dn.current=void 0);let t=Cn.current,n=Tn.current;F.current<=80||t>0&&t!==n&&Ti(e.sessionId,t)}),[e.sessionId]);let lr=(0,c.useCallback)((e,t)=>{e.scrollTop!==t&&(se.current=!0),e.scrollTop=t,oe.current=e.scrollTop},[]),ur=(0,c.useCallback)(()=>{let e=O.current;if(e===void 0)return;lr(e,e.scrollHeight);let t=A.current.length;if(t>0){let e=Math.max(0,t-24-20);ie(n=>n.start===e&&n.end===t?n:{start:e,end:t})}ar()},[ar,lr]),dr=(0,c.useCallback)(()=>{let e=O.current;if(e===void 0)return;let t=k.current,n=A.current.length,r=t!==void 0&&n>0?(t[n]??e.scrollHeight)+ge.current:e.scrollHeight;lr(e,r),ar()},[ar,lr]),fr=(0,c.useRef)(void 0),pr=(0,c.useRef)(!1),[mr,hr]=(0,c.useState)(!1),[gr,_r]=(0,c.useState)(0),vr=(0,c.useRef)(0),yr=(0,c.useCallback)(()=>{F.current=0,hr(!1),or(),ur()},[or,ur]),xr=(0,c.useCallback)((e,t)=>{let n=A.current,r=El(n,t??-1,e);if(r<0)return;let i=n[r];if(Zr(i.id),Qr.current=e,$r.current=!1,ti.current=!0,ei.current=!0,F.current=2**53-1,n.length>=120){let e=Math.max(0,r-20),t=Math.min(n.length,r+24+20);ie(n=>n.start===e&&n.end===t?n:{start:e,end:t})}let a=i.turn;a!==void 0&&yn(a)},[]),Sr=(0,c.useCallback)(e=>{if(dn(!1),El(A.current,e.turn,e.seq)>=0){xr(e.seq,e.turn);return}if(!h){K(`没有更早的轮次`);return}let t=mn.findIndex(t=>t.turn===e.turn),n=t>=0?mn[t+1]?.seq:void 0;yn(0),K(`正在载入…`),On.current=e.seq,kn.current=e.turn,An.current=0,_.current(!0,n??e.seq+1)},[h,xr,mn]),Cr=(0,c.useCallback)(()=>{let e=xn;if(e===void 0)return;Sn(void 0),Ei(En.current);let t=wn.current.find(t=>t.turn===e);t!==void 0&&Sr(t)},[xn,Sr]),wr=(0,c.useCallback)(e=>{mn.length<2||(Nn.current={pointerId:e.pointerId,startX:e.clientX,moved:!1},Mn(Tl(e.clientX,30,Ml(),mn.length)),e.currentTarget.setPointerCapture(e.pointerId))},[mn.length]),Tr=(0,c.useCallback)(e=>{let t=Nn.current;t!==void 0&&t.pointerId===e.pointerId&&(Math.abs(e.clientX-t.startX)>8&&(t.moved=!0),Mn(Tl(e.clientX,30,Ml(),mn.length)))},[mn.length]),Er=(0,c.useCallback)(e=>{let t=Nn.current;if(t===void 0||t.pointerId!==e.pointerId)return;Nn.current=void 0;let n=jn;if(Mn(void 0),e.currentTarget.hasPointerCapture(e.pointerId)&&e.currentTarget.releasePointerCapture(e.pointerId),!t.moved){dn(!0);return}let r=n===void 0?void 0:mn[n];r!==void 0&&Sr(r)},[Sr,jn,mn]),Dr=(0,c.useCallback)(e=>{let t=Nn.current;t!==void 0&&t.pointerId===e.pointerId&&(Nn.current=void 0,Mn(void 0))},[]);(0,c.useEffect)(()=>{let e=On.current;if(e===void 0)return;let t=kn.current;if(El(A.current,t??-1,e)>=0){On.current=void 0,kn.current=void 0,An.current=0,xr(e,t);return}if(!h||An.current>=24){On.current=void 0,kn.current=void 0,An.current=0,K(`没能跳到那一轮：历史太深了`);return}An.current+=1,_.current(!0)},[u,h,xr]),(0,c.useLayoutEffect)(()=>{let e=u[u.length-1];if(e===void 0)return;let t=e.seq+`:`+(e.pending===!0?`p`:`f`);if(t!==fr.current&&(fr.current=t,on(`commit`,{seq:e.seq,frame:`session/event`,detail:e.kind}),O.current!==void 0)){if(!pr.current){pr.current=!0,vr.current=e.turn??0,ur();return}(e.turn??0)>vr.current&&(vr.current=e.turn??0,F.current>80&&_r(e=>e+1)),Hn&&(F.current>80||ei.current||ur())}},[u,ur,Hn]),(0,c.useLayoutEffect)(()=>{pe.current&&(pe.current=!1,!(F.current>80)&&ur())},[u,ur]),(0,c.useEffect)(()=>{(nn.length!==0||en.length!==0)&&Hn&&O.current!==void 0&&(F.current>80||ur())},[nn.length,en.length,ur,Hn]),(0,c.useEffect)(()=>{let e=window.visualViewport;if(e==null)return;let t=e,n=()=>{Hn&&(F.current>80||ur())};return t.addEventListener(`resize`,n),()=>{t.removeEventListener(`resize`,n)}},[Hn,ur]),(0,c.useEffect)(()=>{if(Rn===void 0)return;let e=window.setTimeout(()=>{zn(void 0)},3e3);return()=>{clearTimeout(e)}},[Rn]);let Or=(0,c.useCallback)(e=>{at(e.slice(0,200))},[]),kr=(0,c.useCallback)((n,r)=>{Vn(void 0),ce(e.sessionId,Bl(`用户修改了之前的提问，请忽略旧提问的回复，按修改后的内容重新回答：\n\n${r}`)).then(()=>{t?.poke()},()=>{K(`重新发送失败，请重试`)})},[e.sessionId,t]),Ar=(0,c.useCallback)(n=>{let r=A.current,i=r.findIndex(e=>e.id===n.id),a=``;for(let e=i-1;e>=0;e--){let t=r[e];if(t!==void 0&&t.kind===`user`){a=t.text;break}}let o=a===``?`请忽略上一条回答，重新作答刚才的问题。`:`请忽略上一条回答，针对原始问题重新作答：\n\n${a}`;ce(e.sessionId,Bl(o)).then(()=>{t?.poke()},()=>{K(`重新生成失败，请重试`)})},[e.sessionId,t]),jr=(0,c.useCallback)(()=>{B.current?.abort();let t=new AbortController;B.current=t;let n=z.current+1;z.current=n,I.current=!0,$d(e.sessionId,void 0,t.signal).then(e=>{if(n!==z.current)return;let r=L.current;L.current=[],I.current=!1;let i=new Dt(e.rows,e.maxSeq);Ce.current=i,m(i.fold(r)),g(e.hasMore);let a=R.current;a!==void 0&&(R.current=void 0,Oe.current=!1,Yn(a,t.signal,()=>n!==z.current))},()=>{if(n!==z.current)return;I.current=!1;let e=L.current;if(L.current=[],e.length>0){let t=Ce.current;f(Et(t===void 0?_t(e):t.fold(e)))}})},[e.sessionId,Yn]),Mr=(0,c.useCallback)(n=>(K(`正在执行 ${n.trim().split(/\s+/)[0]}…`),fe(e.sessionId,n).then(r=>{if(t?.poke(),r.matched){jr(),r.text!==void 0&&r.text!==``&&K(r.text);return}return ce(e.sessionId,Bl(n)).then(()=>{t?.poke()})},e=>{C($(e))})),[e.sessionId,t,jr]),Nr=(0,c.useCallback)(async t=>{Fn(!1);try{await me(e.sessionId,t),sn(t),K(`已重命名`)}catch(e){K($(e))}},[e.sessionId]),Pr=(0,c.useCallback)(()=>{Ln(!1),f([]),Ro(e.sessionId).then(()=>{Un()}),Te(e.sessionId).catch(e=>{K(`删除未生效：${$(e)}`)}),n()},[e.sessionId,n,Un]),Fr=(0,c.useCallback)(()=>{e.blank&&A.current.length===0&&!D.current&&(Rr(e.sessionId),M(e.sessionId,void 0,1).then(t=>{t.events.some(e=>e.event.type===`user/message`||e.event.type===`assistant/message`)||Te(e.sessionId).catch(()=>{})},()=>{})),n()},[e,n]),Ir=(e,t,n)=>{if(window.getSelection()?.toString()!==``)return!1;let r=e instanceof Element?e:null;if(r!==null&&r.closest(`img`)!==null)return!1;let i=r?.closest(`.chat-msg`)??null;if(i===null)return!1;let a=i.getAttribute(`data-mid`),o=a===null?void 0:A.current.find(e=>e.id===a);if(o===void 0)return!0;let s=o.flow!==void 0&&o.flow.length>0?o.flow.filter(e=>e.kind===`text`).map(e=>e.text).join(`
`).trim():``,c=o.text!==void 0&&o.text!==``?o.text:o.reasoning??``,l=s===``?void 0:s;return(c.trim()!==``||l!==void 0)&&Br(t,n,c,l,o.kind,o.id),!0},Lr=(0,c.useRef)(void 0),zr=(0,c.useCallback)(()=>{Lr.current!==void 0&&(clearTimeout(Lr.current.timer),Lr.current=void 0)},[]);(0,c.useEffect)(()=>()=>{zr()},[zr]);let Br=(0,c.useCallback)((e,t,n,r,i,a)=>{zn({x:Math.max(8,Math.min(e,window.innerWidth-164)),y:Math.max(8,Math.min(t,window.innerHeight-140)),text:n,raw:r,...i===void 0?{}:{kind:i},...a===void 0?{}:{messageId:a}})},[]),Vr=(0,c.useCallback)(e=>{let t=e.target instanceof Element?e.target:null;if(t!==null){let n=t.closest(`img`);if(n!==null&&!(t instanceof HTMLAnchorElement)){let t=n.getAttribute(`src`);if(t!==null&&t!==``&&!t.startsWith(`data:image/svg`)){e.preventDefault(),Be(t);return}}}let n=t?.closest(`.file-link`)??null;if(n===null)return;let r=n.getAttribute(`data-path`);if(r!==null&&r!==``){if(e.preventDefault(),typeof window.dshOpenFile==`function`){_o(r);return}Re(r)}},[]),Hr=e=>{let t=e[0],n=e[1];return t===void 0||n===void 0?0:Math.hypot(t.clientX-n.clientX,t.clientY-n.clientY)},Ur=(0,c.useCallback)(e=>{let t=St.current;if(t===void 0)return;let n=Math.min(3,Math.max(1,e)),r=t.block.querySelector(`pre`);r!==null&&(r.style.transformOrigin=`0 0`,r.style.transform=n<=1.02?``:`scale(${n})`)},[]),Wr=(0,c.useCallback)((t=!1,n)=>{if(ne.current)return;ne.current=!0,t||x(!0);let r=Ce.current?.snapshot()[0]??u[0];if(r===void 0){ne.current=!1,t||x(!1);return}let i=new AbortController,a=setTimeout(()=>{i.abort(new DOMException(`load older timed out`,`TimeoutError`))},15e3),o=n??r.startSeq??r.seq,s=t?void 0:O.current?.scrollTop??oe.current;$d(e.sessionId,o,i.signal).then(e=>{clearTimeout(a),ne.current=!1,t||x(!1);let n=Et(e.rows),r=Ce.current;r===void 0?f(e=>Et([...n,...e])):(r.prepend(n),f(Et(r.snapshot()))),g(e.hasMore),ge.current=0;let i=O.current;if(i!==void 0&&n.length>0){if(t&&F.current<=80)pe.current=!0;else{let e=n.reduce((e,t)=>e+Ll(t),0),t=(s??i.scrollTop)+e;requestAnimationFrame(()=>{lr(i,t)})}}},e=>{clearTimeout(a),ne.current=!1,x(!1),t||C($(e))})},[e.sessionId,u,ur,lr]);_.current=Wr;let Gr=(0,c.useRef)(a),Kr=(0,c.useRef)(o),qr=(0,c.useRef)(s),Jr=(0,c.useRef)(0),Yr=(0,c.useRef)(!1),[Xr,Zr]=(0,c.useState)(void 0),Qr=(0,c.useRef)(void 0),$r=(0,c.useRef)(!1),ei=(0,c.useRef)(!1),ti=(0,c.useRef)(!1);(0,c.useEffect)(()=>{Gr.current=a,Kr.current=o,qr.current=s,Jr.current=0,Yr.current=!1,Qr.current=void 0,$r.current=!1,ei.current=!1,se.current=!1,ti.current=a!==void 0||o!==void 0||s!==void 0,Zr(void 0)},[a,o,s,l]),(0,c.useEffect)(()=>{let e=Gr.current,t=Kr.current;if(e===void 0&&t===void 0||y)return;let n=u,r=l?.trim().toLowerCase()??``,i=e=>{if(r===``)return!0;let t=e.text.toLowerCase();if(t.includes(r))return!0;let n=r.match(/[\p{L}\p{N}_]+/gu)??[];return n.length>0&&n.every(e=>t.includes(e))},a=t===void 0?-1:n.findIndex(e=>e.id===t),o=a>=0&&(e=>t!==void 0&&e.id!==t?!1:qr.current===void 0||e.flow?.some(e=>e.kind===`text`&&e.partId===qr.current)===!0)(n[a])?a:-1,s=n[0]?.startSeq??n[0]?.seq,c=e===void 0||!(e===void 0||s===void 0||e>=s)?-1:n.findIndex(t=>e<=t.seq&&i(t)),d=(t!==void 0||e!==void 0)&&h?-1:n.findIndex(i),f=o>=0?o:c>=0?c:d;if(console.debug(`[locate] initial: msgId=${t??`-`} seq=${e??`-`} partId=${qr.current??`-`} query=${l??`-`}; rows=${n.length}; resolved index=${f} (stable=${o} seqRow=${c})`),f<0){h&&Jr.current<4096?ne.current||(Jr.current+=1,!Yr.current&&e!==void 0?(Yr.current=!0,_.current(!0,e+1)):_.current(!0)):(Gr.current=void 0,ti.current=!1,ei.current=!1);return}Gr.current=void 0;let p=n[f];if(Zr(p.id),t!==void 0&&o<0&&K(`定位回退: 目标 ${t} 未命中，定位到 ${p.id}（消息可能在更新中）`),ti.current=!0,ei.current=!0,F.current=2**53-1,Qr.current=o>=0||c>=0?e:p.startSeq??p.seq,$r.current=!1,n.length>=120){let e=Math.max(0,f-20),t=Math.min(n.length,f+24+20);ie(n=>n.start===e&&n.end===t?n:{start:e,end:t})}},[u,h,y,a,o,s,l]),(0,c.useLayoutEffect)(()=>{if(Xr===void 0||$r.current)return;let e=Qr.current;if(e===void 0&&o===void 0&&s===void 0)return;let t=O.current;if(t===void 0)return;let n=()=>{F.current=2**53-1;let t=0,n=()=>{let r=O.current;if(r===void 0){console.debug(`[locate] scroll container missing`),ti.current=!1;return}let i=r.querySelector(`[data-message-id="${Il(Xr)}"]`),a=i?.querySelector(`.chat-search-mark`),o=s===void 0?null:i?.querySelector(`[data-part-id="${Il(s)}"]`)??null,c=(e===void 0?null:r.querySelector(`[data-step-seq="${Il(String(e))}"]`))??a??o??i??(e===void 0?null:r.querySelector(`[data-row-seq="${Il(String(e))}"]`));if(c===null){if(t>=10){console.debug(`[locate] anchor never surfaced (focusMsgId=${Xr} seq=${e??`-`})`),ti.current=!1;return}t+=1,requestAnimationFrame(n);return}r.scrollHeight;let l=c.getBoundingClientRect().top-r.getBoundingClientRect().top+r.scrollTop-8,d=r.scrollTop;lr(r,Math.max(0,l));try{c.scrollIntoView()}catch{}requestAnimationFrame(()=>{let r=O.current;if(r===void 0){ti.current=!1;return}let i=c.getBoundingClientRect().top,a=r.getBoundingClientRect().top,o=r.clientHeight;if(o<=0){$r.current=!0,ti.current=!1;return}if(!(i>=a-1&&i<=a+o+1)){console.debug(`[locate] verify: off-viewport anchorTop=${Math.round(i)} viewport=[${Math.round(a)},${Math.round(a+o)}] scrollTop ${d}->${r.scrollTop} clientH=${o} scrollH=${Math.round(r.scrollHeight)} tries=${t}`),t<12?(t+=1,requestAnimationFrame(n)):(K(`定位未成功(共${u.length}条, 窗口${_i?`开`:`关`}, 目标滚动≈${Math.round(l)}, 当前${Math.round(r.scrollTop)}/${Math.round(r.scrollHeight)})`),$r.current=!0,ti.current=!1);return}console.debug(`[locate] OK focusMsgId=${Xr} seq=${e??`-`} scrollTop ->${Math.round(r.scrollTop)} after ${t} try/tries`),$r.current=!0,ti.current=!1})};n()};if((()=>{let n=t.querySelector(`[data-message-id="${Il(Xr)}"]`),r=n?.querySelector(`.chat-search-mark`),i=s===void 0?null:n?.querySelector(`[data-part-id="${Il(s)}"]`)??null;return(e===void 0?null:t.querySelector(`[data-step-seq="${Il(String(e))}"]`))??r??i??n??(e===void 0?null:t.querySelector(`[data-row-seq="${Il(String(e))}"]`))})()!==null){n();return}let r=0,i,a=()=>{if(r+=1,r>120){t.querySelector(`[data-mid="${Xr}"]`)!==null&&n(),ti.current=!1;return}let e=O.current;if(e!==void 0){if(e.querySelector(`[data-message-id="${Il(Xr)}"]`)===null){i=setTimeout(a,50);return}n()}};return i=setTimeout(a,50),()=>clearTimeout(i)},[Xr,j,o,s,lr]);let ni=(0,c.useCallback)(e=>{qi(e).then(({image:e,failed:t})=>{if(t){K(`该图片无法解码，已忽略`);return}if($e.current.length>=4){K(`最多附加 4 张图片`);return}Qe(t=>[...t,e])})},[]),ri=(0,c.useCallback)(()=>{let n=w.trim();if(n===``&&Ze.length===0||te)return;if(typeof navigator<`u`&&navigator.onLine===!1){if(n===``){K(`离线状态暂不支持发送图片`);return}if(n.startsWith(`/`)){K(`离线状态暂不支持执行命令`);return}Ze.length>0&&K(`图片需联网发送，本次仅保存文本`);let t=it===void 0?n:`引用消息：\n> ${it.replace(/\n+/g,` `)}\n\n${n}`;Fo({id:`outbox-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,sessionId:e.sessionId,text:t,queuedAt:Date.now()}).then(()=>{T(``),xi(e.sessionId),at(void 0),Qe([]),K(`已离线保存，恢复网络后自动发送`),Un()});return}if(n.startsWith(`/`)&&it===void 0&&Ze.length===0){E(!0),Mr(n).then(()=>{E(!1),T(``),xi(e.sessionId)},()=>{E(!1)});return}E(!0);let r=Ki(it!==void 0&&n!==``?`引用消息：\n> ${it.replace(/\n+/g,` `)}\n\n${n}`:w,Ze);ce(e.sessionId,r).then(()=>{E(!1),T(``),xi(e.sessionId),Qe([]),at(void 0),t?.poke()},e=>{E(!1);let t=$(e),n=Zd(t);C(n===void 0?t:`${t} ${n}`),K(n===void 0?`发送失败：${t}`:`发送失败，请重启 dsh web 后再试`)})},[w,Ze,te,e.sessionId,t,it,Mr]),ii=(0,c.useRef)(``);(0,c.useEffect)(()=>()=>{xt.current=!1,bt.current?.cancel(),bt.current=void 0},[]);let W=(0,c.useCallback)(()=>{bt.current?.cancel(),bt.current=void 0,ii.current=``,gt(``),mt(!1),yt(`recording`)},[]),ai=(0,c.useCallback)(()=>{let e=bt.current;if(e===void 0){mt(!1);return}bt.current=void 0,yt(`transcribing`),e.stop().then(e=>{ii.current=`转写中...`,gt(`转写中...`),P(e,Js()).then(e=>{ii.current=``,gt(``),mt(!1),yt(`recording`),e.trim()!==``&&T(t=>t.trim()===``?e.trim():`${t.replace(/\s+$/,``)} ${e.trim()}`)},e=>{mt(!1),yt(`recording`),K(e instanceof Error?e.message:String(e))})},e=>{mt(!1),yt(`recording`),K(e instanceof Error?e.message:String(e))})},[]),oi=(0,c.useCallback)(()=>{ii.current=``,yt(`recording`),Ws({onTimeout:()=>{ai()}}).then(e=>{if(!xt.current){e.cancel();return}bt.current=e,mt(!0)},e=>{xt.current&&K(e instanceof Error?e.message:String(e))})},[ai]),si=(0,c.useCallback)(()=>{Qt||($t(!0),he(e.sessionId).then(()=>{$t(!1)},e=>{$t(!1),C($(e))}))},[Qt,e.sessionId]);Ne?.model;let ci=V===void 0?void 0:V.options.find(e=>e.value===V.currentValue)?.name??Rl(V.currentValue),li=(0,c.useMemo)(()=>{let e=je?.contextWindow,t=je?.pressureTokens;if(!(e===void 0||e<=0||t===void 0||t<0))return{pct:Math.min(100,Math.max(0,Math.round(t/e*100))),window:e,pressure:t}},[je]),ui=(0,c.useCallback)(()=>{Je(e=>e.status===`ready`?e:{status:`loading`}),_e(e.sessionId).then(e=>{Je({status:`ready`,data:e})},e=>{Je({status:`error`,message:$(e)})})},[e.sessionId]),di=()=>{Ie(null),We(!1),He(`model`),qe.status===`idle`&&ui()},fi=()=>{Ie(null),We(!1),He(`permission`)},pi=()=>{li!==void 0&&(Ie(null),He(null),We(e=>!e))},mi=(0,c.useCallback)(t=>{Ge||(Ke(!0),ve(e.sessionId,t).then(e=>{Ke(!1),Pe(e.selected),He(null)},e=>{Ke(!1),C($(e))}))},[Ge,e.sessionId]),hi=(0,c.useCallback)(t=>{if(t===V?.currentValue){He(null);return}if(t===`danger-full-access`){He(null),Ie(`permission`);return}Ge||(Ke(!0),fe(e.sessionId,`/permission ${t}`).then(e=>{if(Ke(!1),!e.matched){C(`权限命令未在宿主注册，无法切换`);return}ke(e=>e===void 0?e:{...e,currentValue:t}),He(null)},e=>{Ke(!1),C($(e))}))},[Ge,V,e.sessionId]),gi=(0,c.useMemo)(()=>Do(u.map(e=>e.time)),[u]),_i=u.length>=120,vi=_i&&j.end>j.start,Si=vi?j.start:0,Ci=vi?j.end:u.length,Di=k.current;(0,c.useEffect)(()=>{if(!_i||ti.current||!pr.current||!Hn||F.current>80)return;let e=requestAnimationFrame(()=>{F.current>80||dr()});return()=>cancelAnimationFrame(e)},[u,xe,dr,Hn,_i]);let Oi=Di!==void 0&&vi?(Di[Si]??0)+ge.current:0,ki=Di!==void 0&&vi?(Di[u.length]??0)-(Di[Ci]??Di[u.length]??0):0;(0,c.useEffect)(()=>{ar()},[u,xe,ar]),(0,c.useEffect)(()=>{if(!_i)return;let e=O.current;if(e===void 0)return;let t=!1;for(let n of e.querySelectorAll(`[data-mid]`)){if(n.classList.contains(`chat-msg-pending`))continue;let e=n.dataset.mid;if(e===void 0)continue;let r=n.offsetHeight;r>0&&be.current.get(e)!==r&&(be.current.set(e,r),t=!0)}t&&Se(e=>e+1)},[_i,vi,u,xe,nr]),(0,c.useEffect)(()=>{let e=O.current;if(e===void 0)return;let t=k.current?.[u.length]??0,n=e.scrollHeight===0?0:e.scrollHeight-t;if(n===ge.current||(ge.current=n,rr(e=>e+1),k.current===void 0)||!pr.current||F.current>80)return;let r=requestAnimationFrame(()=>{F.current>80||dr()});return()=>cancelAnimationFrame(r)},[_i,vi,u,xe,nr,dr]);let Ai=u[u.length-1]?.id,ji=e=>e.id===Ai&&e.kind===`assistant`&&e.pending!==!0&&!Tt?()=>Ar(e):void 0;return(0,G.jsxs)(`div`,{className:`chat`,children:[(0,G.jsxs)(`header`,{className:`mobile-header`,children:[(0,G.jsx)(`div`,{className:`mobile-headerSlot`,children:(0,G.jsx)(`button`,{type:`button`,className:`mobile-back`,"aria-label":`返回`,onClick:Fr,children:`‹`})}),(0,G.jsx)(`div`,{className:`mobile-titleWrap`,children:(0,G.jsx)(`h1`,{className:`mobile-title mobile-titleInline`,children:an})}),(0,G.jsxs)(`div`,{className:`mobile-headerSlot mobile-headerSlot-right`,children:[(0,G.jsx)(`button`,{type:`button`,className:`mobile-iconbtn`,"aria-label":`更多`,onClick:()=>{ln(!0)},children:(0,G.jsx)(Ma,{})}),(0,G.jsx)(xo,{})]})]}),S!==void 0&&(0,G.jsx)(`p`,{className:`mobile-error mobile-pad`,children:S}),(ct||ut>0)&&(0,G.jsxs)(`div`,{className:`chat-offline-banner`,role:`status`,style:{flexDirection:`column`,alignItems:`stretch`,padding:`8px 16px`},children:[(0,G.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,gap:8},children:[(0,G.jsx)(`span`,{children:ct?`网络已断开，消息将在恢复后发送`:ut>0?`${ut} 条离线消息待发送`:``}),!ct&&ut>0&&(0,G.jsx)(`button`,{type:`button`,className:`chat-offline-retry`,onClick:Gn,children:`重试`})]}),ft.length>0&&(0,G.jsx)(`ul`,{style:{listStyle:`none`,margin:`4px 0 0`,padding:0,display:`flex`,flexDirection:`column`,gap:4},children:ft.map(e=>(0,G.jsxs)(`li`,{style:{display:`flex`,alignItems:`center`,gap:8,fontSize:`var(--text-sm)`},children:[(0,G.jsx)(`span`,{style:{flex:1,overflow:`hidden`,textOverflow:`ellipsis`,whiteSpace:`nowrap`},children:e.text}),(0,G.jsx)(`button`,{type:`button`,className:`chat-offline-retry`,"aria-label":`移除待发送消息`,onClick:()=>{Wn(e.id)},children:`移除`})]},e.id))})]}),(0,G.jsxs)(`div`,{className:`chat-scroll`,ref:e=>{O.current=e??void 0},onScroll:cr,onClick:Vr,onDoubleClick:e=>{let t=e.target instanceof Element?e.target.closest(`.code-block`):null;if(t===null)return;let n=t.querySelector(`pre`);n!==null&&(n.style.transform=``)},onContextMenu:e=>{Ir(e.target,e.clientX,e.clientY)&&(e.preventDefault(),zr())},onTouchStart:e=>{if(e.touches.length>=2){zr();let t=(e.target instanceof Element?e.target:null)?.closest(`.code-block`)??null;if(t!==null){let n=Hr(e.touches);if(n>0){let e=t.querySelector(`pre`)?.style.transform??``,r=e===``?1:Number(/scale\(([\d.]+)\)/.exec(e)?.[1]??1);St.current={block:t,dist0:n,scale0:r};return}}St.current=void 0;return}St.current=void 0;let t=e.touches[0];if(t===void 0)return;let n=e.target instanceof Element?e.target:null;if(n===null||n.closest(`.chat-msg`)===null||n.closest(`.code-block pre, img`)!==null)return;let{clientX:r,clientY:i}=t,a=window.setTimeout(()=>{Lr.current=void 0,Ir(n,r,i)},500);Lr.current={timer:a,x:r,y:i}},onTouchMove:e=>{if(St.current!==void 0&&e.touches.length>=2){let t=Hr(e.touches);t>0&&Ur(St.current.scale0*t/St.current.dist0);return}zr()},onTouchEnd:e=>{St.current!==void 0&&e.touches.length<2&&(St.current=void 0),zr()},onTouchCancel:e=>{St.current!==void 0&&e.touches.length<2&&(St.current=void 0),zr()},children:[h&&(0,G.jsx)(`button`,{type:`button`,className:`chat-load-older`,disabled:y,onClick:()=>{Wr()},children:y?`加载中…`:`加载更早的消息`}),_i?(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(`div`,{style:{height:Oi},"aria-hidden":`true`}),u.slice(Si,Ci).map((t,n)=>{let a=Si+n;return(0,G.jsx)(Xc,{message:t,sessionId:e.sessionId,showToolCalls:r,showSystemMessages:i,clockOffsetMs:It.current,liveTurnStartAt:er??void 0,liveTurn:tr,showTime:gi[a]===!0,focused:t.id===Xr,focusedQuery:l,onOpenFile:e=>{Re(e)},onRegenerate:ji(t)},kl(t))}),(0,G.jsx)(`div`,{style:{height:ki},"aria-hidden":`true`})]}):u.map((t,n)=>{let a=n<u.length-30?{contentVisibility:`auto`,containIntrinsicSize:`auto ${Ll(t)}px`}:void 0;return(0,G.jsx)(Xc,{message:t,sessionId:e.sessionId,showToolCalls:r,showSystemMessages:i,clockOffsetMs:It.current,liveTurnStartAt:er??void 0,liveTurn:tr,showTime:gi[n]===!0,focused:t.id===Xr,focusedQuery:l,style:a,onOpenFile:e=>{Re(e)},onRegenerate:ji(t)},kl(t))}),y&&u.length===0&&(0,G.jsx)(`p`,{className:`chat-typing`,children:`加载中…`}),!y&&u.length===0&&(0,G.jsx)(`p`,{className:`chat-typing`,children:`还没有消息，发一句话开始吧`}),Tt&&(0,G.jsxs)(`div`,{className:`chat-turn-status`,role:`status`,"aria-label":zt?`连接中断`:Rt?`后台处理中`:`输出中`,children:[zt?`连接中断`:Rt?`后台处理中`:`输出中`,(0,G.jsxs)(`span`,{className:`chat-turn-dots`,"aria-hidden":!0,children:[(0,G.jsx)(`span`,{}),(0,G.jsx)(`span`,{}),(0,G.jsx)(`span`,{})]})]}),en.map(t=>(0,G.jsx)(_l,{approval:t,sessionId:e.sessionId,onResolved:t=>{oa(e.sessionId,t),tn(e=>e.filter(e=>e.approvalId!==t))}},t.approvalId)),nn.length>0&&(0,G.jsx)(yl,{questions:nn,sessionId:e.sessionId,onResolved:t=>{ta(e.sessionId,t),rn(e=>e.filter(e=>e.rpcId!==t))}}),mr&&mn.length>=2&&(0,G.jsx)(`button`,{type:`button`,className:`chat-jump-turns`+(jn===void 0?``:` chat-jump-turns-live`),"aria-label":`轮次导航：轻点开清单，按住拖动刮擦`,onPointerDown:wr,onPointerMove:Tr,onPointerUp:Er,onPointerCancel:Dr,onLostPointerCapture:Dr,onClick:e=>{e.detail===0&&dn(!0)},children:(0,G.jsxs)(`span`,{className:`chat-jump-turns-label`,children:[bn,`/`,hn]})}),xn!==void 0&&xn!==_n&&xn!==hn&&hn>=2&&(0,G.jsxs)(`button`,{type:`button`,className:`chat-jump-lastread`,"aria-label":`回到上次读到的轮次`,onClick:Cr,children:[`回到上次 · 第 `,xn,` 轮`]}),mr&&(0,G.jsxs)(`button`,{type:`button`,className:`chat-jump-latest`+(gr>0?` chat-jump-latest-hot`:``),"aria-label":`回到最新消息`,onClick:yr,children:[(0,G.jsx)(ya,{width:20,height:20}),gr>0&&(0,G.jsx)(`span`,{className:`chat-jump-badge`,children:gr>99?`99+`:gr})]})]}),(0,G.jsx)(lo,{todo:Ut,jobs:Vt,subagents:Jt,onOpen:()=>{Zt(!0)}}),jn!==void 0&&mn.length>=2&&(0,G.jsx)(Ol,{entries:mn,index:jn}),(0,G.jsxs)(`div`,{className:`chat-tools`,children:[(0,G.jsxs)(`div`,{className:`chat-tools-actions`,children:[(0,G.jsxs)(`button`,{type:`button`,className:`chat-pill`,onClick:di,"aria-haspopup":`listbox`,"aria-label":Ne===void 0?`切换模型`:`切换模型：${Pl(Ne.model)}`,title:Ne===void 0?void 0:`${Ne.provider}/${Ne.model}`,children:[(0,G.jsx)(Va,{width:16,height:16}),(0,G.jsx)(`span`,{className:`chat-pill-name`,children:Ne===void 0?`模型`:Pl(Ne.model)}),(0,G.jsx)(`span`,{className:`chat-pill-chevron`,"aria-hidden":!0,children:`▾`})]}),ci!==void 0&&V!==void 0&&(0,G.jsxs)(`button`,{type:`button`,className:`chat-pill chat-pill-perm chat-pill-perm-`+(Fl(V.currentValue)??`read`),onClick:fi,"aria-haspopup":`listbox`,"aria-label":`切换权限：${ci}`,title:ci,children:[(0,G.jsx)(Ha,{width:16,height:16}),(0,G.jsx)(`span`,{className:`chat-pill-name`,children:ci})]})]}),(0,G.jsx)(`div`,{className:`chat-context`+(li!==void 0&&li.pct>=80?` chat-context-warn`:``),role:`status`,onClick:pi,"aria-expanded":Ue,children:li===void 0?(0,G.jsx)(G.Fragment,{children:`上下文 --`}):(0,G.jsxs)(G.Fragment,{children:[(0,G.jsxs)(`svg`,{className:`chat-context-ring`,width:`26`,height:`26`,viewBox:`0 0 26 26`,"aria-hidden":!0,children:[(0,G.jsx)(`circle`,{className:`chat-context-ring-track`,cx:`13`,cy:`13`,r:`10.5`,fill:`none`,strokeWidth:`3.5`}),(0,G.jsx)(`circle`,{className:`chat-context-ring-fill`,cx:`13`,cy:`13`,r:`10.5`,fill:`none`,strokeWidth:`3.5`,strokeDasharray:`${li.pct/100*65.97} 65.97`,transform:`rotate(-90 13 13)`})]}),(0,G.jsxs)(`span`,{className:`chat-context-text`,title:`${Nl(li.pressure)}/${Nl(li.window)}`,children:[li.pct,`%`]})]})}),Ue&&li!==void 0&&(0,G.jsxs)(`div`,{className:`chat-context-pop`,role:`tooltip`,children:[(0,G.jsx)(`div`,{className:`chat-context-pop-title`,children:`上下文用量`}),(0,G.jsxs)(`div`,{className:`chat-context-pop-figures`,children:[Nl(li.pressure),(0,G.jsx)(`span`,{children:`/`}),Nl(li.window)]}),(0,G.jsxs)(`div`,{className:`chat-context-pop-sub`,children:[`已使用 `,li.pct,`%`]})]})]}),Ue&&(0,G.jsx)(`div`,{className:`chat-context-pop-scrim`,onClick:()=>{We(!1)}}),Ve!==null&&(0,G.jsx)(`div`,{className:`chat-picker-scrim`,onClick:()=>{He(null)}}),Ve===`model`&&(0,G.jsxs)(`div`,{className:`chat-picker-panel`,role:`menu`,"aria-label":`选择模型`,children:[qe.status===`loading`&&(0,G.jsx)(`span`,{className:`chat-picker-status`,children:`正在加载模型目录…`}),qe.status===`error`&&(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(`span`,{className:`chat-picker-status chat-picker-error`,children:qe.message}),Zd(qe.message)!==void 0&&(0,G.jsx)(`span`,{className:`chat-picker-status chat-picker-hint`,children:Zd(qe.message)}),(0,G.jsx)(`button`,{type:`button`,className:`chat-picker-more`,onClick:ui,children:`重试`})]}),qe.status===`ready`&&(0,G.jsxs)(G.Fragment,{children:[(()=>{let e=Ne??qe.data.current,t=(t,n)=>{let r=e!==void 0&&e.provider===t.id&&e.model===n.id;return(0,G.jsxs)(`button`,{type:`button`,className:`chat-picker-row`+(r?` chat-picker-row-selected`:``),disabled:Ge,onClick:()=>{mi({provider:t.id,model:n.id,...n.reasoning?.defaultEffort===void 0?{}:{reasoningEffort:n.reasoning.defaultEffort}})},children:[(0,G.jsx)(`span`,{className:`chat-picker-row-check`,"aria-hidden":!0,children:r?(0,G.jsx)(Fa,{width:14,height:14}):null}),(0,G.jsx)(`span`,{className:`chat-picker-row-copy`,children:(0,G.jsx)(`span`,{className:`chat-picker-row-title`,children:n.name})})]},`${t.id}:${n.id}`)};return qe.data.groups.map(e=>(0,G.jsxs)(`div`,{className:`chat-picker-group`,children:[(0,G.jsx)(`div`,{className:`chat-picker-group-title`,children:e.name}),e.models.map(n=>t(e,n))]},e.id))})(),(()=>{let e=Ne??qe.data.current,t=qe.data.groups.flatMap(e=>e.models.map(t=>({group:e,model:t}))).find(t=>t.group.id===e.provider&&t.model.id===e.model)?.model.reasoning,n=e.reasoningEffort??t?.defaultEffort,r=t===void 0?[]:[...t.defaultEffort===void 0?[{key:`provider-default`,effort:void 0,label:`跟随模型默认`}]:[],...t.efforts.map(e=>({key:`effort:${e.id}`,effort:e.id,label:e.name}))];return r.length===0?null:(0,G.jsxs)(`div`,{className:`chat-picker-group`,children:[(0,G.jsx)(`div`,{className:`chat-picker-group-title`,children:`思考强度`}),r.map(t=>{let r=n===t.effort;return(0,G.jsxs)(`button`,{type:`button`,className:`chat-picker-row`+(r?` chat-picker-row-selected`:``),disabled:Ge,onClick:()=>{mi({provider:e.provider,model:e.model,...t.effort===void 0?{}:{reasoningEffort:t.effort}})},children:[(0,G.jsx)(`span`,{className:`chat-picker-row-check`,"aria-hidden":!0,children:r?(0,G.jsx)(Fa,{width:14,height:14}):null}),(0,G.jsx)(`span`,{className:`chat-picker-row-copy`,children:(0,G.jsx)(`span`,{className:`chat-picker-row-title`,children:t.label})})]},t.key)})]})})(),(0,G.jsx)(`button`,{type:`button`,className:`chat-picker-more`,onClick:()=>{He(null),Ie(`model`)},children:`全部…`})]})]}),Ve===`permission`&&V!==void 0&&(0,G.jsxs)(`div`,{className:`chat-picker-panel`,role:`menu`,"aria-label":`选择权限`,children:[V.options.map(e=>{let t=e.value===V.currentValue;return(0,G.jsxs)(`button`,{type:`button`,className:`chat-picker-row`+(t?` chat-picker-row-selected`:``)+(e.value===`danger-full-access`?` chat-picker-row-danger`:``),disabled:Ge,onClick:()=>{hi(e.value)},children:[(0,G.jsx)(`span`,{className:`chat-picker-row-check`,"aria-hidden":!0,children:t?(0,G.jsx)(Fa,{width:14,height:14}):null}),(0,G.jsxs)(`span`,{className:`chat-picker-row-copy`,children:[(0,G.jsx)(`span`,{className:`chat-picker-row-title`,children:e.name}),e.description!==void 0&&(0,G.jsx)(`span`,{className:`chat-picker-row-sub`,children:e.description})]})]},e.value)}),(0,G.jsx)(`button`,{type:`button`,className:`chat-picker-more`,onClick:()=>{He(null),Ie(`permission`)},children:`全部…`})]}),Xt&&(0,G.jsx)(uo,{todo:Ut,jobs:Vt,subagents:Jt,onClose:()=>{Zt(!1)}}),(0,G.jsxs)(`div`,{className:`chat-composer`,children:[(0,G.jsx)(Ho,{items:jt,running:Tt,onEdit:Kn,onRemove:qn,onSteer:Jn}),it!==void 0&&(0,G.jsxs)(`div`,{className:`chat-quote-bar`,role:`note`,"aria-label":`引用消息`,children:[(0,G.jsxs)(`span`,{className:`chat-quote-text`,children:[it.slice(0,20),it.length>20?`…`:``]}),(0,G.jsx)(`button`,{type:`button`,className:`chat-quote-close`,"aria-label":`取消引用`,onClick:()=>{at(void 0)},children:(0,G.jsx)(La,{width:14,height:14})})]}),Ze.length>0&&(0,G.jsx)(`div`,{className:`chat-attach-bar`,role:`list`,"aria-label":`待发送图片`,children:Ze.map((e,t)=>(0,G.jsxs)(`div`,{className:`chat-attach-item`,role:`listitem`,children:[(0,G.jsx)(`img`,{className:`chat-attach-img`,src:e.dataUrl,alt:`待发送图片`}),(0,G.jsx)(`button`,{type:`button`,className:`chat-attach-remove`,"aria-label":`移除图片`,onClick:()=>{Qe(e=>e.filter((e,n)=>n!==t))},children:`×`})]},t))}),(0,G.jsxs)(`div`,{className:`chat-inputbar`,children:[(0,G.jsx)(`button`,{type:`button`,className:`chat-attach-btn`,"aria-label":`添加内容`,"aria-haspopup":`dialog`,onClick:()=>{Xe(!0)},children:(0,G.jsx)(_a,{width:20,height:20})}),Hs()&&(0,G.jsx)(`button`,{type:`button`,className:`chat-attach-btn`,"aria-label":`语音输入`,onClick:oi,children:(0,G.jsx)(Ia,{width:20,height:20})}),(0,G.jsx)(`textarea`,{className:`chat-input`,rows:1,value:w,placeholder:`说点什么...`,enterKeyHint:Ct?`send`:`enter`,onChange:e=>{T(e.target.value)},onFocus:()=>{st(!0)},onBlur:()=>{st(!1)},onPaste:e=>{let t=Zi(e.clipboardData);if(t.length>0){e.preventDefault();for(let e of t)ni(e)}},onKeyDown:e=>{Ct&&e.key===`Enter`&&!e.shiftKey&&!e.nativeEvent.isComposing&&(e.preventDefault(),ri())}}),(0,G.jsx)(`button`,{type:`button`,className:Tt?`chat-send chat-send-stop`:`chat-send`,...Tt?{"aria-label":Qt?`停止中`:`停止`}:{"aria-label":`发送`},disabled:Tt?Qt:te||w.trim()===``&&Ze.length===0,onClick:()=>{Tt?si():ri()},children:Tt?(0,G.jsx)(`svg`,{viewBox:`0 0 16 16`,width:`14`,height:`14`,"aria-hidden":`true`,focusable:`false`,children:(0,G.jsx)(`rect`,{x:`3`,y:`3`,width:`10`,height:`10`,rx:`3`,fill:`currentColor`})}):(0,G.jsx)(ba,{})})]})]}),Ye&&(0,G.jsx)(pl,{commands:nt,onPickImage:()=>{Xe(!1),et.current?.click()},onPickCamera:()=>{Xe(!1),tt.current?.click()},onPickCommand:e=>{Xe(!1),Mr(e).catch(()=>{})},onClose:()=>{Xe(!1)}}),(0,G.jsx)(`input`,{ref:et,type:`file`,accept:`image/*`,multiple:!0,hidden:!0,onChange:e=>{let t=[...e.target.files??[]];for(let e of t)ni(e);e.target.value=``}}),(0,G.jsx)(`input`,{ref:tt,type:`file`,accept:`image/*`,capture:`environment`,hidden:!0,onChange:e=>{let t=[...e.target.files??[]];for(let e of t)ni(e);e.target.value=``}}),Fe===`model`&&(0,G.jsx)(ml,{sessionId:e.sessionId,current:Ne,onCurrent:e=>{Pe(e)},onClose:()=>{Ie(null)}}),Fe===`permission`&&V!==void 0&&(0,G.jsx)(hl,{sessionId:e.sessionId,value:V,onChanged:e=>{ke(t=>t===void 0?t:{...t,currentValue:e})},onClose:()=>{Ie(null)}}),un&&(0,G.jsx)(gl,{entries:mn,currentTurn:bn,onPick:Sr,onClose:()=>{dn(!1)}}),Le!==null&&(0,G.jsx)(Ls,{path:Le,sessionId:e.sessionId,onClose:()=>{Re(null)}}),ze!==null&&(0,G.jsx)(Bs,{src:ze,alt:`聊天图片`,onClose:()=>{Be(null)}}),cn&&(0,G.jsx)(la,{title:an,onClose:()=>{ln(!1)},children:(0,G.jsxs)(`div`,{role:`menu`,"aria-label":`会话操作`,children:[(0,G.jsxs)(`button`,{type:`button`,role:`menuitem`,className:`sheet-option`,onClick:()=>{ln(!1),Fn(!0)},children:[(0,G.jsx)(`span`,{className:`sheet-option-copy`,children:(0,G.jsx)(`span`,{className:`sheet-option-title`,children:`重命名会话`})}),(0,G.jsx)(Pa,{width:16,height:16})]}),(0,G.jsx)(`button`,{type:`button`,role:`menuitem`,className:`sheet-option`,onClick:()=>{ln(!1),po(e.sessionId)},children:(0,G.jsx)(`span`,{className:`sheet-option-copy`,children:(0,G.jsx)(`span`,{className:`sheet-option-title`,children:`复制会话 ID`})})}),(0,G.jsx)(`div`,{className:`sheet-option-divider`,"aria-hidden":!0}),(0,G.jsx)(`button`,{type:`button`,role:`menuitem`,className:`sheet-option`,onClick:()=>{ln(!1),Ln(!0)},children:(0,G.jsx)(`span`,{className:`sheet-option-copy`,children:(0,G.jsx)(`span`,{className:`sheet-option-title`,style:{color:`var(--danger)`},children:`删除会话`})})})]})}),Pn&&(0,G.jsx)(ic,{title:`重命名会话`,initial:an,confirmLabel:`保存`,onCancel:()=>{Fn(!1)},onConfirm:e=>{Nr(e)}}),In&&(0,G.jsx)(rc,{title:`删除会话`,body:(0,G.jsxs)(G.Fragment,{children:[`确定删除「`,an,`」吗？该会话将从所有设备消失（电脑上的会话记录保留，可从桌面找回）。`]}),confirmLabel:`删除`,tone:`danger`,onCancel:()=>{Ln(!1)},onConfirm:Pr}),H&&(0,G.jsx)(`div`,{className:`voice-backdrop`,onClick:()=>{W()},children:(0,G.jsxs)(`div`,{className:`voice-sheet`,role:`dialog`,"aria-modal":`true`,"aria-label":`语音输入`,onClick:e=>{e.stopPropagation()},children:[(0,G.jsxs)(`div`,{className:`voice-wave`+(vt===`transcribing`?` voice-wave-idle`:``),"aria-hidden":!0,children:[(0,G.jsx)(`span`,{}),(0,G.jsx)(`span`,{}),(0,G.jsx)(`span`,{}),(0,G.jsx)(`span`,{}),(0,G.jsx)(`span`,{})]}),(0,G.jsx)(`div`,{className:`voice-text`,role:`status`,children:vt===`transcribing`?`转写中...`:ht===``?`正在听...`:ht}),(0,G.jsx)(`button`,{type:`button`,className:`voice-done`,disabled:vt===`transcribing`,onClick:ai,children:vt===`transcribing`?`请稍候`:`完成`})]})}),Rn!==void 0&&(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(`div`,{className:`ctx-backdrop`,onClick:()=>{zn(void 0)},onContextMenu:e=>{e.preventDefault(),zn(void 0)}}),(0,G.jsxs)(`div`,{className:`ctx-menu`,role:`menu`,"aria-label":`消息操作`,style:{left:Rn.x,top:Rn.y},children:[Rn.kind===`user`&&Rn.messageId!==void 0&&(0,G.jsx)(`button`,{type:`button`,role:`menuitem`,className:`ctx-item`,onClick:()=>{let{text:e,messageId:t}=Rn;zn(void 0),t!==void 0&&Vn({messageId:t,text:e})},children:`编辑并重新发送`}),Rn.raw!==void 0&&(0,G.jsx)(`button`,{type:`button`,role:`menuitem`,className:`ctx-item`,onClick:()=>{let{raw:e}=Rn;zn(void 0),po(e??``,`已复制原文`)},children:`复制原文`}),(0,G.jsx)(`button`,{type:`button`,role:`menuitem`,className:`ctx-item`,onClick:()=>{let{text:e}=Rn;zn(void 0),po(e)},children:`复制`}),(0,G.jsx)(`button`,{type:`button`,role:`menuitem`,className:`ctx-item`,onClick:()=>{let{text:e}=Rn;zn(void 0),Or(e)},children:`引用`}),(0,G.jsx)(`button`,{type:`button`,role:`menuitem`,className:`ctx-item`,onClick:()=>{let{raw:e,text:t}=Rn;zn(void 0),mo(e??t)},children:`分享`})]})]}),Bn!==void 0&&(0,G.jsx)(ic,{title:`编辑并重新发送`,initial:Bn.text,confirmLabel:`发送`,onCancel:()=>{Vn(void 0)},onConfirm:e=>{kr(Bn.messageId,e)}})]})}function Bl(e){return[{type:`text`,text:e}]}function Vl(e){if(typeof e!=`object`||!e)return;let t=e;return{...typeof t.contextWindow==`number`?{contextWindow:t.contextWindow}:{},...typeof t.pressureTokens==`number`?{pressureTokens:t.pressureTokens}:{},...typeof t.projectedTokens==`number`?{projectedTokens:t.projectedTokens}:{}}}const Hl=new Set([`running`,`stopping`]);function Ul(e){return Hl.has(e.status)}function Wl(e){if(e===void 0)return;let t=e.projections?.values?.title;if(typeof t==`string`&&t!==``)return t;if(e.cwd!==void 0){let t=e.cwd.split(`/`).filter(Boolean).at(-1);if(t!==void 0&&t!==``)return t}}async function Gl(){let e=[],t;for(let n=0;n<8;n++){let n,r=!1;try{let e=await re(t);n=e.items,t=e.nextCursor,r=e.hasMore}catch{return{rows:e,truncated:!0}}for(let t of n)e.push({sessionId:String(t.sessionId),...Wl(t)===void 0?{}:{title:Wl(t)},running:t.running===!0,blank:t.blank===!0});if(!r)return{rows:e,truncated:!1}}return{rows:e,truncated:!0}}function Kl(e,t,n){let r=new Map,i=e=>{r.has(e)||r.set(e,{sessionId:e,title:t.get(e)?.title??`会话 ${e.slice(0,6)}`,jobs:[],live:!1,runningOnly:!1})};for(let t of e){if(t.jobs.length===0)continue;i(t.sessionId);let e=r.get(t.sessionId);e.jobs=t.jobs,e.live=t.jobs.some(e=>Ul(e))}for(let e of n){i(e);let n=r.get(e);if(n.live=!0,n.jobs.length===0&&(n.runningOnly=!0),n.title.startsWith(`会话 `)){let r=t.get(e);r?.title!==void 0&&(n.title=r.title)}}let a=[...r.values()];return a.sort((e,t)=>e.live===t.live?e.runningOnly===t.runningOnly?e.sessionId<t.sessionId?-1:+(e.sessionId>t.sessionId):e.runningOnly?-1:1:e.live?-1:1),a}function ql({mux:e,onBack:t,onOpenSession:n}){let[r,i]=(0,c.useState)(()=>e?.jobsSnapshot()??[]),[a,o]=(0,c.useState)(new Map),[s,l]=(0,c.useState)(()=>{let t=new Set;for(let n of e?.runningSessionsSnapshot()??[])t.add(n);return t}),u=(0,c.useRef)(new Set(e?.runningSessionsSnapshot()??[])),[d,f]=(0,c.useState)(()=>new Map),p=(e,t)=>{let n=new Set(u.current);t?n.add(e):n.delete(e),u.current=n,l(n)};(0,c.useEffect)(()=>{let e=!1;return Gl().then(({rows:t})=>{if(e)return;let n=new Map,r=new Set(u.current);for(let e of t)n.set(e.sessionId,e),e.running===!0&&!e.blank&&r.add(e.sessionId);u.current=r,o(n),l(r)},()=>{e||l(new Set(u.current))}),()=>{e=!0}},[]),(0,c.useEffect)(()=>{if(e===void 0)return;let t=e.onFrame(t=>{if(t.type===`session/jobs`||t.type===`session/subscribed`){i(e.jobsSnapshot());return}if(t.type===`session/event`){let e=t.event.type,n=String(t.sessionId);e===`turn/start`?p(n,!0):e===`turn/end`&&p(n,!1)}});return i(e.jobsSnapshot()),t},[e]);let m=Kl(r,a,s),h=m.filter(e=>e.live).map(e=>e.sessionId).slice(0,4),g=h.join(`|`);(0,c.useEffect)(()=>{if(g===``)return;let e=g.split(`|`),t=!1,n=()=>{for(let n of e)Qa(n).then(e=>{t||e===void 0||f(t=>new Map(t).set(n,e))})};n();let r=setInterval(n,Za);return()=>{t=!0,clearInterval(r)}},[g]);let _=h.reduce((e,t)=>e+eo(d.get(t)??[]).length,0),v=m.reduce((e,t)=>e+t.jobs.filter(e=>Ul(e)).length,0),y=m.filter(e=>e.live).length,b=m.filter(e=>e.live),x=m.filter(e=>!e.live);return(0,G.jsxs)(`div`,{className:`mobile`,children:[(0,G.jsxs)(`header`,{className:`mobile-header`,style:{paddingTop:`calc(env(safe-area-inset-top, 0px) + 4px)`},children:[(0,G.jsx)(`div`,{className:`mobile-headerSlot`,children:(0,G.jsx)(`button`,{type:`button`,className:`mobile-back`,"aria-label":`返回`,onClick:t,children:`‹`})}),(0,G.jsx)(`h1`,{className:`mobile-title`,children:`运行中`}),(0,G.jsx)(`div`,{className:`mobile-headerSlot mobile-headerSlot-right`})]}),(0,G.jsxs)(`div`,{className:`runov-page`,children:[m.length===0&&(0,G.jsxs)(`div`,{className:`mobile-empty`,style:{paddingTop:28},children:[(0,G.jsx)(`div`,{className:`empty-icon`,children:(0,G.jsx)(xa,{})}),(0,G.jsx)(`p`,{className:`empty-title`,children:`当前没有运行中的会话或任务`}),(0,G.jsx)(`p`,{className:`empty-desc`,children:`会话输出、子代理委派、命令运行会实时显示在这里`})]}),m.length>0&&(0,G.jsxs)(`div`,{className:`runov-scroll`,children:[(0,G.jsxs)(`div`,{className:`runov-hero`,children:[(0,G.jsx)(`span`,{className:`chat-status-dot chat-status-dot-live`,"aria-hidden":!0}),(0,G.jsxs)(`span`,{className:`runov-hero-copy`,children:[(0,G.jsx)(`span`,{className:`runov-hero-t`,children:v>0||y>0?`${y} 个会话正在运行 · ${v} 个后台任务`+(_>0?` · ${_} 个子代理`:``):`${m.length} 个会话有近期后台任务`}),(0,G.jsx)(`span`,{className:`runov-hero-s`,children:`跨全部工作区 · 实时同步`})]})]}),b.length>0&&(0,G.jsxs)(G.Fragment,{children:[(0,G.jsxs)(`div`,{className:`runov-group-title`,children:[`正在运行 · `,y]}),b.map(e=>(0,G.jsx)(Jl,{row:e,children:d.get(e.sessionId),onOpen:()=>{n({sessionId:e.sessionId,title:e.title})}},e.sessionId))]}),x.length>0&&(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(`div`,{className:`runov-group-title`,children:`最近结束`}),x.map(e=>(0,G.jsx)(Jl,{row:e,onOpen:()=>{n({sessionId:e.sessionId,title:e.title})}},e.sessionId))]})]})]})]})}function Jl({row:e,children:t,onOpen:n}){let[r,i]=(0,c.useState)(!1),[a,o]=(0,c.useState)(!1),s=e.jobs.filter(e=>Ul(e)),l=e.jobs.filter(e=>!Ul(e)),u=e.live?no(eo(t??[])):[],d=Math.max(0,u.length-3),f=a||d===0?u:u.slice(0,3),p=s.filter(e=>e.kind===`subagent`),m=p.length>0&&u.length>=p.length?s.filter(e=>e.kind!==`subagent`):s;return(0,G.jsxs)(`div`,{className:`runov-sess`,children:[(0,G.jsxs)(`button`,{type:`button`,className:`runov-sess-head`,onClick:n,children:[e.live&&(0,G.jsxs)(`span`,{className:`runov-sess-live`,children:[(0,G.jsx)(`span`,{className:`chat-status-dot chat-status-dot-live`,"aria-hidden":!0}),e.runningOnly?`回合中`:`运行中`]}),(0,G.jsxs)(`span`,{style:{flex:1,minWidth:0},children:[(0,G.jsx)(`span`,{className:`runov-sess-title`,children:e.title}),(0,G.jsx)(`span`,{className:`runov-sess-sub`,children:e.sessionId})]}),(0,G.jsx)(`span`,{className:`runov-sess-chev`,children:`›`})]}),f.length>0&&(0,G.jsxs)(`div`,{className:`runov-jobs`,children:[(0,G.jsx)(`div`,{className:`runov-subgroup-title`,children:`子代理`}),(0,G.jsx)(`div`,{role:`list`,"aria-label":`${e.title} 的子代理`,children:f.map(e=>(0,G.jsx)(so,{node:e},e.id))})]}),d>0&&(0,G.jsxs)(`button`,{type:`button`,className:`runov-jobs-fold`,"aria-expanded":a,onClick:()=>{o(e=>!e)},children:[(0,G.jsx)(`span`,{className:`runov-jobs-fold-label`,children:a?`收起子代理`:`… 还有 ${d} 个子代理`}),(0,G.jsx)(`span`,{className:`runov-jobs-fold-chev`,"aria-hidden":!0,children:a?`▾`:`▸`})]}),m.length>0&&(0,G.jsxs)(`div`,{className:`runov-jobs`,children:[f.length>0&&(0,G.jsx)(`div`,{className:`runov-subgroup-title`,children:`后台任务`}),(0,G.jsx)(`div`,{role:`list`,"aria-label":`${e.title} 的后台任务`,children:m.map(e=>(0,G.jsx)(Xa,{job:e},e.id))})]}),l.length>0&&(0,G.jsxs)(G.Fragment,{children:[(0,G.jsxs)(`button`,{type:`button`,className:`runov-jobs-fold`,"aria-expanded":r,onClick:()=>{i(e=>!e)},children:[(0,G.jsx)(`span`,{className:`runov-jobs-fold-label`,children:r?`收起已完成`:`${l.length} 个已完成`}),(0,G.jsx)(`span`,{className:`runov-jobs-fold-chev`,"aria-hidden":!0,children:r?`▾`:`▸`})]}),r&&(0,G.jsx)(`div`,{className:`runov-jobs runov-jobs-settled`,role:`list`,"aria-label":`${e.title} 的已完成任务`,children:l.map(e=>(0,G.jsx)(Xa,{job:e},e.id))})]}),e.runningOnly&&(0,G.jsx)(`div`,{className:`runov-jobs`,role:`status`,children:(0,G.jsxs)(`div`,{className:`chat-task-row`,children:[(0,G.jsx)(`span`,{className:`chat-task-dot chat-task-dot-running`,"aria-hidden":!0}),(0,G.jsxs)(`span`,{className:`chat-task-copy`,children:[(0,G.jsx)(`span`,{className:`chat-task-label`,children:`回合运行中`}),(0,G.jsx)(`span`,{className:`chat-task-meta`,children:`正在生成回复 · 点击进入查看`})]})]})})]})}function Yl(e,t){return e.filter(e=>t.has(String(e.sessionId))).map(e=>Hd(e))}function Xl(){return{added:new Map,status:new Map,activity:new Map,error:new Map,removed:new Set}}function Zl(e,t){return t.sessionIds.includes(e.sessionId)?!0:e.cwd!==void 0&&e.cwd===t.path}function Ql(e,t,n){switch(t.type){case`session/added`:{let r=t.summary;if(typeof r!=`object`||!r)return!1;let i=String(r.sessionId);return Zl(r,n)?(e.added.set(i,Hd(r)),e.removed.delete(i),!0):!1}case`session/removed`:{let n=String(t.sessionId);return e.added.delete(n),e.status.delete(n),e.activity.delete(n),e.error.delete(n),e.removed.add(n),!0}case`session/status`:{let n=String(t.sessionId);return e.status.set(n,t.running),t.running&&e.error.delete(n),!0}case`session/activity`:return e.activity.set(String(t.sessionId),t.updatedAt),!0;case`session/error`:return e.error.set(String(t.sessionId),t.message),!0;default:return!1}}function $l(e,t){let n=t.status.get(e.sessionId),r=t.activity.get(e.sessionId),i=t.error.get(e.sessionId),a=n===!0&&e.error!==void 0;if(n===void 0&&r===void 0&&i===void 0&&!a)return e;let o={...e};return n!==void 0&&(o.running=n),r!==void 0&&(o.updatedAt=r),i===void 0?a&&delete o.error:o.error=i,o}function eu(e,t){if(t.added.size===0&&t.removed.size===0&&t.status.size===0&&t.activity.size===0&&t.error.size===0)return e;let n=[];for(let r of e)t.removed.has(r.sessionId)||n.push($l(r,t));for(let[e,r]of t.added)n.some(t=>t.sessionId===e)||n.push($l(r,t));return n.sort((e,t)=>t.updatedAt-e.updatedAt)}function tu(e,t=new Date){let n=new Date(e),r=e=>new Date(e.getFullYear(),e.getMonth(),e.getDate()).getTime(),i=r(t);return r(n)===i?`今天`:r(n)===i-864e5?`昨天`:`更早`}const nu=[`今天`,`昨天`,`更早`],ru=12e3,iu=new Map;let au=!1;function ou(){if(!au){if(au=!0,iu.size===0)for(let[e,t]of pi())iu.set(e,t);ki()}}function su(e,t){Lr.set(e,{...t,at:Date.now()}),si(e,t)}function cu(){ci(iu)}async function lu(e,t){try{let n=_t((await M(e,void 0,1,t)).events.map(e=>e.event));for(let e=n.length-1;e>=0;e--){let t=n[e];if(t===void 0)continue;let r=Eo(t.text===``?t.reasoning??``:t.text);if(r!==``)return r}return}catch{return}}async function uu(e,t,n){let r=0,i=Array.from({length:Math.min(t,e.length)},async()=>{for(;r<e.length;){let t=e[r];r+=1,await n(t)}});await Promise.all(i)}function du({workspace:e,mux:t,initialSessionId:n,initialSearch:r,onBack:i,onPick:a,onOpenSettings:o,onLocateSession:s,onPickSeq:l,onSearchSnapshot:u,onSearchApplied:d}){let[f,p]=(0,c.useState)([]),m=(0,c.useRef)(Xl()),[h,g]=(0,c.useState)(!1),[_,v]=(0,c.useState)(!0),[b,x]=(0,c.useState)(void 0),S=(0,c.useMemo)(()=>new Set(e.sessionIds.map(String)),[e]),[C,w]=(0,c.useState)(!1),[T,ee]=(0,c.useState)(void 0),[te,E]=(0,c.useState)([]),[D,O]=(0,c.useState)(void 0),[ne,k]=(0,c.useState)(!0),M=(0,c.useRef)(void 0),N=(0,c.useRef)(!1),[oe,ce]=(0,c.useState)(0),le=(0,c.useRef)(0),ue=(0,c.useRef)(void 0),[de,fe]=(0,c.useState)(!1),[P,pe]=(0,c.useState)(``),[F,me]=(0,c.useState)([]),[he,ge]=(0,c.useState)(!1),[_e,ve]=(0,c.useState)(!1),[ye,be]=(0,c.useState)(0),[xe,Se]=(0,c.useState)(!1),I=(0,c.useRef)(new Set),L=(0,c.useRef)(!1),Ce=(0,c.useRef)(!1);(0,c.useEffect)(()=>{Ce.current||r!==void 0&&r.open&&(Ce.current=!0,fe(!0),pe(r.term),d?.())},[r,d]),(0,c.useEffect)(()=>{u?.(de,P)},[de,P,u]);let we=(0,c.useCallback)(async(e,t,n)=>{let r=t;for(let t=0;t<8&&r!==void 0;t++){let t=await re(r),i=Yl(t.items,n).find(t=>t.sessionId===e);if(i!==void 0)return i;if(!t.hasMore)return;r=t.nextCursor}},[]),[Ee,De]=(0,c.useState)(0),Oe=(0,c.useRef)(!0);(0,c.useEffect)(()=>()=>{Oe.current=!1},[]);let R=(0,c.useRef)(0),[z,B]=(0,c.useState)(void 0),[V,ke]=(0,c.useState)(void 0),Ae=(0,c.useRef)(void 0),je=(0,c.useRef)(void 0),[Me,Ne]=(0,c.useState)(()=>gi()),[Pe,Fe]=(0,c.useState)(void 0),Ie=(0,c.useRef)(void 0),Le=(0,c.useCallback)(e=>{Ne(t=>{let n=new Set(t);return n.has(e)?n.delete(e):n.add(e),_i(n),n})},[]),Re=(0,c.useCallback)(e=>{let t=e.filter(e=>!e.blank&&e.preview===void 0&&!iu.has(e.sessionId)).slice(0,12);if(t.length===0)return;let n=new AbortController,r=e=>{for(let t of e)if(t.summary!==``){if(iu.size>=200){let e=iu.keys().next().value;e!==void 0&&iu.delete(e)}iu.set(t.sessionId,t.summary)}};se(t.map(e=>e.sessionId),n.signal).then(e=>{Oe.current&&(r(e),cu(),De(e=>e+1))},()=>{Oe.current&&uu(t.slice(0,6),3,async e=>{if(!Oe.current)return;let t=await lu(e.sessionId,n.signal);t===void 0||!Oe.current||r([{sessionId:e.sessionId,summary:t}])}).then(()=>{Oe.current&&(cu(),De(e=>e+1))})})},[]);(0,c.useEffect)(()=>{if(t!==void 0)return t.onFrame(t=>{Ql(m.current,t,e)&&p(e=>eu(e,m.current))})},[t,e]),(0,c.useEffect)(()=>{let t=!1;ou();let r=String(e.workspaceId),i=Lr.get(r);if(i!==void 0&&Date.now()-i.at>=6e4&&(i=void 0),i===void 0){let e=li(r);e!==void 0&&(i={rows:e.rows,cursor:e.cursor,hasMore:e.hasMore,at:Date.now()},Lr.set(r,i))}i===void 0?(v(!0),x(void 0)):(p(eu(i.rows,m.current)),M.current=i.cursor,g(i.hasMore),x(void 0),v(!1));let o=setTimeout(()=>{t||(v(!1),x(`加载超时了，点一下"加载更多"重试`))},ru);y().then(n=>{if(t)return;let r=n.find(t=>t.workspaceId===e.workspaceId);r!==void 0&&(I.current=new Set(r.sessionIds.map(String)))},()=>void 0);let s=Promise.race([y().catch(()=>[]),new Promise(e=>{setTimeout(()=>e([]),2500)})]);return Promise.all([re(void 0,e.workspaceId),s]).then(([i,s])=>{if(t)return;clearTimeout(o),x(void 0);let c=s.find(t=>t.workspaceId===e.workspaceId),l=new Set((c?.sessionIds??e.sessionIds).map(String));I.current=l;let u=Yl(i.items,l),d=n===void 0?void 0:u.find(e=>e.sessionId===n);if(d!==void 0){a(d);return}if(p(eu(u,m.current)),su(r,{rows:u,cursor:i.nextCursor,hasMore:i.hasMore}),Re(u),M.current=i.nextCursor,g(i.hasMore),v(!1),n!==void 0&&d===void 0&&!L.current){L.current=!0;let e=()=>({sessionId:n,title:`定位的会话`,updatedAt:0,running:!1,blank:!1});i.hasMore?we(n,i.nextCursor,l).then(t=>{a(t??e())},()=>{}):a(e())}},e=>{t||(i===void 0&&x($(e)),v(!1))}),()=>{t=!0}},[e,n,a,Re]),(0,c.useEffect)(()=>{let t=String(e.workspaceId),n=di(t);return n>0&&requestAnimationFrame(()=>{try{window.scrollTo(0,n)}catch{}}),()=>{fi(t,window.scrollY)}},[e.workspaceId]),(0,c.useEffect)(()=>{let e=!1;return E([]),O(void 0),k(!0),ie().then(t=>{if(e)return;let n=t.presets.filter(e=>e.broken===void 0);E(t.presets),O((n.find(e=>e.isDefault)??n[0])?.id),k(!1)},()=>{e||k(!1)}),()=>{e=!0}},[e,oe]);let ze=(0,c.useCallback)((t=!1)=>{if(N.current||!t&&Date.now()-R.current<1e4)return;let n=M.current;if(n===void 0){t&&ce(e=>e+1);return}N.current=!0,v(!0);let r=setTimeout(()=>{Oe.current&&(N.current=!1,v(!1),R.current=Date.now(),x(`加载超时了，再点一次`))},ru);re(n,e.workspaceId).then(t=>{N.current=!1,v(!1),clearTimeout(r),x(void 0),R.current=0,M.current=t.nextCursor,g(t.hasMore);let n=Yl(t.items,S);p(r=>{let i=[...r,...n];return Lr.get(String(e.workspaceId))!==void 0&&su(String(e.workspaceId),{rows:i,cursor:t.nextCursor,hasMore:t.hasMore}),i}),Re(n)},e=>{N.current=!1,v(!1),clearTimeout(r),R.current=Date.now(),x($(e))})},[e,Re]);(0,c.useEffect)(()=>{let e=ue.current;if(e===void 0||typeof IntersectionObserver>`u`)return;let t=new IntersectionObserver(e=>{e.some(e=>e.isIntersecting)&&(le.current=0,M.current!==void 0&&!N.current&&ze())},{rootMargin:`240px 0px`});return t.observe(e),()=>{t.disconnect()}},[ze]),(0,c.useEffect)(()=>{if(!h||_||le.current>=2)return;let e=ue.current;e!=null&&(e.getBoundingClientRect().top-window.innerHeight>240||(le.current+=1,ze()))},[h,_,f,ze]);let Be=(0,c.useCallback)(()=>{C||(w(!0),ee(void 0),ae({workspaceId:e.workspaceId,...D===void 0?{}:{agentPreset:D}}).then(t=>{w(!1);let n={sessionId:t.sessionId,title:`新会话`,updatedAt:Date.now(),running:!1,blank:!0};p(t=>{let r=[n,...t],i=Lr.get(String(e.workspaceId));return i!==void 0&&su(String(e.workspaceId),{rows:r,cursor:i.cursor,hasMore:i.hasMore}),r}),a(n)},e=>{w(!1),ee($(e))}))},[C,e,a,D]),Ve=(0,c.useCallback)(()=>{Ae.current!==void 0&&(clearTimeout(Ae.current),Ae.current=void 0)},[]);(0,c.useEffect)(()=>()=>{Ve()},[Ve]);let He=(e,t)=>({onTouchStart:t=>{Ve(),je.current=void 0,Ae.current=window.setTimeout(()=>{Ae.current=void 0,je.current=e.sessionId,B(e)},500);let n=t.touches[0];n!==void 0&&(Ie.current={sessionId:e.sessionId,x:n.clientX,y:n.clientY})},onTouchMove:t=>{Ve();let n=Ie.current;if(n===void 0||n.sessionId!==e.sessionId)return;let r=t.touches[0];if(r===void 0)return;let i=r.clientX-n.x,a=r.clientY-n.y;Math.abs(i)>40&&Math.abs(i)>Math.abs(a)*1.5?(Fe(i<0?e.sessionId:void 0),Ie.current=void 0):Math.abs(a)>40&&(Ie.current=void 0)},onTouchEnd:()=>{Ve(),Ie.current=void 0},onClick:n=>{if(je.current===e.sessionId){je.current=void 0,n.preventDefault();return}if(Pe===e.sessionId){Fe(void 0),n.preventDefault();return}t===void 0?a(e):$e(t,e.title)},onContextMenu:t=>{t.preventDefault(),B(e)}}),Ue=(0,c.useCallback)(t=>{ke(void 0),B(void 0),p(n=>{let r=n.filter(e=>e.sessionId!==t.sessionId),i=Lr.get(String(e.workspaceId));return i!==void 0&&su(String(e.workspaceId),{rows:r,cursor:i.cursor,hasMore:i.hasMore}),r}),Ro(t.sessionId),Te(t.sessionId).catch(e=>{K(`删除未生效：${$(e)}`)})},[e]),We=T===void 0?void 0:Zd(T),Ge=te.find(e=>e.id===D),[Ke,qe]=(0,c.useState)(!1),[Je,Ye]=(0,c.useState)(!1),Xe=Ge?.description,Ze=(0,c.useMemo)(()=>{let e=P.trim().toLowerCase(),t=new Set(F.map(e=>e.sessionId)),n=f.filter(n=>e===``||n.title.toLowerCase().includes(e)||t.has(n.sessionId)),r=n.filter(e=>Me.has(e.sessionId)),i=n.filter(e=>!Me.has(e.sessionId)),a=r.length>0?[{bucket:`置顶`,rows:r}]:[],o=nu.map(e=>({bucket:e,rows:i.filter(t=>tu(t.updatedAt)===e)})).filter(e=>e.rows.length>0);return[...a,...o]},[f,P,F,Ee,Me]);(0,c.useEffect)(()=>{let e=P.trim();if(e===``){me([]),be(0),Se(!1),ve(!1),ge(!1);return}ge(!0),ve(!1);let t=!1,n=setTimeout(()=>{A(e).then(e=>{if(t)return;let n=I.current;me(e.items.filter(e=>n.has(e.sessionId))),be(e.items.filter(e=>!n.has(e.sessionId)).length),Se(e.hasMore),ve(!0),ge(!1)},()=>{t||(ve(!0),ge(!1))})},250);return()=>{t=!0,clearTimeout(n)}},[P]);let Qe=()=>{fe(!1),pe(``)},$e=(e,t)=>{let n={sessionId:e.sessionId,title:t,...e.title===void 0?{preview:e.snippet}:{},updatedAt:0,running:!1,blank:!1};if(e.kind===`message`&&e.seq!==void 0){l===void 0?a(n):l(n,e.seq,P.trim(),e.messageId,e.partId);return}j(e.sessionId,P.trim()).then(e=>{let t=e.items[0];t!==void 0&&l!==void 0?l(n,t.seq,P.trim(),t.messageId,t.partId):a(n)},()=>{a(n)})};return(0,G.jsxs)(`div`,{className:`mobile`,children:[(0,G.jsxs)(`header`,{className:`mobile-header`,children:[(0,G.jsx)(`div`,{className:`mobile-headerSlot`,children:de?(0,G.jsx)(`button`,{type:`button`,className:`mobile-back`,"aria-label":`返回`,onClick:Qe,children:`‹`}):(0,G.jsx)(`button`,{type:`button`,className:`mobile-back`,"aria-label":`返回`,onClick:i,children:`‹`})}),de?(0,G.jsx)(`div`,{className:`mobile-headerSearch`,children:(0,G.jsx)(`input`,{type:`search`,className:`mobile-headerSearchInput`,placeholder:`搜索当前工作区或全部会话…`,"aria-label":`搜索会话`,autoFocus:!0,value:P,onChange:e=>{pe(e.target.value)}})}):(0,G.jsxs)(`div`,{className:`mobile-titleWrap`,children:[(0,G.jsx)(`h1`,{className:`mobile-title mobile-titleInline`,children:e.title}),(0,G.jsx)(`p`,{className:`mobile-titlePath`,children:e.path})]}),(0,G.jsx)(`div`,{className:`mobile-headerSlot mobile-headerSlot-right`,children:de?(0,G.jsx)(`button`,{type:`button`,className:`mobile-iconbtn`,"aria-label":`取消搜索`,onClick:Qe,children:(0,G.jsx)(La,{})}):(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(`button`,{type:`button`,className:`mobile-iconbtn`,"aria-label":`搜索会话`,onClick:()=>{fe(!0)},children:(0,G.jsx)(ua,{})}),(0,G.jsx)(xo,{})]})})]}),b!==void 0&&(0,G.jsx)(`p`,{className:`mobile-error mobile-pad`,children:b}),(0,G.jsxs)(`div`,{className:`mobile-create`,children:[te.length>0&&(0,G.jsxs)(`div`,{className:`mobile-presetCard`,children:[(0,G.jsx)(`button`,{type:`button`,className:`mobile-presetTrigger`,"aria-label":`Agent 模式`,disabled:D===void 0,onClick:()=>{Ye(!0)},children:(0,G.jsxs)(`span`,{className:`mobile-presetTriggerCopy`,children:[(0,G.jsxs)(`span`,{className:`mobile-presetTriggerTitle`,children:[Ge?.name??D??`无可用 Agent 模式`,Ge?.isDefault===!0?`（默认）`:``]}),Ge?.description!==void 0&&(0,G.jsx)(`span`,{className:`mobile-presetTriggerDesc`,children:Ge.description})]})}),(0,G.jsx)(`span`,{className:`mobile-presetCaret`,"aria-hidden":!0,children:`▾`}),(0,G.jsx)(`button`,{type:`button`,className:`mobile-presetHelp`,"aria-label":`模式说明`,disabled:Xe===void 0,onClick:()=>{qe(!0)},children:(0,G.jsx)(wa,{})})]}),(0,G.jsx)(`button`,{type:`button`,className:`mobile-new`,disabled:C||ne,onClick:()=>{Be()},children:C?`创建中…`:`+ 新建会话`})]}),T!==void 0&&(0,G.jsxs)(`p`,{className:`mobile-error mobile-pad`,children:[T,We!==void 0&&(0,G.jsx)(`span`,{className:`mobile-hint`,children:We})]}),(0,G.jsxs)(`ul`,{className:`mobile-list`,children:[_&&f.length===0&&(0,G.jsx)(`div`,{"aria-hidden":`true`,role:`presentation`,children:[0,1,2].map(e=>(0,G.jsxs)(`div`,{className:`skel-row`,children:[(0,G.jsx)(`span`,{className:`skel skel-icon`}),(0,G.jsxs)(`div`,{className:`skel-lines`,children:[(0,G.jsx)(`div`,{className:`skel skel-line-title`}),(0,G.jsx)(`div`,{className:`skel skel-line-sub`})]}),(0,G.jsx)(`span`,{})]},e))}),(()=>{let e=0,t=Ze.reduce((e,t)=>e+t.rows.length,0);return Ze.map(n=>(0,G.jsxs)(`li`,{style:{listStyle:`none`},children:[(0,G.jsx)(`div`,{className:`mobile-groupTitle`,children:n.bucket}),n.rows.map(n=>{let r=F.find(e=>e.sessionId===n.sessionId&&(e.kind===`message`||e.kind===`title`)),i=n.preview??iu.get(n.sessionId)??(n.turns===void 0?void 0:`${n.turns} 轮对话`),a=e>=t-12||t<20?void 0:{contentVisibility:`auto`,containIntrinsicSize:`auto 72px`};e+=1;let o=Pe===n.sessionId;return(0,G.jsxs)(`div`,{className:`mobile-row-swipe`,style:a,children:[(0,G.jsx)(`button`,{type:`button`,className:`mobile-row-swipe-action`,"aria-label":`删除会话`,onClick:()=>{Fe(void 0),ke(n)},children:`删除`}),(0,G.jsx)(`div`,{className:`mobile-row-swipe-inner`+(o?` swiped`:``),children:(0,G.jsxs)(`button`,{type:`button`,className:`mobile-row`,...He(n,r),children:[(0,G.jsx)(`span`,{className:`card-icon`,children:n.running?(0,G.jsx)(`span`,{className:`sess-dot sess-dot-running`,role:`img`,"aria-label":`进行中`}):(0,G.jsx)(`span`,{className:`sess-check`,"aria-hidden":!0,children:(0,G.jsx)(Fa,{})})}),(0,G.jsxs)(`span`,{className:`card-main`,children:[(0,G.jsxs)(`span`,{className:`sess-titleline`,children:[(0,G.jsx)(`span`,{className:`sess-title`,children:n.title}),n.blank&&(0,G.jsx)(`span`,{className:`sess-status`,children:`新`}),n.running&&(0,G.jsx)(`span`,{className:`sess-status`,children:`进行中`}),n.error!==void 0&&(0,G.jsx)(`span`,{className:`sess-status`,title:n.error,children:`出错`}),(0,G.jsx)(`span`,{className:`sess-sep`,"aria-hidden":!0,children:`·`}),(0,G.jsx)(`span`,{className:`sess-time`,children:Wd(n.updatedAt)})]}),i!==void 0&&(0,G.jsx)(`span`,{className:`card-desc`,children:i})]}),(0,G.jsx)(`span`,{className:`card-action`,children:(0,G.jsx)(`span`,{className:`mobile-chevron`,"aria-hidden":!0,children:`›`})})]})})]},n.sessionId)})]},n.bucket))})(),!_&&he&&(0,G.jsx)(`li`,{style:{listStyle:`none`},children:(0,G.jsx)(`p`,{className:`mobile-muted mobile-pad`,role:`status`,children:`正在搜索全部会话…`})}),!_&&P.trim()!==``&&!he&&F.some(e=>!f.some(t=>t.sessionId===e.sessionId))&&(0,G.jsxs)(`li`,{style:{listStyle:`none`},children:[(0,G.jsx)(`div`,{className:`mobile-groupTitle`,children:`搜索结果（未加载的会话）`}),F.filter(e=>!f.some(t=>t.sessionId===e.sessionId)).map(e=>{let t=(e.title??e.snippet.trim().slice(0,24))||`匹配会话`;return(0,G.jsx)(`li`,{style:{listStyle:`none`},children:(0,G.jsxs)(`button`,{type:`button`,className:`mobile-row`,onClick:()=>{$e(e,t)},children:[(0,G.jsx)(`span`,{className:`card-icon`,children:(0,G.jsx)(`span`,{className:`sess-check`,"aria-hidden":!0,children:(0,G.jsx)(Fa,{})})}),(0,G.jsxs)(`span`,{className:`card-main`,children:[(0,G.jsxs)(`span`,{className:`sess-titleline`,children:[(0,G.jsx)(`span`,{className:`sess-title`,children:t}),(0,G.jsx)(`span`,{className:`sess-sep`,"aria-hidden":!0,children:`·`}),(0,G.jsx)(`span`,{className:`sess-time`,children:`命中内容`})]}),(0,G.jsx)(`span`,{className:`card-desc`,children:e.snippet})]}),(0,G.jsx)(`span`,{className:`card-action`,children:(0,G.jsx)(`span`,{className:`mobile-chevron`,"aria-hidden":!0,children:`›`})})]})},`${e.kind}:${e.sessionId}`)})]}),!_&&P.trim()!==``&&!he&&ye>0&&(0,G.jsx)(`li`,{style:{listStyle:`none`},children:(0,G.jsxs)(`p`,{className:`search-hitsNote mobile-pad`,children:[`另有 `,ye,` 个其他工作区的命中未在此显示，首页搜索可查全部`]})}),!_&&P.trim()!==``&&!he&&xe&&(0,G.jsx)(`li`,{style:{listStyle:`none`},children:(0,G.jsx)(`p`,{className:`search-hitsNote mobile-pad`,children:`结果较多，仅显示前若干条——请细化关键词`})}),!_&&P.trim()!==``&&!he&&_e&&Ze.length===0&&F.length===0&&(0,G.jsxs)(`div`,{className:`mobile-empty`,children:[(0,G.jsx)(`div`,{className:`empty-icon`,children:(0,G.jsx)(ua,{})}),(0,G.jsx)(`p`,{className:`empty-title`,children:`未找到匹配会话`}),(0,G.jsx)(`p`,{className:`empty-desc`,children:`已搜索全部会话的标题与内容`})]}),h&&(0,G.jsx)(`li`,{style:{listStyle:`none`},children:(0,G.jsxs)(`div`,{className:`mobile-pad`,children:[(0,G.jsx)(`div`,{ref:e=>{ue.current=e??void 0},"aria-hidden":`true`}),(0,G.jsx)(`button`,{type:`button`,className:`mobile-button mobile-block`,disabled:_,onClick:()=>{ze(!0)},children:_?`加载中…`:`加载更多会话`})]})}),!h&&f.length===0&&!_&&(0,G.jsxs)(`div`,{className:`mobile-empty`,children:[(0,G.jsx)(`div`,{className:`empty-icon`,children:(0,G.jsx)(ga,{})}),(0,G.jsx)(`p`,{className:`empty-title`,children:`还没有会话`}),(0,G.jsx)(`p`,{className:`empty-desc`,children:`点上方按钮新建一个，开始这个项目的第一段对话`})]})]}),Je&&(0,G.jsx)(la,{title:`选择 Agent 模式`,onClose:()=>{Ye(!1)},children:te.map((e,t)=>(0,G.jsxs)(`div`,{children:[t>0&&(0,G.jsx)(`div`,{className:`sheet-option-divider`,"aria-hidden":!0}),(0,G.jsxs)(`button`,{type:`button`,className:`sheet-option${e.id===D?` sheet-option-selected`:``}`,disabled:e.broken!==void 0,onClick:()=>{O(e.id),Ye(!1)},children:[(0,G.jsxs)(`span`,{className:`sheet-option-copy`,children:[(0,G.jsxs)(`span`,{className:`sheet-option-title`,children:[e.name??e.id,e.isDefault?`（默认）`:``,e.trust===`user`?`（本地）`:``,e.broken===void 0?``:`（不可用）`]}),e.description!==void 0&&(0,G.jsx)(`span`,{className:`sheet-option-desc`,children:e.description})]}),e.id===D&&(0,G.jsx)(`span`,{className:`sheet-option-check`,"aria-hidden":!0,children:(0,G.jsx)(Fa,{})})]})]},e.id))}),Ke&&(0,G.jsx)(la,{title:`Agent 模式说明`,onClose:()=>{qe(!1)},children:(0,G.jsxs)(`p`,{className:`sheet-confirm-desc`,children:[Ge?.name??D,Xe===void 0?``:`：`+Xe]})}),z!==void 0&&(0,G.jsx)(la,{title:z.title,onClose:()=>{B(void 0)},children:(0,G.jsxs)(`div`,{role:`menu`,"aria-label":`会话操作`,children:[(0,G.jsx)(`div`,{className:`sheet-option-divider`,"aria-hidden":!0}),(0,G.jsx)(`button`,{type:`button`,role:`menuitem`,className:`sheet-option`,onClick:()=>{Le(z.sessionId),B(void 0)},children:(0,G.jsx)(`span`,{className:`sheet-option-copy`,children:(0,G.jsx)(`span`,{className:`sheet-option-title`,children:Me.has(z.sessionId)?`取消置顶`:`置顶`})})}),(0,G.jsx)(`button`,{type:`button`,role:`menuitem`,className:`sheet-option`,onClick:()=>{B(void 0),ke(z)},children:(0,G.jsx)(`span`,{className:`sheet-option-copy`,children:(0,G.jsx)(`span`,{className:`sheet-option-title`,style:{color:`var(--danger)`},children:`删除会话`})})})]})}),V!==void 0&&(0,G.jsx)(rc,{title:`删除会话`,body:(0,G.jsxs)(G.Fragment,{children:[`确定删除「`,V.title,`」吗？该会话将从所有设备消失（电脑上的会话记录保留，可从桌面找回）。`]}),confirmLabel:`删除`,tone:`danger`,onCancel:()=>{ke(void 0)},onConfirm:()=>{Ue(V)}})]})}var fu=`1.6.0`;const pu=`dsh-palm.install-hint.v1`;function mu(){if(typeof navigator>`u`)return{userAgent:``};let e=navigator;return{userAgent:e.userAgent??``,standalone:e.standalone,maxTouchPoints:e.maxTouchPoints,displayModeStandalone:typeof window<`u`&&typeof window.matchMedia==`function`?window.matchMedia(`(display-mode: standalone)`).matches:void 0}}function hu(e=mu()){let{userAgent:t,maxTouchPoints:n=0}=e;return!(/iPhone|iPad|iPod/.test(t)||/Macintosh/.test(t)&&n>1)||/(CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo)/.test(t)?!1:e.standalone!==!0&&e.displayModeStandalone!==!0}function gu(){try{return localStorage.getItem(pu)===`1`}catch{return!1}}function _u(){try{localStorage.setItem(pu,`1`)}catch{}}function vu(){let[e,t]=(0,c.useState)(gu);return e||!hu()?null:(0,G.jsxs)(`li`,{className:`settings-note settings-installHint`,children:[(0,G.jsx)(`span`,{children:`装到主屏才是全屏 App（也能收推送）：Safari 底部「分享」→「添加到主屏幕」。`}),(0,G.jsx)(`button`,{type:`button`,className:`settings-installHint-btn`,onClick:()=>{_u(),t(!0)},children:`知道了`})]})}function yu(){if(!(typeof window>`u`))return window.__dshPalmPerf}function bu(e){return typeof e.marks==`number`?e.marks:Array.isArray(e.stamps)?e.stamps.length:0}async function xu(e){try{let t=navigator.clipboard;return t===void 0||typeof t.writeText!=`function`?!1:(await t.writeText(JSON.stringify(e)),!0)}catch{return!1}}function Su(){let e=((typeof window.prompt==`function`?window.prompt(`这是哪套环境？（如 android-lan / ios-lan / android-remote）`,`android-lan`):void 0)??``).trim();return e===``?`device`:e}function Cu(){let[e,t]=(0,c.useState)(!1),[n,r]=(0,c.useState)(void 0),i=Bt(),a=an();if(!a&&i.total===0)return null;let o=yu(),s=o?.stats(),l=s===void 0?0:bu(s),u=s?.frames?.sampled??0,d=n=>{if(e||o===void 0)return;let i=n?o.toJSON():o.stats();if(bu(i)===0&&!window.confirm(`还没有采到回合标记（marks=0），可能这一轮没跑过。仍然上报吗？`)){K(`已取消：先跑一轮再上报`);return}t(!0),O(i,Su()).then(e=>{t(!1),r(e.file),K(`已上报性能数据：${e.file}`)},()=>{xu(i).then(e=>{t(!1),K(e?`上报失败，已复制性能数据到剪贴板（粘给我即可）`:`上报失败，且复制失败`)},()=>{t(!1),K(`上报失败`)})})};return(0,G.jsxs)(`li`,{className:`settings-note settings-installHint`,children:[(0,G.jsxs)(`span`,{children:[a?`性能数据：已采集 ${l} 标记 · ${u} 帧`:`运行错误 ${i.total} 条`,a&&i.total>0?` · 运行错误 ${i.total} 条`:``,n===void 0?``:` · 已上报`]}),(0,G.jsxs)(`span`,{className:`settings-perfActions`,children:[a&&(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(`button`,{type:`button`,className:`settings-installHint-btn`,disabled:e||o===void 0,onClick:()=>{d(!1)},children:e?`上报中…`:`上报摘要`}),(0,G.jsx)(`button`,{type:`button`,className:`settings-installHint-btn`,disabled:e||o===void 0,onClick:()=>{d(!0)},children:`上报原始`})]}),i.total>0&&(0,G.jsx)(`button`,{type:`button`,className:`settings-installHint-btn`,onClick:()=>{xu(i).then(e=>{K(e?`运行错误已复制到剪贴板（粘给我即可）`:`复制失败`)},()=>{K(`复制失败`)})},children:`复制错误`})]})]})}function wu(){if(typeof document>`u`)return;let e=document.querySelector(`script[src*="mobile.js"]`)?.getAttribute(`src`)??``;return/[?&]v=([A-Za-z0-9_-]+)/.exec(e)?.[1]}const Tu=wu(),Eu=`dsh.mobile.market.registry.v1`;async function Du(e){let t=await fetch(e,{headers:{accept:`application/json`}});if(!t.ok){let e=``;try{let n=await t.json();typeof n.error==`string`&&(e=n.error)}catch{}throw Error(`HTTP ${t.status}${e===``?``:`：${e}`}`)}return await t.json()}async function Ou(e,t){let n=await fetch(e,{method:`POST`,headers:{accept:`application/json`,"content-type":`application/json`},body:JSON.stringify(t)});if(!n.ok){let e=``;try{let t=await n.json();typeof t.error==`string`&&(e=t.error)}catch{}throw Error(`HTTP ${n.status}${e===``?``:`：${e}`}`)}return await n.json()}function ku(){try{let e=localStorage.getItem(Eu);if(e===null)return;let t=JSON.parse(e);return Date.now()-t.at>36e5?void 0:t.payload}catch{return}}function Au(e){try{localStorage.setItem(Eu,JSON.stringify({at:Date.now(),payload:e}))}catch{}}function ju(e){return e.npm??e.name}function Mu({onBack:e}){let[t,n]=(0,c.useState)(()=>ku()),[r,i]=(0,c.useState)(void 0),[a,o]=(0,c.useState)(void 0),[s,l]=(0,c.useState)(void 0),[u,d]=(0,c.useState)(t===void 0),[f,p]=(0,c.useState)(``),[m,h]=(0,c.useState)(void 0);(0,c.useEffect)(()=>{let e=!1;return t===void 0&&Du(`/dsh-market/registry`).then(t=>{e||(n(t),Au(t),d(!1))},t=>{e||(o($(t)),d(!1))}),Du(`/dsh-market/installed`).then(t=>{e||i(t.installed)},()=>{}),()=>{e=!0}},[]);let g=(0,c.useMemo)(()=>{let e=t?.registry.plugins??[],n=f.trim().toLowerCase();return n===``?e:e.filter(e=>e.name.toLowerCase().includes(n)||e.owner.toLowerCase().includes(n)||(e.description?.zh??e.description?.en??``).toLowerCase().includes(n))},[t,f]),_=e=>{if(m!==void 0)return;let t=ju(e);r?.[t]===void 0&&window.confirm(`安装插件「${e.name}」？\n\n安装会修改插件配置；完成后新插件可能需要重启 DSH 才生效。`)&&(h(e.url),l(void 0),o(void 0),Ou(`/dsh-market/install`,{url:e.url}).then(()=>{h(void 0),l(`「${e.name}」安装完成。新插件可能需要重启 DSH 后生效。`),Du(`/dsh-market/installed`).then(e=>{i(e.installed)},()=>{})},e=>{h(void 0),o($(e))}))};return(0,G.jsxs)(`div`,{className:`mobile`,children:[(0,G.jsxs)(`header`,{className:`mobile-header`,children:[(0,G.jsx)(`button`,{type:`button`,className:`mobile-back`,"aria-label":`返回`,onClick:e,children:`‹`}),(0,G.jsx)(`h1`,{className:`mobile-title mobile-titleInline`,children:`插件市场`})]}),(0,G.jsxs)(`div`,{className:`mobile-scroll`,children:[a!==void 0&&(0,G.jsx)(`p`,{className:`mobile-error mobile-pad`,role:`alert`,children:a}),s!==void 0&&(0,G.jsx)(`p`,{className:`mobile-pad settings-saved`,role:`status`,children:s}),(0,G.jsx)(`div`,{className:`mobile-pad`,children:(0,G.jsx)(`input`,{type:`search`,className:`settings-input`,placeholder:`搜索插件…`,value:f,onChange:e=>{p(e.target.value)}})}),u&&(0,G.jsx)(`p`,{className:`mobile-muted mobile-pad`,children:`正在加载插件目录…`}),!u&&t!==void 0&&(0,G.jsxs)(`ul`,{className:`settings-group`,children:[(0,G.jsxs)(`li`,{className:`settings-groupTitle`,children:[`共 `,t.registry.count,` 个插件`,f===``?``:`，匹配 ${g.length} 个`]}),g.slice(0,300).map(e=>{let t=ju(e),n=r?.[t]!==void 0,i=m===e.url;return(0,G.jsxs)(`li`,{className:`settings-row market-row`,children:[(0,G.jsxs)(`div`,{className:`market-rowMain`,children:[(0,G.jsxs)(`span`,{className:`market-rowTitle`,children:[e.name,n&&(0,G.jsx)(`span`,{className:`market-badge`,children:`已安装`})]}),(0,G.jsx)(`span`,{className:`market-rowDesc`,children:e.description?.zh??e.description?.en??e.owner})]}),(0,G.jsx)(`button`,{type:`button`,className:`market-install`,disabled:i||n||m!==void 0,onClick:()=>{_(e)},children:i?`安装中…`:n?`已安装`:`安装`})]},e.url)}),g.length>300&&(0,G.jsx)(`li`,{className:`settings-note`,children:`仅显示前 300 个插件，请用搜索缩小范围`}),g.length===0&&(0,G.jsx)(`li`,{className:`settings-note`,children:`没有匹配的插件。`})]})]})]})}const Nu={"ui-theme":{preference:{title:`主题偏好`,desc:`深色 / 浅色 / 跟随系统`,scope:`sync`}},"ui-conversation":{busyEnter:{title:`忙碌时回车发送`,desc:`模型生成中按回车直接发送下一条消息`,scope:`sync`}},"ui-onboarding":{completed:{title:`引导完成状态`,desc:`首次使用引导是否已完成`,scope:`desktop`}},locale:{preference:{title:`界面语言`,desc:`桌面端界面语言`,scope:`desktop`}},"agent-presets":{default:{title:`默认预设`,desc:`新会话使用的 Agent 预设`,scope:`sync`}},"subagent-model":{provider:{title:`子代理提供方`,desc:`子代理使用的模型提供方`,scope:`sync`},model:{title:`子代理模型`,desc:`子代理使用的模型`,scope:`sync`}},"agent-default-model":{provider:{title:`模型提供方`,desc:`新会话默认的模型提供方`,scope:`sync`},model:{title:`模型`,desc:`新会话默认的模型`,scope:`sync`},reasoningEffort:{title:`推理档位`,desc:`默认的推理强度`,scope:`sync`}},"llm-pi-ai":{providers:{title:`模型提供方`,desc:`已配置的提供方与模型目录`,scope:`desktop`},apiKeys:{title:`API Key`,desc:`各提供方的密钥（不显示）`,scope:`desktop`}},"llm-deepseek":{baseURL:{title:`接口地址`,desc:`DeepSeek API 地址`,scope:`desktop`},apiKey:{title:`API Key`,desc:`DeepSeek 密钥（不显示）`,scope:`desktop`}},"free-search":{engine:{title:`搜索服务`,desc:`免费搜索使用的引擎`,scope:`desktop`}},"web-search-deepseek":{enabled:{title:`联网搜索`,desc:`是否启用 DeepSeek 联网搜索`,scope:`desktop`}},mnemon:{provider:{title:`记忆提供方`,desc:`记忆空间使用的提供方`,scope:`desktop`}},"mnemon-ui":{enabled:{title:`记忆界面`,desc:`是否启用记忆界面`,scope:`desktop`}},"at-file":{enabled:{title:`启用 @文件`,desc:`在输入框支持 @ 引用文件`,scope:`sync`}},"tool-see-image":{enabled:{title:`看图工具`,desc:`是否启用图片查看工具`,scope:`desktop`}},"agent-loop":{maxParallelToolCalls:{title:`最大并行工具调用`,desc:`单轮最多同时执行的工具数`,scope:`sync`}},shell:{defaultShell:{title:`默认 Shell`,desc:`命令执行的默认 Shell`,scope:`desktop`}},permission:{allowlist:{title:`命令白名单`,desc:`允许执行的命令列表`,scope:`desktop`}},"dsh-market":{allowRestart:{title:`允许重启`,desc:`安装插件后允许自动重启`,scope:`sync`}},"dsh-better-sidebar":{openByDefault:{title:`默认展开侧边栏`,desc:`启动时侧边栏是否默认展开`,scope:`sync`},defaultWidthPercent:{title:`默认宽度`,desc:`侧边栏默认宽度（百分比）`,scope:`sync`},autoOpenSubagent:{title:`自动展开子代理`,desc:`子代理运行时自动展开其行`,scope:`sync`},autoOpenJobs:{title:`自动展开任务`,desc:`有后台任务时自动展开任务区`,scope:`sync`},agentTerminalTools:{title:`终端工具按钮`,desc:`agent 行显示终端工具入口`,scope:`sync`},bottomPanelAutoTerminal:{title:`自动打开终端面板`,desc:`底部面板自动切到终端`,scope:`sync`},editorExplorer:{title:`编辑器文件树`,desc:`编辑器侧显示文件树`,scope:`sync`},tabsEnabled:{title:`启用标签页`,desc:`编辑器标签页功能`,scope:`sync`},viewersEnabled:{title:`启用查看器`,desc:`内嵌文档/图查看器`,scope:`sync`},terminalFontSize:{title:`终端字号`,desc:`终端显示字号`,scope:`sync`}},"dsh-palm":{enabled:{title:`远程访问`,desc:`是否启用远程访问入口`,scope:`desktop`}}};function Pu(e,t){return Nu[e]?.[t]}const Fu={"ui-theme":`外观`,locale:`语言`,"ui-conversation":`对话`,"agent-presets":`Agent 预设`,"subagent-model":`子代理模型`,"agent-default-model":`默认模型`,"at-file":`@文件`,"agent-loop":`Agent 循环`,"dsh-market":`插件市场`,"dsh-better-sidebar":`侧边栏`,"llm-deepseek":`DeepSeek 模型`,"llm-pi-ai":`模型提供方`,"free-search":`搜索`,"tool-see-image":`看图工具`,"web-search-deepseek":`联网搜索`,shell:`Shell`,permission:`权限`,"dsh-palm":`远程访问`,mnemon:`记忆`,"mnemon-ui":`记忆界面`,"ui-onboarding":`引导`},Iu={"ui-theme":[`preference`],"ui-conversation":[`busyEnter`],"agent-presets":[`default`],"subagent-model":[`model`,`provider`],"agent-default-model":[`model`,`provider`,`reasoningEffort`],"at-file":[`enabled`],"agent-loop":[`maxParallelToolCalls`],"dsh-market":[`allowRestart`],"dsh-better-sidebar":[`*`]};function Lu(e,t){let n=Iu[e];return n===void 0?!1:n.includes(`*`)||n.includes(t)}function Ru(e){return Fu[e]??e}function zu(e,t){let n=e.find(e=>e.ns===`llm-pi-ai`)?.value,r=Object.keys(n?.providers??{}),i={};for(let e of r)i[e]=[...new Set((n?.providers?.[e]?.models??[]).map(e=>e.id??e.name??``).filter(Boolean))];return{"agent-default-model":{provider:r,model:i},"subagent-model":{provider:r,model:i},"agent-presets":{default:t.map(e=>e.id)}}}function Bu(e,t){return e.refs[String(t)]??{type:`unknown`}}function Vu(e,t){let n=[];for(let r of t.list??[]){let t=Bu(e,r);t.type===`const`&&n.push({value:t.value,label:String(t.value)})}return n}function Hu(e,t){let n=t.list??[];return n.length>0&&n.every(t=>Bu(e,t).type===`const`)}function Uu({ns:e,field:t,node:n,value:r,options:i,ownerHint:a,onChange:o}){let s=Lu(e,t),c=Pu(e,t),l=c?.title??t,u=c?.desc??n.meta?.description,d=(()=>{if(n.type===`boolean`)return(0,G.jsx)(`button`,{type:`button`,role:`switch`,"aria-label":l,"aria-checked":r===!0,disabled:!s,className:`settings-switch${r===!0?` settings-switch-on`:``}`,onClick:()=>{o(r!==!0)}});if(n.type===`number`)return(0,G.jsx)(`input`,{type:`number`,"aria-label":l,value:typeof r==`number`?String(r):``,disabled:!s,className:`settings-input`,onChange:e=>{let t=e.target.value;if(t===``)return;let n=Number(t);o(Number.isFinite(n)?n:r)}});if(n.type===`string`){let e=i!==void 0&&i.length>0;return(0,G.jsxs)(G.Fragment,{children:[e&&(0,G.jsx)(`div`,{className:`settings-optionStrip`,role:`listbox`,"aria-label":`${l} 选项`,children:i.map(e=>(0,G.jsx)(`button`,{type:`button`,role:`option`,"aria-selected":r===e,className:`settings-optionChip${r===e?` settings-optionChip-on`:``}`,onClick:()=>{o(e)},children:e},e))}),a!==void 0&&(0,G.jsxs)(`p`,{className:`settings-ownerHint`,children:[`来自 `,a]}),(0,G.jsx)(`input`,{type:`text`,"aria-label":l,value:typeof r==`string`?r:``,disabled:!s,placeholder:e?`或输入自定义值…`:void 0,className:`settings-input`,onChange:e=>{o(e.target.value)}})]})}if(n.type===`array`){let e=Array.isArray(r)?r.map(e=>String(e)).join(`
`):``;return(0,G.jsx)(`textarea`,{"aria-label":l,value:e,disabled:!s,className:`settings-textarea`,rows:3,onChange:e=>{o(e.target.value.split(`
`).map(e=>e.trim()).filter(e=>e!==``))}})}return n.type===`secret`?(0,G.jsx)(`span`,{className:`settings-readonly`,children:r===!0?`已配置`:`未配置`}):(0,G.jsx)(`span`,{className:`settings-readonly`,children:JSON.stringify(r)})})();return(0,G.jsxs)(`div`,{className:`settings-field`,children:[(0,G.jsxs)(`div`,{className:`settings-fieldHead`,children:[(0,G.jsx)(`span`,{className:`settings-fieldLabel`,children:l}),!s&&(0,G.jsx)(`span`,{className:`settings-fieldLock`,children:`桌面端修改`})]}),u!==void 0&&(0,G.jsx)(`p`,{className:`settings-fieldDesc`,children:u}),d]})}function Wu({ns:e,envelope:t,node:n,value:r,fieldOptions:i,onChange:a}){let o=typeof r==`object`&&r&&!Array.isArray(r)?r:{},s=Object.entries(n.dict??{}),c=s.filter(([t])=>Lu(e,t)),l=s.filter(([t])=>!Lu(e,t));return(0,G.jsxs)(G.Fragment,{children:[c.map(([n,r])=>{let s=Bu(t,r),c=o[n];if(s.type===`object`)return(0,G.jsxs)(`div`,{className:`settings-subgroup`,children:[(0,G.jsx)(`span`,{className:`settings-subgroupTitle`,children:Pu(e,n)?.title??n}),(0,G.jsx)(Wu,{ns:e,envelope:t,node:s,value:c,fieldOptions:i,onChange:e=>{a({...o,[n]:e})}})]},n);if(s.type===`union`&&Hu(t,s)){let r=Vu(t,s);return(0,G.jsxs)(`div`,{className:`settings-field`,children:[(0,G.jsx)(`div`,{className:`settings-fieldHead`,children:(0,G.jsx)(`span`,{className:`settings-fieldLabel`,children:Pu(e,n)?.title??n})}),(0,G.jsx)(`div`,{className:`settings-themeOptions`,children:r.map(e=>(0,G.jsx)(`button`,{type:`button`,"aria-pressed":c===e.value,className:`settings-themeOption${c===e.value?` settings-themeOption-on`:``}`,onClick:()=>{a({...o,[n]:e.value})},children:e.label},String(e.value)))})]},n)}let l=i[n],u=typeof l==`object`&&l&&!Array.isArray(l)?l[String(o.provider)]??[]:Array.isArray(l)?l:[];return(0,G.jsx)(Uu,{ns:e,field:n,node:s,value:c,options:u,ownerHint:typeof l==`object`&&l&&!Array.isArray(l)?String(o.provider):void 0,onChange:e=>{a({...o,[n]:e})}},n)}),l.length>0&&(0,G.jsx)(Ku,{ns:e,envelope:t,entries:l,record:o})]})}function Gu(e){if(e===void 0)return`—`;if(typeof e==`boolean`)return e?`开`:`关`;if(typeof e==`string`)return e===``?`（空）`:e;if(typeof e==`number`||typeof e==`bigint`)return String(e);if(Array.isArray(e))return e.length===0?`（空）`:e.map(e=>String(e)).join(` · `);if(typeof e==`object`&&e){let t=JSON.stringify(e);return t!==void 0&&t.length>60?`${t.slice(0,57)}…`:t??`—`}return String(e)}function Ku({ns:e,envelope:t,entries:n,record:r}){let[i,a]=(0,c.useState)(!1);return(0,G.jsxs)(`div`,{className:`settings-roBlock`,children:[(0,G.jsxs)(`button`,{type:`button`,className:`settings-roSummary`,"aria-expanded":i,onClick:()=>{a(e=>!e)},children:[(0,G.jsxs)(`span`,{children:[`只读配置（`,n.length,` 项）`]}),(0,G.jsx)(`span`,{className:`settings-roToggle`,children:i?`收起 ▴`:`展开 ▾`})]}),i&&(0,G.jsx)(`div`,{className:`settings-roList`,children:n.map(([n,i])=>{let a=Bu(t,i),o=r[n],s=Pu(e,n)?.title??n,c=a.type===`secret`?o===!0?`已配置`:`未配置`:Gu(o);return(0,G.jsxs)(`div`,{className:`settings-roItem`,children:[(0,G.jsx)(`span`,{className:`settings-roKey`,children:s}),(0,G.jsx)(`span`,{className:`settings-roValue`,children:c})]},n)})})]})}function qu({namespaces:e,allNamespaces:t,onBack:n,onOpenMarket:r}){let[i,a]=(0,c.useState)(()=>{let t={};for(let n of e)t[n.ns]=n.value;return t}),[o,s]=(0,c.useState)(!1),[l,u]=(0,c.useState)(void 0),[d,f]=(0,c.useState)(!1),[p,m]=(0,c.useState)({});(0,c.useEffect)(()=>{let n=!1,r=r=>{if(n)return;let i=zu(t,r),a={};for(let t of e){let e=i[t.ns];e!==void 0&&Object.assign(a,e)}m(a)};return ie().then(e=>{r(e.presets)},()=>{r([])}),()=>{n=!0}},[e,t]),(0,c.useEffect)(()=>{let e=i[`ui-theme`]?.preference;(e===`light`||e===`dark`||e===`system`)&&Fr(e)},[i]);let h=()=>{if(d)return;let t=e.map(e=>({ns:e.ns,revision:e.revision,ops:Object.entries(i[e.ns]).filter(([t])=>Lu(e.ns,t)).map(([e,t])=>({op:`set`,path:[e],value:t}))})).filter(e=>e.ops.length>0);t.length!==0&&(f(!0),u(void 0),s(!1),Promise.all(t.map(e=>g(e.ns,e.ops,e.revision))).then(()=>{f(!1),s(!0)},e=>{f(!1),u($(e))}))},_=e.some(e=>e.ns===`dsh-market`),v=e.reduce((e,t)=>e+Object.keys(t.value??{}).filter(e=>Lu(t.ns,e)).length,0);return(0,G.jsxs)(`div`,{className:`mobile`,children:[(0,G.jsxs)(`header`,{className:`mobile-header`,children:[(0,G.jsx)(`button`,{type:`button`,className:`mobile-back`,"aria-label":`返回`,onClick:n,children:`‹`}),(0,G.jsx)(`h1`,{className:`mobile-title mobile-titleInline`,children:e.length===1?Ru(e[0].ns):`设置`})]}),(0,G.jsxs)(`div`,{className:`mobile-scroll`,children:[l!==void 0&&(0,G.jsx)(`p`,{className:`mobile-error mobile-pad`,role:`alert`,children:l}),o&&(0,G.jsx)(`p`,{className:`mobile-pad settings-saved`,role:`status`,children:`已保存`}),_&&r!==void 0&&(0,G.jsx)(`div`,{className:`mobile-pad`,children:(0,G.jsx)(`button`,{type:`button`,className:`mobile-button`,onClick:r,children:`打开插件市场`})}),e.map(e=>{let t=e.schema,n=Bu(t,t.uid),r=i[e.ns]??{},o=Object.keys(r).some(t=>Lu(e.ns,t)),s=Object.entries(n.dict??{}).filter(([t])=>!Lu(e.ns,t));return(0,G.jsxs)(`div`,{className:`settings-card`,children:[(0,G.jsxs)(`div`,{className:`settings-cardHead`,children:[(0,G.jsx)(`span`,{className:`settings-cardTitle`,children:Ru(e.ns)}),!o&&(0,G.jsx)(`span`,{className:`settings-fieldLock`,children:`只读`})]}),n.type===`object`&&o?(0,G.jsx)(Wu,{ns:e.ns,envelope:t,node:n,value:i[e.ns],fieldOptions:p,onChange:t=>{a(n=>({...n,[e.ns]:t}))}}):n.type===`object`&&s.length>0?(0,G.jsx)(Ku,{ns:e.ns,envelope:t,entries:s,record:r}):(0,G.jsx)(`span`,{className:`settings-readonly`,children:JSON.stringify(i[e.ns])})]},e.ns)}),v>0&&(0,G.jsx)(`div`,{className:`mobile-pad`,children:(0,G.jsx)(`button`,{type:`button`,className:`mobile-button`,disabled:d,onClick:h,children:d?`保存中…`:`保存`})})]})]})}function Ju({scope:e}){let t=e===`phone`?`本机`:e===`sync`?`同步桌面`:e===`desktop`?`桌面端`:e===`ro`?`只读`:`推荐`;return(0,G.jsx)(`span`,{className:`settings-badge settings-badge-${e}`,children:t})}function Yu({configured:e}){return(0,G.jsx)(`span`,{className:`settings-channelState${e?` settings-channelState-on`:``}`,children:e?`已配置 ✓（凭据存于电脑端）`:`未配置`})}function Xu(e,t){let n=Math.max(0,Math.round((t-e)/1e3));if(n<60)return`${String(n)} 秒前`;let r=Math.round(n/60);return r<60?`${String(r)} 分钟前`:`${String(Math.round(r/60))} 小时前`}function Zu(e){let t=new Date(e),n=t.toLocaleTimeString(`zh-CN`,{hour:`2-digit`,minute:`2-digit`,hour12:!1}),r=new Date;return t.getFullYear()===r.getFullYear()&&t.getMonth()===r.getMonth()&&t.getDate()===r.getDate()?n:`${String(t.getMonth()+1).padStart(2,`0`)}-${String(t.getDate()).padStart(2,`0`)} ${n}`}const Qu=[{id:`general`,title:`通用`,namespaces:[`ui-theme`,`locale`,`ui-conversation`,`ui-onboarding`]},{id:`models`,title:`模型`,namespaces:[`llm-pi-ai`,`llm-deepseek`,`subagent-model`,`agent-default-model`]},{id:`search`,title:`搜索`,namespaces:[`free-search`,`web-search-deepseek`]},{id:`memory`,title:`记忆`,namespaces:[`mnemon`,`mnemon-ui`]},{id:`tools`,title:`工具`,namespaces:[`at-file`,`tool-see-image`,`agent-loop`]},{id:`system`,title:`系统`,namespaces:[`shell`,`permission`]},{id:`plugins`,title:`插件`,namespaces:[`dsh-market`,`dsh-better-sidebar`]},{id:`remote`,title:`远程访问`,namespaces:[`dsh-palm`]},{id:`presets`,title:`Agent 预设`,namespaces:[`agent-presets`]}],$u=[{id:`notify-browser`,label:`浏览器通知（启用）`,group:`通知`,keywords:[`浏览器通知`,`通知权限`,`notify`,`enable`],open:`notify`},{id:`notify-kinds`,label:`通知内容（三类事件开关）`,group:`通知`,keywords:[`通知内容`,`规划完成`,`后台任务`,`长回复`],open:`notify`},{id:`notify-wxpusher`,label:`推送渠道 · WxPusher SPT`,group:`通知`,keywords:[`wxpusher`,`spt`,`微信推送`,`微信直达`],open:`notify`},{id:`notify-pushplus`,label:`推送渠道 · PushPlus（已降级）`,group:`通知`,keywords:[`pushplus`,`token`,`微信直达`,`已降级`],open:`notify`},{id:`notify-serverchan`,label:`推送渠道 · Server酱 SendKey`,group:`通知`,keywords:[`serverchan`,`sendkey`,`server酱`,`sct`],open:`notify`},{id:`notify-bark`,label:`推送渠道 · Bark Key`,group:`通知`,keywords:[`bark`,`bark key`,`ios 直达`],open:`notify`},{id:`notify-tg`,label:`推送渠道 · Telegram`,group:`通知`,keywords:[`telegram`,`bot token`,`chat id`,`tg`],open:`notify`},{id:`notify-webpush`,label:`Web Push（系统推送）`,group:`通知`,keywords:[`web push`,`系统推送`,`fcm`,`代理`],open:`notify`},{id:`notify-triggers`,label:`触发条件（阈值与间隔）`,group:`通知`,keywords:[`触发条件`,`阈值`,`间隔`,`cooldown`],open:`notify`},{id:`notify-privacy`,label:`隐私（锁屏隐藏详情）`,group:`通知`,keywords:[`隐私`,`锁屏隐藏`,`隐藏详情`],open:`notify`},{id:`voice-add`,label:`语音 · 添加/编辑转写服务`,group:`语音`,keywords:[`添加服务`,`语音服务`,`transcribe`,`转写`,`baseurl`],open:`voice`},{id:`voice-list`,label:`语音 · 服务列表管理`,group:`语音`,keywords:[`语音列表`,`排序`,`上移`,`下移`,`删除服务`],open:`voice`}];function ed({icon:e,title:t,desc:n,action:r,onClick:i,locateId:a,focused:o}){let s=(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(`span`,{className:`card-icon`,children:(0,G.jsx)(`span`,{"aria-hidden":!0,children:e})}),(0,G.jsxs)(`span`,{className:`card-main`,children:[(0,G.jsx)(`span`,{className:`card-title`,children:(0,G.jsx)(`span`,{className:`card-titleText`,children:t})}),n!==void 0&&(0,G.jsx)(`span`,{className:`card-desc`,children:n})]}),(0,G.jsx)(`span`,{className:`card-action`,children:r})]}),c=a===void 0?{}:{"data-locate-id":a},l=`settings-row`+(o===!0?` settings-focus`:``);return i===void 0?(0,G.jsx)(`li`,{className:l,...c,children:s}):(0,G.jsx)(`li`,{children:(0,G.jsx)(`button`,{type:`button`,className:l,onClick:i,...c,children:s})})}function td(){return(0,G.jsx)(`span`,{className:`mobile-chevron`,"aria-hidden":!0,children:`›`})}function nd({title:e,options:t,value:n,onPick:r,onClose:i}){return(0,G.jsx)(la,{title:e,onClose:i,children:(0,G.jsx)(`div`,{role:`listbox`,"aria-label":e,children:t.map(e=>(0,G.jsxs)(`button`,{type:`button`,role:`option`,"aria-selected":e.value===n,className:`sheet-option${e.value===n?` sheet-option-selected`:``}`,onClick:()=>{r(e.value),i()},children:[(0,G.jsx)(`span`,{className:`sheet-option-copy`,children:(0,G.jsx)(`span`,{className:`sheet-option-title`,children:e.label})}),e.value===n&&(0,G.jsx)(`span`,{className:`sheet-option-check`,"aria-hidden":!0,children:`✓`})]},e.value))})})}async function rd(){try{if(typeof caches<`u`){let e=await caches.keys();await Promise.all(e.map(e=>caches.delete(e)))}if(typeof navigator<`u`&&navigator.serviceWorker!==void 0){let e=await navigator.serviceWorker.getRegistrations();await Promise.all(e.map(e=>e.unregister()))}K(`缓存已清除`)}catch{K(`清除缓存失败`)}}function id({icon:e,title:t,desc:n,value:r,onChange:i}){return(0,G.jsx)(ed,{icon:e,title:t,desc:n,action:(0,G.jsx)(`button`,{type:`button`,role:`switch`,"aria-label":t,"aria-checked":r,className:`settings-switch${r?` settings-switch-on`:``}`,onClick:()=>{i(!r)}})})}function ad(e){let t=e.providers.filter(e=>e.status===`ok`);return t.length===0?`已配置 ${e.providers.length} 个提供方`:t.slice(0,3).map(e=>e.kind===`usage`&&e.usedPercent!==void 0?`${e.name} · 余量 ${Math.round((1-e.usedPercent)*100)}%`:e.summary===void 0?e.kind===`balance`&&e.balance!==void 0?`${e.name} · ${e.balance}`:e.name:`${e.name} · ${e.summary}`).join(` · `)}function od(e){if(e===void 0)return`窗口随请求持续滑动，无固定重置时刻`;let t=new Date(e),n=e=>String(e).padStart(2,`0`);return`重置于 ${n(t.getMonth()+1)}-${n(t.getDate())} ${n(t.getHours())}:${n(t.getMinutes())}`}function sd({provider:e}){if(e.status===`ok`){let t=e.kind===`usage`?e.plan??`可用`:`余额`;return(0,G.jsx)(`span`,{className:`usage-badge usage-badge-ok`,children:t})}return e.status===`no-key`?(0,G.jsx)(`span`,{className:`usage-badge usage-badge-no`,children:`未配置`}):e.status===`unsupported`?(0,G.jsx)(`span`,{className:`usage-badge usage-badge-na`,children:`不支持`}):(0,G.jsx)(`span`,{className:`usage-badge usage-badge-err`,children:`失败`})}function cd({provider:e}){let t=e.baseURL===void 0?void 0:(()=>{try{return new URL(e.baseURL).hostname}catch{return e.baseURL}})();return(0,G.jsxs)(`div`,{className:`usage-provider`,children:[(0,G.jsxs)(`div`,{className:`usage-providerHead`,children:[(0,G.jsxs)(`span`,{className:`usage-providerName`,children:[e.name,t!==void 0&&(0,G.jsx)(`span`,{className:`usage-providerBase`,children:t})]}),(0,G.jsx)(sd,{provider:e})]}),e.status===`ok`&&e.kind===`usage`&&e.usedPercent!==void 0&&(0,G.jsxs)(G.Fragment,{children:[e.sessionUsed!==void 0&&(0,G.jsxs)(`div`,{className:`usage-block`,children:[(0,G.jsxs)(`div`,{className:`usage-row`,children:[(0,G.jsx)(`span`,{className:`usage-rowLabel`,children:`近 5 小时`}),(0,G.jsxs)(`span`,{className:`usage-rowValue`,children:[(e.sessionUsed*100).toFixed(0),`%`]})]}),(0,G.jsx)(`div`,{className:`usage-meter`,children:(0,G.jsx)(`div`,{className:`usage-meterFill`,style:{width:`${(e.sessionUsed*100).toFixed(0)}%`}})}),(0,G.jsx)(`p`,{className:`usage-resetNote`,children:od(e.sessionResetsAt)})]}),(0,G.jsxs)(`div`,{className:`usage-block`,children:[(0,G.jsxs)(`div`,{className:`usage-row`,children:[(0,G.jsx)(`span`,{className:`usage-rowLabel`,children:`本周`}),(0,G.jsxs)(`span`,{className:`usage-rowValue`,children:[(e.usedPercent*100).toFixed(1),`% · 余 `,((1-e.usedPercent)*100).toFixed(1),`%`]})]}),(0,G.jsx)(`div`,{className:`usage-meter`,children:(0,G.jsx)(`div`,{className:`usage-meterFill`,style:{width:`${(e.usedPercent*100).toFixed(0)}%`}})}),(0,G.jsx)(`p`,{className:`usage-resetNote`,children:od(e.weeklyResetsAt)})]})]}),e.status===`ok`&&e.kind===`usage`&&e.summary!==void 0&&(0,G.jsxs)(`div`,{className:`usage-stats`,children:[(0,G.jsx)(`span`,{children:(0,G.jsx)(`b`,{children:e.summary})}),(0,G.jsx)(`span`,{})]}),e.status===`ok`&&e.kind===`balance`&&(0,G.jsxs)(`div`,{className:`usage-stats`,children:[(0,G.jsxs)(`span`,{children:[`账户余额 `,(0,G.jsx)(`b`,{children:e.balance??`—`})]}),(0,G.jsx)(`span`,{})]}),e.status===`no-key`&&(0,G.jsx)(`p`,{className:`settings-note`,children:`桌面端未配置 API Key，已按用量计费无法查询`}),e.status===`unsupported`&&(0,G.jsx)(`p`,{className:`settings-note`,children:`该提供方无公开余额/用量接口`}),e.status===`error`&&(0,G.jsx)(`p`,{className:`settings-note`,children:`用量查询失败，请稍后重试`}),e.models!==void 0&&e.models.length>0&&(0,G.jsx)(`div`,{className:`usage-models`,children:e.models.map(e=>(0,G.jsxs)(`div`,{className:`usage-model`,children:[(0,G.jsx)(`span`,{className:`usage-modelName`,children:e.name}),(0,G.jsxs)(`span`,{className:`usage-modelCount`,children:[e.requestCount.toLocaleString(),` 次`]})]},e.name))})]})}function ld({onBack:e}){let[t,n]=(0,c.useState)(void 0),[r,i]=(0,c.useState)(4),[a,o]=(0,c.useState)(void 0),[s,l]=(0,c.useState)(!1),[u,d]=(0,c.useState)(void 0),[f,p]=(0,c.useState)(void 0),m=()=>{l(!0),Ee().then(e=>{n(e.devices),i(e.maxDevices),o(void 0),l(!1)},e=>{o($(e)),l(!1)})};(0,c.useEffect)(()=>{m()},[]);let h=e=>{let t=u;d(void 0),t!==void 0&&Oe(t.id,e).then(()=>{m(),K(`已重命名`)},e=>{K($(e))})},g=e=>{R(e.id).then(()=>{m(),K(`已设为主设备`)},e=>{K($(e))})},_=()=>{let e=f;p(void 0),e!==void 0&&De(e.id).then(()=>{m(),K(`已移除该设备`)},e=>{K($(e))})},v=e=>e.name!==void 0&&e.name!==``?e.name:`未命名设备`;return(0,G.jsxs)(`div`,{className:`mobile`,children:[(0,G.jsxs)(`header`,{className:`mobile-header`,children:[(0,G.jsx)(`div`,{className:`mobile-headerSlot`,children:(0,G.jsx)(`button`,{type:`button`,className:`mobile-back`,"aria-label":`返回`,onClick:e,children:`‹`})}),(0,G.jsx)(`h1`,{className:`mobile-title`,children:`设备管理`}),(0,G.jsx)(`div`,{className:`mobile-headerSlot mobile-headerSlot-right`})]}),(0,G.jsxs)(`div`,{className:`mobile-scroll`,children:[(0,G.jsxs)(`p`,{className:`settings-note`,children:[`已配对 `,t?.length??0,` / `,r,` 台设备。主设备不会被自动移除；设备数满时，闲置设备会先被淘汰，在线设备不会被挤掉。`]}),a!==void 0&&(0,G.jsx)(`p`,{className:`mobile-error`,role:`alert`,children:a}),t===void 0&&a===void 0&&(0,G.jsx)(`p`,{className:`settings-note`,children:`加载中…`}),t!==void 0&&(0,G.jsxs)(`div`,{className:`settings-card`,children:[t.length===0&&(0,G.jsx)(`p`,{className:`settings-note`,children:`暂无已配对设备。`}),t.map(e=>(0,G.jsxs)(`div`,{className:`device-row`,children:[(0,G.jsxs)(`span`,{className:`device-copy`,children:[(0,G.jsxs)(`span`,{className:`device-name`,children:[v(e),e.primary===!0&&(0,G.jsx)(`span`,{className:`device-badge device-badge-primary`,children:`主设备`}),e.current===!0&&(0,G.jsx)(`span`,{className:`device-badge device-badge-current`,children:`本机`})]}),(0,G.jsxs)(`span`,{className:`device-desc`,children:[(0,G.jsx)(`span`,{className:`device-status${e.online?` device-status-on`:``}`,children:e.online?`在线`:`闲置`}),` · `,Zu(e.lastSeenAt),e.userAgent!==void 0&&(0,G.jsxs)(`span`,{className:`device-ua`,children:[` · `,e.userAgent.slice(0,40)]})]})]}),(0,G.jsxs)(`span`,{className:`device-actions`,children:[(0,G.jsx)(`button`,{type:`button`,className:`device-btn`,"aria-label":`重命名`,onClick:()=>{d(e)},children:(0,G.jsx)(Pa,{})}),e.primary!==!0&&(0,G.jsx)(`button`,{type:`button`,className:`device-btn`,"aria-label":`设为主设备`,disabled:s,onClick:()=>{g(e)},children:(0,G.jsx)(Ha,{})}),e.current!==!0&&(0,G.jsx)(`button`,{type:`button`,className:`device-btn device-btn-danger`,"aria-label":`移除设备`,disabled:s,onClick:()=>{p(e)},children:(0,G.jsx)(Ta,{})})]})]},e.id))]})]}),u!==void 0&&(0,G.jsx)(ic,{title:`重命名设备`,initial:u.name??``,confirmLabel:`保存`,onCancel:()=>{d(void 0)},onConfirm:h}),f!==void 0&&(0,G.jsx)(rc,{title:`移除设备？`,body:`移除「${v(f)}」后，该设备将无法再访问此电脑，需重新配对。`,confirmLabel:`移除`,tone:`danger`,onCancel:()=>{p(void 0)},onConfirm:_})]})}function ud({onBack:e}){let[t,n]=(0,c.useState)(void 0),[r,i]=(0,c.useState)(void 0),[a,o]=(0,c.useState)(void 0),[s,l]=(0,c.useState)(!1),u=(0,c.useSyncExternalStore)(Mr,Ar),[d,f]=(0,c.useState)(()=>Un()),[p,m]=(0,c.useState)(()=>Kn()),[_,v]=(0,c.useState)(()=>Yn()),[y,b]=(0,c.useState)(()=>Zn()),[w,T]=(0,c.useState)(()=>tr()),[E,O]=(0,c.useState)(null),[ne,k]=(0,c.useState)(!1),[re,A]=(0,c.useState)(()=>Js()),[j,ie]=(0,c.useState)(null),[ae,M]=(0,c.useState)(void 0),[N,oe]=(0,c.useState)(``),[se,ce]=(0,c.useState)(``),[le,ue]=(0,c.useState)(``),[de,fe]=(0,c.useState)(``),[P,me]=(0,c.useState)([]),[he,ge]=(0,c.useState)(!1),[_e,ve]=(0,c.useState)(!1),[ye,be]=(0,c.useState)(!1),[xe,Se]=(0,c.useState)(()=>or()),[I,L]=(0,c.useState)(void 0),[Ce,we]=(0,c.useState)(!1),[Te,Ee]=(0,c.useState)(``),[De,Oe]=(0,c.useState)(``),[R,z]=(0,c.useState)(``),[B,V]=(0,c.useState)(``),[ke,Ae]=(0,c.useState)(``),[je,Me]=(0,c.useState)(``),[Ne,Pe]=(0,c.useState)(void 0),[Fe,Ie]=(0,c.useState)(void 0),[Le,Re]=(0,c.useState)(!1),[ze,Be]=(0,c.useState)(!1),Ve=Fe===void 0?void 0:{...Fe,providers:Fe.providers.filter(e=>e.status!==`unsupported`)},[He,Ue]=(0,c.useState)(`30`),[We,Ge]=(0,c.useState)(`2`),[Ke,qe]=(0,c.useState)([]),[Je,Ye]=(0,c.useState)(!1),[Xe,Ze]=(0,c.useState)(!1),[Qe,$e]=(0,c.useState)({jobs:!1,todo:!0,turns:!1}),[et,tt]=(0,c.useState)(!1),[nt,rt]=(0,c.useState)(!1),[it,at]=(0,c.useState)(void 0),[ot,st]=(0,c.useState)(void 0),[ct,lt]=(0,c.useState)(!1);(0,c.useEffect)(()=>nc(()=>A(Js())),[]),(0,c.useEffect)(()=>{E===`about`&&Dt()},[E]),(0,c.useEffect)(()=>{let e=!1;return h().then(t=>{e||n(t.namespaces)},t=>{e||i($(t))}),()=>{e=!0}},[]),(0,c.useEffect)(()=>{let e=!1;return x().then(t=>{e||(L(t),Ue(String(Math.round(t.turnThresholdMs/1e3))),Ge(String(Math.round(t.turnCooldownMs/6e4))),Ze(t.hideDetails===!0),$e({jobs:t.kinds.jobs,todo:t.kinds.todo,turns:t.kinds.turns}))},()=>{}),()=>{e=!0}},[]),(0,c.useEffect)(()=>{if(!he)return;let e=!1;return Ye(!0),ee().then(t=>{e||(qe(t.items),Ye(!1))},()=>{e||(qe([]),Ye(!1))}),()=>{e=!0}},[he]),(0,c.useEffect)(()=>{let e=!1;return lr().then(t=>{e||Pe(t!==void 0)},()=>{e||Pe(!1)}),()=>{e=!0}},[]),(0,c.useEffect)(()=>{let e=!1;return F().then(t=>{e||Ie(t)},()=>{}),()=>{e=!0}},[]);let[ut,dt]=(0,c.useState)(``),ft=ut.trim().toLowerCase(),pt=(...e)=>ft===``||e.some(e=>e!==void 0&&e.toLowerCase().includes(ft)),[H,mt]=(0,c.useState)(void 0),ht=ft===``?[]:$u.filter(e=>e.label.toLowerCase().includes(ft)||e.keywords.some(e=>e.toLowerCase().includes(ft))),gt=e=>H===e?{"data-locate-id":e,"data-focus":``}:{"data-locate-id":e};(0,c.useEffect)(()=>{if(H===void 0)return;let e=requestAnimationFrame(()=>{document.querySelector(`[data-locate-id="${H}"]`)?.scrollIntoView({block:`center`})});return()=>cancelAnimationFrame(e)},[H,he,_e]);let _t=ar()?xe===`granted`?`已授权，任务完成时提醒`:xe===`denied`?`权限被拒绝，请在浏览器设置中开启`:`点击授权，任务完成时提醒`:`当前浏览器不支持通知`,vt=u===`dark`?`深色`:u===`light`?`浅色`:`跟随系统`,yt=async()=>{if(!ar()){K(`当前浏览器不支持通知`);return}if(xe===`granted`){mr(),K(`通知已开启`);return}if(xe===`denied`){K(`通知权限被拒绝，请在浏览器设置中开启`);return}we(!0);try{let e=await sr();Se(e),e===`granted`&&(mr(),K(`通知已开启`))}finally{we(!1)}},bt=async()=>{let e=Te.trim()+De.trim()+R.trim()+B.trim()+ke.trim()+je.trim(),t=I?.channels,n=t!==void 0&&(t.serverchan.configured||t.bark.configured||t.telegram.configured||t.wxpusher.configured||t.pushplus.configured);if(e===``&&n){tt(!0);return}await xt()},xt=async()=>{we(!0);try{await S({channels:{serverchan:{sendKey:Te.trim()},bark:{key:De.trim()},telegram:{botToken:R.trim(),chatId:B.trim()},wxpusher:{spt:ke.trim()},pushplus:{token:je.trim()}}});let e=await x();L(e),K(`渠道已保存`)}catch(e){K($(e))}finally{we(!1)}},St=async()=>{we(!0);try{await C(),K(`测试通知已发送`)}catch(e){K($(e))}finally{we(!1)}},Ct=async e=>{we(!0);try{if(e){if(!await ur()){K(`当前浏览器不支持 Web Push，或通知权限未开启`);return}K(`Web Push 已开启`)}else await dr(),K(`Web Push 已关闭`);Pe(e)}catch(t){K(e?`Web Push 注册失败：推送服务（FCM）在大陆网络不可直连。请开启代理后重试，或改用下方「推送渠道」接收通知（如 ServerChan 微信推送）。`:$(t))}finally{we(!1)}},wt=async e=>{we(!0);try{await S({hideDetails:e}),Ze(e),K(e?`通知详情已隐藏`:`通知详情已显示`)}catch(e){K($(e))}finally{we(!1)}},Tt=async(e,t)=>{we(!0);let n={...Qe,[e]:t};try{await S({kinds:n}),$e(n)}catch(e){K($(e))}finally{we(!1)}},Et=async()=>{rt(!0);try{let{latest:e,isNewer:t}=await te();at(t?`发现新版本 ${e} —— 可在桌面端 dsh 升级插件`:`已是最新版本（${fu}）`)}catch{at(`检查失败，请稍后重试`)}finally{rt(!1)}},Dt=async()=>{lt(!0);try{st(await D())}catch{st(void 0)}finally{lt(!1)}},Ot=async()=>{let e=Number(He),t=Number(We);if(!Number.isFinite(e)||e<0||!Number.isFinite(t)||t<0){K(`请输入有效的数值`);return}we(!0);try{await S({turnThresholdMs:Math.round(e*1e3),turnCooldownMs:Math.round(t*6e4)}),L(n=>n===void 0?n:{...n,turnThresholdMs:Math.round(e*1e3),turnCooldownMs:Math.round(t*6e4)}),K(`已保存`)}catch(e){K($(e))}finally{we(!1)}};if(s)return(0,G.jsx)(Mu,{onBack:()=>{l(!1)}});if(_e)return(0,G.jsxs)(`div`,{className:`mobile`,children:[(0,G.jsxs)(`header`,{className:`mobile-header`,children:[(0,G.jsx)(`div`,{className:`mobile-headerSlot`,children:(0,G.jsx)(`button`,{type:`button`,className:`mobile-back`,"aria-label":`返回`,onClick:()=>{ve(!1)},children:`‹`})}),(0,G.jsx)(`h1`,{className:`mobile-title`,children:`语音服务`}),(0,G.jsx)(`div`,{className:`mobile-headerSlot mobile-headerSlot-right`})]}),(0,G.jsxs)(`div`,{className:`mobile-scroll`,children:[(0,G.jsx)(`p`,{className:`settings-note`,children:`语音转写按列表顺序尝试，失败自动回退到下一个服务。`}),P.length>0&&(0,G.jsxs)(`p`,{className:`settings-hostNote`,children:[`✓ 桌面端已配置 `,P.length,` 个转写服务，手机语音输入将自动使用，无需重复配置。`]}),P.length>0&&(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(`div`,{className:`settings-subhead`,children:`桌面端配置（只读）`}),(0,G.jsx)(`div`,{className:`settings-card`,children:P.map(e=>(0,G.jsx)(`div`,{className:`voice-service-row`,children:(0,G.jsxs)(`span`,{className:`voice-service-copy`,children:[(0,G.jsxs)(`span`,{className:`voice-service-name`,children:[e.name,` `,(0,G.jsx)(`span`,{className:`settings-roTag`,children:`桌面端`})]}),(0,G.jsxs)(`span`,{className:`voice-service-desc`,children:[e.model,` · `,e.baseURL]})]})},e.name))})]}),(0,G.jsx)(`div`,{className:`settings-subhead`,children:`手机端服务`}),(0,G.jsxs)(`div`,{className:`settings-card`,...gt(`voice-list`),children:[re.length===0&&(0,G.jsx)(`p`,{className:`settings-note`,children:`尚未配置服务 — 点击下方「添加服务」。`}),re.map((e,t)=>(0,G.jsxs)(`div`,{className:`voice-service-row`,children:[(0,G.jsxs)(`span`,{className:`voice-service-copy`,children:[(0,G.jsx)(`span`,{className:`voice-service-name`,children:e.name===``?e.model:e.name}),(0,G.jsxs)(`span`,{className:`voice-service-desc`,children:[e.model,` · `,e.baseURL]})]}),(0,G.jsxs)(`span`,{className:`voice-service-actions`,children:[(0,G.jsx)(`button`,{type:`button`,className:`voice-service-btn`,"aria-label":`上移`,disabled:t===0,onClick:()=>{Zs(e.id)},children:(0,G.jsx)(va,{})}),(0,G.jsx)(`button`,{type:`button`,className:`voice-service-btn voice-service-btn-down`,"aria-label":`下移`,disabled:t===re.length-1,onClick:()=>{Qs(e.id)},children:(0,G.jsx)(va,{})}),(0,G.jsx)(`button`,{type:`button`,className:`voice-service-btn`,"aria-label":`编辑`,onClick:()=>{M(e),oe(e.name),ce(e.baseURL),ue(e.apiKey),fe(e.model),ie(`form`)},children:(0,G.jsx)(Pa,{})}),(0,G.jsx)(`button`,{type:`button`,className:`voice-service-btn voice-service-btn-danger`,"aria-label":`删除`,onClick:()=>{Xs(e.id)},children:(0,G.jsx)(Ta,{})})]})]},e.id))]}),(0,G.jsx)(`div`,{className:`sheet-confirm-actions`,...gt(`voice-add`),children:(0,G.jsxs)(`button`,{type:`button`,className:`mobile-button`,onClick:()=>{M(void 0),oe(``),ce(``),ue(``),fe(``),ie(`form`)},children:[(0,G.jsx)(_a,{}),` 添加服务`]})})]}),j===`form`&&(0,G.jsx)(la,{title:ae===void 0?`添加服务`:`编辑服务`,onClose:()=>{ie(null)},children:(0,G.jsxs)(`div`,{className:`voice-form`,children:[(0,G.jsxs)(`label`,{className:`voice-form-field`,children:[(0,G.jsx)(`span`,{className:`voice-form-label`,children:`名称`}),(0,G.jsx)(`input`,{className:`voice-form-input`,value:N,placeholder:`如：硅基流动`,onChange:e=>{oe(e.target.value)}})]}),(0,G.jsxs)(`label`,{className:`voice-form-field`,children:[(0,G.jsx)(`span`,{className:`voice-form-label`,children:`API 地址（baseURL）`}),(0,G.jsx)(`input`,{className:`voice-form-input`,value:se,placeholder:`https://api.siliconflow.cn/v1`,inputMode:`url`,autoCapitalize:`none`,autoCorrect:`off`,spellCheck:!1,onChange:e=>{ce(e.target.value)}})]}),(0,G.jsxs)(`label`,{className:`voice-form-field`,children:[(0,G.jsx)(`span`,{className:`voice-form-label`,children:`API Key`}),(0,G.jsx)(`input`,{className:`voice-form-input`,value:le,placeholder:`sk-…`,type:`password`,autoCapitalize:`none`,autoCorrect:`off`,spellCheck:!1,onChange:e=>{ue(e.target.value)}})]}),(0,G.jsxs)(`label`,{className:`voice-form-field`,children:[(0,G.jsx)(`span`,{className:`voice-form-label`,children:`模型`}),(0,G.jsx)(`input`,{className:`voice-form-input`,value:de,placeholder:`FunAudioLLM/SenseVoiceSmall`,autoCapitalize:`none`,autoCorrect:`off`,spellCheck:!1,onChange:e=>{fe(e.target.value)}})]}),(0,G.jsx)(`p`,{className:`sheet-note`,children:`支持任意 OpenAI 兼容的 /audio/transcriptions 服务。`}),(0,G.jsxs)(`div`,{className:`sheet-confirm-actions`,children:[(0,G.jsx)(`button`,{type:`button`,className:`mobile-button`,onClick:()=>{ie(null)},children:`取消`}),(0,G.jsx)(`button`,{type:`button`,className:`mobile-button mobile-button-primary`,disabled:se.trim()===``||le.trim()===``||de.trim()===``,onClick:()=>{Ys({id:ae?.id??(typeof crypto<`u`&&typeof crypto.randomUUID==`function`?crypto.randomUUID():`svc-${Date.now()}`),name:N.trim(),baseURL:se.trim(),apiKey:le.trim(),model:de.trim()}),ie(null)},children:`保存`})]})]})})]});if(he)return(0,G.jsxs)(`div`,{className:`mobile`,children:[(0,G.jsxs)(`header`,{className:`mobile-header`,children:[(0,G.jsx)(`div`,{className:`mobile-headerSlot`,children:(0,G.jsx)(`button`,{type:`button`,className:`mobile-back`,"aria-label":`返回`,onClick:()=>{ge(!1)},children:`‹`})}),(0,G.jsx)(`h1`,{className:`mobile-title`,children:`通知`}),(0,G.jsx)(`div`,{className:`mobile-headerSlot mobile-headerSlot-right`})]}),(0,G.jsxs)(`div`,{className:`mobile-scroll`,children:[(0,G.jsxs)(`div`,{className:`settings-card`,children:[(0,G.jsx)(`div`,{className:`settings-cardHead`,children:(0,G.jsx)(`span`,{className:`settings-cardTitle`,children:`该开哪个？`})}),(0,G.jsx)(`p`,{className:`settings-note`,children:`任务完成提醒有三条通道，从上到下生效范围越来越广：`}),(0,G.jsx)(`div`,{className:`settings-field`,children:(0,G.jsxs)(`p`,{className:`settings-fieldDesc`,children:[(0,G.jsx)(`b`,{children:`① 浏览器通知`}),`：页面打开时弹提醒。必开，无需配置。`,(0,G.jsx)(`br`,{}),(0,G.jsx)(`b`,{children:`② 推送渠道`}),`：页面关闭也能收，微信/iOS 直达、国内可靠。推荐任填一个（WxPusher 或 Server酱）。`,(0,G.jsx)(`br`,{}),(0,G.jsx)(`b`,{children:`③ Web Push`}),`：系统级推送，但服务（FCM）在大陆不可直连，需代理才可用。大陆用户可不开。`]})})]}),(0,G.jsxs)(`div`,{className:`settings-card`,children:[(0,G.jsx)(`div`,{className:`settings-cardHead`,children:(0,G.jsx)(`span`,{className:`settings-cardTitle`,children:`最近通知`})}),Je?(0,G.jsx)(`p`,{className:`settings-note`,children:`加载中…`}):Ke.length===0?(0,G.jsx)(`p`,{className:`settings-note`,children:`暂无通知——任务完成或长回复结束时，这里会留下记录可回看。`}):(0,G.jsx)(`div`,{className:`settings-inbox`,children:Ke.slice(0,20).map(e=>(0,G.jsxs)(`button`,{type:`button`,className:`settings-inboxRow`,disabled:e.workspaceId===void 0,onClick:()=>{let t=new URL(window.location.href);t.searchParams.set(`workspace`,e.workspaceId??``),t.searchParams.set(`session`,e.sessionId),window.location.href=`${t.pathname}${t.search}`},children:[(0,G.jsxs)(`span`,{className:`settings-inboxLine`,children:[(0,G.jsx)(`span`,{className:`settings-inboxKind settings-inboxKind-${e.kind}`,children:e.kind===`task-done`?`完成`:e.kind===`task-failed`?`失败`:e.kind===`todo-done`?`规划`:`回复`}),(0,G.jsx)(`span`,{className:`settings-inboxTitle`,children:e.title}),(0,G.jsx)(`span`,{className:`settings-inboxTime`,children:Zu(e.ts)})]}),(0,G.jsx)(`span`,{className:`card-desc`,children:e.body})]},e.id))})]}),(0,G.jsxs)(`div`,{className:`settings-card`,...gt(`notify-browser`),children:[(0,G.jsxs)(`div`,{className:`settings-cardHead`,children:[(0,G.jsx)(`span`,{className:`settings-cardTitle`,children:`浏览器通知`}),(0,G.jsx)(Ju,{scope:`sync`})]}),(0,G.jsxs)(`div`,{className:`settings-field`,children:[(0,G.jsx)(`div`,{className:`settings-fieldHead`,children:(0,G.jsx)(`span`,{className:`settings-fieldLabel`,children:`启用`})}),(0,G.jsx)(`button`,{type:`button`,role:`switch`,"aria-label":`浏览器通知`,"aria-checked":xe===`granted`,className:`settings-switch${xe===`granted`?` settings-switch-on`:``}`,disabled:Ce,onClick:()=>{yt()}}),(0,G.jsx)(`p`,{className:`settings-fieldDesc`,children:_t})]})]}),I!==void 0&&(0,G.jsxs)(`div`,{className:`settings-card`,...gt(`notify-kinds`),children:[(0,G.jsxs)(`div`,{className:`settings-cardHead`,children:[(0,G.jsx)(`span`,{className:`settings-cardTitle`,children:`通知内容`}),(0,G.jsx)(Ju,{scope:`sync`})]}),(0,G.jsxs)(`div`,{className:`settings-field`,children:[(0,G.jsx)(`div`,{className:`settings-fieldHead`,children:(0,G.jsx)(`span`,{className:`settings-fieldLabel`,children:`规划完成`})}),(0,G.jsx)(`button`,{type:`button`,role:`switch`,"aria-label":`规划完成`,"aria-checked":Qe.todo,className:`settings-switch${Qe.todo?` settings-switch-on`:``}`,disabled:Ce,onClick:()=>{Tt(`todo`,!Qe.todo)}}),(0,G.jsx)(`p`,{className:`settings-fieldDesc`,children:`任务规划全部完成时通知（推荐开启）`})]}),(0,G.jsxs)(`div`,{className:`settings-field`,children:[(0,G.jsx)(`div`,{className:`settings-fieldHead`,children:(0,G.jsx)(`span`,{className:`settings-fieldLabel`,children:`后台任务`})}),(0,G.jsx)(`button`,{type:`button`,role:`switch`,"aria-label":`后台任务`,"aria-checked":Qe.jobs,className:`settings-switch${Qe.jobs?` settings-switch-on`:``}`,disabled:Ce,onClick:()=>{Tt(`jobs`,!Qe.jobs)}}),(0,G.jsx)(`p`,{className:`settings-fieldDesc`,children:`每个命令 / 子任务完成或失败都会提醒，容易打扰（默认关闭）`})]}),(0,G.jsxs)(`div`,{className:`settings-field`,children:[(0,G.jsx)(`div`,{className:`settings-fieldHead`,children:(0,G.jsx)(`span`,{className:`settings-fieldLabel`,children:`长回复`})}),(0,G.jsx)(`button`,{type:`button`,role:`switch`,"aria-label":`长回复`,"aria-checked":Qe.turns,className:`settings-switch${Qe.turns?` settings-switch-on`:``}`,disabled:Ce,onClick:()=>{Tt(`turns`,!Qe.turns)}}),(0,G.jsx)(`p`,{className:`settings-fieldDesc`,children:`超过时长阈值的回复完成时提醒（默认关闭）`})]})]}),(0,G.jsxs)(`div`,{className:`settings-card`,...gt(`notify-wxpusher`),children:[(0,G.jsxs)(`div`,{className:`settings-cardHead`,children:[(0,G.jsx)(`span`,{className:`settings-cardTitle`,children:`推送渠道`}),(0,G.jsx)(Ju,{scope:`sync`})]}),(0,G.jsx)(`p`,{className:`settings-note`,children:`页面关闭时也能收到，通过第三方应用直达（微信 / iOS / Telegram）。国内网络可用，任选其一即可；留空保存将清除该渠道。`}),(0,G.jsxs)(`div`,{className:`settings-field`,children:[(0,G.jsxs)(`div`,{className:`settings-fieldHead`,children:[(0,G.jsx)(`span`,{className:`settings-fieldLabel`,children:`WxPusher SPT`}),(0,G.jsx)(Ju,{scope:`recommend`})]}),(0,G.jsx)(`input`,{type:`text`,className:`settings-input`,value:ke,placeholder:`SPT_…`,autoCapitalize:`none`,autoCorrect:`off`,spellCheck:!1,onChange:e=>{Ae(e.target.value)}}),(0,G.jsxs)(`p`,{className:`settings-fieldDesc`,children:[`微信直达 · 免费 · 国内直连。推荐首选。 `,(0,G.jsx)(Yu,{configured:I?.channels.wxpusher.configured===!0})]}),(0,G.jsxs)(`details`,{className:`settings-details`,children:[(0,G.jsx)(`summary`,{children:`如何获取 SPT（2 步）`}),(0,G.jsxs)(`div`,{className:`settings-detailsBody`,children:[`1. 打开 wxpusher.zjiecode.com/docs 的「极简推送 SPT」一节，手机微信扫码`,(0,G.jsx)(`br`,{}),`2. 复制 SPT_ 开头的令牌，粘贴到上方并保存`]})]})]}),(0,G.jsxs)(`div`,{className:`settings-field`,...gt(`notify-serverchan`),children:[(0,G.jsx)(`div`,{className:`settings-fieldHead`,children:(0,G.jsx)(`span`,{className:`settings-fieldLabel`,children:`Server酱 SendKey`})}),(0,G.jsx)(`input`,{type:`text`,className:`settings-input`,value:Te,placeholder:`SCT…`,autoCapitalize:`none`,autoCorrect:`off`,spellCheck:!1,onChange:e=>{Ee(e.target.value)}}),(0,G.jsxs)(`p`,{className:`settings-fieldDesc`,children:[`微信直达 · 国内直连（免费版每日条数有限）。 `,(0,G.jsx)(Yu,{configured:I?.channels.serverchan.configured===!0})]})]}),(0,G.jsxs)(`div`,{className:`settings-field`,...gt(`notify-bark`),children:[(0,G.jsx)(`div`,{className:`settings-fieldHead`,children:(0,G.jsx)(`span`,{className:`settings-fieldLabel`,children:`Bark Key`})}),(0,G.jsx)(`input`,{type:`text`,className:`settings-input`,value:De,placeholder:`…`,autoCapitalize:`none`,autoCorrect:`off`,spellCheck:!1,onChange:e=>{Oe(e.target.value)}}),(0,G.jsxs)(`p`,{className:`settings-fieldDesc`,children:[`iOS 直达：iPhone / iPad 装 Bark 应用后获取 Key。 `,(0,G.jsx)(Yu,{configured:I?.channels.bark.configured===!0})]})]}),(0,G.jsxs)(`div`,{className:`settings-field`,...gt(`notify-tg`),children:[(0,G.jsx)(`div`,{className:`settings-fieldHead`,children:(0,G.jsx)(`span`,{className:`settings-fieldLabel`,children:`Telegram Bot Token`})}),(0,G.jsx)(`input`,{type:`text`,className:`settings-input`,value:R,placeholder:`123456:ABC…`,autoCapitalize:`none`,autoCorrect:`off`,spellCheck:!1,onChange:e=>{z(e.target.value)}})]}),(0,G.jsxs)(`div`,{className:`settings-field`,children:[(0,G.jsx)(`div`,{className:`settings-fieldHead`,children:(0,G.jsx)(`span`,{className:`settings-fieldLabel`,children:`Telegram Chat ID`})}),(0,G.jsx)(`input`,{type:`text`,className:`settings-input`,value:B,placeholder:`…`,autoCapitalize:`none`,autoCorrect:`off`,spellCheck:!1,onChange:e=>{V(e.target.value)}}),(0,G.jsxs)(`p`,{className:`settings-fieldDesc`,children:[`Telegram 需要能访问境外网络。 `,(0,G.jsx)(Yu,{configured:I?.channels.telegram.configured===!0})]})]}),(0,G.jsxs)(`div`,{className:`settings-field`,...gt(`notify-pushplus`),children:[(0,G.jsx)(`div`,{className:`settings-fieldHead`,children:(0,G.jsx)(`span`,{className:`settings-fieldLabel`,children:`PushPlus Token（已降级）`})}),(0,G.jsx)(`input`,{type:`text`,className:`settings-input`,value:je,placeholder:`…（到 pushplus.plus 复制）`,autoCapitalize:`none`,autoCorrect:`off`,spellCheck:!1,onChange:e=>{Me(e.target.value)}}),(0,G.jsxs)(`p`,{className:`settings-fieldDesc`,children:[`微信直达 · 国内直连。pushplus 现已要求付费认证，故降级为兼容保留（旧 Token 仍可发）；新配置请用上方 WxPusher。 `,(0,G.jsx)(Yu,{configured:I?.channels.pushplus.configured===!0})]})]}),(0,G.jsxs)(`div`,{className:`sheet-confirm-actions`,children:[(0,G.jsx)(`button`,{type:`button`,className:`mobile-button`,disabled:Ce,onClick:()=>{St()},children:`发送测试`}),(0,G.jsx)(`button`,{type:`button`,className:`mobile-button mobile-button-primary`,"aria-label":`保存推送渠道`,disabled:Ce,onClick:()=>{bt()},children:`保存`})]})]}),cr()&&(0,G.jsxs)(`div`,{className:`settings-card`,...gt(`notify-webpush`),children:[(0,G.jsxs)(`div`,{className:`settings-cardHead`,children:[(0,G.jsx)(`span`,{className:`settings-cardTitle`,children:`Web Push`}),(0,G.jsx)(Ju,{scope:`sync`})]}),(0,G.jsxs)(`div`,{className:`settings-field`,children:[(0,G.jsx)(`div`,{className:`settings-fieldHead`,children:(0,G.jsx)(`span`,{className:`settings-fieldLabel`,children:`启用`})}),(0,G.jsx)(`button`,{type:`button`,role:`switch`,"aria-label":`Web Push`,"aria-checked":Ne===!0,className:`settings-switch${Ne===!0?` settings-switch-on`:``}`,disabled:Ce,onClick:()=>{Ct(Ne!==!0)}}),(0,G.jsx)(`p`,{className:`settings-fieldDesc`,children:`页面关闭时由浏览器系统推送。推送服务（FCM）在大陆网络不可直连，开启需要代理；大陆用户建议用上方「推送渠道」代替。`})]})]}),I!==void 0&&(0,G.jsxs)(`div`,{className:`settings-card`,...gt(`notify-triggers`),children:[(0,G.jsxs)(`div`,{className:`settings-cardHead`,children:[(0,G.jsx)(`span`,{className:`settings-cardTitle`,children:`触发条件（可选）`}),(0,G.jsx)(Ju,{scope:`sync`})]}),(0,G.jsx)(`p`,{className:`settings-note`,children:`默认：仅当回复耗时超过阈值时才提醒，避免被打断。`}),(0,G.jsxs)(`div`,{className:`settings-field`,children:[(0,G.jsx)(`div`,{className:`settings-fieldHead`,children:(0,G.jsx)(`span`,{className:`settings-fieldLabel`,children:`回复时长阈值（秒）`})}),(0,G.jsx)(`input`,{type:`number`,className:`settings-input`,"aria-label":`回复时长阈值`,value:He,onChange:e=>{Ue(e.target.value)}}),(0,G.jsx)(`p`,{className:`settings-fieldDesc`,children:`超过此时长的回复完成时通知`})]}),(0,G.jsxs)(`div`,{className:`settings-field`,children:[(0,G.jsx)(`div`,{className:`settings-fieldHead`,children:(0,G.jsx)(`span`,{className:`settings-fieldLabel`,children:`通知间隔（分钟）`})}),(0,G.jsx)(`input`,{type:`number`,className:`settings-input`,"aria-label":`通知间隔`,value:We,onChange:e=>{Ge(e.target.value)}}),(0,G.jsx)(`p`,{className:`settings-fieldDesc`,children:`同一会话两次通知的最小间隔`})]}),(0,G.jsx)(`div`,{className:`sheet-confirm-actions`,children:(0,G.jsx)(`button`,{type:`button`,className:`mobile-button mobile-button-primary`,"aria-label":`保存触发条件`,disabled:Ce,onClick:()=>{Ot()},children:`保存`})})]}),I!==void 0&&(0,G.jsxs)(`div`,{className:`settings-card`,...gt(`notify-privacy`),children:[(0,G.jsxs)(`div`,{className:`settings-cardHead`,children:[(0,G.jsx)(`span`,{className:`settings-cardTitle`,children:`隐私`}),(0,G.jsx)(Ju,{scope:`sync`})]}),(0,G.jsxs)(`div`,{className:`settings-field`,children:[(0,G.jsx)(`div`,{className:`settings-fieldHead`,children:(0,G.jsx)(`span`,{className:`settings-fieldLabel`,children:`锁屏隐藏通知详情`})}),(0,G.jsx)(`button`,{type:`button`,role:`switch`,"aria-label":`锁屏隐藏通知详情`,"aria-checked":Xe,className:`settings-switch${Xe?` settings-switch-on`:``}`,disabled:Ce,onClick:()=>{wt(!Xe)}}),(0,G.jsx)(`p`,{className:`settings-fieldDesc`,children:`通知不显示会话标题与任务名，避免锁屏时被旁人看到内容`})]})]})]}),et&&(0,G.jsx)(rc,{title:`清除已配置的推送渠道？`,body:`输入框均为空，保存将清除电脑端已保存的通道凭据（Server酱 / Bark / Telegram / WxPusher / PushPlus），之后这些渠道将收不到通知。如果要保留，请取消后不要点保存。`,confirmLabel:`清除`,tone:`danger`,onCancel:()=>{tt(!1)},onConfirm:()=>{tt(!1),xt()}})]});if(ye)return(0,G.jsx)(ld,{onBack:()=>{be(!1)}});let kt=a===void 0?void 0:Qu.find(e=>e.id===a),At=kt!==void 0&&t!==void 0?kt.namespaces.map(e=>t.find(t=>t.ns===e)).filter(e=>e!==void 0):void 0;if(At!==void 0&&At.length>0)return(0,G.jsx)(qu,{namespaces:At,allNamespaces:t??[],onBack:()=>{o(void 0)},onOpenMarket:At.some(e=>e.ns===`dsh-market`)?()=>{l(!0)}:void 0});let jt=()=>{ve(!0),pe().then(e=>{me(e),e.length>0&&$s(e)},()=>{})},Mt=e=>{e.open===`notify`?ge(!0):jt(),mt(e.id)},Nt=async()=>{Re(!0);try{Ie(await F(!0))}catch(e){K($(e))}finally{Re(!1)}};return(0,G.jsxs)(`div`,{className:`mobile`,children:[(0,G.jsxs)(`header`,{className:`mobile-header`,children:[(0,G.jsx)(`div`,{className:`mobile-headerSlot`,children:(0,G.jsx)(`button`,{type:`button`,className:`mobile-back`,"aria-label":`返回`,onClick:e,children:`‹`})}),(0,G.jsx)(`h1`,{className:`mobile-title`,children:`设置`}),(0,G.jsx)(`div`,{className:`mobile-headerSlot mobile-headerSlot-right`})]}),(0,G.jsxs)(`div`,{className:`mobile-scroll`,children:[r!==void 0&&(0,G.jsx)(`p`,{className:`mobile-error mobile-pad`,role:`alert`,children:r}),(0,G.jsx)(`div`,{className:`settings-search`,children:(0,G.jsx)(`input`,{type:`search`,className:`mobile-searchInput`,placeholder:`搜索设置…`,"aria-label":`搜索设置`,value:ut,onChange:e=>{dt(e.target.value)}})}),ht.length>0&&(0,G.jsxs)(`ul`,{className:`settings-group`,children:[(0,G.jsxs)(`li`,{className:`settings-groupTitle`,children:[`配置项 `,(0,G.jsx)(`span`,{className:`settings-groupDesc`,children:`通知 / 语音页内`})]}),ht.map(e=>(0,G.jsx)(`li`,{children:(0,G.jsxs)(`button`,{type:`button`,className:`settings-row`,onClick:()=>{Mt(e)},children:[(0,G.jsx)(`span`,{className:`card-icon`,children:(0,G.jsx)(`span`,{"aria-hidden":!0,children:(0,G.jsx)(Sa,{})})}),(0,G.jsxs)(`span`,{className:`card-main`,children:[(0,G.jsx)(`span`,{className:`card-title`,children:(0,G.jsx)(`span`,{className:`card-titleText`,children:e.label})}),(0,G.jsxs)(`span`,{className:`card-desc`,children:[e.group,` · 点击定位`]})]}),(0,G.jsx)(`span`,{className:`card-action`,children:(0,G.jsx)(td,{})})]})},e.id))]}),(0,G.jsxs)(`div`,{className:`settings-legend`,children:[(0,G.jsx)(Ju,{scope:`phone`}),(0,G.jsx)(`span`,{children:`仅影响本机`}),(0,G.jsx)(Ju,{scope:`sync`}),(0,G.jsx)(`span`,{children:`改动同步到桌面端`}),(0,G.jsx)(Ju,{scope:`desktop`}),(0,G.jsx)(`span`,{children:`请在桌面端修改`})]}),(0,G.jsxs)(`ul`,{className:`settings-group`,children:[(0,G.jsxs)(`li`,{className:`settings-groupTitle`,children:[`外观 `,(0,G.jsx)(`span`,{className:`settings-groupDesc`,children:`显示效果`})]}),pt(`主题`,`theme`,`深色`,`浅色`,`外观`)&&(0,G.jsx)(ed,{icon:(0,G.jsx)(Ca,{}),title:`主题`,desc:`深色 / 浅色 / 跟随系统`,action:(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(`span`,{className:`settings-rowValue`,children:vt}),(0,G.jsx)(td,{})]}),onClick:()=>{O(`theme`)}}),pt(`字体大小`,`font`)&&(0,G.jsx)(ed,{icon:(0,G.jsx)(Ea,{}),title:`字体大小`,desc:`聊天文本的字号`,action:(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(`span`,{className:`settings-rowValue`,children:Gn[d]}),(0,G.jsx)(td,{})]}),onClick:()=>{O(`font`)}}),pt(`消息密度`,`density`,`紧凑`,`舒适`)&&(0,G.jsx)(ed,{icon:(0,G.jsx)(Da,{}),title:`消息密度`,desc:`消息之间的间距`,action:(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(`span`,{className:`settings-rowValue`,children:Jn[p]}),(0,G.jsx)(td,{})]}),onClick:()=>{O(`density`)}}),pt(`代码块行号`,`行号`,`line`)&&(0,G.jsx)(id,{icon:(0,G.jsx)(Oa,{}),title:`代码块行号`,desc:`在代码块左侧显示行号`,value:_,onChange:e=>{Xn(e),v(e)}})]}),(0,G.jsxs)(`ul`,{className:`settings-group`,children:[(0,G.jsxs)(`li`,{className:`settings-groupTitle`,children:[`对话 `,(0,G.jsx)(`span`,{className:`settings-groupDesc`,children:`聊天体验`})]}),pt(`自动滚动`,`scroll`)&&(0,G.jsx)(id,{icon:(0,G.jsx)(ka,{}),title:`自动滚动`,desc:`新消息到达时自动滚动到底部`,value:y,onChange:e=>{Qn(e),b(e)}}),pt(`震动`,`vibrate`,`通知震动`)&&(0,G.jsx)(id,{icon:(0,G.jsx)(Aa,{}),title:`震动`,desc:`任务完成、审批到达时轻震一下`,value:w,onChange:e=>{nr(e),T(e)}})]}),pt(`用量`,`余量`,`配额`,`余额`)&&(0,G.jsxs)(`ul`,{className:`settings-group`,children:[(0,G.jsxs)(`li`,{className:`settings-groupTitle`,children:[`用量 `,(0,G.jsx)(`span`,{className:`settings-groupDesc`,children:`套餐与配额`})]}),Fe===void 0&&r===void 0&&(0,G.jsx)(`li`,{className:`settings-note`,children:`加载中…`}),Ve!==void 0&&Ve.providers.length>0&&!ze&&(0,G.jsx)(ed,{icon:(0,G.jsx)(Ua,{}),title:`用量`,desc:ad(Ve),action:(0,G.jsx)(td,{}),onClick:()=>{Be(!0)}}),Ve!==void 0&&Ve.providers.length>0&&ze&&(0,G.jsxs)(`li`,{className:`usage-card`,children:[Ve.providers.map(e=>(0,G.jsx)(cd,{provider:e},e.name)),(0,G.jsxs)(`div`,{className:`usage-actions`,children:[(0,G.jsx)(`button`,{type:`button`,className:`mobile-button`,onClick:()=>{Be(!1)},children:`收起`}),(0,G.jsx)(`button`,{type:`button`,className:`mobile-button mobile-button-primary`,disabled:Le,onClick:()=>{Nt()},children:Le?`查询中…`:`刷新`})]})]})]}),(0,G.jsxs)(`ul`,{className:`settings-group`,children:[(0,G.jsxs)(`li`,{className:`settings-groupTitle`,children:[`通知 `,(0,G.jsx)(`span`,{className:`settings-groupDesc`,children:`任务完成提醒`})]}),pt(`通知`,`notify`,`推送`,`提醒`,`阈值`,`间隔`)&&(0,G.jsx)(ed,{icon:(0,G.jsx)(da,{}),title:`通知`,desc:`浏览器通知 · 推送渠道 · Web Push`,action:(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(`span`,{className:`settings-rowValue`,children:_t}),(0,G.jsx)(td,{})]}),onClick:()=>{ge(!0)}})]}),(0,G.jsxs)(`ul`,{className:`settings-group`,children:[(0,G.jsxs)(`li`,{className:`settings-groupTitle`,children:[`语音 `,(0,G.jsx)(`span`,{className:`settings-groupDesc`,children:`语音输入与转写`})]}),pt(`语音服务`,`转写`,`voice`,`语音`)&&(0,G.jsx)(ed,{icon:(0,G.jsx)(Ia,{}),title:`语音服务`,desc:re.length===0?P.length>0?`桌面端已配置 ${P.length} 个转写服务`:`语音转写服务，按序回退`:`${re.length} 个服务 · 按序回退`,action:(0,G.jsx)(td,{}),onClick:()=>{jt()}})]}),(0,G.jsxs)(`ul`,{className:`settings-group`,children:[(0,G.jsxs)(`li`,{className:`settings-groupTitle`,children:[`设备 `,(0,G.jsx)(`span`,{className:`settings-groupDesc`,children:`已配对设备管理`})]}),(0,G.jsx)(vu,{}),pt(`设备管理`,`配对`,`设备`,`device`,`pair`)&&(0,G.jsx)(ed,{icon:(0,G.jsx)(Ha,{}),title:`设备管理`,desc:`查看已配对设备 · 重命名 · 设为主设备 · 移除`,action:(0,G.jsx)(td,{}),onClick:()=>{be(!0)}})]}),(0,G.jsxs)(`ul`,{className:`settings-group`,children:[(0,G.jsxs)(`li`,{className:`settings-groupTitle`,children:[`主机配置 `,(0,G.jsx)(`span`,{className:`settings-groupDesc`,children:`模型 · 搜索 · 记忆 · 工具等`})]}),t===void 0&&r===void 0&&(0,G.jsx)(`li`,{className:`settings-note`,children:`加载中…`}),t!==void 0&&Qu.map(e=>{let n=e.namespaces.map(e=>t.find(t=>t.ns===e)).filter(e=>e!==void 0);if(n.length===0||!pt(e.title,...n.map(e=>Ru(e.ns))))return null;let r=n.some(e=>Object.keys(e.value??{}).some(t=>Lu(e.ns,t))),i=n.map(e=>Ru(e.ns)).join(` · `);return(0,G.jsx)(`li`,{children:(0,G.jsxs)(`button`,{type:`button`,className:`mobile-row`,onClick:()=>{o(e.id)},children:[(0,G.jsx)(`span`,{className:`card-icon`,children:(0,G.jsx)(`span`,{"aria-hidden":!0,children:(0,G.jsx)(Sa,{})})}),(0,G.jsxs)(`span`,{className:`card-main`,children:[(0,G.jsxs)(`span`,{className:`card-title`,children:[(0,G.jsx)(`span`,{className:`card-titleText`,children:e.title}),r?(0,G.jsx)(Ju,{scope:`sync`}):(0,G.jsx)(Ju,{scope:`ro`})]}),(0,G.jsx)(`span`,{className:`card-desc`,children:i})]}),(0,G.jsx)(`span`,{className:`card-action`,children:(0,G.jsx)(td,{})})]})},e.id)})]}),(0,G.jsxs)(`ul`,{className:`settings-group`,children:[(0,G.jsx)(`li`,{className:`settings-groupTitle`,children:`通用`}),pt(`清除缓存`,`cache`)&&(0,G.jsx)(ed,{icon:(0,G.jsx)(Ta,{}),title:`清除缓存`,desc:`清除离线壳缓存（PWA）`,action:(0,G.jsx)(td,{}),onClick:()=>{k(!0)}}),pt(`反馈`,`意见`,`建议`,`feedback`,`issue`,`github`)&&(0,G.jsx)(ed,{icon:(0,G.jsx)(za,{}),title:`反馈与建议`,desc:`遇到问题或想要新功能，去 GitHub 告诉我`,action:(0,G.jsx)(td,{}),onClick:()=>{window.open(`https://github.com/Eternalloveone/dsh-palm/issues/new`,`_blank`,`noopener`)}}),pt(`关于`,`about`,`版本`)&&(0,G.jsx)(ed,{icon:(0,G.jsx)(ja,{}),title:`关于`,desc:`掌上 DSH · 版本 ${fu}${Tu===void 0?``:` · 构建 ${Tu}`}`,action:(0,G.jsx)(td,{}),onClick:()=>{O(`about`)}}),(0,G.jsx)(Cu,{})]}),(0,G.jsx)(`p`,{className:`settings-note`,children:`密钥类配置永不显示、不可在手机端修改；带「只读」标记的配置请在桌面端调整。`}),ft!==``&&(0,G.jsx)(`div`,{className:`mobile-empty`,children:(0,G.jsxs)(`p`,{className:`empty-desc`,children:[`没有匹配「`,ut.trim(),`」的设置项`]})})]}),E===`theme`&&(0,G.jsx)(nd,{title:`主题`,value:u,options:[{value:`dark`,label:`深色`},{value:`light`,label:`浅色`},{value:`system`,label:`跟随系统`}],onPick:e=>{Nr(e),g(`ui-theme`,[{op:`set`,path:[`preference`],value:e}]).catch(()=>{})},onClose:()=>{O(null)}}),E===`font`&&(0,G.jsx)(nd,{title:`字体大小`,value:d,options:[{value:`small`,label:`小`},{value:`standard`,label:`标准`},{value:`large`,label:`大`}],onPick:e=>{Wn(e),f(e),$n()},onClose:()=>{O(null)}}),E===`density`&&(0,G.jsx)(nd,{title:`消息密度`,value:p,options:[{value:`compact`,label:`紧凑`},{value:`cozy`,label:`舒适`}],onPick:e=>{qn(e),m(e),$n()},onClose:()=>{O(null)}}),E===`about`&&(0,G.jsxs)(la,{title:`关于`,onClose:()=>{O(null)},children:[(0,G.jsxs)(`p`,{className:`sheet-confirm-desc`,children:[`掌上 DSH（dsh-palm）· 版本 `,fu,(0,G.jsx)(`br`,{}),`DSH 移动端界面：扫码配对、工作区、会话与实时对话。`]}),(0,G.jsx)(`div`,{className:`sheet-confirm-actions`,children:(0,G.jsx)(`button`,{type:`button`,className:`mobile-button`,disabled:nt,onClick:()=>{Et()},children:nt?`检查中…`:`检查更新`})}),it!==void 0&&(0,G.jsx)(`p`,{className:`settings-fieldDesc`,role:`status`,children:it}),(0,G.jsxs)(`div`,{className:`settings-field`,children:[(0,G.jsx)(`span`,{className:`settings-fieldLabel`,children:`依赖自检`}),(0,G.jsx)(`p`,{className:`settings-fieldDesc`,children:`与宿主接口的连通性。总线事件显示自启动以来收到的帧数——事件被改名或停发时订阅仍会 成功，所以要看常发的那几条（session.control / session/event / agent/assistant-stream） 是否长期为 0；added、removed、error 本就罕见，0 帧属正常。`}),ot===void 0?(0,G.jsx)(`p`,{className:`settings-fieldDesc`,children:ct?`读取中…`:`未读取`}):ot.checks.map(e=>(0,G.jsxs)(`p`,{className:`settings-fieldDesc`,children:[e.ok?`✓`:`✗`,` `,e.name,` · `,e.ok?e.kind===`method`?`在位`:`${String(e.frames)} 帧${e.lastAt===void 0?``:` · ${Xu(e.lastAt,ot.now)}`}`:e.reason??`不可用`]},e.name)),(0,G.jsx)(`button`,{type:`button`,className:`mobile-button`,disabled:ct,onClick:()=>{Dt()},children:ct?`读取中…`:`刷新自检`})]})]}),ne&&(0,G.jsx)(rc,{title:`清除缓存`,body:`将删除本机的离线壳缓存（PWA CacheStorage）并重新注册。偏好与配对状态不受影响。`,confirmLabel:`清除`,tone:`danger`,onCancel:()=>{k(!1)},onConfirm:()=>{k(!1),rd()}})]})}let dd;const fd=`dsh.palm.pinnedWorkspaces`,pd=`dsh.palm.recentWorkspaces`,md=`dsh.palm.recentWorkspace`,hd=`dsh.palm.welcomeSeen`;function gd(){try{let e=localStorage.getItem(fd),t=e===null?[]:JSON.parse(e);return Array.isArray(t)?t.filter(e=>typeof e==`string`):[]}catch{return[]}}function _d(e){try{localStorage.setItem(fd,JSON.stringify(e))}catch{}}function vd(e){let t=[];for(let n of e)if(!t.includes(n)&&(t.push(n),t.length>=5))break;return t}function yd(){try{let e=localStorage.getItem(pd);if(e!==null){let t=JSON.parse(e);if(Array.isArray(t))return vd(t.filter(e=>typeof e==`string`))}}catch{}try{let e=localStorage.getItem(md);if(e!==null&&e!==``){let t=vd([e]);return localStorage.setItem(pd,JSON.stringify(t)),localStorage.removeItem(md),t}}catch{}return[]}function bd(e){let t=vd(e);try{localStorage.setItem(pd,JSON.stringify(t))}catch{}}function xd(e,t){let n=vd([t,...e.filter(e=>e!==t)]);return bd(n),n}function Sd(e,t){let n=e.filter(e=>e!==t);return bd(n),n}function Cd(e,t){return t.slice(0,3).includes(e.workspaceId)?`active`:/\b(test|tests|testing|spec|specs|benchmark|e2e)\b/i.test(e.path.replace(/[\\/]+/g,` `))||/\b(test|tests|testing|spec|specs|benchmark|e2e)\b/i.test(e.title)?`test`:(e.sessionIds??[]).length===0?`plain`:`code`}const wd={active:`活跃项目`,code:`代码项目`,test:`测试项目`,plain:`其他`},Td={active:`ws-icon-active`,code:`ws-icon-code`,test:`ws-icon-test`,plain:`ws-icon-plain`},Ed=[{kind:`active`,placeholder:null},{kind:`code`,placeholder:`暂无代码项目`},{kind:`test`,placeholder:`暂无测试项目`},{kind:`plain`,placeholder:null}];function Dd({onCancel:e,onPick:t}){let[n,r]=(0,c.useState)(void 0),[i,a]=(0,c.useState)(void 0),[o,s]=(0,c.useState)(!1),[l,u]=(0,c.useState)(void 0),[d,f]=(0,c.useState)(0);(0,c.useEffect)(()=>{let e=!1;return a(void 0),r(void 0),Se(l).then(t=>{e||r(t)},t=>{e||a($(t))}),()=>{e=!0}},[l,d]);let p=async()=>{if(!(n===void 0||o)){s(!0),a(void 0);try{t((await L(n.path)).workspace)}catch(e){s(!1),a($(e))}}};return(0,G.jsxs)(`div`,{className:`mobile dir-browser`,children:[(0,G.jsxs)(`header`,{className:`mobile-header`,children:[(0,G.jsx)(`div`,{className:`mobile-headerSlot`,children:(0,G.jsx)(`button`,{type:`button`,className:`mobile-headerAction`,onClick:e,children:`返回`})}),(0,G.jsx)(`h1`,{className:`mobile-title`,children:`选择目录`}),(0,G.jsx)(`div`,{className:`mobile-headerSlot mobile-headerSlot-right`})]}),n!==void 0&&(0,G.jsx)(`div`,{className:`dir-crumbs`,children:n.crumbs.map((e,t)=>(0,G.jsxs)(`span`,{children:[(0,G.jsx)(`button`,{type:`button`,className:`dir-crumb`,onClick:()=>u(e.path),children:e.name||`/`}),t<n.crumbs.length-1&&(0,G.jsx)(`span`,{className:`dir-crumb-separator`,children:`/`})]},e.path))}),i===void 0?n===void 0?(0,G.jsx)(`div`,{className:`mobile-empty`,children:(0,G.jsx)(`p`,{className:`mobile-muted`,children:`加载中…`})}):(0,G.jsx)(`ul`,{className:`mobile-list`,children:n.entries.length===0?(0,G.jsx)(`div`,{className:`mobile-empty dir-empty`,children:(0,G.jsx)(`p`,{className:`mobile-muted`,children:`空目录`})}):n.entries.map(e=>(0,G.jsx)(`li`,{children:(0,G.jsxs)(`button`,{type:`button`,className:`mobile-row dir-entry ${e.hidden?`dir-entry-hidden`:``}`,onClick:()=>u(e.path),children:[(0,G.jsx)(`span`,{className:`mobile-rowMain`,children:(0,G.jsx)(`span`,{className:`mobile-rowTitle`,children:e.name})}),(0,G.jsx)(`span`,{className:`mobile-chevron`,"aria-hidden":!0,children:`›`})]})},e.path))}):(0,G.jsxs)(`div`,{className:`mobile-empty`,children:[(0,G.jsx)(`p`,{className:`mobile-error`,children:i}),(0,G.jsx)(`button`,{type:`button`,className:`mobile-button`,onClick:()=>f(e=>e+1),children:`重试`})]}),(0,G.jsx)(`div`,{className:`dir-select`,children:(0,G.jsx)(`button`,{type:`button`,className:`mobile-button`,disabled:n===void 0||o,onClick:()=>void p(),children:o?`创建中…`:`选择此目录`})})]})}function Od({target:e,pinned:t,onClose:n,onPinnedChange:r,onRename:i,onDelete:a}){let{workspace:o}=e,s=[{key:`pin`,label:t?`取消固定`:`固定到顶部`,run:()=>{r()}},{key:`rename`,label:`重命名`,run:()=>{i(o)}},{key:`delete`,label:`删除工作区`,danger:!0,run:()=>{a(o)}}];return(0,G.jsx)(la,{title:o.title,onClose:n,children:(0,G.jsx)(`div`,{role:`menu`,"aria-label":`工作区操作：${o.title}`,children:s.map(e=>(0,G.jsx)(`button`,{type:`button`,role:`menuitem`,className:`sheet-option`,onClick:()=>{n(),e.run()},children:(0,G.jsx)(`span`,{className:`sheet-option-copy`,children:(0,G.jsx)(`span`,{className:`sheet-option-title`,style:e.danger?{color:`var(--danger)`}:void 0,children:e.label})})},e.key))})})}function kd(){return(0,G.jsx)(`div`,{"aria-hidden":`true`,role:`presentation`,children:[0,1,2].map(e=>(0,G.jsxs)(`div`,{className:`skel-row`,children:[(0,G.jsx)(`div`,{className:`skel skel-icon`}),(0,G.jsxs)(`div`,{className:`skel-lines`,children:[(0,G.jsx)(`div`,{className:`skel skel-line-title`}),(0,G.jsx)(`div`,{className:`skel skel-line-sub`})]})]},e))})}function Ad({initialWorkspaceId:e,onPick:t,onLocateSession:n,onOpenDirect:r,initialSearch:i,onSearchSnapshot:a,onSearchApplied:o,onOpenRunOverview:s,onOpenSettings:Ow,runOverviewLive:l}){let[u,d]=(0,c.useState)(()=>dd),[f,p]=(0,c.useState)(void 0),[m,h]=(0,c.useState)(0),[g,_]=(0,c.useState)(!1),[v,b]=(0,c.useState)(!1),[x,S]=(0,c.useState)(``),C=(0,c.useRef)(!1);(0,c.useEffect)(()=>{C.current||i!==void 0&&i.open&&(C.current=!0,b(!0),S(i.term),o?.())},[i,o]),(0,c.useEffect)(()=>{a?.(v,x)},[v,x,a]);let[w,T]=(0,c.useState)([]),[ee,te]=(0,c.useState)(!1),[E,D]=(0,c.useState)(!1),[O,ne]=(0,c.useState)(!1),[k,re]=(0,c.useState)(!1),[ie,ae]=(0,c.useState)(!1),[M,N]=(0,c.useState)(()=>gd()),[oe,se]=(0,c.useState)(()=>yd()),[ce,le]=(0,c.useState)(void 0),[ue,de]=(0,c.useState)(void 0),[fe,P]=(0,c.useState)(void 0),[pe,F]=(0,c.useState)(!1),me=(0,c.useRef)(void 0),[he,ge]=(0,c.useState)(()=>{try{return localStorage.getItem(hd)===`1`}catch{return!1}}),_e=()=>{ge(!0);try{localStorage.setItem(hd,`1`)}catch{}};(0,c.useEffect)(()=>{let e=x.trim();if(e===``){T([]),D(!1),te(!1),ne(!1),re(!1);return}te(!0),D(!1),re(!1);let t=!1,n=setTimeout(()=>{A(e).then(e=>{t||(T(e.items),ne(e.hasMore),re(e.partial===!0),D(!0),te(!1))},()=>{t||(T([]),D(!0),te(!1))})},250);return()=>{t=!0,clearTimeout(n)}},[x]);let ve=(e,t)=>{if(e.kind===`message`&&e.seq!==void 0){be(e,e.seq,t,e.messageId,e.partId);return}j(e.sessionId,t).then(n=>{let r=n.items[0];be(e,r?.seq,t,r?.messageId,r?.partId)},()=>{be(e,void 0,t)})},ye=e=>{if(e.workspaceId!==void 0){let t=(u??[]).find(t=>t.workspaceId===e.workspaceId);return{workspaceId:e.workspaceId,title:t?.title??e.workspaceTitle}}let t=(u??[]).find(t=>(t.sessionIds??[]).map(String).includes(e.sessionId));return t===void 0?{}:{workspaceId:t.workspaceId,title:t.title}},be=(e,t,i,a,o)=>{let s=ye(e);if(s.workspaceId!==void 0&&n!==void 0){let r=a??e.messageId,c=o??e.partId;n(e.sessionId,s.workspaceId,t,i,...[r,c].some(e=>e!==void 0)?[r,c]:[]);return}if(s.workspaceId===void 0){if(r!==void 0){let n=a??e.messageId,s=o??e.partId;r(e,t,i,...[n,s].some(e=>e!==void 0)?[n,s]:[]);return}K(`未找到该会话所属的工作区`);return}let c=new URL(window.location.href);c.searchParams.set(`workspace`,s.workspaceId),c.searchParams.set(`session`,e.sessionId),t!==void 0&&c.searchParams.set(`seq`,String(t)),window.location.href=`${c.pathname}${c.search}`};(0,c.useEffect)(()=>{let n=!1;return y().then(r=>{if(n)return;let i=e===void 0?void 0:r.find(t=>t.workspaceId===e);if(i!==void 0){t(i);return}dd=r,d(r)},e=>{n||p($(e))}),()=>{n=!0}},[e,t,m]);let xe=(0,c.useCallback)(e=>{se(t=>xd(t,e.workspaceId)),t(e)},[t]),Se=(0,c.useCallback)(()=>{let e=oe[0],t=e===void 0?void 0:u?.find(t=>t.workspaceId===e);if(t===void 0){K(`还没有访问记录`);return}xe(t)},[u,oe,xe]),I=(0,c.useCallback)(()=>{me.current!==void 0&&(clearTimeout(me.current),me.current=void 0)},[]);(0,c.useEffect)(()=>()=>{I()},[I]);let L=(0,c.useRef)(void 0),Te=e=>({onTouchStart:()=>{I(),L.current=void 0,me.current=window.setTimeout(()=>{me.current=void 0,L.current=e.workspaceId,le({workspace:e})},500)},onTouchMove:I,onTouchEnd:I,onClick:t=>{if(L.current===e.workspaceId){L.current=void 0,t.preventDefault();return}xe(e)},onContextMenu:t=>{t.preventDefault(),le({workspace:e})}}),Ee=(0,c.useCallback)(e=>{let t=M.includes(e.workspaceId),n=t?M.filter(t=>t!==e.workspaceId):[...M,e.workspaceId];N(n),_d(n),K(t?`已取消固定`:`已固定`)},[M]),De=(0,c.useCallback)(async(e,t)=>{F(!0);try{let{workspace:n}=await Ce(e.workspaceId,t);d(e=>e?.map(e=>e.workspaceId===n.workspaceId?n:e)??e),de(void 0),K(`已重命名`)}catch(e){K($(e))}finally{F(!1)}},[]),Oe=(0,c.useCallback)(async e=>{F(!0);try{await we(e.workspaceId),d(t=>t?.filter(t=>t.workspaceId!==e.workspaceId)??t),se(t=>Sd(t,e.workspaceId)),P(void 0),K(`已删除工作区（目录与会话保留）`)}catch(e){K($(e))}finally{F(!1)}},[]);if(g)return(0,G.jsx)(Dd,{onCancel:()=>_(!1),onPick:xe});let R=x.trim().toLowerCase(),z=(u??[]).filter(e=>R===``||e.title.toLowerCase().includes(R)).filter(e=>!ie||M.includes(e.workspaceId)),B=Co((u??[]).map(e=>e.path)),V=[...z].sort((e,t)=>+!M.includes(e.workspaceId)-!M.includes(t.workspaceId)),ke=new Map(oe.map((e,t)=>[e,t])),Ae=Ed.map(({kind:e})=>({kind:e,rows:e===`active`?V.filter(t=>Cd(t,oe)===e).sort((e,t)=>{let n=+!M.includes(e.workspaceId),r=+!M.includes(t.workspaceId);return n===r?(ke.get(e.workspaceId)??1/0)-(ke.get(t.workspaceId)??1/0):n-r}):V.filter(t=>Cd(t,oe)===e)})).filter(e=>e.rows.length>0),je=Ed.filter(({kind:e,placeholder:t})=>t!==null&&!V.some(t=>Cd(t,oe)===e)),Me=M.length,Ne=(()=>{if(f!==void 0)return(0,G.jsxs)(`div`,{className:`mobile-empty`,children:[(0,G.jsx)(`div`,{className:`empty-icon`,children:(0,G.jsx)(xa,{})}),(0,G.jsx)(`p`,{className:`empty-title`,children:`加载失败`}),(0,G.jsx)(`p`,{className:`empty-desc`,children:f}),(0,G.jsx)(`button`,{type:`button`,className:`mobile-button`,onClick:()=>{p(void 0),d(void 0),h(e=>e+1)},children:`重试`})]});if(u===void 0)return(0,G.jsx)(kd,{});if(z.length===0){if(ie&&Me===0)return(0,G.jsxs)(`div`,{className:`mobile-empty`,children:[(0,G.jsx)(`div`,{className:`empty-icon`,children:(0,G.jsx)(fa,{})}),(0,G.jsx)(`p`,{className:`empty-title`,children:`还没有固定的工作区`}),(0,G.jsx)(`p`,{className:`empty-desc`,children:`长按工作区卡片即可固定，固定后会置顶显示`})]});if(R!==``){if(ee)return(0,G.jsxs)(`div`,{className:`mobile-empty`,children:[(0,G.jsx)(`div`,{className:`empty-icon`,children:(0,G.jsx)(ua,{})}),(0,G.jsx)(`p`,{className:`empty-title`,children:`正在搜索全部会话…`})]});if(E&&w.length===0)return(0,G.jsxs)(`div`,{className:`mobile-empty`,children:[(0,G.jsx)(`div`,{className:`empty-icon`,children:(0,G.jsx)(ua,{})}),(0,G.jsx)(`p`,{className:`empty-title`,children:`没有匹配的工作区或会话`}),(0,G.jsxs)(`p`,{className:`empty-desc`,children:[`工作区按名称匹配，会话按名称与可见正文匹配`,k&&(0,G.jsx)(G.Fragment,{children:`；更早的会话未在本次扫描范围内`})]})]})}else return(0,G.jsxs)(`div`,{className:`mobile-empty`,children:[(0,G.jsx)(`div`,{className:`empty-icon`,children:(0,G.jsx)(ha,{})}),(0,G.jsx)(`p`,{className:`empty-title`,children:`暂无工作区`}),(0,G.jsx)(`p`,{className:`empty-desc`,children:`新建一个工作区，把项目目录挂进来就能开始会话`})]})}return(0,G.jsxs)(`ul`,{className:`mobile-list`,children:[Ae.map(e=>(0,G.jsxs)(`li`,{style:{listStyle:`none`},children:[(0,G.jsx)(`div`,{className:`mobile-groupTitle`,children:wd[e.kind]}),e.rows.map(e=>{let t=Cd(e,oe),n=M.includes(e.workspaceId),r=(e.sessionIds??[]).length;return(0,G.jsxs)(`button`,{type:`button`,className:`mobile-row${t===`active`?` mobile-row-active`:``}`,...Te(e),children:[(0,G.jsx)(`span`,{className:`ws-icon ${Td[t]}`,children:(0,G.jsx)(`span`,{"aria-hidden":!0,children:(0,G.jsx)(ma,{})})}),(0,G.jsxs)(`span`,{className:`card-main`,children:[(0,G.jsxs)(`span`,{className:`card-title`,children:[(0,G.jsx)(`span`,{className:`card-titleText`,children:e.title}),n&&(0,G.jsx)(`span`,{className:`ws-pin`,"aria-label":`已固定`,children:(0,G.jsx)(fa,{})})]}),(0,G.jsx)(`span`,{className:`card-subtitle`,children:wo(e.path,B)})]}),(0,G.jsxs)(`span`,{className:`card-action`,children:[r>0&&(0,G.jsxs)(`span`,{className:`card-badge`,children:[r,` 会话`]}),(0,G.jsx)(`span`,{className:`mobile-chevron`,"aria-hidden":!0,children:`›`})]})]},e.workspaceId)})]},e.kind)),!ie&&R===``&&je.map(({kind:e,placeholder:t})=>(0,G.jsxs)(`li`,{style:{listStyle:`none`},children:[(0,G.jsx)(`div`,{className:`mobile-groupTitle`,children:wd[e]}),(0,G.jsxs)(`div`,{className:`mobile-empty-group`,children:[(0,G.jsx)(`span`,{children:t}),(0,G.jsx)(`button`,{type:`button`,className:`mobile-empty-groupBtn`,onClick:()=>_(!0),children:`创建`})]})]},`empty-${e}`)),R!==``&&ee&&(0,G.jsx)(`li`,{style:{listStyle:`none`},children:(0,G.jsx)(`p`,{className:`mobile-muted mobile-pad`,role:`status`,children:`正在搜索全部会话…`})}),R!==``&&!ee&&w.length>0&&(0,G.jsxs)(`li`,{style:{listStyle:`none`},children:[(0,G.jsx)(`div`,{className:`mobile-groupTitle`,children:`会话`}),w.map(e=>{let t=ye(e),n=(e.title??e.snippet.trim().slice(0,24))||`匹配会话`;return(0,G.jsx)(`li`,{style:{listStyle:`none`},children:(0,G.jsxs)(`button`,{type:`button`,className:`mobile-row`,onClick:()=>{ve(e,R)},children:[(0,G.jsx)(`span`,{className:`card-icon`,children:(0,G.jsx)(`span`,{className:`sess-check`,"aria-hidden":!0,children:(0,G.jsx)(Fa,{})})}),(0,G.jsxs)(`span`,{className:`card-main`,children:[(0,G.jsxs)(`span`,{className:`sess-titleline`,children:[(0,G.jsx)(`span`,{className:`sess-title`,children:n}),(0,G.jsx)(`span`,{className:`sess-sep`,"aria-hidden":!0,children:`·`}),(0,G.jsx)(`span`,{className:`sess-time`,children:t.title??`未分组`})]}),(0,G.jsx)(`span`,{className:`card-desc`,children:e.snippet})]}),(0,G.jsx)(`span`,{className:`card-action`,children:(0,G.jsx)(`span`,{className:`mobile-chevron`,"aria-hidden":!0,children:`›`})})]})},`${e.kind}:${e.sessionId}`)}),O&&(0,G.jsx)(`li`,{style:{listStyle:`none`},children:(0,G.jsx)(`p`,{className:`search-hitsNote mobile-pad`,children:`结果较多，仅显示前若干条——请细化关键词`})}),!O&&k&&(0,G.jsx)(`li`,{style:{listStyle:`none`},children:(0,G.jsx)(`p`,{className:`search-hitsNote mobile-pad`,children:`已扫描最近的会话，更早的会话可能未覆盖`})})]}),!ie&&R===``&&(0,G.jsx)(`li`,{style:{listStyle:`none`},children:(0,G.jsxs)(`button`,{type:`button`,className:`mobile-createCard`,onClick:()=>_(!0),children:[(0,G.jsx)(_a,{}),`新建工作区`]})})]})})();return(0,G.jsxs)(`div`,{className:`mobile`,children:[(0,G.jsxs)(`header`,{className:`mobile-header`,children:[(0,G.jsx)(`div`,{className:`mobile-headerSlot`,children:v?(0,G.jsx)(`button`,{type:`button`,className:`mobile-back`,"aria-label":`返回`,onClick:()=>{b(!1),S(``)},children:`‹`}):(0,G.jsx)(`div`,{className:`mobile-headerSlot`})}),v?(0,G.jsx)(`div`,{className:`mobile-headerSearch`,children:(0,G.jsx)(`input`,{type:`search`,className:`mobile-headerSearchInput`,placeholder:`搜索工作区或会话…`,"aria-label":`搜索工作区和会话`,autoFocus:!0,value:x,onChange:e=>{S(e.target.value)}})}):(0,G.jsx)(`h1`,{className:`mobile-title`,children:`工作区`}),(0,G.jsx)(`div`,{className:`mobile-headerSlot mobile-headerSlot-right`,children:v?(0,G.jsx)(`button`,{type:`button`,className:`mobile-iconbtn`,"aria-label":`取消搜索`,onClick:()=>{b(!1),S(``)},children:(0,G.jsx)(La,{})}):(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(`button`,{type:`button`,className:`mobile-iconbtn`,"aria-label":`搜索工作区和会话`,onClick:()=>{b(!0)},children:(0,G.jsx)(ua,{})}),(0,G.jsx)(`button`,{type:`button`,className:`mobile-iconbtn`,"aria-label":`设置`,onClick:Ow,children:(0,G.jsxs)(`svg`,{viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.8`,strokeLinecap:`round`,"aria-hidden":!0,children:[(0,G.jsx)(`circle`,{cx:`12`,cy:`12`,r:`3`}),(0,G.jsx)(`path`,{d:`M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z`})]})}),(0,G.jsx)(xo,{})]})})]}),(0,G.jsxs)(`div`,{className:`mobile-quickbar`,role:`toolbar`,"aria-label":`快捷操作`,children:[(0,G.jsxs)(`button`,{type:`button`,className:`mobile-quickchip${ie?` mobile-quickchip-on`:``}`,"aria-pressed":ie,onClick:()=>{ae(e=>!e)},children:[(0,G.jsx)(fa,{}),`固定`,Me>0?` ${Me}`:``]}),(0,G.jsxs)(`button`,{type:`button`,className:`mobile-quickchip`,onClick:Se,children:[(0,G.jsx)(pa,{}),`最近访问`]}),s!==void 0&&(0,G.jsxs)(`button`,{type:`button`,className:`mobile-quickchip`+(l!==void 0&&l>0?` mobile-quickchip-live`:``),"aria-label":l!==void 0&&l>0?`运行中 ${l} 个会话`:`运行中`,onClick:s,children:[(0,G.jsx)(`span`,{className:l!==void 0&&l>0?`quick-live-dot`:`quick-live-dot quick-live-dot-off`,"aria-hidden":!0}),`运行中`,l!==void 0&&l>0&&(0,G.jsx)(`span`,{className:`quick-live-count`,children:l})]})]}),!he&&(0,G.jsxs)(`div`,{className:`mobile-welcome`,role:`note`,children:[(0,G.jsxs)(`div`,{className:`mobile-welcomeCopy`,children:[(0,G.jsx)(`p`,{className:`mobile-welcomeTitle`,children:`配对成功 🎉 三步上手`}),(0,G.jsxs)(`p`,{className:`mobile-welcomeDesc`,children:[`① 点一个工作区开始对话`,(0,G.jsx)(`br`,{}),`② 右上角 设置 → 通知：配好任务完成提醒`,(0,G.jsx)(`br`,{}),`③ 设置 → 用量：随时查看余额与配额`]})]}),(0,G.jsx)(`button`,{type:`button`,className:`mobile-welcomeClose`,onClick:_e,children:`知道了`})]}),Ne,ce!==void 0&&(0,G.jsx)(Od,{target:ce,pinned:M.includes(ce.workspace.workspaceId),onClose:()=>{le(void 0)},onPinnedChange:()=>{Ee(ce.workspace)},onRename:e=>{le(void 0),de(e)},onDelete:e=>{le(void 0),P(e)}}),ue!==void 0&&(0,G.jsx)(ic,{title:`重命名工作区`,initial:ue.title,confirmLabel:`保存`,busy:pe,onCancel:()=>{de(void 0)},onConfirm:e=>{De(ue,e)}}),fe!==void 0&&(0,G.jsx)(rc,{title:`删除工作区`,body:(0,G.jsxs)(G.Fragment,{children:[`确定删除「`,fe.title,`」吗？目录、文件与会话记录都会保留，仅移除这里的工作区入口。`]}),confirmLabel:`删除`,tone:`danger`,busy:pe,onCancel:()=>{P(void 0)},onConfirm:()=>{Oe(fe)}})]})}const jd=/^\d{6}$/;function Md(e){let t=e.trim();if(t!==``){if(jd.test(t))return{code:t};try{let e=new URL(t),n=e.searchParams.get(`pair`);if(n===null||n===``)return;let r=e.searchParams.get(`workspace`);return{token:n,...r!==null&&r!==``?{workspaceId:r}:{}}}catch{return{token:t}}}}function Nd(e){return e===void 0?`/m/`:`/m/?workspace=`+encodeURIComponent(e)}async function Pd(e,t=fetch){let n=new AbortController,r=setTimeout(()=>{n.abort()},15e3);try{let r=await t(`/api/pair/accept`,{method:`POST`,headers:{"content-type":`application/json`},body:JSON.stringify(jd.test(e)?{code:e}:{token:e}),signal:n.signal});return r.ok?{ok:!0}:r.status===404?{ok:!1,message:`配对链接无效或已过期。`}:r.status===409?{ok:!1,message:`设备数已满：请先在桌面端「设备管理」移除一个设备后重试。`}:{ok:!1,message:`此设备无法使用该配对链接。`}}catch{return{ok:!1,message:`无法连接到配对服务。`}}finally{clearTimeout(r)}}async function Fd(e,t=fetch){let n;try{n=new URL(e)}catch{return{kind:`none`}}let r=n.searchParams.get(`pair`),i=n.searchParams.get(`code`);if((r===null||r===``)&&(i===null||i===``))return{kind:`none`};let a=n.searchParams.get(`workspace`),o=Nd(a===null||a===``?void 0:a),s=await Pd(i!==null&&i!==``?i:r??``,t);return s.ok?{kind:`accepted`,path:o}:{kind:`failed`,path:o,message:s.message}}function Id(e){try{return new URL(e).origin}catch{return}}function Ld({initialError:e,onPaired:t,navigate:n}){let[r,i]=(0,c.useState)(window.location.origin),[a,o]=(0,c.useState)(``),[s,l]=(0,c.useState)(e),[u,d]=(0,c.useState)(!1),f=n??(e=>{window.location.href=e}),p=async e=>{e.preventDefault();let n=Md(a);if(n===void 0){l(`请输入有效的配对链接或配对码。`);return}let i=Id(a.trim());if(i!==void 0&&i!==window.location.origin){f(a.trim());return}let o=Id(r.trim())??window.location.origin;if(o!==window.location.origin){let e=n.code===void 0?n.token??``:n.code;f(`${o}/m/?${n.code===void 0?`pair`:`code`}=${encodeURIComponent(e)}`);return}d(!0),l(void 0);let s=await Pd(n.code??n.token??``);if(d(!1),!s.ok){l(s.message);return}t(Nd(n.workspaceId))};return(0,G.jsx)(`main`,{className:`mobile mobile-pair`,"aria-labelledby":`mobile-pair-title`,children:(0,G.jsxs)(`form`,{className:`mobile-pairCard`,onSubmit:e=>{p(e)},children:[(0,G.jsx)(`h1`,{id:`mobile-pair-title`,className:`mobile-title`,children:`设备配对`}),(0,G.jsx)(`p`,{className:`mobile-muted`,children:`粘贴桌面端复制的配对链接，或输入桌面端显示的 6 位配对码。`}),(0,G.jsx)(`label`,{className:`mobile-pairLabel`,htmlFor:`mobile-pair-server`,children:`服务器地址`}),(0,G.jsx)(`input`,{id:`mobile-pair-server`,className:`mobile-pairInput`,value:r,onChange:e=>{i(e.target.value)},autoComplete:`off`,autoCapitalize:`off`,spellCheck:!1,inputMode:`url`}),(0,G.jsx)(`label`,{className:`mobile-pairLabel`,htmlFor:`mobile-pair-link`,children:`配对链接或配对码`}),(0,G.jsx)(`input`,{id:`mobile-pair-link`,className:`mobile-pairInput`,value:a,onChange:e=>{o(e.target.value)},autoComplete:`off`,autoCapitalize:`off`,spellCheck:!1}),s===void 0?null:(0,G.jsx)(`p`,{className:`mobile-error`,role:`alert`,children:s}),(0,G.jsx)(`button`,{className:`mobile-new mobile-pairSubmit`,type:`submit`,disabled:u,children:u?`正在配对`:`配对`})]})})}const Rd={workspaceId:`standalone`,path:``,title:`未分组`,sessionIds:[],createdAt:``,updatedAt:``};function zd(e){let t=new URLSearchParams(e).get(`workspace`);return t===null||t===``?void 0:t}function Bd(e){let t=new URLSearchParams(e).get(`session`);return t===null||t===``?void 0:t}function Vd(e){let t=new URLSearchParams(e).get(`seq`);if(t===null||t===``)return;let n=Number(t);return Number.isFinite(n)&&n>=0?n:void 0}function Hd(e){let t=e.projections?.values,n=t?.title,r=typeof n==`string`&&n!==``?n:e.cwd===void 0?`新会话`:e.cwd.split(`/`).filter(Boolean).at(-1)??e.cwd,i=t?.preview,a=t?.sessionStats,o=typeof a==`object`&&a?a.turns:void 0;return{sessionId:e.sessionId,title:r,...typeof i==`string`&&i!==``?{preview:i}:{},...typeof o==`number`&&o>0?{turns:o}:{},...e.cwd===void 0?{}:{cwd:e.cwd},updatedAt:e.updatedAt,running:e.running,blank:e.blank}}function Ud(e){let t=new Date(e),n=`${String(t.getHours()).padStart(2,`0`)}:${String(t.getMinutes()).padStart(2,`0`)}`,r=new Date;if(t.toDateString()===r.toDateString())return n;let i=new Date(r);return i.setDate(r.getDate()-1),t.toDateString()===i.toDateString()?`昨天 ${n}`:`${String(t.getMonth()+1)}月${String(t.getDate())}日 ${n}`}function Wd(e){let t=new Date(e),n=String(t.getMonth()+1).padStart(2,`0`),r=String(t.getDate()).padStart(2,`0`),i=`${String(t.getHours()).padStart(2,`0`)}:${String(t.getMinutes()).padStart(2,`0`)}`,a=t.getFullYear();return a===new Date().getFullYear()?`${n}-${r} ${i}`:`${a}-${n}-${r} ${i}`}const Gd={workspaces:0,"run-overview":1,sessions:1,settings:2,chat:2};function Kd(){if(typeof navigator>`u`)return`device`;let e=typeof navigator.userAgent==`string`?navigator.userAgent:``;return/android/i.test(e)?`android`:/ipad|iphone|ipod/i.test(e)?`ios`:`device`}function qd(e){return e instanceof u&&e.message===`HTTP 403`}function Jd(e){return qd(e)?`unpaired`:`unavailable`}function Yd({initialPairError:e}){let[t,n]=(0,c.useState)(`checking`);return(0,c.useEffect)(()=>(jn(),wn(),Ut(),Ii({send:e=>{ne({kind:e.kind,message:e.message,...e.source===void 0?{}:{source:e.source},...e.frames===void 0?{}:{frames:e.frames},count:e.count,clientAt:e.at},Kd())}})),[]),(0,c.useEffect)(()=>{let e=!0;return b().then(()=>{e&&n(`paired`)},t=>{e&&n(Jd(t))}),()=>{e=!1}},[]),(0,c.useEffect)(()=>{t===`unpaired`&&(Oi(),Fi())},[t]),t===`checking`?(0,G.jsxs)(`main`,{className:`mobile mobile-empty`,role:`status`,children:[(0,G.jsx)(`span`,{className:`boot-dot`,"aria-hidden":!0}),(0,G.jsx)(`p`,{className:`mobile-muted`,children:`正在连接...`})]}):t===`unpaired`?(0,G.jsx)(Ld,{initialError:e,onPaired:e=>{Oi(),Fi(),window.location.replace(e)}}):t===`unavailable`?(0,G.jsxs)(`main`,{className:`mobile mobile-empty`,children:[(0,G.jsx)(`p`,{className:`mobile-error`,role:`alert`,children:`无法连接到运行中的 DSH host。`}),(0,G.jsx)(`button`,{className:`mobile-new`,type:`button`,onClick:()=>{window.location.reload()},children:`重试`})]}):(0,G.jsx)(Xd,{onUnpaired:()=>n(`unpaired`)})}function Xd({onUnpaired:e}){let t=br(),[n,r]=(0,c.useState)({current:{route:{kind:`workspaces`},forward:!0},leaving:void 0}),i=n.current.route,a=n.current.forward,o=(0,c.useRef)(void 0),[s,l]=(0,c.useState)(()=>zd(window.location.search)),[u,d]=(0,c.useState)(()=>Bd(window.location.search)),[f,p]=(0,c.useState)(()=>Vd(window.location.search)),m=(0,c.useRef)(f),g=(0,c.useRef)(void 0),_=(0,c.useRef)(void 0),v=(0,c.useRef)(void 0),y=(0,c.useRef)({open:!1,term:``}),b=(0,c.useRef)({open:!1,term:``}),[x,S]=(0,c.useState)(void 0),C=(0,c.useRef)({workspaceId:``,open:!1,term:``}),[w,T]=(0,c.useState)(void 0),ee=(0,c.useRef)(!1),[te,E]=(0,c.useState)(0),D=(0,c.useRef)(void 0),O=(0,c.useRef)(()=>{}),ne=(0,c.useRef)(new Set),re=(0,c.useCallback)(()=>{let e=D.current;if(e===void 0){E(ne.current.size);return}let t=new Set(e.runningSessionsSnapshot());for(let n of e.jobsSnapshot())n.jobs.some(e=>e.status===`running`||e.status===`stopping`)&&t.add(n.sessionId);for(let e of ne.current)t.add(e);E(t.size)},[]);(0,c.useEffect)(()=>()=>{o.current!==void 0&&clearTimeout(o.current)},[]);let A=(0,c.useCallback)(()=>{o.current!==void 0&&clearTimeout(o.current),o.current=window.setTimeout(()=>{r(e=>({current:e.current,leaving:void 0}))},260)},[]),j=(0,c.useCallback)(e=>{r(t=>({current:{route:e,forward:Gd[e.kind]>=Gd[t.current.route.kind]},leaving:t.current})),A()},[A]);(0,c.useEffect)(()=>{let t=new In(void 0,{onUnpaired:e});D.current=t,t.start();let n=t.onFrame(e=>{if(e.type===`session/jobs`||e.type===`session/subscribed`){re();return}if(e.type===`session/event`){let t=e.event.type;(t===`turn/start`||t===`turn/end`)&&re()}});return re(),()=>{n(),t.stop()}},[e,re]),(0,c.useEffect)(()=>{if(i.kind!==`workspaces`||!t)return;let e=!1,n,r=()=>{k().then(({sessionIds:t})=>{e||(ne.current=new Set(t),re())},()=>{})};return r(),n=setInterval(r,3e4),()=>{e=!0,n!==void 0&&clearInterval(n)}},[i.kind,re,t]),(0,c.useEffect)(()=>(t||mr(),()=>{hr()}),[t]),(0,c.useEffect)(()=>{D.current?.observe(i.kind===`chat`?i.session.sessionId:void 0)},[i]),(0,c.useEffect)(()=>{let e=i.kind===`chat`?i.session.sessionId:void 0,n=()=>{oe(e).catch(()=>{})};if(O.current=n,!t){oe(void 0).catch(()=>{});return}if(n(),e===void 0)return;let r=setInterval(n,3e4);return()=>{clearInterval(r)}},[i,t]),(0,c.useEffect)(()=>{let e=()=>{let e=D.current;if(typeof document>`u`||document.visibilityState!==`visible`){e?.pause();return}e?.resync(),O.current()};return document.addEventListener(`visibilitychange`,e),()=>{document.removeEventListener(`visibilitychange`,e)}},[]),(0,c.useEffect)(()=>{let e=!1;return h().then(t=>{if(e)return;let n=(t.namespaces??[]).find(e=>e.ns===`ui-theme`)?.value,r=typeof n==`object`&&n?n.preference:void 0;(r===`light`||r===`dark`||r===`system`)&&Fr(r)},()=>{}),()=>{e=!0}},[]);let ie=e=>{let t=C.current;T(t.workspaceId===e&&t.open?{open:!0,term:t.term}:void 0)},ae=(0,c.useCallback)(()=>{ee.current?S({...b.current}):(i.kind===`chat`&&i.workspace.workspaceId!==Rd.workspaceId||i.kind===`settings`)&&ie(i.workspace.workspaceId),r(e=>{let t=e.current.route;return t.kind===`chat`?ee.current?(ee.current=!1,{current:{route:{kind:`workspaces`},forward:!1},leaving:e.current}):t.fromRunOverview===!0?{current:{route:{kind:`run-overview`},forward:!1},leaving:e.current}:t.workspace.workspaceId===Rd.workspaceId?{current:{route:{kind:`workspaces`},forward:!1},leaving:e.current}:{current:{route:{kind:`sessions`,workspace:t.workspace},forward:!1},leaving:e.current}:t.kind===`run-overview`?{current:{route:{kind:`workspaces`},forward:!1},leaving:e.current}:t.kind===`settings`?{current:t.workspace.workspaceId===Rd.workspaceId?{route:{kind:`workspaces`},forward:!1}:{route:{kind:`sessions`,workspace:t.workspace},forward:!1},leaving:e.current}:t.kind===`sessions`?{current:{route:{kind:`workspaces`},forward:!1},leaving:e.current}:e}),A()},[i,A]),M=(0,c.useCallback)((e,t,n,r,i,a)=>{j({kind:`chat`,session:e,workspace:t,...n===void 0?{}:{focusSeq:n},...i===void 0?{}:{focusMessageId:i},...a===void 0?{}:{focusPartId:a},...r===void 0?{}:{focusQuery:r}}),d(void 0),p(void 0),n!==void 0&&(m.current=void 0),r!==void 0&&(g.current=void 0),i!==void 0&&(_.current=void 0),a!==void 0&&(v.current=void 0)},[j]),N=(0,c.useCallback)(e=>{if(s!==void 0||u!==void 0){let e=new URL(window.location.href);e.searchParams.delete(`workspace`),e.searchParams.delete(`session`),e.searchParams.delete(`seq`),window.history.replaceState(null,``,`${e.pathname}${e.search}${e.hash}`),l(void 0)}j({kind:`sessions`,workspace:e})},[s,u,j]),se=(0,c.useCallback)((e,t,n,r,i,a)=>{ee.current=!0,b.current={...y.current},l(t),d(e),p(n),m.current=n,g.current=r,_.current=i,v.current=a,j({kind:`workspaces`})},[j]),ce=(0,c.useCallback)((e,t,n,r,i)=>{ee.current=!0,b.current={...y.current};let a={sessionId:e.sessionId,title:e.title??`匹配会话`,...e.snippet!==void 0&&e.snippet!==``?{preview:e.snippet}:{},updatedAt:0,running:!1,blank:!1};j({kind:`chat`,session:a,workspace:Rd,...t===void 0?{}:{focusSeq:t},...r===void 0?{}:{focusMessageId:r},...i===void 0?{}:{focusPartId:i},...n===void 0?{}:{focusQuery:n}})},[j]),le=(0,c.useCallback)(e=>{let t={sessionId:e.sessionId,title:e.title??`会话`,updatedAt:0,running:!1,blank:!1};j({kind:`chat`,session:t,workspace:Rd,fromRunOverview:!0})},[j]),ue=i.kind===`chat`?`chat:${i.session.sessionId}`:i.kind===`sessions`?`sessions:${i.workspace.workspaceId}`:i.kind,de=n.leaving===void 0?``:n.leaving.route.kind===`chat`?`chat:${n.leaving.route.session.sessionId}`:n.leaving.route.kind===`sessions`?`sessions:${n.leaving.route.workspace.workspaceId}`:n.leaving.route.kind,fe=a?`fwd`:`back`,P=e=>e.kind===`workspaces`?(0,G.jsx)(Ad,{initialWorkspaceId:s,initialSearch:x,onPick:N,onLocateSession:se,onOpenDirect:ce,onOpenSettings:()=>{j({kind:`settings`,workspace:Rd})},onOpenRunOverview:()=>{j({kind:`run-overview`})},runOverviewLive:te,onSearchSnapshot:(e,t)=>{y.current={open:e,term:t}},onSearchApplied:()=>{S(void 0)}}):e.kind===`run-overview`?(0,G.jsx)(ql,{mux:D.current,onBack:ae,onOpenSession:le}):e.kind===`sessions`?(0,G.jsx)(du,{workspace:e.workspace,mux:D.current,initialSessionId:u,initialSearch:w,onBack:ae,onPick:t=>{M(t,e.workspace,m.current,g.current,_.current,v.current)},onOpenSettings:()=>{j({kind:`settings`,workspace:e.workspace})},onLocateSession:se,onPickSeq:(t,n,r,i,a)=>{M(t,e.workspace,n,r,i,a)},onSearchSnapshot:(t,n)=>{C.current={workspaceId:e.workspace.workspaceId,open:t,term:n}},onSearchApplied:()=>{T(void 0)}}):e.kind===`settings`?(0,G.jsx)(ud,{onBack:ae}):(0,G.jsx)(zl,{session:e.session,initialFocusSeq:e.focusSeq,initialFocusMessageId:e.focusMessageId,initialFocusPartId:e.focusPartId,initialFocusQuery:e.focusQuery,mux:D.current,onBack:ae,showToolCalls:!0,showSystemMessages:!1});return(0,G.jsxs)(`div`,{className:`mobile`,children:[(0,G.jsxs)(`div`,{className:`page-stage`,children:[n.leaving!==void 0&&(0,G.jsx)(`div`,{className:`page page-exit-${fe}`,"aria-hidden":`true`,children:P(n.leaving.route)},de),(0,G.jsx)(`div`,{className:`page page-enter-${fe}`,children:P(i)},ue)]}),(0,G.jsx)(Hi,{})]})}function $(e){return e instanceof d?e.error.message:e instanceof u||e instanceof Error?e.message:String(e)}function Zd(e){return/^HTTP 403/.test(e)?`宿主端插件可能仍在运行旧版本：请重启 dsh web 后再试。`:void 0}function Qd(e,t){let n=e.events.map(e=>({...e.event,...e.view===void 0?{}:{view:e.view}})),r=new Dt(_t(n)),i=Me(n),a=vt(n);return{rows:r.snapshot(),maxSeq:r.lastSeq,hasMore:e.hasMore,...i===void 0?{}:{todo:i},...t&&a!==void 0?{turnStartAt:a}:{},...e.projections===void 0?{}:{projections:e.projections}}}async function $d(e,t,n){let r=t===void 0,i;try{let a=await N(e,t,void 0,n);i={rows:a.rows,maxSeq:a.maxSeq,hasMore:a.hasMore,...a.todo===void 0?{}:{todo:a.todo},...a.projections===void 0?{}:{projections:a.projections},...r&&a.turnStartAt!==void 0?{turnStartAt:a.turnStartAt}:{}}}catch{i=Qd(await M(e,t,void 0,n),r)}return r&&Ni(e,i),i}var ef=class e extends c.Component{state={reason:null};static getDerivedStateFromError(t){return{reason:e.readable(t)}}static readable(e){let t=(tf(e)&&e.message!==``?e.message:String(e??`unknown error`)).replace(/\s+/g,` `).trim();return t.length<=240?t:`${t.slice(0,239)}…`}componentDidCatch(e,t){U({kind:`error`,message:this.state.reason??`unknown error`,stack:tf(e)?e.stack:void 0})}retry=()=>{this.setState({reason:null})};reload=()=>{typeof window<`u`&&window.location.reload()};render(){let e=this.state.reason;return e===null?this.props.children:(0,G.jsxs)(`main`,{className:`mobile mobile-empty mobile-errorpage`,role:`alert`,children:[(0,G.jsx)(`h1`,{className:`errorpage-title`,children:`页面出错了`}),(0,G.jsx)(`p`,{className:`errorpage-reason`,children:e}),(0,G.jsxs)(`div`,{className:`errorpage-actions`,children:[(0,G.jsx)(`button`,{type:`button`,className:`mobile-button`,onClick:this.retry,children:`重试`}),(0,G.jsx)(`button`,{type:`button`,className:`mobile-button-muted`,onClick:this.reload,children:`重新加载`})]})]})}};function tf(e){return e instanceof Error}async function nf(e=typeof navigator>`u`?void 0:navigator.serviceWorker){if(e!==void 0)try{await e.register(`/m/service-worker.js`,{scope:`/m/`,updateViaCache:`none`})}catch{}}Ir(),$n();const rf=document.createElement(`style`);rf.dataset.plugin=`dsh-palm/mobile`,rf.textContent=`/* ── design tokens ───────────────────────────────────────────────────── */

:root {
  /* surfaces */
  --bg-page: #f5f5f7;
  --bg-surface: #ffffff;
  --bg-elevated: #f1f1f4;
  --bg-input: #ffffff;
  --dialog-bg: #ffffff;
  --toast-bg: #1a1a2e;
  --toast-text: #ffffff;
  /* text ladder */
  --text-primary: #1a1a2e;
  --text-secondary: #4a4a5a;
  --text-tertiary: #6a6a7a;
  --text-quaternary: #9a9aaa;
  --text-muted: #b0b0c0;
  /* borders */
  --border-default: #e2e4e8;
  --border-subtle: #f0f0f2;
  --border-focus: #6366f1;
  /* accent + status */
  --accent: #6366f1;
  --accent-contrast: #ffffff;
  --accent-soft: rgba(99, 102, 241, 0.1);
  --accent-glow: rgba(99, 102, 241, 0.2);
  --positive: #22c55e;
  --warning: #f59e0b;
  --danger: #ef4444;
  --danger-soft: rgba(239, 68, 68, 0.1);
  /* unified card spec */
  --card-bg: #ffffff;
  --card-border: #e8e8ed;
  --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 28px rgba(16, 24, 40, 0.16);
  /* interaction washes */
  --fill: rgba(26, 26, 46, 0.05);
  --fill-strong: rgba(26, 26, 46, 0.09);
  /* code blocks: clearly darker than the page so the panel reads at a
     glance (light: #e8ecf2 body + #dfe4ec head bar; github-light tokens) */
  --code-bg: #e8ecf2;
  --code-text: #3a3f52;
  --code-border: #d0d7de;
  --code-head-bg: #dfe4ec;
  --code-head-border: #d0d7de;
  /* syntax tokens (one-light palette: warm triad — purple keywords, green
     strings, orange-gold numbers/types — reads clearly on small screens) */
  --tok-keyword: #a626a4;
  --tok-string: #50a14f;
  --tok-comment: #a0a1a7;
  --tok-number: #986801;
  --tok-type: #e45649;
  --tok-func: #4078f2;
  --tok-prop: #986801;
  /* diff view */
  --diff-add: #22c55e;
  --diff-del: #ef4444;
  --diff-add-bg: rgba(34, 197, 94, 0.12);
  --diff-del-bg: rgba(239, 68, 68, 0.12);
  --diff-add-word: rgba(34, 197, 94, 0.22);
  --diff-del-word: rgba(239, 68, 68, 0.22);
  /* chrome */
  --backdrop: rgba(15, 18, 34, 0.45);
  --header-bg: rgba(245, 245, 247, 0.97);
  /* type */
  --font-sans: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'PingFang SC', 'Noto Sans SC', 'Segoe UI', sans-serif;
  --font-mono: 'SF Mono', 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  /* radii ladder */
  --radius-chip: 10px;
  --radius-card: 14px;
  --radius-sheet: 20px;
  --radius-menu: 12px;
  --radius-capsule: 24px;
  --radius-full: 9999px;
  /* spacing ladder (4px base) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  /* type scale */
  --text-xs: 11px;
  --text-sm: 12px;
  --text-md: 13px;
  --text-base: 15px;
  --text-lg: 16.5px;
}

/* Explicit dark: pinned by the toggle, the settings sheet, or the host. */
:root[data-theme='dark'] {
  --bg-page: #0a0a0f;
  --bg-surface: #13131a;
  --bg-elevated: #1c1c28;
  --bg-input: #16161f;
  --dialog-bg: #1c1c28;
  --toast-bg: #2a2a3a;
  --toast-text: #f0f0f5;
  --text-primary: #f0f0f5;
  --text-secondary: #a0a0b0;
  --text-tertiary: #6a6a7a;
  --text-quaternary: #4a4a5a;
  --text-muted: #3a3a4a;
  --border-default: #2a2a3a;
  --border-subtle: #1e1e2a;
  --border-focus: #3a3a50;
  --accent: #6366f1;
  --accent-contrast: #ffffff;
  --accent-soft: rgba(99, 102, 241, 0.15);
  --accent-glow: rgba(99, 102, 241, 0.3);
  --positive: #4ade80;
  --warning: #fbbf24;
  --danger: #f87171;
  --danger-soft: rgba(248, 113, 113, 0.14);
  --card-bg: #13131a;
  --card-border: #1e1e2a;
  --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  --shadow-lg: 0 8px 28px rgba(0, 0, 0, 0.5);
  --fill: rgba(240, 240, 245, 0.06);
  --fill-strong: rgba(240, 240, 245, 0.1);
  --code-bg: #161b22;
  --code-text: #b8bad0;
  --code-border: #30363d;
  --code-head-bg: #1c2128;
  --code-head-border: #30363d;
  /* syntax tokens (one-dark palette) */
  --tok-keyword: #c678dd;
  --tok-string: #98c379;
  --tok-comment: #5c6370;
  --tok-number: #d19a66;
  --tok-type: #e5c07b;
  --tok-func: #61afef;
  --tok-prop: #d19a66;
  --diff-add: #4ade80;
  --diff-del: #f87171;
  --diff-add-bg: rgba(74, 222, 128, 0.12);
  --diff-del-bg: rgba(248, 113, 113, 0.12);
  --diff-add-word: rgba(74, 222, 128, 0.25);
  --diff-del-word: rgba(248, 113, 113, 0.25);
  --backdrop: rgba(0, 0, 0, 0.6);
  --header-bg: rgba(10, 10, 15, 0.96);
}

/* System mode: the OS scheme decides while no palette is pinned. */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    --bg-page: #0a0a0f;
    --bg-surface: #13131a;
    --bg-elevated: #1c1c28;
    --bg-input: #16161f;
    --dialog-bg: #1c1c28;
    --toast-bg: #2a2a3a;
    --toast-text: #f0f0f5;
    --text-primary: #f0f0f5;
    --text-secondary: #a0a0b0;
    --text-tertiary: #6a6a7a;
    --text-quaternary: #4a4a5a;
    --text-muted: #3a3a4a;
    --border-default: #2a2a3a;
    --border-subtle: #1e1e2a;
    --border-focus: #3a3a50;
    --accent: #6366f1;
    --accent-contrast: #ffffff;
    --accent-soft: rgba(99, 102, 241, 0.15);
    --accent-glow: rgba(99, 102, 241, 0.3);
    --positive: #4ade80;
    --warning: #fbbf24;
    --danger: #f87171;
    --danger-soft: rgba(248, 113, 113, 0.14);
    --card-bg: #13131a;
    --card-border: #1e1e2a;
    --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    --shadow-lg: 0 8px 28px rgba(0, 0, 0, 0.5);
    --fill: rgba(240, 240, 245, 0.06);
    --fill-strong: rgba(240, 240, 245, 0.1);
    --code-bg: #161b22;
    --code-text: #b8bad0;
    --code-border: #30363d;
    --code-head-bg: #1c2128;
    --code-head-border: #30363d;
    /* syntax tokens (one-dark palette, system mode) */
    --tok-keyword: #c678dd;
    --tok-string: #98c379;
    --tok-comment: #5c6370;
    --tok-number: #d19a66;
    --tok-type: #e5c07b;
    --tok-func: #61afef;
    --tok-prop: #d19a66;
    --diff-add: #4ade80;
    --diff-del: #f87171;
    --diff-add-bg: rgba(74, 222, 128, 0.08);
    --diff-del-bg: rgba(248, 113, 113, 0.08);
    --diff-add-word: rgba(74, 222, 128, 0.25);
    --diff-del-word: rgba(248, 113, 113, 0.25);
    --backdrop: rgba(0, 0, 0, 0.6);
    --header-bg: rgba(10, 10, 15, 0.96);
  }
}

/* ── base + mobile-browser hardening ─────────────────────────────────── */

* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  /* 长按不弹系统菜单 */
  -webkit-touch-callout: none;
}

html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  background: var(--bg-page);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: 400;
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
  overscroll-behavior-y: contain;
  /* 禁止选中文字；输入框单独放开 */
  user-select: none;
  -webkit-user-select: none;
}

input,
textarea {
  user-select: text;
  -webkit-user-select: text;
  font-size: 16px; /* ≥16px：防止 iOS 聚焦时页面缩放 */
}

::selection {
  background: var(--accent-soft);
}

/* Theme swap: every color property eases over 300ms. */
body,
.mobile-header,
.mobile-row,
.chat-msg,
.chat-input,
.chat-inputbar,
.sheet,
.dialog,
.settings-group,
.seg,
.toast,
.code-block,
.diff-block,
.code-head,
.diff-head,
.code-body,
.diff-row,
.code-run {
  transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
}

/* The app fills exactly one viewport: the page itself never scrolls, each
   view owns its scroll region and the chat composer stays pinned. vh first:
   dynamic-viewport units are not supported by older WebViews (WeChat etc.),
   where the vh fallback keeps the layout intact. */
#root {
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.mobile {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.mobile-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  padding-bottom: 24px;
}

/* Thin, quiet scrollbars. */
.mobile-scroll::-webkit-scrollbar,
.mobile-list::-webkit-scrollbar,
.chat-scroll::-webkit-scrollbar,
.sheet-body::-webkit-scrollbar,
.code-block pre::-webkit-scrollbar {
  width: 3px;
  height: 3px;
}

.mobile-scroll::-webkit-scrollbar-thumb,
.mobile-list::-webkit-scrollbar-thumb,
.chat-scroll::-webkit-scrollbar-thumb,
.sheet-body::-webkit-scrollbar-thumb,
.code-block pre::-webkit-scrollbar-thumb {
  background: var(--border-default);
  border-radius: var(--radius-full);
}

/* ── page transitions: parallax push / pop (250ms) ───────────────────── */

.page-stage {
  position: relative;
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-enter-fwd {
  animation: page-in-fwd 0.25s ease-out both;
}

.page-exit-fwd {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  pointer-events: none;
  animation: page-out-fwd 0.25s ease-out both;
}

.page-enter-back {
  animation: page-in-back 0.25s ease-out both;
}

.page-exit-back {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  pointer-events: none;
  animation: page-out-back 0.25s ease-out both;
}

@keyframes page-in-fwd {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: none;
    opacity: 1;
  }
}

@keyframes page-out-fwd {
  from {
    transform: none;
    opacity: 1;
  }
  to {
    /* End fully transparent and off-stage: an opacity-only fade to 0.8 +
       fill-mode both left the leaving page ghosting through the frost-glass
       header on forward navigations (search-hit locate), producing a
       stacked double-image. Match the back direction: disappear entirely. */
    transform: translateX(-100%);
    opacity: 0;
  }
}

@keyframes page-in-back {
  from {
    transform: translateX(-30%);
    opacity: 0.8;
  }
  to {
    transform: none;
    opacity: 1;
  }
}

@keyframes page-out-back {
  from {
    transform: none;
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* ── header: 48px + safe-area, frosted glass ─────────────────────────── */

.mobile-header {
  position: sticky;
  top: 0;
  z-index: 10;
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-1);
  padding: calc(env(safe-area-inset-top, 0px) + 4px) 4px 4px;
  min-height: calc(48px + env(safe-area-inset-top, 0px));
  background: var(--header-bg);
  /* No backdrop-filter here: the sticky header sits over the scrolling
     message list, and blur is the most expensive compositing operation on
     mobile — every scroll frame would re-sample the background. The header
     background is near-opaque instead (see --header-bg), which reads the
     same while scrolling stays cheap. */
  border-bottom: 1px solid var(--border-subtle);
}

.mobile-headerSlot {
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 48px;
}

.mobile-headerSlot-right {
  justify-content: flex-end;
}

.mobile-title {
  margin: 0;
  font-size: 17px;
  font-weight: 500;
  color: var(--text-primary);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-titleWrap {
  min-width: 0;
}

.mobile-titleInline {
  display: block;
}

/* Path metadata: small, mono, subordinate — never competing with the title. */
.mobile-titlePath {
  margin: 1px 0 0;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 400;
  line-height: 1.3;
  color: var(--text-quaternary);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── icon buttons (48px hot zones) ───────────────────────────────────── */

.mobile-back,
.mobile-theme-toggle,
.mobile-iconbtn {
  flex: none;
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-chip);
  background: transparent;
  color: var(--text-secondary);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  transition: background-color 0.12s ease, color 0.12s ease, transform 0.1s ease;
}

.mobile-back:active,
.mobile-theme-toggle:active,
.mobile-iconbtn:active {
  background: var(--fill);
  transform: scale(0.94);
}

.mobile-theme-toggle svg,
.mobile-iconbtn svg {
  width: 20px;
  height: 20px;
}

.mobile-headerAction {
  flex: none;
  height: 44px;
  padding: 0 12px;
  border: none;
  border-radius: var(--radius-chip);
  background: transparent;
  color: var(--accent);
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.12s ease;
}

.mobile-headerAction:active {
  background: var(--accent-soft);
}

/* ── quick actions bar ───────────────────────────────────────────────── */

.mobile-quickbar {
  flex: none;
  display: flex;
  gap: var(--space-2);
  padding: 10px 16px 6px;
  overflow-x: auto;
  scrollbar-width: none;
}

.mobile-quickbar::-webkit-scrollbar {
  display: none;
}

.mobile-quickchip {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  border: 1px solid var(--border-default);
  border-radius: 18px;
  background: var(--bg-elevated);
  color: var(--text-secondary);
  font: inherit;
  font-size: var(--text-md);
  font-weight: 400;
  cursor: pointer;
  transition: background-color 0.12s ease, color 0.12s ease, border-color 0.12s ease, transform 0.1s ease;
}

.mobile-quickchip svg {
  width: 15px;
  height: 15px;
}

.mobile-quickchip:active {
  transform: scale(0.96);
  background: var(--fill-strong);
}

.mobile-quickchip-on {
  border-color: transparent;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 500;
}

/* Run-overview quick chip: live dot pulses while anything is running and
   the live count rides beside the label (same chip grammar as pin/recent). */
.mobile-quickchip-live {
  border-color: color-mix(in srgb, var(--positive) 40%, transparent);
  color: var(--text-primary);
}

.quick-live-dot {
  flex: none;
  width: 7px;
  height: 7px;
  border-radius: var(--radius-full);
  background: var(--positive);
  animation: breathe 1.6s ease-in-out infinite;
}

.quick-live-dot-off {
  background: var(--text-quaternary);
  animation: none;
}

.quick-live-count {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: var(--positive);
}

.mobile-search {
  flex: none;
  padding: 6px 16px 8px;
}

.mobile-searchInput {
  width: 100%;
  height: 40px;
  padding: 0 14px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  background: var(--bg-input);
  color: var(--text-primary);
  font: inherit;
  font-size: 16px;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.mobile-searchInput:focus {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

/* ── grouped lists + group titles ────────────────────────────────────── */

.mobile-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  list-style: none;
  margin: 0;
  padding: 4px 0 calc(env(safe-area-inset-bottom, 0px) + 16px);
}

.mobile-groupTitle {
  height: 32px;
  padding: 0 16px;
  display: flex;
  align-items: flex-end;
  padding-bottom: 4px;
  margin-bottom: 8px;
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* ── THE unified card ──────────────────────────────────────────────────
   One spec for every list card: full-width of the 16px-inset column,
   14px radius, --card-bg/--card-border/--card-shadow, press scale 0.98
   + 5% lighten over 100ms. Internal alignment grid: 48px icon zone ·
   fluid text · ≥48px right action zone (right-aligned, never drifts). */

.mobile-row {
  position: relative;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-3);
  /* <button> is shrink-to-fit on width:auto — pin the card to the 16px-inset column. */
  width: calc(100% - 32px);
  margin: 0 16px 8px;
  padding: 0 16px;
  min-height: 72px;
  border: 1px solid var(--card-border);
  border-radius: var(--radius-card);
  background: var(--card-bg);
  box-shadow: var(--card-shadow);
  color: var(--text-primary);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: transform 0.1s ease, background-color 0.1s ease, border-color 0.1s ease, box-shadow 0.1s ease, color 0.3s ease;
}

@media (hover: hover) {
  .mobile-row:hover {
    box-shadow: var(--shadow-lg);
  }
}

/* 按压态：scale(0.98) + 背景变亮 5% */
.mobile-row:active {
  transform: scale(0.98);
  background: color-mix(in srgb, var(--text-primary) 5%, var(--card-bg));
  border-color: var(--border-default);
}

/* ── swipe-to-delete wrapper ────────────────────────────────────────────
   The row lives inside a swipe wrapper: a left swipe translates the inner
   (row) left to reveal the delete action behind it. The wrapper owns the
   card's margin/radius; the row inside drops its own so the reveal edge
   stays flush. The translate lives on the inner (not the row) so the row's
   :active press-scale never fights the swipe offset. */
.mobile-row-swipe {
  position: relative;
  margin: 0 16px 8px;
  border-radius: var(--radius-card);
  overflow: hidden;
}
.mobile-row-swipe .mobile-row {
  margin: 0;
  width: 100%;
  border-radius: 0;
}
.mobile-row-swipe-action {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--danger);
  color: #fff;
  font: inherit;
  font-size: var(--text-md);
  font-weight: 500;
  cursor: pointer;
}
.mobile-row-swipe-inner {
  transition: transform 0.2s ease;
}
.mobile-row-swipe-inner.swiped {
  transform: translateX(-80px);
}

/* 按压态：滑动行的正后方就是那条常驻的红色删除按钮（.mobile-row-swipe-action），
   而全局的 .mobile-row:active 会把卡片缩到 98%——右缘于是漏出一条红边，每一次
   点击都闪一下，看起来像"删除按钮冒出来了"（见 swipe-active-probe 探针）。这里
   只取消缩放，保留上文的变亮/描边按压反馈。 */
.mobile-row-swipe .mobile-row:active {
  transform: none;
}

/* iOS 主屏安装提示（设置 → 设备，见 ios-install-hint.tsx）：一行说明 + 一个小
   按钮，只在 iOS Safari 且尚未装到主屏时出现。 */
.settings-installHint {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.settings-installHint-btn {
  flex: none;
  padding: 4px 10px;
  border: 1px solid var(--mobile-line, rgba(128, 128, 128, 0.35));
  border-radius: 999px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 13px;
}

/* 上报性能数据（设置 → 通用，见 perf-report.tsx）：两个小按钮并排。 */
.settings-perfActions {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 6px;
}

/* Icon zone: a fixed 48px column; the icon itself is 40px. */
.card-icon,
.ws-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon > *,
.ws-icon > * {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
}

.ws-icon svg,
.card-icon svg {
  width: 19px;
  height: 19px;
}

/* Icon tints per project kind. */
.ws-icon-active > * {
  background: color-mix(in srgb, var(--positive) 15%, transparent);
  color: var(--positive);
}

.ws-icon-code > * {
  background: var(--accent-soft);
  color: var(--accent);
}

.ws-icon-test > * {
  background: color-mix(in srgb, var(--warning) 15%, transparent);
  color: var(--warning);
}

/* Content zone. */
.card-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  padding: 12px 0;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.35;
}

.card-titleText {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-subtitle {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 400;
  line-height: 1.4;
  color: var(--text-quaternary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-desc {
  margin: 0;
  font-size: var(--text-md);
  color: var(--text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Right action zone: right-aligned, min 48px, always in the same place. */
.card-action {
  min-width: 48px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.card-badge {
  padding: 4px 10px;
  border-radius: var(--radius-chip);
  background: var(--bg-elevated);
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  font-weight: 400;
  line-height: 1.3;
  white-space: nowrap;
}

.mobile-chevron {
  flex: none;
  color: var(--text-quaternary);
  font-size: 18px;
  line-height: 1;
}

/* Legacy column layout still used by a few stacked rows (settings forms). */
.mobile-rowMain {
  grid-column: 1 / -1;
  min-width: 0;
  padding: 14px 0;
}

.mobile-rowBottom {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.mobile-rowTitle {
  flex: 1;
  min-width: 0;
  white-space: normal;
  overflow-wrap: anywhere;
  font-size: var(--text-base);
  font-weight: 500;
  line-height: 1.4;
}

.mobile-rowMeta {
  flex: 1;
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  font-weight: 400;
  overflow-wrap: anywhere;
}

/* Active workspace: 3px accent rail + tinted icon. */
.mobile-row-active {
  border-color: color-mix(in srgb, var(--accent) 38%, var(--card-border));
}

.mobile-row-active::before {
  content: '';
  position: absolute;
  left: -1px;
  top: 14px;
  bottom: 14px;
  width: 3px;
  border-radius: var(--radius-full);
  background: var(--accent);
}

.ws-pin {
  flex: none;
  display: flex;
  color: var(--warning);
}

.ws-pin svg {
  width: 12px;
  height: 12px;
}

.sess-dot {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--text-muted);
}

.sess-dot-running {
  background: var(--positive);
  animation: pulse 2s infinite ease-in-out;
}

/* Title line: title · time merged on one truncating line. */
.sess-titleline {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
}

.sess-title {
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.4;
}

.sess-sep {
  flex: none;
  color: var(--text-muted);
  font-size: var(--text-xs);
}

.sess-time {
  /* 不可压缩：原来是 flex: 0 1 auto + min-width:0 + ellipsis，标题一长就把日期
     挤成 "09-1…"（真机截图）。标题本来就该承担压缩（它已经显示成 "子代理状态展…"），
     日期必须完整可读 —— 只读信息不该被省略号吃掉。 */
  flex: none;
  white-space: nowrap;
  font-size: var(--text-xs);
  color: var(--text-quaternary);
  font-variant-numeric: tabular-nums;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(0.85);
    opacity: 0.6;
  }
}

/* ── dashed create card ──────────────────────────────────────────────── */

.mobile-createCard {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: calc(100% - 32px);
  margin: 4px 16px 16px;
  min-height: 56px;
  border: 1.5px dashed var(--border-default);
  border-radius: var(--radius-card);
  background: transparent;
  color: var(--text-secondary);
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease, transform 0.1s ease;
}

.mobile-createCard svg {
  width: 16px;
  height: 16px;
}

.mobile-createCard:active {
  transform: scale(0.98);
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-soft);
}

/* ── settings ────────────────────────────────────────────────────────── */

/* Source badges: where a setting takes effect / can be changed. */
.settings-badge {
  display: inline-block;
  font-size: 10px;
  line-height: 1;
  padding: 3px 6px;
  border-radius: 5px;
  font-weight: 500;
  flex-shrink: 0;
  vertical-align: middle;
}
.settings-badge-phone { background: #e8f7ee; color: #1a9e5c; }
.settings-badge-sync { background: var(--accent-soft, #eef1ff); color: var(--accent, #4d6bfe); }
.settings-badge-desktop { background: #f3f4f6; color: #9aa0a8; }
.settings-badge-ro { background: #fdf0f0; color: #e5484d; }
.settings-badge-recommend { background: #fff4e5; color: #e8890c; }

/* Channel-setup disclosure (channel setup helper): native details chrome
   kept minimal so the steps read as plain description text. */
.settings-details {
  margin: 6px 0 2px;
}
.settings-details summary {
  display: inline-block;
  font-size: 12px;
  color: var(--accent, #4d6bfe);
  cursor: pointer;
  padding: 2px 0;
}
.settings-details summary::-webkit-details-marker { display: none; }
.settings-details .settings-detailsBody {
  font-size: 12px;
  color: var(--text-tertiary);
  line-height: 1.7;
  margin: 4px 0 0;
  padding-left: 12px;
  border-left: 2px solid var(--accent-soft, #eef1ff);
}

/* Notification inbox rows: kind pill + title + time on one line, body below. */
.settings-inbox {
  display: flex;
  flex-direction: column;
}
.settings-inboxRow {
  display: block;
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  padding: 10px 0;
  border-bottom: 1px solid var(--border, #e5e7eb);
  cursor: pointer;
}
.settings-inboxRow:disabled {
  opacity: 0.5;
  cursor: default;
}
.settings-inboxRow:last-child {
  border-bottom: 0;
}
.settings-inboxLine {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
  min-width: 0;
}
/* Body lines may carry long unwrapped tokens (command lines, Windows
   paths); wrap them anywhere instead of blowing the row width, and cap
   the preview at two lines so the inbox stays visually tidy. */
.settings-inboxRow .card-desc {
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-width: 0;
}
.settings-inboxKind {
  flex-shrink: 0;
  font-size: 10px;
  line-height: 1;
  padding: 2px 5px;
  border-radius: 4px;
  font-weight: 500;
}
.settings-inboxKind-task-done { background: #e8f7ee; color: #1a9e5c; }
.settings-inboxKind-task-failed { background: #fdf0f0; color: #e5484d; }
.settings-inboxKind-todo-done { background: #eaf3ff; color: #2f6fed; }
.settings-inboxKind-turn-done { background: var(--accent-soft, #eef1ff); color: var(--accent, #4d6bfe); }
.settings-inboxTitle {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}
.settings-inboxTime {
  flex-shrink: 0;
  font-size: 10.5px;
  color: var(--text-tertiary);
}

/* Channel credential presence label (push-channel fields). */
.settings-channelState {
  display: inline-block;
  font-size: 10.5px;
  line-height: 1;
  padding: 3px 6px;
  border-radius: 4px;
  background: #f3f4f6;
  color: #9aa0a8;
  margin-top: 2px;
}
.settings-channelState-on {
  background: #e8f7ee;
  color: #1a9e5c;
}

/* First-run welcome card: one-shot onboarding hint above the roster. */
.mobile-welcome {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 10px 14px 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--accent-soft, #eef1ff);
  border: 1px solid var(--accent-border, #dbe1ff);
}
.mobile-welcomeCopy { flex: 1; min-width: 0; }
.mobile-welcomeTitle {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 3px;
}
.mobile-welcomeDesc {
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
  overflow-wrap: anywhere;
}
.mobile-welcomeClose {
  flex-shrink: 0;
  border: 0;
  background: transparent;
  color: var(--accent, #4d6bfe);
  font-size: 12px;
  font-weight: 500;
  padding: 4px 2px;
  cursor: pointer;
}

/* Legend under the search box explaining the badges. Two-column grid:
   badge column fixed, text column left-aligned — every explanation starts
   at the same x, and the rows never reflow into ragged starts. */
.settings-legend {
  display: grid;
  grid-template-columns: 56px 1fr;
  column-gap: 8px;
  row-gap: 6px;
  align-items: center;
  margin: 0 16px 12px;
  font-size: 10.5px;
  color: var(--text-tertiary);
}
.settings-legend .settings-badge {
  justify-self: start;
}

/* Group title trailing hint (e.g. 显示效果). */
.settings-groupDesc {
  font-weight: 400;
  font-size: 10.5px;
  color: var(--text-tertiary);
  text-transform: none;
  letter-spacing: 0;
  margin-left: 4px;
}

/* Host-side voice services hint on the voice page. */
.settings-hostNote {
  margin: 0 16px 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--accent-soft, #eef1ff);
  color: var(--accent, #4d6bfe);
  font-size: 12px;
  line-height: 1.5;
}

/* Section sub-heading inside a page (e.g. 桌面端配置（只读）). */
.settings-subhead {
  margin: 14px 16px 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
}

/* Read-only tag on host-side rows. */
.settings-roTag {
  display: inline-block;
  font-size: 10px;
  line-height: 1;
  padding: 2px 5px;
  border-radius: 4px;
  background: #f3f4f6;
  color: #9aa0a8;
  vertical-align: middle;
}

/* Collapsible read-only field block (replaces disabled controls). */
.settings-roBlock {
  margin-top: 10px;
  border-top: 1px dashed var(--card-border);
  padding-top: 10px;
}
.settings-roSummary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border: 1px dashed var(--card-border);
  border-radius: 10px;
  padding: 10px 12px;
  background: var(--bg-subtle, #fafbfc);
  color: var(--text-secondary);
  font-size: 12.5px;
  cursor: pointer;
}
.settings-roToggle {
  color: var(--accent, #4d6bfe);
  font-weight: 500;
}
.settings-roList {
  margin-top: 8px;
}
.settings-roItem {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 7px 2px;
  font-size: 12.5px;
  border-bottom: 1px solid var(--card-border);
}
.settings-roItem:last-child { border-bottom: none; }
/* The key column must be able to give way: while it was shrink 0 the item kept
   its max-content width, which overflow-wrap alone cannot lower. */
.settings-roKey {
  color: var(--text-tertiary);
  flex-shrink: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}
.settings-roValue {
  color: var(--text-primary);
  font-weight: 500;
  text-align: right;
  word-break: break-all;
}

.settings-group {
  list-style: none;
  margin: 0 16px 16px;
  padding: 0;
  border: 1px solid var(--card-border);
  border-radius: var(--radius-card);
  background: var(--card-bg);
  box-shadow: var(--card-shadow);
  overflow: hidden;
}

.settings-groupTitle {
  height: 32px;
  padding: 0 16px;
  margin: 0;
  display: flex;
  align-items: flex-end;
  padding-bottom: 2px;
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Settings rows ride the unified card grid at the small-card tier. */
.settings-row {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-3);
  min-height: 56px;
  padding: 0 16px;
  border-bottom: 1px solid var(--border-subtle);
  font-size: var(--text-base);
  color: var(--text-primary);
}

/* Inside a settings group the card loses its own inset. */
.settings-group .mobile-row {
  margin: 0;
  width: 100%;
  border: none;
  border-bottom: 1px solid var(--border-subtle);
  border-radius: 0;
  box-shadow: none;
}

.settings-group .mobile-row:last-child {
  border-bottom: none;
}

.settings-row:last-child {
  border-bottom: none;
}

/* Rows that open a picker render as <button>; keep the row look. */
button.settings-row {
  width: 100%;
  border: none;
  border-bottom: 1px solid var(--border-subtle);
  background: transparent;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.1s ease;
}

button.settings-row:active {
  background: var(--fill);
}

button.settings-row:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--accent);
}

.settings-row .card-icon > * {
  background: var(--bg-elevated);
  color: var(--text-secondary);
}

.settings-rowValue {
  color: var(--text-quaternary);
  font-size: var(--text-md);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.settings-note {
  padding: 10px 16px 12px;
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  line-height: 1.5;
}

/* Per-provider usage/quota card (settings 用量 group). */
.usage-provider {
  padding: 14px 16px;
  border-bottom: 1px dashed var(--card-border);
}
.usage-provider:last-child {
  border-bottom: none;
}
.usage-providerHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}
.usage-providerName {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-weight: 600;
  font-size: var(--text-base);
  color: var(--text-primary);
  /* Provider ids come from the host: wrap a long one instead of letting it
     spill past the card and overlap the status badge. */
  overflow-wrap: anywhere;
}
.usage-providerBase {
  font-size: 11px;
  font-weight: 400;
  color: var(--text-quaternary);
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.usage-badge {
  flex: none;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 6px;
  letter-spacing: 0.3px;
}
.usage-badge-ok { background: var(--accent-soft); color: var(--accent); }
.usage-badge-no { background: rgba(245, 158, 11, 0.14); color: var(--warning); }
.usage-badge-na { background: var(--bg-elevated); color: var(--text-quaternary); }
.usage-badge-err { background: var(--danger-soft); color: var(--danger); }
.usage-meter {
  height: 8px;
  border-radius: 6px;
  background: var(--bg-elevated);
  overflow: hidden;
}
.usage-meterFill {
  height: 100%;
  border-radius: 6px;
  background: linear-gradient(90deg, var(--accent), #8b5cf6);
  transition: width 0.4s ease;
}
/* One quota window block (5-hour / weekly): label row + meter + reset note. */
.usage-block + .usage-block {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-subtle);
}
.usage-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 6px;
}
.usage-rowLabel {
  font-size: 12.5px;
  color: var(--text-secondary);
}
.usage-rowValue {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}
.usage-resetNote {
  margin: 5px 0 0;
  font-size: 11.5px;
  line-height: 1.4;
  color: var(--text-quaternary);
}
.usage-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-tertiary);
}
.usage-stats b {
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}
.usage-models {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border-subtle);
}
.usage-model {
  display: flex;
  justify-content: space-between;
  padding: 2px 0;
  font-size: 12.5px;
  color: var(--text-secondary);
}
.usage-modelName {
  min-width: 0;
  margin-right: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-mono);
  font-size: 11px;
}
.usage-modelCount {
  flex: none;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}
.usage-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--border-subtle);
}

.settings-themeOptions {
  display: flex;
  gap: 6px;
}

.settings-themeOption {
  padding: 6px 12px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-chip);
  background: transparent;
  color: var(--text-secondary);
  font: inherit;
  font-size: 12.5px;
  cursor: pointer;
  transition: border-color 0.12s ease, background-color 0.12s ease, color 0.12s ease;
}

.settings-themeOption:active {
  transform: scale(0.96);
}

.settings-themeOption-on {
  border-color: transparent;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 500;
}/* Toggle switch: 44 × 24, 12px radius, accent when on. */
.settings-switch{
  position: relative;
  flex: none;
  width: 44px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 12px;
  background: var(--border-default);
  cursor: pointer;
  transition: background-color 0.18s ease;
}.settings-switch::after{
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
  transition: transform 0.18s ease;
}.settings-switch-on{
  background: var(--accent);
}.settings-switch-on::after{
  transform: translateX(20px);
}

.settings-input {
  flex: 1;
  min-width: 0;
  padding: 8px 12px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-chip);
  background: var(--bg-input);
  color: var(--text-primary);
  font: inherit;
  outline: none;
  transition: border-color 0.15s ease;
}

.settings-input:focus {
  border-color: var(--border-focus);
}

.settings-input:disabled {
  opacity: 0.55;
}

.settings-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-chip);
  background: var(--bg-input);
  color: var(--text-primary);
  font: inherit;
  line-height: 1.5;
  resize: vertical;
  outline: none;
  transition: border-color 0.15s ease;
}

.settings-textarea:focus {
  border-color: var(--border-focus);
}

.settings-textarea:disabled {
  opacity: 0.55;
}

.settings-card {
  margin: 0 16px 16px;
  padding: 4px 16px 10px;
  border: 1px solid var(--card-border);
  border-radius: var(--radius-card);
  background: var(--card-bg);
  box-shadow: var(--card-shadow);
}

.settings-cardHead {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 12px 0 4px;
}

.settings-cardTitle {
  flex: 1;
  min-width: 0;
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--text-primary);
}

.settings-field {
  padding: 10px 0;
  border-bottom: 1px solid var(--border-subtle);
}

.settings-field:last-child {
  border-bottom: none;
}

.settings-fieldHead {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.settings-fieldLabel {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  font-weight: 400;
  color: var(--text-primary);
  /* A plugin schema field key is host text and can have no hyphen to break on:
     wrap it instead of pushing the card sideways. */
  overflow-wrap: anywhere;
}

.settings-fieldLock {
  flex: none;
  padding: 2px 8px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-chip);
  background: var(--fill);
  color: var(--text-tertiary);
  font-size: 10.5px;
  font-weight: 400;
}

.settings-fieldDesc {
  margin: 3px 0 8px;
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  line-height: 1.45;
}

.settings-readonly {
  color: var(--text-tertiary);
  font-size: var(--text-md);
  overflow-wrap: anywhere;
}

.settings-subgroup {
  padding: 8px 0 2px;
}

.settings-subgroupTitle {
  display: block;
  margin-bottom: 4px;
  color: var(--text-secondary);
  font-size: 12.5px;
  font-weight: 500;
}

.settings-saved {
  color: var(--positive);
  font-size: var(--text-md);
}

.settings-optionStrip {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 2px 0 6px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.settings-optionStrip::-webkit-scrollbar {
  display: none;
}

.settings-optionChip {
  flex: none;
  padding: 6px 12px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-chip);
  background: transparent;
  color: var(--text-secondary);
  font: inherit;
  font-size: 12.5px;
  cursor: pointer;
  transition: border-color 0.12s ease, background-color 0.12s ease, color 0.12s ease;
}

.settings-optionChip:active {
  transform: scale(0.96);
}

.settings-optionChip-on {
  border-color: transparent;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 500;
}

.settings-ownerHint {
  margin: 0 0 6px;
  color: var(--text-muted);
  font-size: 11.5px;
}

/* ── empty / error / boot states ─────────────────────────────────────── */

.mobile-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 32px 16px;
  text-align: center;
}

.mobile-muted {
  margin: 0;
  color: var(--text-tertiary);
  font-size: 14px;
}

.mobile-error {
  margin: 0;
  color: var(--danger);
  font-size: 14px;
  /* A pairing or workspace failure carries a host message that can hold a
     path: wrap a long token instead of overflowing the card. */
  overflow-wrap: anywhere;
}

/* ── render-crash error page (ErrorBoundary) ─────────────────────────── */

.mobile-errorpage {
  gap: 14px;
  padding: 32px 24px;
}

.errorpage-title {
  margin: 0;
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 600;
}

.errorpage-reason {
  margin: 0;
  max-width: 100%;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
  overflow-wrap: break-word;
}

.errorpage-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 6px;
}

.mobile-button-muted {
  height: 44px;
  padding: 0 18px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-chip);
  background: var(--bg-elevated);
  color: var(--text-secondary);
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.1s ease, background-color 0.1s ease, border-color 0.1s ease;
}

.mobile-button-muted:active {
  transform: scale(0.98);
  background: var(--fill);
  border-color: var(--border-focus);
}

.empty-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  border-radius: var(--radius-full);
  background: var(--fill);
  color: var(--text-tertiary);
}

.empty-icon svg {
  width: 28px;
  height: 28px;
}

.empty-title {
  margin: 0;
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--text-secondary);
}

.empty-desc {
  margin: 0;
  max-width: 280px;
  font-size: var(--text-md);
  line-height: 1.6;
  color: var(--text-tertiary);
}

.boot-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  background: var(--accent);
  animation: breathe 1.6s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  30% {
    transform: scale(1);
    opacity: 1;
  }
}

/* ── skeleton loading (gradient shimmer, no spinners) ────────────────── */

.skel {
  border-radius: var(--radius-chip);
  background: linear-gradient(90deg, var(--fill) 25%, var(--fill-strong) 50%, var(--fill) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Skeleton rows mirror the real card tiers (72px medium / 56px small). */
.skel-row {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) 48px;
  align-items: center;
  gap: var(--space-3);
  height: 72px;
  margin: 0 16px 8px;
  padding: 0 16px;
  border: 1px solid var(--card-border);
  border-radius: var(--radius-card);
  background: var(--card-bg);
}

.skel-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
}

.skel-lines {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.skel-line-title {
  height: 14px;
  width: 52%;
}

.skel-line-sub {
  height: 11px;
  width: 78%;
  border-radius: var(--radius-chip);
}

/* ── buttons ─────────────────────────────────────────────────────────── */

.mobile-button {
  height: 44px;
  padding: 0 18px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-chip);
  background: var(--card-bg);
  color: var(--text-primary);
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.1s ease, background-color 0.1s ease, border-color 0.1s ease;
}

.mobile-button:active {
  transform: scale(0.98);
  background: var(--fill);
  border-color: var(--border-focus);
}

.mobile-button:disabled {
  opacity: 0.5;
  transform: none;
}

.mobile-block {
  display: block;
  width: calc(100% - 32px);
  margin: 4px 16px;
}

.mobile-new {
  display: block;
  width: calc(100% - 32px);
  height: 48px;
  margin: 0 16px;
  border: none;
  border-radius: var(--radius-card);
  background: var(--accent);
  color: var(--accent-contrast);
  font: inherit;
  font-size: var(--text-base);
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 8px var(--accent-glow);
  transition: transform 0.1s ease, filter 0.1s ease;
}

.mobile-new:active {
  transform: scale(0.98);
  filter: brightness(1.1);
}

.mobile-new:disabled {
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

.mobile-hint {
  display: block;
  margin-top: 2px;
  color: var(--text-tertiary);
  font-size: var(--text-sm);
}

.mobile-pad {
  padding: 8px 16px;
}

.mobile-create {
  display: grid;
  gap: var(--space-2);
}

.mobile-preset {
  display: grid;
}

/* Agent-mode selector card (small-card tier): custom trigger + "?" hint.
 * The trigger opens a bottom-sheet option list (no native select popup). */
.mobile-presetCard {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 16px 48px;
  align-items: center;
  column-gap: var(--space-1);
  margin: 0 16px 8px;
  min-height: 56px;
  border: 1px solid var(--card-border);
  border-radius: var(--radius-card);
  background: var(--card-bg);
  box-shadow: var(--card-shadow);
  overflow: hidden;
}

.mobile-presetTrigger {
  width: 100%;
  min-height: 54px;
  padding: 8px 0 8px 16px;
  display: flex;
  align-items: center;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.12s ease;
}

.mobile-presetTrigger:active {
  background: var(--fill);
}

.mobile-presetTrigger:disabled {
  opacity: 0.6;
}

.mobile-presetTriggerCopy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mobile-presetTriggerTitle {
  font-size: var(--text-base);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mobile-presetTriggerDesc {
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mobile-presetCaret {
  pointer-events: none;
  color: var(--text-quaternary);
  font-size: 14px;
  text-align: center;
}

.mobile-presetHelp {
  width: 48px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-left: 1px solid var(--border-subtle);
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: background-color 0.12s ease;
}

.mobile-presetHelp svg {
  width: 18px;
  height: 18px;
}

.mobile-presetHelp:active {
  background: var(--fill);
}

.mobile-presetHelp:disabled {
  opacity: 0.4;
}

/* ── chat ────────────────────────────────────────────────────────────── */

.chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.chat-scroll {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  /* Anchor the viewport to the newest content while streaming: browser
     scroll anchoring keeps the visible region stable when frames above it
     change height (Chromium WebView supports this natively). */
  overflow-anchor: auto;
  padding: 16px 14px calc(env(safe-area-inset-bottom, 0px) + 16px);
  display: flex;
  flex-direction: column;
  /* 用户定的节奏（2026-10-13）：12px。卡片与紧随其后的正文另有 12px
     （见 .chat-* + .chat-flow-text 规则），所以卡片上下读起来正好是 12px ＋ 12px。
     注意：这是**全列表**的行间距，普通文字消息也按 12px 排。 */
  gap: 12px;
}

/* Scroll children never shrink. The bubbles pin an explicit min-height
   (48px tier), which replaces flex's automatic min-content floor — without
   this, a long column of messages gets crushed to 48px each and the
   overflow visually overlaps the neighbours. */
.chat-scroll > * {
  flex-shrink: 0;
}

/* Density preference (settings): 紧凑 tightens the message rhythm. */
[data-density='compact'] .chat-scroll {
  gap: var(--space-2);
}

/* Jump-to-latest: a floating round button pinned to the bottom-right of
   the message viewport (sticky inside the scroll container, so it never
   rides the content). Appears once the reader scrolled away from the
   bottom; the badge counts messages that arrived while away. */
.chat-jump-latest {
  position: sticky;
  bottom: 12px;
  align-self: flex-end;
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border-subtle);
  background: var(--surface-2);
  color: var(--text-2);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
  cursor: pointer;
  /* Same press-vs-selection guard as the turn handle: a held press on the
     round button must still count as a tap. */
  -webkit-user-select: none;
  user-select: none;
  touch-action: manipulation;
  transition: background 120ms ease, color 120ms ease, transform 120ms ease;
  animation: chat-jump-in 160ms ease-out;
}
.chat-jump-latest:active {
  transform: scale(0.92);
}
/* New messages arrived while away: pulse the button to draw the eye. */
.chat-jump-latest-hot {
  color: var(--accent);
  border-color: var(--accent);
  animation: chat-jump-in 160ms ease-out, chat-jump-pulse 1.6s ease-in-out infinite;
}
.chat-jump-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: var(--danger);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  line-height: 18px;
  text-align: center;
}
@keyframes chat-jump-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes chat-jump-pulse {
  0%, 100% { box-shadow: 0 2px 10px rgba(0, 0, 0, 0.18); }
  50% { box-shadow: 0 2px 18px var(--accent-soft, rgba(124, 108, 255, 0.45)); }
}

/* Font-size preference: 小 / 标准 / 大 on message text. */
[data-font-scale='small'] .chat-msg {
  font-size: 14px;
}

[data-font-scale='large'] .chat-msg {
  font-size: var(--text-lg);
}

/* Message bubbles — the large-card tier. */
.chat-msg {
  max-width: 85%;
  min-height: 48px;
  padding: 12px 16px;
  border-radius: var(--radius-card);
  font-size: var(--text-base);
  font-weight: 400;
  line-height: 1.7;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  animation: msg-in 0.18s ease both;
}

/* 消息正文长按走自定义菜单（编辑/复制/引用）；同时允许长按选字——一旦产生
   选区，ChatView 的 openCtxFromTarget 会让位给系统（局部复制优先），不弹
   自定义菜单。代码块/diff 仍允许选择复制。 */
.chat-msg-text,
.chat-msg-plain {
  min-width: 0;
  max-width: 100%;
  user-select: text;
  -webkit-user-select: text;
}.code-block pre{
  min-width: 0;
  max-width: 100%;
  user-select: text;
  -webkit-user-select: text;
}

@keyframes msg-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.chat-msg-user {
  align-self: flex-end;
  width: auto;
  max-width: 85%;
  background: var(--accent);
  color: var(--accent-contrast);
  border-radius: var(--radius-card);
  box-shadow: 0 1px 3px var(--accent-glow);
}

/* 消息图片：0.1.5 起事件只带 attachmentId 引用，字节由 mobile.readAttachment
   按需取（见 attachment-images.ts）。缩略图固定上限高度，含图的行才不会把
   窗口化的高度估算撑爆；点一下由 ChatView 的滚动点击开全屏。 */
.chat-msg-images {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.chat-msg-image {
  display: block;
  width: auto;
  height: auto;
  max-width: min(100%, 260px);
  max-height: 220px;
  border-radius: 10px;
  object-fit: cover;
  background: var(--surface-subtle, rgba(127, 127, 127, 0.12));
}

.chat-msg-image-placeholder {
  min-width: 128px;
  min-height: 72px;
  padding: 10px 12px;
  border: 1px dashed var(--border-default);
  border-radius: 10px;
  background: transparent;
  color: var(--text-muted, #888);
  font-size: 12px;
}

.chat-msg-image-failed {
  border-color: var(--danger);
  color: var(--danger);
}

/* Assistant messages are full-width flat rows (Kimi-style, no bubble):
   the visual hierarchy comes from the content itself — code-block and
   diff cards, headings, blockquotes — not from a card frame around the
   whole message. Only user messages keep a light bubble. */
.chat-msg-assistant {
  align-self: stretch;
  width: auto;
  max-width: none;
  background: transparent;
  border: none;
  box-shadow: none;
  border-radius: 0;
  padding: 0;
}

.chat-msg-failed {
  border-color: var(--danger);
}

.chat-msg-failtag {
  display: inline-block;
  margin-top: 6px;
  padding: 2px 8px;
  border: 1px solid var(--danger);
  border-radius: var(--radius-chip);
  color: var(--danger);
  font-size: var(--text-xs);
  font-weight: 400;
}

.chat-msg-maxtokens {
  margin-top: 8px;
  padding: 8px 10px;
  border: 1px solid var(--warning, #e69641);
  border-radius: var(--radius-card, 8px);
  background: color-mix(in srgb, var(--warning, #e69641) 10%, transparent);
  color: var(--warning, #e69641);
  font-size: var(--text-xs);
  line-height: 1.5;
  word-break: break-word;
}

.chat-msg-time {
  display: block;
  margin-top: 4px;
  color: var(--text-quaternary);
  font-size: var(--text-xs);
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

/* Slash-command result card (command/run + command/done fold): a centered
   narrow strip, desktop-parity with the conversation command node. */
.chat-command {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 8px;
  width: calc(100% - 32px);
  margin: 6px auto;
  padding: 8px 12px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-chip);
  background: var(--card-bg);
  font-size: var(--text-sm);
  line-height: 1.4;
  /* The command line and its output are agent/user text and can carry a path
     or a URL: wrap a lone token so this flex row cannot widen the viewport. */
  overflow-wrap: anywhere;
}

.chat-command-name {
  color: var(--text-secondary);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  min-width: 0;
}

.chat-command-result {
  color: var(--text-tertiary);
  min-width: 0;
}

.chat-command-error .chat-command-result {
  color: var(--danger);
}

.chat-msg-user .chat-msg-time {
  color: rgba(255, 255, 255, 0.6);
  text-align: right;
}

.chat-msg-toggle {
  display: block;
  margin-top: 8px;
  padding: 4px 0;
  border: none;
  background: transparent;
  color: var(--accent);
  font: inherit;
  font-size: var(--text-md);
  font-weight: 400;
  cursor: pointer;
}

.chat-msg > .chat-msg-text,
.chat-msg > .chat-md,
.chat-msg > .chat-msg-plain {
  display: block;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  writing-mode: horizontal-tb;
  direction: ltr;
}

.chat-md {
  white-space: normal;
}

/* 流式中纯文本（不做 markdown 渲染，减少 CPU） */
.chat-msg-plain {
  white-space: pre-wrap;
  overflow-wrap: break-word;
}

.chat-md-collapsed {
  max-height: 45vh;
  overflow: hidden;
  position: relative;
}

.chat-md-collapsed::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 28px;
  background: linear-gradient(transparent, var(--card-bg));
  pointer-events: none;
}

/* Paragraph rhythm, margin-top based. margin-bottom is deliberately NOT
   used: paragraphs live inside .md-html runs and a run usually holds a
   single <p>, so any "last paragraph" / :last-child rule matches EVERY
   paragraph and zeroes the whole rhythm. Spacing therefore only exists
   BETWEEN two adjacent paragraphs (16px) and before/after component
   cards (12px); the message row gap owns the tail spacing. */
.chat-md-body p { margin: 0; }
.chat-md-body p + p { margin-top: 16px; }
/* While a turn streams, the open tail lives in its own .md-html run next
   to the stable run(s); a blank line between two paragraphs then splits
   them across runs and the p + p rule above stops matching — the gap
   would collapse to 0 while streaming and pop to 16px the moment the
   tail closes into the same run. Keep the same rhythm across runs. */
.chat-md .md-html + .md-html { margin-top: 16px; }
/* A flow splits one message into several MarkdownText bodies (tool calls
   interleave text runs): adjacent bodies must keep the same paragraph
   rhythm, or the paragraph gap collapses to 0 the moment a tool lands.
   The MarkdownText root is .chat-msg-text.chat-md (the .chat-md-body is
   its inner wrapper), so the sibling rhythm lives on .chat-md edges. Flow
   rows wrap each text run in a <div data-step-seq class="chat-flow-text">,
   so the selector must also match the wrapper — otherwise adjacent runs
   collapse to 0 while streaming. */
.chat-md + .chat-md,
.chat-flow-text + .chat-flow-text,
.chat-md + .chat-flow-text,
.chat-flow-text + .chat-md { margin-top: 16px; }
/* Paragraph → code/diff card: the card is a sibling of the .md-html run
   (not of the <p> inside it), so the gap lives on the run boundary. */
.chat-md .md-html + .code-block,
.chat-md .md-html + .diff-block { margin-top: 12px; }/* Text run → diff artifact card (and back): FlowBody renders the card as a
   sibling of the .chat-md runs, leaving the card glued to the text. Flow rows wrap each
   text run in a <div data-step-seq class="chat-flow-text">, so the sibling
   selector must match both the bare .chat-md and the .chat-flow-text wrapper
   — otherwise the card glues to the text (gap collapses to 0). */
.chat-md + .chat-artifact, .chat-flow-text + .chat-artifact{ margin-top: 12px; }
.chat-artifact + .chat-md,
.chat-artifact + .chat-flow-text,
.chat-proc + .chat-md,
.chat-proc + .chat-flow-text,
.chat-command + .chat-md,
.chat-command + .chat-flow-text,
.chat-trigger + .chat-md,
.chat-trigger + .chat-flow-text { margin-top: 12px; }
/* Soft line breaks (single-
 markdown lists, agent status lines) render as
   <br /> inside a paragraph: give each a small air gap, or consecutive
   single-line writes read as one dense block. */
.chat-md-body p br {
  display: block;
  content: '';
  margin-top: 6px;
}
/* In-body thinking folds ride the message tail as a quiet footnote. */
.chat-md-notes {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-top: 12px;
}
.chat-md-notes .chat-disclosure {
  margin: 0;
}
.chat-md-body h1, .chat-md-body h2, .chat-md-body h3,
.chat-md-body h4, .chat-md-body h5, .chat-md-body h6 {
  margin: 12px 0 6px;
  font-weight: 500;
  line-height: 1.3;
}
.chat-md-body h1 { font-size: 1.35em; }
.chat-md-body h2 { font-size: 1.25em; }
.chat-md-body h3 { font-size: 1.15em; }
.chat-md-body h4, .chat-md-body h5, .chat-md-body h6 { font-size: 1.05em; }
.chat-md-body code {
  font-family: var(--font-mono);
  font-size: 0.88em; /* ≈13px at the default 15px message size */
  background: var(--bg-elevated);
  color: var(--accent);
  padding: 2px 6px;
  border-radius: 4px;
  border: none;
  box-shadow: none;
}
.chat-md-body ul, .chat-md-body ol { margin: 6px 0 10px; padding-left: 20px; }
.chat-md-body li { margin: 3px 0; }
.chat-md-body blockquote {
  margin: 10px 0;
  padding: 6px 12px;
  border-left: 3px solid var(--accent);
  background: var(--accent-soft);
  border-radius: 0 var(--radius-chip) var(--radius-chip) 0;
  color: var(--text-secondary);
}
.chat-md-body table {
  margin: 8px 0;
  border-collapse: collapse;
  display: block;
  overflow-x: auto;
  font-size: var(--text-md);
}
.chat-md-body th, .chat-md-body td {
  border: 1px solid var(--border-default);
  padding: 6px 10px;
}
.chat-md-body th { background: var(--fill); font-weight: 500; text-align: left; }
.chat-md-body a { color: var(--accent); }
.chat-md-body hr { border: none; border-top: 1px solid var(--border-subtle); margin: 10px 0; }
.chat-md-body img { max-width: 100%; border-radius: var(--radius-chip); }
/* 正文里的本地图（agent 引用的工作区文件）：markdown 只带 data-local-src，
   挂载后经 mobile.readFile 取回 data URL 再填 src（见 local-images.ts）。
   取回前先占住尺寸，避免整段文字在图片到达时跳一下；取不回时给出可见的
   失败态，而不是让浏览器渲染一个破图图标。 */
.chat-md-body img.md-local-img {
  display: block;
  min-width: 96px;
  min-height: 56px;
  background: var(--surface-subtle, rgba(127, 127, 127, 0.12));
  border: 1px dashed var(--border-subtle);
}
.chat-md-body img.md-local-img[data-local-state='loading'] {
  /* 内容尚未到达：占位框不显示 alt 文字被浏览器裁断的碎片。 */
  color: transparent;
}
.chat-md-body img.md-local-img[data-local-state='loaded'] {
  border: none;
}
.chat-md-body img.md-local-img[data-local-state='failed'] {
  min-width: 0;
  min-height: 0;
  padding: 8px 10px;
  border-color: var(--danger);
  background: transparent;
  color: var(--danger);
  font-size: 12px;
}
/* 文档/消息正文里的超长路径（无空格的连续 token）必须在文本 run 处可折，
   否则它会把消息或文件预览（.fp-md 没有 .chat-msg 祖先，继承不到任何
   overflow-wrap）撑出屏幕、整屏横向漂移。作用域限定在 .md-html 文本 run：
   代码块与 diff 卡是它的兄弟段（不是后代），横向滚动语义不受影响；而
   .code-block/.diff-block 用 min-width: max-content / overflow-x 自行处理
   长行。anywhere 而不是 break-word：只有 anywhere 会压低内容的 min-content
   尺寸，flex 布局下 break-word 并不会阻止 flex 项被长 token 撑宽。 */
.chat-md-body .md-html {
  overflow-wrap: anywhere;
  word-break: normal;
}
.chat-md-body .md-html p,
.chat-md-body .md-html li,
.chat-md-body .md-html blockquote,
.chat-md-body .md-html th,
.chat-md-body .md-html td {
  min-width: 0;
}

/* ── code blocks: 12px card, 40px head bar, action buttons, Shiki body ── */

.code-block {
  /* Top gap after a paragraph comes from .chat-md-body p + .code-block
     (12px, margin collapse); between components the block keeps 12px. */
  margin: 0 0 12px;
  border: 1px solid var(--code-border);
  border-radius: var(--radius-card);
  background: var(--code-bg);
  overflow: hidden;
}

.code-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  height: 40px;
  padding: 0 16px;
  background: var(--code-head-bg);
  border-bottom: 1px solid var(--code-head-border);
}

.code-lang {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.code-actions {
  flex: none;
  display: flex;
  align-items: center;
  gap: 2px;
}

.code-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  min-width: 32px;
  height: 32px;
  padding: 0 6px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: color 0.12s ease, background-color 0.12s ease;
}

.code-btn svg {
  width: 16px;
  height: 16px;
  flex: none;
}

.code-btn:active {
  background: var(--fill);
}

@media (hover: hover) {
  .code-btn:hover {
    color: var(--text-primary);
  }
}

.code-btn:disabled {
  opacity: 0.5;
}

.code-btn-done {
  color: var(--positive);
}

.code-btn-label {
  font: inherit;
  font-size: var(--text-sm);
  font-weight: 500;
  white-space: nowrap;
}

.code-body-zone {
  position: relative;
}

.code-body {
  padding: 12px 16px;
  overflow-x: auto;
  scrollbar-width: none;
}

.code-body::-webkit-scrollbar {
  display: none;
}

/* Folded long blocks clamp to ~15 lines; the mask fades the cut edge. */
.code-body-folded {
  max-height: calc(15 * 1.6 * 13px + 24px);
  overflow-y: hidden;
}

.code-fold-mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 48px;
  background: linear-gradient(transparent, var(--code-bg));
  pointer-events: none;
}

.code-fold-btn {
  display: block;
  width: 100%;
  height: 36px;
  border: none;
  border-top: 1px solid var(--code-border);
  background: transparent;
  color: var(--accent);
  font: inherit;
  font-size: var(--text-md);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.12s ease;
}

.code-fold-btn:active {
  background: var(--fill);
}

.code-block pre {
  margin: 0;
  background: transparent;
  color: var(--code-text);
  border-radius: 0;
  border: none;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
}

.code-block pre code {
  background: transparent;
  padding: 0;
  color: inherit;
  font-size: inherit;
}

/* Lightweight highlighter tokens (github-dark/light palette parity): the
   tokenizer emits .tok-* spans; the palette picks the active color, so a
   theme switch is a pure CSS flip with the 300ms transition above. */
.code-body .tok-keyword { color: var(--tok-keyword); }
.code-body .tok-string { color: var(--tok-string); }
.code-body .tok-comment { color: var(--tok-comment); }
.code-body .tok-number { color: var(--tok-number); }
.code-body .tok-type { color: var(--tok-type); }
.code-body .tok-func { color: var(--tok-func); }
.code-body .tok-prop { color: var(--tok-prop); }
/* Highlighted HTML fades in (150ms) once the async Shiki render lands. */
.code-fade {
  animation: code-fade-in 0.15s ease both;
}

@keyframes code-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Optional line numbers (settings toggle): a 40px right-aligned gutter
   with a 1px divider, over both the plain fallback and Shiki line spans. */
.code-line {
  display: block;
}

.shiki .line {
  display: block;
}

.code-block pre {
  counter-reset: code-line;
}

[data-line-numbers='1'] .code-line::before,
[data-line-numbers='1'] .shiki .line::before {
  content: counter(code-line);
  counter-increment: code-line;
  display: inline-block;
  width: 40px;
  margin-right: 12px;
  padding-right: 12px;
  text-align: right;
  color: var(--text-muted);
  border-right: 1px solid var(--border-subtle);
  user-select: none;
}

/* Sandbox run output (bash / python blocks). */
.code-run {
  margin: 0;
  padding: 10px 12px;
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-elevated);
  font-family: var(--font-mono);
  font-size: var(--text-md);
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  max-height: 240px;
  overflow-y: auto;
}

.code-run-ok {
  color: var(--positive);
}

.code-run-error {
  color: var(--danger);
}

/* ── diff view: 变更对比 card, three-column rows, review mode ─────────── */

.diff-block {
  /* Top gap after a paragraph comes from .chat-md-body p + .diff-block
     (12px, margin collapse); between components the block keeps 12px. */
  margin: 0 0 12px;
  border: 1px solid var(--code-border);
  border-radius: 12px;
  background: var(--code-bg);
  overflow: hidden;
}

.diff-head {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: 40px;
  padding: 0 16px;
  background: var(--code-head-bg);
  border-bottom: 1px solid var(--code-head-border);
}

.diff-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
}

.diff-label {
  flex: none;
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.diff-file {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.diff-actions {
  flex: none;
  display: flex;
  gap: 6px;
  margin-left: auto;
}

.diff-btn {
  height: 28px;
  padding: 0 10px;
  border-radius: 8px;
  font: inherit;
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.1s ease, filter 0.1s ease, background-color 0.12s ease;
}

.diff-btn:active {
  transform: scale(0.96);
}

.diff-accept {
  border: none;
  background: var(--positive);
  color: #fff;
}

.diff-reject {
  border: 1px solid var(--border-default);
  background: var(--bg-elevated);
  color: var(--text-secondary);
}

.diff-review {
  border: 1px solid var(--border-default);
  background: transparent;
  color: var(--accent);
}

.diff-body {
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: var(--text-md);
  line-height: 1.6;
}

.diff-hunk-head {
  padding: 6px 12px 2px;
  color: var(--text-quaternary);
  font-size: 11.5px;
  user-select: none;
}

.diff-row {
  display: grid;
  grid-template-columns: 40px 40px minmax(0, 1fr);
  min-width: max-content;
}

.diff-row-review {
  grid-template-columns: 24px 40px 40px minmax(0, 1fr);
}

.diff-oldno,
.diff-newno {
  padding-right: 8px;
  text-align: right;
  color: var(--text-muted);
  user-select: none;
  font-variant-numeric: tabular-nums;
}

.diff-text {
  padding: 0 12px 0 8px;
  white-space: pre;
}

.diff-add {
  background: var(--diff-add-bg);
  box-shadow: inset 3px 0 0 var(--diff-add);
}

.diff-add .diff-newno {
  color: var(--diff-add);
}

.diff-del {
  background: var(--diff-del-bg);
  box-shadow: inset 3px 0 0 var(--diff-del);
}

.diff-del .diff-oldno {
  color: var(--diff-del);
}

/* Word-level marks on paired add/del lines. */
.diff-word-add {
  background: var(--diff-add-word);
  border-radius: 2px;
}

.diff-word-del {
  background: var(--diff-del-word);
  text-decoration: line-through;
  border-radius: 2px;
}

/* Review mode: 24px action column with per-line + / − buttons. */
.diff-review-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.diff-line-btn {
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  border-radius: 6px;
  font-size: var(--text-md);
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition: transform 0.1s ease, filter 0.1s ease;
}

.diff-line-btn:active {
  transform: scale(0.9);
}

.diff-line-add-btn {
  background: var(--diff-add-bg);
  color: var(--diff-add);
}

.diff-line-del-btn {
  background: var(--diff-del-bg);
  color: var(--diff-del);
}

.diff-line-btn-on {
  filter: brightness(1.25);
}

.diff-decided {
  opacity: 0.55;
}

.diff-fold {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 8px 12px;
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-raised);
}

.diff-fold-text {
  flex: 1;
  min-width: 0;
  color: var(--text-tertiary);
  font-size: var(--text-sm);
}

.diff-fold-btn {
  flex: none;
  height: 30px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-input);
  color: var(--text);
  font: inherit;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
}

.diff-review-foot {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 8px 12px;
  border-top: 1px solid var(--border-subtle);
}

.diff-review-summary {
  flex: 1;
  min-width: 0;
  color: var(--text-tertiary);
  font-size: var(--text-sm);
}

.diff-confirm {
  flex: none;
  height: 32px;
  padding: 0 14px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: var(--accent-contrast);
  font: inherit;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.1s ease, filter 0.1s ease;
}

.diff-confirm:active {
  transform: scale(0.96);
  filter: brightness(1.08);
}

.diff-cancel {
  border: 1px solid var(--border-default);
  background: transparent;
  color: var(--text-secondary);
}

/* Applied / rejected collapse state. */
.diff-applied {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 10px 16px;
  color: var(--text-secondary);
  font-size: var(--text-md);
}

.diff-dimmed {
  opacity: 0.55;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.diff-applied-tag {
  flex: none;
  color: var(--positive);
  font-weight: 500;
}

.diff-applied-tag-rejected {
  color: var(--danger);
}

.diff-applied-summary {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-tertiary);
  font-size: var(--text-sm);
}

.diff-undo {
  flex: none;
  margin-left: auto;
  border: none;
  background: transparent;
  color: var(--accent);
  font: inherit;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 6px;
}

/* ── file-path links (host file opener) ───────────────────────────────── */

.chat-md-body a.file-link {
  color: var(--accent);
  text-decoration: none;
  border-bottom: 1px dashed color-mix(in srgb, var(--accent) 40%, transparent);
  overflow-wrap: anywhere;
}

@media (hover: hover) {
  .chat-md-body a.file-link:hover {
    text-decoration: underline;
  }
}

.chat-md-body pre:not(.code-block pre):not(.diff-block pre) {
  margin: 8px 0;
  padding: var(--space-3);
  background: var(--code-bg);
  color: var(--code-text);
  border-radius: 10px;
  overflow-x: auto;
  font-size: var(--text-md);
  line-height: 1.6;
}

/* ── message disclosures (深度思考 / 工具) ───────────────────────────── */

.chat-disclosure {
  margin-bottom: 12px;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  background: var(--bg-elevated);
  overflow: hidden;
}

.chat-disclosure-head {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  min-height: 40px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font: inherit;
  font-size: var(--text-md);
  font-weight: 400;
  text-align: left;
  cursor: pointer;
  white-space: nowrap;
}

.chat-disclosure-head:active {
  background: var(--fill);
}

.chat-disclosure-icon {
  flex: none;
  display: flex;
  color: var(--text-tertiary);
}

.chat-disclosure-icon svg {
  width: 14px;
  height: 14px;
}

.chat-disclosure-caret {
  flex: none;
  display: flex;
  color: var(--text-tertiary);
  transition: transform 0.3s ease;
}

.chat-disclosure-caret svg {
  width: 14px;
  height: 14px;
}

.chat-disclosure-open .chat-disclosure-caret {
  transform: rotate(180deg);
}

.chat-disclosure-label {
  flex: none;
  color: var(--text-secondary);
  font-weight: 500;
}

.chat-reasoning[data-pending] .chat-disclosure-label {
  color: var(--accent);
}

.chat-disclosure-summary {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  font-weight: 400;
}

.chat-disclosure-count {
  flex: none;
  color: var(--text-quaternary);
  font-size: var(--text-xs);
}

/* Accordion body: mounts on open with a max-height ease (300ms). */
.chat-disclosure-body {
  padding: 8px 12px 12px;
  border-top: 1px dashed var(--border-subtle);
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: var(--text-md);
  font-weight: 400;
  line-height: 1.7;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  max-height: 500px;
  overflow-y: auto;
  animation: disclosure-open 0.3s ease both;
}

@keyframes disclosure-open {
  from {
    max-height: 0;
    opacity: 0;
  }
  to {
    max-height: 500px;
    opacity: 1;
  }
}

.chat-tool-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: 8px 10px;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  background: var(--card-bg);
}

.chat-tool-pills {
  display: flex;
  gap: var(--space-1);
  flex-wrap: wrap;
  align-items: center;
}

.chat-tool-pill {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-chip);
  background: var(--accent-soft);
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 400;
  white-space: nowrap;
}

/*
 * A tool id is a single unbreakable token when it comes from an MCP server
 * (mcp__github__create_or_update_file), so the chip must be able to shrink
 * inside its row: in the collapsed one-line header it ellipsizes, and once the
 * card is open the full name matters more, so it wraps instead.
 */
.chat-disclosure-head .chat-tool-pill {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-tool-card .chat-tool-pill {
  min-width: 0;
  max-width: 100%;
  white-space: normal;
  overflow-wrap: anywhere;
}

.chat-tool-args {
  margin: 0;
  padding: 6px 8px;
  border-radius: 6px;
  background: var(--code-bg);
  color: var(--code-text);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  line-height: 1.5;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
}

/*
 * 过程组（桌面端 turn-process 的对应物）：一轮的思考与工具调用藏在同一个折叠头
 * 后面，头两行只有状态词/用时/报错信号、此刻到哪一步与改动量；步数在展开体首行
 * （「共 N 步」）。行不编号，层级只靠缩进与行首字形。
 */
.chat-proc {
  display: flex;
  flex-direction: column;
  margin-top: var(--space-1);
}

.chat-proc-head {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 2px;
  width: 100%;
  min-height: 40px;
  /* 右边留给绝对定位的展开箭头 */
  padding: 6px 26px 6px 8px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-chip);
  background: var(--card-bg);
  color: var(--text-muted);
  font: inherit;
  font-size: var(--text-xs);
  text-align: left;
  cursor: pointer;
}

.chat-proc-head-static {
  cursor: default;
}

.chat-proc-lead {
  flex: none;
  /* emoji 与中文行对齐：定宽方形盒 + 双向居中 + line-height:1。emoji 字形的
     上伸/下伸和中文不一样，不锁盒高就会把这一行顶高、也让符号看起来飘在文字上方。 */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  font-size: 13px;
  line-height: 1;
  color: var(--text-quaternary);
}

.chat-proc-lead-running {
  color: var(--accent);
  /* 沙漏翻转：45%→55% 之间快速翻 180°，其余时间静置。沙漏上下对称，
     所以从 180° 直接回到 0° 看不出接缝，像"倒过来接着漏"。纯 CSS 动画走
     合成层，不做逐帧重渲染 —— 秒表闪烁的教训就是不碰 JS 定时器。
     盒模型/字号由 .chat-proc-lead 统一给（emoji 必须与 13px 正文同高，别再单独放大）。 */
  animation: chat-proc-flip 1.6s ease-in-out infinite;
}

@keyframes chat-proc-flip {
  0%, 45% { transform: rotate(0deg); }
  55%, 100% { transform: rotate(180deg); }
}

/* 系统开"减弱动态效果"时，沙漏静止（仍显示 ⏳，不做任何动作）。 */
@media (prefers-reduced-motion: reduce) {
  .chat-proc-lead-running { animation: none; }
}

.chat-proc-line {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
}

/* 第一行：状态词是主角（灰阶里最重的一档），用时退到第三档。 */
.chat-proc-state {
  flex: none;
  font-weight: 600;
  color: var(--text-primary);
}

/*
 * 第一行里的报错信号（「⚠ 2 处报错」）：比状态词弱一档（第三档灰、小一号），
 * 只在真有报错步骤时存在。不引入新层次、不用重色。
 */
.chat-proc-errors {
  flex: none;
  color: var(--text-tertiary);
  font-size: 0.95em;
  font-weight: 400;
}

.chat-proc-time {
  flex: none;
  margin-left: auto;
  color: var(--text-tertiary);
  font-variant-numeric: tabular-nums;
}

.chat-proc-label {
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 第二行：此刻进行到哪一步 —— 正文色（这张卡的主角）。 */
.chat-proc-current {
  color: var(--text-primary);
}

.chat-proc-current-text {
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 右侧补充信息（「改了 3 个文件」），第三档灰。 */
.chat-proc-meta {
  flex: none;
  margin-left: auto;
  color: var(--text-tertiary);
}

/* 只有"运行中"给一点强调：比默认亮一档的灰边。 */
.chat-proc-running > .chat-proc-head {
  border-color: var(--border-default);
}

.chat-proc-caret {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  flex: none;
}

.chat-proc-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 6px;
  padding-left: 10px;
  border-left: 2px solid var(--border-subtle);
}

/* 宿主唤醒消息的卡片（子代理/任务/定时/团队/外部事件…）。数值逐条对齐桌面端
   ui-chat 的 TurnTriggerNodeView.module.css：16px 圆角、描边、代码块灰底、
   头部 12px/16px、标题 13px、时间右对齐 12px、正文左缩进 40px、正文区最高 240px。
   外边距单独给足 —— 真机反馈"卡片离周围文字太近、不协调"。 */
.chat-trigger {
  margin: 14px 0;
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  background: var(--code-bg);
  overflow: hidden;
}
.chat-trigger-head {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  cursor: pointer;
  list-style: none;
  color: var(--text-primary);
  font-size: 13px;
}
.chat-trigger-head::-webkit-details-marker {
  display: none;
}
.chat-trigger-icon,
.chat-trigger-caret {
  flex: none;
  color: var(--text-tertiary);
}
.chat-trigger-title {
  flex: none;
}
.chat-trigger-time {
  flex: none;
  margin-left: auto;
  color: var(--text-tertiary);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.chat-trigger-body {
  padding: 0 16px 12px 40px;
}
.chat-trigger-note {
  margin: 8px 0;
  color: var(--text-secondary);
  font-size: 12px;
}
.chat-trigger-text {
  color: var(--text-secondary);
  font-size: 12px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  max-height: 240px;
  overflow: auto;
}

/* 展开体首行：这一轮到底走了几步（卡面第一行只留状态词与用时）。 */
.chat-proc-steps {
  color: var(--text-tertiary);
}

.chat-think {
  display: flex;
  flex-direction: column;
}

.chat-think-head {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  min-height: 40px;
  padding: 4px 6px;
  border: none;
  background: none;
  /* 折叠头从 --text-muted 提到 --text-secondary：muted 是全站最弱的灰，
     深色模式下几乎糊在背景里，"深度思考 · N 行"这行标题也看不清。 */
  color: var(--text-secondary);
  font: inherit;
  font-size: var(--text-xs);
  text-align: left;
  cursor: pointer;
}

.chat-think-icon {
  flex: none;
  color: var(--accent);
}

.chat-think-label {
  flex: 1 1 auto;
}

.chat-think-caret {
  flex: none;
}

.chat-think-body {
  /* 思维链正文重新设计：原文用 --text-muted（全站最弱灰），浅色下发白、深色下发糊，
     两种模式都读不清。改为：
     ① 颜色 --text-secondary（主题保证对比度，深浅都够看，又弱于正文，层级不乱）；
     ② 左侧竖线由 --border-subtle 提到 --border-default，边界更明确；
     ③ 加一层 --code-bg 底（浅色 #e8ecf2 / 深色 #161b22，与页面底有区分），
        让它一眼是"引用块/思考块"，不再和正文混在一起；
     ④ 右侧同圆角，行高 1.65 更适合手机上读长段推理。 */
  padding: 6px 10px 8px 22px;
  border-left: 2px solid var(--border-default);
  border-radius: 0 8px 8px 0;
  background: var(--code-bg);
  color: var(--text-secondary);
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.chat-step-head {
  min-height: 40px;
}

.chat-step-state {
  flex: none;
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.chat-step-state-ok { color: var(--diff-add); }
.chat-step-state-error { color: var(--diff-del); }
.chat-step-state-running { color: var(--accent); }

.chat-flow-answer {
  margin-top: var(--space-1);
}

/*
 * Turn tail (desktop turn-tail): what the turn handed back as a report card —
 * declared deliverables and the files the turn produced. No duration here: the
 * process group head already carries it (one place, one number).
 */
.chat-turn-tail {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-top: var(--space-2);
  padding: 8px 10px;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  background: var(--card-bg);
}

.chat-turn-tail-head {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
}

.chat-turn-tail-title {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.chat-turn-tail-time {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--accent);
}

.chat-turn-tail-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.chat-turn-tail-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.chat-turn-tail-file {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-chip);
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.chat-turn-tail-file-name {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
}

.chat-turn-tail-count {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.chat-turn-tail-badge {
  padding: 1px 6px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-chip);
  color: var(--accent);
  font-size: var(--text-xs);
}

.chat-turn-tail-file-path {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-muted);
}

/*
 * Process timeline (desktop ToolRow parity): one row per tool call with a
 * state dot, the family glyph, the act's title and the args-derived summary.
 * The summary is the shrinkable slot — an unbreakable MCP tool id or a long
 * command ellipsizes instead of pushing the caret off the row.
 */
.chat-step {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: 6px 8px;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  background: var(--card-bg);
}

.chat-step-head {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.chat-step-icon {
  flex: none;
  /* 与 .chat-proc-lead 同一套对齐规则：定宽方形盒 + 居中 + line-height:1。
     这里原来还有一条给 14px SVG 用的子规则，换成 emoji 后已无用、已一并删除；
     emoji 若不定盒会按字形基线摆放，看着像飘在标题上方。 */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  font-size: 13px;
  line-height: 1;
  color: var(--text-muted);
}

/* 非工具步骤（思考中 / 正在回答）也要有行首符号：💭 加轻微呼吸。
   动效刻意比卡首的沙漏弱（那边是翻转），一张卡里不要两个东西抢眼睛。
   注意：本文件的 CSS 在模板字符串里，注释里不得出现反引号或美元加花括号。 */
.chat-step-icon-thinking {
  animation: chat-step-breathe 1.8s ease-in-out infinite;
}

@keyframes chat-step-breathe {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}

@media (prefers-reduced-motion: reduce) {
  .chat-step-icon-thinking { animation: none; }
  .chat-step-icon-spin { animation: none; }
}

/* 运行命令（bash 族）的齿轮只在"这一步正在跑"时转：结算后必须停，
   否则"已完成"的卡里齿轮转个不停，读起来像还在干活。 */
.chat-step-icon-spin {
  animation: chat-step-spin 2.4s linear infinite;
}

@keyframes chat-step-spin {
  to { transform: rotate(360deg); }
}

.chat-step-title {
  flex: none;
  font-size: var(--text-xs);
  color: var(--text-muted);
  white-space: nowrap;
}

.chat-step-summary {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

.chat-step-tally {
  flex: none;
  display: inline-flex;
  gap: 4px;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

.chat-step-tally-add { color: var(--diff-add); }
.chat-step-tally-del { color: var(--diff-del); }

.chat-step-caret {
  flex: none;
  color: var(--text-muted);
  font-size: var(--text-xs);
}

.chat-step-peek {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-mono);
}

@keyframes chat-step-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}

/* Tool diff card: file path header + red removed / green added lines,
   reusing the DiffView palette (--diff-add/--diff-del). The max-height
   transition rides ArtifactCard's inline maxHeight (content height while
   open, 0 while folded) so expanding, collapsing and streamed growth —
   more files landing mid-turn — animate smoothly; overflow stays hidden. */
.chat-tool-diff {
  margin-top: 2px;
  border-radius: 8px;
  overflow: hidden;
  transition: max-height 200ms ease;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: 1.5;
}

.chat-artifact {
  /* Same panel language as code blocks: --code-border frame + --code-head-bg
     head bar, so tool diffs read as one family with the fenced blocks. */
  border: 1px solid var(--code-border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--card-bg);
}

.chat-artifact-head {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: 0;
  border: none;
  background: var(--code-head-bg);
  color: inherit;
  font: inherit;
  cursor: pointer;
  text-align: left;
}

.chat-artifact-title {
  flex: 1;
  min-width: 0;
  padding: 6px 0 6px 10px;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: 500;
  font-family: var(--font-mono);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-artifact-summary {
  flex: none;
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  color: var(--text-tertiary);
  font-size: var(--text-xs);
  font-variant-numeric: tabular-nums;
}

/* The +/- line tally reads at a glance: additions green, deletions red,
   reusing the diff palette so the head matches the red/green body. */
.chat-artifact-stat-add { color: var(--diff-add); }
.chat-artifact-stat-del { color: var(--diff-del); }

.chat-artifact-caret {
  flex: none;
  padding: 6px 10px 6px 0;
  color: var(--text-quaternary);
  font-size: var(--text-xs);
}

.chat-artifact .chat-tool-diff {
  margin-top: 0;
  border-radius: 0;
}

.chat-tool-diff-row {
  display: flex;
  gap: 6px;
  padding: 1px 8px;
  white-space: pre-wrap;
  /* anywhere, not break-word: only anywhere lowers the min-content size, which
     is what lets a flex item shrink below one long path token. */
  overflow-wrap: anywhere;
}

.chat-tool-diff-path {
  padding: 3px 8px;
  background: var(--code-head-bg);
  color: var(--text-secondary);
  font-weight: 600;
}

.chat-tool-diff-del {
  background: var(--diff-del-bg);
  color: var(--diff-del);
}

.chat-tool-diff-add {
  background: var(--diff-add-bg);
  color: var(--diff-add);
}

.chat-tool-diff-sign {
  flex: none;
  width: 10px;
  text-align: center;
  user-select: none;
}

.chat-tool-diff-text {
  flex: 1;
  min-width: 0;
}

/* ── turn status: three breathing dots ───────────────────────────────── */

.chat-turn-status {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  /* Left edge flush with the flat assistant rows: the scroll area pads
     12px and the rows are full-width, so the status must not add its own
     left inset (the old 14px pushed it 14px right of the text). */
  padding: 8px 0;
  color: var(--accent);
  font-size: var(--text-md);
  font-weight: 500;
}

/* Turn clock (desktop parity): muted, tabular-ish elapsed label. */
.chat-turn-time {
  color: var(--muted);
  font-size: var(--text-sm);
  font-weight: 400;
  font-variant-numeric: tabular-nums;
}

.chat-turn-dots {
  display: inline-flex;
  gap: var(--space-1);
}

.chat-turn-dots span {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--accent);
  animation: breathe 1.4s infinite ease-in-out;
}

.chat-turn-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.chat-turn-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

/* ── run-status strip + sheet (todo plan / background jobs) ───────────── */

.chat-status-strip {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 34px;
  padding: 6px 12px 2px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font: inherit;
  font-size: var(--text-sm);
  text-align: left;
  cursor: pointer;
}

.chat-status-strip:active {
  color: var(--text-primary);
}

.chat-status-dot {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--text-quaternary);
}

.chat-status-dot-live {
  background: var(--accent);
  animation: breathe 1.6s infinite ease-in-out;
}

.chat-status-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* One content section inside the run-status sheet. */
.chat-run-section {
  padding: 2px 0 6px;
}

.chat-run-section + .chat-run-section {
  border-top: 1px solid var(--border-subtle);
  margin-top: 8px;
  padding-top: 10px;
}

.chat-run-section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2);
  margin-bottom: 6px;
}

.chat-run-section-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
}

.chat-run-section-count {
  font-size: var(--text-sm);
  font-variant-numeric: tabular-nums;
  color: var(--text-quaternary);
}

.chat-run-todo-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chat-run-todo {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: var(--text-md);
  line-height: 1.45;
  color: var(--text-primary);
}

.chat-run-todo.chat-run-todo-completed .chat-run-todo-content {
  color: var(--text-quaternary);
  text-decoration: line-through;
}

.chat-run-todo-mark {
  flex: none;
  width: 14px;
  text-align: center;
  color: var(--text-quaternary);
}

.chat-run-todo.chat-run-todo-in_progress .chat-run-todo-mark {
  color: var(--accent);
}

.chat-run-todo.chat-run-todo-completed .chat-run-todo-mark {
  color: var(--success, var(--accent));
}

.chat-run-job-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ── background-task status bar (session/jobs) ───────────────────────── */

.chat-taskbar {
  margin: 0 12px 8px;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  background: var(--bg-elevated);
  overflow: hidden;
}

.chat-taskbar-head {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  min-height: 40px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font: inherit;
  font-size: var(--text-md);
  text-align: left;
  cursor: pointer;
}

.chat-taskbar-head:active {
  background: var(--fill);
}

.chat-taskbar-label {
  flex: none;
  color: var(--text-secondary);
  font-weight: 500;
}

.chat-taskbar-summary {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  font-weight: 400;
}

.chat-taskbar-open .chat-disclosure-caret {
  transform: rotate(180deg);
}

.chat-taskbar-body {
  padding: 4px 12px 10px;
  border-top: 1px dashed var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chat-task-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.chat-task-dot {
  flex: none;
  width: 8px;
  height: 8px;
  margin-top: 5px;
  border-radius: var(--radius-full);
  background: var(--text-quaternary);
}

.chat-task-dot-running {
  background: var(--accent);
  animation: breathe 1.4s infinite ease-in-out;
}

.chat-task-dot-stopping {
  background: var(--warning, #d9a13b);
}

.chat-task-dot-completed {
  background: var(--success, #3fae6a);
}

.chat-task-dot-killed {
  background: var(--text-quaternary);
}

.chat-task-dot-failed {
  background: var(--danger, #d9534f);
}

.chat-task-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.chat-task-label {
  color: var(--text-primary);
  font-size: var(--text-md);
  line-height: 1.35;
  word-break: break-word;
}

.chat-task-meta {
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  /* job.detail is host text (often a path): wrap it rather than sticking out
     of the copy column and being clipped by the taskbar. */
  overflow-wrap: anywhere;
}

.chat-task-time {
  color: var(--text-quaternary);
  font-size: var(--text-xs);
}

.chat-subagent-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.chat-subagent-dot {
  flex: none;
  width: 8px;
  height: 8px;
  margin-top: 5px;
  border-radius: var(--radius-full);
  background: var(--text-quaternary);
}

.chat-subagent-dot-running {
  background: var(--accent);
  animation: breathe 1.4s infinite ease-in-out;
}

.chat-subagent-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.chat-subagent-label {
  color: var(--text-primary);
  font-size: var(--text-md);
  line-height: 1.35;
  word-break: break-word;
}

.chat-subagent-meta {
  color: var(--text-tertiary);
  font-size: var(--text-sm);
}

/* Run-status sheet fold row: truncates long subagent lists past the visible max. */
.chat-run-fold {
  display: block;
  width: 100%;
  border: none;
  padding: 10px 12px;
  background: transparent;
  color: var(--accent);
  font-size: var(--text-sm);
  text-align: left;
  cursor: pointer;
  transition: background-color 0.12s ease;
}

.chat-run-fold:active {
  background: var(--fill);
}

/* ── approval / question panels ──────────────────────────────────────── */

/*
 * Both panels print agent-supplied text: a tool id full of underscores, a
 * workspace path, a git ref, a command inside an approval reason. One long
 * unbreakable token used to set a flex item's min-content width, which widened
 * the whole chat column past the viewport and drifted the page sideways.
 * overflow-wrap: anywhere is inherited by every child and — unlike break-word —
 * it also lowers the min-content size, which is exactly what a flex item's
 * automatic minimum looks at. The rows carry min-width: 0 so the guard survives
 * a child that resets the property.
 */
.chat-approval-panel,
.chat-question-panel {
  min-width: 0;
  max-width: 100%;
  overflow-wrap: anywhere;
}

.chat-approval-header,
.chat-approval-reason,
.chat-question-option,
.chat-question-option-label,
.chat-question-option-desc {
  min-width: 0;
}

/* The header is a row: a long reason drops onto its own line, and a long tool
   id wraps inside the pill instead of forcing the row wider than the screen. */
.chat-approval-header {
  flex-wrap: wrap;
}

.chat-approval-header .chat-tool-pill {
  min-width: 0;
  max-width: 100%;
  white-space: normal;
  overflow-wrap: anywhere;
}

.chat-approval-panel {
  margin: 4px 0;
  padding: 12px 16px;
  border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
  border-radius: var(--radius-card);
  background: var(--card-bg);
  box-shadow: var(--card-shadow);
}

.chat-approval-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: 10px;
}

.chat-approval-reason {
  color: var(--text-secondary);
  font-size: 12.5px;
}

.chat-approval-error {
  margin: 4px 0;
  color: var(--danger);
  font-size: var(--text-sm);
}

.chat-approval-actions {
  display: flex;
  gap: var(--space-2);
}

.chat-approval-allow {
  flex: 1;
  height: 44px;
  border: none;
  border-radius: var(--radius-chip);
  background: var(--accent);
  color: var(--accent-contrast);
  font: inherit;
  font-size: var(--text-md);
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.1s ease, filter 0.1s ease;
}

.chat-approval-allow:active {
  transform: scale(0.98);
  filter: brightness(1.08);
}

.chat-approval-allow:disabled {
  opacity: 0.6;
  transform: none;
}

.chat-approval-reject {
  flex: 1;
  height: 44px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-chip);
  background: transparent;
  color: var(--text-secondary);
  font: inherit;
  font-size: var(--text-md);
  cursor: pointer;
  transition: transform 0.1s ease, background-color 0.1s ease;
}

.chat-approval-reject:active {
  transform: scale(0.98);
  background: var(--fill);
}

.chat-approval-reject:disabled {
  opacity: 0.6;
  transform: none;
}

.chat-question-panel {
  margin: 4px 0;
  padding: 12px 16px;
  border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
  border-radius: var(--radius-card);
  background: var(--card-bg);
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chat-question-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chat-question-header {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.chat-question-text {
  font-size: var(--text-md);
  font-weight: 400;
  color: var(--text-primary);
  line-height: 1.5;
}

.chat-question-detail {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.5;
}

.chat-question-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chat-question-option {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: 12px 14px;
  border: 1px solid var(--border-default);
  border-radius: 10px;
  cursor: pointer;
  font-size: var(--text-md);
  transition: border-color 0.12s ease, background-color 0.12s ease, transform 0.1s ease;
}

.chat-question-option:active {
  transform: scale(0.98);
}

.chat-question-option input {
  margin: 2px 0 0;
  flex: none;
  accent-color: var(--accent);
}

.chat-question-option-selected {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.chat-question-option-label {
  color: var(--text-primary);
  font-weight: 500;
}

.chat-question-option-desc {
  display: block;
  color: var(--text-tertiary);
  font-size: var(--text-sm);
}

.chat-question-custom {
  width: 100%;
  min-height: 44px;
  box-sizing: border-box;
  padding: 8px 12px;
  border: 1px solid var(--border-default);
  border-radius: 10px;
  background: var(--bg-input);
  color: var(--text-primary);
  font: inherit;
  resize: vertical;
  outline: none;
  transition: border-color 0.15s ease;
}

.chat-question-custom:focus-visible {
  border-color: var(--border-focus);
}

.chat-question-submit {
  height: 44px;
  border: none;
  border-radius: var(--radius-chip);
  background: var(--accent);
  color: var(--accent-contrast);
  font: inherit;
  font-size: var(--text-md);
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.1s ease, filter 0.1s ease;
}

.chat-question-submit:active {
  transform: scale(0.98);
  filter: brightness(1.08);
}

.chat-question-submit:disabled {
  opacity: 0.6;
  transform: none;
}

/* ── composer toolbar pills ──────────────────────────────────────────── */

/* One row, two zones: the icon pills (model/permission) on the left, the
   context ring pinned on the right (flex: none) so the session's
   occupancy never scrolls out of view. The row never scrolls: the model
   pill (the only elastic one) shrinks with an ellipsis while the
   permission pill and the ring stay fixed and always visible. */
.chat-tools {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px 0;
}

.chat-tools-actions {
  display: flex;
  gap: var(--space-2);
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.chat-pill {
  flex: 0 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--border-default);
  border-radius: 16px;
  background: var(--card-bg);
  color: var(--text-secondary);
  font: inherit;
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.12s ease, background-color 0.12s ease, color 0.12s ease, transform 0.1s ease;
}

.chat-pill > svg {
  color: var(--accent);
}

.chat-pill:active {
  transform: scale(0.96);
  border-color: var(--border-focus);
  background: var(--accent-soft);
}

.chat-pill-name {
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-pill-chevron {
  flex: none;
  color: var(--text-quaternary);
  font-size: 10px;
}

/* Permission pills never shrink: their text is short and stays visible. */
.chat-pill-perm {
  flex: none;
}

/* Context meter (status zone): an SVG occupancy ring + the percentage;
   the exact counts live in the title. ≥80% flips ring and figures to the
   danger color. */
.chat-context {
  flex: none;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding-left: 12px;
  border-left: 1px solid var(--border-default);
  color: var(--text-tertiary);
  font-size: var(--text-xs);
  font-weight: 500;
  line-height: 1.4;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
}

.chat-context-ring {
  flex: none;
  display: block;
}

.chat-context-ring-track {
  stroke: var(--fill);
}

.chat-context-ring-fill {
  stroke: var(--accent);
  transition: stroke-dasharray 0.3s ease;
}

.chat-context-warn {
  color: var(--danger);
}

.chat-context-warn .chat-context-ring-fill {
  stroke: var(--danger);
}

/* Context-usage popover: tap the ring to see the exact figures. Anchored
   to the toolbar (its stacking context), floating above the message
   list; an invisible fixed scrim closes it on outside taps. */
.chat-context-pop {
  position: absolute;
  right: 16px;
  bottom: calc(100% + 10px);
  z-index: 45;
  min-width: 150px;
  padding: 10px 12px;
  border: 1px solid var(--border-default);
  border-radius: 12px;
  background: var(--card-bg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.chat-context-pop-title {
  font-size: var(--text-xs);
  color: var(--text-quaternary);
}

.chat-context-pop-figures {
  margin-top: 2px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.chat-context-pop-figures span {
  margin: 0 3px;
  color: var(--text-quaternary);
  font-weight: 400;
}

.chat-context-pop-sub {
  margin-top: 2px;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.chat-context-pop-scrim {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 40;
  background: transparent;
}

/* ── in-place quick picker (model search panel / permission list) ────── */

/* Full-screen transparent scrim above the message list; tapping it (or the
   header) dismisses the panel. The toolbar/composer/panel rows sit above
   it (z 50) so the input stays usable while picking — tapping the field
   does not dismiss the panel. */
.chat-picker-scrim {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 40;
  background: rgba(15, 15, 25, 0.2);
}

.chat-tools,
.chat-composer {
  position: relative;
  z-index: 50;
}

/* Vertical panel: search field on top, then grouped rows (model) or the
   full preset list (permission). Scrolling is the fallback, not the
   primary discovery path — the search field narrows the list first. */
.chat-picker-panel {
  position: relative;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 8px 16px 0;
  padding: 8px;
  border: 1px solid var(--border-default);
  border-radius: 14px;
  background: var(--card-bg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  max-height: 42vh;
  overflow-y: auto;
  scrollbar-width: none;
}

.chat-picker-panel::-webkit-scrollbar {
  display: none;
}

.chat-picker-group-title {
  padding: 8px 10px 4px;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-quaternary);
}

/* One option row: 44px touch target, leading check column, title + sub. */
.chat-picker-row {
  flex: none;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 6px 10px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--text-secondary);
  font: inherit;
  font-size: var(--text-sm);
  text-align: left;
  cursor: pointer;
}

.chat-picker-row:active {
  background: var(--fill);
}

.chat-picker-row-selected {
  background: var(--accent-soft);
  color: var(--accent);
}

.chat-picker-row-check {
  flex: none;
  width: 16px;
  display: flex;
  align-items: center;
  color: var(--accent);
}

.chat-picker-row-copy {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.chat-picker-row-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-picker-row-sub {
  font-size: var(--text-xs);
  color: var(--text-quaternary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-picker-row-selected .chat-picker-row-sub {
  color: var(--accent);
  opacity: 0.75;
}

.chat-picker-row-danger {
  color: var(--danger);
}

.chat-picker-row-danger .chat-picker-row-sub {
  color: var(--danger);
  opacity: 0.75;
}

.chat-picker-more {
  flex: none;
  margin-top: 4px;
  padding: 10px;
  border: 1px dashed var(--border-default);
  border-radius: 10px;
  background: transparent;
  color: var(--text-tertiary);
  font: inherit;
  font-size: var(--text-sm);
  cursor: pointer;
}

.chat-picker-status {
  padding: 10px 4px;
  color: var(--text-tertiary);
  font-size: var(--text-sm);
}

.chat-picker-error {
  color: var(--danger);
}

.chat-picker-hint {
  color: var(--text-tertiary);
}

/* ── bottom input bar: capsule field + circular send ─────────────────── */

.chat-composer {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--border-subtle);
  background: color-mix(in srgb, var(--bg-page) 88%, transparent);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
}

.chat-composer .chat-inputbar {
  border-top: none;
}

.chat-attach-btn {
  flex: none;
  align-self: flex-end;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  color: var(--text-secondary);
  background: transparent;
  cursor: pointer;
}

.chat-attach-btn:active {
  background: var(--bg-hover);
}

.chat-attach-bar {
  display: flex;
  gap: var(--space-2);
  padding: 8px 12px 0;
  overflow-x: auto;
}

.chat-attach-item {
  position: relative;
  flex: none;
  width: 56px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-default);
}

.chat-attach-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.chat-attach-remove {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: var(--text-sm);
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.chat-attach-remove:active {
  background: rgba(0, 0, 0, 0.8);
}

.chat-inputbar {
  display: flex;
  align-items: flex-end;
  gap: var(--space-2);
  padding: 8px 12px calc(env(safe-area-inset-bottom, 0px) + 10px);
  padding-bottom: max(calc(env(safe-area-inset-bottom, 0px) + 10px), 10px);
  border-top: 1px solid var(--border-subtle);
  background: color-mix(in srgb, var(--bg-page) 88%, transparent);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
}

.chat-input {
  flex: 1;
  min-width: 0;
  min-height: 44px;
  max-height: 132px;
  field-sizing: content;
  padding: 9px 16px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-capsule);
  background: var(--bg-input);
  color: var(--text-primary);
  font: inherit;
  font-size: 16px; /* ≥16px：防止 iOS 聚焦缩放 */
  font-weight: 400;
  line-height: 1.45;
  resize: none;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.chat-input::placeholder {
  color: var(--text-muted);
}

.chat-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.chat-send {
  flex: none;
  align-self: flex-end;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-full);
  background: var(--accent);
  color: var(--accent-contrast);
  font: inherit;
  cursor: pointer;
  box-shadow: 0 2px 10px var(--accent-glow);
  transition: transform 0.15s ease, filter 0.15s ease;
}

@media (hover: hover) {
  .chat-send:not(:disabled):hover {
    transform: scale(1.05);
  }
}

.chat-send:not(:disabled):active {
  transform: scale(0.95);
  filter: brightness(1.08);
}

.chat-send:disabled {
  background: var(--fill);
  color: var(--text-muted);
  box-shadow: none;
}

.chat-send svg {
  width: 18px;
  height: 18px;
}

.chat-send-stop {
  background: var(--bg-elevated);
  color: var(--danger);
  box-shadow: inset 0 0 0 1px var(--border-default);
}

.chat-load-older {
  align-self: center;
  margin: 4px 0;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font: inherit;
  font-size: var(--text-md);
  font-weight: 400;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: var(--radius-chip);
  transition: background-color 0.12s ease;
}

.chat-load-older:active {
  background: var(--fill);
}

.chat-load-older:disabled {
  opacity: 0.6;
}

.chat-typing {
  color: var(--text-tertiary);
  font-size: var(--text-md);
  padding: 4px 2px;
}

/* ── message long-press context menu ─────────────────────────────────── */

.ctx-backdrop {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 70;
}

.ctx-menu {
  position: fixed;
  z-index: 71;
  min-width: 148px;
  padding: var(--space-1);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-menu);
  background: var(--dialog-bg);
  box-shadow: var(--shadow-lg);
  animation: ctx-in 0.12s ease both;
}

@keyframes ctx-in {
  from {
    opacity: 0;
    transform: scale(0.94);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.ctx-item {
  display: flex;
  align-items: center;
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-primary);
  font: inherit;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.1s ease;
}

.ctx-item:active {
  background: var(--fill);
}

/* ── bottom sheets ───────────────────────────────────────────────────── */

.sheet-backdrop {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  /* Above the composer: the composer carries z-index 50 (so the picker
     scrim at 40 never covers it), and the sheet renders BEFORE the
     composer in the DOM - at the same stacking level the later sibling
     wins, which put the input bar over the panel's bottom. */
  z-index: 60;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: var(--backdrop);
  animation: sheet-fade 0.18s ease;
}

@keyframes sheet-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.sheet {
  /* Host data fills the sheets - model ids, slash-command names, permission
     ids, failure messages - so a long unbreakable token wraps here instead of
     running past the sheet edge, where overflow:hidden would clip it. */
  overflow-wrap: anywhere;
  /* Content-sized sheet: no height cap by default, so every list item is
     always fully visible - nothing to scroll for ordinary content. Only
     extreme content (a hundred tasks) is bounded, and the sheet then
     overflows the top of the screen while its bottom stays visible (the
     list's last item is never silently clipped). */
  max-height: 100vh;
  display: block;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-bottom: none;
  border-radius: var(--radius-sheet) var(--radius-sheet) 0 0;
  box-shadow: var(--shadow-lg);
  /* Clip any overflow to the rounded sheet. */
  overflow: hidden;
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 12px);
  animation: sheet-up 0.3s ease-out both;
}

/* Expanded (pulled up past the expand threshold): full viewport height. */
.sheet-full {
  max-height: 100vh;
}

@keyframes sheet-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

/* Grab header: the only place drag gestures are captured (touch-action:
   none), so the scrollable body below owns every other vertical gesture.
   Column flex centers the handle and title (a plain block container would
   keep the handle flush left - align-self needs a flex/grid context). */
.sheet-grab {
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  touch-action: none;
  cursor: grab;
}

.sheet-handle {
  flex: none;
  align-self: center;
  width: 36px;
  height: 4px;
  margin: 8px 0 2px;
  border-radius: 2px;
  background: var(--text-muted);
}

.sheet-title {
  flex: none;
  padding: 12px 16px 14px;
  font-size: 17px;
  font-weight: 500;
  color: var(--text-primary);
  text-align: center;
}

.sheet-body {
  /* Content-sized (height auto): an ordinary task list fits entirely and is
     always fully visible with nothing to scroll. The generous max-height
     only engages for extreme content, and the sheet above overflows the top
     of the viewport before this cap is ever hit. */
  height: auto;
  max-height: calc(100vh - 110px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0 12px 8px;
}

.sheet-full .sheet-body {
  max-height: calc(100vh - 96px);
}

/* ── file preview sheet (in-chat .file-link taps) ─────────────────────── */

/* The preview content needs most of the sheet: keep the body roomy and let
   the pre scroll inside the sheet's own scroll container. */
.fp-body {
  margin: 0;
  padding: 4px 2px 12px;
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  font-size: var(--text-md);
  line-height: 1.7;
  color: var(--text-primary);
  white-space: pre;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  /* 文件预览正文允许选中复制：body 全局 user-select:none 只豁免输入框和
     消息正文，这里放开代码/纯文本预览，长按走系统选择复制。 */
  user-select: text;
  -webkit-user-select: text;
}

/* The Shiki <pre class="shiki"> inside .fp-body gets its own themed colors;
   strip default margins so it aligns with the plain-text fallback. */
.fp-body pre.shiki {
  margin: 0;
}

/* Markdown previews inside the sheet have no .chat-msg ancestor to inherit
   its 1.7 rhythm from — set the base here so prose, lists and code read the
   same as in the chat. */
.fp-md {
  line-height: 1.7;
  /* 同 .md-html：正文里的长 URL / 路径必须能断行，否则会被 .fp-scroll 裁掉。 */
  overflow-wrap: anywhere;
  /* 同 .fp-body：markdown 预览正文允许选中复制（body 全局 user-select:none
     不豁免这里，长按走系统选择复制）。 */
  user-select: text;
  -webkit-user-select: text;
}

/* Long plain/code/log previews fold like chat long-text: a bounded body
   with a soft fade and an 展开全部 toggle below. */
.fp-scroll {
  position: relative;
  overflow: hidden;
}

.fp-scroll-folded {
  max-height: 45vh;
  overflow-y: hidden;
}

.fp-scroll-folded::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 48px;
  background: linear-gradient(transparent, var(--bg-surface));
  pointer-events: none;
}

.fp-fold-btn {
  display: block;
  width: 100%;
  height: 36px;
  margin-top: 4px;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  background: var(--bg-elevated);
  color: var(--accent);
  font: inherit;
  font-size: var(--text-md);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.12s ease;
}

.fp-fold-btn:active {
  background: var(--fill);
}

.fp-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 2px 0 10px;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 10px;
}

.fp-path {
  flex: 1;
  min-width: 0;
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  direction: rtl;
  text-align: left;
}

.fp-copy {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-elevated);
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.fp-copy svg {
  width: 14px;
  height: 14px;
}

.fp-loading,
.fp-error {
  padding: 24px 8px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: var(--text-md);
}

.fp-error {
  color: var(--danger, #d5484a);
}

/* Sandboxed HTML preview: a white canvas keeps un-styled documents readable
   in both themes; the iframe scrolls inside the sheet like the code body. */
.fp-html {
  display: block;
  width: 100%;
  height: calc(100vh - 230px);
  min-height: 240px;
  border: none;
  border-radius: 8px;
  background: #fff;
}

/* Local image preview inside the sheet: fit width, auto height, scrollable. */
.fp-image-wrap {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 4px 0 12px;
}

.fp-image {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

/* ── full-screen image lightbox (in-chat <img> tap) ───────────────────── */

.lightbox-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.86);
  -webkit-tap-highlight-color: transparent;
}

.lightbox-stage {
  max-width: 96vw;
  max-height: 88vh;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

.lightbox-img {
  display: block;
  max-width: 96vw;
  max-height: 86vh;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}

/* Full-size zoom: no fit constraint, the stage scrolls to pan. */
.lightbox-stage-full {
  max-height: 88vh;
}

.lightbox-stage-full .lightbox-img {
  max-width: none;
  max-height: none;
  width: auto;
  height: auto;
}

.lightbox-close {
  position: absolute;
  top: calc(env(safe-area-inset-top, 0px) + 10px);
  right: 12px;
  z-index: 1;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}

.lightbox-close svg {
  width: 20px;
  height: 20px;
}

.lightbox-hint {
  position: absolute;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 14px);
  left: 0;
  right: 0;
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  pointer-events: none;
}

.sheet-status {
  padding: 18px 8px;
  color: var(--text-tertiary);
  font-size: var(--text-md);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);}

.sheet-status-error {
  color: var(--danger);
}

.sheet-hint {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  line-height: 1.5;
  max-width: 32em;
}

.sheet-error {
  margin: 0 0 8px;
  color: var(--danger);
  font-size: 12.5px;
}

.sheet-section {
  margin-bottom: 14px;
}

.sheet-section-title {
  padding: 4px 8px 6px;
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  font-weight: 500;
}

/* Sheet option rows: 56px, icon + text + right check. */
.sheet-option {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  min-height: 56px;
  padding: 8px 12px;
  border: 1px solid transparent;
  border-radius: var(--radius-chip);
  background: transparent;
  color: var(--text-primary);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.12s ease, border-color 0.12s ease, transform 0.1s ease;
}

.sheet-option:active {
  transform: scale(0.98);
  background: var(--fill);
}

.sheet-option-selected {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.sheet-option:disabled {
  opacity: 0.5;
}

.sheet-option-divider {
  height: 1px;
  margin: 4px 12px;
  background: var(--border-subtle);
}

.sheet-note {
  margin: 0;
  padding: 12px 16px;
  color: var(--text-secondary);
  font-size: var(--text-md);
}

.sheet-option-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sheet-option-title {
  font-size: 14px;
  font-weight: 400;
}

.sheet-option-desc {
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  font-weight: 400;
  line-height: 1.4;
}

.sheet-option-check {
  flex: none;
  color: var(--accent);
  font-size: var(--text-base);
  font-weight: 500;
}

.sheet-confirm-desc {
  margin: 0 4px 14px;
  color: var(--text-secondary);
  font-size: var(--text-md);
  line-height: 1.6;
}

.sheet-confirm-actions {
  display: flex;
  gap: 10px;
  padding: var(--space-1);
}

.sheet-confirm-actions .mobile-button {
  flex: 1;
  margin: 0;
}

.sheet-confirm-actions .mobile-button svg {
  width: 16px;
  height: 16px;
  margin-right: 6px;
  vertical-align: -2px;
}

.sheet-confirm-danger {
  flex: 1;
  height: 44px;
  border: none;
  border-radius: var(--radius-chip);
  background: var(--danger);
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.1s ease, filter 0.1s ease;
}

.sheet-confirm-danger:active {
  transform: scale(0.98);
  filter: brightness(1.08);
}

.sheet-confirm-danger:disabled {
  opacity: 0.5;
  transform: none;
}

/* Primary action button (accent fill) inside sheets. */
.mobile-button-primary {
  border: none;
  background: var(--accent);
  color: var(--accent-contrast);
}

.mobile-button-primary:active {
  background: var(--accent);
  filter: brightness(1.08);
}

/* Voice service list rows inside the settings sheet. */
.voice-service-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 56px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-subtle);
}

.voice-service-row:last-child {
  border-bottom: none;
}

.voice-service-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.voice-service-name {
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.voice-service-desc {
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.voice-service-actions {
  flex: none;
  display: flex;
  gap: 2px;
}

.voice-service-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid transparent;
  border-radius: var(--radius-chip);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background-color 0.12s ease, color 0.12s ease, transform 0.1s ease;
}

.voice-service-btn:active {
  transform: scale(0.94);
  background: var(--fill);
}

.voice-service-btn:disabled {
  opacity: 0.35;
  transform: none;
}

.voice-service-btn svg {
  width: 16px;
  height: 16px;
}

.voice-service-btn-down svg {
  transform: rotate(180deg);
}

.voice-service-btn-danger {
  color: var(--danger);
}

/* Voice service edit form. */
.voice-form {
  padding: 4px 16px 12px;
}

.voice-form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.voice-form-label {
  color: var(--text-secondary);
  font-size: 12.5px;
  font-weight: 500;
}

.voice-form-input {
  width: 100%;
  height: 44px;
  padding: 0 12px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-chip);
  background: var(--card-bg);
  color: var(--text-primary);
  font: inherit;
  font-size: 14px;
  outline: none;
  transition: border-color 0.12s ease;
}

.voice-form-input:focus {
  border-color: var(--accent);
}

.voice-form-input::placeholder {
  color: var(--text-tertiary);
}

/* Paired-device management rows (settings → 设备管理). */
.device-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 60px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-subtle);
}

.device-row:last-child {
  border-bottom: none;
}

.device-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.device-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-badge {
  flex: none;
  font-size: 10.5px;
  font-weight: 600;
  line-height: 1;
  padding: 3px 6px;
  border-radius: var(--radius-chip);
}

.device-badge-primary {
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 14%, transparent);
}

.device-badge-current {
  color: var(--text-secondary);
  background: var(--fill);
}

.device-desc {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-status {
  flex: none;
  color: var(--text-tertiary);
}

.device-status-on {
  color: var(--success, #2e9e5b);
}

.device-ua {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-actions {
  flex: none;
  display: flex;
  gap: 2px;
}

.device-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid transparent;
  border-radius: var(--radius-chip);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background-color 0.12s ease, color 0.12s ease, transform 0.1s ease;
}

.device-btn:active {
  transform: scale(0.94);
  background: var(--fill);
}

.device-btn:disabled {
  opacity: 0.35;
  transform: none;
}

.device-btn svg {
  width: 16px;
  height: 16px;
}

.device-btn-danger {
  color: var(--danger);
}

/* ── centered confirm dialog ─────────────────────────────────────────── */

.dialog-backdrop {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  background: var(--backdrop);
  animation: sheet-fade 0.18s ease;
}

.dialog {
  width: min(100%, 340px);
  padding: var(--space-5);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-menu);
  background: var(--dialog-bg);
  box-shadow: var(--shadow-lg);
  animation: dialog-in 0.2s ease-out both;
  /* A dialog title can be a workspace name or a path: wrap it rather than
     letting it bleed past the fixed-width box. */
  overflow-wrap: anywhere;
}

@keyframes dialog-in {
  from {
    transform: scale(0.94);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.dialog-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

.dialog-body {
  margin: 0 0 16px;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--text-secondary);
  overflow-wrap: anywhere;
}

.dialog-actions {
  display: flex;
  gap: var(--space-2);
  justify-content: flex-end;
}

.dialog-btn {
  min-width: 72px;
  height: 44px;
  padding: 0 16px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-chip);
  background: transparent;
  color: var(--text-secondary);
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.1s ease, background-color 0.1s ease;
}

.dialog-btn:active {
  transform: scale(0.98);
  background: var(--fill);
}

.dialog-btn:disabled {
  opacity: 0.5;
  transform: none;
}

.dialog-btn-primary {
  border: none;
  background: var(--accent);
  color: var(--accent-contrast);
}

.dialog-btn-primary:active {
  background: var(--accent);
  filter: brightness(1.08);
}

.dialog-btn-danger {
  border: none;
  background: var(--danger);
  color: #fff;
}

.dialog-btn-danger:active {
  background: var(--danger);
  filter: brightness(1.08);
}

/* ≥16px: iOS zoom prevention on the prompt input. */
.dialog-input {
  width: 100%;
  height: 44px;
  margin: 0 0 16px;
  padding: 0 14px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-chip);
  background: var(--bg-input);
  color: var(--text-primary);
  font: inherit;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.dialog-input:focus {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

/* ── toast ───────────────────────────────────────────────────────────── */

.toast-host {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(104px + env(safe-area-inset-bottom, 0px));
  z-index: 80;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  pointer-events: none;
}

.toast {
  max-width: 78vw;
  padding: 9px 16px;
  border-radius: var(--radius-full);
  background: var(--toast-bg);
  color: var(--toast-text);
  font-size: var(--text-md);
  font-weight: 400;
  box-shadow: var(--shadow-lg);
  animation: toast-in 0.25s ease-out both;
  /* A toast prints a file path when a perf report is filed; the pill is capped
     at 78vw, so wrap the token instead of letting it bleed out both sides. */
  overflow-wrap: anywhere;
  min-width: 0;
}

.toast-out {
  animation: toast-out 0.2s ease both;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes toast-out {
  to {
    opacity: 0;
    transform: translateY(8px) scale(0.96);
  }
}/* ── focus rings ─────────────────────────────────────────────────────── */

.mobile-back:focus-visible, .mobile-theme-toggle:focus-visible, .mobile-iconbtn:focus-visible, .mobile-headerAction:focus-visible, .mobile-quickchip:focus-visible, .mobile-searchInput:focus-visible, .mobile-row:focus-visible, .mobile-createCard:focus-visible, .mobile-presetTrigger:focus-visible, .mobile-presetHelp:focus-visible, .mobile-button:focus-visible, .mobile-new:focus-visible, .settings-themeOption:focus-visible, .settings-optionChip:focus-visible, .settings-switch:focus-visible, .dialog-btn:focus-visible, .dialog-input:focus-visible, .chat-send:focus-visible, .chat-msg-toggle:focus-visible, .chat-load-older:focus-visible, .chat-disclosure-head:focus-visible, .chat-question-option:focus-within, .ctx-item:focus-visible, .sheet-option:focus-visible, .sheet-confirm-danger:focus-visible, .chat-input:focus-visible{
  outline: none;
  box-shadow: 0 0 0 2px var(--bg-page), 0 0 0 4px var(--accent);
}

/* ── installed-app pairing ───────────────────────────────────────────── */

.mobile-pair {
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: var(--space-6);
}

.mobile-pairCard {
  display: grid;
  width: min(100%, 420px);
  gap: var(--space-3);
  padding: var(--space-6);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-card);
  background: var(--card-bg);
  box-shadow: var(--shadow-lg);
}

.mobile-pairLabel {
  color: var(--text-secondary);
  font-size: var(--text-md);
  font-weight: 500;
}

.mobile-pairInput {
  width: 100%;
  min-height: 48px;
  box-sizing: border-box;
  padding: 9px 14px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-chip);
  background: var(--bg-input);
  color: var(--text-primary);
  font: inherit;
  outline: none;
}

.mobile-pairInput:focus-visible {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 2px var(--bg-page), 0 0 0 4px var(--accent);
}

.mobile-pairSubmit {
  width: 100%;
  margin: 0;
}

/* ── directory browser ───────────────────────────────────────────────── */

.dir-browser {
  display: flex;
  flex-direction: column;
}

.dir-crumbs {
  display: flex;
  align-items: center;
  overflow-x: auto;
  padding: 10px 12px;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-subtle);
  white-space: nowrap;
  scrollbar-width: none;
}

.dir-crumbs::-webkit-scrollbar {
  display: none;
}

.dir-crumb {
  border: none;
  background: transparent;
  padding: 8px 8px;
  border-radius: var(--radius-chip);
  color: var(--text-secondary);
  font: inherit;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.12s ease;
}

.dir-crumb:active {
  background: var(--fill);
  color: var(--accent);
}

.dir-crumb-separator {
  color: var(--text-muted);
  margin: 0 2px;
  font-size: 14px;
}

.dir-entry {
  padding-left: 16px;
}

.dir-entry-hidden {
  opacity: 0.5;
}

.dir-select {
  flex: none;
  padding: 12px 16px calc(env(safe-area-inset-bottom, 0px) + 12px);
  background: color-mix(in srgb, var(--bg-page) 88%, transparent);
  border-top: 1px solid var(--border-subtle);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
}

.dir-select .mobile-button {
  width: 100%;
  margin: 0;
}

.dir-empty {
  padding: 40px 0;
}

/* ── Mobile plugin market (MarketView) ───────────────────────────────── */

.market-row {
  /* No icon zone: text + install button. */
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
}

.market-rowMain {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 14px 0;
}

.market-rowTitle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--text-primary);
  word-break: break-all;
}

.market-badge {
  flex: none;
  padding: 1px 8px;
  border-radius: var(--radius-chip);
  background: var(--accent-soft);
  color: var(--accent);
  font-size: var(--text-xs);
  font-weight: 400;
}

.market-rowDesc {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--text-tertiary);
  font-size: 12.5px;
  line-height: 1.45;
  word-break: break-word;
}

.market-install {
  flex: none;
  min-width: 58px;
  padding: 8px 12px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-chip);
  background: transparent;
  color: var(--accent);
  font: inherit;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.12s ease, transform 0.1s ease;
}

.market-install:active {
  transform: scale(0.96);
}

.market-install:disabled {
  opacity: 0.45;
  cursor: default;
  transform: none;
}

.market-install:not(:disabled):active {
  background: var(--accent-soft);
}

/* ── reduced motion ──────────────────────────────────────────────────── */

@media (prefers-reduced-motion: reduce) {
  .page-enter-fwd,
  .page-exit-fwd,
  .page-enter-back,
  .page-exit-back,
  .mobile-back,
  .mobile-theme-toggle,
  .mobile-iconbtn,
  .mobile-headerAction,
  .mobile-quickchip,
  .mobile-row,
  .mobile-createCard,
  .mobile-button,
  .mobile-button-muted,
  .mobile-new,
  .chat-send,
  .chat-chip,
  .chat-msg,
  .chat-msg-toggle,
  .chat-load-older,
  .chat-disclosure-head,
  .chat-disclosure-caret,
  .chat-disclosure-body,
  .sess-dot-running,
  .boot-dot,
  .skel,
  .toast,
  .ctx-menu,
  .dialog,
  .sheet-backdrop,
  .sheet,
  .sheet-option,
  .sheet-confirm-danger,
  .settings-switch::after,
  .sheet-toggle-switch-knob,
  .chat-input,
  .chat-turn-dots span,
  .settings-themeOption,
  .settings-optionChip {
    animation: none;
    transition: none;
  }
}
/* ── v2.1 increments: workspace tints / search morph / status semantics ──
   / previews / reasoning clamp / quote bar / quick commands /
   voice sheet / offline banner / settings feedback. Appended after the base
   system so the established spec stays untouched. */

/* Plain folder (workspace without sessions): gray tile. */
.ws-icon-plain > * {
  background: color-mix(in srgb, var(--text-tertiary) 15%, transparent);
  color: var(--text-tertiary);
}

/* Empty-group placeholder card (72px tier, centered copy + 创建). */
.mobile-empty-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: calc(100% - 32px);
  margin: 0 16px 8px;
  min-height: 72px;
  border: 1px dashed var(--card-border);
  border-radius: var(--radius-card);
  color: var(--text-quaternary);
  font-size: var(--text-md);
}

.mobile-empty-groupBtn {
  border: none;
  background: transparent;
  color: var(--accent);
  font: inherit;
  font-size: var(--text-md);
  font-weight: 500;
  padding: 8px 10px;
  border-radius: var(--radius-chip);
  cursor: pointer;
}

.mobile-empty-groupBtn:active {
  background: var(--accent-soft);
}

/* Session-list header search morph (200ms) + its input. */
.mobile-headerSearch {
  min-width: 0;
  display: flex;
  align-items: center;
  animation: search-morph 0.2s ease both;
}

@keyframes search-morph {
  from {
    opacity: 0;
    transform: scaleX(0.96);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.mobile-headerSearchInput {
  width: 100%;
  height: 38px;
  padding: 0 14px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-capsule);
  background: var(--bg-input);
  color: var(--text-primary);
  font: inherit;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.mobile-headerSearchInput:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

/* Session status semantics: running pulse + label, settled check. */
.sess-status {
  flex: none;
  color: var(--positive);
  font-size: var(--text-xs);
  font-weight: 500;
}

.sess-check {
  display: flex;
  color: var(--text-quaternary);
}

.sess-check svg {
  width: 16px;
  height: 16px;
}

/* Reasoning clamp expander. */
.chat-reasoning-more {
  display: block;
  width: 100%;
  border: none;
  border-top: 1px dashed var(--border-subtle);
  background: transparent;
  color: var(--accent);
  font: inherit;
  font-size: var(--text-sm);
  font-weight: 500;
  padding: 7px 12px;
  text-align: center;
  cursor: pointer;
}

.chat-reasoning-more:active {
  background: var(--fill);
}

/* Code pre keeps pinch-zoom transforms contained. */
.code-block pre {
  transition: transform 0.05s linear;
  will-change: transform;
}

/* Message footer: the timestamp line. */
.chat-msg-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.chat-msg-footer .chat-msg-time {
  flex: 1;
}

/* Regenerate affordance on the last settled assistant reply (footer, right). */
.chat-msg-regenerate {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  padding: 2px 6px;
  border-radius: var(--radius-chip);
  background: transparent;
  color: var(--accent);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: background-color 0.12s ease;
}

.chat-msg-regenerate:active {
  background: var(--fill);
}

.chat-msg-regenerate-icon {
  font-size: 13px;
  line-height: 1;
}

/* Pending-message queue dock (desktop QueueDock equivalent): the messages
   queued while the current turn runs, above the composer. */
.queue-dock {
  flex: none;
  margin: 0 12px 8px;
  padding: 8px 10px;
  border: 1px solid var(--border-default);
  border-radius: 12px;
  background: var(--bg-elevated);
}
.queue-dockHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 2px 0;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--text-xs);
  font-weight: 600;
}
.queue-dockCount {
  color: var(--accent, #4f7cff);
}
.queue-dockChevron {
  color: var(--text-tertiary);
}
.queue-dockList {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 6px 0 0;
  padding: 0;
  list-style: none;
}
.queue-dockRow {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 10px;
  background: var(--card-bg);
}
.queue-dockRow[data-placement='steering'] {
  border-left: 2px solid var(--accent, #4f7cff);
}
.queue-dockText {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-primary);
  font-size: var(--text-sm);
}
.queue-dockActions {
  flex: 0 0 auto;
  display: flex;
  gap: 4px;
}
.queue-dockBtn {
  flex: none;
  padding: 3px 8px;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: transparent;
  color: var(--text-tertiary);
  font-size: var(--text-xs);
}
.queue-dockBtn-primary {
  border-color: var(--accent, #4f7cff);
  color: var(--accent, #4f7cff);
}
.queue-dockBtn:disabled {
  opacity: 0.4;
}
.queue-dockEdit {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}
.queue-dockInput {
  flex: 1 1 auto;
  min-width: 0;
  padding: 5px 8px;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: var(--bg-elevated);
  color: var(--text-primary);
  font-size: var(--text-sm);
}

/* Offline / queued banner (32px, warning wash, slide-down). */
.chat-offline-banner {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  min-height: 32px;
  padding: 0 16px;
  background: color-mix(in srgb, var(--warning) 15%, transparent);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  animation: banner-in 0.2s ease both;
}

@keyframes banner-in {
  from {
    transform: translateY(-32px);
    opacity: 0;
  }
  to {
    transform: none;
    opacity: 1;
  }
}

.chat-offline-retry {
  flex: none;
  border: none;
  background: transparent;
  color: var(--danger);
  font: inherit;
  font-size: var(--text-sm);
  font-weight: 500;
  padding: 4px 8px;
  border-radius: var(--radius-chip);
  cursor: pointer;
}

.chat-offline-retry:active {
  background: var(--danger-soft);
}

/* Quote bar above the composer (3px accent rail, first 20 chars). */
.chat-quote-bar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 40px;
  margin: 0 0 6px;
  padding: 6px 10px;
  border-left: 3px solid var(--accent);
  border-radius: var(--radius-chip);
  background: var(--bg-elevated);
  animation: quote-in 0.18s ease both;
}

@keyframes quote-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.chat-quote-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-secondary);
  font-size: var(--text-md);
}

.chat-quote-close {
  flex: none;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-chip);
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
}

.chat-quote-close:active {
  background: var(--fill);
}

/* Voice recording sheet: 200px, waveform bars, live transcript. */
.voice-backdrop {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 55;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: var(--backdrop);
  animation: sheet-fade 0.18s ease;
}

.voice-sheet {
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  background: var(--bg-surface);
  border-radius: var(--radius-sheet) var(--radius-sheet) 0 0;
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 12px);
  animation: sheet-up 0.3s ease-out both;
}

.voice-wave {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 44px;
}

.voice-wave span {
  width: 5px;
  height: 22px;
  border-radius: var(--radius-full);
  background: var(--accent);
  animation: voice-bar 1s ease-in-out infinite;
}

.voice-wave span:nth-child(1) { animation-delay: 0s; }
.voice-wave span:nth-child(2) { animation-delay: 0.12s; }
.voice-wave span:nth-child(3) { animation-delay: 0.24s; }
.voice-wave span:nth-child(4) { animation-delay: 0.36s; }
.voice-wave span:nth-child(5) { animation-delay: 0.48s; }

@keyframes voice-bar {
  0%, 100% {
    transform: scaleY(0.35);
    opacity: 0.5;
  }
  50% {
    transform: scaleY(1.25);
    opacity: 1;
  }
}

.voice-text {
  max-width: 82vw;
  min-height: 22px;
  color: var(--accent);
  font-size: 14px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.voice-done {
  height: 40px;
  padding: 0 24px;
  border: none;
  border-radius: var(--radius-capsule);
  background: var(--accent);
  color: var(--accent-contrast);
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.voice-done:active {
  transform: scale(0.97);
  filter: brightness(1.08);
}

/* Settings search field. */
.settings-search {
  padding: 0 16px 12px;
}/* Toggle knob spring (overshoot then settle, 200ms). */
.settings-switch::after{
  transition: transform 0.2s cubic-bezier(0.34, 1.8, 0.64, 1);
}

/* Tapped setting row flashes the elevated wash (100ms). */
button.settings-row {
  transition: background-color 0.1s ease;
}

button.settings-row:active {
  background: var(--bg-elevated) !important;
}

/* ── reduced motion additions ────────────────────────────────────────── */

@media (prefers-reduced-motion: reduce) {
  .mobile-headerSearch,
  .mobile-empty-groupBtn,
  .chat-reasoning-more,
  .chat-offline-banner,
  .chat-offline-retry,
  .chat-quote-bar,
  .voice-backdrop,
  .voice-sheet,
  .voice-wave span,
  .voice-done {
    animation: none;
    transition: none;
  }
}

/* ── in-body think blocks ─────────────────────────────────────────────
   The interactive message body mounts the shared ReasoningDisclosure
   (chat-disclosure chrome: #16161f bg, 10px radius, 36px collapsed row,
   5 visible lines) — no extra CSS. These rules only fix the native
   <details> chrome used by the static string renderer on top of the same
   classes: hide the summary marker and rotate the caret when open. */

details.think-block,
details.think-block .chat-disclosure-head {
  list-style: none;
}

details.think-block summary::-webkit-details-marker {
  display: none;
}

details.think-block summary {
  cursor: pointer;
}

details.think-block[open] .chat-disclosure-caret {
  transform: rotate(180deg);
}

/* Long-token fallback for every multi-line text container: unwrapped
   paths/URLs (Windows drives, command lines, service endpoints) wrap
   anywhere instead of overflowing the row and drifting the layout. */
.settings-note,
.settings-fieldDesc,
.sheet-option-desc,
.mobile-error,
.empty-desc,
.mobile-muted,
.settings-inboxRow .card-desc {
  overflow-wrap: anywhere;
}

/* Search result notes (truncation / scope hints). */
.search-hitsNote {
  margin: 0;
  padding: 4px 2px;
  color: var(--text-tertiary);
  font-size: var(--text-xs);
  line-height: 1.45;
}

/* Focus-locate highlight: a one-shot background pulse on the located row. */
@keyframes dshPalmFocusPulse {
  0% { background-color: var(--focus-bg, rgba(79, 124, 255, 0.22)); }
  100% { background-color: transparent; }
}

.chat-msg-focus {
  animation: dshPalmFocusPulse 2.2s ease-out forwards;
}

.chat-search-mark {
  color: inherit;
  background: color-mix(in srgb, var(--accent) 34%, transparent);
  border-radius: 3px;
  padding: 0 1px;
}

/* Settings-search locate: the anchored sub-page entry pulses once on
   arrival, so the user sees which control the search found. */
[data-locate-id][data-focus] {
  animation: dshPalmFocusPulse 2.2s ease-out forwards;
}

/* ── global run overview (cross-session background tasks) ────────────── */

.runov-page {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.runov-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 20px);
}

.runov-hero {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 16px 4px;
  padding: 12px 14px;
  border-radius: var(--radius-card);
  background: var(--bg-elevated);
}

.runov-hero-copy {
  flex: 1;
  min-width: 0;
}

.runov-hero-t {
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--text-primary);
}

.runov-hero-s {
  margin-top: 1px;
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  font-variant-numeric: tabular-nums;
}

.runov-group-title {
  padding: 16px 18px 6px;
  color: var(--text-tertiary);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.runov-sess {
  margin: 4px 16px 12px;
  border: 1px solid var(--card-border);
  border-radius: var(--radius-card);
  background: var(--card-bg);
  box-shadow: var(--card-shadow);
  overflow: hidden;
}

.runov-sess-head {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px 14px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.runov-sess-head:active {
  background: var(--fill);
}

/* text-overflow only engages on a block box: as inline spans inside the head's
   flex:1 wrapper these clipped silently, with no ellipsis marker. */
.runov-sess-title {
  display: block;
  font-size: var(--text-base);
  font-weight: 600;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.runov-sess-sub {
  display: block;
  margin-top: 2px;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-quaternary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.runov-sess-live {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--positive) 13%, transparent);
  color: var(--positive);
  font-size: var(--text-xs);
  font-weight: 600;
  white-space: nowrap;
}

.runov-sess-chev {
  flex: none;
  margin-left: auto;
  color: var(--text-quaternary);
  font-size: 18px;
  line-height: 1;
}

/* In-card group label ("子代理" / "后台任务"): smaller than the page-level
   .runov-group-title and flush with the rows it introduces (the card's job
   rows carry no horizontal inset of their own). */
.runov-subgroup-title {
  padding: 8px 0 2px;
  color: var(--text-tertiary);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.4px;
}

.runov-jobs {
  border-top: 1px solid var(--border-subtle);
  padding: 4px 0;
}

/* Fold header for a session's settled (completed/failed/killed) jobs: a quiet
   one-line summary so many finished tasks do not bury what is running now. */
.runov-jobs-fold {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 6px 16px;
  border: none;
  border-top: 1px solid var(--border-subtle);
  background: transparent;
  color: var(--text-tertiary);
  font: inherit;
  font-size: var(--text-sm);
  cursor: pointer;
}

.runov-jobs-fold:active {
  background: var(--fill);
}

.runov-jobs-fold-label {
  font-weight: 500;
}

.runov-jobs-fold-chev {
  color: var(--text-quaternary);
  font-size: var(--text-xs);
}

/* Settled job rows are de-emphasized so the eye lands on live work first. */
.runov-jobs-settled .chat-task-row {
  opacity: 0.72;
}

/* Turn list floating handle (轮次清单): a compact pill pinned beside the
   jump-to-latest button; shows the current turn / total count. Rides the
   same sticky flex column as chat-jump-latest (aligned flex-end), offset
   above the round button so the two never overlap. */
.chat-jump-turns {
  position: sticky;
  bottom: 58px;
  align-self: flex-end;
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 32px;
  padding: 0 12px;
  border-radius: 16px;
  border: 1px solid var(--border-subtle);
  background: var(--surface-2);
  color: var(--text-2);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
  cursor: pointer;
  /* A press-and-hold must still count as a tap, AND the hold must own the
     gesture: with manipulation/auto the browser claims the move for page
     scrolling and fires pointercancel, which closes the scrubber the instant
     it opens. none keeps every move on the handle. */
  -webkit-user-select: none;
  user-select: none;
  touch-action: none;
  transition: background 120ms ease, color 120ms ease, transform 120ms ease;
  animation: chat-jump-in 160ms ease-out;
}
.chat-jump-turns:active {
  transform: scale(0.92);
}

/* 「回到上次」 bookmark chip: the same pill family as the turn handle, pinned
   a third rung higher in the sticky flex column (latest 12px, turns 58px, this
   one 104px) so the three never overlap. Shows regardless of scroll position —
   the whole point is tapping it WITHOUT first scrolling away from the tail. */
.chat-jump-lastread {
  position: sticky;
  bottom: 104px;
  align-self: flex-end;
  margin-top: auto;
  display: flex;
  align-items: center;
  min-width: 48px;
  height: 32px;
  padding: 0 12px;
  border-radius: 16px;
  border: 1px solid var(--accent);
  background: var(--surface-2);
  color: var(--accent);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
  cursor: pointer;
  font-size: 13px;
  -webkit-user-select: none;
  user-select: none;
  touch-action: manipulation;
  transition: background 120ms ease, color 120ms ease, transform 120ms ease;
  animation: chat-jump-in 160ms ease-out;
}
.chat-jump-lastread:active {
  transform: scale(0.92);
}
.chat-jump-turns-label {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

/* Turn list sheet rows: one button per turn. A left accent bar marks the
   current turn; an unloaded turn shows a faint dot on the right. Preview
   lines ellipsize on their own line (block + overflow hidden), so long
   prompts / responses never blow out the sheet width. */
.turn-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 2px 0;
}
.turn-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  width: 100%;
  padding: 8px 12px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  color: var(--text-primary);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.12s ease, border-color 0.12s ease, transform 0.1s ease;
}
.turn-row:active {
  transform: scale(0.98);
  background: var(--fill);
}
/* Current turn: accent vertical bar on the left edge. */
.turn-row-current {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.turn-row-accent {
  flex-shrink: 0;
  width: 3px;
  align-self: stretch;
  border-radius: 2px;
  background: transparent;
  margin: 2px 0;
}
.turn-row-current .turn-row-accent {
  background: var(--accent);
}
.turn-row-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
/* The number + prompt share one ellipsizing row; the response is an
   indented line under it. Each text line shrinks (flex-shrink: 1 with
   min-width: 0 on the parent column) so anywhere-wrapping long tokens
   cannot widen the sheet. */
.turn-row-head {
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-shrink: 1;
}
.turn-row-num {
  flex-shrink: 0;
  font-weight: 600;
  font-size: 14px;
  color: var(--accent);
}
.turn-row-prompt {
  min-width: 0;
  flex-shrink: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 500;
}
.turn-row-response {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-left: 18px;
  color: var(--text-tertiary);
  font-size: var(--text-sm);
}
.turn-row-dot {
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-quaternary);
  opacity: 0.6;
}

/* ── D1 turn scrubber ──────────────────────────────────────────────────
   Docks above the composer while the turn handle is held: target turn +
   prompt on one line, the response preview beneath it, then a full-width
   rail carrying one tick per turn and a knob at the pointed turn. The
   gesture runs on the handle (which owns the pointer capture), so the card
   itself stays pointer-inert and never steals the drag. */
.turn-scrub {
  margin: 8px 16px 0;
  padding: 10px 14px 9px;
  border-radius: 14px;
  background: var(--card-bg);
  border: 1px solid var(--accent);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
  animation: chat-jump-in 160ms ease-out;
  pointer-events: none;
}
.turn-scrub-head {
  display: flex;
  align-items: baseline;
  gap: 7px;
  min-width: 0;
}
.turn-scrub-num {
  flex-shrink: 0;
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}
.turn-scrub-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--text-sm);
  font-weight: 500;
}
.turn-scrub-sub {
  margin-top: 1px;
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* The track is taller than the rail so the knob has room to sit proud. */
.turn-scrub-track {
  position: relative;
  height: 26px;
  margin-top: 6px;
}
.turn-scrub-rail {
  position: absolute;
  left: 0;
  right: 0;
  top: 11px;
  height: 4px;
  border-radius: 2px;
  background: var(--fill);
}
.turn-scrub-fill {
  position: absolute;
  left: 0;
  top: 11px;
  height: 4px;
  border-radius: 2px;
  background: var(--accent);
}
.turn-scrub-tick {
  position: absolute;
  top: 9px;
  width: 2px;
  height: 8px;
  margin-left: -1px;
  border-radius: 1px;
  background: var(--border-default);
}
.turn-scrub-tick-at {
  background: var(--text-secondary);
}
.turn-scrub-knob {
  position: absolute;
  top: 2px;
  width: 22px;
  height: 22px;
  margin-left: -11px;
  border-radius: 50%;
  background: var(--card-bg);
  border: 3px solid var(--accent);
}
.turn-scrub-hint {
  margin-top: 3px;
  font-size: var(--text-sm);
  color: var(--text-quaternary);
}
/* Held: the handle reads as the live scrub control. */
.chat-jump-turns-live {
  border-color: var(--accent);
  color: var(--accent);
}
`,document.head.appendChild(rf);const af=document.getElementById(`root`);if(af===null)throw Error(`mobile: #root missing`);of(af);async function of(e){let t=await Fd(window.location.href);if(t.kind===`accepted`){window.location.replace(t.path);return}t.kind===`failed`&&window.history.replaceState(null,``,t.path),nf(),(0,l.createRoot)(e).render((0,G.jsx)(ef,{children:(0,G.jsx)(Yd,{initialPairError:t.kind===`failed`?t.message:void 0})}))}
//# sourceMappingURL=mobile.js.map