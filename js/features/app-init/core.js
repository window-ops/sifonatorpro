;(function(){
function bindAppInitEvents(){
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
    if(globalThis.S.settings.persistence!=='local_storage')return;
    if(globalThis.$('app')?.classList.contains('hid'))return;
    if(globalThis.processOfflineRealTimeGap())globalThis.renderAll();
  });
}
function initAppInit(){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindAppInitEvents,{once:true});
  else bindAppInitEvents();
}
globalThis.initAppInit=initAppInit;
})();