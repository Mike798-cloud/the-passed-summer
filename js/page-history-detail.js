import {pageRoot,crumb,sideCommon,fetchJSON,showLoadError,refreshShared,serviceMeta,maybeAutoSupportPrompt,safeText} from './app.js';
import {article} from './render.js';
import {flag,visit,plotStage,hasFlag,attentionSnapshot,reviewReady,finalChoice} from './state.js';
import {showSanEvent} from './anomaly.js';
(async()=>{try{
 const data=await fetchJSON('data/history.json'),id=new URLSearchParams(location.search).get('id')||'hist_2022_return',stage=plotStage();
 if(id==='hist_attention_cache'&&stage<3)throw new Error('归档不存在');
 if(id==='hist_sampling_protocol'&&!hasFlag('viewedAttentionCache'))throw new Error('归档不存在');
 if(id==='hist_deleted_reply_cache_2019'&&!(stage>=3&&hasFlag('viewedInvestigator2019')))throw new Error('归档不存在');
 if(id==='hist_center_cooperation'&&stage<3)throw new Error('归档不存在');
 if(id==='hist_center_service_chain'&&!(stage>=4&&hasFlag('viewedCenterPublic')))throw new Error('归档不存在');
 if((id==='hist_center_incident_2019'||id==='hist_lin_transfer_2022')&&!(stage>=4&&hasFlag('viewedCenterPublic')&&hasFlag('viewedCenterServiceChain')))throw new Error('归档不存在');
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
 if(id==='hist_0724_2026_cache')flag('viewed0724Epilogue');
 let extra='';
 if(id==='hist_attention_cache'){
   const a=attentionSnapshot();extra=`<section class="attention-audit effective-info"><h3>当前会话抽样摘要</h3><div class="audit-grid"><div><span>历史归档访问</span><b>${a.history}</b></div><div><span>公开旧帖访问</span><b>${a.forum}</b></div><div><span>站内检索词</span><b>${a.searches}</b></div><div><span>人员交叉查询</span><b>${a.people}</b></div></div><div class="attention-index"><span>访问质量指数</span><b>${a.score}</b></div><p class="small muted">统计范围：当前浏览器会话。页面访问与检索计数用于旧索引兼容性质量复核。</p><div class="actions"><a class="btn" href="search.html?q=${encodeURIComponent('历史检索兼容性抽样')}">检索附件说明</a></div></section>`;
 }
 if(id==='hist_sampling_protocol'){
   extra=`<div class="notice-box small effective-info"><strong>缓存缺页：</strong>当前公开缓存未包含“抽样对象选择依据”“复核终止条件”和责任人签字页。</div><div class="actions"><a class="btn" href="search.html?q=${encodeURIComponent('周岑 删除回复 字符集')}">检索旧论坛兼容记录</a></div>`;
 }
 if(id==='hist_deleted_reply_cache_2019'){
   extra=`<div class="notice-box small effective-info">该缓存只证明旧论坛曾保留过这段文本，无法确认它是在删除前公开可见，还是仅存在于清理失败的回退索引中。</div><div class="actions"><a class="btn primary" href="search.html?q=${encodeURIComponent('青岚')}">按残留机构名继续检索</a><a class="btn" href="history-detail.html?id=hist_center_cooperation">查看校外合作单位公示</a><a class="btn" href="square-post.html?id=post_2019_gate_archive">返回原主题</a></div>`;
 }
 if((id==='hist_center_incident_2019'||id==='hist_lin_transfer_2022')&&reviewReady()){
   extra+=`<div class="notice-box"><strong>学生事务：</strong>当前会话存在 1 项补充核验事项。<a href="review.html">查看事项</a></div>`;
 }
 const related={
  hist_2022_return:`<div class="related-panel restrained"><h3>继续检索</h3><p class="source-note">新闻稿本身不提供现场核验明细。可使用年份、班级和日期继续检索公开业务资料。</p><div class="related-links"><a href="search.html">打开站内搜索</a></div></div>`,
  hist_2022_index:`<div class="related-panel restrained"><h3>公开归档</h3><p class="source-note">索引只显示脱敏回执摘要。其他公开资料需要按年份、班级或时间自行检索。</p><div class="related-links"><a href="search.html">打开站内搜索</a>${hasFlag('viewedLateReply')?'<a href="legacy-render.html?scene=status">旧版打印视图（兼容）</a>':''}</div></div>`,
  hist_status_2017:`<div class="related-panel restrained"><h3>同年度公开资料</h3><div class="related-links"><a href="search.html?q=${encodeURIComponent('2017 陈嘉树')}">检索 2017 公开资料</a></div></div>`,
  hist_status_2019:`<div class="related-panel restrained"><h3>同年度公开资料</h3><div class="related-links"><a href="search.html?q=${encodeURIComponent('2019 周岑')}">检索 2019 公开资料</a></div></div>`,
  hist_status_2022:`<div class="related-panel restrained"><h3>同年度公开资料</h3><div class="related-links"><a href="search.html?q=${encodeURIComponent('2022 林晚')}">检索 2022 公开资料</a></div></div>`,
  hist_center_cooperation:`<div class="related-panel restrained"><h3>合作服务</h3><div class="related-links"><a href="center.html">青岚青少年成长实践中心公开页</a></div></div>`,
  hist_center_service_chain:`<div class="related-panel restrained"><h3>继续检索</h3><div class="related-links"><a href="search.html?q=${encodeURIComponent('青岚 2019')}">检索历史合作记录</a><a href="search.html?q=${encodeURIComponent('青岚 接驳')}">检索车辆调度</a></div></div>`,
  hist_center_incident_2019:`<div class="related-panel restrained"><h3>旧接口</h3><p class="source-note">该缓存没有后续结案页。旧学籍回写接口已经停止服务。</p><div class="related-links"><a href="legacy-render.html?scene=archive">尝试打开旧学籍回写接口</a></div></div>`,
  hist_lin_transfer_2022:`<div class="related-panel restrained"><h3>继续检索</h3><div class="related-links"><a href="search.html?q=${encodeURIComponent('林晚 2022')}">检索同一学生的公开时间线</a></div></div>`,
  hist_0724_2026_cache:`<div class="related-panel restrained"><h3>下一学年预同步</h3><div class="related-links"><a href="square-post.html?id=post_2027_two_versions">查看新学年公开主题</a></div></div>`
 }[id]||'';
 const legacyHead=['hist_2022_index','hist_deleted_reply_cache_2019','hist_center_incident_2019','hist_0724_2026_cache'].includes(id)?`<div class="old-archive-header"><span>旧系统公开缓存 / 兼容索引</span><span>资料时间：${safeText(h.date)}</span></div>`:'';
 pageRoot().innerHTML=`${crumb([{label:'校史检索',href:'history.html'},{label:h.title}])}<div class="page-grid">${legacyHead}<article class="panel ${h.type==='旧索引摘要'?'legacy-box':''}"><h2 class="section-title ${h.effectiveTitle?'effective-info':''}">${safeText(h.title)}</h2>${serviceMeta([['资料类型',h.type],['归档日期',h.date],['资料状态','公开只读']])}<div class="list-meta"><span>${safeText(h.date)}</span><span>${safeText(h.department)}</span><span class="badge gray">${safeText(h.type)}</span></div><div class="divider"></div><p class="lead ${h.effectiveTitle?'effective-info':''}">${safeText(h.summary)}</p>${article(h.body)}${extra}${related}<div class="divider"></div><div class="tiny muted">公开归档编号：QL-HIST-${h.id.toUpperCase()} · 仅用于校内公开资料检索</div></article>${sideCommon()}</div>`;
 if(!finalChoice()&&['hist_status_2017','hist_status_2019','hist_status_2022'].includes(id)&&plotStage()>=3){showSanEvent({flagName:'sanStatusArchiveShown',title:'学籍公开摘要 · 图片字段恢复',image:'assets/img/dorm-building.webp',caption:'旧学籍附件 · 关联图片来源字段已失效',words:['停止公开更新','个人原因休学','校际转出','家庭原因暂缓返校','停止公开更新','已归档','停止公开更新','状态同步','已归档'],hold:1950,delay:850})}
 refreshShared();maybeAutoSupportPrompt();
}catch(e){showLoadError(e)}})();
