// Fans Of · TELEMETRIA: manda el progreso ANÓNIMO de una partida (un UUID al azar por partida, sin cuenta ni nombre) para equilibrar los juegos con datos reales.
// El juego lo configura una vez (TELEMETRIA.configurar({ rpc, flag, descripcion })) y luego: nueva() al empezar una partida, estado(id, resumen) para lo que cambia
// y evento(id, e) para cada cosa que pasa (una reunión, un café…); el servidor ve todo por id y los eventos repetidos se ignoran (servidor/68-decks-telemetria.sql, por ahora el de Decks).
// Solo manda si TODO esto es cierto: el flag del juego está abierto, el jugador no ha apagado «Datos de partida anónimos» (DATOS.activo(), datos-partida.js) y hay cuenta (CUENTA.activa).
// Si el jugador lo apaga, lo pendiente se borra sin mandarse. Los envíos van en lotes y lo que no sale (sin red) se guarda en el navegador y se reintenta; el servidor cerrado o con tope descarta.
// Hoy lo usa Decks (games/decks/js/telemetria.js); la forma de los datos es del juego, esto solo se ocupa de cuándo y cómo se manda.
'use strict';
const TELEMETRIA = (() => {
  const CLAVE = 'fansof-tel', LOTE = 4, TOPE_PENDIENTE = 40, ESPERA = 20000;
  let cfg = null, pend = {}, temporizador = 0, enviando = false, callado = 0;   // pend: id → { datos, eventos: [], fin }
  try { pend = JSON.parse(localStorage.getItem(CLAVE) || '{}') || {}; } catch (e) { pend = {}; }
  const guarda = () => { try { if (Object.keys(pend).length) localStorage.setItem(CLAVE, JSON.stringify(pend)); else localStorage.removeItem(CLAVE); } catch (e) { /* sin almacenamiento */ } };
  const activa = () => !!cfg && typeof CUENTA !== 'undefined' && CUENTA.activa && (typeof DATOS === 'undefined' || DATOS.activo()) && NUCLEO.flag(cfg.flag, cfg.descripcion || 'Mandar datos anónimos de partida', false);
  const uuid = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); }));
  const caja = id => pend[id] || (pend[id] = { datos: {}, eventos: [], fin: false });
  function programa(ya) {
    if (temporizador) clearTimeout(temporizador);
    temporizador = setTimeout(() => { temporizador = 0; manda(); }, ya ? 0 : ESPERA);
  }
  async function manda() {
    if (enviando || !cfg) return;
    if (!activa()) { if (Object.keys(pend).length && (typeof DATOS !== 'undefined' && !DATOS.activo())) { pend = {}; guarda(); } return; }   // apagado por el jugador: se borra sin mandar
    if (Date.now() < callado) return;
    enviando = true;
    try {
      for (const id of Object.keys(pend)) {
        const c = pend[id], lote = c.eventos.slice(0, 60);
        if (!Object.keys(c.datos).length && !lote.length) { delete pend[id]; continue; }
        const r = await CUENTA.rpc(cfg.rpc, { p_datos: Object.assign({ run: id }, c.datos, { eventos: lote }) });
        if (r && r.ok === false && (r.motivo === 'cerrado' || r.motivo === 'tope')) { pend = {}; callado = Date.now() + 3600000; break; }   // el servidor no quiere más: se descarta y se espera
        if (r && r.ok === false) { delete pend[id]; continue; }   // datos que el servidor no admite: no se reintentan
        c.eventos = c.eventos.slice(lote.length);
        if (!c.eventos.length && c.fin) delete pend[id];
      }
    } catch (e) { /* sin red o sin la función en el servidor: queda pendiente */ }
    enviando = false; guarda();
    if (Object.values(pend).some(c => c.eventos.length >= LOTE)) programa(true);
  }
  function recorta() { const ids = Object.keys(pend); while (ids.length > TOPE_PENDIENTE) delete pend[ids.shift()]; }
  document.addEventListener('visibilitychange', () => { if (document.hidden) manda(); });
  return {
    configurar: c => { cfg = c; if (Object.keys(pend).length) programa(false); },
    nueva: () => uuid(),
    // lo último que se sabe de la partida (se manda con el siguiente lote); fin = true cuando ya no habrá más
    estado(id, datos, fin) {
      if (!cfg || !id) return; const c = caja(id); Object.assign(c.datos, datos); if (fin) c.fin = true;
      recorta(); guarda(); fin || c.eventos.length >= LOTE ? programa(true) : programa(false);
    },
    evento(id, e) { if (!cfg || !id) return; caja(id).eventos.push(e); recorta(); guarda(); },
    get activa() { return activa(); },
  };
})();
