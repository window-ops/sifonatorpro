;(function(){
function openProfileDlg(){
  const u=globalThis.S.user||{};
  const safeName=globalThis.escapeHtml(u.name||'');
  const safeFn=globalThis.escapeHtml(u.fn||'');
  const safeJud=globalThis.escapeHtml(u.jud||'');
  const safeParty=globalThis.escapeHtml(u.party||'');
  const safeSince=globalThis.escapeHtml(u.since||'');
  const safeAvatarInitial=globalThis.escapeHtml(String(u.name||'?').trim().charAt(0).toUpperCase()||'?');
  globalThis.dlgOpen('Profil Utilizator','',
    `<div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;padding:14px;background:var(--bg);border-radius:var(--r)">
      <div class="profile-avatar" style="background:${globalThis.partyColor(u.party)}">${safeAvatarInitial}</div>
      <div>
        <div class="bold" style="font-size:16px">${safeName}</div>
        <div class="tsm tmut">${safeFn} · ${safeJud}</div>
        <div class="tsm tmut">Partid: <strong>${safeParty}</strong> · Cont din: ${safeSince}</div>
      </div>
    </div>
    <div class="fg-row">
      <div class="fg"><label>Nume și prenume</label><input id="pr-name" value="${safeName}" style="width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:var(--r);font-family:var(--font);font-size:14px;outline:none"/></div>
      <div class="fg"><label>Partid</label><select id="pr-party" style="width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:var(--r);font-family:var(--font);font-size:14px;outline:none">
        ${['PSD','PNL','USR','AUR','UDMR','PP-DD','Independent'].map(p=>`<option${p===u.party?' selected':''}>${globalThis.escapeHtml(p)}</option>`).join('')}
      </select></div>
    </div>
    <div class="fg-row">
      <div class="fg"><label>Funcție</label><select id="pr-fn" style="width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:var(--r);font-family:var(--font);font-size:14px;outline:none">
        ${['Primar','Viceprimar','Președinte Consiliu Județean','Consilier local','Director Direcție Buget','Inspector ANAP','Șef Serviciu Achiziții'].map(f=>`<option${f===u.fn?' selected':''}>${globalThis.escapeHtml(f)}</option>`).join('')}
      </select></div>
      <div class="fg"><label>Județ</label><select id="pr-jud" style="width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:var(--r);font-family:var(--font);font-size:14px;outline:none">
        ${['Teleorman','Ilfov','Dolj','Prahova','Olt','Galați','Vâlcea','Dâmbovița','Neamț','Vaslui','Bacău','Constanța'].map(j=>`<option${j===u.jud?' selected':''}>${globalThis.escapeHtml(j)}</option>`).join('')}
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