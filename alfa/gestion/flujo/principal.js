// Fans Of · /gestion · FLUJO · principal (tarea #321): la COMPOSICIÓN de la pestaña «Flujo» del grupo Tablero, justo después de «Tablero». Al abrirla pide
// gestion_tareas, se queda con las tareas y la hora, y repinta con FLUJO.resumen y FLUJO.vista cada vez que se elige otro juego (sin volver a pedir nada).
// Tocar una tarea de las listas abre su enlace directo en el Tablero (TABLERO.enlaceTarea, tarea #302). Usa de gestion/index.html: rpc(), leerToken(),
// esc(), fecha(), textoError() y $(); de catalogo.js y nav.js, el nombre de cada juego.
'use strict';
(() => {
  const PAN = 'pan-flujo';
  const estado = { tareas: null, ahora: null, clave: '', nombres: {} };
  const enlace = id => TABLERO.enlaceTarea(location, id);
  const nombreDe = clave => (clave === FLUJO.SIN_JUEGO ? 'Sin juego' : estado.nombres[clave] || GESTION_NAV.nombreDe(clave));
  // Los nombres de los juegos salen de la biblioteca (GESTION_CATALOGO, como la pestaña «Juegos»); si no se puede leer, los de nav.js o el id
  async function leeNombres() {
    try {
      const r = await fetch('../index.html', { cache: 'no-store' });
      return Object.fromEntries(GESTION_CATALOGO.leer(await r.text()).map(j => [j.id, j.nombre]));
    } catch (e) { return {}; }   // sin biblioteca se ven los nombres de nav.js o el id: no hace falta avisar
  }

  function repinta() {
    const juegos = FLUJO.juegos(estado.tareas, nombreDe);
    if (estado.clave && !juegos.some(j => j.clave === estado.clave)) estado.clave = '';   // el juego elegido ya no tiene tareas
    const r = FLUJO.resumen(estado.tareas, estado.ahora, { clave: estado.clave, nombre: nombreDe(estado.clave) });
    FLUJO.vista.pinta($(PAN), { r, juegos, clave: estado.clave, cuando: fecha(estado.ahora.toISOString()), esc, enlace });
  }
  async function cargar() {
    const cont = $(PAN);
    cont.innerHTML = '<div class="caja ayuda">Cargando el flujo del tablero…</div>';
    try {
      const [datos, nombres] = await Promise.all([rpc('gestion_tareas', { p_token: leerToken() }), leeNombres()]);
      estado.nombres = nombres;
      estado.tareas = (datos && datos.tareas) || [];
      estado.ahora = new Date();
      repinta();
    } catch (e) {
      cont.innerHTML = `<div class="caja aviso">No se ha podido leer el tablero: ${esc(textoError(e))}</div>`;
    }
  }
  const elige = clave => { estado.clave = clave; repinta(); };
  function conecta() {
    const cont = $(PAN);
    cont.addEventListener('click', ev => { if (ev.target.closest('[data-fl-todos]')) elige(''); });
    cont.addEventListener('change', ev => { const s = ev.target.closest('[data-fl-juego]'); if (s) elige(s.value); });
    let espera = null;   // al girar el móvil o cambiar el ancho, las barras se rehacen con su ancho nuevo
    window.addEventListener('resize', () => {
      clearTimeout(espera);
      espera = setTimeout(() => { if (estado.tareas && !cont.hidden) FLUJO.vista.ajusta(cont, FLUJO.resumen(estado.tareas, estado.ahora, { clave: estado.clave })); }, 150);
    });
  }
  conecta();
  GESTION_NAV.seccion({ id: 'flujo', pan: PAN, etiqueta: 'Flujo', orden: 0.5, grupo: 'tablero', cargar });
})();
