const VERSION = 5;
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
export function get(k,fallback=null){
  try{const raw=backend.obj.getItem(key(k));if(raw===null)return fallback;return JSON.parse(raw)}catch{return fallback}
}
export function set(k,v){try{backend.obj.setItem(key(k),JSON.stringify(v));return true}catch{return false}}
export function remove(k){try{backend.obj.removeItem(key(k))}catch{}}
export function storageName(){return backend.name}

export function initState(){
  if(get('version')!==VERSION){
    const preservedSettings=get('settings',{muted:false,reducedMotion:false});
    if(backend.name!=='memory'){
      try{for(let i=backend.obj.length-1;i>=0;i--){const k=backend.obj.key(i);if(k&&k.startsWith(PREFIX))backend.obj.removeItem(k)}}catch{}
    } else memory.clear();
    set('version',VERSION);set('settings',preservedSettings);
    set('simStartedAt',Date.now());set('readFlags',{});set('visitCount',{});set('searchHistory',[]);set('anomalyLevel',0);set('returnDraft',{stay:'day',arrive:'8 月 31 日 14:00–16:00',traffic:'parent'});
  }
  if(!get('simStartedAt'))set('simStartedAt',Date.now());
}

export function flag(name,value=true){const f=get('readFlags',{});f[name]=value;set('readFlags',f);deriveAnomalyLevel();return f}
export function hasFlag(name){return !!get('readFlags',{})[name]}
export function flags(){return get('readFlags',{})}
export function visit(name){const v=get('visitCount',{});v[name]=(v[name]||0)+1;set('visitCount',v);deriveAnomalyLevel();return v[name]}
export function visitCount(name){return get('visitCount',{})[name]||0}
export function pushSearch(term){const t=(term||'').trim();if(!t)return;let h=get('searchHistory',[]);h=[t,...h.filter(x=>x!==t)].slice(0,8);set('searchHistory',h);if(/2022/.test(t))flag('searched2022');if(/高三\s*[（(]?4|高三（4）班/.test(t))flag('searchedClass4');if(/林晚/.test(t))flag('searchedLinWan');if(/晚点回/.test(t))flag('searchedLateReturn')}
export function settings(){return get('settings',{muted:false,reducedMotion:false})}
export function patchSettings(p){const s={...settings(),...p};set('settings',s);return s}
export function finalChoice(){return get('finalChoice',null)}
export function returnDraft(){return get('returnDraft',{stay:'day',arrive:'8 月 31 日 14:00–16:00',traffic:'parent'})}
export function patchReturnDraft(p){const d={...returnDraft(),...p};set('returnDraft',d);return d}
export function setFinalChoice(v){set('finalChoice',v);flag('finalSubmitted');return v}

export function deriveAnomalyLevel(){
  const f=flags();const cat=visitCount('square_post_0829_a');let lvl=0;
  // L0 stays fully administrative through the first 20 minutes: seeing the old receipt,
  // migration explanation and the two 47-person data sources must not corrupt the UI yet.
  if(f.viewedOldIndex||(f.viewedCatPost&&(f.searchedClass4||f.viewedOfficial48)))lvl=1;
  // L2 begins only after the 22:03/23:18 contradiction is known and the ordinary cat post is revisited.
  if(cat>=2&&f.viewedSourceDetail&&f.viewedLateReply)lvl=Math.max(lvl,2);
  // L3 follows the deliberate current-session search for Lin Wan, matching the Act 4 identity turn.
  if(cat>=2&&f.searchedLinWan&&f.viewedLateReply)lvl=Math.max(lvl,3);
  // L4 is reserved for the final business transaction, after the player has reached the identity anomaly.
  if(f.openedMigrationDecision&&f.viewedSourceDetail&&f.viewedLateReply&&(f.searchedLinWan||f.j1Shown))lvl=Math.max(lvl,4);
  set('anomalyLevel',lvl);return lvl;
}
export function anomalyLevel(){return deriveAnomalyLevel()}

export function hiddenEpilogueReady(){return hasFlag('catThirdBeforeFinal') && hasFlag('viewedOldIndex') && !!finalChoice()}

const baseTs = Date.parse('2026-08-29T22:18:00+08:00');
const endTs = Date.parse('2026-09-01T00:00:00+08:00');
export function simulatedNow(){
  const elapsed=Math.max(0,Date.now()-get('simStartedAt',Date.now()));
  return new Date(Math.min(baseTs+elapsed,endTs+60*60*1000));
}
export function countdownInfo(){
  const now=simulatedNow().getTime();const diff=endTs-now;
  if(diff<=0)return {expired:true,text:'信息冻结待核验'};
  const total=Math.floor(diff/60000);const d=Math.floor(total/1440);const h=Math.floor((total%1440)/60);const m=total%60;
  return {expired:false,text:`剩余 ${d}天 ${h}小时 ${String(m).padStart(2,'0')}分`};
}

export function resetAll(){
  const s=settings();
  if(backend.name!=='memory'){
    try{const keys=[];for(let i=0;i<backend.obj.length;i++){const k=backend.obj.key(i);if(k&&k.startsWith(PREFIX))keys.push(k)}keys.forEach(k=>backend.obj.removeItem(k))}catch{}
  }else memory.clear();
  set('version',VERSION);set('settings',s);set('simStartedAt',Date.now());set('readFlags',{});set('visitCount',{});set('searchHistory',[]);set('anomalyLevel',0);set('returnDraft',{stay:'day',arrive:'8 月 31 日 14:00–16:00',traffic:'parent'});
}
