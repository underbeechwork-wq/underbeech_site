/* v44: Latest five施工事例, from works/cases.json, with static HTML fallback. */
(() => {
  'use strict';
  const section = document.getElementById('works');
  const rail = document.getElementById('recentWorkRail');
  const previous = document.getElementById('recentWorkPrev');
  const next = document.getElementById('recentWorkNext');
  const count = document.getElementById('recentWorkCount');
  if (!section || !rail || !previous || !next || !count) return;

  const getCards = () => Array.from(rail.querySelectorAll('.recent-work-card'));
  const add = (tag, className, content) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  };

  function makeFigure(entry, kind) {
    const figure = document.createElement('figure');
    figure.append(add('span', '', kind === 'before' ? '施工前' : '施工後'));
    const image = document.createElement('img');
    image.src = entry[kind];
    const prefix = entry[kind].replace(/\.webp$/, '');
    image.srcset = `${prefix}-640.webp 640w, ${prefix}-960.webp 960w, ${entry[kind]} 1200w`;
    image.sizes = '(max-width:620px) 43vw, 30vw';
    image.width = entry.imageWidth || 1200;
    image.height = entry.imageHeight || 900;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.alt = `${entry.place} ${entry.service} ${kind === 'before' ? '施工前' : '施工後'}`;
    figure.append(image);
    return figure;
  }

  function makeCard(entry) {
    const link = add('a', 'recent-work-card');
    link.dataset.workId = entry.id;
    link.href = entry.url;
    const photos = add('div', 'recent-work-images');
    photos.append(makeFigure(entry, 'before'), makeFigure(entry, 'after'));
    const body = add('div', 'recent-work-body');
    const meta = add('div', 'recent-work-meta');
    meta.append(add('span', '', entry.place), add('span', '', entry.service));
    const more = add('span', 'recent-work-more', '施工内容を見る ');
    const arrow = add('span', '', '→');
    arrow.setAttribute('aria-hidden', 'true');
    more.append(arrow);
    body.append(meta, add('h3', '', entry.title), add('p', '', entry.summary), more);
    link.append(photos, body);
    return link;
  }

  let observer;
  const updateButtons = () => {
    const maximum = Math.max(0, rail.scrollWidth - rail.clientWidth);
    previous.disabled = maximum < 4 || rail.scrollLeft < 3;
    next.disabled = maximum < 4 || rail.scrollLeft > maximum - 3;
    count.textContent = `最新${getCards().length}件を表示`;
  };

  const move = direction => {
    const cards = getCards();
    if (!cards.length) return;
    const step = cards[0].getBoundingClientRect().width +
      parseFloat(getComputedStyle(rail).gap || 0);
    const maximum = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const target = Math.min(maximum, Math.max(0, rail.scrollLeft + direction * step));
    rail.scrollTo({ left: target, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };

  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  rail.addEventListener('scroll', updateButtons, { passive: true });
  window.addEventListener('resize', updateButtons, { passive: true });
  section.dataset.carouselReady = 'true';
  updateButtons();

  // The static two-card markup remains usable if JSON cannot be loaded.
  fetch('works/cases.json?v=44')
    .then(response => {
      if (!response.ok) throw new Error('List unavailable');
      return response.json();
    })
    .then(items => {
      if (!Array.isArray(items)) return;
      const latest = items.filter(item => item && item.id && item.url && item.before && item.after && item.place && item.title)
        .sort((a, b) => String(b.datePublished || '').localeCompare(String(a.datePublished || '')))
        .slice(0, 5);
      if (!latest.length) return;
      const current = getCards().map(node => node.dataset.workId).join('|');
      const target = latest.map(item => item.id).join('|');
      if (target !== current) {
        const fragment = document.createDocumentFragment();
        latest.forEach(item => fragment.append(makeCard(item)));
        rail.replaceChildren(fragment);
        rail.scrollLeft = 0;
      }
      updateButtons();
    })
    .catch(() => {
      // Keep server-rendered cards if the connection fails or is offline.
      updateButtons();
    });
})();
