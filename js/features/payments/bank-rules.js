;(function(){
const CARD_BANK_RULES=[
  {prefixes:['451900','451901'],bank:'Banca Poporului Unită SA',chance:0.58,tdsMode:'sms_code',tdsMinutes:10},
  {prefixes:['527410','527411'],bank:'Creditul Carpatin IFN',chance:0.52,tdsMode:'sms_code',tdsMinutes:10},
  {prefixes:['601188','601189'],bank:'Dunărea Digital Bank',chance:0.64,tdsMode:'push_timer',tdsMinutes:10},
  {prefixes:['379421','379422'],bank:'Imperial Trust România',chance:0.71,tdsMode:'otp_email',tdsMinutes:10},
  {prefixes:['400012','400013'],bank:'Bancă Acvatică Digitală SA',chance:0.62,tdsMode:'bank_app',tdsMinutes:10},
];

function getCardBankRule(num){
  const p=(num||'').slice(0,6);
  return CARD_BANK_RULES.find(r=>r.prefixes.some(x=>p.startsWith(x)))||null;
}

function needs3DS(num){
  const r=getCardBankRule(num);
  if(!r)return null;
  if(Math.random()<r.chance)return r;
  return null;
}

function initPaymentsBankRules(){
  globalThis.CARD_BANK_RULES=CARD_BANK_RULES;
  globalThis.getCardBankRule=getCardBankRule;
  globalThis.needs3DS=needs3DS;
}

globalThis.initPaymentsBankRules=initPaymentsBankRules;
})();