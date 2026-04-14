;(function(){
function mantuireMaxAddableCredits(){
  globalThis.ensureMantuireState();
  return Math.max(0,(globalThis.MANTUIRE_CREDITS_MAX_WALLET||120)-globalThis.S.mantuire.credits);
}
function mantuireUmoSelectedPack(){
  const ix=parseInt(globalThis.$('mant-umo-sel')?.value||'0',10);
  const arr=globalThis.window._mantuireUmoOffer||[];
  return arr[ix]||null;
}
function mantuireUmoPackBreakdown(p){
  if(!p)return{list:0,final:0,pct:0,saved:0};
  const list=Math.round(Number(p.priceRon)||0);
  const pct=globalThis.disc();
  const final=Math.round(globalThis.applyDisc(p.priceRon));
  const saved=Math.max(0,list-final);
  return{list,final,pct,saved};
}
function mantuireUmoPricingRefresh(){
  const box=globalThis.$('mant-umo-price-box');
  if(!box)return;
  const p=mantuireUmoSelectedPack();
  if(!p){box.innerHTML='';return;}
  const br=mantuireUmoPackBreakdown(p);
  const discRow=br.pct>0&&br.saved>0?`<div class="mant-umo-price-row mant-umo-disc"><span>Reducere reputație (${br.pct.toFixed(1)}%)</span><span>-${globalThis.fRON(br.saved)}</span></div>`:`<div class="mant-umo-price-row"><span>Reducere reputație</span><span style="color:#5c4a62">0%: preț neschimbat</span></div>`;
  box.innerHTML=`<div class="mant-umo-price-box-inner"><div class="mant-umo-price-title">Rezumat preț · pachet selectat</div><div class="mant-umo-price-row"><span>Preț de referință</span><span>${globalThis.fRON(br.list)}</span></div>${discRow}<div class="mant-umo-price-row mant-umo-price-total"><span>Total de plată</span><span>${globalThis.fRON(br.final)}</span></div></div>`;
}
function mantuireFinalizeUmoPurchase(um,paidRon,viaLine,bank3ds,meta){
  globalThis.ensureMantuireState();
  const br=globalThis.mantuireBrand();
  const cap=mantuireMaxAddableCredits();
  const add=Math.min(um,cap);
  if(add<=0){globalThis.toast(`Soldul ${br.unitAbbr} a atins plafonul; nu se pot adăuga ${br.unitMany}.`,'warn');return;}
  globalThis.S.mantuire.credits+=add;
  const b=bank3ds?` · 3D Secure ${bank3ds.bank}`:'';
  let act=`${br.name}: +${add} ${br.unitAbbr} · ${viaLine} · ${globalThis.fRON(paidRon)}${b}`;
  if(meta&&typeof meta.siphon==='number')act+=` · ${globalThis.fRON(meta.siphon)} din buget public`;
  act+='.';
  globalThis.addAct(act);
  globalThis.toast(`+${add} credite ${br.unitAbbr} adăugate în cont`,'ok');
  globalThis.saveState();globalThis.renderMantuire();globalThis.renderInteg();globalThis.renderDash();
}
function mantuirePurchaseTokens(){
  globalThis.ensureMantuireState();globalThis.ensureMantuireIntegration();
  if(!globalThis.isMantuireLinked()){globalThis.toast('Conectează API-ul din Manager Integrări','warn');globalThis.navigate('integ');return;}
  const br=globalThis.mantuireBrand();
  const maxAdd=mantuireMaxAddableCredits();
  if(maxAdd<=0){
    globalThis.dlgOpen(`Credite ${globalThis.escapeHtml(br.unitAbbr)}`,'Plafon atins',`<span class="mant-dlg-vendor-seal">${globalThis.escapeHtml(br.name)} · API furnizor</span><p class="tsm" style="line-height:1.6;margin:0">Ai atins plafonul de <strong>${globalThis.MANTUIRE_CREDITS_MAX_WALLET} ${globalThis.escapeHtml(br.unitAbbr)}</strong>. Folosește creditele în ${globalThis.escapeHtml(br.reqMany)}; apoi poți adăuga din nou.</p>`,`<button type="button" class="mantp-btn-pri" onclick="dlgClose()">Închide</button>`,{mantuireVendorSkin:true});
    return;
  }
  const packs=(globalThis.MANTUIRE_UMO_PACKAGES||[]).filter(p=>p.um<=maxAdd).sort((a,b)=>a.um-b.um);
  if(!packs.length){globalThis.toast('Niciun pachet încape în plafonul rămas','warn');return;}
  globalThis.window._mantuireUmoOffer=packs;
  const d=globalThis.disc();
  const opts=packs.map((p,i)=>{const pr=Math.round(globalThis.applyDisc(p.priceRon));return`<option value="${i}">${p.um} ${globalThis.escapeHtml(br.unitAbbr)} - ${globalThis.fRON(pr)}${d>0?' (cu discount reputație)':''} · ${globalThis.escapeHtml(p.note)}</option>`;}).join('');
  globalThis.dlgOpen(`Adaugă credite ${globalThis.escapeHtml(br.unitAbbr)}`,`Magazin ${globalThis.escapeHtml(br.unitName)} (${globalThis.escapeHtml(br.unitAbbr)})`,`<div class="mant-umo-shop"><span class="mant-dlg-vendor-seal">${globalThis.escapeHtml(br.name)} · API furnizor</span><p class="tsm u-lh155" style="margin:0 0 4px">Sold curent: <strong>${globalThis.S.mantuire.credits}</strong> ${globalThis.escapeHtml(br.unitAbbr)} · plafon <strong>${globalThis.MANTUIRE_CREDITS_MAX_WALLET}</strong> ${globalThis.escapeHtml(br.unitAbbr)}.</p><label class="tsm" style="font-weight:700;color:#4a3558;display:block;margin-top:6px" for="mant-umo-sel">Volum</label><select id="mant-umo-sel" class="mant-umo-sel" onchange="mantuireUmoPricingRefresh()">${opts}</select><div id="mant-umo-price-box" class="mant-umo-price-box" aria-live="polite"></div><p class="mant-umo-hint">Reducerea din reputație este detaliată mai sus. După plată, creditele apar imediat în sold.</p><div class="mant-umo-actions"><button type="button" class="mantp-btn-pri" onclick="mantuirePayUmoCard()">Plată cu cardul (SifonPay)</button><button type="button" class="mantp-btn-sec" onclick="mantuirePayUmoPsd()">Plată cu bani publici (PSD Direct Connect)</button></div></div>`,`<button type="button" class="mantp-btn-sec" onclick="dlgClose()">Anulează</button>`,{mantuireVendorSkin:true});
  queueMicrotask(()=>mantuireUmoPricingRefresh());
}
function mantuirePayUmoCard(){
  const p=mantuireUmoSelectedPack();
  if(!p){globalThis.toast('Alege un pachet din listă','warn');return;}
  const br=mantuireUmoPackBreakdown(p);
  globalThis.dlgClose();
  globalThis.openCardCheckout({kind:'mantuire_umo',um:p.um,amount:br.final,packId:p.id,umoListRon:br.list,umoDiscPct:br.pct,umoSavedRon:br.saved});
}
function mantuirePayUmoPsd(){
  const p=mantuireUmoSelectedPack();
  if(!p){globalThis.toast('Alege un pachet din listă','warn');return;}
  if(!globalThis.isPsdDcLinked()){
    const br=globalThis.mantuireBrand();
    globalThis.dlgOpen('Integrare necesară','PSD Direct Connect',`<span class="mant-dlg-vendor-seal">${globalThis.escapeHtml(br.name)} · API furnizor</span><p class="tsm" style="line-height:1.65;margin:0;color:var(--mant-ink)">Plata cu <strong>bani publici</strong> prin PSD Direct Connect necesită cont verificat și cheie API în <strong>Manager Integrări</strong>.</p>`,`<button type="button" class="mantp-btn-sec" onclick="dlgClose()">Închide</button><button type="button" class="mantp-btn-pri" onclick="dlgClose();navigate('integ')">Deschide Manager Integrări</button>`,{mantuireVendorSkin:true});
    return;
  }
  const amt=Math.round(globalThis.applyDisc(p.priceRon));
  globalThis.dlgClose();
  globalThis.openPublicPayMantuire(p.um,amt);
}
function initMantuirePayments(){
  globalThis.__mantuireMaxAddableCredits=mantuireMaxAddableCredits;
  globalThis.__mantuireUmoSelectedPack=mantuireUmoSelectedPack;
  globalThis.__mantuireUmoPackBreakdown=mantuireUmoPackBreakdown;
  globalThis.__mantuireUmoPricingRefresh=mantuireUmoPricingRefresh;
  globalThis.__mantuireFinalizeUmoPurchase=mantuireFinalizeUmoPurchase;
  globalThis.__mantuirePurchaseTokens=mantuirePurchaseTokens;
  globalThis.__mantuirePayUmoCard=mantuirePayUmoCard;
  globalThis.__mantuirePayUmoPsd=mantuirePayUmoPsd;
  globalThis.mantuireMaxAddableCredits=mantuireMaxAddableCredits;
  globalThis.mantuireUmoSelectedPack=mantuireUmoSelectedPack;
  globalThis.mantuireUmoPackBreakdown=mantuireUmoPackBreakdown;
  globalThis.mantuireUmoPricingRefresh=mantuireUmoPricingRefresh;
  globalThis.mantuireFinalizeUmoPurchase=mantuireFinalizeUmoPurchase;
  globalThis.mantuirePurchaseTokens=mantuirePurchaseTokens;
  globalThis.mantuirePayUmoCard=mantuirePayUmoCard;
  globalThis.mantuirePayUmoPsd=mantuirePayUmoPsd;
}
globalThis.initMantuirePayments=initMantuirePayments;
})();