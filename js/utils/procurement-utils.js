;(function(){
const LAW98_DIRECT_LIMIT_SUPPLIES_SERVICES_RON=270120;
const LAW98_DIRECT_LIMIT_WORKS_RON=900400;

function projectProcurementMode(p){
  const m=p?.procurementMode;
  return(m==='direct'||m==='licitatie')?m:'licitatie';
}
function projectUsesTenderFlow(p){return projectProcurementMode(p)==='licitatie';}
function procurementModeLabel(mode){return mode==='direct'?'Achiziție directă':'Licitație publică';}
function projectHasWinningTender(p){
  return globalThis.S.tenders.some(t=>t.projectId===p.id&&!!t.winner&&['awarded','executie'].includes(t.status));
}
function law98DirectLimitForProject(p){
  const k=globalThis.projectCategoryKey(p);
  return(k==='constructii'||k==='infrastructura')
    ? LAW98_DIRECT_LIMIT_WORKS_RON
    : LAW98_DIRECT_LIMIT_SUPPLIES_SERVICES_RON;
}
function projectTenderExemptByLaw98(p){
  const declared=Math.max(0,Number(p?.declaredValue||p?.budget||0));
  return declared>0&&declared<=law98DirectLimitForProject(p);
}
function projectFinalizeBlockReason(p){
  if(projectProcurementMode(p)==='direct'){
    const limit=law98DirectLimitForProject(p);
    if(projectTenderExemptByLaw98(p))return'';
    return`Proiectul este setat pe Achiziție directă, dar depășește pragul simulat din Legea 98/2016 (${globalThis.fRON(limit)} pentru categoria selectată). Schimbă procedura la Licitație publică și adaugă cel puțin o licitație.`;
  }
  const hasTender=globalThis.S.tenders.some(t=>t.projectId===p.id);
  if(!hasTender)return`Proiectul nu poate fi finalizat fără cel puțin o licitație asociată (${procurementModeLabel('licitatie')}).`;
  if(projectHasWinningTender(p))return'';
  return'Proiectul nu poate fi finalizat până când nu există o licitație adjudecată (cu câștigător valid).';
}
function buildProcurementHelperHtml(mode,categoryKey,declaredValue){
  const cats=globalThis.PROJECT_CATEGORIES||{};
  const cat=categoryKey&&cats[categoryKey]?categoryKey:'diverse';
  const limit=law98DirectLimitForProject({projCategory:cat,declaredValue,budget:declaredValue});
  const isWork=cat==='constructii'||cat==='infrastructura';
  const scopeLabel=isWork?'lucrări':'servicii/produse';
  const hasDeclared=Number.isFinite(declaredValue)&&declaredValue>0;
  if(mode==='direct'){
    if(hasDeclared&&declaredValue>limit){
      return `<span class="proc-help proc-help--warn" role="status">⚠️ Pentru <strong>${scopeLabel}</strong>, ai depășit pragul de <strong>${globalThis.fRON(limit)}</strong>. Trebuie <strong>Licitație publică</strong>.</span>`;
    }
    return `Pentru <strong>${scopeLabel}</strong>, achiziția directă este permisă până la <strong>${globalThis.fRON(limit)}</strong>.`;
  }
  if(hasDeclared&&declaredValue<=limit){
    return `Valoarea declarată (${globalThis.fRON(declaredValue)}) este sub pragul de <strong>${globalThis.fRON(limit)}</strong> pentru <strong>${scopeLabel}</strong>; poți folosi și <strong>Achiziție directă</strong>.`;
  }
  return `Pentru <strong>${scopeLabel}</strong>, peste <strong>${globalThis.fRON(limit)}</strong> se aplică <strong>Licitație publică</strong>.`;
}
function npUpdateProcHelper(){
  const helper=globalThis.$('np-proc-help');if(!helper)return;
  const mode=globalThis.$('np-proc')?.value==='direct'?'direct':'licitatie';
  const cat=globalThis.$('np-cat')?.value||'diverse';
  const declared=globalThis.readProjectMoneyEl(globalThis.$('np-dv'));
  helper.innerHTML=buildProcurementHelperHtml(mode,cat,declared);
}
function pmUpdateProcHelper(){
  const helper=globalThis.$('pm-proc-help');if(!helper)return;
  const mode=globalThis.$('pm-proc')?.value==='direct'?'direct':'licitatie';
  const cat=globalThis.$('pm-cat')?.value||'diverse';
  const declared=globalThis.readProjectMoneyEl(globalThis.$('pm-decl'));
  helper.innerHTML=buildProcurementHelperHtml(mode,cat,declared);
}
function initProcurementUtils(){
  globalThis.LAW98_DIRECT_LIMIT_SUPPLIES_SERVICES_RON=globalThis.LAW98_DIRECT_LIMIT_SUPPLIES_SERVICES_RON||LAW98_DIRECT_LIMIT_SUPPLIES_SERVICES_RON;
  globalThis.LAW98_DIRECT_LIMIT_WORKS_RON=globalThis.LAW98_DIRECT_LIMIT_WORKS_RON||LAW98_DIRECT_LIMIT_WORKS_RON;
  globalThis.projectProcurementMode=projectProcurementMode;
  globalThis.projectUsesTenderFlow=projectUsesTenderFlow;
  globalThis.procurementModeLabel=procurementModeLabel;
  globalThis.projectHasWinningTender=projectHasWinningTender;
  globalThis.law98DirectLimitForProject=law98DirectLimitForProject;
  globalThis.projectTenderExemptByLaw98=projectTenderExemptByLaw98;
  globalThis.projectFinalizeBlockReason=projectFinalizeBlockReason;
  globalThis.buildProcurementHelperHtml=buildProcurementHelperHtml;
  globalThis.npUpdateProcHelper=npUpdateProcHelper;
  globalThis.pmUpdateProcHelper=pmUpdateProcHelper;
}
globalThis.initProcurementUtils=initProcurementUtils;
})();