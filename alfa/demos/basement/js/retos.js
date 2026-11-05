// Fans of Basement · Retos: misiones diarias y semanales y logros (los DATOS y las firmas). El sistema es común:
// core/js/sistema/retos-ligero.js (RETOSL). Se pagan en monedas y se guardan en SAVE.retos (guardado.js). La pantalla está en
// retos-ui.js y los avisos los da principal.js al terminar cada bajada y en la mesa: bajada, salvo, bajas, jefes, rescatados,
// muebles, materiales, habilidad, combo, final, taller, paquete, y los máximos profundidad y cargo.
'use strict';
const RETOS_BAS = {
  diarias: [
    { id: 'd-b3', txt: 'Baja 3 veces', goal: 3, ev: 'bajada', r: 40 },
    { id: 'd-s2', txt: 'Sube a salvo 2 veces', goal: 2, ev: 'salvo', r: 50 },
    { id: 'd-k60', txt: 'Tumba 60 bichos', goal: 60, ev: 'bajas', r: 50 },
    { id: 'd-k150', txt: 'Tumba 150 bichos', goal: 150, ev: 'bajas', r: 90 },
    { id: 'd-m5', txt: 'Rompe 5 muebles', goal: 5, ev: 'muebles', r: 50 },
    { id: 'd-r2', txt: 'Rescata 2 becarios', goal: 2, ev: 'rescatados', r: 60 },
    { id: 'd-h3', txt: 'Usa tu habilidad 3 veces', goal: 3, ev: 'habilidad', r: 40 },
    { id: 'd-j1', txt: 'Vence a un jefe', goal: 1, ev: 'jefes', r: 80 },
  ],
  semanales: [
    { id: 's-b15', txt: 'Baja 15 veces', goal: 15, ev: 'bajada', r: 250 },
    { id: 's-k800', txt: 'Tumba 800 bichos', goal: 800, ev: 'bajas', r: 300 },
    { id: 's-mat', txt: 'Trae 150 materiales a salvo', goal: 150, ev: 'materiales', r: 300 },
    { id: 's-j5', txt: 'Vence a 5 jefes', goal: 5, ev: 'jefes', r: 350 },
    { id: 's-c3', txt: 'Forma 3 combos', goal: 3, ev: 'combo', r: 250 },
  ],
  logros: [
    { id: 'l-salvo', txt: 'Sube a salvo por primera vez', goal: 1, ev: 'salvo', r: 30 },
    { id: 'l-p10', txt: 'Llega a la planta -10', goal: 10, ev: 'profundidad', r: 100 },
    { id: 'l-p20', txt: 'Llega a la planta -20', goal: 20, ev: 'profundidad', r: 250 },
    { id: 'l-final', txt: 'Arregla el servidor', goal: 1, ev: 'final', r: 500 },
    { id: 'l-p40', txt: 'Llega a la planta -40 del Legacy', goal: 40, ev: 'profundidad', r: 600 },
    { id: 'l-cargo', txt: 'Asciende a Senior', goal: 2, ev: 'cargo', r: 300 },
    { id: 'l-k1000', txt: 'Tumba 1.000 bichos', goal: 1000, ev: 'bajas', r: 150 },
    { id: 'l-j10', txt: 'Vence a 10 jefes', goal: 10, ev: 'jefes', r: 200 },
    { id: 'l-taller', txt: 'Fabrica 5 cosas en el taller', goal: 5, ev: 'taller', r: 150 },
    { id: 'l-r20', txt: 'Rescata 20 becarios', goal: 20, ev: 'rescatados', r: 150 },
    { id: 'l-secreto', txt: 'Vence a un jefe secreto', goal: 1, ev: 'secretos', r: 300 },
    { id: 'l-secretos', txt: 'Vence a 3 jefes secretos', goal: 3, ev: 'secretos', r: 800 },
  ],
};
// Las firmas que pide el sistema común: dónde se guarda (SAVE.retos) y en qué se paga (monedas del progreso).
const BAS_RETOS = RETOSL.crear({
  save: () => SAVE, guardar: () => basGuarda(),
  pagar: (r) => { SAVE.progreso = { ...BAS.copiaProgreso(SAVE.progreso), monedas: SAVE.progreso.monedas + r }; },
  diarias: RETOS_BAS.diarias, semanales: RETOS_BAS.semanales, logros: RETOS_BAS.logros, nDiarias: 3, nSemanales: 2,
});

// Los avisos de una bajada terminada (su resultado, bajada.js: terminar). Los materiales solo cuentan si subes a salvo.
function basRetosBajada(r) {
  const R = BAS_RETOS, n = (v) => Math.max(0, Math.floor(v || 0));
  R.evento('bajada', 1);
  if (r.como === 'ascensor') R.evento('salvo', 1);
  for (const [ev, v] of [['bajas', r.bajas], ['jefes', r.jefes], ['rescatados', r.rescatados], ['muebles', r.muebles], ['habilidad', r.habilidades], ['combo', r.combos], ['secretos', r.secretos],
    ['materiales', Object.values(r.materiales || {}).reduce((s, x) => s + x, 0)], ['final', r.final ? 1 : 0]]) R.evento(ev, n(v));
  R.maximo('profundidad', n(r.planta));
}
