;(function(){
function openBetDlg(id){
  const p=globalThis.S.projects.find(x=>x.id===id);if(!p)return;
  if(globalThis.projectIsFinalized(p)||p.status!=='in_progress'){globalThis.toast('Pariul nu se poate modifica pe un proiect finalizat sau în afara execuției','warn');return;}
  globalThis.dlgOpen('🎲 Pariază pe calitate',p.name,
    `<p class="tsm tmut mb14">Alege rezultatul pe care îl anticipezi. Dacă nimeriști la finalizare, primești puncte bonus.</p>
    ${[['mantuiala','🔴','De mântuială',2],['moderata','🟠','Calitate moderată',3],['ridicata','🟢','Calitate ridicată',4]].map(([q,ic,lb,b],idx,arr)=>
      `<label class="${idx===arr.length-1?'opt-row mb0':'opt-row'}"><input type="radio" name="bq" value="${q}"/><div><div class="bold">${ic} ${lb}</div><div class="tsm tmut">Dacă ghicești: +${b} puncte bonus</div></div></label>`
    ).join('')}`,
    `<button class="btn btn-f" onclick="dlgClose()">Anulează</button><button class="btn btn-g" onclick="placeBet(${id})">🎲 Plasează Pariul</button>`
  );
}

function placeBet(id){
  const q=document.querySelector('input[name="bq"]:checked')?.value;
  if(!q){globalThis.toast('Selectează o variantă','err');return;}
  const p=globalThis.S.projects.find(x=>x.id===id);if(!p)return;
  if(globalThis.projectIsFinalized(p)||p.status!=='in_progress'){globalThis.toast('Proiect finalizat sau ineligibil. Pariul a fost respins','warn');return;}
  p.bet={quality:q};
  globalThis.dlgClose();
  globalThis.renderProj();
  globalThis.toast(`Pariu plasat: „${globalThis.qLabel(q)}" pentru „${p.name}"`,'ok');
}

function initProjectsBetDialog(){
  globalThis.openBetDlg=openBetDlg;
  globalThis.placeBet=placeBet;
}
globalThis.initProjectsBetDialog=initProjectsBetDialog;
})();