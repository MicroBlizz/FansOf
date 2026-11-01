// Fans of Shelter · CRAFTEO: el inventario de recursos (madera, piedra, hierro, cristal) y las recetas de la mesa de trabajo:
// mejorar la zanahoria, evolucionarla a fuego, orbes mágicos, trampas y torretas para la noche, y la sopa que cura.
// La ventana de la mesa se pinta en js/pantalla-2.js; aquí están los datos y qué pasa al craftear.
'use strict';

const RECURSOS = ['madera', 'piedra', 'hierro', 'cristal'];
const NOMBRE_RECURSO = { madera: 'Madera', piedra: 'Piedra', hierro: 'Hierro', cristal: 'Cristal' };

// las recetas que enseña la mesa ahora: la del refugio primero, y solo las que tienen plano (js/refugio.js)
function recetasAbiertas() {
  const sig = refugioSiguiente();
  const r = sig ? [{ id: 'refugio', nombre: 'Refugio: ' + sig.nombre, nombreTr: () => tr('Refugio: {n}', { n: tr(sig.nombre) }), que: sig.que, cuesta: sig.cuesta, max: () => 1, nivel: () => 0, hace: () => construyeRefugio() }] : [];
  return r.concat(RECETAS.filter(x => planoAbierto(x.id)));
}
const RECETAS = [
  { id: 'reforzar', nombre: 'Zanahoria reforzada', que: 'Más daño y más grande', cuesta: { madera: 2, piedra: 2 }, max: () => 5, nivel: () => J.arma.nivel,
    hace: () => { J.arma.nivel++; } },
  { id: 'fuego', nombre: 'Zanahoria de fuego', que: 'Dispara bolas de fuego', cuesta: { hierro: 2, madera: 1 }, max: () => 3, nivel: () => J.arma.fuego,
    hace: () => { J.arma.fuego++; } },
  { id: 'orbe', nombre: 'Orbe mágico', que: 'Un orbe que gira contigo', cuesta: { cristal: 1, hierro: 1 }, max: () => 4, nivel: () => J.arma.orbes,
    hace: () => { J.arma.orbes++; } },
  { id: 'trampa', nombre: 'Trampa de pinchos', que: 'Se pone delante de ti', cuesta: { madera: 3 }, max: () => 8, nivel: () => cuentaConstruido('trampa'),
    hace: () => construye('trampa') },
  { id: 'torreta', nombre: 'Torreta', que: 'Dispara sola de noche', cuesta: { piedra: 3, hierro: 1 }, max: () => 4, nivel: () => cuentaConstruido('torreta'),
    hace: () => construye('torreta') },
  { id: 'sopa', nombre: 'Sopa de zanahoria', que: 'Cura 2 corazones', cuesta: { madera: 1, piedra: 1 }, max: () => 99, nivel: () => 0,
    hace: () => { J.vida = Math.min(J.vidaMax, J.vida + 2); } },
];
const cuentaConstruido = tipo => MAPA.construido.filter(o => o.tipo === tipo).length;

function tieneRecursos(cuesta) { return RECURSOS.every(r => (J.inv[r] || 0) >= (cuesta[r] || 0)); }
// casilla delante de CrazyBunny para construir: tiene que ser hierba o tierra libre
function casillaDelante() {
  const i = Math.floor(J.x / CAS) + J.mira.x, j = Math.floor((J.y - 5) / CAS) + J.mira.y;
  return { i, j, c: casilla(i, j) };
}
function construye(tipo) {
  // primero delante; si no cabe, la casilla libre más cercana alrededor del jugador
  const candidatos = [casillaDelante()];
  const ci = Math.floor(J.x / CAS), cj = Math.floor((J.y - 5) / CAS);
  for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) candidatos.push({ i: ci + di, j: cj + dj, c: casilla(ci + di, cj + dj) });
  for (const k of candidatos) {
    if ((k.c !== '.' && k.c !== '_' && k.c !== 't') || MAPA.construido.some(o => o.i === k.i && o.j === k.j)) continue;
    if (k.i === ci && k.j === cj && tipo === 'torreta') continue;   // la torreta no se pone encima del conejo
    MAPA.construido.push({ tipo, i: k.i, j: k.j, t: 0, vida: tipo === 'trampa' ? 3 : 6 });
    if (tipo === 'torreta') MAPA.t[k.j][k.i] = MAPA.t[k.j][k.i] === '_' ? '_' : '.';
    chispas((k.i + 0.5) * CAS, (k.j + 0.5) * CAS, PALETA.t, 8);
    return true;
  }
  toast(tr('No hay sitio aquí'));
  return false;
}
// intenta craftear la receta n. Devuelve true si se ha hecho
function craftea(n) {
  const r = recetasAbiertas()[n];
  if (r.id === 'refugio') return construyeRefugio();
  if (r.nivel() >= r.max()) { toast(tr('Ya está al máximo')); return false; }
  if (!tieneRecursos(r.cuesta)) { toast(tr('Te faltan recursos')); SONIDO.no(); return false; }
  const copia = Object.assign({}, J.inv);
  for (const k in r.cuesta) J.inv[k] -= r.cuesta[k];
  if (r.hace() === false) { J.inv = copia; return false; }
  SONIDO.craftea(); numero(J.x, J.y - 24, tr(r.nombre), PALETA.Y);
  return true;
}
