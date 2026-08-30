import {initState,hasFlag,flag,settings,plotStage} from './state.js';
import {playCue} from './audio.js';
initState();
if(settings().reducedMotion)document.documentElement.classList.add('reduced-motion');
const root=document.getElementById('legacy-render-root');
const scene=new URLSearchParams(location.search).get('scene')||'arrival';
const reduce=settings().reducedMotion;
const scenes={
  arrival:{
    title:'2022 返校状态缓存 / 旧版兼容读取',
    gate:()=>plotStage()>=1,
    flag:'legacyArrivalDistortionSeen',
    words:['到校','到校','到 校','已确认','到校','未到校','到校','到校','状态已确认','未 到 校','到校','到校','到校','已确认','未到校','到校'],
    footer:'旧版状态页未包含完整班级字段，当前内容无法作为正式核验结果。'
  },
  status:{
    title:'历史到校回执 / 打印视图',
    gate:()=>hasFlag('viewedLateReply'),
    flag:'legacyStatusDistortionSeen',
    words:['已到校','已到校','已 到 校','状态已确认','已到校','未到校','已到校','已到校','已确认','已 到 校','未到校','已到校','已到校','状态已确认','未到校','已到校'],
    footer:'打印渲染失败。请返回公开归档页查看稳定字段。'
  },
  archive:{
    title:'旧学籍状态回写接口 / 只读缓存',
    gate:()=>plotStage()>=5,
    flag:'legacyArchiveDistortionSeen',
    words:['已转出','已休学','已归档','无需本人操作','已转出','已通知监护人','已归档','当前账户','已完成','已休学','已转出','已归档','无需本人操作','当前账户','已完成','已归档'],
    footer:'该接口已停止服务。页面状态可能来自不完整的兼容缓存。'
  }
};
const cfg=scenes[scene]||scenes.arrival;
const back=()=>{if(history.length>1)history.back();else location.href='search.html'};
function normalFailure(){root.innerHTML=`<section class="legacy-loading-card"><div class="legacy-system-line">栖岚实验高级中学 · 历史系统兼容读取</div><h1>${cfg.title}</h1><div class="legacy-read-result"><b>历史内容暂无法显示</b><p>${cfg.footer}</p></div><div class="actions"><button type="button" class="btn" id="legacy-back">返回上一页</button><a class="btn" href="search.html">站内搜索</a></div></section>`;document.getElementById('legacy-back')?.addEventListener('click',back)}
if(!cfg.gate()){normalFailure()}else if(hasFlag(cfg.flag)){normalFailure()}else{
  flag(cfg.flag);
  root.innerHTML=`<section class="legacy-loading-card"><div class="legacy-system-line">栖岚实验高级中学 · 历史系统兼容读取</div><h1>${cfg.title}</h1><div class="legacy-reading" id="legacy-reading"><span>正在读取历史内容……</span><small>legacy-render / charset fallback</small></div><div class="legacy-blank" id="legacy-blank" hidden><strong>读取完成。</strong></div><div class="legacy-distortion" id="legacy-distortion" hidden aria-label="旧页面渲染异常">${cfg.words.map((w,i)=>`<span style="--i:${i}" data-word="${w}">${w}</span>`).join('')}</div><div class="legacy-fallback" id="legacy-fallback" hidden><b>历史内容暂无法显示</b><p>${cfg.footer}</p><div class="actions"><button type="button" class="btn" id="legacy-back">返回上一页</button><a class="btn" href="search.html">站内搜索</a></div></div></section>`;
  const reading=document.getElementById('legacy-reading'),blank=document.getElementById('legacy-blank'),dist=document.getElementById('legacy-distortion'),fallback=document.getElementById('legacy-fallback');
  const originalTitle=document.title,t1=reduce?900:720,t2=reduce?1850:1380,t3=reduce?3500:3300;
  setTimeout(()=>{reading.hidden=true;blank.hidden=false;document.title='读取完成｜历史系统'},t1);
  setTimeout(()=>{blank.hidden=true;dist.hidden=false;document.title=scene==='archive'?'状态回写｜历史系统':'历史状态｜兼容读取';playCue('soft',scene==='archive'?.075:.055)},t2);
  setTimeout(()=>{dist.hidden=true;fallback.hidden=false;document.title=originalTitle;document.getElementById('legacy-back')?.addEventListener('click',back)},t3);
}
