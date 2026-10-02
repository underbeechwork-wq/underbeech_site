const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const rates = {
  prune12: 1000, prune23: 4000, prune34: 7000, prune4: 10000,
  trim12: 1000, trim23: 3000, trim34: 6000, trim4: 9000,
  fell12: 3000, fell23: 6000, fell34: 9000, fell45: 12000, fell56: 15000, fell7: 20000,
  stump12: 4000, stump24: 10000,
  machineWeed: 300, manualWeed: 600, hedge: 1500,
  spray12: 2000, spray23: 4000, spray34: 6000, spray4: 8000,
  leveling: 200, sheet: 2000, gravel: 2000, handShears: 1000
};

const heightConfig = {
  pruning: [['12','1〜2m'],['23','2〜3m'],['34','3〜4m'],['4','4m以上']],
  treeTrim: [['12','1〜2m'],['23','2〜3m'],['34','3〜4m'],['4','4m以上']],
  felling: [['12','1〜2m'],['23','2〜3m'],['34','3〜4m'],['45','4〜5m'],['56','5〜6m'],['67','6〜7m（要見積り）'],['7','7m以上']],
  stump: [['12','1〜2m'],['24','2〜4m'],['4plus','4m以上（要見積り）']],
  spray: [['12','1〜2m'],['23','2〜3m'],['34','3〜4m'],['4','4m以上']]
};

function yen(n){ return Math.round(n).toLocaleString('ja-JP') + '円〜'; }
function isHeightService(t){ return ['pruning','treeTrim','felling','stump','spray'].includes(t); }
function isAreaService(t){ return ['machineWeed','manualWeed','leveling','sheet','gravel','sheetGravel'].includes(t); }

function updateHeightOptions(){
  const type=$('#serviceSelect')?.value;
  if(!type || !isHeightService(type)) return;
  const select=$('#treeHeight'); const current=select.value; select.innerHTML='';
  heightConfig[type].forEach(([value,label])=>{ const op=document.createElement('option'); op.value=value; op.textContent=label; select.appendChild(op); });
  if([...select.options].some(o=>o.value===current)) select.value=current;
}

function rateForHeight(type,h){
  if(type==='pruning') return rates['prune'+h];
  if(type==='treeTrim') return rates['trim'+h];
  if(type==='felling') return h==='67' ? null : rates['fell'+h];
  if(type==='stump') return h==='4plus' ? null : rates['stump'+h];
  if(type==='spray') return rates['spray'+h];
  return null;
}

function calc(){
  if(!$('#serviceSelect')) return {amount:0,detail:'',quoteOnly:false};
  const type=$('#serviceSelect').value;
  $('#heightFields').classList.toggle('hidden',!isHeightService(type));
  $('#areaFields').classList.toggle('hidden',!isAreaService(type));
  $('#hedgeFields').classList.toggle('hidden',type!=='hedge');
  $('#handShearsWrap').classList.toggle('hidden',type!=='treeTrim');
  $('#pineWrap').classList.toggle('hidden',type!=='pruning');
  $('#treeCountWrap').classList.toggle('hidden',!isHeightService(type));
  $('#calcCaution').textContent='';
  let amount=0, detail='', quoteOnly=false;
  if(isHeightService(type)){
    const h=$('#treeHeight').value, c=Math.max(1,Number($('#treeCount').value)||1);
    let rate=rateForHeight(type,h); const label=$('#treeHeight option:checked').textContent;
    if(rate==null){ quoteOnly=true; detail=`${$('#serviceSelect option:checked').textContent} ${label} × ${c}本`; $('#calcCaution').textContent='この高さは作業条件による差が大きいため、現地確認後のお見積りとなります。'; }
    else {
      if(type==='pruning' && $('#pineTree').checked) rate=Math.max(rate,10000);
      amount=rate*c;
      if(type==='treeTrim' && $('#handShears').checked) amount+=rates.handShears*c;
      detail=`${$('#serviceSelect option:checked').textContent} ${label} × ${c}本`;
      if(type==='pruning' && $('#pineTree').checked) detail+='（松）';
      if(type==='treeTrim' && $('#handShears').checked) detail+='（刈込バサミ）';
    }
  } else if(type==='hedge'){
    const h=Math.max(.1,Number($('#hedgeHeight').value)||.1), l=Math.max(.1,Number($('#hedgeLength').value)||.1), d=Math.max(.1,Number($('#hedgeDepth').value)||.1);
    const area=h*l; amount=rates.hedge*area; detail=`生垣の刈込 高さ${h}m × 長さ${l}m × 奥行き${d}m（概算${area.toFixed(1)}㎡）`;
    $('#calcCaution').textContent='生垣は高さ×長さを概算面積として計算しています。奥行き・形状・作業量は正式見積り時に反映します。';
  } else {
    const a=Math.max(1,Number($('#areaSize').value)||1); let rate=0;
    if(type==='machineWeed') rate=rates.machineWeed; if(type==='manualWeed') rate=rates.manualWeed; if(type==='leveling') rate=rates.leveling; if(type==='sheet') rate=rates.sheet; if(type==='gravel') rate=rates.gravel; if(type==='sheetGravel') rate=rates.sheet+rates.gravel;
    amount=rate*a; detail=`${$('#serviceSelect option:checked').textContent} ${a}㎡`;
  }
  const disposal=Number($('#disposalSelect').value)||0;
  if(!quoteOnly && disposal){ amount+=disposal; detail+=disposal===3000?'＋処分費少量目安':'＋処分費軽トラ1台目安'; }
  $('#estimatePrice').textContent=quoteOnly?'要お見積り':yen(amount); $('#estimateDetail').textContent=detail;
  return {amount,detail,quoteOnly};
}

if($('#serviceSelect')){
  $('#serviceSelect').addEventListener('change',()=>{ updateHeightOptions(); $('#handShears').checked=false; $('#pineTree').checked=false; calc(); });
  ['treeHeight','treeCount','areaSize','hedgeHeight','hedgeLength','hedgeDepth','handShears','pineTree','disposalSelect'].forEach(id=>$('#'+id)?.addEventListener('input',calc));
  $('#useEstimate')?.addEventListener('click',()=>{ const r=calc(); const price=r.quoteOnly?'要お見積り':yen(r.amount); const summary=`料金シミュレーター：${r.detail} / ${price}`; const selected=$('#selectedEstimate'); if(selected){ selected.textContent=summary; selected.classList.remove('hidden'); } const estimateInput=$('#estimateForForm'); if(estimateInput) estimateInput.value=summary; location.hash='contact'; });
  updateHeightOptions(); calc();
}

const mobileMenu=$('#mobileMenu');
const menuBtn=$('#menuBtn');
const menuClose=$('#menuClose');
let menuReturnFocus=null;

function setMenu(open,{restoreFocus=true}={}){
  if(!mobileMenu) return;
  mobileMenu.classList.toggle('open',open);
  mobileMenu.setAttribute('aria-hidden',String(!open));
  menuBtn?.setAttribute('aria-expanded',String(open));
  document.body.classList.toggle('menu-open',open);
  if(open){
    menuReturnFocus=document.activeElement;
    requestAnimationFrame(()=>menuClose?.focus());
  }else if(restoreFocus && menuReturnFocus instanceof HTMLElement){
    menuReturnFocus.focus();
  }
}
function closeMenu(options){ setMenu(false,options); }
menuBtn?.addEventListener('click',()=>setMenu(true));
menuClose?.addEventListener('click',()=>closeMenu());
$$('#mobileMenu a').forEach(a=>a.addEventListener('click',()=>closeMenu({restoreFocus:false})));
mobileMenu?.addEventListener('click',e=>{ if(e.target===mobileMenu) closeMenu(); });
document.addEventListener('keydown',e=>{
  if(e.key==='Escape' && mobileMenu?.classList.contains('open')) closeMenu();
  if(e.key==='Tab' && mobileMenu?.classList.contains('open')){
    const focusables=[...mobileMenu.querySelectorAll('a,button')].filter(el=>!el.disabled);
    if(!focusables.length) return;
    const first=focusables[0], last=focusables[focusables.length-1];
    if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
  }
});
window.addEventListener('resize',()=>{ if(window.innerWidth>1020 && mobileMenu?.classList.contains('open')) closeMenu({restoreFocus:false}); });

const headerEl=$('.header'); const navItems=$$('[data-nav-target]');
const tracked=['service','price','contact'].map(id=>document.getElementById(id)).filter(Boolean);
function refreshHeader(){
  if(headerEl) headerEl.classList.toggle('scrolled',window.scrollY>24);
  let current=null; const offset=(headerEl?.offsetHeight||80)+50;
  tracked.forEach(s=>{ if(window.scrollY+offset>=s.offsetTop) current=s.id; });
  navItems.forEach(a=>a.classList.toggle('active',a.dataset.navTarget===current));
}
window.addEventListener('scroll',refreshHeader,{passive:true}); window.addEventListener('resize',refreshHeader); refreshHeader();


// v25: 電話相談用メモ（入力内容はブラウザ内のみで処理）

async function copyConsultMemo(){
  const status=$('#copyConsultStatus');
  const text=buildConsultMemo();
  try{
    if(navigator.clipboard && window.isSecureContext){
      await navigator.clipboard.writeText(text);
    }else{
      const ta=document.createElement('textarea');
      ta.value=text; ta.setAttribute('readonly',''); ta.style.position='fixed'; ta.style.opacity='0';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }
    if(status) status.textContent='相談内容をコピーしました。';
  }catch(e){
    if(status) status.textContent='コピーできませんでした。内容を長押し・選択してコピーしてください。';
  }
}
$('#copyConsultMemo')?.addEventListener('click',copyConsultMemo);
buildConsultMemo();


// v28: Google Analytics 4 イベント計測（個人情報・フォーム入力値は送信しない）
function sendAnalyticsEvent(name, params={}){
  if(typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}

// メールリンクのクリック
$$('a[href^="mailto:"]').forEach(link=>{
  link.addEventListener('click',()=>sendAnalyticsEvent('contact_email_click',{contact_method:'email'}));
});

// 料金シミュレーター利用
$('#useEstimate')?.addEventListener('click',()=>{
  sendAnalyticsEvent('estimate_check',{tool:'price_estimator'});
});

// v36: Google Apps Script お問い合わせフォーム
const inquiryForm=$('#inquiryForm');
const contactAttachment=$('#contactAttachment');
const contactSubmit=$('#contactSubmit');
const formStatus=$('#formStatus');
let formSubmitting=false;
let formStarted=false;

function setFormStatus(message,isError=false){
  if(!formStatus) return;
  formStatus.textContent=message||'';
  formStatus.classList.toggle('is-error',Boolean(isError));
}

function setSubmitBusy(busy){
  if(!contactSubmit) return;
  contactSubmit.disabled=busy;
  const label=contactSubmit.querySelector('.submit-label');
  if(label) label.textContent=busy?'送信中です…':'お問い合わせを送信する';
}

function clearAttachmentFields(){
  const data=$('#attachmentData');
  const name=$('#attachmentName');
  const mime=$('#attachmentMime');
  if(data) data.value='';
  if(name) name.value='';
  if(mime) mime.value='';
}

function validateContactFile(file){
  if(!file) return '';
  const allowed=['image/jpeg','image/png','image/webp'];
  if(!allowed.includes(file.type)) return '添付できる画像は JPEG・PNG・WebP です。';
  if(file.size > 4*1024*1024) return '添付画像は4MB以下にしてください。';
  return '';
}

contactAttachment?.addEventListener('change',()=>{
  const file=contactAttachment.files?.[0];
  const error=validateContactFile(file);
  if(error){
    contactAttachment.value='';
    clearAttachmentFields();
    setFormStatus(error,true);
  }else{
    setFormStatus(file?`選択中：${file.name}`:'');
  }
});

inquiryForm?.addEventListener('input',()=>{
  if(formStarted) return;
  formStarted=true;
  sendAnalyticsEvent('form_start',{form_name:'contact'});
},{once:true});

inquiryForm?.addEventListener('submit',(event)=>{
  event.preventDefault();
  if(formSubmitting) return;

  if(!inquiryForm.reportValidity()) return;

  const file=contactAttachment?.files?.[0];
  const error=validateContactFile(file);
  if(error){
    setFormStatus(error,true);
    return;
  }

  formSubmitting=true;
  setSubmitBusy(true);
  setFormStatus('送信準備中です。このままお待ちください。');

  try{
    sessionStorage.setItem('underbeech_contact_submit_pending','1');
  }catch(e){}

  sendAnalyticsEvent('form_submit_attempt',{form_name:'contact'});

  const submitNative=()=>{
    setFormStatus('送信しています。画面が切り替わるまでお待ちください。');
    HTMLFormElement.prototype.submit.call(inquiryForm);
  };

  if(!file){
    clearAttachmentFields();
    submitNative();
    return;
  }

  const reader=new FileReader();
  reader.onload=()=>{
    const data=$('#attachmentData');
    const name=$('#attachmentName');
    const mime=$('#attachmentMime');
    if(data) data.value=String(reader.result||'');
    if(name) name.value=file.name;
    if(mime) mime.value=file.type;
    submitNative();
  };
  reader.onerror=()=>{
    formSubmitting=false;
    setSubmitBusy(false);
    try{ sessionStorage.removeItem('underbeech_contact_submit_pending'); }catch(e){}
    setFormStatus('画像を読み込めませんでした。画像なしで送信するか、別の画像をお試しください。',true);
  };
  reader.readAsDataURL(file);
});

// v30: footer phone click analytics
document.querySelectorAll('a[href^="tel:"]').forEach(link=>{
  link.addEventListener('click',()=>{
    if(typeof window.gtag === 'function'){
      window.gtag('event','contact_phone_click',{contact_method:'phone'});
    }
  });
});
