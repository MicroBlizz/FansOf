// Fans of Pop · LOS COMBOS (tarea 396, ADR 234; reglas en js/combo-reglas.js, servidor en js/combo-servidor.js). Pepins, 26-11-2026: sacar
// partido a los combos de los niveles. Todo en PP_COMBO, tras el flag 'combos':
// · toque(T, bueno): tras cada toque tuyo (js/partida.js). Desde COMBO x3 da monedas (con tope al día) y puntos para el ranking de la
//   semana, en Pesadilla el doble; apunta tu mejor combo del nivel (T.comboMax) y si has batido tu récord (T.comboRecord); cuenta para
//   las misiones del Pase (js/pase-nuevo.js) y para los logros de combo de aquí (LOGROS).
// · sube(): sube tus puntos si el servidor aún no los tiene (también lo que quedó de la semana anterior): sola, 4 s tras el último combo, y
//   desde ppSubeMarcas (js/ranking.js); sin red, quedan para luego.
// · ranking(lunes): el de esa semana tras subir lo tuyo, para la pestaña «Combos» (js/ranking.js). lunes(): el lunes de esta semana.
// · logros(): la lista de logros para la ventana del Pase (js/combos-vista.js) y cobrar(id); titulos(): los logros ya conseguidos, que
//   dan los títulos de perfil que no se compran (js/perfil-catalogo.js, `logro`).
// El día es el de España con el reloj de confianza (HORA). Lo de la semana se guarda en SAVE.combo; los logros, en SAVE.comboLogros.
'use strict';
const PP_COMBO = (() => {
  const srv = PP_COMBO_SERVIDOR.crea({ rpc: (n, a) => CUENTA.rpc(n, a), hay: () => ppHayRanking() });
  let subida = null, espera = 0;   // la subida en marcha (una a la vez) y el reloj de la próxima
  const ESPERA_SUBIR = 4000;   // ms tras el último combo antes de subir los puntos
  const activo = () => NUCLEO.flag('combos', 'Pop: premios, misiones, logros y ranking semanal de combos (tarea 396)', false);
  const dia = () => new Date(typeof HORA !== 'undefined' ? HORA.ahora() : Date.now()).toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
  const lunes = () => PP_COMBOS_R.lunes(dia());
  // los logros, para siempre (RETOSL de core: se miden contra el total o el máximo de toda la vida)
  const DEF_LOGROS = Object.freeze([
    { id: 'x5', txt: 'Haz un COMBO x5', goal: 5, ev: 'comboMax', r: { monedas: 50 } },
    { id: 'cien', txt: 'Haz 100 combos', goal: 100, ev: 'combos', r: { monedas: 100 } },
    { id: 'x8', txt: 'Haz un COMBO x8', goal: 8, ev: 'comboMax', r: { titulo: 'Combo infinito' } },
    { id: 'p5', txt: 'Haz un COMBO x5 en Pesadilla', goal: 5, ev: 'comboMaxP', r: { titulo: 'Pesadilla en cadena' } },
  ]);
  const LOGROS = RETOSL.crear({
    save: () => { SAVE.comboLogros = SAVE.comboLogros || {}; return SAVE.comboLogros; },
    guardar: () => ppGuarda(),
    pagar: r => { if (r.monedas) SAVE.monedas += r.monedas; },
    diarias: [], semanales: [], nDiarias: 0, nSemanales: 0,
    logros: DEF_LOGROS,
  });

  // lo que cuenta un paso de combo para misiones y logros: un combo «cuenta» al llegar a x3
  function cuenta(n, lo) {
    if (n === 3) { LOGROS.evento('combos', 1); if (ppPaseNuevo()) ppPaseMision('combo3'); }
    if (n === 4 && ppPaseNuevo()) ppPaseMision('combo4');
    LOGROS.maximo('comboMax', n);
    if (lo) LOGROS.maximo('comboMaxP', n);
  }
  function toque(T, bueno) {
    if (!activo() || T.nim || !bueno) return;
    T.comboMax = Math.max(T.comboMax || 0, T.combo);
    if (T.combo < 3) return;
    const r = PP_COMBOS_R.paso(SAVE.combo, dia(), T.combo, T.lo, PP_CFG.combos.topeDia);
    SAVE.combo = r.estado; SAVE.monedas += r.monedas;
    if (r.record) T.comboRecord = true;
    if (r.monedas) ppFlota('+' + r.monedas, 270, 330, '#ffb000');
    cuenta(T.combo, T.lo);
    ppGuarda();
    clearTimeout(espera); espera = setTimeout(sube, ESPERA_SUBIR);   // los puntos suben solos al poco del último combo
  }

  // sube lo pendiente, de uno en uno: primero lo que quedó de la semana anterior y luego lo de esta. Sin red, se queda para luego;
  // lo que el servidor no quiere (no_vale) se da por subido para no repetirlo siempre
  function sube() {
    if (!activo()) return Promise.resolve(null);
    if (subida) return subida.then(() => sube());   // tras la que está en marcha, por si ya hay más puntos
    const [p] = PP_COMBOS_R.pendientes(PP_COMBOS_R.deHoy(SAVE.combo, dia()));
    if (!p) return Promise.resolve(null);
    subida = srv.sube(p.lunes, p.puntos).then(r => {
      if (r.ok || r.error === 'no_vale') { SAVE.combo = PP_COMBOS_R.trasSubir(PP_COMBOS_R.deHoy(SAVE.combo, dia()), p.lunes, p.puntos); ppGuarda(); }
      if (r.ok) PP_RANK.datos = {};
      return r;
    }).finally(() => { subida = null; });
    return subida.then(r => (r.ok || r.error === 'no_vale' ? sube().then(() => r) : r));
  }
  // el ranking de una semana, después de subir lo tuyo (así te ves con tus puntos de ahora)
  const ranking = semana => sube().then(() => srv.ranking(semana));

  const logros = () => LOGROS.lista('l');
  const cobrar = id => LOGROS.cobrar('l', id);
  // los logros ya conseguidos, para los títulos del perfil: se leen del total guardado, sin tocar nada (lo llama el dibujo del perfil)
  function titulos() {
    const total = (SAVE.comboLogros && SAVE.comboLogros.retos && SAVE.comboLogros.retos.total) || {};
    return Object.fromEntries(DEF_LOGROS.filter(l => (total[l.ev] || 0) >= l.goal).map(l => [l.id, true]));
  }
  return Object.freeze({ activo, lunes, toque, sube, ranking, logros, cobrar, titulos });
})();
