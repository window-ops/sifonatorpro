;(function(){
function isMobileLayout(){
  try{return window.matchMedia('(max-width:680px)').matches}catch(e){return false}
}
function syncMobileMenuToggleUi(){
  const btn=globalThis.$('mobile-nav-toggle'),lay=globalThis.$('layout');
  if(!btn)return;
  const narrow=isMobileLayout();
  btn.classList.toggle('hid',!narrow);
  if(!narrow)return;
  const menu=!!(lay&&lay.classList.contains('mobile-menu-mode'));
  btn.setAttribute('aria-expanded',menu?'true':'false');
  btn.setAttribute('aria-label',menu?'Înapoi la ecran':'Meniu principal');
  btn.title=menu?'Înapoi la ecranul curent':'Deschide meniul principal';
  const svgBurger='<svg class="mnav-svg" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M4 7h16v2H4V7zm0 6h16v2H4v-2zm0 6h16v2H4v-2z"/></svg>';
  const svgBack='<svg class="mnav-svg" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M4 12l8-8v5h8v6h-8v5l-8-8z"/></svg>';
  btn.innerHTML=menu?svgBack:svgBurger;
}
function toggleMobileMenuShell(){
  const lay=globalThis.$('layout');
  if(!lay||!isMobileLayout())return;
  lay.classList.toggle('mobile-menu-mode');
  syncMobileMenuToggleUi();
}
function syncLayoutForViewport(){
  const lay=globalThis.$('layout');
  if(!lay)return;
  if(!isMobileLayout())lay.classList.remove('mobile-menu-mode');
  syncMobileMenuToggleUi();
}
function navigate(v){
  if(v!=='mantuire')globalThis.mantuireStopLiveTicker();
  if(v==='mantuire'){
    if(!globalThis.mantuireFeatureEnabled()){
      globalThis.toast('Funcția „Mântuire Proiecte” este dezactivată din Setări utilizator','warn');
      v='settings';
    }
    globalThis.ensureMantuireIntegration();
    if(!globalThis.isMantuireLinked()){
      const b=globalThis.mantuireBrand();
      globalThis.toast(`Conectează mai întâi API-ul ${b.navToastName} din Manager Integrări (Instrumente).`,'warn');
      v='integ';
    }
  }
  if(isMobileLayout())globalThis.$('layout')?.classList.remove('mobile-menu-mode');
  document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.nav-i').forEach(x=>x.classList.remove('active'));
  globalThis.$(`view-${v}`)?.classList.add('active');
  document.querySelector(`[data-v="${v}"]`)?.classList.add('active');
  if(v==='dash')globalThis.renderDash();
  if(v==='sub')globalThis.renderSub();
  if(v==='just')globalThis.renderJust();
  if(v==='audit')globalThis.renderAudit();
  if(v==='press')globalThis.renderPress();
  if(v==='ops')globalThis.renderOps();
  if(v==='integ')globalThis.renderInteg();
  if(v==='proj'){globalThis.processMantuireQueue();globalThis.renderProj();globalThis.scheduleMantuireDrainTick();}
  if(v==='mantuire'){globalThis.processMantuireQueue();globalThis.renderMantuire();globalThis.scheduleMantuireDrainTick();}
  if(v==='wand'){globalThis.updWandQuota();globalThis.renderSessions();globalThis.renderWandQueue();globalThis.syncWandSessionUI();}
  if(v==='howto')globalThis.renderHowto();
  if(v==='settings')globalThis.renderSettings();
  if(v==='wandjob')globalThis.renderWandJobView();
  syncMobileMenuToggleUi();
}
function initUiNavigation(){
  globalThis.isMobileLayout=isMobileLayout;
  globalThis.syncMobileMenuToggleUi=syncMobileMenuToggleUi;
  globalThis.toggleMobileMenuShell=toggleMobileMenuShell;
  globalThis.syncLayoutForViewport=syncLayoutForViewport;
  globalThis.navigate=navigate;
}
globalThis.initUiNavigation=initUiNavigation;
})();