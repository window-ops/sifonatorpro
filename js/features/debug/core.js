;(function(){
function isDebugUnlocked(){
  try{
    if(new URLSearchParams(location.search).get('debug')==='1')return true;
    if(localStorage.getItem('sifonator_debug')==='1')return true;
  }catch(e){}
  return false;
}
function syncDebugBarLayout(){
  if(!isDebugUnlocked())return;
  const bar=globalThis.$('debug-bar');
  const open=bar&&!bar.classList.contains('hid');
  document.body.classList.toggle('debug-bar-visible',!!open);
  if(open&&bar){
    const h=bar.offsetHeight;
    document.documentElement.style.setProperty('--debug-bar-h',`${Math.ceil(h)}px`);
  }else{
    document.documentElement.style.removeProperty('--debug-bar-h');
  }
}
function toggleDebug(){
  if(!isDebugUnlocked()){globalThis.toast('Mod debug: adaugă ?debug=1 la URL sau localStorage sifonator_debug=1','warn');return;}
  globalThis.$('debug-bar')?.classList.toggle('hid');
  requestAnimationFrame(()=>requestAnimationFrame(updDebug));
}
function updDebug(){
  globalThis.checkSubLifecycle();
  globalThis.$('db-rep')&&(globalThis.$('db-rep').textContent=globalThis.S.rep);
  globalThis.$('db-sub')&&(globalThis.$('db-sub').textContent=globalThis.hasPaidSubscription()?globalThis.S.sub.tier:'fără (gratuit)');
  globalThis.$('db-wand')&&(globalThis.$('db-wand').textContent=globalThis.fSec(globalThis.wandAvailSec()));
  globalThis.$('db-siph')&&(globalThis.$('db-siph').textContent=globalThis.fRON(globalThis.S.siphoned));
  globalThis.$('db-just')&&(globalThis.$('db-just').textContent=globalThis.justiceStageRo(globalThis.S.justice?.stage||'clean'));
  globalThis.$('db-shift')&&(globalThis.$('db-shift').textContent=`${globalThis.S.timeShiftSec<0?'-':'+'}${globalThis.fSec(Math.abs(globalThis.S.timeShiftSec))}`);
  const apiEl=globalThis.$('db-api');
  if(apiEl){
    const p=globalThis.isPsdDcLinked()?'✓':'-';
    const a=globalThis.isAnafSyncLinked()?'✓':'-';
    const m=globalThis.isMantuireLinked()?'✓':'-';
    apiEl.textContent=`${p}/${a}/${m}`;
  }
  const mCred=globalThis.$('db-mant-credits-btn');
  if(mCred){
    const ok=globalThis.isMantuireLinked();
    mCred.disabled=!ok;
    mCred.title=ok?'Adaugă 50 unități monetare simulate Mântuire':'Necesită API Mântuire Proiecte activă (ex. „+ API Mântuire”)';
  }
  if(isDebugUnlocked())syncDebugBarLayout();
}
function dbAddRep(n){globalThis.chgRep(n,`[DEBUG] +${n} puncte adăugate manual`);}
function dbAddTime(s){
  if(globalThis.hasPaidSubscription())globalThis.S.sub.secUsed=Math.max(0,globalThis.S.sub.secUsed-s);
  else globalThis.S.purchSec+=s;
  globalThis.updWandQuota();globalThis.toast(`[DEBUG] +${globalThis.fSec(s)} timp Bagheta adăugat`,'ok');
}
function dbActivateSub(tid){globalThis.activateSub(tid);globalThis.renderSub();globalThis.renderDash();globalThis.toast(`[DEBUG] Abonament ${tid} activat`,'ok');}
function dbSimuleazaControlANAF(){
  globalThis.triggerDNA({fromDebug:true});
  globalThis.addAct('[DEBUG] Simulare control ANAF / escaladare judiciară');
  globalThis.toast('[DEBUG] Control ANAF simulat','warn');
}
function dbLeakPresa(){
  globalThis.S.pressTone=Math.max(0,globalThis.S.pressTone-12);
  globalThis.addAct('[DEBUG] Leak către presă: document intern publicat');
  globalThis.renderPress();
  globalThis.toast('[DEBUG] Presa a primit un leak controlat','warn');
}
function dbCreateProj(){
  const id=globalThis.S.npid++;
  const name=`[DEBUG] Proiect rapid #${id}`;
  const dp={id,name,budget:900000,realValue:540000,declaredValue:1180000,status:'in_progress',quality:null,bet:null,due:new Date(globalThis.nowTs()+86400000*120).toISOString().slice(0,10),lateS:false,lateF:false,projCategory:'diverse'};
  globalThis.seedDossierIfEmpty(dp,'[DEBUG] Înregistrare proiect rapid.');
  globalThis.S.projects.push(dp);
  globalThis.updWandProjectOptions(id);
  globalThis.renderProj();globalThis.renderDash();globalThis.renderOps();
  globalThis.toast(`[DEBUG] Creat: ${name}`,'ok');
}
function dbTickWand(seconds){
  if(!globalThis.S.activeSession){globalThis.toast('[DEBUG] Nu există sesiune activă','warn');return;}
  globalThis.S.activeSession.startReal-=seconds*1000;
  globalThis.tickSession();
  globalThis.toast(`[DEBUG] Avansat sesiunea cu ${globalThis.fSec(seconds)}`,'ok');
}
function dbShiftTime(seconds){
  globalThis.S.timeShiftSec+=seconds;
  const months=Math.floor(seconds/(86400*30));
  if(months>0)globalThis.advanceSimulationMonths(months);
  globalThis.checkSubLifecycle();
  globalThis.recalcJudiciaryPressure();
  globalThis.renderAll();
  globalThis.toast(`[DEBUG] Timp virtual avansat cu ${globalThis.fSec(seconds)}`,'ok');
}
function dbResetTimeShift(){
  globalThis.S.timeShiftSec=0;
  globalThis.renderAll();
  globalThis.toast('[DEBUG] Shift temporal resetat','ok');
}
function dbInstantApiPsd(){
  globalThis.ensureIntegrations();
  const dc=globalThis.S.integrations.psdDC;
  dc.linked=true;dc.apiKey=globalThis.generatePsdDcApiKey();dc.draftKey='';dc.pendingVerifyCode='';
  globalThis.saveState();
  globalThis.renderInteg();
  if(globalThis.$('psd-dc-portal')&&!globalThis.$('psd-dc-portal').classList.contains('hid'))globalThis.openPsdDcPortal();
  globalThis.addAct('[DEBUG] PSD Direct Connect: legătură instantanee (cheie nouă).');
  globalThis.toast('[DEBUG] PSD Direct Connect activat','ok');
  globalThis.updDebug();
}
function dbInstantApiMantuire(){
  globalThis.debugEnableMantuireIntegrationInstant();
  globalThis.addAct('[DEBUG] Mântuire Proiecte: API activată instant (cheie nouă).');
  globalThis.toast('[DEBUG] Mântuire API activată','ok');
  globalThis.updDebug();
}
function dbInstantApiAll(){
  globalThis.ensureIntegrations();
  const dc=globalThis.S.integrations.psdDC;
  dc.linked=true;dc.apiKey=globalThis.generatePsdDcApiKey();dc.draftKey='';dc.pendingVerifyCode='';
  const a=globalThis.S.integrations.anafSync;
  a.linked=true;a.apiKey=globalThis.generateAnafSyncApiKey();a.draftKey='';a.pendingCertCode='';a.wizardPhase=5;a.dosarTicks=globalThis.ANAF_DOSAR_TICKS_NEED||6;
  globalThis.debugEnableMantuireIntegrationInstant();
  globalThis.saveState();
  globalThis.renderInteg();globalThis.renderMantuire();globalThis.renderAudit();
  if(globalThis.$('psd-dc-portal')&&!globalThis.$('psd-dc-portal').classList.contains('hid'))globalThis.openPsdDcPortal();
  if(globalThis.$('anaf-sync-portal')&&!globalThis.$('anaf-sync-portal').classList.contains('hid'))globalThis.openAnafSyncPortal();
  globalThis.addAct('[DEBUG] Toate integrările API activate dintr-o dată.');
  globalThis.toast('[DEBUG] PSD + ANAF + Mântuire API activate','ok');
  globalThis.updDebug();
}
function dbSpagafonSampleSms(){
  const code=String(100000+Math.floor(Math.random()*900000));
  globalThis.spagafonPushSms('SifonPay',`Cod 3D Secure: ${code}. Valabil 10 minute.`,{code,is3ds:true});
  globalThis.toast('[DEBUG] SMS simulat în Șpagafon','ok');
}
function dbMantuireCredits(n){globalThis.debugAddMantuireCredits(n);}
function dbReset(){
  if(!confirm('Resetezi toată starea aplicației?'))return;
  globalThis.S.rep=0;globalThis.S.repH=[];globalThis.S.siphoned=0;globalThis.S.justice={stage:'clean',pressure:0,timeline:[],debugPin:false,dnaEscalation:false,anafAuditMessage:'',anafAuditSince:0,anafAuditShowBanner:false};globalThis.S.sub=null;globalThis.S.subLapsed=null;
  if(typeof globalThis.legacyDebugResetEphemeralUiState==='function')globalThis.legacyDebugResetEphemeralUiState();
  globalThis.S.smsInbox=[];globalThis.S.pending3DS=null;globalThis.S.spagafonLastSeen=0;
  globalThis.S.integrations={psdDC:{linked:false,apiKey:'',draftKey:'',pendingVerifyCode:''},anafSync:{linked:false,apiKey:'',draftKey:'',pendingCertCode:'',wizardPhase:1,dosarTicks:0},mantuireCloud:{linked:false,apiKey:'',draftKey:'',pendingVerifyCode:'',wizardPhase:1,registryTicks:0,keyEnv:'live',keyCreatedAt:0,lastUsedAt:0,apiTier:'parohial',registrationPaid:false}};
  globalThis.S.mantuire={credits:5,serverId:'proto_iasi',queue:[],history:[],usageLog:[],usageByDay:{},stats:{ok:0,fail:0},showUmDayChart:false};
  globalThis.S.purchSec=0;globalThis.S.purchSecUsed=0;globalThis.S.activeSession=null;globalThis.S.sessions=[];globalThis.S.judiciaryRisk=0;globalThis.S.pressTone=50;globalThis.S.timeShiftSec=0;
  globalThis.S.userControls={repPublicSlider:0};globalThis.S.wandQueue=[];globalThis.S.wandJobDetailId=null;globalThis.S._wandLogMoneyFilter=false;
  globalThis.S.projFilter='all';globalThis.S.pressDefaultChannel='tv_local';
  globalThis.S.worldMemory={blacklistedFirms:[],hostilePress:[],magistrateHeat:0,lastSpilloverMonth:-1,lastInvestigativePressMonth:-1,investigativeLedger:{}};
  if(globalThis.S.sessTimer){clearInterval(globalThis.S.sessTimer);globalThis.S.sessTimer=null;}
  globalThis.ensureWandTimer();
  globalThis.renderAll();globalThis.toast('[DEBUG] Stare resetată','warn');
}
function initDebugFeature(){
  globalThis.isDebugUnlocked=isDebugUnlocked;
  globalThis.syncDebugBarLayout=syncDebugBarLayout;
  globalThis.toggleDebug=toggleDebug;
  globalThis.updDebug=updDebug;
  globalThis.dbAddRep=dbAddRep;
  globalThis.dbAddTime=dbAddTime;
  globalThis.dbActivateSub=dbActivateSub;
  globalThis.dbSimuleazaControlANAF=dbSimuleazaControlANAF;
  globalThis.dbLeakPresa=dbLeakPresa;
  globalThis.dbCreateProj=dbCreateProj;
  globalThis.dbTickWand=dbTickWand;
  globalThis.dbShiftTime=dbShiftTime;
  globalThis.dbResetTimeShift=dbResetTimeShift;
  globalThis.dbInstantApiPsd=dbInstantApiPsd;
  globalThis.dbInstantApiMantuire=dbInstantApiMantuire;
  globalThis.dbInstantApiAll=dbInstantApiAll;
  globalThis.dbSpagafonSampleSms=dbSpagafonSampleSms;
  globalThis.dbMantuireCredits=dbMantuireCredits;
  globalThis.dbReset=dbReset;
}
globalThis.initDebugFeature=initDebugFeature;
})();