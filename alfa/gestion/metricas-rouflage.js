// Fans Of · /gestion: MÉTRICAS de ROUFLAGE, la parte PROPIA del juego (la común está en metricas.js). Partidas online en curso, empezadas, terminadas y abandonadas,
// activos y modos, de gestion_metricas_rouflage (servidor/109). Definiciones (qué es «en curso», «terminada», «abandonada»): servidor/109-gestion-metricas.sql y docs/guia/juegos/rouflage/online.md.
// Usa GESTION_METRICAS de metricas.js y lo de gestion/index.html.
'use strict';
GESTION_METRICAS.pestana({
  juego: 'rouflage',
  funcion: 'gestion_metricas_rouflage',
  pinta(D) {
    const M = GESTION_METRICAS, V = D.ventanas, A = D.activos;
    const sinResolver = v => Math.max(0, v.empezadas - v.terminadas - v.abandonadas);
    const fila = (n, v) => [n, fmt(v.empezadas), fmt(v.terminadas), fmt(v.abandonadas), fmt(sinResolver(v)), M.pct(v.abandonadas, v.empezadas), v.minutos_medios == null ? '—' : v.minutos_medios + ' min', v.jugadores_medios == null ? '—' : v.jugadores_medios, fmt(v.salas_sin_arrancar)];
    return '<div class="caja ayuda"><b>Rouflage · métricas.</b> Partidas online y jugadores, en números agregados.</div>'
      + M.caja('Ahora mismo', M.cifras([[D.ahora.salas, 'partidas corriendo'], [D.ahora.jugadores, 'jugadores en ellas'], [A.h24, 'activos en 24 h'], [A.d7, 'en 7 días'], [A.d30, 'en 30 días']]),
        'En curso: sala «jugando» con algún jugador que dio señales hace menos de 3 minutos. Activo: entró en una sala, guardó su cuenta o su partida.')
      + M.caja('Partidas online', M.tabla(['Ventana', 'Empezadas', 'Terminadas', 'Abandonadas', 'Sin resolver', '% abandono', 'Duración media', 'Jugadores por partida', 'Salas sin arrancar'], [fila('24 h', V.h24), fila('7 días', V.d7), fila('14 días', V.d14)]),
        'Terminada: la sala se cerró. Abandonada: no llegó a cerrarse y alguien se fue con la partida viva. Sin resolver: empezaron y no se cerraron, pero nadie las dejó viva (o siguen en curso). Salas sin arrancar: se crearon y nadie las empezó. De las terminadas, ' + fmt(V.d14.terminadas_con_abandono) + ' en 14 días tuvieron un abandono por el camino.')
      + M.caja('Partidas por día (14 días)', M.barras(D.por_dia, [{ clave: 'terminadas', nombre: 'Terminadas', color: 'var(--ok)' }, { clave: 'abandonadas', nombre: 'Abandonadas', color: 'var(--clara)' }]))
      + M.caja('Modos jugados (14 días)', D.modos.length ? M.tabla(['Modo', 'Partidas'], D.modos.map(x => [esc(x.modo), fmt(x.partidas)])) : M.vacio('Sin partidas', 'Ninguna partida empezada en 14 días.'))
      + `<div class="meta">Generado ${fecha(D.generado)}.</div>`;
  }
});
