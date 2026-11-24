(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const cv = $('#mar'), gl = cv.getContext('webgl2', { antialias: false, alpha: false });
const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
const C = Object.fromEntries(CRIATURAS.map(c => [c.id, c]));

const VERT = `#version 300 es
void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.-1.,0,1);}`;

// Biblioteca disponible para el código de las criaturas
const PRE = `#version 300 es
precision highp float;
uniform vec2 res;uniform vec2 centro;uniform vec2 lampara;uniform float tiempo,esc,aspecto;
out vec4 sal;
const vec3 AMBAR=vec3(1.,.62,.2),CIAN=vec3(.4,.95,.88),HUESO=vec3(.95,.9,.82),AZUL=vec3(.2,.38,.75),ROJO=vec3(.75,.2,.17);
mat2 gira(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float esfera(vec3 p,float r){return length(p)-r;}
float elipse(vec3 p,vec3 r){float k=length(p/r),m=length(p/(r*r));return k*(k-1.)/max(m,1e-4);}
float capsula(vec3 p,vec3 a,vec3 b,float r){vec3 q=p-a,e=b-a;return length(q-e*clamp(dot(q,e)/dot(e,e),0.,1.))-r;}
float funde(float a,float b,float k){float h=max(k-abs(a-b),0.)/k;return min(a,b)-h*h*k*.25;}
float caja(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
vec4 une(vec4 a,vec4 b){return a.w<b.w?a:b;}
float gajo(vec3 p,float n){return round(atan(p.z,p.x)/6.28318*n);}
vec3 ronda(vec3 p,float n){float a=-gajo(p,n)/n*6.28318,c=cos(a),s=sin(a);return vec3(c*p.x-s*p.z,p.y,s*p.x+c*p.z);}
#line 1
`;

// Pasada 1: raymarching, un píxel por carácter
const POST = `
vec3 normal(vec3 p){vec2 e=vec2(.004,0);return normalize(vec3(criatura(p+e.xyy,tiempo).w-criatura(p-e.xyy,tiempo).w,criatura(p+e.yxy,tiempo).w-criatura(p-e.yxy,tiempo).w,criatura(p+e.yyx,tiempo).w-criatura(p-e.yyx,tiempo).w)+1e-6);}
void main(){
 vec2 s=(gl_FragCoord.xy/res*2.-1.)*vec2(aspecto,1.);
 vec2 uv=(s-centro)/esc;
 vec3 ro=vec3(0,0,5),rd=normalize(vec3(uv,-1.5)),L=vec3((lampara-centro)/esc*2.5,1.25);
 vec3 col=vec3(0);float t=2.5;vec4 h;bool hit=false;
 for(int i=0;i<90;i++){vec3 p=ro+rd*t;h=criatura(p,tiempo);if(h.w<.004){hit=true;break;}t+=min(h.w*.8,.3);if(t>8.)break;}
 if(hit){
  vec3 p=ro+rd*t,n=normal(p),l=L-p;float d2=dot(l,l);l/=sqrt(d2);
  float dif=max(dot(n,l),0.),spec=pow(max(dot(reflect(-l,n),-rd),0.),24.),rim=pow(1.-max(dot(n,-rd),0.),2.5);
  vec3 b=min(h.xyz,vec3(1)),em=max(h.xyz-1.,0.);
  col=b*(.13+.12*max(n.y,0.)+.22*max(dot(n,-rd),0.)+dif*vec3(1.,.86,.66)*2.6/(1.+d2*.75))+spec*.5/(1.+d2)*vec3(1.,.9,.7);
  col+=rim*vec3(.1,.4,.5)*.8;
  if(max(em.x,max(em.y,em.z))>0.)col+=b*.45+em*1.2;
 }
 sal=vec4(col,hit?1.:0.);
}`;

// Pasada intermedia: cada celda pasa de la criatura A a la B a su propio ritmo,
// arrastrada por una corriente. El canal alfa guarda cuánto se revuelve la letra.
const MEZ = `#version 300 es
precision highp float;uniform sampler2D A,B;uniform vec2 res,lampara,centro;uniform float k,sentido,inv,tiempo,aspecto,esc,hondo;out vec4 sal;
float azar(vec2 p){return fract(sin(dot(p,vec2(12.98,78.23)))*43758.5);}
float ruido(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(azar(i),azar(i+vec2(1,0)),f.x),mix(azar(i+vec2(0,1)),azar(i+1.),f.x),f.y);}
vec4 toma(sampler2D t,vec2 c){c=floor(c);if(any(lessThan(c,vec2(0)))||any(greaterThanEqual(c,res)))return vec4(0);return texelFetch(t,ivec2(c),0);}
void main(){
 vec2 g=floor(gl_FragCoord.xy),s=(gl_FragCoord.xy/res*2.-1.)*vec2(aspecto,1.),d=(s-centro)/esc;
 vec4 c;float q=0.;
 if(k<=0.)c=toma(A,g);else{
  // el frente avanza desde un borde, con grano fino y manchas grandes
  float borde=clamp(.5+.5*d.y*sentido*1.3,0.,1.);
  float n=borde*.5+ruido(g*.07)*.32+azar(g)*.18;
  n=clamp((n-.17)/.63,0.,1.);n=mix(n,1.-n,inv);
  q=smoothstep(n*.6,n*.6+.4,k);
  float a=ruido(g*.045+7.)*12.566;
  vec2 fl=vec2(cos(a),sin(a)*.6)*13.+vec2(-d.y,d.x)*16.+vec2(0,sentido*9.)+(vec2(azar(g+3.),azar(g+9.))-.5)*5.;
  fl*=1.-2.*inv;
  vec4 va=toma(A,g-fl*q*q),vb=toma(B,g+fl*(1.-q)*(1.-q));
  c=va*(1.-smoothstep(.25,.75,q))+vb*smoothstep(.25,.75,q);
  float medio=4.*q*(1.-q);
  c.rgb*=1.+.35*medio;
  q=medio*c.a;
 }
 float dl=length(s-lampara);
 c.rgb+=vec3(1.,.7,.35)*smoothstep(.06,.02,dl)*1.6+vec3(1.,.5,.15)*.0175/(dl*dl*14.+.12);
 vec2 m=g+vec2(floor(sin(tiempo*.3+g.y*.1)*2.),floor(tiempo*3.)-floor(hondo*.06));
 if(c.a<.2&&azar(m)>.9965)c.rgb+=vec3(.25,.6,.65)*(.25+.7*exp(-dl*2.5));
 sal=vec4(c.rgb,q);
}`;

// Pasada final: brillo -> carácter, más el resplandor
const FIN = `#version 300 es
precision highp float;uniform sampler2D img,letras;uniform vec2 res,celda,rejilla;uniform float n,tiempo;uniform vec3 fondo;out vec4 sal;
float azar(vec2 p){return fract(sin(dot(p,vec2(12.98,78.23)))*43758.5);}
float letra(float i,vec2 k){return texture(letras,vec2((clamp(i,0.,n-1.)+clamp(k.x,.02,.98))/n,k.y)).r;}
void main(){
 vec2 f=gl_FragCoord.xy/celda,id=floor(f),k=fract(f);
 vec4 cel=texelFetch(img,ivec2(id),0);vec3 c=cel.rgb;float l=max(c.r,max(c.g,c.b));
 // dos letras vecinas se funden para que el cambio de brillo no salte
 float x=clamp(pow(l,.65),0.,.999)*n-.5;
 x+=(azar(id+floor(tiempo*18.))-.5)*7.*cel.a*step(.04,l);
 float i=floor(x),g=mix(letra(i,k),letra(i+1.,k),smoothstep(.3,.7,x-i));
 vec3 b=vec3(0);float w=0.;
 for(int j=1;j<26;j++){float r=sqrt(float(j))*1.15,a=float(j)*2.4;float q=exp(-r*.35);b+=texture(img,(f+vec2(cos(a)*1.6,sin(a))*r)/rejilla).rgb*q;w+=q;}
 b/=w;vec2 u=gl_FragCoord.xy/res;
 vec3 agua=fondo*smoothstep(1.1,.1,length(u-vec2(.6,.6)));
 sal=vec4(agua+g*c/max(l,.001)*min(pow(l,.6),1.35)+b*.4,1);
}`;

const par = gl && gl.getExtension('KHR_parallel_shader_compile');
function inicia(frag) {
  const pr = gl.createProgram(), sh = [[gl.VERTEX_SHADER, VERT], [gl.FRAGMENT_SHADER, frag]].map(([tipo, src]) => {
    const s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s); gl.attachShader(pr, s); return s;
  });
  gl.linkProgram(pr); return { pr, sh };
}
const listo = p => !par || gl.getProgramParameter(p.pr, par.COMPLETION_STATUS_KHR);
function termina({ pr, sh }) {
  const ok = gl.getProgramParameter(pr, gl.LINK_STATUS);
  const err = ok ? '' : sh.map(s => gl.getShaderInfoLog(s)).join('') || gl.getProgramInfoLog(pr);
  sh.forEach(s => gl.deleteShader(s));
  if (!ok) { gl.deleteProgram(pr); throw Error(err || 'No compila'); }
  const us = {}, total = gl.getProgramParameter(pr, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < total; i++) { const nm = gl.getActiveUniform(pr, i).name; us[nm] = gl.getUniformLocation(pr, nm); }
  return { pr, us };
}
const compila = frag => termina(inicia(frag));
const arma = codigo => compila(PRE + codigo + POST);

let W, H, cols, filas, cw, ch, capas, letras, fin, mez, vacio, pedido = false;
const RAMPA = ' .:-=+*oO#%@';
const filtro = () => {
  for (const p of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D, p, gl.LINEAR);
  for (const p of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D, p, gl.CLAMP_TO_EDGE);
};
function atlas() {
  const n = RAMPA.length, a = document.createElement('canvas'), w = Math.max(16, cw * 2), h = Math.max(26, ch * 2);
  a.width = w * n; a.height = h; const x = a.getContext('2d');
  x.fillRect(0, 0, a.width, h); x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `bold ${h * .86}px Consolas, monospace`;
  [...RAMPA].forEach((l, i) => x.fillText(l, (i + .5) * w, h * .52));
  gl.bindTexture(gl.TEXTURE_2D, letras); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, a); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); filtro();
}
function mide() {
  const dpr = Math.min(devicePixelRatio || 1, 1.5); W = cv.clientWidth; H = cv.clientHeight; if (!W || !H) return;
  cv.width = W * dpr; cv.height = H * dpr;
  cw = Math.round((W < 800 ? 4 : 6) * dpr); ch = Math.round((W < 800 ? 7 : 10) * dpr);
  cols = Math.ceil(cv.width / cw); filas = Math.ceil(cv.height / ch);
  for (const { tex, fb } of capas) {
    gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, cols, filas, 0, gl.RGBA, gl.UNSIGNED_BYTE, null); filtro();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  }
  atlas(); pide();
}

let raton = null, ultimo = -1e9; const lam = { x: .6, y: .5 };
addEventListener('pointermove', e => { raton = [e.clientX, e.clientY]; ultimo = performance.now(); pide(); });
const secs = $$('section');
function estado() {
  const m = innerHeight / 2; let idx = 0;
  secs.forEach((s, i) => { if (s.getBoundingClientRect().top <= m) idx = i; });
  return { act: secs[idx], idx };
}
const FONDO = { reales: [.006, .045, .085], fauna: [.04, .022, .09], monstruos: [.06, .016, .02], mitos: [.065, .04, .012] };
const fondo = [...FONDO.monstruos];
const nav = $$('#familias a'); let famAnt = null;
// Devuelve el programa, o null mientras la GPU lo compila
function toma(c) {
  if (c.prog) return c.prog;
  if (!c.pend) c.pend = inicia(PRE + c.codigo + POST);
  if (!listo(c.pend)) return null;
  const p = c.pend; c.pend = null; return c.prog = termina(p);
}
// Metamorfosis: va por tiempo, así se ve igual al desplazarse que al saltar con un enlace
const DURA = 1.25;
let de = null, hacia = null, avance = 0, sentido = 1, inv = 0, antes = 0;
function metamorfosis(meta, ms) {
  const dt = Math.min(.05, (ms - antes) / 1000); antes = ms;
  if (!de) { if (toma(meta)) de = meta; return; }
  if (hacia && meta === de) { [de, hacia] = [hacia, de]; avance = 1 - avance; inv = 1 - inv; }
  if (!hacia && meta !== de && toma(meta)) {
    if (quieto) { de = meta; return; }
    hacia = meta; avance = 0; inv = 0; sentido = orden.indexOf(meta) > orden.indexOf(de) ? 1 : -1;
  }
  if (hacia) {
    // si ya hay otra esperando, acelera
    avance += dt / DURA * (meta === hacia ? 1 : 2.2);
    if (avance >= 1) { de = hacia; hacia = null; avance = 0; }
  }
}
const orden = secs.filter(s => s.dataset.f).map(s => C[s.dataset.c]);
// La URL muestra la familia en pantalla; los enlaces directos a una criatura siguen sirviendo para entrar
// (no se toca hasta que la página carga y el navegador llega al ancla de entrada)
let cargada = false;
const ancla = location.hash && document.getElementById(location.hash.slice(1));
const recarga = (performance.getEntriesByType('navigation')[0] || {}).type !== 'navigate';
addEventListener('load', () => {
  if (ancla && !recarga) ancla.scrollIntoView();
  setTimeout(() => { cargada = true; famAnt = null; pide(); }, 300);
});
function ponUrl() {
  if (!cargada) return;
  const n = nav.find(n => (n.dataset.f || '') === famAnt);
  if (!n || n.hash === location.hash || (!famAnt && !location.hash)) return;
  history.replaceState(null, '', n.hash);
}
addEventListener('hashchange', () => setTimeout(() => {
  famAnt = estado().act.dataset.f || ''; ponUrl();
  nav.forEach(n => (n.dataset.f || '') === famAnt ? n.setAttribute('aria-current', 'true') : n.removeAttribute('aria-current'));
}, 50));
// Centro y tamaño de la criatura, en unidades donde la pantalla mide 2 de alto
const esc = { x: 0, y: 0, r: .5, ok: false };
// envergadura de las más anchas, para que no pisen el texto
const ANCHO = { fenix: 1.62, hidra: 1.36, dragon: 1.4, quetzal: 1.2, tubos: 1.2, caracol: 1.35, ballena: 1.3, aspido: 1.3, arpa: 1.2 };
function escenario(sec, asp) {
  const an = ANCHO[sec.dataset.c] || 1.12;
  const caja = sec.firstElementChild.className === 'caja' ? sec.firstElementChild : $('.caja', sec), r = caja.getBoundingClientRect();
  if (asp > 1) {
    const libre = Math.max(W * .5, W - r.right);              // ancho libre a la derecha del texto
    const mitad = libre / H, nav = 40 / H;
    return { x: asp - mitad, y: -nav, r: Math.min((1 - nav) / 1.16, mitad / an) };
  }
  const alto = Math.max(H * .42, (caja.firstElementChild.getBoundingClientRect().top - r.top)); // alto libre sobre el texto
  const nav = 44, mitad = (alto - nav) / H;
  return { x: 0, y: 1 - (nav + alto) / H, r: Math.min(mitad / 1.16, asp / an) };
}
function cuadro(ms) {
  pedido = false; const { act, idx } = estado();
  const fam = act.dataset.f || '';
  if (fam !== famAnt) { famAnt = fam; ponUrl(); nav.forEach(n => (n.dataset.f || '') === fam ? n.setAttribute('aria-current', 'true') : n.removeAttribute('aria-current')); }
  if (!gl || !cols) return;
  const t = quieto ? 1 : ms / 1000, asp = W / H;
  const lug = escenario(act, asp), paso = quieto || !esc.ok ? 1 : .07;
  for (const p of ['x', 'y', 'r']) esc[p] += (lug[p] - esc[p]) * paso;
  esc.ok = true;
  const cx = esc.x, cy = esc.y, es = esc.r;
  let mx = cx + Math.sin(t * .7) * es * .9, my = cy + es * (.75 + .18 * Math.cos(t * 1.1));
  if (raton && (quieto || ms - ultimo < 4000)) { mx = (raton[0] / W * 2 - 1) * asp; my = 1 - raton[1] / H * 2; }
  const k = quieto ? 1 : .08; lam.x += (mx - lam.x) * k; lam.y += (my - lam.y) * k;
  const c = C[act.dataset.c]; metamorfosis(c, ms);
  for (const s of [secs[idx + 1], secs[idx - 1]]) if (s && !C[s.dataset.c].prog && !C[s.dataset.c].pend && c.prog) C[s.dataset.c].pend = inicia(PRE + C[s.dataset.c].codigo + POST);
  (FONDO[fam] || FONDO.monstruos).forEach((x, i) => fondo[i] += (x - fondo[i]) * (quieto ? 1 : .05));
  const dibuja = (cri, capa) => {
    const prog = cri && cri.prog || vacio, u = prog.us;
    gl.bindFramebuffer(gl.FRAMEBUFFER, capas[capa].fb); gl.useProgram(prog.pr);
    gl.uniform2f(u.res, cols, filas); gl.uniform2f(u.centro, cx, cy); gl.uniform2f(u.lampara, lam.x, lam.y);
    gl.uniform1f(u.tiempo, t); gl.uniform1f(u.esc, es * 2.8); gl.uniform1f(u.aspecto, asp);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  gl.viewport(0, 0, cols, filas);
  for (const i of [0, 1]) { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, null); }
  dibuja(de, 0); if (hacia) dibuja(hacia, 1);
  gl.bindFramebuffer(gl.FRAMEBUFFER, capas[2].fb); gl.useProgram(mez.pr); const z = mez.us;
  for (const i of [0, 1]) { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, capas[i].tex); }
  gl.uniform1i(z.A, 0); gl.uniform1i(z.B, 1); gl.uniform2f(z.res, cols, filas); gl.uniform2f(z.lampara, lam.x, lam.y); gl.uniform2f(z.centro, cx, cy);
  gl.uniform1f(z.k, hacia ? Math.max(.0001, avance) : 0); gl.uniform1f(z.sentido, sentido); gl.uniform1f(z.inv, inv); gl.uniform1f(z.tiempo, t); gl.uniform1f(z.aspecto, asp); gl.uniform1f(z.esc, es); gl.uniform1f(z.hondo, scrollY);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, cv.width, cv.height); gl.useProgram(fin.pr); const f = fin.us;
  gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, letras); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, capas[2].tex);
  gl.uniform1f(f.tiempo, t); gl.uniform1i(f.img, 0); gl.uniform1i(f.letras, 1); gl.uniform2f(f.res, cv.width, cv.height); gl.uniform2f(f.celda, cw, ch); gl.uniform2f(f.rejilla, cols, filas);
  gl.uniform1f(f.n, RAMPA.length); gl.uniform3fv(f.fondo, fondo);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  if (!quieto || de !== c) pide();
}
function pide() { if (!pedido) { pedido = true; requestAnimationFrame(cuadro); } }
addEventListener('scroll', pide, { passive: true });

// Encaje: si el desplazamiento termina entre dos secciones, sigue solo en la misma dirección
let yBase = scrollY, dedo = false, espera = 0, dirAnt = 1;
function encaja() {
  if (dedo) return;
  const vh = document.documentElement.clientHeight, y = scrollY, dir = Math.sign(y - yBase) || dirAnt;
  yBase = y; dirAnt = dir;
  // frontera visible: la sección que empieza dentro de la pantalla
  const sig = secs.find(x => { const t = x.getBoundingClientRect().top; return t > 2 && t < vh - 2; });
  if (!sig) return;
  const arriba = sig.getBoundingClientRect().top, entra = dir >= 0 ? vh - arriba : arriba;
  const baja = dir >= 0 ? entra > vh * .05 : entra <= vh * .05;
  scrollTo({ top: Math.round(y + (baja ? arriba : arriba - vh)), behavior: quieto ? 'auto' : 'smooth' });
}
const programa = ms => { clearTimeout(espera); espera = setTimeout(encaja, ms); };
addEventListener('scroll', () => programa(160), { passive: true });
addEventListener('touchstart', () => { dedo = true; clearTimeout(espera); }, { passive: true });
for (const ev of ['touchend', 'touchcancel']) addEventListener(ev, e => { dedo = e.touches.length > 0; if (!dedo) programa(180); }, { passive: true });
if (gl) {
  gl.bindVertexArray(gl.createVertexArray()); letras = gl.createTexture();
  capas = [0, 1, 2].map(() => ({ tex: gl.createTexture(), fb: gl.createFramebuffer() }));
  fin = compila(FIN); mez = compila(MEZ); vacio = arma('vec4 criatura(vec3 p,float t){return vec4(0,0,0,9);}'); mide(); addEventListener('resize', mide);
} else { $('.guia').textContent = 'Tu navegador no tiene WebGL2 activado, así que las criaturas no se pueden dibujar. Las descripciones se pueden leer más abajo.'; pide(); }
})();
