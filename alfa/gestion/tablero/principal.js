// Fans Of · /gestion · TABLERO · principal: la COMPOSICIÓN. Crea el repositorio con el `rpc` de la página, los casos de uso y el controlador, y apunta la pestaña
// «Tablero» en Global. Es el único archivo del tablero que conoce a la vez la página, el servidor y la pantalla. Usa de gestion/index.html: rpc(), leerToken(),
// esc(), fecha(), textoError() y $().
'use strict';
(() => {
  const casos = TABLERO.casos(TABLERO.repositorioServidor({ rpc, leerToken }));
  const controlador = TABLERO.controlador({ casos, hueco: { aviso: 'tb-aviso', filtros: 'tb-filtros', formulario: 'tb-form', lista: 'tb-lista', juegos: 'tb-juegos' }, esc, fecha, textoError });
  $('tb-estilo').textContent = TABLERO.vista.ESTILO;   // la hoja de estilos se pone una vez, no en cada carga
  controlador.conecta();
  GESTION_NAV.seccion({ id: 'tablero', pan: 'pan-tablero', etiqueta: 'Tablero', orden: 2, cargar: controlador.cargar });
})();
