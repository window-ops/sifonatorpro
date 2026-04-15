;(function(){
function updWandProjectOptions(prefId){
  const sel=globalThis.$('w-proj');if(!sel)return;
  const previous=prefId!=null&&prefId!==undefined?String(prefId):sel.value;
  const opts=['<option value="">(Selectează proiect)</option>'].concat(globalThis.S.projects.filter(p=>!p.hideFromWandQueue).map(p=>{const used=globalThis.projectWandAlreadyUsed(p.id),fin=p.status==='completed',dis=used||fin;return`<option value="${globalThis.escapeHtml(String(p.id))}"${dis?' disabled':''}>${globalThis.escapeHtml(p.name)}${used?' · ✓ Bagheta folosită':''}${fin&&!used?' · finalizat (ineligibil)':''} · ${globalThis.escapeHtml(globalThis.sLabel(p.status))}</option>`;}));
  sel.innerHTML=opts.join('');
  let next='';
  const prevOk=previous&&globalThis.S.projects.some(p=>String(p.id)===previous)&&!globalThis.projectWandAlreadyUsed(parseInt(previous,10))&&!globalThis.S.projects.find(p=>String(p.id)===previous)?.hideFromWandQueue&&globalThis.S.projects.find(p=>String(p.id)===previous)?.status!=='completed';
  if(prevOk)next=previous;
  else{const first=globalThis.S.projects.find(p=>!globalThis.projectWandAlreadyUsed(p.id)&&!p.hideFromWandQueue&&p.status!=='completed');next=first?String(first.id):'';}
  sel.value=next;
  onWandProjectChange();
}
function onWandProjectChange(){
  const pid=parseInt(globalThis.$('w-proj')?.value||'0',10),p=globalThis.S.projects.find(x=>x.id===pid),ai=globalThis.$('w-ai-insight');
  if(!p){if(ai)ai.textContent='Selectează un proiect pentru a încărca valorile contabile din sistemul de proiecte publice.';globalThis.wPreview();globalThis.updWandFormControls();return;}
  if(p.status==='completed'){if(ai)ai.textContent=`Proiectul „${p.name}” este finalizat. Bagheta nu optimizează dosare închise. Alege un proiect planificat sau în desfășurare.`;globalThis.wPreview();globalThis.updWandFormControls();return;}
  const st=globalThis.sLabel(p.status),pr=globalThis.getProjectProcurementSummary(p.id),elig=globalThis.tendersEligibleForWandCount(p.id);
  if(ai)ai.textContent=`Proiect detectat: „${p.name}” · buget ${globalThis.fRON(p.budget)} · status ${st}. Valorile sunt sincronizate automat din modulul proiecte.`;
  if(ai)ai.textContent+=` Licitații asociate: ${pr.count}${pr.hasAwarded?' (există contract adjudecat)':''}.`;
  if(ai){if(pr.count===0)ai.textContent+=` Bagheta: publică o licitație pe acest proiect și avanseaz-o cel puțin până la Clarificări (sau mai departe). Nu e suficient doar anunțul publicat.`;else if(elig<1)ai.textContent+=` Bagheta: ai licitații, dar toate sunt încă doar „publicate”; din Licitații apasă → Clarificări (sau Depuneri etc.).`;else ai.textContent+=` Bagheta: ${elig}/${pr.count} licitație(ii) eligibile (Clarificări sau mai târziu).`;}
  syncWandFromProject();globalThis.updWandFormControls();globalThis.wPreview();
}
function syncWandFromProject(){
  const pid=parseInt(globalThis.$('w-proj')?.value||'0',10),p=globalThis.S.projects.find(x=>x.id===pid);if(!p)return;
  const est=globalThis.getProjectAccountingValues(p);
  globalThis.$('w-real')&&(globalThis.$('w-real').value=String(est.real));
  globalThis.$('w-decl')&&(globalThis.$('w-decl').value=String(est.declared));
  globalThis.$('w-fac')&&(globalThis.$('w-fac').value=String(est.recFactor));
  globalThis.$('wf-d')&&(globalThis.$('wf-d').textContent=String(est.recFactor));
  const ai=globalThis.$('w-ai-insight');
  if(ai)ai.textContent=`Estimare din proiect „${p.name}": real ${globalThis.fRON(est.real)}, declarat ${globalThis.fRON(est.declared)}; factor implicit recomandat ${est.recFactor}% (modificabil înainte de start).`;
  globalThis.wPreview();
}
function initWandProjectBinding(){
  globalThis.__updWandProjectOptions=updWandProjectOptions;
  globalThis.__onWandProjectChange=onWandProjectChange;
  globalThis.__syncWandFromProject=syncWandFromProject;
  globalThis.updWandProjectOptions=updWandProjectOptions;
  globalThis.onWandProjectChange=onWandProjectChange;
  globalThis.syncWandFromProject=syncWandFromProject;
}
globalThis.initWandProjectBinding=initWandProjectBinding;
})();