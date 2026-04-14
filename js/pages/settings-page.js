;(function(){
function renderSettings(){
  const isLs=globalThis.S.settings.persistence==='local_storage';
  const ph=globalThis.$('settings-persist-hint');if(ph)ph.textContent=isLs
    ?'Sesiunea este salvată în localStorage. Poți exporta înainte de migrare sau șterge pentru deconectare completă.'
    :'Nu folosești localStorage. Exportul/ștergerea nu se aplică sesiunii in-memory.';
  document.querySelectorAll('#settings-persist-card button').forEach(b=>{b.disabled=!isLs});
  const canShift=globalThis.tierAllowsTimeShift();
  const sh=globalThis.$('settings-shift-hint');if(sh)sh.textContent=canShift
    ?`Maxim ${Math.min(globalThis.TIME_SHIFT_MAX_DAYS,globalThis.maxTimeShiftDaysRemaining())} zile disponibile acum (în funcție de zilele rămase până la expirarea abonamentului; după shift, reînnoirea depinde de opțiunea „Reînnoire automată”).`
    :'Shift-ul temporal este indisponibil pe abonamentul gratuit. Treci pe un abonament plătit pentru a beneficia de această funcție.';
  const sr=globalThis.$('settings-shift-range');if(sr){sr.disabled=!canShift;sr.max=String(Math.min(globalThis.TIME_SHIFT_MAX_DAYS,Math.max(0,globalThis.maxTimeShiftDaysRemaining())));}
  globalThis.$('settings-shift-apply')&&(globalThis.$('settings-shift-apply').disabled=!canShift);
  globalThis.onSettingsShiftInput();
  const canRepMult=globalThis.tierAllowsRepPublicMultiplier();
  if(globalThis.$('settings-rep-hint'))globalThis.$('settings-rep-hint').textContent=canRepMult
    ?`Bonus maxim ${Math.round(globalThis.repPublicMultCap()*100)}% aplicat punctelor pozitive din finalizarea proiectelor publice pe abonamentul curent.`
    :'Multiplicatorul de reputație pentru proiecte publice este indisponibil pe plan gratuit. Treci la un plan plătit pentru a regla intensitatea bonusului.';
  const rr=globalThis.$('settings-rep-range');
  if(rr){
    rr.value=String(globalThis.S.userControls?.repPublicSlider??0);
    rr.disabled=!canRepMult;
    rr.style.opacity=canRepMult?'':'0.45';
  }
  globalThis.onSettingsRepInput();
  const subRenewCb=globalThis.$('settings-sub-renew-cb');
  const subRenewHint=globalThis.$('settings-sub-renew-hint');
  const subRenewLbl=globalThis.$('settings-sub-renew-lbl');
  if(subRenewCb&&subRenewHint){
    const paid=globalThis.hasPaidSubscription();
    subRenewCb.disabled=!paid;
    subRenewCb.checked=!!(paid&&globalThis.S.sub.autoRenew===true);
    subRenewHint.textContent=paid
      ?'Preferința ta este salvată în starea jocului (localStorage sau sesiune).'
      :'După ce activezi un plan plătit din secțiunea Abonament, poți seta aici reînnoirea automată. La prima plată, aceasta este oprită implicit.';
    if(subRenewLbl)subRenewLbl.style.opacity=paid?'':'0.55';
  }
  globalThis.normalizeSpagafonSettings();
  const spMode=globalThis.$('settings-spgf-mode');
  if(spMode)spMode.value=globalThis.S.settings.spagafonLauncherMode==='icon'||globalThis.S.settings.spagafonLauncherMode==='text'?globalThis.S.settings.spagafonLauncherMode:'both';
  const spFull=globalThis.$('settings-spgf-mobile-full');
  if(spFull)spFull.checked=!!globalThis.S.settings.spagafonMobileFullDisplay;
  const spHint=globalThis.$('settings-spgf-mode-hint');
  if(spHint){
    const narrow=globalThis.isMobileLayout();
    if(!narrow){
      spHint.textContent='Modul se aplică lansatorului din colț pe ecran lat; pe mobil compact (📱) modul nu se schimbă până bifezi forțarea (vizibilă doar la lățime ≤680px).';
    }else if(globalThis.S.settings.spagafonMobileFullDisplay){
      spHint.textContent='Lansatorul complet din colț folosește modul selectat (același stil ca pe desktop).';
    }else{
      spHint.textContent='Bifează „Forțează afișare completă pe ecrane mici” ca să apară Mod afișare pentru lansatorul din colț pe acest ecran.';
    }
  }
  const skipFin=globalThis.$('settings-skip-proj-final-confirm');
  if(skipFin)skipFin.checked=!!globalThis.S.settings.skipProjectFinalizeConfirm;
  const finExecAssist=globalThis.$('settings-enable-finalize-exec-assist');
  if(finExecAssist)finExecAssist.checked=!!globalThis.S.settings.enableFinalizeExecAssist;
  const mantEn=globalThis.$('settings-mant-enabled');
  const mantEnHint=globalThis.$('settings-mant-enabled-hint');
  const mantNeutral=globalThis.$('settings-mant-neutral');
  const mantNeutralLbl=globalThis.$('settings-mant-neutral-lbl');
  const mantNeutralHint=globalThis.$('settings-mant-neutral-hint');
  if(mantEn)mantEn.checked=globalThis.mantuireFeatureEnabled();
  if(mantEnHint){
    mantEnHint.textContent=globalThis.mantuireFeatureEnabled()
      ?'Funcția este activă. O poți lăsa ascunsă până conectezi cheia din Manager Integrări.'
      :'Funcția este dezactivată. Nu vei vedea „Mântuire Proiecte” în meniu și nu vei putea folosi API-ul terț. Atenție: asta poate face mai dificilă obținerea punctelor de reputație (pierzi o sursă de bonus).';
  }
  if(mantNeutral){
    mantNeutral.disabled=!globalThis.mantuireFeatureEnabled();
    mantNeutral.checked=!!globalThis.S.settings.mantuireNeutralBranding;
  }
  if(mantNeutralLbl)mantNeutralLbl.style.opacity=(globalThis.mantuireFeatureEnabled()?'':'0.55');
  if(mantNeutralHint){
    mantNeutralHint.textContent=!globalThis.mantuireFeatureEnabled()
      ?'Activează integrarea ca să poți schimba prezentarea.'
      :globalThis.S.settings.mantuireNeutralBranding
        ?'Modul neutru e activ: denumirea/iconul sunt schimbate iar linkul către site este ascuns. Atenție: poate dilua/denatura gluma instituțională originală, dar e o opțiune pentru confort.'
        :'Activează dacă preferi să eviți referința instituțională (deși mecanica rămâne aceeași).';
  }
}
function initSettingsPage(){
  globalThis.renderSettings=renderSettings;
}
globalThis.initSettingsPage=initSettingsPage;
})();