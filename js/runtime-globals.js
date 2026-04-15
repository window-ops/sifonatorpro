;(function(){
  if(typeof globalThis.$!=='function'){
    globalThis.$=function(id){return document.getElementById(id);};
  }

  if(typeof globalThis.escapeHtml!=='function'){
    globalThis.escapeHtml=function(s){
      return String(s==null?'':s)
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;')
        .replace(/'/g,'&#39;');
    };
  }

  if(typeof globalThis.fRON!=='function'){
    const ronFmt=new Intl.NumberFormat('ro-RO',{
      style:'currency',
      currency:'RON',
      maximumFractionDigits:0
      // useGrouping:false
    });
    globalThis.fRON=function(n){return ronFmt.format(Number(n)||0);};
  }

  if(typeof globalThis.nowTs!=='function'){
    globalThis.nowTs=function(){
      const shift=((globalThis.S&&globalThis.S.timeShiftSec)||0)*1000;
      return Date.now()+shift;
    };
  }

  if(typeof globalThis.nowDate!=='function'){
    globalThis.nowDate=function(){return new Date(globalThis.nowTs());};
  }
})();