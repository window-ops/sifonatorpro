;(function(){
function projectCategoriesMap(){
  return globalThis.PROJECT_CATEGORIES||{
    diverse:{label:'Diverse',short:'Diverse',p:{mantuiala:.76,moderata:.19,ridicata:.05}},
  };
}
function projectIsFinalized(p){
  return!!(p&&p.status==='completed');
}
function filterProj(f){
  globalThis.S.projFilter=f;
  globalThis.renderProj();
  globalThis.saveState();
}
function startProj(id){
  const p=globalThis.S.projects.find(x=>x.id===id);if(!p)return;
  if(projectIsFinalized(p)){globalThis.toast('Proiectul este finalizat. Nu poate fi modificat','warn');return}
  const caps=globalThis.getSubscriptionCaps(),cnt=globalThis.countProjSlots();
  if(cnt.ongoing>=caps.ongoing){
    globalThis.openLimitDlg('Limită proiecte active',`Nu poți începe alt proiect: limita este ${caps.ongoing} în desfășurare pentru planul curent.`);
    return;
  }
  p.status='in_progress';
  globalThis.seedDossierIfEmpty(p,'Proiect trecut în execuție. Înregistrare automată în registru.');
  globalThis.renderProj();globalThis.addAct(`Proiect „${p.name}" a început.`);globalThis.renderDash();
  globalThis.toast(`Proiect început: ${p.name}`,'ok');
}
function openProjManageDlg(id){
  const p=globalThis.S.projects.find(x=>x.id===id);if(!p)return;
  if(projectIsFinalized(p)){globalThis.toast('Proiect finalizat. Datele nu mai pot fi modificate (doar consultare din Dosar)','warn');return}
  const inp='width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:var(--r);font-family:var(--font);font-size:14px;outline:none';
  const stOpts=[
    `<option value="planned"${p.status==='planned'?' selected':''}>Planificat</option>`,
    `<option value="in_progress"${p.status==='in_progress'?' selected':''}>În desfășurare</option>`,
  ];
  const categories=projectCategoriesMap();
  const catOpts=Object.keys(categories).map(k=>{
    const c=categories[k];
    return`<option value="${k}"${k===globalThis.projectCategoryKey(p)?' selected':''}>${globalThis.escapeHtml(c.label)}</option>`;
  }).join('');
  globalThis.dlgOpen('Gestionare Proiect',
    '',
    `<div class="fg"><label>Status proiect</label>
      <select id="pm-status" style="${inp}">${stOpts.join('')}</select>
    </div>
    <div class="fg"><label>Categorie (tip achiziție)</label>
      <select id="pm-cat" style="${inp}" onchange="pmUpdateProcHelper()">${catOpts}</select>
    </div>
    <div class="fg"><label>Procedură proiect</label>
      <select id="pm-proc" style="${inp}" onchange="pmUpdateProcHelper()">
        <option value="licitatie"${globalThis.projectProcurementMode(p)==='licitatie'?' selected':''}>Licitație publică</option>
        <option value="direct"${globalThis.projectProcurementMode(p)==='direct'?' selected':''}>Achiziție directă</option>
      </select>
      <p id="pm-proc-help" class="tsm tmut mt6" style="line-height:1.5"></p>
    </div>
    <div class="fg-row">
      <div class="fg"><label>Întârziere start</label>
        <select id="pm-ls" style="${inp}">
          <option value="0"${!p.lateS?' selected':''}>Nu</option>
          <option value="1"${p.lateS?' selected':''}>Da</option>
        </select>
      </div>
      <div class="fg"><label>Întârziere finalizare</label>
        <select id="pm-lf" style="${inp}">
          <option value="0"${!p.lateF?' selected':''}>Nu</option>
          <option value="1"${p.lateF?' selected':''}>Da</option>
        </select>
      </div>
    </div>
    <div class="fg-row">
      <div class="fg mb0"><label for="pm-real">Valoare reală proiect (RON)</label><input id="pm-real" type="number" inputmode="decimal" min="1" step="1" value="${p.realValue||Math.round(p.budget*0.7)}" style="${inp}" oninput="this.classList.remove('np-field-invalid')"/></div>
      <div class="fg mb0"><label for="pm-decl">Valoare declarată proiect (RON)</label><input id="pm-decl" type="number" inputmode="decimal" min="1" step="1" value="${p.declaredValue||Math.round(p.budget*1.18)}" style="${inp}" oninput="this.classList.remove('np-field-invalid');pmUpdateProcHelper()"/></div>
    </div>`,
    `<button class="btn btn-f" onclick="dlgClose()">Anulează</button>
     <button class="btn btn-p" onclick="saveProjManage(${id})">Salvează schimbările</button>`
  );
  globalThis.pmUpdateProcHelper();
}
function saveProjManage(id){
  const p=globalThis.S.projects.find(x=>x.id===id);if(!p)return;
  if(projectIsFinalized(p)){globalThis.toast('Proiect finalizat. Nu se pot salva modificări','warn');return}
  const oldStatus=p.status,oldLateS=p.lateS,oldLateF=p.lateF;
  const oldProc=globalThis.projectProcurementMode(p);
  const re=globalThis.$('pm-real'),de=globalThis.$('pm-decl');
  re?.classList.remove('np-field-invalid');
  de?.classList.remove('np-field-invalid');
  const rv=readProjectMoneyEl(re);
  const dv=readProjectMoneyEl(de);
  p.status=globalThis.$('pm-status')?.value||p.status;
  p.lateS=(globalThis.$('pm-ls')?.value==='1');
  p.lateF=(globalThis.$('pm-lf')?.value==='1');
  if(!Number.isFinite(rv)){globalThis.toast('Valoarea reală trebuie să fie un număr pozitiv','err');re?.classList.add('np-field-invalid');try{re?.focus();}catch(e){}return}
  if(!Number.isFinite(dv)){globalThis.toast('Valoarea declarată trebuie să fie un număr pozitiv','err');de?.classList.add('np-field-invalid');try{de?.focus();}catch(e){}return}
  if(dv<rv){globalThis.toast('Valoarea declarată trebuie să fie cel puțin egală cu valoarea reală','err');re?.classList.add('np-field-invalid');de?.classList.add('np-field-invalid');return}
  p.realValue=rv;p.declaredValue=dv;
  const newProc=(globalThis.$('pm-proc')?.value==='direct')?'direct':'licitatie';
  const selectedCat=globalThis.$('pm-cat')?.value;
  const categories=projectCategoriesMap();
  const limitForSelection=globalThis.law98DirectLimitForProject({projCategory:(selectedCat&&categories[selectedCat])?selectedCat:p.projCategory,declaredValue:dv,budget:dv});
  const hasTender=globalThis.S.tenders.some(t=>t.projectId===p.id);
  if(newProc==='direct'&&hasTender){globalThis.toast('Nu poți seta Achiziție directă: proiectul are deja licitații asociate','warn');return}
  if(newProc==='direct'&&dv>limitForSelection){globalThis.toast(`Achiziția directă depășește pragul din Legea 98/2016 pentru categoria selectată (${globalThis.fRON(limitForSelection)}).`,'warn');return}
  p.procurementMode=newProc;
  const cat=globalThis.$('pm-cat')?.value;
  p.projCategory=cat&&categories[cat]?cat:'diverse';
  globalThis.dlgClose();
  globalThis.renderProj();globalThis.renderDash();globalThis.updWandProjectOptions();
  if(oldStatus!==p.status)globalThis.addAct(`Status proiect „${p.name}" schimbat: ${globalThis.sLabel(oldStatus)} → ${globalThis.sLabel(p.status)}.`);
  if(oldLateS!==p.lateS)globalThis.addAct(`Proiect „${p.name}”: întârziere start ${p.lateS?'marcată':'eliminată'}.`);
  if(oldLateF!==p.lateF)globalThis.addAct(`Proiect „${p.name}”: întârziere finalizare ${p.lateF?'marcată':'eliminată'}.`);
  if(oldProc!==p.procurementMode)globalThis.addAct(`Procedură proiect „${p.name}" schimbată: ${globalThis.procurementModeLabel(oldProc)} → ${globalThis.procurementModeLabel(p.procurementMode)}.`);
  globalThis.toast('Proiect actualizat în organizator','ok');
  globalThis.scheduleSearchReindex?.();
}
function addProjDossierCustomEntry(projectId){
  const p=globalThis.S.projects.find(x=>x.id===projectId);if(!p)return;
  if(projectIsFinalized(p)){globalThis.toast('Proiect finalizat. Registrul nu mai poate fi modificat','warn');return}
  const raw=globalThis.$('dos-custom-txt')?.value?.trim()||'';
  if(!raw){globalThis.toast('Introdu textul notei pentru registru','err');return}
  if(raw.length>100){globalThis.toast('Textul depășește 100 de caractere','err');return}
  const dateInp=globalThis.$('dos-custom-date')?.value?.trim();
  let t;
  if(dateInp){const d=new Date(dateInp+'T12:00:00');t=Number.isNaN(d.getTime())?globalThis.nowDate().toLocaleDateString('ro-RO'):d.toLocaleDateString('ro-RO');}
  else t=globalThis.nowDate().toLocaleDateString('ro-RO');
  globalThis.ensureProjectDossier(p);
  p.dossier.unshift({t,txt:raw,custom:true});
  while(p.dossier.length>20)p.dossier.pop();
  globalThis.addAct(`Registru „${p.name}": notă personală adăugată.`);
  globalThis.saveState();
  globalThis.toast('Notă adăugată în registru','ok');
  openProjDossier(projectId);
}
function removeProjDossierCustomEntry(projectId,index){
  const p=globalThis.S.projects.find(x=>x.id===projectId);if(!p)return;
  if(projectIsFinalized(p)){globalThis.toast('Proiect finalizat. Registrul nu mai poate fi modificat','warn');return}
  globalThis.ensureProjectDossier(p);
  const i=Number(index);
  if(!Number.isFinite(i)||i<0||i>=p.dossier.length){globalThis.toast('Înregistrarea nu a fost găsită','warn');return}
  const row=p.dossier[i];
  if(!row||!row.custom){globalThis.toast('Poți șterge doar notele proprii','warn');return}
  p.dossier.splice(i,1);
  globalThis.addAct(`Registru „${p.name}": notă personală ștearsă.`);
  globalThis.saveState();
  globalThis.toast('Notă eliminată din registru','ok');
  openProjDossier(projectId);
}
function openProjDossier(id){
  const p=globalThis.S.projects.find(x=>x.id===id);if(!p)return;
  globalThis.ensureProjectDossier(p);
  const mt=p.monthly||{progress:0,contractorPerf:60,changeOrders:0};
  const tend=globalThis.S.tenders.filter(t=>t.projectId===p.id);
  const entries=p.dossier.slice(0,12);
  const categories=projectCategoriesMap();
  const pCat=globalThis.projectCategoryKey(p);
  const pCatLabel=(categories[pCat]?.label)||'Diverse';
  const q=globalThis.getProjectQualityDisplayData?globalThis.getProjectQualityDisplayData(p):null;
  const cov=globalThis.projectTenderCoverageSummary?globalThis.projectTenderCoverageSummary(p):null;
  const sumLines=[['Categorie',pCatLabel],['Progres',`${mt.progress.toFixed(0)}%`],['Performanță contractor',String(mt.contractorPerf??'-')],['Modificări suplimentare (contract)',String(mt.changeOrders??0)],['Licitații asociate',String(tend.length)]];
  if(q){
    sumLines.push(['Scor integritate',`${q.integrity}/100`],['Scor livrare',`${q.delivery}/100`],['Scor capacitate',`${q.capacity}/100`],['Indicatori de risc',String(q.redFlags)]);
  }
  if(cov&&globalThis.projectUsesTenderFlow(p)){
    sumLines.push(['Acoperire licitații (total)',`${cov.anyPct}%`],['Acoperire adjudecat/executat',`${cov.awardedPct}% (minim ${cov.minAwardedPct}%)`]);
  }
  const summaryHtml=`<div class="dyn-sumcard">${sumLines.map(([k,v])=>`<div class="gline"><span class="gk">${globalThis.escapeHtml(k)}</span><span class="gv">${globalThis.escapeHtml(v)}</span></div>`).join('')}</div>`;
  const tenderRows=tend.map(t=>{const bits=[t.winner?`Câștigător: ${t.winner}`:null,t.bids?.length?`${t.bids.length} oferte`:null,t.auditRisk!=null?`Risc audit: ${t.auditRisk}%`:null,t.evalSummary?String(t.evalSummary).slice(0,160)+(String(t.evalSummary).length>160?'…':'') :null].filter(Boolean);const det=bits.length?bits.join(' · '):'-';return`<tr><td>${globalThis.escapeHtml(t.name)}</td><td class="dyn-nowrap"><span class="badge ${globalThis.tsBadge(t.status)}">${globalThis.escapeHtml(globalThis.tsLabel(t.status))}</span></td><td class="dyn-muted">${globalThis.escapeHtml(det)}</td><td class="dyn-num">${globalThis.escapeHtml(globalThis.fRON(t.budget))}</td></tr>`;}).join('');
  const tenderBlock=tend.length?`<div class="dyn-tablewrap"><table class="dyn-table" role="grid" aria-label="Licitații asociate proiectului"><thead><tr><th scope="col">Procedură</th><th scope="col">Stadiu</th><th scope="col">Detalii</th><th scope="col" class="dyn-num">Buget</th></tr></thead><tbody>${tenderRows}</tbody></table></div>`:`<div class="dyn-empty" role="status">Nu există licitații legate de acest proiect. Le poți publica din secțiunea <strong>Licitații</strong>.</div>`;
  const canEditReg=!projectIsFinalized(p);
  const docRows=entries.map((d,i)=>{const badge=d.custom?`<span class="badge bk" style="font-size:9px;vertical-align:middle;margin-right:6px">Notă proprie</span>`:'';const delBtn=d.custom&&canEditReg?`<button type="button" class="btn btn-d btn-sm" style="flex-shrink:0;align-self:flex-start" onclick="removeProjDossierCustomEntry(${p.id},${i})" title="Șterge nota din registru">✕ Șterge</button>`:'';const noteCell=`<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;box-sizing:border-box"><span style="flex:1;min-width:0;line-height:1.45">${badge}${globalThis.escapeHtml(d.txt||'')}</span>${delBtn}</div>`;return`<tr><td class="dyn-muted dyn-nowrap">${globalThis.escapeHtml(d.t||'-')}</td><td style="width:100%">${noteCell}</td></tr>`;}).join('');
  const docBlock=entries.length?`<div class="dyn-tablewrap"><table class="dyn-table" role="grid" aria-label="Registru electronic proiect"><thead><tr><th scope="col" class="dyn-nowrap" style="width:30%">Data</th><th scope="col">Notă / eveniment</th></tr></thead><tbody>${docRows}</tbody></table></div>`:`<div class="dyn-empty" role="status">Încă nu există linii în registru. Ele se adaugă la <strong>avansarea simulării lunare</strong>, din acțiuni automate sau cu formularul de mai jos.</div>`;
  const addForm=!projectIsFinalized(p)?`<div class="dos-reg-note-card" role="region" aria-labelledby="dos-reg-note-h"><p class="tsm bold mb8" id="dos-reg-note-h">Notă proprie în registru</p><div class="fg mt0"><label for="dos-custom-date">Dată afișată în registru (opțional)</label><input type="date" id="dos-custom-date" class="card-inp"/></div><div class="fg mb0"><label for="dos-custom-txt">Adaugă notă în registru</label><textarea id="dos-custom-txt" maxlength="100" rows="2" placeholder="Scurt… (ex: vizită teren)" style="width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:var(--r);font-family:var(--font);font-size:14px;resize:vertical;box-sizing:border-box"></textarea><p class="tsm tmut mt6" style="line-height:1.45">Max. <strong>100</strong> caractere. Apare sus în listă, marcată ca <strong>Notă proprie</strong>. Poți șterge notele proprii din tabelul de mai sus.</p></div><button type="button" class="btn btn-s btn-sm mt8" onclick="addProjDossierCustomEntry(${p.id})">Adaugă în registru</button></div>`:`<p class="tsm tmut mt6" style="line-height:1.5">Proiect <strong>finalizat</strong>. Registrul este doar în consultare.</p>`;
  globalThis.dlgOpen(`Dosar electronic: ${globalThis.escapeHtml(p.name)}`,'Istoric procedural și operațional',`<div class="dyn-stack"><section class="dyn-section" aria-labelledby="dos-sum-h"><h4 class="dyn-section-h" id="dos-sum-h">Rezumat</h4>${summaryHtml}</section><section class="dyn-section" aria-labelledby="dos-tend-h"><h4 class="dyn-section-h" id="dos-tend-h">Licitații asociate (${tend.length})</h4>${tenderBlock}</section><section class="dyn-section" aria-labelledby="dos-reg-h"><h4 class="dyn-section-h" id="dos-reg-h">Registru electronic</h4>${p.dossier.length>12?`<p class="tsm tmut mb8" style="margin-top:-4px">Afișate ultimele 12 înregistrări din ${p.dossier.length}.</p>`:''}${docBlock}${addForm}</section></div>`,`<button type="button" class="btn btn-p" onclick="dlgClose()">Închide</button>`);
}
function parseLooseRONAmount(raw){
  let s=String(raw??'').trim().replace(/[\s\u00a0\u202f]/g,'');
  if(!s)return NaN;
  const hasComma=s.includes(','),hasDot=s.includes('.');
  if(hasComma&&hasDot){if(s.lastIndexOf(',')>s.lastIndexOf('.'))s=s.replace(/\./g,'').replace(',','.');else s=s.replace(/,/g,'');}
  else if(hasComma&&!hasDot){const parts=s.split(',');if(parts.length===2&&parts[1].length<=2&&/^\d+$/.test(parts[0].replace(/\./g,''))&&/^\d+$/.test(parts[1]))s=parts[0].replace(/\./g,'')+'.'+parts[1];else s=s.replace(/,/g,'');}
  else if(hasDot&&!hasComma){const parts=s.split('.');if(parts.length>=2){const last=parts[parts.length-1];if(/^\d{3}$/.test(last)&&parts.every(p=>/^\d{1,3}$/.test(p)))s=parts.join('');}}
  const n=Number(s);return Number.isFinite(n)&&n>0?Math.round(n):NaN;
}
function readProjectMoneyEl(el){
  if(!el)return NaN;
  const raw=String(el.value??'').trim();
  if(el.type==='number'){const vn=el.valueAsNumber;if(Number.isFinite(vn)&&vn>0)return Math.round(vn);if(!raw)return NaN;}
  else if(!raw)return NaN;
  return parseLooseRONAmount(raw);
}
function npClearNewProjFieldHighlights(){for(const id of['np-n','np-rv','np-dv','np-d','np-s']){const e=globalThis.$(id);if(!e)continue;e.classList.remove('np-field-invalid');e.removeAttribute('aria-invalid');}}
function npTouchNewProjField(id){const e=globalThis.$(id);if(!e)return;e.classList.remove('np-field-invalid');e.removeAttribute('aria-invalid');}
function npMarkNewProjInvalid(ids){npClearNewProjFieldHighlights();for(const id of ids){const e=globalThis.$(id);if(!e)continue;e.classList.add('np-field-invalid');e.setAttribute('aria-invalid','true');}}
function npUpdateRiskPreview(){
  const out=globalThis.$('np-risk-preview');
  if(!out)return;
  const rv=readProjectMoneyEl(globalThis.$('np-rv'));
  const dv=readProjectMoneyEl(globalThis.$('np-dv'));
  if(!Number.isFinite(rv)||!Number.isFinite(dv)||dv<rv){
    out.innerHTML='<span class="badge bk">Completează valorile pentru previzualizare</span>';
    return;
  }
  const tmp={
    id:-1,
    projCategory:globalThis.$('np-cat')?.value||'diverse',
    declaredValue:dv,
    realValue:rv,
    lateF:false,
    lateS:false,
    procurementMode:globalThis.$('np-proc')?.value==='direct'?'direct':'licitatie',
    monthly:{contractorPerf:60,changeOrders:0,progress:0},
  };
  const q=globalThis.getProjectQualityDisplayData?globalThis.getProjectQualityDisplayData(tmp):null;
  if(!q){
    out.innerHTML='<span class="badge bk">Previzualizare indisponibilă</span>';
    return;
  }
  out.innerHTML=`<span class="badge bk">Integritate ${q.integrity}</span><span class="badge bk">Livrare ${q.delivery}</span><span class="badge bk">Capacitate ${q.capacity}</span><span class="badge bb">Indicatori risc ${q.redFlags}</span>`;
}
function openNewProjDlg(){
  const inp='width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:var(--r);font-family:var(--font);font-size:14px;outline:none';
  globalThis.dlgOpen('Proiect Public Nou','Conform HG nr. [REDACTAT]/2024 privind achizițiile publice',
    `<div class="fg"><label for="np-n">Denumire proiect</label><input type="text" id="np-n" placeholder="ex: Reabilitare stradă principală" style="${inp}" autocomplete="off" oninput="npTouchNewProjField('np-n')"/></div>
    <div class="fg-row"><div class="fg"><label for="np-rv">Valoare reală proiect (RON)</label><input type="number" id="np-rv" inputmode="decimal" min="1" step="1" placeholder="ex: 980000" style="${inp}" oninput="npTouchNewProjField('np-rv');npUpdateRiskPreview()"/></div>
      <div class="fg"><label for="np-dv">Valoare declarată proiect (RON)</label><input type="number" id="np-dv" inputmode="decimal" min="1" step="1" placeholder="ex: 1800000" style="${inp}" oninput="npTouchNewProjField('np-dv');npUpdateProcHelper();npUpdateRiskPreview()"/></div></div>
    <div class="fg"><label for="np-d">Dată limită</label><input type="date" id="np-d" style="${inp}" onchange="npTouchNewProjField('np-d')"/></div>
    <div class="fg"><label for="np-cat">Categorie proiect</label><select id="np-cat" style="${inp}" onchange="npUpdateProcHelper();npUpdateRiskPreview()">${Object.keys(projectCategoriesMap()).map(k=>`<option value="${k}"${k==='diverse'?' selected':''}>${globalThis.escapeHtml(projectCategoriesMap()[k].label)}</option>`).join('')}</select>
      <p class="tsm tmut mt6" style="line-height:1.5">Alege <strong>domeniul și complexitatea</strong> (șantier, drumuri, consumabile, IT…): categoria ajustează <strong>moderat</strong> șansele relative la finalizare; ponderea mare vine din <strong>valori</strong>, <strong>termene</strong> și (pe licitații) din <strong>corupție simulată</strong> (inclusiv câștigători „de casă”). Proiectele foarte oneste (diferență declarat-real max. 2%, fără întârziere la finalizare, fără câștigător „de casă”) nu pot ieși „De mântuială”. Detalii în <strong>Ghid &amp; reguli</strong>.</p></div>
    <div class="fg mb6"><label for="np-proc">Procedură principală</label><select id="np-proc" style="${inp}" onchange="npUpdateProcHelper();npUpdateRiskPreview()"><option value="licitatie">Licitație publică</option><option value="direct">Achiziție directă</option></select>
      <p id="np-proc-help" class="tsm tmut mt6" style="line-height:1.5"></p></div>
    <details class="hig-acc mt8" open><summary class="tsm" style="cursor:pointer;font-weight:700">Previzualizare risc (live)</summary><div id="np-risk-preview" class="mt8" style="display:flex;gap:6px;flex-wrap:wrap"><span class="badge bk">Completează valorile pentru previzualizare</span></div></details>
    <div class="fg mb0"><label for="np-s" class="mt6">Status inițial</label><select id="np-s" style="${inp}" onchange="npTouchNewProjField('np-s')"><option value="planned">Planificat</option><option value="in_progress">În desfășurare</option></select></div>`,
    `<button class="btn btn-f" onclick="dlgClose()">Anulează</button><button class="btn btn-p" onclick="addProj()">Adaugă Proiect</button>`
  );
  npClearNewProjFieldHighlights();globalThis.npUpdateProcHelper();npUpdateRiskPreview();requestAnimationFrame(()=>{try{globalThis.$('np-n')?.focus();}catch(e){}});
}
function addProj(){
  const nEl=globalThis.$('np-n'),dEl=globalThis.$('np-d'),sEl=globalThis.$('np-s'),rvEl=globalThis.$('np-rv'),dvEl=globalThis.$('np-dv');
  const n=nEl?.value?.trim()??'',d=(dEl?.value??'').trim(),s=sEl?.value==='in_progress'?'in_progress':'planned';
  const procMode=globalThis.$('np-proc')?.value==='direct'?'direct':'licitatie';
  const rv=readProjectMoneyEl(rvEl),dv=readProjectMoneyEl(dvEl);
  if(!n){npMarkNewProjInvalid(['np-n']);globalThis.toast('Introdu denumirea proiectului','err');try{nEl?.focus();}catch(e){}return}
  if(!d){npMarkNewProjInvalid(['np-d']);globalThis.toast('Alege data limită','err');try{dEl?.focus();}catch(e){}return}
  const dTest=new Date(d+'T12:00:00');if(Number.isNaN(dTest.getTime())){npMarkNewProjInvalid(['np-d']);globalThis.toast('Data limită nu este validă','err');return}
  if(!Number.isFinite(rv)){npMarkNewProjInvalid(['np-rv']);globalThis.toast('Valoarea reală trebuie să fie un număr pozitiv (poți folosi și formate cu puncte sau virgulă la lipire)','err');try{rvEl?.focus();}catch(e){}return}
  if(!Number.isFinite(dv)){npMarkNewProjInvalid(['np-dv']);globalThis.toast('Valoarea declarată trebuie să fie un număr pozitiv (poți folosi și formate cu puncte sau virgulă la lipire)','err');try{dvEl?.focus();}catch(e){}return}
  if(dv<rv){npMarkNewProjInvalid(['np-rv','np-dv']);globalThis.toast('Valoarea declarată trebuie să fie cel puțin egală cu valoarea reală','err');return}
  const categories=projectCategoriesMap();
  const cat=globalThis.$('np-cat')?.value;const projCategory=cat&&categories[cat]?cat:'diverse';
  const limitForNewProject=globalThis.law98DirectLimitForProject({projCategory,declaredValue:dv,budget:dv});
  if(procMode==='direct'&&dv>limitForNewProject){globalThis.toast(`Achiziția directă este permisă până la ${globalThis.fRON(limitForNewProject)} pentru categoria selectată (Legea 98/2016). Alege „Licitație publică”.`,'warn');return}
  const caps=globalThis.getSubscriptionCaps(),cnt=globalThis.countProjSlots();
  if(s==='planned'&&cnt.pending>=caps.pending){globalThis.openLimitDlg('Limită proiecte planificate',`Abonamentul curent permite maximum ${caps.pending} proiecte în starea „planificat".`);return}
  if(s==='in_progress'&&cnt.ongoing>=caps.ongoing){globalThis.openLimitDlg('Limită proiecte în desfășurare',`Abonamentul curent permite maximum ${caps.ongoing} proiecte „în desfășurare".`);return}
  const b=dv;const newP={id:globalThis.S.npid++,name:n,budget:b,realValue:rv,declaredValue:dv,status:s,quality:null,bet:null,due:d,lateS:false,lateF:false,projCategory,procurementMode:procMode};
  globalThis.seedDossierIfEmpty(newP,'Proiect creat. Înregistrare inițială în registrul electronic.');
  globalThis.S.projects.push(newP);
  globalThis.dlgClose();globalThis.renderProj();globalThis.renderDash();globalThis.updWandProjectOptions();globalThis.addAct(`Proiect nou adăugat: „${n}" (${globalThis.fRON(dv)} declarat / ${globalThis.fRON(rv)} real).`);
  globalThis.toast(`Proiect adăugat: ${n}`,'ok');
  globalThis.scheduleSearchReindex?.();
}
function initProjectsFeature(){
  globalThis.projectIsFinalized=projectIsFinalized;
  globalThis.filterProj=filterProj;
  globalThis.startProj=startProj;
  globalThis.openProjManageDlg=openProjManageDlg;
  globalThis.saveProjManage=saveProjManage;
  globalThis.addProjDossierCustomEntry=addProjDossierCustomEntry;
  globalThis.removeProjDossierCustomEntry=removeProjDossierCustomEntry;
  globalThis.openProjDossier=openProjDossier;
  globalThis.parseLooseRONAmount=parseLooseRONAmount;
  globalThis.readProjectMoneyEl=readProjectMoneyEl;
  globalThis.npClearNewProjFieldHighlights=npClearNewProjFieldHighlights;
  globalThis.npTouchNewProjField=npTouchNewProjField;
  globalThis.npMarkNewProjInvalid=npMarkNewProjInvalid;
  globalThis.npUpdateRiskPreview=npUpdateRiskPreview;
  globalThis.openNewProjDlg=openNewProjDlg;
  globalThis.addProj=addProj;
}
globalThis.initProjectsFeature=initProjectsFeature;
})();