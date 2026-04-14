;(function(){
function activeWandProjects(){
  return globalThis.S.projects.filter(p=>(p.status==='in_progress'||p.status==='planned')&&!p.hideFromWandQueue&&!globalThis.projectWandAlreadyUsed(p.id));
}
function moveWandQueueEntry(id,dir){
  const i=globalThis.S.wandQueue.findIndex(x=>x.id===id);
  if(i<0)return;
  if(globalThis.S.wandQueue[i].status!=='pending'){globalThis.toast('Poți muta doar sarcinile în așteptare','warn');return;}
  let j=i+dir;
  while(j>=0&&j<globalThis.S.wandQueue.length&&globalThis.S.wandQueue[j].status!=='pending')j+=dir;
  if(j<0||j>=globalThis.S.wandQueue.length){globalThis.toast('Nu se poate muta în această direcție','warn');return;}
  const t=globalThis.S.wandQueue[i];globalThis.S.wandQueue[i]=globalThis.S.wandQueue[j];globalThis.S.wandQueue[j]=t;
  globalThis.renderWandQueue();globalThis.saveState();globalThis.toast('Ordinea cozii a fost actualizată','ok');
}
function removeWandQueueEntry(id){
  const q=globalThis.S.wandQueue.find(x=>x.id===id);
  if(!q||q.status!=='pending'){globalThis.toast('Poți elimina doar sarcinile în așteptare (nu pe cele în execuție)','warn');return;}
  globalThis.S.wandQueue=globalThis.S.wandQueue.filter(x=>x.id!==id);
  if(globalThis.S.wandJobDetailId===id){
    globalThis.S.wandJobDetailId=null;
    if(globalThis.$('view-wandjob')?.classList.contains('active'))globalThis.navigate('wand');
  }
  globalThis.renderWandQueue();globalThis.saveState();globalThis.toast('Eliminat din coadă','ok');
  if(!globalThis.S.activeSession)globalThis.tryStartNextQueuedWand();
}
function wandQueueScheduleFactorPct(){
  return globalThis.clamp(parseInt(globalThis.$('wq-sch-fac')?.value||'50',10),20,95);
}
function onWandQueueScheduleFactorInput(){
  const pct=wandQueueScheduleFactorPct();
  globalThis.$('wq-sch-fac-disp')&&(globalThis.$('wq-sch-fac-disp').textContent=String(pct));
  const f=pct/100;
  const el=globalThis.$('wq-sch-fac-hint');if(!el)return;
  const meta=globalThis.$('wq-sch-meta');
  const rr=parseFloat(meta?.dataset?.real||'0');
  const dd=parseFloat(meta?.dataset?.decl||'0');
  const maxS=globalThis.wandMaxSurplusTheoretical(rr,dd,f);
  el.innerHTML=`Factorul <strong>${pct}%</strong> definește plafonul de surplus sesiune: <strong>(declarat-real) × factor</strong> → max. <strong>${globalThis.fRON(Math.round(maxS))}</strong> la valorile de mai sus. În sesiune, surplusul crește treptat până la acest plafon. La <strong>≥70%</strong> factor, după start se poate declanșa o alertă ANAF/DNA.`;
}
function openWandQueueScheduleEdit(queueJobId){
  const q=globalThis.S.wandQueue.find(x=>x.id===queueJobId);
  if(!q){globalThis.toast('Intrarea nu mai există în coadă','warn');return;}
  openWandQueueScheduleDialog(q.projectId,{editQueueId:queueJobId});
}
function openWandQueueScheduleDialog(projectId,opts){
  opts=opts||{};
  const editId=opts.editQueueId!=null?opts.editQueueId:null;
  const linked=globalThis.S.projects.find(p=>p.id===projectId);
  if(!linked){globalThis.toast('Proiect invalid','err');return;}
  if(editId==null){
    if(globalThis.S.activeSession&&globalThis.S.activeSession.projectId===projectId){globalThis.toast('Sesiune activă pe acest proiect. Nu îl poți adăuga în coadă acum','warn');return;}
    if(globalThis.S.wandQueue.some(q=>q.projectId===projectId&&(q.status==='pending'||q.status==='running'))){globalThis.toast('Proiectul este deja în coadă sau în execuție','warn');return;}
    if(globalThis.wandNonDoneQueueCount()>=5){globalThis.toast('Coadă plină (max. 5 sarcini nefinalizate). Elimină una din listă','warn');return;}
  }else{
    const q=globalThis.S.wandQueue.find(x=>x.id===editId);
    if(!q||q.projectId!==projectId){globalThis.toast('Intrarea din coadă nu mai este validă','warn');return;}
    if(q.status!=='pending'){globalThis.toast('Poți modifica parametrii doar pentru sarcini în așteptare','warn');return;}
    if(globalThis.S.activeSession){globalThis.toast('Nu poți edita coada pe durata unei sesiuni active','warn');return;}
  }
  const v=globalThis.validateWandStart(projectId);
  if(v.err){globalThis.toast(v.err,v.err.includes('licitație')||v.err.includes('Licitații')||v.err.includes('Clarificări')||v.err.includes('Depuneri')||v.err.includes('indisponibil')?'warn':'err');return;}
  const est=globalThis.getProjectAccountingValues(linked);
  let defaultPct=Math.round(est.recFactor);
  if(editId!=null){
    const q=globalThis.S.wandQueue.find(x=>x.id===editId);
    defaultPct=Math.round((q?.factor??0.5)*100);
  }else{
    defaultPct=parseInt(globalThis.$('w-fac')?.value||String(est.recFactor),10);
  }
  defaultPct=globalThis.clamp(defaultPct,20,95);
  const pname=globalThis.escapeHtml(linked.name||'Proiect');
  const sub=editId!=null?'Modifică factorul înainte de execuție':'Același model ca în formularul principal';
  globalThis.dlgOpen(editId!=null?'Parametri sarcină în coadă':'Programează în coadă (parametri)',sub,
    `<div id="wq-sch-meta" data-real="${est.real}" data-decl="${est.declared}" style="display:none" aria-hidden="true"></div>
    <p class="tsm tmut mb12" style="line-height:1.6"><strong>${pname}</strong><br/>
    Valoare reală: <strong>${globalThis.fRON(est.real)}</strong> · Declarată: <strong>${globalThis.fRON(est.declared)}</strong></p>
    <div class="fg mb0"><label>Factor de optimizare: <strong id="wq-sch-fac-disp">${defaultPct}</strong>% <span class="tsm tmut" style="font-weight:600">(20-95%)</span></label>
      <input type="range" id="wq-sch-fac" min="20" max="95" value="${defaultPct}" style="width:100%;accent-color:var(--blue)" oninput="onWandQueueScheduleFactorInput()"/>
    </div>
    <p id="wq-sch-fac-hint" class="tsm u-lh155" style="margin-top:10px;color:var(--text2)"></p>`,
    `<button type="button" class="btn btn-f" onclick="dlgClose()">Anulează</button>
     <button type="button" class="btn btn-p" onclick="wandQueueScheduleConfirm(${projectId},${editId==null?'null':editId})">${editId!=null?'Salvează':'Adaugă în coadă'}</button>`
  );
  onWandQueueScheduleFactorInput();
}
function wandQueueScheduleConfirm(projectId,editQueueId){
  const editId=editQueueId==null||editQueueId==='null'?null:Number(editQueueId);
  const f2=Math.max(0.2,Math.min(0.95,wandQueueScheduleFactorPct()/100));
  const linked=globalThis.S.projects.find(p=>p.id===projectId);
  if(!linked){globalThis.toast('Proiect invalid','err');globalThis.dlgClose();return;}
  if(editId!=null){
    const q=globalThis.S.wandQueue.find(x=>x.id===editId);
    if(!q||q.status!=='pending'||q.projectId!==projectId){globalThis.toast('Nu se mai poate salva. Verifică coada','warn');globalThis.dlgClose();globalThis.renderWandQueue();return;}
    q.factor=f2;
    q.projectName=linked.name||q.projectName;
    globalThis.dlgClose();
    globalThis.renderWandQueue();globalThis.saveState();globalThis.toast('Parametrii sarcinii au fost actualizați','ok');
    return;
  }
  if(globalThis.S.wandQueue.some(q=>q.projectId===projectId&&(q.status==='pending'||q.status==='running'))){globalThis.toast('Proiectul este deja în coadă','warn');globalThis.dlgClose();return;}
  if(globalThis.wandNonDoneQueueCount()>=5){globalThis.toast('Coadă plină (max. 5)','warn');globalThis.dlgClose();return;}
  const v=globalThis.validateWandStart(projectId);
  if(v.err){globalThis.toast(v.err,v.err.includes('licitație')||v.err.includes('Licitații')||v.err.includes('Clarificări')||v.err.includes('Depuneri')||v.err.includes('indisponibil')?'warn':'err');globalThis.dlgClose();return;}
  globalThis.S.wandQueue.push({id:globalThis.nowTs(),projectId,factor:f2,status:'pending',logLines:[],projectName:linked.name||'Proiect'});
  if(globalThis.S.wandQueue.length>32)globalThis.S.wandQueue=globalThis.S.wandQueue.slice(-32);
  globalThis.dlgClose();
  globalThis.renderWandQueue();globalThis.saveState();globalThis.toast('Optimizare programată în coadă','ok');
  if(!globalThis.S.activeSession)globalThis.tryStartNextQueuedWand();
}
function wandQuickSchedule(projectId){
  globalThis.$('w-proj')&&(globalThis.$('w-proj').value=String(projectId));
  globalThis.onWandProjectChange();
  openWandQueueScheduleDialog(projectId);
}
function initWandScheduler(){
  globalThis.activeWandProjects=activeWandProjects;
  globalThis.moveWandQueueEntry=moveWandQueueEntry;
  globalThis.removeWandQueueEntry=removeWandQueueEntry;
  globalThis.wandQueueScheduleFactorPct=wandQueueScheduleFactorPct;
  globalThis.onWandQueueScheduleFactorInput=onWandQueueScheduleFactorInput;
  globalThis.openWandQueueScheduleEdit=openWandQueueScheduleEdit;
  globalThis.openWandQueueScheduleDialog=openWandQueueScheduleDialog;
  globalThis.wandQueueScheduleConfirm=wandQueueScheduleConfirm;
  globalThis.wandQuickSchedule=wandQuickSchedule;
}
globalThis.initWandScheduler=initWandScheduler;
})();