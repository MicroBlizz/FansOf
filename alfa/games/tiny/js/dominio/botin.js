// Tiny Fans · dominio · BOTÍN Y MOCHILA: los montones del suelo (se cogen quedándose encima unos segundos) y la mochila de 8 huecos de 10
// (lo que no cabe se queda en el suelo). TN.Mochila se usa también en el asalto. Puro. Dueño: N3 (dominio de la expedición).
'use strict';
TN.Mochila = class Mochila {
  #huecos = []; #tope; #porHueco;

  constructor(tope, porHueco) { this.#tope = tope; this.#porHueco = porHueco; }

  static nueva(reglas) { return new Mochila(reglas.mochila.huecos, reglas.mochila.porHueco); }
  // Resultado: ok(mochila) o error('mochila-invalida'). huecos: [{ material, cantidad }]
  static desdeHuecos(reglas, huecos) {
    const m = Mochila.nueva(reglas);
    if (!Array.isArray(huecos) || huecos.length > m.#tope) return TN.error('mochila-invalida');
    for (const h of huecos) {
      const vale = h && reglas.botin.materiales[h.material] && Number.isInteger(h.cantidad) && h.cantidad > 0 && h.cantidad <= m.#porHueco;
      if (!vale) return TN.error('mochila-invalida', { hueco: h });
      m.#huecos.push({ material: h.material, cantidad: h.cantidad });
    }
    return TN.ok(m);
  }

  // mete lo que quepa; valor: cuánto ha entrado (0 si está llena)
  mete(material, cantidad) {
    if (!Number.isInteger(cantidad) || cantidad < 0) return TN.error('cantidad-invalida');
    let queda = cantidad;
    for (const h of this.#huecos) {
      if (h.material !== material) continue;
      const entra = Math.min(queda, this.#porHueco - h.cantidad);
      h.cantidad += entra; queda -= entra;
    }
    while (queda > 0 && this.#huecos.length < this.#tope) {
      const entra = Math.min(queda, this.#porHueco);
      this.#huecos.push({ material, cantidad: entra }); queda -= entra;
    }
    return TN.ok(cantidad - queda);
  }
  // saca n de un material (de los últimos huecos). Resultado: ok(n) o error('no-hay')
  saca(material, n = 1) {
    if (this.cuenta(material) < n) return TN.error('no-hay', { material });
    let queda = n;
    for (let i = this.#huecos.length - 1; i >= 0 && queda > 0; i--) {
      const h = this.#huecos[i];
      if (h.material !== material) continue;
      const sale = Math.min(queda, h.cantidad);
      h.cantidad -= sale; queda -= sale;
    }
    this.#huecos = this.#huecos.filter(h => h.cantidad > 0);
    return TN.ok(n);
  }
  cuenta(material) { return this.#huecos.reduce((s, h) => s + (h.material === material ? h.cantidad : 0), 0); }
  // ¿cabe al menos una unidad de ese material?
  cabe(material) { return this.#huecos.length < this.#tope || this.#huecos.some(h => h.material === material && h.cantidad < this.#porHueco); }
  get tope() { return this.#tope; }
  get huecos() { return this.#huecos.map(h => ({ ...h })); }
  get unidades() { return this.#huecos.reduce((s, h) => s + h.cantidad, 0); }
  // { material: cantidad } con todo lo que lleva
  get botin() { return TN.sumaBotin({}, this.#huecos); }
};

// suma una lista de huecos [{ material, cantidad }] a un botín { material: cantidad } (en copia)
TN.sumaBotin = (botin, huecos) => {
  const b = { ...botin };
  for (const h of huecos) b[h.material] = (b[h.material] || 0) + h.cantidad;
  return b;
};

// LOS MONTONES del suelo: [{ material, cantidad, x, z }]. Uno se coge quedándose `reglas.botin.coge` segundos a menos de `recoge`
TN.Montones = class Montones {
  #lista = []; #sig = 1;

  static nuevos(lista) {
    const m = new Montones();
    for (const d of lista) m.#lista.push({ id: m.#sig++, material: d.material, cantidad: d.cantidad, x: d.x, z: d.z, progreso: 0, lleno: false });
    return m;
  }
  // [{ id, material, cantidad, x, z, progreso (0 a 1) }], en copia
  get lista() { return this.#lista.map(m => ({ id: m.id, material: m.material, cantidad: m.cantidad, x: m.x, z: m.z, progreso: m.progreso })); }
  get unidades() { return this.#lista.reduce((s, m) => s + m.cantidad, 0); }

  // el becario en (x, z) durante dt: avanza la cuenta del montón que pisa y mete en la mochila lo que quepa. Devuelve eventos
  paso(reglas, dt, x, z, mochila) {
    const ev = [];
    for (const m of this.#lista) {
      if (Math.hypot(m.x - x, m.z - z) > reglas.botin.recoge) { m.progreso = 0; m.lleno = false; continue; }
      if (!mochila.cabe(m.material)) { this.#llena(m, ev); continue; }
      m.progreso = Math.min(1, m.progreso + dt / reglas.botin.coge);
      if (m.progreso >= 1) this.#coge(m, mochila, ev);
    }
    this.#lista = this.#lista.filter(m => m.cantidad > 0);
    return ev;
  }
  #llena(m, ev) {
    m.progreso = 0;
    if (!m.lleno) ev.push({ tipo: 'mochila-llena', material: m.material, x: m.x, z: m.z });
    m.lleno = true;
  }
  #coge(m, mochila, ev) {
    const entra = mochila.mete(m.material, m.cantidad).valor;
    m.cantidad -= entra;
    m.progreso = 0;
    ev.push({ tipo: 'recoge', material: m.material, cantidad: entra, x: m.x, z: m.z, total: mochila.unidades });
  }
};
