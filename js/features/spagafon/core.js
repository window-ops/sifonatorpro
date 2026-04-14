;(function(){
function spagafonUnreadCount(){
  const t=globalThis.S.spagafonLastSeen||0;
  return globalThis.S.smsInbox.filter(m=>(m.ts||0)>t).length;
}
function updSpagafonBadge(){
  const n=spagafonUnreadCount();
  const el=globalThis.$('spgf-unread'),btn=globalThis.$('spgf-launcher');
  if(el)el.textContent=n>9?'9+':String(n);
  btn?.classList.toggle('has-unread',n>0);
}
function spagafonPushSms(from,body,opts){
  const o=opts||{};
  const ts=Date.now();
  globalThis.S.smsInbox.unshift({id:ts,ts,from,body,t:new Date(ts).toLocaleTimeString('ro-RO',{hour:'2-digit',minute:'2-digit'}),code:o.code||null,codeConsumed:false,is3ds:!!o.is3ds,isPsdDcVerify:!!o.isPsdDcVerify,isAnafCert:!!o.isAnafCert,isAnafDiscardVerify:!!o.isAnafDiscardVerify,isMantuireVerify:!!o.isMantuireVerify});
  if(globalThis.S.smsInbox.length>50)globalThis.S.smsInbox.pop();
  updSpagafonBadge();
  if(globalThis.$('spagafon-root')?.classList.contains('open')){
    globalThis.renderSpagafon();
    globalThis.renderSpagafonAppletUI();
  }
}
function initSpagafonCoreFeature(){
  globalThis.spagafonUnreadCount=spagafonUnreadCount;
  globalThis.updSpagafonBadge=updSpagafonBadge;
  globalThis.spagafonPushSms=spagafonPushSms;
}
globalThis.initSpagafonCoreFeature=initSpagafonCoreFeature;
})();