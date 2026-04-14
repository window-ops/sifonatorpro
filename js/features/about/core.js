;(function(){
const ABOUT_EGG_STORIES=globalThis.ABOUT_EGG_STORIES||[];

let aboutElixirSpins=0;
let aboutEggShownChars=0;
let aboutEggStoryIdx=-1;
let aboutEggSolved=false;
let _aboutEggSpillAnim=null;
let _aboutEggFullySpilledNudge=false;

function setAboutElixirDisabled(v){
  const el=globalThis.$('about-elixir');
  if(!el)return;
  const on=!!v;
  el.classList.toggle('is-disabled',on);
  el.toggleAttribute('disabled',on);
  el.setAttribute('aria-disabled',on?'true':'false');
}
function setAboutEggAnswerControlsDisabled(v){
  const on=!!v;
  const host=globalThis.$('about-egg-choices');
  if(host)host.querySelectorAll('button').forEach(b=>b.disabled=on);
  const inp=globalThis.$('about-egg-answer');if(inp)inp.disabled=on;
  const wrap=globalThis.$('about-egg-input-wrap');
  if(wrap)wrap.querySelectorAll('button').forEach(b=>b.disabled=on);
}
function getAboutEggMode(){
  const m=globalThis.S?.settings?.aboutEggMode;
  return m==='input'?'input':'buttons';
}
function setAboutEggMode(mode){
  const m=(mode==='input')?'input':'buttons';
  if(!globalThis.S.settings||typeof globalThis.S.settings!=='object')globalThis.S.settings={};
  globalThis.S.settings.aboutEggMode=m;
  const b1=globalThis.$('about-egg-mode-buttons'),b2=globalThis.$('about-egg-mode-input');
  b1?.classList.toggle('btn-p',m==='buttons');
  b2?.classList.toggle('btn-p',m==='input');
  b1?.classList.toggle('btn-f',m!=='buttons');
  b2?.classList.toggle('btn-f',m!=='input');
  globalThis.$('about-egg-choices')?.classList.toggle('hid',m!=='buttons');
  globalThis.$('about-egg-input-wrap')?.classList.toggle('hid',m!=='input');
  const quiz=globalThis.$('about-egg-quiz');
  const story=aboutEggStoryCurrent();
  if(quiz&&!quiz.classList.contains('about-egg-off')&&story&&m==='buttons'){
    if(!(globalThis.$('about-egg-choices')?.innerHTML||'').trim())renderAboutEggChoices(story);
  }
}
function normalizeEggAnswer(v){
  return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
}
function syncAboutEggFeedbackSpacing(){
  const quiz=globalThis.$('about-egg-quiz');
  const fb=globalThis.$('about-egg-feedback');
  if(!quiz||!fb)return;
  quiz.classList.toggle('about-egg-has-feedback',!!String(fb.textContent||'').trim());
}
function aboutEggStoryCurrent(){
  if(aboutEggStoryIdx<0||aboutEggStoryIdx>=ABOUT_EGG_STORIES.length)return null;
  return ABOUT_EGG_STORIES[aboutEggStoryIdx];
}
function pickRandomAboutEggStory(){
  if(!ABOUT_EGG_STORIES.length)return null;
  let idx=Math.floor(Math.random()*ABOUT_EGG_STORIES.length);
  if(ABOUT_EGG_STORIES.length>1&&idx===aboutEggStoryIdx)idx=(idx+1)%ABOUT_EGG_STORIES.length;
  aboutEggStoryIdx=idx;
  aboutEggShownChars=0;
  aboutEggSolved=false;
  _aboutEggFullySpilledNudge=false;
  setAboutElixirDisabled(false);
  setAboutEggAnswerControlsDisabled(false);
  const fb=globalThis.$('about-egg-feedback');if(fb)fb.textContent='';
  syncAboutEggFeedbackSpacing();
  const choices=globalThis.$('about-egg-choices');if(choices)choices.innerHTML='';
  const inp=globalThis.$('about-egg-answer');if(inp)inp.value='';
  globalThis.$('about-egg-quiz')?.classList.add('about-egg-off');
  globalThis.$('about-egg-input-wrap')?.classList.add('hid');
  return ABOUT_EGG_STORIES[idx];
}
function _aboutEggSetText(eggEl,story,shown){
  eggEl.textContent=story.text.slice(0,shown)+(shown<story.text.length?' …':'');
}
function _aboutEggAnimateSpillTo(eggEl,story,target,onDone){
  if(!eggEl||!story)return;
  if(_aboutEggSpillAnim)cancelAnimationFrame(_aboutEggSpillAnim);
  const from=aboutEggShownChars;
  const to=globalThis.clamp(target,0,story.text.length);
  if(to<=from){
    _aboutEggSetText(eggEl,story,from);
    if(onDone)onDone();
    return;
  }
  const start=performance.now();
  const dur=220;
  const tick=()=>{
    const t=globalThis.clamp((performance.now()-start)/dur,0,1);
    const e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
    const cur=Math.max(from,Math.floor(from+(to-from)*e));
    aboutEggShownChars=cur;
    _aboutEggSetText(eggEl,story,cur);
    if(t<1)_aboutEggSpillAnim=requestAnimationFrame(tick);
    else{
      _aboutEggSpillAnim=null;
      if(onDone)onDone();
    }
  };
  _aboutEggSpillAnim=requestAnimationFrame(tick);
}
function renderAboutEggChoices(story){
  const host=globalThis.$('about-egg-choices');
  if(!host||!story)return;
  const titles=[...new Set(ABOUT_EGG_STORIES.map(s=>s.title))].filter(Boolean);
  const others=titles.filter(t=>t!==story.title);
  for(let i=others.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    const tmp=others[i];others[i]=others[j];others[j]=tmp;
  }
  const pool=[story.title,...others.slice(0,5)];
  const fallbackPool=['Baltagul','Enigma Otiliei','Moromeții','Ultima noapte de dragoste','Pădurea spânzuraților','Mara'];
  for(let i=0;pool.length<6&&i<fallbackPool.length;i++){
    if(!pool.includes(fallbackPool[i]))pool.push(fallbackPool[i]);
  }
  for(let i=pool.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    const t=pool[i];pool[i]=pool[j];pool[j]=t;
  }
  const dis=aboutEggSolved?' disabled':'';
  host.innerHTML=pool.map(lbl=>`<button type="button" class="btn btn-f btn-sm" data-egg-choice="${globalThis.escapeHtml(lbl)}" onclick="checkAboutEggChoiceFromAttr(this)"${dis}>${globalThis.escapeHtml(lbl)}</button>`).join('');
}
function checkAboutEggChoiceFromAttr(el){
  const v=el?.getAttribute('data-egg-choice')||'';
  checkAboutEggAnswer(v);
}
function checkAboutEggAnswer(choiceLabel){
  const story=aboutEggStoryCurrent();
  const fb=globalThis.$('about-egg-feedback');
  if(!story||!fb)return;
  if(aboutEggSolved)return;
  const mode=getAboutEggMode();
  const raw=(choiceLabel!=null&&String(choiceLabel).trim())?String(choiceLabel):(mode==='input'?String(globalThis.$('about-egg-answer')?.value||''):'');
  const ans=normalizeEggAnswer(raw);
  if(!ans)return;
  const ok=story.accept.some(a=>ans===normalizeEggAnswer(a));
  if(ok){
    aboutEggSolved=true;
    setAboutEggAnswerControlsDisabled(true);
    setAboutElixirDisabled(false);
    fb.textContent=`Corect. Fragmentul este din „${story.title}”. Mai rotește elixirul pentru alt fragment.`;
    globalThis.toast('Răspuns corect','ok');
  }else{
    fb.textContent='Nu acesta este răspunsul. Mai încearcă.';
  }
  syncAboutEggFeedbackSpacing();
}
function spinAboutElixir(){
  const el=globalThis.$('about-elixir');
  const egg=globalThis.$('about-easter-egg');
  const quiz=globalThis.$('about-egg-quiz');
  if(!egg)return;
  if(aboutEggSolved){
    pickRandomAboutEggStory();
    egg.textContent='';
    egg.classList.add('about-egg-off');
    if(quiz)quiz.classList.add('about-egg-off');
  }
  if(aboutElixirSpins<7){
    aboutElixirSpins++;
    if(el)el.style.setProperty('--about-rot',`${aboutElixirSpins*38}deg`);
    if(aboutElixirSpins===3)globalThis.toast('Elixirul începe să bolborosească...','ok');
    return;
  }
  const story=aboutEggStoryCurrent()||pickRandomAboutEggStory();
  if(!story)return;
  if(aboutEggShownChars>=story.text.length){
    setAboutElixirDisabled(false);
    if(!_aboutEggFullySpilledNudge){
      globalThis.toast('Fragment complet. Ghicește opera ca să primești altul','ok');
      _aboutEggFullySpilledNudge=true;
    }
    return;
  }
  setAboutElixirDisabled(false);
  aboutElixirSpins++;
  if(el)el.style.setProperty('--about-rot',`${aboutElixirSpins*38}deg`);
  const spillNow=Math.random()<0.62||aboutElixirSpins%3===0;
  if(!spillNow)return;
  egg.classList.remove('about-egg-off');
  const len=story.text.length;
  let step=len<=220?Math.ceil(len/6):len<=520?Math.ceil(len/5):170;
  step=globalThis.clamp(step,18,170);
  const target=Math.min(len,aboutEggShownChars+step);
  const revealQuiz=target>=story.text.length?()=>{
    if(aboutEggStoryCurrent()!==story)return;
    if(aboutEggShownChars<story.text.length)return;
    if(quiz)quiz.classList.remove('about-egg-off');
    setAboutEggMode(getAboutEggMode());
    if(getAboutEggMode()==='buttons')renderAboutEggChoices(story);
    setAboutElixirDisabled(true);
    globalThis.toast('Elixirul a vărsat fragmentul. Ghicește opera','ok');
  }:null;
  _aboutEggAnimateSpillTo(egg,story,target,revealQuiz);
}

function initAbout(){
  globalThis.setAboutEggMode=setAboutEggMode;
  globalThis.checkAboutEggChoiceFromAttr=checkAboutEggChoiceFromAttr;
  globalThis.checkAboutEggAnswer=checkAboutEggAnswer;
  globalThis.spinAboutElixir=spinAboutElixir;
}
globalThis.initAbout=initAbout;
})();