// Fans Of · /gestion · TABLERO · dominio · TAREA: una tarea del tablero, inmutable. Nace siempre válida (fábrica `desdeJson`, que devuelve un resultado)
// y sabe a qué columnas puede pasar quien se lo pida (`mueve`). Las mismas reglas las aplica el servidor (_tarea_mover, hoy en servidor/125-tablero-requisitos.sql);
// aquí sirven para avisar antes de ir a la red (el informe aprobado para salir de refinamiento: SQL 152, ADR 137). Sin reloj, red ni pantalla.
'use strict';
TABLERO.Tarea = class Tarea {
  #d;
  // requiere y requerida_por: [{ id, titulo, estado }] (SQL 125), congeladas; sin ellas (página o servidor anterior), ninguna; lo mal formado se deja fuera
  static #lista = x => Object.freeze((Array.isArray(x) ? x : []).filter(r => r && Number.isInteger(r.id) && typeof r.estado === 'string').map(r => Object.freeze({ ...r })));

  constructor(datos) { this.#d = Object.freeze({ ...datos }); Object.freeze(this); }

  // Resultado: la tarea, o 'tarea-invalida' (sin id, título, estado o prioridad que existan). El responsable es siempre una persona o nadie: una tarea
  // vieja de Claude llega ya como de su persona (TABLERO.responsableDe, ADR 154) y el campo `para` se queda fuera
  static desdeJson(j) {
    const valida = j && Number.isInteger(j.id) && typeof j.titulo === 'string' && j.titulo !== ''
      && TABLERO.esEstado(j.estado) && Object.hasOwn(TABLERO.PRIORIDADES, j.prioridad);
    if (!valida) return TABLERO.error('tarea-invalida', { id: j && j.id });
    const d = { orden: 0, juego: 'general', esperando: null, ...j, responsable: TABLERO.responsableDe(j), requiere: Tarea.#lista(j.requiere), requerida_por: Tarea.#lista(j.requerida_por) };
    delete d.para;
    return TABLERO.ok(new Tarea(d));
  }

  get id() { return this.#d.id; }
  get titulo() { return this.#d.titulo; }
  get estado() { return this.#d.estado; }
  get juego() { return this.#d.juego; }
  get responsable() { return this.#d.responsable; }
  get prioridad() { return this.#d.prioridad; }
  get orden() { return this.#d.orden; }
  get requiere() { return this.#d.requiere; }
  aJson() { return { ...this.#d }; }

  // Quien manda es una persona ('arkioner', 'pepins') o un hilo de Claude que dice para quién trabaja («Claude para Pepins», en cualquier mayúscula,
  // como en el servidor; TABLERO.hiloPara). La nota va al historial; para Claude, al sacar una tarea de ideas o de en refinamiento o pasarla a hecho,
  // es el enlace a la aprobación de la persona. Resultado: la tarea ya movida, o el motivo con nombre: 'estado-desconocido', 'falta-para' (Claude a
  // secas), 'es-de-otro', 'esta-hecha', 'sin-refinar', 'sin-aprobacion' o 'requisitos-abiertos' (a en curso con algún requisito que aún no está en
  // revisión ni hecho; lleva sus números)
  mueve(quien, estado, nota = '') {
    if (!TABLERO.esEstado(estado)) return TABLERO.error('estado-desconocido', { estado });
    const hilo = TABLERO.hiloPara(quien);
    const motivo = hilo === null ? null : this.#motivoClaudeNoPuede(hilo, estado, nota);
    if (motivo) return TABLERO.error(motivo, { id: this.id, estado });
    if (this.#informeSinAprobar(estado)) return TABLERO.error('informe-sin-aprobar', { id: this.id, estado, informe: this.#d.informe });   // para todos
    const abiertos = this.#abiertosAlEntrar(estado);
    if (abiertos.length) return TABLERO.error('requisitos-abiertos', { id: this.id, estado, requisitos: abiertos });   // para todos, no solo Claude
    const esperando = estado === 'en_curso' ? this.#d.esperando : null;   // la espera solo tiene sentido en curso, como en el servidor
    const responsable = hilo && estado === 'en_curso' ? this.#d.responsable || hilo : this.#d.responsable;
    return TABLERO.ok(new Tarea({ ...this.#d, estado, esperando, responsable }));
  }

  // ADR 137: de ideas o refinamiento a pendiente o en curso solo con el informe aprobado (sin el campo, de un servidor anterior, decide el servidor)
  #informeSinAprobar(estado) {
    const sale = TABLERO.sinRefinar(this.#d.estado) && (estado === 'pendiente' || estado === 'en_curso');
    return sale && this.#d.informe !== undefined && this.#d.informe !== 'aprobado';
  }

  // Aprobar el informe o pedir cambios (ADR 137), solo en ideas o refinamiento: resultado ok, o 'accion' (desconocida), 'fuera-de-refinamiento',
  // 'informe-falta' (sin texto) o 'sin-nota' (cambios sin decir cuáles). Como el servidor
  puedeInforme(accion, nota = '') {
    if (accion !== 'aprobar' && accion !== 'cambios') return TABLERO.error('accion', { accion });
    if (!TABLERO.sinRefinar(this.#d.estado)) return TABLERO.error('fuera-de-refinamiento', { id: this.id });
    if (!String(this.#d.refinado ?? '').trim()) return TABLERO.error('informe-falta', { id: this.id });
    return accion === 'cambios' && String(nota ?? '').trim() === '' ? TABLERO.error('sin-nota', { id: this.id }) : TABLERO.ok(this);
  }

  // Solo al empezarla (de ideas, refinamiento o pendiente a en curso) se miran los requisitos (TABLERO.bloqueos); volver de revisión para cambios no se bloquea
  #abiertosAlEntrar(estado) { return estado === 'en_curso' ? TABLERO.bloqueos(this.#d) : []; }

  // Las reglas de un hilo de Claude (ADR 154). `para`: la persona para la que trabaja, o '' si no lo dijo (falta-para). En la tarea de esa persona o en
  // una sin responsable: no reabre las hechas y solo pasa una tarea a «hecho» (sea de quien sea) con la nota que enlaza el sí de Arkioner o de Pepins;
  // lleva una idea a refinamiento sin más, pero de ahí solo saca una tarea que una persona dio por buena: a «en curso» (se empieza ya; al cogerla sin
  // responsable, pasa a ser de su persona) o a «pendiente» (lista para más tarde), y con la nota que enlaza esa aprobación. La de la otra persona no la mueve
  #motivoClaudeNoPuede(para, estado, nota) {
    if (!para) return 'falta-para';
    if (this.#d.estado === 'hecho') return 'esta-hecha';
    const sinNota = String(nota ?? '').trim() === '';
    if (estado === 'hecho') return sinNota ? 'sin-aprobacion' : null;   // con el sí en la nota vale también para lo de otra persona (SQL 124)
    if (this.#d.responsable && this.#d.responsable !== para) return 'es-de-otro';
    if (!TABLERO.sinRefinar(this.#d.estado) || TABLERO.sinRefinar(estado)) return null;
    if (estado !== 'pendiente' && estado !== 'en_curso') return 'sin-refinar';
    return sinNota ? 'sin-aprobacion' : null;
  }
};
