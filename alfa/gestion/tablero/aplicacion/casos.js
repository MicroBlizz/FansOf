// Fans Of · /gestion · TABLERO · aplicación · CASOS: lo que se le puede pedir al tablero: `cargar` (leerlo y repartirlo en columnas), `crear`, `editar`,
// `mover` una tarea y buscar las `parecidas` a un título. Habla con el servidor por un PUERTO (`repositorio`), nunca por la red:
//   { lista() → Promise<json[]>, guardar(tarea) → Promise<{ok, id?, motivo?}>, mover(id, estado, nota) → Promise<{ok, motivo?}>,
//     parecidas(texto, excluir) → Promise<[{ id, titulo, estado, parecido }]> }
// `guardar` lleva `requiere` (lista de números) si el formulario los trae. Los adaptadores lo cumplen (adaptadores/repositorio-servidor.js) y los tests le pasan uno en memoria. Antes de ir al servidor, el dominio avisa de lo que
// está mal (formulario o movimiento no permitido); un rechazo del servidor llega como el mismo tipo de error, con su motivo. Todo devuelve resultados, no excepciones.
'use strict';
TABLERO.casos = repositorio => {
  // el servidor da los motivos con guion bajo (es_de_otro); el dominio, con guion (es-de-otro): aquí se igualan
  // un rechazo trae a veces los números de tarea que lo causan (requisitos abiertos, ciclo, requisito que no existe): van en datos.requisitos
  const aResultado = r => (r && r.ok ? TABLERO.ok(r)
    : TABLERO.error(String((r && r.motivo) || 'rechazado').replace(/_/g, '-'), r && Array.isArray(r.requisitos) ? { requisitos: r.requisitos } : undefined));
  // la foto del grafo se valida una sola vez, al cargar: la tarea lleva el Grafo ya leído, o el motivo por el que no vale
  const conGrafo = t => {
    if (!t.grafo) return { ...t, grafo: null };
    const g = TABLERO.Grafo.desdeJson(t.grafo);
    return g.ok ? { ...t, grafo: g.valor } : { ...t, grafo: null, grafoMal: g.datos.motivo };
  };
  async function enviar(llamada) {
    try { return aResultado(await llamada()); } catch (e) { return TABLERO.error('sin-servidor', { causa: e }); }
  }
  return {
    // Resultado: { columnas, juegos, tareas (las válidas, con su Grafo ya leído), descartadas } o 'sin-servidor' (la causa en datos)
    async cargar(filtro) {
      let json;
      try { json = await repositorio.lista(); } catch (e) { return TABLERO.error('sin-servidor', { causa: e }); }
      if (!Array.isArray(json)) return TABLERO.error('sin-servidor', { causa: new Error('respuesta-inesperada') });
      const lectura = json.map(TABLERO.Tarea.desdeJson);
      const tareas = lectura.filter(r => r.ok).map(r => conGrafo(r.valor.aJson()));
      return TABLERO.ok({ columnas: TABLERO.reparte(tareas, filtro), juegos: TABLERO.juegosDe(tareas), tareas, descartadas: lectura.length - tareas.length });
    },
    // Repartir otra vez las tareas ya cargadas con otro filtro (juego, responsable o texto), sin ir al servidor
    repartir: (tareas, filtro) => TABLERO.reparte(tareas, filtro),
    // Las tareas que se parecen a un título (para no duplicar). Con menos de 3 letras no pregunta. Resultado: la lista, o 'sin-servidor'
    async parecidas(texto, excluir) {
      if (TABLERO.normaliza(texto).trim().length < 3) return TABLERO.ok([]);
      try {
        const r = await repositorio.parecidas(texto, excluir || null);
        return Array.isArray(r) ? TABLERO.ok(r) : TABLERO.error('sin-servidor', { causa: new Error('respuesta-inesperada') });
      } catch (e) { return TABLERO.error('sin-servidor', { causa: e }); }
    },
    // Una tarea nueva nace siempre en «Ideas»
    crear(form) {
      const b = TABLERO.borrador(form);
      return b.ok ? enviar(() => repositorio.guardar(b.valor)) : Promise.resolve(b);
    },
    // `tareas`: las cargadas, para avisar antes de ir al servidor si los requisitos la incluyen a ella o cierran un ciclo, y para no mandarlos si no cambian
    editar(id, form, tareas = []) {
      const antes = tareas.find(t => t.id === id), { requiere, ...sinRequisitos } = form || {};
      const b = TABLERO.borrador(antes && TABLERO.mismosRequisitos(requiere, antes) ? sinRequisitos : form);   // sin cambios en la lista, no se manda
      if (!b.ok) return Promise.resolve(b);
      const mal = b.valor.requiere && TABLERO.motivoRequisitos(id, b.valor.requiere, tareas);
      return mal ? Promise.resolve(mal) : enviar(() => repositorio.guardar({ ...b.valor, id }));
    },
    // `tarea` es el json de la tarea tal como está ahora; el movimiento lo hace una persona (el servidor lo vuelve a comprobar con quien ha entrado)
    mover(tarea, estado, nota) {
      const t = TABLERO.Tarea.desdeJson(tarea);
      if (!t.ok) return Promise.resolve(t);
      const m = t.valor.mueve('persona', estado);
      return m.ok ? enviar(() => repositorio.mover(tarea.id, estado, nota || null)) : Promise.resolve(m);
    },
  };
};
