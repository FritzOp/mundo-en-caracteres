// Segunda tanda de la galería. Cada `codigo` es GLSL: el dibujo de una obra.
CRIATURAS.push(
// ---------- Espacio ----------
{ id:'tierra', codigo:
`vec4 criatura(vec3 p, float t) {
  vec3 l = p;
  p.xy *= gira(.4); p.xz *= gira(t * .18);
  vec3 n = p / max(length(p), .01);
  float f = sin(n.x * 4. + 1.8 * sin(n.y * 3.1 + 1.)) + sin(n.y * 4.6 + n.z * 3.2 + 1.4 * sin(n.x * 2.7)) + .55 * sin(n.z * 9. + n.x * 7.) * sin(n.y * 8. + 2.) + .25 * sin(n.x * 21. + n.y * 17.) * sin(n.z * 19.);
  float tierra = smoothstep(.42, .52, f);
  vec3 suelo = mix(vec3(.16, .34, .14), vec3(.52, .42, .26), smoothstep(.15, .6, 1. - abs(n.y * 1.6) + .3 * sin(n.x * 9.)));
  vec3 c = mix(vec3(.05, .16, .38), suelo, tierra);
  c = mix(c, vec3(.9, .94, .97), smoothstep(.8, .88, abs(n.y) + .05 * sin(n.x * 14.) * sin(n.z * 13.)));
  vec3 v = n; v.xz *= gira(t * .06);
  float nub = sin(v.x * 5. + 2.2 * sin(v.y * 5. + v.z * 2.)) + sin(v.z * 7. + 1.6 * sin(v.x * 6.)) + .5 * sin(v.y * 19. + v.x * 13.);
  c = mix(c, vec3(.92), smoothstep(.75, 1.4, nub) * .85);
  c += acc * tierra * step(.86, fract(sin(dot(floor(n * 26.), vec3(12.9, 78.2, 37.7))) * 4375.)) * vec3(1.7, 1.2, .5);
  vec4 r = vec4(c, esfera(p, .88) - .012 * smoothstep(.9, 1.4, nub));
  vec3 m = vec3(1.2 * cos(t * .3), .4, 1.2 * sin(t * .3));
  return une(r, vec4(vec3(.6, .58, .55), esfera(l - m, .12) + .008 * sin(l.x * 40.) * sin(l.y * 37.)));
}` },
{ id:'sol', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(t * .12); p.xy *= gira(.2);
  vec3 n = p / max(length(p), .01);
  float g = sin(n.x * 11. + 2. * sin(n.y * 9. + t * .6)) * sin(n.y * 12. + 2. * sin(n.z * 8. - t * .5)) + .6 * sin(n.z * 23. + n.x * 19. + t) * sin(n.y * 25. - t * .7);
  float mancha = smoothstep(.1, .05, length(n - normalize(vec3(.5, .3, .8)))) + smoothstep(.08, .04, length(n - normalize(vec3(-.6, -.25, .7))));
  vec3 c = mix(vec3(1.25, .38, .08), vec3(1.85, 1.25, .45), smoothstep(-.8, .9, g)) * (1. - .55 * min(mancha, 1.)) * (1. + .25 * acc);
  vec4 r = vec4(c, (esfera(p, .8) - .02 * g) * .8);
  // protuberancias: arcos de plasma
  for (int i = 0; i < 5; i++) {
    float k = float(i);
    vec3 d = normalize(vec3(sin(k * 2.4), cos(k * 1.7) * .8, cos(k * 2.4)));
    vec3 q = p - d * .8;
    vec3 u = normalize(cross(d, vec3(.3, 1., .2))), w = cross(d, u);
    vec3 s = vec3(dot(q, u), dot(q, d), dot(q, w));
    float R = .16 + .2 * acc * (.6 + .4 * sin(tq * 3. + k)) + .05 * sin(t * .5 + k * 2.);
    float arc = length(vec2(length(s.xy) - R, s.z)) - .022 - .008 * sin(atan(s.y, s.x) * 9. - t * 4.);
    r = une(r, vec4(vec3(1.7, .7, .18), arc * .8));
  }
  return r;
}` },
{ id:'satelite', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xy *= gira(.35); p.xz *= gira(t * .25); p.yz *= gira(.25 * sin(t * .3));
  // cuerpo con lámina dorada arrugada
  float arr = .012 * sin(p.x * 31. + 3. * sin(p.y * 23.)) * sin(p.z * 29. + 2. * sin(p.x * 19.));
  vec4 c = vec4(mix(vec3(.5, .34, .1), vec3(.95, .74, .32), .5 + 30. * arr), (caja(p, vec3(.27, .36, .27)) + arr) * .8);
  c = une(c, vec4(vec3(.7), caja(p - vec3(0, .39, 0), vec3(.2, .04, .2))));
  // paneles
  vec3 q = vec3(abs(p.x), p.yz);
  c = une(c, vec4(vec3(.6), capsula(q, vec3(.2, 0, 0), vec3(.45, 0, 0), .03)));
  vec3 s = q - vec3(.86, 0, 0); s.yz *= gira(.35 + 3.1416 * smoothstep(0., 1., clamp(tq / 2.2, 0., 1.)));
  float rej = max(step(.9, abs(fract(s.x * 7.) * 2. - 1.)), step(.88, abs(fract(s.y * 7.) * 2. - 1.)));
  c = une(c, vec4(mix(vec3(.06, .12, .32), vec3(.6, .62, .65), rej), caja(s, vec3(.42, .32, .012))));
  // antena parabólica
  vec3 a = p - vec3(0, -.58, .12); a.yz *= gira(.6);
  float pa = max(abs(length(a - vec3(0, -.42, 0)) - .5) - .014, -a.y - .12);
  pa = max(pa, length(a.xz) - .34);
  c = une(c, vec4(vec3(.82), pa * .8));
  c = une(c, vec4(vec3(.5), min(capsula(a, vec3(0, .06, 0), vec3(0, -.3, 0), .014), esfera(a - vec3(0, -.3, 0), .035))));
  c = une(c, vec4(vec3(.5), capsula(p, vec3(0, -.3, 0), vec3(0, -.5, .08), .03)));
  c = une(c, vec4(vec3(.5), capsula(p, vec3(.12, .4, 0), vec3(.2, .8, 0), .012)));
  float luz = step(.6, sin(t * 4.));
  vec4 fin_ = une(c, vec4(mix(vec3(.3, .05, .05), vec3(1.9, .3, .2), luz), esfera(p - vec3(.2, .82, 0), .03)));
  if (tq < 2.6) for (int i = 0; i < 3; i++) { float u = fract(tq * .9 + float(i) / 3.);
    fin_ = une(fin_, vec4(vec3(.5, 1.5, 1.7), length(vec2(length(a.xz) - .1 - .5 * u, a.y + .35 + .7 * u)) - .022 * (1. - u) * acc + .02 * (1. - acc))); }
  return fin_;
}` },
{ id:'ovni', codigo:
`vec4 criatura(vec3 p, float t) {
  p.y -= .42 + .05 * sin(t * 1.1);
  vec3 g = p;
  p.xy *= gira(.08 * sin(t * .9));
  float r = length(p.xz), a = atan(p.z, p.x);
  float d = elipse(p, vec3(1.05, .2, 1.05));
  d = funde(d, max(r - .5, abs(p.y + .1) - .1), .12);
  float pan = smoothstep(.03, .0, abs(fract(a * 1.91) - .5) * r) * .5;
  vec4 c = vec4(vec3(.55, .58, .6) * (1. - pan), d * .8);
  // cúpula y silueta al mando
  c = une(c, vec4(vec3(.3, .62, .6), max(elipse(p - vec3(0, .12, 0), vec3(.42, .38, .42)), .12 - p.y)));
  c = une(c, vec4(vec3(.7), length(vec2(r - .43, p.y - .14)) - .03));
  // luces del borde, corriendo
  float n = gajo(p, 14.);
  vec3 q = ronda(p, 14.) - vec3(1.0, 0, 0);
  float on = pow(.5 + .5 * cos(n * .9 - t * 5.), 3.);
  c = une(c, vec4(mix(vec3(.5, .35, .1), vec3(1.9, 1.4, .5), on), esfera(q, .06)));
  c = une(c, vec4(vec3(.8, 1.6, 1.5), elipse(p + vec3(0, .2, 0), vec3(.36, .06, .36))));
  // haz de motas que suben
  float h = -(g.y + .25);
  float cono_ = length(g.xz) - .28 - .34 * h;
  float mota = step(.9 + .085 * acc, fract(sin(dot(floor(vec3(g.x, g.y - t * .5, g.z) * 17.), vec3(12.9, 78.2, 37.7))) * 4375.));
  float haz = max(max(cono_, h - 1.2), -h + .02);
  c = une(c, vec4(vec3(.6, 1.35, 1.25), mota > .5 ? haz * .6 : max(haz * .6, .03)));
  // suelo iluminado
  float s = length(g.xz);
  vec4 fin_ = une(c, vec4(mix(vec3(.12, .2, .12), vec3(.5, 1.12, .95), smoothstep(.75, .5, s)), (elipse(g + vec3(0, 1.62, 0), vec3(1.1, .14, 1.1)) + .012 * sin(g.x * 31.) * sin(g.z * 29.)) * .8));
  if (tq < 3.2) { vec3 b = g - vec3(0, -1.42 + 1.05 * smoothstep(.3, 2.6, tq), 0); b.xz *= gira(tq * 2.); b.xy *= gira(.4 * sin(tq * 3.)); b /= max(.05, acc);
    vec3 m = vec3(b.x, b.y, abs(b.z));
    float v = elipse(b, vec3(.2, .12, .11)); v = funde(v, elipse(b - vec3(-.22, .06, 0), vec3(.09, .07, .07)), .05);
    v = min(v, capsula(vec3(abs(b.x) - .11, b.y, m.z - .06), vec3(0, -.08, 0), vec3(0, -.24, 0), .028));
    fin_ = une(fin_, vec4(mix(vec3(.9), vec3(.1), step(.25, sin(b.x * 19. + 1.) * sin(b.y * 17. + b.z * 15.))), v * max(.05, acc) * .8)); }
  return fin_;
}` },
// ---------- Naturaleza ----------
{ id:'girasol', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xy *= gira(.05 * sin(t * .8));
  vec3 q = p - vec3(0, .42, .05); q.yz *= gira(.22); q.xz *= gira(.25 * sin(t * .3));
  vec3 s = vec3(q.x, q.z, q.y); s.xz *= gira(vuelta());
  float r = length(s.xz), a = atan(s.z, s.x);
  // disco de semillas en espiral
  float esp = sin(a * 21. + r * 46.) * sin(a * 13. - r * 46.);
  vec4 c = vec4(mix(vec3(.16, .09, .04), vec3(.5, .33, .12), smoothstep(-.2, .8, esp) * smoothstep(.05, .34, r)), elipse(s - vec3(0, .02, 0), vec3(.4, .13, .4)) - .012 * esp);
  // tres capas de pétalos
  for (int i = 0; i < 3; i++) {
    float f = float(i);
    vec3 u = s; u.xz *= gira(f * .1232);
    u = ronda(u, 17.);
    u.y += .05 * f + .18 * (u.x - .35) * (u.x - .35) - .03;
    float pe = elipse(u - vec3(.58 + .02 * f, 0, 0), vec3(.3, .028, .085));
    float ner = smoothstep(.012, .0, abs(u.z)) * .25;
    c = une(c, vec4(mix(vec3(.75, .38, .03), vec3(1., .76, .14), smoothstep(.35, .7, r)) * (1. - ner), pe * .65));
  }
  // tallo y hojas
  c = une(c, vec4(vec3(.22, .36, .14), curva(p, vec3(0, .4, -.08), vec3(.08, -.4, -.1), vec3(-.04, -1.35, 0), .05, .065)));
  for (int i = 0; i < 2; i++) {
    float k = i == 0 ? 1. : -1.;
    vec3 h = p - vec3(.02, -.45 - .3 * float(i), -.05); h.x *= k; h.xy *= gira(-.35 + .06 * sin(t + float(i)));
    h.y += .35 * h.x * h.x - .1 * h.x;
    float hoja = elipse(h - vec3(.36, 0, 0), vec3(.36, .03, .22 - .12 * h.x)) ;
    c = une(c, vec4(mix(vec3(.16, .3, .1), vec3(.34, .5, .2), smoothstep(.02, .0, abs(abs(h.z) - .3 * fract(h.x * 7.) * .3)) + smoothstep(.02, .0, abs(h.z))), hoja * .65));
  }
  return c;
}` },
{ id:'cactus', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.3 * sin(t * .25));
  p.x += acc * .09 * sin(tq * 8.) * (p.y + 1.1);
  vec3 arena = vec3(.62, .46, .27);
  float du = elipse(p + vec3(0, 1.22, 0), vec3(1.2, .24, 1.)) + .012 * sin(p.x * 30. + 4. * sin(p.z * 5.));
  vec4 c = vec4(arena, du * .8);
  // tronco y brazos acanalados
  float ang = atan(p.z, p.x);
  float d = capsula(p, vec3(0, -1.2, 0), vec3(0, .85, 0), .27) + .02 * cos(ang * 14.);
  vec3 b = p - vec3(.0, -.2, 0);
  float br = curva(p, vec3(.15, -.3, 0), vec3(.72, -.35, 0), vec3(.66, .1, .02), .15, .155);
  br = min(br, capsula(p, vec3(.66, .1, .02), vec3(.64, .45, .02), .155));
  float bl = curva(p, vec3(-.15, .0, 0), vec3(-.66, -.02, 0), vec3(-.6, .35, -.02), .13, .135);
  bl = min(bl, capsula(p, vec3(-.6, .35, -.02), vec3(-.58, .68, -.02), .135));
  vec2 e1 = p.xz - vec2(.65, .02), e2 = p.xz + vec2(.59, .02);
  br += .014 * cos(atan(e1.y, e1.x) * 11.) * step(.0, p.y);
  bl += .013 * cos(atan(e2.y, e2.x) * 11.) * step(.25, p.y);
  d = funde(d, min(br, bl), .08);
  float surco = .5 + .5 * cos(ang * 14.);
  float esp = step(.82, fract(p.y * 13.)) * smoothstep(.25, .0, surco);
  vec3 piel = mix(vec3(.16, .34, .16), vec3(.34, .52, .26), 1. - surco);
  c = une(c, vec4(mix(piel, vec3(.88, .82, .62), esp), d * .75));
  // flores en las puntas
  for (int i = 0; i < 3; i++) {
    vec3 o = i == 0 ? vec3(0, 1.13, 0) : i == 1 ? vec3(.64, .62, .02) : vec3(-.58, .83, -.02);
    vec3 q = ronda(p - o, 7.); q.xy *= gira(-.6 + .5 * acc); q /= 1. + .9 * acc;
    c = une(c, vec4(mix(vec3(.95, .8, .4), vec3(.85, .22, .4), smoothstep(.02, .1, q.x)), elipse(q - vec3(.08, 0, 0), vec3(.1, .022, .045)) * .7));
  }
  // piedras
  c = une(c, vec4(vec3(.4, .33, .27), elipse(p - vec3(.6, -1.02, .4), vec3(.16, .1, .13)) + .012 * sin(p.x * 25.) * sin(p.y * 27.)));
  return une(c, vec4(vec3(.42, .35, .28), elipse(p - vec3(-.5, -1.03, .5), vec3(.11, .08, .1)) + .01 * sin(p.x * 31.)));
}` },
{ id:'hongos', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.4 * sin(t * .22)); p.y += .05;
  vec4 c = vec4(vec3(.16, .26, .12), (elipse(p + vec3(0, 1.15, 0), vec3(1.1, .3, .95)) + .035 * sin(p.x * 13.) * sin(p.z * 14.) + .015 * sin(p.x * 37.) * sin(p.z * 41.)) * .7);
  float q_ = 1.;
  for (int i = 0; i < 4; i++) {
    vec3 o = i == 0 ? vec3(-.1, .3, 0) : i == 1 ? vec3(.62, -.18, .2) : i == 2 ? vec3(-.68, -.35, .25) : vec3(.15, -.62, .62);
    q_ = 1. + .13 * acc * sin(tq * 9. - float(i) * 1.5);
    float S = i == 0 ? .62 : i == 1 ? .42 : i == 2 ? .34 : .22;
    S *= q_; vec3 q = p - o; q.x += .02 * sin(t * .8 + float(i)) * (q.y + 1.);
    float a = atan(q.z, q.x), r = length(q.xz);
    // sombrero, láminas y pie
    float cap = elipse(q, vec3(S, S * .72, S));
    float cor = -q.y - S * .06 + S * .12 * smoothstep(S, 0., r);
    float d = max(cap, cor);
    vec2 w = vec2(a * 2.4, asin(clamp(q.y / (S * .75), -1., 1.)) * 3.6);
    vec2 id = floor(w), f = fract(w) - .5;
    float lu = fract(sin(dot(id + float(i) * 3., vec2(12.9, 78.2))) * 4375.);
    float pun = smoothstep(.36, .28, length(f * vec2(cos(q.y / S), 1.)) + .3 * step(.62, lu)) * step(.06, q.y / S);
    float lam = step(cap, cor);
    vec3 tono = mix(vec3(.62, .1, .07), vec3(.9, .86, .78), pun);
    tono = mix(tono, mix(vec3(.78, .7, .56), vec3(.95, .9, .78), step(.5, fract(a * 9.))), lam);
    c = une(c, vec4(tono, (d - .018 * pun) * .75));
    float pie = cono(q, vec3(0, -1.5, 0), vec3(0, -S * .05, 0), S * .3, S * .2);
    c = une(c, vec4(vec3(.82, .77, .66) * (.9 + .12 * sin(a * 12. + q.y * 5.)), max(pie, q.y)));
    float an = max(length(vec2(r - S * .24, q.y + S * .4 + .02 * sin(a * 9.))) - S * .06, -9.);
    c = une(c, vec4(vec3(.88, .83, .72), an));
  }
  // luciérnagas
  for (int i = 0; i < 4; i++) {
    float k = float(i);
    vec3 o = vec3(.9 * sin(t * .4 + k * 2.1), -.1 + .5 * sin(t * .6 + k * 1.3), .5 + .4 * cos(t * .5 + k));
    c = une(c, vec4(vec3(1.5, 1.7, .6) * (.7 + .3 * sin(t * 4. + k * 2.)), esfera(p - o, .025)));
  }
  vec4 fin_ = c;
  if (tq < 3.) for (int i = 0; i < 8; i++) { float g = float(i), u = fract(tq * .4 + g * .13);
    fin_ = une(fin_, vec4(vec3(1.4, 1.2, .5), esfera(p - vec3(.7 * sin(g * 2.4) + .1 * sin(tq * 2. + g), -.1 + 1.1 * u, .5 * cos(g * 2.4)), .035 * acc * (1. - u)))); }
  return fin_;
}` },
{ id:'tornado', codigo:
`vec4 criatura(vec3 p, float t) {
  float h = clamp((p.y + 1.1) / 2.2, 0., 1.);
  vec2 cen = vec2(.16 * sin(p.y * 2.2 + t * 1.3), .1 * cos(p.y * 1.9 + t)) * (1. - .4 * h);
  vec3 q = p; q.xz -= cen;
  float a = atan(q.z, q.x), r = length(q.xz);
  float R = (1. + .35 * acc) * (.07 + .22 * h + .55 * h * h * h);
  float es = sin(a * 3. + q.y * 9. - t * 7.) + .6 * sin(a * 7. - q.y * 17. - t * 9.) + .4 * sin(a * 13. + q.y * 31. - t * 11.);
  float d = max((r - R - .03 * es) * .5, abs(p.y) - 1.12);
  vec4 c = vec4(mix(vec3(.28, .27, .27), vec3(.66, .64, .6), smoothstep(-1., 1.2, es)), d);
  // techo de nubes
  vec3 n = p - vec3(0, 1.2, 0);
  float nb = elipse(n, vec3(1.35, .2, .9)) + .06 * sin(n.x * 8. + t) * sin(n.z * 9.) + .03 * sin(n.x * 19.) * sin(n.y * 17. + n.z * 15.);
  float rayo = acc * step(.55, sin(tq * 21.)) + step(.965, sin(t * 2.3) * sin(t * 3.7 + 1.)) ;
  c = une(c, vec4(mix(vec3(.3, .31, .34), vec3(1.4, 1.5, 1.7), rayo), nb * .6));
  // polvo al pie y escombros en órbita
  vec3 v = q + vec3(0, 1.08, 0);
  float po = length(vec2(length(v.xz) - .32, v.y * 1.3)) - .16 - .05 * sin(a * 5. - t * 6.) * sin(a * 9. + t * 3.);
  c = une(c, vec4(vec3(.45, .36, .27), po * .6));
  for (int i = 0; i < 7; i++) {
    float f = float(i), y = -.9 + fract(f * .37 + t * .12) * 1.5, k = t * (2.6 - .2 * f) + f * 2.;
    float rr = .3 + .4 * (y + 1.1) * .5 + .1 * sin(f * 3.);
    vec3 o = p - vec3(rr * cos(k), y, rr * sin(k)); o.xy *= gira(k * 2.); o.yz *= gira(k);
    c = une(c, vec4(mix(vec3(.4, .25, .14), vec3(.6, .2, .15), step(.5, fract(f * .5))), caja(o, vec3(.05, .02, .035))));
  }
  return une(c, vec4(vec3(.24, .26, .14), (elipse(p + vec3(0, 1.28, 0), vec3(1.25, .14, .9)) + .015 * sin(p.x * 35.) * sin(p.z * 33.)) * .8));
}` },
// ---------- Lugares ----------
{ id:'molino', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.35 + .2 * sin(t * .22)); p.y += .1;
  vec4 c = vec4(vec3(.2, .34, .14), (elipse(p + vec3(0, 1.2, 0), vec3(1.25, .25, 1.05)) + .015 * sin(p.x * 33.) * sin(p.z * 35.)) * .8);
  // hileras de tulipanes
  vec2 u = vec2(p.x, p.z - .62);
  vec2 id = clamp(round(u / vec2(.13, .16)), vec2(-6, -1), vec2(6, 1));
  vec3 tu = vec3(u.x - id.x * .13, p.y + .98 + .05 * length(p.xz), u.y - id.y * .16);
  vec3 col = id.y < -.5 ? vec3(.85, .7, .2) : id.y < .5 ? vec3(.75, .14, .15) : vec3(.75, .4, .6);
  c = une(c, vec4(vec3(.2, .4, .16), capsula(tu, vec3(0, -.05, 0), vec3(0, .07, 0), .012)));
  c = une(c, vec4(col, elipse(tu - vec3(0, .11, 0), vec3(.035, .055, .035))));
  // torre octogonal, galería y gorro
  vec3 q = ronda(p, 8.);
  float lad = max((q.x - .36 + .13 * p.y) * .96, max(p.y - .42, -1.05 - p.y));
  float tab = smoothstep(.15, .0, abs(fract(p.y * 9.) - .5) - .38);
  float ven = step(abs(q.z), .05) * step(abs(fract(p.y * 1.6 + .25) - .5), .13) * step(-.75, p.y);
  c = une(c, vec4(mix(mix(vec3(.72, .68, .6), vec3(.45, .4, .34), tab * .6), vec3(1.4, 1., .5), ven), lad));
  c = une(c, vec4(vec3(.35, .22, .13), max(length(p.xz) - .56, abs(p.y + .38) - .02)));
  vec3 g = ronda(p, 16.);
  c = une(c, vec4(vec3(.35, .22, .13), min(capsula(g, vec3(.53, -.38, 0), vec3(.53, -.24, 0), .011), length(vec2(length(p.xz) - .53, p.y + .24)) - .012)));
  c = une(c, vec4(vec3(.33, .2, .14), elipse(p - vec3(0, .45, 0), vec3(.34, .26, .34))));
  // aspas de celosía girando
  vec3 a = p - vec3(0, .48, .46);
  c = une(c, vec4(vec3(.25), capsula(p, vec3(0, .48, .1), vec3(0, .48, .5), .05)));
  a.xy *= gira(t * .7 + 3. * vuelta());
  vec3 s = vec3(a.x, a.z, a.y); s = ronda(s, 4.);
  c = une(c, vec4(vec3(.36, .23, .14), capsula(s, vec3(0), vec3(.92, 0, 0), .022)));
  vec2 m = abs(fract(vec2(s.x * 9., s.z * 13.)) - .5);
  float cel = max(caja(s - vec3(.56, 0, .12), vec3(.34, .01, .1)), (min(m.x, m.y) - .09) * .08);
  return une(c, vec4(vec3(.8, .75, .64), cel * .8));
}` },
{ id:'piramides', codigo:
`vec4 criatura(vec3 p, float t) {
  p.yz *= gira(-.16); p.xz *= gira(giro); p.xz *= gira(.55 + .2 * sin(t * .18)); p.y += .42;
  float du = p.y + .12 + .06 * sin(p.x * 2.3 + 1.) * sin(p.z * 2. + .5) + .008 * sin(p.x * 34. + 5. * sin(p.z * 3.));
  float bor = length(p.xz * vec2(.95, 1.05)) - 1.35;
  vec4 c = vec4(vec3(.66, .5, .3), max(max(du, bor), -.45 - p.y) * .8);
  for (int i = 0; i < 4; i++) {
    vec3 o = i == 0 ? vec3(-.22, 0, -.3) : i == 1 ? vec3(.5, 0, .22) : i == 2 ? vec3(.92, 0, .62) : vec3(-.75, 0, .45);
    float H = i == 0 ? 1.1 : i == 1 ? .68 : i == 2 ? .34 : .26;
    vec3 q = p - o + vec3(0, .15, 0);
    float hil = floor(q.y * 22.) / 22.;
    float m = max(abs(q.x), abs(q.z));
    float d = max((m - (H - hil) * .72) * .62, max(q.y - H, -q.y));
    float lisa = step(H * .8, q.y) * (i == 1 ? 1. : 0.);
    float blo = step(.1, fract(q.y * 22.)) * step(.08, fract((abs(q.x) > abs(q.z) ? q.z : q.x) * 11. + .5 * mod(floor(q.y * 22.), 2.)));
    vec3 pi = mix(vec3(.42, .32, .2), vec3(.8, .64, .4), blo);
    c = une(c, vec4(mix(pi, vec3(.9, .84, .7), lisa), d));
  }
  // caravana
  for (int i = 0; i < 3; i++) {
    float f = float(i);
    vec3 q = p - vec3(-.35 + .2 * f + .02 * sin(t), -.04, .88 - .07 * f);
    float cam = elipse(q, vec3(.07, .045, .04));
    cam = min(cam, elipse(q - vec3(0, .05, 0), vec3(.025, .035, .025)));
    cam = min(cam, curva(q, vec3(.05, 0, 0), vec3(.11, -.02, 0), vec3(.11, .08, 0), .022, .018));
    vec3 w = vec3(abs(q.x) - .04, q.y, abs(q.z) - .02);
    cam = min(cam, capsula(w, vec3(0, -.02, 0), vec3(.01 * sin(t * 3. + f), -.12, 0), .012));
    c = une(c, vec4(vec3(.3, .2, .12), cam));
  }
  vec4 fin_ = une(c, vec4(vec3(1.6, .85, .4), esfera(p - vec3(-1.05, .75, -.9), .2)));
  if (tq < 3.) { vec3 b = p - vec3(-.22, .95, -.3); float v = max(length(b.xz) - (.02 + .05 * b.y) * acc, -b.y); float m = step(.5, fract(sin(dot(floor(vec2(b.y * 18. - tq * 14., b.x * 22.)), vec2(12.9, 78.2))) * 4375.));
    fin_ = une(fin_, vec4(vec3(1.7, 1.4, .7), max(v, b.y - 1.3) * .7 + .03 * m * 0. + .05 * (1. - acc))); fin_ = une(fin_, vec4(vec3(1.9, 1.6, .9), esfera(b, .09 * acc))); }
  return fin_;
}` },
{ id:'pagoda', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.6 + .25 * sin(t * .2)); p.y += .05;
  vec4 c = vec4(vec3(.22, .3, .15), (elipse(p + vec3(0, 1.22, 0), vec3(1.2, .22, 1.2)) + .02 * sin(p.x * 14.) * sin(p.z * 15.)) * .8);
  float bz = caja(p + vec3(0, 1.0, 0), vec3(.68, .08, .68));
  c = une(c, vec4(vec3(.45, .43, .4), bz));
  for (int i = 0; i < 5; i++) {
    float f = float(i), y = -.9 + f * .37, w = .5 - .065 * f;
    vec3 q = p - vec3(0, y, 0);
    vec3 b = vec3(abs(q.x), q.y, abs(q.z));
    float m = max(b.x, b.z), n = min(b.x, b.z);
    // muros con celosía encendida y columnas
    float muro = caja(q - vec3(0, .11, 0), vec3(w * .62, .14, w * .62));
    float cel = step(.22, abs(fract(n * 13.) - .5)) * step(.2, abs(fract(q.y * 15.) - .5)) * step(n, w * .5);
    c = une(c, vec4(mix(vec3(.5, .1, .07), vec3(1.5, .95, .4), cel), muro));
    // tejado curvo con puntas alzadas
    float W = w * 1.28;
    float alto = .2 + .17 * (1. - m / W) * (1. - m / W) + .11 * pow(clamp(n / W, 0., 1.), 3.);
    float te = max(abs(q.y - alto - .03) - .022, m - W);
    float teja = smoothstep(.4, .0, abs(fract(n * 24.) - .5));
    c = une(c, vec4(mix(vec3(.1, .13, .15), vec3(.26, .31, .33), teja), te * .7));
    // farolillos en las esquinas
    vec3 k = b - vec3(W * .93, .27, W * .93);
    c = une(c, vec4(vec3(1.5, .6, .2), elipse(k, vec3(.028, .04, .028))));
  }
  // aguja con anillos
  float r = length(p.xz);
  c = une(c, vec4(vec3(.7, .55, .25), min(capsula(p, vec3(0, .95, 0), vec3(0, 1.3, 0), .02), max(abs(fract(p.y * 13.) - .5) / 13. - .012, max(r - .07, abs(p.y - 1.12) - .12)))));
  vec4 fin_ = c;
  fin_ = une(fin_, cohetes(p));
  return fin_;
}` },
// ---------- Objetos ----------
{ id:'guitarra', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.4 * sin(t * .35)); p.xy *= gira(.22); p /= 1.04;
  vec2 q = p.xy;
  float d2 = funde(length((q - vec2(0, -.68)) * vec2(1., 1.1)) - .5, length(q - vec2(0, -.06)) - .34, .28);
  float cu = max(d2, abs(p.z) - .13) ;
  float veta = sin(p.x * 46. + 2. * sin(p.y * 5.));
  vec3 tapa = mix(vec3(.66, .4, .17), vec3(.82, .55, .27), .5 + .5 * veta);
  tapa = mix(tapa, vec3(.2, .09, .04), smoothstep(-.12, -.03, d2));
  vec3 lado = vec3(.32, .15, .07);
  // boca, roseta y puente
  float b = length(q - vec2(0, -.3));
  tapa = mix(tapa, vec3(.85, .78, .6), smoothstep(.012, .0, abs(b - .175)) + smoothstep(.008, .0, abs(b - .2)));
  tapa = mix(tapa, vec3(.02), step(b, .155));
  vec4 c = vec4(mix(lado, tapa, step(.11, p.z)), cu * .85);
  c = une(c, vec4(vec3(.18, .09, .05), caja(p - vec3(0, -.82, .145), vec3(.17, .03, .02))));
  // mástil con trastes
  float tr = step(.93, fract(pow(max(0., .86 - p.y), .72) * 13.));
  float pt = step(length(vec2(p.x, fract(p.y * 5.) / 5. - .1)), .018);
  c = une(c, vec4(mix(mix(vec3(.16, .08, .05), vec3(.75), tr), vec3(.85), pt * (1. - tr)), caja(p - vec3(0, .35, .13), vec3(.062, .62, .03))));
  c = une(c, vec4(lado, cono(p, vec3(0, .1, .05), vec3(0, .95, .08), .07, .055)));
  // clavijero
  vec3 h = p - vec3(0, 1.12, .07); h.yz *= gira(-.2);
  c = une(c, vec4(lado * 1.1, caja(h, vec3(.085 + .02 * h.y, .16, .025)) - .012));
  vec3 k = vec3(abs(h.x) - .125, h.y - .1 * clamp(round(h.y / .1), -1., 1.), h.z);
  c = une(c, vec4(vec3(.8, .78, .7), min(elipse(k, vec3(.035, .028, .02)), capsula(k, vec3(-.06, 0, 0), vec3(0), .01))));
  // cuerdas que vibran
  float n = clamp(round(p.x / .019), -2.5, 2.5);
  n = floor(p.x / .019) + .5; n = clamp(n, -2.5, 2.5);
  vec3 s = vec3(p.x - n * .019 - .004 * sin(t * 30. + n) * sin((p.y + .82) * 1.9) * max(step(.9, sin(t * 1.3 + n)), 2. * acc), p.y, p.z - .178);
  float cd = max(length(s.xz) - .0045, max(p.y - 1., -.82 - p.y));
  vec4 fin_ = une(c, vec4(vec3(.95, .88, .7), cd * .9));
  fin_ = une(fin_, notas(p - vec3(.1, -.3, .25)));
  return fin_;
}` },
{ id:'camara', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.5 * sin(t * .35) - .25); p.yz *= gira(.08);
  // cuerpo de cuero y tapas de metal
  float d = caja(p, vec3(.92, .4, .24)) - .06;
  float cuero = .006 * sin(p.x * 90.) * sin(p.y * 90.);
  float met = step(.3, abs(p.y + .04));
  vec4 c = vec4(mix(vec3(.09, .08, .08), vec3(.62, .61, .58), met), (d + cuero * (1. - met)) * .85);
  // visor, zapata y diales
  c = une(c, vec4(vec3(.6, .59, .56), caja(p - vec3(0, .52, 0), vec3(.3, .1, .2)) - .03));
  c = une(c, vec4(vec3(.25, .4, .45), caja(p - vec3(0, .52, .24), vec3(.13, .06, .012))));
  c = une(c, vec4(vec3(.35), caja(p - vec3(0, .67, 0), vec3(.12, .015, .12))));
  vec3 a = p - vec3(.62, .55, 0); float r = length(a.xz);
  c = une(c, vec4(vec3(.55) * (.75 + .25 * step(0., sin(atan(a.z, a.x) * 30.))), max(r - .16, abs(a.y) - .07)));
  a = p - vec3(-.62, .53, 0);
  c = une(c, vec4(vec3(.6), max(length(a.xz) - .13, abs(a.y) - .05)));
  c = une(c, vec4(vec3(.75), max(length(p.xz - vec2(.36, .05)) - .05, abs(p.y - .55) - .06)));
  // objetivo: anillos concéntricos y vidrio
  float l = length(p.xy + vec2(0, .04));
  float mol = step(0., sin(atan(p.y + .04, p.x) * 44.));
  c = une(c, vec4(vec3(.5), max(l - .4, abs(p.z - .34) - .05)));
  c = une(c, vec4(vec3(.1) + .12 * mol, max(l - .36, abs(p.z - .44) - .09)));
  c = une(c, vec4(vec3(.58), max(l - .33, abs(p.z - .56) - .03)));
  float abierto = max(max(l - .3, abs(p.z - .62) - .06), -(l - .255));
  c = une(c, vec4(vec3(.07), abierto));
  float an = smoothstep(.02, .0, abs(l - .2)) + smoothstep(.015, .0, abs(l - .13));
  vec3 vid = mix(vec3(.05, .08, .16), vec3(.3, .22, .5), smoothstep(.2, .0, length(p.xy - vec2(-.06, .06))));
  c = une(c, vec4(mix(vid, vec3(.3, .4, .5), an * .5), elipse(p - vec3(0, -.04, .5), vec3(.27, .27, .16))));
  // destello y correa
  c = une(c, vec4(vec3(1.3, 1.2, .9) * step(.97, sin(t * 1.1)) + vec3(.5, .52, .5) + (tq < 2. ? vec3(1.6) * exp(-5. * abs(tq - .55)) : vec3(0)), caja(p - vec3(-.6, .24, .3), vec3(.14, .07, .02)) - (tq < 2. ? .22 * exp(-7. * abs(tq - .55)) : 0.)));
  vec3 q = vec3(abs(p.x), p.yz);
  return une(c, vec4(vec3(.25, .15, .09), curva(q, vec3(.96, .34, 0), vec3(1.2, .1, .1), vec3(1.02, -.75, .1), .03, .03)));
}` },
{ id:'vela', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.3 * sin(t * .25)); p.y += .05;
  float a = atan(p.z, p.x), r = length(p.xz);
  // palmatoria de latón
  float pl = max(abs(p.y + 1. - .28 * smoothstep(.45, .85, r)) - .03, r - .8);
  pl = min(pl, max(r - .3, abs(p.y + .9) - .12) - .02);
  vec3 as = p - vec3(.92, -.8, 0);
  pl = min(pl, length(vec2(length(as.xy) - .17, as.z)) - .035);
  vec4 c = vec4(vec3(.55, .4, .16) * (.85 + .2 * sin(r * 40.)), pl * .8);
  // cera con chorretes
  float tope = .35 + .05 * sin(a * 2. + 1.) + .03 * sin(a * 5.);
  float cho = 0.;
  for (int i = 0; i < 6; i++) {
    float k = float(i) * 1.05 + .3 * sin(float(i) * 4.);
    float largo = .3 + .5 * fract(sin(float(i) * 7.7) * 43.);
    vec3 b = vec3(.25 * cos(k), 0, .25 * sin(k));
    float g = capsula(p, b + vec3(0, .36, 0), b + vec3(0, .3 - largo, 0), .05);
    cho = i == 0 ? g : min(cho, g);
  }
  float ve = max(r - .25, max(p.y - tope, -.95 - p.y));
  ve = funde(ve, cho, .06);
  ve = max(ve, -elipse(p - vec3(0, .42, 0), vec3(.19, .12, .19)));
  float luz = smoothstep(-.5, .4, p.y);
  c = une(c, vec4(mix(vec3(.72, .62, .46), vec3(1.16, .9, .58), luz * luz), ve * .8));
  // pabilo y llama
  vec3 f = p - vec3(.02 * sin(t * 5.) + .012 * sin(t * 13.), .72 + .015 * sin(t * 9.), 0);
  f.x -= .12 * (f.y + .25) * (f.y + .25) * sin(t * 3.);
  c = une(c, vec4(vec3(.06), capsula(p, vec3(0, .3, 0), vec3(.015, .5, 0), .014)));
  float ll = elipse(f, vec3(.1 - .16 * f.y, .3, .1 - .16 * f.y));
  ll = max(elipse(f + vec3(0, .06, 0), vec3(.105, .2, .105)), -9.);
  ll = funde(ll, cono(f, vec3(0, -.02, 0), vec3(0, .36, 0), .085, .004), .06);
  vec3 tono = mix(vec3(.5, .8, 1.6), vec3(1.9, 1.5, .75), smoothstep(-.26, -.1, f.y));
  tono = mix(tono, vec3(1.8, .85, .25), smoothstep(.08, .35, f.y));
  float ap = smoothstep(.15, .5, tq) * (1. - smoothstep(2.4, 3.1, tq));
  if (tq < 3.4) for (int i = 0; i < 4; i++) { float g = float(i), u = fract(tq * .5 + g * .25); vec3 b = p - vec3(.1 * sin(u * 7. + g), .55 + .75 * u, .04 * cos(u * 6.)); c = une(c, vec4(vec3(.45), esfera(b, (.025 + .05 * u) * ap) + .03 * (1. - ap))); }
  return une(c, vec4(tono, ll * .7 + .32 * ap));
}` },
{ id:'ajedrez', codigo:
`vec4 criatura(vec3 p, float t) {
  p.yz *= gira(-.3); p.xz *= gira(giro); p.xz *= gira(.5 + .2 * sin(t * .2)); p.y += .22;
  // tablero
  vec2 k = floor(p.xz / .36);
  float bl = mod(k.x + k.y, 2.);
  vec3 ma = mix(vec3(.16, .09, .05), vec3(.72, .58, .38), bl) * (.9 + .12 * sin(p.x * 40. + 3. * sin(p.z * 6.)));
  ma = mix(ma, vec3(.26, .14, .07), step(1.08, max(abs(p.x), abs(p.z))));
  vec4 c = vec4(ma, caja(p + vec3(0, .78, 0), vec3(1.17, .06, 1.17)));
  for (int i = 0; i < 5; i++) {
    vec2 o = i == 0 ? vec2(-.18, -.18) : i == 1 ? vec2(.54, .18) : i == 2 ? vec2(.18, .9) : i == 3 ? vec2(-.9, .18) : vec2(.9, -.9);
    vec3 q = p - vec3(o.x, -.72, o.y);
    if (i == 1) q.xy *= gira(1.5 * smoothstep(0., 1., acc)); if (i == 0) q.y -= .25 * sin(3.1416 * clamp(tq / 1.2, 0., 1.)) * step(tq, 1.2);
    bool rey = i < 2; bool cl = i == 0 || i == 2;
    float H = rey ? 1.15 : .5, r = length(q.xz);
    // torneado
    float b = max(r - .18, abs(q.y - .04) - .04) - .015;
    b = min(b, length(vec2(r - .13, q.y - .11)) - .035);
    float fu = cono(q, vec3(0, .1, 0), vec3(0, H * .72, 0), .115, .06);
    b = funde(b, fu, .05);
    b = min(b, max(r - .12, abs(q.y - H * .72) - .012) - .012);
    if (rey) {
      b = min(b, cono(q, vec3(0, H * .75, 0), vec3(0, H * .9, 0), .07, .115));
      b = min(b, elipse(q - vec3(0, H * .93, 0), vec3(.09, .05, .09)));
      if (i == 0) b = min(b, min(caja(q - vec3(0, H + .07, 0), vec3(.02, .09, .02)), caja(q - vec3(0, H + .08, 0), vec3(.06, .02, .02))));
      else { vec3 w = ronda(q - vec3(0, H * .92, 0), 8.); b = min(b, min(esfera(w - vec3(.1, .02, 0), .025), esfera(q - vec3(0, H + .02, 0), .035))); }
    } else b = min(b, esfera(q - vec3(0, H * .95, 0), .105));
    vec3 tono = cl ? vec3(.84, .77, .62) : vec3(.27, .17, .12);
    c = une(c, vec4(tono * (.92 + .1 * sin(q.y * 60.)), b * .85));
  }
  return c;
}` },
{ id:'globo', codigo:
`vec4 criatura(vec3 p, float t) {
  p.x -= .08 * sin(t * .5); p.y -= .05 * sin(t * .7) + .05; p.xy *= gira(.04 * sin(t * .6)); p.xz *= gira(t * .15);
  float a = atan(p.z, p.x), r = length(p.xz);
  // envoltura con gajos
  vec3 q = p - vec3(0, .4, 0);
  float gaj = .02 * abs(cos(a * 8.));
  float d = funde(esfera(q, .78), cono(q, vec3(0, -.35, 0), vec3(0, -.92, 0), .55, .17), .25) - gaj;
  d = max(d, -.95 - q.y);
  float k = mod(gajo(p, 16.), 2.);
  float zig = step(0., sin(a * 8.) * .12 + q.y - .02) * step(q.y, .2 + sin(a * 8.) * .12);
  vec3 tono = mix(vec3(.7, .14, .12), vec3(.88, .68, .28), abs(k));
  tono = mix(tono, vec3(.12, .25, .42), zig);
  tono *= 1. + (.25 + .35 * acc) * smoothstep(.1, -.9, q.y);
  vec4 c = vec4(tono, d * .8);
  c = une(c, vec4(vec3(.35, .25, .15), length(vec2(r - .18, q.y + .95)) - .02));
  // cuerdas y barquilla de mimbre
  vec3 s = vec3(abs(p.x), p.y, abs(p.z));
  c = une(c, vec4(vec3(.5, .42, .3), capsula(s, vec3(.12, -.55, .12), vec3(.1, -.98, .1), .009)));
  float mi = .01 * sin(p.y * 70.) * sin((abs(p.x) > abs(p.z) ? p.z : p.x) * 60.);
  float ba = caja(p + vec3(0, 1.1, 0), vec3(.12, .12, .12)) - .02;
  ba = max(ba, -caja(p + vec3(0, 1., 0), vec3(.1, .14, .1)));
  c = une(c, vec4(vec3(.5, .34, .18) * (1. + 25. * mi), (ba + mi) * .8));
  c = une(c, vec4(vec3(.36, .2, .1), max(abs(p.y + .97) - .02, max(s.x, s.z) - .15) * 1.));
  float so = max(.5 + .5 * sin(t * 1.7), 1.7 * acc);
  return une(c, vec4(vec3(1.9, 1., .35), elipse(p + vec3(0, .72, 0), vec3(.035, .05 + .1 * so * so, .035)) * .8));
}` },
// ---------- Máquinas ----------
{ id:'robot', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.45 * sin(t * .35)); p.y += .02;
  float lado = sign(p.x), paso = sin(t * 2.2);
  p.y -= .02 * abs(paso);
  vec3 q = vec3(abs(p.x), p.yz);
  // torso remachado
  float d = caja(p - vec3(0, -.05, 0), vec3(.4, .38, .27)) - .05;
  float rem = step(length(fract(p.xy * vec2(4.6, 4.9) + .5) - .5), .13) * step(.36, max(abs(p.x), abs(p.y + .05)));
  vec3 lata = vec3(.5, .54, .55) * (.9 + .1 * sin(p.y * 80.));
  lata = mix(lata, vec3(.42, .24, .13), smoothstep(.3, .9, sin(p.x * 7. + 2.) * sin(p.y * 6.) * sin(p.z * 8. + 1.)));
  vec4 c = vec4(mix(lata, vec3(.75), rem), d * .85);
  // panel del pecho: aguja, luces y rejilla
  vec3 b = p - vec3(0, .05, .33);
  vec2 g = b.xy - vec2(-.14, .06);
  float ag = step(trazo(g, vec2(0), .1 * vec2(sin(t * 1.3), abs(cos(t * 1.3)))), .012);
  vec3 pa = mix(vec3(.16), mix(vec3(.85, .8, .65), vec3(.7, .1, .05), ag), step(length(g), .12));
  vec2 lz = b.xy - vec2(.17, .06); float n = clamp(round(lz.y / .08), -1., 1.); lz.y -= n * .08;
  vec3 col = n < -.5 ? vec3(1.6, .3, .2) : n < .5 ? vec3(1.6, 1.2, .3) : vec3(.3, 1.5, .5);
  pa = mix(pa, col * (.6 + .4 * step(0., sin(t * 3. + n * 2.))), step(length(lz), .03));
  pa = mix(pa, vec3(.4), step(.5, fract(b.y * 26.)) * step(b.y, -.12));
  c = une(c, vec4(pa, caja(b, vec3(.31, .24, .012))));
  // cuello, cabeza y antena
  c = une(c, vec4(vec3(.3), max(length(p.xz) - .12, abs(p.y - .42) - .06)));
  vec3 k = p - vec3(0, .72, 0); k.xz *= gira(.35 * sin(t * .8) + vuelta());
  c = une(c, vec4(lata, caja(k, vec3(.29, .22, .24)) - .04));
  vec3 e = vec3(abs(k.x) - .13, k.y - .04, k.z - .27);
  c = une(c, vec4(vec3(.25), max(length(e.xy) - .095, abs(e.z) - .03)));
  c = une(c, vec4(mix(vec3(1.7, 1.25, .5), vec3(1.8, .3, .2), acc * step(0., sin(tq * 12.))), elipse(e - vec3(0, 0, .02), vec3(.07, .07 * (1.05 - parpado()), .03))));
  float bo = step(.5, fract(k.x * 14.));
  c = une(c, vec4(mix(vec3(.1), vec3(.7), bo), caja(k - vec3(0, -.14, .275), vec3(.17, .045, .012))));
  e = vec3(abs(k.x) - .36, k.yz); c = une(c, vec4(vec3(.5, .2, .12), max(length(e.yz) - .09, abs(e.x) - .04)));
  c = une(c, vec4(vec3(.6), capsula(k, vec3(0, .25, 0), vec3(0, .45, 0), .016)));
  c = une(c, vec4(vec3(1.8, .35, .2) * (.6 + .4 * step(0., sin(t * 5.))), esfera(k - vec3(0, .48, 0), .05)));
  // brazos de tubo con pinzas
  float m = .16 * paso * lado + acc * .3 * sin(tq * 8. + lado);
  float br = curva(q, vec3(.44, .2, 0), vec3(.78, .18, 0), vec3(.72, -.32 + acc * .0, .12 + m), .085, .075);
  br += .014 * sin(length(q - vec3(.44, .2, 0)) * 60.);
  c = une(c, vec4(vec3(.36, .37, .38), br * .8));
  vec3 h = q - vec3(.72, -.4, .14 + m);
  c = une(c, vec4(vec3(.55, .2, .12), esfera(h, .1)));
  h.x = abs(h.x); c = une(c, vec4(vec3(.6), curva(h, vec3(.05, -.06, 0), vec3(.17, -.16, .02), vec3(.04, -.25, .03), .032, .022)));
  // piernas y pies
  c = une(c, vec4(vec3(.36, .37, .38), capsula(q, vec3(.2, -.45, 0), vec3(.22, -.95, -m), .1) + .014 * sin(p.y * 55.)));
  return une(c, vec4(vec3(.55, .2, .12), caja(q - vec3(.23, -1.08, .06 - m), vec3(.13, .07, .2)) - .04));
}` },
{ id:'tren', codigo:
`vec4 criatura(vec3 p, float t) {
  p.yz *= gira(-.16); p.xz *= gira(giro); p.xz *= gira(.6 + .22 * sin(t * .25)); p.y += .08; p.y -= .006 * sin(t * 18.);
  vec3 q = vec3(p.xy, abs(p.z));
  // caldera
  float r = length(p.yz - vec2(.02, 0));
  float d = max(r - .3, max(p.x - .5, -.92 - p.x));
  float aro = smoothstep(.02, .0, abs(fract(p.x * 2.6) - .5) / 2.6);
  vec4 c = vec4(mix(vec3(.13, .14, .15), vec3(.7, .55, .25), aro), d * .9);
  c = une(c, vec4(vec3(.08), max(r - .31, abs(p.x + .95) - .06)));
  c = une(c, vec4(vec3(.55, .42, .2), max(r - .16, abs(p.x + 1.) - .04)));
  // chimenea, domos y silbato
  vec3 h = p - vec3(-.72, .45, 0);
  c = une(c, vec4(vec3(.12), cono(h, vec3(0, -.2, 0), vec3(0, .2, 0), .085, .14)));
  c = une(c, vec4(vec3(.7, .55, .25), length(vec2(length(h.xz) - .13, h.y - .22)) - .03));
  c = une(c, vec4(vec3(.7, .55, .25), elipse(p - vec3(-.3, .32, 0), vec3(.14, .14, .14))));
  c = une(c, vec4(vec3(.13), elipse(p - vec3(.15, .32, 0), vec3(.15, .13, .13))));
  // cabina
  float ca = caja(p - vec3(.75, .14, 0), vec3(.28, .42, .36));
  ca = max(ca, -caja(p - vec3(.75, .27, 0), vec3(.16, .13, .5)));
  c = une(c, vec4(vec3(.34, .07, .06), ca));
  c = une(c, vec4(vec3(1.2, .75, .3), caja(p - vec3(.75, .2, 0), vec3(.22, .25, .25))));
  c = une(c, vec4(vec3(.12), caja(p - vec3(.75, .6 - .12 * p.z * p.z, 0), vec3(.38, .03, .42))));
  // bastidor, faro y quitapiedras
  c = une(c, vec4(vec3(.3, .07, .06), caja(p - vec3(0, -.33, 0), vec3(1.05, .05, .3))));
  c = une(c, vec4(vec3(1.9, 1.6, .9), max(length(p.yz - vec2(.3, 0)) - .09, abs(p.x + 1.02) - .06)));
  vec3 k = p - vec3(-1.14, -.48, 0);
  float qu = max(caja(k, vec3(.17, .14, .34)), (k.y * .8 - k.x - .02 + abs(k.z) * .5) * .6);
  c = une(c, vec4(mix(vec3(.1), vec3(.4, .09, .07), step(.5, fract(p.z * 12.))), max(qu, -(k.x + .2 - .0)) * .8));
  // ruedas motrices y bielas
  float x = p.x + .0 - .44 * clamp(round(p.x / .44), -1., 1.) ;
  vec2 w = vec2(x, p.y + .42);
  float rr = length(w), an = atan(w.y, w.x) + t * 4. + acc * tq * 6.;
  float ru = max(abs(rr - .18) - .025, abs(q.z - .34) - .035);
  ru = min(ru, max(max(rr - .18, abs(sin(an * 5.)) * rr - .018), abs(q.z - .34) - .02));
  ru = min(ru, max(rr - .05, abs(q.z - .36) - .05));
  c = une(c, vec4(vec3(.42, .08, .07), ru * .8));
  vec2 ma = .1 * vec2(cos(t * 4.), -sin(t * 4.));
  c = une(c, vec4(vec3(.65), caja(q - vec3(ma.x, -.42 + ma.y, .41), vec3(.5, .025, .015))));
  // vía
  c = une(c, vec4(vec3(.55), caja(q - vec3(0, -.65, .34), vec3(1.5, .025, .025))));
  float du = fract(p.x * 3.4 - t * 1.2) - .5;
  c = une(c, vec4(vec3(.26, .17, .1), max(abs(du) / 3.4 - .05, caja(p + vec3(0, .7, 0), vec3(1.45, .03, .52)))));
  c = une(c, vec4(vec3(.3, .28, .26) * (.8 + .4 * fract(sin(dot(floor(p.xz * 22. - vec2(t * 7.8, 0)), vec2(12.9, 78.2))) * 4375.)), caja(p + vec3(0, .78, 0), vec3(1.45, .05, .7))));
  // humo
  for (int i = 0; i < 5; i++) {
    float f = float(i), s = fract(t * .35 + f * .2);
    vec3 o = p - vec3(-.72 + 1.5 * s, .72 + .5 * s, .06 * sin(f * 3.));
    c = une(c, vec4(vec3(.62) * (1. - .3 * s), (esfera(o, (.08 + .18 * s) * (1. + .6 * acc)) + .035 * sin(o.x * 14.) * sin(o.y * 13. + f) * sin(o.z * 12.)) * .6 + .5 * smoothstep(.8, 1., s)));
  }
  vec4 fin_ = c;
  if (tq < 3.) { float u = fract(tq * 2.); vec3 b = p - vec3(.15, .48 + .5 * u, 0); fin_ = une(fin_, vec4(vec3(.85), cono(b, vec3(0), vec3(.05, .12, 0), .03 + .07 * u, .05) + .12 * (1. - acc) + .1 * u)); }
  return fin_;
}` },
{ id:'submarino', codigo:
`vec4 criatura(vec3 p, float t) {
  p.y -= .04 * sin(t * .8); p.xz *= gira(.45 * sin(t * .28) + .25); p.xy *= gira(.04 * sin(t * .6));
  vec3 q = vec3(p.xy, abs(p.z));
  // casco con planchas
  float d = elipse(p, vec3(1.12, .4, .42));
  float ju = max(smoothstep(.012, .0, abs(fract(p.x * 2.3) - .5) / 2.3), smoothstep(.012, .0, abs(p.y + .06)));
  float ox = smoothstep(.2, .8, sin(p.x * 6. + 1.) * sin(p.y * 9.) * sin(p.z * 7. + 2.));
  vec3 cas = mix(vec3(.2, .34, .36), vec3(.4, .22, .12), ox * .7) * (1. - .45 * ju);
  cas = mix(cas, vec3(.35, .1, .08), step(p.y, -.2));
  vec4 c = vec4(cas, d * .85);
  // torre, escotilla y periscopio
  float to = max(length((p.xz - vec2(.05, 0)) * vec2(.7, 1.2)) - .2, abs(p.y - .42) - .18) - .02;
  c = une(c, vec4(vec3(.24, .38, .4), to * .8));
  c = une(c, vec4(vec3(.5, .4, .2), length(vec2(length((p.xz - vec2(.05, 0)) * vec2(.8, 1.2)) - .2, p.y - .62)) - .02));
  float pe = capsula(p, vec3(-.05, .55, 0), vec3(-.05, .98, 0), .03);
  vec3 pp = p - vec3(-.05, .98, 0); pp.xz *= gira(.8 * sin(t * .5) + vuelta());
  pe = min(pe, capsula(pp, vec3(0), vec3(-.13, 0, 0), .04));
  c = une(c, vec4(vec3(.45), pe));
  c = une(c, vec4(vec3(.4, 1.1, 1.3), esfera(pp - vec3(-.15, 0, 0), .034)));
  // ojos de buey encendidos
  vec3 o = vec3(p.x + .02 - .32 * clamp(round((p.x + .02) / .32), -2., 1.), p.y - .08, q.z);
  float zc = .42 * sqrt(max(0., 1. - p.x * p.x / 1.25 - .04));
  o.z -= zc;
  c = une(c, vec4(vec3(.6, .48, .24), length(vec2(length(o.xy) - .085, o.z)) - .025));
  c = une(c, vec4(vec3(1.55, 1.15, .55), elipse(o + vec3(0, 0, .01), vec3(.075, .075, .03))));
  // aletas, hélice y faros
  c = une(c, vec4(vec3(.2, .32, .34), elipse(q - vec3(.85, 0, .38), vec3(.16, .03, .22)) * .8));
  c = une(c, vec4(vec3(.2, .32, .34), elipse(p - vec3(.95, .02, 0), vec3(.14, .4, .03)) * .8));
  vec3 h = p - vec3(1.22, 0, 0); h.yz *= gira(t * 5. + acc * tq * 9.);
  vec3 u = ronda(vec3(h.y, h.x, h.z), 4.); u.yz *= gira(.5);
  c = une(c, vec4(vec3(.65, .5, .22), min(elipse(u - vec3(.15, 0, 0), vec3(.15, .025, .07)) * .7, esfera(h, .06))));
  c = une(c, vec4(vec3(1.8, 1.6, 1.1), esfera(q - vec3(-1., -.16, .16), .07)));
  // burbujas
  for (int i = 0; i < 6; i++) {
    float f = float(i), s = fract(t * .28 + f * .17);
    vec3 b = vec3(1.15 + .25 * s + .05 * sin(t * 3. + f), -.1 + .95 * s, .12 * sin(f * 2.4));
    c = une(c, vec4(vec3(.55, .75, .8), esfera(p - b, (.02 + .03 * fract(f * .37)) * (1. + 1.3 * acc))));
  }
  return c;
}` },
{ id:'biplano', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xy *= gira(.1 * sin(t * .8) + vuelta()); p.y -= .05 * sin(t * 1.1); p.xz *= gira(.65 + .35 * sin(t * .3)); p.yz *= gira(.18 + .12 * sin(t * .5));
  vec3 q = vec3(p.xy, abs(p.z));
  vec3 rojo = vec3(.5, .1, .08), crema = vec3(.8, .72, .55);
  // fuselaje
  float d = cono(p, vec3(-.62, 0, 0), vec3(.95, .06, 0), .2, .05);
  d = funde(d, max(length(p.yz) - .22, abs(p.x + .62) - .16), .05);
  d = max(d, -elipse(p - vec3(.02, .2, 0), vec3(.15, .14, .11)));
  vec4 c = vec4(mix(rojo, crema, smoothstep(.02, .0, abs(p.y - .02)) ), d * .85);
  // motor y hélice
  vec3 m = p - vec3(-.82, 0, 0);
  vec3 cil = ronda(vec3(m.y, m.x, m.z), 7.);
  c = une(c, vec4(vec3(.25), capsula(cil, vec3(.06, 0, 0), vec3(.17, 0, 0), .045) + .008 * sin(cil.x * 90.)));
  c = une(c, vec4(vec3(.6, .5, .3), elipse(m + vec3(.1, 0, 0), vec3(.1, .07, .07))));
  vec3 h = m + vec3(.13, 0, 0); h.yz *= gira(t * 14.);
  c = une(c, vec4(vec3(.4, .24, .12), elipse(h, vec3(.02, .46, .05)) * .7));
  // alas con costillas, montantes y tirantes
  for (int i = 0; i < 2; i++) {
    float y = i == 0 ? -.14 : .4, x = i == 0 ? -.22 : -.32;
    vec3 a = p - vec3(x, y - .05 * float(i == 0 ? -1 : 0) * q.z, 0);
    a.y -= .02 * cos(a.x * 8.);
    float al = caja(a, vec3(.22, .012, 1.12)) - .014;
    float co = smoothstep(.15, .0, abs(fract(p.z * 8.) - .5)) * .3;
    float es = length(vec2(a.x, q.z - .82));
    vec3 tono = mix(rojo, crema, step(abs(q.z - .82), .26)) * (1. - co);
    tono = mix(tono, vec3(.12, .2, .42), step(es, .15)); tono = mix(tono, crema, step(es, .1)); tono = mix(tono, rojo, step(es, .05));
    c = une(c, vec4(tono, al * .85));
  }
  vec3 s = vec3(abs(p.x + .27) - .13, p.y, q.z);
  float mo = min(capsula(s, vec3(0, -.12, .8), vec3(0, .4, .8), .014), capsula(s, vec3(0, .15, .1), vec3(0, .4, .24), .014));
  mo = min(mo, min(capsula(q, vec3(-.27, -.12, .2), vec3(-.27, .4, .8), .006), capsula(q, vec3(-.27, .4, .26), vec3(-.27, -.12, .8), .006)));
  c = une(c, vec4(vec3(.4, .26, .14), mo));
  // cola y tren
  c = une(c, vec4(rojo, elipse(p - vec3(.9, .22, 0), vec3(.16, .2, .02)) * .8));
  c = une(c, vec4(crema, elipse(p - vec3(.88, .08, 0), vec3(.15, .02, .36)) * .8));
  c = une(c, vec4(vec3(.35), min(capsula(q, vec3(-.42, -.15, .08), vec3(-.45, -.48, .24), .016), capsula(p, vec3(-.45, -.48, -.3), vec3(-.45, -.48, .3), .014))));
  vec3 w = q - vec3(-.45, -.48, .3);
  c = une(c, vec4(mix(vec3(.08), vec3(.6), step(length(w.xy), .07)), max(length(w.xy) - .13, abs(w.z) - .03)));
  // piloto
  c = une(c, vec4(vec3(.32, .2, .12), esfera(p - vec3(.04, .24, 0), .09)));
  vec3 bu = p - vec3(.2 + .06 * sin(t * 9.), .22 + .03 * sin(t * 8.), 0);
  return une(c, vec4(vec3(.75, .7, .6), cono(p, vec3(.1, .19, 0), vec3(.38, .24 + .05 * sin(t * 9.), .05 * sin(t * 7.)), .035, .02)));
}` },
// ---------- Comida ----------
{ id:'hamburguesa', codigo:
`vec4 criatura(vec3 p, float t) {
  p.yz *= gira(-.14); p.xz *= gira(giro); p.xz *= gira(t * .25); p.y += .06;
  float a = atan(p.z, p.x), r = length(p.xz);
  vec3 pan = mix(vec3(.72, .42, .16), vec3(.45, .2, .06), smoothstep(.3, .85, p.y));
  float ex = .2 * acc; p.y += ex * 2.2;
  vec4 c = vec4(vec3(.78, .56, .3), max(elipse(p + vec3(0, .42, 0), vec3(.95, .42, .95)), p.y + .5) - .03);
  p.y -= ex;
  float ca = max(r - .9, abs(p.y + .3) - .11) - .05 + .03 * sin(p.x * 17.) * sin(p.y * 19.) * sin(p.z * 18.);
  c = une(c, vec4(vec3(.26, .13, .07) * (.8 + .4 * sin(p.x * 33.) * sin(p.z * 31.)), ca * .7));
  p.y -= ex * .8;
  vec3 q = p; q.xz *= gira(.4); float m = max(abs(q.x), abs(q.z));
  float cae = .3 * smoothstep(.82, 1.05, r) * (.6 + .4 * cos(a * 4. + 1.6));
  c = une(c, vec4(vec3(.92, .6, .14), max(abs(p.y + .13 + cae) - .022, max(m - .92, r - 1.05)) * .6));
  p.y -= ex;
  vec2 k = vec2(abs(p.x) - .4, p.z);
  float rt = length(k);
  c = une(c, vec4(mix(vec3(.7, .13, .08), vec3(.85, .4, .25), step(.0, cos(atan(k.y, k.x) * 6.)) * step(rt, .3)), max(rt - .46, abs(p.y + .04) - .045) - .01));
  p.y -= ex * .8;
  float on = .07 * sin(a * 13.) + .04 * sin(a * 29. + 1.);
  c = une(c, vec4(mix(vec3(.2, .42, .1), vec3(.55, .72, .25), smoothstep(.8, 1.08, r)), max(abs(p.y - .07 - on * smoothstep(.6, 1., r)) - .022, r - 1.04 - .05 * sin(a * 17.)) * .5));
  p.y -= ex;
  float ar = max(elipse(p - vec3(0, .18, 0), vec3(.98, .66, .98)), .14 - p.y) - .02;
  vec2 w = vec2(a * 2.8, acos(clamp((p.y - .18) / .68, -1., 1.)) * 5.5);
  vec2 id = floor(w), f = fract(w) - .5; float h = fract(sin(dot(id, vec2(12.9, 78.2))) * 4375.);
  f += .25 * vec2(sin(h * 40.), cos(h * 31.));
  float aj = smoothstep(.22, .14, length(f * vec2(max(r, .2) * 1.2, .8))) * step(.35, h) * step(.35, p.y);
  return une(c, vec4(mix(pan, vec3(.92, .82, .6), aj), ar - .018 * aj));
}` },
{ id:'helado', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xy *= gira(.05 * sin(t * .7)); p.xz *= gira(t * .25); p.y -= .02;
  float a = atan(p.z, p.x), r = length(p.xz);
  // barquillo con rombos
  float R = .46 * clamp((p.y + 1.28) / 1.1, 0., 1.);
  float ro = max(abs(sin(a * 5. + p.y * 13.)), abs(sin(a * 5. - p.y * 13.)));
  float gr = smoothstep(.93, .99, ro);
  vec4 c = vec4(mix(vec3(.72, .48, .2), vec3(.42, .23, .08), gr), max((r - R) * .92 + .012 * gr, p.y + .14) * .9);
  c = une(c, vec4(vec3(.6, .37, .14), length(vec2(r - .47, p.y + .14)) - .05));
  // tres bolas
  for (int i = 0; i < 3; i++) {
    float f = float(i);
    vec3 o = i == 0 ? vec3(-.22, .12, .08) : i == 1 ? vec3(.25, .16, -.04) : vec3(.0, .58, .02);
    vec3 q = p - o; q.y /= 1. - .12 * acc; q.x += .05 * acc * sin(tq * 5. + f * 2.);
    float n = .03 * sin(q.x * 15. + f) * sin(q.y * 17.) * sin(q.z * 16.) + .015 * sin(q.x * 37.) * sin(q.y * 39.) * sin(q.z * 41.);
    float d = esfera(q, .4) + n;
    float aa = atan(q.z, q.x);
    d = funde(d, length(vec2(length(q.xz) - .35, q.y + .2 + .04 * sin(aa * 6. + f * 2.))) - .075, .06);
    vec3 col = i == 0 ? vec3(.86, .5, .56) : i == 1 ? vec3(.34, .2, .13) : vec3(.9, .84, .68);
    if (i == 0) col = mix(col, vec3(.6, .12, .18), step(.82, sin(q.x * 13.) * sin(q.y * 12.) * sin(q.z * 14.) * 2.));
    if (i == 2) col = mix(col, vec3(.12, .07, .04), step(.9, fract(sin(dot(floor(q * 17.), vec3(12.9, 78.2, 37.7))) * 4375.)));
    c = une(c, vec4(col, d * .7));
  }
  // goteo
  for (int i = 0; i < 4; i++) {
    float f = float(i), k = f * 1.7 + .5, s = .25 + .2 * sin(f * 3.) + .05 * sin(t * .6 + f) + .5 * acc;
    vec3 b = vec3(.45 * cos(k), -.12, .45 * sin(k));
    c = une(c, vec4(i < 2 ? vec3(.86, .5, .56) : vec3(.34, .2, .13), cono(p, b, b * vec3(.85, 1., .85) - vec3(0, s, 0), .05, .04)));
  }
  // galleta y cereza
  vec3 g = p - vec3(.28, .9, -.1); g.xy *= gira(.4);
  c = une(c, vec4(mix(vec3(.66, .42, .17), vec3(.45, .25, .1), step(.5, fract(atan(g.z, g.x) * 2. + g.y * 9.))), max(abs(length(g.xz) - .06) - .015, abs(g.y) - .32)));
  c = une(c, vec4(vec3(.62, .04, .07), esfera(p - vec3(-.08, 1.02 + .3 * acc * abs(sin(tq * 4.5)), .08), .13)));
  return une(c, vec4(vec3(.25, .36, .12), curva(p - vec3(0, .3 * acc * abs(sin(tq * 4.5)), 0), vec3(-.08, 1.13, .08), vec3(-.06, 1.3, .05), vec3(.06, 1.36, .04), .014, .012)));
}` },
{ id:'sushi', codigo:
`vec4 criatura(vec3 p, float t) {
  p.yz *= gira(-.42); p.xz *= gira(giro); p.xz *= gira(.35 + .2 * sin(t * .22)); p.y += .22;
  // tabla de madera
  float ta = caja(p + vec3(0, .42, 0), vec3(1.2, .05, .72)) - .02;
  ta = min(ta, caja(vec3(abs(p.x) - .85, p.y + .54, p.z), vec3(.08, .07, .6)));
  vec4 c = vec4(vec3(.5, .31, .15) * (.85 + .2 * sin(p.z * 34. + 2. * sin(p.x * 3.))), ta);
  // dos nigiri
  for (int i = 0; i < 2; i++) {
    vec3 q = p - vec3(-.62 + .52 * float(i), -.2, -.2 + .1 * float(i)); q.xz *= gira(.25); if (i == 1) q.y -= .42 * acc;
    float g = .016 * sin(q.x * 47.) * sin(q.y * 45.) * sin(q.z * 49.);
    c = une(c, vec4(vec3(.9, .88, .82), (elipse(q, vec3(.2, .16, .38)) + g) * .75));
    vec3 s = q - vec3(0, .13 - .55 * q.z * q.z, 0);
    float ve = smoothstep(.2, .0, abs(fract(q.z * 8. + q.x * 3.) - .5) - .3);
    vec3 col = i == 0 ? mix(vec3(.85, .36, .16), vec3(.96, .68, .48), ve) : mix(vec3(.62, .1, .12), vec3(.8, .3, .28), ve * .6);
    c = une(c, vec4(col, (caja(s, vec3(.17, .012, .4)) - .05) * .7));
  }
  // tres makis
  for (int i = 0; i < 3; i++) {
    vec3 q = p - vec3(.48 + .38 * mod(float(i), 2.), -.2, i < 2 ? -.22 : .22); if (i == 2) q.x -= .02;
    float r = length(q.xz);
    float d = max(r - .2, abs(q.y) - .15) - .015;
    float gr = .5 + .5 * sin(q.x * 70.) * sin(q.z * 70.);
    vec3 col = mix(vec3(.92, .9, .84) * (.85 + .15 * gr), vec3(.05, .09, .06), step(.175, r));
    vec2 k = q.xz - vec2(.03, 0);
    col = mix(col, vec3(.85, .38, .18), step(length(k), .07)); col = mix(col, vec3(.3, .55, .2), step(length(q.xz + vec2(.06, .02)), .045));
    c = une(c, vec4(col, d * .85));
  }
  // wasabi, jengibre y palillos
  c = une(c, vec4(vec3(.45, .62, .25), (elipse(p - vec3(.95, -.3, .25), vec3(.13, .12, .12)) + .02 * sin(p.x * 30.) * sin(p.z * 31.)) * .8));
  vec3 j = p - vec3(.05, -.31, .4);
  c = une(c, vec4(vec3(.88, .62, .56), (elipse(j, vec3(.2, .07, .13)) + .03 * sin(j.x * 26. + j.z * 12.)) * .6));
  vec3 u = p - vec3(-.35, -.28, .62); u.xz *= gira(-.08); u -= acc * vec3(.12, .42, -.62); u.xy *= gira(.25 * acc);
  u.z = abs(u.z) - .045;
  return une(c, vec4(mix(vec3(.2, .05, .04), vec3(.75, .6, .3), step(.5, u.x)), cono(u, vec3(-.8, 0, 0), vec3(.85, .04, 0), .018, .032)));
}` },
{ id:'sandia', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.5 * sin(t * .4)); p.xy *= gira(.12 * sin(t * .5)); p.y -= .42;
  float r = length(p.xy), R = 1.12;
  // rebanada: medio disco, con un mordisco
  float d = max(max(r - R, p.y - .28), abs(p.z) - .17);
  float mo = min(length(p.xy - vec2(.62, .34)) - .24, length(p.xy - vec2(.86, .22)) - .2);
  mo = min(mo, length(p.xy - vec2(.4, .4)) - .2);
  if (tq < 3.2) for (int i = 0; i < 3; i++) { float g = float(i), k = smoothstep(.3 + .5 * g, .4 + .5 * g, tq) * (1. - smoothstep(2.4, 3.1, tq)); vec2 b = p.xy - vec2(-.7 + .42 * g, .34); mo = min(mo, length(b) - .27 * k + .03 * cos(atan(b.y, b.x) * 9.) * k + .3 * (1. - step(.01, k))); }
  d = max(d, -mo) - .02;
  vec3 pulpa = mix(vec3(.82, .13, .14), vec3(.9, .3, .26), smoothstep(.2, .85, r)) * (.92 + .1 * sin(p.x * 41.) * sin(p.y * 39.));
  pulpa = mix(pulpa, vec3(.9, .85, .68), smoothstep(.9, .97, r));
  pulpa = mix(pulpa, vec3(.5, .7, .35), smoothstep(1., 1.04, r));
  float a = atan(p.y, p.x);
  float raya = step(0., sin(a * 13. + 1.2 * sin(p.z * 14.) + .6 * sin(p.z * 31.)));
  pulpa = mix(pulpa, mix(vec3(.08, .2, .07), vec3(.28, .46, .18), raya), smoothstep(1.06, 1.09, r));
  vec4 c = vec4(pulpa, d * .85);
  // semillas
  float an = a + 1.5708, n = clamp(round(an / .34), -4., 4.), k = an - n * .34;
  float rr = .68 + .07 * mod(n, 2.);
  vec3 s = vec3(sin(k) * r, cos(k) * r - rr, abs(p.z) - .18);
  c = une(c, vec4(vec3(.04, .025, .02), elipse(s, vec3(.03, .055, .03))));
  float m = clamp(round(an / .55), -2., 2.); k = an - m * .55;
  s = vec3(sin(k) * r, cos(k) * r - .4, abs(p.z) - .18);
  c = une(c, vec4(vec3(.04, .025, .02), elipse(s, vec3(.028, .05, .03))));
  // gota
  float g = fract(t * .3);
  return une(c, vec4(vec3(.85, .25, .22), esfera(p - vec3(-.25, -1.14 - .5 * g * g, .05), .045 * (1. - .4 * g))));
}` },
// ---------- Formas ----------
{ id:'menger', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(t * .25); p.yz *= gira(.45 + .25 * sin(t * .3));
  p /= .74;
  float d = caja(p, vec3(1.)), s = 1., tr = 1.;
  for (int i = 0; i < 3; i++) {
    vec3 a = mod(p * s, 2.) - 1.;
    s *= 3.;
    vec3 r = abs(1. - (3. - .4 * acc * abs(sin(tq * 3.))) * abs(a));
    float c = (min(max(r.x, r.y), min(max(r.y, r.z), max(r.z, r.x))) - 1.) / s;
    if (c > d) { d = c; tr = float(i + 2); }
  }
  vec3 m = mix(vec3(.75, .62, .42), vec3(.55, .28, .16), step(2.5, tr));
  m = mix(m, vec3(.2, .16, .2), step(3.5, tr));
  vec4 k = vec4(m * (.92 + .08 * sin(p.x * 60.)), d * .74 * .9);
  return une(k, vec4(vec3(1.7, .8, .3) * (.85 + .15 * sin(t * 2.)), esfera(p, .2 + .2 * acc) * .74));
}` },
{ id:'giroide', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(t * .2); p.xy *= gira(.3 * sin(t * .25));
  float fr = 5.6 + 3.4 * acc; vec3 q = p * fr; q.y += t * .5;
  float g = dot(sin(q), cos(q.zxy));
  float d = (abs(g) - .2) / fr * .6;
  d = max(d, esfera(p, 1.));
  float cara = step(0., g);
  vec3 m = mix(vec3(.12, .36, .42), vec3(.78, .55, .28), cara) * (.9 + .1 * sin(g * 60.));
  m = mix(m, vec3(.9, .88, .8), smoothstep(.96, 1., length(p)));
  vec4 c = vec4(m, d);
  return une(c, vec4(vec3(1.6, 1.1, .6), esfera(p, .17 + .02 * sin(t * 2.))));
}` },
{ id:'mobius', codigo:
`vec4 criatura(vec3 p, float t) {
  p.yz *= gira(.6 + .2 * sin(t * .35)); p.xz *= gira(t * .22);
  float a = atan(p.z, p.x);
  vec2 q = vec2(length(p.xz) - .82, p.y);
  q *= gira(a * .5);
  // cinta calada
  float u = a * 7.6394;
  vec2 h = vec2(fract(u) - .5, q.x / .17 - round(q.x / .17));
  float hue = length(h * vec2(.62, 1.)) - .3;
  float d = max(abs(q.x) - .42, abs(q.y) - .026);
  d = max(d, -max(hue * .13, abs(q.x) - .3));
  float bor = step(.34, abs(q.x));
  vec3 m = mix(vec3(.5, .34, .2), vec3(.85, .7, .42), bor);
  vec4 c = vec4(m, d * .6);
  // dos bolitas que recorren la única cara
  for (int i = 0; i < 3; i++) {
    float k = t * .7 + float(i) * 4.19 + 2. * vuelta();
    vec3 n = vec3(.82 * cos(k), 0, .82 * sin(k));
    float w = k * .5, e = .1;
    n += (vec3(cos(k), 0, sin(k)) * sin(w) + vec3(0, cos(w), 0)) * e;
    c = une(c, vec4(vec3(.5, 1.5, 1.4) * (1. + .2 * acc), esfera(p - n, .065)));
  }
  return c;
}` },
// ---------- Criaturas ----------
{ id:'gato', codigo:
`vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.35 * sin(t * .35) - .25); p.y += .05;
  vec3 q = vec3(abs(p.x), p.yz);
  float res_ = .012 * sin(t * 1.8);
  vec3 pata = acc * step(0., p.x) * vec3(.46, 1.2 + .14 * sin(tq * 10.), .26);
  float d = elipse(p - vec3(0, -.55, -.18), vec3(.46 + res_, .58, .5));
  d = funde(d, elipse(p - vec3(0, -.2, .08), vec3(.31, .5, .3)), .2);
  d = funde(d, elipse(q - vec3(.34, -.86, .0), vec3(.2, .26, .38)), .12);
  d = funde(d, cono(q, vec3(.15, -.35, .24), vec3(.15, -1.02, .34) + pata, .14, .09), .08);
  d = funde(d, elipse(q - vec3(.15, -1.08, .42) - pata * 1.05, vec3(.11, .07 + .05 * acc, .15 - .05 * acc)), .05);
  d = funde(d, elipse(q - vec3(.36, -1.08, .3), vec3(.12, .07, .17)), .05);
  // cabeza, hocico y orejas
  vec3 k = p - vec3(0, .48, .2); k.xy *= gira(.12 * sin(t * .6)); k.xz *= gira(.2 * sin(t * .45));
  vec3 o = vec3(abs(k.x), k.yz);
  d = funde(d, elipse(k, vec3(.37, .33, .33)), .12);
  d = funde(d, elipse(o - vec3(.09, -.12, .27), vec3(.13, .1, .12)), .06);
  d = funde(d, elipse(o - vec3(.2, -.06, .14), vec3(.16, .15, .17)), .08);
  vec3 e = o - vec3(.21, .28, .0); e.xy *= gira(.25 + .1 * max(0., sin(t * 2.3)) * step(.9, sin(t * .5)));
  float or_ = cono(e, vec3(0), vec3(.03, .3, -.02), .15, .012);
  or_ = max(or_, -cono(e - vec3(0, 0, .09), vec3(0, .0, 0), vec3(.03, .24, 0), .1, .01));
  d = funde(d, or_, .05);
  // pelaje atigrado
  float pel = .012 * sin(p.x * 41. + 3. * sin(p.y * 17.)) * sin(p.y * 43.) * sin(p.z * 39.);
  float ray = smoothstep(.2, .6, sin(p.y * 15. + 2.5 * sin(p.x * 4.) + 2. * sin(p.z * 5.)));
  float frente = smoothstep(.2, .6, sin(k.x * 34.)) * step(.14, k.y) * step(.0, k.z);
  vec3 piel = mix(vec3(.62, .38, .18), vec3(.3, .15, .07), max(ray * .75, frente));
  float blanco = smoothstep(.1, .24, p.z - .9 * abs(p.x)) * smoothstep(.2, -.0, p.y) + step(length((k - vec3(0, -.16, .3)) * vec3(1., 1.2, 1.)), .2);
  blanco += smoothstep(-.98, -1.03, p.y);
  piel = mix(piel, vec3(.85, .8, .72), clamp(blanco, 0., 1.));
  vec4 c = vec4(piel, (d + pel) * .65);
  // ojos, nariz y bigotes
  c = une(c, ojo(o - vec3(.145, .03, .25), .15, vec3(.45, .55, .12), vec3(0, 0, 1), vec3(.5, .3, .14)));
  c = une(c, vec4(vec3(.6, .3, .28), elipse(k - vec3(0, -.055, .37), vec3(.04, .028, .03))));
  float big = 9.;
  for (int i = 0; i < 3; i++) { float f = float(i) - 1.; big = min(big, cono(o, vec3(.12, -.12, .36), vec3(.5, -.1 + .09 * f, .34), .007, .003)); }
  c = une(c, vec4(vec3(.9, .88, .82), big));
  // cola
  float cu = curva(p, vec3(.3, -1.0, -.45), vec3(1.05, -1.1, -.25), vec3(.62, -1.06, .35), .1, .085);
  cu = min(cu, curva(p, vec3(.62, -1.06, .35), vec3(.4, -1.05, .65), vec3(.15 + .08 * sin(t * 1.3), -1.0 + .06 * sin(t * 1.3), .68), .085, .07));
  return une(c, vec4(mix(vec3(.62, .38, .18), vec3(.3, .15, .07), step(.2, sin((p.x - p.z) * 24.))), (cu + pel) * .7));
}` },
{ id:'tiburon', codigo:
`vec4 criatura(vec3 p, float t) {
  p.y -= .05 * sin(t * .7); p.xz *= gira(.25 * sin(t * .3) + .35);
  p /= 1.06;
  // nado: la ondulación crece hacia la cola
  float k = smoothstep(-.3, 1.4, p.x);
  p.z += .24 * k * sin(p.x * 2.4 - t * 2.4 - acc * tq * 4.);
  vec3 q = vec3(p.xy, abs(p.z));
  // cuerpo: hocico cónico, tronco grueso y cola que se afila
  vec3 f = p; f.z *= 1.1;
  float d = cono(f, vec3(-1.22, .1, 0), vec3(-.82, .06, 0), .05, .19);
  d = funde(d, cono(f, vec3(-.82, .06, 0), vec3(-.22, .02, 0), .19, .31), .1);
  d = funde(d, cono(f, vec3(-.22, .02, 0), vec3(.5, .04, 0), .31, .18), .12);
  d = funde(d, cono(f, vec3(.5, .04, 0), vec3(1.2, .08, 0), .18, .05), .1);
  // boca: la cabeza se corta por la línea de los labios y la mitad de abajo gira como mandíbula
  float ab = .13 + .04 * sin(t * .9) + .4 * acc * abs(sin(tq * 3.4));
  float labio = -.02;
  d = max(d, -max(p.y - labio, p.x + .57));
  vec3 j = p - vec3(-.57, labio, 0); j.xy *= gira(-ab);
  vec3 jf = j; jf.z *= 1.1;
  float ma = cono(jf, vec3(-.43, .1, 0), vec3(-.1, .09, 0), .15, .23);
  ma = funde(ma, cono(jf, vec3(-.1, .09, 0), vec3(.2, .06, 0), .23, .28), .08);
  ma = max(ma, j.y);
  ma = max(ma, -elipse(j - vec3(-.19, .02, 0), vec3(.21, .045, .1)));
  d = min(d, ma);
  // aleta dorsal, pequeña dorsal y quilla
  vec3 a = p - vec3(-.08, .27, 0);
  float al = max(abs(a.z) - .045 + .07 * a.y, max(max(a.x * .9 + a.y * .42 - .24, -a.x * .78 + a.y * .62 - .12), -a.y - .1));
  a = p - vec3(.78, .14, 0);
  al = min(al, max(abs(a.z) - .02, max(max(a.x * .8 + a.y * .5 - .07, -a.x * .7 + a.y * .7 - .04), -a.y - .08)));
  d = funde(d, al, .05);
  // pectorales largas y pélvicas
  a = q - vec3(-.3, -.14, .2); a.yz *= gira(-.5); a.xz *= gira(.6);
  d = funde(d, max(elipse(a - vec3(.04, 0, .34), vec3(.15, .03, .42)), -(a.x + .2)), .06);
  a = q - vec3(.5, -.1, .08); a.yz *= gira(-.6); a.xz *= gira(.5);
  d = funde(d, elipse(a - vec3(.03, 0, .1), vec3(.08, .02, .13)), .04);
  // cola de media luna, lóbulo de arriba más largo
  a = p - vec3(1.18, .08, 0);
  float co = curva(a, vec3(-.05, 0, 0), vec3(.12, .2, 0), vec3(.4, .58, 0), .1, .012);
  co = min(co, curva(a, vec3(-.05, 0, 0), vec3(.08, -.16, 0), vec3(.26, -.4, 0), .09, .012));
  d = funde(d, max(co, abs(a.z) - .03), .04);
  // color: lomo gris, vientre claro, con borde irregular
  float linea = -.05 + .035 * sin(p.x * 8. + .5) + .015 * sin(p.x * 23.);
  vec3 piel = mix(vec3(.8, .8, .77), vec3(.27, .33, .38), smoothstep(linea - .025, linea + .035, p.y));
  // cinco branquias y poro de la piel
  float bx = p.x + .4 + .25 * p.y, n = clamp(round(bx / .055), -2., 2.);
  float br = smoothstep(.013, .003, abs(bx - n * .055)) * step(abs(p.y - .01), .13);
  piel *= 1. - .7 * br;
  piel *= .93 + .09 * sin(p.x * 61.) * sin(p.y * 67.) * sin(p.z * 59.);
  // interior de la boca
  float dentro = max(step(abs(p.y - labio), .014) * step(p.x, -.6), step(-.05, j.y) * step(ma, .004) * step(abs(j.z), .105) * step(j.x, -.0));
  piel = mix(piel, vec3(.36, .07, .08), dentro);
  vec4 c = vec4(piel, d * .6);
  // dientes de arriba, siguiendo el contorno del labio
  float n1 = clamp(round((p.x + .8) / .048), -4., 4.), x1 = -.8 + n1 * .048;
  float R1 = x1 < -.82 ? mix(.19, .05, (-.82 - x1) / .4) : mix(.19, .31, (x1 + .82) / .6);
  float c1 = x1 < -.82 ? mix(.06, .1, (-.82 - x1) / .4) : .055;
  float z1 = sqrt(max(R1 * R1 - (c1 - labio) * (c1 - labio), 0.)) / 1.1 - .012;
  vec3 u = vec3(p.x - x1, p.y - labio, q.z - z1);
  float di = cono(u, vec3(0, .012, 0), vec3(.006, -.05, 0), .02, .002) + step(z1, .02);
  // dientes de abajo
  float n2 = clamp(round((j.x + .21) / .048), -3., 3.), x2 = -.21 + n2 * .048;
  float R2 = mix(.15, .23, clamp((x2 + .42) / .32, 0., 1.)), z2 = sqrt(max(R2 * R2 - .0121, 0.)) / 1.1 - .016;
  u = vec3(j.x - x2, j.y, abs(j.z) - z2);
  di = min(di, cono(u, vec3(0, -.012, 0), vec3(.004, .04, 0), .016, .002) + step(z2, .015));
  c = une(c, vec4(vec3(.92, .9, .84), di * .7));
  // ojo pequeño y negro, y orificio nasal
  c = une(c, ojo(q - vec3(-.84, .1, .165), .085, vec3(.02, .02, .025), vec3(-.25, 0, 1), vec3(.26, .32, .37)));
  return une(c, vec4(vec3(.05), elipse(q - vec3(-1.1, .075, .075), vec3(.022, .012, .012))));
}` }
);
