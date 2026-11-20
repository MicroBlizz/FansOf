// Tiny Fans · dominio · EXPEDICIÓN: la raíz de una salida. paso(entrada) avanza un paso fijo (1 / reglas.simulacion.pasosPorSegundo
// segundos) y devuelve la lista de eventos de ese paso (TN.EVENTOS; el primer paso da 'sale'); foto() da el estado de solo lectura que
// leen los adaptadores. No sabe de pantalla, reloj ni azar propio: todo sale de la semilla. Piezas: TN.Becario, TN.Bichos, TN.Montones,
// TN.Mochila, TN.Mejoras, TN.Gigante, TN.combate y TN.mapa; el escenario lo sortea TN.mundo. Dueño: N3 (dominio de la expedición).
//
// LA FOTO (congelada, se puede guardar entre pasos):
// { t, paso, fase: 'juego' | 'mejora' | 'terminada', fin: null | FIN,
//   becario: { x, z, bateria, max, baja, enNido, enRio, enTela, felpudo (0 a 1: cuánto le falta para volver) },
//   bichos: [{ id, clase, x, z, vida, vidaMax, caza }] (solo los despiertos), telas: [{ x, z, radio }],
//   botin: [{ id, material, cantidad, x, z, progreso (0 a 1) }], bolitas: [{ id, x, z, voltios }],
//   voltios: { tiene, meta }, mejoras: { id: nivel }, oferta: null | [id, id, id],
//   gigante: [{ id, x, z, radio, falta (segundos) }] (las sombras que hay en el suelo),
//   mochila: { huecos: [{ material, cantidad }], unidades, tope, porHueco, pilas },
//   mochilaCaida: null | { x, z, unidades } (la de la salida anterior, aún en el suelo), rescatada (unidades ya recuperadas),
//   mapa: reglas.mapa (muebles, río, puentes, telas, sitios y nido) }
// FIN: { tipo: 'vuelve' | 'cae', segundos, unidades, huecos, botin: { material: cantidad }, x, z, mejoras, bichos (los que tumbó) }
'use strict';
TN.Expedicion = class Expedicion {
  #r; #azar; #dt; #t = 0; #paso = 0; #fase = 'juego'; #fin = null;
  #becario; #bichos; #montones; #mochila; #mejoras; #gigante; #telas;
  #bolitas = []; #sigBolita = 1; #recarga = 0; #muertos = 0;
  #factor; #proxOleada; #fuera = 0; #enNido = true; #felpudo = 0;
  #caida; #rescatada = []; #baja = false;

  constructor(reglas, azar, esc, mochila, caida) {
    this.#r = reglas; this.#azar = azar; this.#dt = 1 / reglas.simulacion.pasosPorSegundo;
    this.#becario = TN.Becario.nuevo(reglas);
    this.#bichos = TN.Bichos.nuevos(reglas, esc.bichos);
    this.#montones = TN.Montones.nuevos(esc.botin);
    this.#gigante = TN.Gigante.nuevo(reglas, esc.gigante);
    this.#mochila = mochila; this.#mejoras = TN.Mejoras.nuevas(reglas); this.#caida = caida;
    this.#telas = esc.bichos.filter(b => b.tela).map(b => ({ x: b.tela.x, z: b.tela.z, radio: b.tela.radio }));
    this.#factor = esc.oleadas === true || esc.oleadas === undefined ? 1 : Number(esc.oleadas) || 0;
    this.#proxOleada = reglas.bichos.oleadas.tabla[0].desde;
  }

  // datos: { semilla, escenario, mochilaCaida: { x, z, huecos } | null, pilas, caidasSeguidas }. Sin escenario, lo sortea TN.mundo.
  // pilas: las que coge del almacén al salir. Resultado: ok(expedicion) o error('escenario-invalido')
  static nueva(reglas, datos = {}) {
    const semilla = (Number(datos.semilla) || 0) >>> 0;
    const esc = datos.escenario || TN.mundo.genera(reglas, semilla, datos);
    if (!Expedicion.#valeEscenario(reglas, esc)) return TN.error('escenario-invalido', { campo: 'escenario' });
    const caida = datos.mochilaCaida || null;
    if (caida && !Expedicion.#valeCaida(reglas, caida)) return TN.error('escenario-invalido', { campo: 'mochilaCaida' });
    const mochila = TN.Mochila.nueva(reglas), pilas = Math.max(0, Math.floor(Number(datos.pilas) || 0));
    if (pilas) mochila.mete('pilas', pilas);
    const copia = caida && { x: caida.x, z: caida.z, huecos: caida.huecos.map(h => ({ material: h.material, cantidad: h.cantidad })) };
    return TN.ok(new Expedicion(reglas, TN.azar(semilla + 7919), esc, mochila, copia));
  }
  static #punto = p => !!p && Number.isFinite(p.x) && Number.isFinite(p.z);
  static #valeEscenario(r, e) {
    if (!e || ![e.bichos, e.botin, e.gigante].every(Array.isArray)) return false;
    const bichos = e.bichos.every(b => Expedicion.#punto(b) && !!r.bichos.clases[b.clase]);
    const botin = e.botin.every(m => Expedicion.#punto(m) && !!r.botin.materiales[m.material] && Number.isInteger(m.cantidad) && m.cantidad > 0);
    return bichos && botin && e.gigante.every(g => Expedicion.#punto(g) && Number.isFinite(g.t));
  }
  static #valeCaida(r, c) {
    const hueco = h => h && !!r.botin.materiales[h.material] && Number.isInteger(h.cantidad) && h.cantidad > 0;
    return Expedicion.#punto(c) && Array.isArray(c.huecos) && c.huecos.every(hueco);
  }

  // entrada: { mx, mz }, el movimiento en ejes del mundo (largo de 0 a 1). Devuelve los eventos del paso (TN.EVENTOS)
  paso(entrada) {
    if (this.#fase !== 'juego') return [];
    const ev = [];
    this.#t += this.#dt; this.#paso += 1;
    if (this.#paso === 1) ev.push({ tipo: 'sale' });
    this.#anda(entrada);
    this.#pasoNido(ev);
    if (this.#fin) return ev;
    if (!this.#enNido) this.#becario.gasta(this.#r, this.#dt, this.#mejoras.dura);
    this.#recoge(ev);
    this.#pasoBichos(ev);
    this.#dispara(ev);
    this.#pasoVoltios(ev);
    this.#pasoGigante(ev);
    this.#pasoBateria(ev);
    this.#ofrece(ev);
    return ev;
  }

  #anda(entrada) {
    const b = this.#becario, mx = Number(entrada && entrada.mx) || 0, mz = Number(entrada && entrada.mz) || 0;
    b.anda(this.#r, mx, mz, this.#dt, this.#mejoras.velocidad, TN.mapa.freno(this.#r, b.x, b.z));
  }

  // entrar y salir del nido; volver es quedarse en el felpudo (dentro del nido) tras haber estado fuera lo mínimo
  #pasoNido(ev) {
    const dentro = TN.mapa.enNido(this.#r, this.#becario.x, this.#becario.z), e = this.#r.expedicion;
    if (dentro !== this.#enNido) { ev.push({ tipo: dentro ? 'entra-nido' : 'sale-nido' }); this.#enNido = dentro; this.#felpudo = 0; }
    if (!dentro) { this.#fuera += this.#dt; return; }
    if (this.#fuera < e.fueraMinimo) return;
    this.#felpudo += this.#dt;
    if (this.#felpudo >= e.felpudo - 1e-9) this.#termina('vuelve', ev);
  }

  #recoge(ev) {
    const b = this.#becario;
    ev.push(...this.#montones.paso(this.#r, this.#dt, b.x, b.z, this.#mochila));
    const c = this.#caida;
    if (!c || Math.hypot(c.x - b.x, c.z - b.z) > this.#r.botin.recoge) return;
    this.#rescatada = c.huecos;
    this.#caida = null;
    ev.push({ tipo: 'mochila-recuperada', x: c.x, z: c.z, unidades: Expedicion.#suma(c.huecos) });
  }
  static #suma = huecos => huecos.reduce((s, h) => s + h.cantidad, 0);

  #pasoBichos(ev) {
    const r = this.#r, b = this.#becario;
    ev.push(...this.#bichos.despierta(r, b.x, b.z));
    this.#oleada(ev);
    this.#bichos.mueve(r, this.#dt, this.#t, b.x, b.z);
    for (const m of this.#bichos.muerden(r, this.#dt, this.#t, b.x, b.z, this.#enNido)) this.#mordisco(m, ev);
    this.#pasoTelas(ev);
  }
  #mordisco(m, ev) {
    if (m.perdonado) { ev.push({ tipo: 'mordisco-perdonado', bicho: m.bicho, clase: m.clase, x: m.x, z: m.z }); return; }
    ev.push({ tipo: 'mordisco', bicho: m.bicho, clase: m.clase, x: m.x, z: m.z, dano: m.dano, bateria: this.#becario.golpe(m.dano) });
  }
  #pasoTelas(ev) {
    const b = this.#becario, tela = this.#r.bichos.clases.arana.tela;
    if (this.#enNido || b.enTela) return;
    const t = this.#telas.find(o => Math.hypot(o.x - b.x, o.z - b.z) <= o.radio);
    if (!t) return;
    b.pisaTela(tela.segundos, tela.freno);
    ev.push({ tipo: 'tela', x: t.x, z: t.z, segundos: tela.segundos });
  }

  // la oleada cazadora: cada tantos segundos, salvo si ya hay demasiados despiertos (entonces espera)
  #oleada(ev) {
    if (!this.#factor || this.#t < this.#proxOleada || this.#bichos.despiertos >= this.#r.bichos.tope) return;
    const fila = TN.Bichos.oleada(this.#r, this.#t);
    this.#proxOleada += this.#r.bichos.oleadas.cada;
    const p = this.#lugarOleada(fila.cualquierLado);
    if (p) ev.push(...this.#bichos.agrega(this.#r, this.#cazadores(fila, p)));
  }
  // a su distancia del becario, por el lado contrario al nido (o por cualquiera), en un sitio libre; null si no lo hay
  #lugarOleada(cualquierLado) {
    const r = this.#r, b = this.#becario, n = r.mapa.nido, o = r.bichos.oleadas;
    const lejos = Math.hypot(b.x - n.x, b.z - n.z) > 1 && !cualquierLado;
    const base = lejos ? Math.atan2(b.z - n.z, b.x - n.x) : this.#azar.entre(0, Math.PI * 2);
    for (let i = 0; i < 8; i++) {
      const a = base + this.#azar.entre(-o.abanico, o.abanico), p = { x: b.x + Math.cos(a) * o.distancia, z: b.z + Math.sin(a) * o.distancia };
      if (!TN.mapa.choca(r, p.x, p.z, 1)) return p;
    }
    return null;
  }
  #cazadores(fila, p) {
    const h = Math.round(fila.hormigas * this.#factor), c = Math.round(fila.cucarachas * this.#factor), az = this.#azar;
    const cerca = () => ({ x: p.x + az.entre(-1, 1), z: p.z + az.entre(-1, 1) });
    const hormigas = Array.from({ length: h }, (_, i) => ({ clase: 'hormiga', ...cerca(), hueco: i * 2 * Math.PI / h }));
    return hormigas.concat(Array.from({ length: c }, () => ({ clase: 'cucaracha', ...cerca() })));
  }

  // la grapadora: una ráfaga cada `cada` segundos si hay a quién, con tantas grapas como diga la grapa doble
  #dispara(ev) {
    this.#recarga -= this.#dt;
    if (this.#recarga > 0) return;
    const b = this.#becario, blancos = TN.combate.objetivos(this.#r, b.x, b.z, this.#bichos.blancos, this.#mejoras.grapas);
    if (!blancos.length) return;
    this.#recarga = this.#r.arma.grapadora.cada;
    for (const o of blancos) this.#grapa(o.id, ev);
  }
  #grapa(id, ev) {
    const g = this.#bichos.dana(id, this.#mejoras.dano), b = this.#becario;
    if (!g) return;
    const k = g.bicho;
    ev.push({ tipo: 'dispara', bicho: k.id, x: b.x, z: b.z, ax: k.x, az: k.z });
    ev.push({ tipo: 'golpe-bicho', bicho: k.id, clase: k.clase, x: k.x, z: k.z, dano: this.#mejoras.dano, vida: g.vida });
    if (!g.muere) return;
    this.#muertos += 1;
    ev.push({ tipo: 'muere-bicho', bicho: k.id, clase: k.clase, x: k.x, z: k.z });
    const bolita = { id: this.#sigBolita++, x: k.x, z: k.z, voltios: this.#r.voltios.porBicho[k.clase] };
    this.#bolitas.push(bolita);
    ev.push({ tipo: 'voltio-suelta', bolita: bolita.id, x: k.x, z: k.z, voltios: bolita.voltios });
  }

  // las bolitas de voltios vuelan solas al becario si está cerca
  #pasoVoltios(ev) {
    const v = this.#r.voltios, b = this.#becario;
    this.#bolitas = this.#bolitas.filter(o => {
      const d = Math.hypot(b.x - o.x, b.z - o.z);
      if (d > v.coge && d < v.iman) {
        const k = Math.min(d, v.vuela * this.#dt) / d;
        o.x += (b.x - o.x) * k; o.z += (b.z - o.z) * k;
      }
      if (Math.hypot(b.x - o.x, b.z - o.z) > v.coge) return true;
      const barra = this.#mejoras.suma(o.voltios);
      ev.push({ tipo: 'voltio-recoge', bolita: o.id, x: o.x, z: o.z, voltios: o.voltios, tiene: barra.tiene, meta: barra.meta });
      return false;
    });
  }

  #pasoGigante(ev) {
    const r = this.#r, g = r.gigante;
    for (const p of this.#gigante.paso(r, this.#t)) {
      if (p.que === 'aviso') ev.push({ tipo: 'gigante-aviso', x: p.x, z: p.z, radio: g.radio, segundos: g.aviso });
      if (p.que === 'pisa') this.#pisa(p, ev);
      if (p.que === 'se-va') ev.push({ tipo: 'gigante-se-va' });
    }
  }
  #pisa(p, ev) {
    const r = this.#r, b = this.#becario;
    ev.push({ tipo: 'gigante-pisa', x: p.x, z: p.z, radio: r.gigante.radio });
    if (this.#enNido || !TN.Gigante.alcanza(r, p.x, p.z, b.x, b.z)) return;
    ev.push({ tipo: 'pisoton', x: p.x, z: p.z, dano: r.gigante.dano, bateria: b.pisoton(r, p.x, p.z) });
  }

  // la pila automática, el aviso de batería baja y la caída
  #pasoBateria(ev) {
    const r = this.#r.becario, b = this.#becario;
    if (b.bateria < r.pila.solaDesde && this.#mochila.cuenta('pilas') > 0) ev.push(this.#gastaPila(true));
    if (b.bateria < r.bateriaBaja && !this.#baja) ev.push({ tipo: 'bateria-baja', bateria: b.bateria });
    this.#baja = b.bateria < r.bateriaBaja;
    if (b.cayo) this.#termina('cae', ev);
  }
  #gastaPila(sola) {
    this.#mochila.saca('pilas', 1);
    return { tipo: 'pila-usada', bateria: this.#becario.recarga(this.#r.becario.pila.recarga), sola };
  }

  // al llenar la barra se para el juego y se ofrecen 3 mejoras (si hay sombra de zapato, espera a que pase)
  #ofrece(ev) {
    if (this.#fase !== 'juego' || !this.#mejoras.pendientes || this.#gigante.hayAviso) return;
    const o = this.#mejoras.ofrece(this.#azar);
    if (!o.ok) return;
    this.#fase = 'mejora';
    ev.push({ tipo: 'mejora-lista', oferta: o.valor });
  }

  #termina(tipo, ev) {
    const b = this.#becario, huecos = this.#mochila.huecos.concat(this.#rescatada.map(h => ({ ...h })));
    const unidades = Expedicion.#suma(huecos), segundos = this.#t;
    this.#fase = 'terminada';
    this.#fin = { tipo, segundos, unidades, huecos, botin: TN.sumaBotin({}, huecos), x: b.x, z: b.z, mejoras: this.#mejoras.cuantas, bichos: this.#muertos };
    ev.push(tipo === 'vuelve' ? { tipo, botin: { ...this.#fin.botin }, unidades, segundos } : { tipo, x: b.x, z: b.z, unidades, segundos });
  }

  // elegir una de las mejoras ofrecidas. Resultado: ok(eventos) o error('no-toca' | 'mejora-desconocida')
  eligeMejora(id) {
    if (this.#fase !== 'mejora') return TN.error('no-toca');
    const r = this.#mejoras.elige(id);
    if (!r.ok) return r;
    this.#fase = 'juego';
    return TN.ok([{ tipo: 'mejora-elegida', mejora: id, nivel: r.valor }]);
  }
  // gastar una pila de la mochila. Resultado: ok(eventos) o error('sin-pilas' | 'bateria-llena' | 'expedicion-terminada')
  usaPila() {
    if (this.#fase === 'terminada') return TN.error('expedicion-terminada');
    if (!this.#mochila.cuenta('pilas')) return TN.error('sin-pilas');
    if (this.#becario.bateria >= this.#becario.max) return TN.error('bateria-llena');
    return TN.ok([this.#gastaPila(false)]);
  }

  // el estado, de solo lectura (su forma: arriba, «LA FOTO»)
  foto() {
    const b = this.#becario, r = this.#r, m = this.#mochila, c = this.#caida;
    return TN.congela({
      t: this.#t, paso: this.#paso, fase: this.#fase, fin: this.#fin && { ...this.#fin, huecos: this.#fin.huecos.map(h => ({ ...h })), botin: { ...this.#fin.botin } },
      becario: { x: b.x, z: b.z, bateria: b.bateria, max: b.max, baja: b.bateria < r.becario.bateriaBaja, enNido: this.#enNido,
        enRio: TN.mapa.enRio(r, b.x, b.z), enTela: b.enTela, felpudo: Math.min(1, this.#felpudo / r.expedicion.felpudo) },
      bichos: this.#bichos.lista.filter(k => k.despierto).map(k => ({ id: k.id, clase: k.clase, x: k.x, z: k.z, vida: k.vida, vidaMax: k.vidaMax, caza: k.caza })),
      telas: this.#telas.map(t => ({ ...t })),
      botin: this.#montones.lista,
      bolitas: this.#bolitas.map(o => ({ ...o })),
      voltios: { tiene: this.#mejoras.voltios, meta: this.#mejoras.meta },
      mejoras: this.#mejoras.niveles, oferta: this.#mejoras.oferta,
      gigante: this.#gigante.sombras(r, this.#t),
      mochila: { huecos: m.huecos, unidades: m.unidades, tope: m.tope, porHueco: r.mochila.porHueco, pilas: m.cuenta('pilas') },
      mochilaCaida: c ? { x: c.x, z: c.z, unidades: Expedicion.#suma(c.huecos) } : null,
      rescatada: Expedicion.#suma(this.#rescatada),
      mapa: r.mapa,
    });
  }
};
