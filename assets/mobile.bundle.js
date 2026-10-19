var H5=Object.create;var sy=Object.defineProperty;var q5=Object.getOwnPropertyDescriptor;var P5=Object.getOwnPropertyNames;var V5=Object.getPrototypeOf,U5=Object.prototype.hasOwnProperty;var ei=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(n){throw t=0,n}};var B5=(e,t,n,a)=>{if(t&&typeof t=="object"||typeof t=="function")for(let i of P5(t))!U5.call(e,i)&&i!==n&&sy(e,i,{get:()=>t[i],enumerable:!(a=q5(t,i))||a.enumerable});return e};var K=(e,t,n)=>(n=e!=null?H5(V5(e)):{},B5(t||!e||!e.__esModule?sy(n,"default",{value:e,enumerable:!0}):n,e));var by=ei(mt=>{"use strict";function dm(e,t){var n=e.length;e.push(t);e:for(;0<n;){var a=n-1>>>1,i=e[a];if(0<jc(i,t))e[a]=t,e[n]=i,n=a;else break e}}function ti(e){return e.length===0?null:e[0]}function Fc(e){if(e.length===0)return null;var t=e[0],n=e.pop();if(n!==t){e[0]=n;e:for(var a=0,i=e.length,r=i>>>1;a<r;){var o=2*(a+1)-1,s=e[o],l=o+1,d=e[l];if(0>jc(s,n))l<i&&0>jc(d,s)?(e[a]=d,e[l]=n,a=l):(e[a]=s,e[o]=n,a=o);else if(l<i&&0>jc(d,n))e[a]=d,e[l]=n,a=l;else break e}}return t}function jc(e,t){var n=e.sortIndex-t.sortIndex;return n!==0?n:e.id-t.id}mt.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(ly=performance,mt.unstable_now=function(){return ly.now()}):(om=Date,dy=om.now(),mt.unstable_now=function(){return om.now()-dy});var ly,om,dy,Mi=[],or=[],j5=1,va=null,mn=3,cm=!1,Ml=!1,Al=!1,um=!1,fy=typeof setTimeout=="function"?setTimeout:null,py=typeof clearTimeout=="function"?clearTimeout:null,cy=typeof setImmediate<"u"?setImmediate:null;function Gc(e){for(var t=ti(or);t!==null;){if(t.callback===null)Fc(or);else if(t.startTime<=e)Fc(or),t.sortIndex=t.expirationTime,dm(Mi,t);else break;t=ti(or)}}function fm(e){if(Al=!1,Gc(e),!Ml)if(ti(Mi)!==null)Ml=!0,es||(es=!0,Wo());else{var t=ti(or);t!==null&&pm(fm,t.startTime-e)}}var es=!1,Rl=-1,my=5,gy=-1;function hy(){return um?!0:!(mt.unstable_now()-gy<my)}function sm(){if(um=!1,es){var e=mt.unstable_now();gy=e;var t=!0;try{e:{Ml=!1,Al&&(Al=!1,py(Rl),Rl=-1),cm=!0;var n=mn;try{t:{for(Gc(e),va=ti(Mi);va!==null&&!(va.expirationTime>e&&hy());){var a=va.callback;if(typeof a=="function"){va.callback=null,mn=va.priorityLevel;var i=a(va.expirationTime<=e);if(e=mt.unstable_now(),typeof i=="function"){va.callback=i,Gc(e),t=!0;break t}va===ti(Mi)&&Fc(Mi),Gc(e)}else Fc(Mi);va=ti(Mi)}if(va!==null)t=!0;else{var r=ti(or);r!==null&&pm(fm,r.startTime-e),t=!1}}break e}finally{va=null,mn=n,cm=!1}t=void 0}}finally{t?Wo():es=!1}}}var Wo;typeof cy=="function"?Wo=function(){cy(sm)}:typeof MessageChannel<"u"?(lm=new MessageChannel,uy=lm.port2,lm.port1.onmessage=sm,Wo=function(){uy.postMessage(null)}):Wo=function(){fy(sm,0)};var lm,uy;function pm(e,t){Rl=fy(function(){e(mt.unstable_now())},t)}mt.unstable_IdlePriority=5;mt.unstable_ImmediatePriority=1;mt.unstable_LowPriority=4;mt.unstable_NormalPriority=3;mt.unstable_Profiling=null;mt.unstable_UserBlockingPriority=2;mt.unstable_cancelCallback=function(e){e.callback=null};mt.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):my=0<e?Math.floor(1e3/e):5};mt.unstable_getCurrentPriorityLevel=function(){return mn};mt.unstable_next=function(e){switch(mn){case 1:case 2:case 3:var t=3;break;default:t=mn}var n=mn;mn=t;try{return e()}finally{mn=n}};mt.unstable_requestPaint=function(){um=!0};mt.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var n=mn;mn=e;try{return t()}finally{mn=n}};mt.unstable_scheduleCallback=function(e,t,n){var a=mt.unstable_now();switch(typeof n=="object"&&n!==null?(n=n.delay,n=typeof n=="number"&&0<n?a+n:a):n=a,e){case 1:var i=-1;break;case 2:i=250;break;case 5:i=1073741823;break;case 4:i=1e4;break;default:i=5e3}return i=n+i,e={id:j5++,callback:t,priorityLevel:e,startTime:n,expirationTime:i,sortIndex:-1},n>a?(e.sortIndex=n,dm(or,e),ti(Mi)===null&&e===ti(or)&&(Al?(py(Rl),Rl=-1):Al=!0,pm(fm,n-a))):(e.sortIndex=i,dm(Mi,e),Ml||cm||(Ml=!0,es||(es=!0,Wo()))),e};mt.unstable_shouldYield=hy;mt.unstable_wrapCallback=function(e){var t=mn;return function(){var n=mn;mn=t;try{return e.apply(this,arguments)}finally{mn=n}}}});var yy=ei((R9,vy)=>{"use strict";vy.exports=by()});var _y=ei(ge=>{"use strict";var hm=Symbol.for("react.transitional.element"),G5=Symbol.for("react.portal"),F5=Symbol.for("react.fragment"),K5=Symbol.for("react.strict_mode"),Y5=Symbol.for("react.profiler"),Q5=Symbol.for("react.consumer"),X5=Symbol.for("react.context"),Z5=Symbol.for("react.forward_ref"),J5=Symbol.for("react.suspense"),$5=Symbol.for("react.memo"),Ny=Symbol.for("react.lazy"),W5=Symbol.for("react.activity"),eE=Symbol.for("react.view_transition"),xy=Symbol.iterator;function tE(e){return e===null||typeof e!="object"?null:(e=xy&&e[xy]||e["@@iterator"],typeof e=="function"?e:null)}var Ty={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Ey=Object.assign,Cy={};function ns(e,t,n){this.props=e,this.context=t,this.refs=Cy,this.updater=n||Ty}ns.prototype.isReactComponent={};ns.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};ns.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function My(){}My.prototype=ns.prototype;function bm(e,t,n){this.props=e,this.context=t,this.refs=Cy,this.updater=n||Ty}var vm=bm.prototype=new My;vm.constructor=bm;Ey(vm,ns.prototype);vm.isPureReactComponent=!0;var wy=Array.isArray;function gm(){}var st={H:null,A:null,T:null,S:null},Ay=Object.prototype.hasOwnProperty;function ym(e,t,n){var a=n.ref;return{$$typeof:hm,type:e,key:t,ref:a!==void 0?a:null,props:n}}function nE(e,t){return ym(e.type,t,e.props)}function xm(e){return typeof e=="object"&&e!==null&&e.$$typeof===hm}function aE(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(n){return t[n]})}var ky=/\/+/g;function mm(e,t){return typeof e=="object"&&e!==null&&e.key!=null?aE(""+e.key):t.toString(36)}function iE(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then(gm,gm):(e.status="pending",e.then(function(t){e.status==="pending"&&(e.status="fulfilled",e.value=t)},function(t){e.status==="pending"&&(e.status="rejected",e.reason=t)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function ts(e,t,n,a,i){var r=typeof e;(r==="undefined"||r==="boolean")&&(e=null);var o=!1;if(e===null)o=!0;else switch(r){case"bigint":case"string":case"number":o=!0;break;case"object":switch(e.$$typeof){case hm:case G5:o=!0;break;case Ny:return o=e._init,ts(o(e._payload),t,n,a,i)}}if(o)return i=i(e),o=a===""?"."+mm(e,0):a,wy(i)?(n="",o!=null&&(n=o.replace(ky,"$&/")+"/"),ts(i,t,n,"",function(d){return d})):i!=null&&(xm(i)&&(i=nE(i,n+(i.key==null||e&&e.key===i.key?"":(""+i.key).replace(ky,"$&/")+"/")+o)),t.push(i)),1;o=0;var s=a===""?".":a+":";if(wy(e))for(var l=0;l<e.length;l++)a=e[l],r=s+mm(a,l),o+=ts(a,t,n,r,i);else if(l=tE(e),typeof l=="function")for(e=l.call(e),l=0;!(a=e.next()).done;)a=a.value,r=s+mm(a,l++),o+=ts(a,t,n,r,i);else if(r==="object"){if(typeof e.then=="function")return ts(iE(e),t,n,a,i);throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return o}function Kc(e,t,n){if(e==null)return e;var a=[],i=0;return ts(e,a,"","",function(r){return t.call(n,r,i++)}),a}function rE(e){if(e._status===-1){var t=e._result,n=t();n.then(function(a){(e._status===0||e._status===-1)&&(e._status=1,e._result=a,n.status===void 0&&(n.status="fulfilled",n.value=a))},function(a){(e._status===0||e._status===-1)&&(e._status=2,e._result=a,n.status===void 0&&(n.status="rejected",n.reason=a))}),e._status===-1&&(e._status=0,e._result=n)}if(e._status===1)return e._result.default;throw e._result}var Sy=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)};function Ry(e){var t=st.T,n={};n.types=t!==null?t.types:null,st.T=n;try{var a=e(),i=st.S;i!==null&&i(n,a),typeof a=="object"&&a!==null&&typeof a.then=="function"&&a.then(gm,Sy)}catch(r){Sy(r)}finally{t!==null&&n.types!==null&&(t.types=n.types),st.T=t}}function Oy(e){var t=st.T;if(t!==null){var n=t.types;n===null?t.types=[e]:n.indexOf(e)===-1&&n.push(e)}else Ry(Oy.bind(null,e))}var oE={map:Kc,forEach:function(e,t,n){Kc(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return Kc(e,function(){t++}),t},toArray:function(e){return Kc(e,function(t){return t})||[]},only:function(e){if(!xm(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};ge.Activity=W5;ge.Children=oE;ge.Component=ns;ge.Fragment=F5;ge.Profiler=Y5;ge.PureComponent=bm;ge.StrictMode=K5;ge.Suspense=J5;ge.ViewTransition=eE;ge.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=st;ge.__COMPILER_RUNTIME={__proto__:null,c:function(e){return st.H.useMemoCache(e)}};ge.addTransitionType=Oy;ge.cache=function(e){return function(){return e.apply(null,arguments)}};ge.cacheSignal=function(){return null};ge.cloneElement=function(e,t,n){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var a=Ey({},e.props),i=e.key;if(t!=null)for(r in t.key!==void 0&&(i=""+t.key),t)!Ay.call(t,r)||r==="key"||r==="__self"||r==="__source"||r==="ref"&&t.ref===void 0||(a[r]=t[r]);var r=arguments.length-2;if(r===1)a.children=n;else if(1<r){for(var o=Array(r),s=0;s<r;s++)o[s]=arguments[s+2];a.children=o}return ym(e.type,i,a)};ge.createContext=function(e){return e={$$typeof:X5,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:Q5,_context:e},e};ge.createElement=function(e,t,n){var a,i={},r=null;if(t!=null)for(a in t.key!==void 0&&(r=""+t.key),t)Ay.call(t,a)&&a!=="key"&&a!=="__self"&&a!=="__source"&&(i[a]=t[a]);var o=arguments.length-2;if(o===1)i.children=n;else if(1<o){for(var s=Array(o),l=0;l<o;l++)s[l]=arguments[l+2];i.children=s}if(e&&e.defaultProps)for(a in o=e.defaultProps,o)i[a]===void 0&&(i[a]=o[a]);return ym(e,r,i)};ge.createRef=function(){return{current:null}};ge.forwardRef=function(e){return{$$typeof:Z5,render:e}};ge.isValidElement=xm;ge.lazy=function(e){return{$$typeof:Ny,_payload:{_status:-1,_result:e},_init:rE}};ge.memo=function(e,t){return{$$typeof:$5,type:e,compare:t===void 0?null:t}};ge.startTransition=Ry;ge.unstable_useCacheRefresh=function(){return st.H.useCacheRefresh()};ge.use=function(e){return st.H.use(e)};ge.useActionState=function(e,t,n){return st.H.useActionState(e,t,n)};ge.useCallback=function(e,t){return st.H.useCallback(e,t)};ge.useContext=function(e){return st.H.useContext(e)};ge.useDebugValue=function(){};ge.useDeferredValue=function(e,t){return st.H.useDeferredValue(e,t)};ge.useEffect=function(e,t){return st.H.useEffect(e,t)};ge.useEffectEvent=function(e){return st.H.useEffectEvent(e)};ge.useId=function(){return st.H.useId()};ge.useImperativeHandle=function(e,t,n){return st.H.useImperativeHandle(e,t,n)};ge.useInsertionEffect=function(e,t){return st.H.useInsertionEffect(e,t)};ge.useLayoutEffect=function(e,t){return st.H.useLayoutEffect(e,t)};ge.useMemo=function(e,t){return st.H.useMemo(e,t)};ge.useOptimistic=function(e,t){return st.H.useOptimistic(e,t)};ge.useReducer=function(e,t,n){return st.H.useReducer(e,t,n)};ge.useRef=function(e){return st.H.useRef(e)};ge.useState=function(e){return st.H.useState(e)};ge.useSyncExternalStore=function(e,t,n){return st.H.useSyncExternalStore(e,t,n)};ge.useTransition=function(){return st.H.useTransition()};ge.version="19.3.1"});var Fe=ei((_9,Iy)=>{"use strict";Iy.exports=_y()});var zy=ei(gn=>{"use strict";var sE=Fe();function Ly(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function sr(){}var En={d:{f:sr,r:function(){throw Error(Ly(522))},D:sr,C:sr,L:sr,m:sr,X:sr,S:sr,M:sr},p:0,findDOMNode:null},lE=Symbol.for("react.portal"),dE=Symbol.for("react.recoverable"),Dy=Symbol.for("react.optimistic_key");function cE(e,t,n){var a=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:lE,key:a==null?null:a===Dy?Dy:""+a,children:e,containerInfo:t,implementation:n}}var Ol=sE.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function Yc(e,t){if(e==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}gn.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=En;gn.browser=function(e){return{$$typeof:dE,_reason:e}};gn.createPortal=function(e,t){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(Ly(299));return cE(e,t,null,n)};gn.flushSync=function(e){var t=Ol.T,n=En.p;try{if(Ol.T=null,En.p=2,e)return e()}finally{Ol.T=t,En.p=n,En.d.f()}};gn.preconnect=function(e,t){typeof e=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,En.d.C(e,t))};gn.prefetchDNS=function(e){typeof e=="string"&&En.d.D(e)};gn.preinit=function(e,t){if(typeof e=="string"&&t&&typeof t.as=="string"){var n=t.as,a=Yc(n,t.crossOrigin),i=typeof t.integrity=="string"?t.integrity:void 0,r=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;n==="style"?En.d.S(e,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:a,integrity:i,fetchPriority:r}):n==="script"&&En.d.X(e,{crossOrigin:a,integrity:i,fetchPriority:r,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};gn.preinitModule=function(e,t){if(typeof e=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var n=Yc(t.as,t.crossOrigin);En.d.M(e,{crossOrigin:n,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}}else t==null&&En.d.M(e)};gn.preload=function(e,t){if(typeof e=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var n=t.as,a=Yc(n,t.crossOrigin);En.d.L(e,n,{crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};gn.preloadModule=function(e,t){if(typeof e=="string")if(t){var n=Yc(t.as,t.crossOrigin);En.d.m(e,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:n,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}else En.d.m(e)};gn.requestFormReset=function(e){En.d.r(e)};gn.unstable_batchedUpdates=function(e,t){return e(t)};gn.useFormState=function(e,t,n){return Ol.H.useFormState(e,t,n)};gn.useFormStatus=function(){return Ol.H.useHostTransitionStatus()};gn.version="19.3.1"});var Py=ei((D9,qy)=>{"use strict";function Hy(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Hy)}catch(e){console.error(e)}}Hy(),qy.exports=zy()});var Tk=ei(Af=>{"use strict";var Kt=yy(),N1=Fe(),uE=Py();function L(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function T1(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function vd(e){for(var t=e,n=t;n&&!n.alternate;)t=n,(t.flags&4098)!==0&&(e=t.return),n=t.return;for(;t.return;)t=t.return;return t.tag===3?e:null}function E1(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function C1(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Vy(e){if(vd(e)!==e)throw Error(L(188))}function fE(e){var t=e.alternate;if(!t){if(t=vd(e),t===null)throw Error(L(188));return t!==e?null:e}for(var n=e,a=t;;){var i=n.return;if(i===null)break;var r=i.alternate;if(r===null){if(a=i.return,a!==null){n=a;continue}break}if(i.child===r.child){for(r=i.child;r;){if(r===n)return Vy(i),e;if(r===a)return Vy(i),t;r=r.sibling}throw Error(L(188))}if(n.return!==a.return)n=i,a=r;else{for(var o=!1,s=i.child;s;){if(s===n){o=!0,n=i,a=r;break}if(s===a){o=!0,a=i,n=r;break}s=s.sibling}if(!o){for(s=r.child;s;){if(s===n){o=!0,n=r,a=i;break}if(s===a){o=!0,a=r,n=i;break}s=s.sibling}if(!o)throw Error(L(189))}}if(n.alternate!==a)throw Error(L(190))}if(n.tag!==3)throw Error(L(188));return n.stateNode.current===n?e:t}function M1(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=M1(e),t!==null)return t;e=e.sibling}return null}function Bn(e,t,n,a,i,r){for(;e!==null;){if((e.tag===5||e.tag===27||e.tag===6)&&n(e,a,i,r)||(e.tag!==22||e.memoizedState===null)&&(t||e.tag!==5&&e.tag!==27)&&Bn(e.child,t,n,a,i,r))return!0;e=e.sibling}return!1}function To(e){for(e=e.return;e!==null;){if(e.tag===3||e.tag===5||e.tag===27)return e;e=e.return}return null}function Uy(e){var t=!1;for(e=e.return;e!==null&&(e.tag===4&&(t=!0),!(e.tag===3||e.tag===5||e.tag===27));)e=e.return;return t}function A1(e){var t=[null,null],n=To(e);return n===null||R1(t,e,n.child,{foundSelf:!1}),t}function R1(e,t,n,a){for(;n!==null;){if(n===t)a.foundSelf=!0;else if(n.tag===5||n.tag===27||n.tag===6){if(a.foundSelf)return e[1]=n,!0;e[0]=n}else if((n.tag!==22||n.memoizedState===null)&&R1(e,t,n.child,a))return!0;n=n.sibling}return!1}function Ft(e){switch(e.tag){case 5:case 27:case 6:return e.stateNode;case 3:return e.stateNode.containerInfo;default:throw Error(L(559))}}var ds=null,$m=null;function pE(e,t,n){return e===n?!0:e===t?(ds=e,!0):!1}function mE(e,t,n){return e===n?($m=e,!1):e===t?($m!==null&&(ds=e),!0):!1}function By(e){if(e===null)return null;do e=e===null?null:e.return;while(e&&e.tag!==5&&e.tag!==27&&e.tag!==3);return e||null}function Wm(e,t,n){for(var a=0,i=e;i;i=n(i))a++;i=0;for(var r=t;r;r=n(r))i++;for(;0<a-i;)e=n(e),a--;for(;0<i-a;)t=n(t),i--;for(;a--;){if(e===t||t!==null&&e===t.alternate)return e;e=n(e),t=n(t)}return null}var rt=Object.assign,gE=Symbol.for("react.element"),Qc=Symbol.for("react.transitional.element"),ql=Symbol.for("react.portal"),cs=Symbol.for("react.fragment"),O1=Symbol.for("react.strict_mode"),eg=Symbol.for("react.profiler"),_1=Symbol.for("react.consumer"),si=Symbol.for("react.context"),dh=Symbol.for("react.forward_ref"),tg=Symbol.for("react.suspense"),ng=Symbol.for("react.suspense_list"),ch=Symbol.for("react.memo"),ur=Symbol.for("react.lazy"),ag=Symbol.for("react.activity"),hE=Symbol.for("react.legacy_hidden"),bE=Symbol.for("react.memo_cache_sentinel"),ig=Symbol.for("react.view_transition"),vE=Symbol.for("react.recoverable"),jy=Symbol.iterator;function _l(e){return e===null||typeof e!="object"?null:(e=jy&&e[jy]||e["@@iterator"],typeof e=="function"?e:null)}var yE=Symbol.for("react.client.reference");function rg(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===yE?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case cs:return"Fragment";case eg:return"Profiler";case O1:return"StrictMode";case tg:return"Suspense";case ng:return"SuspenseList";case ag:return"Activity";case ig:return"ViewTransition"}if(typeof e=="object")switch(e.$$typeof){case ql:return"Portal";case si:return e.displayName||"Context";case _1:return(e._context.displayName||"Context")+".Consumer";case dh:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case ch:return t=e.displayName||null,t!==null?t:rg(e.type)||"Memo";case ur:t=e._payload,e=e._init;try{return rg(e(t))}catch{}}return null}var Pl=Array.isArray,pe=N1.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Be=uE.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,fo={pending:!1,data:null,method:null,action:null},og=[],us=-1;function mi(e){return{current:e}}function ln(e){0>us||(e.current=og[us],og[us]=null,us--)}function ct(e,t){us++,og[us]=e.current,e.current=t}var ui=mi(null),nd=mi(null),xr=mi(null),Du=mi(null);function Lu(e,t){switch(ct(xr,t),ct(nd,e),ct(ui,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?a1(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=a1(t),e=ek(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}ln(ui),ct(ui,e)}function Os(){ln(ui),ln(nd),ln(xr)}function sg(e){var t=e.memoizedState;t!==null&&(Us._currentValue=t.memoizedState,ct(Du,e)),t=ui.current;var n=ek(t,e.type);t!==n&&(ct(nd,e),ct(ui,n))}function zu(e){nd.current===e&&(ln(ui),ln(nd)),Du.current===e&&(ln(Du),Us._currentValue=fo)}var wm,Gy;function dr(e){if(wm===void 0)try{throw Error()}catch(n){var t=n.stack.trim().match(/\n( *(at )?)/);wm=t&&t[1]||"",Gy=-1<n.stack.indexOf(`
    at`)?" (<anonymous>)":-1<n.stack.indexOf("@")?"@unknown:0:0":""}return`
`+wm+e+Gy}var km=!1;function Sm(e,t){if(!e||km)return"";km=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var a={DetermineComponentFrameRoot:function(){try{if(t){var v=function(){throw Error()};if(Object.defineProperty(v.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(v,[])}catch(w){var g=w}Reflect.construct(e,[],v)}else{try{v.call()}catch(w){g=w}v=!1;try{var h=Object.getOwnPropertyDescriptor(e.prototype,"props");Object.defineProperty(e.prototype,"props",{configurable:!0,set:function(){throw Error()}}),v=!0,new e}finally{v&&(h!==void 0?Object.defineProperty(e.prototype,"props",h):delete e.prototype.props)}}}else{try{throw Error()}catch(w){g=w}(v=e())&&typeof v.catch=="function"&&v.catch(function(){})}}catch(w){if(w&&g&&typeof w.stack=="string")return[w.stack,g.stack]}return[null,null]}};a.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var i=Object.getOwnPropertyDescriptor(a.DetermineComponentFrameRoot,"name");i&&i.configurable&&Object.defineProperty(a.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var r=a.DetermineComponentFrameRoot(),o=r[0],s=r[1];if(o&&s){var l=o.split(`
`),d=s.split(`
`);for(i=a=0;a<l.length&&!l[a].includes("DetermineComponentFrameRoot");)a++;for(;i<d.length&&!d[i].includes("DetermineComponentFrameRoot");)i++;if(a===l.length||i===d.length)for(a=l.length-1,i=d.length-1;1<=a&&0<=i&&l[a]!==d[i];)i--;for(;1<=a&&0<=i;a--,i--)if(l[a]!==d[i]){if(a!==1||i!==1)do if(a--,i--,0>i||l[a]!==d[i]){var f=`
`+l[a].replace(" at new "," at ");return e.displayName&&f.includes("<anonymous>")&&(f=f.replace("<anonymous>",e.displayName)),f}while(1<=a&&0<=i);break}}}finally{km=!1,Error.prepareStackTrace=n}return(n=e?e.displayName||e.name:"")?dr(n):""}function xE(e,t){switch(e.tag){case 26:case 27:case 5:return dr(e.type);case 16:return dr("Lazy");case 13:return e.child!==t&&t!==null?dr("Suspense Fallback"):dr("Suspense");case 19:return dr("SuspenseList");case 0:case 15:return Sm(e.type,!1);case 11:return Sm(e.type.render,!1);case 1:return Sm(e.type,!0);case 31:return dr("Activity");case 30:return dr("ViewTransition");default:return""}}function Fy(e){try{var t="",n=null;do t+=xE(e,n),n=e,e=e.return;while(e);return t}catch(a){return`
Error generating stack: `+a.message+`
`+a.stack}}var lg=Object.prototype.hasOwnProperty,uh=Kt.unstable_scheduleCallback,Nm=Kt.unstable_cancelCallback,wE=Kt.unstable_shouldYield,kE=Kt.unstable_requestPaint,aa=Kt.unstable_now,SE=Kt.unstable_getCurrentPriorityLevel,I1=Kt.unstable_ImmediatePriority,D1=Kt.unstable_UserBlockingPriority,Hu=Kt.unstable_NormalPriority,NE=Kt.unstable_LowPriority,L1=Kt.unstable_IdlePriority,TE=Kt.log,EE=Kt.unstable_setDisableYieldValue,yd=null,ia=null;function mr(e){if(typeof TE=="function"&&EE(e),ia&&typeof ia.setStrictMode=="function")try{ia.setStrictMode(yd,e)}catch{}}var ra=Math.clz32?Math.clz32:AE,CE=Math.log,ME=Math.LN2;function AE(e){return e>>>=0,e===0?32:31-(CE(e)/ME|0)|0}var Xc=256,Zc=262144,Jc=4194304;function oo(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&-e;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function cf(e,t,n){var a=e.pendingLanes;if(a===0)return 0;var i=0,r=e.suspendedLanes,o=e.pingedLanes;e=e.warmLanes;var s=a&134217727;return s!==0?(a=s&~r,a!==0?i=oo(a):(o&=s,o!==0?i=oo(o):n||(n=s&~e,n!==0&&(i=oo(n))))):(s=a&~r,s!==0?i=oo(s):o!==0?i=oo(o):n||(n=a&~e,n!==0&&(i=oo(n)))),i===0?0:t!==0&&t!==i&&(t&r)===0&&(r=i&-i,n=t&-t,r>=n||r===32&&(n&4194048)!==0)?t:i}function xd(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function z1(e,t){(t&8)!==0&&(t|=t&32);var n=e.entangledLanes;if(n!==0)for(e=e.entanglements,n&=t;0<n;){var a=31-ra(n),i=1<<a;t|=e[a],n&=~i}return t}function RE(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function H1(){var e=Jc;return Jc<<=1,(Jc&62914560)===0&&(Jc=4194304),e}function Tm(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function wd(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function OE(e,t,n,a,i,r){var o=e.pendingLanes;e.pendingLanes=n,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=n,e.entangledLanes&=n,e.errorRecoveryDisabledLanes&=n,e.shellSuspendCounter=0;var s=e.entanglements,l=e.expirationTimes,d=e.hiddenUpdates;for(n=o&~n;0<n;){var f=31-ra(n),v=1<<f;s[f]=0,l[f]=-1;var g=d[f];if(g!==null)for(d[f]=null,f=0;f<g.length;f++){var h=g[f];h!==null&&(h.lane&=-536870913)}n&=~v}a!==0&&q1(e,a,0),r!==0&&i===0&&e.tag!==0&&(e.suspendedLanes|=r&~(o&~t))}function q1(e,t,n){e.pendingLanes|=t,e.suspendedLanes&=~t;var a=31-ra(t);e.entangledLanes|=t,e.entanglements[a]=e.entanglements[a]|1073741824|n&261930}function P1(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var a=31-ra(n),i=1<<a;i&t|e[a]&t&&(e[a]|=t),n&=~i}}function V1(e,t){var n=t&-t;return n=(n&42)!==0?1:fh(n),(n&(e.suspendedLanes|t))!==0?0:n}function fh(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function ph(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function U1(){var e=Be.p;return e!==0?e:(e=window.event,e===void 0?32:kk(e.type))}function Ky(e,t){var n=Be.p;try{return Be.p=e,t()}finally{Be.p=n}}var Ui=Math.random().toString(36).slice(2),on="__reactFiber$"+Ui,jn="__reactProps$"+Ui,Gs="__reactContainer$"+Ui,Yy="__reactEvents$"+Ui,_E="__reactListeners$"+Ui,IE="__reactHandles$"+Ui,Qy="__reactResources$"+Ui,kd="__reactMarker$"+Ui,qu="__reactLoad$"+Ui;function uf(e){delete e[on],delete e[jn],delete e[_E],delete e[IE]}function co(e){var t;if(t=e[on])return t;for(var n=e.parentNode;n;){if(t=n[Gs]||n[on]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=u1(e);e!==null;){if(n=e[on])return n;e=u1(e)}return t}e=n,n=e.parentNode}return null}function Fs(e){if(e=e[on]||e[Gs]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function Vl(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(L(33))}function ws(e){var t=e[Qy];return t||(t=e[Qy]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function en(e){e[kd]=!0}function B1(e){e[qu]=void 0}var j1=new Set,G1={};function Eo(e,t){_s(e,t),_s(e+"Capture",t)}function _s(e,t){for(G1[e]=t,e=0;e<t.length;e++)j1.add(t[e])}var DE=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),Xy={},Zy={};function LE(e){return lg.call(Zy,e)?!0:lg.call(Xy,e)?!1:DE.test(e)?Zy[e]=!0:(Xy[e]=!0,!1)}var Ve=!1;function Jy(){var e=Ve;return Ve=!1,e}function gu(e,t,n){if(LE(t))if(n===null)e.removeAttribute(t);else{switch(typeof n){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var a=t.toLowerCase().slice(0,5);if(a!=="data-"&&a!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,n)}}function $c(e,t,n){if(n===null)e.removeAttribute(t);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,n)}}function Ai(e,t,n,a){if(a===null)e.removeAttribute(n);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(n);return}e.setAttributeNS(t,n,a)}}function Wn(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function F1(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function zE(e,t,n){var a=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof a<"u"&&typeof a.get=="function"&&typeof a.set=="function"){var i=a.get,r=a.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return i.call(this)},set:function(o){n=""+o,r.call(this,o)}}),Object.defineProperty(e,t,{enumerable:a.enumerable}),{getValue:function(){return n},setValue:function(o){n=""+o},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function dg(e){if(!e._valueTracker){var t=F1(e)?"checked":"value";e._valueTracker=zE(e,t,""+e[t])}}function K1(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),a="";return e&&(a=F1(e)?e.checked?"true":"false":e.value),e=a,e!==n?(t.setValue(e),!0):!1}var HE=/[\n"\\]/g;function Sa(e){return e.replace(HE,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function cg(e,t,n,a,i,r,o,s){e.name="",o!=null&&typeof o!="function"&&typeof o!="symbol"&&typeof o!="boolean"?e.type=o:e.removeAttribute("type"),t!=null?o==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+Wn(t)):e.value!==""+Wn(t)&&(e.value=""+Wn(t)):o!=="submit"&&o!=="reset"||e.removeAttribute("value"),t!=null?o==="number"&&e.value==t?Em(e,Wn(e.value)):Em(e,Wn(t)):n!=null?Em(e,Wn(n)):a!=null&&e.removeAttribute("value"),i==null&&r!=null&&(e.defaultChecked=!!r),i!=null&&(e.checked=i&&typeof i!="function"&&typeof i!="symbol"),s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"?e.name=""+Wn(s):e.removeAttribute("name")}function Y1(e,t,n,a,i,r,o,s){if(r!=null&&typeof r!="function"&&typeof r!="symbol"&&typeof r!="boolean"&&(e.type=r),t!=null||n!=null){if(!(r!=="submit"&&r!=="reset"||t!=null)){dg(e);return}n=n!=null?""+Wn(n):"",t=t!=null?""+Wn(t):n,s||t===e.value||(e.value=t),e.defaultValue=t}a=a??i,a=typeof a!="function"&&typeof a!="symbol"&&!!a,e.checked=s?e.checked:!!a,e.defaultChecked=!!a,o!=null&&typeof o!="function"&&typeof o!="symbol"&&typeof o!="boolean"&&(e.name=o),dg(e)}function Em(e,t){e.defaultValue!==""+t&&(e.defaultValue=""+t)}function ks(e,t,n,a){if(e=e.options,t){t={};for(var i=0;i<n.length;i++)t["$"+n[i]]=!0;for(n=0;n<e.length;n++)i=t.hasOwnProperty("$"+e[n].value),e[n].selected!==i&&(e[n].selected=i),i&&a&&(e[n].defaultSelected=!0)}else{for(n=""+Wn(n),t=null,i=0;i<e.length;i++){if(e[i].value===n){e[i].selected=!0,a&&(e[i].defaultSelected=!0);return}t!==null||e[i].disabled||(t=e[i])}t!==null&&(t.selected=!0)}}function Q1(e,t,n){if(t!=null&&(t=""+Wn(t),t!==e.value&&(e.value=t),n==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=n!=null?""+Wn(n):""}function X1(e,t,n,a){if(t==null){if(a!=null){if(n!=null)throw Error(L(92));if(Pl(a)){if(1<a.length)throw Error(L(93));a=a[0]}n=a}n==null&&(n=""),t=n}n=Wn(t),e.defaultValue=n,a=e.textContent,a===n&&a!==""&&a!==null&&(e.value=a),dg(e)}function Is(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var qE=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function $y(e,t,n){var a=t.indexOf("--")===0;n==null||typeof n=="boolean"||n===""?a?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":a?e.setProperty(t,n):typeof n!="number"||n===0||qE.has(t)?t==="float"?e.cssFloat=n:e[t]=(""+n).trim():e[t]=n+"px"}function Z1(e,t,n){if(t!=null&&typeof t!="object")throw Error(L(62));if(e=e.style,n!=null){for(var a in n)!n.hasOwnProperty(a)||t!=null&&t.hasOwnProperty(a)||(a.indexOf("--")===0?e.setProperty(a,""):a==="float"?e.cssFloat="":e[a]="",Ve=!0);for(var i in t)a=t[i],t.hasOwnProperty(i)&&n[i]!==a&&($y(e,i,a),Ve=!0)}else for(var r in t)t.hasOwnProperty(r)&&$y(e,r,t[r])}function mh(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var PE=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["maskType","mask-type"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),VE=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function hu(e){return VE.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function li(){}var ug=null;function gh(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var fs=null,Ss=null;function Wy(e){var t=Fs(e);if(t&&(e=t.stateNode)){var n=e[jn]||null;e:switch(e=t.stateNode,t.type){case"input":if(cg(e,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),t=n.name,n.type==="radio"&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll('input[name="'+Sa(""+t)+'"][type="radio"]'),t=0;t<n.length;t++){var a=n[t];if(a!==e&&a.form===e.form){var i=a[jn]||null;if(!i)throw Error(L(90));cg(a,i.value,i.defaultValue,i.defaultValue,i.checked,i.defaultChecked,i.type,i.name)}}for(t=0;t<n.length;t++)a=n[t],a.form===e.form&&K1(a)}break e;case"textarea":Q1(e,n.value,n.defaultValue);break e;case"select":t=n.value,t!=null&&ks(e,!!n.multiple,t,!1)}}}var Cm=!1;function J1(e,t,n){if(Cm)return e(t,n);Cm=!0;try{var a=e(t);return a}finally{if(Cm=!1,(fs!==null||Ss!==null)&&(Tf(),fs&&(t=fs,e=Ss,Ss=fs=null,Wy(t),e)))for(t=0;t<e.length;t++)Wy(e[t])}}function ad(e,t){var n=e.stateNode;if(n===null)return null;var a=n[jn]||null;if(a===null)return null;n=a[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(a=!a.disabled)||(e=e.type,a=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!a;break e;default:e=!1}if(e)return null;if(n&&typeof n!="function")throw Error(L(231,t,typeof n));return n}var Li=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),fg=!1;if(Li)try{as={},Object.defineProperty(as,"passive",{get:function(){fg=!0}}),window.addEventListener("test",as,as),window.removeEventListener("test",as,as)}catch{fg=!1}var as,gr=null,hh=null,bu=null;function $1(){if(bu)return bu;var e,t=hh,n=t.length,a,i="value"in gr?gr.value:gr.textContent,r=i.length;for(e=0;e<n&&t[e]===i[e];e++);var o=n-e;for(a=1;a<=o&&t[n-a]===i[r-a];a++);return bu=i.slice(e,1<a?1-a:void 0)}function vu(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Wc(){return!0}function e0(){return!1}function Rn(e){function t(n,a,i,r,o){this._reactName=n,this._targetInst=i,this.type=a,this.nativeEvent=r,this.target=o,this.currentTarget=null;for(var s in e)e.hasOwnProperty(s)&&(n=e[s],this[s]=n?n(r):r[s]);return this.isDefaultPrevented=(r.defaultPrevented!=null?r.defaultPrevented:r.returnValue===!1)?Wc:e0,this.isPropagationStopped=e0,this}return rt(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=Wc)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=Wc)},persist:function(){},isPersistent:Wc}),t}var Lr={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},ff=Rn(Lr),Sd=rt({},Lr,{view:0,detail:0}),UE=Rn(Sd),Mm,Am,Il,pf=rt({},Sd,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:bh,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==Il&&(Il&&e.type==="mousemove"?(Mm=e.screenX-Il.screenX,Am=e.screenY-Il.screenY):Am=Mm=0,Il=e),Mm)},movementY:function(e){return"movementY"in e?e.movementY:Am}}),t0=Rn(pf),BE=rt({},pf,{dataTransfer:0}),jE=Rn(BE),GE=rt({},Sd,{relatedTarget:0}),Rm=Rn(GE),FE=rt({},Lr,{animationName:0,elapsedTime:0,pseudoElement:0}),KE=Rn(FE),YE=rt({},Lr,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),QE=Rn(YE),XE=rt({},Lr,{data:0}),n0=Rn(XE),ZE={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},JE={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},$E={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function WE(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=$E[e])?!!t[e]:!1}function bh(){return WE}var e6=rt({},Sd,{key:function(e){if(e.key){var t=ZE[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=vu(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?JE[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:bh,charCode:function(e){return e.type==="keypress"?vu(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?vu(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),t6=Rn(e6),n6=rt({},pf,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),a0=Rn(n6),a6=rt({},Lr,{submitter:0}),i6=Rn(a6),r6=rt({},Sd,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:bh}),o6=Rn(r6),s6=rt({},Lr,{propertyName:0,elapsedTime:0,pseudoElement:0}),l6=Rn(s6),d6=rt({},pf,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),c6=Rn(d6),u6=rt({},Lr,{newState:0,oldState:0,source:0}),f6=Rn(u6),p6=[9,13,27,32],vh=Li&&"CompositionEvent"in window,jl=null;Li&&"documentMode"in document&&(jl=document.documentMode);var m6=Li&&"TextEvent"in window&&!jl,W1=Li&&(!vh||jl&&8<jl&&11>=jl),i0=" ",r0=!1;function ex(e,t){switch(e){case"keyup":return p6.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function tx(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var ps=!1;function g6(e,t){switch(e){case"compositionend":return tx(t);case"keypress":return t.which!==32?null:(r0=!0,i0);case"textInput":return e=t.data,e===i0&&r0?null:e;default:return null}}function h6(e,t){if(ps)return e==="compositionend"||!vh&&ex(e,t)?(e=$1(),bu=hh=gr=null,ps=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return W1&&t.locale!=="ko"?null:t.data;default:return null}}var b6={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function o0(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!b6[e.type]:t==="textarea"}function nx(e,t,n,a){fs?Ss?Ss.push(a):Ss=[a]:fs=a,t=sf(t,"onChange"),0<t.length&&(n=new ff("onChange","change",null,n,a),e.push({event:n,listeners:t}))}var Gl=null,id=null;function v6(e){Jw(e,0)}function mf(e){var t=Vl(e);if(K1(t))return e}function s0(e,t){if(e==="change")return t}var ax=!1;Li&&(Li?(tu="oninput"in document,tu||(Om=document.createElement("div"),Om.setAttribute("oninput","return;"),tu=typeof Om.oninput=="function"),eu=tu):eu=!1,ax=eu&&(!document.documentMode||9<document.documentMode));var eu,tu,Om;function l0(){Gl&&(Gl.detachEvent("onpropertychange",ix),id=Gl=null)}function ix(e){if(e.propertyName==="value"&&mf(id)){var t=[];nx(t,id,e,gh(e)),J1(v6,t)}}function y6(e,t,n){e==="focusin"?(l0(),Gl=t,id=n,Gl.attachEvent("onpropertychange",ix)):e==="focusout"&&l0()}function x6(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return mf(id)}function w6(e,t){if(e==="click")return mf(t)}function k6(e,t){if(e==="input"||e==="change")return mf(t)}function S6(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var sa=typeof Object.is=="function"?Object.is:S6;function rd(e,t){if(sa(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var n=Object.keys(e),a=Object.keys(t);if(n.length!==a.length)return!1;for(a=0;a<n.length;a++){var i=n[a];if(!lg.call(t,i)||!sa(e[i],t[i]))return!1}return!0}function pg(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function d0(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function c0(e,t){var n=d0(e);e=0;for(var a;n;){if(n.nodeType===3){if(a=e+n.textContent.length,e<=t&&a>=t)return{node:n,offset:t-e};e=a}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=d0(n)}}function rx(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?rx(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function ox(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=pg(e.document);t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href=="string"}catch{n=!1}if(n)e=t.contentWindow;else break;t=pg(e.document)}return t}function yh(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var N6=Li&&"documentMode"in document&&11>=document.documentMode,ms=null,mg=null,Fl=null,gg=!1;function u0(e,t,n){var a=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;gg||ms==null||ms!==pg(a)||(a=ms,"selectionStart"in a&&yh(a)?a={start:a.selectionStart,end:a.selectionEnd}:(a=(a.ownerDocument&&a.ownerDocument.defaultView||window).getSelection(),a={anchorNode:a.anchorNode,anchorOffset:a.anchorOffset,focusNode:a.focusNode,focusOffset:a.focusOffset}),Fl&&rd(Fl,a)||(Fl=a,a=sf(mg,"onSelect"),0<a.length&&(t=new ff("onSelect","select",null,t,n),e.push({event:t,listeners:a}),t.target=ms)))}function io(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n["Webkit"+e]="webkit"+t,n["Moz"+e]="moz"+t,n}var gs={animationend:io("Animation","AnimationEnd"),animationiteration:io("Animation","AnimationIteration"),animationstart:io("Animation","AnimationStart"),transitionrun:io("Transition","TransitionRun"),transitionstart:io("Transition","TransitionStart"),transitioncancel:io("Transition","TransitionCancel"),transitionend:io("Transition","TransitionEnd")},_m={},sx={};Li&&(sx=document.createElement("div").style,"AnimationEvent"in window||(delete gs.animationend.animation,delete gs.animationiteration.animation,delete gs.animationstart.animation),"TransitionEvent"in window||delete gs.transitionend.transition);function Co(e){if(_m[e])return _m[e];if(!gs[e])return e;var t=gs[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in sx)return _m[e]=t[n];return e}var lx=Co("animationend"),dx=Co("animationiteration"),cx=Co("animationstart"),T6=Co("transitionrun"),E6=Co("transitionstart"),C6=Co("transitioncancel"),ux=Co("transitionend"),fx=new Map,hg="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");hg.push("scrollEnd");function Fa(e,t){fx.set(e,t),Eo(t,[e])}var M6=0;function zi(e,t){if(e.name!=null&&e.name!=="auto")return e.name;if(t.autoName!==null)return t.autoName;e=Ga.identifierPrefix;var n=M6++;return e="_"+e+"t_"+n.toString(32)+"_",t.autoName=e}function f0(e){if(e==null||typeof e=="string")return e;var t=null,n=Rs;if(n!==null)for(var a=0;a<n.length;a++){var i=e[n[a]];if(i!=null){if(i==="none")return"none";t=t==null?i:t+(" "+i)}}return t??e.default}function Bi(e,t){return e=f0(e),t=f0(t),t==null?e==="auto"?null:e:t==="auto"?null:t}var Pu=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},xa=[],hs=0,xh=0;function gf(){for(var e=hs,t=xh=hs=0;t<e;){var n=xa[t];xa[t++]=null;var a=xa[t];xa[t++]=null;var i=xa[t];xa[t++]=null;var r=xa[t];if(xa[t++]=null,a!==null&&i!==null){var o=a.pending;o===null?i.next=i:(i.next=o.next,o.next=i),a.pending=i}r!==0&&px(n,i,r)}}function hf(e,t,n,a){xa[hs++]=e,xa[hs++]=t,xa[hs++]=n,xa[hs++]=a,xh|=a,e.lanes|=a,e=e.alternate,e!==null&&(e.lanes|=a)}function wh(e,t,n,a){return hf(e,t,n,a),Vu(e)}function Mo(e,t){return hf(e,null,null,t),Vu(e)}function px(e,t,n){e.lanes|=n;var a=e.alternate;a!==null&&(a.lanes|=n);for(var i=!1,r=e.return;r!==null;)r.childLanes|=n,a=r.alternate,a!==null&&(a.childLanes|=n),r.tag===22&&(e=r.stateNode,e===null||e._visibility&1||(i=!0)),e=r,r=r.return;return e.tag===3?(r=e.stateNode,i&&t!==null&&(i=31-ra(n),e=r.hiddenUpdates,a=e[i],a===null?e[i]=[t]:a.push(t),t.lane=n|536870912),r):null}function Vu(e){if(50<td)throw td=0,Mu=null,Error(L(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var bs={};function A6(e,t,n,a){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=a,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Vn(e,t,n,a){return new A6(e,t,n,a)}function kh(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Ii(e,t){var n=e.alternate;return n===null?(n=Vn(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&1206910976,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n.refCleanup=e.refCleanup,n}function mx(e,t){e.flags&=1206910978;var n=e.alternate;return n===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=n.childLanes,e.lanes=n.lanes,e.child=n.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=n.memoizedProps,e.memoizedState=n.memoizedState,e.updateQueue=n.updateQueue,e.type=n.type,t=n.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function yu(e,t,n,a,i,r){var o=0;if(a=e,typeof a=="function")kh(a)&&(o=1);else if(typeof a=="string")o=tC(e,n,ui.current)?26:e==="html"||e==="head"||e==="body"?27:5;else e:switch(a){case ag:return e=Vn(31,n,t,i),e.elementType=ag,e.lanes=r,e;case cs:return po(n.children,i,r,t);case O1:o=8,i|=24;break;case eg:return e=Vn(12,n,t,i|2),e.elementType=eg,e.lanes=r,e;case tg:return e=Vn(13,n,t,i),e.elementType=tg,e.lanes=r,e;case ng:return e=Vn(19,n,t,i),e.elementType=ng,e.lanes=r,e;case hE:case ig:return e=i|32,e=Vn(30,n,t,e),e.elementType=ig,e.lanes=r,e.stateNode={autoName:null,paired:null,clones:null,ref:null},e;default:if(typeof a=="object"&&a!==null)switch(a.$$typeof){case si:o=10;break e;case _1:o=9;break e;case dh:o=11;break e;case ch:o=14;break e;case ur:o=16,a=null;break e}o=29,n=Error(L(130,e===null?"null":typeof e,"")),a=null}return t=Vn(o,n,t,i),t.elementType=e,t.type=a,t.lanes=r,t}function po(e,t,n,a){return e=Vn(7,e,a,t),e.lanes=n,e}function Im(e,t,n){return e=Vn(6,e,null,t),e.lanes=n,e}function gx(e){var t=Vn(18,null,null,0);return t.stateNode=e,t}function Dm(e,t,n){return t=Vn(4,e.children!==null?e.children:[],e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var p0=new WeakMap;function Na(e,t){if(typeof e=="object"&&e!==null){var n=p0.get(e);return n!==void 0?n:(t={value:e,source:t,stack:Fy(t)},p0.set(e,t),t)}return{value:e,source:t,stack:Fy(t)}}var vs=[],ys=0,Uu=null,od=0,wa=[],ka=0,Rr=null,di=1,ci="";function Oi(e,t){vs[ys++]=od,vs[ys++]=Uu,Uu=e,od=t}function hx(e,t,n){wa[ka++]=di,wa[ka++]=ci,wa[ka++]=Rr,Rr=e;var a=di;e=ci;var i=32-ra(a)-1;a&=~(1<<i),n+=1;var r=32-ra(t)+i;if(30<r){var o=i-i%5;r=(a&(1<<o)-1).toString(32),a>>=o,i-=o,di=1<<32-ra(t)+i|n<<i|a,ci=r+e}else di=1<<r|n<<i|a,ci=e}function bf(e){e.return!==null&&(Oi(e,1),hx(e,1,0))}function Sh(e){for(;e===Uu;)Uu=vs[--ys],vs[ys]=null,od=vs[--ys],vs[ys]=null;for(;e===Rr;)Rr=wa[--ka],wa[ka]=null,ci=wa[--ka],wa[ka]=null,di=wa[--ka],wa[ka]=null}function bx(e,t){wa[ka++]=di,wa[ka++]=ci,wa[ka++]=Rr,di=t.id,ci=t.overflow,Rr=e}var tn=null,dt=null,Ne=!1,wr=null,Ta=!1,bg=Error(L(519));function Or(e){var t=Error(L(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw sd(Na(t,e)),bg}function m0(e){var t=e.stateNode,n=e.type,a=e.memoizedProps;switch(t[on]=e,t[jn]=a,n){case"dialog":Me("cancel",t),Me("close",t);break;case"iframe":case"object":case"embed":Me("load",t);break;case"video":case"audio":for(n=0;n<ud.length;n++)Me(ud[n],t);break;case"source":Me("error",t);break;case"img":case"image":case"link":Me("error",t),Me("load",t);break;case"details":Me("toggle",t);break;case"input":Me("invalid",t),Y1(t,a.value,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name,!0);break;case"select":Me("invalid",t);break;case"textarea":Me("invalid",t),X1(t,a.value,a.defaultValue,a.children)}n=a.children,typeof n!="string"&&typeof n!="number"&&typeof n!="bigint"||t.textContent===""+n||a.suppressHydrationWarning===!0||Ww(t.textContent,n)?(a.popover!=null&&(Me("beforetoggle",t),Me("toggle",t)),a.onScroll!=null&&Me("scroll",t),a.onScrollEnd!=null&&Me("scrollend",t),a.onClick!=null&&(t.onclick=li),t=!0):t=!1,t||Or(e,!0)}function Bu(e){for(tn=e.return;tn;)switch(tn.tag){case 5:case 31:case 13:Ta=!1;return;case 27:case 3:Ta=!0;return;default:tn=tn.return}}function is(e){if(e!==tn)return!1;if(!Ne)return Bu(e),Ne=!0,!1;var t=e.tag,n;if((n=t!==3&&t!==27)&&((n=t===5)&&(n=e.type,n=!(n!=="form"&&n!=="button")||th(e.type,e.memoizedProps)),n=!n),n&&dt&&Or(e),Bu(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(L(317));dt=c1(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(L(317));dt=c1(e)}else t===27?(t=dt,zr(e.type)?(e=rh,rh=null,dt=e):dt=t):dt=tn?Ea(e.stateNode.nextSibling):null;return!0}function bo(){dt=tn=null,Ne=!1}function Lm(){var e=wr;return e!==null&&(qn===null?qn=e:qn.push.apply(qn,e),wr=null),e}function sd(e){wr===null?wr=[e]:wr.push(e)}var vg=mi(null),Ao=null,_i=null;function hr(e,t,n){ct(vg,t._currentValue),t._currentValue=n}function Di(e){e._currentValue=vg.current,ln(vg)}function xu(e,t,n){for(;e!==null;){var a=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,a!==null&&(a.childLanes|=t)):a!==null&&(a.childLanes&t)!==t&&(a.childLanes|=t),e===n)break;e=e.return}}function yg(e,t,n,a){var i=e.child;for(i!==null&&(i.return=e);i!==null;){var r=i.dependencies;if(r!==null){var o=i.child;r=r.firstContext;e:for(;r!==null;){var s=r;r=i;for(var l=0;l<t.length;l++)if(s.context===t[l]){r.lanes|=n,s=r.alternate,s!==null&&(s.lanes|=n),xu(r.return,n,e),a||(o=null);break e}r=s.next}}else if(i.tag===18){if(o=i.return,o===null)throw Error(L(341));o.lanes|=n,r=o.alternate,r!==null&&(r.lanes|=n),xu(o,n,e),o=null}else i.tag===13&&i.memoizedState!==null&&i.memoizedState.dehydrated===null?(i.lanes|=n,o=i.alternate,o!==null&&(o.lanes|=n),xu(i.return,n,e),o=i.child,o=o!==null?o.sibling:null):o=i.child;if(o!==null)o.return=i;else for(o=i;o!==null;){if(o===e){o=null;break}if(i=o.sibling,i!==null){i.return=o.return,o=i;break}o=o.return}i=o}}function vo(e,t,n,a){e=null;for(var i=t,r=!1;i!==null;){if(!r){if((i.flags&524288)!==0)r=!0;else if((i.flags&262144)!==0)break}if(i.tag===10){var o=i.alternate;if(o===null)throw Error(L(387));if(o=o.memoizedProps,o!==null){var s=i.type;sa(i.pendingProps.value,o.value)||(e!==null?e.push(s):e=[s])}}else if(i===Du.current){if(o=i.alternate,o===null)throw Error(L(387));o.memoizedState.memoizedState!==i.memoizedState.memoizedState&&(e!==null?e.push(Us):e=[Us])}i=i.return}return e!==null&&yg(t,e,n,a),t.flags|=262144,e!==null}function ju(e){for(e=e.firstContext;e!==null;){if(!sa(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function yo(e){Ao=e,_i=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function sn(e){return vx(Ao,e)}function nu(e,t){return Ao===null&&yo(e),vx(e,t)}function vx(e,t){var n=t._currentValue;if(t={context:t,memoizedValue:n,next:null},_i===null){if(e===null)throw Error(L(308));_i=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else _i=_i.next=t;return n}var R6=typeof AbortController<"u"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(n,a){e.push(a)}};this.abort=function(){t.aborted=!0,e.forEach(function(n){return n()})}},O6=Kt.unstable_scheduleCallback,_6=Kt.unstable_NormalPriority,Lt={$$typeof:si,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function Nh(){return{controller:new R6,data:new Map,refCount:0}}function Nd(e){e.refCount--,e.refCount===0&&O6(_6,function(){e.controller.abort()})}function g0(e,t){if((e.pendingLanes&4194048)!==0){var n=e.transitionTypes;for(n===null&&(n=e.transitionTypes=[]),e=0;e<t.length;e++){var a=t[e];n.indexOf(a)===-1&&n.push(a)}}}var Ul=null;function I6(e){var t=e.transitionTypes;return e.transitionTypes=null,t}var Kl=null,xg=0,xo=0,Ns=null;function D6(e,t){if(Kl===null){var n=Kl=[];xg=0,xo=$h(),Ns={status:"pending",value:void 0,then:function(a){n.push(a)}}}return xg++,t.then(h0,h0),t}function h0(){if(--xg===0&&(Ul=null,Kl!==null)){Ns!==null&&(Ns.status="fulfilled");var e=Kl;Kl=null,xo=0,Ns=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function L6(e,t){var n=[],a={status:"pending",value:null,reason:null,then:function(i){n.push(i)}};return e.then(function(){a.status="fulfilled",a.value=t;for(var i=0;i<n.length;i++)(0,n[i])(t)},function(i){for(a.status="rejected",a.reason=i,i=0;i<n.length;i++)(0,n[i])(void 0)}),a}var b0=pe.S;pe.S=function(e,t){if(zw=aa(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&D6(e,t),Ul!==null)for(var n=qs;n!==null;)g0(n,Ul),n=n.next;if(n=e.types,n!==null){for(var a=qs;a!==null;)g0(a,n),a=a.next;if(xo!==0){a=Ul,a===null&&(a=Ul=[]);for(var i=0;i<n.length;i++){var r=n[i];a.indexOf(r)===-1&&a.push(r)}}}b0!==null&&b0(e,t)};var mo=mi(null);function Th(){var e=mo.current;return e!==null?e:it.pooledCache}function wu(e,t){t===null?ct(mo,mo.current):ct(mo,t.pool)}function yx(){var e=Th();return e===null?null:{parent:Lt._currentValue,pool:e}}var Ks=Error(L(460)),Eh=Error(L(474)),vf=Error(L(542)),Gu={then:function(){}};function v0(e){return e=e.status,e==="fulfilled"||e==="rejected"}function xx(e,t,n){switch(n=e[n],n===void 0?e.push(t):n!==t&&(t.then(li,li),t=n),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,x0(e),e===void 0&&!("reason"in t)?Error(L(600)):e;default:if(typeof t.status=="string")t.then(li,li);else{if(e=it,e!==null&&100<e.shellSuspendCounter)throw Error(L(482));e=t,e.status="pending",e.then(function(a){if(t.status==="pending"){var i=t;i.status="fulfilled",i.value=a}},function(a){if(t.status==="pending"){var i=t;i.status="rejected",i.reason=a}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,x0(e),e}throw go=t,Ks}}function so(e){try{var t=e._init;return t(e._payload)}catch(n){throw n!==null&&typeof n=="object"&&typeof n.then=="function"?(go=n,Ks):n}}var go=null;function y0(){if(go===null)throw Error(L(459));var e=go;return go=null,e}function x0(e){if(e===Ks||e===vf)throw Error(L(483))}var Ts=null,ld=0;function au(e){var t=ld;return ld+=1,Ts===null&&(Ts=[]),xx(Ts,e,t)}function lr(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function iu(e,t){throw t.$$typeof===gE?Error(L(525)):(e=Object.prototype.toString.call(t),Error(L(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function wx(e){function t(p,m){if(e){var b=p.deletions;b===null?(p.deletions=[m],p.flags|=16):b.push(m)}}function n(p,m){if(!e)return null;for(;m!==null;)t(p,m),m=m.sibling;return null}function a(p){for(var m=new Map;p!==null;)p.key===null?m.set(p.index,p):m.set(p.key,p),p=p.sibling;return m}function i(p,m){return p=Ii(p,m),p.index=0,p.sibling=null,p}function r(p,m,b){return p.index=b,e?(b=p.alternate,b!==null?(b=b.index,b<m?(p.flags|=2,m):b):(p.flags|=134217730,m)):(p.flags|=1048576,m)}function o(p){return e&&p.alternate===null&&(p.flags|=134217730),p}function s(p,m,b,y){return m===null||m.tag!==6?(m=Im(b,p.mode,y),m.return=p,m):(m=i(m,b),m.return=p,m)}function l(p,m,b,y){var N=b.type;return N===cs?(p=f(p,m,b.props.children,y,b.key),lr(p,b),p):m!==null&&(m.elementType===N||typeof N=="object"&&N!==null&&N.$$typeof===ur&&so(N)===m.type)?(m=i(m,b.props),lr(m,b),m.return=p,m):(m=yu(b.type,b.key,b.props,null,p.mode,y),lr(m,b),m.return=p,m)}function d(p,m,b,y){return m===null||m.tag!==4||m.stateNode.containerInfo!==b.containerInfo||m.stateNode.implementation!==b.implementation?(m=Dm(b,p.mode,y),m.return=p,m):(m=i(m,b.children||[]),m.return=p,m)}function f(p,m,b,y,N){return m===null||m.tag!==7?(m=po(b,p.mode,y,N),m.return=p,m):(m=i(m,b),m.return=p,m)}function v(p,m,b){if(typeof m=="string"&&m!==""||typeof m=="number"||typeof m=="bigint")return m=Im(""+m,p.mode,b),m.return=p,m;if(typeof m=="object"&&m!==null){switch(m.$$typeof){case Qc:return b=yu(m.type,m.key,m.props,null,p.mode,b),lr(b,m),b.return=p,b;case ql:return m=Dm(m,p.mode,b),m.return=p,m;case ur:return m=so(m),v(p,m,b)}if(Pl(m)||_l(m))return m=po(m,p.mode,b,null),m.return=p,m;if(typeof m.then=="function")return v(p,au(m),b);if(m.$$typeof===si)return v(p,nu(p,m),b);iu(p,m)}return null}function g(p,m,b,y){var N=m!==null?m.key:null;if(typeof b=="string"&&b!==""||typeof b=="number"||typeof b=="bigint")return N!==null?null:s(p,m,""+b,y);if(typeof b=="object"&&b!==null){switch(b.$$typeof){case Qc:return b.key===N?l(p,m,b,y):null;case ql:return b.key===N?d(p,m,b,y):null;case ur:return b=so(b),g(p,m,b,y)}if(Pl(b)||_l(b))return N!==null?null:f(p,m,b,y,null);if(typeof b.then=="function")return g(p,m,au(b),y);if(b.$$typeof===si)return g(p,m,nu(p,b),y);iu(p,b)}return null}function h(p,m,b,y,N){if(typeof y=="string"&&y!==""||typeof y=="number"||typeof y=="bigint")return p=p.get(b)||null,s(m,p,""+y,N);if(typeof y=="object"&&y!==null){switch(y.$$typeof){case Qc:return p=p.get(y.key===null?b:y.key)||null,l(m,p,y,N);case ql:return p=p.get(y.key===null?b:y.key)||null,d(m,p,y,N);case ur:return y=so(y),h(p,m,b,y,N)}if(Pl(y)||_l(y))return p=p.get(b)||null,f(m,p,y,N,null);if(typeof y.then=="function")return h(p,m,b,au(y),N);if(y.$$typeof===si)return h(p,m,b,nu(m,y),N);iu(m,y)}return null}function w(p,m,b,y){for(var N=null,D=null,O=m,T=m=0,z=null;O!==null&&T<b.length;T++){O.index>T?(z=O,O=null):z=O.sibling;var $=g(p,O,b[T],y);if($===null){O===null&&(O=z);break}e&&O&&$.alternate===null&&t(p,O),m=r($,m,T),D===null?N=$:D.sibling=$,D=$,O=z}if(T===b.length)return n(p,O),Ne&&Oi(p,T),N;if(O===null){for(;T<b.length;T++)O=v(p,b[T],y),O!==null&&(m=r(O,m,T),D===null?N=O:D.sibling=O,D=O);return Ne&&Oi(p,T),N}for(O=a(O);T<b.length;T++)z=h(O,p,T,b[T],y),z!==null&&(e&&($=z.alternate,$!==null&&O.delete($.key===null?T:$.key)),m=r(z,m,T),D===null?N=z:D.sibling=z,D=z);return e&&O.forEach(function(X){return t(p,X)}),Ne&&Oi(p,T),N}function x(p,m,b,y){if(b==null)throw Error(L(151));for(var N=null,D=null,O=m,T=m=0,z=null,$=b.next();O!==null&&!$.done;T++,$=b.next()){O.index>T?(z=O,O=null):z=O.sibling;var X=g(p,O,$.value,y);if(X===null){O===null&&(O=z);break}e&&O&&X.alternate===null&&t(p,O),m=r(X,m,T),D===null?N=X:D.sibling=X,D=X,O=z}if($.done)return n(p,O),Ne&&Oi(p,T),N;if(O===null){for(;!$.done;T++,$=b.next())$=v(p,$.value,y),$!==null&&(m=r($,m,T),D===null?N=$:D.sibling=$,D=$);return Ne&&Oi(p,T),N}for(O=a(O);!$.done;T++,$=b.next())$=h(O,p,T,$.value,y),$!==null&&(e&&(z=$.alternate,z!==null&&O.delete(z.key===null?T:z.key)),m=r($,m,T),D===null?N=$:D.sibling=$,D=$);return e&&O.forEach(function(Le){return t(p,Le)}),Ne&&Oi(p,T),N}function A(p,m,b,y){if(typeof b=="object"&&b!==null&&b.type===cs&&b.key===null&&b.props.ref===void 0&&(b=b.props.children),typeof b=="object"&&b!==null){switch(b.$$typeof){case Qc:e:{for(var N=b.key;m!==null;){if(m.key===N){if(N=b.type,N===cs){if(m.tag===7){n(p,m.sibling),y=i(m,b.props.children),lr(y,b),y.return=p,p=y;break e}}else if(m.elementType===N||typeof N=="object"&&N!==null&&N.$$typeof===ur&&so(N)===m.type){n(p,m.sibling),y=i(m,b.props),lr(y,b),y.return=p,p=y;break e}n(p,m);break}else t(p,m);m=m.sibling}b.type===cs?(y=po(b.props.children,p.mode,y,b.key),lr(y,b),y.return=p,p=y):(y=yu(b.type,b.key,b.props,null,p.mode,y),lr(y,b),y.return=p,p=y)}return o(p);case ql:e:{for(N=b.key;m!==null;){if(m.key===N)if(m.tag===4&&m.stateNode.containerInfo===b.containerInfo&&m.stateNode.implementation===b.implementation){n(p,m.sibling),y=i(m,b.children||[]),y.return=p,p=y;break e}else{n(p,m);break}else t(p,m);m=m.sibling}y=Dm(b,p.mode,y),y.return=p,p=y}return o(p);case ur:return b=so(b),A(p,m,b,y)}if(Pl(b))return w(p,m,b,y);if(_l(b)){if(N=_l(b),typeof N!="function")throw Error(L(150));return b=N.call(b),x(p,m,b,y)}if(typeof b.then=="function")return A(p,m,au(b),y);if(b.$$typeof===si)return A(p,m,nu(p,b),y);iu(p,b)}return typeof b=="string"&&b!==""||typeof b=="number"||typeof b=="bigint"?(b=""+b,m!==null&&m.tag===6?(n(p,m.sibling),y=i(m,b),y.return=p,p=y):(n(p,m),y=Im(b,p.mode,y),y.return=p,p=y),o(p)):n(p,m)}return function(p,m,b,y){try{ld=0;var N=A(p,m,b,y);return Ts=null,N}catch(O){if(O===Ks||O===vf)throw O;var D=Vn(29,O,null,p.mode);return D.lanes=y,D.return=p,D}}}var wo=wx(!0),kx=wx(!1),fr=!1;function Ch(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function wg(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function kr(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function Sr(e,t,n){var a=e.updateQueue;if(a===null)return null;if(a=a.shared,(Ue&2)!==0){var i=a.pending;return i===null?t.next=t:(t.next=i.next,i.next=t),a.pending=t,t=Vu(e),px(e,null,n),t}return hf(e,a,t,n),Vu(e)}function Yl(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,(n&4194048)!==0)){var a=t.lanes;a&=e.pendingLanes,n|=a,t.lanes=n,P1(e,n)}}function zm(e,t){var n=e.updateQueue,a=e.alternate;if(a!==null&&(a=a.updateQueue,n===a)){var i=null,r=null;if(n=n.firstBaseUpdate,n!==null){do{var o={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};r===null?i=r=o:r=r.next=o,n=n.next}while(n!==null);r===null?i=r=t:r=r.next=t}else i=r=t;n={baseState:a.baseState,firstBaseUpdate:i,lastBaseUpdate:r,shared:a.shared,callbacks:a.callbacks},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}var kg=!1;function Ql(){if(kg){var e=Ns;if(e!==null)throw e}}function Xl(e,t,n,a){kg=!1;var i=e.updateQueue;fr=!1;var r=i.firstBaseUpdate,o=i.lastBaseUpdate,s=i.shared.pending;if(s!==null){i.shared.pending=null;var l=s,d=l.next;l.next=null,o===null?r=d:o.next=d,o=l;var f=e.alternate;f!==null&&(f=f.updateQueue,s=f.lastBaseUpdate,s!==o&&(s===null?f.firstBaseUpdate=d:s.next=d,f.lastBaseUpdate=l))}if(r!==null){var v=i.baseState;o=0,f=d=l=null,s=r;do{var g=s.lane&-536870913,h=g!==s.lane;if(h?(_e&g)===g:(a&g)===g){g!==0&&g===xo&&(kg=!0),f!==null&&(f=f.next={lane:0,tag:s.tag,payload:s.payload,callback:null,next:null});e:{var w=e,x=s;g=t;var A=n;switch(x.tag){case 1:if(w=x.payload,typeof w=="function"){v=w.call(A,v,g);break e}v=w;break e;case 3:w.flags=w.flags&-65537|128;case 0:if(w=x.payload,g=typeof w=="function"?w.call(A,v,g):w,g==null)break e;v=rt({},v,g);break e;case 2:fr=!0}}g=s.callback,g!==null&&(e.flags|=64,h&&(e.flags|=8192),h=i.callbacks,h===null?i.callbacks=[g]:h.push(g))}else h={lane:g,tag:s.tag,payload:s.payload,callback:s.callback,next:null},f===null?(d=f=h,l=v):f=f.next=h,o|=g;if(s=s.next,s===null){if(s=i.shared.pending,s===null)break;h=s,s=h.next,h.next=null,i.lastBaseUpdate=h,i.shared.pending=null}}while(!0);f===null&&(l=v),i.baseState=l,i.firstBaseUpdate=d,i.lastBaseUpdate=f,r===null&&(i.shared.lanes=0),Dr|=o,e.lanes=o,e.memoizedState=v}}function Sx(e,t){if(typeof e!="function")throw Error(L(191,e));e.call(t)}function Nx(e,t){var n=e.callbacks;if(n!==null)for(e.callbacks=null,e=0;e<n.length;e++)Sx(n[e],t)}var _r=mi(null),Fu=mi(0);function w0(e,t){e=Vi,ct(Fu,e),ct(_r,t),Vi=e|t.baseLanes}function Sg(){ct(Fu,Vi),ct(_r,_r.current)}function Mh(){Vi=Fu.current,ln(_r),ln(Fu)}var un=mi(null),hn=null;function Nr(e){var t=e.alternate;ct(dn,dn.current&1),ct(un,e),hn===null&&(t===null||_r.current!==null||t.memoizedState!==null)&&(hn=e)}function Ng(e){ct(dn,dn.current),ct(un,e),hn===null&&(hn=e)}function Tx(e){e.tag===22?(ct(dn,dn.current),ct(un,e),hn===null&&(hn=e)):Tr()}function Tr(){ct(dn,dn.current),ct(un,un.current)}function ea(e){ln(un),hn===e&&(hn=null),ln(dn)}var dn=mi(0);function dd(e,t){ct(un,un.current),ct(dn,t)}function Ah(e){ln(dn),ln(un),hn===e&&(hn=null)}function Ku(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||ih(n)||nb(n)))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!=="independent"){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var Hi=0,we=null,We=null,Dt=null,Yu=!1,Es=!1,ko=!1,Qu=0,cd=0,Cs=null,z6=0;function Ct(){throw Error(L(321))}function Rh(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!sa(e[n],t[n]))return!1;return!0}function Oh(e,t,n,a,i,r){return Hi=r,we=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,pe.H=e===null||e.memoizedState===null?nw:aw,ko=!1,r=n(a,i),ko=!1,Es&&(r=Cx(t,n,a,i)),Ex(e),r}function Ex(e){pe.H=Xu;var t=We!==null&&We.next!==null;if(Hi=0,Dt=We=we=null,Yu=!1,cd=0,Cs=null,t)throw Error(L(300));e===null||zt||(e=e.dependencies,e!==null&&ju(e)&&(zt=!0))}function Cx(e,t,n,a){we=e;var i=0;do{if(Es&&(Cs=null),cd=0,Es=!1,25<=i)throw Error(L(301));if(i+=1,Dt=We=null,e.updateQueue!=null){var r=e.updateQueue;r.lastEffect=null,r.events=null,r.stores=null,r.memoCache!=null&&(r.memoCache.index=0)}pe.H=G6,r=t(n,a)}while(Es);return r}function H6(){var e=pe.H,t=e.useState()[0];return t=typeof t.then=="function"?Td(t):t,e=e.useState()[0],(We!==null?We.memoizedState:null)!==e&&(we.flags|=1024),t}function _h(){var e=Qu!==0;return Qu=0,e}function Ih(e,t,n){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~n}function Dh(e){if(Yu){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}Yu=!1}Hi=0,Dt=We=we=null,Es=!1,cd=Qu=0,Cs=null}function An(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Dt===null?we.memoizedState=Dt=e:Dt=Dt.next=e,Dt}function Ot(){if(We===null){var e=we.alternate;e=e!==null?e.memoizedState:null}else e=We.next;var t=Dt===null?we.memoizedState:Dt.next;if(t!==null)Dt=t,We=e;else{if(e===null)throw we.alternate===null?Error(L(467)):Error(L(310));We=e,e={memoizedState:We.memoizedState,baseState:We.baseState,baseQueue:We.baseQueue,queue:We.queue,next:null},Dt===null?we.memoizedState=Dt=e:Dt=Dt.next=e}return Dt}function yf(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Td(e){var t=cd;return cd+=1,Cs===null&&(Cs=[]),e=xx(Cs,e,t),t=we,(Dt===null?t.memoizedState:Dt.next)===null&&(t=t.alternate,pe.H=t===null||t.memoizedState===null?nw:aw),e}function xf(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return Td(e);if(e.$$typeof===vE)return;if(e.$$typeof===si)return sn(e)}throw Error(L(438,String(e)))}function Lh(e){var t=null,n=we.updateQueue;if(n!==null&&(t=n.memoCache),t==null){var a=we.alternate;a!==null&&(a=a.updateQueue,a!==null&&(a=a.memoCache,a!=null&&(t={data:a.data.map(function(i){return i.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),n===null&&(n=yf(),we.updateQueue=n),n.memoCache=t,n=t.data[t.index],n===void 0)for(n=t.data[t.index]=Array(e),a=0;a<e;a++)n[a]=bE;return t.index++,n}function qi(e,t){return typeof t=="function"?t(e):t}function ku(e){var t=Ot();return zh(t,We,e)}function zh(e,t,n){var a=e.queue;if(a===null)throw Error(L(311));a.lastRenderedReducer=n;var i=e.baseQueue,r=a.pending;if(r!==null){if(i!==null){var o=i.next;i.next=r.next,r.next=o}t.baseQueue=i=r,a.pending=null}if(r=e.baseState,i===null)e.memoizedState=r;else{t=i.next;var s=o=null,l=null,d=t,f=!1;do{var v=d.lane&-536870913;if(v!==d.lane?(_e&v)===v:(Hi&v)===v){var g=d.revertLane;if(g===0)l!==null&&(l=l.next={lane:0,revertLane:0,gesture:null,action:d.action,hasEagerState:d.hasEagerState,eagerState:d.eagerState,next:null}),v===xo&&(f=!0);else if((Hi&g)===g){d=d.next,g===xo&&(f=!0);continue}else v={lane:0,revertLane:d.revertLane,gesture:null,action:d.action,hasEagerState:d.hasEagerState,eagerState:d.eagerState,next:null},l===null?(s=l=v,o=r):l=l.next=v,we.lanes|=g,Dr|=g;v=d.action,ko&&n(r,v),r=d.hasEagerState?d.eagerState:n(r,v)}else g={lane:v,revertLane:d.revertLane,gesture:d.gesture,action:d.action,hasEagerState:d.hasEagerState,eagerState:d.eagerState,next:null},l===null?(s=l=g,o=r):l=l.next=g,we.lanes|=v,Dr|=v;d=d.next}while(d!==null&&d!==t);if(l===null?o=r:l.next=s,!sa(r,e.memoizedState)&&(zt=!0,f&&(n=Ns,n!==null)))throw n;e.memoizedState=r,e.baseState=o,e.baseQueue=l,a.lastRenderedState=r}return i===null&&(a.lanes=0),[e.memoizedState,a.dispatch]}function Hm(e){var t=Ot(),n=t.queue;if(n===null)throw Error(L(311));n.lastRenderedReducer=e;var a=n.dispatch,i=n.pending,r=t.memoizedState;if(i!==null){n.pending=null;var o=i=i.next;do r=e(r,o.action),o=o.next;while(o!==i);sa(r,t.memoizedState)||(zt=!0),t.memoizedState=r,t.baseQueue===null&&(t.baseState=r),n.lastRenderedState=r}return[r,a]}function Mx(e,t,n){var a=we,i=Ot(),r=Ne;if(r){if(n===void 0)throw Error(L(407));n=n()}else n=t();var o=!sa((We||i).memoizedState,n);if(o&&(i.memoizedState=n,zt=!0),i=i.queue,Hh(Ox.bind(null,a,i,e),[e]),e=i.getSnapshot!==t||o||Dt!==null&&(Dt.memoizedState.tag&1)!==0,Ds(e?9:8,{destroy:void 0},Rx.bind(null,a,i,n,t),null),e){if(a.flags|=2048,it===null)throw Error(L(349));r||(Hi&127)!==0||Ax(a,t,n)}return n}function Ax(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=we.updateQueue,t===null?(t=yf(),we.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function Rx(e,t,n,a){t.value=n,t.getSnapshot=a,_x(t)&&Ix(e)}function Ox(e,t,n){return n(function(){_x(t)&&Ix(e)})}function _x(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!sa(e,n)}catch{return!0}}function Ix(e){var t=Mo(e,2);t!==null&&Un(t,e,2)}function Tg(e){var t=An();if(typeof e=="function"){var n=e;if(e=n(),ko){mr(!0);try{n()}finally{mr(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:qi,lastRenderedState:e},t}function Dx(e,t,n,a){return e.baseState=n,zh(e,We,typeof a=="function"?a:qi)}function q6(e,t,n,a,i){if(kf(e))throw Error(L(485));if(e=t.action,e!==null){var r={payload:i,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(o){r.listeners.push(o)}};pe.T!==null?n(!0):r.isTransition=!1,a(r),n=t.pending,n===null?(r.next=t.pending=r,Lx(t,r)):(r.next=n.next,t.pending=n.next=r)}}function Lx(e,t){var n=t.action,a=t.payload,i=e.state;if(t.isTransition){var r=pe.T,o={};o.types=r!==null?r.types:null,pe.T=o;try{var s=n(i,a),l=pe.S;l!==null&&l(o,s),k0(e,t,s)}catch(d){Eg(e,t,d)}finally{r!==null&&o.types!==null&&(r.types=o.types),pe.T=r}}else try{r=n(i,a),k0(e,t,r)}catch(d){Eg(e,t,d)}}function k0(e,t,n){n!==null&&typeof n=="object"&&typeof n.then=="function"?n.then(function(a){S0(e,t,a)},function(a){return Eg(e,t,a)}):S0(e,t,n)}function S0(e,t,n){t.status="fulfilled",t.value=n,zx(t),e.state=n,t=e.pending,t!==null&&(n=t.next,n===t?e.pending=null:(n=n.next,t.next=n,Lx(e,n)))}function Eg(e,t,n){var a=e.pending;if(e.pending=null,a!==null){a=a.next;do t.status="rejected",t.reason=n,zx(t),t=t.next;while(t!==a)}e.action=null}function zx(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function Hx(e,t){return t}function N0(e,t){if(Ne){var n=it.formState;if(n!==null){e:{var a=we;if(Ne){if(dt){t:{for(var i=dt,r=Ta;i.nodeType!==8;){if(!r){i=null;break t}if(i=Ea(i.nextSibling),i===null){i=null;break t}}r=i.data,i=r==="F!"||r==="F"?i:null}if(i){dt=Ea(i.nextSibling),a=i.data==="F!";break e}}Or(a)}a=!1}a&&(t=n[0])}}return n=An(),n.memoizedState=n.baseState=t,a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Hx,lastRenderedState:t},n.queue=a,n=Wx.bind(null,we,a),a.dispatch=n,a=Tg(!1),r=Uh.bind(null,we,!1,a.queue),a=An(),i={state:t,dispatch:null,action:e,pending:null},a.queue=i,n=q6.bind(null,we,i,r,n),i.dispatch=n,a.memoizedState=e,[t,n,!1]}function T0(e){var t=Ot();return qx(t,We,e)}function qx(e,t,n){if(t=zh(e,t,Hx)[0],e=ku(qi)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var a=Td(t)}catch(o){throw o===Ks?vf:o}else a=t;t=Ot();var i=t.queue,r=i.dispatch;return n!==t.memoizedState&&(we.flags|=2048,Ds(9,{destroy:void 0},P6.bind(null,i,n),null)),[a,r,e]}function P6(e,t){e.action=t}function E0(e){var t=Ot(),n=We;if(n!==null)return qx(t,n,e);Ot(),t=t.memoizedState,n=Ot();var a=n.queue.dispatch;return n.memoizedState=e,[t,a,!1]}function Ds(e,t,n,a){return e={tag:e,create:n,deps:a,inst:t,next:null},t=we.updateQueue,t===null&&(t=yf(),we.updateQueue=t),n=t.lastEffect,n===null?t.lastEffect=e.next=e:(a=n.next,n.next=e,e.next=a,t.lastEffect=e),e}function Px(){return Ot().memoizedState}function Su(e,t,n,a){var i=An();we.flags|=e,i.memoizedState=Ds(1|t,{destroy:void 0},n,a===void 0?null:a)}function wf(e,t,n,a){var i=Ot();a=a===void 0?null:a;var r=i.memoizedState.inst;We!==null&&a!==null&&Rh(a,We.memoizedState.deps)?i.memoizedState=Ds(t,r,n,a):(we.flags|=e,i.memoizedState=Ds(1|t,r,n,a))}function C0(e,t){Su(8390656,8,e,t)}function Hh(e,t){wf(2048,8,e,t)}function V6(e){we.flags|=4;var t=we.updateQueue;if(t===null)t=yf(),we.updateQueue=t,t.events=[e];else{var n=t.events;n===null?t.events=[e]:n.push(e)}}function Vx(e){var t=Ot().memoizedState;return V6({ref:t,nextImpl:e}),function(){if((Ue&2)!==0)throw Error(L(440));return t.impl.apply(void 0,arguments)}}function Ux(e,t){return wf(4,2,e,t)}function Bx(e,t){return wf(4,4,e,t)}function jx(e,t){if(typeof t=="function"){e=e();var n=t(e);return function(){typeof n=="function"?n():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function Gx(e,t,n){n=n!=null?n.concat([e]):null,wf(4,4,jx.bind(null,t,e),n)}function qh(){}function Fx(e,t){var n=Ot();t=t===void 0?null:t;var a=n.memoizedState;return t!==null&&Rh(t,a[1])?a[0]:(n.memoizedState=[e,t],e)}function Kx(e,t){var n=Ot();t=t===void 0?null:t;var a=n.memoizedState;if(t!==null&&Rh(t,a[1]))return a[0];if(a=e(),ko){mr(!0);try{e()}finally{mr(!1)}}return n.memoizedState=[a,t],a}function Ph(e,t,n){return n===void 0||(Hi&1073741824)!==0&&(_e&261930)===0?e.memoizedState=t:(e.memoizedState=n,e=qw(),we.lanes|=e,Dr|=e,n)}function Yx(e,t,n,a){return sa(n,t)?n:_r.current!==null?(e=Ph(e,n,a),sa(e,t)||(zt=!0),e):(Hi&106)===0||(Hi&1073741824)!==0&&(_e&261930)===0?(zt=!0,e.memoizedState=n):(e=qw(),we.lanes|=e,Dr|=e,t)}function Qx(e,t,n,a,i){var r=Be.p;Be.p=r!==0&&8>r?r:8;var o=pe.T,s={};s.types=o!==null?o.types:null,pe.T=s,Uh(e,!1,t,n);try{var l=i(),d=pe.S;if(d!==null&&d(s,l),l!==null&&typeof l=="object"&&typeof l.then=="function"){var f=L6(l,a);Zl(e,t,f,oa(e))}else Zl(e,t,a,oa(e))}catch(v){Zl(e,t,{then:function(){},status:"rejected",reason:v},oa())}finally{Be.p=r,o!==null&&s.types!==null&&(o.types=s.types),pe.T=o}}function U6(){}function Cg(e,t,n,a){if(e.tag!==5)throw Error(L(476));var i=Xx(e).queue;Qx(e,i,t,fo,n===null?U6:function(){return Zx(e),n(a)})}function Xx(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:fo,baseState:fo,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:qi,lastRenderedState:fo},next:null};var n={};return t.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:qi,lastRenderedState:n},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function Zx(e){var t=Xx(e);t.next===null&&(t=e.alternate.memoizedState),Zl(e,t.next.queue,{},oa())}function Vh(){return sn(Us)}function Jx(){return Ot().memoizedState}function $x(){return Ot().memoizedState}function B6(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var n=oa();e=kr(n);var a=Sr(t,e,n);a!==null&&(Un(a,t,n),Yl(a,t,n)),t={cache:Nh()},e.payload=t;return}t=t.return}}function j6(e,t,n){var a=oa();n={lane:a,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},kf(e)?ew(t,n):(n=wh(e,t,n,a),n!==null&&(Un(n,e,a),tw(n,t,a)))}function Wx(e,t,n){var a=oa();Zl(e,t,n,a)}function Zl(e,t,n,a){var i={lane:a,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(kf(e))ew(t,i);else{var r=e.alternate;if(e.lanes===0&&(r===null||r.lanes===0)&&(r=t.lastRenderedReducer,r!==null))try{var o=t.lastRenderedState,s=r(o,n);if(i.hasEagerState=!0,i.eagerState=s,sa(s,o))return hf(e,t,i,0),it===null&&gf(),!1}catch{}if(n=wh(e,t,i,a),n!==null)return Un(n,e,a),tw(n,t,a),!0}return!1}function Uh(e,t,n,a){if(a={lane:2,revertLane:$h(),gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},kf(e)){if(t)throw Error(L(479))}else t=wh(e,n,a,2),t!==null&&Un(t,e,2)}function kf(e){var t=e.alternate;return e===we||t!==null&&t===we}function ew(e,t){Es=Yu=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function tw(e,t,n){if((n&4194048)!==0){var a=t.lanes;a&=e.pendingLanes,n|=a,t.lanes=n,P1(e,n)}}var Xu={readContext:sn,use:xf,useCallback:Ct,useContext:Ct,useEffect:Ct,useImperativeHandle:Ct,useLayoutEffect:Ct,useInsertionEffect:Ct,useMemo:Ct,useReducer:Ct,useRef:Ct,useState:Ct,useDebugValue:Ct,useDeferredValue:Ct,useTransition:Ct,useSyncExternalStore:Ct,useId:Ct,useHostTransitionStatus:Ct,useFormState:Ct,useActionState:Ct,useOptimistic:Ct,useMemoCache:Ct,useCacheRefresh:Ct,useEffectEvent:Ct},nw={readContext:sn,use:xf,useCallback:function(e,t){return An().memoizedState=[e,t===void 0?null:t],e},useContext:sn,useEffect:C0,useImperativeHandle:function(e,t,n){n=n!=null?n.concat([e]):null,Su(4194308,4,jx.bind(null,t,e),n)},useLayoutEffect:function(e,t){return Su(4194308,4,e,t)},useInsertionEffect:function(e,t){Su(4,2,e,t)},useMemo:function(e,t){var n=An();t=t===void 0?null:t;var a=e();if(ko){mr(!0);try{e()}finally{mr(!1)}}return n.memoizedState=[a,t],a},useReducer:function(e,t,n){var a=An();if(n!==void 0){var i=n(t);if(ko){mr(!0);try{n(t)}finally{mr(!1)}}}else i=t;return a.memoizedState=a.baseState=i,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:i},a.queue=e,e=e.dispatch=j6.bind(null,we,e),[a.memoizedState,e]},useRef:function(e){var t=An();return e={current:e},t.memoizedState=e},useState:function(e){e=Tg(e);var t=e.queue,n=Wx.bind(null,we,t);return t.dispatch=n,[e.memoizedState,n]},useDebugValue:qh,useDeferredValue:function(e,t){var n=An();return Ph(n,e,t)},useTransition:function(){var e=Tg(!1);return e=Qx.bind(null,we,e.queue,!0,!1),An().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,n){var a=we,i=An();if(Ne){if(n===void 0)throw Error(L(407));n=n()}else{if(n=t(),it===null)throw Error(L(349));(_e&127)!==0||Ax(a,t,n)}i.memoizedState=n;var r={value:n,getSnapshot:t};return i.queue=r,C0(Ox.bind(null,a,r,e),[e]),a.flags|=2048,Ds(9,{destroy:void 0},Rx.bind(null,a,r,n,t),null),n},useId:function(){var e=An(),t=it.identifierPrefix;if(Ne){var n=ci,a=di;n=(a&~(1<<32-ra(a)-1)).toString(32)+n,t="_"+t+"R_"+n,n=Qu++,0<n&&(t+="H"+n.toString(32)),t+="_"}else n=z6++,t="_"+t+"r_"+n.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:Vh,useFormState:N0,useActionState:N0,useOptimistic:function(e){var t=An();t.memoizedState=t.baseState=e;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=n,t=Uh.bind(null,we,!0,n),n.dispatch=t,[e,t]},useMemoCache:Lh,useCacheRefresh:function(){return An().memoizedState=B6.bind(null,we)},useEffectEvent:function(e){var t=An(),n={impl:e};return t.memoizedState=n,function(){if((Ue&2)!==0)throw Error(L(440));return n.impl.apply(void 0,arguments)}}},aw={readContext:sn,use:xf,useCallback:Fx,useContext:sn,useEffect:Hh,useImperativeHandle:Gx,useInsertionEffect:Ux,useLayoutEffect:Bx,useMemo:Kx,useReducer:ku,useRef:Px,useState:function(){return ku(qi)},useDebugValue:qh,useDeferredValue:function(e,t){var n=Ot();return Yx(n,We.memoizedState,e,t)},useTransition:function(){var e=ku(qi)[0],t=Ot().memoizedState;return[typeof e=="boolean"?e:Td(e),t]},useSyncExternalStore:Mx,useId:Jx,useHostTransitionStatus:Vh,useFormState:T0,useActionState:T0,useOptimistic:function(e,t){var n=Ot();return Dx(n,We,e,t)},useMemoCache:Lh,useCacheRefresh:$x,useEffectEvent:Vx},G6={readContext:sn,use:xf,useCallback:Fx,useContext:sn,useEffect:Hh,useImperativeHandle:Gx,useInsertionEffect:Ux,useLayoutEffect:Bx,useMemo:Kx,useReducer:Hm,useRef:Px,useState:function(){return Hm(qi)},useDebugValue:qh,useDeferredValue:function(e,t){var n=Ot();return We===null?Ph(n,e,t):Yx(n,We.memoizedState,e,t)},useTransition:function(){var e=Hm(qi)[0],t=Ot().memoizedState;return[typeof e=="boolean"?e:Td(e),t]},useSyncExternalStore:Mx,useId:Jx,useHostTransitionStatus:Vh,useFormState:E0,useActionState:E0,useOptimistic:function(e,t){var n=Ot();return We!==null?Dx(n,We,e,t):(n.baseState=e,[e,n.queue.dispatch])},useMemoCache:Lh,useCacheRefresh:$x,useEffectEvent:Vx};function qm(e,t,n,a){t=e.memoizedState,n=n(a,t),n=n==null?t:rt({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var Mg={enqueueSetState:function(e,t,n){e=e._reactInternals;var a=oa(),i=kr(a);i.payload=t,n!=null&&(i.callback=n),t=Sr(e,i,a),t!==null&&(Un(t,e,a),Yl(t,e,a))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var a=oa(),i=kr(a);i.tag=1,i.payload=t,n!=null&&(i.callback=n),t=Sr(e,i,a),t!==null&&(Un(t,e,a),Yl(t,e,a))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=oa(),a=kr(n);a.tag=2,t!=null&&(a.callback=t),t=Sr(e,a,n),t!==null&&(Un(t,e,n),Yl(t,e,n))}};function M0(e,t,n,a,i,r,o){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(a,r,o):t.prototype&&t.prototype.isPureReactComponent?!rd(n,a)||!rd(i,r):!0}function A0(e,t,n,a){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(n,a),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(n,a),t.state!==e&&Mg.enqueueReplaceState(t,t.state,null)}function So(e,t){var n=t;if("ref"in t){n={};for(var a in t)a!=="ref"&&(n[a]=t[a])}if(e=e.defaultProps){n===t&&(n=rt({},n));for(var i in e)n[i]===void 0&&(n[i]=e[i])}return n}function iw(e){Pu(e)}function rw(e){console.error(e)}function ow(e){Pu(e)}function Zu(e,t){try{var n=e.onUncaughtError;n(t.value,{componentStack:t.stack})}catch(a){setTimeout(function(){throw a})}}function R0(e,t,n){try{var a=e.onCaughtError;a(n.value,{componentStack:n.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(i){setTimeout(function(){throw i})}}function Ag(e,t,n){return n=kr(n),n.tag=3,n.payload={element:null},n.callback=function(){Zu(e,t)},n}function sw(e){return e=kr(e),e.tag=3,e}function lw(e,t,n,a){var i=n.type.getDerivedStateFromError;if(typeof i=="function"){var r=a.value;e.payload=function(){return i(r)},e.callback=function(){R0(t,n,a)}}var o=n.stateNode;o!==null&&typeof o.componentDidCatch=="function"&&(e.callback=function(){R0(t,n,a),typeof i!="function"&&(Er===null?Er=new Set([this]):Er.add(this));var s=a.stack;this.componentDidCatch(a.value,{componentStack:s!==null?s:""})})}function F6(e,t,n,a,i){if(n.flags|=32768,a!==null&&typeof a=="object"&&typeof a.then=="function"){if(t=n.alternate,t!==null&&vo(t,n,i,!0),n=un.current,n!==null){switch(n.tag){case 31:case 13:case 19:return hn===null?rf():n.alternate===null&&Mt===0&&(Mt=3),n.flags&=-257,n.flags|=65536,n.lanes=i,a===Gu?n.flags|=16384:(t=n.updateQueue,t===null?n.updateQueue=new Set([a]):t.add(a),Fm(e,a,i)),!1;case 22:return n.flags|=65536,a===Gu?n.flags|=16384:(t=n.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([a])},n.updateQueue=t):(n=t.retryQueue,n===null?t.retryQueue=new Set([a]):n.add(a)),Fm(e,a,i)),!1}throw Error(L(435,n.tag))}return Fm(e,a,i),rf(),!1}if(Ne)return t=un.current,t!==null?((t.flags&65536)===0&&(t.flags|=256),t.flags|=65536,t.lanes=i,a!==bg&&(e=Error(L(422),{cause:a}),sd(Na(e,n)))):(a!==bg&&(t=Error(L(423),{cause:a}),sd(Na(t,n))),e=e.current.alternate,e.flags|=65536,i&=-i,e.lanes|=i,a=Na(a,n),i=Ag(e.stateNode,a,i),zm(e,i),Mt!==4&&(Mt=2)),!1;var r=Error(L(520),{cause:a});if(r=Na(r,n),ed===null?ed=[r]:ed.push(r),Mt!==4&&(Mt=2),t===null)return!0;a=Na(a,n),n=t;do{switch(n.tag){case 3:return n.flags|=65536,e=i&-i,n.lanes|=e,e=Ag(n.stateNode,a,e),zm(n,e),!1;case 1:if(t=n.type,r=n.stateNode,(n.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||r!==null&&typeof r.componentDidCatch=="function"&&(Er===null||!Er.has(r))))return n.flags|=65536,i&=-i,n.lanes|=i,i=sw(i),lw(i,e,n,a),zm(n,i),!1;break;case 22:if(n.memoizedState!==null)return n.flags|=65536,!1}n=n.return}while(n!==null);return!1}var Bh=Error(L(461)),zt=!1;function Gt(e,t,n,a){t.child=e===null?kx(t,null,n,a):wo(t,e.child,n,a)}function O0(e,t,n,a,i){n=n.render;var r=t.ref;if("ref"in a){var o={};for(var s in a)s!=="ref"&&(o[s]=a[s])}else o=a;return yo(t),a=Oh(e,t,n,o,r,i),s=_h(),e!==null&&!zt?(Ih(e,t,i),Pi(e,t,i)):(Ne&&s&&bf(t),t.flags|=1,Gt(e,t,a,i),t.child)}function _0(e,t,n,a,i){if(e===null){var r=n.type;return typeof r=="function"&&!kh(r)&&r.defaultProps===void 0&&n.compare===null?(t.tag=15,t.type=r,dw(e,t,r,a,i)):(e=yu(n.type,null,a,t,t.mode,i),e.ref=t.ref,e.return=t,t.child=e)}if(r=e.child,!Gh(e,i)){var o=r.memoizedProps;if(n=n.compare,n=n!==null?n:rd,n(o,a)&&e.ref===t.ref)return Pi(e,t,i)}return t.flags|=1,e=Ii(r,a),e.ref=t.ref,e.return=t,t.child=e}function dw(e,t,n,a,i){if(e!==null){var r=e.memoizedProps;if(rd(r,a)&&e.ref===t.ref)if(zt=!1,t.pendingProps=a=r,Gh(e,i))(e.flags&131072)!==0&&(zt=!0);else return t.lanes=e.lanes,Pi(e,t,i)}return Rg(e,t,n,a,i)}function cw(e,t,n,a){var i=a.children,r=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),a.mode==="hidden"){if((t.flags&128)!==0){if(r=r!==null?r.baseLanes|n:n,e!==null){for(a=t.child=e.child,i=0;a!==null;)i=i|a.lanes|a.childLanes,a=a.sibling;a=i&~r}else a=0,t.child=null;return I0(e,t,r,n,a)}if((n&536870912)!==0)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&wu(t,r!==null?r.cachePool:null),r!==null?w0(t,r):Sg(),Tx(t);else return a=t.lanes=536870912,I0(e,t,r!==null?r.baseLanes|n:n,n,a)}else r!==null?(wu(t,r.cachePool),w0(t,r),Tr(),t.memoizedState=null):(e!==null&&wu(t,null),Sg(),Tr());return Gt(e,t,i,n),t.child}function Jl(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function I0(e,t,n,a,i){var r=Th();return r=r===null?null:{parent:Lt._currentValue,pool:r},t.memoizedState={baseLanes:n,cachePool:r},e!==null&&wu(t,null),Sg(),Tx(t),e!==null&&vo(e,t,a,!0),t.childLanes=i,null}function Nu(e,t){return t=Sf({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function D0(e,t,n){return wo(t,e.child,null,n),e=Nu(t,t.pendingProps),e.flags|=2,ea(t),t.memoizedState=null,e}function K6(e,t,n){var a=t.pendingProps,i=(t.flags&128)!==0;if(t.flags&=-129,e===null){if(Ne){if(a.mode==="hidden")return e=Nu(t,a),t.lanes=536870912,e.memoizedState={baseLanes:0,cachePool:null},Jl(null,e);if(Ng(t),(e=dt)?(e=ck(e,Ta),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:Rr!==null?{id:di,overflow:ci}:null,retryLane:536870912,hydrationErrors:null},n=gx(e),n.return=t,t.child=n,tn=t,dt=null)):e=null,e===null)throw Or(t);return t.lanes=536870912,null}return Nu(t,a)}var r=e.memoizedState;if(r!==null){var o=r.dehydrated;if(Ng(t),i)if(t.flags&256)t.flags&=-257,t=D0(e,t,n);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(L(558));else if(zt||vo(e,t,n,!1),i=(n&e.childLanes)!==0,zt||i){if(_r.current===null){if(a=it,a!==null&&(o=V1(a,n),o!==0&&o!==r.retryLane))throw r.retryLane=o,Mo(e,o),Un(a,e,o),Bh;rf()}t=D0(e,t,n)}else e=r.treeContext,dt=Ea(o.nextSibling),tn=t,Ne=!0,wr=null,Ta=!1,e!==null&&bx(t,e),t=Nu(t,a),t.flags|=134221824;return t}return e=Ii(e.child,{mode:a.mode,children:a.children}),e.ref=t.ref,t.child=e,e.return=t,e}function os(e,t){var n=t.ref;if(n===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof n!="function"&&typeof n!="object")throw Error(L(284));(e===null||e.ref!==n)&&(t.flags|=4194816)}}function Rg(e,t,n,a,i){return yo(t),n=Oh(e,t,n,a,void 0,i),a=_h(),e!==null&&!zt?(Ih(e,t,i),Pi(e,t,i)):(Ne&&a&&bf(t),t.flags|=1,Gt(e,t,n,i),t.child)}function L0(e,t,n,a,i,r){return yo(t),t.updateQueue=null,n=Cx(t,a,n,i),Ex(e),a=_h(),e!==null&&!zt?(Ih(e,t,r),Pi(e,t,r)):(Ne&&a&&bf(t),t.flags|=1,Gt(e,t,n,r),t.child)}function z0(e,t,n,a,i){if(yo(t),t.stateNode===null){var r=bs,o=n.contextType;typeof o=="object"&&o!==null&&(r=sn(o)),r=new n(a,r),t.memoizedState=r.state!==null&&r.state!==void 0?r.state:null,r.updater=Mg,t.stateNode=r,r._reactInternals=t,r=t.stateNode,r.props=a,r.state=t.memoizedState,r.refs={},Ch(t),o=n.contextType,r.context=typeof o=="object"&&o!==null?sn(o):bs,r.state=t.memoizedState,o=n.getDerivedStateFromProps,typeof o=="function"&&(qm(t,n,o,a),r.state=t.memoizedState),typeof n.getDerivedStateFromProps=="function"||typeof r.getSnapshotBeforeUpdate=="function"||typeof r.UNSAFE_componentWillMount!="function"&&typeof r.componentWillMount!="function"||(o=r.state,typeof r.componentWillMount=="function"&&r.componentWillMount(),typeof r.UNSAFE_componentWillMount=="function"&&r.UNSAFE_componentWillMount(),o!==r.state&&Mg.enqueueReplaceState(r,r.state,null),Xl(t,a,r,i),Ql(),r.state=t.memoizedState),typeof r.componentDidMount=="function"&&(t.flags|=4194308),a=!0}else if(e===null){r=t.stateNode;var s=t.memoizedProps,l=So(n,s);r.props=l;var d=r.context,f=n.contextType;o=bs,typeof f=="object"&&f!==null&&(o=sn(f));var v=n.getDerivedStateFromProps;f=typeof v=="function"||typeof r.getSnapshotBeforeUpdate=="function",s=t.pendingProps!==s,f||typeof r.UNSAFE_componentWillReceiveProps!="function"&&typeof r.componentWillReceiveProps!="function"||(s||d!==o)&&A0(t,r,a,o),fr=!1;var g=t.memoizedState;r.state=g,Xl(t,a,r,i),Ql(),d=t.memoizedState,s||g!==d||fr?(typeof v=="function"&&(qm(t,n,v,a),d=t.memoizedState),(l=fr||M0(t,n,l,a,g,d,o))?(f||typeof r.UNSAFE_componentWillMount!="function"&&typeof r.componentWillMount!="function"||(typeof r.componentWillMount=="function"&&r.componentWillMount(),typeof r.UNSAFE_componentWillMount=="function"&&r.UNSAFE_componentWillMount()),typeof r.componentDidMount=="function"&&(t.flags|=4194308)):(typeof r.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=a,t.memoizedState=d),r.props=a,r.state=d,r.context=o,a=l):(typeof r.componentDidMount=="function"&&(t.flags|=4194308),a=!1)}else{r=t.stateNode,wg(e,t),o=t.memoizedProps,f=So(n,o),r.props=f,v=t.pendingProps,g=r.context,d=n.contextType,l=bs,typeof d=="object"&&d!==null&&(l=sn(d)),s=n.getDerivedStateFromProps,(d=typeof s=="function"||typeof r.getSnapshotBeforeUpdate=="function")||typeof r.UNSAFE_componentWillReceiveProps!="function"&&typeof r.componentWillReceiveProps!="function"||(o!==v||g!==l)&&A0(t,r,a,l),fr=!1,g=t.memoizedState,r.state=g,Xl(t,a,r,i),Ql();var h=t.memoizedState;o!==v||g!==h||fr||e!==null&&e.dependencies!==null&&ju(e.dependencies)?(typeof s=="function"&&(qm(t,n,s,a),h=t.memoizedState),(f=fr||M0(t,n,f,a,g,h,l)||e!==null&&e.dependencies!==null&&ju(e.dependencies))?(d||typeof r.UNSAFE_componentWillUpdate!="function"&&typeof r.componentWillUpdate!="function"||(typeof r.componentWillUpdate=="function"&&r.componentWillUpdate(a,h,l),typeof r.UNSAFE_componentWillUpdate=="function"&&r.UNSAFE_componentWillUpdate(a,h,l)),typeof r.componentDidUpdate=="function"&&(t.flags|=4),typeof r.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof r.componentDidUpdate!="function"||o===e.memoizedProps&&g===e.memoizedState||(t.flags|=4),typeof r.getSnapshotBeforeUpdate!="function"||o===e.memoizedProps&&g===e.memoizedState||(t.flags|=1024),t.memoizedProps=a,t.memoizedState=h),r.props=a,r.state=h,r.context=l,a=f):(typeof r.componentDidUpdate!="function"||o===e.memoizedProps&&g===e.memoizedState||(t.flags|=4),typeof r.getSnapshotBeforeUpdate!="function"||o===e.memoizedProps&&g===e.memoizedState||(t.flags|=1024),a=!1)}return r=a,os(e,t),a=(t.flags&128)!==0,r||a?(r=t.stateNode,n=a&&typeof n.getDerivedStateFromError!="function"?null:r.render(),t.flags|=1,e!==null&&a?(t.child=wo(t,e.child,null,i),t.child=wo(t,null,n,i)):Gt(e,t,n,i),t.memoizedState=r.state,e=t.child):e=Pi(e,t,i),e}function H0(e,t,n,a){return bo(),t.flags|=256,Gt(e,t,n,a),t.child}var Og={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function _g(e){return{baseLanes:e,cachePool:yx()}}function Ig(e,t,n){return e=e!==null?e.childLanes&~n:0,t&&(e|=na),e}function uw(e,t,n){var a=t.pendingProps,i=!1,r=(t.flags&128)!==0,o;if((o=r)||(o=e!==null&&e.memoizedState===null?!1:(dn.current&2)!==0),o&&(i=!0,t.flags&=-129),o=(t.flags&32)!==0,t.flags&=-33,e===null){if(Ne){if(i?Nr(t):Tr(),(e=dt)?(e=ck(e,Ta),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:Rr!==null?{id:di,overflow:ci}:null,retryLane:536870912,hydrationErrors:null},n=gx(e),n.return=t,t.child=n,tn=t,dt=null)):e=null,e===null)throw Or(t);return nb(e)?t.lanes=32:t.lanes=536870912,null}return r=a.children,a=a.fallback,i?(Tr(),i=t.mode,r=Sf({mode:"hidden",children:r},i),a=po(a,i,n,null),r.return=t,a.return=t,r.sibling=a,t.child=r,a=t.child,a.memoizedState=_g(n),a.childLanes=Ig(e,o,n),t.memoizedState=Og,Jl(null,a)):(Nr(t),jh(t,r))}var s=e.memoizedState;if(s!==null){var l=s.dehydrated;if(l!==null)return Y6(e,t,r,o,a,l,s,n)}return i?(Tr(),i=a.fallback,r=t.mode,s=e.child,l=s.sibling,a=Ii(s,{mode:"hidden",children:a.children}),a.subtreeFlags=s.subtreeFlags&1206910976,l!==null?i=Ii(l,i):(i=po(i,r,n,null),i.flags|=2),i.return=t,a.return=t,a.sibling=i,t.child=a,Jl(null,a),a=t.child,i=e.child.memoizedState,i===null?i=_g(n):(r=i.cachePool,r!==null?(s=Lt._currentValue,r=r.parent!==s?{parent:s,pool:s}:r):r=yx(),i={baseLanes:i.baseLanes|n,cachePool:r}),a.memoizedState=i,a.childLanes=Ig(e,o,n),t.memoizedState=Og,Jl(e.child,a)):(Nr(t),n=e.child,e=n.sibling,n=Ii(n,{mode:"visible",children:a.children}),n.return=t,n.sibling=null,e!==null&&(o=t.deletions,o===null?(t.deletions=[e],t.flags|=16):o.push(e)),t.child=n,t.memoizedState=null,n)}function jh(e,t){return t=Sf({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function Sf(e,t){return e=Vn(22,e,null,t),e.lanes=0,e}function ru(e,t,n){return wo(t,e.child,null,n),e=jh(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function Y6(e,t,n,a,i,r,o,s){if(n)return t.flags&256?(Nr(t),t.flags&=-257,ru(e,t,s)):t.memoizedState!==null?(Tr(),t.child=e.child,t.flags|=128,null):(Tr(),r=i.fallback,o=t.mode,i=Sf({mode:"visible",children:i.children},o),r=po(r,o,s,null),r.flags|=2,i.return=t,r.return=t,i.sibling=r,t.child=i,wo(t,e.child,null,s),i=t.child,i.memoizedState=_g(s),i.childLanes=Ig(e,a,s),t.memoizedState=Og,Jl(null,i));if(Nr(t),nb(r)){if(a=r.nextSibling&&r.nextSibling.dataset,a)var l=a.dgst;return a=l,a!==""&&(i=Error(L(419)),i.stack="",i.digest=a,sd({value:i,source:null,stack:null})),ru(e,t,s)}if(zt||vo(e,t,s,!1),a=(s&e.childLanes)!==0,zt||a){if(_r.current!==null)return ru(e,t,s);if(a=it,a!==null&&(i=V1(a,s),i!==0&&i!==o.retryLane))throw o.retryLane=i,Mo(e,i),Un(a,e,i),Bh;return ih(r)||rf(),ru(e,t,s)}return ih(r)?(t.flags|=192,t.child=e.child,null):(e=o.treeContext,dt=Ea(r.nextSibling),tn=t,Ne=!0,wr=null,Ta=!1,e!==null&&bx(t,e),t=jh(t,i.children),t.flags|=134221824,t)}function q0(e,t,n){e.lanes|=t;var a=e.alternate;a!==null&&(a.lanes|=t),xu(e.return,t,n)}function P0(e){for(var t=null;e!==null;){var n=e.alternate;n!==null&&Ku(n)===null&&(t=e),e=e.sibling}return t}function ou(e,t,n,a,i,r){var o=e.memoizedState;o===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:a,tail:n,tailMode:i,treeForkCount:r}:(o.isBackwards=t,o.rendering=null,o.renderingStartTime=0,o.last=a,o.tail=n,o.tailMode=i,o.treeForkCount=r)}function Pm(e){var t=e.child;for(e.child=null;t!==null;){var n=t.sibling;t.sibling=e.child,e.child=t,t=n}}function Dg(e,t,n){var a=t.pendingProps,i=a.revealOrder,r=a.tail;a=a.children;var o=dn.current;if(t.flags&128)return dd(t,o),null;var s=(o&2)!==0;if(s?(o=o&1|2,t.flags|=128):o&=1,dd(t,o),i==="backwards"&&e!==null?(Pm(e),Gt(e,t,a,n),Pm(e)):Gt(e,t,a,n),a=Ne?od:0,!s&&e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&q0(e,n,t);else if(e.tag===19)q0(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(i){case"backwards":n=P0(t.child),n===null?(i=t.child,t.child=null):(i=n.sibling,n.sibling=null,Pm(t)),ou(t,!0,i,null,r,a);break;case"unstable_legacy-backwards":for(n=null,i=t.child,t.child=null;i!==null;){if(e=i.alternate,e!==null&&Ku(e)===null){t.child=i;break}e=i.sibling,i.sibling=n,n=i,i=e}ou(t,!0,n,null,r,a);break;case"together":ou(t,!1,null,null,void 0,a);break;case"independent":t.memoizedState=null;break;default:n=P0(t.child),n===null?(i=t.child,t.child=null):(i=n.sibling,n.sibling=null),ou(t,!1,i,n,r,a)}return t.child}function V0(e,t,n){var a=t.pendingProps;return hr(t,t.type,a.value),Gt(e,t,a.children,n),t.child}function Pi(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),Dr|=t.lanes,(n&t.childLanes)===0)if(e!==null){if(vo(e,t,n,!1),(n&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(L(153));if(t.child!==null){for(e=t.child,n=Ii(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=Ii(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function Gh(e,t){return(e.lanes&t)!==0?!0:(e=e.dependencies,!!(e!==null&&ju(e)))}function Q6(e,t,n){switch(t.tag){case 3:Lu(t,t.stateNode.containerInfo),hr(t,Lt,e.memoizedState.cache),bo();break;case 27:case 5:sg(t);break;case 4:Lu(t,t.stateNode.containerInfo);break;case 10:hr(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,Ng(t),null;break;case 13:var a=t.memoizedState;if(a!==null){if(a.dehydrated!==null)return Nr(t),t.flags|=128,null;a=vo(e,t,n,!1);var i=t.child.childLanes;return a||(n&i)!==0?uw(e,t,n):(Nr(t),e=Pi(e,t,n),e!==null?e.sibling:null)}Nr(t);break;case 19:if(t.flags&128)return Dg(e,t,n);if(i=(e.flags&128)!==0,a=(n&t.childLanes)!==0,a||(vo(e,t,n,!1),a=(n&t.childLanes)!==0),i){if(a)return Dg(e,t,n);t.flags|=128}if(i=t.memoizedState,i!==null&&(i.rendering=null,i.tail=null,i.lastEffect=null),dd(t,dn.current),a)break;return null;case 22:return t.lanes=0,cw(e,t,n,t.pendingProps);case 24:hr(t,Lt,e.memoizedState.cache)}return Pi(e,t,n)}function fw(e,t,n){if(e!==null)if(e.memoizedProps!==t.pendingProps)zt=!0;else{if(!Gh(e,n)&&(t.flags&128)===0)return zt=!1,Q6(e,t,n);zt=(e.flags&131072)!==0}else zt=!1,Ne&&(t.flags&1048576)!==0&&hx(t,od,t.index);switch(t.lanes=0,t.tag){case 16:e:{var a=t.pendingProps;if(e=so(t.elementType),t.type=e,typeof e=="function")kh(e)?(a=So(e,a),t.tag=1,t=z0(null,t,e,a,n)):(t.tag=0,t=Rg(null,t,e,a,n));else{if(e!=null){var i=e.$$typeof;if(i===dh){t.tag=11,t=O0(null,t,e,a,n);break e}else if(i===ch){t.tag=14,t=_0(null,t,e,a,n);break e}else if(i===si){t.tag=10,t.type=e,t=V0(null,t,n);break e}}throw t=rg(e)||e,Error(L(306,t,""))}}return t;case 0:return Rg(e,t,t.type,t.pendingProps,n);case 1:return a=t.type,i=So(a,t.pendingProps),z0(e,t,a,i,n);case 3:e:{if(Lu(t,t.stateNode.containerInfo),e===null)throw Error(L(387));a=t.pendingProps;var r=t.memoizedState;i=r.element,wg(e,t),Xl(t,a,null,n);var o=t.memoizedState;if(a=o.cache,hr(t,Lt,a),a!==r.cache&&yg(t,[Lt],n,!0),Ql(),a=o.element,r.isDehydrated)if(r={element:a,isDehydrated:!1,cache:o.cache},t.updateQueue.baseState=r,t.memoizedState=r,t.flags&256){t=H0(e,t,a,n);break e}else if(a!==i){i=Na(Error(L(424)),t),sd(i),t=H0(e,t,a,n);break e}else for(e=t.stateNode.containerInfo,e.nodeType===9?e=e.body:e=e.nodeName==="HTML"?e.ownerDocument.body:e,dt=Ea(e.firstChild),tn=t,Ne=!0,wr=null,Ta=!0,n=kx(t,null,a,n),t.child=n;n;)n.flags=n.flags&-3|134221824,n=n.sibling;else{if(bo(),a===i){t=Pi(e,t,n);break e}Gt(e,t,a,n)}t=t.child}return t;case 26:return os(e,t),e===null?(n=p1(t.type,null,t.pendingProps,null))?t.memoizedState=n:Ne||(t.stateNode=tk(t.type,t.pendingProps,xr.current,t)):t.memoizedState=p1(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return sg(t),e===null&&Ne&&(a=t.stateNode=uk(t.type,t.pendingProps,xr.current),tn=t,Ta=!0,i=dt,zr(t.type)?(rh=i,dt=Ea(a.firstChild)):dt=i),Gt(e,t,t.pendingProps.children,n),os(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&Ne&&((i=a=dt)&&(a=V3(a,t.type,t.pendingProps,Ta),a!==null?(t.stateNode=a,tn=t,dt=Ea(a.firstChild),Ta=!1,i=!0):i=!1),i||Or(t)),sg(t),i=t.type,r=t.pendingProps,o=e!==null?e.memoizedProps:null,a=r.children,th(i,r)?a=null:o!==null&&th(i,o)&&(t.flags|=32),t.memoizedState!==null&&(i=Oh(e,t,H6,null,null,n),Us._currentValue=i),os(e,t),Gt(e,t,a,n),t.child;case 6:return e===null&&Ne&&((e=n=dt)&&(n=U3(n,t.pendingProps,Ta),n!==null?(t.stateNode=n,tn=t,dt=null,e=!0):e=!1),e||Or(t)),null;case 13:return uw(e,t,n);case 4:return Lu(t,t.stateNode.containerInfo),a=t.pendingProps,e===null?t.child=wo(t,null,a,n):Gt(e,t,a,n),t.child;case 11:return O0(e,t,t.type,t.pendingProps,n);case 7:return a=t.pendingProps,os(e,t),Gt(e,t,a,n),t.child;case 8:return Gt(e,t,t.pendingProps.children,n),t.child;case 12:return Gt(e,t,t.pendingProps.children,n),t.child;case 10:return V0(e,t,n);case 9:return i=t.type._context,a=t.pendingProps.children,yo(t),i=sn(i),a=a(i),t.flags|=1,Gt(e,t,a,n),t.child;case 14:return _0(e,t,t.type,t.pendingProps,n);case 15:return dw(e,t,t.type,t.pendingProps,n);case 19:return Dg(e,t,n);case 31:return K6(e,t,n);case 22:return cw(e,t,n,t.pendingProps);case 24:return yo(t),a=sn(Lt),e===null?(i=Th(),i===null&&(i=it,r=Nh(),i.pooledCache=r,r.refCount++,r!==null&&(i.pooledCacheLanes|=n),i=r),t.memoizedState={parent:a,cache:i},Ch(t),hr(t,Lt,i)):((e.lanes&n)!==0&&(wg(e,t),Xl(t,null,null,n),Ql()),i=e.memoizedState,r=t.memoizedState,i.parent!==a?(i={parent:a,cache:a},t.memoizedState=i,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=i),hr(t,Lt,a)):(a=r.cache,hr(t,Lt,a),a!==i.cache&&yg(t,[Lt],n,!0))),Gt(e,t,t.pendingProps.children,n),t.child;case 30:return t.stateNode===null&&(t.stateNode={autoName:null,paired:null,clones:null,ref:null}),a=t.pendingProps,a.name!=null&&a.name!=="auto"?t.flags|=e===null?18882560:18874368:Ne&&bf(t),e!==null&&e.memoizedProps.name!==a.name?t.flags|=4194816:os(e,t),Gt(e,t,a.children,n),t.child;case 29:throw t.pendingProps}throw Error(L(156,t.tag))}function Ri(e){e.flags|=4}function Vm(e,t,n,a,i){var r;if((r=(e.mode&32)!==0)&&(r=n===null?h1(t,a):h1(t,a)&&(a.src!==n.src||a.srcSet!==n.srcSet)),r){if(e.flags|=16777216,(i&335544128)===i)if(e.stateNode.complete)e.flags|=8192;else if(Uw())e.flags|=8192;else throw go=Gu,Eh}else e.flags&=-16777217}function U0(e,t){if(t.type!=="stylesheet"||(t.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!gk(t))if(Uw())e.flags|=8192;else throw go=Gu,Eh}function su(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?H1():536870912,e.lanes|=t,Ls|=t)}function Dl(e,t){if(!Ne)switch(e.tailMode){case"visible":break;case"collapsed":for(var n=e.tail,a=null;n!==null;)n.alternate!==null&&(a=n),n=n.sibling;a===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:a.sibling=null;break;default:for(t=e.tail,n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null}}function lt(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,a=0;if(t)for(var i=e.child;i!==null;)n|=i.lanes|i.childLanes,a|=i.subtreeFlags&1206910976,a|=i.flags&1206910976,i.return=e,i=i.sibling;else for(i=e.child;i!==null;)n|=i.lanes|i.childLanes,a|=i.subtreeFlags,a|=i.flags,i.return=e,i=i.sibling;return e.subtreeFlags|=a,e.childLanes=n,t}function X6(e,t,n){var a=t.pendingProps;switch(Sh(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return lt(t),null;case 1:return lt(t),null;case 3:return n=t.stateNode,a=null,e!==null&&(a=e.memoizedState.cache),t.memoizedState.cache!==a&&(t.flags|=2048),Di(Lt),Os(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(e===null||e.child===null)&&(is(t)?Ri(t):e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,Lm())),lt(t),null;case 26:var i=t.type,r=t.memoizedState;return e===null?(Ri(t),r!==null?(lt(t),U0(t,r)):(lt(t),Vm(t,i,null,a,n))):r?r!==e.memoizedState?(Ri(t),lt(t),U0(t,r)):(lt(t),t.flags&=-16777217):(e=e.memoizedProps,e!==a&&Ri(t),lt(t),Vm(t,i,e,a,n)),null;case 27:if(zu(t),n=xr.current,i=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==a&&Ri(t);else{if(!a){if(t.stateNode===null)throw Error(L(166));return lt(t),t.subtreeFlags&=-33554433,null}e=ui.current,is(t)?m0(t,e):(e=uk(i,a,n),t.stateNode=e,Ri(t))}return lt(t),t.subtreeFlags&=-33554433,null;case 5:if(zu(t),i=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==a&&Ri(t);else{if(!a){if(t.stateNode===null)throw Error(L(166));return lt(t),t.subtreeFlags&=-33554433,null}if(r=ui.current,is(t))m0(t,r);else{var o=pd(xr.current);switch(r){case 1:r=o.createElementNS("http://www.w3.org/2000/svg",i);break;case 2:r=o.createElementNS("http://www.w3.org/1998/Math/MathML",i);break;default:switch(i){case"svg":r=o.createElementNS("http://www.w3.org/2000/svg",i);break;case"math":r=o.createElementNS("http://www.w3.org/1998/Math/MathML",i);break;case"script":r=o.createElement("div"),r.innerHTML="<script><\/script>",r=r.removeChild(r.firstChild);break;case"select":r=typeof a.is=="string"?o.createElement("select",{is:a.is}):o.createElement("select"),a.multiple?r.multiple=!0:a.size&&(r.size=a.size);break;default:r=typeof a.is=="string"?o.createElement(i,{is:a.is}):o.createElement(i)}}r[on]=t,r[jn]=a;e:for(o=t.child;o!==null;){if(o.tag===5||o.tag===6)r.appendChild(o.stateNode);else if(o.tag!==4&&o.tag!==27&&o.child!==null){o.child.return=o,o=o.child;continue}if(o===t)break e;for(;o.sibling===null;){if(o.return===null||o.return===t)break e;o=o.return}o.sibling.return=o.return,o=o.sibling}t.stateNode=r;e:switch(cn(r,i,a),i){case"button":case"input":case"select":case"textarea":a=!!a.autoFocus;break e;case"img":a=!0;break e;default:a=!1}a&&Ri(t)}}return lt(t),t.subtreeFlags&=-33554433,Vm(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,n),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==a&&Ri(t);else{if(typeof a!="string"&&t.stateNode===null)throw Error(L(166));if(e=xr.current,is(t)){if(e=t.stateNode,n=t.memoizedProps,a=null,i=tn,i!==null)switch(i.tag){case 27:case 5:a=i.memoizedProps}e[on]=t,e=!!(e.nodeValue===n||a!==null&&a.suppressHydrationWarning===!0||Ww(e.nodeValue,n)),e||Or(t,!0)}else e=pd(e).createTextNode(a),e[on]=t,t.stateNode=e}return lt(t),null;case 31:if(n=t.memoizedState,e===null||e.memoizedState!==null){if(a=is(t),n!==null){if(e===null){if(!a)throw Error(L(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(L(557));e[on]=t}else bo(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;lt(t),e=!1}else n=Lm(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=n),e=!0;if(!e)return t.flags&256?(ea(t),t):(ea(t),null);if((t.flags&128)!==0)throw Error(L(558))}return lt(t),null;case 13:if(a=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(i=is(t),a!==null&&a.dehydrated!==null){if(e===null){if(!i)throw Error(L(318));if(i=t.memoizedState,i=i!==null?i.dehydrated:null,!i)throw Error(L(317));i[on]=t}else bo(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;lt(t),i=!1}else i=Lm(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=i),i=!0;if(!i)return t.flags&256?(ea(t),t):(ea(t),null)}return ea(t),(t.flags&128)!==0?(t.lanes=n,t):(n=a!==null,e=e!==null&&e.memoizedState!==null,n&&(a=t.child,i=null,a.alternate!==null&&a.alternate.memoizedState!==null&&a.alternate.memoizedState.cachePool!==null&&(i=a.alternate.memoizedState.cachePool.pool),r=null,a.memoizedState!==null&&a.memoizedState.cachePool!==null&&(r=a.memoizedState.cachePool.pool),r!==i&&(a.flags|=2048)),n!==e&&n&&(t.child.flags|=8192),su(t,t.updateQueue),lt(t),null);case 4:return Os(),e===null&&Wh(t.stateNode.containerInfo),t.flags|=67108864,lt(t),null;case 10:return Di(t.type),lt(t),null;case 19:if(Ah(t),a=t.memoizedState,a===null)return lt(t),null;if(i=(t.flags&128)!==0,r=a.rendering,r===null)if(i)Dl(a,!1);else{if(Mt!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(r=Ku(e),r!==null){for(t.flags|=128,Dl(a,!1),e=r.updateQueue,t.updateQueue=e,su(t,e),t.subtreeFlags=0,e=n,n=t.child;n!==null;)mx(n,e),n=n.sibling;return dd(t,dn.current&1|2),Ne&&Oi(t,a.treeForkCount),t.child}e=e.sibling}a.tail!==null&&aa()>nf&&(t.flags|=128,i=!0,Dl(a,!1),t.lanes=4194304)}else{if(!i)if(e=Ku(r),e!==null){if(t.flags|=128,i=!0,e=e.updateQueue,t.updateQueue=e,su(t,e),Dl(a,!0),a.tail===null&&a.tailMode!=="collapsed"&&a.tailMode!=="visible"&&!r.alternate&&!Ne)return lt(t),null}else 2*aa()-a.renderingStartTime>nf&&n!==536870912&&(t.flags|=128,i=!0,Dl(a,!1),t.lanes=4194304);a.isBackwards?(r.sibling=t.child,t.child=r):(e=a.last,e!==null?e.sibling=r:t.child=r,a.last=r)}if(a.tail!==null){e=a.tail;e:{for(n=e;n!==null;){if(n.alternate!==null){n=!1;break e}n=n.sibling}n=!0}return a.rendering=e,a.tail=e.sibling,a.renderingStartTime=aa(),e.sibling=null,r=dn.current,r=i?r&1|2:r&1,a.tailMode==="visible"||a.tailMode==="collapsed"||!n||Ne?dd(t,r):(n=r,ct(un,t),ct(dn,n),hn===null&&(hn=t)),Ne&&Oi(t,a.treeForkCount),e}return lt(t),null;case 22:case 23:return ea(t),Mh(),a=t.memoizedState!==null,e!==null?e.memoizedState!==null!==a&&(t.flags|=8192):a&&(t.flags|=8192),a?(n&536870912)!==0&&(t.flags&128)===0&&(lt(t),t.subtreeFlags&6&&(t.flags|=8192)):lt(t),n=t.updateQueue,n!==null&&su(t,n.retryQueue),n=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),a=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(a=t.memoizedState.cachePool.pool),a!==n&&(t.flags|=2048),e!==null&&ln(mo),null;case 24:return n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),Di(Lt),lt(t),null;case 25:return null;case 30:return t.flags|=33554432,lt(t),null}throw Error(L(156,t.tag))}function Z6(e,t){switch(Sh(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Di(Lt),Os(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return zu(t),null;case 31:if(t.memoizedState!==null){if(ea(t),t.alternate===null)throw Error(L(340));bo()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(ea(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(L(340));bo()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return Ah(t),e=t.flags,e&65536?(t.flags=e&-65537|128,e=t.memoizedState,e!==null&&(e.rendering=null,e.tail=null),t.flags|=4,t):null;case 4:return Os(),null;case 10:return Di(t.type),null;case 22:case 23:return ea(t),Mh(),e!==null&&ln(mo),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return Di(Lt),null;case 25:return null;default:return null}}function pw(e,t){switch(Sh(t),t.tag){case 3:Di(Lt),Os();break;case 26:case 27:case 5:zu(t);break;case 4:Os();break;case 31:t.memoizedState!==null&&ea(t);break;case 13:ea(t);break;case 19:Ah(t);break;case 10:Di(t.type);break;case 22:case 23:ea(t),Mh(),e!==null&&ln(mo);break;case 24:Di(Lt)}}function Ed(e,t){try{var n=t.updateQueue,a=n!==null?n.lastEffect:null;if(a!==null){var i=a.next;n=i;do{if((n.tag&e)===e){a=void 0;var r=n.create,o=n.inst;a=r(),o.destroy=a}n=n.next}while(n!==i)}}catch(s){Ze(t,t.return,s)}}function Ir(e,t,n){try{var a=t.updateQueue,i=a!==null?a.lastEffect:null;if(i!==null){var r=i.next;a=r;do{if((a.tag&e)===e){var o=a.inst,s=o.destroy;if(s!==void 0){o.destroy=void 0,i=t;var l=n,d=s;try{d()}catch(f){Ze(i,l,f)}}}a=a.next}while(a!==r)}}catch(f){Ze(t,t.return,f)}}function mw(e){var t=e.updateQueue;if(t!==null){var n=e.stateNode;try{Nx(t,n)}catch(a){Ze(e,e.return,a)}}}function gw(e,t,n){n.props=So(e.type,e.memoizedProps),n.state=e.memoizedState;try{n.componentWillUnmount()}catch(a){Ze(e,t,a)}}function ri(e,t){try{var n=e.ref;if(n!==null){switch(e.tag){case 26:case 27:case 5:var a=e.stateNode;break;case 30:var i=e.stateNode,r=zi(e.memoizedProps,i);(i.ref===null||i.ref.name!==r)&&(i.ref=rk(r)),a=i.ref;break;case 7:if(e.stateNode===null){var o=new la(e);Bn(e.child,!1,q3,o,void 0,void 0),e.stateNode=o}a=e.stateNode;break;default:a=e.stateNode}typeof n=="function"?e.refCleanup=n(a):n.current=a}}catch(s){Ze(e,t,s)}}function rn(e,t){var n=e.ref,a=e.refCleanup;if(n!==null)if(typeof a=="function")try{a()}catch(i){Ze(e,t,i)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof n=="function")try{n(null)}catch(i){Ze(e,t,i)}else n.current=null}function Ju(e,t){if((e.tag===5||e.tag===27||e.tag===6)&&e.alternate===null&&t!==null)for(var n=0;n<t.length;n++)dk(e.stateNode,t[n])}function B0(e){for(var t=e.return;t!==null&&(Kh(t)&&dk(e.stateNode,t.stateNode),!Fh(t));)t=t.return}function $l(e){for(var t=e.return;t!==null&&(Kh(t)&&P3(e.stateNode,t.stateNode),!Fh(t));)t=t.return}function Fh(e){return e.tag===5||e.tag===3||e.tag===27}function Kh(e){return e&&e.tag===7&&e.stateNode!==null}function Lg(e){var t=e.type,n=e.memoizedProps,a=e.stateNode;try{e:switch(t){case"button":case"input":case"select":case"textarea":n.autoFocus&&a.focus();break e;case"img":n.src?a.src=n.src:n.srcSet&&(a.srcset=n.srcSet)}}catch(i){Ze(e,e.return,i)}}function Um(e,t,n){try{var a=e.stateNode;x3(a,e.type,n,t),a[jn]=t}catch(i){Ze(e,e.return,i)}}function hw(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&zr(e.type)||e.tag===4}function Bm(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||hw(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&zr(e.type)||e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function zg(e,t,n,a){var i=e.tag;if(i===5||i===6)i=e.stateNode,t?(n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n).insertBefore(i,t):(t=n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n,t.appendChild(i),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=li)),Ju(e,a),Ve=!0;else if(i!==4&&(i===27&&(Ju(e,a),a=null,zr(e.type)&&(n=e.stateNode,t=null)),e=e.child,e!==null))for(zg(e,t,n,a),e=e.sibling;e!==null;)zg(e,t,n,a),e=e.sibling}function $u(e,t,n,a){var i=e.tag;if(i===5||i===6)i=e.stateNode,t?n.insertBefore(i,t):n.appendChild(i),Ju(e,a),Ve=!0;else if(i!==4&&(i===27&&(Ju(e,a),a=null,zr(e.type)&&(n=e.stateNode)),e=e.child,e!==null))for($u(e,t,n,a),e=e.sibling;e!==null;)$u(e,t,n,a),e=e.sibling}function bw(e){var t=e.stateNode,n=e.memoizedProps;try{for(var a=e.type,i=t.attributes;i.length;)t.removeAttributeNode(i[0]);cn(t,a,n),t[on]=e,t[jn]=n}catch(r){Ze(e,e.return,r)}}var Wu=!1,ta=null;function j0(e){(e.tag===30||(e.subtreeFlags&33554432)!==0)&&(Wu=!0)}var oi=null;function G0(){var e=oi;return oi=null,e}var Pn=0;function Ys(e,t,n,a,i){return Pn=0,vw(e.child,t,n,a,i)}function vw(e,t,n,a,i){for(var r=!1;e!==null;){if(e.tag===5){var o=e.stateNode;if(a!==null){var s=nh(o);a.push(s),s.view&&(r=!0)}else r||nh(o).view&&(r=!0);Wu=!0,nk(o,Pn===0?t:t+"_"+Pn,n),Pn++}else(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&i||vw(e.child,t,n,a,i)&&(r=!0));e=e.sibling}return r}function pi(e,t){for(;e!==null;)e.tag===5?ak(e.stateNode,e.memoizedProps):(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&t||pi(e.child,t)),e=e.sibling}function Tu(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if((e.tag!==22||e.memoizedState===null)&&(Tu(e),e.tag===30&&(e.flags&18874368)!==0&&e.stateNode.paired)){var t=e.memoizedProps;if(t.name==null||t.name==="auto")throw Error(L(544));var n=t.name;t=Bi(t.default,t.share),t!=="none"&&(Ys(e,n,t,null,!1)||pi(e.child,!1))}e=e.sibling}}function Hg(e,t){if(e.tag===30){var n=e.stateNode,a=e.memoizedProps,i=zi(a,n),r=Bi(a.default,n.paired?a.share:a.enter);r!=="none"?Ys(e,i,r,null,!1)?(Tu(e),n.paired||t||zs(e,a.onEnter)):pi(e.child,!1):Tu(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Hg(e,t),e=e.sibling;else Tu(e)}function qg(e){if(ta!==null&&ta.size!==0){var t=ta;if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var n=e.memoizedProps,a=n.name;if(a!=null&&a!=="auto"){var i=t.get(a);if(i!==void 0){var r=Bi(n.default,n.share);if(r!=="none"&&(Ys(e,a,r,null,!1)?(r=e.stateNode,i.paired=r,r.paired=i,zs(e,n.onShare)):pi(e.child,!1)),t.delete(a),t.size===0)break}}}qg(e)}e=e.sibling}}}function Pg(e){if(e.tag===30){var t=e.memoizedProps,n=zi(t,e.stateNode),a=ta!==null?ta.get(n):void 0,i=Bi(t.default,a!==void 0?t.share:t.exit);i!=="none"&&(Ys(e,n,i,null,!1)?a!==void 0?(i=e.stateNode,a.paired=i,i.paired=a,ta.delete(n),zs(e,t.onShare)):zs(e,t.onExit):pi(e.child,!1)),ta!==null&&qg(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Pg(e),e=e.sibling;else ta!==null&&qg(e)}function yw(e){for(e=e.child;e!==null;){if(e.tag===30){var t=e.memoizedProps,n=zi(t,e.stateNode);t=Bi(t.default,t.update),e.flags&=-5,t!=="none"&&Ys(e,n,t,e.memoizedState=[],!1)}else(e.subtreeFlags&33554432)!==0&&yw(e);e=e.sibling}}function Vg(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var t=e.stateNode;t.paired!==null&&(t.paired=null,pi(e.child,!1))}Vg(e)}e=e.sibling}}function Eu(e){if(e.tag===30)e.stateNode.paired=null,pi(e.child,!1),Vg(e);else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Eu(e),e=e.sibling;else Vg(e)}function xw(e){for(e=e.child;e!==null;)e.tag===30?pi(e.child,!1):(e.subtreeFlags&33554432)!==0&&xw(e),e=e.sibling}function Yh(e,t,n,a,i,r,o){for(var s=!1;t!==null;){if(t.tag===5){var l=t.stateNode;if(r!==null&&Pn<r.length){var d=r[Pn],f=nh(l);(d.view||f.view)&&(s=!0);var v;if(v=(e.flags&4)===0)if(f.clip)v=!0;else{v=d.rect;var g=f.rect;v=v.y!==g.y||v.x!==g.x||v.height!==g.height||v.width!==g.width}v&&(e.flags|=4),f.abs?f=!d.abs:(d=d.rect,f=f.rect,f=d.height!==f.height||d.width!==f.width),f&&(e.flags|=32)}else e.flags|=32;(e.flags&4)!==0&&nk(l,Pn===0?n:n+"_"+Pn,i),s&&(e.flags&4)!==0||(oi===null&&(oi=[]),oi.push(l,Pn===0?a:a+"_"+Pn,t.memoizedProps)),Pn++}else(t.tag!==22||t.memoizedState===null)&&(t.tag===30&&o?e.flags|=t.flags&32:Yh(e,t.child,n,a,i,r,o)&&(s=!0));t=t.sibling}return s}function ww(e,t){for(e=e.child;e!==null;){if(e.tag===30){var n=e.memoizedProps,a=e.stateNode,i=zi(n,a),r=Bi(n.default,n.update);if(t){a=a.clones;var o=a===null?null:a.map(E3)}else o=e.memoizedState,e.memoizedState=null;a=e;var s=e.child;Pn=0,i=Yh(a,s,i,i,r,o,!1),(e.flags&4)!==0&&i&&(t||zs(e,n.onUpdate))}else(e.subtreeFlags&33554432)!==0&&ww(e,t);e=e.sibling}}var $t=!1,Ke=!1,ni=!1,jm=!1,F0=typeof WeakSet=="function"?WeakSet:Set,Wt=null,ai=!1,Bl=!1,ef=!1,Ug=!1;function J6(e,t,n){if(e=e.containerInfo,Wg=Bs,e=ox(e),yh(e)){if("selectionStart"in e)var a={start:e.selectionStart,end:e.selectionEnd};else e:{a=(a=e.ownerDocument)&&a.defaultView||window;var i=a.getSelection&&a.getSelection();if(i&&i.rangeCount!==0){a=i.anchorNode;var r=i.anchorOffset,o=i.focusNode;i=i.focusOffset;try{a.nodeType,o.nodeType}catch{a=null;break e}var s=0,l=-1,d=-1,f=0,v=0,g=e,h=null;t:for(;;){for(var w;g!==a||r!==0&&g.nodeType!==3||(l=s+r),g!==o||i!==0&&g.nodeType!==3||(d=s+i),g.nodeType===3&&(s+=g.nodeValue.length),(w=g.firstChild)!==null;)h=g,g=w;for(;;){if(g===e)break t;if(h===a&&++f===r&&(l=s),h===o&&++v===i&&(d=s),(w=g.nextSibling)!==null)break;g=h,h=g.parentNode}g=w}a=l===-1||d===-1?null:{start:l,end:d}}else a=null}a=a||{start:0,end:0}}else a=null;for(eh={focusedElem:e,selectionRange:a},Bs=!1,n=(n&335544064)===n,Wt=t,t=n?9270:1024;Wt!==null;){if(e=Wt,n&&(a=e.deletions,a!==null))for(r=0;r<a.length;r++)n&&Pg(a[r]);if(e.alternate===null&&(e.flags&2)!==0)n&&j0(e),lu(n);else{if(e.tag===22){if(a=e.alternate,e.memoizedState!==null){a!==null&&a.memoizedState===null&&n&&Pg(a),lu(n);continue}else if(a!==null&&a.memoizedState!==null){n&&j0(e),lu(n);continue}}a=e.child,(e.subtreeFlags&t)!==0&&a!==null?(a.return=e,Wt=a):(n&&yw(e),lu(n))}}ta=null}function lu(e){for(;Wt!==null;){var t=Wt,n=e,a=t.alternate,i=t.flags;switch(t.tag){case 0:case 11:case 15:break;case 1:if((i&1024)!==0&&a!==null){n=void 0,i=a.memoizedProps,a=a.memoizedState;var r=t.stateNode;try{var o=So(t.type,i);n=r.getSnapshotBeforeUpdate(o,a),r.__reactInternalSnapshotBeforeUpdate=n}catch(s){Ze(t,t.return,s)}}break;case 3:if((i&1024)!==0){if(a=t.stateNode.containerInfo,n=a.nodeType,n===9)ah(a);else if(n===1)switch(a.nodeName){case"HEAD":case"HTML":case"BODY":ah(a);break;default:a.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;case 30:n&&a!==null&&(n=zi(a.memoizedProps,a.stateNode),i=t.memoizedProps,i=Bi(i.default,i.update),i!=="none"&&Ys(a,n,i,a.memoizedState=[],!0));break;default:if((i&1024)!==0)throw Error(L(163))}if(a=t.sibling,a!==null){a.return=t.return,Wt=a;break}Wt=t.return}}function kw(e,t,n){var a=n.flags;switch(n.tag){case 0:case 11:case 15:ii(e,n),a&4&&Ed(5,n);break;case 1:if(ii(e,n),a&4)if(e=n.stateNode,t===null)try{e.componentDidMount()}catch(o){Ze(n,n.return,o)}else{var i=So(n.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(i,t,e.__reactInternalSnapshotBeforeUpdate)}catch(o){Ze(n,n.return,o)}}a&64&&mw(n),a&512&&ri(n,n.return);break;case 3:if(ii(e,n),a&64&&(e=n.updateQueue,e!==null)){if(t=null,n.child!==null)switch(n.child.tag){case 27:case 5:t=n.child.stateNode;break;case 1:t=n.child.stateNode}try{Nx(e,t)}catch(o){Ze(n,n.return,o)}}break;case 27:t===null&&a&4&&bw(n);case 26:case 5:ii(e,n),t===null&&a&4&&Lg(n),a&512&&ri(n,n.return);break;case 12:ii(e,n);break;case 31:ii(e,n),a&4&&Ew(e,n);break;case 13:ii(e,n),a&4&&Cw(e,n),a&64&&(e=n.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(n=d3.bind(null,n),B3(e,n))));break;case 22:if(a=n.memoizedState!==null||$t,!a){var r=t!==null&&t.memoizedState!==null||Ke;t=$t,i=Ke,$t=a,(Ke=r)&&!i?(a=2,(n.subtreeFlags&8772)!==0&&(a|=1),Ua(e,n,a)):ii(e,n),$t=t,Ke=i}break;case 30:ii(e,n),a&512&&ri(n,n.return);break;case 7:a&512&&ri(n,n.return);default:ii(e,n)}}function Bg(e,t){for(e=e.child;e!==null;)Sw(e,t),e=e.sibling}function Sw(e,t){switch(e.tag){case 5:case 26:try{var n=e.stateNode;if(t){var a=n.style;typeof a.setProperty=="function"?a.setProperty("display","none","important"):a.display="none"}else{var i=e.stateNode,r=e.memoizedProps.style,o=r!=null&&r.hasOwnProperty("display")?r.display:null;i.style.display=o==null||typeof o=="boolean"?"":(""+o).trim()}}catch(l){Ze(e,e.return,l)}jg(e,t);break;case 6:try{e.stateNode.nodeValue=t?"":e.memoizedProps,Ve=!0}catch(l){Ze(e,e.return,l)}break;case 18:try{var s=e.stateNode;t?s1(s,!0):s1(e.stateNode,!1)}catch(l){Ze(e,e.return,l)}break;case 22:case 23:e.memoizedState===null&&Bg(e,t);break;default:Bg(e,t)}}function jg(e,t){if(e.subtreeFlags&67108864)for(e=e.child;e!==null;){e:{var n=e,a=t;switch(n.tag){case 4:Sw(n,a);break e;case 22:n.memoizedState===null&&jg(n,a);break e;default:jg(n,a)}}e=e.sibling}}function Nw(e){var t=e.alternate;t!==null&&(e.alternate=null,Nw(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&uf(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var gt=null,Hn=!1;function Va(e,t,n){for(n=n.child;n!==null;)Tw(e,t,n),n=n.sibling}function Tw(e,t,n){if(ia&&typeof ia.onCommitFiberUnmount=="function")try{ia.onCommitFiberUnmount(yd,n)}catch{}switch(n.tag){case 26:Ke||rn(n,t),Va(e,t,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&!Ke&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:Ke||rn(n,t),$l(n);var a=gt,i=Hn;zr(n.type)&&(gt=n.stateNode,Hn=!1),Va(e,t,n),fk(n.stateNode,n.type,n.memoizedProps),gt=a,Hn=i;break;case 5:Ke||rn(n,t),$l(n);case 6:if(n.tag===6&&$l(n),a=gt,i=Hn,gt=null,Va(e,t,n),gt=a,Hn=i,gt!==null)if(Hn)try{(gt.nodeType===9?gt.body:gt.nodeName==="HTML"?gt.ownerDocument.body:gt).removeChild(n.stateNode),Ve=!0}catch(r){Ze(n,t,r)}else try{gt.removeChild(n.stateNode),Ve=!0}catch(r){Ze(n,t,r)}break;case 18:gt!==null&&(Hn?(e=gt,o1(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,n.stateNode),js(e)):o1(gt,n.stateNode));break;case 4:a=gt,i=Hn,gt=n.stateNode.containerInfo,Hn=!0,Va(e,t,n),gt=a,Hn=i;break;case 0:case 11:case 14:case 15:Ir(2,n,t),Ke||Ir(4,n,t),Va(e,t,n);break;case 1:Ke||(rn(n,t),a=n.stateNode,typeof a.componentWillUnmount=="function"&&gw(n,t,a)),Va(e,t,n);break;case 21:Va(e,t,n);break;case 22:Ke=(a=Ke)||n.memoizedState!==null,Va(e,t,n),Ke=a;break;case 30:rn(n,t),Va(e,t,n);break;case 7:Ke||rn(n,t),Va(e,t,n);break;default:Va(e,t,n)}}function Ew(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{js(e)}catch(n){Ze(t,t.return,n)}}}function Cw(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{js(e)}catch(n){Ze(t,t.return,n)}}function $6(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new F0),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new F0),t;default:throw Error(L(435,e.tag))}}function du(e,t){var n=$6(e);t.forEach(function(a){if(!n.has(a)){n.add(a);var i=c3.bind(null,e,a);a.then(i,i)}})}function Cn(e,t,n){var a=t.deletions;if(a!==null)for(var i=0;i<a.length;i++){var r=a[i],o=e,s=t,l=s;e:for(;l!==null;){switch(l.tag){case 27:if(zr(l.type)){gt=l.stateNode,Hn=!1;break e}break;case 5:gt=l.stateNode,Hn=!1;break e;case 3:case 4:gt=l.stateNode.containerInfo,Hn=!0;break e}l=l.return}if(gt===null)throw Error(L(160));Tw(o,s,r),gt=null,Hn=!1,o=r.alternate,o!==null&&(o.return=null),r.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)Mw(t,e,n),t=t.sibling}var Ba=null;function Mw(e,t,n){var a=e.alternate,i=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(i&4&&(a=e.updateQueue,a=a!==null?a.events:null,a!==null))for(var r=0;r<a.length;r++){var o=a[r];o.ref.impl=o.nextImpl}Cn(t,e,n),Mn(e),i&4&&(Ir(3,e,e.return),Ed(3,e),Ir(5,e,e.return));break;case 1:Cn(t,e,n),Mn(e),i&512&&(Ke||a===null||rn(a,a.return)),i&64&&$t&&(e=e.updateQueue,e!==null&&(t=e.callbacks,t!==null&&(n=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=n===null?t:n.concat(t))));break;case 26:if(r=Ba,Cn(t,e,n),Mn(e),i&512&&(Ke||a===null||rn(a,a.return)),i&4)if(i=a!==null?a.memoizedState:null,n=e.memoizedState,a===null)if(n===null)if(e.stateNode===null)if($t)e.stateNode=tk(e.type,e.memoizedProps,t.containerInfo,e);else{e:{t=e.type,n=e.memoizedProps,i=r.ownerDocument||r;t:switch(t){case"title":a=i.getElementsByTagName("title")[0],(!a||a[kd]||a[on]||a.namespaceURI==="http://www.w3.org/2000/svg"||a.hasAttribute("itemprop"))&&(a=i.createElement(t),i.head.insertBefore(a,i.querySelector("head > title"))),cn(a,t,n),a[on]=e,en(a),t=a;break e;case"link":if(r=g1("link","href",i).get(t+(n.href||""))){for(o=0;o<r.length;o++)if(a=r[o],a.getAttribute("href")===(n.href==null||n.href===""?null:n.href)&&a.getAttribute("rel")===(n.rel==null?null:n.rel)&&a.getAttribute("title")===(n.title==null?null:n.title)&&a.getAttribute("crossorigin")===(n.crossOrigin==null?null:n.crossOrigin)){r.splice(o,1);break t}}a=i.createElement(t),cn(a,t,n),i.head.appendChild(a);break;case"meta":if(r=g1("meta","content",i).get(t+(n.content||""))){for(o=0;o<r.length;o++)if(a=r[o],a.getAttribute("content")===(n.content==null?null:""+n.content)&&a.getAttribute("name")===(n.name==null?null:n.name)&&a.getAttribute("property")===(n.property==null?null:n.property)&&a.getAttribute("http-equiv")===(n.httpEquiv==null?null:n.httpEquiv)&&a.getAttribute("charset")===(n.charSet==null?null:n.charSet)){r.splice(o,1);break t}}a=i.createElement(t),cn(a,t,n),i.head.appendChild(a);break;default:throw Error(L(468,t))}a[on]=e,en(a),t=a}e.stateNode=t}else $t||oh(r,e.type,e.stateNode);else e.stateNode=m1(r,n,e.memoizedProps);else i!==n?(i===null?(t=a.stateNode,t===null||Ke||t.parentNode.removeChild(t)):i.count--,n===null?$t||oh(r,e.type,e.stateNode):m1(r,n,e.memoizedProps)):n===null&&e.stateNode!==null&&Um(e,e.memoizedProps,a.memoizedProps);break;case 27:Cn(t,e,n),Mn(e),i&512&&(Ke||a===null||rn(a,a.return)),a!==null&&i&4&&Um(e,e.memoizedProps,a.memoizedProps);break;case 5:if(r=ni,ni=!1,Cn(t,e,n),ni=r,Mn(e),i&512&&(Ke||a===null||rn(a,a.return)),e.flags&32){t=e.stateNode;try{Is(t,""),Ve=!0}catch(f){Ze(e,e.return,f)}}i&4&&e.stateNode!=null&&(t=e.memoizedProps,Um(e,t,a!==null?a.memoizedProps:t)),i&1024&&(jm=!0);break;case 6:if(Cn(t,e,n),Mn(e),i&4){if(e.stateNode===null)throw Error(L(162));t=e.memoizedProps,n=e.stateNode;try{n.nodeValue=t,Ve=!0}catch(f){Ze(e,e.return,f)}}break;case 3:if(Ve=!1,Ru=null,r=Ba,Ba=md(t.containerInfo),Cn(t,e,n),Ba=r,Mn(e),i&4&&a!==null&&a.memoizedState.isDehydrated)try{js(t.containerInfo)}catch(f){Ze(e,e.return,f)}jm&&(jm=!1,Aw(e)),Ve=!1;break;case 4:i=ni,ni=$t,a=Jy(),r=Ba,Ba=md(e.stateNode.containerInfo),Cn(t,e,n),Mn(e),Ba=r,Ve&&Bl&&(ef=!0),Ve=a,ni=i;break;case 12:Cn(t,e,n),Mn(e);break;case 31:Cn(t,e,n),Mn(e),i&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,du(e,t)));break;case 13:Cn(t,e,n),Mn(e),e.child.flags&8192&&e.memoizedState!==null!=(a!==null&&a.memoizedState!==null)&&(Nf=aa()),i&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,du(e,t)));break;case 22:r=e.memoizedState!==null,o=a!==null&&a.memoizedState!==null;var s=$t,l=Ke,d=ni;$t=s||r,ni=d||r,Ke=l||o,Cn(t,e,n),Ke=l,ni=d,$t=s,Mn(e),i&8192&&(t=e.stateNode,t._visibility=r?t._visibility&-2:t._visibility|1,!r||a===null||o||$t||Ke||(t=o||Ke,n=$t,a=Ke,$t=r||$t,Ke=t,cr(e,2),$t=n,Ke=a),!r&&ni||Bg(e,r)),i&4&&(t=e.updateQueue,t!==null&&(n=t.retryQueue,n!==null&&(t.retryQueue=null,du(e,n))));break;case 19:Cn(t,e,n),Mn(e),i&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,du(e,t)));break;case 30:i&512&&(Ke||a===null||rn(a,a.return)),i=Jy(),r=Bl,o=(n&335544064)===n,s=e.memoizedProps,Bl=o&&Bi(s.default,s.update)!=="none",Cn(t,e,n),Mn(e),o&&a!==null&&Ve&&(e.flags|=4),Bl=r,Ve=i;break;case 21:break;case 7:i&512&&(Ke||a===null||rn(a,a.return)),a&&a.stateNode!==null&&(a.stateNode._fragmentFiber=e);default:Cn(t,e,n),Mn(e)}}function Mn(e){var t=e.flags;if(t&2){try{for(var n,a=e.return;a!==null;){if(hw(a)){n=a;break}a=a.return}a=null;for(var i=e.return;i!==null;){if(Kh(i)){var r=i.stateNode;a===null?a=[r]:a.push(r)}if(Fh(i))break;i=i.return}var o=a;if(n==null)throw Error(L(160));switch(n.tag){case 27:var s=n.stateNode,l=Bm(e);$u(e,l,s,o);break;case 5:var d=n.stateNode;n.flags&32&&(Is(d,""),n.flags&=-33);var f=Bm(e);$u(e,f,d,o);break;case 3:case 4:var v=n.stateNode.containerInfo,g=Bm(e);zg(e,g,v,o);break;default:throw Error(L(161))}}catch(h){Ze(e,e.return,h)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function Aw(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;Aw(t),t.tag===5&&t.flags&1024&&(t=t.stateNode,Bs=!0,t.reset(),Bs=!1),e=e.sibling}}function rs(e,t){if(t.subtreeFlags&9270)for(t=t.child;t!==null;)Rw(t,e),t=t.sibling;else ww(t,!1)}function Rw(e,t){var n=e.alternate;if(n===null)Hg(e,!1);else switch(e.tag){case 3:if(Ug=ai=!1,G0(),rs(t,e),!ai&&!ef){if(e=oi,e!==null)for(var a=0;a<e.length;a+=3){n=e[a];var i=e[a+1];ak(n,e[a+2]),n=n.ownerDocument.documentElement,n!==null&&n.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group("+i+")"})}e=t.containerInfo,e=e.nodeType===9?e.documentElement:e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName===""&&(e.style.viewTransitionName="none",e.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group(root)"}),e.animate({width:[0,0],height:[0,0]},{duration:0,fill:"forwards",pseudoElement:"::view-transition"})),Ug=!0}oi=null;break;case 5:rs(t,e);break;case 4:a=ai,ai=!1,rs(t,e),ai&&(ef=!0),ai=a;break;case 22:e.memoizedState===null&&(n.memoizedState!==null?Hg(e,!1):rs(t,e));break;case 30:a=ai,i=G0(),ai=!1,rs(t,e),ai&&(e.flags|=4);var r=e.memoizedProps,o=e.stateNode;t=zi(r,o),o=zi(n.memoizedProps,o);var s=Bi(r.default,r.update);s==="none"?t=!1:(r=n.memoizedState,n.memoizedState=null,n=e.child,Pn=0,t=Yh(e,n,t,o,s,r,!0),Pn!==(r===null?0:r.length)&&(e.flags|=32)),(e.flags&4)!==0&&t?(zs(e,e.memoizedProps.onUpdate),oi=i):i!==null&&(i.push.apply(i,oi),oi=i),ai=(e.flags&32)!==0?!0:a;break;default:rs(t,e)}}function ii(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)kw(e,t.alternate,t),t=t.sibling}function cr(e,t){for(e=e.child;e!==null;){var n=e,a=t;switch(n.tag){case 0:case 11:case 14:case 15:Ir(4,n,n.return),cr(n,a);break;case 1:rn(n,n.return);var i=n.stateNode;typeof i.componentWillUnmount=="function"&&gw(n,n.return,i),cr(n,a);break;case 27:(a&2)!==0&&fk(n.stateNode,n.type,n.memoizedProps);case 5:rn(n,n.return),n.tag!==5&&n.tag!==27||$l(n),cr(n,a);break;case 6:$l(n);break;case 26:rn(n,n.return),i=n.stateNode,n.memoizedState!==null||i===null||Ke||i.parentNode.removeChild(i),cr(n,a);break;case 22:n.memoizedState===null&&cr(n,a);break;case 30:rn(n,n.return),cr(n,a);break;case 7:rn(n,n.return);default:cr(n,a)}e=e.sibling}}function Ua(e,t,n){for(n=(t.subtreeFlags&8772)!==0?n:n&-2,t=t.child;t!==null;){var a=t.alternate,i=e,r=t,o=r.flags,s=(n&1)!==0;switch(r.tag){case 0:case 11:case 15:Ua(i,r,n),Ed(4,r);break;case 1:if(Ua(i,r,n),a=r,i=a.stateNode,typeof i.componentDidMount=="function")try{i.componentDidMount()}catch(f){Ze(a,a.return,f)}if(a=r,i=a.updateQueue,i!==null){var l=a.stateNode;try{var d=i.shared.hiddenCallbacks;if(d!==null)for(i.shared.hiddenCallbacks=null,i=0;i<d.length;i++)Sx(d[i],l)}catch(f){Ze(a,a.return,f)}}s&&o&64&&mw(r),ri(r,r.return);break;case 27:(n&2)!==0&&bw(r);case 5:r.tag!==5&&r.tag!==27||B0(r),Ua(i,r,n),s&&a===null&&o&4&&Lg(r),ri(r,r.return);break;case 6:B0(r);break;case 26:l=r.stateNode,r.memoizedState!==null||l===null||$t||oh(md(l.ownerDocument),r.type,l),Ua(i,r,n),s&&a===null&&o&4&&Lg(r),ri(r,r.return);break;case 12:Ua(i,r,n);break;case 31:Ua(i,r,n),s&&o&4&&Ew(i,r);break;case 13:Ua(i,r,n),s&&o&4&&Cw(i,r);break;case 22:r.memoizedState===null&&Ua(i,r,n),ri(r,r.return);break;case 30:Ua(i,r,n),ri(r,r.return);break;case 7:ri(r,r.return);default:Ua(i,r,n)}t=t.sibling}}function Qh(e,t){var n=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==n&&(e!=null&&e.refCount++,n!=null&&Nd(n))}function Xh(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&Nd(e))}function ya(e,t,n,a){var i=(n&335544064)===n;if(t.subtreeFlags&(i?10262:10256))for(t=t.child;t!==null;)Ow(e,t,n,a),t=t.sibling;else i&&xw(t)}function Ow(e,t,n,a){var i=(n&335544064)===n;i&&t.alternate===null&&t.return!==null&&t.return.alternate!==null&&Eu(t);var r=t.flags;switch(t.tag){case 0:case 11:case 15:ya(e,t,n,a),r&2048&&Ed(9,t);break;case 1:ya(e,t,n,a);break;case 3:ya(e,t,n,a),i&&Ug&&(e=e.containerInfo,e=e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,e.style.viewTransitionName==="root"&&(e.style.viewTransitionName=""),e=e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName==="none"&&(e.style.viewTransitionName="")),r&2048&&(r=null,t.alternate!==null&&(r=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==r&&(t.refCount++,r!=null&&Nd(r)));break;case 12:if(r&2048){ya(e,t,n,a),r=t.stateNode;try{var o=t.memoizedProps,s=o.id,l=o.onPostCommit;typeof l=="function"&&l(s,t.alternate===null?"mount":"update",r.passiveEffectDuration,-0)}catch(d){Ze(t,t.return,d)}}else ya(e,t,n,a);break;case 31:ya(e,t,n,a);break;case 13:ya(e,t,n,a);break;case 23:break;case 22:o=t.stateNode,s=t.alternate,t.memoizedState!==null?(i&&s!==null&&s.memoizedState===null&&Eu(s),o._visibility&2?ya(e,t,n,a):Wl(e,t)):(i&&s!==null&&s.memoizedState!==null&&Eu(t),o._visibility&2?ya(e,t,n,a):(o._visibility|=2,ss(e,t,n,a,(t.subtreeFlags&10256)!==0||!1))),r&2048&&Qh(s,t);break;case 24:ya(e,t,n,a),r&2048&&Xh(t.alternate,t);break;case 30:i&&(r=t.alternate,r!==null&&(pi(r.child,!0),pi(t.child,!0))),ya(e,t,n,a);break;default:ya(e,t,n,a)}}function ss(e,t,n,a,i){for(i=i&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var r=e,o=t,s=n,l=a,d=o.flags;switch(o.tag){case 0:case 11:case 15:ss(r,o,s,l,i),Ed(8,o);break;case 23:break;case 22:var f=o.stateNode;o.memoizedState!==null?f._visibility&2?ss(r,o,s,l,i):Wl(r,o):(f._visibility|=2,ss(r,o,s,l,i)),i&&d&2048&&Qh(o.alternate,o);break;case 24:ss(r,o,s,l,i),i&&d&2048&&Xh(o.alternate,o);break;default:ss(r,o,s,l,i)}t=t.sibling}}function Wl(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var n=e,a=t,i=a.flags;switch(a.tag){case 22:Wl(n,a),i&2048&&Qh(a.alternate,a);break;case 24:Wl(n,a),i&2048&&Xh(a.alternate,a);break;default:Wl(n,a)}t=t.sibling}}var lo=8192;function ro(e,t,n){if(e.subtreeFlags&lo)for(e=e.child;e!==null;)_w(e,t,n),e=e.sibling}function _w(e,t,n){switch(e.tag){case 26:ro(e,t,n),e.flags&lo&&(e.memoizedState!==null?nC(n,Ba,e.memoizedState,e.memoizedProps):(e=e.stateNode,(t&335544128)===t&&b1(n,e)));break;case 5:ro(e,t,n),e.flags&lo&&(e=e.stateNode,(t&335544128)===t&&b1(n,e));break;case 3:case 4:var a=Ba;Ba=md(e.stateNode.containerInfo),ro(e,t,n),Ba=a;break;case 22:e.memoizedState===null&&(a=e.alternate,a!==null&&a.memoizedState!==null?(a=lo,lo=16777216,ro(e,t,n),lo=a):ro(e,t,n));break;case 30:if((e.flags&lo)!==0&&(a=e.memoizedProps.name,a!=null&&a!=="auto")){var i=e.stateNode;i.paired=null,ta===null&&(ta=new Map),ta.set(a,i)}ro(e,t,n);break;default:ro(e,t,n)}}function Iw(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function Ll(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var n=0;n<t.length;n++){var a=t[n];Wt=a,Lw(a,e)}Iw(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)Dw(e),e=e.sibling}function Dw(e){switch(e.tag){case 0:case 11:case 15:Ll(e),e.flags&2048&&Ir(9,e,e.return);break;case 3:Ll(e);break;case 12:Ll(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,Cu(e)):Ll(e);break;default:Ll(e)}}function Cu(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var n=0;n<t.length;n++){var a=t[n];Wt=a,Lw(a,e)}Iw(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:Ir(8,t,t.return),Cu(t);break;case 22:n=t.stateNode,n._visibility&2&&(n._visibility&=-3,Cu(t));break;default:Cu(t)}e=e.sibling}}function Lw(e,t){for(;Wt!==null;){var n=Wt;switch(n.tag){case 0:case 11:case 15:Ir(8,n,t);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var a=n.memoizedState.cachePool.pool;a!=null&&a.refCount++}break;case 24:Nd(n.memoizedState.cache)}if(a=n.child,a!==null)a.return=n,Wt=a;else e:for(n=e;Wt!==null;){a=Wt;var i=a.sibling,r=a.return;if(Nw(a),a===n){Wt=null;break e}if(i!==null){i.return=r,Wt=i;break e}Wt=r}}}var W6={getCacheForType:function(e){var t=sn(Lt),n=t.data.get(e);return n===void 0&&(n=e(),t.data.set(e,n)),n},cacheSignal:function(){return sn(Lt).controller.signal}},e3=typeof WeakMap=="function"?WeakMap:Map,Ue=0,it=null,Ae=null,_e=0,Qe=0,$n=null,br=!1,Qs=!1,Zh=!1,Vi=0,Mt=0,Dr=0,ho=0,tf=0,na=0,Ls=0,ed=null,qn=null,Gg=!1,Nf=0,zw=0,nf=1/0,af=null,Er=null,wt=0,Ga=null,No=null,fi=0,Fg=0,Kg=null,Hw=null,Ms=null,As=null,Rs=null,td=0,Mu=null;function oa(){return(Ue&2)!==0&&_e!==0?_e&-_e:pe.T!==null?$h():U1()}function qw(){if(na===0)if((_e&536870912)===0||Ne){var e=Zc;Zc<<=1,(Zc&3932160)===0&&(Zc=262144),na=e}else na=536870912;return e=un.current,e!==null&&(e.flags|=32),na}function zs(e,t){if(t!=null){var n=e.stateNode,a=n.ref;a===null&&(a=n.ref=rk(zi(e.memoizedProps,n))),As===null&&(As=[]),As.push(t.bind(null,a))}}function Un(e,t,n){(e===it&&(Qe===2||Qe===9)||e.cancelPendingCommit!==null)&&(Hs(e,0),vr(e,_e,na,!1)),wd(e,n),((Ue&2)===0||e!==it)&&(e===it&&((Ue&2)===0&&(ho|=n),Mt===4&&vr(e,_e,na,!1)),gi(e))}function Pw(e,t,n){if((Ue&6)!==0)throw Error(L(327));var a=!n&&(t&127)===0&&(t&e.expiredLanes)===0||xd(e,t),i=a?a3(e,t):Gm(e,t,!0),r=a;do{if(i===0){Qs&&!a&&vr(e,t,0,!1);break}else{if(n=e.current.alternate,r&&!t3(n)){i=Gm(e,t,!1),r=!1;continue}if(i===2){if(r=t,e.errorRecoveryDisabledLanes&r)var o=0;else o=e.pendingLanes&-536870913,o=o!==0?o:o&536870912?536870912:0;if(o!==0){t=o;e:{var s=e;i=ed;var l=s.current.memoizedState.isDehydrated;if(l&&(Hs(s,o).flags|=256),o=Gm(s,o,!1),o!==2&&o!==6){if(Zh&&!l){s.errorRecoveryDisabledLanes|=r,ho|=r,i=4;break e}r=qn,qn=i,r!==null&&(qn===null?qn=r:qn.push.apply(qn,r))}i=o}if(r=!1,i!==2)continue}}if(i===1){Hs(e,0),vr(e,t,0,!0);break}e:{switch(a=e,r=i,r){case 0:case 1:throw Error(L(345));case 4:if((t&4194048)!==t&&(t&62914560)!==t)break;case 6:vr(a,t,na,!br);break e;case 2:qn=null;break;case 3:case 5:break;default:throw Error(L(329))}if((t&62914560)===t&&(i=Nf+300-aa(),10<i)){if(vr(a,t,na,!br),cf(a,0,!0)!==0)break e;fi=t,a.timeoutHandle=eb(K0.bind(null,a,n,qn,af,Gg,t,na,ho,Ls,br,r,"Throttled",-0,0),i);break e}K0(a,n,qn,af,Gg,t,na,ho,Ls,br,r,null,-0,0)}}break}while(!0);gi(e)}function K0(e,t,n,a,i,r,o,s,l,d,f,v,g,h){e.timeoutHandle=-1;var w=t.subtreeFlags,x=(r&335544064)===r;if(v=null,(x||w&8192||(w&16785408)===16785408)&&(v={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:li},ta=null,_w(t,r,v),x&&(w=v,x=e.containerInfo,x=(x.nodeType===9?x:x.ownerDocument).__reactViewTransition,x!=null&&(w.count++,w.waitingForViewTransition=!0,w=gd.bind(w),x.finished.then(w,w))),w=(r&62914560)===r?Nf-aa():(r&4194048)===r?zw-aa():0,w=aC(v,w),w!==null)){fi=r,e.cancelPendingCommit=w(Q0.bind(null,e,t,r,n,a,i,o,s,l,d,f,v,null,g,h)),vr(e,r,o,!d);return}Q0(e,t,r,n,a,i,o,s,l,d,f,v)}function t3(e){for(var t=e;;){var n=t.tag;if((n===0||n===11||n===15)&&t.flags&16384&&(n=t.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var a=0;a<n.length;a++){var i=n[a],r=i.getSnapshot;i=i.value;try{if(!sa(r(),i))return!1}catch{return!1}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function vr(e,t,n,a){t=z1(e,t),t&=~tf,t&=~ho,e.suspendedLanes|=t,e.pingedLanes&=~t,a&&(e.warmLanes|=t),a=e.expirationTimes;for(var i=t;0<i;){var r=31-ra(i),o=1<<r;a[r]=-1,i&=~o}n!==0&&q1(e,n,t)}function Tf(){return(Ue&6)===0?(Cd(0,!1),!1):!0}function Jh(){if(Ae!==null){if(Qe===0)var e=Ae.return;else e=Ae,_i=Ao=null,Dh(e),Ts=null,ld=0,e=Ae;for(;e!==null;)pw(e.alternate,e),e=e.return;Ae=null}}function Hs(e,t){var n=e.timeoutHandle;return n!==-1&&(e.timeoutHandle=-1,S3(n)),n=e.cancelPendingCommit,n!==null&&(e.cancelPendingCommit=null,n()),fi=0,Jh(),it=e,Ae=n=Ii(e.current,null),_e=t,Qe=0,$n=null,br=!1,Qs=xd(e,t),Zh=!1,Ls=na=tf=ho=Dr=Mt=0,qn=ed=null,Gg=!1,Vi=z1(e,t),gf(),n}function Vw(e,t){we=null,pe.H=Xu,t===Ks||t===vf?(t=y0(),Qe=3):t===Eh?(t=y0(),Qe=4):Qe=t===Bh?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,$n=t,Ae===null&&(Mt=1,Zu(e,Na(t,e.current)))}function Uw(){var e=un.current;return e===null?!0:(_e&4194048)===_e?hn===null:(_e&62914560)===_e||(_e&536870912)!==0?e===hn:!1}function Bw(){var e=pe.H;return pe.H=Xu,e===null?Xu:e}function jw(){var e=pe.A;return pe.A=W6,e}function rf(){Mt=4,br||(_e&4194048)!==_e&&un.current!==null||(Qs=!0),(Dr&134217727)===0&&(ho&134217727)===0||it===null||vr(it,_e,na,!1)}function Gm(e,t,n){var a=Ue;Ue|=2;var i=Bw(),r=jw();(it!==e||_e!==t)&&(af=null,Hs(e,t)),t=!1;var o=Mt;e:do try{if(Qe!==0&&Ae!==null){var s=Ae,l=$n;switch(Qe){case 8:Jh(),o=6;break e;case 3:case 2:case 9:case 6:un.current===null&&(t=!0);var d=Qe;if(Qe=0,$n=null,xs(e,s,l,d),n&&Qs){o=0;break e}break;default:d=Qe,Qe=0,$n=null,xs(e,s,l,d)}}n3(),o=Mt;break}catch(f){Vw(e,f)}while(!0);return t&&e.shellSuspendCounter++,_i=Ao=null,Ue=a,pe.H=i,pe.A=r,Ae===null&&(it=null,_e=0,gf()),o}function n3(){for(;Ae!==null;)Gw(Ae)}function a3(e,t){var n=Ue;Ue|=2;var a=Bw(),i=jw();it!==e||_e!==t?(af=null,nf=aa()+500,Hs(e,t)):Qs=xd(e,t);e:do try{if(Qe!==0&&Ae!==null){t=Ae;var r=$n;t:switch(Qe){case 1:Qe=0,$n=null,xs(e,t,r,1);break;case 2:case 9:if(v0(r)){Qe=0,$n=null,Y0(t);break}t=function(){Qe!==2&&Qe!==9||it!==e||(Qe=7),gi(e)},r.then(t,t);break e;case 3:Qe=7;break e;case 4:Qe=5;break e;case 7:v0(r)?(Qe=0,$n=null,Y0(t)):(Qe=0,$n=null,xs(e,t,r,7));break;case 5:var o=null;switch(Ae.tag){case 26:o=Ae.memoizedState;case 5:case 27:var s=Ae;if(o?gk(o):s.stateNode.complete){Qe=0,$n=null;var l=s.sibling;if(l!==null)Ae=l;else{var d=s.return;d!==null?(Ae=d,Ef(d)):Ae=null}break t}}Qe=0,$n=null,xs(e,t,r,5);break;case 6:Qe=0,$n=null,xs(e,t,r,6);break;case 8:Jh(),Mt=6;break e;default:throw Error(L(462))}}i3();break}catch(f){Vw(e,f)}while(!0);return _i=Ao=null,pe.H=a,pe.A=i,Ue=n,Ae!==null?0:(it=null,_e=0,gf(),Mt)}function i3(){for(;Ae!==null&&!wE();)Gw(Ae)}function Gw(e){var t=fw(e.alternate,e,Vi);e.memoizedProps=e.pendingProps,t===null?Ef(e):Ae=t}function Y0(e){var t=e,n=t.alternate;switch(t.tag){case 15:case 0:t=L0(n,t,t.pendingProps,t.type,void 0,_e);break;case 11:t=L0(n,t,t.pendingProps,t.type.render,t.ref,_e);break;case 5:Dh(t);var a=t;a===tn&&(Ne?(Bu(a),a.tag===5&&a.stateNode!=null&&(dt=a.stateNode)):(Bu(a),Ne=!0));default:pw(n,t),t=Ae=mx(t,Vi),t=fw(n,t,Vi)}e.memoizedProps=e.pendingProps,t===null?Ef(e):Ae=t}function xs(e,t,n,a){_i=Ao=null,Dh(t),Ts=null,ld=0;var i=t.return;try{if(F6(e,i,t,n,_e)){Mt=1,Zu(e,Na(n,e.current)),Ae=null;return}}catch(r){if(i!==null)throw Ae=i,r;Mt=1,Zu(e,Na(n,e.current)),Ae=null;return}t.flags&32768?(Ne||a===1?e=!0:Qs||(_e&536870912)!==0?e=!1:(br=e=!0,(a===2||a===9||a===3||a===6)&&(a=un.current,a!==null&&a.tag===13&&(a.flags|=16384))),Fw(t,e)):Ef(t)}function Ef(e){var t=e;do{if((t.flags&32768)!==0){Fw(t,br);return}e=t.return;var n=X6(t.alternate,t,Vi);if(n!==null){Ae=n;return}if(t=t.sibling,t!==null){Ae=t;return}Ae=t=e}while(t!==null);Mt===0&&(Mt=5)}function Fw(e,t){do{var n=Z6(e.alternate,e);if(n!==null){n.flags&=32767,Ae=n;return}if(n=e.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!t&&(e=e.sibling,e!==null)){Ae=e;return}Ae=e=n}while(e!==null);Mt=6,Ae=null}function Q0(e,t,n,a,i,r,o,s,l,d,f,v){e.cancelPendingCommit=null;do Cf();while(wt!==0);if((Ue&6)!==0)throw Error(L(327));if(t!==null){if(t===e.current)throw Error(L(177));e===it&&(Ae=it=null,_e=0),No=t,Ga=e,fi=n,Kg=i,Hw=a,r3(e,t,n,o,s,l,v)}}function r3(e,t,n,a,i,r,o){var s=t.lanes|t.childLanes;if(Fg=s,s|=xh,OE(e,n,s,a,i,r),As=null,(n&335544064)===n?(Rs=I6(e),a=10262):(Rs=null,a=10256),(t.subtreeFlags&a)!==0||(t.flags&a)!==0?(e.callbackNode=null,e.callbackPriority=0,u3(Hu,function(){return Zg(),null})):(e.callbackNode=null,e.callbackPriority=0),Wu=!1,a=(t.flags&13878)!==0,(t.subtreeFlags&13878)!==0||a){a=pe.T,pe.T=null,i=Be.p,Be.p=2,r=Ue,Ue|=4;try{J6(e,t,n)}finally{Ue=r,Be.p=i,pe.T=a}}wt=1,Wu?Ms=A3(o,e.containerInfo,Rs,Yg,Qg,s3,Xg,Zg,o3,null,null):(Yg(),Qg(),Xg())}function o3(e){if(wt!==0){var t=Ga.onRecoverableError;t(e,{componentStack:null})}}function s3(){wt===3&&(wt=0,Rw(No,Ga),wt=4)}function Yg(){if(wt===1){wt=0;var e=Ga,t=No,n=fi,a=(t.flags&13878)!==0;if((t.subtreeFlags&13878)!==0||a){a=pe.T,pe.T=null;var i=Be.p;Be.p=2;var r=Ue;Ue|=4;try{Bl=ef=!1,Mw(t,e,n),n=eh;var o=ox(e.containerInfo),s=n.focusedElem,l=n.selectionRange;if(o!==s&&s&&s.ownerDocument&&rx(s.ownerDocument.documentElement,s)){if(l!==null&&yh(s)){var d=l.start,f=l.end;if(f===void 0&&(f=d),"selectionStart"in s)s.selectionStart=d,s.selectionEnd=Math.min(f,s.value.length);else{var v=s.ownerDocument||document,g=v&&v.defaultView||window;if(g.getSelection){var h=g.getSelection(),w=s.textContent.length,x=Math.min(l.start,w),A=l.end===void 0?x:Math.min(l.end,w);!h.extend&&x>A&&(o=A,A=x,x=o);var p=c0(s,x),m=c0(s,A);if(p&&m&&(h.rangeCount!==1||h.anchorNode!==p.node||h.anchorOffset!==p.offset||h.focusNode!==m.node||h.focusOffset!==m.offset)){var b=v.createRange();b.setStart(p.node,p.offset),h.removeAllRanges(),x>A?(h.addRange(b),h.extend(m.node,m.offset)):(b.setEnd(m.node,m.offset),h.addRange(b))}}}}for(v=[],h=s;h=h.parentNode;)h.nodeType===1&&v.push({element:h,left:h.scrollLeft,top:h.scrollTop});for(typeof s.focus=="function"&&s.focus(),s=0;s<v.length;s++){var y=v[s];y.element.scrollLeft=y.left,y.element.scrollTop=y.top}}Bs=!!Wg,eh=Wg=null}finally{Ue=r,Be.p=i,pe.T=a}}e.current=t,wt=2}}function Qg(){if(wt===2){wt=0;var e=Ga,t=No,n=(t.flags&8772)!==0;if((t.subtreeFlags&8772)!==0||n){n=pe.T,pe.T=null;var a=Be.p;Be.p=2;var i=Ue;Ue|=4;try{kw(e,t.alternate,t)}finally{Ue=i,Be.p=a,pe.T=n}}wt=3}}function Xg(){if(wt===4||wt===3){wt=0;var e=Ms;Ms=null,kE();var t=Ga,n=No,a=fi,i=Hw,r=(a&335544064)===a?10262:10256;if((n.subtreeFlags&r)!==0||(n.flags&r)!==0?wt=5:(wt=0,No=Ga=null,Kw(t,t.pendingLanes)),r=t.pendingLanes,r===0&&(Er=null),ph(a),n=n.stateNode,ia&&typeof ia.onCommitFiberRoot=="function")try{ia.onCommitFiberRoot(yd,n,void 0,(n.current.flags&128)===128)}catch{}if(i!==null){n=pe.T,r=Be.p,Be.p=2,pe.T=null;try{for(var o=t.onRecoverableError,s=0;s<i.length;s++){var l=i[s];o(l.value,{componentStack:l.stack})}}finally{pe.T=n,Be.p=r}}if(i=As,o=Rs,Rs=null,i!==null&&(As=null,o===null&&(o=[]),e!==null))for(l=0;l<i.length;l++)n=(0,i[l])(o),n!==void 0&&e.finished.finally(n);(fi&3)!==0&&Cf(),gi(t),r=t.pendingLanes,(a&261930)!==0&&(r&42)!==0?t===Mu?td++:(td=0,Mu=t):(td=0,Mu=null),Cd(0,!1)}}function Kw(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,Nd(t)))}function Cf(){return Ms!==null&&(Ms.skipTransition(),Ms=null),Yg(),Qg(),Xg(),Zg()}function Zg(){if(wt!==5)return!1;var e=Ga,t=Fg;Fg=0;var n=ph(fi),a=pe.T,i=Be.p;try{Be.p=32>n?32:n,pe.T=null,n=Kg,Kg=null;var r=Ga,o=fi;if(wt=0,No=Ga=null,fi=0,(Ue&6)!==0)throw Error(L(331));var s=Ue;if(Ue|=4,Dw(r.current),Ow(r,r.current,o,n),Ue=s,Cd(0,!1),ia&&typeof ia.onPostCommitFiberRoot=="function")try{ia.onPostCommitFiberRoot(yd,r)}catch{}return!0}finally{Be.p=i,pe.T=a,Kw(e,t)}}function X0(e,t,n){t=Na(n,t),t=Ag(e.stateNode,t,2),e=Sr(e,t,2),e!==null&&(wd(e,2),gi(e))}function Ze(e,t,n){if(e.tag===3)X0(e,e,n);else for(;t!==null;){if(t.tag===3){X0(t,e,n);break}else if(t.tag===1){var a=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof a.componentDidCatch=="function"&&(Er===null||!Er.has(a))){e=Na(n,e),n=sw(2),a=Sr(t,n,2),a!==null&&(lw(n,a,t,e),wd(a,2),gi(a));break}}t=t.return}}function Fm(e,t,n){var a=e.pingCache;if(a===null){a=e.pingCache=new e3;var i=new Set;a.set(t,i)}else i=a.get(t),i===void 0&&(i=new Set,a.set(t,i));i.has(n)||(Zh=!0,i.add(n),e=l3.bind(null,e,t,n),t.then(e,e))}function l3(e,t,n){var a=e.pingCache;a!==null&&a.delete(t),e.pingedLanes|=e.suspendedLanes&n,e.warmLanes&=~n,it===e&&(_e&n)===n&&((Mt===4||Mt===3&&(_e&62914560)===_e&&300>aa()-Nf)&&(Ue&2)===0?Hs(e,0):tf|=n,Ls===_e&&(Ls=0)),gi(e)}function Yw(e,t){t===0&&(t=H1()),e=Mo(e,t),e!==null&&(wd(e,t),gi(e))}function d3(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),Yw(e,n)}function c3(e,t){var n=0;switch(e.tag){case 31:case 13:var a=e.stateNode,i=e.memoizedState;i!==null&&(n=i.retryLane);break;case 19:a=e.stateNode;break;case 22:a=e.stateNode._retryCache;break;default:throw Error(L(314))}a!==null&&a.delete(t),Yw(e,n)}function u3(e,t){return uh(e,t)}var qs=null,ls=null,Jg=!1,of=!1,Km=!1,yr=0;function gi(e){e!==ls&&e.next===null&&(ls===null?qs=ls=e:ls=ls.next=e),of=!0,Jg||(Jg=!0,p3())}function Cd(e,t){if(!Km&&of){Km=!0;do for(var n=!1,a=qs;a!==null;){if(!t)if(e!==0){var i=a.pendingLanes;if(i===0)var r=0;else{var o=a.suspendedLanes,s=a.pingedLanes;r=(1<<31-ra(42|e)+1)-1,r&=i&~(o&~s),r=r&201326741?r&201326741|1:r?r|2:0}r!==0&&(n=!0,Z0(a,r))}else r=_e,r=cf(a,a===it?r:0,a.cancelPendingCommit!==null||a.timeoutHandle!==-1),(r&3)===0||xd(a,r)||(n=!0,Z0(a,r));a=a.next}while(n);Km=!1}}function f3(){Qw()}function Qw(){of=Jg=!1;var e=0;yr!==0&&k3()&&(e=yr);for(var t=aa(),n=null,a=qs;a!==null;){var i=a.next,r=Xw(a,t);r===0?(a.next=null,n===null?qs=i:n.next=i,i===null&&(ls=n)):(n=a,(e!==0||(r&3)!==0)&&(of=!0)),a=i}wt!==0&&wt!==5||Cd(e,!1),yr!==0&&(yr=0)}function Xw(e,t){for(var n=e.suspendedLanes,a=e.pingedLanes,i=e.expirationTimes,r=e.pendingLanes&-62914561;0<r;){var o=31-ra(r),s=1<<o,l=i[o];l===-1?((s&n)===0||(s&a)!==0)&&(i[o]=RE(s,t)):l<=t&&(e.expiredLanes|=s),r&=~s}if(t=it,n=_e,n=cf(e,e===t?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),a=e.callbackNode,n===0||e===t&&(Qe===2||Qe===9)||e.cancelPendingCommit!==null)return a!==null&&a!==null&&Nm(a),e.callbackNode=null,e.callbackPriority=0;if((n&3)===0||xd(e,n)){if(t=n&-n,t===e.callbackPriority)return t;switch(a!==null&&Nm(a),ph(n)){case 2:case 8:n=D1;break;case 32:n=Hu;break;case 268435456:n=L1;break;default:n=Hu}return a=Zw.bind(null,e),n=uh(n,a),e.callbackPriority=t,e.callbackNode=n,t}return a!==null&&a!==null&&Nm(a),e.callbackPriority=2,e.callbackNode=null,2}function Zw(e,t){if(wt!==0&&wt!==5)return e.callbackNode=null,e.callbackPriority=0,null;var n=e.callbackNode;if(Cf()&&e.callbackNode!==n)return null;var a=_e;return a=cf(e,e===it?a:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),a===0?null:(Pw(e,a,t),Xw(e,aa()),e.callbackNode!=null&&e.callbackNode===n?Zw.bind(null,e):null)}function Z0(e,t){if(Cf())return null;Pw(e,t,!0)}function p3(){N3(function(){(Ue&6)!==0?uh(I1,f3):Qw()})}function $h(){if(yr===0){var e=xo;e===0&&(e=Xc,Xc<<=1,(Xc&261888)===0&&(Xc=256)),yr=e}return yr}function J0(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:hu(e)}function m3(e,t,n,a,i){if(t==="submit"&&n&&n.stateNode===i){var r=J0((i[jn]||null).action),o=a.submitter;o&&(t=(t=o[jn]||null)?J0(t.formAction):o.getAttribute("formAction"),t!==null&&(r=t,o=null));var s=new ff("action","action",null,a,i);e.push({event:s,listeners:[{instance:null,listener:function(){if(a.defaultPrevented){if(yr!==0){var l=new FormData(i,o);Cg(n,{pending:!0,data:l,method:i.method,action:r},null,l)}}else typeof r=="function"&&(s.preventDefault(),l=new FormData(i,o),Cg(n,{pending:!0,data:l,method:i.method,action:r},r,l))},currentTarget:i}]})}}for(cu=0;cu<hg.length;cu++)uu=hg[cu],$0=uu.toLowerCase(),W0=uu[0].toUpperCase()+uu.slice(1),Fa($0,"on"+W0);var uu,$0,W0,cu;Fa(lx,"onAnimationEnd");Fa(dx,"onAnimationIteration");Fa(cx,"onAnimationStart");Fa("dblclick","onDoubleClick");Fa("focusin","onFocus");Fa("focusout","onBlur");Fa(T6,"onTransitionRun");Fa(E6,"onTransitionStart");Fa(C6,"onTransitionCancel");Fa(ux,"onTransitionEnd");_s("onMouseEnter",["mouseout","mouseover"]);_s("onMouseLeave",["mouseout","mouseover"]);_s("onPointerEnter",["pointerout","pointerover"]);_s("onPointerLeave",["pointerout","pointerover"]);Eo("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Eo("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Eo("onBeforeInput",["compositionend","keypress","textInput","paste"]);Eo("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Eo("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Eo("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var ud="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),g3=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(ud));function Jw(e,t){t=(t&4)!==0;for(var n=0;n<e.length;n++){var a=e[n],i=a.event;a=a.listeners;e:{var r=void 0;if(t)for(var o=a.length-1;0<=o;o--){var s=a[o],l=s.instance,d=s.currentTarget;if(s=s.listener,l!==r&&i.isPropagationStopped())break e;r=s,i.currentTarget=d;try{r(i)}catch(f){Pu(f)}i.currentTarget=null,r=l}else for(o=0;o<a.length;o++){if(s=a[o],l=s.instance,d=s.currentTarget,s=s.listener,l!==r&&i.isPropagationStopped())break e;r=s,i.currentTarget=d;try{r(i)}catch(f){Pu(f)}i.currentTarget=null,r=l}}}}function Me(e,t){var n=t[Yy];n===void 0&&(n=t[Yy]=new Set);var a=e+"__bubble";n.has(a)||($w(t,e,2,!1),n.add(a))}function Ym(e,t,n){var a=0;t&&(a|=4),$w(n,e,a,t)}var fu="_reactListening"+Math.random().toString(36).slice(2);function Wh(e){if(!e[fu]){e[fu]=!0,j1.forEach(function(n){n!=="selectionchange"&&(g3.has(n)||Ym(n,!1,e),Ym(n,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[fu]||(t[fu]=!0,Ym("selectionchange",!1,t))}}function $w(e,t,n,a){switch(kk(t)){case 2:var i=sC;break;case 8:i=lC;break;default:i=ob}n=i.bind(null,t,n,e),i=void 0,!fg||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(i=!0),a?i!==void 0?e.addEventListener(t,n,{capture:!0,passive:i}):e.addEventListener(t,n,!0):i!==void 0?e.addEventListener(t,n,{passive:i}):e.addEventListener(t,n,!1)}function Qm(e,t,n,a,i){var r=a;if((t&1)===0&&(t&2)===0&&a!==null)e:for(;;){if(a===null)return;var o=a.tag;if(o===3||o===4){var s=a.stateNode.containerInfo;if(s===i)break;if(o===4)for(o=a.return;o!==null;){var l=o.tag;if((l===3||l===4)&&o.stateNode.containerInfo===i)return;o=o.return}for(;s!==null;){if(o=co(s),o===null)return;if(l=o.tag,l===5||l===6||l===26||l===27){a=r=o;continue e}s=s.parentNode}}a=a.return}J1(function(){var d=r,f=gh(n),v=[];e:{var g=fx.get(e);if(g!==void 0){var h=ff,w=e;switch(e){case"keypress":if(vu(n)===0)break e;case"keydown":case"keyup":h=t6;break;case"focusin":w="focus",h=Rm;break;case"focusout":w="blur",h=Rm;break;case"beforeblur":case"afterblur":h=Rm;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":h=t0;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":h=jE;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":h=o6;break;case lx:case dx:case cx:h=KE;break;case ux:h=l6;break;case"scroll":case"scrollend":h=UE;break;case"wheel":h=c6;break;case"copy":case"cut":case"paste":h=QE;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":h=a0;break;case"submit":h=i6;break;case"toggle":case"beforetoggle":h=f6}var x=(t&4)!==0,A=!x&&(e==="scroll"||e==="scrollend"),p=x?g!==null?g+"Capture":null:g;x=[];for(var m=d,b;m!==null;){var y=m;if(b=y.stateNode,y=y.tag,y!==5&&y!==26&&y!==27||b===null||p===null||(y=ad(m,p),y!=null&&x.push(fd(m,y,b))),A)break;m=m.return}0<x.length&&(g=new h(g,w,null,n,f),v.push({event:g,listeners:x}))}}if((t&7)===0){e:{if(h=e==="mouseover"||e==="pointerover",g=e==="mouseout"||e==="pointerout",h&&n!==ug&&(w=n.relatedTarget||n.fromElement)&&(co(w)||w[Gs]))break e;(g||h)&&(w=f.window===f?f:(h=f.ownerDocument)?h.defaultView||h.parentWindow:window,g?(h=n.relatedTarget||n.toElement,g=d,h=h?co(h):null,h!==null&&(A=vd(h),x=h.tag,h!==A||x!==5&&x!==27&&x!==6)&&(h=null)):(g=null,h=d),g!==h&&(x=t0,y="onMouseLeave",p="onMouseEnter",m="mouse",(e==="pointerout"||e==="pointerover")&&(x=a0,y="onPointerLeave",p="onPointerEnter",m="pointer"),A=g==null?w:Vl(g),b=h==null?w:Vl(h),w=new x(y,m+"leave",g,n,f),w.target=A,w.relatedTarget=b,y=null,co(f)===d&&(x=new x(p,m+"enter",h,n,f),x.target=b,x.relatedTarget=A,y=x),A=y,x=g&&h?Wm(g,h,h3):null,g!==null&&e1(v,w,g,x,!1),h!==null&&A!==null&&e1(v,A,h,x,!0)))}e:{if(g=d?Vl(d):window,h=g.nodeName&&g.nodeName.toLowerCase(),h==="select"||h==="input"&&g.type==="file")var N=s0;else if(o0(g))if(ax)N=k6;else{N=x6;var D=y6}else h=g.nodeName,!h||h.toLowerCase()!=="input"||g.type!=="checkbox"&&g.type!=="radio"?d&&mh(d.elementType)&&(N=s0):N=w6;if(N&&(N=N(e,d))){nx(v,N,n,f);break e}D&&D(e,g,d)}switch(D=d?Vl(d):window,e){case"focusin":(o0(D)||D.contentEditable==="true")&&(ms=D,mg=d,Fl=null);break;case"focusout":Fl=mg=ms=null;break;case"mousedown":gg=!0;break;case"contextmenu":case"mouseup":case"dragend":gg=!1,u0(v,n,f);break;case"selectionchange":if(N6)break;case"keydown":case"keyup":u0(v,n,f)}var O;if(vh)e:{switch(e){case"compositionstart":var T="onCompositionStart";break e;case"compositionend":T="onCompositionEnd";break e;case"compositionupdate":T="onCompositionUpdate";break e}T=void 0}else ps?ex(e,n)&&(T="onCompositionEnd"):e==="keydown"&&n.keyCode===229&&(T="onCompositionStart");T&&(W1&&n.locale!=="ko"&&(ps||T!=="onCompositionStart"?T==="onCompositionEnd"&&ps&&(O=$1()):(gr=f,hh="value"in gr?gr.value:gr.textContent,ps=!0)),D=sf(d,T),0<D.length&&(T=new n0(T,e,null,n,f),v.push({event:T,listeners:D}),O?T.data=O:(O=tx(n),O!==null&&(T.data=O)))),(O=m6?g6(e,n):h6(e,n))&&(T=sf(d,"onBeforeInput"),0<T.length&&(D=new n0("onBeforeInput","beforeinput",null,n,f),v.push({event:D,listeners:T}),D.data=O)),m3(v,e,d,n,f)}Jw(v,t)})}function fd(e,t,n){return{instance:e,listener:t,currentTarget:n}}function sf(e,t){for(var n=t+"Capture",a=[];e!==null;){var i=e,r=i.stateNode;if(i=i.tag,i!==5&&i!==26&&i!==27||r===null||(i=ad(e,n),i!=null&&a.unshift(fd(e,i,r)),i=ad(e,t),i!=null&&a.push(fd(e,i,r))),e.tag===3)return a;e=e.return}return[]}function h3(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function e1(e,t,n,a,i){for(var r=t._reactName,o=[];n!==null&&n!==a;){var s=n,l=s.alternate,d=s.stateNode;if(s=s.tag,l!==null&&l===a)break;s!==5&&s!==26&&s!==27||d===null||(l=d,i?(d=ad(n,r),d!=null&&o.unshift(fd(n,d,l))):i||(d=ad(n,r),d!=null&&o.push(fd(n,d,l)))),n=n.return}o.length!==0&&e.push({event:t,listeners:o})}var b3=/\r\n?/g,v3=/\u0000|\uFFFD/g;function t1(e){return(typeof e=="string"?e:""+e).replace(b3,`
`).replace(v3,"")}function Ww(e,t){return t=t1(t),t1(e)===t}function Xe(e,t,n,a,i,r){switch(n){case"children":if(typeof a=="string")t==="body"||t==="textarea"&&a===""||Is(e,a);else if(typeof a=="number"||typeof a=="bigint")t!=="body"&&Is(e,""+a);else return;break;case"className":$c(e,"class",a);break;case"tabIndex":$c(e,"tabindex",a);break;case"dir":case"role":case"viewBox":case"width":case"height":$c(e,n,a);break;case"style":Z1(e,a,r);return;case"data":if(t!=="object"){$c(e,"data",a);break}case"src":case"href":if(a===""&&(t!=="a"||n!=="href")){e.removeAttribute(n);break}if(a==null||typeof a=="function"||typeof a=="symbol"||typeof a=="boolean"){e.removeAttribute(n);break}a=hu(a),e.setAttribute(n,a);break;case"action":case"formAction":if(typeof a=="function"){e.setAttribute(n,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof r=="function"&&(n==="formAction"?(t!=="input"&&Xe(e,t,"name",i.name,i,null),Xe(e,t,"formEncType",i.formEncType,i,null),Xe(e,t,"formMethod",i.formMethod,i,null),Xe(e,t,"formTarget",i.formTarget,i,null)):(Xe(e,t,"encType",i.encType,i,null),Xe(e,t,"method",i.method,i,null),Xe(e,t,"target",i.target,i,null)));if(a==null||typeof a=="symbol"||typeof a=="boolean"){e.removeAttribute(n);break}a=hu(a),e.setAttribute(n,a);break;case"onClick":a!=null&&(e.onclick=li);return;case"onScroll":a!=null&&Me("scroll",e);return;case"onScrollEnd":a!=null&&Me("scrollend",e);return;case"dangerouslySetInnerHTML":if(a!=null){if(typeof a!="object"||!("__html"in a))throw Error(L(61));if(n=a.__html,n!=null){if(i.children!=null)throw Error(L(60));r?.__html!==n&&(e.innerHTML=n)}}break;case"multiple":e.multiple=a&&typeof a!="function"&&typeof a!="symbol";break;case"muted":e.muted=a&&typeof a!="function"&&typeof a!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(a==null||typeof a=="function"||typeof a=="boolean"||typeof a=="symbol"){e.removeAttribute("xlink:href");break}n=hu(a),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",n);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":a!=null&&typeof a!="function"&&typeof a!="symbol"?e.setAttribute(n,a):e.removeAttribute(n);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"credentialless":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":a&&typeof a!="function"&&typeof a!="symbol"?e.setAttribute(n,""):e.removeAttribute(n);break;case"capture":case"download":a===!0?e.setAttribute(n,""):a!==!1&&a!=null&&typeof a!="function"&&typeof a!="symbol"?e.setAttribute(n,a):e.removeAttribute(n);break;case"cols":case"rows":case"size":case"span":a!=null&&typeof a!="function"&&typeof a!="symbol"&&!isNaN(a)&&1<=a?e.setAttribute(n,a):e.removeAttribute(n);break;case"rowSpan":case"start":a==null||typeof a=="function"||typeof a=="symbol"||isNaN(a)?e.removeAttribute(n):e.setAttribute(n,a);break;case"popover":Me("beforetoggle",e),Me("toggle",e),gu(e,"popover",a);break;case"xlinkActuate":Ai(e,"http://www.w3.org/1999/xlink","xlink:actuate",a);break;case"xlinkArcrole":Ai(e,"http://www.w3.org/1999/xlink","xlink:arcrole",a);break;case"xlinkRole":Ai(e,"http://www.w3.org/1999/xlink","xlink:role",a);break;case"xlinkShow":Ai(e,"http://www.w3.org/1999/xlink","xlink:show",a);break;case"xlinkTitle":Ai(e,"http://www.w3.org/1999/xlink","xlink:title",a);break;case"xlinkType":Ai(e,"http://www.w3.org/1999/xlink","xlink:type",a);break;case"xmlBase":Ai(e,"http://www.w3.org/XML/1998/namespace","xml:base",a);break;case"xmlLang":Ai(e,"http://www.w3.org/XML/1998/namespace","xml:lang",a);break;case"xmlSpace":Ai(e,"http://www.w3.org/XML/1998/namespace","xml:space",a);break;case"is":gu(e,"is",a);break;case"innerText":case"textContent":return;default:if(!(2<n.length)||n[0]!=="o"&&n[0]!=="O"||n[1]!=="n"&&n[1]!=="N")n=PE.get(n)||n,gu(e,n,a);else return}Ve=!0}function $g(e,t,n,a,i,r){switch(n){case"style":Z1(e,a,r);return;case"dangerouslySetInnerHTML":if(a!=null){if(typeof a!="object"||!("__html"in a))throw Error(L(61));if(n=a.__html,n!=null){if(i.children!=null)throw Error(L(60));r?.__html!==n&&(e.innerHTML=n)}}break;case"children":if(typeof a=="string")Is(e,a);else if(typeof a=="number"||typeof a=="bigint")Is(e,""+a);else return;break;case"onScroll":a!=null&&Me("scroll",e);return;case"onScrollEnd":a!=null&&Me("scrollend",e);return;case"onClick":a!=null&&(e.onclick=li);return;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":return;case"innerText":case"textContent":return;default:if(!G1.hasOwnProperty(n))e:{if(n[0]==="o"&&n[1]==="n"&&(i=n.endsWith("Capture"),r=n.slice(2,i?n.length-7:void 0),t=e[jn]||null,t=t!=null?t[n]:null,typeof t=="function"&&e.removeEventListener(r,t,i),typeof a=="function")){typeof t!="function"&&t!==null&&(n in e?e[n]=null:e.hasAttribute(n)&&e.removeAttribute(n)),e.addEventListener(r,a,i);break e}Ve=!0,n in e?e[n]=a:a===!0?e.setAttribute(n,""):gu(e,n,a)}return}Ve=!0}function cn(e,t,n){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":Me("error",e),Me("load",e);var a=!1,i=!1,r;for(r in n)if(n.hasOwnProperty(r)){var o=n[r];if(o!=null)switch(r){case"src":a=!0;break;case"srcSet":i=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(L(137,t));default:Xe(e,t,r,o,n,null)}}i&&Xe(e,t,"srcSet",n.srcSet,n,null),a&&Xe(e,t,"src",n.src,n,null);return;case"input":Me("invalid",e);var s=r=o=i=null,l=null,d=null;for(a in n)if(n.hasOwnProperty(a)){var f=n[a];if(f!=null)switch(a){case"name":i=f;break;case"type":o=f;break;case"checked":l=f;break;case"defaultChecked":d=f;break;case"value":r=f;break;case"defaultValue":s=f;break;case"children":case"dangerouslySetInnerHTML":if(f!=null)throw Error(L(137,t));break;default:Xe(e,t,a,f,n,null)}}Y1(e,r,s,l,d,o,i,!1);return;case"select":Me("invalid",e),a=o=r=null;for(i in n)if(n.hasOwnProperty(i)&&(s=n[i],s!=null))switch(i){case"value":r=s;break;case"defaultValue":o=s;break;case"multiple":a=s;default:Xe(e,t,i,s,n,null)}t=r,n=o,e.multiple=!!a,t!=null?ks(e,!!a,t,!1):n!=null&&ks(e,!!a,n,!0);return;case"textarea":Me("invalid",e),r=i=a=null;for(o in n)if(n.hasOwnProperty(o)&&(s=n[o],s!=null))switch(o){case"value":a=s;break;case"defaultValue":i=s;break;case"children":r=s;break;case"dangerouslySetInnerHTML":if(s!=null)throw Error(L(91));break;default:Xe(e,t,o,s,n,null)}X1(e,a,i,r);return;case"option":for(l in n)n.hasOwnProperty(l)&&(a=n[l],a!=null)&&(l==="selected"?e.selected=a&&typeof a!="function"&&typeof a!="symbol":Xe(e,t,l,a,n,null));return;case"dialog":Me("beforetoggle",e),Me("toggle",e),Me("cancel",e),Me("close",e);break;case"iframe":case"object":Me("load",e);break;case"video":case"audio":for(a=0;a<ud.length;a++)Me(ud[a],e);break;case"image":Me("error",e),Me("load",e);break;case"details":Me("toggle",e);break;case"embed":case"source":case"link":Me("error",e),Me("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(d in n)if(n.hasOwnProperty(d)&&(a=n[d],a!=null))switch(d){case"children":case"dangerouslySetInnerHTML":throw Error(L(137,t));default:Xe(e,t,d,a,n,null)}return;default:if(mh(t)){for(f in n)n.hasOwnProperty(f)&&(a=n[f],a!==void 0&&$g(e,t,f,a,n,void 0));return}}for(s in n)n.hasOwnProperty(s)&&(a=n[s],a!=null&&Xe(e,t,s,a,n,null))}var y3={};function x3(e,t,n,a){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var i=null,r=null,o=null,s=null,l=null,d=null,f=null;for(h in n){var v=n[h];if(n.hasOwnProperty(h)&&v!=null)switch(h){case"checked":break;case"value":break;case"defaultValue":l=v;default:a.hasOwnProperty(h)||Xe(e,t,h,null,a,v)}}for(var g in a){var h=a[g];if(v=n[g],a.hasOwnProperty(g)&&(h!=null||v!=null))switch(g){case"type":h!==v&&(Ve=!0),r=h;break;case"name":h!==v&&(Ve=!0),i=h;break;case"checked":h!==v&&(Ve=!0),d=h;break;case"defaultChecked":h!==v&&(Ve=!0),f=h;break;case"value":h!==v&&(Ve=!0),o=h;break;case"defaultValue":h!==v&&(Ve=!0),s=h;break;case"children":case"dangerouslySetInnerHTML":if(h!=null)throw Error(L(137,t));break;default:h!==v&&Xe(e,t,g,h,a,v)}}cg(e,o,s,l,d,f,r,i);return;case"select":h=o=s=g=null;for(r in n)if(l=n[r],n.hasOwnProperty(r)&&l!=null)switch(r){case"value":break;case"multiple":h=l;default:a.hasOwnProperty(r)||Xe(e,t,r,null,a,l)}for(i in a)if(r=a[i],l=n[i],a.hasOwnProperty(i)&&(r!=null||l!=null))switch(i){case"value":r!==l&&(Ve=!0),g=r;break;case"defaultValue":r!==l&&(Ve=!0),s=r;break;case"multiple":r!==l&&(Ve=!0),o=r;default:r!==l&&Xe(e,t,i,r,a,l)}t=s,n=o,a=h,g!=null?ks(e,!!n,g,!1):!!a!=!!n&&(t!=null?ks(e,!!n,t,!0):ks(e,!!n,n?[]:"",!1));return;case"textarea":h=g=null;for(s in n)if(i=n[s],n.hasOwnProperty(s)&&i!=null&&!a.hasOwnProperty(s))switch(s){case"value":break;case"children":break;default:Xe(e,t,s,null,a,i)}for(o in a)if(i=a[o],r=n[o],a.hasOwnProperty(o)&&(i!=null||r!=null))switch(o){case"value":i!==r&&(Ve=!0),g=i;break;case"defaultValue":i!==r&&(Ve=!0),h=i;break;case"children":break;case"dangerouslySetInnerHTML":if(i!=null)throw Error(L(91));break;default:i!==r&&Xe(e,t,o,i,a,r)}Q1(e,g,h);return;case"option":for(var w in n)g=n[w],n.hasOwnProperty(w)&&g!=null&&!a.hasOwnProperty(w)&&(w==="selected"?e.selected=!1:Xe(e,t,w,null,a,g));for(l in a)g=a[l],h=n[l],a.hasOwnProperty(l)&&g!==h&&(g!=null||h!=null)&&(l==="selected"?(g!==h&&(Ve=!0),e.selected=g&&typeof g!="function"&&typeof g!="symbol"):Xe(e,t,l,g,a,h));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var x in n)g=n[x],n.hasOwnProperty(x)&&g!=null&&!a.hasOwnProperty(x)&&Xe(e,t,x,null,a,g);for(d in a)if(g=a[d],h=n[d],a.hasOwnProperty(d)&&g!==h&&(g!=null||h!=null))switch(d){case"children":case"dangerouslySetInnerHTML":if(g!=null)throw Error(L(137,t));break;default:Xe(e,t,d,g,a,h)}return;default:if(mh(t)){for(var A in n)g=n[A],n.hasOwnProperty(A)&&g!==void 0&&!a.hasOwnProperty(A)&&$g(e,t,A,void 0,a,g);for(f in a)g=a[f],h=n[f],!a.hasOwnProperty(f)||g===h||g===void 0&&h===void 0||$g(e,t,f,g,a,h);return}}for(var p in n)g=n[p],n.hasOwnProperty(p)&&g!=null&&!a.hasOwnProperty(p)&&Xe(e,t,p,null,a,g);for(v in a)g=a[v],h=n[v],!a.hasOwnProperty(v)||g===h||g==null&&h==null||Xe(e,t,v,g,a,h)}function n1(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function w3(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,n=performance.getEntriesByType("resource"),a=0;a<n.length;a++){var i=n[a],r=i.transferSize,o=i.initiatorType,s=i.duration;if(r&&s&&n1(o)){for(o=0,s=i.responseEnd,a+=1;a<n.length;a++){var l=n[a],d=l.startTime;if(d>s)break;var f=l.transferSize,v=l.initiatorType;f&&n1(v)&&(l=l.responseEnd,o+=f*(l<s?1:(s-d)/(l-d)))}if(--a,t+=8*(r+o)/(i.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var Wg=null,eh=null;function pd(e){return e.nodeType===9?e:e.ownerDocument}function a1(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function ek(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function tk(e,t,n,a){return n=pd(n).createElement(e),n[on]=a,n[jn]=t,cn(n,e,t),en(n),n}function th(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Xm=null;function k3(){var e=window.event;return e&&e.type==="popstate"?e===Xm?!1:(Xm=e,!0):(Xm=null,!1)}var eb=typeof setTimeout=="function"?setTimeout:void 0,S3=typeof clearTimeout=="function"?clearTimeout:void 0,i1=typeof Promise=="function"?Promise:void 0,r1=typeof requestAnimationFrame=="function"?requestAnimationFrame:eb,N3=typeof queueMicrotask=="function"?queueMicrotask:typeof i1<"u"?function(e){return i1.resolve(null).then(e).catch(T3)}:eb;function T3(e){setTimeout(function(){throw e})}function zr(e){return e==="head"}function o1(e,t){var n=t,a=0;do{var i=n.nextSibling;if(e.removeChild(n),i&&i.nodeType===8)if(n=i.data,n==="/$"||n==="/&"){if(a===0){e.removeChild(i),js(t);return}a--}else if(n==="$"||n==="$?"||n==="$~"||n==="$!"||n==="&")a++;else if(n==="html")Jm(e.ownerDocument.documentElement);else if(n==="head"){n=e.ownerDocument.head,Jm(n);for(var r=n.firstChild;r;){var o=r.nextSibling,s=r.nodeName;r[kd]||s==="SCRIPT"||s==="STYLE"||s==="LINK"&&r.rel.toLowerCase()==="stylesheet"||n.removeChild(r),r=o}}else n==="body"&&Jm(e.ownerDocument.body);n=i}while(n);js(t)}function s1(e,t){var n=e;e=0;do{var a=n.nextSibling;if(n.nodeType===1?t?(n._stashedDisplay=n.style.display,n.style.display="none"):(n.style.display=n._stashedDisplay||"",n.getAttribute("style")===""&&n.removeAttribute("style")):n.nodeType===3&&(t?(n._stashedText=n.nodeValue,n.nodeValue=""):n.nodeValue=n._stashedText||""),a&&a.nodeType===8)if(n=a.data,n==="/$"){if(e===0)break;e--}else n!=="$"&&n!=="$?"&&n!=="$~"&&n!=="$!"||e++;n=a}while(n)}function nk(e,t,n){if(t=CSS.escape(t)!==t?"r-"+btoa(t).replace(/=/g,""):t,e.style.viewTransitionName=t,n!=null&&(e.style.viewTransitionClass=n),n=getComputedStyle(e),n.display==="inline"){if(t=e.getClientRects(),t.length===1)var a=1;else for(var i=a=0;i<t.length;i++){var r=t[i];0<r.width&&0<r.height&&a++}a===1&&(e=e.style,e.display=t.length===1?"inline-block":"block",e.marginTop="-"+n.paddingTop,e.marginBottom="-"+n.paddingBottom)}}function ak(e,t){e=e.style,t=t.style;var n=t!=null?t.hasOwnProperty("viewTransitionName")?t.viewTransitionName:t.hasOwnProperty("view-transition-name")?t["view-transition-name"]:null:null;e.viewTransitionName=n==null||typeof n=="boolean"?"":(""+n).trim(),n=t!=null?t.hasOwnProperty("viewTransitionClass")?t.viewTransitionClass:t.hasOwnProperty("view-transition-class")?t["view-transition-class"]:null:null,e.viewTransitionClass=n==null||typeof n=="boolean"?"":(""+n).trim(),e.display==="inline-block"&&(t==null?e.display=e.margin="":(n=t.display,e.display=n==null||typeof n=="boolean"?"":n,n=t.margin,n!=null?e.margin=n:(n=t.hasOwnProperty("marginTop")?t.marginTop:t["margin-top"],e.marginTop=n==null||typeof n=="boolean"?"":n,t=t.hasOwnProperty("marginBottom")?t.marginBottom:t["margin-bottom"],e.marginBottom=t==null||typeof t=="boolean"?"":t)))}function ik(e,t,n){return n=n.ownerDocument.defaultView,{rect:e,abs:t.position==="absolute"||t.position==="fixed",clip:t.clipPath!=="none"||t.overflow!=="visible"||t.filter!=="none"||t.mask!=="none"||t.mask!=="none"||t.borderRadius!=="0px",view:0<=e.bottom&&0<=e.right&&e.top<=n.innerHeight&&e.left<=n.innerWidth}}function nh(e){var t=e.getBoundingClientRect(),n=getComputedStyle(e);return ik(t,n,e)}function E3(e){var t=e.getBoundingClientRect();t=new DOMRect(t.x+2e4,t.y+2e4,t.width,t.height);var n=getComputedStyle(e);return ik(t,n,e)}function C3(e){return e.documentElement.clientHeight}function M3(e){this.addEventListener("load",e),this.addEventListener("error",e)}function A3(e,t,n,a,i,r,o,s,l){var d=t.nodeType===9?t:t.ownerDocument;try{var f=d.startViewTransition({update:function(){var g=d.defaultView,h=g.navigation&&g.navigation.transition,w=d.fonts.status;a();var x=[];if(w==="loaded"&&(C3(d),d.fonts.status==="loading"&&x.push(d.fonts.ready)),w=x.length,e!==null)for(var A=e.suspenseyImages,p=0,m=0;m<A.length;m++){var b=A[m];if(!b.complete){var y=b.getBoundingClientRect();if(0<y.bottom&&0<y.right&&y.top<g.innerHeight&&y.left<g.innerWidth){if(p+=hk(b),p>Ou){x.length=w;break}b=new Promise(M3.bind(b)),x.push(b)}}}if(0<x.length)return g=Promise.race([Promise.all(x),new Promise(function(N){return setTimeout(N,500)})]).then(i,i),(h?Promise.allSettled([h.finished,g]):g).then(r,r);if(i(),h)return h.finished.then(r,r);r()},types:n});d.__reactViewTransition=f;var v=[];return f.ready.then(function(){for(var g=d.documentElement.getAnimations({subtree:!0}),h=0;h<g.length;h++){var w=g[h],x=w.effect,A=x.pseudoElement;if(A!=null&&A.startsWith("::view-transition")){v.push(w),w=x.getKeyframes();for(var p=A=void 0,m=!0,b=0;b<w.length;b++){var y=w[b],N=y.width;if(A===void 0)A=N;else if(A!==N){m=!1;break}if(N=y.height,p===void 0)p=N;else if(p!==N){m=!1;break}delete y.width,delete y.height,y.transform==="none"&&delete y.transform}m&&A!==void 0&&p!==void 0&&(x.setKeyframes(w),m=getComputedStyle(x.target,x.pseudoElement),m.width!==A||m.height!==p)&&(m=w[0],m.width=A,m.height=p,m=w[w.length-1],m.width=A,m.height=p,x.setKeyframes(w))}}o()},function(g){d.__reactViewTransition===f&&(d.__reactViewTransition=null);try{typeof g=="object"&&g!==null&&g.name==="InvalidStateError"&&(g.message==="View transition was skipped because document visibility state is hidden."||g.message==="Skipping view transition because document visibility state has become hidden."||g.message==="Skipping view transition because viewport size changed."||g.message==="Transition was aborted because of invalid state")&&(g=null),g!==null&&l(g)}finally{a(),i(),o()}}),f.finished.finally(function(){for(var g=0;g<v.length;g++)v[g].cancel();d.__reactViewTransition===f&&(d.__reactViewTransition=null),s()}),f}catch{return a(),i(),o(),null}}function uo(e,t){this._scope=document.documentElement,this._selector="::view-transition-"+e+"("+t+")"}uo.prototype.animate=function(e,t){return t=typeof t=="number"?{duration:t}:rt({},t),t.pseudoElement=this._selector,this._scope.animate(e,t)};uo.prototype.getAnimations=function(){for(var e=this._scope,t=this._selector,n=e.getAnimations({subtree:!0}),a=[],i=0;i<n.length;i++){var r=n[i].effect;r!==null&&r.target===e&&r.pseudoElement===t&&a.push(n[i])}return a};uo.prototype.getComputedStyle=function(){return getComputedStyle(this._scope,this._selector)};function rk(e){return{name:e,group:new uo("group",e),imagePair:new uo("image-pair",e),old:new uo("old",e),new:new uo("new",e)}}function la(e){this._fragmentFiber=e,this._observers=this._eventListeners=null}la.prototype.addEventListener=function(e,t,n){var a=null,i=null;if(!(n!=null&&typeof n!="boolean"&&(a=n.signal||null,a!==null&&a.aborted))){this._eventListeners===null&&(this._eventListeners=[]);var r=this._eventListeners;if(ok(r,e,t,n)===-1){var o=this,s=t;n!=null&&typeof n!="boolean"&&n.once===!0&&(s=function(l){o.removeEventListener(e,t,n),typeof t=="function"?t.call(this,l):t.handleEvent(l)}),a!==null&&(i=o.removeEventListener.bind(o,e,t,n),a.addEventListener("abort",i,{once:!0}),i=a.removeEventListener.bind(a,"abort",i)),a=Ps(n),r.push({type:e,listener:t,optionsOrUseCapture:n,attachedListener:s,cleanup:i}),Bn(this._fragmentFiber.child,!1,R3,e,s,a)}this._eventListeners=r}};function R3(e,t,n,a){return Ft(e).addEventListener(t,n,a),!1}la.prototype.removeEventListener=function(e,t,n){var a=this._eventListeners;if(a!==null&&(t=ok(a,e,t,n),t!==-1)){var i=a[t];n=i.attachedListener;var r=i.cleanup;i=Ps(i.optionsOrUseCapture),Bn(this._fragmentFiber.child,!1,O3,e,n,i),a.splice(t,1),r!==null&&r()}};function O3(e,t,n,a){return Ft(e).removeEventListener(t,n,a),!1}function Ps(e){return e!=null&&typeof e!="boolean"&&(e.once===!0||e.signal instanceof AbortSignal)?{capture:e.capture,passive:e.passive}:e}function l1(e){return e==null?"c=0":typeof e=="boolean"?"c="+(e?"1":"0"):"c="+(e.capture?"1":"0")}function ok(e,t,n,a){if(e.length===0)return-1;a=l1(a);for(var i=0;i<e.length;i++){var r=e[i];if(r.type===t&&r.listener===n&&l1(r.optionsOrUseCapture)===a)return i}return-1}la.prototype.dispatchEvent=function(e){var t=To(this._fragmentFiber);if(t===null)return!0;t=Ft(t);var n=this._eventListeners;if(n!==null&&0<n.length||!e.bubbles){var a=t.nodeType===9?t.createComment(""):document.createTextNode("");if(n)for(var i=0;i<n.length;i++){var r=n[i];a.addEventListener(r.type,r.attachedListener,Ps(r.optionsOrUseCapture))}if(t.appendChild(a),e=a.dispatchEvent(e),n)for(i=0;i<n.length;i++)r=n[i],a.removeEventListener(r.type,r.attachedListener,Ps(r.optionsOrUseCapture));return t.removeChild(a),e}return t.dispatchEvent(e)};la.prototype.focus=function(e){Bn(this._fragmentFiber.child,!0,sk,e,void 0,void 0)};function sk(e,t){return e.tag===6?!1:(e=Ft(e),j3(e,t))}la.prototype.focusLast=function(e){var t=[];Bn(this._fragmentFiber.child,!0,tb,t,void 0,void 0);for(var n=t.length-1;0<=n&&!sk(t[n],e);n--);};function tb(e,t){return t.push(e),!1}la.prototype.blur=function(){var e=To(this._fragmentFiber);e!==null&&(e=Ft(e),e=pd(e).activeElement,e!==null&&Bn(this._fragmentFiber.child,!1,_3,e,void 0,void 0))};function _3(e,t){return e.tag===6?!1:(e=Ft(e),e===t||e.contains(t)?(t.blur(),!0):!1)}la.prototype.observeUsing=function(e){this._observers===null&&(this._observers=new Set),this._observers.add(e),Bn(this._fragmentFiber.child,!1,I3,e,void 0,void 0)};function I3(e,t){return e.tag===6||(e=Ft(e),t.observe(e)),!1}la.prototype.unobserveUsing=function(e){var t=this._observers;if(t!==null&&t.has(e)){t.delete(e),Bn(this._fragmentFiber.child,!1,D3,e,void 0,void 0);for(var n=t=0;n<ja.length;n++){var a=ja[n];a.fragmentInstance===this&&a.observer===e?e.unobserve(a.instance):ja[t++]=a}ja.length=t}};function D3(e,t){return e.tag===6||(e=Ft(e),t.unobserve(e)),!1}var ja=[],Zm=!1;function L3(e,t,n){ja.push({fragmentInstance:e,observer:t,instance:n}),Zm||(Zm=!0,G3(function(){Zm=!1;var a=ja;ja=[];for(var i=0;i<a.length;i++){var r=a[i];r.observer.unobserve(r.instance)}}))}la.prototype.getClientRects=function(){var e=[];return Bn(this._fragmentFiber.child,!1,z3,e,void 0,void 0),e};function z3(e,t){if(e.tag===6){e=e.stateNode;var n=e.ownerDocument.createRange();n.selectNodeContents(e),t.push.apply(t,n.getClientRects())}else e=Ft(e),t.push.apply(t,e.getClientRects());return!1}la.prototype.getRootNode=function(e){var t=To(this._fragmentFiber);return t===null?this:Ft(t).getRootNode(e)};la.prototype.compareDocumentPosition=function(e){var t=To(this._fragmentFiber);if(t===null)return Node.DOCUMENT_POSITION_DISCONNECTED;var n=[];Bn(this._fragmentFiber.child,!1,tb,n,void 0,void 0);var a=Ft(t);if(n.length===0){if(n=a,Uy(this._fragmentFiber)){e:{for(t=this._fragmentFiber.return;t!==null;){if(t.tag===4){t=t.stateNode.containerInfo;break e}if(t.tag===3||t.tag===5||t.tag===27)break;t=t.return}t=null}t!=null&&(n=t)}t=this._fragmentFiber;var i=a=n.compareDocumentPosition(e);return n===e?i=Node.DOCUMENT_POSITION_CONTAINS:a&Node.DOCUMENT_POSITION_CONTAINED_BY&&(n=A1(t)[1],n===null?i=Node.DOCUMENT_POSITION_PRECEDING:(e=Ft(n).compareDocumentPosition(e),i=e===0||e&Node.DOCUMENT_POSITION_FOLLOWING?Node.DOCUMENT_POSITION_FOLLOWING:Node.DOCUMENT_POSITION_PRECEDING)),i|=Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC}t=Ft(n[0]),i=Ft(n[n.length-1]);var r=Uy(this._fragmentFiber)?t.parentElement:a;if(r==null)return Node.DOCUMENT_POSITION_DISCONNECTED;a=r.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_CONTAINED_BY,r=r.compareDocumentPosition(i)&Node.DOCUMENT_POSITION_CONTAINED_BY;var o=t.compareDocumentPosition(e),s=i.compareDocumentPosition(e),l=o&Node.DOCUMENT_POSITION_CONTAINED_BY||s&Node.DOCUMENT_POSITION_CONTAINED_BY;return s=a&&r&&o&Node.DOCUMENT_POSITION_FOLLOWING&&s&Node.DOCUMENT_POSITION_PRECEDING,t=a&&t===e||r&&i===e||l||s?Node.DOCUMENT_POSITION_CONTAINED_BY:!a&&t===e||!r&&i===e?Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC:o,t&Node.DOCUMENT_POSITION_DISCONNECTED||t&Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC||H3(t,this._fragmentFiber,n[0],n[n.length-1],e)?t:Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC};function H3(e,t,n,a,i){var r=co(i);if(e&Node.DOCUMENT_POSITION_CONTAINED_BY){if(n=!!r)e:{for(;r!==null;){if(r.tag===7&&(r===t||r.alternate===t)){n=!0;break e}r=r.return}n=!1}return n}if(e&Node.DOCUMENT_POSITION_CONTAINS){if(r===null)return r=i.ownerDocument,i===r||i===r.documentElement||i===r.body;e:{for(r=t,t=To(t);r!==null;){if(!(r.tag!==5&&r.tag!==3&&r.tag!==27||r!==t&&r.alternate!==t)){r=!0;break e}r=r.return}r=!1}return r}return e&Node.DOCUMENT_POSITION_PRECEDING?((t=!!r)&&!(t=r===n)&&(t=Wm(n,r,By),t===null?t=!1:(Bn(t,!0,pE,r,n),r=ds,ds=null,t=r!==null)),t):e&Node.DOCUMENT_POSITION_FOLLOWING?((t=!!r)&&!(t=r===a)&&(t=Wm(a,r,By),t===null?t=!1:(Bn(t,!0,mE,r,a),r=ds,$m=ds=null,t=r!==null)),t):!1}function d1(e,t){var n=e.ownerDocument.createRange();n.selectNodeContents(e),e=n.getBoundingClientRect(),window.scrollTo(window.scrollX+e.left,t?window.scrollY+e.top:window.scrollY+e.bottom-window.innerHeight)}la.prototype.scrollIntoView=function(e){if(typeof e=="object")throw Error(L(566));var t=[];Bn(this._fragmentFiber.child,!1,tb,t,void 0,void 0);var n=e!==!1;if(t.length===0){var a=A1(this._fragmentFiber);if(a=n?a[1]||a[0]||To(this._fragmentFiber):a[0]||a[1],a===null)return;if(a.tag===6){e=Ft(a),d1(e,n);return}if(a=Ft(a),a.nodeType!==9){if(a.nodeType===11){n="host"in a?a.host:null,n!==null&&n.scrollIntoView(e);return}a.scrollIntoView(e)}}for(a=n?t.length-1:0;a!==(n?-1:t.length);){var i=t[a];i.tag===6?(i=Ft(i),d1(i,n)):Ft(i).scrollIntoView(e),a+=n?-1:1}};function q3(e,t){return e=Ft(e),lk(e,t),!1}function lk(e,t){e.reactFragments==null&&(e.reactFragments=new Set),e.reactFragments.add(t)}function dk(e,t){var n=t._eventListeners;if(n!==null)for(var a=0;a<n.length;a++){var i=n[a];e.addEventListener(i.type,i.attachedListener,Ps(i.optionsOrUseCapture))}e.nodeType!==3&&(n=t._observers,n!==null&&n.forEach(function(r){for(var o=0,s=0;s<ja.length;s++){var l=ja[s];(l.fragmentInstance!==t||l.observer!==r||l.instance!==e)&&(ja[o++]=l)}ja.length=o,r.observe(e)}),lk(e,t))}function P3(e,t){var n=t._eventListeners;if(n!==null)for(var a=0;a<n.length;a++){var i=n[a];e.removeEventListener(i.type,i.attachedListener,Ps(i.optionsOrUseCapture))}e.nodeType!==3&&(n=t._observers,n!==null&&n.forEach(function(r){typeof r.rootMargin=="string"?L3(t,r,e):r.unobserve(e)}),e.reactFragments!=null&&e.reactFragments.delete(t))}function ah(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var n=t;switch(t=t.nextSibling,n.nodeName){case"HTML":case"HEAD":case"BODY":ah(n),uf(n);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(n.rel.toLowerCase()==="stylesheet")continue}e.removeChild(n)}}function V3(e,t,n,a){for(;e.nodeType===1;){var i=n;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!a&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(a){if(!e[kd])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(r=e.getAttribute("rel"),r==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(r!==i.rel||e.getAttribute("href")!==(i.href==null||i.href===""?null:i.href)||e.getAttribute("crossorigin")!==(i.crossOrigin==null?null:i.crossOrigin)||e.getAttribute("title")!==(i.title==null?null:i.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(r=e.getAttribute("src"),(r!==(i.src==null?null:i.src)||e.getAttribute("type")!==(i.type==null?null:i.type)||e.getAttribute("crossorigin")!==(i.crossOrigin==null?null:i.crossOrigin))&&r&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var r=i.name==null?null:""+i.name;if(i.type==="hidden"&&e.getAttribute("name")===r)return e}else return e;if(e=Ea(e.nextSibling),e===null)break}return null}function U3(e,t,n){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!n||(e=Ea(e.nextSibling),e===null))return null;return e}function ck(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=Ea(e.nextSibling),e===null))return null;return e}function ih(e){return e.data==="$?"||e.data==="$~"}function nb(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function B3(e,t){var n=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||n.readyState!=="loading")t();else{var a=function(){t(),n.removeEventListener("DOMContentLoaded",a)};n.addEventListener("DOMContentLoaded",a),e._reactRetry=a}}function Ea(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var rh=null;function c1(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="/$"||n==="/&"){if(t===0)return Ea(e.nextSibling);t--}else n!=="$"&&n!=="$!"&&n!=="$?"&&n!=="$~"&&n!=="&"||t++}e=e.nextSibling}return null}function u1(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="$"||n==="$!"||n==="$?"||n==="$~"||n==="&"){if(t===0)return e;t--}else n!=="/$"&&n!=="/&"||t++}e=e.previousSibling}return null}function j3(e,t){function n(){a=!0}if(e.ownerDocument.activeElement===e)return!0;var a=!1;try{e.ownerDocument.addEventListener("focus",n,!0),(e.focus||HTMLElement.prototype.focus).call(e,t)}finally{e.ownerDocument.removeEventListener("focus",n,!0)}return a}function G3(e){r1(function(){r1(function(t){return e(t)})})}function uk(e,t,n){switch(t=pd(n),e){case"html":if(e=t.documentElement,!e)throw Error(L(452));return e;case"head":if(e=t.head,!e)throw Error(L(453));return e;case"body":if(e=t.body,!e)throw Error(L(454));return e;default:throw Error(L(451))}}function fk(e,t,n){for(var a in n){var i=n[a];n.hasOwnProperty(a)&&i!=null&&Xe(e,t,a,null,y3,i)}n.dangerouslySetInnerHTML!=null&&(e.textContent=""),e.onclick===li&&(e.onclick=null),uf(e)}function Jm(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);uf(e)}var Ca=new Map,f1=new Set;function md(e){if(typeof e.getRootNode=="function"){var t=e.getRootNode();if(t.nodeType===9||t.nodeType===11)return t}return e.nodeType===9?e:e.ownerDocument}var ji=Be.d;Be.d={f:F3,r:K3,D:Y3,C:Q3,L:X3,m:Z3,X:$3,S:J3,M:W3};function F3(){var e=ji.f(),t=Tf();return e||t}function K3(e){var t=Fs(e);t!==null&&t.tag===5&&t.type==="form"?Zx(t):ji.r(e)}var Xs=typeof document>"u"?null:document;function pk(e,t,n){var a=Xs;if(a&&typeof t=="string"&&t){var i=Sa(t);i='link[rel="'+e+'"][href="'+i+'"]',typeof n=="string"&&(i+='[crossorigin="'+n+'"]'),f1.has(i)||(f1.add(i),e={rel:e,crossOrigin:n,href:t},a.querySelector(i)===null&&(t=a.createElement("link"),cn(t,"link",e),en(t),a.head.appendChild(t)))}}function Y3(e){ji.D(e),pk("dns-prefetch",e,null)}function Q3(e,t){ji.C(e,t),pk("preconnect",e,t)}function X3(e,t,n){ji.L(e,t,n);var a=Xs;if(a&&e&&t){var i='link[rel="preload"][as="'+Sa(t)+'"]';t==="image"&&n&&n.imageSrcSet?(i+='[imagesrcset="'+Sa(n.imageSrcSet)+'"]',typeof n.imageSizes=="string"&&(i+='[imagesizes="'+Sa(n.imageSizes)+'"]')):i+='[href="'+Sa(e)+'"]';var r=i;switch(t){case"style":r=Vs(e);break;case"script":r=Zs(e)}if(!(Ca.has(r)||(e=rt({rel:"preload",href:t==="image"&&n&&n.imageSrcSet?void 0:e,as:t},n),Ca.set(r,e),a.querySelector(i)!==null||t==="style"&&a.querySelector(Md(r))||t==="script"&&a.querySelector(Ad(r))))){var o=a.createElement("link");cn(o,"link",e),t==="style"&&(o[qu]=!0,o.onload=o.onerror=function(){B1(o)}),en(o),a.head.appendChild(o)}}}function Z3(e,t){ji.m(e,t);var n=Xs;if(n&&e){var a=t&&typeof t.as=="string"?t.as:"script",i='link[rel="modulepreload"][as="'+Sa(a)+'"][href="'+Sa(e)+'"]',r=i;switch(a){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":r=Zs(e)}if(!Ca.has(r)&&(e=rt({rel:"modulepreload",href:e},t),Ca.set(r,e),n.querySelector(i)===null)){switch(a){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(n.querySelector(Ad(r)))return}a=n.createElement("link"),cn(a,"link",e),en(a),n.head.appendChild(a)}}}function J3(e,t,n){ji.S(e,t,n);var a=Xs;if(a&&e){var i=ws(a).hoistableStyles,r=Vs(e);t=t||"default";var o=i.get(r);if(!o){var s={loading:0,preload:null};if(o=a.querySelector(Md(r)))s.loading=5;else{e=rt({rel:"stylesheet",href:e,"data-precedence":t},n),(n=Ca.get(r))&&ab(e,n);var l=o=a.createElement("link");en(l),cn(l,"link",e),l._p=new Promise(function(d,f){l.onload=d,l.onerror=f}),l.addEventListener("load",function(){s.loading|=1}),l.addEventListener("error",function(){s.loading|=2}),s.loading|=4,Au(o,t,a)}o={type:"stylesheet",instance:o,count:1,state:s},i.set(r,o)}}}function $3(e,t){ji.X(e,t);var n=Xs;if(n&&e){var a=ws(n).hoistableScripts,i=Zs(e),r=a.get(i);r||(r=n.querySelector(Ad(i)),r||(e=rt({src:e,async:!0},t),(t=Ca.get(i))&&ib(e,t),r=n.createElement("script"),en(r),cn(r,"link",e),n.head.appendChild(r)),r={type:"script",instance:r,count:1,state:null},a.set(i,r))}}function W3(e,t){ji.M(e,t);var n=Xs;if(n&&e){var a=ws(n).hoistableScripts,i=Zs(e),r=a.get(i);r||(r=n.querySelector(Ad(i)),r||(e=rt({src:e,async:!0,type:"module"},t),(t=Ca.get(i))&&ib(e,t),r=n.createElement("script"),en(r),cn(r,"link",e),n.head.appendChild(r)),r={type:"script",instance:r,count:1,state:null},a.set(i,r))}}function p1(e,t,n,a){var i=(i=xr.current)?md(i):null;if(!i)throw Error(L(446));switch(e){case"meta":case"title":return null;case"style":return typeof n.precedence=="string"&&typeof n.href=="string"?(n=Vs(n.href),t=ws(i).hoistableStyles,a=t.get(n),a||(a={type:"style",instance:null,count:0,state:null},t.set(n,a)),a):{type:"void",instance:null,count:0,state:null};case"link":if(n.rel==="stylesheet"&&typeof n.href=="string"&&typeof n.precedence=="string"){e=Vs(n.href);var r=ws(i).hoistableStyles,o=r.get(e);if(o||(i=i.ownerDocument||i,o={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},r.set(e,o),(r=i.querySelector(Md(e)))?r._p||(o.instance=r,o.state.loading=5):(r=Ca.get(e),r||(r={rel:"preload",as:"style",href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},Ca.set(e,r)),eC(i,e,r,o.state))),t&&a===null)throw Error(L(528,""));return o}if(t&&a!==null)throw Error(L(529,""));return null;case"script":return t=n.async,n=n.src,typeof n=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(n=Zs(n),t=ws(i).hoistableScripts,a=t.get(n),a||(a={type:"script",instance:null,count:0,state:null},t.set(n,a)),a):{type:"void",instance:null,count:0,state:null};default:throw Error(L(444,e))}}function Vs(e){return'href="'+Sa(e)+'"'}function Md(e){return'link[rel="stylesheet"]['+e+"]"}function mk(e){return rt({},e,{"data-precedence":e.precedence,precedence:null})}function eC(e,t,n,a){if(t=e.querySelector('link[rel="preload"][as="style"]['+t+"]")){if(t[qu]!==!0){a.loading=1;return}}else t=e.createElement("link"),t[qu]=!0,t.onload=t.onerror=B1.bind(null,t),cn(t,"link",n),en(t),e.head.appendChild(t);a.preload=t,t.addEventListener("load",function(){return a.loading|=1}),t.addEventListener("error",function(){return a.loading|=2})}function Zs(e){return'[src="'+Sa(e)+'"]'}function Ad(e){return"script[async]"+e}function m1(e,t,n){if(t.count++,t.instance===null)switch(t.type){case"style":var a=e.querySelector('style[data-href~="'+Sa(n.href)+'"]');if(a)return t.instance=a,en(a),a;var i=rt({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return a=(e.ownerDocument||e).createElement("style"),en(a),cn(a,"style",i),Au(a,n.precedence,e),t.instance=a;case"stylesheet":i=Vs(n.href);var r=e.querySelector(Md(i));if(r)return t.state.loading|=4,t.instance=r,en(r),r;a=mk(n),(i=Ca.get(i))&&ab(a,i),r=(e.ownerDocument||e).createElement("link"),en(r);var o=r;return o._p=new Promise(function(s,l){o.onload=s,o.onerror=l}),cn(r,"link",a),t.state.loading|=4,Au(r,n.precedence,e),t.instance=r;case"script":return r=Zs(n.src),(i=e.querySelector(Ad(r)))?(t.instance=i,en(i),i):(a=n,(i=Ca.get(r))&&(a=rt({},n),ib(a,i)),e=e.ownerDocument||e,i=e.createElement("script"),en(i),cn(i,"link",a),e.head.appendChild(i),t.instance=i);case"void":return null;default:throw Error(L(443,t.type))}else t.type==="stylesheet"&&(t.state.loading&4)===0&&(a=t.instance,t.state.loading|=4,Au(a,n.precedence,e));return t.instance}function Au(e,t,n){for(var a=n.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),i=a.length?a[a.length-1]:null,r=i,o=0;o<a.length;o++){var s=a[o];if(s.dataset.precedence===t)r=s;else if(r!==i)break}r?r.parentNode.insertBefore(e,r.nextSibling):(t=n.nodeType===9?n.head:n,t.insertBefore(e,t.firstChild))}function ab(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function ib(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var Ru=null;function g1(e,t,n){if(Ru===null){var a=new Map,i=Ru=new Map;i.set(n,a)}else i=Ru,a=i.get(n),a||(a=new Map,i.set(n,a));if(a.has(e))return a;for(a.set(e,null),n=n.getElementsByTagName(e),i=0;i<n.length;i++){var r=n[i];if(!(r[kd]||r[on]||e==="link"&&r.getAttribute("rel")==="stylesheet")&&r.namespaceURI!=="http://www.w3.org/2000/svg"){var o=r.getAttribute(t)||"";o=e+o;var s=a.get(o);s?s.push(r):a.set(o,[r])}}return a}function oh(e,t,n){e=e.ownerDocument||e,e.head.insertBefore(n,t==="title"?e.querySelector("head > title"):null)}function tC(e,t,n){if(n===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;return t.rel==="stylesheet"?(e=t.disabled,typeof t.precedence=="string"&&e==null):!0;case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function h1(e,t){return e==="img"&&t.src!=null&&t.src!==""&&t.onLoad==null&&t.loading!=="lazy"}function gk(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function hk(e){return(e.width||100)*(e.height||100)*(typeof devicePixelRatio=="number"?devicePixelRatio:1)*.25}function b1(e,t){typeof t.decode=="function"&&(e.imgCount++,t.complete||(e.imgBytes+=hk(t),e.suspenseyImages.push(t)),e=iC.bind(e),t.decode().then(e,e))}function nC(e,t,n,a){if(n.type==="stylesheet"&&(typeof a.media!="string"||matchMedia(a.media).matches!==!1)&&(n.state.loading&4)===0){if(n.instance===null){var i=Vs(a.href),r=t.querySelector(Md(i));if(r){t=r._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=gd.bind(e),t.then(e,e)),n.state.loading|=4,n.instance=r,en(r);return}r=t.ownerDocument||t,a=mk(a),(i=Ca.get(i))&&ab(a,i),r=r.createElement("link"),en(r);var o=r;o._p=new Promise(function(s,l){o.onload=s,o.onerror=l}),cn(r,"link",a),n.instance=r}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(n,t),(t=n.state.preload)&&(n.state.loading&3)===0&&(e.count++,n=gd.bind(e),t.addEventListener("load",n),t.addEventListener("error",n))}}var Ou=0;function aC(e,t){return e.stylesheets&&e.count===0&&_u(e,e.stylesheets),0<e.count||0<e.imgCount?function(n){var a=setTimeout(function(){if(e.stylesheets&&_u(e,e.stylesheets),e.unsuspend){var r=e.unsuspend;e.unsuspend=null,r()}},6e4+t);0<e.imgBytes&&Ou===0&&(Ou=62500*w3());var i=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&_u(e,e.stylesheets),e.unsuspend)){var r=e.unsuspend;e.unsuspend=null,r()}},(e.imgBytes>Ou?50:800)+t);return e.unsuspend=n,function(){e.unsuspend=null,clearTimeout(a),clearTimeout(i)}}:null}function bk(e){if(e.count===0&&(e.imgCount===0||!e.waitingForImages)){if(e.stylesheets)_u(e,e.stylesheets);else if(e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}}}function gd(){this.count--,bk(this)}function iC(){this.imgCount--,bk(this)}var lf=null;function _u(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,lf=new Map,t.forEach(rC,e),lf=null,gd.call(e))}function rC(e,t){if(!(t.state.loading&4)){var n=lf.get(e);if(n)var a=n.get(null);else{n=new Map,lf.set(e,n);for(var i=e.querySelectorAll("link[data-precedence],style[data-precedence]"),r=0;r<i.length;r++){var o=i[r];(o.nodeName==="LINK"||o.getAttribute("media")!=="not all")&&(n.set(o.dataset.precedence,o),a=o)}a&&n.set(null,a)}i=t.instance,o=i.getAttribute("data-precedence"),r=n.get(o)||a,r===a&&n.set(null,i),n.set(o,i),this.count++,a=gd.bind(this),i.addEventListener("load",a),i.addEventListener("error",a),r?r.parentNode.insertBefore(i,r.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(i,e.firstChild)),t.state.loading|=4}}var Us={$$typeof:si,Provider:null,Consumer:null,_currentValue:fo,_currentValue2:fo,_threadCount:0};function oC(e,t,n,a,i,r,o,s,l){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Tm(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Tm(0),this.hiddenUpdates=Tm(null),this.identifierPrefix=a,this.onUncaughtError=i,this.onCaughtError=r,this.onRecoverableError=o,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=l,this.transitionTypes=null,this.incompleteTransitions=new Map}function vk(e,t,n,a,i,r,o,s,l,d,f,v){return e=new oC(e,t,n,o,l,d,f,v,s),t=1,r===!0&&(t|=24),r=Vn(3,null,null,t),e.current=r,r.stateNode=e,t=Nh(),t.refCount++,e.pooledCache=t,t.refCount++,r.memoizedState={element:a,isDehydrated:n,cache:t},Ch(r),e}function yk(e){return e?(e=bs,e):bs}function xk(e,t,n,a,i,r){i=yk(i),a.context===null?a.context=i:a.pendingContext=i,a=kr(t),a.payload={element:n},r=r===void 0?null:r,r!==null&&(a.callback=r),n=Sr(e,a,t),n!==null&&(Un(n,e,t),Yl(n,e,t))}function v1(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function rb(e,t){v1(e,t),(e=e.alternate)&&v1(e,t)}function wk(e){if(e.tag===13||e.tag===31){var t=Mo(e,67108864);t!==null&&Un(t,e,67108864),rb(e,67108864)}}function y1(e){if(e.tag===13||e.tag===31){var t=oa();t=fh(t);var n=Mo(e,t);n!==null&&Un(n,e,t),rb(e,t)}}var Bs=!0;function sC(e,t,n,a){var i=pe.T;pe.T=null;var r=Be.p;try{Be.p=2,ob(e,t,n,a)}finally{Be.p=r,pe.T=i}}function lC(e,t,n,a){var i=pe.T;pe.T=null;var r=Be.p;try{Be.p=8,ob(e,t,n,a)}finally{Be.p=r,pe.T=i}}function ob(e,t,n,a){if(Bs){var i=sh(a);if(i===null)Qm(e,t,a,df,n),x1(e,a);else if(cC(i,e,t,n,a))a.stopPropagation();else if(x1(e,a),t&4&&-1<dC.indexOf(e)){for(;i!==null;){var r=Fs(i);if(r!==null)switch(r.tag){case 3:if(r=r.stateNode,r.current.memoizedState.isDehydrated){var o=oo(r.pendingLanes);if(o!==0){var s=r;for(s.pendingLanes|=2,s.entangledLanes|=2;o;){var l=1<<31-ra(o);s.entanglements[1]|=l,o&=~l}gi(r),(Ue&6)===0&&(nf=aa()+500,Cd(0,!1))}}break;case 31:case 13:s=Mo(r,2),s!==null&&Un(s,r,2),Tf(),rb(r,2)}if(r=sh(a),r===null&&Qm(e,t,a,df,n),r===i)break;i=r}i!==null&&a.stopPropagation()}else Qm(e,t,a,null,n)}}function sh(e){return e=gh(e),sb(e)}var df=null;function sb(e){if(df=null,e=co(e),e!==null){var t=vd(e);if(t===null)e=null;else{var n=t.tag;if(n===13){if(e=E1(t),e!==null)return e;e=null}else if(n===31){if(e=C1(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return df=e,null}function kk(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"fullscreenerror":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"resize":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(SE()){case I1:return 2;case D1:return 8;case Hu:case NE:return 32;case L1:return 268435456;default:return 32}default:return 32}}var lh=!1,Cr=null,Mr=null,Ar=null,hd=new Map,bd=new Map,pr=[],dC="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function x1(e,t){switch(e){case"focusin":case"focusout":Cr=null;break;case"dragenter":case"dragleave":Mr=null;break;case"mouseover":case"mouseout":Ar=null;break;case"pointerover":case"pointerout":hd.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":bd.delete(t.pointerId)}}function zl(e,t,n,a,i,r){return e===null||e.nativeEvent!==r?(e={blockedOn:t,domEventName:n,eventSystemFlags:a,nativeEvent:r,targetContainers:[i]},t!==null&&(t=Fs(t),t!==null&&wk(t)),e):(e.eventSystemFlags|=a,t=e.targetContainers,i!==null&&t.indexOf(i)===-1&&t.push(i),e)}function cC(e,t,n,a,i){switch(t){case"focusin":return Cr=zl(Cr,e,t,n,a,i),!0;case"dragenter":return Mr=zl(Mr,e,t,n,a,i),!0;case"mouseover":return Ar=zl(Ar,e,t,n,a,i),!0;case"pointerover":var r=i.pointerId;return hd.set(r,zl(hd.get(r)||null,e,t,n,a,i)),!0;case"gotpointercapture":return r=i.pointerId,bd.set(r,zl(bd.get(r)||null,e,t,n,a,i)),!0}return!1}function Sk(e){var t=co(e.target);if(t!==null){var n=vd(t);if(n!==null){if(t=n.tag,t===13){if(t=E1(n),t!==null){e.blockedOn=t,Ky(e.priority,function(){y1(n)});return}}else if(t===31){if(t=C1(n),t!==null){e.blockedOn=t,Ky(e.priority,function(){y1(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Iu(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=sh(e.nativeEvent);if(n===null){n=e.nativeEvent;var a=new n.constructor(n.type,n);ug=a,n.target.dispatchEvent(a),ug=null}else return t=Fs(n),t!==null&&wk(t),e.blockedOn=n,!1;t.shift()}return!0}function w1(e,t,n){Iu(e)&&n.delete(t)}function uC(){lh=!1,Cr!==null&&Iu(Cr)&&(Cr=null),Mr!==null&&Iu(Mr)&&(Mr=null),Ar!==null&&Iu(Ar)&&(Ar=null),hd.forEach(w1),bd.forEach(w1)}function pu(e,t){e.blockedOn===t&&(e.blockedOn=null,lh||(lh=!0,Kt.unstable_scheduleCallback(Kt.unstable_NormalPriority,uC)))}var mu=null;function k1(e){mu!==e&&(mu=e,Kt.unstable_scheduleCallback(Kt.unstable_NormalPriority,function(){mu===e&&(mu=null);for(var t=0;t<e.length;t+=3){var n=e[t],a=e[t+1],i=e[t+2];if(typeof a!="function"){if(sb(a||n)===null)continue;break}var r=Fs(n);r!==null&&(e.splice(t,3),t-=3,Cg(r,{pending:!0,data:i,method:n.method,action:a},a,i))}}))}function js(e){function t(l){return pu(l,e)}Cr!==null&&pu(Cr,e),Mr!==null&&pu(Mr,e),Ar!==null&&pu(Ar,e),hd.forEach(t),bd.forEach(t);for(var n=0;n<pr.length;n++){var a=pr[n];a.blockedOn===e&&(a.blockedOn=null)}for(;0<pr.length&&(n=pr[0],n.blockedOn===null);)Sk(n),n.blockedOn===null&&pr.shift();if(n=(e.ownerDocument||e).$$reactFormReplay,n!=null)for(a=0;a<n.length;a+=3){var i=n[a],r=n[a+1],o=i[jn]||null;if(typeof r=="function")o||k1(n);else if(o){var s=null;if(r&&r.hasAttribute("formAction")){if(i=r,o=r[jn]||null)s=o.formAction;else if(sb(i)!==null)continue}else s=o.action;typeof s=="function"?n[a+1]=s:(n.splice(a,3),a-=3),k1(n)}}}function Nk(){function e(r){r.canIntercept&&r.info==="react-transition"&&r.intercept({handler:function(){return new Promise(function(o){return i=o})},focusReset:"manual",scroll:"manual"})}function t(){i!==null&&(i(),i=null),a||setTimeout(n,20)}function n(){if(!a&&!navigation.transition){var r=navigation.currentEntry;r&&r.url!=null&&navigation.navigate(r.url,{state:r.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var a=!1,i=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(n,100),function(){a=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),i!==null&&(i(),i=null)}}}function lb(e){this._internalRoot=e}Mf.prototype.render=lb.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(L(409));var n=t.current,a=oa();xk(n,a,e,t,null,null)};Mf.prototype.unmount=lb.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;xk(e.current,2,null,e,null,null),Tf(),t[Gs]=null}};function Mf(e){this._internalRoot=e}Mf.prototype.unstable_scheduleHydration=function(e){if(e){var t=U1();e={blockedOn:null,target:e,priority:t};for(var n=0;n<pr.length&&t!==0&&t<pr[n].priority;n++);pr.splice(n,0,e),n===0&&Sk(e)}};var S1=N1.version;if(S1!=="19.3.1")throw Error(L(527,S1,"19.3.1"));Be.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(L(188)):(e=Object.keys(e).join(","),Error(L(268,e)));return e=fE(t),e=e!==null?M1(e):null,e=e===null?null:e.stateNode,e};var fC={bundleType:0,version:"19.3.1",rendererPackageName:"react-dom",currentDispatcherRef:pe,reconcilerVersion:"19.3.1"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(Hl=__REACT_DEVTOOLS_GLOBAL_HOOK__,!Hl.isDisabled&&Hl.supportsFiber))try{yd=Hl.inject(fC),ia=Hl}catch{}var Hl;Af.createRoot=function(e,t){if(!T1(e))throw Error(L(299));var n=!1,a="",i=iw,r=rw,o=ow;return t!=null&&(t.unstable_strictMode===!0&&(n=!0),t.identifierPrefix!==void 0&&(a=t.identifierPrefix),t.onUncaughtError!==void 0&&(i=t.onUncaughtError),t.onCaughtError!==void 0&&(r=t.onCaughtError),t.onRecoverableError!==void 0&&(o=t.onRecoverableError)),t=vk(e,1,!1,null,null,n,a,null,i,r,o,Nk),e[Gs]=t.current,Wh(e),new lb(t)};Af.hydrateRoot=function(e,t,n){if(!T1(e))throw Error(L(299));var a=!1,i="",r=iw,o=rw,s=ow,l=null;return n!=null&&(n.unstable_strictMode===!0&&(a=!0),n.identifierPrefix!==void 0&&(i=n.identifierPrefix),n.onUncaughtError!==void 0&&(r=n.onUncaughtError),n.onCaughtError!==void 0&&(o=n.onCaughtError),n.onRecoverableError!==void 0&&(s=n.onRecoverableError),n.formState!==void 0&&(l=n.formState)),t=vk(e,1,!0,t,n??null,a,i,l,r,o,s,Nk),t.context=yk(null),n=t.current,a=oa(),a=fh(a),i=kr(a),i.callback=null,Sr(n,i,a),n=a,t.current.lanes=n,wd(t,n),gi(t),e[Gs]=t.current,Wh(e),new Mf(t)};Af.version="19.3.1"});var Mk=ei((z9,Ck)=>{"use strict";function Ek(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Ek)}catch(e){console.error(e)}}Ek(),Ck.exports=Tk()});var z2=ei(Jf=>{"use strict";var ZM=Symbol.for("react.transitional.element"),JM=Symbol.for("react.fragment");function L2(e,t,n){var a=null;if(n!==void 0&&(a=""+n),t.key!==void 0&&(a=""+t.key),"key"in t){n={};for(var i in t)i!=="key"&&(n[i]=t[i])}else n=t;return t=n.ref,{$$typeof:ZM,type:e,key:a,ref:t!==void 0?t:null,props:n}}Jf.Fragment=JM;Jf.jsx=L2;Jf.jsxs=L2});var re=ei((lO,H2)=>{"use strict";H2.exports=z2()});var J4=K(Mk(),1);var be=K(Fe(),1);var da=class extends Error{constructor(t){super(t),this.name="RpcTransportError"}},Ro=class extends Error{error;constructor(t){super(t.message),this.name="RpcCallError",this.error=t}},Ak=0,pC=6e4;function mC(){let e=typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`;return Ak+=1,`${e}-${Ak.toString(36)}`}async function fe(e,t,n,a=pC){let i=mC(),r=new AbortController,o=!1,s;a>0&&(s=setTimeout(()=>{o=!0,r.abort()},a));let l=()=>{r.abort()};n?.addEventListener("abort",l,{once:!0});let d;try{try{d=await fetch(`/m/api/${e}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({type:"client-request",rpcId:i,method:e,payload:t}),signal:r.signal})}catch(h){let w;throw h instanceof DOMException&&h.name==="AbortError"?w=o?"timeout":"aborted":w=h instanceof Error?h.message:String(h),new da(o?"请求超时，请重试":`transport failed: ${w}`)}if(!d.ok){let h;if(d.status!==403)try{let w=await d.json();typeof w?.error?.message=="string"&&(h=w.error.message)}catch{}throw new da(h!==void 0?h:`HTTP ${String(d.status)}`)}let f;try{f=await d.json()}catch(h){throw h instanceof DOMException&&h.name==="AbortError"?new da(o?"请求超时，请重试":"请求超时或已取消，请重试"):new da("malformed response body")}let v=f;if(v?.type!=="server-response"||v.rpcId!==i)throw new da("response envelope mismatch");let g=v.result;if(g?.ok===!0)return g.value;throw g?.ok===!1&&g.error!==void 0?new Ro(g.error):new da("malformed result envelope")}finally{s!==void 0&&clearTimeout(s),n?.removeEventListener("abort",l)}}async function Rf(){return await fe("settings.read",{})}async function Js(e,t,n){let a={ns:e,ops:t};n!==void 0&&(a.expectedRevision=n),await fe("settings.mutate",a)}var gC=5e3,db,Rk;async function Rd(){let e=Rk;if(e!==void 0&&Date.now()-e.at<gC)return e.items;let t=db;if(t!==void 0)return t;let n=fe("workspace.list",{}).then(({items:a})=>(Rk={at:Date.now(),items:a},a)).finally(()=>{db=void 0});return db=n,n}async function Of(){return await fe("mobile.preferences",{})}async function Od(){return await fe("push.config",{get:!0})}async function _d(e){await fe("push.config",{set:e})}async function Ok(){await fe("push.config",{test:!0})}async function _k(e){await fe("push.subscribe",{subscription:e})}async function Ik(){await fe("push.unsubscribe",{})}async function Dk(){return await fe("mobile.notifyEvents",{})}async function Lk(){return await fe("mobile.latestVersion",{})}async function zk(e,t){return await fe("mobile.readAttachment",{sessionId:e,attachmentId:t})}async function Hk(){return await fe("mobile.diagnostics",{})}async function qk(e,t){return await fe("mobile.perf",{capture:e,label:t})}async function Pk(e,t){return await fe("mobile.error",{report:e,label:t})}async function Vk(){return await fe("mobile.runningSessions",{})}async function Hr(e,t){return await fe("session.list",{...e===void 0?{}:{cursor:e},...t===void 0?{}:{workspaceId:t}})}async function _f(e){return await fe("mobile.searchAll",{query:e})}async function If(e,t){return await fe("mobile.searchMessages",{sessionId:e,query:t})}async function Df(){return await fe("agentPreset.list",{})}async function Uk(e={}){return await fe("session.create",e)}async function Gi(e,t,n=25,a){return await fe("session.history",{sessionId:e,maxMessages:n,...t!==void 0?{beforeSeq:t}:{}},a)}async function Bk(e,t,n=25,a){return await fe("mobile.readChat",{sessionId:e,...t!==void 0?{beforeSeq:t}:{},...n!==25?{maxRows:n}:{}},a)}async function cb(e,t){await fe("mobile.observe",e===void 0?{}:{sessionId:e},t)}var hC=200;async function jk(e,t){let n=e.filter(i=>i!=="").slice(0,hC);return n.length===0?[]:(await fe("mobile.previews",{sessionIds:n},t)).items}async function Oo(e,t){await fe("session.prompt",{sessionId:e,mode:"queue",content:t})}function Lf(e){let t=Array.isArray(e.message?.content)?e.message.content:[],n=t.length>0&&t.every(i=>i.type==="text"&&typeof i.text=="string"),a=n?t.map(i=>i.text).join(""):t.map(i=>i.type==="text"&&typeof i.text=="string"?i.text:`[${i.type??"内容"}]`).join(" ").trim();return{id:e.id,placement:e.placement,text:a,editable:n}}async function zf(e,t,n){await fe("session.updateQueue",{sessionId:e,itemId:t,action:n})}async function Gk(e){return(await fe("mobile.commands",{sessionId:e})).items??[]}async function Id(e,t){return await fe("mobile.commandExec",{sessionId:e,line:t},void 0,18e4)}async function Fk(e,t){return(await fe("mobile.transcribe",{audio:e,services:t},void 0,18e4)).text}async function Kk(){return(await fe("mobile.voiceServices",{})).services}async function ub(e){return await fe("mobile.usage",e===!0?{refresh:!0}:{})}async function Yk(e,t){return await fe("session.rename",{sessionId:e,title:t})}async function Qk(e){return await fe("session.cancel",{sessionId:e})}async function Xk(e){return await fe("subagent.list",{parentSessionId:e})}async function Dd(e){return await fe("session.models",{sessionId:e})}async function Hf(e,t){return await fe("session.selectModel",{sessionId:e,provider:t.provider,model:t.model,...t.reasoningEffort!==void 0?{reasoningEffort:t.reasoningEffort}:{}})}async function Zk(e){return await fe("mobile.pending",{sessionId:e})}async function Jk(e,t,n,a){await fe("mobile.respond",{rpcId:e,response:{sessionId:t,approvalId:n,outcome:a}})}async function $k(e,t,n){await fe("mobile.respond",{rpcId:e,response:{sessionId:t,answer:n}})}async function Wk(e){return await fe("mobile.listDirectory",e===void 0?{}:{path:e})}async function qf(e,t){return await fe("mobile.readFile",t===void 0?{path:e}:{path:e,sessionId:t})}async function eS(e){return await fe("workspace.create",{path:e})}async function tS(e,t){return await fe("workspace.rename",{workspaceId:e,title:t})}async function nS(e){return await fe("workspace.delete",{workspaceId:e})}async function Ld(e){return await fe("workspace.archiveSession",{sessionId:e})}async function aS(){return await fe("pair.devices",{})}async function iS(e){return await fe("pair.revoke",{deviceId:e})}async function rS(e,t){return await fe("pair.rename",{deviceId:e,name:t})}async function oS(e){return await fe("pair.setPrimary",{deviceId:e})}function et(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function De(e){return typeof e=="string"?e:void 0}function Yt(e){return typeof e=="number"&&Number.isFinite(e)?e:void 0}var bC=["pending","in_progress","completed"];function pb(e){if(!et(e))return;let t=e.todos;if(!Array.isArray(t))return;let n=[];for(let a of t){if(!et(a))return;let i=De(a.content),r=De(a.status);if(i===void 0||r===void 0||!bC.includes(r))return;n.push({content:i,status:r})}return n}function vC(e,t){if(t.type==="todo/write"){let n=pb(t.data);return n===void 0?e:{seq:t.seq,items:n}}if(t.type==="turn/end"&&e!==void 0)return{seq:e.seq,items:e.items.map(n=>n.status==="in_progress"?{...n,status:"completed"}:n)};if(t.type!=="turn/start")return e}function cS(e){let t;for(let n of e)t=vC(t,n);return t}function _o(e,t){return`${e}#${String(t)}`}function uS(e){return fS(e,"text")}function yC(e){if(!Array.isArray(e))return[];let t=[];for(let n of e){if(n===null||typeof n!="object")continue;let a=n;if(a.type!=="image")continue;let i=et(a.attachment)?a.attachment:a,r=De(i.attachmentId),o=De(i.mediaType);if(r===void 0||o===void 0)continue;let s=Yt(i.bytes),l=De(i.name);t.push({attachmentId:r,mediaType:o,width:Yt(i.width)??0,height:Yt(i.height)??0,...s===void 0?{}:{bytes:s},...l===void 0?{}:{name:l}})}return t}function xC(e){return fS(e,"reasoning")}function fS(e,t){if(!Array.isArray(e))return"";let n="";for(let a of e){if(!et(a)||a.type!==t)continue;let i=De(a.text);i!==void 0&&(n+=i)}return n}function wC(e){if(!Array.isArray(e))return[];let t=[];for(let n of e){if(!et(n))continue;let a=n.type;if(a!=="text"&&a!=="reasoning")continue;let i=De(n.text);i===void 0||i===""||t.push(a==="reasoning"?{kind:"reasoning",text:i}:{kind:"text",text:i})}return t}function kC(e){if(!et(e))return null;let t,n="text",a,i,r,o=e.chunk;if(et(o)){if(o.type!=="text-delta"&&o.type!=="reasoning-delta")return null;t=De(o.text),n=o.type==="reasoning-delta"?"reasoning":"text",i=Yt(e.turn),r=Yt(e.step),a=De(e.messageId)??De(e.id)}else t=De(e.text),n=De(e.kind)==="reasoning"?"reasoning":"text",a=De(e.messageId)??De(e.id),i=Yt(e.turn),r=Yt(e.step);if(t===void 0)return null;let s={text:t,kind:n};return a!==void 0&&(s.id=a),i!==void 0&&(s.turn=i),r!==void 0&&(s.step=r),s}function fb(e,t){let n=e===void 0?[]:[...e],a={messages:n,byId:new Map,pendingByTurnStep:new Map,turnStepMessage:new Map,messageTurn:new Map,toolNames:new Map,turnStarts:new Map,presented:new Map,maxSeq:t??-1};for(let i of n){if(i.seq>a.maxSeq&&(a.maxSeq=i.seq),a.byId.set(i.id,i),i.kind!=="assistant")continue;let r=pS(i.id),o=Io(i.turn,i.step)??(r===void 0?void 0:Io(r.turn,r.step));o!==void 0&&(a.turnStepMessage.set(o,i),i.pending===!0&&a.pendingByTurnStep.set(o,i)),i.turn!==void 0?a.messageTurn.set(i.id,i.turn):r!==void 0&&a.messageTurn.set(i.id,r.turn),i.tools!==void 0&&i.tools.length>0&&a.toolNames.set(i.id,new Set(i.tools.map(s=>s.name)))}return a}function Io(e,t){return e===void 0||t===void 0?void 0:`${e}.${t}`}function pS(e){if(!e.startsWith("assistant,"))return;let t=e.slice(10),n=t.indexOf("#"),a=n===-1?t:t.slice(0,n),i=a.indexOf(".");if(i<=0||i===a.length-1)return;let r=Number(a.slice(0,i)),o=Number(a.slice(i+1));if(!(!Number.isInteger(r)||!Number.isInteger(o)))return{turn:r,step:o}}function hi(e,t,n){let a=e.messages.indexOf(t);if(a===-1&&(a=e.messages.findIndex(i=>i.id===t.id),a===-1&&t.turn!==void 0))for(let i=e.messages.length-1;i>=0;i-=1){let r=e.messages[i];if(r!==void 0&&r.kind==="assistant"&&r.turn===t.turn){a=i;break}}a===-1?e.messages.push(n):e.messages[a]=n,e.byId.delete(t.id),e.byId.set(n.id,n)}function $s(e,t,n,a){t!==void 0&&(e.pendingByTurnStep.get(t)===n&&e.pendingByTurnStep.set(t,a),e.turnStepMessage.get(t)===n&&e.turnStepMessage.set(t,a))}function mb(e){let t=Io(e.turn,e.step);if(t!==void 0)return t;let n=pS(e.id);return n===void 0?void 0:Io(n.turn,n.step)}function SC(e,t){switch(t.seq>e.maxSeq&&(e.maxSeq=t.seq),t.type){case"user/message":NC(e,t);break;case"assistant/message":TC(e,t);break;case"assistant/chunk":case"message/chunk":IC(e,t);break;case"message/update":DC(e,t);break;case"message/delete":zC(e,t);break;case"turn/end":GC(e,t);break;case"tool/call":HC(e,t);break;case"tool/result":qC(e,t);break;case"turn/start":UC(e,t);break;case"deliverables/presented":BC(e,t);break;case"command/run":PC(e,t);break;case"command/done":VC(e,t);break;default:break}}function NC(e,t){let n=et(t.data)?t.data:{},a=De(n.id)??_o("user",t.seq),i=uS(n.content),r=yC(n.content),o=et(n.source)?n.source:{},s=De(o.kind),l=e.byId.get(a);if(l!==void 0){hi(e,l,{...l,...s!==void 0?{sourceKind:s}:{},...r.length>0?{images:r}:{},text:i,seq:t.seq,time:t.time});return}let d={id:a,kind:"user",text:i,...r.length>0?{images:r}:{},...s!==void 0?{sourceKind:s}:{},seq:t.seq,time:t.time};e.messages.push(d),e.byId.set(a,d)}function TC(e,t){let n=et(t.data)?t.data:{},a=et(n.message)?n.message:n,i=De(a.id)??De(n.id)??_o("assistant",t.seq),r=Yt(n.turn),o=Yt(n.step),s=uS(a.content),l=xC(a.content),d=Io(r,o),f=EC(n),v=e.byId.get(i);if(v===void 0&&d!==void 0&&(v=e.pendingByTurnStep.get(d)),v!==void 0){let w={...v,id:v.id.includes("#")?i:v.id,text:s,...l!==""?{reasoning:l}:{},flow:RC(v.flow,v.text,s,t.seq),...f!==void 0?{usage:f}:{},seq:t.seq,time:t.time,pending:!1,...o!==void 0?{step:o}:{}};if(hi(e,v,w),$s(e,d,v,w),r!==void 0&&e.messageTurn.set(w.id,r),v.id!==w.id){let x=e.toolNames.get(v.id);x!==void 0&&(e.toolNames.delete(v.id),e.toolNames.set(w.id,x)),e.messageTurn.delete(v.id),d!==void 0&&e.pendingByTurnStep.delete(d)}return}let g=wC(a.content),h={id:i,kind:"assistant",text:s,...g.length>0?{flow:g}:s!==""?{flow:[{kind:"text",text:s}]}:{},...l!==""?{reasoning:l}:{},...f!==void 0?{usage:f}:{},...r!==void 0?{turn:r}:{},...o!==void 0?{step:o}:{},seq:t.seq,time:t.time};if(e.messages.push(h),e.byId.set(i,h),d!==void 0&&(e.pendingByTurnStep.delete(d),e.turnStepMessage.set(d,h)),r!==void 0&&e.messageTurn.set(i,r),r!==void 0&&e.turnStepMessage.size>1)for(let[w,x]of e.turnStepMessage){if(x===h)continue;let A=Number(w.slice(0,w.indexOf(".")));Number.isInteger(A)&&A<r&&e.turnStepMessage.delete(w)}}function EC(e){let t=e.usage;if(!et(t))return;let n=Yt(t.inputTokens),a=Yt(t.outputTokens);if(n===void 0||a===void 0)return;let i={inputTokens:n,outputTokens:a},r=Yt(t.cacheReadTokens),o=Yt(t.cacheWriteTokens);return r!==void 0&&(i.cacheReadTokens=r),o!==void 0&&(i.cacheWriteTokens=o),i}function CC(e,t,n){if(e===void 0||e.length===0)return[{kind:"text",text:t,...n!==void 0?{seq:n}:{}}];let a=e[e.length-1];return a.kind==="text"&&(n===void 0||a.seq===void 0||a.seq===n)?[...e.slice(0,-1),{kind:"text",text:a.text+t,...a.seq!==void 0||n!==void 0?{seq:a.seq??n}:{}}]:[...e,{kind:"text",text:t,...n!==void 0?{seq:n}:{}}]}function MC(e,t){if(e===void 0||e.length===0)return[{kind:"reasoning",text:t}];let n=e[e.length-1];return n!==void 0&&n.kind==="reasoning"?[...e.slice(0,-1),{kind:"reasoning",text:n.text+t,...n.seq!==void 0?{seq:n.seq}:{}}]:[...e,{kind:"reasoning",text:t}]}function AC(e,t){return[...e??[],{kind:"tool",callId:t}]}function RC(e,t,n,a){if(n===t)return e??[];let i=(e??[]).filter(r=>r.kind!=="text");return n===""?i:[...i,{kind:"text",text:n,seq:a}]}function OC(e,t){if(e===void 0)return t;if(t===void 0)return e;let n=new Set;for(let a of[e,t])for(let i of a.replace(/^使用\s*/,"").split(" / ")){let r=i.trim();r!==""&&r!=="undefined"&&n.add(r)}return n.size===0?void 0:`使用 ${[...n].join(" / ")}`}function sS(e,t){return e===void 0||e.some(n=>n.kind!=="tool"&&n.seq!==void 0)?e:e.map(n=>n.kind==="tool"?n:{...n,seq:t})}function _C(e,t){if(e===void 0)return t??[];if(t===void 0)return e;let n=[...e],a=t[0];if(a!==void 0&&a.kind==="text"){let i=n[n.length-1];if(i!==void 0&&i.kind==="text"&&(i.seq===void 0||a.seq===void 0||i.seq===a.seq))return n[n.length-1]={kind:"text",text:i.text+(i.text!==""&&a.text!==""?`

`:"")+a.text,...i.seq!==void 0||a.seq!==void 0?{seq:i.seq??a.seq}:{}},[...n,...t.slice(1)]}return[...n,...t]}function lS(e,t){if(t===void 0)return{};let n=e.turnStarts.get(t);return{turn:t,...n!==void 0?{turnStartAt:n}:{}}}function IC(e,t){let n=kC(t.data);if(n===null)return;let a=Io(n.turn,n.step),i;if(n.id!==void 0?(i=e.byId.get(n.id),i===void 0&&a!==void 0&&(i=e.pendingByTurnStep.get(a)??e.turnStepMessage.get(a))):a!==void 0&&(i=e.pendingByTurnStep.get(a)??e.turnStepMessage.get(a)),i!==void 0&&i.kind==="assistant"){let s=n.kind==="reasoning"?{...i,reasoning:(i.reasoning??"")+n.text,seq:t.seq,time:t.time,flow:MC(i.flow,n.text)}:{...i,text:i.text+n.text,seq:t.seq,time:t.time,flow:CC(i.flow,n.text)};hi(e,i,s),$s(e,a,i,s);return}let r=n.id??_o(a!==void 0?`assistant,${a}`:"assistant",t.seq),o=n.kind==="reasoning"?{id:r,kind:"assistant",text:"",reasoning:n.text,seq:t.seq,time:t.time,firstSeenAt:t.time,pending:!0,flow:[{kind:"reasoning",text:n.text}],...lS(e,n.turn),...n.step!==void 0?{step:n.step}:{}}:{id:r,kind:"assistant",text:n.text,seq:t.seq,time:t.time,firstSeenAt:t.time,pending:!0,flow:[{kind:"text",text:n.text,seq:t.seq}],...lS(e,n.turn),...n.step!==void 0?{step:n.step}:{}};e.messages.push(o),e.byId.set(r,o),a!==void 0&&(e.pendingByTurnStep.set(a,o),e.turnStepMessage.set(a,o)),n.turn!==void 0&&e.messageTurn.set(r,n.turn)}function mS(e,t){let n=et(t.data)?t.data:{},a=De(n.id);if(a!==void 0){let r=e.byId.get(a);if(r!==void 0)return r}let i=Yt(n.seq??n.messageSeq);if(i!==void 0)return e.messages.find(r=>r.seq===i)}function DC(e,t){let n=mS(e,t);if(n===void 0)return;let a=et(t.data)?t.data:{},i=De(a.text),r={...n,...i!==void 0?{text:i}:{},seq:t.seq,time:t.time};hi(e,n,r),$s(e,mb(n),n,r)}function LC(e,t){let n=e.messages.indexOf(t);n!==-1&&e.messages.splice(n,1),e.byId.delete(t.id),e.messageTurn.delete(t.id),e.toolNames.delete(t.id);for(let[a,i]of e.turnStepMessage)i===t&&e.turnStepMessage.delete(a);for(let[a,i]of e.pendingByTurnStep)i===t&&e.pendingByTurnStep.delete(a)}function zC(e,t){let n=mS(e,t);n!==void 0&&LC(e,n)}function HC(e,t){let n=et(t.data)?t.data:{},a=De(n.name);if(a===void 0)return;let i=Yt(n.turn),r=Yt(n.step),o=Io(i,r),s=o===void 0?void 0:e.turnStepMessage.get(o);if(s===void 0&&o!==void 0){let m=_o(`assistant,${o}`,t.seq),b={id:m,kind:"assistant",text:"",seq:t.seq,time:t.time,firstSeenAt:t.time,pending:!0,turn:i,step:r};e.messages.push(b),e.byId.set(m,b),e.turnStepMessage.set(o,b),e.pendingByTurnStep.set(o,b),i!==void 0&&e.messageTurn.set(m,i),s=b}if(s===void 0&&i!==void 0)for(let m=e.messages.length-1;m>=0;m--){let b=e.messages[m];if(b!==void 0&&b.kind==="assistant"&&e.messageTurn.get(b.id)===i){s=b;break}}if(s===void 0&&i===void 0)for(let m=e.messages.length-1;m>=0;m--){let b=e.messages[m];if(b!==void 0&&b.kind==="assistant"){s=b;break}}if(s===void 0)return;let l=e.toolNames.get(s.id)??new Set,d=!l.has(a);d&&(l.add(a),e.toolNames.set(s.id,l));let f=De(n.callId)??`${a}#${String(t.seq)}`,v=De(n.arguments),g=gS(t.view),h=s.tools??[],w=h.findIndex(m=>m.callId===f),x=w===-1,A=x?[...h,{callId:f,name:a,state:"running",...v!==void 0?{arguments:v}:{},...g!==void 0?{view:g}:{}}]:h.map((m,b)=>b===w?{...m,...v!==void 0?{arguments:v}:{},...g!==void 0?{view:g}:{}}:m),p={...s,...d?{toolSummary:`使用 ${[...l].join(" / ")}`}:{},...x||v!==void 0?{tools:A}:{},...x?{flow:AC(s.flow,f)}:{},seq:t.seq,time:t.time};hi(e,s,p),$s(e,o,s,p)}function qC(e,t){let n=et(t.data)?t.data:{},a=et(n.message)?n.message:{},i=et(a.source)?a.source:{},r=De(i.callId);if(r===void 0)return;let o=gS(t.view),s=a.isError===!0||a.error!==void 0?"error":"ok";for(let l of e.messages){if(l.kind!=="assistant"||l.tools===void 0)continue;let d=l.tools.findIndex(g=>g.callId===r);if(d===-1)continue;let f=l.tools.map((g,h)=>h===d?{...g,state:s,...o!==void 0?{view:o}:{}}:g),v={...l,tools:f,seq:t.seq,time:t.time};hi(e,l,v),$s(e,mb(l),l,v);return}}function gS(e){if(!et(e))return;let t=e.view;if(!et(t)||t.card!=="diff")return;let n=t.diffs;if(!Array.isArray(n))return;let a=[];for(let r of n){if(!et(r))return;let o=De(r.path),s=De(r.newText);if(o===void 0||s===void 0)return;let l=r.oldText;a.push({path:o,oldText:typeof l=="string"?l:null,newText:s})}let i=De(t.title);return{card:"diff",...i!==void 0?{title:i}:{},diffs:a}}function PC(e,t){let n=et(t.data)?t.data:{},a=De(n.commandId)??_o("command",t.seq),i=e.byId.get(a);if(i!==void 0&&i.kind==="command"&&i.commandPhase!=="running")return;let r=De(n.name)??"",o=De(n.args)??"",s={id:a,kind:"command",text:"",commandLine:o===""?`/${r}`:`/${r} ${o}`,commandPhase:"running",seq:t.seq,time:t.time};i!==void 0?hi(e,i,s):(e.messages.push(s),e.byId.set(s.id,s))}function VC(e,t){let n=et(t.data)?t.data:{},a=De(n.commandId)??_o("command",t.seq),i=De(n.kind)==="error"?"error":"success",r=De(n.text)??"",o=e.byId.get(a),s=o!==void 0&&o.kind==="command"?o.commandLine:void 0,l=r!==""?r:s!==void 0?`${s} · 已执行`:"命令已执行",d={id:a,kind:"command",text:l,...s!==void 0?{commandLine:s}:{},commandPhase:i,seq:t.seq,time:t.time};o!==void 0?hi(e,o,d):(e.messages.push(d),e.byId.set(d.id,d))}function UC(e,t){let n=et(t.data)?t.data:{},a=Yt(n.turn);a!==void 0&&e.turnStarts.set(a,t.time)}function BC(e,t){let n=et(t.data)?t.data:{},a=Yt(n.turn),i=n.files;if(a===void 0||!Array.isArray(i))return;let r=e.presented.get(a)??[],o=new Set(r.map(l=>l.path)),s=[...r];for(let l of i){if(!et(l))continue;let d=De(l.path);if(d===void 0||o.has(d))continue;let f=De(l.description);o.add(d),s.push(f===void 0?{path:d}:{path:d,description:f})}s.length!==r.length&&e.presented.set(a,s)}function jC(e){let t=[],n=new Set;for(let a of e)for(let i of a.tools??[])for(let r of i.view?.diffs??[])n.has(r.path)||(n.add(r.path),t.push(r.path));return t}function GC(e,t){let n=et(t.data)?t.data:{},a=Yt(n.turn),i=et(n.reason)?n.reason:{},r=i.kind==="error",o=i.kind==="max-tokens",s=a===void 0?void 0:e.turnStarts.get(a),l=s===void 0?void 0:Math.max(0,t.time-s),d;if(a!==void 0?d=e.messages.filter(p=>p.kind==="assistant"&&e.messageTurn.get(p.id)===a):d=e.messages.filter(p=>p.kind==="assistant"),d.length===0)for(let p=e.messages.length-1;p>=0;p--){let m=e.messages[p];if(m!==void 0&&m.kind==="assistant"){d=[m];break}}for(let p of d){let m=p.pending===!0,b=(p.tools??[]).some(N=>N.state==="running"),y={...p,...b?{tools:(p.tools??[]).map(N=>N.state==="running"?{...N,state:"stopped"}:N)}:{},...m?{pending:!1}:{},...r?{failed:!0}:{},...o?{maxTokens:!0}:{},...l!==void 0?{durationMs:l}:{},...s!==void 0?{turnStartAt:s}:{},time:t.time};hi(e,p,y),$s(e,mb(p),p,y)}let f=a===void 0?void 0:e.presented.get(a),v=new Set((f??[]).map(p=>p.path)),g=jC(d).filter(p=>!v.has(p));if(!((f?.length??0)>0||g.length>0))return;let w=`turn-tail:${a??"last"}`,x={id:w,kind:"turn",text:"",seq:t.seq,time:t.time,...a!==void 0?{turn:a}:{},...l!==void 0?{durationMs:l}:{},...f!==void 0?{deliverables:f}:{},...g.length>0?{produced:g}:{}},A=e.byId.get(w);A!==void 0?hi(e,A,x):(e.messages.push(x),e.byId.set(w,x))}function qr(e,t){return new Fi(t).fold(e)}function hS(e){for(let t=e.length-1;t>=0;t--){let n=e[t]?.type;if(n==="turn/end")return;if(n==="turn/start")return e[t]?.time}}function FC(e){return e.kind==="user"&&e.sourceKind!==void 0&&e.sourceKind!=="user"&&!gb(e.sourceKind)}var KC=new Set(["agent-message","team-message","subagent-settled","webhook","schedule","tool-jobs","cordis-host-runner","goal"]);function gb(e){return KC.has(e)}var YC={"agent-message":"收到任务消息","team-message":"收到团队消息","subagent-settled":"子任务状态更新",webhook:"收到外部事件",schedule:"定时任务","tool-jobs":"后台任务状态更新","cordis-host-runner":"插件状态更新",goal:"继续执行目标"};function bS(e){return gb(e)?YC[e]:void 0}var QC={"agent-message":"📨","team-message":"👥","subagent-settled":"🧩",webhook:"🔔",schedule:"⏰","tool-jobs":"⚙️","cordis-host-runner":"🔌",goal:"🎯"};function vS(e){return gb(e)?QC[e]:void 0}function Ka(e){let t=[];for(let n of e){let a=t.length>0?t[t.length-1]:void 0;if(FC(n)){if(a!==void 0&&a.kind==="assistant")continue;t.push(n);continue}if(a!==void 0&&a.kind==="assistant"&&n.kind==="assistant"&&a.turn!==void 0&&n.turn!==void 0&&a.turn===n.turn){let i={...a,text:a.text+(a.text!==""&&n.text!==""?`

`:"")+n.text,...a.reasoning!==void 0||n.reasoning!==void 0?{reasoning:(a.reasoning??"")+((a.reasoning??"")!==""&&(n.reasoning??"")!==""?`

`:"")+(n.reasoning??"")}:{},...a.tools!==void 0||n.tools!==void 0?{tools:[...a.tools??[],...n.tools??[]]}:{},...a.flow!==void 0||n.flow!==void 0?{flow:_C(sS(a.flow,a.seq),sS(n.flow,n.seq))}:{},...a.toolSummary!==void 0||n.toolSummary!==void 0?{toolSummary:OC(a.toolSummary,n.toolSummary)}:{},startSeq:a.startSeq??a.seq,seq:n.seq,stepSeqs:[...a.stepSeqs??[a.startSeq??a.seq],n.seq],stepTexts:[...a.stepTexts??[a.text],n.text],time:n.time,pending:n.pending===!0,...n.failed===!0?{failed:!0}:{},...n.maxTokens===!0?{maxTokens:!0}:{},...n.usage!==void 0?{usage:n.usage}:{},...a.turnStartAt!==void 0||n.turnStartAt!==void 0?{turnStartAt:a.turnStartAt??n.turnStartAt}:{},...a.durationMs!==void 0||n.durationMs!==void 0?{durationMs:n.durationMs??a.durationMs}:{},...a.firstSeenAt!==void 0||n.firstSeenAt!==void 0?{firstSeenAt:a.firstSeenAt??n.firstSeenAt}:{}};t[t.length-1]=i}else t.push(n)}return t}var Fi=class{state;snapshotList;constructor(t,n){this.state=fb(t,n)}get lastSeq(){return this.state.maxSeq}fold(t){let n=[...t].sort((r,o)=>r.seq-o.seq),a=this.state.maxSeq,i=!1;for(let r of n)r.seq<=a||(SC(this.state,r),i=!0);return!i&&this.snapshotList!==void 0?this.snapshotList:(this.snapshotList=dS(this.state),this.snapshotList)}seed(t){this.state=fb(t),this.snapshotList=void 0}prepend(t){this.state=fb([...t,...this.state.messages]),this.snapshotList=void 0}snapshot(){return this.snapshotList!==void 0?this.snapshotList:(this.snapshotList=dS(this.state),this.snapshotList)}};function dS(e){let t=[...e.messages],n=!0;for(let a=1;a<t.length;a+=1){let i=t[a-1],r=t[a];if(i.seq>r.seq){n=!1;break}}return n?t:t.sort((a,i)=>a.seq-i.seq)}var bi=[],bb=0,yS=!1,hb=new Set;function kS(e){return hb.add(e),()=>{hb.delete(e)}}function xS(e){for(let t of hb)try{t(e)}catch{}}function wS(e,t=240){let n=e.replace(/\s+/g," ").trim();return n.length<=t?n:`${n.slice(0,t-1)}…`}function SS(e){let t=/([^\s()/\\]+):(\d+):(\d+)/.exec(e);return t===null?void 0:`${t[1]}:${t[2]}:${t[3]}`}function XC(e){if(typeof e!="string")return;let t=[];for(let n of e.split(`
`).slice(1)){let a=SS(n);if(a!==void 0&&!t.includes(a)&&t.push(a),t.length>=3)break}return t.length===0?void 0:t}function ZC(){return typeof performance>"u"?Date.now():performance.now()}function zd(e){let t=wS(e.message===""?"unknown error":e.message),n=e.source===void 0||e.source===""?void 0:wS(e.source,120);bb+=1;let a=bi.find(o=>o.kind===e.kind&&o.message===t&&o.source===n);if(a!==void 0){a.count+=1,bi.splice(bi.indexOf(a),1),bi.unshift(a),xS(a);return}let i={kind:e.kind,message:t,at:ZC(),count:1};n!==void 0&&(i.source=n);let r=XC(e.stack);r!==void 0&&(i.frames=r),bi.unshift(i),bi.length>20&&(bi.length=20),xS(i)}function JC(){return bi.map(e=>({...e,...e.frames===void 0?{}:{frames:[...e.frames]}}))}function Pf(){let e={};for(let t of bi)e[t.kind]=(e[t.kind]??0)+t.count;return{total:bb,kinds:e,recent:JC()}}function NS(){bi.length=0,bb=0}function $C(e){if(e instanceof Error)return{message:e.message===""?e.name:e.message,stack:e.stack};if(typeof e=="string")return{message:e};try{let t=JSON.stringify(e);return{message:typeof t=="string"?t:String(e)}}catch{return{message:Object.prototype.toString.call(e)}}}function TS(){yS||typeof window>"u"||(yS=!0,window.addEventListener("error",e=>{let t=e.target,n=t?.tagName;if(t!=null&&n!==void 0&&typeof n=="string"){let r=t,s=((r.src??r.href??"").split(/[?#]/)[0]??"").split("/").pop()??"";zd({kind:"resource",message:`${n.toLowerCase()} 加载失败`,source:s===""?void 0:s});return}let a=e.error,i=e.filename===void 0||e.filename===""?void 0:SS(`${e.filename}:${e.lineno??0}:${e.colno??0}`);zd({kind:"error",message:e.message??"",source:i,stack:a?.stack})},!0),window.addEventListener("unhandledrejection",e=>{let t=$C(e.reason);zd({kind:"rejection",message:t.message,stack:t.stack})}))}function WC(){if(!(typeof navigator>"u"))return navigator.storage}var Ya={persisted:!1},ES=!1;function CS(){return{...Ya}}async function eM(e){try{if(typeof e.persisted=="function"&&(Ya.persisted=await e.persisted()),typeof e.estimate=="function"){let t=await e.estimate();typeof t.usage=="number"&&(Ya.usage=t.usage),typeof t.quota=="number"&&(Ya.quota=t.quota)}Ya.at=Date.now(),delete Ya.note}catch{Ya.note="denied",Ya.at=Date.now()}}async function MS(){let e=WC();if(e===void 0){Ya={...Ya,note:"unsupported"};return}if(!ES){ES=!0;try{typeof e.persist=="function"&&(Ya.persisted=await e.persist())}catch{}await eM(e)}}var tM="dsh.palm.perf",nM=2048,Ws=[],Hd=[],qd=new Map,Pd=null;function aM(){try{if(typeof localStorage<"u"&&localStorage.getItem(tM)==="1")return!0}catch{}return!!(typeof location<"u"&&/\bperf=1\b/.test(location.search))}function el(){return Pd===null&&(Pd=aM()),Pd}function iM(){Pd=null}function rM(e){Ws.length>=nM&&Ws.shift(),Ws.push(e),e.stage==="recv"&&e.seq!==void 0&&(qd.size>=512&&qd.clear(),qd.set(e.seq,e.t))}function Uf(){return el()}function Bd(e,t={}){el()&&rM({t:performance.now(),stage:e,seq:t.seq,frame:t.frame,detail:t.detail})}function DS(e,t){el()&&(Hd.push({kind:e,at:performance.now(),detail:t}),Hd.length>256&&Hd.shift())}var AS=64,Vd=[],Ud=[],Pr=null,wb=0,kb=0,vb,RS=!1;function OS(e){Pr===null&&(Pr=e)}function oM(e){if(Pr===null)return;let t=Pr;Pr=null,wb+=Math.max(0,e-t),kb+=1,Ud.push({from:t,to:e}),Ud.length>32&&Ud.shift()}function sM(e){return Pr!==null&&e>=Pr?!0:Ud.some(t=>e>=t.from&&e<=t.to)}function lM(){RS||typeof document>"u"||(RS=!0,document.hidden&&OS(performance.now()),document.addEventListener("visibilitychange",()=>{document.hidden?OS(performance.now()):oM(performance.now())}))}function dM(){if(vb!==void 0)return;let e=globalThis.PerformanceObserver;if(e!==void 0)try{let t=new e(n=>{for(let a of n.getEntries())Vd.unshift({at:a.startTime,ms:a.duration,suspended:sM(a.startTime)});Vd.length>AS&&(Vd.length=AS)});t.observe({entryTypes:["longtask"]}),vb=t}catch{vb=void 0}}var yb=!1,Sb=0,Nb=0,Vf=0;function LS(){if(yb||!el())return;yb=!0,lM(),dM();let e=t=>{if(!el()){yb=!1;return}if(Vf!==0){let n=t-Vf;Sb+=1,n>50&&(Nb+=1)}Vf=t,requestAnimationFrame(e)};requestAnimationFrame(e)}function _S(e,t){return e.length===0?0:e[Math.min(e.length-1,Math.max(0,Math.ceil(e.length*t)-1))]}function xb(e,t){if(t.length===0)return{name:e,n:0,avg:0,p50:0,p95:0,max:0};let n=[...t].sort((a,i)=>a-i);return{name:e,n:t.length,avg:Math.round(t.reduce((a,i)=>a+i,0)/t.length*1e3)/1e3,p50:Math.round(_S(n,.5)*1e3)/1e3,p95:Math.round(_S(n,.95)*1e3)/1e3,max:Math.round(n[n.length-1]*1e3)/1e3}}function IS(e){let t=[];for(let n of Ws){if(n.stage!==e||n.seq===void 0)continue;let a=qd.get(n.seq);a!==void 0&&t.push(Math.max(0,n.t-a))}return t}function zS(){return{armed:el(),capturedAt:new Date().toISOString(),marks:[...Ws],anomalies:[...Hd],frames:{sampled:Sb,long:Nb},spansMs:{state:IS("state"),commit:IS("commit")},longTasks:[...Vd],suspension:{hiddenMs:Math.round(wb),hiddenCount:kb},errors:Pf(),storage:CS()}}function cM(){let e=zS();return{armed:e.armed,marks:e.marks.length,anomalies:e.anomalies,frames:e.frames,spans:{toState:xb("state",e.spansMs.state),toCommit:xb("commit",e.spansMs.commit)},longTasks:{...xb("longTask",e.longTasks.filter(t=>!t.suspended).map(t=>t.ms)),suspended:e.longTasks.filter(t=>t.suspended).length,recent:e.longTasks.slice(0,8)},suspension:e.suspension,errors:{total:e.errors.total,kinds:e.errors.kinds,recent:e.errors.recent.slice(0,5)},storage:e.storage}}function uM(){Ws.length=0,Hd.length=0,qd.clear(),Sb=0,Nb=0,Vf=0,Vd.length=0,Ud.length=0,Pr=null,wb=0,kb=0,NS(),Pd=null}function HS(){if(!(typeof window>"u"))try{let e={toJSON:zS,stats:cM,clear:uM,refresh:iM};window.__dshPalmPerf=e}catch{}}function fM(e){return new EventSource(e)}var pM=3e3,mM=12e3,gM=3,hM=6e4,bM=1e3,vM=50,yM=64,xM=new Set(["session/event","session/subscribed","approval/requested","approval/resolved","question/requested","question/resolved","session/queue","session/jobs","session/projection","session/added","session/removed","session/status","session/activity","session/error","stream/error"]);function wM(e){let t;try{t=JSON.parse(e)}catch{return}if(typeof t!="object"||t===null)return;let n=t;if(n.type!=="server-request"||typeof n.rpcId!="string"||typeof n.method!="string")return;let a=n.payload;if(typeof a!="object"||a===null)return;let i=a.type;if(!(typeof i!="string"||!xM.has(i))){if(i==="session/event"){let r=a.event;if(typeof r!="object"||r===null)return}return{frame:a,rpcId:n.rpcId}}}function kM(e){return e instanceof da?e.message==="HTTP 403"||e.message==="HTTP 401"||e.message.includes("unpaired"):!1}var Bf=class{sourceFactory;pollLatest;pollIntervalMs;stallThresholdMs;now;onUnpaired;listeners=new Set;cachedJobsBySession=new Map;cachedQueueBySession=new Map;runningSessionIds=new Set;source;stopped=!1;paused=!1;url;lastEventSeqBySession=new Map;observeSessionId;lastDataAt=0;sseAlive=!1;pollWatermark=new Map;tickTimer;polling=!1;nextPollAt=0;pollDelayMs;constructor(t="/m/api/events.mux",n={}){this.url=t,this.sourceFactory=n.sourceFactory??fM,this.pollLatest=n.pollLatest??((a,i)=>Gi(a,i,vM)),this.pollIntervalMs=n.pollIntervalMs??pM,this.pollDelayMs=this.pollIntervalMs,this.stallThresholdMs=n.stallThresholdMs??mM,this.now=n.now??(()=>Date.now()),this.onUnpaired=n.onUnpaired}start(){this.stopped=!1,this.paused=!1,this.lastDataAt=this.now(),this.source===void 0&&this.connect(),this.startTick()}stop(){this.stopped=!0,this.stopTick(),this.stopPolling(),this.closeSource(),this.observeSessionId=void 0,this.nextPollAt=0}pause(){this.stopped||this.paused||(this.paused=!0,this.stopTick(),this.stopPolling(),this.closeSource())}onFrame(t){return this.listeners.add(t),()=>{this.listeners.delete(t)}}isSseLive(){return!this.stopped&&!this.isSseStalled()}observe(t){let n=this.observeSessionId!==t;if(this.observeSessionId=t,t===void 0){this.stopPolling(),this.stopTick();return}if(this.startTick(),!this.paused){if(n){this.pollDelayMs=this.pollIntervalMs,this.nextPollAt=0;for(let a of this.pollWatermark.keys())a!==t&&this.pollWatermark.delete(a)}!this.polling&&!this.stopped&&this.isSseStalled()&&this.startPolling()}}poke(){this.stopped||this.paused||(this.pollDelayMs=this.pollIntervalMs,this.nextPollAt=0)}resync(){if(this.stopped)return;let t=this.paused;if(this.paused=!1,this.startTick(),t||this.now()-this.lastDataAt>this.stallThresholdMs){this.closeSource(),this.connect(),this.observeSessionId!==void 0&&this.startPolling();return}this.poke()}connect(){this.sseAlive=!1;let t=this.sourceFactory(this.url);this.source=t,t.onmessage=n=>{this.handleMessage(n.data)},t.onerror=()=>{if(this.stopped&&this.source===t){this.closeSource();return}this.sseAlive=!1,this.observeSessionId!==void 0&&this.startPolling()}}startTick(){if(this.tickTimer!==void 0)return;let t=Math.min(this.pollIntervalMs,bM);this.tickTimer=setInterval(()=>{this.tick()},t)}stopTick(){this.tickTimer!==void 0&&(clearInterval(this.tickTimer),this.tickTimer=void 0)}tick(){if(!this.stopped&&this.observeSessionId!==void 0){if(this.polling){this.now()>=this.nextPollAt&&(this.nextPollAt=Number.POSITIVE_INFINITY,this.pollTick());return}this.isSseStalled()&&this.startPolling()}}isSseStalled(){let t=this.sseAlive?this.stallThresholdMs*gM:this.stallThresholdMs;return this.now()-this.lastDataAt>t}startPolling(){this.polling||this.stopped||this.paused||(this.polling=!0,this.pollDelayMs=this.pollIntervalMs,this.nextPollAt=Number.POSITIVE_INFINITY,this.pollTick())}stopPolling(){this.polling=!1,this.pollDelayMs=this.pollIntervalMs,this.nextPollAt=0}async pollTick(){let t=this.observeSessionId;if(t===void 0){this.stopPolling();return}let n=0,a=i=>{let r=i?.event?.seq;return typeof r=="number"?r:-1};try{let i=this.pollWatermark.get(t)??-1,r=i>=0,o=i,s=Number.POSITIVE_INFINITY,l,d=[],f=!1;for(let v=0;v<10;v+=1){if(this.observeSessionId!==t){f=!0,d.length=0;break}let h=[...(l===void 0?await this.pollLatest(t):await this.pollLatest(t,l)).events].sort((A,p)=>a(A)-a(p)),w=0;for(let A of h){let p=a(A);p<=i||p>=s||(p>o&&(o=p),w+=1,d.push({seq:p,frame:{type:"session/event",sessionId:t,event:A.event}}))}n+=w;let x=h.length>0?a(h[0]??{event:void 0}):-1;if(w===0||x===-1||!r){f=!0;break}if(x<=i+1){f=!0;break}s=x,l=x}f?this.pollWatermark.set(t,o):console.warn(`poll gap refill hit the 10-page cap; events above seq ${i} will be re-fetched next poll`),d.sort((v,g)=>v.seq-g.seq);for(let v of d)this.emit(v.frame)}catch(i){if(kM(i)){this.stop(),this.onUnpaired?.();return}}finally{n>0?this.pollDelayMs=this.pollIntervalMs:this.pollDelayMs=Math.min(hM,this.pollDelayMs+this.pollIntervalMs),this.polling&&this.observeSessionId===t&&(this.nextPollAt=this.now()+this.pollDelayMs)}}handleMessage(t){if(typeof t!="string"||t==="")return;let n=wM(t);if(n===void 0)return;let a=n.frame,i=a.event?.seq;if(Uf()&&(Bd("recv",{seq:typeof i=="number"?i:void 0,frame:a.type}),a.type==="session/event"&&typeof i=="number")){let r=a.sessionId;if(r!==void 0){let o=this.lastEventSeqBySession.get(r);o!==void 0&&i>o+1&&DS("seq-gap",`session=${r} last=${o} got=${i}`),this.lastEventSeqBySession.set(r,i)}}this.sseAlive=!0,this.lastDataAt=this.now(),this.polling&&this.stopPolling(),a.type==="session/jobs"&&this.rememberJobs(a),a.type==="session/queue"&&this.rememberQueue(a),a.type==="session/subscribed"&&this.rememberSubscribed(a),this.trackTurnState(a),this.emit(a,n.rpcId)}trackTurnState(t){if(t.type!=="session/event")return;let a=t.event?.type,i=String(t.sessionId);a==="turn/start"?this.runningSessionIds.add(i):a==="turn/end"&&this.runningSessionIds.delete(i)}runningSessionsSnapshot(){return[...this.runningSessionIds]}rememberJobs(t){let n=String(t.sessionId);if(this.cachedJobsBySession.size>=yM&&!this.cachedJobsBySession.has(n)){let a=this.cachedJobsBySession.keys().next().value;a!==void 0&&this.cachedJobsBySession.delete(a)}this.cachedJobsBySession.set(n,t.jobs)}cachedJobsFor(t){return this.cachedJobsBySession.get(t)}jobsSnapshot(){let t=[];for(let[n,a]of this.cachedJobsBySession)t.push({sessionId:n,jobs:a});return t}liveJobCount(){let t=0;for(let n of this.cachedJobsBySession.values())for(let a of n)(a.status==="running"||a.status==="stopping")&&(t+=1);return t}rememberQueue(t){let n=String(t.sessionId),a=(t.items??[]).map(i=>Lf({id:String(i.id),placement:i.placement,message:i.message}));this.cachedQueueBySession.set(n,a)}rememberSubscribed(t){let n=String(t.sessionId);this.cachedQueueBySession.delete(n),this.cachedJobsBySession.delete(n)}cachedQueueFor(t){return this.cachedQueueBySession.get(t)}emit(t,n){for(let a of this.listeners)try{a(t,n)}catch{}}closeSource(){let t=this.source;if(this.source=void 0,t!==void 0){t.onmessage=null,t.onerror=null;try{t.close()}catch{}}}};var qS="dsh.palm.fontScale",PS="dsh.palm.density",VS="dsh.palm.lineNumbers",US="dsh.palm.autoScroll";function jd(e){try{let t=localStorage.getItem(e);return t===""?void 0:t??void 0}catch{return}}function Gd(e,t){try{localStorage.setItem(e,t)}catch{}}function Tb(){let e=jd(qS);return e==="small"||e==="large"?e:"standard"}function BS(e){Gd(qS,e),Vr()}var jS={small:"小",standard:"标准",large:"大"};function Eb(){return jd(PS)==="compact"?"compact":"cozy"}function GS(e){Gd(PS,e),Vr()}var FS={compact:"紧凑",cozy:"舒适"};function Cb(){return jd(VS)==="1"}function KS(e){Gd(VS,e?"1":"0"),Vr()}function jf(){return jd(US)!=="0"}function YS(e){Gd(US,e?"1":"0")}function Vr(){if(typeof document>"u")return;let e=document.documentElement,t=Tb();t==="standard"?delete e.dataset.fontScale:e.dataset.fontScale=t;let n=Eb();n==="cozy"?delete e.dataset.density:e.dataset.density=n,Cb()?e.dataset.lineNumbers="1":delete e.dataset.lineNumbers}var QS="dsh.palm.haptics";function Mb(){return jd(QS)!=="0"}function XS(e){Gd(QS,e?"1":"0")}function ZS(){if(Mb())try{typeof navigator<"u"&&typeof navigator.vibrate=="function"&&navigator.vibrate(15)}catch{}}var SM="/m/api/events.notify",tl,$S=!1;function nl(){return typeof Notification<"u"}function WS(){return nl()?Notification.permission:"unsupported"}async function e2(){return nl()?await Notification.requestPermission():"unsupported"}function Fd(){return typeof navigator<"u"&&typeof navigator.serviceWorker<"u"&&typeof PushManager<"u"}async function t2(){return Fd()?await(await navigator.serviceWorker.ready).pushManager.getSubscription()??void 0:void 0}async function n2(){if(!Fd()||Notification.permission!=="granted")return!1;let e=await Od();if(e.vapidPublicKey===void 0)return!1;let n=await(await navigator.serviceWorker.ready).pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:NM(e.vapidPublicKey)}),a=n.getKey("p256dh"),i=n.getKey("auth");return await _k({endpoint:n.endpoint,keys:{p256dh:a!==null?JS(a):"",auth:i!==null?JS(i):""}}),!0}async function a2(){if(!Fd())return;let t=await(await navigator.serviceWorker.ready).pushManager.getSubscription();t!==null&&await t.unsubscribe(),await Ik()}function NM(e){let t="=".repeat((4-e.length%4)%4),n=(e+t).replace(/-/g,"+").replace(/_/g,"/"),a=atob(n),i=new Uint8Array(a.length);for(let r=0;r<a.length;r++)i[r]=a.charCodeAt(r);return i}function JS(e){let t=new Uint8Array(e),n="";for(let a of t)n+=String.fromCharCode(a);return btoa(n).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}function Kd(){tl!==void 0||!nl()||Notification.permission==="granted"&&(typeof document<"u"&&document.visibilityState==="visible"||($S=!0,tl=new EventSource(SM),tl.onmessage=e=>{try{let t=JSON.parse(e.data);if(t.type!=="notify")return;EM(t.payload)}catch{}},tl.onerror=()=>{}))}function i2(){tl?.close(),tl=void 0,$S=!1}function TM(e){let t=new URL("/m/",window.location.origin);return e.workspaceId!==void 0&&t.searchParams.set("workspace",e.workspaceId),t.searchParams.set("session",e.sessionId),t.toString()}function EM(e){if(document.visibilityState==="visible")return;ZS();let t=new Notification(e.title,{body:e.body,tag:e.id,data:{sessionId:e.sessionId,workspaceId:e.workspaceId}});t.onclick=()=>{t.close(),window.focus(),window.location.href=TM(e)}}var Gf=K(Fe(),1);function r2(){return typeof document>"u"||document.visibilityState!=="hidden"}function CM(e){if(typeof document>"u")return()=>{};let t=()=>{e(r2())};return document.addEventListener("visibilitychange",t),()=>{document.removeEventListener("visibilitychange",t)}}function Ff(){let[e,t]=(0,Gf.useState)(r2);return(0,Gf.useEffect)(()=>CM(t),[]),e}var o2="dsh.remote.theme",MM="theme-color",AM="#f5f5f7",RM="#0a0a0f",Do=OM()??"system",Kf=new Set;function OM(){try{let e=localStorage.getItem(o2);return e==="dark"||e==="light"||e==="system"?e:void 0}catch{return}}function _M(e){try{localStorage.setItem(o2,e)}catch{}}function IM(){return typeof window<"u"&&typeof window.matchMedia=="function"&&window.matchMedia("(prefers-color-scheme: dark)").matches}function Ab(e=Do){return e==="system"?IM()?"dark":"light":e}function Rb(e){if(typeof document>"u")return;document.documentElement.dataset.theme=e;let t=document.querySelector(`meta[name="${MM}"]`);t!==null&&(t.content=Ab(e)==="dark"?RM:AM)}var s2={media:void 0,onChange:void 0,sync(){let e=Do==="system"&&typeof window<"u"&&typeof window.matchMedia=="function";e&&this.media===void 0?(this.media=window.matchMedia("(prefers-color-scheme: dark)"),this.onChange=()=>{Rb(Do);for(let t of[...Kf])t()},typeof this.media.addEventListener=="function"?this.media.addEventListener("change",this.onChange):typeof this.media.addListener=="function"&&this.media.addListener(this.onChange)):!e&&this.media!==void 0&&(typeof this.media.removeEventListener=="function"&&this.onChange!==void 0&&this.media.removeEventListener("change",this.onChange),this.media=void 0,this.onChange=void 0)}};function l2(){return Do}function d2(){return Ab()}function Yf(e){return Kf.add(e),()=>{Kf.delete(e)}}function Qf(e){if(e!==Do){Do=e,_M(e),s2.sync(),Rb(e);for(let t of[...Kf])t()}}function c2(){let e=Ab()==="light"?"dark":"light";return Qf(e),e}function Xf(e){Qf(e)}function u2(){s2.sync(),Rb(Do)}var vi=new Map;function g2(e){for(let[t,n]of vi){let a=n.rows.filter(i=>i.sessionId!==e);a.length!==n.rows.length&&(vi.set(t,{...n,rows:a}),Db(t,{rows:a,cursor:n.cursor,hasMore:n.hasMore}))}Lo(e),Pb(e)}var Qd="dsh-palm.list.v1.",h2="dsh-palm.prev.v1",_b="dsh-palm.scroll.v1.",al="dsh-palm.draft.v1.",il="dsh-palm.reading.v2.",b2="dsh-palm.reading.v1.",Zf="dsh-palm.cache-index.v1",v2=1440*60*1e3,DM=500,LM=512*1024;function Ib(){return h2}function Ma(e){if(e!==null)try{return JSON.parse(e)}catch{return}}function rl(e,t){try{localStorage.setItem(e,t),zM(e)}catch{}}function zM(e){try{let t=Ma(localStorage.getItem(Zf))??[];if(t.includes(e))return;t.push(e),localStorage.setItem(Zf,JSON.stringify(t))}catch{}}function Xd(){return Ma(Aa(Zf))??[]}function ol(e){if(e.length!==0){for(let t of e)try{localStorage.removeItem(t)}catch{}try{let t=Xd().filter(n=>!e.includes(n));localStorage.setItem(Zf,JSON.stringify(t))}catch{}}}function Ki(){return typeof localStorage<"u"}function Aa(e){try{return localStorage.getItem(e)}catch{return null}}var HM=5e3,Yd=new Map,Ur,f2=!1;function qM(){f2||typeof document>"u"||(f2=!0,document.addEventListener("pagehide",()=>{Ob()}),document.addEventListener("visibilitychange",()=>{document.visibilityState==="hidden"&&Ob()}))}function y2(e,t){Yd.set(e,t),qM(),Ur===void 0&&(Ur=setTimeout(()=>{Ob()},HM))}function Ob(){if(Ur!==void 0&&(clearTimeout(Ur),Ur=void 0),Yd.size===0)return;let e=[...Yd.values()];Yd.clear();for(let t of e)t()}function PM(){Ur!==void 0&&(clearTimeout(Ur),Ur=void 0),Yd.clear()}function Db(e,t){y2(`${Qd}${e}`,()=>{VM(e,t)})}function x2(e){if(e.size===0)return;let t=new Map(e);y2(Ib(),()=>{UM(t)})}function w2(e){if(!Ki())return;let t=Ma(Aa(Qd+e));if(!(t===void 0||t.v!==1||!Array.isArray(t.rows))&&!t.rows.some(n=>n===null||typeof n!="object"||typeof n.sessionId!="string")&&!(Date.now()-t.savedAt>v2))return t}function VM(e,t){rl(Qd+e,JSON.stringify({v:1,...t,savedAt:Date.now()}))}function k2(e){if(!Ki())return 0;let t=Number(Aa(_b+e)??"");return Number.isFinite(t)&&t>0?t:0}function S2(e,t){rl(_b+e,String(Math.max(0,t)))}function N2(){let e=new Map;if(!Ki())return e;let t=Ma(Aa(Ib()));if(t===void 0)return e;for(let[n,a]of Object.entries(t))typeof n!="string"||typeof a!="string"||a===""||e.set(n,a);return e}function UM(e){if(!Ki()||e.size===0)return;let t={};for(let[a,i]of e)t[a]=i;let n=JSON.stringify(t);for(;Object.keys(t).length>DM||n.length>LM;){let a=Object.keys(t)[0];if(a===void 0)break;delete t[a],n=JSON.stringify(t)}rl(Ib(),n)}var Lb="dsh-palm.pin.v1";function T2(){if(!Ki())return new Set;let e=Ma(Aa(Lb));return Array.isArray(e)?new Set(e.filter(t=>typeof t=="string")):new Set}function E2(e){rl(Lb,JSON.stringify([...e]))}var C2=10080*60*1e3,BM=4096,p2=50;function M2(e){if(!Ki())return"";let t=Ma(Aa(al+e));return t===void 0||typeof t.v!="string"||Date.now()-t.t>C2?"":t.v}function zb(e,t){if(t===""){Lo(e);return}rl(al+e,JSON.stringify({t:Date.now(),v:t.slice(0,BM)})),jM()}function Lo(e){ol([al+e])}function jM(){let e=Xd().filter(n=>n.startsWith(al));if(e.length<=p2)return;let t=e.map(n=>({key:n,t:Ma(Aa(n))?.t??0})).sort((n,a)=>n.t-a.t);ol(t.slice(0,e.length-p2).map(n=>n.key))}var A2=10080*60*1e3,m2=50;function Hb(e){if(!Ki())return;let t=Ma(Aa(il+e));if(!(t===void 0||typeof t.v!="number"||t.v<=0)&&!(Date.now()-t.t>A2))return t.v}function qb(e,t){t<=0||(rl(il+e,JSON.stringify({t:Date.now(),v:t})),GM())}function Pb(e){ol([il+e])}function GM(){let e=Xd().filter(n=>n.startsWith(il));if(e.length<=m2)return;let t=e.map(n=>({key:n,t:Ma(Aa(n))?.t??0})).sort((n,a)=>n.t-a.t);ol(t.slice(0,e.length-m2).map(n=>n.key))}function Vb(){if(!Ki())return;PM();let e=Xd().filter(t=>t.startsWith(Qd)||t.startsWith(_b)||t.startsWith(al)||t.startsWith(il)||t.startsWith(b2)||t===h2||t===Lb);ol(e)}function R2(){if(!Ki())return;let e=Date.now(),t=Xd().filter(n=>{if(n.startsWith(b2))return!0;if(n.startsWith(Qd)){let a=Ma(Aa(n));return a===void 0||e-a.savedAt>v2}if(n.startsWith(al)){let a=Ma(Aa(n));return a===void 0||e-a.t>C2}if(n.startsWith(il)){let a=Ma(Aa(n));return a===void 0||e-a.t>A2}return!1});ol(t)}var FM="dsh-palm",KM=2,Ra="history",YM=1440*60*1e3,O2=50;function Ub(){return new Promise((e,t)=>{if(typeof indexedDB>"u"){t(new Error("indexedDB unavailable"));return}let n=indexedDB.open(FM,KM);n.onupgradeneeded=()=>{let a=n.result;a.objectStoreNames.contains("outbox")||a.createObjectStore("outbox",{keyPath:"id"}),a.objectStoreNames.contains(Ra)||a.createObjectStore(Ra,{keyPath:"key"})},n.onsuccess=()=>{e(n.result)},n.onerror=()=>{t(n.error??new Error("indexedDB open failed"))}})}async function _2(e){try{let t=await Ub();try{let n=await new Promise((a,i)=>{let r=t.transaction(Ra,"readonly").objectStore(Ra).get(e);r.onsuccess=()=>{a(r.result)},r.onerror=()=>{i(r.error??new Error("indexedDB read failed"))}});return n===void 0||n.v!==1||Date.now()-n.savedAt>YM?void 0:n.page}finally{t.close()}}catch{return}}async function I2(e,t){let n=!1;try{let a=await Ub();try{await new Promise((i,r)=>{let o=a.transaction(Ra,"readwrite");o.objectStore(Ra).put({key:e,v:1,savedAt:Date.now(),page:t}),o.oncomplete=()=>{i()},o.onerror=()=>{r(o.error??new Error("indexedDB write failed"))},o.onabort=()=>{r(o.error??new Error("indexedDB write aborted"))}}),await QM(a),n=!0}finally{a.close()}}catch{}n&&MS()}async function QM(e){try{let t=await new Promise((a,i)=>{let r=e.transaction(Ra,"readonly").objectStore(Ra).getAll();r.onsuccess=()=>{let o=r.result??[];a(o.map(s=>({key:s.key,savedAt:s.savedAt})))},r.onerror=()=>{i(r.error??new Error("indexedDB read failed"))}});if(t.length<=O2)return;let n=t.sort((a,i)=>a.savedAt-i.savedAt).slice(0,t.length-O2).map(a=>a.key);await new Promise((a,i)=>{let r=e.transaction(Ra,"readwrite"),o=r.objectStore(Ra);for(let s of n)o.delete(s);r.oncomplete=()=>{a()},r.onerror=()=>{i(r.error??new Error("indexedDB trim failed"))},r.onabort=()=>{i(r.error??new Error("indexedDB trim aborted"))}})}catch{}}async function Bb(){try{let e=await Ub();try{await new Promise((t,n)=>{let a=e.transaction(Ra,"readwrite");a.objectStore(Ra).clear(),a.oncomplete=()=>{t()},a.onerror=()=>{n(a.error??new Error("indexedDB clear failed"))},a.onabort=()=>{n(a.error??new Error("indexedDB clear aborted"))}})}finally{e.close()}}catch{}}var XM=2e3;function D2({send:e,delayMs:t=XM}){let n=new Set,a=[],i,r=!1,o=()=>{i=void 0;let d=a;a=[];for(let f of d)if(!n.has(f)){n.add(f);try{e(f)}catch{}}},s=()=>{r||(i!==void 0&&clearTimeout(i),i=setTimeout(o,t))},l=kS(d=>{n.has(d)||(a.includes(d)||a.push(d),s())});return()=>{r=!0,l(),i!==void 0&&clearTimeout(i),i=void 0}}var $f=K(Fe(),1),Fb=K(re(),1),$M=2200,WM=200,sl=[],Gb=new Set,e8=1;function jb(){for(let e of[...Gb])e([...sl])}function Y(e){let t=e8++;sl.push({id:t,text:e,leaving:!1}),jb(),setTimeout(()=>{let n=sl.find(a=>a.id===t);n!==void 0&&(n.leaving=!0,jb(),setTimeout(()=>{let a=sl.findIndex(i=>i.id===t);a!==-1&&(sl.splice(a,1),jb())},WM))},$M)}function q2(){let[e,t]=(0,$f.useState)(sl);return(0,$f.useEffect)(()=>(Gb.add(t),()=>{Gb.delete(t)}),[]),e.length===0?null:(0,Fb.jsx)("div",{className:"toast-host",role:"status","aria-live":"polite",children:e.map(n=>(0,Fb.jsx)("div",{className:"toast"+(n.leaving?" toast-out":""),children:n.text},n.id))})}var S=K(Fe(),1);var t8=new Set(["image/jpeg","image/png","image/webp","image/gif"]);function n8(e){return t8.has(e)}var Wf=4,P2=256*1024,a8=1600;function i8(e,t){let n=/^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/s.exec(e);if(n)return{type:"image",mediaType:n[1],data:n[2],name:t}}function Kb(e,t){let n=[];e.trim()!==""&&n.push({type:"text",text:e});for(let a of t){let i=i8(a.dataUrl,a.name);i!==void 0&&n.push(i)}return n}async function V2(e,t=P2){let n=await r8(e);if(!n8(e.type))return{image:{dataUrl:n,mediaType:e.type,name:e.name},failed:!0};try{return{image:{dataUrl:await s8(n,e.type,t),mediaType:"image/jpeg",name:e.name},failed:!1}}catch{return{image:{dataUrl:n,mediaType:e.type,name:e.name},failed:!0}}}function r8(e){return new Promise((t,n)=>{let a=new FileReader;a.onload=()=>t(String(a.result??"")),a.onerror=()=>n(a.error??new Error("read failed")),a.readAsDataURL(e)})}function o8(){return new Promise(e=>{setTimeout(e,0)})}function s8(e,t,n=P2){return new Promise((a,i)=>{let r=new Image;r.onload=async()=>{try{let o=document.createElement("canvas"),s=o.getContext("2d");if(s===null){i(new Error("canvas 2d unavailable"));return}let l=Math.max(r.width,r.height),d=Math.min(1,a8/l),f=Math.max(1,Math.round(r.width*d)),v=Math.max(1,Math.round(r.height*d)),g=.9,h=e;for(;;){o.width=f,o.height=v,s.clearRect(0,0,f,v),s.drawImage(r,0,0,f,v);let w=o.toDataURL("image/jpeg",g);if(w.length<=n||f<=16||v<=16){h=w;break}g>.5?g-=.1:(f=Math.max(16,Math.round(f*.9)),v=Math.max(16,Math.round(v*.9))),await o8()}a(h)}catch(o){i(o)}},r.onerror=()=>i(new Error("image decode failed")),r.src=e})}function U2(e,t=Wf){let n=e?.items;if(n===void 0)return[];let a=[];for(let i=0;i<n.length&&a.length<t;i++){let r=n[i];if(r.kind==="file"&&r.type.startsWith("image/")){let o=r.getAsFile();o!==null&&a.push(o)}}return a}var l8=new Set;function ep(e=64){let t=new Map;return{store:t,note(n,a){let i=t.get(n);for(i===void 0&&(i=new Set,t.set(n,i)),i.add(a);i.size>e;){let r=i.values().next().value;if(r===void 0)break;i.delete(r)}},forSession(n){return t.get(n)??l8},clear(){t.clear()}}}var B2=ep();function j2(e,t){B2.note(e,t)}function Yb(e){return B2.forSession(e)}function G2(e){if(e.length===0)return[];let t=e[e.length-1].rpcId;return e.filter(n=>n.rpcId===t)}function F2(e,t,n){let a=t.filter(r=>!n.has(r.rpcId));if(a.length>0)return a;let i=e.filter(r=>!n.has(r.rpcId));return i.length===e.length?e:i}var K2=ep();function Y2(e,t){K2.note(e,t)}function Qb(e){return K2.forSession(e)}function Q2(e,t,n){let a=t.filter(r=>!n.has(r.approvalId));if(a.length>0)return a;let i=e.filter(r=>!n.has(r.approvalId));return i.length===e.length?e:i}var ec=K(Fe(),1);var yi=K(Fe(),1),Br=K(re(),1),d8=80,c8=40;function ht({title:e,onClose:t,children:n}){let[a,i]=(0,yi.useState)(0),[r,o]=(0,yi.useState)(!1),s=(0,yi.useRef)(!1),l=(0,yi.useRef)(0),d=(0,yi.useRef)(0);return(0,yi.useEffect)(()=>{let f=v=>{v.key==="Escape"&&t()};return window.addEventListener("keydown",f),()=>{window.removeEventListener("keydown",f)}},[t]),(0,yi.useEffect)(()=>{let f=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{document.body.style.overflow=f}},[]),(0,Br.jsx)("div",{className:"sheet-backdrop",onClick:t,children:(0,Br.jsxs)("div",{className:"sheet"+(r?" sheet-full":""),role:"dialog","aria-modal":"true","aria-label":e,style:a>0?{transform:`translateY(${a}px)`,transition:"none"}:void 0,onClick:f=>{f.stopPropagation()},children:[(0,Br.jsxs)("div",{className:"sheet-grab",onTouchStart:f=>{s.current=!0,d.current=0,l.current=f.touches[0]?.clientY??0},onTouchMove:f=>{if(!s.current)return;let v=(f.touches[0]?.clientY??0)-l.current;d.current=v,i(r?Math.max(0,v):v)},onTouchEnd:()=>{if(!s.current)return;s.current=!1;let f=d.current;d.current=0,f>d8?t():!r&&f<-c8&&o(!0),i(0)},children:[(0,Br.jsx)("div",{className:"sheet-handle","aria-hidden":!0,onClick:()=>{t()}}),(0,Br.jsx)("div",{className:"sheet-title",children:e})]}),(0,Br.jsx)("div",{className:"sheet-body",children:n})]})})}var u8=K(Fe(),1);var V=K(re(),1);function ze(e){return{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.8,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,focusable:!1,...e}}function Yi(e){return(0,V.jsxs)("svg",{...ze(e),children:[(0,V.jsx)("circle",{cx:"11",cy:"11",r:"7"}),(0,V.jsx)("path",{d:"m20 20-3.8-3.8"})]})}function X2(e){return(0,V.jsxs)("svg",{...ze(e),children:[(0,V.jsx)("path",{d:"M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"}),(0,V.jsx)("path",{d:"M10 19a2 2 0 0 0 4 0"})]})}function tp(e){return(0,V.jsxs)("svg",{...ze(e),children:[(0,V.jsx)("path",{d:"M12 17v5"}),(0,V.jsx)("path",{d:"M9 3h6l-1 7 3.5 3H5.5L9 10Z"})]})}function Z2(e){return(0,V.jsxs)("svg",{...ze(e),children:[(0,V.jsx)("circle",{cx:"12",cy:"12",r:"9"}),(0,V.jsx)("path",{d:"M12 7v5l3.5 2"})]})}function J2(e){return(0,V.jsx)("svg",{...ze(e),children:(0,V.jsx)("path",{d:"M3 7.5A2.5 2.5 0 0 1 5.5 5h4l2 2.5h7A2.5 2.5 0 0 1 21 10v7a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17Z"})})}function $2(e){return(0,V.jsxs)("svg",{...ze(e),children:[(0,V.jsx)("path",{d:"M3 7.5A2.5 2.5 0 0 1 5.5 5h4l2 2.5h7A2.5 2.5 0 0 1 21 10v7a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17Z"}),(0,V.jsx)("path",{d:"M12 10.5v5M9.5 13h5"})]})}function W2(e){return(0,V.jsx)("svg",{...ze(e),children:(0,V.jsx)("path",{d:"M21 12a8 8 0 0 1-8 8H4l2.2-3.3A8 8 0 1 1 21 12Z"})})}function ll(e){return(0,V.jsx)("svg",{...ze(e),strokeWidth:2.2,children:(0,V.jsx)("path",{d:"M12 5v14M5 12h14"})})}function Zd(e){return(0,V.jsx)("svg",{...ze(e),children:(0,V.jsx)("path",{d:"m6 14 6-6 6 6"})})}function Xb(e){return(0,V.jsx)("svg",{...ze(e),children:(0,V.jsx)("path",{d:"m6 10 6 6 6-6"})})}function eN(e){return(0,V.jsx)("svg",{...ze(e),strokeWidth:2,children:(0,V.jsx)("path",{d:"M5 12h13M13 6.5 18.5 12 13 17.5"})})}function np(e){return(0,V.jsxs)("svg",{...ze(e),children:[(0,V.jsx)("path",{d:"M3 13.5 5.7 5.6A1.5 1.5 0 0 1 7.1 4.5h9.8a1.5 1.5 0 0 1 1.4 1.1L21 13.5V18a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18Z"}),(0,V.jsx)("path",{d:"M3 13.5h5l1 2h6l1-2h5"})]})}function Zb(e){return(0,V.jsxs)("svg",{...ze(e),children:[(0,V.jsx)("path",{d:"M4 8h10M18 8h2M4 16h4M12 16h8"}),(0,V.jsx)("circle",{cx:"16",cy:"8",r:"2.2"}),(0,V.jsx)("circle",{cx:"10",cy:"16",r:"2.2"})]})}function tN(e){return(0,V.jsxs)("svg",{...ze(e),children:[(0,V.jsx)("circle",{cx:"12",cy:"12",r:"9"}),(0,V.jsx)("path",{d:"M12 3a9 9 0 0 1 0 18Z",fill:"currentColor",stroke:"none"})]})}function nN(e){return(0,V.jsxs)("svg",{...ze(e),children:[(0,V.jsx)("circle",{cx:"12",cy:"12",r:"9"}),(0,V.jsx)("path",{d:"M9.6 9.2a2.5 2.5 0 1 1 3.4 2.9c-.7.3-1 .8-1 1.6"}),(0,V.jsx)("path",{d:"M12 17h.01"})]})}function ap(e){return(0,V.jsxs)("svg",{...ze(e),children:[(0,V.jsx)("path",{d:"M4 7h16M9 7V5h6v2M6.5 7l1 12.2a1.5 1.5 0 0 0 1.5 1.3h6a1.5 1.5 0 0 0 1.5-1.3l1-12.2"}),(0,V.jsx)("path",{d:"M10 11v5M14 11v5"})]})}function aN(e){return(0,V.jsx)("svg",{...ze(e),children:(0,V.jsx)("path",{d:"M5 19 11 5h2l6 14M7.5 14h9"})})}function iN(e){return(0,V.jsxs)("svg",{...ze(e),children:[(0,V.jsx)("rect",{x:"4",y:"5",width:"16",height:"5",rx:"1.5"}),(0,V.jsx)("rect",{x:"4",y:"14",width:"16",height:"5",rx:"1.5"})]})}function rN(e){return(0,V.jsx)("svg",{...ze(e),children:(0,V.jsx)("path",{d:"M5 9h14M5 15h14M10 4 8 20M16 4l-2 16"})})}function oN(e){return(0,V.jsxs)("svg",{...ze(e),children:[(0,V.jsx)("path",{d:"M12 4v11M7.5 11 12 15.5 16.5 11"}),(0,V.jsx)("path",{d:"M5 19.5h14"})]})}function sN(e){return(0,V.jsxs)("svg",{...ze(e),children:[(0,V.jsx)("rect",{x:"9",y:"3",width:"6",height:"18",rx:"1.5"}),(0,V.jsx)("path",{d:"M11 18h2"}),(0,V.jsx)("path",{d:"M5.5 9.5v5M3.5 11v2M18.5 9.5v5M20.5 11v2"})]})}function lN(e){return(0,V.jsxs)("svg",{...ze(e),children:[(0,V.jsx)("circle",{cx:"12",cy:"12",r:"9"}),(0,V.jsx)("path",{d:"M12 11v5M12 8h.01"})]})}function dN(e){return(0,V.jsx)("svg",{...ze(e),strokeWidth:2.4,children:(0,V.jsx)("path",{d:"M5.5 12h.01M12 12h.01M18.5 12h.01"})})}function ip(e){return(0,V.jsxs)("svg",{...ze(e),children:[(0,V.jsx)("rect",{x:"9",y:"9",width:"11",height:"11",rx:"2"}),(0,V.jsx)("path",{d:"M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5"})]})}function Jd(e){return(0,V.jsxs)("svg",{...ze(e),children:[(0,V.jsx)("path",{d:"m14.5 5.5 4 4L8 20l-4.6 1L4.5 16Z"}),(0,V.jsx)("path",{d:"m12.5 7.5 4 4"})]})}function Oa(e){return(0,V.jsx)("svg",{...ze(e),strokeWidth:2,children:(0,V.jsx)("path",{d:"m5 12.5 4.5 4.5L19 7.5"})})}function rp(e){return(0,V.jsxs)("svg",{...ze(e),children:[(0,V.jsx)("rect",{x:"9",y:"3",width:"6",height:"11",rx:"3"}),(0,V.jsx)("path",{d:"M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6"})]})}function jr(e){return(0,V.jsx)("svg",{...ze(e),strokeWidth:2,children:(0,V.jsx)("path",{d:"m6 6 12 12M18 6 6 18"})})}function cN(e){return(0,V.jsxs)("svg",{...ze(e),children:[(0,V.jsx)("path",{d:"M12 4v9"}),(0,V.jsx)("path",{d:"M7.5 9.5 12 14l4.5-4.5"}),(0,V.jsx)("path",{d:"M5 19h14"})]})}function op(e){return(0,V.jsxs)("svg",{...ze(e),children:[(0,V.jsx)("path",{d:"M14 4h6v6"}),(0,V.jsx)("path",{d:"M20 4 11 13"}),(0,V.jsx)("path",{d:"M19 14v5a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4 19V7a1.5 1.5 0 0 1 1.5-1.5H10"})]})}function uN(e){return(0,V.jsx)("svg",{...ze(e),children:(0,V.jsx)("path",{d:"M7 5.5v13l11-6.5Z"})})}function fN(e){return(0,V.jsxs)("svg",{...ze(e),strokeWidth:1.7,children:[(0,V.jsx)("rect",{x:"6",y:"6",width:"12",height:"12",rx:"2"}),(0,V.jsx)("rect",{x:"10",y:"10",width:"4",height:"4",rx:"0.5"}),(0,V.jsx)("path",{d:"M9 2.5v3M15 2.5v3M9 18.5v3M15 18.5v3M2.5 9h3M2.5 15h3M18.5 9h3M18.5 15h3"})]})}function $d(e){return(0,V.jsxs)("svg",{...ze(e),strokeWidth:1.7,children:[(0,V.jsx)("path",{d:"M12 3 5 5.5v5.2c0 4.3 2.9 7.6 7 9.3 4.1-1.7 7-5 7-9.3V5.5Z"}),(0,V.jsx)("path",{d:"m9 11.5 2.2 2.2L15.5 9"})]})}function pN(e){return(0,V.jsxs)("svg",{...ze(e),strokeWidth:1.7,children:[(0,V.jsx)("path",{d:"M4.5 19a8.5 8.5 0 1 1 15 0"}),(0,V.jsx)("path",{d:"m12 16 2.6-3"}),(0,V.jsx)("path",{d:"M12 16v-3"})]})}var Gr=K(re(),1),f8={running:"运行中",stopping:"停止中",completed:"已完成",killed:"已终止",failed:"失败"},p8={running:"running",stopping:"stopping",completed:"completed",killed:"killed",failed:"failed"},m8={subagent:"子代理",bash:"命令",pwsh:"命令","pty-send":"终端"};function g8(e){return m8[e]??e}function Jb(e){let t=new Date(e);return`${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}`}function h8(e,t){let n=Math.max(0,Math.round((t-e)/1e3));return n<60?`${n} 秒`:`${Math.round(n/60)} 分钟`}function Wd({job:e}){let t=p8[e.status]??"running",n=e.finishedAt!==void 0?`${Jb(e.startedAt)} → ${Jb(e.finishedAt)} · 用时 ${h8(e.startedAt,e.finishedAt)}`:`开始于 ${Jb(e.startedAt)}`;return(0,Gr.jsxs)("div",{className:"chat-task-row",role:"listitem",children:[(0,Gr.jsx)("span",{className:`chat-task-dot chat-task-dot-${t}`,"aria-hidden":!0}),(0,Gr.jsxs)("span",{className:"chat-task-copy",children:[(0,Gr.jsx)("span",{className:"chat-task-label",children:e.label}),(0,Gr.jsxs)("span",{className:"chat-task-meta",children:[g8(e.kind)," · ",f8[e.status]??e.status,e.detail!==void 0&&e.detail!==""?` · ${e.detail}`:""]}),(0,Gr.jsx)("span",{className:"chat-task-time",children:n})]})]})}var sp=8e3;async function $b(e){let t;try{t=await Xk(e)}catch{return}let n=[];for(let a of t.entries)a.kind==="child"&&n.push({id:a.id,label:a.label??a.id,activity:a.activity});return n}async function mN(e){return await $b(e)??[]}function Wb(e){return e.filter(t=>t.activity==="running")}function lp(e){let t=0;for(let n of e)n.activity==="running"&&(t+=1);return t}function dp(e){return[...e].sort((t,n)=>+(n.activity==="running")-+(t.activity==="running"))}var He=K(re(),1),gN=5,ev=new Set(["running","stopping"]);function tv(e){let t=0;for(let n of e)ev.has(n.status)&&(t+=1);return t}function hN(e){let t=0;for(let n of e)n.status==="completed"&&(t+=1);return{done:t,total:e.length}}function b8({item:e}){return(0,He.jsxs)("li",{className:`chat-run-todo chat-run-todo-${e.status}`,children:[(0,He.jsx)("span",{className:"chat-run-todo-mark","aria-hidden":!0,children:e.status==="completed"?"✓":e.status==="in_progress"?"●":"○"}),(0,He.jsx)("span",{className:"chat-run-todo-content",children:e.content})]})}function nv({node:e}){let t=e.activity==="running";return(0,He.jsxs)("div",{className:"chat-subagent-row",role:"listitem",children:[(0,He.jsx)("span",{className:"chat-subagent-dot"+(t?" chat-subagent-dot-running":""),"aria-hidden":!0}),(0,He.jsxs)("span",{className:"chat-subagent-copy",children:[(0,He.jsx)("span",{className:"chat-subagent-label",children:e.label}),(0,He.jsx)("span",{className:"chat-subagent-meta",children:t?"运行中":"空闲"})]})]})}function v8({nodes:e}){let[t,n]=(0,ec.useState)(!1),a=(0,ec.useMemo)(()=>dp(e),[e]),i=Math.max(0,a.length-gN),r=t||i===0?a:a.slice(0,gN),o=lp(e);return(0,He.jsxs)("section",{className:"chat-run-section","aria-label":"子代理",children:[(0,He.jsxs)("div",{className:"chat-run-section-head",children:[(0,He.jsx)("span",{className:"chat-run-section-title",children:"子代理"}),(0,He.jsx)("span",{className:"chat-run-section-count",children:o>0?`${o} 个运行中`:`${e.length} 个`})]}),(0,He.jsx)("div",{className:"chat-subagent-list",role:"list","aria-label":"子代理列表",children:r.map(s=>(0,He.jsx)(nv,{node:s},s.id))}),i>0&&(0,He.jsx)("button",{type:"button",className:"chat-run-fold",onClick:()=>{n(s=>!s)},children:t?"收起":`… 还有 ${i} 个子代理`})]})}function bN({todo:e,jobs:t,subagents:n,onOpen:a}){let i=(0,ec.useMemo)(()=>{let o=[];if(e!==void 0&&e.items.length>0){let{done:l,total:d}=hN(e.items);o.push(`任务 ${l}/${d}`)}if(t.length>0){let l=tv(t);o.push(l>0?`后台任务 ${l} 个运行中`:`后台任务 ${t.length} 个`)}let s=lp(n);return s>0&&o.push(`子代理 ${s} 个运行中`),o},[e,t,n]);if(i.length===0)return null;let r=e!==void 0&&e.items.some(o=>o.status==="in_progress")||tv(t)>0||lp(n)>0;return(0,He.jsxs)("button",{type:"button",className:"chat-status-strip",onClick:a,children:[(0,He.jsx)("span",{className:"chat-status-dot"+(r?" chat-status-dot-live":""),"aria-hidden":!0}),(0,He.jsx)("span",{className:"chat-status-text",children:i.join(" · ")})]})}function vN({todo:e,jobs:t,subagents:n,onClose:a}){let i=e!==void 0&&e.items.length>0;return!i&&t.length===0&&n.length===0?null:(0,He.jsxs)(ht,{title:"运行状态",onClose:a,children:[n.length>0&&(0,He.jsx)(v8,{nodes:n}),i&&(0,He.jsxs)("section",{className:"chat-run-section","aria-label":"任务清单",children:[(0,He.jsxs)("div",{className:"chat-run-section-head",children:[(0,He.jsx)("span",{className:"chat-run-section-title",children:"任务清单"}),(0,He.jsx)("span",{className:"chat-run-section-count",children:(()=>{let{done:r,total:o}=hN(e.items);return`${r}/${o}`})()})]}),(0,He.jsx)("ul",{className:"chat-run-todo-list",children:e.items.map((r,o)=>(0,He.jsx)(b8,{item:r},o))})]}),t.length>0&&(0,He.jsxs)("section",{className:"chat-run-section","aria-label":"后台任务",children:[(0,He.jsxs)("div",{className:"chat-run-section-head",children:[(0,He.jsx)("span",{className:"chat-run-section-title",children:"后台任务"}),(0,He.jsx)("span",{className:"chat-run-section-count",children:(()=>{let r=tv(t);return r>0?`${r} 个运行中`:`${t.length} 个`})()})]}),(0,He.jsx)("div",{className:"chat-run-job-list",role:"list","aria-label":"后台任务列表",children:[...t].sort((r,o)=>Number(ev.has(o.status))-Number(ev.has(r.status))).map(r=>(0,He.jsx)(Wd,{job:r},r.id))})]})]})}function av(e){if(window.self!==window.parent)try{window.parent.postMessage(e,window.location.origin)}catch{}}async function Qa(e,t="已复制"){try{if(typeof navigator<"u"&&navigator.clipboard!==void 0)return await navigator.clipboard.writeText(e),Y(t),!0;throw new Error("clipboard unavailable")}catch{}try{let n=document.createElement("textarea");n.value=e,n.setAttribute("readonly",""),n.style.position="fixed",n.style.opacity="0",document.body.appendChild(n),n.select();let a=document.execCommand("copy");return n.remove(),Y(a?t:"复制失败"),a}catch{return Y("复制失败"),!1}}async function yN(e){if(typeof navigator<"u"&&typeof navigator.share=="function")try{await navigator.share({text:e});return}catch(t){if(t instanceof DOMException&&t.name==="AbortError")return}await Qa(e,"已复制，可粘贴分享")}function xN(e){av({type:"insertCode",code:e}),window.dshInsertCode?.(e),Y("已插入到编辑器")}function wN(e,t){let n;try{n="data:text/plain;base64,"+btoa(unescape(encodeURIComponent(e)))}catch{let i=new Blob([e],{type:"text/plain;charset=utf-8"});n=URL.createObjectURL(i)}let a=!1;try{a=window.open(n,"_blank")!==null}catch{a=!1}if(!a){let i=document.createElement("a");i.href=n,i.download=`code.${t}`,document.body.appendChild(i),i.click(),i.remove()}Y(a?"已在新标签页打开":"已下载代码文件")}function kN(e){if(av({type:"openFile",path:e}),typeof window.dshOpenFile=="function"){window.dshOpenFile(e);return}Y("当前环境不支持打开文件")}async function SN(e,t){av({type:"runCode",code:e,lang:t});let n=window.dshRunCode;if(typeof n!="function")return null;try{let a=await n(e,t);return a===void 0?null:{output:a.output,...a.error===!0?{error:!0}:{}}}catch(a){return{output:a instanceof Error?a.message:String(a),error:!0}}}var NN=K(Fe(),1);var xi=K(re(),1);function y8(){return(0,xi.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round","aria-hidden":!0,children:[(0,xi.jsx)("circle",{cx:"12",cy:"12",r:"4.2"}),(0,xi.jsx)("path",{d:"M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5 5l1.7 1.7M17.3 17.3 19 19M19 5l-1.7 1.7M6.7 17.3 5 19"})]})}function x8(){return(0,xi.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:(0,xi.jsx)("path",{d:"M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"})})}function dl(){let t=(0,NN.useSyncExternalStore)(Yf,d2)==="dark";return(0,xi.jsx)("button",{type:"button",className:"mobile-theme-toggle","aria-label":t?"切换到浅色":"切换到深色",onClick:()=>{let n=c2();Js("ui-theme",[{op:"set",path:["preference"],value:n==="dark"?"dark":"light"}]).catch(()=>{})},children:t?(0,xi.jsx)(y8,{}):(0,xi.jsx)(x8,{})})}function cp(e){return e.split(/[\\/]+/).filter(Boolean)}function TN(e,t=.6){if(e.length<2)return"";let n=e.map(cp),a=Math.min(...n.map(s=>s.length)),i=Math.ceil(e.length*t),r=[];for(let s=0;s<a;s++){let l=new Map;for(let v of n){let g=v[s]??"";l.set(g,(l.get(g)??0)+1)}let d="",f=0;for(let[v,g]of l)g>f&&(d=v,f=g);if(f<i)break;r.push(d)}if(r.length===0)return"";let o=n.filter(s=>r.every((l,d)=>s[d]===l));return o.length<2?"":o[0]?.slice(0,r.length).join("/")??""}function EN(e,t,n=28){let a=e;if(t!==""){let o=cp(t),s=cp(e);s.length>o.length&&o.every((l,d)=>s[d]===l)&&(a="…"+s.slice(o.length).join("\\"))}if(a.length<=n)return a;let i=cp(a.startsWith("…")?a.slice(1):a);return i.length<2?a.slice(0,n-1)+"…":"…"+(i[0]??"").slice(0,10)+"…"+(i[i.length-1]??"").slice(0,10)}function w8(e,t){return e.length<=t?e:e.slice(0,t)+"…"}function CN(e){let t=/^\s*```([\w+-]*)\s*\n/.exec(e);if(t!==null){let a=t[1]??"";return a===""?"[代码]":`[代码] ${a}`}let n=e.trimStart().split(`
`,1)[0]??"";return w8(n,30)}function MN(e){return e.map(()=>!0)}var k8="dsh-palm";var Fr="outbox",AN="history",wi=[],zo=!1,iv=!1;function ov(){return new Promise((e,t)=>{if(typeof indexedDB>"u"){t(new Error("indexedDB unavailable"));return}let n=indexedDB.open(k8,2);n.onupgradeneeded=()=>{let a=n.result;a.objectStoreNames.contains(Fr)||a.createObjectStore(Fr,{keyPath:"id"}),a.objectStoreNames.contains(AN)||a.createObjectStore(AN,{keyPath:"key"})},n.onsuccess=()=>{e(n.result)},n.onerror=()=>{t(n.error??new Error("indexedDB open failed"))}})}async function sv(e,t){let n=await ov();try{return await new Promise((a,i)=>{let r=t(n.transaction(Fr,e).objectStore(Fr));r.onsuccess=()=>{a(r.result)},r.onerror=()=>{i(r.error??new Error("indexedDB request failed"))}})}finally{n.close()}}async function S8(){if(wi.length===0)return;let e=await ov();try{await new Promise((t,n)=>{let a=e.transaction(Fr,"readwrite"),i=a.objectStore(Fr);for(let r of wi)i.put(r);a.oncomplete=()=>{t()},a.onerror=()=>{n(a.error??new Error("indexedDB transaction failed"))},a.onabort=()=>{n(a.error??new Error("indexedDB transaction aborted"))}}),wi.length=0,zo=!1}finally{e.close()}}async function ON(e){if(!zo)try{await sv("readwrite",t=>t.put(e));return}catch{zo=!0}wi.push(e)}async function nc(){try{let e=await sv("readonly",n=>n.getAll());if(wi.length>0)try{await S8()}catch{}let t=new Map;for(let n of e)t.set(n.id,n);for(let n of wi)t.has(n.id)||t.set(n.id,n);return zo=!1,[...t.values()].sort((n,a)=>n.queuedAt-a.queuedAt)}catch{return zo=!0,[...wi].sort((e,t)=>e.queuedAt-t.queuedAt)}}async function tc(e){let t=wi.findIndex(n=>n.id===e);t!==-1&&wi.splice(t,1);try{await sv("readwrite",n=>n.delete(e))}catch{zo=!0}}async function up(e){let t=await nc();for(let n of t)n.sessionId===e&&await tc(n.id)}var rv=class extends Error{constructor(t="permanent outbox failure"){super(t),this.name="PermanentOutboxError"}};async function RN(e,t){let n=wi.find(a=>a.id===e);n!==void 0&&t(n);try{let a=await ov();try{await new Promise((i,r)=>{let o=a.transaction(Fr,"readwrite"),s=o.objectStore(Fr),l=s.get(e);l.onsuccess=()=>{let d=l.result;d!==void 0&&(t(d),s.put(d))},o.oncomplete=()=>{i()},o.onerror=()=>{r(o.error??new Error("indexedDB transaction failed"))},o.onabort=()=>{r(o.error??new Error("indexedDB transaction aborted"))}})}finally{a.close()}}catch{zo=!0}}async function _N(e){if(iv)return{sent:0,failed:0};iv=!0;try{let t=await nc(),n=0,a=0;for(let i of t)if(i.sending!==!0)try{await RN(i.id,r=>{r.sending=!0}),await e(i),await tc(i.id),n+=1}catch(r){r instanceof rv?await tc(i.id):await RN(i.id,o=>{o.sending=!1}),a+=1}return{sent:n,failed:a}}finally{iv=!1}}var Ho=K(Fe(),1),Ht=K(re(),1);function IN({items:e,running:t,onEdit:n,onRemove:a,onSteer:i}){let[r,o]=(0,Ho.useState)(!1),[s,l]=(0,Ho.useState)(null),[d,f]=(0,Ho.useState)(""),v=(0,Ho.useRef)(!1),[g,h]=(0,Ho.useState)(!1),w=e.filter(b=>b.placement==="queued");if(w.length===0)return null;let x=w.length===1||r,A=b=>{l(b.id),f(b.text)},p=async()=>{if(!(s===null||v.current)){v.current=!0,h(!0);try{await n(s,d)}finally{v.current=!1,h(!1),l(null)}}},m=async(b,y)=>{if(!v.current){v.current=!0,h(!0);try{await b(y)}finally{v.current=!1,h(!1)}}};return(0,Ht.jsxs)("div",{className:"queue-dock","data-queue-dock":"",children:[w.length>1&&(0,Ht.jsxs)("button",{type:"button",className:"queue-dockHead","aria-expanded":r,onClick:()=>{o(b=>!b)},children:[(0,Ht.jsxs)("span",{className:"queue-dockCount",children:[w.length," 条排队"]}),(0,Ht.jsx)("span",{className:"queue-dockChevron","aria-hidden":!0,children:r?"收起":"展开"})]}),x&&(0,Ht.jsx)("ul",{className:"queue-dockList",children:w.map(b=>(0,Ht.jsx)("li",{className:"queue-dockRow",children:s===b.id?(0,Ht.jsxs)("div",{className:"queue-dockEdit",children:[(0,Ht.jsx)("input",{className:"queue-dockInput",value:d,autoFocus:!0,onChange:y=>{f(y.target.value)},onKeyDown:y=>{y.key==="Enter"&&p(),y.key==="Escape"&&l(null)}}),(0,Ht.jsx)("button",{type:"button",className:"queue-dockBtn queue-dockBtn-primary",onClick:()=>{p()},children:"保存"}),(0,Ht.jsx)("button",{type:"button",className:"queue-dockBtn",onClick:()=>{l(null)},children:"取消"})]}):(0,Ht.jsxs)(Ht.Fragment,{children:[(0,Ht.jsx)("span",{className:"queue-dockText",title:b.text,children:b.text}),(0,Ht.jsxs)("span",{className:"queue-dockActions",children:[(0,Ht.jsx)("button",{type:"button",className:"queue-dockBtn","aria-label":"编辑排队消息",title:b.editable?void 0:"仅纯文本消息可编辑",disabled:!b.editable||g,onClick:()=>{A(b)},children:"编辑"}),(0,Ht.jsx)("button",{type:"button",className:"queue-dockBtn","aria-label":"删除排队消息",disabled:g,onClick:()=>{m(a,b.id)},children:"删除"}),(0,Ht.jsx)("button",{type:"button",className:"queue-dockBtn queue-dockBtn-primary","aria-label":"插话发送",disabled:!t||g,title:t?void 0:"仅运行中可插话发送",onClick:()=>{m(i,b.id)},children:"插话"})]})]})},b.id))})]})}var Kr=K(Fe(),1);var LN={ts:{label:"TypeScript",runnable:!1,ext:"ts",kind:"code"},typescript:{label:"TypeScript",runnable:!1,ext:"ts",kind:"code"},js:{label:"JavaScript",runnable:!1,ext:"js",kind:"code"},javascript:{label:"JavaScript",runnable:!1,ext:"js",kind:"code"},jsx:{label:"JSX",runnable:!1,ext:"jsx",kind:"code"},tsx:{label:"TSX",runnable:!1,ext:"tsx",kind:"code"},py:{label:"Python",runnable:!0,ext:"py",kind:"python"},python:{label:"Python",runnable:!0,ext:"py",kind:"python"},bash:{label:"Bash",runnable:!0,ext:"sh",kind:"bash"},sh:{label:"Bash",runnable:!0,ext:"sh",kind:"bash"},shell:{label:"Bash",runnable:!0,ext:"sh",kind:"bash"},zsh:{label:"Bash",runnable:!0,ext:"sh",kind:"bash"},json:{label:"JSON",runnable:!1,ext:"json",kind:"config"},yaml:{label:"YAML",runnable:!1,ext:"yml",kind:"config"},yml:{label:"YAML",runnable:!1,ext:"yml",kind:"config"},html:{label:"HTML",runnable:!1,ext:"html",kind:"markup"},xml:{label:"XML",runnable:!1,ext:"xml",kind:"markup"},css:{label:"CSS",runnable:!1,ext:"css",kind:"code"},rust:{label:"Rust",runnable:!1,ext:"rs",kind:"code"},rs:{label:"Rust",runnable:!1,ext:"rs",kind:"code"},go:{label:"Go",runnable:!1,ext:"go",kind:"code"},java:{label:"Java",runnable:!1,ext:"java",kind:"code"},cpp:{label:"C++",runnable:!1,ext:"cpp",kind:"code"},"c++":{label:"C++",runnable:!1,ext:"cpp",kind:"code"},c:{label:"C",runnable:!1,ext:"c",kind:"code"},md:{label:"Markdown",runnable:!1,ext:"md",kind:"markup"},markdown:{label:"Markdown",runnable:!1,ext:"md",kind:"markup"},sql:{label:"SQL",runnable:!1,ext:"sql",kind:"sql"},text:{label:"Text",runnable:!1,ext:"txt",kind:"config"}};function zN(e){let t=e.trim().toLowerCase(),n=LN[t];return n!==void 0?n:{label:e.trim()===""?"text":e.trim(),runnable:!1,ext:"txt"}}var N8={code:new Set(["abstract","as","async","await","break","case","catch","class","const","continue","default","delete","do","else","enum","export","extends","finally","for","from","function","get","if","implements","import","in","instanceof","interface","let","module","namespace","new","of","package","private","protected","public","readonly","return","set","static","super","switch","this","throw","try","type","typeof","undefined","var","void","while","with","yield","null","true","false","fn","impl","struct","match","mut","move","pub","ref","trait","use","where","func","range","defer","chan","go","nil","def","lambda"]),python:new Set(["and","as","assert","async","await","break","class","continue","def","del","elif","else","except","False","finally","for","from","global","if","import","in","is","lambda","None","nonlocal","not","or","pass","raise","return","True","try","while","with","yield","self","print"]),bash:new Set(["if","then","else","elif","fi","for","while","until","do","done","case","esac","function","in","select","time","local","export","readonly","return","break","continue","shift","source","alias","echo","set","unset","true","false","test","exit"]),sql:new Set(["SELECT","FROM","WHERE","INSERT","INTO","VALUES","UPDATE","SET","DELETE","CREATE","TABLE","ALTER","ADD","DROP","INDEX","VIEW","JOIN","INNER","LEFT","RIGHT","FULL","OUTER","CROSS","ON","AS","AND","OR","NOT","NULL","IS","IN","LIKE","BETWEEN","GROUP","BY","ORDER","HAVING","LIMIT","OFFSET","UNION","ALL","DISTINCT","PRIMARY","KEY","FOREIGN","REFERENCES","CONSTRAINT","DEFAULT","UNIQUE","CHECK","CASE","WHEN","THEN","ELSE","END","EXISTS","COUNT","SUM","AVG","MIN","MAX","CAST","IF","WITH","RECURSIVE","ASC","DESC","DATABASE"]),markup:new Set(["html","head","body","title","meta","link","script","style","div","span","p","h1","h2","h3","h4","h5","h6","ul","ol","li","table","tr","td","th","thead","tbody","a","img","input","button","form","header","footer","nav","section","article","aside","main","select","option","textarea","label","video","audio","iframe","pre","code","br","hr","strong","em","b","i","u","s","blockquote","q","mark","doctype","template","slot","picture","source","summary","details","figure","figcaption","canvas","svg","path","defs","linearGradient"]),config:new Set(["true","false","null","yes","no","on","off","version","name","type","id","env","node","extends","default","required"])};function T8(e,t){return t==="sql"?e.toUpperCase():e}function ac(e){return e.replace(/[&<>"']/g,t=>t==="&"?"&amp;":t==="<"?"&lt;":t===">"?"&gt;":t==='"'?"&quot;":"&#39;")}var DN=/("[^"\n]*")|('(?:[^'\n\\]|\\.)*')|(`[^`\n]*`)|(\/\/[^\n]*)|(\/\*.*?\*\/|\s#[^\n]*)|(\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|(\b[A-Za-z_][A-Za-z0-9_]*\b)/g;function E8(e,t,n){if(n&&/^\s*#/.test(e))return`<span class="tok tok-comment">${ac(e)}</span>`;let a=N8[t],i="",r=0;DN.lastIndex=0;let o;for(;(o=DN.exec(e))!==null;){let s=o.index,[l,d,f,v,g,h,w,x]=o;i+=ac(e.slice(r,s));let A=l,p="";if(d!==void 0||f!==void 0||v!==void 0)p=" tok-string";else if(g!==void 0||h!==void 0&&(h.trimStart().startsWith("/*")||n&&h.trimStart().startsWith("#")))p=" tok-comment";else if(w!==void 0)p=" tok-number";else if(x!==void 0)if(A=x,a.has(T8(x,t)))p=" tok-keyword";else if(/^[A-Z]/.test(x))p=" tok-type";else{let m=e.slice(s+x.length),b=e.slice(Math.max(0,s-1),s);t==="markup"&&(b==="<"||b===" ")||m.startsWith(":")&&(b===" "||b===""||b==='"'||b==="'")?p=" tok-prop":m.startsWith("(")&&(p=" tok-func")}i+=p===""?ac(A):`<span class="tok${p}">${ac(A)}</span>`,r=s+l.length}return i+=ac(e.slice(r)),i===""?" ":i}var fp=new Map,C8=200;function ic(e,t){let n=t.trim().toLowerCase(),a=n+"\0"+e,i=fp.get(a);if(i!==void 0)return i;let r=LN[n];if(r===void 0||r.kind==="config")return null;let o=r.kind==="python"||r.kind==="bash"||r.kind==="sql",d=`<pre class="shiki" tabindex="0"><code>${e.split(`
`).map(f=>`<span class="line">${E8(f,r.kind,o)}</span>`).join(`
`)}</code></pre>`;return fp.size>=C8&&fp.clear(),fp.set(a,d),d}var M8={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function Ye(e){return e.replace(/[&<>"']/g,t=>M8[t]??t)}function pp(e){let t=e.trim();if(t==="")return null;if(t.startsWith("#"))return t;if(t.startsWith("//"))return null;let n=/^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(t);if(n===null)return t;let a=n[1].toLowerCase();return a==="http"||a==="https"||a==="mailto"?t:null}var A8=/\.(?:png|jpe?g|gif|webp|bmp|svg|avif|ico)$/i,R8=/^[A-Za-z]:[\\/]/,O8=/^[A-Za-z][A-Za-z0-9+.-]*:/;function _8(e){let t=e.trim().replace(/[?#][\s\S]*$/,"");if(t===""||t.startsWith("//")||O8.test(t)&&!R8.test(t)||!A8.test(t))return null;try{return decodeURIComponent(t)}catch{return null}}function HN(e,t){let n=0;for(let a=t;a<e.length;a+=1){let i=e[a];if(i==="(")n+=1;else if(i===")"){if(n===0)return a;n-=1}}return-1}var qN=/(?:[A-Za-z]:[\\/]|\.{1,2}[\\/])?(?:[\w@.-]+[\\/])+[\w@.-]+\.(?:[A-Za-z0-9]{1,8})/y;function PN(e,t){let n=e[t];if(n===void 0||!/[\w./\\]/.test(n))return null;let a=t>0?e[t-1]:"";if(a!==""&&/[\w:/.@]/.test(a))return null;qN.lastIndex=t;let i=qN.exec(e);if(i===null)return null;let r=i[0];return!/[\\/]/.test(r)||/^[a-z][a-z0-9+.-]*:\/\//i.test(r)||/^www\./i.test(r)?null:{path:r,end:t+r.length}}function On(e){let t="",n=0,a=e.length;for(;n<a;){let i=e[n];if(i==="`"){let o=e.indexOf("`",n+1);if(o!==-1){let s=e.slice(n+1,o),l=PN(s,0);if(l!==null&&l.end===s.length){t+='<code><a class="file-link" data-path="'+Ye(l.path)+'">'+Ye(l.path)+"</a></code>",n=o+1;continue}t+="<code>"+Ye(s)+"</code>",n=o+1;continue}}if(i==="!"&&e[n+1]==="["){let o=e.indexOf("](",n+2);if(o!==-1){let s=HN(e,o+2);if(s!==-1){let l=e.slice(n+2,o),d=e.slice(o+2,s),f=_8(d);if(f!==null)t+='<img class="md-local-img" data-local-src="'+Ye(f)+'" alt="'+Ye(l)+'" loading="lazy" decoding="async" />';else{let v=pp(d);if(v===null)t+=Ye(l);else{let g=Ye(v).replace(/\s+/g,"%20");t+='<img alt="'+Ye(l)+'" src="'+g+'" loading="lazy" decoding="async" />'}}n=s+1;continue}}}if(i==="["){let o=e.indexOf("](",n+1);if(o!==-1){let s=HN(e,o+2);if(s!==-1){let l=e.slice(n+1,o),d=e.slice(o+2,s),f=pp(d);f===null?t+=On(l):t+='<a href="'+Ye(f)+'" target="_blank" rel="noopener noreferrer">'+On(l)+"</a>",n=s+1;continue}}}let r=PN(e,n);if(r!==null){t+='<a class="file-link" data-path="'+Ye(r.path)+'">'+Ye(r.path)+"</a>",n=r.end;continue}if(i==="*"&&e[n+1]==="*"){let o=e.indexOf("**",n+2);if(o!==-1){t+="<strong>"+On(e.slice(n+2,o))+"</strong>",n=o+2;continue}}if(i==="*"&&e[n-1]!=="*"&&e[n+1]!=="*"){let o=e.indexOf("*",n+1);if(o!==-1&&e[o+1]!=="*"){t+="<em>"+On(e.slice(n+1,o))+"</em>",n=o+1;continue}}if(i==="~"&&e[n+1]==="~"){let o=e.indexOf("~~",n+2);if(o!==-1){t+="<del>"+On(e.slice(n+2,o))+"</del>",n=o+2;continue}}if(i===`
`){t+="<br />",n+=1;continue}t+=Ye(i),n+=1}return t}var UN=/<think\b[^>]*>/i,mp=/<\/think\s*>/i,I8='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5"/></svg>',D8='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 4v9"/><path d="M7.5 9.5 12 14l4.5-4.5"/><path d="M5 19h14"/></svg>',L8='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M19 14v5a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4 19V7a1.5 1.5 0 0 1 1.5-1.5H10"/></svg>',z8='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/></svg>',H8='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 14 6-6 6 6"/></svg>';function q8(e,t){let n=e===""?"text":e,a=t.split(`
`).map(i=>'<span class="code-line">'+(Ye(i)||" ")+"</span>").join("");return'<div class="code-block" data-lang="'+Ye(n)+'"><div class="code-head"><span class="code-lang">'+Ye(n)+'</span><div class="code-actions"><button type="button" class="code-btn code-copy" aria-label="复制代码">'+I8+'</button><button type="button" class="code-btn code-insert" aria-label="插入到编辑器">'+D8+'</button><button type="button" class="code-btn code-open" aria-label="新标签页打开">'+L8+'</button></div></div><div class="code-body"><pre><code>'+a+"</code></pre></div></div>"}function P8(e){return'<div class="diff-block" data-lang="diff"><div class="diff-head"><span class="diff-label">变更对比</span></div><div class="diff-body"><pre><code>'+e.split(`
`).map(n=>'<span class="code-line">'+(Ye(n)||" ")+"</span>").join("")+"</code></pre></div></div>"}function V8(e){return'<details class="chat-disclosure think-block"><summary class="chat-disclosure-head"><span class="chat-disclosure-icon">'+z8+'</span><span class="chat-disclosure-label">思考过程</span><span class="chat-disclosure-caret">'+H8+'</span></summary><div class="chat-disclosure-body think-body">'+Ye(e)+"</div></details>"}function U8(e){switch(e.type){case"paragraph":return"<p>"+e.html+"</p>";case"heading":return"<h"+e.level+">"+e.html+"</h"+e.level+">";case"hr":return"<hr />";case"list":return(e.ordered?"<ol>":"<ul>")+e.items.map(t=>"<li>"+t+"</li>").join("")+(e.ordered?"</ol>":"</ul>");case"table":{let t="<thead><tr>"+e.head.map(a=>"<th>"+a+"</th>").join("")+"</tr></thead>",n=e.rows.length>0?"<tbody>"+e.rows.map(a=>"<tr>"+a.map(i=>"<td>"+i+"</td>").join("")+"</tr>").join("")+"</tbody>":"";return"<table>"+t+n+"</table>"}case"quote":return"<blockquote><p>"+e.html+"</p></blockquote>";case"code":return e.diff?P8(e.code):q8(e.lang,e.code);case"think":return V8(e.text)}}function B8(e){let t=e.replace(/\r\n/g,`
`).split(`
`),n=[],a=0,i=t.length,r=s=>{s.length!==0&&(n.push({type:"paragraph",html:On(s.join(`
`))}),s.length=0)},o=[];for(;a<i;){let s=t[a],l=/^```([\w+-]*)\s*$/.exec(s);if(l!==null){r(o);let w=l[1]??"";a+=1;let x=[];for(;a<i&&!/^```\s*$/.test(t[a]);)x.push(t[a]),a+=1;a+=1,n.push({type:"code",lang:w,code:x.join(`
`),diff:w.toLowerCase()==="diff"});continue}if(/^tool_result</.test(s)){r(o);let w=[s];for(a+=1;a<i&&w.length<12&&/^(<\/|\s*\|)/.test(t[a]);)w.push(t[a]),a+=1;n.push({type:"code",lang:"",code:w.join(`
`),diff:!1});continue}let d=UN.exec(s);if(d!==null){r(o);let w=s.slice(0,d.index),x=s.slice(d.index+d[0].length),A=0,p=mp.exec(x);if(p===null)for(A=1;A<i-a&&(p=mp.exec(t[a+A]??""),p===null);)A+=1;if(p===null){o.push(s),a+=1;continue}let m=[];if(A===0)m.push(x.slice(0,p.index));else{m.push(x);for(let N=a+1;N<a+A;N+=1)m.push(t[N]??"");m.push((t[a+A]??"").slice(0,p.index))}let b=m.join(`
`).trim();w.trim()!==""&&n.push({type:"paragraph",html:On(w)}),b!==""&&n.push({type:"think",text:b});let y=A===0?x.slice(p.index+p[0].length):(t[a+A]??"").slice(p.index+p[0].length);y.trim()!==""&&o.push(y),a+=A+1;continue}let f=/^(#{1,6})\s+(.*)$/.exec(s);if(f!==null){r(o),n.push({type:"heading",level:f[1].length,html:On(f[2]??"")}),a+=1;continue}if(/^\s*(---+|\*\*\*+|___+)\s*$/.test(s)){r(o),n.push({type:"hr"}),a+=1;continue}if(s.includes("|")&&a+1<i&&/^\s*\|?[\s:|-]+\|?\s*$/.test(t[a+1])&&t[a+1].includes("-")){r(o);let w=VN(s);a+=2;let x=[];for(;a<i&&t[a].includes("|");)x.push(VN(t[a])),a+=1;n.push({type:"table",head:w.map(A=>On(A)),rows:x.map(A=>A.map(p=>On(p)))});continue}if(/^>\s?(.*)$/.exec(s)!==null){r(o);let w=[];for(;a<i;){let x=/^>\s?(.*)$/.exec(t[a]);if(x===null)break;w.push(x[1]??""),a+=1}n.push({type:"quote",html:w.map(x=>On(x)).join("<br />")});continue}if(/^\s*([-*+])\s+(.*)$/.exec(s)!==null){r(o);let w=[];for(;a<i;){let x=/^\s*([-*+])\s+(.*)$/.exec(t[a]);if(x===null)break;w.push(On(x[2]??"")),a+=1}n.push({type:"list",ordered:!1,items:w});continue}if(/^\s*\d+[.)]\s+(.*)$/.exec(s)!==null){r(o);let w=[];for(;a<i;){let x=/^\s*\d+[.)]\s+(.*)$/.exec(t[a]);if(x===null)break;w.push(On(x[1]??"")),a+=1}n.push({type:"list",ordered:!0,items:w});continue}if(s.trim()===""){r(o),a+=1;continue}o.push(s),a+=1}return r(o),n}function rc(e){let t=B8(e),n=[],a=[],i=0,r=()=>{a.length!==0&&(n.push({kind:"html",id:i,html:a.join(`
`)}),i+=1,a=[])};for(let o of t)o.type==="code"?(r(),o.diff?n.push({kind:"diff",id:i,text:o.code}):n.push({kind:"code",id:i,lang:o.lang,code:o.code}),i+=1):o.type==="think"?(r(),n.push({kind:"think",id:i,text:o.text}),i+=1):a.push(U8(o));return r(),n}function VN(e){let t=e.trim(),n=t.startsWith("|")?t.slice(1):t;return(n.endsWith("|")?n.slice(0,-1):n).split("|").map(i=>i.trim())}var j8=/^```([\w+-]*)\s*$/,G8=/^```\s*$/;function BN(e,t){let n=e.replace(/\r\n/g,`
`),a=n.length;(t>a||t<0)&&(t=0);let i=[],r=t,o=null,s=t,l=()=>{o!==null&&o.length>0&&i.push({kind:"html",html:"<p>"+On(o.join(`
`))+"</p>"}),o=null};for(;r<a;){let d=n.indexOf(`
`,r),f=d===-1?n.slice(r):n.slice(r,d),v=d===-1?a:d+1,g=j8.exec(f);if(g!==null){l();let w=g[1]??"",x=-1,A=-1,p=v;for(;p<a;){let b=n.indexOf(`
`,p),y=b===-1?n.slice(p):n.slice(p,b);if(G8.test(y)){x=p,A=b===-1?a:b+1;break}p=b===-1?a:b+1}if(x===-1)break;let m=n.slice(v,x).replace(/\n$/,"");w.toLowerCase()==="diff"?i.push({kind:"diff",text:m}):i.push({kind:"code",lang:w,code:m}),r=A;continue}let h=UN.exec(f);if(h!==null){if(l(),h.index>0){let b=f.slice(0,h.index);b.trim()!==""&&i.push({kind:"html",html:"<p>"+On(b)+"</p>"})}let w=f.slice(h.index+h[0].length),x=mp.exec(w);if(x!==null){let b=w.slice(0,x.index).trim();b!==""&&i.push({kind:"think",text:b});let y=w.slice(x.index+x[0].length);y.trim()!==""&&(o=[y],s=r+h.index+h[0].length+x.index+x[0].length),r=v;continue}let A=[w],p=v,m=!1;for(;p<a;){let b=n.indexOf(`
`,p),y=b===-1?n.slice(p):n.slice(p,b),N=mp.exec(y);if(N!==null){let D=[...A,y.slice(0,N.index)].join(`
`).trim();D!==""&&i.push({kind:"think",text:D});let O=y.slice(N.index+N[0].length);O.trim()!==""&&(o=[O],s=p+N.index+N[0].length),r=b===-1?a:b+1,m=!0;break}A.push(y),p=b===-1?a:b+1}if(!m)break;continue}if(o===null&&(o=[],s=r),f.trim()===""){l(),r=v;continue}o.push(f),r=v}return o!==null&&o.length>0&&(r=s),{blocks:i,stableLen:r,tail:n.slice(r)}}var bn=K(Fe(),1);var tt=K(re(),1),F8=20,K8=1e3,lv=300,Y8=60;function Q8(){return new Promise(e=>{setTimeout(e,0)})}var gp=(0,bn.memo)(function({lang:t,code:n}){let a=(0,bn.useMemo)(()=>zN(t),[t]),i=(0,bn.useMemo)(()=>n.split(`
`),[n]),r=i.length>F8,[o,s]=(0,bn.useState)(null),[l,d]=(0,bn.useState)(!1),f=(0,bn.useRef)(void 0),[v,g]=(0,bn.useState)(!1),[h,w]=(0,bn.useState)({running:!1}),x=r&&!v,A=i.length>K8&&!x,p=x?Math.min(i.length,Y8):i.length,m=p===i.length?n:i.slice(0,p).join(`
`),b=x&&i.length>p?i.slice(p):void 0;(0,bn.useEffect)(()=>()=>{f.current!==void 0&&window.clearTimeout(f.current)},[]),(0,bn.useEffect)(()=>{g(!1)},[n]),(0,bn.useEffect)(()=>{if(A){let X=!1,Le=m.split(`
`),at=Math.ceil(Le.length/lv),Te="",je=0;return(async()=>{for(;je<at&&!X;){let Qt=je*lv,xe=ic(Le.slice(Qt,Qt+lv).join(`
`),t);if(xe===null||X)return;let _t=xe.indexOf("<code>"),$e=xe.lastIndexOf("</code>");if(_t===-1||$e===-1)return;Te+=xe.slice(_t+6,$e),je+=1,je<at&&(Te+=`
`),s('<pre class="shiki" tabindex="0"><code>'+Te+"</code></pre>"),await Q8()}})(),()=>{X=!0}}let T=!1,z,$=()=>{T||s(ic(m,t))};return typeof requestIdleCallback=="function"?z=requestIdleCallback($):z=window.setTimeout($,0),()=>{T=!0,z!==void 0&&(typeof requestIdleCallback=="function"?cancelIdleCallback(z):window.clearTimeout(z))}},[m,t,A]);let y=()=>{d(!0),f.current!==void 0&&window.clearTimeout(f.current),f.current=window.setTimeout(()=>{f.current=void 0,d(!1)},1500),Qa(n,"已复制到剪贴板")},N=()=>{xN(n)},D=()=>{wN(n,a.ext)},O=()=>{h.running||(w({running:!0}),SN(n,t).then(T=>{if(T===null){w({running:!1}),Y("当前环境不支持代码执行");return}w({running:!1,result:T})}))};return(0,tt.jsxs)("div",{className:"code-block","data-lang":t===""?"text":t,children:[(0,tt.jsxs)("div",{className:"code-head",children:[(0,tt.jsx)("span",{className:"code-lang",children:a.label}),(0,tt.jsxs)("div",{className:"code-actions",children:[a.runnable&&(0,tt.jsx)("button",{type:"button",className:"code-btn","aria-label":"运行代码",disabled:h.running,onClick:O,children:(0,tt.jsx)(uN,{width:16,height:16})}),(0,tt.jsxs)("button",{type:"button",className:"code-btn"+(l?" code-btn-done":""),"aria-label":"复制代码",onClick:y,children:[l?(0,tt.jsx)(Oa,{width:16,height:16}):(0,tt.jsx)(ip,{width:16,height:16}),l&&(0,tt.jsx)("span",{className:"code-btn-label",children:"已复制"})]}),(0,tt.jsx)("button",{type:"button",className:"code-btn","aria-label":"插入到编辑器",onClick:N,children:(0,tt.jsx)(cN,{width:16,height:16})}),(0,tt.jsx)("button",{type:"button",className:"code-btn","aria-label":"新标签页打开",onClick:D,children:(0,tt.jsx)(op,{width:16,height:16})})]})]}),(0,tt.jsxs)("div",{className:"code-body-zone",children:[(0,tt.jsxs)("div",{className:"code-body"+(x?" code-body-folded":""),children:[o!==null?(0,tt.jsx)("div",{className:"code-fade",dangerouslySetInnerHTML:{__html:o}}):(0,tt.jsx)("pre",{children:(0,tt.jsx)("code",{children:i.slice(0,p).map((T,z)=>(0,tt.jsx)("span",{className:"code-line",children:T===""?" ":Ye(T)},z))})}),b!==void 0&&(0,tt.jsx)("pre",{className:"code-tail-plain",children:(0,tt.jsx)("code",{children:b.map((T,z)=>(0,tt.jsx)("span",{className:"code-line",children:T===""?" ":Ye(T)},z))})})]}),x&&(0,tt.jsx)("div",{className:"code-fold-mask","aria-hidden":"true"})]}),r&&(0,tt.jsx)("button",{type:"button",className:"code-fold-btn",onClick:()=>{g(T=>!T)},children:x?"展开全部":"收起"}),h.result!==void 0&&(0,tt.jsx)("pre",{className:"code-run"+(h.result.error===!0?" code-run-error":" code-run-ok"),children:h.result.output})]})});var _a=K(Fe(),1);function jN(e){let t=e.trim();return/^[ab]\//.test(t)?t.slice(2):t}var X8=/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/;function FN(e){let t=e.replace(/\r\n/g,`
`).split(`
`);t.length>0&&t[t.length-1]===""&&e.endsWith(`
`)&&t.pop();let n,a,i=0;for(;i<t.length;){let d=t[i],f=/^---\s+(.*)$/.exec(d);if(f!==null){n=jN(f[1]),i+=1;continue}let v=/^\+\+\+\s+(.*)$/.exec(d);if(v!==null){a=jN(v[1]),i+=1;continue}break}let r=[],o,s=0,l=0;for(;i<t.length;){let d=t[i],f=X8.exec(d);if(f!==null){o={oldStart:Number(f[1]),oldLines:f[2]===void 0?1:Number(f[2]),newStart:Number(f[3]),newLines:f[4]===void 0?1:Number(f[4]),lines:[]},r.push(o),s=o.oldStart,l=o.newStart,i+=1;continue}if(o===void 0&&(o={oldStart:1,oldLines:0,newStart:1,newLines:0,lines:[]},r.push(o),s=1,l=1),d.startsWith("\\")){i+=1;continue}d.startsWith("+")?(o.lines.push({type:"add",newNo:l,text:d.slice(1)}),l+=1):d.startsWith("-")?(o.lines.push({type:"del",oldNo:s,text:d.slice(1)}),s+=1):(o.lines.push({type:"ctx",oldNo:s,newNo:l,text:d.startsWith(" ")?d.slice(1):d}),s+=1,l+=1),i+=1}return Z8(r),{...n!==void 0?{oldFile:n}:{},...a!==void 0?{newFile:a}:{},hunks:r.map(d=>({oldStart:d.oldStart,oldLines:d.oldLines,newStart:d.newStart,newLines:d.newLines,lines:d.lines.map(f=>({type:f.type,...f.oldNo!==void 0?{oldNo:f.oldNo}:{},...f.newNo!==void 0?{newNo:f.newNo}:{},text:f.text,...f.words!==void 0?{words:f.words}:{}}))}))}}function Z8(e){for(let t of e){let n=t.lines,a=0;for(;a<n.length;){let i=n[a].type;if(i!=="add"&&i!=="del"){a+=1;continue}let r=[];for(;a<n.length&&n[a].type===i;)r.push(n[a]),a+=1;let o=i==="add"?"del":"add",s=[];for(;a<n.length&&n[a].type===o;)s.push(n[a]),a+=1;let l=Math.max(r.length,s.length);for(let d=0;d<l;d+=1){let f=r[d],v=s[d];if(f!==void 0&&v!==void 0){let{oldWords:g,newWords:h}=$8(f.text,v.text);f.words=g,v.words=h}else f!==void 0?f.words=[{text:f.text,kind:f.type==="add"?"add":"del"}]:v!==void 0&&(v.words=[{text:v.text,kind:v.type==="add"?"add":"del"}])}}}}function GN(e){return e.match(/\S+|\s+/g)??[]}var J8=2e4;function $8(e,t){let n=GN(e),a=GN(t),i=n.length,r=a.length;if(i*r>J8){let v=0;for(;v<i&&v<r&&n[v]===a[v];)v+=1;let g=0;for(;g<i-v&&g<r-v&&n[i-1-g]===a[r-1-g];)g+=1;let h=[],w=[];for(let x=0;x<v;x+=1)h.push({text:n[x],kind:"same"}),w.push({text:a[x],kind:"same"});for(let x=v;x<i-g;x+=1)h.push({text:n[x],kind:/^\s+$/.test(n[x])?"same":"del"});for(let x=v;x<r-g;x+=1)w.push({text:a[x],kind:/^\s+$/.test(a[x])?"same":"add"});for(let x=i-g;x<i;x+=1)h.push({text:n[x],kind:"same"});for(let x=r-g;x<r;x+=1)w.push({text:a[x],kind:"same"});return{oldWords:h,newWords:w}}let o=Array.from({length:i+1},()=>new Array(r+1).fill(0));for(let v=i-1;v>=0;v-=1)for(let g=r-1;g>=0;g-=1)o[v][g]=n[v]===a[g]?o[v+1][g+1]+1:Math.max(o[v+1][g],o[v][g+1]);let s=[],l=[],d=0,f=0;for(;d<i&&f<r;)n[d]===a[f]?(s.push({text:n[d],kind:"same"}),l.push({text:a[f],kind:"same"}),d+=1,f+=1):o[d+1][f]>=o[d][f+1]?(s.push({text:n[d],kind:/^\s+$/.test(n[d])?"same":"del"}),d+=1):(l.push({text:a[f],kind:/^\s+$/.test(a[f])?"same":"add"}),f+=1);for(;d<i;)s.push({text:n[d],kind:/^\s+$/.test(n[d])?"same":"del"}),d+=1;for(;f<r;)l.push({text:a[f],kind:/^\s+$/.test(a[f])?"same":"add"}),f+=1;return{oldWords:s,newWords:l}}function dv(e,t,n){let a=[];return e.hunks.forEach((i,r)=>{i.lines.forEach((o,s)=>{let l=`${r}:${s}`;(o.type==="ctx"||o.type==="add"&&t.has(l)||o.type==="del"&&n.has(l))&&a.push(o.text)})}),a.join(`
`)}var ke=K(re(),1),W8=200,KN=2,YN=2,hp=(0,_a.memo)(function({text:t}){let n=(0,_a.useMemo)(()=>FN(t),[t]),[a,i]=(0,_a.useState)("view"),[r,o]=(0,_a.useState)(new Set),[s,l]=(0,_a.useState)(new Set),[d,f]=(0,_a.useState)(!1),v=n.newFile??n.oldFile,g=(0,_a.useMemo)(()=>n.hunks.reduce((T,z)=>T+z.lines.length,0),[n]),h=g>W8&&!d,w=h?[...n.hunks.slice(0,KN),...n.hunks.slice(-YN)]:n.hunks,x=h?n.hunks.length-KN-YN:0,A=h?g-w.reduce((T,z)=>T+z.lines.length,0):0,p=(0,_a.useMemo)(()=>{let T=0,z=0,$=0,X=0;return n.hunks.forEach((Le,at)=>{Le.lines.forEach((Te,je)=>{let Je=`${at}:${je}`;Te.type==="add"?(T+=1,r.has(Je)&&($+=1)):Te.type==="del"&&(z+=1,s.has(Je)&&(X+=1))})}),{adds:T,dels:z,acceptedAdds:$,rejectedDels:X,remaining:T-$+z-X}},[n,r,s]),m=(0,_a.useMemo)(()=>a==="rejected"?"":a==="applied"&&r.size===0&&s.size===0?dv(n,eA(n,"add"),new Set):dv(n,r,s),[n,a,r,s]),b=(T,z)=>{z!=="ctx"&&(z==="add"?o($=>{let X=new Set($);return X.has(T)?X.delete(T):X.add(T),X}):l($=>{let X=new Set($);return X.has(T)?X.delete(T):X.add(T),X}))},y=()=>{if(r.size===0&&s.size===0){Y("请先逐行选择要接受或拒绝的行");return}i("applied")},N=()=>{i("view"),o(new Set),l(new Set)},D=()=>{i("view"),o(new Set),l(new Set)},O=(0,ke.jsxs)("div",{className:"diff-body"+(a==="review"?" diff-reviewing":""),children:[w.map((T,z)=>(0,ke.jsxs)("div",{className:"diff-hunk",children:[n.hunks.length>1&&(0,ke.jsxs)("div",{className:"diff-hunk-head",children:["@@ -",T.oldStart,",",T.oldLines," +",T.newStart,",",T.newLines," @@"]}),T.lines.map(($,X)=>{let Le=`${z}:${X}`;return(0,ke.jsx)(tA,{line:$,reviewing:a==="review",accepted:r.has(Le),rejected:s.has(Le),onToggle:()=>{b(Le,$.type)}},Le)})]},z)),h&&(0,ke.jsxs)("div",{className:"diff-fold",children:[(0,ke.jsxs)("span",{className:"diff-fold-text",children:["… 已折叠 ",x," 个 hunk / ",A," 行"]}),(0,ke.jsx)("button",{type:"button",className:"diff-fold-btn",onClick:()=>{f(!0)},children:"展开全部"})]}),a==="review"&&(0,ke.jsxs)("div",{className:"diff-review-foot",children:[(0,ke.jsxs)("span",{className:"diff-review-summary",children:["接受 ",p.acceptedAdds," 行 / 拒绝 ",p.rejectedDels," 行 / 剩余 ",p.remaining," 行"]}),(0,ke.jsx)("button",{type:"button",className:"diff-confirm diff-cancel",onClick:N,children:"取消"}),(0,ke.jsx)("button",{type:"button",className:"diff-confirm",onClick:y,children:"确认"})]})]});return(0,ke.jsxs)("div",{className:"diff-block","data-lang":"diff",children:[(0,ke.jsxs)("div",{className:"diff-head",children:[(0,ke.jsxs)("span",{className:"diff-title",children:[(0,ke.jsx)("span",{className:"diff-label",children:"变更对比"}),v!==void 0&&(0,ke.jsx)("span",{className:"diff-file",children:v})]}),(0,ke.jsx)("div",{className:"diff-actions",children:a==="view"&&(0,ke.jsxs)(ke.Fragment,{children:[(0,ke.jsx)("button",{type:"button",className:"diff-btn diff-accept",onClick:()=>{i("applied")},children:"接受"}),(0,ke.jsx)("button",{type:"button",className:"diff-btn diff-reject",onClick:()=>{i("rejected")},children:"拒绝"}),(0,ke.jsx)("button",{type:"button",className:"diff-btn diff-review",onClick:()=>{i("review")},children:"逐行审阅"})]})})]}),a==="applied"||a==="rejected"?(0,ke.jsxs)(ke.Fragment,{children:[(0,ke.jsxs)("div",{className:"diff-applied",children:[(0,ke.jsx)("span",{className:"diff-applied-tag"+(a==="rejected"?" diff-applied-tag-rejected":""),children:a==="applied"?"已应用":"已拒绝"}),a==="applied"&&r.size+s.size>0&&(0,ke.jsxs)("span",{className:"diff-applied-summary",children:["接受 ",p.acceptedAdds," 行 / 拒绝 ",p.rejectedDels," 行"]}),a==="applied"&&m!==""&&(0,ke.jsx)("button",{type:"button",className:"diff-undo",onClick:()=>{Qa(m,"已复制结果代码")},children:"复制结果"}),a==="rejected"&&(0,ke.jsx)("button",{type:"button",className:"diff-undo",onClick:D,children:"重新生成"}),(0,ke.jsx)("button",{type:"button",className:"diff-undo",onClick:D,children:"撤销"})]}),(0,ke.jsx)("div",{className:"diff-dimmed",children:O})]}):O]})});function eA(e,t){let n=new Set;return e.hunks.forEach((a,i)=>{a.lines.forEach((r,o)=>{r.type===t&&n.add(`${i}:${o}`)})}),n}function tA({line:e,reviewing:t,accepted:n,rejected:a,onToggle:i}){let r=e.type==="add"?" diff-add":e.type==="del"?" diff-del":"",o=e.type==="add"&&n||e.type==="del"&&a;return(0,ke.jsxs)("div",{className:"diff-row"+(t?" diff-row-review":"")+r+(o?" diff-decided":""),children:[t&&(0,ke.jsxs)("div",{className:"diff-review-cell",children:[e.type==="add"&&(0,ke.jsx)("button",{type:"button",className:"diff-line-btn diff-line-add-btn"+(n?" diff-line-btn-on":""),"aria-label":"接受该行",onClick:i,children:"+"}),e.type==="del"&&(0,ke.jsx)("button",{type:"button",className:"diff-line-btn diff-line-del-btn"+(a?" diff-line-btn-on":""),"aria-label":"拒绝该行",onClick:i,children:"−"})]}),(0,ke.jsx)("span",{className:"diff-oldno",children:e.oldNo??""}),(0,ke.jsx)("span",{className:"diff-newno",children:e.newNo??""}),(0,ke.jsx)("span",{className:"diff-text",dangerouslySetInnerHTML:{__html:nA(e)}})]})}function nA(e){let t=e.words;if(t===void 0||t.length===0)return Ye(e.text);let n="";for(let a of t){let i=Ye(a.text);a.kind==="add"?n+='<span class="diff-word-add">'+i+"</span>":a.kind==="del"?n+='<span class="diff-word-del">'+i+"</span>":n+=i}return n}var nt=K(re(),1),aA={ts:"ts",tsx:"tsx",js:"js",jsx:"jsx",mjs:"js",cjs:"js",py:"py",sh:"sh",bash:"sh",zsh:"sh",json:"json",yaml:"yaml",yml:"yaml",html:"html",xml:"xml",htm:"html",css:"css",rs:"rs",go:"go",java:"java",cpp:"cpp",cc:"cpp",cxx:"cpp",h:"cpp",hpp:"cpp",c:"c",md:"md",markdown:"md",sql:"sql",txt:"text",log:"text",gitignore:"text",toml:"text"};function iA(e){let t=e.split(/[\\/]/).pop()??"",n=t.lastIndexOf("."),a=n>0?t.slice(n+1).toLowerCase():t.toLowerCase();return a==="gitignore"||a==="dockerignore"?"text":aA[a]??"text"}function rA(e){let t=e.split(/[\\/]/).pop()??"",n=t.lastIndexOf("."),a=n>0?t.slice(n+1).toLowerCase():"";return a==="md"||a==="markdown"||a==="mdx"}function oA(e){let t=e.split(/[\\/]/).pop()??"",n=t.lastIndexOf("."),a=n>0?t.slice(n+1).toLowerCase():"";return a==="html"||a==="htm"}function XN({path:e,sessionId:t,onClose:n}){let[a,i]=(0,Kr.useState)({status:"loading"});(0,Kr.useEffect)(()=>{let l=!0;return i({status:"loading"}),qf(e,t).then(d=>{l&&i({status:"ready",preview:d})},d=>{if(!l)return;let f=d instanceof Error?d.message:"文件不可读";i({status:"error",message:f})}),()=>{l=!1}},[e,t]);let r=a.status==="ready"?a.preview:null,o=r?.kind==="image",s=r!==null?r.name:e.split(/[\\/]/).pop()??e;return(0,nt.jsxs)(ht,{title:s,onClose:n,children:[a.status==="loading"&&(0,nt.jsx)("div",{className:"fp-loading",children:"正在读取文件…"}),a.status==="error"&&(0,nt.jsx)("div",{className:"fp-error",children:a.message}),r!==null&&(0,nt.jsxs)(nt.Fragment,{children:[(0,nt.jsxs)("div",{className:"fp-actions",children:[(0,nt.jsx)("span",{className:"fp-path",title:r.path,children:r.path}),!o&&(0,nt.jsxs)("button",{type:"button",className:"fp-copy",onClick:()=>{Qa(r.text,"已复制文件原文")},children:[(0,nt.jsx)(ip,{}),"复制原文"]})]}),o?(0,nt.jsx)("div",{className:"fp-image-wrap",children:(0,nt.jsx)("img",{className:"fp-image",src:r.dataUrl,alt:r.name,draggable:!1})}):(0,nt.jsx)(sA,{path:r.path,text:r.text})]})]})}function sA({path:e,text:t}){let n=iA(e),a=ic(t,n),i=e.split(/[\\/]/).pop()??e,r=rA(e),o=oA(e),s=(0,Kr.useMemo)(()=>r?rc(t):null,[r,t]);return s!==null?(0,nt.jsx)("div",{className:"chat-md-body fp-md",children:s.map(l=>l.kind==="think"?null:l.kind==="html"?(0,nt.jsx)("div",{className:"md-html",dangerouslySetInnerHTML:{__html:l.html}},l.id):l.kind==="code"?(0,nt.jsx)(gp,{lang:l.lang,code:l.code},l.id):(0,nt.jsx)(hp,{text:l.text},l.id))}):o?(0,nt.jsx)("iframe",{className:"fp-html",sandbox:"",title:i,srcDoc:t}):a!==null?(0,nt.jsx)(QN,{text:t,children:(0,nt.jsx)("div",{className:"fp-body",dangerouslySetInnerHTML:{__html:a}})}):(0,nt.jsx)(QN,{text:t,children:(0,nt.jsx)("pre",{className:"fp-body fp-plain",children:Ye(t)})})}var lA=60;function QN({text:e,children:t}){let n=(0,Kr.useMemo)(()=>e.split(`
`).length,[e]),[a,i]=(0,Kr.useState)(!1),r=n>lA,o=r&&!a;return(0,nt.jsxs)(nt.Fragment,{children:[(0,nt.jsx)("div",{className:"fp-scroll"+(o?" fp-scroll-folded":""),children:t}),r&&(0,nt.jsx)("button",{type:"button",className:"fp-fold-btn",onClick:()=>{i(s=>!s)},children:o?`展开全部（共 ${n} 行）`:"收起"})]})}var qo=K(Fe(),1);var Yr=K(re(),1);function ZN({src:e,alt:t,onClose:n}){let[a,i]=(0,qo.useState)("fit"),r=(0,qo.useRef)(0);(0,qo.useEffect)(()=>{let s=l=>{l.key==="Escape"&&n()};return window.addEventListener("keydown",s),()=>{window.removeEventListener("keydown",s)}},[n]),(0,qo.useEffect)(()=>{let s=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{document.body.style.overflow=s}},[]);let o=()=>{let s=Date.now();if(s-r.current<300){i(l=>l==="fit"?"full":"fit"),r.current=0;return}r.current=s};return(0,Yr.jsxs)("div",{className:"lightbox-backdrop",role:"dialog","aria-modal":"true","aria-label":t,onClick:n,children:[(0,Yr.jsx)("button",{type:"button",className:"lightbox-close","aria-label":"关闭",onClick:n,children:(0,Yr.jsx)(jr,{})}),(0,Yr.jsx)("div",{className:"lightbox-stage"+(a==="full"?" lightbox-stage-full":""),onClick:s=>{s.stopPropagation()},children:(0,Yr.jsx)("img",{className:"lightbox-img",src:e,alt:t,onClick:o,draggable:!1})}),(0,Yr.jsx)("div",{className:"lightbox-hint","aria-hidden":!0,children:"双击放大/还原 · 点背景关闭"})]})}function cv(){return typeof navigator>"u"||typeof navigator.mediaDevices?.getUserMedia!="function"||typeof AudioContext!="function"&&typeof window.webkitAudioContext!="function"?!1:window.isSecureContext===!0}function dA(e,t){let n=new Int16Array(e.length);for(let d=0;d<e.length;d++){let f=Math.max(-1,Math.min(1,e[d]));n[d]=f<0?f*32768:f*32767}let a=new ArrayBuffer(44),i=new DataView(a),r=(d,f)=>{for(let v=0;v<f.length;v++)i.setUint8(d+v,f.charCodeAt(v))},o=n.length*2;r(0,"RIFF"),i.setUint32(4,36+o,!0),r(8,"WAVE"),r(12,"fmt "),i.setUint32(16,16,!0),i.setUint16(20,1,!0),i.setUint16(22,1,!0),i.setUint32(24,t,!0),i.setUint32(28,t*2,!0),i.setUint16(32,2,!0),i.setUint16(34,16,!0),r(36,"data"),i.setUint32(40,o,!0);let s=new Uint8Array(44+o);s.set(new Uint8Array(a),0),s.set(new Uint8Array(n.buffer),44);let l="";for(let d=0;d<s.length;d+=32768)l+=String.fromCharCode(...s.subarray(d,d+32768));return btoa(l)}async function JN(e){if(!cv())throw new Error("此浏览器不支持录音（需要 HTTPS 访问）");let t;try{t=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:!0,noiseSuppression:!0}})}catch(v){if(e?.signal?.aborted===!0)throw new Error("录音已取消");let g=v instanceof DOMException?v.name:"";throw g==="NotAllowedError"?new Error("麦克风权限被拒绝，请在浏览器设置中允许"):g==="NotFoundError"?new Error("没有找到可用的麦克风"):new Error("录音启动失败")}if(e?.signal?.aborted===!0){for(let v of t.getTracks())v.stop();throw new Error("录音已取消")}let n=typeof AudioContext=="function"?AudioContext:window.webkitAudioContext,a=new n({sampleRate:16e3}),i=a.createMediaStreamSource(t),r=a.createScriptProcessor(4096,1,1),o=[],s=0,l=!1;r.onaudioprocess=v=>{if(l)return;let g=v.inputBuffer.getChannelData(0);o.push(new Float32Array(g)),s+=g.length,s/16e3*1e3>=6e4&&(l=!0,f(),e?.onTimeout?.())},i.connect(r);let d=a.createGain();d.gain.value=0,r.connect(d),d.connect(a.destination);let f=()=>{l=!0;try{r.disconnect()}catch{}try{i.disconnect()}catch{}try{d.disconnect()}catch{}for(let v of t.getTracks())v.stop();a.close().catch(()=>{})};return e?.signal!==void 0&&e.signal.addEventListener("abort",f,{once:!0}),{stop(){let v=new Float32Array(s),g=0;for(let w of o)v.set(w,g),g+=w.length;let h=dA(v,a.sampleRate);return f(),v.length/a.sampleRate<.4?Promise.reject(new Error("录音太短，请按住后说话至少 1 秒")):Promise.resolve(h)},cancel(){f()}}}var $N="dsh.palm.voiceServices";function cl(){try{let e=localStorage.getItem($N);if(e===null||e==="")return[];let t=JSON.parse(e);return Array.isArray(t)?t.filter(n=>{if(typeof n!="object"||n===null)return!1;let a=n;return typeof a.id=="string"&&typeof a.name=="string"&&typeof a.baseURL=="string"&&typeof a.apiKey=="string"&&typeof a.model=="string"}):[]}catch{return[]}}function oc(e){try{localStorage.setItem($N,JSON.stringify(e))}catch{}}function sc(){return cl()}function WN(e){let t=cl(),n=t.findIndex(a=>a.id===e.id);n===-1?t.push(e):t[n]=e,oc(t.slice(0,8)),lc()}function eT(e){oc(cl().filter(t=>t.id!==e)),lc()}function tT(e){let t=cl(),n=t.findIndex(i=>i.id===e);if(n<=0)return;let[a]=t.splice(n,1);t.splice(n-1,0,a),oc(t),lc()}function nT(e){let t=cl(),n=t.findIndex(i=>i.id===e);if(n===-1||n>=t.length-1)return;let[a]=t.splice(n,1);t.splice(n+1,0,a),oc(t),lc()}function aT(e){let t=cl().filter(n=>n.name!=="host 配置");oc(t.slice(0,8)),lc()}var uv=new Set;function lc(){for(let e of uv)e()}function iT(e){return uv.add(e),()=>{uv.delete(e)}}var Po=K(Fe(),1),vn=K(re(),1);function ki({title:e,body:t,confirmLabel:n,tone:a="primary",busy:i=!1,onConfirm:r,onCancel:o}){return(0,Po.useEffect)(()=>{let l=f=>{f.key==="Escape"&&o()};window.addEventListener("keydown",l);let d=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{window.removeEventListener("keydown",l),document.body.style.overflow=d}},[o]),(0,vn.jsx)("div",{className:"dialog-backdrop",onClick:o,children:(0,vn.jsxs)("div",{className:"dialog",role:"alertdialog","aria-modal":"true","aria-label":e,onClick:l=>{l.stopPropagation()},children:[(0,vn.jsx)("h2",{className:"dialog-title",children:e}),(0,vn.jsx)("div",{className:"dialog-body",children:t}),(0,vn.jsxs)("div",{className:"dialog-actions",children:[(0,vn.jsx)("button",{type:"button",className:"dialog-btn",disabled:i,onClick:o,children:"取消"}),(0,vn.jsx)("button",{type:"button",className:`dialog-btn ${a==="danger"?"dialog-btn-danger":"dialog-btn-primary"}`,disabled:i,onClick:r,children:i?"处理中…":n})]})]})})}function Vo({title:e,initial:t,confirmLabel:n,busy:a=!1,onConfirm:i,onCancel:r}){let[o,s]=(0,Po.useState)(t),l=(0,Po.useRef)(null);(0,Po.useEffect)(()=>{l.current?.select();let f=g=>{g.key==="Escape"&&r()};window.addEventListener("keydown",f);let v=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{window.removeEventListener("keydown",f),document.body.style.overflow=v}},[r]);let d=()=>{let f=o.trim();f!==""&&i(f)};return(0,vn.jsx)("div",{className:"dialog-backdrop",onClick:r,children:(0,vn.jsxs)("div",{className:"dialog",role:"dialog","aria-modal":"true","aria-label":e,onClick:f=>{f.stopPropagation()},children:[(0,vn.jsx)("h2",{className:"dialog-title",children:e}),(0,vn.jsx)("input",{ref:l,className:"dialog-input",value:o,"aria-label":e,disabled:a,onChange:f=>{s(f.target.value)},onKeyDown:f=>{f.key==="Enter"&&(f.preventDefault(),d())}}),(0,vn.jsxs)("div",{className:"dialog-actions",children:[(0,vn.jsx)("button",{type:"button",className:"dialog-btn",disabled:a,onClick:r,children:"取消"}),(0,vn.jsx)("button",{type:"button",className:"dialog-btn dialog-btn-primary",disabled:a||o.trim()==="",onClick:d,children:a?"保存中…":n})]})]})})}var pt=K(Fe(),1);var cA=16,Uo=new Map,fv=new Map;function pv(e){let t=Uo.get(e);if(t!==void 0)return Uo.delete(e),Uo.set(e,t),t}async function rT(e,t){let n=pv(t);if(n!==void 0)return n;let a=fv.get(t);if(a!==void 0)return await a;let i=zk(e,t).then(r=>{if(Uo.set(t,r.dataUrl),Uo.size>cA){let o=Uo.keys().next();o.done||Uo.delete(o.value)}return r.dataUrl}).catch(()=>{}).finally(()=>{fv.delete(t)});return fv.set(t,i),await i}var kt=K(Fe(),1);var uA=16,Bo=new Map,mv=new Map;function oT(e,t){return e+"\0"+t}function fA(e,t){let n=oT(e,t),a=Bo.get(n);if(a!==void 0)return Bo.delete(n),Bo.set(n,a),a}async function sT(e,t){let n=fA(e,t);if(n!==void 0)return n;let a=oT(e,t),i=mv.get(a);if(i!==void 0)return await i;let r=qf(t,e).then(o=>{if(o.kind==="image"){if(Bo.set(a,o.dataUrl),Bo.size>uA){let s=Bo.keys().next();s.done||Bo.delete(s.value)}return o.dataUrl}}).catch(()=>{}).finally(()=>{mv.delete(a)});return mv.set(a,r),await r}var ot=K(re(),1),bp=6e3,gv=800,pA=2e3;function mA(e){let t=e.trimEnd();if(t==="")return"";let n=t.lastIndexOf(`
`),a=n===-1?t:t.slice(n+1);return a.trim()===""?"":a}function gA(e){let t=e.trim();if(t==="")return"";let n=t.indexOf(`
`);return n===-1?t:t.slice(0,n)}var lT=5;function hA({text:e,pending:t,label:n="深度思考"}){let[a,i]=(0,kt.useState)(!1),[r,o]=(0,kt.useState)(!1),s=(0,kt.useRef)(null),l=t?mA(e):gA(e),d=(0,kt.useMemo)(()=>e.split(`
`),[e]),f=Math.max(0,d.length-lT);(0,kt.useEffect)(()=>{let g=s.current;a&&r&&g&&(g.scrollTop=g.scrollHeight)},[a,r,e]);let v=a&&!r&&f>0?d.slice(0,lT).join(`
`)+`
…`:e;return(0,ot.jsxs)("div",{className:`chat-disclosure chat-reasoning${a?" chat-disclosure-open":""}`,"data-pending":t||void 0,children:[(0,ot.jsxs)("button",{type:"button",className:"chat-disclosure-head","aria-expanded":a,onClick:()=>{i(g=>!g)},children:[(0,ot.jsx)("span",{className:"chat-disclosure-icon","aria-hidden":!0,children:(0,ot.jsx)(Yi,{})}),(0,ot.jsx)("span",{className:"chat-disclosure-label",children:t?"思考中…":n}),!a&&(0,ot.jsx)("span",{className:"chat-disclosure-summary",children:l}),(0,ot.jsx)("span",{className:"chat-disclosure-caret","aria-hidden":!0,children:(0,ot.jsx)(Zd,{})})]}),a&&(0,ot.jsxs)(ot.Fragment,{children:[(0,ot.jsx)("div",{className:"chat-disclosure-body",ref:s,children:v}),f>0&&(0,ot.jsx)("button",{type:"button",className:"chat-reasoning-more",onClick:()=>{o(g=>!g)},children:r?"收起":`还有 ${f} 行思考...`})]})]})}function vp({text:e,pending:t,forceOpen:n=!1,highlightQuery:a,sessionId:i}){let[r,o]=(0,kt.useState)(n);(0,kt.useEffect)(()=>{n&&o(!0)},[n]);let s=(0,kt.useRef)(null),l=(0,kt.useRef)(0),d=(0,kt.useRef)(null),f=(0,kt.useRef)(null),v=y=>{let N=f.current;if(N!==null&&y.startsWith(N.text)){let O=y.slice(N.text.length),T=N.html+Ye(O).replace(/\n/g,"<br />");return f.current={text:y,html:T},T}let D=Ye(y).replace(/\n/g,"<br />");return f.current={text:y,html:D},D},g=y=>y.length>pA?v(y):Ye(y).replace(/(^|[^`])`([^`\n]+)`(?=$|[^`])/g,"$1<code>$2</code>").replace(/\*\*([^*\n]+)\*\*/g,"<strong>$1</strong>").replace(/(^|[^*])\*([^*\n]+)\*(?=$|[^*])/g,"$1<em>$2</em>").replace(/~~([^~\n]+)~~/g,"<del>$1</del>").replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g,(D,O,T)=>{let z=pp(T);return z===null?D:`<a href="${Ye(z)}" target="_blank" rel="noopener noreferrer">${O}</a>`}).split(/\n{2,}/).map(D=>`<p>${D.replace(/\n/g,"<br />")}</p>`).join(""),[h,w]=(0,kt.useState)(()=>t?[{kind:"html",id:0,html:g(e)}]:rc(e)),x=(0,kt.useRef)(t?"":e),A=(0,kt.useRef)(t?e:"");(0,kt.useEffect)(()=>{if(t){if(s.current!==null&&e===A.current)return;A.current=e;let y=s.current;y===null&&(y={blocks:[],stableLen:0},s.current=y);let N=d.current,D=T=>T.replace(/\r\n/g,`
`);N!==null&&y.stableLen>0&&D(e).slice(0,y.stableLen)!==D(N).slice(0,y.stableLen)&&(y.blocks=[],y.stableLen=0,l.current=0),d.current=e;let O=BN(e,y.stableLen);for(let T of O.blocks){let z=y.blocks[y.blocks.length-1];T.kind==="html"&&z!==void 0&&z.block.kind==="html"?y.blocks[y.blocks.length-1]={id:z.id,block:{kind:"html",html:z.block.html+T.html}}:(y.blocks.push({id:l.current,block:T}),l.current+=1)}if(y.stableLen=O.stableLen,y.blocks.length===0){w([{kind:"html",id:0,html:g(e)}]);return}w([...y.blocks.map(T=>({id:T.id,...T.block})),...O.tail===""?[]:[{kind:"html",id:-1,html:g(O.tail)}]]);return}e!==x.current&&(x.current=e,s.current=null,d.current=null,w(rc(e)))},[e,t]);let p=!t&&e.length>bp,m=p&&!r,b=(0,kt.useRef)(null);return(0,kt.useEffect)(()=>{let y=b.current;if(y===null||i===void 0)return;let N=y.querySelectorAll("img.md-local-img[data-local-src]");for(let D of N){if(D.dataset.localState!==void 0)continue;let O=D.getAttribute("data-local-src");O===null||O===""||(D.dataset.localState="loading",sT(i,O).then(T=>{if(D.isConnected){if(T===void 0){D.dataset.localState="failed";return}D.dataset.localState="loaded",D.src=T}}))}},[h,i]),(0,ot.jsxs)("div",{className:"chat-msg-text chat-md"+(m?" chat-md-collapsed":""),children:[(0,ot.jsxs)("div",{className:"chat-md-body",ref:b,children:[h.map(y=>y.kind==="think"?null:y.kind==="html"?(0,ot.jsx)("div",{className:"md-html",dangerouslySetInnerHTML:{__html:bA(y.html,a)}},y.id):y.kind==="code"?(0,ot.jsx)(gp,{lang:y.lang,code:y.code},y.id):(0,ot.jsx)(hp,{text:y.text},y.id)),h.some(y=>y.kind==="think")&&(0,ot.jsx)("div",{className:"chat-md-notes",children:h.map(y=>y.kind!=="think"?null:(0,ot.jsx)(hA,{text:y.text,pending:!1,label:"思考过程"},y.id))})]}),p&&(0,ot.jsx)("button",{type:"button",className:"chat-msg-toggle",onClick:()=>{o(y=>!y)},children:r?"收起":"展开全文（"+e.length+" 字）"})]})}function dT({text:e,forceOpen:t=!1,highlightQuery:n}){let[a,i]=(0,kt.useState)(t);(0,kt.useEffect)(()=>{t&&i(!0)},[t]);let r=s=>vA(s,n);if(e.length<=bp)return(0,ot.jsx)("span",{className:"chat-msg-text",children:r(e)});let o=a?e:e.slice(0,gv);return(0,ot.jsxs)("span",{className:"chat-msg-text",children:[r(o),a?"":"…",(0,ot.jsx)("button",{type:"button",className:"chat-msg-toggle",onClick:()=>{i(s=>!s)},children:a?"收起":`展开全文（${e.length} 字）`})]})}function cT(e){let t=e?.trim();if(t===void 0||t==="")return;let a=t.split(/\s+/).filter(Boolean).map(i=>i.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"));return new RegExp(a.sort((i,r)=>r.length-i.length).join("|"),"gi")}function bA(e,t){let n=cT(t);return n===void 0?e:e.split(/(<[^>]+>)/g).map(a=>a.startsWith("<")?a:a.replace(n,i=>`<mark class="chat-search-mark">${i}</mark>`)).join("")}function vA(e,t){let n=cT(t);if(n===void 0)return e;let a=[],i=0;for(let r of e.matchAll(n)){let o=r.index;o>i&&a.push(e.slice(i,o)),a.push((0,ot.jsx)("mark",{className:"chat-search-mark",children:r[0]},`${o}:${r[0]}`)),i=o+r[0].length}return i<e.length&&a.push(e.slice(i)),a}var yA={bash:"bash",pwsh:"bash",read:"read",read_image:"read",web_fetch:"read",web_search:"search",grep:"search",glob:"search",write:"write",edit:"edit",run_code:"code"},xA={search:"搜索",read:"读取",bash:"运行命令",write:"写入",edit:"编辑",code:"运行代码",others:"工具"},wA={pwsh:"运行命令",read_image:"查看图片",web_fetch:"抓取网页",web_search:"联网搜索",grep:"搜索内容",glob:"查找文件"},kA={bash:["description","command"],read:["path","file_path","url"],search:["query","pattern","url"],write:["path","file_path"],edit:["path","file_path"],code:["description"],others:[]},SA=["path","file_path"],NA=new Set(["read","write","edit"]);function hv(e){let t=e.indexOf(`
`);return t===-1?e:e.slice(0,t)}function TA(e){try{let t=JSON.parse(e);return typeof t=="object"&&t!==null&&!Array.isArray(t)?t:void 0}catch{return}}function uT(e,t){for(let n of t){let a=e[n];if(typeof a=="string"&&a!=="")return a}}function EA(e){return yA[e]??"others"}function yp(e){let t=EA(e.name),n=e.arguments??"",a=n===""?void 0:TA(n),i="";if(a!==void 0){let s=t==="search"&&Array.isArray(a.queries)?a.queries:void 0;if(s!==void 0){let l=s.filter(d=>typeof d=="string"&&d!=="");l.length>0&&(i=l.map(hv).join("，"))}if(i===""&&(i=uT(a,kA[t])??""),i===""){for(let l of Object.values(a))if(typeof l=="string"&&l!==""){i=l;break}}}i===""&&(i=n===""?e.name:n),i=hv(i);let r=NA.has(t)&&a!==void 0?uT(a,SA):void 0,o=wA[e.name];return{variant:t,title:o??xA[t],summary:t==="others"&&o===void 0&&n!==""?`${e.name} · ${i}`:i,...r!==void 0?{filePath:hv(r)}:{}}}var CA={running:"深度求索中",ok:"已完成",stopped:"已中断",failed:"失败"};function xp(e){return CA[e]}function cc(e,t){return e.pending===!0||(e.tools??[]).some(n=>n.state==="running")||t!==void 0&&e.turn!==void 0&&e.turn===t}function MA(e,t){return cc(e,t)?"running":e.failed===!0?"failed":e.maxTokens===!0||(e.tools??[]).some(n=>n.state==="stopped")?"stopped":"ok"}function wp(e){if(e===void 0)return{adds:0,dels:0};let t=0,n=0;for(let a of e.diffs)a.oldText!==null&&(n+=dc(a.oldText).length),t+=dc(a.newText).length;return{adds:t,dels:n}}function dc(e){return e===""?[]:(e.endsWith(`
`)?e.slice(0,-1):e).split(`
`)}function fT(e){let t=Math.max(0,Math.round(e/1e3)),n=Math.floor(t/3600),a=Math.floor(t%3600/60),i=t%60;return n>0?`${n}小时${a}分`:a>0?`${a}分${i}秒`:`${i}秒`}function pT(e){return e.split(`
`).length}function AA(e){let t=0,n=0;for(let a of e){let i=wp(a.view);t+=i.adds,n+=i.dels}return{adds:t,dels:n}}function RA(e,t,n,a){for(let i=t.length-1;i>=0;i--){let r=t[i];if(!(r===void 0||r.kind!=="text")&&(r.seq!==void 0&&a!==void 0&&r.seq===a||r.text===n))return i}return-1}function gT(e,t){let n=e.flow??[],a=new Map((e.tools??[]).map(T=>[T.callId,T])),i=e.stepSeqs,r=e.stepTexts,o=i!==void 0&&r!==void 0&&i.length===r.length&&r.length>=2,s=o?r[r.length-1]??"":"",l=o?i[i.length-1]:void 0,d=o&&s.trim()!=="",f=cc(e,t),v,g,h=-1,w=!1;if(d)v=s,g=l,h=RA(e,n,s,l);else if(o){if(f)for(let T=n.length-1;T>=0;T--){let z=n[T];if(!(z===void 0||z.kind!=="text"||z.text.trim()==="")){v=z.text,g=z.seq,h=T;break}}}else{let T=n.filter(z=>z.kind==="text"&&z.text.trim()!=="");if(w=!0,e.text.trim()!=="")v=e.text,g=T[0]?.seq;else if(T.length>0){let z=T[T.length-1];z!==void 0&&(v=z.text,g=z.seq)}}let x=[],A=0,p=0;for(let T=0;T<n.length;T++){let z=n[T];if(!(z===void 0||T===h))if(z.kind==="reasoning"){if(z.text.trim()==="")continue;p+=1,x.push({kind:"reasoning",key:`r${T}`,text:z.text,lines:pT(z.text)})}else if(z.kind==="tool"){let $=a.get(z.callId);if($===void 0)continue;A+=1,x.push({kind:"tool",key:`t${T}`,tool:$})}else!w&&z.text.trim()!==""&&x.push({kind:"text",key:`x${T}`,text:z.text,...z.seq!==void 0?{seq:z.seq}:{}})}let m=new Set;for(let T of n)T.kind==="tool"&&m.add(T.callId);for(let T of e.tools??[])m.has(T.callId)||(A+=1,x.push({kind:"tool",key:`t-${T.callId}`,tool:T}));if(p===0&&(e.reasoning??"").trim()!==""){let T=e.reasoning??"";x.unshift({kind:"reasoning",key:"r-merged",text:T,lines:pT(T)}),p=1}v===void 0&&x.length===0&&e.text.trim()!==""&&(v=e.text);let b=OA(e,x,t),y=new Set,N="",D=0;for(let T of e.tools??[]){T.state==="error"&&(D+=1);for(let z of T.view?.diffs??[])y.add(z.path);N===""&&T.view!==void 0&&(N=T.view.title??T.name)}let O=AA(e.tools??[]);return{rows:x,answer:v,answerSeq:g,toolCount:A,reasoningCount:p,current:b,outcome:MA(e,t),changedFiles:y.size,errorCount:D,artifactTitle:N,artifactCount:x.filter(T=>T.kind==="tool"&&T.tool.view!==void 0).length,tallyAdds:O.adds,tallyDels:O.dels}}function OA(e,t,n){if(cc(e,n)){let i=[...e.flow??[]].reverse().find(o=>!(o.kind==="text"&&o.text.trim()===""));if(i===void 0||i.kind==="reasoning")return{kind:"thinking",text:"思考中"};if(i.kind==="text")return{kind:"answering",text:"正在回答"};let r=t.find(o=>o.kind==="tool"&&o.tool.callId===i.callId);return r===void 0||r.kind!=="tool"?{kind:"thinking",text:"思考中"}:r.tool.state==="running"?mT(r.tool):{kind:"thinking",text:"思考中"}}for(let a=t.length-1;a>=0;a-=1){let i=t[a];if(i!==void 0){if(i.kind==="tool")return mT(i.tool);if(i.kind==="reasoning")return{kind:"thinking",text:`深度思考 ${i.lines} 行`}}}}function mT(e){let t=yp(e);return{kind:"tool",text:t.summary===""?t.title:`${t.title} · ${t.summary}`,variant:t.variant}}function hT(e,t){return e.changedFiles>0?`改了 ${e.changedFiles} 个文件`:t?"未改动文件":""}function bT(e,t){let n=t?e.toolCount:0;return n>0?`共 ${n} 步`:""}function vT(e){return e.errorCount>0?`⚠ ${e.errorCount} 处报错`:""}function bv(e,t){return t?e.rows.length:e.rows.filter(n=>n.kind!=="tool").length+e.artifactCount}var _A=3e3;function yT(e,t){let n=t.running?"running":e.outcome==="running"?"ok":e.outcome,a=vv(n,t);return a===""?xp(n):`${xp(n)}，${a}`}function vv(e,t){return e==="running"?t.liveElapsedMs===void 0||t.liveElapsedMs<_A?"":`用时${fT(t.liveElapsedMs)}`:t.durationMs===void 0?"":`用时${fT(t.durationMs)}`}var H=K(re(),1),yv=(0,pt.memo)(function({message:t,sessionId:n,showToolCalls:a,showSystemMessages:i,showTime:r=!0,focused:o=!1,focusedQuery:s,style:l,onRegenerate:d,onOpenFile:f,clockOffsetMs:v,liveTurnStartAt:g,liveTurn:h}){let w=t.startSeq??t.seq;if(t.kind==="user"&&t.sourceKind!==void 0&&t.sourceKind!=="user"){let D=bS(t.sourceKind);if(D!==void 0){let O=$=>String($).padStart(2,"0"),T=new Date(t.time),z=`${O(T.getHours())}:${O(T.getMinutes())}`;return(0,H.jsxs)("details",{"data-mid":t.id,"data-message-id":t.id,"data-row-seq":w,className:"chat-trigger"+(o?" chat-msg-focus":""),style:l,children:[(0,H.jsxs)("summary",{className:"chat-trigger-head",children:[(0,H.jsx)("span",{className:"chat-trigger-icon","aria-hidden":!0,children:vS(t.sourceKind)}),(0,H.jsx)("span",{className:"chat-trigger-title",children:D}),r&&(0,H.jsx)("span",{className:"chat-trigger-time",children:z}),(0,H.jsx)("span",{className:"chat-trigger-caret","aria-hidden":!0,children:"▾"})]}),(0,H.jsxs)("div",{className:"chat-trigger-body",children:[(0,H.jsx)("p",{className:"chat-trigger-note",children:"这条通知触发了本轮回复。"}),t.text.trim()!==""&&(0,H.jsx)("div",{className:"chat-trigger-text",children:t.text})]})]})}if(!i)return null}if(t.kind==="command")return(0,H.jsxs)("div",{"data-mid":t.id,"data-message-id":t.id,"data-row-seq":w,className:"chat-command"+(t.commandPhase==="error"?" chat-command-error":"")+(o?" chat-msg-focus":""),style:l,role:"status",children:[(0,H.jsx)("span",{className:"chat-command-name",children:t.commandLine??"命令"}),(0,H.jsx)("span",{className:"chat-command-result",children:t.commandPhase==="running"?"执行中…":t.text})]});if(t.kind==="turn"){let D=(t.deliverables?.length??0)+(t.produced?.length??0);return D===0?null:(0,H.jsxs)("div",{"data-mid":t.id,"data-message-id":t.id,"data-row-seq":w,className:"chat-turn-tail",style:l,children:[(0,H.jsxs)("div",{className:"chat-turn-tail-head",children:[(0,H.jsx)("span",{className:"chat-turn-tail-title",children:"本轮产出"}),(0,H.jsxs)("span",{className:"chat-turn-tail-count",children:[D," 个文件"]})]}),t.deliverables!==void 0&&t.deliverables.length>0&&(0,H.jsxs)("div",{className:"chat-turn-tail-section",children:[(0,H.jsx)("span",{className:"chat-turn-tail-label",children:"交付物"}),t.deliverables.map(O=>(0,H.jsxs)("button",{type:"button",className:"chat-turn-tail-file",onClick:()=>{f?.(O.path)},children:[(0,H.jsxs)("span",{className:"chat-turn-tail-file-name",children:[O.description??FA(O.path),(0,H.jsx)("span",{className:"chat-turn-tail-badge",children:"已交付"})]}),(0,H.jsx)("span",{className:"chat-turn-tail-file-path",children:O.path})]},O.path))]}),t.produced!==void 0&&t.produced.length>0&&(0,H.jsxs)("div",{className:"chat-turn-tail-section",children:[(0,H.jsx)("span",{className:"chat-turn-tail-label",children:"本轮产出文件"}),t.produced.map(O=>(0,H.jsx)("button",{type:"button",className:"chat-turn-tail-file",onClick:()=>{f?.(O)},children:(0,H.jsx)("span",{className:"chat-turn-tail-file-path",children:O})},O))]})]})}let x=t.kind==="assistant"&&t.reasoning!==void 0&&t.reasoning!=="",A=a&&t.kind==="assistant"&&t.tools!==void 0&&t.tools.length>0,p=t.text!=="",m=t.failed===!0,b=n!==void 0&&t.images!==void 0&&t.images.length>0?t.images:void 0,y=b!==void 0,N=t.flow!==void 0&&t.flow.some(D=>D.kind==="text"&&D.text!=="");return!x&&!A&&!p&&!m&&!N&&!y?null:(0,H.jsxs)("div",{"data-mid":t.id,"data-message-id":t.id,"data-row-seq":w,className:`chat-msg chat-msg-${t.kind}${t.pending===!0?" chat-msg-pending":""}${t.failed===!0?" chat-msg-failed":""}${o?" chat-msg-focus":""}`,style:l,children:[t.kind==="assistant"?(0,H.jsx)(UA,{message:t,showToolCalls:a,forceOpen:o,focusedQuery:o?s:void 0,sessionId:n,clockOffsetMs:v,liveTurnStartAt:g,liveTurn:h}):(0,H.jsxs)(H.Fragment,{children:[(0,H.jsx)(dT,{text:t.text,forceOpen:o,highlightQuery:o?s:void 0}),b!==void 0&&n!==void 0&&(0,H.jsx)(IA,{sessionId:n,images:b})]}),t.failed===!0&&(0,H.jsx)("span",{className:"chat-msg-failtag",children:"本次回复失败"}),t.maxTokens===!0&&(0,H.jsx)("div",{className:"chat-msg-maxtokens",children:"已达到输出 token 上限，回答被截断。发送“继续”可让模型接着输出。"}),(0,H.jsxs)("span",{className:"chat-msg-footer",children:[r&&(0,H.jsx)("span",{className:"chat-msg-time",children:wT(t.time)}),t.kind==="assistant"&&d!==void 0&&(0,H.jsxs)("button",{type:"button",className:"chat-msg-regenerate",onClick:d,"aria-label":"重新生成回复",children:[(0,H.jsx)("span",{className:"chat-msg-regenerate-icon","aria-hidden":!0,children:"↻"}),"重新生成"]})]})]})});function IA({sessionId:e,images:t}){return(0,H.jsx)("div",{className:"chat-msg-images",role:"list","aria-label":"消息图片",children:t.map(n=>(0,H.jsx)(DA,{sessionId:e,image:n},n.attachmentId))})}function DA({sessionId:e,image:t}){let[n,a]=(0,pt.useState)(()=>pv(t.attachmentId)),[i,r]=(0,pt.useState)(!1),[o,s]=(0,pt.useState)(0),l=t.name!==void 0&&t.name!==""?t.name:"图片";return(0,pt.useEffect)(()=>{if(n!==void 0)return;let d=!1;return rT(e,t.attachmentId).then(f=>{d||(f===void 0?r(!0):(r(!1),a(f)))}),()=>{d=!0}},[e,t.attachmentId,n,o]),n===void 0?(0,H.jsx)("button",{type:"button",role:"listitem",className:`chat-msg-image chat-msg-image-placeholder${i?" chat-msg-image-failed":""}`,"aria-label":i?`${l}，加载失败，点击重试`:`${l}，加载中`,onClick:()=>{i&&(r(!1),s(d=>d+1))},children:i?"图片加载失败，点击重试":"图片加载中…"}):(0,H.jsx)("img",{className:"chat-msg-image",role:"listitem",src:n,alt:l,loading:"lazy",...t.width>0?{width:t.width}:{},...t.height>0?{height:t.height}:{}})}function LA(e){let[t,n]=(0,pt.useState)(()=>Date.now());return(0,pt.useEffect)(()=>{if(!e)return;n(Date.now());let a=setInterval(()=>{n(Date.now())},1e3);return()=>{clearInterval(a)}},[e]),t}function zA({message:e,model:t,showToolCalls:n,focusedQuery:a,sessionId:i,clockOffsetMs:r,liveTurnStartAt:o,liveTurn:s}){let[l,d]=(0,pt.useState)(!1),f=cc(e,s),v=LA(f),g=e.turnStartAt??o,h=f&&g!==void 0?Math.max(0,v+(r??0)-g):void 0,w=(0,pt.useRef)({anchor:void 0,elapsed:0});w.current.anchor!==g&&(w.current={anchor:g,elapsed:0}),h!==void 0&&h>w.current.elapsed&&(w.current={anchor:g,elapsed:h});let x=f&&g!==void 0?w.current.elapsed:void 0,A=e.durationMs??(e.turnStartAt!==void 0?Math.max(0,e.time-e.turnStartAt):void 0),p=f?"running":t.outcome==="running"?"ok":t.outcome,m=yT(t,{running:f,durationMs:A,...x!==void 0?{liveElapsedMs:x}:{}}),b=xp(p),y=vv(p,{durationMs:A,...x!==void 0?{liveElapsedMs:x}:{}}),N=t.current,D=vT(t),O=D===""?m:`${m}，${D}`,T=hT(t,!f),z=bT(t,n),$=bv(t,n),X=f?"⏳":t.outcome==="failed"?"❌":t.outcome==="stopped"?"⏹️":"✅",Le=(0,H.jsx)("span",{className:`chat-proc-lead${f?" chat-proc-lead-running":""}`,"aria-hidden":!0,children:X});return $===0?(0,H.jsx)("div",{className:"chat-proc","data-proc-rows":"0",children:(0,H.jsxs)("div",{className:"chat-proc-head chat-proc-head-static",role:"status","aria-label":O,children:[(0,H.jsxs)("span",{className:"chat-proc-line chat-proc-label",children:[Le,(0,H.jsx)("span",{className:"chat-proc-state",children:b}),D!==""&&(0,H.jsx)("span",{className:"chat-proc-errors",children:D}),y!==""&&(0,H.jsx)("span",{className:"chat-proc-time",children:y})]}),N!==void 0&&(0,H.jsx)("span",{className:"chat-proc-line chat-proc-current",children:(0,H.jsx)("span",{className:"chat-proc-current-text",children:N.text})})]})}):(0,H.jsxs)("div",{className:`chat-proc${l?" chat-proc-open":""}${f?" chat-proc-running":""}`,"data-proc-rows":$,children:[(0,H.jsxs)("button",{type:"button",className:"chat-proc-head","aria-expanded":l,onClick:()=>{d(at=>!at)},children:[(0,H.jsxs)("span",{className:"chat-proc-line chat-proc-label",children:[Le,(0,H.jsx)("span",{className:"chat-proc-state",children:b}),D!==""&&(0,H.jsx)("span",{className:"chat-proc-errors",children:D}),y!==""&&(0,H.jsx)("span",{className:"chat-proc-time",children:y})]}),N!==void 0&&(0,H.jsxs)("span",{className:"chat-proc-line chat-proc-current",children:[(0,H.jsx)("span",{className:`chat-step-icon${N.variant===void 0?" chat-step-icon-thinking":""}${f&&N.variant==="bash"?" chat-step-icon-spin":""}`,"aria-hidden":!0,children:N.variant===void 0?"💭":xT(N.variant)}),(0,H.jsx)("span",{className:"chat-proc-current-text",children:N.text}),T!==""&&(0,H.jsx)("span",{className:"chat-proc-meta",children:T})]}),(0,H.jsx)("span",{className:"chat-proc-caret","aria-hidden":!0,children:l?"▾":"▸"})]}),l&&(0,H.jsxs)("div",{className:"chat-proc-body",children:[z!==""&&(0,H.jsx)("div",{className:"chat-proc-steps",children:z}),(0,H.jsx)(HA,{message:e,model:t,showToolCalls:n,focusedQuery:a,sessionId:i})]})]})}function HA({message:e,model:t,showToolCalls:n,focusedQuery:a,sessionId:i}){let r=[],o=[],s=0,l=0,d=()=>{o.length>0&&(r.push((0,H.jsx)(BA,{tools:o},`card-${s}`)),s+=1,o=[])};for(let f of t.rows){if(f.kind==="reasoning"){d(),r.push((0,H.jsx)(qA,{row:f},f.key));continue}if(f.kind==="tool"){n&&r.push((0,H.jsx)(PA,{tool:f.tool},f.key)),f.tool.view!==void 0?o.push(f.tool):d();continue}d();let v=f.seq??e.stepSeqs?.[l],g=(0,H.jsx)(vp,{text:f.text,pending:e.pending===!0,forceOpen:a!==void 0,highlightQuery:a,sessionId:i});r.push(v===void 0?(0,H.jsx)(pt.Fragment,{children:g},f.key):(0,H.jsx)("div",{className:"chat-flow-text","data-step-seq":v,"data-part-id":`text-${l}`,children:g},f.key)),l+=1}return d(),(0,H.jsx)(H.Fragment,{children:r})}function qA({row:e}){let[t,n]=(0,pt.useState)(!1);return(0,H.jsxs)("div",{className:"chat-think",children:[(0,H.jsxs)("button",{type:"button",className:"chat-think-head","aria-expanded":t,onClick:()=>{n(a=>!a)},children:[(0,H.jsx)("span",{className:"chat-think-icon","aria-hidden":!0,children:"✦"}),(0,H.jsxs)("span",{className:"chat-think-label",children:["深度思考 · ",e.lines," 行"]}),(0,H.jsx)("span",{className:"chat-think-caret","aria-hidden":!0,children:t?"▾":"▸"})]}),t&&(0,H.jsx)("div",{className:"chat-think-body",children:e.text})]})}function PA({tool:e}){let[t,n]=(0,pt.useState)(!1),a=yp(e),i=e.state??"running",r=e.view===void 0?void 0:wp(e.view);return(0,H.jsxs)("div",{className:"chat-step","data-state":i,children:[(0,H.jsxs)("button",{type:"button",className:"chat-step-head","aria-expanded":t,onClick:()=>{n(o=>!o)},children:[(0,H.jsx)("span",{className:"chat-step-icon","aria-hidden":!0,children:xT(a.variant)}),(0,H.jsx)("span",{className:"chat-step-title",children:a.title}),(0,H.jsx)("span",{className:"chat-step-summary",children:a.summary}),(0,H.jsx)("span",{className:`chat-step-state chat-step-state-${i}`,children:VA[i]??i}),r!==void 0&&(0,H.jsxs)("span",{className:"chat-step-tally","aria-hidden":!0,children:[(0,H.jsxs)("span",{className:"chat-step-tally-add",children:["+",r.adds]}),(0,H.jsxs)("span",{className:"chat-step-tally-del",children:["−",r.dels]})]}),(0,H.jsx)("span",{className:"chat-step-caret","aria-hidden":!0,children:t?"▾":"▸"})]}),t&&e.arguments!==void 0&&(0,H.jsx)("pre",{className:"chat-tool-args",children:e.arguments})]})}var VA={running:"运行中",ok:"完成",error:"失败",stopped:"已中断"};function xT(e){return e==="search"?"🔍":e==="read"?"📂":e==="bash"?"⚙️":e==="write"||e==="edit"?"✏️":e==="code"?"💻":"🔧"}function UA({message:e,showToolCalls:t,forceOpen:n,focusedQuery:a,sessionId:i,clockOffsetMs:r,liveTurnStartAt:o,liveTurn:s}){let l=(0,pt.useMemo)(()=>gT(e,s),[e,s]),f=bv(l,t)>0||e.durationMs!==void 0||e.turnStartAt!==void 0,v=l.answer;return(0,H.jsxs)(H.Fragment,{children:[f&&(0,H.jsx)(zA,{message:e,model:l,showToolCalls:t,focusedQuery:a,sessionId:i,clockOffsetMs:r,liveTurnStartAt:o,liveTurn:s}),v!==void 0&&v!==""&&(l.answerSeq===void 0?(0,H.jsx)(vp,{text:v,pending:e.pending===!0,forceOpen:n,highlightQuery:a,sessionId:i}):(0,H.jsx)("div",{className:"chat-flow-text chat-flow-answer","data-step-seq":l.answerSeq,"data-part-id":"answer",children:(0,H.jsx)(vp,{text:v,pending:e.pending===!0,forceOpen:n,highlightQuery:a,sessionId:i})}))]})}function BA({tools:e}){let t=(0,pt.useMemo)(()=>{let n=e.filter(a=>a.view!==void 0);if(n.length!==0)return{card:"diff",title:n.length===1?n[0]?.view?.title??n[0]?.name??"":`编辑了 ${n.length} 个文件`,diffs:n.flatMap(a=>a.view?.diffs??[])}},[e]);return t===void 0?null:(0,H.jsx)(jA,{tool:{...e.find(n=>n.view!==void 0),view:t}})}function jA({tool:e}){let[t,n]=(0,pt.useState)(!1),a=(0,pt.useRef)(null),i=e.view,r=(0,pt.useMemo)(()=>wp(i),[i]);return(0,pt.useEffect)(()=>{let o=a.current;o!==null&&(o.style.maxHeight=t?`${o.scrollHeight}px`:"0px")},[t,i]),i===void 0?null:(0,H.jsxs)("div",{className:"chat-artifact",children:[(0,H.jsxs)("button",{type:"button",className:"chat-artifact-head","aria-expanded":t,onClick:()=>{n(o=>!o)},children:[(0,H.jsx)("span",{className:"chat-artifact-title",children:i.title??e.name}),(0,H.jsxs)("span",{className:"chat-artifact-summary",children:[(0,H.jsxs)("span",{className:"chat-artifact-stat chat-artifact-stat-add",children:["+",r.adds]}),(0,H.jsxs)("span",{className:"chat-artifact-stat chat-artifact-stat-del",children:["−",r.dels]})]}),(0,H.jsx)("span",{className:"chat-artifact-caret","aria-hidden":!0,children:t?"▾":"▸"})]}),t&&(0,H.jsx)(GA,{view:i,diffRef:a})]})}function GA({view:e,diffRef:t}){let n=(0,pt.useMemo)(()=>{let a=[];for(let i of e.diffs){if(a.push({kind:"path",text:i.path}),i.oldText!==null)for(let r of dc(i.oldText))a.push({kind:"del",text:r});for(let r of dc(i.newText))a.push({kind:"add",text:r})}return a},[e]);return(0,H.jsx)("div",{ref:t,className:"chat-tool-diff",style:{maxHeight:0},children:n.map((a,i)=>(0,H.jsxs)("div",{className:"chat-tool-diff-row"+(a.kind==="del"?" chat-tool-diff-del":a.kind==="add"?" chat-tool-diff-add":" chat-tool-diff-path"),children:[a.kind!=="path"&&(0,H.jsx)("span",{className:"chat-tool-diff-sign","aria-hidden":!0,children:a.kind==="del"?"−":"+"}),(0,H.jsx)("span",{className:"chat-tool-diff-text",children:a.text})]},i))})}function FA(e){let t=e.split(/[\\/]/);return t[t.length-1]||e}var qt=K(Fe(),1);var U=K(re(),1);function xv(e){if(!kT(e))return;let t=Array.isArray(e.options)?e.options:[],n=[];for(let i of t){if(!kT(i))continue;let r=typeof i.value=="string"?i.value:void 0,o=typeof i.name=="string"?i.name:void 0;r===void 0||o===void 0||n.push({value:r,name:o,...typeof i.description=="string"?{description:i.description}:{}})}let a=typeof e.currentValue=="string"?e.currentValue:void 0;if(!(a===void 0||n.length===0))return{options:n,currentValue:a}}function kT(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function NT({commands:e,onPickImage:t,onPickCamera:n,onPickCommand:a,onClose:i}){return(0,U.jsx)(ht,{title:"添加内容",onClose:i,children:(0,U.jsxs)("div",{role:"menu","aria-label":"添加内容",children:[(0,U.jsxs)("button",{type:"button",role:"menuitem",className:"sheet-option",onClick:t,children:[(0,U.jsxs)("span",{className:"sheet-option-copy",children:[(0,U.jsx)("span",{className:"sheet-option-title",children:"图片"}),(0,U.jsx)("span",{className:"sheet-option-desc",children:"从相册选择"})]}),(0,U.jsxs)("svg",{viewBox:"0 0 16 16",width:"18",height:"18","aria-hidden":"true",focusable:"false",children:[(0,U.jsx)("rect",{x:"1.5",y:"1.5",width:"13",height:"13",rx:"2.5",fill:"none",stroke:"currentColor",strokeWidth:"1.6"}),(0,U.jsx)("circle",{cx:"6",cy:"6",r:"1.6",fill:"currentColor"}),(0,U.jsx)("path",{d:"M2 11.5 L5.5 8 L8 10.5 L10.5 8 L14 11.5",fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinejoin:"round"})]})]}),(0,U.jsxs)("button",{type:"button",role:"menuitem",className:"sheet-option",onClick:n,children:[(0,U.jsxs)("span",{className:"sheet-option-copy",children:[(0,U.jsx)("span",{className:"sheet-option-title",children:"拍照"}),(0,U.jsx)("span",{className:"sheet-option-desc",children:"调用相机拍摄"})]}),(0,U.jsxs)("svg",{viewBox:"0 0 16 16",width:"18",height:"18","aria-hidden":"true",focusable:"false",children:[(0,U.jsx)("path",{d:"M2 5.5 A1.5 1.5 0 0 1 3.5 4 H5 L6 2.5 H10 L11 4 H12.5 A1.5 1.5 0 0 1 14 5.5 V12 A1.5 1.5 0 0 1 12.5 13.5 H3.5 A1.5 1.5 0 0 1 2 12 Z",fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinejoin:"round"}),(0,U.jsx)("circle",{cx:"8",cy:"8.75",r:"2.4",fill:"none",stroke:"currentColor",strokeWidth:"1.6"})]})]}),(0,U.jsx)("div",{className:"sheet-option-divider",role:"separator"}),e===void 0?(0,U.jsx)("p",{className:"sheet-note",children:"命令加载中…"}):e.length===0?(0,U.jsx)("p",{className:"sheet-note",children:"没有可用命令"}):e.map(r=>(0,U.jsx)("button",{type:"button",role:"menuitem",className:"sheet-option",onClick:()=>{a(`/${r.name}`)},children:(0,U.jsxs)("span",{className:"sheet-option-copy",children:[(0,U.jsxs)("span",{className:"sheet-option-title",children:["/",r.name]}),(0,U.jsx)("span",{className:"sheet-option-desc",children:r.description})]})},r.name))]})})}function TT({sessionId:e,current:t,onCurrent:n,onClose:a}){let[i,r]=(0,qt.useState)({status:"loading"}),[o,s]=(0,qt.useState)(!1),[l,d]=(0,qt.useState)(void 0),f=(0,qt.useCallback)(()=>{r({status:"loading"}),Dd(e).then(b=>{r({status:"ready",data:b})},b=>{r({status:"error",message:he(b)})})},[e]);(0,qt.useEffect)(()=>{f()},[f]);let v=(0,qt.useCallback)(b=>{o||(s(!0),d(void 0),Hf(e,b).then(y=>{s(!1),n(y.selected),a()},y=>{s(!1),d(he(y))}))},[o,e,n,a]);if(i.status==="loading")return(0,U.jsx)(ht,{title:"模型与思考强度",onClose:a,children:(0,U.jsx)("div",{className:"sheet-status",children:"正在加载模型目录…"})});if(i.status==="error")return(0,U.jsx)(ht,{title:"模型与思考强度",onClose:a,children:(0,U.jsxs)("div",{className:"sheet-status sheet-status-error",children:[(0,U.jsx)("span",{children:i.message}),Xa(i.message)!==void 0&&(0,U.jsx)("span",{className:"sheet-hint",children:Xa(i.message)}),(0,U.jsx)("button",{type:"button",className:"chat-load-older",onClick:f,children:"重试"})]})});let{data:g}=i,h=t??g.current,w=g.groups.flatMap(b=>b.models.map(y=>({group:b,model:y}))),A=w.find(b=>b.group.id===h.provider&&b.model.id===h.model)?.model.reasoning,p=h.reasoningEffort??A?.defaultEffort,m=A===void 0?[]:[...A.defaultEffort===void 0?[{key:"provider-default",effort:void 0,label:"跟随模型默认"}]:[],...A.efforts.map(b=>({key:`effort:${b.id}`,effort:b.id,label:b.name,description:b.description}))];return(0,U.jsxs)(ht,{title:"模型与思考强度",onClose:a,children:[l!==void 0&&(0,U.jsx)("p",{className:"sheet-error",children:l}),l!==void 0&&Xa(l)!==void 0&&(0,U.jsx)("p",{className:"sheet-hint",children:Xa(l)}),g.failures.map(b=>(0,U.jsxs)("p",{className:"sheet-error",children:[b.name,": ",b.message]},b.id)),g.groups.length===0&&w.length===0&&(0,U.jsx)("div",{className:"sheet-status",children:"没有可用的模型"}),g.groups.map(b=>(0,U.jsxs)("div",{className:"sheet-section",children:[(0,U.jsx)("div",{className:"sheet-section-title",children:b.name}),b.models.map(y=>{let N=h.provider===b.id&&h.model===y.id;return(0,U.jsxs)("button",{type:"button",className:`sheet-option${N?" sheet-option-selected":""}`,disabled:o,onClick:()=>{v({provider:b.id,model:y.id,...y.reasoning?.defaultEffort===void 0?{}:{reasoningEffort:y.reasoning.defaultEffort}})},children:[(0,U.jsxs)("span",{className:"sheet-option-copy",children:[(0,U.jsx)("span",{className:"sheet-option-title",children:y.name}),y.description!==void 0&&(0,U.jsx)("span",{className:"sheet-option-desc",children:y.description})]}),N&&(0,U.jsx)("span",{className:"sheet-option-check","aria-hidden":!0,children:"√"})]},y.id)})]},b.id)),m.length>0&&(0,U.jsxs)("div",{className:"sheet-section",children:[(0,U.jsx)("div",{className:"sheet-section-title",children:"思考强度"}),m.map(b=>{let y=p===b.effort;return(0,U.jsxs)("button",{type:"button",className:`sheet-option${y?" sheet-option-selected":""}`,disabled:o,onClick:()=>{v({provider:h.provider,model:h.model,...b.effort!==void 0?{reasoningEffort:b.effort}:{}})},children:[(0,U.jsx)("span",{className:"sheet-option-copy",children:(0,U.jsx)("span",{className:"sheet-option-title",children:b.label})}),y&&(0,U.jsx)("span",{className:"sheet-option-check","aria-hidden":!0,children:"√"})]},b.key)})]})]})}function ET({sessionId:e,value:t,onChanged:n,onClose:a}){let[i,r]=(0,qt.useState)(null),[o,s]=(0,qt.useState)(!1),[l,d]=(0,qt.useState)(void 0),f=(0,qt.useCallback)(g=>{o||(s(!0),d(void 0),Id(e,`/permission ${g}`).then(h=>{if(s(!1),r(null),!h.matched){d("权限命令未在宿主注册，无法切换");return}n(g),a()},h=>{s(!1),r(null),d(he(h))}))},[o,e,n,a]),v=g=>{if(g===t.currentValue){a();return}if(g==="danger-full-access"){r(g);return}f(g)};return i!==null?(0,U.jsxs)(ht,{title:"确认完全权限",onClose:()=>{r(null)},children:[(0,U.jsx)("p",{className:"sheet-confirm-desc",children:"开启完全权限后，远程会话可以在工作区内执行任意操作（包括运行命令、修改所有文件与访问凭证）。 仅在您信任当前设备和网络时开启。"}),l!==void 0&&(0,U.jsx)("p",{className:"sheet-error",children:l}),(0,U.jsxs)("div",{className:"sheet-confirm-actions",children:[(0,U.jsx)("button",{type:"button",className:"mobile-button",disabled:o,onClick:()=>{r(null)},children:"取消"}),(0,U.jsx)("button",{type:"button",className:"sheet-confirm-danger",disabled:o,onClick:()=>{f(i)},children:o?"提交中…":"确认开启"})]})]}):(0,U.jsxs)(ht,{title:"权限",onClose:a,children:[l!==void 0&&(0,U.jsx)("p",{className:"sheet-error",children:l}),t.options.map(g=>{let h=g.value===t.currentValue;return(0,U.jsxs)("button",{type:"button",className:`sheet-option${h?" sheet-option-selected":""}`,disabled:o,onClick:()=>{v(g.value)},children:[(0,U.jsxs)("span",{className:"sheet-option-copy",children:[(0,U.jsx)("span",{className:"sheet-option-title",children:g.name}),g.description!==void 0&&(0,U.jsx)("span",{className:"sheet-option-desc",children:g.description})]}),h&&(0,U.jsx)("span",{className:"sheet-option-check","aria-hidden":!0,children:"√"})]},g.value)})]})}function CT({entries:e,currentTurn:t,onPick:n,onClose:a}){return(0,U.jsx)(ht,{title:`轮次 · 共 ${e.length} 轮`,onClose:a,children:e.length===0?(0,U.jsx)("p",{className:"sheet-note",children:"当前会话没有可跳转的轮次"}):(0,U.jsx)("div",{className:"turn-list",role:"list","aria-label":"轮次清单",children:e.map(i=>{let r=i.turn===t;return(0,U.jsxs)("button",{type:"button",role:"listitem",className:"turn-row"+(r?" turn-row-current":""),onClick:()=>{n(i)},children:[(0,U.jsx)("span",{className:"turn-row-accent","aria-hidden":!0}),(0,U.jsxs)("span",{className:"turn-row-copy",children:[(0,U.jsxs)("span",{className:"turn-row-head",children:[(0,U.jsxs)("span",{className:"turn-row-num",children:["#",i.turn]}),(0,U.jsx)("span",{className:"turn-row-prompt",children:i.prompt})]}),(0,U.jsx)("span",{className:"turn-row-response",children:i.response})]}),!i.loaded&&(0,U.jsx)("span",{className:"turn-row-dot","aria-hidden":!0,title:"未加载"})]},i.turn)})})})}function MT({approval:e,sessionId:t,onResolved:n}){let[a,i]=(0,qt.useState)(!1),[r,o]=(0,qt.useState)(void 0),s=l=>{a||(i(!0),o(void 0),Jk(e.rpcId,t,e.approvalId,l).then(()=>{n(e.approvalId)},d=>{i(!1),o(d instanceof Error?d.message:String(d))}))};return(0,U.jsxs)("div",{className:"chat-approval-panel",role:"alert",children:[(0,U.jsxs)("div",{className:"chat-approval-header",children:[(0,U.jsx)("span",{className:"chat-tool-pill",children:e.toolName}),e.reason!==void 0&&(0,U.jsx)("span",{className:"chat-approval-reason",children:e.reason})]}),r!==void 0&&(0,U.jsx)("p",{className:"chat-approval-error",children:r}),(0,U.jsxs)("div",{className:"chat-approval-actions",children:[(0,U.jsx)("button",{type:"button",className:"chat-approval-allow",disabled:a,onClick:()=>{s("allowed-once")},children:a?"提交中…":"允许一次"}),(0,U.jsx)("button",{type:"button",className:"chat-approval-reject",disabled:a,onClick:()=>{s("rejected")},children:"拒绝"})]})]})}function ST(e){return e.map(t=>`${t.rpcId}\0${t.id}`).join("|")}function AT({questions:e,sessionId:t,onResolved:n}){let a=G2(e),[i,r]=(0,qt.useState)(()=>new Map(a.map(x=>[x.id,{selected:[],custom:""}]))),[o,s]=(0,qt.useState)(()=>ST(a)),[l,d]=(0,qt.useState)(!1),[f,v]=(0,qt.useState)(void 0);(0,qt.useEffect)(()=>{let x=ST(a);x!==o&&(s(x),r(new Map(a.map(A=>[A.id,{selected:[],custom:""}]))))},[a,o]);let g=(x,A,p)=>{r(m=>{let b=new Map(m),y=b.get(x)??{selected:[],custom:""};if(p){let N=new Set(y.selected);N.has(A)?N.delete(A):N.add(A),b.set(x,{...y,selected:[...N]})}else b.set(x,{...y,selected:[A]});return b})},h=(x,A)=>{r(p=>{let m=new Map(p),b=m.get(x)??{selected:[],custom:""};return m.set(x,{...b,custom:A}),m})},w=()=>{if(l||a.length===0)return;let x=a[0].rpcId;d(!0),v(void 0);let A=a.map(p=>{let m=i.get(p.id)??{selected:[],custom:""};return{id:p.id,selected:m.selected,...m.custom.trim()!==""?{custom:m.custom.trim()}:{}}});$k(x,t,{answers:A}).then(()=>{n(x)},p=>{d(!1),v(p instanceof Error?p.message:String(p))})};return(0,U.jsxs)("div",{className:"chat-question-panel",role:"form","aria-label":"问题",children:[a.map(x=>{let A=i.get(x.id)??{selected:[],custom:""};return(0,U.jsxs)("div",{className:"chat-question-group",children:[x.header!==void 0&&(0,U.jsx)("div",{className:"chat-question-header",children:x.header}),(0,U.jsx)("div",{className:"chat-question-text",children:x.question}),x.detail!==void 0&&(0,U.jsx)("div",{className:"chat-question-detail",children:x.detail}),x.options!==void 0&&x.options.length>0&&(0,U.jsx)("div",{className:"chat-question-options",role:"group","aria-label":x.question,children:x.options.map(p=>{let m=A.selected.includes(p.label);return(0,U.jsxs)("label",{className:`chat-question-option${m?" chat-question-option-selected":""}`,children:[(0,U.jsx)("input",{type:x.multiSelect?"checkbox":"radio",name:`q-${x.id}`,checked:m,onChange:()=>{g(x.id,p.label,x.multiSelect===!0)}}),(0,U.jsx)("span",{className:"chat-question-option-label",children:p.label}),p.description!==void 0&&(0,U.jsx)("span",{className:"chat-question-option-desc",children:p.description})]},p.label)})}),(0,U.jsx)("textarea",{className:"chat-question-custom",placeholder:"自定义回答（可选）",rows:2,value:A.custom,onChange:p=>{h(x.id,p.target.value)}})]},x.id)}),f!==void 0&&(0,U.jsx)("p",{className:"chat-approval-error",children:f}),(0,U.jsx)("button",{type:"button",className:"chat-question-submit",disabled:l,onClick:w,children:l?"提交中…":"提交回答"})]})}function RT(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function wv(e){let t=Array.isArray(e)?e:RT(e)&&Array.isArray(e.turns)?e.turns:[],n=[];for(let a of t){if(!RT(a))continue;let i=a.turn,r=a.seq,o=a.prompt,s=a.response;typeof i!="number"||!Number.isFinite(i)||typeof r!="number"||!Number.isFinite(r)||typeof o=="string"&&typeof s=="string"&&n.push({turn:i,seq:r,prompt:o,response:s,loaded:!1})}return n}function OT(e,t){let n=new Map;for(let a of e)n.has(a.turn)||n.set(a.turn,a);for(let a of t)(a.loaded||!n.has(a.turn))&&n.set(a.turn,a);return[...n.values()].sort((a,i)=>a.turn-i.turn)}function _T(e,t){if(e.length===0)return;let n=Math.min(Math.max(t,0),e.length-1);for(let a=n;a<e.length;a++){let i=e[a]?.turn;if(i!==void 0)return i}for(let a=n-1;a>=0;a--){let i=e[a]?.turn;if(i!==void 0)return i}}function IT(e){let t=new Map,n;for(let a of e){if(a.kind==="user"||a.kind==="command"){n={text:a.text,seq:a.startSeq??a.seq};continue}if(a.kind!=="assistant"||a.turn===void 0)continue;let i=a.startSeq??a.seq,r=t.get(a.turn);r===void 0?t.set(a.turn,{seq:i,prompt:n?.text??"",response:a.text}):(i<r.seq&&(r.seq=i),r.prompt===""&&n!==void 0&&(r.prompt=n.text),r.response===""&&(r.response=a.text)),n=void 0}return[...t.entries()].map(([a,i])=>({turn:a,seq:i.seq,prompt:i.prompt,response:i.response,loaded:!0})).sort((a,i)=>a.turn-i.turn)}function kv(e,t,n,a){if(a<=1)return 0;let i=n-t;if(!(i>0))return 0;let r=(Math.min(Math.max(e,t),n)-t)/i;return Math.min(a-1,Math.max(0,Math.round(r*(a-1))))}function kp(e,t,n){let a=e.findIndex(i=>i.turn===t);return a>=0?a:e.findIndex(i=>n>=(i.startSeq??i.seq)&&n<=i.seq)}var ca=K(re(),1);function DT(e,t){return t<=1?0:e/(t-1)*100}function LT({entries:e,index:t}){let n=e.length,a=Math.min(Math.max(t,0),Math.max(0,n-1)),i=e[a],r=e[n-1]?.turn??0,o=DT(a,n),s=i?.prompt===""?"（这一轮没有提问）":i?.prompt,l=i?.response===""?"（没有回复预览）":i?.response;return(0,ca.jsxs)("div",{className:"turn-scrub",role:"status","aria-live":"polite","aria-label":"轮次刮擦",children:[(0,ca.jsxs)("div",{className:"turn-scrub-head",children:[(0,ca.jsxs)("span",{className:"turn-scrub-num",children:["第 ",i?.turn??0," / ",r," 轮"]}),(0,ca.jsx)("span",{className:"turn-scrub-title",children:s})]}),(0,ca.jsx)("div",{className:"turn-scrub-sub",children:l}),(0,ca.jsxs)("div",{className:"turn-scrub-track",children:[(0,ca.jsx)("div",{className:"turn-scrub-rail"}),(0,ca.jsx)("div",{className:"turn-scrub-fill",style:{width:`${o}%`}}),n<=40&&e.map((d,f)=>(0,ca.jsx)("i",{className:"turn-scrub-tick"+(f===a?" turn-scrub-tick-at":""),style:{left:`${DT(f,n)}%`}},d.turn)),(0,ca.jsx)("div",{className:"turn-scrub-knob",style:{left:`${o}%`}})]}),(0,ca.jsx)("div",{className:"turn-scrub-hint",children:i?.loaded===!0?"左右拖动选轮次 · 松手跳转":"左右拖动选轮次 · 松手跳转（需先载入历史）"})]})}var M=K(re(),1);function zT(e){return e.turn!==void 0&&e.step!==void 0?`t${e.turn}.${e.step}`:e.id}function KA(e){let t;for(let n of e)n.kind!=="assistant"||n.turn===void 0||(t===void 0||n.turn>t)&&(t=n.turn);return t}function YA(e){let t=e.data;if(typeof t!="object"||t===null||Array.isArray(t))return;let n=t.turn;return typeof n=="number"&&Number.isFinite(n)?n:void 0}var QA=8,Mp=30;function HT(){return Math.max(Mp+40,window.innerWidth-Mp)}var XA=24,qT=500;function Sp(e){return e>=1e6?`${(e/1e6).toFixed(1).replace(/\.0$/,"")}M`:e>=1e3?`${Math.round(e/1e3)}k`:String(e)}function PT(e){let t=e.split("-").filter(Boolean);return t.length<=2?e:t.slice(-2).join("-")}function ZA(e){if(e==="danger-full-access")return"full";if(e.includes("write"))return"write";if(e.includes("read"))return"read"}var _n=80,JA=15e3,$A=1500,VT=1e4,WA=3,eR=6e3;var tR=1500,nR=15e3,Np=120,aR=30,iR=4096,jo=20,Tp=24,UT=22,BT=38,rR=12;function Qi(e){return e.replace(/\\/g,"\\\\").replace(/"/g,'\\"')}var oR=96,sR=220;function Ep(e){if(e.kind==="user"){let o=Math.max(1,Math.ceil(e.text.length/BT)),s=(e.images?.length??0)*sR;return 28+o*UT+s}let t=20;e.reasoning!==void 0&&e.reasoning!==""&&(t+=32),e.tools!==void 0&&e.tools.length>0&&(t+=28);let n=e.text;if(n==="")return t+24;let a=!e.pending&&n.length>bp,i=a?gv:n.length,r=Math.max(1,Math.ceil(i/BT));return t+=Math.min(r,rR)*UT,a&&(t+=30),t+16}function lR(e){return/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e)?e.split("-").map(t=>t.charAt(0).toUpperCase()+t.slice(1)).join(" "):e}function GT({session:e,mux:t,onBack:n,showToolCalls:a,showSystemMessages:i,initialFocusSeq:r,initialFocusMessageId:o,initialFocusPartId:s,initialFocusQuery:l}){let[d,f]=(0,S.useState)([]),v=Ff(),g=c=>{f(Ka(c))},[h,w]=(0,S.useState)(!1),x=(0,S.useRef)(()=>{}),A=(0,S.useRef)(!1),[p,m]=(0,S.useState)(!0),[b,y]=(0,S.useState)(void 0),[N,D]=(0,S.useState)(()=>M2(e.sessionId)),O=(0,S.useRef)(N);O.current=N;let[T,z]=(0,S.useState)(!1),$=(0,S.useRef)(T);$.current=T;let X=(0,S.useRef)(void 0),Le=(0,S.useRef)(!1),at=(0,S.useRef)(void 0),Te=(0,S.useRef)(d),[je,Je]=(0,S.useState)({start:0,end:0}),Qt=(0,S.useRef)(je);Qt.current=je;let xe=(0,S.useRef)(void 0),_t=(0,S.useRef)(0),$e=(0,S.useRef)(!1),Vt=(0,S.useRef)(!1),Ie=(0,S.useRef)(0),qe=(0,S.useRef)(0),Xt=(0,S.useRef)(new Map),[St,Gn]=(0,S.useState)(0);Te.current=d;let Nt=(0,S.useRef)(!0),ut=(0,S.useRef)([]),bt=(0,S.useRef)(void 0),j=(0,S.useRef)([]),Z=(0,S.useRef)(void 0),de=(0,S.useCallback)(()=>{Z.current===void 0&&(Z.current=requestAnimationFrame(()=>{Z.current=void 0;let c=j.current;if(j.current=[],c.length===0)return;let k=bt.current,C=c[c.length-1];Bd("state",{seq:C?.seq,frame:"session/event",detail:`batch:${c.length}`}),f(_=>Ka(k===void 0?qr(c,_):k.fold(c)))}))},[]),Ee=(0,S.useRef)(!1),Re=(0,S.useRef)(void 0),Ce=(0,S.useRef)(0),Fn=(0,S.useRef)(void 0),[vt,fa]=(0,S.useState)(void 0),[Kn,yn]=(0,S.useState)(void 0),[yt,In]=(0,S.useState)(void 0),[pa,Rt]=(0,S.useState)(null),[nn,fn]=(0,S.useState)(null),[ma,xn]=(0,S.useState)(null),[wn,Ut]=(0,S.useState)(null),[qa,kn]=(0,S.useState)(!1),[Zt,q]=(0,S.useState)(!1),[F,se]=(0,S.useState)({status:"idle"}),[Se,Tt]=(0,S.useState)(!1),[Et,Bt]=(0,S.useState)([]),Yn=(0,S.useRef)(Et);(0,S.useEffect)(()=>{Yn.current=Et},[Et]),(0,S.useEffect)(()=>{if(N===""){Lo(e.sessionId);return}let c=setTimeout(()=>{zb(e.sessionId,N)},tR);return()=>{clearTimeout(c)}},[N,e.sessionId]),(0,S.useEffect)(()=>()=>{O.current!==""&&zb(e.sessionId,O.current)},[e.sessionId]);let Qn=(0,S.useRef)(null),Pa=(0,S.useRef)(null),[Dn,Ji]=(0,S.useState)(void 0),[Sn,an]=(0,S.useState)(void 0),[Xr,$i]=(0,S.useState)(!1),[Xn,Zr]=(0,S.useState)(()=>typeof navigator<"u"&&navigator.onLine===!1),[Ja,P]=(0,S.useState)(0),[ne,W]=(0,S.useState)([]),[J,le]=(0,S.useState)(!1),[ce,ft]=(0,S.useState)(""),[Ge,xt]=(0,S.useState)("recording"),Pe=(0,S.useRef)(void 0),ga=(0,S.useRef)(!0),It=(0,S.useRef)(void 0),[Jr,Ln]=(0,S.useState)(!0),[jt,Wi]=(0,S.useState)(!1),[zp,er]=(0,S.useState)(void 0),[vc,ul]=(0,S.useState)(()=>t?.cachedQueueFor(e.sessionId)??[]),[Hp,tr]=(0,S.useState)(null),fl=(0,S.useRef)(Date.now()),Go=(0,S.useRef)(0),Fo=(0,S.useRef)(Date.now()),[yc,$r]=(0,S.useState)(!1),[Wr,Ko]=(0,S.useState)(!1),[xc,wc]=(0,S.useState)(()=>t?.cachedJobsFor(e.sessionId)??[]),[E,te]=(0,S.useState)(void 0),pn=(0,S.useCallback)(c=>{c!==void 0&&te(k=>k!==void 0&&c.seq<=k.seq?k:c)},[]),pl=(0,S.useCallback)(c=>{let k=pb(c.data);k!==void 0&&pn({seq:c.seq,items:k})},[pn]),zn=(0,S.useCallback)(()=>{te(c=>c===void 0?c:{seq:c.seq,items:c.items.map(k=>k.status==="in_progress"?{...k,status:"completed"}:k)})},[]),[Yo,W4]=(0,S.useState)([]),[e5,zv]=(0,S.useState)(!1),[kc,qp]=(0,S.useState)(!1),[Pp,ml]=(0,S.useState)([]),[Sc,gl]=(0,S.useState)([]),[Nc,Hv]=(0,S.useState)(e.title),[t5,hl]=(0,S.useState)(!1),[n5,Tc]=(0,S.useState)(!1),[Ec,a5]=(0,S.useState)(void 0),Jt=(0,S.useMemo)(()=>OT(wv(Ec),IT(d)),[Ec,d]),bl=Jt[Jt.length-1]?.turn??0,qv=(0,S.useMemo)(()=>wv(Ec).reduce((c,k)=>Math.max(c,k.turn),0),[Ec]),Vp=qv>0?qv:bl,[Cc,Up]=(0,S.useState)(0),Pv=Cc>0?Cc:bl,[Qo,Vv]=(0,S.useState)(()=>Hb(e.sessionId)),Uv=(0,S.useRef)(Cc);Uv.current=Cc;let Bv=(0,S.useRef)(Jt);Bv.current=Jt;let Bp=(0,S.useRef)(Vp);Bp.current=Vp;let jp=(0,S.useRef)(e.sessionId);jp.current=e.sessionId;let eo=(0,S.useRef)(void 0),Mc=(0,S.useRef)(void 0),Ac=(0,S.useRef)(void 0),vl=(0,S.useRef)(0),[yl,Rc]=(0,S.useState)(void 0),Xo=(0,S.useRef)(void 0),[i5,Gp]=(0,S.useState)(!1),[r5,Fp]=(0,S.useState)(!1),[Zn,Ni]=(0,S.useState)(void 0),[Kp,Yp]=(0,S.useState)(void 0),[nr]=(0,S.useState)(()=>jf());(0,S.useEffect)(()=>{let c=!1;return Of().then(k=>{c||Ln(k.mobileEnterToSend!==!1)},()=>{}),()=>{c=!0}},[]);let Ti=(0,S.useCallback)(()=>{nc().then(c=>{P(c.length),W(c)})},[]);(0,S.useEffect)(()=>{let c=()=>{Zr(typeof navigator<"u"&&navigator.onLine===!1),Ti()};return c(),window.addEventListener("online",c),window.addEventListener("offline",c),()=>{window.removeEventListener("online",c),window.removeEventListener("offline",c)}},[Ti]);let o5=(0,S.useCallback)(c=>{tc(c).then(()=>{Ti()})},[Ti]),Qp=(0,S.useCallback)(()=>{_N(c=>Oo(c.sessionId,Cp(c.text))).then(({sent:c,failed:k})=>{c>0&&Y(k>0?`已同步 ${c} 条，${k} 条待重试`:`已同步 ${c} 条消息`),Ti(),c>0&&t?.poke()})},[t,Ti]),s5=(0,S.useCallback)(async(c,k)=>{try{await zf(e.sessionId,c,{kind:"edit",content:[{type:"text",text:k}]})}catch{Y("消息已开始发送，无法编辑")}},[e.sessionId]),l5=(0,S.useCallback)(async c=>{try{await zf(e.sessionId,c,{kind:"remove"})}catch{Y("消息已开始发送，无法删除")}},[e.sessionId]),d5=(0,S.useCallback)(async c=>{try{await zf(e.sessionId,c,{kind:"steer"})}catch(k){let C=k instanceof Ro?k.error.code:void 0;if(C==="steer-unavailable"){Y("当前轮次已结束，无法插话"),Wi(!1),er(void 0),tr(null);return}Y(C==="queue-item-not-found"?"消息已开始发送，无法插话":"插话失败")}},[e.sessionId]);(0,S.useEffect)(()=>{Xn||nc().then(c=>{c.length!==0&&Qp()})},[Xn,Qp]),(0,S.useEffect)(()=>{if(!Se||Dn!==void 0)return;let c=!1;return Gk(e.sessionId).then(k=>{c||Ji(k)},()=>{c||Ji([])}),()=>{c=!0}},[Se,Dn,e.sessionId]);let Xp=(0,S.useCallback)((c,k,C)=>{let _=c.to+1,B=()=>{uc(e.sessionId,_,k).then(G=>{if(C())return;let Q=bt.current,ue=Ka(G.rows).filter(ve=>(ve.startSeq??ve.seq)>=c.from);ue.length>0&&(Q===void 0?f(ve=>Ka([...ue,...ve])):(Q.prepend(ue),f(Ka(Q.snapshot()))));let Oe=ue.length>0?ue[0]?.startSeq??ue[0]?.seq:void 0;Oe===void 0||Oe<=c.from||!G.hasMore||Oe>=_||(_=Oe,B())},G=>{C()||console.warn("history gap refill failed",G)})};B()},[e.sessionId]);(0,S.useEffect)(()=>{let c=!1,k=new AbortController,C=setTimeout(()=>{k.abort(new DOMException("history load timed out","TimeoutError"))},3e4);Nt.current=!0,ut.current=[],Ee.current=!1,Re.current=void 0,A.current=!1,bt.current=void 0,j.current=[],Z.current!==void 0&&(cancelAnimationFrame(Z.current),Z.current=void 0),Hv(e.title),wl.current=!1,$p.current=void 0,m(!0),y(void 0),f([]),ml([]),gl([]),yn(void 0),te(void 0),Wi(e.running===!0),er(void 0),tr(null);let _=!1,B=!1;return _2(e.sessionId).then(G=>{if(c||_||G===void 0)return;B=!0;let Q=new Fi(G.rows,G.maxSeq);bt.current=Q,g(Q.fold([])),w(G.hasMore),m(!1)}),uc(e.sessionId,void 0,k.signal).then(G=>{if(c)return;_=!0;let Q=ut.current;ut.current=[],Nt.current=!1;let me=new Fi(G.rows,G.maxSeq);bt.current=me,g(me.fold(Q)),w(G.hasMore),G.todo!==void 0&&pn(G.todo),G.hasMore&&!A.current&&!B&&(A.current=!0,x.current(!0)),m(!1),G.turnStartAt!==void 0&&(tr(Oe=>Oe??G.turnStartAt??null),Wi(!0),er(void 0));let ue=G.projections?.values;if(fa(xv(ue?.permissions)),yn(jT(ue?.contextPressure)),a5(ue?.turnOutline),Re.current!==void 0){let Oe=Re.current;Re.current=void 0,Ee.current=!1,Xp(Oe,k.signal,()=>c)}},G=>{if(c)return;let Q=ut.current;if(ut.current=[],Nt.current=!1,Q.length>0){let me=bt.current;f(Ka(me===void 0?qr(Q):me.fold(Q)))}y(he(G)),m(!1)}),Dd(e.sessionId).then(G=>{c||(In(G.current),se(Q=>Q.status==="idle"?{status:"ready",data:G}:Q))},G=>{c||se(Q=>Q.status==="idle"?{status:"error",message:he(G)}:Q)}),()=>{c=!0,clearTimeout(C),k.abort()}},[e.sessionId]),(0,S.useEffect)(()=>{if(t!==void 0)return t.onFrame((c,k)=>{let C=c.event;if(typeof C?.time=="number"&&Number.isFinite(C.time)&&C.type!=="turn/start"&&(Go.current=C.time-Date.now()),Fo.current=Date.now(),$r(!1),Ko(!1),c.type==="session/event"){if(c.sessionId!==e.sessionId)return;let _=c.view===void 0?c.event:{...c.event,view:c.view};if(typeof _.type=="string"&&(_.type==="turn/start"&&(Wi(!0),$r(!1),er(YA(_)),tr(typeof _.time=="number"&&Number.isFinite(_.time)?_.time:Date.now()),Zp.current(),te(void 0),(0,S.startTransition)(()=>{ul([])})),_.type==="turn/end"&&(Wi(!1),er(void 0),tr(null),zn()),_.type==="todo/write"&&(0,S.startTransition)(()=>{pl(_)})),Nt.current){if(ut.current.length>=qT){let B=ut.current.shift();if(B!==void 0){let G=Re.current;Re.current=G===void 0?{from:B.seq,to:B.seq}:{from:Math.min(G.from,B.seq),to:Math.max(G.to,B.seq)}}Ee.current||(console.warn(`history tail is slow: live buffer reached ${qT} events; the dropped seq window will be re-fetched`),Ee.current=!0)}ut.current.push(_);return}j.current.push(_),de();return}if(c.type==="session/projection"&&c.sessionId===e.sessionId){c.key==="permissions"&&fa(xv(c.value)),c.key==="contextPressure"&&yn(jT(c.value));return}if(c.type==="session/jobs"&&c.sessionId===e.sessionId){(0,S.startTransition)(()=>{wc(c.jobs)});return}if(c.type==="session/subscribed"&&c.sessionId===e.sessionId){(0,S.startTransition)(()=>{ul([]),wc([])});return}if(c.type==="session/queue"&&c.sessionId===e.sessionId){(0,S.startTransition)(()=>{ul((c.items??[]).map(_=>Lf({id:String(_.id),placement:_.placement,message:_.message})))});return}if(!(!("sessionId"in c)||c.sessionId!==e.sessionId)){if(c.type==="approval/requested"){(0,S.startTransition)(()=>{ml(_=>Qb(e.sessionId).has(c.approvalId)||_.some(B=>B.approvalId===c.approvalId)?_:[..._,{rpcId:k??"",approvalId:c.approvalId,toolName:c.toolName,callId:c.callId,reason:c.reason}])});return}if(c.type==="approval/resolved"){(0,S.startTransition)(()=>{ml(_=>_.filter(B=>B.approvalId!==c.approvalId))});return}if(c.type==="question/requested"){let B=c.questions.map(G=>({rpcId:k??"",...G})).filter(G=>!Yb(e.sessionId).has(G.rpcId));(0,S.startTransition)(()=>{gl(B)});return}if(c.type==="question/resolved"){(0,S.startTransition)(()=>{gl([])});return}}})},[t,e.sessionId]),(0,S.useEffect)(()=>{if(!jt||!v)return;let c=!1,k,C=()=>{if(c)return;Zk(e.sessionId).then(B=>{c||(0,S.startTransition)(()=>{ml(G=>Q2(G,B.approvals,Qb(e.sessionId))),gl(G=>F2(G,B.questions,Yb(e.sessionId)))})},()=>{});let _=t?.isSseLive()??!0;k=setTimeout(C,_?JA*4:$A)};return C(),()=>{c=!0,k!==void 0&&clearTimeout(k)}},[jt,e.sessionId,t,v]),(0,S.useEffect)(()=>{if(!jt||!v)return;let c=!1,k=0,C=setInterval(()=>{t?.isSseLive()===!0&&Date.now()-Fo.current<VT||Hr().then(_=>{if(c)return;k=0,Ko(!1);let B=_.items.find(G=>G.sessionId===e.sessionId);B!==void 0&&B.running!==!1||Gi(e.sessionId,void 0,1).then(G=>{if(!c)for(let Q=G.events.length-1;Q>=0;Q--){let me=G.events[Q]?.event?.type;if(me==="turn/end"){Wi(!1),er(void 0),zn();return}if(me==="turn/start"){let ue=G.events[Q]?.event?.time;typeof ue=="number"&&Number.isFinite(ue)&&tr(Oe=>Oe??ue);return}}},()=>{})},()=>{c||(k+=1,k>=WA&&Ko(!0))})},VT);return()=>{c=!0,clearInterval(C)}},[jt,e.sessionId,zn,v]);let Oc=(0,S.useCallback)(()=>{mN(e.sessionId).then(c=>{(0,S.startTransition)(()=>{W4(c)})},()=>{})},[e.sessionId]),Zp=(0,S.useRef)(Oc);Zp.current=Oc,(0,S.useEffect)(()=>{Oc()},[Oc]),(0,S.useEffect)(()=>{if(!jt||!v)return;let c=setInterval(()=>{Zp.current()},sp);return()=>{clearInterval(c)}},[jt,v]);let[,jv]=(0,S.useState)(0),xl=Hp??(jt?fl.current:null),Gv=jt?zp??KA(d):void 0;(0,S.useEffect)(()=>{if(xl===null){$r(!1),jv(0);return}if(!v)return;let c=xl,k=()=>{let _=Date.now()-Fo.current>eR;$r(B=>B===_?B:_),jv(Math.max(0,Date.now()+Go.current-c))};k();let C=setInterval(k,1e3);return()=>clearInterval(C)},[xl,v]);let[Jp,c5]=(0,S.useState)(0);(0,S.useEffect)(()=>{if(d.length<Np){at.current=void 0;return}let c=[0],k=0;for(let C of d)k+=C.pending===!0?oR:Xt.current.get(C.id)??Ep(C),c.push(k);at.current=c},[d,St,Jp]);let Fv=(0,S.useCallback)(()=>{let c=at.current;if(c===void 0||Jn.current)return;let k=X.current,C=Te.current.length;if(Qt.current.end===C&&Ie.current<=_n)return;let _=(k?.scrollTop??_t.current)-qe.current,B=0,G=C-1;for(;B<G;){let ve=B+G+1>>1;c[ve]!==void 0&&c[ve]<=_?B=ve:G=ve-1}let Q=Math.max(0,B-jo),me=Te.current[C-1],Oe=me!==void 0&&me.pending===!0?C:Math.min(C,B+Tp+jo);Je(ve=>ve.start===Q&&ve.end===Oe?ve:{start:Q,end:Oe})},[]),ar=(0,S.useCallback)(()=>{xe.current===void 0&&(xe.current=requestAnimationFrame(()=>{xe.current=void 0,Fv()}))},[Fv]),_c=(0,S.useCallback)(()=>{let c=Te.current[Te.current.length-1];c!==void 0&&(kl.current=Math.max(kl.current,c.turn??0)),Qv(0)},[]),u5=c=>{let k=Te.current,C=k.length;if(C===0)return;let _=at.current,B;if(_!==void 0){let G=c-qe.current,Q=0,me=C-1;for(;Q<me;){let ue=Q+me+1>>1;_[ue]!==void 0&&_[ue]<=G?Q=ue:me=ue-1}B=Q}else{let G=0;B=C-1;for(let Q=0;Q<C;Q++)if(G+=Ep(k[Q]),G>c){B=Q;break}}return _T(k,B)},f5=(0,S.useCallback)(()=>{let c=X.current;if(c===void 0)return;_t.current=c.scrollTop;let k=c.scrollHeight-c.scrollTop-c.clientHeight;Ie.current=k;let C=$e.current;C?$e.current=!1:Zo.current=!1,Yv(k>_n);let _=k>_n;if(!C){let B=u5(c.scrollTop)??0;Up(B),eo.current!==void 0&&window.clearTimeout(eo.current),eo.current=window.setTimeout(()=>{if(eo.current=void 0,!_)return;let G=Bp.current;B>0&&B!==G&&qb(jp.current,B)},1e3)}k<=_n&&_c(),ar()},[_c,ar]);(0,S.useEffect)(()=>()=>{xe.current!==void 0&&cancelAnimationFrame(xe.current),Z.current!==void 0&&cancelAnimationFrame(Z.current)},[]),(0,S.useEffect)(()=>(Vv(Hb(e.sessionId)),()=>{eo.current!==void 0&&(window.clearTimeout(eo.current),eo.current=void 0);let c=Uv.current,k=Bp.current;Ie.current<=_n||c>0&&c!==k&&qb(e.sessionId,c)}),[e.sessionId]);let ir=(0,S.useCallback)((c,k)=>{c.scrollTop!==k&&($e.current=!0),c.scrollTop=k,_t.current=c.scrollTop},[]),ha=(0,S.useCallback)(()=>{let c=X.current;if(c===void 0)return;ir(c,c.scrollHeight);let k=Te.current.length;if(k>0){let C=Math.max(0,k-Tp-jo);Je(_=>_.start===C&&_.end===k?_:{start:C,end:k})}ar()},[ar,ir]),Ic=(0,S.useCallback)(()=>{let c=X.current;if(c===void 0)return;let k=at.current,C=Te.current.length,_=k!==void 0&&C>0?(k[C]??c.scrollHeight)+qe.current:c.scrollHeight;ir(c,_),ar()},[ar,ir]),$p=(0,S.useRef)(void 0),wl=(0,S.useRef)(!1),[Kv,Yv]=(0,S.useState)(!1),[Dc,Qv]=(0,S.useState)(0),kl=(0,S.useRef)(0),p5=(0,S.useCallback)(()=>{Ie.current=0,Yv(!1),_c(),ha()},[_c,ha]),Lc=(0,S.useCallback)((c,k)=>{let C=Te.current,_=kp(C,k??-1,c);if(_<0)return;let B=C[_];if(nm(B.id),qc.current=c,no.current=!1,Jn.current=!0,Zo.current=!0,Ie.current=Number.MAX_SAFE_INTEGER,C.length>=Np){let me=Math.max(0,_-jo),ue=Math.min(C.length,_+Tp+jo);Je(Oe=>Oe.start===me&&Oe.end===ue?Oe:{start:me,end:ue})}let Q=B.turn;Q!==void 0&&Up(Q)},[]),Sl=(0,S.useCallback)(c=>{if(Tc(!1),kp(Te.current,c.turn,c.seq)>=0){Lc(c.seq,c.turn);return}if(!h){Y("没有更早的轮次");return}let C=Jt.findIndex(B=>B.turn===c.turn),_=C>=0?Jt[C+1]?.seq:void 0;Up(0),Y("正在载入…"),Mc.current=c.seq,Ac.current=c.turn,vl.current=0,x.current(!0,_??c.seq+1)},[h,Lc,Jt]),m5=(0,S.useCallback)(()=>{let c=Qo;if(c===void 0)return;Vv(void 0),Pb(jp.current);let k=Bv.current.find(C=>C.turn===c);k!==void 0&&Sl(k)},[Qo,Sl]),g5=(0,S.useCallback)(c=>{Jt.length<2||(Xo.current={pointerId:c.pointerId,startX:c.clientX,moved:!1},Rc(kv(c.clientX,Mp,HT(),Jt.length)),c.currentTarget.setPointerCapture(c.pointerId))},[Jt.length]),h5=(0,S.useCallback)(c=>{let k=Xo.current;k===void 0||k.pointerId!==c.pointerId||(Math.abs(c.clientX-k.startX)>QA&&(k.moved=!0),Rc(kv(c.clientX,Mp,HT(),Jt.length)))},[Jt.length]),b5=(0,S.useCallback)(c=>{let k=Xo.current;if(k===void 0||k.pointerId!==c.pointerId)return;Xo.current=void 0;let C=yl;if(Rc(void 0),c.currentTarget.hasPointerCapture(c.pointerId)&&c.currentTarget.releasePointerCapture(c.pointerId),!k.moved){Tc(!0);return}let B=C===void 0?void 0:Jt[C];B!==void 0&&Sl(B)},[Sl,yl,Jt]),Xv=(0,S.useCallback)(c=>{let k=Xo.current;k===void 0||k.pointerId!==c.pointerId||(Xo.current=void 0,Rc(void 0))},[]);(0,S.useEffect)(()=>{let c=Mc.current;if(c===void 0)return;let k=Ac.current;if(kp(Te.current,k??-1,c)>=0){Mc.current=void 0,Ac.current=void 0,vl.current=0,Lc(c,k);return}if(!h||vl.current>=XA){Mc.current=void 0,Ac.current=void 0,vl.current=0,Y("没能跳到那一轮：历史太深了");return}vl.current+=1,x.current(!0)},[d,h,Lc]),(0,S.useLayoutEffect)(()=>{let c=d[d.length-1];if(c===void 0)return;let k=c.seq+":"+(c.pending===!0?"p":"f");if(!(k===$p.current||($p.current=k,Bd("commit",{seq:c.seq,frame:"session/event",detail:c.kind}),X.current===void 0))){if(!wl.current){wl.current=!0,kl.current=c.turn??0,ha();return}(c.turn??0)>kl.current&&(kl.current=c.turn??0,Ie.current>_n&&Qv(_=>_+1)),nr&&(Ie.current>_n||Zo.current||ha())}},[d,ha,nr]),(0,S.useLayoutEffect)(()=>{Vt.current&&(Vt.current=!1,!(Ie.current>_n)&&ha())},[d,ha]),(0,S.useEffect)(()=>{Sc.length===0&&Pp.length===0||!nr||X.current===void 0||Ie.current>_n||ha()},[Sc.length,Pp.length,ha,nr]),(0,S.useEffect)(()=>{let c=window.visualViewport;if(c==null)return;let k=c,C=()=>{nr&&(Ie.current>_n||ha())};return k.addEventListener("resize",C),()=>{k.removeEventListener("resize",C)}},[nr,ha]),(0,S.useEffect)(()=>{if(Zn===void 0)return;let c=window.setTimeout(()=>{Ni(void 0)},3e3);return()=>{clearTimeout(c)}},[Zn]);let v5=(0,S.useCallback)(c=>{an(c.slice(0,200))},[]),y5=(0,S.useCallback)((c,k)=>{Yp(void 0),Oo(e.sessionId,Cp(`用户修改了之前的提问，请忽略旧提问的回复，按修改后的内容重新回答：

${k}`)).then(()=>{t?.poke()},()=>{Y("重新发送失败，请重试")})},[e.sessionId,t]),x5=(0,S.useCallback)(c=>{let k=Te.current,C=k.findIndex(G=>G.id===c.id),_="";for(let G=C-1;G>=0;G--){let Q=k[G];if(Q!==void 0&&Q.kind==="user"){_=Q.text;break}}let B=_!==""?`请忽略上一条回答，针对原始问题重新作答：

${_}`:"请忽略上一条回答，重新作答刚才的问题。";Oo(e.sessionId,Cp(B)).then(()=>{t?.poke()},()=>{Y("重新生成失败，请重试")})},[e.sessionId,t]),Zv=(0,S.useCallback)(()=>{Fn.current?.abort();let c=new AbortController;Fn.current=c;let k=Ce.current+1;Ce.current=k,Nt.current=!0,uc(e.sessionId,void 0,c.signal).then(C=>{if(k!==Ce.current)return;let _=ut.current;ut.current=[],Nt.current=!1;let B=new Fi(C.rows,C.maxSeq);bt.current=B,g(B.fold(_)),w(C.hasMore);let G=Re.current;G!==void 0&&(Re.current=void 0,Ee.current=!1,Xp(G,c.signal,()=>k!==Ce.current))},()=>{if(k!==Ce.current)return;Nt.current=!1;let C=ut.current;if(ut.current=[],C.length>0){let _=bt.current;f(Ka(_===void 0?qr(C):_.fold(C)))}})},[e.sessionId,Xp]),Wp=(0,S.useCallback)(c=>(Y(`正在执行 ${c.trim().split(/\s+/)[0]}…`),Id(e.sessionId,c).then(k=>{if(t?.poke(),k.matched){Zv(),k.text!==void 0&&k.text!==""&&Y(k.text);return}return Oo(e.sessionId,Cp(c)).then(()=>{t?.poke()})},k=>{y(he(k))})),[e.sessionId,t,Zv]),w5=(0,S.useCallback)(async c=>{Gp(!1);try{await Yk(e.sessionId,c),Hv(c),Y("已重命名")}catch(k){Y(he(k))}},[e.sessionId]),k5=(0,S.useCallback)(()=>{Fp(!1),f([]),up(e.sessionId).then(()=>{Ti()}),Ld(e.sessionId).catch(c=>{Y(`删除未生效：${he(c)}`)}),n()},[e.sessionId,n,Ti]),S5=(0,S.useCallback)(()=>{e.blank&&Te.current.length===0&&!$.current&&(g2(e.sessionId),Gi(e.sessionId,void 0,1).then(c=>{c.events.some(C=>C.event.type==="user/message"||C.event.type==="assistant/message")||Ld(e.sessionId).catch(()=>{})},()=>{})),n()},[e,n]),Jv=(c,k,C)=>{if(window.getSelection()?.toString()!=="")return!1;let _=c instanceof Element?c:null;if(_!==null&&_.closest("img")!==null)return!1;let B=_?.closest(".chat-msg")??null;if(B===null)return!1;let G=B.getAttribute("data-mid"),Q=G===null?void 0:Te.current.find(ve=>ve.id===G);if(Q===void 0)return!0;let me=Q.flow!==void 0&&Q.flow.length>0?Q.flow.filter(ve=>ve.kind==="text").map(ve=>ve.text).join(`
`).trim():"",ue=Q.text!==void 0&&Q.text!==""?Q.text:Q.reasoning??"",Oe=me!==""?me:void 0;return(ue.trim()!==""||Oe!==void 0)&&N5(k,C,ue,Oe,Q.kind,Q.id),!0},Nl=(0,S.useRef)(void 0),to=(0,S.useCallback)(()=>{Nl.current!==void 0&&(clearTimeout(Nl.current.timer),Nl.current=void 0)},[]);(0,S.useEffect)(()=>()=>{to()},[to]);let N5=(0,S.useCallback)((c,k,C,_,B,G)=>{Ni({x:Math.max(8,Math.min(c,window.innerWidth-164)),y:Math.max(8,Math.min(k,window.innerHeight-140)),text:C,raw:_,...B!==void 0?{kind:B}:{},...G!==void 0?{messageId:G}:{}})},[]),T5=(0,S.useCallback)(c=>{let k=c.target instanceof Element?c.target:null;if(k!==null){let B=k.closest("img");if(B!==null&&!(k instanceof HTMLAnchorElement)){let G=B.getAttribute("src");if(G!==null&&G!==""&&!G.startsWith("data:image/svg")){c.preventDefault(),xn(G);return}}}let C=k?.closest(".file-link")??null;if(C===null)return;let _=C.getAttribute("data-path");if(!(_===null||_==="")){if(c.preventDefault(),typeof window.dshOpenFile=="function"){kN(_);return}fn(_)}},[]),$v=c=>{let k=c[0],C=c[1];return k===void 0||C===void 0?0:Math.hypot(k.clientX-C.clientX,k.clientY-C.clientY)},E5=(0,S.useCallback)(c=>{let k=It.current;if(k===void 0)return;let C=Math.min(3,Math.max(1,c)),_=k.block.querySelector("pre");_!==null&&(_.style.transformOrigin="0 0",_.style.transform=C<=1.02?"":`scale(${C})`)},[]),Wv=(0,S.useCallback)((c=!1,k)=>{if(Le.current)return;Le.current=!0,c||m(!0);let C=bt.current?.snapshot()[0]??d[0];if(C===void 0){Le.current=!1,c||m(!1);return}let _=new AbortController,B=setTimeout(()=>{_.abort(new DOMException("load older timed out","TimeoutError"))},nR),G=k??C.startSeq??C.seq,Q=c?void 0:X.current?.scrollTop??_t.current;uc(e.sessionId,G,_.signal).then(me=>{clearTimeout(B),Le.current=!1,c||m(!1);let ue=Ka(me.rows),Oe=bt.current;Oe===void 0?f(Ei=>Ka([...ue,...Ei])):(Oe.prepend(ue),f(Ka(Oe.snapshot()))),w(me.hasMore),qe.current=0;let ve=X.current;if(ve!==void 0&&ue.length>0)if(c&&Ie.current<=_n)Vt.current=!0;else{let Ei=ue.reduce((Ci,ao)=>Ci+Ep(ao),0),Tl=(Q??ve.scrollTop)+Ei;requestAnimationFrame(()=>{ir(ve,Tl)})}},me=>{clearTimeout(B),Le.current=!1,m(!1),c||y(he(me))})},[e.sessionId,d,ha,ir]);x.current=Wv;let zc=(0,S.useRef)(r),ey=(0,S.useRef)(o),Hc=(0,S.useRef)(s),em=(0,S.useRef)(0),tm=(0,S.useRef)(!1),[$a,nm]=(0,S.useState)(void 0),qc=(0,S.useRef)(void 0),no=(0,S.useRef)(!1),Zo=(0,S.useRef)(!1),Jn=(0,S.useRef)(!1);(0,S.useEffect)(()=>{zc.current=r,ey.current=o,Hc.current=s,em.current=0,tm.current=!1,qc.current=void 0,no.current=!1,Zo.current=!1,$e.current=!1,Jn.current=r!==void 0||o!==void 0||s!==void 0,nm(void 0)},[r,o,s,l]),(0,S.useEffect)(()=>{let c=zc.current,k=ey.current;if(c===void 0&&k===void 0||p)return;let C=d,_=l?.trim().toLowerCase()??"",B=Nn=>{if(_==="")return!0;let Wa=Nn.text.toLowerCase();if(Wa.includes(_))return!0;let Tn=_.match(/[\p{L}\p{N}_]+/gu)??[];return Tn.length>0&&Tn.every(Cl=>Wa.includes(Cl))},G=k===void 0?-1:C.findIndex(Nn=>Nn.id===k),Q=Nn=>k!==void 0&&Nn.id!==k?!1:Hc.current===void 0?!0:Nn.flow?.some(Wa=>Wa.kind==="text"&&Wa.partId===Hc.current)===!0,me=G>=0&&Q(C[G])?G:-1,ue=C[0]?.startSeq??C[0]?.seq,Oe=c===void 0||ue===void 0||c>=ue,ve=c===void 0||!Oe?-1:C.findIndex(Nn=>c<=Nn.seq&&B(Nn)),Tl=(k!==void 0||c!==void 0)&&h?-1:C.findIndex(B),Ci=me>=0?me:ve>=0?ve:Tl;if(console.debug(`[locate] initial: msgId=${k??"-"} seq=${c??"-"} partId=${Hc.current??"-"} query=${l??"-"}; rows=${C.length}; resolved index=${Ci} (stable=${me} seqRow=${ve})`),Ci<0){h&&em.current<iR?Le.current||(em.current+=1,!tm.current&&c!==void 0?(tm.current=!0,x.current(!0,c+1)):x.current(!0)):(zc.current=void 0,Jn.current=!1,Zo.current=!1);return}zc.current=void 0;let ao=C[Ci];if(nm(ao.id),k!==void 0&&me<0&&Y(`定位回退: 目标 ${k} 未命中，定位到 ${ao.id}（消息可能在更新中）`),Jn.current=!0,Zo.current=!0,Ie.current=Number.MAX_SAFE_INTEGER,qc.current=me>=0||ve>=0?c:ao.startSeq??ao.seq,no.current=!1,C.length>=Np){let Nn=Math.max(0,Ci-jo),Wa=Math.min(C.length,Ci+Tp+jo);Je(Tn=>Tn.start===Nn&&Tn.end===Wa?Tn:{start:Nn,end:Wa})}},[d,h,p,r,o,s,l]),(0,S.useLayoutEffect)(()=>{if($a===void 0||no.current)return;let c=qc.current;if(c===void 0&&o===void 0&&s===void 0)return;let k=X.current;if(k===void 0)return;let C=()=>{Ie.current=Number.MAX_SAFE_INTEGER;let ue=0,Oe=()=>{let ve=X.current;if(ve===void 0){console.debug("[locate] scroll container missing"),Jn.current=!1;return}let Ei=ve.querySelector(`[data-message-id="${Qi($a)}"]`),Tl=Ei?.querySelector(".chat-search-mark"),Ci=s===void 0?null:Ei?.querySelector(`[data-part-id="${Qi(s)}"]`)??null,El=(c===void 0?null:ve.querySelector(`[data-step-seq="${Qi(String(c))}"]`))??Tl??Ci??Ei??(c===void 0?null:ve.querySelector(`[data-row-seq="${Qi(String(c))}"]`));if(El===null){if(ue>=10){console.debug(`[locate] anchor never surfaced (focusMsgId=${$a} seq=${c??"-"})`),Jn.current=!1;return}ue+=1,requestAnimationFrame(Oe);return}ve.scrollHeight;let Nn=El.getBoundingClientRect().top-ve.getBoundingClientRect().top+ve.scrollTop-8,Wa=ve.scrollTop;ir(ve,Math.max(0,Nn));try{El.scrollIntoView()}catch{}requestAnimationFrame(()=>{let Tn=X.current;if(Tn===void 0){Jn.current=!1;return}let Cl=El.getBoundingClientRect().top,Uc=Tn.getBoundingClientRect().top,Bc=Tn.clientHeight;if(Bc<=0){no.current=!0,Jn.current=!1;return}if(!(Cl>=Uc-1&&Cl<=Uc+Bc+1)){console.debug(`[locate] verify: off-viewport anchorTop=${Math.round(Cl)} viewport=[${Math.round(Uc)},${Math.round(Uc+Bc)}] scrollTop ${Wa}->${Tn.scrollTop} clientH=${Bc} scrollH=${Math.round(Tn.scrollHeight)} tries=${ue}`),ue<12?(ue+=1,requestAnimationFrame(Oe)):(Y(`定位未成功(共${d.length}条, 窗口${rr?"开":"关"}, 目标滚动≈${Math.round(Nn)}, 当前${Math.round(Tn.scrollTop)}/${Math.round(Tn.scrollHeight)})`),no.current=!0,Jn.current=!1);return}console.debug(`[locate] OK focusMsgId=${$a} seq=${c??"-"} scrollTop ->${Math.round(Tn.scrollTop)} after ${ue} try/tries`),no.current=!0,Jn.current=!1})};Oe()};if((()=>{let ue=k.querySelector(`[data-message-id="${Qi($a)}"]`),Oe=ue?.querySelector(".chat-search-mark"),ve=s===void 0?null:ue?.querySelector(`[data-part-id="${Qi(s)}"]`)??null;return(c===void 0?null:k.querySelector(`[data-step-seq="${Qi(String(c))}"]`))??Oe??ve??ue??(c===void 0?null:k.querySelector(`[data-row-seq="${Qi(String(c))}"]`))})()!==null){C();return}let G=0,Q,me=()=>{if(G+=1,G>120){k.querySelector(`[data-mid="${$a}"]`)!==null&&C(),Jn.current=!1;return}let ue=X.current;if(ue===void 0)return;if(ue.querySelector(`[data-message-id="${Qi($a)}"]`)===null){Q=setTimeout(me,50);return}C()};return Q=setTimeout(me,50),()=>clearTimeout(Q)},[$a,je,o,s,ir]);let am=(0,S.useCallback)(c=>{V2(c).then(({image:k,failed:C})=>{if(C){Y("该图片无法解码，已忽略");return}if(Yn.current.length>=Wf){Y(`最多附加 ${Wf} 张图片`);return}Bt(_=>[..._,k])})},[]),ty=(0,S.useCallback)(()=>{let c=N.trim();if(c===""&&Et.length===0||T)return;if(typeof navigator<"u"&&navigator.onLine===!1){if(c===""){Y("离线状态暂不支持发送图片");return}if(c.startsWith("/")){Y("离线状态暂不支持执行命令");return}Et.length>0&&Y("图片需联网发送，本次仅保存文本");let C=Sn!==void 0?`引用消息：
> ${Sn.replace(/\n+/g," ")}

${c}`:c;ON({id:`outbox-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,sessionId:e.sessionId,text:C,queuedAt:Date.now()}).then(()=>{D(""),Lo(e.sessionId),an(void 0),Bt([]),Y("已离线保存，恢复网络后自动发送"),Ti()});return}if(c.startsWith("/")&&Sn===void 0&&Et.length===0){z(!0),Wp(c).then(()=>{z(!1),D(""),Lo(e.sessionId)},()=>{z(!1)});return}z(!0);let k=Sn!==void 0&&c!==""?Kb(`引用消息：
> ${Sn.replace(/\n+/g," ")}

${c}`,Et):Kb(N,Et);Oo(e.sessionId,k).then(()=>{z(!1),D(""),Lo(e.sessionId),Bt([]),an(void 0),t?.poke()},C=>{z(!1);let _=he(C),B=Xa(_);y(B!==void 0?`${_} ${B}`:_),Y(B!==void 0?"发送失败，请重启 dsh web 后再试":`发送失败：${_}`)})},[N,Et,T,e.sessionId,t,Sn,Wp]),Pc=(0,S.useRef)("");(0,S.useEffect)(()=>()=>{ga.current=!1,Pe.current?.cancel(),Pe.current=void 0},[]);let C5=(0,S.useCallback)(()=>{Pe.current?.cancel(),Pe.current=void 0,Pc.current="",ft(""),le(!1),xt("recording")},[]),im=(0,S.useCallback)(()=>{let c=Pe.current;if(c===void 0){le(!1);return}Pe.current=void 0,xt("transcribing"),c.stop().then(k=>{Pc.current="转写中...",ft("转写中..."),Fk(k,sc()).then(C=>{Pc.current="",ft(""),le(!1),xt("recording"),C.trim()!==""&&D(_=>_.trim()===""?C.trim():`${_.replace(/\s+$/,"")} ${C.trim()}`)},C=>{le(!1),xt("recording"),Y(C instanceof Error?C.message:String(C))})},k=>{le(!1),xt("recording"),Y(k instanceof Error?k.message:String(k))})},[]),M5=(0,S.useCallback)(()=>{Pc.current="",xt("recording"),JN({onTimeout:()=>{im()}}).then(c=>{if(!ga.current){c.cancel();return}Pe.current=c,le(!0)},c=>{ga.current&&Y(c instanceof Error?c.message:String(c))})},[im]),A5=(0,S.useCallback)(()=>{kc||(qp(!0),Qk(e.sessionId).then(()=>{qp(!1)},c=>{qp(!1),y(he(c))}))},[kc,e.sessionId]),E9=yt?.model??"模型",Vc=vt===void 0?void 0:vt.options.find(c=>c.value===vt.currentValue)?.name??lR(vt.currentValue),ba=(0,S.useMemo)(()=>{let c=Kn?.contextWindow,k=Kn?.pressureTokens;return c===void 0||c<=0||k===void 0||k<0?void 0:{pct:Math.min(100,Math.max(0,Math.round(k/c*100))),window:c,pressure:k}},[Kn]),ny=(0,S.useCallback)(()=>{se(c=>c.status==="ready"?c:{status:"loading"}),Dd(e.sessionId).then(c=>{se({status:"ready",data:c})},c=>{se({status:"error",message:he(c)})})},[e.sessionId]),R5=()=>{Rt(null),kn(!1),Ut("model"),F.status==="idle"&&ny()},O5=()=>{Rt(null),kn(!1),Ut("permission")},_5=()=>{ba!==void 0&&(Rt(null),Ut(null),kn(c=>!c))},ay=(0,S.useCallback)(c=>{Zt||(q(!0),Hf(e.sessionId,c).then(k=>{q(!1),In(k.selected),Ut(null)},k=>{q(!1),y(he(k))}))},[Zt,e.sessionId]),I5=(0,S.useCallback)(c=>{if(c===vt?.currentValue){Ut(null);return}if(c==="danger-full-access"){Ut(null),Rt("permission");return}Zt||(q(!0),Id(e.sessionId,`/permission ${c}`).then(k=>{if(q(!1),!k.matched){y("权限命令未在宿主注册，无法切换");return}fa(C=>C===void 0?C:{...C,currentValue:c}),Ut(null)},k=>{q(!1),y(he(k))}))},[Zt,vt,e.sessionId]),iy=(0,S.useMemo)(()=>MN(d.map(c=>c.time)),[d]),rr=d.length>=Np,Jo=rr&&je.end>je.start,rm=Jo?je.start:0,ry=Jo?je.end:d.length,$o=at.current;(0,S.useEffect)(()=>{if(!rr||Jn.current||!wl.current||!nr||Ie.current>_n)return;let c=requestAnimationFrame(()=>{Ie.current>_n||Ic()});return()=>cancelAnimationFrame(c)},[d,St,Ic,nr,rr]);let D5=$o!==void 0&&Jo?($o[rm]??0)+qe.current:0,L5=$o!==void 0&&Jo?($o[d.length]??0)-($o[ry]??$o[d.length]??0):0;(0,S.useEffect)(()=>{ar()},[d,St,ar]),(0,S.useEffect)(()=>{if(!rr)return;let c=X.current;if(c===void 0)return;let k=!1;for(let C of c.querySelectorAll("[data-mid]")){if(C.classList.contains("chat-msg-pending"))continue;let _=C.dataset.mid;if(_===void 0)continue;let B=C.offsetHeight;B>0&&Xt.current.get(_)!==B&&(Xt.current.set(_,B),k=!0)}k&&Gn(C=>C+1)},[rr,Jo,d,St,Jp]),(0,S.useEffect)(()=>{let c=X.current;if(c===void 0)return;let k=at.current?.[d.length]??0,C=c.scrollHeight===0?0:c.scrollHeight-k;if(C===qe.current||(qe.current=C,c5(B=>B+1),at.current===void 0)||!wl.current||Ie.current>_n)return;let _=requestAnimationFrame(()=>{Ie.current>_n||Ic()});return()=>cancelAnimationFrame(_)},[rr,Jo,d,St,Jp,Ic]);let z5=d[d.length-1]?.id,oy=c=>c.id===z5&&c.kind==="assistant"&&c.pending!==!0&&!jt?()=>x5(c):void 0;return(0,M.jsxs)("div",{className:"chat",children:[(0,M.jsxs)("header",{className:"mobile-header",children:[(0,M.jsx)("div",{className:"mobile-headerSlot",children:(0,M.jsx)("button",{type:"button",className:"mobile-back","aria-label":"返回",onClick:S5,children:"‹"})}),(0,M.jsx)("div",{className:"mobile-titleWrap",children:(0,M.jsx)("h1",{className:"mobile-title mobile-titleInline",children:Nc})}),(0,M.jsxs)("div",{className:"mobile-headerSlot mobile-headerSlot-right",children:[(0,M.jsx)("button",{type:"button",className:"mobile-iconbtn","aria-label":"更多",onClick:()=>{hl(!0)},children:(0,M.jsx)(dN,{})}),(0,M.jsx)(dl,{})]})]}),b!==void 0&&(0,M.jsx)("p",{className:"mobile-error mobile-pad",children:b}),(Xn||Ja>0)&&(0,M.jsxs)("div",{className:"chat-offline-banner",role:"status",style:{flexDirection:"column",alignItems:"stretch",padding:"8px 16px"},children:[(0,M.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8},children:[(0,M.jsx)("span",{children:Xn?"网络已断开，消息将在恢复后发送":Ja>0?`${Ja} 条离线消息待发送`:""}),!Xn&&Ja>0&&(0,M.jsx)("button",{type:"button",className:"chat-offline-retry",onClick:Qp,children:"重试"})]}),ne.length>0&&(0,M.jsx)("ul",{style:{listStyle:"none",margin:"4px 0 0",padding:0,display:"flex",flexDirection:"column",gap:4},children:ne.map(c=>(0,M.jsxs)("li",{style:{display:"flex",alignItems:"center",gap:8,fontSize:"var(--text-sm)"},children:[(0,M.jsx)("span",{style:{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:c.text}),(0,M.jsx)("button",{type:"button",className:"chat-offline-retry","aria-label":"移除待发送消息",onClick:()=>{o5(c.id)},children:"移除"})]},c.id))})]}),(0,M.jsxs)("div",{className:"chat-scroll",ref:c=>{X.current=c??void 0},onScroll:f5,onClick:T5,onDoubleClick:c=>{let k=c.target instanceof Element?c.target.closest(".code-block"):null;if(k===null)return;let C=k.querySelector("pre");C!==null&&(C.style.transform="")},onContextMenu:c=>{Jv(c.target,c.clientX,c.clientY)&&(c.preventDefault(),to())},onTouchStart:c=>{if(c.touches.length>=2){to();let me=(c.target instanceof Element?c.target:null)?.closest(".code-block")??null;if(me!==null){let ue=$v(c.touches);if(ue>0){let Oe=me.querySelector("pre")?.style.transform??"",ve=Oe===""?1:Number(/scale\(([\d.]+)\)/.exec(Oe)?.[1]??1);It.current={block:me,dist0:ue,scale0:ve};return}}It.current=void 0;return}It.current=void 0;let k=c.touches[0];if(k===void 0)return;let C=c.target instanceof Element?c.target:null;if(C===null||C.closest(".chat-msg")===null||C.closest(".code-block pre, img")!==null)return;let{clientX:_,clientY:B}=k,G=window.setTimeout(()=>{Nl.current=void 0,Jv(C,_,B)},500);Nl.current={timer:G,x:_,y:B}},onTouchMove:c=>{if(It.current!==void 0&&c.touches.length>=2){let k=$v(c.touches);k>0&&E5(It.current.scale0*k/It.current.dist0);return}to()},onTouchEnd:c=>{It.current!==void 0&&c.touches.length<2&&(It.current=void 0),to()},onTouchCancel:c=>{It.current!==void 0&&c.touches.length<2&&(It.current=void 0),to()},children:[h&&(0,M.jsx)("button",{type:"button",className:"chat-load-older",disabled:p,onClick:()=>{Wv()},children:p?"加载中…":"加载更早的消息"}),rr?(0,M.jsxs)(M.Fragment,{children:[(0,M.jsx)("div",{style:{height:D5},"aria-hidden":"true"}),d.slice(rm,ry).map((c,k)=>{let C=rm+k;return(0,M.jsx)(yv,{message:c,sessionId:e.sessionId,showToolCalls:a,showSystemMessages:i,clockOffsetMs:Go.current,liveTurnStartAt:xl??void 0,liveTurn:Gv,showTime:iy[C]===!0,focused:c.id===$a,focusedQuery:l,onOpenFile:_=>{fn(_)},onRegenerate:oy(c)},zT(c))}),(0,M.jsx)("div",{style:{height:L5},"aria-hidden":"true"})]}):d.map((c,k)=>{let C=k<d.length-aR?{contentVisibility:"auto",containIntrinsicSize:`auto ${Ep(c)}px`}:void 0;return(0,M.jsx)(yv,{message:c,sessionId:e.sessionId,showToolCalls:a,showSystemMessages:i,clockOffsetMs:Go.current,liveTurnStartAt:xl??void 0,liveTurn:Gv,showTime:iy[k]===!0,focused:c.id===$a,focusedQuery:l,style:C,onOpenFile:_=>{fn(_)},onRegenerate:oy(c)},zT(c))}),p&&d.length===0&&(0,M.jsx)("p",{className:"chat-typing",children:"加载中…"}),!p&&d.length===0&&(0,M.jsx)("p",{className:"chat-typing",children:"还没有消息，发一句话开始吧"}),jt&&(0,M.jsxs)("div",{className:"chat-turn-status",role:"status","aria-label":Wr?"连接中断":yc?"后台处理中":"输出中",children:[Wr?"连接中断":yc?"后台处理中":"输出中",(0,M.jsxs)("span",{className:"chat-turn-dots","aria-hidden":!0,children:[(0,M.jsx)("span",{}),(0,M.jsx)("span",{}),(0,M.jsx)("span",{})]})]}),Pp.map(c=>(0,M.jsx)(MT,{approval:c,sessionId:e.sessionId,onResolved:k=>{Y2(e.sessionId,k),ml(C=>C.filter(_=>_.approvalId!==k))}},c.approvalId)),Sc.length>0&&(0,M.jsx)(AT,{questions:Sc,sessionId:e.sessionId,onResolved:c=>{j2(e.sessionId,c),gl(k=>k.filter(C=>C.rpcId!==c))}}),Kv&&Jt.length>=2&&(0,M.jsx)("button",{type:"button",className:"chat-jump-turns"+(yl!==void 0?" chat-jump-turns-live":""),"aria-label":"轮次导航：轻点开清单，按住拖动刮擦",onPointerDown:g5,onPointerMove:h5,onPointerUp:b5,onPointerCancel:Xv,onLostPointerCapture:Xv,onClick:c=>{c.detail===0&&Tc(!0)},children:(0,M.jsxs)("span",{className:"chat-jump-turns-label",children:[Pv,"/",bl]})}),Qo!==void 0&&Qo!==Vp&&Qo!==bl&&bl>=2&&(0,M.jsxs)("button",{type:"button",className:"chat-jump-lastread","aria-label":"回到上次读到的轮次",onClick:m5,children:["回到上次 · 第 ",Qo," 轮"]}),Kv&&(0,M.jsxs)("button",{type:"button",className:"chat-jump-latest"+(Dc>0?" chat-jump-latest-hot":""),"aria-label":"回到最新消息",onClick:p5,children:[(0,M.jsx)(Xb,{width:20,height:20}),Dc>0&&(0,M.jsx)("span",{className:"chat-jump-badge",children:Dc>99?"99+":Dc})]})]}),(0,M.jsx)(bN,{todo:E,jobs:xc,subagents:Yo,onOpen:()=>{zv(!0)}}),yl!==void 0&&Jt.length>=2&&(0,M.jsx)(LT,{entries:Jt,index:yl}),(0,M.jsxs)("div",{className:"chat-tools",children:[(0,M.jsxs)("div",{className:"chat-tools-actions",children:[(0,M.jsxs)("button",{type:"button",className:"chat-pill",onClick:R5,"aria-haspopup":"listbox","aria-label":yt===void 0?"切换模型":`切换模型：${PT(yt.model)}`,title:yt===void 0?void 0:`${yt.provider}/${yt.model}`,children:[(0,M.jsx)(fN,{width:16,height:16}),(0,M.jsx)("span",{className:"chat-pill-name",children:yt===void 0?"模型":PT(yt.model)}),(0,M.jsx)("span",{className:"chat-pill-chevron","aria-hidden":!0,children:"▾"})]}),Vc!==void 0&&vt!==void 0&&(0,M.jsxs)("button",{type:"button",className:"chat-pill chat-pill-perm chat-pill-perm-"+(ZA(vt.currentValue)??"read"),onClick:O5,"aria-haspopup":"listbox","aria-label":`切换权限：${Vc}`,title:Vc,children:[(0,M.jsx)($d,{width:16,height:16}),(0,M.jsx)("span",{className:"chat-pill-name",children:Vc})]})]}),(0,M.jsx)("div",{className:"chat-context"+(ba!==void 0&&ba.pct>=80?" chat-context-warn":""),role:"status",onClick:_5,"aria-expanded":qa,children:ba===void 0?(0,M.jsx)(M.Fragment,{children:"上下文 --"}):(0,M.jsxs)(M.Fragment,{children:[(0,M.jsxs)("svg",{className:"chat-context-ring",width:"26",height:"26",viewBox:"0 0 26 26","aria-hidden":!0,children:[(0,M.jsx)("circle",{className:"chat-context-ring-track",cx:"13",cy:"13",r:"10.5",fill:"none",strokeWidth:"3.5"}),(0,M.jsx)("circle",{className:"chat-context-ring-fill",cx:"13",cy:"13",r:"10.5",fill:"none",strokeWidth:"3.5",strokeDasharray:`${ba.pct/100*65.97} 65.97`,transform:"rotate(-90 13 13)"})]}),(0,M.jsxs)("span",{className:"chat-context-text",title:`${Sp(ba.pressure)}/${Sp(ba.window)}`,children:[ba.pct,"%"]})]})}),qa&&ba!==void 0&&(0,M.jsxs)("div",{className:"chat-context-pop",role:"tooltip",children:[(0,M.jsx)("div",{className:"chat-context-pop-title",children:"上下文用量"}),(0,M.jsxs)("div",{className:"chat-context-pop-figures",children:[Sp(ba.pressure),(0,M.jsx)("span",{children:"/"}),Sp(ba.window)]}),(0,M.jsxs)("div",{className:"chat-context-pop-sub",children:["已使用 ",ba.pct,"%"]})]})]}),qa&&(0,M.jsx)("div",{className:"chat-context-pop-scrim",onClick:()=>{kn(!1)}}),wn!==null&&(0,M.jsx)("div",{className:"chat-picker-scrim",onClick:()=>{Ut(null)}}),wn==="model"&&(0,M.jsxs)("div",{className:"chat-picker-panel",role:"menu","aria-label":"选择模型",children:[F.status==="loading"&&(0,M.jsx)("span",{className:"chat-picker-status",children:"正在加载模型目录…"}),F.status==="error"&&(0,M.jsxs)(M.Fragment,{children:[(0,M.jsx)("span",{className:"chat-picker-status chat-picker-error",children:F.message}),Xa(F.message)!==void 0&&(0,M.jsx)("span",{className:"chat-picker-status chat-picker-hint",children:Xa(F.message)}),(0,M.jsx)("button",{type:"button",className:"chat-picker-more",onClick:ny,children:"重试"})]}),F.status==="ready"&&(0,M.jsxs)(M.Fragment,{children:[(()=>{let c=yt??F.data.current,k=(C,_)=>{let B=c!==void 0&&c.provider===C.id&&c.model===_.id;return(0,M.jsxs)("button",{type:"button",className:"chat-picker-row"+(B?" chat-picker-row-selected":""),disabled:Zt,onClick:()=>{ay({provider:C.id,model:_.id,..._.reasoning?.defaultEffort===void 0?{}:{reasoningEffort:_.reasoning.defaultEffort}})},children:[(0,M.jsx)("span",{className:"chat-picker-row-check","aria-hidden":!0,children:B?(0,M.jsx)(Oa,{width:14,height:14}):null}),(0,M.jsx)("span",{className:"chat-picker-row-copy",children:(0,M.jsx)("span",{className:"chat-picker-row-title",children:_.name})})]},`${C.id}:${_.id}`)};return F.data.groups.map(C=>(0,M.jsxs)("div",{className:"chat-picker-group",children:[(0,M.jsx)("div",{className:"chat-picker-group-title",children:C.name}),C.models.map(_=>k(C,_))]},C.id))})(),(()=>{let c=yt??F.data.current,_=F.data.groups.flatMap(Q=>Q.models.map(me=>({group:Q,model:me}))).find(Q=>Q.group.id===c.provider&&Q.model.id===c.model)?.model.reasoning,B=c.reasoningEffort??_?.defaultEffort,G=_===void 0?[]:[..._.defaultEffort===void 0?[{key:"provider-default",effort:void 0,label:"跟随模型默认"}]:[],..._.efforts.map(Q=>({key:`effort:${Q.id}`,effort:Q.id,label:Q.name}))];return G.length===0?null:(0,M.jsxs)("div",{className:"chat-picker-group",children:[(0,M.jsx)("div",{className:"chat-picker-group-title",children:"思考强度"}),G.map(Q=>{let me=B===Q.effort;return(0,M.jsxs)("button",{type:"button",className:"chat-picker-row"+(me?" chat-picker-row-selected":""),disabled:Zt,onClick:()=>{ay({provider:c.provider,model:c.model,...Q.effort!==void 0?{reasoningEffort:Q.effort}:{}})},children:[(0,M.jsx)("span",{className:"chat-picker-row-check","aria-hidden":!0,children:me?(0,M.jsx)(Oa,{width:14,height:14}):null}),(0,M.jsx)("span",{className:"chat-picker-row-copy",children:(0,M.jsx)("span",{className:"chat-picker-row-title",children:Q.label})})]},Q.key)})]})})(),(0,M.jsx)("button",{type:"button",className:"chat-picker-more",onClick:()=>{Ut(null),Rt("model")},children:"全部…"})]})]}),wn==="permission"&&vt!==void 0&&(0,M.jsxs)("div",{className:"chat-picker-panel",role:"menu","aria-label":"选择权限",children:[vt.options.map(c=>{let k=c.value===vt.currentValue;return(0,M.jsxs)("button",{type:"button",className:"chat-picker-row"+(k?" chat-picker-row-selected":"")+(c.value==="danger-full-access"?" chat-picker-row-danger":""),disabled:Zt,onClick:()=>{I5(c.value)},children:[(0,M.jsx)("span",{className:"chat-picker-row-check","aria-hidden":!0,children:k?(0,M.jsx)(Oa,{width:14,height:14}):null}),(0,M.jsxs)("span",{className:"chat-picker-row-copy",children:[(0,M.jsx)("span",{className:"chat-picker-row-title",children:c.name}),c.description!==void 0&&(0,M.jsx)("span",{className:"chat-picker-row-sub",children:c.description})]})]},c.value)}),(0,M.jsx)("button",{type:"button",className:"chat-picker-more",onClick:()=>{Ut(null),Rt("permission")},children:"全部…"})]}),e5&&(0,M.jsx)(vN,{todo:E,jobs:xc,subagents:Yo,onClose:()=>{zv(!1)}}),(0,M.jsxs)("div",{className:"chat-composer",children:[(0,M.jsx)(IN,{items:vc,running:jt,onEdit:s5,onRemove:l5,onSteer:d5}),Sn!==void 0&&(0,M.jsxs)("div",{className:"chat-quote-bar",role:"note","aria-label":"引用消息",children:[(0,M.jsxs)("span",{className:"chat-quote-text",children:[Sn.slice(0,20),Sn.length>20?"…":""]}),(0,M.jsx)("button",{type:"button",className:"chat-quote-close","aria-label":"取消引用",onClick:()=>{an(void 0)},children:(0,M.jsx)(jr,{width:14,height:14})})]}),Et.length>0&&(0,M.jsx)("div",{className:"chat-attach-bar",role:"list","aria-label":"待发送图片",children:Et.map((c,k)=>(0,M.jsxs)("div",{className:"chat-attach-item",role:"listitem",children:[(0,M.jsx)("img",{className:"chat-attach-img",src:c.dataUrl,alt:"待发送图片"}),(0,M.jsx)("button",{type:"button",className:"chat-attach-remove","aria-label":"移除图片",onClick:()=>{Bt(C=>C.filter((_,B)=>B!==k))},children:"×"})]},k))}),(0,M.jsxs)("div",{className:"chat-inputbar",children:[(0,M.jsx)("button",{type:"button",className:"chat-attach-btn","aria-label":"添加内容","aria-haspopup":"dialog",onClick:()=>{Tt(!0)},children:(0,M.jsx)(ll,{width:20,height:20})}),cv()&&(0,M.jsx)("button",{type:"button",className:"chat-attach-btn","aria-label":"语音输入",onClick:M5,children:(0,M.jsx)(rp,{width:20,height:20})}),(0,M.jsx)("textarea",{className:"chat-input",rows:1,value:N,placeholder:"说点什么...",enterKeyHint:Jr?"send":"enter",onChange:c=>{D(c.target.value)},onFocus:()=>{$i(!0)},onBlur:()=>{$i(!1)},onPaste:c=>{let k=U2(c.clipboardData);if(k.length>0){c.preventDefault();for(let C of k)am(C)}},onKeyDown:c=>{Jr&&c.key==="Enter"&&!c.shiftKey&&!c.nativeEvent.isComposing&&(c.preventDefault(),ty())}}),(0,M.jsx)("button",{type:"button",className:jt?"chat-send chat-send-stop":"chat-send",...jt?{"aria-label":kc?"停止中":"停止"}:{"aria-label":"发送"},disabled:jt?kc:T||N.trim()===""&&Et.length===0,onClick:()=>{jt?A5():ty()},children:jt?(0,M.jsx)("svg",{viewBox:"0 0 16 16",width:"14",height:"14","aria-hidden":"true",focusable:"false",children:(0,M.jsx)("rect",{x:"3",y:"3",width:"10",height:"10",rx:"3",fill:"currentColor"})}):(0,M.jsx)(eN,{})})]})]}),Se&&(0,M.jsx)(NT,{commands:Dn,onPickImage:()=>{Tt(!1),Qn.current?.click()},onPickCamera:()=>{Tt(!1),Pa.current?.click()},onPickCommand:c=>{Tt(!1),Wp(c).catch(()=>{})},onClose:()=>{Tt(!1)}}),(0,M.jsx)("input",{ref:Qn,type:"file",accept:"image/*",multiple:!0,hidden:!0,onChange:c=>{let k=[...c.target.files??[]];for(let C of k)am(C);c.target.value=""}}),(0,M.jsx)("input",{ref:Pa,type:"file",accept:"image/*",capture:"environment",hidden:!0,onChange:c=>{let k=[...c.target.files??[]];for(let C of k)am(C);c.target.value=""}}),pa==="model"&&(0,M.jsx)(TT,{sessionId:e.sessionId,current:yt,onCurrent:c=>{In(c)},onClose:()=>{Rt(null)}}),pa==="permission"&&vt!==void 0&&(0,M.jsx)(ET,{sessionId:e.sessionId,value:vt,onChanged:c=>{fa(k=>k===void 0?k:{...k,currentValue:c})},onClose:()=>{Rt(null)}}),n5&&(0,M.jsx)(CT,{entries:Jt,currentTurn:Pv,onPick:Sl,onClose:()=>{Tc(!1)}}),nn!==null&&(0,M.jsx)(XN,{path:nn,sessionId:e.sessionId,onClose:()=>{fn(null)}}),ma!==null&&(0,M.jsx)(ZN,{src:ma,alt:"聊天图片",onClose:()=>{xn(null)}}),t5&&(0,M.jsx)(ht,{title:Nc,onClose:()=>{hl(!1)},children:(0,M.jsxs)("div",{role:"menu","aria-label":"会话操作",children:[(0,M.jsxs)("button",{type:"button",role:"menuitem",className:"sheet-option",onClick:()=>{hl(!1),Gp(!0)},children:[(0,M.jsx)("span",{className:"sheet-option-copy",children:(0,M.jsx)("span",{className:"sheet-option-title",children:"重命名会话"})}),(0,M.jsx)(Jd,{width:16,height:16})]}),(0,M.jsx)("button",{type:"button",role:"menuitem",className:"sheet-option",onClick:()=>{hl(!1),Qa(e.sessionId)},children:(0,M.jsx)("span",{className:"sheet-option-copy",children:(0,M.jsx)("span",{className:"sheet-option-title",children:"复制会话 ID"})})}),(0,M.jsx)("div",{className:"sheet-option-divider","aria-hidden":!0}),(0,M.jsx)("button",{type:"button",role:"menuitem",className:"sheet-option",onClick:()=>{hl(!1),Fp(!0)},children:(0,M.jsx)("span",{className:"sheet-option-copy",children:(0,M.jsx)("span",{className:"sheet-option-title",style:{color:"var(--danger)"},children:"删除会话"})})})]})}),i5&&(0,M.jsx)(Vo,{title:"重命名会话",initial:Nc,confirmLabel:"保存",onCancel:()=>{Gp(!1)},onConfirm:c=>{w5(c)}}),r5&&(0,M.jsx)(ki,{title:"删除会话",body:(0,M.jsxs)(M.Fragment,{children:["确定删除「",Nc,"」吗？该会话将从所有设备消失（电脑上的会话记录保留，可从桌面找回）。"]}),confirmLabel:"删除",tone:"danger",onCancel:()=>{Fp(!1)},onConfirm:k5}),J&&(0,M.jsx)("div",{className:"voice-backdrop",onClick:()=>{C5()},children:(0,M.jsxs)("div",{className:"voice-sheet",role:"dialog","aria-modal":"true","aria-label":"语音输入",onClick:c=>{c.stopPropagation()},children:[(0,M.jsxs)("div",{className:"voice-wave"+(Ge==="transcribing"?" voice-wave-idle":""),"aria-hidden":!0,children:[(0,M.jsx)("span",{}),(0,M.jsx)("span",{}),(0,M.jsx)("span",{}),(0,M.jsx)("span",{}),(0,M.jsx)("span",{})]}),(0,M.jsx)("div",{className:"voice-text",role:"status",children:Ge==="transcribing"?"转写中...":ce!==""?ce:"正在听..."}),(0,M.jsx)("button",{type:"button",className:"voice-done",disabled:Ge==="transcribing",onClick:im,children:Ge==="transcribing"?"请稍候":"完成"})]})}),Zn!==void 0&&(0,M.jsxs)(M.Fragment,{children:[(0,M.jsx)("div",{className:"ctx-backdrop",onClick:()=>{Ni(void 0)},onContextMenu:c=>{c.preventDefault(),Ni(void 0)}}),(0,M.jsxs)("div",{className:"ctx-menu",role:"menu","aria-label":"消息操作",style:{left:Zn.x,top:Zn.y},children:[Zn.kind==="user"&&Zn.messageId!==void 0&&(0,M.jsx)("button",{type:"button",role:"menuitem",className:"ctx-item",onClick:()=>{let{text:c,messageId:k}=Zn;Ni(void 0),k!==void 0&&Yp({messageId:k,text:c})},children:"编辑并重新发送"}),Zn.raw!==void 0&&(0,M.jsx)("button",{type:"button",role:"menuitem",className:"ctx-item",onClick:()=>{let{raw:c}=Zn;Ni(void 0),Qa(c??"","已复制原文")},children:"复制原文"}),(0,M.jsx)("button",{type:"button",role:"menuitem",className:"ctx-item",onClick:()=>{let{text:c}=Zn;Ni(void 0),Qa(c)},children:"复制"}),(0,M.jsx)("button",{type:"button",role:"menuitem",className:"ctx-item",onClick:()=>{let{text:c}=Zn;Ni(void 0),v5(c)},children:"引用"}),(0,M.jsx)("button",{type:"button",role:"menuitem",className:"ctx-item",onClick:()=>{let{raw:c,text:k}=Zn;Ni(void 0),yN(c??k)},children:"分享"})]})]}),Kp!==void 0&&(0,M.jsx)(Vo,{title:"编辑并重新发送",initial:Kp.text,confirmLabel:"发送",onCancel:()=>{Yp(void 0)},onConfirm:c=>{y5(Kp.messageId,c)}})]})}function Cp(e){return[{type:"text",text:e}]}function jT(e){if(typeof e!="object"||e===null)return;let t=e;return{...typeof t.contextWindow=="number"?{contextWindow:t.contextWindow}:{},...typeof t.pressureTokens=="number"?{pressureTokens:t.pressureTokens}:{},...typeof t.projectedTokens=="number"?{projectedTokens:t.projectedTokens}:{}}}var ua=K(Fe(),1);var ie=K(re(),1),dR=8,cR=4,FT=3,uR=new Set(["running","stopping"]);function Ap(e){return uR.has(e.status)}function KT(e){if(e===void 0)return;let n=e.projections?.values?.title;if(typeof n=="string"&&n!=="")return n;if(e.cwd!==void 0){let a=e.cwd.split("/").filter(Boolean).at(-1);if(a!==void 0&&a!=="")return a}}async function fR(){let e=[],t;for(let n=0;n<dR;n++){let a,i=!1;try{let r=await Hr(t);a=r.items,t=r.nextCursor,i=r.hasMore}catch{return{rows:e,truncated:!0}}for(let r of a)e.push({sessionId:String(r.sessionId),...KT(r)!==void 0?{title:KT(r)}:{},running:r.running===!0,blank:r.blank===!0});if(!i)return{rows:e,truncated:!1}}return{rows:e,truncated:!0}}function pR(e,t,n){let a=new Map,i=o=>{a.has(o)||a.set(o,{sessionId:o,title:t.get(o)?.title??`会话 ${o.slice(0,6)}`,jobs:[],live:!1,runningOnly:!1})};for(let o of e){if(o.jobs.length===0)continue;i(o.sessionId);let s=a.get(o.sessionId);s.jobs=o.jobs,s.live=o.jobs.some(l=>Ap(l))}for(let o of n){i(o);let s=a.get(o);if(s.live=!0,s.jobs.length===0&&(s.runningOnly=!0),s.title.startsWith("会话 ")){let l=t.get(o);l?.title!==void 0&&(s.title=l.title)}}let r=[...a.values()];return r.sort((o,s)=>o.live!==s.live?o.live?-1:1:o.runningOnly!==s.runningOnly?o.runningOnly?-1:1:o.sessionId<s.sessionId?-1:o.sessionId>s.sessionId?1:0),r}function QT({mux:e,onBack:t,onOpenSession:n}){let[a,i]=(0,ua.useState)(()=>e?.jobsSnapshot()??[]),[r,o]=(0,ua.useState)(new Map),[s,l]=(0,ua.useState)(()=>{let N=new Set;for(let D of e?.runningSessionsSnapshot()??[])N.add(D);return N}),d=(0,ua.useRef)(new Set(e?.runningSessionsSnapshot()??[])),[f,v]=(0,ua.useState)(()=>new Map),g=(N,D)=>{let O=new Set(d.current);D?O.add(N):O.delete(N),d.current=O,l(O)};(0,ua.useEffect)(()=>{let N=!1;return fR().then(({rows:D})=>{if(N)return;let O=new Map,T=new Set(d.current);for(let z of D)O.set(z.sessionId,z),z.running===!0&&!z.blank&&T.add(z.sessionId);d.current=T,o(O),l(T)},()=>{N||l(new Set(d.current))}),()=>{N=!0}},[]),(0,ua.useEffect)(()=>{if(e===void 0)return;let N=O=>{if(O.type==="session/jobs"||O.type==="session/subscribed"){i(e.jobsSnapshot());return}if(O.type==="session/event"){let T=O.event.type,z=String(O.sessionId);T==="turn/start"?g(z,!0):T==="turn/end"&&g(z,!1)}},D=e.onFrame(N);return i(e.jobsSnapshot()),D},[e]);let h=pR(a,r,s),w=h.filter(N=>N.live).map(N=>N.sessionId).slice(0,cR),x=w.join("|");(0,ua.useEffect)(()=>{if(x==="")return;let N=x.split("|"),D=!1,O=()=>{for(let z of N)$b(z).then($=>{D||$===void 0||v(X=>new Map(X).set(z,$))})};O();let T=setInterval(O,sp);return()=>{D=!0,clearInterval(T)}},[x]);let A=w.reduce((N,D)=>N+Wb(f.get(D)??[]).length,0),p=h.reduce((N,D)=>N+D.jobs.filter(O=>Ap(O)).length,0),m=h.filter(N=>N.live).length,b=h.filter(N=>N.live),y=h.filter(N=>!N.live);return(0,ie.jsxs)("div",{className:"mobile",children:[(0,ie.jsxs)("header",{className:"mobile-header",style:{paddingTop:"calc(env(safe-area-inset-top, 0px) + 4px)"},children:[(0,ie.jsx)("div",{className:"mobile-headerSlot",children:(0,ie.jsx)("button",{type:"button",className:"mobile-back","aria-label":"返回",onClick:t,children:"‹"})}),(0,ie.jsx)("h1",{className:"mobile-title",children:"运行中"}),(0,ie.jsx)("div",{className:"mobile-headerSlot mobile-headerSlot-right"})]}),(0,ie.jsxs)("div",{className:"runov-page",children:[h.length===0&&(0,ie.jsxs)("div",{className:"mobile-empty",style:{paddingTop:28},children:[(0,ie.jsx)("div",{className:"empty-icon",children:(0,ie.jsx)(np,{})}),(0,ie.jsx)("p",{className:"empty-title",children:"当前没有运行中的会话或任务"}),(0,ie.jsx)("p",{className:"empty-desc",children:"会话输出、子代理委派、命令运行会实时显示在这里"})]}),h.length>0&&(0,ie.jsxs)("div",{className:"runov-scroll",children:[(0,ie.jsxs)("div",{className:"runov-hero",children:[(0,ie.jsx)("span",{className:"chat-status-dot chat-status-dot-live","aria-hidden":!0}),(0,ie.jsxs)("span",{className:"runov-hero-copy",children:[(0,ie.jsx)("span",{className:"runov-hero-t",children:p>0||m>0?`${m} 个会话正在运行 · ${p} 个后台任务`+(A>0?` · ${A} 个子代理`:""):`${h.length} 个会话有近期后台任务`}),(0,ie.jsx)("span",{className:"runov-hero-s",children:"跨全部工作区 · 实时同步"})]})]}),b.length>0&&(0,ie.jsxs)(ie.Fragment,{children:[(0,ie.jsxs)("div",{className:"runov-group-title",children:["正在运行 · ",m]}),b.map(N=>(0,ie.jsx)(YT,{row:N,children:f.get(N.sessionId),onOpen:()=>{n({sessionId:N.sessionId,title:N.title})}},N.sessionId))]}),y.length>0&&(0,ie.jsxs)(ie.Fragment,{children:[(0,ie.jsx)("div",{className:"runov-group-title",children:"最近结束"}),y.map(N=>(0,ie.jsx)(YT,{row:N,onOpen:()=>{n({sessionId:N.sessionId,title:N.title})}},N.sessionId))]})]})]})]})}function YT({row:e,children:t,onOpen:n}){let[a,i]=(0,ua.useState)(!1),[r,o]=(0,ua.useState)(!1),s=e.jobs.filter(x=>Ap(x)),l=e.jobs.filter(x=>!Ap(x)),d=e.live?dp(Wb(t??[])):[],f=Math.max(0,d.length-FT),v=r||f===0?d:d.slice(0,FT),g=s.filter(x=>x.kind==="subagent"),w=g.length>0&&d.length>=g.length?s.filter(x=>x.kind!=="subagent"):s;return(0,ie.jsxs)("div",{className:"runov-sess",children:[(0,ie.jsxs)("button",{type:"button",className:"runov-sess-head",onClick:n,children:[e.live&&(0,ie.jsxs)("span",{className:"runov-sess-live",children:[(0,ie.jsx)("span",{className:"chat-status-dot chat-status-dot-live","aria-hidden":!0}),e.runningOnly?"回合中":"运行中"]}),(0,ie.jsxs)("span",{style:{flex:1,minWidth:0},children:[(0,ie.jsx)("span",{className:"runov-sess-title",children:e.title}),(0,ie.jsx)("span",{className:"runov-sess-sub",children:e.sessionId})]}),(0,ie.jsx)("span",{className:"runov-sess-chev",children:"›"})]}),v.length>0&&(0,ie.jsxs)("div",{className:"runov-jobs",children:[(0,ie.jsx)("div",{className:"runov-subgroup-title",children:"子代理"}),(0,ie.jsx)("div",{role:"list","aria-label":`${e.title} 的子代理`,children:v.map(x=>(0,ie.jsx)(nv,{node:x},x.id))})]}),f>0&&(0,ie.jsxs)("button",{type:"button",className:"runov-jobs-fold","aria-expanded":r,onClick:()=>{o(x=>!x)},children:[(0,ie.jsx)("span",{className:"runov-jobs-fold-label",children:r?"收起子代理":`… 还有 ${f} 个子代理`}),(0,ie.jsx)("span",{className:"runov-jobs-fold-chev","aria-hidden":!0,children:r?"▾":"▸"})]}),w.length>0&&(0,ie.jsxs)("div",{className:"runov-jobs",children:[v.length>0&&(0,ie.jsx)("div",{className:"runov-subgroup-title",children:"后台任务"}),(0,ie.jsx)("div",{role:"list","aria-label":`${e.title} 的后台任务`,children:w.map(x=>(0,ie.jsx)(Wd,{job:x},x.id))})]}),l.length>0&&(0,ie.jsxs)(ie.Fragment,{children:[(0,ie.jsxs)("button",{type:"button",className:"runov-jobs-fold","aria-expanded":a,onClick:()=>{i(x=>!x)},children:[(0,ie.jsx)("span",{className:"runov-jobs-fold-label",children:a?"收起已完成":`${l.length} 个已完成`}),(0,ie.jsx)("span",{className:"runov-jobs-fold-chev","aria-hidden":!0,children:a?"▾":"▸"})]}),a&&(0,ie.jsx)("div",{className:"runov-jobs runov-jobs-settled",role:"list","aria-label":`${e.title} 的已完成任务`,children:l.map(x=>(0,ie.jsx)(Wd,{job:x},x.id))})]}),e.runningOnly&&(0,ie.jsx)("div",{className:"runov-jobs",role:"status",children:(0,ie.jsxs)("div",{className:"chat-task-row",children:[(0,ie.jsx)("span",{className:"chat-task-dot chat-task-dot-running","aria-hidden":!0}),(0,ie.jsxs)("span",{className:"chat-task-copy",children:[(0,ie.jsx)("span",{className:"chat-task-label",children:"回合运行中"}),(0,ie.jsx)("span",{className:"chat-task-meta",children:"正在生成回复 · 点击进入查看"})]})]})})]})}var ae=K(Fe(),1);var I=K(re(),1);function Sv(e,t){return e.filter(n=>t.has(String(n.sessionId))).map(n=>Tv(n))}function mR(){return{added:new Map,status:new Map,activity:new Map,error:new Map,removed:new Set}}function gR(e,t){return t.sessionIds.includes(e.sessionId)?!0:e.cwd!==void 0&&e.cwd===t.path}function hR(e,t,n){switch(t.type){case"session/added":{let a=t.summary;if(a===null||typeof a!="object")return!1;let i=String(a.sessionId);return gR(a,n)?(e.added.set(i,Tv(a)),e.removed.delete(i),!0):!1}case"session/removed":{let a=String(t.sessionId);return e.added.delete(a),e.status.delete(a),e.activity.delete(a),e.error.delete(a),e.removed.add(a),!0}case"session/status":{let a=String(t.sessionId);return e.status.set(a,t.running),t.running&&e.error.delete(a),!0}case"session/activity":return e.activity.set(String(t.sessionId),t.updatedAt),!0;case"session/error":return e.error.set(String(t.sessionId),t.message),!0;default:return!1}}function XT(e,t){let n=t.status.get(e.sessionId),a=t.activity.get(e.sessionId),i=t.error.get(e.sessionId),r=n===!0&&e.error!==void 0;if(n===void 0&&a===void 0&&i===void 0&&!r)return e;let o={...e};return n!==void 0&&(o.running=n),a!==void 0&&(o.updatedAt=a),i!==void 0?o.error=i:r&&delete o.error,o}function Nv(e,t){if(t.added.size===0&&t.removed.size===0&&t.status.size===0&&t.activity.size===0&&t.error.size===0)return e;let n=[];for(let a of e)t.removed.has(a.sessionId)||n.push(XT(a,t));for(let[a,i]of t.added)n.some(r=>r.sessionId===a)||n.push(XT(i,t));return n.sort((a,i)=>i.updatedAt-a.updatedAt)}function bR(e,t=new Date){let n=new Date(e),a=r=>new Date(r.getFullYear(),r.getMonth(),r.getDate()).getTime(),i=a(t);return a(n)===i?"今天":a(n)===i-864e5?"昨天":"更早"}var vR=["今天","昨天","更早"],yR=12,xR=3,wR=200,kR=1e4,ZT=12e3,SR=2500,NR=6e4,TR=12,JT=40,Xi=new Map,$T=!1;function ER(){if(!$T){if($T=!0,Xi.size===0)for(let[e,t]of N2())Xi.set(e,t);R2()}}function Rp(e,t){vi.set(e,{...t,at:Date.now()}),Db(e,t)}function WT(){x2(Xi)}async function CR(e,t){try{let n=await Gi(e,void 0,1,t),a=qr(n.events.map(i=>i.event));for(let i=a.length-1;i>=0;i--){let r=a[i];if(r===void 0)continue;let o=r.text!==""?r.text:r.reasoning??"",s=CN(o);if(s!=="")return s}return}catch{return}}async function MR(e,t,n){let a=0,i=Array.from({length:Math.min(t,e.length)},async()=>{for(;a<e.length;){let r=e[a];a+=1,await n(r)}});await Promise.all(i)}function e4({workspace:e,mux:t,initialSessionId:n,initialSearch:a,onBack:i,onPick:r,onOpenSettings:o,onLocateSession:s,onPickSeq:l,onSearchSnapshot:d,onSearchApplied:f}){let[v,g]=(0,ae.useState)([]),h=(0,ae.useRef)(mR()),[w,x]=(0,ae.useState)(!1),[A,p]=(0,ae.useState)(!0),[m,b]=(0,ae.useState)(void 0),y=(0,ae.useMemo)(()=>new Set(e.sessionIds.map(String)),[e]),[N,D]=(0,ae.useState)(!1),[O,T]=(0,ae.useState)(void 0),[z,$]=(0,ae.useState)([]),[X,Le]=(0,ae.useState)(void 0),[at,Te]=(0,ae.useState)(!0),je=(0,ae.useRef)(void 0),Je=(0,ae.useRef)(!1),[Qt,xe]=(0,ae.useState)(0),_t=(0,ae.useRef)(0),$e=(0,ae.useRef)(void 0),[Vt,Ie]=(0,ae.useState)(!1),[qe,Xt]=(0,ae.useState)(""),[St,Gn]=(0,ae.useState)([]),[Nt,ut]=(0,ae.useState)(!1),[bt,j]=(0,ae.useState)(!1),[Z,de]=(0,ae.useState)(0),[Ee,Re]=(0,ae.useState)(!1),Ce=(0,ae.useRef)(new Set),Fn=(0,ae.useRef)(!1),vt=(0,ae.useRef)(!1);(0,ae.useEffect)(()=>{vt.current||a!==void 0&&a.open&&(vt.current=!0,Ie(!0),Xt(a.term),f?.())},[a,f]),(0,ae.useEffect)(()=>{d?.(Vt,qe)},[Vt,qe,d]);let fa=(0,ae.useCallback)(async(P,ne,W)=>{let J=ne;for(let le=0;le<8&&J!==void 0;le++){let ce=await Hr(J),Ge=Sv(ce.items,W).find(xt=>xt.sessionId===P);if(Ge!==void 0)return Ge;if(!ce.hasMore)return;J=ce.nextCursor}},[]),[Kn,yn]=(0,ae.useState)(0),yt=(0,ae.useRef)(!0);(0,ae.useEffect)(()=>()=>{yt.current=!1},[]);let In=(0,ae.useRef)(0),[pa,Rt]=(0,ae.useState)(void 0),[nn,fn]=(0,ae.useState)(void 0),ma=(0,ae.useRef)(void 0),xn=(0,ae.useRef)(void 0),[wn,Ut]=(0,ae.useState)(()=>T2()),[qa,kn]=(0,ae.useState)(void 0),Zt=(0,ae.useRef)(void 0),q=(0,ae.useCallback)(P=>{Ut(ne=>{let W=new Set(ne);return W.has(P)?W.delete(P):W.add(P),E2(W),W})},[]),F=6,se=(0,ae.useCallback)(P=>{let ne=P.filter(le=>!le.blank&&le.preview===void 0&&!Xi.has(le.sessionId)).slice(0,yR);if(ne.length===0)return;let W=new AbortController,J=le=>{for(let ce of le)if(ce.summary!==""){if(Xi.size>=wR){let ft=Xi.keys().next().value;ft!==void 0&&Xi.delete(ft)}Xi.set(ce.sessionId,ce.summary)}};jk(ne.map(le=>le.sessionId),W.signal).then(le=>{yt.current&&(J(le),WT(),yn(ce=>ce+1))},()=>{yt.current&&MR(ne.slice(0,F),xR,async le=>{if(!yt.current)return;let ce=await CR(le.sessionId,W.signal);ce===void 0||!yt.current||J([{sessionId:le.sessionId,summary:ce}])}).then(()=>{yt.current&&(WT(),yn(le=>le+1))})})},[]);(0,ae.useEffect)(()=>{if(t!==void 0)return t.onFrame(P=>{hR(h.current,P,e)&&g(ne=>Nv(ne,h.current))})},[t,e]),(0,ae.useEffect)(()=>{let P=!1;ER();let ne=String(e.workspaceId),W=vi.get(ne);if(W!==void 0&&Date.now()-W.at>=NR&&(W=void 0),W===void 0){let ce=w2(ne);ce!==void 0&&(W={rows:ce.rows,cursor:ce.cursor,hasMore:ce.hasMore,at:Date.now()},vi.set(ne,W))}W!==void 0?(g(Nv(W.rows,h.current)),je.current=W.cursor,x(W.hasMore),b(void 0),p(!1)):(p(!0),b(void 0));let J=setTimeout(()=>{P||(p(!1),b('加载超时了，点一下"加载更多"重试'))},ZT);Rd().then(ce=>{if(P)return;let ft=ce.find(Ge=>Ge.workspaceId===e.workspaceId);ft!==void 0&&(Ce.current=new Set(ft.sessionIds.map(String)))},()=>{});let le=Promise.race([Rd().catch(()=>[]),new Promise(ce=>{setTimeout(()=>ce([]),SR)})]);return Promise.all([Hr(void 0,e.workspaceId),le]).then(([ce,ft])=>{if(P)return;clearTimeout(J),b(void 0);let Ge=ft.find(It=>It.workspaceId===e.workspaceId),xt=new Set((Ge?.sessionIds??e.sessionIds).map(String));Ce.current=xt;let Pe=Sv(ce.items,xt),ga=n===void 0?void 0:Pe.find(It=>It.sessionId===n);if(ga!==void 0){r(ga);return}if(g(Nv(Pe,h.current)),Rp(ne,{rows:Pe,cursor:ce.nextCursor,hasMore:ce.hasMore}),se(Pe),je.current=ce.nextCursor,x(ce.hasMore),p(!1),n!==void 0&&ga===void 0&&!Fn.current){Fn.current=!0;let It=()=>({sessionId:n,title:"定位的会话",updatedAt:0,running:!1,blank:!1});ce.hasMore?fa(n,ce.nextCursor,xt).then(Jr=>{r(Jr??It())},()=>{}):r(It())}},ce=>{P||(W===void 0&&b(he(ce)),p(!1))}),()=>{P=!0}},[e,n,r,se]),(0,ae.useEffect)(()=>{let P=String(e.workspaceId),ne=k2(P);return ne>0&&requestAnimationFrame(()=>{try{window.scrollTo(0,ne)}catch{}}),()=>{S2(P,window.scrollY)}},[e.workspaceId]),(0,ae.useEffect)(()=>{let P=!1;return $([]),Le(void 0),Te(!0),Df().then(ne=>{if(P)return;let W=ne.presets.filter(J=>J.broken===void 0);$(ne.presets),Le((W.find(J=>J.isDefault)??W[0])?.id),Te(!1)},()=>{P||Te(!1)}),()=>{P=!0}},[e,Qt]);let Se=(0,ae.useCallback)((P=!1)=>{if(Je.current||!P&&Date.now()-In.current<kR)return;let ne=je.current;if(ne===void 0){P&&xe(J=>J+1);return}Je.current=!0,p(!0);let W=setTimeout(()=>{yt.current&&(Je.current=!1,p(!1),In.current=Date.now(),b("加载超时了，再点一次"))},ZT);Hr(ne,e.workspaceId).then(J=>{Je.current=!1,p(!1),clearTimeout(W),b(void 0),In.current=0,je.current=J.nextCursor,x(J.hasMore);let le=Sv(J.items,y);g(ce=>{let ft=[...ce,...le];return vi.get(String(e.workspaceId))!==void 0&&Rp(String(e.workspaceId),{rows:ft,cursor:J.nextCursor,hasMore:J.hasMore}),ft}),se(le)},J=>{Je.current=!1,p(!1),clearTimeout(W),In.current=Date.now(),b(he(J))})},[e,se]);(0,ae.useEffect)(()=>{let P=$e.current;if(P===void 0||typeof IntersectionObserver>"u")return;let ne=new IntersectionObserver(W=>{W.some(J=>J.isIntersecting)&&(_t.current=0,je.current!==void 0&&!Je.current&&Se())},{rootMargin:"240px 0px"});return ne.observe(P),()=>{ne.disconnect()}},[Se]);let Tt=2;(0,ae.useEffect)(()=>{if(!w||A||_t.current>=Tt)return;let P=$e.current;P==null||P.getBoundingClientRect().top-window.innerHeight>240||(_t.current+=1,Se())},[w,A,v,Se]);let Et=(0,ae.useCallback)(()=>{N||(D(!0),T(void 0),Uk({workspaceId:e.workspaceId,...X!==void 0?{agentPreset:X}:{}}).then(P=>{D(!1);let ne={sessionId:P.sessionId,title:"新会话",updatedAt:Date.now(),running:!1,blank:!0};g(W=>{let J=[ne,...W],le=vi.get(String(e.workspaceId));return le!==void 0&&Rp(String(e.workspaceId),{rows:J,cursor:le.cursor,hasMore:le.hasMore}),J}),r(ne)},P=>{D(!1),T(he(P))}))},[N,e,r,X]),Bt=(0,ae.useCallback)(()=>{ma.current!==void 0&&(clearTimeout(ma.current),ma.current=void 0)},[]);(0,ae.useEffect)(()=>()=>{Bt()},[Bt]);let Yn=(P,ne)=>({onTouchStart:W=>{Bt(),xn.current=void 0,ma.current=window.setTimeout(()=>{ma.current=void 0,xn.current=P.sessionId,Rt(P)},500);let J=W.touches[0];J!==void 0&&(Zt.current={sessionId:P.sessionId,x:J.clientX,y:J.clientY})},onTouchMove:W=>{Bt();let J=Zt.current;if(J===void 0||J.sessionId!==P.sessionId)return;let le=W.touches[0];if(le===void 0)return;let ce=le.clientX-J.x,ft=le.clientY-J.y;Math.abs(ce)>JT&&Math.abs(ce)>Math.abs(ft)*1.5?(kn(ce<0?P.sessionId:void 0),Zt.current=void 0):Math.abs(ft)>JT&&(Zt.current=void 0)},onTouchEnd:()=>{Bt(),Zt.current=void 0},onClick:W=>{if(xn.current===P.sessionId){xn.current=void 0,W.preventDefault();return}if(qa===P.sessionId){kn(void 0),W.preventDefault();return}ne!==void 0?Ja(ne,P.title):r(P)},onContextMenu:W=>{W.preventDefault(),Rt(P)}}),Qn=(0,ae.useCallback)(P=>{fn(void 0),Rt(void 0),g(ne=>{let W=ne.filter(le=>le.sessionId!==P.sessionId),J=vi.get(String(e.workspaceId));return J!==void 0&&Rp(String(e.workspaceId),{rows:W,cursor:J.cursor,hasMore:J.hasMore}),W}),up(P.sessionId),Ld(P.sessionId).catch(ne=>{Y(`删除未生效：${he(ne)}`)})},[e]),Pa=O!==void 0?Xa(O):void 0,Dn=z.find(P=>P.id===X),[Ji,Sn]=(0,ae.useState)(!1),[an,Xr]=(0,ae.useState)(!1),$i=Dn?.description,Xn=(0,ae.useMemo)(()=>{let P=qe.trim().toLowerCase(),ne=new Set(St.map(Ge=>Ge.sessionId)),W=v.filter(Ge=>P===""?!0:Ge.title.toLowerCase().includes(P)||ne.has(Ge.sessionId)),J=W.filter(Ge=>wn.has(Ge.sessionId)),le=W.filter(Ge=>!wn.has(Ge.sessionId)),ce=J.length>0?[{bucket:"置顶",rows:J}]:[],ft=vR.map(Ge=>({bucket:Ge,rows:le.filter(xt=>bR(xt.updatedAt)===Ge)})).filter(Ge=>Ge.rows.length>0);return[...ce,...ft]},[v,qe,St,Kn,wn]);(0,ae.useEffect)(()=>{let P=qe.trim();if(P===""){Gn([]),de(0),Re(!1),j(!1),ut(!1);return}ut(!0),j(!1);let ne=!1,W=setTimeout(()=>{_f(P).then(J=>{if(ne)return;let le=Ce.current;Gn(J.items.filter(ce=>le.has(ce.sessionId))),de(J.items.filter(ce=>!le.has(ce.sessionId)).length),Re(J.hasMore),j(!0),ut(!1)},()=>{ne||(j(!0),ut(!1))})},250);return()=>{ne=!0,clearTimeout(W)}},[qe]);let Zr=()=>{Ie(!1),Xt("")},Ja=(P,ne)=>{let W={sessionId:P.sessionId,title:ne,...P.title===void 0?{preview:P.snippet}:{},updatedAt:0,running:!1,blank:!1};if(P.kind==="message"&&P.seq!==void 0){l!==void 0?l(W,P.seq,qe.trim(),P.messageId,P.partId):r(W);return}If(P.sessionId,qe.trim()).then(J=>{let le=J.items[0];le!==void 0&&l!==void 0?l(W,le.seq,qe.trim(),le.messageId,le.partId):r(W)},()=>{r(W)})};return(0,I.jsxs)("div",{className:"mobile",children:[(0,I.jsxs)("header",{className:"mobile-header",children:[(0,I.jsx)("div",{className:"mobile-headerSlot",children:Vt?(0,I.jsx)("button",{type:"button",className:"mobile-back","aria-label":"返回",onClick:Zr,children:"‹"}):(0,I.jsx)("button",{type:"button",className:"mobile-back","aria-label":"返回",onClick:i,children:"‹"})}),Vt?(0,I.jsx)("div",{className:"mobile-headerSearch",children:(0,I.jsx)("input",{type:"search",className:"mobile-headerSearchInput",placeholder:"搜索当前工作区或全部会话…","aria-label":"搜索会话",autoFocus:!0,value:qe,onChange:P=>{Xt(P.target.value)}})}):(0,I.jsxs)("div",{className:"mobile-titleWrap",children:[(0,I.jsx)("h1",{className:"mobile-title mobile-titleInline",children:e.title}),(0,I.jsx)("p",{className:"mobile-titlePath",children:e.path})]}),(0,I.jsx)("div",{className:"mobile-headerSlot mobile-headerSlot-right",children:Vt?(0,I.jsx)("button",{type:"button",className:"mobile-iconbtn","aria-label":"取消搜索",onClick:Zr,children:(0,I.jsx)(jr,{})}):(0,I.jsxs)(I.Fragment,{children:[(0,I.jsx)("button",{type:"button",className:"mobile-iconbtn","aria-label":"搜索会话",onClick:()=>{Ie(!0)},children:(0,I.jsx)(Yi,{})}),(0,I.jsx)("button",{type:"button",className:"mobile-iconbtn","aria-label":"设置",onClick:o,children:(0,I.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round","aria-hidden":!0,children:[(0,I.jsx)("circle",{cx:"12",cy:"12",r:"3"}),(0,I.jsx)("path",{d:"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"})]})}),(0,I.jsx)(dl,{})]})})]}),m!==void 0&&(0,I.jsx)("p",{className:"mobile-error mobile-pad",children:m}),(0,I.jsxs)("div",{className:"mobile-create",children:[z.length>0&&(0,I.jsxs)("div",{className:"mobile-presetCard",children:[(0,I.jsx)("button",{type:"button",className:"mobile-presetTrigger","aria-label":"Agent 模式",disabled:X===void 0,onClick:()=>{Xr(!0)},children:(0,I.jsxs)("span",{className:"mobile-presetTriggerCopy",children:[(0,I.jsxs)("span",{className:"mobile-presetTriggerTitle",children:[Dn?.name??X??"无可用 Agent 模式",Dn?.isDefault===!0?"（默认）":""]}),Dn?.description!==void 0&&(0,I.jsx)("span",{className:"mobile-presetTriggerDesc",children:Dn.description})]})}),(0,I.jsx)("span",{className:"mobile-presetCaret","aria-hidden":!0,children:"▾"}),(0,I.jsx)("button",{type:"button",className:"mobile-presetHelp","aria-label":"模式说明",disabled:$i===void 0,onClick:()=>{Sn(!0)},children:(0,I.jsx)(nN,{})})]}),(0,I.jsx)("button",{type:"button",className:"mobile-new",disabled:N||at,onClick:()=>{Et()},children:N?"创建中…":"+ 新建会话"})]}),O!==void 0&&(0,I.jsxs)("p",{className:"mobile-error mobile-pad",children:[O,Pa!==void 0&&(0,I.jsx)("span",{className:"mobile-hint",children:Pa})]}),(0,I.jsxs)("ul",{className:"mobile-list",children:[A&&v.length===0&&(0,I.jsx)("div",{"aria-hidden":"true",role:"presentation",children:[0,1,2].map(P=>(0,I.jsxs)("div",{className:"skel-row",children:[(0,I.jsx)("span",{className:"skel skel-icon"}),(0,I.jsxs)("div",{className:"skel-lines",children:[(0,I.jsx)("div",{className:"skel skel-line-title"}),(0,I.jsx)("div",{className:"skel skel-line-sub"})]}),(0,I.jsx)("span",{})]},P))}),(()=>{let P=0,ne=Xn.reduce((W,J)=>W+J.rows.length,0);return Xn.map(W=>(0,I.jsxs)("li",{style:{listStyle:"none"},children:[(0,I.jsx)("div",{className:"mobile-groupTitle",children:W.bucket}),W.rows.map(J=>{let le=St.find(Pe=>Pe.sessionId===J.sessionId&&(Pe.kind==="message"||Pe.kind==="title")),ce=J.preview??Xi.get(J.sessionId)??(J.turns!==void 0?`${J.turns} 轮对话`:void 0),Ge=P>=ne-TR||ne<20?void 0:{contentVisibility:"auto",containIntrinsicSize:"auto 72px"};P+=1;let xt=qa===J.sessionId;return(0,I.jsxs)("div",{className:"mobile-row-swipe",style:Ge,children:[(0,I.jsx)("button",{type:"button",className:"mobile-row-swipe-action","aria-label":"删除会话",onClick:()=>{kn(void 0),fn(J)},children:"删除"}),(0,I.jsx)("div",{className:"mobile-row-swipe-inner"+(xt?" swiped":""),children:(0,I.jsxs)("button",{type:"button",className:"mobile-row",...Yn(J,le),children:[(0,I.jsx)("span",{className:"card-icon",children:J.running?(0,I.jsx)("span",{className:"sess-dot sess-dot-running",role:"img","aria-label":"进行中"}):(0,I.jsx)("span",{className:"sess-check","aria-hidden":!0,children:(0,I.jsx)(Oa,{})})}),(0,I.jsxs)("span",{className:"card-main",children:[(0,I.jsxs)("span",{className:"sess-titleline",children:[(0,I.jsx)("span",{className:"sess-title",children:J.title}),J.blank&&(0,I.jsx)("span",{className:"sess-status",children:"新"}),J.running&&(0,I.jsx)("span",{className:"sess-status",children:"进行中"}),J.error!==void 0&&(0,I.jsx)("span",{className:"sess-status",title:J.error,children:"出错"}),(0,I.jsx)("span",{className:"sess-sep","aria-hidden":!0,children:"·"}),(0,I.jsx)("span",{className:"sess-time",children:t4(J.updatedAt)})]}),ce!==void 0&&(0,I.jsx)("span",{className:"card-desc",children:ce})]}),(0,I.jsx)("span",{className:"card-action",children:(0,I.jsx)("span",{className:"mobile-chevron","aria-hidden":!0,children:"›"})})]})})]},J.sessionId)})]},W.bucket))})(),!A&&Nt&&(0,I.jsx)("li",{style:{listStyle:"none"},children:(0,I.jsx)("p",{className:"mobile-muted mobile-pad",role:"status",children:"正在搜索全部会话…"})}),!A&&qe.trim()!==""&&!Nt&&St.some(P=>!v.some(ne=>ne.sessionId===P.sessionId))&&(0,I.jsxs)("li",{style:{listStyle:"none"},children:[(0,I.jsx)("div",{className:"mobile-groupTitle",children:"搜索结果（未加载的会话）"}),St.filter(P=>!v.some(ne=>ne.sessionId===P.sessionId)).map(P=>{let ne=(P.title??P.snippet.trim().slice(0,24))||"匹配会话";return(0,I.jsx)("li",{style:{listStyle:"none"},children:(0,I.jsxs)("button",{type:"button",className:"mobile-row",onClick:()=>{Ja(P,ne)},children:[(0,I.jsx)("span",{className:"card-icon",children:(0,I.jsx)("span",{className:"sess-check","aria-hidden":!0,children:(0,I.jsx)(Oa,{})})}),(0,I.jsxs)("span",{className:"card-main",children:[(0,I.jsxs)("span",{className:"sess-titleline",children:[(0,I.jsx)("span",{className:"sess-title",children:ne}),(0,I.jsx)("span",{className:"sess-sep","aria-hidden":!0,children:"·"}),(0,I.jsx)("span",{className:"sess-time",children:"命中内容"})]}),(0,I.jsx)("span",{className:"card-desc",children:P.snippet})]}),(0,I.jsx)("span",{className:"card-action",children:(0,I.jsx)("span",{className:"mobile-chevron","aria-hidden":!0,children:"›"})})]})},`${P.kind}:${P.sessionId}`)})]}),!A&&qe.trim()!==""&&!Nt&&Z>0&&(0,I.jsx)("li",{style:{listStyle:"none"},children:(0,I.jsxs)("p",{className:"search-hitsNote mobile-pad",children:["另有 ",Z," 个其他工作区的命中未在此显示，首页搜索可查全部"]})}),!A&&qe.trim()!==""&&!Nt&&Ee&&(0,I.jsx)("li",{style:{listStyle:"none"},children:(0,I.jsx)("p",{className:"search-hitsNote mobile-pad",children:"结果较多，仅显示前若干条——请细化关键词"})}),!A&&qe.trim()!==""&&!Nt&&bt&&Xn.length===0&&St.length===0&&(0,I.jsxs)("div",{className:"mobile-empty",children:[(0,I.jsx)("div",{className:"empty-icon",children:(0,I.jsx)(Yi,{})}),(0,I.jsx)("p",{className:"empty-title",children:"未找到匹配会话"}),(0,I.jsx)("p",{className:"empty-desc",children:"已搜索全部会话的标题与内容"})]}),w&&(0,I.jsx)("li",{style:{listStyle:"none"},children:(0,I.jsxs)("div",{className:"mobile-pad",children:[(0,I.jsx)("div",{ref:P=>{$e.current=P??void 0},"aria-hidden":"true"}),(0,I.jsx)("button",{type:"button",className:"mobile-button mobile-block",disabled:A,onClick:()=>{Se(!0)},children:A?"加载中…":"加载更多会话"})]})}),!w&&v.length===0&&!A&&(0,I.jsxs)("div",{className:"mobile-empty",children:[(0,I.jsx)("div",{className:"empty-icon",children:(0,I.jsx)(W2,{})}),(0,I.jsx)("p",{className:"empty-title",children:"还没有会话"}),(0,I.jsx)("p",{className:"empty-desc",children:"点上方按钮新建一个，开始这个项目的第一段对话"})]})]}),an&&(0,I.jsx)(ht,{title:"选择 Agent 模式",onClose:()=>{Xr(!1)},children:z.map((P,ne)=>(0,I.jsxs)("div",{children:[ne>0&&(0,I.jsx)("div",{className:"sheet-option-divider","aria-hidden":!0}),(0,I.jsxs)("button",{type:"button",className:`sheet-option${P.id===X?" sheet-option-selected":""}`,disabled:P.broken!==void 0,onClick:()=>{Le(P.id),Xr(!1)},children:[(0,I.jsxs)("span",{className:"sheet-option-copy",children:[(0,I.jsxs)("span",{className:"sheet-option-title",children:[P.name??P.id,P.isDefault?"（默认）":"",P.trust==="user"?"（本地）":"",P.broken!==void 0?"（不可用）":""]}),P.description!==void 0&&(0,I.jsx)("span",{className:"sheet-option-desc",children:P.description})]}),P.id===X&&(0,I.jsx)("span",{className:"sheet-option-check","aria-hidden":!0,children:(0,I.jsx)(Oa,{})})]})]},P.id))}),Ji&&(0,I.jsx)(ht,{title:"Agent 模式说明",onClose:()=>{Sn(!1)},children:(0,I.jsxs)("p",{className:"sheet-confirm-desc",children:[Dn?.name??X,$i!==void 0?"："+$i:""]})}),pa!==void 0&&(0,I.jsx)(ht,{title:pa.title,onClose:()=>{Rt(void 0)},children:(0,I.jsxs)("div",{role:"menu","aria-label":"会话操作",children:[(0,I.jsx)("div",{className:"sheet-option-divider","aria-hidden":!0}),(0,I.jsx)("button",{type:"button",role:"menuitem",className:"sheet-option",onClick:()=>{q(pa.sessionId),Rt(void 0)},children:(0,I.jsx)("span",{className:"sheet-option-copy",children:(0,I.jsx)("span",{className:"sheet-option-title",children:wn.has(pa.sessionId)?"取消置顶":"置顶"})})}),(0,I.jsx)("button",{type:"button",role:"menuitem",className:"sheet-option",onClick:()=>{Rt(void 0),fn(pa)},children:(0,I.jsx)("span",{className:"sheet-option-copy",children:(0,I.jsx)("span",{className:"sheet-option-title",style:{color:"var(--danger)"},children:"删除会话"})})})]})}),nn!==void 0&&(0,I.jsx)(ki,{title:"删除会话",body:(0,I.jsxs)(I.Fragment,{children:["确定删除「",nn.title,"」吗？该会话将从所有设备消失（电脑上的会话记录保留，可从桌面找回）。"]}),confirmLabel:"删除",tone:"danger",onCancel:()=>{fn(void 0)},onConfirm:()=>{Qn(nn)}})]})}var ee=K(Fe(),1);var Op={version:"1.6.0"};var o4=K(Fe(),1);var n4="dsh-palm.install-hint.v1";function RR(){if(typeof navigator>"u")return{userAgent:""};let e=navigator;return{userAgent:e.userAgent??"",standalone:e.standalone,maxTouchPoints:e.maxTouchPoints,displayModeStandalone:typeof window<"u"&&typeof window.matchMedia=="function"?window.matchMedia("(display-mode: standalone)").matches:void 0}}function a4(e=RR()){let{userAgent:t,maxTouchPoints:n=0}=e;return!(/iPhone|iPad|iPod/.test(t)||/Macintosh/.test(t)&&n>1)||/(CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo)/.test(t)?!1:e.standalone!==!0&&e.displayModeStandalone!==!0}function i4(){try{return localStorage.getItem(n4)==="1"}catch{return!1}}function r4(){try{localStorage.setItem(n4,"1")}catch{}}var fc=K(re(),1);function s4(){let[e,t]=(0,o4.useState)(i4);return e||!a4()?null:(0,fc.jsxs)("li",{className:"settings-note settings-installHint",children:[(0,fc.jsx)("span",{children:"装到主屏才是全屏 App（也能收推送）：Safari 底部「分享」→「添加到主屏幕」。"}),(0,fc.jsx)("button",{type:"button",className:"settings-installHint-btn",onClick:()=>{r4(),t(!0)},children:"知道了"})]})}var Ev=K(Fe(),1);var Za=K(re(),1);function OR(){if(!(typeof window>"u"))return window.__dshPalmPerf}function l4(e){return typeof e.marks=="number"?e.marks:Array.isArray(e.stamps)?e.stamps.length:0}async function d4(e){try{let t=navigator.clipboard;return t===void 0||typeof t.writeText!="function"?!1:(await t.writeText(JSON.stringify(e)),!0)}catch{return!1}}function _R(){let t=((typeof window.prompt=="function"?window.prompt("这是哪套环境？（如 android-lan / ios-lan / android-remote）","android-lan"):void 0)??"").trim();return t===""?"device":t}function c4(){let[e,t]=(0,Ev.useState)(!1),[n,a]=(0,Ev.useState)(void 0),i=Pf(),r=Uf();if(!r&&i.total===0)return null;let o=OR(),s=o?.stats(),l=s===void 0?0:l4(s),d=s?.frames?.sampled??0,f=g=>{if(e||o===void 0)return;let h=g?o.toJSON():o.stats();if(l4(h)===0&&!window.confirm("还没有采到回合标记（marks=0），可能这一轮没跑过。仍然上报吗？")){Y("已取消：先跑一轮再上报");return}t(!0),qk(h,_R()).then(w=>{t(!1),a(w.file),Y(`已上报性能数据：${w.file}`)},()=>{d4(h).then(w=>{t(!1),Y(w?"上报失败，已复制性能数据到剪贴板（粘给我即可）":"上报失败，且复制失败")},()=>{t(!1),Y("上报失败")})})},v=()=>{d4(i).then(g=>{Y(g?"运行错误已复制到剪贴板（粘给我即可）":"复制失败")},()=>{Y("复制失败")})};return(0,Za.jsxs)("li",{className:"settings-note settings-installHint",children:[(0,Za.jsxs)("span",{children:[r?`性能数据：已采集 ${l} 标记 · ${d} 帧`:`运行错误 ${i.total} 条`,r&&i.total>0?` · 运行错误 ${i.total} 条`:"",n===void 0?"":" · 已上报"]}),(0,Za.jsxs)("span",{className:"settings-perfActions",children:[r&&(0,Za.jsxs)(Za.Fragment,{children:[(0,Za.jsx)("button",{type:"button",className:"settings-installHint-btn",disabled:e||o===void 0,onClick:()=>{f(!1)},children:e?"上报中…":"上报摘要"}),(0,Za.jsx)("button",{type:"button",className:"settings-installHint-btn",disabled:e||o===void 0,onClick:()=>{f(!0)},children:"上报原始"})]}),i.total>0&&(0,Za.jsx)("button",{type:"button",className:"settings-installHint-btn",onClick:v,children:"复制错误"})]})]})}function IR(){if(typeof document>"u")return;let t=document.querySelector('script[src*="mobile.js"]')?.getAttribute("src")??"";return/[?&]v=([A-Za-z0-9_-]+)/.exec(t)?.[1]}var Cv=IR();var Ia=K(Fe(),1);var At=K(re(),1),f4="dsh.mobile.market.registry.v1",DR=3600*1e3;async function Mv(e){let t=await fetch(e,{headers:{accept:"application/json"}});if(!t.ok){let n="";try{let a=await t.json();typeof a.error=="string"&&(n=a.error)}catch{}throw new Error(`HTTP ${t.status}${n!==""?`：${n}`:""}`)}return await t.json()}async function LR(e,t){let n=await fetch(e,{method:"POST",headers:{accept:"application/json","content-type":"application/json"},body:JSON.stringify(t)});if(!n.ok){let a="";try{let i=await n.json();typeof i.error=="string"&&(a=i.error)}catch{}throw new Error(`HTTP ${n.status}${a!==""?`：${a}`:""}`)}return await n.json()}function zR(){try{let e=localStorage.getItem(f4);if(e===null)return;let t=JSON.parse(e);return Date.now()-t.at>DR?void 0:t.payload}catch{return}}function HR(e){try{localStorage.setItem(f4,JSON.stringify({at:Date.now(),payload:e}))}catch{}}function u4(e){return e.npm??e.name}function p4({onBack:e}){let[t,n]=(0,Ia.useState)(()=>zR()),[a,i]=(0,Ia.useState)(void 0),[r,o]=(0,Ia.useState)(void 0),[s,l]=(0,Ia.useState)(void 0),[d,f]=(0,Ia.useState)(t===void 0),[v,g]=(0,Ia.useState)(""),[h,w]=(0,Ia.useState)(void 0);(0,Ia.useEffect)(()=>{let p=!1;return t===void 0&&Mv("/dsh-market/registry").then(m=>{p||(n(m),HR(m),f(!1))},m=>{p||(o(he(m)),f(!1))}),Mv("/dsh-market/installed").then(m=>{p||i(m.installed)},()=>{}),()=>{p=!0}},[]);let x=(0,Ia.useMemo)(()=>{let p=t?.registry.plugins??[],m=v.trim().toLowerCase();return m===""?p:p.filter(b=>b.name.toLowerCase().includes(m)||b.owner.toLowerCase().includes(m)||(b.description?.zh??b.description?.en??"").toLowerCase().includes(m))},[t,v]),A=p=>{if(h!==void 0)return;let m=u4(p);a?.[m]===void 0&&window.confirm(`安装插件「${p.name}」？

安装会修改插件配置；完成后新插件可能需要重启 DSH 才生效。`)&&(w(p.url),l(void 0),o(void 0),LR("/dsh-market/install",{url:p.url}).then(()=>{w(void 0),l(`「${p.name}」安装完成。新插件可能需要重启 DSH 后生效。`),Mv("/dsh-market/installed").then(b=>{i(b.installed)},()=>{})},b=>{w(void 0),o(he(b))}))};return(0,At.jsxs)("div",{className:"mobile",children:[(0,At.jsxs)("header",{className:"mobile-header",children:[(0,At.jsx)("button",{type:"button",className:"mobile-back","aria-label":"返回",onClick:e,children:"‹"}),(0,At.jsx)("h1",{className:"mobile-title mobile-titleInline",children:"插件市场"})]}),(0,At.jsxs)("div",{className:"mobile-scroll",children:[r!==void 0&&(0,At.jsx)("p",{className:"mobile-error mobile-pad",role:"alert",children:r}),s!==void 0&&(0,At.jsx)("p",{className:"mobile-pad settings-saved",role:"status",children:s}),(0,At.jsx)("div",{className:"mobile-pad",children:(0,At.jsx)("input",{type:"search",className:"settings-input",placeholder:"搜索插件…",value:v,onChange:p=>{g(p.target.value)}})}),d&&(0,At.jsx)("p",{className:"mobile-muted mobile-pad",children:"正在加载插件目录…"}),!d&&t!==void 0&&(0,At.jsxs)("ul",{className:"settings-group",children:[(0,At.jsxs)("li",{className:"settings-groupTitle",children:["共 ",t.registry.count," 个插件",v!==""?`，匹配 ${x.length} 个`:""]}),x.slice(0,300).map(p=>{let m=u4(p),b=a?.[m]!==void 0,y=h===p.url;return(0,At.jsxs)("li",{className:"settings-row market-row",children:[(0,At.jsxs)("div",{className:"market-rowMain",children:[(0,At.jsxs)("span",{className:"market-rowTitle",children:[p.name,b&&(0,At.jsx)("span",{className:"market-badge",children:"已安装"})]}),(0,At.jsx)("span",{className:"market-rowDesc",children:p.description?.zh??p.description?.en??p.owner})]}),(0,At.jsx)("button",{type:"button",className:"market-install",disabled:y||b||h!==void 0,onClick:()=>{A(p)},children:y?"安装中…":b?"已安装":"安装"})]},p.url)}),x.length>300&&(0,At.jsx)("li",{className:"settings-note",children:"仅显示前 300 个插件，请用搜索缩小范围"}),x.length===0&&(0,At.jsx)("li",{className:"settings-note",children:"没有匹配的插件。"})]})]})]})}var Si=K(Fe(),1);var qR={"ui-theme":{preference:{title:"主题偏好",desc:"深色 / 浅色 / 跟随系统",scope:"sync"}},"ui-conversation":{busyEnter:{title:"忙碌时回车发送",desc:"模型生成中按回车直接发送下一条消息",scope:"sync"}},"ui-onboarding":{completed:{title:"引导完成状态",desc:"首次使用引导是否已完成",scope:"desktop"}},locale:{preference:{title:"界面语言",desc:"桌面端界面语言",scope:"desktop"}},"agent-presets":{default:{title:"默认预设",desc:"新会话使用的 Agent 预设",scope:"sync"}},"subagent-model":{provider:{title:"子代理提供方",desc:"子代理使用的模型提供方",scope:"sync"},model:{title:"子代理模型",desc:"子代理使用的模型",scope:"sync"}},"agent-default-model":{provider:{title:"模型提供方",desc:"新会话默认的模型提供方",scope:"sync"},model:{title:"模型",desc:"新会话默认的模型",scope:"sync"},reasoningEffort:{title:"推理档位",desc:"默认的推理强度",scope:"sync"}},"llm-pi-ai":{providers:{title:"模型提供方",desc:"已配置的提供方与模型目录",scope:"desktop"},apiKeys:{title:"API Key",desc:"各提供方的密钥（不显示）",scope:"desktop"}},"llm-deepseek":{baseURL:{title:"接口地址",desc:"DeepSeek API 地址",scope:"desktop"},apiKey:{title:"API Key",desc:"DeepSeek 密钥（不显示）",scope:"desktop"}},"free-search":{engine:{title:"搜索服务",desc:"免费搜索使用的引擎",scope:"desktop"}},"web-search-deepseek":{enabled:{title:"联网搜索",desc:"是否启用 DeepSeek 联网搜索",scope:"desktop"}},mnemon:{provider:{title:"记忆提供方",desc:"记忆空间使用的提供方",scope:"desktop"}},"mnemon-ui":{enabled:{title:"记忆界面",desc:"是否启用记忆界面",scope:"desktop"}},"at-file":{enabled:{title:"启用 @文件",desc:"在输入框支持 @ 引用文件",scope:"sync"}},"tool-see-image":{enabled:{title:"看图工具",desc:"是否启用图片查看工具",scope:"desktop"}},"agent-loop":{maxParallelToolCalls:{title:"最大并行工具调用",desc:"单轮最多同时执行的工具数",scope:"sync"}},shell:{defaultShell:{title:"默认 Shell",desc:"命令执行的默认 Shell",scope:"desktop"}},permission:{allowlist:{title:"命令白名单",desc:"允许执行的命令列表",scope:"desktop"}},"dsh-market":{allowRestart:{title:"允许重启",desc:"安装插件后允许自动重启",scope:"sync"}},"dsh-better-sidebar":{openByDefault:{title:"默认展开侧边栏",desc:"启动时侧边栏是否默认展开",scope:"sync"},defaultWidthPercent:{title:"默认宽度",desc:"侧边栏默认宽度（百分比）",scope:"sync"},autoOpenSubagent:{title:"自动展开子代理",desc:"子代理运行时自动展开其行",scope:"sync"},autoOpenJobs:{title:"自动展开任务",desc:"有后台任务时自动展开任务区",scope:"sync"},agentTerminalTools:{title:"终端工具按钮",desc:"agent 行显示终端工具入口",scope:"sync"},bottomPanelAutoTerminal:{title:"自动打开终端面板",desc:"底部面板自动切到终端",scope:"sync"},editorExplorer:{title:"编辑器文件树",desc:"编辑器侧显示文件树",scope:"sync"},tabsEnabled:{title:"启用标签页",desc:"编辑器标签页功能",scope:"sync"},viewersEnabled:{title:"启用查看器",desc:"内嵌文档/图查看器",scope:"sync"},terminalFontSize:{title:"终端字号",desc:"终端显示字号",scope:"sync"}},"dsh-palm":{enabled:{title:"远程访问",desc:"是否启用远程访问入口",scope:"desktop"}}};function pc(e,t){return qR[e]?.[t]}var oe=K(re(),1),PR={"ui-theme":"外观",locale:"语言","ui-conversation":"对话","agent-presets":"Agent 预设","subagent-model":"子代理模型","agent-default-model":"默认模型","at-file":"@文件","agent-loop":"Agent 循环","dsh-market":"插件市场","dsh-better-sidebar":"侧边栏","llm-deepseek":"DeepSeek 模型","llm-pi-ai":"模型提供方","free-search":"搜索","tool-see-image":"看图工具","web-search-deepseek":"联网搜索",shell:"Shell",permission:"权限","dsh-palm":"远程访问",mnemon:"记忆","mnemon-ui":"记忆界面","ui-onboarding":"引导"},VR={"ui-theme":["preference"],"ui-conversation":["busyEnter"],"agent-presets":["default"],"subagent-model":["model","provider"],"agent-default-model":["model","provider","reasoningEffort"],"at-file":["enabled"],"agent-loop":["maxParallelToolCalls"],"dsh-market":["allowRestart"],"dsh-better-sidebar":["*"]};function Zi(e,t){let n=VR[e];return n===void 0?!1:n.includes("*")||n.includes(t)}function mc(e){return PR[e]??e}function UR(e,t){let n=e.find(r=>r.ns==="llm-pi-ai")?.value,a=Object.keys(n?.providers??{}),i={};for(let r of a)i[r]=[...new Set((n?.providers?.[r]?.models??[]).map(o=>o.id??o.name??"").filter(Boolean))];return{"agent-default-model":{provider:a,model:i},"subagent-model":{provider:a,model:i},"agent-presets":{default:t.map(r=>r.id)}}}function gc(e,t){return e.refs[String(t)]??{type:"unknown"}}function BR(e,t){let n=[];for(let a of t.list??[]){let i=gc(e,a);i.type==="const"&&n.push({value:i.value,label:String(i.value)})}return n}function jR(e,t){let n=t.list??[];return n.length>0&&n.every(a=>gc(e,a).type==="const")}function GR({ns:e,field:t,node:n,value:a,options:i,ownerHint:r,onChange:o}){let s=Zi(e,t),l=pc(e,t),d=l?.title??t,f=l?.desc??n.meta?.description,v=(()=>{if(n.type==="boolean")return(0,oe.jsx)("button",{type:"button",role:"switch","aria-label":d,"aria-checked":a===!0,disabled:!s,className:`settings-switch${a===!0?" settings-switch-on":""}`,onClick:()=>{o(a!==!0)}});if(n.type==="number")return(0,oe.jsx)("input",{type:"number","aria-label":d,value:typeof a=="number"?String(a):"",disabled:!s,className:"settings-input",onChange:g=>{let h=g.target.value;if(h==="")return;let w=Number(h);o(Number.isFinite(w)?w:a)}});if(n.type==="string"){let g=i!==void 0&&i.length>0;return(0,oe.jsxs)(oe.Fragment,{children:[g&&(0,oe.jsx)("div",{className:"settings-optionStrip",role:"listbox","aria-label":`${d} 选项`,children:i.map(h=>(0,oe.jsx)("button",{type:"button",role:"option","aria-selected":a===h,className:`settings-optionChip${a===h?" settings-optionChip-on":""}`,onClick:()=>{o(h)},children:h},h))}),r!==void 0&&(0,oe.jsxs)("p",{className:"settings-ownerHint",children:["来自 ",r]}),(0,oe.jsx)("input",{type:"text","aria-label":d,value:typeof a=="string"?a:"",disabled:!s,placeholder:g?"或输入自定义值…":void 0,className:"settings-input",onChange:h=>{o(h.target.value)}})]})}if(n.type==="array"){let g=Array.isArray(a)?a.map(h=>String(h)).join(`
`):"";return(0,oe.jsx)("textarea",{"aria-label":d,value:g,disabled:!s,className:"settings-textarea",rows:3,onChange:h=>{let w=h.target.value.split(`
`).map(x=>x.trim()).filter(x=>x!=="");o(w)}})}return n.type==="secret"?(0,oe.jsx)("span",{className:"settings-readonly",children:a===!0?"已配置":"未配置"}):(0,oe.jsx)("span",{className:"settings-readonly",children:JSON.stringify(a)})})();return(0,oe.jsxs)("div",{className:"settings-field",children:[(0,oe.jsxs)("div",{className:"settings-fieldHead",children:[(0,oe.jsx)("span",{className:"settings-fieldLabel",children:d}),!s&&(0,oe.jsx)("span",{className:"settings-fieldLock",children:"桌面端修改"})]}),f!==void 0&&(0,oe.jsx)("p",{className:"settings-fieldDesc",children:f}),v]})}function m4({ns:e,envelope:t,node:n,value:a,fieldOptions:i,onChange:r}){let o=typeof a=="object"&&a!==null&&!Array.isArray(a)?a:{},s=Object.entries(n.dict??{}),l=s.filter(([f])=>Zi(e,f)),d=s.filter(([f])=>!Zi(e,f));return(0,oe.jsxs)(oe.Fragment,{children:[l.map(([f,v])=>{let g=gc(t,v),h=o[f];if(g.type==="object")return(0,oe.jsxs)("div",{className:"settings-subgroup",children:[(0,oe.jsx)("span",{className:"settings-subgroupTitle",children:pc(e,f)?.title??f}),(0,oe.jsx)(m4,{ns:e,envelope:t,node:g,value:h,fieldOptions:i,onChange:A=>{r({...o,[f]:A})}})]},f);if(g.type==="union"&&jR(t,g)){let A=BR(t,g);return(0,oe.jsxs)("div",{className:"settings-field",children:[(0,oe.jsx)("div",{className:"settings-fieldHead",children:(0,oe.jsx)("span",{className:"settings-fieldLabel",children:pc(e,f)?.title??f})}),(0,oe.jsx)("div",{className:"settings-themeOptions",children:A.map(p=>(0,oe.jsx)("button",{type:"button","aria-pressed":h===p.value,className:`settings-themeOption${h===p.value?" settings-themeOption-on":""}`,onClick:()=>{r({...o,[f]:p.value})},children:p.label},String(p.value)))})]},f)}let w=i[f],x=typeof w=="object"&&w!==null&&!Array.isArray(w)?w[String(o.provider)]??[]:Array.isArray(w)?w:[];return(0,oe.jsx)(GR,{ns:e,field:f,node:g,value:h,options:x,ownerHint:typeof w=="object"&&w!==null&&!Array.isArray(w)?String(o.provider):void 0,onChange:A=>{r({...o,[f]:A})}},f)}),d.length>0&&(0,oe.jsx)(g4,{ns:e,envelope:t,entries:d,record:o})]})}function FR(e){if(e===void 0)return"—";if(typeof e=="boolean")return e?"开":"关";if(typeof e=="string")return e===""?"（空）":e;if(typeof e=="number"||typeof e=="bigint")return String(e);if(Array.isArray(e))return e.length===0?"（空）":e.map(t=>String(t)).join(" · ");if(typeof e=="object"&&e!==null){let t=JSON.stringify(e);return t!==void 0&&t.length>60?`${t.slice(0,57)}…`:t??"—"}return String(e)}function g4({ns:e,envelope:t,entries:n,record:a}){let[i,r]=(0,Si.useState)(!1);return(0,oe.jsxs)("div",{className:"settings-roBlock",children:[(0,oe.jsxs)("button",{type:"button",className:"settings-roSummary","aria-expanded":i,onClick:()=>{r(o=>!o)},children:[(0,oe.jsxs)("span",{children:["只读配置（",n.length," 项）"]}),(0,oe.jsx)("span",{className:"settings-roToggle",children:i?"收起 ▴":"展开 ▾"})]}),i&&(0,oe.jsx)("div",{className:"settings-roList",children:n.map(([o,s])=>{let l=gc(t,s),d=a[o],v=pc(e,o)?.title??o,g=l.type==="secret"?d===!0?"已配置":"未配置":FR(d);return(0,oe.jsxs)("div",{className:"settings-roItem",children:[(0,oe.jsx)("span",{className:"settings-roKey",children:v}),(0,oe.jsx)("span",{className:"settings-roValue",children:g})]},o)})})]})}function h4({namespaces:e,allNamespaces:t,onBack:n,onOpenMarket:a}){let[i,r]=(0,Si.useState)(()=>{let p={};for(let m of e)p[m.ns]=m.value;return p}),[o,s]=(0,Si.useState)(!1),[l,d]=(0,Si.useState)(void 0),[f,v]=(0,Si.useState)(!1),[g,h]=(0,Si.useState)({});(0,Si.useEffect)(()=>{let p=!1,m=b=>{if(p)return;let y=UR(t,b),N={};for(let D of e){let O=y[D.ns];O!==void 0&&Object.assign(N,O)}h(N)};return Df().then(b=>{m(b.presets)},()=>{m([])}),()=>{p=!0}},[e,t]),(0,Si.useEffect)(()=>{let m=i["ui-theme"]?.preference;(m==="light"||m==="dark"||m==="system")&&Xf(m)},[i]);let w=()=>{if(f)return;let p=e.map(m=>({ns:m.ns,revision:m.revision,ops:Object.entries(i[m.ns]).filter(([b])=>Zi(m.ns,b)).map(([b,y])=>({op:"set",path:[b],value:y}))})).filter(m=>m.ops.length>0);p.length!==0&&(v(!0),d(void 0),s(!1),Promise.all(p.map(m=>Js(m.ns,m.ops,m.revision))).then(()=>{v(!1),s(!0)},m=>{v(!1),d(he(m))}))},x=e.some(p=>p.ns==="dsh-market"),A=e.reduce((p,m)=>p+Object.keys(m.value??{}).filter(b=>Zi(m.ns,b)).length,0);return(0,oe.jsxs)("div",{className:"mobile",children:[(0,oe.jsxs)("header",{className:"mobile-header",children:[(0,oe.jsx)("button",{type:"button",className:"mobile-back","aria-label":"返回",onClick:n,children:"‹"}),(0,oe.jsx)("h1",{className:"mobile-title mobile-titleInline",children:e.length===1?mc(e[0].ns):"设置"})]}),(0,oe.jsxs)("div",{className:"mobile-scroll",children:[l!==void 0&&(0,oe.jsx)("p",{className:"mobile-error mobile-pad",role:"alert",children:l}),o&&(0,oe.jsx)("p",{className:"mobile-pad settings-saved",role:"status",children:"已保存"}),x&&a!==void 0&&(0,oe.jsx)("div",{className:"mobile-pad",children:(0,oe.jsx)("button",{type:"button",className:"mobile-button",onClick:a,children:"打开插件市场"})}),e.map(p=>{let m=p.schema,b=gc(m,m.uid),y=i[p.ns]??{},N=Object.keys(y).some(O=>Zi(p.ns,O)),D=Object.entries(b.dict??{}).filter(([O])=>!Zi(p.ns,O));return(0,oe.jsxs)("div",{className:"settings-card",children:[(0,oe.jsxs)("div",{className:"settings-cardHead",children:[(0,oe.jsx)("span",{className:"settings-cardTitle",children:mc(p.ns)}),!N&&(0,oe.jsx)("span",{className:"settings-fieldLock",children:"只读"})]}),b.type==="object"&&N?(0,oe.jsx)(m4,{ns:p.ns,envelope:m,node:b,value:i[p.ns],fieldOptions:g,onChange:O=>{r(T=>({...T,[p.ns]:O}))}}):b.type==="object"&&D.length>0?(0,oe.jsx)(g4,{ns:p.ns,envelope:m,entries:D,record:y}):(0,oe.jsx)("span",{className:"settings-readonly",children:JSON.stringify(i[p.ns])})]},p.ns)}),A>0&&(0,oe.jsx)("div",{className:"mobile-pad",children:(0,oe.jsx)("button",{type:"button",className:"mobile-button",disabled:f,onClick:w,children:f?"保存中…":"保存"})})]})]})}var u=K(re(),1);function Da({scope:e}){let t=e==="phone"?"本机":e==="sync"?"同步桌面":e==="desktop"?"桌面端":e==="ro"?"只读":"推荐";return(0,u.jsx)("span",{className:`settings-badge settings-badge-${e}`,children:t})}function hc({configured:e}){return(0,u.jsx)("span",{className:`settings-channelState${e?" settings-channelState-on":""}`,children:e?"已配置 ✓（凭据存于电脑端）":"未配置"})}function KR(e,t){let n=Math.max(0,Math.round((t-e)/1e3));if(n<60)return`${String(n)} 秒前`;let a=Math.round(n/60);return a<60?`${String(a)} 分钟前`:`${String(Math.round(a/60))} 小时前`}function y4(e){let t=new Date(e),n=t.toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit",hour12:!1}),a=new Date;return t.getFullYear()===a.getFullYear()&&t.getMonth()===a.getMonth()&&t.getDate()===a.getDate()?n:`${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")} ${n}`}var b4=[{id:"general",title:"通用",namespaces:["ui-theme","locale","ui-conversation","ui-onboarding"]},{id:"models",title:"模型",namespaces:["llm-pi-ai","llm-deepseek","subagent-model","agent-default-model"]},{id:"search",title:"搜索",namespaces:["free-search","web-search-deepseek"]},{id:"memory",title:"记忆",namespaces:["mnemon","mnemon-ui"]},{id:"tools",title:"工具",namespaces:["at-file","tool-see-image","agent-loop"]},{id:"system",title:"系统",namespaces:["shell","permission"]},{id:"plugins",title:"插件",namespaces:["dsh-market","dsh-better-sidebar"]},{id:"remote",title:"远程访问",namespaces:["dsh-palm"]},{id:"presets",title:"Agent 预设",namespaces:["agent-presets"]}],YR=[{id:"notify-browser",label:"浏览器通知（启用）",group:"通知",keywords:["浏览器通知","通知权限","notify","enable"],open:"notify"},{id:"notify-kinds",label:"通知内容（三类事件开关）",group:"通知",keywords:["通知内容","规划完成","后台任务","长回复"],open:"notify"},{id:"notify-wxpusher",label:"推送渠道 · WxPusher SPT",group:"通知",keywords:["wxpusher","spt","微信推送","微信直达"],open:"notify"},{id:"notify-pushplus",label:"推送渠道 · PushPlus（已降级）",group:"通知",keywords:["pushplus","token","微信直达","已降级"],open:"notify"},{id:"notify-serverchan",label:"推送渠道 · Server酱 SendKey",group:"通知",keywords:["serverchan","sendkey","server酱","sct"],open:"notify"},{id:"notify-bark",label:"推送渠道 · Bark Key",group:"通知",keywords:["bark","bark key","ios 直达"],open:"notify"},{id:"notify-tg",label:"推送渠道 · Telegram",group:"通知",keywords:["telegram","bot token","chat id","tg"],open:"notify"},{id:"notify-webpush",label:"Web Push（系统推送）",group:"通知",keywords:["web push","系统推送","fcm","代理"],open:"notify"},{id:"notify-triggers",label:"触发条件（阈值与间隔）",group:"通知",keywords:["触发条件","阈值","间隔","cooldown"],open:"notify"},{id:"notify-privacy",label:"隐私（锁屏隐藏详情）",group:"通知",keywords:["隐私","锁屏隐藏","隐藏详情"],open:"notify"},{id:"voice-add",label:"语音 · 添加/编辑转写服务",group:"语音",keywords:["添加服务","语音服务","transcribe","转写","baseurl"],open:"voice"},{id:"voice-list",label:"语音 · 服务列表管理",group:"语音",keywords:["语音列表","排序","上移","下移","删除服务"],open:"voice"}];function za({icon:e,title:t,desc:n,action:a,onClick:i,locateId:r,focused:o}){let s=(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)("span",{className:"card-icon",children:(0,u.jsx)("span",{"aria-hidden":!0,children:e})}),(0,u.jsxs)("span",{className:"card-main",children:[(0,u.jsx)("span",{className:"card-title",children:(0,u.jsx)("span",{className:"card-titleText",children:t})}),n!==void 0&&(0,u.jsx)("span",{className:"card-desc",children:n})]}),(0,u.jsx)("span",{className:"card-action",children:a})]}),l=r===void 0?{}:{"data-locate-id":r},d="settings-row"+(o===!0?" settings-focus":"");return i===void 0?(0,u.jsx)("li",{className:d,...l,children:s}):(0,u.jsx)("li",{children:(0,u.jsx)("button",{type:"button",className:d,onClick:i,...l,children:s})})}function La(){return(0,u.jsx)("span",{className:"mobile-chevron","aria-hidden":!0,children:"›"})}function Av({title:e,options:t,value:n,onPick:a,onClose:i}){return(0,u.jsx)(ht,{title:e,onClose:i,children:(0,u.jsx)("div",{role:"listbox","aria-label":e,children:t.map(r=>(0,u.jsxs)("button",{type:"button",role:"option","aria-selected":r.value===n,className:`sheet-option${r.value===n?" sheet-option-selected":""}`,onClick:()=>{a(r.value),i()},children:[(0,u.jsx)("span",{className:"sheet-option-copy",children:(0,u.jsx)("span",{className:"sheet-option-title",children:r.label})}),r.value===n&&(0,u.jsx)("span",{className:"sheet-option-check","aria-hidden":!0,children:"✓"})]},r.value))})})}async function QR(){try{if(typeof caches<"u"){let e=await caches.keys();await Promise.all(e.map(t=>caches.delete(t)))}if(typeof navigator<"u"&&navigator.serviceWorker!==void 0){let e=await navigator.serviceWorker.getRegistrations();await Promise.all(e.map(t=>t.unregister()))}Y("缓存已清除")}catch{Y("清除缓存失败")}}function Rv({icon:e,title:t,desc:n,value:a,onChange:i}){return(0,u.jsx)(za,{icon:e,title:t,desc:n,action:(0,u.jsx)("button",{type:"button",role:"switch","aria-label":t,"aria-checked":a,className:`settings-switch${a?" settings-switch-on":""}`,onClick:()=>{i(!a)}})})}function XR(e){let t=e.providers.filter(n=>n.status==="ok");return t.length===0?`已配置 ${e.providers.length} 个提供方`:t.slice(0,3).map(n=>n.kind==="usage"&&n.usedPercent!==void 0?`${n.name} · 余量 ${Math.round((1-n.usedPercent)*100)}%`:n.summary!==void 0?`${n.name} · ${n.summary}`:n.kind==="balance"&&n.balance!==void 0?`${n.name} · ${n.balance}`:n.name).join(" · ")}function v4(e){if(e===void 0)return"窗口随请求持续滑动，无固定重置时刻";let t=new Date(e),n=a=>String(a).padStart(2,"0");return`重置于 ${n(t.getMonth()+1)}-${n(t.getDate())} ${n(t.getHours())}:${n(t.getMinutes())}`}function ZR({provider:e}){if(e.status==="ok"){let t=e.kind==="usage"?e.plan??"可用":"余额";return(0,u.jsx)("span",{className:"usage-badge usage-badge-ok",children:t})}return e.status==="no-key"?(0,u.jsx)("span",{className:"usage-badge usage-badge-no",children:"未配置"}):e.status==="unsupported"?(0,u.jsx)("span",{className:"usage-badge usage-badge-na",children:"不支持"}):(0,u.jsx)("span",{className:"usage-badge usage-badge-err",children:"失败"})}function JR({provider:e}){let t=e.baseURL!==void 0?(()=>{try{return new URL(e.baseURL).hostname}catch{return e.baseURL}})():void 0;return(0,u.jsxs)("div",{className:"usage-provider",children:[(0,u.jsxs)("div",{className:"usage-providerHead",children:[(0,u.jsxs)("span",{className:"usage-providerName",children:[e.name,t!==void 0&&(0,u.jsx)("span",{className:"usage-providerBase",children:t})]}),(0,u.jsx)(ZR,{provider:e})]}),e.status==="ok"&&e.kind==="usage"&&e.usedPercent!==void 0&&(0,u.jsxs)(u.Fragment,{children:[e.sessionUsed!==void 0&&(0,u.jsxs)("div",{className:"usage-block",children:[(0,u.jsxs)("div",{className:"usage-row",children:[(0,u.jsx)("span",{className:"usage-rowLabel",children:"近 5 小时"}),(0,u.jsxs)("span",{className:"usage-rowValue",children:[(e.sessionUsed*100).toFixed(0),"%"]})]}),(0,u.jsx)("div",{className:"usage-meter",children:(0,u.jsx)("div",{className:"usage-meterFill",style:{width:`${(e.sessionUsed*100).toFixed(0)}%`}})}),(0,u.jsx)("p",{className:"usage-resetNote",children:v4(e.sessionResetsAt)})]}),(0,u.jsxs)("div",{className:"usage-block",children:[(0,u.jsxs)("div",{className:"usage-row",children:[(0,u.jsx)("span",{className:"usage-rowLabel",children:"本周"}),(0,u.jsxs)("span",{className:"usage-rowValue",children:[(e.usedPercent*100).toFixed(1),"% · 余 ",((1-e.usedPercent)*100).toFixed(1),"%"]})]}),(0,u.jsx)("div",{className:"usage-meter",children:(0,u.jsx)("div",{className:"usage-meterFill",style:{width:`${(e.usedPercent*100).toFixed(0)}%`}})}),(0,u.jsx)("p",{className:"usage-resetNote",children:v4(e.weeklyResetsAt)})]})]}),e.status==="ok"&&e.kind==="usage"&&e.summary!==void 0&&(0,u.jsxs)("div",{className:"usage-stats",children:[(0,u.jsx)("span",{children:(0,u.jsx)("b",{children:e.summary})}),(0,u.jsx)("span",{})]}),e.status==="ok"&&e.kind==="balance"&&(0,u.jsxs)("div",{className:"usage-stats",children:[(0,u.jsxs)("span",{children:["充值余额 ",(0,u.jsx)("b",{children:e.balance??"—"})]}),(0,u.jsx)("span",{})]}),e.status==="no-key"&&(0,u.jsx)("p",{className:"settings-note",children:"桌面端未配置 API Key，已按用量计费无法查询"}),e.status==="unsupported"&&(0,u.jsx)("p",{className:"settings-note",children:"该提供方无公开余额/用量接口"}),e.status==="error"&&(0,u.jsx)("p",{className:"settings-note",children:"用量查询失败，请稍后重试"}),e.models!==void 0&&e.models.length>0&&(0,u.jsx)("div",{className:"usage-models",children:e.models.map(n=>(0,u.jsxs)("div",{className:"usage-model",children:[(0,u.jsx)("span",{className:"usage-modelName",children:n.name}),(0,u.jsxs)("span",{className:"usage-modelCount",children:[n.requestCount.toLocaleString()," 次"]})]},n.name))})]})}function $R({onBack:e}){let[t,n]=(0,ee.useState)(void 0),[a,i]=(0,ee.useState)(4),[r,o]=(0,ee.useState)(void 0),[s,l]=(0,ee.useState)(!1),[d,f]=(0,ee.useState)(void 0),[v,g]=(0,ee.useState)(void 0),h=()=>{l(!0),aS().then(m=>{n(m.devices),i(m.maxDevices),o(void 0),l(!1)},m=>{o(he(m)),l(!1)})};(0,ee.useEffect)(()=>{h()},[]);let w=m=>{let b=d;f(void 0),b!==void 0&&rS(b.id,m).then(()=>{h(),Y("已重命名")},y=>{Y(he(y))})},x=m=>{oS(m.id).then(()=>{h(),Y("已设为主设备")},b=>{Y(he(b))})},A=()=>{let m=v;g(void 0),m!==void 0&&iS(m.id).then(()=>{h(),Y("已移除该设备")},b=>{Y(he(b))})},p=m=>m.name!==void 0&&m.name!==""?m.name:"未命名设备";return(0,u.jsxs)("div",{className:"mobile",children:[(0,u.jsxs)("header",{className:"mobile-header",children:[(0,u.jsx)("div",{className:"mobile-headerSlot",children:(0,u.jsx)("button",{type:"button",className:"mobile-back","aria-label":"返回",onClick:e,children:"‹"})}),(0,u.jsx)("h1",{className:"mobile-title",children:"设备管理"}),(0,u.jsx)("div",{className:"mobile-headerSlot mobile-headerSlot-right"})]}),(0,u.jsxs)("div",{className:"mobile-scroll",children:[(0,u.jsxs)("p",{className:"settings-note",children:["已配对 ",t?.length??0," / ",a," 台设备。主设备不会被自动移除；设备数满时，闲置设备会先被淘汰，在线设备不会被挤掉。"]}),r!==void 0&&(0,u.jsx)("p",{className:"mobile-error",role:"alert",children:r}),t===void 0&&r===void 0&&(0,u.jsx)("p",{className:"settings-note",children:"加载中…"}),t!==void 0&&(0,u.jsxs)("div",{className:"settings-card",children:[t.length===0&&(0,u.jsx)("p",{className:"settings-note",children:"暂无已配对设备。"}),t.map(m=>(0,u.jsxs)("div",{className:"device-row",children:[(0,u.jsxs)("span",{className:"device-copy",children:[(0,u.jsxs)("span",{className:"device-name",children:[p(m),m.primary===!0&&(0,u.jsx)("span",{className:"device-badge device-badge-primary",children:"主设备"}),m.current===!0&&(0,u.jsx)("span",{className:"device-badge device-badge-current",children:"本机"})]}),(0,u.jsxs)("span",{className:"device-desc",children:[(0,u.jsx)("span",{className:`device-status${m.online?" device-status-on":""}`,children:m.online?"在线":"闲置"})," · ",y4(m.lastSeenAt),m.userAgent!==void 0&&(0,u.jsxs)("span",{className:"device-ua",children:[" · ",m.userAgent.slice(0,40)]})]})]}),(0,u.jsxs)("span",{className:"device-actions",children:[(0,u.jsx)("button",{type:"button",className:"device-btn","aria-label":"重命名",onClick:()=>{f(m)},children:(0,u.jsx)(Jd,{})}),m.primary!==!0&&(0,u.jsx)("button",{type:"button",className:"device-btn","aria-label":"设为主设备",disabled:s,onClick:()=>{x(m)},children:(0,u.jsx)($d,{})}),m.current!==!0&&(0,u.jsx)("button",{type:"button",className:"device-btn device-btn-danger","aria-label":"移除设备",disabled:s,onClick:()=>{g(m)},children:(0,u.jsx)(ap,{})})]})]},m.id))]})]}),d!==void 0&&(0,u.jsx)(Vo,{title:"重命名设备",initial:d.name??"",confirmLabel:"保存",onCancel:()=>{f(void 0)},onConfirm:w}),v!==void 0&&(0,u.jsx)(ki,{title:"移除设备？",body:`移除「${p(v)}」后，该设备将无法再访问此电脑，需重新配对。`,confirmLabel:"移除",tone:"danger",onCancel:()=>{g(void 0)},onConfirm:A})]})}function x4({onBack:e}){let[t,n]=(0,ee.useState)(void 0),[a,i]=(0,ee.useState)(void 0),[r,o]=(0,ee.useState)(void 0),[s,l]=(0,ee.useState)(!1),d=(0,ee.useSyncExternalStore)(Yf,l2),[f,v]=(0,ee.useState)(()=>Tb()),[g,h]=(0,ee.useState)(()=>Eb()),[w,x]=(0,ee.useState)(()=>Cb()),[A,p]=(0,ee.useState)(()=>jf()),[m,b]=(0,ee.useState)(()=>Mb()),[y,N]=(0,ee.useState)(null),[D,O]=(0,ee.useState)(!1),[T,z]=(0,ee.useState)(()=>sc()),[$,X]=(0,ee.useState)(null),[Le,at]=(0,ee.useState)(void 0),[Te,je]=(0,ee.useState)(""),[Je,Qt]=(0,ee.useState)(""),[xe,_t]=(0,ee.useState)(""),[$e,Vt]=(0,ee.useState)(""),[Ie,qe]=(0,ee.useState)([]),[Xt,St]=(0,ee.useState)(!1),[Gn,Nt]=(0,ee.useState)(!1),[ut,bt]=(0,ee.useState)(!1),[j,Z]=(0,ee.useState)(()=>WS()),[de,Ee]=(0,ee.useState)(void 0),[Re,Ce]=(0,ee.useState)(!1),[Fn,vt]=(0,ee.useState)(""),[fa,Kn]=(0,ee.useState)(""),[yn,yt]=(0,ee.useState)(""),[In,pa]=(0,ee.useState)(""),[Rt,nn]=(0,ee.useState)(""),[fn,ma]=(0,ee.useState)(""),[xn,wn]=(0,ee.useState)(void 0),[Ut,qa]=(0,ee.useState)(void 0),[kn,Zt]=(0,ee.useState)(!1),[q,F]=(0,ee.useState)(!1),se=Ut===void 0?void 0:{...Ut,providers:Ut.providers.filter(E=>E.status!=="unsupported")},[Se,Tt]=(0,ee.useState)("30"),[Et,Bt]=(0,ee.useState)("2"),[Yn,Qn]=(0,ee.useState)([]),[Pa,Dn]=(0,ee.useState)(!1),[Ji,Sn]=(0,ee.useState)(!1),[an,Xr]=(0,ee.useState)({jobs:!1,todo:!0,turns:!1}),[$i,Xn]=(0,ee.useState)(!1),[Zr,Ja]=(0,ee.useState)(!1),[P,ne]=(0,ee.useState)(void 0),[W,J]=(0,ee.useState)(void 0),[le,ce]=(0,ee.useState)(!1);(0,ee.useEffect)(()=>iT(()=>z(sc())),[]),(0,ee.useEffect)(()=>{y==="about"&&Fo()},[y]),(0,ee.useEffect)(()=>{let E=!1;return Rf().then(te=>{E||n(te.namespaces)},te=>{E||i(he(te))}),()=>{E=!0}},[]),(0,ee.useEffect)(()=>{let E=!1;return Od().then(te=>{E||(Ee(te),Tt(String(Math.round(te.turnThresholdMs/1e3))),Bt(String(Math.round(te.turnCooldownMs/6e4))),Sn(te.hideDetails===!0),Xr({jobs:te.kinds.jobs,todo:te.kinds.todo,turns:te.kinds.turns}))},()=>{}),()=>{E=!0}},[]),(0,ee.useEffect)(()=>{if(!Xt)return;let E=!1;return Dn(!0),Dk().then(te=>{E||(Qn(te.items),Dn(!1))},()=>{E||(Qn([]),Dn(!1))}),()=>{E=!0}},[Xt]),(0,ee.useEffect)(()=>{let E=!1;return t2().then(te=>{E||wn(te!==void 0)},()=>{E||wn(!1)}),()=>{E=!0}},[]),(0,ee.useEffect)(()=>{let E=!1;return ub().then(te=>{E||qa(te)},()=>{}),()=>{E=!0}},[]);let[ft,Ge]=(0,ee.useState)(""),xt=ft.trim().toLowerCase(),Pe=(...E)=>xt===""||E.some(te=>te!==void 0&&te.toLowerCase().includes(xt)),[ga,It]=(0,ee.useState)(void 0),Jr=xt===""?[]:YR.filter(E=>E.label.toLowerCase().includes(xt)||E.keywords.some(te=>te.toLowerCase().includes(xt))),Ln=E=>ga===E?{"data-locate-id":E,"data-focus":""}:{"data-locate-id":E};(0,ee.useEffect)(()=>{if(ga===void 0)return;let E=requestAnimationFrame(()=>{document.querySelector(`[data-locate-id="${ga}"]`)?.scrollIntoView({block:"center"})});return()=>cancelAnimationFrame(E)},[ga,Xt,Gn]);let jt=nl()?j==="granted"?"已授权，任务完成时提醒":j==="denied"?"权限被拒绝，请在浏览器设置中开启":"点击授权，任务完成时提醒":"当前浏览器不支持通知",Wi=d==="dark"?"深色":d==="light"?"浅色":"跟随系统",zp=async()=>{if(!nl()){Y("当前浏览器不支持通知");return}if(j==="granted"){Kd(),Y("通知已开启");return}if(j==="denied"){Y("通知权限被拒绝，请在浏览器设置中开启");return}Ce(!0);try{let E=await e2();Z(E),E==="granted"&&(Kd(),Y("通知已开启"))}finally{Ce(!1)}},er=async()=>{let E=Fn.trim()+fa.trim()+yn.trim()+In.trim()+Rt.trim()+fn.trim(),te=de?.channels,pn=te!==void 0&&(te.serverchan.configured||te.bark.configured||te.telegram.configured||te.wxpusher.configured||te.pushplus.configured);if(E===""&&pn){Xn(!0);return}await vc()},vc=async()=>{Ce(!0);try{await _d({channels:{serverchan:{sendKey:Fn.trim()},bark:{key:fa.trim()},telegram:{botToken:yn.trim(),chatId:In.trim()},wxpusher:{spt:Rt.trim()},pushplus:{token:fn.trim()}}});let E=await Od();Ee(E),Y("渠道已保存")}catch(E){Y(he(E))}finally{Ce(!1)}},ul=async()=>{Ce(!0);try{await Ok(),Y("测试通知已发送")}catch(E){Y(he(E))}finally{Ce(!1)}},Hp=async E=>{Ce(!0);try{if(E){if(!await n2()){Y("当前浏览器不支持 Web Push，或通知权限未开启");return}Y("Web Push 已开启")}else await a2(),Y("Web Push 已关闭");wn(E)}catch(te){E?Y("Web Push 注册失败：推送服务（FCM）在大陆网络不可直连。请开启代理后重试，或改用下方「推送渠道」接收通知（如 ServerChan 微信推送）。"):Y(he(te))}finally{Ce(!1)}},tr=async E=>{Ce(!0);try{await _d({hideDetails:E}),Sn(E),Y(E?"通知详情已隐藏":"通知详情已显示")}catch(te){Y(he(te))}finally{Ce(!1)}},fl=async(E,te)=>{Ce(!0);let pn={...an,[E]:te};try{await _d({kinds:pn}),Xr(pn)}catch(pl){Y(he(pl))}finally{Ce(!1)}},Go=async()=>{Ja(!0);try{let{latest:E,isNewer:te}=await Lk();ne(te?`发现新版本 ${E} —— 可在桌面端 dsh 升级插件`:`已是最新版本（${Op.version}）`)}catch{ne("检查失败，请稍后重试")}finally{Ja(!1)}},Fo=async()=>{ce(!0);try{J(await Hk())}catch{J(void 0)}finally{ce(!1)}},yc=async()=>{let E=Number(Se),te=Number(Et);if(!Number.isFinite(E)||E<0||!Number.isFinite(te)||te<0){Y("请输入有效的数值");return}Ce(!0);try{await _d({turnThresholdMs:Math.round(E*1e3),turnCooldownMs:Math.round(te*6e4)}),Ee(pn=>pn===void 0?pn:{...pn,turnThresholdMs:Math.round(E*1e3),turnCooldownMs:Math.round(te*6e4)}),Y("已保存")}catch(pn){Y(he(pn))}finally{Ce(!1)}};if(s)return(0,u.jsx)(p4,{onBack:()=>{l(!1)}});if(Gn)return(0,u.jsxs)("div",{className:"mobile",children:[(0,u.jsxs)("header",{className:"mobile-header",children:[(0,u.jsx)("div",{className:"mobile-headerSlot",children:(0,u.jsx)("button",{type:"button",className:"mobile-back","aria-label":"返回",onClick:()=>{Nt(!1)},children:"‹"})}),(0,u.jsx)("h1",{className:"mobile-title",children:"语音服务"}),(0,u.jsx)("div",{className:"mobile-headerSlot mobile-headerSlot-right"})]}),(0,u.jsxs)("div",{className:"mobile-scroll",children:[(0,u.jsx)("p",{className:"settings-note",children:"语音转写按列表顺序尝试，失败自动回退到下一个服务。"}),Ie.length>0&&(0,u.jsxs)("p",{className:"settings-hostNote",children:["✓ 桌面端已配置 ",Ie.length," 个转写服务，手机语音输入将自动使用，无需重复配置。"]}),Ie.length>0&&(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)("div",{className:"settings-subhead",children:"桌面端配置（只读）"}),(0,u.jsx)("div",{className:"settings-card",children:Ie.map(E=>(0,u.jsx)("div",{className:"voice-service-row",children:(0,u.jsxs)("span",{className:"voice-service-copy",children:[(0,u.jsxs)("span",{className:"voice-service-name",children:[E.name," ",(0,u.jsx)("span",{className:"settings-roTag",children:"桌面端"})]}),(0,u.jsxs)("span",{className:"voice-service-desc",children:[E.model," · ",E.baseURL]})]})},E.name))})]}),(0,u.jsx)("div",{className:"settings-subhead",children:"手机端服务"}),(0,u.jsxs)("div",{className:"settings-card",...Ln("voice-list"),children:[T.length===0&&(0,u.jsx)("p",{className:"settings-note",children:"尚未配置服务 — 点击下方「添加服务」。"}),T.map((E,te)=>(0,u.jsxs)("div",{className:"voice-service-row",children:[(0,u.jsxs)("span",{className:"voice-service-copy",children:[(0,u.jsx)("span",{className:"voice-service-name",children:E.name!==""?E.name:E.model}),(0,u.jsxs)("span",{className:"voice-service-desc",children:[E.model," · ",E.baseURL]})]}),(0,u.jsxs)("span",{className:"voice-service-actions",children:[(0,u.jsx)("button",{type:"button",className:"voice-service-btn","aria-label":"上移",disabled:te===0,onClick:()=>{tT(E.id)},children:(0,u.jsx)(Zd,{})}),(0,u.jsx)("button",{type:"button",className:"voice-service-btn voice-service-btn-down","aria-label":"下移",disabled:te===T.length-1,onClick:()=>{nT(E.id)},children:(0,u.jsx)(Zd,{})}),(0,u.jsx)("button",{type:"button",className:"voice-service-btn","aria-label":"编辑",onClick:()=>{at(E),je(E.name),Qt(E.baseURL),_t(E.apiKey),Vt(E.model),X("form")},children:(0,u.jsx)(Jd,{})}),(0,u.jsx)("button",{type:"button",className:"voice-service-btn voice-service-btn-danger","aria-label":"删除",onClick:()=>{eT(E.id)},children:(0,u.jsx)(ap,{})})]})]},E.id))]}),(0,u.jsx)("div",{className:"sheet-confirm-actions",...Ln("voice-add"),children:(0,u.jsxs)("button",{type:"button",className:"mobile-button",onClick:()=>{at(void 0),je(""),Qt(""),_t(""),Vt(""),X("form")},children:[(0,u.jsx)(ll,{})," 添加服务"]})})]}),$==="form"&&(0,u.jsx)(ht,{title:Le===void 0?"添加服务":"编辑服务",onClose:()=>{X(null)},children:(0,u.jsxs)("div",{className:"voice-form",children:[(0,u.jsxs)("label",{className:"voice-form-field",children:[(0,u.jsx)("span",{className:"voice-form-label",children:"名称"}),(0,u.jsx)("input",{className:"voice-form-input",value:Te,placeholder:"如：硅基流动",onChange:E=>{je(E.target.value)}})]}),(0,u.jsxs)("label",{className:"voice-form-field",children:[(0,u.jsx)("span",{className:"voice-form-label",children:"API 地址（baseURL）"}),(0,u.jsx)("input",{className:"voice-form-input",value:Je,placeholder:"https://api.siliconflow.cn/v1",inputMode:"url",autoCapitalize:"none",autoCorrect:"off",spellCheck:!1,onChange:E=>{Qt(E.target.value)}})]}),(0,u.jsxs)("label",{className:"voice-form-field",children:[(0,u.jsx)("span",{className:"voice-form-label",children:"API Key"}),(0,u.jsx)("input",{className:"voice-form-input",value:xe,placeholder:"sk-…",type:"password",autoCapitalize:"none",autoCorrect:"off",spellCheck:!1,onChange:E=>{_t(E.target.value)}})]}),(0,u.jsxs)("label",{className:"voice-form-field",children:[(0,u.jsx)("span",{className:"voice-form-label",children:"模型"}),(0,u.jsx)("input",{className:"voice-form-input",value:$e,placeholder:"FunAudioLLM/SenseVoiceSmall",autoCapitalize:"none",autoCorrect:"off",spellCheck:!1,onChange:E=>{Vt(E.target.value)}})]}),(0,u.jsx)("p",{className:"sheet-note",children:"支持任意 OpenAI 兼容的 /audio/transcriptions 服务。"}),(0,u.jsxs)("div",{className:"sheet-confirm-actions",children:[(0,u.jsx)("button",{type:"button",className:"mobile-button",onClick:()=>{X(null)},children:"取消"}),(0,u.jsx)("button",{type:"button",className:"mobile-button mobile-button-primary",disabled:Je.trim()===""||xe.trim()===""||$e.trim()==="",onClick:()=>{WN({id:Le?.id??(typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():`svc-${Date.now()}`),name:Te.trim(),baseURL:Je.trim(),apiKey:xe.trim(),model:$e.trim()}),X(null)},children:"保存"})]})]})})]});if(Xt)return(0,u.jsxs)("div",{className:"mobile",children:[(0,u.jsxs)("header",{className:"mobile-header",children:[(0,u.jsx)("div",{className:"mobile-headerSlot",children:(0,u.jsx)("button",{type:"button",className:"mobile-back","aria-label":"返回",onClick:()=>{St(!1)},children:"‹"})}),(0,u.jsx)("h1",{className:"mobile-title",children:"通知"}),(0,u.jsx)("div",{className:"mobile-headerSlot mobile-headerSlot-right"})]}),(0,u.jsxs)("div",{className:"mobile-scroll",children:[(0,u.jsxs)("div",{className:"settings-card",children:[(0,u.jsx)("div",{className:"settings-cardHead",children:(0,u.jsx)("span",{className:"settings-cardTitle",children:"该开哪个？"})}),(0,u.jsx)("p",{className:"settings-note",children:"任务完成提醒有三条通道，从上到下生效范围越来越广："}),(0,u.jsx)("div",{className:"settings-field",children:(0,u.jsxs)("p",{className:"settings-fieldDesc",children:[(0,u.jsx)("b",{children:"① 浏览器通知"}),"：页面打开时弹提醒。必开，无需配置。",(0,u.jsx)("br",{}),(0,u.jsx)("b",{children:"② 推送渠道"}),"：页面关闭也能收，微信/iOS 直达、国内可靠。推荐任填一个（WxPusher 或 Server酱）。",(0,u.jsx)("br",{}),(0,u.jsx)("b",{children:"③ Web Push"}),"：系统级推送，但服务（FCM）在大陆不可直连，需代理才可用。大陆用户可不开。"]})})]}),(0,u.jsxs)("div",{className:"settings-card",children:[(0,u.jsx)("div",{className:"settings-cardHead",children:(0,u.jsx)("span",{className:"settings-cardTitle",children:"最近通知"})}),Pa?(0,u.jsx)("p",{className:"settings-note",children:"加载中…"}):Yn.length===0?(0,u.jsx)("p",{className:"settings-note",children:"暂无通知——任务完成或长回复结束时，这里会留下记录可回看。"}):(0,u.jsx)("div",{className:"settings-inbox",children:Yn.slice(0,20).map(E=>(0,u.jsxs)("button",{type:"button",className:"settings-inboxRow",disabled:E.workspaceId===void 0,onClick:()=>{let te=new URL(window.location.href);te.searchParams.set("workspace",E.workspaceId??""),te.searchParams.set("session",E.sessionId),window.location.href=`${te.pathname}${te.search}`},children:[(0,u.jsxs)("span",{className:"settings-inboxLine",children:[(0,u.jsx)("span",{className:`settings-inboxKind settings-inboxKind-${E.kind}`,children:E.kind==="task-done"?"完成":E.kind==="task-failed"?"失败":E.kind==="todo-done"?"规划":"回复"}),(0,u.jsx)("span",{className:"settings-inboxTitle",children:E.title}),(0,u.jsx)("span",{className:"settings-inboxTime",children:y4(E.ts)})]}),(0,u.jsx)("span",{className:"card-desc",children:E.body})]},E.id))})]}),(0,u.jsxs)("div",{className:"settings-card",...Ln("notify-browser"),children:[(0,u.jsxs)("div",{className:"settings-cardHead",children:[(0,u.jsx)("span",{className:"settings-cardTitle",children:"浏览器通知"}),(0,u.jsx)(Da,{scope:"sync"})]}),(0,u.jsxs)("div",{className:"settings-field",children:[(0,u.jsx)("div",{className:"settings-fieldHead",children:(0,u.jsx)("span",{className:"settings-fieldLabel",children:"启用"})}),(0,u.jsx)("button",{type:"button",role:"switch","aria-label":"浏览器通知","aria-checked":j==="granted",className:`settings-switch${j==="granted"?" settings-switch-on":""}`,disabled:Re,onClick:()=>{zp()}}),(0,u.jsx)("p",{className:"settings-fieldDesc",children:jt})]})]}),de!==void 0&&(0,u.jsxs)("div",{className:"settings-card",...Ln("notify-kinds"),children:[(0,u.jsxs)("div",{className:"settings-cardHead",children:[(0,u.jsx)("span",{className:"settings-cardTitle",children:"通知内容"}),(0,u.jsx)(Da,{scope:"sync"})]}),(0,u.jsxs)("div",{className:"settings-field",children:[(0,u.jsx)("div",{className:"settings-fieldHead",children:(0,u.jsx)("span",{className:"settings-fieldLabel",children:"规划完成"})}),(0,u.jsx)("button",{type:"button",role:"switch","aria-label":"规划完成","aria-checked":an.todo,className:`settings-switch${an.todo?" settings-switch-on":""}`,disabled:Re,onClick:()=>{fl("todo",!an.todo)}}),(0,u.jsx)("p",{className:"settings-fieldDesc",children:"任务规划全部完成时通知（推荐开启）"})]}),(0,u.jsxs)("div",{className:"settings-field",children:[(0,u.jsx)("div",{className:"settings-fieldHead",children:(0,u.jsx)("span",{className:"settings-fieldLabel",children:"后台任务"})}),(0,u.jsx)("button",{type:"button",role:"switch","aria-label":"后台任务","aria-checked":an.jobs,className:`settings-switch${an.jobs?" settings-switch-on":""}`,disabled:Re,onClick:()=>{fl("jobs",!an.jobs)}}),(0,u.jsx)("p",{className:"settings-fieldDesc",children:"每个命令 / 子任务完成或失败都会提醒，容易打扰（默认关闭）"})]}),(0,u.jsxs)("div",{className:"settings-field",children:[(0,u.jsx)("div",{className:"settings-fieldHead",children:(0,u.jsx)("span",{className:"settings-fieldLabel",children:"长回复"})}),(0,u.jsx)("button",{type:"button",role:"switch","aria-label":"长回复","aria-checked":an.turns,className:`settings-switch${an.turns?" settings-switch-on":""}`,disabled:Re,onClick:()=>{fl("turns",!an.turns)}}),(0,u.jsx)("p",{className:"settings-fieldDesc",children:"超过时长阈值的回复完成时提醒（默认关闭）"})]})]}),(0,u.jsxs)("div",{className:"settings-card",...Ln("notify-wxpusher"),children:[(0,u.jsxs)("div",{className:"settings-cardHead",children:[(0,u.jsx)("span",{className:"settings-cardTitle",children:"推送渠道"}),(0,u.jsx)(Da,{scope:"sync"})]}),(0,u.jsx)("p",{className:"settings-note",children:"页面关闭时也能收到，通过第三方应用直达（微信 / iOS / Telegram）。国内网络可用，任选其一即可；留空保存将清除该渠道。"}),(0,u.jsxs)("div",{className:"settings-field",children:[(0,u.jsxs)("div",{className:"settings-fieldHead",children:[(0,u.jsx)("span",{className:"settings-fieldLabel",children:"WxPusher SPT"}),(0,u.jsx)(Da,{scope:"recommend"})]}),(0,u.jsx)("input",{type:"text",className:"settings-input",value:Rt,placeholder:"SPT_…",autoCapitalize:"none",autoCorrect:"off",spellCheck:!1,onChange:E=>{nn(E.target.value)}}),(0,u.jsxs)("p",{className:"settings-fieldDesc",children:["微信直达 · 免费 · 国内直连。推荐首选。 ",(0,u.jsx)(hc,{configured:de?.channels.wxpusher.configured===!0})]}),(0,u.jsxs)("details",{className:"settings-details",children:[(0,u.jsx)("summary",{children:"如何获取 SPT（2 步）"}),(0,u.jsxs)("div",{className:"settings-detailsBody",children:["1. 打开 wxpusher.zjiecode.com/docs 的「极简推送 SPT」一节，手机微信扫码",(0,u.jsx)("br",{}),"2. 复制 SPT_ 开头的令牌，粘贴到上方并保存"]})]})]}),(0,u.jsxs)("div",{className:"settings-field",...Ln("notify-serverchan"),children:[(0,u.jsx)("div",{className:"settings-fieldHead",children:(0,u.jsx)("span",{className:"settings-fieldLabel",children:"Server酱 SendKey"})}),(0,u.jsx)("input",{type:"text",className:"settings-input",value:Fn,placeholder:"SCT…",autoCapitalize:"none",autoCorrect:"off",spellCheck:!1,onChange:E=>{vt(E.target.value)}}),(0,u.jsxs)("p",{className:"settings-fieldDesc",children:["微信直达 · 国内直连（免费版每日条数有限）。 ",(0,u.jsx)(hc,{configured:de?.channels.serverchan.configured===!0})]})]}),(0,u.jsxs)("div",{className:"settings-field",...Ln("notify-bark"),children:[(0,u.jsx)("div",{className:"settings-fieldHead",children:(0,u.jsx)("span",{className:"settings-fieldLabel",children:"Bark Key"})}),(0,u.jsx)("input",{type:"text",className:"settings-input",value:fa,placeholder:"…",autoCapitalize:"none",autoCorrect:"off",spellCheck:!1,onChange:E=>{Kn(E.target.value)}}),(0,u.jsxs)("p",{className:"settings-fieldDesc",children:["iOS 直达：iPhone / iPad 装 Bark 应用后获取 Key。 ",(0,u.jsx)(hc,{configured:de?.channels.bark.configured===!0})]})]}),(0,u.jsxs)("div",{className:"settings-field",...Ln("notify-tg"),children:[(0,u.jsx)("div",{className:"settings-fieldHead",children:(0,u.jsx)("span",{className:"settings-fieldLabel",children:"Telegram Bot Token"})}),(0,u.jsx)("input",{type:"text",className:"settings-input",value:yn,placeholder:"123456:ABC…",autoCapitalize:"none",autoCorrect:"off",spellCheck:!1,onChange:E=>{yt(E.target.value)}})]}),(0,u.jsxs)("div",{className:"settings-field",children:[(0,u.jsx)("div",{className:"settings-fieldHead",children:(0,u.jsx)("span",{className:"settings-fieldLabel",children:"Telegram Chat ID"})}),(0,u.jsx)("input",{type:"text",className:"settings-input",value:In,placeholder:"…",autoCapitalize:"none",autoCorrect:"off",spellCheck:!1,onChange:E=>{pa(E.target.value)}}),(0,u.jsxs)("p",{className:"settings-fieldDesc",children:["Telegram 需要能访问境外网络。 ",(0,u.jsx)(hc,{configured:de?.channels.telegram.configured===!0})]})]}),(0,u.jsxs)("div",{className:"settings-field",...Ln("notify-pushplus"),children:[(0,u.jsx)("div",{className:"settings-fieldHead",children:(0,u.jsx)("span",{className:"settings-fieldLabel",children:"PushPlus Token（已降级）"})}),(0,u.jsx)("input",{type:"text",className:"settings-input",value:fn,placeholder:"…（到 pushplus.plus 复制）",autoCapitalize:"none",autoCorrect:"off",spellCheck:!1,onChange:E=>{ma(E.target.value)}}),(0,u.jsxs)("p",{className:"settings-fieldDesc",children:["微信直达 · 国内直连。pushplus 现已要求付费认证，故降级为兼容保留（旧 Token 仍可发）；新配置请用上方 WxPusher。 ",(0,u.jsx)(hc,{configured:de?.channels.pushplus.configured===!0})]})]}),(0,u.jsxs)("div",{className:"sheet-confirm-actions",children:[(0,u.jsx)("button",{type:"button",className:"mobile-button",disabled:Re,onClick:()=>{ul()},children:"发送测试"}),(0,u.jsx)("button",{type:"button",className:"mobile-button mobile-button-primary","aria-label":"保存推送渠道",disabled:Re,onClick:()=>{er()},children:"保存"})]})]}),Fd()&&(0,u.jsxs)("div",{className:"settings-card",...Ln("notify-webpush"),children:[(0,u.jsxs)("div",{className:"settings-cardHead",children:[(0,u.jsx)("span",{className:"settings-cardTitle",children:"Web Push"}),(0,u.jsx)(Da,{scope:"sync"})]}),(0,u.jsxs)("div",{className:"settings-field",children:[(0,u.jsx)("div",{className:"settings-fieldHead",children:(0,u.jsx)("span",{className:"settings-fieldLabel",children:"启用"})}),(0,u.jsx)("button",{type:"button",role:"switch","aria-label":"Web Push","aria-checked":xn===!0,className:`settings-switch${xn===!0?" settings-switch-on":""}`,disabled:Re,onClick:()=>{Hp(xn!==!0)}}),(0,u.jsx)("p",{className:"settings-fieldDesc",children:"页面关闭时由浏览器系统推送。推送服务（FCM）在大陆网络不可直连，开启需要代理；大陆用户建议用上方「推送渠道」代替。"})]})]}),de!==void 0&&(0,u.jsxs)("div",{className:"settings-card",...Ln("notify-triggers"),children:[(0,u.jsxs)("div",{className:"settings-cardHead",children:[(0,u.jsx)("span",{className:"settings-cardTitle",children:"触发条件（可选）"}),(0,u.jsx)(Da,{scope:"sync"})]}),(0,u.jsx)("p",{className:"settings-note",children:"默认：仅当回复耗时超过阈值时才提醒，避免被打断。"}),(0,u.jsxs)("div",{className:"settings-field",children:[(0,u.jsx)("div",{className:"settings-fieldHead",children:(0,u.jsx)("span",{className:"settings-fieldLabel",children:"回复时长阈值（秒）"})}),(0,u.jsx)("input",{type:"number",className:"settings-input","aria-label":"回复时长阈值",value:Se,onChange:E=>{Tt(E.target.value)}}),(0,u.jsx)("p",{className:"settings-fieldDesc",children:"超过此时长的回复完成时通知"})]}),(0,u.jsxs)("div",{className:"settings-field",children:[(0,u.jsx)("div",{className:"settings-fieldHead",children:(0,u.jsx)("span",{className:"settings-fieldLabel",children:"通知间隔（分钟）"})}),(0,u.jsx)("input",{type:"number",className:"settings-input","aria-label":"通知间隔",value:Et,onChange:E=>{Bt(E.target.value)}}),(0,u.jsx)("p",{className:"settings-fieldDesc",children:"同一会话两次通知的最小间隔"})]}),(0,u.jsx)("div",{className:"sheet-confirm-actions",children:(0,u.jsx)("button",{type:"button",className:"mobile-button mobile-button-primary","aria-label":"保存触发条件",disabled:Re,onClick:()=>{yc()},children:"保存"})})]}),de!==void 0&&(0,u.jsxs)("div",{className:"settings-card",...Ln("notify-privacy"),children:[(0,u.jsxs)("div",{className:"settings-cardHead",children:[(0,u.jsx)("span",{className:"settings-cardTitle",children:"隐私"}),(0,u.jsx)(Da,{scope:"sync"})]}),(0,u.jsxs)("div",{className:"settings-field",children:[(0,u.jsx)("div",{className:"settings-fieldHead",children:(0,u.jsx)("span",{className:"settings-fieldLabel",children:"锁屏隐藏通知详情"})}),(0,u.jsx)("button",{type:"button",role:"switch","aria-label":"锁屏隐藏通知详情","aria-checked":Ji,className:`settings-switch${Ji?" settings-switch-on":""}`,disabled:Re,onClick:()=>{tr(!Ji)}}),(0,u.jsx)("p",{className:"settings-fieldDesc",children:"通知不显示会话标题与任务名，避免锁屏时被旁人看到内容"})]})]})]}),$i&&(0,u.jsx)(ki,{title:"清除已配置的推送渠道？",body:"输入框均为空，保存将清除电脑端已保存的通道凭据（Server酱 / Bark / Telegram / WxPusher / PushPlus），之后这些渠道将收不到通知。如果要保留，请取消后不要点保存。",confirmLabel:"清除",tone:"danger",onCancel:()=>{Xn(!1)},onConfirm:()=>{Xn(!1),vc()}})]});if(ut)return(0,u.jsx)($R,{onBack:()=>{bt(!1)}});let $r=r!==void 0?b4.find(E=>E.id===r):void 0,Wr=$r!==void 0&&t!==void 0?$r.namespaces.map(E=>t.find(te=>te.ns===E)).filter(E=>E!==void 0):void 0;if(Wr!==void 0&&Wr.length>0)return(0,u.jsx)(h4,{namespaces:Wr,allNamespaces:t??[],onBack:()=>{o(void 0)},onOpenMarket:Wr.some(E=>E.ns==="dsh-market")?()=>{l(!0)}:void 0});let Ko=()=>{Nt(!0),Kk().then(E=>{qe(E),E.length>0&&aT(E)},()=>{})},xc=E=>{E.open==="notify"?St(!0):Ko(),It(E.id)},wc=async()=>{Zt(!0);try{qa(await ub(!0))}catch(E){Y(he(E))}finally{Zt(!1)}};return(0,u.jsxs)("div",{className:"mobile",children:[(0,u.jsxs)("header",{className:"mobile-header",children:[(0,u.jsx)("div",{className:"mobile-headerSlot",children:(0,u.jsx)("button",{type:"button",className:"mobile-back","aria-label":"返回",onClick:e,children:"‹"})}),(0,u.jsx)("h1",{className:"mobile-title",children:"设置"}),(0,u.jsx)("div",{className:"mobile-headerSlot mobile-headerSlot-right"})]}),(0,u.jsxs)("div",{className:"mobile-scroll",children:[a!==void 0&&(0,u.jsx)("p",{className:"mobile-error mobile-pad",role:"alert",children:a}),(0,u.jsx)("div",{className:"settings-search",children:(0,u.jsx)("input",{type:"search",className:"mobile-searchInput",placeholder:"搜索设置…","aria-label":"搜索设置",value:ft,onChange:E=>{Ge(E.target.value)}})}),Jr.length>0&&(0,u.jsxs)("ul",{className:"settings-group",children:[(0,u.jsxs)("li",{className:"settings-groupTitle",children:["配置项 ",(0,u.jsx)("span",{className:"settings-groupDesc",children:"通知 / 语音页内"})]}),Jr.map(E=>(0,u.jsx)("li",{children:(0,u.jsxs)("button",{type:"button",className:"settings-row",onClick:()=>{xc(E)},children:[(0,u.jsx)("span",{className:"card-icon",children:(0,u.jsx)("span",{"aria-hidden":!0,children:(0,u.jsx)(Zb,{})})}),(0,u.jsxs)("span",{className:"card-main",children:[(0,u.jsx)("span",{className:"card-title",children:(0,u.jsx)("span",{className:"card-titleText",children:E.label})}),(0,u.jsxs)("span",{className:"card-desc",children:[E.group," · 点击定位"]})]}),(0,u.jsx)("span",{className:"card-action",children:(0,u.jsx)(La,{})})]})},E.id))]}),(0,u.jsxs)("div",{className:"settings-legend",children:[(0,u.jsx)(Da,{scope:"phone"}),(0,u.jsx)("span",{children:"仅影响本机"}),(0,u.jsx)(Da,{scope:"sync"}),(0,u.jsx)("span",{children:"改动同步到桌面端"}),(0,u.jsx)(Da,{scope:"desktop"}),(0,u.jsx)("span",{children:"请在桌面端修改"})]}),(0,u.jsxs)("ul",{className:"settings-group",children:[(0,u.jsxs)("li",{className:"settings-groupTitle",children:["外观 ",(0,u.jsx)("span",{className:"settings-groupDesc",children:"显示效果"})]}),Pe("主题","theme","深色","浅色","外观")&&(0,u.jsx)(za,{icon:(0,u.jsx)(tN,{}),title:"主题",desc:"深色 / 浅色 / 跟随系统",action:(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)("span",{className:"settings-rowValue",children:Wi}),(0,u.jsx)(La,{})]}),onClick:()=>{N("theme")}}),Pe("字体大小","font")&&(0,u.jsx)(za,{icon:(0,u.jsx)(aN,{}),title:"字体大小",desc:"聊天文本的字号",action:(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)("span",{className:"settings-rowValue",children:jS[f]}),(0,u.jsx)(La,{})]}),onClick:()=>{N("font")}}),Pe("消息密度","density","紧凑","舒适")&&(0,u.jsx)(za,{icon:(0,u.jsx)(iN,{}),title:"消息密度",desc:"消息之间的间距",action:(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)("span",{className:"settings-rowValue",children:FS[g]}),(0,u.jsx)(La,{})]}),onClick:()=>{N("density")}}),Pe("发送模式","发送","排队","插入","steer")&&(0,u.jsx)(za,{icon:(0,u.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,u.jsx)("path",{d:"M6.5 8.5h11"}),(0,u.jsx)("path",{d:"M6.5 12h11"}),(0,u.jsx)("path",{d:"M6.5 15.5h11"})]}),title:"发送模式",desc:"排队 / 直接插入",locateId:"sendmode",action:(0,u.jsxs)("select",{className:"settings-input dm-sendmode-select",defaultValue:typeof window<"u"&&window.__dmSendMode?window.__dmSendMode.get():"queue",onChange:E=>{let te=E&&E.target?E.target.value:"queue";typeof window<"u"&&window.__dmSendMode&&window.__dmSendMode.set(te)},children:[(0,u.jsx)("option",{value:"queue",children:"排队"}),(0,u.jsx)("option",{value:"steer",children:"直接插入"})]})}),Pe("代码块行号","行号","line")&&(0,u.jsx)(Rv,{icon:(0,u.jsx)(rN,{}),title:"代码块行号",desc:"在代码块左侧显示行号",value:w,onChange:E=>{KS(E),x(E)}})]}),(0,u.jsxs)("ul",{className:"settings-group",children:[(0,u.jsxs)("li",{className:"settings-groupTitle",children:["对话 ",(0,u.jsx)("span",{className:"settings-groupDesc",children:"聊天体验"})]}),Pe("自动滚动","scroll")&&(0,u.jsx)(Rv,{icon:(0,u.jsx)(oN,{}),title:"自动滚动",desc:"新消息到达时自动滚动到底部",value:A,onChange:E=>{YS(E),p(E)}}),Pe("震动","vibrate","通知震动")&&(0,u.jsx)(Rv,{icon:(0,u.jsx)(sN,{}),title:"震动",desc:"任务完成、审批到达时轻震一下",value:m,onChange:E=>{XS(E),b(E)}})]}),Pe("用量","余量","配额","余额")&&(0,u.jsxs)("ul",{className:"settings-group",children:[(0,u.jsxs)("li",{className:"settings-groupTitle",children:["用量 ",(0,u.jsx)("span",{className:"settings-groupDesc",children:"套餐与配额"})]}),Ut===void 0&&a===void 0&&(0,u.jsx)("li",{className:"settings-note",children:"加载中…"}),se!==void 0&&se.providers.length>0&&!q&&(0,u.jsx)(za,{icon:(0,u.jsx)(pN,{}),title:"用量",desc:XR(se),action:(0,u.jsx)(La,{}),onClick:()=>{F(!0)}}),se!==void 0&&se.providers.length>0&&q&&(0,u.jsxs)("li",{className:"usage-card",children:[se.providers.map(E=>(0,u.jsx)(JR,{provider:E},E.name)),(0,u.jsxs)("div",{className:"usage-actions",children:[(0,u.jsx)("button",{type:"button",className:"mobile-button",onClick:()=>{F(!1)},children:"收起"}),(0,u.jsx)("button",{type:"button",className:"mobile-button mobile-button-primary",disabled:kn,onClick:()=>{wc()},children:kn?"查询中…":"刷新"})]})]})]}),(0,u.jsxs)("ul",{className:"settings-group",children:[(0,u.jsxs)("li",{className:"settings-groupTitle",children:["通知 ",(0,u.jsx)("span",{className:"settings-groupDesc",children:"任务完成提醒"})]}),Pe("通知","notify","推送","提醒","阈值","间隔")&&(0,u.jsx)(za,{icon:(0,u.jsx)(X2,{}),title:"通知",desc:"浏览器通知 · 推送渠道 · Web Push",action:(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)("span",{className:"settings-rowValue",children:jt}),(0,u.jsx)(La,{})]}),onClick:()=>{St(!0)}})]}),(0,u.jsxs)("ul",{className:"settings-group",children:[(0,u.jsxs)("li",{className:"settings-groupTitle",children:["语音 ",(0,u.jsx)("span",{className:"settings-groupDesc",children:"语音输入与转写"})]}),Pe("语音服务","转写","voice","语音")&&(0,u.jsx)(za,{icon:(0,u.jsx)(rp,{}),title:"语音服务",desc:T.length===0?Ie.length>0?`桌面端已配置 ${Ie.length} 个转写服务`:"语音转写服务，按序回退":`${T.length} 个服务 · 按序回退`,action:(0,u.jsx)(La,{}),onClick:()=>{Ko()}})]}),(0,u.jsxs)("ul",{className:"settings-group",children:[(0,u.jsxs)("li",{className:"settings-groupTitle",children:["设备 ",(0,u.jsx)("span",{className:"settings-groupDesc",children:"已配对设备管理"})]}),(0,u.jsx)(s4,{}),Pe("设备管理","配对","设备","device","pair")&&(0,u.jsx)(za,{icon:(0,u.jsx)($d,{}),title:"设备管理",desc:"查看已配对设备 · 重命名 · 设为主设备 · 移除",action:(0,u.jsx)(La,{}),onClick:()=>{bt(!0)}})]}),(0,u.jsxs)("ul",{className:"settings-group",children:[(0,u.jsxs)("li",{className:"settings-groupTitle",children:["主机配置 ",(0,u.jsx)("span",{className:"settings-groupDesc",children:"模型 · 搜索 · 记忆 · 工具等"})]}),t===void 0&&a===void 0&&(0,u.jsx)("li",{className:"settings-note",children:"加载中…"}),t!==void 0&&b4.map(E=>{let te=E.namespaces.map(zn=>t.find(Yo=>Yo.ns===zn)).filter(zn=>zn!==void 0);if(te.length===0||!Pe(E.title,...te.map(zn=>mc(zn.ns))))return null;let pn=te.some(zn=>Object.keys(zn.value??{}).some(Yo=>Zi(zn.ns,Yo))),pl=te.map(zn=>mc(zn.ns)).join(" · ");return(0,u.jsx)("li",{children:(0,u.jsxs)("button",{type:"button",className:"mobile-row",onClick:()=>{o(E.id)},children:[(0,u.jsx)("span",{className:"card-icon",children:(0,u.jsx)("span",{"aria-hidden":!0,children:(0,u.jsx)(Zb,{})})}),(0,u.jsxs)("span",{className:"card-main",children:[(0,u.jsxs)("span",{className:"card-title",children:[(0,u.jsx)("span",{className:"card-titleText",children:E.title}),pn?(0,u.jsx)(Da,{scope:"sync"}):(0,u.jsx)(Da,{scope:"ro"})]}),(0,u.jsx)("span",{className:"card-desc",children:pl})]}),(0,u.jsx)("span",{className:"card-action",children:(0,u.jsx)(La,{})})]})},E.id)})]}),(0,u.jsxs)("ul",{className:"settings-group",children:[(0,u.jsx)("li",{className:"settings-groupTitle",children:"通用"}),Pe("清除缓存","cache")&&(0,u.jsx)(za,{icon:(0,u.jsx)(ap,{}),title:"清除缓存",desc:"清除离线壳缓存（PWA）",action:(0,u.jsx)(La,{}),onClick:()=>{O(!0)}}),Pe("反馈","意见","建议","feedback","issue","github")&&(0,u.jsx)(za,{icon:(0,u.jsx)(op,{}),title:"反馈与建议",desc:"遇到问题或想要新功能，去 GitHub 告诉我",action:(0,u.jsx)(La,{}),onClick:()=>{window.open("https://github.com/Eternalloveone/dsh-palm/issues/new","_blank","noopener")}}),Pe("关于","about","版本")&&(0,u.jsx)(za,{icon:(0,u.jsx)(lN,{}),title:"关于",desc:`掌上 DSH · 版本 ${Op.version}${Cv===void 0?"":` · 构建 ${Cv}`}`,action:(0,u.jsx)(La,{}),onClick:()=>{N("about")}}),(0,u.jsx)(c4,{})]}),(0,u.jsx)("p",{className:"settings-note",children:"密钥类配置永不显示、不可在手机端修改；带「只读」标记的配置请在桌面端调整。"}),xt!==""&&(0,u.jsx)("div",{className:"mobile-empty",children:(0,u.jsxs)("p",{className:"empty-desc",children:["没有匹配「",ft.trim(),"」的设置项"]})})]}),y==="theme"&&(0,u.jsx)(Av,{title:"主题",value:d,options:[{value:"dark",label:"深色"},{value:"light",label:"浅色"},{value:"system",label:"跟随系统"}],onPick:E=>{Qf(E),Js("ui-theme",[{op:"set",path:["preference"],value:E}]).catch(()=>{})},onClose:()=>{N(null)}}),y==="font"&&(0,u.jsx)(Av,{title:"字体大小",value:f,options:[{value:"small",label:"小"},{value:"standard",label:"标准"},{value:"large",label:"大"}],onPick:E=>{BS(E),v(E),Vr()},onClose:()=>{N(null)}}),y==="density"&&(0,u.jsx)(Av,{title:"消息密度",value:g,options:[{value:"compact",label:"紧凑"},{value:"cozy",label:"舒适"}],onPick:E=>{GS(E),h(E),Vr()},onClose:()=>{N(null)}}),y==="about"&&(0,u.jsxs)(ht,{title:"关于",onClose:()=>{N(null)},children:[(0,u.jsxs)("p",{className:"sheet-confirm-desc",children:["掌上 DSH（dsh-palm）· 版本 ",Op.version,(0,u.jsx)("br",{}),"DSH 移动端界面：扫码配对、工作区、会话与实时对话。"]}),(0,u.jsx)("div",{className:"sheet-confirm-actions",children:(0,u.jsx)("button",{type:"button",className:"mobile-button",disabled:Zr,onClick:()=>{Go()},children:Zr?"检查中…":"检查更新"})}),P!==void 0&&(0,u.jsx)("p",{className:"settings-fieldDesc",role:"status",children:P}),(0,u.jsxs)("div",{className:"settings-field",children:[(0,u.jsx)("span",{className:"settings-fieldLabel",children:"依赖自检"}),(0,u.jsx)("p",{className:"settings-fieldDesc",children:"与宿主接口的连通性。总线事件显示自启动以来收到的帧数——事件被改名或停发时订阅仍会 成功，所以要看常发的那几条（session.control / session/event / agent/assistant-stream） 是否长期为 0；added、removed、error 本就罕见，0 帧属正常。"}),W===void 0?(0,u.jsx)("p",{className:"settings-fieldDesc",children:le?"读取中…":"未读取"}):W.checks.map(E=>(0,u.jsxs)("p",{className:"settings-fieldDesc",children:[E.ok?"✓":"✗"," ",E.name," · ",E.ok?E.kind==="method"?"在位":`${String(E.frames)} 帧${E.lastAt===void 0?"":` · ${KR(E.lastAt,W.now)}`}`:E.reason??"不可用"]},E.name)),(0,u.jsx)("button",{type:"button",className:"mobile-button",disabled:le,onClick:()=>{Fo()},children:le?"读取中…":"刷新自检"})]})]}),D&&(0,u.jsx)(ki,{title:"清除缓存",body:"将删除本机的离线壳缓存（PWA CacheStorage）并重新注册。偏好与配对状态不受影响。",confirmLabel:"清除",tone:"danger",onCancel:()=>{O(!1)},onConfirm:()=>{O(!1),QR()}})]})}var ye=K(Fe(),1);var R=K(re(),1),w4,E4="dsh.palm.pinnedWorkspaces",Ov="dsh.palm.recentWorkspaces",k4="dsh.palm.recentWorkspace",S4="dsh.palm.welcomeSeen",WR=5,e9=3;function t9(){try{let e=localStorage.getItem(E4),t=e===null?[]:JSON.parse(e);return Array.isArray(t)?t.filter(n=>typeof n=="string"):[]}catch{return[]}}function n9(e){try{localStorage.setItem(E4,JSON.stringify(e))}catch{}}function Ip(e){let t=[];for(let n of e)if(!t.includes(n)&&(t.push(n),t.length>=WR))break;return t}function a9(){try{let e=localStorage.getItem(Ov);if(e!==null){let t=JSON.parse(e);if(Array.isArray(t))return Ip(t.filter(n=>typeof n=="string"))}}catch{}try{let e=localStorage.getItem(k4);if(e!==null&&e!==""){let t=Ip([e]);return localStorage.setItem(Ov,JSON.stringify(t)),localStorage.removeItem(k4),t}}catch{}return[]}function C4(e){let t=Ip(e);try{localStorage.setItem(Ov,JSON.stringify(t))}catch{}}function i9(e,t){let n=Ip([t,...e.filter(a=>a!==t)]);return C4(n),n}function r9(e,t){let n=e.filter(a=>a!==t);return C4(n),n}function _p(e,t){return t.slice(0,e9).includes(e.workspaceId)?"active":/\b(test|tests|testing|spec|specs|benchmark|e2e)\b/i.test(e.path.replace(/[\\/]+/g," "))||/\b(test|tests|testing|spec|specs|benchmark|e2e)\b/i.test(e.title)?"test":(e.sessionIds??[]).length===0?"plain":"code"}var N4={active:"活跃项目",code:"代码项目",test:"测试项目",plain:"其他"},o9={active:"ws-icon-active",code:"ws-icon-code",test:"ws-icon-test",plain:"ws-icon-plain"},T4=[{kind:"active",placeholder:null},{kind:"code",placeholder:"暂无代码项目"},{kind:"test",placeholder:"暂无测试项目"},{kind:"plain",placeholder:null}];function s9({onCancel:e,onPick:t}){let[n,a]=(0,ye.useState)(void 0),[i,r]=(0,ye.useState)(void 0),[o,s]=(0,ye.useState)(!1),[l,d]=(0,ye.useState)(void 0),[f,v]=(0,ye.useState)(0);(0,ye.useEffect)(()=>{let h=!1;return r(void 0),a(void 0),Wk(l).then(w=>{h||a(w)},w=>{h||r(he(w))}),()=>{h=!0}},[l,f]);let g=async()=>{if(!(n===void 0||o)){s(!0),r(void 0);try{let h=await eS(n.path);t(h.workspace)}catch(h){s(!1),r(he(h))}}};return(0,R.jsxs)("div",{className:"mobile dir-browser",children:[(0,R.jsxs)("header",{className:"mobile-header",children:[(0,R.jsx)("div",{className:"mobile-headerSlot",children:(0,R.jsx)("button",{type:"button",className:"mobile-headerAction",onClick:e,children:"返回"})}),(0,R.jsx)("h1",{className:"mobile-title",children:"选择目录"}),(0,R.jsx)("div",{className:"mobile-headerSlot mobile-headerSlot-right"})]}),n!==void 0&&(0,R.jsx)("div",{className:"dir-crumbs",children:n.crumbs.map((h,w)=>(0,R.jsxs)("span",{children:[(0,R.jsx)("button",{type:"button",className:"dir-crumb",onClick:()=>d(h.path),children:h.name||"/"}),w<n.crumbs.length-1&&(0,R.jsx)("span",{className:"dir-crumb-separator",children:"/"})]},h.path))}),i!==void 0?(0,R.jsxs)("div",{className:"mobile-empty",children:[(0,R.jsx)("p",{className:"mobile-error",children:i}),(0,R.jsx)("button",{type:"button",className:"mobile-button",onClick:()=>v(h=>h+1),children:"重试"})]}):n===void 0?(0,R.jsx)("div",{className:"mobile-empty",children:(0,R.jsx)("p",{className:"mobile-muted",children:"加载中…"})}):(0,R.jsx)("ul",{className:"mobile-list",children:n.entries.length===0?(0,R.jsx)("div",{className:"mobile-empty dir-empty",children:(0,R.jsx)("p",{className:"mobile-muted",children:"空目录"})}):n.entries.map(h=>(0,R.jsx)("li",{children:(0,R.jsxs)("button",{type:"button",className:`mobile-row dir-entry ${h.hidden?"dir-entry-hidden":""}`,onClick:()=>d(h.path),children:[(0,R.jsx)("span",{className:"mobile-rowMain",children:(0,R.jsx)("span",{className:"mobile-rowTitle",children:h.name})}),(0,R.jsx)("span",{className:"mobile-chevron","aria-hidden":!0,children:"›"})]})},h.path))}),(0,R.jsx)("div",{className:"dir-select",children:(0,R.jsx)("button",{type:"button",className:"mobile-button",disabled:n===void 0||o,onClick:()=>{g()},children:o?"创建中…":"选择此目录"})})]})}function l9({target:e,pinned:t,onClose:n,onPinnedChange:a,onRename:i,onDelete:r}){let{workspace:o}=e,s=[{key:"pin",label:t?"取消固定":"固定到顶部",run:()=>{a()}},{key:"rename",label:"重命名",run:()=>{i(o)}},{key:"delete",label:"删除工作区",danger:!0,run:()=>{r(o)}}];return(0,R.jsx)(ht,{title:o.title,onClose:n,children:(0,R.jsx)("div",{role:"menu","aria-label":`工作区操作：${o.title}`,children:s.map(l=>(0,R.jsx)("button",{type:"button",role:"menuitem",className:"sheet-option",onClick:()=>{n(),l.run()},children:(0,R.jsx)("span",{className:"sheet-option-copy",children:(0,R.jsx)("span",{className:"sheet-option-title",style:l.danger?{color:"var(--danger)"}:void 0,children:l.label})})},l.key))})})}function d9(){return(0,R.jsx)("div",{"aria-hidden":"true",role:"presentation",children:[0,1,2].map(e=>(0,R.jsxs)("div",{className:"skel-row",children:[(0,R.jsx)("div",{className:"skel skel-icon"}),(0,R.jsxs)("div",{className:"skel-lines",children:[(0,R.jsx)("div",{className:"skel skel-line-title"}),(0,R.jsx)("div",{className:"skel skel-line-sub"})]})]},e))})}function M4({initialWorkspaceId:e,onPick:t,onLocateSession:n,onOpenDirect:a,initialSearch:i,onSearchSnapshot:r,onSearchApplied:o,onOpenRunOverview:s,runOverviewLive:l}){let[d,f]=(0,ye.useState)(()=>w4),[v,g]=(0,ye.useState)(void 0),[h,w]=(0,ye.useState)(0),[x,A]=(0,ye.useState)(!1),[p,m]=(0,ye.useState)(!1),[b,y]=(0,ye.useState)(""),N=(0,ye.useRef)(!1);(0,ye.useEffect)(()=>{N.current||i!==void 0&&i.open&&(N.current=!0,m(!0),y(i.term),o?.())},[i,o]),(0,ye.useEffect)(()=>{r?.(p,b)},[p,b,r]);let[D,O]=(0,ye.useState)([]),[T,z]=(0,ye.useState)(!1),[$,X]=(0,ye.useState)(!1),[Le,at]=(0,ye.useState)(!1),[Te,je]=(0,ye.useState)(!1),[Je,Qt]=(0,ye.useState)(!1),[xe,_t]=(0,ye.useState)(()=>t9()),[$e,Vt]=(0,ye.useState)(()=>a9()),[Ie,qe]=(0,ye.useState)(void 0),[Xt,St]=(0,ye.useState)(void 0),[Gn,Nt]=(0,ye.useState)(void 0),[ut,bt]=(0,ye.useState)(!1),j=(0,ye.useRef)(void 0),[Z,de]=(0,ye.useState)(()=>{try{return localStorage.getItem(S4)==="1"}catch{return!1}}),Ee=()=>{de(!0);try{localStorage.setItem(S4,"1")}catch{}};(0,ye.useEffect)(()=>{let q=b.trim();if(q===""){O([]),X(!1),z(!1),at(!1),je(!1);return}z(!0),X(!1),je(!1);let F=!1,se=setTimeout(()=>{_f(q).then(Se=>{F||(O(Se.items),at(Se.hasMore),je(Se.partial===!0),X(!0),z(!1))},()=>{F||(O([]),X(!0),z(!1))})},250);return()=>{F=!0,clearTimeout(se)}},[b]);let Re=(q,F)=>{if(q.kind==="message"&&q.seq!==void 0){Fn(q,q.seq,F,q.messageId,q.partId);return}If(q.sessionId,F).then(se=>{let Se=se.items[0];Fn(q,Se?.seq,F,Se?.messageId,Se?.partId)},()=>{Fn(q,void 0,F)})},Ce=q=>{if(q.workspaceId!==void 0){let se=(d??[]).find(Se=>Se.workspaceId===q.workspaceId);return{workspaceId:q.workspaceId,title:se?.title??q.workspaceTitle}}let F=(d??[]).find(se=>(se.sessionIds??[]).map(String).includes(q.sessionId));return F===void 0?{}:{workspaceId:F.workspaceId,title:F.title}},Fn=(q,F,se,Se,Tt)=>{let Et=Ce(q);if(Et.workspaceId!==void 0&&n!==void 0){let Yn=Se??q.messageId,Qn=Tt??q.partId;n(q.sessionId,Et.workspaceId,F,se,...[Yn,Qn].some(Pa=>Pa!==void 0)?[Yn,Qn]:[]);return}if(Et.workspaceId===void 0){if(a!==void 0){let Yn=Se??q.messageId,Qn=Tt??q.partId;a(q,F,se,...[Yn,Qn].some(Pa=>Pa!==void 0)?[Yn,Qn]:[]);return}Y("未找到该会话所属的工作区");return}let Bt=new URL(window.location.href);Bt.searchParams.set("workspace",Et.workspaceId),Bt.searchParams.set("session",q.sessionId),F!==void 0&&Bt.searchParams.set("seq",String(F)),window.location.href=`${Bt.pathname}${Bt.search}`};(0,ye.useEffect)(()=>{let q=!1;return Rd().then(F=>{if(q)return;let se=e===void 0?void 0:F.find(Se=>Se.workspaceId===e);if(se!==void 0){t(se);return}w4=F,f(F)},F=>{q||g(he(F))}),()=>{q=!0}},[e,t,h]);let vt=(0,ye.useCallback)(q=>{Vt(F=>i9(F,q.workspaceId)),t(q)},[t]),fa=(0,ye.useCallback)(()=>{let q=$e[0],F=q===void 0?void 0:d?.find(se=>se.workspaceId===q);if(F===void 0){Y("还没有访问记录");return}vt(F)},[d,$e,vt]),Kn=(0,ye.useCallback)(()=>{j.current!==void 0&&(clearTimeout(j.current),j.current=void 0)},[]);(0,ye.useEffect)(()=>()=>{Kn()},[Kn]);let yn=(0,ye.useRef)(void 0),yt=q=>({onTouchStart:()=>{Kn(),yn.current=void 0,j.current=window.setTimeout(()=>{j.current=void 0,yn.current=q.workspaceId,qe({workspace:q})},500)},onTouchMove:Kn,onTouchEnd:Kn,onClick:F=>{if(yn.current===q.workspaceId){yn.current=void 0,F.preventDefault();return}vt(q)},onContextMenu:F=>{F.preventDefault(),qe({workspace:q})}}),In=(0,ye.useCallback)(q=>{let F=xe.includes(q.workspaceId),se=F?xe.filter(Se=>Se!==q.workspaceId):[...xe,q.workspaceId];_t(se),n9(se),Y(F?"已取消固定":"已固定")},[xe]),pa=(0,ye.useCallback)(async(q,F)=>{bt(!0);try{let{workspace:se}=await tS(q.workspaceId,F);f(Se=>Se?.map(Tt=>Tt.workspaceId===se.workspaceId?se:Tt)??Se),St(void 0),Y("已重命名")}catch(se){Y(he(se))}finally{bt(!1)}},[]),Rt=(0,ye.useCallback)(async q=>{bt(!0);try{await nS(q.workspaceId),f(F=>F?.filter(se=>se.workspaceId!==q.workspaceId)??F),Vt(F=>r9(F,q.workspaceId)),Nt(void 0),Y("已删除工作区（目录与会话保留）")}catch(F){Y(he(F))}finally{bt(!1)}},[]);if(x)return(0,R.jsx)(s9,{onCancel:()=>A(!1),onPick:vt});let nn=b.trim().toLowerCase(),fn=(d??[]).filter(q=>nn===""||q.title.toLowerCase().includes(nn)).filter(q=>!Je||xe.includes(q.workspaceId)),ma=TN((d??[]).map(q=>q.path)),xn=[...fn].sort((q,F)=>{let se=xe.includes(q.workspaceId)?0:1,Se=xe.includes(F.workspaceId)?0:1;return se-Se}),wn=new Map($e.map((q,F)=>[q,F])),Ut=T4.map(({kind:q})=>({kind:q,rows:q==="active"?xn.filter(F=>_p(F,$e)===q).sort((F,se)=>{let Se=xe.includes(F.workspaceId)?0:1,Tt=xe.includes(se.workspaceId)?0:1;return Se!==Tt?Se-Tt:(wn.get(F.workspaceId)??1/0)-(wn.get(se.workspaceId)??1/0)}):xn.filter(F=>_p(F,$e)===q)})).filter(q=>q.rows.length>0),qa=T4.filter(({kind:q,placeholder:F})=>F!==null&&!xn.some(se=>_p(se,$e)===q)),kn=xe.length,Zt=(()=>{if(v!==void 0)return(0,R.jsxs)("div",{className:"mobile-empty",children:[(0,R.jsx)("div",{className:"empty-icon",children:(0,R.jsx)(np,{})}),(0,R.jsx)("p",{className:"empty-title",children:"加载失败"}),(0,R.jsx)("p",{className:"empty-desc",children:v}),(0,R.jsx)("button",{type:"button",className:"mobile-button",onClick:()=>{g(void 0),f(void 0),w(q=>q+1)},children:"重试"})]});if(d===void 0)return(0,R.jsx)(d9,{});if(fn.length===0){if(Je&&kn===0)return(0,R.jsxs)("div",{className:"mobile-empty",children:[(0,R.jsx)("div",{className:"empty-icon",children:(0,R.jsx)(tp,{})}),(0,R.jsx)("p",{className:"empty-title",children:"还没有固定的工作区"}),(0,R.jsx)("p",{className:"empty-desc",children:"长按工作区卡片即可固定，固定后会置顶显示"})]});if(nn!==""){if(T)return(0,R.jsxs)("div",{className:"mobile-empty",children:[(0,R.jsx)("div",{className:"empty-icon",children:(0,R.jsx)(Yi,{})}),(0,R.jsx)("p",{className:"empty-title",children:"正在搜索全部会话…"})]});if($&&D.length===0)return(0,R.jsxs)("div",{className:"mobile-empty",children:[(0,R.jsx)("div",{className:"empty-icon",children:(0,R.jsx)(Yi,{})}),(0,R.jsx)("p",{className:"empty-title",children:"没有匹配的工作区或会话"}),(0,R.jsxs)("p",{className:"empty-desc",children:["工作区按名称匹配，会话按名称与可见正文匹配",Te&&(0,R.jsx)(R.Fragment,{children:"；更早的会话未在本次扫描范围内"})]})]})}else return(0,R.jsxs)("div",{className:"mobile-empty",children:[(0,R.jsx)("div",{className:"empty-icon",children:(0,R.jsx)($2,{})}),(0,R.jsx)("p",{className:"empty-title",children:"暂无工作区"}),(0,R.jsx)("p",{className:"empty-desc",children:"新建一个工作区，把项目目录挂进来就能开始会话"})]})}return(0,R.jsxs)("ul",{className:"mobile-list",children:[Ut.map(q=>(0,R.jsxs)("li",{style:{listStyle:"none"},children:[(0,R.jsx)("div",{className:"mobile-groupTitle",children:N4[q.kind]}),q.rows.map(F=>{let se=_p(F,$e),Se=xe.includes(F.workspaceId),Tt=(F.sessionIds??[]).length;return(0,R.jsxs)("button",{type:"button",className:`mobile-row${se==="active"?" mobile-row-active":""}`,...yt(F),children:[(0,R.jsx)("span",{className:`ws-icon ${o9[se]}`,children:(0,R.jsx)("span",{"aria-hidden":!0,children:(0,R.jsx)(J2,{})})}),(0,R.jsxs)("span",{className:"card-main",children:[(0,R.jsxs)("span",{className:"card-title",children:[(0,R.jsx)("span",{className:"card-titleText",children:F.title}),Se&&(0,R.jsx)("span",{className:"ws-pin","aria-label":"已固定",children:(0,R.jsx)(tp,{})})]}),(0,R.jsx)("span",{className:"card-subtitle",children:EN(F.path,ma)})]}),(0,R.jsxs)("span",{className:"card-action",children:[Tt>0&&(0,R.jsxs)("span",{className:"card-badge",children:[Tt," 会话"]}),(0,R.jsx)("span",{className:"mobile-chevron","aria-hidden":!0,children:"›"})]})]},F.workspaceId)})]},q.kind)),!Je&&nn===""&&qa.map(({kind:q,placeholder:F})=>(0,R.jsxs)("li",{style:{listStyle:"none"},children:[(0,R.jsx)("div",{className:"mobile-groupTitle",children:N4[q]}),(0,R.jsxs)("div",{className:"mobile-empty-group",children:[(0,R.jsx)("span",{children:F}),(0,R.jsx)("button",{type:"button",className:"mobile-empty-groupBtn",onClick:()=>A(!0),children:"创建"})]})]},`empty-${q}`)),nn!==""&&T&&(0,R.jsx)("li",{style:{listStyle:"none"},children:(0,R.jsx)("p",{className:"mobile-muted mobile-pad",role:"status",children:"正在搜索全部会话…"})}),nn!==""&&!T&&D.length>0&&(0,R.jsxs)("li",{style:{listStyle:"none"},children:[(0,R.jsx)("div",{className:"mobile-groupTitle",children:"会话"}),D.map(q=>{let F=Ce(q),se=(q.title??q.snippet.trim().slice(0,24))||"匹配会话";return(0,R.jsx)("li",{style:{listStyle:"none"},children:(0,R.jsxs)("button",{type:"button",className:"mobile-row",onClick:()=>{Re(q,nn)},children:[(0,R.jsx)("span",{className:"card-icon",children:(0,R.jsx)("span",{className:"sess-check","aria-hidden":!0,children:(0,R.jsx)(Oa,{})})}),(0,R.jsxs)("span",{className:"card-main",children:[(0,R.jsxs)("span",{className:"sess-titleline",children:[(0,R.jsx)("span",{className:"sess-title",children:se}),(0,R.jsx)("span",{className:"sess-sep","aria-hidden":!0,children:"·"}),(0,R.jsx)("span",{className:"sess-time",children:F.title??"未分组"})]}),(0,R.jsx)("span",{className:"card-desc",children:q.snippet})]}),(0,R.jsx)("span",{className:"card-action",children:(0,R.jsx)("span",{className:"mobile-chevron","aria-hidden":!0,children:"›"})})]})},`${q.kind}:${q.sessionId}`)}),Le&&(0,R.jsx)("li",{style:{listStyle:"none"},children:(0,R.jsx)("p",{className:"search-hitsNote mobile-pad",children:"结果较多，仅显示前若干条——请细化关键词"})}),!Le&&Te&&(0,R.jsx)("li",{style:{listStyle:"none"},children:(0,R.jsx)("p",{className:"search-hitsNote mobile-pad",children:"已扫描最近的会话，更早的会话可能未覆盖"})})]}),!Je&&nn===""&&(0,R.jsx)("li",{style:{listStyle:"none"},children:(0,R.jsxs)("button",{type:"button",className:"mobile-createCard",onClick:()=>A(!0),children:[(0,R.jsx)(ll,{}),"新建工作区"]})})]})})();return(0,R.jsxs)("div",{className:"mobile",children:[(0,R.jsxs)("header",{className:"mobile-header",children:[(0,R.jsx)("div",{className:"mobile-headerSlot",children:p?(0,R.jsx)("button",{type:"button",className:"mobile-back","aria-label":"返回",onClick:()=>{m(!1),y("")},children:"‹"}):(0,R.jsx)("div",{className:"mobile-headerSlot"})}),p?(0,R.jsx)("div",{className:"mobile-headerSearch",children:(0,R.jsx)("input",{type:"search",className:"mobile-headerSearchInput",placeholder:"搜索工作区或会话…","aria-label":"搜索工作区和会话",autoFocus:!0,value:b,onChange:q=>{y(q.target.value)}})}):(0,R.jsx)("h1",{className:"mobile-title",children:"工作区"}),(0,R.jsx)("div",{className:"mobile-headerSlot mobile-headerSlot-right",children:p?(0,R.jsx)("button",{type:"button",className:"mobile-iconbtn","aria-label":"取消搜索",onClick:()=>{m(!1),y("")},children:(0,R.jsx)(jr,{})}):(0,R.jsxs)(R.Fragment,{children:[(0,R.jsx)("button",{type:"button",className:"mobile-iconbtn","aria-label":"搜索工作区和会话",onClick:()=>{m(!0)},children:(0,R.jsx)(Yi,{})}),(0,R.jsx)(dl,{})]})})]}),(0,R.jsxs)("div",{className:"mobile-quickbar",role:"toolbar","aria-label":"快捷操作",children:[(0,R.jsxs)("button",{type:"button",className:`mobile-quickchip${Je?" mobile-quickchip-on":""}`,"aria-pressed":Je,onClick:()=>{Qt(q=>!q)},children:[(0,R.jsx)(tp,{}),"固定",kn>0?` ${kn}`:""]}),(0,R.jsxs)("button",{type:"button",className:"mobile-quickchip",onClick:fa,children:[(0,R.jsx)(Z2,{}),"最近访问"]}),s!==void 0&&(0,R.jsxs)("button",{type:"button",className:"mobile-quickchip"+(l!==void 0&&l>0?" mobile-quickchip-live":""),"aria-label":l!==void 0&&l>0?`运行中 ${l} 个会话`:"运行中",onClick:s,children:[(0,R.jsx)("span",{className:l!==void 0&&l>0?"quick-live-dot":"quick-live-dot quick-live-dot-off","aria-hidden":!0}),"运行中",l!==void 0&&l>0&&(0,R.jsx)("span",{className:"quick-live-count",children:l})]})]}),!Z&&(0,R.jsxs)("div",{className:"mobile-welcome",role:"note",children:[(0,R.jsxs)("div",{className:"mobile-welcomeCopy",children:[(0,R.jsx)("p",{className:"mobile-welcomeTitle",children:"配对成功 🎉 三步上手"}),(0,R.jsxs)("p",{className:"mobile-welcomeDesc",children:["① 点一个工作区开始对话",(0,R.jsx)("br",{}),"② 右上角 设置 → 通知：配好任务完成提醒",(0,R.jsx)("br",{}),"③ 设置 → 用量：随时查看余额与配额"]})]}),(0,R.jsx)("button",{type:"button",className:"mobile-welcomeClose",onClick:Ee,children:"知道了"})]}),Zt,Ie!==void 0&&(0,R.jsx)(l9,{target:Ie,pinned:xe.includes(Ie.workspace.workspaceId),onClose:()=>{qe(void 0)},onPinnedChange:()=>{In(Ie.workspace)},onRename:q=>{qe(void 0),St(q)},onDelete:q=>{qe(void 0),Nt(q)}}),Xt!==void 0&&(0,R.jsx)(Vo,{title:"重命名工作区",initial:Xt.title,confirmLabel:"保存",busy:ut,onCancel:()=>{St(void 0)},onConfirm:q=>{pa(Xt,q)}}),Gn!==void 0&&(0,R.jsx)(ki,{title:"删除工作区",body:(0,R.jsxs)(R.Fragment,{children:["确定删除「",Gn.title,"」吗？目录、文件与会话记录都会保留，仅移除这里的工作区入口。"]}),confirmLabel:"删除",tone:"danger",busy:ut,onCancel:()=>{Nt(void 0)},onConfirm:()=>{Rt(Gn)}})]})}var bc=K(Fe(),1);var A4=/^\d{6}$/;function R4(e){let t=e.trim();if(t!==""){if(A4.test(t))return{code:t};try{let n=new URL(t),a=n.searchParams.get("pair");if(a===null||a==="")return;let i=n.searchParams.get("workspace");return{token:a,...i!==null&&i!==""?{workspaceId:i}:{}}}catch{return{token:t}}}}function _v(e){return e===void 0?"/m/":"/m/?workspace="+encodeURIComponent(e)}async function Iv(e,t=fetch){let n=new AbortController,a=setTimeout(()=>{n.abort()},15e3);try{let i=await t("/api/pair/accept",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(A4.test(e)?{code:e}:{token:e}),signal:n.signal});return i.ok?{ok:!0}:i.status===404?{ok:!1,message:"配对链接无效或已过期。"}:i.status===409?{ok:!1,message:"设备数已满：请先在桌面端「设备管理」移除一个设备后重试。"}:{ok:!1,message:"此设备无法使用该配对链接。"}}catch{return{ok:!1,message:"无法连接到配对服务。"}}finally{clearTimeout(a)}}async function O4(e,t=fetch){let n;try{n=new URL(e)}catch{return{kind:"none"}}let a=n.searchParams.get("pair"),i=n.searchParams.get("code");if((a===null||a==="")&&(i===null||i===""))return{kind:"none"};let r=n.searchParams.get("workspace"),o=_v(r===null||r===""?void 0:r),l=await Iv(i!==null&&i!==""?i:a??"",t);return l.ok?{kind:"accepted",path:o}:{kind:"failed",path:o,message:l.message}}var Ha=K(re(),1);function _4(e){try{return new URL(e).origin}catch{return}}function I4({initialError:e,onPaired:t,navigate:n}){let[a,i]=(0,bc.useState)(window.location.origin),[r,o]=(0,bc.useState)(""),[s,l]=(0,bc.useState)(e),[d,f]=(0,bc.useState)(!1),v=n??(h=>{window.location.href=h}),g=async h=>{h.preventDefault();let w=R4(r);if(w===void 0){l("请输入有效的配对链接或配对码。");return}let x=_4(r.trim());if(x!==void 0&&x!==window.location.origin){v(r.trim());return}let A=_4(a.trim())??window.location.origin;if(A!==window.location.origin){let m=w.code!==void 0?w.code:w.token??"";v(`${A}/m/?${w.code!==void 0?"code":"pair"}=${encodeURIComponent(m)}`);return}f(!0),l(void 0);let p=await Iv(w.code??w.token??"");if(f(!1),!p.ok){l(p.message);return}t(_v(w.workspaceId))};return(0,Ha.jsx)("main",{className:"mobile mobile-pair","aria-labelledby":"mobile-pair-title",children:(0,Ha.jsxs)("form",{className:"mobile-pairCard",onSubmit:h=>{g(h)},children:[(0,Ha.jsx)("h1",{id:"mobile-pair-title",className:"mobile-title",children:"设备配对"}),(0,Ha.jsx)("p",{className:"mobile-muted",children:"粘贴桌面端复制的配对链接，或输入桌面端显示的 6 位配对码。"}),(0,Ha.jsx)("label",{className:"mobile-pairLabel",htmlFor:"mobile-pair-server",children:"服务器地址"}),(0,Ha.jsx)("input",{id:"mobile-pair-server",className:"mobile-pairInput",value:a,onChange:h=>{i(h.target.value)},autoComplete:"off",autoCapitalize:"off",spellCheck:!1,inputMode:"url"}),(0,Ha.jsx)("label",{className:"mobile-pairLabel",htmlFor:"mobile-pair-link",children:"配对链接或配对码"}),(0,Ha.jsx)("input",{id:"mobile-pair-link",className:"mobile-pairInput",value:r,onChange:h=>{o(h.target.value)},autoComplete:"off",autoCapitalize:"off",spellCheck:!1}),s===void 0?null:(0,Ha.jsx)("p",{className:"mobile-error",role:"alert",children:s}),(0,Ha.jsx)("button",{className:"mobile-new mobile-pairSubmit",type:"submit",disabled:d,children:d?"正在配对":"配对"})]})})}var Pt=K(re(),1),Dp={workspaceId:"standalone",path:"",title:"未分组",sessionIds:[],createdAt:"",updatedAt:""};function c9(e){let t=new URLSearchParams(e).get("workspace");return t===null||t===""?void 0:t}function u9(e){let t=new URLSearchParams(e).get("session");return t===null||t===""?void 0:t}function f9(e){let t=new URLSearchParams(e).get("seq");if(t===null||t==="")return;let n=Number(t);return Number.isFinite(n)&&n>=0?n:void 0}function Tv(e){let t=e.projections?.values,n=t?.title,a=typeof n=="string"&&n!==""?n:e.cwd!==void 0?e.cwd.split("/").filter(Boolean).at(-1)??e.cwd:"新会话",i=t?.preview,r=t?.sessionStats,o=typeof r=="object"&&r!==null?r.turns:void 0;return{sessionId:e.sessionId,title:a,...typeof i=="string"&&i!==""?{preview:i}:{},...typeof o=="number"&&o>0?{turns:o}:{},...e.cwd!==void 0?{cwd:e.cwd}:{},updatedAt:e.updatedAt,running:e.running,blank:e.blank}}function wT(e){let t=new Date(e),n=`${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}`,a=new Date;if(t.toDateString()===a.toDateString())return n;let i=new Date(a);return i.setDate(a.getDate()-1),t.toDateString()===i.toDateString()?`昨天 ${n}`:`${String(t.getMonth()+1)}月${String(t.getDate())}日 ${n}`}function t4(e){let t=new Date(e),n=String(t.getMonth()+1).padStart(2,"0"),a=String(t.getDate()).padStart(2,"0"),i=`${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}`,r=t.getFullYear();return r===new Date().getFullYear()?`${n}-${a} ${i}`:`${r}-${n}-${a} ${i}`}var D4={workspaces:0,"run-overview":1,sessions:1,settings:2,chat:2};function p9(){if(typeof navigator>"u")return"device";let e=typeof navigator.userAgent=="string"?navigator.userAgent:"";return/android/i.test(e)?"android":/ipad|iphone|ipod/i.test(e)?"ios":"device"}function m9(e){return e instanceof da&&e.message==="HTTP 403"}function g9(e){return m9(e)?"unpaired":"unavailable"}function L4({initialPairError:e}){let[t,n]=(0,be.useState)("checking");return(0,be.useEffect)(()=>(HS(),LS(),TS(),D2({send:i=>{Pk({kind:i.kind,message:i.message,...i.source===void 0?{}:{source:i.source},...i.frames===void 0?{}:{frames:i.frames},count:i.count,clientAt:i.at},p9())}})),[]),(0,be.useEffect)(()=>{let a=!0;return Of().then(()=>{a&&n("paired")},i=>{a&&n(g9(i))}),()=>{a=!1}},[]),(0,be.useEffect)(()=>{t==="unpaired"&&(Vb(),Bb())},[t]),t==="checking"?(0,Pt.jsxs)("main",{className:"mobile mobile-empty",role:"status",children:[(0,Pt.jsx)("span",{className:"boot-dot","aria-hidden":!0}),(0,Pt.jsx)("p",{className:"mobile-muted",children:"正在连接..."})]}):t==="unpaired"?(0,Pt.jsx)(I4,{initialError:e,onPaired:a=>{Vb(),Bb(),window.location.replace(a)}}):t==="unavailable"?(0,Pt.jsxs)("main",{className:"mobile mobile-empty",children:[(0,Pt.jsx)("p",{className:"mobile-error",role:"alert",children:"无法连接到运行中的 DSH host。"}),(0,Pt.jsx)("button",{className:"mobile-new",type:"button",onClick:()=>{window.location.reload()},children:"重试"})]}):(0,Pt.jsx)(v9,{onUnpaired:()=>n("unpaired")})}var h9=260,b9=3e4;function v9({onUnpaired:e}){let t=Ff(),[n,a]=(0,be.useState)({current:{route:{kind:"workspaces"},forward:!0},leaving:void 0}),i=n.current.route,r=n.current.forward,o=(0,be.useRef)(void 0),[s,l]=(0,be.useState)(()=>c9(window.location.search)),[d,f]=(0,be.useState)(()=>u9(window.location.search)),[v,g]=(0,be.useState)(()=>f9(window.location.search)),h=(0,be.useRef)(v),w=(0,be.useRef)(void 0),x=(0,be.useRef)(void 0),A=(0,be.useRef)(void 0),p=(0,be.useRef)({open:!1,term:""}),m=(0,be.useRef)({open:!1,term:""}),[b,y]=(0,be.useState)(void 0),N=(0,be.useRef)({workspaceId:"",open:!1,term:""}),[D,O]=(0,be.useState)(void 0),T=(0,be.useRef)(!1),[z,$]=(0,be.useState)(0),X=(0,be.useRef)(void 0),Le=(0,be.useRef)(()=>{}),at=(0,be.useRef)(new Set),Te=(0,be.useCallback)(()=>{let j=X.current;if(j===void 0){$(at.current.size);return}let Z=new Set(j.runningSessionsSnapshot());for(let de of j.jobsSnapshot())de.jobs.some(Ee=>Ee.status==="running"||Ee.status==="stopping")&&Z.add(de.sessionId);for(let de of at.current)Z.add(de);$(Z.size)},[]),je=!0,Je=!1;(0,be.useEffect)(()=>()=>{o.current!==void 0&&clearTimeout(o.current)},[]);let Qt=(0,be.useCallback)(()=>{o.current!==void 0&&clearTimeout(o.current),o.current=window.setTimeout(()=>{a(j=>({current:j.current,leaving:void 0}))},h9)},[]),xe=(0,be.useCallback)(j=>{a(Z=>{let de=D4[j.kind]>=D4[Z.current.route.kind];return{current:{route:j,forward:de},leaving:Z.current}}),Qt()},[Qt]);(0,be.useEffect)(()=>{let j=new Bf(void 0,{onUnpaired:e});X.current=j,j.start();let Z=j.onFrame(de=>{if(de.type==="session/jobs"||de.type==="session/subscribed"){Te();return}if(de.type==="session/event"){let Ee=de.event.type;(Ee==="turn/start"||Ee==="turn/end")&&Te()}});return Te(),()=>{Z(),j.stop()}},[e,Te]),(0,be.useEffect)(()=>{if(i.kind!=="workspaces"||!t)return;let j=!1,Z,de=()=>{Vk().then(({sessionIds:Ee})=>{j||(at.current=new Set(Ee),Te())},()=>{})};return de(),Z=setInterval(de,3e4),()=>{j=!0,Z!==void 0&&clearInterval(Z)}},[i.kind,Te,t]),(0,be.useEffect)(()=>(t||Kd(),()=>{i2()}),[t]),(0,be.useEffect)(()=>{X.current?.observe(i.kind==="chat"?i.session.sessionId:void 0)},[i]),(0,be.useEffect)(()=>{let j=i.kind==="chat"?i.session.sessionId:void 0,Z=()=>{cb(j).catch(()=>{})};if(Le.current=Z,!t){cb(void 0).catch(()=>{});return}if(Z(),j===void 0)return;let de=setInterval(Z,b9);return()=>{clearInterval(de)}},[i,t]),(0,be.useEffect)(()=>{let j=()=>{let Z=X.current;if(typeof document>"u"||document.visibilityState!=="visible"){Z?.pause();return}Z?.resync(),Le.current()};return document.addEventListener("visibilitychange",j),()=>{document.removeEventListener("visibilitychange",j)}},[]),(0,be.useEffect)(()=>{let j=!1;return Rf().then(Z=>{if(j)return;let de=(Z.namespaces??[]).find(Re=>Re.ns==="ui-theme")?.value,Ee=typeof de=="object"&&de!==null?de.preference:void 0;(Ee==="light"||Ee==="dark"||Ee==="system")&&Xf(Ee)},()=>{}),()=>{j=!0}},[]);let _t=j=>{let Z=N.current;O(Z.workspaceId===j&&Z.open?{open:!0,term:Z.term}:void 0)},$e=(0,be.useCallback)(()=>{T.current?y({...m.current}):(i.kind==="chat"&&i.workspace.workspaceId!==Dp.workspaceId||i.kind==="settings")&&_t(i.workspace.workspaceId),a(j=>{let Z=j.current.route;return Z.kind==="chat"?T.current?(T.current=!1,{current:{route:{kind:"workspaces"},forward:!1},leaving:j.current}):Z.fromRunOverview===!0?{current:{route:{kind:"run-overview"},forward:!1},leaving:j.current}:Z.workspace.workspaceId===Dp.workspaceId?{current:{route:{kind:"workspaces"},forward:!1},leaving:j.current}:{current:{route:{kind:"sessions",workspace:Z.workspace},forward:!1},leaving:j.current}:Z.kind==="run-overview"?{current:{route:{kind:"workspaces"},forward:!1},leaving:j.current}:Z.kind==="settings"?{current:{route:{kind:"sessions",workspace:Z.workspace},forward:!1},leaving:j.current}:Z.kind==="sessions"?{current:{route:{kind:"workspaces"},forward:!1},leaving:j.current}:j}),Qt()},[i,Qt]),Vt=(0,be.useCallback)((j,Z,de,Ee,Re,Ce)=>{xe({kind:"chat",session:j,workspace:Z,...de!==void 0?{focusSeq:de}:{},...Re!==void 0?{focusMessageId:Re}:{},...Ce!==void 0?{focusPartId:Ce}:{},...Ee!==void 0?{focusQuery:Ee}:{}}),f(void 0),g(void 0),de!==void 0&&(h.current=void 0),Ee!==void 0&&(w.current=void 0),Re!==void 0&&(x.current=void 0),Ce!==void 0&&(A.current=void 0)},[xe]),Ie=(0,be.useCallback)(j=>{if(s!==void 0||d!==void 0){let Z=new URL(window.location.href);Z.searchParams.delete("workspace"),Z.searchParams.delete("session"),Z.searchParams.delete("seq"),window.history.replaceState(null,"",`${Z.pathname}${Z.search}${Z.hash}`),l(void 0)}xe({kind:"sessions",workspace:j})},[s,d,xe]),qe=(0,be.useCallback)((j,Z,de,Ee,Re,Ce)=>{T.current=!0,m.current={...p.current},l(Z),f(j),g(de),h.current=de,w.current=Ee,x.current=Re,A.current=Ce,xe({kind:"workspaces"})},[xe]),Xt=(0,be.useCallback)((j,Z,de,Ee,Re)=>{T.current=!0,m.current={...p.current};let Ce={sessionId:j.sessionId,title:j.title??"匹配会话",...j.snippet!==void 0&&j.snippet!==""?{preview:j.snippet}:{},updatedAt:0,running:!1,blank:!1};xe({kind:"chat",session:Ce,workspace:Dp,...Z!==void 0?{focusSeq:Z}:{},...Ee!==void 0?{focusMessageId:Ee}:{},...Re!==void 0?{focusPartId:Re}:{},...de!==void 0?{focusQuery:de}:{}})},[xe]),St=(0,be.useCallback)(j=>{let Z={sessionId:j.sessionId,title:j.title??"会话",updatedAt:0,running:!1,blank:!1};xe({kind:"chat",session:Z,workspace:Dp,fromRunOverview:!0})},[xe]),Gn=i.kind==="chat"?`chat:${i.session.sessionId}`:i.kind==="sessions"?`sessions:${i.workspace.workspaceId}`:i.kind,Nt=n.leaving!==void 0?n.leaving.route.kind==="chat"?`chat:${n.leaving.route.session.sessionId}`:n.leaving.route.kind==="sessions"?`sessions:${n.leaving.route.workspace.workspaceId}`:n.leaving.route.kind:"",ut=r?"fwd":"back",bt=j=>j.kind==="workspaces"?(0,Pt.jsx)(M4,{initialWorkspaceId:s,initialSearch:b,onPick:Ie,onLocateSession:qe,onOpenDirect:Xt,onOpenRunOverview:()=>{xe({kind:"run-overview"})},runOverviewLive:z,onSearchSnapshot:(Z,de)=>{p.current={open:Z,term:de}},onSearchApplied:()=>{y(void 0)}}):j.kind==="run-overview"?(0,Pt.jsx)(QT,{mux:X.current,onBack:$e,onOpenSession:St}):j.kind==="sessions"?(0,Pt.jsx)(e4,{workspace:j.workspace,mux:X.current,initialSessionId:d,initialSearch:D,onBack:$e,onPick:Z=>{Vt(Z,j.workspace,h.current,w.current,x.current,A.current)},onOpenSettings:()=>{xe({kind:"settings",workspace:j.workspace})},onLocateSession:qe,onPickSeq:(Z,de,Ee,Re,Ce)=>{Vt(Z,j.workspace,de,Ee,Re,Ce)},onSearchSnapshot:(Z,de)=>{N.current={workspaceId:j.workspace.workspaceId,open:Z,term:de}},onSearchApplied:()=>{O(void 0)}}):j.kind==="settings"?(0,Pt.jsx)(x4,{onBack:$e}):(0,Pt.jsx)(GT,{session:j.session,initialFocusSeq:j.focusSeq,initialFocusMessageId:j.focusMessageId,initialFocusPartId:j.focusPartId,initialFocusQuery:j.focusQuery,mux:X.current,onBack:$e,showToolCalls:je,showSystemMessages:Je});return(0,Pt.jsxs)("div",{className:"mobile",children:[(0,Pt.jsxs)("div",{className:"page-stage",children:[n.leaving!==void 0&&(0,Pt.jsx)("div",{className:`page page-exit-${ut}`,"aria-hidden":"true",children:bt(n.leaving.route)},Nt),(0,Pt.jsx)("div",{className:`page page-enter-${ut}`,children:bt(i)},Gn)]}),(0,Pt.jsx)(q2,{})]})}function he(e){return e instanceof Ro?e.error.message:e instanceof da||e instanceof Error?e.message:String(e)}function Xa(e){return/^HTTP 403/.test(e)?"宿主端插件可能仍在运行旧版本：请重启 dsh web 后再试。":void 0}function y9(e,t){let n=e.events.map(o=>({...o.event,...o.view!==void 0?{view:o.view}:{}})),a=new Fi(qr(n)),i=cS(n),r=hS(n);return{rows:a.snapshot(),maxSeq:a.lastSeq,hasMore:e.hasMore,...i===void 0?{}:{todo:i},...t&&r!==void 0?{turnStartAt:r}:{},...e.projections===void 0?{}:{projections:e.projections}}}async function uc(e,t,n){let a=t===void 0,i;try{let r=await Bk(e,t,void 0,n);i={rows:r.rows,maxSeq:r.maxSeq,hasMore:r.hasMore,...r.todo===void 0?{}:{todo:r.todo},...r.projections===void 0?{}:{projections:r.projections},...a&&r.turnStartAt!==void 0?{turnStartAt:r.turnStartAt}:{}}}catch{i=y9(await Gi(e,t,void 0,n),a)}return a&&I2(e,i),i}var q4=K(Fe(),1);var Qr=K(re(),1),Lp=class e extends q4.Component{state={reason:null};static getDerivedStateFromError(t){return{reason:e.readable(t)}}static readable(t){let a=(H4(t)&&t.message!==""?t.message:String(t??"unknown error")).replace(/\s+/g," ").trim();return a.length<=240?a:`${a.slice(0,239)}…`}componentDidCatch(t,n){zd({kind:"error",message:this.state.reason??"unknown error",stack:H4(t)?t.stack:void 0})}retry=()=>{this.setState({reason:null})};reload=()=>{typeof window<"u"&&window.location.reload()};render(){let t=this.state.reason;return t===null?this.props.children:(0,Qr.jsxs)("main",{className:"mobile mobile-empty mobile-errorpage",role:"alert",children:[(0,Qr.jsx)("h1",{className:"errorpage-title",children:"页面出错了"}),(0,Qr.jsx)("p",{className:"errorpage-reason",children:t}),(0,Qr.jsxs)("div",{className:"errorpage-actions",children:[(0,Qr.jsx)("button",{type:"button",className:"mobile-button",onClick:this.retry,children:"重试"}),(0,Qr.jsx)("button",{type:"button",className:"mobile-button-muted",onClick:this.reload,children:"重新加载"})]})]})}};function H4(e){return e instanceof Error}var P4=`/* ── design tokens ───────────────────────────────────────────────────── */

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
`;var x9="/m/service-worker.js";async function V4(e=typeof navigator>"u"?void 0:navigator.serviceWorker){if(e!==void 0)try{await e.register(x9,{scope:"/m/",updateViaCache:"none"})}catch{}}var U4=`<button id="dm-plugins-btn" class="mobile-iconbtn dm-header-btn" type="button" aria-label="插件" title="插件"><svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" aria-hidden="true"><path d="M7.84457 5.06199C11.6605 4.93876 14.7962 6.14848 14.8484 7.76397C14.8875 8.97461 13.1838 10.0696 10.7215 10.5942"/><path d="M5.12742 8.07731C5.00419 4.26138 6.21391 1.12568 7.8294 1.07351C9.04004 1.03441 10.135 2.73808 10.6596 5.20037"/><path d="M8.02457 10.6802C4.20865 10.8034 1.07294 9.5937 1.02077 7.97821C0.981678 6.76758 2.68535 5.67262 5.14763 5.14798"/><path d="M10.7476 7.89535C10.8708 11.7113 9.66109 14.847 8.0456 14.8991C6.83496 14.9382 5.74 13.2346 5.21536 10.7723"/></svg></button><button id="dm-automation-btn" class="mobile-iconbtn dm-header-btn" type="button" aria-label="自动化" title="自动化"><svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" aria-hidden="true"><path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"/><path d="M8 4.31V8.46L11 10.08"/></svg></button>
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
  var CONFIG_ART = {
    'subagent': '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="14.9893" y="15.1877" width="12.2365" height="12.2365" rx="2" fill="url(#dsh_plugin_art_CU_0a)" fill-opacity="0.8"></rect><rect x="8.87109" y="9.0697" width="12.2365" height="12.2365" rx="2" fill="url(#dsh_plugin_art_CU_0b)" fill-opacity="0.8"></rect><defs><linearGradient id="dsh_plugin_art_CU_0a" x1="21.1075" y1="15.1877" x2="21.1075" y2="27.4243" gradientUnits="userSpaceOnUse"><stop stop-color="#45E7A4"></stop><stop offset="1" stop-color="#05909D"></stop></linearGradient><linearGradient id="dsh_plugin_art_CU_0b" x1="14.9894" y1="9.0697" x2="14.9894" y2="21.3063" gradientUnits="userSpaceOnUse"><stop stop-color="#69B9FF"></stop><stop offset="1" stop-color="#324DE2"></stop></linearGradient></defs></svg>',
    'web-search': '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M26.5362 26.9865L22.3813 22.8317" stroke="#658EFF" stroke-width="3"></path><g clip-path="url(#dsh_plugin_art_$U_0ring)"><g transform="matrix(0.0119394 -0.00173904 0.00173904 0.0119394 15.7661 16.2159)"><foreignObject x="-958.94" y="-958.94" width="1917.88" height="1917.88"><div style="background:conic-gradient(from 90deg, rgb(65, 225, 172) 0deg, rgb(101, 142, 255) 62.0619deg, rgb(65, 225, 172) 360deg);height:100%;width:100%"></div></foreignObject></g></g><defs><clipPath id="dsh_plugin_art_$U_0ring"><path d="M21.9717 16.2159H19.9717C19.9717 18.5386 18.0888 20.4215 15.7661 20.4215V22.4215V24.4215C20.2979 24.4215 23.9717 20.7478 23.9717 16.2159H21.9717ZM15.7661 22.4215V20.4215C13.4434 20.4215 11.5605 18.5386 11.5605 16.2159H9.56055H7.56055C7.56055 20.7478 11.2343 24.4215 15.7661 24.4215V22.4215ZM9.56055 16.2159H11.5605C11.5605 13.8933 13.4434 12.0104 15.7661 12.0104V10.0104V8.01038C11.2343 8.01038 7.56055 11.6841 7.56055 16.2159H9.56055ZM15.7661 10.0104V12.0104C18.0888 12.0104 19.9717 13.8933 19.9717 16.2159H21.9717H23.9717C23.9717 11.6841 20.2979 8.01038 15.7661 8.01038V10.0104Z"></path></clipPath></defs></svg>',
    'agent-loop': '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.0486 28.4901C12.0858 28.4901 7.25195 23.6562 7.25195 17.6934C13.2148 17.6934 18.0486 22.5272 18.0486 28.4901Z" fill="#A797FC"></path><path d="M18.0486 6.89667C12.0858 6.89667 7.25195 11.7305 7.25195 17.6934C13.2148 17.6934 18.0486 12.8595 18.0486 6.89667Z" fill="url(#dsh_plugin_art_bU_0a)"></path><path d="M18.0485 28.4901C24.0114 28.4901 28.8452 23.6562 28.8452 17.6934C22.8824 17.6934 18.0485 22.5272 18.0485 28.4901Z" fill="#4561EE"></path><path d="M18.0485 6.89667C24.0114 6.89667 28.8452 11.7305 28.8452 17.6934C22.8824 17.6934 18.0485 12.8595 18.0485 6.89667Z" fill="#658EFF"></path><defs><linearGradient id="dsh_plugin_art_bU_0a" x1="16.7911" y1="16.1655" x2="8.98192" y2="8.74289" gradientUnits="userSpaceOnUse"><stop stop-color="#A23AE7"></stop><stop offset="1" stop-color="#E2E2E2"></stop></linearGradient></defs></svg>',
    'shell': '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 11L16.606 17.606C16.6841 17.6841 16.6841 17.8107 16.606 17.8888L10 24.4948" stroke="#679EFE" stroke-width="3.5"></path><path d="M20.1211 24.4946H26.8685" stroke="#679EFE" stroke-width="3.5"></path></svg>'
  };

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
<\/script>`;var B4=`<script>
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
<\/script>`;var j4=`<script>
(function () {
  'use strict';

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
    PAGE.hidden = false;
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
    PAGE.hidden = true;
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
<\/script>`;var G4=`<button id="dm-cmd-btn" class="dm-tool-btn" type="button" aria-label="命令" title="命令（/）"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.2 4 8.8 20"/></svg></button><script>
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
      var prefix = current === '' || /s$/.test(current) ? '' : ' ';
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
<\/script>`;var w9=[U4,B4,j4,G4],F4=!1;function K4(){if(!(F4||typeof document>"u")){F4=!0;for(let e of w9)k9(e)}}function k9(e){let t=document.createElement("template");t.innerHTML=e;let n=Array.from(t.content.childNodes);for(let a of n){if(a.nodeType===Node.ELEMENT_NODE&&a.tagName==="SCRIPT"){let i=document.createElement("script");i.textContent=a.textContent??"",document.body.appendChild(i);continue}document.body.appendChild(a)}}var Y4=`<script>
(function () {
  var PILL = '.chat-jump-turns';
  var LABEL = '.chat-jump-turns-label';
  var SEP = 'dm-turn-sep';
  var BLOCKED = ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'lostpointercapture'];

  function closest(node, sel) {
    return node && node.closest ? node.closest(sel) : null;
  }

  // ── 1) 中间分隔线：把 "/" 换成一条短横线 ─────────────────────────────
  // 关键：只「搬」不「换」。bundle 渲染 [当前轮, "/", 总轮] 三个文本节点，
  // 这里把每个文本节点 appendChild 进自建的 span —— 文本节点实例始终不变，
  // React 以后改数字（commitTextUpdate: node.nodeValue = …）照旧生效。
  // 如果改写成「删掉原节点、插入新节点」，React 会去更新一个已脱离文档的
  // 节点，数字就再也不变了。
  function decorate(label) {
    if (!label) return false;
    var texts = [];
    for (var i = 0; i < label.childNodes.length; i++) {
      if (label.childNodes[i].nodeType === 3) texts.push(label.childNodes[i]);
    }
    // 已处理过，且 React 没有往 label 下再挂新的裸文本节点：保持原样（幂等）。
    // 若 React 重建了子节点（换会话等），下面会重新包裹一次。
    if (label.querySelector('.' + SEP) && texts.length === 0) return true;
    if (texts.length < 3 && !label.querySelector('.' + SEP)) return false;

    var curSpan = document.createElement('span');
    curSpan.className = 'dm-turn-cur';
    var totalSpan = document.createElement('span');
    totalSpan.className = 'dm-turn-total';
    var sepSpan = document.createElement('span');
    sepSpan.className = SEP;
    sepSpan.setAttribute('aria-hidden', 'true');
    var slashSpan = document.createElement('span');
    slashSpan.className = 'dm-turn-slash'; // theme.css: display:none
    slashSpan.setAttribute('aria-hidden', 'true');

    curSpan.appendChild(texts[0]);
    slashSpan.appendChild(texts[1]);
    totalSpan.appendChild(texts[texts.length - 1]);

    var frag = document.createDocumentFragment();
    frag.appendChild(curSpan);
    frag.appendChild(sepSpan);
    frag.appendChild(totalSpan);
    frag.appendChild(slashSpan);
    while (label.firstChild) label.removeChild(label.firstChild);
    label.appendChild(frag);
    return true;
  }

  function scan() {
    try {
      var labels = document.querySelectorAll(LABEL);
      for (var i = 0; i < labels.length; i++) decorate(labels[i]);
      var pills = document.querySelectorAll(PILL);
      for (var k = 0; k < pills.length; k++) {
        var p = pills[k];
        if (!p.getAttribute('title')) p.setAttribute('title', '点按查看轮次清单');
      }
    } catch (e) {}
  }

  // ── 2) 关掉长按刮擦 ─────────────────────────────────────────────────
  // 只掐事件传播、不 preventDefault：焦点与页面滚动照旧。
  for (var b = 0; b < BLOCKED.length; b++) {
    document.addEventListener(BLOCKED[b], function (event) {
      var pill = closest(event.target, PILL);
      if (!pill) return;
      if (pill.getAttribute('data-dm-bypass') === '1') return; // 放行一轮
      event.stopImmediatePropagation();
    }, true);
  }

  // ── 3) 单击 = 打开轮次清单 ──────────────────────────────────────────
  document.addEventListener('click', function (event) {
    var pill = closest(event.target, PILL);
    if (!pill) return;
    if (pill.getAttribute('data-dm-bypass') === '1') {
      pill.removeAttribute('data-dm-bypass');
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    // 降级：构造不出 MouseEvent 就什么都不做 —— 单击无反应，但刮擦已禁用。
    if (typeof window.MouseEvent !== 'function') return;
    try {
      pill.setAttribute('data-dm-bypass', '1');
      pill.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: 0,
        view: window,
        button: 0,
        buttons: 0
      }));
    } catch (e) {
      try { pill.removeAttribute('data-dm-bypass'); } catch (e2) {}
    }
  }, true);

  // ── 药丸出现 / 换会话重建后重新处理（decorate 幂等，不会重入）────────
  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    window.setTimeout(function () { pending = false; scan(); }, 60);
  }
  try {
    if (window.__dmMutationBus) window.__dmMutationBus.subscribe(schedule);
    else {
      var mo = new MutationObserver(schedule);
      mo.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true
    });
    }
  } catch (e) {}
  if (window.__dmEnsureTick) window.__dmEnsureTick.add(scan, 800, function () { return !!document.querySelector('.chat-jump-turns'); }); else setInterval(scan, 800);
  scan();
})();
<\/script>`;var Q4=`<script>
(function () {
  try {
    if (window.__dmUsageInline) return;
    window.__dmUsageInline = true;
    var lastClick = 0;

    // 折叠态的「用量」行：settings-row 按钮，标题文本里含「用量」。
    function collapsedRow() {
      var rows = document.querySelectorAll('button.settings-row');
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        var t = r.querySelector('.card-titleText');
        if (!t || (t.textContent || '').indexOf('用量') < 0) continue;
        return r;
      }
      return null;
    }

    function ensure() {
      var card = document.querySelector('.usage-card');
      if (card) { autoRefresh(card); return; }              // 已展开：只负责自动同步
      var r = collapsedRow();
      if (!r) return;
      var now = Date.now();
      if (now - lastClick < 900) return;                    // 防抖，避免连点
      lastClick = now;
      try { r.click(); } catch (e) {}
    }

    // 进设置自动同步：点一次「刷新」。用户要求把刷新按钮隐藏，但隐藏的元素
    // 仍能被脚本 .click()，于是既能自动取最新余额，又不占界面。
    var lastRefresh = 0;
    function autoRefresh(card) {
      if (Date.now() - lastRefresh < 5000) return;
      var btns = card.querySelectorAll('.usage-actions > button');
      if (btns.length < 2) return;
      var refresh = btns[btns.length - 1];
      if (refresh.disabled) return;
      lastRefresh = Date.now();
      try { refresh.click(); } catch (e) {}
    }

    try {
      var mo = new MutationObserver(ensure);
      mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
    } catch (e) {}
    setInterval(ensure, 1200);
    ensure();
  } catch (e) {}
})();
<\/script>`;var S9=[Y4,Q4],X4=!1;function Z4(){if(!(X4||typeof document>"u")){X4=!0;for(let e of S9)N9(e)}}function N9(e){let t=document.createElement("template");t.innerHTML=e;let n=Array.from(t.content.childNodes);for(let a of n){if(a.nodeType===Node.ELEMENT_NODE&&a.tagName==="SCRIPT"){let i=document.createElement("script");i.textContent=a.textContent??"",document.body.appendChild(i);continue}document.body.appendChild(a)}}var Dv=K(re(),1);u2();Vr();var Lv=document.createElement("style");Lv.dataset.plugin="dsh-palm/mobile";Lv.textContent=P4;document.head.appendChild(Lv);K4();Z4();var $4=document.getElementById("root");if($4===null)throw new Error("mobile: #root missing");T9($4);async function T9(e){let t=await O4(window.location.href);if(t.kind==="accepted"){window.location.replace(t.path);return}t.kind==="failed"&&window.history.replaceState(null,"",t.path),V4(),(0,J4.createRoot)(e).render((0,Dv.jsx)(Lp,{children:(0,Dv.jsx)(L4,{initialPairError:t.kind==="failed"?t.message:void 0})}))}
