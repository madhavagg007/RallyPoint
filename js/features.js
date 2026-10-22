/* RallyPoint feature helpers. Function declarations only: loaded before app.js, which calls them at startup. */
let deferredInstall=null;
function initPwa(){addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;$('installBtn').classList.remove('hidden')});$('installBtn').onclick=async()=>{if(!deferredInstall)return;deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;$('installBtn').classList.add('hidden')};if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol))navigator.serviceWorker.register('sw.js').catch(()=>{})}

async function tournamentScore(r,i){let t=tournamentState();if(!t)return;let a=t.rounds[r][i*2],b=t.rounds[r][i*2+1];if(!a||!b||a==='BYE'||b==='BYE')return;if(state&&!state.finished&&state.score[0]+state.score[1]+state.sets.length&&!await askConfirm('Replace the match in progress?','Replace'))return;releaseAwake();$('p1').value=a;$('p2').value=b;$('mode').value='singles';$('mode').dispatchEvent(new Event('change'));start();state.tour={r,i};saveState();showTab('play')}
function tournamentUnpick(r,i){let t=tournamentState();if(!t||!t.rounds[r+1])return;t.rounds[r+1][i]=null;for(let k=r+2;k<t.rounds.length;k++)t.rounds[k].fill(null);tournamentSave(t)}

function playerList(){return [...new Set(matches.flatMap(m=>[m.p1,m.p2]))].sort()}
function initInsights(){$('h2hA').onchange=$('h2hB').onchange=renderInsights;renderInsights()}
function renderInsights(){
 const box=$('insights'),names=playerList(),selA=$('h2hA'),selB=$('h2hB');
 if(!names.length){selA.innerHTML=selB.innerHTML='';box.innerHTML='<div class="empty">Finish a match to unlock head-to-head records and win-rate trends.</div>';return}
 const A=names.includes(selA.value)?selA.value:names[0],others=names.filter(n=>n!==A);let B=others.includes(selB.value)?selB.value:'';
 selA.innerHTML=names.map(n=>`<option${n===A?' selected':''}>${esc(n)}</option>`).join('');
 selB.innerHTML='<option value="">All opponents</option>'+others.map(n=>`<option${n===B?' selected':''}>${esc(n)}</option>`).join('');
 const mine=matches.slice().reverse().filter(m=>(m.p1===A||m.p2===A)&&(!B||m.p1===B||m.p2===B));
 if(!mine.length){box.innerHTML='<div class="empty">These players haven’t played each other yet.</div>';return}
 const won=m=>m.p1===A?m.games1>m.games2:m.games2>m.games1;let w=0,pf=0,pa=0,cum=[];
 mine.forEach((m,k)=>{if(won(m))w++;pf+=m.p1===A?m.points1:m.points2;pa+=m.p1===A?m.points2:m.points1;cum.push(w/(k+1)*100)});
 const n=mine.length,W=320,H=110,X=k=>(n>1?k/(n-1)*(W-20)+10:W/2).toFixed(1),Y=v=>(H-10-v/100*(H-20)).toFixed(1);
 const chart=`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Win rate after each match"><line x1="0" x2="${W}" y1="${Y(50)}" y2="${Y(50)}" stroke="#2c2c3a" stroke-dasharray="4"/><polyline fill="none" stroke="#5eead4" stroke-width="2.5" stroke-linejoin="round" points="${cum.map((v,k)=>X(k)+','+Y(v)).join(' ')}"/>${cum.map((v,k)=>`<circle cx="${X(k)}" cy="${Y(v)}" r="3" fill="#5eead4"/>`).join('')}<text x="6" y="12" fill="#8d8c99" font-size="10">Win rate after each match</text></svg>`;
 box.innerHTML=`<div class="statgrid" style="margin-top:14px"><div class="stat accent"><span class="small">RECORD</span><b>${w}–${n-w}</b></div><div class="stat"><span class="small">WIN RATE</span><b>${Math.round(w/n*100)}%</b></div><div class="stat"><span class="small">POINTS FOR–AGAINST</span><b>${pf}–${pa}</b></div></div>${chart}<div style="margin-top:12px">`+mine.slice(-5).reverse().map(m=>`<div class="history-row"><div><b>${esc(m.p1)} ${m.games1}–${m.games2} ${esc(m.p2)}</b></div><div class="small">${esc(m.date)} • ${won(m)?'Win':'Loss'}</div></div>`).join('')+'</div>'}

/* ---- App shell: tabs, live pill, FAB, toasts, splash ---- */
const TABS=['play','history','stats','bracket'];
function showTab(t){if(!TABS.includes(t))t='play';TABS.forEach(n=>{$('view-'+n).classList.toggle('active',n===t);const b=document.querySelector('[data-tab="'+n+'"]');b.classList.toggle('active',n===t);b.setAttribute('aria-current',n===t?'page':'false')});try{localStorage.setItem('ttTab',t)}catch(e){}if(location.hash!=='#'+t)location.hash='#'+t;scrollTo(0,0);updateFab()}
const isLive=()=>!!(state&&!state.finished);
function updateFab(){const t=location.hash.slice(1)||'play',f=$('fab');f.classList.toggle('hidden',t==='play');f.textContent=isLive()?'▶ Resume match':'＋ New match'}
function updateLivePill(){const p=$('livePill'),live=isLive()&&(location.hash.slice(1)||'play')!=='play';p.classList.toggle('hidden',!live);if(live)p.textContent='● '+state.score[0]+'–'+state.score[1];updateFab()}
function updateTabBadge(){const n=matches.length,b=$('histBadge');b.textContent=n>99?'99+':n;b.classList.toggle('hidden',!n)}
function toast(msg){const t=document.createElement('div');t.className='toast';t.textContent=msg;$('toasts').append(t);setTimeout(()=>t.classList.add('out'),2600);setTimeout(()=>t.remove(),3000)}
function initShell(){initSportPicker();document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{navigator.vibrate?.(8);showTab(b.dataset.tab)});addEventListener('hashchange',()=>showTab(location.hash.slice(1)));$('livePill').onclick=()=>showTab('play');$('fab').onclick=()=>showTab('play');showTab(location.hash.slice(1)||(isLive()?'play':load('ttTab','play')));setInterval(updateLivePill,1000);updateLivePill();setTimeout(()=>{$('splash').classList.add('gone');setTimeout(()=>$('splash')?.remove(),500)},650)}

function initSportPicker(){const sel=$('sport'),fld=sel.closest('.field'),box=document.createElement('div');box.className='field full';box.innerHTML='<label>SPORT</label><div class="sportpicker" role="radiogroup" aria-label="Sport"></div>';const row=box.lastChild,sync=()=>row.querySelectorAll('.sportopt').forEach(b=>{const on=b.dataset.v===sel.value;b.classList.toggle('on',on);b.setAttribute('aria-checked',on)});[...sel.options].forEach(o=>{const b=document.createElement('button'),p=o.text.split(' ');b.type='button';b.className='sportopt';b.setAttribute('role','radio');b.dataset.v=o.value;b.innerHTML='<span>'+esc(p[0])+'</span>'+esc(p.slice(1).join(' '));b.onclick=()=>{sel.value=o.value;sel.dispatchEvent(new Event('change'));sync()};row.append(b)});sel.addEventListener('change',sync);fld.classList.add('hidden');fld.before(box);sync()}

/* In-app confirm sheet: native confirm dialogs are blocked in sandboxed/embedded pages, which silently broke Reset / Delete / New match. */
function askConfirm(msg,ok='Confirm'){return new Promise(res=>{let d=$('confirmBox');if(!d){d=document.createElement('dialog');d.id='confirmBox';d.className='confirm';d.setAttribute('aria-label','Please confirm');document.body.append(d)}d.innerHTML='<p class="confirm-msg"></p><div class="actions"><button class="secondary" id="cNo">Cancel</button><button class="danger" id="cYes"></button></div>';d.querySelector('.confirm-msg').textContent=msg;$('cYes').textContent=ok;const done=v=>{d.onclose=null;d.close();res(v)};$('cNo').onclick=()=>done(false);$('cYes').onclick=()=>done(true);d.onclick=e=>{if(e.target===d)done(false)};d.onclose=()=>res(false);d.showModal();$('cNo').focus()})}
