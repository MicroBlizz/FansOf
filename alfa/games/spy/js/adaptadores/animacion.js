// Fans of Spy · ADAPTADORES · La animación: lo que SE VE de la partida. El dominio resuelve cada jugada de golpe y deja una lista
// de eventos; aquí cada evento se convierte en uno o varios «actos» con su duración (un paso, un giro, la caja que cae, una onda
// de ruido…) que se reproducen en orden, uno detrás de otro. Mientras quedan actos, la pantalla no admite jugadas (un toque los
// acelera). `v` es la vista: dónde está y hacia dónde mira cada uno ahora mismo en pantalla, que va por detrás de la partida.
// Lo que suena y lo que se escribe en pantalla lo hacen los `efectos` que pasa principal.js: { suena, cartel, carta, roba, pasa }.
'use strict';
var SPY = globalThis.SPY || (globalThis.SPY = {});
(function (S) {
  const R = S.rejilla;
  const TAU = Math.PI * 2;
  // El giro (alrededor del eje vertical) con el que un modelo que mira al norte queda mirando en la dirección `dir` (0 a 7).
  const anguloDe = (dir) => Math.atan2(-R.DIRS[dir].x, -R.DIRS[dir].y);
  const haciaAngulo = (a, va, k) => a + ((((va - a + Math.PI) % TAU) + TAU) % TAU - Math.PI) * k;
  const PASO = { puntillas: 0.2, andar: 0.15, carrera: 0.1, guardia: 0.17, alerta: 0.11 };

  const nueva = () => ({ t: 0, agente: null, guardias: new Map(), camaras: new Map(), objetos: [], ondas: [], bala: null, temblor: 0, destello: 0,
    alerta: { activa: false, turnos: 0 }, vida: 0, cola: [], acto: null, rapido: 1, alVaciar: null });

  // Pone la vista tal como está la partida, sin animar (al empezar una planta y al rebobinar).
  function sincroniza(v, p, planta) {
    const a = p.agente, giro = anguloDe(a.dir);
    v.agente = { x: a.x + 0.5, z: a.y + 0.5, dir: a.dir, giro, giroVa: giro, modo: 'quieto', fase: 0, caja: a.oculto ? 1 : 0, cajaVa: a.oculto ? 1 : 0 };
    v.guardias = new Map(p.guardias.map((g) => {
      const datos = (planta.datos.guardias || []).find((d) => d.id === g.id) || {}, caido = g.estado === 'derribado' ? 1 : 0;
      return [g.id, { id: g.id, tipo: g.tipo, patinete: !!datos.patinete, x: g.x + 0.5, z: g.y + 0.5, dir: g.dir, giro: anguloDe(g.dir), giroVa: anguloDe(g.dir),
        estado: g.estado, anda: false, fase: 0, caido, caidoVa: caido, fuera: g.escondido ? 1 : 0, fueraVa: g.escondido ? 1 : 0, embiste: 0 }];
    }));
    v.camaras = new Map(p.camaras.map((c) => [c.id, { id: c.id, x: c.x + 0.5, z: c.y + 0.5, dir: c.dirs[c.i], giro: anguloDe(c.dirs[c.i]), giroVa: anguloDe(c.dirs[c.i]) }]));
    v.objetos = p.objetos.map((o) => ({ tipo: o.tipo, x: o.x + 0.5, z: o.y + 0.5 }));
    Object.assign(v, { ondas: [], bala: null, cola: [], acto: null, alVaciar: null, rapido: 1, temblor: 0, destello: 0, vida: a.vida, alerta: { activa: p.alerta.activa, turnos: p.alerta.turnos } });
  }

  const quien = (v, id) => (id === 'agente' ? v.agente : v.guardias.get(id) || v.camaras.get(id));
  // Pone a alguien mirando hacia `dir` (el giro se ve después, suavizado).
  const encara = (v, id, dir) => { const q = quien(v, id); q.dir = dir; q.giroVa = anguloDe(dir); return q; };
  const onda = (v, x, z, radio, color) => { v.ondas.push({ x, z, radio, color, t: 0, dur: 0.55 }); };

  // Un paso de alguien hasta la casilla siguiente.
  function actoPaso(q, paso, dur, alEmpezar) {
    let x0 = 0, z0 = 0;
    return {
      dur,
      alEmpezar(v) { x0 = q.x; z0 = q.z; q.dir = paso.dir; q.giroVa = anguloDe(paso.dir); if (alEmpezar) alEmpezar(v); },
      paso(v, k) { q.x = x0 + (paso.x + 0.5 - x0) * k; q.z = z0 + (paso.y + 0.5 - z0) * k; },
    };
  }
  function actosMueve(v, ev, fx) {
    const esAgente = ev.quien === 'agente', q = quien(v, ev.quien);
    const dur = esAgente ? PASO[ev.modo === 'andar' ? 'andar' : ev.modo] || PASO.andar : q.estado === 'alerta' ? PASO.alerta : PASO.guardia;
    const actos = ev.camino.map((paso) => actoPaso(q, paso, dur, () => {
      if (esAgente) q.modo = ev.modo === 'carrera' ? 'corre' : ev.modo === 'puntillas' ? 'puntillas' : 'anda'; else q.anda = true;
      fx.suena(esAgente ? (ev.modo === 'puntillas' ? 'spyPuntillas' : 'spyPaso') : q.patinete ? 'spyPatinete' : 'spyPasoRobot');
    }));
    actos.push({ dur: 0, alEmpezar() { if (esAgente) q.modo = 'quieto'; else q.anda = false; } });
    return actos;
  }

  // Cada evento del dominio, convertido en actos. Los que solo avisan (un cartel, un sonido) duran lo justo para leerse.
  const ACTOS = {
    mueve: actosMueve,
    gira: (v, ev) => [{ dur: 0.2, alEmpezar() { encara(v, ev.quien, ev.dir); } }],
    estado: (v, ev, fx) => [{ dur: ev.estado === 'alerta' ? 0.12 : 0.25, alEmpezar() {
      const g = v.guardias.get(ev.quien);
      g.estado = ev.estado;
      if (ev.estado === 'sospecha') fx.suena('spySospecha');
      if (ev.estado !== 'cafe') return;
      v.objetos = v.objetos.filter((o) => Math.floor(o.x) !== Math.floor(g.x) || Math.floor(o.z) !== Math.floor(g.z));
      fx.suena('spySorbo'); fx.cartel('El Becario se para a por su café', 'bien');
    } }],
    alerta: (v, ev, fx) => [{ dur: 0.55, alEmpezar() { v.alerta = { activa: true, turnos: S.AJ.alerta.turnos }; v.destello = 1; v.temblor = 0.5; fx.suena('spyAlerta'); fx.cartel('¡ALERTA!', 'mal'); } }],
    calma: (v, ev, fx) => [{ dur: 0.4, alEmpezar() { v.alerta = { activa: false, turnos: 0 }; fx.suena('spyCalma'); fx.cartel('Vuelve la calma', 'bien'); } }],
    cuenta: (v, ev) => [{ dur: 0, alEmpezar() { v.alerta.turnos = ev.turnos; } }],
    ruido: (v, ev, fx) => [{ dur: 0.25, alEmpezar() { onda(v, ev.x + 0.5, ev.y + 0.5, ev.radio + 0.5, [1, 0.6, 0.15]); fx.suena('spyRuido'); } }],
    toc: (v, ev, fx) => [{ dur: 0.4, alEmpezar() { onda(v, ev.x + 0.5, ev.y + 0.5, 1.2, [1, 0.82, 0.25]); fx.suena('spyToc'); } }],
    carta: (v, ev, fx) => [{ dur: 0.28, alEmpezar() { fx.carta(ev); fx.suena('spyCarta'); } }],
    caja: (v, ev, fx) => [{ dur: 0.35, alEmpezar() { v.agente.cajaVa = 1; fx.suena('spyCaja'); } }],
    sale: (v) => [{ dur: 0.12, alEmpezar() { v.agente.cajaVa = 0; v.agente.caja = 0; } }],
    descubre: (v, ev, fx) => [{ dur: 0.3, alEmpezar() { encara(v, ev.quien, ev.dir); v.agente.cajaVa = 0; fx.cartel('¡Se ha topado contigo!', 'mal'); } }],
    deja: (v, ev, fx) => [{ dur: 0.2, alEmpezar() { v.objetos.push({ tipo: ev.tipo, x: ev.x + 0.5, z: ev.y + 0.5 }); fx.suena('spyDeja'); } }],
    derriba: (v, ev, fx) => [{ dur: 0.4, alEmpezar() { const g = v.guardias.get(ev.quien); g.estado = 'derribado'; g.caidoVa = 1; onda(v, g.x, g.z, 0.9, [1, 1, 1]); fx.suena('spyDerriba'); } }],
    esconde: (v, ev, fx) => [{ dur: 0.35, alEmpezar() { v.guardias.get(ev.quien).fueraVa = 1; fx.suena('spyEsconde'); fx.cartel('Guardia escondido', 'bien'); } }],
    disparo: (v, ev, fx) => [{ dur: 0.18, alEmpezar() { const g = v.guardias.get(ev.quien); v.bala = { x0: v.agente.x, z0: v.agente.z, x1: g.x, z1: g.z, k: 0 }; fx.suena('spyDisparo'); },
      paso(v2, k) { if (v.bala) v.bala.k = k; }, alAcabar() { v.bala = null; fx.suena('spyGolpe'); } }],
    golpe: (v, ev, fx) => [{ dur: 0.4, alEmpezar() { encara(v, ev.quien, ev.dir).embiste = 1; v.vida = ev.vida; v.destello = 0.8; v.temblor = 0.6; fx.suena('spyGolpe'); fx.cartel('Pierdes ' + ev.dano + ' de vida', 'mal'); } }],
    cura: (v, ev, fx) => [{ dur: 0.3, alEmpezar() { v.vida = ev.vida; fx.suena('spyCura'); fx.cartel('Recuperas vida', 'bien'); } }],
    descanso: (v, ev, fx) => [{ dur: 0.2, alEmpezar() { fx.suena('spyCura'); fx.cartel('Coste del turno: ' + ev.gasto, 'bien'); } }],
    plano: (v, ev, fx) => [{ dur: 0.25, alEmpezar() { fx.suena('spyCarta'); fx.cartel('Ves todos los conos', 'bien'); } }],
    roba: (v, ev, fx) => [{ dur: 0.18, alEmpezar() { fx.roba(ev); } }],
    rebaraja: (v, ev, fx) => [{ dur: 0.5, alEmpezar() { fx.suena('spyBaraja'); fx.cartel('Mazo rebarajado: +' + ev.coste + ' de coste', 'mal'); } }],
    secreto: (v, ev, fx) => [{ dur: 0.7, alEmpezar() { onda(v, ev.x + 0.5, ev.y + 0.5, 1.4, [1, 0.82, 0.25]); fx.suena('spySecreto'); fx.cartel('¡El cochazo del CEO! Clips extra', 'bien'); } }],
    cuerpo: (v, ev, fx) => [{ dur: 0.35, alEmpezar() { fx.cartel('Han visto a un compañero en el suelo', 'mal'); } }],
    pasa: (v, ev, fx) => [{ dur: 0.12, alEmpezar() { fx.pasa(ev); } }],
    turno: () => [],
    fin: (v, ev, fx) => [{ dur: 0.7, alEmpezar() { fx.suena(ev.como === 'meta' ? 'spyVictoria' : 'spyCaido'); } }],
  };

  // Pone en cola los actos de una lista de eventos. Al vaciarse la cola se llama a `alVaciar`.
  function reproduce(v, eventos, fx, alVaciar) {
    for (const ev of eventos) { const hace = ACTOS[ev.t]; if (hace) v.cola.push(...hace(v, ev, fx)); }
    v.alVaciar = alVaciar || null;
  }
  const ocupada = (v) => !!(v.acto || v.cola.length);

  // Lo que se suaviza solo en cada imagen: los giros, la caja, los guardias que caen o desaparecen, las ondas y los temblores.
  function suaviza(v, dt) {
    const k = Math.min(1, dt * 14), a = v.agente;
    a.giro = haciaAngulo(a.giro, a.giroVa, k); a.caja += (a.cajaVa - a.caja) * Math.min(1, dt * 9);
    a.fase += dt * (a.modo === 'corre' ? 20 : a.modo === 'puntillas' ? 11 : 15);
    for (const g of v.guardias.values()) {
      g.giro = haciaAngulo(g.giro, g.giroVa, k); g.fase += dt * 13;
      g.caido += (g.caidoVa - g.caido) * Math.min(1, dt * 10); g.fuera += (g.fueraVa - g.fuera) * Math.min(1, dt * 7);
      g.embiste = Math.max(0, g.embiste - dt * 3.5);
    }
    for (const c of v.camaras.values()) c.giro = haciaAngulo(c.giro, c.giroVa, Math.min(1, dt * 7));
    for (const o of v.ondas) o.t += dt;
    v.ondas = v.ondas.filter((o) => o.t < o.dur);
    v.temblor = Math.max(0, v.temblor - dt * 1.8); v.destello = Math.max(0, v.destello - dt * 1.6);
  }

  // Avanza la vista `dt` segundos: reproduce los actos que toquen (más deprisa si el jugador ha tocado para acelerar).
  function avanza(v, dt) {
    v.t += dt;
    suaviza(v, dt);
    let resto = dt * v.rapido;
    while (resto >= 0 && (v.acto || v.cola.length)) {
      if (!v.acto) { v.acto = v.cola.shift(); v.acto.t = 0; if (v.acto.alEmpezar) v.acto.alEmpezar(v); }
      const a = v.acto, usa = Math.min(resto, a.dur - a.t);
      a.t += usa; resto -= usa;
      if (a.paso) a.paso(v, a.dur ? a.t / a.dur : 1);
      if (a.t < a.dur - 1e-9) break;
      if (a.alAcabar) a.alAcabar(v);
      v.acto = null;
    }
    if (!ocupada(v) && v.alVaciar) { const f = v.alVaciar; v.alVaciar = null; v.rapido = 1; f(); }
  }

  S.animacion = Object.freeze({ nueva, sincroniza, reproduce, avanza, ocupada, anguloDe });
})(SPY);
