;(function(){
const GUIDE_YT_VIDEOS={
  qHTgt82ZGPM:{
    title:'THE CLAN OF THE GREAT WHITE. An investigation into the finances of the Romanian Orthodox Church',
    embed:'https://www.youtube.com/embed/qHTgt82ZGPM',
  },
  S_ZVCHJpTDk:{
    title:'INVESTIGAȚIE RECORDER. Corupție în numele Domnului',
    embed:'https://www.youtube.com/embed/S_ZVCHJpTDk',
  },
  PXOf_mJRFSg:{
    title:'Context public: Mădălin Iscru · investigație despre contracte publice',
    embed:'https://www.youtube.com/embed/PXOf_mJRFSg',
  },
  ozANAmN5UDY:{
    title:'Context public: Ionuț Lipan · investigație despre contracte publice',
    embed:'https://www.youtube.com/embed/ozANAmN5UDY',
  },
};
function guideYoutubeVideoMeta(videoId,title){
  const vid=String(videoId||'').trim();
  const known=GUIDE_YT_VIDEOS[vid];
  const safeTitle=String(title||known?.title||'Video context').trim();
  return{vid,title:safeTitle,embed:known?.embed||`https://www.youtube.com/embed/${encodeURIComponent(vid)}`};
}
function openGuideYoutubeVideoConsent(videoId,title){
  const meta=guideYoutubeVideoMeta(videoId,title);
  const vid=meta.vid;
  if(!/^[a-zA-Z0-9_-]{11}$/.test(vid)){
    globalThis.toast('Video indisponibil sau ID invalid','err');
    return;
  }
  const safeTitle=globalThis.escapeHtml(meta.title);
  const watchUrl=`https://www.youtube.com/watch?v=${encodeURIComponent(vid)}`;
  const body=`
    <p class="tsm" style="line-height:1.6;margin:0 0 10px">
      <strong>${safeTitle}</strong>
    </p>
    <p class="tsm tmut" style="line-height:1.6;margin:0">
      Pentru protecția datelor, clipul nu este încărcat automat. Dacă alegi redarea în SifonatorPRO, se va încărca un iframe YouTube și pot fi trimise date către YouTube.
    </p>`;
  const actions=`
    <button type="button" class="btn btn-f" onclick='window.open(${JSON.stringify(watchUrl)},"_blank","noopener,noreferrer");dlgClose()'>Deschide pe YouTube</button>
    <button type="button" class="btn btn-p" onclick='openGuideYoutubeVideoEmbed(${JSON.stringify(vid)},${JSON.stringify(meta.title)})'>Redă în SifonatorPRO</button>`;
  globalThis.dlgOpen('Consimțământ conținut extern','Video YouTube',body,actions);
}
function openGuideYoutubeVideoEmbed(videoId,title){
  const meta=guideYoutubeVideoMeta(videoId,title);
  const vid=meta.vid;
  if(!/^[a-zA-Z0-9_-]{11}$/.test(vid)){
    globalThis.toast('Video indisponibil sau ID invalid','err');
    return;
  }
  const watchUrl=`https://www.youtube.com/watch?v=${encodeURIComponent(vid)}`;
  if(String(globalThis.location?.protocol||'')==='file:'){
    const body=`
      <p class="tsm" style="line-height:1.6;margin:0 0 10px">
        Playerul YouTube nu poate fi încărcat din <code>file://</code>.
      </p>
      <p class="tsm tmut" style="line-height:1.6;margin:0">
        Deschide clipul direct pe YouTube sau pornește aplicația printr-un server local (ex: <code>http://localhost</code>) pentru embed în aplicație.
      </p>`;
    const actions=`
      <button type="button" class="btn btn-f" onclick='window.open(${JSON.stringify(watchUrl)},"_blank","noopener,noreferrer");dlgClose()'>Deschide pe YouTube</button>
      <button type="button" class="btn btn-p" onclick="dlgClose()">Închide</button>`;
    globalThis.dlgOpen('Limitare file://','YouTube embed indisponibil local',body,actions);
    return;
  }
  const safeTitle=globalThis.escapeHtml(meta.title);
  const embedUrl=meta.embed;
  const body=`
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px">
      <strong>${safeTitle}</strong>
      <span class="badge bk">YouTube embed</span>
    </div>
    <div class="yt-embed">
      <iframe
        width="957"
        height="538"
        title="${safeTitle}"
        src="${embedUrl}"
        style="display:block;width:100%;aspect-ratio:16/9;border:0"
        frameborder="0"
        loading="lazy"
        referrerpolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>
    </div>`;
  const actions=`<button type="button" class="btn btn-f" onclick="dlgClose()">Închide</button>`;
  globalThis.dlgOpen('Cadru video','Conținut extern redat în aplicație',body,actions,{wideVideo:true});
}
function renderHowto(){
  const el=globalThis.$('howto-meta');
  if(el)el.innerHTML=`<span class="tmut">Dificultate curentă: <strong>${globalThis.diffLabelRo(globalThis.S.settings.difficulty||'normal')}</strong> · Plafon reputație: <strong>${globalThis.repMax()}</strong> · Reducere abonament: <strong>${globalThis.disc().toFixed(1)}%</strong></span>`;
  const bin=globalThis.$('howto-sifonpay-bin');
  if(bin){
    const rows=globalThis.CARD_BANK_RULES.flatMap(r=>r.prefixes.map(p=>({p,bank:r.bank,chance:r.chance})));
    const tbody=rows.map(x=>`<tr><td style="padding:6px 8px;border-bottom:1px solid var(--border);font-family:var(--mono)"><code>${x.p}</code></td><td style="padding:6px 8px;border-bottom:1px solid var(--border)">${x.bank}</td><td style="padding:6px 8px;border-bottom:1px solid var(--border)">~${Math.round(x.chance*100)}%</td></tr>`).join('');
    bin.innerHTML=`
      <p class="tsm mt8 lh165"><strong>Prefixul (BIN)</strong> înseamnă primele <strong>6 cifre</strong>, care identifică o <strong>bancă fictivă</strong>. Pentru anumite prefixe există o <strong>șansă</strong> ca SifonPay să deschidă <strong>3D Secure</strong>: fereastră cu <strong>timer de 10 minute</strong>, câmp pentru <strong>codul din Șpagafon</strong> (butonul din SMS îl lipește) și confirmare. Modurile push/app simulate pot să nu afișeze cod. Alte prefixe pot trece direct fără 3DS.</p>
      <div style="overflow-x:auto;margin-top:10px">
        <table style="width:100%;font-size:12px;border-collapse:collapse">
          <thead><tr><th style="text-align:left;padding:6px 8px;border-bottom:1px solid var(--border)">Prefix (6 cifre)</th><th style="text-align:left;padding:6px 8px;border-bottom:1px solid var(--border)">Bancă fictivă</th><th style="text-align:left;padding:6px 8px;border-bottom:1px solid var(--border)">Șansă 3DS*</th></tr></thead>
          <tbody>${tbody}</tbody>
        </table>
      </div>
      <p class="tsm tmut mt8">* Probabilitate orientativă pe tranzacție; nu garantează 3DS la fiecare încercare. Exemplu: pentru test poți începe numărul cu <code style="background:var(--bg);padding:1px 5px;border-radius:4px">451900</code> sau <code style="background:var(--bg);padding:1px 5px;border-radius:4px">379421</code> (apoi completezi restul cifrelor).</p>`;
  }
}
function initGuidePage(){
  globalThis.openGuideYoutubeVideoConsent=openGuideYoutubeVideoConsent;
  globalThis.openGuideYoutubeVideoEmbed=openGuideYoutubeVideoEmbed;
  globalThis.renderHowto=renderHowto;
}
globalThis.initGuidePage=initGuidePage;
})();