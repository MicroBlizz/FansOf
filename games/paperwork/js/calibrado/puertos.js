// Fans Of Paperwork · calibrado · PUERTOS DE MENTIRA para jugar partidas sin pantalla (tests en Node y el panel de calibrado de /gestion, en un
// worker): un azar con semilla (la misma semilla da la misma partida), un reloj que se adelanta a mano, un guardado en memoria y unos retos
// que solo cuentan. El juego no carga este archivo. ADR 122.
'use strict';
PW.calibrado = PW.calibrado || {};
PW.calibrado.puertos = {
  // mulberry32: repetible y rápido
  azar(semilla = 1) {
    let a = semilla >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },
  reloj(t0 = Date.UTC(2026, 10, 15)) {
    let t = t0;
    return { ahora: () => t, adelanta: s => { t += s * 1000; } };
  },
  // guarda en memoria lo último (sin copiar: aquí nadie lo vuelve a leer)
  almacen() {
    let json = null;
    return { cargaPartida: () => json, guardaPartida: j => { json = j; }, guardaCopia: () => {} };
  },
  retos() { return { evento() {}, maximo() {} }; },
};
