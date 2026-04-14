;(function(){
function wandQuotaBase(){
  globalThis.checkSubLifecycle();
  if(globalThis.hasPaidSubscription()){
    if(globalThis.S.sub.secTotal<0)return Infinity;
    return Math.max(0,globalThis.S.sub.secTotal-globalThis.S.sub.secUsed);
  }
  return Math.max(0,globalThis.S.purchSec-globalThis.S.purchSecUsed);
}
function wandAvailSec(){
  const base=wandQuotaBase();
  if(!globalThis.S.activeSession)return base===Infinity?Infinity:base;
  if(base===Infinity)return Infinity;
  const elapsed=Math.max(0,Math.floor((globalThis.nowTs()-globalThis.S.activeSession.startReal)/1000)-globalThis.wandPauseOffsetSec());
  const q0=globalThis.S.activeSession.quotaSecAtStart;
  const startAvail=(q0===Infinity||q0===-1)?base:Math.min(base,q0);
  return Math.max(0,startAvail-elapsed);
}
function initWandQuotaService(){
  globalThis.__wandQuotaBase=wandQuotaBase;
  globalThis.__wandAvailSec=wandAvailSec;
  globalThis.wandQuotaBase=wandQuotaBase;
  globalThis.wandAvailSec=wandAvailSec;
}
globalThis.initWandQuotaService=initWandQuotaService;
})();