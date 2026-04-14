;(function(){
const WAND_DOSSIER_TICK=[
  (inc,cum)=>`Situație de lucrări / centralizator: +${globalThis.fRON(Math.round(inc))} (cumul ${globalThis.fRON(Math.round(cum))}).`,
  (inc,cum)=>`Notă internă de progres financiar: +${globalThis.fRON(Math.round(inc))}, cumul ${globalThis.fRON(Math.round(cum))}.`,
  (inc,cum)=>`Rectificare de etapă pe execuție: +${globalThis.fRON(Math.round(inc))}; cumul ${globalThis.fRON(Math.round(cum))}.`,
  (inc,cum)=>`Lucrări suplimentare și diferențe cantitate: +${globalThis.fRON(Math.round(inc))}; cumul ${globalThis.fRON(Math.round(cum))}.`,
  (inc,cum)=>`Înregistrare: „studii & expertize" +${globalThis.fRON(Math.round(inc))} (cumul ${globalThis.fRON(Math.round(cum))}). Livrabile tip PDF, factură pe etapă.`,
  (inc,cum)=>`Rectificare buget / HCL suport: +${globalThis.fRON(Math.round(inc))}; cumul ${globalThis.fRON(Math.round(cum))}. Mutare între articole, același volum de „lucrare".`,
  (inc,cum)=>`Lucrări suplimentare & diferențe cantitate: +${globalThis.fRON(Math.round(inc))}; cumul ${globalThis.fRON(Math.round(cum))}. Deviz complementar aprobat pe flux intern.`,
  (inc,cum)=>`Rezervă tehnică → execuție: +${globalThis.fRON(Math.round(inc))}; cumul ${globalThis.fRON(Math.round(cum))} fără relansare procedură.`,
  (inc,cum)=>`Achiziție directă motivată (urgență / „unic furnizor”): +${globalThis.fRON(Math.round(inc))}; cumul ${globalThis.fRON(Math.round(cum))}.`,
  (inc,cum)=>`Antemăsurători reîncărcate pe contracte subevaluate: +${globalThis.fRON(Math.round(inc))}; cumul ${globalThis.fRON(Math.round(cum))}.`,
  (inc,cum)=>`Coordonare proiect + dirigenție de șantier (ore în bloc): +${globalThis.fRON(Math.round(inc))}; cumul ${globalThis.fRON(Math.round(cum))}.`,
  (inc,cum)=>`Marjă pe lanț subcontractanți (TVA/profit la nivel final): +${globalThis.fRON(Math.round(inc))}; cumul ${globalThis.fRON(Math.round(cum))}.`,
  (inc,cum)=>`„Soluții tehnice neprevăzute" post-factum: +${globalThis.fRON(Math.round(inc))}; cumul ${globalThis.fRON(Math.round(cum))}, încadrare utilități.`,
  (inc,cum)=>`Penalități negociate la zero contra acceptării suplimentului: +${globalThis.fRON(Math.round(inc))}; cumul ${globalThis.fRON(Math.round(cum))}.`,
  (inc,cum)=>`Avansuri raportate ca progres fizic: +${globalThis.fRON(Math.round(inc))}; cumul ${globalThis.fRON(Math.round(cum))}, situație de șantier cosmetizată.`,
  (inc,cum)=>`Consultanță „management proiect" (intangibil): +${globalThis.fRON(Math.round(inc))}; cumul ${globalThis.fRON(Math.round(cum))}.`,
  (inc,cum)=>`Dotări cu specificații copiate din catalogul câștigătorului: +${globalThis.fRON(Math.round(inc))}; cumul ${globalThis.fRON(Math.round(cum))}.`,
  (inc,cum)=>`Închidere parțială pe loturi pentru grăbire decontare: +${globalThis.fRON(Math.round(inc))}; cumul ${globalThis.fRON(Math.round(cum))}.`,
  (inc,cum)=>`Actualizare indici materiale & „scumpiri neprevăzute": +${globalThis.fRON(Math.round(inc))}; cumul ${globalThis.fRON(Math.round(cum))}.`,
  (inc,cum)=>`Protocol adițional la contract (preț unitar majorat): +${globalThis.fRON(Math.round(inc))}; cumul ${globalThis.fRON(Math.round(cum))}.`,
  (inc,cum)=>`„Organizare de șantier" și logistă inventată: +${globalThis.fRON(Math.round(inc))}; cumul ${globalThis.fRON(Math.round(cum))}.`,
  (inc,cum)=>`Delegare către firmă abonată la același ONG ca și consultantul: +${globalThis.fRON(Math.round(inc))}; cumul ${globalThis.fRON(Math.round(cum))}; conflict de interese ignorat.`,
  (inc,cum)=>`Factură pe „inventar patrimoniu" fără inventar fizic: +${globalThis.fRON(Math.round(inc))}; cumul ${globalThis.fRON(Math.round(cum))}.`,
  (inc,cum)=>`„Verificare tehnică" facturată înainte de începerea lucrărilor: +${globalThis.fRON(Math.round(inc))}; cumul ${globalThis.fRON(Math.round(cum))}.`,
  (inc,cum)=>`Majorare onorariu proiectant fără schimbare de tema proiectului: +${globalThis.fRON(Math.round(inc))}; cumul ${globalThis.fRON(Math.round(cum))}.`,
  (inc,cum)=>`„Asistență tehnică pe durata execuției" (tarif orar nelimitat simulat): +${globalThis.fRON(Math.round(inc))}; cumul ${globalThis.fRON(Math.round(cum))}.`,
  (inc,cum)=>`Transfer discret către parlament „cheltuieli neeligibile re-clasificate": +${globalThis.fRON(Math.round(inc))}; cumul ${globalThis.fRON(Math.round(cum))}.`,
];

function wandDossierOpen(name,rr,dd,f){
  globalThis.buildWandDossierOpenLines(name,rr,dd,f).forEach(wandPushLog);
}
function wandDossierTickLine(inc,cum){
  return WAND_DOSSIER_TICK[Math.floor(Math.random()*WAND_DOSSIER_TICK.length)](inc,cum);
}
function wandDossierClose(reason,surplus,pname,elapsed){
  wandPushLog(`Pas FINAL: închidere sesiune (${reason}), „redistribuit" ${globalThis.fRON(surplus)} în ${globalThis.fTimer(elapsed)}.`);
  if(reason==='surplus')wandPushLog('Motiv: plafon absorbție atins; nu mai există diferență declarat-real de valorificat.');
  else if(reason==='time')wandPushLog('Motiv: cotă timp epuizată; restul rămâne practic irosit.');
  else if(reason==='orphan')wandPushLog('Motiv: proiect dispărut din evidență; linii de jurnal anulate retroactiv.');
  else wandPushLog('Motiv: oprire manuală');
  const pn=String(pname||'Proiect');
  wandPushLog(`Închidere DOSAR · „${pn.length>52?pn.slice(0,52)+'…':pn}": sumă propagată la surplus redistribuit / buget public.`);
}
function ensureWandTimer(){
  if(globalThis.S.sessTimer){clearInterval(globalThis.S.sessTimer);globalThis.S.sessTimer=null;}
  if(globalThis.S.activeSession)globalThis.S.sessTimer=setInterval(tickSession,1000);
}
function updateSessQuotaHints(){
  const el=globalThis.$('sess-quota-hints');if(!el||!globalThis.S.activeSession)return;
  const elapsed=Math.max(0,Math.floor((globalThis.nowTs()-globalThis.S.activeSession.startReal)/1000)-wandPauseOffsetSec());
  const left=globalThis.wandAvailSec();
  const q0=globalThis.S.activeSession.quotaSecAtStart;
  const capLabel=q0===Infinity||q0===-1?'nelimitat (abonament)':globalThis.fSec(q0);
  const pz=globalThis.S.activeSession.paused?' <strong>(PAUZĂ)</strong>':'';
  el.innerHTML=`Timp rămas din cota curentă: <strong>${globalThis.fSec(left)}</strong> · Durată sesiune: <strong>${globalThis.fTimer(elapsed)}</strong> · Cota la start: <strong>${capLabel}</strong>${pz}`;
  const pb=globalThis.$('wand-pause-btn');if(pb)pb.textContent=globalThis.S.activeSession.paused?'▶ Continuă':'⏸ Pauză';
}
function updWandFormControls(){
  const btn=globalThis.$('wand-start-btn');
  if(!btn)return;
  if(globalThis.S.activeSession){
    btn.disabled=true;
    btn.title='Sesiune activă: poți programa alte proiecte din coadă (ultima poziție).';
    return;
  }
  const pid=parseInt(globalThis.$('w-proj')?.value||'0',10);
  if(!pid){
    btn.disabled=true;
    btn.title='Selectează un proiect țintă.';
    return;
  }
  const core=globalThis.validateWandCore(pid);
  if(core.err){
    btn.disabled=true;
    btn.title=String(core.err).slice(0,280);
    return;
  }
  const proc=globalThis.validateWandProcurement(pid);
  btn.disabled=false;
  btn.title=proc.err?'Achiziție insuficientă: apasă „Pornește optimizarea” pentru a publica sau avansa o licitație legată de proiect.':'';
}
function syncWandSessionUI(){
  updWandFormControls();
  if(!globalThis.S.activeSession){
    globalThis.$('wand-form-wrap')?.classList.remove('hid');
    globalThis.$('sess-active-card')?.classList.add('hid');
    return;
  }
  globalThis.$('wand-form-wrap')?.classList.add('hid');
  globalThis.$('sess-active-card')?.classList.remove('hid');
  const as=globalThis.S.activeSession;
  const elapsed=Math.max(0,Math.floor((globalThis.nowTs()-as.startReal)/1000)-wandPauseOffsetSec());
  globalThis.$('sess-timer-disp')&&(globalThis.$('sess-timer-disp').textContent=globalThis.fTimer(elapsed)+(as.paused?' PAUZĂ':''));
  globalThis.$('sess-surplus-disp')&&(globalThis.$('sess-surplus-disp').textContent=globalThis.fRON(Math.round(as.dynamicSurplus||0)));
  globalThis.$('sess-info-disp')&&(globalThis.$('sess-info-disp').textContent=`Proiect: ${as.projectName||'-'} · Valoare reală: ${globalThis.fRON(as.realCost)} · Declarată: ${globalThis.fRON(as.declCost)} · Factor: ${(as.factor*100).toFixed(0)}%`);
  updateSessQuotaHints();
  globalThis.updateSessSurplusUI();
  const pb=globalThis.$('wand-pause-btn');if(pb)pb.textContent=as.paused?'▶ Continuă':'⏸ Pauză';
}
function startSession(){
  globalThis.ensureProjectForWand(()=>{
    if(globalThis.S.activeSession){globalThis.toast('O sesiune de optimizare este deja activă','warn');return;}
    const queueJobFromRef=globalThis.S._wandQueueJobRef;
    globalThis.S._wandQueueJobRef=null;
    const projectId=parseInt(globalThis.$('w-proj')?.value||'0',10);
    if(!projectId){globalThis.toast('Selectează un proiect pentru sesiune','err');return;}
    const linked=globalThis.S.projects.find(p=>p.id===projectId);
    if(!linked){globalThis.toast('Proiect invalid pentru sesiune','err');return;}
    const c=globalThis.validateWandCore(projectId);
    if(c.err){globalThis.toast(c.err,c.err.includes('timp')||c.err.includes('ore')||c.err.includes('abon')||c.err.includes('indisponibil')?'warn':'err');return;}
    const proc=globalThis.validateWandProcurement(projectId);
    if(proc.err){globalThis.openWandProcurementAssistDlg(projectId);return;}
    const est=globalThis.getProjectAccountingValues(linked);
    globalThis.$('w-real')&&(globalThis.$('w-real').value=String(est.real));
    globalThis.$('w-decl')&&(globalThis.$('w-decl').value=String(est.declared));
    globalThis.wPreview();
    const rr=parseFloat(globalThis.$('w-real')?.value)||0;
    const dd=parseFloat(globalThis.$('w-decl')?.value)||0;
    if(!rr||!dd){globalThis.toast('Valorile contabile nu sunt disponibile pentru acest proiect','err');return;}
    const f2=Math.max(0.2,Math.min(0.95,parseFloat(globalThis.$('w-fac')?.value||50)/100));
    if(dd<rr){globalThis.toast('Inconsistență: valoarea declarată este mai mică decât cea reală','err');return;}
    const quotaSecAtStart=globalThis.wandQuotaBase();
    let qJob=queueJobFromRef;
    let qLogs=[];
    if(qJob){
      qLogs=Array.isArray(qJob.logLines)?qJob.logLines.slice():[];
      qJob.status='running';
      qJob.factor=f2;
      qJob.projectName=linked?.name||qJob.projectName;
    }else{
      const existing=globalThis.S.wandQueue.find(x=>x.projectId===projectId&&(x.status==='pending'||x.status==='running'));
      if(existing){
        if(existing.status==='running'&&(!globalThis.S.activeSession||globalThis.S.activeSession.queueJobId!==existing.id))existing.status='pending';
        if(existing.status==='pending'){
          qJob=existing;
          qJob.status='running';
          qJob.factor=f2;
          qJob.projectName=linked?.name||qJob.projectName;
          qLogs=Array.isArray(qJob.logLines)?qJob.logLines.slice():[];
        }else if(existing.status==='running'){
          globalThis.toast('Proiectul e deja marcat în execuție în coadă. Reîncarcă pagina dacă e o eroare','err');return;
        }
      }
      if(!qJob){
        if(globalThis.wandNonDoneQueueCount()>=5){globalThis.toast('Coadă plină (max. 5 sarcini). Elimină una din listă sau finalizează o sesiune','warn');return;}
        qJob={id:globalThis.nowTs(),projectId,factor:f2,status:'running',logLines:[],projectName:linked?.name||'Proiect'};
        globalThis.S.wandQueue.push(qJob);
      }
    }
    globalThis.S.activeSession={id:globalThis.nowTs(),startReal:globalThis.nowTs(),realCost:rr,declCost:dd,factor:f2,projectId,projectName:linked?.name||'Proiect necunoscut',dynamicSurplus:0,lastTickAt:globalThis.nowTs(),quotaSecAtStart:quotaSecAtStart===Infinity?Infinity:quotaSecAtStart,paused:false,pausedMsTotal:0,_pauseAt:0,queueJobId:qJob?qJob.id:null,logLines:qLogs};
    globalThis.renderWandQueue();
    ensureWandTimer();
    globalThis.updWandChip();
    globalThis.$('wand-form-wrap')?.classList.add('hid');
    globalThis.$('sess-active-card')?.classList.remove('hid');
    globalThis.$('sess-info-disp')&&(globalThis.$('sess-info-disp').textContent=`Proiect: ${linked?.name||'-'} · Valoare reală: ${globalThis.fRON(rr)} · Declarată: ${globalThis.fRON(dd)} · Factor: ${(f2*100).toFixed(0)}%`);
    globalThis.$('sess-surplus-disp')&&(globalThis.$('sess-surplus-disp').textContent=globalThis.fRON(0));
    updateSessQuotaHints();
    globalThis.updateSessSurplusUI();
    wandDossierOpen(linked?.name||'Proiect',rr,dd,f2);
    globalThis.toast('✨ Sesiune de optimizare pornită!','ok');
  });
}
function wandPauseOffsetSec(){
  if(!globalThis.S.activeSession)return 0;
  let ms=globalThis.S.activeSession.pausedMsTotal||0;
  if(globalThis.S.activeSession.paused&&globalThis.S.activeSession._pauseAt)ms+=globalThis.nowTs()-globalThis.S.activeSession._pauseAt;
  return Math.floor(ms/1000);
}
function toggleWandPause(){
  if(!globalThis.S.activeSession)return;
  if(!globalThis.S.activeSession.paused){
    globalThis.S.activeSession.paused=true;
    globalThis.S.activeSession._pauseAt=globalThis.nowTs();
  }else{
    globalThis.S.activeSession.paused=false;
    if(globalThis.S.activeSession._pauseAt)globalThis.S.activeSession.pausedMsTotal=(globalThis.S.activeSession.pausedMsTotal||0)+(globalThis.nowTs()-globalThis.S.activeSession._pauseAt);
    globalThis.S.activeSession._pauseAt=0;
  }
  globalThis.toast(globalThis.S.activeSession.paused?'Optimizare în pauză':'Optimizare reluată',globalThis.S.activeSession.paused?'warn':'ok');
  syncWandSessionUI();
  if(globalThis.S.wandJobDetailId&&globalThis.S.activeSession&&(globalThis.S.activeSession.queueJobId===globalThis.S.wandJobDetailId||globalThis.S.wandJobDetailId===globalThis.S.activeSession.id))globalThis.renderWandJobView();
}
function wandPushLog(line){
  if(!globalThis.S.activeSession)return;
  if(!globalThis.S.activeSession.logLines)globalThis.S.activeSession.logLines=[];
  const t=globalThis.nowDate().toLocaleTimeString('ro-RO',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  globalThis.S.activeSession.logLines.push(`[${t}] ${line}`);
  if(globalThis.S.activeSession.logLines.length>120)globalThis.S.activeSession.logLines.shift();
  const qj=globalThis.S.wandQueue.find(q=>q.id===globalThis.S.activeSession.queueJobId);
  if(qj)qj.logLines=globalThis.S.activeSession.logLines.slice();
  if(globalThis.S.wandJobDetailId&&(globalThis.S.activeSession.queueJobId===globalThis.S.wandJobDetailId||globalThis.S.wandJobDetailId===globalThis.S.activeSession.id))globalThis.renderWandJobView();
}
function tickSession(){
  if(!globalThis.S.activeSession)return;
  if(!globalThis.S.projects.some(p=>p.id===globalThis.S.activeSession.projectId)){stopSession('orphan');return;}
  const now0=globalThis.nowTs();
  if(globalThis.S.activeSession.paused){
    globalThis.S.activeSession.lastTickAt=now0;
    const eff=Math.max(0,Math.floor((now0-globalThis.S.activeSession.startReal)/1000)-wandPauseOffsetSec());
    globalThis.$('sess-timer-disp')&&(globalThis.$('sess-timer-disp').textContent=globalThis.fTimer(eff)+' PAUZĂ');
    globalThis.updateSessSurplusUI();
    return;
  }
  const elapsed=Math.max(0,Math.floor((now0-globalThis.S.activeSession.startReal)/1000)-wandPauseOffsetSec());
  const now=now0;
  const deltaSec=Math.max(1,Math.floor((now-(globalThis.S.activeSession.lastTickAt||now))/1000));
  globalThis.S.activeSession.lastTickAt=now;
  const maxSurplus=Math.max(0,(globalThis.S.activeSession.declCost-globalThis.S.activeSession.realCost)*globalThis.S.activeSession.factor);
  const wr=globalThis.diffTune().wandRate;
  const dynamicRate=Math.max(0.04,0.24-(elapsed/1800))*wr;
  const increment=Math.min(maxSurplus-globalThis.S.activeSession.dynamicSurplus,maxSurplus*dynamicRate*deltaSec/60);
  globalThis.S.activeSession.dynamicSurplus+=Math.max(0,increment);
  if(!globalThis.S.activeSession._logEvery)globalThis.S.activeSession._logEvery=0;
  globalThis.S.activeSession._logEvery+=deltaSec;
  if(globalThis.S.activeSession._logEvery>=5){
    globalThis.S.activeSession._logEvery=0;
    wandPushLog(wandDossierTickLine(increment,globalThis.S.activeSession.dynamicSurplus));
  }
  globalThis.$('sess-timer-disp')&&(globalThis.$('sess-timer-disp').textContent=globalThis.fTimer(elapsed));
  globalThis.$('sess-surplus-disp')&&(globalThis.$('sess-surplus-disp').textContent=globalThis.fRON(Math.round(globalThis.S.activeSession.dynamicSurplus)));
  const mins=Math.floor(elapsed/60),secs=elapsed%60;
  globalThis.$('wand-chip-timer')&&(globalThis.$('wand-chip-timer').textContent=`${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`);
  updateSessQuotaHints();
  globalThis.updateSessSurplusUI();
  const avail=globalThis.wandAvailSec();
  if(avail<=0&&avail!==Infinity){stopSession('time');return;}
  if(maxSurplus>0&&Math.round(globalThis.S.activeSession.dynamicSurplus)>=Math.round(maxSurplus)){stopSession('surplus');return;}
}
function stopSession(reason){
  reason=reason||'manual';
  if(!globalThis.S.activeSession)return;
  if(globalThis.S.activeSession.paused&&globalThis.S.activeSession._pauseAt){
    globalThis.S.activeSession.pausedMsTotal=(globalThis.S.activeSession.pausedMsTotal||0)+(globalThis.nowTs()-globalThis.S.activeSession._pauseAt);
    globalThis.S.activeSession._pauseAt=0;
    globalThis.S.activeSession.paused=false;
  }
  clearInterval(globalThis.S.sessTimer);globalThis.S.sessTimer=null;
  let elapsed=Math.max(0,Math.floor((globalThis.nowTs()-globalThis.S.activeSession.startReal)/1000)-wandPauseOffsetSec());
  const q0=globalThis.S.activeSession.quotaSecAtStart;
  if(q0!==Infinity&&q0!==-1)elapsed=Math.min(elapsed,q0);
  const {realCost,declCost,factor,projectId,projectName}=globalThis.S.activeSession;
  const surplus=Math.round(globalThis.S.activeSession.dynamicSurplus||0);
  wandDossierClose(reason,surplus,projectName,elapsed);
  if(globalThis.hasPaidSubscription())globalThis.S.sub.secUsed+=elapsed;
  else globalThis.S.purchSecUsed+=elapsed;
  const siphBefore=globalThis.S.siphoned;
  globalThis.S.siphoned+=surplus;
  globalThis.S.ledger.redistributedSurplus+=surplus;
  globalThis.S.ledger.publicBudget=Math.max(0,globalThis.S.ledger.publicBudget-surplus);
  if(surplus>500000&&Math.random()<0.35){
    const firm=(globalThis.S.tenders.find(t=>t.projectId===projectId)?.winner)||'SC Intermediar Necunoscut';
    if(!globalThis.S.worldMemory.blacklistedFirms.includes(firm)&&Math.random()<0.4)globalThis.S.worldMemory.blacklistedFirms.push(firm);
  }
  const sess={id:globalThis.S.activeSession.id,startReal:globalThis.S.activeSession.startReal,elapsed,realCost,declCost,factor,surplus,projectId,projectName,logLines:(globalThis.S.activeSession.logLines||[]).slice()};
  globalThis.S.sessions.unshift(sess);
  const qid=globalThis.S.activeSession.queueJobId;
  const detailWas=qid&&globalThis.S.wandJobDetailId===qid;
  if(qid)globalThis.S.wandQueue=globalThis.S.wandQueue.filter(x=>x.id!==qid);
  if(detailWas){
    globalThis.S.wandJobDetailId=null;
    if(globalThis.$('view-wandjob')?.classList.contains('active'))globalThis.navigate('wand');
  }
  const lp=globalThis.S.projects.find(x=>x.id===projectId);
  if(lp)lp.wandUsed=true;
  globalThis.S.activeSession=null;
  globalThis.$('wand-form-wrap')?.classList.remove('hid');
  globalThis.$('sess-active-card')?.classList.add('hid');
  globalThis.$('sess-timer-disp')&&(globalThis.$('sess-timer-disp').textContent='00:00:00');
  globalThis.updWandChip();globalThis.updWandQuota();globalThis.renderSessions();globalThis.renderDash();
  globalThis.updWandProjectOptions(projectId);
  if(reason==='orphan')globalThis.addAct(`Sesiune oprită: proiect inexistent. ${globalThis.fTimer(elapsed)} · ${globalThis.fRON(surplus)}.`);
  else globalThis.addAct(`Sesiune Bagheta Magică pe „${projectName}”: ${globalThis.fTimer(elapsed)} · surplus dinamic ${globalThis.fRON(surplus)}.`);
  globalThis.recalcJudiciaryPressure();
  if(reason==='time')globalThis.toast('Timp epuizat! Sesiunea s-a oprit automat','warn');
  else if(reason==='surplus')globalThis.toast('Surplus maxim extras. Nu mai rămâne nimic de optimizat pe această sesiune','ok');
  else if(reason==='orphan')globalThis.toast('Proiectul nu mai există. Sesiune oprită','warn');
  else globalThis.toast(`✨ Sesiune finalizată! ${globalThis.fRON(surplus)} „optimizați" în ${globalThis.fTimer(elapsed)}.`,'ok');
  globalThis.maybeTriggerInvestigationOnSiphonCross(siphBefore);
  globalThis.updDebug();
  setTimeout(()=>{globalThis.tryStartNextQueuedWand();globalThis.renderWandQueue();globalThis.saveState();},400);
}
function initWandSessionEngine(){
  globalThis.wandDossierOpen=wandDossierOpen;
  globalThis.wandDossierTickLine=wandDossierTickLine;
  globalThis.wandDossierClose=wandDossierClose;
  globalThis.ensureWandTimer=ensureWandTimer;
  globalThis.updateSessQuotaHints=updateSessQuotaHints;
  globalThis.updWandFormControls=updWandFormControls;
  globalThis.syncWandSessionUI=syncWandSessionUI;
  globalThis.startSession=startSession;
  globalThis.wandPauseOffsetSec=wandPauseOffsetSec;
  globalThis.toggleWandPause=toggleWandPause;
  globalThis.wandPushLog=wandPushLog;
  globalThis.tickSession=tickSession;
  globalThis.stopSession=stopSession;
}
globalThis.initWandSessionEngine=initWandSessionEngine;
})();