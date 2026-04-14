;(function(){
function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
function pickMany(arr,count){
  const list=Array.isArray(arr)?arr.slice():[];
  const out=[];
  const need=Math.max(0,Math.min(count|0,list.length));
  for(let i=0;i<need;i++){
    const idx=Math.floor(Math.random()*list.length);
    out.push(list.splice(idx,1)[0]);
  }
  return out;
}
function initCommonUtils(){
  globalThis.clamp=clamp;
  globalThis.pickMany=pickMany;
}
globalThis.initCommonUtils=initCommonUtils;
})();