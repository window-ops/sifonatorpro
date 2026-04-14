;(function(){
const WAND_TENDER_ELIGIBLE_STATUSES=['clarificari','depuneri','evaluation','awarded','executie','contested'];
function tendersEligibleForWandCount(projectId){
  return globalThis.S.tenders.filter(t=>t.projectId===projectId&&WAND_TENDER_ELIGIBLE_STATUSES.includes(t.status)).length;
}
function buildWandDossierOpenLines(name,rr,dd,f){
  const nm=String(name||'Proiect');
  const short=nm.length>58?nm.slice(0,58)+'…':nm;
  return[
    `DESCHIDERE DOSAR · „${short}": poz. 4.02 / lucrări în curs; legătură cu fluxul SEAP, contabilitate primară.`,
    `Pas 01: Reconciliere: declarat ${globalThis.fRON(dd)} vs. „realitate tehnică” ${globalThis.fRON(rr)}; diferența intră pe algoritmul de absorbție progresivă.`,
    `Pas 02: Coeficient ${(f*100).toFixed(0)}% aplicat pe diferență; aprobare tacită în modul satiric „merge și așa".`,
    `Pas 03: Mapare sursă: buget local + contracte tip studii / utilități / urgență.`,
    `Pas 04: Caiet de sarcini: parametri retroactiv compatibili cu oferta câștigătoare.`,
    `Pas 05: Lanț subcontractare 2→3: marje agregate ascunse în contracte subevaluate și „prestări conexe".`,
    `Pas 06: Jurnal în loturi la ~5s: vizibilitate redusă pentru investigatori și audit.`,
  ];
}
function wFactor(v){globalThis.$('wf-d')&&(globalThis.$('wf-d').textContent=v);globalThis.wPreview();globalThis.refreshWandFactorHint();}
function wandMaxSurplusTheoretical(real,decl,factor){
  const r=+real||0,dd=+decl||0,f=typeof factor==='number'?factor:parseFloat(globalThis.$('w-fac')?.value||50)/100;
  if(r<=0||dd<=0||dd<r)return 0;
  return Math.max(0,(dd-r)*f);
}
function wandExposurePercentFromFactor(f){
  const fac=typeof f==='number'?f:parseFloat(globalThis.$('w-fac')?.value||50)/100;
  const stage=globalThis.S.justice?.stage||'clean';
  let pct=Math.round(Math.min(95,Math.max(6,16+fac*78)));
  if(stage==='ancheta')pct=Math.min(100,pct+14);
  else if(stage&&stage!=='clean'&&stage!=='monitorizare')pct=Math.min(100,pct+10);
  const diff=globalThis.S.settings.difficulty||'normal';
  if(diff==='hard')pct=Math.min(100,pct+6);
  if(diff==='easy')pct=Math.max(5,pct-5);
  return Math.min(100,Math.max(5,pct));
}
function refreshWandFactorHint(){
  const el=globalThis.$('w-fac-hint');if(!el)return;
  const f=parseFloat(globalThis.$('w-fac')?.value||50)/100;
  const exp=wandExposurePercentFromFactor(f);
  el.innerHTML=`Factorul <strong>${(f*100).toFixed(0)}%</strong> înmulțește doar diferența (declarat - real): plafonul de surplus extras în sesiune este <strong>(declarat - real) × factor</strong>. În sesiune, surplusul crește treptat până la acest plafon (viteza depinde de timp și de dificultate). „Vizibilitate” (control): <strong>${exp}%</strong>. Ea crește cu factorul și cu severitatea etapei juridice. La <strong>≥70%</strong> factor, după start se poate declanșa o alertă (ANAF/DNA).`;
}
function updateSessSurplusUI(){
  if(!globalThis.S.activeSession)return;
  const as=globalThis.S.activeSession;
  const max=Math.max(0,Math.round((as.declCost-as.realCost)*as.factor));
  const cur=Math.round(as.dynamicSurplus||0);
  const pct=max>0?Math.min(100,Math.round((cur/max)*100)):0;
  const exp=wandExposurePercentFromFactor(as.factor);
  const fill=globalThis.$('sess-surplus-bar');
  if(fill){
    fill.style.width=pct+'%';
    fill.classList.remove('low','mid','high');
    fill.classList.add(pct>=90?'high':pct>=50?'mid':'low');
  }
  const ptxt=globalThis.$('sess-surplus-pct');
  if(ptxt)ptxt.textContent=max>0?`${pct}% din plafon (${globalThis.fRON(cur)} / ${globalThis.fRON(max)})`:`Plafon 0 RON (verifică valori proiect)`;
  const ex=globalThis.$('sess-exposure-wrap');
  if(ex)ex.innerHTML=`Vizibilitate (control fiscal): <strong>${exp}%</strong> · Factor sesiune <strong>${(as.factor*100).toFixed(0)}%</strong>${as.factor>=0.7?' · <span style="color:var(--orange)">Factor ridicat: risc de alertă ANAF/DNA post-start</span>':''}`;
}
function wPreview(){
  const r=parseFloat(globalThis.$('w-real')?.value)||0;
  const d=parseFloat(globalThis.$('w-decl')?.value)||0;
  const f=parseFloat(globalThis.$('w-fac')?.value||50)/100;
  if(r>0&&d>0&&d>=r){
    const diff=d-r,surplus=diff*f;
    globalThis.$('w-surp')&&(globalThis.$('w-surp').textContent=globalThis.fRON(surplus));
    globalThis.$('w-brkd')&&(globalThis.$('w-brkd').innerHTML=[
      ['Valoare reală proiect',globalThis.fRON(r)],['Valoare declarată/bugetată',globalThis.fRON(d)],
      ['Diferență brută (declarat - real)',globalThis.fRON(diff)],['Factor ales',(f*100).toFixed(0)+'%'],
      ['Plafon surplus (formulă)',globalThis.fRON(surplus)],
      ['Acumulat în sesiunea curentă',globalThis.S.activeSession?globalThis.fRON(Math.round(globalThis.S.activeSession.dynamicSurplus||0)):'-'],
      ['Rest până la plafon',globalThis.S.activeSession?globalThis.fRON(Math.max(0,Math.round(surplus-(globalThis.S.activeSession.dynamicSurplus||0)))):'- (începe sesiunea)'],
    ].map(([k,v])=>`<div><span>${k}</span><span style="color:var(--yellow)">${v}</span></div>`).join(''));
    globalThis.$('w-res')?.classList.add('show');
  }else globalThis.$('w-res')?.classList.remove('show');
  refreshWandFactorHint();
}
function updWandChip(){
  const chip=globalThis.$('wand-chip');if(!chip)return;
  if(globalThis.S.activeSession)chip.classList.remove('hid');
  else chip.classList.add('hid');
}
function updWandQuota(){
  const avail=globalThis.wandAvailSec();
  globalThis.$('wand-quota-chip')&&(globalThis.$('wand-quota-chip').textContent=`⏱ ${globalThis.fSec(avail)} disponibile`);
  globalThis.$('wq-disp')&&(globalThis.$('wq-disp').textContent=globalThis.fSec(avail));
  globalThis.$('wand-buy-hours-btn')?.classList.toggle('hid',globalThis.hasPaidSubscription());
  if(globalThis.S.activeSession&&typeof globalThis.updateSessQuotaHints==='function')globalThis.updateSessQuotaHints();
  globalThis.updDebug();
}
function initWand(){
  globalThis.tendersEligibleForWandCount=tendersEligibleForWandCount;
  globalThis.buildWandDossierOpenLines=buildWandDossierOpenLines;
  globalThis.wFactor=wFactor;
  globalThis.wandMaxSurplusTheoretical=wandMaxSurplusTheoretical;
  globalThis.wandExposurePercentFromFactor=wandExposurePercentFromFactor;
  globalThis.refreshWandFactorHint=refreshWandFactorHint;
  globalThis.updateSessSurplusUI=updateSessSurplusUI;
  globalThis.wPreview=wPreview;
  globalThis.updWandChip=updWandChip;
  globalThis.updWandQuota=updWandQuota;
}
globalThis.initWand=initWand;
})();