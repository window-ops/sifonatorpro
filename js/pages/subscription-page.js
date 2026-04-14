;(function(){
function renderSub(){
  globalThis.checkSubLifecycle();
  const d=globalThis.disc();
  const paid=globalThis.hasPaidSubscription();
  globalThis.$('plan-grid').innerHTML=globalThis.PLANS.map(pl=>{
    const fp=Math.round(globalThis.applyDisc(pl.price));
    const curPaid=paid&&globalThis.S.sub.tier===pl.id;
    const isFreeCard=pl.id==='free';
    const hoursLabel=pl.secMonth<0?'Nelimitat':pl.secMonth===0?'0h (doar ore cumpărate)':`${(pl.secMonth/3600).toFixed(0)}h`;
    const limO=pl.maxOngoing===Infinity?'nelimitat':String(pl.maxOngoing);
    const limP=pl.maxPending===Infinity?'nelimitat':String(pl.maxPending);
    let actions='';
    if(isFreeCard){
      actions=`<p class="tsm tmut u-lh155">Se aplică automat fără „abonament activ”. Nu poți anula, treci la un plan plătit când vrei mai mult.</p>`;
    }else if(curPaid){
      actions=`<p class="tsm tmut" style="line-height:1.5;margin:0 0 12px;text-align:left">Reînnoirea automată este <strong>${globalThis.S.sub.autoRenew===true?'activă':'oprită'}</strong>. O poți schimba oricând din <strong>Setări</strong> → Reînnoire abonament.</p>
      <button type="button" class="btn btn-f btn-full" onclick="cancelSub()">Anulează abonamentul</button>`;
    }else{
      actions=`<button type="button" class="btn btn-p btn-full" onclick="openSubPay('${pl.id}')">Alege acest plan</button>`;
    }
    let badge='';
    if(isFreeCard){
      badge=`<div style="position:absolute;top:8px;left:50%;transform:translateX(-50%);z-index:2"><span class="badge bk">Implicit</span></div>`;
    }else if(curPaid){
      badge=`<div style="position:absolute;top:8px;left:50%;transform:translateX(-50%);z-index:2"><span class="badge bg">✓ ACTIV</span></div>`;
    }
    return`<div class="plan-card ${pl.feat?'feat':''}" style="${curPaid?'border-color:var(--green);background:rgba(38,162,105,.04);':''}">
      ${badge}
      <div class="plan-card-inner" style="padding-top:${badge?'36px':'20px'}">
      <div class="pname">${pl.name}</div>
      <div class="pprice">
        ${d>0&&pl.price>0?`<div style="font-size:12px;text-decoration:line-through;color:var(--text3)">${pl.price} RON</div>`:''}
        ${pl.price===0?`<span>0</span>`:fp} <small>${pl.price===0?'RON · fără plată':'RON/lună'}</small>
      </div>
      <ul class="pfeats">
        ${pl.feats.map(f=>`<li>${f}</li>`).join('')}
        <li>Proiecte în lucru / planificate: max. ${limO} / ${limP}</li>
        <li>Bagheta Magică: ${hoursLabel}/lună</li>
        <li>Bonus reputație la proiecte publice: până la ${Math.round(pl.repMultCap*100)}%</li>
      </ul>
      </div>
      <div class="plan-card-actions">
      ${actions}
      </div>
    </div>`;
  }).join('');
  globalThis.$('hours-buy-card') && (globalThis.$('hours-buy-card').classList.toggle('hid', paid));
  globalThis.updBuyH();
  globalThis.$('disc-rep') && (globalThis.$('disc-rep').textContent=globalThis.S.rep);
  globalThis.$('disc-pct') && (globalThis.$('disc-pct').textContent=d.toFixed(1)+'%');
}
function initSubscriptionPage(){
  globalThis.renderSub=renderSub;
}
globalThis.initSubscriptionPage=initSubscriptionPage;
})();