// Fans of Pop · RAID, las BURBUJAS DOBLES (dominio puro, tarea 448, nodo n8; Pepins 28-11-2026: «más difícil»): en algunas zonas del tablero las
// burbujas necesitan DOS pops: el primero las deja «tocadas» y el segundo hace pop de verdad. Sin reloj, azar, SAVE ni DOM.
// · QUÉ ZONAS: cada trozo de 32x32 es doble o no según la SEMILLA de la raid, con el mismo generador de los cofres (mulberry32). ALGORITMO EXACTO
//   (el servidor lo repite en _pop_raid_doble, servidor/208-pop-raid-objetos.sql): se sacan 256 números seguidos de mulberry32(semilla), uno por
//   trozo en orden (0 a 255); el trozo es doble si su número mod `cada` es 0 (`cada` = PP_CFG.raid.dobles.cada: uno de cada 3).
// · LAS TOCADAS van en otro tablero de bits con el MISMO formato que PP_RAID_TABLERO (1 = ya recibió su primer pop), así que un trozo de tocadas
//   viaja igual que uno de vivas (128 bytes, base64). El bit se queda puesto aunque la burbuja ya no esté.
// · pop(): UN pop sobre una casilla. Vale igual para un toque, una bomba o un martillo: cada uno cuenta como un pop en cada burbuja que alcanza.
// Depende de PP_RAID_TABLERO y PP_RAID_COFRES (se cargan antes).
'use strict';
const PP_RAID_DOBLES = (() => {
  const T = PP_RAID_TABLERO;

  // qué trozos son zona doble: un Uint8Array de 256 (1 = doble). Una `cada` que no vale lanza Error (fallo de programación).
  function zonas(semilla, cada) {
    if (!Number.isInteger(cada) || cada < 1) throw new Error('dobles: `cada` debe ser un entero de 1 o más');
    const sig = PP_RAID_COFRES.mulberry32(semilla);
    return Uint8Array.from({ length: T.TROZOS }, () => (sig() % cada === 0 ? 1 : 0));
  }
  const sinZonas = () => new Uint8Array(T.TROZOS);
  const esZona = (z, x, y) => T.dentro(x, y) && z[T.trozoDe(x, y)] === 1;

  const crear = () => new Uint8Array(T.BYTES);        // el tablero de tocadas, vacío
  const tocada = (toc, x, y) => T.viva(toc, x, y);    // mismo formato de bits que las vivas
  function marcar(toc, x, y) {
    const b = T.bitDe(x, y);
    toc[b >> 3] |= 1 << (b & 7);
  }
  // cuántos pops aguanta aún la casilla: 0 (no hay burbuja), 1 (normal, o doble ya tocada) o 2 (doble entera)
  function aguante(tab, toc, z, x, y) {
    if (!T.viva(tab, x, y)) return 0;
    return esZona(z, x, y) && !tocada(toc, x, y) ? 2 : 1;
  }
  // un pop en (x, y): 'reventada' (ya no está), 'tocada' (era doble entera: le queda uno) o 'nada'
  function pop(tab, toc, z, x, y) {
    const a = aguante(tab, toc, z, x, y);
    if (a === 2) { marcar(toc, x, y); return 'tocada'; }
    if (a === 1) { T.reventar(tab, x, y); return 'reventada'; }
    return 'nada';
  }
  // un pop por cada casilla de la lista [[x, y], ...] (si una sale dos veces, recibe dos): { reventadas, tocadas }
  function aplica(tab, toc, z, celdas) {
    const res = { reventadas: [], tocadas: [] };
    for (const [x, y] of celdas) {
      const q = pop(tab, toc, z, x, y);
      if (q === 'reventada') res.reventadas.push([x, y]);
      else if (q === 'tocada') res.tocadas.push([x, y]);
    }
    return res;
  }
  return Object.freeze({ zonas, sinZonas, esZona, crear, tocada, marcar, aguante, pop, aplica });
})();
if (typeof module !== 'undefined') module.exports = PP_RAID_DOBLES;
