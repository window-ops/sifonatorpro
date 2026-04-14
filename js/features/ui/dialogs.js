;(function(){
function dlgOpen(title,sub,content,actions,opts){
  const o=opts||{};
  globalThis.$('dlg')?.classList.toggle('dlg-mantuire-vendor',!!o.mantuireVendorSkin);
  globalThis.$('dlg')?.classList.toggle('dlg-wide-video',!!o.wideVideo);
  const headerEl=globalThis.$('dlg-h');
  if(headerEl){
    headerEl.textContent='';
    const h3=document.createElement('h3');
    h3.textContent=String(title==null?'':title);
    headerEl.appendChild(h3);
    if(sub){
      const p=document.createElement('p');
      p.textContent=String(sub);
      headerEl.appendChild(p);
    }
  }
  globalThis.$('dlg-c').innerHTML=content;
  globalThis.$('dlg-a').innerHTML=actions;
  const ov=globalThis.$('overlay');
  ov?.classList.toggle('overlay-3ds',!!o.tdsPassthrough);
  ov?.classList.toggle('overlay-mant-vendor',!!o.mantuireVendorSkin);
  const mantuireOpen=globalThis.$('mantuire-portal')&&!globalThis.$('mantuire-portal').classList.contains('hid');
  ov?.classList.toggle('overlay-over-portal',!!o.forceOverPortal||mantuireOpen);
  ov?.classList.remove('hid');
}
function spagafonPinFor3DS(on){
  globalThis.$('spagafon-root')?.classList.toggle('spgf-pinned-3ds',!!on);
  if(on)globalThis.toggleSpagafon(true);
}
function dlgClose(){
  const ov=globalThis.$('overlay');
  globalThis.$('dlg')?.classList.remove('dlg-mantuire-vendor');
  globalThis.$('dlg')?.classList.remove('dlg-wide-video');
  ov?.classList.remove('overlay-3ds');
  ov?.classList.remove('overlay-over-portal');
  ov?.classList.remove('overlay-mant-vendor');
  ov?.classList.add('hid');
  spagafonPinFor3DS(false);
}
function initUiDialogs(){
  globalThis.dlgOpen=dlgOpen;
  globalThis.spagafonPinFor3DS=spagafonPinFor3DS;
  globalThis.dlgClose=dlgClose;
}
globalThis.initUiDialogs=initUiDialogs;
})();