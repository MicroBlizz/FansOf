// Fans of Pop · PRUEBA DE RENDIMIENTO, el envío al servidor (tarea 404; adaptador): cuando js/banco-vista.js avisa con hook('pop-banco'), manda la
// tanda a enviar_rendimiento_tanda por el mismo camino que core usa para el rendimiento normal (CUENTA.rpc, core/js/sistema/rendimiento.js).
// Solo en alfa y desarrollo (como el resto de lo nuevo de Pop, ppEsPruebas) y solo con «Datos de partida anónimos» encendido (DATOS.activo()).
// Las del guion de Chrome (origen 'guion') no se mandan: el guion corta la red y guarda en local (docs/guia/herramientas/pop-banco.md).
// Una vez, sin reintentos: lo que pase (enviada, o por qué no) se cuenta en la ventana de la tanda y, si falla, se apunta en ERRORES. Lo que se monta está en js/banco-envio-datos.js.
'use strict';
const PP_BANCO_ENVIO = (() => {
  // la misma regla de plataforma que core/js/sistema/rendimiento.js
  const plataforma = () => (/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) ? 'movil' : 'pc');
  // por qué no se envía (null: se puede). Cada motivo es una frase entera para que lleve su inglés.
  function impide(tanda) {
    if (!ppEsPruebas()) return tr('no, solo en la alfa');
    if (typeof CUENTA === 'undefined' || !CUENTA.activa) return tr('no, sin cuenta en esta dirección');
    if (typeof DATOS === 'undefined' || !DATOS.activo()) return tr('no, «Datos de partida anónimos» está apagado');
    if (tanda && tanda.aparato && tanda.aparato.origen === 'guion') return tr('no, las del guion se guardan en local');
    return null;
  }
  const cuenta = texto => { if (typeof PP_BANCO_VISTA !== 'undefined') PP_BANCO_VISTA.envio(texto); };
  const falla = (texto, detalle) => { console.error('banco: ' + texto, detalle); if (typeof ERRORES !== 'undefined') ERRORES.registrar('banco', 'envio', texto + ' ' + (detalle || '')); cuenta(texto); return false; };
  async function envia(tanda) {
    const no = impide(tanda);
    if (no) { cuenta(no); return false; }
    const d = PP_BANCO_ENVIO_DATOS.datos(tanda, { alfa: !!NUCLEO.alfa, plataforma: plataforma() });
    if (!d) return falla(tr('no, la tanda no es válida'));
    cuenta(tr('enviando…'));
    try {
      const r = await CUENTA.rpc('enviar_rendimiento_tanda', { p_datos: d });
      if (!r || r.ok !== true) return falla(tr('no, el servidor no la ha aceptado'), r && r.motivo);
      cuenta(tr('enviada'));
      return true;
    } catch (e) { return falla(tr('no, no se pudo conectar'), e && e.message); }
  }
  hook('pop-banco', tanda => { envia(tanda); });
  return Object.freeze({ envia });
})();
