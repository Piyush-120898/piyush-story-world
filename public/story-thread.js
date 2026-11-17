// Arc length maps the continuous SVG to ordered scroll stages. On desktop,
// the two films activate in sequence even though they sit side by side.
(() => {
  const main = document.querySelector('main');
  const svg = document.querySelector('.journey-thread');
  const line = svg.querySelector('.journey-thread-path');
  const measure = svg.querySelector('.journey-thread-measure');
  const head = svg.querySelector('.journey-thread-head');
  const mask = svg.querySelector('#thread-content-mask');
  const maskBase = svg.querySelector('.thread-mask-base');
  const gradient = svg.querySelector('#thread-color');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const protectedElements = [...document.querySelectorAll(
    '.site-header, .hero-copy, .film-caption, .film-player, .film-note, ' +
    '.playback-status, .section-heading, .explore-studio, .studio-intro, ' +
    '.process-intro, .process-icon, .process-steps h3, .process-steps p, ' +
    '.contact-inner > div, [data-contact], footer'
  )];
  const cutouts = svg.querySelector('.thread-content-cutouts');
  const masks = [];
  const filmStages = [...document.querySelectorAll('.film-project')];
  const iconStages = [...document.querySelectorAll('.process-steps li')].reverse();
  const contactButton = document.querySelector('[data-contact]');
  const targets = [...filmStages, ...iconStages, contactButton];
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  let layoutFrame = 0, paintFrame = 0, previousTime = 0;
  let totalLength = 0, currentLength = 0, targetLength = 0;
  let filmExits = [];
  let timeline = [], milestones = [], stage = -2, pageStart = 0;

  function paint(time = 0) {
    paintFrame = 0;
    const delta = previousTime ? Math.min(64, time - previousTime) : 16;
    previousTime = time;
    if (motion.matches) currentLength = targetLength;
    else currentLength += (targetLength - currentLength) * (1 - Math.exp(-delta / 65));
    if (Math.abs(targetLength - currentLength) < 0.3) currentLength = targetLength;
    const visible = currentLength;
    line.style.visibility = visible > 0 ? 'visible' : 'hidden';
    line.style.strokeDashoffset = String(Math.max(0, totalLength - visible));
    const complete = visible >= totalLength - 0.5;
    if (complete && totalLength > 0) line.setAttribute('marker-end', 'url(#thread-arrow)');
    else line.removeAttribute('marker-end');
    const showHead = !motion.matches && currentLength > 1 && !complete;
    head.setAttribute('opacity', showHead ? '1' : '0');
    if (showHead) {
      const p = line.getPointAtLength(currentLength);
      const a = line.getPointAtLength(Math.max(0,currentLength-2)), b = line.getPointAtLength(Math.min(totalLength,currentLength+2));
      head.setAttribute('transform', 'translate('+p.x+' '+p.y+') rotate('+Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI+')');
    }
    let next = -1;
    milestones.forEach((milestone, i) => { if (currentLength >= milestone.length - 1) next = i; });
    if (next !== stage) {
      stage = next;
      targets.forEach((element, i) => {
        element.classList.toggle('is-journey-reached', i <= stage);
        if (i >= filmStages.length) element.classList.toggle('is-journey-active', i === stage);
      });
    }
    filmStages.forEach((el,i) => el.classList.toggle('is-journey-active', currentLength >= milestones[i].length && currentLength < filmExits[i]));
    if (Math.abs(targetLength - currentLength) > 0.3 && !document.hidden) paintFrame = requestAnimationFrame(paint);
    else previousTime = 0;
  }

  function updateProgress(immediate = false) {
    if (!timeline.length || !totalLength) return;
    const scroll = window.scrollY - pageStart;
    if (timeline.at(-1).scroll === 0) targetLength = totalLength;
    else if (scroll <= timeline[0].scroll) targetLength = 0;
    else if (scroll >= timeline.at(-1).scroll) targetLength = totalLength;
    else {
      for (let i = 1; i < timeline.length; i++) {
        if (scroll <= timeline[i].scroll) {
          const from = timeline[i - 1], to = timeline[i];
          const progress = clamp((scroll - from.scroll) / (to.scroll - from.scroll), 0, 1);
          targetLength = from.length + (to.length - from.length) * progress;
          break;
        }
      }
    }
    if (immediate || motion.matches) currentLength = targetLength;
    if (!paintFrame) paintFrame = requestAnimationFrame(paint);
  }

  function layout() {
    layoutFrame = 0;
    const origin = main.getBoundingClientRect();
    const width = main.clientWidth, height = main.offsetHeight;
    const viewport = window.innerHeight, phone = width <= 700;
    pageStart = origin.top + window.scrollY;
    function bounds(selector) {
      const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
      const r = element.getBoundingClientRect();
      return { left: r.left - origin.left, right: r.right - origin.left,
        top: r.top - origin.top, bottom: r.bottom - origin.top,
        width: r.width, height: r.height,
        x: r.left - origin.left + r.width / 2, y: r.top - origin.top + r.height / 2 };
    }
    const hero = bounds('.hero'), wave = bounds('.film-wave');
    const first = bounds('#smile-video'), second = bounds('#comfort-video');
    const studio = bounds('.studio'), contact = bounds('.contact');
    const icons = [...document.querySelectorAll('.process-icon')].map(bounds).reverse();
    const button = bounds(contactButton);
    const point = (x, y) => `${Math.round(clamp(x, 12, width - 12) * 10) / 10} ${Math.round(y * 10) / 10}`;
    const d = [];
    milestones = [];
    function curve(a, b, c, milestone = false) {
      d.push(`C ${point(...a)} ${point(...b)} ${point(...c)}`);
      if (milestone) {
        measure.setAttribute('d', d.join(' '));
        milestones.push({ length: measure.getTotalLength() });
      }
    }
    // The homeowner stands on the right. Anchor beside his visible base,
    // just above the navy curve, rather than in the middle of the street.
    const start = [width * 0.78, hero.bottom - wave.height * 0.86 - 6];
    d.push(`M ${point(...start)}`);
    filmExits = [];
    function markExit() {
      measure.setAttribute('d',d.join(' '));
      filmExits.push(measure.getTotalLength());
    }
    const firstIn=first.left+first.width*.77;
    curve([start[0]-width*.10,start[1]-width*.045],[firstIn+width*.09,first.top-width*.085],[firstIn,first.top],true);
    const exitX=second.left+second.width*.34;
    if(phone){
      const x=first.left+first.width*.68, gap=second.top-first.bottom;
      curve([firstIn-first.width*.40,first.top+first.height*.25],[x-first.width*.30,first.bottom-30],[x,first.bottom]);
      markExit();
      const into=second.left+second.width*.35;
      curve([x+first.width*.34,first.bottom+gap*.48],[into-second.width*.24,second.top-gap*.48],[into,second.top],true);
      curve([into+second.width*.4,second.top+second.height*.24],[exitX-second.width*.25,second.bottom-38],[exitX,second.bottom]);
    }else{
      const into=second.bottom-second.height*.08;
      const out=Math.min(first.bottom-first.height*.08,into-(second.left-first.right)*.40);
      curve([firstIn-first.width*.52,first.top+first.height*.30],[first.right-first.width*.65,out-first.height*.15],[first.right,out]);
      markExit();
      const gap=second.left-first.right;
      curve([first.right+gap*.33,out+(into-out)*.33],[second.left-gap*.33,into-(into-out)*.33],[second.left,into],true);
      curve([second.left+second.width*.12,into+second.height*.025],[exitX-second.width*.11,second.bottom-second.height*.04],[exitX,second.bottom]);
    }
    markExit();
    const entry=icons[0], drop=entry.y-second.bottom;
    const shoulder=[exitX+(entry.x-exitX)*.50,second.bottom+drop*(phone?.16:.24)];
    if(phone){
      curve([exitX+width*.56,second.bottom+drop*.21],[entry.x-width*.28,entry.y-drop*.30],[entry.x,entry.y],true);
    }else{
    curve([exitX+second.width*.22,second.bottom+drop*.16],[shoulder[0]-width*.07,shoulder[1]-5],shoulder);
    curve([shoulder[0]+width*.12,shoulder[1]+9],[entry.x,entry.y-drop*.40],[entry.x,entry.y],true);
    }
    for(let i=1;i<icons.length;i++){
      const from=icons[i-1],to=icons[i],dx=(to.x-from.x)*.37,bend=(i%2?1:-1)*(phone?22:36);
      curve([from.x+dx,from.y+bend],[to.x-dx,to.y+bend],[to.x,to.y],true);
    }
    const last=icons.at(-1);
    if(phone){
      const rim=width-15, endX=button.right+7;
      const crown=contact.top+(button.y-contact.top)*.40;
      const lowerRadius=button.y-crown;
      curve([last.x+width*.24,last.y+width*.13],
        [rim,crown-lowerRadius*.80],[rim,crown]);
      curve([rim,crown+lowerRadius*.5523],
        [endX+(rim-endX)*.5523,button.y],[endX,button.y],true);
    }else{
      curve([last.x-48,last.y+50],[width*.49,contact.top-20],[width*.58,contact.top]);
      curve([width*.64,contact.top+14],[button.left-10,button.top-45],[button.left+12,button.top-7],true);
    }
    const path = d.join(' ');
    line.style.visibility = 'hidden';
    line.setAttribute('d', path);
    totalLength = line.getTotalLength();
    line.style.strokeDasharray = `${totalLength} ${totalLength}`;
    line.style.strokeDashoffset = String(totalLength);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', width); svg.setAttribute('height', height);
    mask.setAttribute('x', '0'); mask.setAttribute('y', '0');
    mask.setAttribute('width', width); mask.setAttribute('height', height);
    maskBase.setAttribute('width', width); maskBase.setAttribute('height', height);
    gradient.setAttribute('y2', button.top);
    svg.querySelector('.thread-color-turn').setAttribute('offset', `${Math.min(96, contact.top / button.top * 100)}%`);
    let index = 0;
    function protect(rect, padding) {
      let node = masks[index++];
      if (!node) {
        node = document.createElementNS('http://www.w3.org/2000/svg','rect');
        masks.push(node); cutouts.append(node);
      }
      node.setAttribute('x',rect.left-origin.left-padding); node.setAttribute('y',rect.top-origin.top-padding);
      node.setAttribute('width',rect.width+2*padding); node.setAttribute('height',rect.height+2*padding);
    }
    protectedElements.forEach(element => {
      if (!document.createRange || element.matches('.film-player, .process-icon, [data-contact]')) {
        protect(element.getBoundingClientRect(),element.matches('.film-player') ? 0 : element.matches('.process-icon') ? 1 : 6);
      } else {
        const walker = document.createTreeWalker(element,NodeFilter.SHOW_TEXT), range = document.createRange();
        while(walker.nextNode()) if(walker.currentNode.textContent.trim()) {
          range.selectNodeContents(walker.currentNode);
          for(const rect of range.getClientRects()) protect(rect,2);
        }
      }
    });
    while(masks.length>index) masks.pop().remove();
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - viewport - pageStart);
    const desired = [
      start[1] - viewport * 0.86,
      first.top + first.height * 0.26 - viewport * 0.7,
      phone ? second.top + second.height * 0.3 - viewport * 0.63 : second.top + second.height * 0.8 - viewport * 0.6,
      icons[0].y - viewport * 0.78, icons[1].y - viewport * 0.64,
      icons[2].y - viewport * 0.5, button.y - viewport * 0.55
    ];
    const end = clamp(desired.at(-1), 0, maxScroll);
    const spacing = Math.min(65, viewport * 0.075, end / (desired.length * 2));
    timeline = desired.map((scroll, i) => {
      const minimum = i === 0 ? 0 : desired[i - 1] + spacing;
      const maximum = Math.max(0, end - (desired.length - 1 - i) * spacing);
      desired[i] = clamp(scroll, minimum, maximum);
      return { scroll: desired[i], length: i === 0 ? 0 : milestones[i - 1].length };
    });
    stage = -2;
    updateProgress(true);
  }

  function scheduleLayout() { if (!layoutFrame) layoutFrame = requestAnimationFrame(layout); }
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(scheduleLayout);
    [main, ...document.querySelectorAll('.hero, .film-player, .studio-inner, .process, .contact-inner')].forEach(el => observer.observe(el));
  }
  window.addEventListener('scroll', () => updateProgress(), { passive: true });
  window.addEventListener('resize', scheduleLayout, { passive: true });
  window.addEventListener('load', scheduleLayout, { once: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(paintFrame); paintFrame = 0; previousTime = 0; }
    else updateProgress(true);
  });
  motion.addEventListener('change', scheduleLayout);
  document.fonts?.ready.then(scheduleLayout);
  scheduleLayout();
})();
