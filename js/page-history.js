import {pageRoot,crumb,sideCommon,fetchJSON,showLoadError,refreshShared,safeText,serviceMeta,maybeAutoSupportPrompt} from './app.js';
import {historyList} from './render.js';
import {flag,visit,finalChoice} from './state.js';
(async()=>{try{
 const data=await fetchJSON('data/history.json');flag('viewedHistory');visit('history_archive');const p=new URLSearchParams(location.search),q=(p.get('q')||'').trim(),year=p.get('year')||'all',type=p.get('type')||'all';
 const visible=data.filter(x=>x.id!=='hist_0724_2026_cache'||!!finalChoice());
 let items=visible.filter(x=>(year==='all'||x.date.startsWith(year))&&(type==='all'||x.type===type)).sort((a,b)=>b.date.localeCompare(a.date));if(q)items=items.filter(x=>(x.title+x.summary+x.type+x.date+x.department).includes(q));const types=[...new Set(visible.map(x=>x.type))];
 pageRoot().innerHTML=`${crumb([{label:'校史检索'}])}<div class="page-grid"><section class="panel"><h2 class="section-title">公开校史与公示检索</h2>${serviceMeta([['索引范围','2017–2026 公开资料'],['最后同步',finalChoice()?'2027-08-29 08:03':'08-29 19:40'],['访问级别','校园公开']])}<form method="get" class="archive-toolbar"><label>关键词<input class="form-control" name="q" value="${safeText(q)}" placeholder="返校、学籍、年份等"></label><label>年份<select class="form-control" name="year"><option value="all">全部</option>${['2026','2024','2022','2021','2020','2019','2018','2017'].map(y=>`<option value="${y}" ${year===y?'selected':''}>${y}</option>`).join('')}</select></label><label>资料类型<select class="form-control" name="type"><option value="all">全部</option>${types.map(t=>`<option value="${safeText(t)}" ${type===t?'selected':''}>${safeText(t)}</option>`).join('')}</select></label><button class="btn" type="submit">检索</button></form><div class="small muted" style="margin-bottom:8px">共 ${items.length} 条公开归档</div>${historyList(items)}</section>${sideCommon()}</div>`;
 refreshShared();maybeAutoSupportPrompt();
}catch(e){showLoadError(e)}})();
