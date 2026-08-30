import {flag,setFinalChoice} from './state.js';
import {playCue} from './audio.js';

export function choose(kind){
  const valid=['inherit','detach','freeze'];if(!valid.includes(kind))return;
  setFinalChoice(kind);flag('currentReturnSubmitted',kind!=='freeze');playCue('notice');
  location.href=`migration.html?end=${encodeURIComponent(kind)}`;
}

export function endingHTML(kind){
  const m={
    inherit:{
      title:'历史关联处理完成',state:'保留历史关联',badge:'已处理',ratio:'48 / 48',ratioLabel:'2022 历史汇总状态',
      current:'2026 返校信息：已提交',
      body:'系统已按推荐方式保留该候选历史关联，并完成本学期返校信息提交。个人中心将显示跨届历史链：2022-08-30 → 2026-08-31；当前关联依据仍为旧校园卡账户序号 0417。',
      line:'历史连续性校验完成。感谢您再次返校。',kind:'ok'
    },
    detach:{
      title:'历史关联处理完成',state:'仅解除当前关联',badge:'已处理',ratio:'48 / 48',ratioLabel:'2022 归档汇总值',
      current:'2026 返校信息：已提交',
      body:'当前账户已与 0417 旧回执解除关联，2026 返校信息正常提交。历史源记录没有被删除，2022 归档汇总仍保留当时的 48/48；该旧回执恢复为“无稳定学生 ID / 待归属”状态。',
      line:'当前账户关联已解除。待归属历史回执：1。',kind:'ok'
    },
    freeze:{
      title:'源记录复核工单已受理',state:'冻结争议回执并复核',badge:'待复核',ratio:'47 / 48',ratioLabel:'2022 有效到校统计（临时）',
      current:'2026 返校信息：草稿 / 需线下核验',
      body:'系统已暂停争议回执的统计效力，并生成历史源数据复核工单。当前处理摘要为：高三（4）班有效到校核验 47，争议回执 1。复核期间，本学期返校信息不会自动进入住宿、交通和教材同步队列。',
      line:'该历史记录已停止自动补齐。请于次日携校园卡到学生事务服务台完成线下核验。',kind:'warn'
    }
  };
  const e=m[kind];if(!e)return '';
  return `<section class="panel result-sheet"><div class="result-head"><div><div class="tiny muted">栖岚实验高级中学 · 账户迁移服务</div><h2>${e.title}</h2></div><span class="badge ${e.kind==='ok'?'blue':'yellow'}">${e.badge}</span></div><div class="result-grid"><div class="result-stat"><span>${e.ratioLabel}</span><b>${e.ratio}</b></div><div class="result-stat"><span>处理方式</span><b>${e.state}</b></div><div class="result-stat"><span>当前返校状态</span><b>${e.current.replace('2026 返校信息：','')}</b></div></div><div class="notice-box ${e.kind}"><strong>${e.current}</strong></div><p>${e.body}</p><div class="business-note">${e.line}</div><div class="actions"><a class="btn primary" href="my-return.html">查看我的返校</a><a class="btn" href="history.html">查看公开历史归档</a><a class="btn" href="search.html">站内搜索</a></div><p class="tiny muted" style="margin-top:18px">处理编号：QL-MIG-${kind.toUpperCase()}-2026 · 本页可使用浏览器打印功能留存。</p></section>`;
}
