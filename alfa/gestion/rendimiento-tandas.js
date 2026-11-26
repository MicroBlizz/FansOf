// Fans Of · /gestion, RENDIMIENTO: la sección «Tandas de la prueba automática» (tarea 404). Pide gestion_rendimiento_tandas de un juego y pinta una fila
// por tanda; al abrirla, la tabla por escenario y lo que empeora frente a la anterior comparable. Las reglas, en tandas-datos.js. Un juego sin tandas no
// pinta nada; si la función aún no está en la base, lo dice. Usa GESTION_METRICAS y lo de gestion/index.html: rpc(), leerToken(), esc(), fecha() y textoError().
'use strict';
const GESTION_TANDAS = (() => {
  const T = RENDIMIENTO_TANDAS, M = GESTION_METRICAS;
  const fps = x => (x == null ? '—' : String(x).replace('.', ','));
  const variante = g => (g ? `${esc(g.variante)} (+${fps(g.gana)} fps)` : '—');
  const filaEscenario = l => [esc(l.escenario), l.todo ? fps(l.todo.fps) : '—', l.todo ? fps(l.todo.p1) : '—', l.todo ? (l.bien ? 'sí' : 'no') : 'sin medir', variante(l.ganan[0])];
  const filaPeor = p => [esc(p.escenario), esc(p.variante), fps(p.antes), fps(p.ahora), `−${fps(p.baja)} %`];
  function detalle(lista, t) {
    const r = T.leer(lista, t);
    return M.tabla(['Escenario', 'fps medio', 'fps 1 % peor', 'Va bien', 'Variante que más gana'], r.lectura.map(filaEscenario))
      + (r.anterior ? (r.empeora.length ? '<div class="ayuda">Empeora frente a la tanda anterior comparable:</div>' + M.tabla(['Escenario', 'Variante', 'Antes', 'Ahora', 'Baja'], r.empeora.map(filaPeor)) : '<div class="ayuda">Nada empeora frente a la tanda anterior comparable.</div>')
        : '<div class="ayuda">No hay una tanda anterior comparable (mismo origen, plataforma y CPU frenada).</div>');
  }
  function fila(lista, t) {
    const f = T.fallos(t), resumen = `${esc(fecha(t.creado))} · ${esc(t.origen)} · ${esc(T.aparato(t))} · v${esc(t.version)}${t.alfa ? ' alfa' : ''} · ${t.corta ? 'corta' : 'completa'}${f ? ` · ${f} sin medir` : ''}`;
    return `<details><summary>${resumen}</summary>${detalle(lista, t)}</details>`;
  }
  // el HTML de la sección de un juego: '' si no tiene tandas, un aviso si la función falla
  async function seccion(id) {
    try {
      const r = await rpc('gestion_rendimiento_tandas', { p_token: leerToken(), p_juego: id }), lista = (r && r.tandas) || [];
      return lista.length ? M.caja('Tandas de la prueba automática', lista.map(t => fila(lista, t)).join(''), 'De la más nueva a la más vieja. «Empeora» compara con la anterior del mismo origen, plataforma y CPU frenada.') : '';
    } catch (e) {
      return `<div class="caja ayuda"><b>Tandas de la prueba automática.</b> ${M.SIN_SQL.test(String(e.message)) ? 'No hay tandas: la función aún no está aplicada en el servidor (servidor/203-rendimiento-tandas.sql).' : esc(textoError(e))}</div>`;
    }
  }
  return Object.freeze({ seccion });
})();
