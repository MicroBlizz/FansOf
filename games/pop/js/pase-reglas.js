// Fans of Pop · REGLAS DEL PASE (dominio puro; tareas #166 y #165, ADR 165). Sin SAVE, reloj, azar ni DOM: el pase, los puntos y el
// tema entran como datos y sale el resultado. El pase es { premium, gratis: { k: true }, prem: { k: true } } (js/pase.js, ppPaseAlDia).
// Con el flag 'pase-nuevo' cerrado solo se usan `listos` y `clave` (el pase de siempre).
'use strict';
const PP_PASE_R = (() => {
  const f = Object.freeze;
  // Pepins, 19-11-2026 (tarjetas sobre el boceto): puntos por todo el juego, Dorado+ salta 10 escalones y, tras el último, escalones extra
  // fijos (sin azar, ADR 004). Al verlo en el navegador («se puede cumplir en 2 días si juegas mucho») eligió las tres cosas juntas:
  // pase más largo (60 escalones), un escalón cada 25 puntos y un tope de 60 puntos al día jugando (las misiones y la compra, aparte)
  const CFG = f({
    escalones: 60, porEscalon: 25, saltoPlus: 10, puntosViejos: 3, topeDia: 60,
    puntos: f({ nuevo: 2, tresEstrellas: 1, repetido: 1, duelo: 2, ticket: 1, mision: 5 }),
    extra: f({ monedas: 25, perlas: 2 }),
  });
  // los premios listos hasta el escalón `escalon`, en orden: [{ k, premium }] (de cada escalón, el gratis antes que el dorado).
  // El dorado solo con el pase comprado; lo ya cogido no sale
  function listos(pase, escalon) {
    const r = [];
    for (let k = 1; k <= escalon; k++) {
      if (!pase.gratis[k]) r.push(f({ k, premium: false }));
      if (pase.premium && !pase.prem[k]) r.push(f({ k, premium: true }));
    }
    return f(r);
  }
  // la clave con que se apunta cada premio (el servidor no cobra dos veces la misma: js/perlas-libro.js)
  const clave = (temporada, premium, k) => `pase:${temporada}:${premium ? 'p' : 'g'}:${k}`;
  const claveExtra = (temporada, n) => `pase:${temporada}:x:${n}`;
  // escalón alcanzado (0 a 30), escalones extra pasados del 30 y puntos que faltan para el siguiente
  const escalon = puntos => Math.min(CFG.escalones, Math.floor(puntos / CFG.porEscalon));
  const extras = puntos => Math.max(0, Math.floor(puntos / CFG.porEscalon) - CFG.escalones);
  const falta = puntos => CFG.porEscalon - (puntos % CFG.porEscalon);
  // los puntos que faltan para el próximo premio (cada escalón da uno), para el botón del lado del camino; null si ya no queda ninguno.
  // `ultimo`: el último escalón con premio (en el pase nuevo no hay: tras el 60 siguen los extra). Vale para el pase de siempre
  // pasándole sus cifras (un escalón cada 3 puntos, 30 escalones)
  function faltaPremio(puntos, porEscalon = CFG.porEscalon, ultimo = Infinity) {
    const p = Math.max(0, Math.floor(puntos || 0)), paso = Math.max(1, Math.floor(porEscalon || 1));
    return Math.floor(p / paso) >= ultimo ? null : paso - (p % paso);
  }
  // los puntos de ganar un nivel: nuevo 2 (+1 con tres estrellas) o repetido 1, más 1 por cada ticket de la Feria que dio
  const deNivel = (nuevo, estrellas, tickets = 0) => (nuevo ? CFG.puntos.nuevo + (estrellas === 3 ? CFG.puntos.tresEstrellas : 0) : CFG.puntos.repetido)
    + Math.max(0, tickets || 0) * CFG.puntos.ticket;
  // suma n puntos (los negativos o los que no son número no cuentan): { puntos, sube } (sube: escalones nuevos, contando los extra)
  function suma(puntos, n) {
    const m = n > 0 ? Math.floor(n) : 0, despues = puntos + m;
    return f({ puntos: despues, sube: Math.floor(despues / CFG.porEscalon) - Math.floor(puntos / CFG.porEscalon) });
  }
  // de n puntos ganados jugando, los que caben hoy (`hoy`: los ya ganados jugando hoy); las misiones y la compra no tienen tope
  const conTope = (hoy, n) => Math.max(0, Math.min(n > 0 ? Math.floor(n) : 0, CFG.topeDia - Math.max(0, hoy || 0)));
  // los puntos que da comprar el pase: el Dorado+ salta 10 escalones al momento; el normal, ninguno
  const deCompra = plus => (plus ? CFG.saltoPlus * CFG.porEscalon : 0);
  // escalones extra por recoger (`cogidos`: los ya recogidos) y lo que da cada uno (25 monedas; 2 perlas más con el Dorado)
  const extrasListos = (puntos, cogidos = 0) => Math.max(0, extras(puntos) - cogidos);
  const premioExtra = premium => (premium ? f({ monedas: CFG.extra.monedas, perlas: CFG.extra.perlas }) : f({ monedas: CFG.extra.monedas }));
  // los puntos del pase viejo (un escalón cada 3) en la escala nueva, sin perder escalón. Se guardan aparte: así el pase de siempre
  // (flag cerrado) sigue con los suyos
  function desdeViejos(viejos) {
    const v = CFG.puntosViejos, p = Math.max(0, viejos || 0);
    return Math.floor(p / v) * CFG.porEscalon + Math.floor((p % v) * CFG.porEscalon / v);
  }
  // los premios de cada escalón con el tema del mes (js/pase-temas.js). Gratis: monedas y una ayuda cada 5.
  // Dorado: la bandeja (40) y el compañero (60) de la temporada, exclusivos de ese mes; en el 30, un puñado de perlas; además perlas,
  // ayudas e infinitos
  const AYUDAS_G = f(['martillo', 'bomba', 'toques3', 'pista', 'deshacer', 'martillo']);
  const BANDEJA = 40, MITAD = 30;
  function gratis(k) {
    if (k % 5 === 0) return f({ ayudas: f({ [AYUDAS_G[(k / 5 - 1) % AYUDAS_G.length]]: 1 }) });
    return f({ monedas: 20 + 5 * Math.floor(k / 6) });
  }
  function dorado(k, tema) {
    if (k === CFG.escalones) return f({ perlas: 5, companero: tema.companero });
    if (k === BANDEJA) return f({ bandeja: tema.bandeja });
    if (k === MITAD) return f({ perlas: 10 });
    if (k % 10 === 0) return f({ infinitas: 60 });
    if (k % 3 === 0) return f({ ayudas: f({ [k % 2 ? 'martillo' : 'bomba']: 2 }) });
    if (k % 4 === 0) return f({ infinitas: 30 });
    return f({ perlas: 3 });
  }
  // cuánto falta (ms) para que cambien las misiones del día: la medianoche del móvil, como RETOSL (tarea 375)
  const hastaMisiones = ahora => new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1) - ahora;
  // los dorados que solo salen ese mes (la etiqueta SOLO ESTE MES)
  const exclusivo = (k, premium) => premium && (k === BANDEJA || k === CFG.escalones);
  return f({ CFG, listos, clave, claveExtra, escalon, extras, falta, faltaPremio, deNivel, suma, conTope, deCompra, extrasListos, premioExtra, desdeViejos, gratis, dorado, exclusivo, hastaMisiones });
})();
