;(function(){
function toast(msg,type=''){
  const el=document.createElement('div');
  el.className=`toast ${type}`;
  el.textContent=msg;
  globalThis.$('toasts')?.appendChild(el);
  setTimeout(()=>el.remove(),type==='away'?7200:4200);
}
function initUiToasts(){
  globalThis.toast=toast;
}
globalThis.initUiToasts=initUiToasts;
})();