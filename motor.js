// Motor ASCII del generador. También viaja dentro de los archivos .html que se descargan,
// así que no depende de nada más. Todo ocurre en el navegador.
class MotorAscii {
  static RAMPAS = { clasica: ' .:-=+*oO#%@', bloques: ' ░▒▓█', puntos: ' ·•●', binaria: ' 01', lineas: ' .-=≡#', letras: ' ilcjtfxzXYUJCLQ0OZmwqpdbkhao*#MW&8%B@' };
  static COLORES = { original: 0, ambar: 1, abismo: 2, fosforo: 3, papel: 4, brasa: 5, neon: 6, propio: 7 };
  // animaciones: las de forma mueven la figura; las de ambiente llueven sobre el dibujo
  static ANIM = ['respira', 'viento', 'nado', 'aleteo', 'flota', 'vibra', 'latido', 'giro', 'olas', 'camina', 'lluvia', 'nieve', 'chispas', 'estrellas', 'niebla', 'codigo', 'escaneo'];
  static BASE = { columnas: 150, rampa: 'clasica', propia: ' .oO@', color: 'original', tinte: '#ffb14a', fondo: '#01040c', luz: 1, atras: 1, nitidez: .5, brillo: 0, contraste: 0, saturacion: 0, invertir: false, resplandor: 0.5, relieve: 0.35, sinFondo: false, mueve: 'objeto', zoom: 1, giroX: 0, giroY: 0, anim: [], fuerza: 1, velocidad: 1, contexto: true };
  static ajustes(x) {
    const b = MotorAscii.BASE, s = {}, n = (k, a, z) => { const v = Number(x && x[k]); s[k] = Number.isFinite(v) ? Math.max(a, Math.min(z, v)) : b[k]; };
    n('columnas', 40, 260); n('luz', .3, 4); n('atras', 0, 1); n('nitidez', 0, 1); n('brillo', -1, 1); n('contraste', -1, 1); n('saturacion', -1, 1); n('resplandor', 0, 1.5); n('relieve', 0, 1); n('zoom', .3, 3); n('giroX', -1.5, 1.5); n('giroY', -50, 50); n('fuerza', 0, 2); n('velocidad', 0, 3);
    const o = (k, l) => { s[k] = x && Object.prototype.hasOwnProperty.call(l, x[k]) ? x[k] : b[k]; };
    o('rampa', { ...MotorAscii.RAMPAS, propia: 1 }); o('color', MotorAscii.COLORES); o('mueve', { objeto: 1, todo: 1 });
    for (const k of ['tinte', 'fondo']) s[k] = x && /^#[0-9a-f]{6}$/i.test(x[k]) ? x[k] : b[k];
    for (const k of ['invertir', 'sinFondo', 'contexto']) s[k] = x && typeof x[k] === 'boolean' ? x[k] : b[k];
    s.propia = x && typeof x.propia === 'string' && x.propia.length > 1 ? [...x.propia].slice(0, 64).join('') : b.propia;
    s.anim = x && Array.isArray(x.anim) ? MotorAscii.ANIM.filter(a => x.anim.includes(a)) : [];
    return s;
  }
  constructor(lienzo, opc = {}) {
    this.lienzo = lienzo; this.S = MotorAscii.ajustes({}); this.partes = []; this.tipo = null; this.eje = [1, 0, 0]; this.prop = 1; this.toque = -9; this.desfase = 0;
    const gl = this.gl = lienzo.getContext('webgl2', { antialias: false, alpha: false, preserveDrawingBuffer: !!opc.guardar });
    if (!gl) throw Error('Este navegador no tiene WebGL2 activado.');
    this._arma();
  }
  _arma() {
    const gl = this.gl; this.partes = []; this.clave = '';
    gl.bindVertexArray(gl.createVertexArray());
    this.pFig = this._prog(MotorAscii.V_FIG, MotorAscii.F_FIG); this.pMez = this._prog(MotorAscii.V_PAN, MotorAscii.F_MEZ); this.pFin = this._prog(MotorAscii.V_PAN, MotorAscii.F_FIN);
    this.blanca = this._tex(null, 1, 1, new Uint8Array([255, 255, 255, 255])); this.negra = this._tex(null, 1, 1, new Uint8Array([0, 0, 0, 0])); this.region = this.negra;
    this.letras = gl.createTexture(); this.capas = [0, 1].map(() => ({ tex: gl.createTexture(), fb: gl.createFramebuffer() })); this.prof = gl.createRenderbuffer();
    this.cols = 0; this.mide();
  }
  _prog(v, f) {
    const gl = this.gl, p = gl.createProgram();
    for (const [t, src] of [[gl.VERTEX_SHADER, v], [gl.FRAGMENT_SHADER, f]]) { const s = gl.createShader(t); gl.shaderSource(s, '#version 300 es\nprecision highp float;\n' + src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(s)); gl.attachShader(p, s); }
    ['pos', 'nor', 'uv', 'col'].forEach((n, i) => gl.bindAttribLocation(p, i, n));
    gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(p));
    const u = {}; for (let i = 0; i < gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i++) { const n = gl.getActiveUniform(p, i).name.replace('[0]', ''); u[n] = gl.getUniformLocation(p, n); }
    return { p, u };
  }
  _tex(img, w, h, datos, repite) {
    const gl = this.gl, t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    if (img) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img); else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, datos);
    for (const k of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D, k, gl.LINEAR);
    for (const k of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D, k, repite ? gl.REPEAT : gl.CLAMP_TO_EDGE);
    return t;
  }
  _vacia() {
    const gl = this.gl;
    for (const p of this.partes) { gl.deleteVertexArray(p.vao); p.bufs.forEach(b => gl.deleteBuffer(b)); if (p.tex !== this.blanca) gl.deleteTexture(p.tex); if (p.region) gl.deleteTexture(p.region); }
    this.partes = [];
  }
  _parte(m) {
    const gl = this.gl, vao = gl.createVertexArray(), bufs = []; gl.bindVertexArray(vao);
    const pon = (i, d, n) => { if (!d) { gl.disableVertexAttribArray(i); gl.vertexAttrib3f(i, 1, 1, 1); return; } const b = gl.createBuffer(); bufs.push(b); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, d, gl.STATIC_DRAW); gl.enableVertexAttribArray(i); gl.vertexAttribPointer(i, n, gl.FLOAT, false, 0, 0); };
    pon(0, m.pos, 3); pon(1, m.nor, 3); pon(2, m.uv, 2); pon(3, m.col, 3);
    let ib = null; if (m.ind) { ib = gl.createBuffer(); bufs.push(ib); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, m.ind, gl.STATIC_DRAW); }
    const tex = m.textura ? this._tex(m.textura, 0, 0, null, true) : this.blanca;
    this.partes.push({ vao, bufs, n: m.ind ? m.ind.length : m.pos.length / 3, ind: !!m.ind, tex, color: m.color || [1, 1, 1], hayCol: !!m.col, hayUv: !!m.uv });
  }
  // imagen: {an, al, prop, capas: [{lienzo, region: bytes RGBA (agua, fuego, planta, cielo), alto, tipo: 0 todo, 1 fondo, 2 objeto, caja, pegado, eje}], marco}
  ponImagen(im) {
    this._vacia(); this.tipo = 'imagen'; const E = im.encuadre; this.prop = E ? E[2] / E[3] : im.prop; const pr = im.prop; this.marco = !!im.marco; this.eje = [1, 0, 0];
    const nx = im.an, ny = im.al, sx = pr > 1 ? 1 : pr, sy = pr > 1 ? 1 / pr : 1;
    for (const c of im.capas) {
      const pos = new Float32Array(nx * ny * 3), uv = new Float32Array(nx * ny * 2), ind = new Uint32Array((nx - 1) * (ny - 1) * 6); let k = 0;
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const q = j * nx + i; pos.set([(i / (nx - 1) * 2 - 1) * sx, (1 - j / (ny - 1) * 2) * sy, c.alto[q] - .5], q * 3); uv.set([i / (nx - 1), j / (ny - 1)], q * 2); }
      // figura recortada: se encuadra para que llene la vista
      if (E) for (let q = 0, s = Math.max(E[2], E[3]); q < nx * ny; q++) { pos[q * 3] = (pos[q * 3] - E[0]) / s; pos[q * 3 + 1] = (pos[q * 3 + 1] - E[1]) / s; }
      for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) { const q = j * nx + i; ind.set([q, q + nx, q + 1, q + 1, q + nx, q + nx + 1], k); k += 6; }
      this._parte({ pos, uv, ind, textura: c.lienzo }); const p = this.partes[this.partes.length - 1]; Object.assign(p, { region: this._tex(null, nx, ny, c.region), capa: c.tipo, caja: c.caja || [0, 0, 1, 1], pegado: c.pegado || [0, 0, 0, 0], eje: c.eje });
    }
  }
  ponModelo(mo) { this._vacia(); this.tipo = 'modelo'; this.marco = false; this.prop = 1; this.eje = mo.eje || [1, 0, 0]; mo.partes.forEach(p => this._parte(p)); }
  mide() {
    const gl = this.gl, c = this.lienzo, d = Math.min(devicePixelRatio || 1, this.techo || 2), W = Math.max(2, Math.round(c.clientWidth * d)), H = Math.max(2, Math.round(c.clientHeight * d));
    const cols = Math.round(this.S.columnas), cw = W / cols, ch = cw * 1.75, filas = Math.max(2, Math.round(H / ch));
    const clave = [W, H, cols, filas, this.S.rampa, this.S.propia].join('|'); if (clave === this.clave) return; this.clave = clave;
    c.width = W; c.height = H; this.cols = cols; this.filas = filas; this.cw = W / cols; this.ch = H / filas;
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.prof); gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, cols * 2, filas * 2);
    this.capas.forEach((k, i) => {
      const e = i ? 1 : 2; gl.bindTexture(gl.TEXTURE_2D, k.tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, cols * e, filas * e, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      for (const q of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D, q, gl.LINEAR); for (const q of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D, q, gl.CLAMP_TO_EDGE);
      gl.bindFramebuffer(gl.FRAMEBUFFER, k.fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, k.tex, 0); if (!i) gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.prof);
    });
    const r = this.letrasDe(), n = r.length, a = document.createElement('canvas'), w = 32, h = 56; a.width = w * n; a.height = h; const x = a.getContext('2d'); x.fillRect(0, 0, a.width, h); x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = 'bold 46px Consolas, "DejaVu Sans Mono", monospace';
    r.forEach((l, i) => { x.save(); x.beginPath(); x.rect(i * w, 0, w, h); x.clip(); x.fillText(l, (i + .5) * w, h * .53); x.restore(); });
    gl.bindTexture(gl.TEXTURE_2D, this.letras); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, a); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    for (const q of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D, q, gl.LINEAR); for (const q of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D, q, gl.CLAMP_TO_EDGE);
  }
  // las letras van de menos a más tinta; se mide cuánta tiene cada una para que el brillo suba sin saltos
  letrasDe() {
    const k = this.S.rampa + '|' + this.S.propia; if (this.rk === k) return this.r; const l = [...(this.S.rampa === 'propia' ? this.S.propia : MotorAscii.RAMPAS[this.S.rampa])], c = document.createElement('canvas'); c.width = 32; c.height = 56; const x = c.getContext('2d', { willReadFrequently: true }); x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = 'bold 46px Consolas, "DejaVu Sans Mono", monospace';
    let m = l.map(q => { x.fillStyle = '#000'; x.fillRect(0, 0, 32, 56); x.fillStyle = '#fff'; x.fillText(q, 16, 30); const d = x.getImageData(0, 0, 32, 56).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += d[i]; return { q, t: s / (d.length / 4 * 255) }; });
    if (this.S.rampa !== 'propia') m.sort((a, b) => a.t - b.t); this.rk = k; this.tinta = new Float32Array(64); m.forEach((v, i) => this.tinta[i] = Math.max(.02, v.t)); return this.r = m.map(v => v.q);
  }
  toca(ms) { if ((ms / 1000 - this.toque) > 2.2) this.toque = ms / 1000; }
  cuadro(ms) {
    const gl = this.gl, S = this.S; if (gl.isContextLost()) return; this.mide();
    const dt = Math.max(0, Math.min(100, ms - (this.um === undefined ? ms : this.um))); this.um = ms; if (this.rel === undefined) this.rel = ms / 1000; if (!this.pausa) this.rel += dt / 1000 * S.velocidad;
    const t = this.rel + this.desfase, A = MotorAscii.ANIM.map(a => S.anim.includes(a) ? S.fuerza : 0), hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
    const tq = ms / 1000 - this.toque, acc = tq > 0 && tq < 2 ? Math.min(1, tq * 5) * Math.min(1, (2 - tq) * 2) : 0;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.capas[0].fb); gl.viewport(0, 0, this.cols * 2, this.filas * 2); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); gl.enable(gl.DEPTH_TEST);
    const p = this.pFig; gl.useProgram(p.p); const u = p.u, asp = this.lienzo.width / this.lienzo.height, im = this.tipo === 'imagen';
    gl.uniform1fv(u.A, A); gl.uniform1f(u.t, t); gl.uniform1f(u.asp, asp); gl.uniform1f(u.acc, acc); gl.uniform1f(u.tq, Math.max(0, Math.min(9, tq))); gl.uniform1f(u.zoom, S.zoom); gl.uniform2f(u.giro, S.giroX, S.giroY); gl.uniform3fv(u.eje, this.eje); gl.uniform1f(u.imagen, im ? 1 : 0); gl.uniform1f(u.relieve, S.relieve); gl.uniform1f(u.contexto, S.contexto ? S.fuerza : 0); gl.uniform1f(u.prop, this.prop);
    gl.uniform1f(u.atras, S.atras); gl.uniform1f(u.nitidez, S.nitidez); gl.uniform1i(u.foto, 0); gl.uniform1i(u.region, 1);
    for (const q of this.partes) { if (this.soloObjeto && q.capa === 1) continue; if (q.capa === 2) gl.clear(gl.DEPTH_BUFFER_BIT); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, q.region || this.negra); gl.activeTexture(gl.TEXTURE0); gl.uniform1f(u.capa, q.capa || 0); gl.uniform4fv(u.caja, q.caja || [0, 0, 1, 1]); gl.uniform4fv(u.pegado, q.pegado || [0, 0, 0, 0]); gl.uniform3fv(u.eje, q.eje || this.eje); gl.bindVertexArray(q.vao); gl.bindTexture(gl.TEXTURE_2D, q.tex); gl.uniform3fv(u.color, q.color); gl.uniform1f(u.hayCol, q.hayCol ? 1 : 0); gl.uniform1f(u.hayUv, q.hayUv ? 1 : 0); if (q.ind) gl.drawElements(gl.TRIANGLES, q.n, gl.UNSIGNED_INT, 0); else gl.drawArrays(gl.TRIANGLES, 0, q.n); }
    gl.bindVertexArray(null); gl.disable(gl.DEPTH_TEST);
    const capa = (pr, fb, w, h) => { gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.viewport(0, 0, w, h); gl.useProgram(pr.p); return pr.u; };
    let m = capa(this.pMez, this.capas[1].fb, this.cols, this.filas); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.capas[0].tex);
    gl.uniform1i(m.img, 0); gl.uniform2f(m.res, this.cols, this.filas); gl.uniform1f(m.t, t); gl.uniform1f(m.acc, acc); gl.uniform1f(m.tq, Math.max(0, Math.min(9, tq))); gl.uniform1fv(m.A, A); gl.uniform1f(m.luz, S.luz); gl.uniform1f(m.marco, this.marco && !this.soloObjeto ? 1 : 0); gl.uniform4f(m.aj, S.brillo, S.contraste, S.saturacion, S.invertir ? 1 : 0); gl.uniform1i(m.modo, MotorAscii.COLORES[S.color]); gl.uniform3fv(m.tinte, hex(S.tinte)); gl.drawArrays(gl.TRIANGLES, 0, 3);
    m = capa(this.pFin, null, this.lienzo.width, this.lienzo.height); gl.bindTexture(gl.TEXTURE_2D, this.capas[1].tex); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.letras); gl.activeTexture(gl.TEXTURE0);
    gl.uniform1f(m.solo, -(this.solo || 0)); gl.uniform1i(m.img, 0); gl.uniform1i(m.letras, 1); gl.uniform2f(m.celda, this.cw, this.ch); gl.uniform2f(m.rejilla, this.cols, this.filas); gl.uniform1f(m.n, this.letrasDe().length); gl.uniform1fv(m.tinta, this.tinta); gl.uniform1f(m.res, S.resplandor); gl.uniform3fv(m.fondo, hex(S.fondo)); gl.uniform1f(m.t, t); gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  // cuánta luz le falta a la figura para que se lea bien
  luzIdeal() {
    const gl = this.gl, w = this.cols * 2, h = this.filas * 2, d = new Uint8Array(w * h * 4), v = [], at = this.S.atras; this.S.atras = 1; this.cuadro(performance.now()); this.S.atras = at; gl.bindFramebuffer(gl.FRAMEBUFFER, this.capas[0].fb); gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, d); gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 128) { const q = Math.max(d[i], d[i + 1], d[i + 2]); if (q > 6) v.push(q); } if (!v.length) return 1; v.sort((a, b) => a - b);
    const q = .85 / Math.max(.02, v[Math.floor(v.length * .85)] / 255); return Math.round(Math.max(1, Math.min(this.tipo === 'modelo' ? 3 : 1.8, q)) * 20) / 20;
  }
  // parte de la rejilla que ocupa el dibujo: [x0, y0, x1, y1] en celdas, con y hacia arriba
  caja() {
    const gl = this.gl, w = this.cols, h = this.filas, d = new Uint8Array(w * h * 4); gl.bindFramebuffer(gl.FRAMEBUFFER, this.capas[1].fb); gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, d); gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    let a = w, b = h, c = -1, e = -1; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 100) { a = Math.min(a, x); c = Math.max(c, x); b = Math.min(b, y); e = Math.max(e, y); } return c < 0 ? [0, 0, w, h] : [a, b, c + 1, e + 1];
  }
  // el dibujo recortado en un lienzo transparente, con letras nítidas aunque la pantalla sea pequeña
  recorte(solo) {
    const gl = this.gl, [a, b, c, e] = this.caja(), mx = Math.min(4096, gl.getParameter(gl.MAX_TEXTURE_SIZE)), cw = Math.max(6, Math.floor(Math.min(Math.max(this.cw, 1900 / this.cols), mx / this.cols, mx / this.filas / 1.75))), ch = Math.round(cw * this.ch / this.cw), W = cw * this.cols, H = ch * this.filas;
    const t = gl.createTexture(), fb = gl.createFramebuffer(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null); gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    const u = this.pFin.u; gl.viewport(0, 0, W, H); gl.useProgram(this.pFin.p); gl.bindTexture(gl.TEXTURE_2D, this.capas[1].tex); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.letras); gl.activeTexture(gl.TEXTURE0); gl.uniform1f(u.solo, solo); gl.uniform2f(u.celda, cw, ch); gl.drawArrays(gl.TRIANGLES, 0, 3);
    const w = (c - a) * cw, h = (e - b) * ch, d = new Uint8Array(w * h * 4); gl.readPixels(a * cw, b * ch, w, h, gl.RGBA, gl.UNSIGNED_BYTE, d); gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.deleteFramebuffer(fb); gl.deleteTexture(t);
    const l = document.createElement('canvas'); l.width = w; l.height = h; const x = l.getContext('2d'), m = x.createImageData(w, h); for (let y = 0; y < h; y++) m.data.set(d.subarray((h - 1 - y) * w * 4, (h - y) * w * 4), y * w * 4); x.putImageData(m, 0, 0); return l;
  }
  // el cuadro actual como texto
  texto() {
    const gl = this.gl, w = this.cols, h = this.filas, d = new Uint8Array(w * h * 4), r = this.letrasDe(); gl.bindFramebuffer(gl.FRAMEBUFFER, this.capas[1].fb); gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, d); let s = [];
    for (let y = h - 1; y >= 0; y--) { let l = ''; for (let x = 0; x < w; x++) { const i = (y * w + x) * 4, v = Math.max(d[i], d[i + 1], d[i + 2]) / 255; l += r[Math.min(r.length - 1, Math.floor(Math.pow(v, .65) * r.length))]; } s.push(l.replace(/\s+$/, '')); }
    while (s.length && !s[0]) s.shift(); while (s.length && !s[s.length - 1]) s.pop(); const m = Math.min(...s.filter(Boolean).map(l => l.search(/[^ ]/))); if (m > 0 && m < 999) s = s.map(l => l.slice(m));
    return s.join('\n');
  }
}
MotorAscii.V_PAN = `void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.-1.,0,1);}`;
MotorAscii.V_FIG = `
in vec3 pos,nor,col;in vec2 uv;out vec3 vN,vC,vP;out vec2 vU;
uniform float A[17];uniform float capa;uniform vec4 caja,pegado;uniform float t,asp,acc,tq,zoom,imagen,relieve,contexto,prop,hayCol;uniform vec2 giro;uniform vec3 eje,color;uniform sampler2D region;
mat2 g(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
void main(){
 vec3 p=pos,n=nor;vec3 lat=normalize(cross(eje,vec3(0,1,0))+1e-5);vU=uv;vC=mix(vec3(1),col,hayCol)*color;
 vec4 r=imagen>.5?texture(region,uv):vec4(0);
 if(imagen>.5){p.z*=relieve*.9;
  // contexto: la vegetación se mece y el agua ondula
  p.x+=contexto*r.b*.022*sin(t*1.7+pos.y*5.+pos.x*7.);p.y+=contexto*r.r*.014*sin(t*2.+pos.x*13.+pos.y*21.);p.z+=contexto*r.r*.03*sin(t*1.6+pos.x*9.);}
 vec3 p0=p;bool im=imagen>.5;float hh=1.;if(im){p.xy=(p.xy-caja.xy)/caja.z;p.z/=caja.z;hh=caja.w;lat=eje.yxz;}
 if(capa<.5||capa>1.5){
 float alto=p.y/hh*.5+.5;
 float re=A[0]*(im?1.6:1.);p.x*=1.+re*.016*sin(t*1.9)*(im?smoothstep(0.,.5,alto):1.);if(!im)p.z*=1.+re*.022*sin(t*1.9);p.y=(p.y+(im?hh:0.))*(1.+re*.014*sin(t*1.9+.5))-(im?hh:0.); // respira
 p.x+=A[1]*(.05*sin(t*1.6+p.y*1.3)+.025*sin(t*3.1+p.y*3.+p.z*2.))*pow(max(alto,0.),1.6);             // viento
 float e=dot(p,eje);p+=lat*A[2]*(im?.09:.14)*sin(e*3.-t*4.)*(.25+.75*smoothstep(-.6,1.,e));           // nado
 float k=abs(p.x);p.y+=A[3]*(im?.2:.42)*sin(t*5.)*k*k;                                               // aleteo
 p.y+=A[4]*.06*sin(t*1.3);p.x+=A[4]*.025*sin(t*.8);                                                  // flota
 p+=A[5]*.008*vec3(sin(t*43.),sin(t*51.),0.);                                                        // vibra
 p*=1.+A[6]*.07*pow(abs(sin(t*2.6)),9.);                                                             // latido
 p.y+=A[8]*.05*sin(p.x*4.+t*2.1)*cos(p.z*3.+p.y*2.+t*1.4);                                           // olas
 float bajo=smoothstep(.0,-1.,p.y/hh),la=p.x<0.?-1.:1.,pa=A[9]*sin(t*5.);p.z+=.22*pa*la*bajo;p.y+=A[9]*.02*abs(sin(t*5.)); // camina
 if(im){p.x+=.1*pa*smoothstep(-.12,.12,p.x)*bajo-.1*pa*smoothstep(.12,-.12,p.x)*bajo;p.x+=.03*A[9]*cos(t*5.)*alto;}
 else if(A[9]>0.&&k>.32&&p.y>-.1)p.z-=.12*pa*la*(1.-smoothstep(.2,.6,p.y));
 p.y+=acc*.14*abs(sin(tq*5.))*(1.-.4*tq);p*=1.+.05*acc*sin(tq*9.);
 if(capa>1.5&&A[7]>0.)p.xz*=g(-A[7]*.55*sin(t*.9));}
 if(im){p.xy=p.xy*caja.z+caja.xy;p.z*=caja.z;if(capa>1.5){vec2 m=prop>1.?vec2(1.,1./prop):vec2(prop,1.),s=vec2(.3,.45)*caja.z;vec4 d=vec4(p0.x+m.x,m.x-p0.x,p0.y+m.y,m.y-p0.y);
  float w=1.;if(pegado.x>.5)w*=smoothstep(0.,s.x,d.x);if(pegado.y>.5)w*=smoothstep(0.,s.x,d.y);if(pegado.z>.5)w*=smoothstep(0.,s.y,d.z);if(pegado.w>.5)w*=smoothstep(0.,s.y,d.w);p=mix(p0,p,w);p.z+=.05;}
  if(capa>.5&&capa<1.5)p.z-=.1*relieve;}
 float yaw=giro.y+A[7]*t*.6,pit=giro.x;if(imagen>.5)yaw=capa<.5&&A[7]>0.?giro.y+A[7]*.45*sin(t*.8):giro.y;
 p.xz*=g(-yaw);n.xz*=g(-yaw);p.yz*=g(pit);n.yz*=g(pit);
 vN=n;vP=p;float z=3.4-p.z;float s=imagen>.5?min(1.,asp/max(prop,.01)*(prop>1.?prop:1.))*(prop>1.?min(asp,prop)*1.:1.):min(1.,asp);
 if(imagen>.5)s=prop>1.?min(asp,prop):min(1.,asp/prop);
 s*=imagen>.5?1.02:1.04;gl_Position=vec4(p.x*2.95*s*zoom/asp,p.y*2.95*s*zoom,(z-3.4)*.3*z,z);
}`;
MotorAscii.F_FIG = `
in vec3 vN,vC,vP;in vec2 vU;out vec4 o;uniform float A[17],capa,atras,nitidez;uniform sampler2D foto,region;uniform float t,imagen,contexto,hayUv,acc;
float h(vec2 p){return fract(sin(dot(p,vec2(12.98,78.23)))*43758.5);}
void main(){
 if(imagen>.5){
  vec4 r=texture(region,vU);float c=contexto;vec2 u=vU;
  u+=c*r.r*vec2(.007*sin(vU.y*70.+t*2.6),.005*cos(vU.x*46.+t*2.));               // agua
  u.x+=c*r.g*.007*sin(vU.y*46.-t*9.);u.y+=c*r.g*.006*sin(vU.x*60.+t*7.);         // fuego
  u.x+=c*r.a*.005*sin(t*.35+vU.y*4.);                                            // cielo
  vec4 k=texture(foto,u);if(k.a<.45)discard;vec3 q=k.rgb;
  // nitidez: realza el contraste entre celdas vecinas y engrosa las líneas oscuras, que al reducir se pierden
  if(nitidez>0.){vec2 ex=dFdx(vU),ey=dFdy(vU);vec3 med=vec3(0);float lo=dot(q,vec3(.3,.59,.11)),l0=lo;for(int i=0;i<8;i++){float an=float(i)*.785;vec2 dd=cos(an)*ex+sin(an)*ey;vec4 v=texture(foto,u+dd*2.6),w=texture(foto,u+dd*.9);med+=v.a<.45?q:v.rgb;if(w.a>.45)lo=min(lo,dot(w.rgb,vec3(.3,.59,.11)));}
   med/=8.;q*=mix(1.,lo/max(l0,.01),.6*nitidez);float dl=dot(q-med,vec3(.3,.59,.11));q=clamp(q*(1.+clamp(dl*1.1*nitidez/max(dot(q,vec3(.3,.59,.11)),.12),-.5,.6)),0.,1.);}
 float l=dot(q,vec3(.3,.59,.11));
  q*=1.+c*r.g*(.25+.35*sin(t*11.+vU.x*40.)*sin(t*7.+vU.y*30.));
  q+=c*r.r*.35*smoothstep(.55,.9,l)*max(0.,sin(vU.x*90.+t*3.)*sin(vU.y*70.-t*2.));
  q*=1.+c*r.a*.035*sin(vU.x*9.+t*.5+2.*sin(vU.y*7.+t*.3));
  if(A[13]>0.){vec2 z=floor(vU*vec2(170,110));float e=h(z);q+=step(.985,e)*step(.4,r.a)*smoothstep(.4,.15,l)*vec3(.6,.75,1.)*A[13]*(.4+.35*sin(t*2.+e*900.));}
  if(capa>.5&&capa<1.5)q*=atras;
  o=vec4(q*(1.+(capa>.5&&capa<1.5?0.:.3)*acc),1);return;}
 vec3 n=normalize(gl_FrontFacing?vN:-vN);if(length(vN)<.1)n=normalize(cross(dFdx(vP),dFdy(vP)));
 vec4 k=hayUv>.5?texture(foto,vU):vec4(1);if(k.a<.2)discard;vec3 b=k.rgb*vC,L=normalize(vec3(.5,.75,.8));
 float d=pow(.5+.5*dot(n,L),1.9),pli=clamp(length(fwidth(n))*.55,0.,.6),s=pow(max(dot(n,normalize(L+vec3(0,0,1))),0.),30.),f=pow(1.-max(n.z,0.),3.);
 o=vec4(b*(.12+1.02*d)*(1.-pli)*mix(.62,1.08,smoothstep(-.9,.8,vP.z))+.22*s+f*vec3(.08,.14,.18)+.2*acc*b,1);
}`;
MotorAscii.F_MEZ = `
uniform sampler2D img;uniform vec2 res;uniform float t,acc,tq,A[17];uniform vec4 aj;uniform float luz,marco;uniform int modo;uniform vec3 tinte;out vec4 o;
float h(vec2 p){return fract(sin(dot(p,vec2(12.98,78.23)))*43758.5);}
float v(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
void main(){
 vec2 g=floor(gl_FragCoord.xy),u=gl_FragCoord.xy/res,w=u;
 if(A[16]>0.){float b=floor(g.y/3.),e=step(.93,h(vec2(b,floor(t*7.))));w.x+=A[16]*e*.05*(h(vec2(b,floor(t*9.)))-.5);}
 if(acc>0.){vec2 d=u-.5;float l=length(d*vec2(res.x/res.y*.57,1.));w+=d*.05*acc*sin(l*26.-tq*11.)*exp(-l*2.);}
 vec4 s=vec4(0);for(int i=0;i<4;i++)s+=texture(img,w+(vec2(i&1,i>>1)-.5)*.5/res);s*=.25;
 float a=s.a;vec3 c=a>.001?s.rgb/a:vec3(0);
 float l=dot(c,vec3(.3,.59,.11));c=max(mix(vec3(l),c,1.+aj.z),0.);float m=max(c.r,max(c.g,c.b)),m2=m*luz;m2=m2<.75?m2:.75+.25*(1.-exp(-(m2-.75)/.25));m2=clamp((m2-.5)*(1.+aj.y*1.6)+.5+aj.x*.6,0.,1.);c=m>.001?c*m2/m:vec3(m2);c=clamp(c,0.,1.);if(aj.w>.5)c=1.-c;c*=smoothstep(.25,.75,a);l=max(c.r,max(c.g,c.b));
 vec3 q=c;
 if(modo==1)q=mix(vec3(.25,.08,0),vec3(1.,.72,.3),l)*l*1.2;else if(modo==2)q=mix(vec3(0,.12,.25),vec3(.55,1.,.95),l)*l*1.15;else if(modo==3)q=vec3(.15,1.,.35)*l;else if(modo==4)q=vec3(.95,.92,.85)*l;
 else if(modo==5)q=l<.5?mix(vec3(0),vec3(.85,.12,.03),l*2.):mix(vec3(.85,.12,.03),vec3(1.,.85,.35),l*2.-1.);else if(modo==6){float e=.5+.5*sin(u.y*3.+u.x*1.5+t*.35);q=(e<.5?mix(vec3(1.,.24,.78),vec3(.38,.42,1.),e*2.):mix(vec3(.38,.42,1.),vec3(.17,.94,.8),e*2.-1.))*l*1.15;}else if(modo==7)q=tinte*l;
 float hueco=1.-smoothstep(.2,.6,a);vec3 antes=q;
 // ambiente
 if(A[13]>0.&&hueco>.5){float e=h(g);if(e>.985)q+=vec3(.6,.75,1.)*A[13]*(.35+.4*sin(t*2.+e*900.));}
 if(A[10]>0.){float co=g.x+floor(g.y*.15),r=h(vec2(co,3.)),y=mod(g.y+t*(26.+22.*r)+r*90.,34.+30.*r);if(r>.55&&y<2.5)q=mix(q,vec3(.5,.7,.9),.6*min(A[10],1.));}
 if(A[11]>0.)for(int i=0;i<2;i++){float f=float(i);vec2 k=g+vec2(floor(2.*sin(t*.8+g.y*.2+f)),floor(t*(4.+3.*f)));if(h(k+f*31.)>.988)q=mix(q,vec3(.95,.97,1.),.9*min(A[11],1.));}
 if(A[12]>0.){vec2 k=g+vec2(floor(2.*sin(t*2.+g.y*.3)),-floor(t*9.));float e=h(k);if(e>.991)q+=vec3(1.,.5,.15)*A[12]*(1.-.6*u.y)*(.6+.4*sin(t*14.+e*700.));}
 if(A[14]>0.){float n=v(vec2(u.x*4.-t*.12,u.y*5.+t*.03))*.6+v(vec2(u.x*9.+t*.1,u.y*9.))*.4;q=mix(q,vec3(.5,.54,.58),A[14]*.6*smoothstep(.4,.8,n)*smoothstep(.75,.0,u.y));}
 if(A[15]>0.){float r=h(vec2(g.x,7.)),y=fract(u.y+t*(.12+.2*r)+r);float e=pow(1.-y,6.)*step(.35,r);q+=vec3(.1,.9,.35)*A[15]*e*(.25+.55*hueco)*step(.25,h(g+floor(t*6.)));}
 if(A[16]>0.)q*=1.+A[16]*(.35*smoothstep(.03,.0,abs(u.y-fract(1.-t*.22)))-.1*step(.5,fract(g.y*.5)));
 if(marco>.5)q=mix(q,antes,hueco);
 q=clamp(q,0.,1.);o=vec4(q,max(1.-hueco,step(.05,max(q.r,max(q.g,q.b)))));
}`;
MotorAscii.F_FIN = `
uniform sampler2D img,letras;uniform vec2 celda,rejilla;uniform float n,res,t,tinta[64],solo;uniform vec3 fondo;out vec4 o;
float L(float i,vec2 k){return texture(letras,vec2((clamp(i,0.,n-1.)+clamp(k.x,.02,.98))/n,k.y)).r;}
void main(){vec2 f=gl_FragCoord.xy/celda,k=fract(f);vec3 c=texelFetch(img,ivec2(min(floor(f),rejilla-1.)),0).rgb;float l=max(c.r,max(c.g,c.b));
 float q0=clamp(pow(l,.65),0.,.999),id=floor(q0*n),g=L(id,k);g*=clamp(q0*tinta[int(n)-1]/tinta[int(id)],.72,1.2);vec3 b=vec3(0);float w=0.;
 if(res>0.){for(int j=1;j<22;j++){float r=sqrt(float(j))*1.2,a=float(j)*2.4,q=exp(-r*.35);b+=texture(img,(f+vec2(cos(a)*1.6,sin(a))*r)/rejilla).rgb*q;w+=q;}b/=w;}
 // la letra sustituye a su base en vez de sumarse: así ningún canal se quema y el color no cambia
 vec3 sue=texture(img,f/rejilla).rgb,tono=c/max(l,.001)*min(pow(l,.42),1.),ba=fondo*(1.-l)+sue*.52+b*res*.24*(1.-l);
 g=clamp(g,0.,1.);o=vec4(mix(ba,tono,g),1);
 // solo el dibujo (1) o solo las letras (2): sin fondo ni resplandor, con transparencia. Negativo: sobre negro
 if(solo!=0.){vec4 z=texelFetch(img,ivec2(min(floor(f),rejilla-1.)),0);float al=step(.4,z.a);o=abs(solo)<1.5?vec4(mix(z.rgb*.52,tono,g),al):vec4(tono,g*al);if(solo<0.)o=vec4(o.rgb*o.a,1);}}`;
// Números compactos en base64, para guardar y para los archivos descargados
MotorAscii.TIPOS = { i16: Int16Array, i8: Int8Array, u8: Uint8Array, u32: Uint32Array, f32: Float32Array };
MotorAscii.aTexto = (d, tipo, esc = 1) => { const T = MotorAscii.TIPOS[tipo], q = esc === 1 && d instanceof T ? d : T.from(d, v => Math.round(v * esc)), b = new Uint8Array(q.buffer, q.byteOffset, q.byteLength); let t = ''; for (let i = 0; i < b.length; i += 32768) t += String.fromCharCode.apply(null, b.subarray(i, i + 32768)); return btoa(t); };
MotorAscii.deTexto = (t, tipo, esc = 1) => { const b = atob(String(t)), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); const T = MotorAscii.TIPOS[tipo]; if (u.length % T.BYTES_PER_ELEMENT) throw Error('Datos dañados'); const q = new T(u.buffer); return esc === 1 ? q : Float32Array.from(q, v => v / esc); };
MotorAscii.lienzoDe = async src => { if (typeof src !== 'string' || !/^data:image\/(png|webp|jpeg);base64,/.test(src)) throw Error('Imagen no válida'); const im = new Image(); im.src = src; await im.decode(); if (im.naturalWidth > 4096 || im.naturalHeight > 4096) throw Error('Imagen demasiado grande'); const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; c.getContext('2d', { willReadFrequently: true }).drawImage(im, 0, 0); return c; };
MotorAscii.modeloDe = async m => {
  if (!m || !Array.isArray(m.partes) || m.partes.length > 4000) throw Error('Modelo no válido'); const partes = [];
  for (const p of m.partes) { const q = { pos: MotorAscii.deTexto(p.pos, 'i16', 24000), nor: MotorAscii.deTexto(p.nor, 'i8', 127), uv: p.uv ? MotorAscii.deTexto(p.uv, 'f32') : null, col: p.col ? MotorAscii.deTexto(p.col, 'u8', 255) : null, ind: p.ind ? MotorAscii.deTexto(p.ind, 'u32') : null, color: (Array.isArray(p.color) ? p.color : [1, 1, 1]).slice(0, 3).map(v => Math.max(0, Math.min(1, +v || 0))), textura: p.textura ? await MotorAscii.lienzoDe(p.textura) : null }; const n = q.pos.length / 3; if (n % 1 || n > 2e6 || q.nor.length !== q.pos.length || q.uv && q.uv.length !== n * 2 || q.col && q.col.length !== n * 3) throw Error('Modelo dañado'); if (q.ind) for (let i = 0; i < q.ind.length; i++) if (q.ind[i] >= n) throw Error('Modelo dañado'); partes.push(q); }
  return { partes, eje: m.eje && m.eje[2] ? [0, 0, 1] : [1, 0, 0], medidas: m.medidas || [1, 1, 1] };
};
// abre lo que va dentro de un .html descargado
MotorAscii.abre = async (motor, P) => {
  motor.S = MotorAscii.ajustes(P.ajustes); motor.solo = P.solo === 1 || P.solo === 2 ? P.solo : 0; motor.soloObjeto = P.soloObjeto === true;
  if (P.tipo === 'imagen') {
    const i = P.imagen, an = i.an | 0, al = i.al | 0, n = an * al, capas = [];
    for (const c of i.capas) { const alto = MotorAscii.deTexto(c.alto, 'u8', 255), region = MotorAscii.deTexto(c.region, 'u8'); if (an < 2 || al < 2 || alto.length !== n || region.length !== n * 4) throw Error('Datos dañados'); capas.push({ ...c, lienzo: await MotorAscii.lienzoDe(c.src), alto, region }); }
    motor.ponImagen({ an, al, prop: i.prop, marco: i.marco, encuadre: Array.isArray(i.encuadre) ? i.encuadre : null, capas });
  }
  else motor.ponModelo(await MotorAscii.modeloDe(P.modelo));
};
// arrastrar para girar, rueda para acercar, tocar para que reaccione
MotorAscii.gestos = (motor, cambia, opc = {}) => {
  const c = motor.lienzo, dedos = new Map(); let d = null, pinza = 0; if (!opc.libre) c.style.touchAction = 'pan-y';
  const zoom = v => { motor.S.zoom = Math.max(.3, Math.min(3, v)); if (cambia) cambia(); }, largo = () => { const [a, b] = [...dedos.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
  c.addEventListener('pointerdown', e => {
    if (e.button || opc.libre && !opc.libre(e)) return; dedos.set(e.pointerId, { x: e.clientX, y: e.clientY }); try { c.setPointerCapture(e.pointerId); } catch (x) {}
    if (dedos.size === 2) { d = null; pinza = motor.S.zoom / Math.max(1, largo()); } else d = dedos.size === 1 ? { x: e.clientX, y: e.clientY, gy: motor.S.giroY, gx: motor.S.giroX, m: 0 } : null;
  });
  c.addEventListener('pointermove', e => {
    if (!dedos.has(e.pointerId)) return; dedos.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (dedos.size === 2) { if (opc.libre) zoom(pinza * largo()); return; } if (!d) return;
    const x = e.clientX - d.x, y = e.clientY - d.y; d.m = Math.max(d.m, Math.hypot(x, y)); if (d.m < 9) return;
    let gy = d.gy + x / 150, gx = d.gx + (e.pointerType === 'touch' && !opc.libre ? 0 : y / 220); if (motor.tipo === 'imagen') { gy = Math.max(-.7, Math.min(.7, gy)); gx = Math.max(-.5, Math.min(.5, gx)); } motor.S.giroY = gy; motor.S.giroX = Math.max(-1.5, Math.min(1.5, gx)); if (cambia) cambia();
  });
  for (const ev of ['pointerup', 'pointercancel']) c.addEventListener(ev, e => { dedos.delete(e.pointerId); if (d && d.m < 9 && ev === 'pointerup') motor.toca(performance.now()); d = null; });
  c.addEventListener('wheel', e => { if (opc.rueda && !opc.rueda(e)) return; e.preventDefault(); zoom(motor.S.zoom * Math.exp(-e.deltaY * .001)); }, { passive: false });
};
if (typeof module !== 'undefined') module.exports = MotorAscii;
