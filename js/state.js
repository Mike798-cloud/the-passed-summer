const VERSION = 8;
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
  set('version',VERSION);set('settings',{muted:false,reducedMotion:false,effectiveUnderline:false});set('simStartedAt',Date.now());set('readFlags',{});set('visitCount',{});set('searchHistory',[]);set('returnDraft',defaultDraft);set('currentReturnSubmitted',false);set('finalChoice',null);
}
export function initState(){
  if(get('version')!==VERSION){
    const preservedSettings={muted:false,reducedMotion:false,effectiveUnderline:false,...get('settings',{})};
    if(backend.name!=='memory'){
      try{for(let i=backend.obj.length-1;i>=0;i--){const k=backend.obj.key(i);if(k&&k.startsWith(PREFIX))backend.obj.removeItem(k)}}catch{}
    }else memory.clear();
    seed();set('settings',preservedSettings);
  }
  if(!get('simStartedAt'))set('simStartedAt',Date.now());
}

export function flag(name,value=true){const f=get('readFlags',{});f[name]=value;set('readFlags',f);return f}
export function hasFlag(name){return !!get('readFlags',{})[name]}
export function flags(){return get('readFlags',{})}
export function visit(name){const v=get('visitCount',{});v[name]=(v[name]||0)+1;set('visitCount',v);return v[name]}
export function visitCount(name){return get('visitCount',{})[name]||0}
export function visits(){return get('visitCount',{})}

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
  // 入口从“系统异常名单”改成对林晚本人产生好奇：玩家先认识一个人，再发现她查过旧数据。
  if(currentReturnSubmitted()&&(f.viewedCatPost||f.viewedLinInvestigation||f.viewedSquareHook||f.searched2022))s=1;
  // 第一轮硬证据仍要求玩家自己找到物理到校/晚点名中的 47，并看到 23:18 的公开自述。
  if(s>=1&&(f.viewedArrival47||f.viewedRollcall47)&&f.viewedLateReply)s=2;
  if(s>=2&&f.viewedInvestigator2017&&f.viewedInvestigator2019&&(f.viewedStatus2017||f.viewedStatus2019))s=3;
  if(s>=3&&f.viewedAttentionCache&&f.viewedSamplingProtocol)s=4;
  if(s>=4&&f.viewedDeletedCache2019&&f.viewedCenterPublic)s=5;
  if(s>=5&&f.viewedCenterServiceChain&&f.viewedCenterIncident2019&&f.viewedLinTransfer2022)s=6;
  if(s>=6&&f.openedReview&&reviewReady())s=7;
  return s;
}

// 氛围级别比剧情门控更细：它只决定时间、天气、在线人数与视觉/听觉状态，不决定谜题答案。
export function atmosphereStage(){
  if(finalChoice())return 9;
  if(!currentReturnSubmitted())return 0;
  const f=flags(),ps=plotStage();
  // 氛围只能跟随已经成立的调查阶段，避免玩家通过手输 URL 或随意翻旧年份让天色/在线人数提前跳变。
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
    ['2026-08-31T08:15:00+08:00','多云转晴','118','返校服务正常','新一日校园服务已恢复']
  ];
  const [iso,weather,online,service,note]=rows[Math.min(a,rows.length-1)];
  return {stage:a,now:new Date(iso),weather,online:Number(online),service,note};
}
export function anomalyLevel(){return Math.min(4,Math.max(plotStage(),Math.floor(atmosphereStage()/2)))}
export function reviewReady(){
  const f=flags();
  return currentReturnSubmitted() && !!(f.viewedArrival47||f.viewedRollcall47) && !!f.viewedLateReply && !!f.viewedInvestigator2017 && !!f.viewedInvestigator2019 && !!(f.viewedStatus2017||f.viewedStatus2019) && !!f.viewedAttentionCache && !!f.viewedSamplingProtocol && !!f.viewedDeletedCache2019 && !!f.viewedCenterPublic && !!f.viewedCenterServiceChain && !!f.viewedCenterIncident2019 && !!f.viewedLinTransfer2022;
}
export function hiddenEpilogueReady(){return !!finalChoice()}

const endTs = Date.parse('2026-09-01T00:00:00+08:00');
export function simulatedNow(){return environmentSnapshot().now}
export function countdownInfo(){const now=simulatedNow().getTime(),diff=endTs-now;if(diff<=0)return {expired:true,text:'信息冻结待核验'};const total=Math.floor(diff/60000),d=Math.floor(total/1440),h=Math.floor((total%1440)/60),m=total%60;return {expired:false,text:`剩余 ${d}天 ${h}小时 ${String(m).padStart(2,'0')}分`}}

export function resetAll(){const s=settings();if(backend.name!=='memory'){try{const keys=[];for(let i=0;i<backend.obj.length;i++){const k=backend.obj.key(i);if(k&&k.startsWith(PREFIX))keys.push(k)}keys.forEach(k=>backend.obj.removeItem(k))}catch{}}else memory.clear();seed();set('settings',s)}
