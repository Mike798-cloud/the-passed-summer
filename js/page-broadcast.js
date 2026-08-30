import {pageRoot,crumb,sideCommon,refreshShared} from './app.js';
import {playCue} from './audio.js';
import {flag} from './state.js';
flag('viewedBroadcast');pageRoot().innerHTML=`${crumb([{label:'返校通知',href:'notices.html'},{label:'晚间返校广播'}])}<div class="page-grid"><section class="panel"><h2 class="section-title">晚间返校广播</h2><img src="assets/img/audio-notice.svg" alt="校园广播音频公告" style="width:100%;max-width:720px"><p>播报内容：请返校同学按指定通道进入校园，完成现场到校核验后再前往宿舍或教学楼。夜间如遇强降雨，请服从现场引导。</p><p class="small muted">音频公告编号：QL-AUDIO-2026-0830 · 网页提示音需点击后播放。</p><div class="actions"><button id="play" class="btn primary">播放广播提示音</button><a class="btn" href="notices.html">返回通知</a></div></section>${sideCommon()}</div>`;document.getElementById('play').addEventListener('click',()=>playCue('radio'));refreshShared();
