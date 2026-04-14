;(function(){
function checkSubLifecycle(){
  if(globalThis.hasPaidSubscription()){
    const now=globalThis.nowTs();
    const pl=globalThis.PLANS.find(p=>p.id===globalThis.S.sub.tier);
    if(!pl){globalThis.S.sub=null;return;}
    let expMs=new Date(globalThis.S.sub.exp).getTime();
    if(now<=expMs)return;
    const autoRenew=globalThis.S.sub.autoRenew!==false;
    if(autoRenew){
      let renewed=false;
      while(now>expMs){const d=new Date(expMs);d.setMonth(d.getMonth()+1);expMs=d.getTime();globalThis.S.sub.secUsed=0;renewed=true;}
      if(renewed){globalThis.S.sub.exp=new Date(expMs).toISOString();globalThis.addAct(`[AUTO] Abonament ${pl.name} reînnoit. Cota lunară resetată.`);}
      return;
    }
    globalThis.S.subLapsed={tier:globalThis.S.sub.tier,exp:globalThis.S.sub.exp};
    globalThis.S.sub=null;
    globalThis.setSubExpiredPromptPending?.(true);
    globalThis.addAct(`Abonament ${pl.name} expirat. Reînnoire automată oprită.`);
    globalThis.saveState();
    return;
  }
  if(globalThis.S.subLapsed&&globalThis.S.subLapsed.tier)globalThis.scheduleSubExpiredDialog?.();
}
function toggleSubAutoRenew(on){
  if(!globalThis.hasPaidSubscription())return;
  globalThis.S.sub.autoRenew=!!on;
  globalThis.saveState();globalThis.renderSettings();globalThis.renderSub();
  globalThis.toast(on?'Reînnoire automată activă. Abonamentul se prelungește lunar cât timpul simulat depășește data de expirare.':'Reînnoire automată oprită. La expirare revii la gratuit și poți alege din nou cum plătești.','ok');
}
function initSubscriptionLifecycleEngine(){
  globalThis.__checkSubLifecycle=checkSubLifecycle;
  globalThis.__toggleSubAutoRenew=toggleSubAutoRenew;
  globalThis.checkSubLifecycle=checkSubLifecycle;
  globalThis.toggleSubAutoRenew=toggleSubAutoRenew;
}
globalThis.initSubscriptionLifecycleEngine=initSubscriptionLifecycleEngine;
})();