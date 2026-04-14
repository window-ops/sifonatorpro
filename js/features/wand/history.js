;(function(){
function wandJournalLineIsMoneyTick(line){
  const s=String(line||'');
  return s.includes('RON')&&(s.includes('cumul')||/\+\s*[0-9]/.test(s)||/[+＋][0-9]/.test(s));
}
function wandJournalFilterLines(lines){
  if(!globalThis.S._wandLogMoneyFilter)return lines.slice();
  return lines.filter(wandJournalLineIsMoneyTick);
}
function toggleWandLogMoneyFilter(on){
  globalThis.S._wandLogMoneyFilter=!!on;
  globalThis.renderWandJobView();
  globalThis.saveState();
}
function wandGetJobDetailRawLines(id){
  if(globalThis.S.activeSession&&globalThis.S.activeSession.queueJobId===id)return(globalThis.S.activeSession.logLines||[]).slice();
  const q=globalThis.S.wandQueue.find(x=>x.id===id);
  return q&&(q.logLines||[]).slice();
}
function wandDownloadText(filename,text){
  const blob=new Blob([text||''],{type:'text/plain;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=filename;
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),2000);
  globalThis.toast('Fișier descărcat','ok');
}
function wandCopyPlain(text){
  if(!text){globalThis.toast('Nimic de copiat','warn');return;}
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(()=>globalThis.toast('Copiat în clipboard','ok')).catch(()=>globalThis.toast('Copierea a eșuat','err'));
    return;
  }
  globalThis.toast('Clipboard indisponibil în acest context','warn');
}
function wandExportJobJournal(){
  const id=globalThis.S.wandJobDetailId;if(!id)return;
  const lines=globalThis.wandGetJobDetailRawLines(id);
  const q=globalThis.S.wandQueue.find(x=>x.id===id);
  const name=(q?.projectName||'dosar').replace(/[^\w\-ăâîșțĂÂÎȘȚa-zA-Z0-9]+/g,'_').slice(0,48);
  globalThis.wandDownloadText(`jurnal-bagheta-${name}-${id}.txt`,lines.join('\n'));
}
function wandCopyJobRaw(){
  const id=globalThis.S.wandJobDetailId;if(!id)return;
  wandCopyPlain(globalThis.wandGetJobDetailRawLines(id).join('\n'));
}
function wandCopyJobJournalFiltered(){
  const id=globalThis.S.wandJobDetailId;if(!id)return;
  const lines=globalThis.wandJournalFilterLines(globalThis.wandGetJobDetailRawLines(id));
  wandCopyPlain(lines.join('\n'));
}
function sessionLogText(sid){
  const sess=globalThis.S.sessions.find(x=>x.id===sid);
  return sess&&(sess.logLines||[]).join('\n')||'';
}
function openSessionHistoryDetail(sid){
  const sess=globalThis.S.sessions.find(x=>x.id===sid);
  if(!sess){globalThis.toast('Sesiune indisponibilă','warn');return;}
  const logs=sess.logLines&&sess.logLines.length?sess.logLines.map(l=>globalThis.escapeHtml(l)).join('<br/>'):'<span class="tmut">Nicio linie de jurnal salvată pentru această sesiune.</span>';
  const body=`<div class="tsm mb10">Proiect: <strong>${globalThis.escapeHtml(sess.projectName||'-')}</strong> · Durată ${globalThis.fTimer(sess.elapsed)} · Surplus ${globalThis.fRON(sess.surplus)} · Factor ${(sess.factor*100).toFixed(0)}%</div>
  <div class="u-lh155" style="font-family:var(--mono);font-size:12px;max-height:50vh;overflow:auto">${logs}</div>`;
  globalThis.dlgOpen('Dosar sesiune (istoric)',(sess.projectName||'Sesiune'),body,
    `<button type="button" class="btn btn-f btn-sm" onclick="wandDownloadText('jurnal-sesiune-${sid}.txt',sessionLogText(${sid}))">Export .txt</button>
     <button type="button" class="btn btn-f btn-sm" onclick="wandCopyPlain(sessionLogText(${sid}))">Copiază jurnal</button>
     <button type="button" class="btn btn-p" onclick="dlgClose()">Închide</button>`);
}
function openWandJobDetail(id){
  globalThis.S.wandJobDetailId=id;globalThis.navigate('wandjob');globalThis.saveState();
}
function initWandHistory(){
  globalThis.wandJournalLineIsMoneyTick=wandJournalLineIsMoneyTick;
  globalThis.wandJournalFilterLines=wandJournalFilterLines;
  globalThis.toggleWandLogMoneyFilter=toggleWandLogMoneyFilter;
  globalThis.wandGetJobDetailRawLines=wandGetJobDetailRawLines;
  globalThis.wandDownloadText=wandDownloadText;
  globalThis.wandCopyPlain=wandCopyPlain;
  globalThis.wandExportJobJournal=wandExportJobJournal;
  globalThis.wandCopyJobRaw=wandCopyJobRaw;
  globalThis.wandCopyJobJournalFiltered=wandCopyJobJournalFiltered;
  globalThis.sessionLogText=sessionLogText;
  globalThis.openSessionHistoryDetail=openSessionHistoryDetail;
  globalThis.openWandJobDetail=openWandJobDetail;
}
globalThis.initWandHistory=initWandHistory;
})();