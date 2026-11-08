// Fans Of · /gestion · TABLERO · dominio · TAREA: una tarea del tablero, inmutable. Nace siempre válida (fábrica `desdeJson`, que devuelve un resultado)
// y sabe a qué columnas puede pasar quien se lo pida (`mueve`). Las mismas reglas las aplica el servidor (_tarea_mover en servidor/120-tablero-refinamiento.sql);
// aquí sirven para avisar antes de ir a la red. Sin reloj, red ni pantalla.
'use strict';
TABLERO.Tarea = class Tarea {
  #d;

  constructor(datos) { this.#d = Object.freeze({ ...datos }); Object.freeze(this); }

  // Resultado: la tarea, o 'tarea-invalida' (sin id, título, estado o prioridad que existan)
  static desdeJson(j) {
    const valida = j && Number.isInteger(j.id) && typeof j.titulo === 'string' && j.titulo !== ''
      && TABLERO.esEstado(j.estado) && Object.hasOwn(TABLERO.PRIORIDADES, j.prioridad);
    if (!valida) return TABLERO.error('tarea-invalida', { id: j && j.id });
    return TABLERO.ok(new Tarea({ orden: 0, juego: 'general', responsable: null, esperando: null, ...j }));
  }

  get id() { return this.#d.id; }
  get titulo() { return this.#d.titulo; }
  get estado() { return this.#d.estado; }
  get juego() { return this.#d.juego; }
  get responsable() { return this.#d.responsable; }
  get prioridad() { return this.#d.prioridad; }
  get orden() { return this.#d.orden; }
  aJson() { return { ...this.#d }; }

  // Quien manda es una persona ('arkioner', 'pepins') o Claude (en cualquier mayúscula, como en el servidor). La nota va al historial; para Claude, al
  // sacar una tarea de ideas o de en refinamiento, es el enlace a la aprobación de la persona. Resultado: la tarea ya movida, o el motivo con nombre:
  // 'estado-desconocido', 'solo-personas-hecho', 'es-de-otro', 'esta-hecha', 'sin-refinar' o 'sin-aprobacion'
  mueve(quien, estado, nota = '') {
    if (!TABLERO.esEstado(estado)) return TABLERO.error('estado-desconocido', { estado });
    const esClaude = String(quien).toLowerCase() === 'claude';
    const motivo = esClaude ? this.#motivoClaudeNoPuede(estado, nota) : null;
    if (motivo) return TABLERO.error(motivo, { id: this.id, estado });
    const responsable = esClaude && estado === 'en_curso' && !this.#d.responsable ? 'claude' : this.#d.responsable;
    const esperando = estado === 'en_curso' ? this.#d.esperando : null;   // la espera solo tiene sentido en curso, como en el servidor
    return TABLERO.ok(new Tarea({ ...this.#d, estado, responsable, esperando }));
  }

  // Claude no cierra tareas, no toca las de otra persona y no reabre las hechas. Lleva una idea a refinamiento sin más, pero de ahí solo saca una tarea
  // que una persona dio por buena: a «en curso» (se empieza ya) o a «pendiente» (lista para más tarde), y con la nota que enlaza esa aprobación
  #motivoClaudeNoPuede(estado, nota) {
    if (estado === 'hecho') return 'solo-personas-hecho';
    if (this.#d.responsable && this.#d.responsable !== 'claude') return 'es-de-otro';
    if (this.#d.estado === 'hecho') return 'esta-hecha';
    if (!TABLERO.sinRefinar(this.#d.estado) || TABLERO.sinRefinar(estado)) return null;
    if (estado !== 'pendiente' && estado !== 'en_curso') return 'sin-refinar';
    return String(nota ?? '').trim() === '' ? 'sin-aprobacion' : null;
  }
};
