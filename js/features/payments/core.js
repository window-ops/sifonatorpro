;(function(){
function fmtCard(inp){
  let v=inp.value.replace(/\D/g,'').substring(0,16);
  inp.value=v.replace(/(\d{4})(?=\d)/g,'$1 ');
}
function fmtExpMM(inp){
  let v=inp.value.replace(/\D/g,'').slice(0,2);
  if(v.length>=2){
    let n=parseInt(v.slice(0,2),10);
    if(!Number.isFinite(n)||n<1)n=1;
    if(n>12)n=12;
    v=String(n).padStart(2,'0');
  }
  inp.value=v;
}
function fmtExpYY(inp){
  inp.value=inp.value.replace(/\D/g,'').slice(0,2);
}
function mantuirePortalPsdSubmit(){
  const amount=globalThis.mantuireRegistrationFeeAmount();
  const com=Math.round(amount*.15),total=amount+com;
  const sel=globalThis.getPsdDcRouteSelection('mantpay-psd-int');
  const err=globalThis.validatePsdDcTransaction(total,sel.routeId);
  if(err){globalThis.toast(err,'warn');return}
  const int=sel.label||'Partid';
  globalThis.commitPsdDcSpend(total);
  globalThis.mantuireSetPsdAnim({intLabel:int,total});
  globalThis.mantuireSetPayPane('psd_wait');
  globalThis.renderMantuirePortalBody();
  queueMicrotask(()=>mantuirePortalStartPsdAnim());
}
function mantuirePortalStartPsdAnim(){
  const anim=globalThis.mantuireGetPsdAnim();
  const int=anim?.intLabel||'Partid';
  const total=anim?.total||0;
  const stepsEl=globalThis.$('mant-psd-steps');
  if(!stepsEl)return;
  ['📨 Cerere trimisă către intermediar…','🤝 Negociere discretă în curs…','📋 Documentație „justificativă" generată automat…','✅ Fonduri publice aprobate și transferate!'].forEach((s,i)=>
    setTimeout(()=>{
      const el=globalThis.$('mant-psd-steps');
      if(!el)return;
      el.innerHTML+=`<div style="padding:4px 0;border-bottom:1px solid #d4c4dc">${s}</div>`;
      if(i===3)setTimeout(()=>{
        const ps=globalThis.S.siphoned;
        globalThis.S.siphoned+=total;
        globalThis.maybeTriggerInvestigationOnSiphonCross(ps);
        globalThis.mantuireSetPayPane('methods');
        globalThis.mantuireSetPsdAnim(null);
        globalThis.mantuireMarkRegistrationPaidAndSendSms();
        globalThis.toast('Taxă înregistrată. Verifică mesajul pe Șpagafon','ok');
        globalThis.addAct(`Mântuire Proiecte: taxă înregistrare API plătită din fonduri publice (${int}). ${globalThis.fRON(total)} sifonați.`);
        globalThis.saveState();
      },900);
    },i*950)
  );
}
function openPublicPayMantuire(um,baseAmount){
  if(!globalThis.isPsdDcLinked()){globalThis.toast('PSD Direct Connect nu este integrat. Deschide Manager Integrări','warn');return;}
  const br=globalThis.mantuireBrand();
  const com=Math.round(baseAmount*.15),total=baseAmount+com;
  globalThis.dlgOpen('🏛️ PSD Direct Connect',`Credite ${globalThis.escapeHtml(br.name)}`,
    `<span class="mant-dlg-vendor-seal">${globalThis.escapeHtml(br.name)} · API furnizor</span>
    <div style="background:linear-gradient(135deg,#8b0000,#cc0000);color:#fff;padding:13px 15px;border-radius:4px;margin-bottom:13px;text-align:center">
      <div style="font-size:17px;margin-bottom:2px">🏛️ PSD Direct Connect</div>
      <div style="font-size:11px;opacity:.75">Achiziție ${globalThis.escapeHtml(br.unitName)} (${globalThis.escapeHtml(br.unitAbbr)})</div>
    </div>
    <div style="background:#fff;border:1px solid var(--mant-bureau-border);padding:11px;border-radius:4px;font-size:13px;margin-bottom:13px;color:var(--mant-ink)">
      <div class="flex" style="justify-content:space-between;margin-bottom:3px"><span>${um} ${globalThis.escapeHtml(br.unitAbbr)} (${globalThis.escapeHtml(br.name)})</span><span>${baseAmount} RON</span></div>
      <div class="flex" style="justify-content:space-between;margin-bottom:3px;color:#5c4a62"><span>Comision intermediar (15%)</span><span>${com} RON</span></div>
      <hr class="sep"/><div class="flex" style="justify-content:space-between;font-weight:700"><span>TOTAL DIN BUGET PUBLIC</span><span style="color:#a40000">${total} RON</span></div>
    </div>
    <div class="fg"><label style="font-size:12px;font-weight:700;color:#4a3558;margin-bottom:5px;display:block">Selectează ruta SEAP</label>
      <select id="pp-int-mant-umo" class="mant-umo-sel" style="margin-top:4px">
        <option value="achizitie_directa">Partid (PSD): Achiziție directă, 3-5 zile</option>
        <option value="procedura_simplificata">Rețea locală: Procedură simplificată, 1-2 zile</option>
        <option value="contract_direct">Conexiuni ministeriale: Contract direct, 24h</option>
        <option value="oug_fasttrack">Ministru de resort: prioritate OUG, 4 ore</option>
      </select>
    </div>`,
    `<button type="button" class="mantp-btn-sec" onclick="dlgClose()">Anulează</button>
     <button type="button" class="mantp-btn-psd" onclick="procPublicMantuire(${um},${baseAmount},${total})">Trimite cererea</button>`,
    {mantuireVendorSkin:true}
  );
  globalThis.syncPsdDcRouteSelect('pp-int-mant-umo');
}
function procPublicMantuire(um,baseAmount,total){
  const sel=globalThis.getPsdDcRouteSelection('pp-int-mant-umo');
  const err=globalThis.validatePsdDcTransaction(total,sel.routeId);
  if(err){globalThis.toast(err,'warn');return}
  const int=sel.label||'Partid';
  globalThis.commitPsdDcSpend(total);
  globalThis.$('dlg-a').innerHTML='';
  globalThis.$('dlg-c').innerHTML=`<div style="background:linear-gradient(135deg,#8b0000,#cc0000);color:#fff;padding:13px;border-radius:var(--r) var(--r) 0 0;text-align:center"><div style="font-size:17px">🏛️ PSD Direct Connect</div></div>
    <div style="padding:18px;text-align:center"><div style="font-size:26px;margin-bottom:8px">📤</div><p class="tsm tmut">Cererea parcurge rețeaua de influență…</p><div id="pp-steps-mant-umo" style="text-align:left;margin-top:13px;font-size:12px;color:var(--text2)"></div></div>`;
  ['📨 Cerere trimisă către intermediar…','🤝 Negociere discretă în curs…','📋 Documentație „justificativă" generată automat…','✅ Fonduri publice aprobate și transferate!'].forEach((s,i)=>
    setTimeout(()=>{
      globalThis.$('pp-steps-mant-umo')&&(globalThis.$('pp-steps-mant-umo').innerHTML+=`<div style="padding:4px 0;border-bottom:1px solid var(--border)">${s}</div>`);
      if(i===3)setTimeout(()=>{
        const ps=globalThis.S.siphoned;
        globalThis.S.siphoned+=total;
        globalThis.maybeTriggerInvestigationOnSiphonCross(ps);
        globalThis.dlgClose();
        globalThis.mantuireFinalizeUmoPurchase(um,baseAmount,`fonduri publice (${int})`,null,{siphon:total});
      },900);
    },i*950)
  );
}
function openPublicPay(tid,amount){
  if(!globalThis.isPsdDcLinked()){globalThis.toast('PSD Direct Connect nu este integrat. Deschide Manager Integrări','warn');return}
  const pl=globalThis.PLANS.find(p=>p.id===tid),com=Math.round(amount*.15),total=amount+com;
  globalThis.dlgOpen('🏛️ PSD Direct Connect','Serviciu de integrare fonduri publice',
    `<div style="background:linear-gradient(135deg,#8b0000,#cc0000);color:#fff;padding:13px 15px;border-radius:var(--r);margin-bottom:13px;text-align:center">
      <div style="font-size:17px;margin-bottom:2px">🏛️ PSD Direct Connect</div>
      <div style="font-size:11px;opacity:.55">Rețeaua noastră de influență la dispoziția ta</div>
    </div>
    <div style="background:var(--bg);padding:11px;border-radius:var(--r);font-size:13px;margin-bottom:13px">
      <div class="flex" style="justify-content:space-between;margin-bottom:3px"><span>Abonament ${pl.name}</span><span>${amount} RON</span></div>
      <div class="flex" style="justify-content:space-between;margin-bottom:3px;color:var(--text2)"><span>Comision intermediar (15%)</span><span>${com} RON</span></div>
      <hr class="sep"/><div class="flex" style="justify-content:space-between;font-weight:700"><span>TOTAL DIN BUGET PUBLIC</span><span style="color:var(--red)">${total} RON</span></div>
    </div>
    <div class="fg mb0"><label style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:5px;display:block">Selectează ruta SEAP</label>
      <select id="pp-int" style="width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:var(--r);font-family:var(--font);font-size:14px;outline:none">
        <option value="achizitie_directa">Partid (PSD): Achiziție directă, 3-5 zile</option>
        <option value="procedura_simplificata">Rețea locală: Procedură simplificată, 1-2 zile</option>
        <option value="contract_direct">Conexiuni ministeriale: Contract direct, 24h</option>
        <option value="oug_fasttrack">Ministru de resort: prioritate OUG, 4 ore</option>
      </select>
    </div>`,
    `<button class="btn btn-f" onclick="dlgClose()">Anulează</button>
     <button class="btn btn-psd" onclick="procPublic('${tid}',${total})">📤 Trimite Cerere</button>`
  );
  globalThis.syncPsdDcRouteSelect('pp-int');
}
function procPublic(tid,total){
  const sel=globalThis.getPsdDcRouteSelection('pp-int');
  const err=globalThis.validatePsdDcTransaction(total,sel.routeId);
  if(err){globalThis.toast(err,'warn');return}
  const int=sel.label||'Partid';
  globalThis.commitPsdDcSpend(total);
  globalThis.$('dlg-a').innerHTML='';
  globalThis.$('dlg-c').innerHTML=`<div style="background:linear-gradient(135deg,#8b0000,#cc0000);color:#fff;padding:13px;border-radius:var(--r) var(--r) 0 0;text-align:center"><div style="font-size:17px">🏛️ PSD Direct Connect</div></div>
    <div style="padding:18px;text-align:center"><div style="font-size:26px;margin-bottom:8px">📤</div><p class="tsm tmut">Cererea parcurge rețeaua de influență...</p><div id="pp-steps" style="text-align:left;margin-top:13px;font-size:12px;color:var(--text2)"></div></div>`;
  ['📨 Cerere trimisă către intermediar...','🤝 Negociere discretă în curs...','📋 Documentație „justificativă" generată automat...','✅ Fonduri publice aprobate și transferate!'].forEach((s,i)=>
    setTimeout(()=>{
      globalThis.$('pp-steps')&&(globalThis.$('pp-steps').innerHTML+=`<div style="padding:4px 0;border-bottom:1px solid var(--border)">${s}</div>`);
      if(i===3)setTimeout(()=>{const ps=globalThis.S.siphoned;globalThis.activateSub(tid);globalThis.S.siphoned+=total;globalThis.maybeTriggerInvestigationOnSiphonCross(ps);globalThis.dlgClose();globalThis.toast(`🏛️ Bani publici accesați! Abonament activat.`,'ok');globalThis.addAct(`Abonament ${globalThis.PLANS.find(p=>p.id===tid).name} plătit din fonduri publice via ${int}. ${globalThis.fRON(total)} sifonați.`);globalThis.renderSub();globalThis.renderDash();},900);
    },i*950)
  );
}
function openPublicPayHours(hours,amount){
  if(!globalThis.isPsdDcLinked()){globalThis.toast('PSD Direct Connect nu este integrat. Deschide Manager Integrări','warn');return}
  const com=Math.round(amount*.15),total=amount+com;
  globalThis.dlgOpen('🏛️ PSD Direct Connect','Serviciu de integrare fonduri publice',
    `<div style="background:linear-gradient(135deg,#8b0000,#cc0000);color:#fff;padding:13px 15px;border-radius:var(--r);margin-bottom:13px;text-align:center">
      <div style="font-size:17px;margin-bottom:2px">🏛️ PSD Direct Connect</div>
      <div style="font-size:11px;opacity:.55">Flux operațional pentru cumpărare ore Baghetă</div>
    </div>
    <div style="background:var(--bg);padding:11px;border-radius:var(--r);font-size:13px;margin-bottom:13px">
      <div class="flex" style="justify-content:space-between;margin-bottom:3px"><span>${hours}h Bagheta Magică</span><span>${amount} RON</span></div>
      <div class="flex" style="justify-content:space-between;margin-bottom:3px;color:var(--text2)"><span>Comision intermediar (15%)</span><span>${com} RON</span></div>
      <hr class="sep"/><div class="flex" style="justify-content:space-between;font-weight:700"><span>TOTAL DIN BUGET PUBLIC</span><span style="color:var(--red)">${total} RON</span></div>
    </div>
    <div class="fg"><label style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:5px;display:block">Selectează ruta SEAP</label>
      <select id="pp-int-h" style="width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:var(--r);font-family:var(--font);font-size:14px;outline:none">
        <option value="achizitie_directa">Partid (PSD): Achiziție directă, 3-5 zile</option>
        <option value="procedura_simplificata">Rețea locală: Procedură simplificată, 1-2 zile</option>
        <option value="contract_direct">Conexiuni ministeriale: Contract direct, 24h</option>
        <option value="oug_fasttrack">Ministru de resort: prioritate OUG, 4 ore</option>
      </select>
    </div>`,
    `<button class="btn btn-f" onclick="dlgClose()">Anulează</button>
     <button class="btn btn-psd" onclick="procPublicHours(${hours},${total})">📤 Trimite Cerere</button>`
  );
  globalThis.syncPsdDcRouteSelect('pp-int-h');
}
function procPublicHours(hours,total){
  if(globalThis.hasPaidSubscription()){globalThis.toast('Ai abonament plătit activ; orele extra sunt indisponibile','warn');globalThis.dlgClose();return}
  const sel=globalThis.getPsdDcRouteSelection('pp-int-h');
  const err=globalThis.validatePsdDcTransaction(total,sel.routeId);
  if(err){globalThis.toast(err,'warn');return}
  const int=sel.label||'Partid';
  globalThis.commitPsdDcSpend(total);
  globalThis.$('dlg-a').innerHTML='';
  globalThis.$('dlg-c').innerHTML=`<div style="background:linear-gradient(135deg,#8b0000,#cc0000);color:#fff;padding:13px;border-radius:var(--r) var(--r) 0 0;text-align:center"><div style="font-size:17px">🏛️ PSD Direct Connect</div></div>
    <div style="padding:18px;text-align:center"><div style="font-size:26px;margin-bottom:8px">📤</div><p class="tsm tmut">Cererea parcurge rețeaua de influență...</p><div id="pp-steps-h" style="text-align:left;margin-top:13px;font-size:12px;color:var(--text2)"></div></div>`;
  ['📨 Cerere trimisă către intermediar...','🤝 Negociere discretă în curs...','📋 Documentație „justificativă" generată automat...','✅ Fonduri publice aprobate și transferate!'].forEach((s,i)=>
    setTimeout(()=>{
      globalThis.$('pp-steps-h')&&(globalThis.$('pp-steps-h').innerHTML+=`<div style="padding:4px 0;border-bottom:1px solid var(--border)">${s}</div>`);
      if(i===3)setTimeout(()=>{
        const ps=globalThis.S.siphoned;
        globalThis.S.purchSec+=hours*3600;
        globalThis.S.siphoned+=total;
        globalThis.maybeTriggerInvestigationOnSiphonCross(ps);
        globalThis.dlgClose();
        globalThis.updWandQuota();
        globalThis.toast(`🏛️ ${hours} ore adăugate cu fonduri publice!`,'ok');
        globalThis.addAct(`${hours} ore Bagheta Magică plătite din fonduri publice via ${int}. ${globalThis.fRON(total)} sifonați.`);
        globalThis.renderDash();globalThis.updDebug();
      },900);
    },i*950)
  );
}
function openCardCheckout(ctx){
  globalThis.CARD_PAY_CTX=ctx;
  const isHours=ctx.kind==='hours';
  const isMant=ctx.kind==='mantuire_reg';
  const isMantUmo=ctx.kind==='mantuire_umo';
  const br=globalThis.mantuireBrand();
  const label=isHours?`${ctx.hours} ore Bagheta Magică`:isMant?`Înregistrare API ${br.name}`:isMantUmo?`${ctx.um} ${br.unitName} (${br.unitAbbr})`:(globalThis.PLANS.find(p=>p.id===ctx.tid)?.name||'Abonament');
  const cadence=isHours||isMant||isMantUmo?'plată unică':'/lună';
  const mantSeal=isMantUmo?`<span class="mant-dlg-vendor-seal">${globalThis.escapeHtml(br.name)} · API furnizor</span>`:'';
  const payActions=isMantUmo
    ?`<button type="button" class="mantp-btn-sec" onclick="dlgClose()">Anulează</button>
     <button type="button" class="mantp-btn-pri" onclick="procCard()">🔒 Plătește ${ctx.amount} RON</button>`
    :`<button class="btn btn-f" onclick="dlgClose()">Anulează</button>
     <button class="btn btn-p" onclick="procCard()">🔒 Plătește ${ctx.amount} RON</button>`;
  const dlgTitle=isMantUmo?'Plată cu card':'';
  const dlgSub=isMantUmo?`Credite UM · ${ctx.um} unități · procesare bancară pentru terți`:'';
  const sifonBranding=isMantUmo?'':`<div class="sph"><div class="sp-logo">🔻</div><div class="sp-name">SifonPay</div><div class="sp-tag">Plăți discrete pentru oameni cu inițiativă</div></div>`;
  const cpInp=isMantUmo?'card-inp mantp-inp':'card-inp';
  let umoSumHtml='';
  if(isMantUmo&&ctx.umoListRon!=null&&Number.isFinite(Number(ctx.umoListRon))){
    const lp=Math.round(Number(ctx.umoListRon));
    const sv=Math.max(0,Math.round(Number(ctx.umoSavedRon)||0));
    const pct=typeof ctx.umoDiscPct==='number'?ctx.umoDiscPct:globalThis.disc();
    const discRow=pct>0&&sv>0?`<div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:6px"><span>Reducere reputație (${pct.toFixed(1)}%)</span><span style="color:#1a6b2e;font-weight:700">-${globalThis.fRON(sv)}</span></div>`:'';
    umoSumHtml=`<div style="background:#fff;border:1px solid var(--mant-bureau-border);border-radius:4px;padding:12px;margin:10px 0;font-size:12px" role="region" aria-label="Rezumat plată SifonPay">
      <div style="font-weight:800;color:var(--mant-primary);margin-bottom:8px">SifonPay · Credite ${globalThis.escapeHtml(br.unitAbbr)}</div>
      <div style="display:flex;justify-content:space-between;gap:8px;border-bottom:1px dashed #e8e0ef;padding-bottom:6px;margin-bottom:6px"><span>Preț referință</span><span>${globalThis.fRON(lp)}</span></div>
      ${discRow}
      <div style="display:flex;justify-content:space-between;gap:8px;font-weight:800"><span>Total de încasat</span><span style="color:var(--mant-primary)">${globalThis.fRON(ctx.amount)}</span></div>
    </div>`;
  }
  const leadLine=isMantUmo?'':`<div class="tsm tmut mb14"><strong>${label}</strong>: ${ctx.amount} RON ${cadence}</div>`;
  const cardFootnote=isMantUmo
    ?`<p style="font-size:11px;color:var(--text3);margin-top:8px">Tranzacția va apărea pe extras ca „SERVICII DIGITALE ANONIME SRL". Unele bănci pot declanșa 3D Secure fictiv (fereastra apare deasupra acestei ferestre).</p>`
    :`<p style="font-size:11px;color:var(--text3)">Tranzacția va apărea pe extras ca „SERVICII DIGITALE ANONIME SRL". Prefixele unor bănci pot declanșa 3D Secure.</p>`;
  globalThis.dlgOpen(dlgTitle,dlgSub,
    `${mantSeal}${umoSumHtml}${sifonBranding}
    <div style="padding:18px">
      ${leadLine}
      <div class="fg"><label style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:5px;display:block">Număr card</label><input class="${cpInp}" id="cp-num" placeholder="0000 0000 0000 0000" maxlength="19" oninput="fmtCard(this)"${isMantUmo?' style="margin-top:4px"':''}/></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:11px">
        <div class="fg"><label style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:5px;display:block">Expirare</label>
          <div class="sp-exp-field" style="font-size:14px;margin-top:4px">
            <input class="${cpInp}" id="cp-exp-mm" placeholder="MM" maxlength="2" inputmode="numeric" pattern="[0-9]*" autocomplete="cc-exp-month" aria-label="Luna expirării (2 cifre)" oninput="onCardExpMmInput(this,'cp-exp-yy')"/>
            <span class="sp-exp-sep" aria-hidden="true">/</span>
            <input class="${cpInp}" id="cp-exp-yy" placeholder="AA" maxlength="2" inputmode="numeric" pattern="[0-9]*" autocomplete="cc-exp-year" aria-label="Anul expirării (2 cifre, AA)" oninput="fmtExpYY(this)"/>
          </div>
        </div>
        <div class="fg"><label style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:5px;display:block">CVV</label><input class="${cpInp} sp-cvv-inp" id="cp-cvv" placeholder="***" type="password" maxlength="3" inputmode="numeric" pattern="[0-9]{3}" oninput="this.value=this.value.replace(/\\D/g,'').slice(0,3)"/></div>
      </div>
      <div class="fg" style="margin-top:8px"><label style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:5px;display:block">Titular</label><input class="${cpInp}" id="cp-name" placeholder="GIGEL POPESCU" style="font-size:14px;margin-top:4px"/></div>
      ${cardFootnote}
    </div>`,
    payActions,
    isMantUmo?{mantuireVendorSkin:true}:undefined
  );
}
function onCardExpMmInput(inp,yyId){
  fmtExpMM(inp);
  if(inp.value.length>=2){const y=globalThis.$(yyId);if(y){y.focus();try{y.select();}catch(e){}}}
}
function cardExpFilled(mmId,yyId){
  const mm=String(globalThis.$(mmId)?.value||'').replace(/\D/g,'');
  const yy=String(globalThis.$(yyId)?.value||'').replace(/\D/g,'');
  return mm.length===2&&yy.length===2;
}
function openCardPay(tid,amount){openCardCheckout({kind:'sub',tid,amount});}
function openCardPayHours(hours,amount){openCardCheckout({kind:'hours',hours,amount});}
function finishCardCheckout(bank3ds){
  const tdsReserve=globalThis.S.pending3DS&&globalThis.S.pending3DS.reserveCode!=null?String(globalThis.S.pending3DS.reserveCode):'';
  globalThis.S.pending3DS=null;
  if(bank3ds&&tdsReserve)globalThis.invalidateVerifiedSpagafonCode('3ds',tdsReserve);
  const ctx=globalThis.CARD_PAY_CTX;if(!ctx)return;
  if(ctx.kind==='sub'){
    activateSub(ctx.tid);
    const pl=globalThis.PLANS.find(p=>p.id===ctx.tid);
    globalThis.dlgClose();
    globalThis.toast(`✅ Abonament ${pl?.name||''} activat!`,'ok');
    globalThis.addAct(`Abonament ${pl?.name||ctx.tid} plătit cu cardul via SifonPay${bank3ds?` (3D Secure ${bank3ds.bank})`:''}.`);
    globalThis.renderSub();globalThis.renderDash();
    globalThis.CARD_PAY_CTX=null;globalThis.saveState();return;
  }
  if(ctx.kind==='mantuire_reg'){globalThis.dlgClose();globalThis.addAct(`Mântuire Proiecte: taxă înregistrare API plătită cu cardul (${globalThis.fRON(ctx.amount)})${bank3ds?` · 3D Secure ${bank3ds.bank}`:''}.`);globalThis.mantuireMarkRegistrationPaidAndSendSms();globalThis.CARD_PAY_CTX=null;globalThis.saveState();return;}
  if(ctx.kind==='mantuire_umo'){globalThis.dlgClose();globalThis.mantuireFinalizeUmoPurchase(ctx.um,ctx.amount,'SifonPay',bank3ds,null);globalThis.CARD_PAY_CTX=null;globalThis.saveState();return;}
  if(ctx.kind==='hours'){
    if(globalThis.hasPaidSubscription()){globalThis.dlgClose();globalThis.toast('Ai abonament plătit activ; orele extra sunt indisponibile (folosește cota lunară)','warn');return;}
    globalThis.S.purchSec+=ctx.hours*3600;
    globalThis.dlgClose();globalThis.updWandQuota();
    globalThis.toast(`✨ ${ctx.hours} ore Bagheta Magică adăugate!`,'ok');
    globalThis.addAct(`${ctx.hours} ore Bagheta Magică cumpărate cu cardul (${globalThis.fRON(ctx.amount)})${bank3ds?` · 3D Secure ${bank3ds.bank}`:''}.`);
    globalThis.renderDash();globalThis.updDebug();globalThis.CARD_PAY_CTX=null;globalThis.saveState();
  }
}
function show3DSChallenge(bankRule,cardNum){
  const TDS_MINUTES=10;
  const masked=`•••• ${cardNum.slice(-4)}`;
  const mode=bankRule.tdsMode||'sms_code';
  let reserveCode=null,smsBody='';
  if(mode==='sms_code'){reserveCode=String(100000+Math.floor(Math.random()*900000));smsBody=`SifonPay 3D Secure (${bankRule.bank}): cod rezervă ${reserveCode}. Fereastra de confirmare: ${TDS_MINUTES} minute. Detalii pe Șpagafon.`;}
  else if(mode==='otp_email'){reserveCode=String(100000+Math.floor(Math.random()*900000));smsBody=`SifonPay 3D Secure (${bankRule.bank}): cod e-mail/SMS rezervă ${reserveCode}. Timp limită desktop: ${TDS_MINUTES} minute.`;}
  else if(mode==='push_timer'||mode==='bank_app')smsBody=`SifonPay 3D Secure (${bankRule.bank}): confirmă în aplicația băncii sau urmează pașii din mesaj. Timp disponibil: ${TDS_MINUTES} minute.`;
  else smsBody=`SifonPay 3D Secure (${bankRule.bank}): autentificare suplimentară. ${TDS_MINUTES} minute.`;
  globalThis.S.pending3DS={code:'__TDS10__',bank:bankRule.bank,tail:cardNum.slice(-4),mode:'timed_3ds',reserveCode};
  globalThis.spagafonPushSms(bankRule.bank,smsBody,{code:reserveCode,is3ds:true});
  globalThis.spagafonPinFor3DS(true);
  const codeRow=reserveCode!=null?`<div class="fg mt14"><label style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:5px;display:block">Cod rezervă (din Șpagafon)</label><input class="card-inp verif-code-inp" id="tds-code" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="12" placeholder="000000" autocomplete="one-time-code" style="font-size:15px;letter-spacing:.12em" oninput="this.value=this.value.replace(/\\D/g,'').slice(0,12)"/></div><p class="tsm tmut mt8">Folosește butonul <strong>Completează în plată</strong> din mesajul SMS pe Șpagafon ca să lipească codul aici, apoi confirmă.</p>`:'';
  const inner=`<p class="tsm tmut mb14">Card <strong>${masked}</strong> · <strong>${bankRule.bank}</strong> solicită <strong>3D Secure</strong>. Ai exact <strong>${TDS_MINUTES} minute</strong>; detaliile și orice cod de rezervă sunt pe <strong>Șpagafon</strong> (deschis automat deasupra acestei ferestre).</p><div style="background:var(--bg);padding:12px;border-radius:var(--r);font-size:13px;text-align:center"><span id="tds-timer" style="font-family:var(--mono);font-size:22px;font-weight:700;color:var(--orange)">${String(TDS_MINUTES).padStart(2,'0')}:00</span><div class="tsm tmut mt6">Timp rămas</div></div>${codeRow}<p class="tsm tmut mt6">După expirare, reîncearcă plata. Confirmă doar după ce ai introdus codul (când banca îl cere).</p>`;
  const endMs=Date.now()+TDS_MINUTES*60000;
  clearInterval(window.__tdsTimerIv);
  window.__tdsTimerIv=setInterval(()=>{const el=globalThis.$('tds-timer');if(!el){clearInterval(window.__tdsTimerIv);return;}const ms=Math.max(0,endMs-Date.now());const mm=Math.floor(ms/60000),ss=Math.floor((ms%60000)/1000);el.textContent=`${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;if(ms<=0)clearInterval(window.__tdsTimerIv);},500);
  const mant3ds=globalThis.CARD_PAY_CTX&&globalThis.CARD_PAY_CTX.kind==='mantuire_umo';
  const tdsActions=mant3ds
    ?`<button type="button" class="mantp-btn-sec" onclick="clearInterval(window.__tdsTimerIv);dlgClose();S.pending3DS=null">Anulează</button>
     <button type="button" class="mantp-btn-pri" onclick="confirm3DSecure('${bankRule.bank.replace(/'/g,"\\'")}')">Confirm autentificarea</button>`
    :`<button class="btn btn-f" onclick="clearInterval(window.__tdsTimerIv);dlgClose();S.pending3DS=null">Anulează</button>
     <button class="btn btn-p" onclick="confirm3DSecure('${bankRule.bank.replace(/'/g,"\\'")}')">Confirm autentificarea</button>`;
  globalThis.dlgOpen(`🔐 3D Secure · ${bankRule.bank}`,'Autentificare suplimentară (10 minute)',inner,tdsActions,{tdsPassthrough:true,mantuireVendorSkin:mant3ds});
}
function confirm3DSecure(bank){
  if(!globalThis.S.pending3DS||globalThis.S.pending3DS.code!=='__TDS10__'){globalThis.toast('Sesiune 3D Secure expirată sau invalidă','warn');return;}
  const want=globalThis.S.pending3DS.reserveCode;
  if(want!=null&&String(want).length){
    const got=globalThis.sanitizeVerifCodeDigits(globalThis.$('tds-code')?.value,12);
    if(got!==String(want)){globalThis.toast('Introdu codul din Șpagafon (sau butonul din SMS) înainte de confirmare','warn');return;}
  }
  clearInterval(window.__tdsTimerIv);
  globalThis.$('dlg-a').innerHTML='<span class="tsm tmut">Verificare 3D Secure...</span>';
  setTimeout(()=>{if(Math.random()<0.92)finishCardCheckout({bank});else{globalThis.dlgClose();globalThis.toast(`3D Secure respins de ${bank}. Încearcă din nou.`,'err');}},900);
}
function procCard(){
  const ctx=globalThis.CARD_PAY_CTX;
  if(!ctx){globalThis.toast('Nu există context de plată','err');return;}
  const num=globalThis.$('cp-num')?.value?.replace(/\s/g,'');
  const cpCvvRaw=globalThis.$('cp-cvv')?.value||'';
  const cpCvv=cpCvvRaw.replace(/\D/g,'').slice(0,3);
  if(globalThis.$('cp-cvv'))globalThis.$('cp-cvv').value=cpCvv;
  if(!num||num.length<16||!cardExpFilled('cp-exp-mm','cp-exp-yy')||!/^\d{3}$/.test(cpCvv)){globalThis.toast('Completează datele cardului','err');return;}
  const mantUmo=ctx.kind==='mantuire_umo';
  globalThis.$('dlg-a').innerHTML=mantUmo?'<span class="tsm tmut" style="color:#4a3558">Se procesează prin SifonPay…</span>':'<span class="tsm tmut">Se procesează prin SifonPay...</span>';
  const procHead=mantUmo?'':`<div class="sph"><div class="sp-logo">🔻</div><div class="sp-name">SifonPay</div></div>`;
  const procMsg=mantUmo?'Se procesează prin SifonPay…':'Procesare discretă în curs...';
  globalThis.$('dlg-c').innerHTML=`${procHead}<div style="padding:32px;text-align:center"><div class="spinner"></div><p class="tsm tmut"${mantUmo?' style="color:#4a3558"':''}>${procMsg}</p></div>`;
  setTimeout(()=>{const bankRule=globalThis.needs3DS(num);if(bankRule){show3DSChallenge(bankRule,num);return;}finishCardCheckout(null);},1700);
}
function activateSub(tid){
  if(tid==='free')return;
  const exp=globalThis.nowDate();exp.setMonth(exp.getMonth()+1);
  const pl=globalThis.PLANS.find(p=>p.id===tid);
  globalThis.S.sub={tier:tid,exp:exp.toISOString(),secTotal:pl.secMonth,secUsed:0,autoRenew:false};
  globalThis.clearSubLapsedState();
  globalThis.updWandQuota();globalThis.updDebug();
}
function cancelSub(){
  globalThis.dlgOpen('Anulează abonamentul','Ești sigur?',
    `<p class="tsm">Vei reveni la limitele Starter Gratuit (fără abonament plătit). Orele Bagheta Magică nu sunt rambursate.</p>`,
    `<button type="button" class="btn btn-f" onclick="dlgClose()">Mă răzgândesc</button>
     <button type="button" class="btn btn-d" onclick="S.sub=null;clearSubLapsedState();dlgClose();renderSub();renderDash();updWandQuota();saveState();toast('Abonament anulat. Ai revenit la limitele gratuite','warn')">Anulează</button>`
  );
}
function openBuyHDlg(){
  const h=parseInt(globalThis.$('buy-h')?.value)||5,d=globalThis.disc();
  const cost=Math.round(h*50*(1-d/100));
  globalThis.dlgOpen('Cumpără Ore Bagheta Magică','Acces per-utilizare',
    `<div style="text-align:center;padding:14px 0"><div style="font-size:30px;font-weight:700;color:var(--gold)">${h}h</div><div class="tsm tmut">${globalThis.fRON(h*50)}${d>0?` → ${globalThis.fRON(cost)} (discount ${d.toFixed(1)}%)`:''}  </div></div>
    <div style="display:flex;flex-direction:column;gap:9px"><button class="btn btn-p" onclick="dlgClose();openCardPayHours(${h},${cost})">💳 SifonPay</button><button class="btn btn-psd" onclick="dlgClose();tryOpenPublicPayHours(${h},${cost})">🏛️ Bani Publici</button></div>`,
    `<button class="btn btn-f" onclick="dlgClose()">Anulează</button>`
  );
}
function procHours(h,cost,method){if(method==='card'){openCardPayHours(h,cost);return;}globalThis.tryOpenPublicPayHours(h,cost);}

function initPayments(){
  globalThis.fmtCard=fmtCard;
  globalThis.fmtExpMM=fmtExpMM;
  globalThis.fmtExpYY=fmtExpYY;
  globalThis.mantuirePortalPsdSubmit=mantuirePortalPsdSubmit;
  globalThis.mantuirePortalStartPsdAnim=mantuirePortalStartPsdAnim;
  globalThis.openPublicPayMantuire=openPublicPayMantuire;
  globalThis.procPublicMantuire=procPublicMantuire;
  globalThis.openPublicPay=openPublicPay;
  globalThis.procPublic=procPublic;
  globalThis.openPublicPayHours=openPublicPayHours;
  globalThis.procPublicHours=procPublicHours;
  globalThis.openCardCheckout=openCardCheckout;
  globalThis.onCardExpMmInput=onCardExpMmInput;
  globalThis.cardExpFilled=cardExpFilled;
  globalThis.openCardPay=openCardPay;
  globalThis.openCardPayHours=openCardPayHours;
  globalThis.finishCardCheckout=finishCardCheckout;
  globalThis.show3DSChallenge=show3DSChallenge;
  globalThis.confirm3DSecure=confirm3DSecure;
  globalThis.procCard=procCard;
  globalThis.activateSub=activateSub;
  globalThis.cancelSub=cancelSub;
  globalThis.openBuyHDlg=openBuyHDlg;
  globalThis.procHours=procHours;
}
globalThis.initPayments=initPayments;
})();