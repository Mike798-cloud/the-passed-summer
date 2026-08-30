import {pageRoot,crumb,sideCommon,fetchJSON,showLoadError,refreshShared,serviceMeta,maybeAutoSupportPrompt,safeText} from './app.js';
import {article} from './render.js';
import {flag,visit,plotStage,hasFlag,reviewReady,finalChoice} from './state.js';
import {showSanEvent} from './anomaly.js';
(async()=>{try{
 const data=await fetchJSON('data/history.json'),id=new URLSearchParams(location.search).get('id')||'hist_2022_return';
 if(id==='hist_0724_2026_cache'&&!finalChoice())throw new Error('归档不存在');
 const h=data.find(x=>x.id===id);if(!h)throw new Error('归档不存在');document.title=`${h.title}｜栖岚实验高级中学`;visit('history_detail');
 if(id==='hist_2022_return')flag('viewedOfficial48');
 if(id==='hist_2022_index'){flag('viewedOldIndex');document.body.classList.add('legacy-page')}
 if(id==='hist_status_2022')flag('viewedStatus2022');
 if(id==='hist_status_2017')flag('viewedStatus2017');
 if(id==='hist_status_2019')flag('viewedStatus2019');
 if(id==='hist_2026_migration')flag('viewedMigrationNotice');
 if(id==='hist_attention_cache')flag('viewedAttentionCache');
 if(id==='hist_sampling_protocol')flag('viewedSamplingProtocol');
 if(id==='hist_deleted_reply_cache_2019')flag('viewedDeletedCache2019');
 if(id==='hist_center_cooperation')flag('viewedCenterCooperation');
 if(id==='hist_center_service_chain')flag('viewedCenterServiceChain');
 if(id==='hist_center_incident_2019')flag('viewedCenterIncident2019');
 if(id==='hist_lin_transfer_2022')flag('viewedLinTransfer2022');
 if(id==='hist_lin_draft_2022')flag('viewedLinDraft');
 if(id==='hist_0724_2026_cache')flag('viewed0724Epilogue');
 let extra='';
 if(id==='hist_attention_cache'){
   extra=`<section class="attention-audit effective-info"><h3>附件说明</h3><p>这是一份用于旧索引迁移测试的字段残页。原附件没有保留抽样对象、终止条件与签字页，无法据此判断任何学生的状态。</p><p class="small muted">如需继续核对，请返回校史检索，使用页面中出现过的年份、姓名或业务名称自行查找公开资料。</p><div class="actions"><a class="btn" href="history.html">返回校史检索</a><a class="btn" href="search.html">打开站内搜索</a></div></section>`;
 }
 if(id==='hist_sampling_protocol'){
   extra=`<div class="notice-box small effective-info"><strong>缓存缺页：</strong>当前公开缓存未包含“抽样对象选择依据”“复核终止条件”和责任人签字页。</div><div class="actions"><a class="btn" href="history.html">返回校史检索</a></div>`;
 }
 if(id==='hist_deleted_reply_cache_2019'){
   extra=`<div class="notice-box small effective-info">该缓存只证明旧论坛曾保留过这段文本，无法确认它是在删除前公开可见，还是仅存在于清理失败的回退索引中。</div><div class="actions"><a class="btn" href="search.html">打开站内搜索</a><a class="btn" href="square-post.html?id=post_2019_gate_archive">返回原主题</a></div>`;
 }
 if((id==='hist_center_incident_2019'||id==='hist_lin_transfer_2022')&&reviewReady()){
   extra+=`<div class="notice-box"><strong>学生事务：</strong>当前会话存在 1 项补充核验事项。<a href="review.html">查看事项</a></div>`;
 }
 const related={
  hist_2022_return:`<div class="related-panel restrained"><h3>继续检索</h3><p class="source-note">新闻稿本身不提供现场核验明细。可使用年份、班级和日期继续检索公开业务资料。</p><div class="related-links"><a href="search.html">打开站内搜索</a></div></div>`,
  hist_2022_index:`<div class="related-panel restrained"><h3>公开归档</h3><p class="source-note">索引只显示脱敏回执摘要。其他公开资料需要按年份、班级或时间自行检索。</p><div class="related-links"><a href="search.html">打开站内搜索</a>${hasFlag('viewedLateReply')?'<a href="legacy-render.html?scene=status">旧版打印视图（兼容）</a>':''}</div></div>`,
  hist_status_2017:`<div class="related-panel restrained"><h3>同年度公开资料</h3><div class="related-links"><a href="search.html">打开站内搜索</a></div></div>`,
  hist_status_2019:`<div class="related-panel restrained"><h3>同年度公开资料</h3><div class="related-links"><a href="search.html">打开站内搜索</a></div></div>`,
  hist_status_2022:`<div class="related-panel restrained"><h3>同年度公开资料</h3><div class="related-links"><a href="search.html">打开站内搜索</a></div></div>`,
  hist_center_cooperation:`<div class="related-panel restrained"><h3>合作服务</h3><div class="related-links"><a href="center.html">青岚青少年成长实践中心公开页</a></div></div>`,
  hist_center_service_chain:`<div class="related-panel restrained"><h3>公开资料</h3><p class="source-note">合作摘要不附学生名单。可使用年份、机构或业务名称继续检索。</p><div class="related-links"><a href="search.html">打开站内搜索</a></div></div>`,
  hist_center_incident_2019:`<div class="related-panel restrained"><h3>旧接口</h3><p class="source-note">该缓存没有后续结案页。旧学籍回写接口已经停止服务。</p><div class="related-links"><a href="legacy-render.html?scene=archive">尝试打开旧学籍回写接口</a></div></div>`,
  hist_lin_transfer_2022:`<div class="related-panel restrained"><h3>公开资料</h3><p class="source-note">调度摘要没有说明她是否到过校门，也没有保留签收人与离场记录。</p><div class="related-links"><a href="search.html">打开站内搜索</a></div></div>`,
  hist_lin_draft_2022:`<div class="related-panel restrained"><h3>缓存说明</h3><p class="source-note">这段文字没有发布，也没有送达任何公开账户。附件仅保留在旧论坛迁移缓存中。</p><div class="related-links"><a href="square.html?year=2022&month=08&q=${encodeURIComponent('晚点回')}">查看作者公开主题</a></div></div>`,
  hist_0724_2026_cache:`<div class="related-panel restrained"><h3>下一学年预同步</h3><div class="related-links"><a href="square-post.html?id=post_2027_two_versions">查看新学年公开主题</a></div></div>`
 }[id]||'';
 const legacyHead=['hist_2022_index','hist_deleted_reply_cache_2019','hist_center_incident_2019','hist_0724_2026_cache'].includes(id)?`<div class="old-archive-header"><span>旧系统公开缓存 / 兼容索引</span><span>资料时间：${safeText(h.date)}</span></div>`:'';
 pageRoot().innerHTML=`${crumb([{label:'校史检索',href:'history.html'},{label:h.title}])}<div class="page-grid">${legacyHead}<article class="panel ${h.type==='旧索引摘要'?'legacy-box':''}"><h2 class="section-title ${h.effectiveTitle?'effective-info':''}">${safeText(h.title)}</h2>${serviceMeta([['资料类型',h.type],['归档日期',h.date],['资料状态','公开只读']])}<div class="list-meta"><span>${safeText(h.date)}</span><span>${safeText(h.department)}</span><span class="badge gray">${safeText(h.type)}</span></div><div class="divider"></div><p class="lead ${h.effectiveTitle?'effective-info':''}">${safeText(h.summary)}</p>${article(h.body)}${extra}${related}<div class="divider"></div><div class="tiny muted">公开归档编号：QL-HIST-${h.id.toUpperCase()} · 仅用于校内公开资料检索</div></article>${sideCommon()}</div>`;
 if(!finalChoice()&&['hist_status_2017','hist_status_2019','hist_status_2022'].includes(id)&&plotStage()>=3){showSanEvent({flagName:'sanStatusArchiveShown',title:'学籍公开摘要 · 图片字段恢复',image:'assets/img/dorm-building.webp',caption:'旧学籍附件 · 关联图片来源字段已失效',words:['停止公开更新','个人原因休学','校际转出','家庭原因暂缓返校','停止公开更新','已归档','停止公开更新','状态同步','已归档'],hold:1950,delay:850})}
 refreshShared();maybeAutoSupportPrompt();
}catch(e){showLoadError(e)}})();
