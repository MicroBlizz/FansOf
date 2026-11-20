// Fans Of · LA PORTADA NUEVA («Arcade nocturno», tarea #69): las piezas del rediseño que solo tiene la portada, tras el flag «portada-nueva» (servidor/143: abierto solo en la alfa).
// La clase «portada-nueva» de <html> la pone estilo/estilo-nuevo.js y el logo y la barra de abajo los monta menu.js, para todas las páginas (ADR 135). Aquí se añade:
//   · el titular «Microblizz lo ha comprado todo» con CrazyBunny en la cabecera (el pintado de Fans of Rumble, animado; tocarlo le hace lanzar la zanahoria),
//   · el bloque «Tú decides cuál terminamos» alrededor de LOS MÁS PEDIDOS (agrupar.js lo crea cuando contesta el servidor), con su botón IR A VOTAR,
//   · y lo que la barra de abajo hace distinto en la portada («Votar» y «Novedades»).
// Las piezas llevan la clase «pn»: sin el flag no se ven (estilo/web.css), así que cerrarlo devuelve la portada de siempre sin recargar.
// Usa lo que ya hay en la página: t(), esc(), ESTILO_NUEVO, NUCLEO.alCambiarFlags y abrirNovedades() (novedades/ventana.js).
'use strict';
(() => {
  // a dónde lleva «Votar»: al bloque de los más pedidos si ya ha llegado; si no, al catálogo de todos los juegos (portada-catalogo.js, tarea #277)
  const sitioVotar = () => (document.getElementById('mas-pedidos') ? '#mas-pedidos' : '#catalogo');

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
  // la barra de abajo la monta menu.js para todas las páginas; aquí, lo que solo sabe la portada: a dónde lleva «Votar» y la ventana de novedades
  function barra() {
    const b = document.querySelector('.pn-barra'); if (!b) return;
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
    sec.insertAdjacentHTML('beforeend', `<a class="pn pn-ir-votar ol" href="#catalogo">${esc(t('IR A VOTAR'))}</a>`);
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
    if (!ESTILO_NUEVO.activo() || montada) return;
    montada = true;
    titular(); barra(); esperarVotar();
  }
  aplicar();
  NUCLEO.alCambiarFlags(aplicar);   // los flags de la base llegan de fondo (y cada 5 minutos): abrir o cerrar se nota sin recargar
})();
