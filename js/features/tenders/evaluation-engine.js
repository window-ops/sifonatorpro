;(function(){
function firmaDeCasaNamesForCategory(cat){
  const k=cat&&globalThis.FIRME_CASA_BY_CATEGORY[cat]?cat:'diverse';
  const arr=globalThis.FIRME_CASA_BY_CATEGORY[k]||globalThis.FIRME_CASA_BY_CATEGORY.diverse||[];
  return new Set(arr.map(x=>x.name));
}
function projectWinningTenderIsHouseFirm(p){
  if(!p)return false;
  const names=firmaDeCasaNamesForCategory(globalThis.projectCategoryKey(p));
  if(!names.size)return false;
  return globalThis.S.tenders.some(t=>{
    if(t.projectId!==p.id||!t.winner)return false;
    if(!['awarded','executie'].includes(t.status))return false;
    return names.has(t.winner);
  });
}
function pickTenderPlayersForBid(t){
  const ctx=tenderCtx(t);
  const cat=ctx.project?globalThis.projectCategoryKey(ctx.project):'diverse';
  const n=t.procType==='direct'?3:globalThis.clamp(4+Math.floor(Math.random()*3),4,6);
  const allowHouse=(t.specRig||0)>0;
  let legit=[...(globalThis.FIRME_LEGITIME_BY_CATEGORY[cat]||globalThis.FIRME_LEGITIME_BY_CATEGORY.diverse)];
  const casa=globalThis.FIRME_CASA_BY_CATEGORY[cat]||globalThis.FIRME_CASA_BY_CATEGORY.diverse;
  if(legit.length<8)legit=[...legit,...globalThis.TENDER_CONTRACTORS];
  if(allowHouse&&casa.length){
    const housePick=globalThis.pickMany([...casa],1)[0];
    const restPool=legit.filter(x=>x.name!==housePick.name);
    const needOthers=Math.max(1,n-1);
    let others=globalThis.pickMany([...restPool],Math.min(needOthers,restPool.length));
    if(others.length<needOthers){
      const more=globalThis.pickMany([...restPool].filter(x=>!others.some(o=>o.name===x.name)),needOthers-others.length);
      others=[...others,...more];
    }
    let players=[housePick,...others].slice(0,n);
    if(players.length<n){
      const filler=globalThis.pickMany([...legit].filter(x=>!players.some(p=>p.name===x.name)),n-players.length);
      players=[...players,...filler];
    }
    return{players:players.slice(0,n),houseCandidate:housePick};
  }
  const players=globalThis.pickMany([...legit],Math.min(n,legit.length));
  const houseCandidate=[...players].sort((a,b)=>b.network-a.network)[0]||players[0];
  return{players,houseCandidate};
}
function tenderCtx(t){
  const p=globalThis.S.projects.find(x=>x.id===t.projectId)||null;
  const declared=Math.max(1,p?.declaredValue||t.budget||1);
  const real=Math.max(1,p?.realValue||Math.round(declared*0.72));
  const spread=globalThis.clamp((declared-real)/declared,0,0.8);
  return{
    project:p,
    declared,real,spread,
    projectRisk:(p?.lateF?12:0)+(p?.lateS?8:0)+(p?.status==='planned'?4:0),
  };
}
function buildTenderBids(t){
  const ctx=tenderCtx(t);
  const {players,houseCandidate}=pickTenderPlayersForBid(t);
  const eliminationPressure=globalThis.clamp((t.specRig||0)*1.1+(t.eliminationRounds||0)*0.55,0,2.8);
  let removeCount=Math.min(players.length-2,Math.floor(eliminationPressure));
  if(Math.random()<(eliminationPressure%1))removeCount=Math.min(players.length-2,removeCount+1);
  let survivors=[...players];
  while(removeCount>0&&survivors.length>2){
    const pool=survivors.filter(c=>c.name!==houseCandidate?.name);
    const targetPool=pool.length?pool:survivors;
    const i=Math.floor(Math.random()*targetPool.length);
    const victim=targetPool[i];
    survivors=survivors.filter(c=>c.name!==victim.name);
    removeCount--;
  }
  const playersFinal=survivors;
  const offers=players.map(c=>{
    const volatility=0.9+Math.random()*0.24;
    const houseEdge=(c.name===houseCandidate?.name)?(t.houseBias||0):0;
    const offer=Math.round((t.budget||1)*c.price*volatility*(1-(houseEdge*0.08)));
    const tech=globalThis.clamp(c.tech+Math.round((Math.random()*14)-7)-Math.round(t.complexity*1.5)+Math.round(houseEdge*5),35,96);
    const compliance=globalThis.clamp(c.compliance+Math.round((Math.random()*16)-8)-Math.round(ctx.spread*20)+Math.round(houseEdge*7),20,98);
    return{name:c.name,offer,tech,compliance,network:c.network};
  }).filter(o=>playersFinal.some(c=>c.name===o.name));
  const minOffer=Math.max(1,Math.min(...offers.map(o=>o.offer)));
  return offers.map(o=>{
    const priceScore=globalThis.clamp(Math.round((minOffer/o.offer)*100),40,100);
    const networkWeight=t.procType==='direct'?0.14:0.08;
    const priceWeight=globalThis.clamp(0.26+((t.lowPricePush||0)*0.24),0.2,0.62);
    const techWeight=globalThis.clamp(0.39-((t.lowPricePush||0)*0.2),0.14,0.45);
    const complianceWeight=globalThis.clamp(0.3-((t.lowPricePush||0)*0.1),0.12,0.34);
    const score=Math.round((o.tech*techWeight)+(o.compliance*complianceWeight)+(priceScore*priceWeight)+(o.network*100*networkWeight));
    const flags=[];
    if(o.compliance<45)flags.push('documentație slabă');
    if(o.network>0.75)flags.push('legături politice vizibile');
    if(o.offer<(t.budget*0.82))flags.push('ofertă anormal de mică');
    return{...o,priceScore,score,flags};
  }).sort((a,b)=>b.score-a.score);
}
function registerInvestigativeProcurementMemory(t,ctx,top,overpriceGap,lowPriceTrap){
  globalThis.ensureWorldMemoryShape();
  const firm=top?.name||'Firmă necunoscută';
  const scoreGain=(lowPriceTrap?2:0)+Math.round((t.specRig||0)*2)+Math.round((t.houseBias||0)*2)+Math.round((overpriceGap||0)*3);
  const ledger=globalThis.S.worldMemory.investigativeLedger;
  const rec=ledger[firm]||{score:0,wins:0,lastMonth:-1};
  rec.score+=Math.max(1,scoreGain);
  rec.wins++;
  rec.lastMonth=globalThis.S.simClock.monthTick;
  ledger[firm]=rec;
  const month=globalThis.S.simClock.monthTick;
  const shouldHeadline=rec.score>=8&&globalThis.S.worldMemory.lastInvestigativePressMonth!==month&&Math.random()<0.62;
  if(!shouldHeadline)return;
  globalThis.S.worldMemory.lastInvestigativePressMonth=month;
  if(!globalThis.S.worldMemory.hostilePress.includes('investigatii'))globalThis.S.worldMemory.hostilePress.push('investigatii');
  const now=globalThis.nowDate();
  const tt=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const roundPct=Math.round(Math.max(0,overpriceGap||0)*100);
  const shortFirm=String(firm).slice(0,46);
  const p=ctx.project;
  const houseWinner=!!(p&&top?.name&&firmaDeCasaNamesForCategory(globalThis.projectCategoryKey(p)).has(top.name));
  const txts=houseWinner?[
    `[investigatii] Dosar licitații: „${shortFirm}” apare recurent în proceduri cu concurență eliminată.`,
    `[investigatii] Redacție locală: aceeași „firmă de casă” câștigă din nou; estimare supraevaluată ~${roundPct}%.`,
    `[investigatii] Contraintuitiv: când „merge pe cunoscuți”, lipsa actelor adiționale vizibile nu înseamnă că nu se plătește, doar că controlul este slab.`,
  ]:[
    `[investigatii] Dosar licitații: „${shortFirm}” apare recurent în proceduri cu concurență eliminată.`,
    `[investigatii] Redacție locală: aceeași firmă câștigă din nou; estimare supraevaluată ~${roundPct}%.`,
    `[investigatii] Investigație: criteriul „prețul cel mai mic” livrează acte, dar lucrările se umflă prin acte adiționale în execuție.`,
  ];
  if(!Array.isArray(globalThis.S.pressHistory))globalThis.S.pressHistory=[];
  globalThis.S.pressHistory.unshift({t:tt,txt:txts[Math.floor(Math.random()*txts.length)]});
  if(globalThis.S.pressHistory.length>30)globalThis.S.pressHistory.pop();
  globalThis.S.pressTone=Math.max(0,globalThis.S.pressTone-4);
  globalThis.addAct(`Memorie presă: „${shortFirm}" intră în radarul investigațiilor (${rec.wins} adjudecări urmărite).`);
}
function evaluateTenderNow(t){
  const lp=t.projectId?globalThis.S.projects.find(p=>p.id===t.projectId):null;
  if(lp&&lp.status==='completed')return;
  const ctx=tenderCtx(t);
  if(!t.bids?.length)t.bids=buildTenderBids(t);
  const top=t.bids[0];
  const runner=t.bids[1]||top;
  t.winner=top?.name||null;
  t.winnerScore=top?.score||0;
  const margin=Math.max(0,(top?.score||0)-(runner?.score||0));
  const overpriceGap=Math.max(0,((t.budget||ctx.declared)-ctx.real)/Math.max(1,ctx.real));
  const lowPriceTrap=!!top&&top.offer<(t.budget*0.84)&&top.priceScore>=96;
  const riskBase=14+(ctx.spread*26)+ctx.projectRisk+(t.complexity*2)+Math.max(0,8-margin)+(overpriceGap*14)+((t.specRig||0)*8);
  const publicPressure=Math.max(0,Math.round((globalThis.S.justice.pressure||0)*0.12));
  t.auditRisk=globalThis.clamp(Math.round(riskBase+publicPressure),6,96);
  t.evalSummary=`Scor ${top?.score||0} · marjă ${margin} · supralicitare ${Math.round(overpriceGap*100)}% · risc contestare ${t.auditRisk}%`;
  const winProj=ctx.project;
  const catK=winProj?globalThis.projectCategoryKey(winProj):'diverse';
  const houseWinner=!!(winProj&&top?.name&&firmaDeCasaNamesForCategory(catK).has(top.name));
  if(winProj){
    if(!winProj.monthly)winProj.monthly={progress:0,contractorPerf:60,changeOrders:0};
    winProj.monthly.contractorPerf=globalThis.clamp(Math.round((winProj.monthly.contractorPerf*0.55)+((top?.tech||60)*0.45)),35,96);
    if(lowPriceTrap){
      winProj.monthly.lowPriceTrap=Math.min(4,(winProj.monthly.lowPriceTrap||0)+1);
      if(houseWinner){
        winProj.monthly.contractorPerf=globalThis.clamp(winProj.monthly.contractorPerf-3,22,96);
        globalThis.addAct(`Capcană „preț minim” pe „${winProj.name}”: ofertă mică, dar câștigătorul e „de casă”. Hârtiile suplimentare se taie; riscul vizibil de acte adiționale scade (dosarul arată mai „curat”), dar slăbiciunea controlului persistă.`);
      }else{
        winProj.monthly.contractorPerf=globalThis.clamp(winProj.monthly.contractorPerf-9,22,96);
        globalThis.addAct(`Capcană „preț minim” pe „${winProj.name}”: ofertă foarte joasă, risc de acte adiționale în execuție.`);
      }
    }
    if(!t.postAwardApplied&&t.overpricePct>0){
      const bump=Math.round(ctx.real*(t.overpricePct/100)*0.45);
      if(bump>0){
        winProj.declaredValue+=bump;
        winProj.budget=winProj.declaredValue;
        globalThis.addAct(`Contract supraevaluat pe „${winProj.name}”: +${globalThis.fRON(bump)} valoare declarată după adjudecare.`);
      }
      t.postAwardApplied=true;
    }
  }
  registerInvestigativeProcurementMemory(t,ctx,top,overpriceGap,lowPriceTrap);
  const weakControl=globalThis.clamp(1-((t.specRig||0)*0.42)-((t.houseBias||0)*0.2),0.38,1);
  const contestChance=globalThis.clamp((t.auditRisk/100)*(globalThis.diffTune().judiciary>1?1.08:0.82)*weakControl,0.04,0.62);
  if(Math.random()<contestChance){
    t.status='contested';
    globalThis.addAct(`Licitație „${t.name}" contestată (risc contestare ${t.auditRisk}%).`);
    globalThis.toast('Contestație depusă după evaluare','warn');
    return;
  }
  t.status='awarded';
  globalThis.addAct(`Licitație „${t.name}" adjudecată ${t.winner} (scor ${t.winnerScore}).`);
}
function initTendersEvaluationEngine(){
  globalThis.firmaDeCasaNamesForCategory=firmaDeCasaNamesForCategory;
  globalThis.projectWinningTenderIsHouseFirm=projectWinningTenderIsHouseFirm;
  globalThis.pickTenderPlayersForBid=pickTenderPlayersForBid;
  globalThis.tenderCtx=tenderCtx;
  globalThis.buildTenderBids=buildTenderBids;
  globalThis.registerInvestigativeProcurementMemory=registerInvestigativeProcurementMemory;
  globalThis.evaluateTenderNow=evaluateTenderNow;
}
globalThis.initTendersEvaluationEngine=initTendersEvaluationEngine;
})();