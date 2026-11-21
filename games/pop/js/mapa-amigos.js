// Fans of Pop · LAS CARAS DE LOS AMIGOS EN EL MAPA DEL CAMINO (tarea #145, ADR 189).
// · ppPintaAmigosMapa(c, m, dif, t): lo llama ppPintaMapa en cada fotograma; solo con el flag de amigos abierto, en el modo fácil y con un latido
//   ya recibido (PP_AMIGOS_SRV.ultimo(): nunca habla con el servidor). Junto a cada nivel del mundo m apila hasta 3 caritas de los amigos que van por él.
// · ppAmigosMapaPuestos(grupos, posDe, hasta): lo PURO (dónde va cada cara respecto al nivel y a qué lado); sin dibujo ni globales del juego.
// · Cada personaje se dibuja una vez en un canvas pequeño (ppAmigosMapaCara) para no repintar el compañero entero cada fotograma. No reciben toques.
'use strict';
const PP_AMIGOS_MAPA = Object.freeze({ cara: 34, paso: 30, hueco: 68, mitad: 270, porNivel: 3, nombreMax: 6, fuera: 90 });
const ppAmigosMapaCaches = new Map();   // personaje -> { cv, veces, hasta }
// puestos de las caras: grupos = [{ nivel, codigos }] (PP_AMIGOS_REGLAS.carasMapa), posDe(nivel) = [x, y] del centro; hasta = alto de la pantalla.
// Van al lado del centro del camino que tiene más sitio, apiladas en vertical; el nombre solo si hay una sola cara.
function ppAmigosMapaPuestos(grupos, posDe, hasta) {
  const K = PP_AMIGOS_MAPA, puestos = [];
  for (const g of grupos) {
    const [x, y] = posDe(g.nivel);
    if (!(y > -K.fuera && y < hasta + K.fuera)) continue;
    const lado = x < K.mitad ? -1 : 1, n = g.codigos.length;
    g.codigos.forEach((codigo, k) => puestos.push({ codigo, nivel: g.nivel, x: x + lado * K.hueco, y: y - 6 + (k - (n - 1) / 2) * K.paso, nombre: n === 1 }));
  }
  return puestos;
}
const ppAmigosMapaCorto = n => Array.from(String(n || '')).slice(0, PP_AMIGOS_MAPA.nombreMax).join('');
// el personaje del perfil del amigo (un id de compañero); sin perfil, Lola
const ppAmigosMapaPersonaje = a => (a && a.perfil && typeof a.perfil.personaje === 'string' && a.perfil.personaje) || 'lola';
// el dibujo pequeño de un personaje, cacheado; se rehace unas pocas veces por si su imagen aún no había cargado
function ppAmigosMapaCara(id) {
  const K = PP_AMIGOS_MAPA, ahora = Date.now();
  let e = ppAmigosMapaCaches.get(id);
  if (e && ahora < e.hasta) return e.cv;
  const lado = K.cara + 12;
  const cv = e ? e.cv : document.createElement('canvas');
  cv.width = lado; cv.height = lado;
  const g = cv.getContext('2d');
  g.beginPath(); g.arc(lado / 2, lado / 2, K.cara / 2 + 2, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();   // el contorno blanco grueso
  g.save(); g.beginPath(); g.arc(lado / 2, lado / 2, K.cara / 2 - 1, 0, Math.PI * 2); g.clip(); g.fillStyle = '#ffeaf6'; g.fill();
  ppSlimeRepuestoOImagen(g, id, lado / 2, lado / 2 + 3, K.cara * 0.5, 0, 1);
  g.restore();
  const veces = (e ? e.veces : 0) + 1;
  ppAmigosMapaCaches.set(id, { cv, veces, hasta: veces < 4 ? ahora + 1500 : Infinity });
  return cv;
}
function ppAmigosMapaPinta(c, puestos, porCodigo) {
  const lado = PP_AMIGOS_MAPA.cara + 12;
  for (const p of puestos) {
    const a = porCodigo.get(p.codigo);
    c.drawImage(ppAmigosMapaCara(ppAmigosMapaPersonaje(a)), p.x - lado / 2, p.y - lado / 2);
    const nombre = p.nombre && a ? ppAmigosMapaCorto(a.nombre) : '';
    if (nombre) ppTexto(c, nombre, Math.max(40, Math.min(500, p.x)), p.y + lado / 2 + 2, 16, '#fff', 'center', '#c43a84');
  }
}
function ppPintaAmigosMapa(c, m, dif, t) {
  if (dif || typeof ppAmigosActivo !== 'function' || !ppAmigosActivo()) return;
  if (typeof PP_AMIGOS_SRV === 'undefined' || typeof PP_AMIGOS_SRV.ultimo !== 'function') return;
  const l = PP_AMIGOS_SRV.ultimo();
  if (!l || !Array.isArray(l.amigos) || !l.amigos.length) return;
  const grupos = PP_AMIGOS_REGLAS.carasMapa(l.amigos, m, PP_AMIGOS_MAPA.porNivel);
  const N = PP_MUNDOS[m].niveles;
  const puestos = ppAmigosMapaPuestos(grupos.filter(g => g.nivel < N), ppNivelPos, PP_V.H);
  ppAmigosMapaPinta(c, puestos, new Map(l.amigos.map(a => [a.codigo, a])));
}
if (typeof module !== 'undefined') module.exports = { ppAmigosMapaPuestos, ppAmigosMapaCorto, ppAmigosMapaPersonaje };
