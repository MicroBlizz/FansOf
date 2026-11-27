// Fans of Pop · ATRÁS: engancha Pop al botón atrás de core (core/js/sistema/atras.js, hook 'atras'; tarea 446, ADR 242).
// Saca la foto de la pantalla, pregunta a la regla (js/atras-regla.js) y hace lo que toca: cerrar, pulsar la X, la pausa, la portada
// o preguntar si salir. Así atrás ya no te saca del juego a mitad de nivel ni cuesta un corazón al volver.
'use strict';
const PP_ATRAS = (() => {
  const CLASE = 'pp-atras-salir';
  const tarjeta = () => $pp('#pp-tarjeta');
  function foto() {
    const t = tarjeta(), T = PP_P && PP_P.T;
    return {
      pantalla: PP_PANT.actual, ventana: !$pp('#pp-modal').hidden, pausa: PP_PANT.pausa,
      pregunta: !!t && t.classList.contains(CLASE),
      conX: !!(t && t.querySelector(':scope > .pp-cab .pp-cerrar')),
      encima: ppPresentaAbierta() || ppCortActiva(),
      fin: !!(T && (T.hecho || T.parado)),   // nivel ganado (su fiesta) o sin toques: en un momento sale su ventana
    };
  }
  // en la portada: ¿salir de verdad? NO te deja en Pop; SÍ sale (core: a la página de antes o, en la app, la cierra)
  function pregunta() {
    const t = ppAbre(`<h2>${tr('¿Salir de Fans of Pop?')}</h2>`);
    t.classList.add(CLASE);
    const col = document.createElement('div'); col.className = 'pp-columna'; t.appendChild(col);
    col.appendChild(ppBoton(tr('NO, SEGUIR JUGANDO'), 'pp-btn', ppCierra));
    col.appendChild(ppBoton(tr('SÍ, SALIR'), 'pp-btn2 pp-volver', () => { ppCierra(); ATRAS.sal(); }));
  }
  const hace = {
    cierra: () => ppCierra(),
    sigue: () => ppQuitaPausa(),
    x: () => tarjeta().querySelector(':scope > .pp-cab .pp-cerrar').click(),
    pausa: () => ppPausa(),
    portada: () => { ppGuardaCamino(); PP_P = null; ppIrA('titulo'); },   // como INICIO en la barra del camino (js/camino-barra.js)
    pregunta,
    nada: () => {},
  };
  function pulsa() { const que = PP_ATRAS_REGLA.que(foto()); hace[que](); return que; }
  return Object.freeze({ foto, pulsa, CLASE });
})();
hook('atras', () => { PP_ATRAS.pulsa(); });
