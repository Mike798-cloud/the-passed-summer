import {anomalyLevel,settings,hasFlag,flag} from './state.js';
import {playCue} from './audio.js';

export function applyAnomalyFrame(){
  const lvl=anomalyLevel();document.body.dataset.anomaly=String(lvl);
  const s=settings();document.documentElement.classList.toggle('reduced-motion',!!s.reducedMotion);
  document.querySelectorAll('[data-anomaly-text]').forEach(el=>{
    const normal=el.dataset.normalText||el.textContent;el.dataset.normalText=normal;
    const variants=[el.dataset.l1,el.dataset.l2,el.dataset.l3,el.dataset.l4];
    let text=normal;for(let i=0;i<lvl;i++){if(variants[i])text=variants[i]}
    el.textContent=text;
  });
}

export function maybeMyReturnFlash(){
  const lvl=anomalyLevel();if(lvl<3||hasFlag('myReturnFlashShown'))return;
  const receipt=document.querySelector('[data-history-receipt]');
  const name=document.querySelector('[data-masked-name]');
  const top=document.querySelector('[data-cross-status]');const candidate=document.querySelector('[data-attribution-candidate]');
  if(!receipt||!name)return;
  flag('myReturnFlashShown');
  const reduce=settings().reducedMotion;
  if(top){top.classList.add('continuity-flash');setTimeout(()=>top.classList.remove('continuity-flash'),reduce?1300:1250)}
  if(candidate){candidate.hidden=false;candidate.classList.add('anomaly-field');setTimeout(()=>{candidate.hidden=true;candidate.classList.remove('anomaly-field')},reduce?1500:1250)}
  setTimeout(()=>{const old=name.textContent;name.textContent='林晚';receipt.classList.add('anomaly-field');setTimeout(()=>{name.textContent=old;receipt.classList.remove('anomaly-field')},reduce?1200:850)},reduce?500:500);
}

export function triggerJ2(){
  if(anomalyLevel()<4||hasFlag('j2Shown'))return;
  const box=document.querySelector('[data-j2-summary]');if(!box)return;
  flag('j2Shown');const original=box.innerHTML;const reduce=settings().reducedMotion;
  const replacement=`<div class="small muted">2022 历史到校核验</div><div style="font-size:1.45rem;font-weight:700;color:#684b2d">48/48</div><div class="small">归属已确认：当前账户</div>`;
  setTimeout(()=>{box.innerHTML=replacement;box.classList.add('j2-flash');playCue('bell');setTimeout(()=>{box.innerHTML=original;box.classList.remove('j2-flash')},reduce?1600:1100)},reduce?900:700);
}


// Early-session micro anomalies only affect association labels, never stable evidence fields.
// They are deliberately ambiguous enough to read as a migration UI refresh rather than a horror effect.
export function maybeEarlyAssociationFlicker({firstVisit=false}={}){
  if(!firstVisit||hasFlag('earlyAssociationFlickerShown'))return;
  const badge=document.querySelector('[data-association-badge]');if(!badge)return;
  const original=badge.textContent;
  const delay=settings().reducedMotion?1500:1900;
  setTimeout(()=>{
    if(!badge.isConnected||hasFlag('earlyAssociationFlickerShown'))return;
    flag('earlyAssociationFlickerShown');
    badge.textContent='历史连续';badge.classList.add('soft-flicker');
    setTimeout(()=>{badge.textContent=original;badge.classList.remove('soft-flicker')},settings().reducedMotion?850:520);
  },delay);
}

export function maybeReturnCrossFlicker(){
  if(hasFlag('earlyCrossFlickerShown'))return;
  if(!(hasFlag('viewedArrival47')||hasFlag('viewedRollcall47')))return;
  const box=document.querySelector('[data-cross-status]');if(!box)return;
  const original=box.innerHTML;
  setTimeout(()=>{
    if(!box.isConnected||hasFlag('earlyCrossFlickerShown'))return;
    flag('earlyCrossFlickerShown');
    box.innerHTML='<strong>当前状态：待核验</strong> · 历史连续性校验完成。';box.classList.add('cross-flicker');
    setTimeout(()=>{box.innerHTML=original;box.classList.remove('cross-flicker')},settings().reducedMotion?1050:650);
  },settings().reducedMotion?1100:850);
}
