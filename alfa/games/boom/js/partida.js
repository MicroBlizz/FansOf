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
      sucesos: [], satelite: { carga: 0 }, minas: [], pausa: false, evento: null, enEvento: 0, ganador: null, turnos: 0, tiroUsado: false, hotSeat: personas >= 2, bono: false };
    P.viento = Math.round((P.az() * 2 - 1) * BOOM.viento.max); P.proximoEvento = pideEvento();
    empiezaTurno(true);
    return P;
  }

  const pideEvento = () => BOOM.eventos.cada[0] + Math.floor(P.az() * (BOOM.eventos.cada[1] - BOOM.eventos.cada[0] + 1));
  function eventos() {   // al empezar cada turno: se acaba el que había o se mira si toca uno nuevo
    if (P.evento) { if (--P.evento.turnos <= 0) { aviso('eventoFin', { ev: P.evento }); P.evento = null; P.proximoEvento = pideEvento(); } return; }
    if (--P.proximoEvento > 0) return;
    const l = BOOM.eventos.lista; P.evento = { def: l[Math.floor(P.az() * l.length)], dir: P.az() < 0.5 ? -1 : 1, turnos: BOOM.eventos.duracion };
    aviso('evento', { ev: P.evento });
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
    if (!primero) { cambiaViento(); eventos(); }
    m.xSeguro = m.x;
    m.extra = 0; P.actual = m; m.energia = C.energia; P.t = BOOM.turno.segundos; P.usado = 0; P.tiroUsado = false; P.turnos++;
    if (m.tiro === 2 && m.caos < BOOM.caos.max) m.tiro = 0;
    aviso('turno', { m });
    if (andanMinas(m)) return;
    abre(m);
  }
  function abre(m) { P.plan = m.ia ? IA.plan(P, m) : null; P.fase = P.hotSeat && !m.ia ? 'cartel' : 'apunta'; }
  // las minas de quien empieza turno andan hacia el rival más cercano y explotan, antes de que apunte
  function andanMinas(m) {
    const mias = P.minas.filter(n => n.dueno === m.id); if (!mias.length) return false;
    P.minas = P.minas.filter(n => n.dueno !== m.id);
    P.proys = mias.map(n => rueda(n.x, n.y, m, n.def, n.def.efecto.anda, 210, 'extra'));
    P.fase = 'minas'; aviso('minas', { m });
    return true;
  }
  const masCerca = (x, dueno) => vivos().filter(v => v.equipo !== dueno.equipo).reduce((a, e) => (!a || Math.abs(e.x - x) < Math.abs(a.x - x) ? e : a), null);
  function rueda(x, y, dueno, def, alcance, vel, forma) {   // algo que rueda por el suelo (el tren, las minas que andan) hacia el rival más cercano
    const e = masCerca(x, dueno), dir = e ? (e.x >= x ? 1 : -1) : dueno.dir;
    return { tipo: 'rueda', x, y: TERRENO.suelo(x, y - 30), dir, queda: alcance, vel, def: { forma, radio: def.radio, crater: def.crater, dano: def.dano }, dueno: dueno.id, alto: false, ang: 0, t: 0, traza: [], demora: 0 };
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
    if (P && P.fase === 'vuelo' && P.actual && !P.actual.ia) return parte();
    const m = P && P.actual;
    if (!m || P.fase !== 'apunta' || m.cayendo) return false;
    m.ang = Math.round(m.ang); m.pot = Math.round(m.pot);   // el tiro siempre sale con grados y potencia enteros
    if (m.tiro === 2 && m.caos < BOOM.caos.max) m.tiro = 0;
    const t = m.def.tiros[m.tiro];
    P.proys = FISICA.lanza(m, P.viento, P.evento); m.doble = false;
    if (t.carga) { P.satelite.carga = Math.min(BOOM.satelite.max, P.satelite.carga + t.carga); aviso('satelite', { carga: P.satelite.carga }); }
    if (t.efecto && t.efecto.porCarga) { const c = P.satelite.carga; P.proys.forEach(p => { p.carga = c; }); P.satelite.carga = 0; aviso('satelite', { carga: 0, gasta: c }); } P.tiroUsado = true; P.fase = 'vuelo'; P.bono = false;
    m.caos = m.tiro === 2 ? 0 : Math.min(BOOM.caos.max, m.caos + BOOM.caos.porTiro);
    aviso('disparo', { m });
    return true;
  }
  // ---- objetos: se usan antes de tirar y cuestan retraso en este turno ----
  function usaObjeto(id) {
    const m = P && P.actual, def = BOOM.objetos.lista[id];
    if (!P || P.fase !== 'apunta' || P.pausa || !m || !def || !m.objetos.includes(id) || m.cayendo) return false;
    if (id === 'doble') m.doble = true;
    else if (id === 'botiquin') { m.vida = Math.min(m.vidaMax, m.vida + def.cura); }
    else if (id === 'bungee') m.bungee = true;
    else if (id === 'teletransporte') {
      for (let i = 0; i < 12; i++) {
        const x = clamp(m.x + (P.az() * 2 - 1) * def.alcance, 40, BOOM.mundo.ancho - 40), y = TERRENO.suelo(x, 0);
        if (y < BOOM.mundo.alto - 40 && !P.moviles.some(o => o.vivo && o !== m && Math.abs(o.x - x) < 50)) { m.x = x; m.y = y; m.xSeguro = x; break; }
      }
    }
    m.objetos.splice(m.objetos.indexOf(id), 1); m.extra = (m.extra || 0) + def.retraso; aviso('objeto', { m, id });
    return true;
  }
  function pasa() { if (puede()) pierdeTurno(); }
  // ¿se puede partir ahora el tiro en el aire (el Rage quit)? Solo quien lo ha tirado, si es persona
  const puedePartir = () => !!(P && P.fase === 'vuelo' && !P.pausa && P.actual && !P.actual.ia && P.proys.some(q => !q.hecho && q.demora <= 0 && q.def.efecto && q.def.efecto.tipo === 'parte'));

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
    } else if (P.fase === 'vuelo' || P.fase === 'minas') {
      vuela();
      if (P.proys.every(p => p.hecho)) { P.proys = []; P.fase = P.fase === 'minas' ? 'trasMinas' : 'despues'; P.espera = 0.8; }
    } else if (P.fase === 'trasMinas') {   // ya han explotado las minas: si sigue la partida, quien empezaba turno apunta
      const quietos = caidas(); P.espera -= DT;
      if (quietos && P.espera <= 0) { if (new Set(vivos().map(x => x.equipo)).size < 2) termina(); else if (!m.vivo) empiezaTurno(false); else abre(m); }
    } else if (P.fase === 'despues') {
      const quietos = caidas();
      P.espera -= DT;
      if (quietos && P.espera <= 0) cierraTurno();
    } else caidas();
  }
  function pierdeTurno() { P.tiroUsado = false; P.usado = BOOM.turno.segundos; aviso('tiempo', { m: P.actual }); cierraTurno(); }

  // ---- lo que está en el aire: proyectiles, golpes desde el cielo y lo que rueda ----
  function vuela() {
    for (const p of P.proys.slice()) {
      if (p.hecho) continue;
      if (p.demora > 0) { p.demora -= DT; continue; }
      if (p.tipo === 'golpe') { p.hecho = true; golpea(p); continue; }
      if (p.tipo === 'rueda') { if (rueda1(p)) p.hecho = true; continue; }
      if (FISICA.paso(p, P.moviles)) impacto(p);
      else {
        const ef = p.def.efecto;
        if (p.cima && ef && ef.tipo === 'racimo' && !p.partido) racimo(p, ef);
        if (p.glitch && !p.glitch.visto) { p.glitch.visto = true; aviso('glitch', { x0: p.glitch.x, y0: p.glitch.y, x: p.x, y: p.y }); }
        if (ef && ef.tipo === 'parte' && P.moviles[p.dueno].ia && P.plan && P.plan.blanco != null && p.vy > 0 && Math.abs(p.x - P.plan.blanco) < 70) parte();
        if (Math.round(p.t / DT) % 3 === 0) p.traza.push([p.x, p.y]);
      }
    }
  }
  function racimo(p, ef) {   // en lo más alto se abre en n trozos que se separan
    const vx = p.vx; p.partido = true;
    for (let i = 1; i < ef.n; i++) P.proys.push(Object.assign({}, p, { vx: vx + (i / (ef.n - 1) - 0.5) * ef.abre, traza: [] }));
    p.vx = vx - 0.5 * ef.abre;
    aviso('racimo', { x: p.x, y: p.y, m: P.moviles[p.dueno] });
  }
  function parte() {   // el Tiro Especial que se parte en el aire al volver a pulsar
    const p = P.proys.find(q => !q.hecho && q.demora <= 0 && q.def.efecto && q.def.efecto.tipo === 'parte');
    if (!p) return false;
    const ef = p.def.efecto; p.hecho = true;
    for (let i = 0; i < ef.n; i++) {
      const q = FISICA.nuevo(p.x, p.y, p.vx * 0.25 + (i - (ef.n - 1) / 2) * 75, Math.max(0, p.vy) * 0.3 + 160, p.viento, p.ev, p.dueno, p.ang, ef.trozo);
      q.alto = p.alto; q.t = 0.5; P.proys.push(q);
    }
    aviso('parte', { x: p.x, y: p.y, m: P.moviles[p.dueno] });
    return true;
  }
  function impacto(p) {   // el proyectil ha tocado algo: según su efecto explota, rebota, sigue, suelta un tren o se queda como mina
    const ef = p.def.efecto || {}, fin = p.fin || { tipo: 'vacio' }, dueno = P.moviles[p.dueno];
    dueno.marca = { x: clamp(p.x, 0, BOOM.mundo.ancho), y: clamp(p.y, 0, BOOM.mundo.alto) };
    if (fin.tipo !== 'terreno' && fin.tipo !== 'movil') { p.hecho = true; aviso('fuera', { x: p.x, y: p.y }); return; }
    const sigue = (vx, vy, t) => { p.vx = vx; p.vy = vy; p.y -= 3; p.atraviesa = t; p.fin = null; p.veces++; };
    if (ef.tipo === 'rebota' && fin.tipo === 'terreno' && p.veces < ef.veces) { estalla(p.x, p.y, p.def, p); return sigue(p.vx * 0.75, -Math.abs(p.vy) * 0.55, 0.05); }
    if (ef.tipo === 'combo' && p.veces < ef.veces - 1) { estalla(p.x, p.y, p.def, p); return sigue(p.vx * 0.8, p.vy * 0.8, 0.08); }
    if (ef.tipo === 'vuelve' && !p.veces) { estalla(p.x, p.y, p.def, p); return sigue(-p.vx * 0.55, -Math.abs(p.vy) * 0.45 - 260, 0.08); }
    p.hecho = true;
    if (ef.tipo === 'tren' && fin.tipo === 'terreno') { P.proys.push(rueda(p.x, p.y, dueno, p.def, ef.alcance, ef.velocidad, 'tren')); aviso('tren', { x: p.x, y: p.y }); return; }
    if (ef.tipo === 'minas' && fin.tipo === 'terreno') { P.minas.push({ x: p.x, y: TERRENO.suelo(p.x, p.y - 30), dueno: p.dueno, def: p.def }); aviso('mina', { x: p.x, y: p.y }); return; }
    estalla(p.x, p.y, p.def, p);
    if (ef.tipo === 'cielo') ef.x.forEach((dx, i) => P.proys.push({ tipo: 'golpe', x: clamp(p.x + dx, 4, BOOM.mundo.ancho - 4), demora: 0.4 + i * 0.3, demora0: 0.4 + i * 0.3, estilo: ef.estilo,
      def: { forma: ef.estilo, radio: ef.radio, crater: ef.crater, dano: ef.dano + (ef.porCarga || 0) * (p.carga || 0) }, dueno: p.dueno, alto: p.alto, ang: p.ang, t: 0, traza: [], hecho: false }));
  }
  function golpea(p) {   // un golpe desde el cielo cae recto en su columna: en el primer móvil o suelo que encuentre
    let y = TERRENO.suelo(p.x, 0);
    for (const m of vivos()) if (Math.abs(m.x - p.x) < C.radio && m.y - C.centro - C.radio * 0.6 < y) y = m.y - C.centro - C.radio * 0.6;
    if (y >= BOOM.mundo.alto) { aviso('fuera', { x: p.x, y: BOOM.mundo.alto - 30 }); return; }
    p.y = y; estalla(p.x, y, p.def, p);
  }
  function rueda1(p) {   // un paso de lo que rueda; devuelve true al acabar
    let d = p.vel * DT; p.t += DT;
    while (d > 0) {
      const s = Math.min(1, d); d -= s; p.queda -= s; p.x += p.dir * s;
      if (p.x < 2 || p.x > BOOM.mundo.ancho - 2) { aviso('fuera', { x: p.x, y: p.y }); return true; }
      if (TERRENO.solido(p.x, p.y - 30)) { estalla(p.x, p.y - 12, p.def, p); return true; }   // pared: explota ahí
      const y = TERRENO.suelo(p.x, p.y - 29);
      if (y >= BOOM.mundo.alto) { aviso('fuera', { x: p.x, y: BOOM.mundo.alto - 30 }); return true; }
      p.y = y;
      if (vivos().some(m => m.equipo !== P.moviles[p.dueno].equipo && Math.abs(m.x - p.x) < C.radio && Math.abs(m.y - p.y) < 50) || p.queda <= 0) { estalla(p.x, p.y - 12, p.def, p); return true; }
    }
    if (Math.round(p.t / DT) % 4 === 0) p.traza.push([p.x, p.y - 8]);
    return false;
  }
  // una explosión: agujero del tamaño del cráter, daño en su radio, y rompe las minas que pille
  function estalla(x, y, T, p) {
    const dueno = P.moviles[p.dueno];
    TERRENO.cava(x, y, T.crater == null ? T.radio : T.crater);
    aviso('explosion', { x, y, r: T.radio, c: T.crater == null ? T.radio : T.crater, alto: p.alto, movil: dueno.def.id, forma: T.forma });
    P.minas = P.minas.filter(n => { const rota = Math.hypot(n.x - x, n.y - y) < T.radio + 10; if (rota) aviso('minaRota', { x: n.x, y: n.y }); return !rota; });
    for (const mv of vivos()) {
      const d = Math.hypot(x - mv.x, y - (mv.y - C.centro));
      if (d > T.radio + C.radio) continue;
      const f = clamp(1 - Math.max(0, d - C.radio) / T.radio, 0.15, 1), enemigo = mv.equipo !== dueno.equipo;
      let n = T.dano * f * (P.evento && P.evento.def.danoMult || 1), bono = null;
      if (!enemigo) n *= BOOM.fuegoAmigo;
      else if (p.alto) { n *= BOOM.altura.cielo; bono = 'cielo'; }
      else if (p.ang >= BOOM.altura.alto) { n *= BOOM.altura.altoMult; bono = 'alto'; }
      herido(mv, Math.round(n), bono, p);
    }
  }
  function herido(m, n, bono, p) {
    m.vida -= n; m.caos = Math.min(BOOM.caos.max, m.caos + n * BOOM.caos.porDano); aviso('dano', { m, n, bono });
    if (bono && !P.bono) { P.bono = true; aviso('bono', { bono, frase: BOOM.frases[bono === 'cielo' ? 'cielo' : 'alto'][Math.floor(P.az() * 2)] || '', x: m.x, y: m.y }); }
    if (m.vida <= 0) { m.vida = 0; muere(m, 'golpe'); }
  }
  function muere(m, como) {
    if (!m.vivo) return;
    if (como === 'vacio' && m.bungee) {   // el bungee: vuelve a donde estaba al empezar el turno
      m.bungee = false; m.x = m.xSeguro; m.y = TERRENO.suelo(m.x, 0); m.cayendo = false; m.vy = 0; aviso('bungee', { m }); return;
    } m.vivo = false; P.minas = P.minas.filter(n => n.dueno !== m.id); aviso('muerte', { m, como }); }

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
    if (m.vivo) m.retraso += C.retraso + (P.tiroUsado ? m.def.tiros[m.tiro].retraso : BOOM.turno.penalizacion) + (m.extra || 0) + P.usado * C.segundoDeRetraso;
    empiezaTurno(false);
  }
  // el orden de los próximos turnos para la barra: los vivos por retraso (el que va ahora, primero)
  function orden() { return vivos().sort((a, b) => a.retraso - b.retraso || a.id - b.id); }

  return { usaObjeto, puedePartir, nueva, parar: () => { P = null; }, listo, mueve, apunta, fija, eligeTiro, dispara, pasa, paso, orden, get: () => P, sucesos: () => { const s = P.sucesos; P.sucesos = []; return s; } };
})();
