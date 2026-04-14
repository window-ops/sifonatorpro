;(function(){
function ensurePsdDcGlobalInterop(){
  if(typeof globalThis.getPsdDcRouteSelection!=='function'&&typeof globalThis.__getPsdDcRouteSelection==='function')globalThis.getPsdDcRouteSelection=globalThis.__getPsdDcRouteSelection;
  if(typeof globalThis.validatePsdDcTransaction!=='function'&&typeof globalThis.__validatePsdDcTransaction==='function')globalThis.validatePsdDcTransaction=globalThis.__validatePsdDcTransaction;
  if(typeof globalThis.commitPsdDcSpend!=='function'&&typeof globalThis.__commitPsdDcSpend==='function')globalThis.commitPsdDcSpend=globalThis.__commitPsdDcSpend;
  if(typeof globalThis.psdDcRestrictionsHtml!=='function'&&typeof globalThis.__psdDcRestrictionsHtml==='function')globalThis.psdDcRestrictionsHtml=globalThis.__psdDcRestrictionsHtml;
  if(typeof globalThis.syncPsdDcRouteSelect!=='function'&&typeof globalThis.__syncPsdDcRouteSelect==='function')globalThis.syncPsdDcRouteSelect=globalThis.__syncPsdDcRouteSelect;
}
function tryOpenPublicPay(tid,fp){
  globalThis.ensureIntegrations();
  if(!globalThis.isPsdDcLinked()){
    globalThis.dlgOpen('Integrare necesară','PSD Direct Connect',`<p class="tsm lh165">Plata cu <strong>bani publici</strong> prin PSD Direct Connect necesită un cont verificat și o cheie API conectată în <strong>Manager Integrări</strong>.</p>`,`<button type="button" class="btn btn-f" onclick="dlgClose()">Închide</button><button type="button" class="btn btn-p" onclick="dlgClose();navigate('integ')">Deschide Manager Integrări</button>`);
    return;
  }
  globalThis.openPublicPay(tid,fp);
}
function tryOpenPublicPayHours(hours,cost){
  globalThis.ensureIntegrations();
  if(!globalThis.isPsdDcLinked()){
    globalThis.dlgOpen('Integrare necesară','PSD Direct Connect',`<p class="tsm lh165">Plata orelor Bagheta cu <strong>bani publici</strong> folosește PSD Direct Connect. Integrează serviciul din <strong>Manager Integrări</strong>.</p>`,`<button type="button" class="btn btn-f" onclick="dlgClose()">Închide</button><button type="button" class="btn btn-p" onclick="dlgClose();navigate('integ')">Deschide Manager Integrări</button>`);
    return;
  }
  globalThis.openPublicPayHours(hours,cost);
}
function initPsdDcRules(){
  globalThis.__ensurePsdDcGlobalInterop=ensurePsdDcGlobalInterop;
  globalThis.__tryOpenPublicPay=tryOpenPublicPay;
  globalThis.__tryOpenPublicPayHours=tryOpenPublicPayHours;
  globalThis.ensurePsdDcGlobalInterop=ensurePsdDcGlobalInterop;
  globalThis.tryOpenPublicPay=tryOpenPublicPay;
  globalThis.tryOpenPublicPayHours=tryOpenPublicPayHours;
}
globalThis.initPsdDcRules=initPsdDcRules;
})();