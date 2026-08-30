import {pageRoot,crumb,refreshShared,serviceMeta} from './app.js';
import {reviewReady,flag,hasFlag,finalChoice,setFinalChoice,currentReturnSubmitted,day2Started,advanceToDay2,markDay2ReviewSeen} from './state.js';
import {showSanEvent} from './anomaly.js';
import {playCue} from './audio.js';

const ending=finalChoice();

function linTrace(){
  if(hasFlag('viewedLinDraft'))return `<section class="panel memory-fragment"><div class="tiny muted">旧校园广场迁移缓存 · 2022-08-31 09:14</div><p>“盐汽水先别喝，等我回来拿。要是我中午还没回你消息，你就替我喝了吧，别放到没有气。”</p><p class="small muted">草稿没有发送。六分钟后，另一套系统记录了她的接驳时间。</p></section>`;
  if(hasFlag('viewedSaltwaterWait'))return `<section class="panel memory-fragment"><div class="tiny muted">校园广场公开归档 · 2022-08-31</div><p>冰箱最里面有一瓶贴着名字的盐汽水。便利贴已经被水汽泡得卷边，发帖的人说：“我再放一天吧。明天开学，她总要回来的。”</p></section>`;
  return `<section class="panel memory-fragment"><div class="tiny muted">2022 校园广场公开归档</div><p>“晚点回”在那些旧帖里总把事情留到明天：作业明天补，行李明天收，没赶上的返校也明天再说。</p></section>`;
}

function endingHTML(kind){
  const map={
    stop:{
      title:'当前校园会话已结束',
      trace:'未发现可恢复的公开主题。',
      body:'系统按“离开当前页面”结束了材料入口。9 月 1 日，学籍同步显示“校际转出 / 家庭长期迁居”，当前账户不再提供在籍服务。',
      after:'9 月 3 日，校园广场有人问起冰箱里那瓶饮料。帖子没有得到回复，午后被归入过期生活帖。'
    },
    public:{
      title:'公开说明已进入内容清理',
      trace:'公开主题缓存缩略图：1。',
      body:'你留下的说明从校园广场主索引中消失了。9 月 1 日，学籍同步显示“校际转出 / 家庭长期迁居”；缓存里仍有一张没有正文的主题缩略图。',
      after:'缩略图下面只剩半行标题：“她说所有没做完的事，都可以……”后面的字没有被缓存。'
    },
    archive:{
      title:'历史附件已进入归档队列',
      trace:'2027 预同步：未处理历史附件 1。',
      body:'你把看过的页面留进校史附件队列，账户随后从在籍服务中移除。附件没有公开，也没有删除；它在无人打开的队列里又过了一个夏天。',
      after:'下一学年的预同步只认出了附件中的一句话：“我是真的以为，所有没来得及做的事，都可以留到明天。”'
    }
  };
  const e=map[kind];
  return `${crumb([{label:'学生事务补充核验'}])}<section class="panel result-sheet"><div class="result-head"><div><div class="tiny muted">学生事务服务 · 事项回执</div><h2>${e.title}</h2></div><span class="badge gray">会话失效</span></div>${serviceMeta([['处理时间','09-01 08:12'],['当前账户','不可用'],['返校批次','已结束']])}<p>${e.body}</p><div class="result-grid"><div class="result-stat"><span>昨日预约</span><b>18:40</b></div><div class="result-stat"><span>车辆</span><b>校车 03</b></div><div class="result-stat"><span>服务流转</span><b>已交接</b></div></div><div class="business-note effective-info"><strong>目的服务机构：</strong>青岚青少年成长实践中心。回执没有离场记录、后续联系方式或撤销事项。</div><div class="future-record effective-info"><span>下一学年索引预同步</span><b>${e.trace}</b></div><div class="divider"></div><div class="forum-epilogue"><div class="tiny muted">校园广场 · 开学后的第三天</div><p>${e.after}</p><p class="small">有人回复：“晚点回是谁？”</p><div class="deleted-line">该主题不存在或已被清理。</div></div><div class="actions"><a class="btn primary" href="index.html">返回学校首页</a><a class="btn" href="search.html">打开站内搜索</a></div></section>`;
}

function eveningReview(){
  flag('openedReview');
  return `${crumb([{label:'学生事务补充核验'}])}<div class="page-grid"><div>
  <section class="panel"><h2 class="section-title">学生事务补充核验 <small>已进入人工服务流转</small></h2>${serviceMeta([['事项编号','QL-SR-2026-0830'],['集合时间','08-30 18:40'],['集合地点','综合服务楼西门']])}<div class="notice-box effective-info"><strong>事项来源：</strong>当前账户访问了多份跨年度公开资料。系统已将会话交给学生事务中心处理。</div><div class="review-photo-grid"><figure class="quiet-photo"><img src="assets/img/rain-campus.webp" alt="持续降雨中的校园西门与教学区"><figcaption><b>当前校园 · 18:40</b><span>持续降雨 · 常规现场服务已结束</span></figcaption></figure><figure class="quiet-photo"><img src="assets/img/school-bus.webp" alt="校园接驳车辆资料图"><figcaption><b>预约接驳 · 校车 03</b><span>综合服务楼西门 · 当前名单 1 人</span></figcaption></figure></div><div class="handoff-timeline effective-info"><div><time>11:42</time><p><b>学生事务中心已接单</b><span>处理人：王老师 · 服务台 2 号</span></p></div><div><time>11:56</time><p><b>监护联系方式通知已发送</b><span>当前页面不提供通知正文或回执原件</span></p></div><div><time>12:03</time><p><b>已加入 18:40 接驳名单</b><span>校车 03 · 青岚青少年成长实践中心 · 1 人</span></p></div></div><div class="notice-box warn"><strong>当前预约没有线上取消入口。</strong>未按时间到场不会撤销事项；系统会在下一服务日继续处理。</div><div class="actions"><button class="btn primary" type="button" id="continue-investigation">不去西门，回到网站</button><a class="btn" href="center.html">查看合作机构公开页</a></div></section>
  ${linTrace()}
  <section class="panel"><h2 class="section-title">浏览器恢复的三个时间</h2><div class="handoff-timeline"><div><time>2017</time><p><b>一名学生问起两份不同的值班表</b><span>后来，公开名单写着“校际转出”。</span></p></div><div><time>2019</time><p><b>一名学生问起早于本人到校的门禁记录</b><span>后来，公开名单写着“个人原因休学”。</span></p></div><div><time>2022</time><p><b>一名学生说自己还没有到校</b><span>后来，公开名单写着“家庭原因暂缓返校”。</span></p></div></div><p class="small muted">这不是系统结论。页面只把你已经打开过的公开日期并排显示。</p></section></div><aside class="sidebar"><div class="card"><h3 class="section-title">事项信息</h3><div class="small effective-info">集合：综合服务楼西门</div><div class="small effective-info">班次：18:40 / 校车 03</div><div class="small effective-info">目的地：青岚青少年成长实践中心</div></div><div class="card"><h3 class="section-title">仍可使用</h3><a href="square.html">校园广场</a><br><a href="history.html">校史检索</a><br><a href="search.html">站内搜索</a></div></aside></div>`;
}

function dayTwoReview(){
  markDay2ReviewSeen();
  return `${crumb([{label:'学生事务补充核验'}])}<div class="page-grid"><div>
  <section class="panel"><h2 class="section-title">学生事务补充核验 <small>8 月 31 日人工复核</small></h2>${serviceMeta([['事项编号','QL-SR-2026-0830'],['昨日预约','18:40 / 未完成'],['普通返校窗口','今日 24:00 截止']])}<div class="notice-box warn effective-info"><strong>昨日预约未完成。</strong>事项已转入人工处理。普通返校信息会在今日 24:00 定版；当前事项不随普通窗口自动关闭。</div><div class="handoff-timeline effective-info"><div><time>08:05</time><p><b>未到场事项转入次日人工复核</b><span>昨日 18:40 / 校车 03</span></p></div><div><time>09:18</time><p><b>学生事务信息再次同步</b><span>返校、学籍与监护联系字段进入交叉核对</span></p></div><div><time>15:26</time><p><b>学籍异动预处理已建立</b><span>公开事由：家庭长期迁居</span></p></div><div><time>23:12</time><p><b>返校批次进入定版前检查</b><span>普通账户将在 24:00 关闭修改</span></p></div></div></section>
  <section class="panel"><h2 class="section-title">学籍异动预处理 <small>尚未定版</small></h2><div class="future-record-grid effective-info"><div><span>申请来源</span><b>本人</b></div><div><span>公开事由</span><b>家庭长期迁居</b></div><div><span>监护确认</span><b>已完成</b></div><div><span>拟生效日期</span><b>9 月 1 日</b></div></div><p class="small muted">当前会话找不到对应申请单、监护确认原件或撤销入口。</p></section>
  <section class="panel"><h2 class="section-title">校园广场草稿同步</h2><div class="draft-ghost effective-info"><div class="tiny muted">作者：当前学生账户 · 计划发布时间：09-01 07:20</div><p><b>最近家里有点事</b></p><p>这学期可能不过来了。之前问过的那些旧资料不用管了，我应该看错了。</p></div><p class="small muted">你没有写过这段话。它的语气却像一份已经替你准备好的告别。</p></section>
  ${linTrace()}
  <section class="panel"><h2 class="section-title">在页面关闭以前</h2><p>你已经知道那些日期为什么彼此对不上，也知道系统会怎样给一个人的离开补上一句合乎手续的理由。但知道得再完整，也不能让 2022 年 8 月 31 日的上午重新开始。</p><p>现在能决定的，只是这些文字最后留在哪里。</p><div class="choice-grid"><div class="choice"><h3>离开，不再留下记录</h3><p>关闭页面，不提交新的公开文字。</p><div class="cost">最后留下：没有新增记录。</div><button class="btn" data-final="stop">离开页面</button></div><div class="choice"><h3>在校园广场留下说明</h3><p>以当前账户写下一段所有人都能看到的话。</p><div class="cost">最后留下：一条可能被清理的公开主题。</div><button class="btn" data-final="public">发布说明</button></div><div class="choice"><h3>把文字留进校史附件</h3><p>将本次打开过的页面写入旧索引附件队列。</p><div class="cost">最后留下：一份可能很久都无人打开的附件。</div><button class="btn primary" data-final="archive">保存附件</button></div></div></section></div><aside class="sidebar"><div class="card"><h3 class="section-title">当前时间</h3><div class="small"><b>08 月 31 日</b></div><div class="small">普通返校窗口：<b>今日 24:00 截止</b></div><div class="small">当前异常事项：<b>人工处理中</b></div></div><div class="card"><h3 class="section-title">公开入口</h3><a href="square.html">校园广场</a><br><a href="history.html">校史检索</a><br><a href="search.html">站内搜索</a></div></aside></div>`;
}

if(ending){
  pageRoot().innerHTML=endingHTML(ending);refreshShared();
}else if(!currentReturnSubmitted()||!reviewReady()){
  pageRoot().innerHTML=`${crumb([{label:'学生事务补充核验'}])}<section class="panel"><h2 class="section-title">学生事务补充核验</h2>${serviceMeta([['当前账户','****0417'],['待办事项','0'],['状态','暂无事项']])}<div class="notice-box">当前账户暂无可办理的补充核验事项。返校平台的公开页面仍可正常浏览。</div><div class="actions"><a class="btn primary" href="index.html">返回返校总览</a><a class="btn" href="search.html">打开站内搜索</a></div></section>`;refreshShared();
}else if(!day2Started()){
  pageRoot().innerHTML=eveningReview();refreshShared();
  showSanEvent({flagName:'sanBusReviewShown',title:'学生事务预约 · 画面同步',image:'assets/img/school-bus.webp',caption:'校车 03 · 18:40 · 当前名单 1 人',words:['已安排','当前名单 1 人','已通知监护人','已安排','校车 03','18:40','已安排','当前账户','已交接','18:40'],hold:2200,delay:850});
  document.getElementById('continue-investigation')?.addEventListener('click',()=>{if(advanceToDay2()){playCue('notice');location.href='index.html?day=0831'}});
}else{
  pageRoot().innerHTML=dayTwoReview();refreshShared();
  showSanEvent({flagName:'sanDeadlineArchiveShown',title:'返校批次定版前检查',image:'assets/img/service-hall.webp',caption:'异常事项 · 不随普通返校窗口自动关闭',words:['已转出','已休学','已归档','无需本人操作','已通知监护人','当前账户','已归档','已完成','当前账户','已转出','待定版','已归档'],hold:2300,delay:900});
  document.querySelectorAll('[data-final]').forEach(button=>button.addEventListener('click',()=>{const kind=button.dataset.final;if(!reviewReady())return;setFinalChoice(kind);playCue('notice');location.href=`review.html?end=${encodeURIComponent(kind)}`}));
}
