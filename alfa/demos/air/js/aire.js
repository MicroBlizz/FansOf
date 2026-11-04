// Fans of Air · El aire (dominio): el combate aéreo en 3D de verdad (el vuelo está en vuelo.js). Pocos enemigos a la vez salen a
// lo lejos, por delante o a los lados: te persiguen, te disparan adonde vas a estar (hay que maniobrar para esquivar), te pasan y
// vuelven. Ametralladora por delante del morro, retícula que fija al que tienes centrado y misiles que lo persiguen. Al caer,
// algunos sueltan un premio en paracaídas (misiles, bombas, reparación o combustible) que viene hacia ti si pasas cerca. Con los
// derribos de la misión llega SurvivalBot; al caer él, cielo despejado y piloto automático hacia la base.
'use strict';
var AIR = globalThis.AIR || (globalThis.AIR = {});
(function (A) {
  const V3 = A.v3, VU = A.vuelo, AIRE = A.aire = {};

  AIRE.nueva = (AJ, caza) => ({ jugador: VU.nuevo(AJ, caza), enemigos: [], balas: [], misiles: [], tiros: [], premios: [],
    fijando: { id: null, t: 0, fijado: false }, spawnT: 1.5, fuegoT: 0, jefe: null, estado: 'patrulla', despejadoT: 0, especialAntes: false, lado: 1 });

  AIRE.paso = function (e, dt, o, rnd) {
    const a = e.aire;
    for (const aviso of VU.paso(a.jugador, dt, o, e.aj, e.caza)) avisar(e, aviso);
    if (e.fin) return;
    armas(e, a, dt, o);
    aparecer(e, a, dt, rnd);
    for (const en of [...a.enemigos]) enemigo(e, a, en, dt, rnd);
    if (a.jefe) enemigo(e, a, a.jefe, dt, rnd);
    balas(e, a, dt, rnd);
    misiles(e, a, dt, rnd);
    tiros(e, a, dt);
    premios(e, a, dt);
    fijar(e, a, dt);
    if (a.estado === 'despejado') { a.despejadoT -= dt; if (a.despejadoT <= 0) A.despejado(e); }
  };

  AIRE.autopiloto = (e, dt) => VU.autopiloto(e.aire.jugador, dt, e.aj, e.caza);

  function avisar(e, aviso) {
    e.eventos.push({ tipo: aviso });
    if (aviso === 'estrellado') A.terminar(e, 'fallida', 'estrellado');
  }

  const quitar = (lista, x) => { const i = lista.indexOf(x); if (i >= 0) lista.splice(i, 1); };
  const todos = (a) => (a.jefe ? a.enemigos.concat([a.jefe]) : a.enemigos);
  const datos = (e, en) => (en.tipo === 'jefe' ? e.aj.aire.jefe : e.aj.aire.enemigos[en.tipo]);

  // ---------- tus armas ----------
  function salida(j, lado, adelante) {   // de dónde sale un disparo: bajo el ala, un poco por delante
    return V3.suma(V3.suma(j.pos, V3.escala(j.f, adelante)), V3.suma(V3.escala(j.r, lado * 3), V3.escala(j.u, -1.5)));
  }

  function armas(e, a, dt, o) {
    const j = a.jugador, B = e.aj.aire.bala;
    a.fuegoT -= dt;
    if (o.fuego && a.fuegoT <= 0) {
      a.lado = -a.lado;
      a.balas.push({ pos: salida(j, a.lado, 6), v: V3.escala(j.f, B.vel + j.vel), vida: B.vida });
      a.fuegoT = B.cada / (1 + e.caza.rabia * e.combo); e.disparos++;
      e.eventos.push({ tipo: 'disparo' });
    }
    const pulsa = o.especial && !a.especialAntes;
    a.especialAntes = !!o.especial;
    if (pulsa) lanzarMisil(e, a);
  }

  function lanzarMisil(e, a) {
    if (e.misiles <= 0) { e.eventos.push({ tipo: 'sinMisiles' }); return; }
    const j = a.jugador, f = a.fijando, objetivo = f.fijado ? f.id : null;
    e.misiles--;
    a.misiles.push({ pos: salida(j, e.misiles % 2 ? 4 : -4, 5), dir: V3.copia(j.f), vel: e.aj.aire.misil.vel + j.vel, vida: e.aj.aire.misil.vida, objetivo });
    e.eventos.push({ tipo: 'misil', fijado: objetivo !== null });
  }

  // El primero que toque el tramo recorrido en este paso (con margen r).
  function tocado(a, desde, hasta, r) { return todos(a).find((en) => V3.distTramo(en.pos, desde, hasta) < en.radio + r) || null; }

  function balas(e, a, dt, rnd) {
    const B = e.aj.aire.bala;
    for (const b of [...a.balas]) {
      const antes = b.pos;
      b.pos = V3.suma(b.pos, V3.escala(b.v, dt)); b.vida -= dt;
      const en = tocado(a, antes, b.pos, B.radio);
      if (en) { quitar(a.balas, b); e.aciertos++; herir(e, a, en, B.dano, b.pos, rnd); }
      else if (b.vida <= 0) quitar(a.balas, b);
    }
  }

  const objetivoDe = (a, id) => (id === null ? null : todos(a).find((en) => en.id === id) || null);

  function misiles(e, a, dt, rnd) {
    const M = e.aj.aire.misil;
    for (const m of [...a.misiles]) {
      const obj = objetivoDe(a, m.objetivo), antes = m.pos;
      if (obj) m.dir = V3.girarHacia(m.dir, V3.unidad(V3.resta(obj.pos, m.pos)), M.giro * dt);
      m.pos = V3.suma(m.pos, V3.escala(m.dir, m.vel * dt)); m.vida -= dt;
      const en = tocado(a, antes, m.pos, M.radio);
      if (en) { quitar(a.misiles, m); e.eventos.push({ tipo: 'explosion', pos: V3.copia(en.pos), grande: true }); herir(e, a, en, M.dano, en.pos, rnd); }
      else if (m.vida <= 0) quitar(a.misiles, m);
    }
  }

  function herir(e, a, en, dano, donde, rnd) {
    en.vida -= dano;
    e.eventos.push({ tipo: 'impacto', pos: V3.copia(donde), jefe: en.tipo === 'jefe', id: en.id });
    if (en.tipo === 'jefe') { A.sumar(e, e.aj.aire.jefe.puntosGolpe); if (en.vida <= 0) jefeDerribado(e, a); return; }
    if (en.vida > 0) return;
    A.derribo(e, e.aj.aire.enemigos[en.tipo].puntos);
    e.eventos.push({ tipo: 'derribo', pos: V3.copia(en.pos), enemigo: en.tipo, combo: e.combo });
    quitar(a.enemigos, en);
    soltarPremio(e, a, en, rnd);
  }

  // La retícula: el enemigo más centrado delante del morro; si lo mantienes centrado `fijar` segundos, el misil lo persigue.
  function fijar(e, a, dt) {
    const j = a.jugador, M = e.aj.aire.misil, f = a.fijando;
    let mejor = null, mejorAng = M.cono;
    for (const en of todos(a)) {
      const c = VU.camara(j, en.pos);
      if (c.z <= 50 || c.z > M.alcance) continue;
      const ang = Math.atan2(Math.hypot(c.x, c.y), c.z);
      if (ang < mejorAng) { mejorAng = ang; mejor = en; }
    }
    if (!mejor) { if (f.id !== null) e.eventos.push({ tipo: 'fijadoPerdido' }); Object.assign(f, { id: null, t: 0, fijado: false }); return; }
    if (mejor.id !== f.id) Object.assign(f, { id: mejor.id, t: 0, fijado: false });
    f.t += dt;
    if (!f.fijado && f.t >= e.caza.fijar) { f.fijado = true; e.eventos.push({ tipo: 'fijado' }); }
  }

  // ---------- los enemigos ----------
  function aparecer(e, a, dt, rnd) {
    const O = e.aj.aire.oleada;
    if (a.estado !== 'patrulla') return;
    if (e.derribos >= e.aj.aire.derribos) { llegaJefe(e, a); return; }
    a.spawnT -= dt;
    if (a.spawnT > 0 || a.enemigos.length >= O.maximo) return;
    a.spawnT = O.cada;
    const tipo = rnd() < 0.7 ? 'becario' : 'caja', d = e.aj.aire.enemigos[tipo];
    a.enemigos.push({ id: e.ids++, tipo, pos: lejos(e, a.jugador, rnd), dir: null, vida: d.vida, radio: d.radio, disparaT: 1 + rnd() * d.dispara, huirT: 0 });
  }

  // Un sitio a lo lejos, por delante o a los lados del caza (nunca justo detrás), a una altura parecida.
  function lejos(e, j, rnd) {
    const O = e.aj.aire.oleada, P = e.aj.aire.vuelo, ang = VU.rumbo(j) + (rnd() - 0.5) * 2.6, d = O.cerca + rnd() * (O.lejos - O.cerca);
    const y = Math.max(300, Math.min(P.altMax - 300, j.pos.y + (rnd() - 0.5) * 500));
    return { x: j.pos.x + Math.sin(ang) * d, y, z: j.pos.z + Math.cos(ang) * d };
  }

  // Te persigue; si te pasa muy cerca se aleja un rato y vuelve. Dispara cuando te tiene delante.
  function enemigo(e, a, en, dt, rnd) {
    const d = datos(e, en), j = a.jugador, hacia = V3.unidad(V3.resta(j.pos, en.pos)), dist = V3.dist(j.pos, en.pos);
    if (!en.dir) en.dir = hacia;
    en.huirT -= dt; en.disparaT -= dt;
    if (dist < 220 && en.huirT <= 0) en.huirT = 2.5;
    const quiere = en.huirT > 0 ? V3.unidad(V3.suma(V3.escala(hacia, -1), { x: 0, y: 0.3, z: 0 })) : hacia;
    en.dir = V3.girarHacia(en.dir, quiere, d.giro * dt);
    en.pos = V3.suma(en.pos, V3.escala(en.dir, d.vel * dt));
    en.pos.y = Math.max(150, en.pos.y);
    if (en.huirT <= 0 && en.disparaT <= 0 && dist > 250 && dist < d.alcanceTiro && V3.punto(en.dir, hacia) > Math.cos(d.cono)) disparaRafaga(e, a, en, d, rnd);
    if (dist < e.aj.aire.choque.radio + en.radio * 0.5) chocar(e, a, en);
    else if (dist > 4500 && en.tipo !== 'jefe') { en.pos = lejos(e, j, rnd); en.dir = null; }
  }

  function chocar(e, a, en) {
    A.danar(e, e.aj.aire.choque.dano, 'choque');
    e.eventos.push({ tipo: 'explosion', pos: V3.copia(en.pos), grande: false });
    if (en.tipo === 'jefe') { en.huirT = 3; return; }
    quitar(a.enemigos, en);
  }

  function disparaRafaga(e, a, en, d, rnd) {
    const n = d.rafaga || 1;
    for (let k = 0; k < n; k++) dispara(e, a, en, d.tiro, (k - (n - 1) / 2) * 0.05);
    en.disparaT = d.dispara / e.caza.sigilo * (0.7 + rnd() * 0.6);
  }

  // Un disparo enemigo apunta adonde vas a estar si sigues recto: volando recto te da; virando o cabeceando, no.
  function dispara(e, a, en, clase, desvio) {
    const j = a.jugador, T = e.aj.aire.tiro, t = V3.dist(en.pos, j.pos) / T.vel;
    const dir = V3.unidad(V3.suma(V3.unidad(V3.resta(V3.suma(j.pos, V3.escala(VU.velocidad(j), t)), en.pos)), V3.escala(j.r, desvio)));
    a.tiros.push({ pos: V3.copia(en.pos), v: V3.escala(dir, T.vel), vida: T.vida, clase });
    e.eventos.push({ tipo: 'tiroEnemigo', clase });
  }

  function tiros(e, a, dt) {
    const j = a.jugador, T = e.aj.aire.tiro;
    for (const s of [...a.tiros]) {
      const antes = s.pos;
      s.pos = V3.suma(s.pos, V3.escala(s.v, dt)); s.vida -= dt;
      if (V3.distTramo(j.pos, antes, s.pos) < T.radio) { quitar(a.tiros, s); A.danar(e, T.dano, s.clase); e.eventos.push({ tipo: 'golpe', pos: V3.copia(j.pos) }); }
      else if (s.vida <= 0) quitar(a.tiros, s);
    }
  }

  // ---------- premios ----------
  function soltarPremio(e, a, en, rnd) {
    const P = e.aj.aire.premios, d = e.aj.aire.enemigos[en.tipo];
    if (rnd() >= d.premio) return;
    const total = P.tipos.reduce((s, t) => s + t[1], 0);
    let r = rnd() * total, tipo = P.tipos[0][0];
    for (const [t, peso] of P.tipos) { if (r < peso) { tipo = t; break; } r -= peso; }
    a.premios.push({ id: e.ids++, tipo, pos: V3.copia(en.pos), vida: P.vida });
    e.eventos.push({ tipo: 'premioSuelto', premio: tipo });
  }

  function premios(e, a, dt) {
    const P = e.aj.aire.premios, j = a.jugador;
    for (const p of [...a.premios]) {
      p.vida -= dt; p.pos.y -= P.cae * dt;
      const dist = V3.dist(p.pos, j.pos);
      if (dist < P.iman) p.pos = V3.suma(p.pos, V3.escala(V3.unidad(V3.resta(j.pos, p.pos)), Math.min(dist, (j.vel + 160) * dt)));
      if (V3.dist(p.pos, j.pos) < P.coger) { quitar(a.premios, p); coger(e, p.tipo); }
      else if (p.vida <= 0 || p.pos.y <= 0) quitar(a.premios, p);
    }
  }

  const COGER = {
    misiles: (e, P) => { e.misiles = Math.min(e.caza.misiles, e.misiles + P.misiles); },
    bombas: (e, P) => { e.bombas = Math.min(e.caza.bombas + P.bombasExtra, e.bombas + P.bombas); },
    reparacion: (e, P) => { e.escudo = Math.min(e.caza.escudo, e.escudo + P.reparacion); },
    combustible: (e, P) => { e.combustible = Math.min(e.aj.combustible.max, e.combustible + P.combustible); },
  };
  function coger(e, tipo) { COGER[tipo](e, e.aj.aire.premios); e.eventos.push({ tipo: 'premio', premio: tipo }); }
  AIRE.coger = coger;

  // ---------- el jefe ----------
  function llegaJefe(e, a) {
    const J = e.aj.aire.jefe, j = a.jugador;
    a.estado = 'jefe';
    a.jefe = { id: e.ids++, tipo: 'jefe', pos: V3.suma(j.pos, V3.escala(V3.unidad({ x: j.f.x, y: 0, z: j.f.z }), 1800)), dir: null, vida: J.vida, radio: J.radio, disparaT: 2, huirT: 0 };
    a.jefe.pos.y = Math.max(400, j.pos.y);
    e.eventos.push({ tipo: 'jefe' });
  }

  function jefeDerribado(e, a) {
    A.sumar(e, e.aj.aire.jefe.puntos); e.derribos++;
    e.eventos.push({ tipo: 'jefeDerribado', pos: V3.copia(a.jefe.pos) });
    a.jefe = null; a.estado = 'despejado'; a.despejadoT = 1.2; a.tiros = []; a.enemigos = [];
  }
})(AIR);
