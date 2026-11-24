// Escenas de la galería que no son criaturas. Cada `codigo` es GLSL: el dibujo de una obra.
CRIATURAS.push(
// ---------- Espacio ----------
{ id:'saturno', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xy *= gira(.3); p.yz *= gira(-.32);
  vec3 q = p; q.xz *= gira(t * .25);
  float d = esfera(p, .68);
  float a = atan(q.z, q.x);
  float b = sin(p.y * 17. + .5 * sin(a * 3. + p.y * 8.)) + .5 * sin(p.y * 39.);
  vec4 c = vec4(mix(vec3(.62, .46, .3), vec3(.92, .8, .6), .5 + .4 * b), d);
  float r = length(p.xz);
  float an = max(abs(p.y) - .012, max(r - 1.42, .86 - r));
  an = max(an, .028 - abs(r - 1.2));
  vec3 hielo = mix(vec3(.4, .34, .28), vec3(.95, .86, .72), .5 + .5 * sin(r * 70.) * sin(r * 23.));
  c = une(c, vec4(hielo + acc * pow(.5 + .5 * sin(r * 16. - tq * 9.), 5.) * vec3(.8, .6, .35), an * .7));
  vec3 l = vec3(1.2 * cos(t * .4), .35, 1.2 * sin(t * .4));
  return une(c, vec4(vec3(.7), esfera(p - l, .07)));
}` },
{ id:'agujero', codigo:
`vec4 criatura(vec3 p, float t) {
  vec3 v = p; v.xz *= gira(-giro);
  p.xy *= gira(.22); p.yz *= gira(-.16);
  vec4 c = vec4(vec3(0), esfera(p, .44));
  // disco de gas
  float r = length(p.xz), a = atan(p.z, p.x);
  float gas = .5 + .5 * sin(a * 2. - t * 2.2 + r * 14.) * sin(a * 5. - t * 3. - r * 9.);
  float grosor = .012 + .05 * smoothstep(.55, 1.3, r) * gas;
  float d = max(abs(p.y) - grosor, max(r - 1.35, .58 - r));
  vec3 calor = mix(vec3(1.75, 1.45, 1.), vec3(1.25, .42, .1), smoothstep(.6, 1.2, r)) * (.7 + .5 * gas);
  calor *= 1. + .35 * sin(a) + .5 * acc;                      // el lado que se acerca brilla más
  c = une(c, vec4(calor, d * .6));
  // halo: la luz de atrás, doblada por la gravedad
  float h = length(vec2(length(v.xy) - .56, v.z)) - .03;
  float k = .5 + .5 * sin(atan(v.y, v.x) * 9. + t * 2.);
  vec4 fin_ = une(c, vec4(vec3(1.7, 1.1, .6) * (.75 + .3 * k), h));
  if (tq < 2.4) { float u = tq / 2.4, R = 1.45 * (1. - u), an = tq * (2.5 + 7. * u);
    vec3 b = p - vec3(R * cos(an), .05, R * sin(an)); b.xz *= gira(-an); fin_ = une(fin_, vec4(vec3(.7, 1.3, 1.7), elipse(b, vec3(.06 * (1. - u) + .02, .05 * (1. - u) + .01, .06 + .3 * u)) * .7)); }
  return fin_;
}` },
{ id:'astronauta', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xy *= gira(.2 * sin(t * .4) + .15); p.xz *= gira(.5 * sin(t * .3));
  p.y += .06 * sin(t * .8) - .05;
  vec3 q = vec3(abs(p.x), p.yz); float lado = sign(p.x);
  // traje
  float d = elipse(p - vec3(0, -.05, 0), vec3(.36, .42, .27));
  d = funde(d, elipse(p + vec3(0, .42, 0), vec3(.31, .2, .24)), .1);
  float m = .12 * sin(t * .7) * lado + acc * step(0., p.x) * (.42 + .16 * sin(tq * 11.));
  d = funde(d, cono(q, vec3(.3, .16, 0), vec3(.62, -.06 + m, .14), .14, .12), .06);
  d = funde(d, cono(q, vec3(.62, -.06 + m, .14), vec3(.66, .18 + m, .42), .12, .1), .04);
  d = funde(d, esfera(q - vec3(.67, .24 + m, .48), .11), .02);
  d = funde(d, cono(q, vec3(.17, -.52, 0), vec3(.24, -.86, .14 + m), .17, .14), .06);
  d = funde(d, cono(q, vec3(.24, -.86, .14 + m), vec3(.26, -1.18, -.02), .14, .12), .04);
  d = funde(d, elipse(q - vec3(.26, -1.22, .05), vec3(.13, .09, .2)), .03);
  d += .006 * sin(p.y * 60.);
  float franja = step(.93, cos(q.x * 11. + .6)) * step(.4, q.x);
  vec4 c = vec4(mix(vec3(.78, .78, .8), vec3(.7, .2, .12), franja), d * .75);
  // mochila y panel del pecho
  c = une(c, vec4(vec3(.5, .52, .55), caja(p - vec3(0, .05, -.32), vec3(.3, .38, .12)) - .04));
  vec3 b = p - vec3(0, -.02, .27);
  vec3 lz = fract(b.x * 9.) > .5 ? vec3(1.6, .4, .2) : vec3(.3, 1.4, .9);
  float luz = step(abs(b.y - .03), .02) * step(abs(b.x), .1);
  c = une(c, vec4(mix(vec3(.3), lz, luz), caja(b, vec3(.15, .1, .04)) - .015));
  // casco y visor
  c = une(c, vec4(vec3(.82), esfera(p - vec3(0, .62, 0), .37)));
  vec3 v = p - vec3(0, .62, .1);
  float refl = smoothstep(.1, .0, abs(v.y - .5 * v.x - .08));
  c = une(c, vec4(mix(vec3(.5, .33, .1), vec3(1., .8, .45), refl), elipse(v, vec3(.29, .25, .31))));
  return c;
}` },
{ id:'cohete', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xy *= gira(.28 + .03 * sin(t * 2.)); p.y -= .12 + .04 * sin(t * 1.5);
  vec3 g = p; p.xz *= gira(t * .3);
  // fuselaje
  float d = max(elipse(p, vec3(.36, 1.15, .36)), -.72 - p.y);
  float junta = smoothstep(.012, .0, abs(abs(p.y + .1) - .35));
  vec3 tono = mix(vec3(.72, .74, .76), vec3(.65, .16, .12), smoothstep(.55, .57, p.y));
  float rem = step(.9, sin(atan(p.z, p.x) * 24.)) * smoothstep(.03, .02, abs(abs(p.y + .1) - .38));
  vec4 c = vec4(tono * (1. - .5 * max(junta, rem)), d * .8);
  // ojo de buey
  vec3 o = p; o.x = abs(o.x);
  c = une(c, vec4(vec3(.5, .42, .3), max(length(o.yz - vec2(.22, 0)) - .16, abs(o.x - .3) - .07)));
  c = une(c, vec4(vec3(.3, .9, 1.25), max(length(o.yz - vec2(.22, 0)) - .11, abs(o.x - .3) - .085)));
  // aletas
  vec3 q = ronda(p, 3.);
  float f = max(abs(q.z) - .03, max(q.x - .68 - .5 * (q.y + .7), max(q.y + .25 - .0 + (q.x - .3) * .9, -.98 - q.y - (q.x - .3) * .2)));
  c = une(c, vec4(vec3(.6, .15, .12), max(f, .2 - q.x) * .7));
  // tobera y llama
  c = une(c, vec4(vec3(.25), cono(p, vec3(0, -.7, 0), vec3(0, -.84, 0), .16, .22)));
  float l = length(g.xz) - (.19 + .1 * acc) * smoothstep(-1.75 - .6 * acc - .1 * sin(t * 17.), -.85, g.y) - .02 * sin(g.y * 26. + t * 30.);
  l = max(l, max(g.y + .82, -1.75 - .6 * acc - g.y));
  return une(c, vec4(mix(vec3(1.5, .4, .1), vec3(1.85, 1.5, .8), smoothstep(-1.5, -.9, g.y)), l * .5));
}` },
// ---------- Naturaleza ----------
{ id:'cerezo', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.4 * sin(t * .2)); p.y += .05;
  vec4 c = vec4(vec3(.2, .3, .14), (elipse(p + vec3(0, 1.2, 0), vec3(1., .16, .8)) + .02 * sin(p.x * 20.) * sin(p.z * 19.)) * .7);
  // tronco y ramas
  float d = curva(p, vec3(.05, -1.15, 0), vec3(-.28, -.6, .05), vec3(.05, -.1, 0), .17, .1);
  d = funde(d, curva(p, vec3(0, -.25, 0), vec3(.3, .1, .1), vec3(.72, .28, .1), .09, .03), .05);
  d = funde(d, curva(p, vec3(0, -.2, 0), vec3(-.3, .1, -.1), vec3(-.7, .3, .05), .09, .03), .05);
  d = funde(d, curva(p, vec3(.03, -.15, 0), vec3(.0, .3, .0), vec3(.08, .75, 0), .09, .03), .05);
  d = min(d, cono(p, vec3(.05, -1.1, 0), vec3(.35, -1.22, .15), .1, .03));
  d = min(d, cono(p, vec3(.0, -1.1, 0), vec3(-.3, -1.22, .1), .1, .03));
  c = une(c, vec4(vec3(.3, .2, .15) * (.8 + .3 * sin(p.y * 40. + p.x * 25.)), d * .8));
  // copa en nubes de flor
  for (int i = 0; i < 9; i++) {
    float f = float(i);
    vec3 b = vec3(.82 * sin(f * 2.4) * (.4 + .07 * f), .5 + .4 * cos(f * 1.7), .4 * cos(f * 2.4));
    b.x += .02 * sin(t + f) + acc * .04 * sin(tq * 16. + f);
    vec3 s = p - b;
    float n = esfera(s, .33 - .015 * f) + .045 * sin(s.x * 17.) * sin(s.y * 18. + f) * sin(s.z * 16.) + .02 * sin(s.x * 41.) * sin(s.y * 43.) * sin(s.z * 39.);
    c = une(c, vec4(mix(vec3(.72, .34, .45), vec3(1., .78, .84), smoothstep(-.25, .3, s.y + .15 * sin(s.x * 21.))), n * .6));
  }
  // pétalos que caen
  for (int i = 0; i < 16; i++) {
    float f = float(i); if (f > 6.5 && acc < .03) break; float y = fract(t * .12 + f * .37 + step(6.5, f) * tq * .3);
    vec3 b = vec3(sin(f * 2.1) * .85 + .15 * sin(t + f * 2.), .35 - 1.45 * y, .45 * cos(f * 3.));
    c = une(c, vec4(vec3(.98, .68, .76), elipse(p - b, vec3(.04, .016, .03)) * .8));
  }
  return c;
}` },
{ id:'volcan', codigo:
`vec4 criatura(vec3 p, float t) {
  p *= 1.12; p.xz *= gira(.35 * sin(t * .2) + .2); p.y += .12;
  float a = atan(p.z, p.x), r = length(p.xz);
  // ladera con barrancos
  float perfil = 1.15 - 1.05 * smoothstep(.45, -1.1, p.y) ;
  float rad = mix(.2, 1.3, pow(clamp((.42 - p.y) / 1.35, 0., 1.), 1.5));
  float bar = .05 * sin(a * 11. + 2. * sin(p.y * 5.)) + .025 * sin(a * 27. + p.y * 9.);
  float d = max((r - rad - bar * smoothstep(.45, -.1, p.y)) * .62, max(p.y - .42, -1. - p.y));
  d = max(d, -elipse(p - vec3(0, .48, 0), vec3(.17, .2, .17)));
  // ríos de lava
  float rio = smoothstep(.1 + .12 * acc, .02, abs(sin(a * 2.5 + .5 * sin(p.y * 6.)) ) * r) * smoothstep(-.95, .3, p.y + .25 * sin(a * 3.));
  float pulso = .75 + .25 * sin(p.y * 12. + t * 3.);
  vec3 roca = mix(vec3(.22, .19, .18), vec3(.36, .31, .28), .5 + .5 * sin(p.y * 24. + a * 3.));
  vec4 c = vec4(mix(roca, vec3(1.8, .55, .1) * pulso, rio), d);
  c = une(c, vec4(vec3(1.9, .8, .2), elipse(p - vec3(0, .3, 0), vec3(.17, .05, .17))));
  // fuente de lava
  for (int i = 0; i < 8; i++) {
    float f = float(i), s = fract(t * .55 + f * .13 + acc * .0);
    vec3 b = vec3(.5 * s * sin(f * 2.4), .4 + 1.5 * s - 1.9 * s * s, .5 * s * cos(f * 2.4)) * vec3(1. + 1.1 * acc, 1. + .55 * acc, 1. + 1.1 * acc);
    c = une(c, vec4(vec3(1.85, .85, .2), esfera(p - b, (.05 + .05 * acc) * (1.1 - s))));
  }
  // columna de humo
  for (int i = 0; i < 6; i++) {
    float f = float(i), s = fract(t * .1 + f / 6.);
    vec3 b = p - vec3(.12 * sin(f * 2. + t * .5) + .5 * s * s, .6 + .85 * s, -.1);
    float n = esfera(b, .09 + .25 * s) + .05 * sin(b.x * 12.) * sin(b.y * 13. + f) * sin(b.z * 12.);
    c = une(c, vec4(mix(vec3(.5, .3, .2), vec3(.4, .4, .42), smoothstep(0., .4, s)), n * .6 + .4 * smoothstep(.85, 1., s)));
  }
  return c;
}` },
{ id:'rosa', codigo:
`vec4 criatura(vec3 p, float t) {
  p.y -= .1; p /= 1.22; p.xz *= gira(t * .25); p.xy *= gira(.08 * sin(t * .6));
  vec3 f = p - vec3(0, .55, 0);
  float a = atan(f.z, f.x), d = 9., capa = 0.;
  // pétalos: cuencos concéntricos con el borde ondulado
  for (int i = 0; i < 5; i++) {
    float k = float(i), R = (.13 + .105 * k) * (1. + .09 * k * acc);
    float g = a + k * 1.3;
    vec3 s = f + vec3(0, .02 * k, 0);
    float rr = length(s.xz) * (1. - .06 * cos(g * 3.));
    float cu = length(vec2(rr, (s.y + .04) * (.9 + .05 * k))) - R;
    float e = abs(cu) - .02;
    e = max(e, s.y - (.3 - .065 * k - .03 * k * acc) * (.75 + .25 * cos(g * 3.)) - .02 + .0 * k);
    if (e < d) { d = e; capa = k; }
  }
  vec4 c = vec4(mix(vec3(.4, .03, .06), vec3(.78, .1, .14), .3 + .16 * capa + .3 * smoothstep(-.2, .4, f.y)), d * .55);
  c = une(c, vec4(vec3(.55, .04, .08), elipse(f, vec3(.1, .2, .1))));
  // cáliz, tallo, espinas y hojas
  vec3 q = ronda(f + vec3(0, .48, 0), 5.);
  c = une(c, vec4(vec3(.18, .32, .12), cono(q, vec3(.05, 0, 0), vec3(.4, .02, 0), .07, .01)));
  float ta = curva(p, vec3(0, .1, 0), vec3(.1, -.5, 0), vec3(-.05, -1.3, 0), .05, .045);
  ta = min(ta, cono(p, vec3(.04, -.3, 0), vec3(.16, -.24, 0), .03, .003));
  ta = min(ta, cono(p, vec3(.03, -.75, 0), vec3(-.12, -.68, .02), .03, .003));
  c = une(c, vec4(vec3(.16, .3, .12), ta));
  for (int i = 0; i < 2; i++) {
    float s = i == 0 ? 1. : -1.;
    vec3 h = p - vec3(.02, -.45 - .3 * float(i), 0); h.x *= s; h.xy *= gira(-.5);
    h.y -= .15 * h.x * h.x;
    float hoja = elipse(h - vec3(.36, 0, 0), vec3(.34, .035, .17)) + .006 * sin(h.x * 50.);
    c = une(c, vec4(mix(vec3(.14, .3, .12), vec3(.3, .46, .2), smoothstep(.03, .0, abs(h.z))), hoja * .7));
  }
  vec4 fin_ = c;
  if (tq < 3.2) for (int i = 0; i < 4; i++) { float g = float(i), u = clamp((tq - .35 * g) / 2.2, 0., 1.);
    if (u > 0. && u < 1.) { vec3 b = p - vec3(.5 * sin(g * 2.2) + .12 * sin(tq * 3. + g), .6 - 1.8 * u, .4 * cos(g * 2.2)); b.xy *= gira(tq * 2. + g); fin_ = une(fin_, vec4(vec3(.7, .07, .11), elipse(b, vec3(.1, .02, .075)) * .7)); } }
  return fin_;
}` },
{ id:'montes', codigo:
`vec4 criatura(vec3 p, float t) {
  p.yz *= gira(-.28); p.xz *= gira(giro); p.xz *= gira(.3 * sin(t * .2)); p.y += .35;
  // terreno en un bloque
  vec2 u = p.xz;
  float n = .5 * sin(u.x * 2.6 + 1.) * cos(u.y * 2.1) + .26 * sin(u.x * 5.3 + u.y * 3.1) + .13 * abs(sin(u.x * 9. - u.y * 7.)) + .06 * sin(u.x * 21. + u.y * 17.);
  float alto = .55 * smoothstep(.75, -.6, u.y) * (.75 + n) - .12;
  float ter = (p.y - alto) * .5;
  float bl = caja(p + vec3(0, .55, 0), vec3(1.25, 1.2, .85));
  float d = max(max(ter, abs(p.x) - 1.25), max(abs(p.z) - .85, -.5 - p.y));
  float nieve = smoothstep(.3, .42, p.y + .08 * sin(u.x * 23. + u.y * 9.));
  vec3 tono = mix(mix(vec3(.2, .3, .15), vec3(.36, .33, .32), smoothstep(.0, .25, p.y)), vec3(.92, .95, 1.), nieve);
  tono = mix(tono, vec3(.3, .22, .16) * (.8 + .3 * sin(p.y * 45.)), step(.5, p.y < alto - .03 ? 1. : 0.));
  vec4 c = vec4(tono, d);
  // lago
  float lago = max(max(p.y + .05 + .005 * sin(p.x * 30. + t * 3.), abs(p.x) - 1.24), max(abs(p.z) - .84, -.48 - p.y));
  c = une(c, vec4(vec3(.12, .28, .4), lago));
  // pinos
  vec2 id = clamp(round((u - vec2(0, .45)) / .24), vec2(-4, -1), vec2(4, 1));
  vec2 w = u - vec2(0, .45) - id * .24;
  float h = fract(sin(dot(id, vec2(12.9, 78.2))) * 4375.);
  w -= .06 * vec2(sin(h * 40.), cos(h * 31.));
  if (h > .35) {
    vec3 s = vec3(w.x, p.y + .04, w.y);
    float pino = max(length(s.xz) - .1 * (1. - s.y / (.22 + .16 * h)) - .012 * sin(s.y * 60.), -s.y);
    c = une(c, vec4(vec3(.1, .24, .14), max(pino, s.y - .4) * .5));
  }
  // luna
  vec4 fin_ = une(c, vec4(vec3(1.45, 1.4, 1.25), esfera(p - vec3(.75, 1.15, -.6), .16)));
  if (tq < 3.) { vec3 b = p - mix(vec3(1.3, 1.35, -.5), vec3(-1.4, .75, -.5), clamp(tq / 1.1, 0., 1.)); b.xy *= gira(.22);
    float v = tq < 1.1 ? cono(b, vec3(0), vec3(.45, 0, 0), .04, .004) : 9.; fin_ = une(fin_, vec4(vec3(1.7, 1.65, 1.4), v));
    // aurora
    vec3 w = p - vec3(0, 1.05 + .08 * sin(p.x * 4. + t * 2.), -.75 + .1 * sin(p.x * 5. - t)); float cor = step(.5, fract(p.x * 13.));
    float au = max(max(abs(w.z) - .012, abs(w.y) - .24 * acc), abs(p.x) - 1.15); fin_ = une(fin_, vec4(mix(vec3(.3, 1.4, .8), vec3(.7, .5, 1.4), smoothstep(-.1, .2, w.y)), max(au, (cor - .5) * .03) * .6 + .05 * (1. - acc))); }
  return fin_;
}` },
// ---------- Lugares ----------
{ id:'faro', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.25 * sin(t * .25) + .3); p.y += .12;
  // peñón y mar
  float d = elipse(p + vec3(0, .95, 0), vec3(.75, .3, .62)) + .06 * sin(p.x * 9.) * sin(p.y * 11.) * sin(p.z * 10.) + .02 * sin(p.x * 27.) * sin(p.z * 25.);
  vec4 c = vec4(vec3(.28, .25, .23), d * .6);
  float mar = p.y + 1.02 + .03 * sin(p.x * 7. + t * 1.6) * sin(p.z * 6. + t) + .015 * sin(p.x * 19. - t * 2.);
  float esp = smoothstep(.12, .0, d);
  c = une(c, vec4(mix(vec3(.08, .2, .3), vec3(.75, .85, .88), esp * .8), max(max(mar, -1.16 - p.y), length(p.xz) - 1.3) * .7));
  // torre a franjas
  float r = length(p.xz), R = .27 - .085 * (p.y + .75);
  float torre = max((r - R) * .95, max(p.y - .55, -.9 - p.y));
  vec3 fr = mix(vec3(.85, .83, .78), vec3(.6, .12, .1), step(0., sin(p.y * 10.5)));
  vec3 v = ronda(p, 4.);
  float ven = step(abs(v.z), .035) * step(abs(fract(p.y * 1.65 + .3) - .5), .1) * step(p.y, .4);
  c = une(c, vec4(mix(fr, vec3(1.5, 1.1, .5), ven), torre));
  // balcón, linterna y cúpula
  c = une(c, vec4(vec3(.2), max(r - .27, abs(p.y - .57) - .025)));
  vec3 q = ronda(p, 12.);
  c = une(c, vec4(vec3(.22), min(capsula(q, vec3(.25, .58, 0), vec3(.25, .7, 0), .009), length(vec2(r - .25, p.y - .7)) - .01)));
  float lin = max(r - .15, abs(p.y - .74) - .15);
  float reja = step(.8, cos(atan(p.z, p.x) * 8.));
  c = une(c, vec4(mix(vec3(1.9, 1.5, .7), vec3(.15), reja), lin));
  c = une(c, vec4(vec3(.5, .12, .1), cono(p, vec3(0, .9, 0), vec3(0, 1.1, 0), .19, .02)));
  // dos haces que giran, hechos de motas
  vec3 h = p - vec3(0, .74, 0); h.xz *= gira(t * .8 + 2. * vuelta()); h.x = abs(h.x);
  float haz = length(h.yz) - .04 - .07 * (h.x - .15);
  float mota = step(.84, fract(sin(dot(floor(h * 19.), vec3(12.9, 78.2, 37.7))) * 4375.));
  haz = max(max(haz, h.x - 1.25), .2 - h.x);
  return une(c, vec4(vec3(1.5, 1.25, .7) * (1. + .3 * acc), mota > .5 ? haz * .6 : max(haz * .6, .03)));
}` },
{ id:'castillo', codigo:
`vec4 criatura(vec3 p, float t) {
  p.yz *= gira(-.2); p.xz *= gira(giro); p.xz *= gira(.6 + .3 * sin(t * .25)); p.y += .2;
  vec4 c = vec4(vec3(.2, .26, .14), (elipse(p + vec3(0, 1.05, 0), vec3(1.3, .4, 1.3)) + .03 * sin(p.x * 9.) * sin(p.z * 8.)) * .7);
  vec3 q = vec3(abs(p.x), p.y, abs(p.z));
  float lad = step(.5, fract(p.y * 8.)) * .5;
  float sil = smoothstep(.06, .0, abs(fract(p.y * 16.) - .5) - .42);
  vec3 piedra = vec3(.46, .42, .38) * (.82 + .25 * fract(sin(dot(floor(vec3(p.x, p.y, p.z) * 14.), vec3(12.9, 78.2, 37.7))) * 4375.));
  // muralla con almenas
  float m = min(caja(q - vec3(.0, -.45, .72), vec3(.72, .32, .06)), caja(q - vec3(.72, -.45, 0), vec3(.06, .32, .72)));
  float al = step(.5, fract(q.x * 6.)) ;
  m = min(m, max(min(caja(q - vec3(0, -.1, .72), vec3(.72, .07, .06)), caja(q - vec3(.72, -.1, 0), vec3(.06, .07, .72))), .03 - abs(fract((q.x + q.z) * 4.) - .5) * .25));
  // portón
  m = max(m, -max(length(vec2(p.x, max(p.y + .45, 0.))) - .17, abs(p.z - .72) - .2));
  c = une(c, vec4(piedra, m * .8));
  c = une(c, vec4(mix(vec3(.25, .15, .08), vec3(.1), step(.75, fract(p.x * 14.))), max(caja(p - vec3(0, -.55, .7), vec3(.16, .24, .02)), -9.)));
  // torres de esquina
  vec3 e = q - vec3(.72, 0, .72);
  float r = length(e.xz);
  float to = max(r - .19, max(e.y - .25, -.8 - e.y));
  to = min(to, max(r - .23, abs(e.y - .25) - .06));
  float vt = step(abs(atan(e.z, e.x) - .78), .22) * step(abs(e.y - .02), .07);
  c = une(c, vec4(mix(piedra, vec3(1.6, 1., .4), vt), to));
  c = une(c, vec4(vec3(.26, .17, .3), cono(e, vec3(0, .3, 0), vec3(0, .78, 0), .24, .01) * .9));
  // torre del homenaje
  float k = caja(p - vec3(0, -.1, -.1), vec3(.3, .66, .3));
  k = min(k, max(caja(p - vec3(0, .6, -.1), vec3(.34, .07, .34)), .06 - abs(fract((q.x + q.z) * 5.) - .5) * .3));
  float ve = step(abs(abs(p.x) - .13), .035) * step(abs(fract(p.y * 2.4) - .5), .16) * step(p.y, .45) * step(-.1, p.y);
  c = une(c, vec4(mix(piedra, vec3(1.7, 1.1, .45), ve), k * .85));
  c = une(c, vec4(vec3(.26, .17, .3), cono(p - vec3(0, .62, -.1), vec3(0), vec3(0, .5, 0), .26, .01) * .9));
  // bandera
  vec3 b = p - vec3(0, 1.14, -.1); c = une(c, vec4(vec3(.3), capsula(b, vec3(0), vec3(0, .3, 0), .012)));
  b.z -= .04 * sin(b.x * 14. - t * 5.) * b.x * 4.;
  vec4 fin_ = une(c, vec4(vec3(.75, .14, .12), caja(b - vec3(.14, .23, 0), vec3(.13, .07 * (1. - 2. * max(0., b.x - .14)), .012)) * .6));
  fin_ = une(fin_, cohetes(p));
  return fin_;
}` },
{ id:'ciudad', codigo:
`vec4 criatura(vec3 p, float t) {
  p.yz *= gira(-.42); p.xz *= gira(giro); p.xz *= gira(.6 + t * .08); p.y += .5;
  vec4 c = vec4(vec3(.12, .13, .16), caja(p + vec3(0, .3, 0), vec3(1.25, .06, 1.25)));
  float calle = max(step(.43, abs(fract(p.x / .4 + .5) - .5)), step(.43, abs(fract(p.z / .4 + .5) - .5)));
  float coche = step(.8, fract(p.x * 4. + p.z * 4. + t * .8)) * calle;
  c.xyz = mix(mix(vec3(.2), vec3(.07), calle), vec3(1.7, 1.2, .5), coche * step(-.25, p.y));
  for (int i = 0; i < 2; i++) {
    // dos vecinos para que las torres altas no se corten
    vec2 base = round(p.xz / .4) + (i == 0 ? vec2(0) : vec2(sign(p.x - round(p.x / .4) * .4), 0));
    vec2 id = clamp(base, vec2(-2.), vec2(2.));
    float h = fract(sin(dot(id, vec2(12.9, 78.2))) * 4375.5);
    float alto = .18 + .85 * h * exp(-.28 * dot(id, id)) + .35 * step(.8, h);
    vec3 q = vec3(p.x - id.x * .4, p.y + .24, p.z - id.y * .4);
    float esc = q.y > alto * 1.3 ? .6 : 1.;
    float d = caja(q - vec3(0, alto, 0), vec3(.135 * (h > .6 && q.y > alto * 1.3 ? .62 : 1.), alto, .135));
    if (h > .75) d = min(d, capsula(q, vec3(0, alto * 2., 0), vec3(0, alto * 2. + .25, 0), .012));
    vec2 w = floor(vec2((abs(q.x) > abs(q.z) ? q.z : q.x) * 26. + 50., q.y * 22.));
    float hay = fract(sin(dot(w + id * 7., vec2(39.3, 11.7))) * 4375.);
    float marco = step(.25, fract(q.y * 22.)) * step(.25, fract((abs(q.x) > abs(q.z) ? q.z : q.x) * 26. + 50.));
    float on = step(.52, hay) * marco * step(q.y, alto * 2. - .03) * step(.02, q.y);
    if (tq < 3.2) on *= step(q.y, max(0., tq - .4) * .95);
    vec3 lz = hay > .9 ? vec3(.5, 1.2, 1.5) : vec3(1.55, 1.1, .5);
    c = une(c, vec4(mix(mix(vec3(.16, .18, .24), vec3(.27, .26, .3), h), lz, on), d * .55));
  }
  return c;
}` },
{ id:'templo', codigo:
`vec4 criatura(vec3 p, float t) {
  p.yz *= gira(-.16); p.xz *= gira(giro); p.xz *= gira(.65 + .3 * sin(t * .2)); p.y += .1;
  vec3 marmol = vec3(.72, .68, .6) * (.88 + .14 * sin(p.x * 9. + 3. * sin(p.y * 7. + p.z * 5.)));
  // escalinata
  float d = caja(p + vec3(0, .86, 0), vec3(1.3, .06, .86));
  d = min(d, caja(p + vec3(0, .75, 0), vec3(1.22, .06, .78)));
  d = min(d, caja(p + vec3(0, .64, 0), vec3(1.14, .06, .7)));
  // columnas estriadas en el perímetro
  vec2 id = clamp(round(p.xz / vec2(.34, .5)), vec2(-3, -1), vec2(3, 1));
  if (abs(id.x) < 2.5 && abs(id.y) < .5) id.y = p.z > 0. ? 1. : -1.;
  vec3 q = vec3(p.x - id.x * .34, p.y, p.z - id.y * .55);
  float r = length(q.xz), a = atan(q.z, q.x);
  float R = .105 - .02 * (p.y + .6) + .006 * cos(a * 14.);
  bool rota = id.x == 3. && id.y == 1.;
  float tope = rota ? -.15 + .05 * sin(a * 3.) : .42;
  float col = max((r - R) * .8, max(p.y - tope, -.6 - p.y));
  if (!rota) col = min(col, caja(q - vec3(0, .43, 0), vec3(.135, .035, .135)));
  d = min(d, col);
  // entablamento y frontón
  float ent = caja(p - vec3(0, .54, 0), vec3(1.16, .07, .7));
  ent = min(ent, caja(p - vec3(0, .65, 0), vec3(1.2, .035, .74)));
  float fr = max(max(abs(p.x) * .36 + (p.y - .68) * .93 - .41, .68 - p.y), abs(p.z) - .7);
  fr = max(fr, -max(max(abs(p.x) * .36 + (p.y - .72) * .93 - .33, .72 - p.y), .64 - abs(p.z)));
  // una esquina se vino abajo
  float hueco = esfera(p - vec3(1.2, .62, .72), .38) + .05 * sin(p.x * 14.) * sin(p.y * 13.) * sin(p.z * 15.);
  d = min(d, max(min(ent, fr), -hueco) * .85);
  d = min(d, caja(p - vec3(.93, -.52, .52), vec3(.13, .06, .09)));
  d += .006 * sin(p.x * 31.) * sin(p.y * 29.) * sin(p.z * 33.);
  // brasero
  vec4 c = vec4(marmol, d * .75);
  c = une(c, vec4(vec3(.35, .24, .12), cono(p, vec3(0, -.58, 0), vec3(0, -.3, 0), .05, .13)));
  return une(c, vec4(mix(vec3(1.8, .85, .25), vec3(.4, 1.1, 1.9), acc), (elipse(p - vec3(0, -.12 + .15 * acc, 0), vec3(.1 + .1 * acc, .22 + .02 * sin(t * 9.) + .18 * acc, .1 + .1 * acc)) + .02 * sin(p.y * 22. - t * 9.)) * .6));
}` },
// ---------- Objetos ----------
{ id:'calavera', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.55 * sin(t * .4)); p.y -= .08;
  vec3 q = vec3(abs(p.x), p.yz);
  // cráneo y pómulos
  float d = elipse(p - vec3(0, .25, -.12), vec3(.68, .68, .8));
  d = funde(d, elipse(p - vec3(0, -.18, .3), vec3(.42, .42, .36)), .2);
  d = funde(d, elipse(q - vec3(.42, -.14, .36), vec3(.17, .12, .2)), .12);
  d = funde(d, elipse(q - vec3(.24, .17, .56), vec3(.28, .07, .12)), .1);
  d = max(d, -elipse(q - vec3(.62, -.05, .15), vec3(.14, .25, .3)));
  // cuencas y nariz
  float cue = elipse(q - vec3(.25, .0, .62), vec3(.18, .17, .24));
  d = max(d, -funde(cue, 9., .01));
  vec3 n = vec3(q.x - .05, p.y + .24, p.z - .66); n.xy *= gira(.25);
  d = max(d, -elipse(n, vec3(.06, .13, .16)));
  // maxilar, mandíbula que se mueve
  float ab = .05 + .05 * max(0., sin(t * .9)) + acc * .14 * abs(sin(tq * 9.));
  d = funde(d, elipse(p - vec3(0, -.46, .38), vec3(.3, .16, .26)), .08);
  vec3 j = p + vec3(0, ab, 0);
  float ma = max(elipse(j - vec3(0, -.62, .22), vec3(.37, .24, .42)), -elipse(j - vec3(0, -.56, .1), vec3(.27, .3, .42)));
  ma = funde(ma, cono(vec3(abs(j.x), j.yz), vec3(.4, -.55, .05), vec3(.46, -.15, -.02), .1, .07), .08);
  d = min(d, ma);
  float g = grieta(p * .9 + 2.) * step(.2, p.y) * step(.0, p.x);
  float sut = smoothstep(.03, .0, abs(p.z + .1 + .03 * sin(p.x * 30.))) * step(.5, p.y);
  vec4 c = vec4(vec3(.78, .7, .56) * (1. - .55 * max(g, sut)), d * .75);
  // dientes
  vec3 e = p; float ar = .62 - .9 * p.x * p.x;
  e.x -= .085 * clamp(round(e.x / .085), -3., 3.);
  c = une(c, vec4(vec3(.82, .76, .62), caja(vec3(e.x, p.y + .56, p.z - ar), vec3(.026, .07, .03)) - .012));
  c = une(c, vec4(vec3(.8, .74, .6), caja(vec3(e.x, j.y + .66, p.z - ar + .03), vec3(.024, .06, .03)) - .012));
  // brasa al fondo de las cuencas
  return une(c, vec4(vec3(1.5, .6, .2) * (.85 + .15 * sin(t * 3.)), esfera(q - vec3(.25, .0, .46 + .06 * acc), .055 + .05 * acc)));
}` },
{ id:'arena', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xy *= gira(.06 * sin(t * .5) + vuelta()); p.xz *= gira(t * .25);
  float r = length(p.xz), a = atan(p.z, p.x), s = fract(t * .04);
  // tapas torneadas y tres columnas
  float y = abs(p.y);
  float m = max(r - .66, abs(y - 1.1) - .055) ;
  m = min(m, max(r - .56, abs(y - 1.) - .05));
  vec3 q = ronda(p, 3.);
  float co = length(q.xz - vec2(.56, 0)) - .05 - .02 * cos(p.y * 12.) - .015 * cos(p.y * 33.);
  m = min(m, max(co, y - 1.05));
  vec4 c = vec4(vec3(.42, .25, .13) * (.85 + .2 * sin(p.y * 50. + a * 2.)), m * .8);
  // vidrio: nervaduras finas
  float perfil = .05 + .42 * sqrt(max(0., 1. - pow((y - .52) / .5, 2.)));
  perfil = max(perfil, .05);
  float vid = max(abs(r - perfil) - .012, y - .98) * .6;
  float nerv = min(abs(fract(a * 2.546) - .5), abs(fract(p.y * 4.) - .5));
  c = une(c, vec4(vec3(.6, .75, .82), max(vid, (nerv - .045) * .3)));
  // arena de arriba, hilo y montón
  float den = r - perfil + .035;
  float nivel = mix(.85, .1, s) + .25 * (r - .2) * (1. - s);
  float ar = max(max(den, p.y - nivel), .03 - p.y);
  float cima = -.95 + .75 * s;
  ar = min(ar, max(max(den, p.y - cima - .25 * (.3 - r) + .0), -.98 - p.y));
  ar = min(ar, max(r - .014 - .004 * sin(p.y * 60. + t * 30.), max(p.y - .1, cima - p.y)));
  return une(c, vec4(vec3(.9, .68, .36) * (.8 + .3 * fract(sin(dot(floor(p * 60.), vec3(12.9, 78.2, 37.7))) * 4375.)), ar * .55));
}` },
{ id:'taza', codigo:
`vec4 criatura(vec3 p, float t) {
  p.yz *= gira(-.38); p.xz *= gira(giro); p.xz *= gira(.4 * sin(t * .3) - .4); p.y += .3;
  float r = length(p.xz);
  // plato
  float pl = max(abs(p.y + .52 - .16 * smoothstep(.4, 1., r)) - .025, r - 1.);
  vec4 c = vec4(mix(vec3(.82, .8, .76), vec3(.2, .32, .45), smoothstep(.03, .01, abs(r - .88))), pl * .8);
  // taza hueca
  float R = .46 + .12 * smoothstep(-.5, .5, p.y);
  float d = max(r - R, abs(p.y) - .48);
  d = max(d, -max(r - R + .05, -p.y - .42));
  float asa = length(vec2(length((p.xy - vec2(.6, 0)) * vec2(1., .85)) - .24, p.z)) - .055;
  d = min(d, max(asa, R - .05 - p.x));
  float a = atan(p.z, p.x);
  float greca = step(abs(abs(p.y + .02) - .2), .018) + step(abs(p.y + .02 - .12 * sin(a * 10.)), .03);
  c = une(c, vec4(mix(vec3(.85, .83, .8), vec3(.2, .32, .45), min(greca, 1.) * step(R - .04, r)), d * .8));
  // café con espuma
  float esp = smoothstep(.1, .4, sin(a * 3. + r * 16. - t * .5 - acc * tq * 5.) * .5 + .3);
  c = une(c, vec4(mix(vec3(.22, .11, .05), vec3(.7, .5, .3), esp * smoothstep(.5, .1, r)), max(r - R + .04, abs(p.y - .3) - .02)));
  // vapor
  for (int i = 0; i < 3; i++) {
    float f = float(i) - 1.;
    vec3 v = p - vec3(f * .2, .4, 0);
    v.x -= .1 * sin(v.y * 5. - t * 1.6 + f * 2.) * v.y; v.z -= .08 * cos(v.y * 4. - t + f);
    float h = clamp(v.y / .95, 0., 1.);
    float va = max(length(v.xz) - .05 * acc - .04 * (1. - h) - .01, max(v.y - .95 - .25 * acc + .2 * abs(f), -v.y));
    float hu = step(.25 + .6 * h, fract(sin(dot(floor(vec2(v.y * 24. - t * 6., f)), vec2(12.9, 78.2))) * 4375.));
    c = une(c, vec4(vec3(.75, .78, .8), hu > .5 ? va * .6 : max(va * .6, .03)));
  }
  vec4 fin_ = c;
  if (tq < 3.) { float k = tq * 6.; vec3 o = vec3(.2 * cos(k), .2, .2 * sin(k)); fin_ = une(fin_, vec4(vec3(.75, .72, .66), capsula(p, o, o * vec3(1.8, 1., 1.8) + vec3(0, .85, 0), .035) + .3 * (1. - acc))); }
  return fin_;
}` },
{ id:'auto', codigo:
`vec4 criatura(vec3 p, float t) {
  p.yz *= gira(-.2); p.xz *= gira(giro); p.xz *= gira(.65 + .35 * sin(t * .3)); p.y += .05 + .008 * sin(t * 22.);
  vec3 q = vec3(p.xy, abs(p.z));
  // carrocería
  float d = caja(p - vec3(0, -.22, 0), vec3(1.05, .13, .4)) - .1;
  d = funde(d, elipse(p - vec3(-.62, -.08, 0), vec3(.55, .2, .36)), .12);
  d = funde(d, elipse(p - vec3(.72, -.1, 0), vec3(.5, .18, .38)), .12);
  // cabina
  float cab = max(elipse(p - vec3(.08, .1, 0), vec3(.62, .42, .36)), -p.y - .1);
  // pasos de rueda
  vec3 w = vec3(abs(p.x - .02) - .68, p.y + .36, q.z - .42);
  d = max(d, -max(length(w.xy) - .27, abs(w.z) - .18));
  float cromo = smoothstep(.02, .0, abs(p.y + .16)) * step(.4, q.z);
  float puerta = smoothstep(.012, .0, abs(abs(p.x - .1) - .28)) * step(-.3, p.y) * step(.4, q.z);
  vec4 c = vec4(mix(vec3(.45, .06, .07), vec3(.85), cromo) * (1. - .7 * puerta), d * .8);
  // vidrios y postes
  float poste = min(min(abs(p.x - .1), abs(abs(p.x - .1) - .42)) , 9.);
  float vid = step(.035, poste) * step(.04, p.y) * step(p.y, .38);
  c = une(c, vec4(mix(vec3(.45, .06, .07), vec3(.12, .2, .26), vid), cab * .8));
  // ruedas
  float r = length(w.xy);
  float llanta = max(r - .215, abs(w.z) - .09) - .015;
  float rayo = step(.4, cos(atan(w.y, w.x) * 8. - t * 6. - acc * tq * 14.));
  c = une(c, vec4(mix(vec3(.06), mix(vec3(.5), vec3(.85), rayo), step(r, .13)), llanta));
  // parachoques, parrilla y faros
  c = une(c, vec4(vec3(.8), min(capsula(q, vec3(-1.18, -.3, 0), vec3(-1.1, -.3, .42), .04), capsula(q, vec3(1.2, -.3, 0), vec3(1.12, -.3, .42), .04))));
  c = une(c, vec4(mix(vec3(.15), vec3(.8), step(.5, fract(p.z * 18.))), caja(p - vec3(-1.14, -.17, 0), vec3(.02, .08, .2))));
  c = une(c, vec4(vec3(1.8, 1.55, 1.), esfera(q - vec3(-1.1, -.1, .32), .085 + .03 * acc)));
  c = une(c, vec4(vec3(1.5, .2, .12), esfera(q - vec3(1.16, -.12, .34), .05)));
  // asfalto
  float raya = step(.5, fract(p.x * 1.2 + t * 1.5)) * step(abs(p.z - .75), .03);
  return une(c, vec4(mix(vec3(.13), vec3(.75, .65, .3), raya), caja(p + vec3(0, .65, 0), vec3(1.35, .03, .85))));
}` },
{ id:'velero', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.5 + .25 * sin(t * .25)); p.y += .12;
  vec3 m = p;
  p.xy *= gira(.07 * sin(t * .9) + .2 * acc * sin(tq * 3.6)); p.yz *= gira(.1 * acc * sin(tq * 2.7)); p.y -= .03 * sin(t * 1.3);
  // casco
  float w = .3 * (1. - .75 * p.x * p.x) * smoothstep(-1.1, -.55, p.y + .1);
  float popa = p.y - .12 * p.x * p.x;
  float d = max(max((abs(p.z) - w) * .6, popa + .52), max(abs(p.x) - 1.05 - .25 * (p.y + .6), -1. - p.y));
  float tabl = smoothstep(.2, .0, abs(fract(p.y * 13.) - .5) - .35);
  vec3 ma = mix(vec3(.36, .2, .1), vec3(.2, .11, .06), tabl);
  ma = mix(ma, vec3(.75, .65, .45), smoothstep(.035, .02, abs(popa + .57)));
  vec4 c = vec4(ma, d * .8);
  // mástiles
  float mas = capsula(p, vec3(.1, -.6, 0), vec3(.1, 1.15, 0), .03);
  mas = min(mas, capsula(p, vec3(-.55, -.6, 0), vec3(-.55, .8, 0), .025));
  mas = min(mas, capsula(p, vec3(.9, -.4, 0), vec3(1.4, -.1, 0), .025));
  c = une(c, vec4(vec3(.32, .2, .11), mas));
  // velas hinchadas
  float so = .9 + .1 * sin(t * 1.4);
  for (int i = 0; i < 4; i++) {
    float f = float(i);
    vec3 b = i == 0 ? vec3(.1, .02, 0) : i == 1 ? vec3(.1, .66, 0) : i == 2 ? vec3(-.55, -.05, 0) : vec3(-.55, .47, 0);
    vec2 h = i == 0 ? vec2(.42, .32) : i == 1 ? vec2(.33, .25) : i == 2 ? vec2(.34, .26) : vec2(.26, .2);
    vec3 s = p - b;
    float an = h.x * (1. - .12 * s.y / h.y);
    s.x -= .2 * so * (1. - pow(s.z / h.x, 2.) * .7) * (1. - pow(s.y / h.y, 2.) * .7);
    float ve = max(abs(s.x) - .015, max(abs(s.z) - an, abs(s.y) - h.y + .05 * cos(s.z * 5.)));
    float cos_ = smoothstep(.03, .0, abs(fract(s.z * 6.) - .5) - .45);
    c = une(c, vec4(vec3(.82, .77, .66) * (1. - .2 * cos_), ve * .55));
  }
  vec3 g = p - vec3(.1, 1.15, 0); g.z -= .05 * sin(g.x * 12. - t * 6.);
  c = une(c, vec4(vec3(.6, .12, .1), caja(g - vec3(.14, -.04, 0), vec3(.14, .06, .012)) * .7));
  // mar
  float ma2 = m.y + .78 + (.05 + .07 * acc) * sin(m.x * 4. + t * 1.5) * cos(m.z * 3.5 + t) + .02 * sin(m.x * 11. - t * 2.2 + m.z * 5.);
  float esp = smoothstep(.1, .0, d + .02) + step(.85, sin(m.x * 9. + t * 2.) * sin(m.z * 8. - t));
  return une(c, vec4(mix(vec3(.07, .2, .28), vec3(.7, .82, .85), min(esp, 1.) * .7), max(max(ma2, -1.02 - m.y), length(m.xz * vec2(.8, 1.1)) - 1.15) * .65));
}` },
// ---------- Formas ----------
{ id:'dona', codigo:
`vec4 criatura(vec3 p, float t) {
  p.yz *= gira(.8 + t * .5); p.xy *= gira(t * .33);
  float r = length(p.xz) - .72;
  float d = length(vec2(r, p.y)) - .4;
  float a = atan(p.z, p.x), v = atan(p.y, r);
  vec4 c = vec4(vec3(.66, .42, .2) * (.9 + .12 * sin(a * 30.) * sin(v * 20.)), d);
  // glaseado que escurre
  float g = length(vec2(r, p.y)) - .425;
  g = max(g, -p.y - .02 - .07 * sin(a * 7.) - .03 * sin(a * 13. + 1.));
  c = une(c, vec4(vec3(.78, .38, .5), g * .8));
  // chispas
  vec2 id = floor(vec2(a * 6.4, v * 5.)), f = fract(vec2(a * 6.4, v * 5.)) - .5;
  float h = fract(sin(dot(id, vec2(12.9, 78.2))) * 4375.);
  f *= mat2(cos(h * 6.), -sin(h * 6.), sin(h * 6.), cos(h * 6.));
  float ch = step(abs(f.x), .32) * step(abs(f.y), .11) * step(.25, v) * step(v, 2.9);
  vec3 co = h < .33 ? vec3(.95, .8, .25) : h < .66 ? vec3(.3, .75, .85) : vec3(.95, .95, .9);
  if (c.x > .7) c.xyz = mix(c.xyz, co, ch);
  if (tq < 3.) { vec3 b3 = ronda(p, 3.); float bo = esfera(b3 - vec3(1.02, .1, 0), .46 * smoothstep(0., .3, acc)) - .03 * sin(a * 16.); c.w = max(c.w, -bo); if (c.w < -bo + .01 && bo < .03) c.xyz = vec3(.8, .6, .36); }
  return c;
}` },
{ id:'nudo', codigo:
`vec4 criatura(vec3 p, float t) {
  p.yz *= gira(.5 + .3 * sin(t * .4)); p.xz *= gira(t * .35);
  float a = atan(p.z, p.x);
  vec2 q = vec2(length(p.xz) - .78, p.y);
  q *= gira(a * 1.5 + t * .3 + vuelta());
  q.x = abs(q.x) - .3 * (1. - .75 * acc);
  float d = length(q) - .17 * (1. + .35 * acc);
  float v = atan(q.y, q.x);
  float banda = sin(v * 3. + a * 18.);
  vec3 m = mix(vec3(.5, .3, .12), vec3(.95, .74, .4), smoothstep(-.6, .6, banda));
  m = mix(m, vec3(.3, 1.2, 1.1), smoothstep(.93, 1., sin(a * 2. - t * 2.)) * .8);
  return vec4(m, (d + .008 * banda) * .6);
}` },
{ id:'fractal', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(t * .2); p.yz *= gira(.4 * sin(t * .25));
  p /= .98;
  vec3 z = p; float dr = 1., r = 0., trampa = 9.;
  for (int i = 0; i < 5; i++) {
    r = length(z); if (r > 1.6) break;
    float th = acos(clamp(z.y / max(r, 1e-4), -1., 1.)) * 8. , ph = atan(z.z, z.x) * 8. + .6 * sin(t * .2) + vuelta();
    dr = pow(r, 7.) * 8. * dr + 1.;
    z = pow(r, 8.) * vec3(sin(th) * cos(ph), cos(th), sin(th) * sin(ph)) + p;
    trampa = min(trampa, length(z.xz));
  }
  float d = .5 * log(max(r, 1e-4)) * r / dr;
  vec3 m = mix(vec3(.15, .3, .55), vec3(.95, .62, .3), smoothstep(.1, .8, trampa));
  m = mix(m, vec3(.85, .9, .95), smoothstep(.8, 1.1, length(p)) * .5);
  return vec4(m, max(d, length(p) - 1.25) * .8);
}` }
);
