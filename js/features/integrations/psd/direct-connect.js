;(function(){
const PSD_DC_ROUTE_LABELS={
  achizitie_directa:'Achiziție directă',
  procedura_simplificata:'Procedură simplificată',
  contract_direct:'Contract direct',
  oug_fasttrack:'prioritate OUG'
};
const PSD_DC_PLAN_RULES={
  plan_ales_local:{id:'plan_ales_local',label:'Ales local',cap:5000,allowedRoutes:['achizitie_directa']},
  plan_ales_executiv:{id:'plan_ales_executiv',label:'Ales executiv',cap:50000,allowedRoutes:['achizitie_directa','procedura_simplificata','contract_direct']},
  plan_demnitar:{id:'plan_demnitar',label:'Demnitar',cap:Infinity,allowedRoutes:['achizitie_directa','procedura_simplificata','contract_direct','oug_fasttrack']}
};
const PSD_DC_DIRECT_ACQ_LIMIT_RON=135060;

function isPsdDcLinked(){
  globalThis.ensureIntegrations();
  return globalThis.S.integrations.psdDC.linked===true;
}
function isPsdDcApiKeyFormat(key){
  return /^sdc_live_[a-z0-9]{22}$/.test(String(key||'').trim());
}
function generatePsdDcApiKey(){
  const a=Array.from({length:22},()=>'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random()*36)]).join('');
  return`sdc_live_${a}`;
}
function psdDcDayKey(){
  const d=globalThis.nowDate();
  const m=String(d.getMonth()+1).padStart(2,'0');
  const day=String(d.getDate()).padStart(2,'0');
  return `${d.getFullYear()}-${m}-${day}`;
}
function normalizePsdDcDailySpent(){
  globalThis.ensureIntegrations();
  const dc=globalThis.S.integrations.psdDC;
  const k=psdDcDayKey();
  if(dc.dailySpentDate!==k){
    dc.dailySpentDate=k;
    dc.dailySpentRon=0;
  }
}
function getPsdDcPlanProfile(){
  const fn=String(globalThis.S.user?.fn||'').toLowerCase();
  if(fn.includes('ministru')||fn.includes('secretar de stat')||fn.includes('parlamentar'))return PSD_DC_PLAN_RULES.plan_demnitar;
  if(fn.includes('primar')||fn.includes('președinte consiliu județean')||fn.includes('presedinte consiliu judetean'))return PSD_DC_PLAN_RULES.plan_ales_executiv;
  return PSD_DC_PLAN_RULES.plan_ales_local;
}
function getPsdDcRestrictionSnapshot(){
  normalizePsdDcDailySpent();
  const dc=globalThis.S.integrations.psdDC;
  const plan=getPsdDcPlanProfile();
  const used=Math.max(0,Math.round(Number(dc.dailySpentRon)||0));
  const remaining=Number.isFinite(plan.cap)?Math.max(0,plan.cap-used):Infinity;
  return{plan,used,remaining,directLimit:PSD_DC_DIRECT_ACQ_LIMIT_RON};
}
function getPsdDcRouteSelection(selectId){
  const sel=globalThis.$(selectId);
  const routeId=sel?.value||'achizitie_directa';
  const opt=sel?.options?.[sel.selectedIndex];
  const label=opt?opt.textContent.split(':')[0].trim():'Partid (PSD)';
  return{routeId,label};
}
function validatePsdDcTransaction(totalRon,routeId){
  if(!globalThis.isPsdDcLinked())return'PSD Direct Connect nu este integrat. Deschide Manager Integrări.';
  const snap=getPsdDcRestrictionSnapshot();
  if(!snap.plan.allowedRoutes.includes(routeId))return`Ruta ${PSD_DC_ROUTE_LABELS[routeId]||routeId} nu este disponibilă pe ${snap.plan.label}.`;
  if(Number.isFinite(snap.plan.cap)&&totalRon>snap.remaining)return`Plafonul zilnic PSD (${globalThis.fRON(snap.plan.cap)}) a fost atins sau depășit. Disponibil azi: ${globalThis.fRON(snap.remaining)}.`;
  if(routeId==='achizitie_directa'&&totalRon>snap.directLimit)return`Achiziția directă are prag legal de ${globalThis.fRON(snap.directLimit)}. Alege altă rută sau reduce suma.`;
  return'';
}
function commitPsdDcSpend(totalRon){
  normalizePsdDcDailySpent();
  globalThis.S.integrations.psdDC.dailySpentRon+=Math.max(0,Math.round(Number(totalRon)||0));
}
function psdDcRestrictionsHtml(){
  const snap=getPsdDcRestrictionSnapshot();
  const routes=snap.plan.allowedRoutes.map(r=>PSD_DC_ROUTE_LABELS[r]||r).join(', ');
  return`<div class="psd-dc-legal" style="max-height:none;margin-top:10px">
    <strong>Restricții active (${globalThis.escapeHtml(snap.plan.label)}):</strong><br/>
    Plafon zilnic: <strong>${Number.isFinite(snap.plan.cap)?globalThis.fRON(snap.plan.cap):'nelimitat'}</strong> ·
    folosit azi: <strong>${globalThis.fRON(snap.used)}</strong> ·
    disponibil: <strong>${Number.isFinite(snap.remaining)?globalThis.fRON(snap.remaining):'nelimitat'}</strong><br/>
    Rute permise: <strong>${globalThis.escapeHtml(routes)}</strong><br/>
    Prag legal achiziție directă: <strong>${globalThis.fRON(snap.directLimit)}</strong>.
  </div>`;
}
function syncPsdDcRouteSelect(selectId){
  const sel=globalThis.$(selectId);
  if(!sel)return;
  const allowed=new Set(getPsdDcPlanProfile().allowedRoutes);
  let hasSelectedAllowed=false;
  Array.from(sel.options).forEach(opt=>{
    const ok=allowed.has(opt.value);
    opt.disabled=!ok;
    if(ok&&opt.selected)hasSelectedAllowed=true;
  });
  if(!hasSelectedAllowed){
    const firstAllowed=Array.from(sel.options).find(opt=>allowed.has(opt.value));
    if(firstAllowed)sel.value=firstAllowed.value;
  }
}
function initPsdDcIntegration(){
  globalThis.isPsdDcLinked=isPsdDcLinked;
  globalThis.isPsdDcApiKeyFormat=isPsdDcApiKeyFormat;
  globalThis.generatePsdDcApiKey=generatePsdDcApiKey;
  globalThis.__getPsdDcRouteSelection=getPsdDcRouteSelection;
  globalThis.__validatePsdDcTransaction=validatePsdDcTransaction;
  globalThis.__commitPsdDcSpend=commitPsdDcSpend;
  globalThis.__psdDcRestrictionsHtml=psdDcRestrictionsHtml;
  globalThis.__syncPsdDcRouteSelect=syncPsdDcRouteSelect;
  globalThis.getPsdDcRouteSelection=getPsdDcRouteSelection;
  globalThis.validatePsdDcTransaction=validatePsdDcTransaction;
  globalThis.commitPsdDcSpend=commitPsdDcSpend;
  globalThis.psdDcRestrictionsHtml=psdDcRestrictionsHtml;
  globalThis.syncPsdDcRouteSelect=syncPsdDcRouteSelect;
}
globalThis.initPsdDcIntegration=initPsdDcIntegration;
})();