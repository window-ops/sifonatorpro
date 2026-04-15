;(function(){
let demoChoice='demo';
function applyDemoSeed(){
  globalThis.S.projects=JSON.parse(JSON.stringify(globalThis.DEMO_PROJ||[]));
  globalThis.S.tenders=JSON.parse(JSON.stringify(globalThis.DEMO_TEND||[]));
  globalThis.S.actLog=JSON.parse(JSON.stringify(globalThis.DEMO_LOG||[])).reverse();
  globalThis.S.repH=JSON.parse(JSON.stringify(globalThis.DEMO_REPH||[]));
  globalThis.S.rep=11;
  globalThis.S.npid=Math.max(1,...globalThis.S.projects.map(p=>Number(p.id)||0))+1;
  globalThis.S.ntid=Math.max(1,...globalThis.S.tenders.map(t=>Number(t.id)||0))+1;
  globalThis.S.purchSec=7200;
  globalThis.S.purchSecUsed=0;
  globalThis.S.activeSession=null;
  globalThis.S.sessions=[];
  globalThis.S.wandQueue=[];
  globalThis.S.wandJobDetailId=null;
  globalThis.S.sub=null;
  globalThis.S.subLapsed=null;
  globalThis.S.simClock={monthTick:0,lastAdvanceTs:0};
  globalThis.S.pressTone=50;
  globalThis.S.pressHistory=[];
  globalThis.S.worldMemory={blacklistedFirms:[],hostilePress:[],magistrateHeat:0,lastSpilloverMonth:-1,lastInvestigativePressMonth:-1,investigativeLedger:{}};
  globalThis.S.justice={stage:'clean',pressure:0,timeline:[],debugPin:false,dnaEscalation:false,anafAuditMessage:'',anafAuditSince:0,anafAuditShowBanner:false};
  globalThis.S.integrations={psdDC:{linked:false,apiKey:'',draftKey:'',pendingVerifyCode:''},anafSync:{linked:false,apiKey:'',draftKey:'',pendingCertCode:'',wizardPhase:1,dosarTicks:0},mantuireCloud:{linked:false,apiKey:'',draftKey:'',pendingVerifyCode:'',wizardPhase:1,registryTicks:0,keyEnv:'live',keyCreatedAt:0,lastUsedAt:0,apiTier:'parohial',registrationPaid:false}};
  globalThis.S.mantuire={credits:5,serverId:'proto_iasi',queue:[],history:[],usageLog:[],usageByDay:{},stats:{ok:0,fail:0},showUmDayChart:false};
}
function selDemo(v){
  demoChoice=v;
  globalThis.$('opt-demo')?.classList.toggle('sel',v==='demo');
  globalThis.$('opt-empty')?.classList.toggle('sel',v==='empty');
}
function doLogin(){
  globalThis.S.settings.persistence=globalThis.$('l-persist')?.value||'in_memory';
  if(globalThis.S.settings.persistence==='local_storage'&&globalThis.loadState()){
    globalThis.dismissDisc?.();
    globalThis.$('login-screen')?.classList.add('hid');
    globalThis.processOfflineRealTimeGap();
    globalThis.migrateSubState();
    globalThis.ensureWandTimer();
    applyProfile();
    globalThis.renderAll();
    globalThis.$('app')?.classList.remove('hid');
    globalThis.updSpagafonBadge();
    globalThis.toast('Autentificat automat din localStorage','ok');
    return;
  }
  const name=globalThis.$('l-name')?.value?.trim();
  if(!name){globalThis.toast('Introdu numele tău','err');return}
  globalThis.S.user.name=name;
  globalThis.S.user.fn=globalThis.$('l-fn')?.value;
  globalThis.S.user.jud=globalThis.$('l-jud')?.value;
  globalThis.S.user.party=globalThis.$('l-party')?.value;
  globalThis.S.user.since=globalThis.nowDate().toLocaleDateString('ro-RO');
  globalThis.S.settings.persona=globalThis.$('l-persona')?.value||'primarie';
  globalThis.S.settings.difficulty=globalThis.$('l-diff')?.value||'normal';
  globalThis.S.pressDefaultChannel=globalThis.$('l-press-def')?.value||'tv_local';
  const persona=globalThis.PERSONAS[globalThis.S.settings.persona]||globalThis.PERSONAS.primarie;
  globalThis.S.ledger.publicBudget=persona.budget;
  if(demoChoice==='demo'){
    applyDemoSeed();
    globalThis.S.ledger.publicBudget=persona.budget;
  }
  globalThis.initActors();
  globalThis.recalcJudiciaryPressure();
  globalThis.migrateSubState();
  globalThis.$('login-screen')?.classList.add('hid');
  applyProfile();
  globalThis.spagafonWelcome();
  globalThis.renderAll();
  globalThis.$('app')?.classList.remove('hid');
  globalThis.updSpagafonBadge();
  globalThis.saveState();
  globalThis.toast(`Autentificat cu succes, ${name}!`,'ok');
}
function tryAutoLoginFromLocalStorage(){
  if(!globalThis.hasPersistedState||!globalThis.hasPersistedState())return false;
  if(!globalThis.loadState||!globalThis.loadState())return false;
  if(globalThis.S.settings.persistence!=='local_storage')return false;
  if(!globalThis.S.user||!String(globalThis.S.user.name||'').trim())return false;
  globalThis.$('l-persist') && (globalThis.$('l-persist').value='local_storage');
  globalThis.dismissDisc?.();
  globalThis.$('login-screen')?.classList.add('hid');
  globalThis.processOfflineRealTimeGap();
  globalThis.migrateSubState();
  globalThis.ensureWandTimer();
  applyProfile();
  globalThis.renderAll();
  globalThis.$('app')?.classList.remove('hid');
  globalThis.updSpagafonBadge();
  return true;
}
function applyProfile(){
  globalThis.$('hb-name') && (globalThis.$('hb-name').textContent=globalThis.S.user.name);
  globalThis.$('hb-party') && (globalThis.$('hb-party').textContent=globalThis.S.user.party, globalThis.$('hb-party').style.background=globalThis.partyColor(globalThis.S.user.party));
  globalThis.$('hb-fn') && (globalThis.$('hb-fn').textContent=`${globalThis.S.user.fn} · ${globalThis.S.user.jud}`);
  globalThis.$('dash-greet') && (globalThis.$('dash-greet').textContent=`Bună ziua, ${globalThis.S.user.name}! Ce sifonăm azi?`);
}
function initAppInitLoginFlow(){
  globalThis.selDemo=selDemo;
  globalThis.doLogin=doLogin;
  globalThis.tryAutoLoginFromLocalStorage=tryAutoLoginFromLocalStorage;
  globalThis.applyProfile=applyProfile;
}
globalThis.initAppInitLoginFlow=initAppInitLoginFlow;
})();