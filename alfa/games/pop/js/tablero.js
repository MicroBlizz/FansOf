// Fans of Pop · TABLERO: la lógica del pop-it (sin dibujo). Desde la fase 1 de los mundos (30-10-2026) es POP-IT PURO: tocar
// una burbuja revienta ella y sus vecinas (arriba, abajo, izquierda y derecha) que sigan levantadas, y lo reventado se queda
// reventado. Las DOBLES (mundo 2, con nata) necesitan dos golpes: el primero las deja normales; las TRIPLES (con cereza), tres.
// Las de HIELO solo revientan si las tocas a ellas y las CONCHAS, al tocarlas, solo revientan ellas (mundos 3 a 6). El nivel se pasa reventándolas
// todas antes de gastar los toques; el mínimo posible (las 3 estrellas) y el límite vienen del generador (js/niveles.js).
'use strict';
// QUIÉN SALE ATRAPADO en cada nivel con rescate (Pepins, 25-11-2026: lista fija, de común a legendario). Va en el orden de
// PP_MUNDOS[m].amigos (datos en js/regiones/): el Jardín da Becario, CrazyBunny y Cofre; la Pastelería, una COPIA al azar de uno que ya
// tienes (`copia`, como el cofre de estrellas) y el CEO; del mundo 3 al 10, el compañero de su tema, con el Astronauta al final.
// Antes el Jardín y la Pastelería sacaban al azar entre los que faltaban y se llevaban los de otros mundos (el Astronauta salía en el 2).
const PP_RESCATES = Object.freeze([['becario', 'bunny', 'cofre'], ['copia', 'ceo'], ['copito'], ['medusa'], ['algodon'], ['nubecita'], ['hada'], ['sirena'], ['maneki'], ['astro']]);
const ppRescateFijo = d => { const k = PP_MUNDOS[d.mundo].amigos.indexOf(d.l); return k < 0 ? null : (PP_RESCATES[d.mundo] || [])[k] || null; };
// el atrapado del nivel: el fijo si aún no lo tienes (si ya lo tienes, nadie); en el hueco `copia`, `fx.copia` (uno que ya tienes, con
// el flag `companeros`) o, sin colección, uno de los que no llevas. { id, copia } o null
function ppAtrapado(d, fx, libres) {
  const fijo = ppRescateFijo(d);
  if (fijo === 'copia') return fx.copia ? { id: fx.copia, copia: true } : libres.length ? { id: libres[d.g % libres.length], copia: false } : null;
  if (fijo) return libres.includes(fijo) ? { id: fijo, copia: false } : null;
  return libres.length ? { id: libres[d.g % libres.length], copia: false } : null;
}
// el tablero de un nivel `d` (de ppNivel). `fx.equipo`: los amigos que ya tienes (no salen atrapados); `fx.atrapables`, si llega, manda.
function ppNuevoTablero(d, fx) {
  const n = d.lado;
  const T = { d, tipo: d.jefe ? 'jefe' : 'sala', n, mask: d.mask, esp: d.esp || null, nim: null, lo: !!d.lo, up: Uint8Array.from(d.need), sol: new Set(d.opt), slimes: {}, trampas: new Set(),
    toques: 0, pops: 0, pista: null, combo: 0, gratis: 0, mano: false, hecho: false, minimo: d.opt.length, limite: d.limite };
  // el amigo atrapado vive en una burbuja levantada (se ve dentro); siempre el mismo sitio para el mismo nivel
  if (d.amigos) {
    // con el flag `companeros` abierto, `fx.atrapables`: los de rescate que aún no tienes en la colección (js/coleccion.js)
    const libres = fx.atrapables || PP_SLIME_IDS.filter(id => !fx.equipo.includes(id));
    const sitios = [...T.up.keys()].filter(i => T.up[i]), a = ppAtrapado(d, fx, libres);   // la lista fija (PP_RESCATES)
    if (a && sitios.length) { T.slimes[sitios[(d.g * 7) % sitios.length]] = a.id; T.rescateCopia = a.copia; }
  }
  if (fx.pista) ppPista(T);
  return T;
}
// lo que revienta tocar i (con las de hielo y las conchas de los mundos 3 a 6: ppEfecto en niveles.js)
const ppVecinas = (T, i) => ppEfecto(T.n, T.mask, T.esp, i);
function ppResuelto(T) { for (let i = 0; i < T.up.length; i++) if (T.up[i]) return false; return true; }
// las estrellas: 3 con el mínimo posible de toques, 2 a medio camino entre el mínimo y el límite, 1 si lo pasas justo
// (con el Imán de estrellas, T.iman, la 3.ª pide menos: js/habilidades.js); en un nivel duelo (js/nimnivel.js): 3 sin ningún error,
// 2 con uno, 1 con más
function ppEstrellas(T) { if (T.nim) return 3 - Math.min(2, T.nim.errores); return PP_HAB.estrellas(T.toques, T.minimo, T.limite, T.iman || 0); }
// con cohetes el orden importa (js/cohetes.js): la pista es el primer toque de la solución, el que no levanta nada; sin ellos, uno al azar
const ppSolEnOrden = T => PP_COHETES.hay(T.esp);
function ppPista(T) { const s = [...T.sol]; T.pista = s.length ? s[ppSolEnOrden(T) ? 0 : Math.floor(Math.random() * s.length)] : null; }
// un toque. `slime` = lo da un amigo (no cuenta ni rompe el combo). Devuelve qué ha pasado para partida.js:
// pops (las que han reventado), grietas (las dobles que pasan a normales), subes (las que levanta un cohete), si está resuelto y si se
// han acabado los toques.
function ppToca(T, i, slime = false) {
  if (T.hecho || !T.mask[i]) return null;
  if (T.lo) return ppTocaLO(T, i, slime);   // modo pesadilla
  // los toques gratis de un compañero (`slime`) apagan los cohetes: revientan sin levantar su fila (Hada, tarea 349; js/cohetes.js)
  const { pops, grietas, subes } = PP_COHETES.aplica(T.n, T.mask, T.esp, T.up, ppVecinas(T, i), slime);
  let libre = slime;
  if (!slime) { if (T.gratis > 0) { T.gratis--; libre = true; } else T.toques++; }
  T.pops += pops.length;
  const golpes = pops.length + grietas.length;
  if (!slime) T.combo = golpes >= 3 ? T.combo + 1 : 0;
  T.hecho = ppResuelto(T);
  // lo que falta, con el mínimo de toques: para la pista de Lola, la manita y los amigos que saltan
  T.sol = new Set(T.hecho ? [] : ppOptimo(T.n, T.mask, Array.from(T.up), 80000, T.esp));
  if (T.pista !== null && (!T.sol.has(T.pista) || (ppSolEnOrden(T) && T.pista !== [...T.sol][0]))) T.pista = null;
  const sinToques = !T.hecho && T.toques >= T.limite && T.gratis === 0;
  return { pops, grietas, subes, castigo: 0, hecho: T.hecho, libre, slime, golpes, sinToques };
}
// MODO PESADILLA («Lights Out», el primer boceto): tocar le da la vuelta a la burbuja y a sus vecinas; las hundidas vuelven a subir.
// La solución que queda se lleva al día como en el prototipo: tocar una de la solución la quita; tocar otra, la añade.
function ppTocaLO(T, i, slime) {
  const pops = [], subes = [];
  for (const j of ppCruz(T.n, T.mask, i)) { T.up[j] ^= 1; (T.up[j] ? subes : pops).push(j); }
  let libre = slime;
  if (!slime) { if (T.gratis > 0) { T.gratis--; libre = true; } else T.toques++; }
  T.pops += pops.length;
  if (!slime) T.combo = pops.length > subes.length && pops.length >= 3 ? T.combo + 1 : 0;
  if (T.sol.has(i)) T.sol.delete(i); else T.sol.add(i);
  T.hecho = ppResuelto(T);
  if (T.hecho) T.sol = new Set();
  if (T.pista !== null && !T.sol.has(T.pista)) T.pista = null;
  const sinToques = !T.hecho && T.toques >= T.limite && T.gratis === 0;
  return { pops, grietas: [], subes, castigo: 0, hecho: T.hecho, libre, slime, golpes: pops.length, sinToques };
}
