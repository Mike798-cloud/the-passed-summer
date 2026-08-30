import {initState,flag,settings,patchSettings} from './state.js';
initState();
const motion=document.getElementById('motion-sso');motion.checked=!!settings().reducedMotion;document.documentElement.classList.toggle('reduced-motion',motion.checked);document.getElementById('continue-session').addEventListener('click',()=>{flag('ssoVisited');location.href='index.html?from=sso'});motion.addEventListener('change',e=>{const reduced=e.target.checked;patchSettings({reducedMotion:reduced});document.documentElement.classList.toggle('reduced-motion',reduced)});
