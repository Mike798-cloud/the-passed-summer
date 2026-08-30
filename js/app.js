import {initState,settings,patchSettings,countdownInfo,anomalyLevel,storageName,resetAll,flag,hasFlag,finalChoice,currentReturnSubmitted,plotStage,environmentSnapshot,atmosphereStage,rememberPage,recentPages,day2Started} from './state.js';
import {bindAudioUnlock,playCue} from './audio.js';
import {applyAnomalyFrame} from './anomaly.js';
import {Paywall,maybeAutoSupport} from './paywall.js';

initState();bindAudioUnlock();
const NAV=[['index.html','返校总览','home'],['my-return.html','我的返校','my'],['notices.html','返校通知','notice'],['arrival.html','到校核验','arrival'],['rollcall.html','晚点名与后勤','rollcall'],['square.html','校园广场','square'],['history.html','校史检索','history'],['migration.html','账户与历史数据','migration']];
const page=document.body.dataset.page||'';

function shell(){
  const mount=document.querySelector('[data-site-shell]');if(!mount)return;
  const erased=!!finalChoice();
  const accountLine=erased?'账户状态：已转出':'高二（3）班 · 学生账户 · ****0417';
  const statusNormal=erased?'校园会话已失效':day2Started()?'当前校园会话已登录 · 人工事项处理中':'当前校园会话已登录';
  mount.innerHTML=`<div class="site-shell"><div class="topline"></div><div class="govbar"><div class="inner"><span>栖岚实验高级中学 · 校园数字服务 <span class="gov-sep">|</span> <time data-campus-clock>08-30 17:42</time> <span class="gov-sep">|</span> <span data-campus-weather>阴</span> <span class="gov-sep">|</span> 在线 <b data-campus-online>326</b></span><span><a href="notice.html?id=2026-main">办事指南</a><span class="gov-sep">|</span><a href="migration.html">历史数据说明</a><span class="gov-sep">|</span>服务编号 QL-RET-2026 · 信息中心服务台 806</span></div></div>
  <header class="masthead"><div class="inner"><a href="index.html" aria-label="返回返校服务平台首页"><img class="school-mark" src="assets/img/school-mark.svg" alt="栖岚实验高级中学校徽"></a><div class="school-title"><h1>2026 秋季学期返校服务平台</h1><p>栖岚实验高级中学 · 学生事务与后勤协同服务</p></div><div class="masthead-status"><span class="status-pill soft-anomaly" data-session-status><span class="status-dot"></span><span data-service-status data-anomaly-text data-l2="当前校园会话已登录 · 历史查询同步中" data-l3="当前校园会话已登录 · 访问质量复核" data-l4="当前校园会话已登录 · 学生事务事项流转中">${statusNormal}</span></span><br><span>${accountLine}</span></div></div></header>
  <nav class="nav" aria-label="主导航"><div class="inner">${NAV.map(([href,label,id])=>`<a href="${href}" class="${page===id?'active':''}" ${page===id?'aria-current="page"':''}>${label}</a>`).join('')}<a class="search-link ${page==='search'?'active':''}" ${page==='search'?'aria-current="page"':''} href="search.html">站内搜索</a></div></nav>
  <main class="main"><div id="page-content"></div></main>
  <footer class="footer"><div class="inner"><div><b>栖岚实验高级中学</b> · 信息中心 / 学生处<br><span class="tiny">返校服务平台 v2026.08 · 校内服务标识 QL-RET-2026 · 数据更新以页面业务时间为准</span><br><span class="tiny">隐私提示：返校服务使用校园统一身份会话，本页面不要求重复填写证件号码或账户密码。</span></div><div class="controls"><button type="button" data-open-settings>阅读设置</button><button type="button" data-support-author>支持作者 1元</button><button type="button" data-print>打印当前页</button></div></div></footer>
  <div class="confirm-layer settings-layer" data-settings-layer hidden role="dialog" aria-modal="true" aria-labelledby="reading-settings-title"><div class="confirm-card settings-card"><h3 id="reading-settings-title">阅读设置</h3><p class="small muted">这些选项只影响当前浏览器中的阅读方式，不改变剧情事实或结局条件。</p><label class="setting-row"><span><b>减少动态效果</b><small>降低轮播、故障字符与过渡动画的动态表现。</small></span><input type="checkbox" data-setting-motion></label><label class="setting-row"><span><b>静音网站提示音</b><small>关闭铃声与网站反馈提示音。</small></span><input type="checkbox" data-setting-muted></label><label class="setting-row"><span><b>有效信息下划线</b><small>默认关闭。开启后，只给当前页面中可用于业务核对的有效信息增加普通下划线，不新增结论或提示文字。</small></span><input type="checkbox" data-setting-effective></label><div class="settings-save"><div><b>本机存档</b><p class="tiny muted">包含访问记录、搜索历史、返校提交状态与结局。阅读设置不会随存档重置。</p></div><button type="button" class="btn" data-reset-save>重置存档</button></div><div class="confirm-actions"><button type="button" class="btn primary" data-close-settings>完成</button></div></div></div></div>`;
}
function syncSettings(){const s=settings();document.documentElement.classList.toggle('reduced-motion',!!s.reducedMotion);document.documentElement.classList.toggle('effective-underlines',!!s.effectiveUnderline);const motion=document.querySelector('[data-setting-motion]'),muted=document.querySelector('[data-setting-muted]'),effective=document.querySelector('[data-setting-effective]');if(motion)motion.checked=!!s.reducedMotion;if(muted)muted.checked=!!s.muted;if(effective)effective.checked=!!s.effectiveUnderline}
function bindFooter(){
  const layer=document.querySelector('[data-settings-layer]'),open=document.querySelector('[data-open-settings]');let lastFocus=null,releaseTrap=null;
  const closeSettings=()=>{if(!layer)return;layer.hidden=true;layer.querySelector('.reset-confirm-box')?.remove();releaseTrap?.();releaseTrap=null;lastFocus?.focus?.()};
  const openSettings=()=>{if(!layer)return;lastFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;syncSettings();layer.hidden=false;releaseTrap=trapFocus(layer,closeSettings);layer.querySelector('[data-setting-motion]')?.focus()};
  open?.addEventListener('click',openSettings);document.querySelector('[data-close-settings]')?.addEventListener('click',closeSettings);layer?.addEventListener('click',e=>{if(e.target===layer)closeSettings()});
  document.querySelector('[data-setting-motion]')?.addEventListener('change',e=>{patchSettings({reducedMotion:!!e.currentTarget.checked});syncSettings();playCue('soft')});
  document.querySelector('[data-setting-muted]')?.addEventListener('change',e=>{const muted=!!e.currentTarget.checked;patchSettings({muted});syncSettings();if(!muted)playCue('notice')});
  document.querySelector('[data-setting-effective]')?.addEventListener('change',e=>{patchSettings({effectiveUnderline:!!e.currentTarget.checked});syncSettings()});
  document.querySelector('[data-reset-save]')?.addEventListener('click',()=>{
    const card=layer?.querySelector('.settings-card');if(!card)return;
    const existing=card.querySelector('[data-reset-confirm]');if(existing){existing.focus();return}
    const box=document.createElement('div');box.className='notice-box warn reset-confirm-box';box.innerHTML='<strong>确认重置本机存档？</strong><p class="small">将清除剧情进度、访问记录、搜索历史、返校提交状态、结局与本作自动弹出记录。阅读设置会保留；已完成支持标记不属于游戏存档，不会被删除。</p><div class="actions"><button type="button" class="btn" data-reset-cancel>取消</button><button type="button" class="btn warn" data-reset-confirm>确认重置</button></div>';
    card.insertBefore(box,card.querySelector('.confirm-actions'));box.querySelector('[data-reset-cancel]')?.addEventListener('click',()=>box.remove());box.querySelector('[data-reset-confirm]')?.addEventListener('click',()=>{resetAll();location.href='sso.html?resetDone=1'});box.querySelector('[data-reset-confirm]')?.focus();
  });
  document.querySelector('[data-support-author]')?.addEventListener('click',()=>Paywall.show());document.querySelector('[data-print]')?.addEventListener('click',()=>window.print());
}
let lastAtmosphere=-1;
function updateClock(){
  const c=countdownInfo(),env=environmentSnapshot();
  document.querySelectorAll('[data-deadline]').forEach(el=>{el.textContent=c.text;el.classList.toggle('muted',c.expired)});
  const stamp=env.stamp;
  document.querySelectorAll('[data-campus-clock]').forEach(el=>el.textContent=stamp);
  document.querySelectorAll('[data-campus-weather]').forEach(el=>el.textContent=env.weather);
  document.querySelectorAll('[data-campus-online]').forEach(el=>el.textContent=String(env.online));
  document.querySelectorAll('[data-campus-service]').forEach(el=>el.textContent=env.service);
  document.body.dataset.atmosphere=String(env.stage);
  document.documentElement.style.setProperty('--atmosphere-level',String(env.stage));
  if(lastAtmosphere!==env.stage){
    lastAtmosphere=env.stage;
    if(!finalChoice()&&env.stage>=6&&env.stage<=8&&!hasFlag('navSlipSeen')&&!settings().reducedMotion){
      flag('navSlipSeen');
      const target=[...document.querySelectorAll('.nav a')].find(a=>a.getAttribute('href')==='my-return.html');
      if(target){const original=target.textContent;setTimeout(()=>{if(!target.isConnected)return;target.textContent='返回服务';target.classList.add('nav-slip');setTimeout(()=>{target.textContent=original;target.classList.remove('nav-slip')},520)},850)}
    }
    if(!finalChoice()&&env.stage>=4&&env.stage<=8&&!hasFlag('ambientEveningCueShown')){flag('ambientEveningCueShown');setTimeout(()=>playCue('soft',.11),950)}
    if(!finalChoice()&&env.stage>=7&&env.stage<=8&&!hasFlag('ambientLateCueShown')){flag('ambientLateCueShown');setTimeout(()=>playCue('radio',.08),1350)}
  }
}

function rememberCurrentPage(){const file=location.pathname.split('/').pop()||'index.html';const url=file+location.search;rememberPage(document.title||file,url)}
shell();syncSettings();bindFooter();applyAnomalyFrame();updateClock();setInterval(updateClock,30000);setTimeout(()=>maybeAutoSupport(),1250);setTimeout(rememberCurrentPage,260);
window.addEventListener('pageshow',()=>{applyAnomalyFrame();syncSettings();updateClock();setTimeout(rememberCurrentPage,120)});window.addEventListener('ql:state',()=>{applyAnomalyFrame();updateClock()});

export function pageRoot(){return document.getElementById('page-content')}
export function crumb(items=[]){return `<div class="breadcrumb"><a href="index.html">返校服务平台</a>${items.map((x,i)=>` <span aria-hidden="true">›</span> ${x.href&&i<items.length-1?`<a href="${x.href}">${x.label}</a>`:x.label}`).join('')}</div>`}
export function sideCommon(){const submitted=currentReturnSubmitted(),erased=!!finalChoice(),stage=plotStage(),env=environmentSnapshot(),recent=recentPages().filter(x=>x&&x.url&&!/review\.html/.test(x.url)).slice(0,3);const st=erased?'账户已转出':day2Started()?'人工处理中':submitted?'已提交':'待提交';const recentCard=stage>=1?`<div class="card recent-sidebar"><h3 class="section-title">最近查看</h3>${recent.map(x=>`<a href="${safeText(x.url)}">${safeText(String(x.title).replace(/｜栖岚实验高级中学.*$/,''))}</a>`).join('')||'<span class="small muted">暂无记录</span>'}<a class="recent-search-link" href="search.html">查看最近搜索与访问 ›</a></div>`:'';return `<aside class="sidebar"><div class="card"><h3 class="section-title">办理状态</h3><div class="small">2026 返校信息：<b>${st}</b></div><div class="small">返校窗口：<b data-deadline></b></div></div><div class="card current-campus-mini"><h3 class="section-title">当前校园</h3><div><span>天气</span><b>${env.weather}</b></div><div><span>校园广场在线</span><b>${env.online}</b></div><div><span>服务时段</span><b>${env.service}</b></div><p class="tiny muted">${env.note}</p></div>${recentCard}<div class="card quick-links"><h3 class="section-title">常用服务</h3><a href="my-return.html">核对我的返校信息</a><a href="square.html">校园广场</a><a href="history.html">公开校史与归档</a><a href="notices.html?year=2026">2026 返校通知</a></div><div class="card"><h3 class="section-title">系统提示</h3><p class="small soft-anomaly" data-anomaly-text data-l2="历史公开资料可能来自多个旧系统，检索结果以归档页为准。" data-l3="部分连续历史查询会进入访问质量复核，用于排查旧索引兼容问题。" data-l4="当前访问质量复核已进入学生事务服务流转，请留意会话事项。">${stage? '历史公开资料来自多个旧平台，显示范围可能因迁移状态不同而变化。':'返校信息提交后可继续查看住宿、交通、教材和校园公共信息。'}</p><p class="tiny muted">存储模式：${storageName()==='localStorage'?'本机断点续办':storageName()==='sessionStorage'?'会话临时保存':'当前页面会话'}</p></div></aside>`}
export function safeText(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
export function serviceMeta(items=[]){return `<div class="service-meta">${items.map(([k,v])=>`<span><b>${safeText(k)}</b>${safeText(v)}</span>`).join('')}</div>`}
export function logicalPath(url=''){try{const u=new URL(url,location.href),f=u.pathname.split('/').pop(),id=u.searchParams.get('id');const map={'index.html':'/return/2026/','my-return.html':'/my/return','notices.html':'/notice/archive','notice.html':id?`/notice/detail/${encodeURIComponent(id)}`:'/notice/detail','arrival.html':'/arrival/summary','rollcall.html':'/student/rollcall','dorm.html':'/dorm/service','square.html':'/square/search','square-post.html':id?`/square/topic/${encodeURIComponent(id)}`:'/square/topic','history.html':'/history/search','history-detail.html':id?`/history/detail/${encodeURIComponent(id)}`:'/history/detail','migration.html':'/account/history-help','review.html':'/student/review','center.html':'/partner/qinglan','search.html':'/search','broadcast.html':'/notice/audio','legacy-render.html':'/history/legacy-render'};return map[f]||`/${f||''}`}catch{return '/'}}
export function safeInternalHref(url=''){const x=String(url||'').trim();if(!x||/^(?:javascript|data|vbscript):/i.test(x)||/^https?:/i.test(x))return '#';return safeText(x)}
export function trapFocus(root,onEscape){if(!root)return()=>{};const handler=e=>{if(root.hidden)return;if(e.key==='Escape'){e.preventDefault();onEscape?.();return}if(e.key!=='Tab')return;const nodes=[...root.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(x=>!x.disabled&&!x.hidden&&x.getAttribute('aria-hidden')!=='true');if(!nodes.length)return;const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}};document.addEventListener('keydown',handler);return()=>document.removeEventListener('keydown',handler)}
export async function fetchJSON(path){const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw new Error(`无法读取 ${path}`);return r.json()}
export function refreshShared(){updateClock();applyAnomalyFrame();syncSettings()}
export function maybeAutoSupportPrompt(){return maybeAutoSupport()}
export function showLoadError(err){pageRoot().innerHTML=`<div class="panel"><h2 class="section-title">页面暂时无法读取</h2><p>当前静态文件需要通过 HTTP 方式打开。请使用压缩包内的 <code>start-local.bat</code>，或部署到 GitHub Pages / 任意静态站点。</p><p class="small muted">${safeText(err?.message||'未知错误')}</p></div>`}
const params=new URLSearchParams(location.search);if(params.get('reset')==='1'){resetAll();location.replace(location.pathname)}if(params.get('from')==='sso')flag('ssoVisited');
