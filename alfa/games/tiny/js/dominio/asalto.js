// Tiny Fans · dominio · ASALTO: la raíz de un asalto al nido abandonado (2 minutos, sin mejoras, la batería solo baja con los golpes;
// romper paredes y puertas, llegar al almacén, coger lo que quepa y salir por la entrada). Misma forma que la expedición: paso(entrada)
// devuelve eventos y foto() el estado de solo lectura. Sin trucos escondidos. El nido sale de reglas.asalto.mapa (una letra por casilla,
// con su leyenda); casillas de reglas.asalto.casilla unidades con el centro de la rejilla en (0, 0). Paredes y puertas no se pisan: la
// grapadora rompe la que tiene justo delante (hacia donde se movió por última vez). Puro. Dueño: N3 (reglas).
//
// LA FOTO: { t, paso, fase: 'juego' | 'terminada', fin: null | { tipo: 'sale' | 'falla', motivo, botin, unidades, segundos }, quedan,
//   becario: { x, z, bateria, max, col, fila, mira: { x, z } }, columnas, filas, casilla, entrada: { col, fila }, almacen: { col, fila },
//   piezas: [{ pieza, clase, col, fila, x, z, aguante, aguanteMax, sopla }], botin (lo que queda en el almacén), cogiendo (0 a 1), cogido,
//   mochila: { huecos, unidades, tope } }
'use strict';
TN.Asalto = class Asalto {
  #r; #dt; #t = 0; #paso = 0; #fase = 'juego'; #fin = null;
  #becario; #rejilla; #entrada; #almacen; #botin; #mochila;
  #celda; #mira = { x: 0, z: -1 }; #recarga = 0; #rafaga = 0; #coge = 0; #cogido = false;

  constructor(reglas, plano, botin, bateria) {
    this.#r = reglas; this.#dt = 1 / reglas.simulacion.pasosPorSegundo;
    this.#rejilla = plano.rejilla; this.#entrada = plano.entrada; this.#almacen = plano.almacen;
    this.#botin = { ...botin }; this.#mochila = TN.Mochila.nueva(reglas);
    const p = this.centro(plano.entrada.col, plano.entrada.fila);
    this.#becario = TN.Becario.nuevo(reglas, p.x, p.z, bateria);
    this.#celda = { ...plano.entrada };
  }

  // datos: { semilla, botin (lo que guarda hoy; si no, el de las reglas), bateria }. Resultado: ok(asalto) o error('asalto-invalido')
  static nuevo(reglas, datos = {}) {
    const plano = Asalto.#lee(reglas);
    if (!plano) return TN.error('asalto-invalido', { campo: 'mapa' });
    const botin = datos.botin || reglas.asalto.botin;
    if (!Object.keys(botin).every(m => reglas.botin.materiales[m] && Number.isInteger(botin[m]) && botin[m] >= 0)) return TN.error('asalto-invalido', { campo: 'botin' });
    return TN.ok(new Asalto(reglas, plano, botin, Number(datos.bateria) || reglas.asalto.bateria));
  }
  // la clase ('pared', 'puerta' o 'trampa') y el aguante de una pieza del nido abandonado
  static #def(r, pieza) {
    const p = r.nido.piezas[pieza] || r.asalto.piezas[pieza];
    if (p) return { clase: p.clase, aguante: p.aguante || 0 };
    return TN.trampas[pieza] ? { clase: 'trampa', aguante: 0 } : null;
  }
  // el plano: la rejilla con sus piezas, la entrada y el almacén; null si el mapa no vale
  static #lee(r) {
    const filas = r.asalto.mapa, cols = filas[0].length, rejilla = TN.Rejilla.nueva(cols, filas.length), plano = { rejilla };
    for (let f = 0; f < filas.length; f++) {
      if (filas[f].length !== cols) return null;
      for (let c = 0; c < cols; c++) if (!Asalto.#ponLetra(r, plano, filas[f][c], c, f)) return null;
    }
    return plano.entrada && plano.almacen ? plano : null;
  }
  static #ponLetra(r, plano, letra, col, fila) {
    if (letra === '.') return true;
    const l = r.asalto.leyenda[letra];
    if (!l) return false;
    if (l.pieza === 'entrada' || l.pieza === 'almacen') { plano[l.pieza] = { col, fila }; return true; }
    const def = Asalto.#def(r, l.pieza);
    if (!def) return false;
    plano.rejilla.pon(col, fila, l.pieza, { clase: def.clase, aguante: def.aguante, aguanteMax: def.aguante, sopla: l.sopla || 0 });
    return true;
  }

  // el centro de una casilla en unidades, y la casilla de un punto
  centro(col, fila) {
    const s = this.#r.asalto.casilla, g = this.#rejilla;
    return { x: (col + 0.5 - g.columnas / 2) * s, z: (fila + 0.5 - g.filas / 2) * s };
  }
  casillaDe(x, z) {
    const s = this.#r.asalto.casilla, g = this.#rejilla;
    return { col: Math.floor(x / s + g.columnas / 2), fila: Math.floor(z / s + g.filas / 2) };
  }
  #solida(p) { return !!p && (p.clase === 'pared' || p.clase === 'puerta'); }
  get #muebles() {
    const s = this.#r.asalto.casilla;
    return this.#rejilla.piezas.filter(p => this.#solida(p)).map(p => ({ forma: 'caja', ...this.centro(p.col, p.fila), ancho: s, fondo: s, giro: 0 }));
  }
  get #limites() {
    const s = this.#r.asalto.casilla, g = this.#rejilla;
    return { x0: -g.columnas * s / 2, x1: g.columnas * s / 2, z0: -g.filas * s / 2, z1: g.filas * s / 2 };
  }
  #lleva(ax, az) {
    const b = this.#becario;
    b.ponEn(TN.mapa.desliza(b.x, b.z, ax, az, this.#r.becario.radio, this.#muebles, this.#limites));
  }

  // entrada: { mx, mz }, como en la expedición. Devuelve los eventos del paso
  paso(entrada) {
    if (this.#fase !== 'juego') return [];
    const ev = [];
    this.#t += this.#dt; this.#paso += 1;
    if (this.#paso === 1) ev.push({ tipo: 'asalto-empieza', segundos: this.#r.asalto.segundos });
    this.#anda(entrada);
    this.#pisa(ev);
    this.#sopla(ev);
    this.#rompe(ev);
    this.#pasoAlmacen(ev);
    this.#acaba(ev);
    return ev;
  }

  #anda(entrada) {
    const mx = Number(entrada && entrada.mx) || 0, mz = Number(entrada && entrada.mz) || 0, largo = Math.hypot(mx, mz);
    if (!largo) return;
    const b = this.#becario, k = largo > 1 ? 1 / largo : 1, aqui = this.#rejilla.en(this.#celda.col, this.#celda.fila);
    const freno = aqui && aqui.clase === 'trampa' ? TN.trampas[aqui.pieza].freno(this.#r) : 1;
    const v = this.#r.becario.velocidad * freno * this.#dt;
    this.#mira = { x: mx / largo, z: mz / largo };
    this.#lleva(b.x + mx * k * v, b.z + mz * k * v);
  }

  // al entrar en una casilla con trampa, la trampa hace lo suyo
  #pisa(ev) {
    const b = this.#becario, c = this.casillaDe(b.x, b.z);
    if (c.col === this.#celda.col && c.fila === this.#celda.fila) return;
    this.#celda = c;
    const p = this.#rejilla.en(c.col, c.fila);
    const efecto = p && p.clase === 'trampa' ? TN.trampas[p.pieza].entra(this.#r) : null;
    if (!efecto) return;
    if (efecto.gasta) this.#rejilla.quita(c.col, c.fila);
    ev.push({ tipo: 'trampa', trampa: p.pieza, col: c.col, fila: c.fila, x: b.x, z: b.z, dano: efecto.dano, bateria: b.golpe(efecto.dano) });
  }

  // cada tantos segundos los ventiladores soplan por su fila y empujan al becario si le pillan (sin nada sólido en medio)
  #sopla(ev) {
    const v = this.#r.asalto.trampas.ventilador;
    this.#rafaga += this.#dt;
    if (this.#rafaga < v.rafaga) return;
    this.#rafaga = 0;
    for (const p of this.#rejilla.piezas) if (TN.trampas[p.pieza] && TN.trampas[p.pieza].sopla && this.#pilla(p)) this.#empuja(p, ev);
  }
  #pilla(p) {
    const c = this.#celda, d = (c.col - p.col) * p.sopla;
    if (c.fila !== p.fila || d < 1 || d > this.#r.asalto.trampas.ventilador.alcance) return false;
    for (let i = 1; i < d; i++) if (this.#solida(this.#rejilla.en(p.col + i * p.sopla, p.fila))) return false;
    return true;
  }
  #empuja(p, ev) {
    const b = this.#becario, s = this.#r.asalto.casilla;
    this.#lleva(b.x + p.sopla * this.#r.asalto.trampas.ventilador.empuja * s, b.z);
    ev.push({ tipo: 'trampa', trampa: p.pieza, col: p.col, fila: p.fila, x: b.x, z: b.z, dano: 0, bateria: b.bateria });
  }

  // la grapadora rompe la pared o puerta que tiene justo delante
  #rompe(ev) {
    this.#recarga -= this.#dt;
    if (this.#recarga > 0) return;
    const blanco = this.#delante();
    if (!blanco) return;
    const g = this.#r.arma.grapadora, b = this.#becario;
    this.#recarga = g.cada;
    const aguante = Math.max(0, blanco.aguante - g.dano);
    ev.push({ tipo: 'dispara', bicho: null, x: b.x, z: b.z, ax: blanco.x, az: blanco.z });
    ev.push({ tipo: 'golpe-pieza', pieza: blanco.pieza, col: blanco.col, fila: blanco.fila, dano: g.dano, aguante });
    if (aguante > 0) { this.#rejilla.pon(blanco.col, blanco.fila, blanco.pieza, { clase: blanco.clase, aguante, aguanteMax: blanco.aguanteMax, sopla: blanco.sopla }); return; }
    this.#rejilla.quita(blanco.col, blanco.fila);
    ev.push({ tipo: 'rompe', pieza: blanco.pieza, col: blanco.col, fila: blanco.fila });
  }
  #delante() {
    const b = this.#becario, m = this.#mira;
    let mejor = null;
    for (const p of this.#rejilla.piezas.filter(o => this.#solida(o))) {
      const c = this.centro(p.col, p.fila), dx = c.x - b.x, dz = c.z - b.z, d = Math.hypot(dx, dz);
      const enfrente = d <= this.#r.asalto.alcance && (dx * m.x + dz * m.z) >= 0.7 * d;
      if (enfrente && (!mejor || d < mejor.d)) mejor = { ...p, ...c, d };
    }
    return mejor;
  }

  // en el almacén se coge el botín (unos segundos quieto encima); después hay que salir por la entrada
  #pasoAlmacen(ev) {
    const c = this.#celda, a = this.#almacen, e = this.#entrada;
    if (this.#cogido && c.col === e.col && c.fila === e.fila) { this.#termina('sale', '', ev); return; }
    if (this.#cogido || c.col !== a.col || c.fila !== a.fila) { this.#coge = 0; return; }
    this.#coge += this.#dt;
    if (this.#coge >= this.#r.asalto.coge - 1e-9) this.#cogeBotin(ev);
  }
  #cogeBotin(ev) {
    const cogido = {};
    for (const m of Object.keys(this.#botin)) {
      const entra = this.#mochila.mete(m, this.#botin[m]).valor;
      if (entra) { cogido[m] = entra; this.#botin[m] -= entra; }
    }
    this.#cogido = true;
    ev.push({ tipo: 'asalto-coge', botin: cogido, unidades: this.#mochila.unidades });
  }

  #acaba(ev) {
    if (this.#fase !== 'juego') return;
    if (this.#becario.bateria <= 0) this.#termina('falla', 'bateria', ev);
    else if (this.#t >= this.#r.asalto.segundos - 1e-9) this.#termina('falla', 'tiempo', ev);
  }
  #termina(tipo, motivo, ev) {
    const sale = tipo === 'sale', botin = sale ? this.#mochila.botin : {}, unidades = sale ? this.#mochila.unidades : 0;
    this.#fase = 'terminada';
    this.#fin = { tipo, motivo, botin, unidades, segundos: this.#t };
    ev.push(sale ? { tipo: 'asalto-sale', botin: { ...botin }, unidades, segundos: this.#t } : { tipo: 'asalto-falla', motivo });
  }
  // irse sin nada (el botón de salir). Resultado: ok(eventos) o error('asalto-terminado')
  abandona() {
    if (this.#fase !== 'juego') return TN.error('asalto-terminado');
    const ev = [];
    this.#termina('falla', 'abandona', ev);
    return TN.ok(ev);
  }

  foto() {
    const b = this.#becario, s = this.#r.asalto.casilla, m = this.#mochila;
    return TN.congela({
      t: this.#t, paso: this.#paso, fase: this.#fase, fin: this.#fin && { ...this.#fin, botin: { ...this.#fin.botin } },
      quedan: Math.max(0, this.#r.asalto.segundos - this.#t),
      becario: { x: b.x, z: b.z, bateria: b.bateria, max: b.max, col: this.#celda.col, fila: this.#celda.fila, mira: { ...this.#mira } },
      columnas: this.#rejilla.columnas, filas: this.#rejilla.filas, casilla: s, entrada: { ...this.#entrada }, almacen: { ...this.#almacen },
      piezas: this.#rejilla.piezas.map(p => ({ ...p, ...this.centro(p.col, p.fila) })),
      botin: { ...this.#botin }, cogiendo: Math.min(1, this.#coge / this.#r.asalto.coge), cogido: this.#cogido,
      mochila: { huecos: m.huecos, unidades: m.unidades, tope: m.tope },
    });
  }
};
