;(function(){
function syncMantuireAccessUi(){
  globalThis.ensureMantuireIntegration();
  const b=globalThis.mantuireBrand();
  const S=globalThis.S;
  document.body&&document.body.classList.toggle('mant-neutral',!!(S&&S.settings&&S.settings.mantuireNeutralBranding===true));
  globalThis.$('nav-mant-ico')&&(globalThis.$('nav-mant-ico').textContent=b.icon);
  globalThis.$('nav-mant-txt')&&(globalThis.$('nav-mant-txt').textContent=b.name);
  globalThis.$('mant-view-title')&&(globalThis.$('mant-view-title').textContent=b.name);
  globalThis.$('mant-portal-brand')&&(globalThis.$('mant-portal-brand').textContent=b.name);
  if(globalThis.$('mant-portal-sub')){
    globalThis.$('mant-portal-sub').innerHTML=(S&&S.settings&&S.settings.mantuireNeutralBranding===true)
      ?'Portal conectare API · proiecte finalizate slab pot fi <strong>reparate</strong> prin API'
      :'Portal de conectare API · proiecte finalizate slab pot fi <strong>mântuite</strong> prin API';
  }
  if(globalThis.$('mant-view-desc'))globalThis.$('mant-view-desc').innerHTML=b.viewDesc;
  const enabled=globalThis.mantuireFeatureEnabled();
  globalThis.$('nav-mantuire')?.classList.toggle('hid',!enabled||!globalThis.isMantuireLinked());
  if((!enabled||!globalThis.isMantuireLinked())&&globalThis.$('view-mantuire')?.classList.contains('active'))globalThis.navigate('integ');
}
function ensureMantuireState(){
  const S=globalThis.S;
  const MANTUIRE_CREDITS_MAX_WALLET=globalThis.MANTUIRE_CREDITS_MAX_WALLET||120;
  const MANTUIRE_SERVERS=globalThis.MANTUIRE_SERVERS||[{id:'proto_iasi'}];
  if(!S.mantuire||typeof S.mantuire!=='object')S.mantuire={credits:5,serverId:'proto_iasi',queue:[],history:[],usageLog:[],usageByDay:{},stats:{ok:0,fail:0},showUmDayChart:false};
  if(typeof S.mantuire.credits!=='number'||!Number.isFinite(S.mantuire.credits)){const t=S.mantuire.tokens;S.mantuire.credits=(typeof t==='number'&&Number.isFinite(t))?t:5;}
  try{delete S.mantuire.tokens;}catch(e){S.mantuire.tokens=undefined;}
  if(S.mantuire.credits<0)S.mantuire.credits=0;
  if(S.mantuire.credits>MANTUIRE_CREDITS_MAX_WALLET)S.mantuire.credits=MANTUIRE_CREDITS_MAX_WALLET;
  if(!Array.isArray(S.mantuire.queue))S.mantuire.queue=[];
  if(!Array.isArray(S.mantuire.history))S.mantuire.history=[];
  if(S.mantuire.history.length>40)S.mantuire.history.length=40;
  if(!Array.isArray(S.mantuire.usageLog))S.mantuire.usageLog=[];
  if(S.mantuire.usageLog.length>80)S.mantuire.usageLog.length=80;
  if(!S.mantuire.usageByDay||typeof S.mantuire.usageByDay!=='object')S.mantuire.usageByDay={};
  if(!S.mantuire.stats||typeof S.mantuire.stats!=='object')S.mantuire.stats={ok:0,fail:0};
  if(typeof S.mantuire.stats.ok!=='number')S.mantuire.stats.ok=0;
  if(typeof S.mantuire.stats.fail!=='number')S.mantuire.stats.fail=0;
  if(typeof S.mantuire.showUmDayChart!=='boolean')S.mantuire.showUmDayChart=false;
  const sids=MANTUIRE_SERVERS.map(x=>x.id);
  if(!S.mantuire.serverId||!sids.includes(S.mantuire.serverId))S.mantuire.serverId=MANTUIRE_SERVERS[0].id;
}
function ensureMantuireIntegration(){
  const S=globalThis.S;
  if(!S.integrations||typeof S.integrations!=='object')S.integrations={};
  let m=S.integrations.mantuireCloud;
  if(!m||typeof m!=='object'){S.integrations.mantuireCloud={linked:false,apiKey:'',draftKey:'',pendingVerifyCode:'',wizardPhase:1,registryTicks:0,keyEnv:'live',keyCreatedAt:0,lastUsedAt:0,apiTier:'parohial',registrationPaid:false};m=S.integrations.mantuireCloud;}
  if(typeof m.linked!=='boolean')m.linked=false;
  if(typeof m.apiKey!=='string')m.apiKey='';
  if(typeof m.draftKey!=='string')m.draftKey='';
  if(typeof m.pendingVerifyCode!=='string')m.pendingVerifyCode='';
  if(typeof m.wizardPhase!=='number'||m.wizardPhase<1)m.wizardPhase=1;
  if(typeof m.registryTicks!=='number'||m.registryTicks<0)m.registryTicks=0;
  if(typeof m.keyEnv!=='string'||!['live','test'].includes(m.keyEnv))m.keyEnv='live';
  if(typeof m.apiTier!=='string'||!{solemn:1,parohial:1,expedit:1}[m.apiTier])m.apiTier='parohial';
  if(typeof m.registrationPaid!=='boolean')m.registrationPaid=false;
  if(m.linked)m.registrationPaid=true;
  if(m.linked){m.draftKey='';m.pendingVerifyCode='';}
  else if(m.apiKey&&!m.draftKey){m.draftKey=m.apiKey;m.apiKey='';}
  ensureMantuireState();
  globalThis.mantuireSyncKeyMetaFromApiKey?.();
}
function initMantuireStateModule(){
  globalThis.syncMantuireAccessUi=syncMantuireAccessUi;
  globalThis.ensureMantuireState=ensureMantuireState;
  globalThis.ensureMantuireIntegration=ensureMantuireIntegration;
}
globalThis.initMantuireStateModule=initMantuireStateModule;
})();