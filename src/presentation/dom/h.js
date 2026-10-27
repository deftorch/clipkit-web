const svgNS = 'http://www.w3.org/2000/svg';

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];

export function el(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const k in attrs) {
    if (k === 'class') e.className = attrs[k];
    else if (k === 'text') e.textContent = attrs[k];
    else e.setAttribute(k, attrs[k]);
  }
  for (const c of kids) {
    if (c != null) e.append(c.nodeType ? c : document.createTextNode(c));
  }
  return e;
}

export function sv(tag, attrs = {}) {
  const e = document.createElementNS(svgNS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  return e;
}

export const fmt2 = (x, d = 2) => (+x).toFixed(d);

export function copyText(txt, btn) {
  const done = () => {
    if (!btn) return;
    const o = btn.textContent;
    btn.textContent = 'Tersalin';
    setTimeout(() => { btn.textContent = o; }, 1200);
  };
  const fb = () => {
    const ta = el('textarea', { style: 'position:fixed;opacity:0' });
    ta.value = txt;
    document.body.append(ta);
    ta.select();
    try {
      document.execCommand('copy');
      done();
    } catch (e) {}
    ta.remove();
  };
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(txt).then(done, fb);
  } else {
    fb();
  }
}
