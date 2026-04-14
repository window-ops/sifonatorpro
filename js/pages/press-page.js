;(function(){
function renderPress(){
  const score=globalThis.computePressDisplayScore();
  const pel=globalThis.$('press-score');
  if(pel){
    const pressChannels=['tv_local','tv_national','social','investigatii'];
    const channels=pressChannels.map(c=>{
      const hostile=globalThis.isPressChannelHostileEffective(c);
      return `<div class="gline"><span class="gk">${globalThis.pressChannelRo(c)}</span><span class="gv">${hostile?'ostil':'neutru / controlabil'}</span></div>`;
    }).join('');
    pel.innerHTML=`
      <div class="gline"><span class="gk">Scor imagine publică</span><span class="gv">${score}/100</span></div>
      <div class="prog mb8"><div class="pb ${score>=60?'pb-g':score>=35?'pb-o':'pb-b'}" style="width:${score}%"></div></div>
      <div class="gline"><span class="gk">Stare narativă</span><span class="gv">${score>=65?'Control ridicat':score>=40?'Disputată':'Mod criză'}</span></div>
      ${channels}
      <div class="tsm tmut" style="margin-top:4px">${score>=60?'Narațiune controlată; TV local poate redeveni „aliniat” dacă imaginea rămâne sus.':score>=35?'Imagine mixtă, întrebări incomode în conferințe.':'Presiune mare în media de investigație.'}</div>`;
  }
  const lines=globalThis.buildSimulatedPressHeadlineStrings();
  const feedRows=(lines.length?lines:['Titluri simulate se încarcă…']).map(h=>`<div class="act-i"><span class="act-t">🗞️</span><span>${h}</span></div>`).join('');
  globalThis.$('press-feed')&&(globalThis.$('press-feed').innerHTML=feedRows);
  globalThis.$('press-history')&&(globalThis.$('press-history').innerHTML=(globalThis.S.pressHistory.length
    ?globalThis.S.pressHistory.slice(0,10).map(h=>`<div class="act-i"><span class="act-t">${h.t}</span><span>${h.txt}</span></div>`).join('')
    :'<p class="tmut tsm">Nicio intervenție narativă înregistrată.</p>'));
}
function initPressPage(){
  globalThis.renderPress=renderPress;
}
globalThis.initPressPage=initPressPage;
})();