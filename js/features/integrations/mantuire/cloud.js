;(function(){
const MANTUIRE_API_TIERS={
  solemn:{label:'Rit Solemn',hint:'Absolvire maximă, timp de așteptare mai lung · cost: 3 unități',repMin:14,repMax:20,delayMult:1.65,umCost:3},
  parohial:{label:'Rit Parohial',hint:'Echilibru între absolvire și viteză · cost: 2 unități',repMin:8,repMax:13,delayMult:1,umCost:2},
  expedit:{label:'Rit Expedit',hint:'Procesare rapidă, puncte de reputație mai puține · cost: 1 unitate',repMin:5,repMax:8,delayMult:0.52,umCost:1},
};
const MANTUIRE_API_REGISTRATION_FEE_RON=149;
let _mantuirePortalKeyEnv='live';
let _mantuirePortalStep=1;
let _mantuirePayPane='methods';
let _mantuirePsdAnim=null;

function mantuireTierMeta(id){
  const t=MANTUIRE_API_TIERS[id]||MANTUIRE_API_TIERS.parohial;
  if(globalThis.S&&globalThis.S.settings&&globalThis.S.settings.mantuireNeutralBranding===true){
    const lab=id==='solemn'?'Premium':id==='expedit'?'Rapid':'Standard';
    const cost=t&&typeof t.umCost==='number'?t.umCost:2;
    const hint=`Procesare ${lab.toLowerCase()} · cost: ${cost} unități`;
    return{...t,label:lab,hint};
  }
  return t;
}
function mantuireUmCostForTier(tierId){
  const t=MANTUIRE_API_TIERS[tierId];
  return t&&typeof t.umCost==='number'?t.umCost:2;
}
function mantuireRegistrationFeeAmount(){return Math.round(globalThis.applyDisc(MANTUIRE_API_REGISTRATION_FEE_RON));}
function mantuireRegistrationFeeBreakdown(){
  const list=MANTUIRE_API_REGISTRATION_FEE_RON,pct=globalThis.disc(),fee=mantuireRegistrationFeeAmount(),saved=list-fee;
  return{list,fee,pct,saved};
}
function mantuireRandomRepForTier(tierId){
  const t=mantuireTierMeta(tierId);
  return t.repMin+Math.floor(Math.random()*(t.repMax-t.repMin+1));
}
function mantuireRandomKeySuffix(n){
  return Array.from({length:n||24},()=>'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random()*36)]).join('');
}
function mantuireEnvPillLabel(env){return env==='test'?'Cheie test':'Cheie live';}
function mantuireSyncKeyMetaFromApiKey(){
  if(!globalThis.S.integrations||typeof globalThis.S.integrations!=='object')return;
  const m=globalThis.S.integrations.mantuireCloud;
  if(!m||typeof m!=='object')return;
  const k=String(m.apiKey||'');
  if(/^mnt_sk_test_/i.test(k))m.keyEnv='test';
  else if(/^mnt_sk_live_/i.test(k))m.keyEnv='live';
  else m.keyEnv='live';
}
function mantuirePortalSetEnv(env){_mantuirePortalKeyEnv=(env==='test')?'test':'live';}
function mantuirePortalRegenDraftKeys(){
  globalThis.ensureMantuireIntegration();
  const m=globalThis.S.integrations.mantuireCloud;
  const env=globalThis.$('mant-portal-env')?.value||_mantuirePortalKeyEnv||'live';
  _mantuirePortalKeyEnv=env;
  m.draftKey=generateMantuireApiKey(env);
  globalThis.saveState();
  globalThis.renderMantuirePortalBody();
}
function mantuireSetApiTier(v){
  globalThis.ensureMantuireIntegration();
  const id=(v==='solemn'||v==='expedit')?v:'parohial';
  globalThis.S.integrations.mantuireCloud.apiTier=id;
  globalThis.saveState();globalThis.renderMantuire();globalThis.renderInteg();
}
function mantuireSetPayPane(p){_mantuirePayPane=(p==='card'||p==='psd'||p==='psd_wait'||p==='methods')?p:'methods';}
function mantuireGetPayPane(){return _mantuirePayPane;}
function mantuireSetPsdAnim(v){_mantuirePsdAnim=v&&typeof v==='object'?v:null;}
function mantuireGetPsdAnim(){return _mantuirePsdAnim;}
function mantuireFeatureEnabled(){return !!(globalThis.S&&globalThis.S.settings&&globalThis.S.settings.enableMantuireFeature!==false);}
function mantuireBrand(){
  const neutral=!!(globalThis.S&&globalThis.S.settings&&globalThis.S.settings.mantuireNeutralBranding===true);
  if(neutral)return{icon:'🛠️',name:'Reparații Proiecte',portalLabel:'portalul Reparații Proiecte',navToastName:'Reparații Proiecte',unitAbbr:'TP',unitName:'tichete de procesare',unitOne:'tichet',unitMany:'tichete',ritualLabel:'Profil procesare',ritualOne:'profil',reqOne:'job',reqMany:'joburi',queueEmpty:'Niciun job în așteptare.',resultTag:'Reparat',resultVerbPast:'reparat',viewDesc:'Recuperează proiectele încă „de mântuială” folosind un API terț de „reparații”. Aici vezi creditele, coada și setările fiecărui job. Pe nodurile cu trafic ridicat, parcursul se poate întrerupe și poate trebui reluat.'};
  return{icon:'⛪',name:'Mântuire Proiecte',portalLabel:'portalul Mântuire Proiecte',navToastName:'Mântuire Proiecte',unitAbbr:'UM',unitName:'unități de mântuire',unitOne:'unitate',unitMany:'unități',ritualLabel:'Rit cerere',ritualOne:'rit',reqOne:'cerere',reqMany:'cereri',queueEmpty:'Nicio cerere în așteptare.',resultTag:'Mântuit',resultVerbPast:'mântuit',viewDesc:'Actualizează proiectele încă „de mântuială” la stadiul <strong>Mântuit</strong>. Aici vezi creditele, coada și setările fiecărei cereri. Pe nodurile cu trafic mai ridicat, parcursul este mai des întrerupt și poate trebuie reluat.'};
}
function isMantuireLinked(){
  globalThis.ensureMantuireIntegration();
  const m=globalThis.S.integrations.mantuireCloud;
  if(!mantuireFeatureEnabled())return false;
  return m.linked===true&&!!String(m.apiKey||'').trim()&&/^mnt_sk_/i.test(String(m.apiKey||''));
}
function generateMantuireApiKey(env){
  const e=(env==='test')?'test':'live';
  return`mnt_sk_${e}_${mantuireRandomKeySuffix(22)}`;
}
function openMantuirePortal(){
  if(!mantuireFeatureEnabled()){globalThis.toast('Integrarea „Mântuire Proiecte” este dezactivată din Setări utilizator','warn');globalThis.navigate('settings');return}
  globalThis.ensureMantuireIntegration();
  const el=globalThis.$('mantuire-portal');
  if(!el)return;
  const m=globalThis.S.integrations.mantuireCloud;
  if(m.linked)_mantuirePortalStep='admin';
  else if(m.draftKey&&m.wizardPhase>=4)_mantuirePortalStep=4;
  else if(m.pendingVerifyCode)_mantuirePortalStep=3;
  else if(m.wizardPhase>=2&&!m.registrationPaid){_mantuirePortalStep=2;mantuireSetPayPane('methods');}
  else if(m.registrationPaid)_mantuirePortalStep=2;
  else _mantuirePortalStep=1;
  el.classList.remove('hid');
  el.setAttribute('aria-hidden','false');
  globalThis.renderMantuirePortalBody();
}
function closeMantuirePortal(){globalThis.$('mantuire-portal')?.classList.add('hid');globalThis.$('mantuire-portal')?.setAttribute('aria-hidden','true');}
function mantuirePortalSetStep(step){_mantuirePortalStep=step;}
function renderMantuirePortalBody(){
  const body=globalThis.$('mantuire-portal-body');
  if(!body)return;
  globalThis.ensureMantuireIntegration();
  const m=globalThis.S.integrations.mantuireCloud;
  const u=globalThis.S.user;
  const br=mantuireBrand();
  if(_mantuirePortalStep==='admin'&&m.linked){
    const envLab=mantuireEnvPillLabel(/mnt_sk_test_/i.test(m.apiKey||'')?'test':'live');
    const cAt=m.keyCreatedAt?new Date(m.keyCreatedAt).toLocaleString('ro-RO'):'-';
    const uAt=m.lastUsedAt?new Date(m.lastUsedAt).toLocaleString('ro-RO'):'niciodată';
    body.innerHTML=`<span class="mantp-seal">Cont API activ</span>
      <p><span class="mant-api-pill">${globalThis.escapeHtml(envLab)}</span> <span class="mant-api-pill">${globalThis.escapeHtml(mantuireTierMeta(m.apiTier||'parohial').label)}</span></p>
      <p class="tsm" style="margin:8px 0">Cheie <strong>secretă</strong> API (<code>mnt_sk_…</code>):</p>
      <div class="mantp-keybox">${globalThis.escapeHtml(m.apiKey)}</div>
      <p class="tsm tmut">Creată: ${globalThis.escapeHtml(cAt)} · Ultima folosire: ${globalThis.escapeHtml(uAt)}</p>
      <div class="mantp-actions">
        <button type="button" class="mantp-btn-pri" onclick="copyMantuirePortalKey(true)">Copiază cheia secretă</button>
        <button type="button" class="mantp-btn-sec" onclick="regenerateMantuireApiKey()">Emite cheie nouă (deconectează platforma)</button>
        <button type="button" class="mantp-btn-sec" onclick="revokeMantuireCloud();closeMantuirePortal()">Revocă integrarea</button>
      </div>`;
    return;
  }
  const regFee=mantuireRegistrationFeeAmount();
  const regBr=mantuireRegistrationFeeBreakdown();
  if(_mantuirePortalStep===1){
    body.innerHTML=`<span class="mantp-seal">Înregistrare furnizor</span>
      <p>Înregistrarea folosește datele din profilul SifonatorPRO. Serviciul <strong>${globalThis.escapeHtml(br.name)}</strong> este consumat pe ${globalThis.escapeHtml(br.reqMany)} în <strong>${globalThis.escapeHtml(br.unitName)} (${globalThis.escapeHtml(br.unitAbbr)})</strong> și limitează câte ${globalThis.escapeHtml(br.reqMany)} pot rula în același timp. La final alegi dacă cheia este pentru încercări sau pentru utilizare obișnuită.</p>
      <div class="mantp-bureau">După acceptarea termenilor urmează <strong>plata taxei de înregistrare</strong> (${regFee} RON, plată unică), prin <strong>SifonPay</strong> sau <strong>PSD Direct Connect</strong>. Apoi primești codul pe <strong>Șpagafon</strong> și emiterea cheii. Poți lipi cheia în Manager Integrări sau folosi <strong>Trimite în SifonatorPRO</strong>.</div>
      <div style="display:grid;gap:8px;margin:12px 0;padding:12px;background:#fff;border:1px solid var(--mant-bureau-border);border-radius:4px">
        <div style="display:flex;justify-content:space-between;gap:10px;font-size:12px;border-bottom:1px dashed #e8e0ef;padding-bottom:6px"><span style="font-weight:600;color:#5c3d6e">Nume</span><span style="font-weight:700;text-align:right">${globalThis.escapeHtml(u.name||'-')}</span></div>
        <div style="display:flex;justify-content:space-between;gap:10px;font-size:12px;border-bottom:1px dashed #e8e0ef;padding-bottom:6px"><span style="font-weight:600;color:#5c3d6e">Funcție</span><span style="font-weight:700;text-align:right">${globalThis.escapeHtml(u.fn||'-')}</span></div>
        <div style="display:flex;justify-content:space-between;gap:10px;font-size:12px"><span style="font-weight:600;color:#5c3d6e">Județ</span><span style="font-weight:700;text-align:right">${globalThis.escapeHtml(u.jud||'-')}</span></div>
      </div>
      <label style="display:flex;gap:10px;align-items:flex-start;margin-top:12px;cursor:pointer">
        <input type="checkbox" id="mant-terms"/>
        <span>Accept <strong>Termenii și condițiile</strong> <strong>${globalThis.escapeHtml(br.name)}</strong> pentru utilizarea API, a cheii secrete și a consumului de ${globalThis.escapeHtml(br.unitName)} (${globalThis.escapeHtml(br.unitAbbr)}).</span>
      </label>
      <div class="mantp-legal">„Utilizatorul declară că solicitările de schimbare a statutului proiectelor se fac în cadrul fluxului afișat. Furnizorul nu garantează efecte în afara aplicației.”</div>
      <div class="mantp-actions">
        <button type="button" class="mantp-btn-pri" onclick="mantuirePortalStep1Continue()">Continuă</button>
      </div>`;
    return;
  }
  if(_mantuirePortalStep===2){
    const comPsd=Math.round(regFee*.15),totalPsd=regFee+comPsd;
    const comPsdList=Math.round(regBr.list*.15),totalPsdList=regBr.list+comPsdList;
    const pane=(['methods','card','psd','psd_wait'].includes(_mantuirePayPane))?_mantuirePayPane:'methods';
    const discRow=regBr.pct>0&&regBr.saved>0?`<div style="display:flex;justify-content:space-between;gap:10px;font-size:12px;padding:6px 0;border-bottom:1px dashed #e8e0ef"><span>Reducere reputație (${regBr.pct.toFixed(1)}%)</span><span style="color:#1a6b2e;font-weight:700">-${regBr.saved} RON</span></div>`:'';
    const orderSummaryBlock=`<div style="background:#fff;border:1px solid var(--mant-bureau-border);border-radius:4px;padding:12px;margin:12px 0"><div style="font-size:11px;font-weight:800;color:var(--mant-primary);letter-spacing:.06em;margin-bottom:8px">REZUMAT COMANDĂ</div><div style="display:flex;justify-content:space-between;gap:10px;font-size:12px;padding:6px 0;border-bottom:1px dashed #e8e0ef"><span>Preț de referință (taxă API)</span><span>${regBr.list} RON</span></div>${discRow}<div style="display:flex;justify-content:space-between;gap:10px;font-size:13px;font-weight:800;margin-top:10px"><span>Total de plată</span><span style="color:var(--mant-primary)">${regFee} RON</span></div></div>`;
    let checkout='';
    if(!m.registrationPaid){
      if(pane==='methods'){
        checkout=`${orderSummaryBlock}<p class="tsm tmut">Alege metoda de plată. PSD DC necesită integrare activă în Manager Integrări.</p><div style="display:flex;flex-direction:column;gap:10px;margin-top:10px"><button type="button" class="mantp-btn-pri" onclick="mantuirePayPaneNav('card')">💳 Plată cu cardul (SifonPay)</button><button type="button" class="mantp-btn-pri" style="background:linear-gradient(180deg,#7a0000,#a40000);border:none" onclick="mantuirePortalTryPsdInline()">🏛️ Plată cu bani publici (PSD Direct Connect)</button></div><div class="mantp-actions"><button type="button" class="mantp-btn-sec" onclick="mantuirePortalPaymentBack()">Înapoi</button></div>`;
      }else if(pane==='card'){
        checkout=`<div style="background:#fff;border:1px solid var(--mant-bureau-border);border-radius:4px;padding:12px;margin:10px 0;font-size:12px"><div style="font-weight:800;color:var(--mant-primary);margin-bottom:8px">SifonPay · Înregistrare API</div><div style="display:flex;justify-content:space-between;gap:8px;border-bottom:1px dashed #e8e0ef;padding-bottom:6px;margin-bottom:6px"><span>Preț referință</span><span>${regBr.list} RON</span></div>${regBr.pct>0&&regBr.saved>0?`<div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:6px"><span>Reducere reputație (${regBr.pct.toFixed(1)}%)</span><span style="color:#1a6b2e;font-weight:700">-${regBr.saved} RON</span></div>`:''}<div style="display:flex;justify-content:space-between;gap:8px;font-weight:800"><span>Total de încasat</span><span style="color:var(--mant-primary)">${regFee} RON</span></div></div><div class="fg"><label style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:5px;display:block">Număr card</label><input class="card-inp mantp-inp" id="mantpay-num" placeholder="0000 0000 0000 0000" maxlength="19" oninput="fmtCard(this)" style="margin-top:4px"/></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:11px;margin-top:8px"><div class="fg"><label style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:5px;display:block">Expirare</label><div class="sp-exp-field" style="margin-top:4px"><input class="card-inp mantp-inp" id="mantpay-exp-mm" placeholder="MM" maxlength="2" inputmode="numeric" pattern="[0-9]*" autocomplete="cc-exp-month" aria-label="Luna expirării (2 cifre)" oninput="onCardExpMmInput(this,'mantpay-exp-yy')"/><span class="sp-exp-sep" aria-hidden="true">/</span><input class="card-inp mantp-inp" id="mantpay-exp-yy" placeholder="AA" maxlength="2" inputmode="numeric" pattern="[0-9]*" autocomplete="cc-exp-year" aria-label="Anul expirării (2 cifre, AA)" oninput="fmtExpYY(this)"/></div></div><div class="fg"><label style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:5px;display:block">CVV</label><input class="card-inp mantp-inp sp-cvv-inp" id="mantpay-cvv" placeholder="***" type="password" maxlength="3" inputmode="numeric" pattern="[0-9]{3}" oninput="this.value=this.value.replace(/\\D/g,'').slice(0,3)"/></div></div><div class="fg" style="margin-top:8px"><label style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:5px;display:block">Titular</label><input class="card-inp mantp-inp" id="mantpay-name" placeholder="GIGEL POPESCU" style="margin-top:4px"/></div><p style="font-size:11px;color:var(--text3);margin-top:8px">Tranzacția va apărea pe extras ca „SERVICII DIGITALE ANONIME SRL". Unele bănci pot declanșa 3D Secure fictiv (fereastra apare deasupra portalului).</p><div id="mant-pay-card-status"></div><div class="mantp-actions"><button type="button" class="mantp-btn-sec" onclick="mantuirePayPaneNav('methods')">Înapoi</button><button type="button" class="mantp-btn-pri" onclick="mantuirePortalProcCardInline()">🔒 Plătește ${regFee} RON</button></div>`;
      }else if(pane==='psd'){
        checkout=`<div style="background:linear-gradient(135deg,#8b0000,#cc0000);color:#fff;padding:13px 15px;border-radius:4px;margin:10px 0;text-align:center"><div style="font-size:17px;margin-bottom:2px">🏛️ PSD Direct Connect</div><div style="font-size:11px;opacity:.75">Înregistrare acces API ${globalThis.escapeHtml(br.name)}</div></div><div style="background:#fff;border:1px solid #d4c4de;padding:11px;border-radius:4px;font-size:13px;margin-bottom:12px"><div class="flex" style="justify-content:space-between;margin-bottom:3px;font-size:11px;color:#6b5a72"><span>Preț referință taxă (înainte de reducere)</span><span>${regBr.list} RON</span></div>${regBr.pct>0&&regBr.saved>0?`<div class="flex" style="justify-content:space-between;margin-bottom:3px;color:#1a6b2e;font-size:12px"><span>Reducere reputație (${regBr.pct.toFixed(1)}%)</span><span>-${regBr.saved} RON</span></div>`:''}<div class="flex" style="justify-content:space-between;margin-bottom:3px"><span>Taxă înregistrare API (după reducere)</span><span>${regFee} RON</span></div><div class="flex" style="justify-content:space-between;margin-bottom:3px;color:#5c4a62"><span>Comision intermediar (15% din taxă)</span><span>${comPsd} RON</span></div>${regBr.pct>0&&regBr.saved>0?`<p class="tsm tmut" style="margin:6px 0 8px;font-size:11px">Fără reducere, total estimat ar fi fi fost <strong>${totalPsdList} RON</strong> (taxă ${regBr.list} + comision).</p>`:''}<hr class="sep"/><div class="flex" style="justify-content:space-between;font-weight:700"><span>TOTAL DIN BUGET PUBLIC</span><span style="color:#a40000">${totalPsd} RON</span></div></div><div class="fg"><label style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:5px;display:block">Selectează ruta SEAP</label><select id="mantpay-psd-int" class="mantp-inp" style="margin-top:4px"><option value="achizitie_directa">Partid (PSD): Achiziție directă, 3-5 zile</option><option value="procedura_simplificata">Rețea locală: Procedură simplificată, 1-2 zile</option><option value="contract_direct">Conexiuni ministeriale: Contract direct, 24h</option><option value="oug_fasttrack">Ministru de resort: prioritate OUG, 4 ore</option></select></div><div class="mantp-actions"><button type="button" class="mantp-btn-sec" onclick="mantuirePayPaneNav('methods')">Înapoi</button><button type="button" class="mantp-btn-pri" style="background:linear-gradient(180deg,#7a0000,#a40000);border:none" onclick="mantuirePortalPsdSubmit()">📤 Trimite cerere</button></div>`;
      }else if(pane==='psd_wait'){
        checkout=`<div style="text-align:center;padding:16px 8px"><div style="font-size:28px;margin-bottom:8px">📤</div><p class="tsm tmut">Cererea parcurge rețeaua de influență…</p><div id="mant-psd-steps" style="text-align:left;margin-top:14px;font-size:12px;color:#4a3558"></div></div><p class="tsm tmut">Nu închide portalul până la confirmare.</p>`;
      }
    }
    const regIntroExtra=regBr.pct>0&&regBr.saved>0?`, cu <strong>reducere reputație ${regBr.pct.toFixed(1)}%</strong> (-${regBr.saved} RON), plătești <strong>${regFee} RON</strong>`:`. Acum nu se aplică reducere din reputație (0,1% per punct, max 25%)`;
    body.innerHTML=`<span class="mantp-seal">Taxă înregistrare</span><p>Taxă unică pentru deschiderea accesului API <strong>${globalThis.escapeHtml(br.name)}</strong>: preț de referință <strong>${regBr.list} RON</strong>${regIntroExtra}.</p>${m.registrationPaid?`<p class="tsm" style="color:#2d7a3e;font-weight:700">Plată înregistrată.</p><p class="tsm tmut">Următorul pas este codul de verificare pe Șpagafon.</p><div class="mantp-actions"><button type="button" class="mantp-btn-pri" onclick="mantuirePortalSendVerifySms()">Trimite cod pe Șpagafon</button><button type="button" class="mantp-btn-sec" onclick="mantuirePortalPaymentBack()">Înapoi</button></div>`:checkout}<p class="tsm tmut" style="margin-top:10px">După plată vei primi automat solicitarea de verificare prin SMS.</p>`;
    if(!m.registrationPaid&&pane==='psd')globalThis.syncPsdDcRouteSelect('mantpay-psd-int');
    return;
  }
  if(_mantuirePortalStep===3){
    body.innerHTML=`<span class="mantp-seal">Verificare</span><p>Ți-am trimis pe <strong>Șpagafon</strong> un cod unic. Confirmă înregistrarea pentru a deschide consola cheii API.</p><label style="display:block;font-weight:700;margin-top:8px">Cod din mesaj</label><input type="text" class="mantp-inp verif-code-inp" id="mant-verify-inp" maxlength="6" placeholder="000000" autocomplete="one-time-code" inputmode="numeric" pattern="[0-9]*" oninput="this.value=this.value.replace(/\\D/g,'').slice(0,6)"/><div class="mantp-actions"><button type="button" class="mantp-btn-pri" onclick="mantuirePortalVerifyCode()">Confirmă</button><button type="button" class="mantp-btn-sec" onclick="mantuirePortalSmsBack()">Înapoi</button></div><p class="tsm tmut" style="margin-top:10px">Dacă nu vezi mesajul, deschide Șpagafon și folosește butonul din SMS.</p>`;
    return;
  }
  if(_mantuirePortalStep===4){
    if(!m.draftKey)m.draftKey=generateMantuireApiKey(_mantuirePortalKeyEnv);
    globalThis.saveState();
    const envSel=_mantuirePortalKeyEnv==='test'?'test':'live';
    body.innerHTML=`<span class="mantp-seal">Cheie API</span><div class="fg mb0" style="margin-bottom:10px"><label for="mant-portal-env">Tip cheie</label><select id="mant-portal-env" class="mantp-inp" style="margin-top:4px" onchange="mantuirePortalRegenDraftKeys()"><option value="live"${envSel==='live'?' selected':''}>Cheie live (utilizare obișnuită)</option><option value="test"${envSel==='test'?' selected':''}>Cheie test (încercări)</option></select></div><p>Înregistrarea <strong>Mântuire Proiecte</strong> este gata. Copiază <strong>cheia secretă</strong> (<code>mnt_sk_…</code>) în Manager Integrări.</p><p class="tsm tmut" style="margin:6px 0 4px">Cheie secretă</p><div class="mantp-keybox">${globalThis.escapeHtml(m.draftKey)}</div><div class="mantp-actions"><button type="button" class="mantp-btn-pri" onclick="copyMantuirePortalKey(false)">Copiază cheia secretă</button><button type="button" class="mantp-btn-pri" onclick="finalizeMantuireIntegration()">Trimite în SifonatorPRO</button></div><p class="tsm" style="opacity:.85;margin-top:10px">Schimbarea tipului de cheie regenerează secretul.</p>`;
    return;
  }
  body.innerHTML=`<span class="mantp-seal">Reîncărcare</span><p class="tsm">Stare portal neprevăzută. Reîncepeți deschiderea.</p><div class="mantp-actions"><button type="button" class="mantp-btn-pri" onclick="openMantuirePortal()">Reîncarcă portalul</button></div>`;
}
function mantuirePortalPaymentBack(){
  globalThis.ensureMantuireIntegration();
  const m=globalThis.S.integrations.mantuireCloud;
  m.wizardPhase=1;
  _mantuirePortalStep=1;
  mantuireSetPayPane('methods');
  globalThis.saveState();
  renderMantuirePortalBody();
}
function mantuirePayPaneNav(p){mantuireSetPayPane(p);renderMantuirePortalBody();}
function mantuirePortalTryPsdInline(){
  globalThis.ensureIntegrations();
  if(!globalThis.isPsdDcLinked()){
    const br=mantuireBrand();
    globalThis.dlgOpen('Continuare · taxă înregistrare','PSD Direct Connect',
      `<p class="tsm lh165">Pentru plata cu <strong>bani publici</strong> prin PSD Direct Connect este nevoie de cont verificat și cheie API în <strong>Manager Integrări</strong>. Poți plăti acum cu <strong>SifonPay</strong> (card) sau să închizi portalul și să configurezi integrarea PSD, apoi revii la plată.</p><p class="tsm tmut" style="margin-top:12px;font-weight:700">Alege cum continui:</p><ul class="tsm u-lh155" style="margin:8px 0 0 18px;padding:0"><li><strong>Plătesc cu SifonPay</strong>: rămâi în acest portal și completezi cardul.</li><li><strong>Închid portalul · Manager Integrări</strong>: configurezi PSD Direct Connect, apoi deschizi din nou <strong>${globalThis.escapeHtml(br.name)}</strong> pentru plată.</li></ul><div style="display:flex;flex-direction:column;gap:10px;margin-top:16px"><button type="button" class="btn btn-p" onclick="dlgClose();mantuirePayPaneNav('card')">Plătesc cu SifonPay</button><button type="button" class="btn btn-psd" onclick="dlgClose();closeMantuirePortal();navigate('integ')">Închid portalul · Manager Integrări</button><button type="button" class="btn btn-f" onclick="dlgClose()">Închide</button></div>`,
      ''
    );
    return;
  }
  mantuirePayPaneNav('psd');
}
function mantuirePortalProcCardInline(){
  const ctx={kind:'mantuire_reg',amount:mantuireRegistrationFeeAmount()};
  globalThis.CARD_PAY_CTX=ctx;
  const num=globalThis.$('mantpay-num')?.value?.replace(/\s/g,'');
  const mantpayCvvRaw=globalThis.$('mantpay-cvv')?.value||'';
  const mantpayCvv=mantpayCvvRaw.replace(/\D/g,'').slice(0,3);
  if(globalThis.$('mantpay-cvv'))globalThis.$('mantpay-cvv').value=mantpayCvv;
  if(!num||num.length<16||!globalThis.cardExpFilled('mantpay-exp-mm','mantpay-exp-yy')||!/^\d{3}$/.test(mantpayCvv)){globalThis.toast('Completează datele cardului','err');return}
  const st=globalThis.$('mant-pay-card-status');
  if(st)st.innerHTML='<p class="tsm tmut" style="text-align:center;margin:12px 0">Se procesează prin SifonPay…</p>';
  setTimeout(()=>{
    const bankRule=globalThis.needs3DS(num);
    if(bankRule){globalThis.show3DSChallenge(bankRule,num);return}
    globalThis.finishCardCheckout(null);
  },1700);
}
function mantuirePortalSmsBack(){
  globalThis.ensureMantuireIntegration();
  const m=globalThis.S.integrations.mantuireCloud;
  m.pendingVerifyCode='';
  _mantuirePortalStep=2;
  mantuireSetPayPane('methods');
  globalThis.saveState();
  renderMantuirePortalBody();
}
function mantuirePortalSendVerifySms(){
  globalThis.ensureMantuireIntegration();
  const m=globalThis.S.integrations.mantuireCloud;
  if(!m.registrationPaid){globalThis.toast('Plătește mai întâi taxa de înregistrare','warn');return}
  const code=String(100000+Math.floor(Math.random()*900000));
  m.pendingVerifyCode=code;m.draftKey='';m.registryTicks=0;m.wizardPhase=3;
  globalThis.saveState();
  globalThis.spagafonPushSms('Mântuire Proiecte',`Cod verificare API Mântuire Proiecte: ${code}. Valabil 15 minute. Introduceți-l în portalul furnizorului.`,{code,isMantuireVerify:true});
  globalThis.addAct('Mântuire Proiecte: cod de verificare trimis pe Șpagafon.');
  _mantuirePortalStep=3;
  renderMantuirePortalBody();
  globalThis.toast('Verifică mesajul pe Șpagafon','ok');
}
function mantuireMarkRegistrationPaidAndSendSms(){
  globalThis.ensureMantuireIntegration();
  const m=globalThis.S.integrations.mantuireCloud;
  m.registrationPaid=true;
  globalThis.saveState();
  mantuirePortalSendVerifySms();
}
function mantuirePortalStep1Continue(){
  if(!globalThis.$('mant-terms')?.checked){globalThis.toast('Trebuie să accepți termenii furnizorului','warn');return}
  globalThis.ensureMantuireIntegration();
  const m=globalThis.S.integrations.mantuireCloud;
  m.registryTicks=0;
  m.wizardPhase=Math.max(m.wizardPhase||1,2);
  if(!m.registrationPaid){_mantuirePortalStep=2;mantuireSetPayPane('methods');globalThis.saveState();renderMantuirePortalBody();return;}
  mantuirePortalSendVerifySms();
}
function mantuirePortalVerifyCode(){
  const inp=globalThis.sanitizeVerifCodeDigits(globalThis.$('mant-verify-inp')?.value,6);
  globalThis.ensureMantuireIntegration();
  const m=globalThis.S.integrations.mantuireCloud;
  if(inp!==m.pendingVerifyCode){globalThis.toast('Cod incorect','err');return}
  globalThis.invalidateVerifiedSpagafonCode('mantuire',inp);
  m.pendingVerifyCode='';m.registryTicks=0;m.wizardPhase=4;
  if(!m.draftKey)m.draftKey=generateMantuireApiKey(_mantuirePortalKeyEnv);
  globalThis.saveState();
  _mantuirePortalStep=4;
  renderMantuirePortalBody();
  globalThis.addAct('Mântuire Proiecte: verificare confirmată; consolă cheie API deschisă.');
  globalThis.toast('Cod acceptat. Copiază cheia sau trimite în aplicație','ok');
}
function copyMantuirePortalKey(fromActive){
  globalThis.ensureMantuireIntegration();
  const m=globalThis.S.integrations.mantuireCloud;
  const k=fromActive&&m.linked?m.apiKey:((!fromActive&&_mantuirePortalStep===4&&m.draftKey)?m.draftKey:'');
  if(!k){globalThis.toast('Nu există cheie de copiat','warn');return}
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(k).then(()=>globalThis.toast('Cheie secretă copiată','ok')).catch(()=>globalThis.toast(k,'ok'));
  else globalThis.toast(k,'ok');
}
function finalizeMantuireIntegration(){
  globalThis.ensureMantuireIntegration();
  const m=globalThis.S.integrations.mantuireCloud;
  if(!m.draftKey){globalThis.toast('Finalizează în portal: cod SMS, apoi cheia API','warn');return}
  const sk=m.draftKey;
  m.apiKey=sk;m.linked=true;m.registrationPaid=true;m.draftKey='';m.pendingVerifyCode='';m.wizardPhase=1;m.registryTicks=0;m.keyCreatedAt=Date.now();m.lastUsedAt=0;
  mantuireSyncKeyMetaFromApiKey();
  globalThis.ensureMantuireState();globalThis.S.mantuire.queue=[];globalThis.S.mantuire.credits=5;
  globalThis.clearMantuireDrainTimer();globalThis.mantuireStopLiveTicker();
  globalThis.saveState();closeMantuirePortal();globalThis.syncMantuireAccessUi();globalThis.renderInteg();globalThis.renderMantuire();
  globalThis.addAct('Mântuire Proiecte: integrare activată în SifonatorPRO.');
  globalThis.toast('Mântuire Proiecte conectat la platformă','ok');
}
function regenerateMantuireApiKey(){
  globalThis.ensureMantuireIntegration();
  const m=globalThis.S.integrations.mantuireCloud;
  m.apiKey='';m.linked=false;m.pendingVerifyCode='';
  const env='live';
  m.draftKey=generateMantuireApiKey(env);m.wizardPhase=4;m.registrationPaid=true;m.registryTicks=0;
  globalThis.saveState();_mantuirePortalStep=4;globalThis.renderMantuirePortalBody();
  globalThis.syncMantuireAccessUi();globalThis.renderInteg();globalThis.renderMantuire();
  globalThis.toast('Cheie nouă emisă. Dezactivat în SifonatorPRO. Lipește cheia curentă în Manager integrări','warn');
}
function connectMantuireCloudKey(){
  globalThis.ensureMantuireIntegration();
  const v=globalThis.$('integ-mant-paste')?.value?.trim()||'';
  const m=globalThis.S.integrations.mantuireCloud;
  if(m.linked){globalThis.toast('Integrarea este deja activă','warn');return;}
  if(!v){globalThis.toast('Introdu sau lipește cheia din portalul Mântuire Proiecte','warn');return;}
  if(/^mnt_pk_/i.test(v)){globalThis.toast('Cheile vechi mnt_pk_… nu mai sunt folosite. Lipește doar cheia secretă mnt_sk_live_… sau mnt_sk_test_…','warn');return;}
  if(!/^mnt_sk_(live|test)_/i.test(v)){globalThis.toast('Format așteptat: mnt_sk_live_… sau mnt_sk_test_…','warn');return;}
  if(!m.draftKey){globalThis.toast('Deschide portalul Mântuire Proiecte, confirmă codul din Șpagafon, apoi copiază cheia secretă emisă','warn');return;}
  if(v!==m.draftKey){globalThis.toast('Cheia nu se potrivește cu cea din portal','err');return;}
  m.apiKey=m.draftKey;m.linked=true;m.registrationPaid=true;m.draftKey='';m.pendingVerifyCode='';m.wizardPhase=1;m.registryTicks=0;m.keyCreatedAt=Date.now();m.lastUsedAt=0;
  mantuireSyncKeyMetaFromApiKey();globalThis.ensureMantuireState();globalThis.S.mantuire.queue=[];globalThis.S.mantuire.credits=5;
  globalThis.clearMantuireDrainTimer();globalThis.mantuireStopLiveTicker();
  globalThis.saveState();globalThis.syncMantuireAccessUi();globalThis.renderInteg();globalThis.renderMantuire();
  globalThis.addAct('Mântuire Proiecte: cheie secretă introdusă în Manager Integrări (5 unități de mântuire la start, coadă resetată).');
  globalThis.toast('Mântuire Proiecte este conectat. Primești 5 unități de mântuire pentru început','ok');
}
function revokeMantuireCloud(){
  globalThis.ensureMantuireIntegration();
  globalThis.S.integrations.mantuireCloud={linked:false,apiKey:'',draftKey:'',pendingVerifyCode:'',wizardPhase:1,registryTicks:0,keyEnv:'live',keyCreatedAt:0,lastUsedAt:0,apiTier:'parohial',registrationPaid:false};
  _mantuirePortalStep=1;
  globalThis.ensureMantuireState();globalThis.S.mantuire.queue=[];globalThis.S.mantuire.credits=5;
  globalThis.clearMantuireDrainTimer();globalThis.mantuireStopLiveTicker();
  globalThis.saveState();globalThis.syncMantuireAccessUi();globalThis.renderInteg();globalThis.renderMantuire();
  if(globalThis.$('mantuire-portal')&&!globalThis.$('mantuire-portal').classList.contains('hid'))globalThis.renderMantuirePortalBody();
  globalThis.addAct('Mântuire Proiecte: integrare revocată.');
  globalThis.toast('Integrarea Mântuire Proiecte a fost revocată','warn');
}
function toggleIntegMantKeyReveal(){
  const inp=globalThis.$('integ-mant-paste'),btn=globalThis.$('integ-mant-reveal');
  if(!inp||!btn)return;
  const hide=inp.type==='text';inp.type=hide?'password':'text';btn.textContent=hide?'Afișează':'Ascunde';btn.setAttribute('aria-pressed',hide?'false':'true');
}
function fillMantuireVerifyFromSpagafon(code){
  const inp=globalThis.$('mant-verify-inp');
  if(!inp){globalThis.toast('Deschide portalul Mântuire Proiecte la pasul de verificare','warn');return}
  inp.value=globalThis.sanitizeVerifCodeDigits(code,6);inp.focus();try{inp.select()}catch(e){}globalThis.toggleSpagafon(false);
  globalThis.toast('Cod completat din Șpagafon','ok');
}
function confirmDisableMantuireIntegration(){
  globalThis.dlgClose();
  if(!globalThis.S.settings)globalThis.S.settings={};
  globalThis.S.settings.enableMantuireFeature=false;
  revokeMantuireCloud();
  globalThis.renderSettings();
}
function debugEnableMantuireIntegrationInstant(){
  globalThis.ensureMantuireIntegration();
  const m=globalThis.S.integrations.mantuireCloud;
  m.linked=true;
  m.apiKey=generateMantuireApiKey('live');
  m.draftKey='';
  m.pendingVerifyCode='';
  m.registrationPaid=true;
  m.wizardPhase=4;
  m.registryTicks=0;
  m.keyCreatedAt=Date.now();
  mantuireSyncKeyMetaFromApiKey();
  globalThis.saveState();
  globalThis.renderInteg();
  globalThis.renderMantuire();
  globalThis.syncMantuireAccessUi();
  if(globalThis.$('mantuire-portal')&&!globalThis.$('mantuire-portal').classList.contains('hid')){
    mantuirePortalSetStep('admin');
    renderMantuirePortalBody();
  }
}
function debugAddMantuireCredits(n){
  if(!isMantuireLinked()){
    globalThis.toast('API Mântuire Proiecte nu este activă. Activează integrarea sau folosește „+ API Mântuire” în debug','warn');
    return;
  }
  const add=Math.max(0,Math.floor(Number(n)||0));
  if(!add){globalThis.toast('[DEBUG] Sumă invalidă','warn');return;}
  globalThis.ensureMantuireState();
  const maxWallet=globalThis.MANTUIRE_CREDITS_MAX_WALLET||300;
  const next=Math.min(maxWallet,(globalThis.S.mantuire.credits||0)+add);
  const added=next-(globalThis.S.mantuire.credits||0);
  globalThis.S.mantuire.credits=next;
  globalThis.saveState();
  globalThis.renderMantuire();
  globalThis.toast(added<add?`[DEBUG] +${added} UM (plafon ${maxWallet})`:`[DEBUG] +${add} UM Mântuire`,'ok');
}

function initMantuireCloudIntegration(){
  const assignIfMissing=(k,v)=>{if(typeof globalThis[k]!=='function')globalThis[k]=v;};
  assignIfMissing('mantuireTierMeta',mantuireTierMeta);
  assignIfMissing('mantuireUmCostForTier',mantuireUmCostForTier);
  assignIfMissing('mantuireRegistrationFeeAmount',mantuireRegistrationFeeAmount);
  assignIfMissing('mantuireRegistrationFeeBreakdown',mantuireRegistrationFeeBreakdown);
  assignIfMissing('mantuireRandomRepForTier',mantuireRandomRepForTier);
  assignIfMissing('mantuireRandomKeySuffix',mantuireRandomKeySuffix);
  assignIfMissing('mantuireEnvPillLabel',mantuireEnvPillLabel);
  assignIfMissing('mantuireSyncKeyMetaFromApiKey',mantuireSyncKeyMetaFromApiKey);
  assignIfMissing('mantuirePortalSetEnv',mantuirePortalSetEnv);
  assignIfMissing('mantuirePortalSetStep',mantuirePortalSetStep);
  assignIfMissing('mantuirePortalRegenDraftKeys',mantuirePortalRegenDraftKeys);
  assignIfMissing('renderMantuirePortalBody',renderMantuirePortalBody);
  assignIfMissing('mantuireSetApiTier',mantuireSetApiTier);
  assignIfMissing('mantuireSetPayPane',mantuireSetPayPane);
  assignIfMissing('mantuireGetPayPane',mantuireGetPayPane);
  assignIfMissing('mantuireSetPsdAnim',mantuireSetPsdAnim);
  assignIfMissing('mantuireGetPsdAnim',mantuireGetPsdAnim);
  assignIfMissing('mantuireFeatureEnabled',mantuireFeatureEnabled);
  assignIfMissing('mantuireBrand',mantuireBrand);
  assignIfMissing('isMantuireLinked',isMantuireLinked);
  assignIfMissing('generateMantuireApiKey',generateMantuireApiKey);
  assignIfMissing('openMantuirePortal',openMantuirePortal);
  assignIfMissing('closeMantuirePortal',closeMantuirePortal);
  assignIfMissing('mantuirePortalPaymentBack',mantuirePortalPaymentBack);
  assignIfMissing('mantuirePayPaneNav',mantuirePayPaneNav);
  assignIfMissing('mantuirePortalTryPsdInline',mantuirePortalTryPsdInline);
  assignIfMissing('mantuirePortalProcCardInline',mantuirePortalProcCardInline);
  assignIfMissing('mantuirePortalSmsBack',mantuirePortalSmsBack);
  assignIfMissing('mantuirePortalSendVerifySms',mantuirePortalSendVerifySms);
  assignIfMissing('mantuireMarkRegistrationPaidAndSendSms',mantuireMarkRegistrationPaidAndSendSms);
  assignIfMissing('mantuirePortalStep1Continue',mantuirePortalStep1Continue);
  assignIfMissing('mantuirePortalVerifyCode',mantuirePortalVerifyCode);
  assignIfMissing('copyMantuirePortalKey',copyMantuirePortalKey);
  assignIfMissing('finalizeMantuireIntegration',finalizeMantuireIntegration);
  assignIfMissing('regenerateMantuireApiKey',regenerateMantuireApiKey);
  assignIfMissing('connectMantuireCloudKey',connectMantuireCloudKey);
  assignIfMissing('revokeMantuireCloud',revokeMantuireCloud);
  assignIfMissing('toggleIntegMantKeyReveal',toggleIntegMantKeyReveal);
  assignIfMissing('fillMantuireVerifyFromSpagafon',fillMantuireVerifyFromSpagafon);
  assignIfMissing('confirmDisableMantuireIntegration',confirmDisableMantuireIntegration);
  assignIfMissing('debugEnableMantuireIntegrationInstant',debugEnableMantuireIntegrationInstant);
  assignIfMissing('debugAddMantuireCredits',debugAddMantuireCredits);
}
globalThis.initMantuireCloudIntegration=initMantuireCloudIntegration;
})();