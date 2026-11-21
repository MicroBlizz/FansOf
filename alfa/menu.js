// Fans Of · MENÚ de las páginas de la web (portada, lore, privacidad, condiciones, borrar la cuenta, energía, android y apóyanos): UNA sola fuente, para que sea el mismo en todas.
// Se pone en cada página justo donde va el menú, detrás de idioma-web.js:  <script src="menu.js" data-base="" data-core="1" data-pagina="lore"></script>
//   data-base: '' en la portada y '../' en las demás · data-pagina: la que resalta · data-core="1": la página traduce con core (portada y lore).
// Pinta, de forma síncrona (lo que venga después ya lo encuentra):
//   · el <nav class="menu"> de arriba, con «Entrar» / «Mi cuenta» (con tu foto de Google) y los idiomas. En la portada la cuenta la llevan
//     biblioteca/cuenta-web.js y votos.js; en las demás se lee la sesión guardada ('fansof-cuenta') solo para pintar el botón, y al pulsarlo se va a la portada (#cuenta);
//   · las piezas del estilo nuevo (clase «pn»: solo se ven con html.portada-nueva, ADR 128 y 135): el logo del menú, el enlace «Apóyanos» (tarea #291) y la barra de abajo del móvil;
//   · «Tablero» (tarea #300): el atajo a gestion/?seccion=tablero, SOLO con el rol admin (CUENTA.roles, que en la portada se carga después de este archivo:
//     se mira al terminar de leer la página y cada vez que cambian los roles). Va en el menú de arriba y en la barra de abajo del móvil. Sin la cuenta de core
//     (las páginas que no la cargan), sin sesión, sin rol o sin red no sale nada.
// El aspecto, todo en estilo/web.css. Novedades abre su ventana en la portada (#novedades).
// Idioma: con core lo cambia él (NUCLEO.elegirIdioma, lo engancha la página); sin core se avisa a window.pagIdioma(v) y los nombres salen de la lista de abajo.
'use strict';
(() => {
  const s = document.currentScript, b = s.dataset.base || '', pagina = s.dataset.pagina || '', conCore = s.dataset.core === '1';
  const EN = { Inicio: 'Home', Novedades: 'News', Biblioteca: 'Library', Lore: 'Lore', Privacidad: 'Privacy', Condiciones: 'Terms', Entrar: 'Log in', 'Mi cuenta': 'My account',
    Juegos: 'Games', Votar: 'Vote', Accesos: 'Shortcuts', 'Apóyanos': 'Support us', Tablero: 'Board' };
  const en = IDIOMA_WEB.elegido() === 'en';
  const t = x => (en && !conCore && EN[x]) || x;   // con core lo traduce la propia página
  const ICONOS = {   // trazos sencillos con el contorno de Fans Of: nada de emojis
    inicio: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    juegos: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    votar: '<path d="M12 20V4M5 11l7-7 7 7"/>',
    novedades: '<path d="M4 5h16M4 12h16M4 19h10"/>',
    lore: '<path d="M4 4h7a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-7a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h7z"/>',
    tablero: '<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="11" rx="1.5"/><rect x="17" y="4" width="4" height="7" rx="1.5"/>',
  };
  const icono = n => `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${ICONOS[n]}</svg>`;
  const a = (href, txt, extra = '', id = '') => `<a href="${href}"${id ? ` id="${id}"` : ''}${extra}>${t(txt)}</a>`;
  const on = p => (pagina === p ? ' class="on" aria-current="page"' : '');
  const deBarra = (href, n, txt) => `<a href="${href}" data-pn="${n}">${icono(n)}<span>${t(txt)}</span></a>`;

  const arriba = '<nav class="menu" aria-label="Menú">\n  '
    + `<a class="pn pn-logo ol" href="${b}#inicio" translate="no">FANS OF</a>`
    + a(b + '#inicio', 'Inicio') + a(b + '#novedades', 'Novedades', '', 'abrir-novedades') + a(b + '#biblioteca', 'Biblioteca')
    + a(b + 'lore/', 'Lore', on('lore')) + a(b + 'privacidad/', 'Privacidad', on('privacidad')) + a(b + 'condiciones/', 'Condiciones', on('condiciones'))
    + `<a class="pn pn-apoya${pagina === 'apoyanos' ? ' on" aria-current="page' : ''}" href="${b}apoyanos/">${t('Apóyanos')}</a>`
    + '\n  <a href="' + b + '#cuenta" id="m-cuenta" class="m-cuenta">' + t('Entrar') + '</a>'
    + '\n  <span class="idiomas"><a href="#" data-idioma="es" translate="no">ES</a> · <a href="#" data-idioma="en" translate="no">EN</a> · <a href="#" data-idioma="">Auto</a></span>\n</nav>';
  // la barra de abajo del móvil: en la portada, «Votar» y «Novedades» las afina biblioteca/portada-nueva.js (el bloque de votar, la ventana)
  const abajo = `<nav class="pn pn-barra" aria-label="${t('Accesos')}">`
    + deBarra(b + '#inicio', 'inicio', 'Inicio') + deBarra(b + '#biblioteca', 'juegos', 'Juegos') + deBarra(b + '#catalogo', 'votar', 'Votar')
    + deBarra(b + '#novedades', 'novedades', 'Novedades') + deBarra(b + 'lore/', 'lore', 'Lore') + '</nav>';
  s.insertAdjacentHTML('beforebegin', arriba + '\n' + abajo);

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
  // «Tablero», solo para admins: se pone o se quita según CUENTA.roles.tiene('admin')
  const TABLERO = b + 'gestion/?seccion=tablero';
  function ponTablero(si) {
    const hay = [...document.querySelectorAll('[data-tablero]')];
    if (si === (hay.length > 0)) return;
    if (!si) { hay.forEach(x => x.remove()); return; }
    cta.insertAdjacentHTML('beforebegin', `<a class="m-tablero" href="${TABLERO}" data-tablero>${t('Tablero')}</a>`);
    const barra = document.querySelector('nav.pn-barra');
    if (barra) barra.insertAdjacentHTML('beforeend', `<a href="${TABLERO}" data-pn="tablero" data-tablero>${icono('tablero')}<span>${t('Tablero')}</span></a>`);
  }
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof CUENTA === 'undefined' || !CUENTA.roles) return;   // página sin la cuenta de core: sin atajo
    const mira = () => ponTablero(CUENTA.roles.tiene('admin'));   // lo recordado (vale sin red); un invitado o sin sesión no tiene roles
    mira();
    if (typeof hook === 'function') hook('roles', mira);          // otro que pregunte (Mi cuenta) también lo pone al día
    if (!CUENTA.invitado) CUENTA.roles.refrescar(['admin']).then(mira, () => { /* sin red: vale lo recordado */ });
  });
  for (const x of document.querySelectorAll('nav.menu [data-idioma]')) x.addEventListener('click', e => {
    e.preventDefault(); if (conCore) return;   // la portada y lore lo hacen con core (NUCLEO.elegirIdioma)
    const idioma = IDIOMA_WEB.elegir(x.dataset.idioma);
    if (window.pagIdioma) window.pagIdioma(idioma); else location.reload();
  });
})();
