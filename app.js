const KEY = 'underbeech_v9_public';

const defaults = {
  brand: '植木屋 アンダービーチ',
  phone: '090-7079-5989',
  email: '',
  area: '埼玉県・東京都（詳しくは下記の対応エリアをご覧ください）',
  conceptTitle: '頼みやすい植木屋を、\nもっと身近に。',
  conceptText: '「植木屋さんに頼みたいけど、いくらかかるか分からない」「電話するほどか迷う」。そんな不安を減らせるように、料金の目安を公開し、庭木1本から気軽に相談できるようにしています。',
  seoTitle: '植木屋 アンダービーチ｜剪定・伐採・除草・防草施工',
  seoDescription: '植木屋 アンダービーチ。庭木の剪定・刈込・伐採・伐根・除草・消毒・防草シート・砂利敷きなど庭のお手入れに対応。サイト上で概算料金も確認できます。',
  rates: {
    prune12: 1000, prune23: 4000, prune34: 7000, prune4: 10000,
    trim12: 1000, trim23: 3000, trim34: 6000, trim4: 9000,
    fell12: 3000, fell23: 6000, fell34: 9000, fell45: 12000, fell56: 15000, fell7: 20000,
    stump12: 4000, stump24: 10000,
    machineWeed: 300, manualWeed: 600, hedge: 1500,
    spray12: 2000, spray23: 4000, spray34: 6000, spray4: 8000,
    leveling: 200, sheet: 2000, gravel: 2000,
    handShears: 1000
  },
  works: []
};

let data = load();
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    return {
      ...structuredClone(defaults),
      ...saved,
      rates: { ...defaults.rates, ...(saved.rates || {}) },
      works: Array.isArray(saved.works) ? saved.works : structuredClone(defaults.works)
    };
  } catch {
    return structuredClone(defaults);
  }
}

function save() {
  localStorage.setItem(KEY, JSON.stringify(data));
  renderAll();
}

function yen(n) {
  return Math.round(n).toLocaleString('ja-JP') + '円〜';
}

function esc(s = '') {
  return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

function renderAll() {
  $('#aboutBrand').textContent = data.brand;
  $('#aboutArea').textContent = data.area;
  $('#aboutPhone').textContent = data.phone;
  $('#footerPhone').textContent = data.phone;
  $('#footerPhone').href = 'tel:' + data.phone.replace(/\D/g, '');
  $('#conceptTitle').innerHTML = data.conceptTitle.replace(/\n/g, '<br>');
  $('#conceptText').textContent = data.conceptText;
  document.title = data.seoTitle;
  document.querySelector('meta[name="description"]').content = data.seoDescription;
  const schema = JSON.parse($('#businessSchema').textContent);
  schema.name = data.brand;
  schema.telephone = data.phone;
  $('#businessSchema').textContent = JSON.stringify(schema);
  renderWorks();
  updateHeightOptions();
  calc();
  fillAdmin();
}

function renderWorks() {
  const box = $('#worksGrid');
  box.innerHTML = '';
  const empty = document.querySelector('#worksEmpty');
  if (empty) empty.classList.toggle('hidden', data.works.length > 0);
  data.works.slice(0, 4).forEach(w => {
    const el = document.createElement('article');
    el.className = 'work-card';
    el.innerHTML = `<div class="work-visual"><div class="work-img before">作業前</div><div class="work-img after">作業後</div></div><div class="work-meta"><div><h3>${esc(w.title)}</h3><p>${esc(w.desc)}</p></div><strong>${esc(w.price)}</strong></div>`;
    if (w.before) el.querySelector('.before').style.backgroundImage = `linear-gradient(rgba(0,0,0,.15),rgba(0,0,0,.15)),url(${w.before})`;
    if (w.after) el.querySelector('.after').style.backgroundImage = `linear-gradient(rgba(0,0,0,.15),rgba(0,0,0,.15)),url(${w.after})`;
    box.appendChild(el);
  });
  renderAdminWorks();
}

const heightConfig = {
  pruning: [
    ['12', '1〜2m'], ['23', '2〜3m'], ['34', '3〜4m'], ['4', '4m以上']
  ],
  treeTrim: [
    ['12', '1〜2m'], ['23', '2〜3m'], ['34', '3〜4m'], ['4', '4m以上']
  ],
  felling: [
    ['12', '1〜2m'], ['23', '2〜3m'], ['34', '3〜4m'], ['45', '4〜5m'], ['56', '5〜6m'], ['67', '6〜7m（要見積り）'], ['7', '7m以上']
  ],
  stump: [
    ['12', '1〜2m'], ['24', '2〜4m'], ['4plus', '4m以上（要見積り）']
  ],
  spray: [
    ['12', '1〜2m'], ['23', '2〜3m'], ['34', '3〜4m'], ['4', '4m以上']
  ]
};

function isHeightService(type) {
  return ['pruning', 'treeTrim', 'felling', 'stump', 'spray'].includes(type);
}

function isAreaService(type) {
  return ['machineWeed', 'manualWeed', 'leveling', 'sheet', 'gravel', 'sheetGravel'].includes(type);
}

function updateHeightOptions() {
  const type = $('#serviceSelect').value;
  if (!isHeightService(type)) return;
  const select = $('#treeHeight');
  const current = select.value;
  select.innerHTML = '';
  heightConfig[type].forEach(([value, label]) => {
    const op = document.createElement('option');
    op.value = value;
    op.textContent = label;
    select.appendChild(op);
  });
  if ([...select.options].some(o => o.value === current)) select.value = current;
}

function rateForHeight(type, h) {
  const r = data.rates;
  if (type === 'pruning') return r['prune' + h];
  if (type === 'treeTrim') return r['trim' + h];
  if (type === 'felling') {
    if (h === '67') return null;
    return r['fell' + h];
  }
  if (type === 'stump') {
    if (h === '4plus') return null;
    return r['stump' + h];
  }
  if (type === 'spray') return r['spray' + h];
  return null;
}

function calc() {
  const type = $('#serviceSelect').value;
  const heightFields = $('#heightFields');
  const areaFields = $('#areaFields');
  const hedgeFields = $('#hedgeFields');
  const handWrap = $('#handShearsWrap');
  const pineWrap = $('#pineWrap');
  const countWrap = $('#treeCountWrap');
  const caution = $('#calcCaution');

  heightFields.classList.toggle('hidden', !isHeightService(type));
  areaFields.classList.toggle('hidden', !isAreaService(type));
  hedgeFields.classList.toggle('hidden', type !== 'hedge');
  handWrap.classList.toggle('hidden', type !== 'treeTrim');
  pineWrap.classList.toggle('hidden', type !== 'pruning');
  countWrap.classList.toggle('hidden', !isHeightService(type));
  caution.textContent = '';

  let amount = 0;
  let detail = '';
  let quoteOnly = false;

  if (isHeightService(type)) {
    const h = $('#treeHeight').value;
    const c = Math.max(1, Number($('#treeCount').value) || 1);
    let rate = rateForHeight(type, h);
    const label = $('#treeHeight option:checked').textContent;

    if (rate == null) {
      quoteOnly = true;
      detail = `${$('#serviceSelect option:checked').textContent} ${label} × ${c}本`;
      caution.textContent = 'この高さは作業条件による差が大きいため、現地確認後のお見積りとなります。';
    } else {
      if (type === 'pruning' && $('#pineTree').checked) rate = Math.max(rate, 10000);
      amount = rate * c;
      if (type === 'treeTrim' && $('#handShears').checked) amount += data.rates.handShears * c;
      detail = `${$('#serviceSelect option:checked').textContent} ${label} × ${c}本`;
      if (type === 'pruning' && $('#pineTree').checked) detail += '（松）';
      if (type === 'treeTrim' && $('#handShears').checked) detail += '（刈込バサミ）';
    }
  } else if (type === 'hedge') {
    const h = Math.max(0.1, Number($('#hedgeHeight').value) || 0.1);
    const l = Math.max(0.1, Number($('#hedgeLength').value) || 0.1);
    const d = Math.max(0.1, Number($('#hedgeDepth').value) || 0.1);
    const area = h * l;
    amount = data.rates.hedge * area;
    detail = `生垣の刈込 高さ${h}m × 長さ${l}m × 奥行き${d}m（概算${area.toFixed(1)}㎡）`;
    caution.textContent = '生垣は高さ×長さを概算面積として計算しています。奥行き・形状・作業量は正式見積り時に反映します。';
  } else {
    const a = Math.max(1, Number($('#areaSize').value) || 1);
    let rate = 0;
    if (type === 'machineWeed') rate = data.rates.machineWeed;
    if (type === 'manualWeed') rate = data.rates.manualWeed;
    if (type === 'leveling') rate = data.rates.leveling;
    if (type === 'sheet') rate = data.rates.sheet;
    if (type === 'gravel') rate = data.rates.gravel;
    if (type === 'sheetGravel') rate = data.rates.sheet + data.rates.gravel;
    amount = rate * a;
    detail = `${$('#serviceSelect option:checked').textContent} ${a}㎡`;
  }

  const disposal = Number($('#disposalSelect').value) || 0;
  if (!quoteOnly && disposal) {
    amount += disposal;
    detail += disposal === 3000 ? '＋処分費少量目安' : '＋処分費軽トラ1台目安';
  }

  $('#estimatePrice').textContent = quoteOnly ? '要お見積り' : yen(amount);
  $('#estimateDetail').textContent = detail;
  return { amount, detail, quoteOnly };
}

$('#serviceSelect').addEventListener('change', () => {
  updateHeightOptions();
  $('#handShears').checked = false;
  $('#pineTree').checked = false;
  calc();
});
['treeHeight', 'treeCount', 'areaSize', 'hedgeHeight', 'hedgeLength', 'hedgeDepth', 'handShears', 'pineTree', 'disposalSelect'].forEach(id => {
  $('#' + id).addEventListener('input', calc);
});

$('#useEstimate').addEventListener('click', () => {
  const r = calc();
  const priceText = r.quoteOnly ? '要お見積り' : yen(r.amount);
  $('#selectedEstimate').textContent = `選択中の概算：${r.detail} / ${priceText}`;
  $('#selectedEstimate').classList.remove('hidden');
  $('#contactMessage').value = `${r.detail} の施工について相談したいです。概算表示：${priceText}`;
  location.hash = 'contact';
});

$('#contactForm').addEventListener('submit', e => {
  e.preventDefault();
  $('#formResult').textContent = '入力ありがとうございます。デモ版のため実際の送信は行いません。本番では写真添付・メール通知・自動返信へ接続します。';
});

$('#menuBtn').onclick = () => {
  $('#mobileMenu').classList.add('open');
  $('#mobileMenu').setAttribute('aria-hidden', 'false');
};
$('#menuClose').onclick = closeMenu;
$$('#mobileMenu a').forEach(a => a.onclick = closeMenu);
function closeMenu() {
  $('#mobileMenu').classList.remove('open');
  $('#mobileMenu').setAttribute('aria-hidden', 'true');
}

const dialog = $('#adminDialog');
$('#adminOpen').onclick = () => dialog.showModal();
$('#adminClose').onclick = () => dialog.close();
$$('.admin-tabs button').forEach(b => b.onclick = () => {
  $$('.admin-tabs button').forEach(x => x.classList.remove('active'));
  $$('.admin-section').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  document.querySelector(`[data-section="${b.dataset.tab}"]`).classList.add('active');
});

const rateFieldMap = {
  ratePrune12: 'prune12', ratePrune23: 'prune23', ratePrune34: 'prune34', ratePrune4: 'prune4',
  rateTrim12: 'trim12', rateTrim23: 'trim23', rateTrim34: 'trim34', rateTrim4: 'trim4',
  rateFell12: 'fell12', rateFell23: 'fell23', rateFell34: 'fell34', rateFell45: 'fell45', rateFell56: 'fell56', rateFell7: 'fell7',
  rateStump12: 'stump12', rateStump24: 'stump24',
  rateMachineWeed: 'machineWeed', rateManualWeed: 'manualWeed', rateHedge: 'hedge',
  rateSpray12: 'spray12', rateSpray23: 'spray23', rateSpray34: 'spray34', rateSpray4: 'spray4',
  rateLeveling: 'leveling', rateSheet: 'sheet', rateGravel: 'gravel'
};

function fillAdmin() {
  const map = {
    editBrand: 'brand', editPhone: 'phone', editEmail: 'email', editArea: 'area',
    editConceptTitle: 'conceptTitle', editConceptText: 'conceptText', seoTitle: 'seoTitle', seoDescription: 'seoDescription'
  };
  for (const [id, key] of Object.entries(map)) $('#' + id).value = data[key];
  for (const [id, key] of Object.entries(rateFieldMap)) $('#' + id).value = data.rates[key];
}

$('#saveBasic').onclick = () => {
  data.brand = $('#editBrand').value.trim() || data.brand;
  data.phone = $('#editPhone').value.trim();
  data.email = $('#editEmail').value.trim();
  data.area = $('#editArea').value.trim();
  save();
};
$('#saveContent').onclick = () => {
  data.conceptTitle = $('#editConceptTitle').value;
  data.conceptText = $('#editConceptText').value;
  save();
};
$('#saveSeo').onclick = () => {
  data.seoTitle = $('#seoTitle').value;
  data.seoDescription = $('#seoDescription').value;
  save();
};
$('#saveRates').onclick = () => {
  for (const [id, key] of Object.entries(rateFieldMap)) data.rates[key] = Math.max(0, Number($('#' + id).value) || 0);
  save();
};

function imgToData(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve('');
    const reader = new FileReader();
    reader.onload = () => {
      const im = new Image();
      im.onload = () => {
        const max = 900;
        const scale = Math.min(1, max / Math.max(im.width, im.height));
        const c = document.createElement('canvas');
        c.width = Math.round(im.width * scale);
        c.height = Math.round(im.height * scale);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', .8));
      };
      im.onerror = reject;
      im.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

$('#addWork').onclick = async () => {
  const title = $('#workTitle').value.trim();
  if (!title) return alert('タイトルを入力してください');
  const [before, after] = await Promise.all([imgToData($('#beforeFile').files[0]), imgToData($('#afterFile').files[0])]);
  data.works.unshift({
    id: Date.now(), title, desc: $('#workDesc').value.trim(), price: $('#workPrice').value.trim(), before, after
  });
  save();
  ['workTitle', 'workDesc', 'workPrice', 'beforeFile', 'afterFile'].forEach(id => $('#' + id).value = '');
};

function renderAdminWorks() {
  const box = $('#adminWorks');
  if (!box) return;
  box.innerHTML = '';
  data.works.forEach(w => {
    const row = document.createElement('div');
    row.className = 'admin-work-row';
    row.innerHTML = `<span>${esc(w.title)}</span><button type="button">削除</button>`;
    row.querySelector('button').onclick = () => {
      data.works = data.works.filter(x => x.id !== w.id);
      save();
    };
    box.appendChild(row);
  });
}

renderAll();


// v8: clearer header navigation
const headerEl = document.querySelector('.header');
const navItems = document.querySelectorAll('[data-nav-target]');
const trackedSections = ['concept','service','works','price','contact']
  .map(id => document.getElementById(id))
  .filter(Boolean);

function setActiveNav(id){
  navItems.forEach(link => link.classList.toggle('active', link.dataset.navTarget === id));
}

function refreshHeaderState(){
  if(headerEl){
    headerEl.classList.toggle('scrolled', window.scrollY > 24);
  }
  let current = trackedSections.length ? trackedSections[0].id : null;
  const offset = (headerEl ? headerEl.offsetHeight : 90) + 40;
  trackedSections.forEach(section => {
    if(window.scrollY + offset >= section.offsetTop){
      current = section.id;
    }
  });
  if(current) setActiveNav(current);
}

window.addEventListener('scroll', refreshHeaderState, {passive:true});
window.addEventListener('resize', refreshHeaderState);
window.addEventListener('load', refreshHeaderState);
refreshHeaderState();
