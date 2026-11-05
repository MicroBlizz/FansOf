// Fans of Basement · Pase de temporada (dominio): una barra de niveles que se llena jugando. Cada bajada da XP (por las plantas, los
// bichos, las capturas y los jefes; más si subes a salvo) y cada nivel tiene su premio (monedas, materiales o paquetes), que se
// cobra una vez. Al cambiar de temporada (otra clave, la pone el adaptador), el pase empieza de cero. Solo hay fila gratis: una fila
// de pago está por decidir (ver la guía del juego). Cifras en ajustes.js (pase).
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  // La XP de una bajada terminada.
  B.xpDe = function (AJ, r) {
    const P = AJ.pase.porBajada, cap = Object.values(r.capturas || {}).reduce((s, n) => s + n, 0);
    const xp = (r.planta || 0) * P.planta + (r.bajas || 0) * P.baja + cap * P.captura + (r.jefes || 0) * P.jefe;
    return Math.round(xp * (r.como === 'ascensor' ? AJ.pase.salvo : 1));
  };
  // El premio de un nivel (1..niveles).
  B.premioPase = (AJ, nivel) => AJ.pase.grandes[nivel] || AJ.pase.premios[(nivel - 1) % AJ.pase.premios.length];

  // El pase de esta temporada (si la clave es otra, vacío).
  const paseDe = (p, clave) => (p.pase && p.pase.clave === clave ? p.pase : { clave, xp: 0, cobrados: [] });
  B.estadoPase = function (AJ, p, clave) {
    const s = paseDe(p, clave), nivel = Math.min(AJ.pase.niveles, Math.floor(s.xp / AJ.pase.xp));
    return Object.freeze({ clave, xp: s.xp, nivel, enNivel: s.xp - nivel * AJ.pase.xp, cobrados: [...s.cobrados],
      porCobrar: Array.from({ length: nivel }, (_, i) => i + 1).filter((n) => !s.cobrados.includes(n)) });
  };

  // Suma la XP de una bajada al pase de la temporada `clave`.
  B.sumarXp = function (AJ, p, clave, r) {
    const q = B.copiaProgreso(p), s = paseDe(p, clave);
    q.pase = { clave, xp: Math.min(AJ.pase.niveles * AJ.pase.xp, s.xp + B.xpDe(AJ, r)), cobrados: [...s.cobrados] };
    return q;
  };

  // Cobra el premio de un nivel alcanzado.
  B.cobrarPase = function (AJ, p, clave, nivel) {
    const st = B.estadoPase(AJ, p, clave);
    if (!(nivel >= 1 && nivel <= st.nivel)) return B.error('nivelNoAlcanzado', { nivel });
    if (st.cobrados.includes(nivel)) return B.error('yaCobrado', { nivel });
    const q = B.copiaProgreso(p), pr = B.premioPase(AJ, nivel);
    q.monedas += pr.monedas || 0;
    for (const [t, n] of Object.entries(pr.materiales || {})) q.materiales[t] = (q.materiales[t] || 0) + n;
    for (const [t, n] of Object.entries(pr.paquetes || {})) q.paquetes[t] += n;
    q.pase = { clave, xp: st.xp, cobrados: [...st.cobrados, nivel] };
    return B.ok(q);
  };
})(BAS);
