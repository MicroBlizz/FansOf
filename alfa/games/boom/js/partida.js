// Fans of Boom · PARTIDA: el estado de una partida y sus turnos. Quién tira (el de menos RETRASO), el viento, el disparo, la explosión, el daño
// y quién gana. No dibuja nada ni toca el DOM: avisa de lo que pasa con una lista de sucesos (PARTIDA.sucesos()) que lee quien pinta.
// Sirve igual para hot seat (una o varias personas en el mismo aparato), contra la IA y, más adelante, para repetir las acciones del online.
'use strict';
const PARTIDA = (() => {
  const C = BOOM.movil, DT = BOOM.paso;
  let P = null;
  const aviso = (t, d) => P.sucesos.push(Object.assign({ t }, d));
  const vivos = () => P.moviles.filter(m => m.vivo);

  function nueva(cfg) {   // cfg: { modo: '1v1' | '2v2', mapa, slots: [{ ia, nivel, nombre }], semilla }
    const modo = BOOM.modos[cfg.modo], semilla = cfg.semilla || ((Math.random() * 2147483647) | 0), W = BOOM.mundo.ancho;
    const cuenta = [0, 0], salidas = modo.equipos.map(e => W * modo.x[e][cuenta[e]++]);
    TERRENO.crea(cfg.mapa, semilla, salidas);
    const moviles = modo.equipos.map((e, i) => {
      const s = cfg.slots[i] || {}, m = MOVIL.crea(i, i, e, salidas[i], e === 0 ? 1 : -1, s.movil);
      m.ia = !!s.ia; m.nivel = s.nivel == null ? 1 : s.nivel; m.nombre = s.nombre || (m.ia ? BOOM.nombresIA[i % BOOM.nombresIA.length] : 'Jugador ' + (i + 1));
      return m;
    });
    const personas = moviles.filter(m => !m.ia).length;
    P = { cfg, semilla, moviles, az: mulberry32(semilla ^ 0x9e3779b1), viento: 0, fase: 'inicio', actual: null, t: 0, usado: 0, proys: [], plan: null, espera: 0,
      sucesos: [], pausa: false, ganador: null, turnos: 0, tiroUsado: false, hotSeat: personas >= 2, bono: false };
    P.viento = Math.round((P.az() * 2 - 1) * BOOM.viento.max);
    empiezaTurno(true);
    return P;
  }

  function cambiaViento() {
    const V = BOOM.viento;
    P.viento = P.az() < 0.15 ? Math.round((P.az() * 2 - 1) * V.max) : clamp(P.viento + Math.round((P.az() * 2 - 1) * V.cambio), -V.max, V.max);
  }
  function empiezaTurno(primero) {
    const v = vivos();
    if (new Set(v.map(m => m.equipo)).size < 2) return termina();
    const m = v.reduce((a, b) => (b.retraso < a.retraso ? b : a));
    const base = m.retraso; v.forEach(x => { x.retraso -= base; });
    if (!primero) cambiaViento();
    P.actual = m; m.energia = C.energia; P.t = BOOM.turno.segundos; P.usado = 0; P.tiroUsado = false; P.turnos++;
    if (m.tiro === 2 && m.caos < BOOM.caos.max) m.tiro = 0;
    P.plan = m.ia ? IA.plan(P, m) : null;
    P.fase = P.hotSeat && !m.ia ? 'cartel' : 'apunta';
    aviso('turno', { m });
  }
  function listo() { if (P.fase === 'cartel') P.fase = 'apunta'; }   // la persona ya tiene el aparato: se ve el viento y corre el tiempo

  function termina() {
    const e = [...new Set(vivos().map(m => m.equipo))];
    P.fase = 'fin'; P.ganador = e.length === 1 ? e[0] : -1; aviso('fin', { ganador: P.ganador });
  }

  // ---- lo que hace quien juega (la IA usa las mismas) ----
  const puede = () => P && P.fase === 'apunta' && !P.pausa && P.actual && !P.actual.ia;
  function mueve(dir, dt) { if (puede()) MOVIL.mueve(P.actual, dir, dt); }
  function apunta(dAng, dPot) { if (puede()) { P.actual.ang = clamp(P.actual.ang + dAng, 0, 90); P.actual.pot = clamp(P.actual.pot + dPot, 5, 100); } }
  function fija(ang, pot, dir) { if (puede()) { const m = P.actual; m.ang = clamp(ang, 0, 90); m.pot = clamp(pot, 5, 100); if (dir) m.dir = dir; } }
  function eligeTiro(i) { if (puede() && P.actual.def.tiros[i] && (i < 2 || P.actual.caos >= BOOM.caos.max)) P.actual.tiro = i; }
  function dispara() {
    const m = P && P.actual;
    if (!m || P.fase !== 'apunta' || m.cayendo) return false;
    m.ang = Math.round(m.ang); m.pot = Math.round(m.pot);   // el tiro siempre sale con grados y potencia enteros
    if (m.tiro === 2 && m.caos < BOOM.caos.max) m.tiro = 0;
    P.proys = FISICA.lanza(m, P.viento); P.tiroUsado = true; P.fase = 'vuelo'; P.bono = false;
    m.caos = m.tiro === 2 ? 0 : Math.min(BOOM.caos.max, m.caos + BOOM.caos.porTiro);
    aviso('disparo', { m });
    return true;
  }
  function pasa() { if (puede()) pierdeTurno(); }

  // ---- el paso de la simulación (siempre BOOM.paso segundos) ----
  function paso() {
    if (!P || P.pausa) return;
    const m = P.actual;
    if (P.fase === 'apunta') {
      caidas();
      if (!m.vivo) return cierraTurno();
      P.t -= DT; P.usado += DT;
      if (m.ia && IA.paso(P, m, DT)) dispara();
      else if (P.t <= 0) pierdeTurno();
    } else if (P.fase === 'vuelo') {
      for (const p of P.proys) {
        if (p.hecho) continue;
        if (FISICA.paso(p, P.moviles)) { p.hecho = true; explota(p); }
        else if (Math.round(p.t / DT) % 3 === 0) p.traza.push([p.x, p.y]);
      }
      if (P.proys.every(p => p.hecho)) { P.proys = []; P.fase = 'despues'; P.espera = 0.8; }
    } else if (P.fase === 'despues') {
      const quietos = caidas();
      P.espera -= DT;
      if (quietos && P.espera <= 0) cierraTurno();
    } else caidas();
  }
  function pierdeTurno() { P.tiroUsado = false; P.usado = BOOM.turno.segundos; aviso('tiempo', { m: P.actual }); cierraTurno(); }

  function explota(p) {
    const dueno = P.moviles[p.dueno], T = p.def, fin = p.fin || { tipo: 'vacio' };
    dueno.marca = { x: clamp(p.x, 0, BOOM.mundo.ancho), y: clamp(p.y, 0, BOOM.mundo.alto) };
    if (fin.tipo === 'terreno' || fin.tipo === 'movil') {
      TERRENO.cava(p.x, p.y, T.radio);
      aviso('explosion', { x: p.x, y: p.y, r: T.radio, alto: p.alto });
      for (const mv of vivos()) {
        const d = Math.hypot(p.x - mv.x, p.y - (mv.y - C.centro));
        if (d > T.radio + C.radio) continue;
        const f = clamp(1 - Math.max(0, d - C.radio) / T.radio, 0.15, 1), enemigo = mv.equipo !== dueno.equipo;
        let n = T.dano * f, bono = null;
        if (!enemigo) n *= BOOM.fuegoAmigo;
        else if (p.alto) { n *= BOOM.altura.cielo; bono = 'cielo'; }
        else if (p.ang >= BOOM.altura.alto) { n *= BOOM.altura.altoMult; bono = 'alto'; }
        herido(mv, Math.round(n), bono, p);
      }
    } else aviso('fuera', { x: p.x, y: p.y });
  }
  function herido(m, n, bono, p) {
    m.vida -= n; m.caos = Math.min(BOOM.caos.max, m.caos + n * BOOM.caos.porDano); aviso('dano', { m, n, bono });
    if (bono && !P.bono) { P.bono = true; aviso('bono', { bono, frase: BOOM.frases[bono === 'cielo' ? 'cielo' : 'alto'][Math.floor(P.az() * 2)] || '', x: m.x, y: m.y }); }
    if (m.vida <= 0) { m.vida = 0; muere(m, 'golpe'); }
  }
  function muere(m, como) { if (!m.vivo) return; m.vivo = false; aviso('muerte', { m, como }); }

  // los móviles sin suelo caen; devuelve true cuando ya está todo quieto
  function caidas() {
    let quieto = true;
    for (const m of P.moviles) {
      const r = MOVIL.cae(m, DT);
      if (r === 'sigue') quieto = false;
      else if (r === 'vacio') muere(m, 'vacio');
      else if (r === 'aterriza') {
        const n = Math.round(Math.max(0, m.caida - BOOM.caida.libre) * BOOM.caida.dano);
        aviso('aterriza', { m, caida: m.caida });
        if (n > 0) { herido(m, n, null); aviso('caida', { m, n, frase: BOOM.frases.caida[Math.floor(P.az() * 2)] }); }
      }
    }
    return quieto;
  }
  function cierraTurno() {
    const m = P.actual;
    if (m.vivo) m.retraso += C.retraso + (P.tiroUsado ? m.def.tiros[m.tiro].retraso : BOOM.turno.penalizacion) + P.usado * C.segundoDeRetraso;
    empiezaTurno(false);
  }
  // el orden de los próximos turnos para la barra: los vivos por retraso (el que va ahora, primero)
  function orden() { return vivos().sort((a, b) => a.retraso - b.retraso || a.id - b.id); }

  return { nueva, parar: () => { P = null; }, listo, mueve, apunta, fija, eligeTiro, dispara, pasa, paso, orden, get: () => P, sucesos: () => { const s = P.sucesos; P.sucesos = []; return s; } };
})();
