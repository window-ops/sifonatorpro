;(function(){
function pressAction(type){
  const map={
    briefing:{delta:8,cost:0,msg:'Briefing oficial: mesaj disciplinat către presă.',channel:'tv_local'},
    campaign:{delta:15,cost:25,msg:'Campanie pozitivă lansată pe posturi partenere.',channel:'tv_national'},
    diversion:{delta:10,cost:12,msg:'Diversiune media: agenda publică a fost deturnată.',channel:'social'},
    counter:{delta:18,cost:40,msg:'Contraatac: investigațiile au fost discreditate agresiv.',channel:'investigatii'},
  };
  const cfg=map[type];if(!cfg)return;
  const effectiveCost=cfg.cost===0?0:Math.max(1,Math.ceil(cfg.cost*globalThis.diffTune().pressCost));
  if(globalThis.S.rep<effectiveCost){globalThis.toast(`Ai nevoie de ${effectiveCost} puncte reputație pentru această acțiune`,'err');return}
  if(effectiveCost>0){globalThis.chgRep(-effectiveCost,`Control narativ presă (${type})`,true);globalThis.S.ledger.reputationCost+=effectiveCost;globalThis.S.ledger.influenceSpend+=effectiveCost*1000}
  const hostile=globalThis.isPressChannelHostileEffective(cfg.channel)?7:0;
  globalThis.S.pressTone=Math.min(100,Math.max(0,globalThis.S.pressTone+cfg.delta-hostile-((globalThis.S.justice?.stage||'clean')!=='clean'?4:0)));
  if(Math.random()<0.18&&!globalThis.S.worldMemory.hostilePress.includes(cfg.channel))globalThis.S.worldMemory.hostilePress.push(cfg.channel);
  const now=globalThis.nowDate();
  const t=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  globalThis.S.pressHistory.unshift({t,txt:`[${cfg.channel}] ${cfg.msg}`});
  if(globalThis.S.pressHistory.length>30)globalThis.S.pressHistory.pop();
  globalThis.addAct(`Presă: ${cfg.msg}`);
  globalThis.recalcJudiciaryPressure();
  globalThis.renderPress();
  globalThis.toast('Acțiune de control narativ executată','ok');
}
function initPressFeature(){
  globalThis.pressAction=pressAction;
}
globalThis.initPressFeature=initPressFeature;
})();