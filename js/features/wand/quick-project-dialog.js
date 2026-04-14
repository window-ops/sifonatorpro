;(function(){
function projectCategoriesMap(){
  return globalThis.PROJECT_CATEGORIES||{
    diverse:{label:'Diverse'},
    constructii:{label:'Construcții'},
  };
}
function ensureProjectForWand(cb){
  if(globalThis.S.projects.length){cb();return;}
  globalThis.dlgOpen('Bagheta are nevoie de proiect','Nu există proiecte active sau planificate',
    `<p class="tsm tmut mb14">Pentru realism satiric, optimizarea trebuie legată de un proiect. Creează unul rapid acum.</p>
    <div class="fg"><label>Denumire proiect</label><input id="wand-ap-name" placeholder="ex: Canalizare inteligentă cu senzori decorativi" style="width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:var(--r);font-family:var(--font);font-size:14px;outline:none"/></div>
    <div class="fg"><label>Categorie</label><select id="wand-ap-cat" style="width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:var(--r);font-family:var(--font);font-size:14px;outline:none">${Object.keys(projectCategoriesMap()).map(k=>`<option value="${k}"${k==='constructii'?' selected':''}>${globalThis.escapeHtml(projectCategoriesMap()[k].label)}</option>`).join('')}</select></div>
    <div class="fg"><label>Buget (RON)</label><input id="wand-ap-budget" type="number" value="1800000" style="width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:var(--r);font-family:var(--font);font-size:14px;outline:none"/></div>
    <div class="fg"><label>Termen</label><input id="wand-ap-due" type="date" style="width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:var(--r);font-family:var(--font);font-size:14px;outline:none"/></div>`,
    `<button class="btn btn-f" onclick="dlgClose();navigate('proj')">Mai târziu</button>
     <button class="btn btn-p" onclick="createQuickProjForWand()">Creează &amp; Continuă</button>`
  );
}

function createQuickProjForWand(){
  const name=globalThis.$('wand-ap-name')?.value?.trim();
  const budget=parseInt(globalThis.$('wand-ap-budget')?.value||'0',10);
  const due=globalThis.$('wand-ap-due')?.value||new Date(globalThis.nowTs()+1000*60*60*24*90).toISOString().slice(0,10);
  if(!name||!budget){globalThis.toast('Completează datele proiectului','err');return;}
  const caps=globalThis.getSubscriptionCaps(),cnt=globalThis.countProjSlots();
  if(cnt.ongoing>=caps.ongoing){
    globalThis.openLimitDlg('Limită proiecte active',`Nu poți crea încă un proiect în lucru: limita este ${caps.ongoing}.`);
    return;
  }
  const id=globalThis.S.npid++;
  const categories=projectCategoriesMap();
  const wcat=globalThis.$('wand-ap-cat')?.value;
  const projCategory=wcat&&categories[wcat]?wcat:'diverse';
  const qp={id,name,budget,realValue:Math.round(budget*0.66),declaredValue:Math.round(budget*1.22),status:'in_progress',quality:null,bet:null,due,lateS:false,lateF:false,projCategory};
  qp.procurementMode='licitatie';
  globalThis.seedDossierIfEmpty(qp,'Proiect creat din asistent Baghetă.');
  globalThis.S.projects.push(qp);
  globalThis.dlgClose();
  globalThis.updWandProjectOptions(id);
  globalThis.$('w-proj')&&(globalThis.$('w-proj').value=String(id));
  globalThis.renderProj();
  globalThis.renderDash();
  globalThis.toast('Proiect creat și legat de Bagheta Magică','ok');
}

function initWandQuickProjectDialog(){
  globalThis.ensureProjectForWand=ensureProjectForWand;
  globalThis.createQuickProjForWand=createQuickProjForWand;
}
globalThis.initWandQuickProjectDialog=initWandQuickProjectDialog;
})();