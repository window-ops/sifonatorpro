;(function(){
function ensureIntegrations(){
  const S=globalThis.S;
  if(!S.integrations||typeof S.integrations!=='object')S.integrations={};
  const d=S.integrations.psdDC;
  if(!d||typeof d!=='object')S.integrations.psdDC={linked:false,apiKey:'',draftKey:'',pendingVerifyCode:''};
  if(typeof S.integrations.psdDC.linked!=='boolean')S.integrations.psdDC.linked=false;
  if(typeof S.integrations.psdDC.apiKey!=='string')S.integrations.psdDC.apiKey='';
  if(typeof S.integrations.psdDC.draftKey!=='string')S.integrations.psdDC.draftKey='';
  if(typeof S.integrations.psdDC.pendingVerifyCode!=='string')S.integrations.psdDC.pendingVerifyCode='';
  if(typeof S.integrations.psdDC.dailySpentDate!=='string')S.integrations.psdDC.dailySpentDate='';
  if(typeof S.integrations.psdDC.dailySpentRon!=='number'||!Number.isFinite(S.integrations.psdDC.dailySpentRon)||S.integrations.psdDC.dailySpentRon<0)S.integrations.psdDC.dailySpentRon=0;
  if(S.integrations.psdDC.linked)S.integrations.psdDC.draftKey='';
  else if(S.integrations.psdDC.apiKey&&!S.integrations.psdDC.draftKey){S.integrations.psdDC.draftKey=S.integrations.psdDC.apiKey;S.integrations.psdDC.apiKey='';}
  let a=S.integrations.anafSync;
  if(!a||typeof a!=='object'){S.integrations.anafSync={linked:false,apiKey:'',draftKey:'',pendingCertCode:'',wizardPhase:1,dosarTicks:0};a=S.integrations.anafSync;}
  if(typeof a.linked!=='boolean')a.linked=false;
  if(typeof a.apiKey!=='string')a.apiKey='';
  if(typeof a.draftKey!=='string')a.draftKey='';
  if(typeof a.pendingCertCode!=='string')a.pendingCertCode='';
  if(typeof a.wizardPhase!=='number'||a.wizardPhase<1)a.wizardPhase=1;
  if(typeof a.dosarTicks!=='number'||a.dosarTicks<0)a.dosarTicks=0;
  if(a.linked){a.draftKey='';a.pendingCertCode='';}
  globalThis.ensureMantuireIntegration();
}
function renderInteg(){
  const box=globalThis.$('integ-list');if(!box)return;
  ensureIntegrations();ensureMantuireIntegration();
  const S=globalThis.S;
  const dc=S.integrations.psdDC,an=S.integrations.anafSync,mc=S.integrations.mantuireCloud;
  const mtEnabled=globalThis.mantuireFeatureEnabled(),mtBrand=globalThis.mantuireBrand(),mtNeutral=!!(S&&S.settings&&S.settings.mantuireNeutralBranding===true);
  const ok=globalThis.isPsdDcLinked(),hasStored=ok&&!!dc.apiKey,anOk=globalThis.isAnafSyncLinked(),anHas=anOk&&!!an.apiKey,mtOk=globalThis.isMantuireLinked(),mtHas=mtOk&&!!mc.apiKey;
  box.innerHTML=`
    <div class="integ-card">
      <div class="integ-card-head">
        <div>
          <div class="integ-card-title">PSD Direct Connect</div>
          <p class="tsm tmut integ-card-desc">Endpoint-uri pentru cereri de fonduri publice și plăți „Bani publici” din SifonatorPRO.</p>
        </div>
        <span class="integ-pill ${ok?'integ-pill-ok':'integ-pill-off'}">${ok?'Conectat':'Neconectat'}</span>
      </div>
      <div class="integ-card-actions">
        <button type="button" class="btn btn-psd" onclick="openPsdDcPortal()">Deschide portalul PSD Direct Connect</button>
        <a class="btn btn-psd-soft" href="site/psd-direct-connect.html#acasa:intro" target="_blank" rel="noopener noreferrer">Vezi site-ul PSD Direct Connect</a>
      </div>
      <div class="fg mt14 mb0">
        <label>${hasStored?'Cheie API stocată':'Introdu sau lipește cheia din portal'}</label>
        <div class="integ-paste-row">
          ${hasStored
            ?`<input type="password" readonly class="integ-api-key-inp" id="integ-psd-paste" autocomplete="off" spellcheck="false" value="${globalThis.escapeHtml(dc.apiKey)}" aria-label="Cheie API PSD Direct Connect"/>
              <button type="button" class="btn btn-f" id="integ-psd-reveal" onclick="toggleIntegPsdKeyReveal()" aria-pressed="false" title="Arată sau ascunde cheia">Afișează</button>`
            :`<input type="text" class="integ-api-key-inp" id="integ-psd-paste" placeholder="sdc_live_…" autocomplete="off" spellcheck="false"/>
              <button type="button" class="btn btn-s" onclick="connectPsdDcManualKey()">Conectează</button>`}
        </div>
        <p class="tsm tmut mt6 integ-key-hint">${ok?'După o cheie nouă în portal, integrarea este dezactivată până lipești cheia curentă sau folosești „Trimite în SifonatorPRO”.':dc.draftKey?'Cheia activă este în portal. Copiaz-o și lipește aici (sau „Trimite” din portal).':'Deschide portalul: acceptă termenii și finalizează verificarea pentru a emite o cheie.'}</p>
      </div>
    </div>
    <div class="integ-card">
      <div class="integ-card-head">
        <div>
          <div class="integ-card-title">ANAF Sync</div>
          <p class="tsm tmut integ-card-desc">E-Factura și flux detaliat în aplicație. Înregistrarea necesită <strong>absența unei investigații DNA active</strong> în starea curentă a jocului. Fluxul include certificat pe Șpagafon, dosar procedural și emitere token.</p>
        </div>
        <span class="integ-pill ${anOk?'integ-pill-ok':'integ-pill-off'}">${anOk?'Conectat':'Neconectat'}</span>
      </div>
      <div class="integ-card-actions">
        <button type="button" class="btn btn-p" onclick="openAnafSyncPortal()">Deschide portalul ANAF Sync</button>
      </div>
      <div class="fg mt14 mb0">
        <label>${anHas?'Cheie sincronizare stocată':'Lipește tokenul din portal după certificat și dosar'}</label>
        <div class="integ-paste-row">
          ${anHas
            ?`<input type="password" readonly class="integ-api-key-inp" id="integ-anaf-paste" autocomplete="off" spellcheck="false" value="${globalThis.escapeHtml(an.apiKey)}" aria-label="Cheie ANAF Sync"/>
              <button type="button" class="btn btn-f" id="integ-anaf-reveal" onclick="toggleIntegAnafKeyReveal()" aria-pressed="false" title="Arată sau ascunde cheia">Afișează</button>`
            :`<input type="text" class="integ-api-key-inp" id="integ-anaf-paste" placeholder="asf_live_…" autocomplete="off" spellcheck="false"/>
              <button type="button" class="btn btn-s" onclick="connectAnafSyncManualKey()">Conectează</button>`}
        </div>
        <p class="tsm tmut mt6 integ-key-hint">${anOk?'Pentru copiere sau ștergerea cheii (cu verificări) folosiți portalul ANAF Sync.':an.draftKey?'Tokenul activ este în portalul ANAF Sync. Finalizează dosarul dacă încă e deschis, apoi copiază cheia.':'Deschide portalul: declarație de integritate (fără DNA activ), PIN pe Șpagafon, dosar, apoi emitere token.'}</p>
      </div>
    </div>
    ${mtEnabled?`<div class="integ-card">
      <div class="integ-card-head">
        <div>
          <div class="integ-card-title">${globalThis.escapeHtml(mtBrand.name)}</div>
          <p class="tsm tmut integ-card-desc integ-card-desc--mant">În <strong>portalul</strong> furnizorului plătești o taxă unică de înregistrare, apoi primești cheia secretă (<code>mnt_sk_…</code>). După activare în aplicație, folosește panoul <strong>${globalThis.escapeHtml(mtBrand.name)}</strong> pentru cereri către API și pentru a dobândi, potențial, puncte de reputație adiționale pe proiecte de mântuială.${mtNeutral?'':' Pentru prezentarea completă, consultă <strong>site-ul oficial Mântuire Proiecte</strong>.'}</p>
        </div>
        <span class="integ-pill ${mtOk?'integ-pill-ok':'integ-pill-off'}">${mtOk?'Conectat':'Neconectat'}</span>
      </div>
      <div class="integ-card-actions">
        <button type="button" class="btn btn-mant" onclick="openMantuirePortal()">Deschide ${globalThis.escapeHtml(mtBrand.portalLabel)}</button>
        ${mtNeutral?'':`<a class="btn btn-mant-soft" href="site/mantuire-proiecte.html#acasa:intro" target="_blank" rel="noopener noreferrer">Vezi site-ul Mântuire Proiecte</a>`}
      </div>
      <div class="fg mt14 mb0">
        <label>${mtHas?'Cheie secretă stocată':'Lipește cheia secretă mnt_sk_live_… sau mnt_sk_test_…'}</label>
        <div class="integ-paste-row">
          ${mtHas
            ?`<input type="password" readonly class="integ-api-key-inp" id="integ-mant-paste" autocomplete="off" spellcheck="false" value="${globalThis.escapeHtml(mc.apiKey)}" aria-label="Cheie API Mântuire Proiecte"/>
              <button type="button" class="btn btn-f" id="integ-mant-reveal" onclick="toggleIntegMantKeyReveal()" aria-pressed="false" title="Arată sau ascunde cheia">Afișează</button>`
            :`<input type="text" class="integ-api-key-inp" id="integ-mant-paste" placeholder="mnt_sk_live_…" autocomplete="off" spellcheck="false"/>
              <button type="button" class="btn btn-s" onclick="connectMantuireCloudKey()">Conectează</button>`}
        </div>
        <p class="tsm tmut mt6 integ-key-hint">${mtOk?'După o cheie nouă în portal, integrarea se dezactivează până lipești cheia curentă sau folosești „Trimite în SifonatorPRO”. La prima conectare primești <strong>5 unități de mântuire</strong> (credite); poți cumpăra volume suplimentare până la plafonul din ecranul Mântuire, cu SifonPay sau PSD.':mc.draftKey?'Cheia activă este în portalul Mântuire Proiecte. Copiază <strong>cheia secretă</strong> de acolo.':'Deschide portalul: termeni, cod pe Șpagafon, apoi cheia secretă.'}</p>
      </div>
    </div>`:''}`;
}
function initIntegrationsManager(){
  globalThis.ensureIntegrations=ensureIntegrations;
  globalThis.renderInteg=renderInteg;
}
globalThis.initIntegrationsManager=initIntegrationsManager;
})();