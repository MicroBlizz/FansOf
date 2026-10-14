// Fans Of · CAOS PRIMORDIAL (la energía del juego online): cada partida online (PvP, cooperativo…) gasta 1 (por juego); jugar solo o contra la CPU no gasta. La energía ilimitada (suscripción) es de la cuenta y vale en todos los juegos.
// Todo lo decide el servidor (funciones pvp_energia, pvp_buscar...): aquí solo se pregunta cuánta hay y se enseña. Si el servidor no la cobra (apagada), no se enseña nada.
// Uso: ENERGIA.cargar() → estado · ENERGIA.pinta(elemento) escribe «[icono] 3/5 · próximo en 12:30» · ENERGIA.sinEnergia() · ENERGIA.ofrecer() abre la ventana del caos primordial ilimitado (la «tienda» de los juegos que no tienen una: basta un botón que la llame).
'use strict';
const ENERGIA = (() => {
  // el icono del caos primordial: una espiral dorada y celeste sobre fondo índigo. Distinto del CAOS de las partidas (la barra magenta) para no confundirlos
  const DEFS = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><radialGradient id="en-g" cx="50%" cy="50%" r="55%"><stop offset="0" stop-color="#fff3b0"/><stop offset=".45" stop-color="#ffc83d"/><stop offset="1" stop-color="#2a1a6e"/></radialGradient></defs></svg>';
  const ICONO = px => (document.getElementById('en-defs') || (document.body.insertAdjacentHTML('beforeend', '<div id="en-defs">' + DEFS + '</div>'), 0), '') + `<svg class="en-ico" width="${px}" height="${px}" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5" fill="url(#en-g)" style="stroke: var(--outline, #20102c)" stroke-width="1.6"/><path d="M12 12c1.6 0 2.4-1.6 1.5-2.7-1.4-1.6-4-.8-4.3 1.5-.4 3 2.7 4.8 5.3 3.4 3-1.7 3-6.3-.2-8" fill="none" stroke="#5fe3ff" stroke-width="1.7" stroke-linecap="round"/></svg>`;
  const INVITA = Math.random() < 0.5 ? 'Arkioner' : 'Pepins';   // quien paga por ahora: a veces uno y a veces el otro (de verdad)
  let est = null, cuando = 0, tic = null, tic2 = null, caja = null;
  const dosd = n => String(n).padStart(2, '0'), reloj = s => `${Math.floor(s / 60)}:${dosd(s % 60)}`;
  const hasta = f => { try { return new Date(f).toLocaleDateString(NUCLEO.idioma === 'en' ? 'en-GB' : 'es-ES'); } catch (e) { return ''; } };
  const resta = () => (est && est.proxima_seg != null ? Math.max(0, est.proxima_seg - Math.floor((Date.now() - cuando) / 1000)) : null);
  // cuánto falta para el siguiente punto, de 0 a 100 (la barra de fondo del contador); sin recarga pendiente = 100
  const prog = () => { const r = resta(); return r == null || !est ? 100 : Math.max(0, Math.min(100, Math.round((1 - r / (est.recarga_min * 60)) * 100))); };
  let tinta = null;
  const tintero = () => { if (tinta) return; tinta = setInterval(() => { const b = document.querySelectorAll('.en-wal'); for (const e of b) e.style.setProperty('--p', prog() + '%'); if (est && resta() === 0 && !libre()) api.cargar(); }, 1000); };
  const libre = () => !!(est && est.pase_hasta && new Date(est.pase_hasta) > new Date());
  const api = {
    get estado() { return est; },
    icono: px => ICONO(px),
    get activa() { return !!(est && est.activa); },
    get ilimitada() { return libre(); },
    // ¿se puede avisar de que no queda energía? (el servidor es quien manda; esto solo evita ir a la cola para nada)
    sinEnergia() { return api.activa && !libre() && est.energia < 1 && resta() !== 0; },
    async cargar() {
      if (typeof CUENTA === 'undefined' || !CUENTA.activa || CUENTA.invitado) { est = null; return null; }
      try { est = await CUENTA.rpc('pvp_energia', { p_juego: AJUSTES.id }); cuando = Date.now(); } catch (e) { est = null; }
      tintero(); api.pinta(); api.aseguraTab(); if (typeof updateWallets === 'function') updateWallets(); return est;
    },
    // el servidor devuelve «sin_energia» al intentar entrar en la cola
    esError(e) { return /sin_energia/.test(String((e && e.message) || e)); },
    textoSin() { const r = resta(); return r == null ? tr('Te has quedado sin caos primordial') : tr('Sin caos primordial: el próximo llega en {t}', { t: reloj(r) }); },
    pinta(el, sinBoton) {
      if (el && !sinBoton) caja = el; const dest = sinBoton ? el : caja; if (!dest) return;
      if (!api.activa) { dest.hidden = true; dest.innerHTML = ''; return; }
      dest.hidden = false;
      const r = resta(), recarga = r == null ? '' : `<small>${tr('próximo en {t}', { t: reloj(r) })}</small>`;
      dest.innerHTML = libre() ? `<span class="en-pill">${ICONO(20)} ${tr('CAOS PRIMORDIAL ILIMITADO')}</span><small>${tr('hasta el {f}', { f: hasta(est.pase_hasta) })}</small>`
        : `<span class="en-pill${r == null ? '' : ' carga'}" style="--p:${prog()}%" title="${tr('CAOS PRIMORDIAL')}">${ICONO(20)} <b>${est.energia}/${est.max}</b> <small>${tr('CAOS PRIMORDIAL')}</small></span>${recarga}${sinBoton ? '' : `<button class="en-mas ol" type="button">${tr('ILIMITADO')}</button>`}`;
      const bt = dest.querySelector('.en-mas'); if (bt) bt.onclick = () => { play('select'); api.ofrecer(); };
      clearInterval(sinBoton ? tic2 : tic);
      const t = setInterval(() => { if (!dest.isConnected) { clearInterval(t); return; } if (resta() === 0) { clearInterval(t); api.cargar(); } else api.pinta(dest, sinBoton); }, 1000);
      if (r != null && !libre()) { if (sinBoton) tic2 = t; else tic = t; } else clearInterval(t);
    },
    // la SECCIÓN «Caos primordial» de la tienda (igual en todos los juegos): se pinta dentro de `caja`
    async seccion(caja) {
      await api.cargar();
      if (!api.activa) { caja.innerHTML = `<p class="small-print">${tr('El caos primordial no está disponible ahora mismo.')}</p>`; return; }
      const web = location.pathname.replace(/(games|demos)\/[^/]*\/.*$/, '') + 'energia/?lang=' + IDIOMA.actual;
      caja.innerHTML = `<div class="pack gift en-sec"><div class="pk-ic">${ICONO(54)}</div><div><div class="pk-name ol">${tr('CAOS PRIMORDIAL')}</div>`
        + `<div class="pk-note" id="en-sec-medidor"></div></div></div>`
        + `<div class="pack gift"><div class="pk-ic">${ICONO(46)}</div><div><div class="pk-name ol">${tr('CAOS PRIMORDIAL ILIMITADO')}</div>`
        + `<div class="pk-note">${tr('Juego online sin límite en todos los juegos de Fans Of.')} `
        + `${libre() ? tr('Activa hasta el {f}.', { f: hasta(est.pase_hasta) }) : tr('Por ahora invita {quien}: 3 días gratis.', { quien: INVITA })}</div></div>`
        + `<button class="btn-price ol" id="btn-energia">${libre() ? tr('RENOVAR') : tr('GRATIS')}</button></div>`
        + api.botonAnuncio() + `<p class="small-print">${tr('El caos primordial es la energía del juego online: no es el CAOS de las partidas. Cada partida online gasta 1.')} <a href="${web}" target="_blank" rel="noopener">${tr('Más información en la web')}</a></p>`;
      api.pinta($('#en-sec-medidor'), true); api.enlazaAnuncio(caja); $('#btn-energia').onclick = () => { play('select'); api.ofrecer(); };
    },
    // la pestaña «Caos primordial» de la tienda común (se añade cuando el servidor lo cobra)
    aseguraTab() {
      const t = document.querySelector('#scr-shop .tabs'); if (!t) return;
      let b = t.querySelector('[data-st="caos"]');
      if (api.activa && !b) { b = document.createElement('button'); b.className = 'tab ol'; b.dataset.st = 'caos'; b.setAttribute('aria-pressed', 'false'); b.textContent = tr('Caos primordial'); b.addEventListener('click', () => { shopTab = 'caos'; play('select'); buildShop(); }); t.append(b); }
      else if (!api.activa && b) { b.remove(); if (shopTab === 'caos') shopTab = 'gold'; }
    },
    // vuelve a pintar la sección que se esté viendo (tras activar)
    refresca() {
      const m = $('#scr-energia'); if (m && !m.hidden) api.seccion($('#en-modal'));
      else if (typeof shopTab !== 'undefined' && shopTab === 'caos' && typeof buildShop === 'function') buildShop();
    },
    // el botón del monedero (menú principal, tienda y PvP): [icono n/5]; lleva a la sección de la tienda
    botonMonedero() {
      if (!api.activa) return '';
      return `<button class="wal en-wal${!libre() && est.energia < est.max ? ' carga' : ''}" style="--p:${prog()}%" data-wal="caos" aria-label="${tr('CAOS PRIMORDIAL')}: ${libre() ? tr('ilimitado') : est.energia + '/' + est.max}">${ICONO(20)}${libre() ? '∞' : est.energia + '/' + est.max}<i class="wal-plus ol">+</i></button>`;
    },
    // abre la tienda en la sección del caos primordial: la tienda común si el juego la tiene, y si no una ventana con la misma sección
    abrirTienda() {
      if (typeof openShop === 'function' && $('#scr-shop')) { openShop('caos'); return; }
      let m = $('#scr-energia'); if (!m) { document.body.insertAdjacentHTML('beforeend', '<section id="scr-energia" class="screen modal" hidden><div class="modal-card"><h3 class="ol">' + tr('TIENDA') + '</h3><div id="en-modal" class="en-modal"></div><div class="row"><button class="btn-ghost ol" id="en-cerrar">' + tr('VALE') + '</button></div></div></section>'); m = $('#scr-energia'); $('#en-cerrar').onclick = () => { m.hidden = true; }; }
      m.hidden = false; api.seccion($('#en-modal'));
    },
    // la ventana de «activar»: la misma desde la tienda, desde el contador y desde el aviso de que no queda energía
    ofrecer(sinEnergia) {
      const cabeza = sinEnergia ? `<p><b>${api.textoSin()}</b></p>` : '', web = location.pathname.replace(/(games|demos)\/[^/]*\/.*$/, '') + 'energia/?lang=' + IDIOMA.actual;
      confirmBox(tr('CAOS PRIMORDIAL ILIMITADO'), cabeza + (sinEnergia ? api.botonAnuncio() : '') + `<p>${tr('El caos primordial es la energía del juego online (no es el CAOS de las partidas). Cada partida online gasta 1; con el caos primordial ilimitado juegas online sin límite en todos los juegos de Fans Of.')}</p>`
        + `<p>${tr('El juego online cuesta servidores: el caos primordial ilimitado ayuda a pagarlos y a mejorar los juegos.')}</p>` + `<p>${tr('3 días de juego online sin límite en todos los juegos de Fans Of.')}</p><small>${tr('Versión de prueba: no se cobra nada.')} <a href="${web}" target="_blank" rel="noopener">${tr('Más información en la web')}</a></small>`,
      libre() ? tr('RENOVAR') : tr('ACTIVAR GRATIS'), () => api.activar(), sinEnergia ? tr('ESPERAR') : tr('VALE'));
      api.enlazaAnuncio($('#cf-body'));
    },
    async activar() {
      try { const h = await CUENTA.rpc('pvp_pase_regalo', {}); play('win'); toast(tr('Caos primordial ilimitado hasta el {f}', { f: hasta(h) }), true); await api.cargar(); api.refresca(); }
      catch (err) { play('deny'); toast(/cuenta_no_vinculada/.test(String(err && err.message)) ? tr('Para esto necesitas vincular tu cuenta (Opciones → Cuenta)') : tr('No se ha podido activar: inténtalo luego'), true); }
    },
    // al intentar jugar online sin energía: dice cuánto falta y ofrece la energía ilimitada ya
    avisoSin() { play('deny'); api.ofrecer(true); },
  };
  return api;
})();
// al entrar en la cuenta (y al arrancar) se pregunta la energía, para que la pestaña de la tienda y el medidor salgan sin pasar antes por el PvP
hook('cuenta', () => { ENERGIA.cargar(); });
