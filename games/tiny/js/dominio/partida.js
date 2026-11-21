// Tiny Fans · dominio · PARTIDA: la raíz de todo lo que se guarda en el móvil (formato `for-tiny-v1`, v: 1). Lleva el nido (el JSON que
// le da TN.Nido, sin mirarlo por dentro), la mochila caída, si el asalto está abierto, los contadores y los «extras» de otros módulos
// (metas, medidas, sonido). Solo cambia por sus métodos, que devuelven un resultado; una partida guardada que no vale no se carga a
// medias. No pide la hora: se le pasa. Los campos nuevos son opcionales para que las partidas de antes sigan valiendo.
// Dueño: N1 (arquitectura). Contrato: docs/guia/juegos/tiny/README.md, «Formato de guardado».
'use strict';
TN.Partida = class Partida {
  static CONTADORES = ['salidas', 'vueltas', 'vueltasConBotin', 'caidas', 'caidasSeguidas', 'asaltos', 'asaltosConBotin'];
  #nido = null; #mochilaCaida = null; #asaltoAbierto = false; #contadores = {}; #extras = {};

  constructor() { for (const c of Partida.CONTADORES) this.#contadores[c] = 0; }

  static nueva() { return new Partida(); }

  // Resultado: la partida guardada, o 'partida-invalida' (con el campo que no vale) si no se puede cargar entera
  static desdeJson(j) {
    if (!Partida.#esObjeto(j) || j.v !== 1) return TN.error('partida-invalida', { campo: 'v' });
    const p = new Partida(), malo = p.#carga(j);
    return malo ? TN.error('partida-invalida', { campo: malo }) : TN.ok(p);
  }

  static #esObjeto = x => !!x && typeof x === 'object' && !Array.isArray(x);
  static #copia = x => JSON.parse(JSON.stringify(x));
  static #esMochila = m => Partida.#esObjeto(m) && [m.x, m.z, m.cae].every(Number.isFinite) && Array.isArray(m.huecos);
  static #esCuenta = n => Number.isInteger(n) && n >= 0;

  // rellena desde el JSON; devuelve el nombre del campo que lo impide, o nada
  #carga(j) {
    if (j.nido != null && !Partida.#esObjeto(j.nido)) return 'nido';
    if (j.mochilaCaida != null && !Partida.#esMochila(j.mochilaCaida)) return 'mochilaCaida';
    if (j.contadores != null && !Partida.#esObjeto(j.contadores)) return 'contadores';
    if (j.extras != null && !Partida.#esObjeto(j.extras)) return 'extras';
    for (const c of Partida.CONTADORES) {
      const n = (j.contadores || {})[c];
      if (n !== undefined && !Partida.#esCuenta(n)) return 'contadores';
      this.#contadores[c] = n || 0;
    }
    this.#nido = j.nido ? Partida.#copia(j.nido) : null;
    this.#mochilaCaida = j.mochilaCaida ? Partida.#copia(j.mochilaCaida) : null;
    this.#asaltoAbierto = !!j.asaltoAbierto;
    this.#extras = j.extras ? Partida.#copia(j.extras) : {};
    return '';
  }

  aJson() {
    return { v: 1, nido: Partida.#copia(this.#nido), mochilaCaida: Partida.#copia(this.#mochilaCaida), asaltoAbierto: this.#asaltoAbierto,
      contadores: { ...this.#contadores }, extras: Partida.#copia(this.#extras) };
  }

  // EL NIDO: el JSON de TN.Nido.aJson() (o null si aún no se ha construido nada). La partida no lo valida por dentro: lo hace TN.Nido al cargarlo
  get nido() { return Partida.#copia(this.#nido); }
  ponNido(json) {
    if (!Partida.#esObjeto(json)) return TN.error('nido-invalido');
    this.#nido = Partida.#copia(json);
    return TN.ok(true);
  }

  // LOS CONTADORES (copia) y si el asalto ya se ha abierto
  get contadores() { return { ...this.#contadores }; }
  get asaltoAbierto() { return this.#asaltoAbierto; }
  cuenta(nombre, n = 1) {
    if (!Partida.CONTADORES.includes(nombre)) return TN.error('contador-desconocido', { nombre });
    if (!Partida.#esCuenta(n)) return TN.error('cantidad-invalida', { n });
    this.#contadores[nombre] += n;
    return TN.ok(this.#contadores[nombre]);
  }

  // EMPIEZA UNA EXPEDICIÓN: cuenta la salida
  anotaSalida() { return this.cuenta('salidas'); }
  // VUELVE AL NIDO: se corta la racha de caídas y, si trae botín, cuenta para abrir el asalto (abreTras: cuántas vueltas con botín hacen falta)
  anotaVuelta(conBotin, abreTras = 1) {
    this.#contadores.vueltas += 1;
    this.#contadores.caidasSeguidas = 0;
    if (conBotin) this.#contadores.vueltasConBotin += 1;
    if (this.#contadores.vueltasConBotin >= abreTras) this.#asaltoAbierto = true;
    return TN.ok({ asaltoAbierto: this.#asaltoAbierto });
  }
  // CAE: pierde la mochila, que se queda en el suelo. mochila: { x, z, huecos: [{ material, cantidad }] }; ahora: la hora en ms
  anotaCaida(mochila, ahora) {
    const m = { ...mochila, cae: ahora };
    if (!Partida.#esMochila(m)) return TN.error('mochila-invalida');
    this.#contadores.caidas += 1;
    this.#contadores.caidasSeguidas += 1;
    this.#mochilaCaida = m.huecos.length ? Partida.#copia(m) : null;   // una mochila vacía no deja nada que recoger
    return TN.ok(this.mochilaCaida(ahora, Infinity));
  }
  // LA MOCHILA CAÍDA que sigue en el suelo: { x, z, huecos, cae }, o null si no hay o si ya han pasado sus horas (duraMs)
  mochilaCaida(ahora, duraMs) {
    const m = this.#mochilaCaida;
    return m && ahora - m.cae < duraMs ? Partida.#copia(m) : null;
  }
  recogeMochila() {
    if (!this.#mochilaCaida) return TN.error('sin-mochila-caida');
    const m = this.#mochilaCaida;
    this.#mochilaCaida = null;
    return TN.ok(m);
  }

  // LOS EXTRAS: lo que guardan otros módulos en el mismo sobre (metas, medidas, sonido). Un valor que no se puede guardar en JSON se rechaza
  extra(nombre) { return Partida.#copia(this.#extras[nombre] === undefined ? null : this.#extras[nombre]); }
  ponExtra(nombre, valor) {
    let copia;
    try { copia = Partida.#copia(valor); } catch (e) { return TN.error('extra-invalido', { nombre }); }
    if (typeof nombre !== 'string' || !nombre || copia === undefined) return TN.error('extra-invalido', { nombre });
    this.#extras[nombre] = copia;
    return TN.ok(true);
  }
};
