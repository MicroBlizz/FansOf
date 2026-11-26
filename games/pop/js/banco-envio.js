// Fans of Pop · PRUEBA DE RENDIMIENTO, el envío al servidor (tarea 404; adaptador): cuando js/banco-vista.js avisa con hook('pop-banco'), manda la
// tanda a enviar_rendimiento_tanda por el mismo camino que core usa para el rendimiento normal (CUENTA.rpc, core/js/sistema/rendimiento.js).
// Solo en alfa y desarrollo (como el resto de lo nuevo de Pop, ppEsPruebas) y solo con «Datos de partida anónimos» encendido (DATOS.activo()).
// Las del guion de Chrome (origen 'guion') no se mandan: el guion corta la red y guarda en local (docs/guia/herramientas/pop-banco.md).
// Una vez, sin reintentos: si falla o el servidor dice que no, se apunta en la consola y no pasa nada más. Lo que se monta está en js/banco-envio-datos.js.
'use strict';
const PP_BANCO_ENVIO = (() => {
  const puede = () => ppEsPruebas() && typeof CUENTA !== 'undefined' && CUENTA.activa && typeof DATOS !== 'undefined' && DATOS.activo();
  // la misma regla de plataforma que core/js/sistema/rendimiento.js
  const plataforma = () => (/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) ? 'movil' : 'pc');
  async function envia(tanda) {
    if (!puede() || (tanda && tanda.aparato && tanda.aparato.origen === 'guion')) return false;
    const d = PP_BANCO_ENVIO_DATOS.datos(tanda, { alfa: !!NUCLEO.alfa, plataforma: plataforma() });
    if (!d) { console.error('banco: la tanda no se puede enviar (datos no válidos)'); return false; }
    try {
      const r = await CUENTA.rpc('enviar_rendimiento_tanda', { p_datos: d });
      if (!r || r.ok !== true) { console.error('banco: el servidor no ha aceptado la tanda', r && r.motivo); return false; }
      return true;
    } catch (e) { console.error('banco: no se pudo enviar la tanda', e); return false; }
  }
  hook('pop-banco', tanda => { envia(tanda); });
  return Object.freeze({ envia });
})();
