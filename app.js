/* ══════════════════════════════════════════════════════════════
   APP — 앱을 움직이는 부분입니다. 수업에서는 거의 손대지 않습니다.
   숙소 정보를 고치려면 content.js를 여세요.
══════════════════════════════════════════════════════════════ */

/* content.js에서 꺼 둔 화면은 아예 실리지 않습니다.
   그래서 없는 요소를 찾을 때가 있는데, 아래 세 도우미가 조용히 넘어가 줍니다. */
function $id(id){ return document.getElementById(id); }
function setText(id, v){ const e = $id(id); if(e) e.textContent = v; }
function setHTML(id, v){ const e = $id(id); if(e) e.innerHTML = v; }
function onId(id, ev, fn){ const e = $id(id); if(e) e.addEventListener(ev, fn); }

/* 동네 이름 — content.js의 house.area. 비어 있으면 '이 동네'로 부릅니다. */
const AREA    = (WMH.house && WMH.house.area)   || '이 동네';
const AREA_EN = (WMH.house && WMH.house.areaEn) || (WMH.house && WMH.house.area) || 'the neighbourhood';
const HOUSE_NAME = (WMH.house && WMH.house.name) || '';

/* ── view routing ── */
const views = document.querySelectorAll('.view');
const tabs  = document.querySelectorAll('[data-tab]');
function go(id){
  if(id!=='v-dev') restoreDev();
  views.forEach(v=>v.classList.toggle('on', v.id===id));
  tabs.forEach(t=>t.classList.toggle('on', t.dataset.go===id));
  window.scrollTo({top:0});
}

/* ── 기기 상세 화면: 카드 본문을 옮겼다가 되돌리는 방식 (원본 1곳 유지) ── */
let devHome=null, devBodyEl=null, devBackId='v-appl';
function restoreDev(){
  if(devBodyEl && devHome){ devHome.appendChild(devBodyEl); }
  devBodyEl=null; devHome=null;
}
window.__wmhDevRestore = restoreDev;
/* WeChat ID 탭하여 복사 (EN 전용 행) */
document.addEventListener('click', e=>{
  const w=e.target.closest('#chan-wechat'); if(!w) return;
  const id=(document.getElementById('wechat-id')||{}).textContent||'';
  if(!id) return;
  if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(id).catch(()=>{}); }
  else { const t=document.createElement('textarea'); t.value=id; document.body.appendChild(t); t.select();
    try{document.execCommand('copy');}catch(_){} document.body.removeChild(t); }
  const s=w.querySelector('.chan-s'); if(!s) return;
  const prev=s.innerHTML; s.textContent='Copied — search it in WeChat';
  setTimeout(()=>{ s.innerHTML=prev; },1600);
});
document.addEventListener('click', e=>{
  if(e.target.closest('#dev-back')) go(devBackId);
});
function openDev(card){
  restoreDev();
  const backView = card.closest('.view');
  devBackId = backView ? backView.id : 'v-appl';
  const t=card.querySelector('.dev-t'), s=card.querySelector('.dev-s');
  setHTML('dev-title', t ? t.innerHTML : '');
  const sub=document.getElementById('dev-sub');
  if(sub){
    if(s && s.textContent.trim()){ sub.innerHTML=s.innerHTML; sub.style.display=''; }
    else { sub.innerHTML=''; sub.style.display='none'; }
  }
  devHome=card; devBodyEl=card.querySelector('.dev-body');
  if(devBodyEl){ const _slot = $id('dev-slot'); if(_slot) _slot.appendChild(devBodyEl); }
  go('v-dev');
}
document.addEventListener('click', e=>{
  const b = e.target.closest('[data-go]');
  if(b){ go(b.dataset.go); }
  const acc = e.target.closest('[data-acc]');
  if(acc){ acc.closest('.li').classList.toggle('open'); }
  const acc2 = e.target.closest('[data-acc2]');
  if(acc2){ acc2.closest('.gsec').classList.toggle('open'); }
  const dev = e.target.closest('.dev-head');
  if(dev && !dev.dataset.go){ openDev(dev.closest('.dev')); }
  const fig = e.target.closest('.dev-fig.zoomable');
  if(fig){ openImgZoom(fig); }
});

/* ── image lightbox (탭하면 크게 보기) ── */
function ensureZoomLayer(){
  var z = document.getElementById('imgzoom');
  if(z) return z;
  z = document.createElement('div');
  z.className = 'imgzoom'; z.id = 'imgzoom';
  z.innerHTML = '<button class="iz-close" aria-label="닫기">✕</button>'+
    '<img alt=""><div class="iz-cap"></div>'+
    '<div class="iz-hint"><span class="kr">손가락으로 확대·축소 · 배경을 누르면 닫힘</span><span class="ja">指で拡大・縮小 · 背景をタップで閉じる</span>'+
    '<span class="en">Pinch to zoom · tap background to close</span></div>';
  document.body.appendChild(z);
  z.addEventListener('click', function(ev){
    if(ev.target === z || ev.target.classList.contains('iz-close')) closeImgZoom();
  });
  return z;
}
function openImgZoom(fig){
  var img = fig.querySelector('img');
  var cap = fig.querySelector('figcaption');
  var z = ensureZoomLayer();
  z.querySelector('img').src = img.src;
  z.querySelector('img').alt = img.alt || '';
  z.querySelector('.iz-cap').innerHTML = cap ? cap.innerHTML : '';
  z.classList.add('on');
  document.body.style.overflow = 'hidden';
}
function closeImgZoom(){
  var z = document.getElementById('imgzoom');
  if(z){ z.classList.remove('on'); document.body.style.overflow = ''; }
}
document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeImgZoom(); });

/* ── language ── */
const langbtn = document.getElementById('langbtn');

/* ── 언어 버튼은 쓸 언어가 둘 이상일 때만 보인다 ────────────────
   지금 화면에 담긴 말은 한국어뿐이라 버튼을 숨겨 둡니다.
   언어 바꾸기 기능 자체는 그대로 살아 있습니다.
   화면에 영어를 넣고 content.js의 languages에 'en'을 더하면
   버튼이 다시 나타납니다.                                        */
const USE_LANGS = (WMH.languages && WMH.languages.length) ? WMH.languages : ['ko'];
(function setupLangButton(){
  const pop = document.getElementById('lang-pop');
  if(pop){
    pop.querySelectorAll('[data-lang-pick]').forEach(b => {
      if(USE_LANGS.indexOf(b.dataset.langPick) === -1) b.style.display = 'none';
    });
  }
  if(langbtn && USE_LANGS.length < 2){
    langbtn.style.display = 'none';
    langbtn.setAttribute('aria-hidden', 'true');
  }
})();
const LANGS = ['ko','en','zh','ja'];
const LANGFLAG = { ko:'🇰🇷', en:'🇺🇸', zh:'🇨🇳', ja:'🇯🇵' };  // 버튼엔 현재 언어 국기
function curLang(){ return document.documentElement.getAttribute('data-lang') || 'ko'; }
function setLang(lang){
  document.documentElement.setAttribute('data-lang', lang);
  document.documentElement.lang = lang==='zh' ? 'zh-Hans' : lang;
  // 하위호환: 기존 body.en 참조 로직이 살아있도록 클래스도 동기화
  document.body.classList.toggle('en', lang==='en');
  langbtn.textContent = LANGFLAG[lang];
  document.querySelectorAll('[data-lang-pick]').forEach(b=>b.classList.toggle('cur', b.dataset.langPick===lang));
  if(typeof renderSpots==='function'){ const on=document.querySelector('.chip.on'); if(on) renderSpots(on.dataset.cat); }
  if(typeof drawMarkers==='function' && window.map){ const on=document.querySelector('.chip.on'); if(on) drawMarkers(on.dataset.cat); }
  if(window.tourMap && typeof drawTour==='function') drawTour(currentTourCourse());
  if(window._wxRerender) window._wxRerender();
  if(typeof tick==='function') tick();
  if(typeof updateEmergencyNum==='function') updateEmergencyNum(lang);
}
/* 초기 언어: 저장된 선택 > 폰 언어 자동 감지 > 한국어
   외국인 게스트가 자기 폰 언어로 자연스럽게 시작하도록 (게이트·앱 전체 적용) */
function detectLang(){
  /* 화면에 담아 둔 말 중에서만 고른다.
     지금은 한국어뿐이라 어느 나라 폰으로 열어도 한국어로 보인다.
     content.js의 languages에 'en'을 더하면 영어 폰은 영어로 열린다. */
  const use = (typeof USE_LANGS !== 'undefined' && USE_LANGS.length) ? USE_LANGS : ['ko'];
  const pick = l => use.indexOf(l) > -1 ? l : null;
  try{
    const saved = localStorage.getItem('wmh_lang');
    if(saved && pick(saved)) return saved;
  }catch(e){}
  const nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'ko';
  const l = nav.toLowerCase();
  const guess = l.indexOf('zh')===0 ? 'zh'
              : l.indexOf('ja')===0 ? 'ja'
              : l.indexOf('ko')===0 ? 'ko'
              : 'en';
  return pick(guess) || use[0];   // 준비된 말이 없으면 첫 번째 말로
}
/* 호스트 비상번호: 외국어 화면에선 국제형식(+82 10-...)으로 자동 전환
   119·112는 로밍폰도 그대로 걸리므로 손대지 않음 */
function updateEmergencyNum(lang){
  const link=document.getElementById('em-host-link'), num=document.getElementById('em-host-num');
  if(!link||!num) return;
  const raw = (WMH.contact && WMH.contact.phone) || '';
  if(!raw){ link.style.display='none'; return; }   // 번호가 없으면 버튼을 숨긴다
  link.style.display='';
  const d = raw.replace(/[^0-9]/g,'');
  if(lang==='ko'){ link.href='tel:'+d; num.textContent=raw; }
  else {
    const intl = d.replace(/^0/, '+82 ');
    link.href='tel:'+d.replace(/^0/,'+82'); num.textContent=intl;
  }
}
/* JA 폴백 준비: .ja 형제를 가진 부모에 has-ja 표시 (미번역 요소는 EN 표시) */
document.querySelectorAll('.ja').forEach(el=>{ if(el.parentElement) el.parentElement.classList.add('has-ja'); });
document.documentElement.setAttribute('data-lang', detectLang());
langbtn.textContent = LANGFLAG[curLang()];
document.querySelectorAll('[data-lang-pick]').forEach(b=>b.classList.toggle('cur', b.dataset.langPick===curLang()));
if(typeof updateEmergencyNum==='function') updateEmergencyNum(curLang());
/* 국기 팝오버: 한 번의 탭으로 원하는 언어로 (v11.9) */
const langPop = document.getElementById('lang-pop');
langbtn.addEventListener('click', e=>{ e.stopPropagation(); langPop.classList.toggle('on'); });
document.querySelectorAll('[data-lang-pick]').forEach(b=>b.addEventListener('click', e=>{
  e.stopPropagation();
  const pick = b.dataset.langPick;
  setLang(pick);
  try{ localStorage.setItem('wmh_lang', pick); }catch(err){}
  langPop.classList.remove('on');
}));
document.addEventListener('click', ()=>langPop.classList.remove('on'));

/* ── clock & greeting ── */
const GUEST = { name:'', checkin:null, checkout:null, nights:0, nth:0, daysToCheckin:0, isCheckoutDay:false, code:'', door:'' };
/* 두 yyyy-MM-dd 문자열 사이의 일수 차 (UTC 자정 기준이라 DST·시차 영향 없음) */
function dayDiff(a, b){
  const pa = a.split('-').map(Number), pb = b.split('-').map(Number);
  const ua = Date.UTC(pa[0], pa[1]-1, pa[2]), ub = Date.UTC(pb[0], pb[1]-1, pb[2]);
  return Math.round((ub - ua) / 86400000);
}
let GATE_PIN = '';  // 게이트 통과한 뒷4자리 (예약 자동 매칭에 사용)
function tick(){
  const n = new Date();
  const _lt = curLang();
  const en = _lt==='en';
  const days = _lt==='zh' ? ['日','一','二','三','四','五','六']
             : _lt==='ja' ? ['日','月','火','水','木','金','土']
             : en ? ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
             : ['일','월','화','수','목','금','토'];
  const mos  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const hh = String(n.getHours()).padStart(2,'0'), mm = String(n.getMinutes()).padStart(2,'0');
  const line = _lt==='zh'
    ? `${n.getMonth()+1}月${n.getDate()}日 (周${days[n.getDay()]}) · ${hh}:${mm}`
    : _lt==='ja'
    ? `${n.getMonth()+1}月${n.getDate()}日（${days[n.getDay()]}）· ${hh}:${mm}`
    : en
    ? `${days[n.getDay()]}, ${mos[n.getMonth()]} ${n.getDate()} · ${hh}:${mm}`
    : `${n.getMonth()+1}.${n.getDate()} (${days[n.getDay()]}) · ${hh}:${mm}`;
  setText('clock',  line);
  setText('clock2', line);
  const h = n.getHours();
  const g = document.getElementById('greet');
  const nm = GUEST.name;
  let kr = h<6?'고요한 밤이에요':h<12?'좋은 아침이에요':h<18?'좋은 오후예요':'좋은 저녁이에요';
  let eng= h<6?'A quiet night':h<12?'Good morning':h<18?'Good afternoon':'Good evening';
  let zh = h<6?'夜深了':h<12?'早上好':h<18?'下午好':'晚上好';
  let ja = h<6?'静かな夜ですね':h<12?'おはようございます':h<18?'こんにちは':'こんばんは';
  // 머무는 밤을 알면 시점을 담은 인사 (체크인 전 → 당일 → 투숙 중 순)
  if(GUEST.daysToCheckin > 0){
    // 아직 입실 전 — 남은 일수로 설렘을 담은 인사
    const d = GUEST.daysToCheckin;
    if(d===1){ kr=`내일, ${AREA}에서 만나요`; eng=`See you in ${AREA_EN} tomorrow`; zh='明天，在付岩洞见'; ja='明日、付岩洞でお会いしましょう'; }
    else if(d<=30){ kr=`${AREA}까지 ${d}일 남았어요`; eng=`${d} days until ${AREA_EN}`; zh=`距离付岩洞还有${d}天`; ja=`付岩洞まであと${d}日です`; }
    else {
      /* 한 달 넘게 남은 예약은 날짜 카운트 대신 달로 안내 (v14.0) */
      const ci = GUEST.checkin ? GUEST.checkin.split('-') : null;
      if(ci){
        const mo = Number(ci[1]), dy = Number(ci[2]);
        const moEn = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][mo-1];
        kr=`${mo}월 ${dy}일, ${AREA}에서 만나요`; eng=`See you in ${AREA_EN} on ${moEn} ${dy}`; zh=`${mo}月${dy}日，在付岩洞见`; ja=`${mo}月${dy}日、付岩洞でお会いしましょう`;
      } else {
        kr=`${AREA}에서 기다리고 있을게요`; eng=`We will be waiting in ${AREA_EN}`; zh='我们在付岩洞等您'; ja='付岩洞でお待ちしています';
      }
    }
  }
  else if(GUEST.isCheckoutDay){
    // 오늘이 퇴실일 — 밤 인사보다 우선. 시간대 관계없이 배웅 인사
    kr=`오늘, ${AREA}을 떠나는 날이에요`; eng=`Today you leave ${AREA_EN}`; zh='今天要离开付岩洞了'; ja='今日、付岩洞を発つ日ですね';
  }
  else if(GUEST.nth && GUEST.nights){
    const nth=GUEST.nth, tot=GUEST.nights;
    const ord=['','첫','둘','셋','넷','다섯','여섯','일곱','여덟','아홉','열'];
    if(nth>=tot && tot>1){ kr=`${AREA}에서의 마지막 밤이에요`; eng=`Your last night in ${AREA_EN}`; zh='在付岩洞的最后一晚'; ja='付岩洞での最後の夜です'; }
    else if(nth===1){ kr=`${AREA}에 잘 오셨어요`; eng=`Welcome to ${AREA_EN}`; zh='欢迎来到付岩洞'; ja='付岩洞へようこそ'; }
    else { kr=`${AREA}에서의 ${ord[nth]||nth}째 밤이에요`; eng=`Night ${nth} in ${AREA_EN}`; zh=`在付岩洞的第${nth}晚`; ja=`付岩洞での${nth}日目の夜です`; }
  }
  if(nm){
    kr  = `${nm}님,\n${kr}`;
    eng = `${eng},\n${nm}`;
    zh  = `${nm},\n${zh}`;
    ja  = `${nm}様、\n${ja}`;
  }
  g.innerHTML = `<span class="kr">${kr.replace(/\n/,'<br>')}</span><span class="en">${eng.replace(/\n/,'<br>')}</span><span class="zh">${zh.replace(/\n/,'<br>')}</span><span class="ja">${ja.replace(/\n/,'<br>')}</span>`;
  g.classList.add('has-ja');
  updateCheckoutBanner();
}
/* 퇴실 배너 상태를 한곳에서 확정 (v13.7) — tick·서버응답 어디서 불려도 동일 결과 */
function updateCheckoutBanner(){
  const coNote = document.getElementById('checkout-note');
  if(coNote){
    if(GUEST.isCheckoutDay){
      coNote.hidden = false;
      const coT = document.getElementById('co-time');
      const outEl = document.getElementById('q-out');
      if(coT && outEl && outEl.textContent.trim()) coT.textContent = outEl.textContent.trim();
    } else {
      coNote.hidden = true;
    }
  }
  /* 체크인 전 안내 배너 (v13.9) — 입실 전 내내 노출 */
  const ciNote = document.getElementById('checkin-note');
  if(ciNote){
    const d = GUEST.daysToCheckin;
    if(d > 0){
      ciNote.hidden = false;
      const w = document.getElementById('ci-when');
      if(w){
        let t;
        if(d===1) t = {kr:'내일 체크인', en:'Check-in tomorrow', zh:'明天入住', ja:'明日チェックイン'};
        else if(d<=30) t = {kr:`${d}일 후 체크인`, en:`Check-in in ${d} days`, zh:`${d}天后入住`, ja:`${d}日後にチェックイン`};
        else {
          /* 한 달 넘게 남으면 날짜로 안내 (v14.0) */
          const ci = GUEST.checkin ? GUEST.checkin.split('-') : null;
          if(ci){
            const mo=Number(ci[1]), dy=Number(ci[2]);
            const moEn=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][mo-1];
            t = {kr:`${mo}월 ${dy}일 체크인`, en:`Check-in ${moEn} ${dy}`, zh:`${mo}月${dy}日入住`, ja:`${mo}月${dy}日チェックイン`};
          } else {
            t = {kr:'체크인', en:'Check-in', zh:'入住', ja:'チェックイン'};
          }
        }
        w.innerHTML = `<span class="kr">${t.kr}</span><span class="en">${t.en}</span><span class="zh">${t.zh}</span><span class="ja">${t.ja}</span>`;
      }
    } else {
      ciNote.hidden = true;
    }
  }
}
tick(); setInterval(tick, 30000);

/* ── 날씨 (Open-Meteo · 키 없이 무료). 좌표가 없으면 건너뛴다 ── */
(function(){
  var WX_ICON = { // WMO weather_code → 이모지
    0:'☀️',1:'🌤️',2:'⛅',3:'☁️',
    45:'🌫️',48:'🌫️',
    51:'🌦️',53:'🌦️',55:'🌦️',56:'🌧️',57:'🌧️',
    61:'🌧️',63:'🌧️',65:'🌧️',66:'🌧️',67:'🌧️',
    71:'🌨️',73:'🌨️',75:'❄️',77:'❄️',
    80:'🌦️',81:'🌧️',82:'⛈️',
    85:'🌨️',86:'❄️',
    95:'⛈️',96:'⛈️',99:'⛈️'
  };
  function emoji(code){ return WX_ICON[code] || '🌡️'; }
  function render(cur, tmr){
    var el = document.getElementById('wx');
    if(!el) return;
    var _lw = curLang();
    var todayLab = _lw==='zh' ? '现在' : _lw==='ja' ? 'いま' : _lw==='en' ? 'now' : '지금';
    var tmrLab   = _lw==='zh' ? '明天' : _lw==='ja' ? '明日' : _lw==='en' ? 'tmr' : '내일';
    el.innerHTML =
      '<span class="wx-lab">'+todayLab+'</span>'+
      '<span class="wx-em">'+emoji(cur.code)+'</span>'+
      '<span class="wx-temp">'+Math.round(cur.temp)+'°</span>'+
      '<span class="wx-sep">·</span>'+
      '<span class="wx-lab">'+tmrLab+'</span>'+
      '<span class="wx-em">'+emoji(tmr.code)+'</span>'+
      '<span class="wx-temp">'+Math.round(tmr.temp)+'°</span>';
    el.hidden = false;
    el._data = {cur:cur, tmr:tmr};
  }
  window._wxRerender = function(){
    var el = document.getElementById('wx');
    if(el && el._data) render(el._data.cur, el._data.tmr);
  };
  if(!hasCoord(WMH.center)) return;   // 좌표가 없으면 날씨를 부르지 않는다
  var url = 'https://api.open-meteo.com/v1/forecast'
    + '?latitude=' + WMH.center.lat + '&longitude=' + WMH.center.lng
    + '&current=temperature_2m,weather_code'
    + '&daily=weather_code,temperature_2m_max'
    + '&timezone=Asia%2FSeoul&forecast_days=2';
  fetch(url, {cache:'no-store'})
    .then(function(r){ return r.ok ? r.json() : Promise.reject(); })
    .then(function(d){
      if(!d || !d.current || !d.daily) return;
      var cur = { temp: d.current.temperature_2m, code: d.current.weather_code };
      // daily[0]=오늘, daily[1]=내일 — 내일 최고기온
      var tmr = { temp: d.daily.temperature_2m_max[1], code: d.daily.weather_code[1] };
      render(cur, tmr);
    })
    .catch(function(){ /* 실패 시 조용히 숨김 유지 */ });
})();

/* ── config injection ── */
setText('wifi-ssid',   WMH.wifi.ssid);
setText('wifi-pw',     WMH.wifi.pw);
setText('tk-in-time',  WMH.checkin);
setText('tk-out-time', WMH.checkout);
setText('q-out',       WMH.checkout);
for(const [k,v] of Object.entries({
  'lnk-delivery':WMH.links.delivery,'lnk-taxi':WMH.links.taxi
})){ const el=document.getElementById(k); if(el) el.href=v; }

/* ── 호스트 연락 채널 (비어 있으면 버튼 숨김) ── */
(function(){
  const c = WMH.contact || {};
  const set = (id, url) => {
    const el = document.getElementById(id);
    if(!el) return;
    if(url){ el.href = url; el.style.display = ''; }
    else   { el.style.display = 'none'; }
  };
  const digits = s => (s||'').replace(/[^0-9]/g,'');
  const tel   = c.phone    ? 'tel:'+digits(c.phone) : '';
  const wa    = c.whatsapp ? 'https://wa.me/'+digits(c.whatsapp) : '';
  set('chan-phone-kr', tel);
  set('chan-phone-en', tel);
  set('chan-kakao-kr', c.kakao || '');
  set('chan-kakao-en', c.kakao || '');
  set('chan-wa',       wa);
  set('chan-line',     c.line || '');
  const w = document.getElementById('chan-wechat');
  if(w){
    if(c.wechat){ const idEl=document.getElementById('wechat-id'); if(idEl) idEl.textContent=c.wechat; w.style.display=''; }
    else { w.style.display='none'; }
  }
})();

/* EN 모드 배달 링크 (있을 때만 버튼 표시) */
(function(){
  const url = WMH.links.deliveryForeign;
  if(url){
    const a=document.getElementById('lnk-deliv-foreign');
    const w=document.getElementById('wrap-deliv-foreign');
    if(a&&w){ a.href=url; w.style.display='block'; }
  }
})();

/* 주소 복사 버튼 */
document.addEventListener('click', e=>{
  const b=e.target.closest('.gcopy');
  if(!b || !b.dataset.addr) return;
  const txt=b.dataset.addr;
  const done=()=>{ b.classList.add('done');
    const ic=b.querySelector('.gcopy-ic');
    const _lc=curLang();
    ic.innerHTML = _lc==='zh'?'<span class="zh">已复制 ✓</span>':_lc==='ja'?'<span class="ja">コピーしました ✓</span>':_lc==='en'?'<span class="en">Copied ✓</span>':'<span class="kr">복사됨 ✓</span>';
    setTimeout(()=>{ b.classList.remove('done'); ic.innerHTML='<span class="kr">복사</span><span class="en">Copy</span><span class="zh">复制</span><span class="ja">コピー</span>'; },1600);
  };
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(txt).then(done).catch(done);
  } else {
    const t=document.createElement('textarea'); t.value=txt; document.body.appendChild(t); t.select();
    try{document.execCommand('copy');}catch(_){}
    document.body.removeChild(t); done();
  }
});

/* 배달 앱 바로가기 — 주소 자동 복사 후 앱 열기 (미설치 시 스토어) */
document.addEventListener('click', e=>{
  const b=e.target.closest('.gapp[data-app]');
  if(!b || b.classList.contains('done')) return;
  const scope=b.closest('.view')||document;
  const src=(b.closest('.kr,.en,.zh')||scope).querySelector('.gcopy[data-addr]')||scope.querySelector('.gcopy[data-addr]');
  const addr=src ? src.dataset.addr : '';
  if(addr){
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(addr).catch(()=>{});
    } else {
      const t=document.createElement('textarea'); t.value=addr; document.body.appendChild(t); t.select();
      try{document.execCommand('copy');}catch(_){}
      document.body.removeChild(t);
    }
  }
  const app=b.dataset.app;
  const prev=b.textContent;
  b.classList.add('done');
  b.textContent = curLang()==='zh'?'地址已复制':curLang()==='ja'?'住所をコピーしました':curLang()==='en'?'Address copied':'주소 복사됨';
  const android=/android/i.test(navigator.userAgent);
  const open=()=>{
    if(app==='ceats'){
      /* 배달앱 링크는 content.js의 links.delivery에 넣는다 */
      const u = (WMH.links && WMH.links.delivery) || '';
      if(u && u !== '#') location.href = u;
      return;
    }
    /* 배달의민족 */
    if(android){
      location.href='intent://#Intent;scheme=baemin;package=com.sampleapp;S.browser_fallback_url='+
        encodeURIComponent('https://play.google.com/store/apps/details?id=com.sampleapp')+';end';
    } else {
      location.href='https://www.baemin.com/';
    }
  };
  setTimeout(()=>{ b.textContent=prev; b.classList.remove('done'); open(); },700);
});

/* 택시 앱 바로가기 — 주소 자동 복사 후 앱 열기 (미설치 시 스토어) */
const HOUSE_LAT=WMH.center.lat, HOUSE_LNG=WMH.center.lng;
document.addEventListener('click', e=>{
  const b=e.target.closest('.gapp[data-ride]');
  if(!b || b.classList.contains('done')) return;
  const scope=b.closest('.view')||document;
  const src=(b.closest('.kr,.en,.zh')||scope).querySelector('.gcopy[data-addr]');
  const addr=src ? src.dataset.addr : '';
  if(addr){
    if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(addr).catch(()=>{}); }
    else { const t=document.createElement('textarea'); t.value=addr; document.body.appendChild(t); t.select();
      try{document.execCommand('copy');}catch(_){} document.body.removeChild(t); }
  }
  const app=b.dataset.ride, prev=b.textContent, isEn=document.body.classList.contains('en'), _lr=curLang();
  b.classList.add('done');
  b.textContent = _lr==='zh' ? '地址已复制' : _lr==='ja' ? '住所をコピーしました' : isEn ? 'Address copied' : '주소 복사됨';
  const android=/android/i.test(navigator.userAgent);
  const open=()=>{
    if(app==='uber'){
      location.href='https://m.uber.com/ul/?action=setPickup&pickup[latitude]='+HOUSE_LAT+
        '&pickup[longitude]='+HOUSE_LNG+'&pickup[nickname]='+encodeURIComponent(HOUSE_NAME||'Stay');
      return;
    }
    if(app==='kride'){
      if(android){
        location.href='intent://#Intent;scheme=kride;package=com.kakaomobility.kride;S.browser_fallback_url='+
          encodeURIComponent('https://play.google.com/store/apps/details?id=com.kakaomobility.kride')+';end';
      } else {
        location.href='https://www.kakaomobility.com/k-ride';
      }
      return;
    }
    /* 카카오 T */
    if(android){
      location.href='intent://#Intent;scheme=kakaot;package=com.kakao.taxi;S.browser_fallback_url='+
        encodeURIComponent('https://play.google.com/store/apps/details?id=com.kakao.taxi')+';end';
    } else {
      location.href='https://apps.apple.com/kr/app/id981110422';
    }
  };
  setTimeout(()=>{ b.textContent=prev; b.classList.remove('done'); open(); },700);
});

/* ── 예약 자동 연동 (에어비앤비 iCal → /api/stay) ── */
function fmtDay(dstr, en){
  const [y,m,d] = dstr.split('-').map(Number);
  const mos = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return en ? `${mos[m-1]} ${d}` : `${m}월 ${d}일`;
}
function fillTicket(s){
  if(s.checkin) GUEST.checkin=s.checkin;
  if(s.checkout) GUEST.checkout=s.checkout;
  if(s.nights) GUEST.nights=s.nights;
  if(s.door) GUEST.door=s.door;
  if(s.checkin){
    setHTML('tk-in-day',
      `<span class="kr">${fmtDay(s.checkin,false)}</span><span class="en">${fmtDay(s.checkin,true)}</span>`);
  }
  if(s.checkout){
    setHTML('tk-out-day',
      `<span class="kr">${fmtDay(s.checkout,false)}</span><span class="en">${fmtDay(s.checkout,true)}</span>`);
  }
  if(s.nights){
    setHTML('tk-nights',
      `<span class="kr">${s.nights}박</span><span class="en">${s.nights} NIGHT${s.nights>1?'S':''}</span><span class="ja">${s.nights}泊</span>`);
  }
  /* 방 표기는 content.js의 house.stayType에서 온다 — 내부 예약코드(s.code)는 게스트에게 보이지 않는다 */
  if(s.door && WMH.stay.showDoorCode){
    const el = document.getElementById('door-code');
    if(el){ el.textContent = s.door; const w=el.closest('.doorwrap'); if(w) w.style.display='block'; }
  }
  // 뒷4자리를 알면 실제 도어락 번호를 바로 표시 (게스트가 조합 안 해도 되게)
  fillLockCodes(s.door);
}
/* 대문=00+뒷4자리, 현관문=0+뒷4자리. 번호를 알면 완성형으로, 모르면 안내형 유지 */
function fillLockCodes(door){
  door = (door||GATE_PIN||GUEST.door||'').trim();
  const g=document.getElementById('lock-gate'), d=document.getElementById('lock-door'), ex=document.getElementById('lock-ex');
  if(!g||!d) return;
  if(/^\d{4}$/.test(door)){
    g.innerHTML = `<b class="gkey">00${door}</b>`;
    d.innerHTML = `<b class="gkey">00${door}</b>`;
    if(ex) ex.style.display='none';  // 실제 번호가 있으면 예시는 불필요
  }
}
async function loadStay(){
  const q = new URLSearchParams(location.search);
  GUEST.name = (q.get('name')||'').trim();
  /* 배너는 기본 숨김에서 출발 — 서버가 확정할 때만 켜진다 (v13.8) */
  { const _co = document.getElementById('checkout-note'); if(_co) _co.hidden = true;
    const _ci = document.getElementById('checkin-note');  if(_ci) _ci.hidden = true; }
  tick(); // 이름 즉시 반영
  // 1) 링크에 날짜가 직접 있으면 그대로 사용 (서버 없이 수동/미리보기)
  if(q.get('in') && q.get('out')){
    const ci=q.get('in'), co=q.get('out');
    const nights = Math.max(1, Math.round((new Date(co)-new Date(ci))/86400000));
    fillTicket({checkin:ci, checkout:co, nights, code:q.get('code')||'', door:q.get('door')||''});
    return;
  }
  // 2) 예약 조회는 서버(/api/stay)가 전담 — 시트 주소·게스트 목록이 클라이언트에 노출되지 않음 (v12.8)
  //    예비 게스트 모드(PV)에선 호출하지 않음. 링크 파라미터가 없으면 게이트 통과 번호(GATE_PIN) 사용.
  const PV2 = new URLSearchParams(location.search).get('preview')==='1';
  const key = PV2 ? ''
            : q.get('code') ? 'code='+encodeURIComponent(q.get('code'))
            : q.get('p')    ? 'p='+encodeURIComponent(q.get('p'))
            : GATE_PIN      ? 'p='+encodeURIComponent(GATE_PIN)
            : '';
  if(key && WMH.stay.endpoint){
    try{
      const r = await fetch(`${WMH.stay.endpoint}?${key}`, {cache:'no-store'});
      if(r.ok){
        const s = await r.json();
        if(s && s.found){
          if(s.name && !GUEST.name) GUEST.name = s.name;
          GUEST.nights = s.nights || 0;
          GUEST.checkout = s.checkout || null;
          GUEST.checkin = s.checkin || null;
          /* 오늘 날짜(yyyy-MM-dd)를 한국 시간대(Asia/Seoul) 기준으로 — 기기 시간대·UTC 영향 배제 (v13.4) */
          const todayStr = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Seoul', year:'numeric', month:'2-digit', day:'2-digit'}).format(new Date());
          /* 체크인 전이면 남은 일수(양수), 투숙 중·후면 0 이하 (v13.6) */
          GUEST.daysToCheckin = (todayStr < s.checkin) ? dayDiff(todayStr, s.checkin) : 0;
          GUEST.isCheckoutDay = (todayStr === s.checkout) && (todayStr >= s.checkin);
          GUEST.nth = (todayStr >= s.checkin && todayStr <= s.checkout)
            ? Math.min(GUEST.nights, Math.max(1, dayDiff(s.checkin, todayStr)+1)) : 0;
          tick();
          fillTicket(s);
          updateCheckoutBanner();   // 서버 응답 확정 후 배너 상태 명시 갱신 (v13.7)
        }
      }
    }catch(e){ /* 실패 시 기본 인사로 자연스럽게 폴백 */ }
  }
}
/* 간단 CSV 파서 (따옴표·쉼표 처리) */
function parseCsv(text){
  const rows=[]; let row=[], cell='', q=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(q){
      if(c==='"'){ if(text[i+1]==='"'){cell+='"';i++;} else q=false; }
      else cell+=c;
    }else{
      if(c==='"') q=true;
      else if(c===','){ row.push(cell); cell=''; }
      else if(c==='\n'){ row.push(cell); rows.push(row); row=[]; cell=''; }
      else if(c==='\r'){ }
      else cell+=c;
    }
  }
  if(cell||row.length){ row.push(cell); rows.push(row); }
  return rows;
}

/* ═══ 로그인 게이트 ═══
   · ?open=1 (또는 편집/호스트 모드) → 게이트 없이 열림 (홍보·커뮤니티용)
   · 그 외 → 예약자 뒷 4자리 입력. 한 번 통과하면 그 폰이 기억(localStorage). */
const GATE_LS = 'wmh_pin';
(function initGate(){
  const q = new URLSearchParams(location.search);
  const IS_PREVIEW = q.get('preview')==='1';   // 예비 게스트 모드: 게이트 없이 열되 보안 정보 숨김
  if(IS_PREVIEW) document.documentElement.setAttribute('data-preview','1');
  if(IS_PREVIEW){
    const mask = '<span class="kr">예약 후 안내</span><span class="en">After booking</span><span class="zh">预订后提供</span><span class="ja">ご予約後にご案内</span>';
    const ss1=document.getElementById('wifi-ssid'), pw1=document.getElementById('wifi-pw');
    if(ss1) ss1.innerHTML = mask;
    if(pw1) pw1.innerHTML = '';
  }
  /* 예약 연동(stay.endpoint)이 없으면 확인할 방법이 없으므로 게이트를 열어 둔다.
     content.js에 endpoint를 넣으면 그때부터 뒷 4자리를 묻는다. */
  const NO_STAY = !WMH.stay || !WMH.stay.endpoint;
  const bypass = NO_STAY || IS_PREVIEW || q.get('open')==='1' || q.has('edit') || q.has('host') || q.get('p');
  if(bypass){
    // 링크에 p=뒷4자리가 있으면 기억만 해두고 통과
    if(q.get('p') && /^\d{4}$/.test(q.get('p'))){ try{localStorage.setItem(GATE_LS,q.get('p'));}catch(e){} }
    loadStay(); return; // 게이트 표시 안 함
  }
  // 이미 통과한 폰이면 저장된 번호로 자동 입장
  let saved=''; try{ saved=localStorage.getItem(GATE_LS)||''; }catch(e){}
  if(/^\d{4}$/.test(saved)){ GATE_PIN=saved; loadStay(); setTimeout(()=>fillLockCodes(),100); return; }
  // 게이트 표시
  const gate=document.getElementById('gate');
  gate.style.display='grid';
  document.getElementById('app').style.display='none';
  const inp=document.getElementById('gate-pin'), go=document.getElementById('gate-go'), err=document.getElementById('gate-err');
  setTimeout(()=>inp.focus(),200);
  async function submit(){
    const pin=(inp.value||'').trim();
    if(!/^\d{4}$/.test(pin)){ shake(); return; }
    go.disabled=true;
    const ok=await verifyPin(pin);
    go.disabled=false;
    if(ok){
      try{localStorage.setItem(GATE_LS,pin);}catch(e){}
      GATE_PIN=pin;
      fillLockCodes(pin);
      gate.style.display='none';
      document.getElementById('app').style.display='';
      loadStay(); // 통과한 번호로 예약 반영
    }else{ shake(); err.style.display='block'; }
  }
  function shake(){ gate.classList.add('shake'); setTimeout(()=>gate.classList.remove('shake'),400); }
  go.addEventListener('click', submit);
  inp.addEventListener('keydown', e=>{ if(e.key==='Enter') submit(); err.style.display='none'; });

/* 티맵 길찾기(v11.8) — tmap://route 스킴, Android는 intent+스토어 폴백
   스킴 출처: 개발자 커뮤니티 검증(goalname/goalx/goaly 파라미터, iOS·Android 공통) */
document.querySelectorAll('[data-tmap]').forEach(a=>a.addEventListener('click', e=>{
  e.preventDefault();
  if(WMH.center.lat==null || WMH.center.lng==null) return;   // 좌표가 없으면 길찾기를 열지 않는다
  const q = 'goalname='+encodeURIComponent(HOUSE_NAME||'Stay')+'&goalx='+WMH.center.lng+'&goaly='+WMH.center.lat;
  if(/android/i.test(navigator.userAgent)){
    location.href = 'intent://route?'+q+'#Intent;scheme=tmap;package=com.skt.tmap.ku;S.browser_fallback_url='+
      encodeURIComponent('https://play.google.com/store/apps/details?id=com.skt.tmap.ku')+';end';
  } else {
    location.href = 'tmap://route?'+q;
  }
}));
  inp.addEventListener('input', ()=>{ inp.value=inp.value.replace(/\D/g,'').slice(0,4); });
  // 호스트 문의: 연락 화면으로
  document.getElementById('gate-help').addEventListener('click', e=>{
    e.preventDefault(); gate.style.display='none'; document.getElementById('app').style.display='';
    loadStay(); go('v-con');
  });
})();
/* 뒷4자리 검증 — 서버(/api/stay)에 조회. 게스트 목록이 브라우저로 내려오지 않음 (v12.8) */
async function verifyPin(pin){
  if(!WMH.stay.endpoint) return true;   // 엔드포인트 미설정 시 막지 않음(안전 폴백)
  try{
    const r = await fetch(`${WMH.stay.endpoint}?p=${encodeURIComponent(pin)}`, {cache:'no-store'});
    if(!r.ok) return true;              // 서버 오류 시 게스트를 막지 않음
    const j = await r.json();
    return !!(j && j.found);
  }catch(e){ return true; }             // 네트워크 오류 시 막지 않음
}

/* ── discover ── */
const spotsEl = document.getElementById('spots');
const PIN_ICONS = {
  eat:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 2v20M5 2v6a2 2 0 0 0 4 0V2"/><path d="M17 2c-1.7 0-3 2-3 5s1.3 4 3 4v11"/></svg>',
  drink:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h12v3a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V8z"/><path d="M17 9h2a2 2 0 0 1 0 4h-2"/><path d="M8 2v2.5M11 2v2.5M14 2v2.5"/></svg>',
  see:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.4"/><path d="M21 16l-5-5-7 7"/></svg>',
  experience:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z"/></svg>',
  shop:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>'
};
const CATLAB = {eat:{kr:'식사',en:'EAT',zh:'美食'},drink:{kr:'카페',en:'DRINK',zh:'咖啡'},see:{kr:'볼거리',en:'SEE',zh:'看点'},experience:{kr:'체험',en:'DO',zh:'体验'},shop:{kr:'장보기',en:'SHOP',zh:'购物'}};
/* 스팟 이름·부제: zh(kz/skz) 없으면 en으로 폴백 */
function spotName(s){ const l=curLang(); return l==='zh'?(s.kz||s.en):l==='ja'?(s.ja||s.en):l==='en'?s.en:s.kr; }
function walkLabel(s){ const l=curLang(); return l==='zh'?`步行${s.walk.replace('분','分')}`:l==='ja'?`徒歩${s.walk.replace('분','分')}`:l==='en'?`${s.walk.replace('분','m')} walk`:`도보 ${s.walk}`; }
const DOW = { kr:['월','화','수','목','금','일순서'], };
const DOWKR = ['월','화','수','목','금','토','일'];
/* 영업시간 요약: 오늘 강조 + 휴무 안내. hrs 없으면 패널 자체를 접이 대상에서 제외 */
function hoursHTML(s){
  const l = curLang();
  const gmap = `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`;
  /* KR: 네이버지도 검색 (가게 페이지·리뷰까지 열림) / EN·ZH: 구글맵 — ZH는 추후 협의 반영 */
  const nmap = `https://map.naver.com/p/search/${encodeURIComponent((AREA==='이 동네'?'':AREA+' ')+s.kr)}`;
  /* ZH도 네이버지도 — 중국 여행자들이 한국에서 실제로 쓰는 앱 (중국어 인터페이스 지원) */
  const mapUrl = (l==='ko'||l==='zh') ? nmap : gmap;
  const maps = l==='zh'?'在NAVER地图中打开 ↗':l==='ja'?'マップで開く ↗':l==='en'?'Open in Maps ↗':'네이버 지도에서 열기 ↗';
  const photo = s.ph ? `<img class="spot-photo" src="img/spots/${s.ph}.jpg" alt="${s.kr}" loading="lazy" onerror="this.style.display='none'">` : '';
  /* 호스트 큐레이션 - 언어별 데이터(curen/curzh/curja)가 있으면 쓰고, 없으면 한국어(cur)로 폴백 */
  const CURL_ALL = {
    ko: ['분위기','추천','이런 분께'],
    en: ['Vibe','Try','Good for'],
    zh: ['氛围','推荐','适合'],
    ja: ['雰囲気','おすすめ','こんな方に']
  };
  const CURL = CURL_ALL[l] || CURL_ALL.ko;
  const curArr = (l!=='ko' && s['cur'+l]) || s.cur;
  const cur = curArr ? `<div class="cur-box">`+curArr.map((v,i)=>`<div class="cur-row"><span class="cur-l">${CURL[i]}</span><span class="cur-v">${v}</span></div>`).join('')+`</div>` : '';
  /* 영업시간 - hen/hzh/hja 가 있으면 쓰고, 없으면 한국어(hkr)로 폴백 */
  const hArr = (l!=='ko' && s['h'+l]) || s.hkr;
  if(!hArr){
    const t = l==='zh'?'在NAVER地图中查看营业时间 ↗':l==='ja'?'マップで営業時間を確認 ↗':l==='en'?'See hours on Maps ↗':'네이버 지도에서 영업시간 보기 ↗';
    return photo + cur + `<a class="spot-gmap" href="${mapUrl}" target="_blank" rel="noopener">${t}</a>`;
  }
  /* 시간 범위(15:30–17:00 등)는 대시에서 줄바꿈되지 않도록 렌더 시 nb 래핑 (v11.5 검수) */
  const nbTime = t => t.replace(/\d{1,2}:\d{2}\s*[–\-~]\s*\d{1,2}:\d{2}/g, m=>`<span class="nb">${m}</span>`);
  const lines = hArr.map(t=>`<div class="hr-line">${nbTime(t)}</div>`).join('');
  return photo + cur + `<div class="hr-box">${lines}</div><a class="spot-gmap" href="${mapUrl}" target="_blank" rel="noopener">${maps}</a>`;
}
function renderSpots(cat){
  spotsEl.innerHTML = WMH.spots
    .filter(s=>cat==='all'||s.cat===cat)
    .map((s,i)=>`<div class="spot-item">
      <button class="spot" type="button" data-spot="${i}" aria-expanded="false">
      <span class="spot-th${s.ph?'':' noimg'}">${s.ph?`<img src="img/spots/${s.ph}.jpg" alt="" loading="lazy" onerror="this.parentNode.classList.add('noimg');this.remove()">`:''}${s.ph?'':PIN_ICONS[s.cat]}</span>
      <span class="spot-main"><span class="spot-t">${spotName(s)}</span>
      <span class="spot-s has-ja"><span class="kr">${s.skr}</span><span class="en">${s.sen}</span><span class="zh">${s.skz||s.sen}</span><span class="ja">${s.sja||s.sen}</span></span></span>
      <span class="spot-right"><span class="spot-ci">${PIN_ICONS[s.cat]}</span><span class="spot-walk">${walkLabel(s)}</span></span>
      </button>
      <div class="spot-panel">${hoursHTML(s)}</div>
    </div>`).join('');
}
renderSpots('all');
/* 스팟 카드 아코디언: 탭하면 영업시간 패널이 펼쳐짐 (한 번에 하나만 열림) */
spotsEl.addEventListener('click', e=>{
  const btn = e.target.closest('.spot[data-spot]');
  if(!btn) return;
  const item = btn.closest('.spot-item');
  const panel = item.querySelector('.spot-panel');
  const open = item.classList.contains('open');
  // 다른 열린 카드 닫기
  spotsEl.querySelectorAll('.spot-item.open').forEach(it=>{
    if(it!==item){ it.classList.remove('open'); it.querySelector('.spot-panel').style.maxHeight=''; it.querySelector('.spot').setAttribute('aria-expanded','false'); }
  });
  if(open){ item.classList.remove('open'); panel.style.maxHeight=''; btn.setAttribute('aria-expanded','false'); }
  else {
    item.classList.add('open');
    panel.style.maxHeight = (panel.scrollHeight+48)+'px';
    btn.setAttribute('aria-expanded','true');
    /* 지연 로드 사진이 뜨면 패널 높이 재계산 (잘림 방지) */
    panel.querySelectorAll('img').forEach(im=>{
      if(!im.complete) im.addEventListener('load', ()=>{
        if(item.classList.contains('open')) panel.style.maxHeight = (panel.scrollHeight+48)+'px';
      }, {once:true});
    });
  }
});
(function(){ /* 칩 개수는 데이터에서 자동 계산 — 하드코딩 수치와 어긋나지 않게 */
  const cnt = { all: WMH.spots.length };
  WMH.spots.forEach(s => cnt[s.cat] = (cnt[s.cat]||0) + 1);
  document.querySelectorAll('#chips .chip').forEach(ch => {
    const n = cnt[ch.dataset.cat] || 0;
    /* 언어별 span이 있으면 그 안을, 없으면 버튼 글자를 바로 고친다 */
    const targets = ch.querySelectorAll('.kr,.en');
    if(targets.length) targets.forEach(sp => sp.textContent = sp.textContent.replace(/\d+\s*$/, n));
    else if(/\d+\s*$/.test(ch.textContent)) ch.textContent = ch.textContent.replace(/\d+\s*$/, n);
  });
})();
onId('chips', 'click', e=>{
  const c = e.target.closest('.chip'); if(!c) return;
  document.querySelectorAll('.chip').forEach(x=>x.classList.remove('on'));
  c.classList.add('on');
  renderSpots(c.dataset.cat);
  drawMarkers(c.dataset.cat);
});
/* 언어 전환 시 지도·리스트 재렌더는 setLang()에서 일괄 처리 */

/* ── Leaflet map ── */
/* ── 지도 잠금: 탭하면 조작 시작, 페이지 스크롤하면 다시 잠김 ── */
function attachMapGuard(containerId, hintText){
  const el = document.getElementById(containerId);
  if(!el || el.querySelector('.map-guard')) return;
  el.style.position = 'relative';
  const g = document.createElement('div');
  g.className = 'map-guard';
  g.innerHTML = `<span class="mg-chip">${hintText}</span>`;
  el.appendChild(g);
  let t;
  const rearm = ()=> g.classList.remove('off');
  const extend = ()=>{ clearTimeout(t); t = setTimeout(rearm, 8000); };
  g.addEventListener('click', ()=>{ g.classList.add('off'); extend(); });
  /* 재잠금: 페이지 스크롤 · 지도 밖 터치 · 8초간 지도 미사용 */
  window.addEventListener('scroll', rearm, {passive:true});
  document.addEventListener('touchstart', e=>{ if(!el.contains(e.target)) rearm(); }, {passive:true});
  el.addEventListener('touchstart', ()=>{ if(g.classList.contains('off')) extend(); }, {passive:true});
}
let map, markerLayer;
/* PIN_ICONS는 목록·지도 공용 — 상단으로 이동 */
/* ── 5단계: 지도는 좌표가 있을 때만 나타난다 ──────────────────
   content.js의 spots에 lat·lng을 채운 가게가 하나도 없고
   center도 비어 있으면 지도 자리를 통째로 숨긴다.
   좌표를 하나라도 넣으면 지도가 저절로 켜진다.                */
function hasCoord(o){
  return o && o.lat != null && o.lng != null && !isNaN(o.lat) && !isNaN(o.lng);
}
function pinnedSpots(){ return (WMH.spots || []).filter(hasCoord); }
function mapEnabled(){ return hasCoord(WMH.center) || pinnedSpots().length > 0; }
/* 지도 중심 — center가 없으면 핀이 찍힌 가게들의 한가운데를 쓴다 */
function mapCenter(){
  if(hasCoord(WMH.center)) return [WMH.center.lat, WMH.center.lng];
  const p = pinnedSpots();
  if(!p.length) return null;
  return [ p.reduce((a,s)=>a+Number(s.lat),0)/p.length,
           p.reduce((a,s)=>a+Number(s.lng),0)/p.length ];
}

function initMap(){
  if(map) return;
  const host = $id('map');
  if(!host) return;                 // 둘러보기 화면이 꺼져 있으면 아무것도 하지 않는다
  const c = mapCenter();
  if(!c){ host.style.display = 'none'; return; }   // 좌표가 없으면 지도 자리를 숨긴다
  host.style.display = '';
  map = L.map('map',{zoomControl:false,attributionControl:true}).setView(c, 15);
  // Carto Positron — 무채색 톤에 맞는 밝은 회색 타일
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{
    attribution:'© OSM · Carto', maxZoom:19
  }).addTo(map);
  L.control.zoom({position:'bottomright'}).addTo(map);
  // 숙소 마커 — center 좌표가 있을 때만 찍는다
  if(hasCoord(WMH.center)){
    const logoSrc = WMH.images.logo || 'img/logo.png';
    L.marker([WMH.center.lat, WMH.center.lng],{
      icon:L.divIcon({className:'',html:`<div class="wmh-home"><img src="${logoSrc}" alt=""></div>`,iconSize:[52,26],iconAnchor:[26,13]}),
      zIndexOffset:1000
    }).addTo(map).bindPopup('<div class="pop-t">'+(HOUSE_NAME||'STAY')+'</div>');
  }
  markerLayer = L.layerGroup().addTo(map);
  attachMapGuard('map', '탭하여 지도 이동');
  drawMarkers('all');
}
function drawMarkers(cat){
  if(!markerLayer) return;
  markerLayer.clearLayers();
  const en = document.body.classList.contains('en');
  WMH.spots.filter(s=>cat==='all'||s.cat===cat).forEach(s=>{
    if(!s.lat||!s.lng) return;
    const inner = s.pimg ? `<img src="img/spots/${s.pimg}.jpg" alt="">` : (s.glyph ? `<span class="wmh-pin-txt">${s.glyph}</span>` : (PIN_ICONS[s.cat] || ''));
    const m = L.marker([s.lat,s.lng],{
      icon:L.divIcon({className:'',html:`<div class="wmh-pin ${s.cat}${s.pimg?' has-img':(s.glyph?' has-txt':'')}">${inner}</div>`,iconSize:[28,28],iconAnchor:[14,14]})
    });
    const _l=curLang();
    const _url = (_l==='ko'||_l==='zh')
      ? `https://map.naver.com/p/search/${encodeURIComponent((AREA==='이 동네'?'':AREA+' ')+s.kr)}`
      : `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`;
    m.bindPopup(
      `<div class="pop-t">${spotName(s)}</div>`+
      `<div class="pop-s">${_l==='zh'?(s.skz||s.sen):(_l==='en'||_l==='ja')?s.sen:s.skr}</div>`+
      `<a class="pop-a" href="${_url}" target="_blank" rel="noopener">${_l==='zh'?'在NAVER地图中打开 ↗':_l==='ja'?'マップで開く ↗':_l==='en'?'Open in Maps ↗':'네이버 지도로 열기 ↗'}</a>`
    );
    /* 핀을 누르면 아래 목록의 그 가게로 화면이 내려간다 */
    m.on('click', ()=>{ scrollToSpot(s); });
    markerLayer.addLayer(m);
  });
}
/* 지도 핀 → 목록 카드로 이동 (그 카드를 펼쳐 준다) */
function scrollToSpot(spot){
  if(!spotsEl) return;
  const idx = (WMH.spots || []).indexOf(spot);
  const list = Array.from(spotsEl.querySelectorAll('.spot[data-spot]'));
  /* 목록은 묶음(칩)으로 걸러져 있을 수 있으므로 이름으로 찾는다 */
  const btn = list.find(b => {
    const t = b.querySelector('.spot-t');
    return t && t.textContent.trim() === spotName(spot).trim();
  });
  if(!btn) return;
  const item = btn.closest('.spot-item');
  btn.scrollIntoView({ behavior:'smooth', block:'center' });
  if(item && !item.classList.contains('open')) btn.click();
}
/* 좌표가 하나도 없으면 지도 자리를 처음부터 숨겨 둔다 */
(function hideMapIfNoCoords(){
  const host = $id('map');
  if(host && !mapEnabled()) host.style.display = 'none';
})();
// 둘러보기 화면이 처음 보일 때 지도 초기화 + 크기 재계산
const discBtns = document.querySelectorAll('[data-go="v-disc"]');
discBtns.forEach(b=>b.addEventListener('click', ()=>{
  setTimeout(()=>{ initMap(); if(map) map.invalidateSize(); }, 60);
}));

/* ── 골목길 투어 지도: A·B코스 경로 시각화 ── */
/* 골목길 투어 코스 — 좌표는 content.js의 tour에서 온다 */
const TOUR = (WMH.tour) || { A: [], B: [] };
let tourMap, tourLayer;
function initTourMap(){
  if(tourMap) return;
  const host = $id('tourmap');
  if(!host) return;
  const pts = [].concat(TOUR.A || [], TOUR.B || []).filter(hasCoord);
  const c = hasCoord(WMH.center) ? [WMH.center.lat, WMH.center.lng]
          : (pts.length ? [pts[0].lat, pts[0].lng] : null);
  if(!c){ host.style.display = 'none'; return; }   // 코스 좌표가 없으면 숨긴다
  host.style.display = '';
  tourMap = L.map('tourmap',{zoomControl:false,attributionControl:true,scrollWheelZoom:false});
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{
    attribution:'© OSM · Carto', maxZoom:19
  }).addTo(tourMap);
  L.control.zoom({position:'bottomright'}).addTo(tourMap);
  if(hasCoord(WMH.center)){
    const logoSrc = WMH.images.logo || 'img/logo.png';
    L.marker([WMH.center.lat, WMH.center.lng],{
      icon:L.divIcon({className:'',html:`<div class="wmh-home"><img src="${logoSrc}" alt=""></div>`,iconSize:[52,26],iconAnchor:[26,13]}),
      zIndexOffset:1000
    }).addTo(tourMap).bindPopup('<div class="pop-t">'+(HOUSE_NAME||'STAY')+'</div>');
  }
  tourLayer = L.layerGroup().addTo(tourMap);
  attachMapGuard('tourmap', '탭하여 지도 이동');
  drawTour(currentTourCourse());
}
function currentTourCourse(){
  const on = document.querySelector('#tourToggle .tchip.on');
  return on ? on.dataset.course : 'A';
}
function drawTour(course){
  if(!tourLayer) return;
  tourLayer.clearLayers();
  const en = document.body.classList.contains('en');
  const stops = TOUR[course];
  const pts = stops.map(s=>[s.lat,s.lng]);
  L.polyline(pts,{color:'#1D1D1F',weight:2,opacity:.5,dashArray:'2 7',lineCap:'round'}).addTo(tourLayer);
  stops.forEach((s,i)=>{
    L.marker([s.lat,s.lng],{
      icon:L.divIcon({className:'',html:`<div class="tour-pin">${i+1}</div>`,iconSize:[26,26],iconAnchor:[13,13]}),
      zIndexOffset:i
    }).bindPopup(`<div class="pop-t">${i+1}. ${curLang()==='zh'?(s.kz||s.en):(curLang()==='en'||curLang()==='ja')?s.en:s.kr}</div>`).addTo(tourLayer);
  });
  tourMap.fitBounds(L.latLngBounds(pts).pad(0.18));
}
/* ── 관광지 페이지: 숙소 → 버스정류장 지도 ── */
/* 가까운 버스 정류장 — 좌표는 content.js의 busStop에서 온다 */
const BUS_STOP = { lat: (WMH.busStop||{}).lat, lng: (WMH.busStop||{}).lng };
let transMap;
function initTransMap(){
  if(transMap) return;
  const host = $id('transmap');
  if(!host) return;
  if(!hasCoord(WMH.center) || !hasCoord(BUS_STOP)){ host.style.display='none'; return; }
  host.style.display = '';
  transMap = L.map('transmap',{zoomControl:false,attributionControl:true,scrollWheelZoom:false,dragging:true});
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{attribution:'© OSM · Carto',maxZoom:19}).addTo(transMap);
  const logoSrc = WMH.images.logo || 'img/logo.png';
  L.marker([WMH.center.lat, WMH.center.lng],{
    icon:L.divIcon({className:'',html:`<div class="wmh-home"><img src="${logoSrc}" alt=""></div>`,iconSize:[52,26],iconAnchor:[26,13]}),
    zIndexOffset:1000
  }).addTo(transMap);
  L.marker([BUS_STOP.lat, BUS_STOP.lng],{
    icon:L.divIcon({className:'',html:`<div class="bus-pin"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h14V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v11z"></path><path d="M5 11h14"></path><circle cx="8" cy="17.5" r="1.3" fill="currentColor" stroke="none"></circle><circle cx="16" cy="17.5" r="1.3" fill="currentColor" stroke="none"></circle></svg></div>`,iconSize:[30,30],iconAnchor:[15,15]})
  }).addTo(transMap);
  L.polyline([[WMH.center.lat,WMH.center.lng],[BUS_STOP.lat,BUS_STOP.lng]],
    {color:'#1D1D1F',weight:2,opacity:.5,dashArray:'2 7',lineCap:'round'}).addTo(transMap);
  transMap.fitBounds(L.latLngBounds([[WMH.center.lat,WMH.center.lng],[BUS_STOP.lat,BUS_STOP.lng]]).pad(0.35));
  attachMapGuard('transmap', '탭하여 지도 이동');
}
/* 관광지 아코디언 */
document.addEventListener('click', e=>{
  const h = e.target.closest('.ts-head');
  if(!h) return;
  const it = h.closest('.ts-item');
  const p = it.querySelector('.ts-panel');
  const open = it.classList.contains('open');
  document.querySelectorAll('.ts-item.open').forEach(x=>{
    if(x!==it){ x.classList.remove('open'); x.querySelector('.ts-panel').style.maxHeight=''; }
  });
  if(open){ it.classList.remove('open'); p.style.maxHeight=''; }
  else { it.classList.add('open'); p.style.maxHeight = (p.scrollHeight+24)+'px'; }
});
document.querySelectorAll('[data-go="v-trans"]').forEach(b=>b.addEventListener('click', ()=>{
  setTimeout(()=>{ initTransMap(); if(transMap) transMap.invalidateSize(); }, 60);
}));
document.querySelectorAll('[data-go="v-tour"]').forEach(b=>b.addEventListener('click', ()=>{
  setTimeout(()=>{ initTourMap(); if(tourMap) tourMap.invalidateSize(); }, 60);
}));
onId('tourToggle', 'click', e=>{
  const c = e.target.closest('.tchip'); if(!c) return;
  document.querySelectorAll('#tourToggle .tchip').forEach(x=>x.classList.remove('on'));
  c.classList.add('on');
  drawTour(c.dataset.course);
});

/* 메인 사진 & 로고 적용 — 값은 content.js의 images에서 온다 */
(function applyImages(){
  const heroImg  = document.getElementById('hero-img');
  const heroLogo = document.getElementById('hero-logo');
  if(heroImg){
    if(WMH.images.hero) heroImg.src = WMH.images.hero;
    heroImg.style.objectPosition = WMH.images.heroPosition || 'center';
  }
  if(heroLogo){
    if(WMH.images.logo) heroLogo.src = WMH.images.logo;
    heroLogo.style.height = (WMH.images.logoHeight || 40) + 'px';
    heroLogo.style.top    = (WMH.images.logoTop ?? 20) + 'px';
    if((WMH.images.logoAlign || 'left') === 'center'){
      heroLogo.style.left = '50%';
      heroLogo.style.transform = 'translateX(-50%)';
    } else {
      heroLogo.style.left = (WMH.images.logoLeft ?? 20) + 'px';
      heroLogo.style.transform = 'none';
    }
  }
})();

/* ══════════════════════════════════════════════════════════════
   꺼 둔 화면으로 가는 버튼 숨기기

   content.js의 screens 목록에서 빠진 화면은 앱에 실리지 않습니다.
   그 화면으로 가는 버튼을 그대로 두면 눌러도 아무 일이 없으므로,
   여기서 조용히 숨깁니다.
   목록에 한 줄을 더하면 화면도 버튼도 함께 돌아옵니다.
══════════════════════════════════════════════════════════════ */
(function hideLinksToMissingScreens(){
  const loaded = new Set(
    Array.from(document.querySelectorAll('.view')).map(v => v.id)
  );
  document.querySelectorAll('[data-go]').forEach(el => {
    const target = el.dataset.go;
    if(!target || loaded.has(target)) return;
    el.style.display = 'none';
    el.setAttribute('aria-hidden', 'true');
  });
  /* 안내 목록의 번호를 다시 매긴다 — 중간이 비어 보이지 않도록 */
  document.querySelectorAll('.glist').forEach(list => {
    let n = 0;
    list.querySelectorAll('.gsec').forEach(sec => {
      const head = sec.querySelector('.gsec-head');
      if(head && head.style.display === 'none'){ sec.style.display = 'none'; return; }
      const num = sec.querySelector('.gsec-n');
      if(num) num.textContent = String(++n).padStart(2, '0');
    });
  });
})();

/* ══════════════════════════════════════════════════════════════
   content.js의 값을 화면에 채워 넣기
   (숙소 이름 · 연락처 · SNS — 비어 있으면 그 자리를 숨깁니다)
══════════════════════════════════════════════════════════════ */
(function fillHouseInfo(){
  const h = WMH.house || {};

  /* 숙소 이름이 들어갈 자리 */
  document.querySelectorAll('[data-house="stayType"]').forEach(el => {
    if(h.stayType){ el.textContent = h.stayType; el.style.display = ''; }
    else { el.style.display = 'none'; }
  });

  document.querySelectorAll('[data-house="name"]').forEach(el => {
    if(h.name){ el.textContent = h.name; el.style.display = ''; }
    else { el.style.display = 'none'; }
  });

  /* 주소가 들어갈 자리 — 복사 버튼의 값도 함께 채운다 */
  document.querySelectorAll('[data-house="address"]').forEach(el => {
    if(h.address){
      el.textContent = h.address;
      const btn = el.closest('[data-addr]');
      if(btn) btn.dataset.addr = h.address;
      el.style.display = '';
    } else {
      const box = el.closest('.gcopy') || el;
      box.style.display = 'none';
    }
  });

  /* 전화번호를 글자로 보여 주는 자리 */
  const phone = (WMH.contact && WMH.contact.phone) || '';
  document.querySelectorAll('[data-house="phone"]').forEach(el => {
    if(phone) el.textContent = phone;
    else { const row = el.closest('.chan') || el; row.style.display = 'none'; }
  });

  /* 아래쪽 저작권 줄의 연도 */
  const y = $id('foot-year');
  if(y) y.textContent = new Date().getFullYear() + (h.name ? ' ' + h.name : '');

  /* SNS — 주소를 넣은 것만 보인다 */
  const soc = WMH.social || {};
  document.querySelectorAll('[data-social]').forEach(a => {
    const url = soc[a.dataset.social];
    if(url){ a.href = url; a.style.display = ''; }
    else { a.style.display = 'none'; }
  });
})();

/* ── content.js의 links를 화면의 바로가기 버튼에 연결 ────────────
   주소를 넣지 않은 버튼은 화면에서 숨깁니다.                    */
(function fillLinks(){
  const L = WMH.links || {};
  document.querySelectorAll('[data-link]').forEach(a => {
    const url = L[a.dataset.link];
    if(url && url !== '#'){ a.href = url; a.style.display = ''; }
    else { a.style.display = 'none'; }
  });
})();
