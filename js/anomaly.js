import {anomalyLevel,settings,hasFlag,flag,plotStage} from './state.js';

export function applyAnomalyFrame(){
  const lvl=anomalyLevel();document.body.dataset.anomaly=String(lvl);document.body.dataset.plot=String(plotStage());
  document.documentElement.classList.toggle('reduced-motion',!!settings().reducedMotion);
  document.querySelectorAll('[data-anomaly-text]').forEach(el=>{
    const normal=el.dataset.normalText||el.textContent;el.dataset.normalText=normal;
    const variants=[el.dataset.l1,el.dataset.l2,el.dataset.l3,el.dataset.l4];let text=normal;
    for(let i=0;i<lvl;i++){if(variants[i])text=variants[i]}
    el.textContent=text;
  });
}

export function revealGlitch(el,text,{hold=920,after='该回复已删除'}={}){
  if(!el||el.dataset.glitchDone==='1')return;
  el.dataset.glitchDone='1';const reduce=settings().reducedMotion;
  const run=()=>{if(!el.isConnected)return;el.textContent=text;el.classList.add('glitch-fragment');el.dataset.text=text;setTimeout(()=>{el.classList.remove('glitch-fragment');el.removeAttribute('data-text');el.textContent=after},reduce?1500:hold)};
  setTimeout(run,reduce?550:420);
}

export function maybeReviewButtonFlicker(button){
  if(!button||hasFlag('reviewButtonFlickerShown'))return;
  flag('reviewButtonFlickerShown');const original=button.textContent;
  setTimeout(()=>{if(!button.isConnected)return;button.textContent='别去。';button.classList.add('glitch-button');setTimeout(()=>{button.textContent=original;button.classList.remove('glitch-button')},settings().reducedMotion?1300:720)},settings().reducedMotion?900:1200);
}
