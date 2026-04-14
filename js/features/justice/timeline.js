;(function(){
function justiceTimelineLastEntry(tl){
  if(!tl||!tl.length)return null;
  let best=null;
  for(let i=0;i<tl.length;i++){
    const e=tl[i],ts=typeof e.ts==='number'?e.ts:-Infinity;
    if(!best||(ts>=(typeof best.ts==='number'?best.ts:-Infinity)))best=e;
  }
  return best;
}
function justiceTimelinePush(row){
  if(!globalThis.S.justice)return;
  const tl=globalThis.S.justice.timeline||(globalThis.S.justice.timeline=[]);
  const ts=typeof row.ts==='number'?row.ts:globalThis.nowTs();
  const t=row.t||(new Date(ts).toLocaleString('ro-RO'));
  tl.push({ts,t,stage:row.stage,pressure:row.pressure,detail:row.detail?String(row.detail):''});
  tl.sort((a,b)=>(a.ts||0)-(b.ts||0));
  while(tl.length>28)tl.shift();
}
function justiceTimelineMaybeAppendRecalcSnapshot(procurementHeat,fundHeat,pressHeat){
  if(!globalThis.S.justice||globalThis.S.justice.debugPin)return;
  const stage=globalThis.S.justice.stage;
  const pressure=globalThis.S.justice.pressure;
  const last=justiceTimelineLastEntry(globalThis.S.justice.timeline||[]);
  if(last&&last.stage===stage&&last.pressure===pressure)return;
  const nCrit=globalThis.S.tenders.filter(t=>['contested','evaluation'].includes(t.status)).length;
  const detail=`Presiune recalculată: ${nCrit} licitații în fază critică (contestare/evaluare), indici achiziții ~${procurementHeat}, fonduri raportate ${globalThis.fRON(globalThis.S.siphoned)}, componentă presă ${pressHeat} (ton ${Math.round(globalThis.S.pressTone)}/100).`;
  justiceTimelinePush({stage,pressure,detail});
}
function migrateJusticeTimelineChronology(){
  if(!globalThis.S.justice||!Array.isArray(globalThis.S.justice.timeline))return;
  const tl=globalThis.S.justice.timeline;
  if(!tl.length)return;
  if(tl.every(e=>typeof e.ts==='number')){
    tl.sort((a,b)=>(a.ts||0)-(b.ts||0));
    return;
  }
  if(tl.every(e=>typeof e.ts!=='number')){
    const rev=[...tl].reverse();
    const base=globalThis.nowTs()-rev.length*130000;
    globalThis.S.justice.timeline=rev.map((e,i)=>{
      const ts=base+i*130000;
      return{...e,ts,t:e.t||new Date(ts).toLocaleString('ro-RO')};
    });
    return;
  }
  let mx=Math.max(0,...tl.map(e=>typeof e.ts==='number'?e.ts:0));
  tl.forEach(e=>{
    if(typeof e.ts!=='number'){mx+=120000;e.ts=mx;}
    if(!e.t)e.t=new Date(e.ts).toLocaleString('ro-RO');
  });
  tl.sort((a,b)=>(a.ts||0)-(b.ts||0));
}
function initJusticeTimeline(){
  globalThis.justiceTimelineLastEntry=justiceTimelineLastEntry;
  globalThis.justiceTimelinePush=justiceTimelinePush;
  globalThis.justiceTimelineMaybeAppendRecalcSnapshot=justiceTimelineMaybeAppendRecalcSnapshot;
  globalThis.migrateJusticeTimelineChronology=migrateJusticeTimelineChronology;
}
globalThis.initJusticeTimeline=initJusticeTimeline;
})();