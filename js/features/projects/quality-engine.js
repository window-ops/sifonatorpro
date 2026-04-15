;(function(){
const PROJECT_CATEGORIES=globalThis.PROJECT_CATEGORIES||{
  constructii:{label:'Lucrări de construcții / execuție',short:'Construcții',hint:'Șantiere, clădiri, amenajări. Risc mare de „mântuială”.',p:{mantuiala:.68,moderata:.24,ridicata:.08}},
  infrastructura:{label:'Infrastructură (drumuri, rețele, utilități)',short:'Infrastructură',hint:'Lucrări de teren, aproape ca construcțiile.',p:{mantuiala:.64,moderata:.26,ridicata:.10}},
  consumabile:{label:'Consumabile, birotică, rechizite',short:'Consumabile',hint:'Achiziții simple, adesea livrare conformă.',p:{mantuiala:.18,moderata:.42,ridicata:.40}},
  it_digital:{label:'IT, software, digitalizare',short:'IT & digital',hint:'Contracte IT: pe hârtie merge bine, în practică variat.',p:{mantuiala:.44,moderata:.38,ridicata:.18}},
  consultanta:{label:'Studii, consultanță, expertize, proiectare',short:'Consultanță',hint:'Multă hârtie și formalitate, calitate medie spre slabă.',p:{mantuiala:.50,moderata:.35,ridicata:.15}},
  diverse:{label:'Diverse / profil mixt',short:'Diverse',hint:'Medie satirizată (aproximativ corupție generalizată, dar mai echilibrată în rezultat).',p:{mantuiala:.62,moderata:.28,ridicata:.10}},
};
const QUALITY_NEUTRAL_BLEND=globalThis.QUALITY_NEUTRAL_BLEND||{mantuiala:0.613,moderata:0.265,ridicata:0.122};
const PROJECT_CATEGORY_QUALITY_INFLUENCE=globalThis.PROJECT_CATEGORY_QUALITY_INFLUENCE||0.36;
function projectCategoryKey(p){const k=p?.projCategory;return k&&PROJECT_CATEGORIES[k]?k:'diverse';}
function projectCategoryLabel(p){return PROJECT_CATEGORIES[projectCategoryKey(p)].short;}
function normalizeQualityWeights(w){const s=w.mantuiala+w.moderata+w.ridicata;if(s<=0)return{mantuiala:1/3,moderata:1/3,ridicata:1/3};return{mantuiala:w.mantuiala/s,moderata:w.moderata/s,ridicata:w.ridicata/s};}
function effectiveQualityWeights(p){
  const base=PROJECT_CATEGORIES[projectCategoryKey(p)].p,n=QUALITY_NEUTRAL_BLEND,k=PROJECT_CATEGORY_QUALITY_INFLUENCE;
  let w={mantuiala:n.mantuiala+(base.mantuiala-n.mantuiala)*k,moderata:n.moderata+(base.moderata-n.moderata)*k,ridicata:n.ridicata+(base.ridicata-n.ridicata)*k};
  const declared=Math.max(1,p?.declaredValue||p?.budget||1);
  const real=Math.max(1,p?.realValue||Math.round(declared*0.72));
  const spread=globalThis.clamp((declared-real)/declared,0,0.85);

  // Softer penalties: honest + on-time projects should still have a real shot at "ridicată".
  w.mantuiala*=1+(spread*0.75);
  w.moderata*=1+(spread*0.12);
  w.ridicata*=Math.max(0.45,1-(spread*0.85));

  if(p?.lateF){
    w.mantuiala*=1.12;
    w.moderata*=1.01;
    w.ridicata*=0.86;
  }
  if(globalThis.projectUsesTenderFlow(p)&&globalThis.projectWinningTenderIsHouseFirm(p)){
    w.mantuiala*=1.22;
    w.moderata*=0.97;
    w.ridicata*=0.86;
  }

  // Small positive nudge for "proper" projects (low spread, on-time, not a house-firm win).
  const honest=spread<=0.08&&!p?.lateF&&!(globalThis.projectUsesTenderFlow(p)&&globalThis.projectWinningTenderIsHouseFirm(p));
  if(honest){
    w.ridicata*=1.18;
    w.mantuiala*=0.92;
  }
  return normalizeQualityWeights(w);
}
function rollProjectQuality(p){const w=effectiveQualityWeights(p),r=Math.random();if(r<w.mantuiala)return'mantuiala';if(r<w.mantuiala+w.moderata)return'moderata';return'ridicata';}
function applyProjectCompletionRepAndBet(p,q){const qpts={mantuiala:1,moderata:2,ridicata:3},bonus={mantuiala:2,moderata:3,ridicata:4};let bp=qpts[q],bonPts=0,betMsg='';if(p.bet){if(p.bet.quality===q){bonPts=bonus[q];betMsg=` Pariu CÂȘTIGAT! +${bonPts} puncte bonus.`;}else betMsg=' Pariul a fost pierdut.';}p.quality=q;p.bet=null;globalThis.chgRep(bp+bonPts,`Proiect „${p.name}" finalizat (${globalThis.qLabel(q)})`,false,{publicProject:true});globalThis.addAct(`Proiect „${p.name}" finalizat. Rezultat: ${globalThis.qLabel(q)}.${betMsg}`);}
function initProjectsQualityEngine(){globalThis.PROJECT_CATEGORIES=globalThis.PROJECT_CATEGORIES||PROJECT_CATEGORIES;globalThis.QUALITY_NEUTRAL_BLEND=globalThis.QUALITY_NEUTRAL_BLEND||QUALITY_NEUTRAL_BLEND;globalThis.PROJECT_CATEGORY_QUALITY_INFLUENCE=globalThis.PROJECT_CATEGORY_QUALITY_INFLUENCE||PROJECT_CATEGORY_QUALITY_INFLUENCE;globalThis.__projectCategoryKey=projectCategoryKey;globalThis.__projectCategoryLabel=projectCategoryLabel;globalThis.__normalizeQualityWeights=normalizeQualityWeights;globalThis.__effectiveQualityWeights=effectiveQualityWeights;globalThis.__rollProjectQuality=rollProjectQuality;globalThis.__applyProjectCompletionRepAndBet=applyProjectCompletionRepAndBet;globalThis.projectCategoryKey=projectCategoryKey;globalThis.projectCategoryLabel=projectCategoryLabel;globalThis.normalizeQualityWeights=normalizeQualityWeights;globalThis.effectiveQualityWeights=effectiveQualityWeights;globalThis.rollProjectQuality=rollProjectQuality;globalThis.applyProjectCompletionRepAndBet=applyProjectCompletionRepAndBet;}
globalThis.initProjectsQualityEngine=initProjectsQualityEngine;
})();