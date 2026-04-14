;(function(){
function advanceSimulationMonths(months){
  for(let i=0;i<months;i++){
    globalThis.S.simClock.monthTick++;
    globalThis.S.projects.forEach(p=>{
      if(p.status==='completed')return;
      if(!p.monthly)p.monthly={progress:Math.floor(Math.random()*18),contractorPerf:55+Math.floor(Math.random()*35),changeOrders:0};
      if(p.status==='in_progress'){
        const drift=Math.floor(Math.random()*12)-2;
        p.monthly.progress=Math.max(0,Math.min(100,p.monthly.progress+drift+p.monthly.contractorPerf/25));
        const trapBoost=(p.monthly.lowPriceTrap||0)*0.08;
        if(Math.random()<(0.28+trapBoost)){
          p.monthly.changeOrders++;
          const ordPct=3+((p.monthly.lowPriceTrap||0)>0?2:0);
          p.declaredValue+=Math.round(p.declaredValue*(ordPct/100));
          p.budget=p.declaredValue;
          globalThis.addAct(`Modificare suplimentară (contract) pe „${p.name}”: +${ordPct}% valoare declarată.`);
        }
        if(p.monthly.progress>=100){
          const blockReason=globalThis.projectFinalizeBlockReason(p);
          if(blockReason){
            p.monthly.progress=99;
            if(!p.monthly.blockedNoTenderNotified){
              globalThis.addAct(`Finalizare blocată pentru „${p.name}”: ${blockReason}`);
              globalThis.toast(`„${p.name}” nu poate fi finalizat: achiziția directă este permisă doar în pragurile Legii 98/2016.`,'warn');
              p.monthly.blockedNoTenderNotified=true;
            }
          }else{
            p.status='completed';
            if(p.bet){globalThis.addAct(`Pariu pe „${p.name}" anulat (finalizare automată).`);p.bet=null;}
            p.quality=globalThis.rollProjectQuality(p);
            globalThis.addAct(`Proiect „${p.name}” finalizat prin avans lunar: ${globalThis.qLabel(p.quality)}.`);
          }
        }
      }
      globalThis.ensureProjectDossier(p);
      p.dossier.unshift({t:globalThis.nowDate().toLocaleDateString('ro-RO'),txt:`Revizie lunară #${globalThis.S.simClock.monthTick}: progres ${(p.monthly?.progress||0).toFixed(0)}%`});
      if(p.dossier.length>20)p.dossier.pop();
    });
    const tl=Math.min(0.95,0.52*globalThis.diffTune().tenderLuck);
    globalThis.S.tenders.forEach(t=>{
      const lp=t.projectId?globalThis.S.projects.find(p=>p.id===t.projectId):null;
      if(lp&&lp.status==='completed')return;
      if(t.status==='evaluation'&&Math.random()<tl){globalThis.evaluateTenderNow(t);return;}
      if(t.status==='contested'&&Math.random()<(0.36*globalThis.diffTune().tenderLuck)){t.status='evaluation';return;}
      const next={open:'clarificari',clarificari:'depuneri',depuneri:'evaluation',awarded:'executie',executie:'executie'}[t.status];
      if(next&&Math.random()<tl)t.status=next;
    });
    globalThis.trySimulateNationalPressSpillover();
  }
  globalThis.recalcJudiciaryPressure();
}
function initSimulationMonthlyTick(){
  globalThis.advanceSimulationMonths=advanceSimulationMonths;
}
globalThis.initSimulationMonthlyTick=initSimulationMonthlyTick;
})();