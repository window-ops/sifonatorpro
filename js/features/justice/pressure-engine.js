;(function(){
function recalcJudiciaryPressure(skipTimelineLog){
  const S=globalThis.S;
  if(S.justice?.debugPin)return;
  const procurementHeat=S.tenders.filter(t=>['contested','evaluation'].includes(t.status)).length*6;
  const fundHeat=Math.min(75,Math.round(S.siphoned/220000*globalThis.diffTune().fundHeat));
  const pressHeat=Math.max(0,55-S.pressTone);
  const personaMult=globalThis.PERSONAS[S.settings.persona]?.scrutiny||1;
  const diffMult=globalThis.DIFFS[S.settings.difficulty]||1;
  let pressure=Math.round((procurementHeat+fundHeat+pressHeat)*personaMult*diffMult);
  pressure=Math.min(100,pressure);
  if(S.justice?.dnaEscalation)pressure=Math.max(pressure,60);
  S.justice.pressure=pressure;
  if(S.justice.pressure<35)S.justice.stage='clean';
  else if(S.justice.pressure<55)S.justice.stage='monitorizare';
  else if(S.justice.pressure<75)S.justice.stage='ancheta';
  else if(S.justice.pressure<90)S.justice.stage='audiere';
  else S.justice.stage='recurs';
  if(!skipTimelineLog)globalThis.justiceTimelineMaybeAppendRecalcSnapshot(procurementHeat,fundHeat,pressHeat);
}
function initJusticePressureEngine(){
  globalThis.__recalcJudiciaryPressure=recalcJudiciaryPressure;
  globalThis.recalcJudiciaryPressure=recalcJudiciaryPressure;
}
globalThis.initJusticePressureEngine=initJusticePressureEngine;
})();