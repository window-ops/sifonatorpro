;(function(){
function buildNonAwardedTenderRowHtml(t,projectId,idx,total){
  const isLast=idx===total-1;
  let action='';
  if(t.status==='open'){
    action=`<button type="button" class="btn btn-p btn-sm" onclick="fastAdvanceSingleTenderForFinalize(${t.id},${projectId});openCompDlg(${projectId})">→ Clarificări</button>`;
  }else if(t.status==='clarificari'){
    action=`<button type="button" class="btn btn-p btn-sm" onclick="fastAdvanceSingleTenderForFinalize(${t.id},${projectId});openCompDlg(${projectId})">→ Depuneri</button>`;
  }else if(t.status==='depuneri'){
    action=`<button type="button" class="btn btn-p btn-sm" onclick="fastAdvanceSingleTenderForFinalize(${t.id},${projectId});openCompDlg(${projectId})">→ Evaluare</button>`;
  }else if(t.status==='evaluation'){
    action=`<button type="button" class="btn btn-p btn-sm" onclick="fastAdvanceSingleTenderForFinalize(${t.id},${projectId});openCompDlg(${projectId})">→ Adjudecă</button>`;
  }else if(t.status==='awarded'){
    action=`<button type="button" class="btn btn-p btn-sm" onclick="execSingleAwardedTender(${t.id},${projectId});openCompDlg(${projectId})">→ Execuție</button>`;
  }else if(t.status==='contested'){
    action=`<button type="button" class="btn btn-f btn-sm" onclick="dismissContest(${t.id});openCompDlg(${projectId})">Respinge contestație</button>`;
  }else if(t.status==='executie'){
    action='<span class="tsm tmut">Execuție contract</span>';
  }else{
    action='<span class="tsm tmut">fără acțiune rapidă</span>';
  }
  return`<div class="lrow${isLast?' mb0':''}" style="padding:10px;border:1px solid var(--border);border-radius:10px;background:var(--bg);${isLast?'':'margin-bottom:8px'}">
          <div style="flex:1;min-width:0">
            <div class="rt" style="font-size:13px">${globalThis.escapeHtml(t.name)}</div>
            <div class="rs"><span class="badge ${globalThis.tsBadge(t.status)}">${globalThis.tsLabel(t.status)}</span>${t.winner?` <span class="tsm">· Câștigător: ${globalThis.escapeHtml(t.winner)}</span>`:''}</div>
          </div>
          <div class="re" style="align-items:center">${action}</div>
        </div>`;
}
function openCompDlg(id){
  const p=globalThis.S.projects.find(x=>x.id===id);if(!p)return;
  if(globalThis.projectIsFinalized(p)||p.status!=='in_progress'){globalThis.toast('Doar proiectele în desfășurare pot fi închise din listă','warn');return;}
  const blockReason=globalThis.projectFinalizeBlockReason(p);
  if(blockReason){
    const hasTender=globalThis.S.tenders.some(t=>t.projectId===p.id);
    const needsWinner=globalThis.projectUsesTenderFlow(p)&&hasTender&&!globalThis.projectHasWinningTender(p);
    if(needsWinner){
      const rel=globalThis.S.tenders.filter(t=>t.projectId===p.id);
      const rows=rel.map((t,idx,arr)=>buildNonAwardedTenderRowHtml(t,id,idx,arr.length)).join('');
      globalThis.dlgOpen('Finalizare blocată',p.name,
        `<p class="tsm" style="line-height:1.6">${blockReason}</p><p class="tsm mt8 mb6 u-lh155">Licitații asociate (acțiuni rapide):</p><div style="max-height:260px;overflow:auto;padding-right:2px">${rows}</div>`,
        `<button type="button" class="btn btn-f" onclick="dlgClose()">Închide</button><button type="button" class="btn btn-s" onclick="dlgClose();navigate('tend')">📋 Deschide Licitații</button>`
      );
      return;
    }
    const actBtn=globalThis.projectProcurementMode(p)==='direct'
      ? `<button type="button" class="btn btn-p" onclick="dlgClose();openProjManageDlg(${id})">⚙️ Schimbă procedura</button>`
      : `<button type="button" class="btn btn-p" onclick="dlgClose();openNewTendDlgForProject(${id})">+ Adaugă licitație</button>`;
    globalThis.dlgOpen('Finalizare blocată',p.name,`<p class="tsm" style="line-height:1.6">${blockReason}</p>`,`<button type="button" class="btn btn-f" onclick="dlgClose()">Închide</button>${actBtn}`);
    return;
  }
  if(globalThis.S.settings.skipProjectFinalizeConfirm){compProj(id);return;}
  const relAll=globalThis.S.tenders.filter(t=>t.projectId===id);
  const notAdjudecata=relAll.filter(t=>t.status!=='awarded'&&t.status!=='executie');
  const pipelineRows=notAdjudecata.length?notAdjudecata.map((t,i,arr)=>buildNonAwardedTenderRowHtml(t,id,i,arr.length)).join(''):'';
  const pipelineSection=notAdjudecata.length?`<p class="tsm tmut mt8 mb6 u-lh155">Licitații asociate care <strong>nu</strong> sunt încă în stadiul <strong>Adjudecată</strong>:</p><div style="max-height:220px;overflow:auto;padding-right:2px">${pipelineRows}</div>`:'';
  const pendingExec=globalThis.S.tenders.filter(t=>t.projectId===id&&t.status==='awarded');
  const canAssist=!!globalThis.S.settings.enableFinalizeExecAssist&&pendingExec.length>0;
  const countLabel=canAssist?(pendingExec.length===1?'o licitație adjudecată neexecutată':`${pendingExec.length} licitații adjudecate neexecutate`):'';
  const execRows=canAssist?pendingExec.map(t=>`<div class="lrow" style="padding:10px;border:1px solid var(--border);border-radius:10px;background:var(--bg);margin-top:8px">
      <div style="flex:1;min-width:0">
        <div class="rt" style="font-size:13px">${globalThis.escapeHtml(t.name)}</div>
        <div class="rs"><span class="badge ${globalThis.tsBadge(t.status)}">${globalThis.tsLabel(t.status)}</span>${t.winner?` <span class="tsm">· Câștigător: ${globalThis.escapeHtml(t.winner)}</span>`:''}</div>
      </div>
      <div class="re"><button type="button" class="btn btn-p btn-sm" onclick="execSingleAwardedTender(${t.id},${id})">→ Execuție</button></div>
    </div>`).join(''):'';
  const execMovePhrase=pendingExec.length===1?'O poți muta':'Le poți muta';
  const extra=canAssist?`<p class="tsm tmut mt8" style="line-height:1.5">Există ${countLabel}. ${execMovePhrase} în „Execuție contract”:</p><div style="max-height:220px;overflow:auto;padding-right:2px">${execRows}</div>`:'';
  const assistBtn=canAssist&&pendingExec.length>1?`<button type="button" class="btn btn-p" onclick="execAwardedTendersForProject(${id});openCompDlg(${id})">→ Execută toate</button>`:'';
  const tendBtn=(notAdjudecata.length||canAssist)?`<button type="button" class="btn btn-f" onclick="dlgClose();navigate('tend')">📋 Licitații</button>`:'';
  globalThis.dlgOpen('Finalizează proiectul?',p.name,`<p class="tsm u-lh155">Confirmi închiderea? Calitatea finală și punctele se stabilesc automat.</p>${pipelineSection}${extra}`,`<button type="button" class="btn btn-f" onclick="dlgClose()">Anulează</button>${tendBtn}${assistBtn}<button type="button" class="btn btn-s" onclick="compProj(${id})">Confirmă</button>`);
}
function compProj(id){
  const p=globalThis.S.projects.find(x=>x.id===id);if(!p)return;
  if(globalThis.projectIsFinalized(p)||p.status!=='in_progress'){globalThis.toast('Proiectul nu mai poate fi finalizat din această acțiune','warn');globalThis.dlgClose();return;}
  const blockReason=globalThis.projectFinalizeBlockReason(p);
  if(blockReason){globalThis.toast(blockReason,'warn');return;}
  const q=globalThis.rollProjectQuality(p);
  p.status='completed';
  globalThis.dlgClose();
  globalThis.applyProjectCompletionRepAndBet(p,q);
  globalThis.renderProj();globalThis.renderDash();globalThis.saveState();
}
function execAwardedTendersForProject(projectId){
  const p=globalThis.S.projects.find(x=>x.id===projectId);if(!p)return;
  if(globalThis.projectIsFinalized(p)){globalThis.toast('Proiect finalizat. Nu se mai pot executa licitații asociate','warn');return;}
  const rel=globalThis.S.tenders.filter(t=>t.projectId===projectId&&t.status==='awarded');
  if(!rel.length){globalThis.toast('Nu există licitații adjudecate de executat','warn');return;}
  rel.forEach(t=>{t.status='executie';});
  globalThis.renderTend();globalThis.renderProj();globalThis.renderDash();globalThis.saveState();
  const msg=rel.length===1?'Licitația adjudecată a fost mutată la Execuție contract.':`${rel.length} licitații adjudecate au fost mutate la Execuție contract.`;
  globalThis.toast(msg,'ok');
}
function execSingleAwardedTender(tenderId,projectId){
  const p=globalThis.S.projects.find(x=>x.id===projectId);if(!p)return;
  if(globalThis.projectIsFinalized(p)){globalThis.toast('Proiect finalizat. Nu se mai pot executa licitații asociate','warn');return;}
  const t=globalThis.S.tenders.find(x=>x.id===tenderId&&x.projectId===projectId);
  if(!t||t.status!=='awarded'){globalThis.toast('Licitația nu mai este în starea „Adjudecată”','warn');openCompDlg(projectId);return;}
  t.status='executie';
  globalThis.renderTend();globalThis.renderProj();globalThis.renderDash();globalThis.saveState();
  globalThis.toast('Licitația a fost mutată la Execuție contract','ok');
  openCompDlg(projectId);
}
function fastAdvanceProjectTendersForFinalize(projectId){
  const p=globalThis.S.projects.find(x=>x.id===projectId);if(!p)return;
  if(globalThis.projectIsFinalized(p)||p.status!=='in_progress'){globalThis.toast('Proiectul nu este eligibil pentru această acțiune','warn');return;}
  const rel=globalThis.S.tenders.filter(t=>t.projectId===projectId);
  if(!rel.length){globalThis.toast('Nu există licitații asociate acestui proiect','warn');return;}
  let progressed=0,scored=0;
  rel.forEach(t=>{
    if(t.status==='evaluation'){
      globalThis.evaluateTenderNow(t);progressed++;scored++;return;
    }
    const next={open:'clarificari',clarificari:'depuneri',depuneri:'evaluation'}[t.status];
    if(!next)return;
    t.status=next;
    t.eliminationRounds=Math.min(4,(t.eliminationRounds||0)+1);
    progressed++;
  });
  globalThis.renderTend();globalThis.renderProj();globalThis.renderDash();globalThis.renderJust();globalThis.saveState();
  if(globalThis.projectHasWinningTender(p))globalThis.toast(`Licitațiile pentru „${p.name}” au fost avansate. Există acum adjudecare validă.`,'ok');
  else if(progressed>0)globalThis.toast(`Avans rapid aplicat: ${progressed} licitații (evaluări: ${scored}).`,'ok');
  else globalThis.toast('Nu există licitații care pot fi avansate rapid din stadiul curent','warn');
}
function fastAdvanceSingleTenderForFinalize(tenderId,projectId){
  const p=globalThis.S.projects.find(x=>x.id===projectId);if(!p)return;
  if(globalThis.projectIsFinalized(p)||p.status!=='in_progress'){globalThis.toast('Proiectul nu este eligibil pentru această acțiune','warn');return;}
  const t=globalThis.S.tenders.find(x=>x.id===tenderId&&x.projectId===projectId);
  if(!t){globalThis.toast('Licitația nu a fost găsită','warn');return;}
  if(t.status==='evaluation'){
    globalThis.evaluateTenderNow(t);
    globalThis.renderTend();globalThis.renderProj();globalThis.renderDash();globalThis.renderJust();globalThis.saveState();
    globalThis.toast('Evaluare aplicată pe licitația selectată','ok');
    return;
  }
  const next={open:'clarificari',clarificari:'depuneri',depuneri:'evaluation'}[t.status];
  if(!next){globalThis.toast('Nu există acțiune rapidă disponibilă pentru acest stadiu','warn');return;}
  t.status=next;
  t.eliminationRounds=Math.min(4,(t.eliminationRounds||0)+1);
  globalThis.renderTend();globalThis.renderProj();globalThis.renderDash();globalThis.renderJust();globalThis.saveState();
  globalThis.toast(`Licitația selectată a fost avansată la ${globalThis.tsLabel(next)}.`,'ok');
}
function initProjectsCompletionFlow(){
  globalThis.buildNonAwardedTenderRowHtml=buildNonAwardedTenderRowHtml;
  globalThis.openCompDlg=openCompDlg;
  globalThis.compProj=compProj;
  globalThis.execAwardedTendersForProject=execAwardedTendersForProject;
  globalThis.execSingleAwardedTender=execSingleAwardedTender;
  globalThis.fastAdvanceProjectTendersForFinalize=fastAdvanceProjectTendersForFinalize;
  globalThis.fastAdvanceSingleTenderForFinalize=fastAdvanceSingleTenderForFinalize;
}
globalThis.initProjectsCompletionFlow=initProjectsCompletionFlow;
})();