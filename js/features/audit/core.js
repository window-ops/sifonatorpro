;(function(){
function renderAudit(){
  const anafCard=globalThis.$('audit-anaf-sync-card');
  const anafPane=globalThis.$('audit-anaf-sync-pane');
  if(anafCard&&anafPane){
    if(!globalThis.isAnafSyncAuditVisible()){
      anafCard.classList.add('hid');
      anafCard.setAttribute('aria-hidden','true');
      anafPane.innerHTML='';
    }else{
      anafCard.classList.remove('hid');
      anafCard.setAttribute('aria-hidden','false');
      const now=globalThis.nowDate();
      const dstr=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      const projs=globalThis.S.projects.filter(p=>p.status==='in_progress'||p.status==='completed').slice(0,4);
      const judPre=String(globalThis.S.user.jud||'RO').slice(0,3).toUpperCase();
      const efRows=(projs.length?projs:[{title:'Servicii consultanță',status:'completed'}]).map((p,i)=>{
        const h=Array.from(String(p.title||'')).reduce((s,c)=>s+c.charCodeAt(0),i*7919);
        const n=100000+(h%899999);
        const st=p.status==='completed'?'Închisă':'În circuit';
        const amt=8000+(h%220000);
        return`<div class="audit-anaf-ef-row"><span>EF-RO/${globalThis.escapeHtml(judPre)}/${n}</span><span>${dstr}</span><span>${globalThis.fRON(amt)}</span><span style="grid-column:1/-1;font-size:11px;color:var(--text2)">${globalThis.escapeHtml(p.title||'-')} · ${st}</span></div>`;
      }).join('');
      const actTail=globalThis.S.actLog.slice(-12).reverse();
      const details=actTail.map((ev,ix)=>{
        const sev=/err|DNA|justi|anchet|presiune/i.test(ev.txt)?'at':'inf';
        const lab=sev==='at'?'ATENȚIONARE':'INFORMARE';
        const ref=1000000+(Array.from(String(ev.txt||'')).reduce((s,c)=>s+c.charCodeAt(0),ix*104729)%8999999);
        const bureaucr=`Referință internă RO-EF-EXT/${ref}. Linie trasabilitate: „${ev.txt}”. Evenimentul este consemnat în registrul ANAF Sync fără corespondență în SPV. Stare: înregistrat pentru raportare de sinteză.`;
        return`<div class="audit-anaf-detail"><span class="ad-sev ${sev}">${lab}</span>${globalThis.escapeHtml(bureaucr)} <span class="tsm tmut">(${ev.t})</span></div>`;
      }).join('');
      const justiceExtra=globalThis.S.justice?.anafAuditMessage
        ?`<div class="audit-anaf-detail"><span class="ad-sev at">CORELAȚIE</span>Alertă tablou de bord justiție: ${globalThis.escapeHtml(globalThis.S.justice.anafAuditMessage)}.</div>`
        :'';
      anafPane.innerHTML=`<div class="audit-anaf-ef-h" style="display:grid;grid-template-columns:1fr 100px 90px;gap:8px;padding-bottom:6px;border-bottom:2px solid var(--border)"><span>Document</span><span>Dată</span><span>Valoare</span></div>
        ${efRows}
        <h4 class="mt14 mb6" style="font-size:13px">Flux detaliat (extras simulat)</h4>
        ${justiceExtra}${details||'<p class="tsm tmut">Nu există încă linii de trasabilitate extinsă. Folosește programul pentru a popula registrul.</p>'}`;
    }
  }
  const el=globalThis.$('audit-log');if(!el)return;
  const ledger=`<div class="card-accent-o" style="padding:10px;border:1px solid var(--border);border-radius:var(--r);margin-bottom:10px">
    <div class="gline"><span class="gk">Buget public</span><span class="gv">${globalThis.fRON(globalThis.S.ledger.publicBudget)}</span></div>
    <div class="gline"><span class="gk">Surplus redistribuit</span><span class="gv">${globalThis.fRON(globalThis.S.ledger.redistributedSurplus)}</span></div>
    <div class="gline"><span class="gk">Cheltuieli influență</span><span class="gv">${globalThis.fRON(globalThis.S.ledger.influenceSpend)}</span></div>
    <div class="gline"><span class="gk">Cost reputațional</span><span class="gv">${globalThis.fRON(globalThis.S.ledger.reputationCost)}</span></div>
  </div>`;
  if(!globalThis.S.actLog.length){el.innerHTML=ledger+'<p class="tmut tsm">Nu există acțiuni auditate.</p>';return}
  const n=globalThis.S.actLog.length;
  el.innerHTML=ledger+globalThis.S.actLog.map((a,i)=>`<div class="act-i"><span class="act-t">${a.t}</span><span>#${String(n-i).padStart(2,'0')} · ${a.txt}</span></div>`).join('');
}

function initAudit(){
  globalThis.renderAudit=renderAudit;
}

globalThis.initAudit=initAudit;
})();