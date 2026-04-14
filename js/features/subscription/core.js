;(function(){
function updBuyH(){
  const h=parseInt(globalThis.$('buy-h')?.value)||0,d=globalThis.disc();
  const base=h*50,dc=Math.round(base*(1-d/100));
  globalThis.$('buy-h-cost') && (globalThis.$('buy-h-cost').textContent=globalThis.fRON(base));
  globalThis.$('buy-h-disc') && (globalThis.$('buy-h-disc').textContent=d>0?`→ ${globalThis.fRON(dc)} (discount ${d.toFixed(1)}%)`:'');
}
function openSubPay(tid){
  const pl=globalThis.PLANS.find(p=>p.id===tid);
  if(!pl)return;
  if(pl.price===0){
    globalThis.toast('Limitele gratuite sunt deja active implicit. Nu trebuie să le „activezi”. Alege un plan plătit pentru ore incluse și beneficii extra','warn');
    return;
  }
  const fp=Math.round(globalThis.applyDisc(pl.price));
  globalThis.dlgOpen(`Abonează-te la ${pl.name}`,`${fp} RON/lună`,
    `<p class="tsm mb14">Alege metoda de plată:</p>
    <div style="display:flex;flex-direction:column;gap:10px">
      <button class="btn btn-p" onclick="dlgClose();openCardPay('${tid}',${fp})">💳 Plată cu Cardul (SifonPay)</button>
      <button class="btn btn-psd" onclick="dlgClose();tryOpenPublicPay('${tid}',${fp})">🏛️ Plată cu Bani Publici (PSD Direct Connect)</button>
    </div>`,
    `<button class="btn btn-f" onclick="dlgClose()">Anulează</button>`
  );
}
function initSubscriptionFeature(){
  globalThis.updBuyH=updBuyH;
  globalThis.openSubPay=openSubPay;
}
globalThis.initSubscriptionFeature=initSubscriptionFeature;
})();