// Fans of Pop · TABLERO: la lógica del pop-it (sin dibujo). Desde la fase 1 de los mundos (30-10-2026) es POP-IT PURO: tocar
// una burbuja revienta ella y sus vecinas (arriba, abajo, izquierda y derecha) que sigan levantadas, y lo reventado se queda
// reventado. Las DOBLES (mundo 2, con nata) necesitan dos golpes: el primero las deja normales; las TRIPLES (con cereza), tres.
// Las de HIELO solo revientan si las tocas a ellas y las CONCHAS, al tocarlas, solo revientan ellas (mundos 3 a 6). El nivel se pasa reventándolas
// todas antes de gastar los toques; el mínimo posible (las 3 estrellas) y el límite vienen del generador (js/niveles.js).
'use strict';
// el tablero de un nivel `d` (de ppNivel). `fx.equipo`: los amigos que ya tienes (no salen atrapados).
function ppNuevoTablero(d, fx) {
  const n = d.lado;
  const T = { d, tipo: d.jefe ? 'jefe' : 'sala', n, mask: d.mask, esp: d.esp || null, nim: null, up: Uint8Array.from(d.need), sol: new Set(d.opt), slimes: {}, trampas: new Set(),
    toques: 0, pops: 0, pista: null, combo: 0, gratis: 0, mano: false, hecho: false, minimo: d.opt.length, limite: d.limite };
  // el amigo atrapado vive en una burbuja levantada (se ve dentro); siempre el mismo sitio para el mismo nivel
  if (d.amigos) {
    const libres = PP_SLIME_IDS.filter(id => !fx.equipo.includes(id));
    const sitios = [...T.up.keys()].filter(i => T.up[i]);
    // en los mundos 3 a 6 sale SU amigo nuevo (si aún no lo tienes); en los primeros, uno de los que te faltan
    const suyo = [null, null, 'copito', 'medusa', 'algodon', 'nubecita'][d.mundo];
    if (libres.length && sitios.length) T.slimes[sitios[(d.g * 7) % sitios.length]] = suyo && libres.includes(suyo) ? suyo : libres[d.g % libres.length];
  }
  if (fx.pista) ppPista(T);
  return T;
}
// lo que revienta tocar i (con las de hielo y las conchas de los mundos 3 a 6: ppEfecto en niveles.js)
const ppVecinas = (T, i) => ppEfecto(T.n, T.mask, T.esp, i);
function ppResuelto(T) { for (let i = 0; i < T.up.length; i++) if (T.up[i]) return false; return true; }
// las estrellas: 3 con el mínimo posible de toques, 2 a medio camino entre el mínimo y el límite, 1 si lo pasas justo
// en un nivel duelo (js/nimnivel.js): 3 sin ningún error, 2 con uno, 1 con más
function ppEstrellas(T) { if (T.nim) return 3 - Math.min(2, T.nim.errores); return T.toques <= T.minimo ? 3 : T.toques <= T.minimo + Math.ceil((T.limite - T.minimo) / 2) ? 2 : 1; }
function ppPista(T) { const s = [...T.sol]; T.pista = s.length ? s[Math.floor(Math.random() * s.length)] : null; }
// un toque. `slime` = lo da un amigo (no cuenta ni rompe el combo). Devuelve qué ha pasado para partida.js:
// pops (las que han reventado), grietas (las dobles que pasan a normales), si está resuelto y si se han acabado los toques.
function ppToca(T, i, slime = false) {
  if (T.hecho || !T.mask[i]) return null;
  const pops = [], grietas = [];
  for (const j of ppVecinas(T, i)) if (T.up[j] > 0) { T.up[j]--; (T.up[j] ? grietas : pops).push(j); }
  let libre = slime;
  if (!slime) { if (T.gratis > 0) { T.gratis--; libre = true; } else T.toques++; }
  T.pops += pops.length;
  const golpes = pops.length + grietas.length;
  if (!slime) T.combo = golpes >= 3 ? T.combo + 1 : 0;
  T.hecho = ppResuelto(T);
  // lo que falta, con el mínimo de toques: para la pista de Lola, la manita y los amigos que saltan
  T.sol = new Set(T.hecho ? [] : ppOptimo(T.n, T.mask, Array.from(T.up), 80000, T.esp));
  if (T.pista !== null && !T.sol.has(T.pista)) T.pista = null;
  const sinToques = !T.hecho && T.toques >= T.limite && T.gratis === 0;
  return { pops, grietas, subes: [], castigo: 0, hecho: T.hecho, libre, slime, golpes, sinToques };
}
