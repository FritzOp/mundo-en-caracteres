// Leyendas de Asia, de dominio público. acc (0 a 1) y tq (segundos) dan el gesto al tocarlas.
// rostro(), craneo() y flequillo() trabajan con la cabeza en unidades de radio 1.
CRIATURAS.push(
{ id:'wukong', codigo:
`vec4 criatura(vec3 p, float t) {
  p.y -= .05 * sin(t * 1.4) + .1; p.xz *= gira(.35 * sin(t * .35));
  float L = sign(p.x); vec3 q = vec3(abs(p.x), p.yz);
  // nube a los pies
  vec4 c = vec4(0, 0, 0, 9);
  for (int i = 0; i < 7; i++) { float f = float(i); vec3 b = p - vec3(.75 * sin(f * 2.4) * (.4 + .09 * f), -1.12 + .06 * cos(f * 1.7), .3 * cos(f * 2.4));
    c = une(c, vec4(mix(vec3(.75, .55, .35), vec3(.95, .88, .75), smoothstep(-.15, .15, b.y)), (elipse(b, vec3(.36, .2, .28)) + .02 * sin(b.x * 14. + t) * sin(b.y * 15.)) * .7)); }
  // piernas, falda de tigre y coraza
  float pi = min(cono(q, vec3(.14, -.5, 0), vec3(.2, -.92, .02), .17, .13), elipse(q - vec3(.22, -1.04, .08), vec3(.11, .09, .18)));
  c = une(c, vec4(mix(vec3(.85, .62, .25), vec3(.55, .13, .1), step(-.88, p.y)), pi));
  float a = atan(p.z, p.x), r = length(p.xz);
  float fa = max(r - .26 - .28 * (-.2 - p.y) - .02 * sin(a * 9.), abs(p.y + .42) - .22);
  c = une(c, vec4(mix(vec3(.82, .5, .14), vec3(.12, .06, .03), step(.45, sin(p.y * 34. + 3. * sin(a * 5.)))), fa * .8));
  float to = elipse(p - vec3(0, -.08, 0), vec3(.31, .33, .23));
  float es = step(.2, length(fract(vec2(a * 5. + .5 * floor(p.y * 14.), p.y * 14.)) - vec2(.5, .3)) - .15);
  c = une(c, vec4(mix(vec3(.9, .68, .25), vec3(.5, .32, .1), es), to));
  c = une(c, vec4(vec3(.6, .1, .08), max(length(vec2(r - .3, p.y + .26)) - .06, -9.)));
  // brazos: el derecho lleva el bastón
  vec3 codo = L > 0. ? vec3(.58, -.06, .1) : vec3(.56, -.16, -.02), mano = L > 0. ? vec3(.6, .26, .25) : vec3(.36, -.3, .14);
  c = une(c, vec4(vec3(.62, .12, .1), cono(q, vec3(.3, .1, 0), codo, .12, .1)));
  c = une(c, vec4(vec3(.42, .24, .11), min(cono(q, codo, mano, .09, .075), esfera(q - mano, .095))));
  c = une(c, vec4(vec3(.9, .68, .25), elipse(q - vec3(.3, .14, 0), vec3(.17, .1, .16))));
  // bastón: gira y se alarga
  vec3 b = p - vec3(.6, .26, .28); b.xy *= gira(.25 + 3. * vuelta()); float la = .75 + .45 * acc;
  float ba = max(length(b.xz) - .045, abs(b.y) - la);
  c = une(c, vec4(mix(vec3(.5, .08, .07), vec3(1., .76, .3) * (1. + .5 * acc), smoothstep(la - .2, la - .17, abs(b.y))), ba));
  // cabeza de mono: pelaje, máscara clara en corazón
  vec3 k = (p - vec3(0, .52, .03)) / .34; vec3 o = vec3(abs(k.x), k.yz);
  float pel = .05 * sin(k.x * 21.) * sin(k.y * 23.) * sin(k.z * 19.);
  float ca = funde(craneo(k), elipse(o - vec3(.75, -.1, .05), vec3(.4, .6, .45)), .2);
  ca = funde(ca, elipse(k - vec3(0, -.38, .8), vec3(.45, .32, .3)), .15);
  float cor = smoothstep(.05, -.05, min(length((o.xy - vec2(.3, .08)) / vec2(.36, .42)) - 1., length((k.xy - vec2(0, -.4)) / vec2(.5, .42)) - 1.)) * step(.2, k.z);
  vec3 cara = rostro(k + vec3(0, 0, 0), vec3(.9, .68, .52), vec3(1., .6, .1), .5);
  c = une(c, vec4(mix(vec3(.5, .27, .1), cara, cor), (ca + pel * (1. - cor)) * .34 * .7));
  c = une(c, vec4(vec3(.85, .6, .48), elipse(o - vec3(1.02, .05, 0), vec3(.14, .26, .2)) * .34));
  // diadema de oro y plumas de faisán
  c = une(c, vec4(vec3(1.05, .8, .32), (length(vec2(length(k.xz) - .98, k.y - .5)) - .09) * .34));
  c = une(c, vec4(vec3(1.05, .8, .32), (length(vec2(length((k - vec3(0, .6, .92)).xy) - .13, k.z - .95)) - .06) * .34));
  float pl = curva(q, vec3(.12, .85, 0), vec3(.35, 1.35, -.1), vec3(.95 + .05 * sin(t * 1.5), 1.15 + .06 * sin(t * 2.), -.25), .035, .02);
  c = une(c, vec4(mix(vec3(.75, .2, .12), vec3(.9, .75, .5), step(.5, fract(length(q) * 9.))), pl));
  // pañuelo
  vec3 w = p - vec3(0, .18, -.15); w.x -= .06 * sin(w.y * 7. + t * 3.);
  c = une(c, vec4(vec3(.65, .08, .07), length(vec2(length(p.xz) - .22, p.y - .22)) - .07));
  return une(c, vec4(vec3(.65, .08, .07), curva(w, vec3(0), vec3(-.35, .1, -.2), vec3(-.75, -.25 + .08 * sin(t * 2.5), -.3), .06, .03)));
}` },
{ id:'momotaro', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.35 * sin(t * .3)); p.y += .05;
  float L = sign(p.x); vec3 q = vec3(abs(p.x), p.yz);
  float ab = .42 + .06 * sin(t) + .45 * acc;
  // dos mitades del melocotón, abiertas como un libro
  vec3 m = q - vec3(0, -.95, -.15); m.xy *= gira(ab); m.y -= .62;
  float d = elipse(m - vec3(.02, -.02, 0), vec3(.72, .7, .62));
  d = funde(d, cono(m, vec3(.02, .4, 0), vec3(.02, .78, 0), .28, .03), .2);
  float hu = elipse(m - vec3(.0, -.02, 0), vec3(.58, .56, .5));
  d = max(max(d, -hu), -m.x);
  float den = step(hu, .03) + step(m.x, .02);
  vec3 piel = mix(vec3(.95, .68, .42), vec3(.9, .35, .38), smoothstep(-.4, .7, m.y + .25 * sin(m.z * 4.)));
  vec4 c = vec4(mix(piel, vec3(.98, .88, .66), min(den, 1.)), d * .75);
  // hojas y agua
  for (int i = 0; i < 2; i++) { vec3 h = q - vec3(.72, -.92 - .06 * float(i), .25); h.xy *= gira(-.2 + .35 * float(i)); c = une(c, vec4(vec3(.22, .42, .16), elipse(h, vec3(.36, .03, .14)) * .7)); }
  float ag = p.y + 1.02 + .02 * sin(p.x * 9. + t * 2.) * sin(p.z * 8. - t);
  c = une(c, vec4(vec3(.12, .34, .42), max(max(ag, -1.2 - p.y), length(p.xz * vec2(.85, 1.1)) - 1.15) * .8));
  // el niño: salta al tocarlo
  vec3 b = p - vec3(0, -.12 + .22 * acc * abs(sin(tq * 4.)), .05); vec3 bq = vec3(abs(b.x), b.yz);
  float r = length(b.xz), a = atan(b.x, b.z);
  float cu = max(r - .2 - .16 * smoothstep(.1, -.6, b.y), max(b.y - .12, -.75 - b.y));
  float sol = smoothstep(.04, .0, abs(abs(a) - .35) * r) * step(0., b.z);
  c = une(c, vec4(mix(vec3(.16, .25, .5), vec3(.88, .7, .3), sol), cu * .8));
  // brazos arriba con una katana pequeña
  vec3 mano = vec3(.42, .28 + .2 * acc, .18);
  c = une(c, vec4(vec3(.16, .25, .5), cono(bq, vec3(.2, .04, 0), vec3(.38, .14 + .14 * acc, .12), .1, .12)));
  c = une(c, vec4(vec3(.92, .7, .56), esfera(bq - mano, .08)));
  vec3 ka = b - vec3(.42, .28 + .2 * acc, .2); ka.xy *= gira(.5 - .5 * acc);
  c = une(c, vec4(mix(vec3(.8, .84, .88), vec3(.15, .1, .08), step(ka.y, .06)), min(caja(ka - vec3(0, .28, 0), vec3(.022, .34, .01)), caja(ka - vec3(0, .07, 0), vec3(.06, .012, .04)))));
  vec3 ab2 = b - vec3(-.42, .3 + .2 * acc, .22); float fr = length(ab2.xy - vec2(0, -.02)), fa = atan(ab2.x, ab2.y);
  c = une(c, vec4(mix(vec3(.9, .86, .78), vec3(.75, .1, .1), step(length(ab2.xy - vec2(0, .13)), .07)), max(max(fr - .24, abs(fa) - .75), abs(ab2.z) - .012) * .8));
  // cabeza con moño y cinta
  vec3 k = (b - vec3(0, .42, .04)) / .32; vec3 o = vec3(abs(k.x), k.yz);
  c = une(c, vec4(rostro(k, vec3(.94, .72, .58), vec3(.35, .18, .08), .15), craneo(k) * .32 * .8));
  float pe = max(elipse(k - vec3(0, .16, -.12), vec3(1.07, .98, 1.02)), -elipse(k - vec3(0, -.35, .95), vec3(.86, .86, .72)));
  pe = min(min(pe, flequillo(k)), funde(esfera(k - vec3(0, 1.22, -.15), .22), elipse(k - vec3(0, 1.5, -.15), vec3(.3, .2, .2)), .15));
  c = une(c, vec4(vec3(.1, .08, .09), pe * .32 * .75));
  float ci = max(length(vec2(length(k.xz) - 1.02, k.y - .52)) - .09, -9.);
  float mel = step(length(k.xy - vec2(0, .53)), .085) * step(0., k.z);
  return une(c, vec4(mix(vec3(.92), vec3(.9, .4, .45), mel), ci * .32));
}` },
{ id:'kaguya', codigo:
`vec4 criatura(vec3 p, float t) {
  vec3 g = p; p.y -= .04 * sin(t) + .0;
  p.xz *= gira(.25 * sin(t * .3));
  vec3 q = vec3(abs(p.x), p.yz);
  float r = length(p.xz * vec2(1., 1.15)), a = atan(p.x, p.z);
  // doce capas de seda: campana con franjas
  float R = .2 + .52 * smoothstep(.15, -1.2, p.y) + .02 * sin(a * 11. + p.y * 2.);
  float d = max(r - R, max(p.y - .16, -1.2 - p.y));
  float cap = fract((R - abs(a) * .06) * 12. + p.y * 1.5);
  float fr = smoothstep(.55, .35, abs(a)) * step(0., p.z);
  float n = floor(abs(a) * 11.);
  vec3 s = .55 + .4 * cos(n * 1.1 + vec3(0, 2.1, 4.2));
  vec3 seda = mix(vec3(.62, .12, .2) + .1 * step(.8, sin(p.y * 17.) * sin(a * 13.)), s, fr);
  vec4 c = vec4(seda * (.85 + .2 * cap), d * .75);
  // mangas anchas, manos juntas
  vec3 m = q - vec3(.24, .02, .08);
  float ma = cono(q, vec3(.2, .06, 0), vec3(.34, -.28, .3), .11, .2); ma = max(ma, -cono(q, vec3(.3, -.2, .28), vec3(.36, -.42, .36), .06, .15));
  c = une(c, vec4(mix(vec3(.62, .12, .2), vec3(.85, .6, .3), smoothstep(-.3, -.42, p.y)), ma * .8));
  // abanico abierto
  vec3 f = p - vec3(0, -.3, .5); f.yz *= gira(-.25); float fa = atan(f.x, f.y), fl = length(f.xy);
  c = une(c, vec4(mix(vec3(.95, .85, .6), vec3(.75, .15, .2), step(.6, sin(fl * 30.))) * (.85 + .15 * cos(fa * 26.)), max(max(fl - .3, abs(fa) - .95), abs(f.z + .02 * cos(fa * 26.)) - .012) * .7));
  // cabeza y pelo negro hasta el suelo
  vec3 k = (p - vec3(0, .5, .04)) / .33;
  c = une(c, vec4(rostro(k, vec3(.97, .86, .8), vec3(.25, .18, .35), 0.), craneo(k) * .33 * .8));
  float pe = max(elipse(k - vec3(0, .14, -.1), vec3(1.07, 1.02, 1.05)), -elipse(k - vec3(0, -.38, .95), vec3(.72, .92, .72)));
  float lar = max(length((p.xz - vec2(0, -.16)) * vec2(1., 1.5)) - .33 - .26 * smoothstep(.2, -1.2, p.y) - .012 * sin(atan(p.x, p.z) * 24.), max(p.y - .5, -1.2 - p.y)); lar = max(lar, p.z + .02 + .1 * smoothstep(0., -1., p.y));
  float me = cono(q, vec3(.3, .6, .1), vec3(.27, -.05, .2), .06, .035);
  float pb = min(min(pe * .33 * .75, lar * .7), me);
  c = une(c, vec4(vec3(.06, .05, .07) + .12 * smoothstep(.9, 1., sin(a * 24.)), pb));
  c = une(c, vec4(vec3(1., .8, .35), min(length(vec2(length((p - vec3(0, .9, .12)).xy) - .1, p.z - .12)) - .02, esfera(q - vec3(.2, .86, .18), .035))));
  // bambúes, uno con luz
  for (int i = 0; i < 5; i++) { float h = float(i); vec3 b = g - vec3(-1.05 + .52 * h + .1 * sin(h * 3.), 0, -.6 + .2 * sin(h * 5.)); b.x -= .04 * sin(t * .8 + h) * (b.y + 1.2);
    float nu = abs(fract(b.y * 2.2 + h * .3) - .5); float br = max(length(b.xz) - .055 - .012 * smoothstep(.44, .5, nu), abs(b.y + .05) - 1.2);
    float luz = h == 1. ? step(abs(b.y + .55), .2) : 0.; c = une(c, vec4(mix(vec3(.24, .42, .18), vec3(1.6, 1.4, .6), luz) * (1. - .4 * smoothstep(.45, .5, nu)), br)); }
  // luna que crece y luciérnagas
  c = une(c, vec4(vec3(1.35, 1.28, 1.05) * (1. + .25 * acc), esfera(g - vec3(.62, .85, -1.1), .3 + .16 * acc)));
  for (int i = 0; i < 7; i++) { float h = float(i), u = fract(t * .12 + h * .143); c = une(c, vec4(vec3(1.5, 1.4, .6), esfera(g - vec3(.9 * sin(h * 2.4 + t * .3), -1. + 1.9 * u, .5 * cos(h * 2.4)), .022 + .02 * acc))); }
  return c;
}` },
{ id:'kitsune', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.3 * sin(t * .3)); p.y += .08;
  vec3 q = vec3(abs(p.x), p.yz);
  float pel = .01 * sin(p.x * 43.) * sin(p.y * 47.) * sin(p.z * 41.);
  // nueve colas en abanico
  vec4 c = vec4(0, 0, 0, 9);
  for (int i = 0; i < 9; i++) {
    float f = float(i) - 4., an = f * (.36 + .06 * acc) + .05 * sin(t * 1.2 + f * 1.4) + .12 * acc * sin(tq * 6. + f);
    vec2 d = vec2(sin(an), cos(an));
    vec3 a = vec3(.05 * f * .3, -.75, -.3), e = vec3(d.x * 1.12, -.35 + d.y * 1.22, -.45), m = vec3(d.x * .75, -.75 + d.y * .7, -.5) + vec3(d.y, -d.x, 0) * .16 * sin(t + f);
    float co = min(curva(p, a, m, e, .06, .19), esfera(p - e, .19)); co = funde(co, cono(p, e, e + vec3(d * .24, 0), .17, .01), .06);
    float pu = smoothstep(.2, .02, length(p - e - vec3(d * .12, 0)) - .12);
    c = une(c, vec4(mix(vec3(.9, .86, .82), vec3(.75, .18, .1), pu) + acc * pu * vec3(.6, .3, .1), (co + pel * 1.5) * .7));
  }
  // cuerpo sentado
  float d = elipse(p - vec3(0, -.62, 0), vec3(.38, .48, .4));
  d = funde(d, elipse(p - vec3(0, -.2, .12), vec3(.28, .42, .27)), .15);
  d = funde(d, cono(q, vec3(.13, -.3, .26), vec3(.13, -1.02, .34), .12, .075), .06);
  d = funde(d, elipse(q - vec3(.13, -1.07, .4), vec3(.09, .06, .13)), .04);
  d = funde(d, elipse(q - vec3(.31, -.9, .05), vec3(.17, .22, .3)), .1);
  // cabeza afilada
  vec3 k = p - vec3(0, .4, .2); k.xy *= gira(.12 * sin(t * .6)); vec3 o = vec3(abs(k.x), k.yz);
  d = funde(d, elipse(k, vec3(.3, .25, .27)), .1);
  d = funde(d, cono(k, vec3(0, -.06, .15), vec3(0, -.13, .5), .15, .045), .08);
  d = funde(d, cono(o, vec3(.16, -.08, .1), vec3(.32, -.2, .04), .12, .02), .06);
  float or_ = cono(o, vec3(.15, .16, .0), vec3(.24, .56, -.02), .12, .01); or_ = max(or_, -cono(o, vec3(.15, .18, .1), vec3(.23, .48, .07), .075, .008));
  d = funde(d, or_, .04);
  float den = smoothstep(.08, .0, abs(o.x - .2 + .1 * (o.y - .2))) * step(.2, o.y) * step(0., k.z);
  vec3 piel = mix(vec3(.93, .9, .86), vec3(.8, .45, .4), den * .7);
  // marcas rojas
  float ma = smoothstep(.02, .008, abs(o.y - .13 - .3 * (o.x - .1))) * step(abs(o.x - .16), .09) + smoothstep(.02, .008, abs(o.y + .07 + .35 * (o.x - .2))) * step(abs(o.x - .22), .07) + step(length((k.xy - vec2(0, .17)) * vec2(1.6, 1.)), .05);
  piel = mix(piel, vec3(.72, .08, .06), min(ma, 1.) * step(.05, k.z));
  c = une(c, vec4(piel, (d + pel) * .65));
  c = une(c, ojo(o - vec3(.135, .02, .225), .085, vec3(.95, .55, .08), vec3(.15, 0, 1), vec3(.9, .85, .8)));
  c = une(c, vec4(vec3(.04), elipse(k - vec3(0, -.11, .53), vec3(.04, .03, .03))));
  // collar con joya
  c = une(c, vec4(vec3(.7, .1, .08), length(vec2(length((p - vec3(0, .1, .12)).xz) - .25, p.y - .1 + .3 * (p.z - .12))) - .04));
  c = une(c, vec4(vec3(.3, 1.2, 1.1), esfera(p - vec3(0, -.02, .4), .065)));
  // fuegos fatuos
  for (int i = 0; i < 6; i++) { float f = float(i), an = f * 1.047 + t * .7 + acc * tq * 2.; vec3 b = p - vec3(1.05 * cos(an), -.2 + .3 * sin(t * 1.1 + f * 2.), .55 * sin(an) + .25);
    float S = .06 + .05 * acc; float fu = funde(esfera(b, S), cono(b, vec3(0), vec3(.03 * sin(t * 6. + f), S * 3., 0), S * .8, .005), .03); c = une(c, vec4(mix(vec3(.5, 1.5, 1.9), vec3(.2, .5, 1.6), smoothstep(0., S * 3., b.y)), fu * .8)); }
  return c;
}` },
{ id:'tengu', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.35 * sin(t * .3) - .2); p.y += .02 - .12 * acc * abs(sin(tq * 3.));
  float L = sign(p.x); vec3 q = vec3(abs(p.x), p.yz);
  vec4 c = vec4(0, 0, 0, 9);
  // alas negras de plumas
  for (int i = 0; i < 8; i++) { float f = float(i) / 7.; vec3 s = q - vec3(.16 + .5 * (1. - f), .1 + .42 * (1. - f) * (1. - f), -.26 - .03 * f);
    s.xy *= gira(-(.75 + .35 * acc - f * (1.9 + .2 * acc)) - .06 * sin(t * 1.6) - .35 * acc * sin(tq * 8.)); float l = .42 - .08 * f;
    c = une(c, vec4(vec3(.17, .17, .23) + .2 * smoothstep(.02, .0, abs(s.y)), elipse(s - vec3(l, 0, 0), vec3(l, .085, .03)) * .6)); }
  // túnica de asceta y pantalón abombado
  float r = length(p.xz), a = atan(p.x, p.z);
  c = une(c, vec4(vec3(.86, .8, .66), elipse(p - vec3(0, -.05, 0), vec3(.33, .36, .24))));
  float pan = funde(elipse(q - vec3(.17, -.62, 0), vec3(.22, .34, .22)), cono(q, vec3(.17, -.75, 0), vec3(.18, -1.0, 0), .16, .08), .08) + .012 * sin(a * 18.);
  c = une(c, vec4(vec3(.2, .24, .4), pan * .85));
  c = une(c, vec4(vec3(.5, .34, .18), max(length(vec2(r - .28, p.y + .3)) - .06, -9.)));
  // sandalias altas de un solo diente
  c = une(c, vec4(vec3(.4, .24, .12), min(caja(q - vec3(.19, -1.07, .05), vec3(.1, .025, .2)), caja(q - vec3(.19, -1.17, .05), vec3(.09, .09, .035)))));
  // pompones
  vec3 po = vec3(q.x - .13, p.y + .02 - .2 * clamp(round((p.y + .02) / .2), -1., 0.), p.z - .25);
  c = une(c, vec4(vec3(.85, .4, .12), esfera(po, .065) + .012 * sin(po.x * 60.) * sin(po.y * 60.)));
  // mangas; la derecha agita el abanico
  float ag = .6 * acc * sin(tq * 7.);
  vec3 codo = L > 0. ? vec3(.58, -.02, .12) : vec3(.5, -.2, .1), mano = L > 0. ? vec3(.72, .28, .28) : vec3(.4, -.32, .3);
  c = une(c, vec4(vec3(.86, .8, .66), cono(q, vec3(.3, .1, 0), codo, .13, .17)));
  c = une(c, vec4(vec3(.68, .13, .09), min(cono(q, codo, mano, .08, .07), esfera(q - mano, .085))));
  vec3 f = p - vec3(.72, .28, .32); f.xy *= gira(-.15 + ag);
  c = une(c, vec4(vec3(.4, .24, .12), capsula(f, vec3(0, -.12, 0), vec3(0, .1, 0), .03)));
  for (int i = 0; i < 7; i++) { float k = float(i) - 3.; vec3 s = f - vec3(0, .08, 0); s.xy *= gira(k * .33); c = une(c, vec4(mix(vec3(.2, .4, .22), vec3(.55, .65, .3), smoothstep(.1, .5, s.y)), elipse(s - vec3(0, .25, 0), vec3(.06, .25, .018)) * .7)); }
  // cabeza roja de nariz larguísima
  vec3 k = (p - vec3(0, .52, .05)) / .33; vec3 o = vec3(abs(k.x), k.yz);
  float ca = craneo(k);
  ca = funde(ca, cono(k, vec3(0, -.12, .85), vec3(0, .08, 1.95), .2, .13), .12);
  ca = funde(ca, elipse(o - vec3(.4, .3, .78), vec3(.36, .12, .18)), .1);
  c = une(c, vec4(rostro(k, vec3(.72, .13, .09), vec3(1., .8, .2), 1.), ca * .33 * .7));
  // cejas, bigote, barba y melena blancas
  float bl = elipse(o - vec3(.42, .44, .86), vec3(.34, .09, .12));
  bl = min(bl, cono(o, vec3(.12, -.42, .85), vec3(.6, -.62, .6), .09, .03));
  bl = min(bl, cono(k, vec3(0, -.75, .6), vec3(.1 * sin(t), -1.75, .6), .3, .03));
  bl = min(bl, max(elipse(k - vec3(0, .1, -.25), vec3(1.15, 1.05, .95)), -elipse(k - vec3(0, -.2, .9), vec3(.98, 1.1, .85))));
  c = une(c, vec4(vec3(.88, .86, .82), (bl + .03 * sin(k.x * 22. + k.y * 9.) * sin(k.y * 13.)) * .33 * .65));
  // gorrito negro
  c = une(c, vec4(vec3(.06), (caja(k - vec3(0, .98, .45), vec3(.2, .16, .2)) - .06) * .33));
  // torbellino de hojas
  if (tq < 3.) for (int i = 0; i < 9; i++) { float h = float(i), u = fract(tq * .5 + h * .111), w = h * 2.4 + tq * 5.; vec3 b = p - vec3((.5 + .6 * u) * cos(w), -1. + 1.9 * u, (.5 + .4 * u) * sin(w)); b.xy *= gira(w * 2.); c = une(c, vec4(mix(vec3(.75, .3, .1), vec3(.85, .6, .15), fract(h * .37)), elipse(b, vec3(.07, .012, .04) * acc + .001) * .7)); }
  return c;
}` },
{ id:'oni', codigo:
`vec4 criatura(vec3 p, float t) {
  vec3 g = p; p.xz *= gira(.3 * sin(t * .3) + .1); p.y += .02;
  float L = sign(p.x); vec3 q = vec3(abs(p.x), p.yz);
  vec3 piel = vec3(.56, .12, .08) * (.9 + .12 * sin(p.x * 23.) * sin(p.y * 21.) * sin(p.z * 22.));
  // torso enorme y musculoso
  float d = elipse(p - vec3(0, .0, 0), vec3(.48, .42, .3));
  d = funde(d, elipse(q - vec3(.2, .12, .2), vec3(.22, .16, .14)), .05);
  d = funde(d, elipse(p - vec3(0, -.35, .02), vec3(.34, .3, .26)), .1);
  vec2 ab = vec2(q.x - .09, p.y + .28 - .13 * clamp(round((p.y + .28) / .13), -1., 1.));
  d -= .02 * smoothstep(.07, .02, length(ab)) * step(.1, p.z);
  d = funde(d, elipse(q - vec3(.5, .2, 0), vec3(.2, .19, .2)), .08);
  // piernas
  d = funde(d, cono(q, vec3(.2, -.6, 0), vec3(.27, -.88, .05), .2, .14), .08);
  d = funde(d, cono(q, vec3(.27, -.88, .05), vec3(.28, -1.14, .0), .14, .1), .05);
  d = funde(d, elipse(q - vec3(.29, -1.18, .1), vec3(.13, .07, .2)), .05);
  // brazos: el derecho levanta el garrote y golpea
  float gol = acc * smoothstep(-.2, .9, sin(tq * 4. - 1.2));
  vec3 codo = L > 0. ? mix(vec3(.86, .12, .1), vec3(.78, .0, .4), gol) : vec3(.72, -.15, .08), mano = L > 0. ? mix(vec3(.84, .5, .22), vec3(.6, -.3, .62), gol) : vec3(.46, -.4, .24);
  float br = funde(cono(q, vec3(.5, .18, 0), codo, .17, .13), cono(q, codo, mano, .14, .1), .05);
  d = funde(d, min(br, esfera(q - mano, .13)), .04);
  vec4 c = vec4(piel, d * .7);
  // taparrabos de tigre
  float a = atan(p.x, p.z), r = length(p.xz);
  c = une(c, vec4(mix(vec3(.85, .58, .16), vec3(.1, .06, .03), step(.4, sin(p.y * 38. + 3. * sin(a * 4.)))), max(r - .36 - .06 * sin(a * 7.) * step(p.y, -.62), abs(p.y + .58) - .16 - .05 * sin(a * 5.)) * .75));
  // garrote con púas
  vec3 m = p - mix(vec3(.84, .5, .24), vec3(.6, -.3, .66), gol); m.xy *= gira(mix(.35, 1.2, gol)); m.yz *= gira(mix(0., .7, gol));
  float ga = cono(m, vec3(0, -.25, 0), vec3(0, .62, 0), .06, .17); ga = max(ga, m.y - .66);
  vec3 u = ronda(m, 6.); u.y -= .17 * clamp(round((u.y - .36) / .17), -1., 1.) + .36;
  ga = min(ga, cono(u, vec3(.13, 0, 0), vec3(.24, 0, 0), .045, .004));
  c = une(c, vec4(vec3(.2, .21, .23), ga * .8));
  // cabeza con cuernos, melena y colmillos
  vec3 k = (p - vec3(0, .62, .06)) / .31; vec3 o = vec3(abs(k.x), k.yz);
  float ca = funde(craneo(k), elipse(k - vec3(0, -.45, .55), vec3(.62, .4, .45)), .2);
  ca = funde(ca, elipse(o - vec3(.38, .3, .8), vec3(.36, .13, .18)), .08); ca = funde(ca, elipse(k - vec3(0, -.18, 1.), vec3(.24, .18, .18)), .1);
  c = une(c, vec4(rostro(k, vec3(.6, .13, .09), vec3(1.1, .7, .1), 1.), ca * .31 * .7));
  c = une(c, vec4(vec3(.82, .76, .6), min(curva(o, vec3(.42, .75, .4), vec3(.75, 1.15, .5), vec3(.6, 1.65, .55), .2, .02), cono(o, vec3(.27, -.62, .9), vec3(.3, -.46, .98), .07, .012)) * .31 * .8));
  float me = max(elipse(k - vec3(0, .25, -.3), vec3(1.25, 1.1, 1.)), -elipse(k - vec3(0, -.25, .95), vec3(1.0, 1.05, .9)));
  for (int i = 0; i < 6; i++) { float f = float(i); vec3 b = vec3(1.1 * cos(f * 1.05), .35 + .55 * sin(f * .63), -.35); me = min(me, cono(k, b * .7, b * 1.35, .3, .02)); }
  c = une(c, vec4(vec3(.13, .1, .1), (me + .03 * sin(k.x * 25.) * sin(k.y * 23.)) * .31 * .6));
  // suelo que se resquebraja
  float gr = grieta(g * 1.4) * smoothstep(1.2, .2, length(g.xz - vec2(.35, .35)));
  return une(c, vec4(mix(vec3(.24, .19, .16), vec3(1.8, .6, .15), gr * acc), (elipse(g + vec3(0, 1.36, 0), vec3(1.25, .18, .95)) + .02 * sin(g.x * 17.) * sin(g.z * 19.)) * .8));
}` },
{ id:'kappa', codigo:
`vec4 criatura(vec3 p, float t) {
  vec3 g = p; p.xz *= gira(.4 * sin(t * .3) + .25); p.y += .08;
  // reverencia al tocarlo
  float re = .75 * smoothstep(0., 1., acc) * (.5 - .5 * cos(6.2832 * clamp(tq / 2.6, 0., 1.)));
  vec3 ej = vec3(0, -.75, 0); vec3 b = p - ej; b.yz *= gira(re); b += ej;
  vec3 q = vec3(abs(p.x), p.yz), w = vec3(abs(b.x), b.yz);
  float pi = .012 * sin(p.x * 33.) * sin(p.y * 35.) * sin(p.z * 31.);
  vec3 ver = mix(vec3(.2, .4, .2), vec3(.12, .26, .14), smoothstep(.3, .7, sin(p.x * 9.) * sin(p.y * 8. + 1.) * sin(p.z * 9.)));
  // piernas palmeadas
  float d = cono(q, vec3(.18, -.6, 0), vec3(.25, -1.0, .05), .15, .08);
  d = min(d, max(elipse(q - vec3(.28, -1.1, .18), vec3(.17, .05, .22)) + .02 * sin((q.x - .28) * 40.) * step(.18, q.z), -9.));
  // barriga y brazos
  float to = elipse(b - vec3(0, -.3, .02), vec3(.36, .46, .3));
  vec3 mano = b.x > 0. ? vec3(.52, -.12, .42) : vec3(.46, -.55, .25);
  to = funde(to, cono(w, vec3(.3, -.02, .02), vec3(.54, -.28, .16), .12, .09), .08); to = min(to, min(cono(w, vec3(.54, -.28, .16), mano, .09, .065), elipse(w - mano, vec3(.1, .09, .06))));
  d = funde(d, to, .06);
  float pa = smoothstep(.03, .07, b.z - .1 - .6 * w.x * w.x) * step(b.y, -.02) * step(w.x, .28); float ra = step(.25, fract(b.y * 7.));
  vec4 c = vec4(mix(ver, mix(vec3(.75, .68, .4), vec3(.62, .54, .3), ra), pa), (d + pi) * .7);
  // caparazón
  vec3 s = b - vec3(0, -.28, -.2); float cp = max(elipse(s, vec3(.48, .54, .28)), s.z - .06);
  vec2 hx = vec2(s.x * 5., s.y * 5. + .5 * mod(floor(s.x * 5. + .5), 2.)); float bo = smoothstep(.34, .46, max(abs(fract(hx.x + .5) - .5), abs(fract(hx.y) - .5)));
  c = une(c, vec4(mix(vec3(.36, .26, .12), vec3(.16, .11, .06), bo), (cp + .015 * bo) * .75));
  // cabeza con pico, plato de agua y flequillo
  vec3 k = (b - vec3(0, .42, .06)) / .34; vec3 o = vec3(abs(k.x), k.yz);
  float ca = craneo(k); ca = funde(ca, elipse(o - vec3(.4, .05, .72), vec3(.3, .3, .25)), .1);
  c = une(c, vec4(ver * 1.15, ca * .34 * .75));
  c = une(c, ojo((o - vec3(.4, .08, .8)) * .34, .16, vec3(.9, .7, .15), vec3(.1, 0, 1), ver));
  float pc = max(elipse(k - vec3(0, -.4, .85), vec3(.42, .2, .42)), -9.); float com = smoothstep(.05, .02, abs(k.y + .4));
  c = une(c, vec4(mix(vec3(.85, .66, .2), vec3(.4, .26, .06), com), pc * .34 * .85));
  vec3 pl = k - vec3(0, .95, 0); float pr = length(pl.xz);
  c = une(c, vec4(vec3(.85, .82, .74), max(abs(pl.y - .25 * pr * pr) - .05, pr - .62) * .34 * .8));
  c = une(c, vec4(vec3(.35, .8, 1.05), max(abs(pl.y - .12) - .03, pr - .5 * (1. - .7 * acc)) * .34));
  float fl = 9.; for (int i = 0; i < 1; i++) { vec3 u = ronda(k - vec3(0, .82, 0), 13.); fl = cono(u, vec3(.6, 0, 0), vec3(1.15, -.42, 0), .16, .03); }
  c = une(c, vec4(vec3(.1, .1, .07), fl * .34 * .8));
  // pepino en la mano
  vec3 pe = b - vec3(.52, -.02, .46); pe.xy *= gira(-.3);
  c = une(c, vec4(mix(vec3(.15, .38, .12), vec3(.4, .6, .25), step(.6, sin(atan(pe.x, pe.z) * 9.))), capsula(pe, vec3(0, -.16, 0), vec3(0, .2, 0), .065) + .008 * sin(pe.y * 60.)));
  // agua que se derrama
  if (tq < 3.) for (int i = 0; i < 8; i++) { float f = float(i), u = fract(tq * .9 + f * .125); vec3 x = p - vec3(.14 * sin(f * 2.4), .35 - .3 * u - 1.1 * u * u, .55 + .35 * u); c = une(c, vec4(vec3(.5, 1.1, 1.4), esfera(x, .045 * re * (1. - .5 * u)))); }
  // charca
  float l = length(g.xz * vec2(.9, 1.)); c = une(c, vec4(mix(vec3(.1, .3, .34), vec3(.2, .34, .14), smoothstep(.98, 1.03, l)), max(max(g.y + 1.12 + .015 * sin(l * 22. - t * 3.), -1.3 - g.y), l - 1.25) * .8));
  for (int i = 0; i < 6; i++) { float f = float(i); vec3 j = g - vec3(-1. + .12 * f, -1.1, -.4 + .1 * sin(f * 4.)); j.x -= .06 * sin(t + f) * (j.y + .1); c = une(c, vec4(mix(vec3(.25, .42, .18), vec3(.4, .24, .12), step(.55, j.y) * step(j.y, .8)), min(capsula(j, vec3(0), vec3(0, .9, 0), .015), capsula(j, vec3(0, .58, 0), vec3(0, .76, 0), .04)))); }
  return c;
}` },
{ id:'raijin', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.25 * sin(t * .3)); p.y -= .04 * sin(t * 1.2) + .02;
  float L = sign(p.x); vec3 q = vec3(abs(p.x), p.yz);
  float hit = acc * (.5 + .5 * sin(tq * 12.));
  vec4 c = vec4(0, 0, 0, 9);
  // aro de tambores
  vec3 a = vec3(p.x, p.z + .42, p.y - .22); vec3 u = ronda(a, 8.); float n = gajo(a, 8.);
  if (abs(n + 2.) > .5) {
    vec3 s = u - vec3(.98, 0, 0); float r = length(s.xz);
    float ta = max(r - .19, abs(s.y) - .12) - .015;
    float to = step(abs(r - .1), .02) + step(abs(sin(atan(s.z, s.x) * 1.5 + .5)), .18) * step(r, .1);
    c = une(c, vec4(mix(mix(vec3(.85, .78, .62), vec3(.15, .1, .4), min(to, 1.) * step(0., s.y)), vec3(.5, .1, .07), step(abs(s.y), .1)) + acc * step(.5, fract(n * .37 + tq * 4.)) * vec3(.6, .6, .3) * step(.1, s.y), ta));
  }
  c = une(c, vec4(vec3(.5, .1, .07), max(length(vec2(length(a.xz) - .98, a.y)) - .035, -.62 - a.z)));
  // cuerpo
  vec3 piel = vec3(.3, .4, .5);
  float d = elipse(p - vec3(0, .02, 0), vec3(.37, .34, .24)); d = funde(d, elipse(q - vec3(.16, .12, .17), vec3(.17, .13, .1)), .05);
  d = funde(d, elipse(p - vec3(0, -.3, .02), vec3(.27, .26, .2)), .1);
  d = funde(d, cono(q, vec3(.16, -.55, 0), vec3(.36, -.75, .18), .16, .12), .08); d = funde(d, cono(q, vec3(.36, -.75, .18), vec3(.26, -1.05, .02), .12, .08), .05); d = funde(d, elipse(q - vec3(.28, -1.1, .08), vec3(.09, .06, .16)), .04);
  // brazos en alto con mazos
  vec3 codo = vec3(.66, .1, .12), mano = vec3(.72 - .06 * hit, .52 - .3 * hit * (L > 0. ? 1. : .4), .26 + .12 * hit);
  d = funde(d, cono(q, vec3(.36, .16, 0), codo, .14, .1), .06); d = min(d, min(cono(q, codo, mano, .1, .075), esfera(q - mano, .095)));
  c = une(c, vec4(piel * (.9 + .12 * sin(p.x * 25.) * sin(p.y * 23.)), d * .75));
  vec3 m = q - mano; m.xy *= gira(.45);
  c = une(c, vec4(vec3(.8, .62, .28), min(capsula(m, vec3(0, -.1, 0), vec3(0, .22, 0), .028), min(elipse(m - vec3(0, .27, 0), vec3(.075, .1, .075)), elipse(m + vec3(0, .15, 0), vec3(.06, .08, .06))))));
  // falda
  float r = length(p.xz), an = atan(p.x, p.z);
  c = une(c, vec4(mix(vec3(.6, .3, .1), vec3(.85, .65, .25), step(.7, sin(an * 12.))), max(r - .27 - .22 * (-.4 - p.y) - .03 * sin(an * 8.), abs(p.y + .52) - .14) * .75));
  // cinta que flota en arco
  vec3 k2 = p - vec3(0, .3, -.2); float ci = max(length(vec2(length(k2.xy * vec2(.8, 1.)) - .62 - .03 * sin(an * 6. + t * 2.), k2.z)) - .035, -k2.y - .1);
  c = une(c, vec4(vec3(.2, .45, .35), ci * .7));
  // cabeza fiera, pelo de punta
  vec3 k = (p - vec3(0, .52, .05)) / .28; vec3 o = vec3(abs(k.x), k.yz);
  float ca = funde(craneo(k), elipse(k - vec3(0, -.5, .55), vec3(.6, .38, .42)), .2); ca = funde(ca, elipse(o - vec3(.38, .32, .8), vec3(.36, .12, .18)), .08);
  vec3 ro = rostro(k, piel * 1.15, vec3(1.2, .9, .2), 1.); float bo = length((k.xy + vec2(0, .56)) / vec2(.3, .1 + .16 * acc)); ro = mix(ro, vec3(.3, .04, .04), smoothstep(1., .85, bo) * step(.2, k.z)); ro = mix(ro, vec3(.9), smoothstep(1., .9, bo) * step(.3, abs(fract(k.x * 7.) - .5)) * step(.2, k.z) * step(-.52, k.y));
  c = une(c, vec4(ro, ca * .28 * .7));
  float pe = 9.; for (int i = 0; i < 7; i++) { float f = float(i) - 3.; pe = min(pe, cono(k, vec3(f * .2, .55, -.15), vec3(f * .42 + .08 * sin(t * 3. + f), 1.75 - .12 * f * f, -.3), .34, .02)); }
  pe = min(pe, max(elipse(k - vec3(0, .2, -.3), vec3(1.1, 1., .9)), -elipse(k - vec3(0, -.25, .9), vec3(.95, 1., .85))));
  c = une(c, vec4(vec3(.65, .22, .1), pe * .28 * .7));
  c = une(c, vec4(vec3(.85, .8, .65), cono(o, vec3(.35, .75, .4), vec3(.5, 1.25, .5), .13, .01) * .28));
  // nubes de tormenta
  for (int i = 0; i < 6; i++) { float f = float(i); vec3 b = p - vec3(-.95 + .38 * f, -1.2 + .06 * sin(f * 3.), .1 * cos(f * 5.)); c = une(c, vec4(mix(vec3(.16, .18, .24), vec3(.45, .48, .55), smoothstep(-.15, .2, b.y)) + acc * step(.6, sin(tq * 19. + f)) * .5, (elipse(b, vec3(.34, .22, .3)) + .02 * sin(b.x * 14. + t) * sin(b.y * 15.)) * .7)); }
  // rayos
  if (tq < 3.) for (int i = 0; i < 3; i++) { float f = float(i) - 1.; vec3 b = p - vec3(f * .95, 0, .2); float se = floor(tq * 9.) + f * 7.; float zz = .12 * (fract(sin(floor(b.y * 5.) * 12.9 + se * 3.) * 43.) - .5) * 2.; float zn = .12 * (fract(sin(floor(b.y * 5. + 1.) * 12.9 + se * 3.) * 43.) - .5) * 2.;
    float ra = max(length(vec2(b.x - mix(zz, zn, fract(b.y * 5.)), b.z)) - .03 * acc * step(.35, fract(sin(se) * 9.)), abs(b.y) - 1.15); c = une(c, vec4(vec3(1.7, 1.7, 1.2), ra * .5 + .02 * (1. - acc))); }
  return c;
}` },
{ id:'yukionna', codigo:
`vec4 criatura(vec3 p, float t) {
  vec3 g = p; p.y -= .06 * sin(t * .9); p.xz *= gira(.25 * sin(t * .3));
  vec3 q = vec3(abs(p.x), p.yz); float L = sign(p.x);
  float r = length(p.xz * vec2(1., 1.1)), a = atan(p.x, p.z);
  // kimono blanco que se deshace en niebla
  float R = .22 + .3 * smoothstep(.1, -1., p.y) + .025 * sin(a * 9. + p.y * 4. - t * 1.5) * smoothstep(0., -1., p.y);
  float d = max(r - R, max(p.y - .16, -1.2 - p.y));
  float nie = smoothstep(-.45, -1.15, p.y); float mo = fract(sin(dot(floor(vec3(a * 7., p.y * 17. + t * 2., 0)), vec3(12.9, 78.2, 37.7))) * 4375.);
  float cr = smoothstep(.03, .01, abs(p.x - .35 * (.16 - p.y) * .6)) + smoothstep(.03, .01, abs(p.x + .35 * (.16 - p.y) * .6)); cr *= step(-.25, p.y) * step(0., p.z);
  float copos = step(.86, sin(a * 16.) * sin(p.y * 19.)) * step(p.y, -.3);
  vec4 c = vec4(mix(mix(vec3(.82, .88, .95), vec3(.5, .62, .8), min(cr, 1.)), vec3(.55, .75, .95), copos), d * .7); if (mo < nie) c.w = max(c.w, .03);
  // obi
  c = une(c, vec4(vec3(.35, .5, .75) * (.85 + .2 * step(.5, fract(a * 5.))), max(r - .27, abs(p.y + .22) - .09)));
  // mangas; una mano sopla escarcha
  vec3 mano = L > 0. ? mix(vec3(.38, -.2, .36), vec3(.2, .28, .5), smoothstep(0., 1., acc)) : vec3(.36, -.28, .32);
  float ma = cono(q, vec3(.22, .06, 0), mano - vec3(0, .02, .06), .1, .17);
  vec3 cl = q - mano + vec3(0, .22, .1); ma = funde(ma, caja(cl, vec3(.05, .16, .1)) - .05, .06);
  c = une(c, vec4(vec3(.84, .9, .97), ma * .8)); c = une(c, vec4(vec3(.92, .9, .95), esfera(q - mano, .065)));
  // rostro pálido y pelo larguísimo al viento
  vec3 k = (p - vec3(0, .5, .04)) / .32;
  vec3 ro = rostro(k, vec3(.93, .92, .97), vec3(.35, .75, 1.1), .1); float lab = length((k.xy + vec2(0, .5)) / vec2(.11, .05 + .04 * acc)); ro = mix(ro, vec3(.35, .45, .75), smoothstep(1., .8, lab) * step(.2, k.z));
  c = une(c, vec4(ro, craneo(k) * .32 * .8));
  float pe = max(elipse(k - vec3(0, .14, -.1), vec3(1.07, 1.02, 1.05)), -elipse(k - vec3(0, -.38, .95), vec3(.68, .95, .72))) * .32 * .75;
  for (int i = 0; i < 7; i++) { float f = float(i) - 3.; vec3 b0 = vec3(f * .09, .62, -.2), e = vec3(.35 * f * .5 + .5 + .12 * sin(t * 1.3 + f), -.75 + .06 * f * f + .1 * sin(t + f * 2.), -.35) + acc * vec3(.35, .5 + .1 * sin(tq * 7. + f), 0); pe = min(pe, curva(p, b0, vec3(f * .16 - .05, -.1, -.42), e, .13, .02)); }
  pe = min(pe, cono(q, vec3(.29, .6, .12), vec3(.26, -.02, .2), .055, .02));
  c = une(c, vec4(vec3(.12, .13, .2) + .18 * smoothstep(.85, 1., sin(a * 26. + p.y * 3.)), pe));
  // copos: con el gesto, ventisca
  for (int i = 0; i < 14; i++) { float f = float(i); if (f > 6.5 && acc < .02) break; float u = fract(t * .13 + f * .071 + step(6.5, f) * tq * .5);
    vec3 b = g - vec3(1.15 * sin(f * 2.4) + (.4 + 1.4 * acc) * (u - .5), 1.1 - 2.2 * u, .55 * cos(f * 2.4)); b.xy *= gira(t + f); vec3 s = vec3(b.x, b.z, b.y); s = ronda(s, 6.); c = une(c, vec4(vec3(.85, 1.1, 1.3), min(capsula(s, vec3(0), vec3(.07, 0, 0), .012), esfera(b, .022)) + step(6.5, f) * .03 * (1. - acc))); }
  // carámbanos que brotan
  for (int i = 0; i < 5; i++) { float f = float(i); vec3 b = g - vec3(-.9 + .45 * f, -1.2, .3 * sin(f * 3.)); c = une(c, vec4(vec3(.55, .85, 1.05), cono(b, vec3(0), vec3(.06 * sin(f * 5.), .12 + .5 * acc * (.6 + .4 * sin(f * 2.)), 0), .09, .006))); }
  return une(c, vec4(vec3(.82, .87, .94), (elipse(g + vec3(0, 1.36, 0), vec3(1.2, .16, .85)) + .012 * sin(g.x * 21.) * sin(g.z * 23.)) * .8));
}` },
{ id:'jiraiya', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.35 * sin(t * .3) - .25); vec3 g = p; float s = acc * max(0., sin(clamp(tq / 1.4, 0., 1.) * 3.1416)); p.y -= .35 * s - .12;
  vec3 q = vec3(abs(p.x), p.yz);
  // sapo gigante
  float ve = 0.; vec3 vp = p * 6.; ve = smoothstep(.35, .7, sin(vp.x) * sin(vp.y + 1.) * sin(vp.z));
  float d = elipse(p - vec3(0, -.75, -.05), vec3(.85, .45, .75));
  d = funde(d, elipse(p - vec3(0, -.5, .4), vec3(.66, .3, .4)), .15);
  d = funde(d, esfera(q - vec3(.42, -.26, .4), .19), .08);
  d = funde(d, cono(q, vec3(.6, -.8, -.25), vec3(.95, -.75 - .2 * s, .15), .26, .16), .1); d = funde(d, cono(q, vec3(.95, -.75 - .2 * s, .15), vec3(.82, -1.1 - .25 * s, -.1), .15, .1), .06);
  d = funde(d, elipse(q - vec3(.92, -1.12 - .25 * s, .15), vec3(.18, .06, .28)), .05);
  d = funde(d, cono(q, vec3(.5, -.85, .45), vec3(.55, -1.1, .65), .14, .09), .08); d = funde(d, elipse(q - vec3(.58, -1.13, .74), vec3(.14, .05, .16)), .05);
  float sac = .5 + .5 * sin(t * 1.8); d = funde(d, elipse(p - vec3(0, -.82, .6), vec3(.4, .2, .18) * (1. + .12 * sac)), .1);
  float bul = .03 * ve;
  vec3 piel = mix(vec3(.4, .26, .14), vec3(.55, .4, .2), ve); piel = mix(piel, vec3(.78, .7, .5), smoothstep(-.7, -.85, p.y - .2 * (p.z - .4)) * step(.1, p.z) * step(q.x, .62));
  float bo = smoothstep(.03, .0, abs(p.y + .56 - .1 * q.x * q.x)) * step(.3, p.z) * step(q.x, .62); piel = mix(piel, vec3(.15, .06, .05), bo);
  vec4 c = vec4(piel, (d - bul) * .65);
  c = une(c, ojo(q - vec3(.45, -.24, .47), .26, vec3(.95, .7, .1), vec3(.25, 0, 1), vec3(.42, .28, .15)));
  // el ninja encima
  vec3 b = p - vec3(0, .0, -.08); vec3 w = vec3(abs(b.x), b.yz); float r = length(b.xz), a = atan(b.x, b.z), L = sign(b.x);
  // piernas cruzadas y ropa
  c = une(c, vec4(vec3(.16, .2, .3), funde(elipse(w - vec3(.2, -.2, .1), vec3(.24, .12, .18)), elipse(b - vec3(0, -.18, 0), vec3(.24, .14, .2)), .08)));
  float to = elipse(b - vec3(0, .06, 0), vec3(.23, .28, .17)); float sol = smoothstep(.035, .01, abs(abs(b.x) - .3 * (b.y + .12))) * step(0., b.z);
  c = une(c, vec4(mix(vec3(.2, .28, .42), vec3(.75, .62, .3), sol), to)); c = une(c, vec4(vec3(.55, .1, .08), length(vec2(r - .2, b.y + .1)) - .05));
  // manos haciendo un sello
  c = une(c, vec4(vec3(.2, .28, .42), cono(w, vec3(.22, .18, 0), vec3(.34, .02, .16), .09, .1))); c = une(c, vec4(vec3(.85, .62, .48), min(cono(w, vec3(.34, .02, .16), vec3(.04, .08, .32), .07, .05), capsula(w, vec3(.02, .08, .33), vec3(.015, .2, .34), .03))));
  // pergamino a la espalda y bufanda
  vec3 ro = b - vec3(0, .15, -.24); ro.xy *= gira(.5); c = une(c, vec4(mix(vec3(.85, .76, .55), vec3(.5, .1, .08), step(.3, abs(ro.x))), max(length(ro.yz) - .1, abs(ro.x) - .4)));
  c = une(c, vec4(vec3(.6, .12, .1), length(vec2(length(b.xz) - .15, b.y - .3)) - .06));
  vec3 bu = b - vec3(.1, .3, -.15); c = une(c, vec4(vec3(.6, .12, .1), min(curva(bu, vec3(0), vec3(.35, .1, -.1), vec3(.75, -.05 + .1 * sin(t * 2.5), -.1), .05, .025), curva(bu, vec3(0), vec3(.3, 0, -.1), vec3(.62, -.22 + .1 * sin(t * 2.5 + 1.), -.12), .045, .02))));
  // cabeza con coleta de época
  vec3 k = (b - vec3(0, .58, .03)) / .28; c = une(c, vec4(rostro(k, vec3(.88, .66, .52), vec3(.2, .12, .06), .6), craneo(k) * .28 * .8));
  float pe = max(elipse(k - vec3(0, .16, -.14), vec3(1.07, .98, 1.02)), -elipse(k - vec3(0, -.38, .95), vec3(.88, .95, .75)));
  pe = min(pe, flequillo(k)); pe = min(pe, curva(k, vec3(0, .95, -.3), vec3(0, 1.75, -.5), vec3(.1 * sin(t * 2.), 1.25, -1.25), .22, .06));
  c = une(c, vec4(vec3(.09, .08, .09), pe * .28 * .75)); c = une(c, vec4(vec3(.55, .1, .08), (length(vec2(length((k - vec3(0, 1.08, -.34)).xz) - .16, k.y - 1.08)) - .06) * .28));
  // humo al invocar
  if (tq < 3.) for (int i = 0; i < 9; i++) { float f = float(i), u = clamp(tq / 1.8 - .03 * f, 0., 1.); vec3 x = g - vec3((.5 + .8 * u) * cos(f * .7), -.95 + .5 * u, (.5 + .6 * u) * sin(f * .7)); c = une(c, vec4(vec3(.8, .78, .76), (esfera(x, .24 * sin(3.1416 * u)) + .03 * sin(x.x * 17.) * sin(x.y * 16. + f)) * .7 + .05 * step(u, .01))); }
  return c;
}` }
);
