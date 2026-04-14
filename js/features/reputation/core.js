;(function(){
function repMax(){return{easy:280,normal:250,hard:220}[globalThis.S.settings.difficulty]||250;}
function manipCost(kind){
  const base=kind==='ancheta'?150:200;
  return Math.max(80,Math.round(base*globalThis.diffTune().justiceRepCost));
}
function updRep(){
  const rmax=repMax(),pct=(globalThis.S.rep/rmax)*100,lv=globalThis.repLevel(globalThis.S.rep);
  globalThis.$('hb-rep-cap')&&(globalThis.$('hb-rep-cap').textContent='/'+rmax);
  globalThis.$('hb-rep')&&(globalThis.$('hb-rep').textContent=globalThis.S.rep);
  globalThis.$('rep-d1')&&(globalThis.$('rep-d1').textContent=globalThis.S.rep);
  globalThis.$('rep-d2')&&(globalThis.$('rep-d2').textContent=globalThis.S.rep);
  globalThis.$('rep-b1')&&(globalThis.$('rep-b1').style.width=pct+'%');
  globalThis.$('rep-b2')&&(globalThis.$('rep-b2').style.width=pct+'%');
  globalThis.$('rep-lv1')&&(globalThis.$('rep-lv1').textContent=lv);
  globalThis.$('rep-lv2')&&(globalThis.$('rep-lv2').textContent=lv);
  globalThis.$('disc-rep')&&(globalThis.$('disc-rep').textContent=globalThis.S.rep);
  globalThis.$('disc-pct')&&(globalThis.$('disc-pct').textContent=globalThis.disc().toFixed(1)+'%');
  globalThis.$('just-rep-hint')&&(globalThis.$('just-rep-hint').innerHTML=`Anchetă: <strong>${manipCost('ancheta')}</strong> · Fază severă: <strong>${manipCost('puscarie')}</strong> puncte (modificate de dificultate).`);
  const rh=globalThis.$('rep-hist');
  if(rh)rh.innerHTML=globalThis.S.repH.length
    ?globalThis.S.repH.map(e=>`<div class="rh-row"><span>${e.t}</span><span class="rd ${e.d>0?'pos':'neg'}">${e.d>0?'+':''}${e.d}</span></div>`).join('')
    :'<p class="tmut tsm">Niciun eveniment înregistrat.</p>';
  globalThis.updDebug();
}
function chgRep(delta,reason,raw,opts){
  let d=Number(delta);
  const o=opts||{};
  let multPublic=1,multDiff=1;
  if(o.publicProject&&d>0){multPublic=globalThis.effectivePublicRepMultiplier();d*=multPublic;}
  if(!raw){
    if(d>0){multDiff=globalThis.diffTune().repGain;d*=multDiff;}
    else if(d<0){multDiff=globalThis.diffTune().repLoss;d*=multDiff;}
  }
  d=Math.round(d);
  const mx=repMax();
  globalThis.S.rep=Math.max(0,Math.min(mx,globalThis.S.rep+d));
  let histReason=reason,toastPts=`${d>0?'+'+d:d}`;
  if(o.publicProject&&Number(delta)>0&&d>0){
    const parts=[`Multiplicator reputație, proiecte publice: ×${multPublic.toFixed(2)}`];
    if(!raw&&Math.abs(multDiff-1)>1e-6)parts.push(`dificultate ×${multDiff.toFixed(2)}`);
    const detail=parts.join(' · ');
    histReason=`${reason} (${detail})`;
    toastPts+=` (${detail})`;
  }
  globalThis.S.repH.unshift({t:histReason,d});
  if(globalThis.S.repH.length>20)globalThis.S.repH.pop();
  updRep();
  globalThis.toast(`${toastPts} puncte reputație: ${reason}`,d>0?'ok':'err');
}
function initReputationCoreFeature(){
  globalThis.repMax=repMax;
  globalThis.manipCost=manipCost;
  globalThis.updRep=updRep;
  globalThis.chgRep=chgRep;
}
globalThis.initReputationCoreFeature=initReputationCoreFeature;
})();