import {fetchJSON,safeText,logicalPath,safeInternalHref} from './app.js';
import {pushSearch,plotStage,get,flag,hasFlag,finalChoice} from './state.js';
let index=[];
export async function loadIndex(){if(index.length)return index;index=await fetchJSON('data/search-index.json');return index}
function norm(s){return String(s||'').toLowerCase().replace(/[（）()\s]/g,'')}
function allowed(item){
  const stage=plotStage();if((item.minStage||0)>stage)return false;
  if(Array.isArray(item.requires)&&item.requires.some(x=>!hasFlag(x)))return false;
  return true;
}
export function runSearch(term){
  const q=norm(term);if(!q)return [];
  const tokens=String(term).toLowerCase().split(/[、,，\/\s]+/).map(norm).filter(Boolean);
  return index.filter(allowed).map(item=>{
    const title=norm(item.title),keys=norm(item.keywords),hay=norm([item.title,item.summary,item.keywords,item.section].join(' '));let score=0;
    tokens.forEach(t=>{if(title.includes(t))score+=9;if(keys.includes(t))score+=5;if(hay.includes(t))score+=3});
    return {...item,score:score>0?score+(item.weight||0):0};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title,'zh-CN'));
}
export function suggestions(term){
  const q=(term||'').trim(),n=norm(q),stage=plotStage();let base=[];
  if(!q)base=['2026 秋季返校安排','校车班次与候车点','住宿服务','校园广场'];
  else if(/返校异常|旧系统|旧索引/.test(q))base=['2022 旧返校记录','旧返校系统历史数据迁移说明','2019 门禁归档'];
  else if(/2022/.test(q))base=['2022 高三提前返校安排','2022 到校核验','2022 晚点名','2022 公开校史'];
  else if(/林晚|晚点回|^林$/.test(q))base=stage>=5?['林晚 2022 校园广场','林晚 雷雨 出门时间','2022 学籍状态调整','林* 学生事务接驳','2022 旧返校记录']:['晚点回 返校记录','林晚 2022 校园广场','林晚 雷雨 出门时间','2022 学籍状态调整'];
  else if(/2019|周岑|门禁/.test(q))base=stage>=4?['2019 门禁归档时间','周岑 走廊时钟','周岑 删除回复 字符集','2019 学籍状态调整','2017 旧值班表']:['2019 门禁归档时间','周岑 走廊时钟','2019 学籍状态调整','2017 旧值班表'];
  else if(/2017|陈嘉树|值班表/.test(q))base=['2017 旧值班表','陈嘉树 机器人社','2017 学籍异动公开摘要'];
  else if(/补充核验|复核|访问质量|关注/.test(q) && stage>=3)base=stage>=6?['访问质量复核','学生事务补充核验','学生发展支持服务年度合作摘要']:['访问质量复核','学生服务访问质量抽样摘要'];
  else if(/抽样|兼容|失效标题|删除占位/.test(q) && hasFlag('viewedAttentionCache'))base=['历史检索兼容性抽样说明','失效标题 删除占位'];
  else if(/青岚|成长实践|学生发展中心/.test(q) && stage>=4)base=stage>=5?['青岚青少年成长实践中心','学生发展支持合作服务说明','青岚 接驳','青岚 夜间支持事项']:['青岚青少年成长实践中心','学生发展支持合作服务说明'];
  else if(/接驳|校车03|校车 03/.test(q) && stage>=5)base=['8 月 31 日学生事务接驳车辆调度摘要','青岚青少年成长实践中心'];
  else if(/事故|无生命体征|夜间观察/.test(q) && stage>=5)base=['夜间支持事项处置记录 2019','2019 学籍状态调整'];
  else if(/辰序|服务采购|合作摘要|人工复核/.test(q) && stage>=5)base=['学生发展支持服务年度合作摘要','学生发展支持合作服务说明'];
  else if(finalChoice()&&/0724|2026学籍|学籍异常|未归并/.test(q))base=['旧校园广场字符集缓存 未归并','为什么 2026 有个学生的学籍记录有两个版本'];
  else base=index.filter(allowed).filter(x=>norm(x.title).includes(n)||norm(x.keywords).includes(n)).slice(0,5).map(x=>x.title);

  // Faults are rare and tied to cached historical strings; they never mark an answer as correct.
  if(stage>=2&&!hasFlag('glitchLostWordSeen')&&/林晚|晚点回|^林$/.test(q)){
    flag('glitchLostWordSeen');base.unshift('林晚 失踪');
  }
  if(stage>=3&&!hasFlag('glitchReviewWarningSeen')&&/综合|补充核验|复核/.test(q)){
    flag('glitchReviewWarningSeen');base.unshift('不要去综合服务楼');
  }
  if(stage>=5&&!hasFlag('glitchCenterWarningSeen')&&/青岚|接驳/.test(q)){
    flag('glitchCenterWarningSeen');base.unshift('他们会送你去——');
  }
  return [...new Set(base)].slice(0,6);
}
export function remember(term){pushSearch(term)}
export function resultHTML(items){return items.length?items.map(r=>`<article class="result"><h3><a class="${r.effective?'effective-info':''}" href="${safeInternalHref(r.url)}">${safeText(r.title)}</a></h3><div class="path">${safeText(r.section)} · ${safeText(logicalPath(r.url))}</div><p class="${r.effective?'effective-info':''}">${safeText(r.summary)}</p></article>`).join(''):`<div class="notice-box">未找到完全匹配的站内内容。可缩短关键词，或改用年份、班级、服务名称再次检索。</div>`}
export function recentSearches(){return get('searchHistory',[])}
export function epilogueHTML(){
  const choice=finalChoice();if(!choice)return '';
  const line=choice==='archive'?'发现 1 条未处理历史附件。':choice==='public'?'公开主题缓存缩略图：1。':'未发现可恢复的公开主题。';
  return `<section class="epilogue"><div class="tiny muted">下一学年 · 站内索引预同步</div><h3>2027 秋季返校资料</h3><p>${safeText(line)}</p><p class="small">预同步同时报告：<b>旧论坛字符集缓存 1 条未归并</b>。</p><div class="actions"><a class="btn" href="search.html?q=${encodeURIComponent('2026 学籍异常')}">检索 2026 公开索引</a><a class="btn" href="square-post.html?id=post_2027_two_versions">查看新学年公开主题</a></div><p class="small muted">索引生成时间：2027-08-29 08:03 · 当前页面仅保留预同步摘要。</p></section>`;
}
