// Fans Of · /gestion · TABLERO · principal: la COMPOSICIÓN. Crea el repositorio con el `rpc` de la página, los casos de uso y el controlador, y apunta la pestaña
// «Tablero» en Global, la primera (Pepins, 16-11-2026: se abre nada más entrar). Es el único archivo del tablero que conoce a la vez la página, el servidor y la pantalla. Usa de gestion/index.html: rpc(), leerToken(),
// esc(), fecha(), textoError() y $(); del navegador, fetch, location, navigator y window.open (compartir y enlace directo, tarea #302); de nav.js, GESTION_NAV.capa (atrás, tarea #322).
'use strict';
(() => {
  const casos = TABLERO.casos(TABLERO.repositorioServidor({ rpc, leerToken }));
  // Compartir una tarea (tarea #302): el enlace directo sale de esta página (vale en la alfa y en producción), la hoja del móvil o WhatsApp en otra pestaña
  const comparte = t => TABLERO.vistaCompartir.comparte(TABLERO.mensajeCompartir(t, TABLERO.enlaceTarea(location, t.id)), { navegador: navigator, abrir: url => window.open(url, '_blank', 'noopener') });
  const hueco = { bandeja: 'tb-te-toca', aviso: 'tb-aviso', filtros: 'tb-filtros', vista: 'tb-vista', lista: 'tb-lista', detalle: 'tb-detalle', juegos: 'tb-juegos' };
  // Los juegos con página en la alfa salen del catálogo de la biblioteca (ADR 198): la ruta es relativa a /gestion, así vale en la alfa y en producción
  const catalogo = TABLERO.repositorioCatalogo({ pedir: async () => { const r = await fetch('../biblioteca/juegos.json', { cache: 'no-store' }); if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); } });
  const controlador = TABLERO.controlador({ casos, hueco, esc, fecha, textoError, comparte, juegosAlfa: catalogo.juegos, tareaInicial: TABLERO.tareaDelEnlace(location.search), alCambiarPanel: GESTION_NAV.capa });
  $('tb-estilo').textContent = TABLERO.vista.ESTILO + TABLERO.vistaGrafo.ESTILO + TABLERO.vistaRevisar.ESTILO + TABLERO.vistaCompartir.ESTILO;   // la hoja de estilos se pone una vez, no en cada carga
  document.body.insertAdjacentHTML('beforeend', TABLERO.vistaReacciones.ICONOS);   // los doce iconos de las reacciones, una sola vez (ADR 149)
  controlador.conecta();
  GESTION_NAV.seccion({ id: 'tablero', pan: 'pan-tablero', etiqueta: 'Tablero', orden: 0, cargar: controlador.cargar, cierraCapa: controlador.cierraCapa, filtra: controlador.filtraJuego });
})();
