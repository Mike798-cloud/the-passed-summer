import {pageRoot,crumb,fetchJSON,showLoadError,safeText,refreshShared,trapFocus,maybeAutoSupportPrompt} from './app.js';
import {flag,visit,hasFlag,finalChoice,environmentSnapshot,plotStage} from './state.js';
import {revealGlitch,showSanEvent} from './anomaly.js';

(async()=>{try{
 const data=await fetchJSON('data/posts.json'),id=new URLSearchParams(location.search).get('id')||'post_2026_old_return_list';
 if(id==='post_2027_two_versions'&&!finalChoice())throw new Error('帖子不存在');
 const p=data.find(x=>x.id===id);if(!p)throw new Error('帖子不存在');
 visit('square_post');visit(`square_post_${id}`);document.title=`${p.title}｜栖岚校园广场`;
 if(id==='post_2026_old_return_list'){flag('viewedSquareHook');visit('square_post_hook')}
 if(id==='post_2017_versions')flag('viewedInvestigator2017');
 if(id==='post_2019_gate_archive'){flag('viewedInvestigator2019');visit('square_post_2019')}
 if(id==='post_2022_return_data')flag('viewedLinInvestigation');
 if(id==='post_0830_hw')flag('viewedLateReply');
 if(id==='post_0829_a')flag('viewedCatPost');
 if(id==='post_2022_saltwater_wait')flag('viewedSaltwaterWait');
 if(id==='post_2027_two_versions')flag('viewed2027Thread');
 const env=environmentSnapshot(),authorMeta=p.realname?`${p.realname} / ${p.class}`:'公开校园账户',postYear=p.date.slice(0,4),catVariant=id==='post_0829_a'?'cat-1.jpg':null,image=p.image?`assets/img/${catVariant||p.image}`:null,effectiveBody=new Set(p.effectiveBody||[]),effectiveReplies=new Set(p.effectiveReplies||[]);
 const authorSearch=`square.html?year=${encodeURIComponent(postYear)}&month=${encodeURIComponent(p.date.slice(5,7))}&q=${encodeURIComponent(p.author)}`;
 const related={
   post_0829_a:`<div class="related-panel restrained"><h3>公开账户</h3><p class="source-note">该账户还有其他公开主题。旧平台不提供私人消息与关注关系。</p><div class="related-links"><a href="${authorSearch}">查看“晚点回”的公开主题与回复</a></div></div>`,
   post_2026_old_return_list:`<div class="related-panel restrained"><h3>旧平台说明</h3><p class="source-note">旧索引偶尔会命中已迁移标题；信息中心建议重新检索或查看迁移说明。</p><div class="related-links"><a href="migration.html">查看旧平台迁移说明</a></div></div>`,
   post_2022_return_data:`<div class="related-panel restrained"><h3>公开账户</h3><p class="source-note">这条主题没有附带核验材料。旧平台只保留作者公开发表过的主题与回复。</p><div class="related-links"><a href="${authorSearch}">查看“晚点回”的公开主题与回复</a><a href="search.html">打开站内搜索</a></div></div>`,
   post_0830_hw:`<div class="related-panel restrained"><h3>同日公开内容</h3><p class="source-note">这是一条普通作业帖。旧平台不替用户判断帖子与校务资料之间是否有关。</p><div class="related-links"><a href="square.html?year=2022&month=08&q=${encodeURIComponent('晚点回')}">查看“晚点回”的公开主题</a><a href="search.html">打开站内搜索</a></div></div>`,
   post_2019_gate_archive:`<div class="related-panel restrained"><h3>公开账户</h3><p class="source-note">同一公开账户此前也发过几条与时间有关的普通主题。</p><div class="related-links"><a href="${authorSearch}">查看周岑的其他公开主题</a><a href="search.html">打开站内搜索</a></div></div>`,
   post_2017_versions:`<div class="related-panel restrained"><h3>公开账户</h3><p class="source-note">同一账户的其他公开主题仍在2017归档中。</p><div class="related-links"><a href="${authorSearch}">查看陈嘉树的其他公开主题</a><a href="search.html">打开站内搜索</a></div></div>`,
   post_2017_normal:`<div class="related-panel restrained"><h3>同作者公开主题</h3><div class="related-links"><a href="${authorSearch}">查看陈嘉树的公开主题列表</a></div></div>`,
   post_2017_schedule:`<div class="related-panel restrained"><h3>同作者公开主题</h3><div class="related-links"><a href="${authorSearch}">查看陈嘉树的公开主题列表</a></div></div>`,
   post_2019_normal:`<div class="related-panel restrained"><h3>同作者公开主题</h3><div class="related-links"><a href="${authorSearch}">查看周岑的公开主题列表</a></div></div>`,
   post_2019_clock:`<div class="related-panel restrained"><h3>同作者公开主题</h3><div class="related-links"><a href="${authorSearch}">查看周岑的公开主题列表</a></div></div>`,
   post_2022_mom_rain:`<div class="related-panel restrained"><h3>同作者公开主题</h3><div class="related-links"><a href="${authorSearch}">查看“晚点回”的公开主题列表</a></div></div>`,
   post_2027_two_versions:`<div class="related-panel restrained"><h3>预同步检索</h3><div class="related-links"><a href="search.html?q=${encodeURIComponent('2026 学籍异常')}">检索 2026 公开索引</a></div></div>`
 }[id]||(p.realname?`<div class="related-panel restrained"><h3>同一公开账户</h3><p class="source-note">该账户在当年校园广场还保留其他公开主题。</p><div class="related-links"><a href="${authorSearch}">查看 ${safeText(p.author)} 的其他公开主题</a></div></div>`:'');
 const deleted=p.glitch?`<div class="reply deleted-reply"><div class="reply-meta">归档回复 · 时间字段缺失</div><div id="glitch-deleted">该回复已删除</div></div>`:'';
 const replySummary=p.replies>p.replyList.length?`<div class="forum-reply-summary">共 ${p.replies} 条回复 · 当前页显示 ${p.replyList.length} 条公开回复</div>`:'';
 const ambientMeta=postYear==='2026'?`<span>当前校园 ${safeText(env.weather)} · 在线 ${env.online}</span>`:'<span>历史公开归档</span>';
 pageRoot().innerHTML=`${crumb([{label:'校园广场',href:`square.html?year=${postYear}`},{label:p.title}])}<article class="post"><div class="post-head"><span>${safeText(p.category)} · ${safeText(p.date)}</span>${ambientMeta}</div><div class="post-body"><aside class="post-author"><div class="avatar"><img src="assets/img/avatar-generic.svg" alt="默认头像"></div><div><b class="${p.effectiveAuthor?'effective-info':''}">${safeText(p.author)}</b><div class="tiny muted ${p.effectiveAuthor?'effective-info':''}">${safeText(authorMeta)}</div></div></aside><div class="post-content"><h2 class="${p.effectiveTitle?'effective-info':''}" style="font-size:1.12rem;margin-top:0">${safeText(p.title)}</h2>${p.body.map((x,i)=>`<p class="${effectiveBody.has(i)?'effective-info':''}">${safeText(x)}</p>`).join('')}${image?`<img id="post-image" class="post-image" src="${image}" alt="${id==='post_0829_a'?'一张开学前吐槽暑假消失的猫图':''}" tabindex="0" role="button" aria-label="打开图片预览">`:''}</div></div>${p.replyList.map((r,i)=>`<div class="reply"><div class="reply-meta ${effectiveReplies.has(i)?'effective-info':''}">${safeText(r[0])} · ${safeText(r[2])}</div><div class="${effectiveReplies.has(i)?'effective-info':''}">${safeText(r[1])}</div></div>`).join('')}${replySummary}${deleted}</article>${related}<div class="actions"><a class="btn" href="square.html?year=${postYear}&month=${p.date.slice(5,7)}">返回广场</a></div>${image?`<div class="modal" id="img-modal" hidden role="dialog" aria-modal="true" aria-label="图片预览"><div class="modal-card"><button class="modal-close" id="modal-close" aria-label="关闭图片预览">×</button><img src="${image}" alt="图片预览"></div></div>`:''}`;
 if(p.glitch&&!hasFlag(`glitch_${id}`)){flag(`glitch_${id}`);revealGlitch(document.getElementById('glitch-deleted'),p.glitch,{hold:id==='post_2026_old_return_list'?700:id==='post_2027_two_versions'?1050:920})}
 if(image){const modal=document.getElementById('img-modal'),img=document.getElementById('post-image'),close=document.getElementById('modal-close');img.addEventListener('click',()=>{modal.hidden=false;close.focus()});img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();modal.hidden=false;close.focus()}});const doClose=()=>{modal.hidden=true;img.focus?.()};close.addEventListener('click',doClose);modal.addEventListener('click',e=>{if(e.target===modal)doClose()});trapFocus(modal,doClose)}
 if(!finalChoice()&&id==='post_0830_hw'){showSanEvent({flagName:'sanLateReplyShown',title:'旧论坛 · 状态字段恢复',image:'assets/img/cat-1.jpg',caption:'公开帖子缓存 · 图片版本无法确认',words:['已到校','已到校','已确认','未到校','已到校','状态已确认','已到校','未到校','已确认','已到校','已到校'],hold:2150,delay:1150})}
 if(!finalChoice()&&id==='post_2019_gate_archive'&&plotStage()>=3){showSanEvent({flagName:'sanOldStudentImageShown',title:'2019 公开账户 · 头像缓存',image:'assets/img/library.webp',caption:'旧系统图片字段 · 来源路径已失效',words:['补充核验','综合服务楼','已受理','待处理','补充核验','已归档','综合服务楼','待处理'],hold:1850,delay:900})}
 refreshShared();maybeAutoSupportPrompt();
}catch(e){showLoadError(e)}})();
