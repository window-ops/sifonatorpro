;(function(){
function dismissDisc(){
  globalThis.$('disc-wrap')?.classList.add('hid');
}

function initDashboard(){
  // Ensure the disclaimer close action is always available globally.
  globalThis.dismissDisc=dismissDisc;
}
globalThis.initDashboard=initDashboard;
})();