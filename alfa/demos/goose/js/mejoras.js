// Fans of Goose · Mejoras: las cuatro armas, las ocho pasivas, las cuatro evoluciones (arma al máximo + su pasiva = carta dorada)
// y cómo se reparten las cartas al subir de nivel o al abrir un cofre. Las cifras de cada arma por nivel están en NIV_* de js/armas.js.
'use strict';

const ARMAS = {
  latigo: { nombre: 'Látigo de junco', icono: 'latigo', color: '#c98a3d',
    niveles: ['Un latigazo delante que empuja a las ocas.', 'Más daño y más alcance.', 'También azota hacia atrás.', 'Más rápido y más daño.', 'Latigazos enormes que lo barren todo.'],
    evo: { pasiva: 'fuerza', nombre: 'Látigo del Pozo', desc: 'Un círculo entero de latigazos dobles. Nada se acerca.' } },
  plumas: { nombre: 'Cuchillas de pluma', icono: 'cuchilla', color: '#e8eefc',
    niveles: ['Dos plumas afiladas giran a tu alrededor.', 'Una pluma más.', 'Giran más deprisa y más lejos.', 'Una pluma más y más daño.', 'Cinco plumas, rapidísimas.'],
    evo: { pasiva: 'prisa', nombre: 'Tornado de plumas', desc: 'Ocho plumas de fuego que se abren y se cierran. Cuanto más corres, más pegan.' } },
  huevo: { nombre: 'Huevos podridos', icono: 'huevo', color: '#b9d36b',
    niveles: ['Lanza un huevo que explota y deja un charco tóxico.', 'Explosión más grande.', 'Dos huevos a la vez.', 'Charcos que duran más y pican más.', 'Tres huevos, explosiones enormes.'],
    evo: { pasiva: 'area', nombre: 'Huevo del Kraken', desc: 'Cada explosión suelta cuatro huevos más pequeños.' } },
  dados: { nombre: 'Dados cargados', icono: 'dado6', color: '#f1e6c8',
    niveles: ['Un dado que rebota de oca en oca.', 'Rebota una vez más.', 'Al golpear suelta metralla.', 'Dos dados a la vez.', 'Rebotes sin fin y más metralla.'],
    evo: { pasiva: 'suerte', nombre: 'Dados del Destino', desc: 'Cada golpe es un seis: críticos seguros y metralla en estrella.' } },
};
const PASIVAS = {
  fuerza: { nombre: 'Fuerza bruta', desc: '+12 % de daño.', icono: 'fuerza' },
  prisa:  { nombre: 'Patas ligeras', desc: '+9 % de velocidad.', icono: 'prisa' },
  area:   { nombre: 'Tamaño oca', desc: '+12 % de área de las armas.', icono: 'area' },
  suerte: { nombre: 'Trébol de la Oca', desc: '+7 % de golpe crítico.', icono: 'suerte' },
  iman:   { nombre: 'Imán de plumas', desc: 'Recoges plumas desde más lejos.', icono: 'iman' },
  vida:   { nombre: 'Corazón de pato', desc: '+20 de vida máxima y te cura.', icono: 'vida' },
  plumon: { nombre: 'Plumón', desc: 'Recuperas vida poco a poco.', icono: 'plumon' },
  cadencia: { nombre: 'Prisa de pico', desc: 'Las armas atacan un 8 % más a menudo.', icono: 'cadencia' },
};
const MAX_NIVEL = 5, MAX_ARMAS = 4, MAX_PASIVAS = 6;

// lo que valen las pasivas (y la tienda) para la partida en curso
function calculaStats() {
  const J = JUEGO, p = id => J.pasivas[id] || 0, m = nivelMejora;
  J.st = {
    dano: (1 + p('fuerza') * 0.12 + m('fuerza') * 0.06),
    vel: CFG.jugador.velocidad * (1 + p('prisa') * 0.09 + m('prisa') * 0.04),
    area: 1 + p('area') * 0.12,
    crit: 0.05 + p('suerte') * 0.07,
    iman: CFG.jugador.iman * (1 + p('iman') * 0.3 + m('iman') * 0.15),
    vidaMax: CFG.jugador.vida + p('vida') * 20 + m('vida') * 12,
    regen: p('plumon') * 0.45,
    cd: 1 / (1 + p('cadencia') * 0.08),
    monedas: 1 + m('codicia') * 0.15,
  };
}

// --- las cartas ---
function cartaArma(id) {
  const a = JUEGO.armas[id], n = a ? a.nivel : 0, A = ARMAS[id];
  return { clase: 'arma', id, nivel: n + 1, nombre: A.nombre, desc: A.niveles[n], icono: A.icono, color: A.color, nueva: !a };
}
function cartaPasiva(id) {
  const n = JUEGO.pasivas[id] || 0, P = PASIVAS[id];
  return { clase: 'pasiva', id, nivel: n + 1, nombre: P.nombre, desc: P.desc, icono: P.icono, color: '#7fd1ff', nueva: !n };
}
function evolucionesListas() {
  const out = [];
  for (const id in JUEGO.armas) { const a = JUEGO.armas[id], E = ARMAS[id].evo; if (!a.evo && a.nivel >= MAX_NIVEL && JUEGO.pasivas[E.pasiva]) out.push({ clase: 'evo', id, nivel: 0, nombre: E.nombre, desc: E.desc, icono: ARMAS[id].icono, color: '#ffd34d', nueva: true }); }
  return out;
}
function cartasPosibles() {
  const J = JUEGO, out = [];
  const nArmas = Object.keys(J.armas).length, nPas = Object.keys(J.pasivas).length;
  for (const id in ARMAS) { const a = J.armas[id]; if (a ? a.nivel < MAX_NIVEL : nArmas < MAX_ARMAS) out.push(cartaArma(id)); }
  for (const id in PASIVAS) { const n = J.pasivas[id] || 0; if (n ? n < MAX_NIVEL : nPas < MAX_PASIVAS) out.push(cartaPasiva(id)); }
  return out;
}
// tres (o cuatro con suerte) cartas distintas; las evoluciones listas salen siempre primero
function reparteCartas() {
  const evo = evolucionesListas(), resto = shuffle(cartasPosibles());
  // las armas que ya llevas salen algo más a menudo que las nuevas (así suben de nivel y llegan a evolucionar)
  resto.sort((a, b) => (b.nueva ? 0 : 1) * 0.6 + Math.random() - ((a.nueva ? 0 : 1) * 0.6 + Math.random()));
  const n = Math.random() < JUEGO.st.crit * 0.6 ? 4 : 3;
  const cartas = evo.concat(resto).slice(0, n);
  while (cartas.length < 3) cartas.push(cartas.length % 2 ? { clase: 'monedas', id: 'monedas', nombre: 'Bolsa de monedas', desc: '+25 monedas.', icono: 'moneda', color: '#ffcf33' } : { clase: 'pollo', id: 'pollo', nombre: 'Oca asada', desc: 'Te cura 50 de vida.', icono: 'pollo', color: '#ff9b6b' });
  return cartas;
}

function aplicaCarta(c) {
  const J = JUEGO;
  if (c.clase === 'arma') { if (!J.armas[c.id]) J.armas[c.id] = { nivel: 0, evo: false, t: 0.3, ang: 0, lado: 1 }; J.armas[c.id].nivel++; }
  else if (c.clase === 'pasiva') { J.pasivas[c.id] = (J.pasivas[c.id] || 0) + 1; if (c.id === 'vida') J.vida += 20; }
  else if (c.clase === 'evo') { J.armas[c.id].evo = true; destella('#ffd34d', 0.8); anillo(J.yo.x, J.yo.y, 120, '#ffd34d', 0.7, 5); SONIDO.evolucion(); }
  else if (c.clase === 'monedas') { J.monedasPartida += 25; }
  else if (c.clase === 'pollo') { J.vida += 50; }
  calculaStats(); J.vida = Math.min(J.vida, J.st.vidaMax);
}
