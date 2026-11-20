import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const code = await readFile(new URL('../public/story-thread.js', import.meta.url), 'utf8');

// Execute the production controller with layout fixtures and sampled cubic SVG
// geometry. Check behavior, not screenshots: progression, reverse, resize, motion.
function run(width, viewport = width <= 700 ? 844 : 900) {
  let layout, id = 0, clock = 0;
  const frames = new Map(), events = {}, activated = [];
  const motion = { matches: false, addEventListener: (_, fn) => { events.motion = fn; } };
  const window = { scrollY: 0, innerHeight: viewport, addEventListener: (key, fn) => { events[key] = fn; } };
  class Element {
    constructor(key) {
      this.key = key; this.attrs = {}; this.style = {}; this.children = []; this.classes = new Set();
      this.classList = { toggle: (name, on) => {
        if (on && !this.classes.has(name) && name === 'is-journey-active') activated.push(this.key);
        if (on) this.classes.add(name); else this.classes.delete(name);
      } };
    }
    setAttribute(key, value) { this.attrs[key] = String(value); }
    removeAttribute(key) { delete this.attrs[key]; }
    append(child) { this.children.push(child); }
    matches(selector) { return selector === '.process-icon' && this.key.startsWith('icon'); }
    getBoundingClientRect() {
      const [left, y, width, height] = layout[this.key];
      const top = y - window.scrollY;
      return { left, top, right: left + width, bottom: top + height, width, height };
    }
    samples() {
      const n = this.attrs.d.match(/-?\d+(?:\.\d+)?/g).map(Number);
      let from = [n[0], n[1]], samples = [{ x: from[0], y: from[1], length: 0 }], length = 0;
      for (let k = 2; k < n.length; k += 6) {
        const a = [n[k], n[k + 1]], b = [n[k + 2], n[k + 3]], end = [n[k + 4], n[k + 5]];
        for (let j = 1; j <= 32; j++) {
          const t = j / 32, u = 1 - t;
          const p = [0, 1].map(axis => u ** 3 * from[axis] + 3 * u ** 2 * t * a[axis] + 3 * u * t ** 2 * b[axis] + t ** 3 * end[axis]);
          const prev = samples.at(-1);
          length += Math.hypot(p[0] - prev.x, p[1] - prev.y);
          samples.push({ x: p[0], y: p[1], length });
        }
        from = end;
      }
      return samples;
    }
    getTotalLength() { return this.samples().at(-1).length; }
    getPointAtLength(length) { return this.samples().find(p => p.length >= length) || this.samples().at(-1); }
  }
  const keys = ['main','svg','path','rail','measure','head','mask','base','cutouts','gradient','turn','hero','wave','first','second','studio','icon1','icon2','icon3','button','contact','project1','project2','step1','step2','step3'];
  keys.push('third','fourth','project3','project4','parkSeam','parkMask');
  const el = Object.fromEntries(keys.map(key => [key, new Element(key)]));
  Object.defineProperties(el.main, { clientWidth: { get: () => layout.main[2] }, offsetHeight: { get: () => layout.main[3] } });
  const selectors = { main:'main','.journey-thread':'svg','.journey-thread-path':'path','.journey-thread-rail':'rail','.journey-thread-measure':'measure','.journey-thread-head':'head',
    '#thread-content-mask':'mask','.thread-mask-base':'base','.thread-content-cutouts':'cutouts','#thread-color':'gradient','.thread-color-turn':'turn',
    '.park-seam':'parkSeam','.thread-park-wave':'parkMask',
    '.hero':'hero','.film-wave':'wave','#smile-video':'first','#comfort-video':'second','.studio':'studio','[data-contact]':'button','.contact':'contact' };
  const select = key => el[selectors[key]];
  el.svg.querySelector = select;
  const projects = [el.project1,el.project2,el.project3,el.project4];
  const targets = [...projects,el.step1,el.step2,el.step3,el.button];
  const document = { hidden:false,
    documentElement: { get scrollHeight() { return layout.main[3]; } },
    querySelector:select,
    querySelectorAll(selector) {
      if (selector === '.process-icon') return [el.icon1,el.icon2,el.icon3];
      if (selector === '.film-project') return projects;
      if (selector === '.film-player video') return [el.first,el.second,el.third,el.fourth];
      if (selector === '.process-steps li') return [el.step1,el.step2,el.step3];
      return [el.first,el.second,el.icon1,el.icon2,el.icon3,el.button];
    },
    createElementNS:() => new Element('mask-rect'),
    addEventListener:(name, fn) => { events[name] = fn; }
  };
  const context = vm.createContext({ window, document, matchMedia:() => motion, console,
    requestAnimationFrame:fn => { frames.set(++id, fn); return id; },
    cancelAnimationFrame:key => frames.delete(key) });
  function fixture(w) {
    const phone = w <= 700;
    const boxes = { main:[0,0,w,phone?2480:2650],hero:[0,0,w,phone?650:960],wave:[0,phone?634:850,w,phone?16:110],
      first:[w*(phone?.43:.26),phone?730:1050,w*(phone?.5:.21),phone?350:530],
      second:[w*(phone?.07:.55),phone?1180:1080,w*(phone?.5:.21),phone?350:530],
      studio:[0,phone?1640:1840,w,520],contact:[0,phone?2160:2360,w,290],
      icon1:[w*(phone?.12:.48),phone?1950:1990,74,74],icon2:[w*(phone?.42:.65),phone?1950:1990,74,74],icon3:[w*(phone?.72:.82),phone?1950:1990,74,74],
      button:[w*(phone?.08:.73),phone?2340:2450,phone?w*.7:250,54] };
    const offset = phone ? 1250 : 1550;
    boxes.main[3] += offset;
    boxes.parkSeam = [0,boxes.second[1]+boxes.second[3]+80,w,phone?60:80];
    for (const key of ['studio','contact','icon1','icon2','icon3','button']) boxes[key][1] += offset;
    boxes.third = [...boxes.first]; boxes.third[1] += offset;
    boxes.fourth = [...boxes.second]; boxes.fourth[1] += offset;
    return boxes;
  }
  function flush() {
    let steps = 0;
    while (frames.size) {
      assert(++steps < 300, 'Animation must settle instead of running forever');
      const batch = [...frames.values()]; frames.clear(); clock += 16;
      batch.forEach(fn => fn(clock));
    }
  }
  layout = fixture(width);
  vm.runInContext(code, context); flush();
  const max = Math.max(0, layout.main[3] - viewport);
  const samples=el.path.samples();
  for(const [x,y,w,h] of [layout.first,layout.second]){
    const inside=p=>p.x>x && p.x<x+w && p.y>y && p.y<y+h;
    const last=samples.findLastIndex(inside);
    assert(last>0 && (width>700 && x===layout.first[0] ? samples[last+1].x>=x+w : samples[last+1].y>=y+h),'Thread exits on the reference edge');
  }
  assert.equal(Number(el.path.style.strokeDashoffset), el.path.getTotalLength(), 'No animated line before scrolling');
  for (let y = 0; y <= max + 20; y += 20) { window.scrollY = Math.min(y,max); events.scroll(); flush(); }
  assert.deepEqual(activated, ['project1','project2','project3','project4','step3','step2','step1','button'], 'Activate in story order');
  assert(Number(el.path.style.strokeDashoffset) < .5, 'Reach the CTA by the bottom');
  assert.equal(el.path.attrs['marker-end'], 'url(#thread-arrow)');
  assert(targets.every(target => target.classes.has('is-journey-reached')));
  for (let y = max; y >= -20; y -= 20) { window.scrollY = Math.max(0,y); events.scroll(); flush(); }
  assert(targets.every(target => !target.classes.has('is-journey-reached')), 'Rewind all highlights');
  assert(!el.path.attrs['marker-end'], 'Hide end arrow before it is reached');
  assert.equal(Number(el.path.style.strokeDashoffset), el.path.getTotalLength());
  layout = fixture(width > 700 ? 390 : 1440); events.resize(); flush();
  assert.equal(Number(el.svg.attrs.width), layout.main[2]);
  assert.equal(Number(el.svg.attrs.height), layout.main[3]);
  assert(!/NaN|undefined|Infinity/.test(el.path.attrs.d));
  motion.matches = true; events.motion(); flush();
  assert.equal(Number(el.path.style.strokeDashoffset), el.path.getTotalLength(), 'Reduced motion also hides the untraveled path');
  assert.equal(el.head.attrs.opacity, '0', 'Reduced motion hides the moving point');
  return width;
}
const widths = [320,390,700,701,1024,1440,1920].map(width => run(width));
console.log(`Scroll controller passed at ${widths.join(', ')}px: eight ordered activations, reverse scroll, CTA completion, responsive resize, reduced motion, and settled animation frames.`);
