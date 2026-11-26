// Fans Of · /gestion: la pestaña RENDIMIENTO de cada juego (tareas #339 y #363). Las últimas 2 semanas de gestion_rendimiento_juego
// (servidor/191-rendimiento-detalle.sql): los fps por aparato, con y sin «Ahorro de batería» (ADR 218), y por cada dato extra que manda el juego.
// Las reglas, en rendimiento-datos.js y las tandas, en rendimiento-tandas.js. Usa GESTION_METRICAS (caja, tabla, vacio) y lo de gestion/index.html: rpc(), leerToken(), esc(), fmt(), textoError() y $().
'use strict';
(() => {
  const D = RENDIMIENTO_DATOS, M = GESTION_METRICAS;
  const fps = x => (x == null ? '—' : String(x).replace('.', ','));
  const tiempo = s => fmt(Math.round((s || 0) / 60)) + ' min';
  const tablaAparatos = L => M.tabla(['Aparato', 'Ahorro', 'Partidas', 'fps medio', 'fps 1 % peor', 'fps mínimo', 'Tiempo'],
    L.map(a => [esc(D.aparato(a)), a.ahorro ? 'sí' : 'no', fmt(a.partidas), fps(a.fps_medio), fps(a.fps_p1_medio), fps(a.fps_min_peor), tiempo(a.segundos)]));
  function cajaAhorro(datos) {
    const { con, sin } = D.ahorro(datos), fila = (t, x) => [t, x ? fmt(x.partidas) : '0', fps(x && x.fps_medio), fps(x && x.fps_p1_medio)];
    return M.caja('Ahorro de batería', M.tabla(['', 'Partidas', 'fps medio', 'fps 1 % peor'], [fila('Sin ahorro', sin), fila('Con ahorro', con)]),
      'Cada partida va entera de un modo: al cambiarlo, el juego manda la de antes (ADR 218).');
  }
  function cajasDatos(datos) {
    return D.porClave(datos).map(g => M.caja('Dato «' + g.clave + '»',
      M.tabla(['Valor', 'Partidas', 'fps medio', 'fps 1 % peor'], g.filas.map(f => [esc(f.valor), fmt(f.partidas), fps(f.fps_medio), fps(f.fps_p1_medio)])),
      g.muchos ? `${g.valores} valores distintos: salen los ${D.LENTOS} más lentos.` : '')).join('');
  }
  async function cargar(id, nombre) {
    const cont = $('pan-rend-juego'); cont.innerHTML = '<div class="caja ayuda">Cargando…</div>';
    try {
      const r = await rpc('gestion_rendimiento_juego', { p_token: leerToken(), p_juego: id }), aparatos = r.aparatos || [], datos = r.datos || [];
      const tandas = await GESTION_TANDAS.seccion(id);
      cont.innerHTML = `<div class="caja ayuda"><b>${esc(nombre)} · rendimiento.</b> Fotogramas por segundo de cada partida, anónimos y sin cuenta. Últimas 2 semanas. Las medias por versión están en «Resumen».${D.tamano(r.tamano) ? '<br>' + esc(D.tamano(r.tamano)) + '.' : ''}</div>`
        + (aparatos.length ? M.caja('Por aparato', tablaAparatos(aparatos), 'Los 60 aparatos con más partidas.') + cajaAhorro(datos) + cajasDatos(datos)
          : M.vacio('Sin datos de rendimiento', 'Este juego aún no ha mandado partidas, o no mide sus fps.')) + tandas;
    } catch (e) {
      cont.innerHTML = `<div class="caja aviso">${M.SIN_SQL.test(String(e.message)) ? 'El detalle de rendimiento aún no está aplicado en el servidor (servidor/191-rendimiento-detalle.sql).' : esc(textoError(e))}</div>`;
    }
  }
  GESTION_NAV.seccion({ id: 'rendimiento', pan: 'pan-rend-juego', juego: '*', etiqueta: 'Rendimiento', orden: 2, cargar });
})();
