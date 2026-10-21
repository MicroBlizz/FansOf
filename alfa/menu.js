// Fans Of · MENÚ de las páginas de la web (portada, lore, privacidad, condiciones, energía, android): UNA sola fuente, para que sea el mismo en todas y no aparezcan ni desaparezcan secciones.
// Se pone en cada página justo donde va el menú:  <script src="menu.js" data-base="" data-core="1" data-pagina="lore"></script>  (data-base: '' en la portada y '../' en las demás; data-pagina: la que resalta).
// Pinta el <nav class="menu"> en el sitio del script, de forma síncrona (lo que venga después, como los botones de idioma o «Novedades», ya lo encuentra). El estilo de la barra lo trae cada página
// (portada y lore en su <style>; las demás, core/css/legal.css). data-core="1" si la página carga core (portada y lore). «Entrar» sale oculto: solo lo enseña la portada (necesita core). Novedades abre su ventana en la portada (#novedades).
// Idioma: si la página trae core (NUCLEO), él lo cambia; si no, la página define window.pagIdioma(v) y aquí se avisa. Sin core, los nombres del menú se traducen con la pequeña lista de abajo.
'use strict';
(() => {
  const s = document.currentScript, b = s.dataset.base || '', pagina = s.dataset.pagina || '', conCore = s.dataset.core === '1';   // conCore: la página carga core (portada y lore), que traduce y cambia el idioma
  let idioma = ''; try { idioma = localStorage.getItem('fansof-idioma') || ''; } catch (e) { /* sin guardar */ }
  const en = (idioma || new URLSearchParams(location.search).get('lang') || navigator.language || 'es').slice(0, 2) === 'en';
  const EN = { Inicio: 'Home', Novedades: 'News', Biblioteca: 'Library', 'En pausa': 'On hold', Lore: 'Lore', Privacidad: 'Privacy', Condiciones: 'Terms', Entrar: 'Sign in' };
  const t = x => (en && !conCore && EN[x]) || x;   // con core lo traduce la propia página
  const a = (href, txt, extra = '', id = '') => `<a href="${href}"${id ? ` id="${id}"` : ''}${extra}>${t(txt)}</a>`;
  const on = p => (pagina === p ? ' class="on" aria-current="page"' : '');
  s.insertAdjacentHTML('beforebegin', '<nav class="menu" aria-label="Menú">\n  '
    + a(b + '#inicio', 'Inicio') + a(b + '#novedades', 'Novedades', '', 'abrir-novedades') + a(b + '#biblioteca', 'Biblioteca') + a(b + '#en-pausa', 'En pausa')
    + a(b + 'lore/', 'Lore', on('lore')) + a(b + 'privacidad/', 'Privacidad', on('privacidad')) + a(b + 'condiciones/', 'Condiciones', on('condiciones'))
    + '\n  <a href="#" id="m-cuenta" class="m-cuenta" hidden>' + t('Entrar') + '</a>'
    + '\n  <span class="idiomas"><a href="#" data-idioma="es">ES</a> · <a href="#" data-idioma="en">EN</a> · <a href="#" data-idioma="">Auto</a></span>\n</nav>');
  for (const x of document.querySelectorAll('nav.menu [data-idioma]')) x.addEventListener('click', e => {
    e.preventDefault(); if (conCore) return;   // la portada y lore lo hacen con core (NUCLEO.elegirIdioma)
    const v = x.dataset.idioma; try { if (v) localStorage.setItem('fansof-idioma', v); else localStorage.removeItem('fansof-idioma'); } catch (err) { /* sin guardar */ }
    if (window.pagIdioma) window.pagIdioma(v || (/^en/i.test(navigator.language || '') ? 'en' : 'es')); else location.reload();
  });
})();
