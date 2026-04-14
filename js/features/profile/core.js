;(function(){
function openProfileDlg(){
  globalThis.dlgOpen('Profil Utilizator','',
    `<div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;padding:14px;background:var(--bg);border-radius:var(--r)">
      <div class="profile-avatar" style="background:${globalThis.partyColor(globalThis.S.user.party)}">${globalThis.S.user.name.charAt(0).toUpperCase()}</div>
      <div>
        <div class="bold" style="font-size:16px">${globalThis.S.user.name}</div>
        <div class="tsm tmut">${globalThis.S.user.fn} · ${globalThis.S.user.jud}</div>
        <div class="tsm tmut">Partid: <strong>${globalThis.S.user.party}</strong> · Cont din: ${globalThis.S.user.since}</div>
      </div>
    </div>
    <div class="fg-row">
      <div class="fg"><label>Nume și prenume</label><input id="pr-name" value="${globalThis.S.user.name}" style="width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:var(--r);font-family:var(--font);font-size:14px;outline:none"/></div>
      <div class="fg"><label>Partid</label><select id="pr-party" style="width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:var(--r);font-family:var(--font);font-size:14px;outline:none">
        ${['PSD','PNL','USR','AUR','UDMR','PP-DD','Independent'].map(p=>`<option${p===globalThis.S.user.party?' selected':''}>${p}</option>`).join('')}
      </select></div>
    </div>
    <div class="fg-row">
      <div class="fg"><label>Funcție</label><select id="pr-fn" style="width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:var(--r);font-family:var(--font);font-size:14px;outline:none">
        ${['Primar','Viceprimar','Președinte Consiliu Județean','Consilier local','Director Direcție Buget','Inspector ANAP','Șef Serviciu Achiziții'].map(f=>`<option${f===globalThis.S.user.fn?' selected':''}>${f}</option>`).join('')}
      </select></div>
      <div class="fg"><label>Județ</label><select id="pr-jud" style="width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:var(--r);font-family:var(--font);font-size:14px;outline:none">
        ${['Teleorman','Ilfov','Dolj','Prahova','Olt','Galați','Vâlcea','Dâmbovița','Neamț','Vaslui','Bacău','Constanța'].map(j=>`<option${j===globalThis.S.user.jud?' selected':''}>${j}</option>`).join('')}
      </select></div>
    </div>`,
    `<button class="btn btn-f" onclick="dlgClose()">Anulează</button>
     <button class="btn btn-p" onclick="saveProfile()">Salvează</button>`
  );
}
function saveProfile(){
  const n=globalThis.$('pr-name')?.value?.trim();
  if(!n){globalThis.toast('Numele este obligatoriu','err');return}
  globalThis.S.user.name=n;
  globalThis.S.user.party=globalThis.$('pr-party')?.value;
  globalThis.S.user.fn=globalThis.$('pr-fn')?.value;
  globalThis.S.user.jud=globalThis.$('pr-jud')?.value;
  globalThis.dlgClose();globalThis.applyProfile();
  globalThis.toast('Profil actualizat','ok');
}
function initProfileFeature(){
  globalThis.openProfileDlg=openProfileDlg;
  globalThis.saveProfile=saveProfile;
}
globalThis.initProfileFeature=initProfileFeature;
})();