;(function(){
const LS_STATE_KEY='sifonator_state';
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
  try{
    const activeSer=S.activeSession?{...S.activeSession,quotaSecAtStart:S.activeSession.quotaSecAtStart===Infinity?-1:S.activeSession.quotaSecAtStart,pausedMsTotal:S.activeSession.pausedMsTotal||0,_pauseAt:S.activeSession._pauseAt||0}:null;
    localStorage.setItem(LS_STATE_KEY,JSON.stringify({
      settings:S.settings,user:S.user,rep:S.rep,repH:S.repH,siphoned:S.siphoned,justice:S.justice,smsInbox:S.smsInbox,spagafonLastSeen:S.spagafonLastSeen,sub:S.sub,subLapsed:S.subLapsed,
      purchSec:S.purchSec,purchSecUsed:S.purchSecUsed,sessions:S.sessions,activeSession:activeSer,judiciaryRisk:S.judiciaryRisk,
      pressTone:S.pressTone,pressHistory:S.pressHistory,timeShiftSec:S.timeShiftSec,userControls:S.userControls,wandQueue:S.wandQueue,
      projFilter:S.projFilter,pressDefaultChannel:S.pressDefaultChannel||'tv_local',wandJobDetailId:S.wandJobDetailId??null,wandLogMoneyFilter:!!S._wandLogMoneyFilter,
      projects:S.projects,tenders:S.tenders,integrations:S.integrations,mantuire:S.mantuire,
      actLog:S.actLog,npid:S.npid,ntid:S.ntid,ledger:S.ledger,actors:S.actors,worldMemory:S.worldMemory,simClock:S.simClock
    }));
    globalThis.persistLastRealVisitTs();
  }catch(e){}
}
function loadState(){
  const S=globalThis.S;
  try{
    const raw=localStorage.getItem(LS_STATE_KEY);
    if(!raw)return false;
    const d=JSON.parse(raw);
    if(!d||!d.settings)return false;
    Object.assign(S,d);
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
function initLocalStorageUtils(){
  globalThis.LS_STATE_KEY=LS_STATE_KEY;
  globalThis.sanitizePersistedPreferencesFromLoad=sanitizePersistedPreferencesFromLoad;
  globalThis.saveState=saveState;
  globalThis.loadState=loadState;
  globalThis.exportLocalStorageState=exportLocalStorageState;
  globalThis.wipeLocalStorageAndReload=wipeLocalStorageAndReload;
  globalThis.deleteLocalStorageAndSignOut=deleteLocalStorageAndSignOut;
}
globalThis.initLocalStorageUtils=initLocalStorageUtils;
})();