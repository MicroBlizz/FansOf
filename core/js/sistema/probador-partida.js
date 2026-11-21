// Fans Of · PROBADOR_PARTIDA: qué queda de la partida de este navegador cuando una cuenta de probador se resetea en un juego (ADR 146).
// Para los juegos que llevan la partida de core (SAVE y newSave: Rumble, TD, Survivors). El servidor ya está reseteado (servidor/162): aquí se
// deja la copia local igual que él, para que al recargar no vuelva lo borrado ni suba otra vez a la nube.
// · PROBADOR_PARTIDA.tras(save, que, nueva, propio) es pura: devuelve la partida que queda, sin tocar la que recibe. `nueva` es la partida
//   recién estrenada del juego (su newSave()): cada clave que se resetea toma su valor de ahí, o se borra si una partida nueva no la trae.
// · Core clasifica las claves que pone core (RECURSOS, PROGRESO, SIEMPRE); cada juego declara las suyas en AJUSTES.probador =
//   { recursos: [...], progreso: [...] }. Una clave con punto es un campo de dentro ('pass.prem', 'ads.noAds').
// · El saldo (gold, gems, tickets) no se toca aquí: con «recursos» lo pone core con lo que devuelve el servidor (probador.js).
// · No se tocan: ajustes, nombre, avatar, los relojes y topes del día (giftDay, gratisT, gratisD, idle), el pase PvP ni nada de PvP.
// Al final, el gancho 'probador-reseteo' para los juegos que declaran AJUSTES.probador. Tests: tests/core/probador-partida.test.mjs.
'use strict';
const PROBADOR_PARTIDA = {};
// con «recursos»: lo que el servidor borra de inventario, cartas, garantía y compras (el pase premium y lo de la tienda de gemas)
PROBADOR_PARTIDA.RECURSOS = Object.freeze(['units', 'inv', 'invSeq', 'abEquip', 'equip', 'pity', 'fijos', 'pass.prem']);
// con «progreso»: los puntos y cobros del pase (premium se queda: es una compra), la racha de días (el día del último cobro se queda, como
// en el servidor), misiones, estadísticas y logros
PROBADOR_PARTIDA.PROGRESO = Object.freeze(['pass.xp', 'pass.free', 'pass.paid', 'login.day', 'login.best', 'daily', 'weekly', 'stats', 'achC', 'achR', 'dayMark']);
// con cualquiera de los dos: el modo pruebas (su copia de la partida de antes se olvida en el gancho, y sin ella no se podría quitar)
PROBADOR_PARTIDA.SIEMPRE = Object.freeze(['testAll']);
// qué lista de SAVE.look llena cada tipo de artículo de la tienda de gemas (core/js/sistema/tienda-fija.js, entregas)
PROBADOR_PARTIDA.LOOK = Object.freeze({ marco: a => [['marcos', 'marco', [a.id]]], titulo: a => [['titulos', 'titulo', [a.id]]], frases: a => [['frases', 'frase', a.frases || []], ['emotes', 'emote', a.emotes || []]] });

(() => {
  const copia = v => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
  const esObjeto = v => !!v && typeof v === 'object' && !Array.isArray(v);
  // el objeto que contiene el último tramo de la ruta, o null si no existe
  function padre(raiz, tramos) {
    let o = raiz;
    for (const t of tramos.slice(0, -1)) { if (!esObjeto(o[t])) return null; o = o[t]; }
    return o;
  }
  // deja una clave como en una partida nueva; si esta no la trae, la borra. Un campo de dentro solo se toca si su padre existe
  function repone(save, nueva, ruta) {
    const tramos = ruta.split('.'), ultimo = tramos[tramos.length - 1], donde = padre(save, tramos), origen = padre(nueva, tramos);
    if (!donde) return;
    if (origen && origen[ultimo] !== undefined) donde[ultimo] = copia(origen[ultimo]); else delete donde[ultimo];
  }
  // lo comprado en la tienda de gemas sale del armario: lo que dan los artículos apuntados en save.fijos ('fijo:<id>'). Lo demás del
  // armario (lo de serie y lo ganado en los pases o en la mítica) se queda
  function quitaComprado(save, articulos) {
    const look = save.look;
    if (!esObjeto(look) || !Array.isArray(save.fijos)) return;
    for (const clave of save.fijos) {
      const a = articulos[String(clave).replace(/^fijo:/, '')], da = a && PROBADOR_PARTIDA.LOOK[a.tipo];
      for (const [lista, tipo, ids] of da ? da(a) : []) {
        if (Array.isArray(look[lista])) look[lista] = look[lista].filter(id => !ids.includes(id));
        if (Array.isArray(look.nuevos)) look.nuevos = look.nuevos.filter(n => !ids.some(id => n === tipo + ':' + id));
      }
    }
  }

  // save: la partida de ahora · que: 'recursos' | 'progreso' | 'todo' · nueva: newSave() del juego ·
  // propio: { recursos: [claves], progreso: [claves], articulos: AJUSTES.tiendaFija.articulos }. Con otro `que`, devuelve una copia igual
  PROBADOR_PARTIDA.tras = (save, que, nueva, propio = {}) => {
    const queda = copia(save), P = PROBADOR_PARTIDA, rutas = [];
    if (que === 'recursos' || que === 'todo') { quitaComprado(queda, propio.articulos || {}); rutas.push(...P.RECURSOS, ...(propio.recursos || [])); }
    if (que === 'progreso' || que === 'todo') rutas.push(...P.PROGRESO, ...(propio.progreso || []));
    if (rutas.length) rutas.push(...P.SIEMPRE);
    for (const r of rutas) repone(queda, nueva, r);
    return queda;
  };
})();

if (typeof module !== 'undefined') module.exports = PROBADOR_PARTIDA;
// El gancho: con el servidor ya reseteado y antes de recargar (probador.js, limpia). Solo en los juegos que llevan la partida de core y
// declaran AJUSTES.probador; los que tienen su propia partida (Rouflage, Paperwork, Pop) enganchan el suyo y aquí no pasa nada.
// La partida se cambia sin sustituir el objeto (hay quien guarda la referencia) y se guarda: así queda pendiente de subir a la nube
if (typeof window !== 'undefined' && typeof hook === 'function') hook('probador-reseteo', (que, lugar) => {
  const propio = typeof AJUSTES !== 'undefined' && AJUSTES.probador;
  if (!propio || typeof SAVE === 'undefined' || !SAVE || typeof newSave !== 'function') return;
  if (typeof PRUEBAS_COPIA !== 'undefined') lugar.olvida(PRUEBAS_COPIA);   // la partida de antes del modo pruebas no puede volver
  if (que === 'todo') return;   // la partida entera ya la borra core
  const articulos = (AJUSTES.tiendaFija && AJUSTES.tiendaFija.articulos) || {};
  const queda = PROBADOR_PARTIDA.tras(SAVE, que, newSave(), { recursos: propio.recursos, progreso: propio.progreso, articulos });
  for (const k of Object.keys(SAVE)) delete SAVE[k];
  Object.assign(SAVE, queda);
  saveGame();
});
