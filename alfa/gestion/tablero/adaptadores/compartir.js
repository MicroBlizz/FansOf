// Fans Of · /gestion · TABLERO · adaptador · COMPARTIR (tarea #302, Pepins): el botón «Compartir» del detalle de una tarea (icono de trazo, como los de
// gestion/nav.js, y 44 px) y lo que hace al pulsarlo: con navigator.share (el móvil) abre la hoja de compartir del sistema; si no la hay, o falla por algo
// que no es cancelar, abre WhatsApp (wa.me) en una pestaña nueva con el mensaje y el enlace. El mensaje lo arma el dominio (TABLERO.mensajeCompartir).
// El navegador y la forma de abrir la pestaña llegan como parámetros (principal.js), así que se prueba en Node.
'use strict';
TABLERO.vistaCompartir = (() => {
  const ICONO = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">'
    + '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4"/></svg>';
  const boton = t => `<button type="button" class="tb-compartir" data-compartir="${t.id}" aria-label="Compartir la tarea #${t.id}" title="Compartir">${ICONO}<span>Compartir</span></button>`;
  // En la cabecera del detalle, junto a «Cerrar» (que deja de empujarse a la derecha: ya lo hace este; la cabecera se centra en alto y no por la línea base, que el icono solo no tiene). En pantallas estrechas, solo el icono
  const ESTILO = '.tb-panel .cab:has(.tb-compartir){align-items:center}.tb-panel .cab .tb-compartir{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:44px;min-width:44px;font-weight:600}'
    + '.tb-panel .cab .tb-compartir+[data-cerrar]{margin-left:0;min-height:44px}@media(max-width:480px){.tb-compartir span{display:none}}';
  const WHATSAPP = 'https://wa.me/?text=';
  const enlaceWhatsapp = m => WHATSAPP + encodeURIComponent(m.completo);

  // m: el mensaje del dominio; navegador: algo con share() opcional (navigator); abrir(url): abre una pestaña nueva.
  // Resultado: 'compartido', 'cancelado' (quien comparte cerró la hoja: no se dice nada) o 'whatsapp'
  async function comparte(m, { navegador, abrir }) {
    if (navegador && typeof navegador.share === 'function') {
      try {
        await navegador.share({ title: m.titulo, text: m.texto, url: m.enlace });
        return 'compartido';
      } catch (e) {
        if (e && e.name === 'AbortError') return 'cancelado';   // cualquier otro fallo (sin permiso, datos que no acepta): a WhatsApp
      }
    }
    abrir(enlaceWhatsapp(m));
    return 'whatsapp';
  }
  return { boton, comparte, enlaceWhatsapp, ESTILO };
})();
