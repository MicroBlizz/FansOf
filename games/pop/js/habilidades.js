// Fans of Pop · HABILIDADES DE LOS COMPAÑEROS (dominio; tarea #142, ADR 157, nodos n3 a n5): las cuentas de las habilidades nuevas
// de Niveles (estrella, ticket, rescate, racha, limpia), de Pesadilla (foto para deshacer y volteo de una sola burbuja) y de Duelos
// contra la máquina (fallo del rival y quitar una burbuja). Funciones puras: sin SAVE, reloj, azar, red ni dibujo; lo que cambian lo
// devuelven nuevo. Las usan js/habilidades-niveles.js, js/habilidades-pesadilla.js y js/habilidades-duelo.js.
'use strict';
const PP_HAB = Object.freeze((() => {
  const ok = v => Object.freeze({ ok: true, ...v });
  const error = e => Object.freeze({ ok: false, error: e });
  // lo que suma una clave de fx en un equipo (`fxDe`: id → fx con sus estrellas)
  const suma = (equipo, fxDe, k) => (equipo || []).reduce((a, id) => a + (Number((fxDe(id) || {})[k]) || 0), 0);
  // los del equipo que tienen esa habilidad
  const conHab = (equipo, fxDe, k) => (equipo || []).filter(id => (fxDe(id) || {})[k]);
  // las estrellas de un nivel de pop-it: 3 con el mínimo de toques (más `iman`, el Imán de estrellas), 2 a medio camino, 1 si no
  function estrellas(toques, minimo, limite, iman = 0) {
    if (toques <= minimo + iman) return 3;
    return toques <= minimo + Math.ceil((limite - minimo) / 2) ? 2 : 1;
  }
  // el Feriante: tickets de más con 3 estrellas
  const ticketsExtra = (est, n) => (est >= 3 ? Math.max(0, n) : 0);
  // la Limpieza: monedas por cada toque que sobra al ganar
  const limpia = (limite, toques, porToque) => Math.max(0, limite - toques) * Math.max(0, porToque);
  // Al rescate: los toques que da al quedarte sin toques (una vez por nivel)
  const rescate = (n, usado) => (n > 0 && !usado ? n : 0);
  // el día de una fecha en hora local, «2026-11-19»
  const diaLocal = f => `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
  // Racha a salvo: una vez al día, perder un nivel no rompe la racha. { salva, usado } (usado: el día en que se gastó)
  function racha(tiene, rachaAhora, usado, hoy) {
    if (!tiene || !(rachaAhora > 0) || usado === hoy) return Object.freeze({ salva: false, usado });
    return Object.freeze({ salva: true, usado: hoy });
  }
  // PESADILLA · la foto del tablero antes de un toque (para Marcha atrás) y la vuelta a ella
  const foto = T => Object.freeze({ up: Array.from(T.up), sol: [...T.sol], toques: T.toques, gratis: T.gratis, combo: T.combo, pops: T.pops, pista: T.pista });
  function vuelve(f) {
    if (!f) return error('sin_foto');
    return ok({ tablero: { up: Uint8Array.from(f.up), sol: new Set(f.sol), toques: f.toques, gratis: f.gratis, combo: f.combo, pops: f.pops, pista: f.sol.includes(f.pista) ? f.pista : null } });
  }
  // PESADILLA · Volteo: da la vuelta a la burbuja i sola. `resuelve(up)` da la solución que queda o null si ya no la tiene: entonces
  // no se puede (dejaría el nivel imposible)
  function voltea(up, mask, i, resuelve) {
    if (!mask[i]) return error('fuera');
    const n = Uint8Array.from(up); n[i] ^= 1;
    const sol = resuelve(n);
    if (!sol) return error('sin_solucion');
    return ok({ up: n, sol: new Set(sol), sube: !!n[i] });
  }
  // DUELOS · Despiste: la probabilidad de que el rival se equivoque, con lo que suma el equipo (nunca más de 1). Sin nada que sumar,
  // la de siempre tal cual
  function fallo(base, extra) {
    const e = Math.max(0, Number(extra) || 0);
    return e ? Math.min(1, Math.round(((Number(base) || 0) + e) * 1000) / 1000) : base;
  }
  // DUELOS · Pellizco: quitar la burbuja i antes de empezar (nunca la última que queda: el duelo se quedaría sin nada)
  function quita(up, mask, i) {
    if (!mask[i] || !up[i]) return error('no_hay');
    let quedan = 0; for (let j = 0; j < up.length; j++) if (mask[j] && up[j]) quedan++;
    if (quedan <= 1) return error('ultima');
    const n = Uint8Array.from(up); n[i] = 0;
    return ok({ up: n });
  }
  return { suma, conHab, estrellas, ticketsExtra, limpia, rescate, diaLocal, racha, foto, vuelve, voltea, fallo, quita };
})());
