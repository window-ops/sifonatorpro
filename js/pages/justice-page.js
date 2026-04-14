;(function(){
function renderJust(){
  globalThis.recalcJudiciaryPressure(true);
  globalThis.updJudiciaryRisk();
  const el=globalThis.$('j-status');if(!el)return;
  const stress=globalThis.S.judiciaryRisk>70?'critic':globalThis.S.judiciaryRisk>35?'ridicat':'scăzut';
  const anafMsg=globalThis.S.justice?.anafAuditMessage||'';
  const anafSince=globalThis.S.justice?.anafAuditSince||0;
  const anafShow=!!globalThis.S.justice?.anafAuditShowBanner&&anafMsg;
  const anafCard=anafShow?`<div class="card mb14" style="border:2px solid var(--orange);background:linear-gradient(145deg,rgba(230,97,0,.14),rgba(192,28,40,.08));box-shadow:0 4px 22px rgba(230,97,0,.12)">
    <div class="ch" style="border-bottom-color:rgba(230,97,0,.35)"><h3 style="color:var(--orange);display:flex;align-items:center;gap:8px;flex-wrap:wrap"><span>📋</span> Control fiscal &amp; ANAF</h3><p class="mb0">Alertă legată de tabloul de bord. Este vizibilă aici ca dosar deschis în „registrul public”.</p></div>
    <div class="cc">
      <p class="bold u-lh155" style="font-size:15px;color:var(--text1);margin-bottom:10px">${globalThis.escapeHtml(anafMsg)}</p>
      <p class="tsm tmut" style="line-height:1.5">Înregistrare eveniment: <strong>${anafSince?new Date(anafSince).toLocaleString('ro-RO'):'-'}</strong> · inclus în <strong>Indicele de presiune</strong> de mai jos până la rezolvare sau la ascunderea bannerului.</p>
      <div class="flex" style="flex-wrap:wrap;gap:8px;margin-top:14px;align-items:center">
        <button type="button" class="btn btn-f btn-sm" onclick="dismissAnafAuditBanner()">Am citit; ascunde bannerul</button>
        <span class="tsm tmut">Rămâi cu urmă în istoricul de mai jos; riscul poate rămâne ridicat până la „Manipulare” sau la calmarea situației.</span>
      </div>
    </div>
  </div>`:'';
  const anafFoot=!anafShow&&anafMsg?`<p class="tsm mt8 u-lh155" style="border-left:3px solid var(--orange);padding:8px 0 8px 12px;background:rgba(230,97,0,.06);border-radius:0 var(--r) var(--r) 0"><strong>Ultimă alertă fiscală / ANAF:</strong> ${globalThis.escapeHtml(anafMsg)} <span class="tmut">(${anafSince?new Date(anafSince).toLocaleString('ro-RO'):''})</span></p>`:'';
  const riskCard=`<div class="card mb14">
    <div class="ch"><h3>Indice Presiune Judiciară</h3><p>Calculat din fonduri, evenimente DNA, sesiune Baghetă și controale ANAF</div>
    <div class="cc">
      <div class="gline"><span class="gk">Fonduri „optimizate” totale</span><span class="gv">${globalThis.fRON(globalThis.S.siphoned)}</span></div>
      <div class="gline"><span class="gk">Nivel risc estimat</span><span class="gv">${globalThis.S.judiciaryRisk}% (${stress})</span></div>
      <div class="prog"><div class="pb ${globalThis.S.judiciaryRisk>70?'pb-o':'pb-b'}" style="width:${globalThis.S.judiciaryRisk}%"></div></div>
      <p class="tsm tmut mt8">${globalThis.S.siphoned>1200000?'Sumele mari atrag atenția automată a instituțiilor și a presei.':'Expunerea financiară este încă sub pragurile de panică.'}</p>
      ${anafFoot}
    </div>
  </div>`;
  const stage=globalThis.S.justice?.stage||'clean';
  const tlSorted=[...(globalThis.S.justice.timeline||[])].sort((a,b)=>(a.ts||0)-(b.ts||0));
  const tlWin=tlSorted.slice(-14);
  const tlRows=tlWin.map(x=>{
    const stLab=globalThis.justiceStageRo(x.stage);
    const timeLab=x.t||(typeof x.ts==='number'?new Date(x.ts).toLocaleString('ro-RO'):'-');
    const extra=x.detail?`<div class="tsm tmut" style="margin-top:4px;line-height:1.45">${globalThis.escapeHtml(x.detail)}</div>`:'';
    return`<div class="rh-row" style="flex-direction:column;align-items:stretch;gap:2px"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;width:100%"><span>${timeLab}</span><span class="rd">${stLab} · ${x.pressure}%</span></div>${extra}</div>`;
  }).join('')||'<p class="tmut tsm">Fără intrări.</p>';
  const timelineCard=`<div class="card mb14"><div class="ch"><h3>Timeline dosar &amp; evenimente</h3><p>Ordine cronologică (cele mai vechi sus). O intrare la fiecare schimbare de etapă sau presiune; detaliile explicative sunt dedesubt. Se afișează ultimele 14 evenimente.</p></div><div class="cc">${tlRows}</div></div>`;
  if(stage==='clean'||stage==='monitorizare'){
    el.innerHTML=`${anafCard}<div class="jcard clean">
      <div class="ji">${stage==='clean'?'😇':'🕵️'}</div><div class="jt">${stage==='clean'?'Nu ești urmărit penal':'Ești monitorizat'}</div>
      <div class="jd">${stage==='clean'?'Momentan nu există dosare penale active. Menține un profil discret!':'Instituțiile colectează date și corelează contractele.'}</div>
    </div>${riskCard}${timelineCard}`;
  }else if(stage==='ancheta'){
    const mc=globalThis.manipCost('ancheta');
    el.innerHTML=`${anafCard}<div class="jcard danger">
      <div class="ji">🔍</div><div class="jt" style="color:var(--red)">Ești în anchetă DNA!</div>
      <div class="jd">Anchetă activă pe achiziții și fluxuri contabile.</div>
      <div style="margin-top:14px">${globalThis.S.rep>=mc
        ?`<button class="btn btn-d" onclick="manipJust('ancheta')">⚖️ Manipulează Sistemul Judiciar (cost: ${mc} puncte)</button>`
        :`<div class="tsm" style="color:var(--red)">Insuficiente puncte (${globalThis.S.rep}/${mc} necesare).</div>`
      }</div></div>${riskCard}${timelineCard}`;
  }else{
    const mc2=globalThis.manipCost('puscarie');
    el.innerHTML=`${anafCard}<div class="jcard danger">
      <div class="ji">⛓️</div><div class="jt" style="color:var(--red)">Fază juridică severă: ${globalThis.justiceStageRo(stage)}</div>
      <div class="jd">Cauza a escaladat în instanță. Presiune procedurală maximă.</div>
      <div style="margin-top:14px">${globalThis.S.rep>=mc2
        ?`<button class="btn btn-d" onclick="manipJust('puscarie')">⚖️ Manipulează Sistemul Judiciar (cost: ${mc2} puncte)</button>`
        :`<div class="tsm" style="color:var(--red)">Insuficiente puncte (${globalThis.S.rep}/${mc2} necesare).</div>`
      }</div></div>${riskCard}${timelineCard}`;
  }
  globalThis.updRep();
}
function initJusticePage(){
  globalThis.renderJust=renderJust;
}
globalThis.initJusticePage=initJusticePage;
})();