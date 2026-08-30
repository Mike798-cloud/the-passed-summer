import {pageRoot,crumb,fetchJSON,showLoadError,safeText,refreshShared,trapFocus,maybeAutoSupportPrompt} from './app.js';
import {flag,visit,hasFlag,finalChoice} from './state.js';
import {revealGlitch} from './anomaly.js';

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
 if(id==='post_2027_two_versions')flag('viewed2027Thread');
 const authorMeta=p.realname?`${p.realname} / ${p.class}`:'公开校园账户',postYear=p.date.slice(0,4),image=p.image?`assets/img/${p.image}`:null,effectiveBody=new Set(p.effectiveBody||[]),effectiveReplies=new Set(p.effectiveReplies||[]);
 const related={
   post_2026_old_return_list:`<div class="related-panel"><h3>公开检索</h3><p class="source-note">旧平台标题可能仍被站内索引命中，结果以实际可打开的归档页为准。</p><div class="related-links"><a href="search.html?q=${encodeURIComponent('返校异常名单')}">搜索“返校异常名单”</a><a href="migration.html">查看旧平台迁移说明</a></div></div>`,
   post_2022_return_data:`<div class="related-panel"><h3>同日可公开核对的资料</h3><div class="related-links"><a href="square-post.html?id=post_2022_mom_rain">同作者：雷雨与出门时间</a><a href="arrival.html?year=2022&class=3-4">高三（4）班到校核验</a><a href="rollcall.html?year=2022&class=3-4">21:10 晚点名</a><a href="history-detail.html?id=hist_2022_index">旧返校回执索引</a><a href="square-post.html?id=post_0830_hw">当晚校园广场主题</a></div></div>`,
   post_2019_gate_archive:`<div class="related-panel"><h3>公开资料</h3><div class="related-links"><a href="history-detail.html?id=hist_status_2019">2019 学籍状态调整摘要</a><a href="square-post.html?id=post_2019_normal">同作者：物理周测</a><a href="square-post.html?id=post_2019_clock">同作者：走廊时钟</a><a href="search.html?q=${encodeURIComponent('2017 旧值班表')}">检索 2017 旧值班表</a></div></div>`,
   post_2017_versions:`<div class="related-panel"><h3>公开资料</h3><div class="related-links"><a href="history-detail.html?id=hist_status_2017">2017 学籍异动公开摘要</a><a href="square-post.html?id=post_2017_normal">同作者：体育馆</a><a href="square-post.html?id=post_2017_schedule">同作者：选修课教室</a><a href="search.html?q=${encodeURIComponent('补充核验')}">站内检索“补充核验”</a></div></div>`,
   post_2017_normal:`<div class="related-panel"><h3>同作者公开主题</h3><div class="related-links"><a href="square-post.html?id=post_2017_schedule">明天机器人社到底在实验楼还是科技楼</a><a href="square-post.html?id=post_2017_versions">旧值班表为什么有两个版本</a></div></div>`,
   post_2017_schedule:`<div class="related-panel"><h3>同作者公开主题</h3><div class="related-links"><a href="square-post.html?id=post_2017_normal">今晚体育馆还能借半场吗</a><a href="square-post.html?id=post_2017_versions">旧值班表为什么有两个版本</a></div></div>`,
   post_2019_normal:`<div class="related-panel"><h3>同作者公开主题</h3><div class="related-links"><a href="square-post.html?id=post_2019_clock">教学楼走廊那只钟是不是慢了四十多秒</a><a href="square-post.html?id=post_2019_gate_archive">门禁归档时间是不是错了</a></div></div>`,
   post_2019_clock:`<div class="related-panel"><h3>同作者公开主题</h3><div class="related-links"><a href="square-post.html?id=post_2019_normal">物理周测最后一题是不是印错了</a><a href="square-post.html?id=post_2019_gate_archive">门禁归档时间是不是错了</a></div></div>`,
   post_0830_hw:`<div class="related-panel"><h3>同日公开资料</h3><div class="related-links"><a href="square-post.html?id=post_2022_mom_rain">林晚：雷雨与出门时间</a><a href="history-detail.html?id=hist_2022_index">2022 返校回执索引</a><a href="history-detail.html?id=hist_status_2022">2022 学籍状态调整摘要</a><a href="search.html?q=${encodeURIComponent('林晚 返校')}">检索公开资料</a></div></div>`,
   post_2022_mom_rain:`<div class="related-panel"><h3>同作者公开内容</h3><div class="related-links"><a href="square-post.html?id=post_0829_a">我的暑假正在一点一点没有.jpg</a><a href="square-post.html?id=post_2022_return_data">旧返校记录怎么还有“未完成”状态</a><a href="square-post.html?id=post_0830_hw">数学卷第 18 题有人会吗</a></div></div>`,
   post_2027_two_versions:`<div class="related-panel"><h3>预同步检索</h3><div class="related-links"><a href="search.html?q=${encodeURIComponent('2026 学籍异常')}">检索 2026 公开索引</a><a href="history-detail.html?id=hist_0724_2026_cache">查看未归并字符集缓存</a></div></div>`
 }[id]||'';
 const deleted=p.glitch?`<div class="reply deleted-reply"><div class="reply-meta">归档回复 · 时间字段缺失</div><div id="glitch-deleted">该回复已删除</div></div>`:'';
 pageRoot().innerHTML=`${crumb([{label:'校园广场',href:`square.html?year=${postYear}`},{label:p.title}])}<article class="post"><div class="post-head"><span>${safeText(p.category)} · ${safeText(p.date)}</span><span>公开归档主题</span></div><div class="post-body"><aside class="post-author"><div class="avatar"><img src="assets/img/avatar-generic.svg" alt="默认头像"></div><div><b class="${p.effectiveAuthor?'effective-info':''}">${safeText(p.author)}</b><div class="tiny muted ${p.effectiveAuthor?'effective-info':''}">${safeText(authorMeta)}</div></div></aside><div class="post-content"><h2 class="${p.effectiveTitle?'effective-info':''}" style="font-size:1.12rem;margin-top:0">${safeText(p.title)}</h2>${p.body.map((x,i)=>`<p class="${effectiveBody.has(i)?'effective-info':''}">${safeText(x)}</p>`).join('')}${image?`<img id="post-image" class="post-image" src="${image}" alt="${id==='post_0829_a'?'一张开学前吐槽暑假消失的猫图':''}" tabindex="0" role="button" aria-label="打开图片预览">`:''}</div></div>${p.replyList.map((r,i)=>`<div class="reply"><div class="reply-meta ${effectiveReplies.has(i)?'effective-info':''}">${safeText(r[0])} · ${safeText(r[2])}</div><div class="${effectiveReplies.has(i)?'effective-info':''}">${safeText(r[1])}</div></div>`).join('')}${deleted}</article>${related}<div class="actions"><a class="btn" href="square.html?year=${postYear}&month=${p.date.slice(5,7)}">返回广场</a></div>${image?`<div class="modal" id="img-modal" hidden role="dialog" aria-modal="true" aria-label="图片预览"><div class="modal-card"><button class="modal-close" id="modal-close" aria-label="关闭图片预览">×</button><img src="${image}" alt="图片预览"></div></div>`:''}`;
 if(p.glitch&&!hasFlag(`glitch_${id}`)){flag(`glitch_${id}`);revealGlitch(document.getElementById('glitch-deleted'),p.glitch,{hold:id==='post_2026_old_return_list'?780:id==='post_2027_two_versions'?1050:1000})}
 if(image){const modal=document.getElementById('img-modal'),img=document.getElementById('post-image'),close=document.getElementById('modal-close');img.addEventListener('click',()=>{modal.hidden=false;close.focus()});img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();modal.hidden=false;close.focus()}});const doClose=()=>{modal.hidden=true;img.focus?.()};close.addEventListener('click',doClose);modal.addEventListener('click',e=>{if(e.target===modal)doClose()});trapFocus(modal,doClose)}
 refreshShared();maybeAutoSupportPrompt();
}catch(e){showLoadError(e)}})();
