// Tiny Fans · dominio · NIDO: el agregado del nido propio. La rejilla con sus piezas, el almacén de materiales, las recetas, el tope de
// trampas y la regla del camino (de la entrada al almacén, que viene gratis y no se quita ni se lista entre las piezas: su casilla es
// reglas.nido.almacen). Sabe guardarse y cargarse (su JSON va dentro de la partida). Puro. Dueño: N3 (reglas).
'use strict';
TN.Nido = class Nido {
  #r; #rejilla; #almacen = {};

  constructor(reglas) { this.#r = reglas; this.#rejilla = TN.Rejilla.nueva(reglas.nido.columnas, reglas.nido.filas); }
  static nuevo(reglas) { return new Nido(reglas); }

  // Resultado: ok(nido) o error('nido-invalido'). json: lo que dio aJson() (null: un nido nuevo)
  static desdeJson(reglas, json) {
    if (json == null) return TN.ok(new Nido(reglas));
    if (typeof json !== 'object' || !Array.isArray(json.piezas) || !Nido.#valeAlmacen(json.almacen)) return TN.error('nido-invalido', { campo: 'forma' });
    const n = new Nido(reglas);
    n.#almacen = { ...json.almacen };
    for (const p of json.piezas) {
      const malo = p && n.#noCabe(p.pieza, p.col, p.fila);
      if (!p || malo) return TN.error('nido-invalido', { campo: 'piezas', error: malo || 'pieza' });
      n.#rejilla.pon(p.col, p.fila, p.pieza);
    }
    return n.#hayCamino(n.#rejilla) ? TN.ok(n) : TN.error('nido-invalido', { campo: 'piezas', error: 'camino-tapiado' });
  }
  static #valeAlmacen(a) {
    return !!a && typeof a === 'object' && !Array.isArray(a) && Object.values(a).every(n => Number.isInteger(n) && n >= 0);
  }
  aJson() { return { piezas: this.piezas, almacen: this.almacen }; }

  // [{ pieza, col, fila }] y { material: cantidad }, en copia
  get piezas() { return this.#rejilla.piezas.map(p => ({ pieza: p.pieza, col: p.col, fila: p.fila })); }
  get almacen() { return { ...this.#almacen }; }
  get trampas() { return this.piezas.filter(p => this.#r.nido.piezas[p.pieza].clase === 'trampa').length; }

  // guardar botín en el almacén ({ material: cantidad }). Resultado: ok(almacen) o error('botin-invalido')
  guarda(botin) {
    const b = botin || {};
    if (!Object.values(b).every(n => Number.isInteger(n) && n >= 0)) return TN.error('botin-invalido');
    for (const m of Object.keys(b)) this.#almacen[m] = (this.#almacen[m] || 0) + b[m];
    return TN.ok(this.almacen);
  }
  // sacar del almacén (p. ej. la pila que se lleva al salir). Resultado: ok(almacen) o error('sin-materiales', falta)
  saca(botin) {
    const falta = {};
    for (const m of Object.keys(botin)) if ((this.#almacen[m] || 0) < botin[m]) falta[m] = botin[m] - (this.#almacen[m] || 0);
    if (Object.keys(falta).length) return TN.error('sin-materiales', falta);
    for (const m of Object.keys(botin)) this.#almacen[m] -= botin[m];
    return TN.ok(this.almacen);
  }

  // por qué no se puede poner esa pieza ahí sin mirar el almacén: '' si se puede
  #noCabe(pieza, col, fila, rejilla = this.#rejilla) {
    const a = this.#r.nido.almacen, def = this.#r.nido.piezas[pieza];
    if (!def) return 'pieza-desconocida';
    if (!rejilla.dentro(col, fila)) return 'fuera-de-rejilla';
    if (rejilla.en(col, fila) || (col === a.col && fila === a.fila)) return 'casilla-ocupada';
    const trampas = rejilla.piezas.filter(p => this.#r.nido.piezas[p.pieza].clase === 'trampa').length;
    if (def.clase === 'trampa' && trampas >= this.#r.nido.topeTrampas) return 'tope-de-trampas';
    return '';
  }
  // ¿se llega de la entrada al almacén? (las paredes no se pisan)
  #hayCamino(rejilla) {
    const n = this.#r.nido, paredes = rejilla.piezas.filter(p => n.piezas[p.pieza].clase === 'pared');
    if (paredes.some(p => p.col === n.entrada.col && p.fila === n.entrada.fila)) return false;
    return TN.camino.hay(n.columnas, n.filas, n.entrada, n.almacen, paredes);
  }

  // Resultado: ok(eventos) o error('fuera-de-rejilla' | 'casilla-ocupada' | 'pieza-desconocida' | 'sin-materiales' | 'tope-de-trampas' | 'camino-tapiado')
  coloca(pieza, col, fila) {
    const malo = this.#noCabe(pieza, col, fila);
    if (malo) return TN.error(malo, { pieza, col, fila });
    const falta = TN.recetas.falta(this.#r, pieza, this.#almacen);
    if (Object.keys(falta).length) return TN.error('sin-materiales', { pieza, col, fila, falta });
    const prueba = this.#rejilla.copia();
    prueba.pon(col, fila, pieza);
    if (!this.#hayCamino(prueba)) return TN.error('camino-tapiado', { pieza, col, fila });
    this.#rejilla = prueba;
    this.#almacen = TN.recetas.paga(this.#r, pieza, this.#almacen);
    return TN.ok([{ tipo: 'pieza-puesta', pieza, col, fila }, { tipo: 'almacen-cambia', almacen: this.almacen }]);
  }
  // Resultado: ok(eventos) o error('fuera-de-rejilla' | 'casilla-vacia' | 'almacen-fijo')
  quita(col, fila) {
    const a = this.#r.nido.almacen;
    if (!this.#rejilla.dentro(col, fila)) return TN.error('fuera-de-rejilla', { col, fila });
    if (col === a.col && fila === a.fila) return TN.error('almacen-fijo', { col, fila });
    const p = this.#rejilla.en(col, fila);
    if (!p) return TN.error('casilla-vacia', { col, fila });
    this.#rejilla.quita(col, fila);
    this.#almacen = TN.recetas.devuelve(this.#r, p.pieza, this.#almacen);
    return TN.ok([{ tipo: 'pieza-quitada', pieza: p.pieza, col, fila }, { tipo: 'almacen-cambia', almacen: this.almacen }]);
  }
  // Resultado: ok(eventos) o los errores de quitar y de colocar (si no se puede, el nido queda como estaba)
  mueve(col, fila, aCol, aFila) {
    const antes = { rejilla: this.#rejilla.copia(), almacen: this.almacen };
    const q = this.quita(col, fila);
    if (!q.ok) return q;
    const c = this.coloca(q.valor[0].pieza, aCol, aFila);
    if (c.ok) return TN.ok([q.valor[0], c.valor[0], c.valor[1]]);
    this.#rejilla = antes.rejilla;
    this.#almacen = antes.almacen;
    return c;
  }
};
