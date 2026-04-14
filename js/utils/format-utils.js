;(function(){
function fSec(s){
  if(s===Infinity||s<0)return'∞';
  const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;
  if(h>0)return`${h}h ${m}m`;
  if(m>0)return`${m}m ${sec}s`;
  return`${sec}s`;
}
function fTimer(s){
  const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;
  return`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}
function initFormatUtils(){
  globalThis.fSec=fSec;
  globalThis.fTimer=fTimer;
}
globalThis.initFormatUtils=initFormatUtils;
})();