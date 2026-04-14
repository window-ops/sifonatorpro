;(function(){
function openWandProcurementAssistDlg(projectId){
  const linked=globalThis.S.projects.find(p=>p.id===projectId);
  if(!linked)return;
  const pname=globalThis.escapeHtml(linked.name||'Proiect');
  const rel=globalThis.S.tenders.filter(t=>t.projectId===projectId);
  const openOnly=rel.filter(t=>t.status==='open');
  const none=rel.length===0;
  let body='';
  if(none){
    body=`<p class="tsm tmut lh165">Nu există nicio licitație legată de <strong>${pname}</strong>. Publică una acum (proiectul e deja selectat); o vom trece automat la <strong>Clarificări</strong> ca să poți folosi Bagheta fără pași în plus.</p>`;
  }else{
    body=`<p class="tsm tmut lh165">Licitațiile de pe <strong>${pname}</strong> sunt încă doar în anunț (publicată). Bagheta are nevoie de etapa <strong>Clarificări</strong> sau mai departe.</p>
    ${openOnly.length?`<ul class="tsm u-lh155" style="margin:10px 0;padding-left:18px">${openOnly.map(t=>`<li>${globalThis.escapeHtml(t.name)}</li>`).join('')}</ul>`:''}`;
  }
  const actions=none
    ?`<button type="button" class="btn btn-f" onclick="dlgClose()">Anulează</button>
      <button type="button" class="btn btn-p" onclick="dlgClose();openNewTendDlgForProject(${projectId},{autoAdvanceAfterPublish:true})">+ Publică licitație (proiectul e setat)</button>`
    :`<button type="button" class="btn btn-f" onclick="dlgClose()">Închide</button>
      <button type="button" class="btn btn-p" onclick="dlgClose();wandAdvanceOpenTendersToClarificari(${projectId})">→ Avansează toate la Clarificări</button>
      <button type="button" class="btn btn-f" onclick="dlgClose();openNewTendDlgForProject(${projectId},{autoAdvanceAfterPublish:true})">+ Publică altă licitație</button>
      <button type="button" class="btn btn-s" onclick="dlgClose();navigate('tend')">Deschide Licitații (manual)</button>`;
  globalThis.dlgOpen('Achiziție pentru Bagheta Magică','Publică sau avansează procedura',body+`<p class="tsm tmut mt6 mb0">După ce e gata, revino aici și apasă din nou <strong>Pornește optimizarea</strong>.</p>`,actions);
}
function initTendersProcurementAssist(){
  globalThis.openWandProcurementAssistDlg=openWandProcurementAssistDlg;
}
globalThis.initTendersProcurementAssist=initTendersProcurementAssist;
})();