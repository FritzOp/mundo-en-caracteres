// Cada `codigo` es GLSL: el dibujo de una criatura.
// Contrato: vec4 criatura(vec3 p, float t) -> (color, distancia). Un color por encima de 1 emite luz.
window.CRIATURAS = [
{ id:'nautilo', archivo:'nautilo.glsl', metros:400, codigo:
`// Una espiral logarítmica con capucha.
vec4 criatura(vec3 p, float t) {
  p.y -= .06 * sin(t) - .05;
  p.x -= .12;
  p.xz *= gira(.22 * sin(t * .5) + .12);
  p.xy *= gira(.62 + .06 * sin(t * .7));
  // concha: cada vuelta crece el triple
  float a = atan(p.y, p.x), r = length(p.xy), d = 9.;
  for (int k = 0; k < 4; k++) {
    float c = .44 * exp(.175 * (a - 6.2832 * float(k)));
    d = min(d, length(vec2(r - c, p.z * .95)) - .5 * c);
  }
  d += .006 * sin(a * 46. + r * 8.);
  // llamas pardas que salen del ombligo, solo en el lomo
  float llama = smoothstep(.15, .5, sin(a * 11. + 2.6 * sin(r * 5.) + r * 3.));
  llama *= smoothstep(.22, .4, r) * smoothstep(-2.5, -1.2, a);
  float camara = smoothstep(.12, .0, abs(sin(a * 7. - r * 3.5))) * smoothstep(-1.2, -2.2, a) * .5;
  vec4 c = vec4(mix(HUESO * .92, vec3(.8, .25, .06), max(llama, camara)), d * .6);
  // capucha parda, en cuña
  vec3 q = p - vec3(-.78, 0, 0);
  float rug = .015 * sin(q.x * 24.) * sin(q.y * 21.) * sin(q.z * 23.);
  float cap = elipse(q - vec3(-.14, -.0, 0), vec3(.3, .42, .36));
  cap = funde(cap, cono(q, vec3(-.16, -.05, 0), vec3(-.08, -.55, 0), .24, .07), .12);
  c = une(c, vec4(vec3(.75, .32, .12), (cap + rug) * .65));
  float cara = elipse(q - vec3(.06, -.06, 0), vec3(.36, .24, .36));
  c = une(c, vec4(vec3(.62, .42, .32), cara * .7));
  // ojo
  vec3 o = vec3(q.x - .08, q.y + .08, abs(q.z) - .32);
  c = une(c, vec4(vec3(.4, .24, .16), esfera(o, .14)));
  c = une(c, ojo(o - vec3(0, -.02, .05), .15, AMBAR, vec3(-.3, -.2, 1), vec3(.6, .35, .2)));
  
  // tentáculos rizados
  for (int i = 0; i < 12; i++) {
    float f = float(i), g = f * 2.4;
    vec3 ini = vec3(.05 + .16 * cos(g), -.2, .24 * sin(g));
    float L = .5 + .16 * sin(f * 5.);
    vec3 fin = ini + vec3(-.12 + .2 * cos(g) + .05 * sin(t * 1.6 + f), -L, .18 * sin(g));
    vec3 med = ini + vec3(.16 * sin(f * 3. + t), -L * .5, .1 * sin(g));
    c = une(c, vec4(mix(vec3(.75, .5, .4), HUESO, .3 + .3 * sin(q.y * 60.)), curva(q, ini, med, fin, .045, .014) * .7));
  }
  return c;
}` },
{ id:'sifonoforo', archivo:'sifonoforo.glsl', metros:700, codigo:
`// Una colonia. Cada campana es un individuo.
vec4 criatura(vec3 p, float t) {
  p *= 1.28;
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
                  elipse(q, vec3(.2, .078, .13)) * .7));

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
  p.y -= .06 * sin(t * 2.) + .02;
  p.xz *= gira(.35 * sin(t * .5) - .2);
  // cabeza abombada que se estrecha en la cintura
  float d = elipse(p - vec3(0, .42, 0), vec3(.62, .64, .58));
  d = funde(d, elipse(p - vec3(0, -.2, 0), vec3(.5, .4, .48)), .25);
  // falda
  vec3 f = p + vec3(0, .52, 0);
  f.xz /= 1. + .07 * sin(t * 2.);
  float ang = atan(f.z, f.x);
  d = funde(d, elipse(f, vec3(.62, .3, .6)) + .04 * cos(ang * 8.), .25);
  // ocho brazos en punta
  vec3 q = p + vec3(0, .6, 0);
  q.xz *= 1. + .05 * sin(t * 2. + 1.);
  vec3 r = ronda(q, 8.);
  r.x += .06 * sin(r.y * 6. + t * 2. + gajo(q, 8.)) * smoothstep(0., -.5, r.y);
  float L = .5 + .08 * sin(gajo(q, 8.) * 2.3);
  float br = cono(r, vec3(.48, 0, 0), vec3(.56, -L, 0), .15, .025);
  d = funde(d, br, .1);
  // orejas: pétalos cóncavos
  q = vec3(abs(p.x) - .56, p.y - .55, p.z);
  q.xy *= gira(.45 * sin(t * 2.) + .45);
  vec3 e = q - vec3(.3, .1, 0); e.xy *= gira(-.35);
  float ore = elipse(e, vec3(.32, .25, .11));
  ore = max(ore, -elipse(e - vec3(.02, 0, .12), vec3(.25, .18, .1)));
  ore = funde(ore, cono(q, vec3(-.08, 0, 0), vec3(.12, .04, 0), .12, .09), .08);
  d = funde(d, ore, .07);
  vec3 piel = mix(vec3(.95, .6, .52), vec3(1., .78, .74), smoothstep(-.6, .8, p.y));
  piel = mix(piel, vec3(.72, .5, .6), smoothstep(-.45, -1.1, p.y) * .5);
  piel = mix(piel, vec3(1.05, .6, .42), smoothstep(.62, .8, abs(p.x)) * step(.3, p.y));
  // ventosas
  piel = mix(piel, HUESO, step(.6, sin(r.y * 42.)) * step(r.x, .5) * step(p.y, -.65) * .6);
  vec4 c = vec4(piel * .82, d * .65);
  // ojos con párpado
  q = vec3(abs(p.x) - .33, p.y - .03, p.z - .32);
  c = une(c, vec4(vec3(.85, .62, .68), esfera(q, .125)));
  c = une(c, ojo(q - vec3(.02, 0, .06), .165, vec3(.25, .12, .4), vec3(0, .05, 1), vec3(.85, .55, .6)));
  return c;
}` },
{ id:'ctenoforo', archivo:'ctenoforo.glsl', metros:500, codigo:
`// Ocho hileras de peines que descomponen la luz.
vec4 criatura(vec3 p, float t) {
  p.y -= .06 * sin(t);
  p.xy *= gira(.1 * sin(t * .4));
  vec3 v = p;                       // lo interior se ve de frente
  p.xz *= gira(.39 + .12 * sin(t * .3));
  float ang = atan(p.z, p.x);
  float costilla = .5 + .5 * cos(ang * 8.);
  float filo = smoothstep(.84, .98, costilla);
  // campana ovalada con un arco abierto abajo
  float ancho = .82 - .1 * smoothstep(-.2, -1.1, p.y);
  float d = elipse(p, vec3(ancho, 1.15, ancho)) - .045 * filo;
  d = max(d, -(length((v.xy + vec2(0, 1.08)) / vec2(.42, .55)) - 1.) * .4);
  // peines: arcoíris con dientes finos
  vec3 arco = .5 + .5 * cos(p.y * 4.2 - t * 2.5 + vec3(0, 2.1, 4.2));
  float diente = .65 + .35 * step(0., sin(p.y * 55.));
  float vive = smoothstep(-1., -.75, p.y) * smoothstep(1.12, .95, p.y);
  vec3 tono = mix(vec3(.05, .1, .2), arco * 1.75 * diente, filo * vive);
  // canales interiores, como vidrio
  float y = v.y;
  float x = abs(v.x);
  float canal = smoothstep(.05, .015, abs(x - .07 - .025 * sin(y * 16.))) * step(abs(y - .1), .5);
  float asa = abs(length(vec2(x - .36, max(abs(y + .05) - .32, 0.))) - .11);
  canal = max(canal, smoothstep(.035, .01, asa));
  canal = max(canal, smoothstep(.035, .01, abs(y + .42 + .5 * x)) * step(x, .4));
  canal *= step(0., v.z) * (1. - filo);
  tono = mix(tono, vec3(.75, .9, 1.05), canal * .8);
  vec4 c = vec4(tono, d * .5);
  return une(c, vec4(vec3(.8, .95, 1.1), esfera(v - vec3(0, 1.13, 0), .06)));
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
  d = funde(d, capsula(q, vec3(-.02, .35, 0), vec3(.06, -.3, 0), .075), .1);
  vec4 c = vec4(mix(ROJO, AZUL, smoothstep(.4, 1., length(p.xz))), d * .6);
  float brilla = .5 + .5 * sin(t * 2. + gajo(p, 8.));
  c = une(c, vec4(CIAN * (1. + .9 * brilla),
                  esfera(q - vec3(.06, -.3, 0), .09)));

  // aletas y ojos
  q = vec3(abs(p.x) - .5, p.y - .8, p.z);
  q.xy *= gira(.45 * sin(t * 3.) - .5);
  c = une(c, vec4(ROJO * 1.2, elipse(q, vec3(.3, .13, .07)) * .8));
  q = vec3(abs(p.x) - .25, p.y - .28, p.z - .22);
  c = une(c, ojo(q, .16, vec3(.1, .7, .95), vec3(.1, 0, 1), ROJO));
  
  return c;
}` },
{ id:'tubos', archivo:'gusanos_de_tubo.glsl', metros:2500, codigo:
`// Un jardín sin sol.
vec4 criatura(vec3 p, float t) {
  p.xz *= gira(.3 * sin(t * .25));
  p.y += .05;
  // roca
  vec3 q = p + vec3(0, 1.12, 0);
  float roca = elipse(q, vec3(.85, .28, .6)) + .07 * sin(q.x * 8.) * sin(q.y * 9. + q.z * 7.) + .03 * sin(q.x * 21. + q.z * 17.);
  vec4 c = vec4(vec3(.14, .18, .22), roca * .55);
  for (int i = 0; i < 10; i++) {
    float f = float(i);
    float lx = (f - 4.5) / 4.5;                    // abanico
    float z = .28 * sin(f * 2.7);
    float alto = 1.75 - .95 * abs(lx) + .3 * sin(f * 4.1);
    vec3 base = vec3(lx * .48, -1.05, z * .8);
    vec3 dir = normalize(vec3(lx * .55, 1., z * .35));
    vec3 punta = base + dir * alto;
    float h = clamp(dot(p - base, dir) / alto, 0., 1.);
    float anillo = .012 * sin(h * alto * 38. + f) + .01 * sin(p.x * 30.) * sin(p.y * 9.);
    float d = cono(p, base, punta, .085, .12) + anillo;
    // boca hueca
    vec3 r = p - punta;
    float eje = dot(r, dir), rad = length(r - dir * eje);
    d = max(d, eje);
    d = max(d, -max(rad - .075, -eje - .25));
    vec3 cal = mix(vec3(.6, .45, .32), HUESO, .35 + .65 * smoothstep(-.4, .8, sin(h * 23. + f * 2.)));
    c = une(c, vec4(cal, d * .7));
    // penachos
    if (i == 1 || i == 3 || i == 6 || i == 8) {
      float asoma = .1 * sin(t * .9 + f * 1.9);
      for (int j = 0; j < 5; j++) {
        float g = float(j) - 2.;
        vec3 s = p - punta - dir * (asoma - .05);
        s.xy *= gira(g * .42 + lx * .35 + .06 * sin(t * 1.5 + g + f));
        s.yz *= gira(.3 * sin(g * 3. + f));
        float curvo = .25 * s.y * s.y * sign(g + .1);
        s.x -= curvo;
        float barba = .02 * sin((s.y - abs(s.x) * 1.2) * 55.);
        c = une(c, vec4(mix(vec3(.75, .07, .1), vec3(1.15, .25, .25), step(abs(s.x), .02)), (elipse(s - vec3(0, .27, 0), vec3(.085, .29, .04)) + barba) * .5));
      }
    }
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
  p.y -= .08 * sin(t * .8);
  p.xz *= gira(.3 * sin(t * .4) + .3);
  p.x += .4;
  // la ondulación crece hacia la cola
  float cola = smoothstep(-.1, 1.7, p.x);
  p.z += .28 * cola * sin(p.x * 3. - t * 3.5);
  // cabeza ancha y cuerpo que se afila
  float d = elipse(p + vec3(.42, 0, 0), vec3(.52, .42, .44));
  d = funde(d, elipse(p - vec3(-.05, -.03, 0), vec3(.5, .37, .34)), .15);
  d = funde(d, cono(p, vec3(.1, 0, 0), vec3(1.65, .04, 0), .28, .02), .2);
  // aleta continua arriba y abajo, unida a la cola
  float perfil = .4 * smoothstep(-.1, .35, p.x) * smoothstep(1.85, .5, p.x) + .03 * sin(p.x * 9. - t * 3.);
  float aleta = max(max(abs(p.z) - .03, abs(p.y) - perfil), max(p.x - 1.7, -p.x));
  vec3 piel = mix(vec3(1., .66, .62), vec3(.62, .66, 1.), cola);
  vec4 c = vec4(piel, d * .65);
  float radio = .5 + .5 * sin(p.x * 34.);
  c = une(c, vec4(mix(vec3(.75, .5, .7), vec3(.5, .6, 1.), cola) * (.7 + .3 * radio), aleta * .45));
  // aletas pectorales en abanico, pegadas a la mejilla
  vec3 q = vec3(p.x + .12, p.y + .2, abs(p.z) - .3);
  q.xy *= gira(.5 + .25 * sin(t * 2.5)); q.yz *= gira(-.5);
  c = une(c, vec4(vec3(1., .6, .62) * (.75 + .25 * sin(atan(q.x, -q.y) * 14.)), elipse(q + vec3(-.08, .2, 0), vec3(.17, .27, .04)) * .6));
  // boca y ojos
  q = p + vec3(.82, .1, 0);
  float boca = smoothstep(.03, .0, abs(q.y + .08 * q.x)) * step(p.x, -.6);
  c.xyz *= 1. - .55 * boca * step(abs(c.w - d * .65), .001);
  q = vec3(p.x + .62, p.y - .12, abs(p.z) - .34);
  return une(c, ojo(q, .13, vec3(.08, .15, .4), vec3(-.4, 0, 1), vec3(1., .66, .62)));
}` }
];
