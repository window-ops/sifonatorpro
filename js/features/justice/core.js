;(function(){
function triggerDNA(opts){
  const fromDebug=opts&&opts.fromDebug;
  if(!globalThis.S.justice)globalThis.S.justice={stage:'clean',pressure:0,timeline:[],debugPin:false,dnaEscalation:false,anafAuditMessage:'',anafAuditSince:0,anafAuditShowBanner:false};
  const wouldSetAncheta=(globalThis.S.justice?.stage||'clean')==='clean'&&globalThis.S.siphoned>600000;
  if(!fromDebug&&!wouldSetAncheta)return;
  const tDebug=[
    '[DEBUG] Scenariu: factor ridicat și fluxuri atipice. Control ANAF simulat.',
    '[DEBUG] Scenariu: optimizare peste prag. Audit automat.',
    '[DEBUG] Scenariu: redistribuire mare. Dosar deschis în modul test.'
  ];
  const msg=fromDebug
    ?tDebug[Math.floor(Math.random()*tDebug.length)]
    :'Redistribuirea cumulată a depășit pragul critic. Cazul intră în investigație (Sistem Judiciar).';
  globalThis.$('dna-alert-txt')&&(globalThis.$('dna-alert-txt').textContent=msg);
  globalThis.$('dna-alert-box')?.classList.remove('hid');
  globalThis.S.justice.anafAuditMessage=msg;
  globalThis.S.justice.anafAuditSince=globalThis.nowTs();
  globalThis.S.justice.anafAuditShowBanner=true;
  if(fromDebug){
    globalThis.S.justice.debugPin=true;
    globalThis.S.justice.dnaEscalation=false;
    globalThis.S.justice.stage='ancheta';
    globalThis.S.justice.pressure=65;
    globalThis.$('nbj')?.classList.remove('hid');
  }else if(wouldSetAncheta){
    globalThis.S.justice.dnaEscalation=true;
    globalThis.S.justice.stage='ancheta';
    globalThis.$('nbj')?.classList.remove('hid');
  }
  if(Array.isArray(globalThis.S.justice.timeline)){
    const pSnap=Math.min(100,(globalThis.S.justice.pressure||0)+18);
    globalThis.justiceTimelinePush({stage:'alerta_fiscal',pressure:pSnap,detail:msg});
  }
  globalThis.saveState();
  globalThis.navigate('dash');
  globalThis.toast('🚨 Situație judiciară gravă: vezi tabloul de bord → Sistem Judiciar','dna');
  globalThis.renderJust();globalThis.renderOps();globalThis.renderDash();
}
function maybeTriggerInvestigationOnSiphonCross(prevSiphoned){
  if(prevSiphoned<=600000&&globalThis.S.siphoned>600000&&(globalThis.S.justice?.stage||'clean')==='clean')
    setTimeout(()=>triggerDNA(),900);
}

function updJudiciaryRisk(){
  const fundRisk=Math.min(70,Math.round(globalThis.S.siphoned/250000));
  const justiceRisk=(globalThis.S.justice?.stage==='clean'||globalThis.S.justice?.stage==='monitorizare')?0:(globalThis.S.justice?.stage==='ancheta'?25:40);
  const sessionRisk=globalThis.S.activeSession&&globalThis.S.activeSession.factor>=0.7?12:0;
  const anafRisk=globalThis.S.justice?.anafAuditShowBanner?22:(globalThis.S.justice?.anafAuditMessage?10:0);
  globalThis.S.judiciaryRisk=Math.min(100,fundRisk+justiceRisk+sessionRisk+anafRisk);
}
function dismissAnafAuditBanner(){
  if(globalThis.S.justice)globalThis.S.justice.anafAuditShowBanner=false;
  globalThis.saveState();
  globalThis.renderJust();globalThis.renderOps();globalThis.renderDash();
}
function simAncheta(){
  globalThis.S.justice.debugPin=true;
  globalThis.S.justice.dnaEscalation=false;
  globalThis.S.justice.stage='ancheta';
  globalThis.S.justice.pressure=65;
  globalThis.$('nbj')?.classList.remove('hid');globalThis.renderJust();globalThis.renderOps();
  globalThis.toast('🚨 Investigație DNA declanșată!','err');
  globalThis.updDebug();
}
function simPuscarie(){
  globalThis.S.justice.debugPin=true;
  globalThis.S.justice.dnaEscalation=false;
  globalThis.S.justice.stage='recurs';
  globalThis.S.justice.pressure=95;
  globalThis.$('nbj')?.classList.remove('hid');globalThis.renderJust();globalThis.renderOps();
  globalThis.toast('⛓️ Condamnat! Ai nevoie de ajutor juridic','err');
  globalThis.updDebug();
}
function manipJust(type){
  if(!globalThis.tierAllowsJudicialProtection()){
    globalThis.openLimitDlg('Protecție indisponibilă','Manipularea sistemului judiciar nu este inclusă în limitele gratuite. Un abonament plătit (ex. Basic) o poate include.','purchase');
    return;
  }
  const cost=globalThis.manipCost(type==='ancheta'?'ancheta':'puscarie');
  if(globalThis.S.rep<cost){globalThis.toast(`Insuficiente puncte (${globalThis.S.rep}/${cost})`,'err');return}
  globalThis.dlgOpen('⚖️ Manipulare Sistem Judiciar',
    `<div style="background:linear-gradient(135deg,#1a0000,#2d0000);border:1px solid var(--red);border-radius:var(--r);padding:13px 15px;margin-bottom:13px;color:#fff">
      <div style="color:#ff6b6b;font-weight:700;margin-bottom:3px">⚠️ Satirizează fenomenul real</div>
      <div style="font-size:12px;opacity:.7">Parodiază mecanisme prin care politicieni au scăpat de condamnări prin prescripție, influență sau modificări legislative. Ex: cazul Marian Vanghelie, dosar 11 ani, prescris în 2025.</div>
    </div>
    <p class="tsm mb14">Vei „cheltui" <strong>${cost} puncte de reputație</strong>. Dupa acțiune vei rămâne cu <strong>${globalThis.S.rep-cost}</strong> puncte.</p>
    <div style="background:var(--bg);padding:11px;border-radius:var(--r);font-size:13px">
      <div class="flex" style="justify-content:space-between;padding:3px 0"><span>Influență politică</span><span class="tsm tmut">activată</span></div>
      <div class="flex" style="justify-content:space-between;padding:3px 0"><span>Avocați creativi</span><span class="tsm tmut">2 echipe</span></div>
      <div class="flex" style="justify-content:space-between;padding:3px 0"><span>Interpretare „flexibilă" Cod Penal</span><span class="tsm tmut">în curs</span></div>
    </div>`,
    `<button class="btn btn-f" onclick="dlgClose()">Renunț</button>
     <button class="btn btn-d" onclick="execManip(${cost})">⚖️ Confirmă Manipularea</button>`
  );
}
function execManip(cost){
  globalThis.S.rep=Math.max(0,globalThis.S.rep-cost);
  globalThis.S.repH.unshift({t:`Cheltuiți ${cost} puncte: manipulare sistem judiciar`,d:-cost});
  if(globalThis.S.repH.length>20)globalThis.S.repH.pop();
  globalThis.S.justice.stage='clean';globalThis.S.justice.pressure=0;globalThis.S.justice.debugPin=false;globalThis.S.justice.dnaEscalation=false;
  globalThis.S.justice.anafAuditMessage='';globalThis.S.justice.anafAuditSince=0;globalThis.S.justice.anafAuditShowBanner=false;
  globalThis.justiceTimelinePush({stage:'clean',pressure:0,detail:`Dosar închis după „manipulare” judiciară (cheltuială: ${cost} puncte reputație).`});
  globalThis.$('nbj')?.classList.add('hid');
  globalThis.dlgClose();globalThis.renderJust();globalThis.renderOps();globalThis.updRep();
  setTimeout(()=>{
    globalThis.dlgOpen('🎉 Dosarul a dispărut!','Sistemul judiciar a funcționat… în favoarea ta',
      `<div style="text-align:center;padding:18px 0">
        <div style="font-size:50px;margin-bottom:10px">🗑️</div>
        <p class="bold" style="font-size:16px;margin-bottom:8px">Dosar închis din lipsă de probe</p>
        <p class="tsm tmut lh165">Datorită unor <em>„circumstanțe procedurale neprevăzute"</em> și a <em>„prescripției termenelor legale"</em>, dosarul a fost închis definitiv.</p>
      </div>`,
      `<button class="btn btn-p btn-full" onclick="dlgClose()">Am înțeles</button>`
    );
    globalThis.addAct(`Dosar penal „închis" prin cheltuirea a ${cost} puncte de reputație.`);
  },300);
  globalThis.updDebug();
}

function initJustice(){
  globalThis.triggerDNA=triggerDNA;
  globalThis.maybeTriggerInvestigationOnSiphonCross=maybeTriggerInvestigationOnSiphonCross;
  globalThis.updJudiciaryRisk=updJudiciaryRisk;
  globalThis.dismissAnafAuditBanner=dismissAnafAuditBanner;
  globalThis.simAncheta=simAncheta;
  globalThis.simPuscarie=simPuscarie;
  globalThis.manipJust=manipJust;
  globalThis.execManip=execManip;
}
globalThis.initJustice=initJustice;
})();