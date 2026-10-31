'use strict';
const $ = (selector, root = document) => root.querySelector(selector);
const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
const fmt = (value, digits = 0) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: digits }).format(value);
const todayLocal = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const dateUTC = value => { if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return NaN; const [y,m,d] = value.split('-').map(Number); const stamp = Date.UTC(y,m-1,d); const check = new Date(stamp); return check.getUTCFullYear() === y && check.getUTCMonth() === m-1 && check.getUTCDate() === d ? stamp : NaN; };
const day = 86400000;
const field = (id,label,value,type='number',extra='') => `<div class="field"><label for="${id}">${label}</label><input id="${id}" type="${type}" value="${value}" ${type==='number'?`inputmode="${/step="1"/.test(extra)?'numeric':'decimal'}"`: ''} ${extra}></div>`;
const select = (id,label,options) => `<div class="field"><label for="${id}">${label}</label><select id="${id}">${options.map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</select></div>`;
const row = (label,value) => `<div class="result-row"><span>${label}</span><strong>${value}</strong></div>`;
const result = (main,caption,rows='',extra='') => `<h3>Live result</h3><div class="result-main">${main}</div><p class="result-caption">${caption}</p><div class="result-list">${rows}</div>${extra}`;
const ageParts = (born, now) => {
  const mark = (years, months = 0) => {
    const year = born.getFullYear() + years;
    const month = born.getMonth() + months;
    const last = new Date(year, month + 1, 0).getDate();
    return new Date(year, month, Math.min(born.getDate(), last), born.getHours(), born.getMinutes(), born.getSeconds());
  };
  let years = now.getFullYear() - born.getFullYear();
  while (mark(years) > now) years--;
  let months = 0;
  while (months < 11 && mark(years, months + 1) <= now) months++;
  let remaining = now - mark(years, months);
  const days = Math.floor(remaining / day); remaining %= day;
  const hours = Math.floor(remaining / 3600000); remaining %= 3600000;
  const minutes = Math.floor(remaining / 60000); remaining %= 60000;
  return { years, months, days, hours, minutes, seconds: Math.floor(remaining / 1000) };
};
const ageTicker = (parts, nextBirthdayDays) => `<h3>Live age</h3><div class="age-ticker" aria-label="Current age">${Object.entries(parts).map(([unit,value])=>`<div class="age-unit unit-${unit}"><strong>${fmt(value)}</strong><span>${unit}</span></div>`).join('')}</div><p class="result-caption">Updating every second</p><div class="result-list">${row('Days until next birthday',fmt(nextBirthdayDays))}${row('Next milestone',`${parts.years+1} years`)}</div>`;
const chart = (values, labelA='Start', labelB='End') => { const max=Math.max(...values,1), pts=values.map((v,i)=>`${i*300/(values.length-1)},${120-v/max*110}`).join(' '); return `<svg class="chart" viewBox="0 0 300 126" preserveAspectRatio="none" role="img" aria-label="Growth line chart"><path class="fill" d="M0 120 L${pts.replaceAll(' ',' L')} L300 120 Z"></path><path class="stroke" d="M${pts.replaceAll(' ',' L')}"></path></svg><div class="chart-axis"><span>${labelA}</span><span>${labelB}</span></div>`; };
const tools = [
 {id:'wealth',group:'Money',title:'SIP & Lumpsum Wealth Predictor',short:'Wealth predictor',description:'See how recurring and one-time investments could grow.',inputs:()=>`<div class="segmented"><button type="button" data-mode="sip" class="selected">Monthly SIP</button><button type="button" data-mode="lump">Lumpsum</button></div>${field('principal','Monthly investment (₹)',10000,'number','min="0" step="100"')}${field('rate','Expected annual return (%)',12,'number','min="0" max="100" step="0.1"')}${field('years','Investment period (years)',10,'number','min="1" max="100" step="1"')}`,calc:(v,s)=>{const p=v('principal'),r=v('rate'),y=v('years'); if(p<0||r<0||r>100||y<=0||y>100)return 'Enter a non-negative investment, return from 0–100%, and period from 1–100 years.';const n=Math.round(y*12),mr=r/1200,mode=s.mode||'sip';let total=0,invested=mode==='sip'?p*n:p,values=[];for(let i=0;i<=n;i++){if(mode==='sip'){if(i)total=total*(1+mr)+p;}else total=p*Math.pow(1+mr,i);if(i%Math.max(1,Math.floor(n/24))===0||i===n)values.push(total)}return result(money(total),'Projected value',row('Amount invested',money(invested))+row('Estimated gains',money(total-invested))+row('Assumed annual return',`${fmt(r,1)}%`),chart(values,'Today',`${fmt(y)} years`));}},
 {id:'interest',group:'Money',title:'Simple vs Compound Interest',short:'Interest visualizer',description:'Compare how each interest method changes the final amount.',inputs:()=>`${field('principal','Principal (₹)',100000,'number','min="0"')}${field('rate','Annual rate (%)',8,'number','min="0" max="100" step="0.1"')}${field('years','Period (years)',5,'number','min="0" max="100" step="0.5"')}${select('frequency','Compounding',[['1','Annually'],['4','Quarterly'],['12','Monthly'],['365','Daily']])}`,calc:v=>{const p=v('principal'),r=v('rate')/100,y=v('years'),f=v('frequency');if(p<0||r<0||r>1||y<0||y>100)return 'Enter valid non-negative values; rate and years cannot exceed 100.';const simple=p*(1+r*y),compound=p*Math.pow(1+r/f,f*y);return result(money(compound),'Compound interest total',row('Simple interest total',money(simple))+row('Compound interest earned',money(compound-p))+row('Extra from compounding',money(compound-simple)),chart(Array.from({length:21},(_,i)=>p*Math.pow(1+r/f,f*y*i/20)),'Today',`${fmt(y,1)} years`));}},
 {id:'inflation',group:'Money',title:'Inflation & Purchasing Power',short:'Inflation & purchasing power',description:'Translate today’s prices into future costs and real value.',inputs:()=>`${field('principal','Amount today (₹)',100000,'number','min="0"')}${field('rate','Annual inflation (%)',6,'number','min="-99" max="100" step="0.1"')}${field('years','Years from now',10,'number','min="0" max="100"')}`,calc:v=>{const p=v('principal'),r=v('rate')/100,y=v('years');if(p<0||r<=-1||r>1||y<0||y>100)return 'Use a positive amount, inflation above −100% and at most 100%, and 0–100 years.';const future=p*Math.pow(1+r,y),power=p/Math.pow(1+r,y);return result(money(future),'Future cost of today’s amount',row('Purchasing power of same amount',money(power))+row('Price change',money(future-p)),chart(Array.from({length:21},(_,i)=>p*Math.pow(1+r,y*i/20)),'Today',`${fmt(y)} years`));}},
 {id:'tip',group:'Everyday',title:'Tip & Split-Bill Calculator',short:'Tip & split bill',description:'Settle a meal with clear totals for everyone.',inputs:()=>`${field('bill','Bill amount (₹)',1800,'number','min="0"')}${field('tip','Tip (%)',10,'number','min="0" max="100"')}${field('people','People',3,'number','min="1" max="1000" step="1"')}`,calc:v=>{const b=v('bill'),t=v('tip'),n=v('people');if(b<0||t<0||t>100||n<1||!Number.isInteger(n))return 'Enter a non-negative bill, tip from 0–100%, and a whole number of people.';const tip=b*t/100;return result(money((b+tip)/n),'Per person',row('Tip amount',money(tip))+row('Total bill',money(b+tip))+row('People',fmt(n)));}},
 {id:'percentage',group:'Everyday',title:'Percentage Difference & Growth',short:'Percentage growth',description:'Measure absolute change and relative movement.',inputs:()=>`${field('old','Starting value',250,'number','step="any"')}${field('new','Ending value',310,'number','step="any"')}`,calc:v=>{const a=v('old'),b=v('new'),d=b-a;if(a===0)return 'Starting value must be non-zero to calculate percentage growth.';const growth=d/Math.abs(a)*100,diff=(a===0&&b===0)?0:Math.abs(d)/((Math.abs(a)+Math.abs(b))/2)*100;return result(`${fmt(growth,2)}%`,growth>=0?'Growth from starting value':'Decline from starting value',row('Absolute change',fmt(d,2))+row('Symmetric percentage difference',`${fmt(diff,2)}%`));}},
 {id:'age',group:'Dates',title:'Age & Milestone Live Ticker',short:'Age & live milestones',description:'Watch age update live and find the next birthday.',inputs:()=>`${field('birth','Date of birth','1995-01-01','date')}${field('birthtime','Time of birth','00:00','time')}`,calc:v=>{const birth=dateUTC(v('birth')),time=v('birthtime');if(!Number.isFinite(birth)||!/^\d\d:\d\d$/.test(time))return 'Enter a valid birth date and time.';const [h,m]=time.split(':').map(Number),parts=v('birth').split('-').map(Number),born=new Date(parts[0],parts[1]-1,parts[2],h,m),now=new Date();if(born>now)return 'Birth date must be in the past.';const age=ageParts(born,now);let next=new Date(now.getFullYear(),born.getMonth(),born.getDate(),h,m);if(next<=now)next=new Date(now.getFullYear()+1,born.getMonth(),born.getDate(),h,m);return ageTicker(age,Math.ceil((next-now)/day));}},
 {id:'between',group:'Dates',title:'Days Between Dates',short:'Days & business days',description:'Count calendar days and weekdays between two dates.',inputs:()=>`${field('start','Start date',todayLocal(),'date')}${field('end','End date',todayLocal(),'date')}`,calc:v=>{const a=dateUTC(v('start')),b=dateUTC(v('end'));if(!Number.isFinite(a)||!Number.isFinite(b))return 'Enter two valid dates.';const lo=Math.min(a,b),hi=Math.max(a,b),days=Math.round((hi-lo)/day);let business=0;for(let t=lo;t<hi;t+=day){const wd=new Date(t).getUTCDay();if(wd!==0&&wd!==6)business++}return result(fmt(days),'Calendar days between dates',row('Business days (Mon–Fri)',fmt(business))+row('Full weeks',fmt(Math.floor(days/7)))+row('Direction',b>=a?'Forward':'Backward'));}},
 {id:'age-units',group:'Dates',title:'Age in Days, Weeks & Hours',short:'Age unit converter',description:'See your age in everyday units.',inputs:()=>`${field('birth','Date of birth','1995-01-01','date')}`,calc:v=>{const b=dateUTC(v('birth')),now=Date.now();if(!Number.isFinite(b)||b>now)return 'Enter a valid date of birth in the past.';const days=Math.floor((now-b)/day);return result(fmt(days),'Days lived',row('Weeks',fmt(days/7,1))+row('Hours',fmt(Math.floor((now-b)/3600000)))+row('Minutes',fmt(Math.floor((now-b)/60000))));}},
 {id:'timezone',group:'Time',title:'Multi-Timezone Grid Converter',short:'Timezone grid',description:'Move the hour slider and compare cities at a glance.',inputs:()=>`${field('date','Reference date',todayLocal(),'date')}${field('hour','Reference hour (UTC)','12','range','min="0" max="23" step="1"')}`,calc:v=>{
    const d = dateUTC(v('date'));
    const h = v('hour');
    if (!Number.isFinite(d)) return 'Enter a valid reference date.';
    const stamp = d + h * 3600000;
    const zones = [
      ['Mumbai (IST)', 'Asia/Kolkata'],
      ['Chicago (CST/CDT)', 'America/Chicago'],
      ['New York (EST/EDT)', 'America/New_York'],
      ['London (GMT/BST)', 'Europe/London'],
      ['Singapore (SGT)', 'Asia/Singapore'],
      ['Tokyo (JST)', 'Asia/Tokyo'],
      ['Sydney (AEST/AEDT)', 'Australia/Sydney']
    ];
    const rows = zones.map(([name, zone]) => row(name, new Intl.DateTimeFormat('en-GB', {
      timeZone: zone, weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit', hour12: false
    }).format(stamp))).join('');
    return result(`${String(h).padStart(2, '0')}:00 UTC`, 'Reference time', rows);
  }},
 {id:'duration',group:'Time',title:'Time Duration Adder / Subtractor',short:'Time duration',description:'Add or subtract hours and minutes from a clock time.',inputs:()=>`${field('start','Start time','09:30','time')}${field('hours','Hours',2,'number','min="0" max="100000" step="1"')}${field('minutes','Minutes',45,'number','min="0" max="59" step="1"')}${select('operation','Operation',[['add','Add'],['subtract','Subtract']])}`,calc:v=>{const t=v('start'),h=v('hours'),m=v('minutes');if(!/^\d\d:\d\d$/.test(t)||h<0||h>100000||m<0||m>59||!Number.isInteger(h)||!Number.isInteger(m))return 'Enter a valid time, whole hours, and 0–59 minutes.';const [sh,sm]=t.split(':').map(Number),delta=(h*60+m)*(v('operation')==='add'?1:-1),total=sh*60+sm+delta,days=Math.floor(total/1440),clock=((total%1440)+1440)%1440;return result(`${String(Math.floor(clock/60)).padStart(2,'0')}:${String(clock%60).padStart(2,'0')}`,'Resulting clock time',row('Day offset',days===0?'Same day':`${days>0?'+':''}${fmt(days)} day${Math.abs(days)===1?'':'s'}`)+row('Duration',`${fmt(h)} h ${fmt(m)} m`));}},
 {id:'leap',group:'Dates',title:'Leap Year Checker & Countdown',short:'Leap year & countdown',description:'Check a year and count down to its next leap day.',inputs:()=>`${field('year','Year',new Date().getFullYear(),'number','min="1" max="9999" step="1"')}`,calc:v=>{const y=v('year');if(!Number.isInteger(y)||y<1||y>9999)return 'Enter a whole year from 1 to 9999.';const leap=n=>n%4===0&&(n%100!==0||n%400===0);let next=Math.max(y,new Date().getFullYear());while(next<=9996&&(!leap(next)||Date.UTC(next,1,29)<Date.now()))next+=1;if(next>9996)return result(leap(y)?'Leap year':'Common year',`${y} has ${leap(y)?366:365} days`,row('Next leap day','Outside supported range'));const days=Math.ceil((Date.UTC(next,1,29)-Date.now())/day);return result(leap(y)?'Leap year':'Common year',`${y} has ${leap(y)?366:365} days`,row('Next leap day',`29 Feb ${next}`)+row('Days until then',fmt(days)));}},
 {id:'water',group:'Wellness',title:'Daily Water & Hydration Tracker',short:'Water tracker',description:'Track today’s intake locally in this browser.',inputs:()=>`${field('goal','Daily goal (ml)',2500,'number','min="0" max="10000" step="50"')}${field('glass','Glass size (ml)',250,'number','min="0" max="2000" step="25"')}<div class="quick-actions"><button class="action-button" type="button" data-water="add">Add glass</button><button class="action-button secondary" type="button" data-water="reset">Reset today</button></div>`,calc:(v,s)=>{const goal=v('goal'),glass=v('glass');if(goal<=0||goal>10000||glass<=0||glass>2000)return 'Enter a goal from 1–10,000 ml and glass size from 1–2,000 ml.';const total=s.water||0,pct=Math.min(100,total/goal*100);return result(`${fmt(total)} ml`,'Consumed today',row('Daily goal',`${fmt(goal)} ml`)+row('Progress',`${fmt(pct)}%`)+row('Remaining',`${fmt(Math.max(0,goal-total))} ml`),`<progress value="${Math.min(total,goal)}" max="${goal}" style="width:100%;margin-top:20px;accent-color:var(--green)">${fmt(pct)}%</progress>`);}}
];
const themeToggle = $('#theme-toggle');
const themeLabel = $('#theme-toggle-label');
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
const currentTheme = () => document.documentElement.dataset.theme || (systemTheme.matches ? 'dark' : 'light');
function syncThemeControl() {
  const next = currentTheme() === 'dark' ? 'Light' : 'Dark';
  themeLabel.textContent = `${next} mode`;
  themeToggle.setAttribute('aria-label', `Switch to ${next.toLowerCase()} mode`);
  $('meta[name="theme-color"]').content = currentTheme() === 'dark' ? '#171d19' : '#f6f5f1';
}
themeToggle.hidden = false;
themeToggle.addEventListener('click', () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('calciverse-theme', next); } catch {}
  syncThemeControl();
});
systemTheme.addEventListener('change', () => { if (!document.documentElement.dataset.theme) syncThemeControl(); });
syncThemeControl();
const grid=$('#tool-grid'),content=$('#tool-content'),category=$('#tool-category');let active=null,state={mode:'sip',water:0};
const productionOrigin = 'https://calciverse.com';
const toolPath = id => `/tools/${id}/`;
const pathTool = () => tools.find(tool => window.location.pathname === toolPath(tool.id) || window.location.pathname === `${toolPath(tool.id)}index.html`);
const storageKey=()=>`calciverse-water-${todayLocal()}`;
try{state.water=Math.max(0,Number(localStorage.getItem(storageKey()))||0)}catch{}
function renderTool(id) {
  const tool = tools.find(t => t.id === id) || tools[0];
  const seoData = {
    wealth: { title: "SIP & Lumpsum Wealth Predictor | CalciVerse", desc: "Calculate your maturity wealth value, estimated gains, and compounding growth curves instantly with our responsive investment predictor." },
    interest: { title: "Simple vs Compound Interest Visualizer | CalciVerse", desc: "Compare how simple interest scales against compounding frequency daily, monthly, or quarterly." },
    inflation: { title: "Inflation & Purchasing Power Calculator | CalciVerse", desc: "Estimate future costs and purchasing power using an annual inflation rate you choose." },
    tip: { title: "Tip & Split-Bill Calculator | CalciVerse", desc: "Quickly split dining or restaurant bills among groups and accurately compute tip additions." },
    percentage: { title: "Percentage Difference & Growth Calculator | CalciVerse", desc: "Instantly solve absolute percentage increases, declines, and symmetric value changes." },
    age: { title: "Age & Milestone Live Ticker | CalciVerse", desc: "Watch your precise chronological age update live down to the second and track your next birthday." },
    between: { title: "Days Between Dates & Business Days Calculator | CalciVerse", desc: "Calculate the exact calendar days, full weeks, and business days between any two targets." },
    'age-units': { title: "Age in Days, Weeks & Hours Converter | CalciVerse", desc: "Convert chronological life milestones into total elapsed days, weeks, or hours lived." },
    timezone: { title: "Multi-Timezone Grid Converter (IST, CST, EST) | CalciVerse", desc: "Coordinate international meetings instantly across major global business hubs using a reactive hour slider." },
    duration: { title: "Time Duration Adder & Subtractor | CalciVerse", desc: "Add or subtract hours and minutes from a clock time, with a clear day offset." },
    leap: { title: "Leap Year Checker & Countdown | CalciVerse", desc: "Verify leap years and keep a precise live day countdown to the next February 29th." },
    water: { title: "Daily Water & Hydration Tracker | CalciVerse", desc: "Track daily water intake against a goal you set, stored locally in your browser." }
  };
  const homePage = !pathTool();
  const data = homePage
    ? { title: "CalciVerse | Premium All-in-One Everyday Calculators", desc: "Twelve focused client-side tools for money, time, dates, and daily wellness." }
    : seoData[tool.id];
  const pageUrl = productionOrigin + (homePage ? '/' : toolPath(tool.id));
  document.title = data.title;
  let metaDesc = $('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    document.head.appendChild(metaDesc);
  }
  metaDesc.content = data.desc;
  let canonical = $('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = pageUrl;
  let ogTitle = $('meta[property="og:title"]');
  if (!ogTitle) {
    ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    document.head.appendChild(ogTitle);
  }
  ogTitle.content = data.title;
  let ogDesc = $('meta[property="og:description"]');
  if (!ogDesc) {
    ogDesc = document.createElement('meta');
    ogDesc.setAttribute('property', 'og:description');
    document.head.appendChild(ogDesc);
  }
  ogDesc.content = data.desc;
  let ogUrl = $('meta[property="og:url"]');
  if (!ogUrl) {
    ogUrl = document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url');
    document.head.appendChild(ogUrl);
  }
  ogUrl.content = pageUrl;
  active = tool;
  state.mode = 'sip';
  category.textContent = `${tool.group} / ${String(tools.indexOf(tool) + 1).padStart(2, '0')}`;
  content.innerHTML = `<div class="tool-heading"><h2>${tool.title}</h2><p>${tool.description}</p></div><div class="tool-body"><div><div class="input-panel">${tool.inputs()}</div><p class="error" id="input-error" role="status"></p></div><div class="output-panel" id="output"></div></div>`;
  grid.querySelectorAll('.tool-tile').forEach(button => {
    const selected = button.dataset.tool === tool.id;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-current', selected ? 'page' : 'false');
  });
  update();
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'view_item', {
      item_id: tool.id,
      item_name: tool.title,
      item_category: tool.group
    });
    console.log(`[CalciVerse Analytics View]: Fired item view event for tool id: ${tool.id}`);
  }
}
function update(){if(!active)return;const invalid=Array.from(content.querySelectorAll('input[type=number],input[type=range]')).some(el=>el.value===''||!el.validity.valid||!Number.isFinite(Number(el.value)));if(invalid){$('#input-error').textContent='Enter a valid value in every numeric field.';$('#output').innerHTML=result('—','Check your inputs');return}const value=id=>{const el=$(`#${id}`,content);if(!el)return NaN;if(el.type==='number'||el.type==='range')return el.value===''?NaN:Number(el.value);return el.value};const output=active.calc(value,state);const error=$('#input-error');if(typeof output==='string'&&!output.startsWith('<h3>')){error.textContent=output;$('#output').innerHTML=result('—','Check your inputs')}else{error.textContent='';$('#output').innerHTML=output}}
grid.innerHTML=tools.map((t,i)=>`<a class="tool-tile" href="${toolPath(t.id)}" data-tool="${t.id}" aria-current="false"><span class="tile-top"><span>${t.group}</span><span>${String(i+1).padStart(2,'0')}</span></span><span class="tile-title">${t.short}</span></a>`).join('');
const adRefreshInterval = 30000;
let lastAdRefresh = Date.now();
function monitorUserActivity() {
  const now = Date.now();
  if (document.visibilityState === 'hidden' || now - lastAdRefresh < adRefreshInterval) return;
  lastAdRefresh = now;
  window.CalciVerseAds?.refreshSidebarAd?.();
  window.CalciVerseAds?.refreshMidAd?.();
}
const scrollToWorkspace = () => $('#workspace').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
grid.addEventListener('click',e=>{const link=e.target.closest('[data-tool]');if(!link||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0)return;e.preventDefault();monitorUserActivity();history.pushState(null,'',toolPath(link.dataset.tool));renderTool(link.dataset.tool);scrollToWorkspace();});
content.addEventListener('input',e=>{monitorUserActivity();update()});
content.addEventListener('change',update);
content.addEventListener('click',e=>{const mode=e.target.closest('[data-mode]');if(mode){state.mode=mode.dataset.mode;content.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('selected',b===mode));$('#principal').previousElementSibling.textContent=state.mode==='sip'?'Monthly investment (₹)':'One-time investment (₹)';update()}const water=e.target.closest('[data-water]');if(water){if(water.dataset.water==='add'){const glass=Number($('#glass').value);if(!Number.isFinite(glass)||glass<=0)return;state.water+=glass}else state.water=0;try{localStorage.setItem(storageKey(),String(state.water))}catch{}update()}});
const hashTool = () => tools.find(tool => `#${tool.id}` === window.location.hash);
window.addEventListener('popstate', () => renderTool(pathTool()?.id || tools[0].id));
window.addEventListener('hashchange', () => {
  const tool = hashTool();
  if (tool) {
    history.replaceState(null, '', toolPath(tool.id));
    renderTool(tool.id);
    scrollToWorkspace();
  }
});
const legacyTool = hashTool();
if (legacyTool) history.replaceState(null, '', toolPath(legacyTool.id));
const initialTool = pathTool() || legacyTool;
renderTool(initialTool?.id || tools[0].id);
if (initialTool) requestAnimationFrame(() => requestAnimationFrame(scrollToWorkspace));
setInterval(()=>{if(active?.id==='age'||active?.id==='leap')update()},1000);
// Ad-provider integration hooks. Only call a provider's approved API after its policy and refresh eligibility are verified.
// Activity after 30 seconds calls these hooks; default hooks are inert. Connect only a provider that permits this refresh behavior. AdSense does not permit automatic ad refresh.
window.CalciVerseAds={refreshSidebarAd(){/* Connect a permitted provider refresh API here. */},refreshMidAd(){/* Connect a permitted provider refresh API here. */},refreshTopAd(){/* Connect a permitted provider refresh API here. */}};
