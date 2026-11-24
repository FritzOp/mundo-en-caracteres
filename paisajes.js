// Paisajes a pantalla completa para el inicio. Cada uno es GLSL:
//   vec3 paisaje(vec2 u, float t)   u.y va de -1 a 1; u.x de -aspecto a aspecto
// acc (0 a 1) y tq (segundos) cuentan el toque; lampara es la posición de la luz.
window.PAISAJES = [
// ---------- Espacio ----------
{ id:'p-nebulosa', mundo:'Espacio', nombre:'Nebulosa', fondo:'espacio', codigo:
`vec3 paisaje(vec2 u, float t) {
  vec2 q = u * 1.3 + vec2(t * .015, 0.);
  float a = fbm(q + fbm(q * 1.7 + t * .02) * 1.4), b = fbm(q * 1.4 - vec2(3., t * .015) + a);
  vec3 c = mix(vec3(.01, .01, .04), vec3(.45, .12, .42), smoothstep(.35, .8, a)) + vec3(.08, .32, .5) * smoothstep(.45, .85, b);
  c += vec3(.9, .5, .3) * pow(smoothstep(.55, .95, a * b * 2.), 2.) * .7;
  c += estrellas(u, t, 26., .9) + estrellas(u + 4., t, 60., .6) * .6;
  // planeta con anillos
  vec2 p = u - vec2(aspecto * .42, .12); p *= gira(.38); float R = .42, r = length(p);
  float d = length(p * vec2(1., 3.6)), an = smoothstep(.02, .0, abs(d - .74) - .13) * (.55 + .45 * sin(d * 70.)); an *= step(.012, abs(d - .76));
  if (r < R) { vec3 n = vec3(p, sqrt(R * R - r * r)) / R; float l = max(dot(n, normalize(vec3(-.7, .45, .5))), 0.); float f = sin(n.y * 13. + 1.2 * fbm(vec2(n.x * 2. + t * .05, n.y * 5.)) * 3.); c = mix(vec3(.55, .3, .2), vec3(.95, .75, .5), .5 + .5 * f) * (.06 + 1.05 * l) + vec3(.1, .2, .35) * pow(1. - n.z, 3.); }
  if (p.y < 0. || r > R) c = mix(c, vec3(.85, .72, .55), an * .8);
  return c + fugaces(u, t) * (1. + 3. * acc);
}` },
{ id:'p-luna', mundo:'Espacio', nombre:'Salida de la Tierra', fondo:'espacio', codigo:
`vec3 paisaje(vec2 u, float t) {
  vec3 c = estrellas(u, t, 30., .9) + estrellas(u + 7., t, 70., .5) * .5;
  // la Tierra sube despacio
  vec2 p = u - vec2(aspecto * .4, .28 + .06 * sin(t * .08)); float R = .33, r = length(p);
  if (r < R) { vec3 n = vec3(p, sqrt(R * R - r * r)) / R; n.xz *= gira(t * .05); float l = max(dot(vec3(p, sqrt(R * R - r * r)) / R, normalize(vec3(-.6, .4, .6))), 0.);
    float ti = smoothstep(.5, .56, fbm(n.xy * 2.4 + n.z * 1.3 + 3.)), nu = smoothstep(.52, .7, fbm(n.xy * 3.3 + n.zx * 2. + t * .02));
    c = mix(mix(vec3(.08, .25, .6), vec3(.25, .45, .18), ti), vec3(.95), nu * .8) * (.05 + 1.15 * l); }
  c += vec3(.25, .5, 1.) * .12 * exp(-max(r - R, 0.) * 14.) * step(R, r);
  // suelo con cráteres en perspectiva
  float h = -.28 + .06 * sierra(u.x * 1.3, 2.);
  if (u.y < h) {
    float z = .5 / (h - u.y + .06); vec2 g = vec2(u.x * z, z + t * .08) * 1.6; float s = .42 + .25 * fbm(g * 2.5);
    for (int i = 0; i < 3; i++) { float e = exp2(float(i)); vec2 k = floor(g * e), f = fract(g * e) - .5; float hh = azar(k + float(i) * 9.); vec2 o = f - (vec2(azar(k + 3.), azar(k + 5.)) - .5) * .5; float rr = .12 + .24 * hh, d = length(o) / rr; if (hh > .35) { s += smoothstep(1.25, 1., d) * smoothstep(.8, 1., d) * .35 * (o.x < 0. ? 1. : -.6); s -= smoothstep(1., .6, d) * .16 * (.5 - o.x / rr); } }
    c = vec3(s) * vec3(1., .97, .92) * smoothstep(9., 1., z) ;
  }
  // módulo y bandera
  vec2 m = u - vec2(aspecto * .08, -.36);
  float b = max(abs(m.x) - .09, abs(m.y - .1) - .06); b = min(b, max(abs(m.x) - .06, abs(m.y - .2) - .04)); b = min(b, trazo(vec2(abs(m.x), m.y), vec2(.07, .04), vec2(.16, -.04)) - .012);
  c = mix(c, vec3(.75, .62, .35) * (.6 + .5 * step(m.x, 0.)), smoothstep(.012, .0, b));
  vec2 ba = m - vec2(.32, .0); c = mix(c, vec3(.8), smoothstep(.01, .0, trazo(ba, vec2(0, -.04), vec2(0, .24)) - .006)); vec2 te = ba - vec2(.08, .19 + .012 * sin(ba.x * 30. - t * 2. - acc * tq * 12.)); c = mix(c, vec3(.7, .15, .12), smoothstep(.01, .0, max(abs(te.x) - .075, abs(te.y) - .045)));
  return c + fugaces(u, t) * 2. * acc;
}` },
{ id:'p-asteroides', mundo:'Espacio', nombre:'Campo de asteroides', fondo:'espacio', codigo:
`vec3 paisaje(vec2 u, float t) {
  vec2 so = vec2(aspecto * .62, .48); float ds = length(u - so), an = atan(u.y - so.y, u.x - so.x);
  vec3 c = vec3(.02, .015, .03) + estrellas(u, t, 34., .8);
  c += vec3(1.2, .75, .35) * (.05 / (ds * ds + .04)) * (.8 + .2 * sin(an * 9. + t * .3) * sin(an * 5. - t * .2)) * .5 + vec3(1.3, 1.1, .8) * smoothstep(.13, .1, ds);
  // salto hiperespacial al tocar
  float st = pow(max(0., sin(atan(u.y, u.x) * 90. + azar(vec2(floor(atan(u.y, u.x) * 60.), 1.)) * 40.)), 24.) * smoothstep(.1, 1.2, length(u)); c += vec3(.5, .8, 1.3) * st * acc * step(.5, fract(length(u) * 2. - tq * 5.));
  for (int i = 0; i < 4; i++) {
    float f = float(i), e = 3.6 - f * .85, v = .03 + .05 * f; vec2 g = u * e * .55 + vec2(t * v * (1. + 5. * acc * 0.), f * 5.); vec2 k = floor(g), q = fract(g) - .5; float h = azar(k + f * 13.);
    if (h < .42) continue;
    q -= (vec2(azar(k + 2.), azar(k + 8.)) - .5) * .4; q *= gira(t * (.1 + .3 * h) + h * 9.); float aa = atan(q.y, q.x), R = .13 + .12 * h, r = length(q) - R * (1. + .28 * (ruido(vec2(aa * 1.6 + h * 9., h * 7.)) - .5) + .12 * sin(aa * 5. + h * 20.));
    if (r < 0.) { vec2 n = q / R; vec2 l = normalize((so - u)) * gira(-(t * (.1 + .3 * h) + h * 9.)); float li = clamp(.35 + .75 * dot(n, l), 0., 1.2); float s = .55 + .6 * fbm(q * 14. + h * 20.); c = vec3(.62, .52, .44) * s * (.14 + li) * (.55 + .2 * f); }
  }
  // nave con estela
  vec2 n = u - vec2(mod(t * .16, aspecto * 2.6) - aspecto * 1.3, -.25 + .12 * sin(t * .4)); n.y -= 0.;
  float na = max(max(abs(n.y) - .03 * (1. - n.x * 4.), abs(n.x) - .12), -9.); na = min(na, max(abs(n.y) - .09 * step(n.x, -.02) , abs(n.x + .07) - .03));
  c = mix(c, vec3(.75, .78, .82), smoothstep(.012, .0, na)); c += vec3(.4, .9, 1.4) * exp(-abs(n.y) * 60.) * smoothstep(-.9, -.1, n.x) * step(n.x, -.1) * (.7 + .3 * sin(n.x * 60. + t * 30.));
  return c;
}` },
{ id:'p-anillos', mundo:'Espacio', nombre:'Sobre los anillos', fondo:'espacio', codigo:
`vec3 paisaje(vec2 u, float t) {
  vec3 c = estrellas(u, t, 30., .9) + vec3(.02, .015, .03);
  // planeta gigante en el horizonte
  vec2 p = u - vec2(-aspecto * .1, 1.9); p.x *= .75; float R = 1.75, r = length(p);
  if (r < R) { vec3 n = vec3(p, sqrt(R * R - r * r)) / R; float f = sin(n.y * 34. + 3. * fbm(vec2(n.x * 3. + t * .06, n.y * 9.))) * .5 + .5; float l = max(dot(n, normalize(vec3(.75, -.35, .45))), 0.); c = mix(vec3(.5, .34, .2), vec3(.95, .78, .52), f) * (.04 + 1.1 * l); float ma = length((n.xy - vec2(.25, -.72)) * vec2(1., 2.2)); c = mix(c, vec3(.75, .28, .14) * (.1 + l), smoothstep(.14, .1, ma)); }
  // plano de anillos
  float hz = .02;
  if (u.y < hz) {
    float z = .35 / (hz - u.y + .012); vec2 g = vec2(u.x * z, z - t * .25 * (1. + 4. * acc * 0.)); float ra = length(g * vec2(.6, 1.)); float ba = .5 + .5 * sin(ra * 6.) * sin(ra * 2.3 + 1.); ba *= step(.12, abs(fract(ra * .35) - .5));
    float gr = ruido(g * 22.), pi = step(.8, azar(floor(g * 16.))); vec3 k = mix(vec3(.4, .32, .26), vec3(.95, .85, .7), ba * .7 + .3 * gr) * (.35 + .65 * ba) + pi * .25 * ba; k *= smoothstep(26., 2., z) * (.65 + .4 * smoothstep(-.5, 1., u.x / aspecto)); c = mix(c, k, .92 * smoothstep(0., .03, hz - u.y));
  }
  // hielo flotando cerca
  for (int i = 0; i < 5; i++) { float f = float(i), x = mod(f * 1.37 - t * (.12 + .05 * f), 2.6) - 1.3; vec2 q = u - vec2(x * aspecto, -.35 - .13 * f + .03 * sin(t + f * 2.)); q *= gira(t * .3 + f); float rr = length(q) - (.05 + .02 * f) * (1. + .25 * sin(atan(q.y, q.x) * 5. + f)); if (rr < 0.) c = mix(vec3(.4, .5, .6), vec3(.95, 1., 1.05), smoothstep(-.06, .06, q.x + q.y)); }
  return c + fugaces(u, t) * (.6 + 3. * acc);
}` },
// ---------- Planeta Tierra ----------
{ id:'p-amanecer', mundo:'Planeta Tierra', nombre:'Amanecer en el lago', fondo:'lugares', codigo:
`vec3 cielo_(vec2 u, float t) {
  vec3 c = mix(vec3(1., .55, .28), vec3(.16, .22, .5), smoothstep(-.15, .9, u.y)); vec2 s = u - vec2(aspecto * .38, .08); float d = length(s);
  c += vec3(1.1, .6, .25) * exp(-d * 3.2) * (.8 + .3 * acc) + vec3(1.2, 1., .6) * smoothstep(.15, .13, d);
  float n = fbm(vec2(u.x * 1.1 - t * .03, u.y * 4.) + 2.); c = mix(c, vec3(1., .72, .55), smoothstep(.52, .8, n) * .6 * smoothstep(0., .4, u.y));
  for (int i = 0; i < 4; i++) { float f = float(i), h = -.02 + .36 * (1. - f * .22) * sierra(u.x * (1.1 + .5 * f) + f * 3.7, f * 5. + 1.) * 1.35 - .1 * f * .6; float ni = smoothstep(.02, .0, u.y - h); vec3 m = mix(vec3(.55, .42, .55), vec3(.1, .11, .2), f / 3.); m = mix(m, vec3(1., .8, .75), (f < .5 ? 1. : 0.) * smoothstep(.12, .2, u.y - .12 + .06 * fbm(u * 9.))); c = mix(c, m, ni); }
  return c;
}
vec3 paisaje(vec2 u, float t) {
  float w = -.2; vec3 c;
  if (u.y > w) c = cielo_(u, t);
  else { float p = (w - u.y); float o = .03 * sin(u.y * 70. / (1. + p * 2.) + t * 1.6) * (.3 + p) + .02 * sin(u.x * 9. + u.y * 40. - t) * p; o += acc * .04 * sin(length(u - vec2(0, -.6)) * 34. - tq * 9.); c = cielo_(vec2(u.x + o, w + p * 1.05 + o), t) * vec3(.62, .68, .78); c += vec3(1., .7, .4) * .25 * step(.82, sin(u.x * 60. + t * 2.) * sin(u.y * 120. + t * 3.)) * smoothstep(.5, 0., abs(u.x - aspecto * .38)); }
  // pinos de la orilla
  float x = u.x * 7., k = floor(x), hh = azar(vec2(k, 4.)), al = .12 + .22 * hh; float lado = smoothstep(.2, .75, abs(u.x / aspecto + .1)); vec2 q = vec2(fract(x) - .5, u.y + .95); float pi = max(abs(q.x) - .42 * (1. - q.y / (al * 2. * lado + .01)) * (.75 + .25 * step(.5, fract(q.y * 22.))), q.y - al * 2. * lado); c = mix(c, vec3(.03, .05, .06), smoothstep(.04, .0, pi) * step(u.y, 0.));
  // bandada
  for (int i = 0; i < 6; i++) { float f = float(i); vec2 b = u - vec2(mod(t * .09 + f * .07 + acc * .1, 2.6) * aspecto - aspecto * 1.3, .45 + .05 * sin(f * 2.) + .05 * f * .5); float al2 = .02 * sin(t * 7. + f); c = mix(c, vec3(.06, .05, .1), smoothstep(.012, .0, abs(b.y - abs(b.x) * .5 - al2 + .01) - .006) * step(abs(b.x), .045)); }
  return c;
}` },
{ id:'p-mar', mundo:'Planeta Tierra', nombre:'Mar de noche', fondo:'lugares', codigo:
`vec3 paisaje(vec2 u, float t) {
  float ho = -.12; vec2 lu = vec2(aspecto * .3, .5); float d = length(u - lu);
  float ra = acc * step(.5, fract(sin(floor(tq * 11.) * 12.9) * 43.));
  vec3 c = mix(vec3(.05, .09, .18), vec3(.01, .02, .07), smoothstep(ho, 1., u.y)) + estrellas(u, t, 34., .8) * smoothstep(0., .3, u.y);
  c += vec3(.95, .93, .8) * smoothstep(.19, .18, d) * (.85 + .25 * fbm(u * 7.)) + vec3(.35, .4, .5) * exp(-d * 2.6) * .6;
  float nu = fbm(vec2(u.x * 1.2 + t * .05, u.y * 3. - t * .01)); c = mix(c, vec3(.16, .2, .28) + vec3(.3, .32, .36) * exp(-d * 2.), smoothstep(.5, .75, nu) * smoothstep(-.05, .4, u.y)); c += ra * vec3(.5, .55, .7) * smoothstep(.45, .8, nu);
  if (u.y < ho) {
    float z = .28 / (ho - u.y + .015); vec2 g = vec2(u.x * z, z * 1.3); float o = sin(g.x * 3. + t * 1.3 + 1.5 * sin(g.y * 1.2)) * .5 + sin(g.y * 5. - t * 2. + g.x) * .35 + (ruido(g * 4. + t) - .5) * .9; o *= 1. + .6 * acc;
    c = mix(vec3(.02, .07, .13), vec3(.12, .26, .36), smoothstep(-.6, .9, o)); c += vec3(.85, .92, .95) * smoothstep(.82, 1.1, o) * smoothstep(7., 1., z); c += vec3(.95, .92, .75) * smoothstep(.22, .0, abs(u.x - lu.x) * (.6 + .1 * z)) * smoothstep(.15, .75, o + .3 * sin(g.y * 14. - t * 4.)) * .85;
  }
  // faro y su haz
  vec2 f = u - vec2(-aspecto * .55, -.1); float to = max(abs(f.x) - .045 + .02 * f.y, abs(f.y - .18) - .24); vec3 tc = mix(vec3(.75), vec3(.6, .12, .1), step(0., sin(f.y * 34.))) * (.4 + .5 * step(f.x, .0));
  float ro = f.y + .1 - .12 * exp(-f.x * f.x * 14.) - .03 * ruido(vec2(f.x * 20., 1.)); c = mix(c, vec3(.06, .06, .08), smoothstep(.02, .0, ro) * step(abs(f.x), .55) * step(-.14, f.y));
  c = mix(c, tc, smoothstep(.012, .0, to)); vec2 l = f - vec2(0, .46); c = mix(c, vec3(.1), smoothstep(.01, .0, max(abs(l.x) - .035, abs(l.y - .06) - .02)));
  float an = t * .9, ab = cos(an); float hz = abs(l.y - .0) / max(abs(l.x), .02); float haz = smoothstep(.16, .0, hz) * smoothstep(1.9, .1, abs(l.x)) * max(0., sign(l.x) * ab); c += vec3(1., .85, .5) * haz * .75 * abs(ab); c += vec3(1.3, 1.1, .6) * smoothstep(.05, .02, length(l));
  // velero
  vec2 v = u - vec2(aspecto * (.75 - mod(t * .02, 1.6)), ho - .05 + .012 * sin(t * 1.4)); v *= gira(.06 * sin(t)); float ve = max(abs(v.x) - .1 + .3 * max(0., -v.y - .0), abs(v.y + .012) - .025); float ma = max(max(v.x - .09 * (1. - v.y / .26), -v.x + .006), max(-v.y + .02, v.y - .26)); c = mix(c, vec3(.1, .07, .06), smoothstep(.01, .0, ve)); c = mix(c, vec3(.75, .74, .68), smoothstep(.01, .0, ma));
  return c;
}` },
{ id:'p-desierto', mundo:'Planeta Tierra', nombre:'Desierto', fondo:'objetos', codigo:
`vec3 paisaje(vec2 u, float t) {
  u.x += .004 * sin(u.y * 60. + t * 5.) * smoothstep(.1, -.1, u.y);
  vec3 c = mix(vec3(1., .62, .3), vec3(.32, .3, .52), smoothstep(-.1, 1., u.y)); vec2 s = u - vec2(aspecto * .35, .34); float d = length(s); c += vec3(1., .5, .2) * exp(-d * 2.6) * .7 + vec3(1.1, .95, .65) * smoothstep(.2, .19, d);
  for (int i = 0; i < 5; i++) {
    float f = float(i), v = .01 + .012 * f, x = u.x * (.75 + .18 * f) + t * v + f * 4.; float h = .14 - .2 * f + .17 * sin(x * 1.5 + f) + .1 * ruido(vec2(x * 1.3, f)); float y = u.y - h;
    if (y < 0.) { float pe = cos(x * 1.5 + f) ; float lu = smoothstep(-.4, .7, pe - y * 1.2); float ri = sin((u.y * 90. + 6. * sin(x * 4. + f)) / (1. + f * .35)) * .5 + .5; vec3 a = mix(vec3(.75, .42, .22), vec3(.45, .22, .14), f / 5.), b = mix(vec3(1., .78, .45), vec3(.95, .62, .32), f / 5.); c = mix(a, b, lu) * (.86 + .16 * ri); c += vec3(1., .8, .5) * .18 * step(.93, azar(floor(u * vec2(90., 60.) + vec2(t * 24. * (1. + 2. * acc), 0)))) * smoothstep(-.25, 0., y) * (.4 + 2. * acc); }
  }
  // caravana en la cresta de la segunda duna
  for (int i = 0; i < 5; i++) { float f = float(i), px = mod(t * .035 + f * .17, 2.4) * aspecto - aspecto * 1.2; float x = px * .93 + t * .022 + 4.; float hh = .14 - .2 + .17 * sin(x * 1.5 + 1.) + .1 * ruido(vec2(x * 1.3, 1.)); vec2 q = u - vec2(px, hh + .04); float pa = .008 * sin(t * 5. + f * 2.);
    float cu = length(q * vec2(1., 1.5)) - .042; cu = min(cu, length((q - vec2(0, .035)) * vec2(1.3, 1.)) - .022); cu = min(cu, trazo(q, vec2(.035, 0), vec2(.07, .045)) - .01); cu = min(cu, length(q - vec2(.08, .05)) - .016); vec2 w = vec2(abs(q.x) - .024, q.y); cu = min(cu, trazo(w, vec2(0, -.01), vec2(pa, -.06)) - .007); c = mix(c, vec3(.13, .07, .07), smoothstep(.008, .0, cu)); }
  return c;
}` },
{ id:'p-aurora', mundo:'Planeta Tierra', nombre:'Bosque con aurora', fondo:'naturaleza', codigo:
`vec3 paisaje(vec2 u, float t) {
  vec3 c = mix(vec3(.03, .08, .12), vec3(.005, .01, .04), smoothstep(-.2, 1., u.y)) + estrellas(u, t, 34., .9);
  for (int i = 0; i < 3; i++) { float f = float(i), x = u.x * 1.1 + f * 1.7; float b = .28 + .16 * f + .16 * sin(x * 1.7 + t * .25 + f) + .07 * sin(x * 4.3 - t * .4); float y = u.y - b; float cor = .6 + .4 * sin(x * 26. + 5. * sin(x * 2. + t * .3) + t) * ruido(vec2(x * 9., t * .6)); float in_ = smoothstep(-.03, .02, y) * exp(-max(y, 0.) * (2.6 - .4 * f)) * cor * (.75 + .9 * acc); c += mix(vec3(.15, 1., .55), vec3(.55, .25, .95), smoothstep(0., .55, y)) * in_ * (.75 - .15 * f); }
  for (int i = 0; i < 4; i++) {
    float f = float(i), e = 3.4 + 1.4 * (3. - f) , ba = -.2 - .19 * f; float x = u.x * e + f * 7.3, k = floor(x), h = azar(vec2(k, f)); vec2 q = vec2(fract(x) - .5 - (h - .5) * .3, (u.y - ba) * e * .36 + .02); q.x += .03 * sin(t * .9 + k + f) * q.y; float al = .55 + .55 * h; float pi = max(abs(q.x) - .34 * (1. - q.y / al) * (.62 + .38 * fract(-q.y * 5.5)), max(q.y - al, -q.y - .05)); vec3 m = mix(vec3(.1, .2, .2), vec3(.015, .035, .04), f / 3.); m = mix(m, vec3(.55, .68, .72), smoothstep(.2, .02, fract(-q.y * 5.5)) * .55 * (1. - f * .2));
    if (pi < 0.) c = m; float su = ba + .02 * sin(u.x * 5. + f * 3.) - u.y; if (su > 0.) c = mix(vec3(.2, .3, .36), vec3(.5, .6, .66), .5 + .5 * ruido(u * vec2(9., 26.) + f)) * (.95 - .18 * f) + vec3(.05, .25, .18) * (.4 + acc);
  }
  // cabaña con luz y humo
  vec2 q = u - vec2(aspecto * .4, -.55); float ca = max(abs(q.x) - .16, abs(q.y - .07) - .09), te = max(abs(q.x) * .62 + (q.y - .16) - .14, .14 - q.y); c = mix(c, vec3(.14, .09, .06) * (.8 + .4 * step(.5, fract(q.y * 34.))), smoothstep(.008, .0, ca)); c = mix(c, vec3(.75, .82, .86), smoothstep(.008, .0, te)); vec2 v = vec2(abs(q.x) - .075, q.y - .085); c = mix(c, vec3(1.5, .95, .4), smoothstep(.006, .0, max(abs(v.x) - .035, abs(v.y) - .035)));
  float hu = smoothstep(.07, .0, abs(q.x - .1 - .07 * sin(q.y * 7. - t) * q.y - .05 * q.y) - .02 - .07 * q.y) * smoothstep(.3, .4, q.y) * smoothstep(1., .4, q.y); c = mix(c, vec3(.4, .44, .48), hu * .5 * (.5 + .5 * ruido(vec2(q.x * 12., q.y * 9. - t))));
  return c + nieve(u, t) * .75;
}` },
// ---------- Mundos fantásticos ----------
{ id:'p-islas', mundo:'Mundo fantástico', nombre:'Islas flotantes', fondo:'fauna', codigo:
`vec3 paisaje(vec2 u, float t) {
  vec3 c = mix(vec3(.95, .6, .62), vec3(.25, .25, .6), smoothstep(-.7, .9, u.y)); c += vec3(1., .85, .7) * .5 * exp(-length(u - vec2(aspecto * .5, .55)) * 2.2); c += vec3(.95, .9, 1.) * smoothstep(.3, .28, length(u - vec2(aspecto * .5, .55))) * .4;
  for (int i = 0; i < 3; i++) { float f = float(i); float n = fbm(vec2(u.x * (.9 + .4 * f) - t * (.03 + .02 * f), u.y * 2.6 + f * 4.)); c = mix(c, mix(vec3(.8, .55, .68), vec3(1., .88, .86), n), smoothstep(.45, .75, n) * smoothstep(.1, -.8, u.y - .25 * f + .2) * .8); }
  for (int i = 0; i < 6; i++) {
    float f = float(i), s = .1 + .06 * f; float px = mod(f * .39 + t * (.004 + .003 * f), 1.3) * 2. - 1.3; vec2 q = u - vec2(px * aspecto, .42 - .17 * f + .22 * sin(f * 2.4) + .03 * sin(t * .7 + f * 2.) + .06 * acc * sin(tq * 4. + f)); q /= s;
    float ar = q.y - .16 * (1. - q.x * q.x * .8) - .06 * ruido(vec2(q.x * 5. + f, f)), ab = -q.y - (1.5 + .5 * ruido(vec2(f, 3.))) * pow(max(0., 1. - abs(q.x) / 1.25), 1.5) + .25 * ruido(vec2(q.x * 7., q.y * 4. + f)); float is = max(max(ar, ab), abs(q.x) - 1.25);
    float ni = .35 + .13 * f;
    // cascada
    float wx = abs(q.x - .55 - .05 * sin(q.y * 4.)) - .09; float wa = max(max(wx, q.y - .05), -q.y - 2.6); if (wa < 0. && f > 1.5) c = mix(c, vec3(.75, .9, 1.) * (.75 + .35 * sin(q.y * 14. + t * 9. + sin(q.x * 60.))), smoothstep(-2.6, -.6, q.y) * .85);
    if (is < 0.) { float hi = smoothstep(-.13, .0, ar); c = mix(mix(vec3(.3, .2, .24), vec3(.55, .38, .34), ruido(q * vec2(5., 3.) + f)), mix(vec3(.2, .42, .24), vec3(.5, .72, .32), ruido(q * 9.)), hi) * ni + vec3(.35, .22, .3) * (1. - ni); }
    // árboles y torre
    vec2 a = q - vec2(-.45, .28); float co = min(length(a - vec2(0, .28)) - .25, length(a - vec2(.18, .16)) - .18); if (co < .04 * sin(a.x * 30.) * sin(a.y * 30.)) c = mix(vec3(.75, .3, .45), vec3(1., .65, .72), ruido(a * 12.)) * ni + vec3(.3, .2, .28) * (1. - ni); if (max(abs(a.x) - .03, abs(a.y) - .2) < 0.) c = vec3(.25, .15, .15);
    if (mod(f, 2.) > .5) { vec2 w = q - vec2(.15, .3); float to = max(abs(w.x) - .12, abs(w.y - .25) - .35), ct = max(abs(w.x) * 2.2 + (w.y - .6) - .42, .6 - w.y); if (to < 0.) c = mix(vec3(.75, .7, .72) * ni, vec3(1.4, 1., .5), step(max(abs(w.x) - .03, abs(w.y - .35) - .07), 0.)); if (ct < 0.) c = vec3(.35, .22, .55) * (.5 + ni); }
  }
  // ballena voladora
  vec2 b = u - vec2(aspecto * (1.3 - mod(t * .035, 2.6)), .62 + .04 * sin(t * .8)); float cu = length(b * vec2(1., 2.4) - vec2(0, .12 * b.x * b.x * 4.)) - .17; cu = min(cu, max(abs(b.y - .05 - .5 * (b.x - .16) * (b.x - .16) * 8. - .02 * sin(t * 2.)) - .02, abs(b.x - .24) - .09)); vec2 al = b - vec2(-.02, -.05); cu = min(cu, length(al * vec2(1., 3.) * gira(.6 + .3 * sin(t * 2.))) - .07); if (cu < 0.) c = mix(vec3(.75, .78, .95), vec3(.32, .32, .6), smoothstep(-.06, .04, b.y));
  return c;
}` },
{ id:'p-hongos', mundo:'Mundo fantástico', nombre:'Bosque de hongos', fondo:'naturaleza', codigo:
`vec3 paisaje(vec2 u, float t) {
  vec3 c = mix(vec3(.02, .1, .12), vec3(.01, .02, .06), smoothstep(-.6, .9, u.y)); c += vec3(.05, .25, .28) * fbm(u * 1.6 + vec2(t * .04, 0)) * .6;
  for (int i = 0; i < 5; i++) {
    float f = float(i), e = 2.6 - .42 * f, ba = -.5 - .1 * f; float x = u.x * e + f * 3.71, k = floor(x), h = azar(vec2(k, f + 2.)); if (h < .22) continue;
    vec2 q = vec2(fract(x) - .5 - (h - .5) * .25, (u.y - ba) * e * .62); float al = (.55 + .75 * h) * (1. + .05 * acc * sin(tq * 8. + k)); q.x -= .03 * sin(t * .8 + k) * q.y;
    float W = .24 + .16 * h, pie = max(abs(q.x - .06 * sin(q.y * 4. + h * 9.)) - .05 - .04 * smoothstep(.3, .0, q.y), max(q.y - al, -q.y - .4)); vec2 s = q - vec2(.06 * sin(al * 4. + h * 9.), al); float cap = max(length(s * vec2(1., 1.35)) - W, -s.y - .03 - .1 * s.x * s.x); float la = max(max(abs(s.x) - W * .85, abs(s.y + .045) - .03), -9.);
    vec3 col = h < .45 ? vec3(.2, .95, .8) : h < .7 ? vec3(.75, .35, 1.) : vec3(1., .55, .3); float pu = .65 + .35 * sin(t * 1.3 + k * 2. + f) + .7 * acc; float lej = .22 + .2 * f;
    c += col * .1 * lej * pu * exp(-max(length(s) - W, 0.) * 5.);
    if (pie < 0.) c = mix(vec3(.25, .4, .42), col * .5, smoothstep(al - .5, al, q.y)) * lej * (.7 + .5 * smoothstep(-.06, .05, q.x));
    if (la < 0.) c = col * 1.1 * pu * lej * (.6 + .4 * step(.5, fract(s.x * 26.)));
    if (cap < 0.) { float pt = smoothstep(.06, .03, length(fract(s * 9. + h * 5.) - .5) - .12 * azar(floor(s * 9. + h * 5.))); c = mix(col * .45, col * 1.15, pt) * lej * (.6 + .9 * smoothstep(-.1, W * .8, s.y)) * (.75 + .25 * pu); }
    float su = ba - .03 * sin(u.x * 4. + f * 2.) - u.y; if (su > 0. && f > 1.5) c = mix(vec3(.02, .07, .06), vec3(.08, .2, .14), ruido(u * vec2(14., 30.) + f)) * (.4 + .15 * f);
  }
  // esporas
  for (int i = 0; i < 3; i++) { float f = float(i); vec2 g = u * (7. + 4. * f) + vec2(sin(t * .3 + f) * .6, -t * (.25 + .15 * f) * (1. + 0. * acc)); vec2 k = floor(g), q = fract(g) - .5; float h = azar(k + f * 5.); if (h > .72) { q -= vec2(sin(t + h * 30.), cos(t * .8 + h * 20.)) * .25; c += mix(vec3(.4, 1.2, .9), vec3(1.2, .8, .4), fract(h * 7.)) * smoothstep(.12, .0, length(q)) * (.6 + .4 * sin(t * 3. + h * 40.) + acc); } }
  return c;
}` },
{ id:'p-castillo', mundo:'Mundo fantástico', nombre:'El castillo y el dragón', fondo:'monstruos', codigo:
`vec3 paisaje(vec2 u, float t) {
  vec3 c = mix(vec3(.75, .28, .2), vec3(.08, .05, .16), smoothstep(-.4, .8, u.y)); vec2 lu = u - vec2(aspecto * .45, .35); c += vec3(1., .75, .55) * smoothstep(.4, .385, length(lu)) * (.75 + .25 * fbm(lu * 5.)) + vec3(.6, .25, .2) * exp(-length(lu) * 2.) * .7; float n = fbm(vec2(u.x * 1.3 - t * .04, u.y * 4.)); c = mix(c, vec3(.2, .09, .16), smoothstep(.5, .72, n) * .75);
  for (int i = 0; i < 3; i++) { float f = float(i); float h = -.2 - .18 * f + .4 * sierra(u.x * (1.2 + .4 * f) + f * 9., f + 11.); c = mix(c, mix(vec3(.32, .13, .2), vec3(.05, .03, .08), f / 2.), smoothstep(.012, .0, u.y - h)); }
  // castillo en un risco
  vec2 q = u - vec2(aspecto * .42, -.35); float ri = q.y - .1 + .9 * pow(abs(q.x) * 1.5, 1.6) + .08 * ruido(q * 9.); vec3 pi = vec3(.07, .045, .09); c = mix(c, pi, smoothstep(.01, .0, ri));
  float ca = max(abs(q.x) - .2, abs(q.y - .17) - .12); ca = max(ca, -max(abs(fract(q.x * 14.) - .5) / 14. - .016, .27 - q.y)); float to = 9.;
  for (int i = 0; i < 5; i++) { float f = float(i) - 2.; float H = .42 - .06 * abs(f) + .07 * mod(f, 2.); vec2 w = q - vec2(f * .1, 0); to = min(to, max(abs(w.x) - .034, abs(w.y - H * .5) - H * .5)); to = min(to, max(abs(w.x) * 2.6 + (w.y - H) - .13, H - w.y)); }
  c = mix(c, pi * 1.2, smoothstep(.006, .0, min(ca, to))); vec2 v = vec2(fract(q.x * 20.) - .5, fract(q.y * 13.) - .5); float on = step(.55, azar(floor(vec2(q.x * 20., q.y * 13.)))) * step(min(ca, to), -.008); c = mix(c, vec3(1.5, .85, .3) * (.8 + .2 * sin(t * 3. + floor(q.x * 20.))), on * step(abs(v.x), .18) * step(abs(v.y), .25));
  // dragón que cruza y escupe fuego
  vec2 d = u - vec2(sin(t * .22) * aspecto * .75, .42 + .16 * sin(t * .44)); float di = sign(cos(t * .22)); d.x *= di; d *= gira(-.12 * cos(t * .44)); d *= 1.15;
  float cu = length((d - vec2(0, .01 * sin(t * 4.))) * vec2(1., 2.6)) - .13; cu = min(cu, trazo(d, vec2(.1, .01), vec2(.24, .07)) - .022); cu = min(cu, length((d - vec2(.27, .08)) * vec2(1., 1.6)) - .042); cu = min(cu, trazo(d, vec2(-.1, 0), vec2(-.34, -.03 + .05 * sin(t * 3.))) - .018 + .02 * smoothstep(-.1, -.34, d.x)); cu = min(cu, length(d - vec2(-.36, -.03 + .05 * sin(t * 3.))) - .02);
  float fl = sin(t * 4.5); vec2 w = d - vec2(.0, .03); w.y *= sign(fl) == 0. ? 1. : 1.; float ex = .1 + .26 * fl; float wy = w.y - ex * smoothstep(0., .3, abs(w.x + .02)) * 1.1; float ala = max(abs(wy - .0) - .1 * (1. - abs(w.x + .02) / .34) - .02 * abs(sin(w.x * 30.)), abs(w.x + .02) - .33); cu = min(cu, ala); c = mix(c, vec3(.04, .015, .03), smoothstep(.008, .0, cu));
  float fu = max(acc, smoothstep(.7, 1., sin(t * .7))); vec2 b = d - vec2(.31, .06); float fa = max(abs(b.y + .12 * b.x) - (.015 + .2 * b.x) * (.7 + .4 * ruido(vec2(b.x * 14. - t * 14., b.y * 20.))), max(-b.x, b.x - .6 * fu)); c += (b.x > 0. ? mix(vec3(1.6, 1.1, .4), vec3(1.2, .3, .06), smoothstep(0., .5, b.x)) : vec3(0)) * smoothstep(.02, .0, fa) * fu;
  // bosque en silueta
  float x = u.x * 9., k = floor(x), hh = azar(vec2(k, 8.)); vec2 p = vec2(fract(x) - .5, u.y + 1.); float pn = abs(p.x) - .5 * (1. - p.y / (.2 + .22 * hh)); c = mix(c, vec3(.015, .01, .025), smoothstep(.05, .0, pn) * step(p.y, .45));
  return c + chispas2(u, t) * (.35 + acc);
}` },
{ id:'p-cristales', mundo:'Mundo fantástico', nombre:'Valle de dos lunas', fondo:'formas', codigo:
`vec3 paisaje(vec2 u, float t) {
  vec3 c = mix(vec3(.1, .22, .32), vec3(.06, .02, .16), smoothstep(-.4, .9, u.y)) + estrellas(u, t, 32., .9);
  vec2 a = u - vec2(aspecto * .5, .52), b = u - vec2(aspecto * .16, .7); c = mix(c, vec3(.75, .55, .85) * (.6 + .5 * fbm(a * 6.)) * (.35 + .75 * smoothstep(.2, -.25, a.x + a.y * .4)), smoothstep(.27, .262, length(a))); c = mix(c, vec3(.5, .85, .8) * (.7 + .4 * fbm(b * 9.)), smoothstep(.12, .114, length(b))); c += vec3(.4, .25, .5) * exp(-length(a) * 2.6) * .5;
  for (int i = 0; i < 3; i++) { float f = float(i); float h = -.12 - .16 * f + .34 * sierra(u.x * (1.5 + .6 * f) + f * 5., f + 21.); c = mix(c, mix(vec3(.2, .25, .4), vec3(.05, .06, .14), f / 2.), smoothstep(.012, .0, u.y - h)); }
  // río luminoso
  float ho = -.42; if (u.y < ho) { float z = .25 / (ho - u.y + .02); float cu = .9 * sin(z * .9 + .4) + .35; float rx = abs(u.x * z - cu * z * .35) - .55; vec3 su = mix(vec3(.06, .07, .13), vec3(.14, .16, .24), ruido(vec2(u.x * z, z) * 5.)); float fl = .5 + .5 * sin(z * 9. - t * 3. + 2. * ruido(vec2(u.x * z * 3., z * 2. - t))); c = mix(su, mix(vec3(.1, .6, .75), vec3(.6, 1.2, 1.2), fl), smoothstep(.1, -.1, rx)); }
  // cristales en capas
  for (int i = 0; i < 4; i++) {
    float f = float(i), e = 2.4 - .4 * f, ba = -.42 - .17 * f; float x = u.x * e + f * 4.3, k = floor(x), h = azar(vec2(k, f + 31.)); if (h < .3 && f < 3.) continue;
    for (int j = 0; j < 3; j++) { float g = float(j), hj = azar(vec2(k * 3. + g, f + 7.)); vec2 q = vec2(fract(x) - .5 - (g - 1.) * .13, (u.y - ba) * e * .62); q *= gira((g - 1.) * .32 + (hj - .5) * .2); float H = (.35 + .75 * hj) * (g == 1. ? 1.25 : .8), W = .05 + .05 * hj; float pr = max(abs(q.x) - W * smoothstep(-.15, .1, q.y + .05) , max(abs(q.x) * 1.7 + q.y - H, -q.y - .12));
      if (pr < 0.) { vec3 col = hj < .35 ? vec3(.3, .85, 1.) : hj < .7 ? vec3(.8, .4, 1.) : vec3(1., .5, .65); float pu = .5 + .5 * sin(q.y * 7. - t * 2. + k + f) ; c = col * ((q.x < -W * .25 ? .95 : q.x < W * .35 ? .6 : .3) + .35 * smoothstep(0., H, q.y)) * (.45 + .16 * f) * (.85 + .3 * pu + 1.1 * acc * pu); } }
    float su = ba - .02 * sin(u.x * 6. + f) - u.y; if (su > .0 && f > 2.5) c = mix(vec3(.03, .03, .07), vec3(.1, .1, .18), ruido(u * vec2(12., 26.)));
  }
  // luces que suben
  for (int i = 0; i < 2; i++) { float f = float(i); vec2 g = u * (6. + 4. * f) + vec2(sin(t * .25 + f), -t * (.2 + .15 * f)); vec2 k = floor(g), q = fract(g) - .5; float h = azar(k + f * 7.); if (h > .78) c += vec3(.6, 1., 1.2) * smoothstep(.1, .0, length(q + .25 * vec2(sin(t + h * 30.), cos(t + h * 20.)))) * (.6 + acc); }
  return c + fugaces(u, t) * (.5 + 2. * acc);
}` }
];
PAISAJES.forEach(p => p.paisaje = true);
// Funciones comunes de los paisajes
window.PAISAJE_LIB = `
float azar(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float ruido(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(azar(i),azar(i+vec2(1,0)),f.x),mix(azar(i+vec2(0,1)),azar(i+1.),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*ruido(p);p=p*2.03+vec2(7.1,3.7);a*=.5;}return s;}
float sierra(float x,float s){float h=0.,a=.5;for(int i=0;i<5;i++){h+=a*(1.-abs(2.*ruido(vec2(x,s+float(i)*3.1))-1.));x=x*2.07+1.3;a*=.48;}return h;}
vec3 estrellas(vec2 u,float t,float e,float d){vec2 g=u*e,k=floor(g),q=fract(g)-.5;float h=azar(k);if(h<1.-.12*d)return vec3(0);q-=(vec2(azar(k+3.),azar(k+9.))-.5)*.6;float b=.55+.45*sin(t*(1.+4.*azar(k+5.))+h*90.);return mix(vec3(.7,.85,1.2),vec3(1.2,1.,.75),azar(k+1.))*smoothstep(.34,.0,length(q))*b;}
vec3 fugaces(vec2 u,float t){vec3 c=vec3(0);for(int i=0;i<3;i++){float f=float(i),T=t*.22+f*.37,n=floor(T),k=fract(T);vec2 o=vec2((azar(vec2(n,f))*2.-1.)*aspecto,.3+.8*azar(vec2(f,n))),d=normalize(vec2(-1.,-.45));vec2 p=u-o-d*k*2.2;float x=dot(p,-d),y=abs(dot(p,vec2(d.y,-d.x)));c+=vec3(.9,1.,1.2)*smoothstep(.014,.0,y)*smoothstep(.4,.0,x)*step(0.,x)*smoothstep(0.,.05,k)*smoothstep(.45,.2,k);}return c;}
vec3 nieve(vec2 u,float t){float s=0.;for(int i=0;i<3;i++){float f=float(i);vec2 g=u*(9.+5.*f)+vec2(sin(t*.5+f)*.8,t*(1.1+.5*f)),k=floor(g),q=fract(g)-.5;if(azar(k+f)>.8)s+=smoothstep(.2,.02,length(q+.2*vec2(sin(t+k.y),0)));}return vec3(s);}
vec3 chispas2(vec2 u,float t){float s=0.;for(int i=0;i<2;i++){float f=float(i);vec2 g=u*(8.+4.*f)+vec2(sin(t*.7+f)*.5,-t*(.6+.4*f)),k=floor(g),q=fract(g)-.5;float h=azar(k+f*3.);if(h>.84)s+=smoothstep(.16,.0,length(q+.25*vec2(sin(t*2.+h*30.),0)))*(.6+.4*sin(t*6.+h*50.));}return vec3(1.4,.6,.2)*s;}
`;
