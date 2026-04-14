;(function(){
const ANAF_DOSAR_STEP_DEFS=[
  {label:'Doc. 1: Fișă înregistrare dosar (CNX)',bureau(u,t,ef){return`Dosarul CNX/2025/EF-${ef} a fost înregistrat în registrul unic. Ați primit număr unic de urmărire; termenul estimat rămâne „în curs de alocare”.`}},
  {label:'Doc. 2: Notă rutare și repartizare pe cozi',bureau(){return'Notă de rutare: fluxul a fost repartizat electronic (ghișeu → coadă regională → eșantion de control). Nu este necesară nicio acțiune suplimentară din partea dumneavoastră în acest moment.'}},
  {label:'Doc. 3: Verificare tehnică fișiere XML (metadate / schemă)',bureau(){return'Verificare tehnică automată a pachetului XML: structura respectă schema declarată, iar metadatele se potrivesc cu datele din cerere.'}},
  {label:'Doc. 4: Referat compartiment verificări încrucișate',bureau(){return'Compartimentul de verificări încrucișate a constat că valorile declarate se încadrează în limitele procedurale simulate; se întocmește referatul intern.'}},
  {label:'Doc. 5: Înregistrare semnătură calificată',bureau(){return'Semnătura calificată este înscrisă în registrul de evidență al dosarului și este asociată certificatului depus prin Șpagafon. Nu există încă autorizare pentru emiterea unei chei către platforme externe.'}},
  {label:'Doc. 6: Raport conformitate SAF-T / e-Factura și autorizare token',bureau(){return'Controlul de conformitate SAF-T și e-Factura este încheiat fără blocaje. Ultimele verificări interne fiind îndeplinite, se autorizează emiterea tokenului de sincronizare pentru SifonatorPRO.'}},
];
const ANAF_DOSAR_TICKS_NEED=ANAF_DOSAR_STEP_DEFS.length;
const ANAF_DISCARD_PHRASE_REQUIRED='STERGERE CHEIE API ANAF SYNC';
const ANAF_DISCARD_KEY_SUFFIX_LEN=8;
let _anafSyncPortalStep=1;
let _anafDiscardSub=0;
let _anafDiscardPin='';

function isAnafSyncLinked(){globalThis.ensureIntegrations();return globalThis.S.integrations.anafSync.linked===true;}
function isAnafSyncAuditVisible(){
  globalThis.ensureIntegrations();
  const x=globalThis.S.integrations.anafSync;
  return!!(x&&x.linked===true&&String(x.apiKey||'').trim().length>0);
}
function isDnaInvestigationBlockingAnafSync(){
  const j=globalThis.S.justice;
  if(!j)return false;
  if(j.dnaEscalation)return true;
  const s=j.stage||'clean';
  return s==='ancheta'||s==='audiere'||s==='recurs';
}
function anafDosarStepDetailText(tick,u){
  const t=Math.max(0,Math.min(tick|0,ANAF_DOSAR_TICKS_NEED-1));
  const ef=1000+(Array.from(String(u.jud||'')).reduce((s,c)=>s+c.charCodeAt(0),t*7919)%8000);
  const row=ANAF_DOSAR_STEP_DEFS[t];
  return row?row.bureau(u,t,ef):'';
}
function generateAnafSyncApiKey(){
  const a=Array.from({length:22},()=>'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random()*36)]).join('');
  return 'asf_live_'+a;
}
function openAnafSyncPortal(){
  globalThis.ensureIntegrations();
  const el=globalThis.$('anaf-sync-portal');
  if(!el)return;
  const a=globalThis.S.integrations.anafSync;
  _anafDiscardSub=0;
  _anafDiscardPin='';
  if(a.linked)_anafSyncPortalStep='admin';
  else if(a.pendingCertCode)_anafSyncPortalStep=2;
  else if(a.wizardPhase>=3){
    if(a.wizardPhase===3&&a.draftKey&&a.dosarTicks<ANAF_DOSAR_TICKS_NEED){
      if(!String(a.apiKey||'').trim())a.apiKey=a.draftKey;
      a.draftKey='';
      globalThis.saveState();
    }
    _anafSyncPortalStep=3;
    if(a.dosarTicks>=ANAF_DOSAR_TICKS_NEED&&a.draftKey){
      _anafSyncPortalStep=5;
      if(a.wizardPhase<4){a.wizardPhase=4;globalThis.saveState();}
    }
  }else if(a.draftKey&&a.wizardPhase>=4){
    _anafSyncPortalStep=5;
  }else{
    if(a.draftKey){
      if(a.wizardPhase<4&&!String(a.apiKey||'').trim())a.apiKey=a.draftKey;
      a.draftKey='';
      globalThis.saveState();
    }
    _anafSyncPortalStep=1;
  }
  el.classList.remove('hid');
  el.setAttribute('aria-hidden','false');
  renderAnafSyncPortalBody();
}
function closeAnafSyncPortal(){
  globalThis.$('anaf-sync-portal')?.classList.add('hid');
  globalThis.$('anaf-sync-portal')?.setAttribute('aria-hidden','true');
  _anafDiscardSub=0;
  _anafDiscardPin='';
}
function renderAnafSyncPortalBody(){
  const body=globalThis.$('anaf-sync-body');
  if(!body)return;
  globalThis.ensureIntegrations();
  const a=globalThis.S.integrations.anafSync;
  const u=globalThis.S.user;
  if(!a.linked&&_anafSyncPortalStep===5){
    const tokenAllowed=a.wizardPhase>=4&&String(a.draftKey||'').trim();
    if(!tokenAllowed){
      if(a.pendingCertCode)_anafSyncPortalStep=2;
      else if(a.wizardPhase>=3)_anafSyncPortalStep=3;
      else _anafSyncPortalStep=1;
    }
  }
  if(_anafSyncPortalStep==='admin'&&a.linked){
    if(_anafDiscardSub===1){
      body.innerHTML=`<span class="anaf-seal">Ștergere cheie API · pas 1/4</span>
        <div class="anaf-warn">Eliminarea cheii ANAF Sync din SifonatorPRO întrerupe fluxul e-Factura / trasabilitatea extinsă până la o nouă înregistrare completă.</div>
        <p class="tsm u-lh155" style="margin-top:10px">Confirmați că ați înțeles consecințele, la fel ca la depunerea inițială a cererii.</p>
        <label style="display:flex;gap:10px;align-items:flex-start;margin-top:12px;cursor:pointer">
          <input type="checkbox" id="anaf-discard-decl-1"/>
          <span>Declar că solicit <strong>ștergerea voluntară</strong> a cheii API stocate în platformă și accept că nu voi mai putea folosi integrarea până la reluarea fluxului.</span>
        </label>
        <label style="display:flex;gap:10px;align-items:flex-start;margin-top:10px;cursor:pointer">
          <input type="checkbox" id="anaf-discard-decl-2"/>
          <span>Confirm că acțiunea este <strong>intenționată</strong>, nu rezultatul unei erori de operare, și că am luat la cunoștință că datele fiscale simulate nu mai sunt transmise către ANAF Sync după ștergere.</span>
        </label>
        <label style="display:flex;gap:10px;align-items:flex-start;margin-top:10px;cursor:pointer">
          <input type="checkbox" id="anaf-discard-decl-3"/>
          <span>Accept că această procedură este înregistrată în <strong>jurnalul de audit</strong> al aplicației, în spiritul unei API guvernamentale.</span>
        </label>
        <p class="tsm tmut" style="margin-top:10px">La pasul final vi se va cere sufixul cheii. Puteți copia cheia acum în clipboard:</p>
        <div class="anaf-actions">
          <button type="button" class="anaf-btn-sec" onclick="copyAnafSyncApiKey()">Copiază cheia curentă în clipboard</button>
        </div>
        <div class="anaf-actions">
          <button type="button" class="anaf-btn-pri" onclick="anafSyncDiscardStep1Continue()">Continuă către verificarea Șpagafon</button>
          <button type="button" class="anaf-btn-sec" onclick="anafSyncDiscardCancel()">Renunță</button>
        </div>`;
      return;
    }
    if(_anafDiscardSub===2){
      body.innerHTML=`<span class="anaf-seal">Ștergere cheie API · pas 2/4</span>
        <p>Am expediat un <strong>PIN de confirmare</strong> pe linia Șpagafon. Valabilitate: <strong>15 minute</strong>. Introduceți codul pentru a dovedi controlul asupra canalului declarat.</p>
        <label style="display:block;font-weight:700;margin-top:8px">PIN confirmare ștergere</label>
        <input type="text" class="anaf-inp verif-code-inp" id="anaf-discard-pin-inp" maxlength="6" placeholder="000000" autocomplete="one-time-code" inputmode="numeric" pattern="[0-9]*" oninput="this.value=this.value.replace(/\\D/g,'').slice(0,6)"/>
        <div class="anaf-actions">
          <button type="button" class="anaf-btn-pri" onclick="anafSyncDiscardVerifyPin()">Validează PIN-ul</button>
          <button type="button" class="anaf-btn-sec" onclick="anafSyncDiscardCancel()">Renunță</button>
        </div>
        <p class="tsm tmut" style="margin-top:10px">Dacă nu vedeți SMS-ul, deschideți Șpagafon și folosiți butonul din mesaj.</p>`;
      return;
    }
    if(_anafDiscardSub===3){
      body.innerHTML=`<span class="anaf-seal">Ștergere cheie API · pas 3/4</span>
        <div class="anaf-warn">Introduceți <strong>exact</strong> fraza de mai jos (majuscule, fără ghilimele).</div>
        <p class="tsm" style="font-weight:800;margin:8px 0">Text obligatoriu: <code style="background:#e8eef4;padding:2px 6px">${globalThis.escapeHtml(ANAF_DISCARD_PHRASE_REQUIRED)}</code></p>
        <label style="display:block;font-weight:700;margin-top:8px">Confirmare tastată</label>
        <input type="text" class="anaf-inp" id="anaf-discard-phrase-inp" autocomplete="off" placeholder="${globalThis.escapeHtml(ANAF_DISCARD_PHRASE_REQUIRED)}"/>
        <div class="anaf-actions">
          <button type="button" class="anaf-btn-pri" onclick="anafSyncDiscardPhraseCheck()">Continuă</button>
          <button type="button" class="anaf-btn-sec" onclick="anafSyncDiscardCancel()">Renunță</button>
        </div>`;
      return;
    }
    if(_anafDiscardSub===4){
      body.innerHTML=`<span class="anaf-seal">Ștergere cheie API · pas 4/4</span>
        <p>Ultimul pas: dovediți că dețineți cheia curentă. Introduceți <strong>exact ultimele ${ANAF_DISCARD_KEY_SUFFIX_LEN} caractere</strong> ale cheii API (fără spații), apoi bifați declarația finală. Folosiți copierea din pasul 1 dacă nu le aveți la îndemână.</p>
        <label style="display:block;font-weight:700;margin-top:8px">Ultimele ${ANAF_DISCARD_KEY_SUFFIX_LEN} caractere ale cheii</label>
        <input type="text" class="anaf-inp" id="anaf-discard-suffix-inp" maxlength="32" autocomplete="off" spellcheck="false" style="font-family:var(--mono);font-size:12px"/>
        <label style="display:flex;gap:10px;align-items:flex-start;margin-top:12px;cursor:pointer">
          <input type="checkbox" id="anaf-discard-final-ack"/>
          <span>Declar că am introdus sufixul corect și că solicit <strong>ștergerea definitivă</strong> a cheii din SifonatorPRO (rămâne posibilă o reconectare ulterioară prin portal).</span>
        </label>
        <div class="anaf-actions">
          <button type="button" class="anaf-btn-pri" style="background:linear-gradient(180deg,#c01c28,#8b1420)" onclick="anafSyncDiscardFinalize()">Șterge cheia din platformă</button>
          <button type="button" class="anaf-btn-sec" onclick="anafSyncDiscardCancel()">Renunță</button>
        </div>`;
      return;
    }
    body.innerHTML=`<span class="anaf-seal">Cont sincronizat</span>
      <p>Legătura <strong>ANAF Sync</strong> este activă. Cheia de sincronizare pentru SifonatorPRO și alte aplicații similare:</p>
      <div class="anaf-keybox">${globalThis.escapeHtml(a.apiKey)}</div>
      <div class="anaf-actions">
        <button type="button" class="anaf-btn-pri" onclick="copyAnafSyncApiKey()">Copiază cheia</button>
        <button type="button" class="anaf-btn-sec" onclick="anafSyncDiscardBeginFromAdmin()">Șterge cheia stocată</button>
      </div>
      <p class="tsm" style="margin-top:12px;opacity:.85">Ștergerea cheii se face numai din portal, cu verificări în pași (declarații, PIN Șpagafon, frază obligatorie, confirmare sufix). Cheia nu se regenerează din interfață.</p>`;
    return;
  }
  if(_anafSyncPortalStep===1){
    const dnaBlock=isDnaInvestigationBlockingAnafSync();
    const stRo=globalThis.justiceStageRo(globalThis.S.justice?.stage||'clean');
    const esc=globalThis.S.justice?.dnaEscalation?'<span style="color:#c01c28;font-weight:800"> · escaladare DNA activă</span>':'';
    if(dnaBlock){
      body.innerHTML=`<span class="anaf-seal">Cerere neeligibilă</span>
        <div class="anaf-warn">ANAF Sync cere <strong>dovadă de integritate</strong> în platformă: nu puteți depune cererea de conectare cât timp există <strong>investigație DNA activă</strong> (anchetă, audiere sau recurs, ori escaladare DNA marcată în joc).</div>
        <p class="tsm" style="margin-top:12px">Starea dumneavoastră acum: <strong>${stRo}</strong>${esc}.</p>
        <p class="tsm tmut u-lh155">Reveniți după ce linia justițiară revine la o etapă permisă (de regulă <strong>Curat</strong> sau <strong>Monitorizare</strong>, fără investigație DNA deschisă).</p>
        <div class="anaf-actions">
          <button type="button" class="anaf-btn-sec" onclick="closeAnafSyncPortal()">Închide</button>
          <button type="button" class="anaf-btn-pri" onclick="closeAnafSyncPortal();navigate('just')">Deschide Sistem judiciar</button>
        </div>`;
      return;
    }
    body.innerHTML=`<span class="anaf-seal">Depunere cerere de conectare</span>
      <div class="anaf-bureau">Cererea se bazează pe profilul din SifonatorPRO. Pentru a putea continua trebuie să nu existe <strong>investigație DNA activă</strong>. Se solicită o declarație pe propria răspundere. Înregistrarea include verificare prin Șpagafon, dosar procedural și emitere token.</div>
      <p class="tsm tmut" style="margin-bottom:10px">Stare justiție la verificare: <strong>${stRo}</strong>; eligibil pentru pasul următor.</p>
      <label style="display:flex;gap:10px;align-items:flex-start;margin-top:12px;cursor:pointer">
        <input type="checkbox" id="anaf-integrity-decl"/>
        <span>Declar pe propria răspundere (în cadrul jocului) că <strong>nu</strong> sunt sub investigație DNA activă și că datele de identificare folosite sunt cele din profilul curent.</span>
      </label>
      <label style="display:flex;gap:10px;align-items:flex-start;margin-top:12px;cursor:pointer">
        <input type="checkbox" id="anaf-terms-proc"/>
        <span>Am luat la cunoștință pașii obligatorii: certificat Șpagafon, dosar cu <strong>șase</strong> documente confirmate pe rând, apoi emitere separată a tokenului și lipire în Manager Integrări.</span>
      </label>
      <div class="anaf-warn" style="margin-top:10px;border-left-color:#0056b3;background:rgba(0,86,179,.06)">Date cerere: <strong>${globalThis.escapeHtml(u.name||'-')}</strong> · ${globalThis.escapeHtml(u.fn||'-')} · ${globalThis.escapeHtml(u.jud||'-')}</div>
      <div class="anaf-actions">
        <button type="button" class="anaf-btn-pri" onclick="anafSyncPortalStep1Continue()">Depune cererea și solicită certificat</button>
      </div>`;
    return;
  }
  if(_anafSyncPortalStep===2){
    body.innerHTML=`<span class="anaf-seal">Certificat provizoriu</span>
      <p>Am expediat un <strong>PIN de depunere</strong> pe linia Șpagafon. Valabilitate: 30 de minute. Introduceți codul pentru a deschide dosarul electronic.</p>
      <label style="display:block;font-weight:700;margin-top:8px">PIN certificat</label>
      <input type="text" class="anaf-inp verif-code-inp" id="anaf-sync-cert-inp" maxlength="6" placeholder="000000" autocomplete="one-time-code" inputmode="numeric" pattern="[0-9]*" oninput="this.value=this.value.replace(/\\D/g,'').slice(0,6)"/>
      <div class="anaf-actions">
        <button type="button" class="anaf-btn-pri" onclick="anafSyncPortalVerifyCert()">Validează certificatul</button>
        <button type="button" class="anaf-btn-sec" onclick="_anafSyncPortalStep=1;ensureIntegrations();S.integrations.anafSync.pendingCertCode='';S.integrations.anafSync.draftKey='';S.integrations.anafSync.wizardPhase=1;S.integrations.anafSync.dosarTicks=0;saveState();renderAnafSyncPortalBody()">Renunță la cerere</button>
      </div>
      <p class="tsm tmut" style="margin-top:10px">Dacă nu vedeți mesajul, deschideți Șpagafon și folosiți butonul din SMS.</p>`;
    return;
  }
  if(_anafSyncPortalStep===3){
    const NEED=ANAF_DOSAR_TICKS_NEED,dt=a.dosarTicks|0,allActsConfirmed=dt>=NEED;
    const bar=Math.min(100,Math.round((Math.min(dt,NEED)/NEED)*100));
    const stepRows=ANAF_DOSAR_STEP_DEFS.map((def,i)=>{const lab=def.label,done=i<dt,curSt=!allActsConfirmed&&i===dt,cls=done?'done':curSt?'cur':'pend',ico=done?'✓':curSt?'→':'○';return`<li class="anaf-dosar-step ${cls}" role="status"><span class="anaf-dosar-ico" aria-hidden="true">${ico}</span><span><strong>${globalThis.escapeHtml(lab)}</strong>${curSt?'<span class="tmut" style="display:block;margin-top:4px;font-weight:400">Actualizare curentă - consultați rezumatul de mai jos.</span>':''}</span></li>`;}).join('');
    const bureau=allActsConfirmed?globalThis.escapeHtml('Toate actele din dosar sunt confirmate. Stadiul procedural este complet la nivel de documentație; urmează doar emiterea voluntară a tokenului de sincronizare.'):globalThis.escapeHtml(anafDosarStepDetailText(Math.min(dt,NEED-1),u));
    const stadiu=allActsConfirmed?`<p><strong>Stadiu în procedură:</strong> <strong>${NEED}</strong> / <strong>${NEED}</strong>. Toate verificările documentare sunt încheiate. Emiteți tokenul când doriți să treceți la ecranul cu cheia.</p>`:`<p><strong>Stadiu în procedură:</strong> <strong>${dt}</strong> / <strong>${NEED}</strong> · Act curent: <strong>${dt+1}</strong> din <strong>${NEED}</strong>. Confirmați pentru a avansa.</p>`;
    const mainBtn=allActsConfirmed?`<button type="button" class="anaf-btn-pri" onclick="anafSyncDosarEmitToken()">Închide dosarul și emite tokenul de sincronizare</button>`:`<button type="button" class="anaf-btn-pri" onclick="anafSyncDosarAdvance()">Actualizează stare dosar (următoarea verificare)</button>`;
    body.innerHTML=`<span class="anaf-seal">Dosar în lucru</span>${stadiu}<div style="height:8px;background:#dfe7f0;border-radius:4px;overflow:hidden;margin:10px 0"><div style="height:100%;width:${bar}%;background:linear-gradient(90deg,#0056b3,#1a6ec4);transition:width .2s"></div></div><p class="tsm" style="font-weight:700;color:#003d82;margin:0 0 6px">Acte procedurale (fiecare necesită confirmare separată; tokenul nu se emite automat)</p><ul class="anaf-dosar-steps" aria-label="Pași dosar ANAF Sync">${stepRows}</ul><div class="anaf-bureau">${bureau}</div><div class="anaf-actions">${mainBtn}</div>`;
    return;
  }
  if(_anafSyncPortalStep===5){
    if(!a.draftKey&&a.wizardPhase>=4)a.draftKey=generateAnafSyncApiKey();
    if(!a.draftKey){if(a.pendingCertCode)_anafSyncPortalStep=2;else if(a.wizardPhase>=3)_anafSyncPortalStep=3;else _anafSyncPortalStep=1;globalThis.saveState();renderAnafSyncPortalBody();return;}
    globalThis.saveState();
    body.innerHTML=`<span class="anaf-seal">Token sincronizare</span><p>Dosarul a fost închis favorabil. Mai jos este <strong>cheia de sincronizare</strong>. O puteți lipi în Manager Integrări sau folosi butonul de trimitere.</p><div class="anaf-keybox">${globalThis.escapeHtml(a.draftKey)}</div><div class="anaf-actions"><button type="button" class="anaf-btn-pri" onclick="copyAnafSyncDraftKey()">Copiază cheia</button><button type="button" class="anaf-btn-pri" onclick="finalizeAnafSyncIntegration()">Trimite în SifonatorPRO</button></div>`;
    return;
  }
  body.innerHTML=`<span class="anaf-seal">Reîncărcare</span><p class="tsm">Stare portal neprevăzută. Reîncepeți deschiderea.</p><div class="anaf-actions"><button type="button" class="anaf-btn-pri" onclick="openAnafSyncPortal()">Reîncarcă portalul</button></div>`;
}
function anafSyncPortalStep1Continue(){
  if(isDnaInvestigationBlockingAnafSync()){globalThis.toast('Nu puteți continua: există investigație DNA activă în SifonatorPRO','err');renderAnafSyncPortalBody();return}
  if(!globalThis.$('anaf-integrity-decl')?.checked){globalThis.toast('Bifați declarația de integritate','warn');return}
  if(!globalThis.$('anaf-terms-proc')?.checked){globalThis.toast('Confirmați că ați luat la cunoștință pașii procedurii','warn');return}
  globalThis.ensureIntegrations();
  const a=globalThis.S.integrations.anafSync;
  const code=String(100000+Math.floor(Math.random()*900000));
  a.pendingCertCode=code;a.draftKey='';a.dosarTicks=0;a.wizardPhase=2;
  globalThis.saveState();
  globalThis.spagafonPushSms('ANAF Sync',`PIN depunere dosar ANAF Sync: ${code}. Valabil 30 minute. Introduceți-l în portalul de conectare.`,{code,isAnafCert:true});
  globalThis.addAct('ANAF Sync: PIN certificat expediat pe Șpagafon; dosarul se deschide după validare.');
  _anafSyncPortalStep=2;renderAnafSyncPortalBody();globalThis.toast('Verifică Șpagafon pentru PIN-ul de certificat','ok');
}
function anafSyncPortalVerifyCert(){
  const inp=globalThis.sanitizeVerifCodeDigits(globalThis.$('anaf-sync-cert-inp')?.value,6);
  globalThis.ensureIntegrations();
  const a=globalThis.S.integrations.anafSync;
  if(inp!==a.pendingCertCode){globalThis.toast('PIN incorect sau expirat','err');return}
  globalThis.invalidateVerifiedSpagafonCode('anaf',inp);
  a.pendingCertCode='';a.dosarTicks=0;a.wizardPhase=3;
  globalThis.saveState();_anafSyncPortalStep=3;renderAnafSyncPortalBody();
  globalThis.addAct('ANAF Sync: Certificat validat. Dosarul procedural a fost deschis.');
  globalThis.toast('Certificat acceptat. Urmează etapa dosarului','ok');
}
function anafSyncDosarAdvance(){
  globalThis.ensureIntegrations();
  const a=globalThis.S.integrations.anafSync;
  if(a.dosarTicks>=ANAF_DOSAR_TICKS_NEED){globalThis.toast('Toate actele sunt deja confirmate. Folosiți „Închide dosarul și emite tokenul…”','warn');return}
  a.dosarTicks++;globalThis.saveState();renderAnafSyncPortalBody();
  globalThis.toast(a.dosarTicks>=ANAF_DOSAR_TICKS_NEED?'Stadiu '+ANAF_DOSAR_TICKS_NEED+'/'+ANAF_DOSAR_TICKS_NEED+': actele sunt complete. Emiteți tokenul când sunteți gata.':'Stare dosar actualizată','ok');
}
function anafSyncDosarEmitToken(){
  globalThis.ensureIntegrations();
  const a=globalThis.S.integrations.anafSync;
  if(a.dosarTicks<ANAF_DOSAR_TICKS_NEED){globalThis.toast('Parcurgeți toate verificările: stadiu curent '+a.dosarTicks+'/'+ANAF_DOSAR_TICKS_NEED+'.','warn');return}
  if(!a.draftKey)a.draftKey=generateAnafSyncApiKey();
  a.wizardPhase=4;globalThis.saveState();_anafSyncPortalStep=5;renderAnafSyncPortalBody();
  globalThis.addAct('ANAF Sync: dosar închis; token de sincronizare emis.');
  globalThis.toast('Token emis. Copiați cheia sau trimiteți-o în Manager Integrări','ok');
}
function copyAnafSyncDraftKey(){
  globalThis.ensureIntegrations();const k=globalThis.S.integrations.anafSync.draftKey;
  if(!k){globalThis.toast('Nu există cheie de copiat','warn');return}
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(k).then(()=>globalThis.toast('Cheie copiată','ok')).catch(()=>globalThis.toast(k,'ok'));
  else globalThis.toast(k,'ok');
}
function copyAnafSyncApiKey(){
  globalThis.ensureIntegrations();const k=globalThis.S.integrations.anafSync.apiKey;
  if(!k){globalThis.toast('Nu există cheie de copiat','warn');return}
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(k).then(()=>globalThis.toast('Cheie copiată','ok')).catch(()=>globalThis.toast(k,'ok'));
  else globalThis.toast(k,'ok');
}
function finalizeAnafSyncIntegration(){
  globalThis.ensureIntegrations();
  const a=globalThis.S.integrations.anafSync;
  if(!a.draftKey){globalThis.toast('Emite mai întâi cheia din portal (finalizează dosarul)','warn');return}
  a.apiKey=a.draftKey;a.linked=true;a.draftKey='';a.wizardPhase=1;a.dosarTicks=0;
  globalThis.saveState();closeAnafSyncPortal();globalThis.renderInteg();globalThis.renderAudit();
  globalThis.addAct('ANAF Sync: integrare activată în SifonatorPRO.');
  globalThis.toast('ANAF Sync conectat la platformă','ok');
}
function connectAnafSyncManualKey(){
  globalThis.ensureIntegrations();
  const v=globalThis.$('integ-anaf-paste')?.value?.trim()||'';
  const a=globalThis.S.integrations.anafSync;
  if(a.linked){globalThis.toast('Integrarea este deja activă','warn');return}
  if(!v){globalThis.toast('Introdu sau lipește cheia din portalul ANAF Sync','warn');return}
  if(!a.draftKey){globalThis.toast('Deschide ANAF Sync, parcurge certificatul și dosarul, apoi emite tokenul curent','warn');return}
  if(v!==a.draftKey){globalThis.toast('Cheia nu se potrivește cu cea din portal','err');return}
  a.apiKey=a.draftKey;a.linked=true;a.draftKey='';a.wizardPhase=1;a.dosarTicks=0;
  globalThis.saveState();globalThis.renderInteg();globalThis.renderAudit();
  globalThis.addAct('ANAF Sync: cheie introdusă manual în Manager Integrări.');
  globalThis.toast('ANAF Sync activat','ok');
}
function toggleIntegAnafKeyReveal(){
  const inp=globalThis.$('integ-anaf-paste'),btn=globalThis.$('integ-anaf-reveal');
  if(!inp||!btn)return;
  const hide=inp.type==='text';inp.type=hide?'password':'text';btn.textContent=hide?'Afișează':'Ascunde';btn.setAttribute('aria-pressed',hide?'false':'true');
}
function anafSyncDiscardCancel(){_anafDiscardSub=0;_anafDiscardPin='';renderAnafSyncPortalBody();}
function anafSyncDiscardBeginFromAdmin(){
  globalThis.ensureIntegrations();
  if(!globalThis.S.integrations.anafSync.linked||!String(globalThis.S.integrations.anafSync.apiKey||'').trim()){globalThis.toast('Nu există cheie stocată de șters','warn');return}
  _anafDiscardSub=1;_anafDiscardPin='';renderAnafSyncPortalBody();
}
function anafSyncDiscardStep1Continue(){
  if(!globalThis.$('anaf-discard-decl-1')?.checked||!globalThis.$('anaf-discard-decl-2')?.checked||!globalThis.$('anaf-discard-decl-3')?.checked){globalThis.toast('Bifați toate cele trei declarații','warn');return}
  globalThis.ensureIntegrations();
  const a=globalThis.S.integrations.anafSync;
  if(!a.linked||!String(a.apiKey||'').trim()){globalThis.toast('Cheia nu mai este disponibilă','warn');anafSyncDiscardCancel();return}
  const code=String(100000+Math.floor(Math.random()*900000));_anafDiscardPin=code;_anafDiscardSub=2;
  globalThis.spagafonPushSms('ANAF Sync',`PIN confirmare ștergere cheie API ANAF Sync: ${code}. Valabil 15 minute. Introduceți-l în portal (verificare guvernamentală).`,{code,isAnafDiscardVerify:true});
  globalThis.saveState();renderAnafSyncPortalBody();
  globalThis.addAct('ANAF Sync: procedură ștergere cheie. PIN expediat pe Șpagafon.');
  globalThis.toast('Verificați Șpagafon pentru PIN-ul de confirmare','ok');
}
function anafSyncDiscardVerifyPin(){
  const inp=globalThis.sanitizeVerifCodeDigits(globalThis.$('anaf-discard-pin-inp')?.value,6);
  if(inp!==_anafDiscardPin){globalThis.toast('PIN incorect sau nevalid','err');return}
  globalThis.invalidateVerifiedSpagafonCode('anaf-discard',inp);
  _anafDiscardSub=3;_anafDiscardPin='';renderAnafSyncPortalBody();globalThis.toast('PIN acceptat. Urmează confirmarea textuală','ok');
}
function anafSyncDiscardPhraseCheck(){
  const got=globalThis.$('anaf-discard-phrase-inp')?.value?.trim()||'';
  if(got!==ANAF_DISCARD_PHRASE_REQUIRED){globalThis.toast('Textul nu corespunde exact','err');return}
  _anafDiscardSub=4;renderAnafSyncPortalBody();
}
function anafSyncDiscardFinalize(){
  if(!globalThis.$('anaf-discard-final-ack')?.checked){globalThis.toast('Bifați declarația finală','warn');return}
  globalThis.ensureIntegrations();
  const a=globalThis.S.integrations.anafSync,key=String(a.apiKey||''),want=String(globalThis.$('anaf-discard-suffix-inp')?.value||'').trim();
  if(key.length<ANAF_DISCARD_KEY_SUFFIX_LEN){globalThis.toast('Cheie indisponibilă în stare curentă','err');return}
  if(want!==key.slice(-ANAF_DISCARD_KEY_SUFFIX_LEN)){globalThis.toast('Ultimele caractere nu coincid cu cheia curentă. Verificați copierea','err');return}
  a.apiKey='';a.linked=false;a.draftKey='';a.pendingCertCode='';a.wizardPhase=1;a.dosarTicks=0;
  _anafDiscardSub=0;_anafDiscardPin='';_anafSyncPortalStep=1;
  globalThis.saveState();closeAnafSyncPortal();globalThis.renderInteg();globalThis.renderAudit();
  globalThis.addAct('ANAF Sync: cheie API eliminată din platformă după verificări guvernamentale (declarații, PIN, frază, sufix).');
  globalThis.toast('Cheia ANAF Sync a fost ștearsă din SifonatorPRO','warn');
}
function fillAnafCertFromSpagafon(code){
  const inp=globalThis.$('anaf-sync-cert-inp');
  if(!inp){globalThis.toast('Deschide portalul ANAF Sync la pasul cu PIN-ul certificat','warn');return}
  inp.value=globalThis.sanitizeVerifCodeDigits(code,6);inp.focus();try{inp.select()}catch(e){}globalThis.toggleSpagafon(false);
  globalThis.toast('PIN completat. pasă Validează în portalul ANAF Sync','ok');
}
function fillAnafDiscardPinFromSpagafon(code){
  const inp=globalThis.$('anaf-discard-pin-inp');
  if(!inp){globalThis.toast('Deschide portalul ANAF Sync la pasul de ștergere a cheii API','warn');return}
  inp.value=globalThis.sanitizeVerifCodeDigits(code,6);inp.focus();try{inp.select()}catch(e){}globalThis.toggleSpagafon(false);
  globalThis.toast('PIN completat. Apăsați Validează în portal','ok');
}
function dbInstantApiAnaf(){
  globalThis.ensureIntegrations();
  const a=globalThis.S.integrations.anafSync;
  a.linked=true;a.apiKey=generateAnafSyncApiKey();a.draftKey='';a.pendingCertCode='';a.wizardPhase=5;a.dosarTicks=ANAF_DOSAR_TICKS_NEED;
  globalThis.saveState();globalThis.renderInteg();globalThis.renderAudit();
  if(globalThis.$('anaf-sync-portal')&&!globalThis.$('anaf-sync-portal').classList.contains('hid')){_anafSyncPortalStep='admin';renderAnafSyncPortalBody();}
  globalThis.addAct('[DEBUG] ANAF Sync: legătură instantanee (cheie nouă).');
  globalThis.toast('[DEBUG] ANAF Sync activat','ok');
  globalThis.updDebug();
}

function initAnafSyncIntegration(){
  globalThis.ANAF_DOSAR_TICKS_NEED=ANAF_DOSAR_TICKS_NEED;
  globalThis.isAnafSyncLinked=isAnafSyncLinked;
  globalThis.isAnafSyncAuditVisible=isAnafSyncAuditVisible;
  globalThis.isDnaInvestigationBlockingAnafSync=isDnaInvestigationBlockingAnafSync;
  globalThis.anafDosarStepDetailText=anafDosarStepDetailText;
  globalThis.generateAnafSyncApiKey=generateAnafSyncApiKey;
  globalThis.openAnafSyncPortal=openAnafSyncPortal;
  globalThis.closeAnafSyncPortal=closeAnafSyncPortal;
  globalThis.renderAnafSyncPortalBody=renderAnafSyncPortalBody;
  globalThis.anafSyncPortalStep1Continue=anafSyncPortalStep1Continue;
  globalThis.anafSyncPortalVerifyCert=anafSyncPortalVerifyCert;
  globalThis.anafSyncDosarAdvance=anafSyncDosarAdvance;
  globalThis.anafSyncDosarEmitToken=anafSyncDosarEmitToken;
  globalThis.copyAnafSyncDraftKey=copyAnafSyncDraftKey;
  globalThis.copyAnafSyncApiKey=copyAnafSyncApiKey;
  globalThis.finalizeAnafSyncIntegration=finalizeAnafSyncIntegration;
  globalThis.connectAnafSyncManualKey=connectAnafSyncManualKey;
  globalThis.toggleIntegAnafKeyReveal=toggleIntegAnafKeyReveal;
  globalThis.anafSyncDiscardCancel=anafSyncDiscardCancel;
  globalThis.anafSyncDiscardBeginFromAdmin=anafSyncDiscardBeginFromAdmin;
  globalThis.anafSyncDiscardStep1Continue=anafSyncDiscardStep1Continue;
  globalThis.anafSyncDiscardVerifyPin=anafSyncDiscardVerifyPin;
  globalThis.anafSyncDiscardPhraseCheck=anafSyncDiscardPhraseCheck;
  globalThis.anafSyncDiscardFinalize=anafSyncDiscardFinalize;
  globalThis.fillAnafCertFromSpagafon=fillAnafCertFromSpagafon;
  globalThis.fillAnafDiscardPinFromSpagafon=fillAnafDiscardPinFromSpagafon;
  globalThis.dbInstantApiAnaf=dbInstantApiAnaf;
}
globalThis.initAnafSyncIntegration=initAnafSyncIntegration;
})();