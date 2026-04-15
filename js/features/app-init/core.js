;(function(){
function bindAppInitEvents(){
  const localStorageMissingWhileLoggedIn=()=>{
    if(globalThis.S.settings.persistence!=='local_storage')return false;
    if(globalThis.$('app')?.classList.contains('hid'))return false;
    if(globalThis.hasPersistedState&&globalThis.hasPersistedState())return false;
    location.reload();
    return true;
  };
  globalThis.$('buy-h')?.addEventListener('input',globalThis.updBuyH);
  document.addEventListener('click',e=>{
    const btn=e.target.closest('[data-spgf-action]');
    if(!btn)return;
    if(typeof globalThis.handleSpagafonActionButton==='function'){
      globalThis.handleSpagafonActionButton(btn);
      return;
    }
    globalThis.toast('Acțiune indisponibilă momentan. Reîncarcă pagina','warn');
  });
  if(globalThis.isDebugUnlocked())globalThis.$('debug-toggle-btn')?.classList.remove('hid');
  let resizeT=0;
  window.addEventListener('resize',()=>{
    clearTimeout(resizeT);
    resizeT=setTimeout(()=>{globalThis.syncLayoutForViewport();globalThis.syncDebugBarLayout();},120);
  });
  globalThis.syncLayoutForViewport();
  globalThis.normalizeSpagafonSettings();
  globalThis.applySpagafonDisplaySettings();
  window.addEventListener('beforeunload',()=>{
    if(globalThis.S.sessTimer){clearInterval(globalThis.S.sessTimer);globalThis.S.sessTimer=null;}
    if(globalThis.S.settings.persistence==='local_storage')globalThis.saveState();
  });
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState!=='visible')return;
    if(localStorageMissingWhileLoggedIn())return;
    if(globalThis.S.settings.persistence!=='local_storage')return;
    if(globalThis.$('app')?.classList.contains('hid'))return;
    if(globalThis.processOfflineRealTimeGap())globalThis.renderAll();
  });
  window.addEventListener('storage',e=>{
    if(e.key!==globalThis.LS_STATE_KEY)return;
    localStorageMissingWhileLoggedIn();
  });
  if(!globalThis.tryAutoLoginFromLocalStorage?.()){
    globalThis.$('login-screen')?.classList.remove('hid');
    globalThis.$('app')?.classList.add('hid');
  }
}
function initAppInit(){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindAppInitEvents,{once:true});
  else bindAppInitEvents();
}
globalThis.initAppInit=initAppInit;
})();