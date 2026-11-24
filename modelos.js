// Lectores de modelos 3D: OBJ, STL, PLY y GLB. Trabajan solo en memoria y con límites,
// porque el archivo puede venir de cualquier parte.
const LIMITES = { bytes: 60e6, triangulos: 600000, vertices: 1200000 };
const Modelos = {
  ext: n => (String(n).toLowerCase().match(/\.([a-z0-9]+)$/) || [])[1] || '',
  async lee(nombre, buf) {
    if (buf.byteLength > LIMITES.bytes) throw Error('El modelo pesa más de 60 MB.');
    const e = Modelos.ext(nombre);
    const p = e === 'obj' ? Modelos.obj(new TextDecoder().decode(buf)) : e === 'stl' ? Modelos.stl(buf) : e === 'ply' ? Modelos.ply(buf) : e === 'glb' ? await Modelos.glb(buf) : null;
    if (!p) throw Error('Ese formato no se puede leer. Usa OBJ, STL, PLY o GLB.');
    return Modelos.normaliza(p);
  },
  // centra, escala a radio 1 y calcula normales y el eje más largo
  normaliza(partes) {
    partes = partes.filter(p => p.pos && p.pos.length >= 9);
    if (!partes.length) throw Error('El modelo no tiene triángulos que dibujar.');
    const mn = [1e30, 1e30, 1e30], mx = [-1e30, -1e30, -1e30]; let tri = 0, ver = 0;
    for (const p of partes) {
      ver += p.pos.length / 3; tri += (p.ind ? p.ind.length : p.pos.length / 3) / 3;
      if (ver > LIMITES.vertices || tri > LIMITES.triangulos) throw Error('El modelo es demasiado detallado (más de 600 000 triángulos). Redúcelo antes de subirlo.');
      if (p.ind) { const n = p.pos.length / 3; for (let i = 0; i < p.ind.length; i++) if (p.ind[i] >= n) throw Error('El modelo está dañado: apunta a vértices que no existen.'); }
      for (let i = 0; i < p.pos.length; i++) { const v = p.pos[i]; if (!Number.isFinite(v)) throw Error('El modelo está dañado: tiene coordenadas no válidas.'); const k = i % 3; if (v < mn[k]) mn[k] = v; if (v > mx[k]) mx[k] = v; }
    }
    const c = mn.map((v, i) => (v + mx[i]) / 2), d = mx.map((v, i) => v - mn[i]), R = Math.max(1e-9, Math.hypot(...d) * .41, d[1] * .52, Math.hypot(d[0], d[2]) * .46);
    for (const p of partes) {
      for (let i = 0; i < p.pos.length; i++) p.pos[i] = (p.pos[i] - c[i % 3]) / R;
      if (!p.nor || p.nor.length !== p.pos.length) p.nor = Modelos.normales(p);
      if (p.uv && p.uv.length / 2 !== p.pos.length / 3) p.uv = null;
      if (p.col && p.col.length !== p.pos.length) p.col = null;
    }
    const m = d.map(v => v / Math.max(...d));
    return { partes, medidas: m, eje: m[0] >= m[2] ? [1, 0, 0] : [0, 0, 1], triangulos: Math.round(tri) };
  },
  normales(p) {
    const n = new Float32Array(p.pos.length), a = p.pos, N = p.ind ? p.ind.length : a.length / 3, at = i => (p.ind ? p.ind[i] : i) * 3;
    for (let i = 0; i + 2 < N; i += 3) {
      const A = at(i), B = at(i + 1), C = at(i + 2), x1 = a[B] - a[A], y1 = a[B + 1] - a[A + 1], z1 = a[B + 2] - a[A + 2], x2 = a[C] - a[A], y2 = a[C + 1] - a[A + 1], z2 = a[C + 2] - a[A + 2], x = y1 * z2 - z1 * y2, y = z1 * x2 - x1 * z2, z = x1 * y2 - y1 * x2;
      for (const k of [A, B, C]) { n[k] += x; n[k + 1] += y; n[k + 2] += z; }
    }
    for (let i = 0; i < n.length; i += 3) { const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1; n[i] /= l; n[i + 1] /= l; n[i + 2] /= l; }
    return n;
  },
  obj(t) {
    const v = [], vt = [], vn = [], vc = [], pos = [], uv = [], nor = [], col = []; let hayUv = true, hayN = true, hayC = false;
    for (const linea of t.split('\n')) {
      const s = linea.trim(); if (!s || s[0] === '#') continue; const p = s.split(/\s+/), k = p[0];
      if (k === 'v') { v.push(+p[1], +p[2], +p[3]); if (p.length >= 7) { vc.push(+p[4], +p[5], +p[6]); hayC = true; } else vc.push(.8, .8, .8); }
      else if (k === 'vt') vt.push(+p[1], 1 - +p[2]); else if (k === 'vn') vn.push(+p[1], +p[2], +p[3]);
      else if (k === 'f') {
        const f = p.slice(1).map(x => x.split('/').map(y => y === '' || y === undefined ? 0 : parseInt(y, 10)));
        const ix = (i, n) => i > 0 ? i - 1 : n + i;
        for (let i = 1; i + 1 < f.length; i++) for (const q of [f[0], f[i], f[i + 1]]) {
          const a = ix(q[0], v.length / 3); if (!(a >= 0 && a * 3 + 2 < v.length)) throw Error('El OBJ está dañado.'); pos.push(v[a * 3], v[a * 3 + 1], v[a * 3 + 2]); col.push(vc[a * 3], vc[a * 3 + 1], vc[a * 3 + 2]);
          const b = q[1] ? ix(q[1], vt.length / 2) : -1; if (b >= 0 && b * 2 + 1 < vt.length) uv.push(vt[b * 2], vt[b * 2 + 1]); else { hayUv = false; uv.push(0, 0); }
          const c = q[2] ? ix(q[2], vn.length / 3) : -1; if (c >= 0 && c * 3 + 2 < vn.length) nor.push(vn[c * 3], vn[c * 3 + 1], vn[c * 3 + 2]); else { hayN = false; nor.push(0, 0, 0); }
        }
        if (pos.length / 9 > LIMITES.triangulos) throw Error('El modelo es demasiado detallado (más de 600 000 triángulos). Redúcelo antes de subirlo.');
      }
    }
    return [{ pos: new Float32Array(pos), nor: hayN ? new Float32Array(nor) : null, uv: null, col: hayC ? new Float32Array(col) : null, color: [.82, .8, .76] }];
  },
  stl(buf) {
    const dv = new DataView(buf), n = buf.byteLength >= 84 ? dv.getUint32(80, true) : 0;
    if (buf.byteLength >= 84 && 84 + n * 50 === buf.byteLength) {
      if (n > LIMITES.triangulos) throw Error('El modelo es demasiado detallado (más de 600 000 triángulos). Redúcelo antes de subirlo.');
      const pos = new Float32Array(n * 9); for (let i = 0; i < n; i++) for (let k = 0; k < 9; k++) pos[i * 9 + k] = dv.getFloat32(84 + i * 50 + 12 + k * 4, true);
      return [{ pos: Modelos.zArriba(pos), color: [.82, .8, .76] }];
    }
    const pos = [], re = /vertex\s+(\S+)\s+(\S+)\s+(\S+)/g, t = new TextDecoder().decode(buf); let m;
    while ((m = re.exec(t))) { pos.push(+m[1], +m[2], +m[3]); if (pos.length / 9 > LIMITES.triangulos) throw Error('El modelo es demasiado detallado.'); }
    return [{ pos: Modelos.zArriba(new Float32Array(pos.slice(0, pos.length - pos.length % 9))), color: [.82, .8, .76] }];
  },
  // los STL suelen venir con Z hacia arriba
  zArriba(p) { for (let i = 0; i < p.length; i += 3) { const y = p[i + 1]; p[i + 1] = p[i + 2]; p[i + 2] = -y; } return p; },
  ply(buf) {
    const b = new Uint8Array(buf), cab = new TextDecoder('latin1').decode(b.subarray(0, Math.min(b.length, 8192))), f = cab.indexOf('end_header'); if (!cab.startsWith('ply') || f < 0) throw Error('El PLY no es válido.');
    const ini = cab.indexOf('\n', f) + 1, els = []; let fmt = 'ascii';
    for (const l of cab.slice(0, f).split('\n')) { const p = l.trim().split(/\s+/); if (p[0] === 'format') fmt = p[1]; else if (p[0] === 'element') els.push({ n: p[1], c: +p[2], pr: [] }); else if (p[0] === 'property' && els.length) els[els.length - 1].pr.push(p[1] === 'list' ? { l: p[2], t: p[3], n: p[4] } : { t: p[1], n: p[2] }); }
    const V = els.find(e => e.n === 'vertex'), F = els.find(e => e.n === 'face'); if (!V || !F) throw Error('El PLY no tiene caras que dibujar.');
    if (V.c > LIMITES.vertices || F.c > LIMITES.triangulos) throw Error('El modelo es demasiado detallado.');
    const T = { char: [1, 'getInt8'], int8: [1, 'getInt8'], uchar: [1, 'getUint8'], uint8: [1, 'getUint8'], short: [2, 'getInt16'], int16: [2, 'getInt16'], ushort: [2, 'getUint16'], uint16: [2, 'getUint16'], int: [4, 'getInt32'], int32: [4, 'getInt32'], uint: [4, 'getUint32'], uint32: [4, 'getUint32'], float: [4, 'getFloat32'], float32: [4, 'getFloat32'], double: [8, 'getFloat64'], float64: [8, 'getFloat64'] };
    const dv = new DataView(buf), le = fmt === 'binary_little_endian'; let o = ini, tk = null, ti = 0; if (fmt === 'ascii') tk = new TextDecoder().decode(b.subarray(ini)).split(/\s+/);
    const num = t => { if (tk) return +tk[ti++]; const k = T[t]; if (!k) throw Error('El PLY usa un tipo desconocido.'); const v = dv[k[1]](o, le); o += k[0]; return v; };
    const pos = new Float32Array(V.c * 3), col = new Float32Array(V.c * 3).fill(.8), ind = []; let hayC = false;
    for (const el of els) for (let i = 0; i < el.c; i++) for (const p of el.pr) {
      if (p.l) { const n = num(p.l); if (n > 64) throw Error('El PLY está dañado.'); const a = []; for (let k = 0; k < n; k++) a.push(num(p.t)); if (el === F && /vert/.test(p.n)) for (let k = 1; k + 1 < n; k++) ind.push(a[0], a[k], a[k + 1]); }
      else { const v = num(p.t); if (el === V) { const k = 'xyz'.indexOf(p.n); if (k >= 0 && p.n.length === 1) pos[i * 3 + k] = v; const c = ['red', 'green', 'blue'].indexOf(p.n); if (c >= 0) { hayC = true; col[i * 3 + c] = /char|int8/.test(p.t) ? v / 255 : v; } } }
    }
    return [{ pos, ind: new Uint32Array(ind), col: hayC ? col : null, color: hayC ? [1, 1, 1] : [.82, .8, .76] }];
  },
  async glb(buf) {
    const dv = new DataView(buf); if (buf.byteLength < 20 || dv.getUint32(0, true) !== 0x46546C67 || dv.getUint32(4, true) !== 2) throw Error('El GLB no es válido o no es de la versión 2.');
    let o = 12, js = null, bin = null; while (o + 8 <= buf.byteLength) { const n = dv.getUint32(o, true), t = dv.getUint32(o + 4, true); if (o + 8 + n > buf.byteLength) throw Error('El GLB está incompleto.'); if (t === 0x4E4F534A) js = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, o + 8, n))); else if (t === 0x004E4942 && !bin) bin = { o: o + 8, n }; o += 8 + n; }
    if (!js || !bin) throw Error('El GLB no trae los datos del modelo dentro.');
    const raras = (js.extensionsRequired || []).filter(x => /draco|meshopt|basisu/i.test(x)); if (raras.length) throw Error('El GLB está comprimido (' + raras.join(', ') + '). Expórtalo sin compresión.');
    const vista = i => { const v = js.bufferViews && js.bufferViews[i]; if (!v || (v.buffer || 0) !== 0) throw Error('El GLB usa archivos externos.'); const of = v.byteOffset || 0; if (of + v.byteLength > bin.n) throw Error('El GLB está dañado.'); return { o: bin.o + of, n: v.byteLength, paso: v.byteStride || 0 }; };
    const C = { 5120: [1, 'getInt8', 127], 5121: [1, 'getUint8', 255], 5122: [2, 'getInt16', 32767], 5123: [2, 'getUint16', 65535], 5125: [4, 'getUint32', 1], 5126: [4, 'getFloat32', 1] }, K = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
    const acc = (i, entero) => { const a = js.accessors && js.accessors[i]; if (!a || !C[a.componentType] || !K[a.type] || a.count > LIMITES.vertices * 3) throw Error('El GLB está dañado.'); const k = K[a.type], [tb, fn, mx] = C[a.componentType], out = entero ? new Uint32Array(a.count * k) : new Float32Array(a.count * k); if (a.bufferView === undefined) return { d: out, k };
      const v = vista(a.bufferView), paso = v.paso || tb * k, ini = v.o + (a.byteOffset || 0); if (a.count && ini + (a.count - 1) * paso + tb * k > v.o + v.n) throw Error('El GLB está dañado.'); const nr = a.normalized && !entero ? 1 / mx : 1; for (let j = 0; j < a.count; j++) for (let c = 0; c < k; c++) out[j * k + c] = dv[fn](ini + j * paso + c * tb, true) * nr; return { d: out, k }; };
    const imgs = {}; const imagen = async i => { if (imgs[i] !== undefined) return imgs[i]; imgs[i] = null; const im = js.images && js.images[i]; if (im && im.bufferView !== undefined) { const v = vista(im.bufferView); try { imgs[i] = await Modelos.achica(new Blob([new Uint8Array(buf, v.o, v.n)], { type: /^image\/(png|jpeg|webp)$/.test(im.mimeType) ? im.mimeType : 'image/png' }), 1024); } catch (e) { imgs[i] = null; } } return imgs[i]; };
    const mul = (a, b) => { const r = new Float64Array(16); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) r[j * 4 + i] += a[k * 4 + i] * b[j * 4 + k]; return r; }, ID = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    const local = n => { if (Array.isArray(n.matrix) && n.matrix.length === 16) return n.matrix; const t = n.translation || [0, 0, 0], q = n.rotation || [0, 0, 0, 1], s = n.scale || [1, 1, 1], [x, y, z, w] = q; return [(1 - 2 * (y * y + z * z)) * s[0], 2 * (x * y + z * w) * s[0], 2 * (x * z - y * w) * s[0], 0, 2 * (x * y - z * w) * s[1], (1 - 2 * (x * x + z * z)) * s[1], 2 * (y * z + x * w) * s[1], 0, 2 * (x * z + y * w) * s[2], 2 * (y * z - x * w) * s[2], (1 - 2 * (x * x + y * y)) * s[2], 0, t[0], t[1], t[2], 1]; };
    // posición de cada nodo; los huesos la necesitan para colocar la piel en su pose
    const mundo = [], padre = []; (js.nodes || []).forEach((n, i) => (n.children || []).forEach(h => padre[h] = i));
    const W_ = (i, hondo = 0) => mundo[i] || (mundo[i] = !js.nodes[i] || hondo > 128 ? ID : padre[i] === undefined ? mul(ID, local(js.nodes[i])) : mul(W_(padre[i], hondo + 1), local(js.nodes[i])));
    const huesos = s => { const k = js.skins && js.skins[s]; if (!k || !Array.isArray(k.joints)) return null; const ib = k.inverseBindMatrices !== undefined ? acc(k.inverseBindMatrices).d : null; return k.joints.map((j, i) => mul(W_(j), ib ? ib.subarray(i * 16, i * 16 + 16) : ID)); };
    const partes = [], visto = new Set(); Modelos.nombres = []; Modelos.piel = false;
    const anda = async (i, M, hondo) => {
      const n = js.nodes && js.nodes[i]; if (!n || hondo > 64 || visto.has(i)) return; visto.add(i); const W = mul(M, local(n)); if (n.name) Modelos.nombres.push(String(n.name).slice(0, 60));
      if (n.mesh !== undefined && js.meshes[n.mesh]) for (const p of js.meshes[n.mesh].primitives || []) {
        if (p.mode !== undefined && p.mode !== 4 || !p.attributes || p.attributes.POSITION === undefined) continue;
        const P = acc(p.attributes.POSITION).d, N = p.attributes.NORMAL !== undefined ? acc(p.attributes.NORMAL).d : null, pos = new Float32Array(P.length), nor = N ? new Float32Array(N.length) : null, at = p.attributes, H = n.skin !== undefined && at.JOINTS_0 !== undefined && at.WEIGHTS_0 !== undefined ? huesos(n.skin) : null, J = H && (Modelos.piel = true, acc(at.JOINTS_0, true).d), Q = H && acc(at.WEIGHTS_0).d, mix = new Float64Array(16); let sk = n.skin !== undefined && !H ? ID : W;
        for (let j = 0; j < P.length; j += 3) { if (H) { mix.fill(0); const v = j / 3 * 4; let sum = 0; for (let e = 0; e < 4; e++) { const w = Q[v + e], B = H[J[v + e]]; if (w > 0 && B) { sum += w; for (let c = 0; c < 16; c++) mix[c] += B[c] * w; } } sk = sum > 0 ? mix : W; if (sum > 0) for (let c = 0; c < 16; c++) mix[c] /= sum; } const [x, y, z] = [P[j], P[j + 1], P[j + 2]]; for (let c = 0; c < 3; c++) pos[j + c] = sk[c] * x + sk[4 + c] * y + sk[8 + c] * z + sk[12 + c]; if (nor) { const [a, b, d] = [N[j], N[j + 1], N[j + 2]], q = [0, 1, 2].map(c => sk[c] * a + sk[4 + c] * b + sk[8 + c] * d), l = Math.hypot(...q) || 1; for (let c = 0; c < 3; c++) nor[j + c] = q[c] / l; } }
        const uv = p.attributes.TEXCOORD_0 !== undefined ? acc(p.attributes.TEXCOORD_0).d : null; let col = null; if (p.attributes.COLOR_0 !== undefined) { const c = acc(p.attributes.COLOR_0); col = new Float32Array(c.d.length / c.k * 3); for (let j = 0; j < col.length / 3; j++) for (let e = 0; e < 3; e++) col[j * 3 + e] = c.d[j * c.k + e]; }
        const ind = p.indices !== undefined ? acc(p.indices, true).d : null, m = js.materials && js.materials[p.material] || {}, pb = m.pbrMetallicRoughness || {}, bc = pb.baseColorFactor || [1, 1, 1, 1]; let textura = null; if (uv && pb.baseColorTexture && js.textures && js.textures[pb.baseColorTexture.index]) textura = await imagen(js.textures[pb.baseColorTexture.index].source);
        partes.push({ pos, nor, uv: textura ? uv : null, col, ind, textura, color: bc.slice(0, 3).map(v => Math.pow(Math.max(0, Math.min(1, +v || 0)), .4545)) });
      }
      for (const h of n.children || []) await anda(h, W, hondo + 1);
    };
    const esc = js.scenes && js.scenes[js.scene || 0]; for (const i of esc && esc.nodes || Object.keys(js.nodes || {}).map(Number)) await anda(i, ID, 0);
    return partes;
  },
  // decodifica una imagen y la reduce; de paso se pierden los metadatos (ubicación, cámara…)
  async achica(blob, lado) {
    const url = URL.createObjectURL(blob);
    try {
      const im = new Image(); im.src = url; await im.decode(); let w = im.naturalWidth || 512, h = im.naturalHeight || 512; if (w * h > 120e6) throw Error('La imagen es demasiado grande.'); const k = Math.min(1, lado / Math.max(w, h)); w = Math.max(2, Math.round(w * k)); h = Math.max(2, Math.round(h * k));
      const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true }); x.imageSmoothingQuality = 'high'; x.drawImage(im, 0, 0, w, h); return c;
    } finally { URL.revokeObjectURL(url); }
  }
};
Modelos.nombres = [];
