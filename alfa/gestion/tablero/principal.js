// Fans Of · /gestion · TABLERO · principal: la COMPOSICIÓN. Crea el repositorio con el `rpc` de la página, le pasa los casos de uso a la pestaña y apunta
// la pestaña «Tablero» en Global. Es el único archivo del tablero que conoce a la vez la página, el servidor y la pantalla. Usa de gestion/index.html:
// rpc(), leerToken(), esc(), textoError() y $().
'use strict';
(() => {
  const casos = TABLERO.casos(TABLERO.repositorioServidor({ rpc, leerToken }));
  const faltaSql = e => /does not exist|PGRST202|404/.test(String((e && e.message) || e));
  async function cargar() {
    $('tb-aviso').textContent = '';
    const r = await casos.cargar();
    if (!r.ok) { $('tb-aviso').textContent = faltaSql(r.datos.causa) ? 'Falta aplicar servidor/117-tablero.sql en Supabase.' : textoError(r.datos.causa); return; }
    $('tb-lista').innerHTML = TABLERO.vista.html(r.valor.columnas, esc)
      + (r.valor.descartadas ? `<div class="meta">${r.valor.descartadas} tareas con datos raros no se han enseñado.</div>` : '');
  }
  $('tb-estilo').textContent = TABLERO.vista.ESTILO;   // la hoja de estilos se pone una vez, no en cada carga
  GESTION_NAV.seccion({ id: 'tablero', pan: 'pan-tablero', etiqueta: 'Tablero', orden: 2, cargar });
})();
