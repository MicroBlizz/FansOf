// Fans of Rally · dominio · CARRERA: una carrera en un tramo. Coloca la parrilla (tú, el último), cuenta atrás, mueve los coches con
// los mandos que le pasan, lleva las vueltas de cada uno, los puestos y, en el campeonato, el tiempo que queda: cada control de la
// vuelta (y cada paso por meta) suma segundos, y si llega a 0 se acabó. En la contrarreloj lleva el crono y la mejor vuelta.
// paso(dt, mandos) devuelve lo que ha pasado (eventos con nombre) para que la pantalla lo cuente. Pura: el tiempo lo pone quien juega.
'use strict';
RA.Carrera = class {
  #pista; #reglas; #modo; #vueltas; #coches; #estado = 'cuenta'; #reloj = 0; #queda = 0; #cuenta;
  #tiempoVuelta = 0; #vueltasHechas = []; #controles = new Set(); #puesto = 0; #referencia; #rejilla = new Map();

  // datos: { pista, tramo, modo: 'campeonato'|'contrarreloj', reglas: AJUSTES, jugador: { ficha }, rivales: [{ id, ficha, pericia, carril }],
  //         obstaculos: [{ x, y, r }] (árboles, rocas… de RA.Paisaje.obstaculos) }
  static crea(datos) {
    if (!datos || !datos.pista || !datos.tramo) return RA.error('sin_pista');
    if (datos.modo !== 'campeonato' && datos.modo !== 'contrarreloj') return RA.error('modo_desconocido', datos.modo);
    return RA.ok(new RA.Carrera(datos));
  }
  constructor({ pista, tramo, modo, reglas, jugador, rivales = [], obstaculos = [] }) {
    this.#pista = pista; this.#reglas = reglas; this.#modo = modo;
    this.#vueltas = modo === 'campeonato' ? reglas.carrera.vueltasCampeonato : reglas.carrera.vueltasContrarreloj;
    this.#cuenta = reglas.carrera.cuentaAtras;
    this.#referencia = pista.largo / 150;                       // una vuelta de referencia: la pista entera a 150 px/s
    this.#queda = tramo.tiempo.inicial * this.#referencia;
    const lista = modo === 'campeonato' ? rivales : [];
    this.#coches = [...lista.map(r => ({ ...r, jugador: false })), { id: 'jugador', ficha: jugador.ficha, jugador: true }]
      .map((c, k) => this.#enParrilla(c, k));
    this.#tiempoPorControl = tramo.tiempo.porControl * this.#referencia;
    for (const o of obstaculos) { const k = this.#celda(o.x, o.y); if (!this.#rejilla.has(k)) this.#rejilla.set(k, []); this.#rejilla.get(k).push(o); }
  }
  #celda(x, y) { return `${Math.floor(x / 64)},${Math.floor(y / 64)}`; }
  #tiempoPorControl = 0;
  #enParrilla(c, k) {   // escalonados, uno detrás de otro: nadie empata al salir
    const p = this.#pista, i = (p.n - 8 - k * 7) % p.n, lado = (k % 2 ? 1 : -1) * p.ancho * 0.22;
    const a = p.ang[i] + Math.PI / 2;
    return { ...c, coche: RA.Coche.nuevo(p.x[i] + Math.cos(a) * lado, p.y[i] + Math.sin(a) * lado, p.ang[i]), i, vuelta: -1, llegada: 0 };
  }

  get estado() { return this.#estado; }
  get modo() { return this.#modo; }
  get vueltas() { return this.#vueltas; }
  get coches() { return this.#coches; }
  get jugador() { return this.#coches[this.#coches.length - 1]; }
  get queda() { return this.#queda; }
  get reloj() { return this.#reloj; }
  get cuenta() { return this.#cuenta; }
  get tiempoVuelta() { return this.#tiempoVuelta; }
  get vueltasHechas() { return this.#vueltasHechas.slice(); }
  get mejorVuelta() { return this.#vueltasHechas.length ? Math.min(...this.#vueltasHechas) : null; }
  get vueltaActual() { return RA.limita(this.jugador.vuelta + 1, 1, this.#vueltas); }
  get puesto() { return this.#puesto || this.#puestoDe(this.jugador); }
  get total() { return this.#coches.length; }

  #progreso(c) { return c.llegada ? 1e9 - c.llegada : c.vuelta * this.#pista.n + c.i; }
  #puestoDe(c) { const mio = this.#progreso(c); return 1 + this.#coches.filter(o => o !== c && this.#progreso(o) > mio).length; }
  // la clasificación de ahora: los coches del primero al último
  clasificacion() { return this.#coches.slice().sort((a, b) => this.#progreso(b) - this.#progreso(a)); }

  paso(dt, mandosDe) {
    if (this.#estado === 'cuenta') return this.#pasoCuenta(dt);
    if (this.#estado !== 'corriendo') return [];
    this.#reloj += dt; this.#tiempoVuelta += dt;
    const eventos = [];
    this.#coches.forEach(c => this.#mueve(c, mandosDe(c), dt, eventos));
    this.#choques(eventos);
    if (this.#modo === 'campeonato') this.#cuentaTiempo(dt, eventos);
    return eventos;
  }
  #pasoCuenta(dt) {
    const antes = Math.ceil(this.#cuenta);
    this.#cuenta -= dt;
    if (this.#cuenta <= 0) { this.#estado = 'corriendo'; return [{ tipo: 'salida' }]; }
    return Math.ceil(this.#cuenta) !== antes ? [{ tipo: 'cuenta', numero: Math.ceil(this.#cuenta) }] : [];
  }
  #mueve(c, m, dt, eventos) {
    const p = this.#pista, sitio = RA.Pista.cercana(p, c.coche.x, c.coche.y, c.i);
    const suelo = this.#reglas.suelos[RA.Pista.sueloBajo(p, sitio.i, sitio.distancia)];
    const quieto = c.llegada && !c.jugador;
    c.coche = RA.Coche.paso(c.coche, quieto ? { giro: 0, gas: 0, freno: 1 } : m, c.ficha, suelo, dt);
    c.suelo = RA.Pista.sueloBajo(p, sitio.i, sitio.distancia);
    const salto = sitio.i - c.i;
    c.i = sitio.i;
    if (salto < -p.n / 2) this.#cruzaMeta(c, eventos);
    else if (salto > p.n / 2) c.vuelta--;                        // ha cruzado la meta marcha atrás
    if (c.jugador) this.#controlesDe(c, eventos);
  }
  #cruzaMeta(c, eventos) {
    c.vuelta++;
    if (c.vuelta === 0) return;                                  // la primera vez es salir de la parrilla
    if (c.jugador) this.#vueltaDelJugador(c, eventos);
    else if (c.vuelta >= this.#vueltas && !c.llegada) c.llegada = this.#reloj;
  }
  #vueltaDelJugador(c, eventos) {
    this.#vueltasHechas.push(this.#tiempoVuelta);
    eventos.push({ tipo: 'vuelta', numero: c.vuelta, tiempo: this.#tiempoVuelta, mejor: this.#tiempoVuelta <= this.mejorVuelta });
    this.#tiempoVuelta = 0;
    if (c.vuelta >= this.#vueltas) {
      c.llegada = this.#reloj; this.#puesto = this.#puestoDe(c); this.#estado = 'fin';
      eventos.push({ tipo: 'meta', puesto: this.#puesto });
      return;
    }
    if (c.vuelta === this.#vueltas - 1) eventos.push({ tipo: 'ultimaVuelta' });
    this.#suma('meta', eventos);
  }
  #controlesDe(c, eventos) {
    if (c.vuelta < 0) return;
    this.#reglas.carrera.controles.forEach((f, k) => {
      const clave = c.vuelta * 10 + k;
      if (c.i / this.#pista.n >= f && c.i / this.#pista.n < f + 0.05 && !this.#controles.has(clave)) { this.#controles.add(clave); this.#suma('control', eventos); }
    });
  }
  #suma(donde, eventos) {
    if (this.#modo !== 'campeonato') return;
    this.#queda += this.#tiempoPorControl;
    eventos.push({ tipo: 'control', donde, extra: this.#tiempoPorControl });
  }
  #cuentaTiempo(dt, eventos) {
    this.#queda -= dt;
    if (this.#queda > 0) return;
    this.#queda = 0; this.#estado = 'sinTiempo'; this.#puesto = this.#puestoDe(this.jugador);
    eventos.push({ tipo: 'sinTiempo' });
  }
  #choques(eventos) {
    const r = this.#reglas.coche.radio, l = this.#coches;
    for (let a = 0; a < l.length; a++) for (let b = a + 1; b < l.length; b++) {
      const [na, nb] = RA.Coche.choque(l[a].coche, l[b].coche, r);
      if (na !== l[a].coche && (l[a].jugador || l[b].jugador)) eventos.push({ tipo: 'golpeCoche' });
      l[a].coche = na; l[b].coche = nb;
    }
    for (const c of l) this.#contraElPaisaje(c, r, eventos);
  }
  #contraElPaisaje(c, r, eventos) {
    const cx = Math.floor(c.coche.x / 64), cy = Math.floor(c.coche.y / 64);
    for (let i = cx - 1; i <= cx + 1; i++) for (let j = cy - 1; j <= cy + 1; j++) {
      for (const o of this.#rejilla.get(`${i},${j}`) || []) {
        const antes = c.coche;
        c.coche = RA.Coche.choqueFijo(c.coche, o, r);
        if (c.coche !== antes && c.jugador) eventos.push({ tipo: 'golpe', fuerza: Math.hypot(antes.vx, antes.vy) });
      }
    }
  }
};
