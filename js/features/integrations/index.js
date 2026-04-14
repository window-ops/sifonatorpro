;(function(){
function initIntegrations(){
  if(typeof globalThis.initPsdDcIntegration==='function')globalThis.initPsdDcIntegration();
  if(typeof globalThis.initAnafSyncIntegration==='function')globalThis.initAnafSyncIntegration();
  if(typeof globalThis.initMantuireCloudIntegration==='function')globalThis.initMantuireCloudIntegration();
}
globalThis.initIntegrations=initIntegrations;
})();