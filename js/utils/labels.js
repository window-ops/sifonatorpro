;(function(){
function qLabel(q){return{mantuiala:'De mântuială',moderata:'Calitate moderată',ridicata:'Calitate ridicată',mantuit:'Mântuit',salvat:'Mântuit'}[q]||'-';}
function sLabel(s){return{planned:'Planificat',in_progress:'În desfășurare',completed:'Finalizat',late:'Întârziat'}[s]||s;}
function sBadge(s){return{planned:'bk',in_progress:'bb',completed:'bg',late:'br'}[s]||'bk';}
function tsLabel(s){return{open:'Publicată',clarificari:'Clarificări',depuneri:'Depuneri',evaluation:'Comisie evaluare',awarded:'Adjudecată',contested:'Contestată',executie:'Execuție contract'}[s]||s;}
function tsBadge(s){return{open:'bb',clarificari:'bk',depuneri:'bo',evaluation:'bo',awarded:'bg',contested:'br',executie:'bb'}[s]||'bk';}
function pressChannelRo(id){
  const m={tv_local:'TV local',tv_national:'TV național',social:'Rețele sociale',investigatii:'Investigații'};
  return m[id]||String(id).replace(/_/g,' ');
}
function diffLabelRo(d){return{easy:'Ușor',normal:'Normal',hard:'Greu'}[d]||d;}
function partyColor(p){return{PSD:'#cc0000',PNL:'#ffaa00',USR:'#1a73e8',AUR:'#b8a000',UDMR:'#009900',Independent:'#666'}[p]||'#555';}
function initLabelUtils(){
  globalThis.qLabel=qLabel;
  globalThis.sLabel=sLabel;
  globalThis.sBadge=sBadge;
  globalThis.tsLabel=tsLabel;
  globalThis.tsBadge=tsBadge;
  globalThis.pressChannelRo=pressChannelRo;
  globalThis.diffLabelRo=diffLabelRo;
  globalThis.partyColor=partyColor;
}
globalThis.initLabelUtils=initLabelUtils;
})();