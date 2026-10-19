var MM=Object.create;var sy=Object.defineProperty;var RM=Object.getOwnPropertyDescriptor;var CM=Object.getOwnPropertyNames;var AM=Object.getPrototypeOf,OM=Object.prototype.hasOwnProperty;var ei=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(n){throw t=0,n}};var _M=(e,t,n,a)=>{if(t&&typeof t=="object"||typeof t=="function")for(let i of CM(t))!OM.call(e,i)&&i!==n&&sy(e,i,{get:()=>t[i],enumerable:!(a=RM(t,i))||a.enumerable});return e};var X=(e,t,n)=>(n=e!=null?MM(AM(e)):{},_M(t||!e||!e.__esModule?sy(n,"default",{value:e,enumerable:!0}):n,e));var by=ei(mt=>{"use strict";function cm(e,t){var n=e.length;e.push(t);e:for(;0<n;){var a=n-1>>>1,i=e[a];if(0<jd(i,t))e[a]=t,e[n]=i,n=a;else break e}}function ti(e){return e.length===0?null:e[0]}function Yd(e){if(e.length===0)return null;var t=e[0],n=e.pop();if(n!==t){e[0]=n;e:for(var a=0,i=e.length,r=i>>>1;a<r;){var o=2*(a+1)-1,s=e[o],l=o+1,c=e[l];if(0>jd(s,n))l<i&&0>jd(c,s)?(e[a]=c,e[l]=n,a=l):(e[a]=s,e[o]=n,a=o);else if(l<i&&0>jd(c,n))e[a]=c,e[l]=n,a=l;else break e}}return t}function jd(e,t){var n=e.sortIndex-t.sortIndex;return n!==0?n:e.id-t.id}mt.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(ly=performance,mt.unstable_now=function(){return ly.now()}):(om=Date,cy=om.now(),mt.unstable_now=function(){return om.now()-cy});var ly,om,cy,Ri=[],or=[],zM=1,va=null,mn=3,dm=!1,Rl=!1,Cl=!1,um=!1,fy=typeof setTimeout=="function"?setTimeout:null,py=typeof clearTimeout=="function"?clearTimeout:null,dy=typeof setImmediate<"u"?setImmediate:null;function Gd(e){for(var t=ti(or);t!==null;){if(t.callback===null)Yd(or);else if(t.startTime<=e)Yd(or),t.sortIndex=t.expirationTime,cm(Ri,t);else break;t=ti(or)}}function fm(e){if(Cl=!1,Gd(e),!Rl)if(ti(Ri)!==null)Rl=!0,es||(es=!0,Wo());else{var t=ti(or);t!==null&&pm(fm,t.startTime-e)}}var es=!1,Al=-1,my=5,gy=-1;function hy(){return um?!0:!(mt.unstable_now()-gy<my)}function sm(){if(um=!1,es){var e=mt.unstable_now();gy=e;var t=!0;try{e:{Rl=!1,Cl&&(Cl=!1,py(Al),Al=-1),dm=!0;var n=mn;try{t:{for(Gd(e),va=ti(Ri);va!==null&&!(va.expirationTime>e&&hy());){var a=va.callback;if(typeof a=="function"){va.callback=null,mn=va.priorityLevel;var i=a(va.expirationTime<=e);if(e=mt.unstable_now(),typeof i=="function"){va.callback=i,Gd(e),t=!0;break t}va===ti(Ri)&&Yd(Ri),Gd(e)}else Yd(Ri);va=ti(Ri)}if(va!==null)t=!0;else{var r=ti(or);r!==null&&pm(fm,r.startTime-e),t=!1}}break e}finally{va=null,mn=n,dm=!1}t=void 0}}finally{t?Wo():es=!1}}}var Wo;typeof dy=="function"?Wo=function(){dy(sm)}:typeof MessageChannel<"u"?(lm=new MessageChannel,uy=lm.port2,lm.port1.onmessage=sm,Wo=function(){uy.postMessage(null)}):Wo=function(){fy(sm,0)};var lm,uy;function pm(e,t){Al=fy(function(){e(mt.unstable_now())},t)}mt.unstable_IdlePriority=5;mt.unstable_ImmediatePriority=1;mt.unstable_LowPriority=4;mt.unstable_NormalPriority=3;mt.unstable_Profiling=null;mt.unstable_UserBlockingPriority=2;mt.unstable_cancelCallback=function(e){e.callback=null};mt.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):my=0<e?Math.floor(1e3/e):5};mt.unstable_getCurrentPriorityLevel=function(){return mn};mt.unstable_next=function(e){switch(mn){case 1:case 2:case 3:var t=3;break;default:t=mn}var n=mn;mn=t;try{return e()}finally{mn=n}};mt.unstable_requestPaint=function(){um=!0};mt.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var n=mn;mn=e;try{return t()}finally{mn=n}};mt.unstable_scheduleCallback=function(e,t,n){var a=mt.unstable_now();switch(typeof n=="object"&&n!==null?(n=n.delay,n=typeof n=="number"&&0<n?a+n:a):n=a,e){case 1:var i=-1;break;case 2:i=250;break;case 5:i=1073741823;break;case 4:i=1e4;break;default:i=5e3}return i=n+i,e={id:zM++,callback:t,priorityLevel:e,startTime:n,expirationTime:i,sortIndex:-1},n>a?(e.sortIndex=n,cm(or,e),ti(Ri)===null&&e===ti(or)&&(Cl?(py(Al),Al=-1):Cl=!0,pm(fm,n-a))):(e.sortIndex=i,cm(Ri,e),Rl||dm||(Rl=!0,es||(es=!0,Wo()))),e};mt.unstable_shouldYield=hy;mt.unstable_wrapCallback=function(e){var t=mn;return function(){var n=mn;mn=t;try{return e.apply(this,arguments)}finally{mn=n}}}});var yy=ei((h_,vy)=>{"use strict";vy.exports=by()});var _y=ei(ge=>{"use strict";var hm=Symbol.for("react.transitional.element"),DM=Symbol.for("react.portal"),IM=Symbol.for("react.fragment"),qM=Symbol.for("react.strict_mode"),LM=Symbol.for("react.profiler"),HM=Symbol.for("react.consumer"),VM=Symbol.for("react.context"),UM=Symbol.for("react.forward_ref"),PM=Symbol.for("react.suspense"),BM=Symbol.for("react.memo"),Ny=Symbol.for("react.lazy"),jM=Symbol.for("react.activity"),GM=Symbol.for("react.view_transition"),xy=Symbol.iterator;function YM(e){return e===null||typeof e!="object"?null:(e=xy&&e[xy]||e["@@iterator"],typeof e=="function"?e:null)}var Ty={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Ey=Object.assign,My={};function ns(e,t,n){this.props=e,this.context=t,this.refs=My,this.updater=n||Ty}ns.prototype.isReactComponent={};ns.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};ns.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function Ry(){}Ry.prototype=ns.prototype;function bm(e,t,n){this.props=e,this.context=t,this.refs=My,this.updater=n||Ty}var vm=bm.prototype=new Ry;vm.constructor=bm;Ey(vm,ns.prototype);vm.isPureReactComponent=!0;var wy=Array.isArray;function gm(){}var st={H:null,A:null,T:null,S:null},Cy=Object.prototype.hasOwnProperty;function ym(e,t,n){var a=n.ref;return{$$typeof:hm,type:e,key:t,ref:a!==void 0?a:null,props:n}}function XM(e,t){return ym(e.type,t,e.props)}function xm(e){return typeof e=="object"&&e!==null&&e.$$typeof===hm}function QM(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(n){return t[n]})}var Sy=/\/+/g;function mm(e,t){return typeof e=="object"&&e!==null&&e.key!=null?QM(""+e.key):t.toString(36)}function KM(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then(gm,gm):(e.status="pending",e.then(function(t){e.status==="pending"&&(e.status="fulfilled",e.value=t)},function(t){e.status==="pending"&&(e.status="rejected",e.reason=t)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function ts(e,t,n,a,i){var r=typeof e;(r==="undefined"||r==="boolean")&&(e=null);var o=!1;if(e===null)o=!0;else switch(r){case"bigint":case"string":case"number":o=!0;break;case"object":switch(e.$$typeof){case hm:case DM:o=!0;break;case Ny:return o=e._init,ts(o(e._payload),t,n,a,i)}}if(o)return i=i(e),o=a===""?"."+mm(e,0):a,wy(i)?(n="",o!=null&&(n=o.replace(Sy,"$&/")+"/"),ts(i,t,n,"",function(c){return c})):i!=null&&(xm(i)&&(i=XM(i,n+(i.key==null||e&&e.key===i.key?"":(""+i.key).replace(Sy,"$&/")+"/")+o)),t.push(i)),1;o=0;var s=a===""?".":a+":";if(wy(e))for(var l=0;l<e.length;l++)a=e[l],r=s+mm(a,l),o+=ts(a,t,n,r,i);else if(l=YM(e),typeof l=="function")for(e=l.call(e),l=0;!(a=e.next()).done;)a=a.value,r=s+mm(a,l++),o+=ts(a,t,n,r,i);else if(r==="object"){if(typeof e.then=="function")return ts(KM(e),t,n,a,i);throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return o}function Xd(e,t,n){if(e==null)return e;var a=[],i=0;return ts(e,a,"","",function(r){return t.call(n,r,i++)}),a}function FM(e){if(e._status===-1){var t=e._result,n=t();n.then(function(a){(e._status===0||e._status===-1)&&(e._status=1,e._result=a,n.status===void 0&&(n.status="fulfilled",n.value=a))},function(a){(e._status===0||e._status===-1)&&(e._status=2,e._result=a,n.status===void 0&&(n.status="rejected",n.reason=a))}),e._status===-1&&(e._status=0,e._result=n)}if(e._status===1)return e._result.default;throw e._result}var ky=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)};function Ay(e){var t=st.T,n={};n.types=t!==null?t.types:null,st.T=n;try{var a=e(),i=st.S;i!==null&&i(n,a),typeof a=="object"&&a!==null&&typeof a.then=="function"&&a.then(gm,ky)}catch(r){ky(r)}finally{t!==null&&n.types!==null&&(t.types=n.types),st.T=t}}function Oy(e){var t=st.T;if(t!==null){var n=t.types;n===null?t.types=[e]:n.indexOf(e)===-1&&n.push(e)}else Ay(Oy.bind(null,e))}var ZM={map:Xd,forEach:function(e,t,n){Xd(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return Xd(e,function(){t++}),t},toArray:function(e){return Xd(e,function(t){return t})||[]},only:function(e){if(!xm(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};ge.Activity=jM;ge.Children=ZM;ge.Component=ns;ge.Fragment=IM;ge.Profiler=LM;ge.PureComponent=bm;ge.StrictMode=qM;ge.Suspense=PM;ge.ViewTransition=GM;ge.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=st;ge.__COMPILER_RUNTIME={__proto__:null,c:function(e){return st.H.useMemoCache(e)}};ge.addTransitionType=Oy;ge.cache=function(e){return function(){return e.apply(null,arguments)}};ge.cacheSignal=function(){return null};ge.cloneElement=function(e,t,n){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var a=Ey({},e.props),i=e.key;if(t!=null)for(r in t.key!==void 0&&(i=""+t.key),t)!Cy.call(t,r)||r==="key"||r==="__self"||r==="__source"||r==="ref"&&t.ref===void 0||(a[r]=t[r]);var r=arguments.length-2;if(r===1)a.children=n;else if(1<r){for(var o=Array(r),s=0;s<r;s++)o[s]=arguments[s+2];a.children=o}return ym(e.type,i,a)};ge.createContext=function(e){return e={$$typeof:VM,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:HM,_context:e},e};ge.createElement=function(e,t,n){var a,i={},r=null;if(t!=null)for(a in t.key!==void 0&&(r=""+t.key),t)Cy.call(t,a)&&a!=="key"&&a!=="__self"&&a!=="__source"&&(i[a]=t[a]);var o=arguments.length-2;if(o===1)i.children=n;else if(1<o){for(var s=Array(o),l=0;l<o;l++)s[l]=arguments[l+2];i.children=s}if(e&&e.defaultProps)for(a in o=e.defaultProps,o)i[a]===void 0&&(i[a]=o[a]);return ym(e,r,i)};ge.createRef=function(){return{current:null}};ge.forwardRef=function(e){return{$$typeof:UM,render:e}};ge.isValidElement=xm;ge.lazy=function(e){return{$$typeof:Ny,_payload:{_status:-1,_result:e},_init:FM}};ge.memo=function(e,t){return{$$typeof:BM,type:e,compare:t===void 0?null:t}};ge.startTransition=Ay;ge.unstable_useCacheRefresh=function(){return st.H.useCacheRefresh()};ge.use=function(e){return st.H.use(e)};ge.useActionState=function(e,t,n){return st.H.useActionState(e,t,n)};ge.useCallback=function(e,t){return st.H.useCallback(e,t)};ge.useContext=function(e){return st.H.useContext(e)};ge.useDebugValue=function(){};ge.useDeferredValue=function(e,t){return st.H.useDeferredValue(e,t)};ge.useEffect=function(e,t){return st.H.useEffect(e,t)};ge.useEffectEvent=function(e){return st.H.useEffectEvent(e)};ge.useId=function(){return st.H.useId()};ge.useImperativeHandle=function(e,t,n){return st.H.useImperativeHandle(e,t,n)};ge.useInsertionEffect=function(e,t){return st.H.useInsertionEffect(e,t)};ge.useLayoutEffect=function(e,t){return st.H.useLayoutEffect(e,t)};ge.useMemo=function(e,t){return st.H.useMemo(e,t)};ge.useOptimistic=function(e,t){return st.H.useOptimistic(e,t)};ge.useReducer=function(e,t,n){return st.H.useReducer(e,t,n)};ge.useRef=function(e){return st.H.useRef(e)};ge.useState=function(e){return st.H.useState(e)};ge.useSyncExternalStore=function(e,t,n){return st.H.useSyncExternalStore(e,t,n)};ge.useTransition=function(){return st.H.useTransition()};ge.version="19.3.1"});var Ye=ei((v_,zy)=>{"use strict";zy.exports=_y()});var qy=ei(gn=>{"use strict";var JM=Ye();function Iy(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function sr(){}var En={d:{f:sr,r:function(){throw Error(Iy(522))},D:sr,C:sr,L:sr,m:sr,X:sr,S:sr,M:sr},p:0,findDOMNode:null},$M=Symbol.for("react.portal"),WM=Symbol.for("react.recoverable"),Dy=Symbol.for("react.optimistic_key");function eR(e,t,n){var a=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:$M,key:a==null?null:a===Dy?Dy:""+a,children:e,containerInfo:t,implementation:n}}var Ol=JM.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function Qd(e,t){if(e==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}gn.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=En;gn.browser=function(e){return{$$typeof:WM,_reason:e}};gn.createPortal=function(e,t){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(Iy(299));return eR(e,t,null,n)};gn.flushSync=function(e){var t=Ol.T,n=En.p;try{if(Ol.T=null,En.p=2,e)return e()}finally{Ol.T=t,En.p=n,En.d.f()}};gn.preconnect=function(e,t){typeof e=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,En.d.C(e,t))};gn.prefetchDNS=function(e){typeof e=="string"&&En.d.D(e)};gn.preinit=function(e,t){if(typeof e=="string"&&t&&typeof t.as=="string"){var n=t.as,a=Qd(n,t.crossOrigin),i=typeof t.integrity=="string"?t.integrity:void 0,r=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;n==="style"?En.d.S(e,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:a,integrity:i,fetchPriority:r}):n==="script"&&En.d.X(e,{crossOrigin:a,integrity:i,fetchPriority:r,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};gn.preinitModule=function(e,t){if(typeof e=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var n=Qd(t.as,t.crossOrigin);En.d.M(e,{crossOrigin:n,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}}else t==null&&En.d.M(e)};gn.preload=function(e,t){if(typeof e=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var n=t.as,a=Qd(n,t.crossOrigin);En.d.L(e,n,{crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};gn.preloadModule=function(e,t){if(typeof e=="string")if(t){var n=Qd(t.as,t.crossOrigin);En.d.m(e,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:n,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}else En.d.m(e)};gn.requestFormReset=function(e){En.d.r(e)};gn.unstable_batchedUpdates=function(e,t){return e(t)};gn.useFormState=function(e,t,n){return Ol.H.useFormState(e,t,n)};gn.useFormStatus=function(){return Ol.H.useHostTransitionStatus()};gn.version="19.3.1"});var Vy=ei((x_,Hy)=>{"use strict";function Ly(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Ly)}catch(e){console.error(e)}}Ly(),Hy.exports=qy()});var TS=ei(Cf=>{"use strict";var Xt=yy(),Nx=Ye(),tR=Vy();function I(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Tx(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function vc(e){for(var t=e,n=t;n&&!n.alternate;)t=n,(t.flags&4098)!==0&&(e=t.return),n=t.return;for(;t.return;)t=t.return;return t.tag===3?e:null}function Ex(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Mx(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Uy(e){if(vc(e)!==e)throw Error(I(188))}function nR(e){var t=e.alternate;if(!t){if(t=vc(e),t===null)throw Error(I(188));return t!==e?null:e}for(var n=e,a=t;;){var i=n.return;if(i===null)break;var r=i.alternate;if(r===null){if(a=i.return,a!==null){n=a;continue}break}if(i.child===r.child){for(r=i.child;r;){if(r===n)return Uy(i),e;if(r===a)return Uy(i),t;r=r.sibling}throw Error(I(188))}if(n.return!==a.return)n=i,a=r;else{for(var o=!1,s=i.child;s;){if(s===n){o=!0,n=i,a=r;break}if(s===a){o=!0,a=i,n=r;break}s=s.sibling}if(!o){for(s=r.child;s;){if(s===n){o=!0,n=r,a=i;break}if(s===a){o=!0,a=r,n=i;break}s=s.sibling}if(!o)throw Error(I(189))}}if(n.alternate!==a)throw Error(I(190))}if(n.tag!==3)throw Error(I(188));return n.stateNode.current===n?e:t}function Rx(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=Rx(e),t!==null)return t;e=e.sibling}return null}function Bn(e,t,n,a,i,r){for(;e!==null;){if((e.tag===5||e.tag===27||e.tag===6)&&n(e,a,i,r)||(e.tag!==22||e.memoizedState===null)&&(t||e.tag!==5&&e.tag!==27)&&Bn(e.child,t,n,a,i,r))return!0;e=e.sibling}return!1}function To(e){for(e=e.return;e!==null;){if(e.tag===3||e.tag===5||e.tag===27)return e;e=e.return}return null}function Py(e){var t=!1;for(e=e.return;e!==null&&(e.tag===4&&(t=!0),!(e.tag===3||e.tag===5||e.tag===27));)e=e.return;return t}function Cx(e){var t=[null,null],n=To(e);return n===null||Ax(t,e,n.child,{foundSelf:!1}),t}function Ax(e,t,n,a){for(;n!==null;){if(n===t)a.foundSelf=!0;else if(n.tag===5||n.tag===27||n.tag===6){if(a.foundSelf)return e[1]=n,!0;e[0]=n}else if((n.tag!==22||n.memoizedState===null)&&Ax(e,t,n.child,a))return!0;n=n.sibling}return!1}function Yt(e){switch(e.tag){case 5:case 27:case 6:return e.stateNode;case 3:return e.stateNode.containerInfo;default:throw Error(I(559))}}var cs=null,$m=null;function aR(e,t,n){return e===n?!0:e===t?(cs=e,!0):!1}function iR(e,t,n){return e===n?($m=e,!1):e===t?($m!==null&&(cs=e),!0):!1}function By(e){if(e===null)return null;do e=e===null?null:e.return;while(e&&e.tag!==5&&e.tag!==27&&e.tag!==3);return e||null}function Wm(e,t,n){for(var a=0,i=e;i;i=n(i))a++;i=0;for(var r=t;r;r=n(r))i++;for(;0<a-i;)e=n(e),a--;for(;0<i-a;)t=n(t),i--;for(;a--;){if(e===t||t!==null&&e===t.alternate)return e;e=n(e),t=n(t)}return null}var rt=Object.assign,rR=Symbol.for("react.element"),Kd=Symbol.for("react.transitional.element"),Hl=Symbol.for("react.portal"),ds=Symbol.for("react.fragment"),Ox=Symbol.for("react.strict_mode"),eg=Symbol.for("react.profiler"),_x=Symbol.for("react.consumer"),si=Symbol.for("react.context"),ch=Symbol.for("react.forward_ref"),tg=Symbol.for("react.suspense"),ng=Symbol.for("react.suspense_list"),dh=Symbol.for("react.memo"),ur=Symbol.for("react.lazy"),ag=Symbol.for("react.activity"),oR=Symbol.for("react.legacy_hidden"),sR=Symbol.for("react.memo_cache_sentinel"),ig=Symbol.for("react.view_transition"),lR=Symbol.for("react.recoverable"),jy=Symbol.iterator;function _l(e){return e===null||typeof e!="object"?null:(e=jy&&e[jy]||e["@@iterator"],typeof e=="function"?e:null)}var cR=Symbol.for("react.client.reference");function rg(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===cR?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case ds:return"Fragment";case eg:return"Profiler";case Ox:return"StrictMode";case tg:return"Suspense";case ng:return"SuspenseList";case ag:return"Activity";case ig:return"ViewTransition"}if(typeof e=="object")switch(e.$$typeof){case Hl:return"Portal";case si:return e.displayName||"Context";case _x:return(e._context.displayName||"Context")+".Consumer";case ch:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case dh:return t=e.displayName||null,t!==null?t:rg(e.type)||"Memo";case ur:t=e._payload,e=e._init;try{return rg(e(t))}catch{}}return null}var Vl=Array.isArray,pe=Nx.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Be=tR.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,fo={pending:!1,data:null,method:null,action:null},og=[],us=-1;function mi(e){return{current:e}}function ln(e){0>us||(e.current=og[us],og[us]=null,us--)}function dt(e,t){us++,og[us]=e.current,e.current=t}var ui=mi(null),nc=mi(null),xr=mi(null),Du=mi(null);function Iu(e,t){switch(dt(xr,t),dt(nc,e),dt(ui,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?ax(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=ax(t),e=eS(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}ln(ui),dt(ui,e)}function Os(){ln(ui),ln(nc),ln(xr)}function sg(e){var t=e.memoizedState;t!==null&&(Ps._currentValue=t.memoizedState,dt(Du,e)),t=ui.current;var n=eS(t,e.type);t!==n&&(dt(nc,e),dt(ui,n))}function qu(e){nc.current===e&&(ln(ui),ln(nc)),Du.current===e&&(ln(Du),Ps._currentValue=fo)}var wm,Gy;function cr(e){if(wm===void 0)try{throw Error()}catch(n){var t=n.stack.trim().match(/\n( *(at )?)/);wm=t&&t[1]||"",Gy=-1<n.stack.indexOf(`
    at`)?" (<anonymous>)":-1<n.stack.indexOf("@")?"@unknown:0:0":""}return`
`+wm+e+Gy}var Sm=!1;function km(e,t){if(!e||Sm)return"";Sm=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var a={DetermineComponentFrameRoot:function(){try{if(t){var v=function(){throw Error()};if(Object.defineProperty(v.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(v,[])}catch(w){var g=w}Reflect.construct(e,[],v)}else{try{v.call()}catch(w){g=w}v=!1;try{var h=Object.getOwnPropertyDescriptor(e.prototype,"props");Object.defineProperty(e.prototype,"props",{configurable:!0,set:function(){throw Error()}}),v=!0,new e}finally{v&&(h!==void 0?Object.defineProperty(e.prototype,"props",h):delete e.prototype.props)}}}else{try{throw Error()}catch(w){g=w}(v=e())&&typeof v.catch=="function"&&v.catch(function(){})}}catch(w){if(w&&g&&typeof w.stack=="string")return[w.stack,g.stack]}return[null,null]}};a.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var i=Object.getOwnPropertyDescriptor(a.DetermineComponentFrameRoot,"name");i&&i.configurable&&Object.defineProperty(a.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var r=a.DetermineComponentFrameRoot(),o=r[0],s=r[1];if(o&&s){var l=o.split(`
`),c=s.split(`
`);for(i=a=0;a<l.length&&!l[a].includes("DetermineComponentFrameRoot");)a++;for(;i<c.length&&!c[i].includes("DetermineComponentFrameRoot");)i++;if(a===l.length||i===c.length)for(a=l.length-1,i=c.length-1;1<=a&&0<=i&&l[a]!==c[i];)i--;for(;1<=a&&0<=i;a--,i--)if(l[a]!==c[i]){if(a!==1||i!==1)do if(a--,i--,0>i||l[a]!==c[i]){var f=`
`+l[a].replace(" at new "," at ");return e.displayName&&f.includes("<anonymous>")&&(f=f.replace("<anonymous>",e.displayName)),f}while(1<=a&&0<=i);break}}}finally{Sm=!1,Error.prepareStackTrace=n}return(n=e?e.displayName||e.name:"")?cr(n):""}function dR(e,t){switch(e.tag){case 26:case 27:case 5:return cr(e.type);case 16:return cr("Lazy");case 13:return e.child!==t&&t!==null?cr("Suspense Fallback"):cr("Suspense");case 19:return cr("SuspenseList");case 0:case 15:return km(e.type,!1);case 11:return km(e.type.render,!1);case 1:return km(e.type,!0);case 31:return cr("Activity");case 30:return cr("ViewTransition");default:return""}}function Yy(e){try{var t="",n=null;do t+=dR(e,n),n=e,e=e.return;while(e);return t}catch(a){return`
Error generating stack: `+a.message+`
`+a.stack}}var lg=Object.prototype.hasOwnProperty,uh=Xt.unstable_scheduleCallback,Nm=Xt.unstable_cancelCallback,uR=Xt.unstable_shouldYield,fR=Xt.unstable_requestPaint,aa=Xt.unstable_now,pR=Xt.unstable_getCurrentPriorityLevel,zx=Xt.unstable_ImmediatePriority,Dx=Xt.unstable_UserBlockingPriority,Lu=Xt.unstable_NormalPriority,mR=Xt.unstable_LowPriority,Ix=Xt.unstable_IdlePriority,gR=Xt.log,hR=Xt.unstable_setDisableYieldValue,yc=null,ia=null;function mr(e){if(typeof gR=="function"&&hR(e),ia&&typeof ia.setStrictMode=="function")try{ia.setStrictMode(yc,e)}catch{}}var ra=Math.clz32?Math.clz32:yR,bR=Math.log,vR=Math.LN2;function yR(e){return e>>>=0,e===0?32:31-(bR(e)/vR|0)|0}var Fd=256,Zd=262144,Jd=4194304;function oo(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&-e;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function df(e,t,n){var a=e.pendingLanes;if(a===0)return 0;var i=0,r=e.suspendedLanes,o=e.pingedLanes;e=e.warmLanes;var s=a&134217727;return s!==0?(a=s&~r,a!==0?i=oo(a):(o&=s,o!==0?i=oo(o):n||(n=s&~e,n!==0&&(i=oo(n))))):(s=a&~r,s!==0?i=oo(s):o!==0?i=oo(o):n||(n=a&~e,n!==0&&(i=oo(n)))),i===0?0:t!==0&&t!==i&&(t&r)===0&&(r=i&-i,n=t&-t,r>=n||r===32&&(n&4194048)!==0)?t:i}function xc(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function qx(e,t){(t&8)!==0&&(t|=t&32);var n=e.entangledLanes;if(n!==0)for(e=e.entanglements,n&=t;0<n;){var a=31-ra(n),i=1<<a;t|=e[a],n&=~i}return t}function xR(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Lx(){var e=Jd;return Jd<<=1,(Jd&62914560)===0&&(Jd=4194304),e}function Tm(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function wc(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function wR(e,t,n,a,i,r){var o=e.pendingLanes;e.pendingLanes=n,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=n,e.entangledLanes&=n,e.errorRecoveryDisabledLanes&=n,e.shellSuspendCounter=0;var s=e.entanglements,l=e.expirationTimes,c=e.hiddenUpdates;for(n=o&~n;0<n;){var f=31-ra(n),v=1<<f;s[f]=0,l[f]=-1;var g=c[f];if(g!==null)for(c[f]=null,f=0;f<g.length;f++){var h=g[f];h!==null&&(h.lane&=-536870913)}n&=~v}a!==0&&Hx(e,a,0),r!==0&&i===0&&e.tag!==0&&(e.suspendedLanes|=r&~(o&~t))}function Hx(e,t,n){e.pendingLanes|=t,e.suspendedLanes&=~t;var a=31-ra(t);e.entangledLanes|=t,e.entanglements[a]=e.entanglements[a]|1073741824|n&261930}function Vx(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var a=31-ra(n),i=1<<a;i&t|e[a]&t&&(e[a]|=t),n&=~i}}function Ux(e,t){var n=t&-t;return n=(n&42)!==0?1:fh(n),(n&(e.suspendedLanes|t))!==0?0:n}function fh(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function ph(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function Px(){var e=Be.p;return e!==0?e:(e=window.event,e===void 0?32:SS(e.type))}function Xy(e,t){var n=Be.p;try{return Be.p=e,t()}finally{Be.p=n}}var Pi=Math.random().toString(36).slice(2),on="__reactFiber$"+Pi,jn="__reactProps$"+Pi,Gs="__reactContainer$"+Pi,Qy="__reactEvents$"+Pi,SR="__reactListeners$"+Pi,kR="__reactHandles$"+Pi,Ky="__reactResources$"+Pi,Sc="__reactMarker$"+Pi,Hu="__reactLoad$"+Pi;function uf(e){delete e[on],delete e[jn],delete e[SR],delete e[kR]}function co(e){var t;if(t=e[on])return t;for(var n=e.parentNode;n;){if(t=n[Gs]||n[on]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=ux(e);e!==null;){if(n=e[on])return n;e=ux(e)}return t}e=n,n=e.parentNode}return null}function Ys(e){if(e=e[on]||e[Gs]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function Ul(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(I(33))}function ws(e){var t=e[Ky];return t||(t=e[Ky]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function en(e){e[Sc]=!0}function Bx(e){e[Hu]=void 0}var jx=new Set,Gx={};function Eo(e,t){_s(e,t),_s(e+"Capture",t)}function _s(e,t){for(Gx[e]=t,e=0;e<t.length;e++)jx.add(t[e])}var NR=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),Fy={},Zy={};function TR(e){return lg.call(Zy,e)?!0:lg.call(Fy,e)?!1:NR.test(e)?Zy[e]=!0:(Fy[e]=!0,!1)}var Ue=!1;function Jy(){var e=Ue;return Ue=!1,e}function gu(e,t,n){if(TR(t))if(n===null)e.removeAttribute(t);else{switch(typeof n){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var a=t.toLowerCase().slice(0,5);if(a!=="data-"&&a!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,n)}}function $d(e,t,n){if(n===null)e.removeAttribute(t);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,n)}}function Ci(e,t,n,a){if(a===null)e.removeAttribute(n);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(n);return}e.setAttributeNS(t,n,a)}}function Wn(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function Yx(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function ER(e,t,n){var a=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof a<"u"&&typeof a.get=="function"&&typeof a.set=="function"){var i=a.get,r=a.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return i.call(this)},set:function(o){n=""+o,r.call(this,o)}}),Object.defineProperty(e,t,{enumerable:a.enumerable}),{getValue:function(){return n},setValue:function(o){n=""+o},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function cg(e){if(!e._valueTracker){var t=Yx(e)?"checked":"value";e._valueTracker=ER(e,t,""+e[t])}}function Xx(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),a="";return e&&(a=Yx(e)?e.checked?"true":"false":e.value),e=a,e!==n?(t.setValue(e),!0):!1}var MR=/[\n"\\]/g;function ka(e){return e.replace(MR,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function dg(e,t,n,a,i,r,o,s){e.name="",o!=null&&typeof o!="function"&&typeof o!="symbol"&&typeof o!="boolean"?e.type=o:e.removeAttribute("type"),t!=null?o==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+Wn(t)):e.value!==""+Wn(t)&&(e.value=""+Wn(t)):o!=="submit"&&o!=="reset"||e.removeAttribute("value"),t!=null?o==="number"&&e.value==t?Em(e,Wn(e.value)):Em(e,Wn(t)):n!=null?Em(e,Wn(n)):a!=null&&e.removeAttribute("value"),i==null&&r!=null&&(e.defaultChecked=!!r),i!=null&&(e.checked=i&&typeof i!="function"&&typeof i!="symbol"),s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"?e.name=""+Wn(s):e.removeAttribute("name")}function Qx(e,t,n,a,i,r,o,s){if(r!=null&&typeof r!="function"&&typeof r!="symbol"&&typeof r!="boolean"&&(e.type=r),t!=null||n!=null){if(!(r!=="submit"&&r!=="reset"||t!=null)){cg(e);return}n=n!=null?""+Wn(n):"",t=t!=null?""+Wn(t):n,s||t===e.value||(e.value=t),e.defaultValue=t}a=a??i,a=typeof a!="function"&&typeof a!="symbol"&&!!a,e.checked=s?e.checked:!!a,e.defaultChecked=!!a,o!=null&&typeof o!="function"&&typeof o!="symbol"&&typeof o!="boolean"&&(e.name=o),cg(e)}function Em(e,t){e.defaultValue!==""+t&&(e.defaultValue=""+t)}function Ss(e,t,n,a){if(e=e.options,t){t={};for(var i=0;i<n.length;i++)t["$"+n[i]]=!0;for(n=0;n<e.length;n++)i=t.hasOwnProperty("$"+e[n].value),e[n].selected!==i&&(e[n].selected=i),i&&a&&(e[n].defaultSelected=!0)}else{for(n=""+Wn(n),t=null,i=0;i<e.length;i++){if(e[i].value===n){e[i].selected=!0,a&&(e[i].defaultSelected=!0);return}t!==null||e[i].disabled||(t=e[i])}t!==null&&(t.selected=!0)}}function Kx(e,t,n){if(t!=null&&(t=""+Wn(t),t!==e.value&&(e.value=t),n==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=n!=null?""+Wn(n):""}function Fx(e,t,n,a){if(t==null){if(a!=null){if(n!=null)throw Error(I(92));if(Vl(a)){if(1<a.length)throw Error(I(93));a=a[0]}n=a}n==null&&(n=""),t=n}n=Wn(t),e.defaultValue=n,a=e.textContent,a===n&&a!==""&&a!==null&&(e.value=a),cg(e)}function zs(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var RR=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function $y(e,t,n){var a=t.indexOf("--")===0;n==null||typeof n=="boolean"||n===""?a?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":a?e.setProperty(t,n):typeof n!="number"||n===0||RR.has(t)?t==="float"?e.cssFloat=n:e[t]=(""+n).trim():e[t]=n+"px"}function Zx(e,t,n){if(t!=null&&typeof t!="object")throw Error(I(62));if(e=e.style,n!=null){for(var a in n)!n.hasOwnProperty(a)||t!=null&&t.hasOwnProperty(a)||(a.indexOf("--")===0?e.setProperty(a,""):a==="float"?e.cssFloat="":e[a]="",Ue=!0);for(var i in t)a=t[i],t.hasOwnProperty(i)&&n[i]!==a&&($y(e,i,a),Ue=!0)}else for(var r in t)t.hasOwnProperty(r)&&$y(e,r,t[r])}function mh(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var CR=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["maskType","mask-type"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),AR=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function hu(e){return AR.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function li(){}var ug=null;function gh(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var fs=null,ks=null;function Wy(e){var t=Ys(e);if(t&&(e=t.stateNode)){var n=e[jn]||null;e:switch(e=t.stateNode,t.type){case"input":if(dg(e,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),t=n.name,n.type==="radio"&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll('input[name="'+ka(""+t)+'"][type="radio"]'),t=0;t<n.length;t++){var a=n[t];if(a!==e&&a.form===e.form){var i=a[jn]||null;if(!i)throw Error(I(90));dg(a,i.value,i.defaultValue,i.defaultValue,i.checked,i.defaultChecked,i.type,i.name)}}for(t=0;t<n.length;t++)a=n[t],a.form===e.form&&Xx(a)}break e;case"textarea":Kx(e,n.value,n.defaultValue);break e;case"select":t=n.value,t!=null&&Ss(e,!!n.multiple,t,!1)}}}var Mm=!1;function Jx(e,t,n){if(Mm)return e(t,n);Mm=!0;try{var a=e(t);return a}finally{if(Mm=!1,(fs!==null||ks!==null)&&(Tf(),fs&&(t=fs,e=ks,ks=fs=null,Wy(t),e)))for(t=0;t<e.length;t++)Wy(e[t])}}function ac(e,t){var n=e.stateNode;if(n===null)return null;var a=n[jn]||null;if(a===null)return null;n=a[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(a=!a.disabled)||(e=e.type,a=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!a;break e;default:e=!1}if(e)return null;if(n&&typeof n!="function")throw Error(I(231,t,typeof n));return n}var Ii=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),fg=!1;if(Ii)try{as={},Object.defineProperty(as,"passive",{get:function(){fg=!0}}),window.addEventListener("test",as,as),window.removeEventListener("test",as,as)}catch{fg=!1}var as,gr=null,hh=null,bu=null;function $x(){if(bu)return bu;var e,t=hh,n=t.length,a,i="value"in gr?gr.value:gr.textContent,r=i.length;for(e=0;e<n&&t[e]===i[e];e++);var o=n-e;for(a=1;a<=o&&t[n-a]===i[r-a];a++);return bu=i.slice(e,1<a?1-a:void 0)}function vu(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Wd(){return!0}function e0(){return!1}function An(e){function t(n,a,i,r,o){this._reactName=n,this._targetInst=i,this.type=a,this.nativeEvent=r,this.target=o,this.currentTarget=null;for(var s in e)e.hasOwnProperty(s)&&(n=e[s],this[s]=n?n(r):r[s]);return this.isDefaultPrevented=(r.defaultPrevented!=null?r.defaultPrevented:r.returnValue===!1)?Wd:e0,this.isPropagationStopped=e0,this}return rt(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=Wd)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=Wd)},persist:function(){},isPersistent:Wd}),t}var Ir={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},ff=An(Ir),kc=rt({},Ir,{view:0,detail:0}),OR=An(kc),Rm,Cm,zl,pf=rt({},kc,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:bh,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==zl&&(zl&&e.type==="mousemove"?(Rm=e.screenX-zl.screenX,Cm=e.screenY-zl.screenY):Cm=Rm=0,zl=e),Rm)},movementY:function(e){return"movementY"in e?e.movementY:Cm}}),t0=An(pf),_R=rt({},pf,{dataTransfer:0}),zR=An(_R),DR=rt({},kc,{relatedTarget:0}),Am=An(DR),IR=rt({},Ir,{animationName:0,elapsedTime:0,pseudoElement:0}),qR=An(IR),LR=rt({},Ir,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),HR=An(LR),VR=rt({},Ir,{data:0}),n0=An(VR),UR={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},PR={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},BR={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function jR(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=BR[e])?!!t[e]:!1}function bh(){return jR}var GR=rt({},kc,{key:function(e){if(e.key){var t=UR[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=vu(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?PR[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:bh,charCode:function(e){return e.type==="keypress"?vu(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?vu(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),YR=An(GR),XR=rt({},pf,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),a0=An(XR),QR=rt({},Ir,{submitter:0}),KR=An(QR),FR=rt({},kc,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:bh}),ZR=An(FR),JR=rt({},Ir,{propertyName:0,elapsedTime:0,pseudoElement:0}),$R=An(JR),WR=rt({},pf,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),eC=An(WR),tC=rt({},Ir,{newState:0,oldState:0,source:0}),nC=An(tC),aC=[9,13,27,32],vh=Ii&&"CompositionEvent"in window,jl=null;Ii&&"documentMode"in document&&(jl=document.documentMode);var iC=Ii&&"TextEvent"in window&&!jl,Wx=Ii&&(!vh||jl&&8<jl&&11>=jl),i0=" ",r0=!1;function e1(e,t){switch(e){case"keyup":return aC.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function t1(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var ps=!1;function rC(e,t){switch(e){case"compositionend":return t1(t);case"keypress":return t.which!==32?null:(r0=!0,i0);case"textInput":return e=t.data,e===i0&&r0?null:e;default:return null}}function oC(e,t){if(ps)return e==="compositionend"||!vh&&e1(e,t)?(e=$x(),bu=hh=gr=null,ps=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return Wx&&t.locale!=="ko"?null:t.data;default:return null}}var sC={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function o0(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!sC[e.type]:t==="textarea"}function n1(e,t,n,a){fs?ks?ks.push(a):ks=[a]:fs=a,t=sf(t,"onChange"),0<t.length&&(n=new ff("onChange","change",null,n,a),e.push({event:n,listeners:t}))}var Gl=null,ic=null;function lC(e){Jw(e,0)}function mf(e){var t=Ul(e);if(Xx(t))return e}function s0(e,t){if(e==="change")return t}var a1=!1;Ii&&(Ii?(tu="oninput"in document,tu||(Om=document.createElement("div"),Om.setAttribute("oninput","return;"),tu=typeof Om.oninput=="function"),eu=tu):eu=!1,a1=eu&&(!document.documentMode||9<document.documentMode));var eu,tu,Om;function l0(){Gl&&(Gl.detachEvent("onpropertychange",i1),ic=Gl=null)}function i1(e){if(e.propertyName==="value"&&mf(ic)){var t=[];n1(t,ic,e,gh(e)),Jx(lC,t)}}function cC(e,t,n){e==="focusin"?(l0(),Gl=t,ic=n,Gl.attachEvent("onpropertychange",i1)):e==="focusout"&&l0()}function dC(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return mf(ic)}function uC(e,t){if(e==="click")return mf(t)}function fC(e,t){if(e==="input"||e==="change")return mf(t)}function pC(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var sa=typeof Object.is=="function"?Object.is:pC;function rc(e,t){if(sa(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var n=Object.keys(e),a=Object.keys(t);if(n.length!==a.length)return!1;for(a=0;a<n.length;a++){var i=n[a];if(!lg.call(t,i)||!sa(e[i],t[i]))return!1}return!0}function pg(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function c0(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function d0(e,t){var n=c0(e);e=0;for(var a;n;){if(n.nodeType===3){if(a=e+n.textContent.length,e<=t&&a>=t)return{node:n,offset:t-e};e=a}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=c0(n)}}function r1(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?r1(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function o1(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=pg(e.document);t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href=="string"}catch{n=!1}if(n)e=t.contentWindow;else break;t=pg(e.document)}return t}function yh(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var mC=Ii&&"documentMode"in document&&11>=document.documentMode,ms=null,mg=null,Yl=null,gg=!1;function u0(e,t,n){var a=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;gg||ms==null||ms!==pg(a)||(a=ms,"selectionStart"in a&&yh(a)?a={start:a.selectionStart,end:a.selectionEnd}:(a=(a.ownerDocument&&a.ownerDocument.defaultView||window).getSelection(),a={anchorNode:a.anchorNode,anchorOffset:a.anchorOffset,focusNode:a.focusNode,focusOffset:a.focusOffset}),Yl&&rc(Yl,a)||(Yl=a,a=sf(mg,"onSelect"),0<a.length&&(t=new ff("onSelect","select",null,t,n),e.push({event:t,listeners:a}),t.target=ms)))}function io(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n["Webkit"+e]="webkit"+t,n["Moz"+e]="moz"+t,n}var gs={animationend:io("Animation","AnimationEnd"),animationiteration:io("Animation","AnimationIteration"),animationstart:io("Animation","AnimationStart"),transitionrun:io("Transition","TransitionRun"),transitionstart:io("Transition","TransitionStart"),transitioncancel:io("Transition","TransitionCancel"),transitionend:io("Transition","TransitionEnd")},_m={},s1={};Ii&&(s1=document.createElement("div").style,"AnimationEvent"in window||(delete gs.animationend.animation,delete gs.animationiteration.animation,delete gs.animationstart.animation),"TransitionEvent"in window||delete gs.transitionend.transition);function Mo(e){if(_m[e])return _m[e];if(!gs[e])return e;var t=gs[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in s1)return _m[e]=t[n];return e}var l1=Mo("animationend"),c1=Mo("animationiteration"),d1=Mo("animationstart"),gC=Mo("transitionrun"),hC=Mo("transitionstart"),bC=Mo("transitioncancel"),u1=Mo("transitionend"),f1=new Map,hg="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");hg.push("scrollEnd");function Ya(e,t){f1.set(e,t),Eo(t,[e])}var vC=0;function qi(e,t){if(e.name!=null&&e.name!=="auto")return e.name;if(t.autoName!==null)return t.autoName;e=Ga.identifierPrefix;var n=vC++;return e="_"+e+"t_"+n.toString(32)+"_",t.autoName=e}function f0(e){if(e==null||typeof e=="string")return e;var t=null,n=As;if(n!==null)for(var a=0;a<n.length;a++){var i=e[n[a]];if(i!=null){if(i==="none")return"none";t=t==null?i:t+(" "+i)}}return t??e.default}function Bi(e,t){return e=f0(e),t=f0(t),t==null?e==="auto"?null:e:t==="auto"?null:t}var Vu=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},xa=[],hs=0,xh=0;function gf(){for(var e=hs,t=xh=hs=0;t<e;){var n=xa[t];xa[t++]=null;var a=xa[t];xa[t++]=null;var i=xa[t];xa[t++]=null;var r=xa[t];if(xa[t++]=null,a!==null&&i!==null){var o=a.pending;o===null?i.next=i:(i.next=o.next,o.next=i),a.pending=i}r!==0&&p1(n,i,r)}}function hf(e,t,n,a){xa[hs++]=e,xa[hs++]=t,xa[hs++]=n,xa[hs++]=a,xh|=a,e.lanes|=a,e=e.alternate,e!==null&&(e.lanes|=a)}function wh(e,t,n,a){return hf(e,t,n,a),Uu(e)}function Ro(e,t){return hf(e,null,null,t),Uu(e)}function p1(e,t,n){e.lanes|=n;var a=e.alternate;a!==null&&(a.lanes|=n);for(var i=!1,r=e.return;r!==null;)r.childLanes|=n,a=r.alternate,a!==null&&(a.childLanes|=n),r.tag===22&&(e=r.stateNode,e===null||e._visibility&1||(i=!0)),e=r,r=r.return;return e.tag===3?(r=e.stateNode,i&&t!==null&&(i=31-ra(n),e=r.hiddenUpdates,a=e[i],a===null?e[i]=[t]:a.push(t),t.lane=n|536870912),r):null}function Uu(e){if(50<tc)throw tc=0,Ru=null,Error(I(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var bs={};function yC(e,t,n,a){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=a,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Un(e,t,n,a){return new yC(e,t,n,a)}function Sh(e){return e=e.prototype,!(!e||!e.isReactComponent)}function zi(e,t){var n=e.alternate;return n===null?(n=Un(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&1206910976,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n.refCleanup=e.refCleanup,n}function m1(e,t){e.flags&=1206910978;var n=e.alternate;return n===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=n.childLanes,e.lanes=n.lanes,e.child=n.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=n.memoizedProps,e.memoizedState=n.memoizedState,e.updateQueue=n.updateQueue,e.type=n.type,t=n.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function yu(e,t,n,a,i,r){var o=0;if(a=e,typeof a=="function")Sh(a)&&(o=1);else if(typeof a=="string")o=YA(e,n,ui.current)?26:e==="html"||e==="head"||e==="body"?27:5;else e:switch(a){case ag:return e=Un(31,n,t,i),e.elementType=ag,e.lanes=r,e;case ds:return po(n.children,i,r,t);case Ox:o=8,i|=24;break;case eg:return e=Un(12,n,t,i|2),e.elementType=eg,e.lanes=r,e;case tg:return e=Un(13,n,t,i),e.elementType=tg,e.lanes=r,e;case ng:return e=Un(19,n,t,i),e.elementType=ng,e.lanes=r,e;case oR:case ig:return e=i|32,e=Un(30,n,t,e),e.elementType=ig,e.lanes=r,e.stateNode={autoName:null,paired:null,clones:null,ref:null},e;default:if(typeof a=="object"&&a!==null)switch(a.$$typeof){case si:o=10;break e;case _x:o=9;break e;case ch:o=11;break e;case dh:o=14;break e;case ur:o=16,a=null;break e}o=29,n=Error(I(130,e===null?"null":typeof e,"")),a=null}return t=Un(o,n,t,i),t.elementType=e,t.type=a,t.lanes=r,t}function po(e,t,n,a){return e=Un(7,e,a,t),e.lanes=n,e}function zm(e,t,n){return e=Un(6,e,null,t),e.lanes=n,e}function g1(e){var t=Un(18,null,null,0);return t.stateNode=e,t}function Dm(e,t,n){return t=Un(4,e.children!==null?e.children:[],e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var p0=new WeakMap;function Na(e,t){if(typeof e=="object"&&e!==null){var n=p0.get(e);return n!==void 0?n:(t={value:e,source:t,stack:Yy(t)},p0.set(e,t),t)}return{value:e,source:t,stack:Yy(t)}}var vs=[],ys=0,Pu=null,oc=0,wa=[],Sa=0,Ar=null,ci=1,di="";function Oi(e,t){vs[ys++]=oc,vs[ys++]=Pu,Pu=e,oc=t}function h1(e,t,n){wa[Sa++]=ci,wa[Sa++]=di,wa[Sa++]=Ar,Ar=e;var a=ci;e=di;var i=32-ra(a)-1;a&=~(1<<i),n+=1;var r=32-ra(t)+i;if(30<r){var o=i-i%5;r=(a&(1<<o)-1).toString(32),a>>=o,i-=o,ci=1<<32-ra(t)+i|n<<i|a,di=r+e}else ci=1<<r|n<<i|a,di=e}function bf(e){e.return!==null&&(Oi(e,1),h1(e,1,0))}function kh(e){for(;e===Pu;)Pu=vs[--ys],vs[ys]=null,oc=vs[--ys],vs[ys]=null;for(;e===Ar;)Ar=wa[--Sa],wa[Sa]=null,di=wa[--Sa],wa[Sa]=null,ci=wa[--Sa],wa[Sa]=null}function b1(e,t){wa[Sa++]=ci,wa[Sa++]=di,wa[Sa++]=Ar,ci=t.id,di=t.overflow,Ar=e}var tn=null,ct=null,Ne=!1,wr=null,Ta=!1,bg=Error(I(519));function Or(e){var t=Error(I(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw sc(Na(t,e)),bg}function m0(e){var t=e.stateNode,n=e.type,a=e.memoizedProps;switch(t[on]=e,t[jn]=a,n){case"dialog":Re("cancel",t),Re("close",t);break;case"iframe":case"object":case"embed":Re("load",t);break;case"video":case"audio":for(n=0;n<uc.length;n++)Re(uc[n],t);break;case"source":Re("error",t);break;case"img":case"image":case"link":Re("error",t),Re("load",t);break;case"details":Re("toggle",t);break;case"input":Re("invalid",t),Qx(t,a.value,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name,!0);break;case"select":Re("invalid",t);break;case"textarea":Re("invalid",t),Fx(t,a.value,a.defaultValue,a.children)}n=a.children,typeof n!="string"&&typeof n!="number"&&typeof n!="bigint"||t.textContent===""+n||a.suppressHydrationWarning===!0||Ww(t.textContent,n)?(a.popover!=null&&(Re("beforetoggle",t),Re("toggle",t)),a.onScroll!=null&&Re("scroll",t),a.onScrollEnd!=null&&Re("scrollend",t),a.onClick!=null&&(t.onclick=li),t=!0):t=!1,t||Or(e,!0)}function Bu(e){for(tn=e.return;tn;)switch(tn.tag){case 5:case 31:case 13:Ta=!1;return;case 27:case 3:Ta=!0;return;default:tn=tn.return}}function is(e){if(e!==tn)return!1;if(!Ne)return Bu(e),Ne=!0,!1;var t=e.tag,n;if((n=t!==3&&t!==27)&&((n=t===5)&&(n=e.type,n=!(n!=="form"&&n!=="button")||th(e.type,e.memoizedProps)),n=!n),n&&ct&&Or(e),Bu(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(I(317));ct=dx(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(I(317));ct=dx(e)}else t===27?(t=ct,qr(e.type)?(e=rh,rh=null,ct=e):ct=t):ct=tn?Ea(e.stateNode.nextSibling):null;return!0}function bo(){ct=tn=null,Ne=!1}function Im(){var e=wr;return e!==null&&(Hn===null?Hn=e:Hn.push.apply(Hn,e),wr=null),e}function sc(e){wr===null?wr=[e]:wr.push(e)}var vg=mi(null),Co=null,_i=null;function hr(e,t,n){dt(vg,t._currentValue),t._currentValue=n}function Di(e){e._currentValue=vg.current,ln(vg)}function xu(e,t,n){for(;e!==null;){var a=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,a!==null&&(a.childLanes|=t)):a!==null&&(a.childLanes&t)!==t&&(a.childLanes|=t),e===n)break;e=e.return}}function yg(e,t,n,a){var i=e.child;for(i!==null&&(i.return=e);i!==null;){var r=i.dependencies;if(r!==null){var o=i.child;r=r.firstContext;e:for(;r!==null;){var s=r;r=i;for(var l=0;l<t.length;l++)if(s.context===t[l]){r.lanes|=n,s=r.alternate,s!==null&&(s.lanes|=n),xu(r.return,n,e),a||(o=null);break e}r=s.next}}else if(i.tag===18){if(o=i.return,o===null)throw Error(I(341));o.lanes|=n,r=o.alternate,r!==null&&(r.lanes|=n),xu(o,n,e),o=null}else i.tag===13&&i.memoizedState!==null&&i.memoizedState.dehydrated===null?(i.lanes|=n,o=i.alternate,o!==null&&(o.lanes|=n),xu(i.return,n,e),o=i.child,o=o!==null?o.sibling:null):o=i.child;if(o!==null)o.return=i;else for(o=i;o!==null;){if(o===e){o=null;break}if(i=o.sibling,i!==null){i.return=o.return,o=i;break}o=o.return}i=o}}function vo(e,t,n,a){e=null;for(var i=t,r=!1;i!==null;){if(!r){if((i.flags&524288)!==0)r=!0;else if((i.flags&262144)!==0)break}if(i.tag===10){var o=i.alternate;if(o===null)throw Error(I(387));if(o=o.memoizedProps,o!==null){var s=i.type;sa(i.pendingProps.value,o.value)||(e!==null?e.push(s):e=[s])}}else if(i===Du.current){if(o=i.alternate,o===null)throw Error(I(387));o.memoizedState.memoizedState!==i.memoizedState.memoizedState&&(e!==null?e.push(Ps):e=[Ps])}i=i.return}return e!==null&&yg(t,e,n,a),t.flags|=262144,e!==null}function ju(e){for(e=e.firstContext;e!==null;){if(!sa(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function yo(e){Co=e,_i=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function sn(e){return v1(Co,e)}function nu(e,t){return Co===null&&yo(e),v1(e,t)}function v1(e,t){var n=t._currentValue;if(t={context:t,memoizedValue:n,next:null},_i===null){if(e===null)throw Error(I(308));_i=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else _i=_i.next=t;return n}var xC=typeof AbortController<"u"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(n,a){e.push(a)}};this.abort=function(){t.aborted=!0,e.forEach(function(n){return n()})}},wC=Xt.unstable_scheduleCallback,SC=Xt.unstable_NormalPriority,It={$$typeof:si,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function Nh(){return{controller:new xC,data:new Map,refCount:0}}function Nc(e){e.refCount--,e.refCount===0&&wC(SC,function(){e.controller.abort()})}function g0(e,t){if((e.pendingLanes&4194048)!==0){var n=e.transitionTypes;for(n===null&&(n=e.transitionTypes=[]),e=0;e<t.length;e++){var a=t[e];n.indexOf(a)===-1&&n.push(a)}}}var Pl=null;function kC(e){var t=e.transitionTypes;return e.transitionTypes=null,t}var Xl=null,xg=0,xo=0,Ns=null;function NC(e,t){if(Xl===null){var n=Xl=[];xg=0,xo=$h(),Ns={status:"pending",value:void 0,then:function(a){n.push(a)}}}return xg++,t.then(h0,h0),t}function h0(){if(--xg===0&&(Pl=null,Xl!==null)){Ns!==null&&(Ns.status="fulfilled");var e=Xl;Xl=null,xo=0,Ns=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function TC(e,t){var n=[],a={status:"pending",value:null,reason:null,then:function(i){n.push(i)}};return e.then(function(){a.status="fulfilled",a.value=t;for(var i=0;i<n.length;i++)(0,n[i])(t)},function(i){for(a.status="rejected",a.reason=i,i=0;i<n.length;i++)(0,n[i])(void 0)}),a}var b0=pe.S;pe.S=function(e,t){if(qw=aa(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&NC(e,t),Pl!==null)for(var n=Hs;n!==null;)g0(n,Pl),n=n.next;if(n=e.types,n!==null){for(var a=Hs;a!==null;)g0(a,n),a=a.next;if(xo!==0){a=Pl,a===null&&(a=Pl=[]);for(var i=0;i<n.length;i++){var r=n[i];a.indexOf(r)===-1&&a.push(r)}}}b0!==null&&b0(e,t)};var mo=mi(null);function Th(){var e=mo.current;return e!==null?e:it.pooledCache}function wu(e,t){t===null?dt(mo,mo.current):dt(mo,t.pool)}function y1(){var e=Th();return e===null?null:{parent:It._currentValue,pool:e}}var Xs=Error(I(460)),Eh=Error(I(474)),vf=Error(I(542)),Gu={then:function(){}};function v0(e){return e=e.status,e==="fulfilled"||e==="rejected"}function x1(e,t,n){switch(n=e[n],n===void 0?e.push(t):n!==t&&(t.then(li,li),t=n),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,x0(e),e===void 0&&!("reason"in t)?Error(I(600)):e;default:if(typeof t.status=="string")t.then(li,li);else{if(e=it,e!==null&&100<e.shellSuspendCounter)throw Error(I(482));e=t,e.status="pending",e.then(function(a){if(t.status==="pending"){var i=t;i.status="fulfilled",i.value=a}},function(a){if(t.status==="pending"){var i=t;i.status="rejected",i.reason=a}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,x0(e),e}throw go=t,Xs}}function so(e){try{var t=e._init;return t(e._payload)}catch(n){throw n!==null&&typeof n=="object"&&typeof n.then=="function"?(go=n,Xs):n}}var go=null;function y0(){if(go===null)throw Error(I(459));var e=go;return go=null,e}function x0(e){if(e===Xs||e===vf)throw Error(I(483))}var Ts=null,lc=0;function au(e){var t=lc;return lc+=1,Ts===null&&(Ts=[]),x1(Ts,e,t)}function lr(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function iu(e,t){throw t.$$typeof===rR?Error(I(525)):(e=Object.prototype.toString.call(t),Error(I(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function w1(e){function t(p,m){if(e){var b=p.deletions;b===null?(p.deletions=[m],p.flags|=16):b.push(m)}}function n(p,m){if(!e)return null;for(;m!==null;)t(p,m),m=m.sibling;return null}function a(p){for(var m=new Map;p!==null;)p.key===null?m.set(p.index,p):m.set(p.key,p),p=p.sibling;return m}function i(p,m){return p=zi(p,m),p.index=0,p.sibling=null,p}function r(p,m,b){return p.index=b,e?(b=p.alternate,b!==null?(b=b.index,b<m?(p.flags|=2,m):b):(p.flags|=134217730,m)):(p.flags|=1048576,m)}function o(p){return e&&p.alternate===null&&(p.flags|=134217730),p}function s(p,m,b,y){return m===null||m.tag!==6?(m=zm(b,p.mode,y),m.return=p,m):(m=i(m,b),m.return=p,m)}function l(p,m,b,y){var N=b.type;return N===ds?(p=f(p,m,b.props.children,y,b.key),lr(p,b),p):m!==null&&(m.elementType===N||typeof N=="object"&&N!==null&&N.$$typeof===ur&&so(N)===m.type)?(m=i(m,b.props),lr(m,b),m.return=p,m):(m=yu(b.type,b.key,b.props,null,p.mode,y),lr(m,b),m.return=p,m)}function c(p,m,b,y){return m===null||m.tag!==4||m.stateNode.containerInfo!==b.containerInfo||m.stateNode.implementation!==b.implementation?(m=Dm(b,p.mode,y),m.return=p,m):(m=i(m,b.children||[]),m.return=p,m)}function f(p,m,b,y,N){return m===null||m.tag!==7?(m=po(b,p.mode,y,N),m.return=p,m):(m=i(m,b),m.return=p,m)}function v(p,m,b){if(typeof m=="string"&&m!==""||typeof m=="number"||typeof m=="bigint")return m=zm(""+m,p.mode,b),m.return=p,m;if(typeof m=="object"&&m!==null){switch(m.$$typeof){case Kd:return b=yu(m.type,m.key,m.props,null,p.mode,b),lr(b,m),b.return=p,b;case Hl:return m=Dm(m,p.mode,b),m.return=p,m;case ur:return m=so(m),v(p,m,b)}if(Vl(m)||_l(m))return m=po(m,p.mode,b,null),m.return=p,m;if(typeof m.then=="function")return v(p,au(m),b);if(m.$$typeof===si)return v(p,nu(p,m),b);iu(p,m)}return null}function g(p,m,b,y){var N=m!==null?m.key:null;if(typeof b=="string"&&b!==""||typeof b=="number"||typeof b=="bigint")return N!==null?null:s(p,m,""+b,y);if(typeof b=="object"&&b!==null){switch(b.$$typeof){case Kd:return b.key===N?l(p,m,b,y):null;case Hl:return b.key===N?c(p,m,b,y):null;case ur:return b=so(b),g(p,m,b,y)}if(Vl(b)||_l(b))return N!==null?null:f(p,m,b,y,null);if(typeof b.then=="function")return g(p,m,au(b),y);if(b.$$typeof===si)return g(p,m,nu(p,b),y);iu(p,b)}return null}function h(p,m,b,y,N){if(typeof y=="string"&&y!==""||typeof y=="number"||typeof y=="bigint")return p=p.get(b)||null,s(m,p,""+y,N);if(typeof y=="object"&&y!==null){switch(y.$$typeof){case Kd:return p=p.get(y.key===null?b:y.key)||null,l(m,p,y,N);case Hl:return p=p.get(y.key===null?b:y.key)||null,c(m,p,y,N);case ur:return y=so(y),h(p,m,b,y,N)}if(Vl(y)||_l(y))return p=p.get(b)||null,f(m,p,y,N,null);if(typeof y.then=="function")return h(p,m,b,au(y),N);if(y.$$typeof===si)return h(p,m,b,nu(m,y),N);iu(m,y)}return null}function w(p,m,b,y){for(var N=null,D=null,O=m,T=m=0,q=null;O!==null&&T<b.length;T++){O.index>T?(q=O,O=null):q=O.sibling;var $=g(p,O,b[T],y);if($===null){O===null&&(O=q);break}e&&O&&$.alternate===null&&t(p,O),m=r($,m,T),D===null?N=$:D.sibling=$,D=$,O=q}if(T===b.length)return n(p,O),Ne&&Oi(p,T),N;if(O===null){for(;T<b.length;T++)O=v(p,b[T],y),O!==null&&(m=r(O,m,T),D===null?N=O:D.sibling=O,D=O);return Ne&&Oi(p,T),N}for(O=a(O);T<b.length;T++)q=h(O,p,T,b[T],y),q!==null&&(e&&($=q.alternate,$!==null&&O.delete($.key===null?T:$.key)),m=r(q,m,T),D===null?N=q:D.sibling=q,D=q);return e&&O.forEach(function(F){return t(p,F)}),Ne&&Oi(p,T),N}function x(p,m,b,y){if(b==null)throw Error(I(151));for(var N=null,D=null,O=m,T=m=0,q=null,$=b.next();O!==null&&!$.done;T++,$=b.next()){O.index>T?(q=O,O=null):q=O.sibling;var F=g(p,O,$.value,y);if(F===null){O===null&&(O=q);break}e&&O&&F.alternate===null&&t(p,O),m=r(F,m,T),D===null?N=F:D.sibling=F,D=F,O=q}if($.done)return n(p,O),Ne&&Oi(p,T),N;if(O===null){for(;!$.done;T++,$=b.next())$=v(p,$.value,y),$!==null&&(m=r($,m,T),D===null?N=$:D.sibling=$,D=$);return Ne&&Oi(p,T),N}for(O=a(O);!$.done;T++,$=b.next())$=h(O,p,T,$.value,y),$!==null&&(e&&(q=$.alternate,q!==null&&O.delete(q.key===null?T:q.key)),m=r($,m,T),D===null?N=$:D.sibling=$,D=$);return e&&O.forEach(function(Ie){return t(p,Ie)}),Ne&&Oi(p,T),N}function C(p,m,b,y){if(typeof b=="object"&&b!==null&&b.type===ds&&b.key===null&&b.props.ref===void 0&&(b=b.props.children),typeof b=="object"&&b!==null){switch(b.$$typeof){case Kd:e:{for(var N=b.key;m!==null;){if(m.key===N){if(N=b.type,N===ds){if(m.tag===7){n(p,m.sibling),y=i(m,b.props.children),lr(y,b),y.return=p,p=y;break e}}else if(m.elementType===N||typeof N=="object"&&N!==null&&N.$$typeof===ur&&so(N)===m.type){n(p,m.sibling),y=i(m,b.props),lr(y,b),y.return=p,p=y;break e}n(p,m);break}else t(p,m);m=m.sibling}b.type===ds?(y=po(b.props.children,p.mode,y,b.key),lr(y,b),y.return=p,p=y):(y=yu(b.type,b.key,b.props,null,p.mode,y),lr(y,b),y.return=p,p=y)}return o(p);case Hl:e:{for(N=b.key;m!==null;){if(m.key===N)if(m.tag===4&&m.stateNode.containerInfo===b.containerInfo&&m.stateNode.implementation===b.implementation){n(p,m.sibling),y=i(m,b.children||[]),y.return=p,p=y;break e}else{n(p,m);break}else t(p,m);m=m.sibling}y=Dm(b,p.mode,y),y.return=p,p=y}return o(p);case ur:return b=so(b),C(p,m,b,y)}if(Vl(b))return w(p,m,b,y);if(_l(b)){if(N=_l(b),typeof N!="function")throw Error(I(150));return b=N.call(b),x(p,m,b,y)}if(typeof b.then=="function")return C(p,m,au(b),y);if(b.$$typeof===si)return C(p,m,nu(p,b),y);iu(p,b)}return typeof b=="string"&&b!==""||typeof b=="number"||typeof b=="bigint"?(b=""+b,m!==null&&m.tag===6?(n(p,m.sibling),y=i(m,b),y.return=p,p=y):(n(p,m),y=zm(b,p.mode,y),y.return=p,p=y),o(p)):n(p,m)}return function(p,m,b,y){try{lc=0;var N=C(p,m,b,y);return Ts=null,N}catch(O){if(O===Xs||O===vf)throw O;var D=Un(29,O,null,p.mode);return D.lanes=y,D.return=p,D}}}var wo=w1(!0),S1=w1(!1),fr=!1;function Mh(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function wg(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function Sr(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function kr(e,t,n){var a=e.updateQueue;if(a===null)return null;if(a=a.shared,(Pe&2)!==0){var i=a.pending;return i===null?t.next=t:(t.next=i.next,i.next=t),a.pending=t,t=Uu(e),p1(e,null,n),t}return hf(e,a,t,n),Uu(e)}function Ql(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,(n&4194048)!==0)){var a=t.lanes;a&=e.pendingLanes,n|=a,t.lanes=n,Vx(e,n)}}function qm(e,t){var n=e.updateQueue,a=e.alternate;if(a!==null&&(a=a.updateQueue,n===a)){var i=null,r=null;if(n=n.firstBaseUpdate,n!==null){do{var o={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};r===null?i=r=o:r=r.next=o,n=n.next}while(n!==null);r===null?i=r=t:r=r.next=t}else i=r=t;n={baseState:a.baseState,firstBaseUpdate:i,lastBaseUpdate:r,shared:a.shared,callbacks:a.callbacks},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}var Sg=!1;function Kl(){if(Sg){var e=Ns;if(e!==null)throw e}}function Fl(e,t,n,a){Sg=!1;var i=e.updateQueue;fr=!1;var r=i.firstBaseUpdate,o=i.lastBaseUpdate,s=i.shared.pending;if(s!==null){i.shared.pending=null;var l=s,c=l.next;l.next=null,o===null?r=c:o.next=c,o=l;var f=e.alternate;f!==null&&(f=f.updateQueue,s=f.lastBaseUpdate,s!==o&&(s===null?f.firstBaseUpdate=c:s.next=c,f.lastBaseUpdate=l))}if(r!==null){var v=i.baseState;o=0,f=c=l=null,s=r;do{var g=s.lane&-536870913,h=g!==s.lane;if(h?(_e&g)===g:(a&g)===g){g!==0&&g===xo&&(Sg=!0),f!==null&&(f=f.next={lane:0,tag:s.tag,payload:s.payload,callback:null,next:null});e:{var w=e,x=s;g=t;var C=n;switch(x.tag){case 1:if(w=x.payload,typeof w=="function"){v=w.call(C,v,g);break e}v=w;break e;case 3:w.flags=w.flags&-65537|128;case 0:if(w=x.payload,g=typeof w=="function"?w.call(C,v,g):w,g==null)break e;v=rt({},v,g);break e;case 2:fr=!0}}g=s.callback,g!==null&&(e.flags|=64,h&&(e.flags|=8192),h=i.callbacks,h===null?i.callbacks=[g]:h.push(g))}else h={lane:g,tag:s.tag,payload:s.payload,callback:s.callback,next:null},f===null?(c=f=h,l=v):f=f.next=h,o|=g;if(s=s.next,s===null){if(s=i.shared.pending,s===null)break;h=s,s=h.next,h.next=null,i.lastBaseUpdate=h,i.shared.pending=null}}while(!0);f===null&&(l=v),i.baseState=l,i.firstBaseUpdate=c,i.lastBaseUpdate=f,r===null&&(i.shared.lanes=0),Dr|=o,e.lanes=o,e.memoizedState=v}}function k1(e,t){if(typeof e!="function")throw Error(I(191,e));e.call(t)}function N1(e,t){var n=e.callbacks;if(n!==null)for(e.callbacks=null,e=0;e<n.length;e++)k1(n[e],t)}var _r=mi(null),Yu=mi(0);function w0(e,t){e=Ui,dt(Yu,e),dt(_r,t),Ui=e|t.baseLanes}function kg(){dt(Yu,Ui),dt(_r,_r.current)}function Rh(){Ui=Yu.current,ln(_r),ln(Yu)}var un=mi(null),hn=null;function Nr(e){var t=e.alternate;dt(cn,cn.current&1),dt(un,e),hn===null&&(t===null||_r.current!==null||t.memoizedState!==null)&&(hn=e)}function Ng(e){dt(cn,cn.current),dt(un,e),hn===null&&(hn=e)}function T1(e){e.tag===22?(dt(cn,cn.current),dt(un,e),hn===null&&(hn=e)):Tr()}function Tr(){dt(cn,cn.current),dt(un,un.current)}function ea(e){ln(un),hn===e&&(hn=null),ln(cn)}var cn=mi(0);function cc(e,t){dt(un,un.current),dt(cn,t)}function Ch(e){ln(cn),ln(un),hn===e&&(hn=null)}function Xu(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||ih(n)||nb(n)))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!=="independent"){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var Li=0,we=null,We=null,Dt=null,Qu=!1,Es=!1,So=!1,Ku=0,dc=0,Ms=null,EC=0;function Mt(){throw Error(I(321))}function Ah(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!sa(e[n],t[n]))return!1;return!0}function Oh(e,t,n,a,i,r){return Li=r,we=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,pe.H=e===null||e.memoizedState===null?nw:aw,So=!1,r=n(a,i),So=!1,Es&&(r=M1(t,n,a,i)),E1(e),r}function E1(e){pe.H=Fu;var t=We!==null&&We.next!==null;if(Li=0,Dt=We=we=null,Qu=!1,dc=0,Ms=null,t)throw Error(I(300));e===null||qt||(e=e.dependencies,e!==null&&ju(e)&&(qt=!0))}function M1(e,t,n,a){we=e;var i=0;do{if(Es&&(Ms=null),dc=0,Es=!1,25<=i)throw Error(I(301));if(i+=1,Dt=We=null,e.updateQueue!=null){var r=e.updateQueue;r.lastEffect=null,r.events=null,r.stores=null,r.memoCache!=null&&(r.memoCache.index=0)}pe.H=DC,r=t(n,a)}while(Es);return r}function MC(){var e=pe.H,t=e.useState()[0];return t=typeof t.then=="function"?Tc(t):t,e=e.useState()[0],(We!==null?We.memoizedState:null)!==e&&(we.flags|=1024),t}function _h(){var e=Ku!==0;return Ku=0,e}function zh(e,t,n){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~n}function Dh(e){if(Qu){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}Qu=!1}Li=0,Dt=We=we=null,Es=!1,dc=Ku=0,Ms=null}function Cn(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Dt===null?we.memoizedState=Dt=e:Dt=Dt.next=e,Dt}function Ot(){if(We===null){var e=we.alternate;e=e!==null?e.memoizedState:null}else e=We.next;var t=Dt===null?we.memoizedState:Dt.next;if(t!==null)Dt=t,We=e;else{if(e===null)throw we.alternate===null?Error(I(467)):Error(I(310));We=e,e={memoizedState:We.memoizedState,baseState:We.baseState,baseQueue:We.baseQueue,queue:We.queue,next:null},Dt===null?we.memoizedState=Dt=e:Dt=Dt.next=e}return Dt}function yf(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Tc(e){var t=dc;return dc+=1,Ms===null&&(Ms=[]),e=x1(Ms,e,t),t=we,(Dt===null?t.memoizedState:Dt.next)===null&&(t=t.alternate,pe.H=t===null||t.memoizedState===null?nw:aw),e}function xf(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return Tc(e);if(e.$$typeof===lR)return;if(e.$$typeof===si)return sn(e)}throw Error(I(438,String(e)))}function Ih(e){var t=null,n=we.updateQueue;if(n!==null&&(t=n.memoCache),t==null){var a=we.alternate;a!==null&&(a=a.updateQueue,a!==null&&(a=a.memoCache,a!=null&&(t={data:a.data.map(function(i){return i.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),n===null&&(n=yf(),we.updateQueue=n),n.memoCache=t,n=t.data[t.index],n===void 0)for(n=t.data[t.index]=Array(e),a=0;a<e;a++)n[a]=sR;return t.index++,n}function Hi(e,t){return typeof t=="function"?t(e):t}function Su(e){var t=Ot();return qh(t,We,e)}function qh(e,t,n){var a=e.queue;if(a===null)throw Error(I(311));a.lastRenderedReducer=n;var i=e.baseQueue,r=a.pending;if(r!==null){if(i!==null){var o=i.next;i.next=r.next,r.next=o}t.baseQueue=i=r,a.pending=null}if(r=e.baseState,i===null)e.memoizedState=r;else{t=i.next;var s=o=null,l=null,c=t,f=!1;do{var v=c.lane&-536870913;if(v!==c.lane?(_e&v)===v:(Li&v)===v){var g=c.revertLane;if(g===0)l!==null&&(l=l.next={lane:0,revertLane:0,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),v===xo&&(f=!0);else if((Li&g)===g){c=c.next,g===xo&&(f=!0);continue}else v={lane:0,revertLane:c.revertLane,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},l===null?(s=l=v,o=r):l=l.next=v,we.lanes|=g,Dr|=g;v=c.action,So&&n(r,v),r=c.hasEagerState?c.eagerState:n(r,v)}else g={lane:v,revertLane:c.revertLane,gesture:c.gesture,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},l===null?(s=l=g,o=r):l=l.next=g,we.lanes|=v,Dr|=v;c=c.next}while(c!==null&&c!==t);if(l===null?o=r:l.next=s,!sa(r,e.memoizedState)&&(qt=!0,f&&(n=Ns,n!==null)))throw n;e.memoizedState=r,e.baseState=o,e.baseQueue=l,a.lastRenderedState=r}return i===null&&(a.lanes=0),[e.memoizedState,a.dispatch]}function Lm(e){var t=Ot(),n=t.queue;if(n===null)throw Error(I(311));n.lastRenderedReducer=e;var a=n.dispatch,i=n.pending,r=t.memoizedState;if(i!==null){n.pending=null;var o=i=i.next;do r=e(r,o.action),o=o.next;while(o!==i);sa(r,t.memoizedState)||(qt=!0),t.memoizedState=r,t.baseQueue===null&&(t.baseState=r),n.lastRenderedState=r}return[r,a]}function R1(e,t,n){var a=we,i=Ot(),r=Ne;if(r){if(n===void 0)throw Error(I(407));n=n()}else n=t();var o=!sa((We||i).memoizedState,n);if(o&&(i.memoizedState=n,qt=!0),i=i.queue,Lh(O1.bind(null,a,i,e),[e]),e=i.getSnapshot!==t||o||Dt!==null&&(Dt.memoizedState.tag&1)!==0,Ds(e?9:8,{destroy:void 0},A1.bind(null,a,i,n,t),null),e){if(a.flags|=2048,it===null)throw Error(I(349));r||(Li&127)!==0||C1(a,t,n)}return n}function C1(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=we.updateQueue,t===null?(t=yf(),we.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function A1(e,t,n,a){t.value=n,t.getSnapshot=a,_1(t)&&z1(e)}function O1(e,t,n){return n(function(){_1(t)&&z1(e)})}function _1(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!sa(e,n)}catch{return!0}}function z1(e){var t=Ro(e,2);t!==null&&Pn(t,e,2)}function Tg(e){var t=Cn();if(typeof e=="function"){var n=e;if(e=n(),So){mr(!0);try{n()}finally{mr(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Hi,lastRenderedState:e},t}function D1(e,t,n,a){return e.baseState=n,qh(e,We,typeof a=="function"?a:Hi)}function RC(e,t,n,a,i){if(Sf(e))throw Error(I(485));if(e=t.action,e!==null){var r={payload:i,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(o){r.listeners.push(o)}};pe.T!==null?n(!0):r.isTransition=!1,a(r),n=t.pending,n===null?(r.next=t.pending=r,I1(t,r)):(r.next=n.next,t.pending=n.next=r)}}function I1(e,t){var n=t.action,a=t.payload,i=e.state;if(t.isTransition){var r=pe.T,o={};o.types=r!==null?r.types:null,pe.T=o;try{var s=n(i,a),l=pe.S;l!==null&&l(o,s),S0(e,t,s)}catch(c){Eg(e,t,c)}finally{r!==null&&o.types!==null&&(r.types=o.types),pe.T=r}}else try{r=n(i,a),S0(e,t,r)}catch(c){Eg(e,t,c)}}function S0(e,t,n){n!==null&&typeof n=="object"&&typeof n.then=="function"?n.then(function(a){k0(e,t,a)},function(a){return Eg(e,t,a)}):k0(e,t,n)}function k0(e,t,n){t.status="fulfilled",t.value=n,q1(t),e.state=n,t=e.pending,t!==null&&(n=t.next,n===t?e.pending=null:(n=n.next,t.next=n,I1(e,n)))}function Eg(e,t,n){var a=e.pending;if(e.pending=null,a!==null){a=a.next;do t.status="rejected",t.reason=n,q1(t),t=t.next;while(t!==a)}e.action=null}function q1(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function L1(e,t){return t}function N0(e,t){if(Ne){var n=it.formState;if(n!==null){e:{var a=we;if(Ne){if(ct){t:{for(var i=ct,r=Ta;i.nodeType!==8;){if(!r){i=null;break t}if(i=Ea(i.nextSibling),i===null){i=null;break t}}r=i.data,i=r==="F!"||r==="F"?i:null}if(i){ct=Ea(i.nextSibling),a=i.data==="F!";break e}}Or(a)}a=!1}a&&(t=n[0])}}return n=Cn(),n.memoizedState=n.baseState=t,a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:L1,lastRenderedState:t},n.queue=a,n=W1.bind(null,we,a),a.dispatch=n,a=Tg(!1),r=Ph.bind(null,we,!1,a.queue),a=Cn(),i={state:t,dispatch:null,action:e,pending:null},a.queue=i,n=RC.bind(null,we,i,r,n),i.dispatch=n,a.memoizedState=e,[t,n,!1]}function T0(e){var t=Ot();return H1(t,We,e)}function H1(e,t,n){if(t=qh(e,t,L1)[0],e=Su(Hi)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var a=Tc(t)}catch(o){throw o===Xs?vf:o}else a=t;t=Ot();var i=t.queue,r=i.dispatch;return n!==t.memoizedState&&(we.flags|=2048,Ds(9,{destroy:void 0},CC.bind(null,i,n),null)),[a,r,e]}function CC(e,t){e.action=t}function E0(e){var t=Ot(),n=We;if(n!==null)return H1(t,n,e);Ot(),t=t.memoizedState,n=Ot();var a=n.queue.dispatch;return n.memoizedState=e,[t,a,!1]}function Ds(e,t,n,a){return e={tag:e,create:n,deps:a,inst:t,next:null},t=we.updateQueue,t===null&&(t=yf(),we.updateQueue=t),n=t.lastEffect,n===null?t.lastEffect=e.next=e:(a=n.next,n.next=e,e.next=a,t.lastEffect=e),e}function V1(){return Ot().memoizedState}function ku(e,t,n,a){var i=Cn();we.flags|=e,i.memoizedState=Ds(1|t,{destroy:void 0},n,a===void 0?null:a)}function wf(e,t,n,a){var i=Ot();a=a===void 0?null:a;var r=i.memoizedState.inst;We!==null&&a!==null&&Ah(a,We.memoizedState.deps)?i.memoizedState=Ds(t,r,n,a):(we.flags|=e,i.memoizedState=Ds(1|t,r,n,a))}function M0(e,t){ku(8390656,8,e,t)}function Lh(e,t){wf(2048,8,e,t)}function AC(e){we.flags|=4;var t=we.updateQueue;if(t===null)t=yf(),we.updateQueue=t,t.events=[e];else{var n=t.events;n===null?t.events=[e]:n.push(e)}}function U1(e){var t=Ot().memoizedState;return AC({ref:t,nextImpl:e}),function(){if((Pe&2)!==0)throw Error(I(440));return t.impl.apply(void 0,arguments)}}function P1(e,t){return wf(4,2,e,t)}function B1(e,t){return wf(4,4,e,t)}function j1(e,t){if(typeof t=="function"){e=e();var n=t(e);return function(){typeof n=="function"?n():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function G1(e,t,n){n=n!=null?n.concat([e]):null,wf(4,4,j1.bind(null,t,e),n)}function Hh(){}function Y1(e,t){var n=Ot();t=t===void 0?null:t;var a=n.memoizedState;return t!==null&&Ah(t,a[1])?a[0]:(n.memoizedState=[e,t],e)}function X1(e,t){var n=Ot();t=t===void 0?null:t;var a=n.memoizedState;if(t!==null&&Ah(t,a[1]))return a[0];if(a=e(),So){mr(!0);try{e()}finally{mr(!1)}}return n.memoizedState=[a,t],a}function Vh(e,t,n){return n===void 0||(Li&1073741824)!==0&&(_e&261930)===0?e.memoizedState=t:(e.memoizedState=n,e=Hw(),we.lanes|=e,Dr|=e,n)}function Q1(e,t,n,a){return sa(n,t)?n:_r.current!==null?(e=Vh(e,n,a),sa(e,t)||(qt=!0),e):(Li&106)===0||(Li&1073741824)!==0&&(_e&261930)===0?(qt=!0,e.memoizedState=n):(e=Hw(),we.lanes|=e,Dr|=e,t)}function K1(e,t,n,a,i){var r=Be.p;Be.p=r!==0&&8>r?r:8;var o=pe.T,s={};s.types=o!==null?o.types:null,pe.T=s,Ph(e,!1,t,n);try{var l=i(),c=pe.S;if(c!==null&&c(s,l),l!==null&&typeof l=="object"&&typeof l.then=="function"){var f=TC(l,a);Zl(e,t,f,oa(e))}else Zl(e,t,a,oa(e))}catch(v){Zl(e,t,{then:function(){},status:"rejected",reason:v},oa())}finally{Be.p=r,o!==null&&s.types!==null&&(o.types=s.types),pe.T=o}}function OC(){}function Mg(e,t,n,a){if(e.tag!==5)throw Error(I(476));var i=F1(e).queue;K1(e,i,t,fo,n===null?OC:function(){return Z1(e),n(a)})}function F1(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:fo,baseState:fo,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Hi,lastRenderedState:fo},next:null};var n={};return t.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Hi,lastRenderedState:n},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function Z1(e){var t=F1(e);t.next===null&&(t=e.alternate.memoizedState),Zl(e,t.next.queue,{},oa())}function Uh(){return sn(Ps)}function J1(){return Ot().memoizedState}function $1(){return Ot().memoizedState}function _C(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var n=oa();e=Sr(n);var a=kr(t,e,n);a!==null&&(Pn(a,t,n),Ql(a,t,n)),t={cache:Nh()},e.payload=t;return}t=t.return}}function zC(e,t,n){var a=oa();n={lane:a,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},Sf(e)?ew(t,n):(n=wh(e,t,n,a),n!==null&&(Pn(n,e,a),tw(n,t,a)))}function W1(e,t,n){var a=oa();Zl(e,t,n,a)}function Zl(e,t,n,a){var i={lane:a,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(Sf(e))ew(t,i);else{var r=e.alternate;if(e.lanes===0&&(r===null||r.lanes===0)&&(r=t.lastRenderedReducer,r!==null))try{var o=t.lastRenderedState,s=r(o,n);if(i.hasEagerState=!0,i.eagerState=s,sa(s,o))return hf(e,t,i,0),it===null&&gf(),!1}catch{}if(n=wh(e,t,i,a),n!==null)return Pn(n,e,a),tw(n,t,a),!0}return!1}function Ph(e,t,n,a){if(a={lane:2,revertLane:$h(),gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},Sf(e)){if(t)throw Error(I(479))}else t=wh(e,n,a,2),t!==null&&Pn(t,e,2)}function Sf(e){var t=e.alternate;return e===we||t!==null&&t===we}function ew(e,t){Es=Qu=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function tw(e,t,n){if((n&4194048)!==0){var a=t.lanes;a&=e.pendingLanes,n|=a,t.lanes=n,Vx(e,n)}}var Fu={readContext:sn,use:xf,useCallback:Mt,useContext:Mt,useEffect:Mt,useImperativeHandle:Mt,useLayoutEffect:Mt,useInsertionEffect:Mt,useMemo:Mt,useReducer:Mt,useRef:Mt,useState:Mt,useDebugValue:Mt,useDeferredValue:Mt,useTransition:Mt,useSyncExternalStore:Mt,useId:Mt,useHostTransitionStatus:Mt,useFormState:Mt,useActionState:Mt,useOptimistic:Mt,useMemoCache:Mt,useCacheRefresh:Mt,useEffectEvent:Mt},nw={readContext:sn,use:xf,useCallback:function(e,t){return Cn().memoizedState=[e,t===void 0?null:t],e},useContext:sn,useEffect:M0,useImperativeHandle:function(e,t,n){n=n!=null?n.concat([e]):null,ku(4194308,4,j1.bind(null,t,e),n)},useLayoutEffect:function(e,t){return ku(4194308,4,e,t)},useInsertionEffect:function(e,t){ku(4,2,e,t)},useMemo:function(e,t){var n=Cn();t=t===void 0?null:t;var a=e();if(So){mr(!0);try{e()}finally{mr(!1)}}return n.memoizedState=[a,t],a},useReducer:function(e,t,n){var a=Cn();if(n!==void 0){var i=n(t);if(So){mr(!0);try{n(t)}finally{mr(!1)}}}else i=t;return a.memoizedState=a.baseState=i,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:i},a.queue=e,e=e.dispatch=zC.bind(null,we,e),[a.memoizedState,e]},useRef:function(e){var t=Cn();return e={current:e},t.memoizedState=e},useState:function(e){e=Tg(e);var t=e.queue,n=W1.bind(null,we,t);return t.dispatch=n,[e.memoizedState,n]},useDebugValue:Hh,useDeferredValue:function(e,t){var n=Cn();return Vh(n,e,t)},useTransition:function(){var e=Tg(!1);return e=K1.bind(null,we,e.queue,!0,!1),Cn().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,n){var a=we,i=Cn();if(Ne){if(n===void 0)throw Error(I(407));n=n()}else{if(n=t(),it===null)throw Error(I(349));(_e&127)!==0||C1(a,t,n)}i.memoizedState=n;var r={value:n,getSnapshot:t};return i.queue=r,M0(O1.bind(null,a,r,e),[e]),a.flags|=2048,Ds(9,{destroy:void 0},A1.bind(null,a,r,n,t),null),n},useId:function(){var e=Cn(),t=it.identifierPrefix;if(Ne){var n=di,a=ci;n=(a&~(1<<32-ra(a)-1)).toString(32)+n,t="_"+t+"R_"+n,n=Ku++,0<n&&(t+="H"+n.toString(32)),t+="_"}else n=EC++,t="_"+t+"r_"+n.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:Uh,useFormState:N0,useActionState:N0,useOptimistic:function(e){var t=Cn();t.memoizedState=t.baseState=e;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=n,t=Ph.bind(null,we,!0,n),n.dispatch=t,[e,t]},useMemoCache:Ih,useCacheRefresh:function(){return Cn().memoizedState=_C.bind(null,we)},useEffectEvent:function(e){var t=Cn(),n={impl:e};return t.memoizedState=n,function(){if((Pe&2)!==0)throw Error(I(440));return n.impl.apply(void 0,arguments)}}},aw={readContext:sn,use:xf,useCallback:Y1,useContext:sn,useEffect:Lh,useImperativeHandle:G1,useInsertionEffect:P1,useLayoutEffect:B1,useMemo:X1,useReducer:Su,useRef:V1,useState:function(){return Su(Hi)},useDebugValue:Hh,useDeferredValue:function(e,t){var n=Ot();return Q1(n,We.memoizedState,e,t)},useTransition:function(){var e=Su(Hi)[0],t=Ot().memoizedState;return[typeof e=="boolean"?e:Tc(e),t]},useSyncExternalStore:R1,useId:J1,useHostTransitionStatus:Uh,useFormState:T0,useActionState:T0,useOptimistic:function(e,t){var n=Ot();return D1(n,We,e,t)},useMemoCache:Ih,useCacheRefresh:$1,useEffectEvent:U1},DC={readContext:sn,use:xf,useCallback:Y1,useContext:sn,useEffect:Lh,useImperativeHandle:G1,useInsertionEffect:P1,useLayoutEffect:B1,useMemo:X1,useReducer:Lm,useRef:V1,useState:function(){return Lm(Hi)},useDebugValue:Hh,useDeferredValue:function(e,t){var n=Ot();return We===null?Vh(n,e,t):Q1(n,We.memoizedState,e,t)},useTransition:function(){var e=Lm(Hi)[0],t=Ot().memoizedState;return[typeof e=="boolean"?e:Tc(e),t]},useSyncExternalStore:R1,useId:J1,useHostTransitionStatus:Uh,useFormState:E0,useActionState:E0,useOptimistic:function(e,t){var n=Ot();return We!==null?D1(n,We,e,t):(n.baseState=e,[e,n.queue.dispatch])},useMemoCache:Ih,useCacheRefresh:$1,useEffectEvent:U1};function Hm(e,t,n,a){t=e.memoizedState,n=n(a,t),n=n==null?t:rt({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var Rg={enqueueSetState:function(e,t,n){e=e._reactInternals;var a=oa(),i=Sr(a);i.payload=t,n!=null&&(i.callback=n),t=kr(e,i,a),t!==null&&(Pn(t,e,a),Ql(t,e,a))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var a=oa(),i=Sr(a);i.tag=1,i.payload=t,n!=null&&(i.callback=n),t=kr(e,i,a),t!==null&&(Pn(t,e,a),Ql(t,e,a))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=oa(),a=Sr(n);a.tag=2,t!=null&&(a.callback=t),t=kr(e,a,n),t!==null&&(Pn(t,e,n),Ql(t,e,n))}};function R0(e,t,n,a,i,r,o){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(a,r,o):t.prototype&&t.prototype.isPureReactComponent?!rc(n,a)||!rc(i,r):!0}function C0(e,t,n,a){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(n,a),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(n,a),t.state!==e&&Rg.enqueueReplaceState(t,t.state,null)}function ko(e,t){var n=t;if("ref"in t){n={};for(var a in t)a!=="ref"&&(n[a]=t[a])}if(e=e.defaultProps){n===t&&(n=rt({},n));for(var i in e)n[i]===void 0&&(n[i]=e[i])}return n}function iw(e){Vu(e)}function rw(e){console.error(e)}function ow(e){Vu(e)}function Zu(e,t){try{var n=e.onUncaughtError;n(t.value,{componentStack:t.stack})}catch(a){setTimeout(function(){throw a})}}function A0(e,t,n){try{var a=e.onCaughtError;a(n.value,{componentStack:n.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(i){setTimeout(function(){throw i})}}function Cg(e,t,n){return n=Sr(n),n.tag=3,n.payload={element:null},n.callback=function(){Zu(e,t)},n}function sw(e){return e=Sr(e),e.tag=3,e}function lw(e,t,n,a){var i=n.type.getDerivedStateFromError;if(typeof i=="function"){var r=a.value;e.payload=function(){return i(r)},e.callback=function(){A0(t,n,a)}}var o=n.stateNode;o!==null&&typeof o.componentDidCatch=="function"&&(e.callback=function(){A0(t,n,a),typeof i!="function"&&(Er===null?Er=new Set([this]):Er.add(this));var s=a.stack;this.componentDidCatch(a.value,{componentStack:s!==null?s:""})})}function IC(e,t,n,a,i){if(n.flags|=32768,a!==null&&typeof a=="object"&&typeof a.then=="function"){if(t=n.alternate,t!==null&&vo(t,n,i,!0),n=un.current,n!==null){switch(n.tag){case 31:case 13:case 19:return hn===null?rf():n.alternate===null&&Rt===0&&(Rt=3),n.flags&=-257,n.flags|=65536,n.lanes=i,a===Gu?n.flags|=16384:(t=n.updateQueue,t===null?n.updateQueue=new Set([a]):t.add(a),Ym(e,a,i)),!1;case 22:return n.flags|=65536,a===Gu?n.flags|=16384:(t=n.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([a])},n.updateQueue=t):(n=t.retryQueue,n===null?t.retryQueue=new Set([a]):n.add(a)),Ym(e,a,i)),!1}throw Error(I(435,n.tag))}return Ym(e,a,i),rf(),!1}if(Ne)return t=un.current,t!==null?((t.flags&65536)===0&&(t.flags|=256),t.flags|=65536,t.lanes=i,a!==bg&&(e=Error(I(422),{cause:a}),sc(Na(e,n)))):(a!==bg&&(t=Error(I(423),{cause:a}),sc(Na(t,n))),e=e.current.alternate,e.flags|=65536,i&=-i,e.lanes|=i,a=Na(a,n),i=Cg(e.stateNode,a,i),qm(e,i),Rt!==4&&(Rt=2)),!1;var r=Error(I(520),{cause:a});if(r=Na(r,n),ec===null?ec=[r]:ec.push(r),Rt!==4&&(Rt=2),t===null)return!0;a=Na(a,n),n=t;do{switch(n.tag){case 3:return n.flags|=65536,e=i&-i,n.lanes|=e,e=Cg(n.stateNode,a,e),qm(n,e),!1;case 1:if(t=n.type,r=n.stateNode,(n.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||r!==null&&typeof r.componentDidCatch=="function"&&(Er===null||!Er.has(r))))return n.flags|=65536,i&=-i,n.lanes|=i,i=sw(i),lw(i,e,n,a),qm(n,i),!1;break;case 22:if(n.memoizedState!==null)return n.flags|=65536,!1}n=n.return}while(n!==null);return!1}var Bh=Error(I(461)),qt=!1;function Gt(e,t,n,a){t.child=e===null?S1(t,null,n,a):wo(t,e.child,n,a)}function O0(e,t,n,a,i){n=n.render;var r=t.ref;if("ref"in a){var o={};for(var s in a)s!=="ref"&&(o[s]=a[s])}else o=a;return yo(t),a=Oh(e,t,n,o,r,i),s=_h(),e!==null&&!qt?(zh(e,t,i),Vi(e,t,i)):(Ne&&s&&bf(t),t.flags|=1,Gt(e,t,a,i),t.child)}function _0(e,t,n,a,i){if(e===null){var r=n.type;return typeof r=="function"&&!Sh(r)&&r.defaultProps===void 0&&n.compare===null?(t.tag=15,t.type=r,cw(e,t,r,a,i)):(e=yu(n.type,null,a,t,t.mode,i),e.ref=t.ref,e.return=t,t.child=e)}if(r=e.child,!Gh(e,i)){var o=r.memoizedProps;if(n=n.compare,n=n!==null?n:rc,n(o,a)&&e.ref===t.ref)return Vi(e,t,i)}return t.flags|=1,e=zi(r,a),e.ref=t.ref,e.return=t,t.child=e}function cw(e,t,n,a,i){if(e!==null){var r=e.memoizedProps;if(rc(r,a)&&e.ref===t.ref)if(qt=!1,t.pendingProps=a=r,Gh(e,i))(e.flags&131072)!==0&&(qt=!0);else return t.lanes=e.lanes,Vi(e,t,i)}return Ag(e,t,n,a,i)}function dw(e,t,n,a){var i=a.children,r=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),a.mode==="hidden"){if((t.flags&128)!==0){if(r=r!==null?r.baseLanes|n:n,e!==null){for(a=t.child=e.child,i=0;a!==null;)i=i|a.lanes|a.childLanes,a=a.sibling;a=i&~r}else a=0,t.child=null;return z0(e,t,r,n,a)}if((n&536870912)!==0)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&wu(t,r!==null?r.cachePool:null),r!==null?w0(t,r):kg(),T1(t);else return a=t.lanes=536870912,z0(e,t,r!==null?r.baseLanes|n:n,n,a)}else r!==null?(wu(t,r.cachePool),w0(t,r),Tr(),t.memoizedState=null):(e!==null&&wu(t,null),kg(),Tr());return Gt(e,t,i,n),t.child}function Jl(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function z0(e,t,n,a,i){var r=Th();return r=r===null?null:{parent:It._currentValue,pool:r},t.memoizedState={baseLanes:n,cachePool:r},e!==null&&wu(t,null),kg(),T1(t),e!==null&&vo(e,t,a,!0),t.childLanes=i,null}function Nu(e,t){return t=kf({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function D0(e,t,n){return wo(t,e.child,null,n),e=Nu(t,t.pendingProps),e.flags|=2,ea(t),t.memoizedState=null,e}function qC(e,t,n){var a=t.pendingProps,i=(t.flags&128)!==0;if(t.flags&=-129,e===null){if(Ne){if(a.mode==="hidden")return e=Nu(t,a),t.lanes=536870912,e.memoizedState={baseLanes:0,cachePool:null},Jl(null,e);if(Ng(t),(e=ct)?(e=dS(e,Ta),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:Ar!==null?{id:ci,overflow:di}:null,retryLane:536870912,hydrationErrors:null},n=g1(e),n.return=t,t.child=n,tn=t,ct=null)):e=null,e===null)throw Or(t);return t.lanes=536870912,null}return Nu(t,a)}var r=e.memoizedState;if(r!==null){var o=r.dehydrated;if(Ng(t),i)if(t.flags&256)t.flags&=-257,t=D0(e,t,n);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(I(558));else if(qt||vo(e,t,n,!1),i=(n&e.childLanes)!==0,qt||i){if(_r.current===null){if(a=it,a!==null&&(o=Ux(a,n),o!==0&&o!==r.retryLane))throw r.retryLane=o,Ro(e,o),Pn(a,e,o),Bh;rf()}t=D0(e,t,n)}else e=r.treeContext,ct=Ea(o.nextSibling),tn=t,Ne=!0,wr=null,Ta=!1,e!==null&&b1(t,e),t=Nu(t,a),t.flags|=134221824;return t}return e=zi(e.child,{mode:a.mode,children:a.children}),e.ref=t.ref,t.child=e,e.return=t,e}function os(e,t){var n=t.ref;if(n===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof n!="function"&&typeof n!="object")throw Error(I(284));(e===null||e.ref!==n)&&(t.flags|=4194816)}}function Ag(e,t,n,a,i){return yo(t),n=Oh(e,t,n,a,void 0,i),a=_h(),e!==null&&!qt?(zh(e,t,i),Vi(e,t,i)):(Ne&&a&&bf(t),t.flags|=1,Gt(e,t,n,i),t.child)}function I0(e,t,n,a,i,r){return yo(t),t.updateQueue=null,n=M1(t,a,n,i),E1(e),a=_h(),e!==null&&!qt?(zh(e,t,r),Vi(e,t,r)):(Ne&&a&&bf(t),t.flags|=1,Gt(e,t,n,r),t.child)}function q0(e,t,n,a,i){if(yo(t),t.stateNode===null){var r=bs,o=n.contextType;typeof o=="object"&&o!==null&&(r=sn(o)),r=new n(a,r),t.memoizedState=r.state!==null&&r.state!==void 0?r.state:null,r.updater=Rg,t.stateNode=r,r._reactInternals=t,r=t.stateNode,r.props=a,r.state=t.memoizedState,r.refs={},Mh(t),o=n.contextType,r.context=typeof o=="object"&&o!==null?sn(o):bs,r.state=t.memoizedState,o=n.getDerivedStateFromProps,typeof o=="function"&&(Hm(t,n,o,a),r.state=t.memoizedState),typeof n.getDerivedStateFromProps=="function"||typeof r.getSnapshotBeforeUpdate=="function"||typeof r.UNSAFE_componentWillMount!="function"&&typeof r.componentWillMount!="function"||(o=r.state,typeof r.componentWillMount=="function"&&r.componentWillMount(),typeof r.UNSAFE_componentWillMount=="function"&&r.UNSAFE_componentWillMount(),o!==r.state&&Rg.enqueueReplaceState(r,r.state,null),Fl(t,a,r,i),Kl(),r.state=t.memoizedState),typeof r.componentDidMount=="function"&&(t.flags|=4194308),a=!0}else if(e===null){r=t.stateNode;var s=t.memoizedProps,l=ko(n,s);r.props=l;var c=r.context,f=n.contextType;o=bs,typeof f=="object"&&f!==null&&(o=sn(f));var v=n.getDerivedStateFromProps;f=typeof v=="function"||typeof r.getSnapshotBeforeUpdate=="function",s=t.pendingProps!==s,f||typeof r.UNSAFE_componentWillReceiveProps!="function"&&typeof r.componentWillReceiveProps!="function"||(s||c!==o)&&C0(t,r,a,o),fr=!1;var g=t.memoizedState;r.state=g,Fl(t,a,r,i),Kl(),c=t.memoizedState,s||g!==c||fr?(typeof v=="function"&&(Hm(t,n,v,a),c=t.memoizedState),(l=fr||R0(t,n,l,a,g,c,o))?(f||typeof r.UNSAFE_componentWillMount!="function"&&typeof r.componentWillMount!="function"||(typeof r.componentWillMount=="function"&&r.componentWillMount(),typeof r.UNSAFE_componentWillMount=="function"&&r.UNSAFE_componentWillMount()),typeof r.componentDidMount=="function"&&(t.flags|=4194308)):(typeof r.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=a,t.memoizedState=c),r.props=a,r.state=c,r.context=o,a=l):(typeof r.componentDidMount=="function"&&(t.flags|=4194308),a=!1)}else{r=t.stateNode,wg(e,t),o=t.memoizedProps,f=ko(n,o),r.props=f,v=t.pendingProps,g=r.context,c=n.contextType,l=bs,typeof c=="object"&&c!==null&&(l=sn(c)),s=n.getDerivedStateFromProps,(c=typeof s=="function"||typeof r.getSnapshotBeforeUpdate=="function")||typeof r.UNSAFE_componentWillReceiveProps!="function"&&typeof r.componentWillReceiveProps!="function"||(o!==v||g!==l)&&C0(t,r,a,l),fr=!1,g=t.memoizedState,r.state=g,Fl(t,a,r,i),Kl();var h=t.memoizedState;o!==v||g!==h||fr||e!==null&&e.dependencies!==null&&ju(e.dependencies)?(typeof s=="function"&&(Hm(t,n,s,a),h=t.memoizedState),(f=fr||R0(t,n,f,a,g,h,l)||e!==null&&e.dependencies!==null&&ju(e.dependencies))?(c||typeof r.UNSAFE_componentWillUpdate!="function"&&typeof r.componentWillUpdate!="function"||(typeof r.componentWillUpdate=="function"&&r.componentWillUpdate(a,h,l),typeof r.UNSAFE_componentWillUpdate=="function"&&r.UNSAFE_componentWillUpdate(a,h,l)),typeof r.componentDidUpdate=="function"&&(t.flags|=4),typeof r.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof r.componentDidUpdate!="function"||o===e.memoizedProps&&g===e.memoizedState||(t.flags|=4),typeof r.getSnapshotBeforeUpdate!="function"||o===e.memoizedProps&&g===e.memoizedState||(t.flags|=1024),t.memoizedProps=a,t.memoizedState=h),r.props=a,r.state=h,r.context=l,a=f):(typeof r.componentDidUpdate!="function"||o===e.memoizedProps&&g===e.memoizedState||(t.flags|=4),typeof r.getSnapshotBeforeUpdate!="function"||o===e.memoizedProps&&g===e.memoizedState||(t.flags|=1024),a=!1)}return r=a,os(e,t),a=(t.flags&128)!==0,r||a?(r=t.stateNode,n=a&&typeof n.getDerivedStateFromError!="function"?null:r.render(),t.flags|=1,e!==null&&a?(t.child=wo(t,e.child,null,i),t.child=wo(t,null,n,i)):Gt(e,t,n,i),t.memoizedState=r.state,e=t.child):e=Vi(e,t,i),e}function L0(e,t,n,a){return bo(),t.flags|=256,Gt(e,t,n,a),t.child}var Og={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function _g(e){return{baseLanes:e,cachePool:y1()}}function zg(e,t,n){return e=e!==null?e.childLanes&~n:0,t&&(e|=na),e}function uw(e,t,n){var a=t.pendingProps,i=!1,r=(t.flags&128)!==0,o;if((o=r)||(o=e!==null&&e.memoizedState===null?!1:(cn.current&2)!==0),o&&(i=!0,t.flags&=-129),o=(t.flags&32)!==0,t.flags&=-33,e===null){if(Ne){if(i?Nr(t):Tr(),(e=ct)?(e=dS(e,Ta),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:Ar!==null?{id:ci,overflow:di}:null,retryLane:536870912,hydrationErrors:null},n=g1(e),n.return=t,t.child=n,tn=t,ct=null)):e=null,e===null)throw Or(t);return nb(e)?t.lanes=32:t.lanes=536870912,null}return r=a.children,a=a.fallback,i?(Tr(),i=t.mode,r=kf({mode:"hidden",children:r},i),a=po(a,i,n,null),r.return=t,a.return=t,r.sibling=a,t.child=r,a=t.child,a.memoizedState=_g(n),a.childLanes=zg(e,o,n),t.memoizedState=Og,Jl(null,a)):(Nr(t),jh(t,r))}var s=e.memoizedState;if(s!==null){var l=s.dehydrated;if(l!==null)return LC(e,t,r,o,a,l,s,n)}return i?(Tr(),i=a.fallback,r=t.mode,s=e.child,l=s.sibling,a=zi(s,{mode:"hidden",children:a.children}),a.subtreeFlags=s.subtreeFlags&1206910976,l!==null?i=zi(l,i):(i=po(i,r,n,null),i.flags|=2),i.return=t,a.return=t,a.sibling=i,t.child=a,Jl(null,a),a=t.child,i=e.child.memoizedState,i===null?i=_g(n):(r=i.cachePool,r!==null?(s=It._currentValue,r=r.parent!==s?{parent:s,pool:s}:r):r=y1(),i={baseLanes:i.baseLanes|n,cachePool:r}),a.memoizedState=i,a.childLanes=zg(e,o,n),t.memoizedState=Og,Jl(e.child,a)):(Nr(t),n=e.child,e=n.sibling,n=zi(n,{mode:"visible",children:a.children}),n.return=t,n.sibling=null,e!==null&&(o=t.deletions,o===null?(t.deletions=[e],t.flags|=16):o.push(e)),t.child=n,t.memoizedState=null,n)}function jh(e,t){return t=kf({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function kf(e,t){return e=Un(22,e,null,t),e.lanes=0,e}function ru(e,t,n){return wo(t,e.child,null,n),e=jh(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function LC(e,t,n,a,i,r,o,s){if(n)return t.flags&256?(Nr(t),t.flags&=-257,ru(e,t,s)):t.memoizedState!==null?(Tr(),t.child=e.child,t.flags|=128,null):(Tr(),r=i.fallback,o=t.mode,i=kf({mode:"visible",children:i.children},o),r=po(r,o,s,null),r.flags|=2,i.return=t,r.return=t,i.sibling=r,t.child=i,wo(t,e.child,null,s),i=t.child,i.memoizedState=_g(s),i.childLanes=zg(e,a,s),t.memoizedState=Og,Jl(null,i));if(Nr(t),nb(r)){if(a=r.nextSibling&&r.nextSibling.dataset,a)var l=a.dgst;return a=l,a!==""&&(i=Error(I(419)),i.stack="",i.digest=a,sc({value:i,source:null,stack:null})),ru(e,t,s)}if(qt||vo(e,t,s,!1),a=(s&e.childLanes)!==0,qt||a){if(_r.current!==null)return ru(e,t,s);if(a=it,a!==null&&(i=Ux(a,s),i!==0&&i!==o.retryLane))throw o.retryLane=i,Ro(e,i),Pn(a,e,i),Bh;return ih(r)||rf(),ru(e,t,s)}return ih(r)?(t.flags|=192,t.child=e.child,null):(e=o.treeContext,ct=Ea(r.nextSibling),tn=t,Ne=!0,wr=null,Ta=!1,e!==null&&b1(t,e),t=jh(t,i.children),t.flags|=134221824,t)}function H0(e,t,n){e.lanes|=t;var a=e.alternate;a!==null&&(a.lanes|=t),xu(e.return,t,n)}function V0(e){for(var t=null;e!==null;){var n=e.alternate;n!==null&&Xu(n)===null&&(t=e),e=e.sibling}return t}function ou(e,t,n,a,i,r){var o=e.memoizedState;o===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:a,tail:n,tailMode:i,treeForkCount:r}:(o.isBackwards=t,o.rendering=null,o.renderingStartTime=0,o.last=a,o.tail=n,o.tailMode=i,o.treeForkCount=r)}function Vm(e){var t=e.child;for(e.child=null;t!==null;){var n=t.sibling;t.sibling=e.child,e.child=t,t=n}}function Dg(e,t,n){var a=t.pendingProps,i=a.revealOrder,r=a.tail;a=a.children;var o=cn.current;if(t.flags&128)return cc(t,o),null;var s=(o&2)!==0;if(s?(o=o&1|2,t.flags|=128):o&=1,cc(t,o),i==="backwards"&&e!==null?(Vm(e),Gt(e,t,a,n),Vm(e)):Gt(e,t,a,n),a=Ne?oc:0,!s&&e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&H0(e,n,t);else if(e.tag===19)H0(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(i){case"backwards":n=V0(t.child),n===null?(i=t.child,t.child=null):(i=n.sibling,n.sibling=null,Vm(t)),ou(t,!0,i,null,r,a);break;case"unstable_legacy-backwards":for(n=null,i=t.child,t.child=null;i!==null;){if(e=i.alternate,e!==null&&Xu(e)===null){t.child=i;break}e=i.sibling,i.sibling=n,n=i,i=e}ou(t,!0,n,null,r,a);break;case"together":ou(t,!1,null,null,void 0,a);break;case"independent":t.memoizedState=null;break;default:n=V0(t.child),n===null?(i=t.child,t.child=null):(i=n.sibling,n.sibling=null),ou(t,!1,i,n,r,a)}return t.child}function U0(e,t,n){var a=t.pendingProps;return hr(t,t.type,a.value),Gt(e,t,a.children,n),t.child}function Vi(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),Dr|=t.lanes,(n&t.childLanes)===0)if(e!==null){if(vo(e,t,n,!1),(n&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(I(153));if(t.child!==null){for(e=t.child,n=zi(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=zi(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function Gh(e,t){return(e.lanes&t)!==0?!0:(e=e.dependencies,!!(e!==null&&ju(e)))}function HC(e,t,n){switch(t.tag){case 3:Iu(t,t.stateNode.containerInfo),hr(t,It,e.memoizedState.cache),bo();break;case 27:case 5:sg(t);break;case 4:Iu(t,t.stateNode.containerInfo);break;case 10:hr(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,Ng(t),null;break;case 13:var a=t.memoizedState;if(a!==null){if(a.dehydrated!==null)return Nr(t),t.flags|=128,null;a=vo(e,t,n,!1);var i=t.child.childLanes;return a||(n&i)!==0?uw(e,t,n):(Nr(t),e=Vi(e,t,n),e!==null?e.sibling:null)}Nr(t);break;case 19:if(t.flags&128)return Dg(e,t,n);if(i=(e.flags&128)!==0,a=(n&t.childLanes)!==0,a||(vo(e,t,n,!1),a=(n&t.childLanes)!==0),i){if(a)return Dg(e,t,n);t.flags|=128}if(i=t.memoizedState,i!==null&&(i.rendering=null,i.tail=null,i.lastEffect=null),cc(t,cn.current),a)break;return null;case 22:return t.lanes=0,dw(e,t,n,t.pendingProps);case 24:hr(t,It,e.memoizedState.cache)}return Vi(e,t,n)}function fw(e,t,n){if(e!==null)if(e.memoizedProps!==t.pendingProps)qt=!0;else{if(!Gh(e,n)&&(t.flags&128)===0)return qt=!1,HC(e,t,n);qt=(e.flags&131072)!==0}else qt=!1,Ne&&(t.flags&1048576)!==0&&h1(t,oc,t.index);switch(t.lanes=0,t.tag){case 16:e:{var a=t.pendingProps;if(e=so(t.elementType),t.type=e,typeof e=="function")Sh(e)?(a=ko(e,a),t.tag=1,t=q0(null,t,e,a,n)):(t.tag=0,t=Ag(null,t,e,a,n));else{if(e!=null){var i=e.$$typeof;if(i===ch){t.tag=11,t=O0(null,t,e,a,n);break e}else if(i===dh){t.tag=14,t=_0(null,t,e,a,n);break e}else if(i===si){t.tag=10,t.type=e,t=U0(null,t,n);break e}}throw t=rg(e)||e,Error(I(306,t,""))}}return t;case 0:return Ag(e,t,t.type,t.pendingProps,n);case 1:return a=t.type,i=ko(a,t.pendingProps),q0(e,t,a,i,n);case 3:e:{if(Iu(t,t.stateNode.containerInfo),e===null)throw Error(I(387));a=t.pendingProps;var r=t.memoizedState;i=r.element,wg(e,t),Fl(t,a,null,n);var o=t.memoizedState;if(a=o.cache,hr(t,It,a),a!==r.cache&&yg(t,[It],n,!0),Kl(),a=o.element,r.isDehydrated)if(r={element:a,isDehydrated:!1,cache:o.cache},t.updateQueue.baseState=r,t.memoizedState=r,t.flags&256){t=L0(e,t,a,n);break e}else if(a!==i){i=Na(Error(I(424)),t),sc(i),t=L0(e,t,a,n);break e}else for(e=t.stateNode.containerInfo,e.nodeType===9?e=e.body:e=e.nodeName==="HTML"?e.ownerDocument.body:e,ct=Ea(e.firstChild),tn=t,Ne=!0,wr=null,Ta=!0,n=S1(t,null,a,n),t.child=n;n;)n.flags=n.flags&-3|134221824,n=n.sibling;else{if(bo(),a===i){t=Vi(e,t,n);break e}Gt(e,t,a,n)}t=t.child}return t;case 26:return os(e,t),e===null?(n=px(t.type,null,t.pendingProps,null))?t.memoizedState=n:Ne||(t.stateNode=tS(t.type,t.pendingProps,xr.current,t)):t.memoizedState=px(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return sg(t),e===null&&Ne&&(a=t.stateNode=uS(t.type,t.pendingProps,xr.current),tn=t,Ta=!0,i=ct,qr(t.type)?(rh=i,ct=Ea(a.firstChild)):ct=i),Gt(e,t,t.pendingProps.children,n),os(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&Ne&&((i=a=ct)&&(a=AA(a,t.type,t.pendingProps,Ta),a!==null?(t.stateNode=a,tn=t,ct=Ea(a.firstChild),Ta=!1,i=!0):i=!1),i||Or(t)),sg(t),i=t.type,r=t.pendingProps,o=e!==null?e.memoizedProps:null,a=r.children,th(i,r)?a=null:o!==null&&th(i,o)&&(t.flags|=32),t.memoizedState!==null&&(i=Oh(e,t,MC,null,null,n),Ps._currentValue=i),os(e,t),Gt(e,t,a,n),t.child;case 6:return e===null&&Ne&&((e=n=ct)&&(n=OA(n,t.pendingProps,Ta),n!==null?(t.stateNode=n,tn=t,ct=null,e=!0):e=!1),e||Or(t)),null;case 13:return uw(e,t,n);case 4:return Iu(t,t.stateNode.containerInfo),a=t.pendingProps,e===null?t.child=wo(t,null,a,n):Gt(e,t,a,n),t.child;case 11:return O0(e,t,t.type,t.pendingProps,n);case 7:return a=t.pendingProps,os(e,t),Gt(e,t,a,n),t.child;case 8:return Gt(e,t,t.pendingProps.children,n),t.child;case 12:return Gt(e,t,t.pendingProps.children,n),t.child;case 10:return U0(e,t,n);case 9:return i=t.type._context,a=t.pendingProps.children,yo(t),i=sn(i),a=a(i),t.flags|=1,Gt(e,t,a,n),t.child;case 14:return _0(e,t,t.type,t.pendingProps,n);case 15:return cw(e,t,t.type,t.pendingProps,n);case 19:return Dg(e,t,n);case 31:return qC(e,t,n);case 22:return dw(e,t,n,t.pendingProps);case 24:return yo(t),a=sn(It),e===null?(i=Th(),i===null&&(i=it,r=Nh(),i.pooledCache=r,r.refCount++,r!==null&&(i.pooledCacheLanes|=n),i=r),t.memoizedState={parent:a,cache:i},Mh(t),hr(t,It,i)):((e.lanes&n)!==0&&(wg(e,t),Fl(t,null,null,n),Kl()),i=e.memoizedState,r=t.memoizedState,i.parent!==a?(i={parent:a,cache:a},t.memoizedState=i,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=i),hr(t,It,a)):(a=r.cache,hr(t,It,a),a!==i.cache&&yg(t,[It],n,!0))),Gt(e,t,t.pendingProps.children,n),t.child;case 30:return t.stateNode===null&&(t.stateNode={autoName:null,paired:null,clones:null,ref:null}),a=t.pendingProps,a.name!=null&&a.name!=="auto"?t.flags|=e===null?18882560:18874368:Ne&&bf(t),e!==null&&e.memoizedProps.name!==a.name?t.flags|=4194816:os(e,t),Gt(e,t,a.children,n),t.child;case 29:throw t.pendingProps}throw Error(I(156,t.tag))}function Ai(e){e.flags|=4}function Um(e,t,n,a,i){var r;if((r=(e.mode&32)!==0)&&(r=n===null?hx(t,a):hx(t,a)&&(a.src!==n.src||a.srcSet!==n.srcSet)),r){if(e.flags|=16777216,(i&335544128)===i)if(e.stateNode.complete)e.flags|=8192;else if(Pw())e.flags|=8192;else throw go=Gu,Eh}else e.flags&=-16777217}function P0(e,t){if(t.type!=="stylesheet"||(t.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!gS(t))if(Pw())e.flags|=8192;else throw go=Gu,Eh}function su(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?Lx():536870912,e.lanes|=t,Is|=t)}function Dl(e,t){if(!Ne)switch(e.tailMode){case"visible":break;case"collapsed":for(var n=e.tail,a=null;n!==null;)n.alternate!==null&&(a=n),n=n.sibling;a===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:a.sibling=null;break;default:for(t=e.tail,n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null}}function lt(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,a=0;if(t)for(var i=e.child;i!==null;)n|=i.lanes|i.childLanes,a|=i.subtreeFlags&1206910976,a|=i.flags&1206910976,i.return=e,i=i.sibling;else for(i=e.child;i!==null;)n|=i.lanes|i.childLanes,a|=i.subtreeFlags,a|=i.flags,i.return=e,i=i.sibling;return e.subtreeFlags|=a,e.childLanes=n,t}function VC(e,t,n){var a=t.pendingProps;switch(kh(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return lt(t),null;case 1:return lt(t),null;case 3:return n=t.stateNode,a=null,e!==null&&(a=e.memoizedState.cache),t.memoizedState.cache!==a&&(t.flags|=2048),Di(It),Os(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(e===null||e.child===null)&&(is(t)?Ai(t):e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,Im())),lt(t),null;case 26:var i=t.type,r=t.memoizedState;return e===null?(Ai(t),r!==null?(lt(t),P0(t,r)):(lt(t),Um(t,i,null,a,n))):r?r!==e.memoizedState?(Ai(t),lt(t),P0(t,r)):(lt(t),t.flags&=-16777217):(e=e.memoizedProps,e!==a&&Ai(t),lt(t),Um(t,i,e,a,n)),null;case 27:if(qu(t),n=xr.current,i=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==a&&Ai(t);else{if(!a){if(t.stateNode===null)throw Error(I(166));return lt(t),t.subtreeFlags&=-33554433,null}e=ui.current,is(t)?m0(t,e):(e=uS(i,a,n),t.stateNode=e,Ai(t))}return lt(t),t.subtreeFlags&=-33554433,null;case 5:if(qu(t),i=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==a&&Ai(t);else{if(!a){if(t.stateNode===null)throw Error(I(166));return lt(t),t.subtreeFlags&=-33554433,null}if(r=ui.current,is(t))m0(t,r);else{var o=pc(xr.current);switch(r){case 1:r=o.createElementNS("http://www.w3.org/2000/svg",i);break;case 2:r=o.createElementNS("http://www.w3.org/1998/Math/MathML",i);break;default:switch(i){case"svg":r=o.createElementNS("http://www.w3.org/2000/svg",i);break;case"math":r=o.createElementNS("http://www.w3.org/1998/Math/MathML",i);break;case"script":r=o.createElement("div"),r.innerHTML="<script><\/script>",r=r.removeChild(r.firstChild);break;case"select":r=typeof a.is=="string"?o.createElement("select",{is:a.is}):o.createElement("select"),a.multiple?r.multiple=!0:a.size&&(r.size=a.size);break;default:r=typeof a.is=="string"?o.createElement(i,{is:a.is}):o.createElement(i)}}r[on]=t,r[jn]=a;e:for(o=t.child;o!==null;){if(o.tag===5||o.tag===6)r.appendChild(o.stateNode);else if(o.tag!==4&&o.tag!==27&&o.child!==null){o.child.return=o,o=o.child;continue}if(o===t)break e;for(;o.sibling===null;){if(o.return===null||o.return===t)break e;o=o.return}o.sibling.return=o.return,o=o.sibling}t.stateNode=r;e:switch(dn(r,i,a),i){case"button":case"input":case"select":case"textarea":a=!!a.autoFocus;break e;case"img":a=!0;break e;default:a=!1}a&&Ai(t)}}return lt(t),t.subtreeFlags&=-33554433,Um(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,n),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==a&&Ai(t);else{if(typeof a!="string"&&t.stateNode===null)throw Error(I(166));if(e=xr.current,is(t)){if(e=t.stateNode,n=t.memoizedProps,a=null,i=tn,i!==null)switch(i.tag){case 27:case 5:a=i.memoizedProps}e[on]=t,e=!!(e.nodeValue===n||a!==null&&a.suppressHydrationWarning===!0||Ww(e.nodeValue,n)),e||Or(t,!0)}else e=pc(e).createTextNode(a),e[on]=t,t.stateNode=e}return lt(t),null;case 31:if(n=t.memoizedState,e===null||e.memoizedState!==null){if(a=is(t),n!==null){if(e===null){if(!a)throw Error(I(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(I(557));e[on]=t}else bo(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;lt(t),e=!1}else n=Im(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=n),e=!0;if(!e)return t.flags&256?(ea(t),t):(ea(t),null);if((t.flags&128)!==0)throw Error(I(558))}return lt(t),null;case 13:if(a=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(i=is(t),a!==null&&a.dehydrated!==null){if(e===null){if(!i)throw Error(I(318));if(i=t.memoizedState,i=i!==null?i.dehydrated:null,!i)throw Error(I(317));i[on]=t}else bo(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;lt(t),i=!1}else i=Im(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=i),i=!0;if(!i)return t.flags&256?(ea(t),t):(ea(t),null)}return ea(t),(t.flags&128)!==0?(t.lanes=n,t):(n=a!==null,e=e!==null&&e.memoizedState!==null,n&&(a=t.child,i=null,a.alternate!==null&&a.alternate.memoizedState!==null&&a.alternate.memoizedState.cachePool!==null&&(i=a.alternate.memoizedState.cachePool.pool),r=null,a.memoizedState!==null&&a.memoizedState.cachePool!==null&&(r=a.memoizedState.cachePool.pool),r!==i&&(a.flags|=2048)),n!==e&&n&&(t.child.flags|=8192),su(t,t.updateQueue),lt(t),null);case 4:return Os(),e===null&&Wh(t.stateNode.containerInfo),t.flags|=67108864,lt(t),null;case 10:return Di(t.type),lt(t),null;case 19:if(Ch(t),a=t.memoizedState,a===null)return lt(t),null;if(i=(t.flags&128)!==0,r=a.rendering,r===null)if(i)Dl(a,!1);else{if(Rt!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(r=Xu(e),r!==null){for(t.flags|=128,Dl(a,!1),e=r.updateQueue,t.updateQueue=e,su(t,e),t.subtreeFlags=0,e=n,n=t.child;n!==null;)m1(n,e),n=n.sibling;return cc(t,cn.current&1|2),Ne&&Oi(t,a.treeForkCount),t.child}e=e.sibling}a.tail!==null&&aa()>nf&&(t.flags|=128,i=!0,Dl(a,!1),t.lanes=4194304)}else{if(!i)if(e=Xu(r),e!==null){if(t.flags|=128,i=!0,e=e.updateQueue,t.updateQueue=e,su(t,e),Dl(a,!0),a.tail===null&&a.tailMode!=="collapsed"&&a.tailMode!=="visible"&&!r.alternate&&!Ne)return lt(t),null}else 2*aa()-a.renderingStartTime>nf&&n!==536870912&&(t.flags|=128,i=!0,Dl(a,!1),t.lanes=4194304);a.isBackwards?(r.sibling=t.child,t.child=r):(e=a.last,e!==null?e.sibling=r:t.child=r,a.last=r)}if(a.tail!==null){e=a.tail;e:{for(n=e;n!==null;){if(n.alternate!==null){n=!1;break e}n=n.sibling}n=!0}return a.rendering=e,a.tail=e.sibling,a.renderingStartTime=aa(),e.sibling=null,r=cn.current,r=i?r&1|2:r&1,a.tailMode==="visible"||a.tailMode==="collapsed"||!n||Ne?cc(t,r):(n=r,dt(un,t),dt(cn,n),hn===null&&(hn=t)),Ne&&Oi(t,a.treeForkCount),e}return lt(t),null;case 22:case 23:return ea(t),Rh(),a=t.memoizedState!==null,e!==null?e.memoizedState!==null!==a&&(t.flags|=8192):a&&(t.flags|=8192),a?(n&536870912)!==0&&(t.flags&128)===0&&(lt(t),t.subtreeFlags&6&&(t.flags|=8192)):lt(t),n=t.updateQueue,n!==null&&su(t,n.retryQueue),n=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),a=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(a=t.memoizedState.cachePool.pool),a!==n&&(t.flags|=2048),e!==null&&ln(mo),null;case 24:return n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),Di(It),lt(t),null;case 25:return null;case 30:return t.flags|=33554432,lt(t),null}throw Error(I(156,t.tag))}function UC(e,t){switch(kh(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Di(It),Os(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return qu(t),null;case 31:if(t.memoizedState!==null){if(ea(t),t.alternate===null)throw Error(I(340));bo()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(ea(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(I(340));bo()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return Ch(t),e=t.flags,e&65536?(t.flags=e&-65537|128,e=t.memoizedState,e!==null&&(e.rendering=null,e.tail=null),t.flags|=4,t):null;case 4:return Os(),null;case 10:return Di(t.type),null;case 22:case 23:return ea(t),Rh(),e!==null&&ln(mo),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return Di(It),null;case 25:return null;default:return null}}function pw(e,t){switch(kh(t),t.tag){case 3:Di(It),Os();break;case 26:case 27:case 5:qu(t);break;case 4:Os();break;case 31:t.memoizedState!==null&&ea(t);break;case 13:ea(t);break;case 19:Ch(t);break;case 10:Di(t.type);break;case 22:case 23:ea(t),Rh(),e!==null&&ln(mo);break;case 24:Di(It)}}function Ec(e,t){try{var n=t.updateQueue,a=n!==null?n.lastEffect:null;if(a!==null){var i=a.next;n=i;do{if((n.tag&e)===e){a=void 0;var r=n.create,o=n.inst;a=r(),o.destroy=a}n=n.next}while(n!==i)}}catch(s){Ze(t,t.return,s)}}function zr(e,t,n){try{var a=t.updateQueue,i=a!==null?a.lastEffect:null;if(i!==null){var r=i.next;a=r;do{if((a.tag&e)===e){var o=a.inst,s=o.destroy;if(s!==void 0){o.destroy=void 0,i=t;var l=n,c=s;try{c()}catch(f){Ze(i,l,f)}}}a=a.next}while(a!==r)}}catch(f){Ze(t,t.return,f)}}function mw(e){var t=e.updateQueue;if(t!==null){var n=e.stateNode;try{N1(t,n)}catch(a){Ze(e,e.return,a)}}}function gw(e,t,n){n.props=ko(e.type,e.memoizedProps),n.state=e.memoizedState;try{n.componentWillUnmount()}catch(a){Ze(e,t,a)}}function ri(e,t){try{var n=e.ref;if(n!==null){switch(e.tag){case 26:case 27:case 5:var a=e.stateNode;break;case 30:var i=e.stateNode,r=qi(e.memoizedProps,i);(i.ref===null||i.ref.name!==r)&&(i.ref=rS(r)),a=i.ref;break;case 7:if(e.stateNode===null){var o=new la(e);Bn(e.child,!1,RA,o,void 0,void 0),e.stateNode=o}a=e.stateNode;break;default:a=e.stateNode}typeof n=="function"?e.refCleanup=n(a):n.current=a}}catch(s){Ze(e,t,s)}}function rn(e,t){var n=e.ref,a=e.refCleanup;if(n!==null)if(typeof a=="function")try{a()}catch(i){Ze(e,t,i)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof n=="function")try{n(null)}catch(i){Ze(e,t,i)}else n.current=null}function Ju(e,t){if((e.tag===5||e.tag===27||e.tag===6)&&e.alternate===null&&t!==null)for(var n=0;n<t.length;n++)cS(e.stateNode,t[n])}function B0(e){for(var t=e.return;t!==null&&(Xh(t)&&cS(e.stateNode,t.stateNode),!Yh(t));)t=t.return}function $l(e){for(var t=e.return;t!==null&&(Xh(t)&&CA(e.stateNode,t.stateNode),!Yh(t));)t=t.return}function Yh(e){return e.tag===5||e.tag===3||e.tag===27}function Xh(e){return e&&e.tag===7&&e.stateNode!==null}function Ig(e){var t=e.type,n=e.memoizedProps,a=e.stateNode;try{e:switch(t){case"button":case"input":case"select":case"textarea":n.autoFocus&&a.focus();break e;case"img":n.src?a.src=n.src:n.srcSet&&(a.srcset=n.srcSet)}}catch(i){Ze(e,e.return,i)}}function Pm(e,t,n){try{var a=e.stateNode;dA(a,e.type,n,t),a[jn]=t}catch(i){Ze(e,e.return,i)}}function hw(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&qr(e.type)||e.tag===4}function Bm(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||hw(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&qr(e.type)||e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function qg(e,t,n,a){var i=e.tag;if(i===5||i===6)i=e.stateNode,t?(n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n).insertBefore(i,t):(t=n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n,t.appendChild(i),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=li)),Ju(e,a),Ue=!0;else if(i!==4&&(i===27&&(Ju(e,a),a=null,qr(e.type)&&(n=e.stateNode,t=null)),e=e.child,e!==null))for(qg(e,t,n,a),e=e.sibling;e!==null;)qg(e,t,n,a),e=e.sibling}function $u(e,t,n,a){var i=e.tag;if(i===5||i===6)i=e.stateNode,t?n.insertBefore(i,t):n.appendChild(i),Ju(e,a),Ue=!0;else if(i!==4&&(i===27&&(Ju(e,a),a=null,qr(e.type)&&(n=e.stateNode)),e=e.child,e!==null))for($u(e,t,n,a),e=e.sibling;e!==null;)$u(e,t,n,a),e=e.sibling}function bw(e){var t=e.stateNode,n=e.memoizedProps;try{for(var a=e.type,i=t.attributes;i.length;)t.removeAttributeNode(i[0]);dn(t,a,n),t[on]=e,t[jn]=n}catch(r){Ze(e,e.return,r)}}var Wu=!1,ta=null;function j0(e){(e.tag===30||(e.subtreeFlags&33554432)!==0)&&(Wu=!0)}var oi=null;function G0(){var e=oi;return oi=null,e}var Vn=0;function Qs(e,t,n,a,i){return Vn=0,vw(e.child,t,n,a,i)}function vw(e,t,n,a,i){for(var r=!1;e!==null;){if(e.tag===5){var o=e.stateNode;if(a!==null){var s=nh(o);a.push(s),s.view&&(r=!0)}else r||nh(o).view&&(r=!0);Wu=!0,nS(o,Vn===0?t:t+"_"+Vn,n),Vn++}else(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&i||vw(e.child,t,n,a,i)&&(r=!0));e=e.sibling}return r}function pi(e,t){for(;e!==null;)e.tag===5?aS(e.stateNode,e.memoizedProps):(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&t||pi(e.child,t)),e=e.sibling}function Tu(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if((e.tag!==22||e.memoizedState===null)&&(Tu(e),e.tag===30&&(e.flags&18874368)!==0&&e.stateNode.paired)){var t=e.memoizedProps;if(t.name==null||t.name==="auto")throw Error(I(544));var n=t.name;t=Bi(t.default,t.share),t!=="none"&&(Qs(e,n,t,null,!1)||pi(e.child,!1))}e=e.sibling}}function Lg(e,t){if(e.tag===30){var n=e.stateNode,a=e.memoizedProps,i=qi(a,n),r=Bi(a.default,n.paired?a.share:a.enter);r!=="none"?Qs(e,i,r,null,!1)?(Tu(e),n.paired||t||qs(e,a.onEnter)):pi(e.child,!1):Tu(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Lg(e,t),e=e.sibling;else Tu(e)}function Hg(e){if(ta!==null&&ta.size!==0){var t=ta;if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var n=e.memoizedProps,a=n.name;if(a!=null&&a!=="auto"){var i=t.get(a);if(i!==void 0){var r=Bi(n.default,n.share);if(r!=="none"&&(Qs(e,a,r,null,!1)?(r=e.stateNode,i.paired=r,r.paired=i,qs(e,n.onShare)):pi(e.child,!1)),t.delete(a),t.size===0)break}}}Hg(e)}e=e.sibling}}}function Vg(e){if(e.tag===30){var t=e.memoizedProps,n=qi(t,e.stateNode),a=ta!==null?ta.get(n):void 0,i=Bi(t.default,a!==void 0?t.share:t.exit);i!=="none"&&(Qs(e,n,i,null,!1)?a!==void 0?(i=e.stateNode,a.paired=i,i.paired=a,ta.delete(n),qs(e,t.onShare)):qs(e,t.onExit):pi(e.child,!1)),ta!==null&&Hg(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Vg(e),e=e.sibling;else ta!==null&&Hg(e)}function yw(e){for(e=e.child;e!==null;){if(e.tag===30){var t=e.memoizedProps,n=qi(t,e.stateNode);t=Bi(t.default,t.update),e.flags&=-5,t!=="none"&&Qs(e,n,t,e.memoizedState=[],!1)}else(e.subtreeFlags&33554432)!==0&&yw(e);e=e.sibling}}function Ug(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var t=e.stateNode;t.paired!==null&&(t.paired=null,pi(e.child,!1))}Ug(e)}e=e.sibling}}function Eu(e){if(e.tag===30)e.stateNode.paired=null,pi(e.child,!1),Ug(e);else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Eu(e),e=e.sibling;else Ug(e)}function xw(e){for(e=e.child;e!==null;)e.tag===30?pi(e.child,!1):(e.subtreeFlags&33554432)!==0&&xw(e),e=e.sibling}function Qh(e,t,n,a,i,r,o){for(var s=!1;t!==null;){if(t.tag===5){var l=t.stateNode;if(r!==null&&Vn<r.length){var c=r[Vn],f=nh(l);(c.view||f.view)&&(s=!0);var v;if(v=(e.flags&4)===0)if(f.clip)v=!0;else{v=c.rect;var g=f.rect;v=v.y!==g.y||v.x!==g.x||v.height!==g.height||v.width!==g.width}v&&(e.flags|=4),f.abs?f=!c.abs:(c=c.rect,f=f.rect,f=c.height!==f.height||c.width!==f.width),f&&(e.flags|=32)}else e.flags|=32;(e.flags&4)!==0&&nS(l,Vn===0?n:n+"_"+Vn,i),s&&(e.flags&4)!==0||(oi===null&&(oi=[]),oi.push(l,Vn===0?a:a+"_"+Vn,t.memoizedProps)),Vn++}else(t.tag!==22||t.memoizedState===null)&&(t.tag===30&&o?e.flags|=t.flags&32:Qh(e,t.child,n,a,i,r,o)&&(s=!0));t=t.sibling}return s}function ww(e,t){for(e=e.child;e!==null;){if(e.tag===30){var n=e.memoizedProps,a=e.stateNode,i=qi(n,a),r=Bi(n.default,n.update);if(t){a=a.clones;var o=a===null?null:a.map(hA)}else o=e.memoizedState,e.memoizedState=null;a=e;var s=e.child;Vn=0,i=Qh(a,s,i,i,r,o,!1),(e.flags&4)!==0&&i&&(t||qs(e,n.onUpdate))}else(e.subtreeFlags&33554432)!==0&&ww(e,t);e=e.sibling}}var $t=!1,Xe=!1,ni=!1,jm=!1,Y0=typeof WeakSet=="function"?WeakSet:Set,Wt=null,ai=!1,Bl=!1,ef=!1,Pg=!1;function PC(e,t,n){if(e=e.containerInfo,Wg=Bs,e=o1(e),yh(e)){if("selectionStart"in e)var a={start:e.selectionStart,end:e.selectionEnd};else e:{a=(a=e.ownerDocument)&&a.defaultView||window;var i=a.getSelection&&a.getSelection();if(i&&i.rangeCount!==0){a=i.anchorNode;var r=i.anchorOffset,o=i.focusNode;i=i.focusOffset;try{a.nodeType,o.nodeType}catch{a=null;break e}var s=0,l=-1,c=-1,f=0,v=0,g=e,h=null;t:for(;;){for(var w;g!==a||r!==0&&g.nodeType!==3||(l=s+r),g!==o||i!==0&&g.nodeType!==3||(c=s+i),g.nodeType===3&&(s+=g.nodeValue.length),(w=g.firstChild)!==null;)h=g,g=w;for(;;){if(g===e)break t;if(h===a&&++f===r&&(l=s),h===o&&++v===i&&(c=s),(w=g.nextSibling)!==null)break;g=h,h=g.parentNode}g=w}a=l===-1||c===-1?null:{start:l,end:c}}else a=null}a=a||{start:0,end:0}}else a=null;for(eh={focusedElem:e,selectionRange:a},Bs=!1,n=(n&335544064)===n,Wt=t,t=n?9270:1024;Wt!==null;){if(e=Wt,n&&(a=e.deletions,a!==null))for(r=0;r<a.length;r++)n&&Vg(a[r]);if(e.alternate===null&&(e.flags&2)!==0)n&&j0(e),lu(n);else{if(e.tag===22){if(a=e.alternate,e.memoizedState!==null){a!==null&&a.memoizedState===null&&n&&Vg(a),lu(n);continue}else if(a!==null&&a.memoizedState!==null){n&&j0(e),lu(n);continue}}a=e.child,(e.subtreeFlags&t)!==0&&a!==null?(a.return=e,Wt=a):(n&&yw(e),lu(n))}}ta=null}function lu(e){for(;Wt!==null;){var t=Wt,n=e,a=t.alternate,i=t.flags;switch(t.tag){case 0:case 11:case 15:break;case 1:if((i&1024)!==0&&a!==null){n=void 0,i=a.memoizedProps,a=a.memoizedState;var r=t.stateNode;try{var o=ko(t.type,i);n=r.getSnapshotBeforeUpdate(o,a),r.__reactInternalSnapshotBeforeUpdate=n}catch(s){Ze(t,t.return,s)}}break;case 3:if((i&1024)!==0){if(a=t.stateNode.containerInfo,n=a.nodeType,n===9)ah(a);else if(n===1)switch(a.nodeName){case"HEAD":case"HTML":case"BODY":ah(a);break;default:a.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;case 30:n&&a!==null&&(n=qi(a.memoizedProps,a.stateNode),i=t.memoizedProps,i=Bi(i.default,i.update),i!=="none"&&Qs(a,n,i,a.memoizedState=[],!0));break;default:if((i&1024)!==0)throw Error(I(163))}if(a=t.sibling,a!==null){a.return=t.return,Wt=a;break}Wt=t.return}}function Sw(e,t,n){var a=n.flags;switch(n.tag){case 0:case 11:case 15:ii(e,n),a&4&&Ec(5,n);break;case 1:if(ii(e,n),a&4)if(e=n.stateNode,t===null)try{e.componentDidMount()}catch(o){Ze(n,n.return,o)}else{var i=ko(n.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(i,t,e.__reactInternalSnapshotBeforeUpdate)}catch(o){Ze(n,n.return,o)}}a&64&&mw(n),a&512&&ri(n,n.return);break;case 3:if(ii(e,n),a&64&&(e=n.updateQueue,e!==null)){if(t=null,n.child!==null)switch(n.child.tag){case 27:case 5:t=n.child.stateNode;break;case 1:t=n.child.stateNode}try{N1(e,t)}catch(o){Ze(n,n.return,o)}}break;case 27:t===null&&a&4&&bw(n);case 26:case 5:ii(e,n),t===null&&a&4&&Ig(n),a&512&&ri(n,n.return);break;case 12:ii(e,n);break;case 31:ii(e,n),a&4&&Ew(e,n);break;case 13:ii(e,n),a&4&&Mw(e,n),a&64&&(e=n.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(n=WC.bind(null,n),_A(e,n))));break;case 22:if(a=n.memoizedState!==null||$t,!a){var r=t!==null&&t.memoizedState!==null||Xe;t=$t,i=Xe,$t=a,(Xe=r)&&!i?(a=2,(n.subtreeFlags&8772)!==0&&(a|=1),Pa(e,n,a)):ii(e,n),$t=t,Xe=i}break;case 30:ii(e,n),a&512&&ri(n,n.return);break;case 7:a&512&&ri(n,n.return);default:ii(e,n)}}function Bg(e,t){for(e=e.child;e!==null;)kw(e,t),e=e.sibling}function kw(e,t){switch(e.tag){case 5:case 26:try{var n=e.stateNode;if(t){var a=n.style;typeof a.setProperty=="function"?a.setProperty("display","none","important"):a.display="none"}else{var i=e.stateNode,r=e.memoizedProps.style,o=r!=null&&r.hasOwnProperty("display")?r.display:null;i.style.display=o==null||typeof o=="boolean"?"":(""+o).trim()}}catch(l){Ze(e,e.return,l)}jg(e,t);break;case 6:try{e.stateNode.nodeValue=t?"":e.memoizedProps,Ue=!0}catch(l){Ze(e,e.return,l)}break;case 18:try{var s=e.stateNode;t?sx(s,!0):sx(e.stateNode,!1)}catch(l){Ze(e,e.return,l)}break;case 22:case 23:e.memoizedState===null&&Bg(e,t);break;default:Bg(e,t)}}function jg(e,t){if(e.subtreeFlags&67108864)for(e=e.child;e!==null;){e:{var n=e,a=t;switch(n.tag){case 4:kw(n,a);break e;case 22:n.memoizedState===null&&jg(n,a);break e;default:jg(n,a)}}e=e.sibling}}function Nw(e){var t=e.alternate;t!==null&&(e.alternate=null,Nw(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&uf(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var gt=null,Ln=!1;function Ua(e,t,n){for(n=n.child;n!==null;)Tw(e,t,n),n=n.sibling}function Tw(e,t,n){if(ia&&typeof ia.onCommitFiberUnmount=="function")try{ia.onCommitFiberUnmount(yc,n)}catch{}switch(n.tag){case 26:Xe||rn(n,t),Ua(e,t,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&!Xe&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:Xe||rn(n,t),$l(n);var a=gt,i=Ln;qr(n.type)&&(gt=n.stateNode,Ln=!1),Ua(e,t,n),fS(n.stateNode,n.type,n.memoizedProps),gt=a,Ln=i;break;case 5:Xe||rn(n,t),$l(n);case 6:if(n.tag===6&&$l(n),a=gt,i=Ln,gt=null,Ua(e,t,n),gt=a,Ln=i,gt!==null)if(Ln)try{(gt.nodeType===9?gt.body:gt.nodeName==="HTML"?gt.ownerDocument.body:gt).removeChild(n.stateNode),Ue=!0}catch(r){Ze(n,t,r)}else try{gt.removeChild(n.stateNode),Ue=!0}catch(r){Ze(n,t,r)}break;case 18:gt!==null&&(Ln?(e=gt,ox(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,n.stateNode),js(e)):ox(gt,n.stateNode));break;case 4:a=gt,i=Ln,gt=n.stateNode.containerInfo,Ln=!0,Ua(e,t,n),gt=a,Ln=i;break;case 0:case 11:case 14:case 15:zr(2,n,t),Xe||zr(4,n,t),Ua(e,t,n);break;case 1:Xe||(rn(n,t),a=n.stateNode,typeof a.componentWillUnmount=="function"&&gw(n,t,a)),Ua(e,t,n);break;case 21:Ua(e,t,n);break;case 22:Xe=(a=Xe)||n.memoizedState!==null,Ua(e,t,n),Xe=a;break;case 30:rn(n,t),Ua(e,t,n);break;case 7:Xe||rn(n,t),Ua(e,t,n);break;default:Ua(e,t,n)}}function Ew(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{js(e)}catch(n){Ze(t,t.return,n)}}}function Mw(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{js(e)}catch(n){Ze(t,t.return,n)}}function BC(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new Y0),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new Y0),t;default:throw Error(I(435,e.tag))}}function cu(e,t){var n=BC(e);t.forEach(function(a){if(!n.has(a)){n.add(a);var i=eA.bind(null,e,a);a.then(i,i)}})}function Mn(e,t,n){var a=t.deletions;if(a!==null)for(var i=0;i<a.length;i++){var r=a[i],o=e,s=t,l=s;e:for(;l!==null;){switch(l.tag){case 27:if(qr(l.type)){gt=l.stateNode,Ln=!1;break e}break;case 5:gt=l.stateNode,Ln=!1;break e;case 3:case 4:gt=l.stateNode.containerInfo,Ln=!0;break e}l=l.return}if(gt===null)throw Error(I(160));Tw(o,s,r),gt=null,Ln=!1,o=r.alternate,o!==null&&(o.return=null),r.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)Rw(t,e,n),t=t.sibling}var Ba=null;function Rw(e,t,n){var a=e.alternate,i=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(i&4&&(a=e.updateQueue,a=a!==null?a.events:null,a!==null))for(var r=0;r<a.length;r++){var o=a[r];o.ref.impl=o.nextImpl}Mn(t,e,n),Rn(e),i&4&&(zr(3,e,e.return),Ec(3,e),zr(5,e,e.return));break;case 1:Mn(t,e,n),Rn(e),i&512&&(Xe||a===null||rn(a,a.return)),i&64&&$t&&(e=e.updateQueue,e!==null&&(t=e.callbacks,t!==null&&(n=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=n===null?t:n.concat(t))));break;case 26:if(r=Ba,Mn(t,e,n),Rn(e),i&512&&(Xe||a===null||rn(a,a.return)),i&4)if(i=a!==null?a.memoizedState:null,n=e.memoizedState,a===null)if(n===null)if(e.stateNode===null)if($t)e.stateNode=tS(e.type,e.memoizedProps,t.containerInfo,e);else{e:{t=e.type,n=e.memoizedProps,i=r.ownerDocument||r;t:switch(t){case"title":a=i.getElementsByTagName("title")[0],(!a||a[Sc]||a[on]||a.namespaceURI==="http://www.w3.org/2000/svg"||a.hasAttribute("itemprop"))&&(a=i.createElement(t),i.head.insertBefore(a,i.querySelector("head > title"))),dn(a,t,n),a[on]=e,en(a),t=a;break e;case"link":if(r=gx("link","href",i).get(t+(n.href||""))){for(o=0;o<r.length;o++)if(a=r[o],a.getAttribute("href")===(n.href==null||n.href===""?null:n.href)&&a.getAttribute("rel")===(n.rel==null?null:n.rel)&&a.getAttribute("title")===(n.title==null?null:n.title)&&a.getAttribute("crossorigin")===(n.crossOrigin==null?null:n.crossOrigin)){r.splice(o,1);break t}}a=i.createElement(t),dn(a,t,n),i.head.appendChild(a);break;case"meta":if(r=gx("meta","content",i).get(t+(n.content||""))){for(o=0;o<r.length;o++)if(a=r[o],a.getAttribute("content")===(n.content==null?null:""+n.content)&&a.getAttribute("name")===(n.name==null?null:n.name)&&a.getAttribute("property")===(n.property==null?null:n.property)&&a.getAttribute("http-equiv")===(n.httpEquiv==null?null:n.httpEquiv)&&a.getAttribute("charset")===(n.charSet==null?null:n.charSet)){r.splice(o,1);break t}}a=i.createElement(t),dn(a,t,n),i.head.appendChild(a);break;default:throw Error(I(468,t))}a[on]=e,en(a),t=a}e.stateNode=t}else $t||oh(r,e.type,e.stateNode);else e.stateNode=mx(r,n,e.memoizedProps);else i!==n?(i===null?(t=a.stateNode,t===null||Xe||t.parentNode.removeChild(t)):i.count--,n===null?$t||oh(r,e.type,e.stateNode):mx(r,n,e.memoizedProps)):n===null&&e.stateNode!==null&&Pm(e,e.memoizedProps,a.memoizedProps);break;case 27:Mn(t,e,n),Rn(e),i&512&&(Xe||a===null||rn(a,a.return)),a!==null&&i&4&&Pm(e,e.memoizedProps,a.memoizedProps);break;case 5:if(r=ni,ni=!1,Mn(t,e,n),ni=r,Rn(e),i&512&&(Xe||a===null||rn(a,a.return)),e.flags&32){t=e.stateNode;try{zs(t,""),Ue=!0}catch(f){Ze(e,e.return,f)}}i&4&&e.stateNode!=null&&(t=e.memoizedProps,Pm(e,t,a!==null?a.memoizedProps:t)),i&1024&&(jm=!0);break;case 6:if(Mn(t,e,n),Rn(e),i&4){if(e.stateNode===null)throw Error(I(162));t=e.memoizedProps,n=e.stateNode;try{n.nodeValue=t,Ue=!0}catch(f){Ze(e,e.return,f)}}break;case 3:if(Ue=!1,Au=null,r=Ba,Ba=mc(t.containerInfo),Mn(t,e,n),Ba=r,Rn(e),i&4&&a!==null&&a.memoizedState.isDehydrated)try{js(t.containerInfo)}catch(f){Ze(e,e.return,f)}jm&&(jm=!1,Cw(e)),Ue=!1;break;case 4:i=ni,ni=$t,a=Jy(),r=Ba,Ba=mc(e.stateNode.containerInfo),Mn(t,e,n),Rn(e),Ba=r,Ue&&Bl&&(ef=!0),Ue=a,ni=i;break;case 12:Mn(t,e,n),Rn(e);break;case 31:Mn(t,e,n),Rn(e),i&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,cu(e,t)));break;case 13:Mn(t,e,n),Rn(e),e.child.flags&8192&&e.memoizedState!==null!=(a!==null&&a.memoizedState!==null)&&(Nf=aa()),i&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,cu(e,t)));break;case 22:r=e.memoizedState!==null,o=a!==null&&a.memoizedState!==null;var s=$t,l=Xe,c=ni;$t=s||r,ni=c||r,Xe=l||o,Mn(t,e,n),Xe=l,ni=c,$t=s,Rn(e),i&8192&&(t=e.stateNode,t._visibility=r?t._visibility&-2:t._visibility|1,!r||a===null||o||$t||Xe||(t=o||Xe,n=$t,a=Xe,$t=r||$t,Xe=t,dr(e,2),$t=n,Xe=a),!r&&ni||Bg(e,r)),i&4&&(t=e.updateQueue,t!==null&&(n=t.retryQueue,n!==null&&(t.retryQueue=null,cu(e,n))));break;case 19:Mn(t,e,n),Rn(e),i&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,cu(e,t)));break;case 30:i&512&&(Xe||a===null||rn(a,a.return)),i=Jy(),r=Bl,o=(n&335544064)===n,s=e.memoizedProps,Bl=o&&Bi(s.default,s.update)!=="none",Mn(t,e,n),Rn(e),o&&a!==null&&Ue&&(e.flags|=4),Bl=r,Ue=i;break;case 21:break;case 7:i&512&&(Xe||a===null||rn(a,a.return)),a&&a.stateNode!==null&&(a.stateNode._fragmentFiber=e);default:Mn(t,e,n),Rn(e)}}function Rn(e){var t=e.flags;if(t&2){try{for(var n,a=e.return;a!==null;){if(hw(a)){n=a;break}a=a.return}a=null;for(var i=e.return;i!==null;){if(Xh(i)){var r=i.stateNode;a===null?a=[r]:a.push(r)}if(Yh(i))break;i=i.return}var o=a;if(n==null)throw Error(I(160));switch(n.tag){case 27:var s=n.stateNode,l=Bm(e);$u(e,l,s,o);break;case 5:var c=n.stateNode;n.flags&32&&(zs(c,""),n.flags&=-33);var f=Bm(e);$u(e,f,c,o);break;case 3:case 4:var v=n.stateNode.containerInfo,g=Bm(e);qg(e,g,v,o);break;default:throw Error(I(161))}}catch(h){Ze(e,e.return,h)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function Cw(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;Cw(t),t.tag===5&&t.flags&1024&&(t=t.stateNode,Bs=!0,t.reset(),Bs=!1),e=e.sibling}}function rs(e,t){if(t.subtreeFlags&9270)for(t=t.child;t!==null;)Aw(t,e),t=t.sibling;else ww(t,!1)}function Aw(e,t){var n=e.alternate;if(n===null)Lg(e,!1);else switch(e.tag){case 3:if(Pg=ai=!1,G0(),rs(t,e),!ai&&!ef){if(e=oi,e!==null)for(var a=0;a<e.length;a+=3){n=e[a];var i=e[a+1];aS(n,e[a+2]),n=n.ownerDocument.documentElement,n!==null&&n.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group("+i+")"})}e=t.containerInfo,e=e.nodeType===9?e.documentElement:e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName===""&&(e.style.viewTransitionName="none",e.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group(root)"}),e.animate({width:[0,0],height:[0,0]},{duration:0,fill:"forwards",pseudoElement:"::view-transition"})),Pg=!0}oi=null;break;case 5:rs(t,e);break;case 4:a=ai,ai=!1,rs(t,e),ai&&(ef=!0),ai=a;break;case 22:e.memoizedState===null&&(n.memoizedState!==null?Lg(e,!1):rs(t,e));break;case 30:a=ai,i=G0(),ai=!1,rs(t,e),ai&&(e.flags|=4);var r=e.memoizedProps,o=e.stateNode;t=qi(r,o),o=qi(n.memoizedProps,o);var s=Bi(r.default,r.update);s==="none"?t=!1:(r=n.memoizedState,n.memoizedState=null,n=e.child,Vn=0,t=Qh(e,n,t,o,s,r,!0),Vn!==(r===null?0:r.length)&&(e.flags|=32)),(e.flags&4)!==0&&t?(qs(e,e.memoizedProps.onUpdate),oi=i):i!==null&&(i.push.apply(i,oi),oi=i),ai=(e.flags&32)!==0?!0:a;break;default:rs(t,e)}}function ii(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)Sw(e,t.alternate,t),t=t.sibling}function dr(e,t){for(e=e.child;e!==null;){var n=e,a=t;switch(n.tag){case 0:case 11:case 14:case 15:zr(4,n,n.return),dr(n,a);break;case 1:rn(n,n.return);var i=n.stateNode;typeof i.componentWillUnmount=="function"&&gw(n,n.return,i),dr(n,a);break;case 27:(a&2)!==0&&fS(n.stateNode,n.type,n.memoizedProps);case 5:rn(n,n.return),n.tag!==5&&n.tag!==27||$l(n),dr(n,a);break;case 6:$l(n);break;case 26:rn(n,n.return),i=n.stateNode,n.memoizedState!==null||i===null||Xe||i.parentNode.removeChild(i),dr(n,a);break;case 22:n.memoizedState===null&&dr(n,a);break;case 30:rn(n,n.return),dr(n,a);break;case 7:rn(n,n.return);default:dr(n,a)}e=e.sibling}}function Pa(e,t,n){for(n=(t.subtreeFlags&8772)!==0?n:n&-2,t=t.child;t!==null;){var a=t.alternate,i=e,r=t,o=r.flags,s=(n&1)!==0;switch(r.tag){case 0:case 11:case 15:Pa(i,r,n),Ec(4,r);break;case 1:if(Pa(i,r,n),a=r,i=a.stateNode,typeof i.componentDidMount=="function")try{i.componentDidMount()}catch(f){Ze(a,a.return,f)}if(a=r,i=a.updateQueue,i!==null){var l=a.stateNode;try{var c=i.shared.hiddenCallbacks;if(c!==null)for(i.shared.hiddenCallbacks=null,i=0;i<c.length;i++)k1(c[i],l)}catch(f){Ze(a,a.return,f)}}s&&o&64&&mw(r),ri(r,r.return);break;case 27:(n&2)!==0&&bw(r);case 5:r.tag!==5&&r.tag!==27||B0(r),Pa(i,r,n),s&&a===null&&o&4&&Ig(r),ri(r,r.return);break;case 6:B0(r);break;case 26:l=r.stateNode,r.memoizedState!==null||l===null||$t||oh(mc(l.ownerDocument),r.type,l),Pa(i,r,n),s&&a===null&&o&4&&Ig(r),ri(r,r.return);break;case 12:Pa(i,r,n);break;case 31:Pa(i,r,n),s&&o&4&&Ew(i,r);break;case 13:Pa(i,r,n),s&&o&4&&Mw(i,r);break;case 22:r.memoizedState===null&&Pa(i,r,n),ri(r,r.return);break;case 30:Pa(i,r,n),ri(r,r.return);break;case 7:ri(r,r.return);default:Pa(i,r,n)}t=t.sibling}}function Kh(e,t){var n=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==n&&(e!=null&&e.refCount++,n!=null&&Nc(n))}function Fh(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&Nc(e))}function ya(e,t,n,a){var i=(n&335544064)===n;if(t.subtreeFlags&(i?10262:10256))for(t=t.child;t!==null;)Ow(e,t,n,a),t=t.sibling;else i&&xw(t)}function Ow(e,t,n,a){var i=(n&335544064)===n;i&&t.alternate===null&&t.return!==null&&t.return.alternate!==null&&Eu(t);var r=t.flags;switch(t.tag){case 0:case 11:case 15:ya(e,t,n,a),r&2048&&Ec(9,t);break;case 1:ya(e,t,n,a);break;case 3:ya(e,t,n,a),i&&Pg&&(e=e.containerInfo,e=e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,e.style.viewTransitionName==="root"&&(e.style.viewTransitionName=""),e=e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName==="none"&&(e.style.viewTransitionName="")),r&2048&&(r=null,t.alternate!==null&&(r=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==r&&(t.refCount++,r!=null&&Nc(r)));break;case 12:if(r&2048){ya(e,t,n,a),r=t.stateNode;try{var o=t.memoizedProps,s=o.id,l=o.onPostCommit;typeof l=="function"&&l(s,t.alternate===null?"mount":"update",r.passiveEffectDuration,-0)}catch(c){Ze(t,t.return,c)}}else ya(e,t,n,a);break;case 31:ya(e,t,n,a);break;case 13:ya(e,t,n,a);break;case 23:break;case 22:o=t.stateNode,s=t.alternate,t.memoizedState!==null?(i&&s!==null&&s.memoizedState===null&&Eu(s),o._visibility&2?ya(e,t,n,a):Wl(e,t)):(i&&s!==null&&s.memoizedState!==null&&Eu(t),o._visibility&2?ya(e,t,n,a):(o._visibility|=2,ss(e,t,n,a,(t.subtreeFlags&10256)!==0||!1))),r&2048&&Kh(s,t);break;case 24:ya(e,t,n,a),r&2048&&Fh(t.alternate,t);break;case 30:i&&(r=t.alternate,r!==null&&(pi(r.child,!0),pi(t.child,!0))),ya(e,t,n,a);break;default:ya(e,t,n,a)}}function ss(e,t,n,a,i){for(i=i&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var r=e,o=t,s=n,l=a,c=o.flags;switch(o.tag){case 0:case 11:case 15:ss(r,o,s,l,i),Ec(8,o);break;case 23:break;case 22:var f=o.stateNode;o.memoizedState!==null?f._visibility&2?ss(r,o,s,l,i):Wl(r,o):(f._visibility|=2,ss(r,o,s,l,i)),i&&c&2048&&Kh(o.alternate,o);break;case 24:ss(r,o,s,l,i),i&&c&2048&&Fh(o.alternate,o);break;default:ss(r,o,s,l,i)}t=t.sibling}}function Wl(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var n=e,a=t,i=a.flags;switch(a.tag){case 22:Wl(n,a),i&2048&&Kh(a.alternate,a);break;case 24:Wl(n,a),i&2048&&Fh(a.alternate,a);break;default:Wl(n,a)}t=t.sibling}}var lo=8192;function ro(e,t,n){if(e.subtreeFlags&lo)for(e=e.child;e!==null;)_w(e,t,n),e=e.sibling}function _w(e,t,n){switch(e.tag){case 26:ro(e,t,n),e.flags&lo&&(e.memoizedState!==null?XA(n,Ba,e.memoizedState,e.memoizedProps):(e=e.stateNode,(t&335544128)===t&&bx(n,e)));break;case 5:ro(e,t,n),e.flags&lo&&(e=e.stateNode,(t&335544128)===t&&bx(n,e));break;case 3:case 4:var a=Ba;Ba=mc(e.stateNode.containerInfo),ro(e,t,n),Ba=a;break;case 22:e.memoizedState===null&&(a=e.alternate,a!==null&&a.memoizedState!==null?(a=lo,lo=16777216,ro(e,t,n),lo=a):ro(e,t,n));break;case 30:if((e.flags&lo)!==0&&(a=e.memoizedProps.name,a!=null&&a!=="auto")){var i=e.stateNode;i.paired=null,ta===null&&(ta=new Map),ta.set(a,i)}ro(e,t,n);break;default:ro(e,t,n)}}function zw(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function Il(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var n=0;n<t.length;n++){var a=t[n];Wt=a,Iw(a,e)}zw(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)Dw(e),e=e.sibling}function Dw(e){switch(e.tag){case 0:case 11:case 15:Il(e),e.flags&2048&&zr(9,e,e.return);break;case 3:Il(e);break;case 12:Il(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,Mu(e)):Il(e);break;default:Il(e)}}function Mu(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var n=0;n<t.length;n++){var a=t[n];Wt=a,Iw(a,e)}zw(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:zr(8,t,t.return),Mu(t);break;case 22:n=t.stateNode,n._visibility&2&&(n._visibility&=-3,Mu(t));break;default:Mu(t)}e=e.sibling}}function Iw(e,t){for(;Wt!==null;){var n=Wt;switch(n.tag){case 0:case 11:case 15:zr(8,n,t);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var a=n.memoizedState.cachePool.pool;a!=null&&a.refCount++}break;case 24:Nc(n.memoizedState.cache)}if(a=n.child,a!==null)a.return=n,Wt=a;else e:for(n=e;Wt!==null;){a=Wt;var i=a.sibling,r=a.return;if(Nw(a),a===n){Wt=null;break e}if(i!==null){i.return=r,Wt=i;break e}Wt=r}}}var jC={getCacheForType:function(e){var t=sn(It),n=t.data.get(e);return n===void 0&&(n=e(),t.data.set(e,n)),n},cacheSignal:function(){return sn(It).controller.signal}},GC=typeof WeakMap=="function"?WeakMap:Map,Pe=0,it=null,Ce=null,_e=0,Ke=0,$n=null,br=!1,Ks=!1,Zh=!1,Ui=0,Rt=0,Dr=0,ho=0,tf=0,na=0,Is=0,ec=null,Hn=null,Gg=!1,Nf=0,qw=0,nf=1/0,af=null,Er=null,wt=0,Ga=null,No=null,fi=0,Yg=0,Xg=null,Lw=null,Rs=null,Cs=null,As=null,tc=0,Ru=null;function oa(){return(Pe&2)!==0&&_e!==0?_e&-_e:pe.T!==null?$h():Px()}function Hw(){if(na===0)if((_e&536870912)===0||Ne){var e=Zd;Zd<<=1,(Zd&3932160)===0&&(Zd=262144),na=e}else na=536870912;return e=un.current,e!==null&&(e.flags|=32),na}function qs(e,t){if(t!=null){var n=e.stateNode,a=n.ref;a===null&&(a=n.ref=rS(qi(e.memoizedProps,n))),Cs===null&&(Cs=[]),Cs.push(t.bind(null,a))}}function Pn(e,t,n){(e===it&&(Ke===2||Ke===9)||e.cancelPendingCommit!==null)&&(Ls(e,0),vr(e,_e,na,!1)),wc(e,n),((Pe&2)===0||e!==it)&&(e===it&&((Pe&2)===0&&(ho|=n),Rt===4&&vr(e,_e,na,!1)),gi(e))}function Vw(e,t,n){if((Pe&6)!==0)throw Error(I(327));var a=!n&&(t&127)===0&&(t&e.expiredLanes)===0||xc(e,t),i=a?QC(e,t):Gm(e,t,!0),r=a;do{if(i===0){Ks&&!a&&vr(e,t,0,!1);break}else{if(n=e.current.alternate,r&&!YC(n)){i=Gm(e,t,!1),r=!1;continue}if(i===2){if(r=t,e.errorRecoveryDisabledLanes&r)var o=0;else o=e.pendingLanes&-536870913,o=o!==0?o:o&536870912?536870912:0;if(o!==0){t=o;e:{var s=e;i=ec;var l=s.current.memoizedState.isDehydrated;if(l&&(Ls(s,o).flags|=256),o=Gm(s,o,!1),o!==2&&o!==6){if(Zh&&!l){s.errorRecoveryDisabledLanes|=r,ho|=r,i=4;break e}r=Hn,Hn=i,r!==null&&(Hn===null?Hn=r:Hn.push.apply(Hn,r))}i=o}if(r=!1,i!==2)continue}}if(i===1){Ls(e,0),vr(e,t,0,!0);break}e:{switch(a=e,r=i,r){case 0:case 1:throw Error(I(345));case 4:if((t&4194048)!==t&&(t&62914560)!==t)break;case 6:vr(a,t,na,!br);break e;case 2:Hn=null;break;case 3:case 5:break;default:throw Error(I(329))}if((t&62914560)===t&&(i=Nf+300-aa(),10<i)){if(vr(a,t,na,!br),df(a,0,!0)!==0)break e;fi=t,a.timeoutHandle=eb(X0.bind(null,a,n,Hn,af,Gg,t,na,ho,Is,br,r,"Throttled",-0,0),i);break e}X0(a,n,Hn,af,Gg,t,na,ho,Is,br,r,null,-0,0)}}break}while(!0);gi(e)}function X0(e,t,n,a,i,r,o,s,l,c,f,v,g,h){e.timeoutHandle=-1;var w=t.subtreeFlags,x=(r&335544064)===r;if(v=null,(x||w&8192||(w&16785408)===16785408)&&(v={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:li},ta=null,_w(t,r,v),x&&(w=v,x=e.containerInfo,x=(x.nodeType===9?x:x.ownerDocument).__reactViewTransition,x!=null&&(w.count++,w.waitingForViewTransition=!0,w=gc.bind(w),x.finished.then(w,w))),w=(r&62914560)===r?Nf-aa():(r&4194048)===r?qw-aa():0,w=QA(v,w),w!==null)){fi=r,e.cancelPendingCommit=w(K0.bind(null,e,t,r,n,a,i,o,s,l,c,f,v,null,g,h)),vr(e,r,o,!c);return}K0(e,t,r,n,a,i,o,s,l,c,f,v)}function YC(e){for(var t=e;;){var n=t.tag;if((n===0||n===11||n===15)&&t.flags&16384&&(n=t.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var a=0;a<n.length;a++){var i=n[a],r=i.getSnapshot;i=i.value;try{if(!sa(r(),i))return!1}catch{return!1}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function vr(e,t,n,a){t=qx(e,t),t&=~tf,t&=~ho,e.suspendedLanes|=t,e.pingedLanes&=~t,a&&(e.warmLanes|=t),a=e.expirationTimes;for(var i=t;0<i;){var r=31-ra(i),o=1<<r;a[r]=-1,i&=~o}n!==0&&Hx(e,n,t)}function Tf(){return(Pe&6)===0?(Mc(0,!1),!1):!0}function Jh(){if(Ce!==null){if(Ke===0)var e=Ce.return;else e=Ce,_i=Co=null,Dh(e),Ts=null,lc=0,e=Ce;for(;e!==null;)pw(e.alternate,e),e=e.return;Ce=null}}function Ls(e,t){var n=e.timeoutHandle;return n!==-1&&(e.timeoutHandle=-1,pA(n)),n=e.cancelPendingCommit,n!==null&&(e.cancelPendingCommit=null,n()),fi=0,Jh(),it=e,Ce=n=zi(e.current,null),_e=t,Ke=0,$n=null,br=!1,Ks=xc(e,t),Zh=!1,Is=na=tf=ho=Dr=Rt=0,Hn=ec=null,Gg=!1,Ui=qx(e,t),gf(),n}function Uw(e,t){we=null,pe.H=Fu,t===Xs||t===vf?(t=y0(),Ke=3):t===Eh?(t=y0(),Ke=4):Ke=t===Bh?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,$n=t,Ce===null&&(Rt=1,Zu(e,Na(t,e.current)))}function Pw(){var e=un.current;return e===null?!0:(_e&4194048)===_e?hn===null:(_e&62914560)===_e||(_e&536870912)!==0?e===hn:!1}function Bw(){var e=pe.H;return pe.H=Fu,e===null?Fu:e}function jw(){var e=pe.A;return pe.A=jC,e}function rf(){Rt=4,br||(_e&4194048)!==_e&&un.current!==null||(Ks=!0),(Dr&134217727)===0&&(ho&134217727)===0||it===null||vr(it,_e,na,!1)}function Gm(e,t,n){var a=Pe;Pe|=2;var i=Bw(),r=jw();(it!==e||_e!==t)&&(af=null,Ls(e,t)),t=!1;var o=Rt;e:do try{if(Ke!==0&&Ce!==null){var s=Ce,l=$n;switch(Ke){case 8:Jh(),o=6;break e;case 3:case 2:case 9:case 6:un.current===null&&(t=!0);var c=Ke;if(Ke=0,$n=null,xs(e,s,l,c),n&&Ks){o=0;break e}break;default:c=Ke,Ke=0,$n=null,xs(e,s,l,c)}}XC(),o=Rt;break}catch(f){Uw(e,f)}while(!0);return t&&e.shellSuspendCounter++,_i=Co=null,Pe=a,pe.H=i,pe.A=r,Ce===null&&(it=null,_e=0,gf()),o}function XC(){for(;Ce!==null;)Gw(Ce)}function QC(e,t){var n=Pe;Pe|=2;var a=Bw(),i=jw();it!==e||_e!==t?(af=null,nf=aa()+500,Ls(e,t)):Ks=xc(e,t);e:do try{if(Ke!==0&&Ce!==null){t=Ce;var r=$n;t:switch(Ke){case 1:Ke=0,$n=null,xs(e,t,r,1);break;case 2:case 9:if(v0(r)){Ke=0,$n=null,Q0(t);break}t=function(){Ke!==2&&Ke!==9||it!==e||(Ke=7),gi(e)},r.then(t,t);break e;case 3:Ke=7;break e;case 4:Ke=5;break e;case 7:v0(r)?(Ke=0,$n=null,Q0(t)):(Ke=0,$n=null,xs(e,t,r,7));break;case 5:var o=null;switch(Ce.tag){case 26:o=Ce.memoizedState;case 5:case 27:var s=Ce;if(o?gS(o):s.stateNode.complete){Ke=0,$n=null;var l=s.sibling;if(l!==null)Ce=l;else{var c=s.return;c!==null?(Ce=c,Ef(c)):Ce=null}break t}}Ke=0,$n=null,xs(e,t,r,5);break;case 6:Ke=0,$n=null,xs(e,t,r,6);break;case 8:Jh(),Rt=6;break e;default:throw Error(I(462))}}KC();break}catch(f){Uw(e,f)}while(!0);return _i=Co=null,pe.H=a,pe.A=i,Pe=n,Ce!==null?0:(it=null,_e=0,gf(),Rt)}function KC(){for(;Ce!==null&&!uR();)Gw(Ce)}function Gw(e){var t=fw(e.alternate,e,Ui);e.memoizedProps=e.pendingProps,t===null?Ef(e):Ce=t}function Q0(e){var t=e,n=t.alternate;switch(t.tag){case 15:case 0:t=I0(n,t,t.pendingProps,t.type,void 0,_e);break;case 11:t=I0(n,t,t.pendingProps,t.type.render,t.ref,_e);break;case 5:Dh(t);var a=t;a===tn&&(Ne?(Bu(a),a.tag===5&&a.stateNode!=null&&(ct=a.stateNode)):(Bu(a),Ne=!0));default:pw(n,t),t=Ce=m1(t,Ui),t=fw(n,t,Ui)}e.memoizedProps=e.pendingProps,t===null?Ef(e):Ce=t}function xs(e,t,n,a){_i=Co=null,Dh(t),Ts=null,lc=0;var i=t.return;try{if(IC(e,i,t,n,_e)){Rt=1,Zu(e,Na(n,e.current)),Ce=null;return}}catch(r){if(i!==null)throw Ce=i,r;Rt=1,Zu(e,Na(n,e.current)),Ce=null;return}t.flags&32768?(Ne||a===1?e=!0:Ks||(_e&536870912)!==0?e=!1:(br=e=!0,(a===2||a===9||a===3||a===6)&&(a=un.current,a!==null&&a.tag===13&&(a.flags|=16384))),Yw(t,e)):Ef(t)}function Ef(e){var t=e;do{if((t.flags&32768)!==0){Yw(t,br);return}e=t.return;var n=VC(t.alternate,t,Ui);if(n!==null){Ce=n;return}if(t=t.sibling,t!==null){Ce=t;return}Ce=t=e}while(t!==null);Rt===0&&(Rt=5)}function Yw(e,t){do{var n=UC(e.alternate,e);if(n!==null){n.flags&=32767,Ce=n;return}if(n=e.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!t&&(e=e.sibling,e!==null)){Ce=e;return}Ce=e=n}while(e!==null);Rt=6,Ce=null}function K0(e,t,n,a,i,r,o,s,l,c,f,v){e.cancelPendingCommit=null;do Mf();while(wt!==0);if((Pe&6)!==0)throw Error(I(327));if(t!==null){if(t===e.current)throw Error(I(177));e===it&&(Ce=it=null,_e=0),No=t,Ga=e,fi=n,Xg=i,Lw=a,FC(e,t,n,o,s,l,v)}}function FC(e,t,n,a,i,r,o){var s=t.lanes|t.childLanes;if(Yg=s,s|=xh,wR(e,n,s,a,i,r),Cs=null,(n&335544064)===n?(As=kC(e),a=10262):(As=null,a=10256),(t.subtreeFlags&a)!==0||(t.flags&a)!==0?(e.callbackNode=null,e.callbackPriority=0,tA(Lu,function(){return Zg(),null})):(e.callbackNode=null,e.callbackPriority=0),Wu=!1,a=(t.flags&13878)!==0,(t.subtreeFlags&13878)!==0||a){a=pe.T,pe.T=null,i=Be.p,Be.p=2,r=Pe,Pe|=4;try{PC(e,t,n)}finally{Pe=r,Be.p=i,pe.T=a}}wt=1,Wu?Rs=yA(o,e.containerInfo,As,Qg,Kg,JC,Fg,Zg,ZC,null,null):(Qg(),Kg(),Fg())}function ZC(e){if(wt!==0){var t=Ga.onRecoverableError;t(e,{componentStack:null})}}function JC(){wt===3&&(wt=0,Aw(No,Ga),wt=4)}function Qg(){if(wt===1){wt=0;var e=Ga,t=No,n=fi,a=(t.flags&13878)!==0;if((t.subtreeFlags&13878)!==0||a){a=pe.T,pe.T=null;var i=Be.p;Be.p=2;var r=Pe;Pe|=4;try{Bl=ef=!1,Rw(t,e,n),n=eh;var o=o1(e.containerInfo),s=n.focusedElem,l=n.selectionRange;if(o!==s&&s&&s.ownerDocument&&r1(s.ownerDocument.documentElement,s)){if(l!==null&&yh(s)){var c=l.start,f=l.end;if(f===void 0&&(f=c),"selectionStart"in s)s.selectionStart=c,s.selectionEnd=Math.min(f,s.value.length);else{var v=s.ownerDocument||document,g=v&&v.defaultView||window;if(g.getSelection){var h=g.getSelection(),w=s.textContent.length,x=Math.min(l.start,w),C=l.end===void 0?x:Math.min(l.end,w);!h.extend&&x>C&&(o=C,C=x,x=o);var p=d0(s,x),m=d0(s,C);if(p&&m&&(h.rangeCount!==1||h.anchorNode!==p.node||h.anchorOffset!==p.offset||h.focusNode!==m.node||h.focusOffset!==m.offset)){var b=v.createRange();b.setStart(p.node,p.offset),h.removeAllRanges(),x>C?(h.addRange(b),h.extend(m.node,m.offset)):(b.setEnd(m.node,m.offset),h.addRange(b))}}}}for(v=[],h=s;h=h.parentNode;)h.nodeType===1&&v.push({element:h,left:h.scrollLeft,top:h.scrollTop});for(typeof s.focus=="function"&&s.focus(),s=0;s<v.length;s++){var y=v[s];y.element.scrollLeft=y.left,y.element.scrollTop=y.top}}Bs=!!Wg,eh=Wg=null}finally{Pe=r,Be.p=i,pe.T=a}}e.current=t,wt=2}}function Kg(){if(wt===2){wt=0;var e=Ga,t=No,n=(t.flags&8772)!==0;if((t.subtreeFlags&8772)!==0||n){n=pe.T,pe.T=null;var a=Be.p;Be.p=2;var i=Pe;Pe|=4;try{Sw(e,t.alternate,t)}finally{Pe=i,Be.p=a,pe.T=n}}wt=3}}function Fg(){if(wt===4||wt===3){wt=0;var e=Rs;Rs=null,fR();var t=Ga,n=No,a=fi,i=Lw,r=(a&335544064)===a?10262:10256;if((n.subtreeFlags&r)!==0||(n.flags&r)!==0?wt=5:(wt=0,No=Ga=null,Xw(t,t.pendingLanes)),r=t.pendingLanes,r===0&&(Er=null),ph(a),n=n.stateNode,ia&&typeof ia.onCommitFiberRoot=="function")try{ia.onCommitFiberRoot(yc,n,void 0,(n.current.flags&128)===128)}catch{}if(i!==null){n=pe.T,r=Be.p,Be.p=2,pe.T=null;try{for(var o=t.onRecoverableError,s=0;s<i.length;s++){var l=i[s];o(l.value,{componentStack:l.stack})}}finally{pe.T=n,Be.p=r}}if(i=Cs,o=As,As=null,i!==null&&(Cs=null,o===null&&(o=[]),e!==null))for(l=0;l<i.length;l++)n=(0,i[l])(o),n!==void 0&&e.finished.finally(n);(fi&3)!==0&&Mf(),gi(t),r=t.pendingLanes,(a&261930)!==0&&(r&42)!==0?t===Ru?tc++:(tc=0,Ru=t):(tc=0,Ru=null),Mc(0,!1)}}function Xw(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,Nc(t)))}function Mf(){return Rs!==null&&(Rs.skipTransition(),Rs=null),Qg(),Kg(),Fg(),Zg()}function Zg(){if(wt!==5)return!1;var e=Ga,t=Yg;Yg=0;var n=ph(fi),a=pe.T,i=Be.p;try{Be.p=32>n?32:n,pe.T=null,n=Xg,Xg=null;var r=Ga,o=fi;if(wt=0,No=Ga=null,fi=0,(Pe&6)!==0)throw Error(I(331));var s=Pe;if(Pe|=4,Dw(r.current),Ow(r,r.current,o,n),Pe=s,Mc(0,!1),ia&&typeof ia.onPostCommitFiberRoot=="function")try{ia.onPostCommitFiberRoot(yc,r)}catch{}return!0}finally{Be.p=i,pe.T=a,Xw(e,t)}}function F0(e,t,n){t=Na(n,t),t=Cg(e.stateNode,t,2),e=kr(e,t,2),e!==null&&(wc(e,2),gi(e))}function Ze(e,t,n){if(e.tag===3)F0(e,e,n);else for(;t!==null;){if(t.tag===3){F0(t,e,n);break}else if(t.tag===1){var a=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof a.componentDidCatch=="function"&&(Er===null||!Er.has(a))){e=Na(n,e),n=sw(2),a=kr(t,n,2),a!==null&&(lw(n,a,t,e),wc(a,2),gi(a));break}}t=t.return}}function Ym(e,t,n){var a=e.pingCache;if(a===null){a=e.pingCache=new GC;var i=new Set;a.set(t,i)}else i=a.get(t),i===void 0&&(i=new Set,a.set(t,i));i.has(n)||(Zh=!0,i.add(n),e=$C.bind(null,e,t,n),t.then(e,e))}function $C(e,t,n){var a=e.pingCache;a!==null&&a.delete(t),e.pingedLanes|=e.suspendedLanes&n,e.warmLanes&=~n,it===e&&(_e&n)===n&&((Rt===4||Rt===3&&(_e&62914560)===_e&&300>aa()-Nf)&&(Pe&2)===0?Ls(e,0):tf|=n,Is===_e&&(Is=0)),gi(e)}function Qw(e,t){t===0&&(t=Lx()),e=Ro(e,t),e!==null&&(wc(e,t),gi(e))}function WC(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),Qw(e,n)}function eA(e,t){var n=0;switch(e.tag){case 31:case 13:var a=e.stateNode,i=e.memoizedState;i!==null&&(n=i.retryLane);break;case 19:a=e.stateNode;break;case 22:a=e.stateNode._retryCache;break;default:throw Error(I(314))}a!==null&&a.delete(t),Qw(e,n)}function tA(e,t){return uh(e,t)}var Hs=null,ls=null,Jg=!1,of=!1,Xm=!1,yr=0;function gi(e){e!==ls&&e.next===null&&(ls===null?Hs=ls=e:ls=ls.next=e),of=!0,Jg||(Jg=!0,aA())}function Mc(e,t){if(!Xm&&of){Xm=!0;do for(var n=!1,a=Hs;a!==null;){if(!t)if(e!==0){var i=a.pendingLanes;if(i===0)var r=0;else{var o=a.suspendedLanes,s=a.pingedLanes;r=(1<<31-ra(42|e)+1)-1,r&=i&~(o&~s),r=r&201326741?r&201326741|1:r?r|2:0}r!==0&&(n=!0,Z0(a,r))}else r=_e,r=df(a,a===it?r:0,a.cancelPendingCommit!==null||a.timeoutHandle!==-1),(r&3)===0||xc(a,r)||(n=!0,Z0(a,r));a=a.next}while(n);Xm=!1}}function nA(){Kw()}function Kw(){of=Jg=!1;var e=0;yr!==0&&fA()&&(e=yr);for(var t=aa(),n=null,a=Hs;a!==null;){var i=a.next,r=Fw(a,t);r===0?(a.next=null,n===null?Hs=i:n.next=i,i===null&&(ls=n)):(n=a,(e!==0||(r&3)!==0)&&(of=!0)),a=i}wt!==0&&wt!==5||Mc(e,!1),yr!==0&&(yr=0)}function Fw(e,t){for(var n=e.suspendedLanes,a=e.pingedLanes,i=e.expirationTimes,r=e.pendingLanes&-62914561;0<r;){var o=31-ra(r),s=1<<o,l=i[o];l===-1?((s&n)===0||(s&a)!==0)&&(i[o]=xR(s,t)):l<=t&&(e.expiredLanes|=s),r&=~s}if(t=it,n=_e,n=df(e,e===t?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),a=e.callbackNode,n===0||e===t&&(Ke===2||Ke===9)||e.cancelPendingCommit!==null)return a!==null&&a!==null&&Nm(a),e.callbackNode=null,e.callbackPriority=0;if((n&3)===0||xc(e,n)){if(t=n&-n,t===e.callbackPriority)return t;switch(a!==null&&Nm(a),ph(n)){case 2:case 8:n=Dx;break;case 32:n=Lu;break;case 268435456:n=Ix;break;default:n=Lu}return a=Zw.bind(null,e),n=uh(n,a),e.callbackPriority=t,e.callbackNode=n,t}return a!==null&&a!==null&&Nm(a),e.callbackPriority=2,e.callbackNode=null,2}function Zw(e,t){if(wt!==0&&wt!==5)return e.callbackNode=null,e.callbackPriority=0,null;var n=e.callbackNode;if(Mf()&&e.callbackNode!==n)return null;var a=_e;return a=df(e,e===it?a:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),a===0?null:(Vw(e,a,t),Fw(e,aa()),e.callbackNode!=null&&e.callbackNode===n?Zw.bind(null,e):null)}function Z0(e,t){if(Mf())return null;Vw(e,t,!0)}function aA(){mA(function(){(Pe&6)!==0?uh(zx,nA):Kw()})}function $h(){if(yr===0){var e=xo;e===0&&(e=Fd,Fd<<=1,(Fd&261888)===0&&(Fd=256)),yr=e}return yr}function J0(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:hu(e)}function iA(e,t,n,a,i){if(t==="submit"&&n&&n.stateNode===i){var r=J0((i[jn]||null).action),o=a.submitter;o&&(t=(t=o[jn]||null)?J0(t.formAction):o.getAttribute("formAction"),t!==null&&(r=t,o=null));var s=new ff("action","action",null,a,i);e.push({event:s,listeners:[{instance:null,listener:function(){if(a.defaultPrevented){if(yr!==0){var l=new FormData(i,o);Mg(n,{pending:!0,data:l,method:i.method,action:r},null,l)}}else typeof r=="function"&&(s.preventDefault(),l=new FormData(i,o),Mg(n,{pending:!0,data:l,method:i.method,action:r},r,l))},currentTarget:i}]})}}for(du=0;du<hg.length;du++)uu=hg[du],$0=uu.toLowerCase(),W0=uu[0].toUpperCase()+uu.slice(1),Ya($0,"on"+W0);var uu,$0,W0,du;Ya(l1,"onAnimationEnd");Ya(c1,"onAnimationIteration");Ya(d1,"onAnimationStart");Ya("dblclick","onDoubleClick");Ya("focusin","onFocus");Ya("focusout","onBlur");Ya(gC,"onTransitionRun");Ya(hC,"onTransitionStart");Ya(bC,"onTransitionCancel");Ya(u1,"onTransitionEnd");_s("onMouseEnter",["mouseout","mouseover"]);_s("onMouseLeave",["mouseout","mouseover"]);_s("onPointerEnter",["pointerout","pointerover"]);_s("onPointerLeave",["pointerout","pointerover"]);Eo("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Eo("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Eo("onBeforeInput",["compositionend","keypress","textInput","paste"]);Eo("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Eo("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Eo("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var uc="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),rA=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(uc));function Jw(e,t){t=(t&4)!==0;for(var n=0;n<e.length;n++){var a=e[n],i=a.event;a=a.listeners;e:{var r=void 0;if(t)for(var o=a.length-1;0<=o;o--){var s=a[o],l=s.instance,c=s.currentTarget;if(s=s.listener,l!==r&&i.isPropagationStopped())break e;r=s,i.currentTarget=c;try{r(i)}catch(f){Vu(f)}i.currentTarget=null,r=l}else for(o=0;o<a.length;o++){if(s=a[o],l=s.instance,c=s.currentTarget,s=s.listener,l!==r&&i.isPropagationStopped())break e;r=s,i.currentTarget=c;try{r(i)}catch(f){Vu(f)}i.currentTarget=null,r=l}}}}function Re(e,t){var n=t[Qy];n===void 0&&(n=t[Qy]=new Set);var a=e+"__bubble";n.has(a)||($w(t,e,2,!1),n.add(a))}function Qm(e,t,n){var a=0;t&&(a|=4),$w(n,e,a,t)}var fu="_reactListening"+Math.random().toString(36).slice(2);function Wh(e){if(!e[fu]){e[fu]=!0,jx.forEach(function(n){n!=="selectionchange"&&(rA.has(n)||Qm(n,!1,e),Qm(n,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[fu]||(t[fu]=!0,Qm("selectionchange",!1,t))}}function $w(e,t,n,a){switch(SS(t)){case 2:var i=JA;break;case 8:i=$A;break;default:i=ob}n=i.bind(null,t,n,e),i=void 0,!fg||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(i=!0),a?i!==void 0?e.addEventListener(t,n,{capture:!0,passive:i}):e.addEventListener(t,n,!0):i!==void 0?e.addEventListener(t,n,{passive:i}):e.addEventListener(t,n,!1)}function Km(e,t,n,a,i){var r=a;if((t&1)===0&&(t&2)===0&&a!==null)e:for(;;){if(a===null)return;var o=a.tag;if(o===3||o===4){var s=a.stateNode.containerInfo;if(s===i)break;if(o===4)for(o=a.return;o!==null;){var l=o.tag;if((l===3||l===4)&&o.stateNode.containerInfo===i)return;o=o.return}for(;s!==null;){if(o=co(s),o===null)return;if(l=o.tag,l===5||l===6||l===26||l===27){a=r=o;continue e}s=s.parentNode}}a=a.return}Jx(function(){var c=r,f=gh(n),v=[];e:{var g=f1.get(e);if(g!==void 0){var h=ff,w=e;switch(e){case"keypress":if(vu(n)===0)break e;case"keydown":case"keyup":h=YR;break;case"focusin":w="focus",h=Am;break;case"focusout":w="blur",h=Am;break;case"beforeblur":case"afterblur":h=Am;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":h=t0;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":h=zR;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":h=ZR;break;case l1:case c1:case d1:h=qR;break;case u1:h=$R;break;case"scroll":case"scrollend":h=OR;break;case"wheel":h=eC;break;case"copy":case"cut":case"paste":h=HR;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":h=a0;break;case"submit":h=KR;break;case"toggle":case"beforetoggle":h=nC}var x=(t&4)!==0,C=!x&&(e==="scroll"||e==="scrollend"),p=x?g!==null?g+"Capture":null:g;x=[];for(var m=c,b;m!==null;){var y=m;if(b=y.stateNode,y=y.tag,y!==5&&y!==26&&y!==27||b===null||p===null||(y=ac(m,p),y!=null&&x.push(fc(m,y,b))),C)break;m=m.return}0<x.length&&(g=new h(g,w,null,n,f),v.push({event:g,listeners:x}))}}if((t&7)===0){e:{if(h=e==="mouseover"||e==="pointerover",g=e==="mouseout"||e==="pointerout",h&&n!==ug&&(w=n.relatedTarget||n.fromElement)&&(co(w)||w[Gs]))break e;(g||h)&&(w=f.window===f?f:(h=f.ownerDocument)?h.defaultView||h.parentWindow:window,g?(h=n.relatedTarget||n.toElement,g=c,h=h?co(h):null,h!==null&&(C=vc(h),x=h.tag,h!==C||x!==5&&x!==27&&x!==6)&&(h=null)):(g=null,h=c),g!==h&&(x=t0,y="onMouseLeave",p="onMouseEnter",m="mouse",(e==="pointerout"||e==="pointerover")&&(x=a0,y="onPointerLeave",p="onPointerEnter",m="pointer"),C=g==null?w:Ul(g),b=h==null?w:Ul(h),w=new x(y,m+"leave",g,n,f),w.target=C,w.relatedTarget=b,y=null,co(f)===c&&(x=new x(p,m+"enter",h,n,f),x.target=b,x.relatedTarget=C,y=x),C=y,x=g&&h?Wm(g,h,oA):null,g!==null&&ex(v,w,g,x,!1),h!==null&&C!==null&&ex(v,C,h,x,!0)))}e:{if(g=c?Ul(c):window,h=g.nodeName&&g.nodeName.toLowerCase(),h==="select"||h==="input"&&g.type==="file")var N=s0;else if(o0(g))if(a1)N=fC;else{N=dC;var D=cC}else h=g.nodeName,!h||h.toLowerCase()!=="input"||g.type!=="checkbox"&&g.type!=="radio"?c&&mh(c.elementType)&&(N=s0):N=uC;if(N&&(N=N(e,c))){n1(v,N,n,f);break e}D&&D(e,g,c)}switch(D=c?Ul(c):window,e){case"focusin":(o0(D)||D.contentEditable==="true")&&(ms=D,mg=c,Yl=null);break;case"focusout":Yl=mg=ms=null;break;case"mousedown":gg=!0;break;case"contextmenu":case"mouseup":case"dragend":gg=!1,u0(v,n,f);break;case"selectionchange":if(mC)break;case"keydown":case"keyup":u0(v,n,f)}var O;if(vh)e:{switch(e){case"compositionstart":var T="onCompositionStart";break e;case"compositionend":T="onCompositionEnd";break e;case"compositionupdate":T="onCompositionUpdate";break e}T=void 0}else ps?e1(e,n)&&(T="onCompositionEnd"):e==="keydown"&&n.keyCode===229&&(T="onCompositionStart");T&&(Wx&&n.locale!=="ko"&&(ps||T!=="onCompositionStart"?T==="onCompositionEnd"&&ps&&(O=$x()):(gr=f,hh="value"in gr?gr.value:gr.textContent,ps=!0)),D=sf(c,T),0<D.length&&(T=new n0(T,e,null,n,f),v.push({event:T,listeners:D}),O?T.data=O:(O=t1(n),O!==null&&(T.data=O)))),(O=iC?rC(e,n):oC(e,n))&&(T=sf(c,"onBeforeInput"),0<T.length&&(D=new n0("onBeforeInput","beforeinput",null,n,f),v.push({event:D,listeners:T}),D.data=O)),iA(v,e,c,n,f)}Jw(v,t)})}function fc(e,t,n){return{instance:e,listener:t,currentTarget:n}}function sf(e,t){for(var n=t+"Capture",a=[];e!==null;){var i=e,r=i.stateNode;if(i=i.tag,i!==5&&i!==26&&i!==27||r===null||(i=ac(e,n),i!=null&&a.unshift(fc(e,i,r)),i=ac(e,t),i!=null&&a.push(fc(e,i,r))),e.tag===3)return a;e=e.return}return[]}function oA(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function ex(e,t,n,a,i){for(var r=t._reactName,o=[];n!==null&&n!==a;){var s=n,l=s.alternate,c=s.stateNode;if(s=s.tag,l!==null&&l===a)break;s!==5&&s!==26&&s!==27||c===null||(l=c,i?(c=ac(n,r),c!=null&&o.unshift(fc(n,c,l))):i||(c=ac(n,r),c!=null&&o.push(fc(n,c,l)))),n=n.return}o.length!==0&&e.push({event:t,listeners:o})}var sA=/\r\n?/g,lA=/\u0000|\uFFFD/g;function tx(e){return(typeof e=="string"?e:""+e).replace(sA,`
`).replace(lA,"")}function Ww(e,t){return t=tx(t),tx(e)===t}function Fe(e,t,n,a,i,r){switch(n){case"children":if(typeof a=="string")t==="body"||t==="textarea"&&a===""||zs(e,a);else if(typeof a=="number"||typeof a=="bigint")t!=="body"&&zs(e,""+a);else return;break;case"className":$d(e,"class",a);break;case"tabIndex":$d(e,"tabindex",a);break;case"dir":case"role":case"viewBox":case"width":case"height":$d(e,n,a);break;case"style":Zx(e,a,r);return;case"data":if(t!=="object"){$d(e,"data",a);break}case"src":case"href":if(a===""&&(t!=="a"||n!=="href")){e.removeAttribute(n);break}if(a==null||typeof a=="function"||typeof a=="symbol"||typeof a=="boolean"){e.removeAttribute(n);break}a=hu(a),e.setAttribute(n,a);break;case"action":case"formAction":if(typeof a=="function"){e.setAttribute(n,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof r=="function"&&(n==="formAction"?(t!=="input"&&Fe(e,t,"name",i.name,i,null),Fe(e,t,"formEncType",i.formEncType,i,null),Fe(e,t,"formMethod",i.formMethod,i,null),Fe(e,t,"formTarget",i.formTarget,i,null)):(Fe(e,t,"encType",i.encType,i,null),Fe(e,t,"method",i.method,i,null),Fe(e,t,"target",i.target,i,null)));if(a==null||typeof a=="symbol"||typeof a=="boolean"){e.removeAttribute(n);break}a=hu(a),e.setAttribute(n,a);break;case"onClick":a!=null&&(e.onclick=li);return;case"onScroll":a!=null&&Re("scroll",e);return;case"onScrollEnd":a!=null&&Re("scrollend",e);return;case"dangerouslySetInnerHTML":if(a!=null){if(typeof a!="object"||!("__html"in a))throw Error(I(61));if(n=a.__html,n!=null){if(i.children!=null)throw Error(I(60));r?.__html!==n&&(e.innerHTML=n)}}break;case"multiple":e.multiple=a&&typeof a!="function"&&typeof a!="symbol";break;case"muted":e.muted=a&&typeof a!="function"&&typeof a!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(a==null||typeof a=="function"||typeof a=="boolean"||typeof a=="symbol"){e.removeAttribute("xlink:href");break}n=hu(a),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",n);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":a!=null&&typeof a!="function"&&typeof a!="symbol"?e.setAttribute(n,a):e.removeAttribute(n);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"credentialless":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":a&&typeof a!="function"&&typeof a!="symbol"?e.setAttribute(n,""):e.removeAttribute(n);break;case"capture":case"download":a===!0?e.setAttribute(n,""):a!==!1&&a!=null&&typeof a!="function"&&typeof a!="symbol"?e.setAttribute(n,a):e.removeAttribute(n);break;case"cols":case"rows":case"size":case"span":a!=null&&typeof a!="function"&&typeof a!="symbol"&&!isNaN(a)&&1<=a?e.setAttribute(n,a):e.removeAttribute(n);break;case"rowSpan":case"start":a==null||typeof a=="function"||typeof a=="symbol"||isNaN(a)?e.removeAttribute(n):e.setAttribute(n,a);break;case"popover":Re("beforetoggle",e),Re("toggle",e),gu(e,"popover",a);break;case"xlinkActuate":Ci(e,"http://www.w3.org/1999/xlink","xlink:actuate",a);break;case"xlinkArcrole":Ci(e,"http://www.w3.org/1999/xlink","xlink:arcrole",a);break;case"xlinkRole":Ci(e,"http://www.w3.org/1999/xlink","xlink:role",a);break;case"xlinkShow":Ci(e,"http://www.w3.org/1999/xlink","xlink:show",a);break;case"xlinkTitle":Ci(e,"http://www.w3.org/1999/xlink","xlink:title",a);break;case"xlinkType":Ci(e,"http://www.w3.org/1999/xlink","xlink:type",a);break;case"xmlBase":Ci(e,"http://www.w3.org/XML/1998/namespace","xml:base",a);break;case"xmlLang":Ci(e,"http://www.w3.org/XML/1998/namespace","xml:lang",a);break;case"xmlSpace":Ci(e,"http://www.w3.org/XML/1998/namespace","xml:space",a);break;case"is":gu(e,"is",a);break;case"innerText":case"textContent":return;default:if(!(2<n.length)||n[0]!=="o"&&n[0]!=="O"||n[1]!=="n"&&n[1]!=="N")n=CR.get(n)||n,gu(e,n,a);else return}Ue=!0}function $g(e,t,n,a,i,r){switch(n){case"style":Zx(e,a,r);return;case"dangerouslySetInnerHTML":if(a!=null){if(typeof a!="object"||!("__html"in a))throw Error(I(61));if(n=a.__html,n!=null){if(i.children!=null)throw Error(I(60));r?.__html!==n&&(e.innerHTML=n)}}break;case"children":if(typeof a=="string")zs(e,a);else if(typeof a=="number"||typeof a=="bigint")zs(e,""+a);else return;break;case"onScroll":a!=null&&Re("scroll",e);return;case"onScrollEnd":a!=null&&Re("scrollend",e);return;case"onClick":a!=null&&(e.onclick=li);return;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":return;case"innerText":case"textContent":return;default:if(!Gx.hasOwnProperty(n))e:{if(n[0]==="o"&&n[1]==="n"&&(i=n.endsWith("Capture"),r=n.slice(2,i?n.length-7:void 0),t=e[jn]||null,t=t!=null?t[n]:null,typeof t=="function"&&e.removeEventListener(r,t,i),typeof a=="function")){typeof t!="function"&&t!==null&&(n in e?e[n]=null:e.hasAttribute(n)&&e.removeAttribute(n)),e.addEventListener(r,a,i);break e}Ue=!0,n in e?e[n]=a:a===!0?e.setAttribute(n,""):gu(e,n,a)}return}Ue=!0}function dn(e,t,n){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":Re("error",e),Re("load",e);var a=!1,i=!1,r;for(r in n)if(n.hasOwnProperty(r)){var o=n[r];if(o!=null)switch(r){case"src":a=!0;break;case"srcSet":i=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(I(137,t));default:Fe(e,t,r,o,n,null)}}i&&Fe(e,t,"srcSet",n.srcSet,n,null),a&&Fe(e,t,"src",n.src,n,null);return;case"input":Re("invalid",e);var s=r=o=i=null,l=null,c=null;for(a in n)if(n.hasOwnProperty(a)){var f=n[a];if(f!=null)switch(a){case"name":i=f;break;case"type":o=f;break;case"checked":l=f;break;case"defaultChecked":c=f;break;case"value":r=f;break;case"defaultValue":s=f;break;case"children":case"dangerouslySetInnerHTML":if(f!=null)throw Error(I(137,t));break;default:Fe(e,t,a,f,n,null)}}Qx(e,r,s,l,c,o,i,!1);return;case"select":Re("invalid",e),a=o=r=null;for(i in n)if(n.hasOwnProperty(i)&&(s=n[i],s!=null))switch(i){case"value":r=s;break;case"defaultValue":o=s;break;case"multiple":a=s;default:Fe(e,t,i,s,n,null)}t=r,n=o,e.multiple=!!a,t!=null?Ss(e,!!a,t,!1):n!=null&&Ss(e,!!a,n,!0);return;case"textarea":Re("invalid",e),r=i=a=null;for(o in n)if(n.hasOwnProperty(o)&&(s=n[o],s!=null))switch(o){case"value":a=s;break;case"defaultValue":i=s;break;case"children":r=s;break;case"dangerouslySetInnerHTML":if(s!=null)throw Error(I(91));break;default:Fe(e,t,o,s,n,null)}Fx(e,a,i,r);return;case"option":for(l in n)n.hasOwnProperty(l)&&(a=n[l],a!=null)&&(l==="selected"?e.selected=a&&typeof a!="function"&&typeof a!="symbol":Fe(e,t,l,a,n,null));return;case"dialog":Re("beforetoggle",e),Re("toggle",e),Re("cancel",e),Re("close",e);break;case"iframe":case"object":Re("load",e);break;case"video":case"audio":for(a=0;a<uc.length;a++)Re(uc[a],e);break;case"image":Re("error",e),Re("load",e);break;case"details":Re("toggle",e);break;case"embed":case"source":case"link":Re("error",e),Re("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(c in n)if(n.hasOwnProperty(c)&&(a=n[c],a!=null))switch(c){case"children":case"dangerouslySetInnerHTML":throw Error(I(137,t));default:Fe(e,t,c,a,n,null)}return;default:if(mh(t)){for(f in n)n.hasOwnProperty(f)&&(a=n[f],a!==void 0&&$g(e,t,f,a,n,void 0));return}}for(s in n)n.hasOwnProperty(s)&&(a=n[s],a!=null&&Fe(e,t,s,a,n,null))}var cA={};function dA(e,t,n,a){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var i=null,r=null,o=null,s=null,l=null,c=null,f=null;for(h in n){var v=n[h];if(n.hasOwnProperty(h)&&v!=null)switch(h){case"checked":break;case"value":break;case"defaultValue":l=v;default:a.hasOwnProperty(h)||Fe(e,t,h,null,a,v)}}for(var g in a){var h=a[g];if(v=n[g],a.hasOwnProperty(g)&&(h!=null||v!=null))switch(g){case"type":h!==v&&(Ue=!0),r=h;break;case"name":h!==v&&(Ue=!0),i=h;break;case"checked":h!==v&&(Ue=!0),c=h;break;case"defaultChecked":h!==v&&(Ue=!0),f=h;break;case"value":h!==v&&(Ue=!0),o=h;break;case"defaultValue":h!==v&&(Ue=!0),s=h;break;case"children":case"dangerouslySetInnerHTML":if(h!=null)throw Error(I(137,t));break;default:h!==v&&Fe(e,t,g,h,a,v)}}dg(e,o,s,l,c,f,r,i);return;case"select":h=o=s=g=null;for(r in n)if(l=n[r],n.hasOwnProperty(r)&&l!=null)switch(r){case"value":break;case"multiple":h=l;default:a.hasOwnProperty(r)||Fe(e,t,r,null,a,l)}for(i in a)if(r=a[i],l=n[i],a.hasOwnProperty(i)&&(r!=null||l!=null))switch(i){case"value":r!==l&&(Ue=!0),g=r;break;case"defaultValue":r!==l&&(Ue=!0),s=r;break;case"multiple":r!==l&&(Ue=!0),o=r;default:r!==l&&Fe(e,t,i,r,a,l)}t=s,n=o,a=h,g!=null?Ss(e,!!n,g,!1):!!a!=!!n&&(t!=null?Ss(e,!!n,t,!0):Ss(e,!!n,n?[]:"",!1));return;case"textarea":h=g=null;for(s in n)if(i=n[s],n.hasOwnProperty(s)&&i!=null&&!a.hasOwnProperty(s))switch(s){case"value":break;case"children":break;default:Fe(e,t,s,null,a,i)}for(o in a)if(i=a[o],r=n[o],a.hasOwnProperty(o)&&(i!=null||r!=null))switch(o){case"value":i!==r&&(Ue=!0),g=i;break;case"defaultValue":i!==r&&(Ue=!0),h=i;break;case"children":break;case"dangerouslySetInnerHTML":if(i!=null)throw Error(I(91));break;default:i!==r&&Fe(e,t,o,i,a,r)}Kx(e,g,h);return;case"option":for(var w in n)g=n[w],n.hasOwnProperty(w)&&g!=null&&!a.hasOwnProperty(w)&&(w==="selected"?e.selected=!1:Fe(e,t,w,null,a,g));for(l in a)g=a[l],h=n[l],a.hasOwnProperty(l)&&g!==h&&(g!=null||h!=null)&&(l==="selected"?(g!==h&&(Ue=!0),e.selected=g&&typeof g!="function"&&typeof g!="symbol"):Fe(e,t,l,g,a,h));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var x in n)g=n[x],n.hasOwnProperty(x)&&g!=null&&!a.hasOwnProperty(x)&&Fe(e,t,x,null,a,g);for(c in a)if(g=a[c],h=n[c],a.hasOwnProperty(c)&&g!==h&&(g!=null||h!=null))switch(c){case"children":case"dangerouslySetInnerHTML":if(g!=null)throw Error(I(137,t));break;default:Fe(e,t,c,g,a,h)}return;default:if(mh(t)){for(var C in n)g=n[C],n.hasOwnProperty(C)&&g!==void 0&&!a.hasOwnProperty(C)&&$g(e,t,C,void 0,a,g);for(f in a)g=a[f],h=n[f],!a.hasOwnProperty(f)||g===h||g===void 0&&h===void 0||$g(e,t,f,g,a,h);return}}for(var p in n)g=n[p],n.hasOwnProperty(p)&&g!=null&&!a.hasOwnProperty(p)&&Fe(e,t,p,null,a,g);for(v in a)g=a[v],h=n[v],!a.hasOwnProperty(v)||g===h||g==null&&h==null||Fe(e,t,v,g,a,h)}function nx(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function uA(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,n=performance.getEntriesByType("resource"),a=0;a<n.length;a++){var i=n[a],r=i.transferSize,o=i.initiatorType,s=i.duration;if(r&&s&&nx(o)){for(o=0,s=i.responseEnd,a+=1;a<n.length;a++){var l=n[a],c=l.startTime;if(c>s)break;var f=l.transferSize,v=l.initiatorType;f&&nx(v)&&(l=l.responseEnd,o+=f*(l<s?1:(s-c)/(l-c)))}if(--a,t+=8*(r+o)/(i.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var Wg=null,eh=null;function pc(e){return e.nodeType===9?e:e.ownerDocument}function ax(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function eS(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function tS(e,t,n,a){return n=pc(n).createElement(e),n[on]=a,n[jn]=t,dn(n,e,t),en(n),n}function th(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Fm=null;function fA(){var e=window.event;return e&&e.type==="popstate"?e===Fm?!1:(Fm=e,!0):(Fm=null,!1)}var eb=typeof setTimeout=="function"?setTimeout:void 0,pA=typeof clearTimeout=="function"?clearTimeout:void 0,ix=typeof Promise=="function"?Promise:void 0,rx=typeof requestAnimationFrame=="function"?requestAnimationFrame:eb,mA=typeof queueMicrotask=="function"?queueMicrotask:typeof ix<"u"?function(e){return ix.resolve(null).then(e).catch(gA)}:eb;function gA(e){setTimeout(function(){throw e})}function qr(e){return e==="head"}function ox(e,t){var n=t,a=0;do{var i=n.nextSibling;if(e.removeChild(n),i&&i.nodeType===8)if(n=i.data,n==="/$"||n==="/&"){if(a===0){e.removeChild(i),js(t);return}a--}else if(n==="$"||n==="$?"||n==="$~"||n==="$!"||n==="&")a++;else if(n==="html")Jm(e.ownerDocument.documentElement);else if(n==="head"){n=e.ownerDocument.head,Jm(n);for(var r=n.firstChild;r;){var o=r.nextSibling,s=r.nodeName;r[Sc]||s==="SCRIPT"||s==="STYLE"||s==="LINK"&&r.rel.toLowerCase()==="stylesheet"||n.removeChild(r),r=o}}else n==="body"&&Jm(e.ownerDocument.body);n=i}while(n);js(t)}function sx(e,t){var n=e;e=0;do{var a=n.nextSibling;if(n.nodeType===1?t?(n._stashedDisplay=n.style.display,n.style.display="none"):(n.style.display=n._stashedDisplay||"",n.getAttribute("style")===""&&n.removeAttribute("style")):n.nodeType===3&&(t?(n._stashedText=n.nodeValue,n.nodeValue=""):n.nodeValue=n._stashedText||""),a&&a.nodeType===8)if(n=a.data,n==="/$"){if(e===0)break;e--}else n!=="$"&&n!=="$?"&&n!=="$~"&&n!=="$!"||e++;n=a}while(n)}function nS(e,t,n){if(t=CSS.escape(t)!==t?"r-"+btoa(t).replace(/=/g,""):t,e.style.viewTransitionName=t,n!=null&&(e.style.viewTransitionClass=n),n=getComputedStyle(e),n.display==="inline"){if(t=e.getClientRects(),t.length===1)var a=1;else for(var i=a=0;i<t.length;i++){var r=t[i];0<r.width&&0<r.height&&a++}a===1&&(e=e.style,e.display=t.length===1?"inline-block":"block",e.marginTop="-"+n.paddingTop,e.marginBottom="-"+n.paddingBottom)}}function aS(e,t){e=e.style,t=t.style;var n=t!=null?t.hasOwnProperty("viewTransitionName")?t.viewTransitionName:t.hasOwnProperty("view-transition-name")?t["view-transition-name"]:null:null;e.viewTransitionName=n==null||typeof n=="boolean"?"":(""+n).trim(),n=t!=null?t.hasOwnProperty("viewTransitionClass")?t.viewTransitionClass:t.hasOwnProperty("view-transition-class")?t["view-transition-class"]:null:null,e.viewTransitionClass=n==null||typeof n=="boolean"?"":(""+n).trim(),e.display==="inline-block"&&(t==null?e.display=e.margin="":(n=t.display,e.display=n==null||typeof n=="boolean"?"":n,n=t.margin,n!=null?e.margin=n:(n=t.hasOwnProperty("marginTop")?t.marginTop:t["margin-top"],e.marginTop=n==null||typeof n=="boolean"?"":n,t=t.hasOwnProperty("marginBottom")?t.marginBottom:t["margin-bottom"],e.marginBottom=t==null||typeof t=="boolean"?"":t)))}function iS(e,t,n){return n=n.ownerDocument.defaultView,{rect:e,abs:t.position==="absolute"||t.position==="fixed",clip:t.clipPath!=="none"||t.overflow!=="visible"||t.filter!=="none"||t.mask!=="none"||t.mask!=="none"||t.borderRadius!=="0px",view:0<=e.bottom&&0<=e.right&&e.top<=n.innerHeight&&e.left<=n.innerWidth}}function nh(e){var t=e.getBoundingClientRect(),n=getComputedStyle(e);return iS(t,n,e)}function hA(e){var t=e.getBoundingClientRect();t=new DOMRect(t.x+2e4,t.y+2e4,t.width,t.height);var n=getComputedStyle(e);return iS(t,n,e)}function bA(e){return e.documentElement.clientHeight}function vA(e){this.addEventListener("load",e),this.addEventListener("error",e)}function yA(e,t,n,a,i,r,o,s,l){var c=t.nodeType===9?t:t.ownerDocument;try{var f=c.startViewTransition({update:function(){var g=c.defaultView,h=g.navigation&&g.navigation.transition,w=c.fonts.status;a();var x=[];if(w==="loaded"&&(bA(c),c.fonts.status==="loading"&&x.push(c.fonts.ready)),w=x.length,e!==null)for(var C=e.suspenseyImages,p=0,m=0;m<C.length;m++){var b=C[m];if(!b.complete){var y=b.getBoundingClientRect();if(0<y.bottom&&0<y.right&&y.top<g.innerHeight&&y.left<g.innerWidth){if(p+=hS(b),p>Ou){x.length=w;break}b=new Promise(vA.bind(b)),x.push(b)}}}if(0<x.length)return g=Promise.race([Promise.all(x),new Promise(function(N){return setTimeout(N,500)})]).then(i,i),(h?Promise.allSettled([h.finished,g]):g).then(r,r);if(i(),h)return h.finished.then(r,r);r()},types:n});c.__reactViewTransition=f;var v=[];return f.ready.then(function(){for(var g=c.documentElement.getAnimations({subtree:!0}),h=0;h<g.length;h++){var w=g[h],x=w.effect,C=x.pseudoElement;if(C!=null&&C.startsWith("::view-transition")){v.push(w),w=x.getKeyframes();for(var p=C=void 0,m=!0,b=0;b<w.length;b++){var y=w[b],N=y.width;if(C===void 0)C=N;else if(C!==N){m=!1;break}if(N=y.height,p===void 0)p=N;else if(p!==N){m=!1;break}delete y.width,delete y.height,y.transform==="none"&&delete y.transform}m&&C!==void 0&&p!==void 0&&(x.setKeyframes(w),m=getComputedStyle(x.target,x.pseudoElement),m.width!==C||m.height!==p)&&(m=w[0],m.width=C,m.height=p,m=w[w.length-1],m.width=C,m.height=p,x.setKeyframes(w))}}o()},function(g){c.__reactViewTransition===f&&(c.__reactViewTransition=null);try{typeof g=="object"&&g!==null&&g.name==="InvalidStateError"&&(g.message==="View transition was skipped because document visibility state is hidden."||g.message==="Skipping view transition because document visibility state has become hidden."||g.message==="Skipping view transition because viewport size changed."||g.message==="Transition was aborted because of invalid state")&&(g=null),g!==null&&l(g)}finally{a(),i(),o()}}),f.finished.finally(function(){for(var g=0;g<v.length;g++)v[g].cancel();c.__reactViewTransition===f&&(c.__reactViewTransition=null),s()}),f}catch{return a(),i(),o(),null}}function uo(e,t){this._scope=document.documentElement,this._selector="::view-transition-"+e+"("+t+")"}uo.prototype.animate=function(e,t){return t=typeof t=="number"?{duration:t}:rt({},t),t.pseudoElement=this._selector,this._scope.animate(e,t)};uo.prototype.getAnimations=function(){for(var e=this._scope,t=this._selector,n=e.getAnimations({subtree:!0}),a=[],i=0;i<n.length;i++){var r=n[i].effect;r!==null&&r.target===e&&r.pseudoElement===t&&a.push(n[i])}return a};uo.prototype.getComputedStyle=function(){return getComputedStyle(this._scope,this._selector)};function rS(e){return{name:e,group:new uo("group",e),imagePair:new uo("image-pair",e),old:new uo("old",e),new:new uo("new",e)}}function la(e){this._fragmentFiber=e,this._observers=this._eventListeners=null}la.prototype.addEventListener=function(e,t,n){var a=null,i=null;if(!(n!=null&&typeof n!="boolean"&&(a=n.signal||null,a!==null&&a.aborted))){this._eventListeners===null&&(this._eventListeners=[]);var r=this._eventListeners;if(oS(r,e,t,n)===-1){var o=this,s=t;n!=null&&typeof n!="boolean"&&n.once===!0&&(s=function(l){o.removeEventListener(e,t,n),typeof t=="function"?t.call(this,l):t.handleEvent(l)}),a!==null&&(i=o.removeEventListener.bind(o,e,t,n),a.addEventListener("abort",i,{once:!0}),i=a.removeEventListener.bind(a,"abort",i)),a=Vs(n),r.push({type:e,listener:t,optionsOrUseCapture:n,attachedListener:s,cleanup:i}),Bn(this._fragmentFiber.child,!1,xA,e,s,a)}this._eventListeners=r}};function xA(e,t,n,a){return Yt(e).addEventListener(t,n,a),!1}la.prototype.removeEventListener=function(e,t,n){var a=this._eventListeners;if(a!==null&&(t=oS(a,e,t,n),t!==-1)){var i=a[t];n=i.attachedListener;var r=i.cleanup;i=Vs(i.optionsOrUseCapture),Bn(this._fragmentFiber.child,!1,wA,e,n,i),a.splice(t,1),r!==null&&r()}};function wA(e,t,n,a){return Yt(e).removeEventListener(t,n,a),!1}function Vs(e){return e!=null&&typeof e!="boolean"&&(e.once===!0||e.signal instanceof AbortSignal)?{capture:e.capture,passive:e.passive}:e}function lx(e){return e==null?"c=0":typeof e=="boolean"?"c="+(e?"1":"0"):"c="+(e.capture?"1":"0")}function oS(e,t,n,a){if(e.length===0)return-1;a=lx(a);for(var i=0;i<e.length;i++){var r=e[i];if(r.type===t&&r.listener===n&&lx(r.optionsOrUseCapture)===a)return i}return-1}la.prototype.dispatchEvent=function(e){var t=To(this._fragmentFiber);if(t===null)return!0;t=Yt(t);var n=this._eventListeners;if(n!==null&&0<n.length||!e.bubbles){var a=t.nodeType===9?t.createComment(""):document.createTextNode("");if(n)for(var i=0;i<n.length;i++){var r=n[i];a.addEventListener(r.type,r.attachedListener,Vs(r.optionsOrUseCapture))}if(t.appendChild(a),e=a.dispatchEvent(e),n)for(i=0;i<n.length;i++)r=n[i],a.removeEventListener(r.type,r.attachedListener,Vs(r.optionsOrUseCapture));return t.removeChild(a),e}return t.dispatchEvent(e)};la.prototype.focus=function(e){Bn(this._fragmentFiber.child,!0,sS,e,void 0,void 0)};function sS(e,t){return e.tag===6?!1:(e=Yt(e),zA(e,t))}la.prototype.focusLast=function(e){var t=[];Bn(this._fragmentFiber.child,!0,tb,t,void 0,void 0);for(var n=t.length-1;0<=n&&!sS(t[n],e);n--);};function tb(e,t){return t.push(e),!1}la.prototype.blur=function(){var e=To(this._fragmentFiber);e!==null&&(e=Yt(e),e=pc(e).activeElement,e!==null&&Bn(this._fragmentFiber.child,!1,SA,e,void 0,void 0))};function SA(e,t){return e.tag===6?!1:(e=Yt(e),e===t||e.contains(t)?(t.blur(),!0):!1)}la.prototype.observeUsing=function(e){this._observers===null&&(this._observers=new Set),this._observers.add(e),Bn(this._fragmentFiber.child,!1,kA,e,void 0,void 0)};function kA(e,t){return e.tag===6||(e=Yt(e),t.observe(e)),!1}la.prototype.unobserveUsing=function(e){var t=this._observers;if(t!==null&&t.has(e)){t.delete(e),Bn(this._fragmentFiber.child,!1,NA,e,void 0,void 0);for(var n=t=0;n<ja.length;n++){var a=ja[n];a.fragmentInstance===this&&a.observer===e?e.unobserve(a.instance):ja[t++]=a}ja.length=t}};function NA(e,t){return e.tag===6||(e=Yt(e),t.unobserve(e)),!1}var ja=[],Zm=!1;function TA(e,t,n){ja.push({fragmentInstance:e,observer:t,instance:n}),Zm||(Zm=!0,DA(function(){Zm=!1;var a=ja;ja=[];for(var i=0;i<a.length;i++){var r=a[i];r.observer.unobserve(r.instance)}}))}la.prototype.getClientRects=function(){var e=[];return Bn(this._fragmentFiber.child,!1,EA,e,void 0,void 0),e};function EA(e,t){if(e.tag===6){e=e.stateNode;var n=e.ownerDocument.createRange();n.selectNodeContents(e),t.push.apply(t,n.getClientRects())}else e=Yt(e),t.push.apply(t,e.getClientRects());return!1}la.prototype.getRootNode=function(e){var t=To(this._fragmentFiber);return t===null?this:Yt(t).getRootNode(e)};la.prototype.compareDocumentPosition=function(e){var t=To(this._fragmentFiber);if(t===null)return Node.DOCUMENT_POSITION_DISCONNECTED;var n=[];Bn(this._fragmentFiber.child,!1,tb,n,void 0,void 0);var a=Yt(t);if(n.length===0){if(n=a,Py(this._fragmentFiber)){e:{for(t=this._fragmentFiber.return;t!==null;){if(t.tag===4){t=t.stateNode.containerInfo;break e}if(t.tag===3||t.tag===5||t.tag===27)break;t=t.return}t=null}t!=null&&(n=t)}t=this._fragmentFiber;var i=a=n.compareDocumentPosition(e);return n===e?i=Node.DOCUMENT_POSITION_CONTAINS:a&Node.DOCUMENT_POSITION_CONTAINED_BY&&(n=Cx(t)[1],n===null?i=Node.DOCUMENT_POSITION_PRECEDING:(e=Yt(n).compareDocumentPosition(e),i=e===0||e&Node.DOCUMENT_POSITION_FOLLOWING?Node.DOCUMENT_POSITION_FOLLOWING:Node.DOCUMENT_POSITION_PRECEDING)),i|=Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC}t=Yt(n[0]),i=Yt(n[n.length-1]);var r=Py(this._fragmentFiber)?t.parentElement:a;if(r==null)return Node.DOCUMENT_POSITION_DISCONNECTED;a=r.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_CONTAINED_BY,r=r.compareDocumentPosition(i)&Node.DOCUMENT_POSITION_CONTAINED_BY;var o=t.compareDocumentPosition(e),s=i.compareDocumentPosition(e),l=o&Node.DOCUMENT_POSITION_CONTAINED_BY||s&Node.DOCUMENT_POSITION_CONTAINED_BY;return s=a&&r&&o&Node.DOCUMENT_POSITION_FOLLOWING&&s&Node.DOCUMENT_POSITION_PRECEDING,t=a&&t===e||r&&i===e||l||s?Node.DOCUMENT_POSITION_CONTAINED_BY:!a&&t===e||!r&&i===e?Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC:o,t&Node.DOCUMENT_POSITION_DISCONNECTED||t&Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC||MA(t,this._fragmentFiber,n[0],n[n.length-1],e)?t:Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC};function MA(e,t,n,a,i){var r=co(i);if(e&Node.DOCUMENT_POSITION_CONTAINED_BY){if(n=!!r)e:{for(;r!==null;){if(r.tag===7&&(r===t||r.alternate===t)){n=!0;break e}r=r.return}n=!1}return n}if(e&Node.DOCUMENT_POSITION_CONTAINS){if(r===null)return r=i.ownerDocument,i===r||i===r.documentElement||i===r.body;e:{for(r=t,t=To(t);r!==null;){if(!(r.tag!==5&&r.tag!==3&&r.tag!==27||r!==t&&r.alternate!==t)){r=!0;break e}r=r.return}r=!1}return r}return e&Node.DOCUMENT_POSITION_PRECEDING?((t=!!r)&&!(t=r===n)&&(t=Wm(n,r,By),t===null?t=!1:(Bn(t,!0,aR,r,n),r=cs,cs=null,t=r!==null)),t):e&Node.DOCUMENT_POSITION_FOLLOWING?((t=!!r)&&!(t=r===a)&&(t=Wm(a,r,By),t===null?t=!1:(Bn(t,!0,iR,r,a),r=cs,$m=cs=null,t=r!==null)),t):!1}function cx(e,t){var n=e.ownerDocument.createRange();n.selectNodeContents(e),e=n.getBoundingClientRect(),window.scrollTo(window.scrollX+e.left,t?window.scrollY+e.top:window.scrollY+e.bottom-window.innerHeight)}la.prototype.scrollIntoView=function(e){if(typeof e=="object")throw Error(I(566));var t=[];Bn(this._fragmentFiber.child,!1,tb,t,void 0,void 0);var n=e!==!1;if(t.length===0){var a=Cx(this._fragmentFiber);if(a=n?a[1]||a[0]||To(this._fragmentFiber):a[0]||a[1],a===null)return;if(a.tag===6){e=Yt(a),cx(e,n);return}if(a=Yt(a),a.nodeType!==9){if(a.nodeType===11){n="host"in a?a.host:null,n!==null&&n.scrollIntoView(e);return}a.scrollIntoView(e)}}for(a=n?t.length-1:0;a!==(n?-1:t.length);){var i=t[a];i.tag===6?(i=Yt(i),cx(i,n)):Yt(i).scrollIntoView(e),a+=n?-1:1}};function RA(e,t){return e=Yt(e),lS(e,t),!1}function lS(e,t){e.reactFragments==null&&(e.reactFragments=new Set),e.reactFragments.add(t)}function cS(e,t){var n=t._eventListeners;if(n!==null)for(var a=0;a<n.length;a++){var i=n[a];e.addEventListener(i.type,i.attachedListener,Vs(i.optionsOrUseCapture))}e.nodeType!==3&&(n=t._observers,n!==null&&n.forEach(function(r){for(var o=0,s=0;s<ja.length;s++){var l=ja[s];(l.fragmentInstance!==t||l.observer!==r||l.instance!==e)&&(ja[o++]=l)}ja.length=o,r.observe(e)}),lS(e,t))}function CA(e,t){var n=t._eventListeners;if(n!==null)for(var a=0;a<n.length;a++){var i=n[a];e.removeEventListener(i.type,i.attachedListener,Vs(i.optionsOrUseCapture))}e.nodeType!==3&&(n=t._observers,n!==null&&n.forEach(function(r){typeof r.rootMargin=="string"?TA(t,r,e):r.unobserve(e)}),e.reactFragments!=null&&e.reactFragments.delete(t))}function ah(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var n=t;switch(t=t.nextSibling,n.nodeName){case"HTML":case"HEAD":case"BODY":ah(n),uf(n);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(n.rel.toLowerCase()==="stylesheet")continue}e.removeChild(n)}}function AA(e,t,n,a){for(;e.nodeType===1;){var i=n;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!a&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(a){if(!e[Sc])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(r=e.getAttribute("rel"),r==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(r!==i.rel||e.getAttribute("href")!==(i.href==null||i.href===""?null:i.href)||e.getAttribute("crossorigin")!==(i.crossOrigin==null?null:i.crossOrigin)||e.getAttribute("title")!==(i.title==null?null:i.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(r=e.getAttribute("src"),(r!==(i.src==null?null:i.src)||e.getAttribute("type")!==(i.type==null?null:i.type)||e.getAttribute("crossorigin")!==(i.crossOrigin==null?null:i.crossOrigin))&&r&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var r=i.name==null?null:""+i.name;if(i.type==="hidden"&&e.getAttribute("name")===r)return e}else return e;if(e=Ea(e.nextSibling),e===null)break}return null}function OA(e,t,n){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!n||(e=Ea(e.nextSibling),e===null))return null;return e}function dS(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=Ea(e.nextSibling),e===null))return null;return e}function ih(e){return e.data==="$?"||e.data==="$~"}function nb(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function _A(e,t){var n=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||n.readyState!=="loading")t();else{var a=function(){t(),n.removeEventListener("DOMContentLoaded",a)};n.addEventListener("DOMContentLoaded",a),e._reactRetry=a}}function Ea(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var rh=null;function dx(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="/$"||n==="/&"){if(t===0)return Ea(e.nextSibling);t--}else n!=="$"&&n!=="$!"&&n!=="$?"&&n!=="$~"&&n!=="&"||t++}e=e.nextSibling}return null}function ux(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="$"||n==="$!"||n==="$?"||n==="$~"||n==="&"){if(t===0)return e;t--}else n!=="/$"&&n!=="/&"||t++}e=e.previousSibling}return null}function zA(e,t){function n(){a=!0}if(e.ownerDocument.activeElement===e)return!0;var a=!1;try{e.ownerDocument.addEventListener("focus",n,!0),(e.focus||HTMLElement.prototype.focus).call(e,t)}finally{e.ownerDocument.removeEventListener("focus",n,!0)}return a}function DA(e){rx(function(){rx(function(t){return e(t)})})}function uS(e,t,n){switch(t=pc(n),e){case"html":if(e=t.documentElement,!e)throw Error(I(452));return e;case"head":if(e=t.head,!e)throw Error(I(453));return e;case"body":if(e=t.body,!e)throw Error(I(454));return e;default:throw Error(I(451))}}function fS(e,t,n){for(var a in n){var i=n[a];n.hasOwnProperty(a)&&i!=null&&Fe(e,t,a,null,cA,i)}n.dangerouslySetInnerHTML!=null&&(e.textContent=""),e.onclick===li&&(e.onclick=null),uf(e)}function Jm(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);uf(e)}var Ma=new Map,fx=new Set;function mc(e){if(typeof e.getRootNode=="function"){var t=e.getRootNode();if(t.nodeType===9||t.nodeType===11)return t}return e.nodeType===9?e:e.ownerDocument}var ji=Be.d;Be.d={f:IA,r:qA,D:LA,C:HA,L:VA,m:UA,X:BA,S:PA,M:jA};function IA(){var e=ji.f(),t=Tf();return e||t}function qA(e){var t=Ys(e);t!==null&&t.tag===5&&t.type==="form"?Z1(t):ji.r(e)}var Fs=typeof document>"u"?null:document;function pS(e,t,n){var a=Fs;if(a&&typeof t=="string"&&t){var i=ka(t);i='link[rel="'+e+'"][href="'+i+'"]',typeof n=="string"&&(i+='[crossorigin="'+n+'"]'),fx.has(i)||(fx.add(i),e={rel:e,crossOrigin:n,href:t},a.querySelector(i)===null&&(t=a.createElement("link"),dn(t,"link",e),en(t),a.head.appendChild(t)))}}function LA(e){ji.D(e),pS("dns-prefetch",e,null)}function HA(e,t){ji.C(e,t),pS("preconnect",e,t)}function VA(e,t,n){ji.L(e,t,n);var a=Fs;if(a&&e&&t){var i='link[rel="preload"][as="'+ka(t)+'"]';t==="image"&&n&&n.imageSrcSet?(i+='[imagesrcset="'+ka(n.imageSrcSet)+'"]',typeof n.imageSizes=="string"&&(i+='[imagesizes="'+ka(n.imageSizes)+'"]')):i+='[href="'+ka(e)+'"]';var r=i;switch(t){case"style":r=Us(e);break;case"script":r=Zs(e)}if(!(Ma.has(r)||(e=rt({rel:"preload",href:t==="image"&&n&&n.imageSrcSet?void 0:e,as:t},n),Ma.set(r,e),a.querySelector(i)!==null||t==="style"&&a.querySelector(Rc(r))||t==="script"&&a.querySelector(Cc(r))))){var o=a.createElement("link");dn(o,"link",e),t==="style"&&(o[Hu]=!0,o.onload=o.onerror=function(){Bx(o)}),en(o),a.head.appendChild(o)}}}function UA(e,t){ji.m(e,t);var n=Fs;if(n&&e){var a=t&&typeof t.as=="string"?t.as:"script",i='link[rel="modulepreload"][as="'+ka(a)+'"][href="'+ka(e)+'"]',r=i;switch(a){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":r=Zs(e)}if(!Ma.has(r)&&(e=rt({rel:"modulepreload",href:e},t),Ma.set(r,e),n.querySelector(i)===null)){switch(a){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(n.querySelector(Cc(r)))return}a=n.createElement("link"),dn(a,"link",e),en(a),n.head.appendChild(a)}}}function PA(e,t,n){ji.S(e,t,n);var a=Fs;if(a&&e){var i=ws(a).hoistableStyles,r=Us(e);t=t||"default";var o=i.get(r);if(!o){var s={loading:0,preload:null};if(o=a.querySelector(Rc(r)))s.loading=5;else{e=rt({rel:"stylesheet",href:e,"data-precedence":t},n),(n=Ma.get(r))&&ab(e,n);var l=o=a.createElement("link");en(l),dn(l,"link",e),l._p=new Promise(function(c,f){l.onload=c,l.onerror=f}),l.addEventListener("load",function(){s.loading|=1}),l.addEventListener("error",function(){s.loading|=2}),s.loading|=4,Cu(o,t,a)}o={type:"stylesheet",instance:o,count:1,state:s},i.set(r,o)}}}function BA(e,t){ji.X(e,t);var n=Fs;if(n&&e){var a=ws(n).hoistableScripts,i=Zs(e),r=a.get(i);r||(r=n.querySelector(Cc(i)),r||(e=rt({src:e,async:!0},t),(t=Ma.get(i))&&ib(e,t),r=n.createElement("script"),en(r),dn(r,"link",e),n.head.appendChild(r)),r={type:"script",instance:r,count:1,state:null},a.set(i,r))}}function jA(e,t){ji.M(e,t);var n=Fs;if(n&&e){var a=ws(n).hoistableScripts,i=Zs(e),r=a.get(i);r||(r=n.querySelector(Cc(i)),r||(e=rt({src:e,async:!0,type:"module"},t),(t=Ma.get(i))&&ib(e,t),r=n.createElement("script"),en(r),dn(r,"link",e),n.head.appendChild(r)),r={type:"script",instance:r,count:1,state:null},a.set(i,r))}}function px(e,t,n,a){var i=(i=xr.current)?mc(i):null;if(!i)throw Error(I(446));switch(e){case"meta":case"title":return null;case"style":return typeof n.precedence=="string"&&typeof n.href=="string"?(n=Us(n.href),t=ws(i).hoistableStyles,a=t.get(n),a||(a={type:"style",instance:null,count:0,state:null},t.set(n,a)),a):{type:"void",instance:null,count:0,state:null};case"link":if(n.rel==="stylesheet"&&typeof n.href=="string"&&typeof n.precedence=="string"){e=Us(n.href);var r=ws(i).hoistableStyles,o=r.get(e);if(o||(i=i.ownerDocument||i,o={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},r.set(e,o),(r=i.querySelector(Rc(e)))?r._p||(o.instance=r,o.state.loading=5):(r=Ma.get(e),r||(r={rel:"preload",as:"style",href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},Ma.set(e,r)),GA(i,e,r,o.state))),t&&a===null)throw Error(I(528,""));return o}if(t&&a!==null)throw Error(I(529,""));return null;case"script":return t=n.async,n=n.src,typeof n=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(n=Zs(n),t=ws(i).hoistableScripts,a=t.get(n),a||(a={type:"script",instance:null,count:0,state:null},t.set(n,a)),a):{type:"void",instance:null,count:0,state:null};default:throw Error(I(444,e))}}function Us(e){return'href="'+ka(e)+'"'}function Rc(e){return'link[rel="stylesheet"]['+e+"]"}function mS(e){return rt({},e,{"data-precedence":e.precedence,precedence:null})}function GA(e,t,n,a){if(t=e.querySelector('link[rel="preload"][as="style"]['+t+"]")){if(t[Hu]!==!0){a.loading=1;return}}else t=e.createElement("link"),t[Hu]=!0,t.onload=t.onerror=Bx.bind(null,t),dn(t,"link",n),en(t),e.head.appendChild(t);a.preload=t,t.addEventListener("load",function(){return a.loading|=1}),t.addEventListener("error",function(){return a.loading|=2})}function Zs(e){return'[src="'+ka(e)+'"]'}function Cc(e){return"script[async]"+e}function mx(e,t,n){if(t.count++,t.instance===null)switch(t.type){case"style":var a=e.querySelector('style[data-href~="'+ka(n.href)+'"]');if(a)return t.instance=a,en(a),a;var i=rt({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return a=(e.ownerDocument||e).createElement("style"),en(a),dn(a,"style",i),Cu(a,n.precedence,e),t.instance=a;case"stylesheet":i=Us(n.href);var r=e.querySelector(Rc(i));if(r)return t.state.loading|=4,t.instance=r,en(r),r;a=mS(n),(i=Ma.get(i))&&ab(a,i),r=(e.ownerDocument||e).createElement("link"),en(r);var o=r;return o._p=new Promise(function(s,l){o.onload=s,o.onerror=l}),dn(r,"link",a),t.state.loading|=4,Cu(r,n.precedence,e),t.instance=r;case"script":return r=Zs(n.src),(i=e.querySelector(Cc(r)))?(t.instance=i,en(i),i):(a=n,(i=Ma.get(r))&&(a=rt({},n),ib(a,i)),e=e.ownerDocument||e,i=e.createElement("script"),en(i),dn(i,"link",a),e.head.appendChild(i),t.instance=i);case"void":return null;default:throw Error(I(443,t.type))}else t.type==="stylesheet"&&(t.state.loading&4)===0&&(a=t.instance,t.state.loading|=4,Cu(a,n.precedence,e));return t.instance}function Cu(e,t,n){for(var a=n.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),i=a.length?a[a.length-1]:null,r=i,o=0;o<a.length;o++){var s=a[o];if(s.dataset.precedence===t)r=s;else if(r!==i)break}r?r.parentNode.insertBefore(e,r.nextSibling):(t=n.nodeType===9?n.head:n,t.insertBefore(e,t.firstChild))}function ab(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function ib(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var Au=null;function gx(e,t,n){if(Au===null){var a=new Map,i=Au=new Map;i.set(n,a)}else i=Au,a=i.get(n),a||(a=new Map,i.set(n,a));if(a.has(e))return a;for(a.set(e,null),n=n.getElementsByTagName(e),i=0;i<n.length;i++){var r=n[i];if(!(r[Sc]||r[on]||e==="link"&&r.getAttribute("rel")==="stylesheet")&&r.namespaceURI!=="http://www.w3.org/2000/svg"){var o=r.getAttribute(t)||"";o=e+o;var s=a.get(o);s?s.push(r):a.set(o,[r])}}return a}function oh(e,t,n){e=e.ownerDocument||e,e.head.insertBefore(n,t==="title"?e.querySelector("head > title"):null)}function YA(e,t,n){if(n===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;return t.rel==="stylesheet"?(e=t.disabled,typeof t.precedence=="string"&&e==null):!0;case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function hx(e,t){return e==="img"&&t.src!=null&&t.src!==""&&t.onLoad==null&&t.loading!=="lazy"}function gS(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function hS(e){return(e.width||100)*(e.height||100)*(typeof devicePixelRatio=="number"?devicePixelRatio:1)*.25}function bx(e,t){typeof t.decode=="function"&&(e.imgCount++,t.complete||(e.imgBytes+=hS(t),e.suspenseyImages.push(t)),e=KA.bind(e),t.decode().then(e,e))}function XA(e,t,n,a){if(n.type==="stylesheet"&&(typeof a.media!="string"||matchMedia(a.media).matches!==!1)&&(n.state.loading&4)===0){if(n.instance===null){var i=Us(a.href),r=t.querySelector(Rc(i));if(r){t=r._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=gc.bind(e),t.then(e,e)),n.state.loading|=4,n.instance=r,en(r);return}r=t.ownerDocument||t,a=mS(a),(i=Ma.get(i))&&ab(a,i),r=r.createElement("link"),en(r);var o=r;o._p=new Promise(function(s,l){o.onload=s,o.onerror=l}),dn(r,"link",a),n.instance=r}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(n,t),(t=n.state.preload)&&(n.state.loading&3)===0&&(e.count++,n=gc.bind(e),t.addEventListener("load",n),t.addEventListener("error",n))}}var Ou=0;function QA(e,t){return e.stylesheets&&e.count===0&&_u(e,e.stylesheets),0<e.count||0<e.imgCount?function(n){var a=setTimeout(function(){if(e.stylesheets&&_u(e,e.stylesheets),e.unsuspend){var r=e.unsuspend;e.unsuspend=null,r()}},6e4+t);0<e.imgBytes&&Ou===0&&(Ou=62500*uA());var i=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&_u(e,e.stylesheets),e.unsuspend)){var r=e.unsuspend;e.unsuspend=null,r()}},(e.imgBytes>Ou?50:800)+t);return e.unsuspend=n,function(){e.unsuspend=null,clearTimeout(a),clearTimeout(i)}}:null}function bS(e){if(e.count===0&&(e.imgCount===0||!e.waitingForImages)){if(e.stylesheets)_u(e,e.stylesheets);else if(e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}}}function gc(){this.count--,bS(this)}function KA(){this.imgCount--,bS(this)}var lf=null;function _u(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,lf=new Map,t.forEach(FA,e),lf=null,gc.call(e))}function FA(e,t){if(!(t.state.loading&4)){var n=lf.get(e);if(n)var a=n.get(null);else{n=new Map,lf.set(e,n);for(var i=e.querySelectorAll("link[data-precedence],style[data-precedence]"),r=0;r<i.length;r++){var o=i[r];(o.nodeName==="LINK"||o.getAttribute("media")!=="not all")&&(n.set(o.dataset.precedence,o),a=o)}a&&n.set(null,a)}i=t.instance,o=i.getAttribute("data-precedence"),r=n.get(o)||a,r===a&&n.set(null,i),n.set(o,i),this.count++,a=gc.bind(this),i.addEventListener("load",a),i.addEventListener("error",a),r?r.parentNode.insertBefore(i,r.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(i,e.firstChild)),t.state.loading|=4}}var Ps={$$typeof:si,Provider:null,Consumer:null,_currentValue:fo,_currentValue2:fo,_threadCount:0};function ZA(e,t,n,a,i,r,o,s,l){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Tm(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Tm(0),this.hiddenUpdates=Tm(null),this.identifierPrefix=a,this.onUncaughtError=i,this.onCaughtError=r,this.onRecoverableError=o,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=l,this.transitionTypes=null,this.incompleteTransitions=new Map}function vS(e,t,n,a,i,r,o,s,l,c,f,v){return e=new ZA(e,t,n,o,l,c,f,v,s),t=1,r===!0&&(t|=24),r=Un(3,null,null,t),e.current=r,r.stateNode=e,t=Nh(),t.refCount++,e.pooledCache=t,t.refCount++,r.memoizedState={element:a,isDehydrated:n,cache:t},Mh(r),e}function yS(e){return e?(e=bs,e):bs}function xS(e,t,n,a,i,r){i=yS(i),a.context===null?a.context=i:a.pendingContext=i,a=Sr(t),a.payload={element:n},r=r===void 0?null:r,r!==null&&(a.callback=r),n=kr(e,a,t),n!==null&&(Pn(n,e,t),Ql(n,e,t))}function vx(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function rb(e,t){vx(e,t),(e=e.alternate)&&vx(e,t)}function wS(e){if(e.tag===13||e.tag===31){var t=Ro(e,67108864);t!==null&&Pn(t,e,67108864),rb(e,67108864)}}function yx(e){if(e.tag===13||e.tag===31){var t=oa();t=fh(t);var n=Ro(e,t);n!==null&&Pn(n,e,t),rb(e,t)}}var Bs=!0;function JA(e,t,n,a){var i=pe.T;pe.T=null;var r=Be.p;try{Be.p=2,ob(e,t,n,a)}finally{Be.p=r,pe.T=i}}function $A(e,t,n,a){var i=pe.T;pe.T=null;var r=Be.p;try{Be.p=8,ob(e,t,n,a)}finally{Be.p=r,pe.T=i}}function ob(e,t,n,a){if(Bs){var i=sh(a);if(i===null)Km(e,t,a,cf,n),xx(e,a);else if(e5(i,e,t,n,a))a.stopPropagation();else if(xx(e,a),t&4&&-1<WA.indexOf(e)){for(;i!==null;){var r=Ys(i);if(r!==null)switch(r.tag){case 3:if(r=r.stateNode,r.current.memoizedState.isDehydrated){var o=oo(r.pendingLanes);if(o!==0){var s=r;for(s.pendingLanes|=2,s.entangledLanes|=2;o;){var l=1<<31-ra(o);s.entanglements[1]|=l,o&=~l}gi(r),(Pe&6)===0&&(nf=aa()+500,Mc(0,!1))}}break;case 31:case 13:s=Ro(r,2),s!==null&&Pn(s,r,2),Tf(),rb(r,2)}if(r=sh(a),r===null&&Km(e,t,a,cf,n),r===i)break;i=r}i!==null&&a.stopPropagation()}else Km(e,t,a,null,n)}}function sh(e){return e=gh(e),sb(e)}var cf=null;function sb(e){if(cf=null,e=co(e),e!==null){var t=vc(e);if(t===null)e=null;else{var n=t.tag;if(n===13){if(e=Ex(t),e!==null)return e;e=null}else if(n===31){if(e=Mx(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return cf=e,null}function SS(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"fullscreenerror":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"resize":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(pR()){case zx:return 2;case Dx:return 8;case Lu:case mR:return 32;case Ix:return 268435456;default:return 32}default:return 32}}var lh=!1,Mr=null,Rr=null,Cr=null,hc=new Map,bc=new Map,pr=[],WA="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function xx(e,t){switch(e){case"focusin":case"focusout":Mr=null;break;case"dragenter":case"dragleave":Rr=null;break;case"mouseover":case"mouseout":Cr=null;break;case"pointerover":case"pointerout":hc.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":bc.delete(t.pointerId)}}function ql(e,t,n,a,i,r){return e===null||e.nativeEvent!==r?(e={blockedOn:t,domEventName:n,eventSystemFlags:a,nativeEvent:r,targetContainers:[i]},t!==null&&(t=Ys(t),t!==null&&wS(t)),e):(e.eventSystemFlags|=a,t=e.targetContainers,i!==null&&t.indexOf(i)===-1&&t.push(i),e)}function e5(e,t,n,a,i){switch(t){case"focusin":return Mr=ql(Mr,e,t,n,a,i),!0;case"dragenter":return Rr=ql(Rr,e,t,n,a,i),!0;case"mouseover":return Cr=ql(Cr,e,t,n,a,i),!0;case"pointerover":var r=i.pointerId;return hc.set(r,ql(hc.get(r)||null,e,t,n,a,i)),!0;case"gotpointercapture":return r=i.pointerId,bc.set(r,ql(bc.get(r)||null,e,t,n,a,i)),!0}return!1}function kS(e){var t=co(e.target);if(t!==null){var n=vc(t);if(n!==null){if(t=n.tag,t===13){if(t=Ex(n),t!==null){e.blockedOn=t,Xy(e.priority,function(){yx(n)});return}}else if(t===31){if(t=Mx(n),t!==null){e.blockedOn=t,Xy(e.priority,function(){yx(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function zu(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=sh(e.nativeEvent);if(n===null){n=e.nativeEvent;var a=new n.constructor(n.type,n);ug=a,n.target.dispatchEvent(a),ug=null}else return t=Ys(n),t!==null&&wS(t),e.blockedOn=n,!1;t.shift()}return!0}function wx(e,t,n){zu(e)&&n.delete(t)}function t5(){lh=!1,Mr!==null&&zu(Mr)&&(Mr=null),Rr!==null&&zu(Rr)&&(Rr=null),Cr!==null&&zu(Cr)&&(Cr=null),hc.forEach(wx),bc.forEach(wx)}function pu(e,t){e.blockedOn===t&&(e.blockedOn=null,lh||(lh=!0,Xt.unstable_scheduleCallback(Xt.unstable_NormalPriority,t5)))}var mu=null;function Sx(e){mu!==e&&(mu=e,Xt.unstable_scheduleCallback(Xt.unstable_NormalPriority,function(){mu===e&&(mu=null);for(var t=0;t<e.length;t+=3){var n=e[t],a=e[t+1],i=e[t+2];if(typeof a!="function"){if(sb(a||n)===null)continue;break}var r=Ys(n);r!==null&&(e.splice(t,3),t-=3,Mg(r,{pending:!0,data:i,method:n.method,action:a},a,i))}}))}function js(e){function t(l){return pu(l,e)}Mr!==null&&pu(Mr,e),Rr!==null&&pu(Rr,e),Cr!==null&&pu(Cr,e),hc.forEach(t),bc.forEach(t);for(var n=0;n<pr.length;n++){var a=pr[n];a.blockedOn===e&&(a.blockedOn=null)}for(;0<pr.length&&(n=pr[0],n.blockedOn===null);)kS(n),n.blockedOn===null&&pr.shift();if(n=(e.ownerDocument||e).$$reactFormReplay,n!=null)for(a=0;a<n.length;a+=3){var i=n[a],r=n[a+1],o=i[jn]||null;if(typeof r=="function")o||Sx(n);else if(o){var s=null;if(r&&r.hasAttribute("formAction")){if(i=r,o=r[jn]||null)s=o.formAction;else if(sb(i)!==null)continue}else s=o.action;typeof s=="function"?n[a+1]=s:(n.splice(a,3),a-=3),Sx(n)}}}function NS(){function e(r){r.canIntercept&&r.info==="react-transition"&&r.intercept({handler:function(){return new Promise(function(o){return i=o})},focusReset:"manual",scroll:"manual"})}function t(){i!==null&&(i(),i=null),a||setTimeout(n,20)}function n(){if(!a&&!navigation.transition){var r=navigation.currentEntry;r&&r.url!=null&&navigation.navigate(r.url,{state:r.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var a=!1,i=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(n,100),function(){a=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),i!==null&&(i(),i=null)}}}function lb(e){this._internalRoot=e}Rf.prototype.render=lb.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(I(409));var n=t.current,a=oa();xS(n,a,e,t,null,null)};Rf.prototype.unmount=lb.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;xS(e.current,2,null,e,null,null),Tf(),t[Gs]=null}};function Rf(e){this._internalRoot=e}Rf.prototype.unstable_scheduleHydration=function(e){if(e){var t=Px();e={blockedOn:null,target:e,priority:t};for(var n=0;n<pr.length&&t!==0&&t<pr[n].priority;n++);pr.splice(n,0,e),n===0&&kS(e)}};var kx=Nx.version;if(kx!=="19.3.1")throw Error(I(527,kx,"19.3.1"));Be.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(I(188)):(e=Object.keys(e).join(","),Error(I(268,e)));return e=nR(t),e=e!==null?Rx(e):null,e=e===null?null:e.stateNode,e};var n5={bundleType:0,version:"19.3.1",rendererPackageName:"react-dom",currentDispatcherRef:pe,reconcilerVersion:"19.3.1"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(Ll=__REACT_DEVTOOLS_GLOBAL_HOOK__,!Ll.isDisabled&&Ll.supportsFiber))try{yc=Ll.inject(n5),ia=Ll}catch{}var Ll;Cf.createRoot=function(e,t){if(!Tx(e))throw Error(I(299));var n=!1,a="",i=iw,r=rw,o=ow;return t!=null&&(t.unstable_strictMode===!0&&(n=!0),t.identifierPrefix!==void 0&&(a=t.identifierPrefix),t.onUncaughtError!==void 0&&(i=t.onUncaughtError),t.onCaughtError!==void 0&&(r=t.onCaughtError),t.onRecoverableError!==void 0&&(o=t.onRecoverableError)),t=vS(e,1,!1,null,null,n,a,null,i,r,o,NS),e[Gs]=t.current,Wh(e),new lb(t)};Cf.hydrateRoot=function(e,t,n){if(!Tx(e))throw Error(I(299));var a=!1,i="",r=iw,o=rw,s=ow,l=null;return n!=null&&(n.unstable_strictMode===!0&&(a=!0),n.identifierPrefix!==void 0&&(i=n.identifierPrefix),n.onUncaughtError!==void 0&&(r=n.onUncaughtError),n.onCaughtError!==void 0&&(o=n.onCaughtError),n.onRecoverableError!==void 0&&(s=n.onRecoverableError),n.formState!==void 0&&(l=n.formState)),t=vS(e,1,!0,t,n??null,a,i,l,r,o,s,NS),t.context=yS(null),n=t.current,a=oa(),a=fh(a),i=Sr(a),i.callback=null,kr(n,i,a),n=a,t.current.lanes=n,wc(t,n),gi(t),e[Gs]=t.current,Wh(e),new Rf(t)};Cf.version="19.3.1"});var RS=ei((S_,MS)=>{"use strict";function ES(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(ES)}catch(e){console.error(e)}}ES(),MS.exports=TS()});var qN=ei(Jf=>{"use strict";var U4=Symbol.for("react.transitional.element"),P4=Symbol.for("react.fragment");function IN(e,t,n){var a=null;if(n!==void 0&&(a=""+n),t.key!==void 0&&(a=""+t.key),"key"in t){n={};for(var i in t)i!=="key"&&(n[i]=t[i])}else n=t;return t=n.ref,{$$typeof:U4,type:e,key:a,ref:t!==void 0?t:null,props:n}}Jf.Fragment=P4;Jf.jsx=IN;Jf.jsxs=IN});var re=ei((K_,LN)=>{"use strict";LN.exports=qN()});var PE=X(RS(),1);var be=X(Ye(),1);var ca=class extends Error{constructor(t){super(t),this.name="RpcTransportError"}},Ao=class extends Error{error;constructor(t){super(t.message),this.name="RpcCallError",this.error=t}},CS=0,a5=6e4;function i5(){let e=typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`;return CS+=1,`${e}-${CS.toString(36)}`}async function fe(e,t,n,a=a5){let i=i5(),r=new AbortController,o=!1,s;a>0&&(s=setTimeout(()=>{o=!0,r.abort()},a));let l=()=>{r.abort()};n?.addEventListener("abort",l,{once:!0});let c;try{try{c=await fetch(`/m/api/${e}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({type:"client-request",rpcId:i,method:e,payload:t}),signal:r.signal})}catch(h){let w;throw h instanceof DOMException&&h.name==="AbortError"?w=o?"timeout":"aborted":w=h instanceof Error?h.message:String(h),new ca(o?"请求超时，请重试":`transport failed: ${w}`)}if(!c.ok){let h;if(c.status!==403)try{let w=await c.json();typeof w?.error?.message=="string"&&(h=w.error.message)}catch{}throw new ca(h!==void 0?h:`HTTP ${String(c.status)}`)}let f;try{f=await c.json()}catch(h){throw h instanceof DOMException&&h.name==="AbortError"?new ca(o?"请求超时，请重试":"请求超时或已取消，请重试"):new ca("malformed response body")}let v=f;if(v?.type!=="server-response"||v.rpcId!==i)throw new ca("response envelope mismatch");let g=v.result;if(g?.ok===!0)return g.value;throw g?.ok===!1&&g.error!==void 0?new Ao(g.error):new ca("malformed result envelope")}finally{s!==void 0&&clearTimeout(s),n?.removeEventListener("abort",l)}}async function Af(){return await fe("settings.read",{})}async function Js(e,t,n){let a={ns:e,ops:t};n!==void 0&&(a.expectedRevision=n),await fe("settings.mutate",a)}var r5=5e3,cb,AS;async function Ac(){let e=AS;if(e!==void 0&&Date.now()-e.at<r5)return e.items;let t=cb;if(t!==void 0)return t;let n=fe("workspace.list",{}).then(({items:a})=>(AS={at:Date.now(),items:a},a)).finally(()=>{cb=void 0});return cb=n,n}async function Of(){return await fe("mobile.preferences",{})}async function Oc(){return await fe("push.config",{get:!0})}async function _c(e){await fe("push.config",{set:e})}async function OS(){await fe("push.config",{test:!0})}async function _S(e){await fe("push.subscribe",{subscription:e})}async function zS(){await fe("push.unsubscribe",{})}async function DS(){return await fe("mobile.notifyEvents",{})}async function IS(){return await fe("mobile.latestVersion",{})}async function qS(e,t){return await fe("mobile.readAttachment",{sessionId:e,attachmentId:t})}async function LS(){return await fe("mobile.diagnostics",{})}async function HS(e,t){return await fe("mobile.perf",{capture:e,label:t})}async function VS(e,t){return await fe("mobile.error",{report:e,label:t})}async function US(){return await fe("mobile.runningSessions",{})}async function Lr(e,t){return await fe("session.list",{...e===void 0?{}:{cursor:e},...t===void 0?{}:{workspaceId:t}})}async function _f(e){return await fe("mobile.searchAll",{query:e})}async function zf(e,t){return await fe("mobile.searchMessages",{sessionId:e,query:t})}async function Df(){return await fe("agentPreset.list",{})}async function PS(e={}){return await fe("session.create",e)}async function Gi(e,t,n=25,a){return await fe("session.history",{sessionId:e,maxMessages:n,...t!==void 0?{beforeSeq:t}:{}},a)}async function BS(e,t,n=25,a){return await fe("mobile.readChat",{sessionId:e,...t!==void 0?{beforeSeq:t}:{},...n!==25?{maxRows:n}:{}},a)}async function db(e,t){await fe("mobile.observe",e===void 0?{}:{sessionId:e},t)}var o5=200;async function jS(e,t){let n=e.filter(i=>i!=="").slice(0,o5);return n.length===0?[]:(await fe("mobile.previews",{sessionIds:n},t)).items}async function Oo(e,t){await fe("session.prompt",{sessionId:e,mode:"queue",content:t})}function If(e){let t=Array.isArray(e.message?.content)?e.message.content:[],n=t.length>0&&t.every(i=>i.type==="text"&&typeof i.text=="string"),a=n?t.map(i=>i.text).join(""):t.map(i=>i.type==="text"&&typeof i.text=="string"?i.text:`[${i.type??"内容"}]`).join(" ").trim();return{id:e.id,placement:e.placement,text:a,editable:n}}async function qf(e,t,n){await fe("session.updateQueue",{sessionId:e,itemId:t,action:n})}async function GS(e){return(await fe("mobile.commands",{sessionId:e})).items??[]}async function zc(e,t){return await fe("mobile.commandExec",{sessionId:e,line:t},void 0,18e4)}async function YS(e,t){return(await fe("mobile.transcribe",{audio:e,services:t},void 0,18e4)).text}async function XS(){return(await fe("mobile.voiceServices",{})).services}async function ub(e){return await fe("mobile.usage",e===!0?{refresh:!0}:{})}async function QS(e,t){return await fe("session.rename",{sessionId:e,title:t})}async function KS(e){return await fe("session.cancel",{sessionId:e})}async function FS(e){return await fe("subagent.list",{parentSessionId:e})}async function Dc(e){return await fe("session.models",{sessionId:e})}async function Lf(e,t){return await fe("session.selectModel",{sessionId:e,provider:t.provider,model:t.model,...t.reasoningEffort!==void 0?{reasoningEffort:t.reasoningEffort}:{}})}async function ZS(e){return await fe("mobile.pending",{sessionId:e})}async function JS(e,t,n,a){await fe("mobile.respond",{rpcId:e,response:{sessionId:t,approvalId:n,outcome:a}})}async function $S(e,t,n){await fe("mobile.respond",{rpcId:e,response:{sessionId:t,answer:n}})}async function WS(e){return await fe("mobile.listDirectory",e===void 0?{}:{path:e})}async function Hf(e,t){return await fe("mobile.readFile",t===void 0?{path:e}:{path:e,sessionId:t})}async function ek(e){return await fe("workspace.create",{path:e})}async function tk(e,t){return await fe("workspace.rename",{workspaceId:e,title:t})}async function nk(e){return await fe("workspace.delete",{workspaceId:e})}async function Ic(e){return await fe("workspace.archiveSession",{sessionId:e})}async function ak(){return await fe("pair.devices",{})}async function ik(e){return await fe("pair.revoke",{deviceId:e})}async function rk(e,t){return await fe("pair.rename",{deviceId:e,name:t})}async function ok(e){return await fe("pair.setPrimary",{deviceId:e})}function et(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function De(e){return typeof e=="string"?e:void 0}function Qt(e){return typeof e=="number"&&Number.isFinite(e)?e:void 0}var s5=["pending","in_progress","completed"];function pb(e){if(!et(e))return;let t=e.todos;if(!Array.isArray(t))return;let n=[];for(let a of t){if(!et(a))return;let i=De(a.content),r=De(a.status);if(i===void 0||r===void 0||!s5.includes(r))return;n.push({content:i,status:r})}return n}function l5(e,t){if(t.type==="todo/write"){let n=pb(t.data);return n===void 0?e:{seq:t.seq,items:n}}if(t.type==="turn/end"&&e!==void 0)return{seq:e.seq,items:e.items.map(n=>n.status==="in_progress"?{...n,status:"completed"}:n)};if(t.type!=="turn/start")return e}function dk(e){let t;for(let n of e)t=l5(t,n);return t}function _o(e,t){return`${e}#${String(t)}`}function uk(e){return fk(e,"text")}function c5(e){if(!Array.isArray(e))return[];let t=[];for(let n of e){if(n===null||typeof n!="object")continue;let a=n;if(a.type!=="image")continue;let i=et(a.attachment)?a.attachment:a,r=De(i.attachmentId),o=De(i.mediaType);if(r===void 0||o===void 0)continue;let s=Qt(i.bytes),l=De(i.name);t.push({attachmentId:r,mediaType:o,width:Qt(i.width)??0,height:Qt(i.height)??0,...s===void 0?{}:{bytes:s},...l===void 0?{}:{name:l}})}return t}function d5(e){return fk(e,"reasoning")}function fk(e,t){if(!Array.isArray(e))return"";let n="";for(let a of e){if(!et(a)||a.type!==t)continue;let i=De(a.text);i!==void 0&&(n+=i)}return n}function u5(e){if(!Array.isArray(e))return[];let t=[];for(let n of e){if(!et(n))continue;let a=n.type;if(a!=="text"&&a!=="reasoning")continue;let i=De(n.text);i===void 0||i===""||t.push(a==="reasoning"?{kind:"reasoning",text:i}:{kind:"text",text:i})}return t}function f5(e){if(!et(e))return null;let t,n="text",a,i,r,o=e.chunk;if(et(o)){if(o.type!=="text-delta"&&o.type!=="reasoning-delta")return null;t=De(o.text),n=o.type==="reasoning-delta"?"reasoning":"text",i=Qt(e.turn),r=Qt(e.step),a=De(e.messageId)??De(e.id)}else t=De(e.text),n=De(e.kind)==="reasoning"?"reasoning":"text",a=De(e.messageId)??De(e.id),i=Qt(e.turn),r=Qt(e.step);if(t===void 0)return null;let s={text:t,kind:n};return a!==void 0&&(s.id=a),i!==void 0&&(s.turn=i),r!==void 0&&(s.step=r),s}function fb(e,t){let n=e===void 0?[]:[...e],a={messages:n,byId:new Map,pendingByTurnStep:new Map,turnStepMessage:new Map,messageTurn:new Map,toolNames:new Map,turnStarts:new Map,presented:new Map,maxSeq:t??-1};for(let i of n){if(i.seq>a.maxSeq&&(a.maxSeq=i.seq),a.byId.set(i.id,i),i.kind!=="assistant")continue;let r=pk(i.id),o=zo(i.turn,i.step)??(r===void 0?void 0:zo(r.turn,r.step));o!==void 0&&(a.turnStepMessage.set(o,i),i.pending===!0&&a.pendingByTurnStep.set(o,i)),i.turn!==void 0?a.messageTurn.set(i.id,i.turn):r!==void 0&&a.messageTurn.set(i.id,r.turn),i.tools!==void 0&&i.tools.length>0&&a.toolNames.set(i.id,new Set(i.tools.map(s=>s.name)))}return a}function zo(e,t){return e===void 0||t===void 0?void 0:`${e}.${t}`}function pk(e){if(!e.startsWith("assistant,"))return;let t=e.slice(10),n=t.indexOf("#"),a=n===-1?t:t.slice(0,n),i=a.indexOf(".");if(i<=0||i===a.length-1)return;let r=Number(a.slice(0,i)),o=Number(a.slice(i+1));if(!(!Number.isInteger(r)||!Number.isInteger(o)))return{turn:r,step:o}}function hi(e,t,n){let a=e.messages.indexOf(t);if(a===-1&&(a=e.messages.findIndex(i=>i.id===t.id),a===-1&&t.turn!==void 0))for(let i=e.messages.length-1;i>=0;i-=1){let r=e.messages[i];if(r!==void 0&&r.kind==="assistant"&&r.turn===t.turn){a=i;break}}a===-1?e.messages.push(n):e.messages[a]=n,e.byId.delete(t.id),e.byId.set(n.id,n)}function $s(e,t,n,a){t!==void 0&&(e.pendingByTurnStep.get(t)===n&&e.pendingByTurnStep.set(t,a),e.turnStepMessage.get(t)===n&&e.turnStepMessage.set(t,a))}function mb(e){let t=zo(e.turn,e.step);if(t!==void 0)return t;let n=pk(e.id);return n===void 0?void 0:zo(n.turn,n.step)}function p5(e,t){switch(t.seq>e.maxSeq&&(e.maxSeq=t.seq),t.type){case"user/message":m5(e,t);break;case"assistant/message":g5(e,t);break;case"assistant/chunk":case"message/chunk":k5(e,t);break;case"message/update":N5(e,t);break;case"message/delete":E5(e,t);break;case"turn/end":D5(e,t);break;case"tool/call":M5(e,t);break;case"tool/result":R5(e,t);break;case"turn/start":O5(e,t);break;case"deliverables/presented":_5(e,t);break;case"command/run":C5(e,t);break;case"command/done":A5(e,t);break;default:break}}function m5(e,t){let n=et(t.data)?t.data:{},a=De(n.id)??_o("user",t.seq),i=uk(n.content),r=c5(n.content),o=et(n.source)?n.source:{},s=De(o.kind),l=e.byId.get(a);if(l!==void 0){hi(e,l,{...l,...s!==void 0?{sourceKind:s}:{},...r.length>0?{images:r}:{},text:i,seq:t.seq,time:t.time});return}let c={id:a,kind:"user",text:i,...r.length>0?{images:r}:{},...s!==void 0?{sourceKind:s}:{},seq:t.seq,time:t.time};e.messages.push(c),e.byId.set(a,c)}function g5(e,t){let n=et(t.data)?t.data:{},a=et(n.message)?n.message:n,i=De(a.id)??De(n.id)??_o("assistant",t.seq),r=Qt(n.turn),o=Qt(n.step),s=uk(a.content),l=d5(a.content),c=zo(r,o),f=h5(n),v=e.byId.get(i);if(v===void 0&&c!==void 0&&(v=e.pendingByTurnStep.get(c)),v!==void 0){let w={...v,id:v.id.includes("#")?i:v.id,text:s,...l!==""?{reasoning:l}:{},flow:x5(v.flow,v.text,s,t.seq),...f!==void 0?{usage:f}:{},seq:t.seq,time:t.time,pending:!1,...o!==void 0?{step:o}:{}};if(hi(e,v,w),$s(e,c,v,w),r!==void 0&&e.messageTurn.set(w.id,r),v.id!==w.id){let x=e.toolNames.get(v.id);x!==void 0&&(e.toolNames.delete(v.id),e.toolNames.set(w.id,x)),e.messageTurn.delete(v.id),c!==void 0&&e.pendingByTurnStep.delete(c)}return}let g=u5(a.content),h={id:i,kind:"assistant",text:s,...g.length>0?{flow:g}:s!==""?{flow:[{kind:"text",text:s}]}:{},...l!==""?{reasoning:l}:{},...f!==void 0?{usage:f}:{},...r!==void 0?{turn:r}:{},...o!==void 0?{step:o}:{},seq:t.seq,time:t.time};if(e.messages.push(h),e.byId.set(i,h),c!==void 0&&(e.pendingByTurnStep.delete(c),e.turnStepMessage.set(c,h)),r!==void 0&&e.messageTurn.set(i,r),r!==void 0&&e.turnStepMessage.size>1)for(let[w,x]of e.turnStepMessage){if(x===h)continue;let C=Number(w.slice(0,w.indexOf(".")));Number.isInteger(C)&&C<r&&e.turnStepMessage.delete(w)}}function h5(e){let t=e.usage;if(!et(t))return;let n=Qt(t.inputTokens),a=Qt(t.outputTokens);if(n===void 0||a===void 0)return;let i={inputTokens:n,outputTokens:a},r=Qt(t.cacheReadTokens),o=Qt(t.cacheWriteTokens);return r!==void 0&&(i.cacheReadTokens=r),o!==void 0&&(i.cacheWriteTokens=o),i}function b5(e,t,n){if(e===void 0||e.length===0)return[{kind:"text",text:t,...n!==void 0?{seq:n}:{}}];let a=e[e.length-1];return a.kind==="text"&&(n===void 0||a.seq===void 0||a.seq===n)?[...e.slice(0,-1),{kind:"text",text:a.text+t,...a.seq!==void 0||n!==void 0?{seq:a.seq??n}:{}}]:[...e,{kind:"text",text:t,...n!==void 0?{seq:n}:{}}]}function v5(e,t){if(e===void 0||e.length===0)return[{kind:"reasoning",text:t}];let n=e[e.length-1];return n!==void 0&&n.kind==="reasoning"?[...e.slice(0,-1),{kind:"reasoning",text:n.text+t,...n.seq!==void 0?{seq:n.seq}:{}}]:[...e,{kind:"reasoning",text:t}]}function y5(e,t){return[...e??[],{kind:"tool",callId:t}]}function x5(e,t,n,a){if(n===t)return e??[];let i=(e??[]).filter(r=>r.kind!=="text");return n===""?i:[...i,{kind:"text",text:n,seq:a}]}function w5(e,t){if(e===void 0)return t;if(t===void 0)return e;let n=new Set;for(let a of[e,t])for(let i of a.replace(/^使用\s*/,"").split(" / ")){let r=i.trim();r!==""&&r!=="undefined"&&n.add(r)}return n.size===0?void 0:`使用 ${[...n].join(" / ")}`}function sk(e,t){return e===void 0||e.some(n=>n.kind!=="tool"&&n.seq!==void 0)?e:e.map(n=>n.kind==="tool"?n:{...n,seq:t})}function S5(e,t){if(e===void 0)return t??[];if(t===void 0)return e;let n=[...e],a=t[0];if(a!==void 0&&a.kind==="text"){let i=n[n.length-1];if(i!==void 0&&i.kind==="text"&&(i.seq===void 0||a.seq===void 0||i.seq===a.seq))return n[n.length-1]={kind:"text",text:i.text+(i.text!==""&&a.text!==""?`

`:"")+a.text,...i.seq!==void 0||a.seq!==void 0?{seq:i.seq??a.seq}:{}},[...n,...t.slice(1)]}return[...n,...t]}function lk(e,t){if(t===void 0)return{};let n=e.turnStarts.get(t);return{turn:t,...n!==void 0?{turnStartAt:n}:{}}}function k5(e,t){let n=f5(t.data);if(n===null)return;let a=zo(n.turn,n.step),i;if(n.id!==void 0?(i=e.byId.get(n.id),i===void 0&&a!==void 0&&(i=e.pendingByTurnStep.get(a)??e.turnStepMessage.get(a))):a!==void 0&&(i=e.pendingByTurnStep.get(a)??e.turnStepMessage.get(a)),i!==void 0&&i.kind==="assistant"){let s=n.kind==="reasoning"?{...i,reasoning:(i.reasoning??"")+n.text,seq:t.seq,time:t.time,flow:v5(i.flow,n.text)}:{...i,text:i.text+n.text,seq:t.seq,time:t.time,flow:b5(i.flow,n.text)};hi(e,i,s),$s(e,a,i,s);return}let r=n.id??_o(a!==void 0?`assistant,${a}`:"assistant",t.seq),o=n.kind==="reasoning"?{id:r,kind:"assistant",text:"",reasoning:n.text,seq:t.seq,time:t.time,firstSeenAt:t.time,pending:!0,flow:[{kind:"reasoning",text:n.text}],...lk(e,n.turn),...n.step!==void 0?{step:n.step}:{}}:{id:r,kind:"assistant",text:n.text,seq:t.seq,time:t.time,firstSeenAt:t.time,pending:!0,flow:[{kind:"text",text:n.text,seq:t.seq}],...lk(e,n.turn),...n.step!==void 0?{step:n.step}:{}};e.messages.push(o),e.byId.set(r,o),a!==void 0&&(e.pendingByTurnStep.set(a,o),e.turnStepMessage.set(a,o)),n.turn!==void 0&&e.messageTurn.set(r,n.turn)}function mk(e,t){let n=et(t.data)?t.data:{},a=De(n.id);if(a!==void 0){let r=e.byId.get(a);if(r!==void 0)return r}let i=Qt(n.seq??n.messageSeq);if(i!==void 0)return e.messages.find(r=>r.seq===i)}function N5(e,t){let n=mk(e,t);if(n===void 0)return;let a=et(t.data)?t.data:{},i=De(a.text),r={...n,...i!==void 0?{text:i}:{},seq:t.seq,time:t.time};hi(e,n,r),$s(e,mb(n),n,r)}function T5(e,t){let n=e.messages.indexOf(t);n!==-1&&e.messages.splice(n,1),e.byId.delete(t.id),e.messageTurn.delete(t.id),e.toolNames.delete(t.id);for(let[a,i]of e.turnStepMessage)i===t&&e.turnStepMessage.delete(a);for(let[a,i]of e.pendingByTurnStep)i===t&&e.pendingByTurnStep.delete(a)}function E5(e,t){let n=mk(e,t);n!==void 0&&T5(e,n)}function M5(e,t){let n=et(t.data)?t.data:{},a=De(n.name);if(a===void 0)return;let i=Qt(n.turn),r=Qt(n.step),o=zo(i,r),s=o===void 0?void 0:e.turnStepMessage.get(o);if(s===void 0&&o!==void 0){let m=_o(`assistant,${o}`,t.seq),b={id:m,kind:"assistant",text:"",seq:t.seq,time:t.time,firstSeenAt:t.time,pending:!0,turn:i,step:r};e.messages.push(b),e.byId.set(m,b),e.turnStepMessage.set(o,b),e.pendingByTurnStep.set(o,b),i!==void 0&&e.messageTurn.set(m,i),s=b}if(s===void 0&&i!==void 0)for(let m=e.messages.length-1;m>=0;m--){let b=e.messages[m];if(b!==void 0&&b.kind==="assistant"&&e.messageTurn.get(b.id)===i){s=b;break}}if(s===void 0&&i===void 0)for(let m=e.messages.length-1;m>=0;m--){let b=e.messages[m];if(b!==void 0&&b.kind==="assistant"){s=b;break}}if(s===void 0)return;let l=e.toolNames.get(s.id)??new Set,c=!l.has(a);c&&(l.add(a),e.toolNames.set(s.id,l));let f=De(n.callId)??`${a}#${String(t.seq)}`,v=De(n.arguments),g=gk(t.view),h=s.tools??[],w=h.findIndex(m=>m.callId===f),x=w===-1,C=x?[...h,{callId:f,name:a,state:"running",...v!==void 0?{arguments:v}:{},...g!==void 0?{view:g}:{}}]:h.map((m,b)=>b===w?{...m,...v!==void 0?{arguments:v}:{},...g!==void 0?{view:g}:{}}:m),p={...s,...c?{toolSummary:`使用 ${[...l].join(" / ")}`}:{},...x||v!==void 0?{tools:C}:{},...x?{flow:y5(s.flow,f)}:{},seq:t.seq,time:t.time};hi(e,s,p),$s(e,o,s,p)}function R5(e,t){let n=et(t.data)?t.data:{},a=et(n.message)?n.message:{},i=et(a.source)?a.source:{},r=De(i.callId);if(r===void 0)return;let o=gk(t.view),s=a.isError===!0||a.error!==void 0?"error":"ok";for(let l of e.messages){if(l.kind!=="assistant"||l.tools===void 0)continue;let c=l.tools.findIndex(g=>g.callId===r);if(c===-1)continue;let f=l.tools.map((g,h)=>h===c?{...g,state:s,...o!==void 0?{view:o}:{}}:g),v={...l,tools:f,seq:t.seq,time:t.time};hi(e,l,v),$s(e,mb(l),l,v);return}}function gk(e){if(!et(e))return;let t=e.view;if(!et(t)||t.card!=="diff")return;let n=t.diffs;if(!Array.isArray(n))return;let a=[];for(let r of n){if(!et(r))return;let o=De(r.path),s=De(r.newText);if(o===void 0||s===void 0)return;let l=r.oldText;a.push({path:o,oldText:typeof l=="string"?l:null,newText:s})}let i=De(t.title);return{card:"diff",...i!==void 0?{title:i}:{},diffs:a}}function C5(e,t){let n=et(t.data)?t.data:{},a=De(n.commandId)??_o("command",t.seq),i=e.byId.get(a);if(i!==void 0&&i.kind==="command"&&i.commandPhase!=="running")return;let r=De(n.name)??"",o=De(n.args)??"",s={id:a,kind:"command",text:"",commandLine:o===""?`/${r}`:`/${r} ${o}`,commandPhase:"running",seq:t.seq,time:t.time};i!==void 0?hi(e,i,s):(e.messages.push(s),e.byId.set(s.id,s))}function A5(e,t){let n=et(t.data)?t.data:{},a=De(n.commandId)??_o("command",t.seq),i=De(n.kind)==="error"?"error":"success",r=De(n.text)??"",o=e.byId.get(a),s=o!==void 0&&o.kind==="command"?o.commandLine:void 0,l=r!==""?r:s!==void 0?`${s} · 已执行`:"命令已执行",c={id:a,kind:"command",text:l,...s!==void 0?{commandLine:s}:{},commandPhase:i,seq:t.seq,time:t.time};o!==void 0?hi(e,o,c):(e.messages.push(c),e.byId.set(c.id,c))}function O5(e,t){let n=et(t.data)?t.data:{},a=Qt(n.turn);a!==void 0&&e.turnStarts.set(a,t.time)}function _5(e,t){let n=et(t.data)?t.data:{},a=Qt(n.turn),i=n.files;if(a===void 0||!Array.isArray(i))return;let r=e.presented.get(a)??[],o=new Set(r.map(l=>l.path)),s=[...r];for(let l of i){if(!et(l))continue;let c=De(l.path);if(c===void 0||o.has(c))continue;let f=De(l.description);o.add(c),s.push(f===void 0?{path:c}:{path:c,description:f})}s.length!==r.length&&e.presented.set(a,s)}function z5(e){let t=[],n=new Set;for(let a of e)for(let i of a.tools??[])for(let r of i.view?.diffs??[])n.has(r.path)||(n.add(r.path),t.push(r.path));return t}function D5(e,t){let n=et(t.data)?t.data:{},a=Qt(n.turn),i=et(n.reason)?n.reason:{},r=i.kind==="error",o=i.kind==="max-tokens",s=a===void 0?void 0:e.turnStarts.get(a),l=s===void 0?void 0:Math.max(0,t.time-s),c;if(a!==void 0?c=e.messages.filter(p=>p.kind==="assistant"&&e.messageTurn.get(p.id)===a):c=e.messages.filter(p=>p.kind==="assistant"),c.length===0)for(let p=e.messages.length-1;p>=0;p--){let m=e.messages[p];if(m!==void 0&&m.kind==="assistant"){c=[m];break}}for(let p of c){let m=p.pending===!0,b=(p.tools??[]).some(N=>N.state==="running"),y={...p,...b?{tools:(p.tools??[]).map(N=>N.state==="running"?{...N,state:"stopped"}:N)}:{},...m?{pending:!1}:{},...r?{failed:!0}:{},...o?{maxTokens:!0}:{},...l!==void 0?{durationMs:l}:{},...s!==void 0?{turnStartAt:s}:{},time:t.time};hi(e,p,y),$s(e,mb(p),p,y)}let f=a===void 0?void 0:e.presented.get(a),v=new Set((f??[]).map(p=>p.path)),g=z5(c).filter(p=>!v.has(p));if(!((f?.length??0)>0||g.length>0))return;let w=`turn-tail:${a??"last"}`,x={id:w,kind:"turn",text:"",seq:t.seq,time:t.time,...a!==void 0?{turn:a}:{},...l!==void 0?{durationMs:l}:{},...f!==void 0?{deliverables:f}:{},...g.length>0?{produced:g}:{}},C=e.byId.get(w);C!==void 0?hi(e,C,x):(e.messages.push(x),e.byId.set(w,x))}function Hr(e,t){return new Yi(t).fold(e)}function hk(e){for(let t=e.length-1;t>=0;t--){let n=e[t]?.type;if(n==="turn/end")return;if(n==="turn/start")return e[t]?.time}}function I5(e){return e.kind==="user"&&e.sourceKind!==void 0&&e.sourceKind!=="user"&&!gb(e.sourceKind)}var q5=new Set(["agent-message","team-message","subagent-settled","webhook","schedule","tool-jobs","cordis-host-runner","goal"]);function gb(e){return q5.has(e)}var L5={"agent-message":"收到任务消息","team-message":"收到团队消息","subagent-settled":"子任务状态更新",webhook:"收到外部事件",schedule:"定时任务","tool-jobs":"后台任务状态更新","cordis-host-runner":"插件状态更新",goal:"继续执行目标"};function bk(e){return gb(e)?L5[e]:void 0}var H5={"agent-message":"📨","team-message":"👥","subagent-settled":"🧩",webhook:"🔔",schedule:"⏰","tool-jobs":"⚙️","cordis-host-runner":"🔌",goal:"🎯"};function vk(e){return gb(e)?H5[e]:void 0}function Xa(e){let t=[];for(let n of e){let a=t.length>0?t[t.length-1]:void 0;if(I5(n)){if(a!==void 0&&a.kind==="assistant")continue;t.push(n);continue}if(a!==void 0&&a.kind==="assistant"&&n.kind==="assistant"&&a.turn!==void 0&&n.turn!==void 0&&a.turn===n.turn){let i={...a,text:a.text+(a.text!==""&&n.text!==""?`

`:"")+n.text,...a.reasoning!==void 0||n.reasoning!==void 0?{reasoning:(a.reasoning??"")+((a.reasoning??"")!==""&&(n.reasoning??"")!==""?`

`:"")+(n.reasoning??"")}:{},...a.tools!==void 0||n.tools!==void 0?{tools:[...a.tools??[],...n.tools??[]]}:{},...a.flow!==void 0||n.flow!==void 0?{flow:S5(sk(a.flow,a.seq),sk(n.flow,n.seq))}:{},...a.toolSummary!==void 0||n.toolSummary!==void 0?{toolSummary:w5(a.toolSummary,n.toolSummary)}:{},startSeq:a.startSeq??a.seq,seq:n.seq,stepSeqs:[...a.stepSeqs??[a.startSeq??a.seq],n.seq],stepTexts:[...a.stepTexts??[a.text],n.text],time:n.time,pending:n.pending===!0,...n.failed===!0?{failed:!0}:{},...n.maxTokens===!0?{maxTokens:!0}:{},...n.usage!==void 0?{usage:n.usage}:{},...a.turnStartAt!==void 0||n.turnStartAt!==void 0?{turnStartAt:a.turnStartAt??n.turnStartAt}:{},...a.durationMs!==void 0||n.durationMs!==void 0?{durationMs:n.durationMs??a.durationMs}:{},...a.firstSeenAt!==void 0||n.firstSeenAt!==void 0?{firstSeenAt:a.firstSeenAt??n.firstSeenAt}:{}};t[t.length-1]=i}else t.push(n)}return t}var Yi=class{state;snapshotList;constructor(t,n){this.state=fb(t,n)}get lastSeq(){return this.state.maxSeq}fold(t){let n=[...t].sort((r,o)=>r.seq-o.seq),a=this.state.maxSeq,i=!1;for(let r of n)r.seq<=a||(p5(this.state,r),i=!0);return!i&&this.snapshotList!==void 0?this.snapshotList:(this.snapshotList=ck(this.state),this.snapshotList)}seed(t){this.state=fb(t),this.snapshotList=void 0}prepend(t){this.state=fb([...t,...this.state.messages]),this.snapshotList=void 0}snapshot(){return this.snapshotList!==void 0?this.snapshotList:(this.snapshotList=ck(this.state),this.snapshotList)}};function ck(e){let t=[...e.messages],n=!0;for(let a=1;a<t.length;a+=1){let i=t[a-1],r=t[a];if(i.seq>r.seq){n=!1;break}}return n?t:t.sort((a,i)=>a.seq-i.seq)}var bi=[],bb=0,yk=!1,hb=new Set;function Sk(e){return hb.add(e),()=>{hb.delete(e)}}function xk(e){for(let t of hb)try{t(e)}catch{}}function wk(e,t=240){let n=e.replace(/\s+/g," ").trim();return n.length<=t?n:`${n.slice(0,t-1)}…`}function kk(e){let t=/([^\s()/\\]+):(\d+):(\d+)/.exec(e);return t===null?void 0:`${t[1]}:${t[2]}:${t[3]}`}function V5(e){if(typeof e!="string")return;let t=[];for(let n of e.split(`
`).slice(1)){let a=kk(n);if(a!==void 0&&!t.includes(a)&&t.push(a),t.length>=3)break}return t.length===0?void 0:t}function U5(){return typeof performance>"u"?Date.now():performance.now()}function qc(e){let t=wk(e.message===""?"unknown error":e.message),n=e.source===void 0||e.source===""?void 0:wk(e.source,120);bb+=1;let a=bi.find(o=>o.kind===e.kind&&o.message===t&&o.source===n);if(a!==void 0){a.count+=1,bi.splice(bi.indexOf(a),1),bi.unshift(a),xk(a);return}let i={kind:e.kind,message:t,at:U5(),count:1};n!==void 0&&(i.source=n);let r=V5(e.stack);r!==void 0&&(i.frames=r),bi.unshift(i),bi.length>20&&(bi.length=20),xk(i)}function P5(){return bi.map(e=>({...e,...e.frames===void 0?{}:{frames:[...e.frames]}}))}function Vf(){let e={};for(let t of bi)e[t.kind]=(e[t.kind]??0)+t.count;return{total:bb,kinds:e,recent:P5()}}function Nk(){bi.length=0,bb=0}function B5(e){if(e instanceof Error)return{message:e.message===""?e.name:e.message,stack:e.stack};if(typeof e=="string")return{message:e};try{let t=JSON.stringify(e);return{message:typeof t=="string"?t:String(e)}}catch{return{message:Object.prototype.toString.call(e)}}}function Tk(){yk||typeof window>"u"||(yk=!0,window.addEventListener("error",e=>{let t=e.target,n=t?.tagName;if(t!=null&&n!==void 0&&typeof n=="string"){let r=t,s=((r.src??r.href??"").split(/[?#]/)[0]??"").split("/").pop()??"";qc({kind:"resource",message:`${n.toLowerCase()} 加载失败`,source:s===""?void 0:s});return}let a=e.error,i=e.filename===void 0||e.filename===""?void 0:kk(`${e.filename}:${e.lineno??0}:${e.colno??0}`);qc({kind:"error",message:e.message??"",source:i,stack:a?.stack})},!0),window.addEventListener("unhandledrejection",e=>{let t=B5(e.reason);qc({kind:"rejection",message:t.message,stack:t.stack})}))}function j5(){if(!(typeof navigator>"u"))return navigator.storage}var Qa={persisted:!1},Ek=!1;function Mk(){return{...Qa}}async function G5(e){try{if(typeof e.persisted=="function"&&(Qa.persisted=await e.persisted()),typeof e.estimate=="function"){let t=await e.estimate();typeof t.usage=="number"&&(Qa.usage=t.usage),typeof t.quota=="number"&&(Qa.quota=t.quota)}Qa.at=Date.now(),delete Qa.note}catch{Qa.note="denied",Qa.at=Date.now()}}async function Rk(){let e=j5();if(e===void 0){Qa={...Qa,note:"unsupported"};return}if(!Ek){Ek=!0;try{typeof e.persist=="function"&&(Qa.persisted=await e.persist())}catch{}await G5(e)}}var Y5="dsh.palm.perf",X5=2048,Ws=[],Lc=[],Hc=new Map,Vc=null;function Q5(){try{if(typeof localStorage<"u"&&localStorage.getItem(Y5)==="1")return!0}catch{}return!!(typeof location<"u"&&/\bperf=1\b/.test(location.search))}function el(){return Vc===null&&(Vc=Q5()),Vc}function K5(){Vc=null}function F5(e){Ws.length>=X5&&Ws.shift(),Ws.push(e),e.stage==="recv"&&e.seq!==void 0&&(Hc.size>=512&&Hc.clear(),Hc.set(e.seq,e.t))}function Pf(){return el()}function Bc(e,t={}){el()&&F5({t:performance.now(),stage:e,seq:t.seq,frame:t.frame,detail:t.detail})}function Dk(e,t){el()&&(Lc.push({kind:e,at:performance.now(),detail:t}),Lc.length>256&&Lc.shift())}var Ck=64,Uc=[],Pc=[],Vr=null,wb=0,Sb=0,vb,Ak=!1;function Ok(e){Vr===null&&(Vr=e)}function Z5(e){if(Vr===null)return;let t=Vr;Vr=null,wb+=Math.max(0,e-t),Sb+=1,Pc.push({from:t,to:e}),Pc.length>32&&Pc.shift()}function J5(e){return Vr!==null&&e>=Vr?!0:Pc.some(t=>e>=t.from&&e<=t.to)}function $5(){Ak||typeof document>"u"||(Ak=!0,document.hidden&&Ok(performance.now()),document.addEventListener("visibilitychange",()=>{document.hidden?Ok(performance.now()):Z5(performance.now())}))}function W5(){if(vb!==void 0)return;let e=globalThis.PerformanceObserver;if(e!==void 0)try{let t=new e(n=>{for(let a of n.getEntries())Uc.unshift({at:a.startTime,ms:a.duration,suspended:J5(a.startTime)});Uc.length>Ck&&(Uc.length=Ck)});t.observe({entryTypes:["longtask"]}),vb=t}catch{vb=void 0}}var yb=!1,kb=0,Nb=0,Uf=0;function Ik(){if(yb||!el())return;yb=!0,$5(),W5();let e=t=>{if(!el()){yb=!1;return}if(Uf!==0){let n=t-Uf;kb+=1,n>50&&(Nb+=1)}Uf=t,requestAnimationFrame(e)};requestAnimationFrame(e)}function _k(e,t){return e.length===0?0:e[Math.min(e.length-1,Math.max(0,Math.ceil(e.length*t)-1))]}function xb(e,t){if(t.length===0)return{name:e,n:0,avg:0,p50:0,p95:0,max:0};let n=[...t].sort((a,i)=>a-i);return{name:e,n:t.length,avg:Math.round(t.reduce((a,i)=>a+i,0)/t.length*1e3)/1e3,p50:Math.round(_k(n,.5)*1e3)/1e3,p95:Math.round(_k(n,.95)*1e3)/1e3,max:Math.round(n[n.length-1]*1e3)/1e3}}function zk(e){let t=[];for(let n of Ws){if(n.stage!==e||n.seq===void 0)continue;let a=Hc.get(n.seq);a!==void 0&&t.push(Math.max(0,n.t-a))}return t}function qk(){return{armed:el(),capturedAt:new Date().toISOString(),marks:[...Ws],anomalies:[...Lc],frames:{sampled:kb,long:Nb},spansMs:{state:zk("state"),commit:zk("commit")},longTasks:[...Uc],suspension:{hiddenMs:Math.round(wb),hiddenCount:Sb},errors:Vf(),storage:Mk()}}function e4(){let e=qk();return{armed:e.armed,marks:e.marks.length,anomalies:e.anomalies,frames:e.frames,spans:{toState:xb("state",e.spansMs.state),toCommit:xb("commit",e.spansMs.commit)},longTasks:{...xb("longTask",e.longTasks.filter(t=>!t.suspended).map(t=>t.ms)),suspended:e.longTasks.filter(t=>t.suspended).length,recent:e.longTasks.slice(0,8)},suspension:e.suspension,errors:{total:e.errors.total,kinds:e.errors.kinds,recent:e.errors.recent.slice(0,5)},storage:e.storage}}function t4(){Ws.length=0,Lc.length=0,Hc.clear(),kb=0,Nb=0,Uf=0,Uc.length=0,Pc.length=0,Vr=null,wb=0,Sb=0,Nk(),Vc=null}function Lk(){if(!(typeof window>"u"))try{let e={toJSON:qk,stats:e4,clear:t4,refresh:K5};window.__dshPalmPerf=e}catch{}}function n4(e){return new EventSource(e)}var a4=3e3,i4=12e3,r4=3,o4=6e4,s4=1e3,l4=50,c4=64,d4=new Set(["session/event","session/subscribed","approval/requested","approval/resolved","question/requested","question/resolved","session/queue","session/jobs","session/projection","session/added","session/removed","session/status","session/activity","session/error","stream/error"]);function u4(e){let t;try{t=JSON.parse(e)}catch{return}if(typeof t!="object"||t===null)return;let n=t;if(n.type!=="server-request"||typeof n.rpcId!="string"||typeof n.method!="string")return;let a=n.payload;if(typeof a!="object"||a===null)return;let i=a.type;if(!(typeof i!="string"||!d4.has(i))){if(i==="session/event"){let r=a.event;if(typeof r!="object"||r===null)return}return{frame:a,rpcId:n.rpcId}}}function f4(e){return e instanceof ca?e.message==="HTTP 403"||e.message==="HTTP 401"||e.message.includes("unpaired"):!1}var Bf=class{sourceFactory;pollLatest;pollIntervalMs;stallThresholdMs;now;onUnpaired;listeners=new Set;cachedJobsBySession=new Map;cachedQueueBySession=new Map;runningSessionIds=new Set;source;stopped=!1;paused=!1;url;lastEventSeqBySession=new Map;observeSessionId;lastDataAt=0;sseAlive=!1;pollWatermark=new Map;tickTimer;polling=!1;nextPollAt=0;pollDelayMs;constructor(t="/m/api/events.mux",n={}){this.url=t,this.sourceFactory=n.sourceFactory??n4,this.pollLatest=n.pollLatest??((a,i)=>Gi(a,i,l4)),this.pollIntervalMs=n.pollIntervalMs??a4,this.pollDelayMs=this.pollIntervalMs,this.stallThresholdMs=n.stallThresholdMs??i4,this.now=n.now??(()=>Date.now()),this.onUnpaired=n.onUnpaired}start(){this.stopped=!1,this.paused=!1,this.lastDataAt=this.now(),this.source===void 0&&this.connect(),this.startTick()}stop(){this.stopped=!0,this.stopTick(),this.stopPolling(),this.closeSource(),this.observeSessionId=void 0,this.nextPollAt=0}pause(){this.stopped||this.paused||(this.paused=!0,this.stopTick(),this.stopPolling(),this.closeSource())}onFrame(t){return this.listeners.add(t),()=>{this.listeners.delete(t)}}isSseLive(){return!this.stopped&&!this.isSseStalled()}observe(t){let n=this.observeSessionId!==t;if(this.observeSessionId=t,t===void 0){this.stopPolling(),this.stopTick();return}if(this.startTick(),!this.paused){if(n){this.pollDelayMs=this.pollIntervalMs,this.nextPollAt=0;for(let a of this.pollWatermark.keys())a!==t&&this.pollWatermark.delete(a)}!this.polling&&!this.stopped&&this.isSseStalled()&&this.startPolling()}}poke(){this.stopped||this.paused||(this.pollDelayMs=this.pollIntervalMs,this.nextPollAt=0)}resync(){if(this.stopped)return;let t=this.paused;if(this.paused=!1,this.startTick(),t||this.now()-this.lastDataAt>this.stallThresholdMs){this.closeSource(),this.connect(),this.observeSessionId!==void 0&&this.startPolling();return}this.poke()}connect(){this.sseAlive=!1;let t=this.sourceFactory(this.url);this.source=t,t.onmessage=n=>{this.handleMessage(n.data)},t.onerror=()=>{if(this.stopped&&this.source===t){this.closeSource();return}this.sseAlive=!1,this.observeSessionId!==void 0&&this.startPolling()}}startTick(){if(this.tickTimer!==void 0)return;let t=Math.min(this.pollIntervalMs,s4);this.tickTimer=setInterval(()=>{this.tick()},t)}stopTick(){this.tickTimer!==void 0&&(clearInterval(this.tickTimer),this.tickTimer=void 0)}tick(){if(!this.stopped&&this.observeSessionId!==void 0){if(this.polling){this.now()>=this.nextPollAt&&(this.nextPollAt=Number.POSITIVE_INFINITY,this.pollTick());return}this.isSseStalled()&&this.startPolling()}}isSseStalled(){let t=this.sseAlive?this.stallThresholdMs*r4:this.stallThresholdMs;return this.now()-this.lastDataAt>t}startPolling(){this.polling||this.stopped||this.paused||(this.polling=!0,this.pollDelayMs=this.pollIntervalMs,this.nextPollAt=Number.POSITIVE_INFINITY,this.pollTick())}stopPolling(){this.polling=!1,this.pollDelayMs=this.pollIntervalMs,this.nextPollAt=0}async pollTick(){let t=this.observeSessionId;if(t===void 0){this.stopPolling();return}let n=0,a=i=>{let r=i?.event?.seq;return typeof r=="number"?r:-1};try{let i=this.pollWatermark.get(t)??-1,r=i>=0,o=i,s=Number.POSITIVE_INFINITY,l,c=[],f=!1;for(let v=0;v<10;v+=1){if(this.observeSessionId!==t){f=!0,c.length=0;break}let h=[...(l===void 0?await this.pollLatest(t):await this.pollLatest(t,l)).events].sort((C,p)=>a(C)-a(p)),w=0;for(let C of h){let p=a(C);p<=i||p>=s||(p>o&&(o=p),w+=1,c.push({seq:p,frame:{type:"session/event",sessionId:t,event:C.event}}))}n+=w;let x=h.length>0?a(h[0]??{event:void 0}):-1;if(w===0||x===-1||!r){f=!0;break}if(x<=i+1){f=!0;break}s=x,l=x}f?this.pollWatermark.set(t,o):console.warn(`poll gap refill hit the 10-page cap; events above seq ${i} will be re-fetched next poll`),c.sort((v,g)=>v.seq-g.seq);for(let v of c)this.emit(v.frame)}catch(i){if(f4(i)){this.stop(),this.onUnpaired?.();return}}finally{n>0?this.pollDelayMs=this.pollIntervalMs:this.pollDelayMs=Math.min(o4,this.pollDelayMs+this.pollIntervalMs),this.polling&&this.observeSessionId===t&&(this.nextPollAt=this.now()+this.pollDelayMs)}}handleMessage(t){if(typeof t!="string"||t==="")return;let n=u4(t);if(n===void 0)return;let a=n.frame,i=a.event?.seq;if(Pf()&&(Bc("recv",{seq:typeof i=="number"?i:void 0,frame:a.type}),a.type==="session/event"&&typeof i=="number")){let r=a.sessionId;if(r!==void 0){let o=this.lastEventSeqBySession.get(r);o!==void 0&&i>o+1&&Dk("seq-gap",`session=${r} last=${o} got=${i}`),this.lastEventSeqBySession.set(r,i)}}this.sseAlive=!0,this.lastDataAt=this.now(),this.polling&&this.stopPolling(),a.type==="session/jobs"&&this.rememberJobs(a),a.type==="session/queue"&&this.rememberQueue(a),a.type==="session/subscribed"&&this.rememberSubscribed(a),this.trackTurnState(a),this.emit(a,n.rpcId)}trackTurnState(t){if(t.type!=="session/event")return;let a=t.event?.type,i=String(t.sessionId);a==="turn/start"?this.runningSessionIds.add(i):a==="turn/end"&&this.runningSessionIds.delete(i)}runningSessionsSnapshot(){return[...this.runningSessionIds]}rememberJobs(t){let n=String(t.sessionId);if(this.cachedJobsBySession.size>=c4&&!this.cachedJobsBySession.has(n)){let a=this.cachedJobsBySession.keys().next().value;a!==void 0&&this.cachedJobsBySession.delete(a)}this.cachedJobsBySession.set(n,t.jobs)}cachedJobsFor(t){return this.cachedJobsBySession.get(t)}jobsSnapshot(){let t=[];for(let[n,a]of this.cachedJobsBySession)t.push({sessionId:n,jobs:a});return t}liveJobCount(){let t=0;for(let n of this.cachedJobsBySession.values())for(let a of n)(a.status==="running"||a.status==="stopping")&&(t+=1);return t}rememberQueue(t){let n=String(t.sessionId),a=(t.items??[]).map(i=>If({id:String(i.id),placement:i.placement,message:i.message}));this.cachedQueueBySession.set(n,a)}rememberSubscribed(t){let n=String(t.sessionId);this.cachedQueueBySession.delete(n),this.cachedJobsBySession.delete(n)}cachedQueueFor(t){return this.cachedQueueBySession.get(t)}emit(t,n){for(let a of this.listeners)try{a(t,n)}catch{}}closeSource(){let t=this.source;if(this.source=void 0,t!==void 0){t.onmessage=null,t.onerror=null;try{t.close()}catch{}}}};var Hk="dsh.palm.fontScale",Vk="dsh.palm.density",Uk="dsh.palm.lineNumbers",Pk="dsh.palm.autoScroll";function jc(e){try{let t=localStorage.getItem(e);return t===""?void 0:t??void 0}catch{return}}function Gc(e,t){try{localStorage.setItem(e,t)}catch{}}function Tb(){let e=jc(Hk);return e==="small"||e==="large"?e:"standard"}function Bk(e){Gc(Hk,e),Ur()}var jk={small:"小",standard:"标准",large:"大"};function Eb(){return jc(Vk)==="compact"?"compact":"cozy"}function Gk(e){Gc(Vk,e),Ur()}var Yk={compact:"紧凑",cozy:"舒适"};function Mb(){return jc(Uk)==="1"}function Xk(e){Gc(Uk,e?"1":"0"),Ur()}function jf(){return jc(Pk)!=="0"}function Qk(e){Gc(Pk,e?"1":"0")}function Ur(){if(typeof document>"u")return;let e=document.documentElement,t=Tb();t==="standard"?delete e.dataset.fontScale:e.dataset.fontScale=t;let n=Eb();n==="cozy"?delete e.dataset.density:e.dataset.density=n,Mb()?e.dataset.lineNumbers="1":delete e.dataset.lineNumbers}var Kk="dsh.palm.haptics";function Rb(){return jc(Kk)!=="0"}function Fk(e){Gc(Kk,e?"1":"0")}function Zk(){if(Rb())try{typeof navigator<"u"&&typeof navigator.vibrate=="function"&&navigator.vibrate(15)}catch{}}var p4="/m/api/events.notify",tl,$k=!1;function nl(){return typeof Notification<"u"}function Wk(){return nl()?Notification.permission:"unsupported"}async function eN(){return nl()?await Notification.requestPermission():"unsupported"}function Yc(){return typeof navigator<"u"&&typeof navigator.serviceWorker<"u"&&typeof PushManager<"u"}async function tN(){return Yc()?await(await navigator.serviceWorker.ready).pushManager.getSubscription()??void 0:void 0}async function nN(){if(!Yc()||Notification.permission!=="granted")return!1;let e=await Oc();if(e.vapidPublicKey===void 0)return!1;let n=await(await navigator.serviceWorker.ready).pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:m4(e.vapidPublicKey)}),a=n.getKey("p256dh"),i=n.getKey("auth");return await _S({endpoint:n.endpoint,keys:{p256dh:a!==null?Jk(a):"",auth:i!==null?Jk(i):""}}),!0}async function aN(){if(!Yc())return;let t=await(await navigator.serviceWorker.ready).pushManager.getSubscription();t!==null&&await t.unsubscribe(),await zS()}function m4(e){let t="=".repeat((4-e.length%4)%4),n=(e+t).replace(/-/g,"+").replace(/_/g,"/"),a=atob(n),i=new Uint8Array(a.length);for(let r=0;r<a.length;r++)i[r]=a.charCodeAt(r);return i}function Jk(e){let t=new Uint8Array(e),n="";for(let a of t)n+=String.fromCharCode(a);return btoa(n).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}function Xc(){tl!==void 0||!nl()||Notification.permission==="granted"&&(typeof document<"u"&&document.visibilityState==="visible"||($k=!0,tl=new EventSource(p4),tl.onmessage=e=>{try{let t=JSON.parse(e.data);if(t.type!=="notify")return;h4(t.payload)}catch{}},tl.onerror=()=>{}))}function iN(){tl?.close(),tl=void 0,$k=!1}function g4(e){let t=new URL("/m/",window.location.origin);return e.workspaceId!==void 0&&t.searchParams.set("workspace",e.workspaceId),t.searchParams.set("session",e.sessionId),t.toString()}function h4(e){if(document.visibilityState==="visible")return;Zk();let t=new Notification(e.title,{body:e.body,tag:e.id,data:{sessionId:e.sessionId,workspaceId:e.workspaceId}});t.onclick=()=>{t.close(),window.focus(),window.location.href=g4(e)}}var Gf=X(Ye(),1);function rN(){return typeof document>"u"||document.visibilityState!=="hidden"}function b4(e){if(typeof document>"u")return()=>{};let t=()=>{e(rN())};return document.addEventListener("visibilitychange",t),()=>{document.removeEventListener("visibilitychange",t)}}function Yf(){let[e,t]=(0,Gf.useState)(rN);return(0,Gf.useEffect)(()=>b4(t),[]),e}var oN="dsh.remote.theme",v4="theme-color",y4="#f5f5f7",x4="#0a0a0f",Do=w4()??"system",Xf=new Set;function w4(){try{let e=localStorage.getItem(oN);return e==="dark"||e==="light"||e==="system"?e:void 0}catch{return}}function S4(e){try{localStorage.setItem(oN,e)}catch{}}function k4(){return typeof window<"u"&&typeof window.matchMedia=="function"&&window.matchMedia("(prefers-color-scheme: dark)").matches}function Cb(e=Do){return e==="system"?k4()?"dark":"light":e}function Ab(e){if(typeof document>"u")return;document.documentElement.dataset.theme=e;let t=document.querySelector(`meta[name="${v4}"]`);t!==null&&(t.content=Cb(e)==="dark"?x4:y4)}var sN={media:void 0,onChange:void 0,sync(){let e=Do==="system"&&typeof window<"u"&&typeof window.matchMedia=="function";e&&this.media===void 0?(this.media=window.matchMedia("(prefers-color-scheme: dark)"),this.onChange=()=>{Ab(Do);for(let t of[...Xf])t()},typeof this.media.addEventListener=="function"?this.media.addEventListener("change",this.onChange):typeof this.media.addListener=="function"&&this.media.addListener(this.onChange)):!e&&this.media!==void 0&&(typeof this.media.removeEventListener=="function"&&this.onChange!==void 0&&this.media.removeEventListener("change",this.onChange),this.media=void 0,this.onChange=void 0)}};function lN(){return Do}function cN(){return Cb()}function Qf(e){return Xf.add(e),()=>{Xf.delete(e)}}function Kf(e){if(e!==Do){Do=e,S4(e),sN.sync(),Ab(e);for(let t of[...Xf])t()}}function dN(){let e=Cb()==="light"?"dark":"light";return Kf(e),e}function Ff(e){Kf(e)}function uN(){sN.sync(),Ab(Do)}var vi=new Map;function gN(e){for(let[t,n]of vi){let a=n.rows.filter(i=>i.sessionId!==e);a.length!==n.rows.length&&(vi.set(t,{...n,rows:a}),Db(t,{rows:a,cursor:n.cursor,hasMore:n.hasMore}))}Io(e),Vb(e)}var Kc="dsh-palm.list.v1.",hN="dsh-palm.prev.v1",_b="dsh-palm.scroll.v1.",al="dsh-palm.draft.v1.",il="dsh-palm.reading.v2.",bN="dsh-palm.reading.v1.",Zf="dsh-palm.cache-index.v1",vN=1440*60*1e3,N4=500,T4=512*1024;function zb(){return hN}function Ra(e){if(e!==null)try{return JSON.parse(e)}catch{return}}function rl(e,t){try{localStorage.setItem(e,t),E4(e)}catch{}}function E4(e){try{let t=Ra(localStorage.getItem(Zf))??[];if(t.includes(e))return;t.push(e),localStorage.setItem(Zf,JSON.stringify(t))}catch{}}function Fc(){return Ra(Ca(Zf))??[]}function ol(e){if(e.length!==0){for(let t of e)try{localStorage.removeItem(t)}catch{}try{let t=Fc().filter(n=>!e.includes(n));localStorage.setItem(Zf,JSON.stringify(t))}catch{}}}function Xi(){return typeof localStorage<"u"}function Ca(e){try{return localStorage.getItem(e)}catch{return null}}var M4=5e3,Qc=new Map,Pr,fN=!1;function R4(){fN||typeof document>"u"||(fN=!0,document.addEventListener("pagehide",()=>{Ob()}),document.addEventListener("visibilitychange",()=>{document.visibilityState==="hidden"&&Ob()}))}function yN(e,t){Qc.set(e,t),R4(),Pr===void 0&&(Pr=setTimeout(()=>{Ob()},M4))}function Ob(){if(Pr!==void 0&&(clearTimeout(Pr),Pr=void 0),Qc.size===0)return;let e=[...Qc.values()];Qc.clear();for(let t of e)t()}function C4(){Pr!==void 0&&(clearTimeout(Pr),Pr=void 0),Qc.clear()}function Db(e,t){yN(`${Kc}${e}`,()=>{A4(e,t)})}function xN(e){if(e.size===0)return;let t=new Map(e);yN(zb(),()=>{O4(t)})}function wN(e){if(!Xi())return;let t=Ra(Ca(Kc+e));if(!(t===void 0||t.v!==1||!Array.isArray(t.rows))&&!t.rows.some(n=>n===null||typeof n!="object"||typeof n.sessionId!="string")&&!(Date.now()-t.savedAt>vN))return t}function A4(e,t){rl(Kc+e,JSON.stringify({v:1,...t,savedAt:Date.now()}))}function SN(e){if(!Xi())return 0;let t=Number(Ca(_b+e)??"");return Number.isFinite(t)&&t>0?t:0}function kN(e,t){rl(_b+e,String(Math.max(0,t)))}function NN(){let e=new Map;if(!Xi())return e;let t=Ra(Ca(zb()));if(t===void 0)return e;for(let[n,a]of Object.entries(t))typeof n!="string"||typeof a!="string"||a===""||e.set(n,a);return e}function O4(e){if(!Xi()||e.size===0)return;let t={};for(let[a,i]of e)t[a]=i;let n=JSON.stringify(t);for(;Object.keys(t).length>N4||n.length>T4;){let a=Object.keys(t)[0];if(a===void 0)break;delete t[a],n=JSON.stringify(t)}rl(zb(),n)}var Ib="dsh-palm.pin.v1";function TN(){if(!Xi())return new Set;let e=Ra(Ca(Ib));return Array.isArray(e)?new Set(e.filter(t=>typeof t=="string")):new Set}function EN(e){rl(Ib,JSON.stringify([...e]))}var MN=10080*60*1e3,_4=4096,pN=50;function RN(e){if(!Xi())return"";let t=Ra(Ca(al+e));return t===void 0||typeof t.v!="string"||Date.now()-t.t>MN?"":t.v}function qb(e,t){if(t===""){Io(e);return}rl(al+e,JSON.stringify({t:Date.now(),v:t.slice(0,_4)})),z4()}function Io(e){ol([al+e])}function z4(){let e=Fc().filter(n=>n.startsWith(al));if(e.length<=pN)return;let t=e.map(n=>({key:n,t:Ra(Ca(n))?.t??0})).sort((n,a)=>n.t-a.t);ol(t.slice(0,e.length-pN).map(n=>n.key))}var CN=10080*60*1e3,mN=50;function Lb(e){if(!Xi())return;let t=Ra(Ca(il+e));if(!(t===void 0||typeof t.v!="number"||t.v<=0)&&!(Date.now()-t.t>CN))return t.v}function Hb(e,t){t<=0||(rl(il+e,JSON.stringify({t:Date.now(),v:t})),D4())}function Vb(e){ol([il+e])}function D4(){let e=Fc().filter(n=>n.startsWith(il));if(e.length<=mN)return;let t=e.map(n=>({key:n,t:Ra(Ca(n))?.t??0})).sort((n,a)=>n.t-a.t);ol(t.slice(0,e.length-mN).map(n=>n.key))}function Ub(){if(!Xi())return;C4();let e=Fc().filter(t=>t.startsWith(Kc)||t.startsWith(_b)||t.startsWith(al)||t.startsWith(il)||t.startsWith(bN)||t===hN||t===Ib);ol(e)}function AN(){if(!Xi())return;let e=Date.now(),t=Fc().filter(n=>{if(n.startsWith(bN))return!0;if(n.startsWith(Kc)){let a=Ra(Ca(n));return a===void 0||e-a.savedAt>vN}if(n.startsWith(al)){let a=Ra(Ca(n));return a===void 0||e-a.t>MN}if(n.startsWith(il)){let a=Ra(Ca(n));return a===void 0||e-a.t>CN}return!1});ol(t)}var I4="dsh-palm",q4=2,Aa="history",L4=1440*60*1e3,ON=50;function Pb(){return new Promise((e,t)=>{if(typeof indexedDB>"u"){t(new Error("indexedDB unavailable"));return}let n=indexedDB.open(I4,q4);n.onupgradeneeded=()=>{let a=n.result;a.objectStoreNames.contains("outbox")||a.createObjectStore("outbox",{keyPath:"id"}),a.objectStoreNames.contains(Aa)||a.createObjectStore(Aa,{keyPath:"key"})},n.onsuccess=()=>{e(n.result)},n.onerror=()=>{t(n.error??new Error("indexedDB open failed"))}})}async function _N(e){try{let t=await Pb();try{let n=await new Promise((a,i)=>{let r=t.transaction(Aa,"readonly").objectStore(Aa).get(e);r.onsuccess=()=>{a(r.result)},r.onerror=()=>{i(r.error??new Error("indexedDB read failed"))}});return n===void 0||n.v!==1||Date.now()-n.savedAt>L4?void 0:n.page}finally{t.close()}}catch{return}}async function zN(e,t){let n=!1;try{let a=await Pb();try{await new Promise((i,r)=>{let o=a.transaction(Aa,"readwrite");o.objectStore(Aa).put({key:e,v:1,savedAt:Date.now(),page:t}),o.oncomplete=()=>{i()},o.onerror=()=>{r(o.error??new Error("indexedDB write failed"))},o.onabort=()=>{r(o.error??new Error("indexedDB write aborted"))}}),await H4(a),n=!0}finally{a.close()}}catch{}n&&Rk()}async function H4(e){try{let t=await new Promise((a,i)=>{let r=e.transaction(Aa,"readonly").objectStore(Aa).getAll();r.onsuccess=()=>{let o=r.result??[];a(o.map(s=>({key:s.key,savedAt:s.savedAt})))},r.onerror=()=>{i(r.error??new Error("indexedDB read failed"))}});if(t.length<=ON)return;let n=t.sort((a,i)=>a.savedAt-i.savedAt).slice(0,t.length-ON).map(a=>a.key);await new Promise((a,i)=>{let r=e.transaction(Aa,"readwrite"),o=r.objectStore(Aa);for(let s of n)o.delete(s);r.oncomplete=()=>{a()},r.onerror=()=>{i(r.error??new Error("indexedDB trim failed"))},r.onabort=()=>{i(r.error??new Error("indexedDB trim aborted"))}})}catch{}}async function Bb(){try{let e=await Pb();try{await new Promise((t,n)=>{let a=e.transaction(Aa,"readwrite");a.objectStore(Aa).clear(),a.oncomplete=()=>{t()},a.onerror=()=>{n(a.error??new Error("indexedDB clear failed"))},a.onabort=()=>{n(a.error??new Error("indexedDB clear aborted"))}})}finally{e.close()}}catch{}}var V4=2e3;function DN({send:e,delayMs:t=V4}){let n=new Set,a=[],i,r=!1,o=()=>{i=void 0;let c=a;a=[];for(let f of c)if(!n.has(f)){n.add(f);try{e(f)}catch{}}},s=()=>{r||(i!==void 0&&clearTimeout(i),i=setTimeout(o,t))},l=Sk(c=>{n.has(c)||(a.includes(c)||a.push(c),s())});return()=>{r=!0,l(),i!==void 0&&clearTimeout(i),i=void 0}}var $f=X(Ye(),1),Yb=X(re(),1),B4=2200,j4=200,sl=[],Gb=new Set,G4=1;function jb(){for(let e of[...Gb])e([...sl])}function Q(e){let t=G4++;sl.push({id:t,text:e,leaving:!1}),jb(),setTimeout(()=>{let n=sl.find(a=>a.id===t);n!==void 0&&(n.leaving=!0,jb(),setTimeout(()=>{let a=sl.findIndex(i=>i.id===t);a!==-1&&(sl.splice(a,1),jb())},j4))},B4)}function HN(){let[e,t]=(0,$f.useState)(sl);return(0,$f.useEffect)(()=>(Gb.add(t),()=>{Gb.delete(t)}),[]),e.length===0?null:(0,Yb.jsx)("div",{className:"toast-host",role:"status","aria-live":"polite",children:e.map(n=>(0,Yb.jsx)("div",{className:"toast"+(n.leaving?" toast-out":""),children:n.text},n.id))})}var k=X(Ye(),1);var Y4=new Set(["image/jpeg","image/png","image/webp","image/gif"]);function X4(e){return Y4.has(e)}var Wf=4,VN=256*1024,Q4=1600;function K4(e,t){let n=/^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/s.exec(e);if(n)return{type:"image",mediaType:n[1],data:n[2],name:t}}function Xb(e,t){let n=[];e.trim()!==""&&n.push({type:"text",text:e});for(let a of t){let i=K4(a.dataUrl,a.name);i!==void 0&&n.push(i)}return n}async function UN(e,t=VN){let n=await F4(e);if(!X4(e.type))return{image:{dataUrl:n,mediaType:e.type,name:e.name},failed:!0};try{return{image:{dataUrl:await J4(n,e.type,t),mediaType:"image/jpeg",name:e.name},failed:!1}}catch{return{image:{dataUrl:n,mediaType:e.type,name:e.name},failed:!0}}}function F4(e){return new Promise((t,n)=>{let a=new FileReader;a.onload=()=>t(String(a.result??"")),a.onerror=()=>n(a.error??new Error("read failed")),a.readAsDataURL(e)})}function Z4(){return new Promise(e=>{setTimeout(e,0)})}function J4(e,t,n=VN){return new Promise((a,i)=>{let r=new Image;r.onload=async()=>{try{let o=document.createElement("canvas"),s=o.getContext("2d");if(s===null){i(new Error("canvas 2d unavailable"));return}let l=Math.max(r.width,r.height),c=Math.min(1,Q4/l),f=Math.max(1,Math.round(r.width*c)),v=Math.max(1,Math.round(r.height*c)),g=.9,h=e;for(;;){o.width=f,o.height=v,s.clearRect(0,0,f,v),s.drawImage(r,0,0,f,v);let w=o.toDataURL("image/jpeg",g);if(w.length<=n||f<=16||v<=16){h=w;break}g>.5?g-=.1:(f=Math.max(16,Math.round(f*.9)),v=Math.max(16,Math.round(v*.9))),await Z4()}a(h)}catch(o){i(o)}},r.onerror=()=>i(new Error("image decode failed")),r.src=e})}function PN(e,t=Wf){let n=e?.items;if(n===void 0)return[];let a=[];for(let i=0;i<n.length&&a.length<t;i++){let r=n[i];if(r.kind==="file"&&r.type.startsWith("image/")){let o=r.getAsFile();o!==null&&a.push(o)}}return a}var $4=new Set;function ep(e=64){let t=new Map;return{store:t,note(n,a){let i=t.get(n);for(i===void 0&&(i=new Set,t.set(n,i)),i.add(a);i.size>e;){let r=i.values().next().value;if(r===void 0)break;i.delete(r)}},forSession(n){return t.get(n)??$4},clear(){t.clear()}}}var BN=ep();function jN(e,t){BN.note(e,t)}function Qb(e){return BN.forSession(e)}function GN(e){if(e.length===0)return[];let t=e[e.length-1].rpcId;return e.filter(n=>n.rpcId===t)}function YN(e,t,n){let a=t.filter(r=>!n.has(r.rpcId));if(a.length>0)return a;let i=e.filter(r=>!n.has(r.rpcId));return i.length===e.length?e:i}var XN=ep();function QN(e,t){XN.note(e,t)}function Kb(e){return XN.forSession(e)}function KN(e,t,n){let a=t.filter(r=>!n.has(r.approvalId));if(a.length>0)return a;let i=e.filter(r=>!n.has(r.approvalId));return i.length===e.length?e:i}var ed=X(Ye(),1);var yi=X(Ye(),1),Br=X(re(),1),W4=80,e6=40;function ht({title:e,onClose:t,children:n}){let[a,i]=(0,yi.useState)(0),[r,o]=(0,yi.useState)(!1),s=(0,yi.useRef)(!1),l=(0,yi.useRef)(0),c=(0,yi.useRef)(0);return(0,yi.useEffect)(()=>{let f=v=>{v.key==="Escape"&&t()};return window.addEventListener("keydown",f),()=>{window.removeEventListener("keydown",f)}},[t]),(0,yi.useEffect)(()=>{let f=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{document.body.style.overflow=f}},[]),(0,Br.jsx)("div",{className:"sheet-backdrop",onClick:t,children:(0,Br.jsxs)("div",{className:"sheet"+(r?" sheet-full":""),role:"dialog","aria-modal":"true","aria-label":e,style:a>0?{transform:`translateY(${a}px)`,transition:"none"}:void 0,onClick:f=>{f.stopPropagation()},children:[(0,Br.jsxs)("div",{className:"sheet-grab",onTouchStart:f=>{s.current=!0,c.current=0,l.current=f.touches[0]?.clientY??0},onTouchMove:f=>{if(!s.current)return;let v=(f.touches[0]?.clientY??0)-l.current;c.current=v,i(r?Math.max(0,v):v)},onTouchEnd:()=>{if(!s.current)return;s.current=!1;let f=c.current;c.current=0,f>W4?t():!r&&f<-e6&&o(!0),i(0)},children:[(0,Br.jsx)("div",{className:"sheet-handle","aria-hidden":!0,onClick:()=>{t()}}),(0,Br.jsx)("div",{className:"sheet-title",children:e})]}),(0,Br.jsx)("div",{className:"sheet-body",children:n})]})})}var t6=X(Ye(),1);var U=X(re(),1);function qe(e){return{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.8,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,focusable:!1,...e}}function Qi(e){return(0,U.jsxs)("svg",{...qe(e),children:[(0,U.jsx)("circle",{cx:"11",cy:"11",r:"7"}),(0,U.jsx)("path",{d:"m20 20-3.8-3.8"})]})}function FN(e){return(0,U.jsxs)("svg",{...qe(e),children:[(0,U.jsx)("path",{d:"M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"}),(0,U.jsx)("path",{d:"M10 19a2 2 0 0 0 4 0"})]})}function tp(e){return(0,U.jsxs)("svg",{...qe(e),children:[(0,U.jsx)("path",{d:"M12 17v5"}),(0,U.jsx)("path",{d:"M9 3h6l-1 7 3.5 3H5.5L9 10Z"})]})}function ZN(e){return(0,U.jsxs)("svg",{...qe(e),children:[(0,U.jsx)("circle",{cx:"12",cy:"12",r:"9"}),(0,U.jsx)("path",{d:"M12 7v5l3.5 2"})]})}function JN(e){return(0,U.jsx)("svg",{...qe(e),children:(0,U.jsx)("path",{d:"M3 7.5A2.5 2.5 0 0 1 5.5 5h4l2 2.5h7A2.5 2.5 0 0 1 21 10v7a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17Z"})})}function $N(e){return(0,U.jsxs)("svg",{...qe(e),children:[(0,U.jsx)("path",{d:"M3 7.5A2.5 2.5 0 0 1 5.5 5h4l2 2.5h7A2.5 2.5 0 0 1 21 10v7a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17Z"}),(0,U.jsx)("path",{d:"M12 10.5v5M9.5 13h5"})]})}function WN(e){return(0,U.jsx)("svg",{...qe(e),children:(0,U.jsx)("path",{d:"M21 12a8 8 0 0 1-8 8H4l2.2-3.3A8 8 0 1 1 21 12Z"})})}function ll(e){return(0,U.jsx)("svg",{...qe(e),strokeWidth:2.2,children:(0,U.jsx)("path",{d:"M12 5v14M5 12h14"})})}function Zc(e){return(0,U.jsx)("svg",{...qe(e),children:(0,U.jsx)("path",{d:"m6 14 6-6 6 6"})})}function Fb(e){return(0,U.jsx)("svg",{...qe(e),children:(0,U.jsx)("path",{d:"m6 10 6 6 6-6"})})}function eT(e){return(0,U.jsx)("svg",{...qe(e),strokeWidth:2,children:(0,U.jsx)("path",{d:"M5 12h13M13 6.5 18.5 12 13 17.5"})})}function np(e){return(0,U.jsxs)("svg",{...qe(e),children:[(0,U.jsx)("path",{d:"M3 13.5 5.7 5.6A1.5 1.5 0 0 1 7.1 4.5h9.8a1.5 1.5 0 0 1 1.4 1.1L21 13.5V18a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18Z"}),(0,U.jsx)("path",{d:"M3 13.5h5l1 2h6l1-2h5"})]})}function Zb(e){return(0,U.jsxs)("svg",{...qe(e),children:[(0,U.jsx)("path",{d:"M4 8h10M18 8h2M4 16h4M12 16h8"}),(0,U.jsx)("circle",{cx:"16",cy:"8",r:"2.2"}),(0,U.jsx)("circle",{cx:"10",cy:"16",r:"2.2"})]})}function tT(e){return(0,U.jsxs)("svg",{...qe(e),children:[(0,U.jsx)("circle",{cx:"12",cy:"12",r:"9"}),(0,U.jsx)("path",{d:"M12 3a9 9 0 0 1 0 18Z",fill:"currentColor",stroke:"none"})]})}function nT(e){return(0,U.jsxs)("svg",{...qe(e),children:[(0,U.jsx)("circle",{cx:"12",cy:"12",r:"9"}),(0,U.jsx)("path",{d:"M9.6 9.2a2.5 2.5 0 1 1 3.4 2.9c-.7.3-1 .8-1 1.6"}),(0,U.jsx)("path",{d:"M12 17h.01"})]})}function ap(e){return(0,U.jsxs)("svg",{...qe(e),children:[(0,U.jsx)("path",{d:"M4 7h16M9 7V5h6v2M6.5 7l1 12.2a1.5 1.5 0 0 0 1.5 1.3h6a1.5 1.5 0 0 0 1.5-1.3l1-12.2"}),(0,U.jsx)("path",{d:"M10 11v5M14 11v5"})]})}function aT(e){return(0,U.jsx)("svg",{...qe(e),children:(0,U.jsx)("path",{d:"M5 19 11 5h2l6 14M7.5 14h9"})})}function iT(e){return(0,U.jsxs)("svg",{...qe(e),children:[(0,U.jsx)("rect",{x:"4",y:"5",width:"16",height:"5",rx:"1.5"}),(0,U.jsx)("rect",{x:"4",y:"14",width:"16",height:"5",rx:"1.5"})]})}function rT(e){return(0,U.jsx)("svg",{...qe(e),children:(0,U.jsx)("path",{d:"M5 9h14M5 15h14M10 4 8 20M16 4l-2 16"})})}function oT(e){return(0,U.jsxs)("svg",{...qe(e),children:[(0,U.jsx)("path",{d:"M12 4v11M7.5 11 12 15.5 16.5 11"}),(0,U.jsx)("path",{d:"M5 19.5h14"})]})}function sT(e){return(0,U.jsxs)("svg",{...qe(e),children:[(0,U.jsx)("rect",{x:"9",y:"3",width:"6",height:"18",rx:"1.5"}),(0,U.jsx)("path",{d:"M11 18h2"}),(0,U.jsx)("path",{d:"M5.5 9.5v5M3.5 11v2M18.5 9.5v5M20.5 11v2"})]})}function lT(e){return(0,U.jsxs)("svg",{...qe(e),children:[(0,U.jsx)("circle",{cx:"12",cy:"12",r:"9"}),(0,U.jsx)("path",{d:"M12 11v5M12 8h.01"})]})}function cT(e){return(0,U.jsx)("svg",{...qe(e),strokeWidth:2.4,children:(0,U.jsx)("path",{d:"M5.5 12h.01M12 12h.01M18.5 12h.01"})})}function ip(e){return(0,U.jsxs)("svg",{...qe(e),children:[(0,U.jsx)("rect",{x:"9",y:"9",width:"11",height:"11",rx:"2"}),(0,U.jsx)("path",{d:"M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5"})]})}function Jc(e){return(0,U.jsxs)("svg",{...qe(e),children:[(0,U.jsx)("path",{d:"m14.5 5.5 4 4L8 20l-4.6 1L4.5 16Z"}),(0,U.jsx)("path",{d:"m12.5 7.5 4 4"})]})}function Oa(e){return(0,U.jsx)("svg",{...qe(e),strokeWidth:2,children:(0,U.jsx)("path",{d:"m5 12.5 4.5 4.5L19 7.5"})})}function rp(e){return(0,U.jsxs)("svg",{...qe(e),children:[(0,U.jsx)("rect",{x:"9",y:"3",width:"6",height:"11",rx:"3"}),(0,U.jsx)("path",{d:"M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6"})]})}function jr(e){return(0,U.jsx)("svg",{...qe(e),strokeWidth:2,children:(0,U.jsx)("path",{d:"m6 6 12 12M18 6 6 18"})})}function dT(e){return(0,U.jsxs)("svg",{...qe(e),children:[(0,U.jsx)("path",{d:"M12 4v9"}),(0,U.jsx)("path",{d:"M7.5 9.5 12 14l4.5-4.5"}),(0,U.jsx)("path",{d:"M5 19h14"})]})}function op(e){return(0,U.jsxs)("svg",{...qe(e),children:[(0,U.jsx)("path",{d:"M14 4h6v6"}),(0,U.jsx)("path",{d:"M20 4 11 13"}),(0,U.jsx)("path",{d:"M19 14v5a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4 19V7a1.5 1.5 0 0 1 1.5-1.5H10"})]})}function uT(e){return(0,U.jsx)("svg",{...qe(e),children:(0,U.jsx)("path",{d:"M7 5.5v13l11-6.5Z"})})}function fT(e){return(0,U.jsxs)("svg",{...qe(e),strokeWidth:1.7,children:[(0,U.jsx)("rect",{x:"6",y:"6",width:"12",height:"12",rx:"2"}),(0,U.jsx)("rect",{x:"10",y:"10",width:"4",height:"4",rx:"0.5"}),(0,U.jsx)("path",{d:"M9 2.5v3M15 2.5v3M9 18.5v3M15 18.5v3M2.5 9h3M2.5 15h3M18.5 9h3M18.5 15h3"})]})}function $c(e){return(0,U.jsxs)("svg",{...qe(e),strokeWidth:1.7,children:[(0,U.jsx)("path",{d:"M12 3 5 5.5v5.2c0 4.3 2.9 7.6 7 9.3 4.1-1.7 7-5 7-9.3V5.5Z"}),(0,U.jsx)("path",{d:"m9 11.5 2.2 2.2L15.5 9"})]})}function pT(e){return(0,U.jsxs)("svg",{...qe(e),strokeWidth:1.7,children:[(0,U.jsx)("path",{d:"M4.5 19a8.5 8.5 0 1 1 15 0"}),(0,U.jsx)("path",{d:"m12 16 2.6-3"}),(0,U.jsx)("path",{d:"M12 16v-3"})]})}var Gr=X(re(),1),n6={running:"运行中",stopping:"停止中",completed:"已完成",killed:"已终止",failed:"失败"},a6={running:"running",stopping:"stopping",completed:"completed",killed:"killed",failed:"failed"},i6={subagent:"子代理",bash:"命令",pwsh:"命令","pty-send":"终端"};function r6(e){return i6[e]??e}function Jb(e){let t=new Date(e);return`${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}`}function o6(e,t){let n=Math.max(0,Math.round((t-e)/1e3));return n<60?`${n} 秒`:`${Math.round(n/60)} 分钟`}function Wc({job:e}){let t=a6[e.status]??"running",n=e.finishedAt!==void 0?`${Jb(e.startedAt)} → ${Jb(e.finishedAt)} · 用时 ${o6(e.startedAt,e.finishedAt)}`:`开始于 ${Jb(e.startedAt)}`;return(0,Gr.jsxs)("div",{className:"chat-task-row",role:"listitem",children:[(0,Gr.jsx)("span",{className:`chat-task-dot chat-task-dot-${t}`,"aria-hidden":!0}),(0,Gr.jsxs)("span",{className:"chat-task-copy",children:[(0,Gr.jsx)("span",{className:"chat-task-label",children:e.label}),(0,Gr.jsxs)("span",{className:"chat-task-meta",children:[r6(e.kind)," · ",n6[e.status]??e.status,e.detail!==void 0&&e.detail!==""?` · ${e.detail}`:""]}),(0,Gr.jsx)("span",{className:"chat-task-time",children:n})]})]})}var sp=8e3;async function $b(e){let t;try{t=await FS(e)}catch{return}let n=[];for(let a of t.entries)a.kind==="child"&&n.push({id:a.id,label:a.label??a.id,activity:a.activity});return n}async function mT(e){return await $b(e)??[]}function Wb(e){return e.filter(t=>t.activity==="running")}function lp(e){let t=0;for(let n of e)n.activity==="running"&&(t+=1);return t}function cp(e){return[...e].sort((t,n)=>+(n.activity==="running")-+(t.activity==="running"))}var Le=X(re(),1),gT=5,ev=new Set(["running","stopping"]);function tv(e){let t=0;for(let n of e)ev.has(n.status)&&(t+=1);return t}function hT(e){let t=0;for(let n of e)n.status==="completed"&&(t+=1);return{done:t,total:e.length}}function s6({item:e}){return(0,Le.jsxs)("li",{className:`chat-run-todo chat-run-todo-${e.status}`,children:[(0,Le.jsx)("span",{className:"chat-run-todo-mark","aria-hidden":!0,children:e.status==="completed"?"✓":e.status==="in_progress"?"●":"○"}),(0,Le.jsx)("span",{className:"chat-run-todo-content",children:e.content})]})}function nv({node:e}){let t=e.activity==="running";return(0,Le.jsxs)("div",{className:"chat-subagent-row",role:"listitem",children:[(0,Le.jsx)("span",{className:"chat-subagent-dot"+(t?" chat-subagent-dot-running":""),"aria-hidden":!0}),(0,Le.jsxs)("span",{className:"chat-subagent-copy",children:[(0,Le.jsx)("span",{className:"chat-subagent-label",children:e.label}),(0,Le.jsx)("span",{className:"chat-subagent-meta",children:t?"运行中":"空闲"})]})]})}function l6({nodes:e}){let[t,n]=(0,ed.useState)(!1),a=(0,ed.useMemo)(()=>cp(e),[e]),i=Math.max(0,a.length-gT),r=t||i===0?a:a.slice(0,gT),o=lp(e);return(0,Le.jsxs)("section",{className:"chat-run-section","aria-label":"子代理",children:[(0,Le.jsxs)("div",{className:"chat-run-section-head",children:[(0,Le.jsx)("span",{className:"chat-run-section-title",children:"子代理"}),(0,Le.jsx)("span",{className:"chat-run-section-count",children:o>0?`${o} 个运行中`:`${e.length} 个`})]}),(0,Le.jsx)("div",{className:"chat-subagent-list",role:"list","aria-label":"子代理列表",children:r.map(s=>(0,Le.jsx)(nv,{node:s},s.id))}),i>0&&(0,Le.jsx)("button",{type:"button",className:"chat-run-fold",onClick:()=>{n(s=>!s)},children:t?"收起":`… 还有 ${i} 个子代理`})]})}function bT({todo:e,jobs:t,subagents:n,onOpen:a}){let i=(0,ed.useMemo)(()=>{let o=[];if(e!==void 0&&e.items.length>0){let{done:l,total:c}=hT(e.items);o.push(`任务 ${l}/${c}`)}if(t.length>0){let l=tv(t);o.push(l>0?`后台任务 ${l} 个运行中`:`后台任务 ${t.length} 个`)}let s=lp(n);return s>0&&o.push(`子代理 ${s} 个运行中`),o},[e,t,n]);if(i.length===0)return null;let r=e!==void 0&&e.items.some(o=>o.status==="in_progress")||tv(t)>0||lp(n)>0;return(0,Le.jsxs)("button",{type:"button",className:"chat-status-strip",onClick:a,children:[(0,Le.jsx)("span",{className:"chat-status-dot"+(r?" chat-status-dot-live":""),"aria-hidden":!0}),(0,Le.jsx)("span",{className:"chat-status-text",children:i.join(" · ")})]})}function vT({todo:e,jobs:t,subagents:n,onClose:a}){let i=e!==void 0&&e.items.length>0;return!i&&t.length===0&&n.length===0?null:(0,Le.jsxs)(ht,{title:"运行状态",onClose:a,children:[n.length>0&&(0,Le.jsx)(l6,{nodes:n}),i&&(0,Le.jsxs)("section",{className:"chat-run-section","aria-label":"任务清单",children:[(0,Le.jsxs)("div",{className:"chat-run-section-head",children:[(0,Le.jsx)("span",{className:"chat-run-section-title",children:"任务清单"}),(0,Le.jsx)("span",{className:"chat-run-section-count",children:(()=>{let{done:r,total:o}=hT(e.items);return`${r}/${o}`})()})]}),(0,Le.jsx)("ul",{className:"chat-run-todo-list",children:e.items.map((r,o)=>(0,Le.jsx)(s6,{item:r},o))})]}),t.length>0&&(0,Le.jsxs)("section",{className:"chat-run-section","aria-label":"后台任务",children:[(0,Le.jsxs)("div",{className:"chat-run-section-head",children:[(0,Le.jsx)("span",{className:"chat-run-section-title",children:"后台任务"}),(0,Le.jsx)("span",{className:"chat-run-section-count",children:(()=>{let r=tv(t);return r>0?`${r} 个运行中`:`${t.length} 个`})()})]}),(0,Le.jsx)("div",{className:"chat-run-job-list",role:"list","aria-label":"后台任务列表",children:[...t].sort((r,o)=>Number(ev.has(o.status))-Number(ev.has(r.status))).map(r=>(0,Le.jsx)(Wc,{job:r},r.id))})]})]})}function av(e){if(window.self!==window.parent)try{window.parent.postMessage(e,window.location.origin)}catch{}}async function Ka(e,t="已复制"){try{if(typeof navigator<"u"&&navigator.clipboard!==void 0)return await navigator.clipboard.writeText(e),Q(t),!0;throw new Error("clipboard unavailable")}catch{}try{let n=document.createElement("textarea");n.value=e,n.setAttribute("readonly",""),n.style.position="fixed",n.style.opacity="0",document.body.appendChild(n),n.select();let a=document.execCommand("copy");return n.remove(),Q(a?t:"复制失败"),a}catch{return Q("复制失败"),!1}}async function yT(e){if(typeof navigator<"u"&&typeof navigator.share=="function")try{await navigator.share({text:e});return}catch(t){if(t instanceof DOMException&&t.name==="AbortError")return}await Ka(e,"已复制，可粘贴分享")}function xT(e){av({type:"insertCode",code:e}),window.dshInsertCode?.(e),Q("已插入到编辑器")}function wT(e,t){let n;try{n="data:text/plain;base64,"+btoa(unescape(encodeURIComponent(e)))}catch{let i=new Blob([e],{type:"text/plain;charset=utf-8"});n=URL.createObjectURL(i)}let a=!1;try{a=window.open(n,"_blank")!==null}catch{a=!1}if(!a){let i=document.createElement("a");i.href=n,i.download=`code.${t}`,document.body.appendChild(i),i.click(),i.remove()}Q(a?"已在新标签页打开":"已下载代码文件")}function ST(e){if(av({type:"openFile",path:e}),typeof window.dshOpenFile=="function"){window.dshOpenFile(e);return}Q("当前环境不支持打开文件")}async function kT(e,t){av({type:"runCode",code:e,lang:t});let n=window.dshRunCode;if(typeof n!="function")return null;try{let a=await n(e,t);return a===void 0?null:{output:a.output,...a.error===!0?{error:!0}:{}}}catch(a){return{output:a instanceof Error?a.message:String(a),error:!0}}}var NT=X(Ye(),1);var xi=X(re(),1);function c6(){return(0,xi.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round","aria-hidden":!0,children:[(0,xi.jsx)("circle",{cx:"12",cy:"12",r:"4.2"}),(0,xi.jsx)("path",{d:"M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5 5l1.7 1.7M17.3 17.3 19 19M19 5l-1.7 1.7M6.7 17.3 5 19"})]})}function d6(){return(0,xi.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:(0,xi.jsx)("path",{d:"M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"})})}function cl(){let t=(0,NT.useSyncExternalStore)(Qf,cN)==="dark";return(0,xi.jsx)("button",{type:"button",className:"mobile-theme-toggle","aria-label":t?"切换到浅色":"切换到深色",onClick:()=>{let n=dN();Js("ui-theme",[{op:"set",path:["preference"],value:n==="dark"?"dark":"light"}]).catch(()=>{})},children:t?(0,xi.jsx)(c6,{}):(0,xi.jsx)(d6,{})})}function dp(e){return e.split(/[\\/]+/).filter(Boolean)}function TT(e,t=.6){if(e.length<2)return"";let n=e.map(dp),a=Math.min(...n.map(s=>s.length)),i=Math.ceil(e.length*t),r=[];for(let s=0;s<a;s++){let l=new Map;for(let v of n){let g=v[s]??"";l.set(g,(l.get(g)??0)+1)}let c="",f=0;for(let[v,g]of l)g>f&&(c=v,f=g);if(f<i)break;r.push(c)}if(r.length===0)return"";let o=n.filter(s=>r.every((l,c)=>s[c]===l));return o.length<2?"":o[0]?.slice(0,r.length).join("/")??""}function ET(e,t,n=28){let a=e;if(t!==""){let o=dp(t),s=dp(e);s.length>o.length&&o.every((l,c)=>s[c]===l)&&(a="…"+s.slice(o.length).join("\\"))}if(a.length<=n)return a;let i=dp(a.startsWith("…")?a.slice(1):a);return i.length<2?a.slice(0,n-1)+"…":"…"+(i[0]??"").slice(0,10)+"…"+(i[i.length-1]??"").slice(0,10)}function u6(e,t){return e.length<=t?e:e.slice(0,t)+"…"}function MT(e){let t=/^\s*```([\w+-]*)\s*\n/.exec(e);if(t!==null){let a=t[1]??"";return a===""?"[代码]":`[代码] ${a}`}let n=e.trimStart().split(`
`,1)[0]??"";return u6(n,30)}function RT(e){return e.map(()=>!0)}var f6="dsh-palm";var Yr="outbox",CT="history",wi=[],qo=!1,iv=!1;function ov(){return new Promise((e,t)=>{if(typeof indexedDB>"u"){t(new Error("indexedDB unavailable"));return}let n=indexedDB.open(f6,2);n.onupgradeneeded=()=>{let a=n.result;a.objectStoreNames.contains(Yr)||a.createObjectStore(Yr,{keyPath:"id"}),a.objectStoreNames.contains(CT)||a.createObjectStore(CT,{keyPath:"key"})},n.onsuccess=()=>{e(n.result)},n.onerror=()=>{t(n.error??new Error("indexedDB open failed"))}})}async function sv(e,t){let n=await ov();try{return await new Promise((a,i)=>{let r=t(n.transaction(Yr,e).objectStore(Yr));r.onsuccess=()=>{a(r.result)},r.onerror=()=>{i(r.error??new Error("indexedDB request failed"))}})}finally{n.close()}}async function p6(){if(wi.length===0)return;let e=await ov();try{await new Promise((t,n)=>{let a=e.transaction(Yr,"readwrite"),i=a.objectStore(Yr);for(let r of wi)i.put(r);a.oncomplete=()=>{t()},a.onerror=()=>{n(a.error??new Error("indexedDB transaction failed"))},a.onabort=()=>{n(a.error??new Error("indexedDB transaction aborted"))}}),wi.length=0,qo=!1}finally{e.close()}}async function OT(e){if(!qo)try{await sv("readwrite",t=>t.put(e));return}catch{qo=!0}wi.push(e)}async function nd(){try{let e=await sv("readonly",n=>n.getAll());if(wi.length>0)try{await p6()}catch{}let t=new Map;for(let n of e)t.set(n.id,n);for(let n of wi)t.has(n.id)||t.set(n.id,n);return qo=!1,[...t.values()].sort((n,a)=>n.queuedAt-a.queuedAt)}catch{return qo=!0,[...wi].sort((e,t)=>e.queuedAt-t.queuedAt)}}async function td(e){let t=wi.findIndex(n=>n.id===e);t!==-1&&wi.splice(t,1);try{await sv("readwrite",n=>n.delete(e))}catch{qo=!0}}async function up(e){let t=await nd();for(let n of t)n.sessionId===e&&await td(n.id)}var rv=class extends Error{constructor(t="permanent outbox failure"){super(t),this.name="PermanentOutboxError"}};async function AT(e,t){let n=wi.find(a=>a.id===e);n!==void 0&&t(n);try{let a=await ov();try{await new Promise((i,r)=>{let o=a.transaction(Yr,"readwrite"),s=o.objectStore(Yr),l=s.get(e);l.onsuccess=()=>{let c=l.result;c!==void 0&&(t(c),s.put(c))},o.oncomplete=()=>{i()},o.onerror=()=>{r(o.error??new Error("indexedDB transaction failed"))},o.onabort=()=>{r(o.error??new Error("indexedDB transaction aborted"))}})}finally{a.close()}}catch{qo=!0}}async function _T(e){if(iv)return{sent:0,failed:0};iv=!0;try{let t=await nd(),n=0,a=0;for(let i of t)if(i.sending!==!0)try{await AT(i.id,r=>{r.sending=!0}),await e(i),await td(i.id),n+=1}catch(r){r instanceof rv?await td(i.id):await AT(i.id,o=>{o.sending=!1}),a+=1}return{sent:n,failed:a}}finally{iv=!1}}var Lo=X(Ye(),1),Lt=X(re(),1);function zT({items:e,running:t,onEdit:n,onRemove:a,onSteer:i}){let[r,o]=(0,Lo.useState)(!1),[s,l]=(0,Lo.useState)(null),[c,f]=(0,Lo.useState)(""),v=(0,Lo.useRef)(!1),[g,h]=(0,Lo.useState)(!1),w=e.filter(b=>b.placement==="queued");if(w.length===0)return null;let x=w.length===1||r,C=b=>{l(b.id),f(b.text)},p=async()=>{if(!(s===null||v.current)){v.current=!0,h(!0);try{await n(s,c)}finally{v.current=!1,h(!1),l(null)}}},m=async(b,y)=>{if(!v.current){v.current=!0,h(!0);try{await b(y)}finally{v.current=!1,h(!1)}}};return(0,Lt.jsxs)("div",{className:"queue-dock","data-queue-dock":"",children:[w.length>1&&(0,Lt.jsxs)("button",{type:"button",className:"queue-dockHead","aria-expanded":r,onClick:()=>{o(b=>!b)},children:[(0,Lt.jsxs)("span",{className:"queue-dockCount",children:[w.length," 条排队"]}),(0,Lt.jsx)("span",{className:"queue-dockChevron","aria-hidden":!0,children:r?"收起":"展开"})]}),x&&(0,Lt.jsx)("ul",{className:"queue-dockList",children:w.map(b=>(0,Lt.jsx)("li",{className:"queue-dockRow",children:s===b.id?(0,Lt.jsxs)("div",{className:"queue-dockEdit",children:[(0,Lt.jsx)("input",{className:"queue-dockInput",value:c,autoFocus:!0,onChange:y=>{f(y.target.value)},onKeyDown:y=>{y.key==="Enter"&&p(),y.key==="Escape"&&l(null)}}),(0,Lt.jsx)("button",{type:"button",className:"queue-dockBtn queue-dockBtn-primary",onClick:()=>{p()},children:"保存"}),(0,Lt.jsx)("button",{type:"button",className:"queue-dockBtn",onClick:()=>{l(null)},children:"取消"})]}):(0,Lt.jsxs)(Lt.Fragment,{children:[(0,Lt.jsx)("span",{className:"queue-dockText",title:b.text,children:b.text}),(0,Lt.jsxs)("span",{className:"queue-dockActions",children:[(0,Lt.jsx)("button",{type:"button",className:"queue-dockBtn","aria-label":"编辑排队消息",title:b.editable?void 0:"仅纯文本消息可编辑",disabled:!b.editable||g,onClick:()=>{C(b)},children:"编辑"}),(0,Lt.jsx)("button",{type:"button",className:"queue-dockBtn","aria-label":"删除排队消息",disabled:g,onClick:()=>{m(a,b.id)},children:"删除"}),(0,Lt.jsx)("button",{type:"button",className:"queue-dockBtn queue-dockBtn-primary","aria-label":"插话发送",disabled:!t||g,title:t?void 0:"仅运行中可插话发送",onClick:()=>{m(i,b.id)},children:"插话"})]})]})},b.id))})]})}var Xr=X(Ye(),1);var IT={ts:{label:"TypeScript",runnable:!1,ext:"ts",kind:"code"},typescript:{label:"TypeScript",runnable:!1,ext:"ts",kind:"code"},js:{label:"JavaScript",runnable:!1,ext:"js",kind:"code"},javascript:{label:"JavaScript",runnable:!1,ext:"js",kind:"code"},jsx:{label:"JSX",runnable:!1,ext:"jsx",kind:"code"},tsx:{label:"TSX",runnable:!1,ext:"tsx",kind:"code"},py:{label:"Python",runnable:!0,ext:"py",kind:"python"},python:{label:"Python",runnable:!0,ext:"py",kind:"python"},bash:{label:"Bash",runnable:!0,ext:"sh",kind:"bash"},sh:{label:"Bash",runnable:!0,ext:"sh",kind:"bash"},shell:{label:"Bash",runnable:!0,ext:"sh",kind:"bash"},zsh:{label:"Bash",runnable:!0,ext:"sh",kind:"bash"},json:{label:"JSON",runnable:!1,ext:"json",kind:"config"},yaml:{label:"YAML",runnable:!1,ext:"yml",kind:"config"},yml:{label:"YAML",runnable:!1,ext:"yml",kind:"config"},html:{label:"HTML",runnable:!1,ext:"html",kind:"markup"},xml:{label:"XML",runnable:!1,ext:"xml",kind:"markup"},css:{label:"CSS",runnable:!1,ext:"css",kind:"code"},rust:{label:"Rust",runnable:!1,ext:"rs",kind:"code"},rs:{label:"Rust",runnable:!1,ext:"rs",kind:"code"},go:{label:"Go",runnable:!1,ext:"go",kind:"code"},java:{label:"Java",runnable:!1,ext:"java",kind:"code"},cpp:{label:"C++",runnable:!1,ext:"cpp",kind:"code"},"c++":{label:"C++",runnable:!1,ext:"cpp",kind:"code"},c:{label:"C",runnable:!1,ext:"c",kind:"code"},md:{label:"Markdown",runnable:!1,ext:"md",kind:"markup"},markdown:{label:"Markdown",runnable:!1,ext:"md",kind:"markup"},sql:{label:"SQL",runnable:!1,ext:"sql",kind:"sql"},text:{label:"Text",runnable:!1,ext:"txt",kind:"config"}};function qT(e){let t=e.trim().toLowerCase(),n=IT[t];return n!==void 0?n:{label:e.trim()===""?"text":e.trim(),runnable:!1,ext:"txt"}}var m6={code:new Set(["abstract","as","async","await","break","case","catch","class","const","continue","default","delete","do","else","enum","export","extends","finally","for","from","function","get","if","implements","import","in","instanceof","interface","let","module","namespace","new","of","package","private","protected","public","readonly","return","set","static","super","switch","this","throw","try","type","typeof","undefined","var","void","while","with","yield","null","true","false","fn","impl","struct","match","mut","move","pub","ref","trait","use","where","func","range","defer","chan","go","nil","def","lambda"]),python:new Set(["and","as","assert","async","await","break","class","continue","def","del","elif","else","except","False","finally","for","from","global","if","import","in","is","lambda","None","nonlocal","not","or","pass","raise","return","True","try","while","with","yield","self","print"]),bash:new Set(["if","then","else","elif","fi","for","while","until","do","done","case","esac","function","in","select","time","local","export","readonly","return","break","continue","shift","source","alias","echo","set","unset","true","false","test","exit"]),sql:new Set(["SELECT","FROM","WHERE","INSERT","INTO","VALUES","UPDATE","SET","DELETE","CREATE","TABLE","ALTER","ADD","DROP","INDEX","VIEW","JOIN","INNER","LEFT","RIGHT","FULL","OUTER","CROSS","ON","AS","AND","OR","NOT","NULL","IS","IN","LIKE","BETWEEN","GROUP","BY","ORDER","HAVING","LIMIT","OFFSET","UNION","ALL","DISTINCT","PRIMARY","KEY","FOREIGN","REFERENCES","CONSTRAINT","DEFAULT","UNIQUE","CHECK","CASE","WHEN","THEN","ELSE","END","EXISTS","COUNT","SUM","AVG","MIN","MAX","CAST","IF","WITH","RECURSIVE","ASC","DESC","DATABASE"]),markup:new Set(["html","head","body","title","meta","link","script","style","div","span","p","h1","h2","h3","h4","h5","h6","ul","ol","li","table","tr","td","th","thead","tbody","a","img","input","button","form","header","footer","nav","section","article","aside","main","select","option","textarea","label","video","audio","iframe","pre","code","br","hr","strong","em","b","i","u","s","blockquote","q","mark","doctype","template","slot","picture","source","summary","details","figure","figcaption","canvas","svg","path","defs","linearGradient"]),config:new Set(["true","false","null","yes","no","on","off","version","name","type","id","env","node","extends","default","required"])};function g6(e,t){return t==="sql"?e.toUpperCase():e}function ad(e){return e.replace(/[&<>"']/g,t=>t==="&"?"&amp;":t==="<"?"&lt;":t===">"?"&gt;":t==='"'?"&quot;":"&#39;")}var DT=/("[^"\n]*")|('(?:[^'\n\\]|\\.)*')|(`[^`\n]*`)|(\/\/[^\n]*)|(\/\*.*?\*\/|\s#[^\n]*)|(\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|(\b[A-Za-z_][A-Za-z0-9_]*\b)/g;function h6(e,t,n){if(n&&/^\s*#/.test(e))return`<span class="tok tok-comment">${ad(e)}</span>`;let a=m6[t],i="",r=0;DT.lastIndex=0;let o;for(;(o=DT.exec(e))!==null;){let s=o.index,[l,c,f,v,g,h,w,x]=o;i+=ad(e.slice(r,s));let C=l,p="";if(c!==void 0||f!==void 0||v!==void 0)p=" tok-string";else if(g!==void 0||h!==void 0&&(h.trimStart().startsWith("/*")||n&&h.trimStart().startsWith("#")))p=" tok-comment";else if(w!==void 0)p=" tok-number";else if(x!==void 0)if(C=x,a.has(g6(x,t)))p=" tok-keyword";else if(/^[A-Z]/.test(x))p=" tok-type";else{let m=e.slice(s+x.length),b=e.slice(Math.max(0,s-1),s);t==="markup"&&(b==="<"||b===" ")||m.startsWith(":")&&(b===" "||b===""||b==='"'||b==="'")?p=" tok-prop":m.startsWith("(")&&(p=" tok-func")}i+=p===""?ad(C):`<span class="tok${p}">${ad(C)}</span>`,r=s+l.length}return i+=ad(e.slice(r)),i===""?" ":i}var fp=new Map,b6=200;function id(e,t){let n=t.trim().toLowerCase(),a=n+"\0"+e,i=fp.get(a);if(i!==void 0)return i;let r=IT[n];if(r===void 0||r.kind==="config")return null;let o=r.kind==="python"||r.kind==="bash"||r.kind==="sql",c=`<pre class="shiki" tabindex="0"><code>${e.split(`
`).map(f=>`<span class="line">${h6(f,r.kind,o)}</span>`).join(`
`)}</code></pre>`;return fp.size>=b6&&fp.clear(),fp.set(a,c),c}var v6={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function Qe(e){return e.replace(/[&<>"']/g,t=>v6[t]??t)}function pp(e){let t=e.trim();if(t==="")return null;if(t.startsWith("#"))return t;if(t.startsWith("//"))return null;let n=/^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(t);if(n===null)return t;let a=n[1].toLowerCase();return a==="http"||a==="https"||a==="mailto"?t:null}var y6=/\.(?:png|jpe?g|gif|webp|bmp|svg|avif|ico)$/i,x6=/^[A-Za-z]:[\\/]/,w6=/^[A-Za-z][A-Za-z0-9+.-]*:/;function S6(e){let t=e.trim().replace(/[?#][\s\S]*$/,"");if(t===""||t.startsWith("//")||w6.test(t)&&!x6.test(t)||!y6.test(t))return null;try{return decodeURIComponent(t)}catch{return null}}function LT(e,t){let n=0;for(let a=t;a<e.length;a+=1){let i=e[a];if(i==="(")n+=1;else if(i===")"){if(n===0)return a;n-=1}}return-1}var HT=/(?:[A-Za-z]:[\\/]|\.{1,2}[\\/])?(?:[\w@.-]+[\\/])+[\w@.-]+\.(?:[A-Za-z0-9]{1,8})/y;function VT(e,t){let n=e[t];if(n===void 0||!/[\w./\\]/.test(n))return null;let a=t>0?e[t-1]:"";if(a!==""&&/[\w:/.@]/.test(a))return null;HT.lastIndex=t;let i=HT.exec(e);if(i===null)return null;let r=i[0];return!/[\\/]/.test(r)||/^[a-z][a-z0-9+.-]*:\/\//i.test(r)||/^www\./i.test(r)?null:{path:r,end:t+r.length}}function On(e){let t="",n=0,a=e.length;for(;n<a;){let i=e[n];if(i==="`"){let o=e.indexOf("`",n+1);if(o!==-1){let s=e.slice(n+1,o),l=VT(s,0);if(l!==null&&l.end===s.length){t+='<code><a class="file-link" data-path="'+Qe(l.path)+'">'+Qe(l.path)+"</a></code>",n=o+1;continue}t+="<code>"+Qe(s)+"</code>",n=o+1;continue}}if(i==="!"&&e[n+1]==="["){let o=e.indexOf("](",n+2);if(o!==-1){let s=LT(e,o+2);if(s!==-1){let l=e.slice(n+2,o),c=e.slice(o+2,s),f=S6(c);if(f!==null)t+='<img class="md-local-img" data-local-src="'+Qe(f)+'" alt="'+Qe(l)+'" loading="lazy" decoding="async" />';else{let v=pp(c);if(v===null)t+=Qe(l);else{let g=Qe(v).replace(/\s+/g,"%20");t+='<img alt="'+Qe(l)+'" src="'+g+'" loading="lazy" decoding="async" />'}}n=s+1;continue}}}if(i==="["){let o=e.indexOf("](",n+1);if(o!==-1){let s=LT(e,o+2);if(s!==-1){let l=e.slice(n+1,o),c=e.slice(o+2,s),f=pp(c);f===null?t+=On(l):t+='<a href="'+Qe(f)+'" target="_blank" rel="noopener noreferrer">'+On(l)+"</a>",n=s+1;continue}}}let r=VT(e,n);if(r!==null){t+='<a class="file-link" data-path="'+Qe(r.path)+'">'+Qe(r.path)+"</a>",n=r.end;continue}if(i==="*"&&e[n+1]==="*"){let o=e.indexOf("**",n+2);if(o!==-1){t+="<strong>"+On(e.slice(n+2,o))+"</strong>",n=o+2;continue}}if(i==="*"&&e[n-1]!=="*"&&e[n+1]!=="*"){let o=e.indexOf("*",n+1);if(o!==-1&&e[o+1]!=="*"){t+="<em>"+On(e.slice(n+1,o))+"</em>",n=o+1;continue}}if(i==="~"&&e[n+1]==="~"){let o=e.indexOf("~~",n+2);if(o!==-1){t+="<del>"+On(e.slice(n+2,o))+"</del>",n=o+2;continue}}if(i===`
`){t+="<br />",n+=1;continue}t+=Qe(i),n+=1}return t}var PT=/<think\b[^>]*>/i,mp=/<\/think\s*>/i,k6='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5"/></svg>',N6='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 4v9"/><path d="M7.5 9.5 12 14l4.5-4.5"/><path d="M5 19h14"/></svg>',T6='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M19 14v5a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4 19V7a1.5 1.5 0 0 1 1.5-1.5H10"/></svg>',E6='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/></svg>',M6='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 14 6-6 6 6"/></svg>';function R6(e,t){let n=e===""?"text":e,a=t.split(`
`).map(i=>'<span class="code-line">'+(Qe(i)||" ")+"</span>").join("");return'<div class="code-block" data-lang="'+Qe(n)+'"><div class="code-head"><span class="code-lang">'+Qe(n)+'</span><div class="code-actions"><button type="button" class="code-btn code-copy" aria-label="复制代码">'+k6+'</button><button type="button" class="code-btn code-insert" aria-label="插入到编辑器">'+N6+'</button><button type="button" class="code-btn code-open" aria-label="新标签页打开">'+T6+'</button></div></div><div class="code-body"><pre><code>'+a+"</code></pre></div></div>"}function C6(e){return'<div class="diff-block" data-lang="diff"><div class="diff-head"><span class="diff-label">变更对比</span></div><div class="diff-body"><pre><code>'+e.split(`
`).map(n=>'<span class="code-line">'+(Qe(n)||" ")+"</span>").join("")+"</code></pre></div></div>"}function A6(e){return'<details class="chat-disclosure think-block"><summary class="chat-disclosure-head"><span class="chat-disclosure-icon">'+E6+'</span><span class="chat-disclosure-label">思考过程</span><span class="chat-disclosure-caret">'+M6+'</span></summary><div class="chat-disclosure-body think-body">'+Qe(e)+"</div></details>"}function O6(e){switch(e.type){case"paragraph":return"<p>"+e.html+"</p>";case"heading":return"<h"+e.level+">"+e.html+"</h"+e.level+">";case"hr":return"<hr />";case"list":return(e.ordered?"<ol>":"<ul>")+e.items.map(t=>"<li>"+t+"</li>").join("")+(e.ordered?"</ol>":"</ul>");case"table":{let t="<thead><tr>"+e.head.map(a=>"<th>"+a+"</th>").join("")+"</tr></thead>",n=e.rows.length>0?"<tbody>"+e.rows.map(a=>"<tr>"+a.map(i=>"<td>"+i+"</td>").join("")+"</tr>").join("")+"</tbody>":"";return"<table>"+t+n+"</table>"}case"quote":return"<blockquote><p>"+e.html+"</p></blockquote>";case"code":return e.diff?C6(e.code):R6(e.lang,e.code);case"think":return A6(e.text)}}function _6(e){let t=e.replace(/\r\n/g,`
`).split(`
`),n=[],a=0,i=t.length,r=s=>{s.length!==0&&(n.push({type:"paragraph",html:On(s.join(`
`))}),s.length=0)},o=[];for(;a<i;){let s=t[a],l=/^```([\w+-]*)\s*$/.exec(s);if(l!==null){r(o);let w=l[1]??"";a+=1;let x=[];for(;a<i&&!/^```\s*$/.test(t[a]);)x.push(t[a]),a+=1;a+=1,n.push({type:"code",lang:w,code:x.join(`
`),diff:w.toLowerCase()==="diff"});continue}if(/^tool_result</.test(s)){r(o);let w=[s];for(a+=1;a<i&&w.length<12&&/^(<\/|\s*\|)/.test(t[a]);)w.push(t[a]),a+=1;n.push({type:"code",lang:"",code:w.join(`
`),diff:!1});continue}let c=PT.exec(s);if(c!==null){r(o);let w=s.slice(0,c.index),x=s.slice(c.index+c[0].length),C=0,p=mp.exec(x);if(p===null)for(C=1;C<i-a&&(p=mp.exec(t[a+C]??""),p===null);)C+=1;if(p===null){o.push(s),a+=1;continue}let m=[];if(C===0)m.push(x.slice(0,p.index));else{m.push(x);for(let N=a+1;N<a+C;N+=1)m.push(t[N]??"");m.push((t[a+C]??"").slice(0,p.index))}let b=m.join(`
`).trim();w.trim()!==""&&n.push({type:"paragraph",html:On(w)}),b!==""&&n.push({type:"think",text:b});let y=C===0?x.slice(p.index+p[0].length):(t[a+C]??"").slice(p.index+p[0].length);y.trim()!==""&&o.push(y),a+=C+1;continue}let f=/^(#{1,6})\s+(.*)$/.exec(s);if(f!==null){r(o),n.push({type:"heading",level:f[1].length,html:On(f[2]??"")}),a+=1;continue}if(/^\s*(---+|\*\*\*+|___+)\s*$/.test(s)){r(o),n.push({type:"hr"}),a+=1;continue}if(s.includes("|")&&a+1<i&&/^\s*\|?[\s:|-]+\|?\s*$/.test(t[a+1])&&t[a+1].includes("-")){r(o);let w=UT(s);a+=2;let x=[];for(;a<i&&t[a].includes("|");)x.push(UT(t[a])),a+=1;n.push({type:"table",head:w.map(C=>On(C)),rows:x.map(C=>C.map(p=>On(p)))});continue}if(/^>\s?(.*)$/.exec(s)!==null){r(o);let w=[];for(;a<i;){let x=/^>\s?(.*)$/.exec(t[a]);if(x===null)break;w.push(x[1]??""),a+=1}n.push({type:"quote",html:w.map(x=>On(x)).join("<br />")});continue}if(/^\s*([-*+])\s+(.*)$/.exec(s)!==null){r(o);let w=[];for(;a<i;){let x=/^\s*([-*+])\s+(.*)$/.exec(t[a]);if(x===null)break;w.push(On(x[2]??"")),a+=1}n.push({type:"list",ordered:!1,items:w});continue}if(/^\s*\d+[.)]\s+(.*)$/.exec(s)!==null){r(o);let w=[];for(;a<i;){let x=/^\s*\d+[.)]\s+(.*)$/.exec(t[a]);if(x===null)break;w.push(On(x[1]??"")),a+=1}n.push({type:"list",ordered:!0,items:w});continue}if(s.trim()===""){r(o),a+=1;continue}o.push(s),a+=1}return r(o),n}function rd(e){let t=_6(e),n=[],a=[],i=0,r=()=>{a.length!==0&&(n.push({kind:"html",id:i,html:a.join(`
`)}),i+=1,a=[])};for(let o of t)o.type==="code"?(r(),o.diff?n.push({kind:"diff",id:i,text:o.code}):n.push({kind:"code",id:i,lang:o.lang,code:o.code}),i+=1):o.type==="think"?(r(),n.push({kind:"think",id:i,text:o.text}),i+=1):a.push(O6(o));return r(),n}function UT(e){let t=e.trim(),n=t.startsWith("|")?t.slice(1):t;return(n.endsWith("|")?n.slice(0,-1):n).split("|").map(i=>i.trim())}var z6=/^```([\w+-]*)\s*$/,D6=/^```\s*$/;function BT(e,t){let n=e.replace(/\r\n/g,`
`),a=n.length;(t>a||t<0)&&(t=0);let i=[],r=t,o=null,s=t,l=()=>{o!==null&&o.length>0&&i.push({kind:"html",html:"<p>"+On(o.join(`
`))+"</p>"}),o=null};for(;r<a;){let c=n.indexOf(`
`,r),f=c===-1?n.slice(r):n.slice(r,c),v=c===-1?a:c+1,g=z6.exec(f);if(g!==null){l();let w=g[1]??"",x=-1,C=-1,p=v;for(;p<a;){let b=n.indexOf(`
`,p),y=b===-1?n.slice(p):n.slice(p,b);if(D6.test(y)){x=p,C=b===-1?a:b+1;break}p=b===-1?a:b+1}if(x===-1)break;let m=n.slice(v,x).replace(/\n$/,"");w.toLowerCase()==="diff"?i.push({kind:"diff",text:m}):i.push({kind:"code",lang:w,code:m}),r=C;continue}let h=PT.exec(f);if(h!==null){if(l(),h.index>0){let b=f.slice(0,h.index);b.trim()!==""&&i.push({kind:"html",html:"<p>"+On(b)+"</p>"})}let w=f.slice(h.index+h[0].length),x=mp.exec(w);if(x!==null){let b=w.slice(0,x.index).trim();b!==""&&i.push({kind:"think",text:b});let y=w.slice(x.index+x[0].length);y.trim()!==""&&(o=[y],s=r+h.index+h[0].length+x.index+x[0].length),r=v;continue}let C=[w],p=v,m=!1;for(;p<a;){let b=n.indexOf(`
`,p),y=b===-1?n.slice(p):n.slice(p,b),N=mp.exec(y);if(N!==null){let D=[...C,y.slice(0,N.index)].join(`
`).trim();D!==""&&i.push({kind:"think",text:D});let O=y.slice(N.index+N[0].length);O.trim()!==""&&(o=[O],s=p+N.index+N[0].length),r=b===-1?a:b+1,m=!0;break}C.push(y),p=b===-1?a:b+1}if(!m)break;continue}if(o===null&&(o=[],s=r),f.trim()===""){l(),r=v;continue}o.push(f),r=v}return o!==null&&o.length>0&&(r=s),{blocks:i,stableLen:r,tail:n.slice(r)}}var bn=X(Ye(),1);var tt=X(re(),1),I6=20,q6=1e3,lv=300,L6=60;function H6(){return new Promise(e=>{setTimeout(e,0)})}var gp=(0,bn.memo)(function({lang:t,code:n}){let a=(0,bn.useMemo)(()=>qT(t),[t]),i=(0,bn.useMemo)(()=>n.split(`
`),[n]),r=i.length>I6,[o,s]=(0,bn.useState)(null),[l,c]=(0,bn.useState)(!1),f=(0,bn.useRef)(void 0),[v,g]=(0,bn.useState)(!1),[h,w]=(0,bn.useState)({running:!1}),x=r&&!v,C=i.length>q6&&!x,p=x?Math.min(i.length,L6):i.length,m=p===i.length?n:i.slice(0,p).join(`
`),b=x&&i.length>p?i.slice(p):void 0;(0,bn.useEffect)(()=>()=>{f.current!==void 0&&window.clearTimeout(f.current)},[]),(0,bn.useEffect)(()=>{g(!1)},[n]),(0,bn.useEffect)(()=>{if(C){let F=!1,Ie=m.split(`
`),at=Math.ceil(Ie.length/lv),Te="",je=0;return(async()=>{for(;je<at&&!F;){let Kt=je*lv,xe=id(Ie.slice(Kt,Kt+lv).join(`
`),t);if(xe===null||F)return;let _t=xe.indexOf("<code>"),$e=xe.lastIndexOf("</code>");if(_t===-1||$e===-1)return;Te+=xe.slice(_t+6,$e),je+=1,je<at&&(Te+=`
`),s('<pre class="shiki" tabindex="0"><code>'+Te+"</code></pre>"),await H6()}})(),()=>{F=!0}}let T=!1,q,$=()=>{T||s(id(m,t))};return typeof requestIdleCallback=="function"?q=requestIdleCallback($):q=window.setTimeout($,0),()=>{T=!0,q!==void 0&&(typeof requestIdleCallback=="function"?cancelIdleCallback(q):window.clearTimeout(q))}},[m,t,C]);let y=()=>{c(!0),f.current!==void 0&&window.clearTimeout(f.current),f.current=window.setTimeout(()=>{f.current=void 0,c(!1)},1500),Ka(n,"已复制到剪贴板")},N=()=>{xT(n)},D=()=>{wT(n,a.ext)},O=()=>{h.running||(w({running:!0}),kT(n,t).then(T=>{if(T===null){w({running:!1}),Q("当前环境不支持代码执行");return}w({running:!1,result:T})}))};return(0,tt.jsxs)("div",{className:"code-block","data-lang":t===""?"text":t,children:[(0,tt.jsxs)("div",{className:"code-head",children:[(0,tt.jsx)("span",{className:"code-lang",children:a.label}),(0,tt.jsxs)("div",{className:"code-actions",children:[a.runnable&&(0,tt.jsx)("button",{type:"button",className:"code-btn","aria-label":"运行代码",disabled:h.running,onClick:O,children:(0,tt.jsx)(uT,{width:16,height:16})}),(0,tt.jsxs)("button",{type:"button",className:"code-btn"+(l?" code-btn-done":""),"aria-label":"复制代码",onClick:y,children:[l?(0,tt.jsx)(Oa,{width:16,height:16}):(0,tt.jsx)(ip,{width:16,height:16}),l&&(0,tt.jsx)("span",{className:"code-btn-label",children:"已复制"})]}),(0,tt.jsx)("button",{type:"button",className:"code-btn","aria-label":"插入到编辑器",onClick:N,children:(0,tt.jsx)(dT,{width:16,height:16})}),(0,tt.jsx)("button",{type:"button",className:"code-btn","aria-label":"新标签页打开",onClick:D,children:(0,tt.jsx)(op,{width:16,height:16})})]})]}),(0,tt.jsxs)("div",{className:"code-body-zone",children:[(0,tt.jsxs)("div",{className:"code-body"+(x?" code-body-folded":""),children:[o!==null?(0,tt.jsx)("div",{className:"code-fade",dangerouslySetInnerHTML:{__html:o}}):(0,tt.jsx)("pre",{children:(0,tt.jsx)("code",{children:i.slice(0,p).map((T,q)=>(0,tt.jsx)("span",{className:"code-line",children:T===""?" ":Qe(T)},q))})}),b!==void 0&&(0,tt.jsx)("pre",{className:"code-tail-plain",children:(0,tt.jsx)("code",{children:b.map((T,q)=>(0,tt.jsx)("span",{className:"code-line",children:T===""?" ":Qe(T)},q))})})]}),x&&(0,tt.jsx)("div",{className:"code-fold-mask","aria-hidden":"true"})]}),r&&(0,tt.jsx)("button",{type:"button",className:"code-fold-btn",onClick:()=>{g(T=>!T)},children:x?"展开全部":"收起"}),h.result!==void 0&&(0,tt.jsx)("pre",{className:"code-run"+(h.result.error===!0?" code-run-error":" code-run-ok"),children:h.result.output})]})});var _a=X(Ye(),1);function jT(e){let t=e.trim();return/^[ab]\//.test(t)?t.slice(2):t}var V6=/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/;function YT(e){let t=e.replace(/\r\n/g,`
`).split(`
`);t.length>0&&t[t.length-1]===""&&e.endsWith(`
`)&&t.pop();let n,a,i=0;for(;i<t.length;){let c=t[i],f=/^---\s+(.*)$/.exec(c);if(f!==null){n=jT(f[1]),i+=1;continue}let v=/^\+\+\+\s+(.*)$/.exec(c);if(v!==null){a=jT(v[1]),i+=1;continue}break}let r=[],o,s=0,l=0;for(;i<t.length;){let c=t[i],f=V6.exec(c);if(f!==null){o={oldStart:Number(f[1]),oldLines:f[2]===void 0?1:Number(f[2]),newStart:Number(f[3]),newLines:f[4]===void 0?1:Number(f[4]),lines:[]},r.push(o),s=o.oldStart,l=o.newStart,i+=1;continue}if(o===void 0&&(o={oldStart:1,oldLines:0,newStart:1,newLines:0,lines:[]},r.push(o),s=1,l=1),c.startsWith("\\")){i+=1;continue}c.startsWith("+")?(o.lines.push({type:"add",newNo:l,text:c.slice(1)}),l+=1):c.startsWith("-")?(o.lines.push({type:"del",oldNo:s,text:c.slice(1)}),s+=1):(o.lines.push({type:"ctx",oldNo:s,newNo:l,text:c.startsWith(" ")?c.slice(1):c}),s+=1,l+=1),i+=1}return U6(r),{...n!==void 0?{oldFile:n}:{},...a!==void 0?{newFile:a}:{},hunks:r.map(c=>({oldStart:c.oldStart,oldLines:c.oldLines,newStart:c.newStart,newLines:c.newLines,lines:c.lines.map(f=>({type:f.type,...f.oldNo!==void 0?{oldNo:f.oldNo}:{},...f.newNo!==void 0?{newNo:f.newNo}:{},text:f.text,...f.words!==void 0?{words:f.words}:{}}))}))}}function U6(e){for(let t of e){let n=t.lines,a=0;for(;a<n.length;){let i=n[a].type;if(i!=="add"&&i!=="del"){a+=1;continue}let r=[];for(;a<n.length&&n[a].type===i;)r.push(n[a]),a+=1;let o=i==="add"?"del":"add",s=[];for(;a<n.length&&n[a].type===o;)s.push(n[a]),a+=1;let l=Math.max(r.length,s.length);for(let c=0;c<l;c+=1){let f=r[c],v=s[c];if(f!==void 0&&v!==void 0){let{oldWords:g,newWords:h}=B6(f.text,v.text);f.words=g,v.words=h}else f!==void 0?f.words=[{text:f.text,kind:f.type==="add"?"add":"del"}]:v!==void 0&&(v.words=[{text:v.text,kind:v.type==="add"?"add":"del"}])}}}}function GT(e){return e.match(/\S+|\s+/g)??[]}var P6=2e4;function B6(e,t){let n=GT(e),a=GT(t),i=n.length,r=a.length;if(i*r>P6){let v=0;for(;v<i&&v<r&&n[v]===a[v];)v+=1;let g=0;for(;g<i-v&&g<r-v&&n[i-1-g]===a[r-1-g];)g+=1;let h=[],w=[];for(let x=0;x<v;x+=1)h.push({text:n[x],kind:"same"}),w.push({text:a[x],kind:"same"});for(let x=v;x<i-g;x+=1)h.push({text:n[x],kind:/^\s+$/.test(n[x])?"same":"del"});for(let x=v;x<r-g;x+=1)w.push({text:a[x],kind:/^\s+$/.test(a[x])?"same":"add"});for(let x=i-g;x<i;x+=1)h.push({text:n[x],kind:"same"});for(let x=r-g;x<r;x+=1)w.push({text:a[x],kind:"same"});return{oldWords:h,newWords:w}}let o=Array.from({length:i+1},()=>new Array(r+1).fill(0));for(let v=i-1;v>=0;v-=1)for(let g=r-1;g>=0;g-=1)o[v][g]=n[v]===a[g]?o[v+1][g+1]+1:Math.max(o[v+1][g],o[v][g+1]);let s=[],l=[],c=0,f=0;for(;c<i&&f<r;)n[c]===a[f]?(s.push({text:n[c],kind:"same"}),l.push({text:a[f],kind:"same"}),c+=1,f+=1):o[c+1][f]>=o[c][f+1]?(s.push({text:n[c],kind:/^\s+$/.test(n[c])?"same":"del"}),c+=1):(l.push({text:a[f],kind:/^\s+$/.test(a[f])?"same":"add"}),f+=1);for(;c<i;)s.push({text:n[c],kind:/^\s+$/.test(n[c])?"same":"del"}),c+=1;for(;f<r;)l.push({text:a[f],kind:/^\s+$/.test(a[f])?"same":"add"}),f+=1;return{oldWords:s,newWords:l}}function cv(e,t,n){let a=[];return e.hunks.forEach((i,r)=>{i.lines.forEach((o,s)=>{let l=`${r}:${s}`;(o.type==="ctx"||o.type==="add"&&t.has(l)||o.type==="del"&&n.has(l))&&a.push(o.text)})}),a.join(`
`)}var Se=X(re(),1),j6=200,XT=2,QT=2,hp=(0,_a.memo)(function({text:t}){let n=(0,_a.useMemo)(()=>YT(t),[t]),[a,i]=(0,_a.useState)("view"),[r,o]=(0,_a.useState)(new Set),[s,l]=(0,_a.useState)(new Set),[c,f]=(0,_a.useState)(!1),v=n.newFile??n.oldFile,g=(0,_a.useMemo)(()=>n.hunks.reduce((T,q)=>T+q.lines.length,0),[n]),h=g>j6&&!c,w=h?[...n.hunks.slice(0,XT),...n.hunks.slice(-QT)]:n.hunks,x=h?n.hunks.length-XT-QT:0,C=h?g-w.reduce((T,q)=>T+q.lines.length,0):0,p=(0,_a.useMemo)(()=>{let T=0,q=0,$=0,F=0;return n.hunks.forEach((Ie,at)=>{Ie.lines.forEach((Te,je)=>{let Je=`${at}:${je}`;Te.type==="add"?(T+=1,r.has(Je)&&($+=1)):Te.type==="del"&&(q+=1,s.has(Je)&&(F+=1))})}),{adds:T,dels:q,acceptedAdds:$,rejectedDels:F,remaining:T-$+q-F}},[n,r,s]),m=(0,_a.useMemo)(()=>a==="rejected"?"":a==="applied"&&r.size===0&&s.size===0?cv(n,G6(n,"add"),new Set):cv(n,r,s),[n,a,r,s]),b=(T,q)=>{q!=="ctx"&&(q==="add"?o($=>{let F=new Set($);return F.has(T)?F.delete(T):F.add(T),F}):l($=>{let F=new Set($);return F.has(T)?F.delete(T):F.add(T),F}))},y=()=>{if(r.size===0&&s.size===0){Q("请先逐行选择要接受或拒绝的行");return}i("applied")},N=()=>{i("view"),o(new Set),l(new Set)},D=()=>{i("view"),o(new Set),l(new Set)},O=(0,Se.jsxs)("div",{className:"diff-body"+(a==="review"?" diff-reviewing":""),children:[w.map((T,q)=>(0,Se.jsxs)("div",{className:"diff-hunk",children:[n.hunks.length>1&&(0,Se.jsxs)("div",{className:"diff-hunk-head",children:["@@ -",T.oldStart,",",T.oldLines," +",T.newStart,",",T.newLines," @@"]}),T.lines.map(($,F)=>{let Ie=`${q}:${F}`;return(0,Se.jsx)(Y6,{line:$,reviewing:a==="review",accepted:r.has(Ie),rejected:s.has(Ie),onToggle:()=>{b(Ie,$.type)}},Ie)})]},q)),h&&(0,Se.jsxs)("div",{className:"diff-fold",children:[(0,Se.jsxs)("span",{className:"diff-fold-text",children:["… 已折叠 ",x," 个 hunk / ",C," 行"]}),(0,Se.jsx)("button",{type:"button",className:"diff-fold-btn",onClick:()=>{f(!0)},children:"展开全部"})]}),a==="review"&&(0,Se.jsxs)("div",{className:"diff-review-foot",children:[(0,Se.jsxs)("span",{className:"diff-review-summary",children:["接受 ",p.acceptedAdds," 行 / 拒绝 ",p.rejectedDels," 行 / 剩余 ",p.remaining," 行"]}),(0,Se.jsx)("button",{type:"button",className:"diff-confirm diff-cancel",onClick:N,children:"取消"}),(0,Se.jsx)("button",{type:"button",className:"diff-confirm",onClick:y,children:"确认"})]})]});return(0,Se.jsxs)("div",{className:"diff-block","data-lang":"diff",children:[(0,Se.jsxs)("div",{className:"diff-head",children:[(0,Se.jsxs)("span",{className:"diff-title",children:[(0,Se.jsx)("span",{className:"diff-label",children:"变更对比"}),v!==void 0&&(0,Se.jsx)("span",{className:"diff-file",children:v})]}),(0,Se.jsx)("div",{className:"diff-actions",children:a==="view"&&(0,Se.jsxs)(Se.Fragment,{children:[(0,Se.jsx)("button",{type:"button",className:"diff-btn diff-accept",onClick:()=>{i("applied")},children:"接受"}),(0,Se.jsx)("button",{type:"button",className:"diff-btn diff-reject",onClick:()=>{i("rejected")},children:"拒绝"}),(0,Se.jsx)("button",{type:"button",className:"diff-btn diff-review",onClick:()=>{i("review")},children:"逐行审阅"})]})})]}),a==="applied"||a==="rejected"?(0,Se.jsxs)(Se.Fragment,{children:[(0,Se.jsxs)("div",{className:"diff-applied",children:[(0,Se.jsx)("span",{className:"diff-applied-tag"+(a==="rejected"?" diff-applied-tag-rejected":""),children:a==="applied"?"已应用":"已拒绝"}),a==="applied"&&r.size+s.size>0&&(0,Se.jsxs)("span",{className:"diff-applied-summary",children:["接受 ",p.acceptedAdds," 行 / 拒绝 ",p.rejectedDels," 行"]}),a==="applied"&&m!==""&&(0,Se.jsx)("button",{type:"button",className:"diff-undo",onClick:()=>{Ka(m,"已复制结果代码")},children:"复制结果"}),a==="rejected"&&(0,Se.jsx)("button",{type:"button",className:"diff-undo",onClick:D,children:"重新生成"}),(0,Se.jsx)("button",{type:"button",className:"diff-undo",onClick:D,children:"撤销"})]}),(0,Se.jsx)("div",{className:"diff-dimmed",children:O})]}):O]})});function G6(e,t){let n=new Set;return e.hunks.forEach((a,i)=>{a.lines.forEach((r,o)=>{r.type===t&&n.add(`${i}:${o}`)})}),n}function Y6({line:e,reviewing:t,accepted:n,rejected:a,onToggle:i}){let r=e.type==="add"?" diff-add":e.type==="del"?" diff-del":"",o=e.type==="add"&&n||e.type==="del"&&a;return(0,Se.jsxs)("div",{className:"diff-row"+(t?" diff-row-review":"")+r+(o?" diff-decided":""),children:[t&&(0,Se.jsxs)("div",{className:"diff-review-cell",children:[e.type==="add"&&(0,Se.jsx)("button",{type:"button",className:"diff-line-btn diff-line-add-btn"+(n?" diff-line-btn-on":""),"aria-label":"接受该行",onClick:i,children:"+"}),e.type==="del"&&(0,Se.jsx)("button",{type:"button",className:"diff-line-btn diff-line-del-btn"+(a?" diff-line-btn-on":""),"aria-label":"拒绝该行",onClick:i,children:"−"})]}),(0,Se.jsx)("span",{className:"diff-oldno",children:e.oldNo??""}),(0,Se.jsx)("span",{className:"diff-newno",children:e.newNo??""}),(0,Se.jsx)("span",{className:"diff-text",dangerouslySetInnerHTML:{__html:X6(e)}})]})}function X6(e){let t=e.words;if(t===void 0||t.length===0)return Qe(e.text);let n="";for(let a of t){let i=Qe(a.text);a.kind==="add"?n+='<span class="diff-word-add">'+i+"</span>":a.kind==="del"?n+='<span class="diff-word-del">'+i+"</span>":n+=i}return n}var nt=X(re(),1),Q6={ts:"ts",tsx:"tsx",js:"js",jsx:"jsx",mjs:"js",cjs:"js",py:"py",sh:"sh",bash:"sh",zsh:"sh",json:"json",yaml:"yaml",yml:"yaml",html:"html",xml:"xml",htm:"html",css:"css",rs:"rs",go:"go",java:"java",cpp:"cpp",cc:"cpp",cxx:"cpp",h:"cpp",hpp:"cpp",c:"c",md:"md",markdown:"md",sql:"sql",txt:"text",log:"text",gitignore:"text",toml:"text"};function K6(e){let t=e.split(/[\\/]/).pop()??"",n=t.lastIndexOf("."),a=n>0?t.slice(n+1).toLowerCase():t.toLowerCase();return a==="gitignore"||a==="dockerignore"?"text":Q6[a]??"text"}function F6(e){let t=e.split(/[\\/]/).pop()??"",n=t.lastIndexOf("."),a=n>0?t.slice(n+1).toLowerCase():"";return a==="md"||a==="markdown"||a==="mdx"}function Z6(e){let t=e.split(/[\\/]/).pop()??"",n=t.lastIndexOf("."),a=n>0?t.slice(n+1).toLowerCase():"";return a==="html"||a==="htm"}function FT({path:e,sessionId:t,onClose:n}){let[a,i]=(0,Xr.useState)({status:"loading"});(0,Xr.useEffect)(()=>{let l=!0;return i({status:"loading"}),Hf(e,t).then(c=>{l&&i({status:"ready",preview:c})},c=>{if(!l)return;let f=c instanceof Error?c.message:"文件不可读";i({status:"error",message:f})}),()=>{l=!1}},[e,t]);let r=a.status==="ready"?a.preview:null,o=r?.kind==="image",s=r!==null?r.name:e.split(/[\\/]/).pop()??e;return(0,nt.jsxs)(ht,{title:s,onClose:n,children:[a.status==="loading"&&(0,nt.jsx)("div",{className:"fp-loading",children:"正在读取文件…"}),a.status==="error"&&(0,nt.jsx)("div",{className:"fp-error",children:a.message}),r!==null&&(0,nt.jsxs)(nt.Fragment,{children:[(0,nt.jsxs)("div",{className:"fp-actions",children:[(0,nt.jsx)("span",{className:"fp-path",title:r.path,children:r.path}),!o&&(0,nt.jsxs)("button",{type:"button",className:"fp-copy",onClick:()=>{Ka(r.text,"已复制文件原文")},children:[(0,nt.jsx)(ip,{}),"复制原文"]})]}),o?(0,nt.jsx)("div",{className:"fp-image-wrap",children:(0,nt.jsx)("img",{className:"fp-image",src:r.dataUrl,alt:r.name,draggable:!1})}):(0,nt.jsx)(J6,{path:r.path,text:r.text})]})]})}function J6({path:e,text:t}){let n=K6(e),a=id(t,n),i=e.split(/[\\/]/).pop()??e,r=F6(e),o=Z6(e),s=(0,Xr.useMemo)(()=>r?rd(t):null,[r,t]);return s!==null?(0,nt.jsx)("div",{className:"chat-md-body fp-md",children:s.map(l=>l.kind==="think"?null:l.kind==="html"?(0,nt.jsx)("div",{className:"md-html",dangerouslySetInnerHTML:{__html:l.html}},l.id):l.kind==="code"?(0,nt.jsx)(gp,{lang:l.lang,code:l.code},l.id):(0,nt.jsx)(hp,{text:l.text},l.id))}):o?(0,nt.jsx)("iframe",{className:"fp-html",sandbox:"",title:i,srcDoc:t}):a!==null?(0,nt.jsx)(KT,{text:t,children:(0,nt.jsx)("div",{className:"fp-body",dangerouslySetInnerHTML:{__html:a}})}):(0,nt.jsx)(KT,{text:t,children:(0,nt.jsx)("pre",{className:"fp-body fp-plain",children:Qe(t)})})}var $6=60;function KT({text:e,children:t}){let n=(0,Xr.useMemo)(()=>e.split(`
`).length,[e]),[a,i]=(0,Xr.useState)(!1),r=n>$6,o=r&&!a;return(0,nt.jsxs)(nt.Fragment,{children:[(0,nt.jsx)("div",{className:"fp-scroll"+(o?" fp-scroll-folded":""),children:t}),r&&(0,nt.jsx)("button",{type:"button",className:"fp-fold-btn",onClick:()=>{i(s=>!s)},children:o?`展开全部（共 ${n} 行）`:"收起"})]})}var Ho=X(Ye(),1);var Qr=X(re(),1);function ZT({src:e,alt:t,onClose:n}){let[a,i]=(0,Ho.useState)("fit"),r=(0,Ho.useRef)(0);(0,Ho.useEffect)(()=>{let s=l=>{l.key==="Escape"&&n()};return window.addEventListener("keydown",s),()=>{window.removeEventListener("keydown",s)}},[n]),(0,Ho.useEffect)(()=>{let s=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{document.body.style.overflow=s}},[]);let o=()=>{let s=Date.now();if(s-r.current<300){i(l=>l==="fit"?"full":"fit"),r.current=0;return}r.current=s};return(0,Qr.jsxs)("div",{className:"lightbox-backdrop",role:"dialog","aria-modal":"true","aria-label":t,onClick:n,children:[(0,Qr.jsx)("button",{type:"button",className:"lightbox-close","aria-label":"关闭",onClick:n,children:(0,Qr.jsx)(jr,{})}),(0,Qr.jsx)("div",{className:"lightbox-stage"+(a==="full"?" lightbox-stage-full":""),onClick:s=>{s.stopPropagation()},children:(0,Qr.jsx)("img",{className:"lightbox-img",src:e,alt:t,onClick:o,draggable:!1})}),(0,Qr.jsx)("div",{className:"lightbox-hint","aria-hidden":!0,children:"双击放大/还原 · 点背景关闭"})]})}function dv(){return typeof navigator>"u"||typeof navigator.mediaDevices?.getUserMedia!="function"||typeof AudioContext!="function"&&typeof window.webkitAudioContext!="function"?!1:window.isSecureContext===!0}function W6(e,t){let n=new Int16Array(e.length);for(let c=0;c<e.length;c++){let f=Math.max(-1,Math.min(1,e[c]));n[c]=f<0?f*32768:f*32767}let a=new ArrayBuffer(44),i=new DataView(a),r=(c,f)=>{for(let v=0;v<f.length;v++)i.setUint8(c+v,f.charCodeAt(v))},o=n.length*2;r(0,"RIFF"),i.setUint32(4,36+o,!0),r(8,"WAVE"),r(12,"fmt "),i.setUint32(16,16,!0),i.setUint16(20,1,!0),i.setUint16(22,1,!0),i.setUint32(24,t,!0),i.setUint32(28,t*2,!0),i.setUint16(32,2,!0),i.setUint16(34,16,!0),r(36,"data"),i.setUint32(40,o,!0);let s=new Uint8Array(44+o);s.set(new Uint8Array(a),0),s.set(new Uint8Array(n.buffer),44);let l="";for(let c=0;c<s.length;c+=32768)l+=String.fromCharCode(...s.subarray(c,c+32768));return btoa(l)}async function JT(e){if(!dv())throw new Error("此浏览器不支持录音（需要 HTTPS 访问）");let t;try{t=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:!0,noiseSuppression:!0}})}catch(v){if(e?.signal?.aborted===!0)throw new Error("录音已取消");let g=v instanceof DOMException?v.name:"";throw g==="NotAllowedError"?new Error("麦克风权限被拒绝，请在浏览器设置中允许"):g==="NotFoundError"?new Error("没有找到可用的麦克风"):new Error("录音启动失败")}if(e?.signal?.aborted===!0){for(let v of t.getTracks())v.stop();throw new Error("录音已取消")}let n=typeof AudioContext=="function"?AudioContext:window.webkitAudioContext,a=new n({sampleRate:16e3}),i=a.createMediaStreamSource(t),r=a.createScriptProcessor(4096,1,1),o=[],s=0,l=!1;r.onaudioprocess=v=>{if(l)return;let g=v.inputBuffer.getChannelData(0);o.push(new Float32Array(g)),s+=g.length,s/16e3*1e3>=6e4&&(l=!0,f(),e?.onTimeout?.())},i.connect(r);let c=a.createGain();c.gain.value=0,r.connect(c),c.connect(a.destination);let f=()=>{l=!0;try{r.disconnect()}catch{}try{i.disconnect()}catch{}try{c.disconnect()}catch{}for(let v of t.getTracks())v.stop();a.close().catch(()=>{})};return e?.signal!==void 0&&e.signal.addEventListener("abort",f,{once:!0}),{stop(){let v=new Float32Array(s),g=0;for(let w of o)v.set(w,g),g+=w.length;let h=W6(v,a.sampleRate);return f(),v.length/a.sampleRate<.4?Promise.reject(new Error("录音太短，请按住后说话至少 1 秒")):Promise.resolve(h)},cancel(){f()}}}var $T="dsh.palm.voiceServices";function dl(){try{let e=localStorage.getItem($T);if(e===null||e==="")return[];let t=JSON.parse(e);return Array.isArray(t)?t.filter(n=>{if(typeof n!="object"||n===null)return!1;let a=n;return typeof a.id=="string"&&typeof a.name=="string"&&typeof a.baseURL=="string"&&typeof a.apiKey=="string"&&typeof a.model=="string"}):[]}catch{return[]}}function od(e){try{localStorage.setItem($T,JSON.stringify(e))}catch{}}function sd(){return dl()}function WT(e){let t=dl(),n=t.findIndex(a=>a.id===e.id);n===-1?t.push(e):t[n]=e,od(t.slice(0,8)),ld()}function e2(e){od(dl().filter(t=>t.id!==e)),ld()}function t2(e){let t=dl(),n=t.findIndex(i=>i.id===e);if(n<=0)return;let[a]=t.splice(n,1);t.splice(n-1,0,a),od(t),ld()}function n2(e){let t=dl(),n=t.findIndex(i=>i.id===e);if(n===-1||n>=t.length-1)return;let[a]=t.splice(n,1);t.splice(n+1,0,a),od(t),ld()}function a2(e){let t=dl().filter(n=>n.name!=="host 配置");od(t.slice(0,8)),ld()}var uv=new Set;function ld(){for(let e of uv)e()}function i2(e){return uv.add(e),()=>{uv.delete(e)}}var Vo=X(Ye(),1),vn=X(re(),1);function Si({title:e,body:t,confirmLabel:n,tone:a="primary",busy:i=!1,onConfirm:r,onCancel:o}){return(0,Vo.useEffect)(()=>{let l=f=>{f.key==="Escape"&&o()};window.addEventListener("keydown",l);let c=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{window.removeEventListener("keydown",l),document.body.style.overflow=c}},[o]),(0,vn.jsx)("div",{className:"dialog-backdrop",onClick:o,children:(0,vn.jsxs)("div",{className:"dialog",role:"alertdialog","aria-modal":"true","aria-label":e,onClick:l=>{l.stopPropagation()},children:[(0,vn.jsx)("h2",{className:"dialog-title",children:e}),(0,vn.jsx)("div",{className:"dialog-body",children:t}),(0,vn.jsxs)("div",{className:"dialog-actions",children:[(0,vn.jsx)("button",{type:"button",className:"dialog-btn",disabled:i,onClick:o,children:"取消"}),(0,vn.jsx)("button",{type:"button",className:`dialog-btn ${a==="danger"?"dialog-btn-danger":"dialog-btn-primary"}`,disabled:i,onClick:r,children:i?"处理中…":n})]})]})})}function Uo({title:e,initial:t,confirmLabel:n,busy:a=!1,onConfirm:i,onCancel:r}){let[o,s]=(0,Vo.useState)(t),l=(0,Vo.useRef)(null);(0,Vo.useEffect)(()=>{l.current?.select();let f=g=>{g.key==="Escape"&&r()};window.addEventListener("keydown",f);let v=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{window.removeEventListener("keydown",f),document.body.style.overflow=v}},[r]);let c=()=>{let f=o.trim();f!==""&&i(f)};return(0,vn.jsx)("div",{className:"dialog-backdrop",onClick:r,children:(0,vn.jsxs)("div",{className:"dialog",role:"dialog","aria-modal":"true","aria-label":e,onClick:f=>{f.stopPropagation()},children:[(0,vn.jsx)("h2",{className:"dialog-title",children:e}),(0,vn.jsx)("input",{ref:l,className:"dialog-input",value:o,"aria-label":e,disabled:a,onChange:f=>{s(f.target.value)},onKeyDown:f=>{f.key==="Enter"&&(f.preventDefault(),c())}}),(0,vn.jsxs)("div",{className:"dialog-actions",children:[(0,vn.jsx)("button",{type:"button",className:"dialog-btn",disabled:a,onClick:r,children:"取消"}),(0,vn.jsx)("button",{type:"button",className:"dialog-btn dialog-btn-primary",disabled:a||o.trim()==="",onClick:c,children:a?"保存中…":n})]})]})})}var pt=X(Ye(),1);var e3=16,Po=new Map,fv=new Map;function pv(e){let t=Po.get(e);if(t!==void 0)return Po.delete(e),Po.set(e,t),t}async function r2(e,t){let n=pv(t);if(n!==void 0)return n;let a=fv.get(t);if(a!==void 0)return await a;let i=qS(e,t).then(r=>{if(Po.set(t,r.dataUrl),Po.size>e3){let o=Po.keys().next();o.done||Po.delete(o.value)}return r.dataUrl}).catch(()=>{}).finally(()=>{fv.delete(t)});return fv.set(t,i),await i}var St=X(Ye(),1);var t3=16,Bo=new Map,mv=new Map;function o2(e,t){return e+"\0"+t}function n3(e,t){let n=o2(e,t),a=Bo.get(n);if(a!==void 0)return Bo.delete(n),Bo.set(n,a),a}async function s2(e,t){let n=n3(e,t);if(n!==void 0)return n;let a=o2(e,t),i=mv.get(a);if(i!==void 0)return await i;let r=Hf(t,e).then(o=>{if(o.kind==="image"){if(Bo.set(a,o.dataUrl),Bo.size>t3){let s=Bo.keys().next();s.done||Bo.delete(s.value)}return o.dataUrl}}).catch(()=>{}).finally(()=>{mv.delete(a)});return mv.set(a,r),await r}var ot=X(re(),1),bp=6e3,gv=800,a3=2e3;function i3(e){let t=e.trimEnd();if(t==="")return"";let n=t.lastIndexOf(`
`),a=n===-1?t:t.slice(n+1);return a.trim()===""?"":a}function r3(e){let t=e.trim();if(t==="")return"";let n=t.indexOf(`
`);return n===-1?t:t.slice(0,n)}var l2=5;function o3({text:e,pending:t,label:n="深度思考"}){let[a,i]=(0,St.useState)(!1),[r,o]=(0,St.useState)(!1),s=(0,St.useRef)(null),l=t?i3(e):r3(e),c=(0,St.useMemo)(()=>e.split(`
`),[e]),f=Math.max(0,c.length-l2);(0,St.useEffect)(()=>{let g=s.current;a&&r&&g&&(g.scrollTop=g.scrollHeight)},[a,r,e]);let v=a&&!r&&f>0?c.slice(0,l2).join(`
`)+`
…`:e;return(0,ot.jsxs)("div",{className:`chat-disclosure chat-reasoning${a?" chat-disclosure-open":""}`,"data-pending":t||void 0,children:[(0,ot.jsxs)("button",{type:"button",className:"chat-disclosure-head","aria-expanded":a,onClick:()=>{i(g=>!g)},children:[(0,ot.jsx)("span",{className:"chat-disclosure-icon","aria-hidden":!0,children:(0,ot.jsx)(Qi,{})}),(0,ot.jsx)("span",{className:"chat-disclosure-label",children:t?"思考中…":n}),!a&&(0,ot.jsx)("span",{className:"chat-disclosure-summary",children:l}),(0,ot.jsx)("span",{className:"chat-disclosure-caret","aria-hidden":!0,children:(0,ot.jsx)(Zc,{})})]}),a&&(0,ot.jsxs)(ot.Fragment,{children:[(0,ot.jsx)("div",{className:"chat-disclosure-body",ref:s,children:v}),f>0&&(0,ot.jsx)("button",{type:"button",className:"chat-reasoning-more",onClick:()=>{o(g=>!g)},children:r?"收起":`还有 ${f} 行思考...`})]})]})}function vp({text:e,pending:t,forceOpen:n=!1,highlightQuery:a,sessionId:i}){let[r,o]=(0,St.useState)(n);(0,St.useEffect)(()=>{n&&o(!0)},[n]);let s=(0,St.useRef)(null),l=(0,St.useRef)(0),c=(0,St.useRef)(null),f=(0,St.useRef)(null),v=y=>{let N=f.current;if(N!==null&&y.startsWith(N.text)){let O=y.slice(N.text.length),T=N.html+Qe(O).replace(/\n/g,"<br />");return f.current={text:y,html:T},T}let D=Qe(y).replace(/\n/g,"<br />");return f.current={text:y,html:D},D},g=y=>y.length>a3?v(y):Qe(y).replace(/(^|[^`])`([^`\n]+)`(?=$|[^`])/g,"$1<code>$2</code>").replace(/\*\*([^*\n]+)\*\*/g,"<strong>$1</strong>").replace(/(^|[^*])\*([^*\n]+)\*(?=$|[^*])/g,"$1<em>$2</em>").replace(/~~([^~\n]+)~~/g,"<del>$1</del>").replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g,(D,O,T)=>{let q=pp(T);return q===null?D:`<a href="${Qe(q)}" target="_blank" rel="noopener noreferrer">${O}</a>`}).split(/\n{2,}/).map(D=>`<p>${D.replace(/\n/g,"<br />")}</p>`).join(""),[h,w]=(0,St.useState)(()=>t?[{kind:"html",id:0,html:g(e)}]:rd(e)),x=(0,St.useRef)(t?"":e),C=(0,St.useRef)(t?e:"");(0,St.useEffect)(()=>{if(t){if(s.current!==null&&e===C.current)return;C.current=e;let y=s.current;y===null&&(y={blocks:[],stableLen:0},s.current=y);let N=c.current,D=T=>T.replace(/\r\n/g,`
`);N!==null&&y.stableLen>0&&D(e).slice(0,y.stableLen)!==D(N).slice(0,y.stableLen)&&(y.blocks=[],y.stableLen=0,l.current=0),c.current=e;let O=BT(e,y.stableLen);for(let T of O.blocks){let q=y.blocks[y.blocks.length-1];T.kind==="html"&&q!==void 0&&q.block.kind==="html"?y.blocks[y.blocks.length-1]={id:q.id,block:{kind:"html",html:q.block.html+T.html}}:(y.blocks.push({id:l.current,block:T}),l.current+=1)}if(y.stableLen=O.stableLen,y.blocks.length===0){w([{kind:"html",id:0,html:g(e)}]);return}w([...y.blocks.map(T=>({id:T.id,...T.block})),...O.tail===""?[]:[{kind:"html",id:-1,html:g(O.tail)}]]);return}e!==x.current&&(x.current=e,s.current=null,c.current=null,w(rd(e)))},[e,t]);let p=!t&&e.length>bp,m=p&&!r,b=(0,St.useRef)(null);return(0,St.useEffect)(()=>{let y=b.current;if(y===null||i===void 0)return;let N=y.querySelectorAll("img.md-local-img[data-local-src]");for(let D of N){if(D.dataset.localState!==void 0)continue;let O=D.getAttribute("data-local-src");O===null||O===""||(D.dataset.localState="loading",s2(i,O).then(T=>{if(D.isConnected){if(T===void 0){D.dataset.localState="failed";return}D.dataset.localState="loaded",D.src=T}}))}},[h,i]),(0,ot.jsxs)("div",{className:"chat-msg-text chat-md"+(m?" chat-md-collapsed":""),children:[(0,ot.jsxs)("div",{className:"chat-md-body",ref:b,children:[h.map(y=>y.kind==="think"?null:y.kind==="html"?(0,ot.jsx)("div",{className:"md-html",dangerouslySetInnerHTML:{__html:s3(y.html,a)}},y.id):y.kind==="code"?(0,ot.jsx)(gp,{lang:y.lang,code:y.code},y.id):(0,ot.jsx)(hp,{text:y.text},y.id)),h.some(y=>y.kind==="think")&&(0,ot.jsx)("div",{className:"chat-md-notes",children:h.map(y=>y.kind!=="think"?null:(0,ot.jsx)(o3,{text:y.text,pending:!1,label:"思考过程"},y.id))})]}),p&&(0,ot.jsx)("button",{type:"button",className:"chat-msg-toggle",onClick:()=>{o(y=>!y)},children:r?"收起":"展开全文（"+e.length+" 字）"})]})}function c2({text:e,forceOpen:t=!1,highlightQuery:n}){let[a,i]=(0,St.useState)(t);(0,St.useEffect)(()=>{t&&i(!0)},[t]);let r=s=>l3(s,n);if(e.length<=bp)return(0,ot.jsx)("span",{className:"chat-msg-text",children:r(e)});let o=a?e:e.slice(0,gv);return(0,ot.jsxs)("span",{className:"chat-msg-text",children:[r(o),a?"":"…",(0,ot.jsx)("button",{type:"button",className:"chat-msg-toggle",onClick:()=>{i(s=>!s)},children:a?"收起":`展开全文（${e.length} 字）`})]})}function d2(e){let t=e?.trim();if(t===void 0||t==="")return;let a=t.split(/\s+/).filter(Boolean).map(i=>i.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"));return new RegExp(a.sort((i,r)=>r.length-i.length).join("|"),"gi")}function s3(e,t){let n=d2(t);return n===void 0?e:e.split(/(<[^>]+>)/g).map(a=>a.startsWith("<")?a:a.replace(n,i=>`<mark class="chat-search-mark">${i}</mark>`)).join("")}function l3(e,t){let n=d2(t);if(n===void 0)return e;let a=[],i=0;for(let r of e.matchAll(n)){let o=r.index;o>i&&a.push(e.slice(i,o)),a.push((0,ot.jsx)("mark",{className:"chat-search-mark",children:r[0]},`${o}:${r[0]}`)),i=o+r[0].length}return i<e.length&&a.push(e.slice(i)),a}var c3={bash:"bash",pwsh:"bash",read:"read",read_image:"read",web_fetch:"read",web_search:"search",grep:"search",glob:"search",write:"write",edit:"edit",run_code:"code"},d3={search:"搜索",read:"读取",bash:"运行命令",write:"写入",edit:"编辑",code:"运行代码",others:"工具"},u3={pwsh:"运行命令",read_image:"查看图片",web_fetch:"抓取网页",web_search:"联网搜索",grep:"搜索内容",glob:"查找文件"},f3={bash:["description","command"],read:["path","file_path","url"],search:["query","pattern","url"],write:["path","file_path"],edit:["path","file_path"],code:["description"],others:[]},p3=["path","file_path"],m3=new Set(["read","write","edit"]);function hv(e){let t=e.indexOf(`
`);return t===-1?e:e.slice(0,t)}function g3(e){try{let t=JSON.parse(e);return typeof t=="object"&&t!==null&&!Array.isArray(t)?t:void 0}catch{return}}function u2(e,t){for(let n of t){let a=e[n];if(typeof a=="string"&&a!=="")return a}}function h3(e){return c3[e]??"others"}function yp(e){let t=h3(e.name),n=e.arguments??"",a=n===""?void 0:g3(n),i="";if(a!==void 0){let s=t==="search"&&Array.isArray(a.queries)?a.queries:void 0;if(s!==void 0){let l=s.filter(c=>typeof c=="string"&&c!=="");l.length>0&&(i=l.map(hv).join("，"))}if(i===""&&(i=u2(a,f3[t])??""),i===""){for(let l of Object.values(a))if(typeof l=="string"&&l!==""){i=l;break}}}i===""&&(i=n===""?e.name:n),i=hv(i);let r=m3.has(t)&&a!==void 0?u2(a,p3):void 0,o=u3[e.name];return{variant:t,title:o??d3[t],summary:t==="others"&&o===void 0&&n!==""?`${e.name} · ${i}`:i,...r!==void 0?{filePath:hv(r)}:{}}}var b3={running:"深度求索中",ok:"已完成",stopped:"已中断",failed:"失败"};function xp(e){return b3[e]}function dd(e,t){return e.pending===!0||(e.tools??[]).some(n=>n.state==="running")||t!==void 0&&e.turn!==void 0&&e.turn===t}function v3(e,t){return dd(e,t)?"running":e.failed===!0?"failed":e.maxTokens===!0||(e.tools??[]).some(n=>n.state==="stopped")?"stopped":"ok"}function wp(e){if(e===void 0)return{adds:0,dels:0};let t=0,n=0;for(let a of e.diffs)a.oldText!==null&&(n+=cd(a.oldText).length),t+=cd(a.newText).length;return{adds:t,dels:n}}function cd(e){return e===""?[]:(e.endsWith(`
`)?e.slice(0,-1):e).split(`
`)}function f2(e){let t=Math.max(0,Math.round(e/1e3)),n=Math.floor(t/3600),a=Math.floor(t%3600/60),i=t%60;return n>0?`${n}小时${a}分`:a>0?`${a}分${i}秒`:`${i}秒`}function p2(e){return e.split(`
`).length}function y3(e){let t=0,n=0;for(let a of e){let i=wp(a.view);t+=i.adds,n+=i.dels}return{adds:t,dels:n}}function x3(e,t,n,a){for(let i=t.length-1;i>=0;i--){let r=t[i];if(!(r===void 0||r.kind!=="text")&&(r.seq!==void 0&&a!==void 0&&r.seq===a||r.text===n))return i}return-1}function g2(e,t){let n=e.flow??[],a=new Map((e.tools??[]).map(T=>[T.callId,T])),i=e.stepSeqs,r=e.stepTexts,o=i!==void 0&&r!==void 0&&i.length===r.length&&r.length>=2,s=o?r[r.length-1]??"":"",l=o?i[i.length-1]:void 0,c=o&&s.trim()!=="",f=dd(e,t),v,g,h=-1,w=!1;if(c)v=s,g=l,h=x3(e,n,s,l);else if(o){if(f)for(let T=n.length-1;T>=0;T--){let q=n[T];if(!(q===void 0||q.kind!=="text"||q.text.trim()==="")){v=q.text,g=q.seq,h=T;break}}}else{let T=n.filter(q=>q.kind==="text"&&q.text.trim()!=="");if(w=!0,e.text.trim()!=="")v=e.text,g=T[0]?.seq;else if(T.length>0){let q=T[T.length-1];q!==void 0&&(v=q.text,g=q.seq)}}let x=[],C=0,p=0;for(let T=0;T<n.length;T++){let q=n[T];if(!(q===void 0||T===h))if(q.kind==="reasoning"){if(q.text.trim()==="")continue;p+=1,x.push({kind:"reasoning",key:`r${T}`,text:q.text,lines:p2(q.text)})}else if(q.kind==="tool"){let $=a.get(q.callId);if($===void 0)continue;C+=1,x.push({kind:"tool",key:`t${T}`,tool:$})}else!w&&q.text.trim()!==""&&x.push({kind:"text",key:`x${T}`,text:q.text,...q.seq!==void 0?{seq:q.seq}:{}})}let m=new Set;for(let T of n)T.kind==="tool"&&m.add(T.callId);for(let T of e.tools??[])m.has(T.callId)||(C+=1,x.push({kind:"tool",key:`t-${T.callId}`,tool:T}));if(p===0&&(e.reasoning??"").trim()!==""){let T=e.reasoning??"";x.unshift({kind:"reasoning",key:"r-merged",text:T,lines:p2(T)}),p=1}v===void 0&&x.length===0&&e.text.trim()!==""&&(v=e.text);let b=w3(e,x,t),y=new Set,N="",D=0;for(let T of e.tools??[]){T.state==="error"&&(D+=1);for(let q of T.view?.diffs??[])y.add(q.path);N===""&&T.view!==void 0&&(N=T.view.title??T.name)}let O=y3(e.tools??[]);return{rows:x,answer:v,answerSeq:g,toolCount:C,reasoningCount:p,current:b,outcome:v3(e,t),changedFiles:y.size,errorCount:D,artifactTitle:N,artifactCount:x.filter(T=>T.kind==="tool"&&T.tool.view!==void 0).length,tallyAdds:O.adds,tallyDels:O.dels}}function w3(e,t,n){if(dd(e,n)){let i=[...e.flow??[]].reverse().find(o=>!(o.kind==="text"&&o.text.trim()===""));if(i===void 0||i.kind==="reasoning")return{kind:"thinking",text:"思考中"};if(i.kind==="text")return{kind:"answering",text:"正在回答"};let r=t.find(o=>o.kind==="tool"&&o.tool.callId===i.callId);return r===void 0||r.kind!=="tool"?{kind:"thinking",text:"思考中"}:r.tool.state==="running"?m2(r.tool):{kind:"thinking",text:"思考中"}}for(let a=t.length-1;a>=0;a-=1){let i=t[a];if(i!==void 0){if(i.kind==="tool")return m2(i.tool);if(i.kind==="reasoning")return{kind:"thinking",text:`深度思考 ${i.lines} 行`}}}}function m2(e){let t=yp(e);return{kind:"tool",text:t.summary===""?t.title:`${t.title} · ${t.summary}`,variant:t.variant}}function h2(e,t){return e.changedFiles>0?`改了 ${e.changedFiles} 个文件`:t?"未改动文件":""}function b2(e,t){let n=t?e.toolCount:0;return n>0?`共 ${n} 步`:""}function v2(e){return e.errorCount>0?`⚠ ${e.errorCount} 处报错`:""}function bv(e,t){return t?e.rows.length:e.rows.filter(n=>n.kind!=="tool").length+e.artifactCount}var S3=3e3;function y2(e,t){let n=t.running?"running":e.outcome==="running"?"ok":e.outcome,a=vv(n,t);return a===""?xp(n):`${xp(n)}，${a}`}function vv(e,t){return e==="running"?t.liveElapsedMs===void 0||t.liveElapsedMs<S3?"":`用时${f2(t.liveElapsedMs)}`:t.durationMs===void 0?"":`用时${f2(t.durationMs)}`}var L=X(re(),1),yv=(0,pt.memo)(function({message:t,sessionId:n,showToolCalls:a,showSystemMessages:i,showTime:r=!0,focused:o=!1,focusedQuery:s,style:l,onRegenerate:c,onOpenFile:f,clockOffsetMs:v,liveTurnStartAt:g,liveTurn:h}){let w=t.startSeq??t.seq;if(t.kind==="user"&&t.sourceKind!==void 0&&t.sourceKind!=="user"){let D=bk(t.sourceKind);if(D!==void 0){let O=$=>String($).padStart(2,"0"),T=new Date(t.time),q=`${O(T.getHours())}:${O(T.getMinutes())}`;return(0,L.jsxs)("details",{"data-mid":t.id,"data-message-id":t.id,"data-row-seq":w,className:"chat-trigger"+(o?" chat-msg-focus":""),style:l,children:[(0,L.jsxs)("summary",{className:"chat-trigger-head",children:[(0,L.jsx)("span",{className:"chat-trigger-icon","aria-hidden":!0,children:vk(t.sourceKind)}),(0,L.jsx)("span",{className:"chat-trigger-title",children:D}),r&&(0,L.jsx)("span",{className:"chat-trigger-time",children:q}),(0,L.jsx)("span",{className:"chat-trigger-caret","aria-hidden":!0,children:"▾"})]}),(0,L.jsxs)("div",{className:"chat-trigger-body",children:[(0,L.jsx)("p",{className:"chat-trigger-note",children:"这条通知触发了本轮回复。"}),t.text.trim()!==""&&(0,L.jsx)("div",{className:"chat-trigger-text",children:t.text})]})]})}if(!i)return null}if(t.kind==="command")return(0,L.jsxs)("div",{"data-mid":t.id,"data-message-id":t.id,"data-row-seq":w,className:"chat-command"+(t.commandPhase==="error"?" chat-command-error":"")+(o?" chat-msg-focus":""),style:l,role:"status",children:[(0,L.jsx)("span",{className:"chat-command-name",children:t.commandLine??"命令"}),(0,L.jsx)("span",{className:"chat-command-result",children:t.commandPhase==="running"?"执行中…":t.text})]});if(t.kind==="turn"){let D=(t.deliverables?.length??0)+(t.produced?.length??0);return D===0?null:(0,L.jsxs)("div",{"data-mid":t.id,"data-message-id":t.id,"data-row-seq":w,className:"chat-turn-tail",style:l,children:[(0,L.jsxs)("div",{className:"chat-turn-tail-head",children:[(0,L.jsx)("span",{className:"chat-turn-tail-title",children:"本轮产出"}),(0,L.jsxs)("span",{className:"chat-turn-tail-count",children:[D," 个文件"]})]}),t.deliverables!==void 0&&t.deliverables.length>0&&(0,L.jsxs)("div",{className:"chat-turn-tail-section",children:[(0,L.jsx)("span",{className:"chat-turn-tail-label",children:"交付物"}),t.deliverables.map(O=>(0,L.jsxs)("button",{type:"button",className:"chat-turn-tail-file",onClick:()=>{f?.(O.path)},children:[(0,L.jsxs)("span",{className:"chat-turn-tail-file-name",children:[O.description??I3(O.path),(0,L.jsx)("span",{className:"chat-turn-tail-badge",children:"已交付"})]}),(0,L.jsx)("span",{className:"chat-turn-tail-file-path",children:O.path})]},O.path))]}),t.produced!==void 0&&t.produced.length>0&&(0,L.jsxs)("div",{className:"chat-turn-tail-section",children:[(0,L.jsx)("span",{className:"chat-turn-tail-label",children:"本轮产出文件"}),t.produced.map(O=>(0,L.jsx)("button",{type:"button",className:"chat-turn-tail-file",onClick:()=>{f?.(O)},children:(0,L.jsx)("span",{className:"chat-turn-tail-file-path",children:O})},O))]})]})}let x=t.kind==="assistant"&&t.reasoning!==void 0&&t.reasoning!=="",C=a&&t.kind==="assistant"&&t.tools!==void 0&&t.tools.length>0,p=t.text!=="",m=t.failed===!0,b=n!==void 0&&t.images!==void 0&&t.images.length>0?t.images:void 0,y=b!==void 0,N=t.flow!==void 0&&t.flow.some(D=>D.kind==="text"&&D.text!=="");return!x&&!C&&!p&&!m&&!N&&!y?null:(0,L.jsxs)("div",{"data-mid":t.id,"data-message-id":t.id,"data-row-seq":w,className:`chat-msg chat-msg-${t.kind}${t.pending===!0?" chat-msg-pending":""}${t.failed===!0?" chat-msg-failed":""}${o?" chat-msg-focus":""}`,style:l,children:[t.kind==="assistant"?(0,L.jsx)(O3,{message:t,showToolCalls:a,forceOpen:o,focusedQuery:o?s:void 0,sessionId:n,clockOffsetMs:v,liveTurnStartAt:g,liveTurn:h}):(0,L.jsxs)(L.Fragment,{children:[(0,L.jsx)(c2,{text:t.text,forceOpen:o,highlightQuery:o?s:void 0}),b!==void 0&&n!==void 0&&(0,L.jsx)(k3,{sessionId:n,images:b})]}),t.failed===!0&&(0,L.jsx)("span",{className:"chat-msg-failtag",children:"本次回复失败"}),t.maxTokens===!0&&(0,L.jsx)("div",{className:"chat-msg-maxtokens",children:"已达到输出 token 上限，回答被截断。发送“继续”可让模型接着输出。"}),(0,L.jsxs)("span",{className:"chat-msg-footer",children:[r&&(0,L.jsx)("span",{className:"chat-msg-time",children:w2(t.time)}),t.kind==="assistant"&&c!==void 0&&(0,L.jsxs)("button",{type:"button",className:"chat-msg-regenerate",onClick:c,"aria-label":"重新生成回复",children:[(0,L.jsx)("span",{className:"chat-msg-regenerate-icon","aria-hidden":!0,children:"↻"}),"重新生成"]})]})]})});function k3({sessionId:e,images:t}){return(0,L.jsx)("div",{className:"chat-msg-images",role:"list","aria-label":"消息图片",children:t.map(n=>(0,L.jsx)(N3,{sessionId:e,image:n},n.attachmentId))})}function N3({sessionId:e,image:t}){let[n,a]=(0,pt.useState)(()=>pv(t.attachmentId)),[i,r]=(0,pt.useState)(!1),[o,s]=(0,pt.useState)(0),l=t.name!==void 0&&t.name!==""?t.name:"图片";return(0,pt.useEffect)(()=>{if(n!==void 0)return;let c=!1;return r2(e,t.attachmentId).then(f=>{c||(f===void 0?r(!0):(r(!1),a(f)))}),()=>{c=!0}},[e,t.attachmentId,n,o]),n===void 0?(0,L.jsx)("button",{type:"button",role:"listitem",className:`chat-msg-image chat-msg-image-placeholder${i?" chat-msg-image-failed":""}`,"aria-label":i?`${l}，加载失败，点击重试`:`${l}，加载中`,onClick:()=>{i&&(r(!1),s(c=>c+1))},children:i?"图片加载失败，点击重试":"图片加载中…"}):(0,L.jsx)("img",{className:"chat-msg-image",role:"listitem",src:n,alt:l,loading:"lazy",...t.width>0?{width:t.width}:{},...t.height>0?{height:t.height}:{}})}function T3(e){let[t,n]=(0,pt.useState)(()=>Date.now());return(0,pt.useEffect)(()=>{if(!e)return;n(Date.now());let a=setInterval(()=>{n(Date.now())},1e3);return()=>{clearInterval(a)}},[e]),t}function E3({message:e,model:t,showToolCalls:n,focusedQuery:a,sessionId:i,clockOffsetMs:r,liveTurnStartAt:o,liveTurn:s}){let[l,c]=(0,pt.useState)(!1),f=dd(e,s),v=T3(f),g=e.turnStartAt??o,h=f&&g!==void 0?Math.max(0,v+(r??0)-g):void 0,w=(0,pt.useRef)({anchor:void 0,elapsed:0});w.current.anchor!==g&&(w.current={anchor:g,elapsed:0}),h!==void 0&&h>w.current.elapsed&&(w.current={anchor:g,elapsed:h});let x=f&&g!==void 0?w.current.elapsed:void 0,C=e.durationMs??(e.turnStartAt!==void 0?Math.max(0,e.time-e.turnStartAt):void 0),p=f?"running":t.outcome==="running"?"ok":t.outcome,m=y2(t,{running:f,durationMs:C,...x!==void 0?{liveElapsedMs:x}:{}}),b=xp(p),y=vv(p,{durationMs:C,...x!==void 0?{liveElapsedMs:x}:{}}),N=t.current,D=v2(t),O=D===""?m:`${m}，${D}`,T=h2(t,!f),q=b2(t,n),$=bv(t,n),F=f?"⏳":t.outcome==="failed"?"❌":t.outcome==="stopped"?"⏹️":"✅",Ie=(0,L.jsx)("span",{className:`chat-proc-lead${f?" chat-proc-lead-running":""}`,"aria-hidden":!0,children:F});return $===0?(0,L.jsx)("div",{className:"chat-proc","data-proc-rows":"0",children:(0,L.jsxs)("div",{className:"chat-proc-head chat-proc-head-static",role:"status","aria-label":O,children:[(0,L.jsxs)("span",{className:"chat-proc-line chat-proc-label",children:[Ie,(0,L.jsx)("span",{className:"chat-proc-state",children:b}),D!==""&&(0,L.jsx)("span",{className:"chat-proc-errors",children:D}),y!==""&&(0,L.jsx)("span",{className:"chat-proc-time",children:y})]}),N!==void 0&&(0,L.jsx)("span",{className:"chat-proc-line chat-proc-current",children:(0,L.jsx)("span",{className:"chat-proc-current-text",children:N.text})})]})}):(0,L.jsxs)("div",{className:`chat-proc${l?" chat-proc-open":""}${f?" chat-proc-running":""}`,"data-proc-rows":$,children:[(0,L.jsxs)("button",{type:"button",className:"chat-proc-head","aria-expanded":l,onClick:()=>{c(at=>!at)},children:[(0,L.jsxs)("span",{className:"chat-proc-line chat-proc-label",children:[Ie,(0,L.jsx)("span",{className:"chat-proc-state",children:b}),D!==""&&(0,L.jsx)("span",{className:"chat-proc-errors",children:D}),y!==""&&(0,L.jsx)("span",{className:"chat-proc-time",children:y})]}),N!==void 0&&(0,L.jsxs)("span",{className:"chat-proc-line chat-proc-current",children:[(0,L.jsx)("span",{className:`chat-step-icon${N.variant===void 0?" chat-step-icon-thinking":""}${f&&N.variant==="bash"?" chat-step-icon-spin":""}`,"aria-hidden":!0,children:N.variant===void 0?"💭":x2(N.variant)}),(0,L.jsx)("span",{className:"chat-proc-current-text",children:N.text}),T!==""&&(0,L.jsx)("span",{className:"chat-proc-meta",children:T})]}),(0,L.jsx)("span",{className:"chat-proc-caret","aria-hidden":!0,children:l?"▾":"▸"})]}),l&&(0,L.jsxs)("div",{className:"chat-proc-body",children:[q!==""&&(0,L.jsx)("div",{className:"chat-proc-steps",children:q}),(0,L.jsx)(M3,{message:e,model:t,showToolCalls:n,focusedQuery:a,sessionId:i})]})]})}function M3({message:e,model:t,showToolCalls:n,focusedQuery:a,sessionId:i}){let r=[],o=[],s=0,l=0,c=()=>{o.length>0&&(r.push((0,L.jsx)(_3,{tools:o},`card-${s}`)),s+=1,o=[])};for(let f of t.rows){if(f.kind==="reasoning"){c(),r.push((0,L.jsx)(R3,{row:f},f.key));continue}if(f.kind==="tool"){n&&r.push((0,L.jsx)(C3,{tool:f.tool},f.key)),f.tool.view!==void 0?o.push(f.tool):c();continue}c();let v=f.seq??e.stepSeqs?.[l],g=(0,L.jsx)(vp,{text:f.text,pending:e.pending===!0,forceOpen:a!==void 0,highlightQuery:a,sessionId:i});r.push(v===void 0?(0,L.jsx)(pt.Fragment,{children:g},f.key):(0,L.jsx)("div",{className:"chat-flow-text","data-step-seq":v,"data-part-id":`text-${l}`,children:g},f.key)),l+=1}return c(),(0,L.jsx)(L.Fragment,{children:r})}function R3({row:e}){let[t,n]=(0,pt.useState)(!1);return(0,L.jsxs)("div",{className:"chat-think",children:[(0,L.jsxs)("button",{type:"button",className:"chat-think-head","aria-expanded":t,onClick:()=>{n(a=>!a)},children:[(0,L.jsx)("span",{className:"chat-think-icon","aria-hidden":!0,children:"✦"}),(0,L.jsxs)("span",{className:"chat-think-label",children:["深度思考 · ",e.lines," 行"]}),(0,L.jsx)("span",{className:"chat-think-caret","aria-hidden":!0,children:t?"▾":"▸"})]}),t&&(0,L.jsx)("div",{className:"chat-think-body",children:e.text})]})}function C3({tool:e}){let[t,n]=(0,pt.useState)(!1),a=yp(e),i=e.state??"running",r=e.view===void 0?void 0:wp(e.view);return(0,L.jsxs)("div",{className:"chat-step","data-state":i,children:[(0,L.jsxs)("button",{type:"button",className:"chat-step-head","aria-expanded":t,onClick:()=>{n(o=>!o)},children:[(0,L.jsx)("span",{className:"chat-step-icon","aria-hidden":!0,children:x2(a.variant)}),(0,L.jsx)("span",{className:"chat-step-title",children:a.title}),(0,L.jsx)("span",{className:"chat-step-summary",children:a.summary}),(0,L.jsx)("span",{className:`chat-step-state chat-step-state-${i}`,children:A3[i]??i}),r!==void 0&&(0,L.jsxs)("span",{className:"chat-step-tally","aria-hidden":!0,children:[(0,L.jsxs)("span",{className:"chat-step-tally-add",children:["+",r.adds]}),(0,L.jsxs)("span",{className:"chat-step-tally-del",children:["−",r.dels]})]}),(0,L.jsx)("span",{className:"chat-step-caret","aria-hidden":!0,children:t?"▾":"▸"})]}),t&&e.arguments!==void 0&&(0,L.jsx)("pre",{className:"chat-tool-args",children:e.arguments})]})}var A3={running:"运行中",ok:"完成",error:"失败",stopped:"已中断"};function x2(e){return e==="search"?"🔍":e==="read"?"📂":e==="bash"?"⚙️":e==="write"||e==="edit"?"✏️":e==="code"?"💻":"🔧"}function O3({message:e,showToolCalls:t,forceOpen:n,focusedQuery:a,sessionId:i,clockOffsetMs:r,liveTurnStartAt:o,liveTurn:s}){let l=(0,pt.useMemo)(()=>g2(e,s),[e,s]),f=bv(l,t)>0||e.durationMs!==void 0||e.turnStartAt!==void 0,v=l.answer;return(0,L.jsxs)(L.Fragment,{children:[f&&(0,L.jsx)(E3,{message:e,model:l,showToolCalls:t,focusedQuery:a,sessionId:i,clockOffsetMs:r,liveTurnStartAt:o,liveTurn:s}),v!==void 0&&v!==""&&(l.answerSeq===void 0?(0,L.jsx)(vp,{text:v,pending:e.pending===!0,forceOpen:n,highlightQuery:a,sessionId:i}):(0,L.jsx)("div",{className:"chat-flow-text chat-flow-answer","data-step-seq":l.answerSeq,"data-part-id":"answer",children:(0,L.jsx)(vp,{text:v,pending:e.pending===!0,forceOpen:n,highlightQuery:a,sessionId:i})}))]})}function _3({tools:e}){let t=(0,pt.useMemo)(()=>{let n=e.filter(a=>a.view!==void 0);if(n.length!==0)return{card:"diff",title:n.length===1?n[0]?.view?.title??n[0]?.name??"":`编辑了 ${n.length} 个文件`,diffs:n.flatMap(a=>a.view?.diffs??[])}},[e]);return t===void 0?null:(0,L.jsx)(z3,{tool:{...e.find(n=>n.view!==void 0),view:t}})}function z3({tool:e}){let[t,n]=(0,pt.useState)(!1),a=(0,pt.useRef)(null),i=e.view,r=(0,pt.useMemo)(()=>wp(i),[i]);return(0,pt.useEffect)(()=>{let o=a.current;o!==null&&(o.style.maxHeight=t?`${o.scrollHeight}px`:"0px")},[t,i]),i===void 0?null:(0,L.jsxs)("div",{className:"chat-artifact",children:[(0,L.jsxs)("button",{type:"button",className:"chat-artifact-head","aria-expanded":t,onClick:()=>{n(o=>!o)},children:[(0,L.jsx)("span",{className:"chat-artifact-title",children:i.title??e.name}),(0,L.jsxs)("span",{className:"chat-artifact-summary",children:[(0,L.jsxs)("span",{className:"chat-artifact-stat chat-artifact-stat-add",children:["+",r.adds]}),(0,L.jsxs)("span",{className:"chat-artifact-stat chat-artifact-stat-del",children:["−",r.dels]})]}),(0,L.jsx)("span",{className:"chat-artifact-caret","aria-hidden":!0,children:t?"▾":"▸"})]}),t&&(0,L.jsx)(D3,{view:i,diffRef:a})]})}function D3({view:e,diffRef:t}){let n=(0,pt.useMemo)(()=>{let a=[];for(let i of e.diffs){if(a.push({kind:"path",text:i.path}),i.oldText!==null)for(let r of cd(i.oldText))a.push({kind:"del",text:r});for(let r of cd(i.newText))a.push({kind:"add",text:r})}return a},[e]);return(0,L.jsx)("div",{ref:t,className:"chat-tool-diff",style:{maxHeight:0},children:n.map((a,i)=>(0,L.jsxs)("div",{className:"chat-tool-diff-row"+(a.kind==="del"?" chat-tool-diff-del":a.kind==="add"?" chat-tool-diff-add":" chat-tool-diff-path"),children:[a.kind!=="path"&&(0,L.jsx)("span",{className:"chat-tool-diff-sign","aria-hidden":!0,children:a.kind==="del"?"−":"+"}),(0,L.jsx)("span",{className:"chat-tool-diff-text",children:a.text})]},i))})}function I3(e){let t=e.split(/[\\/]/);return t[t.length-1]||e}var Ht=X(Ye(),1);var P=X(re(),1);function xv(e){if(!S2(e))return;let t=Array.isArray(e.options)?e.options:[],n=[];for(let i of t){if(!S2(i))continue;let r=typeof i.value=="string"?i.value:void 0,o=typeof i.name=="string"?i.name:void 0;r===void 0||o===void 0||n.push({value:r,name:o,...typeof i.description=="string"?{description:i.description}:{}})}let a=typeof e.currentValue=="string"?e.currentValue:void 0;if(!(a===void 0||n.length===0))return{options:n,currentValue:a}}function S2(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function N2({commands:e,onPickImage:t,onPickCamera:n,onPickCommand:a,onClose:i}){return(0,P.jsx)(ht,{title:"添加内容",onClose:i,children:(0,P.jsxs)("div",{role:"menu","aria-label":"添加内容",children:[(0,P.jsxs)("button",{type:"button",role:"menuitem",className:"sheet-option",onClick:t,children:[(0,P.jsxs)("span",{className:"sheet-option-copy",children:[(0,P.jsx)("span",{className:"sheet-option-title",children:"图片"}),(0,P.jsx)("span",{className:"sheet-option-desc",children:"从相册选择"})]}),(0,P.jsxs)("svg",{viewBox:"0 0 16 16",width:"18",height:"18","aria-hidden":"true",focusable:"false",children:[(0,P.jsx)("rect",{x:"1.5",y:"1.5",width:"13",height:"13",rx:"2.5",fill:"none",stroke:"currentColor",strokeWidth:"1.6"}),(0,P.jsx)("circle",{cx:"6",cy:"6",r:"1.6",fill:"currentColor"}),(0,P.jsx)("path",{d:"M2 11.5 L5.5 8 L8 10.5 L10.5 8 L14 11.5",fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinejoin:"round"})]})]}),(0,P.jsxs)("button",{type:"button",role:"menuitem",className:"sheet-option",onClick:n,children:[(0,P.jsxs)("span",{className:"sheet-option-copy",children:[(0,P.jsx)("span",{className:"sheet-option-title",children:"拍照"}),(0,P.jsx)("span",{className:"sheet-option-desc",children:"调用相机拍摄"})]}),(0,P.jsxs)("svg",{viewBox:"0 0 16 16",width:"18",height:"18","aria-hidden":"true",focusable:"false",children:[(0,P.jsx)("path",{d:"M2 5.5 A1.5 1.5 0 0 1 3.5 4 H5 L6 2.5 H10 L11 4 H12.5 A1.5 1.5 0 0 1 14 5.5 V12 A1.5 1.5 0 0 1 12.5 13.5 H3.5 A1.5 1.5 0 0 1 2 12 Z",fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinejoin:"round"}),(0,P.jsx)("circle",{cx:"8",cy:"8.75",r:"2.4",fill:"none",stroke:"currentColor",strokeWidth:"1.6"})]})]}),(0,P.jsx)("div",{className:"sheet-option-divider",role:"separator"}),e===void 0?(0,P.jsx)("p",{className:"sheet-note",children:"命令加载中…"}):e.length===0?(0,P.jsx)("p",{className:"sheet-note",children:"没有可用命令"}):e.map(r=>(0,P.jsx)("button",{type:"button",role:"menuitem",className:"sheet-option",onClick:()=>{a(`/${r.name}`)},children:(0,P.jsxs)("span",{className:"sheet-option-copy",children:[(0,P.jsxs)("span",{className:"sheet-option-title",children:["/",r.name]}),(0,P.jsx)("span",{className:"sheet-option-desc",children:r.description})]})},r.name))]})})}function T2({sessionId:e,current:t,onCurrent:n,onClose:a}){let[i,r]=(0,Ht.useState)({status:"loading"}),[o,s]=(0,Ht.useState)(!1),[l,c]=(0,Ht.useState)(void 0),f=(0,Ht.useCallback)(()=>{r({status:"loading"}),Dc(e).then(b=>{r({status:"ready",data:b})},b=>{r({status:"error",message:he(b)})})},[e]);(0,Ht.useEffect)(()=>{f()},[f]);let v=(0,Ht.useCallback)(b=>{o||(s(!0),c(void 0),Lf(e,b).then(y=>{s(!1),n(y.selected),a()},y=>{s(!1),c(he(y))}))},[o,e,n,a]);if(i.status==="loading")return(0,P.jsx)(ht,{title:"模型与思考强度",onClose:a,children:(0,P.jsx)("div",{className:"sheet-status",children:"正在加载模型目录…"})});if(i.status==="error")return(0,P.jsx)(ht,{title:"模型与思考强度",onClose:a,children:(0,P.jsxs)("div",{className:"sheet-status sheet-status-error",children:[(0,P.jsx)("span",{children:i.message}),Fa(i.message)!==void 0&&(0,P.jsx)("span",{className:"sheet-hint",children:Fa(i.message)}),(0,P.jsx)("button",{type:"button",className:"chat-load-older",onClick:f,children:"重试"})]})});let{data:g}=i,h=t??g.current,w=g.groups.flatMap(b=>b.models.map(y=>({group:b,model:y}))),C=w.find(b=>b.group.id===h.provider&&b.model.id===h.model)?.model.reasoning,p=h.reasoningEffort??C?.defaultEffort,m=C===void 0?[]:[...C.defaultEffort===void 0?[{key:"provider-default",effort:void 0,label:"跟随模型默认"}]:[],...C.efforts.map(b=>({key:`effort:${b.id}`,effort:b.id,label:b.name,description:b.description}))];return(0,P.jsxs)(ht,{title:"模型与思考强度",onClose:a,children:[l!==void 0&&(0,P.jsx)("p",{className:"sheet-error",children:l}),l!==void 0&&Fa(l)!==void 0&&(0,P.jsx)("p",{className:"sheet-hint",children:Fa(l)}),g.failures.map(b=>(0,P.jsxs)("p",{className:"sheet-error",children:[b.name,": ",b.message]},b.id)),g.groups.length===0&&w.length===0&&(0,P.jsx)("div",{className:"sheet-status",children:"没有可用的模型"}),g.groups.map(b=>(0,P.jsxs)("div",{className:"sheet-section",children:[(0,P.jsx)("div",{className:"sheet-section-title",children:b.name}),b.models.map(y=>{let N=h.provider===b.id&&h.model===y.id;return(0,P.jsxs)("button",{type:"button",className:`sheet-option${N?" sheet-option-selected":""}`,disabled:o,onClick:()=>{v({provider:b.id,model:y.id,...y.reasoning?.defaultEffort===void 0?{}:{reasoningEffort:y.reasoning.defaultEffort}})},children:[(0,P.jsxs)("span",{className:"sheet-option-copy",children:[(0,P.jsx)("span",{className:"sheet-option-title",children:y.name}),y.description!==void 0&&(0,P.jsx)("span",{className:"sheet-option-desc",children:y.description})]}),N&&(0,P.jsx)("span",{className:"sheet-option-check","aria-hidden":!0,children:"√"})]},y.id)})]},b.id)),m.length>0&&(0,P.jsxs)("div",{className:"sheet-section",children:[(0,P.jsx)("div",{className:"sheet-section-title",children:"思考强度"}),m.map(b=>{let y=p===b.effort;return(0,P.jsxs)("button",{type:"button",className:`sheet-option${y?" sheet-option-selected":""}`,disabled:o,onClick:()=>{v({provider:h.provider,model:h.model,...b.effort!==void 0?{reasoningEffort:b.effort}:{}})},children:[(0,P.jsx)("span",{className:"sheet-option-copy",children:(0,P.jsx)("span",{className:"sheet-option-title",children:b.label})}),y&&(0,P.jsx)("span",{className:"sheet-option-check","aria-hidden":!0,children:"√"})]},b.key)})]})]})}function E2({sessionId:e,value:t,onChanged:n,onClose:a}){let[i,r]=(0,Ht.useState)(null),[o,s]=(0,Ht.useState)(!1),[l,c]=(0,Ht.useState)(void 0),f=(0,Ht.useCallback)(g=>{o||(s(!0),c(void 0),zc(e,`/permission ${g}`).then(h=>{if(s(!1),r(null),!h.matched){c("权限命令未在宿主注册，无法切换");return}n(g),a()},h=>{s(!1),r(null),c(he(h))}))},[o,e,n,a]),v=g=>{if(g===t.currentValue){a();return}if(g==="danger-full-access"){r(g);return}f(g)};return i!==null?(0,P.jsxs)(ht,{title:"确认完全权限",onClose:()=>{r(null)},children:[(0,P.jsx)("p",{className:"sheet-confirm-desc",children:"开启完全权限后，远程会话可以在工作区内执行任意操作（包括运行命令、修改所有文件与访问凭证）。 仅在您信任当前设备和网络时开启。"}),l!==void 0&&(0,P.jsx)("p",{className:"sheet-error",children:l}),(0,P.jsxs)("div",{className:"sheet-confirm-actions",children:[(0,P.jsx)("button",{type:"button",className:"mobile-button",disabled:o,onClick:()=>{r(null)},children:"取消"}),(0,P.jsx)("button",{type:"button",className:"sheet-confirm-danger",disabled:o,onClick:()=>{f(i)},children:o?"提交中…":"确认开启"})]})]}):(0,P.jsxs)(ht,{title:"权限",onClose:a,children:[l!==void 0&&(0,P.jsx)("p",{className:"sheet-error",children:l}),t.options.map(g=>{let h=g.value===t.currentValue;return(0,P.jsxs)("button",{type:"button",className:`sheet-option${h?" sheet-option-selected":""}`,disabled:o,onClick:()=>{v(g.value)},children:[(0,P.jsxs)("span",{className:"sheet-option-copy",children:[(0,P.jsx)("span",{className:"sheet-option-title",children:g.name}),g.description!==void 0&&(0,P.jsx)("span",{className:"sheet-option-desc",children:g.description})]}),h&&(0,P.jsx)("span",{className:"sheet-option-check","aria-hidden":!0,children:"√"})]},g.value)})]})}function M2({entries:e,currentTurn:t,onPick:n,onClose:a}){return(0,P.jsx)(ht,{title:`轮次 · 共 ${e.length} 轮`,onClose:a,children:e.length===0?(0,P.jsx)("p",{className:"sheet-note",children:"当前会话没有可跳转的轮次"}):(0,P.jsx)("div",{className:"turn-list",role:"list","aria-label":"轮次清单",children:e.map(i=>{let r=i.turn===t;return(0,P.jsxs)("button",{type:"button",role:"listitem",className:"turn-row"+(r?" turn-row-current":""),onClick:()=>{n(i)},children:[(0,P.jsx)("span",{className:"turn-row-accent","aria-hidden":!0}),(0,P.jsxs)("span",{className:"turn-row-copy",children:[(0,P.jsxs)("span",{className:"turn-row-head",children:[(0,P.jsxs)("span",{className:"turn-row-num",children:["#",i.turn]}),(0,P.jsx)("span",{className:"turn-row-prompt",children:i.prompt})]}),(0,P.jsx)("span",{className:"turn-row-response",children:i.response})]}),!i.loaded&&(0,P.jsx)("span",{className:"turn-row-dot","aria-hidden":!0,title:"未加载"})]},i.turn)})})})}function R2({approval:e,sessionId:t,onResolved:n}){let[a,i]=(0,Ht.useState)(!1),[r,o]=(0,Ht.useState)(void 0),s=l=>{a||(i(!0),o(void 0),JS(e.rpcId,t,e.approvalId,l).then(()=>{n(e.approvalId)},c=>{i(!1),o(c instanceof Error?c.message:String(c))}))};return(0,P.jsxs)("div",{className:"chat-approval-panel",role:"alert",children:[(0,P.jsxs)("div",{className:"chat-approval-header",children:[(0,P.jsx)("span",{className:"chat-tool-pill",children:e.toolName}),e.reason!==void 0&&(0,P.jsx)("span",{className:"chat-approval-reason",children:e.reason})]}),r!==void 0&&(0,P.jsx)("p",{className:"chat-approval-error",children:r}),(0,P.jsxs)("div",{className:"chat-approval-actions",children:[(0,P.jsx)("button",{type:"button",className:"chat-approval-allow",disabled:a,onClick:()=>{s("allowed-once")},children:a?"提交中…":"允许一次"}),(0,P.jsx)("button",{type:"button",className:"chat-approval-reject",disabled:a,onClick:()=>{s("rejected")},children:"拒绝"})]})]})}function k2(e){return e.map(t=>`${t.rpcId}\0${t.id}`).join("|")}function C2({questions:e,sessionId:t,onResolved:n}){let a=GN(e),[i,r]=(0,Ht.useState)(()=>new Map(a.map(x=>[x.id,{selected:[],custom:""}]))),[o,s]=(0,Ht.useState)(()=>k2(a)),[l,c]=(0,Ht.useState)(!1),[f,v]=(0,Ht.useState)(void 0);(0,Ht.useEffect)(()=>{let x=k2(a);x!==o&&(s(x),r(new Map(a.map(C=>[C.id,{selected:[],custom:""}]))))},[a,o]);let g=(x,C,p)=>{r(m=>{let b=new Map(m),y=b.get(x)??{selected:[],custom:""};if(p){let N=new Set(y.selected);N.has(C)?N.delete(C):N.add(C),b.set(x,{...y,selected:[...N]})}else b.set(x,{...y,selected:[C]});return b})},h=(x,C)=>{r(p=>{let m=new Map(p),b=m.get(x)??{selected:[],custom:""};return m.set(x,{...b,custom:C}),m})},w=()=>{if(l||a.length===0)return;let x=a[0].rpcId;c(!0),v(void 0);let C=a.map(p=>{let m=i.get(p.id)??{selected:[],custom:""};return{id:p.id,selected:m.selected,...m.custom.trim()!==""?{custom:m.custom.trim()}:{}}});$S(x,t,{answers:C}).then(()=>{n(x)},p=>{c(!1),v(p instanceof Error?p.message:String(p))})};return(0,P.jsxs)("div",{className:"chat-question-panel",role:"form","aria-label":"问题",children:[a.map(x=>{let C=i.get(x.id)??{selected:[],custom:""};return(0,P.jsxs)("div",{className:"chat-question-group",children:[x.header!==void 0&&(0,P.jsx)("div",{className:"chat-question-header",children:x.header}),(0,P.jsx)("div",{className:"chat-question-text",children:x.question}),x.detail!==void 0&&(0,P.jsx)("div",{className:"chat-question-detail",children:x.detail}),x.options!==void 0&&x.options.length>0&&(0,P.jsx)("div",{className:"chat-question-options",role:"group","aria-label":x.question,children:x.options.map(p=>{let m=C.selected.includes(p.label);return(0,P.jsxs)("label",{className:`chat-question-option${m?" chat-question-option-selected":""}`,children:[(0,P.jsx)("input",{type:x.multiSelect?"checkbox":"radio",name:`q-${x.id}`,checked:m,onChange:()=>{g(x.id,p.label,x.multiSelect===!0)}}),(0,P.jsx)("span",{className:"chat-question-option-label",children:p.label}),p.description!==void 0&&(0,P.jsx)("span",{className:"chat-question-option-desc",children:p.description})]},p.label)})}),(0,P.jsx)("textarea",{className:"chat-question-custom",placeholder:"自定义回答（可选）",rows:2,value:C.custom,onChange:p=>{h(x.id,p.target.value)}})]},x.id)}),f!==void 0&&(0,P.jsx)("p",{className:"chat-approval-error",children:f}),(0,P.jsx)("button",{type:"button",className:"chat-question-submit",disabled:l,onClick:w,children:l?"提交中…":"提交回答"})]})}function A2(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function wv(e){let t=Array.isArray(e)?e:A2(e)&&Array.isArray(e.turns)?e.turns:[],n=[];for(let a of t){if(!A2(a))continue;let i=a.turn,r=a.seq,o=a.prompt,s=a.response;typeof i!="number"||!Number.isFinite(i)||typeof r!="number"||!Number.isFinite(r)||typeof o=="string"&&typeof s=="string"&&n.push({turn:i,seq:r,prompt:o,response:s,loaded:!1})}return n}function O2(e,t){let n=new Map;for(let a of e)n.has(a.turn)||n.set(a.turn,a);for(let a of t)(a.loaded||!n.has(a.turn))&&n.set(a.turn,a);return[...n.values()].sort((a,i)=>a.turn-i.turn)}function _2(e,t){if(e.length===0)return;let n=Math.min(Math.max(t,0),e.length-1);for(let a=n;a<e.length;a++){let i=e[a]?.turn;if(i!==void 0)return i}for(let a=n-1;a>=0;a--){let i=e[a]?.turn;if(i!==void 0)return i}}function z2(e){let t=new Map,n;for(let a of e){if(a.kind==="user"||a.kind==="command"){n={text:a.text,seq:a.startSeq??a.seq};continue}if(a.kind!=="assistant"||a.turn===void 0)continue;let i=a.startSeq??a.seq,r=t.get(a.turn);r===void 0?t.set(a.turn,{seq:i,prompt:n?.text??"",response:a.text}):(i<r.seq&&(r.seq=i),r.prompt===""&&n!==void 0&&(r.prompt=n.text),r.response===""&&(r.response=a.text)),n=void 0}return[...t.entries()].map(([a,i])=>({turn:a,seq:i.seq,prompt:i.prompt,response:i.response,loaded:!0})).sort((a,i)=>a.turn-i.turn)}function Sv(e,t,n,a){if(a<=1)return 0;let i=n-t;if(!(i>0))return 0;let r=(Math.min(Math.max(e,t),n)-t)/i;return Math.min(a-1,Math.max(0,Math.round(r*(a-1))))}function Sp(e,t,n){let a=e.findIndex(i=>i.turn===t);return a>=0?a:e.findIndex(i=>n>=(i.startSeq??i.seq)&&n<=i.seq)}var da=X(re(),1);function D2(e,t){return t<=1?0:e/(t-1)*100}function I2({entries:e,index:t}){let n=e.length,a=Math.min(Math.max(t,0),Math.max(0,n-1)),i=e[a],r=e[n-1]?.turn??0,o=D2(a,n),s=i?.prompt===""?"（这一轮没有提问）":i?.prompt,l=i?.response===""?"（没有回复预览）":i?.response;return(0,da.jsxs)("div",{className:"turn-scrub",role:"status","aria-live":"polite","aria-label":"轮次刮擦",children:[(0,da.jsxs)("div",{className:"turn-scrub-head",children:[(0,da.jsxs)("span",{className:"turn-scrub-num",children:["第 ",i?.turn??0," / ",r," 轮"]}),(0,da.jsx)("span",{className:"turn-scrub-title",children:s})]}),(0,da.jsx)("div",{className:"turn-scrub-sub",children:l}),(0,da.jsxs)("div",{className:"turn-scrub-track",children:[(0,da.jsx)("div",{className:"turn-scrub-rail"}),(0,da.jsx)("div",{className:"turn-scrub-fill",style:{width:`${o}%`}}),n<=40&&e.map((c,f)=>(0,da.jsx)("i",{className:"turn-scrub-tick"+(f===a?" turn-scrub-tick-at":""),style:{left:`${D2(f,n)}%`}},c.turn)),(0,da.jsx)("div",{className:"turn-scrub-knob",style:{left:`${o}%`}})]}),(0,da.jsx)("div",{className:"turn-scrub-hint",children:i?.loaded===!0?"左右拖动选轮次 · 松手跳转":"左右拖动选轮次 · 松手跳转（需先载入历史）"})]})}var R=X(re(),1);function q2(e){return e.turn!==void 0&&e.step!==void 0?`t${e.turn}.${e.step}`:e.id}function q3(e){let t;for(let n of e)n.kind!=="assistant"||n.turn===void 0||(t===void 0||n.turn>t)&&(t=n.turn);return t}function L3(e){let t=e.data;if(typeof t!="object"||t===null||Array.isArray(t))return;let n=t.turn;return typeof n=="number"&&Number.isFinite(n)?n:void 0}var H3=8,Rp=30;function L2(){return Math.max(Rp+40,window.innerWidth-Rp)}var V3=24,H2=500;function kp(e){return e>=1e6?`${(e/1e6).toFixed(1).replace(/\.0$/,"")}M`:e>=1e3?`${Math.round(e/1e3)}k`:String(e)}function V2(e){let t=e.split("-").filter(Boolean);return t.length<=2?e:t.slice(-2).join("-")}function U3(e){if(e==="danger-full-access")return"full";if(e.includes("write"))return"write";if(e.includes("read"))return"read"}var _n=80,P3=15e3,B3=1500,U2=1e4,j3=3,G3=6e3;var Y3=1500,X3=15e3,Np=120,Q3=30,K3=4096,jo=20,Tp=24,P2=22,B2=38,F3=12;function Ki(e){return e.replace(/\\/g,"\\\\").replace(/"/g,'\\"')}var Z3=96,J3=220;function Ep(e){if(e.kind==="user"){let o=Math.max(1,Math.ceil(e.text.length/B2)),s=(e.images?.length??0)*J3;return 28+o*P2+s}let t=20;e.reasoning!==void 0&&e.reasoning!==""&&(t+=32),e.tools!==void 0&&e.tools.length>0&&(t+=28);let n=e.text;if(n==="")return t+24;let a=!e.pending&&n.length>bp,i=a?gv:n.length,r=Math.max(1,Math.ceil(i/B2));return t+=Math.min(r,F3)*P2,a&&(t+=30),t+16}function $3(e){return/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e)?e.split("-").map(t=>t.charAt(0).toUpperCase()+t.slice(1)).join(" "):e}function G2({session:e,mux:t,onBack:n,showToolCalls:a,showSystemMessages:i,initialFocusSeq:r,initialFocusMessageId:o,initialFocusPartId:s,initialFocusQuery:l}){let[c,f]=(0,k.useState)([]),v=Yf(),g=d=>{f(Xa(d))},[h,w]=(0,k.useState)(!1),x=(0,k.useRef)(()=>{}),C=(0,k.useRef)(!1),[p,m]=(0,k.useState)(!0),[b,y]=(0,k.useState)(void 0),[N,D]=(0,k.useState)(()=>RN(e.sessionId)),O=(0,k.useRef)(N);O.current=N;let[T,q]=(0,k.useState)(!1),$=(0,k.useRef)(T);$.current=T;let F=(0,k.useRef)(void 0),Ie=(0,k.useRef)(!1),at=(0,k.useRef)(void 0),Te=(0,k.useRef)(c),[je,Je]=(0,k.useState)({start:0,end:0}),Kt=(0,k.useRef)(je);Kt.current=je;let xe=(0,k.useRef)(void 0),_t=(0,k.useRef)(0),$e=(0,k.useRef)(!1),Ut=(0,k.useRef)(!1),ze=(0,k.useRef)(0),He=(0,k.useRef)(0),Ft=(0,k.useRef)(new Map),[kt,Gn]=(0,k.useState)(0);Te.current=c;let Nt=(0,k.useRef)(!0),ut=(0,k.useRef)([]),bt=(0,k.useRef)(void 0),j=(0,k.useRef)([]),Z=(0,k.useRef)(void 0),ce=(0,k.useCallback)(()=>{Z.current===void 0&&(Z.current=requestAnimationFrame(()=>{Z.current=void 0;let d=j.current;if(j.current=[],d.length===0)return;let S=bt.current,M=d[d.length-1];Bc("state",{seq:M?.seq,frame:"session/event",detail:`batch:${d.length}`}),f(_=>Xa(S===void 0?Hr(d,_):S.fold(d)))}))},[]),Ee=(0,k.useRef)(!1),Ae=(0,k.useRef)(void 0),Me=(0,k.useRef)(0),Yn=(0,k.useRef)(void 0),[vt,fa]=(0,k.useState)(void 0),[Xn,yn]=(0,k.useState)(void 0),[yt,zn]=(0,k.useState)(void 0),[pa,At]=(0,k.useState)(null),[nn,fn]=(0,k.useState)(null),[ma,xn]=(0,k.useState)(null),[wn,Pt]=(0,k.useState)(null),[Ha,Sn]=(0,k.useState)(!1),[Zt,H]=(0,k.useState)(!1),[Y,se]=(0,k.useState)({status:"idle"}),[ke,Tt]=(0,k.useState)(!1),[Et,Bt]=(0,k.useState)([]),Qn=(0,k.useRef)(Et);(0,k.useEffect)(()=>{Qn.current=Et},[Et]),(0,k.useEffect)(()=>{if(N===""){Io(e.sessionId);return}let d=setTimeout(()=>{qb(e.sessionId,N)},Y3);return()=>{clearTimeout(d)}},[N,e.sessionId]),(0,k.useEffect)(()=>()=>{O.current!==""&&qb(e.sessionId,O.current)},[e.sessionId]);let Kn=(0,k.useRef)(null),Va=(0,k.useRef)(null),[Dn,Ji]=(0,k.useState)(void 0),[kn,an]=(0,k.useState)(void 0),[Fr,$i]=(0,k.useState)(!1),[Fn,Zr]=(0,k.useState)(()=>typeof navigator<"u"&&navigator.onLine===!1),[Ja,V]=(0,k.useState)(0),[ne,W]=(0,k.useState)([]),[J,le]=(0,k.useState)(!1),[de,ft]=(0,k.useState)(""),[Ge,xt]=(0,k.useState)("recording"),Ve=(0,k.useRef)(void 0),ga=(0,k.useRef)(!0),zt=(0,k.useRef)(void 0),[Jr,In]=(0,k.useState)(!0),[jt,Wi]=(0,k.useState)(!1),[qp,er]=(0,k.useState)(void 0),[vd,ul]=(0,k.useState)(()=>t?.cachedQueueFor(e.sessionId)??[]),[Lp,tr]=(0,k.useState)(null),fl=(0,k.useRef)(Date.now()),Go=(0,k.useRef)(0),Yo=(0,k.useRef)(Date.now()),[yd,$r]=(0,k.useState)(!1),[Wr,Xo]=(0,k.useState)(!1),[xd,wd]=(0,k.useState)(()=>t?.cachedJobsFor(e.sessionId)??[]),[E,te]=(0,k.useState)(void 0),pn=(0,k.useCallback)(d=>{d!==void 0&&te(S=>S!==void 0&&d.seq<=S.seq?S:d)},[]),pl=(0,k.useCallback)(d=>{let S=pb(d.data);S!==void 0&&pn({seq:d.seq,items:S})},[pn]),qn=(0,k.useCallback)(()=>{te(d=>d===void 0?d:{seq:d.seq,items:d.items.map(S=>S.status==="in_progress"?{...S,status:"completed"}:S)})},[]),[Qo,jE]=(0,k.useState)([]),[GE,qv]=(0,k.useState)(!1),[Sd,Hp]=(0,k.useState)(!1),[Vp,ml]=(0,k.useState)([]),[kd,gl]=(0,k.useState)([]),[Nd,Lv]=(0,k.useState)(e.title),[YE,hl]=(0,k.useState)(!1),[XE,Td]=(0,k.useState)(!1),[Ed,QE]=(0,k.useState)(void 0),Jt=(0,k.useMemo)(()=>O2(wv(Ed),z2(c)),[Ed,c]),bl=Jt[Jt.length-1]?.turn??0,Hv=(0,k.useMemo)(()=>wv(Ed).reduce((d,S)=>Math.max(d,S.turn),0),[Ed]),Up=Hv>0?Hv:bl,[Md,Pp]=(0,k.useState)(0),Vv=Md>0?Md:bl,[Ko,Uv]=(0,k.useState)(()=>Lb(e.sessionId)),Pv=(0,k.useRef)(Md);Pv.current=Md;let Bv=(0,k.useRef)(Jt);Bv.current=Jt;let Bp=(0,k.useRef)(Up);Bp.current=Up;let jp=(0,k.useRef)(e.sessionId);jp.current=e.sessionId;let eo=(0,k.useRef)(void 0),Rd=(0,k.useRef)(void 0),Cd=(0,k.useRef)(void 0),vl=(0,k.useRef)(0),[yl,Ad]=(0,k.useState)(void 0),Fo=(0,k.useRef)(void 0),[KE,Gp]=(0,k.useState)(!1),[FE,Yp]=(0,k.useState)(!1),[Zn,Ni]=(0,k.useState)(void 0),[Xp,Qp]=(0,k.useState)(void 0),[nr]=(0,k.useState)(()=>jf());(0,k.useEffect)(()=>{let d=!1;return Of().then(S=>{d||In(S.mobileEnterToSend!==!1)},()=>{}),()=>{d=!0}},[]);let Ti=(0,k.useCallback)(()=>{nd().then(d=>{V(d.length),W(d)})},[]);(0,k.useEffect)(()=>{let d=()=>{Zr(typeof navigator<"u"&&navigator.onLine===!1),Ti()};return d(),window.addEventListener("online",d),window.addEventListener("offline",d),()=>{window.removeEventListener("online",d),window.removeEventListener("offline",d)}},[Ti]);let ZE=(0,k.useCallback)(d=>{td(d).then(()=>{Ti()})},[Ti]),Kp=(0,k.useCallback)(()=>{_T(d=>Oo(d.sessionId,Mp(d.text))).then(({sent:d,failed:S})=>{d>0&&Q(S>0?`已同步 ${d} 条，${S} 条待重试`:`已同步 ${d} 条消息`),Ti(),d>0&&t?.poke()})},[t,Ti]),JE=(0,k.useCallback)(async(d,S)=>{try{await qf(e.sessionId,d,{kind:"edit",content:[{type:"text",text:S}]})}catch{Q("消息已开始发送，无法编辑")}},[e.sessionId]),$E=(0,k.useCallback)(async d=>{try{await qf(e.sessionId,d,{kind:"remove"})}catch{Q("消息已开始发送，无法删除")}},[e.sessionId]),WE=(0,k.useCallback)(async d=>{try{await qf(e.sessionId,d,{kind:"steer"})}catch(S){let M=S instanceof Ao?S.error.code:void 0;if(M==="steer-unavailable"){Q("当前轮次已结束，无法插话"),Wi(!1),er(void 0),tr(null);return}Q(M==="queue-item-not-found"?"消息已开始发送，无法插话":"插话失败")}},[e.sessionId]);(0,k.useEffect)(()=>{Fn||nd().then(d=>{d.length!==0&&Kp()})},[Fn,Kp]),(0,k.useEffect)(()=>{if(!ke||Dn!==void 0)return;let d=!1;return GS(e.sessionId).then(S=>{d||Ji(S)},()=>{d||Ji([])}),()=>{d=!0}},[ke,Dn,e.sessionId]);let Fp=(0,k.useCallback)((d,S,M)=>{let _=d.to+1,B=()=>{ud(e.sessionId,_,S).then(G=>{if(M())return;let K=bt.current,ue=Xa(G.rows).filter(ve=>(ve.startSeq??ve.seq)>=d.from);ue.length>0&&(K===void 0?f(ve=>Xa([...ue,...ve])):(K.prepend(ue),f(Xa(K.snapshot()))));let Oe=ue.length>0?ue[0]?.startSeq??ue[0]?.seq:void 0;Oe===void 0||Oe<=d.from||!G.hasMore||Oe>=_||(_=Oe,B())},G=>{M()||console.warn("history gap refill failed",G)})};B()},[e.sessionId]);(0,k.useEffect)(()=>{let d=!1,S=new AbortController,M=setTimeout(()=>{S.abort(new DOMException("history load timed out","TimeoutError"))},3e4);Nt.current=!0,ut.current=[],Ee.current=!1,Ae.current=void 0,C.current=!1,bt.current=void 0,j.current=[],Z.current!==void 0&&(cancelAnimationFrame(Z.current),Z.current=void 0),Lv(e.title),wl.current=!1,$p.current=void 0,m(!0),y(void 0),f([]),ml([]),gl([]),yn(void 0),te(void 0),Wi(e.running===!0),er(void 0),tr(null);let _=!1,B=!1;return _N(e.sessionId).then(G=>{if(d||_||G===void 0)return;B=!0;let K=new Yi(G.rows,G.maxSeq);bt.current=K,g(K.fold([])),w(G.hasMore),m(!1)}),ud(e.sessionId,void 0,S.signal).then(G=>{if(d)return;_=!0;let K=ut.current;ut.current=[],Nt.current=!1;let me=new Yi(G.rows,G.maxSeq);bt.current=me,g(me.fold(K)),w(G.hasMore),G.todo!==void 0&&pn(G.todo),G.hasMore&&!C.current&&!B&&(C.current=!0,x.current(!0)),m(!1),G.turnStartAt!==void 0&&(tr(Oe=>Oe??G.turnStartAt??null),Wi(!0),er(void 0));let ue=G.projections?.values;if(fa(xv(ue?.permissions)),yn(j2(ue?.contextPressure)),QE(ue?.turnOutline),Ae.current!==void 0){let Oe=Ae.current;Ae.current=void 0,Ee.current=!1,Fp(Oe,S.signal,()=>d)}},G=>{if(d)return;let K=ut.current;if(ut.current=[],Nt.current=!1,K.length>0){let me=bt.current;f(Xa(me===void 0?Hr(K):me.fold(K)))}y(he(G)),m(!1)}),Dc(e.sessionId).then(G=>{d||(zn(G.current),se(K=>K.status==="idle"?{status:"ready",data:G}:K))},G=>{d||se(K=>K.status==="idle"?{status:"error",message:he(G)}:K)}),()=>{d=!0,clearTimeout(M),S.abort()}},[e.sessionId]),(0,k.useEffect)(()=>{if(t!==void 0)return t.onFrame((d,S)=>{let M=d.event;if(typeof M?.time=="number"&&Number.isFinite(M.time)&&M.type!=="turn/start"&&(Go.current=M.time-Date.now()),Yo.current=Date.now(),$r(!1),Xo(!1),d.type==="session/event"){if(d.sessionId!==e.sessionId)return;let _=d.view===void 0?d.event:{...d.event,view:d.view};if(typeof _.type=="string"&&(_.type==="turn/start"&&(Wi(!0),$r(!1),er(L3(_)),tr(typeof _.time=="number"&&Number.isFinite(_.time)?_.time:Date.now()),Zp.current(),te(void 0),(0,k.startTransition)(()=>{ul([])})),_.type==="turn/end"&&(Wi(!1),er(void 0),tr(null),qn()),_.type==="todo/write"&&(0,k.startTransition)(()=>{pl(_)})),Nt.current){if(ut.current.length>=H2){let B=ut.current.shift();if(B!==void 0){let G=Ae.current;Ae.current=G===void 0?{from:B.seq,to:B.seq}:{from:Math.min(G.from,B.seq),to:Math.max(G.to,B.seq)}}Ee.current||(console.warn(`history tail is slow: live buffer reached ${H2} events; the dropped seq window will be re-fetched`),Ee.current=!0)}ut.current.push(_);return}j.current.push(_),ce();return}if(d.type==="session/projection"&&d.sessionId===e.sessionId){d.key==="permissions"&&fa(xv(d.value)),d.key==="contextPressure"&&yn(j2(d.value));return}if(d.type==="session/jobs"&&d.sessionId===e.sessionId){(0,k.startTransition)(()=>{wd(d.jobs)});return}if(d.type==="session/subscribed"&&d.sessionId===e.sessionId){(0,k.startTransition)(()=>{ul([]),wd([])});return}if(d.type==="session/queue"&&d.sessionId===e.sessionId){(0,k.startTransition)(()=>{ul((d.items??[]).map(_=>If({id:String(_.id),placement:_.placement,message:_.message})))});return}if(!(!("sessionId"in d)||d.sessionId!==e.sessionId)){if(d.type==="approval/requested"){(0,k.startTransition)(()=>{ml(_=>Kb(e.sessionId).has(d.approvalId)||_.some(B=>B.approvalId===d.approvalId)?_:[..._,{rpcId:S??"",approvalId:d.approvalId,toolName:d.toolName,callId:d.callId,reason:d.reason}])});return}if(d.type==="approval/resolved"){(0,k.startTransition)(()=>{ml(_=>_.filter(B=>B.approvalId!==d.approvalId))});return}if(d.type==="question/requested"){let B=d.questions.map(G=>({rpcId:S??"",...G})).filter(G=>!Qb(e.sessionId).has(G.rpcId));(0,k.startTransition)(()=>{gl(B)});return}if(d.type==="question/resolved"){(0,k.startTransition)(()=>{gl([])});return}}})},[t,e.sessionId]),(0,k.useEffect)(()=>{if(!jt||!v)return;let d=!1,S,M=()=>{if(d)return;ZS(e.sessionId).then(B=>{d||(0,k.startTransition)(()=>{ml(G=>KN(G,B.approvals,Kb(e.sessionId))),gl(G=>YN(G,B.questions,Qb(e.sessionId)))})},()=>{});let _=t?.isSseLive()??!0;S=setTimeout(M,_?P3*4:B3)};return M(),()=>{d=!0,S!==void 0&&clearTimeout(S)}},[jt,e.sessionId,t,v]),(0,k.useEffect)(()=>{if(!jt||!v)return;let d=!1,S=0,M=setInterval(()=>{t?.isSseLive()===!0&&Date.now()-Yo.current<U2||Lr().then(_=>{if(d)return;S=0,Xo(!1);let B=_.items.find(G=>G.sessionId===e.sessionId);B!==void 0&&B.running!==!1||Gi(e.sessionId,void 0,1).then(G=>{if(!d)for(let K=G.events.length-1;K>=0;K--){let me=G.events[K]?.event?.type;if(me==="turn/end"){Wi(!1),er(void 0),qn();return}if(me==="turn/start"){let ue=G.events[K]?.event?.time;typeof ue=="number"&&Number.isFinite(ue)&&tr(Oe=>Oe??ue);return}}},()=>{})},()=>{d||(S+=1,S>=j3&&Xo(!0))})},U2);return()=>{d=!0,clearInterval(M)}},[jt,e.sessionId,qn,v]);let Od=(0,k.useCallback)(()=>{mT(e.sessionId).then(d=>{(0,k.startTransition)(()=>{jE(d)})},()=>{})},[e.sessionId]),Zp=(0,k.useRef)(Od);Zp.current=Od,(0,k.useEffect)(()=>{Od()},[Od]),(0,k.useEffect)(()=>{if(!jt||!v)return;let d=setInterval(()=>{Zp.current()},sp);return()=>{clearInterval(d)}},[jt,v]);let[,jv]=(0,k.useState)(0),xl=Lp??(jt?fl.current:null),Gv=jt?qp??q3(c):void 0;(0,k.useEffect)(()=>{if(xl===null){$r(!1),jv(0);return}if(!v)return;let d=xl,S=()=>{let _=Date.now()-Yo.current>G3;$r(B=>B===_?B:_),jv(Math.max(0,Date.now()+Go.current-d))};S();let M=setInterval(S,1e3);return()=>clearInterval(M)},[xl,v]);let[Jp,eM]=(0,k.useState)(0);(0,k.useEffect)(()=>{if(c.length<Np){at.current=void 0;return}let d=[0],S=0;for(let M of c)S+=M.pending===!0?Z3:Ft.current.get(M.id)??Ep(M),d.push(S);at.current=d},[c,kt,Jp]);let Yv=(0,k.useCallback)(()=>{let d=at.current;if(d===void 0||Jn.current)return;let S=F.current,M=Te.current.length;if(Kt.current.end===M&&ze.current<=_n)return;let _=(S?.scrollTop??_t.current)-He.current,B=0,G=M-1;for(;B<G;){let ve=B+G+1>>1;d[ve]!==void 0&&d[ve]<=_?B=ve:G=ve-1}let K=Math.max(0,B-jo),me=Te.current[M-1],Oe=me!==void 0&&me.pending===!0?M:Math.min(M,B+Tp+jo);Je(ve=>ve.start===K&&ve.end===Oe?ve:{start:K,end:Oe})},[]),ar=(0,k.useCallback)(()=>{xe.current===void 0&&(xe.current=requestAnimationFrame(()=>{xe.current=void 0,Yv()}))},[Yv]),_d=(0,k.useCallback)(()=>{let d=Te.current[Te.current.length-1];d!==void 0&&(Sl.current=Math.max(Sl.current,d.turn??0)),Kv(0)},[]),tM=d=>{let S=Te.current,M=S.length;if(M===0)return;let _=at.current,B;if(_!==void 0){let G=d-He.current,K=0,me=M-1;for(;K<me;){let ue=K+me+1>>1;_[ue]!==void 0&&_[ue]<=G?K=ue:me=ue-1}B=K}else{let G=0;B=M-1;for(let K=0;K<M;K++)if(G+=Ep(S[K]),G>d){B=K;break}}return _2(S,B)},nM=(0,k.useCallback)(()=>{let d=F.current;if(d===void 0)return;_t.current=d.scrollTop;let S=d.scrollHeight-d.scrollTop-d.clientHeight;ze.current=S;let M=$e.current;M?$e.current=!1:Zo.current=!1,Qv(S>_n);let _=S>_n;if(!M){let B=tM(d.scrollTop)??0;Pp(B),eo.current!==void 0&&window.clearTimeout(eo.current),eo.current=window.setTimeout(()=>{if(eo.current=void 0,!_)return;let G=Bp.current;B>0&&B!==G&&Hb(jp.current,B)},1e3)}S<=_n&&_d(),ar()},[_d,ar]);(0,k.useEffect)(()=>()=>{xe.current!==void 0&&cancelAnimationFrame(xe.current),Z.current!==void 0&&cancelAnimationFrame(Z.current)},[]),(0,k.useEffect)(()=>(Uv(Lb(e.sessionId)),()=>{eo.current!==void 0&&(window.clearTimeout(eo.current),eo.current=void 0);let d=Pv.current,S=Bp.current;ze.current<=_n||d>0&&d!==S&&Hb(e.sessionId,d)}),[e.sessionId]);let ir=(0,k.useCallback)((d,S)=>{d.scrollTop!==S&&($e.current=!0),d.scrollTop=S,_t.current=d.scrollTop},[]),ha=(0,k.useCallback)(()=>{let d=F.current;if(d===void 0)return;ir(d,d.scrollHeight);let S=Te.current.length;if(S>0){let M=Math.max(0,S-Tp-jo);Je(_=>_.start===M&&_.end===S?_:{start:M,end:S})}ar()},[ar,ir]),zd=(0,k.useCallback)(()=>{let d=F.current;if(d===void 0)return;let S=at.current,M=Te.current.length,_=S!==void 0&&M>0?(S[M]??d.scrollHeight)+He.current:d.scrollHeight;ir(d,_),ar()},[ar,ir]),$p=(0,k.useRef)(void 0),wl=(0,k.useRef)(!1),[Xv,Qv]=(0,k.useState)(!1),[Dd,Kv]=(0,k.useState)(0),Sl=(0,k.useRef)(0),aM=(0,k.useCallback)(()=>{ze.current=0,Qv(!1),_d(),ha()},[_d,ha]),Id=(0,k.useCallback)((d,S)=>{let M=Te.current,_=Sp(M,S??-1,d);if(_<0)return;let B=M[_];if(nm(B.id),Hd.current=d,no.current=!1,Jn.current=!0,Zo.current=!0,ze.current=Number.MAX_SAFE_INTEGER,M.length>=Np){let me=Math.max(0,_-jo),ue=Math.min(M.length,_+Tp+jo);Je(Oe=>Oe.start===me&&Oe.end===ue?Oe:{start:me,end:ue})}let K=B.turn;K!==void 0&&Pp(K)},[]),kl=(0,k.useCallback)(d=>{if(Td(!1),Sp(Te.current,d.turn,d.seq)>=0){Id(d.seq,d.turn);return}if(!h){Q("没有更早的轮次");return}let M=Jt.findIndex(B=>B.turn===d.turn),_=M>=0?Jt[M+1]?.seq:void 0;Pp(0),Q("正在载入…"),Rd.current=d.seq,Cd.current=d.turn,vl.current=0,x.current(!0,_??d.seq+1)},[h,Id,Jt]),iM=(0,k.useCallback)(()=>{let d=Ko;if(d===void 0)return;Uv(void 0),Vb(jp.current);let S=Bv.current.find(M=>M.turn===d);S!==void 0&&kl(S)},[Ko,kl]),rM=(0,k.useCallback)(d=>{Jt.length<2||(Fo.current={pointerId:d.pointerId,startX:d.clientX,moved:!1},Ad(Sv(d.clientX,Rp,L2(),Jt.length)),d.currentTarget.setPointerCapture(d.pointerId))},[Jt.length]),oM=(0,k.useCallback)(d=>{let S=Fo.current;S===void 0||S.pointerId!==d.pointerId||(Math.abs(d.clientX-S.startX)>H3&&(S.moved=!0),Ad(Sv(d.clientX,Rp,L2(),Jt.length)))},[Jt.length]),sM=(0,k.useCallback)(d=>{let S=Fo.current;if(S===void 0||S.pointerId!==d.pointerId)return;Fo.current=void 0;let M=yl;if(Ad(void 0),d.currentTarget.hasPointerCapture(d.pointerId)&&d.currentTarget.releasePointerCapture(d.pointerId),!S.moved){Td(!0);return}let B=M===void 0?void 0:Jt[M];B!==void 0&&kl(B)},[kl,yl,Jt]),Fv=(0,k.useCallback)(d=>{let S=Fo.current;S===void 0||S.pointerId!==d.pointerId||(Fo.current=void 0,Ad(void 0))},[]);(0,k.useEffect)(()=>{let d=Rd.current;if(d===void 0)return;let S=Cd.current;if(Sp(Te.current,S??-1,d)>=0){Rd.current=void 0,Cd.current=void 0,vl.current=0,Id(d,S);return}if(!h||vl.current>=V3){Rd.current=void 0,Cd.current=void 0,vl.current=0,Q("没能跳到那一轮：历史太深了");return}vl.current+=1,x.current(!0)},[c,h,Id]),(0,k.useLayoutEffect)(()=>{let d=c[c.length-1];if(d===void 0)return;let S=d.seq+":"+(d.pending===!0?"p":"f");if(!(S===$p.current||($p.current=S,Bc("commit",{seq:d.seq,frame:"session/event",detail:d.kind}),F.current===void 0))){if(!wl.current){wl.current=!0,Sl.current=d.turn??0,ha();return}(d.turn??0)>Sl.current&&(Sl.current=d.turn??0,ze.current>_n&&Kv(_=>_+1)),nr&&(ze.current>_n||Zo.current||ha())}},[c,ha,nr]),(0,k.useLayoutEffect)(()=>{Ut.current&&(Ut.current=!1,!(ze.current>_n)&&ha())},[c,ha]),(0,k.useEffect)(()=>{kd.length===0&&Vp.length===0||!nr||F.current===void 0||ze.current>_n||ha()},[kd.length,Vp.length,ha,nr]),(0,k.useEffect)(()=>{let d=window.visualViewport;if(d==null)return;let S=d,M=()=>{nr&&(ze.current>_n||ha())};return S.addEventListener("resize",M),()=>{S.removeEventListener("resize",M)}},[nr,ha]),(0,k.useEffect)(()=>{if(Zn===void 0)return;let d=window.setTimeout(()=>{Ni(void 0)},3e3);return()=>{clearTimeout(d)}},[Zn]);let lM=(0,k.useCallback)(d=>{an(d.slice(0,200))},[]),cM=(0,k.useCallback)((d,S)=>{Qp(void 0),Oo(e.sessionId,Mp(`用户修改了之前的提问，请忽略旧提问的回复，按修改后的内容重新回答：

${S}`)).then(()=>{t?.poke()},()=>{Q("重新发送失败，请重试")})},[e.sessionId,t]),dM=(0,k.useCallback)(d=>{let S=Te.current,M=S.findIndex(G=>G.id===d.id),_="";for(let G=M-1;G>=0;G--){let K=S[G];if(K!==void 0&&K.kind==="user"){_=K.text;break}}let B=_!==""?`请忽略上一条回答，针对原始问题重新作答：

${_}`:"请忽略上一条回答，重新作答刚才的问题。";Oo(e.sessionId,Mp(B)).then(()=>{t?.poke()},()=>{Q("重新生成失败，请重试")})},[e.sessionId,t]),Zv=(0,k.useCallback)(()=>{Yn.current?.abort();let d=new AbortController;Yn.current=d;let S=Me.current+1;Me.current=S,Nt.current=!0,ud(e.sessionId,void 0,d.signal).then(M=>{if(S!==Me.current)return;let _=ut.current;ut.current=[],Nt.current=!1;let B=new Yi(M.rows,M.maxSeq);bt.current=B,g(B.fold(_)),w(M.hasMore);let G=Ae.current;G!==void 0&&(Ae.current=void 0,Ee.current=!1,Fp(G,d.signal,()=>S!==Me.current))},()=>{if(S!==Me.current)return;Nt.current=!1;let M=ut.current;if(ut.current=[],M.length>0){let _=bt.current;f(Xa(_===void 0?Hr(M):_.fold(M)))}})},[e.sessionId,Fp]),Wp=(0,k.useCallback)(d=>(Q(`正在执行 ${d.trim().split(/\s+/)[0]}…`),zc(e.sessionId,d).then(S=>{if(t?.poke(),S.matched){Zv(),S.text!==void 0&&S.text!==""&&Q(S.text);return}return Oo(e.sessionId,Mp(d)).then(()=>{t?.poke()})},S=>{y(he(S))})),[e.sessionId,t,Zv]),uM=(0,k.useCallback)(async d=>{Gp(!1);try{await QS(e.sessionId,d),Lv(d),Q("已重命名")}catch(S){Q(he(S))}},[e.sessionId]),fM=(0,k.useCallback)(()=>{Yp(!1),f([]),up(e.sessionId).then(()=>{Ti()}),Ic(e.sessionId).catch(d=>{Q(`删除未生效：${he(d)}`)}),n()},[e.sessionId,n,Ti]),pM=(0,k.useCallback)(()=>{e.blank&&Te.current.length===0&&!$.current&&(gN(e.sessionId),Gi(e.sessionId,void 0,1).then(d=>{d.events.some(M=>M.event.type==="user/message"||M.event.type==="assistant/message")||Ic(e.sessionId).catch(()=>{})},()=>{})),n()},[e,n]),Jv=(d,S,M)=>{if(window.getSelection()?.toString()!=="")return!1;let _=d instanceof Element?d:null;if(_!==null&&_.closest("img")!==null)return!1;let B=_?.closest(".chat-msg")??null;if(B===null)return!1;let G=B.getAttribute("data-mid"),K=G===null?void 0:Te.current.find(ve=>ve.id===G);if(K===void 0)return!0;let me=K.flow!==void 0&&K.flow.length>0?K.flow.filter(ve=>ve.kind==="text").map(ve=>ve.text).join(`
`).trim():"",ue=K.text!==void 0&&K.text!==""?K.text:K.reasoning??"",Oe=me!==""?me:void 0;return(ue.trim()!==""||Oe!==void 0)&&mM(S,M,ue,Oe,K.kind,K.id),!0},Nl=(0,k.useRef)(void 0),to=(0,k.useCallback)(()=>{Nl.current!==void 0&&(clearTimeout(Nl.current.timer),Nl.current=void 0)},[]);(0,k.useEffect)(()=>()=>{to()},[to]);let mM=(0,k.useCallback)((d,S,M,_,B,G)=>{Ni({x:Math.max(8,Math.min(d,window.innerWidth-164)),y:Math.max(8,Math.min(S,window.innerHeight-140)),text:M,raw:_,...B!==void 0?{kind:B}:{},...G!==void 0?{messageId:G}:{}})},[]),gM=(0,k.useCallback)(d=>{let S=d.target instanceof Element?d.target:null;if(S!==null){let B=S.closest("img");if(B!==null&&!(S instanceof HTMLAnchorElement)){let G=B.getAttribute("src");if(G!==null&&G!==""&&!G.startsWith("data:image/svg")){d.preventDefault(),xn(G);return}}}let M=S?.closest(".file-link")??null;if(M===null)return;let _=M.getAttribute("data-path");if(!(_===null||_==="")){if(d.preventDefault(),typeof window.dshOpenFile=="function"){ST(_);return}fn(_)}},[]),$v=d=>{let S=d[0],M=d[1];return S===void 0||M===void 0?0:Math.hypot(S.clientX-M.clientX,S.clientY-M.clientY)},hM=(0,k.useCallback)(d=>{let S=zt.current;if(S===void 0)return;let M=Math.min(3,Math.max(1,d)),_=S.block.querySelector("pre");_!==null&&(_.style.transformOrigin="0 0",_.style.transform=M<=1.02?"":`scale(${M})`)},[]),Wv=(0,k.useCallback)((d=!1,S)=>{if(Ie.current)return;Ie.current=!0,d||m(!0);let M=bt.current?.snapshot()[0]??c[0];if(M===void 0){Ie.current=!1,d||m(!1);return}let _=new AbortController,B=setTimeout(()=>{_.abort(new DOMException("load older timed out","TimeoutError"))},X3),G=S??M.startSeq??M.seq,K=d?void 0:F.current?.scrollTop??_t.current;ud(e.sessionId,G,_.signal).then(me=>{clearTimeout(B),Ie.current=!1,d||m(!1);let ue=Xa(me.rows),Oe=bt.current;Oe===void 0?f(Ei=>Xa([...ue,...Ei])):(Oe.prepend(ue),f(Xa(Oe.snapshot()))),w(me.hasMore),He.current=0;let ve=F.current;if(ve!==void 0&&ue.length>0)if(d&&ze.current<=_n)Ut.current=!0;else{let Ei=ue.reduce((Mi,ao)=>Mi+Ep(ao),0),Tl=(K??ve.scrollTop)+Ei;requestAnimationFrame(()=>{ir(ve,Tl)})}},me=>{clearTimeout(B),Ie.current=!1,m(!1),d||y(he(me))})},[e.sessionId,c,ha,ir]);x.current=Wv;let qd=(0,k.useRef)(r),ey=(0,k.useRef)(o),Ld=(0,k.useRef)(s),em=(0,k.useRef)(0),tm=(0,k.useRef)(!1),[$a,nm]=(0,k.useState)(void 0),Hd=(0,k.useRef)(void 0),no=(0,k.useRef)(!1),Zo=(0,k.useRef)(!1),Jn=(0,k.useRef)(!1);(0,k.useEffect)(()=>{qd.current=r,ey.current=o,Ld.current=s,em.current=0,tm.current=!1,Hd.current=void 0,no.current=!1,Zo.current=!1,$e.current=!1,Jn.current=r!==void 0||o!==void 0||s!==void 0,nm(void 0)},[r,o,s,l]),(0,k.useEffect)(()=>{let d=qd.current,S=ey.current;if(d===void 0&&S===void 0||p)return;let M=c,_=l?.trim().toLowerCase()??"",B=Nn=>{if(_==="")return!0;let Wa=Nn.text.toLowerCase();if(Wa.includes(_))return!0;let Tn=_.match(/[\p{L}\p{N}_]+/gu)??[];return Tn.length>0&&Tn.every(Ml=>Wa.includes(Ml))},G=S===void 0?-1:M.findIndex(Nn=>Nn.id===S),K=Nn=>S!==void 0&&Nn.id!==S?!1:Ld.current===void 0?!0:Nn.flow?.some(Wa=>Wa.kind==="text"&&Wa.partId===Ld.current)===!0,me=G>=0&&K(M[G])?G:-1,ue=M[0]?.startSeq??M[0]?.seq,Oe=d===void 0||ue===void 0||d>=ue,ve=d===void 0||!Oe?-1:M.findIndex(Nn=>d<=Nn.seq&&B(Nn)),Tl=(S!==void 0||d!==void 0)&&h?-1:M.findIndex(B),Mi=me>=0?me:ve>=0?ve:Tl;if(console.debug(`[locate] initial: msgId=${S??"-"} seq=${d??"-"} partId=${Ld.current??"-"} query=${l??"-"}; rows=${M.length}; resolved index=${Mi} (stable=${me} seqRow=${ve})`),Mi<0){h&&em.current<K3?Ie.current||(em.current+=1,!tm.current&&d!==void 0?(tm.current=!0,x.current(!0,d+1)):x.current(!0)):(qd.current=void 0,Jn.current=!1,Zo.current=!1);return}qd.current=void 0;let ao=M[Mi];if(nm(ao.id),S!==void 0&&me<0&&Q(`定位回退: 目标 ${S} 未命中，定位到 ${ao.id}（消息可能在更新中）`),Jn.current=!0,Zo.current=!0,ze.current=Number.MAX_SAFE_INTEGER,Hd.current=me>=0||ve>=0?d:ao.startSeq??ao.seq,no.current=!1,M.length>=Np){let Nn=Math.max(0,Mi-jo),Wa=Math.min(M.length,Mi+Tp+jo);Je(Tn=>Tn.start===Nn&&Tn.end===Wa?Tn:{start:Nn,end:Wa})}},[c,h,p,r,o,s,l]),(0,k.useLayoutEffect)(()=>{if($a===void 0||no.current)return;let d=Hd.current;if(d===void 0&&o===void 0&&s===void 0)return;let S=F.current;if(S===void 0)return;let M=()=>{ze.current=Number.MAX_SAFE_INTEGER;let ue=0,Oe=()=>{let ve=F.current;if(ve===void 0){console.debug("[locate] scroll container missing"),Jn.current=!1;return}let Ei=ve.querySelector(`[data-message-id="${Ki($a)}"]`),Tl=Ei?.querySelector(".chat-search-mark"),Mi=s===void 0?null:Ei?.querySelector(`[data-part-id="${Ki(s)}"]`)??null,El=(d===void 0?null:ve.querySelector(`[data-step-seq="${Ki(String(d))}"]`))??Tl??Mi??Ei??(d===void 0?null:ve.querySelector(`[data-row-seq="${Ki(String(d))}"]`));if(El===null){if(ue>=10){console.debug(`[locate] anchor never surfaced (focusMsgId=${$a} seq=${d??"-"})`),Jn.current=!1;return}ue+=1,requestAnimationFrame(Oe);return}ve.scrollHeight;let Nn=El.getBoundingClientRect().top-ve.getBoundingClientRect().top+ve.scrollTop-8,Wa=ve.scrollTop;ir(ve,Math.max(0,Nn));try{El.scrollIntoView()}catch{}requestAnimationFrame(()=>{let Tn=F.current;if(Tn===void 0){Jn.current=!1;return}let Ml=El.getBoundingClientRect().top,Pd=Tn.getBoundingClientRect().top,Bd=Tn.clientHeight;if(Bd<=0){no.current=!0,Jn.current=!1;return}if(!(Ml>=Pd-1&&Ml<=Pd+Bd+1)){console.debug(`[locate] verify: off-viewport anchorTop=${Math.round(Ml)} viewport=[${Math.round(Pd)},${Math.round(Pd+Bd)}] scrollTop ${Wa}->${Tn.scrollTop} clientH=${Bd} scrollH=${Math.round(Tn.scrollHeight)} tries=${ue}`),ue<12?(ue+=1,requestAnimationFrame(Oe)):(Q(`定位未成功(共${c.length}条, 窗口${rr?"开":"关"}, 目标滚动≈${Math.round(Nn)}, 当前${Math.round(Tn.scrollTop)}/${Math.round(Tn.scrollHeight)})`),no.current=!0,Jn.current=!1);return}console.debug(`[locate] OK focusMsgId=${$a} seq=${d??"-"} scrollTop ->${Math.round(Tn.scrollTop)} after ${ue} try/tries`),no.current=!0,Jn.current=!1})};Oe()};if((()=>{let ue=S.querySelector(`[data-message-id="${Ki($a)}"]`),Oe=ue?.querySelector(".chat-search-mark"),ve=s===void 0?null:ue?.querySelector(`[data-part-id="${Ki(s)}"]`)??null;return(d===void 0?null:S.querySelector(`[data-step-seq="${Ki(String(d))}"]`))??Oe??ve??ue??(d===void 0?null:S.querySelector(`[data-row-seq="${Ki(String(d))}"]`))})()!==null){M();return}let G=0,K,me=()=>{if(G+=1,G>120){S.querySelector(`[data-mid="${$a}"]`)!==null&&M(),Jn.current=!1;return}let ue=F.current;if(ue===void 0)return;if(ue.querySelector(`[data-message-id="${Ki($a)}"]`)===null){K=setTimeout(me,50);return}M()};return K=setTimeout(me,50),()=>clearTimeout(K)},[$a,je,o,s,ir]);let am=(0,k.useCallback)(d=>{UN(d).then(({image:S,failed:M})=>{if(M){Q("该图片无法解码，已忽略");return}if(Qn.current.length>=Wf){Q(`最多附加 ${Wf} 张图片`);return}Bt(_=>[..._,S])})},[]),ty=(0,k.useCallback)(()=>{let d=N.trim();if(d===""&&Et.length===0||T)return;if(typeof navigator<"u"&&navigator.onLine===!1){if(d===""){Q("离线状态暂不支持发送图片");return}if(d.startsWith("/")){Q("离线状态暂不支持执行命令");return}Et.length>0&&Q("图片需联网发送，本次仅保存文本");let M=kn!==void 0?`引用消息：
> ${kn.replace(/\n+/g," ")}

${d}`:d;OT({id:`outbox-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,sessionId:e.sessionId,text:M,queuedAt:Date.now()}).then(()=>{D(""),Io(e.sessionId),an(void 0),Bt([]),Q("已离线保存，恢复网络后自动发送"),Ti()});return}if(d.startsWith("/")&&kn===void 0&&Et.length===0){q(!0),Wp(d).then(()=>{q(!1),D(""),Io(e.sessionId)},()=>{q(!1)});return}q(!0);let S=kn!==void 0&&d!==""?Xb(`引用消息：
> ${kn.replace(/\n+/g," ")}

${d}`,Et):Xb(N,Et);Oo(e.sessionId,S).then(()=>{q(!1),D(""),Io(e.sessionId),Bt([]),an(void 0),t?.poke()},M=>{q(!1);let _=he(M),B=Fa(_);y(B!==void 0?`${_} ${B}`:_),Q(B!==void 0?"发送失败，请重启 dsh web 后再试":`发送失败：${_}`)})},[N,Et,T,e.sessionId,t,kn,Wp]),Vd=(0,k.useRef)("");(0,k.useEffect)(()=>()=>{ga.current=!1,Ve.current?.cancel(),Ve.current=void 0},[]);let bM=(0,k.useCallback)(()=>{Ve.current?.cancel(),Ve.current=void 0,Vd.current="",ft(""),le(!1),xt("recording")},[]),im=(0,k.useCallback)(()=>{let d=Ve.current;if(d===void 0){le(!1);return}Ve.current=void 0,xt("transcribing"),d.stop().then(S=>{Vd.current="转写中...",ft("转写中..."),YS(S,sd()).then(M=>{Vd.current="",ft(""),le(!1),xt("recording"),M.trim()!==""&&D(_=>_.trim()===""?M.trim():`${_.replace(/\s+$/,"")} ${M.trim()}`)},M=>{le(!1),xt("recording"),Q(M instanceof Error?M.message:String(M))})},S=>{le(!1),xt("recording"),Q(S instanceof Error?S.message:String(S))})},[]),vM=(0,k.useCallback)(()=>{Vd.current="",xt("recording"),JT({onTimeout:()=>{im()}}).then(d=>{if(!ga.current){d.cancel();return}Ve.current=d,le(!0)},d=>{ga.current&&Q(d instanceof Error?d.message:String(d))})},[im]),yM=(0,k.useCallback)(()=>{Sd||(Hp(!0),KS(e.sessionId).then(()=>{Hp(!1)},d=>{Hp(!1),y(he(d))}))},[Sd,e.sessionId]),f_=yt?.model??"模型",Ud=vt===void 0?void 0:vt.options.find(d=>d.value===vt.currentValue)?.name??$3(vt.currentValue),ba=(0,k.useMemo)(()=>{let d=Xn?.contextWindow,S=Xn?.pressureTokens;return d===void 0||d<=0||S===void 0||S<0?void 0:{pct:Math.min(100,Math.max(0,Math.round(S/d*100))),window:d,pressure:S}},[Xn]),ny=(0,k.useCallback)(()=>{se(d=>d.status==="ready"?d:{status:"loading"}),Dc(e.sessionId).then(d=>{se({status:"ready",data:d})},d=>{se({status:"error",message:he(d)})})},[e.sessionId]),xM=()=>{At(null),Sn(!1),Pt("model"),Y.status==="idle"&&ny()},wM=()=>{At(null),Sn(!1),Pt("permission")},SM=()=>{ba!==void 0&&(At(null),Pt(null),Sn(d=>!d))},ay=(0,k.useCallback)(d=>{Zt||(H(!0),Lf(e.sessionId,d).then(S=>{H(!1),zn(S.selected),Pt(null)},S=>{H(!1),y(he(S))}))},[Zt,e.sessionId]),kM=(0,k.useCallback)(d=>{if(d===vt?.currentValue){Pt(null);return}if(d==="danger-full-access"){Pt(null),At("permission");return}Zt||(H(!0),zc(e.sessionId,`/permission ${d}`).then(S=>{if(H(!1),!S.matched){y("权限命令未在宿主注册，无法切换");return}fa(M=>M===void 0?M:{...M,currentValue:d}),Pt(null)},S=>{H(!1),y(he(S))}))},[Zt,vt,e.sessionId]),iy=(0,k.useMemo)(()=>RT(c.map(d=>d.time)),[c]),rr=c.length>=Np,Jo=rr&&je.end>je.start,rm=Jo?je.start:0,ry=Jo?je.end:c.length,$o=at.current;(0,k.useEffect)(()=>{if(!rr||Jn.current||!wl.current||!nr||ze.current>_n)return;let d=requestAnimationFrame(()=>{ze.current>_n||zd()});return()=>cancelAnimationFrame(d)},[c,kt,zd,nr,rr]);let NM=$o!==void 0&&Jo?($o[rm]??0)+He.current:0,TM=$o!==void 0&&Jo?($o[c.length]??0)-($o[ry]??$o[c.length]??0):0;(0,k.useEffect)(()=>{ar()},[c,kt,ar]),(0,k.useEffect)(()=>{if(!rr)return;let d=F.current;if(d===void 0)return;let S=!1;for(let M of d.querySelectorAll("[data-mid]")){if(M.classList.contains("chat-msg-pending"))continue;let _=M.dataset.mid;if(_===void 0)continue;let B=M.offsetHeight;B>0&&Ft.current.get(_)!==B&&(Ft.current.set(_,B),S=!0)}S&&Gn(M=>M+1)},[rr,Jo,c,kt,Jp]),(0,k.useEffect)(()=>{let d=F.current;if(d===void 0)return;let S=at.current?.[c.length]??0,M=d.scrollHeight===0?0:d.scrollHeight-S;if(M===He.current||(He.current=M,eM(B=>B+1),at.current===void 0)||!wl.current||ze.current>_n)return;let _=requestAnimationFrame(()=>{ze.current>_n||zd()});return()=>cancelAnimationFrame(_)},[rr,Jo,c,kt,Jp,zd]);let EM=c[c.length-1]?.id,oy=d=>d.id===EM&&d.kind==="assistant"&&d.pending!==!0&&!jt?()=>dM(d):void 0;return(0,R.jsxs)("div",{className:"chat",children:[(0,R.jsxs)("header",{className:"mobile-header",children:[(0,R.jsx)("div",{className:"mobile-headerSlot",children:(0,R.jsx)("button",{type:"button",className:"mobile-back","aria-label":"返回",onClick:pM,children:"‹"})}),(0,R.jsx)("div",{className:"mobile-titleWrap",children:(0,R.jsx)("h1",{className:"mobile-title mobile-titleInline",children:Nd})}),(0,R.jsxs)("div",{className:"mobile-headerSlot mobile-headerSlot-right",children:[(0,R.jsx)("button",{type:"button",className:"mobile-iconbtn","aria-label":"更多",onClick:()=>{hl(!0)},children:(0,R.jsx)(cT,{})}),(0,R.jsx)(cl,{})]})]}),b!==void 0&&(0,R.jsx)("p",{className:"mobile-error mobile-pad",children:b}),(Fn||Ja>0)&&(0,R.jsxs)("div",{className:"chat-offline-banner",role:"status",style:{flexDirection:"column",alignItems:"stretch",padding:"8px 16px"},children:[(0,R.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8},children:[(0,R.jsx)("span",{children:Fn?"网络已断开，消息将在恢复后发送":Ja>0?`${Ja} 条离线消息待发送`:""}),!Fn&&Ja>0&&(0,R.jsx)("button",{type:"button",className:"chat-offline-retry",onClick:Kp,children:"重试"})]}),ne.length>0&&(0,R.jsx)("ul",{style:{listStyle:"none",margin:"4px 0 0",padding:0,display:"flex",flexDirection:"column",gap:4},children:ne.map(d=>(0,R.jsxs)("li",{style:{display:"flex",alignItems:"center",gap:8,fontSize:"var(--text-sm)"},children:[(0,R.jsx)("span",{style:{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:d.text}),(0,R.jsx)("button",{type:"button",className:"chat-offline-retry","aria-label":"移除待发送消息",onClick:()=>{ZE(d.id)},children:"移除"})]},d.id))})]}),(0,R.jsxs)("div",{className:"chat-scroll",ref:d=>{F.current=d??void 0},onScroll:nM,onClick:gM,onDoubleClick:d=>{let S=d.target instanceof Element?d.target.closest(".code-block"):null;if(S===null)return;let M=S.querySelector("pre");M!==null&&(M.style.transform="")},onContextMenu:d=>{Jv(d.target,d.clientX,d.clientY)&&(d.preventDefault(),to())},onTouchStart:d=>{if(d.touches.length>=2){to();let me=(d.target instanceof Element?d.target:null)?.closest(".code-block")??null;if(me!==null){let ue=$v(d.touches);if(ue>0){let Oe=me.querySelector("pre")?.style.transform??"",ve=Oe===""?1:Number(/scale\(([\d.]+)\)/.exec(Oe)?.[1]??1);zt.current={block:me,dist0:ue,scale0:ve};return}}zt.current=void 0;return}zt.current=void 0;let S=d.touches[0];if(S===void 0)return;let M=d.target instanceof Element?d.target:null;if(M===null||M.closest(".chat-msg")===null||M.closest(".code-block pre, img")!==null)return;let{clientX:_,clientY:B}=S,G=window.setTimeout(()=>{Nl.current=void 0,Jv(M,_,B)},500);Nl.current={timer:G,x:_,y:B}},onTouchMove:d=>{if(zt.current!==void 0&&d.touches.length>=2){let S=$v(d.touches);S>0&&hM(zt.current.scale0*S/zt.current.dist0);return}to()},onTouchEnd:d=>{zt.current!==void 0&&d.touches.length<2&&(zt.current=void 0),to()},onTouchCancel:d=>{zt.current!==void 0&&d.touches.length<2&&(zt.current=void 0),to()},children:[h&&(0,R.jsx)("button",{type:"button",className:"chat-load-older",disabled:p,onClick:()=>{Wv()},children:p?"加载中…":"加载更早的消息"}),rr?(0,R.jsxs)(R.Fragment,{children:[(0,R.jsx)("div",{style:{height:NM},"aria-hidden":"true"}),c.slice(rm,ry).map((d,S)=>{let M=rm+S;return(0,R.jsx)(yv,{message:d,sessionId:e.sessionId,showToolCalls:a,showSystemMessages:i,clockOffsetMs:Go.current,liveTurnStartAt:xl??void 0,liveTurn:Gv,showTime:iy[M]===!0,focused:d.id===$a,focusedQuery:l,onOpenFile:_=>{fn(_)},onRegenerate:oy(d)},q2(d))}),(0,R.jsx)("div",{style:{height:TM},"aria-hidden":"true"})]}):c.map((d,S)=>{let M=S<c.length-Q3?{contentVisibility:"auto",containIntrinsicSize:`auto ${Ep(d)}px`}:void 0;return(0,R.jsx)(yv,{message:d,sessionId:e.sessionId,showToolCalls:a,showSystemMessages:i,clockOffsetMs:Go.current,liveTurnStartAt:xl??void 0,liveTurn:Gv,showTime:iy[S]===!0,focused:d.id===$a,focusedQuery:l,style:M,onOpenFile:_=>{fn(_)},onRegenerate:oy(d)},q2(d))}),p&&c.length===0&&(0,R.jsx)("p",{className:"chat-typing",children:"加载中…"}),!p&&c.length===0&&(0,R.jsx)("p",{className:"chat-typing",children:"还没有消息，发一句话开始吧"}),jt&&(0,R.jsxs)("div",{className:"chat-turn-status",role:"status","aria-label":Wr?"连接中断":yd?"后台处理中":"输出中",children:[Wr?"连接中断":yd?"后台处理中":"输出中",(0,R.jsxs)("span",{className:"chat-turn-dots","aria-hidden":!0,children:[(0,R.jsx)("span",{}),(0,R.jsx)("span",{}),(0,R.jsx)("span",{})]})]}),Vp.map(d=>(0,R.jsx)(R2,{approval:d,sessionId:e.sessionId,onResolved:S=>{QN(e.sessionId,S),ml(M=>M.filter(_=>_.approvalId!==S))}},d.approvalId)),kd.length>0&&(0,R.jsx)(C2,{questions:kd,sessionId:e.sessionId,onResolved:d=>{jN(e.sessionId,d),gl(S=>S.filter(M=>M.rpcId!==d))}}),Xv&&Jt.length>=2&&(0,R.jsx)("button",{type:"button",className:"chat-jump-turns"+(yl!==void 0?" chat-jump-turns-live":""),"aria-label":"轮次导航：轻点开清单，按住拖动刮擦",onPointerDown:rM,onPointerMove:oM,onPointerUp:sM,onPointerCancel:Fv,onLostPointerCapture:Fv,onClick:d=>{d.detail===0&&Td(!0)},children:(0,R.jsxs)("span",{className:"chat-jump-turns-label",children:[Vv,"/",bl]})}),Ko!==void 0&&Ko!==Up&&Ko!==bl&&bl>=2&&(0,R.jsxs)("button",{type:"button",className:"chat-jump-lastread","aria-label":"回到上次读到的轮次",onClick:iM,children:["回到上次 · 第 ",Ko," 轮"]}),Xv&&(0,R.jsxs)("button",{type:"button",className:"chat-jump-latest"+(Dd>0?" chat-jump-latest-hot":""),"aria-label":"回到最新消息",onClick:aM,children:[(0,R.jsx)(Fb,{width:20,height:20}),Dd>0&&(0,R.jsx)("span",{className:"chat-jump-badge",children:Dd>99?"99+":Dd})]})]}),(0,R.jsx)(bT,{todo:E,jobs:xd,subagents:Qo,onOpen:()=>{qv(!0)}}),yl!==void 0&&Jt.length>=2&&(0,R.jsx)(I2,{entries:Jt,index:yl}),(0,R.jsxs)("div",{className:"chat-tools",children:[(0,R.jsxs)("div",{className:"chat-tools-actions",children:[(0,R.jsxs)("button",{type:"button",className:"chat-pill",onClick:xM,"aria-haspopup":"listbox","aria-label":yt===void 0?"切换模型":`切换模型：${V2(yt.model)}`,title:yt===void 0?void 0:`${yt.provider}/${yt.model}`,children:[(0,R.jsx)(fT,{width:16,height:16}),(0,R.jsx)("span",{className:"chat-pill-name",children:yt===void 0?"模型":V2(yt.model)}),(0,R.jsx)("span",{className:"chat-pill-chevron","aria-hidden":!0,children:"▾"})]}),Ud!==void 0&&vt!==void 0&&(0,R.jsxs)("button",{type:"button",className:"chat-pill chat-pill-perm chat-pill-perm-"+(U3(vt.currentValue)??"read"),onClick:wM,"aria-haspopup":"listbox","aria-label":`切换权限：${Ud}`,title:Ud,children:[(0,R.jsx)($c,{width:16,height:16}),(0,R.jsx)("span",{className:"chat-pill-name",children:Ud})]})]}),(0,R.jsx)("div",{className:"chat-context"+(ba!==void 0&&ba.pct>=80?" chat-context-warn":""),role:"status",onClick:SM,"aria-expanded":Ha,children:ba===void 0?(0,R.jsx)(R.Fragment,{children:"上下文 --"}):(0,R.jsxs)(R.Fragment,{children:[(0,R.jsxs)("svg",{className:"chat-context-ring",width:"26",height:"26",viewBox:"0 0 26 26","aria-hidden":!0,children:[(0,R.jsx)("circle",{className:"chat-context-ring-track",cx:"13",cy:"13",r:"10.5",fill:"none",strokeWidth:"3.5"}),(0,R.jsx)("circle",{className:"chat-context-ring-fill",cx:"13",cy:"13",r:"10.5",fill:"none",strokeWidth:"3.5",strokeDasharray:`${ba.pct/100*65.97} 65.97`,transform:"rotate(-90 13 13)"})]}),(0,R.jsxs)("span",{className:"chat-context-text",title:`${kp(ba.pressure)}/${kp(ba.window)}`,children:[ba.pct,"%"]})]})}),Ha&&ba!==void 0&&(0,R.jsxs)("div",{className:"chat-context-pop",role:"tooltip",children:[(0,R.jsx)("div",{className:"chat-context-pop-title",children:"上下文用量"}),(0,R.jsxs)("div",{className:"chat-context-pop-figures",children:[kp(ba.pressure),(0,R.jsx)("span",{children:"/"}),kp(ba.window)]}),(0,R.jsxs)("div",{className:"chat-context-pop-sub",children:["已使用 ",ba.pct,"%"]})]})]}),Ha&&(0,R.jsx)("div",{className:"chat-context-pop-scrim",onClick:()=>{Sn(!1)}}),wn!==null&&(0,R.jsx)("div",{className:"chat-picker-scrim",onClick:()=>{Pt(null)}}),wn==="model"&&(0,R.jsxs)("div",{className:"chat-picker-panel",role:"menu","aria-label":"选择模型",children:[Y.status==="loading"&&(0,R.jsx)("span",{className:"chat-picker-status",children:"正在加载模型目录…"}),Y.status==="error"&&(0,R.jsxs)(R.Fragment,{children:[(0,R.jsx)("span",{className:"chat-picker-status chat-picker-error",children:Y.message}),Fa(Y.message)!==void 0&&(0,R.jsx)("span",{className:"chat-picker-status chat-picker-hint",children:Fa(Y.message)}),(0,R.jsx)("button",{type:"button",className:"chat-picker-more",onClick:ny,children:"重试"})]}),Y.status==="ready"&&(0,R.jsxs)(R.Fragment,{children:[(()=>{let d=yt??Y.data.current,S=(M,_)=>{let B=d!==void 0&&d.provider===M.id&&d.model===_.id;return(0,R.jsxs)("button",{type:"button",className:"chat-picker-row"+(B?" chat-picker-row-selected":""),disabled:Zt,onClick:()=>{ay({provider:M.id,model:_.id,..._.reasoning?.defaultEffort===void 0?{}:{reasoningEffort:_.reasoning.defaultEffort}})},children:[(0,R.jsx)("span",{className:"chat-picker-row-check","aria-hidden":!0,children:B?(0,R.jsx)(Oa,{width:14,height:14}):null}),(0,R.jsx)("span",{className:"chat-picker-row-copy",children:(0,R.jsx)("span",{className:"chat-picker-row-title",children:_.name})})]},`${M.id}:${_.id}`)};return Y.data.groups.map(M=>(0,R.jsxs)("div",{className:"chat-picker-group",children:[(0,R.jsx)("div",{className:"chat-picker-group-title",children:M.name}),M.models.map(_=>S(M,_))]},M.id))})(),(()=>{let d=yt??Y.data.current,_=Y.data.groups.flatMap(K=>K.models.map(me=>({group:K,model:me}))).find(K=>K.group.id===d.provider&&K.model.id===d.model)?.model.reasoning,B=d.reasoningEffort??_?.defaultEffort,G=_===void 0?[]:[..._.defaultEffort===void 0?[{key:"provider-default",effort:void 0,label:"跟随模型默认"}]:[],..._.efforts.map(K=>({key:`effort:${K.id}`,effort:K.id,label:K.name}))];return G.length===0?null:(0,R.jsxs)("div",{className:"chat-picker-group",children:[(0,R.jsx)("div",{className:"chat-picker-group-title",children:"思考强度"}),G.map(K=>{let me=B===K.effort;return(0,R.jsxs)("button",{type:"button",className:"chat-picker-row"+(me?" chat-picker-row-selected":""),disabled:Zt,onClick:()=>{ay({provider:d.provider,model:d.model,...K.effort!==void 0?{reasoningEffort:K.effort}:{}})},children:[(0,R.jsx)("span",{className:"chat-picker-row-check","aria-hidden":!0,children:me?(0,R.jsx)(Oa,{width:14,height:14}):null}),(0,R.jsx)("span",{className:"chat-picker-row-copy",children:(0,R.jsx)("span",{className:"chat-picker-row-title",children:K.label})})]},K.key)})]})})(),(0,R.jsx)("button",{type:"button",className:"chat-picker-more",onClick:()=>{Pt(null),At("model")},children:"全部…"})]})]}),wn==="permission"&&vt!==void 0&&(0,R.jsxs)("div",{className:"chat-picker-panel",role:"menu","aria-label":"选择权限",children:[vt.options.map(d=>{let S=d.value===vt.currentValue;return(0,R.jsxs)("button",{type:"button",className:"chat-picker-row"+(S?" chat-picker-row-selected":"")+(d.value==="danger-full-access"?" chat-picker-row-danger":""),disabled:Zt,onClick:()=>{kM(d.value)},children:[(0,R.jsx)("span",{className:"chat-picker-row-check","aria-hidden":!0,children:S?(0,R.jsx)(Oa,{width:14,height:14}):null}),(0,R.jsxs)("span",{className:"chat-picker-row-copy",children:[(0,R.jsx)("span",{className:"chat-picker-row-title",children:d.name}),d.description!==void 0&&(0,R.jsx)("span",{className:"chat-picker-row-sub",children:d.description})]})]},d.value)}),(0,R.jsx)("button",{type:"button",className:"chat-picker-more",onClick:()=>{Pt(null),At("permission")},children:"全部…"})]}),GE&&(0,R.jsx)(vT,{todo:E,jobs:xd,subagents:Qo,onClose:()=>{qv(!1)}}),(0,R.jsxs)("div",{className:"chat-composer",children:[(0,R.jsx)(zT,{items:vd,running:jt,onEdit:JE,onRemove:$E,onSteer:WE}),kn!==void 0&&(0,R.jsxs)("div",{className:"chat-quote-bar",role:"note","aria-label":"引用消息",children:[(0,R.jsxs)("span",{className:"chat-quote-text",children:[kn.slice(0,20),kn.length>20?"…":""]}),(0,R.jsx)("button",{type:"button",className:"chat-quote-close","aria-label":"取消引用",onClick:()=>{an(void 0)},children:(0,R.jsx)(jr,{width:14,height:14})})]}),Et.length>0&&(0,R.jsx)("div",{className:"chat-attach-bar",role:"list","aria-label":"待发送图片",children:Et.map((d,S)=>(0,R.jsxs)("div",{className:"chat-attach-item",role:"listitem",children:[(0,R.jsx)("img",{className:"chat-attach-img",src:d.dataUrl,alt:"待发送图片"}),(0,R.jsx)("button",{type:"button",className:"chat-attach-remove","aria-label":"移除图片",onClick:()=>{Bt(M=>M.filter((_,B)=>B!==S))},children:"×"})]},S))}),(0,R.jsxs)("div",{className:"chat-inputbar",children:[(0,R.jsx)("button",{type:"button",className:"chat-attach-btn","aria-label":"添加内容","aria-haspopup":"dialog",onClick:()=>{Tt(!0)},children:(0,R.jsx)(ll,{width:20,height:20})}),dv()&&(0,R.jsx)("button",{type:"button",className:"chat-attach-btn","aria-label":"语音输入",onClick:vM,children:(0,R.jsx)(rp,{width:20,height:20})}),(0,R.jsx)("textarea",{className:"chat-input",rows:1,value:N,placeholder:"说点什么...",enterKeyHint:Jr?"send":"enter",onChange:d=>{D(d.target.value)},onFocus:()=>{$i(!0)},onBlur:()=>{$i(!1)},onPaste:d=>{let S=PN(d.clipboardData);if(S.length>0){d.preventDefault();for(let M of S)am(M)}},onKeyDown:d=>{Jr&&d.key==="Enter"&&!d.shiftKey&&!d.nativeEvent.isComposing&&(d.preventDefault(),ty())}}),(0,R.jsx)("button",{type:"button",className:jt?"chat-send chat-send-stop":"chat-send",...jt?{"aria-label":Sd?"停止中":"停止"}:{"aria-label":"发送"},disabled:jt?Sd:T||N.trim()===""&&Et.length===0,onClick:()=>{jt?yM():ty()},children:jt?(0,R.jsx)("svg",{viewBox:"0 0 16 16",width:"14",height:"14","aria-hidden":"true",focusable:"false",children:(0,R.jsx)("rect",{x:"3",y:"3",width:"10",height:"10",rx:"3",fill:"currentColor"})}):(0,R.jsx)(eT,{})})]})]}),ke&&(0,R.jsx)(N2,{commands:Dn,onPickImage:()=>{Tt(!1),Kn.current?.click()},onPickCamera:()=>{Tt(!1),Va.current?.click()},onPickCommand:d=>{Tt(!1),Wp(d).catch(()=>{})},onClose:()=>{Tt(!1)}}),(0,R.jsx)("input",{ref:Kn,type:"file",accept:"image/*",multiple:!0,hidden:!0,onChange:d=>{let S=[...d.target.files??[]];for(let M of S)am(M);d.target.value=""}}),(0,R.jsx)("input",{ref:Va,type:"file",accept:"image/*",capture:"environment",hidden:!0,onChange:d=>{let S=[...d.target.files??[]];for(let M of S)am(M);d.target.value=""}}),pa==="model"&&(0,R.jsx)(T2,{sessionId:e.sessionId,current:yt,onCurrent:d=>{zn(d)},onClose:()=>{At(null)}}),pa==="permission"&&vt!==void 0&&(0,R.jsx)(E2,{sessionId:e.sessionId,value:vt,onChanged:d=>{fa(S=>S===void 0?S:{...S,currentValue:d})},onClose:()=>{At(null)}}),XE&&(0,R.jsx)(M2,{entries:Jt,currentTurn:Vv,onPick:kl,onClose:()=>{Td(!1)}}),nn!==null&&(0,R.jsx)(FT,{path:nn,sessionId:e.sessionId,onClose:()=>{fn(null)}}),ma!==null&&(0,R.jsx)(ZT,{src:ma,alt:"聊天图片",onClose:()=>{xn(null)}}),YE&&(0,R.jsx)(ht,{title:Nd,onClose:()=>{hl(!1)},children:(0,R.jsxs)("div",{role:"menu","aria-label":"会话操作",children:[(0,R.jsxs)("button",{type:"button",role:"menuitem",className:"sheet-option",onClick:()=>{hl(!1),Gp(!0)},children:[(0,R.jsx)("span",{className:"sheet-option-copy",children:(0,R.jsx)("span",{className:"sheet-option-title",children:"重命名会话"})}),(0,R.jsx)(Jc,{width:16,height:16})]}),(0,R.jsx)("button",{type:"button",role:"menuitem",className:"sheet-option",onClick:()=>{hl(!1),Ka(e.sessionId)},children:(0,R.jsx)("span",{className:"sheet-option-copy",children:(0,R.jsx)("span",{className:"sheet-option-title",children:"复制会话 ID"})})}),(0,R.jsx)("div",{className:"sheet-option-divider","aria-hidden":!0}),(0,R.jsx)("button",{type:"button",role:"menuitem",className:"sheet-option",onClick:()=>{hl(!1),Yp(!0)},children:(0,R.jsx)("span",{className:"sheet-option-copy",children:(0,R.jsx)("span",{className:"sheet-option-title",style:{color:"var(--danger)"},children:"删除会话"})})})]})}),KE&&(0,R.jsx)(Uo,{title:"重命名会话",initial:Nd,confirmLabel:"保存",onCancel:()=>{Gp(!1)},onConfirm:d=>{uM(d)}}),FE&&(0,R.jsx)(Si,{title:"删除会话",body:(0,R.jsxs)(R.Fragment,{children:["确定删除「",Nd,"」吗？该会话将从所有设备消失（电脑上的会话记录保留，可从桌面找回）。"]}),confirmLabel:"删除",tone:"danger",onCancel:()=>{Yp(!1)},onConfirm:fM}),J&&(0,R.jsx)("div",{className:"voice-backdrop",onClick:()=>{bM()},children:(0,R.jsxs)("div",{className:"voice-sheet",role:"dialog","aria-modal":"true","aria-label":"语音输入",onClick:d=>{d.stopPropagation()},children:[(0,R.jsxs)("div",{className:"voice-wave"+(Ge==="transcribing"?" voice-wave-idle":""),"aria-hidden":!0,children:[(0,R.jsx)("span",{}),(0,R.jsx)("span",{}),(0,R.jsx)("span",{}),(0,R.jsx)("span",{}),(0,R.jsx)("span",{})]}),(0,R.jsx)("div",{className:"voice-text",role:"status",children:Ge==="transcribing"?"转写中...":de!==""?de:"正在听..."}),(0,R.jsx)("button",{type:"button",className:"voice-done",disabled:Ge==="transcribing",onClick:im,children:Ge==="transcribing"?"请稍候":"完成"})]})}),Zn!==void 0&&(0,R.jsxs)(R.Fragment,{children:[(0,R.jsx)("div",{className:"ctx-backdrop",onClick:()=>{Ni(void 0)},onContextMenu:d=>{d.preventDefault(),Ni(void 0)}}),(0,R.jsxs)("div",{className:"ctx-menu",role:"menu","aria-label":"消息操作",style:{left:Zn.x,top:Zn.y},children:[Zn.kind==="user"&&Zn.messageId!==void 0&&(0,R.jsx)("button",{type:"button",role:"menuitem",className:"ctx-item",onClick:()=>{let{text:d,messageId:S}=Zn;Ni(void 0),S!==void 0&&Qp({messageId:S,text:d})},children:"编辑并重新发送"}),Zn.raw!==void 0&&(0,R.jsx)("button",{type:"button",role:"menuitem",className:"ctx-item",onClick:()=>{let{raw:d}=Zn;Ni(void 0),Ka(d??"","已复制原文")},children:"复制原文"}),(0,R.jsx)("button",{type:"button",role:"menuitem",className:"ctx-item",onClick:()=>{let{text:d}=Zn;Ni(void 0),Ka(d)},children:"复制"}),(0,R.jsx)("button",{type:"button",role:"menuitem",className:"ctx-item",onClick:()=>{let{text:d}=Zn;Ni(void 0),lM(d)},children:"引用"}),(0,R.jsx)("button",{type:"button",role:"menuitem",className:"ctx-item",onClick:()=>{let{raw:d,text:S}=Zn;Ni(void 0),yT(d??S)},children:"分享"})]})]}),Xp!==void 0&&(0,R.jsx)(Uo,{title:"编辑并重新发送",initial:Xp.text,confirmLabel:"发送",onCancel:()=>{Qp(void 0)},onConfirm:d=>{cM(Xp.messageId,d)}})]})}function Mp(e){return[{type:"text",text:e}]}function j2(e){if(typeof e!="object"||e===null)return;let t=e;return{...typeof t.contextWindow=="number"?{contextWindow:t.contextWindow}:{},...typeof t.pressureTokens=="number"?{pressureTokens:t.pressureTokens}:{},...typeof t.projectedTokens=="number"?{projectedTokens:t.projectedTokens}:{}}}var ua=X(Ye(),1);var ie=X(re(),1),W3=8,eO=4,Y2=3,tO=new Set(["running","stopping"]);function Cp(e){return tO.has(e.status)}function X2(e){if(e===void 0)return;let n=e.projections?.values?.title;if(typeof n=="string"&&n!=="")return n;if(e.cwd!==void 0){let a=e.cwd.split("/").filter(Boolean).at(-1);if(a!==void 0&&a!=="")return a}}async function nO(){let e=[],t;for(let n=0;n<W3;n++){let a,i=!1;try{let r=await Lr(t);a=r.items,t=r.nextCursor,i=r.hasMore}catch{return{rows:e,truncated:!0}}for(let r of a)e.push({sessionId:String(r.sessionId),...X2(r)!==void 0?{title:X2(r)}:{},running:r.running===!0,blank:r.blank===!0});if(!i)return{rows:e,truncated:!1}}return{rows:e,truncated:!0}}function aO(e,t,n){let a=new Map,i=o=>{a.has(o)||a.set(o,{sessionId:o,title:t.get(o)?.title??`会话 ${o.slice(0,6)}`,jobs:[],live:!1,runningOnly:!1})};for(let o of e){if(o.jobs.length===0)continue;i(o.sessionId);let s=a.get(o.sessionId);s.jobs=o.jobs,s.live=o.jobs.some(l=>Cp(l))}for(let o of n){i(o);let s=a.get(o);if(s.live=!0,s.jobs.length===0&&(s.runningOnly=!0),s.title.startsWith("会话 ")){let l=t.get(o);l?.title!==void 0&&(s.title=l.title)}}let r=[...a.values()];return r.sort((o,s)=>o.live!==s.live?o.live?-1:1:o.runningOnly!==s.runningOnly?o.runningOnly?-1:1:o.sessionId<s.sessionId?-1:o.sessionId>s.sessionId?1:0),r}function K2({mux:e,onBack:t,onOpenSession:n}){let[a,i]=(0,ua.useState)(()=>e?.jobsSnapshot()??[]),[r,o]=(0,ua.useState)(new Map),[s,l]=(0,ua.useState)(()=>{let N=new Set;for(let D of e?.runningSessionsSnapshot()??[])N.add(D);return N}),c=(0,ua.useRef)(new Set(e?.runningSessionsSnapshot()??[])),[f,v]=(0,ua.useState)(()=>new Map),g=(N,D)=>{let O=new Set(c.current);D?O.add(N):O.delete(N),c.current=O,l(O)};(0,ua.useEffect)(()=>{let N=!1;return nO().then(({rows:D})=>{if(N)return;let O=new Map,T=new Set(c.current);for(let q of D)O.set(q.sessionId,q),q.running===!0&&!q.blank&&T.add(q.sessionId);c.current=T,o(O),l(T)},()=>{N||l(new Set(c.current))}),()=>{N=!0}},[]),(0,ua.useEffect)(()=>{if(e===void 0)return;let N=O=>{if(O.type==="session/jobs"||O.type==="session/subscribed"){i(e.jobsSnapshot());return}if(O.type==="session/event"){let T=O.event.type,q=String(O.sessionId);T==="turn/start"?g(q,!0):T==="turn/end"&&g(q,!1)}},D=e.onFrame(N);return i(e.jobsSnapshot()),D},[e]);let h=aO(a,r,s),w=h.filter(N=>N.live).map(N=>N.sessionId).slice(0,eO),x=w.join("|");(0,ua.useEffect)(()=>{if(x==="")return;let N=x.split("|"),D=!1,O=()=>{for(let q of N)$b(q).then($=>{D||$===void 0||v(F=>new Map(F).set(q,$))})};O();let T=setInterval(O,sp);return()=>{D=!0,clearInterval(T)}},[x]);let C=w.reduce((N,D)=>N+Wb(f.get(D)??[]).length,0),p=h.reduce((N,D)=>N+D.jobs.filter(O=>Cp(O)).length,0),m=h.filter(N=>N.live).length,b=h.filter(N=>N.live),y=h.filter(N=>!N.live);return(0,ie.jsxs)("div",{className:"mobile",children:[(0,ie.jsxs)("header",{className:"mobile-header",style:{paddingTop:"calc(env(safe-area-inset-top, 0px) + 4px)"},children:[(0,ie.jsx)("div",{className:"mobile-headerSlot",children:(0,ie.jsx)("button",{type:"button",className:"mobile-back","aria-label":"返回",onClick:t,children:"‹"})}),(0,ie.jsx)("h1",{className:"mobile-title",children:"运行中"}),(0,ie.jsx)("div",{className:"mobile-headerSlot mobile-headerSlot-right"})]}),(0,ie.jsxs)("div",{className:"runov-page",children:[h.length===0&&(0,ie.jsxs)("div",{className:"mobile-empty",style:{paddingTop:28},children:[(0,ie.jsx)("div",{className:"empty-icon",children:(0,ie.jsx)(np,{})}),(0,ie.jsx)("p",{className:"empty-title",children:"当前没有运行中的会话或任务"}),(0,ie.jsx)("p",{className:"empty-desc",children:"会话输出、子代理委派、命令运行会实时显示在这里"})]}),h.length>0&&(0,ie.jsxs)("div",{className:"runov-scroll",children:[(0,ie.jsxs)("div",{className:"runov-hero",children:[(0,ie.jsx)("span",{className:"chat-status-dot chat-status-dot-live","aria-hidden":!0}),(0,ie.jsxs)("span",{className:"runov-hero-copy",children:[(0,ie.jsx)("span",{className:"runov-hero-t",children:p>0||m>0?`${m} 个会话正在运行 · ${p} 个后台任务`+(C>0?` · ${C} 个子代理`:""):`${h.length} 个会话有近期后台任务`}),(0,ie.jsx)("span",{className:"runov-hero-s",children:"跨全部工作区 · 实时同步"})]})]}),b.length>0&&(0,ie.jsxs)(ie.Fragment,{children:[(0,ie.jsxs)("div",{className:"runov-group-title",children:["正在运行 · ",m]}),b.map(N=>(0,ie.jsx)(Q2,{row:N,children:f.get(N.sessionId),onOpen:()=>{n({sessionId:N.sessionId,title:N.title})}},N.sessionId))]}),y.length>0&&(0,ie.jsxs)(ie.Fragment,{children:[(0,ie.jsx)("div",{className:"runov-group-title",children:"最近结束"}),y.map(N=>(0,ie.jsx)(Q2,{row:N,onOpen:()=>{n({sessionId:N.sessionId,title:N.title})}},N.sessionId))]})]})]})]})}function Q2({row:e,children:t,onOpen:n}){let[a,i]=(0,ua.useState)(!1),[r,o]=(0,ua.useState)(!1),s=e.jobs.filter(x=>Cp(x)),l=e.jobs.filter(x=>!Cp(x)),c=e.live?cp(Wb(t??[])):[],f=Math.max(0,c.length-Y2),v=r||f===0?c:c.slice(0,Y2),g=s.filter(x=>x.kind==="subagent"),w=g.length>0&&c.length>=g.length?s.filter(x=>x.kind!=="subagent"):s;return(0,ie.jsxs)("div",{className:"runov-sess",children:[(0,ie.jsxs)("button",{type:"button",className:"runov-sess-head",onClick:n,children:[e.live&&(0,ie.jsxs)("span",{className:"runov-sess-live",children:[(0,ie.jsx)("span",{className:"chat-status-dot chat-status-dot-live","aria-hidden":!0}),e.runningOnly?"回合中":"运行中"]}),(0,ie.jsxs)("span",{style:{flex:1,minWidth:0},children:[(0,ie.jsx)("span",{className:"runov-sess-title",children:e.title}),(0,ie.jsx)("span",{className:"runov-sess-sub",children:e.sessionId})]}),(0,ie.jsx)("span",{className:"runov-sess-chev",children:"›"})]}),v.length>0&&(0,ie.jsxs)("div",{className:"runov-jobs",children:[(0,ie.jsx)("div",{className:"runov-subgroup-title",children:"子代理"}),(0,ie.jsx)("div",{role:"list","aria-label":`${e.title} 的子代理`,children:v.map(x=>(0,ie.jsx)(nv,{node:x},x.id))})]}),f>0&&(0,ie.jsxs)("button",{type:"button",className:"runov-jobs-fold","aria-expanded":r,onClick:()=>{o(x=>!x)},children:[(0,ie.jsx)("span",{className:"runov-jobs-fold-label",children:r?"收起子代理":`… 还有 ${f} 个子代理`}),(0,ie.jsx)("span",{className:"runov-jobs-fold-chev","aria-hidden":!0,children:r?"▾":"▸"})]}),w.length>0&&(0,ie.jsxs)("div",{className:"runov-jobs",children:[v.length>0&&(0,ie.jsx)("div",{className:"runov-subgroup-title",children:"后台任务"}),(0,ie.jsx)("div",{role:"list","aria-label":`${e.title} 的后台任务`,children:w.map(x=>(0,ie.jsx)(Wc,{job:x},x.id))})]}),l.length>0&&(0,ie.jsxs)(ie.Fragment,{children:[(0,ie.jsxs)("button",{type:"button",className:"runov-jobs-fold","aria-expanded":a,onClick:()=>{i(x=>!x)},children:[(0,ie.jsx)("span",{className:"runov-jobs-fold-label",children:a?"收起已完成":`${l.length} 个已完成`}),(0,ie.jsx)("span",{className:"runov-jobs-fold-chev","aria-hidden":!0,children:a?"▾":"▸"})]}),a&&(0,ie.jsx)("div",{className:"runov-jobs runov-jobs-settled",role:"list","aria-label":`${e.title} 的已完成任务`,children:l.map(x=>(0,ie.jsx)(Wc,{job:x},x.id))})]}),e.runningOnly&&(0,ie.jsx)("div",{className:"runov-jobs",role:"status",children:(0,ie.jsxs)("div",{className:"chat-task-row",children:[(0,ie.jsx)("span",{className:"chat-task-dot chat-task-dot-running","aria-hidden":!0}),(0,ie.jsxs)("span",{className:"chat-task-copy",children:[(0,ie.jsx)("span",{className:"chat-task-label",children:"回合运行中"}),(0,ie.jsx)("span",{className:"chat-task-meta",children:"正在生成回复 · 点击进入查看"})]})]})})]})}var ae=X(Ye(),1);var z=X(re(),1);function kv(e,t){return e.filter(n=>t.has(String(n.sessionId))).map(n=>Tv(n))}function iO(){return{added:new Map,status:new Map,activity:new Map,error:new Map,removed:new Set}}function rO(e,t){return t.sessionIds.includes(e.sessionId)?!0:e.cwd!==void 0&&e.cwd===t.path}function oO(e,t,n){switch(t.type){case"session/added":{let a=t.summary;if(a===null||typeof a!="object")return!1;let i=String(a.sessionId);return rO(a,n)?(e.added.set(i,Tv(a)),e.removed.delete(i),!0):!1}case"session/removed":{let a=String(t.sessionId);return e.added.delete(a),e.status.delete(a),e.activity.delete(a),e.error.delete(a),e.removed.add(a),!0}case"session/status":{let a=String(t.sessionId);return e.status.set(a,t.running),t.running&&e.error.delete(a),!0}case"session/activity":return e.activity.set(String(t.sessionId),t.updatedAt),!0;case"session/error":return e.error.set(String(t.sessionId),t.message),!0;default:return!1}}function F2(e,t){let n=t.status.get(e.sessionId),a=t.activity.get(e.sessionId),i=t.error.get(e.sessionId),r=n===!0&&e.error!==void 0;if(n===void 0&&a===void 0&&i===void 0&&!r)return e;let o={...e};return n!==void 0&&(o.running=n),a!==void 0&&(o.updatedAt=a),i!==void 0?o.error=i:r&&delete o.error,o}function Nv(e,t){if(t.added.size===0&&t.removed.size===0&&t.status.size===0&&t.activity.size===0&&t.error.size===0)return e;let n=[];for(let a of e)t.removed.has(a.sessionId)||n.push(F2(a,t));for(let[a,i]of t.added)n.some(r=>r.sessionId===a)||n.push(F2(i,t));return n.sort((a,i)=>i.updatedAt-a.updatedAt)}function sO(e,t=new Date){let n=new Date(e),a=r=>new Date(r.getFullYear(),r.getMonth(),r.getDate()).getTime(),i=a(t);return a(n)===i?"今天":a(n)===i-864e5?"昨天":"更早"}var lO=["今天","昨天","更早"],cO=12,dO=3,uO=200,fO=1e4,Z2=12e3,pO=2500,mO=6e4,gO=12,J2=40,Fi=new Map,$2=!1;function hO(){if(!$2){if($2=!0,Fi.size===0)for(let[e,t]of NN())Fi.set(e,t);AN()}}function Ap(e,t){vi.set(e,{...t,at:Date.now()}),Db(e,t)}function W2(){xN(Fi)}async function bO(e,t){try{let n=await Gi(e,void 0,1,t),a=Hr(n.events.map(i=>i.event));for(let i=a.length-1;i>=0;i--){let r=a[i];if(r===void 0)continue;let o=r.text!==""?r.text:r.reasoning??"",s=MT(o);if(s!=="")return s}return}catch{return}}async function vO(e,t,n){let a=0,i=Array.from({length:Math.min(t,e.length)},async()=>{for(;a<e.length;){let r=e[a];a+=1,await n(r)}});await Promise.all(i)}function eE({workspace:e,mux:t,initialSessionId:n,initialSearch:a,onBack:i,onPick:r,onOpenSettings:o,onLocateSession:s,onPickSeq:l,onSearchSnapshot:c,onSearchApplied:f}){let[v,g]=(0,ae.useState)([]),h=(0,ae.useRef)(iO()),[w,x]=(0,ae.useState)(!1),[C,p]=(0,ae.useState)(!0),[m,b]=(0,ae.useState)(void 0),y=(0,ae.useMemo)(()=>new Set(e.sessionIds.map(String)),[e]),[N,D]=(0,ae.useState)(!1),[O,T]=(0,ae.useState)(void 0),[q,$]=(0,ae.useState)([]),[F,Ie]=(0,ae.useState)(void 0),[at,Te]=(0,ae.useState)(!0),je=(0,ae.useRef)(void 0),Je=(0,ae.useRef)(!1),[Kt,xe]=(0,ae.useState)(0),_t=(0,ae.useRef)(0),$e=(0,ae.useRef)(void 0),[Ut,ze]=(0,ae.useState)(!1),[He,Ft]=(0,ae.useState)(""),[kt,Gn]=(0,ae.useState)([]),[Nt,ut]=(0,ae.useState)(!1),[bt,j]=(0,ae.useState)(!1),[Z,ce]=(0,ae.useState)(0),[Ee,Ae]=(0,ae.useState)(!1),Me=(0,ae.useRef)(new Set),Yn=(0,ae.useRef)(!1),vt=(0,ae.useRef)(!1);(0,ae.useEffect)(()=>{vt.current||a!==void 0&&a.open&&(vt.current=!0,ze(!0),Ft(a.term),f?.())},[a,f]),(0,ae.useEffect)(()=>{c?.(Ut,He)},[Ut,He,c]);let fa=(0,ae.useCallback)(async(V,ne,W)=>{let J=ne;for(let le=0;le<8&&J!==void 0;le++){let de=await Lr(J),Ge=kv(de.items,W).find(xt=>xt.sessionId===V);if(Ge!==void 0)return Ge;if(!de.hasMore)return;J=de.nextCursor}},[]),[Xn,yn]=(0,ae.useState)(0),yt=(0,ae.useRef)(!0);(0,ae.useEffect)(()=>()=>{yt.current=!1},[]);let zn=(0,ae.useRef)(0),[pa,At]=(0,ae.useState)(void 0),[nn,fn]=(0,ae.useState)(void 0),ma=(0,ae.useRef)(void 0),xn=(0,ae.useRef)(void 0),[wn,Pt]=(0,ae.useState)(()=>TN()),[Ha,Sn]=(0,ae.useState)(void 0),Zt=(0,ae.useRef)(void 0),H=(0,ae.useCallback)(V=>{Pt(ne=>{let W=new Set(ne);return W.has(V)?W.delete(V):W.add(V),EN(W),W})},[]),Y=6,se=(0,ae.useCallback)(V=>{let ne=V.filter(le=>!le.blank&&le.preview===void 0&&!Fi.has(le.sessionId)).slice(0,cO);if(ne.length===0)return;let W=new AbortController,J=le=>{for(let de of le)if(de.summary!==""){if(Fi.size>=uO){let ft=Fi.keys().next().value;ft!==void 0&&Fi.delete(ft)}Fi.set(de.sessionId,de.summary)}};jS(ne.map(le=>le.sessionId),W.signal).then(le=>{yt.current&&(J(le),W2(),yn(de=>de+1))},()=>{yt.current&&vO(ne.slice(0,Y),dO,async le=>{if(!yt.current)return;let de=await bO(le.sessionId,W.signal);de===void 0||!yt.current||J([{sessionId:le.sessionId,summary:de}])}).then(()=>{yt.current&&(W2(),yn(le=>le+1))})})},[]);(0,ae.useEffect)(()=>{if(t!==void 0)return t.onFrame(V=>{oO(h.current,V,e)&&g(ne=>Nv(ne,h.current))})},[t,e]),(0,ae.useEffect)(()=>{let V=!1;hO();let ne=String(e.workspaceId),W=vi.get(ne);if(W!==void 0&&Date.now()-W.at>=mO&&(W=void 0),W===void 0){let de=wN(ne);de!==void 0&&(W={rows:de.rows,cursor:de.cursor,hasMore:de.hasMore,at:Date.now()},vi.set(ne,W))}W!==void 0?(g(Nv(W.rows,h.current)),je.current=W.cursor,x(W.hasMore),b(void 0),p(!1)):(p(!0),b(void 0));let J=setTimeout(()=>{V||(p(!1),b('加载超时了，点一下"加载更多"重试'))},Z2);Ac().then(de=>{if(V)return;let ft=de.find(Ge=>Ge.workspaceId===e.workspaceId);ft!==void 0&&(Me.current=new Set(ft.sessionIds.map(String)))},()=>{});let le=Promise.race([Ac().catch(()=>[]),new Promise(de=>{setTimeout(()=>de([]),pO)})]);return Promise.all([Lr(void 0,e.workspaceId),le]).then(([de,ft])=>{if(V)return;clearTimeout(J),b(void 0);let Ge=ft.find(zt=>zt.workspaceId===e.workspaceId),xt=new Set((Ge?.sessionIds??e.sessionIds).map(String));Me.current=xt;let Ve=kv(de.items,xt),ga=n===void 0?void 0:Ve.find(zt=>zt.sessionId===n);if(ga!==void 0){r(ga);return}if(g(Nv(Ve,h.current)),Ap(ne,{rows:Ve,cursor:de.nextCursor,hasMore:de.hasMore}),se(Ve),je.current=de.nextCursor,x(de.hasMore),p(!1),n!==void 0&&ga===void 0&&!Yn.current){Yn.current=!0;let zt=()=>({sessionId:n,title:"定位的会话",updatedAt:0,running:!1,blank:!1});de.hasMore?fa(n,de.nextCursor,xt).then(Jr=>{r(Jr??zt())},()=>{}):r(zt())}},de=>{V||(W===void 0&&b(he(de)),p(!1))}),()=>{V=!0}},[e,n,r,se]),(0,ae.useEffect)(()=>{let V=String(e.workspaceId),ne=SN(V);return ne>0&&requestAnimationFrame(()=>{try{window.scrollTo(0,ne)}catch{}}),()=>{kN(V,window.scrollY)}},[e.workspaceId]),(0,ae.useEffect)(()=>{let V=!1;return $([]),Ie(void 0),Te(!0),Df().then(ne=>{if(V)return;let W=ne.presets.filter(J=>J.broken===void 0);$(ne.presets),Ie((W.find(J=>J.isDefault)??W[0])?.id),Te(!1)},()=>{V||Te(!1)}),()=>{V=!0}},[e,Kt]);let ke=(0,ae.useCallback)((V=!1)=>{if(Je.current||!V&&Date.now()-zn.current<fO)return;let ne=je.current;if(ne===void 0){V&&xe(J=>J+1);return}Je.current=!0,p(!0);let W=setTimeout(()=>{yt.current&&(Je.current=!1,p(!1),zn.current=Date.now(),b("加载超时了，再点一次"))},Z2);Lr(ne,e.workspaceId).then(J=>{Je.current=!1,p(!1),clearTimeout(W),b(void 0),zn.current=0,je.current=J.nextCursor,x(J.hasMore);let le=kv(J.items,y);g(de=>{let ft=[...de,...le];return vi.get(String(e.workspaceId))!==void 0&&Ap(String(e.workspaceId),{rows:ft,cursor:J.nextCursor,hasMore:J.hasMore}),ft}),se(le)},J=>{Je.current=!1,p(!1),clearTimeout(W),zn.current=Date.now(),b(he(J))})},[e,se]);(0,ae.useEffect)(()=>{let V=$e.current;if(V===void 0||typeof IntersectionObserver>"u")return;let ne=new IntersectionObserver(W=>{W.some(J=>J.isIntersecting)&&(_t.current=0,je.current!==void 0&&!Je.current&&ke())},{rootMargin:"240px 0px"});return ne.observe(V),()=>{ne.disconnect()}},[ke]);let Tt=2;(0,ae.useEffect)(()=>{if(!w||C||_t.current>=Tt)return;let V=$e.current;V==null||V.getBoundingClientRect().top-window.innerHeight>240||(_t.current+=1,ke())},[w,C,v,ke]);let Et=(0,ae.useCallback)(()=>{N||(D(!0),T(void 0),PS({workspaceId:e.workspaceId,...F!==void 0?{agentPreset:F}:{}}).then(V=>{D(!1);let ne={sessionId:V.sessionId,title:"新会话",updatedAt:Date.now(),running:!1,blank:!0};g(W=>{let J=[ne,...W],le=vi.get(String(e.workspaceId));return le!==void 0&&Ap(String(e.workspaceId),{rows:J,cursor:le.cursor,hasMore:le.hasMore}),J}),r(ne)},V=>{D(!1),T(he(V))}))},[N,e,r,F]),Bt=(0,ae.useCallback)(()=>{ma.current!==void 0&&(clearTimeout(ma.current),ma.current=void 0)},[]);(0,ae.useEffect)(()=>()=>{Bt()},[Bt]);let Qn=(V,ne)=>({onTouchStart:W=>{Bt(),xn.current=void 0,ma.current=window.setTimeout(()=>{ma.current=void 0,xn.current=V.sessionId,At(V)},500);let J=W.touches[0];J!==void 0&&(Zt.current={sessionId:V.sessionId,x:J.clientX,y:J.clientY})},onTouchMove:W=>{Bt();let J=Zt.current;if(J===void 0||J.sessionId!==V.sessionId)return;let le=W.touches[0];if(le===void 0)return;let de=le.clientX-J.x,ft=le.clientY-J.y;Math.abs(de)>J2&&Math.abs(de)>Math.abs(ft)*1.5?(Sn(de<0?V.sessionId:void 0),Zt.current=void 0):Math.abs(ft)>J2&&(Zt.current=void 0)},onTouchEnd:()=>{Bt(),Zt.current=void 0},onClick:W=>{if(xn.current===V.sessionId){xn.current=void 0,W.preventDefault();return}if(Ha===V.sessionId){Sn(void 0),W.preventDefault();return}ne!==void 0?Ja(ne,V.title):r(V)},onContextMenu:W=>{W.preventDefault(),At(V)}}),Kn=(0,ae.useCallback)(V=>{fn(void 0),At(void 0),g(ne=>{let W=ne.filter(le=>le.sessionId!==V.sessionId),J=vi.get(String(e.workspaceId));return J!==void 0&&Ap(String(e.workspaceId),{rows:W,cursor:J.cursor,hasMore:J.hasMore}),W}),up(V.sessionId),Ic(V.sessionId).catch(ne=>{Q(`删除未生效：${he(ne)}`)})},[e]),Va=O!==void 0?Fa(O):void 0,Dn=q.find(V=>V.id===F),[Ji,kn]=(0,ae.useState)(!1),[an,Fr]=(0,ae.useState)(!1),$i=Dn?.description,Fn=(0,ae.useMemo)(()=>{let V=He.trim().toLowerCase(),ne=new Set(kt.map(Ge=>Ge.sessionId)),W=v.filter(Ge=>V===""?!0:Ge.title.toLowerCase().includes(V)||ne.has(Ge.sessionId)),J=W.filter(Ge=>wn.has(Ge.sessionId)),le=W.filter(Ge=>!wn.has(Ge.sessionId)),de=J.length>0?[{bucket:"置顶",rows:J}]:[],ft=lO.map(Ge=>({bucket:Ge,rows:le.filter(xt=>sO(xt.updatedAt)===Ge)})).filter(Ge=>Ge.rows.length>0);return[...de,...ft]},[v,He,kt,Xn,wn]);(0,ae.useEffect)(()=>{let V=He.trim();if(V===""){Gn([]),ce(0),Ae(!1),j(!1),ut(!1);return}ut(!0),j(!1);let ne=!1,W=setTimeout(()=>{_f(V).then(J=>{if(ne)return;let le=Me.current;Gn(J.items.filter(de=>le.has(de.sessionId))),ce(J.items.filter(de=>!le.has(de.sessionId)).length),Ae(J.hasMore),j(!0),ut(!1)},()=>{ne||(j(!0),ut(!1))})},250);return()=>{ne=!0,clearTimeout(W)}},[He]);let Zr=()=>{ze(!1),Ft("")},Ja=(V,ne)=>{let W={sessionId:V.sessionId,title:ne,...V.title===void 0?{preview:V.snippet}:{},updatedAt:0,running:!1,blank:!1};if(V.kind==="message"&&V.seq!==void 0){l!==void 0?l(W,V.seq,He.trim(),V.messageId,V.partId):r(W);return}zf(V.sessionId,He.trim()).then(J=>{let le=J.items[0];le!==void 0&&l!==void 0?l(W,le.seq,He.trim(),le.messageId,le.partId):r(W)},()=>{r(W)})};return(0,z.jsxs)("div",{className:"mobile",children:[(0,z.jsxs)("header",{className:"mobile-header",children:[(0,z.jsx)("div",{className:"mobile-headerSlot",children:Ut?(0,z.jsx)("button",{type:"button",className:"mobile-back","aria-label":"返回",onClick:Zr,children:"‹"}):(0,z.jsx)("button",{type:"button",className:"mobile-back","aria-label":"返回",onClick:i,children:"‹"})}),Ut?(0,z.jsx)("div",{className:"mobile-headerSearch",children:(0,z.jsx)("input",{type:"search",className:"mobile-headerSearchInput",placeholder:"搜索当前工作区或全部会话…","aria-label":"搜索会话",autoFocus:!0,value:He,onChange:V=>{Ft(V.target.value)}})}):(0,z.jsxs)("div",{className:"mobile-titleWrap",children:[(0,z.jsx)("h1",{className:"mobile-title mobile-titleInline",children:e.title}),(0,z.jsx)("p",{className:"mobile-titlePath",children:e.path})]}),(0,z.jsx)("div",{className:"mobile-headerSlot mobile-headerSlot-right",children:Ut?(0,z.jsx)("button",{type:"button",className:"mobile-iconbtn","aria-label":"取消搜索",onClick:Zr,children:(0,z.jsx)(jr,{})}):(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)("button",{type:"button",className:"mobile-iconbtn","aria-label":"搜索会话",onClick:()=>{ze(!0)},children:(0,z.jsx)(Qi,{})}),(0,z.jsx)("button",{type:"button",className:"mobile-iconbtn","aria-label":"设置",onClick:o,children:(0,z.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round","aria-hidden":!0,children:[(0,z.jsx)("circle",{cx:"12",cy:"12",r:"3"}),(0,z.jsx)("path",{d:"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"})]})}),(0,z.jsx)(cl,{})]})})]}),m!==void 0&&(0,z.jsx)("p",{className:"mobile-error mobile-pad",children:m}),(0,z.jsxs)("div",{className:"mobile-create",children:[q.length>0&&(0,z.jsxs)("div",{className:"mobile-presetCard",children:[(0,z.jsx)("button",{type:"button",className:"mobile-presetTrigger","aria-label":"Agent 模式",disabled:F===void 0,onClick:()=>{Fr(!0)},children:(0,z.jsxs)("span",{className:"mobile-presetTriggerCopy",children:[(0,z.jsxs)("span",{className:"mobile-presetTriggerTitle",children:[Dn?.name??F??"无可用 Agent 模式",Dn?.isDefault===!0?"（默认）":""]}),Dn?.description!==void 0&&(0,z.jsx)("span",{className:"mobile-presetTriggerDesc",children:Dn.description})]})}),(0,z.jsx)("span",{className:"mobile-presetCaret","aria-hidden":!0,children:"▾"}),(0,z.jsx)("button",{type:"button",className:"mobile-presetHelp","aria-label":"模式说明",disabled:$i===void 0,onClick:()=>{kn(!0)},children:(0,z.jsx)(nT,{})})]}),(0,z.jsx)("button",{type:"button",className:"mobile-new",disabled:N||at,onClick:()=>{Et()},children:N?"创建中…":"+ 新建会话"})]}),O!==void 0&&(0,z.jsxs)("p",{className:"mobile-error mobile-pad",children:[O,Va!==void 0&&(0,z.jsx)("span",{className:"mobile-hint",children:Va})]}),(0,z.jsxs)("ul",{className:"mobile-list",children:[C&&v.length===0&&(0,z.jsx)("div",{"aria-hidden":"true",role:"presentation",children:[0,1,2].map(V=>(0,z.jsxs)("div",{className:"skel-row",children:[(0,z.jsx)("span",{className:"skel skel-icon"}),(0,z.jsxs)("div",{className:"skel-lines",children:[(0,z.jsx)("div",{className:"skel skel-line-title"}),(0,z.jsx)("div",{className:"skel skel-line-sub"})]}),(0,z.jsx)("span",{})]},V))}),(()=>{let V=0,ne=Fn.reduce((W,J)=>W+J.rows.length,0);return Fn.map(W=>(0,z.jsxs)("li",{style:{listStyle:"none"},children:[(0,z.jsx)("div",{className:"mobile-groupTitle",children:W.bucket}),W.rows.map(J=>{let le=kt.find(Ve=>Ve.sessionId===J.sessionId&&(Ve.kind==="message"||Ve.kind==="title")),de=J.preview??Fi.get(J.sessionId)??(J.turns!==void 0?`${J.turns} 轮对话`:void 0),Ge=V>=ne-gO||ne<20?void 0:{contentVisibility:"auto",containIntrinsicSize:"auto 72px"};V+=1;let xt=Ha===J.sessionId;return(0,z.jsxs)("div",{className:"mobile-row-swipe",style:Ge,children:[(0,z.jsx)("button",{type:"button",className:"mobile-row-swipe-action","aria-label":"删除会话",onClick:()=>{Sn(void 0),fn(J)},children:"删除"}),(0,z.jsx)("div",{className:"mobile-row-swipe-inner"+(xt?" swiped":""),children:(0,z.jsxs)("button",{type:"button",className:"mobile-row",...Qn(J,le),children:[(0,z.jsx)("span",{className:"card-icon",children:J.running?(0,z.jsx)("span",{className:"sess-dot sess-dot-running",role:"img","aria-label":"进行中"}):(0,z.jsx)("span",{className:"sess-check","aria-hidden":!0,children:(0,z.jsx)(Oa,{})})}),(0,z.jsxs)("span",{className:"card-main",children:[(0,z.jsxs)("span",{className:"sess-titleline",children:[(0,z.jsx)("span",{className:"sess-title",children:J.title}),J.blank&&(0,z.jsx)("span",{className:"sess-status",children:"新"}),J.running&&(0,z.jsx)("span",{className:"sess-status",children:"进行中"}),J.error!==void 0&&(0,z.jsx)("span",{className:"sess-status",title:J.error,children:"出错"}),(0,z.jsx)("span",{className:"sess-sep","aria-hidden":!0,children:"·"}),(0,z.jsx)("span",{className:"sess-time",children:tE(J.updatedAt)})]}),de!==void 0&&(0,z.jsx)("span",{className:"card-desc",children:de})]}),(0,z.jsx)("span",{className:"card-action",children:(0,z.jsx)("span",{className:"mobile-chevron","aria-hidden":!0,children:"›"})})]})})]},J.sessionId)})]},W.bucket))})(),!C&&Nt&&(0,z.jsx)("li",{style:{listStyle:"none"},children:(0,z.jsx)("p",{className:"mobile-muted mobile-pad",role:"status",children:"正在搜索全部会话…"})}),!C&&He.trim()!==""&&!Nt&&kt.some(V=>!v.some(ne=>ne.sessionId===V.sessionId))&&(0,z.jsxs)("li",{style:{listStyle:"none"},children:[(0,z.jsx)("div",{className:"mobile-groupTitle",children:"搜索结果（未加载的会话）"}),kt.filter(V=>!v.some(ne=>ne.sessionId===V.sessionId)).map(V=>{let ne=(V.title??V.snippet.trim().slice(0,24))||"匹配会话";return(0,z.jsx)("li",{style:{listStyle:"none"},children:(0,z.jsxs)("button",{type:"button",className:"mobile-row",onClick:()=>{Ja(V,ne)},children:[(0,z.jsx)("span",{className:"card-icon",children:(0,z.jsx)("span",{className:"sess-check","aria-hidden":!0,children:(0,z.jsx)(Oa,{})})}),(0,z.jsxs)("span",{className:"card-main",children:[(0,z.jsxs)("span",{className:"sess-titleline",children:[(0,z.jsx)("span",{className:"sess-title",children:ne}),(0,z.jsx)("span",{className:"sess-sep","aria-hidden":!0,children:"·"}),(0,z.jsx)("span",{className:"sess-time",children:"命中内容"})]}),(0,z.jsx)("span",{className:"card-desc",children:V.snippet})]}),(0,z.jsx)("span",{className:"card-action",children:(0,z.jsx)("span",{className:"mobile-chevron","aria-hidden":!0,children:"›"})})]})},`${V.kind}:${V.sessionId}`)})]}),!C&&He.trim()!==""&&!Nt&&Z>0&&(0,z.jsx)("li",{style:{listStyle:"none"},children:(0,z.jsxs)("p",{className:"search-hitsNote mobile-pad",children:["另有 ",Z," 个其他工作区的命中未在此显示，首页搜索可查全部"]})}),!C&&He.trim()!==""&&!Nt&&Ee&&(0,z.jsx)("li",{style:{listStyle:"none"},children:(0,z.jsx)("p",{className:"search-hitsNote mobile-pad",children:"结果较多，仅显示前若干条——请细化关键词"})}),!C&&He.trim()!==""&&!Nt&&bt&&Fn.length===0&&kt.length===0&&(0,z.jsxs)("div",{className:"mobile-empty",children:[(0,z.jsx)("div",{className:"empty-icon",children:(0,z.jsx)(Qi,{})}),(0,z.jsx)("p",{className:"empty-title",children:"未找到匹配会话"}),(0,z.jsx)("p",{className:"empty-desc",children:"已搜索全部会话的标题与内容"})]}),w&&(0,z.jsx)("li",{style:{listStyle:"none"},children:(0,z.jsxs)("div",{className:"mobile-pad",children:[(0,z.jsx)("div",{ref:V=>{$e.current=V??void 0},"aria-hidden":"true"}),(0,z.jsx)("button",{type:"button",className:"mobile-button mobile-block",disabled:C,onClick:()=>{ke(!0)},children:C?"加载中…":"加载更多会话"})]})}),!w&&v.length===0&&!C&&(0,z.jsxs)("div",{className:"mobile-empty",children:[(0,z.jsx)("div",{className:"empty-icon",children:(0,z.jsx)(WN,{})}),(0,z.jsx)("p",{className:"empty-title",children:"还没有会话"}),(0,z.jsx)("p",{className:"empty-desc",children:"点上方按钮新建一个，开始这个项目的第一段对话"})]})]}),an&&(0,z.jsx)(ht,{title:"选择 Agent 模式",onClose:()=>{Fr(!1)},children:q.map((V,ne)=>(0,z.jsxs)("div",{children:[ne>0&&(0,z.jsx)("div",{className:"sheet-option-divider","aria-hidden":!0}),(0,z.jsxs)("button",{type:"button",className:`sheet-option${V.id===F?" sheet-option-selected":""}`,disabled:V.broken!==void 0,onClick:()=>{Ie(V.id),Fr(!1)},children:[(0,z.jsxs)("span",{className:"sheet-option-copy",children:[(0,z.jsxs)("span",{className:"sheet-option-title",children:[V.name??V.id,V.isDefault?"（默认）":"",V.trust==="user"?"（本地）":"",V.broken!==void 0?"（不可用）":""]}),V.description!==void 0&&(0,z.jsx)("span",{className:"sheet-option-desc",children:V.description})]}),V.id===F&&(0,z.jsx)("span",{className:"sheet-option-check","aria-hidden":!0,children:(0,z.jsx)(Oa,{})})]})]},V.id))}),Ji&&(0,z.jsx)(ht,{title:"Agent 模式说明",onClose:()=>{kn(!1)},children:(0,z.jsxs)("p",{className:"sheet-confirm-desc",children:[Dn?.name??F,$i!==void 0?"："+$i:""]})}),pa!==void 0&&(0,z.jsx)(ht,{title:pa.title,onClose:()=>{At(void 0)},children:(0,z.jsxs)("div",{role:"menu","aria-label":"会话操作",children:[(0,z.jsx)("div",{className:"sheet-option-divider","aria-hidden":!0}),(0,z.jsx)("button",{type:"button",role:"menuitem",className:"sheet-option",onClick:()=>{H(pa.sessionId),At(void 0)},children:(0,z.jsx)("span",{className:"sheet-option-copy",children:(0,z.jsx)("span",{className:"sheet-option-title",children:wn.has(pa.sessionId)?"取消置顶":"置顶"})})}),(0,z.jsx)("button",{type:"button",role:"menuitem",className:"sheet-option",onClick:()=>{At(void 0),fn(pa)},children:(0,z.jsx)("span",{className:"sheet-option-copy",children:(0,z.jsx)("span",{className:"sheet-option-title",style:{color:"var(--danger)"},children:"删除会话"})})})]})}),nn!==void 0&&(0,z.jsx)(Si,{title:"删除会话",body:(0,z.jsxs)(z.Fragment,{children:["确定删除「",nn.title,"」吗？该会话将从所有设备消失（电脑上的会话记录保留，可从桌面找回）。"]}),confirmLabel:"删除",tone:"danger",onCancel:()=>{fn(void 0)},onConfirm:()=>{Kn(nn)}})]})}var ee=X(Ye(),1);var Op={version:"1.6.0"};var oE=X(Ye(),1);var nE="dsh-palm.install-hint.v1";function xO(){if(typeof navigator>"u")return{userAgent:""};let e=navigator;return{userAgent:e.userAgent??"",standalone:e.standalone,maxTouchPoints:e.maxTouchPoints,displayModeStandalone:typeof window<"u"&&typeof window.matchMedia=="function"?window.matchMedia("(display-mode: standalone)").matches:void 0}}function aE(e=xO()){let{userAgent:t,maxTouchPoints:n=0}=e;return!(/iPhone|iPad|iPod/.test(t)||/Macintosh/.test(t)&&n>1)||/(CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo)/.test(t)?!1:e.standalone!==!0&&e.displayModeStandalone!==!0}function iE(){try{return localStorage.getItem(nE)==="1"}catch{return!1}}function rE(){try{localStorage.setItem(nE,"1")}catch{}}var fd=X(re(),1);function sE(){let[e,t]=(0,oE.useState)(iE);return e||!aE()?null:(0,fd.jsxs)("li",{className:"settings-note settings-installHint",children:[(0,fd.jsx)("span",{children:"装到主屏才是全屏 App（也能收推送）：Safari 底部「分享」→「添加到主屏幕」。"}),(0,fd.jsx)("button",{type:"button",className:"settings-installHint-btn",onClick:()=>{rE(),t(!0)},children:"知道了"})]})}var Ev=X(Ye(),1);var Za=X(re(),1);function wO(){if(!(typeof window>"u"))return window.__dshPalmPerf}function lE(e){return typeof e.marks=="number"?e.marks:Array.isArray(e.stamps)?e.stamps.length:0}async function cE(e){try{let t=navigator.clipboard;return t===void 0||typeof t.writeText!="function"?!1:(await t.writeText(JSON.stringify(e)),!0)}catch{return!1}}function SO(){let t=((typeof window.prompt=="function"?window.prompt("这是哪套环境？（如 android-lan / ios-lan / android-remote）","android-lan"):void 0)??"").trim();return t===""?"device":t}function dE(){let[e,t]=(0,Ev.useState)(!1),[n,a]=(0,Ev.useState)(void 0),i=Vf(),r=Pf();if(!r&&i.total===0)return null;let o=wO(),s=o?.stats(),l=s===void 0?0:lE(s),c=s?.frames?.sampled??0,f=g=>{if(e||o===void 0)return;let h=g?o.toJSON():o.stats();if(lE(h)===0&&!window.confirm("还没有采到回合标记（marks=0），可能这一轮没跑过。仍然上报吗？")){Q("已取消：先跑一轮再上报");return}t(!0),HS(h,SO()).then(w=>{t(!1),a(w.file),Q(`已上报性能数据：${w.file}`)},()=>{cE(h).then(w=>{t(!1),Q(w?"上报失败，已复制性能数据到剪贴板（粘给我即可）":"上报失败，且复制失败")},()=>{t(!1),Q("上报失败")})})},v=()=>{cE(i).then(g=>{Q(g?"运行错误已复制到剪贴板（粘给我即可）":"复制失败")},()=>{Q("复制失败")})};return(0,Za.jsxs)("li",{className:"settings-note settings-installHint",children:[(0,Za.jsxs)("span",{children:[r?`性能数据：已采集 ${l} 标记 · ${c} 帧`:`运行错误 ${i.total} 条`,r&&i.total>0?` · 运行错误 ${i.total} 条`:"",n===void 0?"":" · 已上报"]}),(0,Za.jsxs)("span",{className:"settings-perfActions",children:[r&&(0,Za.jsxs)(Za.Fragment,{children:[(0,Za.jsx)("button",{type:"button",className:"settings-installHint-btn",disabled:e||o===void 0,onClick:()=>{f(!1)},children:e?"上报中…":"上报摘要"}),(0,Za.jsx)("button",{type:"button",className:"settings-installHint-btn",disabled:e||o===void 0,onClick:()=>{f(!0)},children:"上报原始"})]}),i.total>0&&(0,Za.jsx)("button",{type:"button",className:"settings-installHint-btn",onClick:v,children:"复制错误"})]})]})}function kO(){if(typeof document>"u")return;let t=document.querySelector('script[src*="mobile.js"]')?.getAttribute("src")??"";return/[?&]v=([A-Za-z0-9_-]+)/.exec(t)?.[1]}var Mv=kO();var za=X(Ye(),1);var Ct=X(re(),1),fE="dsh.mobile.market.registry.v1",NO=3600*1e3;async function Rv(e){let t=await fetch(e,{headers:{accept:"application/json"}});if(!t.ok){let n="";try{let a=await t.json();typeof a.error=="string"&&(n=a.error)}catch{}throw new Error(`HTTP ${t.status}${n!==""?`：${n}`:""}`)}return await t.json()}async function TO(e,t){let n=await fetch(e,{method:"POST",headers:{accept:"application/json","content-type":"application/json"},body:JSON.stringify(t)});if(!n.ok){let a="";try{let i=await n.json();typeof i.error=="string"&&(a=i.error)}catch{}throw new Error(`HTTP ${n.status}${a!==""?`：${a}`:""}`)}return await n.json()}function EO(){try{let e=localStorage.getItem(fE);if(e===null)return;let t=JSON.parse(e);return Date.now()-t.at>NO?void 0:t.payload}catch{return}}function MO(e){try{localStorage.setItem(fE,JSON.stringify({at:Date.now(),payload:e}))}catch{}}function uE(e){return e.npm??e.name}function pE({onBack:e}){let[t,n]=(0,za.useState)(()=>EO()),[a,i]=(0,za.useState)(void 0),[r,o]=(0,za.useState)(void 0),[s,l]=(0,za.useState)(void 0),[c,f]=(0,za.useState)(t===void 0),[v,g]=(0,za.useState)(""),[h,w]=(0,za.useState)(void 0);(0,za.useEffect)(()=>{let p=!1;return t===void 0&&Rv("/dsh-market/registry").then(m=>{p||(n(m),MO(m),f(!1))},m=>{p||(o(he(m)),f(!1))}),Rv("/dsh-market/installed").then(m=>{p||i(m.installed)},()=>{}),()=>{p=!0}},[]);let x=(0,za.useMemo)(()=>{let p=t?.registry.plugins??[],m=v.trim().toLowerCase();return m===""?p:p.filter(b=>b.name.toLowerCase().includes(m)||b.owner.toLowerCase().includes(m)||(b.description?.zh??b.description?.en??"").toLowerCase().includes(m))},[t,v]),C=p=>{if(h!==void 0)return;let m=uE(p);a?.[m]===void 0&&window.confirm(`安装插件「${p.name}」？

安装会修改插件配置；完成后新插件可能需要重启 DSH 才生效。`)&&(w(p.url),l(void 0),o(void 0),TO("/dsh-market/install",{url:p.url}).then(()=>{w(void 0),l(`「${p.name}」安装完成。新插件可能需要重启 DSH 后生效。`),Rv("/dsh-market/installed").then(b=>{i(b.installed)},()=>{})},b=>{w(void 0),o(he(b))}))};return(0,Ct.jsxs)("div",{className:"mobile",children:[(0,Ct.jsxs)("header",{className:"mobile-header",children:[(0,Ct.jsx)("button",{type:"button",className:"mobile-back","aria-label":"返回",onClick:e,children:"‹"}),(0,Ct.jsx)("h1",{className:"mobile-title mobile-titleInline",children:"插件市场"})]}),(0,Ct.jsxs)("div",{className:"mobile-scroll",children:[r!==void 0&&(0,Ct.jsx)("p",{className:"mobile-error mobile-pad",role:"alert",children:r}),s!==void 0&&(0,Ct.jsx)("p",{className:"mobile-pad settings-saved",role:"status",children:s}),(0,Ct.jsx)("div",{className:"mobile-pad",children:(0,Ct.jsx)("input",{type:"search",className:"settings-input",placeholder:"搜索插件…",value:v,onChange:p=>{g(p.target.value)}})}),c&&(0,Ct.jsx)("p",{className:"mobile-muted mobile-pad",children:"正在加载插件目录…"}),!c&&t!==void 0&&(0,Ct.jsxs)("ul",{className:"settings-group",children:[(0,Ct.jsxs)("li",{className:"settings-groupTitle",children:["共 ",t.registry.count," 个插件",v!==""?`，匹配 ${x.length} 个`:""]}),x.slice(0,300).map(p=>{let m=uE(p),b=a?.[m]!==void 0,y=h===p.url;return(0,Ct.jsxs)("li",{className:"settings-row market-row",children:[(0,Ct.jsxs)("div",{className:"market-rowMain",children:[(0,Ct.jsxs)("span",{className:"market-rowTitle",children:[p.name,b&&(0,Ct.jsx)("span",{className:"market-badge",children:"已安装"})]}),(0,Ct.jsx)("span",{className:"market-rowDesc",children:p.description?.zh??p.description?.en??p.owner})]}),(0,Ct.jsx)("button",{type:"button",className:"market-install",disabled:y||b||h!==void 0,onClick:()=>{C(p)},children:y?"安装中…":b?"已安装":"安装"})]},p.url)}),x.length>300&&(0,Ct.jsx)("li",{className:"settings-note",children:"仅显示前 300 个插件，请用搜索缩小范围"}),x.length===0&&(0,Ct.jsx)("li",{className:"settings-note",children:"没有匹配的插件。"})]})]})]})}var ki=X(Ye(),1);var RO={"ui-theme":{preference:{title:"主题偏好",desc:"深色 / 浅色 / 跟随系统",scope:"sync"}},"ui-conversation":{busyEnter:{title:"忙碌时回车发送",desc:"模型生成中按回车直接发送下一条消息",scope:"sync"}},"ui-onboarding":{completed:{title:"引导完成状态",desc:"首次使用引导是否已完成",scope:"desktop"}},locale:{preference:{title:"界面语言",desc:"桌面端界面语言",scope:"desktop"}},"agent-presets":{default:{title:"默认预设",desc:"新会话使用的 Agent 预设",scope:"sync"}},"subagent-model":{provider:{title:"子代理提供方",desc:"子代理使用的模型提供方",scope:"sync"},model:{title:"子代理模型",desc:"子代理使用的模型",scope:"sync"}},"agent-default-model":{provider:{title:"模型提供方",desc:"新会话默认的模型提供方",scope:"sync"},model:{title:"模型",desc:"新会话默认的模型",scope:"sync"},reasoningEffort:{title:"推理档位",desc:"默认的推理强度",scope:"sync"}},"llm-pi-ai":{providers:{title:"模型提供方",desc:"已配置的提供方与模型目录",scope:"desktop"},apiKeys:{title:"API Key",desc:"各提供方的密钥（不显示）",scope:"desktop"}},"llm-deepseek":{baseURL:{title:"接口地址",desc:"DeepSeek API 地址",scope:"desktop"},apiKey:{title:"API Key",desc:"DeepSeek 密钥（不显示）",scope:"desktop"}},"free-search":{engine:{title:"搜索服务",desc:"免费搜索使用的引擎",scope:"desktop"}},"web-search-deepseek":{enabled:{title:"联网搜索",desc:"是否启用 DeepSeek 联网搜索",scope:"desktop"}},mnemon:{provider:{title:"记忆提供方",desc:"记忆空间使用的提供方",scope:"desktop"}},"mnemon-ui":{enabled:{title:"记忆界面",desc:"是否启用记忆界面",scope:"desktop"}},"at-file":{enabled:{title:"启用 @文件",desc:"在输入框支持 @ 引用文件",scope:"sync"}},"tool-see-image":{enabled:{title:"看图工具",desc:"是否启用图片查看工具",scope:"desktop"}},"agent-loop":{maxParallelToolCalls:{title:"最大并行工具调用",desc:"单轮最多同时执行的工具数",scope:"sync"}},shell:{defaultShell:{title:"默认 Shell",desc:"命令执行的默认 Shell",scope:"desktop"}},permission:{allowlist:{title:"命令白名单",desc:"允许执行的命令列表",scope:"desktop"}},"dsh-market":{allowRestart:{title:"允许重启",desc:"安装插件后允许自动重启",scope:"sync"}},"dsh-better-sidebar":{openByDefault:{title:"默认展开侧边栏",desc:"启动时侧边栏是否默认展开",scope:"sync"},defaultWidthPercent:{title:"默认宽度",desc:"侧边栏默认宽度（百分比）",scope:"sync"},autoOpenSubagent:{title:"自动展开子代理",desc:"子代理运行时自动展开其行",scope:"sync"},autoOpenJobs:{title:"自动展开任务",desc:"有后台任务时自动展开任务区",scope:"sync"},agentTerminalTools:{title:"终端工具按钮",desc:"agent 行显示终端工具入口",scope:"sync"},bottomPanelAutoTerminal:{title:"自动打开终端面板",desc:"底部面板自动切到终端",scope:"sync"},editorExplorer:{title:"编辑器文件树",desc:"编辑器侧显示文件树",scope:"sync"},tabsEnabled:{title:"启用标签页",desc:"编辑器标签页功能",scope:"sync"},viewersEnabled:{title:"启用查看器",desc:"内嵌文档/图查看器",scope:"sync"},terminalFontSize:{title:"终端字号",desc:"终端显示字号",scope:"sync"}},"dsh-palm":{enabled:{title:"远程访问",desc:"是否启用远程访问入口",scope:"desktop"}}};function pd(e,t){return RO[e]?.[t]}var oe=X(re(),1),CO={"ui-theme":"外观",locale:"语言","ui-conversation":"对话","agent-presets":"Agent 预设","subagent-model":"子代理模型","agent-default-model":"默认模型","at-file":"@文件","agent-loop":"Agent 循环","dsh-market":"插件市场","dsh-better-sidebar":"侧边栏","llm-deepseek":"DeepSeek 模型","llm-pi-ai":"模型提供方","free-search":"搜索","tool-see-image":"看图工具","web-search-deepseek":"联网搜索",shell:"Shell",permission:"权限","dsh-palm":"远程访问",mnemon:"记忆","mnemon-ui":"记忆界面","ui-onboarding":"引导"},AO={"ui-theme":["preference"],"ui-conversation":["busyEnter"],"agent-presets":["default"],"subagent-model":["model","provider"],"agent-default-model":["model","provider","reasoningEffort"],"at-file":["enabled"],"agent-loop":["maxParallelToolCalls"],"dsh-market":["allowRestart"],"dsh-better-sidebar":["*"]};function Zi(e,t){let n=AO[e];return n===void 0?!1:n.includes("*")||n.includes(t)}function md(e){return CO[e]??e}function OO(e,t){let n=e.find(r=>r.ns==="llm-pi-ai")?.value,a=Object.keys(n?.providers??{}),i={};for(let r of a)i[r]=[...new Set((n?.providers?.[r]?.models??[]).map(o=>o.id??o.name??"").filter(Boolean))];return{"agent-default-model":{provider:a,model:i},"subagent-model":{provider:a,model:i},"agent-presets":{default:t.map(r=>r.id)}}}function gd(e,t){return e.refs[String(t)]??{type:"unknown"}}function _O(e,t){let n=[];for(let a of t.list??[]){let i=gd(e,a);i.type==="const"&&n.push({value:i.value,label:String(i.value)})}return n}function zO(e,t){let n=t.list??[];return n.length>0&&n.every(a=>gd(e,a).type==="const")}function DO({ns:e,field:t,node:n,value:a,options:i,ownerHint:r,onChange:o}){let s=Zi(e,t),l=pd(e,t),c=l?.title??t,f=l?.desc??n.meta?.description,v=(()=>{if(n.type==="boolean")return(0,oe.jsx)("button",{type:"button",role:"switch","aria-label":c,"aria-checked":a===!0,disabled:!s,className:`settings-switch${a===!0?" settings-switch-on":""}`,onClick:()=>{o(a!==!0)}});if(n.type==="number")return(0,oe.jsx)("input",{type:"number","aria-label":c,value:typeof a=="number"?String(a):"",disabled:!s,className:"settings-input",onChange:g=>{let h=g.target.value;if(h==="")return;let w=Number(h);o(Number.isFinite(w)?w:a)}});if(n.type==="string"){let g=i!==void 0&&i.length>0;return(0,oe.jsxs)(oe.Fragment,{children:[g&&(0,oe.jsx)("div",{className:"settings-optionStrip",role:"listbox","aria-label":`${c} 选项`,children:i.map(h=>(0,oe.jsx)("button",{type:"button",role:"option","aria-selected":a===h,className:`settings-optionChip${a===h?" settings-optionChip-on":""}`,onClick:()=>{o(h)},children:h},h))}),r!==void 0&&(0,oe.jsxs)("p",{className:"settings-ownerHint",children:["来自 ",r]}),(0,oe.jsx)("input",{type:"text","aria-label":c,value:typeof a=="string"?a:"",disabled:!s,placeholder:g?"或输入自定义值…":void 0,className:"settings-input",onChange:h=>{o(h.target.value)}})]})}if(n.type==="array"){let g=Array.isArray(a)?a.map(h=>String(h)).join(`
`):"";return(0,oe.jsx)("textarea",{"aria-label":c,value:g,disabled:!s,className:"settings-textarea",rows:3,onChange:h=>{let w=h.target.value.split(`
`).map(x=>x.trim()).filter(x=>x!=="");o(w)}})}return n.type==="secret"?(0,oe.jsx)("span",{className:"settings-readonly",children:a===!0?"已配置":"未配置"}):(0,oe.jsx)("span",{className:"settings-readonly",children:JSON.stringify(a)})})();return(0,oe.jsxs)("div",{className:"settings-field",children:[(0,oe.jsxs)("div",{className:"settings-fieldHead",children:[(0,oe.jsx)("span",{className:"settings-fieldLabel",children:c}),!s&&(0,oe.jsx)("span",{className:"settings-fieldLock",children:"桌面端修改"})]}),f!==void 0&&(0,oe.jsx)("p",{className:"settings-fieldDesc",children:f}),v]})}function mE({ns:e,envelope:t,node:n,value:a,fieldOptions:i,onChange:r}){let o=typeof a=="object"&&a!==null&&!Array.isArray(a)?a:{},s=Object.entries(n.dict??{}),l=s.filter(([f])=>Zi(e,f)),c=s.filter(([f])=>!Zi(e,f));return(0,oe.jsxs)(oe.Fragment,{children:[l.map(([f,v])=>{let g=gd(t,v),h=o[f];if(g.type==="object")return(0,oe.jsxs)("div",{className:"settings-subgroup",children:[(0,oe.jsx)("span",{className:"settings-subgroupTitle",children:pd(e,f)?.title??f}),(0,oe.jsx)(mE,{ns:e,envelope:t,node:g,value:h,fieldOptions:i,onChange:C=>{r({...o,[f]:C})}})]},f);if(g.type==="union"&&zO(t,g)){let C=_O(t,g);return(0,oe.jsxs)("div",{className:"settings-field",children:[(0,oe.jsx)("div",{className:"settings-fieldHead",children:(0,oe.jsx)("span",{className:"settings-fieldLabel",children:pd(e,f)?.title??f})}),(0,oe.jsx)("div",{className:"settings-themeOptions",children:C.map(p=>(0,oe.jsx)("button",{type:"button","aria-pressed":h===p.value,className:`settings-themeOption${h===p.value?" settings-themeOption-on":""}`,onClick:()=>{r({...o,[f]:p.value})},children:p.label},String(p.value)))})]},f)}let w=i[f],x=typeof w=="object"&&w!==null&&!Array.isArray(w)?w[String(o.provider)]??[]:Array.isArray(w)?w:[];return(0,oe.jsx)(DO,{ns:e,field:f,node:g,value:h,options:x,ownerHint:typeof w=="object"&&w!==null&&!Array.isArray(w)?String(o.provider):void 0,onChange:C=>{r({...o,[f]:C})}},f)}),c.length>0&&(0,oe.jsx)(gE,{ns:e,envelope:t,entries:c,record:o})]})}function IO(e){if(e===void 0)return"—";if(typeof e=="boolean")return e?"开":"关";if(typeof e=="string")return e===""?"（空）":e;if(typeof e=="number"||typeof e=="bigint")return String(e);if(Array.isArray(e))return e.length===0?"（空）":e.map(t=>String(t)).join(" · ");if(typeof e=="object"&&e!==null){let t=JSON.stringify(e);return t!==void 0&&t.length>60?`${t.slice(0,57)}…`:t??"—"}return String(e)}function gE({ns:e,envelope:t,entries:n,record:a}){let[i,r]=(0,ki.useState)(!1);return(0,oe.jsxs)("div",{className:"settings-roBlock",children:[(0,oe.jsxs)("button",{type:"button",className:"settings-roSummary","aria-expanded":i,onClick:()=>{r(o=>!o)},children:[(0,oe.jsxs)("span",{children:["只读配置（",n.length," 项）"]}),(0,oe.jsx)("span",{className:"settings-roToggle",children:i?"收起 ▴":"展开 ▾"})]}),i&&(0,oe.jsx)("div",{className:"settings-roList",children:n.map(([o,s])=>{let l=gd(t,s),c=a[o],v=pd(e,o)?.title??o,g=l.type==="secret"?c===!0?"已配置":"未配置":IO(c);return(0,oe.jsxs)("div",{className:"settings-roItem",children:[(0,oe.jsx)("span",{className:"settings-roKey",children:v}),(0,oe.jsx)("span",{className:"settings-roValue",children:g})]},o)})})]})}function hE({namespaces:e,allNamespaces:t,onBack:n,onOpenMarket:a}){let[i,r]=(0,ki.useState)(()=>{let p={};for(let m of e)p[m.ns]=m.value;return p}),[o,s]=(0,ki.useState)(!1),[l,c]=(0,ki.useState)(void 0),[f,v]=(0,ki.useState)(!1),[g,h]=(0,ki.useState)({});(0,ki.useEffect)(()=>{let p=!1,m=b=>{if(p)return;let y=OO(t,b),N={};for(let D of e){let O=y[D.ns];O!==void 0&&Object.assign(N,O)}h(N)};return Df().then(b=>{m(b.presets)},()=>{m([])}),()=>{p=!0}},[e,t]),(0,ki.useEffect)(()=>{let m=i["ui-theme"]?.preference;(m==="light"||m==="dark"||m==="system")&&Ff(m)},[i]);let w=()=>{if(f)return;let p=e.map(m=>({ns:m.ns,revision:m.revision,ops:Object.entries(i[m.ns]).filter(([b])=>Zi(m.ns,b)).map(([b,y])=>({op:"set",path:[b],value:y}))})).filter(m=>m.ops.length>0);p.length!==0&&(v(!0),c(void 0),s(!1),Promise.all(p.map(m=>Js(m.ns,m.ops,m.revision))).then(()=>{v(!1),s(!0)},m=>{v(!1),c(he(m))}))},x=e.some(p=>p.ns==="dsh-market"),C=e.reduce((p,m)=>p+Object.keys(m.value??{}).filter(b=>Zi(m.ns,b)).length,0);return(0,oe.jsxs)("div",{className:"mobile",children:[(0,oe.jsxs)("header",{className:"mobile-header",children:[(0,oe.jsx)("button",{type:"button",className:"mobile-back","aria-label":"返回",onClick:n,children:"‹"}),(0,oe.jsx)("h1",{className:"mobile-title mobile-titleInline",children:e.length===1?md(e[0].ns):"设置"})]}),(0,oe.jsxs)("div",{className:"mobile-scroll",children:[l!==void 0&&(0,oe.jsx)("p",{className:"mobile-error mobile-pad",role:"alert",children:l}),o&&(0,oe.jsx)("p",{className:"mobile-pad settings-saved",role:"status",children:"已保存"}),x&&a!==void 0&&(0,oe.jsx)("div",{className:"mobile-pad",children:(0,oe.jsx)("button",{type:"button",className:"mobile-button",onClick:a,children:"打开插件市场"})}),e.map(p=>{let m=p.schema,b=gd(m,m.uid),y=i[p.ns]??{},N=Object.keys(y).some(O=>Zi(p.ns,O)),D=Object.entries(b.dict??{}).filter(([O])=>!Zi(p.ns,O));return(0,oe.jsxs)("div",{className:"settings-card",children:[(0,oe.jsxs)("div",{className:"settings-cardHead",children:[(0,oe.jsx)("span",{className:"settings-cardTitle",children:md(p.ns)}),!N&&(0,oe.jsx)("span",{className:"settings-fieldLock",children:"只读"})]}),b.type==="object"&&N?(0,oe.jsx)(mE,{ns:p.ns,envelope:m,node:b,value:i[p.ns],fieldOptions:g,onChange:O=>{r(T=>({...T,[p.ns]:O}))}}):b.type==="object"&&D.length>0?(0,oe.jsx)(gE,{ns:p.ns,envelope:m,entries:D,record:y}):(0,oe.jsx)("span",{className:"settings-readonly",children:JSON.stringify(i[p.ns])})]},p.ns)}),C>0&&(0,oe.jsx)("div",{className:"mobile-pad",children:(0,oe.jsx)("button",{type:"button",className:"mobile-button",disabled:f,onClick:w,children:f?"保存中…":"保存"})})]})]})}var u=X(re(),1);function Da({scope:e}){let t=e==="phone"?"本机":e==="sync"?"同步桌面":e==="desktop"?"桌面端":e==="ro"?"只读":"推荐";return(0,u.jsx)("span",{className:`settings-badge settings-badge-${e}`,children:t})}function hd({configured:e}){return(0,u.jsx)("span",{className:`settings-channelState${e?" settings-channelState-on":""}`,children:e?"已配置 ✓（凭据存于电脑端）":"未配置"})}function qO(e,t){let n=Math.max(0,Math.round((t-e)/1e3));if(n<60)return`${String(n)} 秒前`;let a=Math.round(n/60);return a<60?`${String(a)} 分钟前`:`${String(Math.round(a/60))} 小时前`}function yE(e){let t=new Date(e),n=t.toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit",hour12:!1}),a=new Date;return t.getFullYear()===a.getFullYear()&&t.getMonth()===a.getMonth()&&t.getDate()===a.getDate()?n:`${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")} ${n}`}var bE=[{id:"general",title:"通用",namespaces:["ui-theme","locale","ui-conversation","ui-onboarding"]},{id:"models",title:"模型",namespaces:["llm-pi-ai","llm-deepseek","subagent-model","agent-default-model"]},{id:"search",title:"搜索",namespaces:["free-search","web-search-deepseek"]},{id:"memory",title:"记忆",namespaces:["mnemon","mnemon-ui"]},{id:"tools",title:"工具",namespaces:["at-file","tool-see-image","agent-loop"]},{id:"system",title:"系统",namespaces:["shell","permission"]},{id:"plugins",title:"插件",namespaces:["dsh-market","dsh-better-sidebar"]},{id:"remote",title:"远程访问",namespaces:["dsh-palm"]},{id:"presets",title:"Agent 预设",namespaces:["agent-presets"]}],LO=[{id:"notify-browser",label:"浏览器通知（启用）",group:"通知",keywords:["浏览器通知","通知权限","notify","enable"],open:"notify"},{id:"notify-kinds",label:"通知内容（三类事件开关）",group:"通知",keywords:["通知内容","规划完成","后台任务","长回复"],open:"notify"},{id:"notify-wxpusher",label:"推送渠道 · WxPusher SPT",group:"通知",keywords:["wxpusher","spt","微信推送","微信直达"],open:"notify"},{id:"notify-pushplus",label:"推送渠道 · PushPlus（已降级）",group:"通知",keywords:["pushplus","token","微信直达","已降级"],open:"notify"},{id:"notify-serverchan",label:"推送渠道 · Server酱 SendKey",group:"通知",keywords:["serverchan","sendkey","server酱","sct"],open:"notify"},{id:"notify-bark",label:"推送渠道 · Bark Key",group:"通知",keywords:["bark","bark key","ios 直达"],open:"notify"},{id:"notify-tg",label:"推送渠道 · Telegram",group:"通知",keywords:["telegram","bot token","chat id","tg"],open:"notify"},{id:"notify-webpush",label:"Web Push（系统推送）",group:"通知",keywords:["web push","系统推送","fcm","代理"],open:"notify"},{id:"notify-triggers",label:"触发条件（阈值与间隔）",group:"通知",keywords:["触发条件","阈值","间隔","cooldown"],open:"notify"},{id:"notify-privacy",label:"隐私（锁屏隐藏详情）",group:"通知",keywords:["隐私","锁屏隐藏","隐藏详情"],open:"notify"},{id:"voice-add",label:"语音 · 添加/编辑转写服务",group:"语音",keywords:["添加服务","语音服务","transcribe","转写","baseurl"],open:"voice"},{id:"voice-list",label:"语音 · 服务列表管理",group:"语音",keywords:["语音列表","排序","上移","下移","删除服务"],open:"voice"}];function qa({icon:e,title:t,desc:n,action:a,onClick:i,locateId:r,focused:o}){let s=(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)("span",{className:"card-icon",children:(0,u.jsx)("span",{"aria-hidden":!0,children:e})}),(0,u.jsxs)("span",{className:"card-main",children:[(0,u.jsx)("span",{className:"card-title",children:(0,u.jsx)("span",{className:"card-titleText",children:t})}),n!==void 0&&(0,u.jsx)("span",{className:"card-desc",children:n})]}),(0,u.jsx)("span",{className:"card-action",children:a})]}),l=r===void 0?{}:{"data-locate-id":r},c="settings-row"+(o===!0?" settings-focus":"");return i===void 0?(0,u.jsx)("li",{className:c,...l,children:s}):(0,u.jsx)("li",{children:(0,u.jsx)("button",{type:"button",className:c,onClick:i,...l,children:s})})}function Ia(){return(0,u.jsx)("span",{className:"mobile-chevron","aria-hidden":!0,children:"›"})}function Cv({title:e,options:t,value:n,onPick:a,onClose:i}){return(0,u.jsx)(ht,{title:e,onClose:i,children:(0,u.jsx)("div",{role:"listbox","aria-label":e,children:t.map(r=>(0,u.jsxs)("button",{type:"button",role:"option","aria-selected":r.value===n,className:`sheet-option${r.value===n?" sheet-option-selected":""}`,onClick:()=>{a(r.value),i()},children:[(0,u.jsx)("span",{className:"sheet-option-copy",children:(0,u.jsx)("span",{className:"sheet-option-title",children:r.label})}),r.value===n&&(0,u.jsx)("span",{className:"sheet-option-check","aria-hidden":!0,children:"✓"})]},r.value))})})}async function HO(){try{if(typeof caches<"u"){let e=await caches.keys();await Promise.all(e.map(t=>caches.delete(t)))}if(typeof navigator<"u"&&navigator.serviceWorker!==void 0){let e=await navigator.serviceWorker.getRegistrations();await Promise.all(e.map(t=>t.unregister()))}Q("缓存已清除")}catch{Q("清除缓存失败")}}function Av({icon:e,title:t,desc:n,value:a,onChange:i}){return(0,u.jsx)(qa,{icon:e,title:t,desc:n,action:(0,u.jsx)("button",{type:"button",role:"switch","aria-label":t,"aria-checked":a,className:`settings-switch${a?" settings-switch-on":""}`,onClick:()=>{i(!a)}})})}function VO(e){let t=e.providers.filter(n=>n.status==="ok");return t.length===0?`已配置 ${e.providers.length} 个提供方`:t.slice(0,3).map(n=>n.kind==="usage"&&n.usedPercent!==void 0?`${n.name} · 余量 ${Math.round((1-n.usedPercent)*100)}%`:n.summary!==void 0?`${n.name} · ${n.summary}`:n.kind==="balance"&&n.balance!==void 0?`${n.name} · ${n.balance}`:n.name).join(" · ")}function vE(e){if(e===void 0)return"窗口随请求持续滑动，无固定重置时刻";let t=new Date(e),n=a=>String(a).padStart(2,"0");return`重置于 ${n(t.getMonth()+1)}-${n(t.getDate())} ${n(t.getHours())}:${n(t.getMinutes())}`}function UO({provider:e}){if(e.status==="ok"){let t=e.kind==="usage"?e.plan??"可用":"余额";return(0,u.jsx)("span",{className:"usage-badge usage-badge-ok",children:t})}return e.status==="no-key"?(0,u.jsx)("span",{className:"usage-badge usage-badge-no",children:"未配置"}):e.status==="unsupported"?(0,u.jsx)("span",{className:"usage-badge usage-badge-na",children:"不支持"}):(0,u.jsx)("span",{className:"usage-badge usage-badge-err",children:"失败"})}function PO({provider:e}){let t=e.baseURL!==void 0?(()=>{try{return new URL(e.baseURL).hostname}catch{return e.baseURL}})():void 0;return(0,u.jsxs)("div",{className:"usage-provider",children:[(0,u.jsxs)("div",{className:"usage-providerHead",children:[(0,u.jsxs)("span",{className:"usage-providerName",children:[e.name,t!==void 0&&(0,u.jsx)("span",{className:"usage-providerBase",children:t})]}),(0,u.jsx)(UO,{provider:e})]}),e.status==="ok"&&e.kind==="usage"&&e.usedPercent!==void 0&&(0,u.jsxs)(u.Fragment,{children:[e.sessionUsed!==void 0&&(0,u.jsxs)("div",{className:"usage-block",children:[(0,u.jsxs)("div",{className:"usage-row",children:[(0,u.jsx)("span",{className:"usage-rowLabel",children:"近 5 小时"}),(0,u.jsxs)("span",{className:"usage-rowValue",children:[(e.sessionUsed*100).toFixed(0),"%"]})]}),(0,u.jsx)("div",{className:"usage-meter",children:(0,u.jsx)("div",{className:"usage-meterFill",style:{width:`${(e.sessionUsed*100).toFixed(0)}%`}})}),(0,u.jsx)("p",{className:"usage-resetNote",children:vE(e.sessionResetsAt)})]}),(0,u.jsxs)("div",{className:"usage-block",children:[(0,u.jsxs)("div",{className:"usage-row",children:[(0,u.jsx)("span",{className:"usage-rowLabel",children:"本周"}),(0,u.jsxs)("span",{className:"usage-rowValue",children:[(e.usedPercent*100).toFixed(1),"% · 余 ",((1-e.usedPercent)*100).toFixed(1),"%"]})]}),(0,u.jsx)("div",{className:"usage-meter",children:(0,u.jsx)("div",{className:"usage-meterFill",style:{width:`${(e.usedPercent*100).toFixed(0)}%`}})}),(0,u.jsx)("p",{className:"usage-resetNote",children:vE(e.weeklyResetsAt)})]})]}),e.status==="ok"&&e.kind==="usage"&&e.summary!==void 0&&(0,u.jsxs)("div",{className:"usage-stats",children:[(0,u.jsx)("span",{children:(0,u.jsx)("b",{children:e.summary})}),(0,u.jsx)("span",{})]}),e.status==="ok"&&e.kind==="balance"&&(0,u.jsxs)("div",{className:"usage-stats",children:[(0,u.jsxs)("span",{children:["充值余额 ",(0,u.jsx)("b",{children:e.balance??"—"})]}),(0,u.jsx)("span",{})]}),e.status==="no-key"&&(0,u.jsx)("p",{className:"settings-note",children:"桌面端未配置 API Key，已按用量计费无法查询"}),e.status==="unsupported"&&(0,u.jsx)("p",{className:"settings-note",children:"该提供方无公开余额/用量接口"}),e.status==="error"&&(0,u.jsx)("p",{className:"settings-note",children:"用量查询失败，请稍后重试"}),e.models!==void 0&&e.models.length>0&&(0,u.jsx)("div",{className:"usage-models",children:e.models.map(n=>(0,u.jsxs)("div",{className:"usage-model",children:[(0,u.jsx)("span",{className:"usage-modelName",children:n.name}),(0,u.jsxs)("span",{className:"usage-modelCount",children:[n.requestCount.toLocaleString()," 次"]})]},n.name))})]})}function BO({onBack:e}){let[t,n]=(0,ee.useState)(void 0),[a,i]=(0,ee.useState)(4),[r,o]=(0,ee.useState)(void 0),[s,l]=(0,ee.useState)(!1),[c,f]=(0,ee.useState)(void 0),[v,g]=(0,ee.useState)(void 0),h=()=>{l(!0),ak().then(m=>{n(m.devices),i(m.maxDevices),o(void 0),l(!1)},m=>{o(he(m)),l(!1)})};(0,ee.useEffect)(()=>{h()},[]);let w=m=>{let b=c;f(void 0),b!==void 0&&rk(b.id,m).then(()=>{h(),Q("已重命名")},y=>{Q(he(y))})},x=m=>{ok(m.id).then(()=>{h(),Q("已设为主设备")},b=>{Q(he(b))})},C=()=>{let m=v;g(void 0),m!==void 0&&ik(m.id).then(()=>{h(),Q("已移除该设备")},b=>{Q(he(b))})},p=m=>m.name!==void 0&&m.name!==""?m.name:"未命名设备";return(0,u.jsxs)("div",{className:"mobile",children:[(0,u.jsxs)("header",{className:"mobile-header",children:[(0,u.jsx)("div",{className:"mobile-headerSlot",children:(0,u.jsx)("button",{type:"button",className:"mobile-back","aria-label":"返回",onClick:e,children:"‹"})}),(0,u.jsx)("h1",{className:"mobile-title",children:"设备管理"}),(0,u.jsx)("div",{className:"mobile-headerSlot mobile-headerSlot-right"})]}),(0,u.jsxs)("div",{className:"mobile-scroll",children:[(0,u.jsxs)("p",{className:"settings-note",children:["已配对 ",t?.length??0," / ",a," 台设备。主设备不会被自动移除；设备数满时，闲置设备会先被淘汰，在线设备不会被挤掉。"]}),r!==void 0&&(0,u.jsx)("p",{className:"mobile-error",role:"alert",children:r}),t===void 0&&r===void 0&&(0,u.jsx)("p",{className:"settings-note",children:"加载中…"}),t!==void 0&&(0,u.jsxs)("div",{className:"settings-card",children:[t.length===0&&(0,u.jsx)("p",{className:"settings-note",children:"暂无已配对设备。"}),t.map(m=>(0,u.jsxs)("div",{className:"device-row",children:[(0,u.jsxs)("span",{className:"device-copy",children:[(0,u.jsxs)("span",{className:"device-name",children:[p(m),m.primary===!0&&(0,u.jsx)("span",{className:"device-badge device-badge-primary",children:"主设备"}),m.current===!0&&(0,u.jsx)("span",{className:"device-badge device-badge-current",children:"本机"})]}),(0,u.jsxs)("span",{className:"device-desc",children:[(0,u.jsx)("span",{className:`device-status${m.online?" device-status-on":""}`,children:m.online?"在线":"闲置"})," · ",yE(m.lastSeenAt),m.userAgent!==void 0&&(0,u.jsxs)("span",{className:"device-ua",children:[" · ",m.userAgent.slice(0,40)]})]})]}),(0,u.jsxs)("span",{className:"device-actions",children:[(0,u.jsx)("button",{type:"button",className:"device-btn","aria-label":"重命名",onClick:()=>{f(m)},children:(0,u.jsx)(Jc,{})}),m.primary!==!0&&(0,u.jsx)("button",{type:"button",className:"device-btn","aria-label":"设为主设备",disabled:s,onClick:()=>{x(m)},children:(0,u.jsx)($c,{})}),m.current!==!0&&(0,u.jsx)("button",{type:"button",className:"device-btn device-btn-danger","aria-label":"移除设备",disabled:s,onClick:()=>{g(m)},children:(0,u.jsx)(ap,{})})]})]},m.id))]})]}),c!==void 0&&(0,u.jsx)(Uo,{title:"重命名设备",initial:c.name??"",confirmLabel:"保存",onCancel:()=>{f(void 0)},onConfirm:w}),v!==void 0&&(0,u.jsx)(Si,{title:"移除设备？",body:`移除「${p(v)}」后，该设备将无法再访问此电脑，需重新配对。`,confirmLabel:"移除",tone:"danger",onCancel:()=>{g(void 0)},onConfirm:C})]})}function xE({onBack:e}){let[t,n]=(0,ee.useState)(void 0),[a,i]=(0,ee.useState)(void 0),[r,o]=(0,ee.useState)(void 0),[s,l]=(0,ee.useState)(!1),c=(0,ee.useSyncExternalStore)(Qf,lN),[f,v]=(0,ee.useState)(()=>Tb()),[g,h]=(0,ee.useState)(()=>Eb()),[w,x]=(0,ee.useState)(()=>Mb()),[C,p]=(0,ee.useState)(()=>jf()),[m,b]=(0,ee.useState)(()=>Rb()),[y,N]=(0,ee.useState)(null),[D,O]=(0,ee.useState)(!1),[T,q]=(0,ee.useState)(()=>sd()),[$,F]=(0,ee.useState)(null),[Ie,at]=(0,ee.useState)(void 0),[Te,je]=(0,ee.useState)(""),[Je,Kt]=(0,ee.useState)(""),[xe,_t]=(0,ee.useState)(""),[$e,Ut]=(0,ee.useState)(""),[ze,He]=(0,ee.useState)([]),[Ft,kt]=(0,ee.useState)(!1),[Gn,Nt]=(0,ee.useState)(!1),[ut,bt]=(0,ee.useState)(!1),[j,Z]=(0,ee.useState)(()=>Wk()),[ce,Ee]=(0,ee.useState)(void 0),[Ae,Me]=(0,ee.useState)(!1),[Yn,vt]=(0,ee.useState)(""),[fa,Xn]=(0,ee.useState)(""),[yn,yt]=(0,ee.useState)(""),[zn,pa]=(0,ee.useState)(""),[At,nn]=(0,ee.useState)(""),[fn,ma]=(0,ee.useState)(""),[xn,wn]=(0,ee.useState)(void 0),[Pt,Ha]=(0,ee.useState)(void 0),[Sn,Zt]=(0,ee.useState)(!1),[H,Y]=(0,ee.useState)(!1),se=Pt===void 0?void 0:{...Pt,providers:Pt.providers.filter(E=>E.status!=="unsupported")},[ke,Tt]=(0,ee.useState)("30"),[Et,Bt]=(0,ee.useState)("2"),[Qn,Kn]=(0,ee.useState)([]),[Va,Dn]=(0,ee.useState)(!1),[Ji,kn]=(0,ee.useState)(!1),[an,Fr]=(0,ee.useState)({jobs:!1,todo:!0,turns:!1}),[$i,Fn]=(0,ee.useState)(!1),[Zr,Ja]=(0,ee.useState)(!1),[V,ne]=(0,ee.useState)(void 0),[W,J]=(0,ee.useState)(void 0),[le,de]=(0,ee.useState)(!1);(0,ee.useEffect)(()=>i2(()=>q(sd())),[]),(0,ee.useEffect)(()=>{y==="about"&&Yo()},[y]),(0,ee.useEffect)(()=>{let E=!1;return Af().then(te=>{E||n(te.namespaces)},te=>{E||i(he(te))}),()=>{E=!0}},[]),(0,ee.useEffect)(()=>{let E=!1;return Oc().then(te=>{E||(Ee(te),Tt(String(Math.round(te.turnThresholdMs/1e3))),Bt(String(Math.round(te.turnCooldownMs/6e4))),kn(te.hideDetails===!0),Fr({jobs:te.kinds.jobs,todo:te.kinds.todo,turns:te.kinds.turns}))},()=>{}),()=>{E=!0}},[]),(0,ee.useEffect)(()=>{if(!Ft)return;let E=!1;return Dn(!0),DS().then(te=>{E||(Kn(te.items),Dn(!1))},()=>{E||(Kn([]),Dn(!1))}),()=>{E=!0}},[Ft]),(0,ee.useEffect)(()=>{let E=!1;return tN().then(te=>{E||wn(te!==void 0)},()=>{E||wn(!1)}),()=>{E=!0}},[]),(0,ee.useEffect)(()=>{let E=!1;return ub().then(te=>{E||Ha(te)},()=>{}),()=>{E=!0}},[]);let[ft,Ge]=(0,ee.useState)(""),xt=ft.trim().toLowerCase(),Ve=(...E)=>xt===""||E.some(te=>te!==void 0&&te.toLowerCase().includes(xt)),[ga,zt]=(0,ee.useState)(void 0),Jr=xt===""?[]:LO.filter(E=>E.label.toLowerCase().includes(xt)||E.keywords.some(te=>te.toLowerCase().includes(xt))),In=E=>ga===E?{"data-locate-id":E,"data-focus":""}:{"data-locate-id":E};(0,ee.useEffect)(()=>{if(ga===void 0)return;let E=requestAnimationFrame(()=>{document.querySelector(`[data-locate-id="${ga}"]`)?.scrollIntoView({block:"center"})});return()=>cancelAnimationFrame(E)},[ga,Ft,Gn]);let jt=nl()?j==="granted"?"已授权，任务完成时提醒":j==="denied"?"权限被拒绝，请在浏览器设置中开启":"点击授权，任务完成时提醒":"当前浏览器不支持通知",Wi=c==="dark"?"深色":c==="light"?"浅色":"跟随系统",qp=async()=>{if(!nl()){Q("当前浏览器不支持通知");return}if(j==="granted"){Xc(),Q("通知已开启");return}if(j==="denied"){Q("通知权限被拒绝，请在浏览器设置中开启");return}Me(!0);try{let E=await eN();Z(E),E==="granted"&&(Xc(),Q("通知已开启"))}finally{Me(!1)}},er=async()=>{let E=Yn.trim()+fa.trim()+yn.trim()+zn.trim()+At.trim()+fn.trim(),te=ce?.channels,pn=te!==void 0&&(te.serverchan.configured||te.bark.configured||te.telegram.configured||te.wxpusher.configured||te.pushplus.configured);if(E===""&&pn){Fn(!0);return}await vd()},vd=async()=>{Me(!0);try{await _c({channels:{serverchan:{sendKey:Yn.trim()},bark:{key:fa.trim()},telegram:{botToken:yn.trim(),chatId:zn.trim()},wxpusher:{spt:At.trim()},pushplus:{token:fn.trim()}}});let E=await Oc();Ee(E),Q("渠道已保存")}catch(E){Q(he(E))}finally{Me(!1)}},ul=async()=>{Me(!0);try{await OS(),Q("测试通知已发送")}catch(E){Q(he(E))}finally{Me(!1)}},Lp=async E=>{Me(!0);try{if(E){if(!await nN()){Q("当前浏览器不支持 Web Push，或通知权限未开启");return}Q("Web Push 已开启")}else await aN(),Q("Web Push 已关闭");wn(E)}catch(te){E?Q("Web Push 注册失败：推送服务（FCM）在大陆网络不可直连。请开启代理后重试，或改用下方「推送渠道」接收通知（如 ServerChan 微信推送）。"):Q(he(te))}finally{Me(!1)}},tr=async E=>{Me(!0);try{await _c({hideDetails:E}),kn(E),Q(E?"通知详情已隐藏":"通知详情已显示")}catch(te){Q(he(te))}finally{Me(!1)}},fl=async(E,te)=>{Me(!0);let pn={...an,[E]:te};try{await _c({kinds:pn}),Fr(pn)}catch(pl){Q(he(pl))}finally{Me(!1)}},Go=async()=>{Ja(!0);try{let{latest:E,isNewer:te}=await IS();ne(te?`发现新版本 ${E} —— 可在桌面端 dsh 升级插件`:`已是最新版本（${Op.version}）`)}catch{ne("检查失败，请稍后重试")}finally{Ja(!1)}},Yo=async()=>{de(!0);try{J(await LS())}catch{J(void 0)}finally{de(!1)}},yd=async()=>{let E=Number(ke),te=Number(Et);if(!Number.isFinite(E)||E<0||!Number.isFinite(te)||te<0){Q("请输入有效的数值");return}Me(!0);try{await _c({turnThresholdMs:Math.round(E*1e3),turnCooldownMs:Math.round(te*6e4)}),Ee(pn=>pn===void 0?pn:{...pn,turnThresholdMs:Math.round(E*1e3),turnCooldownMs:Math.round(te*6e4)}),Q("已保存")}catch(pn){Q(he(pn))}finally{Me(!1)}};if(s)return(0,u.jsx)(pE,{onBack:()=>{l(!1)}});if(Gn)return(0,u.jsxs)("div",{className:"mobile",children:[(0,u.jsxs)("header",{className:"mobile-header",children:[(0,u.jsx)("div",{className:"mobile-headerSlot",children:(0,u.jsx)("button",{type:"button",className:"mobile-back","aria-label":"返回",onClick:()=>{Nt(!1)},children:"‹"})}),(0,u.jsx)("h1",{className:"mobile-title",children:"语音服务"}),(0,u.jsx)("div",{className:"mobile-headerSlot mobile-headerSlot-right"})]}),(0,u.jsxs)("div",{className:"mobile-scroll",children:[(0,u.jsx)("p",{className:"settings-note",children:"语音转写按列表顺序尝试，失败自动回退到下一个服务。"}),ze.length>0&&(0,u.jsxs)("p",{className:"settings-hostNote",children:["✓ 桌面端已配置 ",ze.length," 个转写服务，手机语音输入将自动使用，无需重复配置。"]}),ze.length>0&&(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)("div",{className:"settings-subhead",children:"桌面端配置（只读）"}),(0,u.jsx)("div",{className:"settings-card",children:ze.map(E=>(0,u.jsx)("div",{className:"voice-service-row",children:(0,u.jsxs)("span",{className:"voice-service-copy",children:[(0,u.jsxs)("span",{className:"voice-service-name",children:[E.name," ",(0,u.jsx)("span",{className:"settings-roTag",children:"桌面端"})]}),(0,u.jsxs)("span",{className:"voice-service-desc",children:[E.model," · ",E.baseURL]})]})},E.name))})]}),(0,u.jsx)("div",{className:"settings-subhead",children:"手机端服务"}),(0,u.jsxs)("div",{className:"settings-card",...In("voice-list"),children:[T.length===0&&(0,u.jsx)("p",{className:"settings-note",children:"尚未配置服务 — 点击下方「添加服务」。"}),T.map((E,te)=>(0,u.jsxs)("div",{className:"voice-service-row",children:[(0,u.jsxs)("span",{className:"voice-service-copy",children:[(0,u.jsx)("span",{className:"voice-service-name",children:E.name!==""?E.name:E.model}),(0,u.jsxs)("span",{className:"voice-service-desc",children:[E.model," · ",E.baseURL]})]}),(0,u.jsxs)("span",{className:"voice-service-actions",children:[(0,u.jsx)("button",{type:"button",className:"voice-service-btn","aria-label":"上移",disabled:te===0,onClick:()=>{t2(E.id)},children:(0,u.jsx)(Zc,{})}),(0,u.jsx)("button",{type:"button",className:"voice-service-btn voice-service-btn-down","aria-label":"下移",disabled:te===T.length-1,onClick:()=>{n2(E.id)},children:(0,u.jsx)(Zc,{})}),(0,u.jsx)("button",{type:"button",className:"voice-service-btn","aria-label":"编辑",onClick:()=>{at(E),je(E.name),Kt(E.baseURL),_t(E.apiKey),Ut(E.model),F("form")},children:(0,u.jsx)(Jc,{})}),(0,u.jsx)("button",{type:"button",className:"voice-service-btn voice-service-btn-danger","aria-label":"删除",onClick:()=>{e2(E.id)},children:(0,u.jsx)(ap,{})})]})]},E.id))]}),(0,u.jsx)("div",{className:"sheet-confirm-actions",...In("voice-add"),children:(0,u.jsxs)("button",{type:"button",className:"mobile-button",onClick:()=>{at(void 0),je(""),Kt(""),_t(""),Ut(""),F("form")},children:[(0,u.jsx)(ll,{})," 添加服务"]})})]}),$==="form"&&(0,u.jsx)(ht,{title:Ie===void 0?"添加服务":"编辑服务",onClose:()=>{F(null)},children:(0,u.jsxs)("div",{className:"voice-form",children:[(0,u.jsxs)("label",{className:"voice-form-field",children:[(0,u.jsx)("span",{className:"voice-form-label",children:"名称"}),(0,u.jsx)("input",{className:"voice-form-input",value:Te,placeholder:"如：硅基流动",onChange:E=>{je(E.target.value)}})]}),(0,u.jsxs)("label",{className:"voice-form-field",children:[(0,u.jsx)("span",{className:"voice-form-label",children:"API 地址（baseURL）"}),(0,u.jsx)("input",{className:"voice-form-input",value:Je,placeholder:"https://api.siliconflow.cn/v1",inputMode:"url",autoCapitalize:"none",autoCorrect:"off",spellCheck:!1,onChange:E=>{Kt(E.target.value)}})]}),(0,u.jsxs)("label",{className:"voice-form-field",children:[(0,u.jsx)("span",{className:"voice-form-label",children:"API Key"}),(0,u.jsx)("input",{className:"voice-form-input",value:xe,placeholder:"sk-…",type:"password",autoCapitalize:"none",autoCorrect:"off",spellCheck:!1,onChange:E=>{_t(E.target.value)}})]}),(0,u.jsxs)("label",{className:"voice-form-field",children:[(0,u.jsx)("span",{className:"voice-form-label",children:"模型"}),(0,u.jsx)("input",{className:"voice-form-input",value:$e,placeholder:"FunAudioLLM/SenseVoiceSmall",autoCapitalize:"none",autoCorrect:"off",spellCheck:!1,onChange:E=>{Ut(E.target.value)}})]}),(0,u.jsx)("p",{className:"sheet-note",children:"支持任意 OpenAI 兼容的 /audio/transcriptions 服务。"}),(0,u.jsxs)("div",{className:"sheet-confirm-actions",children:[(0,u.jsx)("button",{type:"button",className:"mobile-button",onClick:()=>{F(null)},children:"取消"}),(0,u.jsx)("button",{type:"button",className:"mobile-button mobile-button-primary",disabled:Je.trim()===""||xe.trim()===""||$e.trim()==="",onClick:()=>{WT({id:Ie?.id??(typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():`svc-${Date.now()}`),name:Te.trim(),baseURL:Je.trim(),apiKey:xe.trim(),model:$e.trim()}),F(null)},children:"保存"})]})]})})]});if(Ft)return(0,u.jsxs)("div",{className:"mobile",children:[(0,u.jsxs)("header",{className:"mobile-header",children:[(0,u.jsx)("div",{className:"mobile-headerSlot",children:(0,u.jsx)("button",{type:"button",className:"mobile-back","aria-label":"返回",onClick:()=>{kt(!1)},children:"‹"})}),(0,u.jsx)("h1",{className:"mobile-title",children:"通知"}),(0,u.jsx)("div",{className:"mobile-headerSlot mobile-headerSlot-right"})]}),(0,u.jsxs)("div",{className:"mobile-scroll",children:[(0,u.jsxs)("div",{className:"settings-card",children:[(0,u.jsx)("div",{className:"settings-cardHead",children:(0,u.jsx)("span",{className:"settings-cardTitle",children:"该开哪个？"})}),(0,u.jsx)("p",{className:"settings-note",children:"任务完成提醒有三条通道，从上到下生效范围越来越广："}),(0,u.jsx)("div",{className:"settings-field",children:(0,u.jsxs)("p",{className:"settings-fieldDesc",children:[(0,u.jsx)("b",{children:"① 浏览器通知"}),"：页面打开时弹提醒。必开，无需配置。",(0,u.jsx)("br",{}),(0,u.jsx)("b",{children:"② 推送渠道"}),"：页面关闭也能收，微信/iOS 直达、国内可靠。推荐任填一个（WxPusher 或 Server酱）。",(0,u.jsx)("br",{}),(0,u.jsx)("b",{children:"③ Web Push"}),"：系统级推送，但服务（FCM）在大陆不可直连，需代理才可用。大陆用户可不开。"]})})]}),(0,u.jsxs)("div",{className:"settings-card",children:[(0,u.jsx)("div",{className:"settings-cardHead",children:(0,u.jsx)("span",{className:"settings-cardTitle",children:"最近通知"})}),Va?(0,u.jsx)("p",{className:"settings-note",children:"加载中…"}):Qn.length===0?(0,u.jsx)("p",{className:"settings-note",children:"暂无通知——任务完成或长回复结束时，这里会留下记录可回看。"}):(0,u.jsx)("div",{className:"settings-inbox",children:Qn.slice(0,20).map(E=>(0,u.jsxs)("button",{type:"button",className:"settings-inboxRow",disabled:E.workspaceId===void 0,onClick:()=>{let te=new URL(window.location.href);te.searchParams.set("workspace",E.workspaceId??""),te.searchParams.set("session",E.sessionId),window.location.href=`${te.pathname}${te.search}`},children:[(0,u.jsxs)("span",{className:"settings-inboxLine",children:[(0,u.jsx)("span",{className:`settings-inboxKind settings-inboxKind-${E.kind}`,children:E.kind==="task-done"?"完成":E.kind==="task-failed"?"失败":E.kind==="todo-done"?"规划":"回复"}),(0,u.jsx)("span",{className:"settings-inboxTitle",children:E.title}),(0,u.jsx)("span",{className:"settings-inboxTime",children:yE(E.ts)})]}),(0,u.jsx)("span",{className:"card-desc",children:E.body})]},E.id))})]}),(0,u.jsxs)("div",{className:"settings-card",...In("notify-browser"),children:[(0,u.jsxs)("div",{className:"settings-cardHead",children:[(0,u.jsx)("span",{className:"settings-cardTitle",children:"浏览器通知"}),(0,u.jsx)(Da,{scope:"sync"})]}),(0,u.jsxs)("div",{className:"settings-field",children:[(0,u.jsx)("div",{className:"settings-fieldHead",children:(0,u.jsx)("span",{className:"settings-fieldLabel",children:"启用"})}),(0,u.jsx)("button",{type:"button",role:"switch","aria-label":"浏览器通知","aria-checked":j==="granted",className:`settings-switch${j==="granted"?" settings-switch-on":""}`,disabled:Ae,onClick:()=>{qp()}}),(0,u.jsx)("p",{className:"settings-fieldDesc",children:jt})]})]}),ce!==void 0&&(0,u.jsxs)("div",{className:"settings-card",...In("notify-kinds"),children:[(0,u.jsxs)("div",{className:"settings-cardHead",children:[(0,u.jsx)("span",{className:"settings-cardTitle",children:"通知内容"}),(0,u.jsx)(Da,{scope:"sync"})]}),(0,u.jsxs)("div",{className:"settings-field",children:[(0,u.jsx)("div",{className:"settings-fieldHead",children:(0,u.jsx)("span",{className:"settings-fieldLabel",children:"规划完成"})}),(0,u.jsx)("button",{type:"button",role:"switch","aria-label":"规划完成","aria-checked":an.todo,className:`settings-switch${an.todo?" settings-switch-on":""}`,disabled:Ae,onClick:()=>{fl("todo",!an.todo)}}),(0,u.jsx)("p",{className:"settings-fieldDesc",children:"任务规划全部完成时通知（推荐开启）"})]}),(0,u.jsxs)("div",{className:"settings-field",children:[(0,u.jsx)("div",{className:"settings-fieldHead",children:(0,u.jsx)("span",{className:"settings-fieldLabel",children:"后台任务"})}),(0,u.jsx)("button",{type:"button",role:"switch","aria-label":"后台任务","aria-checked":an.jobs,className:`settings-switch${an.jobs?" settings-switch-on":""}`,disabled:Ae,onClick:()=>{fl("jobs",!an.jobs)}}),(0,u.jsx)("p",{className:"settings-fieldDesc",children:"每个命令 / 子任务完成或失败都会提醒，容易打扰（默认关闭）"})]}),(0,u.jsxs)("div",{className:"settings-field",children:[(0,u.jsx)("div",{className:"settings-fieldHead",children:(0,u.jsx)("span",{className:"settings-fieldLabel",children:"长回复"})}),(0,u.jsx)("button",{type:"button",role:"switch","aria-label":"长回复","aria-checked":an.turns,className:`settings-switch${an.turns?" settings-switch-on":""}`,disabled:Ae,onClick:()=>{fl("turns",!an.turns)}}),(0,u.jsx)("p",{className:"settings-fieldDesc",children:"超过时长阈值的回复完成时提醒（默认关闭）"})]})]}),(0,u.jsxs)("div",{className:"settings-card",...In("notify-wxpusher"),children:[(0,u.jsxs)("div",{className:"settings-cardHead",children:[(0,u.jsx)("span",{className:"settings-cardTitle",children:"推送渠道"}),(0,u.jsx)(Da,{scope:"sync"})]}),(0,u.jsx)("p",{className:"settings-note",children:"页面关闭时也能收到，通过第三方应用直达（微信 / iOS / Telegram）。国内网络可用，任选其一即可；留空保存将清除该渠道。"}),(0,u.jsxs)("div",{className:"settings-field",children:[(0,u.jsxs)("div",{className:"settings-fieldHead",children:[(0,u.jsx)("span",{className:"settings-fieldLabel",children:"WxPusher SPT"}),(0,u.jsx)(Da,{scope:"recommend"})]}),(0,u.jsx)("input",{type:"text",className:"settings-input",value:At,placeholder:"SPT_…",autoCapitalize:"none",autoCorrect:"off",spellCheck:!1,onChange:E=>{nn(E.target.value)}}),(0,u.jsxs)("p",{className:"settings-fieldDesc",children:["微信直达 · 免费 · 国内直连。推荐首选。 ",(0,u.jsx)(hd,{configured:ce?.channels.wxpusher.configured===!0})]}),(0,u.jsxs)("details",{className:"settings-details",children:[(0,u.jsx)("summary",{children:"如何获取 SPT（2 步）"}),(0,u.jsxs)("div",{className:"settings-detailsBody",children:["1. 打开 wxpusher.zjiecode.com/docs 的「极简推送 SPT」一节，手机微信扫码",(0,u.jsx)("br",{}),"2. 复制 SPT_ 开头的令牌，粘贴到上方并保存"]})]})]}),(0,u.jsxs)("div",{className:"settings-field",...In("notify-serverchan"),children:[(0,u.jsx)("div",{className:"settings-fieldHead",children:(0,u.jsx)("span",{className:"settings-fieldLabel",children:"Server酱 SendKey"})}),(0,u.jsx)("input",{type:"text",className:"settings-input",value:Yn,placeholder:"SCT…",autoCapitalize:"none",autoCorrect:"off",spellCheck:!1,onChange:E=>{vt(E.target.value)}}),(0,u.jsxs)("p",{className:"settings-fieldDesc",children:["微信直达 · 国内直连（免费版每日条数有限）。 ",(0,u.jsx)(hd,{configured:ce?.channels.serverchan.configured===!0})]})]}),(0,u.jsxs)("div",{className:"settings-field",...In("notify-bark"),children:[(0,u.jsx)("div",{className:"settings-fieldHead",children:(0,u.jsx)("span",{className:"settings-fieldLabel",children:"Bark Key"})}),(0,u.jsx)("input",{type:"text",className:"settings-input",value:fa,placeholder:"…",autoCapitalize:"none",autoCorrect:"off",spellCheck:!1,onChange:E=>{Xn(E.target.value)}}),(0,u.jsxs)("p",{className:"settings-fieldDesc",children:["iOS 直达：iPhone / iPad 装 Bark 应用后获取 Key。 ",(0,u.jsx)(hd,{configured:ce?.channels.bark.configured===!0})]})]}),(0,u.jsxs)("div",{className:"settings-field",...In("notify-tg"),children:[(0,u.jsx)("div",{className:"settings-fieldHead",children:(0,u.jsx)("span",{className:"settings-fieldLabel",children:"Telegram Bot Token"})}),(0,u.jsx)("input",{type:"text",className:"settings-input",value:yn,placeholder:"123456:ABC…",autoCapitalize:"none",autoCorrect:"off",spellCheck:!1,onChange:E=>{yt(E.target.value)}})]}),(0,u.jsxs)("div",{className:"settings-field",children:[(0,u.jsx)("div",{className:"settings-fieldHead",children:(0,u.jsx)("span",{className:"settings-fieldLabel",children:"Telegram Chat ID"})}),(0,u.jsx)("input",{type:"text",className:"settings-input",value:zn,placeholder:"…",autoCapitalize:"none",autoCorrect:"off",spellCheck:!1,onChange:E=>{pa(E.target.value)}}),(0,u.jsxs)("p",{className:"settings-fieldDesc",children:["Telegram 需要能访问境外网络。 ",(0,u.jsx)(hd,{configured:ce?.channels.telegram.configured===!0})]})]}),(0,u.jsxs)("div",{className:"settings-field",...In("notify-pushplus"),children:[(0,u.jsx)("div",{className:"settings-fieldHead",children:(0,u.jsx)("span",{className:"settings-fieldLabel",children:"PushPlus Token（已降级）"})}),(0,u.jsx)("input",{type:"text",className:"settings-input",value:fn,placeholder:"…（到 pushplus.plus 复制）",autoCapitalize:"none",autoCorrect:"off",spellCheck:!1,onChange:E=>{ma(E.target.value)}}),(0,u.jsxs)("p",{className:"settings-fieldDesc",children:["微信直达 · 国内直连。pushplus 现已要求付费认证，故降级为兼容保留（旧 Token 仍可发）；新配置请用上方 WxPusher。 ",(0,u.jsx)(hd,{configured:ce?.channels.pushplus.configured===!0})]})]}),(0,u.jsxs)("div",{className:"sheet-confirm-actions",children:[(0,u.jsx)("button",{type:"button",className:"mobile-button",disabled:Ae,onClick:()=>{ul()},children:"发送测试"}),(0,u.jsx)("button",{type:"button",className:"mobile-button mobile-button-primary","aria-label":"保存推送渠道",disabled:Ae,onClick:()=>{er()},children:"保存"})]})]}),Yc()&&(0,u.jsxs)("div",{className:"settings-card",...In("notify-webpush"),children:[(0,u.jsxs)("div",{className:"settings-cardHead",children:[(0,u.jsx)("span",{className:"settings-cardTitle",children:"Web Push"}),(0,u.jsx)(Da,{scope:"sync"})]}),(0,u.jsxs)("div",{className:"settings-field",children:[(0,u.jsx)("div",{className:"settings-fieldHead",children:(0,u.jsx)("span",{className:"settings-fieldLabel",children:"启用"})}),(0,u.jsx)("button",{type:"button",role:"switch","aria-label":"Web Push","aria-checked":xn===!0,className:`settings-switch${xn===!0?" settings-switch-on":""}`,disabled:Ae,onClick:()=>{Lp(xn!==!0)}}),(0,u.jsx)("p",{className:"settings-fieldDesc",children:"页面关闭时由浏览器系统推送。推送服务（FCM）在大陆网络不可直连，开启需要代理；大陆用户建议用上方「推送渠道」代替。"})]})]}),ce!==void 0&&(0,u.jsxs)("div",{className:"settings-card",...In("notify-triggers"),children:[(0,u.jsxs)("div",{className:"settings-cardHead",children:[(0,u.jsx)("span",{className:"settings-cardTitle",children:"触发条件（可选）"}),(0,u.jsx)(Da,{scope:"sync"})]}),(0,u.jsx)("p",{className:"settings-note",children:"默认：仅当回复耗时超过阈值时才提醒，避免被打断。"}),(0,u.jsxs)("div",{className:"settings-field",children:[(0,u.jsx)("div",{className:"settings-fieldHead",children:(0,u.jsx)("span",{className:"settings-fieldLabel",children:"回复时长阈值（秒）"})}),(0,u.jsx)("input",{type:"number",className:"settings-input","aria-label":"回复时长阈值",value:ke,onChange:E=>{Tt(E.target.value)}}),(0,u.jsx)("p",{className:"settings-fieldDesc",children:"超过此时长的回复完成时通知"})]}),(0,u.jsxs)("div",{className:"settings-field",children:[(0,u.jsx)("div",{className:"settings-fieldHead",children:(0,u.jsx)("span",{className:"settings-fieldLabel",children:"通知间隔（分钟）"})}),(0,u.jsx)("input",{type:"number",className:"settings-input","aria-label":"通知间隔",value:Et,onChange:E=>{Bt(E.target.value)}}),(0,u.jsx)("p",{className:"settings-fieldDesc",children:"同一会话两次通知的最小间隔"})]}),(0,u.jsx)("div",{className:"sheet-confirm-actions",children:(0,u.jsx)("button",{type:"button",className:"mobile-button mobile-button-primary","aria-label":"保存触发条件",disabled:Ae,onClick:()=>{yd()},children:"保存"})})]}),ce!==void 0&&(0,u.jsxs)("div",{className:"settings-card",...In("notify-privacy"),children:[(0,u.jsxs)("div",{className:"settings-cardHead",children:[(0,u.jsx)("span",{className:"settings-cardTitle",children:"隐私"}),(0,u.jsx)(Da,{scope:"sync"})]}),(0,u.jsxs)("div",{className:"settings-field",children:[(0,u.jsx)("div",{className:"settings-fieldHead",children:(0,u.jsx)("span",{className:"settings-fieldLabel",children:"锁屏隐藏通知详情"})}),(0,u.jsx)("button",{type:"button",role:"switch","aria-label":"锁屏隐藏通知详情","aria-checked":Ji,className:`settings-switch${Ji?" settings-switch-on":""}`,disabled:Ae,onClick:()=>{tr(!Ji)}}),(0,u.jsx)("p",{className:"settings-fieldDesc",children:"通知不显示会话标题与任务名，避免锁屏时被旁人看到内容"})]})]})]}),$i&&(0,u.jsx)(Si,{title:"清除已配置的推送渠道？",body:"输入框均为空，保存将清除电脑端已保存的通道凭据（Server酱 / Bark / Telegram / WxPusher / PushPlus），之后这些渠道将收不到通知。如果要保留，请取消后不要点保存。",confirmLabel:"清除",tone:"danger",onCancel:()=>{Fn(!1)},onConfirm:()=>{Fn(!1),vd()}})]});if(ut)return(0,u.jsx)(BO,{onBack:()=>{bt(!1)}});let $r=r!==void 0?bE.find(E=>E.id===r):void 0,Wr=$r!==void 0&&t!==void 0?$r.namespaces.map(E=>t.find(te=>te.ns===E)).filter(E=>E!==void 0):void 0;if(Wr!==void 0&&Wr.length>0)return(0,u.jsx)(hE,{namespaces:Wr,allNamespaces:t??[],onBack:()=>{o(void 0)},onOpenMarket:Wr.some(E=>E.ns==="dsh-market")?()=>{l(!0)}:void 0});let Xo=()=>{Nt(!0),XS().then(E=>{He(E),E.length>0&&a2(E)},()=>{})},xd=E=>{E.open==="notify"?kt(!0):Xo(),zt(E.id)},wd=async()=>{Zt(!0);try{Ha(await ub(!0))}catch(E){Q(he(E))}finally{Zt(!1)}};return(0,u.jsxs)("div",{className:"mobile",children:[(0,u.jsxs)("header",{className:"mobile-header",children:[(0,u.jsx)("div",{className:"mobile-headerSlot",children:(0,u.jsx)("button",{type:"button",className:"mobile-back","aria-label":"返回",onClick:e,children:"‹"})}),(0,u.jsx)("h1",{className:"mobile-title",children:"设置"}),(0,u.jsx)("div",{className:"mobile-headerSlot mobile-headerSlot-right"})]}),(0,u.jsxs)("div",{className:"mobile-scroll",children:[a!==void 0&&(0,u.jsx)("p",{className:"mobile-error mobile-pad",role:"alert",children:a}),(0,u.jsx)("div",{className:"settings-search",children:(0,u.jsx)("input",{type:"search",className:"mobile-searchInput",placeholder:"搜索设置…","aria-label":"搜索设置",value:ft,onChange:E=>{Ge(E.target.value)}})}),Jr.length>0&&(0,u.jsxs)("ul",{className:"settings-group",children:[(0,u.jsxs)("li",{className:"settings-groupTitle",children:["配置项 ",(0,u.jsx)("span",{className:"settings-groupDesc",children:"通知 / 语音页内"})]}),Jr.map(E=>(0,u.jsx)("li",{children:(0,u.jsxs)("button",{type:"button",className:"settings-row",onClick:()=>{xd(E)},children:[(0,u.jsx)("span",{className:"card-icon",children:(0,u.jsx)("span",{"aria-hidden":!0,children:(0,u.jsx)(Zb,{})})}),(0,u.jsxs)("span",{className:"card-main",children:[(0,u.jsx)("span",{className:"card-title",children:(0,u.jsx)("span",{className:"card-titleText",children:E.label})}),(0,u.jsxs)("span",{className:"card-desc",children:[E.group," · 点击定位"]})]}),(0,u.jsx)("span",{className:"card-action",children:(0,u.jsx)(Ia,{})})]})},E.id))]}),(0,u.jsxs)("div",{className:"settings-legend",children:[(0,u.jsx)(Da,{scope:"phone"}),(0,u.jsx)("span",{children:"仅影响本机"}),(0,u.jsx)(Da,{scope:"sync"}),(0,u.jsx)("span",{children:"改动同步到桌面端"}),(0,u.jsx)(Da,{scope:"desktop"}),(0,u.jsx)("span",{children:"请在桌面端修改"})]}),(0,u.jsxs)("ul",{className:"settings-group",children:[(0,u.jsxs)("li",{className:"settings-groupTitle",children:["外观 ",(0,u.jsx)("span",{className:"settings-groupDesc",children:"显示效果"})]}),Ve("主题","theme","深色","浅色","外观")&&(0,u.jsx)(qa,{icon:(0,u.jsx)(tT,{}),title:"主题",desc:"深色 / 浅色 / 跟随系统",action:(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)("span",{className:"settings-rowValue",children:Wi}),(0,u.jsx)(Ia,{})]}),onClick:()=>{N("theme")}}),Ve("字体大小","font")&&(0,u.jsx)(qa,{icon:(0,u.jsx)(aT,{}),title:"字体大小",desc:"聊天文本的字号",action:(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)("span",{className:"settings-rowValue",children:jk[f]}),(0,u.jsx)(Ia,{})]}),onClick:()=>{N("font")}}),Ve("消息密度","density","紧凑","舒适")&&(0,u.jsx)(qa,{icon:(0,u.jsx)(iT,{}),title:"消息密度",desc:"消息之间的间距",action:(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)("span",{className:"settings-rowValue",children:Yk[g]}),(0,u.jsx)(Ia,{})]}),onClick:()=>{N("density")}}),Ve("发送模式","发送","排队","插入","steer")&&(0,u.jsx)(qa,{icon:(0,u.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,u.jsx)("path",{d:"M6.5 8.5h11"}),(0,u.jsx)("path",{d:"M6.5 12h11"}),(0,u.jsx)("path",{d:"M6.5 15.5h11"})]}),title:"发送模式",desc:"排队 / 直接插入",locateId:"sendmode",action:(0,u.jsxs)("select",{className:"settings-input dm-sendmode-select",defaultValue:typeof window<"u"&&window.__dmSendMode?window.__dmSendMode.get():"queue",onChange:E=>{let te=E&&E.target?E.target.value:"queue";typeof window<"u"&&window.__dmSendMode&&window.__dmSendMode.set(te)},children:[(0,u.jsx)("option",{value:"queue",children:"排队"}),(0,u.jsx)("option",{value:"steer",children:"直接插入"})]})}),Ve("代码块行号","行号","line")&&(0,u.jsx)(Av,{icon:(0,u.jsx)(rT,{}),title:"代码块行号",desc:"在代码块左侧显示行号",value:w,onChange:E=>{Xk(E),x(E)}})]}),(0,u.jsxs)("ul",{className:"settings-group",children:[(0,u.jsxs)("li",{className:"settings-groupTitle",children:["对话 ",(0,u.jsx)("span",{className:"settings-groupDesc",children:"聊天体验"})]}),Ve("自动滚动","scroll")&&(0,u.jsx)(Av,{icon:(0,u.jsx)(oT,{}),title:"自动滚动",desc:"新消息到达时自动滚动到底部",value:C,onChange:E=>{Qk(E),p(E)}}),Ve("震动","vibrate","通知震动")&&(0,u.jsx)(Av,{icon:(0,u.jsx)(sT,{}),title:"震动",desc:"任务完成、审批到达时轻震一下",value:m,onChange:E=>{Fk(E),b(E)}})]}),Ve("用量","余量","配额","余额")&&(0,u.jsxs)("ul",{className:"settings-group",children:[(0,u.jsxs)("li",{className:"settings-groupTitle",children:["用量 ",(0,u.jsx)("span",{className:"settings-groupDesc",children:"套餐与配额"})]}),Pt===void 0&&a===void 0&&(0,u.jsx)("li",{className:"settings-note",children:"加载中…"}),se!==void 0&&se.providers.length>0&&!H&&(0,u.jsx)(qa,{icon:(0,u.jsx)(pT,{}),title:"用量",desc:VO(se),action:(0,u.jsx)(Ia,{}),onClick:()=>{Y(!0)}}),se!==void 0&&se.providers.length>0&&H&&(0,u.jsxs)("li",{className:"usage-card",children:[se.providers.map(E=>(0,u.jsx)(PO,{provider:E},E.name)),(0,u.jsxs)("div",{className:"usage-actions",children:[(0,u.jsx)("button",{type:"button",className:"mobile-button",onClick:()=>{Y(!1)},children:"收起"}),(0,u.jsx)("button",{type:"button",className:"mobile-button mobile-button-primary",disabled:Sn,onClick:()=>{wd()},children:Sn?"查询中…":"刷新"})]})]})]}),(0,u.jsxs)("ul",{className:"settings-group",children:[(0,u.jsxs)("li",{className:"settings-groupTitle",children:["通知 ",(0,u.jsx)("span",{className:"settings-groupDesc",children:"任务完成提醒"})]}),Ve("通知","notify","推送","提醒","阈值","间隔")&&(0,u.jsx)(qa,{icon:(0,u.jsx)(FN,{}),title:"通知",desc:"浏览器通知 · 推送渠道 · Web Push",action:(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)("span",{className:"settings-rowValue",children:jt}),(0,u.jsx)(Ia,{})]}),onClick:()=>{kt(!0)}})]}),(0,u.jsxs)("ul",{className:"settings-group",children:[(0,u.jsxs)("li",{className:"settings-groupTitle",children:["语音 ",(0,u.jsx)("span",{className:"settings-groupDesc",children:"语音输入与转写"})]}),Ve("语音服务","转写","voice","语音")&&(0,u.jsx)(qa,{icon:(0,u.jsx)(rp,{}),title:"语音服务",desc:T.length===0?ze.length>0?`桌面端已配置 ${ze.length} 个转写服务`:"语音转写服务，按序回退":`${T.length} 个服务 · 按序回退`,action:(0,u.jsx)(Ia,{}),onClick:()=>{Xo()}})]}),(0,u.jsxs)("ul",{className:"settings-group",children:[(0,u.jsxs)("li",{className:"settings-groupTitle",children:["设备 ",(0,u.jsx)("span",{className:"settings-groupDesc",children:"已配对设备管理"})]}),(0,u.jsx)(sE,{}),Ve("设备管理","配对","设备","device","pair")&&(0,u.jsx)(qa,{icon:(0,u.jsx)($c,{}),title:"设备管理",desc:"查看已配对设备 · 重命名 · 设为主设备 · 移除",action:(0,u.jsx)(Ia,{}),onClick:()=>{bt(!0)}})]}),(0,u.jsxs)("ul",{className:"settings-group",children:[(0,u.jsxs)("li",{className:"settings-groupTitle",children:["主机配置 ",(0,u.jsx)("span",{className:"settings-groupDesc",children:"模型 · 搜索 · 记忆 · 工具等"})]}),t===void 0&&a===void 0&&(0,u.jsx)("li",{className:"settings-note",children:"加载中…"}),t!==void 0&&bE.map(E=>{let te=E.namespaces.map(qn=>t.find(Qo=>Qo.ns===qn)).filter(qn=>qn!==void 0);if(te.length===0||!Ve(E.title,...te.map(qn=>md(qn.ns))))return null;let pn=te.some(qn=>Object.keys(qn.value??{}).some(Qo=>Zi(qn.ns,Qo))),pl=te.map(qn=>md(qn.ns)).join(" · ");return(0,u.jsx)("li",{children:(0,u.jsxs)("button",{type:"button",className:"mobile-row",onClick:()=>{o(E.id)},children:[(0,u.jsx)("span",{className:"card-icon",children:(0,u.jsx)("span",{"aria-hidden":!0,children:(0,u.jsx)(Zb,{})})}),(0,u.jsxs)("span",{className:"card-main",children:[(0,u.jsxs)("span",{className:"card-title",children:[(0,u.jsx)("span",{className:"card-titleText",children:E.title}),pn?(0,u.jsx)(Da,{scope:"sync"}):(0,u.jsx)(Da,{scope:"ro"})]}),(0,u.jsx)("span",{className:"card-desc",children:pl})]}),(0,u.jsx)("span",{className:"card-action",children:(0,u.jsx)(Ia,{})})]})},E.id)})]}),(0,u.jsxs)("ul",{className:"settings-group",children:[(0,u.jsx)("li",{className:"settings-groupTitle",children:"通用"}),Ve("清除缓存","cache")&&(0,u.jsx)(qa,{icon:(0,u.jsx)(ap,{}),title:"清除缓存",desc:"清除离线壳缓存（PWA）",action:(0,u.jsx)(Ia,{}),onClick:()=>{O(!0)}}),Ve("反馈","意见","建议","feedback","issue","github")&&(0,u.jsx)(qa,{icon:(0,u.jsx)(op,{}),title:"反馈与建议",desc:"遇到问题或想要新功能，去 GitHub 告诉我",action:(0,u.jsx)(Ia,{}),onClick:()=>{window.open("https://github.com/Eternalloveone/dsh-palm/issues/new","_blank","noopener")}}),Ve("关于","about","版本")&&(0,u.jsx)(qa,{icon:(0,u.jsx)(lT,{}),title:"关于",desc:`掌上 DSH · 版本 ${Op.version}${Mv===void 0?"":` · 构建 ${Mv}`}`,action:(0,u.jsx)(Ia,{}),onClick:()=>{N("about")}}),(0,u.jsx)(dE,{})]}),(0,u.jsx)("p",{className:"settings-note",children:"密钥类配置永不显示、不可在手机端修改；带「只读」标记的配置请在桌面端调整。"}),xt!==""&&(0,u.jsx)("div",{className:"mobile-empty",children:(0,u.jsxs)("p",{className:"empty-desc",children:["没有匹配「",ft.trim(),"」的设置项"]})})]}),y==="theme"&&(0,u.jsx)(Cv,{title:"主题",value:c,options:[{value:"dark",label:"深色"},{value:"light",label:"浅色"},{value:"system",label:"跟随系统"}],onPick:E=>{Kf(E),Js("ui-theme",[{op:"set",path:["preference"],value:E}]).catch(()=>{})},onClose:()=>{N(null)}}),y==="font"&&(0,u.jsx)(Cv,{title:"字体大小",value:f,options:[{value:"small",label:"小"},{value:"standard",label:"标准"},{value:"large",label:"大"}],onPick:E=>{Bk(E),v(E),Ur()},onClose:()=>{N(null)}}),y==="density"&&(0,u.jsx)(Cv,{title:"消息密度",value:g,options:[{value:"compact",label:"紧凑"},{value:"cozy",label:"舒适"}],onPick:E=>{Gk(E),h(E),Ur()},onClose:()=>{N(null)}}),y==="about"&&(0,u.jsxs)(ht,{title:"关于",onClose:()=>{N(null)},children:[(0,u.jsxs)("p",{className:"sheet-confirm-desc",children:["掌上 DSH（dsh-palm）· 版本 ",Op.version,(0,u.jsx)("br",{}),"DSH 移动端界面：扫码配对、工作区、会话与实时对话。"]}),(0,u.jsx)("div",{className:"sheet-confirm-actions",children:(0,u.jsx)("button",{type:"button",className:"mobile-button",disabled:Zr,onClick:()=>{Go()},children:Zr?"检查中…":"检查更新"})}),V!==void 0&&(0,u.jsx)("p",{className:"settings-fieldDesc",role:"status",children:V}),(0,u.jsxs)("div",{className:"settings-field",children:[(0,u.jsx)("span",{className:"settings-fieldLabel",children:"依赖自检"}),(0,u.jsx)("p",{className:"settings-fieldDesc",children:"与宿主接口的连通性。总线事件显示自启动以来收到的帧数——事件被改名或停发时订阅仍会 成功，所以要看常发的那几条（session.control / session/event / agent/assistant-stream） 是否长期为 0；added、removed、error 本就罕见，0 帧属正常。"}),W===void 0?(0,u.jsx)("p",{className:"settings-fieldDesc",children:le?"读取中…":"未读取"}):W.checks.map(E=>(0,u.jsxs)("p",{className:"settings-fieldDesc",children:[E.ok?"✓":"✗"," ",E.name," · ",E.ok?E.kind==="method"?"在位":`${String(E.frames)} 帧${E.lastAt===void 0?"":` · ${qO(E.lastAt,W.now)}`}`:E.reason??"不可用"]},E.name)),(0,u.jsx)("button",{type:"button",className:"mobile-button",disabled:le,onClick:()=>{Yo()},children:le?"读取中…":"刷新自检"})]})]}),D&&(0,u.jsx)(Si,{title:"清除缓存",body:"将删除本机的离线壳缓存（PWA CacheStorage）并重新注册。偏好与配对状态不受影响。",confirmLabel:"清除",tone:"danger",onCancel:()=>{O(!1)},onConfirm:()=>{O(!1),HO()}})]})}var ye=X(Ye(),1);var A=X(re(),1),wE,EE="dsh.palm.pinnedWorkspaces",Ov="dsh.palm.recentWorkspaces",SE="dsh.palm.recentWorkspace",kE="dsh.palm.welcomeSeen",jO=5,GO=3;function YO(){try{let e=localStorage.getItem(EE),t=e===null?[]:JSON.parse(e);return Array.isArray(t)?t.filter(n=>typeof n=="string"):[]}catch{return[]}}function XO(e){try{localStorage.setItem(EE,JSON.stringify(e))}catch{}}function zp(e){let t=[];for(let n of e)if(!t.includes(n)&&(t.push(n),t.length>=jO))break;return t}function QO(){try{let e=localStorage.getItem(Ov);if(e!==null){let t=JSON.parse(e);if(Array.isArray(t))return zp(t.filter(n=>typeof n=="string"))}}catch{}try{let e=localStorage.getItem(SE);if(e!==null&&e!==""){let t=zp([e]);return localStorage.setItem(Ov,JSON.stringify(t)),localStorage.removeItem(SE),t}}catch{}return[]}function ME(e){let t=zp(e);try{localStorage.setItem(Ov,JSON.stringify(t))}catch{}}function KO(e,t){let n=zp([t,...e.filter(a=>a!==t)]);return ME(n),n}function FO(e,t){let n=e.filter(a=>a!==t);return ME(n),n}function _p(e,t){return t.slice(0,GO).includes(e.workspaceId)?"active":/\b(test|tests|testing|spec|specs|benchmark|e2e)\b/i.test(e.path.replace(/[\\/]+/g," "))||/\b(test|tests|testing|spec|specs|benchmark|e2e)\b/i.test(e.title)?"test":(e.sessionIds??[]).length===0?"plain":"code"}var NE={active:"活跃项目",code:"代码项目",test:"测试项目",plain:"其他"},ZO={active:"ws-icon-active",code:"ws-icon-code",test:"ws-icon-test",plain:"ws-icon-plain"},TE=[{kind:"active",placeholder:null},{kind:"code",placeholder:"暂无代码项目"},{kind:"test",placeholder:"暂无测试项目"},{kind:"plain",placeholder:null}];function JO({onCancel:e,onPick:t}){let[n,a]=(0,ye.useState)(void 0),[i,r]=(0,ye.useState)(void 0),[o,s]=(0,ye.useState)(!1),[l,c]=(0,ye.useState)(void 0),[f,v]=(0,ye.useState)(0);(0,ye.useEffect)(()=>{let h=!1;return r(void 0),a(void 0),WS(l).then(w=>{h||a(w)},w=>{h||r(he(w))}),()=>{h=!0}},[l,f]);let g=async()=>{if(!(n===void 0||o)){s(!0),r(void 0);try{let h=await ek(n.path);t(h.workspace)}catch(h){s(!1),r(he(h))}}};return(0,A.jsxs)("div",{className:"mobile dir-browser",children:[(0,A.jsxs)("header",{className:"mobile-header",children:[(0,A.jsx)("div",{className:"mobile-headerSlot",children:(0,A.jsx)("button",{type:"button",className:"mobile-headerAction",onClick:e,children:"返回"})}),(0,A.jsx)("h1",{className:"mobile-title",children:"选择目录"}),(0,A.jsx)("div",{className:"mobile-headerSlot mobile-headerSlot-right"})]}),n!==void 0&&(0,A.jsx)("div",{className:"dir-crumbs",children:n.crumbs.map((h,w)=>(0,A.jsxs)("span",{children:[(0,A.jsx)("button",{type:"button",className:"dir-crumb",onClick:()=>c(h.path),children:h.name||"/"}),w<n.crumbs.length-1&&(0,A.jsx)("span",{className:"dir-crumb-separator",children:"/"})]},h.path))}),i!==void 0?(0,A.jsxs)("div",{className:"mobile-empty",children:[(0,A.jsx)("p",{className:"mobile-error",children:i}),(0,A.jsx)("button",{type:"button",className:"mobile-button",onClick:()=>v(h=>h+1),children:"重试"})]}):n===void 0?(0,A.jsx)("div",{className:"mobile-empty",children:(0,A.jsx)("p",{className:"mobile-muted",children:"加载中…"})}):(0,A.jsx)("ul",{className:"mobile-list",children:n.entries.length===0?(0,A.jsx)("div",{className:"mobile-empty dir-empty",children:(0,A.jsx)("p",{className:"mobile-muted",children:"空目录"})}):n.entries.map(h=>(0,A.jsx)("li",{children:(0,A.jsxs)("button",{type:"button",className:`mobile-row dir-entry ${h.hidden?"dir-entry-hidden":""}`,onClick:()=>c(h.path),children:[(0,A.jsx)("span",{className:"mobile-rowMain",children:(0,A.jsx)("span",{className:"mobile-rowTitle",children:h.name})}),(0,A.jsx)("span",{className:"mobile-chevron","aria-hidden":!0,children:"›"})]})},h.path))}),(0,A.jsx)("div",{className:"dir-select",children:(0,A.jsx)("button",{type:"button",className:"mobile-button",disabled:n===void 0||o,onClick:()=>{g()},children:o?"创建中…":"选择此目录"})})]})}function $O({target:e,pinned:t,onClose:n,onPinnedChange:a,onRename:i,onDelete:r}){let{workspace:o}=e,s=[{key:"pin",label:t?"取消固定":"固定到顶部",run:()=>{a()}},{key:"rename",label:"重命名",run:()=>{i(o)}},{key:"delete",label:"删除工作区",danger:!0,run:()=>{r(o)}}];return(0,A.jsx)(ht,{title:o.title,onClose:n,children:(0,A.jsx)("div",{role:"menu","aria-label":`工作区操作：${o.title}`,children:s.map(l=>(0,A.jsx)("button",{type:"button",role:"menuitem",className:"sheet-option",onClick:()=>{n(),l.run()},children:(0,A.jsx)("span",{className:"sheet-option-copy",children:(0,A.jsx)("span",{className:"sheet-option-title",style:l.danger?{color:"var(--danger)"}:void 0,children:l.label})})},l.key))})})}function WO(){return(0,A.jsx)("div",{"aria-hidden":"true",role:"presentation",children:[0,1,2].map(e=>(0,A.jsxs)("div",{className:"skel-row",children:[(0,A.jsx)("div",{className:"skel skel-icon"}),(0,A.jsxs)("div",{className:"skel-lines",children:[(0,A.jsx)("div",{className:"skel skel-line-title"}),(0,A.jsx)("div",{className:"skel skel-line-sub"})]})]},e))})}function RE({initialWorkspaceId:e,onPick:t,onLocateSession:n,onOpenDirect:a,initialSearch:i,onSearchSnapshot:r,onSearchApplied:o,onOpenRunOverview:s,runOverviewLive:l}){let[c,f]=(0,ye.useState)(()=>wE),[v,g]=(0,ye.useState)(void 0),[h,w]=(0,ye.useState)(0),[x,C]=(0,ye.useState)(!1),[p,m]=(0,ye.useState)(!1),[b,y]=(0,ye.useState)(""),N=(0,ye.useRef)(!1);(0,ye.useEffect)(()=>{N.current||i!==void 0&&i.open&&(N.current=!0,m(!0),y(i.term),o?.())},[i,o]),(0,ye.useEffect)(()=>{r?.(p,b)},[p,b,r]);let[D,O]=(0,ye.useState)([]),[T,q]=(0,ye.useState)(!1),[$,F]=(0,ye.useState)(!1),[Ie,at]=(0,ye.useState)(!1),[Te,je]=(0,ye.useState)(!1),[Je,Kt]=(0,ye.useState)(!1),[xe,_t]=(0,ye.useState)(()=>YO()),[$e,Ut]=(0,ye.useState)(()=>QO()),[ze,He]=(0,ye.useState)(void 0),[Ft,kt]=(0,ye.useState)(void 0),[Gn,Nt]=(0,ye.useState)(void 0),[ut,bt]=(0,ye.useState)(!1),j=(0,ye.useRef)(void 0),[Z,ce]=(0,ye.useState)(()=>{try{return localStorage.getItem(kE)==="1"}catch{return!1}}),Ee=()=>{ce(!0);try{localStorage.setItem(kE,"1")}catch{}};(0,ye.useEffect)(()=>{let H=b.trim();if(H===""){O([]),F(!1),q(!1),at(!1),je(!1);return}q(!0),F(!1),je(!1);let Y=!1,se=setTimeout(()=>{_f(H).then(ke=>{Y||(O(ke.items),at(ke.hasMore),je(ke.partial===!0),F(!0),q(!1))},()=>{Y||(O([]),F(!0),q(!1))})},250);return()=>{Y=!0,clearTimeout(se)}},[b]);let Ae=(H,Y)=>{if(H.kind==="message"&&H.seq!==void 0){Yn(H,H.seq,Y,H.messageId,H.partId);return}zf(H.sessionId,Y).then(se=>{let ke=se.items[0];Yn(H,ke?.seq,Y,ke?.messageId,ke?.partId)},()=>{Yn(H,void 0,Y)})},Me=H=>{if(H.workspaceId!==void 0){let se=(c??[]).find(ke=>ke.workspaceId===H.workspaceId);return{workspaceId:H.workspaceId,title:se?.title??H.workspaceTitle}}let Y=(c??[]).find(se=>(se.sessionIds??[]).map(String).includes(H.sessionId));return Y===void 0?{}:{workspaceId:Y.workspaceId,title:Y.title}},Yn=(H,Y,se,ke,Tt)=>{let Et=Me(H);if(Et.workspaceId!==void 0&&n!==void 0){let Qn=ke??H.messageId,Kn=Tt??H.partId;n(H.sessionId,Et.workspaceId,Y,se,...[Qn,Kn].some(Va=>Va!==void 0)?[Qn,Kn]:[]);return}if(Et.workspaceId===void 0){if(a!==void 0){let Qn=ke??H.messageId,Kn=Tt??H.partId;a(H,Y,se,...[Qn,Kn].some(Va=>Va!==void 0)?[Qn,Kn]:[]);return}Q("未找到该会话所属的工作区");return}let Bt=new URL(window.location.href);Bt.searchParams.set("workspace",Et.workspaceId),Bt.searchParams.set("session",H.sessionId),Y!==void 0&&Bt.searchParams.set("seq",String(Y)),window.location.href=`${Bt.pathname}${Bt.search}`};(0,ye.useEffect)(()=>{let H=!1;return Ac().then(Y=>{if(H)return;let se=e===void 0?void 0:Y.find(ke=>ke.workspaceId===e);if(se!==void 0){t(se);return}wE=Y,f(Y)},Y=>{H||g(he(Y))}),()=>{H=!0}},[e,t,h]);let vt=(0,ye.useCallback)(H=>{Ut(Y=>KO(Y,H.workspaceId)),t(H)},[t]),fa=(0,ye.useCallback)(()=>{let H=$e[0],Y=H===void 0?void 0:c?.find(se=>se.workspaceId===H);if(Y===void 0){Q("还没有访问记录");return}vt(Y)},[c,$e,vt]),Xn=(0,ye.useCallback)(()=>{j.current!==void 0&&(clearTimeout(j.current),j.current=void 0)},[]);(0,ye.useEffect)(()=>()=>{Xn()},[Xn]);let yn=(0,ye.useRef)(void 0),yt=H=>({onTouchStart:()=>{Xn(),yn.current=void 0,j.current=window.setTimeout(()=>{j.current=void 0,yn.current=H.workspaceId,He({workspace:H})},500)},onTouchMove:Xn,onTouchEnd:Xn,onClick:Y=>{if(yn.current===H.workspaceId){yn.current=void 0,Y.preventDefault();return}vt(H)},onContextMenu:Y=>{Y.preventDefault(),He({workspace:H})}}),zn=(0,ye.useCallback)(H=>{let Y=xe.includes(H.workspaceId),se=Y?xe.filter(ke=>ke!==H.workspaceId):[...xe,H.workspaceId];_t(se),XO(se),Q(Y?"已取消固定":"已固定")},[xe]),pa=(0,ye.useCallback)(async(H,Y)=>{bt(!0);try{let{workspace:se}=await tk(H.workspaceId,Y);f(ke=>ke?.map(Tt=>Tt.workspaceId===se.workspaceId?se:Tt)??ke),kt(void 0),Q("已重命名")}catch(se){Q(he(se))}finally{bt(!1)}},[]),At=(0,ye.useCallback)(async H=>{bt(!0);try{await nk(H.workspaceId),f(Y=>Y?.filter(se=>se.workspaceId!==H.workspaceId)??Y),Ut(Y=>FO(Y,H.workspaceId)),Nt(void 0),Q("已删除工作区（目录与会话保留）")}catch(Y){Q(he(Y))}finally{bt(!1)}},[]);if(x)return(0,A.jsx)(JO,{onCancel:()=>C(!1),onPick:vt});let nn=b.trim().toLowerCase(),fn=(c??[]).filter(H=>nn===""||H.title.toLowerCase().includes(nn)).filter(H=>!Je||xe.includes(H.workspaceId)),ma=TT((c??[]).map(H=>H.path)),xn=[...fn].sort((H,Y)=>{let se=xe.includes(H.workspaceId)?0:1,ke=xe.includes(Y.workspaceId)?0:1;return se-ke}),wn=new Map($e.map((H,Y)=>[H,Y])),Pt=TE.map(({kind:H})=>({kind:H,rows:H==="active"?xn.filter(Y=>_p(Y,$e)===H).sort((Y,se)=>{let ke=xe.includes(Y.workspaceId)?0:1,Tt=xe.includes(se.workspaceId)?0:1;return ke!==Tt?ke-Tt:(wn.get(Y.workspaceId)??1/0)-(wn.get(se.workspaceId)??1/0)}):xn.filter(Y=>_p(Y,$e)===H)})).filter(H=>H.rows.length>0),Ha=TE.filter(({kind:H,placeholder:Y})=>Y!==null&&!xn.some(se=>_p(se,$e)===H)),Sn=xe.length,Zt=(()=>{if(v!==void 0)return(0,A.jsxs)("div",{className:"mobile-empty",children:[(0,A.jsx)("div",{className:"empty-icon",children:(0,A.jsx)(np,{})}),(0,A.jsx)("p",{className:"empty-title",children:"加载失败"}),(0,A.jsx)("p",{className:"empty-desc",children:v}),(0,A.jsx)("button",{type:"button",className:"mobile-button",onClick:()=>{g(void 0),f(void 0),w(H=>H+1)},children:"重试"})]});if(c===void 0)return(0,A.jsx)(WO,{});if(fn.length===0){if(Je&&Sn===0)return(0,A.jsxs)("div",{className:"mobile-empty",children:[(0,A.jsx)("div",{className:"empty-icon",children:(0,A.jsx)(tp,{})}),(0,A.jsx)("p",{className:"empty-title",children:"还没有固定的工作区"}),(0,A.jsx)("p",{className:"empty-desc",children:"长按工作区卡片即可固定，固定后会置顶显示"})]});if(nn!==""){if(T)return(0,A.jsxs)("div",{className:"mobile-empty",children:[(0,A.jsx)("div",{className:"empty-icon",children:(0,A.jsx)(Qi,{})}),(0,A.jsx)("p",{className:"empty-title",children:"正在搜索全部会话…"})]});if($&&D.length===0)return(0,A.jsxs)("div",{className:"mobile-empty",children:[(0,A.jsx)("div",{className:"empty-icon",children:(0,A.jsx)(Qi,{})}),(0,A.jsx)("p",{className:"empty-title",children:"没有匹配的工作区或会话"}),(0,A.jsxs)("p",{className:"empty-desc",children:["工作区按名称匹配，会话按名称与可见正文匹配",Te&&(0,A.jsx)(A.Fragment,{children:"；更早的会话未在本次扫描范围内"})]})]})}else return(0,A.jsxs)("div",{className:"mobile-empty",children:[(0,A.jsx)("div",{className:"empty-icon",children:(0,A.jsx)($N,{})}),(0,A.jsx)("p",{className:"empty-title",children:"暂无工作区"}),(0,A.jsx)("p",{className:"empty-desc",children:"新建一个工作区，把项目目录挂进来就能开始会话"})]})}return(0,A.jsxs)("ul",{className:"mobile-list",children:[Pt.map(H=>(0,A.jsxs)("li",{style:{listStyle:"none"},children:[(0,A.jsx)("div",{className:"mobile-groupTitle",children:NE[H.kind]}),H.rows.map(Y=>{let se=_p(Y,$e),ke=xe.includes(Y.workspaceId),Tt=(Y.sessionIds??[]).length;return(0,A.jsxs)("button",{type:"button",className:`mobile-row${se==="active"?" mobile-row-active":""}`,...yt(Y),children:[(0,A.jsx)("span",{className:`ws-icon ${ZO[se]}`,children:(0,A.jsx)("span",{"aria-hidden":!0,children:(0,A.jsx)(JN,{})})}),(0,A.jsxs)("span",{className:"card-main",children:[(0,A.jsxs)("span",{className:"card-title",children:[(0,A.jsx)("span",{className:"card-titleText",children:Y.title}),ke&&(0,A.jsx)("span",{className:"ws-pin","aria-label":"已固定",children:(0,A.jsx)(tp,{})})]}),(0,A.jsx)("span",{className:"card-subtitle",children:ET(Y.path,ma)})]}),(0,A.jsxs)("span",{className:"card-action",children:[Tt>0&&(0,A.jsxs)("span",{className:"card-badge",children:[Tt," 会话"]}),(0,A.jsx)("span",{className:"mobile-chevron","aria-hidden":!0,children:"›"})]})]},Y.workspaceId)})]},H.kind)),!Je&&nn===""&&Ha.map(({kind:H,placeholder:Y})=>(0,A.jsxs)("li",{style:{listStyle:"none"},children:[(0,A.jsx)("div",{className:"mobile-groupTitle",children:NE[H]}),(0,A.jsxs)("div",{className:"mobile-empty-group",children:[(0,A.jsx)("span",{children:Y}),(0,A.jsx)("button",{type:"button",className:"mobile-empty-groupBtn",onClick:()=>C(!0),children:"创建"})]})]},`empty-${H}`)),nn!==""&&T&&(0,A.jsx)("li",{style:{listStyle:"none"},children:(0,A.jsx)("p",{className:"mobile-muted mobile-pad",role:"status",children:"正在搜索全部会话…"})}),nn!==""&&!T&&D.length>0&&(0,A.jsxs)("li",{style:{listStyle:"none"},children:[(0,A.jsx)("div",{className:"mobile-groupTitle",children:"会话"}),D.map(H=>{let Y=Me(H),se=(H.title??H.snippet.trim().slice(0,24))||"匹配会话";return(0,A.jsx)("li",{style:{listStyle:"none"},children:(0,A.jsxs)("button",{type:"button",className:"mobile-row",onClick:()=>{Ae(H,nn)},children:[(0,A.jsx)("span",{className:"card-icon",children:(0,A.jsx)("span",{className:"sess-check","aria-hidden":!0,children:(0,A.jsx)(Oa,{})})}),(0,A.jsxs)("span",{className:"card-main",children:[(0,A.jsxs)("span",{className:"sess-titleline",children:[(0,A.jsx)("span",{className:"sess-title",children:se}),(0,A.jsx)("span",{className:"sess-sep","aria-hidden":!0,children:"·"}),(0,A.jsx)("span",{className:"sess-time",children:Y.title??"未分组"})]}),(0,A.jsx)("span",{className:"card-desc",children:H.snippet})]}),(0,A.jsx)("span",{className:"card-action",children:(0,A.jsx)("span",{className:"mobile-chevron","aria-hidden":!0,children:"›"})})]})},`${H.kind}:${H.sessionId}`)}),Ie&&(0,A.jsx)("li",{style:{listStyle:"none"},children:(0,A.jsx)("p",{className:"search-hitsNote mobile-pad",children:"结果较多，仅显示前若干条——请细化关键词"})}),!Ie&&Te&&(0,A.jsx)("li",{style:{listStyle:"none"},children:(0,A.jsx)("p",{className:"search-hitsNote mobile-pad",children:"已扫描最近的会话，更早的会话可能未覆盖"})})]}),!Je&&nn===""&&(0,A.jsx)("li",{style:{listStyle:"none"},children:(0,A.jsxs)("button",{type:"button",className:"mobile-createCard",onClick:()=>C(!0),children:[(0,A.jsx)(ll,{}),"新建工作区"]})})]})})();return(0,A.jsxs)("div",{className:"mobile",children:[(0,A.jsxs)("header",{className:"mobile-header",children:[(0,A.jsx)("div",{className:"mobile-headerSlot",children:p?(0,A.jsx)("button",{type:"button",className:"mobile-back","aria-label":"返回",onClick:()=>{m(!1),y("")},children:"‹"}):(0,A.jsx)("div",{className:"mobile-headerSlot"})}),p?(0,A.jsx)("div",{className:"mobile-headerSearch",children:(0,A.jsx)("input",{type:"search",className:"mobile-headerSearchInput",placeholder:"搜索工作区或会话…","aria-label":"搜索工作区和会话",autoFocus:!0,value:b,onChange:H=>{y(H.target.value)}})}):(0,A.jsx)("h1",{className:"mobile-title",children:"工作区"}),(0,A.jsx)("div",{className:"mobile-headerSlot mobile-headerSlot-right",children:p?(0,A.jsx)("button",{type:"button",className:"mobile-iconbtn","aria-label":"取消搜索",onClick:()=>{m(!1),y("")},children:(0,A.jsx)(jr,{})}):(0,A.jsxs)(A.Fragment,{children:[(0,A.jsx)("button",{type:"button",className:"mobile-iconbtn","aria-label":"搜索工作区和会话",onClick:()=>{m(!0)},children:(0,A.jsx)(Qi,{})}),(0,A.jsx)(cl,{})]})})]}),(0,A.jsxs)("div",{className:"mobile-quickbar",role:"toolbar","aria-label":"快捷操作",children:[(0,A.jsxs)("button",{type:"button",className:`mobile-quickchip${Je?" mobile-quickchip-on":""}`,"aria-pressed":Je,onClick:()=>{Kt(H=>!H)},children:[(0,A.jsx)(tp,{}),"固定",Sn>0?` ${Sn}`:""]}),(0,A.jsxs)("button",{type:"button",className:"mobile-quickchip",onClick:fa,children:[(0,A.jsx)(ZN,{}),"最近访问"]}),s!==void 0&&(0,A.jsxs)("button",{type:"button",className:"mobile-quickchip"+(l!==void 0&&l>0?" mobile-quickchip-live":""),"aria-label":l!==void 0&&l>0?`运行中 ${l} 个会话`:"运行中",onClick:s,children:[(0,A.jsx)("span",{className:l!==void 0&&l>0?"quick-live-dot":"quick-live-dot quick-live-dot-off","aria-hidden":!0}),"运行中",l!==void 0&&l>0&&(0,A.jsx)("span",{className:"quick-live-count",children:l})]})]}),!Z&&(0,A.jsxs)("div",{className:"mobile-welcome",role:"note",children:[(0,A.jsxs)("div",{className:"mobile-welcomeCopy",children:[(0,A.jsx)("p",{className:"mobile-welcomeTitle",children:"配对成功 🎉 三步上手"}),(0,A.jsxs)("p",{className:"mobile-welcomeDesc",children:["① 点一个工作区开始对话",(0,A.jsx)("br",{}),"② 右上角 设置 → 通知：配好任务完成提醒",(0,A.jsx)("br",{}),"③ 设置 → 用量：随时查看余额与配额"]})]}),(0,A.jsx)("button",{type:"button",className:"mobile-welcomeClose",onClick:Ee,children:"知道了"})]}),Zt,ze!==void 0&&(0,A.jsx)($O,{target:ze,pinned:xe.includes(ze.workspace.workspaceId),onClose:()=>{He(void 0)},onPinnedChange:()=>{zn(ze.workspace)},onRename:H=>{He(void 0),kt(H)},onDelete:H=>{He(void 0),Nt(H)}}),Ft!==void 0&&(0,A.jsx)(Uo,{title:"重命名工作区",initial:Ft.title,confirmLabel:"保存",busy:ut,onCancel:()=>{kt(void 0)},onConfirm:H=>{pa(Ft,H)}}),Gn!==void 0&&(0,A.jsx)(Si,{title:"删除工作区",body:(0,A.jsxs)(A.Fragment,{children:["确定删除「",Gn.title,"」吗？目录、文件与会话记录都会保留，仅移除这里的工作区入口。"]}),confirmLabel:"删除",tone:"danger",busy:ut,onCancel:()=>{Nt(void 0)},onConfirm:()=>{At(Gn)}})]})}var bd=X(Ye(),1);var CE=/^\d{6}$/;function AE(e){let t=e.trim();if(t!==""){if(CE.test(t))return{code:t};try{let n=new URL(t),a=n.searchParams.get("pair");if(a===null||a==="")return;let i=n.searchParams.get("workspace");return{token:a,...i!==null&&i!==""?{workspaceId:i}:{}}}catch{return{token:t}}}}function _v(e){return e===void 0?"/m/":"/m/?workspace="+encodeURIComponent(e)}async function zv(e,t=fetch){let n=new AbortController,a=setTimeout(()=>{n.abort()},15e3);try{let i=await t("/api/pair/accept",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(CE.test(e)?{code:e}:{token:e}),signal:n.signal});return i.ok?{ok:!0}:i.status===404?{ok:!1,message:"配对链接无效或已过期。"}:i.status===409?{ok:!1,message:"设备数已满：请先在桌面端「设备管理」移除一个设备后重试。"}:{ok:!1,message:"此设备无法使用该配对链接。"}}catch{return{ok:!1,message:"无法连接到配对服务。"}}finally{clearTimeout(a)}}async function OE(e,t=fetch){let n;try{n=new URL(e)}catch{return{kind:"none"}}let a=n.searchParams.get("pair"),i=n.searchParams.get("code");if((a===null||a==="")&&(i===null||i===""))return{kind:"none"};let r=n.searchParams.get("workspace"),o=_v(r===null||r===""?void 0:r),l=await zv(i!==null&&i!==""?i:a??"",t);return l.ok?{kind:"accepted",path:o}:{kind:"failed",path:o,message:l.message}}var La=X(re(),1);function _E(e){try{return new URL(e).origin}catch{return}}function zE({initialError:e,onPaired:t,navigate:n}){let[a,i]=(0,bd.useState)(window.location.origin),[r,o]=(0,bd.useState)(""),[s,l]=(0,bd.useState)(e),[c,f]=(0,bd.useState)(!1),v=n??(h=>{window.location.href=h}),g=async h=>{h.preventDefault();let w=AE(r);if(w===void 0){l("请输入有效的配对链接或配对码。");return}let x=_E(r.trim());if(x!==void 0&&x!==window.location.origin){v(r.trim());return}let C=_E(a.trim())??window.location.origin;if(C!==window.location.origin){let m=w.code!==void 0?w.code:w.token??"";v(`${C}/m/?${w.code!==void 0?"code":"pair"}=${encodeURIComponent(m)}`);return}f(!0),l(void 0);let p=await zv(w.code??w.token??"");if(f(!1),!p.ok){l(p.message);return}t(_v(w.workspaceId))};return(0,La.jsx)("main",{className:"mobile mobile-pair","aria-labelledby":"mobile-pair-title",children:(0,La.jsxs)("form",{className:"mobile-pairCard",onSubmit:h=>{g(h)},children:[(0,La.jsx)("h1",{id:"mobile-pair-title",className:"mobile-title",children:"设备配对"}),(0,La.jsx)("p",{className:"mobile-muted",children:"粘贴桌面端复制的配对链接，或输入桌面端显示的 6 位配对码。"}),(0,La.jsx)("label",{className:"mobile-pairLabel",htmlFor:"mobile-pair-server",children:"服务器地址"}),(0,La.jsx)("input",{id:"mobile-pair-server",className:"mobile-pairInput",value:a,onChange:h=>{i(h.target.value)},autoComplete:"off",autoCapitalize:"off",spellCheck:!1,inputMode:"url"}),(0,La.jsx)("label",{className:"mobile-pairLabel",htmlFor:"mobile-pair-link",children:"配对链接或配对码"}),(0,La.jsx)("input",{id:"mobile-pair-link",className:"mobile-pairInput",value:r,onChange:h=>{o(h.target.value)},autoComplete:"off",autoCapitalize:"off",spellCheck:!1}),s===void 0?null:(0,La.jsx)("p",{className:"mobile-error",role:"alert",children:s}),(0,La.jsx)("button",{className:"mobile-new mobile-pairSubmit",type:"submit",disabled:c,children:c?"正在配对":"配对"})]})})}var Vt=X(re(),1),Dp={workspaceId:"standalone",path:"",title:"未分组",sessionIds:[],createdAt:"",updatedAt:""};function e_(e){let t=new URLSearchParams(e).get("workspace");return t===null||t===""?void 0:t}function t_(e){let t=new URLSearchParams(e).get("session");return t===null||t===""?void 0:t}function n_(e){let t=new URLSearchParams(e).get("seq");if(t===null||t==="")return;let n=Number(t);return Number.isFinite(n)&&n>=0?n:void 0}function Tv(e){let t=e.projections?.values,n=t?.title,a=typeof n=="string"&&n!==""?n:e.cwd!==void 0?e.cwd.split("/").filter(Boolean).at(-1)??e.cwd:"新会话",i=t?.preview,r=t?.sessionStats,o=typeof r=="object"&&r!==null?r.turns:void 0;return{sessionId:e.sessionId,title:a,...typeof i=="string"&&i!==""?{preview:i}:{},...typeof o=="number"&&o>0?{turns:o}:{},...e.cwd!==void 0?{cwd:e.cwd}:{},updatedAt:e.updatedAt,running:e.running,blank:e.blank}}function w2(e){let t=new Date(e),n=`${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}`,a=new Date;if(t.toDateString()===a.toDateString())return n;let i=new Date(a);return i.setDate(a.getDate()-1),t.toDateString()===i.toDateString()?`昨天 ${n}`:`${String(t.getMonth()+1)}月${String(t.getDate())}日 ${n}`}function tE(e){let t=new Date(e),n=String(t.getMonth()+1).padStart(2,"0"),a=String(t.getDate()).padStart(2,"0"),i=`${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}`,r=t.getFullYear();return r===new Date().getFullYear()?`${n}-${a} ${i}`:`${r}-${n}-${a} ${i}`}var DE={workspaces:0,"run-overview":1,sessions:1,settings:2,chat:2};function a_(){if(typeof navigator>"u")return"device";let e=typeof navigator.userAgent=="string"?navigator.userAgent:"";return/android/i.test(e)?"android":/ipad|iphone|ipod/i.test(e)?"ios":"device"}function i_(e){return e instanceof ca&&e.message==="HTTP 403"}function r_(e){return i_(e)?"unpaired":"unavailable"}function IE({initialPairError:e}){let[t,n]=(0,be.useState)("checking");return(0,be.useEffect)(()=>(Lk(),Ik(),Tk(),DN({send:i=>{VS({kind:i.kind,message:i.message,...i.source===void 0?{}:{source:i.source},...i.frames===void 0?{}:{frames:i.frames},count:i.count,clientAt:i.at},a_())}})),[]),(0,be.useEffect)(()=>{let a=!0;return Of().then(()=>{a&&n("paired")},i=>{a&&n(r_(i))}),()=>{a=!1}},[]),(0,be.useEffect)(()=>{t==="unpaired"&&(Ub(),Bb())},[t]),t==="checking"?(0,Vt.jsxs)("main",{className:"mobile mobile-empty",role:"status",children:[(0,Vt.jsx)("span",{className:"boot-dot","aria-hidden":!0}),(0,Vt.jsx)("p",{className:"mobile-muted",children:"正在连接..."})]}):t==="unpaired"?(0,Vt.jsx)(zE,{initialError:e,onPaired:a=>{Ub(),Bb(),window.location.replace(a)}}):t==="unavailable"?(0,Vt.jsxs)("main",{className:"mobile mobile-empty",children:[(0,Vt.jsx)("p",{className:"mobile-error",role:"alert",children:"无法连接到运行中的 DSH host。"}),(0,Vt.jsx)("button",{className:"mobile-new",type:"button",onClick:()=>{window.location.reload()},children:"重试"})]}):(0,Vt.jsx)(l_,{onUnpaired:()=>n("unpaired")})}var o_=260,s_=3e4;function l_({onUnpaired:e}){let t=Yf(),[n,a]=(0,be.useState)({current:{route:{kind:"workspaces"},forward:!0},leaving:void 0}),i=n.current.route,r=n.current.forward,o=(0,be.useRef)(void 0),[s,l]=(0,be.useState)(()=>e_(window.location.search)),[c,f]=(0,be.useState)(()=>t_(window.location.search)),[v,g]=(0,be.useState)(()=>n_(window.location.search)),h=(0,be.useRef)(v),w=(0,be.useRef)(void 0),x=(0,be.useRef)(void 0),C=(0,be.useRef)(void 0),p=(0,be.useRef)({open:!1,term:""}),m=(0,be.useRef)({open:!1,term:""}),[b,y]=(0,be.useState)(void 0),N=(0,be.useRef)({workspaceId:"",open:!1,term:""}),[D,O]=(0,be.useState)(void 0),T=(0,be.useRef)(!1),[q,$]=(0,be.useState)(0),F=(0,be.useRef)(void 0),Ie=(0,be.useRef)(()=>{}),at=(0,be.useRef)(new Set),Te=(0,be.useCallback)(()=>{let j=F.current;if(j===void 0){$(at.current.size);return}let Z=new Set(j.runningSessionsSnapshot());for(let ce of j.jobsSnapshot())ce.jobs.some(Ee=>Ee.status==="running"||Ee.status==="stopping")&&Z.add(ce.sessionId);for(let ce of at.current)Z.add(ce);$(Z.size)},[]),je=!0,Je=!1;(0,be.useEffect)(()=>()=>{o.current!==void 0&&clearTimeout(o.current)},[]);let Kt=(0,be.useCallback)(()=>{o.current!==void 0&&clearTimeout(o.current),o.current=window.setTimeout(()=>{a(j=>({current:j.current,leaving:void 0}))},o_)},[]),xe=(0,be.useCallback)(j=>{a(Z=>{let ce=DE[j.kind]>=DE[Z.current.route.kind];return{current:{route:j,forward:ce},leaving:Z.current}}),Kt()},[Kt]);(0,be.useEffect)(()=>{let j=new Bf(void 0,{onUnpaired:e});F.current=j,j.start();let Z=j.onFrame(ce=>{if(ce.type==="session/jobs"||ce.type==="session/subscribed"){Te();return}if(ce.type==="session/event"){let Ee=ce.event.type;(Ee==="turn/start"||Ee==="turn/end")&&Te()}});return Te(),()=>{Z(),j.stop()}},[e,Te]),(0,be.useEffect)(()=>{if(i.kind!=="workspaces"||!t)return;let j=!1,Z,ce=()=>{US().then(({sessionIds:Ee})=>{j||(at.current=new Set(Ee),Te())},()=>{})};return ce(),Z=setInterval(ce,3e4),()=>{j=!0,Z!==void 0&&clearInterval(Z)}},[i.kind,Te,t]),(0,be.useEffect)(()=>(t||Xc(),()=>{iN()}),[t]),(0,be.useEffect)(()=>{F.current?.observe(i.kind==="chat"?i.session.sessionId:void 0)},[i]),(0,be.useEffect)(()=>{let j=i.kind==="chat"?i.session.sessionId:void 0,Z=()=>{db(j).catch(()=>{})};if(Ie.current=Z,!t){db(void 0).catch(()=>{});return}if(Z(),j===void 0)return;let ce=setInterval(Z,s_);return()=>{clearInterval(ce)}},[i,t]),(0,be.useEffect)(()=>{let j=()=>{let Z=F.current;if(typeof document>"u"||document.visibilityState!=="visible"){Z?.pause();return}Z?.resync(),Ie.current()};return document.addEventListener("visibilitychange",j),()=>{document.removeEventListener("visibilitychange",j)}},[]),(0,be.useEffect)(()=>{let j=!1;return Af().then(Z=>{if(j)return;let ce=(Z.namespaces??[]).find(Ae=>Ae.ns==="ui-theme")?.value,Ee=typeof ce=="object"&&ce!==null?ce.preference:void 0;(Ee==="light"||Ee==="dark"||Ee==="system")&&Ff(Ee)},()=>{}),()=>{j=!0}},[]);let _t=j=>{let Z=N.current;O(Z.workspaceId===j&&Z.open?{open:!0,term:Z.term}:void 0)},$e=(0,be.useCallback)(()=>{T.current?y({...m.current}):(i.kind==="chat"&&i.workspace.workspaceId!==Dp.workspaceId||i.kind==="settings")&&_t(i.workspace.workspaceId),a(j=>{let Z=j.current.route;return Z.kind==="chat"?T.current?(T.current=!1,{current:{route:{kind:"workspaces"},forward:!1},leaving:j.current}):Z.fromRunOverview===!0?{current:{route:{kind:"run-overview"},forward:!1},leaving:j.current}:Z.workspace.workspaceId===Dp.workspaceId?{current:{route:{kind:"workspaces"},forward:!1},leaving:j.current}:{current:{route:{kind:"sessions",workspace:Z.workspace},forward:!1},leaving:j.current}:Z.kind==="run-overview"?{current:{route:{kind:"workspaces"},forward:!1},leaving:j.current}:Z.kind==="settings"?{current:{route:{kind:"sessions",workspace:Z.workspace},forward:!1},leaving:j.current}:Z.kind==="sessions"?{current:{route:{kind:"workspaces"},forward:!1},leaving:j.current}:j}),Kt()},[i,Kt]),Ut=(0,be.useCallback)((j,Z,ce,Ee,Ae,Me)=>{xe({kind:"chat",session:j,workspace:Z,...ce!==void 0?{focusSeq:ce}:{},...Ae!==void 0?{focusMessageId:Ae}:{},...Me!==void 0?{focusPartId:Me}:{},...Ee!==void 0?{focusQuery:Ee}:{}}),f(void 0),g(void 0),ce!==void 0&&(h.current=void 0),Ee!==void 0&&(w.current=void 0),Ae!==void 0&&(x.current=void 0),Me!==void 0&&(C.current=void 0)},[xe]),ze=(0,be.useCallback)(j=>{if(s!==void 0||c!==void 0){let Z=new URL(window.location.href);Z.searchParams.delete("workspace"),Z.searchParams.delete("session"),Z.searchParams.delete("seq"),window.history.replaceState(null,"",`${Z.pathname}${Z.search}${Z.hash}`),l(void 0)}xe({kind:"sessions",workspace:j})},[s,c,xe]),He=(0,be.useCallback)((j,Z,ce,Ee,Ae,Me)=>{T.current=!0,m.current={...p.current},l(Z),f(j),g(ce),h.current=ce,w.current=Ee,x.current=Ae,C.current=Me,xe({kind:"workspaces"})},[xe]),Ft=(0,be.useCallback)((j,Z,ce,Ee,Ae)=>{T.current=!0,m.current={...p.current};let Me={sessionId:j.sessionId,title:j.title??"匹配会话",...j.snippet!==void 0&&j.snippet!==""?{preview:j.snippet}:{},updatedAt:0,running:!1,blank:!1};xe({kind:"chat",session:Me,workspace:Dp,...Z!==void 0?{focusSeq:Z}:{},...Ee!==void 0?{focusMessageId:Ee}:{},...Ae!==void 0?{focusPartId:Ae}:{},...ce!==void 0?{focusQuery:ce}:{}})},[xe]),kt=(0,be.useCallback)(j=>{let Z={sessionId:j.sessionId,title:j.title??"会话",updatedAt:0,running:!1,blank:!1};xe({kind:"chat",session:Z,workspace:Dp,fromRunOverview:!0})},[xe]),Gn=i.kind==="chat"?`chat:${i.session.sessionId}`:i.kind==="sessions"?`sessions:${i.workspace.workspaceId}`:i.kind,Nt=n.leaving!==void 0?n.leaving.route.kind==="chat"?`chat:${n.leaving.route.session.sessionId}`:n.leaving.route.kind==="sessions"?`sessions:${n.leaving.route.workspace.workspaceId}`:n.leaving.route.kind:"",ut=r?"fwd":"back",bt=j=>j.kind==="workspaces"?(0,Vt.jsx)(RE,{initialWorkspaceId:s,initialSearch:b,onPick:ze,onLocateSession:He,onOpenDirect:Ft,onOpenRunOverview:()=>{xe({kind:"run-overview"})},runOverviewLive:q,onSearchSnapshot:(Z,ce)=>{p.current={open:Z,term:ce}},onSearchApplied:()=>{y(void 0)}}):j.kind==="run-overview"?(0,Vt.jsx)(K2,{mux:F.current,onBack:$e,onOpenSession:kt}):j.kind==="sessions"?(0,Vt.jsx)(eE,{workspace:j.workspace,mux:F.current,initialSessionId:c,initialSearch:D,onBack:$e,onPick:Z=>{Ut(Z,j.workspace,h.current,w.current,x.current,C.current)},onOpenSettings:()=>{xe({kind:"settings",workspace:j.workspace})},onLocateSession:He,onPickSeq:(Z,ce,Ee,Ae,Me)=>{Ut(Z,j.workspace,ce,Ee,Ae,Me)},onSearchSnapshot:(Z,ce)=>{N.current={workspaceId:j.workspace.workspaceId,open:Z,term:ce}},onSearchApplied:()=>{O(void 0)}}):j.kind==="settings"?(0,Vt.jsx)(xE,{onBack:$e}):(0,Vt.jsx)(G2,{session:j.session,initialFocusSeq:j.focusSeq,initialFocusMessageId:j.focusMessageId,initialFocusPartId:j.focusPartId,initialFocusQuery:j.focusQuery,mux:F.current,onBack:$e,showToolCalls:je,showSystemMessages:Je});return(0,Vt.jsxs)("div",{className:"mobile",children:[(0,Vt.jsxs)("div",{className:"page-stage",children:[n.leaving!==void 0&&(0,Vt.jsx)("div",{className:`page page-exit-${ut}`,"aria-hidden":"true",children:bt(n.leaving.route)},Nt),(0,Vt.jsx)("div",{className:`page page-enter-${ut}`,children:bt(i)},Gn)]}),(0,Vt.jsx)(HN,{})]})}function he(e){return e instanceof Ao?e.error.message:e instanceof ca||e instanceof Error?e.message:String(e)}function Fa(e){return/^HTTP 403/.test(e)?"宿主端插件可能仍在运行旧版本：请重启 dsh web 后再试。":void 0}function c_(e,t){let n=e.events.map(o=>({...o.event,...o.view!==void 0?{view:o.view}:{}})),a=new Yi(Hr(n)),i=dk(n),r=hk(n);return{rows:a.snapshot(),maxSeq:a.lastSeq,hasMore:e.hasMore,...i===void 0?{}:{todo:i},...t&&r!==void 0?{turnStartAt:r}:{},...e.projections===void 0?{}:{projections:e.projections}}}async function ud(e,t,n){let a=t===void 0,i;try{let r=await BS(e,t,void 0,n);i={rows:r.rows,maxSeq:r.maxSeq,hasMore:r.hasMore,...r.todo===void 0?{}:{todo:r.todo},...r.projections===void 0?{}:{projections:r.projections},...a&&r.turnStartAt!==void 0?{turnStartAt:r.turnStartAt}:{}}}catch{i=c_(await Gi(e,t,void 0,n),a)}return a&&zN(e,i),i}var HE=X(Ye(),1);var Kr=X(re(),1),Ip=class e extends HE.Component{state={reason:null};static getDerivedStateFromError(t){return{reason:e.readable(t)}}static readable(t){let a=(LE(t)&&t.message!==""?t.message:String(t??"unknown error")).replace(/\s+/g," ").trim();return a.length<=240?a:`${a.slice(0,239)}…`}componentDidCatch(t,n){qc({kind:"error",message:this.state.reason??"unknown error",stack:LE(t)?t.stack:void 0})}retry=()=>{this.setState({reason:null})};reload=()=>{typeof window<"u"&&window.location.reload()};render(){let t=this.state.reason;return t===null?this.props.children:(0,Kr.jsxs)("main",{className:"mobile mobile-empty mobile-errorpage",role:"alert",children:[(0,Kr.jsx)("h1",{className:"errorpage-title",children:"页面出错了"}),(0,Kr.jsx)("p",{className:"errorpage-reason",children:t}),(0,Kr.jsxs)("div",{className:"errorpage-actions",children:[(0,Kr.jsx)("button",{type:"button",className:"mobile-button",onClick:this.retry,children:"重试"}),(0,Kr.jsx)("button",{type:"button",className:"mobile-button-muted",onClick:this.reload,children:"重新加载"})]})]})}};function LE(e){return e instanceof Error}var VE=`/* ── design tokens ───────────────────────────────────────────────────── */

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
`;var d_="/m/service-worker.js";async function UE(e=typeof navigator>"u"?void 0:navigator.serviceWorker){if(e!==void 0)try{await e.register(d_,{scope:"/m/",updateViaCache:"none"})}catch{}}var Dv=X(re(),1);uN();Ur();var Iv=document.createElement("style");Iv.dataset.plugin="dsh-palm/mobile";Iv.textContent=VE;document.head.appendChild(Iv);var BE=document.getElementById("root");if(BE===null)throw new Error("mobile: #root missing");u_(BE);async function u_(e){let t=await OE(window.location.href);if(t.kind==="accepted"){window.location.replace(t.path);return}t.kind==="failed"&&window.history.replaceState(null,"",t.path),UE(),(0,PE.createRoot)(e).render((0,Dv.jsx)(Ip,{children:(0,Dv.jsx)(IE,{initialPairError:t.kind==="failed"?t.message:void 0})}))}
