import {pageRoot,crumb,sideCommon,refreshShared,serviceMeta,trapFocus,maybeAutoSupportPrompt} from './app.js';
import {flag,anomalyLevel,hasFlag,finalChoice} from './state.js';
import {triggerJ2} from './anomaly.js';
import {choose,endingHTML} from './migration.js';

flag('viewedMigrationHelp');
const params=new URLSearchParams(location.search);
const end=params.get('end')||finalChoice();
if(end){
  pageRoot().innerHTML=`${crumb([{label:'账户迁移帮助',href:'migration.html'},{label:'处理结果'}])}${endingHTML(end)}`;
  refreshShared();
}else{
  if(params.get('from')==='submit')flag('openedMigrationDecision');
  const actionReady=hasFlag('formAttempted')||params.get('from')==='submit';
  const action=(kind,label,klass='')=>actionReady?`<button class="btn ${klass}" data-choice="${kind}">${label}</button>`:`<span class="choice-pending">提交当前返校信息后可办理</span>`;
  pageRoot().innerHTML=`${crumb([{label:'账户迁移帮助'}])}<div class="page-grid"><div>
  <section class="panel"><h2 class="section-title">历史关联与账户迁移帮助</h2>${serviceMeta([['迁移批次','MIG-2026-08'],['关联键','旧卡序号 0417'],['处理权限','学生自助']])}<div class="notice-box"><strong>当前检测：</strong>旧系统历史回执与当前校园卡账户序号 ****0417 存在跨届候选关联。学生自助端不能删除历史源数据。</div><h3 class="subhead">什么是“历史关联”？</h3><p class="soft-anomaly" data-anomaly-text data-l1="历史记录已于 2022 年完成确认，如有误请核对来源。" data-l2="若您在对应年度并未返校，请核对历史关联。" data-l3="您已返校，请核对历史关联。" data-l4="您已返校。你明天再回来吗？">“历史关联”用于保留旧平台返校回执。若对应年度与当前学籍不一致，系统会把当前表单保存为草稿，并要求核对关联来源。</p><h3 class="subhead">为什么会出现跨届关联？</h3><p>2022 旧系统部分记录缺少稳定学号，只保留“旧校园卡账户序号 + 班级 + 时间”。该账户序号属于后勤系统业务序号，旧账户注销后可能循环复用。2026 迁移任务先生成候选关联，再标记跨届冲突。</p><div class="notice-box warn"><strong>迁移已知问题：</strong>部分旧系统“状态争议 / 停止计入”例外表因旧行 ID 缺失，未能与原始回执建立完整关联。</div></section>
  <section id="source" class="panel"><h2 class="section-title">当前候选关联 <small>来源摘要</small></h2><div class="migration-summary" data-j2-summary aria-live="polite"><div class="mini-grid"><div><span>源系统</span><b>2022 返校回执</b></div><div><span>关联键</span><b>旧卡序号 0417</b></div><div><span>冲突类型</span><b>跨届</b></div><div><span>当前状态</span><b>待核验</b></div></div></div><details class="details-box" id="source-detail"><summary>展开与当前账户关联的源回执字段</summary><div class="details-inner"><div class="small muted" style="margin-bottom:8px">源记录 · 2022-08-30 22:03 · 高三（4）班</div><div class="table-wrap mobile-cards"><table class="data-table"><tbody><tr><td data-label="字段">历史姓名</td><td data-label="值">林*</td></tr><tr><td data-label="字段">旧卡账户序号</td><td data-label="值">****0417</td></tr><tr><td data-label="字段">前置状态</td><td data-label="值"><b>未到校</b></td></tr><tr><td data-label="字段">变更后状态</td><td data-label="值"><b>已到校（自行）</b></td></tr><tr><td data-label="字段">来源</td><td data-label="值"><b>年级汇总补录</b></td></tr><tr><td data-label="字段">更新时间</td><td data-label="值">22:03</td></tr></tbody></table></div><p class="small muted">学生端仅显示与当前候选关联有关的脱敏字段，不提供员工私聊、具体操作人或完整历史学生名单。</p></div></details><h3 class="subhead">相关公开资料</h3><div class="actions"><a class="btn" href="notice.html?id=2022-advance">2022 同日返校安排</a><a class="btn" href="history-detail.html?id=hist_2026_migration">历史数据迁移说明</a><a class="btn" href="notices.html?year=2022">2022 公开通知</a></div></section>
  <section class="panel"><h2 class="section-title">历史关联处理</h2><p>下列方式只处理“当前账户与旧回执的关联关系”或该回执的统计效力。历史源记录属于审计归档，学生自助端无权直接删除。</p>${actionReady?'':'<div class="notice-box"><strong>办理状态：</strong>当前尚未提交本学期返校信息。您可以先核对全部来源；当返校表单因跨届冲突保存为草稿后，本页将开放具体处理。</div>'}<div class="choice-grid"><div class="choice"><h3>按系统推荐保留关联</h3><p>保留历史关联，并以当前账户继续提交。</p><p>当前住宿、校车等服务可立即进入同步。</p><div class="cost">影响：旧回执会继续挂在当前账户的历史链中。</div>${action('inherit','保留关联并继续','primary')}</div><div class="choice"><h3>仅解除当前账户关联</h3><p>移除该历史回执与当前账户的关联，不改变历史原始状态。</p><p>当前返校信息可继续正常提交。</p><div class="cost">影响：旧回执仍保留在历史源系统中，等待其他处理。</div>${action('detach','解除当前关联')}</div><div class="choice"><h3>申请历史源记录复核</h3><p>冻结争议回执的统计效力，并提交历史源数据复核。</p><p>信息中心将重新调阅相关聚合记录。</p><div class="cost">影响：本次返校转为线下核验，源数据调阅范围会扩大。</div>${action('freeze','冻结并申请复核','warn')}</div></div>${actionReady?'':'<div class="actions"><a class="btn primary" href="my-return.html">返回“我的返校”</a></div>'}<div class="notice-box small">复核结果可能维持原记录。请根据当前办理时限、个人隐私范围和历史记录追溯需要选择处理方式。</div></section>
  </div>${sideCommon()}</div>
  <div class="confirm-layer" id="choice-confirm" hidden role="dialog" aria-modal="true" aria-labelledby="confirm-title"><div class="confirm-card"><h3 id="confirm-title">确认历史关联处理</h3><p id="confirm-copy"></p><div class="notice-box small" id="confirm-impact"></div><div class="confirm-actions"><button class="btn" id="confirm-cancel" type="button">返回核对</button><button class="btn primary" id="confirm-submit" type="button">确认提交</button></div></div></div>`;
  const detail=document.getElementById('source-detail');
  detail?.addEventListener('toggle',()=>{if(detail.open)flag('viewedSourceDetail')});
  if(location.hash==='#source'){detail.open=true;flag('viewedSourceDetail')}
  const dialog=document.getElementById('choice-confirm'),copy=document.getElementById('confirm-copy'),impact=document.getElementById('confirm-impact'),submit=document.getElementById('confirm-submit'),cancel=document.getElementById('confirm-cancel');
  const info={inherit:['保留旧回执与当前账户的候选关联，并继续提交 2026 返校信息。','当前服务立即同步；旧回执将进入当前账户历史链。'],detach:['只解除当前账户与旧回执的关联，不修改历史源回执。','当前服务可继续同步；旧回执保持原状态并成为待归属记录。'],freeze:['暂停争议回执的统计效力，并发起源记录复核。','当前返校保持草稿，需次日线下核验；相关旧数据将被重新调阅。']};
  let pending=null,lastTrigger=null;
  document.querySelectorAll('[data-choice]').forEach(b=>b.addEventListener('click',()=>{pending=b.dataset.choice;lastTrigger=b;copy.textContent=info[pending][0];impact.textContent=info[pending][1];dialog.hidden=false;cancel.focus()}));
  const close=()=>{dialog.hidden=true;pending=null;const t=lastTrigger;lastTrigger=null;t?.focus()};
  cancel?.addEventListener('click',close);dialog?.addEventListener('click',e=>{if(e.target===dialog)close()});trapFocus(dialog,close);submit?.addEventListener('click',()=>{if(pending)choose(pending)});
  refreshShared();
  if(actionReady&&anomalyLevel()>=4&&!hasFlag('j2Shown'))setTimeout(triggerJ2,850);
  maybeAutoSupportPrompt();
}
