;(function(){
function getPlanByTier(tid){return globalThis.PLANS.find(p=>p.id===tid)||globalThis.PLANS[0];}
function getSubscriptionCaps(){
  const pl=getPlanByTier(globalThis.S.sub?.tier||'free');
  return{ongoing:pl.maxOngoing,pending:pl.maxPending};
}
function countProjSlots(){
  return{
    ongoing:globalThis.S.projects.filter(p=>p.status==='in_progress').length,
    pending:globalThis.S.projects.filter(p=>p.status==='planned').length,
  };
}
function tierAllowsTimeShift(){return!!getPlanByTier(globalThis.S.sub?.tier||'free').timeShift;}
function tierAllowsJudicialProtection(){return!!getPlanByTier(globalThis.S.sub?.tier||'free').protection;}
function repPublicMultCap(){return getPlanByTier(globalThis.S.sub?.tier||'free').repMultCap||0;}
function tierAllowsRepPublicMultiplier(){return repPublicMultCap()>0;}
function effectivePublicRepMultiplier(){
  const cap=repPublicMultCap();
  if(cap<=0)return 1;
  const slide=(globalThis.S.userControls?.repPublicSlider??0)/100;
  return 1+cap*slide;
}
function maxTimeShiftDaysRemaining(){
  if(!globalThis.S.sub?.exp)return globalThis.TIME_SHIFT_MAX_DAYS;
  const daysToRenew=Math.ceil((new Date(globalThis.S.sub.exp).getTime()-globalThis.nowTs())/86400000);
  return globalThis.clamp(Math.min(globalThis.TIME_SHIFT_MAX_DAYS,Math.max(0,daysToRenew)),0,globalThis.TIME_SHIFT_MAX_DAYS);
}
function initSubscriptionUtils(){
  globalThis.getPlanByTier=getPlanByTier;
  globalThis.getSubscriptionCaps=getSubscriptionCaps;
  globalThis.countProjSlots=countProjSlots;
  globalThis.tierAllowsTimeShift=tierAllowsTimeShift;
  globalThis.tierAllowsJudicialProtection=tierAllowsJudicialProtection;
  globalThis.repPublicMultCap=repPublicMultCap;
  globalThis.tierAllowsRepPublicMultiplier=tierAllowsRepPublicMultiplier;
  globalThis.effectivePublicRepMultiplier=effectivePublicRepMultiplier;
  globalThis.maxTimeShiftDaysRemaining=maxTimeShiftDaysRemaining;
}
globalThis.initSubscriptionUtils=initSubscriptionUtils;
})();