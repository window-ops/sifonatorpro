;(function(){
function applySettingsTimeShift(){
  if(!globalThis.tierAllowsTimeShift()){globalThis.toast('Shift temporal indisponibil pe plan gratuit','err');return;}
  const days=parseInt(globalThis.$('settings-shift-range')?.value||'0',10);
  const maxD=Math.min(globalThis.TIME_SHIFT_MAX_DAYS,Math.max(0,globalThis.maxTimeShiftDaysRemaining()));
  if(days>maxD){globalThis.toast(`Poți avansa maximum ${maxD} zile în acest ciclu.`,'warn');return;}
  if(days<=0){globalThis.toast('Selectează cel puțin o zi','warn');return;}
  globalThis.S.timeShiftSec+=days*86400;
  const months=Math.floor(days*86400/(86400*30));
  if(months>0)globalThis.advanceSimulationMonths(months);
  globalThis.checkSubLifecycle();
  globalThis.recalcJudiciaryPressure();
  globalThis.renderAll();
  globalThis.toast(`Timp simulat: +${days} zile`,'ok');
}
function initSimulationTimeShift(){
  globalThis.__applySettingsTimeShift=applySettingsTimeShift;
  globalThis.applySettingsTimeShift=applySettingsTimeShift;
}
globalThis.initSimulationTimeShift=initSimulationTimeShift;
})();