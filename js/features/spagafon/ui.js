;(function(){
let spgfAppletId=null;
let spgfNavCloseBound=false;
function normalizeSpagafonSettings(){
  if(!globalThis.S.settings||typeof globalThis.S.settings!=='object')return;
  const m=globalThis.S.settings.spagafonLauncherMode;
  if(m!=='both'&&m!=='icon'&&m!=='text')globalThis.S.settings.spagafonLauncherMode='both';
  if(typeof globalThis.S.settings.spagafonMobileFullDisplay!=='boolean')globalThis.S.settings.spagafonMobileFullDisplay=false;
}
function applySpagafonDisplaySettings(){
  normalizeSpagafonSettings();
  const b=document.body;
  if(!b)return;
  b.classList.remove('spgf-launch-both','spgf-launch-icon','spgf-launch-text','spgf-mobile-full');
  const mode=globalThis.S.settings.spagafonLauncherMode||'both';
  b.classList.add('spgf-launch-'+(mode==='icon'||mode==='text'?mode:'both'));
  if(globalThis.S.settings.spagafonMobileFullDisplay)b.classList.add('spgf-mobile-full');
}
function onSpagafonLauncherModeChange(){
  const sel=globalThis.$('settings-spgf-mode');
  globalThis.S.settings.spagafonLauncherMode=(sel&&['both','icon','text'].includes(sel.value))?sel.value:'both';
  applySpagafonDisplaySettings();
  globalThis.renderSettings();
  globalThis.saveState();
}
function onSpagafonMobileFullChange(){
  const cb=globalThis.$('settings-spgf-mobile-full');
  globalThis.S.settings.spagafonMobileFullDisplay=!!cb?.checked;
  applySpagafonDisplaySettings();
  globalThis.renderSettings();
  globalThis.saveState();
}
function invalidateVerifiedSpagafonCode(kind,code){
  const v=String(code||'');
  if(!v||!Array.isArray(globalThis.S.smsInbox))return;
  globalThis.S.smsInbox.forEach(m=>{
    const k3=kind==='3ds'&&m.is3ds,kP=kind==='psd'&&m.isPsdDcVerify,kA=kind==='anaf'&&m.isAnafCert,kAd=kind==='anaf-discard'&&m.isAnafDiscardVerify,kM=kind==='mantuire'&&m.isMantuireVerify;
    if((k3||kP||kA||kAd||kM)&&String(m.code||'')===v){m.code=null;m.codeConsumed=true;}
  });
  if(globalThis.$('spagafon-root')?.classList.contains('open')){renderSpagafon();renderSpagafonAppletUI();}
}
function renderSpagafon(){
  const box=globalThis.$('spgf-msgs');
  if(!box)return;
  if(!globalThis.S.smsInbox.length){
    const br=globalThis.mantuireBrand();
    box.innerHTML=`<p class="spgf-empty">Niciun SMS încă.<br/>Codurile 3D Secure (SifonPay), verificările PSD Direct Connect, certificatele ANAF Sync, codurile pentru ștergerea cheii ANAF și codurile ${globalThis.escapeHtml(br.name)} apar aici.</p>`;
    return;
  }
  box.innerHTML=globalThis.S.smsInbox.map(m=>{
    let actions='';
    if(m.codeConsumed&&(m.is3ds||m.isPsdDcVerify||m.isAnafCert||m.isAnafDiscardVerify||m.isMantuireVerify))actions+=`<div class="sm-actions"><span class="tsm tmut" style="display:block;opacity:.72">Cod folosit și invalidat după verificare.</span></div>`;
    else{
      const encCode=encodeURIComponent(String(m.code||''));
      if(m.is3ds&&m.code)actions+=`<div class="sm-actions"><button type="button" class="btn btn-sm btn-s" data-spgf-action="tds" data-spgf-code="${encCode}">Completează în plată</button></div>`;
      if(m.isPsdDcVerify&&m.code)actions+=`<div class="sm-actions"><button type="button" class="btn btn-sm btn-s" style="background:var(--psd)" data-spgf-action="psd" data-spgf-code="${encCode}">Completează în PSD DC</button></div>`;
      if(m.isAnafCert&&m.code)actions+=`<div class="sm-actions"><button type="button" class="btn btn-sm btn-s" data-spgf-action="anaf-cert" data-spgf-code="${encCode}">Completează certificat ANAF Sync</button></div>`;
      if(m.isAnafDiscardVerify&&m.code)actions+=`<div class="sm-actions"><button type="button" class="btn btn-sm btn-s" data-spgf-action="anaf-discard" data-spgf-code="${encCode}">Completează PIN ștergere cheie</button></div>`;
      if(m.isMantuireVerify&&m.code){
        const br=globalThis.mantuireBrand();
        actions+=`<div class="sm-actions"><button type="button" class="btn btn-sm btn-s" style="background:var(--mant-primary);color:#fff" data-spgf-action="mantuire" data-spgf-code="${encCode}">Completează în ${globalThis.escapeHtml(br.name)}</button></div>`;
      }
    }
    const extra=m.is3ds||m.isPsdDcVerify||m.isAnafCert||m.isAnafDiscardVerify||m.isMantuireVerify?' sm-code':'';
    return`<div class="spgf-msg${extra}"><div class="sm-from">${globalThis.escapeHtml(m.from)}</div><div class="sm-body">${globalThis.escapeHtml(m.body)}</div><div class="sm-time">${globalThis.escapeHtml(m.t||'')}</div>${actions}</div>`;
  }).join('');
}
function spgfSetTab(which){
  globalThis.$('spgf-tab-sms')?.classList.toggle('on',which==='sms');
  globalThis.$('spgf-tab-apps')?.classList.toggle('on',which==='apps');
  globalThis.$('spgf-pane-sms')?.classList.toggle('on',which==='sms');
  globalThis.$('spgf-pane-apps')?.classList.toggle('on',which==='apps');
  renderSpagafonAppletUI();
}
function spgfApRow(k,v){return`<div class="spgf-ap-row"><span class="spgf-ap-k">${globalThis.escapeHtml(k)}</span><span class="spgf-ap-v">${globalThis.escapeHtml(v)}</span></div>`;}
function spgfDeskBtn(navKey){return`<button type="button" class="btn btn-sm btn-f" style="width:100%;margin-top:12px;color:#fff;border-color:rgba(255,255,255,.22)" data-nav="${navKey}" onclick="spgfOpenDesktopFromAttr(this)">Ecran mare: deschide în platformă</button>`;}
function spgfOpenDesktopFromAttr(el){const v=el&&el.dataset&&el.dataset.nav;if(v)spgfOpenDesktop(v);}
function spgfOpenDesktop(v){
  spgfAppletId=null;
  renderSpagafonAppletUI();
  globalThis.navigate(v);
  toggleSpagafon(false);
}
function spgfCloseApplet(){spgfAppletId=null;renderSpagafonAppletUI();}
function spgfOpenApplet(id){spgfAppletId=id;spgfSetTab('apps');}
function renderSpagafonAppletUI(){
  const back=globalThis.$('spgf-applet-back'),grid=globalThis.$('spgf-app-grid'),host=globalThis.$('spgf-applet-host');
  if(!host)return;
  if(spgfAppletId){back?.classList.remove('hid');grid?.classList.add('hid');host.innerHTML=buildSpagafonAppletHtml(spgfAppletId);}
  else{back?.classList.add('hid');grid?.classList.remove('hid');host.innerHTML='';}
}
function buildSpagafonAppletHtml(id){
  const desk=(k)=>spgfDeskBtn(k);
  if(id==='dash'){
    const av=globalThis.wandAvailSec(),tim=av===Infinity?'∞':globalThis.fSec(av),sess=globalThis.S.activeSession?'⚡ sesiune activă':'😴 fără optimizare live';
    return`<div class="spgf-ap-title">Tablou VIP</div>${spgfApRow('Reputație',String(globalThis.S.rep)+' pt')}${spgfApRow('Sifonat',globalThis.fRON(globalThis.S.siphoned))}${spgfApRow('Presiune judiciară',String(globalThis.S.judiciaryRisk)+'%')}${spgfApRow('DNA / etapă',globalThis.justiceStageRo(globalThis.S.justice?.stage||'clean'))}${spgfApRow('Bagheta (timp)',tim)}${spgfApRow('Status sesiune',sess)}<p class="spgf-ap-mut">Versiunea mobilă pentru demnitari grăbiți.</p>${desk('dash')}`;
  }
  if(id==='proj'){
    const rows=globalThis.S.projects.slice(0,6).map(p=>{const raw=p.name||'-',nm=raw.length>36?raw.slice(0,34)+'…':raw;return`<li>${globalThis.escapeHtml(nm)} · <strong>${globalThis.escapeHtml(globalThis.sLabel(p.status))}</strong></li>`;}).join('')||'<li>Niciun proiect. Perfect pentru tranșee invizibile.</li>';
    return`<div class="spgf-ap-title">Proiecte „publice”</div>${spgfApRow('Total în portofoliu',String(globalThis.S.projects.length))}<ul class="spgf-ap-list">${rows}</ul><p class="spgf-ap-mut">Aplicația completă: licitații, dosare, pariuri pe calitate.</p>${desk('proj')}`;
  }
  if(id==='tend'){
    const rows=globalThis.S.tenders.slice(0,6).map(t=>{const raw=t.name||'Licit.',nm=raw.length>32?raw.slice(0,30)+'…':raw;return`<li>${globalThis.escapeHtml(nm)} · ${globalThis.escapeHtml(globalThis.tsLabel(t.status))}</li>`;}).join('')||'<li>Nicio licitație. SEAP-ul așteaptă „corectitudinea” ta.</li>';
    return`<div class="spgf-ap-title">Licitații express</div>${spgfApRow('Licitații (total)',String(globalThis.S.tenders.length))}<ul class="spgf-ap-list">${rows}</ul><p class="spgf-ap-mut">Publică, contestă, câștigă; totul din varianta desktop.</p>${desk('tend')}`;
  }
  if(id==='wand'){
    const av=globalThis.wandAvailSec(),tim=av===Infinity?'Nelimitat (abonament)':globalThis.fSec(av);
    let extra='';
    if(globalThis.S.activeSession){
      const p=globalThis.S.projects.find(x=>x.id===globalThis.S.activeSession.projectId),pn=p&&p.name?p.name:'-',pshort=pn.length>28?pn.slice(0,26)+'…':pn;
      extra=spgfApRow('Proiect curent',pshort)+spgfApRow('Factor „optimizare”',(globalThis.S.activeSession.factor*100).toFixed(0)+'%');
    }
    return`<div class="spgf-ap-title">Bagheta mobilă</div>${spgfApRow('Timp disponibil',tim)}${extra}<p class="spgf-ap-mut">Pornești sesiunea doar din platformă; aici doar vezi cât ai „inspiratie” rămasă.</p>${desk('wand')}`;
  }
  if(id==='just'){
    const st=globalThis.justiceStageRo(globalThis.S.justice?.stage||'clean');
    return`<div class="spgf-ap-title">Linie DNA</div>${spgfApRow('Etapă curentă',st)}${spgfApRow('Presiune estimată',String(globalThis.S.judiciaryRisk)+'%')}${spgfApRow('Manipulare ancheta',String(globalThis.manipCost('ancheta'))+' pt')}${spgfApRow('Manipulare sever',String(globalThis.manipCost('puscarie'))+' pt')}<p class="spgf-ap-mut">„Nu înlocuiește avocatul. Nici bunul-simț."</p>${desk('just')}`;
  }
  if(id==='sub'){
    const pl=globalThis.hasPaidSubscription()?globalThis.PLANS.find(p=>p.id===globalThis.S.sub.tier):null;
    const line=pl?`${pl.name} · exp. ${(globalThis.S.sub.exp||'').slice(0,10)}`:'Fără abonament plătit (limite gratuite)';
    return`<div class="spgf-ap-title">SifonPay mobil</div>${spgfApRow('Status',line)}${spgfApRow('Reducere reputație',globalThis.disc().toFixed(1)+'%')}<p class="spgf-ap-mut">3D Secure și „fonduri publice” rămân pe ecranul mare</p>${desk('sub')}`;
  }
  if(id==='press'){
    const sc=globalThis.computePressDisplayScore(),h=globalThis.S.pressHistory&&globalThis.S.pressHistory[0],hl=h?((h.txt||'').length>80?h.txt.slice(0,78)+'…':h.txt):'… liniște editorială suspectă';
    return`<div class="spgf-ap-title">Presă &amp; imagine</div>${spgfApRow('Scor afișat',String(sc)+'/100')}${spgfApRow('Ton presă (brut)',String(globalThis.S.pressTone))}${spgfApRow('Ultimul titlu',hl)}<p class="spgf-ap-mut">Briefing-urile costă reputație. Vezi canalul în platformă.</p>${desk('press')}`;
  }
  if(id==='ops'){
    const openP=globalThis.S.projects.filter(p=>p.status==='in_progress').length,wand=globalThis.S.activeSession?'ACTIVĂ':'INACTIVĂ';
    return`<div class="spgf-ap-title">Centru operațional</div>${spgfApRow('Proiecte în execuție',String(openP))}${spgfApRow('Bagheta',wand)}${spgfApRow('Presiune juridică',String(globalThis.S.judiciaryRisk)+'%')}${spgfApRow('Etapă justiție',globalThis.justiceStageRo(globalThis.S.justice?.stage||'clean'))}<p class="spgf-ap-mut">HUD tactic pentru corupți.</p>${desk('ops')}`;
  }
  return`<div class="spgf-ap-title">Aplicație</div><p class="spgf-ap-mut">Necunoscut.</p>${desk('dash')}`;
}
function toggleSpagafon(force){
  const root=globalThis.$('spagafon-root');
  if(!root)return;
  const open=force===undefined?!root.classList.contains('open'):!!force;
  root.classList.toggle('open',open);
  globalThis.$('app')?.classList.toggle('spagafon-open',open);
  document.body.classList.toggle('spagafon-open',open);
  globalThis.$('spgf-launcher')?.setAttribute('aria-expanded',open?'true':'false');
  globalThis.$('spgf-sheet')?.setAttribute('aria-hidden',open?'false':'true');
  if(open){
    globalThis.S.spagafonLastSeen=Date.now();
    globalThis.updSpagafonBadge();
    renderSpagafon();
    renderSpagafonAppletUI();
  }else{
    spgfAppletId=null;
    renderSpagafonAppletUI();
  }
}
function spagafonWelcome(){
  globalThis.spagafonPushSms('Șpagafon','Bun venit! Ai activat linia mobilă „de serviciu". SMS-urile pentru 3D Secure (SifonPay) apar în Mesaje.');
}
function resetSpagafonEphemeralState(){spgfAppletId=null;renderSpagafonAppletUI();}
function initSpagafonUi(){
  globalThis.normalizeSpagafonSettings=normalizeSpagafonSettings;
  globalThis.applySpagafonDisplaySettings=applySpagafonDisplaySettings;
  globalThis.onSpagafonLauncherModeChange=onSpagafonLauncherModeChange;
  globalThis.onSpagafonMobileFullChange=onSpagafonMobileFullChange;
  globalThis.invalidateVerifiedSpagafonCode=invalidateVerifiedSpagafonCode;
  globalThis.renderSpagafon=renderSpagafon;
  globalThis.spgfSetTab=spgfSetTab;
  globalThis.spgfOpenDesktopFromAttr=spgfOpenDesktopFromAttr;
  globalThis.spgfOpenDesktop=spgfOpenDesktop;
  globalThis.spgfCloseApplet=spgfCloseApplet;
  globalThis.spgfOpenApplet=spgfOpenApplet;
  globalThis.renderSpagafonAppletUI=renderSpagafonAppletUI;
  globalThis.toggleSpagafon=toggleSpagafon;
  globalThis.spagafonWelcome=spagafonWelcome;
  globalThis.resetSpagafonEphemeralState=resetSpagafonEphemeralState;
  if(!spgfNavCloseBound){
    document.addEventListener('click',e=>{
      const btn=e.target?.closest?.('#spagafon-root [data-nav]');
      if(!btn)return;
      setTimeout(()=>toggleSpagafon(false),0);
    });
    spgfNavCloseBound=true;
  }
}
globalThis.initSpagafonUi=initSpagafonUi;
})();