// Fans of Pop · RESETEO DE UNA CUENTA DE PROBADOR (dominio; tarea #120, ADR 146): qué cambia en la partida de este móvil cuando la cuenta
// se resetea en el servidor (servidor/162), para que al recargar no vuelva nada de lo de antes. Funciones puras: sin SAVE, red ni dibujo.
// · recursos: lo que se tiene y lo comprado. Monedas, corazones, huecos, ayudas, bandejas, hucha, corazones infinitos, los packs ya
//   comprados y el pase premium. Las perlas, lo comprado del perfil y lo puesto los vacía PP_PERLAS.olvida (js/perlas-servidor.js).
// · progreso: el camino a medias, los niveles y sus estrellas, los amigos rescatados, los tutoriales vistos, Memoria, la racha, el pase, los primeros pasos y los mundos presentados (tarea #272)
//   (la partida vuelve a ser nueva: tarea #140).
// · todo: las dos cosas.
// No se tocan los duelos (el servidor tampoco: ni puntos ni PvP), el volumen y demás opciones, ni los cupos del día (regalo y anuncios).
// Los errores son resultados con nombre: que.
'use strict';
const PP_RESETEO = Object.freeze((() => {
  const QUE = Object.freeze(['recursos', 'progreso', 'todo']);
  const RECURSOS = Object.freeze(['monedas', 'vidas', 'vidaT', 'huecos', 'ayudas', 'bandejas', 'bandeja', 'hucha', 'infinitas', 'compras']);
  const PROGRESO = Object.freeze(['record', 'victorias', 'partidas', 'vistos', 'estrellas', 'tuto', 'run', 'mejor', 'cofres', 'dentro', 'memoria', 'fallos', 'racha', 'pase', 'primeros', 'estrenos', 'cole', 'mundos']);
  const QUITA_PROGRESO = Object.freeze(['marcasSubidas']);   // las marcas del ranking ya subidas: el servidor las ha puesto a cero
  // `nueva`: una partida recién creada (PP_NUEVA()); `partida`: la de ahora (solo se lee). Devuelve qué campos poner y cuáles quitar
  function cambios(que, nueva, partida) {
    if (!QUE.includes(que) || !nueva || typeof nueva !== 'object') return Object.freeze({ ok: false, error: 'que' });
    const recursos = que !== 'progreso', progreso = que !== 'recursos', pon = {};
    for (const k of [...(recursos ? RECURSOS : []), ...(progreso ? PROGRESO : [])]) pon[k] = nueva[k];
    const pase = partida && partida.pase;
    if (recursos && !progreso && pase && typeof pase === 'object') pon.pase = { ...pase, premium: false };   // el pase sigue; lo comprado, no
    return Object.freeze({ ok: true, recursos, progreso, pon: Object.freeze(pon), quita: progreso ? QUITA_PROGRESO : Object.freeze([]) });
  }
  return { QUE, RECURSOS, PROGRESO, cambios };
})());
if (typeof module !== 'undefined') module.exports = PP_RESETEO;
