// Fans of Dark · la partida: el héroe, los monstruos, el botín, la niebla que se cierra y los portales de salida.
// Aquí no se dibuja nada: escena.js pinta lo que hay en G y interfaz.js enseña el HUD. Las posiciones van en casillas.
'use strict';
let G = null;   // la partida en curso (null en el menú)

function dkBajar(fac, heroe, semilla) {
  const H = DK_HEROES[heroe], m = dkNivel(semilla, DK_FORMAS[fac]), rng = m.rng;
  const arma = DKS.lleva.arma, armadura = DKS.lleva.armadura;
  const hpMax = H.hp + (armadura ? armadura.hp : 0);
  G = { m, fac, heroe, semilla, t: 0, fin: null, fx: [], avisos: [], visto: new Uint8Array(m.w * m.h),
    p: { x: m.inicio.cx + 0.5, y: m.inicio.cy + 0.5, ang: 0, r: 0.3, hp: hpMax, hpMax, dmg: H.dmg + (arma ? arma.dmg : 0), arm: armadura ? armadura.arm : 0,
      vel: H.vel, cd: H.cd, alc: H.alc, arco: H.arco || 0, dist: !!H.dist, t: 0, hab: 0, habMax: H.hab.cd, efecto: null, efectoT: 0, bolsa: [], pociones: DKS.pociones, pocionT: 0, golpeT: 0, oro: 0,
      aguante: DK_COMBATE.aguante, esquivaT: 0, esquivaDir: 0, bloquea: false, bloqueoT: 9, parryT: 9, critico: false, sinAire: 0, municion: DK_COMBATE.municion, municionT: 0 },
    mons: [], botines: [], cofres: [], proy: [], portales: m.portales.map(s => ({ x: s.cx + 0.5, y: s.cy + 0.5, abierto: false })), portalesT: 40,
    niebla: { cx: 0, cy: 0, r: 60, t: 0 }, extrayendo: 0 };
  // la niebla se cierra sobre una sala al azar que no sea la de salida
  const centro = m.salas.filter(s => s !== m.inicio)[Math.floor(rng() * (m.salas.length - 1))];
  G.niebla.cx = centro.cx + 0.5; G.niebla.cy = centro.cy + 0.5;
  // monstruos y cofres por sala, según lo lejos que esté de la entrada
  const unidades = dkUnidadesDe(fac).sort((a, b) => CFG.units[a].hp - CFG.units[b].hp);
  const grupo = prof => prof >= 2 ? unidades.slice(2) : prof === 1 ? unidades.slice(1, 5) : unidades.slice(0, 3);
  for (const s of m.salas) {
    if (s === m.inicio) continue;
    const n = s === m.jefe ? 2 : 1 + s.prof + (rng() < 0.5 ? 1 : 0), pool = grupo(s.prof);
    for (let i = 0; i < n; i++) dkPonerMonstruo(pool[Math.floor(rng() * pool.length)], s, rng, false);
    if (s === m.jefe) dkPonerMonstruo(DK_MAZMORRAS[fac].jefe, s, rng, true);
    const cofres = s === m.jefe ? 3 : rng() < 0.7 ? 1 : 2;
    for (let i = 0; i < cofres; i++) G.cofres.push({ x: s.x + 1 + Math.floor(rng() * (s.w - 2)) + 0.5, y: s.y + 1 + Math.floor(rng() * (s.h - 2)) + 0.5, prof: Math.max(0, s.prof), extra: s === m.jefe ? 1 : 0, abierto: false });
  }
  G.p.ang = Math.atan2(m.jefe.cy - m.inicio.cy, m.jefe.cx - m.inicio.cx);
  DKS.bajadas++; dkGuardar();
  dkAviso(DK_MAZMORRAS[fac].nombre + ' · encuentra un portal y sal con vida');
  return G;
}
function dkPonerMonstruo(k, s, rng, jefe) {
  if (!ART[k]) return;
  const d = dkMonstruo(k, jefe);
  G.mons.push(Object.assign(d, { x: s.x + 1 + rng() * (s.w - 2), y: s.y + 1 + rng() * (s.h - 2), hpMax: d.hp, t: rng() * 2, estado: 'quieto', ang: rng() * 6.28, casa: s, golpeT: 0, viva: true, paseo: 0, avisoT: 0, aturdido: 0, ataqueT: 0 }));
}
function dkAviso(txt, dur = 3) { G.avisos.push({ txt, t: dur }); }

/* ---------- cada fotograma ---------- */
function dkPaso(dt, entrada) {
  if (!G || G.fin) return;
  const P = G.p, m = G.m;
  if (entrada.pausa) G.pausa = !G.pausa;
  if (G.pausa) return;
  G.t += dt;
  dkPasoHeroe(dt, entrada);   // heroe.js: moverse, esquivar, bloquear, pegar, lanzar, habilidad, poción y cofres
  // lo que se ha visto (para el minimapa)
  const cx = Math.floor(P.x), cy = Math.floor(P.y);
  for (let y = cy - 5; y <= cy + 5; y++) for (let x = cx - 5; x <= cx + 5; x++) if (dkSuelo(m, x, y) && (x - cx) ** 2 + (y - cy) ** 2 <= 30 && dkVista(m, P.x, P.y, x + 0.5, y + 0.5)) G.visto[y * m.w + x] = 1;
  // botín del suelo: se recoge al pasar por encima
  for (const b of G.botines) if (!b.cogido && Math.hypot(b.x - P.x, b.y - P.y) < 0.6) {
    if (P.bolsa.length >= DK_BOLSA) { if (!b.avisado) { dkAviso('Mochila llena'); b.avisado = true; } continue; }
    b.cogido = true; P.bolsa.push(b.o); P.oro += b.o.valor; G.fx.push({ tipo: 'coge', x: b.x, y: b.y, color: DK_COLOR_RAREZA[b.o.rareza] }); play('blip');
  }
  G.botines = G.botines.filter(b => !b.cogido);
  // monstruos
  for (const e of G.mons) if (e.viva) dkPasoMonstruo(e, dt);
  // proyectiles
  for (const q of G.proy) {
    q.x += q.vx * dt; q.y += q.vy * dt; q.t -= dt;
    if (q.t <= 0 || !dkSuelo(m, Math.floor(q.x), Math.floor(q.y))) { q.muerto = true; if (q.area) dkExplota(q); continue; }
    if (q.mio) { for (const e of G.mons) if (e.viva && Math.hypot(e.x - q.x, e.y - q.y) < e.r + 0.25) { q.muerto = true; if (q.area) dkExplota(q); else dkDanoA(e, q.dmg, q.empuja ? P : null); break; } }
    else if (Math.hypot(P.x - q.x, P.y - q.y) < P.r + 0.2) { q.muerto = true; dkDanoAlHeroe(q.dmg, false, q.de || null); }
  }
  G.proy = G.proy.filter(q => !q.muerto);
  // los portales se abren pasado un rato; la niebla espera y después se cierra
  if (!G.portales[0].abierto && G.t >= G.portalesT) { G.portales.forEach(p => { p.abierto = true; }); dkAviso('Los portales se han abierto', 4); play('summon'); }
  const N = G.niebla;
  if (G.t > DK_NIEBLA.espera) {
    const f = Math.min(1, (G.t - DK_NIEBLA.espera) / DK_NIEBLA.cierre);
    N.r = 60 + (DK_NIEBLA.rMin - 60) * f;
    if (Math.hypot(P.x - N.cx, P.y - N.cy) > N.r) { N.t += dt; if (N.t > 0.5) { N.t = 0; dkDanoAlHeroe(DK_NIEBLA.dano * 0.5, true); } }
  }
  // extraer: de pie dentro de un portal abierto
  const portal = G.portales.find(p => p.abierto && Math.hypot(p.x - P.x, p.y - P.y) < 0.9);
  if (portal) { G.extrayendo += dt; if (G.extrayendo >= DK_EXTRAER) dkTerminar('salvo'); }
  else G.extrayendo = 0;
  for (const a of G.avisos) a.t -= dt;
  G.avisos = G.avisos.filter(a => a.t > 0);
}

/* ---------- el final ---------- */
function dkTerminar(como) {
  if (G.fin) return;
  G.fin = como; const P = G.p;
  const resumen = { como, oro: P.oro, objetos: P.bolsa.length, t: G.t, bajas: G.mons.filter(e => !e.viva).length, jefe: G.mons.some(e => e.jefe && !e.viva) };
  if (como === 'salvo') { DKS.alijo.push(...P.bolsa); DKS.salvos++; DKS.mejor = Math.max(DKS.mejor, P.oro); play('revive'); musicSet(TRACKS.win ? 'win' : 'menu'); }
  else { DKS.muertes++; DKS.lleva = { arma: null, armadura: null }; play('lose'); musicSet(TRACKS.lose ? 'lose' : 'menu'); }   // se pierde la mochila y lo que llevabas puesto
  DKS.pociones = P.pociones; dkGuardar();
  G.resumen = resumen;
  if (typeof dkFinPartida === 'function') dkFinPartida(resumen);
}
