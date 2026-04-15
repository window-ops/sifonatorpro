;(function(){
const LS_STATE_KEY='sifonator_state';
function shouldSkipLocalStorageSaveOnce(){
  return !!globalThis.__skipLocalStorageSaveOnce;
}
function setSkipLocalStorageSaveOnce(v){
  globalThis.__skipLocalStorageSaveOnce=!!v;
}
function stripDangerousMarkup(s){
  // Defense-in-depth: persisted state must never contain markup that could become executable
  // if any UI render path forgets escapeHtml.
  return String(s==null?'':s)
    .replace(/[\u0000-\u001F\u007F]/g,' ')
    .replace(/\s{2,}/g,' ')
    .trim();
}
function sanitizeLoadedState(d){
  if(!d||typeof d!=='object')return d;
  // User profile strings (shown in multiple places).
  if(d.user&&typeof d.user==='object'){
    if(typeof d.user.name==='string')d.user.name=stripDangerousMarkup(d.user.name);
    if(typeof d.user.fn==='string')d.user.fn=stripDangerousMarkup(d.user.fn);
    if(typeof d.user.jud==='string')d.user.jud=stripDangerousMarkup(d.user.jud);
    if(typeof d.user.party==='string')d.user.party=stripDangerousMarkup(d.user.party);
    if(typeof d.user.since==='string')d.user.since=stripDangerousMarkup(d.user.since);
  }
  // Core entities frequently rendered into HTML strings.
  if(Array.isArray(d.projects)){
    d.projects.forEach(p=>{
      if(!p||typeof p!=='object')return;
      if(typeof p.name==='string')p.name=stripDangerousMarkup(p.name);
      if(Array.isArray(p.dossier))p.dossier.forEach(r=>{
        if(!r||typeof r!=='object')return;
        if(typeof r.t==='string')r.t=stripDangerousMarkup(r.t);
        if(typeof r.txt==='string')r.txt=stripDangerousMarkup(r.txt);
      });
    });
  }
  if(Array.isArray(d.tenders)){
    d.tenders.forEach(t=>{
      if(!t||typeof t!=='object')return;
      if(typeof t.name==='string')t.name=stripDangerousMarkup(t.name);
      if(typeof t.winner==='string')t.winner=stripDangerousMarkup(t.winner);
      if(typeof t.evalSummary==='string')t.evalSummary=stripDangerousMarkup(t.evalSummary);
    });
  }
  if(Array.isArray(d.actLog)){
    d.actLog.forEach(a=>{
      if(!a||typeof a!=='object')return;
      if(typeof a.t==='string')a.t=stripDangerousMarkup(a.t);
      if(typeof a.txt==='string')a.txt=stripDangerousMarkup(a.txt);
    });
  }
  if(Array.isArray(d.smsInbox)){
    d.smsInbox.forEach(m=>{
      if(!m||typeof m!=='object')return;
      if(typeof m.from==='string')m.from=stripDangerousMarkup(m.from);
      if(typeof m.body==='string')m.body=stripDangerousMarkup(m.body);
    });
  }
  return d;
}
function sanitizePersistedPreferencesFromLoad(d){
  const S=globalThis.S;
  const pf=String(S.projFilter||'all');
  S.projFilter=['all','in_progress','completed','late'].includes(pf)?pf:'all';
  const ch=String(S.pressDefaultChannel||'tv_local');
  S.pressDefaultChannel=(globalThis.PRESS_CHANNELS||['tv_local','tv_national','social','investigatii']).includes(ch)?ch:'tv_local';
  if(typeof d==='object'&&d&&typeof d.wandLogMoneyFilter==='boolean')S._wandLogMoneyFilter=d.wandLogMoneyFilter;
  else if(typeof S._wandLogMoneyFilter!=='boolean')S._wandLogMoneyFilter=false;
  try{delete S.wandLogMoneyFilter;}catch(e){}
  const wjid=S.wandJobDetailId;
  if(wjid!=null&&wjid!==''){
    const ok=Array.isArray(S.wandQueue)&&S.wandQueue.some(q=>q.id===wjid||String(q.id)===String(wjid));
    if(!ok)S.wandJobDetailId=null;
  }else S.wandJobDetailId=null;
}
function saveState(){
  const S=globalThis.S;
  if(S.settings.persistence!=='local_storage')return;
  if(shouldSkipLocalStorageSaveOnce())return;
  // If localStorage existed in this runtime and was deleted afterwards, do not recreate it.
  if(globalThis.__lsStateInitialized===true&&!hasPersistedState())return;
  try{
    const payload={...S};
    payload.sessTimer=null;
    payload.pending3DS=null;
    payload._wandLogMoneyFilter=!!S._wandLogMoneyFilter;
    payload.pressDefaultChannel=S.pressDefaultChannel||'tv_local';
    payload.wandJobDetailId=S.wandJobDetailId??null;
    payload.activeSession=S.activeSession
      ?{...S.activeSession,quotaSecAtStart:S.activeSession.quotaSecAtStart===Infinity?-1:S.activeSession.quotaSecAtStart,pausedMsTotal:S.activeSession.pausedMsTotal||0,_pauseAt:S.activeSession._pauseAt||0}
      :null;
    localStorage.setItem(LS_STATE_KEY,JSON.stringify(payload));
    globalThis.__lsStateInitialized=true;
    globalThis.persistLastRealVisitTs();
  }catch(e){}
}
function loadState(){
  const S=globalThis.S;
  try{
    const raw=localStorage.getItem(LS_STATE_KEY);
    if(!raw)return false;
    const d=sanitizeLoadedState(JSON.parse(raw));
    if(!d||!d.settings)return false;
    Object.assign(S,d);
    globalThis.__lsStateInitialized=true;
    if(S.justice){
      if(typeof S.justice.debugPin!=='boolean')S.justice.debugPin=false;
      if(typeof S.justice.dnaEscalation!=='boolean')S.justice.dnaEscalation=false;
      if(typeof S.justice.anafAuditMessage!=='string')S.justice.anafAuditMessage='';
      if(typeof S.justice.anafAuditSince!=='number')S.justice.anafAuditSince=0;
      if(typeof S.justice.anafAuditShowBanner!=='boolean')S.justice.anafAuditShowBanner=false;
      globalThis.migrateJusticeTimelineChronology();
    }
    if(!Array.isArray(S.smsInbox))S.smsInbox=[];
    if(typeof S.spagafonLastSeen!=='number')S.spagafonLastSeen=0;
    S.pending3DS=null;
    if(!S.userControls||typeof S.userControls!=='object')S.userControls={repPublicSlider:0};
    globalThis.ensureWorldMemoryShape();
    if(!Array.isArray(S.wandQueue))S.wandQueue=[];
    sanitizePersistedPreferencesFromLoad(d);
    if(typeof S.subLapsed!=='object')S.subLapsed=null;
    globalThis.ensureIntegrations();
    globalThis.ensureMantuireState();
    globalThis.ensureMantuireIntegration();
    if(typeof globalThis.normalizeDifficultySettings==='function')globalThis.normalizeDifficultySettings();
    globalThis.migrateSubState();
    globalThis.normalizeSpagafonSettings();
    if(typeof S.settings.skipProjectFinalizeConfirm!=='boolean')S.settings.skipProjectFinalizeConfirm=false;
    if(typeof S.settings.enableFinalizeExecAssist!=='boolean')S.settings.enableFinalizeExecAssist=true;
    if(typeof S.settings.enableMantuireFeature!=='boolean')S.settings.enableMantuireFeature=true;
    if(typeof S.settings.mantuireNeutralBranding!=='boolean')S.settings.mantuireNeutralBranding=false;
    globalThis.applySpagafonDisplaySettings();
    if(S.subLapsed&&S.subLapsed.tier&&typeof globalThis.setSubExpiredPromptPending==='function'){
      globalThis.setSubExpiredPromptPending(true);
    }
    globalThis.fixLoadedActiveSession();
    return true;
  }catch(e){return false;}
}
function exportLocalStorageState(){
  const S=globalThis.S;
  if(S.settings.persistence!=='local_storage'){globalThis.toast('Exportul necesită persistență localStorage (setată la login)','warn');return;}
  saveState();
  const raw=localStorage.getItem(globalThis.LS_STATE_KEY)||'{}';
  const blob=new Blob([raw],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`${globalThis.LS_STATE_KEY}.json`;
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),2000);
  globalThis.toast('Fișier descărcat','ok');
}
function wipeLocalStorageAndReload(){
  setSkipLocalStorageSaveOnce(true);
  try{
    localStorage.removeItem(globalThis.LS_STATE_KEY);
    localStorage.removeItem(globalThis.LS_LAST_REAL_VISIT||'sifonator_last_real_visit_ts');
  }catch(e){}
  location.reload();
}
function deleteLocalStorageAndSignOut(){
  globalThis.dlgOpen('Șterge date locale','','<p class="tsm tmut">Se șterge <code>sifonator_state</code> și se reîncarcă pagina. Vei fi deconectat.</p>',
    `<button type="button" class="btn btn-f" onclick="dlgClose()">Renunță</button>
     <button type="button" class="btn btn-d" onclick="wipeLocalStorageAndReload()">Șterge &amp; ieșire</button>`);
}
function hasPersistedState(){
  try{return !!localStorage.getItem(LS_STATE_KEY);}catch(e){return false;}
}
function initLocalStorageUtils(){
  globalThis.LS_STATE_KEY=LS_STATE_KEY;
  globalThis.sanitizePersistedPreferencesFromLoad=sanitizePersistedPreferencesFromLoad;
  globalThis.saveState=saveState;
  globalThis.loadState=loadState;
  globalThis.exportLocalStorageState=exportLocalStorageState;
  globalThis.wipeLocalStorageAndReload=wipeLocalStorageAndReload;
  globalThis.deleteLocalStorageAndSignOut=deleteLocalStorageAndSignOut;
  globalThis.hasPersistedState=hasPersistedState;
  globalThis.shouldSkipLocalStorageSaveOnce=shouldSkipLocalStorageSaveOnce;
  globalThis.setSkipLocalStorageSaveOnce=setSkipLocalStorageSaveOnce;
  if(typeof globalThis.__skipLocalStorageSaveOnce!=='boolean')globalThis.__skipLocalStorageSaveOnce=false;
  if(typeof globalThis.__lsStateInitialized!=='boolean')globalThis.__lsStateInitialized=hasPersistedState();
}
globalThis.initLocalStorageUtils=initLocalStorageUtils;
})();