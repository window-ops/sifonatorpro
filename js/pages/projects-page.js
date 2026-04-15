;(function(){
function renderProj(){
  const f=globalThis.S.projFilter;
  document.querySelectorAll('#view-proj .tab[data-proj-filter]').forEach(t=>{
    t.classList.toggle('active',t.getAttribute('data-proj-filter')===f);
  });
  let list=globalThis.S.projects;
  if(f==='in_progress')list=globalThis.S.projects.filter(p=>p.status==='in_progress');
  else if(f==='completed')list=globalThis.S.projects.filter(p=>p.status==='completed');
  else if(f==='late')list=globalThis.S.projects.filter(p=>p.lateF||p.lateS);
  const el=globalThis.$('proj-list');
  if(!el)return;
  if(!list.length){el.innerHTML=`<div style="text-align:center;padding:38px;color:var(--text2)"><div style="font-size:38px;margin-bottom:10px">📋</div><p>Niciun proiect de afișat.</p></div>`;return}
  el.innerHTML=list.map((p,idx)=>{
    const last=idx===list.length-1;
    const late=p.lateF||p.lateS;
    const bdgs=[
      late?`<span class="badge br">⏰ Întârziat</span>`:'',
      p.quality?`<span class="badge ${globalThis.projPublicQualityBadgeClass(p.quality)}">${globalThis.qLabel(p.quality)}</span>`:'',
      p.status==='in_progress'&&p.bet?`<span class="badge bgold">🎲 Pariu activ</span>`:'',
      `<span class="badge bk" title="Categorie proiect">📁 ${globalThis.escapeHtml(globalThis.projectCategoryLabel(p))}</span>`,
      `<span class="badge bb" title="Procedură principală">🧭 ${globalThis.escapeHtml(globalThis.procurementModeLabel(globalThis.projectProcurementMode(p)))}</span>`,
    ].filter(Boolean);
    const acts=[];
    if(p.status==='in_progress'){
      acts.push(`<button class="btn btn-s btn-sm" onclick="openCompDlg(${p.id})">✓ Finalizează</button>`);
      if(!p.bet)acts.push(`<button class="btn btn-g btn-sm" onclick="openBetDlg(${p.id})">🎲 Pariază</button>`);
    }
    if(p.status==='planned')acts.push(`<button class="btn btn-p btn-sm" onclick="startProj(${p.id})">▶ Începe</button>`);
    acts.push(`<button class="btn btn-f btn-sm" onclick="openProjDossier(${p.id})">🗂 Dosar</button>`);
    if(!globalThis.projectIsFinalized(p))acts.push(`<button class="btn btn-f btn-sm" onclick="openProjManageDlg(${p.id})">⚙️ Gestionează</button>`);
    const safeName=globalThis.escapeHtml(p.name||'');
    const safeStatus=globalThis.escapeHtml(globalThis.sLabel(p.status));
    const safeDue=globalThis.escapeHtml(String(p.due||''));
    return`<div class="lrow${last?' mb0':''}">
      <span class="ri">${p.status==='completed'?'✅':p.status==='planned'?'📐':late?'⚠️':'🔨'}</span>
      <div style="flex:1;min-width:0">
        <div class="rt">${safeName}</div>
        <div class="rs">${globalThis.escapeHtml(globalThis.fRON(p.budget))} · ${safeStatus} · Termen: ${safeDue}</div>
        <div class="rs">Real: ${globalThis.fRON(p.realValue||0)} · Declarat: ${globalThis.fRON(p.declaredValue||0)} · Progres lunar: ${(p.monthly?.progress||0).toFixed(0)}%</div>
        ${bdgs.length?`<div style="margin-top:4px;display:flex;gap:4px;flex-wrap:wrap">${bdgs.join('')}</div>`:''}
      </div>
      <div class="re">${acts.join('')}</div>
    </div>`;
  }).join('');
  globalThis.$('nbp') && (globalThis.$('nbp').textContent=globalThis.S.projects.filter(p=>p.status==='in_progress'||p.lateF).length);
}
function initProjectsPage(){
  globalThis.renderProj=renderProj;
}
globalThis.initProjectsPage=initProjectsPage;
})();