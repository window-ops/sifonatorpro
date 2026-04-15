;(function(){
const MANTUIRE_SERVERS=[
  {id:'mit_buc',name:'Mitropolie, Nod București',hint:'Cozi mari generate de dosarele Capitalei și presă intensă',minMs:14000,maxMs:32000,trafficTier:3},
  {id:'proto_iasi',name:'Protopopiat Regional, Iași',hint:'Trafic moderat pe magistrala canonică moldovenească',minMs:6000,maxMs:15000,trafficTier:2},
  {id:'manastire_cdn',name:'CDN Mănăstire',hint:'Nod echilibrat pentru uz curent',minMs:3200,maxMs:9000,trafficTier:1},
  {id:'arhiva_vest',name:'Nod Arhivistic Vest',hint:'Procesare pe serie dedicată cu prioritate maximă',minMs:700,maxMs:2600,trafficTier:0},
];
const MANTUIRE_MAX_CONCURRENT=3;
const MANTUIRE_CREDITS_MAX_WALLET=120;
const MANTUIRE_UMO_PACKAGES=[
  {id:'umo10',um:10,priceRon:59,note:'Încercări și cereri ocazionale'},
  {id:'umo25',um:25,priceRon:129,note:'Potrivit pentru uz regulat'},
  {id:'umo50',um:50,priceRon:239,note:'Volum mai mare'},
  {id:'umo100',um:100,priceRon:429,note:'Pachet amplu'},
];

function mantuireTierIdOrDefault(tierId){
  return(tierId==='solemn'||tierId==='expedit'||tierId==='parohial')?tierId:'parohial';
}
function mantuireApplyLiveKeyConsequences(pts,projectName,tierId){
  globalThis.ensureWorldMemoryShape();
  const br=globalThis.mantuireBrand();
  const baseDrop=5+Math.min(9,Math.floor((pts||0)/2));
  const tierExtra=(tierId==='solemn')?4:(tierId==='expedit'?1:2);
  const drop=Math.min(24,baseDrop+tierExtra);
  globalThis.S.pressTone=Math.max(0,globalThis.S.pressTone-drop);
  globalThis.S.worldMemory.magistrateHeat=Math.min(50,(globalThis.S.worldMemory.magistrateHeat||0)+2+Math.floor((pts||8)/7));
  if(Math.random()<0.28&&!globalThis.S.worldMemory.hostilePress.includes('investigatii'))globalThis.S.worldMemory.hostilePress.push('investigatii');
  const now=globalThis.nowDate();
  const t=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const shortN=String(projectName||'Proiect').slice(0,42);
  if(!Array.isArray(globalThis.S.pressHistory))globalThis.S.pressHistory=[];
  globalThis.S.pressHistory.unshift({t,txt:`Presă / investigații: eticheta „${br.resultTag}” pe „${shortN}” ridică întrebări. Ton imagine publică -${drop}.`});
  if(globalThis.S.pressHistory.length>30)globalThis.S.pressHistory.pop();
  globalThis.recalcJudiciaryPressure(true);
  globalThis.justiceTimelinePush({ts:globalThis.nowTs(),stage:globalThis.S.justice.stage,pressure:globalThis.S.justice.pressure,detail:`${br.name} (cheie live): „${globalThis.escapeHtml(shortN)}”; presă mai rece, urmă investigativă accentuată.`});
  globalThis.addAct(`Presă / justiție: ${br.resultVerbPast} cu cheie live pe „${shortN}”. Imagine publică mai slabă, interes crescut al investigațiilor.`);
}
function mantuireUsageDayKey(ts){
  const d=new Date(ts);
  return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function mantuirePushUsageLog(row){
  globalThis.ensureMantuireState();
  globalThis.S.mantuire.usageLog.unshift(row);
  if(globalThis.S.mantuire.usageLog.length>80)globalThis.S.mantuire.usageLog.length=80;
  const dk=mantuireUsageDayKey(row.ts||Date.now());
  const uAdd=(typeof row.um==='number')?row.um:globalThis.mantuireUmCostForTier(row.tier||'parohial');
  globalThis.S.mantuire.usageByDay[dk]=(globalThis.S.mantuire.usageByDay[dk]||0)+uAdd;
  const keys=Object.keys(globalThis.S.mantuire.usageByDay).sort();
  if(keys.length>32)keys.slice(0,keys.length-28).forEach(k=>{delete globalThis.S.mantuire.usageByDay[k];});
}
function mantuireTouchKeyUsed(){
  globalThis.ensureMantuireIntegration();
  globalThis.S.integrations.mantuireCloud.lastUsedAt=Date.now();
}
function mantuireServerById(id){return MANTUIRE_SERVERS.find(s=>s.id===id)||MANTUIRE_SERVERS[1];}
function mantuireFailChanceForServer(srv){
  const t=srv&&typeof srv.trafficTier==='number'?srv.trafficTier:1;
  const table=[0.055,0.12,0.21,0.34];
  return table[Math.max(0,Math.min(3,t))]||0.14;
}
function mantuireSampleDelayMs(srv){
  const lo=Math.min(srv.minMs,srv.maxMs),hi=Math.max(srv.minMs,srv.maxMs);
  return lo+Math.floor(Math.random()*(hi-lo+1));
}
function processMantuireQueue(){
  globalThis.ensureMantuireState();
  if(!globalThis.isMantuireLinked())return;
  const now=Date.now();
  const kept=[];
  let changed=false;
  let simRefresh=false;
  for(const j of globalThis.S.mantuire.queue){
    if(now>=j.endTs){
      const p=globalThis.S.projects.find(x=>x.id===j.projectId);
      const apiEnv=j.apiEnv||'live';
      const apiTier=mantuireTierIdOrDefault(j.apiTier);
      const reqId=j.requestId||j.id||'';
      if(p&&p.status==='completed'&&p.quality==='mantuiala'){
        const srvForJob=mantuireServerById(j.srvId);
        let failP=mantuireFailChanceForServer(srvForJob);
        if(apiEnv==='test')failP*=0.48;
        if(Math.random()<failP){
          const umCharged=typeof j.umCost==='number'&&j.umCost>0?j.umCost:globalThis.mantuireUmCostForTier(apiTier);
          globalThis.ensureMantuireState();
          globalThis.S.mantuire.history.unshift({ts:now,projectId:p.id,projectName:p.name,srvId:j.srvId,ok:false,reason:'parcurs',requestId:reqId,env:apiEnv,apiTier,jobId:j.id||'',umSpent:umCharged});
          if(globalThis.S.mantuire.history.length>40)globalThis.S.mantuire.history.length=40;
          globalThis.S.mantuire.stats.fail=(globalThis.S.mantuire.stats.fail||0)+1;
          mantuirePushUsageLog({ts:now,requestId:reqId,projectName:p.name,status:'fail',env:apiEnv,um:umCharged,tier:apiTier});
          globalThis.addAct(`Mântuire Proiecte: parcurs neterminat pentru „${p.name}” (${srvForJob.name}); unitățile din cerere rămân consumate.`);
          globalThis.toast('Parcurs oprit înainte de mântuire completă; unitățile pentru această cerere rămân consumate. Poți relua din istoric sau trimite o cerere nouă','warn');
          changed=true;
        }else{
          const pts=typeof j.pts==='number'?j.pts:globalThis.mantuireRandomRepForTier(apiTier);
          p.quality='mantuit';
          globalThis.seedDossierIfEmpty(p,'');
          if(apiEnv==='test'){
            p.dossier.push({t:globalThis.nowDate().toLocaleString('ro-RO'),txt:'Mântuire Proiecte (cheie test): cerere de probă; etichetă „Mântuit” plasată pentru demonstrație.'});
            globalThis.addAct(`Mântuire Proiecte: „${p.name}” mântuit prin API cu cheie test, fără acumulare de puncte de reputație.`);
          }else{
            p.dossier.push({t:globalThis.nowDate().toLocaleString('ro-RO'),txt:'Mântuire Proiecte (cheie live): proiect mântuit prin API; etichetă „Mântuit” plasată. Pot apărea și alte consecințe (presă, urmăriri).'});
            globalThis.chgRep(pts,`Mântuire Proiecte: „${p.name}” (mântuit)`,false,{raw:true});
            globalThis.addAct(`Mântuire Proiecte: „${p.name}” mântuit prin API cu cheie live (+${pts} puncte de reputație).`);
            mantuireApplyLiveKeyConsequences(pts,p.name,apiTier);
            simRefresh=true;
          }
          globalThis.ensureMantuireState();
          globalThis.S.mantuire.history.unshift({ts:now,projectId:p.id,projectName:p.name,srvId:j.srvId,pts:apiEnv==='test'?0:pts,ok:true,jobId:j.id||'',requestId:reqId,env:apiEnv,apiTier});
          if(globalThis.S.mantuire.history.length>40)globalThis.S.mantuire.history.length=40;
          globalThis.S.mantuire.stats.ok=(globalThis.S.mantuire.stats.ok||0)+1;
          const umUsed=typeof j.umCost==='number'&&j.umCost>0?j.umCost:globalThis.mantuireUmCostForTier(apiTier);
          mantuirePushUsageLog({ts:now,requestId:reqId,projectName:p.name,status:'ok',env:apiEnv,um:umUsed,tier:apiTier});
          changed=true;
        }
      }else{
        const refund=typeof j.umCost==='number'&&j.umCost>0?j.umCost:globalThis.mantuireUmCostForTier(apiTier);
        globalThis.S.mantuire.credits+=refund;
        globalThis.toast(refund===1?'Cerere anulată: proiectul nu mai este eligibil, ți-am returnat 1 unitate.':`Cerere anulată: proiectul nu mai este eligibil, ți-am returnat ${refund} unități.`,'warn');
        globalThis.ensureMantuireState();
        const pfail=globalThis.S.projects.find(x=>x.id===j.projectId);
        globalThis.S.mantuire.history.unshift({ts:now,projectId:j.projectId,projectName:pfail?.name||'Proiect',srvId:j.srvId,ok:false,reason:'ineligibil',requestId:reqId,env:apiEnv,apiTier});
        if(globalThis.S.mantuire.history.length>40)globalThis.S.mantuire.history.length=40;
        globalThis.S.mantuire.stats.fail=(globalThis.S.mantuire.stats.fail||0)+1;
        mantuirePushUsageLog({ts:now,requestId:reqId,projectName:pfail?.name||'-',status:'err',env:apiEnv,um:0,tier:apiTier});
        changed=true;
      }
    }else kept.push(j);
  }
  if(kept.length!==globalThis.S.mantuire.queue.length){globalThis.S.mantuire.queue=kept;changed=true;}
  if(changed){
    globalThis.saveState();
    globalThis.renderProj();
    if(simRefresh){globalThis.renderPress();globalThis.renderJust();globalThis.renderOps();}
  }
}
let _mantuireDrainTimer=null;
function clearMantuireDrainTimer(){
  if(_mantuireDrainTimer){clearTimeout(_mantuireDrainTimer);_mantuireDrainTimer=null;}
}
function scheduleMantuireDrainTick(){
  clearMantuireDrainTimer();
  globalThis.ensureMantuireState();
  if(!globalThis.isMantuireLinked()||!globalThis.S.mantuire.queue.length)return;
  const nextTs=Math.min(...globalThis.S.mantuire.queue.map(q=>q.endTs));
  const ms=Math.max(80,nextTs-Date.now()+120);
  _mantuireDrainTimer=setTimeout(()=>{
    _mantuireDrainTimer=null;
    processMantuireQueue();
    globalThis.renderProj();
    globalThis.renderMantuire();
    globalThis.saveState();
    scheduleMantuireDrainTick();
  },ms);
}
function mantuireSetServer(v){
  globalThis.ensureMantuireState();
  globalThis.S.mantuire.serverId=v;
  globalThis.saveState();
}
function mantuireParcursRestartBlockedReason(h){
  globalThis.ensureMantuireState();
  if(!h||h.ok!==false||h.reason!=='parcurs')return'Reluarea nu este disponibilă pentru această intrare.';
  if(h.restartUsed)return'Pentru această intrare ai trimis deja o reluare din istoric.';
  const pid=h.projectId;
  if(pid==null||pid===undefined)return'Reluarea nu este disponibilă pentru această intrare.';
  const p=globalThis.S.projects.find(x=>x.id===pid);
  if(!p||p.status!=='completed'||p.quality!=='mantuiala')return'Proiectul a fost deja mântuit printr-o altă cerere sau nu mai este eligibil pentru reluare.';
  const failTs=h.ts||0;
  const hist=globalThis.S.mantuire.history||[];
  for(let i=0;i<hist.length;i++){
    const x=hist[i];
    if(x.projectId!==pid||x.ok!==true)continue;
    if((x.ts||0)>failTs)return'Proiectul a fost deja mântuit cu succes după această încercare (altă cerere).';
  }
  return null;
}
function mantuireRestartFromHistory(reqId,jobId){
  globalThis.ensureMantuireState();globalThis.ensureMantuireIntegration();
  if(!globalThis.isMantuireLinked()){globalThis.toast('Conectează API-ul din Manager Integrări','warn');globalThis.navigate('integ');return;}
  const rid=String(reqId||'');
  const histJobId=String(jobId||'');
  const h=globalThis.S.mantuire.history.find(x=>{
    if(x.ok!==false||x.reason!=='parcurs')return false;
    if(histJobId&&String(x.jobId||'')===histJobId)return true;
    if(rid&&String(x.requestId||'')===rid)return true;
    return false;
  });
  if(!h){globalThis.toast('Reluarea nu este disponibilă pentru această intrare','warn');return;}
  const br=mantuireParcursRestartBlockedReason(h);
  if(br){globalThis.toast(br,'warn');return;}
  globalThis.mantuireSyncKeyMetaFromApiKey();
  if(globalThis.S.mantuire.queue.length>=MANTUIRE_MAX_CONCURRENT){globalThis.toast(`Nu poți avea mai mult de ${MANTUIRE_MAX_CONCURRENT} cereri simultane în coadă.`,'warn');return;}
  const apiTier=mantuireTierIdOrDefault(h.apiTier);
  const umCost=globalThis.mantuireUmCostForTier(apiTier);
  if(globalThis.S.mantuire.credits<umCost){
    globalThis.toast(umCost===1?'Nu mai ai destule credite pentru această cerere. Adaugă credite UM din secțiunea de mai jos.':`Ai nevoie de ${umCost} unități pentru ritul salvat; soldul tău este insuficient. Adaugă credite UM din secțiunea de mai jos.`,'warn');
    return;
  }
  const pid=h.projectId;
  const p=globalThis.S.projects.find(x=>x.id===pid);
  if(!p||p.status!=='completed'||p.quality!=='mantuiala'){globalThis.toast('Proiectul nu mai este eligibil pentru reluare','warn');return;}
  if(globalThis.S.mantuire.queue.some(q=>q.projectId===pid)){globalThis.toast('Există deja o cerere în curs pentru acest proiect','warn');return;}
  const mc=globalThis.S.integrations.mantuireCloud;
  mc.apiTier=apiTier;
  const apiEnv=mc.keyEnv||'live';
  const srv=mantuireServerById(h.srvId);
  const tMeta=globalThis.mantuireTierMeta(apiTier);
  let delay=Math.round(mantuireSampleDelayMs(srv)*tMeta.delayMult);
  if(apiEnv==='test')delay=Math.max(400,Math.round(delay*0.35));
  const pts=apiEnv==='test'?0:globalThis.mantuireRandomRepForTier(apiTier);
  const t0=Date.now();
  const jid='mnt_'+t0+'_'+Math.random().toString(36).slice(2,8);
  const requestId=`req_${t0}_${Math.random().toString(36).slice(2,10)}`;
  globalThis.S.mantuire.credits-=umCost;
  mantuireTouchKeyUsed();
  globalThis.S.mantuire.serverId=srv.id;
  globalThis.S.mantuire.queue.push({id:jid,requestId,projectId:pid,endTs:t0+delay,startedAt:t0,durationMs:delay,pts,srvId:srv.id,apiEnv,apiTier,umCost});
  h.restartUsed=true;
  globalThis.addAct(`Mântuire Proiecte: cerere ${requestId} (reluare) pentru „${p.name}” (${srv.name}, ${globalThis.mantuireEnvPillLabel(apiEnv)}).`);
  globalThis.toast(`Cerere reluată (${globalThis.mantuireEnvPillLabel(apiEnv)}). ETA ~${Math.round(delay/1000)}s`,'ok');
  globalThis.saveState();globalThis.renderMantuire();globalThis.renderProj();globalThis.updRep();scheduleMantuireDrainTick();
}
function mantuireEnqueueFromUi(){
  globalThis.ensureMantuireState();globalThis.ensureMantuireIntegration();
  if(!globalThis.isMantuireLinked()){globalThis.toast('Conectează API-ul din Manager Integrări','warn');globalThis.navigate('integ');return;}
  const mc=globalThis.S.integrations.mantuireCloud;
  globalThis.mantuireSyncKeyMetaFromApiKey();
  if(globalThis.S.mantuire.queue.length>=MANTUIRE_MAX_CONCURRENT){globalThis.toast(`Nu poți avea mai mult de ${MANTUIRE_MAX_CONCURRENT} cereri simultane în coadă.`,'warn');return;}
  const tierSel0=globalThis.$('mant-api-tier')?.value||mc.apiTier||'parohial';
  const apiTier0=(tierSel0==='solemn'||tierSel0==='expedit')?tierSel0:'parohial';
  const umCost=globalThis.mantuireUmCostForTier(apiTier0);
  if(globalThis.S.mantuire.credits<umCost){
    globalThis.toast(umCost===1?'Nu mai ai destule credite pentru această cerere. Adaugă credite UM din secțiunea de mai jos.':`Ai nevoie de ${umCost} unități pentru ritul selectat; soldul tău este insuficient. Adaugă credite UM din secțiunea de mai jos.`,'warn');
    return;
  }
  const selSrv=globalThis.$('mant-srv-sel');
  if(selSrv)mantuireSetServer(selSrv.value);
  const sel=globalThis.$('mant-proj-sel');
  const pid=sel?parseInt(sel.value,10):NaN;
  if(!pid||Number.isNaN(pid)){globalThis.toast('Selectează un proiect eligibil','warn');return;}
  const p=globalThis.S.projects.find(x=>x.id===pid);
  if(!p||p.status!=='completed'||p.quality!=='mantuiala'){globalThis.toast('Doar proiecte finalizate, încă „de mântuială”, sunt eligibile','warn');return;}
  if(globalThis.S.mantuire.queue.some(q=>q.projectId===pid)){globalThis.toast('Există deja o cerere în curs pentru acest proiect','warn');return;}
  const apiEnv=mc.keyEnv||'live';
  const apiTier=apiTier0;
  mc.apiTier=apiTier;
  const srv=mantuireServerById(globalThis.S.mantuire.serverId);
  const tMeta=globalThis.mantuireTierMeta(apiTier);
  let delay=Math.round(mantuireSampleDelayMs(srv)*tMeta.delayMult);
  if(apiEnv==='test')delay=Math.max(400,Math.round(delay*0.35));
  const pts=apiEnv==='test'?0:globalThis.mantuireRandomRepForTier(apiTier);
  const t0=Date.now();
  const jid='mnt_'+t0+'_'+Math.random().toString(36).slice(2,8);
  const requestId=`req_${t0}_${Math.random().toString(36).slice(2,10)}`;
  globalThis.S.mantuire.credits-=umCost;
  mantuireTouchKeyUsed();
  globalThis.S.mantuire.queue.push({id:jid,requestId,projectId:pid,endTs:t0+delay,startedAt:t0,durationMs:delay,pts,srvId:srv.id,apiEnv,apiTier,umCost:umCost});
  globalThis.addAct(`Mântuire Proiecte: cerere ${requestId} pentru „${p.name}” (${srv.name}, ${globalThis.mantuireEnvPillLabel(apiEnv)}).`);
  globalThis.toast(`Cerere acceptată (${globalThis.mantuireEnvPillLabel(apiEnv)}). ETA ~${Math.round(delay/1000)}s`,'ok');
  globalThis.saveState();globalThis.renderMantuire();globalThis.renderProj();globalThis.updRep();scheduleMantuireDrainTick();
}

function initMantuireRuntime(){
  globalThis.__mantuireTierIdOrDefault=mantuireTierIdOrDefault;
  globalThis.__mantuireApplyLiveKeyConsequences=mantuireApplyLiveKeyConsequences;
  globalThis.__mantuireUsageDayKey=mantuireUsageDayKey;
  globalThis.__mantuirePushUsageLog=mantuirePushUsageLog;
  globalThis.__mantuireTouchKeyUsed=mantuireTouchKeyUsed;
  globalThis.__mantuireServerById=mantuireServerById;
  globalThis.__mantuireFailChanceForServer=mantuireFailChanceForServer;
  globalThis.__mantuireSampleDelayMs=mantuireSampleDelayMs;
  globalThis.__processMantuireQueue=processMantuireQueue;
  globalThis.__clearMantuireDrainTimer=clearMantuireDrainTimer;
  globalThis.__scheduleMantuireDrainTick=scheduleMantuireDrainTick;
  globalThis.__mantuireSetServer=mantuireSetServer;
  globalThis.__mantuireParcursRestartBlockedReason=mantuireParcursRestartBlockedReason;
  globalThis.__mantuireRestartFromHistory=mantuireRestartFromHistory;
  globalThis.__mantuireEnqueueFromUi=mantuireEnqueueFromUi;
  globalThis.MANTUIRE_SERVERS=MANTUIRE_SERVERS;
  globalThis.MANTUIRE_MAX_CONCURRENT=MANTUIRE_MAX_CONCURRENT;
  globalThis.MANTUIRE_CREDITS_MAX_WALLET=MANTUIRE_CREDITS_MAX_WALLET;
  globalThis.MANTUIRE_UMO_PACKAGES=MANTUIRE_UMO_PACKAGES;
  globalThis.mantuireTierIdOrDefault=mantuireTierIdOrDefault;
  globalThis.mantuireApplyLiveKeyConsequences=mantuireApplyLiveKeyConsequences;
  globalThis.mantuireUsageDayKey=mantuireUsageDayKey;
  globalThis.mantuirePushUsageLog=mantuirePushUsageLog;
  globalThis.mantuireTouchKeyUsed=mantuireTouchKeyUsed;
  globalThis.mantuireServerById=mantuireServerById;
  globalThis.mantuireFailChanceForServer=mantuireFailChanceForServer;
  globalThis.mantuireSampleDelayMs=mantuireSampleDelayMs;
  globalThis.processMantuireQueue=processMantuireQueue;
  globalThis.clearMantuireDrainTimer=clearMantuireDrainTimer;
  globalThis.scheduleMantuireDrainTick=scheduleMantuireDrainTick;
  globalThis.mantuireSetServer=mantuireSetServer;
  globalThis.mantuireParcursRestartBlockedReason=mantuireParcursRestartBlockedReason;
  globalThis.mantuireRestartFromHistory=mantuireRestartFromHistory;
  globalThis.mantuireEnqueueFromUi=mantuireEnqueueFromUi;
}
globalThis.initMantuireRuntime=initMantuireRuntime;
})();