;(function(){
const LS_LAST_REAL_VISIT='sifonator_last_real_visit_ts';
const OFFLINE_GAP_NOTIFY_HOURS=15;
const OFFLINE_SHIFT_MAX_SEC=90*86400;

function persistLastRealVisitTs(){
  if(globalThis.S.settings.persistence!=='local_storage')return;
  try{localStorage.setItem(LS_LAST_REAL_VISIT,String(Date.now()));}catch(e){}
}
function processOfflineRealTimeGap(){
  if(globalThis.S.settings.persistence!=='local_storage')return false;
  const now=Date.now();
  let last=0;
  try{last=parseInt(localStorage.getItem(LS_LAST_REAL_VISIT)||'0',10);}catch(e){last=0;}
  if(!last||last>now||!Number.isFinite(last)){
    persistLastRealVisitTs();
    return false;
  }
  const gapMs=now-last;
  const needSim=gapMs>=OFFLINE_GAP_NOTIFY_HOURS*3600000;
  if(!needSim)return false;
  const hoursAway=gapMs/3600000;
  const shiftSec=Math.min(OFFLINE_SHIFT_MAX_SEC,Math.floor(gapMs/1000));
  globalThis.S.timeShiftSec+=shiftSec;
  if(globalThis.S.activeSession){
    if(!globalThis.S.activeSession.paused)globalThis.S.activeSession.startReal+=gapMs;
    globalThis.S.activeSession.lastTickAt=globalThis.nowTs();
  }
  globalThis.checkSubLifecycle();
  globalThis.recalcJudiciaryPressure();
  const lines=[`Ai lipsit ~${hoursAway.toFixed(1)} h (ceas real). Pe axa jocului a curs același interval: +${globalThis.fSec(shiftSec)} (fără avans lunar automat la proiecte/licitații).`];
  if(globalThis.S.activeSession)lines.push('Sesiune Baghetă: timpul petrecut cu browserul închis nu ți-a consumat cota (pauză automată).');
  globalThis.addAct(`Revenire după pauză reală (~${hoursAway.toFixed(1)} h): timp simulat +${globalThis.fSec(shiftSec)} pe axa jocului (fără luni modelate în absență).`);
  globalThis.toast(lines.join(' '),'away');
  persistLastRealVisitTs();
  return true;
}
function initSimulationUtils(){
  globalThis.LS_LAST_REAL_VISIT=LS_LAST_REAL_VISIT;
  globalThis.OFFLINE_GAP_NOTIFY_HOURS=OFFLINE_GAP_NOTIFY_HOURS;
  globalThis.OFFLINE_SHIFT_MAX_SEC=OFFLINE_SHIFT_MAX_SEC;
  globalThis.persistLastRealVisitTs=persistLastRealVisitTs;
  globalThis.processOfflineRealTimeGap=processOfflineRealTimeGap;
}
globalThis.initSimulationUtils=initSimulationUtils;
})();