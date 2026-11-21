// Fans Of · /gestion · TABLERO · aplicación · CASOS: lo que se le puede pedir al tablero: `cargar` (leerlo y repartirlo en columnas), `crear`, `editar`,
// `mover` una tarea, `apuntar` una idea o un fallo con el formulario corto y buscar las `parecidas` a un título. Habla con el servidor por un PUERTO (`repositorio`), nunca por la red:
//   { lista() → Promise<json[]>, guardar(tarea) → Promise<{ok, id?, motivo?}>, mover(id, estado, nota) → Promise<{ok, motivo?}>, informe(id, accion, nota, texto) → Promise<{ok, motivo?}>,
//     parecidas(texto, excluir) → Promise<[{ id, titulo, estado, parecido }]>,
//     reacciones() → Promise<{ quien, reacciones: [{ tarea, quien, reaccion, cuando }] }>, reaccionar(id, reaccion) → Promise<{ok, reacciones?, motivo?}>,
//     mirados() → Promise<{ quien, mirados: [{ tarea, paso, cuando }] }>, mirar(id, paso, mirado) → Promise<{ok, motivo?}> }
// reacciones y reaccionar (SQL 155) y mirados y mirar (SQL 177) son opcionales: sin ellas, el tablero carga igual, sin reacciones o sin casillas guardadas
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
  // Las reacciones (SQL 155) no son imprescindibles: si el servidor aún no las tiene o fallan, el tablero se ve sin ellas y `falla` lo dice
  async function leeReacciones() {
    if (!repositorio.reacciones) return { lista: [], yo: null, falla: false };
    try {
      const r = await repositorio.reacciones();
      return { lista: (r && r.reacciones) || [], yo: (r && r.quien) || null, falla: false };
    } catch (e) { return { lista: [], yo: null, falla: true, causa: e }; }
  }
  // Los pasos de «Qué mirar» ya marcados por quien mira (SQL 177, ADR 182): tampoco son imprescindibles; sin ellos, las casillas salen vacías
  async function leeMirados() {
    if (!repositorio.mirados) return { lista: [], falla: false };
    try {
      const r = await repositorio.mirados();
      return { lista: (r && r.mirados) || [], falla: false };
    } catch (e) { return { lista: [], falla: true, causa: e }; }
  }
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
      const [reac, mir] = await Promise.all([leeReacciones(), leeMirados()]);
      const tareas = TABLERO.conMirados(TABLERO.conReacciones(lectura.filter(r => r.ok).map(r => conGrafo(r.valor.aJson())), reac.lista, reac.yo), mir.lista);
      return TABLERO.ok({ columnas: TABLERO.reparte(tareas, filtro), juegos: TABLERO.juegosDe(tareas), tareas, descartadas: lectura.length - tareas.length, yo: reac.yo,
        sinReacciones: reac.falla, sinMirados: mir.falla });
    },
    // Poner, cambiar o quitar (si es la misma) la reacción de quien mira a una tarea (ADR 149). Resultado: la tarea con sus reacciones nuevas, o el error
    async reaccionar(tarea, reaccion, yo) {
      if (!TABLERO.esReaccion(reaccion)) return TABLERO.error('reaccion');
      const r = await enviar(() => repositorio.reaccionar(tarea.id, reaccion));
      return r.ok ? TABLERO.ok({ ...tarea, reacciones: TABLERO.limpiaReacciones(r.valor.reacciones, yo) }) : r;
    },
    // Marcar o desmarcar un paso de «Qué mirar» (ADR 182). Resultado: la tarea con sus pasos mirados al día (los calcula aquí, así dos toques seguidos
    // no se pisan aunque las respuestas lleguen cambiadas de orden), o el error
    async mirar(tarea, paso, mirado) {
      if (!TABLERO.esPaso(paso) || typeof mirado !== 'boolean') return TABLERO.error('datos');
      const r = await enviar(() => repositorio.mirar(tarea.id, paso, mirado));
      return r.ok ? TABLERO.ok(TABLERO.conPasoMirado(tarea, paso, mirado)) : r;
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
    // «Apuntar idea o fallo» (formulario corto): { tipo: 'idea'|'fallo', titulo, juego, pedida_por }. Nace en Ideas como cualquier tarea; si es un fallo, la descripción lo dice
    apuntar(form) {
      const { tipo, titulo, juego, pedida_por } = form || {};
      return this.crear({ titulo, juego, pedida_por, descripcion: tipo === 'fallo' ? 'Es un fallo (apuntado con «Apuntar idea o fallo»).' : '' });
    },
    // `tareas`: las cargadas, para avisar antes de ir al servidor si los requisitos la incluyen a ella o cierran un ciclo, y para no mandarlos si no cambian
    editar(id, form, tareas = []) {
      const antes = tareas.find(t => t.id === id), { requiere, ...sinRequisitos } = form || {};
      const b = TABLERO.borrador(antes && TABLERO.mismosRequisitos(requiere, antes) ? sinRequisitos : form);   // sin cambios en la lista, no se manda
      if (!b.ok) return Promise.resolve(b);
      const mal = b.valor.requiere && TABLERO.motivoRequisitos(id, b.valor.requiere, tareas);
      return mal ? Promise.resolve(mal) : enviar(() => repositorio.guardar({ ...b.valor, id }));
    },
    // Aprobar el informe o pedir cambios (ADR 137), lo hace una persona desde el detalle: `accion` 'aprobar' o 'cambios' (con nota)
    informe(tarea, accion, nota) {
      const t = TABLERO.Tarea.desdeJson(tarea);
      const p = t.ok ? t.valor.puedeInforme(accion, nota) : t;
      const conNota = accion === 'cambios' ? String(nota ?? '').trim() || null : null;   // al aprobar no va nota: lo escrito en «qué cambiar» no cuenta
      return p.ok ? enviar(() => repositorio.informe(tarea.id, accion, conNota, tarea.refinado || '')) : Promise.resolve(p);   // el texto leído: si cambió, no se aprueba
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
