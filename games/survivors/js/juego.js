// Fans of Survivors · La partida: el jugador, los enemigos, las oleadas, los cristales de CAOS, subir de nivel y el jefe final.
// Las armas están en armas.js; el dibujo, en dibujo.js; las pantallas y los controles, en interfaz.js. Las cifras, en datos.js.
'use strict';

// el tamaño de choque de cada dibujo (core lo deja vacío: cada juego pone el suyo). Solo hace falta para dibujar los pies.
for (const k in TYPES) if (TYPES[k] && !CFG.units[k]) CFG.units[k] = { r: 12 };
Object.assign(CFG.units, { bunny: { r: 20 }, squirrel: { r: 12 }, beaver: { r: 12 }, fox: { r: 14 }, meercat: { r: 12 }, junkcoon: { r: 14 }, mechavaca: { r: 22 }, vaca: { r: 12 } });
for (const k in ENEMIGOS) CFG.units[ENEMIGOS[k].spr] = { r: ENEMIGOS[k].r };

let P = null;          // la partida en curso
let sigId = 1;         // número de cada enemigo (para que cada uno se balancee a su ritmo)
const MANDO = { x: 0, y: 0 };   // hacia dónde quiere ir el jugador (lo rellena interfaz.js), de -1 a 1

/* ---------- empezar ---------- */
// lo que llevas puesto (nivel de las cartas, habilidades y objetos del gashapón): js/catalogo.js
function modsJugador() {
  const { L, arma } = modsPartida(), J = L.J;
  return { dmg: L.lvlMul * (1 + (J.dmg || 0)), hp: L.lvlMul * Math.max(0.3, 1 + (J.hp || 0)), speed: Math.max(0.5, 1 + (J.speed || 0)), cd: Math.min(0.5, J.cd || 0),
    area: J.area || 0, pickup: J.pickup || 0, regen: J.regen || 0, armor: Math.min(0.6, J.armor || 0), dodge: J.dodge || 0, crit: J.crit || 0, xp: J.xp || 0,
    revive: J.revive || 0, heal: J.heal || 0, arma };
}
function nuevaPartida() {
  const J = SV.jugador, MJ = modsJugador(), vida = Math.round(J.vida * MJ.hp);
  P = {
    mods: MJ, reviveUsado: false, cofres: 0, elites: 0,
    cajasRotas: new Set(), cajasVida: new Map(), cajasGolpe: new Map(), oroCajas: 0, objetosCajas: 0,
    t: 0, estado: 'jugando', ganado: false, finT: 0,
    jug: { x: 0, y: 0, vida, vidaMax: vida, face: 1, andando: false, walk: 0, invulT: 0, golpeT: 0, congT: 0, salto: null, muerto: false },
    cam: { x: 0, y: 0 },
    armas: { [SV.arma0]: 1 }, pasivas: {}, cd: {},
    xp: 0, nivel: 1, xpSig: SV.xpNivel(1), pendientes: 0,
    enemigos: [], proy: [], balas: [], gemas: [], cosas: [], efectos: [], numeros: [], parts: [], marcas: [],
    vacas: null, auraT: 0, kills: 0, puntos: 0,
    oleadaT: 0, evento: 0, miniJefe: 0, ultimoShiny: 0, cofresPend: 0, jefe: null, jefeVisto: false,
    sacudida: 0, aviso: null, chat: [], chatT: 8, rachaKills: [], hitStop: 0,
  };
  sigId = 1;
  chatDecir('start');
  aviso('¡SOBREVIVE 10 MINUTOS!', 'Microblizz manda a toda su plantilla a por CrazyBunny');
}

/* ---------- cifras del jugador con sus mejoras ---------- */
const nvP = k => P.pasivas[k] || 0;
const multDano = () => EFECTO.dano(nvP('punos')) * P.mods.dmg;
const multRecarga = () => Math.max(0.35, EFECTO.recarga(nvP('reflejos')) * (1 - P.mods.cd));
const radioRecoger = () => SV.jugador.recoger * EFECTO.recoger(nvP('iman')) * (1 + P.mods.pickup);
const velJugador = () => SV.jugador.velocidad * EFECTO.velocidad(nvP('cafeina')) * P.mods.speed;

/* ---------- la rejilla: para buscar enemigos cercanos sin mirarlos todos ---------- */
const CELDA = 48;
let REJ = new Map();
const claveR = (ix, iy) => ix * 100003 + iy;
function rehacerRejilla() {
  REJ = new Map();
  for (const e of P.enemigos) {
    const k = claveR(Math.floor(e.x / CELDA), Math.floor(e.y / CELDA));
    let l = REJ.get(k); if (!l) REJ.set(k, (l = [])); l.push(e);
  }
}
// llama a fn con cada enemigo a menos de r de (x, y)
function cerca(x, y, r, fn) {
  const a = Math.floor((x - r) / CELDA), b = Math.floor((x + r) / CELDA), c = Math.floor((y - r) / CELDA), d = Math.floor((y + r) / CELDA);
  for (let ix = a; ix <= b; ix++) for (let iy = c; iy <= d; iy++) {
    const l = REJ.get(claveR(ix, iy)); if (!l) continue;
    for (const e of l) if (!e.muerto && (e.x - x) ** 2 + (e.y - y) ** 2 <= (r + e.r * e.escala) ** 2) fn(e);
  }
}
function masCercano(x, y, max, saltar) {
  let mejor = null, md = max * max;
  for (const e of P.enemigos) { if (e.muerto || (saltar && saltar.has(e))) continue; const d = (e.x - x) ** 2 + (e.y - y) ** 2; if (d < md) { md = d; mejor = e; } }
  return mejor;
}

/* ---------- los enemigos ---------- */
function crearEnemigo(tipo, x, y, extra = {}) {
  const d = ENEMIGOS[tipo], min = Math.floor(P.t / 60);
  const vida = extra.vida || d.vida * vidaPorMinuto(min) * (extra.shinyMul || 1);
  const e = {
    id: sigId++, tipo, d, spr: extra.spr || d.spr, x, y, vida, vidaMax: vida, vel: (extra.vel || d.vel) * rand(0.92, 1.08), dano: extra.dano || d.dano * (1 + min * 0.05),
    r: extra.r || d.r, escala: extra.escala || 1, face: 1, walk: Math.random() * 6, hitT: 0, kbx: 0, kby: 0, edad: 0, tiroT: rand(1, 3), curaT: rand(0.5, 2),
    elite: !!extra.elite, shiny: !!extra.shiny, jefe: !!extra.jefe, xp: extra.xp !== undefined ? extra.xp : d.xp, vacaT: 0, auraT: 0, muerto: false, congT: 0,
  };
  if (e.shiny) { numero(x, y - 60, '✨ SHINY ✨', '#ffe45c'); play('crown'); }
  P.enemigos.push(e); return e;
}
// un punto justo fuera de la pantalla, alrededor del jugador
function puntoFuera() {
  const j = P.jug, ax = 310, ay = 520, lado = Math.random() * (ax + ay) * 2;
  let x, y;
  if (lado < ax * 2) { x = j.x - ax + lado; y = j.y + (Math.random() < 0.5 ? -ay : ay); }
  else { y = j.y - ay + (lado - ax * 2); x = j.x + (Math.random() < 0.5 ? -ax : ax); }
  return { x, y };
}
function elegirPeso(mezcla) {
  let tot = 0; for (const k in mezcla) tot += mezcla[k];
  let r = Math.random() * tot; for (const k in mezcla) { r -= mezcla[k]; if (r <= 0) return k; }
  return Object.keys(mezcla)[0];
}
function oleadas(dt) {
  if (P.jefe) {   // con el jefe solo salen unos pocos becarios sueltos
    P.oleadaT -= dt; if (P.oleadaT <= 0 && P.enemigos.length < 60) { P.oleadaT = 2.5; const p = puntoFuera(); crearEnemigo('becario', p.x, p.y); }
    return;
  }
  const O = OLEADAS[Math.min(OLEADAS.length - 1, Math.floor(P.t / 60))];
  P.oleadaT -= dt;
  if (P.oleadaT <= 0) {
    P.oleadaT = O.cada;
    const p = puntoFuera();
    const brillo = tocaShiny() ? Math.floor(Math.random() * O.grupo) : -1;   // cuál del grupo sale shiny
    for (let i = 0; i < O.grupo && P.enemigos.length < SV.maxEnemigos; i++) crearEnemigo(elegirPeso(O.mezcla), p.x + rand(-30, 30), p.y + rand(-30, 30), i === brillo ? marcaShiny() : {});
  }
  // un mini jefe cada SV.apariciones.miniJefeCada segundos (no si ya viene el jefe final)
  const A = SV.apariciones, tMini = A.miniJefeCada * (P.miniJefe + 1);
  if (P.t >= tMini && tMini < SV.duracion - 20) {
    const m = MINIJEFES[Math.min(P.miniJefe, MINIJEFES.length - 1)]; P.miniJefe++;
    aviso(m.aviso, 'Suelta un Cofre de botín (sin microtransacciones)'); play('horn');
    const p = puntoFuera(), d = ENEMIGOS[m.enemigo];
    crearEnemigo(m.enemigo, p.x, p.y, { elite: true, vida: m.vida, escala: m.escala, r: d.r * m.escala * 0.75, vel: d.vel * 0.9, dano: d.dano * 2, xp: 40 });
  }
  // los momentos especiales
  const ev = EVENTOS[P.evento];
  if (ev && P.t >= ev.t) {
    P.evento++;
    aviso(ev.aviso, '¡Que no te rodeen!');
    play('horn');
    for (let i = 0; i < ev.n; i++) { const a = (i / ev.n) * Math.PI * 2; crearEnemigo(ev.enemigo, P.jug.x + Math.cos(a) * 380, P.jug.y + Math.sin(a) * 420); }
  }
  if (P.t >= SV.duracion && !P.jefe) llegaJefe();
}
// ¿le toca ser shiny al enemigo que sale? Por suerte (SV.apariciones.shinyProb) o porque lleva mucho sin salir uno
function tocaShiny() {
  const A = SV.apariciones;
  return Math.random() < A.shinyProb || P.t - P.ultimoShiny >= A.shinyMaxEspera;
}
function marcaShiny() {   // marca al enemigo como shiny y reinicia la cuenta
  P.ultimoShiny = P.t; return { shiny: true, shinyMul: SV.apariciones.shinyVida, xp: SV.apariciones.shinyXp };
}
// el cofre que sueltan los mini jefes y los shiny (se abre al pisarlo: js/cofre.js)
function soltarCofre(x, y) { P.cosas.push({ tipo: 'cofre', x, y, t: 0 }); play('crown'); }
function llegaJefe() {
  const p = puntoFuera();
  P.jefe = crearEnemigo('fallen', p.x, p.y, { jefe: true, spr: JEFE.spr, vida: JEFE.vida, escala: JEFE.escala, r: JEFE.r, vel: JEFE.vel, dano: JEFE.dano, xp: 0 });
  P.jefe.entT = 3; P.jefe.despT = 5; P.jefe.nombre = JEFE.nombre;
  aviso('¡LLEGA SURVIVALBOT!', '«Hemos comprado vuestro juego… y lo vamos a cerrar.»');
  play('horn'); chatDecir('boss');
}

function moverEnemigos(dt) {
  const j = P.jug;
  for (const e of P.enemigos) {
    if (e.muerto) continue;
    e.edad += dt; e.hitT = Math.max(0, e.hitT - dt);
    if (e.congT > 0) { e.congT -= dt; continue; }
    const dx = j.x - e.x, dy = j.y - e.y, dd = Math.hypot(dx, dy) || 1;
    // los que se han quedado muy lejos vuelven a aparecer delante del jugador
    if (dd > 900 && !e.jefe) { const p = puntoFuera(); e.x = p.x; e.y = p.y; continue; }
    let v = e.vel;
    if (e.jefe && e.vida < e.vidaMax * JEFE.furia) v *= 1.35;
    if (e.jefe && dd > 380) v *= 2.6;   // si te alejas mucho, SurvivalBot corre a por ti
    const T = e.d.tirador;
    if (T && !e.elite) {   // los tiradores se quedan a distancia y disparan
      if (dd < T.dist) v = dd < T.dist * 0.7 ? -v * 0.5 : 0;
      e.tiroT -= dt;
      if (e.tiroT <= 0 && dd < T.dist * 1.15) { e.tiroT = T.cd * rand(0.85, 1.15); P.balas.push({ x: e.x, y: e.y - 20, vx: dx / dd * T.vel, vy: dy / dd * T.vel, t: 4, dano: T.dano * (1 + P.t / 900) }); play('laser'); }
    }
    if (e.d.cura) {   // SoporteBot: «¿Ha probado a reiniciar?»
      e.curaT -= dt;
      if (e.curaT <= 0) { e.curaT = e.d.cura.cd; let n = 0; cerca(e.x, e.y, e.d.cura.r, o => { if (o !== e && o.vida < o.vidaMax) { o.vida = Math.min(o.vidaMax, o.vida + e.d.cura.cant); n++; } }); if (n) { P.efectos.push({ tipo: 'curaE', x: e.x, y: e.y, r: e.d.cura.r, t: 0.5, max: 0.5 }); } }
    }
    if (e.d.caduca && e.edad > e.d.caduca) { e.muerto = true; numero(e.x, e.y - 40, 'LICENCIA CADUCADA', '#c4b5fd'); poof(e, '#c4b5fd'); continue; }
    e.x += (dx / dd) * v * dt + e.kbx * dt; e.y += (dy / dd) * v * dt + e.kby * dt;
    e.kbx *= Math.pow(0.002, dt); e.kby *= Math.pow(0.002, dt);
    if (Math.abs(dx) > 4) e.face = dx > 0 ? 1 : -1;
    e.walk += dt * (6 + v / 10);
    if (e.jefe) jefeAtaca(e, dt, dd);
  }
  // que no se amontonen todos en el mismo sitio
  for (const e of P.enemigos) {
    if (e.muerto) continue;
    const re = e.r * e.escala;
    cerca(e.x, e.y, re, o => {
      if (o === e || o.id < e.id) return;
      const dx = o.x - e.x, dy = o.y - e.y, d = Math.hypot(dx, dy) || 0.01, min = re + o.r * o.escala;
      if (d < min) {
        const emp = (min - d) * 0.5, nx = dx / d, ny = dy / d, pe = e.jefe || e.elite ? 0.1 : 1, po = o.jefe || o.elite ? 0.1 : 1;
        e.x -= nx * emp * pe; e.y -= ny * emp * pe; o.x += nx * emp * po; o.y += ny * emp * po;
      }
    });
  }
}
// las dos habilidades de SurvivalBot
function jefeAtaca(e, dt, dd) {
  const E = JEFE.entierro, D = JEFE.despidos;
  e.entT -= dt; e.despT -= dt;
  if (e.entT <= 0) { e.entT = E.cd * (e.vida < e.vidaMax * JEFE.furia ? 0.7 : 1); P.marcas.push({ x: P.jug.x, y: P.jug.y, r: E.r, t: E.aviso, max: E.aviso }); numero(e.x, e.y - 120, 'ENTIERRO DE IP', '#7dd3fc'); play('womp'); }
  if (e.despT <= 0) {
    e.despT = D.cd; aviso('¡DESPIDOS MASIVOS!', 'SurvivalBot llama a los becarios'); play('despido');
    for (let i = 0; i < D.n; i++) { const a = (i / D.n) * Math.PI * 2; crearEnemigo('becario', e.x + Math.cos(a) * 90, e.y + Math.sin(a) * 90); }
  }
}

/* ---------- hacer daño ---------- */
function herir(e, dano, kx = 0, ky = 0, kb = 0, crit = false) {
  if (e.muerto) return;
  if (e.d.armadura && !e.jefe) dano *= 1 - e.d.armadura;
  dano *= multDano();
  if (!crit && P.mods.crit && Math.random() < P.mods.crit) { dano *= 2; crit = true; }
  e.vida -= dano; e.hitT = 0.12;
  const peso = e.jefe ? 0.08 : e.elite ? 0.25 : 1;
  e.kbx += kx * kb * peso; e.kby += ky * kb * peso;
  numero(e.x + rand(-6, 6), e.y - 30 * e.escala, Math.round(dano), crit ? '#ffcb3d' : '#fff', crit);
  if (e.vida <= 0) matar(e);
}
// cajas del campo (las de la mudanza, cosaEn con t === 2): se rompen con cualquier arma de área, proyectil o aura
function golpeCajas(x, y, r, dano) {
  const a = Math.floor((x - r - 20) / 180), b = Math.floor((x + r + 20) / 180), c = Math.floor((y - r) / 180), d = Math.floor((y + r + 30) / 180);
  for (let ix = a; ix <= b; ix++) for (let iy = c; iy <= d; iy++) {
    const o = cosaEn(ix, iy); if (!o || o.t !== 2) continue;
    const k = ix + ',' + iy; if (P.cajasRotas.has(k)) continue;
    if (Math.hypot(o.x - x, o.y - 10 - y) > r + 18) continue;
    const v = (P.cajasVida.get(k) ?? CAJAS.vida) - dano * multDano();
    P.cajasGolpe.set(k, 0.12);
    if (v > 0) { P.cajasVida.set(k, v); continue; }
    P.cajasRotas.add(k); P.cajasVida.delete(k); P.cajasGolpe.delete(k); romperCaja(o);
  }
}
function romperCaja(o) {
  const oro = Math.min(Math.round(rand(CAJAS.oro[0], CAJAS.oro[1])), Math.max(0, CAJAS.topeOro - P.oroCajas));
  P.oroCajas += oro;
  particulas(o.x, o.y - 10, 12, '#c99a5b', 200, 4); particulas(o.x, o.y - 10, 6, '#fff6ea', 120, 3); play('hit');
  if (oro) numero(o.x, o.y - 40, '+' + oro, '#ffcb3d');
  if (P.objetosCajas < CAJAS.topeObjetos && Math.random() < CAJAS.objeto) { P.objetosCajas++; numero(o.x, o.y - 62, '¡OBJETO!', '#e879f9', true); play('crown'); }
}
function matar(e) {
  e.muerto = true; P.kills++; P.puntos += e.jefe ? 5000 : e.elite ? 500 : 10;
  P.rachaKills.push(P.t);
  poof(e);
  if (e.jefe) { ganar(); return; }
  if (e.xp > 0) soltarGema(e.x, e.y, e.xp);
  if (e.elite || e.shiny) soltarCofre(e.x, e.y);
  if (e.d.alMorir && !e.elite) for (let i = 0; i < e.d.alMorir.n; i++) crearEnemigo(e.d.alMorir.tipo, e.x + rand(-20, 20), e.y + rand(-20, 20), { xp: 0 });
  if (Math.random() < BOTIN.cafe) P.cosas.push({ tipo: 'cafe', x: e.x, y: e.y, t: 0 });
  else if (Math.random() < BOTIN.iman) P.cosas.push({ tipo: 'iman', x: e.x, y: e.y, t: 0 });
  const vamp = EFECTO.vampiro(nvP('vampirismo')) + P.mods.heal; if (vamp) curar(vamp, false);
  if (e.elite) P.elites++;
  play('poof');
}
function curar(n, ver = true) {
  const j = P.jug, antes = j.vida; j.vida = Math.min(j.vidaMax, j.vida + n);
  if (ver && j.vida - antes >= 1) numero(j.x, j.y - 70, '+' + Math.round(j.vida - antes), '#7dff7a');
}
function danarJugador(n, quien) {
  const j = P.jug;
  if (j.invulT > 0 || j.salto || j.muerto) return;
  n *= 1 - P.mods.armor;
  if (Math.random() < EFECTO.esquivar(nvP('hitbox')) + P.mods.dodge) { numero(j.x, j.y - 70, '¡ESQUIVADO!', '#c8f'); j.invulT = 0.25; return; }
  j.vida -= n; j.invulT = SV.jugador.invul; j.golpeT = 0.2; P.sacudida = Math.max(P.sacudida, 5);
  numero(j.x, j.y - 70, '-' + Math.round(n), '#ff4b5c');
  play('hit');
  if (quien && quien.tipo === 'cobradlc' && P.xp > 0) { const q = Math.min(P.xp, 3); P.xp -= q; numero(j.x + 30, j.y - 90, '-' + q + ' CAOS (DLC)', '#e879f9'); }
  if (j.vida <= 0) {
    if (P.mods.revive && !P.reviveUsado) { P.reviveUsado = true; j.vida = j.vidaMax * Math.min(1, P.mods.revive); j.invulT = 2; aviso('¡REVIVES!', 'Te habían despedido… pero el contrato tenía letra pequeña'); play('revive'); return; }
    perder();
  }
}

/* ---------- CAOS (los cristales), cafés, imanes y cofres ---------- */
function soltarGema(x, y, v) {
  if (P.gemas.length >= SV.maxGemas) {   // demasiados: se juntan en el más viejo
    const g = P.gemas[0]; g.v += v; return;
  }
  P.gemas.push({ x: x + rand(-6, 6), y: y + rand(-6, 6), v, atr: false, sp: 0 });
}
function recoger(dt) {
  const j = P.jug, R = radioRecoger();
  for (let i = P.gemas.length - 1; i >= 0; i--) {
    const g = P.gemas[i], dx = j.x - g.x, dy = j.y - 18 - g.y, d = Math.hypot(dx, dy);
    if (!g.atr && d < R) g.atr = true;
    if (g.atr) { g.sp = Math.min(900, g.sp + 1400 * dt); g.x += (dx / d) * g.sp * dt; g.y += (dy / d) * g.sp * dt; }
    if (d < 16) { P.gemas.splice(i, 1); ganarXp(g.v); }
  }
  for (let i = P.cosas.length - 1; i >= 0; i--) {
    const c = P.cosas[i]; c.t += dt;
    if (Math.hypot(j.x - c.x, j.y - c.y) > 30) continue;
    P.cosas.splice(i, 1);
    if (c.tipo === 'cafe') { curar(BOTIN.cafeCura); play('heal'); }
    else if (c.tipo === 'iman') { for (const g of P.gemas) g.atr = true; numero(j.x, j.y - 80, '¡IMÁN!', '#7df3ff'); play('shield'); }
    else if (c.tipo === 'cofre') abrirCofre();
  }
}
function ganarXp(v) {
  P.xp += v * EFECTO.xp(nvP('diploma')) * (1 + P.mods.xp); play('blip');
  while (P.xp >= P.xpSig) { P.xp -= P.xpSig; P.nivel++; P.xpSig = SV.xpNivel(P.nivel); P.pendientes++; }
}
/* ---------- subir de nivel: 3 opciones ---------- */
function puedeMejorar() {
  const L = [];
  const nArmas = Object.keys(P.armas).length, nPas = Object.keys(P.pasivas).length;
  for (const k in ARMAS) {
    const n = P.armas[k] || 0;
    if (n >= SV.nivelMax) continue;
    if (!n && nArmas >= SV.maxArmas) continue;
    L.push({ clase: 'arma', id: k, nombre: ARMAS[k].nombre, nuevo: !n, nivelNuevo: n + 1, desc: n ? ARMAS[k].nv[n - 1] : ARMAS[k].desc, carta: ARMAS[k].carta, peso: n ? 3 : 2 });
  }
  for (const k in PASIVAS) {
    const n = P.pasivas[k] || 0;
    if (n >= SV.nivelMax) continue;
    if (!n && nPas >= SV.maxPasivas) continue;
    L.push({ clase: 'pasiva', id: k, nombre: PASIVAS[k].nombre, nuevo: !n, nivelNuevo: n + 1, desc: PASIVAS[k].desc, icono: PASIVAS[k].icono, peso: n ? 2 : 1.5 });
  }
  return L;
}
function opcionesNivel(cuantas = 3, soloTuyas = false) {
  let L = puedeMejorar();
  if (soloTuyas && L.some(o => !o.nuevo)) L = L.filter(o => !o.nuevo);
  const out = [];
  while (out.length < cuantas && L.length) {
    let tot = 0; for (const o of L) tot += o.peso;
    let r = Math.random() * tot, i = 0; for (; i < L.length; i++) { r -= L[i].peso; if (r <= 0) break; }
    out.push(L.splice(Math.min(i, L.length - 1), 1)[0]);
  }
  for (const R of RELLENO) if (out.length < cuantas) out.push(Object.assign({ clase: 'relleno', nuevo: false }, R));
  return out;
}
function aplicarOpcion(op) {
  if (op.clase === 'arma') { P.armas[op.id] = (P.armas[op.id] || 0) + 1; P.cd[op.id] = Math.min(P.cd[op.id] || 0, 0.3); }
  else if (op.clase === 'pasiva') {
    P.pasivas[op.id] = (P.pasivas[op.id] || 0) + 1;
    if (op.id === 'piel') { P.jug.vidaMax = Math.round(SV.jugador.vida * P.mods.hp) + EFECTO.vidaMax(P.pasivas.piel); curar(20); }
  } else if (op.id === 'cafe') curar(40);
  else if (op.id === 'bonus') P.puntos += 500;
  play('levelup');
}

/* ---------- efectos ---------- */
function numero(x, y, v, col = '#fff', grande = false) {
  if (P.numeros.length > 90) P.numeros.shift();
  P.numeros.push({ x, y, v: typeof v === 'number' ? String(v) : tr(v), col, t: 0, grande });
}
function particulas(x, y, n, col, vel = 160, tam = 4, vida = 0.5) {
  for (let i = 0; i < n && P.parts.length < 420; i++) { const a = Math.random() * Math.PI * 2, s = rand(0.3, 1) * vel; P.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, t: 0, max: vida * rand(0.7, 1.2), col, tam: tam * rand(0.6, 1.3) }); }
}
function poof(e, col) {
  particulas(e.x, e.y - 14 * e.escala, e.jefe ? 60 : e.elite ? 30 : 7, col || pick(['#cdd6e6', '#8b97ad', '#ffcb3d']), e.jefe ? 320 : 150, e.jefe ? 7 : 4);
  P.efectos.push({ tipo: 'cuerpo', spr: e.spr, x: e.x, y: e.y, face: e.face, escala: e.escala, t: 0.35, max: 0.35 });
}
function aviso(titulo, sub) { P.aviso = { titulo: tr(titulo), sub: sub ? tr(sub) : '', t: 0, max: 3.2 }; }
// el chat falso de la partida (las frases son las de core/js/serie/frases.js)
function chatDecir(tipo) {
  const L = CHAT[tipo]; if (!L || !P || SAVE.chat === false) return;
  const u = pick(CHAT_USERS);
  const txt = tr(pick(L)).replace(/\{yo\}/g, 'CrazyBunny').replace(/\{X\}/g, 'SurvivalBot');
  P.chat.push({ quien: u[0], col: u[1], txt, t: 0 }); if (P.chat.length > 4) P.chat.shift();
}

/* ---------- ganar y perder ---------- */
function ganar() {
  P.estado = 'fin'; P.ganado = true; P.finT = 0; P.sacudida = 14; P.hitStop = 0.25;
  aviso('¡SURVIVALBOT DESPEDIDO!', 'Microblizz anuncia que «nunca le gustó ese robot»');
  chatDecir('win'); play('crown');
}
function perder() {
  const j = P.jug; j.vida = 0; j.muerto = true;
  P.estado = 'fin'; P.ganado = false; P.finT = 0; P.sacudida = 10;
  particulas(j.x, j.y - 30, 40, '#ffffff', 260, 6, 0.9);
  play('sad');
}

/* ---------- un fotograma de la partida ---------- */
function actualizar(dt) {
  if (!P) return;
  if (P.hitStop > 0) { P.hitStop -= dt; dt *= 0.15; }
  const j = P.jug;
  if (P.estado === 'fin') {
    P.finT += dt; efectosPasan(dt);
    if (P.finT > 1.6 && !P.finMostrado) { P.finMostrado = true; mostrarFin(); }
    return;
  }
  if (P.estado !== 'jugando') return;
  P.t += dt;
  // el jugador se mueve
  j.invulT = Math.max(0, j.invulT - dt); j.golpeT = Math.max(0, j.golpeT - dt);
  if (j.congT > 0) j.congT -= dt;
  if (P.mods.regen) curarSuave(P.mods.regen * dt);
  const mx = MANDO.x, my = MANDO.y, ml = Math.hypot(mx, my);
  j.andando = ml > 0.1 && j.congT <= 0;
  if (j.andando) {
    const v = velJugador() * Math.min(1, ml);
    j.x += (mx / ml) * v * dt; j.y += (my / ml) * v * dt; j.walk += dt * 9;
    if (Math.abs(mx) > 0.15) j.face = mx > 0 ? 1 : -1;
  }
  P.cam.x += (j.x - P.cam.x) * Math.min(1, dt * 8); P.cam.y += (j.y - 30 - P.cam.y) * Math.min(1, dt * 8);
  oleadas(dt);
  rehacerRejilla();
  moverEnemigos(dt);
  rehacerRejilla();
  armasDisparan(dt);
  moverProyectiles(dt);
  // los enemigos te tocan
  if (!j.salto) cerca(j.x, j.y, SV.jugador.r, e => danarJugador(e.dano, e));
  // las balas enemigas
  for (let i = P.balas.length - 1; i >= 0; i--) {
    const b = P.balas[i]; b.x += b.vx * dt; b.y += b.vy * dt; b.t -= dt;
    if (Math.hypot(b.x - j.x, b.y - (j.y - 20)) < SV.jugador.r + 6) { danarJugador(b.dano); P.balas.splice(i, 1); continue; }
    if (b.t <= 0) P.balas.splice(i, 1);
  }
  // las marcas del Entierro de IP
  for (let i = P.marcas.length - 1; i >= 0; i--) {
    const m = P.marcas[i]; m.t -= dt;
    if (m.t <= 0) {
      P.marcas.splice(i, 1); particulas(m.x, m.y, 26, '#bfe9ff', 200, 5);
      if (Math.hypot(j.x - m.x, j.y - m.y) < m.r && !j.salto) { j.congT = JEFE.entierro.congela; danarJugador(JEFE.entierro.dano); numero(j.x, j.y - 95, '¡CONGELADO!', '#7dd3fc'); play('zap'); }
    }
  }
  recoger(dt);
  efectosPasan(dt);
  P.enemigos = P.enemigos.filter(e => !e.muerto);
  // el chat comenta
  P.chatT -= dt; if (P.chatT <= 0) { P.chatT = rand(9, 16); chatDecir('idle'); }
  while (P.rachaKills.length && P.t - P.rachaKills[0] > 1) P.rachaKills.shift();
  if (P.rachaKills.length >= 18) { P.rachaKills.length = 0; chatDecir('multikill'); }
  if (P.pendientes > 0 && P.estado === 'jugando') abrirNivel();
}
function efectosPasan(dt) {
  for (const n of P.numeros) n.t += dt; P.numeros = P.numeros.filter(n => n.t < 0.8);
  for (const p of P.parts) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; p.vx *= 0.97; } P.parts = P.parts.filter(p => p.t < p.max);
  for (const [k, v] of P.cajasGolpe) { if (v - dt <= 0) P.cajasGolpe.delete(k); else P.cajasGolpe.set(k, v - dt); }
  for (const f of P.efectos) f.t -= dt; P.efectos = P.efectos.filter(f => f.t > 0);
  for (const c of P.chat) c.t += dt; P.chat = P.chat.filter(c => c.t < 9);
  if (P.aviso) { P.aviso.t += dt; if (P.aviso.t > P.aviso.max) P.aviso = null; }
  P.sacudida = Math.max(0, P.sacudida - dt * 30);
}
