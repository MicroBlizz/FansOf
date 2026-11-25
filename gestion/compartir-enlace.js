// Fans Of · /gestion · el botón «Enlace» de arriba (tarea #338, ADR 211): copia la dirección de donde se está (GESTION_NAV la arma con enlace.js) y lo dice
// en el propio botón un par de segundos. Si el portapapeles no deja (sin permiso, o un navegador viejo), abre la hoja de compartir del sistema si la hay.
// En la app instalada del móvil no hay barra de direcciones: este botón es la forma de sacar el enlace. El navegador y el reloj llegan como parámetros.
'use strict';
const GESTION_COMPARTIR_ENLACE = Object.freeze({
  ICONO: '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">'
    + '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/></svg>',
  ESPERA: 2000,   // ms que el botón dice «Copiado»
  // Resultado: 'copiado', 'compartido', 'cancelado' (se cerró la hoja) o 'fallo' (ni portapapeles ni hoja)
  async copia({ titulo, enlace }, navegador) {
    try {
      await navegador.clipboard.writeText(enlace);
      return 'copiado';
    } catch (e) {
      if (typeof navegador.share !== 'function') return 'fallo';
    }
    try {
      await navegador.share({ title: titulo, url: enlace });
      return 'compartido';
    } catch (e) {
      return e && e.name === 'AbortError' ? 'cancelado' : 'fallo';
    }
  },
  // boton: el botón «Enlace» (su texto va en un <span>); m: { titulo, enlace }
  async comparte(boton, m, { navegador, temporizador = (f, ms) => setTimeout(f, ms) }) {
    const r = await this.copia(m, navegador || {});
    const texto = { copiado: 'Copiado', fallo: 'No se pudo copiar' }[r];
    const span = boton.querySelector('span');
    if (!texto || !span) return r;
    span.textContent = texto;
    temporizador(() => { span.textContent = 'Enlace'; }, this.ESPERA);
    return r;
  },
});
