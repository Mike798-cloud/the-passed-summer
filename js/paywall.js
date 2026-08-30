import {get,set,hasFlag,currentReturnSubmitted,plotStage} from './state.js';

/**
 * 《返校确认》1 元自愿支持弹层。
 * 交互结构沿用《松涛粮站》的 Paywall：三重支持标记、一次自动弹出、手动入口、二维码、自愿确认。
 * 当前作品仅调整触发时机、文案、键名与无障碍细节，不参与主线解谜或结局判定。
 */
const KEYS={
  local:'_return_confirmation_support',
  session:'_return_confirmation_session',
  cookie:'_return_confirmation_pay_flag'
};
const AUTO_KEY='supportAutoShown';
const QR_URL='https://mike798-cloud.github.io/songtao-grainstation/paycode.png';
let lastFocus=null;
let keyHandler=null;
let oldOverflow='';

function getStore(kind){try{return kind==='local'?window.localStorage:window.sessionStorage}catch{return null}}
function safeGet(store,key){try{return store?.getItem(key)||''}catch{return ''}}
function safeSet(store,key,value){try{store?.setItem(key,value);return true}catch{return false}}
function setCookie(name,value,days){
  try{const d=new Date();d.setTime(d.getTime()+days*86400000);document.cookie=`${name}=${value};expires=${d.toUTCString()};path=/;SameSite=Lax`}catch{}
}
function getCookie(name){
  try{const prefix=name+'=';for(const part of document.cookie.split(';')){const c=part.trim();if(c.startsWith(prefix))return c.slice(prefix.length)}}catch{}
  return '';
}
function token(){
  const raw=`${Date.now()}_${Math.random().toString(36).slice(2,10)}_abc_studio_return`;
  try{return btoa(unescape(encodeURIComponent(raw)))}catch{return raw}
}
function focusables(root){return [...root.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(x=>!x.disabled&&!x.hidden&&x.getAttribute('aria-hidden')!=='true')}
function bindDialogKeys(overlay){
  unbindDialogKeys();
  keyHandler=e=>{
    if(e.key==='Escape'){e.preventDefault();Paywall.hide();return}
    if(e.key!=='Tab')return;
    const list=focusables(overlay);if(!list.length)return;
    const first=list[0],last=list[list.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  };
  document.addEventListener('keydown',keyHandler);
}
function unbindDialogKeys(){if(keyHandler){document.removeEventListener('keydown',keyHandler);keyHandler=null}}

export const Paywall={
  hasPaid(){
    return !!(safeGet(getStore('local'),KEYS.local)||safeGet(getStore('session'),KEYS.session)||getCookie(KEYS.cookie));
  },
  markPaid(){
    const t=token();safeSet(getStore('local'),KEYS.local,t);safeSet(getStore('session'),KEYS.session,t);setCookie(KEYS.cookie,t,365);
  },
  show(config={}){
    if(this.hasPaid())return false;
    lastFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
    let overlay=document.getElementById('paywall-overlay');
    if(!overlay){overlay=this._createOverlay(config)}
    else{overlay.style.display='flex';overlay.classList.remove('paywall-closing')}
    oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
    requestAnimationFrame(()=>requestAnimationFrame(()=>overlay.classList.add('paywall-show')));
    bindDialogKeys(overlay);
    setTimeout(()=>overlay.querySelector('.paywall-close')?.focus(),30);
    return true;
  },
  hide(){
    const overlay=document.getElementById('paywall-overlay');if(!overlay)return;
    overlay.classList.add('paywall-closing');overlay.classList.remove('paywall-show');unbindDialogKeys();
    setTimeout(()=>{overlay.style.display='none';overlay.classList.remove('paywall-closing');document.body.style.overflow=oldOverflow;lastFocus?.focus?.()},400);
  },
  _onSupport(){this.markPaid();this.hide();this._showThanks()},
  _showThanks(){
    const old=document.querySelector('.paywall-toast');old?.remove();
    const toast=document.createElement('div');toast.className='paywall-toast';toast.setAttribute('role','status');toast.textContent='感谢你的支持！愿每一条记录，都被认真对待。';document.body.appendChild(toast);
    setTimeout(()=>toast.classList.add('show'),50);setTimeout(()=>{toast.classList.remove('show');setTimeout(()=>toast.remove(),400)},3000);
  },
  _createOverlay(config){
    const cfg=Object.assign({qrCode:QR_URL,price:'1元',title:'支持《返校确认》',studio:'abc studio'},config||{});
    const wrap=document.createElement('div');
    wrap.innerHTML=`<div class="paywall-overlay" id="paywall-overlay" role="dialog" aria-modal="true" aria-labelledby="paywall-title" aria-describedby="paywall-copy">
      <div class="paywall-card">
        <button class="paywall-close" type="button" title="关闭" aria-label="关闭支持窗口">&times;</button>
        <div class="paywall-card-inner">
          <div class="paywall-header">
            <div class="paywall-title-row"><span class="paywall-heart" aria-hidden="true">♡</span><span class="paywall-title" id="paywall-title">${cfg.title}</span><span class="paywall-heart" aria-hidden="true">♡</span></div>
            <div class="paywall-subtitle">${cfg.price} 自愿打赏 · 感谢支持</div>
          </div>
          <div class="paywall-body">
            <div class="paywall-qr-wrapper"><img src="${cfg.qrCode}" alt="abc工作室 1 元收款码" class="paywall-qr-img"><div class="paywall-qr-glow"></div><div class="paywall-qr-error" hidden>收款码需要联网加载。<a href="${cfg.qrCode}" target="_blank" rel="noopener noreferrer">单独打开收款码</a></div></div>
            <div class="paywall-qr-tip">请用 <strong>某宝</strong> 扫码打赏 ${cfg.price}</div>
            <div class="paywall-message" id="paywall-copy">
              <p class="paywall-msg-warm">你好，我是 abc studio 的独立开发者。</p>
              <p class="paywall-msg-body">制作《返校确认》花了很多时间去打磨这些看起来很普通的校园页面和旧资料。<br>如果你在这段返校手续里感受到了一点不安或触动，愿意支持 <strong>1元</strong> 打赏，<br>那会成为我继续制作网页解谜作品的动力。</p>
              <p class="paywall-msg-cute">1块钱买不到一杯奶茶，但能让我继续认真做下一份旧档案。</p>
              <p class="paywall-msg-warm2">感谢每一位愿意慢慢读完这些普通页面的人。</p>
            </div>
          </div>
          <div class="paywall-footer">
            <div class="paywall-hint"><span class="paywall-hint-icon" aria-hidden="true">💡</span><span>小提示：点击“下次一定”不会影响任何内容、流程或结局；本窗口只会自动出现一次。</span></div>
            <div class="paywall-btns"><button class="paywall-btn paywall-btn-support" type="button">已完成支持 ♡</button><button class="paywall-btn paywall-btn-later" type="button">下次一定</button></div>
          </div>
          <div class="paywall-studio">${cfg.studio}</div>
        </div>
      </div>
    </div>`;
    const overlay=wrap.firstElementChild;document.body.appendChild(overlay);
    overlay.querySelector('.paywall-close')?.addEventListener('click',()=>this.hide());
    overlay.querySelector('.paywall-btn-support')?.addEventListener('click',()=>this._onSupport());
    overlay.querySelector('.paywall-btn-later')?.addEventListener('click',()=>this.hide());
    overlay.addEventListener('click',e=>{if(e.target===overlay)this.hide()});
    const img=overlay.querySelector('.paywall-qr-img'),err=overlay.querySelector('.paywall-qr-error');
    img?.addEventListener('error',()=>{img.hidden=true;if(err)err.hidden=false});
    return overlay;
  }
};

export function maybeAutoSupport(){
  if(Paywall.hasPaid()||get(AUTO_KEY,false))return false;
  // 自动支持只出现在第一轮历史矛盾之后的平静业务页，避开猫图、23:18、整页异常、事故记录和18:40等情绪节点。
  if(!currentReturnSubmitted())return false;
  const stage=plotStage(),page=document.body?.dataset?.page||'';
  if(stage!==3)return false;
  if(!['home','my','migration'].includes(page))return false;
  set(AUTO_KEY,true);
  setTimeout(()=>Paywall.show(),900);
  return true;
}

window.Paywall=Paywall;
