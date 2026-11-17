// Fans Of · MEDIDOR DE ANUNCIOS (dominio): las reglas del medidor que premia a quien ve anuncios (ADR 123, docs/guia/core/anuncios.md).
// Un medidor por juego: cada anuncio visto suma puntos, recoger sin anuncio un premio que también se daba con anuncio resta unos pocos,
// y el nivel de la barra fija el multiplicador de cada acción con anuncio. Con «sin anuncios» comprado, el nivel es siempre el máximo.
// Puro: sin reloj, azar, SAVE ni DOM. Quien llama pasa la configuración del juego, lo guardado y el día y la semana de hoy.
// Los fallos de reglas son resultados con nombre ({ ok: false, error }), nunca excepciones.
// La configuración (la da cada juego en sus ajustes):
//   { medidor: { umbrales: [0, 10, 50, 100], tope: 120, sube: 20, baja: 2 }, diaMax: 30 (opcional),
//     acciones: { id: { nombre, max, semana (opcional: el tope es por semana), clase: 'solo' | 'ambas', mult: [2, 3, 4, 5] } } }
//   clase 'solo' = solo existe con anuncio (revivir); 'ambas' = también se puede recoger sin anuncio, y con anuncio da siempre más.
//   mult = un multiplicador por nivel; si trae menos que niveles, el último vale para los que faltan; sin mult, ×1.
'use strict';
const MEDIDOR_ANUNCIOS = {};
MEDIDOR_ANUNCIOS.dominio = (() => {
  const ok = valor => ({ ok: true, valor }), error = (e, datos) => ({ ok: false, error: e, datos });
  const CLASES = ['solo', 'ambas'];
  const cuenta = n => Number.isInteger(n) && n > 0;
  const crece = L => L.every((v, i) => i === 0 || v > L[i - 1]);
  const noBaja = L => L.every((v, i) => i === 0 || v >= L[i - 1]);
  const ultimo = L => L[L.length - 1];
  // el nombre de la primera regla que no se cumple, o '' si se cumplen todas
  const primerFallo = (reglas, x, y) => { const r = reglas.find(([, vale]) => !vale(x, y)); return r ? r[0] : ''; };

  // ---------- la configuración de un juego ----------
  const REGLAS_MEDIDOR = [
    ['umbrales', M => Array.isArray(M.umbrales) && M.umbrales[0] === 0],
    ['umbrales', M => M.umbrales.every(Number.isFinite) && crece(M.umbrales)],
    ['tope', M => Number.isFinite(M.tope) && M.tope >= ultimo(M.umbrales)],
    ['sube', M => Number.isFinite(M.sube) && M.sube > 0],
    ['baja', M => Number.isFinite(M.baja) && M.baja > 0],
  ];
  const REGLAS_ACCION = [
    ['accion_tope', A => cuenta(A.max)],
    ['accion_clase', A => CLASES.includes(A.clase)],
    ['mult', (A, niveles) => Array.isArray(A.mult) && A.mult.length > 0 && A.mult.length <= niveles],
    ['mult', A => A.mult.every(v => Number.isFinite(v) && v >= 1)],
    ['mult_baja', A => noBaja(A.mult)],
    ['mult_x1', A => A.clase !== 'ambas' || A.mult[0] >= 2],   // con y sin anuncio no pueden dar lo mismo
  ];
  const copia = mult => (Array.isArray(mult) ? Object.freeze(mult.slice()) : mult);   // lo que no es una lista se deja como viene, para que lo rechace su regla
  const accion = (id, A) => Object.freeze({ id, nombre: A.nombre || id, max: A.max, semana: !!A.semana, clase: A.clase, mult: copia(A.mult == null ? [1] : A.mult) });
  function acciones(lista, niveles) {
    const hechas = Object.create(null);   // sin herencia: «constructor» no es una acción
    for (const [id, cruda] of Object.entries(lista || {})) {
      const A = accion(id, cruda || {}), fallo = primerFallo(REGLAS_ACCION, A, niveles);
      if (fallo) return error(fallo, { accion: id });
      hechas[id] = A;
    }
    return Object.keys(hechas).length ? ok(Object.freeze(hechas)) : error('sin_acciones');
  }
  // la configuración validada y congelada. Errores: sin_config, umbrales, tope, sube, baja, dia_max, sin_acciones,
  // accion_tope, accion_clase, mult, mult_baja, mult_x1 (los de una acción traen datos.accion)
  function configura(C) {
    if (!C || !C.medidor) return error('sin_config');
    const M = C.medidor, fallo = primerFallo(REGLAS_MEDIDOR, M);
    if (fallo) return error(fallo);
    if (C.diaMax != null && !cuenta(C.diaMax)) return error('dia_max');
    const A = acciones(C.acciones, M.umbrales.length);
    if (!A.ok) return A;
    return ok(Object.freeze({
      umbrales: Object.freeze(M.umbrales.slice()), niveles: M.umbrales.length, tope: M.tope, sube: M.sube, baja: M.baja,
      diaMax: C.diaMax == null ? null : C.diaMax, acciones: A.valor,
    }));
  }

  // ---------- el estado: los puntos de la barra y lo gastado hoy y esta semana ----------
  const acota = (cfg, puntos) => Math.min(cfg.tope, Math.max(0, Number.isFinite(puntos) ? puntos : 0));
  // lo gastado que se puede creer: solo acciones de ese periodo que existen, con cuentas enteras
  function usos(cfg, guardados, semanal) {
    const limpio = {};
    for (const A of Object.values(cfg.acciones)) {
      const n = guardados && guardados[A.id];
      if (A.semana === semanal && cuenta(n)) limpio[A.id] = n;
    }
    return Object.freeze(limpio);
  }
  const estado = (puntos, hoy, usosDia, usosSemana) => Object.freeze({ puntos, dia: hoy.dia, usosDia, semana: hoy.semana, usosSemana });
  // el estado a partir de lo guardado (o de nada). hoy: { dia: 'AAAA-MM-DD', semana: 'AAAA-MM-DD' del lunes }.
  // Lo gastado de otro día o de otra semana se olvida; los puntos no caducan.
  function abre(cfg, guardado, hoy) {
    const g = guardado || {};
    return estado(acota(cfg, g.puntos),
      hoy, usos(cfg, g.dia === hoy.dia ? g.usosDia : null, false), usos(cfg, g.semana === hoy.semana ? g.usosSemana : null, true));
  }

  // ---------- lo que se lee ----------
  // el nivel de la barra, de 1 a cfg.niveles; con «sin anuncios» comprado, siempre el máximo
  const nivel = (cfg, e, sinAnuncios) => (sinAnuncios ? cfg.niveles : cfg.umbrales.filter(u => u <= e.puntos).length);
  const gastados = (A, e) => (A.semana ? e.usosSemana : e.usosDia)[A.id] || 0;
  const gastadosHoy = e => Object.values(e.usosDia).reduce((s, n) => s + n, 0);
  // el multiplicador que da ahora el anuncio de una acción. Error: accion
  function multiplicador(cfg, e, id, sinAnuncios) {
    const A = cfg.acciones[id];
    if (!A) return error('accion');
    return ok(A.mult[Math.min(nivel(cfg, e, sinAnuncios), A.mult.length) - 1]);
  }
  // ¿se puede ofrecer ahora el anuncio de una acción? Devuelve cuántos le quedan. Errores: accion, tope_accion, tope_dia
  function puede(cfg, e, id) {
    const A = cfg.acciones[id];
    if (!A) return error('accion');
    if (gastados(A, e) >= A.max) return error('tope_accion');
    if (!A.semana && cfg.diaMax != null && gastadosHoy(e) >= cfg.diaMax) return error('tope_dia');
    return ok(A.max - gastados(A, e));
  }
  // lo que pinta la barra: nivel, puntos y el tramo del nivel en el que está
  function barra(cfg, e, sinAnuncios) {
    const n = nivel(cfg, e, sinAnuncios), hasta = n < cfg.niveles ? cfg.umbrales[n] : cfg.tope;
    return { nivel: n, niveles: cfg.niveles, puntos: sinAnuncios ? cfg.tope : e.puntos, tope: cfg.tope, desde: cfg.umbrales[n - 1], hasta, fija: !!sinAnuncios };
  }

  // ---------- lo que cambia el estado (devuelven uno nuevo) ----------
  const gasta = (A, e, puntos) => {
    const mas = Object.freeze({ ...(A.semana ? e.usosSemana : e.usosDia), [A.id]: gastados(A, e) + 1 });
    return estado(puntos, e, A.semana ? e.usosDia : mas, A.semana ? mas : e.usosSemana);
  };
  // se ha visto el anuncio de una acción (o, con «sin anuncios», se ha dado al momento): gasta su tope y suma puntos.
  // Con «sin anuncios» los puntos de verdad no se mueven. Errores: los de puede()
  function visto(cfg, e, id, sinAnuncios) {
    const p = puede(cfg, e, id);
    if (!p.ok) return p;
    return ok(gasta(cfg.acciones[id], e, sinAnuncios ? e.puntos : acota(cfg, e.puntos + cfg.sube)));
  }
  // se ha recogido sin anuncio el premio de una acción que también se ofrecía con anuncio: resta puntos.
  // Errores: accion, no_resta (la acción solo existe con anuncio) y sin_oferta (no se le podía ofrecer: tope gastado)
  function dejada(cfg, e, id, sinAnuncios) {
    const A = cfg.acciones[id];
    if (!A) return error('accion');
    if (A.clase !== 'ambas') return error('no_resta');
    if (!puede(cfg, e, id).ok) return error('sin_oferta');
    return ok(sinAnuncios ? e : estado(acota(cfg, e.puntos - cfg.baja), e, e.usosDia, e.usosSemana));
  }

  return { configura, abre, nivel, multiplicador, puede, barra, visto, dejada };
})();
if (typeof module !== 'undefined') module.exports = MEDIDOR_ANUNCIOS;
