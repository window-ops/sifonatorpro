;(function(){
function renderTend(){
  const el=globalThis.$('tend-list');if(!el)return;
  const tendList=globalThis.S.tenders;
  el.innerHTML=tendList.map((t,idx)=>{
    const last=idx===tendList.length-1;
    const acts=[];
    const linked=t.projectId?globalThis.S.projects.find(p=>p.id===t.projectId):null;
    const linkedDone=!!(linked&&linked.status==='completed');
    if(t.status==='open')acts.push(`<button class="btn btn-p btn-sm" onclick="advanceTender(${t.id})">→ Clarificări</button>`);
    if(t.status==='clarificari')acts.push(`<button class="btn btn-p btn-sm" onclick="advanceTender(${t.id})">→ Depuneri</button>`);
    if(t.status==='depuneri')acts.push(`<button class="btn btn-p btn-sm" onclick="advanceTender(${t.id})">→ Comisie</button>`);
    if(t.status==='evaluation')acts.push(`<button class="btn btn-s btn-sm" onclick="advanceTender(${t.id})">Evaluează Oferte</button>`);
    if(t.status==='awarded'&&!linkedDone)acts.push(`<button class="btn btn-f btn-sm" onclick="advanceTender(${t.id})">→ Execuție</button>`);
    if(t.status==='contested')acts.push(`<button class="btn btn-f btn-sm" onclick="dismissContest(${t.id})">Respinge Contestație</button>`);
    const safeTenderName=globalThis.escapeHtml(t.name||'-');
    const proj=t.projectId?(linked?.name||'necunoscut'):'-';
    const safeProj=globalThis.escapeHtml(proj);
    const bidsInfo=t.bids?.length?` · Oferte: ${t.bids.length}`:'';
    const riskInfo=t.auditRisk?` · Risc audit: ${globalThis.escapeHtml(String(t.auditRisk))}%`:'';
    const winnerInfo=t.winner?` · Câștigător: ${globalThis.escapeHtml(t.winner)}`:'';
    const evalInfo=t.evalSummary?`<div class="tsm tmut">${globalThis.escapeHtml(t.evalSummary)}</div>`:'';
    const safeStatusLabel=globalThis.escapeHtml(globalThis.tsLabel(t.status));
    return`<div class="lrow${last?' mb0':''}">
      <span class="ri">${t.status==='awarded'?'✅':t.status==='contested'?'⚖️':t.status==='evaluation'?'🔍':t.status==='executie'?'🚧':'📋'}</span>
      <div style="flex:1;min-width:0"><div class="rt">${safeTenderName}</div>
        <div class="rs">${globalThis.escapeHtml(globalThis.fRON(t.budget))} · Proiect: ${safeProj}${winnerInfo}${bidsInfo}${riskInfo}</div>${evalInfo}</div>
      <div class="re"><span class="badge ${globalThis.tsBadge(t.status)}">${safeStatusLabel}</span>${acts.join('')}</div>
    </div>`;
  }).join('')||`<div style="text-align:center;padding:38px;color:var(--text2)"><div style="font-size:38px;margin-bottom:10px">📋</div><p>Nicio licitație înregistrată.</p></div>`;
}
function initTendersPage(){
  globalThis.renderTend=renderTend;
}
globalThis.initTendersPage=initTendersPage;
})();