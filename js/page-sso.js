import {initState,flag,settings,patchSettings} from './state.js';
initState();
const motion=document.getElementById('motion-sso'),effective=document.getElementById('effective-sso');
function sync(){const s=settings();motion.checked=!!s.reducedMotion;effective.checked=!!s.effectiveUnderline;document.documentElement.classList.toggle('reduced-motion',!!s.reducedMotion);document.documentElement.classList.toggle('effective-underlines',!!s.effectiveUnderline)}
sync();
if(new URLSearchParams(location.search).get('resetDone')==='1'){
  const box=document.createElement('div');box.className='notice-box ok';box.setAttribute('role','status');box.innerHTML='<strong>本机存档已重置。</strong> 返校办理、访问记录、搜索历史与结局已清除，阅读设置保持不变。';document.querySelector('.sso-body')?.prepend(box);
}
document.getElementById('continue-session').addEventListener('click',()=>{flag('ssoVisited');location.href='index.html?from=sso'});
motion.addEventListener('change',e=>{patchSettings({reducedMotion:!!e.target.checked});sync()});
effective.addEventListener('change',e=>{patchSettings({effectiveUnderline:!!e.target.checked});sync()});
