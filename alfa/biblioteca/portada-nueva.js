// Fans Of · LA PORTADA NUEVA («Arcade nocturno», tarea #69): el rediseño de la portada, tras el flag «portada-nueva» (servidor/143: abierto solo en la alfa).
// Con el flag, <html> lleva la clase «portada-nueva» (los colores y el orden los pone biblioteca/portada-nueva.css) y aquí se añaden las piezas que no existían:
//   · el titular «Microblizz lo ha comprado todo» con CrazyBunny en la cabecera (el pintado de Fans of Rumble, animado; tocarlo le hace lanzar la zanahoria),
//   · el bloque «Tú decides cuál terminamos» alrededor de LOS MÁS PEDIDOS (agrupar.js lo crea cuando contesta el servidor), con su botón IR A VOTAR,
//   · la barra fija de abajo en el móvil (Inicio, Juegos, Votar, Novedades y Lore) y el logo del menú.
// Las piezas llevan la clase «pn»: sin el flag no se ven (portada-nueva.css), así que cerrarlo devuelve la portada de siempre sin recargar.
// Usa lo que ya hay en la página: t(), esc(), NUCLEO.flag y abrirNovedades() (novedades/ventana.js).
'use strict';
(() => {
  const FLAG = 'portada-nueva';
  const activa = () => NUCLEO.flag(FLAG, 'Portada rediseñada de la web (Arcade nocturno, tarea #69)');
  const ICONOS = {   // trazos sencillos con el contorno de Fans Of: nada de emojis
    inicio: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    juegos: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    votar: '<path d="M12 20V4M5 11l7-7 7 7"/>',
    novedades: '<path d="M4 5h16M4 12h16M4 19h10"/>',
    lore: '<path d="M4 4h7a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-7a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h7z"/>',
  };
  const icono = n => `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${ICONOS[n]}</svg>`;
  // a dónde lleva «Votar»: al bloque de los más pedidos si ya ha llegado; si no, a los prototipos (el hash los despliega, agrupar.js)
  const sitioVotar = () => (document.getElementById('mas-pedidos') ? '#mas-pedidos' : '#prototipos');

  function titular() {
    const hero = document.getElementById('inicio');
    if (!hero || hero.querySelector('.pn-titular')) return;
    hero.querySelector('h1').insertAdjacentHTML('afterend', `<div class="pn pn-titular">
      <div class="pn-textos"><p class="pn-grito ol" role="heading" aria-level="1">${esc(t('MICROBLIZZ LO HA'))} <span>${esc(t('COMPRADO TODO.'))}</span></p>
      <p class="pn-lema">${esc(t('Elige cómo pararle los pies.'))}</p></div>
      <button type="button" class="pn-bunny" aria-label="CrazyBunny"></button></div>`);
    // CrazyBunny (el pintado de Fans of Rumble) respira en bucle; al tocarlo lanza la zanahoria una vez y vuelve
    const bunny = hero.querySelector('.pn-bunny');
    bunny.addEventListener('click', () => { bunny.classList.remove('ataca'); void bunny.offsetWidth; bunny.classList.add('ataca'); });
    bunny.addEventListener('animationend', e => { if (e.animationName === 'pn-ataque') bunny.classList.remove('ataca'); });
  }
  function logo() {
    const nav = document.querySelector('nav.menu');
    if (nav && !nav.querySelector('.pn-logo')) nav.insertAdjacentHTML('afterbegin', `<a class="pn pn-logo ol" href="#inicio">FANS OF</a>`);
  }
  function barra() {
    if (document.querySelector('.pn-barra')) return;
    const enlace = (href, n, txt) => `<a href="${href}" data-pn="${n}">${icono(n)}<span>${esc(t(txt))}</span></a>`;
    document.body.insertAdjacentHTML('beforeend', `<nav class="pn pn-barra" aria-label="${esc(t('Accesos'))}">`
      + enlace('#inicio', 'inicio', 'Inicio') + enlace('#biblioteca', 'juegos', 'Juegos') + enlace('#prototipos', 'votar', 'Votar')
      + enlace('#novedades', 'novedades', 'Novedades') + enlace('lore/', 'lore', 'Lore') + '</nav>');
    const b = document.querySelector('.pn-barra');
    b.querySelector('[data-pn="votar"]').addEventListener('click', e => { e.currentTarget.href = sitioVotar(); });
    b.querySelector('[data-pn="novedades"]').addEventListener('click', e => {
      if (typeof abrirNovedades !== 'function') return;   // sin la ventana, el enlace baja a #novedades como siempre
      e.preventDefault(); abrirNovedades(e.currentTarget);
    });
  }
  // TÚ DECIDES CUÁL TERMINAMOS: envuelve LOS MÁS PEDIDOS cuando aparece (lo crea agrupar.js al contestar el servidor; sin respuesta no sale)
  function bloqueVotar() {
    const sec = document.getElementById('mas-pedidos');
    if (!sec || sec.querySelector('.pn-votar')) return !!sec;
    sec.insertAdjacentHTML('afterbegin', `<div class="pn pn-votar"><p class="pn-votar-t">${esc(t('TÚ DECIDES CUÁL TERMINAMOS'))}</p>
      <p class="pn-votar-p">${esc(t('Juega los prototipos y vota en su ficha: lo que más pedís es en lo que nos centramos.'))}</p></div>`);
    sec.insertAdjacentHTML('beforeend', `<a class="pn pn-ir-votar ol" href="#prototipos">${esc(t('IR A VOTAR'))}</a>`);
    return true;
  }
  function esperarVotar() {
    if (bloqueVotar()) return;
    const bib = document.getElementById('biblioteca'); if (!bib) return;
    const ojo = new MutationObserver(() => { if (bloqueVotar()) ojo.disconnect(); });
    ojo.observe(bib, { childList: true });
  }

  let montada = false;
  function aplicar() {
    const si = activa();
    document.documentElement.classList.toggle('portada-nueva', si);
    if (!si || montada) return;
    montada = true;
    logo(); titular(); barra(); esperarVotar();
  }
  aplicar();
  NUCLEO.alCambiarFlags(aplicar);   // los flags de la base llegan de fondo (y cada 5 minutos): abrir o cerrar se nota sin recargar
})();
