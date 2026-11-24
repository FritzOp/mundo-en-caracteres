(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const cv = $('#mar'), gl = cv.getContext('webgl2', { antialias: false, alpha: false });
const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
// Monta la galería a partir del catálogo
const C = {};
const obras = OBRAS.filter(o => {
  const cod = CRIATURAS.find(c => c.id === o.id);
  if (!cod && !o.imagen) { console.warn('Falta el dibujo de', o.id); return false; }
  C[o.id] = Object.assign(cod || {}, o); return true;
});
const slug = { reales: 'animales-reales', fauna: 'fauna-fantastica', monstruos: 'monstruos', mitos: 'mitologia' }, vistos = new Set();
const ancla1 = id => { if (!id || vistos.has(id)) return ''; vistos.add(id); return `<span id="${id}"></span>`; };
const grupos = GRUPOS.filter(g => obras.some(o => o.grupo === g.id));
$('#familias').innerHTML = '<a href="#inicio">Inicio</a>' + grupos.map(g => `<a href="#${g.id}" data-f="${g.id}">${g.nombre}</a>`).join('');
$('#indice .caja').innerHTML = grupos.map(g => {
  const l = obras.filter(o => o.grupo === g.id);
  return `<details name="indice"><summary>${g.nombre}<span>${l.length}</span></summary><ul>${l.map(o => `<li><a href="#${o.id}">${o.titulo}</a></li>`).join('')}</ul></details>`;
}).join('');
$('main').insertAdjacentHTML('beforeend', grupos.flatMap(g => obras.filter(o => o.grupo === g.id)).map(o =>
  `<section id="${o.id}" data-c="${o.id}" data-f="${o.grupo}">${ancla1(o.grupo)}${ancla1(slug[o.fondo])}<div class="caja"><h2>${o.titulo}</h2><p class="lat">${o.dato || ''}</p><p>${o.texto || ''}</p></div></section>`).join(''));
$('main > section:last-child .caja').append($('#creditos').content);
$$('#inicio,#indice').forEach(s => s.dataset.c = obras[0].id);

const VERT = `#version 300 es
void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.-1.,0,1);}`;

// Biblioteca disponible para el código de las criaturas
const PRE = `#version 300 es
precision highp float;
uniform vec2 res;uniform vec2 centro;uniform vec2 lampara;uniform float tiempo,esc,aspecto,brinco;
out vec4 sal;
const vec3 AMBAR=vec3(1.,.62,.2),CIAN=vec3(.4,.95,.88),HUESO=vec3(.95,.9,.82),AZUL=vec3(.2,.38,.75),ROJO=vec3(.75,.2,.17);
mat2 gira(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float esfera(vec3 p,float r){return length(p)-r;}
float elipse(vec3 p,vec3 r){float k=length(p/r),m=length(p/(r*r));return k*(k-1.)/max(m,1e-4);}
float capsula(vec3 p,vec3 a,vec3 b,float r){vec3 q=p-a,e=b-a;return length(q-e*clamp(dot(q,e)/dot(e,e),0.,1.))-r;}
float funde(float a,float b,float k){float h=max(k-abs(a-b),0.)/k;return min(a,b)-h*h*k*.25;}
float caja(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
float cono(vec3 p,vec3 a,vec3 b,float r,float s){vec3 q=p-a,e=b-a;float h=clamp(dot(q,e)/dot(e,e),0.,1.);return length(q-e*h)-mix(r,s,h);}
float curva(vec3 p,vec3 a,vec3 b,vec3 c,float r,float s){float d=9.;vec3 u=a;for(int i=1;i<=6;i++){float f=float(i)/6.;vec3 v=mix(mix(a,b,f),mix(b,c,f),f);d=min(d,cono(p,u,v,mix(r,s,f-.1667),mix(r,s,f)));u=v;}return d;}
float trazo(vec2 p,vec2 a,vec2 b){vec2 q=p-a,e=b-a;return length(q-e*clamp(dot(q,e)/dot(e,e),0.,1.));}
float grieta(vec3 p){p+=.35*sin(p.yzx*3.1+1.)+.15*sin(p.zxy*7.3);float g=min(abs(sin(p.x*4.3+p.y*2.1)),min(abs(sin(p.y*4.7-p.z*2.7)),abs(sin(p.z*4.1+p.x*3.3))));return smoothstep(.13,.03,g);}
vec4 une(vec4 a,vec4 b){return a.w<b.w?a:b;}
float gajo(vec3 p,float n){return round(atan(p.z,p.x)/6.28318*n);}
vec3 ronda(vec3 p,float n){float a=-gajo(p,n)/n*6.28318,c=cos(a),s=sin(a);return vec3(c*p.x-s*p.z,p.y,s*p.x+c*p.z);}
float parpado(){float m=mod(tiempo,3.6);return smoothstep(.14,.04,abs(m-.2));}
vec4 ojo(vec3 q,float r,vec3 iris,vec3 mira,vec3 parp){
 r*=.56;float d=length(q)-r;if(d>.25)return vec4(parp,d);
 mira=normalize(mira+vec3(clamp((lampara-centro)*.35,-.28,.28),0));
 vec3 n=normalize(q+1e-5);float a=dot(n,mira);
 vec3 c=parp*.45;c=mix(c,iris*(.85+.25*sin(atan(n.y,n.x)*18.)),smoothstep(.2,.3,a));c*=1.-.55*smoothstep(.45,.25,a);c=mix(c,vec3(.005),smoothstep(.76,.82,a));
 c=mix(c,vec3(1.25),smoothstep(.972,.985,dot(n,normalize(mira+vec3(-.2,.28,.05)))));
 c=mix(c,parp*.75,step(.55-1.7*parpado(),n.y));
 return vec4(c,d);}
#line 1
`;

// Pasada 1: raymarching, un píxel por carácter
const POST = `
vec4 viva(vec3 p){
 float b=.005*sin(tiempo*1.8)+.05*brinco,y=p.y+1.1;
 p.y=(y-.16*max(brinco,0.))/(1.+b)-1.1;p.xz*=1.+.55*b;p.x+=.01*sin(tiempo*1.1)*y-.025*clamp(lampara.x-centro.x,-1.,1.)*y;
 return criatura(p,tiempo);}
float gr(vec3 p){return sin(p.x)*sin(p.y+1.3*sin(p.z*.7))*sin(p.z+.9*sin(p.x*.6));}
void main(){
 vec2 s=(gl_FragCoord.xy/res*2.-1.)*vec2(aspecto,1.);
 vec2 uv=(s-centro)/esc;
 vec3 ro=vec3(0,0,5),rd=normalize(vec3(uv,-1.5)),L=vec3((lampara-centro)/esc*2.5,1.35);
 vec3 col=vec3(0),P=vec3(0),n=vec3(0),l=vec3(0),e=vec3(0);vec4 h=vec4(0);
 float t=2.5,ts=.06,oc=0.,so=1.,dL=1.;int fase=0,k=0;bool hit=false;
 for(int i=min(int(tiempo),0);i<125;i++){
  vec3 q;
  if(fase==0)q=ro+rd*t;
  else if(fase==1){e=.5773*(2.*vec3((((k+3)>>1)&1),((k>>1)&1),(k&1))-1.);q=P+.005*e;}
  else if(fase==2)q=P+n*(.05+.11*float(k));
  else q=P+n*.035+l*ts;
  vec4 m=viva(q);
  if(fase==0){
   if(m.w<.004){hit=true;h=m;P=q;fase=1;}
   else{t+=min(m.w*.8,.3);if(t>8.||i>92)break;}
  }else if(fase==1){n+=e*m.w;if(++k==4){n=normalize(n+1e-6);l=L-P;dL=length(l);l/=dL;fase=2;k=0;}}
  else if(fase==2){float z=.05+.11*float(k);oc+=max(z-m.w*1.5,0.)*(1.-.28*float(k));if(++k==3){if(dot(n,l)<=0.)break;fase=3;k=0;}}
  else{so=min(so,11.*m.w/ts);ts+=clamp(m.w*1.2,.05,.22);if(++k==10||ts>dL-.15||so<.02)break;}
 }
 if(hit){
  // grano de piel: rompe la lisura en color y relieve
  float g1=gr(P*31.),g2=gr(P*67.+3.);
  n=normalize(n+.09*vec3(gr(P*43.),gr(P*47.+2.),gr(P*41.+5.)));
  float ao=clamp(1.-2.1*oc,.18,1.),dif=max(dot(n,l),0.),nv=max(dot(n,-rd),0.),d2=dL*dL;
  float spec=pow(max(dot(n,normalize(l-rd)),0.),38.),rim=pow(1.-nv,3.);
  vec3 b=min(h.xyz,vec3(1.)),em=max(h.xyz-1.1,0.);
  b=mix(vec3(dot(b,vec3(.3,.59,.11))),b,.96)*(.9+.12*g1+.07*g2);
  vec3 cielo=mix(vec3(.13,.14,.17),vec3(.36,.38,.42),n.y*.5+.5);
  col=b*(cielo+.42*nv)*ao;
  col+=b*dif*mix(.12,1.,so)*vec3(1.,.88,.7)*3.1/(1.+d2*.55);
  col+=b*max(dot(n,normalize(vec3(-.7,.25,-.45))),0.)*vec3(.34,.46,.58)*ao;
  col+=spec*so*.4/(1.+d2*.7)*vec3(1.,.92,.8);
  col+=rim*vec3(.12,.2,.26)*ao;
  if(max(em.x,max(em.y,em.z))>0.)col+=min(h.xyz,vec3(1.))*.4+em*1.1;
 }
 sal=vec4(col,hit?1.:0.);
}`;

// Pasada intermedia: cada celda pasa de la criatura A a la B a su propio ritmo,
// arrastrada por una corriente. El canal alfa guarda cuánto se revuelve la letra.
const MEZ = `#version 300 es
precision highp float;uniform sampler2D A,B;uniform vec2 res,lampara,centro;uniform float k,sentido,inv,tiempo,aspecto,esc,hondo,orbe;out vec4 sal;
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
 c.rgb+=vec3(1.,.7,.35)*smoothstep(orbe,orbe*.35,dl)*1.6+vec3(1.,.5,.15)*(.0175+.25*(orbe-.06))/(dl*dl*14.+.12);
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
// Obra a partir de una imagen: la foto se ajusta al escenario y la linterna la ilumina
const IMG = `#version 300 es
precision highp float;uniform sampler2D foto;uniform vec2 res,centro,lampara;uniform float tiempo,esc,aspecto,brinco,prop;out vec4 sal;
void main(){
 vec2 s=(gl_FragCoord.xy/res*2.-1.)*vec2(aspecto,1.),d=(s-centro)/(esc*.42);
 d.y-=.1*max(brinco,0.);d+=.012*vec2(sin(tiempo*.7+d.y*3.),cos(tiempo*.6+d.x*3.));
 vec2 m=prop>1.?vec2(1.,1./prop):vec2(prop,1.),u=d/m*.5+.5;
 if(any(lessThan(u,vec2(0)))||any(greaterThan(u,vec2(1)))){sal=vec4(0);return;}
 vec4 c=texture(foto,vec2(u.x,1.-u.y));
 vec2 b=smoothstep(vec2(0),vec2(.06),u)*smoothstep(vec2(0),vec2(.06),1.-u);
 float l=length(s-lampara);vec3 k=pow(c.rgb,vec3(1.15))*c.a*b.x*b.y*(.62+1.1*exp(-l*l*2.2));
 sal=vec4(k,step(.04,max(k.r,max(k.g,k.b))));
}`;
function empieza(c) {
  if (c.imagen && !c.tex) {
    c.tex = gl.createTexture(); const im = new Image();
    im.onload = () => { gl.bindTexture(gl.TEXTURE_2D, c.tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im); filtro(); c.prop = im.width / im.height; pide(); };
    im.onerror = () => console.error('No se pudo cargar', c.imagen);
    im.src = c.imagen;
  }
  c.pend = inicia(c.imagen ? IMG : PRE + c.codigo + POST);
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
  cw = Math.round((W < 800 ? 4 : 5) * dpr); ch = Math.round((W < 800 ? 7 : 8) * dpr);
  cols = Math.ceil(cv.width / cw); filas = Math.ceil(cv.height / ch);
  for (const { tex, fb } of capas) {
    gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, cols, filas, 0, gl.RGBA, gl.UNSIGNED_BYTE, null); filtro();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  }
  atlas(); pide();
}

let raton = null, ultimo = -1e9; const lam = { x: .6, y: .5 };
addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; raton = [e.clientX, e.clientY]; ultimo = performance.now(); pide(); });
// En pantallas táctiles: si el dedo cae sobre el orbe, lo arrastra y la página no se mueve.
// Si cae en cualquier otro sitio, el desplazamiento es el normal.
let hondo = scrollY, sujeto = null, radio = .06;
const enOrbe = t => cv.orbe && Math.hypot(t.clientX - cv.orbe.x, t.clientY - cv.orbe.y) < 58;
const lleva = t => { raton = [t.clientX, t.clientY]; ultimo = performance.now(); pide(); };
document.addEventListener('touchstart', e => {
  const t = e.changedTouches[0];
  if (sujeto !== null) { e.preventDefault(); return; }
  if (e.touches.length > 1 || !enOrbe(t) || t.target.closest('#familias')) return;
  sujeto = t.identifier; e.preventDefault(); lleva(t);
}, { passive: false });
document.addEventListener('touchmove', e => {
  if (sujeto === null) return;
  e.preventDefault();
  for (const t of e.changedTouches) if (t.identifier === sujeto) lleva(t);
}, { passive: false });
for (const ev of ['touchend', 'touchcancel']) document.addEventListener(ev, e => {
  for (const t of e.changedTouches) if (t.identifier === sujeto) { sujeto = null; ultimo = performance.now(); pide(); }
});
const secs = $$('section');
// La obra cambia en cuanto se empieza a entrar en la siguiente, según hacia dónde se va
let rumbo = 1, yAnt = scrollY;
addEventListener('scroll', () => { if (scrollY !== yAnt) rumbo = scrollY > yAnt ? 1 : -1; yAnt = scrollY; }, { passive: true });
function estado() {
  const m = innerHeight * (rumbo > 0 ? .88 : .12); let idx = 0;
  secs.forEach((s, i) => { if (s.getBoundingClientRect().top <= m) idx = i; });
  return { act: secs[idx], idx };
}
// El texto no se desplaza: el de la obra anterior se desvanece y aparece el nuevo
let textoAct = null;
function ponTexto(sec) {
  if (sec === textoAct) return;
  textoAct = sec;
  secs.forEach(s => s.classList.toggle('activa', s === sec));
}
addEventListener('focusin', e => { const s = e.target.closest('section'); if (s && s !== textoAct) s.scrollIntoView(); });
const fondo = [...FONDOS.criaturas];
const nav = $$('#familias a'); let famAnt = null;
// Devuelve el programa, o null mientras la GPU lo compila
function toma(c) {
  if (c.prog) return c.prog;
  if (!c.pend) empieza(c);
  if (c.imagen && !c.prop || !listo(c.pend)) return null;
  const p = c.pend; c.pend = null;
  try { return c.prog = termina(p); } catch (e) { console.error(c.id, e.message); return c.prog = vacio; }
}
// Metamorfosis: va por tiempo, así se ve igual al desplazarse que al saltar con un enlace
const DURA = .7;
// Salto: solo si se presiona la criatura, y como mucho uno cada ESPERA segundos
const ESPERA = 3;
let golpe = -9;
addEventListener('click', e => {
  const ahora = performance.now() / 1000;
  if (ahora - golpe < ESPERA || e.target.closest('a,summary,details')) return;
  const x = (e.clientX / W * 2 - 1) * W / H, y = 1 - e.clientY / H * 2;
  if (Math.hypot(x - esc.x, y - esc.y) > esc.r * 1.15) return;
  golpe = ahora; pide();
});
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
const ANCHO = { fenix: 1.36, hidra: 1.22, dragon: 1.45, tubos: 1.12, caracol: 1.35, ballena: 1.3, aspido: 1.3, arpa: 1.2, kraken: 1.32, saturno: 1.35, agujero: 1.3, montes: 1.35, ciudad: 1.35, templo: 1.35, castillo: 1.3, auto: 1.3, velero: 1.3, volcan: 1.25, faro: 1.25 };
function escenario(sec, asp) {
  const an = C[sec.dataset.c].ancho || ANCHO[sec.dataset.c] || 1.12;
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
// Portada e índice: criaturas al azar, sin repetir hasta agotar la bolsa
const portadas = secs.filter(s => !s.dataset.f), rotulo = $('#enportada');
let bolsa = [], proxima = null, cambio = 0;
const saca = () => {
  if (!bolsa.length) { bolsa = orden.slice(); for (let i = bolsa.length - 1; i > 0; i--) { const k = Math.random() * (i + 1) | 0; [bolsa[i], bolsa[k]] = [bolsa[k], bolsa[i]]; } if (bolsa[bolsa.length - 1].id === portadas[0].dataset.c) bolsa.reverse(); }
  return bolsa.pop();
};
const seccionDe = id => secs.find(s => s.dataset.f && s.dataset.c === id);
function ponPortada(c) {
  portadas.forEach(s => s.dataset.c = c.id);
  rotulo.textContent = $('h2', seccionDe(c.id)).textContent; rotulo.href = '#' + c.id;
}
ponPortada(saca());
function rotaPortada(act, ms) {
  const c = C[act.dataset.c];
  if (act.dataset.f || quieto) { cambio = 0; return; }
  if (!cambio || de !== c || hacia) { cambio = ms + 5000; return; }  // cuenta desde que ya se ve
  if (!proxima) proxima = saca();
  if (!proxima.prog && !proxima.pend) empieza(proxima);
  if (ms > cambio && toma(proxima)) { ponPortada(proxima); proxima = null; cambio = 0; }
}
function cuadro(ms) {
  pedido = false; const { act, idx } = estado(); ponTexto(act);
  const fam = act.dataset.f || '';
  if (fam !== famAnt) { famAnt = fam; ponUrl(); nav.forEach(n => (n.dataset.f || '') === fam ? n.setAttribute('aria-current', 'true') : n.removeAttribute('aria-current')); }
  if (!gl || !cols) return;
  const t = quieto ? 1 : ms / 1000, asp = W / H;
  const lug = escenario(act, asp), paso = quieto || !esc.ok ? 1 : .07;
  for (const p of ['x', 'y', 'r']) esc[p] += (lug[p] - esc[p]) * paso;
  esc.ok = true;
  const cx = esc.x, cy = esc.y, es = esc.r;
  let mx = cx + Math.sin(t * .7) * es * .9, my = cy + es * (.75 + .18 * Math.cos(t * 1.1));
  my = Math.min(my, 1 - 130 / H);
  if (raton && (quieto || ms - ultimo < 4000)) { mx = (raton[0] / W * 2 - 1) * asp; my = 1 - raton[1] / H * 2; }
  const k = quieto ? 1 : sujeto !== null ? .45 : .08; lam.x += (mx - lam.x) * k; lam.y += (my - lam.y) * k;
  cv.orbe = { x: (lam.x / asp + 1) / 2 * W, y: (1 - lam.y) / 2 * H };
  radio += ((sujeto !== null ? .1 : asp < 1 ? .07 : .06) - radio) * .2;
  if (par && C[act.dataset.c].prog && !orden.some(o => o.pend && !listo(o.pend))) { const sg = orden.find(o => !o.prog && !o.pend); if (sg) empieza(sg); }
  rotaPortada(act, ms); const c = C[act.dataset.c]; metamorfosis(c, ms);
  for (const s of [secs[idx + 1], secs[idx - 1]]) if (s && !C[s.dataset.c].prog && !C[s.dataset.c].pend && c.prog) empieza(C[s.dataset.c]);
  (FONDOS[c.fondo] || FONDOS[c.grupo] || fondo).forEach((x, i) => fondo[i] += (x - fondo[i]) * (quieto ? 1 : .05));
  const tg = ms / 1000 - golpe, brinco = quieto || tg > 3 || tg < 0 ? 0 : Math.exp(-3 * tg) * Math.sin(tg * 11);
  const dibuja = (cri, capa) => {
    const prog = cri && cri.prog || vacio, u = prog.us;
    gl.bindFramebuffer(gl.FRAMEBUFFER, capas[capa].fb); gl.useProgram(prog.pr);
    gl.uniform2f(u.res, cols, filas); gl.uniform2f(u.centro, cx, cy); gl.uniform2f(u.lampara, lam.x, lam.y);
    if (cri && cri.imagen && prog === cri.prog) { gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, cri.tex); gl.uniform1i(u.foto, 0); gl.uniform1f(u.prop, cri.prop); }
    gl.uniform1f(u.tiempo, t); gl.uniform1f(u.brinco, brinco); gl.uniform1f(u.esc, es * 2.8); gl.uniform1f(u.aspecto, asp);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  gl.viewport(0, 0, cols, filas);
  for (const i of [0, 1]) { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, null); }
  dibuja(de, 0); if (hacia) dibuja(hacia, 1);
  gl.bindFramebuffer(gl.FRAMEBUFFER, capas[2].fb); gl.useProgram(mez.pr); const z = mez.us;
  for (const i of [0, 1]) { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, capas[i].tex); }
  gl.uniform1i(z.A, 0); gl.uniform1i(z.B, 1); gl.uniform2f(z.res, cols, filas); gl.uniform2f(z.lampara, lam.x, lam.y); gl.uniform2f(z.centro, cx, cy);
  gl.uniform1f(z.k, hacia ? Math.max(.0001, avance) : 0); gl.uniform1f(z.sentido, sentido); gl.uniform1f(z.inv, inv); gl.uniform1f(z.tiempo, t); gl.uniform1f(z.aspecto, asp); gl.uniform1f(z.esc, es); gl.uniform1f(z.hondo, hondo += (scrollY - hondo) * .1); gl.uniform1f(z.orbe, radio);
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
  scrollTo({ top: Math.round(y + (baja ? arriba : arriba - vh)), behavior: 'instant' });
}
const programa = ms => { clearTimeout(espera); espera = setTimeout(encaja, ms); };
addEventListener('scroll', () => programa(110), { passive: true });
addEventListener('touchstart', () => { dedo = true; clearTimeout(espera); }, { passive: true });
for (const ev of ['touchend', 'touchcancel']) addEventListener(ev, e => { dedo = e.touches.length > 0; if (!dedo) programa(180); }, { passive: true });
if (gl) {
  gl.bindVertexArray(gl.createVertexArray()); letras = gl.createTexture();
  capas = [0, 1, 2].map(() => ({ tex: gl.createTexture(), fb: gl.createFramebuffer() }));
  fin = compila(FIN); mez = compila(MEZ); vacio = arma('vec4 criatura(vec3 p,float t){return vec4(0,0,0,9);}'); mide(); addEventListener('resize', mide);
} else { $('.guia').textContent = 'Tu navegador no tiene WebGL2 activado, así que las criaturas no se pueden dibujar. Las descripciones se pueden leer más abajo.'; pide(); }
})();
