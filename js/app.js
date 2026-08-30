import {initState,settings,patchSettings,countdownInfo,anomalyLevel,storageName,resetAll,flag,finalChoice,simulatedNow} from './state.js';
import {bindAudioUnlock,playCue} from './audio.js';
import {applyAnomalyFrame} from './anomaly.js';
import {Paywall,maybeAutoSupport} from './paywall.js';

initState();bindAudioUnlock();

const NAV=[
  ['index.html','返校总览','home'],['my-return.html','我的返校','my'],['notices.html','返校通知','notice'],['arrival.html','到校核验','arrival'],['rollcall.html','晚点名与后勤','rollcall'],['square.html','校园广场','square'],['history.html','校史检索','history'],['migration.html','账户迁移帮助','migration']
];
const page=document.body.dataset.page||'';

function shell(){
  const mount=document.querySelector('[data-site-shell]');if(!mount)return;
  mount.innerHTML=`<div class="site-shell"><div class="topline"></div><div class="govbar"><div class="inner"><span>栖岚实验高级中学 · 校园数字服务 <span class="gov-sep">|</span> <time data-campus-clock>08-29 22:18</time></span><span><a href="notice.html?id=2026-main">办事指南</a><span class="gov-sep">|</span><a href="migration.html">数据迁移说明</a><span class="gov-sep">|</span>服务编号 QL-RET-2026 · 信息中心服务台 806</span></div></div>
  <header class="masthead"><div class="inner"><a href="index.html" aria-label="返回返校服务平台首页"><img class="school-mark" src="assets/img/school-mark.svg" alt="栖岚实验高级中学校徽"></a><div class="school-title"><h1>2026 秋季学期返校服务平台</h1><p>栖岚实验高级中学 · 学生事务与后勤协同服务</p></div><div class="masthead-status"><span class="status-pill soft-anomaly" data-session-status><span class="status-dot"></span><span data-anomaly-text data-l2="当前校园会话已登录 · 历史关联待核验" data-l3="当前校园会话已登录 · 归属候选已生成" data-l4="当前校园会话已返校">当前校园会话已登录</span></span><br><span>高二（3）班 · 学生账户 · ****0417</span></div></div></header>
  <nav class="nav" aria-label="主导航"><div class="inner">${NAV.map(([href,label,id])=>`<a href="${href}" class="${page===id?'active':''}" ${page===id?'aria-current="page"':''}>${label}</a>`).join('')}<a class="search-link ${page==='search'?'active':''}" ${page==='search'?'aria-current="page"':''} href="search.html">站内搜索</a></div></nav>
  <main class="main"><div id="page-content"></div></main>
  <footer class="footer"><div class="inner"><div><b>栖岚实验高级中学</b> · 信息中心 / 学生处<br><span class="tiny">返校服务平台 v2026.08 · 校内服务标识 QL-RET-2026 · 数据更新以页面业务时间为准</span><br><span class="tiny">隐私提示：返校服务使用校园统一身份会话，本页面不要求重复填写证件号码或账户密码。</span></div><div class="controls"><button type="button" data-toggle-motion aria-pressed="false">减少动态效果</button><button type="button" data-toggle-muted aria-pressed="false">静音网站提示音</button><button type="button" data-support-author>支持作者 1元</button><button type="button" data-print>打印当前页</button></div></div></footer></div>`;
}
function syncSettings(){
  const s=settings();document.documentElement.classList.toggle('reduced-motion',!!s.reducedMotion);
  document.querySelector('[data-toggle-motion]')?.setAttribute('aria-pressed',String(!!s.reducedMotion));
  document.querySelector('[data-toggle-muted]')?.setAttribute('aria-pressed',String(!!s.muted));
}
function bindFooter(){
  document.querySelector('[data-toggle-motion]')?.addEventListener('click',e=>{const s=patchSettings({reducedMotion:!settings().reducedMotion});e.currentTarget.setAttribute('aria-pressed',String(s.reducedMotion));syncSettings();playCue('soft')});
  document.querySelector('[data-toggle-muted]')?.addEventListener('click',e=>{const next=!settings().muted;patchSettings({muted:next});e.currentTarget.setAttribute('aria-pressed',String(next));if(!next)playCue('notice')});
  document.querySelector('[data-support-author]')?.addEventListener('click',()=>Paywall.show());
  document.querySelector('[data-print]')?.addEventListener('click',()=>window.print());
}
function updateClock(){
  const c=countdownInfo();document.querySelectorAll('[data-deadline]').forEach(el=>{el.textContent=c.text;el.classList.toggle('muted',c.expired)});
  const now=simulatedNow();const stamp=`${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;document.querySelectorAll('[data-campus-clock]').forEach(el=>el.textContent=stamp);
}

shell();syncSettings();bindFooter();applyAnomalyFrame();updateClock();setInterval(updateClock,30000);
window.addEventListener('pageshow',()=>{applyAnomalyFrame();syncSettings();updateClock()});
window.addEventListener('ql:state',()=>applyAnomalyFrame());

export function pageRoot(){return document.getElementById('page-content')}
export function crumb(items=[]){return `<div class="breadcrumb"><a href="index.html">返校服务平台</a>${items.map((x,i)=>` <span aria-hidden="true">›</span> ${x.href&&i<items.length-1?`<a href="${x.href}">${x.label}</a>`:x.label}`).join('')}</div>`}
export function sideCommon(){const fc=finalChoice();const st=fc==='inherit'||fc==='detach'?'已提交':fc==='freeze'?'草稿 / 线下核验':'待核验';return `<aside class="sidebar"><div class="card"><h3 class="section-title">办理状态</h3><div class="small">2026 返校信息：<b>${st}</b></div><div class="small">截止时间：8 月 31 日 24:00</div><div class="deadline" data-deadline></div></div><div class="card quick-links"><h3 class="section-title">常用服务</h3><a href="my-return.html">核对我的返校信息</a><a href="migration.html">历史关联与迁移说明</a><a href="history.html">公开校史与归档</a><a href="notices.html?year=2026">2026 返校通知</a></div><div class="card"><h3 class="section-title">系统提示</h3><p class="small soft-anomaly" data-anomaly-text data-l2="请确认您的返校状态已经完成。" data-l3="您已返校，请完成确认。" data-l4="晚点确认也可以。未确认不影响您已经回来。">历史数据由旧平台迁移。如出现跨学年关联，请先核对来源后提交。</p><p class="tiny muted">存储模式：${storageName()==='localStorage'?'本机断点续办':storageName()==='sessionStorage'?'会话临时保存':'当前页面会话'}</p></div></aside>`}
export function safeText(s=''){return String(s).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]))}
export function serviceMeta(items=[]){return `<div class="service-meta">${items.map(([k,v])=>`<span><b>${safeText(k)}</b>${safeText(v)}</span>`).join('')}</div>`}
export function logicalPath(url=''){try{const u=new URL(url,location.href);const f=u.pathname.split('/').pop();const id=u.searchParams.get('id');const map={'index.html':'/return/2026/','my-return.html':'/my/return','notices.html':'/notice/archive','notice.html':id?`/notice/detail/${encodeURIComponent(id)}`:'/notice/detail','arrival.html':'/arrival/summary','rollcall.html':'/student/rollcall','dorm.html':'/dorm/service','square.html':'/square/search','square-post.html':id?`/square/topic/${encodeURIComponent(id)}`:'/square/topic','history.html':'/history/search','history-detail.html':id?`/history/detail/${encodeURIComponent(id)}`:'/history/detail','migration.html':'/account/migration','search.html':'/search','broadcast.html':'/notice/audio'};return map[f]||`/${f||''}`}catch{return '/'}}
export function safeInternalHref(url=''){const x=String(url||'').trim();if(!x||/^(?:javascript|data|vbscript):/i.test(x)||/^https?:/i.test(x))return '#';return safeText(x)}
export function trapFocus(root,onEscape){if(!root)return()=>{};const handler=e=>{if(root.hidden)return;if(e.key==='Escape'){e.preventDefault();onEscape?.();return}if(e.key!=='Tab')return;const nodes=[...root.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(x=>!x.disabled&&!x.hidden&&x.getAttribute('aria-hidden')!=='true');if(!nodes.length)return;const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}};document.addEventListener('keydown',handler);return()=>document.removeEventListener('keydown',handler)}
export async function fetchJSON(path){const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw new Error(`无法读取 ${path}`);return r.json()}
export function refreshShared(){updateClock();applyAnomalyFrame();syncSettings()}
export function maybeAutoSupportPrompt(){return maybeAutoSupport()}
export function showLoadError(err){pageRoot().innerHTML=`<div class="panel"><h2 class="section-title">页面暂时无法读取</h2><p>当前静态文件需要通过 HTTP 方式打开。请使用压缩包内的 <code>start-local.bat</code>，或部署到 GitHub Pages / 任意静态站点。</p><p class="small muted">${safeText(err?.message||'未知错误')}</p></div>`}

// Hidden QA reset: not exposed as game UI; URL ?reset=1 is operational only.
const params=new URLSearchParams(location.search);if(params.get('reset')==='1'){resetAll();location.replace(location.pathname)}
if(params.get('from')==='sso')flag('ssoVisited');
