;(function(){
function renderDash(){
  globalThis.checkSubLifecycle();
  globalThis.$('dash-meta')&&(globalThis.$('dash-meta').innerHTML=`<p class="tsm tmut">Dificultate: <strong>${globalThis.diffLabelRo(globalThis.S.settings.difficulty||'normal')}</strong> · Reputație <strong>${globalThis.S.rep}/${globalThis.repMax()}</strong> · Reducere abonament: <strong>${globalThis.disc().toFixed(1)}%</strong></p>`);
  const act=globalThis.S.projects.filter(p=>p.status==='in_progress').length;
  const late=globalThis.S.projects.filter(p=>p.lateF||p.lateS).length;
  const openT=globalThis.S.tenders.filter(t=>t.status==='open').length;
  globalThis.$('sg').innerHTML=`
    <div class="sc"><div class="si">💰</div><div class="sv">${globalThis.fRON(globalThis.S.siphoned)}</div><div class="sl">Total „Optimizat"</div><div class="sd ${globalThis.S.siphoned>0?'pos':''}">${globalThis.S.siphoned>0?'▲ În creștere':'Pornește Bagheta Magică'}</div></div>
    <div class="sc"><div class="si">🏦</div><div class="sv">${globalThis.fRON(globalThis.S.ledger.publicBudget)}</div><div class="sl">Buget Public Disponibil</div><div class="sd">${globalThis.PERSONAS?.[globalThis.S.settings.persona]?.label||'Instituție'}</div></div>
    <div class="sc"><div class="si">🏗️</div><div class="sv">${act}</div><div class="sl">Proiecte în execuție</div><div class="sd">${globalThis.S.projects.length} total</div></div>
    <div class="sc"><div class="si">📋</div><div class="sv">${globalThis.S.tenders.length}</div><div class="sl">Licitații</div><div class="sd">${openT} deschise</div></div>
    <div class="sc"><div class="si">⚠️</div><div class="sv" style="color:var(--orange)">${late}</div><div class="sl">Proiecte cu Probleme</div><div class="sd ${late>0?'neg':''}">${late>0?'Necesită atenție':'Totul în regulă!'}</div></div>`;
  globalThis.$('act-log').innerHTML=globalThis.S.actLog.slice(0,5).map(a=>
    `<div class="act-i"><span class="act-t">${globalThis.escapeHtml(a.t)}</span><span>${globalThis.escapeHtml(a.txt)}</span></div>`
  ).join('')||'<p class="tmut tsm">Nicio activitate.</p>';
  const sc=globalThis.$('sub-status-dash');
  if(sc){
    if(globalThis.hasPaidSubscription()){
      const pl=globalThis.PLANS.find(p=>p.id===globalThis.S.sub.tier);
      const usedH=(globalThis.S.sub.secUsed/3600).toFixed(1);
      const totalH=globalThis.S.sub.secTotal<0?'∞':(globalThis.S.sub.secTotal/3600).toFixed(0);
      sc.innerHTML=`<div class="badge bg mb8">✓ ACTIV</div><div class="bold">${pl.name}</div>
        <div class="tsm tmut mt8">Timp utilizat: ${usedH}h / ${totalH}h luna aceasta</div>
        <div class="tsm tmut">Expiră: ${new Date(globalThis.S.sub.exp).toLocaleDateString('ro-RO')}</div>`;
    }else{
      sc.innerHTML=`<p class="tmut tsm">Fără abonament plătit. Limitele <strong>Starter Gratuit</strong> (2/2 proiecte) se aplică implicit.</p><button class="btn btn-p mt8" style="width:100%" onclick="navigate('sub')">Upgrade la plan plătit</button>`;
    }
  }
}

function initDashboardPage(){
  globalThis.renderDash=renderDash;
}
globalThis.initDashboardPage=initDashboardPage;
})();