;(function(){
let _subExpiredPromptPending=false;
let _subExpiredDlgTimer=null;

function setSubExpiredPromptPending(v){_subExpiredPromptPending=!!v;}

function openLimitDlg(title,body,mode){
  const m=mode||(globalThis.hasPaidSubscription()?'upgrade':'purchase');
  const isPurchase=m==='purchase';
  const sub=isPurchase
    ?`<p class="tsm mt8 lh165">Ești pe <strong>limitele gratuite</strong>. Poți <strong>cumpăra un abonament</strong> (plan plătit) pentru a mări plafonul, a obține timp Baghetă inclus, protecție judiciară, shift temporal etc.</p>`
    :`<p class="tsm mt8 lh165">Ai atins limita <strong>planului tău plătit curent</strong>. Poți <strong>face upgrade</strong> la un nivel superior pentru plafon mai mare și beneficii suplimentare.</p>`;
  globalThis.dlgOpen(title||(isPurchase?'Limită plan gratuit':'Limită plan curent'),'',
    `<p class="tsm tmut lh165">${body||'Această acțiune depășește limita permisă.'}</p>${sub}`,
    `<button type="button" class="btn btn-f" onclick="dlgClose()">Închide</button>
     <button type="button" class="btn btn-p" onclick="dlgClose();navigate('sub')">${isPurchase?'💳 Cumpără abonament':'⬆ Upgrade plan'}</button>`
  );
}

function scheduleSubExpiredDialog(){
  if(!globalThis.S.subLapsed||!globalThis.S.subLapsed.tier||!_subExpiredPromptPending)return;
  if(_subExpiredDlgTimer)return;
  const attempt=n=>{
    _subExpiredDlgTimer=null;
    if(!globalThis.S.subLapsed||!globalThis.S.subLapsed.tier||!_subExpiredPromptPending)return;
    const ov=globalThis.$('overlay');
    if(ov&&!ov.classList.contains('hid')){
      if(n<48)_subExpiredDlgTimer=setTimeout(()=>attempt(n+1),280);
      return;
    }
    _subExpiredPromptPending=false;
    openSubExpiredDialog();
  };
  _subExpiredDlgTimer=setTimeout(()=>attempt(0),80);
}

function openSubExpiredDialog(){
  if(!globalThis.S.subLapsed)return;
  const tid=globalThis.S.subLapsed.tier;
  const pl=globalThis.PLANS.find(p=>p.id===tid);
  const name=pl?.name||tid;
  const safeName=globalThis.escapeHtml(name);
  globalThis.dlgOpen('Abonament expirat','Reînnoire automată dezactivată',
    `<p class="tsm mb0 u-lh155">Perioada pentru <strong>${safeName}</strong> s-a încheiat (expirare: ${new Date(globalThis.S.subLapsed.exp).toLocaleDateString('ro-RO')}). Beneficiile planului plătit nu mai sunt active. Poți plăti din nou același plan, poți alege alt nivel, sau poți continua pe <strong>Starter Gratuit</strong>.</p>`,
    `<button type="button" class="btn btn-f" onclick="subExpiredChooseFree()">Continuă gratuit</button>
     <button type="button" class="btn btn-p" onclick="subExpiredRenewSame('${tid}')">Reînnoiește același plan</button>
     <button type="button" class="btn btn-s" onclick="subExpiredChooseOther()">Alt plan</button>`
  );
}

function clearSubLapsedState(){
  globalThis.S.subLapsed=null;
  _subExpiredPromptPending=false;
  if(_subExpiredDlgTimer){clearTimeout(_subExpiredDlgTimer);_subExpiredDlgTimer=null;}
}

function subExpiredChooseFree(){
  globalThis.dlgClose();
  clearSubLapsedState();
  globalThis.renderAll();
  globalThis.toast('Ești pe planul gratuit (limite Starter)','ok');
  globalThis.saveState();
}

function subExpiredRenewSame(tid){
  globalThis.dlgClose();
  clearSubLapsedState();
  globalThis.saveState();
  globalThis.openSubPay(tid);
}

function subExpiredChooseOther(){
  globalThis.dlgClose();
  clearSubLapsedState();
  globalThis.saveState();
  globalThis.navigate('sub');
}

function initSubscriptionLifecycleDialogs(){
  globalThis.setSubExpiredPromptPending=setSubExpiredPromptPending;
  globalThis.openLimitDlg=openLimitDlg;
  globalThis.scheduleSubExpiredDialog=scheduleSubExpiredDialog;
  globalThis.openSubExpiredDialog=openSubExpiredDialog;
  globalThis.clearSubLapsedState=clearSubLapsedState;
  globalThis.subExpiredChooseFree=subExpiredChooseFree;
  globalThis.subExpiredRenewSame=subExpiredRenewSame;
  globalThis.subExpiredChooseOther=subExpiredChooseOther;
}
globalThis.initSubscriptionLifecycleDialogs=initSubscriptionLifecycleDialogs;
})();