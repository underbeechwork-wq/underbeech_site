const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const rates = {
  prune12: 2000, prune23: 4000, prune34: 7000, prune4: 10000,
  trim12: 1000, trim23: 3000, trim34: 6000, trim4: 9000,
  fell12: 3000, fell23: 6000, fell34: 9000, fell45: 12000, fell56: 15000, fell7: 20000,
  stump12: 4000, stump24: 10000,
  machineWeed: 300, manualWeed: 600, hedge: 1500,
  spray12: 2000, spray23: 4000, spray34: 6000, spray4: 8000,
  leveling: 200, sheet: 2000, sheetPremium: 4000, gravel: 2000, handShears: 1000
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
function isAreaService(t){ return ['machineWeed','manualWeed','leveling','sheet','sheetPremium','gravel','sheetGravel','sheetGravelPremium'].includes(t); }

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
    if(type==='machineWeed') rate=rates.machineWeed;
    if(type==='manualWeed') rate=rates.manualWeed;
    if(type==='leveling') rate=rates.leveling;
    if(type==='sheet') rate=rates.sheet;
    if(type==='sheetPremium') rate=rates.sheetPremium;
    if(type==='gravel') rate=rates.gravel;
    if(type==='sheetGravel') rate=rates.sheet+rates.gravel;
    if(type==='sheetGravelPremium') rate=rates.sheetPremium+rates.gravel;
    if(['sheet','sheetPremium','sheetGravel','sheetGravelPremium'].includes(type)){
      $('#calcCaution').textContent='防草シートの種類によって金額が変わります。整地・除草が必要な場合は別途となります。';
    }
    amount=rate*a; detail=`${$('#serviceSelect option:checked').textContent} ${a}㎡`;
  }
  const disposalValue=$('#disposalSelect').value;
  const disposalQuoteOnly=disposalValue==='small';
  if(disposalQuoteOnly){
    detail+='＋処分費（少量・別途お見積り）';
    $('#calcCaution').textContent+=($('#calcCaution').textContent?' ':'')+'少量の処分費は固定料金では計算せず、別途お見積りします。';
  }else if(disposalValue==='15000' || disposalValue==='30000'){
    const disposalFee=Number(disposalValue);
    amount+=disposalFee;
    detail+=disposalValue==='15000'?'＋処分費（軽トラ満載・軽量物）':'＋処分費（軽トラ満載・丸太など重量物）';
    $('#calcCaution').textContent+=($('#calcCaution').textContent?' ':'')+'処分料金は軽トラック1台・満載時の目安です。種類・重量・量や搬出条件によって変わります。';
  }
  $('#estimatePrice').textContent=estimatePriceLabel({amount,quoteOnly,disposalQuoteOnly});
  $('#estimateDetail').textContent=detail;
  return {amount,detail,quoteOnly,disposalQuoteOnly};
}


const estimateItems=[];

function estimatePriceLabel(item){
  if(item.quoteOnly && item.disposalQuoteOnly){
    return item.amount>0?`${yen(item.amount)} ＋ 作業費・処分費要お見積り`:'要お見積り';
  }
  if(item.quoteOnly){
    return item.amount>0?`${yen(item.amount)} ＋ 作業費要お見積り`:'要お見積り';
  }
  if(item.disposalQuoteOnly){
    return `${yen(item.amount)} ＋ 処分費要お見積り`;
  }
  return yen(item.amount);
}

function renderEstimateItems(){
  const wrap=$('#estimateItems');
  const empty=$('#estimateEmpty');
  const total=$('#estimateTotal');
  if(!wrap || !total) return;

  wrap.innerHTML='';
  if(!estimateItems.length){
    empty?.classList.remove('hidden');
    total.textContent='0円〜';
    return;
  }

  empty?.classList.add('hidden');
  estimateItems.forEach((item,index)=>{
    const row=document.createElement('div');
    row.className='estimate-item';
    row.innerHTML=`<span class="estimate-item-detail"></span><strong class="estimate-item-price"></strong><button class="estimate-item-remove" type="button" data-estimate-remove="${index}">削除</button>`;
    row.querySelector('.estimate-item-detail').textContent=item.detail;
    row.querySelector('.estimate-item-price').textContent=estimatePriceLabel(item);
    wrap.appendChild(row);
  });

  const knownTotal=estimateItems.reduce((sum,item)=>sum+item.amount,0);
  const hasQuoteOnly=estimateItems.some(item=>item.quoteOnly || item.disposalQuoteOnly);
  if(hasQuoteOnly && knownTotal>0){
    total.textContent=`${Math.round(knownTotal).toLocaleString('ja-JP')}円〜 ＋ 要お見積り`;
  }else if(hasQuoteOnly){
    total.textContent='要お見積り';
  }else{
    total.textContent=yen(knownTotal);
  }
}

document.addEventListener('click',(event)=>{
  const remove=event.target.closest?.('[data-estimate-remove]');
  if(!remove) return;
  const index=Number(remove.dataset.estimateRemove);
  if(Number.isInteger(index)){
    estimateItems.splice(index,1);
    renderEstimateItems();
  }
});

$('#clearEstimateItems')?.addEventListener('click',()=>{
  estimateItems.splice(0,estimateItems.length);
  renderEstimateItems();
});

if($('#serviceSelect')){
  $('#serviceSelect').addEventListener('change',()=>{ updateHeightOptions(); $('#handShears').checked=false; $('#pineTree').checked=false; calc(); });
  ['treeHeight','treeCount','areaSize','hedgeHeight','hedgeLength','hedgeDepth','handShears','pineTree','disposalSelect'].forEach(id=>$('#'+id)?.addEventListener('input',calc));
  $('#useEstimate')?.addEventListener('click',()=>{ const r=calc(); estimateItems.push({amount:r.amount,detail:r.detail,quoteOnly:r.quoteOnly,disposalQuoteOnly:r.disposalQuoteOnly}); renderEstimateItems(); });
  updateHeightOptions(); calc(); renderEstimateItems();
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

// v38: お問い合わせフォームはGoogleフォーム移行準備のため一時停止中。

// v30: footer phone click analytics
document.querySelectorAll('a[href^="tel:"]').forEach(link=>{
  link.addEventListener('click',()=>{
    if(typeof window.gtag === 'function'){
      window.gtag('event','contact_phone_click',{contact_method:'phone'});
    }
  });
});
