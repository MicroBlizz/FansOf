// Fans Of · /gestion · TABLERO · aplicación · CASOS: lo que se le puede pedir al tablero. Hoy, `cargar` (leer el tablero y repartirlo en columnas).
// Habla con el servidor por un PUERTO (`repositorio`), nunca por la red: { lista() → Promise<json[]> }. Los adaptadores lo cumplen
// (adaptadores/repositorio-servidor.js) y los tests le pasan uno en memoria. Una tarea que llega mal formada se cuenta aparte, no rompe el tablero.
'use strict';
TABLERO.casos = repositorio => ({
  // Resultado: { columnas, juegos, descartadas } o 'sin-servidor' si el repositorio falla (el mensaje de la causa va en datos)
  async cargar(filtro) {
    let json;
    try { json = await repositorio.lista(); } catch (e) { return TABLERO.error('sin-servidor', { causa: e }); }
    if (!Array.isArray(json)) return TABLERO.error('sin-servidor', { causa: new Error('respuesta-inesperada') });
    const lectura = json.map(TABLERO.Tarea.desdeJson);
    const tareas = lectura.filter(r => r.ok).map(r => r.valor.aJson());
    return TABLERO.ok({ columnas: TABLERO.reparte(tareas, filtro), juegos: TABLERO.juegosDe(tareas), descartadas: lectura.length - tareas.length });
  },
});
