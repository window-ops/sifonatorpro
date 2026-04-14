;(function(){
function handleSpagafonActionButton(btn){
  if(!btn)return;
  const action=btn.getAttribute('data-spgf-action');
  const codeRaw=btn.getAttribute('data-spgf-code')||'';
  const code=decodeURIComponent(codeRaw);
  if(!code)return;
  if(action==='tds')globalThis.fillTdsFromSpagafon(code);
  else if(action==='psd')globalThis.fillPsdDcCodeFromSpagafon(code);
  else if(action==='anaf-cert')globalThis.fillAnafCertFromSpagafon(code);
  else if(action==='anaf-discard')globalThis.fillAnafDiscardPinFromSpagafon(code);
  else if(action==='mantuire')globalThis.fillMantuireVerifyFromSpagafon(code);
}
function sanitizeVerifCodeDigits(s,maxLen){
  let v=String(s||'').replace(/\D/g,'');
  if(maxLen!=null&&maxLen>=0)v=v.slice(0,maxLen);
  return v;
}
function fillTdsFromSpagafon(code){
  const inp=globalThis.$('tds-code');
  if(inp){
    inp.value=sanitizeVerifCodeDigits(code,12);
    inp.focus();
    try{inp.select();}catch(e){}
  }else{
    globalThis.toast('Deschide mai întâi fereastra 3D Secure din plată','warn');
    return;
  }
  globalThis.toggleSpagafon(false);
  globalThis.toast('Cod completat din Șpagafon. Confirmă apoi autentificarea','ok');
}
function initSpagafon(){
  globalThis.handleSpagafonActionButton=handleSpagafonActionButton;
  globalThis.sanitizeVerifCodeDigits=sanitizeVerifCodeDigits;
  globalThis.fillTdsFromSpagafon=fillTdsFromSpagafon;
}
globalThis.initSpagafon=initSpagafon;
})();