// Generador: convierte imágenes y modelos en dibujos ASCII animados. Sin servidor: lee, guarda y
// descarga todo desde el navegador. Los textos del usuario se escriben siempre con textContent.
(() => {
const A = window.Anim || new Proxy({}, { get: () => () => () => {} });
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lienzo = $('#lienzo'); let motor;
let avisoT = 0;
function avisa(t, mal) { const a = $('#aviso'); a.textContent = t; a.className = 've' + (mal ? ' mal' : ''); clearTimeout(avisoT); avisoT = setTimeout(() => a.className = '', mal ? 7000 : 2600); }
try { motor = new MotorAscii(lienzo, { guardar: true }); } catch (e) { avisa(e.message, true); $('#etiqueta').textContent = e.message; $$('button,input,select').forEach(b => b.disabled = true); A.lista(); return; }

// ---------- dibujo actual ----------
// D = {id, nombre, tipo, ajustes, creado, imagen:{src} | modelo:{partes,eje,medidas}, pistas, ejemplo}
let D = null, info = null, cambioT = 0;
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2));
const limpia = n => String(n || '').replace(/\.[a-z0-9]{1,5}$/i, '').replace(/[_-]+/g, ' ').replace(/[^\p{L}\p{N} ().,'&+]/gu, '').trim().slice(0, 60) || 'Sin título';

// ---------- análisis de la imagen: qué partes son agua, fuego, plantas o cielo ----------
const DET = 168;
function analiza(lz, S, marca, bz) {
  const W = DET, H = Math.max(8, Math.min(DET * 3, Math.round(W * lz.height / lz.width))), c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d', { willReadFrequently: true }); x.imageSmoothingQuality = 'high'; x.drawImage(lz, 0, 0, W, H);
  const d = x.getImageData(0, 0, W, H).data, N = W * H, hue = new Float32Array(N), sat = new Float32Array(N), val = new Float32Array(N), lum = new Float32Array(N), alfa = new Float32Array(N); let trans = 0;
  for (let i = 0; i < N; i++) { const r = d[i * 4] / 255, g = d[i * 4 + 1] / 255, b = d[i * 4 + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), k = mx - mn; alfa[i] = d[i * 4 + 3] / 255; if (alfa[i] < .5) trans++; val[i] = mx; sat[i] = mx ? k / mx : 0; lum[i] = .3 * r + .59 * g + .11 * b; hue[i] = !k ? 0 : (mx === r ? ((g - b) / k + 6) % 6 : mx === g ? (b - r) / k + 2 : (r - g) / k + 4) * 60; }
  const hayAlfa = trans / N > .04, bor = []; for (let i = 0; i < W; i++) bor.push(i, (H - 1) * W + i); for (let j = 1; j < H - 1; j++) bor.push(j * W, j * W + W - 1);
  const med = [0, 1, 2].map(k => { const v = bor.map(i => d[i * 4 + k] / 255).sort((a, b) => a - b); return v[v.length >> 1]; }), dist = i => Math.hypot(d[i * 4] / 255 - med[0], d[i * 4 + 1] / 255 - med[1], d[i * 4 + 2] / 255 - med[2]);
  const lisos = !hayAlfa && bor.filter(i => dist(i) < .1).length / bor.length > .92;
  // el objeto
  let o; if (hayAlfa) { const m = Uint8Array.from(alfa, a => a > .5 ? 1 : 0); o = { masc: m, claro: true }; } else o = Objeto.recorta(d, W, H, marca);
  const masc = o.masc; let hay = o.claro; if (!hay) masc.fill(0);
  if (bz) { c.width = W; c.height = H; x.drawImage(bz, 0, 0, W, H); const q = x.getImageData(0, 0, W, H).data; let n = 0; for (let i = 0; i < N; i++) { if (q[i * 4 + 3] > 128) masc[i] = 0; n += masc[i]; } if (n < 6) { hay = false; masc.fill(0); } else { const g = Objeto.grupos(masc, 1, W, H), mx = Math.max(...g.t.map(q => q.n)); for (let i = 0; i < N; i++) if (g.g[i] >= 0 && g.t[g.g[i]].n < mx * .012) masc[i] = 0; } }
   const solo = hayAlfa || (hay && S.sinFondo), enCapas = hay && !solo && S.mueve === 'objeto';
  let caja = null, pegado = [0, 0, 0, 0], area = 0;
  if (hay) { let a = W, b = H, e = -1, f = -1; const toca = [0, 0, 0, 0]; for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (masc[j * W + i]) { area++; a = Math.min(a, i); e = Math.max(e, i); b = Math.min(b, j); f = Math.max(f, j); if (i < 2) toca[0]++; if (i > W - 3) toca[1]++; if (j > H - 3) toca[2]++; if (j < 2) toca[3]++; }
    if (!solo) pegado = [toca[0] > H * .04, toca[1] > H * .04, toca[2] > W * .04, toca[3] > W * .04].map(Number); const p = W / H, sx = p > 1 ? 1 : p, sy = p > 1 ? 1 / p : 1, hw = Math.max(.03, (e - a + 1) / W * sx), hh = Math.max(.03, (f - b + 1) / H * sy), s = Math.max(hw, hh); caja = { v: [((a + e + 1) / W - 1) * sx, (1 - (b + f + 1) / H) * sy, s, hh / s], ancho: hw > hh, abajo: f / H, hw, hh }; }
  // regiones
  const R = new Float32Array(N * 4), azul = i => hue[i] > 165 && hue[i] < 258 && sat[i] > .17 && val[i] > .2, ajeno = i => solo ? !masc[i] : masc[i]; let nieveN = 0, media = 0; for (let i = 0; i < N; i++) media += lum[i] / N;
  if (!solo) for (let a = 0; a < W; a++) for (let j = 0; j < H * .75; j++) { const i = j * W + a, cl = azul(i) || (val[i] > .72 && sat[i] < .28) || val[i] < .32 || ((hue[i] < 52 || hue[i] > 325) && val[i] > .5 && j < H * .6), dif = j ? Math.abs(lum[i] - lum[i - W]) : 0, verde = hue[i] > 62 && hue[i] < 165 && sat[i] > .2 && val[i] > .1; if (masc[i] || !cl || verde || dif > .13) break; R[i * 4 + 3] = 1; }
  let az = 0, azB = 0; for (let i = 0; i < N; i++) if (azul(i) || masc[i]) az++; for (const i of bor) if (azul(i)) azB++; const sumergido = !solo && az / N > .75 && azB / bor.length > .9; if (sumergido) for (let i = 0; i < N; i++) { R[i * 4 + 3] = 0; if (azul(i) && !masc[i]) R[i * 4] = 1; }
  const cont = [0, 0, 0, 0]; let visibles = 0, verdeO = 0;
  for (let i = 0; i < N; i++) {
    if (solo && !masc[i]) continue; visibles++; const y = (i / W | 0) / H, r = d[i * 4] / 255, b = d[i * 4 + 2] / 255;
    if ((hue[i] < 50 || hue[i] > 352) && sat[i] > .68 && val[i] > .72 && r - b > .5 && !R[i * 4 + 3] && !masc[i]) R[i * 4 + 1] = 1;
    else if (hue[i] > 62 && hue[i] < 168 && sat[i] > .17 && val[i] > .09) { if (masc[i]) verdeO++; else R[i * 4 + 2] = 1; } else if (!masc[i] && azul(i) && !R[i * 4 + 3] && y > .3) R[i * 4] = 1;
    if (val[i] > .8 && sat[i] < .12 && y > .5 && !masc[i]) nieveN++;
  }
  for (let i = 0; i < N; i++) for (let k = 0; k < 4; k++) cont[k] += R[i * 4 + k] > .3 ? 1 / Math.max(1, visibles) : 0;
  const difumina = (f, ca, n) => { for (let v = 0; v < n; v++) f = Objeto.suave(f, W, H, ca); return f; }, bytes = f => { const u = new Uint8Array(f.length); for (let i = 0; i < f.length; i++) u[i] = Math.max(0, Math.min(255, f[i] * 255)); return u; };
  // relieve
  let alto = new Float32Array(N); for (let i = 0; i < N; i++) { const X = (i % W) / W - .5, Y = (i / W | 0) / H - .5; alto[i] = .25 + .5 * lum[i] + (hay ? 0 : .3 * Math.max(0, 1 - 2.2 * Math.hypot(X, Y))) - (R[i * 4 + 3] ? .3 : 0); } const tope = f => f.map(v => Math.max(0, Math.min(1, v)));
  let altoO = null; if (hay) { const b = Objeto.lejos(masc, 0, W, H), m = Math.max(2, ...b.filter(v => v < 1e5)); altoO = new Float32Array(N); for (let i = 0; i < N; i++) altoO[i] = masc[i] ? .35 + .3 * lum[i] + .35 * Math.sqrt(Math.min(1, b[i] / m)) : .35; altoO = tope(difumina(altoO, 1, 3)); }
  const lz2 = () => { const q = document.createElement('canvas'); q.width = lz.width; q.height = lz.height; const z = q.getContext('2d'); z.imageSmoothingQuality = 'high'; return [q, z]; };
  const mascara = f => { const q = document.createElement('canvas'); q.width = W; q.height = H; const z = q.getContext('2d'), m = z.createImageData(W, H); for (let i = 0; i < N; i++) m.data[i * 4 + 3] = f[i] * 255; z.putImageData(m, 0, 0); return q; };
  const capas = []; let tex = lz;
  if (hay && (solo || enCapas)) { if (!hayAlfa) { const [q, z] = lz2(); z.drawImage(lz, 0, 0); z.globalCompositeOperation = 'destination-in'; z.drawImage(mascara(difumina(Float32Array.from(masc), 1, 1)), 0, 0, q.width, q.height); tex = q; } }
  const Ro = new Float32Array(N * 4); for (let i = 0; i < N; i++) if (masc[i] && verdeO / Math.max(1, area) > .3 && R[i * 4 + 2] === 0 && hue[i] > 62 && hue[i] < 168) Ro[i * 4 + 2] = .5;
  const eje = caja && !caja.ancho ? [0, 1, 0] : [1, 0, 0], oCapa = caja && { lienzo: tex, region: bytes(difumina(Ro, 4, 2)), alto: altoO, tipo: 2, caja: solo ? [0, 0, 1, caja.hh / Math.max(caja.hw, caja.hh)] : caja.v, pegado, eje };
  if (solo) capas.push(oCapa);
  else if (enCapas) {
    const cerca = Objeto.lejos(masc, 1, W, H), hueco = Uint8Array.from(cerca, v => v < 3.2 ? 1 : 0), rgb = new Float32Array(N * 3); for (let i = 0; i < N; i++) for (let k = 0; k < 3; k++) rgb[i * 3 + k] = d[i * 4 + k]; const f = Objeto.rellena(rgb, hueco, W, H, 3), q = document.createElement('canvas'); q.width = W; q.height = H; const z = q.getContext('2d'), m = z.createImageData(W, H);
    for (let i = 0; i < N; i++) { const g = hueco[i] ? ((i * 7919 % 101) / 101 - .5) * 14 : 0; for (let k = 0; k < 3; k++) m.data[i * 4 + k] = f[i * 3 + k] + g; m.data[i * 4 + 3] = 255; } z.putImageData(m, 0, 0);
    const [fo, y] = lz2(); y.drawImage(lz, 0, 0); y.globalCompositeOperation = 'destination-out'; y.drawImage(mascara(difumina(Float32Array.from(hueco), 1, 1)), 0, 0, fo.width, fo.height); y.globalCompositeOperation = 'destination-over'; y.drawImage(q, 0, 0, fo.width, fo.height);
    capas.push({ lienzo: fo, region: bytes(difumina(Objeto.rellena(R, hueco, W, H, 4), 4, 2)), alto: tope(difumina(Objeto.rellena(alto, hueco, W, H, 1), 1, 3)), tipo: 1 }, oCapa);
  } else capas.push({ lienzo: lz, region: bytes(difumina(R, 4, 2)), alto: tope(difumina(alto, 1, 3)), tipo: 0, caja: [0, 0, 1, H / W > 1 ? 1 : H / W] });
  // lo borrado con la goma desaparece de todas las capas
  if (bz) for (const k of capas) { const q = document.createElement('canvas'); q.width = k.lienzo.width; q.height = k.lienzo.height; const z = q.getContext('2d'); z.drawImage(k.lienzo, 0, 0); z.globalCompositeOperation = 'destination-out'; z.imageSmoothingQuality = 'high'; z.drawImage(bz, 0, 0, q.width, q.height); k.lienzo = q; }
  return { capas, encuadre: solo && caja ? [caja.v[0], caja.v[1], caja.hw, caja.hh] : null, an: W, al: H, prop: lz.width / lz.height, marco: !solo, masc, hay, solo, hayAlfa, lisos, caja, pegado, sumergido, area: area / N, verdeO: verdeO / Math.max(1, area), noche: media < .27 && !solo && !sumergido, nieve: nieveN / N > .2 && !hay, agua: cont[0], fuego: cont[1], planta: cont[2], cielo: cont[3] };
}

// ---------- contexto: nombre del archivo, piezas del modelo, proporciones y contenido ----------
const PISTAS = [
  [/\b(ave|bird|p[aá]jaro|[aá]guila|eagle|b[uú]ho|owl|cuervo|crow|drag[oó]n|mariposa|butterfly|abeja|bee|murci[eé]lago|bat|f[eé]nix|phoenix|[aá]ngel|angel|wings?|alas?)\b/i, 'algo con alas', ['aleteo', 'flota']],
  [/\b(pez|fish|tibur[oó]n|shark|ballena|whale|delf[ií]n|dolphin|serpiente|snake|anguila|eel|cocodrilo|medusa|jellyfish|koi)\b/i, 'algo que nada', ['nado', 'flota']],
  [/\b([aá]rbol(es)?|trees?|planta|plant|flor(es)?|flowers?|palmera|palm|hierba|grass|bosque|forest|hoja|leaf|rosa|rose|bonsai)\b/i, 'vegetación', ['viento']],
  [/\b(coraz[oó]n|heart)\b/i, 'un corazón', ['latido']],
  [/\b(fuego|fire|llama|flame|antorcha|torch|volc[aá]n|volcano|lava|hoguera|vela|candle)\b/i, 'fuego', ['chispas', 'viento']],
  [/\b(auto|carro|coche|car|truck|cami[oó]n|moto|motorcycle|tanque|tank|tren|train|bus|tractor|kart|racing|motor|engine)\b/i, 'un vehículo', ['vibra', 'giro']],
  [/\b(nave|spaceship|ship|rocket|cohete|avi[oó]n|plane|airplane|jet|ufo|ovni|helic[oó]ptero|helicopter|drone|starship)\b/i, 'una nave', ['flota', 'estrellas', 'chispas']],
  [/\b(barco|boat|velero|sail|bote|pirate|canoa|submarino|submarine)\b/i, 'un barco', ['olas', 'flota']],
  [/\b(planeta|planet|tierra|earth|luna|moon|sol|sun|estrella|star|galaxia|galaxy|marte|mars|saturno|saturn|espacio|space|astronauta|astronaut)\b/i, 'el espacio', ['giro', 'estrellas']],
  [/\b(calavera|skull|fantasma|ghost|zombie|demonio|demon|vampiro|esqueleto)\b/i, 'algo tenebroso', ['respira', 'niebla']],
  [/\b(robot|mecha|android|cyborg|cyber|hologram)\b/i, 'una máquina', ['escaneo', 'respira']],
  [/\b(nieve|snow|copo|invierno|winter|navidad|christmas|hielo|ice)\b/i, 'nieve', ['nieve']],
  [/\b(lluvia|rain|tormenta|storm)\b/i, 'lluvia', ['lluvia', 'viento']],
  [/\b(mar|sea|ocean|oc[eé]ano|playa|beach|lago|lake|r[ií]o|river|ola|wave)\b/i, 'agua', ['olas']],
  [/\b(casa|house|castillo|castle|edificio|building|ciudad|city|torre|tower|templo|temple|iglesia|church)\b/i, 'un edificio', ['giro', 'niebla']],
  [/\b(persona|person|human|humano|man|woman|hombre|mujer|girl|boy|chico|chica|character|personaje|soldier|soldado|knight|caballero|ninja|samurai|anime|mixamo|avatar|hero|warrior)\b/i, 'un personaje', ['respira', 'camina']],
  [/\b(perro|dog|gato|cat|caballo|horse|lobo|wolf|le[oó]n|lion|tigre|tiger|oso|bear|conejo|rabbit|zorro|fox|vaca|cow|elefante|elephant|animal|dino\w*|retrato|portrait|cara|face|head|cabeza|bust)\b/i, 'un ser vivo', ['respira']]
];
function contexto() {
  const palabras = t => String(t || '').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[^\p{L}]+/gu, ' '), [arch, piezas] = [D.archivo, D.pistas].map(palabras), anim = new Set(), ve = [];
  let clave = PISTAS.find(p => p[0].test(arch)), de = ' (por el nombre del archivo)'; if (!clave && (clave = PISTAS.find(p => p[0].test(piezas)))) de = ' (por el nombre de sus piezas)'; if (!clave && D.piel) { clave = PISTAS.find(p => p[1] === 'un personaje'); de = ' (tiene esqueleto)'; } if (clave) { ve.push(clave[1] + de); clave[2].forEach(a => anim.add(a)); }
  if (D.tipo === 'imagen') {
    const p = (v, n) => ve.push(n + ' ' + Math.round(v * 100) + ' %'); if (info.hay) ve.unshift('un objeto' + (info.solo ? ' recortado' : ' separado del fondo')); else ve.push('ningún objeto que destaque, así que se mueve el paisaje');
    if (info.cielo > .1) p(info.cielo, 'cielo'); if (info.agua > .05) p(info.agua, 'agua'); if (info.planta > .08 && !info.solo) p(info.planta, 'plantas'); if (info.fuego > .025) { p(info.fuego, 'fuego o brillo cálido'); if (info.fuego > .08) anim.add('chispas'); }
    if (info.sumergido) { ve.push('escena bajo el agua'); anim.delete('chispas'); if (!clave && info.hay) { anim.add('nado'); anim.add('flota'); } } if (info.noche) { ve.push('escena oscura'); if (info.cielo > .1) anim.add('estrellas'); } if (info.nieve) { ve.push('mucho blanco en el suelo'); anim.add('nieve'); }
    if (info.hay && !clave && !info.sumergido) { if (info.verdeO > .45) anim.add('viento'); else if (!info.pegado.some(Boolean) && info.caja.abajo < .72) { anim.add('flota'); anim.add('respira'); } else anim.add('respira'); }
    if (!info.hay && clave) ['aleteo', 'nado', 'camina', 'flota', 'respira', 'vibra', 'latido', 'giro'].forEach(a => anim.delete(a));
  } else if (!clave) {
    const [a, b, c] = D.modelo.medidas || [1, 1, 1];
    if (b > 1.6 * Math.max(a, c)) { ve.push('una figura alta'); anim.add('respira'); anim.add('giro'); } else if (a > 2.2 * b && a > 1.4 * c) { ve.push('una forma ancha y plana'); anim.add('flota'); anim.add('giro'); } else if (Math.max(a, c) > 2 * Math.max(b, Math.min(a, c))) { ve.push('una forma alargada'); anim.add('flota'); anim.add('giro'); } else { ve.push('una forma compacta'); anim.add('giro'); }
  }
  return { anim: [...anim], ve };
}

// ---------- mostrar ----------
async function muestra(nuevo) {
  if (D.tipo === 'imagen') {
    const lz = await MotorAscii.lienzoDe(D.imagen.src); let m = D.imagen.marca || null; if (m && m.length !== DET * Math.max(8, Math.min(DET * 3, Math.round(DET * lz.height / lz.width)))) m = D.imagen.marca = null;
    const bz = D.imagen.borra ? await MotorAscii.lienzoDe(D.imagen.borra) : null;
    info = analiza(lz, D.ajustes, m, bz); if (nuevo && info.lisos && info.hay) { D.ajustes.sinFondo = true; info = analiza(lz, D.ajustes, m, bz); }
    motor.ponImagen(info);
    // imágenes verticales: ocupan poco ancho, así que necesitan más letras para verse igual de definidas
    if (nuevo) { const asp = lienzo.clientWidth / Math.max(1, lienzo.clientHeight), ocupa = Math.min(1, motor.prop / asp) * .82; D.ajustes.columnas = Math.max(D.ajustes.columnas, Math.min(tactil ? 220 : 250, Math.round(Math.min(tactil ? 74 : 104, 62 + 40 * motor.prop) / ocupa * 1.1 / 2) * 2)); D.colBase = D.ajustes.columnas; }
  } else { info = null; motor.ponModelo(D.modelo); }
  const c = contexto(); if (nuevo) { D.ajustes.anim = c.anim; if (quieto) D.ajustes.velocidad = 0; }
  motor.S = D.ajustes; if (nuevo) D.ajustes.luz = D.luzAuto = motor.luzIdeal(); $('#contexto').textContent = c.ve.length ? 'He encontrado: ' + c.ve.join(', ') + '.' : 'No he reconocido nada en concreto.';
  pintaPanel(); if (hId !== D.id) { ponPausa(false); anota(); }
}
const N_EJ = 'Ejemplo: la costa', LIM = 30e6, inicial = () => MotorAscii.ajustes({ columnas: Math.max(88, Math.min(210, Math.round(lienzo.clientWidth / 5.4 / 2) * 2)) });
async function abreArchivo(f) {
  if (!f) return; const e = Modelos.ext(f.name), quita = A.letras($('#escena')), t0 = performance.now();
  try {
    await suelta(); if (e === 'json' || e === 'mundo') { await importa(f); return; }
    avisa('Leyendo ' + f.name.slice(0, 60) + '…');
    const base = { id: uid(), nombre: limpia(f.name), creado: Date.now(), archivo: f.name.replace(/\.[^.]*$/, '').slice(0, 120), pistas: '', ajustes: inicial() };
    if (['glb', 'obj', 'stl', 'ply'].includes(e)) {
      const m = await Modelos.lee(f.name, await f.arrayBuffer()); D = { ...base, tipo: 'modelo', modelo: { partes: m.partes, eje: m.eje, medidas: m.medidas } };
      if (e === 'glb') { D.pistas = Modelos.nombres.slice(0, 20).join(' '); D.piel = Modelos.piel; } D.ajustes = MotorAscii.ajustes({ ...D.ajustes, giroY: .5, giroX: .15 });
    } else if (/^image\//.test(f.type) || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'avif'].includes(e)) {
      if (e === 'svg' || /svg/.test(f.type)) throw Error('Los SVG no se admiten. Conviértelo antes a PNG.');
      if (f.size > LIM) throw Error('La imagen pesa más de 30 MB.'); let lz; try { lz = await Modelos.achica(f, 1024); } catch (x) { throw Error('No se pudo abrir esa imagen.'); }
      D = { ...base, tipo: 'imagen', imagen: { src: aSrc(lz) } };
    } else throw Error(e === 'gltf' || e === 'fbx' || e === 'blend' ? 'Los .' + e + ' no se pueden leer. Expórtalo como GLB.' : 'Ese tipo de archivo no se puede leer.');
    await muestra(true); await guarda(); avisa('Listo. Guardado en «Tus dibujos».');
  } catch (x) { avisa(x && x.message ? x.message : 'No se pudo abrir el archivo.', true); }
  finally { setTimeout(quita, Math.max(0, 650 - (performance.now() - t0))); }
}
function aSrc(c) { const w = c.toDataURL('image/webp', .9); return w.startsWith('data:image/webp') ? w : c.toDataURL('image/png'); }

// ---------- ejemplo ----------
function ejemplo() {
  const c = document.createElement('canvas'); c.width = 900; c.height = 640; const x = c.getContext('2d');
  let g = x.createLinearGradient(0, 0, 0, 380); g.addColorStop(0, '#1b4f9c'); g.addColorStop(.7, '#7fb6e6'); g.addColorStop(1, '#d8ecf8'); x.fillStyle = g; x.fillRect(0, 0, 900, 380);
  x.fillStyle = '#fff3c4'; x.beginPath(); x.arc(660, 110, 52, 0, 7); x.fill(); x.fillStyle = 'rgba(255,255,255,.85)'; for (const [a, b, s] of [[150, 90, 1], [400, 150, .7], [800, 210, .8]]) { x.beginPath(); for (const [p, q, r] of [[0, 0, 34], [40, -12, 42], [84, 0, 34], [42, 12, 36]]) x.arc(a + p * s, b + q * s, r * s, 0, 7); x.fill(); }
  g = x.createLinearGradient(0, 375, 0, 640); g.addColorStop(0, '#2f7fb8'); g.addColorStop(1, '#0c3b6b'); x.fillStyle = g; x.fillRect(0, 375, 900, 265); x.fillStyle = 'rgba(220,240,255,.5)'; for (let i = 0; i < 90; i++) { const y = 385 + (i * 53 % 250); x.fillRect(i * 97 % 900, y, 20 + y / 12, 2 + (y - 375) / 90); }
  x.fillStyle = '#3c5a52'; x.beginPath(); x.moveTo(0, 380); x.lineTo(90, 300); x.lineTo(180, 345); x.lineTo(300, 270); x.lineTo(430, 380); x.fill();
  x.fillStyle = '#d8b878'; x.beginPath(); x.ellipse(250, 640, 360, 130, 0, 0, 7); x.fill(); x.strokeStyle = '#6b4526'; x.lineWidth = 26; x.beginPath(); x.moveTo(210, 600); x.quadraticCurveTo(180, 400, 290, 250); x.stroke();
  x.strokeStyle = '#2e8b3a'; x.lineWidth = 20; x.lineCap = 'round'; for (const [a, b] of [[120, 250], [150, 180], [270, 130], [400, 170], [450, 250], [400, 320], [190, 320]]) { x.beginPath(); x.moveTo(290, 250); x.quadraticCurveTo((290 + a) / 2, Math.min(250, b) - 40, a, b); x.stroke(); }
  x.fillStyle = '#e9e2d0'; x.beginPath(); x.moveTo(600, 420); x.lineTo(760, 420); x.lineTo(735, 455); x.lineTo(625, 455); x.fill(); x.beginPath(); x.moveTo(680, 410); x.lineTo(680, 270); x.lineTo(760, 405); x.fill(); x.beginPath(); x.moveTo(670, 410); x.lineTo(670, 290); x.lineTo(605, 405); x.fill();
  D = { id: uid(), nombre: N_EJ, creado: Date.now(), pistas: '', tipo: 'imagen', imagen: { src: aSrc(c) }, ajustes: inicial(), ejemplo: true }; return muestra(true);
}

// ---------- panel ----------
const N_ANIM = { respira: 'Respira', viento: 'Viento', nado: 'Nada', aleteo: 'Aletea', flota: 'Flota', vibra: 'Vibra', latido: 'Late', giro: 'Gira', olas: 'Oleaje', camina: 'Camina', lluvia: 'Lluvia', nieve: 'Nieve', chispas: 'Chispas', estrellas: 'Estrellas', niebla: 'Niebla', codigo: 'Letras que caen', escaneo: 'Escaneo' }, AMBIENTE = ['lluvia', 'nieve', 'chispas', 'estrellas', 'niebla', 'codigo', 'escaneo'];
const N_RAMPA = { clasica: ['Clásica', '.:=+*#@'], bloques: ['Bloques', '░▒▓█'], puntos: ['Puntos', '·•●'], binaria: ['Ceros y unos', '0110'], lineas: ['Líneas', '.-=≡#'], letras: ['Muchas', 'iloZQW&'], propia: ['Las tuyas', 'Aa?'] };
const N_COLOR = { original: ['Original', 'conic-gradient(#e85d4a,#f2b04a,#8fd05a,#4ac6d8,#7a6cf0,#e85da8,#e85d4a)'], ambar: ['Ámbar', 'linear-gradient(135deg,#401400,#ffb84d)'], abismo: ['Abismo', 'linear-gradient(135deg,#001f40,#8cfff2)'], fosforo: ['Fósforo', 'linear-gradient(135deg,#031c08,#26ff59)'], papel: ['Hueso', 'linear-gradient(135deg,#22201c,#f2ebd9)'], brasa: ['Brasa', 'linear-gradient(135deg,#1a0400,#d91f08,#ffd959)'], neon: ['Neón', 'linear-gradient(135deg,#ff3ec8,#5a6cff,#2cf0c8)'], propio: ['Tinte', ''] };
const FONDOS = [['#01040c', 'Abismo'], ['#000000', 'Negro'], ['#0b1428', 'Noche'], ['#170b24', 'Ciruela'], ['#0a1c14', 'Bosque'], ['#260d08', 'Vino'], ['#1c1c1e', 'Carbón']];
const b0 = MotorAscii.BASE, ESTILOS = [
  ['Fiel', { rampa: 'clasica', color: 'original', fondo: b0.fondo, resplandor: .5, contraste: 0, saturacion: 0 }, '@%#*', 'conic-gradient(from 90deg,#e8764a,#e8c14a,#6fd07a,#5aa8f0,#e8764a)'],
  ['Terminal', { rampa: 'clasica', color: 'fosforo', fondo: '#020a04', resplandor: .9, contraste: .15, saturacion: 0 }, '>_#@', '#35ff68'],
  ['Monitor ámbar', { rampa: 'letras', color: 'ambar', fondo: '#0d0602', resplandor: .9, contraste: .15, saturacion: 0 }, 'WQ0o', '#ffb84d'],
  ['Bloques', { rampa: 'bloques', color: 'original', fondo: '#000000', resplandor: .2, contraste: .1, saturacion: .15 }, '█▓▒░', 'linear-gradient(90deg,#5aa8f0,#e8c14a)'],
  ['Neón', { rampa: 'letras', color: 'neon', fondo: '#0a0418', resplandor: 1.2, contraste: .2, saturacion: 0 }, '&#%@', 'linear-gradient(90deg,#ff3ec8,#2cf0c8)'],
  ['Carboncillo', { rampa: 'letras', color: 'papel', fondo: '#1c1c1e', resplandor: .1, contraste: .2, saturacion: 0 }, '#+=-', '#f2ebd9'],
  ['Brasas', { rampa: 'puntos', color: 'brasa', fondo: '#120302', resplandor: 1, contraste: .15, saturacion: 0 }, '●•·', 'linear-gradient(90deg,#ffd959,#d91f08)'],
  ['Binario', { rampa: 'binaria', color: 'abismo', fondo: b0.fondo, resplandor: .7, contraste: .1, saturacion: 0 }, '0110', '#8cfff2']];
const crea = (t, c, txt) => { const e = document.createElement(t); if (c) e.className = c; if (txt) e.textContent = txt; if (t === 'button') e.type = 'button'; return e; };
// pone ajustes de golpe: todos los botones del panel pasan por aquí
const toma = o => { Object.assign(D.ajustes, o); pintaPanel(); cambio(); };
for (const [n, o, t, c] of ESTILOS) { const b = crea('button', 'carta'), s = crea('span', 'mues', t), e = crea('span', '', n); s.style.backgroundColor = o.fondo; s.style.setProperty('--c', c.startsWith('#') ? 'linear-gradient(' + c + ',' + c + ')' : c); b.append(s, e); b.estilo = o; b.addEventListener('click', () => toma(o)); $('#estilos').append(b); }
for (const [k, [n, t]] of Object.entries(N_RAMPA)) { const b = crea('button', 'carta'), s = crea('span', 'mues', t); s.style.setProperty('--c', 'linear-gradient(90deg,var(--bruma),var(--hueso))'); b.append(s, crea('span', '', n)); b.dataset.rampa = k; b.addEventListener('click', () => { toma({ rampa: k }); if (k === 'propia') $('#propia').focus(); }); $('#rampas').append(b); }
for (const [k, [n, c]] of Object.entries(N_COLOR)) { const b = crea('button', 'color'), s = crea('span', 'gota'); s.style.background = c; b.append(s, crea('span', '', n)); b.dataset.color = k; b.addEventListener('click', () => toma({ color: k })); $('#colores').append(b); }
for (const [c, n] of FONDOS) { const b = crea('button', 'color'), s = crea('span', 'gota'); s.style.background = c; b.append(s, crea('span', '', n)); b.dataset.fondo = c; b.addEventListener('click', () => toma({ fondo: c })); $('#fondos').append(b); }
const barras = [], base = k => k === 'luz' ? (D.luzAuto || 1) : k === 'columnas' ? (D.colBase || inicial().columnas) : b0[k];
function barra(donde, k, nombre, min, max, paso, f) {
  const l = crea('div', 'barra'), s = crea('label', '', nombre), o = crea('output'), i = crea('input'), r = crea('button', 'cero', '↺'); i.type = 'range'; i.id = s.htmlFor = 'r-' + k; Object.assign(i, { min, max, step: paso }); r.title = 'Restablecer'; r.setAttribute('aria-label', 'Restablecer ' + nombre.toLowerCase());
  const pinta = () => { const v = D.ajustes[k]; i.value = v; o.textContent = f(v); i.style.setProperty('--p', (v - min) / (max - min) * 100 + '%'); r.style.visibility = Math.abs(v - base(k)) > paso / 2 ? 'visible' : 'hidden'; };
  const vuelve = () => { D.ajustes[k] = k === 'luz' ? (D.luzAuto = motor.luzIdeal()) : base(k); pinta(); cambio(); };
  i.addEventListener('input', () => { D.ajustes[k] = +i.value; pinta(); cambio(); }); let antes = null; i.addEventListener('pointerdown', e => antes = e.pointerType === 'touch' ? D.ajustes[k] : null); i.addEventListener('pointercancel', () => { if (antes !== null) { D.ajustes[k] = antes; antes = null; pinta(); } }); i.addEventListener('pointerup', () => antes = null); i.addEventListener('dblclick', vuelve); r.addEventListener('click', () => { vuelve(); i.focus(); }); l.append(s, o, r, i); $(donde).append(l); barras.push(pinta); return l;
}
const pc = v => Math.round(v * 100) + ' %', sg = v => (v > 0 ? '+' : '') + Math.round(v * 100);
barra('#dAnim', 'fuerza', 'Intensidad', 0, 2, .05, pc); barra('#dAnim', 'velocidad', 'Velocidad', 0, 3, .05, pc);
barra('#dForma', 'columnas', 'Letras de ancho', 40, 260, 2, v => v); barra('#dForma', 'zoom', 'Tamaño', .3, 3, .02, pc); const bNit = barra('#dForma', 'nitidez', 'Nitidez', 0, 1, .05, pc), bRel = barra('#dForma', 'relieve', 'Relieve', 0, 1, .02, pc);
barra('#dLuz', 'luz', 'Luz', .3, 4, .05, pc); const bAtras = barra('#dLuz', 'atras', 'Luz del fondo', 0, 1, .05, pc); barra('#dLuz', 'brillo', 'Brillo', -1, 1, .02, sg); barra('#dLuz', 'contraste', 'Contraste', -1, 1, .02, sg); barra('#dLuz', 'saturacion', 'Saturación', -1, 1, .02, sg); barra('#dLuz', 'resplandor', 'Resplandor', 0, 1.5, .05, pc);
for (const a of MotorAscii.ANIM) { const b = crea('button', '', N_ANIM[a]); b.dataset.a = a; b.addEventListener('click', () => { const s = new Set(D.ajustes.anim); s.has(a) ? s.delete(a) : s.add(a); if (quieto && !D.ajustes.velocidad) D.ajustes.velocidad = 1; ponPausa(false); toma({ anim: MotorAscii.ANIM.filter(q => s.has(q)) }); }); $(AMBIENTE.includes(a) ? '#ambiente' : '#anims').append(b); }
const marca = (sel, f) => $$(sel).forEach(b => b.setAttribute('aria-pressed', !!f(b)));
function pintaPanel() {
  const S = D.ajustes; if (document.activeElement !== $('#nombre')) $('#nombre').value = D.nombre === N_EJ || D.nombre === 'Sin título' ? '' : D.nombre; $('#etiqueta').textContent = D.nombre + (D.ejemplo ? ' (aún sin guardar)' : '');
  marca('[data-a]', b => S.anim.includes(b.dataset.a)); marca('[data-rampa]', b => b.dataset.rampa === S.rampa); marca('[data-color]', b => b.dataset.color === S.color); marca('[data-fondo]', b => b.dataset.fondo === S.fondo.toLowerCase()); marca('#estilos button', b => Object.entries(b.estilo).every(([k, v]) => S[k] === v));
  for (const k of ['propia', 'tinte', 'fondo']) if (document.activeElement !== $('#' + k) || k !== 'propia') $('#' + k).value = S[k]; $('[data-color=propio] .gota').style.background = S.tinte; $('#invertir').checked = S.invertir; $('#sinFondo').checked = S.sinFondo; $('#contextoOn').checked = S.contexto;
  const im = D.tipo === 'imagen', sinObj = !im || !info.hay || info.solo, mv = im && !info.hay ? 'todo' : S.mueve; $('#cSinFondo').hidden = !im || !info.hay || info.hayAlfa; $('#cObjeto').hidden = !im || info.hayAlfa; $('#borrar').hidden = $('#borrar2').hidden = !im; marca('[data-mueve]', b => b.dataset.mueve === mv); $$('[data-mueve]').forEach(b => b.disabled = sinObj);
  $('#contextoOn').closest('label').hidden = !im; bRel.hidden = bNit.hidden = !im; bAtras.hidden = sinObj || S.mueve !== 'objeto'; $('#cPropia').hidden = S.rampa !== 'propia'; $('#fondoBase').disabled = S.fondo.toLowerCase() === b0.fondo; $('#cTinte').hidden = S.color !== 'propio'; barras.forEach(f => f()); pintaSalida();
}
// pestañas
const tabs = $$('[role=tab]'); const pestana = (t, foco) => { tabs.forEach(b => { const si = b === t; b.setAttribute('aria-selected', si); b.tabIndex = si ? 0 : -1; const h = $('#' + b.getAttribute('aria-controls')), abre = si && h.hidden; h.hidden = !si; if (abre) A.escalona(h.children); }); $('.hojas').scrollTop = 0; if (foco) t.focus(); try { sessionStorage.setItem('pestana', t.id); } catch (e) {} const p = $('#panel').getBoundingClientRect(), y = $('.tabs').getBoundingClientRect(), es = $('#escena'); if (getComputedStyle(es).position === 'sticky' && $('.hojas').getBoundingClientRect().top < y.bottom - 2) scrollBy(0, $('.hojas').getBoundingClientRect().top - y.bottom); };
tabs.forEach((t, i) => { t.addEventListener('click', () => pestana(t)); t.addEventListener('keydown', e => { const k = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key]; if (k !== undefined) { e.preventDefault(); pestana(tabs[(k + tabs.length) % tabs.length], true); } }); });
try { const t = document.getElementById(sessionStorage.getItem('pestana') || ''); if (tabs.includes(t)) pestana(t); } catch (e) {}
// deshacer y rehacer
let hist = [], pos = -1, hId = '', hT = 0;
const foto = () => JSON.stringify(D.ajustes), botones = () => { $('#deshacer').disabled = pos < 1; $('#rehacer').disabled = pos >= hist.length - 1; };
const anota = () => { clearTimeout(hT); hT = 0; const s = foto(); if (hId !== D.id) { hId = D.id; hist = [s]; pos = 0; } else if (s !== hist[pos]) { hist.length = pos + 1; hist.push(s); if (hist.length > 80) hist.shift(); pos = hist.length - 1; } botones(); };
async function salta(n) { if (hT) anota(); if (!hist[pos + n] || hId !== D.id) return; pos += n; const a = D.ajustes; D.ajustes = MotorAscii.ajustes(JSON.parse(hist[pos])); motor.S = D.ajustes; if (a.sinFondo !== D.ajustes.sinFondo || a.mueve !== D.ajustes.mueve) await muestra(false); else pintaPanel(); botones(); programa(); }
$('#deshacer').addEventListener('click', () => salta(-1)); $('#rehacer').addEventListener('click', () => salta(1));
addEventListener('keydown', e => { if (!(e.ctrlKey || e.metaKey) || e.altKey || (e.target.matches && e.target.matches('input:not([type=range]):not([type=checkbox]):not([type=color])'))) return; const k = e.key.toLowerCase(); if (k === 'z') { e.preventDefault(); salta(e.shiftKey ? 1 : -1); } else if (k === 'y') { e.preventDefault(); salta(1); } });
// vista
function ponPausa(v) { motor.pausa = v; const b = $('#pausa'), n = v ? 'Reanudar' : 'Pausar'; b.setAttribute('aria-label', n); b.title = n; b.setAttribute('aria-pressed', v); b.querySelector('path').setAttribute('d', v ? 'M8 5v14l11-7z' : 'M8 5v14M16 5v14'); }
$('#pausa').addEventListener('click', () => ponPausa(!motor.pausa)); $('#centrar').addEventListener('click', () => { const mo = D.tipo === 'modelo'; toma({ giroX: mo ? .15 : 0, giroY: mo ? .5 : 0, zoom: 1 }); });
let pend = false;
const suelta = async () => { if (pend) { clearTimeout(cambioT); await guarda(); } };
addEventListener('pagehide', suelta);
function programa() { if (D.ejemplo) return; pend = true; clearTimeout(cambioT); cambioT = setTimeout(guarda, 900); }
function cambio() { clearTimeout(hT); hT = setTimeout(anota, 350); programa(); }
for (const k of ['tinte', 'fondo']) $('#' + k).addEventListener('input', e => toma({ [k]: e.target.value }));
$('#propia').addEventListener('input', e => { const v = [...e.target.value]; if (v.length > 1) toma({ propia: v.join('') }); });
for (const [id, k] of [['invertir', 'invertir'], ['contextoOn', 'contexto']]) $('#' + id).addEventListener('change', e => toma({ [k]: e.target.checked }));
$('#sinFondo').addEventListener('change', async e => { D.ajustes.sinFondo = e.target.checked; await muestra(false); cambio(); });
$$('[data-mueve]').forEach(b => b.addEventListener('click', async () => { D.ajustes.mueve = b.dataset.mueve; await muestra(false); cambio(); }));
$('#nombre').addEventListener('input', e => { D.nombre = e.target.value.slice(0, 60) || 'Sin título'; $('#etiqueta').textContent = D.nombre; programa(); });
$('#auto').addEventListener('click', () => { ponPausa(false); toma({ anim: contexto().anim, contexto: true, velocidad: D.ajustes.velocidad || 1 }); });
$('#quieto').addEventListener('click', () => toma({ anim: [], contexto: false }));
const vuelve = l => Object.fromEntries(l.map(k => [k, b0[k]]));
$('#fiel').addEventListener('click', () => { toma(vuelve(['color', 'brillo', 'contraste', 'saturacion', 'invertir', 'atras', 'resplandor', 'fondo', 'tinte'])); toma({ luz: D.luzAuto = motor.luzIdeal() }); });
$('#fondoBase').addEventListener('click', () => toma({ fondo: b0.fondo }));
$('#ajusteBase').addEventListener('click', async () => { const s = D.ajustes; Object.assign(s, vuelve(['nitidez', 'relieve', 'zoom', 'atras', 'brillo', 'contraste', 'saturacion', 'resplandor', 'invertir']), { columnas: base('columnas') }); toma({ luz: D.luzAuto = motor.luzIdeal() }); });
$('#elegir').addEventListener('click', () => { $('#archivo').accept = 'image/png,image/jpeg,image/webp,image/gif,image/bmp,image/avif,.glb,.obj,.stl,.ply,.json'; $('#archivo').click(); });
$('#recupera').addEventListener('click', () => { $('#archivo').accept = '.json'; $('#archivo').click(); });
$('#archivo').addEventListener('change', e => { const f = e.target.files[0]; e.target.value = ''; abreArchivo(f); });
$('#nuevo').addEventListener('click', async () => { await suelta(); ejemplo(); });
let hondo = 0, quitaLetras = () => {};
addEventListener('dragenter', e => { if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) { hondo++; if ($('#soltar').hidden) { quitaLetras(); quitaLetras = A.letras($('#soltar')); } $('#soltar').hidden = false; } }); addEventListener('dragleave', () => { if (--hondo <= 0) { hondo = 0; $('#soltar').hidden = true; quitaLetras(); } }); addEventListener('dragover', e => e.preventDefault());
addEventListener('drop', e => { e.preventDefault(); hondo = 0; $('#soltar').hidden = true; quitaLetras(); const f = e.dataTransfer && e.dataTransfer.files[0]; if (f) abreArchivo(f); });
addEventListener('paste', e => { const f = [...(e.clipboardData ? e.clipboardData.files : [])][0]; if (f) abreArchivo(f); });

// ---------- pincel: corregir qué es objeto y qué es fondo ----------
let P = null;
const pinta = () => {
  const c = P.lienzo, x = c.getContext('2d'); x.clearRect(0, 0, c.width, c.height); x.drawImage(P.foto, 0, 0, c.width, c.height); x.fillStyle = 'rgba(10,26,60,.72)'; x.fillRect(0, 0, c.width, c.height);
  const q = document.createElement('canvas'); q.width = c.width; q.height = c.height; const y = q.getContext('2d'), m = document.createElement('canvas'); m.width = P.W; m.height = P.H; const z = m.getContext('2d'), d = z.createImageData(P.W, P.H); for (let i = 0; i < P.W * P.H; i++) d.data[i * 4 + 3] = P.masc[i] ? 255 : 0; z.putImageData(d, 0, 0); y.drawImage(P.foto, 0, 0, c.width, c.height); y.globalCompositeOperation = 'destination-in'; y.drawImage(m, 0, 0, c.width, c.height); x.drawImage(q, 0, 0);
  for (let i = 0; i < P.W * P.H; i++) if (P.marca[i]) { d.data.set(P.marca[i] === 1 ? [255, 177, 74, 190] : [90, 160, 255, 190], i * 4); } else d.data[i * 4 + 3] = 0; z.clearRect(0, 0, P.W, P.H); z.putImageData(d, 0, 0); x.drawImage(m, 0, 0, c.width, c.height);
};
$('#marcar').addEventListener('click', async () => {
  const foto = await MotorAscii.lienzoDe(D.imagen.src), W = info.an, H = info.al, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(foto, 0, 0, W, H);
  P = { foto, W, H, rgba: x.getImageData(0, 0, W, H).data, lienzo: $('#pincel canvas'), masc: Uint8Array.from(info.masc), marca: D.imagen.marca ? Uint8Array.from(D.imagen.marca) : new Uint8Array(W * H), modo: 1 }; document.body.classList.add('editando');
  P.lienzo.width = Math.min(1200, foto.width); P.lienzo.height = Math.round(P.lienzo.width * foto.height / foto.width); P.lienzo.style.aspectRatio = foto.width + '/' + foto.height; $('#pincel').hidden = false; $('#pObjeto').setAttribute('aria-pressed', true); $('#pFondo').setAttribute('aria-pressed', false); pinta(); $('#pObjeto').focus();
});
{ const l = $('#pincel canvas'); let act = false, ant = null;
  const punto = e => { const r = l.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * P.W, y = (e.clientY - r.top) / r.height * P.H, R = Math.max(1.6, P.W * .014), a = ant || [x, y], n = Math.ceil(Math.hypot(x - a[0], y - a[1])) + 1; for (let k = 0; k <= n; k++) { const X = a[0] + (x - a[0]) * k / n, Y = a[1] + (y - a[1]) * k / n; for (let j = Math.max(0, Math.floor(Y - R)); j <= Math.min(P.H - 1, Y + R); j++) for (let i = Math.max(0, Math.floor(X - R)); i <= Math.min(P.W - 1, X + R); i++) if (Math.hypot(i - X, j - Y) <= R) P.marca[j * P.W + i] = P.modo; } ant = [x, y]; pinta(); };
  l.addEventListener('pointerdown', e => { if (!P) return; act = true; ant = null; l.setPointerCapture(e.pointerId); punto(e); }); l.addEventListener('pointermove', e => { if (act) punto(e); });
  for (const ev of ['pointerup', 'pointercancel']) l.addEventListener(ev, () => { if (!act) return; act = false; setTimeout(() => { if (!P) return; P.masc = P.marca.includes(1) ? Objeto.recorta(P.rgba, P.W, P.H, P.marca).masc : P.masc.map((v, i) => P.marca[i] === 2 ? 0 : v); pinta(); }, 20); });
  for (const [id, m] of [['#pObjeto', 1], ['#pFondo', 2]]) $(id).addEventListener('click', () => { P.modo = m; $('#pObjeto').setAttribute('aria-pressed', m === 1); $('#pFondo').setAttribute('aria-pressed', m === 2); });
  $('#pAuto').addEventListener('click', () => { P.marca.fill(0); const r = Objeto.recorta(P.rgba, P.W, P.H, null); P.masc = r.claro ? r.masc : new Uint8Array(P.W * P.H); pinta(); });
  $('#pNo').addEventListener('click', () => { document.body.classList.remove('editando'); P = null; $('#pincel').hidden = true; });
  $('#pSi').addEventListener('click', async () => { D.imagen.marca = P.marca.some(v => v) ? P.marca : null; P = null; document.body.classList.remove('editando'); $('#pincel').hidden = true; D.ajustes.mueve = 'objeto'; await muestra(false); D.ajustes.luz = D.luzAuto = motor.luzIdeal(); pintaPanel(); if (info.hay && !D.ajustes.anim.length) { D.ajustes.anim = contexto().anim; pintaPanel(); } if (D.ejemplo) await guarda(); else cambio(); avisa(info.hay ? 'Objeto actualizado.' : 'Sin objeto: se mueve el paisaje.'); });
}

// ---------- goma: borrar o recuperar partes de la imagen ----------
let G = null;
const AYUDA = { pincel: 'Pasa el dedo o el ratón por lo que quieras cambiar.', lazo: 'Rodea una zona: se aplica a todo lo que quede dentro.', varita: 'Toca un color: se aplica a la mancha seguida de ese color.' };
const gPinta = () => {
  const c = G.lienzo, x = c.getContext('2d'); x.clearRect(0, 0, c.width, c.height);
  if (G.accion === 'recupera') { x.globalAlpha = .28; x.drawImage(G.foto, 0, 0, c.width, c.height); x.globalAlpha = 1; }
  const q = G.aux, y = q.getContext('2d'); y.globalCompositeOperation = 'source-over'; y.clearRect(0, 0, q.width, q.height); y.drawImage(G.foto, 0, 0, q.width, q.height); y.globalCompositeOperation = 'destination-out'; y.drawImage(G.masc, 0, 0, q.width, q.height); x.drawImage(q, 0, 0);
  if (G.lazo && G.lazo.length > 1) { const k = c.width / G.masc.width; x.beginPath(); G.lazo.forEach(([a, b], i) => i ? x.lineTo(a * k, b * k) : x.moveTo(a * k, b * k)); x.closePath(); x.fillStyle = 'rgba(255,177,74,.25)'; x.fill(); x.lineWidth = 2; x.strokeStyle = '#ffb14a'; x.stroke(); }
};
const gBotones = () => { marca('[data-accion]', b => b.dataset.accion === G.accion); marca('[data-util]', b => b.dataset.util === G.util); $('#gAyuda').textContent = AYUDA[G.util]; const r = $('#gRango'); r.parentElement.style.visibility = G.util === 'lazo' ? 'hidden' : 'visible'; $('#gTam').textContent = G.util === 'varita' ? 'Parecido del color' : 'Grosor'; $('#gAtras').disabled = !G.pila.length; };
const gGuarda = () => { G.pila.push(G.masc.getContext('2d').getImageData(0, 0, G.masc.width, G.masc.height)); if (G.pila.length > 12) G.pila.shift(); };
async function abreGoma() {
  if (!D || D.tipo !== 'imagen') return; const foto = await MotorAscii.lienzoDe(D.imagen.src), m = document.createElement('canvas'), k = Math.min(1, 720 / Math.max(foto.width, foto.height)); m.width = Math.max(2, Math.round(foto.width * k)); m.height = Math.max(2, Math.round(foto.height * k)); if (D.imagen.borra) m.getContext('2d').drawImage(await MotorAscii.lienzoDe(D.imagen.borra), 0, 0, m.width, m.height);
  const l = $('#goma canvas'), e = Math.min(1.5, 1200 / Math.max(foto.width, foto.height)); l.width = Math.round(foto.width * e); l.height = Math.round(foto.height * e); l.style.aspectRatio = foto.width + '/' + foto.height; const aux = document.createElement('canvas'); aux.width = l.width; aux.height = l.height;
  const px = document.createElement('canvas'); px.width = m.width; px.height = m.height; const pc = px.getContext('2d', { willReadFrequently: true }); pc.drawImage(foto, 0, 0, px.width, px.height);
  G = { foto, masc: m, lienzo: l, aux, color: pc.getImageData(0, 0, px.width, px.height).data, accion: 'borra', util: 'pincel', pila: [], lazo: null }; $('#goma').hidden = false; document.body.classList.add('editando'); gBotones(); gPinta(); $('[data-accion=borra]').focus();
}
const cierraGoma = () => { G = null; $('#goma').hidden = true; document.body.classList.remove('editando'); };
{ const l = $('#goma canvas'); let act = false, ant = null;
  const donde = e => { const r = l.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * G.masc.width, (e.clientY - r.top) / r.height * G.masc.height]; };
  const modo = x => { x.globalCompositeOperation = G.accion === 'borra' ? 'source-over' : 'destination-out'; x.fillStyle = x.strokeStyle = '#000'; };
  const raya = (a, b) => { const x = G.masc.getContext('2d'); modo(x); x.lineWidth = $('#gRango').value / 720 * Math.max(G.masc.width, G.masc.height) * 1.6; x.lineCap = x.lineJoin = 'round'; x.beginPath(); x.moveTo(...a); x.lineTo(b[0] + .01, b[1]); x.stroke(); x.globalCompositeOperation = 'source-over'; };
  const varita = ([a, b]) => { // mancha seguida de color parecido
    const W = G.masc.width, H = G.masc.height, X = Math.max(0, Math.min(W - 1, a | 0)), Y = Math.max(0, Math.min(H - 1, b | 0)), d = G.color, s = Y * W + X, T = $('#gRango').value * 2.4 + 6, v = new Uint8Array(W * H), p = [s], r = d[s * 4], g = d[s * 4 + 1], z = d[s * 4 + 2]; v[s] = 1;
    while (p.length) { const q = p.pop(), i = q % W; for (const [n, ok] of [[q + 1, i < W - 1], [q - 1, i > 0], [q + W, q < W * (H - 1)], [q - W, q >= W]]) if (ok && !v[n] && Math.hypot(d[n * 4] - r, d[n * 4 + 1] - g, d[n * 4 + 2] - z) < T) { v[n] = 1; p.push(n); } }
    const t = document.createElement('canvas'); t.width = W; t.height = H; const y = t.getContext('2d'), m = y.createImageData(W, H); for (let q = 0; q < W * H; q++) if (v[q]) { const i = q % W; for (const n of [q, i ? q - 1 : q, i < W - 1 ? q + 1 : q, q >= W ? q - W : q, q < W * (H - 1) ? q + W : q]) m.data[n * 4 + 3] = 255; } y.putImageData(m, 0, 0); const x = G.masc.getContext('2d'); modo(x); x.drawImage(t, 0, 0); x.globalCompositeOperation = 'source-over'; };
  l.addEventListener('pointerdown', e => { if (!G || act) return; e.preventDefault(); gGuarda(); const p = donde(e); if (G.util === 'varita') varita(p); else { act = e.pointerId; try { l.setPointerCapture(e.pointerId); } catch (x) {} ant = p; if (G.util === 'lazo') G.lazo = [p]; else raya(p, p); } gPinta(); gBotones(); });
  l.addEventListener('pointermove', e => { if (!G || act !== e.pointerId) return; const p = donde(e); if (G.util === 'lazo') G.lazo.push(p); else raya(ant, p); ant = p; gPinta(); });
  for (const ev of ['pointerup', 'pointercancel']) l.addEventListener(ev, e => { if (act !== e.pointerId) return; act = false; if (!G) return; if (G.lazo) { if (G.lazo.length > 3 && ev === 'pointerup') { const x = G.masc.getContext('2d'); modo(x); x.beginPath(); G.lazo.forEach((q, i) => i ? x.lineTo(...q) : x.moveTo(...q)); x.closePath(); x.fill(); x.globalCompositeOperation = 'source-over'; } else G.pila.pop(); G.lazo = null; } gPinta(); gBotones(); });
  $$('[data-accion]').forEach(b => b.addEventListener('click', () => { G.accion = b.dataset.accion; gBotones(); gPinta(); })); $$('[data-util]').forEach(b => b.addEventListener('click', () => { G.util = b.dataset.util; gBotones(); }));
  $('#gAtras').addEventListener('click', () => { const q = G.pila.pop(); if (q) { G.masc.getContext('2d').putImageData(q, 0, 0); gPinta(); gBotones(); } });
  $('#gTodo').addEventListener('click', () => { gGuarda(); G.masc.getContext('2d').clearRect(0, 0, G.masc.width, G.masc.height); gPinta(); gBotones(); });
  $('#gNo').addEventListener('click', cierraGoma); $('#borrar').addEventListener('click', abreGoma); $('#borrar2').addEventListener('click', abreGoma);
  $('#gSi').addEventListener('click', async () => {
    const m = G.masc, d = m.getContext('2d').getImageData(0, 0, m.width, m.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 100) n++; if (n > d.length / 4 * .985) { $('#gAyuda').textContent = 'Has borrado toda la imagen. Recupera alguna parte.'; return; }
    D.imagen.borra = n ? m.toDataURL('image/png') : null; cierraGoma(); await muestra(false); if (D.ejemplo) await guarda(); else cambio(); avisa(n ? 'Partes borradas.' : 'Imagen completa.');
  });
  addEventListener('keydown', e => { if (!G) return; if (e.key === 'Escape') cierraGoma(); else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.stopImmediatePropagation(); $('#gAtras').click(); } }, true);
}

// ---------- guardado en el navegador (IndexedDB) ----------
let bd = null;
const abreBD = () => bd ? Promise.resolve(bd) : new Promise((ok, no) => { let r; try { r = indexedDB.open('mundo-en-caracteres', 1); } catch (e) { return no(e); } r.onupgradeneeded = () => r.result.createObjectStore('dibujos', { keyPath: 'id' }); r.onsuccess = () => ok(bd = r.result); r.onerror = () => no(r.error); });
const tx = async (modo, f) => { const b = await abreBD(); return new Promise((ok, no) => { const t = b.transaction('dibujos', modo), r = f(t.objectStore('dibujos')); t.oncomplete = () => ok(r && r.result); t.onerror = t.onabort = () => no(t.error); }); };
let conBD = true, protegido = false;
const recuerda = () => { try { localStorage.setItem('ultimo', D.id); } catch (e) {} };
async function guarda() {
  pend = false; if (!D || !conBD) return; D.ejemplo = false; recuerda(); const copia = { ...D, ajustes: { ...motor.S }, visto: Date.now(), mini: mini() }; delete copia.ejemplo; delete copia.luzAuto; delete copia.colBase;
  if (copia.tipo === 'modelo') copia.modelo = { ...D.modelo, partes: D.modelo.partes.map(p => ({ ...p, textura: p.textura ? (p.src = p.src || aSrc(p.textura)) : null, src: undefined })) };
  try { await tx('readwrite', s => s.put(copia)); if (!protegido && navigator.storage && navigator.storage.persist) protegido = await navigator.storage.persist(); } catch (e) { avisa(e && e.name === 'QuotaExceededError' ? 'No queda espacio en el navegador. Descarga el proyecto y borra alguno.' : 'No se pudo guardar aquí. Descarga el proyecto para no perderlo.', true); }
  $('#etiqueta').textContent = D.nombre; lista();
}
function mini() { const c = document.createElement('canvas'); c.width = 240; c.height = 180; motor.cuadro(performance.now()); const k = Math.max(240 / lienzo.width, 180 / lienzo.height), w = lienzo.width * k, h = lienzo.height * k; c.getContext('2d').drawImage(lienzo, (240 - w) / 2, (180 - h) / 2, w, h); return c.toDataURL('image/jpeg', .7); }
async function abreGuardado(id) {
  try { await suelta(); const g = await tx('readonly', s => s.get(id)); if (!g) throw 0; await restaura(g); recuerda(); scrollTo({ top: 0, behavior: quieto ? 'auto' : 'smooth' }); lista(); } catch (e) { avisa('Ese dibujo está dañado y no se puede abrir.', true); }
}
async function restaura(g) {
  D = { id: g.id, nombre: String(g.nombre).slice(0, 60), creado: g.creado, archivo: String(g.archivo || '').slice(0, 120), pistas: String(g.pistas || '').slice(0, 2000), piel: !!g.piel, tipo: g.tipo, ajustes: MotorAscii.ajustes(g.ajustes) };
  if (g.tipo === 'imagen') D.imagen = { src: g.imagen.src, marca: g.imagen.marca instanceof Uint8Array ? g.imagen.marca : null, borra: typeof g.imagen.borra === 'string' ? g.imagen.borra : null }; else { const partes = []; for (const p of g.modelo.partes) { const src = p.textura || null; partes.push({ ...p, src, textura: src ? await MotorAscii.lienzoDe(src) : null }); } D.modelo = { ...g.modelo, partes }; }
  await muestra(false);
}
async function lista() {
  const ul = $('#lista'); let t = []; try { t = (await tx('readonly', s => s.getAll())).sort((a, b) => (b.visto || 0) - (a.visto || 0)); } catch (e) { conBD = false; $('#estado').textContent = 'Este navegador no deja guardar aquí (¿ventana privada?). Descarga el proyecto para conservarlo.'; }
  ul.textContent = ''; $('#copia').disabled = !t.length;
  if (!t.length) { const l = document.createElement('li'); l.className = 'vacio'; l.textContent = 'Lo que crees aparecerá aquí.'; ul.append(l); }
  for (const g of t) {
    const l = document.createElement('li'), v = document.createElement('button'), n = document.createElement('span'), p = document.createElement('div'), f = document.createElement('span'), b = document.createElement('button'); l.className = D && g.id === D.id ? 'act' : '';
    v.type = b.type = 'button'; v.className = 'ver'; v.setAttribute('aria-label', 'Abrir ' + g.nombre); if (/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(g.mini || '')) v.style.backgroundImage = 'url(' + g.mini + ')'; v.addEventListener('click', () => abreGuardado(g.id));
    n.className = 'nom'; n.textContent = g.nombre; n.title = g.nombre; p.className = 'pie'; f.textContent = new Date(g.creado).toLocaleDateString('es', { day: 'numeric', month: 'short' }) + (g.tipo === 'modelo' ? ' · 3D' : '');
    b.textContent = 'Borrar'; b.addEventListener('click', async () => { if (!b.classList.contains('seguro')) { b.classList.add('seguro'); b.textContent = '¿Seguro?'; setTimeout(() => { b.classList.remove('seguro'); b.textContent = 'Borrar'; }, 3000); return; } if (D && D.id === g.id) { clearTimeout(cambioT); pend = false; } await tx('readwrite', s => s.delete(g.id)); if (D && D.id === g.id) D.ejemplo = true; avisa('Borrado.'); lista(); });
    p.append(f, b); l.append(v, n, p); ul.append(l);
  }
  if (conBD) { let e = ''; try { const q = await navigator.storage.estimate(); if (q.usage) e = ' Ocupan ' + (q.usage / 1e6).toFixed(1).replace('.', ',') + ' MB.'; protegido = protegido || await navigator.storage.persisted(); } catch (x) {} $('#estado').textContent = t.length ? t.length + (t.length === 1 ? ' guardado' : ' guardados') + ' en este navegador.' + e + (protegido ? ' Protegidos contra la limpieza automática.' : ' El navegador podría borrarlos si le falta espacio.') : ''; }
}

// ---------- archivos ----------
const tactil = matchMedia('(pointer: coarse)').matches, ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1), dentroDeApp = /FBAN|FBAV|Instagram|Line\/|TikTok|musical_ly|Snapchat|WhatsApp|Twitter|; wv\)/i.test(navigator.userAgent);
let ultimo = null, salida = 1;
// Se entrega como archivo genérico para que el navegador lo guarde y nunca lo abra en lugar de esta página.
// La dirección temporal dura hasta la siguiente descarga: en móvil el aviso de guardar puede tardar.
let dirs = [];
function baja(blob, nombre) { dirs.splice(0, Math.max(0, dirs.length - 2)).forEach(u => URL.revokeObjectURL(u)); const a = document.createElement('a'), u = URL.createObjectURL(new Blob([blob], { type: 'application/octet-stream' })); dirs.push(u); a.href = u; a.download = nombre; a.rel = 'noopener'; a.hidden = true; document.body.append(a); a.click(); setTimeout(() => a.remove(), 1000); }
const comoArchivo = f => { try { const q = new File([f.blob], f.nombre, { type: f.blob.type.split(';')[0] }); return navigator.canShare && navigator.canShare({ files: [q] }) ? q : null; } catch (e) { return null; } };
const peso = n => n < 1e6 ? Math.max(1, Math.round(n / 1e3)) + ' KB' : (n / 1e6).toFixed(1).replace('.', ',') + ' MB';
const respira_ = () => new Promise(ok => setTimeout(ok, 30));
const archivo = e => (D.nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'dibujo') + e;
const modeloTexto = m => ({ eje: m.eje, medidas: m.medidas, partes: m.partes.map(parteTexto) });
const parteTexto = p => ({ pos: MotorAscii.aTexto(p.pos, 'i16', 24000), nor: MotorAscii.aTexto(p.nor, 'i8', 127), uv: p.uv && MotorAscii.aTexto(p.uv, 'f32'), col: p.col && MotorAscii.aTexto(p.col, 'u8', 255), ind: p.ind && MotorAscii.aTexto(p.ind, 'u32'), color: p.color, textura: p.textura ? (typeof p.textura === 'string' ? p.textura : p.src || aSrc(p.textura)) : null });
const proyecto = g => ({ formato: 'mundo-en-caracteres', version: 1, id: g.id, nombre: g.nombre, creado: g.creado, archivo: g.archivo, pistas: g.pistas, piel: g.piel, tipo: g.tipo, ajustes: g.ajustes, imagen: g.tipo === 'imagen' ? { src: g.imagen.src, marca: g.imagen.marca ? MotorAscii.aTexto(g.imagen.marca, 'u8') : undefined, borra: g.imagen.borra || undefined } : undefined, modelo: g.tipo === 'modelo' ? modeloTexto(g.modelo) : undefined });
async function pagina(av) {
  const P = { nombre: D.nombre, tipo: D.tipo, ajustes: motor.S, solo: sal() === 2 ? 2 : sal() ? 1 : 0, soloObjeto: sal() === 3 };
  if (D.tipo === 'imagen') { P.imagen = { an: info.an, al: info.al, prop: info.prop, marco: info.marco, encuadre: info.encuadre, capas: [] }; for (const c of info.capas) { P.imagen.capas.push({ ...c, lienzo: undefined, src: aSrc(c.lienzo), region: MotorAscii.aTexto(c.region, 'u8'), alto: MotorAscii.aTexto(c.alto, 'u8', 255) }); await av(.7 * P.imagen.capas.length / info.capas.length); } }
  else { const m = D.modelo; P.modelo = { eje: m.eje, medidas: m.medidas, partes: [] }; for (const p of m.partes) { P.modelo.partes.push(parteTexto(p)); if (P.modelo.partes.length % 4 === 0 || m.partes.length < 12) await av(.7 * P.modelo.partes.length / m.partes.length); } }
  const r = await fetch('motor.js'); if (!r.ok) throw Error('Falta conexión para preparar la página. Inténtalo otra vez.'); const fuente = await r.text(); await av(.85); const json = JSON.stringify(P).replace(/</g, '\\u003c'), tit = D.nombre.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:"><title>${tit}</title><style>html,body{margin:0;height:100%;background:${sal() ? '#000' : motor.S.fondo};overflow:hidden}canvas{width:100%;height:100%;display:block;cursor:grab}p{position:fixed;left:16px;bottom:10px;margin:0;font:12px monospace;color:#9db3bb}</style></head><body><canvas id="l"></canvas><p id="e"></p><script type="application/json" id="d">${json}</` + `script><script>${fuente.replace(/<\/script/gi, '<\\/script')}</` + `script><script>(async()=>{const P=JSON.parse(document.getElementById('d').textContent);try{const m=new MotorAscii(document.getElementById('l'));await MotorAscii.abre(m,P);MotorAscii.gestos(m);const f=t=>{m.cuadro(t);requestAnimationFrame(f)};requestAnimationFrame(f)}catch(x){document.getElementById('e').textContent=x.message}})()</` + `script></body></html>`;
}
async function video(av, vivo) {
  if (!lienzo.captureStream || !window.MediaRecorder) throw Error('Este navegador no puede grabar video. Descarga la página animada.');
  const tipo = ['video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'].find(t => MediaRecorder.isTypeSupported(t)); if (!tipo) throw Error('Este navegador no puede grabar video.');
  const pausado = motor.pausa; ponPausa(false); let copia = lienzo, sigue = true;
  if (sal()) { // se graba aparte, recortado al dibujo con un margen para el movimiento
    motor.solo = sal() === 2 ? 2 : 1; motor.soloObjeto = sal() === 3; motor.cuadro(performance.now()); const [a, b, c, e] = motor.caja(), mx = (c - a) * .07 + 1, my = (e - b) * .07 + 1, x0 = Math.max(0, a - mx) * motor.cw, x1 = Math.min(motor.cols, c + mx) * motor.cw, y0 = Math.max(0, motor.filas - e - my) * motor.ch, y1 = Math.min(motor.filas, motor.filas - b + my) * motor.ch;
    copia = document.createElement('canvas'); copia.width = Math.max(2, Math.round((x1 - x0) / 2) * 2); copia.height = Math.max(2, Math.round((y1 - y0) / 2) * 2); const k = copia.getContext('2d', { alpha: false }), pasa = () => { if (!sigue) return; k.drawImage(lienzo, x0, y0, x1 - x0, y1 - y0, 0, 0, copia.width, copia.height); requestAnimationFrame(pasa); }; pasa();
  }
  const st = copia.captureStream(30), tr = []; let r;
  try {
    r = new MediaRecorder(st, { mimeType: tipo, videoBitsPerSecond: tactil ? 5e6 : 9e6 }); r.ondataavailable = e => e.data.size && tr.push(e.data);
    await new Promise((ok, no) => { r.onstop = ok; r.onerror = () => no(Error('La grabación falló. Prueba con la página animada.')); r.start(250); const t0 = performance.now(), iv = setInterval(() => { const q = (performance.now() - t0) / 6000; av(Math.min(1, q)); if (q >= 1 || !vivo()) { clearInterval(iv); if (r.state !== 'inactive') r.stop(); } }, 120); });
  } finally { sigue = false; motor.solo = 0; motor.soloObjeto = false; st.getTracks().forEach(t => t.stop()); ponPausa(!!pausado); }
  if (!vivo()) return null; const b = new Blob(tr, { type: tipo.split(';')[0] }); if (b.size < 2000) throw Error('La grabación salió vacía. Prueba con la página animada.'); return b;
}
const FORMATOS = {
  png: ['la imagen', '.png', async () => { let l = lienzo; if (sal()) { motor.soloObjeto = sal() === 3; motor.cuadro(performance.now()); l = motor.recorte(sal() === 2 ? 2 : 1); motor.soloObjeto = false; motor.cuadro(performance.now()); } const q = await new Promise(ok => l.toBlob(ok, 'image/png')); if (!q) throw Error('No se pudo crear la imagen.'); return q; }],
  txt: ['el texto', '.txt', async () => new Blob([motor.texto()], { type: 'text/plain' })],
  html: ['la página animada', '.html', async av => new Blob([await pagina(av)], { type: 'text/html' })],
  proyecto: ['el proyecto', '.json', async () => new Blob([JSON.stringify(proyecto({ ...D, ajustes: motor.S }))], { type: 'application/json' })],
  video: ['el video', '.mp4', video],
  copia: ['la copia de todos', '.json', async av => { const t = await tx('readonly', s => s.getAll()), partes = ['{"formato":"mundo-en-caracteres/copia","version":1,"dibujos":[']; for (let i = 0; i < t.length; i++) { partes.push((i ? ',' : '') + JSON.stringify(proyecto(t[i]))); await av((i + 1) / t.length); } partes.push(']}'); return new Blob(partes, { type: 'application/json' }); }]
};
// qué lleva la descarga: 1 solo el dibujo, 2 solo las letras, 0 con el fondo
const N_SALIDA = { 3: 'Solo el objeto, sin el resto de la foto. La imagen lleva fondo transparente; el video y la página, negro.', 1: 'Recortado al dibujo. La imagen lleva fondo transparente; el video y la página, negro.', 2: 'Solo los caracteres, sin color detrás. La imagen lleva fondo transparente.', 0: 'Todo lo que ves, con el color de fondo y el resplandor.' };
const hayObjeto = () => !!(D && D.tipo === 'imagen' && info && info.hay && !info.solo && D.ajustes.mueve === 'objeto'), sal = () => salida === 3 && !hayObjeto() ? 1 : salida;
function pintaSalida() { $('[data-salida="3"]').disabled = !hayObjeto(); marca('[data-salida]', b => +b.dataset.salida === sal()); $('#nSalida').textContent = N_SALIDA[sal()]; }
function ponSalida(v) { salida = v; pintaSalida(); try { localStorage.setItem('salida', v); } catch (e) {} }
$$('[data-salida]').forEach(b => b.addEventListener('click', () => ponSalida(+b.dataset.salida))); { let v = 1; try { const g = localStorage.getItem('salida'); if (g !== null && N_SALIDA[g]) v = +g; } catch (e) {} ponSalida(v); }
// ventana de progreso: prepara, entrega y vuelve a la lista de descargas
const dd = $('#dDesc'); let turno = 0, cierra = 0, dirVista = '';
const barraTxt = v => { const n = 18, k = Math.round(v * n), p = $('#dBarra'); p.textContent = '█'.repeat(k) + '░'.repeat(n - k) + ' ' + String(Math.round(v * 100)).padStart(3) + ' %'; p.setAttribute('aria-valuenow', Math.round(v * 100)); };
const ve = o => { for (const id of ['dGuardar', 'dComp', 'dCopia']) $('#' + id).hidden = !o.includes(id); };
let deLista = false;
function aDescargas() { const abierta = dd.open; turno++; clearTimeout(cierra); if (abierta) dd.close(); if (abierta && !deLista) { pestana($("#t-baja")); const y = $(".descargas").getBoundingClientRect(); if (tactil && (y.top > innerHeight - 160 || y.bottom < innerHeight * .6)) scrollBy({ top: $(".tabs").getBoundingClientRect().bottom - $("#escena").getBoundingClientRect().bottom - $(".tabs").offsetHeight, behavior: quieto ? "auto" : "smooth" }); } const v = $('#dVista'); v.textContent = ''; if (dirVista) { URL.revokeObjectURL(dirVista); dirVista = ''; } }
dd.addEventListener('cancel', e => { e.preventDefault(); aDescargas(); }); dd.addEventListener('pointerdown', () => clearTimeout(cierra)); $('#dVolver').addEventListener('click', aDescargas);
function pintaUltimo() { $('#ultimo').hidden = !ultimo; if (!ultimo) return; $('#uNombre').textContent = ultimo.nombre + ' · ' + peso(ultimo.blob.size); $('#uComp').hidden = !comoArchivo(ultimo); }
function entregado(t) {
  $('#dTit').textContent = 'Listo'; $('#dBarra').hidden = true; $('#dTxt').textContent = t; $('#dGuardar').textContent = 'Guardar otra vez'; $('#dGuardar').classList.remove('lleno'); $('#dVolver').textContent = 'Volver a descargas'; dd.classList.add('hecho');
  clearTimeout(cierra); if (!dentroDeApp) cierra = setTimeout(aDescargas, 4200);
}
async function comparte() { const q = ultimo && comoArchivo(ultimo); if (!q) return; clearTimeout(cierra); try { await navigator.share({ files: [q], title: ultimo.nombre }); entregado('Archivo entregado.'); } catch (e) { if (e.name !== 'AbortError') { baja(ultimo.blob, ultimo.nombre); entregado(avisoGuardado()); } } }
const avisoGuardado = () => dentroDeApp ? 'Si no se guardó, es porque el navegador de esta aplicación no deja descargar. Abre esta página en Chrome o Safari.' : tactil ? 'Enviado a las descargas del teléfono. Si tu navegador pregunta, acepta guardar.' : 'Enviado a tu carpeta de descargas.';
// en iPhone lo fiable es la hoja del sistema («Guardar en Archivos»); en el resto, la descarga normal
const entrega = () => { if (!ultimo) return; if (ios && comoArchivo(ultimo)) return comparte(); baja(ultimo.blob, ultimo.nombre); entregado(avisoGuardado()); };
$('#dGuardar').addEventListener('click', entrega); $('#dComp').addEventListener('click', comparte); $('#uGuardar').addEventListener('click', () => { abreVentana('Archivo listo'); entrega(); }); $('#uComp').addEventListener('click', comparte);
$('#dCopia').addEventListener('click', async () => { try { await navigator.clipboard.writeText(await ultimo.blob.text()); entregado('Texto copiado.'); } catch (e) { $('#dTxt').textContent = 'No se pudo copiar.'; } });
function abreVentana(t) { dd.classList.remove('hecho', 'mal'); $('#dTit').textContent = t; $('#dTxt').textContent = ''; $('#dBarra').hidden = false; $('#dGuardar').textContent = 'Guardar archivo'; $('#dGuardar').classList.add('lleno'); $('#dVolver').textContent = 'Cancelar'; ve([]); barraTxt(0); if (!dd.open) dd.showModal(); }
async function descarga(k) {
  deLista = k === "copia"; const [que, ext, hace] = FORMATOS[k], yo = ++turno, vivo = () => yo === turno && dd.open; clearTimeout(cierra); $('#dVista').textContent = ''; $('#dVista').classList.remove('cuadros'); motor.cuadro(performance.now()); abreVentana((k === 'video' ? 'Grabando ' : 'Preparando ') + que); $('#dTxt').textContent = k === 'video' ? 'Tarda 6 segundos. No cambies de aplicación.' : 'Un momento…';
  const im = new Image(); im.alt = ''; im.src = mini(); $('#dVista').append(im); const quita = A.letras($('#dVista')), t0 = performance.now(); A.descifra($('#dTit'), 600);
  const av = async v => { if (vivo()) barraTxt(Math.min(.97, v)); await respira_(); };
  try {
    await respira_(); const blob = await hace(av, vivo); if (!vivo() || !blob) return; while (performance.now() - t0 < 700) { if (!vivo()) return; barraTxt(Math.min(.99, Math.max(.3, (performance.now() - t0) / 700))); await respira_(); } if (!vivo()) return; barraTxt(1);
    ultimo = { blob, nombre: k === 'copia' ? 'mis-dibujos-ascii.json' : archivo(k === 'video' && blob.type.includes('webm') ? '.webm' : ext) }; pintaUltimo();
    // vista previa del archivo real: si el navegador no deja descargar, la imagen se guarda manteniéndola pulsada
    if (k === 'png' || k === 'video') { if (dirVista) URL.revokeObjectURL(dirVista); dirVista = URL.createObjectURL(blob); const m = document.createElement(k === 'png' ? 'img' : 'video'); if (k === 'video') Object.assign(m, { muted: true, loop: true, autoplay: true, playsInline: true, controls: true }); else m.alt = 'Vista previa'; m.src = dirVista; $('#dVista').classList.toggle('cuadros', k === 'png' && sal() > 0); $('#dVista').replaceChildren(m); }
    ve(['dGuardar'].concat(comoArchivo(ultimo) ? ['dComp'] : [], k === 'txt' ? ['dCopia'] : []));
    if (tactil) { $('#dTit').textContent = 'Archivo listo'; $('#dTxt').textContent = ultimo.nombre + ' · ' + peso(blob.size) + (k === 'png' ? '. También puedes mantener pulsada la imagen para guardarla.' : '.') + (dentroDeApp ? ' Estás en el navegador de otra aplicación: si no se guarda, abre esta página en Chrome o Safari.' : ''); $('#dVolver').textContent = 'Volver a descargas'; $('#dGuardar').focus(); }
    else { baja(blob, ultimo.nombre); entregado(ultimo.nombre + ' · ' + peso(blob.size) + '. ' + avisoGuardado()); }
  } catch (x) { if (!vivo()) return; dd.classList.add('mal'); $('#dTit').textContent = 'No se pudo descargar'; $('#dBarra').hidden = true; $('#dTxt').textContent = x.message || 'Algo falló.'; ve([]); $('#dVolver').textContent = 'Volver a descargas'; } finally { quita(); }
}
$$('[data-baja]').forEach(b => b.addEventListener('click', () => descarga(b.dataset.baja))); $('#copia').addEventListener('click', () => descarga('copia'));
// importa un proyecto o una copia; se revisa todo antes de aceptarlo
async function importa(f) {
  if (f.size > 400e6) throw Error('La copia es demasiado grande.'); let j; try { j = JSON.parse(await f.text()); } catch (e) { throw Error('Ese archivo no es un proyecto del generador.'); }
  const l = j && j.formato === 'mundo-en-caracteres/copia' && Array.isArray(j.dibujos) ? j.dibujos.slice(0, 500) : j && j.formato === 'mundo-en-caracteres' ? [j] : null; if (!l) throw Error('Ese archivo no es un proyecto del generador.');
  let bien = 0, mal = 0; const ya = new Set(conBD ? await tx('readonly', s => s.getAllKeys()) : []);
  for (const g of l) try {
    const q = { id: typeof g.id === 'string' && /^[\w-]{6,60}$/.test(g.id) && !ya.has(g.id) ? g.id : uid(), nombre: limpia(g.nombre), creado: Number.isFinite(g.creado) ? g.creado : Date.now(), archivo: typeof g.archivo === 'string' ? g.archivo.slice(0, 120) : '', pistas: typeof g.pistas === 'string' ? g.pistas.slice(0, 2000) : '', piel: g.piel === true, tipo: g.tipo, ajustes: MotorAscii.ajustes(g.ajustes) };
    if (g.tipo === 'imagen') { await MotorAscii.lienzoDe(g.imagen.src); q.imagen = { src: g.imagen.src, marca: typeof g.imagen.marca === 'string' && g.imagen.marca.length < 200000 ? MotorAscii.deTexto(g.imagen.marca, 'u8').map(v => v < 3 ? v : 0) : null, borra: null }; if (g.imagen.borra) { await MotorAscii.lienzoDe(g.imagen.borra); q.imagen.borra = g.imagen.borra; } } else if (g.tipo === 'modelo') { const m = await MotorAscii.modeloDe(g.modelo); q.modelo = { eje: m.eje, medidas: (Array.isArray(m.medidas) ? m.medidas : [1, 1, 1]).slice(0, 3).map(v => +v || 0), partes: m.partes }; } else throw 0;
    D = q; await muestra(false); await guarda(); bien++;
  } catch (e) { mal++; }
  if (!bien) throw Error('El archivo está dañado y no se pudo recuperar.'); avisa(bien === 1 ? 'Dibujo recuperado.' : bien + ' dibujos recuperados.' + (mal ? ' ' + mal + ' estaban dañados.' : ''));
}

// ---------- arranque ----------
// vista: en pantallas táctiles arranca bloqueada, para que al bajar por la página no se gire ni se acerque
let libre = !tactil, avisado = false;
function ponLibre(v) { libre = v; lienzo.style.touchAction = v ? 'none' : 'pan-y'; lienzo.classList.toggle('fija', !v); const b = $('#candado'), n = v ? 'Bloquear la vista' : 'Desbloquear la vista para girar y acercar'; b.setAttribute('aria-label', n); b.title = n; b.setAttribute('aria-pressed', !v); b.querySelector('path').setAttribute('d', v ? 'M5 11h14v9H5zM8 11V7a4 4 0 0 1 7.6-1.7' : 'M5 11h14v9H5zM8 11V7a4 4 0 0 1 8 0v4'); }
$('#candado').addEventListener('click', () => { ponLibre(!libre); avisa(libre ? (tactil ? 'Un dedo gira, dos acercan.' : 'Arrastra para girar. Ctrl y rueda para acercar.') : 'Vista bloqueada.'); }); ponLibre(libre);
MotorAscii.gestos(motor, () => { barras.forEach(f => f()); cambio(); }, { libre: () => libre, rueda: e => libre && (e.ctrlKey || e.metaKey) });
{ let x0 = null; lienzo.addEventListener('pointerdown', e => x0 = libre ? null : e.clientX); lienzo.addEventListener('pointermove', e => { if (x0 !== null && !avisado && e.buttons && Math.abs(e.clientX - x0) > 40) { avisado = true; avisa('La vista está bloqueada. Toca el candado para girarla.'); } }); }
// ni pellizcos ni doble toque agrandan la página mientras se edita
document.addEventListener('gesturestart', e => e.preventDefault());
lienzo.addEventListener('keydown', e => { const k = { ArrowLeft: -.15, ArrowRight: .15 }[e.key]; if (k && libre) { motor.S.giroY += k; e.preventDefault(); cambio(); } else if (e.key === 'Enter') motor.toca(performance.now()); else if (e.key === ' ') { e.preventDefault(); ponPausa(!motor.pausa); } });
let visible = true; document.addEventListener('visibilitychange', () => visible = !document.hidden);
// no se dibuja lo que no se ve, y si el aparato va justo se baja un poco la resolución
let enVista = true; if (window.IntersectionObserver) new IntersectionObserver(l => enVista = l[l.length - 1].isIntersecting).observe($('#escena'));
let previo = 0, lento = 0, vistos = 0;
const bucle = ms => {
  requestAnimationFrame(bucle); if (!visible || !D || !(enVista || motor.solo) || G || P) { previo = 0; return; } motor.cuadro(ms);
  const dt = previo ? ms - previo : 0; previo = ms; if (!dt || dt > 120 || dd.open) return; vistos++; if (dt > 22.5) lento++;
  if (vistos >= 90) { const t = Math.min(devicePixelRatio || 1, motor.techo || 2); if (lento > 55 && t > 1) motor.techo = Math.max(1, t - .35); lento = vistos = 0; }
};
// si el móvil quita la gráfica, se monta otra vez el mismo dibujo
lienzo.addEventListener('webglcontextlost', e => e.preventDefault()); lienzo.addEventListener('webglcontextrestored', async () => { try { motor._arma(); motor.rk = ''; if (D) await muestra(false); } catch (e) { avisa('Recarga la página para ver el dibujo.', true); } });
(async () => { try { let g = null; try { const id = localStorage.getItem('ultimo'); g = id && await tx('readonly', s => s.get(id)); } catch (e) {} try { if (g) await restaura(g); } catch (e) { g = null; } if (!g) await ejemplo(); } catch (e) { avisa(e.message, true); } requestAnimationFrame(bucle); requestAnimationFrame(() => requestAnimationFrame(() => { A.lista(); A.descifra($('h1'), 620); A.escalona($('[role=tabpanel]:not([hidden])').children, 80); A.escalona($$('#barraEscena button'), 120); })); await lista(); A.escalona($$('#lista li')); })();
})();
