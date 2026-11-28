// Fans of Pop · RAID, los OBJETOS (dominio puro, tarea 448, nodo n8; Pepins 28-11-2026): las tres ayudas del juego que valen en la raid y qué
// casillas alcanza cada cosa que se hace en el tablero. Sin reloj, azar, SAVE ni DOM; las cifras entran por parámetro (cfg = PP_CFG.raid.objetos).
// · 'toques3': mete cfg.toques3 toques en el depósito (PP_RAID_DEPOSITO.meter), aunque esté lleno.
// · 'bomba': un pop en cada burbuja de un cuadrado de cfg.bomba de lado centrado en la casilla; no gasta toque.
// · 'martillo': un pop en cada burbuja de una fila de cfg.martillo de ancho centrada en la casilla; no gasta toque. Contra el jefe CEO (sin
//   casilla) le quita cfg.martilloJefe de vida.
// · El TOPE: el servidor no sabe cuántos objetos tiene el jugador (el inventario vive en el móvil), así que cada jugador puede usar como mucho
//   cfg.tope de cada tipo por raid. Pasarse es un resultado con nombre ('tope_objetos'), no un error, y solo se salta ese objeto (admite).
// · POR LA RED un objeto viaja como lista: ['toques3'], ['bomba', x, y], ['martillo', x, y] o ['martillo'] (al jefe).
// Depende de PP_RAID_TABLERO (se carga antes).
'use strict';
const PP_RAID_OBJETOS = (() => {
  const T = PP_RAID_TABLERO;
  const TIPOS = Object.freeze(['toques3', 'bomba', 'martillo']);
  const CRUZ = Object.freeze([[0, 0], [0, -1], [0, 1], [-1, 0], [1, 0]]);   // el toque de siempre: la casilla y sus 4 vecinas
  const dentro = lista => lista.filter(([x, y]) => T.dentro(x, y));
  const desde = (centro, largo) => centro - Math.floor((largo - 1) / 2);

  const cruz = (x, y) => dentro(CRUZ.map(([dx, dy]) => [x + dx, y + dy]));
  function cuadrado(x, y, lado) {
    const lista = [];
    for (let j = 0; j < lado; j++) for (let i = 0; i < lado; i++) lista.push([desde(x, lado) + i, desde(y, lado) + j]);
    return dentro(lista);
  }
  const fila = (x, y, ancho) => dentro(Array.from({ length: ancho }, (_, i) => [desde(x, ancho) + i, y]));
  // las casillas que alcanza una acción { k: 'toque' | 'bomba' | 'martillo', x, y } (las que caen dentro del tablero)
  function celdas(a, cfg) {
    if (!T.dentro(a.x, a.y)) return [];
    if (a.k === 'bomba') return cuadrado(a.x, a.y, cfg.bomba);
    if (a.k === 'martillo') return fila(a.x, a.y, cfg.martillo);
    return cruz(a.x, a.y);
  }

  const cero = () => ({ toques3: 0, bomba: 0, martillo: 0 });
  // cuántos hay de cada tipo en una lista de tipos (lo que no es un objeto no cuenta)
  function cuenta(tipos) {
    const c = cero();
    for (const k of tipos) if (TIPOS.includes(k)) c[k]++;
    return c;
  }
  const suma = (a, b) => ({ toques3: a.toques3 + b.toques3, bomba: a.bomba + b.bomba, martillo: a.martillo + b.martillo });
  const hay = c => c.toques3 + c.bomba + c.martillo > 0;
  // ¿caben `nuevos` encima de los `usados` sin pasar del tope de cada tipo?
  function cabe(usados, nuevos, tope) {
    return TIPOS.every(k => usados[k] + nuevos[k] <= tope) ? { ok: true } : { ok: false, motivo: 'tope_objetos' };
  }
  // qué objetos de la lista entran, en orden, sin pasar del tope de cada tipo encima de los `usados`: { si: [...], no: [[objeto, 'tope_objetos'], ...] }.
  // Lo que no entra se salta solo: el resto de la tanda vale igual (servidor/208, PP_RAID_SERVIDOR_LOCAL)
  function admite(usados, objetos, tope) {
    const c = { ...cero(), ...usados }, si = [], no = [];
    for (const o of objetos) {
      if (c[o[0]] + 1 > tope) { no.push([o, 'tope_objetos']); continue; }
      c[o[0]]++;
      si.push(o);
    }
    return { si, no };
  }
  // ¿es un objeto bien formado tal y como viaja por la red?
  function valido(o) {
    if (!Array.isArray(o) || !TIPOS.includes(o[0])) return false;
    if (o.length === 1) return o[0] !== 'bomba';
    return o.length === 3 && o[0] !== 'toques3' && T.dentro(o[1], o[2]);
  }
  const alJefe = o => o.length === 1 && o[0] === 'martillo';

  return Object.freeze({ TIPOS, celdas, cero, cuenta, suma, hay, cabe, admite, valido, alJefe });
})();
if (typeof module !== 'undefined') module.exports = PP_RAID_OBJETOS;
