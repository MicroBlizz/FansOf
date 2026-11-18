// Fans Of · /gestion · TABLERO · principal: la COMPOSICIÓN. Crea el repositorio con el `rpc` de la página, los casos de uso y el controlador, y apunta la pestaña
// «Tablero» en Global, la primera (Pepins, 16-11-2026: se abre nada más entrar). Es el único archivo del tablero que conoce a la vez la página, el servidor y la pantalla. Usa de gestion/index.html: rpc(), leerToken(),
// esc(), fecha(), textoError() y $().
'use strict';
(() => {
  const casos = TABLERO.casos(TABLERO.repositorioServidor({ rpc, leerToken }));
  const controlador = TABLERO.controlador({ casos, hueco: { aviso: 'tb-aviso', filtros: 'tb-filtros', vista: 'tb-vista', lista: 'tb-lista', detalle: 'tb-detalle', juegos: 'tb-juegos' }, esc, fecha, textoError });
  $('tb-estilo').textContent = TABLERO.vista.ESTILO + TABLERO.vistaGrafo.ESTILO;   // la hoja de estilos se pone una vez, no en cada carga
  document.body.insertAdjacentHTML('beforeend', TABLERO.vistaReacciones.ICONOS);   // los doce iconos de las reacciones, una sola vez (ADR 149)
  controlador.conecta();
  GESTION_NAV.seccion({ id: 'tablero', pan: 'pan-tablero', etiqueta: 'Tablero', orden: 0, cargar: controlador.cargar });
})();
