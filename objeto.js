// Separa el objeto principal del fondo sin servidor ni IA: busca lo que destaca respecto a los
// bordes de la imagen y ajusta el contorno con un corte de grafos. El usuario puede corregirlo.
const Objeto = {
  // rgb: bytes RGBA de una imagen pequeña. marca: 0 nada, 1 objeto, 2 fondo (trazos del usuario)
  recorta(rgba, W, H, marca) {
    const liso = Objeto.liso(rgba, W, H, marca); if (liso) return { masc: liso, claro: true, liso: true };
    const N = W * H, lab = Objeto.lab(rgba, N), L = Objeto.suave(lab, W, H, 3), hayMarca = marca && marca.some(v => v === 1);
    const S = Objeto.destaca(L, W, H); let u = Objeto.otsu(S), masc = new Uint8Array(N);
    const firme = new Uint8Array(N); for (let i = 0; i < N; i++) { if (marca && marca[i]) firme[i] = marca[i]; masc[i] = firme[i] ? (firme[i] === 1 ? 1 : 0) : S[i] > u ? 1 : 0; }
    if (hayMarca) { // con trazos, el objeto se busca cerca de ellos
      const d = Objeto.lejos(marca, 1, W, H), m = W * .22; for (let i = 0; i < N; i++) if (!firme[i]) masc[i] = d[i] < m * .45 || (masc[i] && d[i] < m * 1.6) ? 1 : 0;
    }
    let sep = 0;
    for (let v = 0; v < 4; v++) {
      const a = [], b = []; for (let i = 0; i < N; i++) (masc[i] ? a : b).push(i); if (a.length < 12 || b.length < 12) break;
      let ga, gb; if (hayMarca && v === 0) { const t = []; for (let i = 0; i < N; i++) if (marca[i] === 1) t.push(i); ga = Objeto.mezcla(L, t.length > 20 ? t : a); } else ga = Objeto.mezcla(L, a); gb = Objeto.mezcla(L, b);
      const fo = new Float32Array(N), ff = new Float32Array(N); sep = 0;
      for (let i = 0; i < N; i++) {
        const x = Objeto.coste(ga, L, i), y = Objeto.coste(gb, L, i), p = hayMarca ? 0 : Math.max(-3, Math.min(3, (S[i] - u) * 9)); fo[i] = x - p; ff[i] = y + p; if (masc[i]) sep += Math.max(-4, Math.min(8, y - x)) / a.length;
        if (firme[i] === 1) ff[i] = 1e4, fo[i] = 0; else if (firme[i] === 2) fo[i] = 1e4, ff[i] = 0;
      }
      masc = Objeto.corte(L, fo, ff, W, H);
    }
    masc = Objeto.limpia(masc, W, H, marca);
    let area = 0, borde = 0, nb = 0, contraste = 0, nc = 0, caja = [W, H, -1, -1];
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const q = j * W + i; if (!i || !j || i === W - 1) { nb++; borde += masc[q]; } if (!masc[q]) continue; area++; caja = [Math.min(caja[0], i), Math.min(caja[1], j), Math.max(caja[2], i), Math.max(caja[3], j)];
      for (const [k, ok] of [[q + 2, i < W - 2], [q - 2, i > 1], [q + 2 * W, j < H - 2], [q - 2 * W, j > 1]]) if (ok && !masc[k]) { contraste += Math.hypot(L[q * 3] - L[k * 3], L[q * 3 + 1] - L[k * 3 + 1], L[q * 3 + 2] - L[k * 3 + 2]); nc++; }
    }
    area /= N; borde /= nb || 1; contraste /= nc || 1;
    const compacto = caja[2] < 0 ? 0 : area * N / ((caja[2] - caja[0] + 1) * (caja[3] - caja[1] + 1));
    const claro = hayMarca || (area > .008 && area < .62 && borde < .27 && contraste > 11 && sep > 2.4 && compacto > .22 && caja[2] - caja[0] < W * .97);
    return { masc, area, borde, contraste, sep, compacto, caja, claro: !!claro && area > .0005 };
  },
  // fondo de un solo color: se borra entrando desde los bordes, así lo blanco de dentro de la figura no se pierde
  liso(d, W, H, marca) {
    const N = W * H, bor = []; for (let i = 0; i < W; i++) bor.push(i, (H - 1) * W + i); for (let j = 1; j < H - 1; j++) bor.push(j * W, j * W + W - 1);
    const med = [0, 1, 2].map(k => { const v = bor.map(i => d[i * 4 + k]).sort((a, b) => a - b); return v[v.length >> 1]; }), T = 18, dist = new Float32Array(N); for (let i = 0; i < N; i++) dist[i] = Math.hypot(d[i * 4] - med[0], d[i * 4 + 1] - med[1], d[i * 4 + 2] - med[2]);
    if (bor.filter(i => dist[i] < T).length / bor.length < .8) return null;
    // también vale un degradado suave (luz de estudio, viñeta): color cercano y sin saltos alrededor
    const salto = new Float32Array(N); for (let i = 0; i < N; i++) { const x = i % W; for (const [q, ok] of [[i + 1, x < W - 1], [i - 1, x > 0], [i + W, i < N - W], [i - W, i >= W]]) if (ok) salto[i] = Math.max(salto[i], Math.hypot(d[i * 4] - d[q * 4], d[i * 4 + 1] - d[q * 4 + 1], d[i * 4 + 2] - d[q * 4 + 2])); }
    const pasa = i => (dist[i] < T || (dist[i] < 85 && salto[i] < 7)) && !(marca && marca[i] === 1), vec = (q, f) => { const i = q % W; if (i) f(q - 1); if (i < W - 1) f(q + 1); if (q >= W) f(q - W); if (q < N - W) f(q + W); };
    // paso ancho: no se cuela por huecos finos del contorno
    const ancho = new Uint8Array(N); for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { let ok = 1; for (let y = Math.max(0, j - 1); ok && y <= Math.min(H - 1, j + 1); y++) for (let x = Math.max(0, i - 1); x <= Math.min(W - 1, i + 1); x++) if (!pasa(y * W + x)) { ok = 0; break; } ancho[j * W + i] = ok; }
    const fondo = new Uint8Array(N), entra = (ini, puede) => { const c = ini.filter(i => puede(i) && !fondo[i]); c.forEach(i => fondo[i] = 1); while (c.length) vec(c.pop(), r => { if (!fondo[r] && puede(r)) { fondo[r] = 1; c.push(r); } }); };
    entra(bor, i => ancho[i] === 1);
    // y después se ajusta al borde de la figura, un par de pasos
    for (let v = 0; v < 2; v++) { const n = []; for (let i = 0; i < N; i++) if (!fondo[i] && pasa(i)) { let j = 0; vec(i, r => j += fondo[r]); if (j) n.push(i); } n.forEach(i => fondo[i] = 1); }
    // bolsillos del mismo color que se abren al fondo por un hueco estrecho (entre las piernas, bajo un brazo)
    { let fig = 0; for (const v of fondo) fig += 1 - v; const z = Uint8Array.from(fondo, (v, i) => !v && dist[i] < 9 && pasa(i) ? 1 : 0), g = Objeto.grupos(z, 1, W, H), abre = new Set(); for (let i = 0; i < N; i++) if (g.g[i] >= 0) vec(i, r => { if (fondo[r]) abre.add(g.g[i]); }); for (let i = 0; i < N; i++) if (g.g[i] >= 0 && abre.has(g.g[i]) && g.t[g.g[i]].n < fig * .08) fondo[i] = 1; }
    // el borde suavizado lleva mezclado el color del fondo: se quita para que no deje un halo
    { const n = []; for (let i = 0; i < N; i++) if (!fondo[i] && dist[i] < 150 && !(marca && marca[i] === 1)) { let j = 0; vec(i, r => j += fondo[r]); if (j) n.push(i); } n.forEach(i => fondo[i] = 1); }
    if (marca) { const s = []; for (let i = 0; i < N; i++) if (marca[i] === 2) { s.push(i); } entra(s, pasa); s.forEach(i => fondo[i] = 1); }
    const m = Uint8Array.from(fondo, v => v ? 0 : 1); if (marca) for (let i = 0; i < N; i++) if (marca[i] === 1) m[i] = 1;
    // fuera motas sueltas
    const g = Objeto.grupos(m, 1, W, H), mx = Math.max(0, ...g.t.map(q => q.n)); for (let i = 0; i < N; i++) if (g.g[i] >= 0 && g.t[g.g[i]].n < Math.max(4, mx * .01) && !(marca && marca[i] === 1)) m[i] = 0;
    let area = 0; for (const v of m) area += v; area /= N; return area > .008 && area < .93 ? m : null;
  },
  lab(d, N) {
    const o = new Float32Array(N * 3), g = v => { v /= 255; return v > .04045 ? Math.pow((v + .055) / 1.055, 2.4) : v / 12.92; }, f = v => v > .008856 ? Math.cbrt(v) : 7.787 * v + .138;
    for (let i = 0; i < N; i++) { const r = g(d[i * 4]), e = g(d[i * 4 + 1]), b = g(d[i * 4 + 2]), x = f((.4124 * r + .3576 * e + .1805 * b) / .9505), y = f(.2126 * r + .7152 * e + .0722 * b), z = f((.0193 * r + .1192 * e + .9505 * b) / 1.089); o[i * 3] = 116 * y - 16; o[i * 3 + 1] = 500 * (x - y); o[i * 3 + 2] = 200 * (y - z); }
    return o;
  },
  suave(s, W, H, k) { const o = new Float32Array(s.length); for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) for (let c = 0; c < k; c++) { let a = 0, n = 0; for (let y = Math.max(0, j - 1); y <= Math.min(H - 1, j + 1); y++) for (let x = Math.max(0, i - 1); x <= Math.min(W - 1, i + 1); x++) { const p = x === i && y === j ? 3 : 1; a += s[(y * W + x) * k + c] * p; n += p; } o[(j * W + i) * k + c] = a / n; } return o; },
  // cuánto se aparta cada punto de los bordes: barrera mínima + contraste con cada lado
  destaca(L, W, H) {
    const N = W * H, S = new Float32Array(N);
    for (let c = 0; c < 3; c++) {
      const D = new Float32Array(N).fill(1e9), U = new Float32Array(N), M = new Float32Array(N); for (let i = 0; i < N; i++) U[i] = M[i] = L[i * 3 + c];
      for (let i = 0; i < W; i++) { D[i] = 0; if (i < W * .16 || i > W * .84) D[(H - 1) * W + i] = 0; } for (let j = 0; j < H * .9; j++) D[j * W] = D[j * W + W - 1] = 0;
      const prueba = (x, y) => { const v = L[x * 3 + c], a = Math.max(U[y], v), b = Math.min(M[y], v); if (a - b < D[x]) { D[x] = a - b; U[x] = a; M[x] = b; } };
      for (let v = 0; v < 3; v++) { for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const x = j * W + i; if (i) prueba(x, x - 1); if (j) prueba(x, x - W); } for (let j = H - 1; j >= 0; j--) for (let i = W - 1; i >= 0; i--) { const x = j * W + i; if (i < W - 1) prueba(x, x + 1); if (j < H - 1) prueba(x, x + W); } }
      for (let i = 0; i < N; i++) S[i] += D[i];
    }
    const lado = fn => { const m = [0, 0, 0], v = [0, 0, 0]; let n = 0; for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (fn(i, j)) { n++; for (let c = 0; c < 3; c++) { const q = L[(j * W + i) * 3 + c]; m[c] += q; v[c] += q * q; } } return m.map((q, c) => [q / n, Math.max(60, v[c] / n - (q / n) * (q / n))]); };
    const l = [lado((i, j) => j < H * .1), lado(i => i < W * .09), lado(i => i > W * .91)], B = new Float32Array(N); let mS = 0, mB = 0;
    for (let i = 0; i < N; i++) { const d = l.map(q => Math.sqrt(q.reduce((s, [m, v], c) => s + (L[i * 3 + c] - m) ** 2 / v, 0))); B[i] = d[0] + d[1] + d[2] - Math.max(...d); mS = Math.max(mS, S[i]); mB = Math.max(mB, B[i]); }
    let mx = 1e-6; for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const q = j * W + i, x = i / W - .5, y = j / H - .55; S[q] = (S[q] / (mS || 1) + .8 * B[q] / (mB || 1)) * Math.exp(-(x * x * 2.6 + y * y * 2.2)); mx = Math.max(mx, S[q]); }
    for (let i = 0; i < N; i++) S[i] /= mx; return Objeto.suave(Objeto.suave(S, W, H, 1), W, H, 1);
  },
  otsu(S) { const h = new Float64Array(64); for (const v of S) h[Math.min(63, v * 64 | 0)]++; let t = 0, s = 0; h.forEach((n, i) => { t += n; s += n * i; }); let w = 0, a = 0, m = 0, u = 32; for (let i = 0; i < 63; i++) { w += h[i]; a += h[i] * i; if (!w || w === t) continue; const d = a / w - (s - a) / (t - w), v = w * (t - w) * d * d; if (v > m) { m = v; u = i; } } return (u + 1) / 64; },
  // cinco colores típicos con su dispersión
  mezcla(L, id) {
    const K = 5, paso = Math.max(1, id.length / 3000 | 0), x = []; for (let i = 0; i < id.length; i += paso) x.push(id[i]);
    const orden = x.slice().sort((a, b) => L[a * 3] - L[b * 3]), c = []; for (let k = 0; k < K; k++) { const i = orden[Math.floor((k + .5) / K * orden.length)]; c.push([L[i * 3], L[i * 3 + 1], L[i * 3 + 2]]); }
    const de = new Uint8Array(x.length); for (let v = 0; v < 7; v++) { const s = c.map(() => [0, 0, 0, 0]); x.forEach((i, n) => { let m = 1e9; for (let k = 0; k < K; k++) { const d = (L[i * 3] - c[k][0]) ** 2 + (L[i * 3 + 1] - c[k][1]) ** 2 + (L[i * 3 + 2] - c[k][2]) ** 2; if (d < m) { m = d; de[n] = k; } } const q = s[de[n]]; for (let e = 0; e < 3; e++) q[e] += L[i * 3 + e]; q[3]++; }); s.forEach((q, k) => { if (q[3]) c[k] = [q[0] / q[3], q[1] / q[3], q[2] / q[3]]; }); }
    const g = c.map(m => ({ m, v: [0, 0, 0], n: 0 })); x.forEach((i, n) => { const q = g[de[n]]; q.n++; for (let e = 0; e < 3; e++) q.v[e] += (L[i * 3 + e] - q.m[e]) ** 2; });
    return g.filter(q => q.n).map(q => { const v = q.v.map(s => s / q.n + 14); return { m: q.m, v, k: Math.log(q.n / x.length) - .5 * Math.log(v[0] * v[1] * v[2]) }; });
  },
  coste(g, L, i) { let s = 0; for (const q of g) s += Math.exp(q.k - .5 * ((L[i * 3] - q.m[0]) ** 2 / q.v[0] + (L[i * 3 + 1] - q.m[1]) ** 2 / q.v[1] + (L[i * 3 + 2] - q.m[2]) ** 2 / q.v[2])); return Math.min(40, -Math.log(s + 1e-18)); },
  // corte mínimo (Dinic) sobre la rejilla: 1 = objeto
  corte(L, fo, ff, W, H) {
    const N = W * H, dx = [1, -1, W, -W], cap = [0, 1, 2, 3].map(() => new Float32Array(N)), ex = new Float32Array(N); let b = 0, n = 0;
    const d2 = (i, j) => (L[i * 3] - L[j * 3]) ** 2 + (L[i * 3 + 1] - L[j * 3 + 1]) ** 2 + (L[i * 3 + 2] - L[j * 3 + 2]) ** 2;
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const q = j * W + i; if (i < W - 1) { b += d2(q, q + 1); n++; } if (j < H - 1) { b += d2(q, q + W); n++; } } b = n / (2 * b + 1e-6);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const q = j * W + i; if (i < W - 1) cap[0][q] = cap[1][q + 1] = 1 + 13 * Math.exp(-b * d2(q, q + 1)); if (j < H - 1) cap[2][q] = cap[3][q + W] = 1 + 13 * Math.exp(-b * d2(q, q + W)); ex[q] = ff[q] - fo[q]; }
    // ex>0: fuente→nodo, ex<0: nodo→sumidero
    const niv = new Int32Array(N), cola = new Int32Array(N), it = new Uint8Array(N), cam = new Int32Array(N), dir = new Uint8Array(N), op = [1, 0, 3, 2], E = 1e-4;
    for (let vuelta = 0; vuelta < 400; vuelta++) {
      niv.fill(-1); let c = 0, f = 0, llega = false; for (let i = 0; i < N; i++) if (ex[i] > E) { niv[i] = 0; cola[f++] = i; }
      while (c < f) { const q = cola[c++]; if (ex[q] < -E) { llega = true; continue; } for (let k = 0; k < 4; k++) if (cap[k][q] > E) { const r = q + dx[k]; if (niv[r] < 0) { niv[r] = niv[q] + 1; cola[f++] = r; } } }
      if (!llega) break; it.fill(0);
      for (let s = 0; s < N; s++) { if (niv[s] !== 0) continue;
        while (ex[s] > E) { let p = 0, q = s; cam[0] = s; let ok = false;
          for (;;) { if (ex[q] < -E) { ok = true; break; } let av = false; while (it[q] < 4) { const k = it[q]; if (cap[k][q] > E && niv[q + dx[k]] === niv[q] + 1) { dir[p] = k; q += dx[k]; cam[++p] = q; av = true; break; } it[q]++; } if (!av) { if (!p) break; niv[q] = -2; q = cam[--p]; it[q]++; } }
          if (!ok) break; let m = Math.min(ex[s], -ex[q]); for (let e = 0; e < p; e++) m = Math.min(m, cap[dir[e]][cam[e]]); for (let e = 0; e < p; e++) { const k = dir[e], a = cam[e]; cap[k][a] -= m; cap[op[k]][a + dx[k]] += m; } ex[s] -= m; ex[q] += m;
        } }
    }
    const o = new Uint8Array(N); let c = 0, f = 0; for (let i = 0; i < N; i++) if (ex[i] > E) { o[i] = 1; cola[f++] = i; } while (c < f) { const q = cola[c++]; for (let k = 0; k < 4; k++) if (cap[k][q] > E && !o[q + dx[k]]) { o[q + dx[k]] = 1; cola[f++] = q + dx[k]; } } return o;
  },
  grupos(m, val, W, H) { const N = W * H, g = new Int32Array(N).fill(-1), t = [], cola = new Int32Array(N); for (let s = 0; s < N; s++) { if (m[s] !== val || g[s] >= 0) continue; const id = t.length; let c = 0, f = 0, b = false; cola[f++] = s; g[s] = id; while (c < f) { const q = cola[c++], i = q % W; if (!i || i === W - 1 || q < W || q >= N - W) b = true; for (const [r, ok] of [[q + 1, i < W - 1], [q - 1, i > 0], [q + W, q < N - W], [q - W, q >= W]]) if (ok && m[r] === val && g[r] < 0) { g[r] = id; cola[f++] = r; } } t.push({ n: f, b }); } return { g, t }; },
  limpia(m, W, H, marca) {
    const N = W * H, a = Objeto.grupos(m, 1, W, H), mx = Math.max(0, ...a.t.map(q => q.n)), con = new Set(); if (marca) for (let i = 0; i < N; i++) if (marca[i] === 1 && a.g[i] >= 0) con.add(a.g[i]);
    for (let i = 0; i < N; i++) if (a.g[i] >= 0 && !(con.size ? con.has(a.g[i]) : a.t[a.g[i]].n >= mx * .2)) m[i] = 0;
    const h = Objeto.grupos(m, 0, W, H); for (let i = 0; i < N; i++) if (h.g[i] >= 0 && !h.t[h.g[i]].b && h.t[h.g[i]].n < N * .006 && !(marca && marca[i] === 2)) m[i] = 1; return m;
  },
  lejos(m, val, W, H) { const N = W * H, d = new Float32Array(N).fill(1e6), p = (a, b, c) => { if (d[b] + c < d[a]) d[a] = d[b] + c; }; for (let i = 0; i < N; i++) if (m[i] === val) d[i] = 0; for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const q = j * W + i; if (i) p(q, q - 1, 1); if (j) { p(q, q - W, 1); if (i) p(q, q - W - 1, 1.41); if (i < W - 1) p(q, q - W + 1, 1.41); } } for (let j = H - 1; j >= 0; j--) for (let i = W - 1; i >= 0; i--) { const q = j * W + i; if (i < W - 1) p(q, q + 1, 1); if (j < H - 1) { p(q, q + W, 1); if (i) p(q, q + W - 1, 1.41); if (i < W - 1) p(q, q + W + 1, 1.41); } } return d; },
  // rellena un hueco con lo que lo rodea (k canales)
  rellena(v, hueco, W, H, k) {
    const N = W * H, o = Float32Array.from(v), lleno = Uint8Array.from(hueco, h => h ? 0 : 1); let ola = []; for (let i = 0; i < N; i++) if (!lleno[i]) ola.push(i);
    const vec = q => { const i = q % W, r = []; if (i) r.push(q - 1); if (i < W - 1) r.push(q + 1); if (q >= W) r.push(q - W); if (q < N - W) r.push(q + W); return r; };
    while (ola.length) { const sig = [], ya = []; for (const q of ola) { const l = vec(q).filter(r => lleno[r]); if (!l.length) { sig.push(q); continue; } for (let c = 0; c < k; c++) { let s = 0; for (const r of l) s += o[r * k + c]; o[q * k + c] = s / l.length; } ya.push(q); } if (!ya.length) break; ya.forEach(q => lleno[q] = 1); ola = sig; }
    const id = []; for (let i = 0; i < N; i++) if (hueco[i]) id.push(i); for (let v = 0; v < 40; v++) for (const q of v % 2 ? id : id.slice().reverse()) { const l = vec(q); for (let c = 0; c < k; c++) { let s = 0; for (const r of l) s += o[r * k + c]; o[q * k + c] = s / l.length; } } return o;
  }
};
