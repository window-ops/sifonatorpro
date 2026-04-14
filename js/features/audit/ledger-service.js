;(function(){
function addLedger(kind,amount,reason){
  if(!globalThis.S.ledger[kind]&&globalThis.S.ledger[kind]!==0)return;
  globalThis.S.ledger[kind]+=amount;
  globalThis.addAct(`Ledger ${kind}: ${amount>=0?'+':''}${globalThis.fRON(amount)} · ${reason}`);
}
function initAuditLedgerService(){
  globalThis.addLedger=addLedger;
}
globalThis.initAuditLedgerService=initAuditLedgerService;
})();