// Fans of Pop · PRUEBA DE RENDIMIENTO, lo que se manda al servidor (tarea 404; dominio puro): de una tanda guardada por js/banco-juego.js monta
// el p_datos de enviar_rendimiento_tanda (servidor/203-rendimiento-tandas.sql): recorta los pasos a lo que cabe, deja en null lo que se sale de rango
// (el servidor rechaza la tanda entera por un solo dato fuera de rango) y elige origen. Sin DOM, reloj ni red: la plataforma y alfa se las da js/banco-envio.js.
'use strict';
const PP_BANCO_ENVIO_DATOS = (() => {
  const MAX_PASOS = 30000;   // caracteres de los pasos como texto (lo que admite el servidor)
  const enRango = (v, min, max) => (typeof v === 'number' && isFinite(v) && v >= min && v <= max ? v : null);
  // los pasos que caben: se quitan los últimos hasta que el texto entra
  function recorta(pasos) {
    const lista = Array.isArray(pasos) ? pasos.slice() : [];
    while (lista.length && JSON.stringify(lista).length > MAX_PASOS) lista.pop();
    return lista;
  }
  const entero = (v, min, max) => { const n = enRango(v, min, max); return n === null ? null : Math.round(n); };
  // { juego:'pop', version, alfa, origen, corta, plataforma, ancho, alto, dpr, nucleos, memoria, cpu_frenada, pasos } o null si la tanda no vale
  function datos(tanda, { alfa, plataforma }) {
    if (!tanda || tanda.v !== 1 || !Array.isArray(tanda.pasos) || !tanda.pasos.length) return null;
    const a = tanda.aparato || {}, pasos = recorta(tanda.pasos);
    if (!pasos.length) return null;
    return {
      juego: 'pop', version: String(a.version == null ? '' : a.version).slice(0, 24), alfa: !!alfa, origen: a.origen === 'guion' ? 'guion' : 'panel',
      corta: !!a.corta, plataforma: plataforma === 'movil' ? 'movil' : 'pc',
      ancho: entero(a.ancho, 100, 10000), alto: entero(a.alto, 100, 10000), dpr: enRango(a.dpr, 0.5, 10),
      nucleos: entero(a.nucleos, 1, 256), memoria: enRango(a.memoria, 0, 999.99), cpu_frenada: entero(a.cpu, 1, 20), pasos,
    };
  }
  return Object.freeze({ MAX_PASOS, recorta, datos });
})();
if (typeof module !== 'undefined') module.exports = PP_BANCO_ENVIO_DATOS;
