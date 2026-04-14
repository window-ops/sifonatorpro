;(function(){
const S={
  user:{name:'',fn:'',jud:'',party:'PSD',since:''},
  settings:{difficulty:'normal',persona:'primarie',persistence:'in_memory',spagafonLauncherMode:'both',spagafonMobileFullDisplay:false,skipProjectFinalizeConfirm:false,enableFinalizeExecAssist:true,enableMantuireFeature:true,mantuireNeutralBranding:false},
  simClock:{monthTick:0,lastAdvanceTs:0},
  ledger:{publicBudget:0,redistributedSurplus:0,influenceSpend:0,reputationCost:0},
  actors:[],
  worldMemory:{blacklistedFirms:[],hostilePress:[],magistrateHeat:0,lastSpilloverMonth:-1,lastInvestigativePressMonth:-1,investigativeLedger:{}},
  rep:0,repH:[],
  siphoned:0,
  justice:{stage:'clean',pressure:0,timeline:[],debugPin:false,dnaEscalation:false,anafAuditMessage:'',anafAuditSince:0,anafAuditShowBanner:false},
  sub:null,
  subLapsed:null,
  purchSec:0,
  purchSecUsed:0,
  activeSession:null,
  sessTimer:null,
  sessions:[],
  judiciaryRisk:0,
  pressTone:50,
  pressHistory:[],
  timeShiftSec:0,
  userControls:{repPublicSlider:0},
  wandQueue:[],
  wandJobDetailId:null,
  _wandLogMoneyFilter:false,
  projFilter:'all',
  pressDefaultChannel:'tv_local',
  projects:[],
  tenders:[],
  actLog:[],
  npid:1,ntid:1,
  smsInbox:[],
  pending3DS:null,
  spagafonLastSeen:0,
  integrations:{psdDC:{linked:false,apiKey:'',draftKey:'',pendingVerifyCode:''},anafSync:{linked:false,apiKey:'',draftKey:'',pendingCertCode:'',wizardPhase:1,dosarTicks:0},mantuireCloud:{linked:false,apiKey:'',draftKey:'',pendingVerifyCode:'',wizardPhase:1,registryTicks:0,keyEnv:'live',keyCreatedAt:0,lastUsedAt:0,apiTier:'parohial',registrationPaid:false}},
  mantuire:{credits:5,serverId:'proto_iasi',queue:[],history:[],usageLog:[],usageByDay:{},stats:{ok:0,fail:0},showUmDayChart:false},
};
const DIFFS={easy:0.85,normal:1,hard:1.2};
const PRESS_CHANNELS=['tv_local','tv_national','social','investigatii'];
const TIME_SHIFT_MAX_DAYS=30;
const PLANS=[
  {id:'free',name:'Starter Gratuit',price:0,secMonth:0,maxOngoing:2,maxPending:2,repMultCap:0,feats:['Max. 2 proiecte în desfășurare','Max. 2 proiecte planificate','Fără protecție judiciară plătită','Fără shift temporal','Bagheta: doar ore cumpărate'],protection:false,timeShift:false,feat:false},
  {id:'basic',name:'Corupt Basic',price:99,secMonth:7200,maxOngoing:5,maxPending:5,repMultCap:0.05,feats:['Max. 5 proiecte în lucru / 5 planificate','Licitații standard',`Shift temporal (până la ${TIME_SHIFT_MAX_DAYS} zile)`,'Bonus reputație la proiecte până la 5%'],protection:true,timeShift:true,feat:false},
  {id:'pro',name:'Oligarh Pro',price:499,secMonth:36000,maxOngoing:20,maxPending:20,repMultCap:0.15,feats:['Max. 20 proiecte în lucru / 20 planificate','Licitații prioritare','Shift temporal','Bonus reputație la proiecte până la 15%'],protection:true,timeShift:true,feat:true},
  {id:'ent',name:'Interlop Enterprise',price:1999,secMonth:-1,maxOngoing:Infinity,maxPending:Infinity,repMultCap:0.25,feats:['Proiecte nelimitate','Protector DNA inclus','Shift temporal','Bonus reputație la proiecte până la 25%','Bagheta nelimitată/lună'],protection:true,timeShift:true,feat:false},
];
function diffTune(){
  const d=S.settings.difficulty||'normal';
  return{
    judiciary:DIFFS[d]||1,
    repGain:d==='easy'?1.12:d==='hard'?0.88:1,
    repLoss:d==='easy'?0.88:d==='hard'?1.12:1,
    pressCost:d==='easy'?0.88:d==='hard'?1.15:1,
    wandRate:d==='easy'?1.08:d==='hard'?0.9:1,
    fundHeat:d==='easy'?0.9:d==='hard'?1.1:1,
    tenderLuck:d==='easy'?1.08:d==='hard'?0.92:1,
    justiceRepCost:d==='easy'?0.9:d==='hard'?1.12:1,
  };
}
function hasPaidSubscription(){return !!(S.sub&&S.sub.tier&&S.sub.tier!=='free');}
function migrateSubState(){
  if(S.sub&&S.sub.tier==='free')S.sub=null;
  if(S.sub&&S.sub.autoRenew===undefined)S.sub.autoRenew=true;
  if(S.subLapsed&&(!S.subLapsed.tier||!S.subLapsed.exp))S.subLapsed=null;
}
function initActors(){
  if(S.actors.length)return;
  S.actors=[
    {id:'firmaCasa',type:'contractor',name:'SC Favorit Construct SRL',trust:62,influence:55},
    {id:'avocatCreativ',type:'legal',name:'Cabinet Lex Procedural',trust:58,influence:61},
    {id:'jurnalist',type:'press',name:'Redacția Observator Civic',trust:30,influence:70},
    {id:'inspector',type:'audit',name:'Inspector PREVENT',trust:25,influence:80},
    {id:'liderPartid',type:'politic',name:'Coordonator local partid',trust:66,influence:72},
  ];
}
function projectWandAlreadyUsed(projectId){
  if(projectId==null||projectId===''||Number.isNaN(Number(projectId)))return false;
  const id=typeof projectId==='number'?projectId:parseInt(projectId,10);
  const p=S.projects.find(x=>x.id===id);
  return !!(p?.wandUsed)||S.sessions.some(s=>s.projectId===id);
}
function getProjectProcurementSummary(projectId){
  const rel=S.tenders.filter(t=>t.projectId===projectId);
  const hasAwarded=rel.some(t=>t.status==='awarded');
  const hasPipeline=rel.some(t=>t.status==='open'||t.status==='evaluation');
  return {count:rel.length,hasAwarded,hasPipeline,items:rel};
}
function disc(){return Math.min(S.rep*0.1,25);}
function applyDisc(p){return p*(1-disc()/100);}
function repLevel(r){
  if(r<20)return'Aspirant';if(r<50)return'Funcționar Corupt';
  if(r<100)return'Politician cu Inițiativă';if(r<150)return'Oligarh Regional';
  if(r<200)return'Baron Local';return'Interlop de Elită';
}
function projPublicQualityBadgeClass(q){
  return {mantuiala:'proj-pub-qb proj-pub-qb-mantuiala',moderata:'proj-pub-qb proj-pub-qb-moderata',ridicata:'proj-pub-qb proj-pub-qb-ridicata',mantuit:'proj-pub-qb proj-pub-qb-mantuit',salvat:'proj-pub-qb proj-pub-qb-mantuit'}[q]||'bk';
}
function justiceStageRo(stage){
  const m={clean:'Curat',monitorizare:'Monitorizare',ancheta:'Anchetă',audiere:'Audiere',recurs:'Recurs',alerta_fiscal:'Alertă ANAF / fiscal'};
  return m[stage]||stage;
}
function addAct(txt){
  const now=globalThis.nowDate();
  const t=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  S.actLog.unshift({t,txt});
  if(S.actLog.length>20)S.actLog.pop();
}
function updateFundsLockUI(){
  const broke=S.ledger.publicBudget<=0;
  globalThis.$('app')?.classList.toggle('funds-locked',broke);
}
function searchMorePublicFunds(){
  const gain=Math.round((globalThis.PERSONAS[S.settings.persona]?.budget||12e6)*0.07*(0.9+Math.random()*0.35));
  S.ledger.publicBudget+=gain;
  addAct(`Căutare surse publice: identificat flux de ${globalThis.fRON(gain)}.`);
  updateFundsLockUI();
  globalThis.renderDash();
  globalThis.renderAudit();
  globalThis.toast('Surse noi „identificate”; buget replenizat','ok');
  globalThis.saveState();
}
function legacyDebugResetEphemeralUiState(){
  if(typeof globalThis.clearSubLapsedState==='function')globalThis.clearSubLapsedState();
  if(typeof globalThis.resetSpagafonEphemeralState==='function')globalThis.resetSpagafonEphemeralState();
}
function initStateModule(){
  migrateSubState();
  initActors();
}
globalThis.S=S;
globalThis.PLANS=PLANS;
globalThis.DIFFS=DIFFS;
globalThis.PRESS_CHANNELS=PRESS_CHANNELS;
globalThis.TIME_SHIFT_MAX_DAYS=TIME_SHIFT_MAX_DAYS;
globalThis.PERSONAS=globalThis.PERSONAS||{};
globalThis.diffTune=diffTune;
globalThis.hasPaidSubscription=hasPaidSubscription;
globalThis.migrateSubState=migrateSubState;
globalThis.initActors=initActors;
globalThis.projectWandAlreadyUsed=projectWandAlreadyUsed;
globalThis.getProjectProcurementSummary=getProjectProcurementSummary;
globalThis.disc=disc;
globalThis.applyDisc=applyDisc;
globalThis.repLevel=repLevel;
globalThis.projPublicQualityBadgeClass=projPublicQualityBadgeClass;
globalThis.justiceStageRo=justiceStageRo;
globalThis.addAct=addAct;
globalThis.updateFundsLockUI=updateFundsLockUI;
globalThis.searchMorePublicFunds=searchMorePublicFunds;
globalThis.legacyDebugResetEphemeralUiState=legacyDebugResetEphemeralUiState;
globalThis.initStateModule=initStateModule;
})();