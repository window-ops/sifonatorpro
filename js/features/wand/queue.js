;(function(){
function validateWandCore(projectId){
  const linked=globalThis.S.projects.find(p=>p.id===projectId);
  if(!linked)return{err:'Proiect invalid pentru sesiune'};
  if(linked.hideFromWandQueue)return{err:'Proiect indisponibil pentru Bagheta (exemplu demo).'};
  if(linked.status==='completed')return{err:'Proiectul este deja finalizat. Bagheta nu optimizează dosare închise.'};
  const quotaSecAtStart=globalThis.wandQuotaBase();
  if(quotaSecAtStart<=0&&quotaSecAtStart!==Infinity)return{err:'Nu ai timp disponibil pentru Bagheta Magică. Cumpără ore sau abonează-te.'};
  if(globalThis.projectWandAlreadyUsed(projectId))return{err:'Bagheta Magică a fost deja folosită pe acest proiect.'};
  return{err:null};
}
function validateWandProcurement(projectId){
  const linked=globalThis.S.projects.find(p=>p.id===projectId);
  if(!linked)return{err:'Proiect invalid pentru sesiune'};
  const pr=globalThis.getProjectProcurementSummary(linked.id);
  if(!pr.count)return{err:'Nu există licitații pe acest proiect. Publică una din Licitații, apoi avanseaz-o cel puțin până la Clarificări (sau mai departe).'};
  if(globalThis.tendersEligibleForWandCount(linked.id)<1)return{err:'Bagheta nu poate rula: licitațiile sunt încă doar „publicate” (anunț). Avansează cel puțin una la Clarificări sau mai departe din modulul Licitații.'};
  return{err:null};
}
function validateWandStart(projectId){
  const c=validateWandCore(projectId);
  if(c.err)return c;
  return validateWandProcurement(projectId);
}
function wandNonDoneQueueCount(){return globalThis.S.wandQueue.filter(q=>q.status==='pending'||q.status==='running').length;}
function dedupeWandQueueByProject(){
  const seen=new Set();
  globalThis.S.wandQueue=globalThis.S.wandQueue.slice().reverse().filter(q=>{
    if(seen.has(q.projectId))return false;
    seen.add(q.projectId);
    return true;
  }).reverse();
}
function cleanupWandQueueState(){
  globalThis.S.wandQueue=globalThis.S.wandQueue.filter(q=>q.status!=='done');
  globalThis.S.wandQueue=globalThis.S.wandQueue.filter(q=>{
    const p=globalThis.S.projects.find(x=>x.id===q.projectId);
    if(!p)return false;
    if(globalThis.projectWandAlreadyUsed(q.projectId))return false;
    if(p.hideFromWandQueue){
      if(globalThis.S.activeSession&&globalThis.S.activeSession.queueJobId===q.id)return true;
      return false;
    }
    if(p.status!=='in_progress'&&p.status!=='planned'){
      if(globalThis.S.activeSession&&globalThis.S.activeSession.queueJobId===q.id)return true;
      return false;
    }
    if(q.status==='running'&&(!globalThis.S.activeSession||globalThis.S.activeSession.queueJobId!==q.id))q.status='pending';
    return true;
  });
  dedupeWandQueueByProject();
}
function addToWandQueue(){
  if(globalThis.S.activeSession){globalThis.toast('Sesiune activă: programează alte proiecte din „Proiecte disponibile pentru coadă” (ultima poziție în coadă)','warn');return;}
  const projectId=parseInt(globalThis.$('w-proj')?.value||'0',10);
  if(!projectId){globalThis.toast('Selectează un proiect','err');return;}
  globalThis.openWandQueueScheduleDialog(projectId);
}
function tryStartNextQueuedWand(depth){
  const d=depth||0;
  if(d>8||globalThis.S.activeSession)return;
  const next=globalThis.S.wandQueue.find(q=>q.status==='pending');
  if(!next)return;
  const v=validateWandStart(next.projectId);
  if(v.err){
    globalThis.S.wandQueue=globalThis.S.wandQueue.filter(x=>x.id!==next.id);
    globalThis.addAct(`Coadă Baghetă: eliminat proiect ${next.projectId} (${v.err})`);
    globalThis.renderWandQueue();globalThis.saveState();
    tryStartNextQueuedWand(d+1);return;
  }
  globalThis.$('w-proj')&&(globalThis.$('w-proj').value=String(next.projectId));
  globalThis.onWandProjectChange();
  const nf=Math.max(20,Math.min(95,Math.round(next.factor*100)));
  globalThis.$('w-fac')&&(globalThis.$('w-fac').value=String(nf));
  globalThis.$('wf-d')&&(globalThis.$('wf-d').textContent=String(nf));
  globalThis.wPreview();
  globalThis.S._wandQueueJobRef=next;
  globalThis.startSession();
}
function initWandQueueFeature(){
  globalThis.validateWandCore=validateWandCore;
  globalThis.validateWandProcurement=validateWandProcurement;
  globalThis.validateWandStart=validateWandStart;
  globalThis.wandNonDoneQueueCount=wandNonDoneQueueCount;
  globalThis.dedupeWandQueueByProject=dedupeWandQueueByProject;
  globalThis.cleanupWandQueueState=cleanupWandQueueState;
  globalThis.addToWandQueue=addToWandQueue;
  globalThis.tryStartNextQueuedWand=tryStartNextQueuedWand;
}
globalThis.initWandQueueFeature=initWandQueueFeature;
})();