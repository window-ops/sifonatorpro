;(function(){
let _psdDcPortalStep=1;

function openPsdDcPortal(){
  globalThis.ensurePsdDcGlobalInterop();
  globalThis.ensureIntegrations();
  const el=globalThis.$('psd-dc-portal');
  if(!el)return;
  const dc=globalThis.S.integrations.psdDC;
  if(dc.linked)_psdDcPortalStep='admin';
  else if(dc.draftKey)_psdDcPortalStep=3;
  else if(dc.pendingVerifyCode)_psdDcPortalStep=2;
  else _psdDcPortalStep=1;
  el.classList.remove('hid');
  el.setAttribute('aria-hidden','false');
  renderPsdDcPortalBody();
}
function closePsdDcPortal(){
  globalThis.$('psd-dc-portal')?.classList.add('hid');
  globalThis.$('psd-dc-portal')?.setAttribute('aria-hidden','true');
}
function renderPsdDcPortalBody(){
  globalThis.ensurePsdDcGlobalInterop();
  const body=globalThis.$('psd-dc-body');
  if(!body)return;
  globalThis.ensureIntegrations();
  const dc=globalThis.S.integrations.psdDC;
  const u=globalThis.S.user;
  if(_psdDcPortalStep==='admin'&&dc.linked){
    body.innerHTML=`<span class="psd-dc-seal">Cont verificat</span>
      <p>Cont <strong>politician cu influență</strong> sincronizat cu identitatea din SEAP. Gestionezi cheia API pentru SifonatorPRO și alte aplicații similare.</p>
      <div class="psd-dc-keybox">${globalThis.escapeHtml(dc.apiKey)}</div>
      <div class="psd-dc-actions">
        <button type="button" class="psd-dc-btn-psd" onclick="copyPsdDcApiKey()">Copiază cheia</button>
        <button type="button" class="psd-dc-btn-ghost" onclick="regeneratePsdDcApiKey()">Emite cheie nouă</button>
        <button type="button" class="psd-dc-btn-ghost" onclick="revokePsdDcIntegration()">Revocă integrarea</button>
      </div>
      ${globalThis.psdDcRestrictionsHtml()}`;
    return;
  }
  if(_psdDcPortalStep===1){
    body.innerHTML=`<span class="psd-dc-seal">Înregistrare</span>
      <p>In crearea <strong>contului de politician cu influență</strong> se folosesc aceleași date ca la autentificarea prin SEAP în SifonatorPRO.</p>
      <div class="psd-dc-grid">
        <div class="psd-dc-row"><span class="psd-dc-k">Nume afișat</span><span class="psd-dc-v">${globalThis.escapeHtml(u.name||'-')}</span></div>
        <div class="psd-dc-row"><span class="psd-dc-k">Funcție</span><span class="psd-dc-v">${globalThis.escapeHtml(u.fn||'-')}</span></div>
        <div class="psd-dc-row"><span class="psd-dc-k">Județ</span><span class="psd-dc-v">${globalThis.escapeHtml(u.jud||'-')}</span></div>
        <div class="psd-dc-row"><span class="psd-dc-k">Filieră politică</span><span class="psd-dc-v">${globalThis.escapeHtml(u.party||'-')}</span></div>
      </div>
      <label style="display:flex;gap:10px;align-items:flex-start;margin-top:12px;cursor:pointer">
        <input type="checkbox" id="psd-dc-terms"/>
        <span>Accept <strong>Termenii și Condițiile PSD</strong> pentru PSD Direct Connect, utilizarea endpoint-urilor și fluxurile asociate.</span>
      </label>
      <div class="psd-dc-legal">„Politicianul declară că influența este folosită pentru integrări operaționale conform liniei de partid. PSD nu garantează absolvirea responsabilității juridice a politicianului.”</div>
      <div class="psd-dc-actions">
        <button type="button" class="psd-dc-btn-psd" onclick="psdDcPortalStep1Continue()">Continuă către verificare</button>
      </div>`;
    return;
  }
  if(_psdDcPortalStep===2){
    body.innerHTML=`<span class="psd-dc-seal">Verificare</span>
      <p>Ți-am trimis pe <strong>Șpagafon</strong> un cod unic. Confirmă autentificarea pentru a deschide consola cheii API.</p>
      <label style="display:block;font-weight:700;margin-top:8px">Cod din mesaj</label>
      <input type="text" class="psd-dc-inp verif-code-inp" id="psd-dc-code-inp" maxlength="6" placeholder="000000" autocomplete="one-time-code" inputmode="numeric" pattern="[0-9]*" oninput="this.value=this.value.replace(/\\D/g,'').slice(0,6)"/>
      <div class="psd-dc-actions">
        <button type="button" class="psd-dc-btn-psd" onclick="psdDcPortalVerifyCode()">Confirmă</button>
        <button type="button" class="psd-dc-btn-ghost" onclick="psdDcPortalBackToRegister()">Înapoi</button>
      </div>`;
    return;
  }
  if(_psdDcPortalStep===3){
    if(!dc.draftKey)dc.draftKey=globalThis.generatePsdDcApiKey();
    globalThis.saveState();
    body.innerHTML=`<span class="psd-dc-seal">Cheie API</span>
      <p>Cont activ în PSD Direct Connect. Cheia de mai jos este valabilă doar până o înlocuiești sau o revoci. În SifonatorPRO trebuie introdusă manual (lipire) sau trimisă cu butonul de mai jos.</p>
      <div class="psd-dc-keybox">${globalThis.escapeHtml(dc.draftKey)}</div>
      <div class="psd-dc-actions">
        <button type="button" class="psd-dc-btn-psd" onclick="copyPsdDcApiKey()">Copiază cheia</button>
        <button type="button" class="psd-dc-btn-psd" onclick="finalizePsdDcIntegration()">Trimite în SifonatorPRO</button>
      </div>`;
  }
}
function psdDcPortalStep1Continue(){
  if(!globalThis.$('psd-dc-terms')?.checked){globalThis.toast('Trebuie să accepți termenii PSD','warn');return;}
  globalThis.ensureIntegrations();
  const code=String(100000+Math.floor(Math.random()*900000));
  globalThis.S.integrations.psdDC.pendingVerifyCode=code;
  globalThis.S.integrations.psdDC.draftKey='';
  globalThis.saveState();
  globalThis.spagafonPushSms('PSD Direct Connect',`Cod verificare cont politician: ${code}. Valabil 15 minute.`,{code,isPsdDcVerify:true});
  globalThis.addAct('PSD Direct Connect: cod de verificare trimis pe Șpagafon.');
  _psdDcPortalStep=2;
  renderPsdDcPortalBody();
  globalThis.toast('Verifică mesajul pe Șpagafon','ok');
}
function psdDcPortalVerifyCode(){
  const inp=globalThis.sanitizeVerifCodeDigits(globalThis.$('psd-dc-code-inp')?.value,6);
  globalThis.ensureIntegrations();
  if(inp!==globalThis.S.integrations.psdDC.pendingVerifyCode){globalThis.toast('Cod incorect','err');return;}
  globalThis.invalidateVerifiedSpagafonCode('psd',inp);
  globalThis.S.integrations.psdDC.pendingVerifyCode='';
  _psdDcPortalStep=3;
  renderPsdDcPortalBody();
  globalThis.addAct('PSD Direct Connect: autentificare confirmată; consolă cheie API deschisă.');
  globalThis.saveState();
}
function psdDcPortalBackToRegister(){
  globalThis.ensureIntegrations();
  _psdDcPortalStep=1;
  globalThis.S.integrations.psdDC.pendingVerifyCode='';
  globalThis.S.integrations.psdDC.draftKey='';
  globalThis.saveState();
  renderPsdDcPortalBody();
}
function copyPsdDcApiKey(){
  globalThis.ensureIntegrations();
  const dc=globalThis.S.integrations.psdDC;
  const k=_psdDcPortalStep==='admin'&&dc.linked?dc.apiKey:(_psdDcPortalStep===3?dc.draftKey:'');
  if(!k){globalThis.toast('Nu există cheie de copiat','warn');return;}
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(k).then(()=>globalThis.toast('Cheie copiată','ok')).catch(()=>globalThis.toast(k,'ok'));
  }else globalThis.toast(k,'ok');
}
function finalizePsdDcIntegration(){
  globalThis.ensureIntegrations();
  const dc=globalThis.S.integrations.psdDC;
  if(!dc.draftKey){globalThis.toast('Emite mai întâi cheia din portal','warn');return;}
  dc.apiKey=dc.draftKey;
  dc.linked=true;
  dc.draftKey='';
  globalThis.saveState();
  closePsdDcPortal();
  globalThis.renderInteg();
  globalThis.addAct('PSD Direct Connect: integrare activată în SifonatorPRO.');
  globalThis.toast('PSD Direct Connect conectat la platformă','ok');
}
function connectPsdDcManualKey(){
  globalThis.ensureIntegrations();
  const v=globalThis.$('integ-psd-paste')?.value?.trim()||'';
  const dc=globalThis.S.integrations.psdDC;
  if(dc.linked){globalThis.toast('Integrarea este deja activă','warn');return;}
  if(!v){globalThis.toast('Introdu sau lipește cheia din portalul PSD Direct Connect','warn');return;}
  if(!dc.draftKey){globalThis.toast('Deschide portalul PSD Direct Connect și emite o cheie nouă','warn');return;}
  if(v!==dc.draftKey){globalThis.toast('Cheia nu se potrivește cu cea activă în portal','err');return;}
  dc.apiKey=dc.draftKey;
  dc.linked=true;
  dc.draftKey='';
  globalThis.saveState();
  globalThis.renderInteg();
  globalThis.addAct('PSD Direct Connect: cheie API introdusă manual în Manager Integrări.');
  globalThis.toast('Integrare PSD activată','ok');
}
function toggleIntegPsdKeyReveal(){
  const inp=globalThis.$('integ-psd-paste'), btn=globalThis.$('integ-psd-reveal');
  if(!inp||!btn)return;
  const hide=inp.type==='text';
  inp.type=hide?'password':'text';
  btn.textContent=hide?'Afișează':'Ascunde';
  btn.setAttribute('aria-pressed',hide?'false':'true');
}
function regeneratePsdDcApiKey(){
  globalThis.ensureIntegrations();
  const dc=globalThis.S.integrations.psdDC;
  dc.apiKey='';
  dc.linked=false;
  dc.draftKey=globalThis.generatePsdDcApiKey();
  globalThis.saveState();
  _psdDcPortalStep=3;
  renderPsdDcPortalBody();
  globalThis.renderInteg();
  globalThis.toast('Cheie nouă emisă. Introdu-o în Manager Integrări. Vechea cheie nu mai este valabilă','warn');
}
function revokePsdDcIntegration(){
  globalThis.ensureIntegrations();
  globalThis.S.integrations.psdDC={linked:false,apiKey:'',draftKey:'',pendingVerifyCode:''};
  _psdDcPortalStep=1;
  globalThis.saveState();
  if(globalThis.$('psd-dc-portal')&&!globalThis.$('psd-dc-portal').classList.contains('hid'))renderPsdDcPortalBody();
  globalThis.renderInteg();
  globalThis.toast('Integrarea PSD Direct Connect a fost revocată','warn');
}
function fillPsdDcCodeFromSpagafon(code){
  const inp=globalThis.$('psd-dc-code-inp');
  if(!inp){globalThis.toast('Deschide PSD Direct Connect la pasul de verificare cu codul din SMS','warn');return;}
  inp.value=globalThis.sanitizeVerifCodeDigits(code,6);
  inp.focus();
  try{inp.select();}catch(e){}
  globalThis.toggleSpagafon(false);
  globalThis.toast('Cod completat. Apasă Confirmă în portal','ok');
}

function initPsdDcPortal(){
  globalThis.openPsdDcPortal=openPsdDcPortal;
  globalThis.closePsdDcPortal=closePsdDcPortal;
  globalThis.renderPsdDcPortalBody=renderPsdDcPortalBody;
  globalThis.psdDcPortalStep1Continue=psdDcPortalStep1Continue;
  globalThis.psdDcPortalVerifyCode=psdDcPortalVerifyCode;
  globalThis.psdDcPortalBackToRegister=psdDcPortalBackToRegister;
  globalThis.copyPsdDcApiKey=copyPsdDcApiKey;
  globalThis.finalizePsdDcIntegration=finalizePsdDcIntegration;
  globalThis.connectPsdDcManualKey=connectPsdDcManualKey;
  globalThis.toggleIntegPsdKeyReveal=toggleIntegPsdKeyReveal;
  globalThis.regeneratePsdDcApiKey=regeneratePsdDcApiKey;
  globalThis.revokePsdDcIntegration=revokePsdDcIntegration;
  globalThis.fillPsdDcCodeFromSpagafon=fillPsdDcCodeFromSpagafon;
}
globalThis.initPsdDcPortal=initPsdDcPortal;
})();