// Segunda parte del bestiario. Mismo contrato que criaturas.js.
CRIATURAS.push(
// ---------- Animales reales ----------
{ id:'lechuza', archivo:'lechuza.glsl', codigo:
`// Oye en estéreo, con un oído más alto que el otro.
vec4 criatura(vec3 p, float t) {
  p.y += .1;
  p.xz *= gira(.25 * sin(t * .4));
  // cuerpo y alas plegadas
  vec4 c = vec4(HUESO, elipse(p + vec3(0, .35, 0), vec3(.55, .85, .45)) * .8);
  vec3 q = vec3(abs(p.x) - .5, p.y + .45, p.z + .08);
  q.xy *= gira(-.12);
  float plumas = .02 * sin(q.y * 26.);
  c = une(c, vec4(AMBAR * .75, (elipse(q, vec3(.18, .85, .42)) + plumas) * .6));
  // rama y garras
  c = une(c, vec4(ROJO * .5, capsula(p, vec3(-1.5, -1.2, 0), vec3(1.5, -1.1, 0), .09)));

  // la cabeza se ladea para escuchar
  q = p - vec3(0, .62, .05);
  q.xy *= gira(.5 * sin(t * .9) * smoothstep(-.2, .8, sin(t * .3)));
  c = une(c, vec4(AMBAR * .8, esfera(q, .5)));
  // disco facial en forma de corazón
  vec3 f = vec3(abs(q.x) - .17, q.y - .02, q.z - .4);
  f.xy *= gira(.3);
  c = une(c, vec4(HUESO, elipse(f, vec3(.25, .36, .13))));
  // ojos y pico
  vec3 o = vec3(abs(q.x) - .18, q.y - .05, q.z - .51);
  c = une(c, vec4(vec3(.01), esfera(o, .095)));
  c = une(c, vec4(AMBAR * 1.2, elipse(q - vec3(0, -.15, .52), vec3(.05, .13, .09)) * .7));
  return c;
}` },
{ id:'morpho', archivo:'mariposa_morpho.glsl', codigo:
`// El azul no es pigmento: depende del ángulo.
vec4 criatura(vec3 p, float t) {
  p.y -= .1 * sin(t * 2.5);
  p.yz *= gira(-.35);
  p.xy *= gira(.2);
  vec4 c = vec4(vec3(.12, .1, .12), capsula(p, vec3(0, -.4, 0), vec3(0, .35, 0), .07));
  vec3 q = vec3(abs(p.x), p.yz);
  c = une(c, vec4(HUESO * .6, capsula(q, vec3(.03, .35, 0), vec3(.28, .85, .1), .018)));

  // aleteo
  float a = .15 + .6 * (.5 + .5 * sin(t * 2.5));
  q.xz *= gira(-a);
  vec3 s = q - vec3(.72, .4, 0);
  s.xy *= gira(-.5);
  vec3 i = q - vec3(.5, -.48, 0);
  i.xy *= gira(.5);
  float d = min(elipse(s, vec3(.75, .48, .035)), elipse(i, vec3(.48, .52, .035)));

  // borde negro y azul que cambia con el ala
  float centro = min(length(s.xy / vec2(.75, .48)), length(i.xy / vec2(.48, .52)));
  vec3 azul = mix(vec3(.1, .3, 1.25), CIAN * 1.3, .5 + .5 * sin(a * 6. + q.x * 3.));
  float vena = smoothstep(.03, .0, abs(sin(atan(q.y, q.x) * 7.)) - .02);
  vec3 ala = mix(azul, vec3(.06, .07, .12), smoothstep(.72, .84, centro));
  return une(c, vec4(mix(ala, vec3(.05, .1, .3), vena * .5), d * .5));
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
  d = funde(d, capsula(q, vec3(.2, -.9, 0), vec3(0, .8, .1), .15), .2);
  // capucha
  float abre = .42 + .08 * sin(t * 1.2);
  d = funde(d, elipse(q - vec3(0, .25, 0), vec3(abre, .5, .09)), .1);
  // cabeza
  d = funde(d, elipse(q - vec3(0, 1., .2), vec3(.25, .19, .4)), .1);
  float bandas = smoothstep(.2, .5, sin(q.y * 16.)) * step(q.z, .4);
  vec4 c = vec4(mix(vec3(.45, .55, .2), AMBAR, bandas), d * .6);
  // ojos y lengua
  vec3 o = vec3(abs(q.x) - .19, q.y - 1.08, q.z - .38);
  c = une(c, vec4(AMBAR * 1.8, esfera(o, .07)));
  float saca = .15 + .15 * max(0., sin(t * 5.));
  c = une(c, vec4(ROJO * 1.5, capsula(q, vec3(0, .92, .55), vec3(0, .78, .6 + saca), .03)));
  return c;
}` },
// ---------- Fauna fantástica ----------
{ id:'ciervo', archivo:'ciervo_de_luna.glsl', codigo:
`// Lleva la luna entre las astas.
vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.65 + .3 * sin(t * .35));
  p.y += .25;
  // cuerpo, cuello y cabeza
  float d = elipse(p - vec3(-.1, -.2, 0), vec3(.68, .32, .28));
  d = funde(d, capsula(p, vec3(.4, -.05, 0), vec3(.68, .5, 0), .15), .2);
  d = funde(d, elipse(p - vec3(.82, .56, 0), vec3(.27, .13, .13)), .1);
  // patas al paso
  vec3 q = p;
  float lado = sign(p.z);
  q.z = abs(q.z) - .17;
  float m = .13 * sin(t * 1.6) * lado;
  d = funde(d, capsula(q, vec3(.35, -.35, 0), vec3(.4 + m, -1.15, 0), .06), .1);
  d = funde(d, capsula(q, vec3(-.55, -.35, 0), vec3(-.55 - m, -1.15, 0), .065), .1);
  vec4 c = vec4(mix(AZUL * 1.2, HUESO, smoothstep(-.6, .6, p.y)), d * .7);

  // astas
  q = vec3(p.x - .65, p.y - .66, abs(p.z) - .06);
  float a = capsula(q, vec3(0), vec3(-.12, .4, .3), .03);
  a = min(a, capsula(q, vec3(-.12, .4, .3), vec3(.08, .85, .36), .025));
  a = min(a, capsula(q, vec3(-.07, .25, .18), vec3(.2, .45, .28), .022));
  a = min(a, capsula(q, vec3(-.12, .4, .3), vec3(-.4, .65, .4), .022));
  c = une(c, vec4(AMBAR * 1.2, a * .8));
  // luna y ojo
  c = une(c, vec4(HUESO * (1.5 + .15 * sin(t * 2.)), esfera(p - vec3(.6, 1.35, 0), .21)));
  q = vec3(p.x - .85, p.y - .62, abs(p.z) - .11);
  c = une(c, vec4(CIAN * 1.8, esfera(q, .035)));
  return c;
}` },
{ id:'ballena', archivo:'ballena_de_nubes.glsl', codigo:
`// Nada por el cielo y deja lluvia.
vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.45 + .2 * sin(t * .3));
  p.y -= .25 + .08 * sin(t * .8);
  vec3 q = p;
  q.y -= .15 * sin(t * .8 - q.x * 1.4) * smoothstep(0., 1.5, q.x);
  // cuerpo, con surcos en el vientre
  float surco = .025 * sin(q.z * 45.) * smoothstep(0., -.2, q.y) * smoothstep(.5, -.3, q.x);
  float d = elipse(q + vec3(.25, 0, 0), vec3(1., .46, .42)) + surco;
  d = funde(d, capsula(q, vec3(.2, .02, 0), vec3(1.2, .12, 0), .12), .4);
  // cola y aletas
  vec3 f = vec3(q.x - 1.35, q.y - .14, abs(q.z) - .25);
  f.xz *= gira(-.6);
  d = funde(d, elipse(f, vec3(.17, .05, .36)), .1);
  f = vec3(q.x + .35, q.y + .3, abs(q.z) - .55);
  f.yz *= gira(.4 + .25 * sin(t * .8));
  d = funde(d, elipse(f, vec3(.18, .05, .42)), .1);
  vec4 c = vec4(mix(HUESO, AZUL * 1.2, smoothstep(-.3, .15, q.y)), d * .6);
  f = vec3(q.x + .85, q.y + .02, abs(q.z) - .33);
  c = une(c, vec4(AMBAR * 1.8, esfera(f, .05)));

  // lluvia: gotas que caen en bucle
  q = p + vec3(0, .55, 0);
  vec2 id = clamp(round(q.xz / .34), vec2(-3, -1), vec2(3, 1));
  q.xz -= id * .34;
  float cae = fract(t * .6 + fract(sin(dot(id, vec2(12.9, 78.2))) * 43.7));
  q.y += cae * 1.1;
  return une(c, vec4(CIAN * (1.7 - cae), capsula(q, vec3(0), vec3(0, .14, 0), .022) * .6));
}` },
{ id:'zorro', archivo:'zorro_de_brasa.glsl', codigo:
`// La cola es una hoguera.
vec4 criatura(vec3 p, float t) {
  p.xz *= gira(-.35 + .25 * sin(t * .4));
  p.y += .25;
  // sentado: cuerpo, pecho y patas
  float d = elipse(p + vec3(0, .45, .1), vec3(.45, .6, .48));
  vec3 q = vec3(abs(p.x), p.yz);
  d = funde(d, capsula(q, vec3(.17, -.3, .25), vec3(.17, -1., .42), .1), .12);
  // cabeza, hocico y orejas
  vec3 k = p - vec3(0, .35, .15);
  k.xy *= gira(.12 * sin(t * .9));
  d = funde(d, elipse(k, vec3(.4, .32, .33)), .1);
  d = funde(d, elipse(k - vec3(0, -.08, .32), vec3(.14, .12, .3)), .12);
  vec3 o = vec3(abs(k.x) - .26, k.y - .38, k.z);
  o.xy *= gira(.25);
  d = funde(d, elipse(o, vec3(.11, .3, .07)), .05);
  float blanco = smoothstep(.1, .3, p.z) * smoothstep(.25, .05, abs(p.x)) * smoothstep(.25, .1, p.y);
  vec4 c = vec4(mix(vec3(.9, .35, .12), HUESO, blanco), d * .7);
  c = une(c, vec4(vec3(.02), esfera(k - vec3(0, -.05, .61), .055)));
  o = vec3(abs(k.x) - .17, k.y - .05, k.z - .29);
  c = une(c, vec4(AMBAR * 1.9, elipse(o, vec3(.06, .045, .05))));

  // cola de fuego
  for (int i = 0; i < 9; i++) {
    float f = float(i) / 8.;
    vec3 b = vec3(.45 + .55 * sin(f * 2.4), -.85 + f * 1.9, -.35);
    b.x += .13 * f * sin(t * 4. - f * 5.);
    float r = .12 + .17 * sin(f * 3.1);
    vec3 fuego = mix(vec3(1.5, .4, .1), vec3(1.6, 1.2, .4), f);
    c = une(c, vec4(fuego, (esfera(p - b, r) + .03 * sin(p.y * 14. - t * 7.)) * .6));
  }
  return c;
}` },
// ---------- Monstruos ----------
{ id:'dragon', archivo:'dragon.glsl', codigo:
`// Alas abiertas y una brasa en la garganta.
vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.3 * sin(t * .4) - .15);
  p.y -= .08 * sin(t * 2.);
  // cuerpo, cuello y cola
  float d = elipse(p + vec3(0, .35, 0), vec3(.34, .55, .36));
  for (int i = 0; i < 8; i++) {
    float f = float(i) / 7.;
    vec3 n = vec3(.16 * sin(f * 4. + t * .6), .05 + .8 * f, .1 + .4 * f * f);
    d = funde(d, esfera(p - n, .2 - .06 * f), .1);
    vec3 k = vec3(1.2 * f, -.8 - .35 * sin(f * 3.), .1 + .25 * sin(f * 4. + t));
    d = funde(d, esfera(p - k, .2 - .15 * f), .12);
  }
  d += .012 * sin(p.x * 28.) * sin(p.y * 28.);
  // cabeza, mandíbula y cuernos
  vec3 k = p - vec3(.16 * sin(4. + t * .6), .9, .55);
  d = funde(d, elipse(k, vec3(.21, .17, .22)), .08);
  d = funde(d, elipse(k - vec3(0, -.06, .26), vec3(.13, .1, .24)), .08);
  float abre = .5 + .5 * sin(t * 1.3);
  d = funde(d, elipse(k - vec3(0, -.2 - .08 * abre, .2), vec3(.1, .05, .22)), .03);
  vec3 u = vec3(abs(k.x), k.yz);
  d = funde(d, capsula(u, vec3(.12, .1, -.05), vec3(.26, .5, -.2), .04), .04);
  vec4 c = vec4(mix(ROJO * 1.2, AMBAR, smoothstep(.1, .3, p.z) * smoothstep(.1, -.5, p.y)), d * .6);
  c = une(c, vec4(AMBAR * 2., esfera(u - vec3(.13, .05, .17), .05)));
  // patas
  vec3 q = vec3(abs(p.x), p.yz);
  c = une(c, vec4(ROJO, capsula(q, vec3(.25, -.6, .15), vec3(.4, -1.1, .4), .11)));

  // alas: un abanico con el borde mordido
  q = vec3(abs(p.x) - .18, p.y + .05, p.z + .15);
  q.xz *= gira(.3 + .35 * sin(t * 2.));
  float a = atan(q.y, q.x), r = length(q.xy);
  float borde = 1.5 - .28 * abs(sin(a * 4.5));
  float ala = max(abs(q.z) - .025, r - borde);
  ala = max(ala, max((a - .95) * r, (-.45 - a) * r));
  float hueso = smoothstep(.1, .0, abs(sin(a * 4.5)));
  c = une(c, vec4(mix(vec3(.45, .1, .16), AMBAR, hueso * .8), ala * .45));

  // aliento
  float fuego = smoothstep(.3, 1., abre);
  q = k - vec3(0, -.22, .55);
  return une(c, vec4(vec3(1.8, .9, .25),
    (elipse(q, vec3(.02 + .12 * fuego)) + .03 * fuego * sin(q.y * 20. + t * 14.)) * .5));
}` },
{ id:'limo', archivo:'limo.glsl', codigo:
`// Se tragó algo y todavía brilla.
vec4 criatura(vec3 p, float t) {
  float bota = sin(t * 2.2);
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
  float nucleo = smoothstep(.5, .0, length(p.xy - vec2(.3 * sin(t), -.3)));
  vec3 piel = mix(vec3(.18, .62, .22), vec3(.7, 1.5, .3), nucleo);
  vec4 c = vec4(piel, d * .6);
  // burbujas que suben
  for (int i = 0; i < 5; i++) {
    float f = float(i), s = fract(t * .25 + f * .37);
    vec3 b = vec3(.6 * sin(f * 2.4), -.5 + 1.6 * s, .45 * cos(f * 2.4));
    d = esfera(p - b, .13 * sin(s * 3.14) + .01);
    c = une(c, vec4(vec3(.6, 1.35, .4), d * .7));
  }
  // ojos desparejos
  c = une(c, vec4(HUESO * 1.3, esfera(p - vec3(-.33, .3, .8), .2)));
  c = une(c, vec4(HUESO * 1.3, esfera(p - vec3(.36, .42, .76), .14)));
  vec2 m = .05 * vec2(sin(t * .9), cos(t * .7));
  c = une(c, vec4(vec3(.01), esfera(p - vec3(-.33 + m.x, .3 + m.y, .95), .1)));
  c = une(c, vec4(vec3(.01), esfera(p - vec3(.36 + m.x, .42 + m.y, .87), .07)));
  return c;
}` },
{ id:'mimico', archivo:'mimico.glsl', codigo:
`// No abras ese cofre.
vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.45 + .15 * sin(t * .6));
  p.yz *= gira(.12);
  p.y += .25;
  float abre = .35 + .3 * (.5 + .5 * sin(t * 1.4));
  // base hueca
  float d = caja(p + vec3(0, .45, 0), vec3(.95, .42, .6));
  d = max(d, -caja(p + vec3(0, .2, 0), vec3(.85, .35, .5)));
  float tabla = smoothstep(.06, .0, abs(fract(p.y * 4.) - .5) - .04);
  vec4 c = vec4(mix(vec3(.5, .26, .1), vec3(.2, .09, .03), tabla), d * .8);
  // tapa con bisagra atrás
  vec3 q = p - vec3(0, 0, -.6);
  q.yz *= gira(abre);
  q.z -= .6;
  float tapa = max(length(q.yz / vec2(.75, 1.)) - .6, -q.y);
  tapa = max(tapa, abs(q.x) - .95);
  tapa = max(tapa, -(length((q.yz + vec2(.02, 0)) / vec2(.65, 1.)) - .5));
  c = une(c, vec4(vec3(.55, .29, .11), tapa * .6));
  // herrajes
  float h = max(abs(abs(p.x) - .7) - .07, caja(p + vec3(0, .45, 0), vec3(.98, .45, .63)));
  h = max(h, -caja(p + vec3(0, .2, 0), vec3(.85, .4, .5)));
  c = une(c, vec4(AMBAR, h * .8));
  // dientes arriba y abajo
  vec3 a = vec3(p.x - .19 * clamp(round(p.x / .19), -4., 4.), p.y - .03, p.z - .56);
  c = une(c, vec4(HUESO, elipse(a, vec3(.07, .19, .05)) * .7));
  a = vec3(q.x - .19 * clamp(round(q.x / .19), -4., 4.), q.y + .02, q.z - .54);
  c = une(c, vec4(HUESO, elipse(a, vec3(.07, .18, .05)) * .7));
  // lengua y ojo
  a = p; a.x -= .18 * sin(a.z * 4. + t * 3.);
  c = une(c, vec4(ROJO * 1.3, capsula(a, vec3(0, -.05, 0), vec3(0, -.35, 1.1), .14) * .6));
  c = une(c, vec4(AMBAR * 1.8, esfera(p - vec3(0, .25, -.2), .19)));
  c = une(c, vec4(vec3(.01), elipse(p - vec3(.04 * sin(t), .25, -.03), vec3(.04, .13, .05))));
  return c;
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
  d = max(d, -elipse(p - vec3(0, .6, .36), vec3(.26, .35, .34)));
  float hueco = smoothstep(.03, .0, elipse(p - vec3(0, .6, .36), vec3(.26, .35, .34)));
  vec3 tela = mix(AZUL * .9, vec3(.35, .3, .5), cae);
  vec4 c = vec4(tela * (1. - hueco), d * .6);
  // ojos
  vec3 o = vec3(abs(p.x) - .12, p.y - .62, p.z - .18);
  c = une(c, vec4(CIAN * (1.7 + .25 * sin(t * 3.)), elipse(o, vec3(.07, .04, .05))));
  // manos que se adelantan
  float lado = sign(p.x);
  q = vec3(abs(p.x) - .55, p.y - .05 - .1 * sin(t * 1.2 + lado), p.z - .55);
  float m = capsula(q, vec3(-.1, .05, -.4), vec3(0), .09);
  for (int i = 0; i < 4; i++) {
    float f = float(i) - 1.5;
    m = min(m, capsula(q, vec3(f * .05, 0, 0), vec3(f * .13, -.3 + .05 * sin(t * 3. + f), .16), .025));
  }
  return une(c, vec4(HUESO, m * .8));
}` },
// ---------- Mitología ----------
{ id:'hidra', archivo:'hidra.glsl', codigo:
`// Nueve cabezas, como en el verso de Alceo.
vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.25 * sin(t * .3) + .2);
  p.yz *= gira(-.3);
  p.y += .3;
  float d = elipse(p + vec3(0, .85, 0), vec3(.75, .42, .6));
  vec4 c = vec4(vec3(.2, .5, .35), d * .8);

  for (int i = 0; i < 9; i++) {
    float f = float(i), a = f * .698;
    // la cabeza central es la inmortal
    float centro = step(8., f);
    vec2 sale = vec2(cos(a * 1.125), sin(a * 1.125)) * (1. - centro);
    float alto = .35 + .4 * sin(f * 3.1) + .75 * centro;
    vec3 q = p + vec3(0, .7, 0);
    float h = clamp(q.y / (alto + .7), 0., 1.);
    q.xz -= sale * (.2 + .95 * h * h + .12 * sin(h * 6. - t * 1.5 + f));
    q.x -= .12 * h * sin(t + f * 2.);
    float cuello = capsula(q, vec3(0), vec3(0, alto + .6, 0), .13 - .04 * h);
    q.y -= alto + .68;
    vec2 ve = normalize(sale + vec2(0, .8));
    q.xz = vec2(q.x * ve.y - q.z * ve.x, q.x * ve.x + q.z * ve.y);
    float cab = elipse(q - vec3(0, 0, .12), vec3(.19, .16, .33));
    vec3 piel = mix(vec3(.22, .55, .38), AMBAR * 1.25, centro);
    c = une(c, vec4(piel, funde(cuello, cab, .08) * .5));
    vec3 o = vec3(abs(q.x) - .14, q.y - .1, q.z - .22);
    c = une(c, vec4(vec3(1.8, .5, .2), esfera(o, .055) * .7));
  }
  return c;
}` },
{ id:'uroboros', archivo:'uroboros.glsl', codigo:
`// Se come la cola para siempre.
vec4 criatura(vec3 p, float t) {
  p.yz *= gira(.35 * sin(t * .4));
  p.xz *= gira(.5 * sin(t * .3));
  p.xy *= gira(t * .25);
  float a = atan(p.y, p.x);            // -pi a pi
  float f = (a + 3.1416) / 6.2832;     // 0 en la cola, 1 en la cabeza
  float r = .06 + .19 * smoothstep(0., .45, f) * (1. - .25 * smoothstep(.8, 1., f));
  vec2 s = vec2(length(p.xy) - 1.05, p.z);
  // escamas en espiral
  float v = atan(s.y, s.x);
  float escama = .02 * sin(a * 40. + v * 3.) * sin(a * 40. - v * 3.);
  float d = length(s) - r + escama;
  vec3 piel = mix(vec3(.15, .5, .35), AMBAR * 1.1, smoothstep(-.6, 1., cos(v * 2.) * sin(a * 20.)));
  vec4 c = vec4(piel, d * .5);
  // cabeza mordiendo la cola
  vec3 q = p - vec3(-1.05, .02, 0);
  float cab = elipse(q, vec3(.27, .36, .25));
  cab = max(cab, -elipse(q + vec3(0, .33, 0), vec3(.16, .26, .4)));
  c = une(c, vec4(vec3(.25, .6, .38), cab * .7));
  vec3 o = vec3(abs(q.x) - .17, q.y - .06, abs(q.z) - .17);
  c = une(c, vec4(AMBAR * 2., esfera(o, .06)));
  vec3 n = vec3(abs(q.x) - .16, q.y + .24, abs(q.z) - .06);
  return une(c, vec4(HUESO, elipse(n, vec3(.03, .12, .03)) * .7));
}` },
{ id:'fenix', archivo:'fenix.glsl', codigo:
`// Roja y dorada, del tamaño de un águila.
vec4 criatura(vec3 p, float t) {
  p.y -= .15 + .1 * sin(t * 2. + 1.5);
  p.xz *= gira(.3 * sin(t * .4));
  // cuerpo, cuello y cabeza
  float d = elipse(p, vec3(.26, .46, .28));
  d = funde(d, capsula(p, vec3(0, .35, .05), vec3(0, .75, .12), .1), .15);
  d = funde(d, esfera(p - vec3(0, .82, .14), .16), .08);
  vec4 c = vec4(mix(ROJO * 1.4, AMBAR * 1.3, smoothstep(-.3, .8, p.y)), d * .7);
  c = une(c, vec4(HUESO, elipse(p - vec3(0, .78, .32), vec3(.05, .05, .13)) * .7));
  vec3 q = vec3(abs(p.x), p.yz);
  c = une(c, vec4(vec3(.01), esfera(q - vec3(.09, .86, .25), .04)));
  // cresta
  c = une(c, vec4(AMBAR * 1.8, capsula(q, vec3(.02, .95, .1), vec3(.14, 1.25, -.05), .03)));

  // alas: plumas en abanico
  float bate = .35 * sin(t * 2.);
  vec3 w = q - vec3(.18, .2, 0);
  w.xy *= gira(bate + .1);
  for (int i = 0; i < 7; i++) {
    float f = float(i) / 6.;
    vec3 s = w - vec3(.1 + f * .25, 0, -.03 * f);
    s.xy *= gira(1.15 - f * 1.75);
    float largo = .5 + .3 * sin(f * 2.6);
    vec3 tono = mix(ROJO * 1.5, vec3(1.6, 1., .35), smoothstep(0., largo * 1.8, s.x));
    c = une(c, vec4(tono, elipse(s - vec3(largo, 0, 0), vec3(largo, .11, .05)) * .55));
  }
  // cola: tres llamas que ondean
  q = p + vec3(0, .35, .1);
  q.x += .13 * sin(q.y * 4. + t * 3.) * smoothstep(0., -.8, q.y);
  float n = clamp(round(q.x / .2), -1., 1.);
  q.x -= n * .2 + n * -.18 * q.y;
  float largo = 1.15 - .2 * abs(n);
  c = une(c, vec4(mix(vec3(1.7, 1.1, .4), ROJO * 1.6, smoothstep(0., -1.2, q.y)),
                  elipse(q + vec3(0, largo * .5, 0), vec3(.1, largo * .55, .06)) * .5));
  return c;
}` },
{ id:'kraken', archivo:'kraken.glsl', codigo:
`// Más isla que pez.
vec4 criatura(vec3 p, float t) {
  p.y += .25;
  p.xz *= gira(.2 * sin(t * .3));
  // manto
  vec3 k = p - vec3(0, .1, 0);
  k.x += .08 * sin(t * .8) * k.y;
  float d = elipse(k - vec3(0, .35, 0), vec3(.48, .85, .45));
  d += .02 * sin(k.x * 14.) * sin(k.y * 12.);
  vec4 c = vec4(mix(ROJO * .9, vec3(.5, .2, .4), smoothstep(0., 1., k.y)), d * .6);
  // ojos
  vec3 o = vec3(abs(k.x) - .32, k.y + .12, k.z - .3);
  c = une(c, vec4(AMBAR * 1.8, esfera(o, .13)));
  c = une(c, vec4(vec3(.01), elipse(o - vec3(.02, 0, .1), vec3(.1, .03, .06))));

  // ocho brazos que salen del agua y se curvan
  float n = gajo(p, 8.);
  vec3 q = ronda(p, 8.);
  float alto = 1.1 + .4 * sin(n * 2.3);
  float h = clamp((q.y + .9) / (alto + .9), 0., 1.);
  q.x -= .75 + .45 * sin(h * 3. + .5 * sin(t + n * 1.7)) - .35 * h;
  q.z -= .16 * h * sin(h * 5. - t * 1.6 + n);
  float brazo = capsula(q, vec3(0, -1., 0), vec3(0, alto - .4, 0), .19 - .13 * h);
  // ventosas
  vec3 v = q; v.x += .14 - .1 * h; v.y -= .15 * round(v.y / .15);
  float vent = esfera(v, .07 - .04 * h) + step(alto - .4, q.y);
  c = une(c, vec4(ROJO * 1.1, brazo * .45));
  c = une(c, vec4(HUESO * .9, vent * .45));

  // mar
  float mar = p.y + .85 + .05 * sin(p.x * 4. + t * 1.5) * sin(p.z * 4. + t);
  mar = max(mar, length(p * vec3(1, 1.2, 1)) - 1.65);
  return une(c, vec4(AZUL * .7, mar * .6));
}` },
{ id:'quetzal', archivo:'quetzalcoatl.glsl', codigo:
`// Plumas de quetzal, cuerpo de serpiente.
vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.3 * sin(t * .35));
  vec3 q = p;
  // el cuerpo ondula en el aire
  float h = smoothstep(-1.3, 1., p.y);
  vec2 onda = vec2(.6 * sin(p.y * 2.6 + t), .35 * cos(p.y * 2.6 + t)) * (1.15 - .75 * h);
  q.xz -= onda;
  float r = .06 + .18 * h;
  vec3 b = q;
  float d = capsula(b, vec3(0, -1.35, 0), vec3(0, .7, 0), .05) - r + .05;
  float ang = atan(q.z, q.x);
  float anillo = smoothstep(.1, .4, sin(p.y * 18. + cos(ang * 3.)));
  vec4 c = vec4(mix(vec3(.1, .65, .45), AMBAR, anillo * .7), d * .45);
  // plumas a lo largo del lomo
  float paso = .16;
  vec3 f = q; float n = clamp(round(f.y / paso), -7., 4.);
  f.y -= n * paso;
  f.x = abs(f.x) - r - .12;
  f.xy *= gira(.6 + .2 * sin(t * 3. + n));
  c = une(c, vec4(mix(CIAN * 1.25, vec3(.1, .9, .35), .5 + .5 * sin(n * 2.)),
                  elipse(f, vec3(.22, .06, .08)) * .4));
  // cabeza
  float cx = .6 * sin(.85 * 2.6 + t) * .4, cz = .35 * cos(.85 * 2.6 + t) * .4;
  vec3 k = p - vec3(cx, .85, cz);
  float cab = funde(elipse(k, vec3(.36, .3, .34)), elipse(k - vec3(0, -.08, .4), vec3(.25, .18, .34)), .12);
  c = une(c, vec4(vec3(.15, .7, .5), cab * .7));
  vec3 o = vec3(abs(k.x) - .25, k.y - .13, k.z - .24);
  c = une(c, vec4(AMBAR * 1.9, esfera(o, .1)));
  o = vec3(abs(k.x) - .1, k.y + .27, k.z - .62);
  c = une(c, vec4(HUESO, elipse(o, vec3(.03, .11, .03)) * .7));
  // corona de plumas
  for (int i = 0; i < 7; i++) {
    float g = (float(i) - 3.) * .42;
    vec3 s = k + vec3(0, 0, .2);
    s.xy *= gira(g + .06 * sin(t * 2. + g));
    vec3 tono = mix(ROJO * 1.5, CIAN * 1.4, smoothstep(.2, .7, s.y));
    c = une(c, vec4(tono, elipse(s - vec3(0, .48, 0), vec3(.09, .36, .05)) * .6));
  }
  return c;
}` },
{ id:'aspido', archivo:'aspidoquelonio.glsl', codigo:
`// No eches el ancla aquí.
vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.5 + .25 * sin(t * .25));
  p.yz *= gira(-.3);
  p.x += .2;
  p.y -= .06 * sin(t * .9) - .05;
  // caparazón con placas, cubierto de tierra
  vec3 q = p;
  float placa = .03 * sin(q.x * 9.) * sin(q.z * 9.);
  float d = max(elipse(q, vec3(1.1, .62, .85)) + placa, -q.y - .08);
  vec3 tierra = mix(vec3(.4, .3, .15), vec3(.22, .6, .25), smoothstep(.25, .45, q.y));
  vec4 c = vec4(tierra, d * .6);
  // vientre, cabeza y aletas
  float b = elipse(p + vec3(0, .12, 0), vec3(1., .2, .75));
  vec3 k = p - vec3(1.25, .02 + .06 * sin(t), 0);
  b = funde(b, elipse(k, vec3(.42, .28, .27)), .25);
  float lado = sign(p.z);
  vec3 f = vec3(abs(p.x - .05) - .6, p.y + .18, abs(p.z) - .85);
  f.yz *= gira(.3 * sin(t * 1.2 + lado * .4));
  b = funde(b, elipse(f, vec3(.2, .06, .45)), .12);
  c = une(c, vec4(vec3(.25, .5, .5), b * .7));
  k.z = abs(k.z) - .24;
  c = une(c, vec4(AMBAR * 1.9, esfera(k - vec3(.12, .06, 0), .05)));
  // palmeras
  for (int i = 0; i < 4; i++) {
    float g = float(i);
    vec3 s = p - vec3(-.6 + g * .38, .5 - .06 * abs(g - 1.5), .25 * sin(g * 2.5));
    float alto = .42 + .12 * sin(g * 4.);
    s.x -= .06 * sin(t + g) * s.y;
    c = une(c, vec4(vec3(.5, .32, .15), capsula(s, vec3(0, -.1, 0), vec3(0, alto, 0), .035)));
    s.y -= alto;
    vec3 h = ronda(s, 5.); h.xy *= gira(-.45);
    c = une(c, vec4(vec3(.25, .85, .3), elipse(h - vec3(.18, 0, 0), vec3(.2, .045, .07)) * .7));
  }
  // fogata de los marineros
  c = une(c, vec4(vec3(1.7, .7, .2), elipse(p - vec3(.1, .66, .3), vec3(.05, .1 + .03 * sin(t * 9.), .05)) * .7));
  return c;
}` },
{ id:'golem', archivo:'golem.glsl', codigo:
`// Borra la primera letra y vuelve a ser barro.
vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.4 * sin(t * .4));
  p.y += .1;
  float paso = sin(t * 1.3);
  float grumo = .025 * sin(p.x * 13.) * sin(p.y * 11.) * sin(p.z * 12.);
  // torso y cabeza
  float d = caja(p - vec3(0, .1, 0), vec3(.48, .42, .26)) - .1;
  d = funde(d, caja(p + vec3(0, .5, 0), vec3(.3, .2, .2)) - .06, .15);
  vec3 k = p - vec3(0, .85, .05);
  k.xz *= gira(.2 * sin(t * .7));
  d = funde(d, caja(k, vec3(.2, .22, .2)) - .06, .06);
  // brazos y piernas, alternando
  float lado = sign(p.x);
  vec3 q = vec3(abs(p.x), p.yz);
  float m = .25 * paso * lado;
  d = funde(d, capsula(q, vec3(.68, .38, 0), vec3(.88, -.15, m * .5), .18), .12);
  d = funde(d, capsula(q, vec3(.88, -.15, m * .5), vec3(.86, -.62, m + .1), .2), .06);
  d = funde(d, capsula(q, vec3(.27, -.65, 0), vec3(.32, -1.25, -m), .2), .1);
  float grieta = smoothstep(.06, .0, abs(sin(p.x * 4. + sin(p.y * 7.)) * .5 + .1 * sin(p.z * 9.)));
  vec3 barro = mix(vec3(.42, .28, .18), vec3(1.35, .6, .2), grieta * (.5 + .5 * sin(t * 2.)));
  vec4 c = vec4(barro, (d + grumo) * .6);
  // ojos
  vec3 o = vec3(abs(k.x) - .11, k.y + .02, k.z - .26);
  c = une(c, vec4(AMBAR * 1.6, caja(o, vec3(.065, .035, .03))));
  // tres letras en la frente; la primera se apaga a ratos
  o = k - vec3(0, .17, .27);
  float n = clamp(round(o.x / .12), -1., 1.);
  o.x -= n * .12;
  float viva = n > .5 ? step(-.6, sin(t * .7)) : 1.;
  c = une(c, vec4(mix(vec3(.3, .2, .1), CIAN * 1.3, viva), caja(o, vec3(.035, .05, .02))));
  return c;
}` }
);
