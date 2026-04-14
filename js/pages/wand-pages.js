;(function(){
function renderSessions(){
  const el=globalThis.$('sessions-list');if(!el)return;
  if(!globalThis.S.sessions.length){el.innerHTML=`<div style="text-align:center;padding:28px;color:var(--text2)"><div style="font-size:32px;margin-bottom:8px">✨</div><p class="tsm">Nicio sesiune înregistrată. Pornește prima sesiune!</p></div>`;return}
  el.innerHTML=globalThis.S.sessions.map(s=>{
    const d=new Date(s.startReal);
    const ts=`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    return`<div class="sess-item" role="button" tabindex="0" onclick="openSessionHistoryDetail(${s.id})" title="Deschide dosarul sesiunii">
      <span class="sess-time">${ts}</span>
      <span>${globalThis.escapeHtml(s.projectName||'Fără proiect')} · Factor ${(s.factor*100).toFixed(0)}% · ${globalThis.fRON(s.realCost)} → ${globalThis.fRON(s.declCost)}</span>
      <span class="sess-dur">${globalThis.fTimer(s.elapsed)}</span>
      <span class="sess-surplus">${globalThis.fRON(s.surplus)}</span>
    </div>`;
  }).join('');
}
function renderWandQueue(){
  const el=globalThis.$('wand-queue-list');if(!el)return;
  globalThis.cleanupWandQueueState();
  globalThis.updWandFormControls();
  if(!globalThis.S.activeSession)globalThis.tryStartNextQueuedWand();
  const qRows=globalThis.S.wandQueue.filter(q=>q.status==='pending'||q.status==='running');
  const act=globalThis.activeWandProjects();
  const avail=act.filter(p=>!qRows.some(q=>q.projectId===p.id));
  const parts=[];
  const queueBlockCls='wand-queue-block'+(avail.length?'':' mb0');
  parts.push(`<div class="${queueBlockCls}"><p class="tsm bold mb8">Sarcini în coadă</p>`);
  if(qRows.length){
    parts.push(qRows.map(q=>{
      const p=globalThis.S.projects.find(x=>x.id===q.projectId);
      const name=globalThis.escapeHtml(p?.name||q.projectName||'Proiect');
      const st=q.status==='pending'?'În așteptare':'În execuție';
      const fac=(q.factor*100).toFixed(0);
      const dosarBtn=`<button type="button" class="btn btn-f btn-sm" onclick="openWandJobDetail(${q.id})">📑 Dosar &amp; contabilitate</button>`;
      const cfgBtn=q.status==='pending'&&!globalThis.S.activeSession?`<button type="button" class="btn btn-f btn-sm" onclick="openWandQueueScheduleEdit(${q.id})" title="Factor de optimizare și valorile contabile (ca în formularul principal)">⚙️ Parametri</button>`:'';
      const remBtn=q.status==='pending'?`<button type="button" class="btn btn-d btn-sm" onclick="removeWandQueueEntry(${q.id})" title="Elimină din coadă">✕ Elimină</button>`:'';
      const reorder=q.status==='pending'?`<button type="button" class="btn btn-f btn-sm" onclick="moveWandQueueEntry(${q.id},-1)" title="Mai sus în coadă (doar față de alte sarcini în așteptare)">↑</button><button type="button" class="btn btn-f btn-sm" onclick="moveWandQueueEntry(${q.id},1)" title="Mai jos în coadă (doar față de alte sarcini în așteptare)">↓</button>`:'';
      return`<div class="wand-queue-item">
        <div class="wq-top"><div><strong>${name}</strong> · factor ${fac}% · <span class="badge bb">${st}</span></div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center">${dosarBtn}${cfgBtn}${reorder}${remBtn}</div></div></div>`;
    }).join(''));
  }else{
    parts.push('<p class="tsm tmut mb0">Nicio sarcină în coadă. Adaugă din secțiunea de mai jos sau cu „Programează în coadă” din formular.</p>');
  }
  parts.push('</div>');
  if(avail.length){
    parts.push('<div class="wand-queue-block wand-queue-block-avail mb0"><p class="tsm bold mb8">Proiecte disponibile pentru coadă</p>');
    parts.push(avail.map(p=>{
      const vErr=globalThis.validateWandStart(p.id);
      const canSchedule=!vErr.err&&!(globalThis.S.activeSession&&globalThis.S.activeSession.projectId===p.id)&&globalThis.wandNonDoneQueueCount()<5;
      const schBtn=canSchedule?`<button type="button" class="btn btn-s btn-sm" onclick="wandQuickSchedule(${p.id})">📋 Programează</button>`:'';
      const hint=vErr.err?`<span class="tsm tmut">${globalThis.escapeHtml(vErr.err)}</span>`:'';
      return`<div class="wand-queue-item" style="opacity:.95">
        <div class="wq-top"><div><strong>${globalThis.escapeHtml(p.name)}</strong> · ${globalThis.sLabel(p.status)}</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center">${schBtn}</div></div>
        ${hint?`<div class="mt6">${hint}</div>`:''}
      </div>`;
    }).join(''));
    parts.push('</div>');
  }else if(!qRows.length&&!act.length){
    el.innerHTML='<p class="tsm tmut">Nu ai proiecte în desfășurare sau planificate eligibile pentru Bagheta. Creează un proiect nou.</p>';
    return;
  }
  const nPending=globalThis.S.wandQueue.filter(q=>q.status==='pending').length;
  if(qRows.length>=2||(nPending>=1&&!globalThis.S.activeSession)){
    parts.push(`<div class="mt14"><button type="button" class="btn btn-p btn-sm" onclick="tryStartNextQueuedWand()" ${globalThis.S.activeSession?'disabled':''}>▶ Pornește următoarea din coadă (dacă nu pornește automat)</button></div>`);
  }
  el.innerHTML=parts.join('');
}
function renderWandJobView(){
  const id=globalThis.S.wandJobDetailId;
  const title=globalThis.$('wandjob-title'),sub=globalThis.$('wandjob-sub'),st=globalThis.$('wandjob-status'),log=globalThis.$('wandjob-log'),tb=globalThis.$('wandjob-toolbar');
  if(!title)return;
  if(!id){
    title.textContent='Dosar optimizare';
    if(sub)sub.textContent='Deschide din coada Bagheta → „Dosar & contabilitate”.';
    if(st)st.innerHTML='';
    if(tb)tb.innerHTML='';
    if(log)log.innerHTML='<span class="tmut">…</span>';
    return;
  }
  const q=globalThis.S.wandQueue.find(x=>x.id===id);
  if(!q){
    title.textContent='Dosar indisponibil';
    if(sub)sub.textContent='Intrarea nu mai există în coadă.';
    if(st)st.innerHTML='';
    if(tb)tb.innerHTML='';
    if(log)log.innerHTML='';
    return;
  }
  const active=globalThis.S.activeSession&&globalThis.S.activeSession.queueJobId===id;
  const raw=globalThis.wandGetJobDetailRawLines(id);
  const lines=globalThis.wandJournalFilterLines(raw);
  title.textContent=`Dosar: ${q.projectName}`;
  sub.textContent=active?'Sesiune activă. Contabilitate live (liniile cresc la ~5s când nu e pauză)':(q?`Stare: ${q.status}`:'…');
  if(st)st.innerHTML=active
    ?`<p class="mb8"><button type="button" class="btn btn-f btn-sm" onclick="toggleWandPause()">${globalThis.S.activeSession.paused?'▶ Continuă':'⏸ Pauză'}</button> <button type="button" class="btn btn-d btn-sm" onclick="stopSession()">■ Oprește sesiunea</button></p>`
    :'<p class="tsm tmut">Această intrare din coadă nu mai este activă sau nu are jurnal.</p>';
  if(tb){
    const hasAny=raw.length>0;
    tb.innerHTML=hasAny?`<div class="flex" style="flex-wrap:wrap;gap:8px;align-items:center">
      <label class="tsm" style="display:flex;gap:6px;align-items:center;cursor:pointer;user-select:none"><input type="checkbox" ${globalThis.S._wandLogMoneyFilter?'checked':''} onchange="toggleWandLogMoneyFilter(this.checked)"/> Doar linii cu mișcări în RON (ascunde deschiderea dosarului)</label>
      <button type="button" class="btn btn-f btn-sm" onclick="wandExportJobJournal()" title="Tot jurnalul brut (inclusiv deschidere)">Export .txt</button>
      <button type="button" class="btn btn-f btn-sm" onclick="wandCopyJobRaw()" title="Tot jurnalul brut">Copiază tot</button>
      <button type="button" class="btn btn-f btn-sm" onclick="wandCopyJobJournalFiltered()" title="Respectă filtrul RON">Copiază filtrat</button>
    </div>`:'<span class="tsm tmut">Nu există încă linii de exportat.</span>';
  }
  if(log)log.innerHTML=lines&&lines.length?lines.map(l=>globalThis.escapeHtml(l)).join('<br/>'):'<span class="tmut">Nicio linie (activează/dezactivează filtrul sau așteaptă înregistrări).</span>';
  if(active)globalThis.updateSessSurplusUI();
}
function initWandPages(){
  globalThis.renderSessions=renderSessions;
  globalThis.renderWandQueue=renderWandQueue;
  globalThis.renderWandJobView=renderWandJobView;
}
globalThis.initWandPages=initWandPages;
})();