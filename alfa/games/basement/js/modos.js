// Fans of Basement · Modos especiales (dominio): el DESAFÍO DEL DÍA y el EVENTO DE LA SEMANA. Los dos empiezan en Marketing y
// tienen su ranking. El desafío es la misma bajada para todos (el azar sale de la semilla de su clave, 'd-2026-11-05'); el evento
// cambia cada semana ('s-2026-11-02', el lunes) y trae sus reglas (ajustes.js, eventos). Cada uno da su premio la primera vez que
// llegas a su planta y subes a salvo. La fecha la pone el adaptador (principal.js): aquí no hay reloj.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  // Un número a partir de un texto, y un azar repetible a partir de él (el mismo para todo el mundo).
  B.semilla = (texto) => { let h = 7; for (const ch of String(texto)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
  B.azarDe = function (semilla) {
    let a = semilla >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };

  // El evento de una semana (el mismo para todos).
  B.eventoDe = (AJ, clave) => AJ.eventos[B.semilla(clave) % AJ.eventos.length];

  // Las estadísticas de la bajada con las reglas del evento.
  const MOD = {
    valor: (s, k) => { s.valor *= k; }, gasto: (s, k) => { s.gasto *= k; }, dano: (s, k) => { s.dano = Math.round(s.dano * k * 10) / 10; },
    cadencia: (s, k) => { s.cadencia *= k; }, espera: (s, k) => { s.espera += k; }, paquete: (s, k) => { s.paquete = (s.paquete || 1) * k; },
  };
  B.statsEvento = function (stats, evento) {
    const s = { ...stats };
    for (const [k, v] of Object.entries((evento && evento.mods) || {})) MOD[k](s, v);
    return Object.freeze(s);
  };

  // El premio de un modo: la primera vez de esa clave que llegas a su planta y subes a salvo. Devuelve el progreso nuevo y si lo ha dado.
  B.premioModo = function (AJ, p, modo, clave, r) {
    const M = AJ.modos[modo];
    if (!M || !clave || p.premiados.includes(clave) || r.como !== 'ascensor' || r.planta < M.premio.planta) return { progreso: p, premio: null };
    const q = B.copiaProgreso(p);
    for (const [t, n] of Object.entries(M.premio.paquetes)) q.paquetes[t] += n;
    q.premiados = [...q.premiados, clave].slice(-30);   // solo hacen falta las últimas
    return { progreso: q, premio: M.premio.paquetes };
  };
})(BAS);
