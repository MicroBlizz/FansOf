// Fans of Goose · LO DE VAMPIRE SURVIVORS en la tienda: la MALDICIÓN (ocas más duras, que pegan más y van más rápido) y la HORDA (más
// ocas y más seguido), cada una con 5 niveles que se compran y luego se ponen al nivel que quieras (0 = apagada; SAVE.activo) a cambio
// de más monedas y experiencia; la ELECCIÓN AUTOMÁTICA (al subir de nivel se elige sola la mejor carta, sin parar; interruptor en
// Opciones); y DESTERRAR y SALTAR en la pantalla de cartas (cargas por partida). En el Tablero del día, Con amigos y el Contrarreloj
// no cuentan la Maldición ni la Horda: allí todos juegan igual.
'use strict';

const RIESGO = {
  maldicion: { vida: 0.15, dano: 0.10, vel: 0.04, monedas: 0.15, xp: 0.08 },   // por nivel
  horda:     { oleada: 0.15, elites: 0.12, monedas: 0.10, xp: 0.04 },
};
// el nivel puesto (lo comprado, salvo que lo hayas bajado)
const nivelActivo = id => Math.min(nivelMejora(id), (SAVE.activo && id in SAVE.activo) ? SAVE.activo[id] : nivelMejora(id));
const riesgoCuenta = () => { const J = JUEGO; return !J.diario && !esCoop() && !J.carrera && !J.contrarreloj; };
function cambiaActivo(id) {
  if (!SAVE.activo) SAVE.activo = {};
  const max = nivelMejora(id); SAVE.activo[id] = (nivelActivo(id) + 1) % (max + 1); guarda(); SONIDO.elige(false);
}

// se suma a lo de la noche (lo llama nuevaPartida después de modNoche)
function aplicaRiesgo(M) {
  if (!riesgoCuenta()) return M;
  const m = nivelActivo('maldicion'), h = nivelActivo('horda'), R = RIESGO.maldicion, O = RIESGO.horda;
  M.vida *= 1 + m * R.vida; M.dano *= 1 + m * R.dano; M.vel *= 1 + m * R.vel;
  M.oleada *= 1 + h * O.oleada; M.elites *= 1 + h * O.elites;
  M.monedas += m * R.monedas + h * O.monedas;   // se SUMA a la noche: los extras de monedas nunca se multiplican entre sí (31-10-2026, Daniel)
  M.xpRiesgo = 1 + m * R.xp + h * O.xp;
  return M;
}

// --- la elección automática ---
const autoActiva = () => nivelMejora('auto') > 0 && SAVE.autoElegir !== 0 && !JUEGO.carrera;
// la mejor carta: la evolución; si no, subir el arma que más llevas; si no, un arma nueva; si no, la pasiva que más llevas
function mejorCarta(cartas) {
  const J = JUEGO, puntos = c => {
    if (c.clase === 'evo') return 1000;
    if (c.clase === 'arma') return J.armas[c.id] ? 500 + J.armas[c.id].nivel * 10 : 300;
    if (c.clase === 'pasiva') return J.pasivas[c.id] ? 200 + J.pasivas[c.id] * 10 : 150;
    return c.clase === 'pollo' && J.vida < J.st.vidaMax * 0.5 ? 400 : 10;
  };
  return cartas.reduce((a, b) => (puntos(b) > puntos(a) ? b : a), cartas[0]);
}
function eligeSola() {
  const J = JUEGO, c = mejorCarta(reparteCartas());
  J.pendientes--; aplicaCarta(c); SONIDO.elige(c.clase === 'evo');
  anillo(J.yo.x, J.yo.y, 50, '#ffd34d', 0.4, 3);
  texto(J.yo.x, J.yo.y - 18, tr(c.nombre), c.clase === 'evo' ? '#ffd34d' : '#fff4dc', 8, 1.3, -14);
}

// --- desterrar y saltar (en la pantalla de cartas) ---
function empiezaCargas() {
  const J = JUEGO; J.destierros = nivelMejora('destierro'); J.saltos = nivelMejora('saltar'); J.desterradas = new Set(); J.desterrando = false;
}
const desterrada = id => JUEGO.desterradas && JUEGO.desterradas.has(id);
function destierra(i) {
  const J = JUEGO, c = J.cartas[i]; if (!c || J.destierros <= 0 || c.clase === 'evo') return;
  J.destierros--; J.desterradas.add(c.id); J.desterrando = false;
  const otra = shuffle(cartasPosibles()).find(n => !J.cartas.some(x => x.id === n.id));
  J.cartas[i] = otra || { clase: 'monedas', id: 'monedas', nombre: 'Bolsa de monedas', desc: '+25 monedas.', icono: 'moneda', color: '#ffcf33' };
  SONIDO.dadoMalo(); tiembla(2);
}
function saltaCartas() {
  const J = JUEGO; if (J.saltos <= 0 || J.cartaElegida >= 0) return;
  J.saltos--; J.monedasPartida += 15; J.cartaElegida = 99; J.desterrando = false;
  SONIDO.boton(); texto(J.yo.x, J.yo.y - 14, tr('+{n} monedas', { n: 15 }), '#ffcf33', 7, 1);
  setTimeout(() => { if (J.modo === 'cartas') { J.modo = 'juego'; J.invul = Math.max(J.invul, 0.6); } }, 200);
}
// los botones de debajo de las cartas: volver a tirar, desterrar y saltar (los que tengas)
function botonesCartas(yb) {
  const J = JUEGO, W = PAN.W; if (J.cartaElegida >= 0) return;
  const bs = [];
  if (J.tiradas > 0) bs.push([tr('VOLVER A TIRAR'), '#c0402f', () => vuelveATirar(), J.tiradas]);
  if (J.destierros > 0) bs.push([J.desterrando ? tr('ELIGE CUÁL') : tr('DESTERRAR'), J.desterrando ? '#ffb04d' : '#6a2a4a', () => { J.desterrando = !J.desterrando; SONIDO.boton(); }, J.destierros]);
  if (J.saltos > 0) bs.push([tr('SALTAR'), '#2f74c0', () => saltaCartas(), J.saltos]);
  if (!bs.length) return;
  const gap = 4, w = Math.min(120, (W - 24 - gap * (bs.length - 1)) / bs.length), x0 = W / 2 - (w * bs.length + gap * (bs.length - 1)) / 2;
  bs.forEach(([txt, col, acc, n], i) => boton(x0 + i * (w + gap), yb, w, 26, txt, col, acc, bs.length > 2 ? 7 : 8.5, tr('quedan {n}', { n })));
  if (J.desterrando) texto2(tr('Toca la carta que no quieres volver a ver'), W / 2, yb + 36, 7, '#ffb04d');
}
