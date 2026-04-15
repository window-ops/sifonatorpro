;(function(){
function onSettingsDifficultyChange(){
  const sel=globalThis.$('settings-difficulty');
  if(!globalThis.S.settings)globalThis.S.settings={};
  const v=String(sel?.value||'normal');
  globalThis.S.settings.difficulty=['easy','normal','hard','custom'].includes(v)?v:'normal';
  if(typeof globalThis.normalizeDifficultySettings==='function')globalThis.normalizeDifficultySettings();
  globalThis.saveState();
  globalThis.renderSettings();
  globalThis.renderAll();
}
function onSettingsCustomDifficultyInput(key,value){
  if(!globalThis.S.settings)globalThis.S.settings={};
  if(!globalThis.S.settings.customDifficulty||typeof globalThis.S.settings.customDifficulty!=='object'){
    globalThis.S.settings.customDifficulty={...globalThis.DEFAULT_CUSTOM_DIFFICULTY};
  }
  globalThis.S.settings.customDifficulty[key]=globalThis.clampDifficultyValue?globalThis.clampDifficultyValue(key,value):Number(value);
  if(typeof globalThis.normalizeDifficultySettings==='function')globalThis.normalizeDifficultySettings();
  globalThis.saveState();
  globalThis.renderSettings();
  globalThis.renderAll();
}
function onSettingsSkipProjFinalizeConfirmChange(){
  const cb=globalThis.$('settings-skip-proj-final-confirm');
  if(!globalThis.S.settings)globalThis.S.settings={};
  globalThis.S.settings.skipProjectFinalizeConfirm=!!cb?.checked;
  globalThis.saveState();
}
function onSettingsFinalizeExecAssistChange(){
  const cb=globalThis.$('settings-enable-finalize-exec-assist');
  if(!globalThis.S.settings)globalThis.S.settings={};
  globalThis.S.settings.enableFinalizeExecAssist=!!cb?.checked;
  globalThis.saveState();
}
function onSettingsMantuireEnabledChange(){
  const cb=globalThis.$('settings-mant-enabled');
  if(!globalThis.S.settings)globalThis.S.settings={};
  if(!cb?.checked){
    cb.checked=true;
    globalThis.dlgOpen(
      'Dezactivează integrarea?',
      'Acțiune ireversibilă',
      `<p class="tsm" style="line-height:1.6;margin:0 0 10px">Dacă ai dezactiva integrarea într-o platformă reală, furnizorul ar revoca accesul. Aici se întâmplă la fel: <strong>se revocă integrarea</strong>. Cheia API este ștearsă din aplicație, coada se golește, iar creditele revin la valoarea implicită după revocare.</p>
       <p class="tsm u-lh155" style="margin:0">Nu poți anula această operație; poți conecta din nou mai târziu din Manager Integrări.</p>`,
      `<button type="button" class="btn btn-f" onclick="dlgClose()">Renunță</button>
       <button type="button" class="btn btn-d" onclick="confirmDisableMantuireIntegration()">Dezactivează și revocă</button>`
    );
    return;
  }
  globalThis.S.settings.enableMantuireFeature=true;
  globalThis.saveState();
  globalThis.syncMantuireAccessUi();
  globalThis.renderInteg();
  globalThis.renderSettings();
}
function onSettingsMantuireNeutralBrandingChange(){
  const cb=globalThis.$('settings-mant-neutral');
  if(!globalThis.S.settings)globalThis.S.settings={};
  globalThis.S.settings.mantuireNeutralBranding=!!cb?.checked;
  globalThis.saveState();
  globalThis.syncMantuireAccessUi();
  globalThis.renderInteg();
  globalThis.renderSettings();
}
function onSettingsShiftInput(){
  const v=parseInt(globalThis.$('settings-shift-range')?.value||'0',10);
  globalThis.$('settings-shift-disp')&&(globalThis.$('settings-shift-disp').textContent=String(v));
}
function onSettingsRepInput(){
  if(!globalThis.tierAllowsRepPublicMultiplier()){
    globalThis.$('settings-rep-disp')&&(globalThis.$('settings-rep-disp').textContent='0%. Indisponibil pe plan gratuit');
    return;
  }
  const v=parseInt(globalThis.$('settings-rep-range')?.value||'0',10);
  if(!globalThis.S.userControls)globalThis.S.userControls={};
  globalThis.S.userControls.repPublicSlider=v;
  const cap=globalThis.repPublicMultCap()*100;
  globalThis.$('settings-rep-disp')&&(globalThis.$('settings-rep-disp').textContent=`${(cap*v/100).toFixed(1)}% efectiv din puncte (plafon abonament ${cap.toFixed(0)}%)`);
  globalThis.saveState();
}
function initSettingsFeature(){
  globalThis.onSettingsDifficultyChange=onSettingsDifficultyChange;
  globalThis.onSettingsCustomDifficultyInput=onSettingsCustomDifficultyInput;
  globalThis.onSettingsSkipProjFinalizeConfirmChange=onSettingsSkipProjFinalizeConfirmChange;
  globalThis.onSettingsFinalizeExecAssistChange=onSettingsFinalizeExecAssistChange;
  globalThis.onSettingsMantuireEnabledChange=onSettingsMantuireEnabledChange;
  globalThis.onSettingsMantuireNeutralBrandingChange=onSettingsMantuireNeutralBrandingChange;
  globalThis.onSettingsShiftInput=onSettingsShiftInput;
  globalThis.onSettingsRepInput=onSettingsRepInput;
}
globalThis.initSettingsFeature=initSettingsFeature;
})();