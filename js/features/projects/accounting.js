;(function(){
function normalizeProjectAccounting(){
  const categories=globalThis.PROJECT_CATEGORIES||null;
  globalThis.S.sessions=globalThis.S.sessions.filter(s=>globalThis.S.projects.some(p=>p.id===s.projectId));
  globalThis.S.projects.forEach(p=>{
    if(p.quality==='salvat')p.quality='mantuit';
    if(!p.projCategory||(categories&&!categories[p.projCategory])){
      p.projCategory=typeof globalThis.projectCategoryKey==='function'
        ? globalThis.projectCategoryKey(p)
        : 'diverse';
    }
    if(!p.procurementMode)p.procurementMode=((p.declaredValue||p.budget||0)<=globalThis.law98DirectLimitForProject(p))?'direct':'licitatie';
    if(!['direct','licitatie'].includes(p.procurementMode))p.procurementMode='licitatie';
    globalThis.ensureProjectDossier(p);
    if(!p.wandUsed&&globalThis.S.sessions.some(s=>s.projectId===p.id))p.wandUsed=true;
    if(p.status==='completed'){
      if(p.bet)p.bet=null;
      return;
    }
    if(!p.realValue)p.realValue=Math.round((p.budget||1)*0.68);
    if(!p.declaredValue||p.declaredValue<=p.realValue)p.declaredValue=Math.round((p.budget||1)*1.2);
    p.budget=p.declaredValue;
  });
}
function getProjectAccountingValues(p){
  const real=Math.max(1,parseInt(p.realValue||0,10));
  const declared=Math.max(real,parseInt(p.declaredValue||0,10));
  const recFactor=Math.max(20,Math.min(85,Math.round(((declared-real)/Math.max(1,declared))*100)));
  return {real,declared,recFactor};
}
function initProjectsAccounting(){
  globalThis.normalizeProjectAccounting=normalizeProjectAccounting;
  globalThis.getProjectAccountingValues=getProjectAccountingValues;
}
globalThis.initProjectsAccounting=initProjectsAccounting;
})();