// Qué hace cada obra al tocarla. Lo que cambia en su forma o su luz está en su propio dibujo
// (variables acc, de 0 a 1, y tq, segundos desde el toque). Aquí va lo que se mueve entera:
//   mov(k, s) desplazamiento [x, y, z] · giro(k) radianes · sacude amplitud · dur segundos
// k va de 0 a 1 durante el gesto y s son los segundos transcurridos.
(() => {
const ida = k => Math.sin(Math.PI * k), sua = k => k * k * (3 - 2 * k), PI = Math.PI;
const sale = (k, n) => k < .5 ? n * Math.pow(k * 2, 2.2) : -n * Math.pow((1 - k) * 2, 2.2);   // se va por un lado y vuelve por el otro
const vuelta = k => 2 * PI * sua(k);
window.GESTOS = {
  // tercera tanda
  luna: { dur: 3.2 }, cometa: { dur: 2.8, sacude: .01 }, galaxia: { dur: 3 }, palmera: { dur: 3 }, cascada: { dur: 3.2 }, cristales: { dur: 3 }, copo: { dur: 3 },
  torii: { dur: 3 }, puente: { dur: 3 }, iglu: { dur: 3.2 }, moai: { dur: 2.8 }, gramofono: { dur: 2.8 }, espada: { dur: 3.2, sacude: .008 }, farol: { dur: 3.2 }, reloj: { dur: 2.8 }, corona: { dur: 2.8 }, televisor: { dur: 3 },
  helicoptero: { dur: 3.4, mov: k => [-.15 * ida(k), .3 * ida(k), 0] }, bicicleta: { dur: 2.8, mov: k => [.1 * ida(k), .12 * ida(k), 0] },
  pizza: { dur: 3.2 }, pina: { dur: 3 }, cupcake: { dur: 3 }, ramen: { dur: 3.2 }, icosaedro: { dur: 3 }, metabolas: { dur: 3.2 }, adn: { dur: 3.2 },
  elefante: { dur: 3 }, tortuga: { dur: 3 }, abeja: { dur: 3, mov: (k, s) => [.25 * Math.sin(s * 4) * ida(k), .2 * Math.sin(s * 8) * ida(k), 0] }, rana: { dur: 2.6 }, unicornio: { dur: 3 },
  // espacio
  saturno: { giro: vuelta }, tierra: { giro: vuelta }, sol: { sacude: .012 }, agujero: {},
  astronauta: { mov: (k, s) => [0, .1 * ida(k), 0] }, cohete: { dur: 3, mov: k => [sale(k, .9), sale(k, 3.4), 0], sacude: .015 },
  satelite: {}, ovni: { dur: 3.2, mov: (k, s) => [.08 * Math.sin(s * 5) * ida(k), 0, 0] },
  // naturaleza
  cerezo: { dur: 3.2 }, volcan: { dur: 3.2, sacude: .022 }, rosa: { dur: 3.2 }, montes: { dur: 3 }, girasol: {}, cactus: {}, hongos: { dur: 3 },
  tornado: { dur: 3, mov: (k, s) => [.35 * Math.sin(s * 3) * ida(k), 0, 0] },
  // lugares
  faro: {}, castillo: { dur: 3 }, ciudad: { dur: 3.2 }, templo: { dur: 2.8 }, molino: {}, piramides: { dur: 3 }, pagoda: { dur: 3 },
  // objetos
  calavera: { mov: (k, s) => [0, .03 * Math.abs(Math.sin(s * 10)) * ida(k), 0] }, arena: {}, taza: { dur: 3 }, guitarra: { mov: (k, s) => [.02 * Math.sin(s * 9) * ida(k), 0, 0] },
  camara: { mov: (k, s) => [0, 0, .3 * ida(Math.min(1, k * 2))] }, vela: { dur: 3.4 }, ajedrez: { dur: 3.2 }, globo: { dur: 3.4, mov: k => [.25 * Math.sin(k * 2 * PI), .75 * ida(k), 0] },
  // máquinas
  robot: { dur: 3, mov: (k, s) => [.07 * Math.sin(s * 6) * ida(k), .05 * Math.abs(Math.sin(s * 6)) * ida(k), 0] },
  auto: { dur: 2.6, mov: k => [sale(k, -4.2), 0, k < .5 ? k * 1.2 : 0] }, velero: { dur: 3.2, mov: (k, s) => [0, .14 * Math.sin(s * 3) * ida(k), 0] },
  tren: { dur: 3, sacude: .012, mov: k => [-.35 * ida(k), 0, 0] }, submarino: { dur: 3.2, mov: k => [-.15 * ida(k), -.75 * ida(k), 0] }, biplano: { dur: 2.6, mov: k => [0, .45 * ida(k), 0] },
  // comida
  hamburguesa: { dur: 3 }, helado: { dur: 3.2 }, sushi: { dur: 3 }, sandia: { dur: 3.2 },
  // formas
  dona: { dur: 3 }, nudo: { dur: 3 }, fractal: { dur: 3.4 }, menger: { dur: 3 }, giroide: { dur: 3.2 }, mobius: { dur: 3 },
  // animales
  gato: { dur: 2.8 }, tiburon: { dur: 2.4, mov: k => [-.12 * ida(k), 0, .4 * ida(k)] }, lechuza: { dur: 2.8 }, morpho: { dur: 3, mov: (k, s) => [.3 * Math.sin(s * 3) * ida(k), .3 * ida(k), 0] },
  cobra: { dur: 2 }, nautilo: { dur: 2.6, mov: k => [.45 * ida(k), .12 * ida(k), 0] }, ctenoforo: {}, sifonoforo: {}, vampiro: { dur: 2.8, mov: k => [0, .2 * ida(k), 0] },
  medusa: { dur: 3, mov: k => [0, .25 * ida(k), 0] }, tubos: { dur: 2.8 }, arpa: {}, dumbo: { dur: 2.8, mov: (k, s) => [0, .35 * ida(k) + .04 * Math.sin(s * 14) * ida(k), 0] },
  caracol: { dur: 2.4, mov: k => [-.4 * ida(k), .08 * ida(k), 0] },
  // fantasía
  ciervo: { dur: 3, mov: k => [0, .12 * ida(Math.min(1, k * 2.2)), 0] }, ballena: { dur: 3.2, mov: k => [0, .25 * ida(k), 0] }, zorro: { dur: 2.8 },
  dragon: { dur: 3 }, limo: { dur: 2.4 }, mimico: { dur: 2.4, mov: (k, s) => [0, .16 * Math.abs(Math.sin(s * 6)) * ida(k), .25 * ida(k)] }, espectro: { dur: 2.8, mov: k => [0, .12 * ida(k), .95 * ida(k)] },
  // mitos
  hidra: { dur: 2.8, sacude: .01 }, uroboros: {}, fenix: { dur: 3.2, mov: k => [0, .2 * ida(k), 0] }, kraken: { dur: 3 }, quetzal: { dur: 3, giro: vuelta, mov: k => [0, .12 * ida(k), 0] },
  aspido: { dur: 3.4, mov: k => [0, -.75 * ida(k), 0] }, golem: { dur: 3, sacude: .012, mov: k => [0, -.12 * ida(k), 0] }
};
})();
