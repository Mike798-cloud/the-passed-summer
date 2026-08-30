import {settings} from './state.js';
let unlocked=false;try{unlocked=sessionStorage.getItem('ql-audio-unlocked')==='1'}catch{}
export function unlockAudio(){unlocked=true;try{sessionStorage.setItem('ql-audio-unlocked','1')}catch{}}
export function playCue(name){
  if(!unlocked||settings().muted)return;
  const map={notice:'assets/audio/notice.wav',bell:'assets/audio/bell.wav',radio:'assets/audio/radio.wav',soft:'assets/audio/soft.wav'};
  const src=map[name];if(!src)return;
  try{const a=new Audio(src);a.volume=name==='bell'?.32:.23;a.play().catch(()=>{})}catch{}
}
export function bindAudioUnlock(){
  const once=()=>{unlockAudio();document.removeEventListener('pointerdown',once,true);document.removeEventListener('keydown',once,true)};
  document.addEventListener('pointerdown',once,true);document.addEventListener('keydown',once,true);
}
