// Cada `codigo` es GLSL: el dibujo de una criatura.
// Contrato: vec4 criatura(vec3 p, float t) -> (color, distancia). Un color por encima de 1 emite luz.
window.CRIATURAS = [
{ id:'nautilo', archivo:'nautilo.glsl', metros:400, codigo:
`// Una espiral logarítmica con ojos.
vec4 criatura(vec3 p, float t) {
  p.y -= .08 * sin(t);
  p.xz *= gira(.3 * sin(t * .5) - .15);
  p.xy *= gira(-.75);

  // concha: cada vuelta crece el triple
  float a = atan(p.y, p.x), r = length(p.xy), d = 9.;
  for (int k = 0; k < 4; k++) {
    float c = .44 * exp(.175 * (a - 6.2832 * float(k)));
    d = min(d, length(vec2(r - c, p.z)) - .5 * c);
  }
  float raya = smoothstep(.1, .5, sin(a * 9. + r * 4.))
             * smoothstep(.2, .6, r);
  vec4 c = vec4(mix(HUESO * .7, ROJO, raya), d * .6);

  // capucha, ojos y tentáculos
  vec3 q = p - vec3(-.76, 0, 0);
  c = une(c, vec4(ROJO, elipse(q, vec3(.36, .22, .34))));
  vec3 o = vec3(q.x + .05, q.y + .12, abs(q.z) - .32);
  c = une(c, vec4(AMBAR * 1.7, esfera(o, .09)));
  q.xz += .12 * sin(q.y * 6. + t * 2.) * smoothstep(.1, -.7, q.y);
  q = ronda(q, 9.) - vec3(.2, 0, 0);
  c = une(c, vec4(CIAN, capsula(q, vec3(0), vec3(.1, -.7, 0), .04)));
  return c;
}` },
{ id:'sifonoforo', archivo:'sifonoforo.glsl', metros:700, codigo:
`// Una colonia. Cada campana es un individuo.
vec4 criatura(vec3 p, float t) {
  p.x += .5 * sin(p.y * 1.5 + t * .5);
  p.z += .5 * cos(p.y * 1.5 + t * .5);
  vec3 eje = p;
  vec4 c = vec4(AMBAR, capsula(p, vec3(0, -1.5, 0), vec3(0, 1.4, 0), .035));

  // campanas: giran el ángulo áureo en cada paso
  float paso = .17;
  float n = clamp(round(p.y / paso), -7., 8.);
  p.y -= n * paso;
  p.xz *= gira(n * 2.4);
  float pulso = pow(.5 + .5 * sin(n * .7 - t * 3.), 3.);
  vec3 q = abs(p) - vec3(.21, 0, 0);
  c = une(c, vec4(CIAN * (.6 + 1.3 * pulso),
                  elipse(q, vec3(.17, .075, .12)) * .7));

  // hilos de pesca
  q = eje + vec3(0, 1.3, 0);
  q.xz += .1 * sin(q.y * 9. + t * 2.);
  q = ronda(q, 5.) - vec3(.13, 0, 0);
  c = une(c, vec4(AMBAR * 1.2,
                  capsula(q, vec3(0), vec3(.05, -.7, 0), .018)));
  return c;
}` },
{ id:'medusa', archivo:'medusa_corona.glsl', metros:2000, codigo:
`// Si la atacan, enciende un anillo de alarma.
vec4 criatura(vec3 p, float t) {
  p.y -= .35 + .08 * sin(t * 1.6 - 1.);
  p.yz *= gira(-.35);
  p.xy *= gira(.15 * sin(t * .4));
  p.xz /= 1. + .1 * sin(t * 1.6);
  float ang = atan(p.z, p.x);

  // campana hueca con surcos
  float d = elipse(p, vec3(.95, .6, .95));
  d += .03 * cos(ang * 20.) * smoothstep(.35, 0., p.y);
  d = max(d, -elipse(p + vec3(0, .16, 0), vec3(.84, .52, .84)));
  d = max(d, -p.y - .08);
  vec4 c = vec4(mix(ROJO, AZUL, smoothstep(.1, .6, p.y)), d * .7);
  c = une(c, vec4(ROJO * 1.3, esfera(p - vec3(0, .02, 0), .24)));

  // anillo de alarma
  float n = gajo(p, 20.);
  float luz = pow(.5 + .5 * cos(n * .628 - t * 4.), 4.);
  vec3 q = ronda(p, 20.) - vec3(.9, -.04, 0);
  c = une(c, vec4(CIAN * (.5 + 1.6 * luz), esfera(q, .075)));

  // tentáculos
  q = p;
  q.xz *= 1. + .12 * sin(q.y * 4. + t * 1.6);
  q.x += .08 * sin(q.y * 5. + t * 2.);
  q = ronda(q, 12.) - vec3(.7, 0, 0);
  c = une(c, vec4(AZUL * 1.2,
                  capsula(q, vec3(0), vec3(-.15, -1.6, 0), .026) * .7));
  return c;
}` },
{ id:'dumbo', archivo:'pulpo_dumbo.glsl', metros:4000, codigo:
`// Vuela con las orejas.
vec4 criatura(vec3 p, float t) {
  p.y -= .2 + .1 * sin(t * 2.);
  p.xz *= gira(.45 * sin(t * .5));

  // manto y falda
  float d = elipse(p - vec3(0, .25, 0), vec3(.55, .62, .55));
  vec3 f = p + vec3(0, .5, 0);
  f.xz /= 1. + .1 * sin(t * 2.);
  float falda = elipse(f, vec3(.82, .3, .82));
  falda += .05 * cos(atan(f.z, f.x) * 8.);
  d = funde(d, falda, .35);

  // ocho brazos
  vec3 q = p + vec3(0, .55, 0);
  q.xz += .1 * sin(q.y * 5. + t * 2.) * smoothstep(0., -.6, q.y);
  q = ronda(q, 8.);
  d = funde(d, capsula(q, vec3(.5, 0, 0), vec3(.72, -.6, 0), .075), .15);

  // aletas
  q = vec3(abs(p.x) - .72, p.y - .62, p.z);
  q.xy *= gira(.5 * sin(t * 2.) - .4);
  d = funde(d, elipse(q, vec3(.4, .19, .1)), .15);
  vec4 c = vec4(mix(ROJO, AMBAR, smoothstep(-.8, .5, p.y)), d * .7);

  // ojos
  q = vec3(abs(p.x) - .3, p.y - .12, p.z - .44);
  c = une(c, vec4(HUESO * 1.4, esfera(q, .13)));
  c = une(c, vec4(vec3(.01), esfera(q - vec3(0, 0, .08), .085)));
  return c;
}` },
{ id:'ctenoforo', archivo:'ctenoforo.glsl', metros:500, codigo:
`// Ocho hileras de peines que descomponen la luz.
vec4 criatura(vec3 p, float t) {
  p.y -= .08 * sin(t);
  p.xy *= gira(.25 * sin(t * .4));
  p.xz *= gira(t * .25);

  // cuerpo con ocho surcos y boca abierta abajo
  float ang = atan(p.z, p.x);
  float d = elipse(p, vec3(.72, 1.05, .72)) + .05 * cos(ang * 8.);
  d = max(d, -elipse(p + vec3(0, .95, 0), vec3(.42, .6, .42)));
  vec4 c = vec4(AZUL * .7, d * .6);

  // peines
  vec3 q = ronda(p, 8.);
  float y = q.y;
  float fila = .72 * sqrt(max(0., 1. - y * y / 1.1)) + .03;
  q.x -= fila;
  q.y -= .11 * clamp(round(y / .11), -6., 7.);
  vec3 arco = .5 + .5 * cos(y * 5. - t * 4. + vec3(0, 2.1, 4.2));
  float d2 = elipse(q, vec3(.07, .035, .1));
  c = une(c, vec4(arco * 1.7, d2 * .6));

  // órgano del equilibrio
  c = une(c, vec4(AMBAR * 1.8, esfera(p - vec3(0, 1.04, 0), .09)));
  return c;
}` },
{ id:'vampiro', archivo:'calamar_vampiro.glsl', metros:900, codigo:
`// La capa se abre y se cierra.
vec4 criatura(vec3 p, float t) {
  p.y -= .25 + .08 * sin(t * 1.5);
  p.xy *= gira(.2 * sin(t * .5));
  p.xz *= gira(.6 * sin(t * .35));
  float abre = .78 + .16 * sin(t * 1.5);

  // manto y capa, una campana hueca
  float d = elipse(p - vec3(0, .5, 0), vec3(.42, .55, .42));
  float ang = atan(p.z, p.x);
  vec3 k = p + vec3(0, .85, 0);
  float capa = elipse(k, vec3(abre, 1., abre)) + .04 * cos(ang * 8.);
  float borde = k.y + .1 + .12 * cos(ang * 8.);
  capa = max(capa, -elipse(k + vec3(0, .12, 0), vec3(abre - .1, .95, abre - .1)));
  capa = max(capa, -borde);
  d = funde(d, capa, .2);

  // puntas de los brazos, con luz
  vec3 q = ronda(p, 8.) - vec3(abre, -.95, 0);
  d = funde(d, capsula(q, vec3(0, .3, 0), vec3(.06, -.3, 0), .06), .1);
  vec4 c = vec4(mix(ROJO, AZUL, smoothstep(.4, 1., length(p.xz))), d * .6);
  float brilla = .5 + .5 * sin(t * 2. + gajo(p, 8.));
  c = une(c, vec4(CIAN * (1. + .9 * brilla),
                  esfera(q - vec3(.06, -.34, 0), .07)));

  // aletas y ojos
  q = vec3(abs(p.x) - .5, p.y - .8, p.z);
  q.xy *= gira(.45 * sin(t * 3.) - .5);
  c = une(c, vec4(ROJO * 1.2, elipse(q, vec3(.3, .13, .07)) * .8));
  q = vec3(abs(p.x) - .33, p.y - .25, p.z - .27);
  c = une(c, vec4(CIAN * 1.5, esfera(q, .13)));
  c = une(c, vec4(vec3(.01), esfera(q - vec3(.03, 0, .09), .075)));
  return c;
}` },
{ id:'tubos', archivo:'gusanos_de_tubo.glsl', metros:2500, codigo:
`// Un jardín sin sol.
vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.4 * sin(t * .25));
  p.y += .25;
  vec4 c = vec4(AZUL * .5,
    elipse(p + vec3(0, 1.15, 0), vec3(1.2, .3, 1.)) + .04 * sin(p.x * 9.) * sin(p.z * 8.));
  c.w *= .6;

  for (int i = 0; i < 9; i++) {
    float f = float(i), a = f * 2.4, r = .28 * sqrt(f);
    float alto = .55 + .4 * sin(f * 5.3) - .25 * r;
    float asoma = .16 * (.5 + .5 * sin(t * 1.3 + f * 1.9));
    vec3 q = p - vec3(cos(a) * r, 0, sin(a) * r);
    q.x -= .07 * sin(q.y * 2. + t + f) * smoothstep(-1., .6, q.y);
    // tubo blanco
    c = une(c, vec4(HUESO * .8,
      capsula(q, vec3(0, -1.1, 0), vec3(0, alto, 0), .085) * .8));
    // penacho rojo
    q.y -= alto + .12 + asoma;
    float plumas = .02 * cos(atan(q.z, q.x) * 9.);
    c = une(c, vec4(ROJO * 1.4,
      (elipse(q, vec3(.12, .25, .12)) + plumas) * .6));
  }
  return c;
}` },
{ id:'arpa', archivo:'esponja_arpa.glsl', metros:3300, codigo:
`// Un arpa que caza.
vec4 criatura(vec3 p, float t) {
  p.xz *= gira(t * .3);
  p.y += .5;
  // raíz
  vec4 c = vec4(AMBAR * .8, capsula(p, vec3(0, -.8, 0), vec3(0), .05));

  // cinco brazos en estrella
  vec3 q = ronda(p, 5.);
  float caida = .12 * sin(q.x * 2.2);
  q.y += caida;
  c = une(c, vec4(HUESO, capsula(q, vec3(0), vec3(1.15, 0, 0), .045)));

  // cuerdas: una cápsula repetida a lo largo del brazo
  float paso = .16;
  float n = clamp(round(q.x / paso), 1., 7.);
  float alto = 1.25 - n * .07;
  q.x -= n * paso + .03 * sin(q.y * 4. + t * 2. + n);
  c = une(c, vec4(HUESO * .9, capsula(q, vec3(0), vec3(0, alto, 0), .024) * .8));

  // bolas en las puntas, encendidas por turnos
  float luz = pow(.5 + .5 * sin(n * .9 - t * 3.), 4.);
  c = une(c, vec4(AMBAR * (.9 + .9 * luz), esfera(q - vec3(0, alto, 0), .065) * .8));
  return c;
}` },
{ id:'caracol', archivo:'pez_caracol.glsl', metros:7500, codigo:
`// Blando, sin escamas, a 750 atmósferas.
vec4 criatura(vec3 p, float t) {
  p.y -= .1 * sin(t * .8);
  p.xz *= gira(.3 * sin(t * .4) - .2);
  p.x += .5;

  // la ondulación crece hacia la cola
  float cola = smoothstep(-.1, 1.7, p.x);
  p.z += .25 * cola * sin(p.x * 3. - t * 4.);

  // cabeza y cuerpo
  float d = elipse(p + vec3(.35, 0, 0), vec3(.55, .36, .36));
  vec3 q = p - vec3(.4, .02, 0);
  d = funde(d, elipse(q, vec3(1.3, .2, .15)), .25);
  // aleta continua, fina
  d = funde(d, elipse(p - vec3(.65, 0, 0), vec3(1.15, .3, .08)), .08);
  vec3 piel = mix(vec3(1., .68, .66), AZUL * 1.3, cola);
  vec4 c = vec4(piel, d * .6);

  // aletas pectorales
  q = vec3(p.x + .05, p.y + .3, abs(p.z) - .42);
  q.yz *= gira(.7 + .35 * sin(t * 3.));
  c = une(c, vec4(vec3(.9, .55, .55), elipse(q, vec3(.26, .04, .34)) * .7));

  // ojos y boca
  q = vec3(p.x + .6, p.y - .13, abs(p.z) - .29);
  c = une(c, vec4(vec3(.01), esfera(q, .075)));
  c = une(c, vec4(HUESO * 1.5, esfera(q + vec3(.03, -.03, -.06), .03)));
  q = p + vec3(.82, .14, 0);
  c = une(c, vec4(ROJO * .6, elipse(q, vec3(.1, .03, .2)) * .7));
  return c;
}` }
];
