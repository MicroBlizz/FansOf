// Fans Of · ANUNCIOS: la capa común para ver un anuncio con premio (docs/guia/core/anuncios.md, ADR 012).
// Un juego solo llama a `await ANUNCIOS.ver('sitio')` y, si devuelve { visto: true }, da el premio. Cupos, premio y servidor son del juego.
// Quién sirve el anuncio: AdMob dentro de la app de Android, H5 Games Ads (AdSense) en la web, y NUESTRO anuncio (el de Microblizz) cuando el flag
// «anuncios» está cerrado o el de verdad no puede cargarse (sin relleno, sin red, bloqueador, sin permiso, sin claves). Así el jugador nunca se queda sin premio.
// Menores: siempre anuncios no personalizados y de contenido infantil; solo con premio y porque el jugador pulsa; nunca en mitad de la partida.
// Las claves no van aquí: están en la config del servidor, clave `anuncios` ({ h5: { cliente: 'ca-pub-…', prueba: true }, admob: { unidad: 'ca-app-pub-…' } }).
// La app necesita el plugin nativo `Anuncios` (android-app, aún por escribir): mostrarRecompensa({ unidad, menores: true }) → { visto }. Sin él, cae a nuestro anuncio.
'use strict';
const ANUNCIOS = (() => {
  const SEG = 5;                 // lo que dura nuestro anuncio
  const ESPERA_H5 = 8000;        // si la web no responde en tanto, se da por no cargado
  const CLAVE_PERMISO = 'fansof-anuncios';   // 'si' | 'no': el permiso para cargar anuncios de Google en la web (nada de Google se carga sin él)
  const abierto = () => NUCLEO.flag('anuncios', 'Anuncios de verdad (AdMob en la app, H5 Games Ads en la web); cerrado, solo el anuncio propio', false);
  const config = () => NUCLEO.configRemota('anuncios') || {};
  const permiso = () => { try { return localStorage.getItem(CLAVE_PERMISO) || ''; } catch (e) { return ''; } };
  const guardaPermiso = v => { try { localStorage.setItem(CLAVE_PERMISO, v); } catch (e) { /* vale para esta sesión */ } };
  let ultimo = null;             // { sitio, via, motivo } del último anuncio, para pruebas y para medir cuánto cae a la reserva

  // ---------- AdMob (app de Android) ----------
  const admob = (() => {
    let P = null;
    const plugin = () => {
      if (P !== null) return P;
      const C = window.Capacitor;
      P = (C && typeof C.isNativePlatform === 'function' && C.isNativePlatform() && typeof C.isPluginAvailable === 'function' && C.isPluginAvailable('Anuncios') && typeof C.registerPlugin === 'function' ? C.registerPlugin('Anuncios') : false);
      return P;
    };
    return {
      nombre: 'admob',
      motivoNo: () => !NUCLEO.nativa ? 'no_app' : !plugin() ? 'sin_plugin' : !config().admob || !config().admob.unidad ? 'sin_claves' : '',
      async mostrar() { const r = await plugin().mostrarRecompensa({ unidad: config().admob.unidad, menores: true }); return r && r.visto ? 'visto' : r && r.cerrado ? 'cerrado' : 'fallo'; },
    };
  })();

  // ---------- H5 Games Ads (web) ----------
  const h5 = (() => {
    let cargado = null;
    const cargar = cliente => cargado || (cargado = new Promise((ok, mal) => {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adBreak = window.adConfig = o => { window.adsbygoogle.push(o); };
      const s = document.createElement('script'); s.async = true; s.crossOrigin = 'anonymous';
      s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(cliente);
      s.dataset.adClient = cliente; s.dataset.tagForChildDirectedTreatment = '1'; s.dataset.tagForUnderAgeOfConsent = '1';
      if (config().h5.prueba) s.dataset.adbreakTest = 'on';
      s.onload = () => { window.adConfig({ preloadAdBreaks: 'on', sound: 'on' }); ok(); }; s.onerror = () => { cargado = null; mal(new Error('bloqueado')); };
      document.head.append(s);
    }));
    return {
      nombre: 'h5',
      motivoNo: () => NUCLEO.nativa ? 'es_app' : !config().h5 || !config().h5.cliente ? 'sin_claves' : permiso() === 'no' ? 'sin_permiso' : '',
      async mostrar(sitio) {
        await cargar(config().h5.cliente);
        return new Promise(fin => {
          let visto = false, cierre = setTimeout(() => fin('fallo'), ESPERA_H5);
          window.adBreak({
            type: 'reward', name: String(sitio),
            beforeReward: mostrarAnuncio => { clearTimeout(cierre); cierre = 0; mostrarAnuncio(); },   // el jugador ya ha pulsado «ver anuncio»
            adViewed: () => { visto = true; },
            adBreakDone: info => { clearTimeout(cierre); fin(visto || (info && info.breakStatus === 'viewed') ? 'visto' : info && info.breakStatus === 'dismissed' ? 'cerrado' : 'fallo'); },
          });
        });
      },
    };
  })();

  // ---------- pantallas: nuestro anuncio y la pregunta del permiso ----------
  const capa = html => {
    let ov = document.getElementById('anuncio-capa');
    if (!ov) { document.body.insertAdjacentHTML('beforeend', '<section id="anuncio-capa" class="en-ad" role="dialog" hidden></section>'); ov = document.getElementById('anuncio-capa'); }
    ov.setAttribute('aria-label', tr('Anuncio')); ov.innerHTML = html; ov.hidden = false; return ov;
  };
  const cierra = () => { const ov = document.getElementById('anuncio-capa'); if (ov) ov.hidden = true; };

  // en la web, antes de cargar nada de Google se pide permiso una vez (la respuesta se guarda en este navegador)
  const pidePermiso = () => new Promise(fin => {
    const ov = capa(`<div class="en-ad-card"><span class="en-ad-flag">${tr('ANUNCIO')}</span><p>${tr('¿Ver anuncios de Google a cambio de premios? Nunca son personalizados y siempre los eliges tú.')}</p><button class="btn-big ol" data-si>${tr('SÍ, VER ANUNCIOS')}</button><button class="btn-link" data-no>${tr('No, gracias')}</button></div>`);
    ov.querySelector('[data-si]').onclick = () => { guardaPermiso('si'); cierra(); fin(true); };
    ov.querySelector('[data-no]').onclick = () => { guardaPermiso('no'); cierra(); fin(false); };
  });

  // nuestro anuncio: 5 s con la miniatura de otro juego nuestro (PROMO); `motivo` vacío = anuncio de prueba con el flag cerrado
  const propio = motivo => new Promise(fin => {
    const nota = motivo ? tr('Este anuncio es nuestro: el de verdad no ha podido cargar.') : tr('Anuncio de prueba. En la app de Google Play aquí saldrá un anuncio de verdad.');
    const ov = capa(`<div class="en-ad-card"><span class="en-ad-flag">${tr('ANUNCIO')}</span><p>${tr('Un mensaje de nuestros patrocinadores… que somos nosotros.')}</p><div data-promo></div><div class="en-ad-bar"><i></i></div><button class="btn-big ol" data-ok disabled>…</button><button class="btn-link" data-no>${tr('Cerrar sin premio')}</button><small>${nota}</small></div>`);
    const pr = ov.querySelector('[data-promo]'); pr.innerHTML = PROMO.html(); PROMO.enlaza(pr);
    const ok = ov.querySelector('[data-ok]'), barra = ov.querySelector('.en-ad-bar'); let t = SEG, corre = 0;
    if (typeof play === 'function') play('select');
    const tic = () => {
      if (t > 0) { ok.textContent = tr('El premio llega en {t}…', { t }); barra.style.setProperty('--p', ((SEG - t) / SEG * 100) + '%'); t--; corre = setTimeout(tic, 1000); return; }
      barra.style.setProperty('--p', '100%'); ok.disabled = false; ok.textContent = tr('RECOGER PREMIO'); if (typeof play === 'function') play('levelup');
    };
    tic();
    ok.onclick = () => { if (t > 0) return; cierra(); if (typeof play === 'function') play('crown'); fin(true); };
    ov.querySelector('[data-no]').onclick = () => { clearTimeout(corre); cierra(); if (typeof play === 'function') play('select'); if (typeof toast === 'function') toast(tr('Anuncio cerrado: sin premio')); fin(false); };
  });

  // ---------- la llamada de los juegos ----------
  // Devuelve { visto, via, motivo }: `visto` = dale el premio; `via` = 'admob' | 'h5' | 'propio' | 'prueba'; `motivo` = por qué cayó a nuestro anuncio.
  async function ver(sitio) {
    const fin = (visto, via, motivo) => { ultimo = { sitio, via, motivo: motivo || '' }; if (typeof fire === 'function') { try { fire('anuncio', ultimo); } catch (e) { /* el juego no lo escucha */ } } return { visto, via, motivo: motivo || '' }; };
    if (!abierto()) return fin(await propio(''), 'prueba');
    const ad = NUCLEO.nativa ? admob : h5;
    let motivo = ad.motivoNo();
    if (!motivo && ad === h5 && permiso() !== 'si' && !(await pidePermiso())) motivo = 'sin_permiso';
    if (!motivo) {
      let r = 'fallo';
      try { r = await ad.mostrar(sitio); } catch (e) { motivo = 'error'; }
      if (r === 'visto') return fin(true, ad.nombre);
      if (r === 'cerrado') return fin(false, ad.nombre);   // lo cerró el jugador: sin premio y sin anuncio nuestro detrás
      motivo = motivo || 'sin_relleno';
    }
    return fin(await propio(motivo), 'propio', motivo);
  }
  return { ver, abierto, ultimo: () => ultimo, permiso, borraPermiso: () => guardaPermiso('') };
})();
