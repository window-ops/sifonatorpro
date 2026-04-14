;(function(){
function ensureWorldMemoryShape(){
  const S=globalThis.S;
  if(!S.worldMemory||typeof S.worldMemory!=='object'){
    S.worldMemory={blacklistedFirms:[],hostilePress:[],magistrateHeat:0,lastSpilloverMonth:-1,lastInvestigativePressMonth:-1,investigativeLedger:{}};
  }
  if(!Array.isArray(S.worldMemory.blacklistedFirms))S.worldMemory.blacklistedFirms=[];
  if(!Array.isArray(S.worldMemory.hostilePress))S.worldMemory.hostilePress=[];
  if(typeof S.worldMemory.magistrateHeat!=='number')S.worldMemory.magistrateHeat=0;
  if(typeof S.worldMemory.lastSpilloverMonth!=='number')S.worldMemory.lastSpilloverMonth=-1;
  if(typeof S.worldMemory.lastInvestigativePressMonth!=='number')S.worldMemory.lastInvestigativePressMonth=-1;
  if(!S.worldMemory.investigativeLedger||typeof S.worldMemory.investigativeLedger!=='object')S.worldMemory.investigativeLedger={};
}
function normalizeTenderData(){
  const S=globalThis.S;
  S.tenders=S.tenders.filter(t=>!t.projectId||S.projects.some(p=>p.id===t.projectId));
  S.tenders.forEach(t=>{
    if(!t.procType)t.procType='open';
    if(t.procType==='direct')t.procType='restricted';
    if(!t.complexity)t.complexity=globalThis.clamp(Math.round((t.budget||1)/600000),1,5);
    if(!t.auditRisk)t.auditRisk=0;
    if(!Array.isArray(t.bids))t.bids=[];
    if(typeof t.specRig!=='number')t.specRig=0;
    if(typeof t.houseBias!=='number')t.houseBias=0;
    if(typeof t.overpricePct!=='number')t.overpricePct=0;
    if(typeof t.lowPricePush!=='number')t.lowPricePush=0;
    if(typeof t.eliminationRounds!=='number')t.eliminationRounds=0;
    if(typeof t.postAwardApplied!=='boolean')t.postAwardApplied=false;
  });
}
function fixLoadedActiveSession(){
  const S=globalThis.S;
  if(!S.activeSession)return;
  if(S.activeSession.quotaSecAtStart===-1||S.activeSession.quotaSecAtStart===null)S.activeSession.quotaSecAtStart=Infinity;
  if(typeof S.activeSession.pausedMsTotal!=='number')S.activeSession.pausedMsTotal=0;
  if(typeof S.activeSession._pauseAt!=='number')S.activeSession._pauseAt=0;
  if(!S.activeSession.logLines)S.activeSession.logLines=[];
  if(!S.projects.some(p=>p.id===S.activeSession.projectId))S.activeSession=null;
}
function initStateNormalizers(){
  globalThis.__ensureWorldMemoryShape=ensureWorldMemoryShape;
  globalThis.__normalizeTenderData=normalizeTenderData;
  globalThis.__fixLoadedActiveSession=fixLoadedActiveSession;
  globalThis.ensureWorldMemoryShape=ensureWorldMemoryShape;
  globalThis.normalizeTenderData=normalizeTenderData;
  globalThis.fixLoadedActiveSession=fixLoadedActiveSession;
}
globalThis.initStateNormalizers=initStateNormalizers;
})();