;(function(){
function normalizeDossierArray(raw){
  if(raw==null)return[];
  if(!Array.isArray(raw))return[];
  const out=[];
  for(const entry of raw){
    if(entry!=null&&typeof entry==='object'&&!Array.isArray(entry)){
      const t=entry.t!=null?String(entry.t):'';
      const txt=entry.txt!=null?String(entry.txt):(entry.text!=null?String(entry.text):'');
      if(t||txt)out.push({t,txt,custom:!!entry.custom});
    }else if(typeof entry==='string'&&entry.trim()){
      out.push({t:'',txt:entry.trim()});
    }
  }
  return out;
}
function ensureProjectDossier(p){
  if(!p)return;
  p.dossier=normalizeDossierArray(p.dossier);
}
function seedDossierIfEmpty(p,customTxt){
  ensureProjectDossier(p);
  if(p.dossier.length)return;
  p.dossier.push({t:globalThis.nowDate().toLocaleDateString('ro-RO'),txt:customTxt||'Înregistrare în registrul electronic. Proiect urmărit în sistem.'});
}
function initDossierUtils(){
  globalThis.normalizeDossierArray=normalizeDossierArray;
  globalThis.ensureProjectDossier=ensureProjectDossier;
  globalThis.seedDossierIfEmpty=seedDossierIfEmpty;
}
globalThis.initDossierUtils=initDossierUtils;
})();