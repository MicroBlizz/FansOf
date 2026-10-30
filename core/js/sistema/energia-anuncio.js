// Fans Of · CAOS PRIMORDIAL por anuncio: el botón «ver un anuncio y ganar caos primordial» (el servidor da +1 y pone el tope diario: pvp_energia_anuncio).
// El anuncio lo pone la capa común ANUNCIOS (core/js/sistema/anuncios.js): de prueba, de verdad o el nuestro de reserva. Nunca es obligatorio.
// Uso: ENERGIA.botonAnuncio() devuelve el HTML del botón (vacío si no toca) y ENERGIA.enlazaAnuncio(raiz) lo activa.
'use strict';
(() => {
  // ¿se puede ofrecer ahora? (energía en marcha, sin ilimitada, no llena y con anuncios hoy)
  const toca = () => { const e = ENERGIA.estado; return !!(ENERGIA.activa && !ENERGIA.ilimitada && e && e.energia < e.max && (e.anuncios_quedan || 0) > 0); };
  const verAnuncio = async alAcabar => { const r = await ANUNCIOS.ver('caos'); if (r.visto) alAcabar(); };
  const pedir = async () => {
    try { await CUENTA.rpc('pvp_energia_anuncio', { p_juego: AJUSTES.id }); play('win'); toast(tr('+1 caos primordial'), true); }
    catch (e) { play('deny'); toast(/sin_anuncios/.test(String(e && e.message)) ? tr('Hoy ya no quedan más anuncios. ¡Mañana más!') : /energia_llena/.test(String(e && e.message)) ? tr('Ya tienes el caos primordial lleno') : tr('No se ha podido dar el premio: inténtalo luego'), true); }
    await ENERGIA.cargar(); ENERGIA.refresca();
  };
  ENERGIA.botonAnuncio = () => !toca() ? '' : `<button class="btn-big ol en-ad-btn" type="button" data-en-ad>${tr('▶ VER UN ANUNCIO: +1 CAOS PRIMORDIAL')}<small>${tr('quedan {n} hoy', { n: ENERGIA.estado.anuncios_quedan })}</small></button>`;
  ENERGIA.enlazaAnuncio = raiz => {
    const b = raiz && raiz.querySelector('[data-en-ad]'); if (!b) return;
    b.onclick = () => { const c = document.getElementById('scr-confirm'); if (c && c.contains(b)) c.hidden = true; play('select'); verAnuncio(pedir); };
  };
})();
