;(function(){
function advanceTender(id){
  const t=globalThis.S.tenders.find(x=>x.id===id);if(!t)return;
  const tProj=t.projectId?globalThis.S.projects.find(p=>p.id===t.projectId):null;
  if(tProj&&tProj.status==='completed'){globalThis.toast('Proiectul asociat este finalizat. Licitația nu mai poate fi avansată','warn');return}
  if(t.status==='evaluation'){
    globalThis.evaluateTenderNow(t);
    globalThis.renderTend();globalThis.renderDash();globalThis.renderJust();
    return;
  }
  const next={open:'clarificari',clarificari:'depuneri',depuneri:'evaluation',awarded:'executie'}[t.status];
  if(!next)return;
  if(['clarificari','depuneri','evaluation'].includes(next))t.eliminationRounds=Math.min(4,(t.eliminationRounds||0)+1);
  t.status=next;globalThis.renderTend();globalThis.renderDash();
  globalThis.toast(`Licitație mutată în etapa: ${globalThis.tsLabel(t.status)}`,'ok');
}
function dismissContest(id){
  const t=globalThis.S.tenders.find(x=>x.id===id);if(!t)return;
  const tProj=t.projectId?globalThis.S.projects.find(p=>p.id===t.projectId):null;
  if(tProj&&tProj.status==='completed'){globalThis.toast('Proiectul asociat este finalizat. Nu se mai pot face modificări pe licitație','warn');return}
  if(!t.winner)globalThis.evaluateTenderNow(t);
  t.status='awarded';
  t.auditRisk=Math.max(4,Math.round((t.auditRisk||12)*0.65));
  t.evalSummary=`Contestație respinsă. Risc rămas ${t.auditRisk}%`;
  globalThis.renderTend();
  globalThis.toast('Contestație respinsă pe motive procedurale','ok');
  globalThis.addAct(`Contestația pentru „${t.name}" respinsă. Contractul rămâne adjudecat.`);
}
function ntUpdateTenderHelpers(){
  const proc=globalThis.$('nt-type')?.value||'open';
  const spec=globalThis.clamp(parseInt(globalThis.$('nt-spec')?.value||'0',10)||0,0,2);
  const over=globalThis.clamp(parseInt(globalThis.$('nt-over')?.value||'0',10)||0,0,60);
  const procH=globalThis.$('nt-proc-help');
  const specH=globalThis.$('nt-spec-help');
  const overH=globalThis.$('nt-over-help');
  if(procH){
    procH.innerHTML=proc==='restricted'
      ?'Procedură mai controlată formal, dar poate rămâne vulnerabilă la filtrări de competiție.'
      :'Procedură deschisă: competiție mai largă, dar expunere mai mare la contestații și presiune din partea publicului.';
  }
  if(specH){
    specH.innerHTML=spec===0
      ?'Fără dedicații: evaluarea rămâne mai aproape de parametrii tehnici/comerciali standard. În simularea ofertelor nu pot intra „firme de casă”, ci doar firme din lista legitimă pe categorie.'
      :spec===1
      ?'Nivel discret: crește probabilitatea de avantaj pentru rețeaua politică și eliminarea graduală a unor ofertanți.'
      :'Nivel agresiv: crește mult avantajul „firmelor de casă” și reduce concurența efectivă.';
  }
  if(overH){
    overH.innerHTML=over<=0
      ?'Fără supraevaluare declarată în această procedură.'
      :spec===0
      ?`Supraevaluare setată la ${over}%: în mod obișnuit crește tensiunea pe execuție și volumul de acte adiționale. În practică (inclusiv în investigațiile de presă despre achiziții), controlul rămâne fragmentar; „dosarul” nu oglindește tot riscul real.`
      :`Supraevaluare setată la ${over}%: umflă contractul; cu specificații pentru „firme de casă”. Rețelele ocolesc mai ușor formalitatea, iar actele adiționale pot părea mai rare (nu și lipsa de transparență). Te apropii de logica unor dosare din presa de tip Recorder.`;
  }
}
function ntClearTendFieldErrors(){
  ['nt-n','nt-b','nt-pid'].forEach(id=>{globalThis.$(id)?.classList.remove('input-invalid');});
  ['nt-err-n','nt-err-b','nt-err-pid'].forEach(id=>{const e=globalThis.$(id);if(e){e.textContent='';e.classList.add('hid');}});
}
function ntSetTendFieldError(which,msg){
  const inp={n:'nt-n',b:'nt-b',pid:'nt-pid'}[which];
  const err={n:'nt-err-n',b:'nt-err-b',pid:'nt-err-pid'}[which];
  if(inp)globalThis.$(inp).classList.add('input-invalid');
  const e=globalThis.$(err);
  if(e){e.textContent=msg;e.classList.remove('hid');}
}
function openNewTendDlg(){
  const eligible=globalThis.S.projects.filter(p=>['planned','in_progress'].includes(p.status)&&globalThis.projectUsesTenderFlow(p));
  if(!eligible.length){globalThis.toast('Nu există proiecte eligibile pentru licitații. Setează procedura proiectului pe „Licitație publică”','warn');globalThis.navigate('proj');return}
  const inp='width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:var(--r);font-family:var(--font);font-size:14px;outline:none';
  globalThis.dlgOpen('Licitație Publică Nouă','Conform Legii 98/2016 (interpretare flexibilă)',
    `<div class="fg"><label>Denumire procedură</label><input type="text" id="nt-n" maxlength="200" autocomplete="off" placeholder="ex: Furnizare produse de curățat premium" style="${inp}"/><span id="nt-err-n" class="nt-field-err hid" role="alert"></span></div>
    <div class="fg"><label>Proiect asociat (obligatoriu)</label><select id="nt-pid" style="${inp}">
      <option value="">(Selectează proiect)</option>
      ${eligible.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}
    </select><span id="nt-err-pid" class="nt-field-err hid" role="alert"></span></div>
    <div class="fg"><label>Valoare estimată (RON)</label><input type="number" id="nt-b" inputmode="numeric" min="1" step="1" placeholder="ex: 2500000" style="${inp}"/><span id="nt-err-b" class="nt-field-err hid" role="alert"></span></div>
    <div class="fg"><label>Tip procedură</label><select id="nt-type" style="${inp}">
      <option value="open">Licitatie deschisă</option><option value="restricted">Licitatie restrânsă</option>
    </select>
      <p id="nt-proc-help" class="tsm tmut mt6" style="line-height:1.5"></p></div>
    <div class="fg"><label>Specificații dedicate „firmelor de casă”</label><select id="nt-spec" style="${inp}">
      <option value="0">Nu</option><option value="1">Da, discret</option><option value="2">Da, agresiv</option>
    </select>
      <p id="nt-spec-help" class="tsm tmut mt6" style="line-height:1.5"></p></div>
    <div class="fg mb0"><label>Supraevaluare estimată contract (%)</label><select id="nt-over" style="${inp}">
      <option value="0">0% (fără umflare)</option><option value="12">12%</option><option value="25">25%</option><option value="40">40%</option>
    </select>
      <p id="nt-over-help" class="tsm tmut mt6" style="line-height:1.5"></p></div>`,
    `<button class="btn btn-f" onclick="dlgClose()">Anulează</button><button class="btn btn-p" onclick="addTend()">Publică Licitația</button>`
  );
  globalThis.$('nt-type')?.addEventListener('change',ntUpdateTenderHelpers);
  globalThis.$('nt-spec')?.addEventListener('change',ntUpdateTenderHelpers);
  globalThis.$('nt-over')?.addEventListener('change',ntUpdateTenderHelpers);
  ntClearTendFieldErrors();
  const clrN=()=>{const e=globalThis.$('nt-err-n');if(e){e.textContent='';e.classList.add('hid');}globalThis.$('nt-n')?.classList.remove('input-invalid');};
  const clrB=()=>{const e=globalThis.$('nt-err-b');if(e){e.textContent='';e.classList.add('hid');}globalThis.$('nt-b')?.classList.remove('input-invalid');};
  const clrP=()=>{const e=globalThis.$('nt-err-pid');if(e){e.textContent='';e.classList.add('hid');}globalThis.$('nt-pid')?.classList.remove('input-invalid');};
  globalThis.$('nt-n')?.addEventListener('input',clrN);
  globalThis.$('nt-b')?.addEventListener('input',clrB);
  globalThis.$('nt-pid')?.addEventListener('change',clrP);
  ntUpdateTenderHelpers();
}
function addTend(){
  ntClearTendFieldErrors();
  const rawN=String(globalThis.$('nt-n')?.value||'').trim();
  const bStr=String(globalThis.$('nt-b')?.value??'').trim().replace(/\s/g,'');
  const pid=parseInt(globalThis.$('nt-pid')?.value||'0',10)||null;
  const procType=globalThis.$('nt-type')?.value||'open';
  const specRig=globalThis.clamp(parseInt(globalThis.$('nt-spec')?.value||'0',10)||0,0,2);
  const overpricePct=globalThis.clamp(parseInt(globalThis.$('nt-over')?.value||'0',10)||0,0,60);
  let formOk=true;
  if(!rawN||rawN.length<3){ntSetTendFieldError('n','Introdu o denumire de cel puțin 3 caractere.');formOk=false;}
  else if(rawN.length>180){ntSetTendFieldError('n','Denumirea depășește 180 de caractere.');formOk=false;}
  if(!pid||pid<=0){ntSetTendFieldError('pid','Selectează proiectul asociat.');formOk=false;}
  const bNum=Number(bStr);
  if(bStr===''||!Number.isFinite(bNum)){ntSetTendFieldError('b','Introdu valoarea estimată în RON (număr întreg pozitiv).');formOk=false;}
  else if(!Number.isInteger(bNum)||bNum<1){ntSetTendFieldError('b','Valoarea trebuie să fie un număr întreg cel puțin 1 RON.');formOk=false;}
  else if(bNum>2000000000000){ntSetTendFieldError('b','Valoarea pare nerealist de mare; verifică suma.');formOk=false;}
  if(!formOk){globalThis.toast('Verifică câmpurile marcate','warn');return}
  const n=rawN;
  const b=bNum;
  const p=globalThis.S.projects.find(x=>x.id===pid);
  if(!p){globalThis.toast('Proiect invalid','err');return}
  if(p.status==='completed'){globalThis.toast('Nu poți publica licitații pe un proiect deja finalizat','warn');return}
  if(!globalThis.projectUsesTenderFlow(p)){globalThis.toast('Acest proiect este setat pe „Achiziție directă”. Schimbă procedura la „Licitație publică” din Gestionare Proiect','warn');return}
  const complexity=globalThis.clamp(Math.round((b/600000)+((p.lateS||p.lateF)?1:0)),1,5);
  const declared=Math.max(1,p.declaredValue||b||1);
  const real=Math.max(1,p.realValue||Math.round(declared*0.72));
  const spread=globalThis.clamp((declared-real)/declared,0,0.85);
  const corruptionPressure=globalThis.clamp((spread*1.25)+((specRig>0)?0.2:0),0,1);
  const houseBias=globalThis.clamp((specRig*0.32)+((procType==='direct')?0.18:0)+(corruptionPressure*0.22)+(Math.random()*0.08),0,0.95);
  const lowPricePush=globalThis.clamp(0.46+((specRig>0)?0.24:0)+((procType==='direct')?0.1:0)+(corruptionPressure*0.2),0.4,0.95);
  const autoCl=globalThis.S._wandAssistAutoClarify;
  if(autoCl!==undefined)delete globalThis.S._wandAssistAutoClarify;
  globalThis.S.tenders.push({id:globalThis.S.ntid++,projectId:pid,name:n,budget:b,status:'open',winner:null,bids:[],winnerScore:0,auditRisk:0,procType,complexity,evalSummary:'',specRig,houseBias,overpricePct,lowPricePush,eliminationRounds:0,postAwardApplied:false});
  const newT=globalThis.S.tenders[globalThis.S.tenders.length-1];
  if(autoCl===pid&&newT&&newT.projectId===pid&&newT.status==='open'){
    newT.status='clarificari';
    globalThis.toast('Licitație publicată și avansată la Clarificări. Poți porni Bagheta pe acest proiect','ok');
  }else{
    globalThis.toast(`Licitație publicată: ${n}`,'ok');
  }
  if(p.monthly)p.monthly.blockedNoTenderNotified=false;
  globalThis.dlgClose();globalThis.renderTend();globalThis.addAct(`Licitație nouă: „${n}" (${globalThis.fRON(b)})${specRig?` · caiet dedicat nivel ${specRig}`:''}${overpricePct?` · supraevaluare ${overpricePct}%`:''}${corruptionPressure>=0.4?` · presiune corupție ${Math.round(corruptionPressure*100)}%`:''}.`);
  globalThis.renderDash();globalThis.renderWandQueue();globalThis.updWandFormControls();globalThis.saveState();
}
function openNewTendDlgForProject(projectId,opts){
  opts=opts||{};
  const p=globalThis.S.projects.find(x=>x.id===projectId);
  if(!p||!['planned','in_progress'].includes(p.status)){
    globalThis.toast('Proiectul trebuie să fie planificat sau în desfășurare pentru a publica o licitație','warn');
    return;
  }
  if(!globalThis.projectUsesTenderFlow(p)){
    globalThis.toast('Proiectul este pe „Achiziție directă”. Schimbă procedura în Gestionare Proiect pentru a publica licitații','warn');
    globalThis.openProjManageDlg(projectId);
    return;
  }
  if(opts.autoAdvanceAfterPublish)globalThis.S._wandAssistAutoClarify=projectId;
  openNewTendDlg();
  requestAnimationFrame(()=>{
    const sel=globalThis.$('nt-pid');
    if(sel)sel.value=String(projectId);
  });
}
function wandAdvanceOpenTendersToClarificari(projectId){
  const linked=globalThis.S.projects.find(p=>p.id===projectId);
  if(linked&&linked.status==='completed'){globalThis.toast('Proiect finalizat. Nu se mai pot modifica licitațiile','warn');return}
  let n=0;
  globalThis.S.tenders.forEach(t=>{
    if(t.projectId===projectId&&t.status==='open'){t.status='clarificari';n++;}
  });
  if(!n){globalThis.toast('Nu există licitații doar „publicate” de avansat pentru acest proiect','warn');return;}
  globalThis.renderTend();globalThis.renderDash();globalThis.renderWandQueue();globalThis.updWandFormControls();globalThis.saveState();
  globalThis.toast(`${n===1?'Licitația a fost mutată':'Au fost mutate '+n+' licitații'} la Clarificări. Poți porni optimizarea.`,'ok');
  globalThis.addAct(`Baghetă: avansare rapidă la Clarificări pentru ${n} licitație(ii) pe proiect ${projectId}.`);
}

function initTenders(){
  globalThis.advanceTender=advanceTender;
  globalThis.dismissContest=dismissContest;
  globalThis.ntUpdateTenderHelpers=ntUpdateTenderHelpers;
  globalThis.ntClearTendFieldErrors=ntClearTendFieldErrors;
  globalThis.ntSetTendFieldError=ntSetTendFieldError;
  globalThis.openNewTendDlg=openNewTendDlg;
  globalThis.addTend=addTend;
  globalThis.openNewTendDlgForProject=openNewTendDlgForProject;
  globalThis.wandAdvanceOpenTendersToClarificari=wandAdvanceOpenTendersToClarificari;
}

globalThis.initTenders=initTenders;
})();