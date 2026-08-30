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
  const run=()=>{if(!el.isConnected)return;el.textContent=text;el.classList.add('glitch-fragment');el.dataset.text=text;setTimeout(()=>{el.classList.remove('glitch-fragment');el.removeAttribute('data-text');el.textContent=after},reduce?1800:hold)};
  setTimeout(run,reduce?650:420);
}

export function maybeReviewButtonFlicker(button){
  if(!button||hasFlag('reviewButtonFlickerShown'))return;
  flag('reviewButtonFlickerShown');const original=button.textContent;
  setTimeout(()=>{if(!button.isConnected)return;button.textContent='别去。';button.classList.add('glitch-button');setTimeout(()=>{button.textContent=original;button.classList.remove('glitch-button')},settings().reducedMotion?1800:980)},settings().reducedMotion?1000:1200);
}

// 强感知异常：次数少、持续可见、恢复后不修改稳定证据。
// 只使用站内已有照片与行政字段，不出现“你是下一个”一类直接恐怖台词。
export function showSanEvent({flagName,title='',words=[],image='',caption='',variant='text',hold=2200,delay=650}={}){
  if(!flagName||hasFlag(flagName)||document.querySelector('.san-event-layer'))return false;
  const reduce=settings().reducedMotion;
  const layer=document.createElement('div');layer.className=`san-event-layer san-${variant}`;layer.setAttribute('aria-hidden','true');
  const useWords=variant==='snapshot'?[]:(words.length?words:['已确认','已归档']);
  const safeWords=useWords.map((w,i)=>`<span style="--i:${i}" data-word="${escapeAttr(w)}">${escapeHTML(w)}</span>`).join('');
  const imageHTML=image?`<figure class="san-event-image"><img src="${escapeAttr(image)}" alt=""><figcaption>${escapeHTML(caption)}</figcaption></figure>`:'';
  const cats=variant==='forum'?Array.from({length:9},(_,i)=>`<div class="san-forum-card cat-corrupt-card cat-corrupt-${(i%3)+1}"><span class="cat-corrupt-wrap" aria-hidden="true"><img src="assets/img/cat-1.jpg" alt=""></span><span>${['明天什么时候回来？','食堂二楼现在排队吗','物理卷有人写完了吗','宿舍热水开了吗','校车几点到','明天什么时候回来？','图书馆几点关门','有人还在学校吗','明天什么时候回来？'][i]}</span></div>`).join(''):'';
  layer.innerHTML=`<div class="san-event-shell">${title?`<div class="san-event-title">${escapeHTML(title)}</div>`:''}${imageHTML}${variant==='forum'?`<div class="san-forum-grid">${cats}</div>`:safeWords?`<div class="san-word-field">${safeWords}</div>`:''}</div>`;
  setTimeout(()=>{
    if(!document.body)return;flag(flagName);document.body.appendChild(layer);requestAnimationFrame(()=>layer.classList.add('visible'));
    const visibleFor=reduce?Math.max(2600,hold):Math.max(1750,hold);
    setTimeout(()=>{layer.classList.remove('visible');setTimeout(()=>layer.remove(),reduce?140:280)},visibleFor);
  },reduce?Math.max(900,delay):delay);
  return true;
}

function escapeHTML(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function escapeAttr(s=''){return escapeHTML(s)}
