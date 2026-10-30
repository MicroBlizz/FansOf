// Fans Of · MENÚ de las páginas de la web (portada, lore, privacidad, condiciones, energía, android): UNA sola fuente, para que sea el mismo en todas y no aparezcan ni desaparezcan secciones.
// Se pone en cada página justo donde va el menú:  <script src="menu.js" data-base="" data-core="1" data-pagina="lore"></script>  (data-base: '' en la portada y '../' en las demás; data-pagina: la que resalta).
// «Entrar» / «Mi cuenta» (con tu foto de Google, si entraste con Google) sale SIEMPRE, en todas las páginas, para que la cabecera sea la misma. En la portada la llevan biblioteca/cuenta-web.js y votos.js (el modal de la cuenta);
// en las demás páginas se lee la sesión guardada (localStorage 'fansof-cuenta') solo para pintar el botón, y al pulsarlo se va a la portada (#cuenta), que abre el modal.
// Pinta el <nav class="menu"> en el sitio del script, de forma síncrona (lo que venga después, como los botones de idioma o «Novedades», ya lo encuentra). El estilo de la barra lo trae cada página
// (portada y lore en su <style>; las demás, core/css/legal.css). data-core="1" si la página carga core (portada y lore). Novedades abre su ventana en la portada (#novedades).
// Idioma: si la página trae core (NUCLEO), él lo cambia; si no, la página define window.pagIdioma(v) y aquí se avisa. Sin core, los nombres del menú se traducen con la pequeña lista de abajo.
'use strict';
(() => {
  const s = document.currentScript, b = s.dataset.base || '', pagina = s.dataset.pagina || '', conCore = s.dataset.core === '1';   // conCore: la página carga core (portada y lore), que traduce y cambia el idioma
  let idioma = ''; try { idioma = localStorage.getItem('fansof-idioma') || ''; } catch (e) { /* sin guardar */ }
  const en = (idioma || new URLSearchParams(location.search).get('lang') || navigator.language || 'es').slice(0, 2) === 'en';
  const EN = { Inicio: 'Home', Novedades: 'News', Biblioteca: 'Library', 'En pausa': 'On hold', Lore: 'Lore', Privacidad: 'Privacy', Condiciones: 'Terms', Entrar: 'Sign in', 'Mi cuenta': 'My account' };
  const t = x => (en && !conCore && EN[x]) || x;   // con core lo traduce la propia página
  const a = (href, txt, extra = '', id = '') => `<a href="${href}"${id ? ` id="${id}"` : ''}${extra}>${t(txt)}</a>`;
  const on = p => (pagina === p ? ' class="on" aria-current="page"' : '');
  s.insertAdjacentHTML('beforebegin', '<nav class="menu" aria-label="Menú">\n  '
    + a(b + '#inicio', 'Inicio') + a(b + '#novedades', 'Novedades', '', 'abrir-novedades') + a(b + '#biblioteca', 'Biblioteca') + a(b + '#en-pausa', 'En pausa')
    + a(b + 'lore/', 'Lore', on('lore')) + a(b + 'privacidad/', 'Privacidad', on('privacidad')) + a(b + 'condiciones/', 'Condiciones', on('condiciones'))
    + '\n  <a href="' + b + '#cuenta" id="m-cuenta" class="m-cuenta">' + t('Entrar') + '</a>'
    + '\n  <span class="idiomas"><a href="#" data-idioma="es">ES</a> · <a href="#" data-idioma="en">EN</a> · <a href="#" data-idioma="">Auto</a></span>\n</nav>');
  // el botón de la cuenta: su estilo vive aquí (una sola vez para todas las páginas); la foto y el texto los pone pintaMenuCuenta
  const css = document.createElement('style');
  css.textContent = 'nav.menu a.m-cuenta { color: var(--gold); display: inline-flex; align-items: center; gap: 7px; }\n'
    + 'nav.menu a.m-cuenta.dentro { color: var(--player-lite, #9fd8ff); }\n'
    + 'nav.menu a.m-cuenta::before, nav.menu a.m-cuenta::after { content: ""; width: 3px; height: 22px; background: rgba(255, 255, 255, .6); border-radius: 2px; flex: none; }\n'
    + 'nav.menu a.m-cuenta::before { order: -2; margin-right: 8px; }\n'
    + 'nav.menu a.m-cuenta::after { margin-left: 8px; }\n'
    + 'nav.menu a.m-cuenta .m-foto { order: -1; width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--outline); object-fit: cover; }';
  document.head.append(css);
  const cta = document.getElementById('m-cuenta');
  // con: ¿hay cuenta con email?; foto: la de Google (https) o ''; texto: ya traducido. La foto va sin referrer (Google no sabe de qué página viene) y se quita sola si no carga.
  window.pintaMenuCuenta = (con, foto, texto) => {
    cta.textContent = ''; cta.classList.toggle('dentro', !!con);
    if (con && /^https:\/\//.test(foto || '')) { const im = document.createElement('img'); im.className = 'm-foto'; im.alt = ''; im.referrerPolicy = 'no-referrer'; im.src = foto; im.onerror = () => im.remove(); cta.append(im); }
    cta.append(document.createTextNode(texto));
  };
  let ses = null; try { ses = JSON.parse(localStorage.getItem('fansof-cuenta') || 'null'); } catch (e) { /* sin sesión */ }
  const con = !!(ses && ses.invitado === false && ses.email);
  window.pintaMenuCuenta(con, con ? ses.foto : '', t(con ? 'Mi cuenta' : 'Entrar'));
  cta.addEventListener('click', e => { if (window.abrirCuenta) return; e.preventDefault(); location.href = b + '#cuenta'; });   // en la portada lo gestiona cuenta-web.js
  for (const x of document.querySelectorAll('nav.menu [data-idioma]')) x.addEventListener('click', e => {
    e.preventDefault(); if (conCore) return;   // la portada y lore lo hacen con core (NUCLEO.elegirIdioma)
    const v = x.dataset.idioma; try { if (v) localStorage.setItem('fansof-idioma', v); else localStorage.removeItem('fansof-idioma'); } catch (err) { /* sin guardar */ }
    if (window.pagIdioma) window.pagIdioma(v || (/^en/i.test(navigator.language || '') ? 'en' : 'es')); else location.reload();
  });
})();
