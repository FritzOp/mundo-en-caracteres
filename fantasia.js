// Segunda parte del bestiario. Mismo contrato que criaturas.js.
CRIATURAS.push(
// ---------- Animales reales ----------
{ id:'lechuza', archivo:'lechuza.glsl', codigo:
`// Oye en estéreo, con un oído más alto que el otro.
vec4 criatura(vec3 p, float t) {
  p.xz *= gira(-.4 + .12 * sin(t * .4));
  p.y += .04;
  // cuerpo esbelto, pecho claro
  vec3 b = p; b.x += .12 * b.y;
  float d = elipse(b - vec3(0, -.05, 0), vec3(.42, .68, .38));
  d = funde(d, elipse(b - vec3(0, -.5, -.08), vec3(.28, .5, .27)), .15);
  float mota = step(.86, fract(sin(dot(floor(p.xy * 13.), vec2(12.9, 78.2))) * 43758.));
  vec3 pecho = mix(HUESO, AMBAR * .8, smoothstep(.15, -.2, p.z));
  vec4 c = vec4(mix(pecho, vec3(.35, .25, .15), mota * .6 * step(p.y, .2)), d * .7);
  // alas plegadas, en hileras de plumas
  vec3 w = vec3(abs(b.x) - .38, b.y + .2, b.z + .08);
  w.xy *= gira(-.1);
  float hil = sin(w.y * 24. + 3. * cos(w.z * 9.));
  float ala = elipse(w, vec3(.13, .62, .33)) - .014 * hil;
  ala = min(ala, elipse(w - vec3(-.06, -.5, -.1), vec3(.09, .48, .17)));
  vec3 pl = mix(vec3(.62, .44, .24), vec3(.36, .33, .32), smoothstep(-.2, .8, sin(w.y * 12. + w.z * 8.)));
  float lunar = step(.8, fract(sin(dot(floor(w.yz * 15.), vec2(39.3, 11.7))) * 4375.));
  c = une(c, vec4(mix(pl, HUESO, lunar * .8), ala * .6));
  // cola
  c = une(c, vec4(AMBAR * .6, elipse(b - vec3(0, -1.0, -.2), vec3(.2, .28, .07)) * .7));
  // patas y garras
  vec3 q = vec3(abs(p.x - .06) - .15, p.yz);
  c = une(c, vec4(HUESO * .85, cono(q, vec3(0, -.6, .1), vec3(.01, -.98, .16), .13, .05)));
  for (int i = 0; i < 3; i++) {
    float f = float(i) - 1.;
    c = une(c, vec4(vec3(.45, .33, .28), cono(q, vec3(0, -.98, .16), vec3(f * .09, -1.04, .33), .04, .02)));
  }
  // rama torcida
  vec3 r = p + vec3(0, 1.12 - .22 * p.x + .05 * sin(p.x * 4.), -.14);
  float ra = max(length(r.yz) - .11 - .02 * sin(p.x * 11. + atan(r.y, r.z) * 3.), abs(p.x) - 1.05);
  c = une(c, vec4(vec3(.3, .22, .17), ra * .6));
  // cabeza que se ladea
  q = p - vec3(-.07, .7, .06); q.xz *= gira(4.4 * smoothstep(0., 1., acc));
  q.xy *= gira(.32 * sin(t * .9) * smoothstep(-.2, .8, sin(t * .3)));
  c = une(c, vec4(mix(AMBAR * .85, vec3(.45, .35, .3), mota * .5), elipse(q, vec3(.43, .42, .39))));
  // disco facial en corazón, con ribete
  vec3 f = vec3(abs(q.x) - .15, q.y + .01, q.z - .27);
  f.xy *= gira(.32);
  float disco = elipse(f, vec3(.23, .34, .17));
  float bor = smoothstep(.8, .92, length(f.xy / vec2(.23, .34)));
  float valle = smoothstep(.05, .0, abs(q.x)) * step(0., q.y);
  c = une(c, vec4(mix(HUESO * 1.02, vec3(.5, .28, .1), max(bor, valle * .7)), disco));
  vec3 o = vec3(abs(q.x) - .16, q.y - .05, q.z - .4);
  c = une(c, ojo(o, .135, vec3(.1, .045, .015), vec3(0, 0, 1), HUESO));
  
  return une(c, vec4(vec3(.95, .72, .6), cono(q, vec3(0, -.02, .42), vec3(0, -.19, .45), .05, .025)));
}` },
{ id:'morpho', archivo:'mariposa_morpho.glsl', codigo:
`// El azul no es pigmento: depende del ángulo.
vec4 criatura(vec3 p, float t) {
  p.y -= .08 * sin(t * 2.5);
  p.yz *= gira(-.3);
  p.xy *= gira(.15);
  // cuerpo en tres partes, cabeza y antenas unidas
  vec3 q = vec3(abs(p.x), p.yz);
  float d = elipse(p - vec3(0, .12, 0), vec3(.1, .24, .1));
  d = funde(d, cono(p, vec3(0, -.05, 0), vec3(0, -.55, -.02), .085, .035), .06);
  d = funde(d, esfera(p - vec3(0, .4, .02), .1), .05);
  d = min(d, curva(q, vec3(.03, .46, .03), vec3(.1, .75, .05), vec3(.32, .9, .08), .018, .014));
  d = min(d, esfera(q - vec3(.32, .9, .08), .032));
  vec4 c = vec4(vec3(.42, .28, .2), d * .8);
  // alas: nacen del tórax y se ensanchan
  float ang = .12 + .5 * mix(.5 + .5 * sin(t * 2.5), .6 + .7 * sin(tq * 19.), acc);
  vec3 w = q - vec3(.05, .1, 0); w.xz *= gira(-ang);
  vec2 v = w.xy;
  float A = atan(v.y, v.x), R = length(v);
  float sup = 1.22 * pow(max(0., cos((A - .62) * 1.25)), .55) * (1. + .04 * sin(A * 14.));
  float inf_ = .88 * pow(max(0., cos((A + .72) * 1.3)), .5) * (1. + .05 * sin(A * 12.));
  float lim = max(sup, inf_);
  float ala = max((R - lim) * .5, abs(w.z) - .025);
  float b = R / max(lim, .01);
  vec3 azul = mix(vec3(.06, .2, .8), vec3(.2, .62, .95), .5 + .5 * sin(ang * 6. + R * 3.));
  azul = mix(azul, vec3(.05, .12, .4), smoothstep(.12, .0, abs(sin(A * 7.))) * .6);
  azul = mix(azul, vec3(.1, .09, .14), smoothstep(.8, .9, b));
  azul = mix(azul, HUESO, step(.75, sin(A * 26.)) * smoothstep(.82, .84, b) * smoothstep(.9, .88, b));
  return une(c, vec4(azul, ala * .55));
}` },
{ id:'cobra', archivo:'cobra_real.glsl', codigo:
`// La capucha son costillas que se abren.
vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.3 * sin(t * .6) - .25);
  p.y += .15;
  // cuerpo enrollado
  float d = 9.;
  for (int i = 0; i < 3; i++) {
    float k = float(i);
    vec3 r = p + vec3(0, 1.15 - k * .24, 0);
    d = min(d, length(vec2(length(r.xz) - .72 + k * .15, r.y)) - .17);
  }
  // cuello que se mece
  vec3 q = p;
  q.x -= .22 * sin(q.y * 2.2 + t * 1.2) * smoothstep(-1., 1., q.y);
  d = funde(d, capsula(q, vec3(.2, -.9, 0), vec3(0, .9, .1), .16), .2);
  // capucha
  q.z -= .75 * acc * max(0., sin(tq * 4.2)) * smoothstep(-.6, 1., q.y); q.y += .2 * acc * max(0., sin(tq * 4.2)) * smoothstep(0., 1., q.y);
  float abre = .42 + .13 * acc + .08 * sin(t * 1.2);
  d = funde(d, elipse(q - vec3(0, .42, 0), vec3(abre, .58, .1)), .1);
  // cabeza
  d = funde(d, elipse(q - vec3(0, .96, .18), vec3(.23, .17, .36)), .1);
  float bandas = smoothstep(.2, .5, sin(q.y * 16.)) * step(q.z, .4);
  vec4 c = vec4(mix(vec3(.36, .33, .18), vec3(.75, .62, .36), bandas), d * .6);
  // ojos y lengua
  vec3 o = vec3(abs(q.x) - .165, q.y - 1.02, q.z - .34);
  c = une(c, ojo(o, .115, AMBAR, vec3(.1, 0, 1), vec3(.24, .22, .13)));
  float saca = .15 + .15 * max(0., sin(t * 5.));
  c = une(c, vec4(ROJO * 1.5, capsula(q, vec3(0, .92, .48), vec3(0, .84, .52 + saca), .03)));
  return c;
}` },
// ---------- Fauna fantástica ----------
{ id:'ciervo', archivo:'ciervo_de_luna.glsl', codigo:
`// Sostiene la luna entre las astas.
vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.22 * sin(t * .35) - .12);
  p.y += .12;
  // cuerpo y cuello
  float d = elipse(p - vec3(.2, -.14, 0), vec3(.52, .24, .22));
  d = funde(d, elipse(p - vec3(-.18, -.06, 0), vec3(.24, .3, .22)), .12);
  d = funde(d, cono(p, vec3(-.24, .02, 0), vec3(-.42, .52, .02), .18, .095), .12);
  // cabeza
  vec3 k = p - vec3(-.5, .6, .04);
  k.xy *= gira(-.25); k /= 1.08;
  d = funde(d, cono(k, vec3(.06, .02, 0), vec3(-.24, -.02, 0), .115, .06), .06);
  vec3 o = vec3(k.x - .1, k.y - .08, abs(k.z) - .12);
  d = funde(d, cono(o, vec3(0), vec3(.14, .06, .1), .05, .015), .03);
  // patas esbeltas
  vec3 q = vec3(p.xy, abs(p.z) - .13);
  float lado = sign(p.z), m = .05 * sin(t * 1.2) * lado;
  d = funde(d, cono(q, vec3(-.22, -.2, 0), vec3(-.26 + m, -.68, 0), .1, .05), .06);
  d = funde(d, cono(q, vec3(-.26 + m, -.68, 0), vec3(-.26, -1.12, 0), .05, .04), .03);
  d = funde(d, cono(q, vec3(.56, -.16, 0), vec3(.66 - m, -.62, 0), .16, .055), .06);
  d = funde(d, cono(q, vec3(.66 - m, -.62, 0), vec3(.58, -1.12, 0), .055, .04), .03);
  // cola que flota
  q = p; q.y -= .05 * sin(p.x * 6. - t * 2.) * smoothstep(.6, 1.1, p.x);
  d = funde(d, curva(q, vec3(.66, -.06, 0), vec3(.98, -.1, 0), vec3(1.15, -.45, 0), .1, .02), .06);
  float brillo = smoothstep(.25, .0, abs(sin(p.x * 5. + p.y * 7. + t * .5)));
  vec3 piel = mix(vec3(.5, .58, .7), vec3(.85, .86, .88), smoothstep(-.3, .6, p.y));
  vec4 c = vec4(mix(piel, vec3(.5, .75, .85), brillo * .2), d * .7);
  // astas simétricas
  q = p - vec3(-.44, .7, .02); q.x = abs(q.x);
  float a = curva(q, vec3(.04, 0, 0), vec3(.62, .02, 0), vec3(.5, .75, 0), .04, .018);
  a = min(a, cono(q, vec3(.24, .1, 0), vec3(.24, .36, .08), .028, .01));
  a = min(a, cono(q, vec3(.42, .26, 0), vec3(.66, .5, .05), .028, .01));
  a = min(a, cono(q, vec3(.47, .4, 0), vec3(.36, .66, .06), .026, .01));
  a = min(a, cono(q, vec3(.1, .03, 0), vec3(.2, .16, .22), .025, .01));
  c = une(c, vec4(vec3(.6, .8, 1.), a * .8));
  // luna creciente y perla
  q = p - vec3(-.44, 1.06, 0);
  float luna = max(elipse(q, vec3(.25, .25, .1)), -(length(q.xy - vec2(.1, .06)) - .2));
  c = une(c, vec4(vec3(1.5, 1.6, 1.7) * (1. + .3 * acc), luna * .7));
  
  o = vec3(k.x + .03, k.y - .04, abs(k.z) - .1);
  c = une(c, ojo(o, .085, vec3(.1, .5, .9), vec3(-.25, .1, 1), HUESO));
  // peñasco
  q = p + vec3(-.15, 1.36, 0);
  float roca = caja(q, vec3(.72, .2, .42)) - .03 + .05 * sin(q.x * 9.) * sin(q.y * 8. + q.z * 5.);
  float runa = step(.7, fract(sin(floor(q.x * 9.) * 91.) * 47.)) * step(abs(q.y - .02), .06) * step(.3, q.z);
  vec4 fin_ = une(c, vec4(mix(vec3(.16, .2, .28), CIAN * 1.5, runa), roca * .6));
  if (tq < 3.) for (int i = 0; i < 9; i++) { float g = float(i), k = g * .698 + tq * 1.6; fin_ = une(fin_, vec4(vec3(1.2, 1.5, 1.8), esfera(p - vec3(-.44, 1.06, 0) - vec3(cos(k), .25 * sin(k * 2. + g), sin(k)) * (.35 + .35 * acc), .03 * acc))); }
  return fin_;
}` },
{ id:'ballena', archivo:'ballena_de_nubes.glsl', codigo:
`// Cúmulos con forma de ballena; lleva estrellas en el vientre.
vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.3 * sin(t * .3) - .25);
  p.y -= .06 * sin(t * .8) - .02;
  p.y -= .07 * sin(t * .9 - p.x * 1.3) * smoothstep(-.2, 1.3, p.x);
  // cabeza, lomo y cola que sube
  float d = elipse(p - vec3(-.55, -.02, 0), vec3(.8, .42, .44));
  d = funde(d, elipse(p - vec3(-1.05, .02, 0), vec3(.36, .22, .3)), .2);
  d = funde(d, curva(p, vec3(-.1, 0, 0), vec3(.75, -.05, 0), vec3(1.12, .5, 0), .4, .08), .25);
  // aletas de la cola
  vec3 f = p - vec3(1.14, .56, 0);
  vec3 g = f; g.xy *= gira(.55);
  d = funde(d, elipse(g - vec3(.0, .2, .08), vec3(.12, .3, .06)), .08);
  g = f; g.xy *= gira(-.95);
  d = funde(d, elipse(g - vec3(-.0, .27, -.02), vec3(.12, .36, .06)), .08);
  // aletas pectorales
  f = vec3(p.x + .42, p.y + .2, abs(p.z) - .32);
  f.xy *= gira(-.75 + .15 * sin(t * .9)); f.yz *= gira(.5);
  d = funde(d, elipse(f + vec3(0, .38, 0), vec3(.15, .48, .07)), .12);
  // volumen de nube
  d -= .035 * sin(p.x * 9. + 1.) * sin(p.y * 10.) * sin(p.z * 9.) + .016 * sin(p.x * 19.) * sin(p.y * 21.) * sin(p.z * 18. + t);
  vec3 tono = mix(vec3(.36, .45, .58), vec3(.8, .83, .86), smoothstep(-.35, .2, p.y));
  // estrellas y boca
  vec3 id = floor(p * 11.);
  float est = step(.9, fract(sin(dot(id, vec3(12.9, 78.2, 37.7))) * 43758.)) * smoothstep(.12, -.1, p.y) * smoothstep(-.95, -.5, p.x);
  tono = mix(tono, fract(id.x * .37) > .5 ? AMBAR * 1.7 : CIAN * 1.7, est * (.6 + .4 * sin(t * 2. + id.x * 2.)));
  float boca = smoothstep(.035, .0, abs(p.y + .1 - .12 * (p.x + 1.) * (p.x + .2))) * smoothstep(-.35, -.5, p.x);
  tono *= 1. - .75 * boca;
  vec4 c = vec4(tono, d * .55);
  f = vec3(p.x + .38, p.y - .06, abs(p.z) - .38);
  c = une(c, ojo(f, .13, vec3(.12, .14, .18), vec3(-.25, .05, 1), vec3(.5, .56, .64)));
  // jirones de niebla
  for (int i = 0; i < 3; i++) {
    float k = float(i);
    vec3 q = p - vec3(.4, -.22 - .05 * k, .2 - .2 * k);
    q.y -= .07 * sin(q.x * 5. - t * 2. + k * 2.);
    c = une(c, vec4(vec3(.5, .65, .9), cono(q, vec3(-.3, 0, 0), vec3(.75 - .12 * k, .08, 0), .035, .005) * .6));
  }
  vec4 fin_ = c;
  if (tq < 3.2) for (int i = 0; i < 12; i++) { float g = float(i), u = fract(tq * .9 + g * .083); vec3 b = vec3(-.62 + .35 * u * sin(g * 2.4), .38 + 1.1 * u - 1.0 * u * u, .35 * u * cos(g * 2.4)); fin_ = une(fin_, vec4(vec3(.75, 1.2, 1.5), esfera(p - b, .045 * acc * (1.1 - u)))); }
  return fin_;
}` },
{ id:'zorro', archivo:'zorro_de_brasa.glsl', codigo:
`// Roca volcánica; la cola es una hoguera.
vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.25 * sin(t * .4) + .25);
  p.y += .08; p.x -= .08;
  // pecho, lomo y grupa
  float d = elipse(p - vec3(-.3, -.12, 0), vec3(.3, .33, .25));
  d = funde(d, elipse(p - vec3(.12, -.12, 0), vec3(.42, .22, .2)), .12);
  d = funde(d, elipse(p - vec3(.45, -.16, 0), vec3(.24, .25, .22)), .1);
  // cuello y cabeza
  d = funde(d, cono(p, vec3(-.36, .05, 0), vec3(-.5, .42, .06), .22, .18), .1);
  vec3 k = p - vec3(-.56, .52, .1);
  k.xy *= gira(.06 * sin(t * .9));
  k.xz *= gira(.35); k /= 1.08;
  d = funde(d, elipse(k, vec3(.22, .2, .24)), .06);
  d = funde(d, cono(k, vec3(-.1, -.05, 0), vec3(-.4, -.11, 0), .12, .05), .06);
  // mejillas y orejas
  vec3 o = vec3(k.xy, abs(k.z));
  d = funde(d, cono(o, vec3(.02, -.06, .16), vec3(.1, -.16, .3), .1, .02), .05);
  float ore = cono(o, vec3(.04, .14, .14), vec3(.08, .52, .21), .11, .012);
  ore = max(ore, -cono(o, vec3(-.06, .2, .16), vec3(.02, .48, .22), .07, .01));
  d = funde(d, ore, .04);
  // patas
  vec3 q = vec3(p.xy, abs(p.z) - .15);
  float m = .04 * sin(t * 1.2) * sign(p.z);
  d = funde(d, cono(q, vec3(-.34, -.25, 0), vec3(-.38 + m, -.7, 0), .12, .065), .06);
  d = funde(d, cono(q, vec3(-.38 + m, -.7, 0), vec3(-.38, -1.02, 0), .065, .055), .03);
  d = funde(d, elipse(q - vec3(-.43, -1.06, 0), vec3(.12, .055, .08)), .03);
  d = funde(d, cono(q, vec3(.46, -.25, 0), vec3(.4, -.6, 0), .17, .075), .06);
  d = funde(d, cono(q, vec3(.4, -.6, 0), vec3(.56, -.78, 0), .07, .055), .03);
  d = funde(d, cono(q, vec3(.56, -.78, 0), vec3(.52, -1.02, 0), .05, .05), .03);
  d = funde(d, elipse(q - vec3(.47, -1.06, 0), vec3(.12, .055, .08)), .03);
  // facetas y grietas de magma
  d += .015 * (abs(sin(p.x * 13. + p.y * 5.)) - abs(sin(p.y * 12. + p.z * 9.)));
  float g = max(grieta(p * 1.15 + .3), acc * grieta(p * 1.9 + 1.7));
  float late = .45 * acc + .7 + .3 * sin(t * 2. + p.x * 4.);
  vec3 roca = mix(vec3(.26, .24, .26), vec3(.46, .43, .44), smoothstep(-.6, .7, p.y));
  vec4 c = vec4(mix(roca, vec3(1.8, .65, .14) * late, g * smoothstep(-1.1, -.3, p.y)), d * .6);
  // ojos y trufa
  c = une(c, ojo(o - vec3(-.12, .05, .15), .095, vec3(1., .5, .08), vec3(-.45, 0, 1), vec3(.25, .23, .24)));
  c = une(c, vec4(vec3(.05), esfera(k - vec3(-.43, -.1, 0), .045)));
  // cola de fuego
  for (int i = 0; i < 9; i++) {
    float f = float(i) / 8.;
    vec3 b = vec3(.56 + .52 * f + .1 * sin(f * 5.), -.1 + 1.0 * f, -.02);
    b.xy += vec2(.07, .03) * f * sin(t * 4. - f * 6.);
    float r = (1. + .3 * acc) * (.07 + .25 * sin(min(1., f * 1.15) * 3.0) * (1. - .35 * f));
    vec3 s = p - b;
    float l = esfera(s, r) + .05 * sin(s.x * 13. + t * 3.) * sin(p.y * 12. - t * 7.);
    vec3 fu = mix(vec3(1.1, .22, .08), vec3(1.8, 1.0, .3), smoothstep(-.1, 1.1, f + .12 * sin(p.x * 9. + p.y * 11. - t * 5.)));
    c = une(c, vec4(fu, l * .55));
  }
  for (int i = 0; i < 3; i++) {
    float f = float(i);
    vec3 s = p - vec3(.95 + .14 * f, .95, 0); s.x -= .06 * sin(s.y * 9. - t * 6. + f);
    c = une(c, vec4(vec3(1.8, 1.0, .3), cono(s, vec3(0), vec3(.12, .28 - .07 * f, 0), .08, .004) * .6));
  }
  // losa
  q = p + vec3(-.05, 1.24, 0);
  return une(c, vec4(vec3(.13, .13, .16), (caja(q, vec3(.88, .1, .42)) - .02 + .025 * sin(q.x * 9.) * sin(q.z * 11.)) * .7));
}` },
// ---------- Monstruos ----------
{ id:'dragon', archivo:'dragon.glsl', codigo:
`// Cuatro patas, alas de murciélago y brasas entre las placas.
vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.18 * sin(t * .4) + .1);
  float resp = .02 * sin(t * 1.6);
  // pecho, vientre y cadera
  float d = elipse(p - vec3(-.42, -.18, .05), vec3(.3 + resp, .4, .3));
  d = funde(d, elipse(p - vec3(.0, -.35, 0), vec3(.42, .26, .26)), .15);
  d = funde(d, elipse(p - vec3(.32, -.42, 0), vec3(.28, .27, .27)), .12);
  // cuello en S y cola que se enrosca
  float ca = .05 * sin(t * .8);
  d = funde(d, curva(p, vec3(-.45, .05, .05), vec3(-.3, .65, .05), vec3(-.72 + ca, .74, .16), .22, .12), .12);
  d = funde(d, curva(p, vec3(.45, -.5, 0), vec3(.95, -1.1, .1), vec3(1.3, -.62, .15), .17, .07), .12);
  float cola = curva(p, vec3(1.3, -.62, .15), vec3(1.42, -.2, .15), vec3(1.06, -.24 + .05 * sin(t), .15), .075, .035);
  d = min(d, cola);
  // patas
  vec3 q = vec3(p.xy, abs(p.z) - .2);
  d = funde(d, cono(q, vec3(-.42, -.4, 0), vec3(-.5, -.8, .06), .16, .1), .08);
  d = funde(d, cono(q, vec3(-.5, -.8, .06), vec3(-.48, -1.14, .06), .1, .075), .04);
  d = funde(d, elipse(q - vec3(-.56, -1.18, .07), vec3(.17, .06, .11)), .04);
  d = funde(d, cono(q, vec3(.36, -.5, .04), vec3(.22, -.82, .08), .2, .1), .08);
  d = funde(d, cono(q, vec3(.22, -.82, .08), vec3(.36, -1.14, .08), .09, .065), .04);
  d = funde(d, elipse(q - vec3(.28, -1.18, .08), vec3(.16, .06, .11)), .04);
  // cabeza con mandíbula
  vec3 k = p - vec3(-.76 + ca, .78, .18);
  k.xy *= gira(-.4); k /= 1.05;
  float abre = mix(.5 + .5 * sin(t * 1.1), 1.2, acc);
  d = funde(d, elipse(k, vec3(.19, .14, .14)), .06);
  d = funde(d, cono(k, vec3(-.08, .02, 0), vec3(-.36, -.02, 0), .1, .06), .05);
  vec3 j = k + vec3(0, .07, 0); j.xy *= gira(-.15 - .35 * abre);
  d = funde(d, cono(j, vec3(0), vec3(-.3, 0, 0), .07, .035), .03);
  vec3 u = vec3(k.xy, abs(k.z));
  float cue = curva(u, vec3(.08, .1, .08), vec3(.42, .12, .16), vec3(.38, .42, .2), .05, .01);
  cue = min(cue, cono(u, vec3(.12, .0, .12), vec3(.32, -.02, .24), .04, .005));
  // espinas a lo largo del lomo
  float esp = .03 * max(0., sin(p.x * 22. + p.y * 10.));
  d -= esp * smoothstep(.12, .02, abs(p.z - .05)) + .008 * sin(p.x * 34.) * sin(p.y * 34.);
  // placas: ranuras que dejan ver las brasas
  float ranura = smoothstep(.2, .05, abs(sin(p.y * 15. + p.x * 4.)));
  float frente = smoothstep(-.1, -.45, p.x - .25 * p.y) * step(-1., p.y);
  vec3 piel = mix(vec3(.38, .15, .13), vec3(.62, .3, .22), smoothstep(-.6, .7, p.y));
  piel = mix(piel, vec3(1.7, .65, .15), ranura * frente * (.5 + .3 * sin(t * 2.)));
  vec4 c = vec4(piel, d * .6);
  c = une(c, vec4(HUESO * .9, cue * .7));
  c = une(c, ojo(u - vec3(-.06, .07, .1), .1, AMBAR, vec3(-.35, .1, 1), vec3(.7, .2, .16)));
  // alas: muñeca arriba y cuatro dedos
  for (int i = 0; i < 2; i++) {
    float s = i == 0 ? 1. : -1.;
    vec3 w = p - vec3(i == 0 ? -.05 : -.45, .0, i == 0 ? -.15 : -.35);
    w.x *= s;
    float esc = i == 0 ? 1. : .72; w /= esc;
    w.yz *= gira(.12 * sin(t * 1.4) - .1 + .4 * acc * sin(tq * 7.));
    w.xz *= gira(i == 0 ? -.12 : .45);
    vec2 m = vec2(.2, .78);
    vec2 r2 = w.xy - m;
    float a = atan(r2.y, r2.x), r = length(r2);
    float dedo = abs(sin((a - .12) * 2.6));
    float lim = 1.28 - .25 * smoothstep(0., -1.4, a) - .24 * dedo;
    float ala = max(abs(w.z - .12 * r * r) - .022, r - lim);
    ala = max(ala, max((a - .14) * r, (-2.05 - a) * r));
    float hue = smoothstep(.12, .0, dedo);
    vec3 tono = mix(vec3(.4, .13, .11), vec3(.62, .4, .28), hue);
    c = une(c, vec4(tono, ala * .4 * esc));
    float br = cono(w, vec3(0, 0, 0), vec3(m, 0.), .07, .05);
    br = min(br, cono(w, vec3(m, 0.), vec3(m + vec2(-.05, .16), 0.), .04, .005));
    br = min(br, cono(w, vec3(m, 0.), vec3(m + vec2(1.26, .16), .18), .045, .012));
    c = une(c, vec4(vec3(.45, .24, .18), br * .7 * esc));
  }
  // aliento
  float fuego = smoothstep(.55, 1., abre);
  q = k - vec3(-.42 - .1 * fuego - .45 * acc, -.08 - .05 * acc, 0);
  return une(c, vec4(vec3(1.8, .9, .25), (elipse(q, vec3(.01) + fuego * vec3(.17 + .42 * acc, .08 + .09 * acc, .08 + .09 * acc)) + (.02 + .05 * acc) * fuego * sin(q.x * (25. - 8. * acc) + t * 15.) * cos(q.y * 14. * acc)) * .5));
}` },
{ id:'limo', archivo:'limo.glsl', codigo:
`// Se tragó algo y todavía brilla.
vec4 criatura(vec3 p, float t) {
  float bota = sin(t * 2.2) + acc * 3.2 * sin(tq * 7.5) * exp(-tq * .6);
  p.y += .35 - .1 * max(0., bota);
  p.y /= 1. + .12 * bota;
  p.xz *= 1. + .06 * bota;
  p.xz *= gira(.3 * sin(t * .5));
  // gota
  float d = elipse(p, vec3(1.05, .95, .95));
  d = funde(d, elipse(p + vec3(0, .6, 0), vec3(1.3, .25, 1.15)), .4);
  d += .04 * sin(p.x * 5. + t * 2.) * sin(p.y * 6. - t) * sin(p.z * 5.);
  d = max(d, -p.y - .75);
  // núcleo visible a través de la piel
  float nucleo = smoothstep(.5 + .45 * acc, .0, length(p.xy - vec2(.3 * sin(t), -.3)));
  vec3 piel = mix(vec3(.12, .33, .16), vec3(.5, 1.15, .28), nucleo);
  vec4 c = vec4(piel, d * .6);
  // burbujas que suben
  for (int i = 0; i < 5; i++) {
    float f = float(i), s = fract(t * .25 + f * .37);
    vec3 b = vec3(.6 * sin(f * 2.4), -.55 + 1.15 * s, .45 * cos(f * 2.4));
    d = esfera(p - b, .13 * sin(s * 3.14) + .01);
    c = une(c, vec4(vec3(.25, .5, .22), d * .7));
  }
  // ojos tragados, medio hundidos
  c = une(c, ojo(p - vec3(-.3, .3, .8), .2, vec3(.5, .32, .1), vec3(-.1, 0, 1), vec3(.14, .34, .17)));
  c = une(c, ojo(p - vec3(.3, .36, .8), .15, vec3(.4, .3, .12), vec3(.1, 0, 1), vec3(.14, .34, .17)));
  return c;
}` },
{ id:'mimico', archivo:'mimico.glsl', codigo:
`// No abras ese cofre.
vec4 criatura(vec3 p, float t) {
  p.yz *= gira(-.1); p.xz *= gira(giro);
  p.xz *= gira(.42 + .12 * sin(t * .6));
  p.y += .22; p *= 1.12;
  float abre = mix(.42 + .22 * (.5 + .5 * sin(t * 1.4)), .04 + .95 * abs(sin(tq * 6.)), acc);
  // base hueca
  float d = caja(p + vec3(0, .45, 0), vec3(.9, .42, .58)) - .02;
  d = max(d, -caja(p + vec3(0, .1, 0), vec3(.8, .42, .48)));
  float tabla = smoothstep(.06, .0, abs(fract(p.y * 4.) - .5) - .04);
  vec4 c = vec4(mix(vec3(.36, .22, .12), vec3(.13, .07, .035), tabla), d * .8);
  // tapa: gira en la bisagra de atrás y cierra justo sobre la base
  vec3 q = p - vec3(0, -.01, -.58);
  q.yz *= gira(abre);
  q.z -= .58;
  float cil = length(q.yz / vec2(.8, 1.)) * .9;
  float tapa = max(max(cil - .54, -q.y), abs(q.x) - .92);
  tapa = max(tapa, -max(cil - .44, abs(q.x) - .82));
  float tab2 = smoothstep(.06, .0, abs(fract(atan(q.y, q.z) * 2.6) - .5) - .04);
  c = une(c, vec4(mix(vec3(.38, .23, .13), vec3(.13, .07, .035), tab2), tapa * .65));
  // herrajes sobre base y tapa
  float fr = abs(abs(p.x) - .62) - .07;
  float hb = max(max(fr, caja(p + vec3(0, .45, 0), vec3(.95, .45, .61)) - .02), -caja(p + vec3(0, .1, 0), vec3(.8, .45, .5)));
  float ht = max(max(abs(abs(q.x) - .62) - .07, max(cil - .565, -q.y)), -(cil - .5));
  c = une(c, vec4(vec3(.55, .43, .24), min(hb, ht) * .7));
  // encías y dientes: los de abajo en el borde de la base, los de arriba en el de la tapa
  vec3 e = vec3(p.x - .2 * clamp(round(p.x / .2), -4., 4.), p.y + .0, p.z - .53);
  c = une(c, vec4(HUESO, cono(e, vec3(0, -.06, 0), vec3(0, .17, -.03), .075, .012) * .7));
  e = vec3(q.x - .2 * clamp(round(q.x / .2), -4., 4.), q.y, q.z - .47);
  c = une(c, vec4(HUESO, cono(e, vec3(0, .06, 0), vec3(0, -.17, .02), .075, .012) * .7));
  // lengua: sale de dentro, pasa sobre el borde y cuelga por delante
  vec3 l = p; l.x -= .1 * sin(p.z * 3. + t * 2.5) * smoothstep(.3, .9, p.z);
  float len = curva(l, vec3(0, -.15, -.2), vec3(0, .25, .75), vec3(0, -.5, .82), .15, .09);
  c = une(c, vec4(vec3(.5, .15, .15), len * .65));
  // ojos en el fondo oscuro
  c = une(c, vec4(vec3(.05, .02, .02), caja(p + vec3(0, .12, .05), vec3(.78, .02, .42))));
  vec3 o = vec3(abs(p.x) - .3, p.y - .08, p.z + .1);
  return une(c, ojo(o, .2, AMBAR, vec3(0, .05, 1), vec3(.4, .2, .08)));
}` },
{ id:'espectro', archivo:'espectro.glsl', codigo:
`// Una capa sin nadie dentro.
vec4 criatura(vec3 p, float t) {
  p.y -= .15 + .1 * sin(t);
  p.xz *= gira(.35 * sin(t * .5));
  float y = p.y;
  // capa que se ensancha y ondea hacia abajo
  vec3 q = p;
  float cae = smoothstep(.5, -1.3, y);
  q.xz += cae * .16 * vec2(sin(y * 3. + t * 1.7), cos(y * 2.5 + t * 1.3));
  float ang = atan(q.z, q.x);
  float r = .36 + .5 * cae + cae * .07 * sin(ang * 9. + t);
  float d = (length(q.xz) - r) * .7;
  float jiron = -1.15 + .22 * sin(ang * 7. + t) * sin(ang * 3.);
  d = max(d, max(y - .55, jiron - y));
  // capucha vacía
  d = funde(d, elipse(p - vec3(0, .62, 0), vec3(.42, .5, .42)), .2);
  vec3 mg = vec3(abs(p.x), p.y - .05 - .42 * acc - .1 * sin(t * 1.2 + sign(p.x)), p.z);
  d = funde(d, cono(mg, vec3(.22, .2, .05), vec3(.5, .06, .42), .17, .13), .15);
  d = max(d, -elipse(p - vec3(0, .6, .36), vec3(.26, .35, .34)));
  float hueco = smoothstep(.03, .0, elipse(p - vec3(0, .6, .36), vec3(.26, .35, .34)));
  vec3 tela = mix(vec3(.24, .28, .38), vec3(.32, .31, .4), cae);
  vec4 c = vec4(tela * (1. - hueco), d * .6);
  // ojos
  vec3 o = vec3(abs(p.x) - .12, p.y - .62, p.z - .18);
  c = une(c, vec4(mix(CIAN, vec3(1.1, .16, .12), acc) * (1.7 + .25 * sin(t * 3.)), elipse(o, vec3(.07, .045 * (1.05 - parpado()), .05))));
  // manos que se adelantan
  float lado = sign(p.x);
  q = vec3(abs(p.x) - .55, p.y - .05 - .42 * acc - .1 * sin(t * 1.2 + lado), p.z - .55);
  float m = capsula(q, vec3(-.1, .05, -.4), vec3(0), .09);
  for (int i = 0; i < 4; i++) {
    float f = float(i) - 1.5;
    m = min(m, capsula(q, vec3(f * .05, 0, 0), vec3(f * .13, -.3 + .05 * sin(t * 3. + f), .16), .025));
  }
  return une(c, vec4(HUESO, m * .8));
}` },
// ---------- Mitología ----------
{ id:'hidra', archivo:'hidra.glsl', codigo:
`// Nueve cabezas; la del centro es la inmortal.
vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.22 * sin(t * .3));
  p.y += .02;
  const vec3 H[9] = vec3[9](vec3(0, 1.02, .1), vec3(-.46, .86, 0), vec3(.48, .86, 0), vec3(-.86, .52, -.05), vec3(.9, .5, -.05), vec3(-1.08, .06, .1), vec3(1.0, .04, .25), vec3(-.56, -.02, .5), vec3(.5, .4, .4));
  // torso con placas y patas
  float d = elipse(p - vec3(0, -.35, 0), vec3(.36, .48, .32));
  vec3 q = vec3(abs(p.x), p.yz);
  d = funde(d, elipse(q - vec3(.36, -.68, .02), vec3(.22, .28, .24)), .1);
  d = funde(d, cono(q, vec3(.26, -.5, .15), vec3(.34, -.98, .28), .13, .09), .06);
  // cola que rodea el pedestal
  vec3 r = p - vec3(.08, -.98, 0);
  float ac = atan(r.z, r.x);
  float gr = .06 + .1 * smoothstep(-2.6, 1.4, ac);
  float cola = length(vec2(length(r.xz * vec2(.82, 1.1)) - .72, r.y)) - gr - .025 * max(0., sin(ac * 26.)) * step(0., r.y);
  d = min(d, cola * .85);
  float placa = .012 * sin(p.y * 32.) + .01 * sin(p.x * 30.) * sin(p.y * 26.);
  vec4 c = vec4(vec3(.31, .34, .22), (d + placa) * .6);
  // roca
  r = p + vec3(0, 1.2, 0);
  c = une(c, vec4(vec3(.16, .15, .13), (elipse(r, vec3(1.0, .16, .65)) + .04 * sin(r.x * 11.) * sin(r.z * 9.)) * .6));
  for (int i = 0; i < 9; i++) {
    float f = float(i);
    vec3 fin = H[i] * (1. + .1 * acc) + (.05 + .06 * acc * sin(tq * 9. + f * 2.)) * vec3(sin(t * .9 + f * 2.), sin(t * 1.1 + f), sin(t * .8 + f * 3.));
    vec3 ini = vec3(H[i].x * .18, -.1, .08);
    vec3 med = vec3(H[i].x * .35, max(H[i].y, .3) * .85 + .28, H[i].z * .3);
    if (i == 0) med = vec3(.12 * sin(t * .7), .5, -.15);
    float cue = curva(p, ini, med, fin, .15, .085);
    cue -= .012 * sin(p.y * 30. + p.x * 18.);
    // cabeza hacia afuera y abajo; la central mira al frente
    vec3 k = p - fin;
    vec2 dir = i == 0 ? vec2(0, 1) : normalize(vec2(sign(H[i].x), .55));
    k.xz = vec2(k.x * dir.y - k.z * dir.x, k.x * dir.x + k.z * dir.y);
    k.yz *= gira(-.3); k /= 1.08;
    float abre = mix(.5 + .5 * sin(t * 1.4 + f * 1.7), 1.3, acc);
    float cab = elipse(k, vec3(.105, .1, .13));
    cab = funde(cab, cono(k, vec3(0, .01, .05), vec3(0, -.0, .26), .075, .045), .04);
    vec3 j = k + vec3(0, .06, 0); j.yz *= gira(-.15 - .35 * abre);
    cab = min(cab, cono(j, vec3(0), vec3(0, 0, .22), .05, .025));
    vec3 o = vec3(abs(k.x), k.yz);
    float cu = cono(o, vec3(.06, .07, -.04), vec3(.13, .2, -.2), .035, .004);
    cu = min(cu, cono(o, vec3(.0, .09, -.02), vec3(.0, i == 0 ? .3 : .16, -.12), .035, .004));
    vec3 piel = mix(vec3(.34, .38, .23), vec3(.75, .58, .3), i == 0 ? .85 : .12 * sin(f));
    c = une(c, vec4(piel, funde(cue, min(cab, cu), .03) * .6));
    c = une(c, ojo(o - vec3(.075, .065, .06), .06, vec3(.95, .35, .05), vec3(.3, .1, .9), piel));
  }
  return c;
}` },
{ id:'uroboros', archivo:'uroboros.glsl', codigo:
`// Se come la cola para siempre.
vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.5 * sin(t * .4));
  p.yz *= gira(.18 * sin(t * .3));
  p.y += .06; p.xy *= gira(vuelta());
  float a = atan(p.x, p.y);              // 0 arriba, crece a la derecha
  float R = .92;
  vec2 s = vec2(length(p.xy) - R, p.z);
  float v = atan(s.y, s.x);
  // grosor: la cola (a la derecha de la cabeza) se afina
  float f = fract(a / 6.2832);           // 0 en la boca, 1 tras la cabeza
  float r = .11 + .09 * smoothstep(0., .35, f);
  // placas torcidas, facetadas
  float pl = fract(a * 7.96 + v * .6);
  float d = length(s) - r - .022 * (1. - pl);
  // espinas en la cola
  d -= .05 * max(0., sin(a * 22.)) * smoothstep(.22, .05, f) * smoothstep(.9, .0, abs(v));
  vec3 piedra = mix(vec3(.26, .31, .34), vec3(.46, .52, .55), pl);
  // banda de runas
  float banda = smoothstep(.16, .12, abs(v - 1.25));
  vec2 id = vec2(floor(a * 10.), floor(v * 14.)), sub = fract(vec2(a * 30., v * 14.));
  float runa = step(.45, fract(sin(dot(vec2(floor(a * 30.), id.y), vec2(12.9, 78.2))) * 43758.));
  float turno = .65 + .35 * sin(a * 3. - t * 2.);
  vec3 luz = fract(id.x * .37) > .5 ? CIAN : AMBAR;
  piedra = mix(piedra, vec3(.05, .08, .1), banda);
  piedra = mix(piedra, luz * (1. + .9 * turno), banda * runa);
  vec4 c = vec4(piedra, d * .55);
  // cabeza de dragón arriba, mordiendo hacia la derecha
  vec3 k = p - vec3(-.1, R + .03, .0);
  k.xy *= gira(.1); k /= 1.15;
  float ab = .12 + .08 * sin(t * 1.3);
  float cab = elipse(k, vec3(.28, .2, .22));
  cab = funde(cab, cono(k, vec3(.12, .06, 0), vec3(.42, .07, 0), .15, .09), .07);
  vec3 j = k - vec3(.02, -.12, 0); j.xy *= gira(ab);
  cab = funde(cab, cono(j, vec3(0), vec3(.34, 0, 0), .1, .06), .05);
  vec3 u = vec3(k.xy, abs(k.z));
  cab = funde(cab, elipse(u - vec3(.14, .16, .12), vec3(.15, .05, .07)), .04);
  float cu = curva(u, vec3(-.08, .12, .12), vec3(-.4, .2, .22), vec3(-.48, .46, .2), .065, .01);
  cu = min(cu, cono(u, vec3(-.16, .0, .18), vec3(-.46, -.02, .3), .05, .008));
  cu = min(cu, cono(u, vec3(-.12, -.1, .16), vec3(-.36, -.2, .26), .045, .008));
  cu = min(cu, cono(u, vec3(.36, .13, .03), vec3(.4, .27, .05), .035, .006));
  cab += .012 * sin(k.x * 30.) * sin(k.y * 28.);
  c = une(c, vec4(vec3(.4, .46, .49), min(cab, cu) * .65));
  c = une(c, ojo(u - vec3(.12, .1, .16), .1, vec3(.1, .7, .9), vec3(.3, 0, 1), vec3(.36, .42, .45)));
  vec3 n = vec3(k.x - .3 - .09 * clamp(round((k.x - .3) / .09), -1., 1.), k.y + .0, abs(k.z) - .09);
  return une(c, vec4(HUESO * 1.1, cono(n, vec3(0, .02, 0), vec3(0, -.09, 0), .03, .004)));
}` },
{ id:'fenix', archivo:'fenix.glsl', codigo:
`// Plumas por capas, cintas en la cola y fuego a los pies.
vec4 criatura(vec3 p, float t) {
  p.y -= .12 + .04 * sin(t * 2. + 1.5);
  p.xz *= gira(.22 * sin(t * .4));
  vec3 q = vec3(abs(p.x), p.yz);
  // cuerpo y cuello
  float d = elipse(p - vec3(0, -.02, 0), vec3(.21, .42, .22));
  d = funde(d, cono(p, vec3(0, .25, .04), vec3(0, .56, .1), .15, .11), .1);
  d = funde(d, elipse(p - vec3(0, .63, .12), vec3(.18, .17, .17)), .05);
  // pecho en escamas con forma de V
  float uve = sin((p.y + q.x * .9) * 34.);
  vec3 pecho = mix(vec3(.5, .1, .06), vec3(.95, .55, .2), smoothstep(.1, .8, uve) * smoothstep(-.3, .25, p.y) * step(0., p.z));
  vec4 c = vec4(pecho, (d - .012 * uve) * .65);
  c = une(c, vec4(vec3(.5, .4, .35), cono(p, vec3(0, .58, .26), vec3(0, .5, .4), .06, .015)));
  c = une(c, ojo(q - vec3(.085, .66, .22), .085, vec3(.85, .3, .05), vec3(.05, 0, 1), vec3(1., .5, .15)));
  // corona de llamas
  for (int i = 0; i < 3; i++) {
    float f = float(i);
    vec3 s = q - vec3(.07 * f, .76 - .03 * f, .06);
    s.xy *= gira(.32 * f);
    c = une(c, vec4(mix(vec3(1.7, .9, .25), vec3(1.4, .3, .1), f * .4), elipse(s - vec3(0, .1, 0), vec3(.045, .16 - .02 * f, .05)) * .7));
  }
  // alas alzadas
  vec3 w = q - vec3(.17, .2, -.02);
  w.xy *= gira(mix(.16 * sin(t * 2.), .4 * sin(tq * 8.), acc));
  w.z += .12 * w.x;
  // primarias
  for (int i = 0; i < 9; i++) {
    float f = float(i) / 8.;
    float u = 1. - f * .92;
    vec3 s = w - vec3(mix(mix(vec2(0), vec2(.35, .1), u), mix(vec2(.35, .1), vec2(.62, .42), u), u), -.02 * f);
    s.xy *= gira(-(.85 - f * 2.));
    float L = .4 - .12 * f;
    float punta = smoothstep(.2, 1.9 * L, s.x);
    c = une(c, vec4(mix(vec3(.42, .06, .05), vec3(1.25, .58, .16), punta * punta), elipse(s - vec3(L, 0, 0), vec3(L, .075, .035)) * .55));
  }
  // cobertoras, por delante
  for (int i = 0; i < 6; i++) {
    float f = float(i) / 5.;
    float u = .95 - f * .85;
    vec3 s = w - vec3(mix(mix(vec2(0), vec2(.35, .1), u), mix(vec2(.35, .1), vec2(.62, .42), u), u), .05);
    s.xy *= gira(-(.6 - f * 1.8));
    float punta = smoothstep(.1, .42, s.x);
    c = une(c, vec4(mix(vec3(.5, .11, .06), vec3(1.1, .6, .2), punta), elipse(s - vec3(.2, 0, 0), vec3(.24, .075, .04)) * .6));
  }
  c = une(c, vec4(vec3(1., .3, .12), curva(w, vec3(0, 0, .05), vec3(.35, .1, .05), vec3(.62, .42, .0), .085, .03) * .7));
  // patas
  c = une(c, vec4(AMBAR * 1.1, cono(q, vec3(.08, -.36, .08), vec3(.1, -.58, .14), .05, .03)));
  // abanico de la cola
  for (int i = 0; i < 4; i++) {
    float f = float(i);
    vec3 s = q - vec3(.04, -.3, -.1);
    s.xy *= gira(-(.12 + .24 * f) + .04 * sin(t * 2. + f));
    c = une(c, vec4(mix(vec3(1., .2, .08), vec3(.5, .05, .07), smoothstep(-.2, -.8, s.y)), elipse(s + vec3(0, .36, 0), vec3(.075, .4, .04)) * .6));
  }
  // cintas que se rizan
  float o = .05 * sin(t * 1.6);
  float ci = curva(q, vec3(.1, -.4, -.05), vec3(1., -.2 + o, 0), vec3(.82, -.85, .05), .045, .03);
  ci = min(ci, curva(q, vec3(.82, -.85, .05), vec3(.75, -1.1, .05), vec3(.4, -.98 + o, .1), .03, .02));
  ci = min(ci, curva(q, vec3(.1, -.45, 0), vec3(.55, -1.05, .1), vec3(1.08, -.55 - o, .1), .04, .02));
  c = une(c, vec4(vec3(1., .16, .1), ci * .65));
  vec3 ti = q - vec3(1.1, -.5 - o, .1); ti.xy *= gira(.45);
  c = une(c, vec4(vec3(1.7, .8, .2), elipse(ti, vec3(.055, .14, .04)) * .6));
  ti = q - vec3(.36, -.97 + o, .1);
  c = une(c, vec4(vec3(1.7, .8, .2), elipse(ti, vec3(.13, .05, .04)) * .6));
  // hoguera
  vec3 h = p + vec3(.05 * sin(p.y * 8. - t * 6.), .86, 0);
  float fu = elipse(h, vec3(max(.04, .17 - .14 * h.y) + .24 * acc, .38 + .5 * acc, .13 + .2 * acc)) + .05 * sin(h.x * 16.) * sin(h.y * 7. - t * 7.);
  return une(c, vec4(mix(vec3(1.8, 1.1, .4), vec3(1.5, .4, .1), smoothstep(-.2, .3, h.y)), fu * .5));
}` },
{ id:'kraken', archivo:'kraken.glsl', codigo:
`// Más isla que pez.
vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.2 * sin(t * .3));
  p.y -= .04 * sin(t * .8) + .05;
  // manto inclinado y cabeza
  vec3 m = p - vec3(-.46, .6, 0); m.xy *= gira(.75);
  float d = elipse(m, vec3(.43, .56, .42));
  d = funde(d, elipse(p - vec3(-.02, .12, .02), vec3(.3, .3, .28)), .2);
  // arrugas sobre la piel
  d += .012 * sin(m.x * 12. + 2. * sin(m.y * 7.));
  // cejas
  vec3 o = vec3(p.x + .02, p.y - .16, abs(p.z) - .2);
  d = funde(d, elipse(o - vec3(.02, .08, .04), vec3(.17, .06, .09)), .05);
  const vec3 C[8] = vec3[8](vec3(-.75, -.95, .1), vec3(-.65, -.5, .3), vec3(.1, -.95, .3), vec3(.62, -.3, .25), vec3(.95, -.35, 0), vec3(.45, -.25, -.35), vec3(-.75, -.35, .45), vec3(.75, -.95, -.1));
  const vec3 E[8] = vec3[8](vec3(-1.18, -.3, .0), vec3(-.42, -1.02, .3), vec3(.3, -.72, .4), vec3(1.12, -.55, .3), vec3(1.02, .5, .0), vec3(.58, .28, -.35), vec3(-.5, .02, .55), vec3(.85, -.98, -.2));
  float vent = 0.;
  for (int i = 0; i < 8; i++) {
    float f = float(i);
    vec3 e = E[i] + .07 * vec3(sin(t * .8 + f * 1.3), cos(t * .7 + f * 2.1), 0) + .2 * acc * vec3(sin(tq * 5. + f * 1.3), cos(tq * 6. + f * 2.1), .5 * sin(tq * 4. + f));
    vec3 ini = vec3(.22 * cos(f * .8 + 2.4), -.08, .18 * sin(f * .8));
    float br = curva(p, ini, C[i], e, .15, .06);
    // rizo en la punta
    vec2 tg = normalize(e.xy - C[i].xy);
    float s = i == 3 || i == 4 || i == 7 ? -1. : 1.;
    float R = .15;
    vec3 r = p - vec3(e.xy + vec2(-tg.y, tg.x) * s * R, e.z);
    float an = atan(dot(r.xy, vec2(-tg.y, tg.x)) * s, dot(r.xy, tg));
    float g = fract((an + 1.5708) / 6.2832);
    float rizo = length(vec2(length(r.xy) - R * (1. - .42 * g), r.z)) - .06 * (1. - .72 * g);
    br = min(br, rizo * .7);
    d = funde(d, br, .07);
  }
  vec3 piel = mix(vec3(.24, .33, .4), vec3(.5, .62, .68), smoothstep(-.7, 1., p.y));
  // ventosas claras por debajo de los brazos
  float punto = smoothstep(.5, .9, sin(p.x * 34.) * sin(p.y * 34.));
  piel = mix(piel, vec3(.8, .75, .72), punto * smoothstep(-.02, -.25, p.y) * .8);
  float vena = smoothstep(.12, .0, abs(sin(m.x * 5. + 2.5 * sin(m.y * 4.)))) * step(.15, p.y);
  piel = mix(piel, CIAN * 1.1, vena * .35);
  vec4 c = vec4(piel, d * .55);
  c = une(c, ojo(o - vec3(.04, -.02, .07), .17, AMBAR, vec3(.2, -.05, 1), vec3(.45, .35, .8)));
  vec4 fin_ = c;
  if (tq < 3.) for (int i = 0; i < 5; i++) { float g = float(i), u = clamp(tq / 2.4 - .08 * g, 0., 1.); vec3 b = p - vec3(.1 + .4 * u * sin(g * 2.4), -.5 - .5 * u, .35 + .3 * u * cos(g * 2.4)); fin_ = une(fin_, vec4(vec3(.06, .05, .1), (esfera(b, .26 * sin(3.1416 * u)) + .04 * sin(b.x * 15.) * sin(b.y * 14. + g) * sin(b.z * 13.)) * .6 + .06 * (1. - acc))); }
  return fin_;
}` },
{ id:'quetzal', archivo:'quetzalcoatl.glsl', codigo:
`// Un infinito de plumas.
vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.25 * sin(t * .35));
  p.y -= .04 * sin(t) - .03;
  // cuerpo: un ocho tendido, con cuello arriba y cola abajo
  float d = 9., u = 0.;
  vec3 ant = vec3(.0, -.2, .24);
  for (int i = 1; i <= 18; i++) {
    float f = float(i) / 18., w = f * 6.2832;
    vec3 sig = vec3(.86 * sin(w), -.2 + .36 * sin(w * 2.) + .03 * sin(t * 1.5 + w * 2.), .24 * cos(w));
    vec3 pa = p - ant, ba = sig - ant;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0., 1.);
    float e = length(pa - ba * h) - .165;
    if (e < d) { d = e; u = (float(i) - 1. + h) / 18. * 9.; }
    ant = sig;
  }
  float cue = curva(p, vec3(0, -.2, .24), vec3(.72, .42, .1), vec3(-.04, .72, .16), .17, .16);
  if (cue < d) { u = p.y * 2.5 + 20.; }
  d = funde(d, cue, .06);
  // plumas imbricadas
  float pl = sin(u * 16. + 2. * sin(p.x * 13. + p.y * 9.) + p.z * 12.);
  float capa = sin(p.x * 25. + p.y * 19. + u * 4.);
  d -= .03 * pl * capa;
  vec3 tono = mix(vec3(.03, .27, .19), vec3(.16, .58, .5), smoothstep(-.3, .9, pl));
  tono = mix(tono, vec3(.08, .2, .5), smoothstep(.55, 1., capa) * .6);
  tono = mix(tono, vec3(.7, .55, .25) * (1. + .8 * acc), smoothstep(.75 - .4 * acc, 1., pl * capa));
  vec4 c = vec4(tono, d * .5);
  // cola escamada con cascabel
  float co = curva(p, vec3(-.05, -.3, .2), vec3(-.62, -1.2, .2), vec3(.18, -1.12, .22), .12, .05);
  co += .01 * sin(p.x * 40.) * sin(p.y * 40.);
  c = une(c, vec4(mix(vec3(.12, .5, .4), AMBAR, step(.6, sin(p.x * 22. + p.y * 8.))), co * .6));
  c = une(c, vec4(AMBAR * 1.3, min(esfera(p - vec3(.25, -1.1, .22), .07), esfera(p - vec3(.34, -1.05, .22), .06))));
  // cabeza: máscara de perfil, mirando a la izquierda
  vec3 k = p - vec3(-.12, .74, .24);
  k.xz *= gira(.5); k /= 1.12;
  float ab = .5 + .5 * sin(t * 1.2);
  float cab = elipse(k, vec3(.2, .18, .17));
  cab = funde(cab, cono(k, vec3(-.05, .0, 0), vec3(-.36, -.03, 0), .15, .085), .06);
  vec3 j = k - vec3(-.02, -.12, 0); j.xy *= gira(-.12 - .25 * ab);
  cab = min(cab, cono(j, vec3(.04, .02, 0), vec3(-.3, 0, 0), .09, .045));
  float gre = step(.5, fract(k.x * 9.)) * step(abs(k.y - .08), .025);
  c = une(c, vec4(mix(vec3(.24, .4, .33), vec3(.75, .6, .3), gre), cab * .7));
  vec3 z = vec3(k.x + .08, k.y - .07, abs(k.z) - .14);
  c = une(c, ojo(z, .085, AMBAR, vec3(-.4, .05, 1), vec3(.2, .6, .45)));
  z = vec3(k.x + .12 - .08 * clamp(round((k.x + .12) / .08), -2., 1.), k.y + .07, abs(k.z) - .08);
  c = une(c, vec4(HUESO * 1.1, cono(z, vec3(0, .02, 0), vec3(0, -.06, 0), .022, .004)));
  z = vec3(k.x - .08, k.y + .06, abs(k.z) - .19);
  
  // penacho en dos capas
  for (int i = 0; i < 11; i++) {
    float g = (float(i) - 5.) * .31 + .12;
    vec3 s = p - vec3(-.06, .72, .06);
    s.xy *= gira(g * (1. + .14 * acc) + .03 * sin(t * 2. + g * 3.) + .06 * acc * sin(tq * 14. + g * 4.));
    vec3 tp = mix(vec3(.05, .38, .26), i % 2 == 0 ? vec3(.2, .62, .55) : vec3(.14, .3, .62), smoothstep(.2, .5, s.y));
    tp = mix(tp, vec3(.7, .56, .28), smoothstep(.025, .0, abs(s.x)) * .6);
    float L = (i % 2 == 0 ? .36 : .29) * (1. + .22 * acc);
    c = une(c, vec4(tp, elipse(s - vec3(0, L, 0), vec3(.075, L, .04)) * .6));
  }
  return c;
}` },
{ id:'aspido', archivo:'aspidoquelonio.glsl', codigo:
`// No eches el ancla aquí.
vec4 criatura(vec3 p, float t) {
  p.yz *= gira(-.24); p.xz *= gira(giro);
  p.xz *= gira(.5 + .25 * sin(t * .25));
  p.x += .2;
  p.y -= .06 * sin(t * .9) - .05;
  // caparazón con placas, cubierto de tierra
  vec3 q = p;
  float placa = .03 * sin(q.x * 9.) * sin(q.z * 9.);
  float d = max(elipse(q, vec3(1.1, .62, .85)) + placa, -q.y - .08);
  vec3 tierra = mix(vec3(.3, .25, .18), vec3(.2, .38, .18), smoothstep(.25, .45, q.y));
  vec4 c = vec4(tierra, d * .6);
  // vientre, cabeza y aletas
  float b = elipse(p + vec3(0, .12, 0), vec3(1., .2, .75));
  vec3 k = p - vec3(1.25, .02 + .06 * sin(t), 0);
  b = funde(b, elipse(k, vec3(.42, .28, .27)), .25);
  float lado = sign(p.z);
  vec3 f = vec3(abs(p.x - .05) - .6, p.y + .18, abs(p.z) - .85);
  f.yz *= gira(.3 * sin(t * 1.2 + lado * .4));
  b = funde(b, elipse(f, vec3(.2, .06, .45)), .12);
  c = une(c, vec4(vec3(.22, .34, .33), b * .7));
  k.z = abs(k.z) - .24;
  c = une(c, ojo(k - vec3(.12, .08, 0), .115, vec3(.5, .3, .05), vec3(.4, .05, 1), vec3(.28, .55, .52)));
  // palmeras
  for (int i = 0; i < 4; i++) {
    float g = float(i);
    vec3 s = p - vec3(-.6 + g * .38, .5 - .06 * abs(g - 1.5), .25 * sin(g * 2.5));
    float alto = .42 + .12 * sin(g * 4.);
    s.x -= (.06 * sin(t + g) + .25 * acc * sin(tq * 9. + g)) * s.y;
    c = une(c, vec4(vec3(.5, .32, .15), capsula(s, vec3(0, -.1, 0), vec3(0, alto, 0), .035)));
    s.y -= alto;
    vec3 h = ronda(s, 5.); h.xy *= gira(-.45);
    c = une(c, vec4(vec3(.2, .46, .2), elipse(h - vec3(.18, 0, 0), vec3(.2, .045, .07)) * .7));
  }
  // fogata de los marineros
  c = une(c, vec4(vec3(1.7, .7, .2), elipse(p - vec3(.1, .66, .3), vec3(.05, .1 + .03 * sin(t * 9.), .05)) * .7));
  return c;
}` },
{ id:'golem', archivo:'golem.glsl', codigo:
`// Bloques de piedra y una palabra en la frente.
vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.4 * sin(t * .4));
  p.y += .0;
  float lado = sign(p.x), b = .03 * sin(t * 1.2);
  p.y -= .03 * abs(sin(t * 1.2));
  vec3 q = vec3(abs(p.x), p.yz);
  float paso = .1 * sin(t * 1.2) * lado;
  // pecho partido, cintura y cadera
  vec3 s = q - vec3(.25, .3 + b, 0); s.xy *= gira(.06);
  float d = caja(s, vec3(.2, .26, .22)) - .05;
  d = min(d, caja(p - vec3(0, -.1, 0), vec3(.2, .12, .16)) - .04);
  d = min(d, caja(p - vec3(0, -.3, 0), vec3(.3, .11, .2)) - .04);
  // hombros
  s = q - vec3(.64, .42 + b, 0); s.xy *= gira(.25);
  d = min(d, caja(s, vec3(.19, .2, .22)) - .05);
  // brazo, antebrazo y puño
  s = q - vec3(0, b, paso * smoothstep(.3, -.6, p.y));
  d = min(d, esfera(s - vec3(.76, .1, 0), .18));
  vec3 u = s - vec3(.84, -.2, .04); u.xy *= gira(-.1);
  d = min(d, caja(u, vec3(.17, .22, .18)) - .04);
  u = s - vec3(.84, -.57, .08);
  d = min(d, caja(u, vec3(.14, .12, .14)) - .04);
  d = min(d, caja(u - vec3(-.06, 0, .17), vec3(.1, .035, .04)) - .02);
  // piernas
  s = q - vec3(0, 0, -paso * .8);
  d = min(d, caja(s - vec3(.22, -.54, 0), vec3(.11, .14, .12)) - .03);
  d = min(d, esfera(s - vec3(.24, -.74, .03), .14));
  u = s - vec3(.27, -.96, .02);
  d = min(d, caja(u, vec3(.13 - .08 * u.y, .18, .15)) - .04);
  // cabeza
  vec3 k = p - vec3(0, .78 + b, .06);
  k.xz *= gira(.15 * sin(t * .7));
  d = min(d, caja(k, vec3(.17, .19, .17)) - .05);
  d += .012 * sin(p.x * 17.) * sin(p.y * 15. + 2.) * sin(p.z * 16.);
  float g = grieta(p * 1.3);
  vec3 piedra = mix(vec3(.5, .43, .36), vec3(.12, .1, .08), g * .85);
  piedra = mix(piedra, vec3(1.6, .6, .18), g * acc * .9);
  float tabl = step(abs(k.x), .19) * step(abs(k.y - .03), .125) * step(.19, k.z);
  piedra = mix(piedra, vec3(.1, .06, .04), tabl);
  vec4 c = vec4(piedra, d * .7);
  // emet, de derecha a izquierda; la álef se apaga a ratos
  vec2 e = k.xy - vec2(0, .03);
  float L = 9.;
  float viva = min(step(-.6, sin(t * .7)), 1. - step(.4, acc));
  vec2 a = e - vec2(.12, 0);
  float al = min(trazo(a, vec2(-.05, .08), vec2(.05, -.08)), min(trazo(a, vec2(.05, .08), vec2(.015, .0)), trazo(a, vec2(-.05, -.08), vec2(-.02, .02))));
  a = e;
  float me = min(min(trazo(a, vec2(-.04, .08), vec2(.04, .07)), trazo(a, vec2(.04, .07), vec2(.045, -.08))), min(trazo(a, vec2(.045, -.08), vec2(.0, -.08)), trazo(a, vec2(-.04, .08), vec2(-.05, -.08))));
  a = e + vec2(.12, 0);
  float ta = min(min(trazo(a, vec2(-.05, .07), vec2(.045, .07)), trazo(a, vec2(.045, .07), vec2(.045, -.08))), trazo(a, vec2(-.025, .07), vec2(-.05, -.08)));
  L = min(viva > .5 ? al : 9., min(me, ta));
  float placa = max(abs(k.z - .225) - .012, L - .014);
  c = une(c, vec4(vec3(1.6, .85, .25), placa * .7));
  u = vec3(abs(k.x) - .09, k.y + .13, k.z - .22);
  return une(c, vec4(AMBAR * 1.7, caja(u, vec3(.055, .045 * (1.02 - parpado()), .015)) - .01));
}` }
);
