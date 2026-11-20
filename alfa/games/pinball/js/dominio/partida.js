// Fans of Pinball · dominio · PARTIDA: PB.Partida.nueva(reglas, opciones) da una partida con paso(dt, entrada), eligeMejora(i),
// baraja(), compra(i), salTienda() y foto(). Une las piezas del dominio: salas y plantas, reloj, ascensor (escalera en el código),
// tienda de Lola, mejoras, CAOS, bolas, enemigos, jefe y física. Fases: jugando → (ascensor) cayendo_de_planta → eligiendo → (mejora)
// jugando…, jugando ⇄ comprando (la bola en la tienda) y fin (reloj a 0 desde la planta 4, o victoria en la historia).
// paso() devuelve los eventos desde el paso anterior (también los de eligeMejora); la lista vale hasta la siguiente llamada.
'use strict';
PB.partida = (() => {
  const MODOS = ['historia', 'sinfin'];
  // el estado inicial; opciones ya comprobadas
  function estado(reglas, o) {
    const s = {
      r: reglas, az: PB.azar(o.semilla), modo: o.modo, planta: o.planta || 1, reloj: o.reloj ?? reglas.reloj.inicial,
      puntos: 0, fichas: 0, combo: 0, desdeGolpe: 99, bolaTocaAlgo: false,
      caos: { barra: 0, umbral: reglas.caos.barra, veces: 0, activo: false, quedan: 0, duracion: 0 },
      fase: 'jugando', tFase: 0, sala: null, bolas: [], cafes: [], cubitos: [], bolsas: [], siguienteBola: 1,
      equipo: o.equipo.slice(), activa: 0, niveles: { ...(o.niveles || {}) }, mejoras: {}, cif: PB.mejoras.cifras(reglas, {}),
      oferta: [], barajar: reglas.mejoras.barajarGratis, primera: Boolean(o.primeraPartida), yaEligio: false, garantiza: false,
      menosEnemigos: Boolean(o.menosEnemigos), resultado: null, ev: [], evOtra: [], compra: null,
      mesa: PB.mesa.crea(reglas), palas: reglas.mesa.palas.map(PB.palas.crea),
    };
    return s;
  }
  function empiezaSala(s) {
    const sala = PB.salas.crea(s.r, s.mesa, s.planta, s.modo, s.az, { menosEnemigos: s.menosEnemigos });
    if (sala.tipo !== 'jefe') sala.umbral = Math.max(Math.min(sala.umbral, s.cif.escaleraMinimo), sala.umbral - s.cif.escaleraMenos);
    else s.reloj = Math.max(s.reloj, s.r.reloj.jefeMinimo);
    s.sala = sala;
    PB.caos.nuevaSala(s);
    for (const p of s.palas) { p.congelada = 0; p.lenta = 0; p.ang = p.reposo; p.w = 0; }
    s.bolas.length = 0; s.cafes.length = 0; s.cubitos.length = 0; s.bolsas.length = 0;
    PB.bolas.lanza(s, s.equipo[s.activa]);
    s.fase = 'jugando';
    PB.emite(s, 'sala_empieza', { planta: s.planta, clase: sala.tipo, reloj: s.reloj });
    if (sala.tipo !== 'jefe' && sala.total === 0) PB.marcador.abreEscalera(s);
  }
  function acaba(s, resultado) {
    s.fase = 'fin'; s.resultado = resultado; s.caos.activo = false;
    PB.emite(s, 'fin', { resultado, planta: s.planta, puntos: s.puntos, fichas: Math.floor(s.fichas) });
  }
  // la bola entra por el ascensor abierto: tiempo, puntos, «¡por los pelos!» y a bajar de planta
  function entraEscalera(s, b) {
    const rr = s.r.reloj, sala = s.sala, c = s.r.puntos.cosas.escalera, pl = rr.porLosPelos;
    const pelos = s.reloj <= pl.quedan || sala.tiempo - b.tocoMarco <= pl.marco, expres = sala.tiempo < rr.expres.antesDe;
    const segundos = PB.salas.segundosEscalera(s.r, s.planta) + (expres ? rr.expres.segundos : 0);
    const puntos = c.puntos * s.planta, fichas = c.fichas * s.cif.fichas;
    if (s.caos.activo) PB.caos.acaba(s, true);
    s.reloj += segundos; s.puntos += puntos; s.fichas += fichas;
    s.garantiza = sala.tipo !== 'normal';
    s.planta += 1;
    PB.emite(s, 'escalera_entra', { x: b.x, y: b.y, segundos, puntos, fichas, expres, planta: s.planta });
    if (pelos) PB.emite(s, 'por_los_pelos', { x: b.x, y: b.y, camaraLenta: pl.camaraLenta, factor: pl.factor });
    s.bolas.length = 0; s.cafes.length = 0; s.cubitos.length = 0; s.bolsas.length = 0;
    s.fase = 'cayendo_de_planta'; s.tFase = rr.cayendo;
    s.oferta = PB.mejoras.ofrece(s.r, s.az, s.mejoras, { primera: s.primera && !s.yaEligio, garantiza: s.garantiza });
  }
  // la historia acaba con el primer SurvivalBot; en el sin fin se abre la escalera
  function jefeVencido(s) {
    if (s.modo === 'historia' && s.planta >= s.r.plantas.historia.plantas) return acaba(s, 'victoria');
    PB.marcador.abreEscalera(s);
  }
  const vivos = o => o.vivo !== false;
  function compacta(lista) {
    if (lista.every(vivos)) return;
    let n = 0;
    for (const o of lista) if (o.vivo !== false) lista[n++] = o;
    lista.length = n;
  }
  function limpia(s) {
    compacta(s.bolas); compacta(s.cafes); compacta(s.cubitos); compacta(s.bolsas); compacta(s.sala.rompibles); compacta(s.sala.enemigos);
  }
  function palas(s, entrada, dt) {
    for (const p of s.palas) {
      p.pulsada = Boolean(p.lado === 'izquierda' ? entrada.izquierda : entrada.derecha);
      p.congelada = Math.max(0, p.congelada - dt); p.lenta = Math.max(0, p.lenta - dt);
    }
  }
  function bolas(s, dt) {
    for (const b of s.bolas) if (b.vivo && b.estado === 'viaje') PB.bolas.pasoViaje(s, b, dt);
  }
  function despues(s, dt) {
    for (const b of s.bolas) {
      if (!b.vivo || b.estado !== 'mesa') continue;
      PB.poderes.paso(s, b, dt);
      PB.bolas.vigila(s, b, dt);
    }
  }
  function juega(s, dt, entrada) {
    s.sala.tiempo += dt;
    palas(s, entrada, dt);
    PB.marcador.avanzaReloj(s, dt);
    if (s.fase !== 'jugando') return;
    PB.marcador.pasaTiempoCombo(s, dt);
    PB.caos.paso(s, dt);
    PB.enemigos.paso(s, dt);
    PB.jefe.paso(s, dt);
    PB.proyectiles.paso(s, dt);
    bolas(s, dt);
    PB.fisica.paso(s, dt);
    if (s.fase === 'jugando') despues(s, dt);
    limpia(s);
  }
  function cae(s, dt) {
    s.tFase -= dt;
    if (s.tFase > 0) return;
    if (s.oferta.length) s.fase = 'eligiendo'; else empiezaSala(s);
  }
  function paso(s, dt, entrada) {
    if (s.fase === 'jugando') juega(s, dt, entrada || {});
    else if (s.fase === 'cayendo_de_planta') cae(s, dt);
    const fuera = s.ev;
    s.ev = s.evOtra; s.ev.length = 0; s.evOtra = fuera;
    return fuera;
  }
  function eligeMejora(s, i) {
    if (s.fase !== 'eligiendo') return PB.error('no_toca', { fase: s.fase });
    const id = s.oferta[i];
    if (!id) return PB.error('indice', { i });
    s.mejoras[id] = (s.mejoras[id] || 0) + 1;
    s.cif = PB.mejoras.cifras(s.r, s.mejoras); s.yaEligio = true; s.oferta = [];
    PB.emite(s, 'mejora', { mejora: id, nivel: s.mejoras[id] });
    empiezaSala(s);
    return PB.ok({ mejora: id, nivel: s.mejoras[id] });
  }
  function baraja(s) {
    if (s.fase !== 'eligiendo') return PB.error('no_toca', { fase: s.fase });
    if (s.barajar <= 0) return PB.error('sin_barajar');
    s.barajar -= 1;
    s.oferta = PB.mejoras.ofrece(s.r, s.az, s.mejoras, { garantiza: s.garantiza });
    return PB.ok(s.oferta.slice());
  }
  // comprueba las opciones: { semilla, modo, equipo, niveles, primeraPartida, menosEnemigos, planta, reloj }
  function revisa(reglas, o) {
    if (!Number.isFinite(o.semilla)) return PB.error('sin_semilla');
    if (!MODOS.includes(o.modo)) return PB.error('modo_desconocido', { modo: o.modo });
    if (!o.equipo.length || o.equipo.some(c => !reglas.criaturas.lista[c])) return PB.error('equipo_no_vale', { equipo: o.equipo });
    if (o.planta !== undefined && !(Number.isInteger(o.planta) && o.planta >= 1)) return PB.error('planta_no_vale', { planta: o.planta });
    return PB.ok(o);
  }
  return { estado, empiezaSala, acaba, entraEscalera, jefeVencido, paso, eligeMejora, baraja, revisa };
})();

PB.Partida = {
  // una partida nueva lista para jugar (la bola ya sale por el lanzador). opciones.planta y opciones.reloj solo para pruebas
  nueva(reglas, opciones = {}) {
    const o = { modo: 'historia', equipo: reglas.criaturas.equipo, semilla: 1, ...opciones };
    const r = PB.partida.revisa(reglas, o);
    if (!r.ok) return r;
    const s = PB.partida.estado(reglas, o);
    PB.partida.empiezaSala(s);
    return PB.ok({
      paso: (dt, entrada) => PB.partida.paso(s, dt, entrada),
      eligeMejora: i => PB.partida.eligeMejora(s, i),
      baraja: () => PB.partida.baraja(s),
      compra: i => PB.tienda.compra(s, i),
      salTienda: () => PB.tienda.salir(s),
      foto: () => PB.foto.rellena(s),
      get fase() { return s.fase; },
      // el estado por dentro: SOLO para los tests y el panel DEV (preparar escenarios); la pantalla usa foto()
      estadoInterno: () => s,
    });
  },
};
