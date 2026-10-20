// Fans Of · CAOS PRIMORDIAL por anuncio: el botón «ver un anuncio y ganar caos primordial» (el servidor da +1 y pone el tope diario: pvp_energia_anuncio).
// Anuncio de prueba de 5 s; en la app de Google Play este es el único sitio donde cambiarlo por AdMob (verAnuncio). Nunca es obligatorio.
// Uso: ENERGIA.botonAnuncio() devuelve el HTML del botón (vacío si no toca) y ENERGIA.enlazaAnuncio(raiz) lo activa.
'use strict';
(() => {
  const SEG = 5;
  let corre = null;
  // ¿se puede ofrecer ahora? (energía en marcha, sin ilimitada, no llena y con anuncios hoy)
  const toca = () => { const e = ENERGIA.estado; return !!(ENERGIA.activa && !ENERGIA.ilimitada && e && e.energia < e.max && (e.anuncios_quedan || 0) > 0); };
  const verAnuncio = alAcabar => {
    let ov = document.getElementById('en-ad');
    if (!ov) { document.body.insertAdjacentHTML('beforeend', `<section id="en-ad" class="en-ad" role="dialog" aria-label="${tr('Anuncio')}" hidden><div class="en-ad-card"><span class="en-ad-flag">${tr('ANUNCIO')}</span><p>${tr('Un mensaje de nuestros patrocinadores… que somos nosotros.')}</p><div id="en-ad-promo"></div><div class="en-ad-bar"><i></i></div><button class="btn-big ol" id="en-ad-ok" disabled>…</button><button class="btn-link" id="en-ad-no">${tr('Cerrar sin premio')}</button><small>${tr('Anuncio de prueba. En la app de Google Play aquí saldrá un anuncio de verdad.')}</small></div></section>`); ov = document.getElementById('en-ad'); }
    const pr = document.getElementById('en-ad-promo'); pr.innerHTML = PROMO.html(); PROMO.enlaza(pr);
    const ok = document.getElementById('en-ad-ok'), barra = ov.querySelector('.en-ad-bar'); let t = SEG;
    ov.hidden = false; play('select');
    const tic = () => {
      if (t > 0) { ok.disabled = true; ok.textContent = tr('El premio llega en {t}…', { t }); barra.style.setProperty('--p', ((SEG - t) / SEG * 100) + '%'); t--; corre = setTimeout(tic, 1000); return; }
      barra.style.setProperty('--p', '100%'); ok.disabled = false; ok.textContent = tr('RECOGER PREMIO'); play('levelup');
    };
    clearTimeout(corre); tic();
    ok.onclick = () => { if (t > 0) return; ov.hidden = true; play('crown'); alAcabar(); };
    document.getElementById('en-ad-no').onclick = () => { clearTimeout(corre); ov.hidden = true; play('select'); toast(tr('Anuncio cerrado: sin premio')); };
  };
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
