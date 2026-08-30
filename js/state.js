const VERSION = 10;
const PREFIX = 'ql-return-v4:';
const memory = new Map();

function testStore(store){
  try{const k='__ql_probe__';store.setItem(k,'1');store.removeItem(k);return true}catch{return false}
}
const backend = (()=>{
  if(typeof localStorage!=='undefined' && testStore(localStorage)) return {name:'localStorage',obj:localStorage};
  if(typeof sessionStorage!=='undefined' && testStore(sessionStorage)) return {name:'sessionStorage',obj:sessionStorage};
  return {name:'memory',obj:{getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)}};
})();
function key(k){return PREFIX+k}
export function get(k,fallback=null){try{const raw=backend.obj.getItem(key(k));return raw===null?fallback:JSON.parse(raw)}catch{return fallback}}
export function set(k,v){try{backend.obj.setItem(key(k),JSON.stringify(v));window.dispatchEvent?.(new Event('ql:state'));return true}catch{return false}}
export function remove(k){try{backend.obj.removeItem(key(k))}catch{}}
export function storageName(){return backend.name}

const defaultDraft={stay:'day',arrive:'8 月 31 日 14:00–16:00',traffic:'parent'};
function seed(){
  set('version',VERSION);
  set('settings',{muted:false,reducedMotion:false,effectiveUnderline:false});
  set('readFlags',{});set('visitCount',{});set('searchHistory',[]);set('recentPages',[]);
  set('returnDraft',defaultDraft);set('currentReturnSubmitted',false);set('finalChoice',null);
}
export function initState(){
  if(get('version')!==VERSION){
    const preservedSettings={muted:false,reducedMotion:false,effectiveUnderline:false,...get('settings',{})};
    if(backend.name!=='memory'){
      try{for(let i=backend.obj.length-1;i>=0;i--){const k=backend.obj.key(i);if(k&&k.startsWith(PREFIX))backend.obj.removeItem(k)}}catch{}
    }else memory.clear();
    seed();set('settings',preservedSettings);
  }
}

export function flag(name,value=true){const f=get('readFlags',{});f[name]=value;set('readFlags',f);return f}
export function hasFlag(name){return !!get('readFlags',{})[name]}
export function flags(){return get('readFlags',{})}
export function visit(name){const v=get('visitCount',{});v[name]=(v[name]||0)+1;set('visitCount',v);return v[name]}
export function visitCount(name){return get('visitCount',{})[name]||0}
export function visits(){return get('visitCount',{})}

export function rememberPage(title,url){
  const t=String(title||'').replace(/\s+/g,' ').trim();
  const u=String(url||'').trim();
  if(!t||!u||/sso\.html(?:$|\?)/.test(u)||/404\.html/.test(u))return;
  let rows=get('recentPages',[]);
  rows=[{title:t,url:u},...rows.filter(x=>x&&x.url!==u)].slice(0,10);
  set('recentPages',rows);
}
export function recentPages(){return get('recentPages',[])}

export function pushSearch(term){
  const t=(term||'').trim();if(!t)return;
  let h=get('searchHistory',[]);h=[t,...h.filter(x=>x!==t)].slice(0,14);set('searchHistory',h);flag('usedSearch');
  if(/2022/.test(t))flag('searched2022');
  if(/林晚|晚点回/.test(t))flag('searchedLinWan');
  if(/2017|陈嘉树|陈嘉/.test(t))flag('searched2017');
  if(/2019|周岑/.test(t))flag('searched2019');
  if(/访问质量|关注指数|抽样|兼容/.test(t))flag('searchedAuditTerms');
  if(/综合服务楼|补充核验|线下核验/.test(t))flag('searchedReview');
  if(/青岚|成长实践中心|学生发展中心|接驳/.test(t))flag('searchedCenter');
  if(/事故|无生命体征|中心接收|转介/.test(t))flag('searchedCenterIncident');
  if(/人工接单|监护联系|服务流转/.test(t))flag('searchedHandoff');
}
export function settings(){return {muted:false,reducedMotion:false,effectiveUnderline:false,...get('settings',{})}}
export function patchSettings(p){const s={...settings(),...p};set('settings',s);return s}
export function finalChoice(){return get('finalChoice',null)}
export function setFinalChoice(v){const valid=['stop','public','archive'];if(!valid.includes(v))return null;set('finalChoice',v);flag('finalSubmitted');flag('accountErased');return v}
export function returnDraft(){return get('returnDraft',defaultDraft)}
export function patchReturnDraft(p){const d={...returnDraft(),...p};set('returnDraft',d);return d}
export function currentReturnSubmitted(){return !!get('currentReturnSubmitted',false)}
export function markReturnSubmitted(){set('currentReturnSubmitted',true);flag('returnFormSubmitted');return true}

export function attentionSnapshot(){
  const f=flags(),v=visits();
  const history=(v.history_detail||0)+(v.arrival_2022||0)+(v.rollcall_2022||0);
  const forum=(v.square_post||0)+(v.square_archive||0);
  const searches=(get('searchHistory',[])||[]).length;
  const people=(f.viewedInvestigator2017?1:0)+(f.viewedInvestigator2019?1:0)+(f.viewedLateReply?1:0);
  const repeat=Math.max(0,(v.square_post_hook||0)-1)+Math.max(0,(v.square_post_2019||0)-1);
  const external=(v.center_public||0)+(f.viewedCenterIncident2019?1:0)+(f.viewedLinTransfer2022?1:0);
  const score=Math.min(99,8+history*5+forum*3+searches*4+people*9+repeat*4+external*5+(f.viewedArrival47?6:0)+(f.viewedRollcall47?6:0)+(f.viewedSamplingProtocol?10:0));
  return {history,forum,searches,people,repeat,external,score};
}

export function plotStage(){
  const f=flags();
  if(finalChoice())return 8;
  let s=0;
  const entered=currentReturnSubmitted()&&(f.viewedCatPost||f.viewedLinInvestigation||f.viewedSquareHook||f.searched2022||f.searchedLinWan);
  if(entered)s=1;
  // 2022 核心矛盾：本人 23:18 仍称未返校，并至少命中一份独立返校/点名来源。
  const countEvidence=!!(f.viewedArrival47||f.viewedRollcall47||f.viewedOfficial48||f.viewedOldIndex);
  if(s>=1&&f.viewedLateReply&&countEvidence)s=2;
  // 前人轨迹不再要求 2017、2019 两条线全部看完；任一条形成“公开状态与最后调查不一致”即可继续。
  const prior2017=!!(f.viewedInvestigator2017&&(f.viewedStatus2017||f.searched2017));
  const prior2019=!!(f.viewedInvestigator2019&&(f.viewedStatus2019||f.searched2019));
  if(s>=2&&(prior2017||prior2019|| (f.viewedInvestigator2017&&f.viewedInvestigator2019)))s=3;
  // 青岚从前人轨迹自然浮出，访问质量抽样改为可选支线，不再卡主线。
  if(s>=3&&(f.viewedCenterPublic||f.viewedCenterCooperation||f.searchedCenter||f.viewedDeletedCache2019))s=4;
  if(s>=4&&f.viewedCenterServiceChain&&(f.viewedCenterIncident2019||f.viewedLinTransfer2022))s=5;
  if(s>=5&&f.viewedCenterIncident2019&&f.viewedLinTransfer2022)s=6;
  if(s>=6&&f.openedReview&&reviewReady())s=7;
  return s;
}

export function reviewReady(){
  const f=flags();
  const core2022=!!f.viewedLateReply&&!!(f.viewedArrival47||f.viewedRollcall47||f.viewedOfficial48||f.viewedOldIndex);
  const prior=!!((f.viewedInvestigator2019&&(f.viewedStatus2019||f.viewedDeletedCache2019))||(f.viewedInvestigator2017&&f.viewedStatus2017)||f.viewedDeletedCache2019);
  return currentReturnSubmitted() && core2022 && prior && !!f.viewedCenterPublic && !!f.viewedCenterServiceChain && !!f.viewedCenterIncident2019 && !!f.viewedLinTransfer2022;
}

// 18:40 与 8 月 31 日 24:00 都是剧情时间锚点，不读取玩家设备真实时间。
// 玩家关闭浏览器后，剧情时间停在当前状态；再次进入只恢复状态，不会因为现实中过了几天而错过流程。
export function day2Started(){return hasFlag('day2Started')}
export function advanceToDay2(){
  if(!reviewReady())return false;
  flag('reviewWindowMissed');flag('day2Started');flag('day2TransitionSeen');
  return true;
}
export function markDay2HomeSeen(){if(day2Started())flag('day2HomeSeen')}
export function markDay2MyReturnSeen(){if(day2Started())flag('day2MyReturnSeen')}
export function markDay2ReviewSeen(){if(day2Started())flag('day2ReviewSeen')}

// 氛围/剧情时钟：重要的是玩家“能感知的阶段”，不是现实倒计时。
export function atmosphereStage(){
  if(finalChoice())return 14; // 9 月 1 日：一切恢复正常
  if(day2Started()){
    if(hasFlag('day2ReviewSeen'))return 13; // 截止前最后一轮人工处理
    if(hasFlag('day2MyReturnSeen'))return 11; // 学籍预处理已进入本人页面
    if(hasFlag('day2HomeSeen'))return 10; // 8/31 上午，返校窗口仍开放
    return 9;
  }
  if(!currentReturnSubmitted())return 0;
  const f=flags(),ps=plotStage();
  if(ps>=7)return 8;
  if(ps>=6)return 7;
  if(ps>=5)return 6;
  if(ps>=4)return 5;
  if(ps>=3)return 4;
  if(ps>=2)return 3;
  if(ps>=1&&(f.viewedArrival47||f.viewedOfficial48||f.viewedLinInvestigation))return 2;
  if(ps>=1)return 1;
  return 0;
}

export function environmentSnapshot(){
  const a=atmosphereStage();
  const rows=[
    ['2026-08-30T17:42:00+08:00','阴','326','返校服务正常','校园公共服务开放'],
    ['2026-08-30T17:53:00+08:00','阴','291','返校服务正常','校园公共服务开放'],
    ['2026-08-30T18:06:00+08:00','小雨','214','晚间服务开始','部分室外服务转入雨天安排'],
    ['2026-08-30T18:18:00+08:00','小雨','146','晚间服务','图书馆与教学区仍开放'],
    ['2026-08-30T18:27:00+08:00','雷阵雨','73','晚间服务','部分窗口停止现场受理'],
    ['2026-08-30T18:33:00+08:00','雷阵雨','31','夜间值班','常规服务陆续结束'],
    ['2026-08-30T18:36:00+08:00','雷阵雨','14','夜间值班','仅保留预约与应急事项'],
    ['2026-08-30T18:39:00+08:00','持续降雨','3','夜间值班','常规接驳已结束'],
    ['2026-08-30T18:40:00+08:00','持续降雨','2','预约事项','仅处理已创建事项'],
    ['2026-08-31T08:15:00+08:00','多云','248','返校服务正常','今日 24:00 关闭本批返校信息确认'],
    ['2026-08-31T10:26:00+08:00','多云转阴','214','人工事项处理中','未按时完成的预约事项转入人工复核'],
    ['2026-08-31T15:40:00+08:00','阴','168','人工事项处理中','异常账户不随普通返校窗口自动关闭'],
    ['2026-08-31T23:12:00+08:00','小雨','42','返校窗口即将关闭','普通返校信息将在今日 24:00 定版'],
    ['2026-08-31T23:48:00+08:00','小雨','18','仅处理异常事项','普通返校窗口即将结束，当前事项仍在人工流转'],
    ['2026-09-01T08:12:00+08:00','晴','412','开学日服务正常','2026 秋季返校工作已结束']
  ];
  const [iso,weather,online,service,note]=rows[Math.min(a,rows.length-1)];
  const m=iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  const stamp=m?`${m[2]}-${m[3]} ${m[4]}:${m[5]}`:'08-30 17:42';
  return {stage:a,now:new Date(iso),stamp,weather,online:Number(online),service,note};
}

export function anomalyLevel(){
  if(finalChoice())return 0;
  return Math.min(4,Math.max(plotStage(),Math.floor(Math.min(atmosphereStage(),8)/2)));
}
export function hiddenEpilogueReady(){return !!finalChoice()}
export function simulatedNow(){return environmentSnapshot().now}
export function deadlineInfo(){
  const env=environmentSnapshot();
  if(finalChoice())return {expired:true,text:'本批返校工作已结束'};
  if(day2Started())return {expired:false,text:env.stage>=13?'今日 24:00 截止 · 异常事项仍在人工处理':'今日 24:00 截止'};
  return {expired:false,text:'8 月 31 日 24:00 截止'};
}
// 保留旧导出名，避免页面脚本依赖；不再显示现实倒计时。
export function countdownInfo(){return deadlineInfo()}

export function resetAll(){
  const s=settings();
  if(backend.name!=='memory'){
    try{const keys=[];for(let i=0;i<backend.obj.length;i++){const k=backend.obj.key(i);if(k&&k.startsWith(PREFIX))keys.push(k)}keys.forEach(k=>backend.obj.removeItem(k))}catch{}
  }else memory.clear();
  seed();set('settings',s)
}
