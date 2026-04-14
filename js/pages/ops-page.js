;(function(){
function renderOps(){
  const el=globalThis.$('ops-state');if(!el)return;
  const openProjects=globalThis.S.projects.filter(p=>p.status==='in_progress').length;
  const wand=globalThis.S.activeSession?'ACTIVĂ':'INACTIVĂ';
  el.innerHTML=`
    <div class="gline"><span class="gk">Proiecte în execuție</span><span class="gv">${openProjects}</span></div>
    <div class="gline"><span class="gk">Canal optimizare contabilă</span><span class="gv">${wand}</span></div>
    <div class="gline"><span class="gk">Presiune juridică</span><span class="gv">${globalThis.S.judiciaryRisk}%</span></div>
    <div class="gline"><span class="gk">Etapă justiție</span><span class="gv">${globalThis.justiceStageRo(globalThis.S.justice.stage)}</span></div>
    <div class="gline"><span class="gk">Perspectivă operațională estimată</span><span class="gv">${globalThis.S.judiciaryRisk>70?'Foarte scurtă':globalThis.S.judiciaryRisk>35?'Medie':'Confortabilă'}</span></div>`;
}
function initOpsPage(){
  globalThis.renderOps=renderOps;
}
globalThis.initOpsPage=initOpsPage;
})();