// Fans of Pop · CORAZONES ENTRE AMIGOS, reglas del buzón (dominio; tarea #96, ADR 150): cuántos corazones caben al recoger, el código y
// el enlace fijo ?corazon=CÓDIGO, y a qué caso de pantalla lleva lo que contesta el servidor. Funciones puras: sin reloj, azar, SAVE, red ni dibujo.
// Los fallos de reglas son resultados con nombre ({ ok:false, error }); caso() devuelve siempre un texto con nombre.
'use strict';
const PP_CORAZONES_REGLAS = Object.freeze((() => {
  const TOPE_DIA = 5;   // corazones que se pueden recibir al día (lo manda el servidor; aquí solo se avisa)
  const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const CODIGO = new RegExp(`^[${ALFABETO}]{8}$`);
  const NOMBRE_MAX = 14;
  const MOTIVOS = Object.freeze(['sin_sesion', 'cerrado', 'no_existe', 'propio', 'ya_hoy', 'tope', 'sin_red', 'servidor']);
  const ok = v => Object.freeze({ ok: true, ...v });
  const error = e => Object.freeze({ ok: false, error: e });
  // entero >= 0 o 0 si no es un número válido
  const entero = n => (typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0);
  const objeto = x => (x && typeof x === 'object' ? x : {});
  // cuántos corazones caben ahora (nunca negativo ni más que max; con vidas o max inválidos, 0)
  function caben(vidas, max, infinitas) {
    if (infinitas === true || typeof vidas !== 'number' || !Number.isFinite(vidas)) return 0;
    return Math.max(0, entero(max) - entero(vidas));
  }
  // cuántos de los pendientes del buzón se recogen: los que caben
  function aRecoger(pendientes, vidas, max, infinitas) {
    return Math.min(entero(pendientes), caben(vidas, max, infinitas));
  }
  // un código de enlace: sin espacios, en mayúsculas y de 8 letras del alfabeto sin I, O, 0 ni 1
  function codigo(texto) {
    const c = typeof texto === 'string' ? texto.trim().toUpperCase() : '';
    return CODIGO.test(c) ? ok({ codigo: c }) : error('no_existe');
  }
  // el código de una cadena de búsqueda (location.search), normalizado, o null
  function deUrl(search) {
    const m = typeof search === 'string' ? /[?&]corazon=([^&#]*)/.exec(search) : null;
    const r = m ? codigo(m[1]) : null;
    return r && r.ok ? r.codigo : null;
  }
  // el enlace fijo de quien pide: base (origen y ruta, sin query ni ancla) + ?corazon=CÓDIGO
  function enlace(base, cod) {
    const limpia = String(base).split('#')[0].split('?')[0];
    return `${limpia}?corazon=${cod}`;
  }
  // a qué caso de pantalla lleva la respuesta del servidor (a quien o regalar): un texto con nombre
  function caso(respuesta) {
    const r = objeto(respuesta);
    if (r.ok === false) return MOTIVOS.includes(r.motivo) ? r.motivo : 'servidor';
    if (r.ok !== true) return 'servidor';
    if (r.propio) return 'propio';
    if (r.ya_hoy) return 'ya_hoy';
    if (r.lleno) return 'tope';
    return 'puede';
  }
  const nombre = n => {
    const t = typeof n === 'string' ? Array.from(n.trim()).slice(0, NOMBRE_MAX).join('') : '';
    return t || null;
  };
  const regalo = g => {
    const x = objeto(g);
    if (!Number.isInteger(x.id)) return null;
    const creado = typeof x.creado === 'string' || (typeof x.creado === 'number' && Number.isFinite(x.creado)) ? x.creado : null;
    return Object.freeze({ id: x.id, nombre: nombre(x.nombre), creado });
  };
  // la respuesta del buzón, limpia: { regalos: [{ id, nombre, creado }], hoy }; acepta { regalos } o la lista suelta; ante basura, vacío
  function buzon(respuesta) {
    const r = objeto(respuesta);
    const lista = Array.isArray(respuesta) ? respuesta : r.regalos;
    const regalos = r.ok === false || !Array.isArray(lista) ? [] : lista.map(regalo).filter(Boolean);
    return Object.freeze({ regalos: Object.freeze(regalos), hoy: entero(r.hoy) });
  }
  return { TOPE_DIA, ALFABETO, caben, aRecoger, codigo, deUrl, enlace, caso, buzon };
})());
if (typeof module !== 'undefined') module.exports = PP_CORAZONES_REGLAS;
