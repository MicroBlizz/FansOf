// Fans Of · PRESENCIA: un pulso ANÓNIMO cada minuto mientras alguien juega, para contar cuánta gente hay conectada, cuánta jugó cada día y cuánta vuelve (/gestion → Métricas).
// Manda { juego, versión, plataforma, alfa } y nada más: ni nombre, ni email, ni id de cuenta. El servidor lo guarda con una huella que cambia cada día y solo deja totales (servidor/111-presencia.sql, ADR 040).
// Solo manda si TODO esto es cierto: el flag `presencia` está abierto (primero en la alfa), el jugador no ha apagado «Datos de partida anónimos» (DATOS.activo()), hay cuenta (CUENTA.activa),
// la pestaña se ve y el juego dice quién es (AJUSTES.id). Arranca sola al cargar el juego: un juego nuevo no tiene que hacer nada. Si el servidor falla, espera 5 minutos y sigue sin molestar.
// PRESENCIA.crear(deps) es la lógica sin DOM ni red (para los tests); el final de este archivo la conecta con la página.
'use strict';
const PRESENCIA = (() => {
  const CADA = 60000, PRIMERO = 5000, CALLADO = 300000;
  function crear(d) {   // d: { ahora(), visible(), permitido(), datos() → { juego, version, plataforma, alfa } | null, rpc(nombre, args) }
    let ultimo = 0, callado = 0;
    async function pulso() {
      const ahora = d.ahora();
      if (!d.visible() || ahora < callado || ahora - ultimo < CADA - 1000 || !d.permitido()) return false;
      const x = d.datos(); if (!x || !x.juego) return false;
      ultimo = ahora;
      try { await d.rpc('enviar_presencia', { p_juego: x.juego, p_version: x.version, p_plataforma: x.plataforma, p_alfa: x.alfa }); return true; }
      catch (e) { callado = ahora + CALLADO; return false; }   // sin la función en el servidor o sin red: se calla un rato, el juego no se entera
    }
    return { pulso };
  }
  return { crear, CADA, PRIMERO };
})();

if (typeof document !== 'undefined' && typeof NUCLEO !== 'undefined') {
  (() => {
    const p = PRESENCIA.crear({
      ahora: () => Date.now(),
      visible: () => !document.hidden,
      permitido: () => typeof CUENTA !== 'undefined' && CUENTA.activa && (typeof DATOS === 'undefined' || DATOS.activo()) && NUCLEO.flag('presencia', 'Pulso anónimo cada minuto para contar conectados, jugadores por día y retención', false),
      datos: () => ({ juego: typeof AJUSTES !== 'undefined' ? AJUSTES.id : '', version: String(NUCLEO.version || '').slice(0, 24), alfa: !!NUCLEO.alfa, plataforma: /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) ? 'movil' : 'pc' }),
      rpc: (n, a) => CUENTA.rpc(n, a),
    });
    setTimeout(p.pulso, PRESENCIA.PRIMERO); setInterval(p.pulso, PRESENCIA.CADA);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) p.pulso(); });
  })();
}
if (typeof module !== 'undefined') module.exports = PRESENCIA;
