// Fans Of · /gestion · TABLERO · dominio · GRAFO: la foto del grafo de nodos de una tarea (skill tarea-como-grafo, ADR 081), solo para verla. Nace válida
// (fábrica `desdeJson`): cada nodo con id único y estado conocido, sus dependencias existen y no hay ciclos. Sabe repartir los nodos por NIVELES (nivel 0 = no
// depende de nadie; un nodo va un nivel por debajo del más profundo del que depende) y resumir cuántos hay en cada estado. Sin reloj, red ni pantalla.
'use strict';
TABLERO.ESTADOS_NODO = Object.freeze(['pendiente', 'en_curso', 'pasa', 'falla', 'bloqueado']);
TABLERO.Grafo = class Grafo {
  #nodos;
  #niveles;
  #datos;

  constructor(datos, nodos, niveles) { this.#datos = datos; this.#nodos = nodos; this.#niveles = niveles; Object.freeze(this); }

  // Resultado: el grafo, o 'grafo-invalido' con el motivo: 'sin-nodos', 'nodo-mal', 'id-repetido', 'depende-de-nadie', 'siguiente-de-nadie' o 'ciclo'
  static desdeJson(j) {
    if (!j || !Array.isArray(j.nodos) || !Grafo.#textos(j, ['fase', 'siguiente'])) return TABLERO.error('grafo-invalido', { motivo: 'sin-nodos' });
    const nodos = j.nodos.map(n => Object.freeze({ ...n, depende: Object.freeze(n && Array.isArray(n.depende) ? [...n.depende] : []) }));
    const motivo = Grafo.#motivoNodos(nodos) || (j.siguiente && !nodos.some(n => n.id === j.siguiente) ? 'siguiente-de-nadie' : null);
    if (motivo) return TABLERO.error('grafo-invalido', { motivo });
    const niveles = Grafo.#calculaNiveles(nodos);
    if (!niveles) return TABLERO.error('grafo-invalido', { motivo: 'ciclo' });
    return TABLERO.ok(new Grafo(Object.freeze({ fase: j.fase || '', siguiente: j.siguiente || '' }), Object.freeze(nodos), niveles));
  }
  static #CAMPOS_TEXTO = ['titulo', 'tipo', 'check', 'modelo', 'evidencia', 'salida'];
  static #textos(o, campos) { return campos.every(c => o[c] == null || typeof o[c] === 'string'); }
  static #nodoBueno(n) {
    const intentosBien = n.intentos == null || (Number.isInteger(n.intentos) && n.intentos >= 0);
    return typeof n.id === 'string' && n.id !== '' && TABLERO.ESTADOS_NODO.includes(n.estado) && intentosBien && Grafo.#textos(n, Grafo.#CAMPOS_TEXTO);
  }
  static #motivoNodos(nodos) {
    const ids = new Set();
    for (const n of nodos) {
      if (!Grafo.#nodoBueno(n)) return 'nodo-mal';
      if (ids.has(n.id)) return 'id-repetido';
      ids.add(n.id);
    }
    return nodos.some(n => n.depende.some(d => !ids.has(d))) ? 'depende-de-nadie' : null;
  }
  // Nivel de cada nodo por id, sin recursión (Kahn): se van quitando los nodos cuyas dependencias ya tienen nivel. Si quedan nodos sin nivel, hay un ciclo: null
  static #calculaNiveles(nodos) {
    const nivel = new Map();
    let pendientes = nodos;
    while (pendientes.length) {
      const listos = pendientes.filter(n => n.depende.every(d => nivel.has(d)));
      if (!listos.length) return null;
      for (const n of listos) nivel.set(n.id, n.depende.reduce((m, d) => Math.max(m, nivel.get(d) + 1), 0));
      pendientes = pendientes.filter(n => !nivel.has(n.id));
    }
    return nivel;
  }

  get fase() { return this.#datos.fase; }
  get siguiente() { return this.#datos.siguiente; }
  // los nodos por niveles, en el orden en que llegaron dentro de cada nivel
  niveles() {
    const filas = [];
    for (const n of this.#nodos) (filas[this.#niveles.get(n.id)] = filas[this.#niveles.get(n.id)] || []).push(n);
    return filas;
  }
  // { total, pasa, porEstado: { pendiente: n, … } }
  resumen() {
    const porEstado = Object.fromEntries(TABLERO.ESTADOS_NODO.map(e => [e, this.#nodos.filter(n => n.estado === e).length]));
    return { total: this.#nodos.length, pasa: porEstado.pasa, porEstado };
  }
};
