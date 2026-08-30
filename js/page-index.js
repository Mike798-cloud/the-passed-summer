import {pageRoot,crumb,fetchJSON,showLoadError,refreshShared,serviceMeta,maybeAutoSupportPrompt} from './app.js';
import {noticeList} from './render.js';
import {hasFlag,currentReturnSubmitted,finalChoice,reviewReady,plotStage,environmentSnapshot} from './state.js';

if(!hasFlag('ssoVisited')){location.replace('sso.html');}else (async()=>{try{
  const [services,notices]=await Promise.all([fetchJSON('data/services.json'),fetchJSON('data/notices.json')]);
  const submitted=currentReturnSubmitted(),erased=!!finalChoice(),stage=plotStage(),env=environmentSnapshot();
  const currentStatus=erased?'无在籍账户':submitted?'已提交':'待确认';
  const evening=env.stage>=4,late=env.stage>=6;
  const heroInitial=late?'assets/img/rain-campus.webp':evening?'assets/img/campus-gate.webp':'assets/img/campus-hero.webp';
  const heroAlt=late?'夜间降雨中的校园教学区':evening?'傍晚的校园西门返校通道':'返校前的校园教学区';
  const heroTitle=late?'夜间返校服务仍按预约事项运行':evening?'返校前校园服务进入晚间时段':'2026 秋季学期返校信息确认';
  const heroCopy=late?'当前为雨天值班时段，常规现场服务陆续结束；已创建事项请按页面时间办理。':evening?'雷阵雨期间部分室外服务调整，请留意校车与返校通道最新状态。':'开放时间：8 月 29 日 08:00 - 8 月 31 日 24:00 · 请核对住宿、交通及预计到校时间。';
  const squareItems=submitted?[
    ['square-post.html?id=post_2026_rain','31 号真的还有雷阵雨吗','天气 · 16:22'],
    ['square-post.html?id=post_2026_books','高二教材什么时候能领','教材 · 17:08'],
    ['square-post.html?id=post_2026_busstop','西区候车点今年是不是挪了','返校交通 · 17:31']
  ]:[
    ['square-post.html?id=post_2026_rain','31 号真的还有雷阵雨吗','天气 · 16:22'],
    ['square-post.html?id=post_2026_books','高二教材什么时候能领','教材 · 17:08'],
    ['square-post.html?id=post_2026_canteen','返校第一顿吃什么投票','吃饭 · 15:48']
  ];
  const catFeature=submitted?`<a class="portal-featured-topic" href="square-post.html?id=post_0829_a"><img src="assets/img/cat-1.jpg" alt="校园广场旧帖中的猫图"><span><small>校园广场 · 公开归档推荐</small><b>我的暑假正在一点一点没有.jpg</b><em>晚点回 · 2022-08-29 21:44</em></span></a>`:'';
  pageRoot().innerHTML=`${crumb([{label:'返校总览'}])}<div class="home-layout"><div><section class="hero" data-home-carousel><img data-hero-img src="${heroInitial}" alt="${heroAlt}"><div class="overlay"><h2 data-hero-title>${heroTitle}</h2><p data-hero-copy>${heroCopy}</p></div><div class="hero-dots" aria-label="校园服务图片"><button class="active" type="button" data-hero-index="0" aria-label="校园教学区" aria-pressed="true"></button><button type="button" data-hero-index="1" aria-label="西门返校通道" aria-pressed="false"></button><button type="button" data-hero-index="2" aria-label="图书馆开放准备" aria-pressed="false"></button></div></section>${serviceMeta([['数据同步','08-30 17:40'],['办理学期','2026 秋季'],['服务状态',env.service]])}${reviewReady()&&!erased?'<div class="notice-box"><strong>学生事务提醒：</strong>当前会话有 1 项补充核验事项待查看。<a href="review.html">查看事项</a></div>':''}<section class="service-strip" aria-label="常用返校服务">${services.slice(0,8).map(s=>`<a href="${s.url}"><img src="assets/img/${s.icon}" alt=""><b>${s.title}</b><div class="tiny muted">${s.desc}</div></a>`).join('')}</section><div class="news-grid"><section class="panel"><h2 class="section-title">返校通知 <a class="tiny" href="notices.html">更多 ›</a></h2>${noticeList(notices.slice(0,5))}</section><section class="panel"><h2 class="section-title">校园广场近期 <a class="tiny" href="square.html">更多 ›</a></h2>${catFeature}<ul class="portal-topic-list">${squareItems.map(([u,t,m])=>`<li><a href="${u}">${t}</a><span>${m}</span></li>`).join('')}</ul><p class="tiny muted">校园广场包含当前公开话题与旧平台公开归档。推荐内容可能来自历史索引。</p></section></div></div><aside class="home-side"><div class="card"><h3 class="section-title">我的办理</h3><div class="kpi-grid" style="grid-template-columns:1fr 1fr"><div class="kpi"><b>${currentStatus}</b><span>2026 返校信息</span></div><div class="kpi"><b>${submitted?'已保存':'草稿'}</b><span>本机办理记录</span></div></div><div class="actions">${erased?'<a class="btn" href="review.html">查看会话状态</a>':`<a class="btn primary" href="my-return.html">${submitted?'查看“我的返校”':'进入“我的返校”'}</a>`}</div></div><div class="card campus-live"><h3 class="section-title">当前校园</h3><div class="campus-live-grid"><div><span>天气</span><b>${env.weather}</b></div><div><span>校园广场在线</span><b>${env.online}</b></div><div><span>服务时段</span><b>${env.service}</b></div></div><p class="tiny muted">${env.note}</p></div><div class="card"><h3 class="section-title">全校服务概览</h3><div class="small">返校信息确认率</div><div class="home-metric">83.4%</div><div class="small muted">统计口径：2026 学期服务信息确认，不含现场到校核验。</div></div><div class="card campus-photo"><h3 class="section-title">今日校园</h3><img src="${late?'assets/img/rain-campus.webp':'assets/img/campus-gate.webp'}" alt="${late?'夜间降雨中的校园':'返校前的校园西门'}"><div class="tiny muted" style="margin-top:7px">8 月 30 日 · ${late?'雨天夜间值班':'西门返校通道'}</div></div><div class="card"><h3 class="section-title">返校服务位置</h3><div class="site-location-list"><div><b>校车下车点</b><span>东侧停车区 · 按班次现场核验</span></div><div><b>西门</b><span>家长接送通道 · 12:30 后开放</span></div><div><b>南门</b><span>自行到校通道 · 按现场指引开放</span></div></div><div class="tiny muted" style="margin-top:8px">具体开放状态以返校当日现场安排为准。</div></div></aside></div>`;
  const hero=document.querySelector('[data-home-carousel]');if(hero){const slides=late?[
    ['assets/img/rain-campus.webp','夜间降雨中的校园教学区','夜间返校服务仍按预约事项运行','当前为雨天值班时段，常规现场服务陆续结束。'],
    ['assets/img/school-bus.webp','返校接驳车辆资料图','夜间预约接驳仍在运行','常规接驳结束后，仅保留已创建的学生事务预约班次。'],
    ['assets/img/campus-gate.webp','校园西门返校通道','雨天返校通道','夜间到校请按现场值班指引进入校园。']
  ]:[
    ['assets/img/campus-hero.webp','返校前的校园教学区','2026 秋季学期返校信息确认','开放时间：8 月 29 日 08:00 - 8 月 31 日 24:00 · 请核对住宿、交通及预计到校时间。'],
    ['assets/img/campus-gate.webp','校园西门返校通道','西门返校通道准备完成','8 月 31 日现场到校核验开放前，请先在本平台完成服务信息确认。'],
    ['assets/img/library.webp','返校前的图书馆阅览区','公共区域返校前开放准备','图书馆、食堂与宿舍公共区域按返校安排逐步恢复开放。']
  ];const img=hero.querySelector('[data-hero-img]'),title=hero.querySelector('[data-hero-title]'),copy=hero.querySelector('[data-hero-copy]');hero.querySelectorAll('[data-hero-index]').forEach(btn=>btn.addEventListener('click',()=>{const i=Number(btn.dataset.heroIndex)||0,x=slides[i];img.src=x[0];img.alt=x[1];title.textContent=x[2];copy.textContent=x[3];hero.querySelectorAll('[data-hero-index]').forEach(b=>{const on=b===btn;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))})}))}
  refreshShared();maybeAutoSupportPrompt();
}catch(e){showLoadError(e)}})();
