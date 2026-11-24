// Animaciones de la interfaz, adaptadas a este sitio a partir de React Bits (reactbits.dev), de David Haz:
// DecryptedText, BlurText, CountUp, AnimatedList, ClickSpark, Magnet, StarBorder, SpotlightCard y LetterGlitch.
// Licencia MIT + Commons Clause: el texto está en LICENCIA-REACT-BITS.txt.
window.Anim = (() => {
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches, fino = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const LETRAS = '.:-=+*oO#%@', azar = () => LETRAS[Math.random() * LETRAS.length | 0], SUAVE = 'cubic-bezier(.22,1,.36,1)';
  const crea = (t, c, txt) => { const e = document.createElement(t); if (c) e.className = c; if (txt !== undefined) e.textContent = txt; return e; };
  const vivas = new Map(); // elemento -> función que lo deja como estaba
  const corta = el => { const f = vivas.get(el); if (f) f(); };

  // parte el texto en palabras sin tocar los saltos de línea; devuelve cómo restaurarlo
  function parte(el, pieza) {
    const nodos = [...el.childNodes], f = document.createDocumentFragment(), texto = nodos.map(n => n.nodeName === "BR" ? " " : n.textContent).join("").trim();
    for (const n of nodos) {
      if (n.nodeType !== 3) { f.append(n.cloneNode(true)); continue; }
      for (const t of n.textContent.split(/(\s+)/)) { if (!t) continue; if (/^\s/.test(t)) f.append(t); else f.append(pieza(t)); }
    }
    const habia = el.getAttribute('aria-label'), capa = crea('span'); capa.setAttribute('aria-hidden', 'true'); capa.append(f);
    if (/^H\d$|^A$|^BUTTON$/.test(el.tagName)) el.setAttribute('aria-label', habia || texto);
    el.replaceChildren(capa);
    return () => { if (el.firstChild === capa) el.replaceChildren(...nodos); if (habia === null) el.removeAttribute('aria-label'); };
  }

  // DecryptedText: las letras se descifran de izquierda a derecha sin mover el texto de su sitio
  function descifra(el, dur = 480) {
    corta(el); if (quieto || !el || !el.textContent.trim() || [...el.children].some(c => c.tagName !== 'BR')) return;
    const celdas = [], vuelve = parte(el, t => { const p = crea('span', 'an-pal'); for (const l of t) { const c = crea('span', 'an-cel'), g = crea('span', 'an-fan', l), s = crea('span', 'an-gli', azar()); c.append(g, s); p.append(c); celdas.push({ g, s }); } return p; });
    let raf = 0, cambio = 0; const t0 = performance.now(), fin = () => { cancelAnimationFrame(raf); vivas.delete(el); vuelve(); };
    celdas.forEach((c, i) => c.t = (i / celdas.length * .72 + Math.random() * .2) * dur);
    const paso = t => { const q = t - t0, toca = t - cambio > 45; if (toca) cambio = t; for (const c of celdas) if (!c.ya) { if (q >= c.t) { c.ya = 1; c.s.remove(); c.g.classList.add('ya'); } else if (toca) c.s.textContent = azar(); } if (q > dur) return fin(); raf = requestAnimationFrame(paso); };
    vivas.set(el, fin); raf = requestAnimationFrame(paso);
  }

  // BlurText: las palabras entran enfocándose
  function enfoca(el, espera = 60) {
    corta(el); if (quieto || !el || !el.textContent.trim() || el.children.length || !el.animate) return;
    const pal = [], vuelve = parte(el, t => { const p = crea('span', 'an-pal', t); pal.push(p); return p; }), paso = Math.min(18, 380 / pal.length);
    const an = pal.map((p, i) => p.animate(fino ? [{ opacity: 0, filter: 'blur(7px)', transform: 'translateY(-7px)' }, { opacity: .7, filter: 'blur(2px)', transform: 'translateY(2px)', offset: .55 }, { opacity: 1, filter: 'blur(0)', transform: 'none' }] : [{ opacity: 0, transform: 'translateY(-7px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: espera + i * paso, fill: 'both', easing: SUAVE }));
    const fin = () => { vivas.delete(el); an.forEach(a => a.cancel()); vuelve(); }; vivas.set(el, fin); an[an.length - 1].onfinish = fin;
  }

  // AnimatedList: los elementos entran uno tras otro
  function escalona(lista, espera = 0) {
    if (quieto) return; [...lista].slice(0, 40).forEach((e, i) => e.animate && e.animate([{ opacity: 0, transform: 'translateY(12px) scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 360, delay: espera + Math.min(i * 34, 420), fill: 'backwards', easing: SUAVE }));
  }

  // CountUp: los números suben hasta su valor
  function cuenta(el, dur = 800) {
    const n = +(el.dataset.n || (el.dataset.n = el.textContent)); if (quieto || !n) return; corta(el); let raf = 0; const t0 = performance.now(), fin = () => { cancelAnimationFrame(raf); vivas.delete(el); el.textContent = n; };
    const paso = t => { const q = Math.min(1, (t - t0) / dur); el.textContent = Math.round(n * (1 - Math.pow(1 - q, 4))); if (q >= 1) return fin(); raf = requestAnimationFrame(paso); }; vivas.set(el, fin); raf = requestAnimationFrame(paso);
  }

  // LetterGlitch: fondo de letras que cambian. Devuelve cómo quitarlo
  function letras(donde, opc = {}) {
    if (quieto || !donde) return () => {}; const c = crea('canvas', 'an-letras'); c.setAttribute('aria-hidden', 'true'); donde.append(c); const x = c.getContext('2d'), d = Math.min(devicePixelRatio || 1, 1.5), CW = 12, CH = 19, TONOS = opc.tonos || [[23, 50, 61], [255, 177, 74], [127, 232, 221], [90, 60, 24]];
    let L = [], cols = 0, filas = 0, raf = 0, ult = 0; const tono = () => TONOS[Math.random() * TONOS.length | 0];
    const mide = () => { const W = c.clientWidth, H = c.clientHeight; c.width = W * d; c.height = H * d; cols = Math.ceil(W / CW); filas = Math.ceil(H / CH); L = Array.from({ length: cols * filas }, () => ({ l: azar(), c: tono().slice(), z: tono() })); };
    const ro = window.ResizeObserver ? new ResizeObserver(mide) : null; if (ro) ro.observe(c); mide();
    const paso = t => { raf = requestAnimationFrame(paso); if (t - ult < 50) return; ult = t; const n = Math.max(1, L.length * .06 | 0); for (let i = 0; i < n; i++) { const q = L[Math.random() * L.length | 0]; if (q) { q.l = azar(); q.z = tono(); } } x.setTransform(d, 0, 0, d, 0, 0); x.clearRect(0, 0, c.clientWidth, c.clientHeight); x.font = '600 14px "Martian Mono",Consolas,monospace'; x.textBaseline = 'top'; L.forEach((q, i) => { for (let k = 0; k < 3; k++) q.c[k] += (q.z[k] - q.c[k]) * .14; x.fillStyle = `rgb(${q.c[0] | 0},${q.c[1] | 0},${q.c[2] | 0})`; x.fillText(q.l, i % cols * CW, (i / cols | 0) * CH); }); };
    raf = requestAnimationFrame(paso); return () => { cancelAnimationFrame(raf); if (ro) ro.disconnect(); c.remove(); };
  }

  // ClickSpark: al tocar saltan caracteres
  let lz = null, chispas = [], rafC = 0;
  function chispa(x, y) {
    if (!lz) { lz = crea('canvas', 'an-chispas'); lz.setAttribute('aria-hidden', 'true'); document.body.append(lz); }
    const d = Math.min(devicePixelRatio || 1, 2); if (lz.width !== innerWidth * d || lz.height !== innerHeight * d) { lz.width = innerWidth * d; lz.height = innerHeight * d; }
    const t = performance.now(), n = 8; for (let i = 0; i < n; i++) chispas.push({ x, y, a: i / n * 6.283 + (Math.random() - .5) * .5, r: 22 + Math.random() * 16, l: '+*·#%@'[Math.random() * 6 | 0], t, v: 380 + Math.random() * 160, c: i % 3 ? '#ffb14a' : '#7fe8dd' });
    if (chispas.length > 80) chispas.splice(0, chispas.length - 80); if (!rafC) rafC = requestAnimationFrame(pintaChispas);
  }
  function pintaChispas(t) {
    const x = lz.getContext('2d'), d = lz.width / innerWidth; x.setTransform(d, 0, 0, d, 0, 0); x.clearRect(0, 0, innerWidth, innerHeight); x.textAlign = 'center'; x.textBaseline = 'middle';
    chispas = chispas.filter(c => t - c.t < c.v); for (const c of chispas) { const p = Math.max(0, (t - c.t) / c.v), e = 1 - Math.pow(1 - p, 3); x.globalAlpha = 1 - p * p; x.fillStyle = c.c; x.font = `700 ${15 - 6 * p}px "Martian Mono",Consolas,monospace`; x.fillText(c.l, c.x + Math.cos(c.a) * c.r * e, c.y + Math.sin(c.a) * c.r * e); }
    x.globalAlpha = 1; rafC = chispas.length ? requestAnimationFrame(pintaChispas) : 0;
  }
  if (!quieto) {
    let ini = null; addEventListener('pointerdown', e => ini = [e.clientX, e.clientY], true);
    addEventListener('click', e => { if (!e.detail || !ini || Math.hypot(e.clientX - ini[0], e.clientY - ini[1]) > 10 || e.target.closest && e.target.closest('input,select,dialog,.editor')) return; chispa(e.clientX, e.clientY); }, true);
  }

  if (fino && !quieto) {
    // SpotlightCard: la luz sigue al cursor dentro de cada tarjeta
    const TARJ = '.carta,.color,[data-baja],.ver,.compartir,.donde button,.chips button,.dos button';
    // Magnet: los botones principales se acercan un poco al cursor
    let pend = null, raf = 0; const iman = new Set();
    const mueve = () => { raf = 0; const e = pend, t = e.target.closest && e.target.closest(TARJ); if (t) { const r = t.getBoundingClientRect(); t.style.setProperty('--mx', e.clientX - r.left + 'px'); t.style.setProperty('--my', e.clientY - r.top + 'px'); }
      for (const b of document.querySelectorAll('.boton,#elegir')) { const r = b.getBoundingClientRect(); if (!r.width) continue; const [ox, oy] = b._im || [0, 0], x = e.clientX - (r.left - ox + r.width / 2), y = e.clientY - (r.top - oy + r.height / 2); if (Math.abs(x) < r.width / 2 + 34 && Math.abs(y) < r.height / 2 + 34) { b._im = [x / 7, y / 5]; b.style.translate = b._im[0].toFixed(1) + 'px ' + b._im[1].toFixed(1) + 'px'; iman.add(b); } else if (iman.has(b)) { iman.delete(b); b._im = null; b.style.translate = ''; } } };
    addEventListener('pointermove', e => { pend = e; if (!raf) raf = requestAnimationFrame(mueve); }, { passive: true });
    // los enlaces del menú se descifran al pasar por encima
    document.addEventListener('pointerover', e => { const a = e.target.closest && e.target.closest('#familias a,header nav a'); if (a && !vivas.has(a) && !(e.relatedTarget && a.contains(e.relatedTarget))) descifra(a, 300); });
  }

  // entrada de cada página de la galería
  let actual = [];
  function entra(sec) {
    actual.forEach(corta); actual = []; if (quieto || !sec) return; const $$ = s => [...sec.querySelectorAll('.caja > ' + s)], T = $$('h1').concat($$('h2')), P = $$('p:not(.lat):not(.botones):not(.donde)');
    T.forEach(e => descifra(e, 520)); P.forEach(e => enfoca(e, 110)); actual = T.concat(P);
    if (sec.id === 'indice') { escalona(sec.querySelectorAll('details'), 60); const n = [...sec.querySelectorAll('summary span')]; n.forEach(e => cuenta(e)); actual = actual.concat(n); }
  }
  return { descifra, enfoca, escalona, cuenta, letras, chispa, entra };
})();
