// Tercera tanda de la galería. Cada `codigo` es GLSL: el dibujo de una obra.
// acc (0 a 1) y tq (segundos desde el toque) dan la animación al tocarla.
CRIATURAS.push(
// ---------- Espacio ----------
{ id:'luna', codigo:
`vec4 criatura(vec3 p, float t) {
  vec3 l = p; p.xz *= gira(t * .1); p.xy *= gira(.15);
  vec3 n = p / max(length(p), .01);
  float d = esfera(p, .92), borde = 0., hondo = 0.;
  for (int i = 0; i < 14; i++) {
    float f = float(i);
    vec3 c = normalize(vec3(sin(f * 2.4), .9 * cos(f * 1.63), cos(f * 2.4)));
    float R = .09 + .16 * fract(sin(f * 7.3) * 43.7), e = length(n - c) / R;
    hondo += smoothstep(1., .75, e); borde += smoothstep(.16, .0, abs(e - 1.));
  }
  float mar = smoothstep(.2, .7, sin(n.x * 3.1 + 1.) * sin(n.y * 2.7 + .5) + .5 * sin(n.z * 4.3 + n.x * 2.));
  float gra = .006 * sin(p.x * 47.) * sin(p.y * 43.) * sin(p.z * 45.);
  vec3 tono = mix(vec3(.66, .64, .6), vec3(.36, .36, .37), mar) * (1. - .22 * min(hondo, 1.)) + .12 * min(borde, 1.);
  // al tocarla: eclipse rojizo
  tono = mix(tono, tono * vec3(1.15, .42, .26), acc);
  vec4 c = vec4(tono, (d + .03 * min(hondo, 1.) - .018 * min(borde, 1.) + gra) * .8);
  if (tq < 3.2) { vec3 s = l - vec3(mix(2.2, -2.2, clamp(tq / 3., 0., 1.)), .1, 1.15); c = une(c, vec4(vec3(.02), esfera(s, .34))); }
  return c;
}` },
{ id:'cometa', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xy *= gira(-.55); p.x += .55;
  vec3 q = p; q.xz *= gira(t * .5); q.xy *= gira(t * .3);
  float g = grieta(q * 2.2);
  float d = elipse(q, vec3(.3, .24, .25)) + .04 * sin(q.x * 11.) * sin(q.y * 13.) * sin(q.z * 12.);
  vec4 c = vec4(mix(vec3(.42, .46, .52), vec3(.8, 1.35, 1.6), g), d * .7);
  // cola de hielo y cola de polvo, en hebras
  float L = 1.9 + .5 * acc;
  for (int i = 0; i < 2; i++) {
    float s = float(i);
    vec3 k = p; k.y -= s * .28 * k.x * k.x * .6;
    float x = clamp(k.x / L, 0., 1.), a = atan(k.z, k.y);
    float R = (.24 - .1 * s) * (1. - x) + (.12 + .12 * s) * x;
    float he = sin(a * 5. + k.x * 4. - t * 3.) * sin(a * 9. - k.x * 7.) ;
    float co = max(length(k.yz) - R * (.55 + .45 * he) * (1. + .3 * acc), max(k.x - L, -k.x + .08));
    float m = step(.25 + .6 * x, fract(sin(dot(floor(vec3(k.x * 13. - t * 9., a * 3., s)), vec3(12.9, 78.2, 37.7))) * 4375.));
    vec3 t1 = i == 0 ? mix(vec3(1.2, 1.6, 1.8), vec3(.2, .5, .95), x) : mix(vec3(1.5, 1.2, .8), vec3(.5, .35, .2), x);
    c = une(c, vec4(t1, m > .5 ? co * .5 : max(co * .5, .03)));
  }
  // fragmentos
  for (int i = 0; i < 6; i++) { float f = float(i), u = fract(t * .3 + f * .17);
    c = une(c, vec4(vec3(1.1, 1.3, 1.5), esfera(p - vec3(.3 + 1.5 * u, .25 * sin(f * 2.4) * (1. + acc * 1.5), .2 * cos(f * 2.4)), .03 * (1. - u) * (1. + acc)))); }
  return c;
}` },
{ id:'galaxia', codigo:
`vec4 criatura(vec3 p, float t) {
  p.yz *= gira(-.75); p.xz *= gira(giro); p.xy *= gira(.15); p.xz *= gira(t * .12 + vuelta());
  float r = length(p.xz), a = atan(p.z, p.x);
  // brazos en espiral
  float br = .5 + .5 * cos(2. * (a - 2.6 * log(r + .08)));
  float alto = .03 + .035 * br + .16 * exp(-r * r * 14.) + .25 * acc * br * smoothstep(.2, .8, r) * (.5 + .5 * sin(a * 3. + tq * 4.));
  vec3 id = floor(p * 24.);
  float h = fract(sin(dot(id, vec3(12.9, 78.2, 37.7))) * 4375.5);
  float dens = .25 + .7 * br * smoothstep(1.35, .2, r) + exp(-r * r * 9.);
  float d = max(abs(p.y) - alto, r - 1.35);
  vec3 c = mix(vec3(.35, .5, 1.05), vec3(1.1, .6, .9), smoothstep(.3, .9, fract(h * 7.)));
  c = mix(c, vec3(1.8, 1.45, .95), exp(-r * r * 8.)) * (.55 + .75 * br);
  vec4 k = vec4(c, d * .5);
  if (h > dens) k.w = max(k.w, .03);
  return une(k, vec4(vec3(1.9, 1.6, 1.1), elipse(p, vec3(.2, .13, .2) * (1. + .25 * acc))));
}` },
// ---------- Naturaleza ----------
{ id:'palmera', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.35 * sin(t * .2)); p.y += .1;
  vec3 g = p;
  float v = acc * .16 * sin(tq * 5.);
  // islote y mar
  float is = elipse(p + vec3(0, 1.12, 0), vec3(.85, .22, .7)) + .01 * sin(p.x * 40.) * sin(p.z * 37.);
  vec4 c = vec4(vec3(.7, .56, .36), is * .8);
  float mar = p.y + 1.13 + .025 * sin(p.x * 7. + t * 1.5) * sin(p.z * 6. - t);
  c = une(c, vec4(mix(vec3(.06, .3, .36), vec3(.7, .88, .86), smoothstep(.09, .0, is)), max(max(mar, -1.3 - p.y), length(p.xz * vec2(.85, 1.)) - 1.15) * .7));
  // tronco curvo con anillos
  p.x += (.03 * sin(t * .9) + v) * (p.y + 1.1) * (p.y + 1.1) * .5;
  vec3 cima = vec3(.3, .52, 0);
  float tr = curva(p, vec3(-.25, -1.05, 0), vec3(-.3, -.1, 0), cima, .11, .065);
  c = une(c, vec4(vec3(.42, .3, .18) * (.8 + .3 * step(.5, fract(p.y * 11.))), (tr + .012 * sin(p.y * 69.)) * .8));
  // hojas plumosas
  for (int i = 0; i < 9; i++) {
    float f = float(i), an = f * .698 + .2;
    vec3 h = p - cima; h.xz *= gira(an);
    float cae = .75 + .25 * sin(f * 2.3);
    h.y += cae * h.x * h.x * .85 - .32 * h.x + .05 * sin(t * 1.3 + f) * h.x;
    float ala = .17 * sin(clamp(h.x / .85, 0., 1.) * 3.0);
    float foli = max(max(abs(h.y + .8 * abs(h.z) * .5) - .016, abs(h.z) - ala), max(h.x - .84, -h.x));
    float pin = (.42 - abs(fract(h.x * 13. - abs(h.z) * 9.) - .5)) * .06;
    c = une(c, vec4(mix(vec3(.14, .34, .12), vec3(.42, .58, .22), smoothstep(0., .8, h.x)), max(foli, pin - .012) * .55));
  }
  // cocos; uno cae al tocarla
  for (int i = 0; i < 3; i++) { float f = float(i);
    vec3 o = cima + vec3(.11 * cos(f * 2.1), -.08, .11 * sin(f * 2.1));
    if (i == 0 && tq < 3.) { float s = max(0., tq - .4); o.y = max(-.86, o.y - 2.6 * s * s); }
    c = une(c, vec4(vec3(.3, .19, .1), esfera(p - o, .085))); }
  return c;
}` },
{ id:'cascada', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.3 * sin(t * .2)); p.y += .02;
  // peñasco con hueco para el agua
  float ro = .07 * sin(p.x * 7. + 2. * sin(p.y * 5.)) * sin(p.y * 8.) + .04 * sin(p.z * 13. + p.x * 11.) * sin(p.y * 17.) + .03 * abs(sin(p.x * 19. + p.y * 5.));
  float d = caja(p - vec3(0, .1, -.35), vec3(.85, .85, .32)) - .1 + ro;
  d = funde(d, elipse(p - vec3(-.75, -.5, .0), vec3(.42, .6, .45)) + ro, .15);
  d = funde(d, elipse(p - vec3(.8, -.6, .05), vec3(.36, .5, .42)) + ro, .15);
  float musgo = smoothstep(.55, .75, p.y + ro * 2.) + .5 * smoothstep(.2, .7, sin(p.x * 9.) * sin(p.y * 7.));
  vec4 c = vec4(mix(vec3(.3, .28, .26), vec3(.2, .36, .14), clamp(musgo, 0., 1.)), d * .6);
  // cortina de agua
  float fl = p.y * 4. + t * (3.5 + 2. * acc);
  float hil = sin(p.x * 34. + .8 * sin(fl)) * .5 + .5 * sin(p.x * 19. + fl * 2.);
  float an = .22 + .08 * acc + .05 * sin(p.y * 3.);
  float ag = max(max(abs(p.z - .12 - .16 * smoothstep(.9, -.7, p.y)) - .03 - .02 * hil, abs(p.x) - an), max(p.y - .98, -.88 - p.y));
  c = une(c, vec4(mix(vec3(.28, .5, .62), vec3(.92, .97, 1.), smoothstep(-.2, .9, hil + .4 * sin(fl * 3.))), ag * .5));
  c = une(c, vec4(vec3(.45, .65, .72), max(max(abs(p.y - .98) - .035, abs(p.x) - an), abs(p.z + .12) - .3)));
  // poza y espuma
  float po = p.y + .9 + .02 * sin(length(p.xz - vec2(0, .3)) * 22. - t * 6.);
  c = une(c, vec4(vec3(.1, .34, .4), max(max(po, -1.15 - p.y), length((p.xz - vec2(0, .25)) * vec2(.85, 1.2)) - 1.)));
  for (int i = 0; i < 6; i++) { float f = float(i); vec3 b = p - vec3(.28 * sin(f * 2.4 + t), -.84 + .05 * sin(t * 4. + f), .34 + .1 * cos(f * 2.4));
    c = une(c, vec4(vec3(.93, .96, 1.), esfera(b, .1 + .05 * acc + .02 * sin(t * 6. + f * 2.)) * .8)); }
  // arcoíris al tocarla
  if (tq < 3.2) { vec3 q = p - vec3(0, -.75, .45); float r = length(q.xy); float ar = max(max(abs(r - .78) - .09 * acc, abs(q.z) - .012), -q.y);
    vec3 col = .6 + .6 * cos(6.28 * ((r - .69) / .18 * .8 + vec3(.5, .83, .17))); float tra = step(.5, fract(atan(q.y, q.x) * 14.));
    c = une(c, vec4(col * 1.4, max(ar, (tra - .5) * .03) * .7 + .04 * (1. - acc))); }
  return c;
}` },
{ id:'cristales', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.3 * sin(t * .25) + giro * 0.); p.y += .1;
  float ro = elipse(p + vec3(0, 1., 0), vec3(1., .3, .8)) + .07 * sin(p.x * 8.) * sin(p.y * 9. + 1.) * sin(p.z * 8.) + .03 * sin(p.x * 21. + p.z * 17.);
  vec4 c = vec4(vec3(.22, .2, .24), ro * .6);
  for (int i = 0; i < 10; i++) {
    float f = float(i);
    float an = f * 2.4, inc = i == 0 ? 0. : .28 + .05 * f;
    vec3 q = p - vec3(.07 * f * cos(an) * .9, -.85, .06 * f * sin(an) * .9);
    q.xz *= gira(an); q.xy *= gira(inc);
    float H = (i == 0 ? 1.65 : 1.2 - .075 * f + .2 * sin(f * 3.)) * (1. + .12 * acc * sin(tq * 6. - f));
    float W = i == 0 ? .21 : .16 - .007 * f;
    // prisma de seis caras con punta
    vec3 s = q; float a = atan(s.z, s.x); a = mod(a, 1.0472) - .5236;
    float r = length(s.xz) * cos(a);
    float d = max(max(r - W, (r + (s.y - H) * .45) * .91), -s.y - .1);
    float cara = floor(atan(q.z, q.x) / 1.0472 + 3.);
    vec3 col = f < 4. ? vec3(.5, .28, .8) : f < 7. ? vec3(.2, .55, .7) : vec3(.8, .4, .55);
    float luz = .55 + .45 * fract(cara * .37) + .35 * smoothstep(.0, H, q.y);
    float pul = acc * pow(.5 + .5 * sin(q.y * 5. - tq * 8. + f), 3.);
    float ven = smoothstep(.94, 1., sin(q.y * 21. + q.x * 9. + f * 3.));
    c = une(c, vec4(col * luz * (1. + 1.4 * pul) + .25 * ven, d * .85));
  }
  return c;
}` },
{ id:'copo', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.6 * sin(t * .4)); p.xy *= gira(t * .12 + .5 * vuelta() * .3333); p.y -= 0.;
  // seis brazos iguales
  vec3 s = vec3(p.x, p.z, p.y); s = ronda(s, 6.); s.z = abs(s.z);
  float ex = 1. + .12 * acc * sin(tq * 6.);
  s.x /= ex;
  float d = cono(s, vec3(0), vec3(1.18, 0, 0), .05, .022);
  d = min(d, cono(s, vec3(.38, 0, 0), vec3(.62, 0, .26), .038, .016));
  d = min(d, cono(s, vec3(.62, 0, 0), vec3(.9, 0, .31), .036, .014));
  d = min(d, cono(s, vec3(.86, 0, 0), vec3(1.05, 0, .2), .03, .012));
  d = min(d, cono(s, vec3(.75, 0, .145), vec3(.74, 0, .29), .022, .01));
  // corazón hexagonal calado
  vec3 h = p; float a = atan(h.y, h.x); a = mod(a + .5236, 1.0472) - .5236; float r = length(h.xy) * cos(a);
  d = min(d, max(abs(r - .3) - .022, abs(h.z) - .03));
  d = min(d, max(abs(r - .16) - .018, abs(h.z) - .03));
  d = min(d, esfera(p, .07));
  d = min(d, esfera(s - vec3(1.2, 0, 0), .045));
  float br = .5 + .5 * sin(s.x * 14. - t * 2. - acc * tq * 9.);
  vec4 c = vec4(mix(vec3(.5, .72, .95), vec3(.92, .97, 1.1), br) + acc * br * vec3(.5, .6, .7), d * .85);
  // copos pequeños que caen
  for (int i = 0; i < 8; i++) { float f = float(i), u = fract(t * .12 + f * .13 + acc * .0);
    c = une(c, vec4(vec3(.8, .9, 1.1), esfera(p - vec3(1.1 * sin(f * 2.1), 1.2 - 2.4 * u, .5 * cos(f * 3.)), .018 + .014 * acc))); }
  return c;
}` },
// ---------- Lugares ----------
{ id:'torii', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.4 + .25 * sin(t * .2)); p.y += .12;
  vec3 q = vec3(abs(p.x), p.yz);
  vec3 rojo = vec3(.62, .14, .08);
  // postes, travesaños y dintel curvo
  float d = cono(q, vec3(.66, -1.05, 0), vec3(.6, .75, 0), .1, .085);
  d = min(d, caja(p - vec3(0, .36, 0), vec3(.86, .06, .06)));
  d = min(d, caja(p - vec3(0, .55, 0), vec3(.07, .15, .05)));
  vec4 c = vec4(rojo * (.9 + .1 * sin(p.y * 50.)), d * .9);
  float cu = .1 * p.x * p.x;
  c = une(c, vec4(rojo, (caja(p - vec3(0, .74 + cu, 0), vec3(1.08, .06, .09))) * .9));
  c = une(c, vec4(vec3(.1, .09, .09), (caja(p - vec3(0, .85 + cu, 0), vec3(1.2, .045, .15))) * .9));
  c = une(c, vec4(vec3(.1), max(q.y + .86, cono(q, vec3(.66, -1.1, 0), vec3(.65, -.8, 0), .13, .12))));
  c = une(c, vec4(vec3(.75, .6, .25), caja(p - vec3(0, .55, .07), vec3(.1, .12, .015))));
  // cuerda sagrada y papeles
  float so = .12 * p.x * p.x * 1.6;
  float cr = max(length(vec2(p.y - .2 - so, p.z - .1)) - .045 - .012 * sin(p.x * 40. + atan(p.z - .1, p.y) * 2.), abs(p.x) - .6);
  c = une(c, vec4(vec3(.72, .6, .36), cr * .7));
  float n = clamp(round(p.x / .24), -2., 2.), zx = p.x - n * .24;
  vec3 w = vec3(zx + .02 * sin(p.y * 20. + t * 2.), p.y - .03, p.z - .1 - .06 * sin(t * 2. + n) * (.2 - p.y) - acc * .25 * (.2 - p.y) * sin(tq * 6. + n));
  c = une(c, vec4(vec3(.92), caja(w, vec3(.035, .13, .008)) * .8));
  // agua y reflejo
  float mar = p.y + .98 + .015 * sin(p.x * 9. + t * 1.4) * sin(p.z * 8. - t) + .03 * acc * sin(length(p.xz) * 14. - tq * 8.);
  float ref = step(abs(abs(p.x) - .66), .12) * step(.3, sin(p.z * 14. + t * 2.)) * step(0., p.z);
  c = une(c, vec4(mix(vec3(.08, .2, .3), vec3(.5, .13, .08), ref * .7), max(max(mar, -1.2 - p.y), length(p.xz * vec2(.9, 1.)) - 1.2) * .8));
  // sol de fondo que crece al tocarla
  return une(c, vec4(vec3(1.5, .5, .25), max(length(p.xy - vec2(0, -.15)) - .36 - .14 * acc, abs(p.z + .95) - .02)));
}` },
{ id:'puente', codigo:
`vec4 criatura(vec3 p, float t) {
  p.yz *= gira(-.16); p.xz *= gira(giro); p.xz *= gira(.5 + .2 * sin(t * .2)); p.y += .12;
  vec3 q = vec3(abs(p.x), p.y, abs(p.z));
  vec3 rojo = vec3(.58, .17, .1);
  float ond = .05 * acc * sin(p.x * 3. - tq * 5.);
  // torres
  float d = caja(vec3(q.x - .62, q.y - .1, q.z - .17), vec3(.06 - .015 * p.y, .85, .045));
  vec3 tr = vec3(q.x - .62, q.y - .42 * clamp(round((q.y - .05) / .42), -1., 2.) - .05, p.z);
  d = min(d, caja(tr, vec3(.05, .035, .17)));
  vec4 c = vec4(rojo, d);
  // tablero con calzada
  vec3 k = p; k.y -= ond;
  float raya = step(.5, fract(p.x * 5.)) * step(abs(p.z), .012);
  c = une(c, vec4(mix(vec3(.2), vec3(.8, .7, .3), raya), caja(k + vec3(0, .3, 0), vec3(1.5, .02, .17))));
  c = une(c, vec4(rojo, max(caja(k + vec3(0, .37, 0), vec3(1.5, .045, .19)), (abs(fract(p.x * 6. + .5 * step(0., p.z)) - .5) - .36) * -.1)));
  // cables parabólicos y tirantes
  float y1 = q.x < .62 ? -.22 + 2.95 * p.x * p.x : .91 - 1.35 * (q.x - .62);
  c = une(c, vec4(rojo * 1.15, max(length(vec2((p.y - y1 - ond) * .45, q.z - .17)) - .016, q.x - 1.5)));
  float x = p.x - .1 * round(p.x / .1);
  c = une(c, vec4(rojo * 1.1, max(max(length(vec2(x, q.z - .17)) - .008, p.y - y1 - ond), -.3 + ond - p.y)));
  // agua y niebla
  float mar = p.y + .86 + .02 * sin(p.x * 7. + t * 1.5) * sin(p.z * 8. - t);
  c = une(c, vec4(vec3(.1, .24, .32), max(max(mar, -1.1 - p.y), max(q.x - 1.45, q.z - .85))));
  c = une(c, vec4(vec3(.3), caja(vec3(q.x - .62, p.y + .82, p.z), vec3(.16, .1, .28)) - .03));
  // coches
  for (int i = 0; i < 4; i++) { float f = float(i), s = i < 2 ? 1. : -1.; float u = fract(t * .12 + f * .5 + acc * .0) * 3. - 1.5;
    vec3 a = p - vec3(u * s, -.245 + .05 * acc * sin(u * s * 3. - tq * 5.), .08 * s);
    c = une(c, vec4(i == 0 ? vec3(.2, .35, .6) : i == 1 ? vec3(.8, .75, .6) : i == 2 ? vec3(.7, .5, .1) : vec3(.5), caja(a, vec3(.055, .022, .03)) - .008));
    c = une(c, vec4(vec3(1.8, 1.6, 1.), esfera(a - vec3(.06 * s, 0, 0), .016))); }
  // barco
  vec3 b = p - vec3(.0, -.8 + .01 * sin(t * 2.), -.75 + 1.5 * fract(t * .05)); float bc = max(elipse(b, vec3(.07, .07, .17)), b.y - .02);
  return une(c, vec4(vec3(.85), min(bc, caja(b - vec3(0, .06, -.03), vec3(.035, .04, .05)))));
}` },
{ id:'iglu', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.12 + .25 * sin(t * .22)); p.y += .35;
  float r = length(p);
  // bóveda de bloques
  float fi = asin(clamp(p.y / max(r, .01), -1., 1.)), fila = floor(fi * 5.2);
  float a = atan(p.z, p.x) * (4.5 - .6 * fila) + .5 * mod(fila, 2.) * 1.;
  float junta = max(smoothstep(.1, .02, abs(fract(fi * 5.2) - .5) * -1. + .5), smoothstep(.08, .02, .5 - abs(fract(a) - .5)));
  float d = max(abs(r - .82) - .06 + .018 * junta, -p.y - .02);
  // túnel de entrada
  vec3 q = p - vec3(0, 0, .85);
  float tu = max(max(length(q.xy) - .4, abs(q.z) - .28), -q.y - .02);
  d = min(d, tu);
  float hu = max(length(q.xy) - .28, abs(q.z) - .45);
  d = max(d, -hu);
  float ju2 = smoothstep(.06, .02, abs(abs(fract(q.z * 3.5) - .5) - .5) / 3.5);
  vec4 c = vec4(mix(vec3(.82, .88, .95), vec3(.45, .58, .72), max(junta, ju2 * step(tu, .01)) * .7), d * .75);
  // luz cálida dentro
  c = une(c, vec4(vec3(1.6, .85, .35) * (.85 + .15 * sin(t * 5.) + .25 * acc), elipse(p - vec3(0, .12, .1), vec3(.3, .28, .25))));
  // nieve, trineo y pingüino
  float ni = elipse(p + vec3(0, .32, 0), vec3(1.35, .32, 1.35)) + .02 * sin(p.x * 11.) * sin(p.z * 12.) + .008 * sin(p.x * 41. + p.z * 37.);
  c = une(c, vec4(vec3(.86, .9, .96), ni * .8));
  vec3 k = p - vec3(.95 - .2 * acc, .2 + .07 * acc * abs(sin(tq * 9.)), .75); k.xz *= gira(-.5); k.xy *= gira(.12 * sin(t * 2.) + .25 * acc * sin(tq * 9.));
  float pi = elipse(k, vec3(.13, .22, .12));
  float bl = smoothstep(.02, .06, k.z - .4 * abs(k.x)) * step(k.y, .08);
  c = une(c, vec4(mix(vec3(.07, .08, .1), vec3(.92), bl), pi));
  vec3 m = vec3(abs(k.x), k.yz);
  c = une(c, vec4(vec3(.07, .08, .1), elipse(k - vec3(0, .22, .01), vec3(.09, .09, .09))));
  c = une(c, vec4(vec3(.85, .5, .12), min(cono(k, vec3(0, .21, .08), vec3(0, .2, .16), .025, .006), elipse(m - vec3(.06, -.22, .05), vec3(.05, .02, .07)))));
  vec3 al = m - vec3(.12, .06, 0); al.xy *= gira(-.35 - .9 * acc * abs(sin(tq * 9.)));
  c = une(c, vec4(vec3(.07, .08, .1), elipse(al + vec3(0, .1, 0), vec3(.025, .13, .06))));
  c = une(c, vec4(vec3(1.), esfera(m - vec3(.035, .245, .08), .014)));
  // auroras al tocar
  if (tq < 3.2) { vec3 w = p - vec3(0, 1.15 + .12 * sin(p.x * 3. + t * 2.), -.7 + .12 * sin(p.x * 5. - t)); float au = max(max(abs(w.z) - .012, abs(w.y) - .28 * acc), abs(p.x) - 1.25);
    c = une(c, vec4(mix(vec3(.3, 1.4, .8), vec3(.6, .5, 1.5), smoothstep(-.1, .25, w.y)), max(au, (step(.5, fract(p.x * 13.)) - .5) * .03) * .6 + .05 * (1. - acc))); }
  return c;
}` },
{ id:'moai', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.5 * sin(t * .25) - .2); p.y += .02;
  vec3 g = p;
  p.y -= .12 * acc * abs(sin(tq * 5.)) ; p.xy *= gira(.08 * acc * sin(tq * 5.));
  vec3 q = vec3(abs(p.x), p.yz);
  // cabeza alargada
  float d = caja(p - vec3(0, .18, -.05), vec3(.33 - .06 * p.y, .72, .3)) - .1;
  d = funde(d, elipse(p - vec3(0, .72, .02), vec3(.4, .3, .4)), .15);
  // ceja, nariz, pómulos, boca y mentón
  d = funde(d, caja(p - vec3(0, .5, .36), vec3(.36, .06, .08)) - .05, .06);
  float na = cono(p, vec3(0, .42, .38), vec3(0, -.06, .56), .08, .13);
  d = funde(d, na, .06);
  d = funde(d, elipse(q - vec3(.09, -.1, .48), vec3(.08, .06, .09)), .04);
  d = funde(d, caja(p - vec3(0, -.3, .38), vec3(.22, .035, .05)) - .04, .05);
  d = max(d, -(caja(p - vec3(0, -.3, .5), vec3(.2, .008 + .05 * acc * abs(sin(tq * 5.)), .1)) - .008));
  d = funde(d, elipse(p - vec3(0, -.56, .3), vec3(.3, .16, .2)), .1);
  d = max(d, -elipse(q - vec3(.2, .32, .46), vec3(.14, .1, .12)));
  // orejas largas y cuerpo
  d = funde(d, caja(q - vec3(.45, .12, -.06), vec3(.04, .38, .1)) - .04, .05);
  d = funde(d, elipse(p - vec3(0, -1.1, -.1), vec3(.72, .45, .5)), .18);
  float pi = .015 * sin(p.x * 23.) * sin(p.y * 21.) * sin(p.z * 24.) + .008 * sin(p.x * 51. + p.y * 47.) * sin(p.z * 49.);
  float gr = grieta(p * .9 + 1.);
  float liq = smoothstep(.3, .8, sin(p.x * 5. + 2.) * sin(p.y * 4.) * sin(p.z * 6. + 1.));
  vec4 c = vec4(mix(mix(vec3(.36, .33, .29), vec3(.5, .5, .36), liq), vec3(.16, .14, .12), gr * .6), (d + pi) * .65);
  // ojos que se encienden
  c = une(c, vec4(mix(vec3(.15, .13, .12), vec3(1.9, 1.2, .5), acc), elipse(q - vec3(.2, .32, .38), vec3(.07, .045, .04))));
  return une(c, vec4(vec3(.24, .32, .14), (elipse(g + vec3(0, 1.28, 0), vec3(1.25, .2, 1.)) + .015 * sin(g.x * 35.) * sin(g.z * 33.)) * .8));
}` },
// ---------- Objetos ----------
{ id:'gramofono', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.45 + .3 * sin(t * .25)); p.y += .08;
  float pul = 1. + .06 * acc * sin(tq * 14.);
  // caja de madera con molduras
  float d = caja(p + vec3(0, .82, 0), vec3(.6, .2, .52)) - .03;
  d = min(d, caja(p + vec3(0, 1.04, 0), vec3(.68, .04, .6)) - .015);
  d = min(d, caja(p + vec3(0, .6, 0), vec3(.65, .025, .57)) - .015);
  vec4 c = vec4(vec3(.36, .18, .08) * (.85 + .2 * sin(p.x * 30. + 3. * sin(p.y * 9.))), d);
  // disco girando y aguja
  vec3 k = p + vec3(0, .53, 0); float r = length(k.xz), a = atan(k.z, k.x) + t * 2. + acc * tq * 3.;
  float su = step(.4, fract(r * 34.)) * .06;
  vec3 di = mix(vec3(.05) + su + .12 * pow(.5 + .5 * cos(2. * (a - t * 2.)), 6.), mix(vec3(.6, .12, .1), vec3(.85, .7, .4), step(.0, sin(a * 2.))), step(r, .16));
  c = une(c, vec4(di, max(r - .47, abs(k.y) - .02)));
  c = une(c, vec4(vec3(.75, .6, .3), curva(p, vec3(-.5, -.4, -.3), vec3(-.15, -.32, -.35), vec3(-.05, -.46, .05), .035, .025)));
  c = une(c, vec4(vec3(.8), max(length((p - vec3(-.05, -.45, .08)).xy) - .07, abs(p.z - .08) - .03)));
  // bocina acampanada, con gajos
  vec3 h = p - vec3(-.35, -.35, -.35);
  float cu = curva(p, vec3(-.5, -.42, -.3), vec3(-.62, .05, -.45), vec3(-.2, .25, -.3), .05, .09);
  c = une(c, vec4(vec3(.7, .52, .2), cu));
  vec3 b = p - vec3(-.2, .25, -.3); vec3 ej = normalize(vec3(.62, .5, .6));
  float z = dot(b, ej); vec3 rr = b - ej * z; float R = length(rr);
  vec3 u = normalize(cross(ej, vec3(0, 1, 0))); float an = atan(dot(rr, cross(u, ej)), dot(rr, u));
  float perfil = (.09 + .12 * z + .62 * z * z * z) * pul + .012 * cos(an * 10.) * z;
  float bo = max(max(abs(R - perfil) * .55 - .014, z - .92), -z);
  c = une(c, vec4(mix(vec3(.5, .34, .12), vec3(.9, .7, .32), .5 + .5 * cos(an * 10.)), bo * .75));
  // manivela y notas
  vec3 m = p - vec3(.68, -.82, .1); m.yz *= gira(t + acc * tq * 4.);
  c = une(c, vec4(vec3(.7), min(capsula(m, vec3(-.1, 0, 0), vec3(.08, 0, 0), .02), min(capsula(m, vec3(.08, 0, 0), vec3(.08, .18, 0), .02), capsula(m, vec3(.08, .18, 0), vec3(.2, .18, 0), .035)))));
  return une(c, notas(p - vec3(.35, .55, .35)));
}` },
{ id:'espada', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.45 * sin(t * .3)); p.y += .05;
  vec3 g = p;
  p.y -= .55 * acc;
  // hoja con acanaladura
  float an = .105 - .018 * p.y * -1.;
  float ho = max(max(abs(p.x) * .9 + abs(p.z) * 2.2 - .115, p.y - .42), -p.y - 1.1);
  float ac = smoothstep(.03, .01, abs(p.x)) * step(p.y, .3);
  float run = step(.55, fract(sin(floor(p.y * 14.) * 91.7) * 47.)) * step(abs(fract(p.y * 14.) - .5), .32) * step(abs(p.x), .028) * step(p.y, .3);
  vec4 c = vec4(mix(mix(vec3(.62, .66, .7), vec3(.35, .38, .42), ac), vec3(.5, 1.5, 1.8), run * (.35 + .65 * acc)), ho * .6);
  // guarda, puño y pomo
  vec3 q = vec3(abs(p.x), p.yz);
  float gu = curva(q, vec3(0, .46, 0), vec3(.25, .46, 0), vec3(.4, .4, 0), .055, .04);
  gu = min(gu, esfera(q - vec3(.41, .39, 0), .06));
  c = une(c, vec4(vec3(.72, .55, .22), gu));
  float cue = capsula(p, vec3(0, .5, 0), vec3(0, .86, 0), .05) + .008 * sin(p.y * 70. + atan(p.z, p.x) * 2.);
  c = une(c, vec4(vec3(.28, .13, .07), cue * .9));
  c = une(c, vec4(vec3(.72, .55, .22), esfera(p - vec3(0, .95, 0), .085)));
  c = une(c, vec4(mix(vec3(.6, .08, .1), vec3(1.9, .5, .4), acc), elipse(p - vec3(0, .46, .06), vec3(.06, .06, .035))));
  // peñasco
  float ro = elipse(g + vec3(0, .85, 0), vec3(.72, .5, .6)) + .09 * sin(g.x * 6. + 1.) * sin(g.y * 7.) * sin(g.z * 6.) + .03 * sin(g.x * 19.) * sin(g.y * 17. + g.z * 15.);
  float mu = smoothstep(-.62, -.45, g.y + .1 * sin(g.x * 9.) * sin(g.z * 8.));
  float gr = smoothstep(.05, .015, abs(g.x - .06 * sin(g.y * 14.))) * step(0., g.z) * step(-.85, g.y);
  c = une(c, vec4(mix(mix(vec3(.3, .29, .28), vec3(.24, .36, .16), mu), mix(vec3(.08), vec3(.6, 1.6, 1.9), acc), gr), ro * .65));
  // haz de luz al salir
  if (tq < 3.2) for (int i = 0; i < 8; i++) { float f = float(i), u = fract(tq * .7 + f * .125); c = une(c, vec4(vec3(.7, 1.5, 1.8), esfera(g - vec3(.35 * cos(f * 2.4 + tq), -.4 + 1.5 * u, .35 * sin(f * 2.4 + tq)), .03 * acc * (1. - u)))); }
  return c;
}` },
{ id:'farol', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xy *= gira(.07 * sin(t * 1.1) + .4 * acc * sin(tq * 4.2) * exp(-tq * .5)); p.xz *= gira(.4 + .3 * sin(t * .25)); p.y += .12;
  vec3 q = ronda(p, 6.);
  float r = length(p.xz);
  // base, techo y asa
  float ap = q.x;
  float d = max(ap - .46, abs(p.y + .82) - .07) - .015;
  d = min(d, max(ap - .36, abs(p.y + .96) - .06) - .015);
  d = min(d, max(ap - .48, abs(p.y - .42) - .035) - .012);
  d = min(d, max((ap - .46 + (p.y - .45) * .85) * .76, max(p.y - .82, .45 - p.y)));
  d = min(d, max(r - .12, abs(p.y - .88) - .07));
  vec3 as = p - vec3(0, 1.12, 0); d = min(d, length(vec2(length(as.xy) - .17, as.z)) - .025);
  // varillas
  vec3 v = p; v.xz *= gira(.5236); v = ronda(v, 6.);
  d = min(d, capsula(v, vec3(.46, -.78, 0), vec3(.48, .4, 0), .03));
  d = min(d, max(abs(ap - .41) - .012, max(abs(p.y + .2) - .015, 0.)));
  vec4 c = vec4(vec3(.3, .22, .12) * (.8 + .3 * sin(p.y * 37.)), d * .85);
  // vidrio: motas que brillan
  float vi = max(abs(ap - .41) - .008, abs(p.y + .2) - .58);
  float mo = step(.86, fract(sin(dot(floor(vec2(atan(p.z, p.x) * 9., p.y * 15.)), vec2(12.9, 78.2))) * 4375.));
  c = une(c, vec4(vec3(.75, .6, .35), mo > .5 ? vi * .7 : max(vi * .7, .02)));
  // vela y llama
  c = une(c, vec4(vec3(1., .85, .6), max(r - .12, abs(p.y + .55) - .2)));
  vec3 f = p - vec3(.02 * sin(t * 6.), -.16, 0); float A = 1. + .7 * acc;
  float ll = funde(elipse(f, vec3(.09, .14, .09) * A), cono(f, vec3(0), vec3(0, .28 * A, 0), .07 * A, .004), .05);
  c = une(c, vec4(mix(vec3(1.9, 1.5, .7), vec3(1.8, .8, .25), smoothstep(.05, .25, f.y)), ll * .8));
  // polillas
  for (int i = 0; i < 3; i++) { float k = float(i), an = t * (1.3 + .3 * k) + k * 2.1; vec3 b = p - vec3((.75 + .12 * acc) * cos(an), .1 + .35 * sin(t * 1.7 + k * 2.), .75 * sin(an)); b.xz *= gira(-an);
    vec3 w = vec3(abs(b.z), b.y, b.x); w.xy *= gira(.7 * sin(t * 18. + k)); c = une(c, vec4(vec3(.75, .68, .55), min(elipse(w - vec3(.06, 0, 0), vec3(.06, .008, .04)) * .7, elipse(b, vec3(.035, .014, .014))))); }
  return c;
}` },
{ id:'reloj', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xy *= gira(.12 * sin(t * 1.2) + .25 * acc * sin(tq * 5.)); p.xz *= gira(.4 * sin(t * .4)); p.y += .22;
  float r = length(p.xy), a = atan(p.x, p.y);
  // caja con canto estriado
  float d = max(r - .85, abs(p.z) - .13) - .04;
  vec4 c = vec4(vec3(.72, .55, .24) * (.85 + .15 * step(0., sin(a * 90.)) * step(.86, r)), d);
  c = une(c, vec4(vec3(.85, .68, .34), length(vec2(r - .83, p.z - .17)) - .05));
  // esfera con números, minutero y segundero pequeño
  float h12 = a / .5236, n = round(h12), da = (h12 - n) * .5236;
  float marca = step(abs(da * r), mod(n, 3.) == 0. ? .03 : .015) * step(abs(r - .66), .08);
  float min_ = step(abs(fract(a / .10472 + .5) - .5), .12) * step(abs(r - .755), .012);
  vec2 s = p.xy + vec2(0, .34); float sr = length(s);
  float seg = smoothstep(.012, .004, abs(sr - .17)) + step(sr, .17) * step(abs(fract(atan(s.x, s.y) / .5236 + .5) - .5), .08) * step(.13, sr);
  vec3 cara = mix(vec3(.9, .86, .76), vec3(.12, .09, .07), clamp(marca + min_ + seg, 0., 1.));
  c = une(c, vec4(cara, max(r - .8, abs(p.z - .17) - .02)));
  // agujas: se aceleran al tocarlo
  float T = t * .25 + 4. * vuelta();
  vec2 m = p.xy * gira(-T), o = p.xy * gira(-T / 12. - 1.);
  float ag = max(trazo(m, vec2(0, -.12), vec2(0, .66)) - .022, abs(p.z - .205) - .008);
  ag = min(ag, max(trazo(o, vec2(0, -.1), vec2(0, .42)) - .035 + .03 * step(.3, o.y), abs(p.z - .215) - .008));
  vec2 g = s * gira(-floor(t * 2.) * .1047 * 2.); ag = min(ag, max(trazo(g, vec2(0), vec2(0, .14)) - .012, abs(p.z - .2) - .006));
  c = une(c, vec4(vec3(.08, .1, .2), min(ag, max(r - .05, abs(p.z - .215) - .025))));
  // corona y cadena
  c = une(c, vec4(vec3(.8, .62, .3), max(length(p.xz) - .09, abs(p.y - .98) - .07) + .008 * sin(atan(p.z, p.x) * 18.)));
  vec3 k = p - vec3(0, 1.14, 0); c = une(c, vec4(vec3(.8, .62, .3), length(vec2(length(k.xy) - .12, k.z)) - .03));
  vec3 e = p - vec3(0, 1.28, 0); float ni = clamp(round(e.y / .13), 0., 3.); e.y -= ni * .13; if (mod(ni, 2.) > .5) e.xz = e.zx;
  return une(c, vec4(vec3(.75, .58, .28), length(vec2(length(vec2(e.x * 1.4, e.y)) - .06, e.z)) - .02));
}` },
{ id:'corona', codigo:
`vec4 criatura(vec3 p, float t) {
  p.yz *= gira(-.18); p.xz *= gira(giro); p.xz *= gira(t * .25); p.y += .12; p.y -= .25 * acc * sin(3.1416 * clamp(tq / 2.6, 0., 1.));
  float r = length(p.xz), a = atan(p.z, p.x);
  // aro con filigrana
  float d = max(abs(r - .78) - .035, abs(p.y + .5) - .16);
  d = min(d, length(vec2(r - .78, p.y + .66)) - .06);
  d = min(d, length(vec2(r - .78, p.y + .34)) - .045);
  vec3 q = ronda(p, 8.);
  // puntas
  vec3 k = q - vec3(.79, -.35, 0);
  float al = .62; float pu = max(max(abs(k.x - .14 * k.y) - .03, abs(k.z) - .27 * (1. - k.y / al)), max(-k.y, k.y - al));
  d = min(d, pu * .8);
  d = min(d, esfera(q - vec3(.89, .32, 0), .075));
  float fil = .5 + .5 * sin(a * 32.) * sin(p.y * 40.);
  vec4 c = vec4(mix(vec3(.55, .38, .12), vec3(.95, .74, .32), fil), d * .85);
  // terciopelo
  c = une(c, vec4(vec3(.4, .05, .09) * (.8 + .3 * sin(a * 9.)), (elipse(p + vec3(0, .25, 0), vec3(.72, .5, .72)) + .03 * cos(a * 8.)) * .85));
  // gemas
  float n = mod(gajo(p, 8.), 3.); vec3 ge = abs(n) < .5 ? vec3(.75, .08, .14) : abs(abs(n) - 1.) < .5 ? vec3(.1, .4, .75) : vec3(.12, .6, .3);
  float br = acc * pow(.5 + .5 * sin(tq * 12. - gajo(p, 8.) * 1.6), 2.);
  c = une(c, vec4(ge * (1. + .3 * step(.5, fract(p.y * 30. + a * 9.))) + br * vec3(1.2), elipse(q - vec3(.81, -.5, 0), vec3(.06, .1, .09))));
  c = une(c, vec4(ge * 1.1 + br * vec3(1.2), elipse(q - vec3(.86, -.1, 0), vec3(.05, .075, .06))));
  // cruz y orbe
  c = une(c, vec4(vec3(.9, .7, .3), min(esfera(p - vec3(0, .32, 0), .1), min(caja(p - vec3(0, .52, 0), vec3(.03, .13, .03)), caja(p - vec3(0, .55, 0), vec3(.1, .03, .03))))));
  // armiño
  float ar = length(vec2(r - .8, (p.y + .78) * .9)) - .13 + .02 * sin(a * 40.) * sin(p.y * 37.);
  float mo = step(.8, sin(a * 14. + step(-.78, p.y) * 3.)) * step(abs(p.y + .78), .06);
  return une(c, vec4(mix(vec3(.9, .88, .84), vec3(.06), mo), ar * .75));
}` },
{ id:'televisor', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.4 * sin(t * .3) - .15); p.y += .1;
  // mueble de madera y patas
  float d = caja(p, vec3(.9, .62, .38)) - .06;
  vec4 c = vec4(vec3(.36, .2, .1) * (.85 + .2 * sin(p.y * 40. + 2. * sin(p.x * 5.))), d);
  vec3 q = vec3(abs(p.x), p.y, abs(p.z));
  c = une(c, vec4(vec3(.28, .15, .08), cono(q, vec3(.65, -.62, .22), vec3(.8, -1.1, .3), .05, .03)));
  // pantalla abombada
  vec2 s = p.xy - vec2(-.2, .02);
  float ms = max(abs(s.x) - .58, abs(s.y) - .47);
  c = une(c, vec4(vec3(.1), max(max(abs(s.x) - .62, abs(s.y) - .51), abs(p.z - .42) - .04) - .02));
  vec3 ima;
  if (tq < 3.) {
    // al tocarlo: cambia de canal y sale un programa
    float nie = step(tq, .5);
    vec2 u = s * 3.2; float sol = step(length(u - vec2(.6, .7)), .38); float mont = step(u.y, .25 * sin(u.x * 2.1 + 1.) + .15 * sin(u.x * 5.) - .2);
    float pe = step(length((u - vec2(-1.6 + tq * 1.2, .5 + .1 * sin(tq * 6.))) * vec2(1., 1.8)), .2);
    ima = mix(mix(vec3(.5, .9, 1.4), vec3(1.6, 1.3, .5), sol), vec3(.3, .8, .35), mont); ima = mix(ima, vec3(1.5), pe);
    ima = mix(ima, vec3(1.3) * step(.5, fract(sin(dot(floor(s * 34.) + floor(tq * 24.), vec2(12.9, 78.2))) * 4375.)), nie);
  } else {
    // carta de ajuste
    float k = floor((s.x + .58) / .166); vec3 b = k < 1. ? vec3(1.2) : k < 2. ? vec3(1.2, 1.1, .2) : k < 3. ? vec3(.2, 1.1, 1.1) : k < 4. ? vec3(.2, 1., .3) : k < 5. ? vec3(1.1, .3, 1.) : k < 6. ? vec3(1.2, .2, .2) : vec3(.2, .3, 1.2);
    ima = s.y > -.2 ? b : vec3(.15 + .9 * step(.5, fract(s.x * 3.)));
    ima = mix(ima, vec3(1.1), step(abs(length(s) - .4), .012));
    ima *= .85 + .15 * step(.5, fract(s.y * 9. - t * .8));
  }
  ima *= .75 + .25 * step(.4, fract(p.y * 42.));
  float pa = max(ms, elipse(p - vec3(-.2, .02, .28), vec3(1.2, 1., .24)));
  c = une(c, vec4(ima * 1.12, pa * .8));
  // mandos y rejilla
  for (int i = 0; i < 2; i++) { vec3 k = p - vec3(.68, .36 - .3 * float(i), .46); k.xy *= gira(float(i) + 3. * smoothstep(0., .4, min(tq, 1.)) * step(tq, 5.));
    c = une(c, vec4(mix(vec3(.7, .62, .45), vec3(.12), step(abs(k.x), .015) * step(0., k.y)), max(length(k.xy) - .1, abs(k.z) - .05))); }
  c = une(c, vec4(mix(vec3(.12), vec3(.5, .42, .3), step(.5, fract(p.y * 22.))), caja(p - vec3(.68, -.32, .44), vec3(.16, .2, .012))));
  // antena de cuernos
  c = une(c, vec4(vec3(.25), elipse(p - vec3(0, .7, 0), vec3(.2, .08, .14))));
  return une(c, vec4(vec3(.75), min(min(capsula(p, vec3(-.05, .72, 0), vec3(-.55 - .05 * sin(t), 1.35, 0), .014), capsula(p, vec3(.05, .72, 0), vec3(.5, 1.32, .05), .014)), min(esfera(p - vec3(-.55 - .05 * sin(t), 1.35, 0), .035), esfera(p - vec3(.5, 1.32, .05), .035)))));
}` },
// ---------- Máquinas ----------
{ id:'helicoptero', codigo:
`vec4 criatura(vec3 p, float t) {
  p.y -= .06 * sin(t * 1.3); p.xz *= gira(.5 + .3 * sin(t * .3)); p.xy *= gira(.06 * sin(t) - .25 * acc);
  vec3 q = vec3(p.xy, abs(p.z));
  vec3 az = vec3(.2, .42, .62), bl = vec3(.82);
  // cabina y cola
  float d = elipse(p - vec3(-.35, -.05, 0), vec3(.55, .37, .33));
  d = funde(d, cono(p, vec3(.0, .05, 0), vec3(1.15, .16, 0), .18, .06), .15);
  float vid = step(.25, -p.x) * step(-.12, p.y) * step(.035, abs(p.z)) ;
  vec3 tono = mix(az, bl, smoothstep(.02, .0, abs(p.y + .12 + .08 * p.x) - .05));
  tono = mix(tono, vec3(.12, .2, .26), vid * step(p.x, -.32));
  vec4 c = vec4(tono, d * .85);
  // puerta y ventana
  // deriva, rotor de cola
  c = une(c, vec4(az, max(max(abs(p.z) - .022, elipse(p - vec3(1.15, .3, 0), vec3(.14, .3, .2))), -9.) * .8));
  c = une(c, vec4(bl, elipse(p - vec3(.85, .14, 0), vec3(.1, .02, .26)) * .8));
  vec3 k = p - vec3(1.17, .2, .07); k.xy *= gira(t * 16. + acc * tq * 10.);
  c = une(c, vec4(vec3(.2), elipse(k, vec3(.26, .03, .012)) * .7));
  // mástil y rotor principal
  c = une(c, vec4(vec3(.3), min(capsula(p, vec3(-.2, .25, 0), vec3(-.2, .5, 0), .05), elipse(p - vec3(-.12, .3, 0), vec3(.3, .1, .18)))));
  vec3 r = p - vec3(-.2, .5, 0); r.xz *= gira(t * 9. + acc * tq * 14.); vec3 s = ronda(r, 4.);
  s.y += .05 * s.x * (1. - 2.2 * acc);
  c = une(c, vec4(mix(vec3(.14), vec3(.85, .7, .2), step(.95, s.x)), max(caja(s - vec3(.58, 0, 0), vec3(.56, .01, .045)), -9.) * .8));
  c = une(c, vec4(vec3(.5), esfera(r, .08)));
  // patines y luces
  c = une(c, vec4(vec3(.25), min(capsula(q, vec3(-.75, -.6, .3), vec3(.2, -.6, .3), .03), min(capsula(q, vec3(-.5, -.3, .15), vec3(-.55, -.6, .3), .022), capsula(q, vec3(-.1, -.3, .15), vec3(-.05, -.6, .3), .022)))));
  c = une(c, vec4(vec3(1.8, .3, .2) * (.5 + .5 * step(0., sin(t * 6.))), esfera(p - vec3(1.15, .6, 0), .035)));
  c = une(c, vec4(vec3(1.8, 1.6, 1.1), esfera(p - vec3(-.75, -.28, 0), .06 + .02 * acc)));
  // foco y cable con rescate al tocarlo
  if (tq < 3.4) { float L = .85 * smoothstep(.2, 1.2, tq) * (1. - smoothstep(2.2, 3.3, tq)); vec3 b = p - vec3(-.3, -.35 - L, .1 + .08 * sin(tq * 3.));
    c = une(c, vec4(vec3(.7), capsula(p, vec3(-.3, -.35, .1), vec3(-.3, -.35 - L, .1 + .08 * sin(tq * 3.)), .012)));
    c = une(c, vec4(vec3(.85, .35, .1), min(elipse(b + vec3(0, .1, 0), vec3(.07, .12, .06)), esfera(b - vec3(0, .05, 0), .05)) + .2 * (1. - smoothstep(0., .2, L)))); }
  return c;
}` },
{ id:'bicicleta', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.35 + .35 * sin(t * .3)); p.y += .12; p.y -= .18 * abs(sin(tq * 4.)) * acc * 0.;
  float T = t * 2. + acc * tq * 8.;
  vec3 rojo = vec3(.5, .09, .08);
  p.xy *= gira(-.3 * acc * smoothstep(0., .5, acc));
  // ruedas con radios
  vec4 c = vec4(0, 0, 0, 9);
  for (int i = 0; i < 2; i++) {
    vec3 w = p - vec3(i == 0 ? -.68 : .68, -.42, 0);
    float r = length(w.xy), a = atan(w.y, w.x) + T;
    c = une(c, vec4(vec3(.07) + .06 * step(.5, fract(a * 9.)), length(vec2(r - .5, w.z)) - .042));
    c = une(c, vec4(vec3(.75), length(vec2(r - .455, w.z)) - .02));
    float k = abs(fract(a * 2.546) - .5) / 2.546 * r;
    c = une(c, vec4(vec3(.8), max(max(k - .006, r - .45), abs(w.z) - .006)));
    c = une(c, vec4(vec3(.6), max(r - .05, abs(w.z) - .08)));
    c = une(c, vec4(rojo, max(max(abs(r - .56) - .012, abs(w.z) - .05), -w.y + (i == 0 ? -w.x : w.x) * .5 + .1)));
  }
  // cuadro
  vec3 ej = vec3(-.02, -.42, 0), si = vec3(-.2, .3, 0), di = vec3(.46, .36, 0), tr = vec3(-.68, -.42, 0), de = vec3(.68, -.42, 0);
  float d = min(capsula(p, si, di, .032), capsula(p, ej, di, .036));
  d = min(d, capsula(p, ej, si + vec3(-.02, .1, 0), .034));
  vec3 q = vec3(p.xy, abs(p.z));
  d = min(d, capsula(q, vec3(-.02, -.42, .03), tr + vec3(0, 0, .06), .02));
  d = min(d, capsula(q, si + vec3(0, 0, .02), tr + vec3(0, 0, .06), .018));
  d = min(d, curva(q, di + vec3(.01, -.1, .02), vec3(.6, -.1, .06), de + vec3(0, 0, .06), .024, .018));
  d = min(d, capsula(p, di + vec3(.03, -.1, 0), di + vec3(-.02, .12, 0), .04));
  c = une(c, vec4(rojo, d));
  // sillín, manillar, cesta y timbre
  c = une(c, vec4(vec3(.25, .13, .07), funde(elipse(p - vec3(-.27, .47, 0), vec3(.16, .045, .12)), elipse(p - vec3(-.13, .46, 0), vec3(.12, .035, .05)), .06)));
  float ma = min(capsula(p, di + vec3(-.02, .1, 0), vec3(.42, .58, 0), .022), curva(q, vec3(.44, .58, 0), vec3(.5, .62, .3), vec3(.24, .56, .32), .022, .022));
  c = une(c, vec4(vec3(.75), ma));
  c = une(c, vec4(vec3(.25, .13, .07), capsula(q, vec3(.36, .58, .325), vec3(.22, .56, .32), .034)));
  float ce = caja(p - vec3(.75, .38, 0), vec3(.14, .12, .2)); ce = max(ce, -caja(p - vec3(.75, .42, 0), vec3(.12, .13, .18)));
  c = une(c, vec4(vec3(.5, .34, .17) * (.8 + .4 * step(.5, fract(p.y * 18. + step(.5, fract(p.z * 12.)) * .5))), ce));
  for (int i = 0; i < 4; i++) { float f = float(i); vec3 b = p - vec3(.72 + .05 * sin(f * 3.), .54 + .04 * sin(f * 5.), -.12 + .08 * f); vec3 u = ronda(b, 5.); c = une(c, vec4(f < 2. ? vec3(.8, .3, .45) : vec3(.9, .75, .3), elipse(u - vec3(.04, 0, 0), vec3(.045, .02, .028)) * .8)); }
  // pedales, plato y cadena
  vec3 g = p - ej; g.xy *= gira(T * .8);
  c = une(c, vec4(vec3(.65), max(abs(length(g.xy) - .12) - .02, abs(g.z - .06) - .012)));
  c = une(c, vec4(vec3(.65), min(capsula(g, vec3(0, 0, .09), vec3(0, .2, .09), .016), capsula(g, vec3(0, 0, -.09), vec3(0, -.2, -.09), .016))));
  c = une(c, vec4(vec3(.1), min(caja(g - vec3(0, .2, .15), vec3(.05, .015, .06)), caja(g - vec3(0, -.2, -.15), vec3(.05, .015, .06)))));
  return c;
}` },
// ---------- Comida ----------
{ id:'pizza', codigo:
`vec4 criatura(vec3 p, float t) {
  p.yz *= gira(-.62); p.xz *= gira(giro); p.xz *= gira(t * .15);
  // una porción se separa al tocarla
  float a0 = atan(p.z, p.x), sec = step(abs(a0 - .5), .39);
  vec4 c = vec4(0, 0, 0, 9);
  for (int i = 0; i < 2; i++) {
    vec3 q = p; if (i == 1) q -= acc * vec3(.36, .3 + .05 * sin(tq * 5.), .2);
    float a = atan(q.z, q.x), r = length(q.xz);
    float cu = (abs(a - .5) - .3927) * max(r, .05);
    float pa = max(r - 1.1, abs(q.y) - .05) - .02;
    pa = funde(pa, length(vec2(r - 1.08, q.y - .03)) - .1 - .02 * sin(a * 9.) - .01 * sin(a * 23.), .08);
    float d = max(pa, i == 0 ? -cu - .006 : cu + .006);
    float mz = sin(q.x * 7. + 2. * sin(q.z * 5.)) * sin(q.z * 8. + 1.5 * sin(q.x * 6.));
    vec3 que = mix(vec3(.9, .68, .28), vec3(.98, .88, .6), smoothstep(-.2, .5, mz));
    que = mix(que, vec3(.6, .26, .1), smoothstep(.75, .95, mz));
    que = mix(vec3(.62, .13, .06), que, smoothstep(1.02, .9, r + .05 * sin(a * 17.)));
    vec3 cor = mix(vec3(.75, .5, .24), vec3(.42, .22, .09), smoothstep(.3, .9, sin(a * 11.) * sin(a * 5. + 1.)));
    c = une(c, vec4(mix(que, cor, smoothstep(.98, 1.04, r) + step(q.y, -.03)), (d - .012 * smoothstep(0., .5, mz) * step(r, .95)) * .75));
    // salami, aceitunas y albahaca
    for (int j = 0; j < 8; j++) {
      float f = float(j), k = f * .7854 + .11, R = j % 2 == 0 ? .72 : .42;
      vec3 o = q - vec3(R * cos(k), .07, R * sin(k));
      float lado = (abs(atan(sin(k), cos(k)) - .5) - .39);
      if ((i == 0) == (lado < 0.)) continue;
      float ro = length(o.xz);
      c = une(c, vec4(mix(vec3(.55, .12, .08), vec3(.75, .32, .22), step(.6, sin(o.x * 60.) * sin(o.z * 55.) + .5)), max(ro - .16, abs(o.y + .3 * ro * ro) - .02) - .008));
      vec3 e = q - vec3((1.16 - R) * cos(k + .3), .09, (1.16 - R) * sin(k + .3));
      if (j % 2 == 0) c = une(c, vec4(vec3(.07, .06, .08), length(vec2(length(e.xz) - .05, e.y)) - .025));
      else { e.xz *= gira(f); c = une(c, vec4(vec3(.18, .42, .14), elipse(e, vec3(.12, .02, .06)) * .7)); }
    }
    // hilos de queso
    if (i == 1 && tq < 3.2) for (int j = 0; j < 3; j++) { float f = float(j); vec3 s = vec3(.35 + .22 * f, .03, .45 + .05 * f) ; c = une(c, vec4(vec3(.95, .82, .5), cono(p, s, s + acc * vec3(.36, .3, .2) * vec3(1.), .025, .02) + .06 * (1. - smoothstep(0., .4, acc)))); }
  }
  return c;
}` },
{ id:'pina', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(t * .25 + vuelta()); p.y += .3; p.y -= .18 * abs(sin(tq * 5.)) * acc;
  float a = atan(p.z, p.x);
  // fruto con escamas en dos espirales
  float u = a * 8. / 6.2832 * 1., y = p.y * 4.4;
  float s1 = fract(u * 1. + y * .62), s2 = fract(u * 1. - y * .62 + .0);
  vec2 f = vec2(s1 - .5, s2 - .5);
  float es = max(abs(f.x), abs(f.y));
  float d = elipse(p + vec3(0, .18, 0), vec3(.56, .8, .56));
  float bul = .05 * (1. - 2. * es);
  vec3 tono = mix(vec3(.86, .56, .16), vec3(.42, .26, .07), smoothstep(.36, .48, es));
  tono = mix(tono, vec3(.3, .4, .14), smoothstep(.0, .6, p.y) * .4);
  tono = mix(tono, vec3(.25, .13, .05), smoothstep(.1, .04, length(f)));
  vec4 c = vec4(tono, (d - bul) * .7);
  // corona de hojas
  for (int i = 0; i < 4; i++) {
    float k = float(i);
    vec3 q = p - vec3(0, .52 + .06 * k, 0); q.xz *= gira(k * .5); q = ronda(q, 7.);
    float L = .5 + .12 * k, ab = (.75 - .2 * k) * (1. + .35 * acc * sin(tq * 8. + k));
    q.xy *= gira(ab - .0); q.x -= .0; q.x += .35 * q.y * q.y * .6 - .05;
    c = une(c, vec4(mix(vec3(.14, .34, .16), vec3(.42, .6, .3), smoothstep(0., L, q.y)), max(elipse(q - vec3(.03, L * .5, 0), vec3(.035, L * .55, .085)), -q.y - .05) * .6));
  }
  // gafas de sol al tocarla
  if (tq < 3.) { vec3 g = p - vec3(0, .06 + 1.2 * (1. - smoothstep(0., .5, acc)), 0); g.xz *= gira(-t * .25 - vuelta()); vec3 m = vec3(abs(g.x) - .2, g.y, g.z - .55);
    float l = min(elipse(m, vec3(.17, .13, .04)), min(caja(g - vec3(0, .04, .57), vec3(.1, .02, .015)), caja(vec3(abs(g.x) - .38, g.y - .05, g.z - .4), vec3(.015, .02, .2)))); c = une(c, vec4(vec3(.03), l + .1 * (1. - step(.02, acc)))); }
  return c;
}` },
{ id:'cupcake', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(t * .25); p.y += .08;
  float a = atan(p.z, p.x), r = length(p.xz);
  // cápsula de papel plisada
  float R = .56 + .2 * (p.y + .6) + .025 * cos(a * 26.);
  float d = max((r - R) * .9, abs(p.y + .62) - .42);
  vec4 c = vec4(mix(vec3(.62, .18, .26), vec3(.9, .55, .6), .5 + .5 * cos(a * 26.)), d * .8);
  c = une(c, vec4(vec3(.5, .3, .15), elipse(p + vec3(0, .2, 0), vec3(.7, .22, .7))));
  // crema en espiral
  float sq = 1. + .06 * acc * sin(tq * 9.);
  vec3 k = p; k.y = (k.y + .15) / sq - .15;
  float h = (k.y + .15) / .95, es = a + h * 15.;
  float Rc = .72 * (1. - .92 * h) + .05 * cos(es * 5.);
  float on = .07 * sin(h * 19. + a * 1.);
  float cr = max((r - Rc - on) * .55, max(-k.y - .18, k.y - .86));
  c = une(c, vec4(mix(vec3(.78, .55, .68), vec3(.98, .88, .92), smoothstep(-.05, .06, on + .03 * cos(es * 5.))), cr));
  // chispas de colores
  vec2 w = vec2(a * 3.4, h * 9.); vec2 id = floor(w); float hh = fract(sin(dot(id, vec2(12.9, 78.2))) * 4375.);
  vec2 f = fract(w) - .5; f *= mat2(cos(hh * 6.), -sin(hh * 6.), sin(hh * 6.), cos(hh * 6.));
  float ch = step(abs(f.x), .3) * step(abs(f.y), .09) * step(.4, hh) * step(h, .8);
  vec3 co = hh < .55 ? vec3(.2, .6, .85) : hh < .7 ? vec3(.95, .75, .2) : hh < .85 ? vec3(.3, .7, .35) : vec3(.9, .25, .3);
  if (c.y > .5 && c.z > .62) c.xyz = mix(c.xyz, co, ch);
  // cereza y vela que se enciende
  c = une(c, vec4(vec3(.6, .03, .07), esfera(p - vec3(0, .86, 0), .13)));
  c = une(c, vec4(mix(vec3(.9), vec3(.2, .5, .85), step(.5, fract(p.y * 9. + a * .5))), max(length(p.xz - vec2(.22, .1)) - .035, abs(p.y - .75) - .3)));
  vec3 l = p - vec3(.22 + .01 * sin(t * 9.), 1.16, .1); float A = .25 + .75 * acc;
  c = une(c, vec4(mix(vec3(1.9, 1.5, .7), vec3(1.8, .7, .2), smoothstep(0., .12, l.y)), funde(elipse(l, vec3(.04, .065, .04) * A), cono(l, vec3(0), vec3(0, .15 * A, 0), .03 * A, .003), .03)));
  return une(c, cohetes(p - vec3(0, .25, 0)));
}` },
{ id:'ramen', codigo:
`vec4 criatura(vec3 p, float t) {
  p.yz *= gira(-.5); p.xz *= gira(giro); p.xz *= gira(.3 * sin(t * .25)); p.y += .22;
  float r = length(p.xz), a = atan(p.z, p.x);
  // cuenco con greca
  float R = 1.02 * sqrt(max(0., 1. - pow((p.y - .25) / -1., 2.) * .75));
  float d = max(elipse(p - vec3(0, .25, 0), vec3(1.05, .85, 1.05)), p.y - .22);
  d = max(d, -elipse(p - vec3(0, .27, 0), vec3(.97, .76, .97)));
  d = min(d, max(r - .42, abs(p.y + .6) - .08));
  float gr = step(abs(p.y - .06), .06) * step(.0, sin(a * 18.)) + step(abs(abs(p.y - .06) - .09), .012);
  vec4 c = vec4(mix(vec3(.55, .1, .08), vec3(.88, .78, .55), min(gr, 1.) * step(.8, r)), d * .8);
  // caldo con círculos de grasa
  float ci = smoothstep(.35, .2, abs(length(fract(p.xz * 4. + .1 * sin(t)) - .5) - .25) * 4.);
  c = une(c, vec4(mix(vec3(.56, .28, .09), vec3(.8, .5, .18), ci * .6), max(r - .95, abs(p.y - .06 - .012 * sin(r * 20. - t * 3.)) - .03)));
  // fideos: madejas
  for (int i = 0; i < 4; i++) { float f = float(i); vec3 q = p - vec3(-.1 + .12 * sin(f * 2.), .1, .25 * cos(f * 1.7)); q.xz *= gira(f * .8); q.z += .07 * sin(q.x * 7. + f);
    float n = round(q.z / .06); float z = q.z - .06 * clamp(n, -3., 3.); c = une(c, vec4(vec3(.92, .76, .42), max(length(vec2(z, q.y - .02 * sin(q.x * 9. + n))) - .026, abs(q.x) - .42) * .8)); }
  // huevo, narutomaki, nori, cebollín y cerdo
  vec3 h = p - vec3(.45, .16, .3); float he = max(elipse(h, vec3(.22, .14, .17)), h.y - .03);
  c = une(c, vec4(mix(vec3(.93, .9, .82), vec3(.95, .55, .12), step(length(h.xz * vec2(.9, 1.1)), .1) * step(0., h.y)), he));
  vec3 n = p - vec3(-.5, .15, .32); float an = atan(n.z, n.x), rn = length(n.xz);
  c = une(c, vec4(mix(vec3(.95, .92, .9), vec3(.9, .4, .55), step(abs(rn - .03 - .02 * an), .018) * step(rn, .13)), max(rn - .17 - .015 * cos(an * 14.), abs(n.y) - .03)));
  vec3 no = p - vec3(-.42, .38, -.52); no.yz *= gira(.35);
  c = une(c, vec4(vec3(.05, .1, .06), caja(no, vec3(.26, .36, .015))));
  vec3 ce = p - vec3(.42, .13, -.28); c = une(c, vec4(mix(vec3(.6, .32, .2), vec3(.88, .7, .55), step(.2, sin(length(ce.xz) * 34.))), max(length(ce.xz * vec2(1., 1.2)) - .28, abs(ce.y) - .045)));
  vec2 k = floor(p.xz * 11.); float hc = fract(sin(dot(k, vec2(12.9, 78.2))) * 4375.); vec2 fk = (fract(p.xz * 11.) - .5) / 11.;
  if (hc > .8 && r < .75) c = une(c, vec4(vec3(.35, .6, .2), max(abs(length(fk) - .028) - .01, abs(p.y - .14) - .02) * .8));
  // palillos que levantan fideos
  float up = .55 * acc + .05 * acc * sin(tq * 5.);
  vec3 pa = p - vec3(.1, .2 + up, .05);
  vec3 e = vec3(pa.x, pa.y, abs(pa.z) - .05);
  c = une(c, vec4(vec3(.4, .16, .08), cono(e, vec3(-.12, -.02, 0), vec3(1.25, .55, .06), .02, .035)));
  if (tq < 3.2) { vec3 f = p - vec3(.02, .1, .05); float q = clamp(round(f.x / .05), -2., 2.); f.x -= q * .05 + .02 * sin(f.y * 9. + q * 2. + t * 3.); c = une(c, vec4(vec3(.92, .76, .42), max(length(f.xz) - .02, max(-f.y, f.y - .12 - up)) * .8)); }
  // vapor
  for (int i = 0; i < 3; i++) { float f = float(i) - 1.; vec3 v = p - vec3(f * .35, .35, -.1); v.x -= .12 * sin(v.y * 4. - t * 1.5 + f * 2.) * v.y; float hv = clamp(v.y / .8, 0., 1.); float va = max(length(v.xz) - .04 * (1. - hv) - .01, max(v.y - .8, -v.y));
    float hu = step(.4 + .5 * hv, fract(sin(dot(floor(vec2(v.y * 20. - t * 5., f)), vec2(12.9, 78.2))) * 4375.)); c = une(c, vec4(vec3(.75), hu > .5 ? va * .6 : max(va * .6, .03))); }
  return c;
}` },
// ---------- Formas ----------
{ id:'icosaedro', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(t * .35); p.xy *= gira(t * .22);
  // poliedro por planos; al tocarlo se abre en capas
  const vec3 n1 = vec3(.577, .577, .577), n2 = vec3(0, .934, .357), n3 = vec3(.357, 0, .934), n4 = vec3(.934, .357, 0);
  vec4 c = vec4(0, 0, 0, 9);
  for (int i = 0; i < 3; i++) {
    float f = float(i), R = .95 - .3 * f + .12 * acc * (1. - f) * sin(tq * 4.);
    vec3 q = p; q.xy *= gira(f * .8 * vuelta() * .5); q.xz *= gira(-f * 1.2 * t * .3);
    vec3 a = abs(q);
    vec4 m = vec4(dot(a, n1), dot(a, n2), dot(a, n3), dot(a, n4));
    float mx = max(max(m.x, m.y), max(m.z, m.w));
    vec4 s = m; float se = -9.;                       // segunda cara más cercana: marca las aristas
    se = max(se, s.x < mx - 1e-4 ? s.x : -9.); se = max(se, s.y < mx - 1e-4 ? s.y : -9.); se = max(se, s.z < mx - 1e-4 ? s.z : -9.); se = max(se, s.w < mx - 1e-4 ? s.w : -9.);
    float ar = mx - se;
    float d = mx - R;
    vec3 col = i == 0 ? vec3(.2, .5, .6) : i == 1 ? vec3(.75, .5, .22) : vec3(1.5, .8, .4);
    // las dos capas de fuera son solo armazón
    if (i < 2) d = max(max(d, R - .05 - mx), (ar - .07 - .02 * f) * .6);
    c = une(c, vec4(col * (.85 + .3 * smoothstep(.06, .0, ar)), d * .75));
  }
  return c;
}` },
{ id:'metabolas', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(t * .15);
  float d = 9., k = .5 - .3 * acc; vec3 col = vec3(0); float peso = 0.;
  for (int i = 0; i < 7; i++) {
    float f = float(i);
    vec3 b = vec3(.62 * sin(t * (.5 + .07 * f) + f * 2.1), .68 * cos(t * (.43 + .06 * f) + f * 1.7), .5 * sin(t * (.38 + .05 * f) + f * 2.9));
    b *= .86 + .45 * acc * abs(sin(tq * 3.));
    float e = esfera(p - b, .3 - .018 * f);
    float w = exp(-7. * max(e, 0.));
    vec3 cc = .5 + .45 * cos(f * .9 + vec3(0, 2.1, 4.2));
    col += cc * w; peso += w;
    d = funde(d, e, k);
  }
  col /= max(peso, .001);
  float an = .5 + .5 * sin(d * 60. + p.y * 9. + t);
  return vec4(mix(col, col * 1.25 + .05, an * .4), d * .75);
}` },
{ id:'adn', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xy *= gira(.28); p.xz *= gira(t * .5 + vuelta());
  float ab = .26 * acc * smoothstep(-.6, 1.2, p.y);
  float g = p.y * 3.1 * (1. - .35 * acc);
  vec3 q = p; q.xz *= gira(g);
  float R = .46 + ab;
  // dos hebras
  vec3 s = vec3(abs(q.x) - R, q.y, q.z);
  float d = max(length(s.xz) - .085, abs(p.y) - 1.3) * .75;
  float fos = .02 * sin(p.y * 46.);
  vec4 c = vec4(q.x > 0. ? vec3(.2, .42, .66) : vec3(.66, .24, .2), (d - fos) * .8);
  // peldaños: pares de bases
  float n = clamp(round(p.y / .2), -6., 6.), y = p.y - n * .2;
  vec3 b = p; b.xz *= gira(n * .2 * 3.1 * (1. - .35 * acc)); b.y = y;
  float h = fract(sin(n * 12.9) * 43.7);
  float Rn = .46 + .26 * acc * smoothstep(-.6, 1.2, n * .2);
  float sep = .02 + .24 * acc * smoothstep(-.6, 1.2, n * .2);
  float pe = max(length(b.yz) - .05, max(abs(b.x) - Rn, sep - abs(b.x)));
  vec3 c1 = h < .5 ? vec3(.9, .7, .25) : vec3(.35, .7, .4), c2 = h < .5 ? vec3(.4, .7, .8) : vec3(.8, .45, .6);
  float pul = acc * pow(.5 + .5 * sin(n - tq * 7.), 3.);
  c = une(c, vec4((b.x > 0. ? c1 : c2) * (1. + .8 * pul), pe * .75));
  return c;
}` },
// ---------- Criaturas ----------
{ id:'elefante', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.35 * sin(t * .28) + .35); p.y += .02;
  vec3 q = vec3(p.xy, abs(p.z)); float lado = sign(p.z), m = .05 * sin(t * 1.3) * lado;
  // cuerpo y patas
  float d = elipse(p - vec3(.28, .05, 0), vec3(.68, .52, .48));
  d = funde(d, elipse(p - vec3(-.2, .12, 0), vec3(.42, .46, .42)), .15);
  d = funde(d, cono(q, vec3(-.15, -.2, .24), vec3(-.2 + m, -1.08, .24), .2, .17), .08);
  d = funde(d, cono(q, vec3(.68, -.2, .24), vec3(.7 - m, -1.08, .24), .23, .17), .08);
  // cabeza
  vec3 k = p - vec3(-.62, .36, 0); k.xy *= gira(.12 * acc);
  d = funde(d, elipse(k, vec3(.36, .4, .34)), .12);
  // trompa: se levanta al tocarlo
  vec3 a = vec3(-.85, .25, 0), b = mix(vec3(-1.2, -.1, 0), vec3(-1.35, .35, 0), acc), e = mix(vec3(-1. + .08 * sin(t), -.72, .05 * sin(t * 1.3)), vec3(-1.2, 1.05, 0), acc);
  float tr = curva(p, a, b, e, .19, .075);
  float an = .012 * sin(length(p - a) * 55.);
  d = funde(d, tr + an * .6, .06);
  // orejas grandes
  vec3 o = vec3(p.x + .42, p.y - .34, abs(p.z) - .3); o.xz *= gira(-.5 - .35 * sin(t * 1.1) * .5 - .7 * acc * sin(tq * 7.));
  float or_ = max(elipse(o - vec3(.12, -.05, .22), vec3(.34, .46, .34)), abs(o.x * .35 + o.z * .0 - .04 + .05 * sin(o.y * 5.)) - .035);
  d = funde(d, or_, .05);
  // cola
  d = min(d, curva(p, vec3(.95, .2, 0), vec3(1.12, .0, 0), vec3(1.06, -.4, .08 * sin(t * 2.)), .04, .02));
  d = funde(d, elipse(p - vec3(1.06, -.45, .08 * sin(t * 2.)), vec3(.04, .09, .04)), .03);
  float ar = .008 * sin(p.x * 37. + 5. * sin(p.y * 9.)) * sin(p.y * 41. + 4. * sin(p.x * 7.)) + .006 * sin(p.y * 63.) * sin(p.z * 57.);
  float un = step(p.y, -1.0) * step(.55, sin(atan(q.z - .24, p.x - (p.x < .2 ? -.2 : .7)) * 6.));
  vec4 c = vec4(mix(mix(vec3(.34, .32, .31), vec3(.48, .44, .42), smoothstep(-.6, .6, p.y)), vec3(.72, .66, .56), un) * (1. + 14. * ar), (d + ar) * .6);
  // colmillos y ojo
  c = une(c, vec4(vec3(.88, .83, .7), curva(q, vec3(-.82, .12, .17), vec3(-1., -.12, .24), vec3(-1.22, .0 + .12 * acc, .22), .055, .015)));
  c = une(c, ojo(q - vec3(-.8, .42, .25), .075, vec3(.2, .11, .05), vec3(-.4, 0, 1), vec3(.4, .37, .35)));
  // agua
  if (tq < 3.) for (int i = 0; i < 9; i++) { float f = float(i), u = fract(tq * .8 + f * .111); vec3 w = vec3(-1.2 - .25 * u + .25 * u * sin(f * 2.4), 1.05 + .5 * u - 1.3 * u * u, .25 * u * cos(f * 2.4)); c = une(c, vec4(vec3(.6, 1.1, 1.4), esfera(p - w, .035 * acc * (1.1 - u)))); }
  return une(c, vec4(vec3(.34, .28, .16), (elipse(p + vec3(0, 1.22, 0), vec3(1.25, .14, .8)) + .012 * sin(p.x * 33.) * sin(p.z * 31.)) * .8));
}` },
{ id:'tortuga', codigo:
`vec4 criatura(vec3 p, float t) {
  p.y -= .05 * sin(t * .8); p.yz *= gira(-.45); p.xz *= gira(giro); p.xz *= gira(.5 + .25 * sin(t * .25));
  vec3 q = vec3(p.xy, abs(p.z)); float lado = sign(p.z);
  // caparazón con placas
  float d = max(elipse(p, vec3(.85, .4, .68)), -p.y - .1);
  vec2 u = vec2(p.x * 2.6, p.z * 2.6 + .5 * mod(floor(p.x * 2.6 + .5), 2.));
  vec2 f = abs(fract(u) - .5); float bo = smoothstep(.36, .46, max(f.x, f.y));
  float rad = sin(atan(fract(u.y) - .5, fract(u.x) - .5) * 9.);
  vec3 pl = mix(mix(vec3(.32, .22, .1), vec3(.58, .44, .2), .5 + .5 * rad), vec3(.75, .65, .4), bo);
  float ri = smoothstep(-.02, -.06, p.y);
  vec4 c = vec4(mix(pl, vec3(.62, .52, .3), ri), (d + .018 * bo) * .75);
  c = une(c, vec4(vec3(.8, .74, .52), elipse(p + vec3(0, .1, 0), vec3(.8, .14, .62))));
  // cabeza: se esconde al tocarla
  float es = smoothstep(0., .8, acc);
  vec3 k = p - vec3(-1.02 + .55 * es, .02 + .05 * sin(t), 0);
  float ca = funde(elipse(k, vec3(.22, .16, .16)), capsula(p, vec3(-.6, -.04, 0), vec3(-.95 + .5 * es, 0, 0), .12), .08);
  // aletas
  float al = .5 * sin(t * 1.6) * (1. - es);
  vec3 a = q - vec3(-.5, -.08, .5); a.yz *= gira(al * .6); a.xz *= gira(-.45); a /= 1. - .75 * es;
  float fl = elipse(a - vec3(.0, 0, .42), vec3(.17, .045, .5)) * (1. - .75 * es);
  a = q - vec3(.6, -.1, .42); a.yz *= gira(-al * .4); a.xz *= gira(.6); a /= 1. - .75 * es;
  fl = min(fl, elipse(a - vec3(0, 0, .18), vec3(.13, .04, .24)) * (1. - .75 * es));
  float esc = step(.35, sin(p.x * 34.) * sin(p.z * 34.));
  c = une(c, vec4(mix(vec3(.3, .42, .3), vec3(.16, .25, .18), esc), min(ca, fl) * .75));
  c = une(c, ojo(q - vec3(-1.1 + .55 * es, .07 + .05 * sin(t), .12), .075, vec3(.08, .06, .04), vec3(-.4, .2, 1), vec3(.3, .42, .3)));
  // burbujas
  for (int i = 0; i < 5; i++) { float g = float(i), w = fract(t * .25 + g * .2); c = une(c, vec4(vec3(.6, .85, .95), esfera(p - vec3(-1.1 + .1 * sin(g * 3. + t), .2 + .9 * w, .1 * cos(g * 2.4)), (.02 + .025 * acc) * (1. - .4 * w)))); }
  return c;
}` },
{ id:'abeja', codigo:
`vec4 criatura(vec3 p, float t) {
  p.y -= .08 * sin(t * 2.2) + .05; p.x -= .1 * sin(t * 1.3); p.xz *= gira(.5 + .35 * sin(t * .4) + vuelta()); p.xy *= gira(.12 * sin(t * 1.7));
  vec3 q = vec3(p.xy, abs(p.z));
  float pel = .014 * sin(p.x * 57.) * sin(p.y * 59.) * sin(p.z * 61.);
  // abdomen a rayas, tórax peludo y cabeza
  float ab = elipse(p - vec3(.48, -.1, 0), vec3(.5, .34, .34));
  float ra = step(0., sin((p.x - .1) * 17.));
  vec4 c = vec4(mix(vec3(.82, .52, .1), vec3(.1, .06, .03), ra), (ab + pel * .6) * .8);
  c = une(c, vec4(vec3(.1), cono(p, vec3(.9, -.18, 0), vec3(1.12 + .12 * acc, -.24, 0), .05, .004)));
  float to = elipse(p - vec3(-.18, .06, 0), vec3(.33, .31, .31)) + pel * 2.;
  c = une(c, vec4(mix(vec3(.72, .48, .16), vec3(.4, .24, .08), .5 + 25. * pel), to * .65));
  float ca = elipse(p - vec3(-.58, .0, 0), vec3(.2, .23, .25));
  c = une(c, vec4(vec3(.34, .22, .1), ca + pel * .5));
  // ojos compuestos
  vec3 o = q - vec3(-.64, .06, .17); float fac = .5 + .5 * sin(o.x * 80.) * sin(o.y * 80.);
  c = une(c, vec4(mix(vec3(.12, .06, .05), vec3(.5, .22, .15), fac), elipse(o, vec3(.1, .15, .09))));
  // antenas y patas
  c = une(c, vec4(vec3(.08), min(curva(q, vec3(-.68, .18, .07), vec3(-.82, .42, .12), vec3(-1.02, .34, .16), .022, .018), curva(q, vec3(-.72, -.1, .05), vec3(-.82, -.22, .06), vec3(-.74, -.3, .04), .035, .012))));
  float pa = 9.;
  for (int i = 0; i < 3; i++) { float f = float(i); pa = min(pa, curva(q, vec3(-.28 + .16 * f, -.18, .14), vec3(-.35 + .25 * f, -.42, .42), vec3(-.3 + .28 * f, -.66 + .03 * sin(t * 3. + f), .3), .032, .016)); }
  c = une(c, vec4(vec3(.1, .07, .04), pa));
  c = une(c, vec4(vec3(.95, .7, .15), elipse(q - vec3(.2, -.52, .34), vec3(.07, .1, .06))));
  // alas
  for (int i = 0; i < 2; i++) {
    vec3 a = q - vec3(-.12 + .16 * float(i), .3, .12); a.yz *= gira(.5 + .55 * sin(t * 24. + float(i))); a.xz *= gira(.4 + .5 * float(i));
    float L = i == 0 ? .42 : .28; vec3 e = a - vec3(.06, 0, L);
    float al = elipse(e, vec3(.22 - .05 * float(i), .012, L));
    float ve = max(smoothstep(.03, .0, abs(fract(e.x * 6. + e.z) - .5) - .42), smoothstep(.03, .0, abs(fract(e.z * 5.) - .5) - .44));
    c = une(c, vec4(mix(vec3(.5, .55, .58), vec3(.2, .16, .12), ve * .6), al * .55));
  }
  // flores y polen
  if (tq < 3.) for (int i = 0; i < 7; i++) { float f = float(i), u = fract(tq * .6 + f * .143); c = une(c, vec4(vec3(1.6, 1.1, .3), esfera(p - vec3(.1 + .5 * sin(f * 2.4), -.5 - .6 * u, .45 * cos(f * 2.4)), .028 * acc * (1. - u)))); }
  return c;
}` },
{ id:'rana', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.35 * sin(t * .28) - .25); p.y += .1;
  vec3 g = p; float s = acc * max(0., sin(clamp(tq / 2.2, 0., 1.) * 3.1416)); p.y -= .55 * s;
  vec3 q = vec3(abs(p.x), p.yz);
  // cuerpo agazapado y cabeza ancha
  float d = elipse(p - vec3(0, -.4, -.15), vec3(.52, .4, .58));
  d = funde(d, elipse(p - vec3(0, -.12, .3), vec3(.46, .28, .36)), .18);
  // ojos saltones
  d = funde(d, esfera(q - vec3(.27, .14, .26), .17), .06);
  // ancas y brazos: se estiran en el salto
  vec3 ro = mix(vec3(.72, -.3, .1), vec3(.55, -.75, -.3), s), pi = mix(vec3(.55, -.78, -.35), vec3(.5, -1.15, -.75), s);
  d = funde(d, cono(q, vec3(.36, -.5, -.4), ro, .2, .13), .1);
  d = funde(d, cono(q, ro, pi, .13, .07), .05);
  d = funde(d, cono(q, vec3(.34, -.42, .22), vec3(.48, -.82 - .1 * s, .42), .11, .065), .08);
  // pies y dedos con ventosas
  float de = 9.;
  for (int i = 0; i < 3; i++) { float f = float(i) - 1.; vec3 e = pi + vec3(.1 + .14 * f * .6, -.02, .32 - .06 * abs(f)); de = min(de, min(cono(q, pi, e, .05, .025), esfera(q - e, .05)));
    vec3 h = vec3(.48, -.84 - .1 * s, .42), e2 = h + vec3(.12 * f + .04, -.0, .17 - .03 * abs(f)); de = min(de, min(cono(q, h, e2, .045, .022), esfera(q - e2, .042))); }
  d = funde(d, de, .04);
  // saco vocal que se hincha
  float sac = .5 + .5 * sin(t * 2.2);
  d = funde(d, elipse(p - vec3(0, -.34, .52), vec3(.2, .14, .12) * (1. + .25 * sac + .6 * acc * (1. - s))), .08);
  float pi_ = .01 * sin(p.x * 39.) * sin(p.y * 41.) * sin(p.z * 37.);
  float ma = smoothstep(.45, .6, sin(p.x * 8. + 1.) * sin(p.z * 9.) + .4 * sin(p.y * 13. + p.x * 5.));
  float vi = smoothstep(-.28, -.45, p.y - .25 * (p.z - .3)) * step(q.x, .42);
  vec3 piel = mix(vec3(.2, .46, .14), vec3(.1, .24, .08), ma); piel = mix(piel, vec3(.82, .8, .58), vi);
  float boca = smoothstep(.025, .0, abs(p.y + .13 - .12 * q.x * q.x)) * step(.35, p.z);
  vec4 c = vec4(mix(piel, vec3(.08, .12, .05), boca), (d + pi_) * .65);
  c = une(c, ojo(q - vec3(.29, .17, .32), .23, vec3(.75, .5, .1), vec3(.2, .05, 1), vec3(.22, .46, .16)));
  // hoja de nenúfar y agua
  float r = length(g.xz), a = atan(g.x, g.z);
  float ho = max(max(r - .95, abs(g.y + .92 - .04 * r) - .025), -(abs(a - 2.6) - .18) * r);
  c = une(c, vec4(mix(vec3(.16, .38, .16), vec3(.36, .58, .28), smoothstep(.05, .0, abs(fract(a * 2.2) - .5) * r)), ho * .8));
  c = une(c, vec4(vec3(.08, .26, .3), max(max(g.y + .97 + .015 * sin(r * 20. - t * 3. - acc * tq * 5.), -1.15 - g.y), r - 1.25) * .8));
  vec3 f = g - vec3(.85, -.8, -.4); for (int i = 0; i < 2; i++) { vec3 u = ronda(f, 7.); u.xy *= gira(-.7 + .5 * float(i)); c = une(c, vec4(mix(vec3(.95, .8, .85), vec3(.85, .4, .6), float(i)), elipse(u - vec3(.14, 0, 0), vec3(.15, .03, .07)) * .7)); f.xz *= gira(.45); }
  return c;
}` },
{ id:'unicornio', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.25 * sin(t * .3) + .2); p.y += .05; p.x -= .08;
  // se encabrita al tocarlo
  vec3 g = p; float en = .5 * smoothstep(0., 1., acc);
  vec3 ej = vec3(.5, -.35, 0); p -= ej; p.xy *= gira(en); p += ej;
  vec3 q = vec3(p.xy, abs(p.z)); float lado = sign(p.z), m = .05 * sin(t * 1.4) * lado;
  float d = elipse(p - vec3(.15, -.08, 0), vec3(.55, .28, .25));
  d = funde(d, elipse(p - vec3(-.25, -.02, 0), vec3(.28, .33, .25)), .12);
  d = funde(d, elipse(p - vec3(.5, -.05, 0), vec3(.27, .31, .26)), .12);
  d = funde(d, curva(p, vec3(-.32, .08, 0), vec3(-.42, .5, 0), vec3(-.58, .72, 0), .22, .12), .12);
  // cabeza
  vec3 k = p - vec3(-.62, .76, 0); k.xy *= gira(-.55);
  d = funde(d, cono(k, vec3(.02, 0, 0), vec3(-.36, -.02, 0), .145, .085), .06);
  vec3 o = vec3(k.xy, abs(k.z)); d = funde(d, cono(o, vec3(.08, .1, .08), vec3(.12, .27, .1), .05, .01), .03);
  // patas: las de delante se recogen
  vec3 r1 = mix(vec3(-.32 + m, -.62, .15), vec3(-.62 + .06 * sin(tq * 8.) * lado, -.35, .15), acc), r2 = mix(vec3(-.3, -1.08, .15), vec3(-.5 + .1 * sin(tq * 8.) * lado, -.72, .15), acc);
  d = funde(d, cono(q, vec3(-.28, -.2, .13), r1, .13, .065), .06); d = funde(d, cono(q, r1, r2, .065, .055), .03);
  vec3 w = vec3(g.xy, abs(g.z));
  d = funde(d, cono(w, vec3(.5, -.15, .14), vec3(.66 - m * (1. - acc), -.6, .15), .18, .07), .08); d = funde(d, cono(w, vec3(.66 - m * (1. - acc), -.6, .15), vec3(.58, -1.08, .15), .07, .055), .03);
  float ca = smoothstep(-1., -1.04, g.y);
  vec4 c = vec4(mix(mix(vec3(.72, .7, .76), vec3(.93, .91, .92), smoothstep(-.5, .6, p.y)), vec3(.45, .38, .5), ca), d * .7);
  // crin y cola de colores, en mechones
  for (int i = 0; i < 6; i++) {
    float f = float(i), u = f / 5.;
    vec3 a = mix(vec3(-.5, .92, .0), vec3(-.18, .22, 0), u), e = a + vec3(.28 + .08 * sin(t * 1.6 + f), -.3, (mod(f, 2.) - .5) * .22);
    vec3 col = .6 + .35 * cos(u * 5. + vec3(0, 2.1, 4.2) + acc * tq * 3.);
    c = une(c, vec4(col * (1. + .5 * acc), curva(p, a, a + vec3(.2, .06, (mod(f, 2.) - .5) * .2), e, .075, .02) * .85));
    vec3 z = vec3(.74, .05, 0), y = vec3(1.0 + .08 * f * .5, -.5 - .05 * f, (f - 2.5) * .04 + .06 * sin(t * 1.4 + f));
    c = une(c, vec4(col * (1. + .5 * acc), curva(p, z, vec3(1.02, .16, (f - 2.5) * .03), y, .055, .02) * .85));
  }
  // cuerno en espiral
  vec3 h = k - vec3(-.06, .12, 0); h.xy *= gira(-.35);
  float cu = cono(h, vec3(0), vec3(-.04, .46, 0), .05, .006) - .008 * sin(h.y * 60. + atan(h.z, h.x) * 2.);
  c = une(c, vec4(mix(vec3(.85, .7, .35), vec3(1.8, 1.5, .8), acc), cu * .8));
  c = une(c, ojo(o - vec3(-.06, .05, .115), .085, vec3(.2, .15, .35), vec3(-.3, 0, 1), vec3(.85)));
  // destellos
  if (tq < 3.) for (int i = 0; i < 10; i++) { float f = float(i), u = fract(tq * .7 + f * .1); c = une(c, vec4(1.1 + .7 * cos(f + vec3(0, 2.1, 4.2)), esfera(g - vec3(-.75 + .6 * u * cos(f * 2.4), 1.1 + .5 * u * sin(f * 2.4), .5 * u * sin(f * 1.7)), .032 * acc * (1. - u)))); }
  return une(c, vec4(vec3(.2, .34, .18), (elipse(g + vec3(-.1, 1.22, 0), vec3(1.15, .15, .75)) + .015 * sin(g.x * 35.) * sin(g.z * 33.)) * .8));
}` }
);
