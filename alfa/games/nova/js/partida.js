// Fans of Nova · La partida: estado, bucle, movimiento de la nave, chatarra, rangos y fin de partida (prototipo de la fase 1).
// El dibujo está en dibujo.js y los menús en interfaz.js. Todo el estado vive en S; no se guarda nada (la partida dura 3-5 min).
'use strict';
const NV_ARENA = 1500;                       // radio de la arena
const NV_CHATARRA_RANGO = [130, 340, 700, 1250];   // chatarra acumulada para pasar a los rangos 2, 3, 4 y 5

const NVP = { S: null, ult: 0, raf: 0, entrada: { x: 0, y: 0 }, teclas: {}, joy: null, auto: false, vel: 1 };   // auto y vel solo para pruebas (?auto=1&vel=4)

function nvNuevaPartida(semilla) {
  const S = {
    t: 0, estado: 'cartas', cartas: null, rerolls: 1, aviso: null, jefe: null, libre: true,
    nave: { x: 0, y: 0, vx: 0, vy: 0, ang: 0, rango: 1, hp: 220, hpMax: 220, r: 26, escala: 1, armas: [], esc: null, golpeado: 0 },
    enem: [], proy: [], eproy: [], restos: [], parts: [], nums: [], fx: [], o_t: {}, mejoras: {}, sist: {},
    chat: 0, cam: { x: 0, y: 0 },
    stats: { dano: 0, mayor: 0, muertos: 0, tragados: 0, recibido: 0, reacciones: {}, cartas: [], rangoT: [] }
  };
  NVP.S = S;
  nvAbrirCartas(S);
  return S;
}

// ---------- un paso de simulación (dt en segundos) ----------
function nvPaso(S, dt) {
  if (S.estado !== 'juego') return;
  S.t += dt;
  const n = S.nave;
  nvMueve(S, dt);
  nvSpawn(S, dt);
  nvEnemigos(S, dt);
  nvArmas(S, dt);
  nvProyectiles(S, dt);
  nvProyectilesEnemigos(S, dt);
  nvRestos(S, dt);
  if (n.esc) { if (n.esc.sin > 0) n.esc.sin -= dt; else n.esc.hp = Math.min(n.esc.cap, n.esc.hp + n.esc.reg * dt); }
  if (n.golpeado > 0) n.golpeado -= dt;
  for (const l of [S.parts, S.nums, S.fx]) for (let i = l.length - 1; i >= 0; i--) { const o = l[i]; o.t -= dt; if (o.vx) { o.x += o.vx * dt; o.y += o.vy * dt; } else if (o.txt) o.y -= 30 * dt; if (o.t <= 0) l.splice(i, 1); }
  if (S.aviso && (S.aviso.t -= dt) <= 0) S.aviso = null;
  // cámara suave
  S.cam.x += (n.x - S.cam.x) * Math.min(1, dt * 6); S.cam.y += (n.y - S.cam.y) * Math.min(1, dt * 6);
}
function nvMueve(S, dt) {
  const n = S.nave, e = NVP.entrada;
  let ix = e.x, iy = e.y;
  if (NVP.teclas.ArrowLeft || NVP.teclas.a) ix -= 1;
  if (NVP.teclas.ArrowRight || NVP.teclas.d) ix += 1;
  if (NVP.teclas.ArrowUp || NVP.teclas.w) iy -= 1;
  if (NVP.teclas.ArrowDown || NVP.teclas.s) iy += 1;
  if (NVP.auto) { const a = S.t * 0.6; ix = Math.cos(a); iy = Math.sin(a * 1.3); }   // bot de pruebas: da vueltas
  const m = Math.hypot(ix, iy); if (m > 1) { ix /= m; iy /= m; }
  const vmax = 200 + 6 * (n.rango - 1);
  n.vx += (ix * vmax - n.vx) * Math.min(1, dt * 5); n.vy += (iy * vmax - n.vy) * Math.min(1, dt * 5);
  n.x += n.vx * dt; n.y += n.vy * dt;
  const d = Math.hypot(n.x, n.y); if (d > NV_ARENA) { n.x *= NV_ARENA / d; n.y *= NV_ARENA / d; }
  // la proa apunta al enemigo más cercano; sin enemigos, hacia donde vas
  let obj = null, mejor = 1e12;
  for (const en of S.enem) { const q = (en.x - n.x) ** 2 + (en.y - n.y) ** 2; if (!en.muerto && q < mejor) { mejor = q; obj = en; } }
  let meta = n.ang;
  if (obj && mejor < 700 * 700) meta = Math.atan2(obj.x - n.x, -(obj.y - n.y));
  else if (m > 0.1) meta = Math.atan2(n.vx, -n.vy);
  let df = meta - n.ang; while (df > Math.PI) df -= 6.283; while (df < -Math.PI) df += 6.283;
  n.ang += Math.max(-4 * dt, Math.min(4 * dt, df));
}
function nvProyectilesEnemigos(S, dt) {
  const n = S.nave;
  for (let i = S.eproy.length - 1; i >= 0; i--) {
    const b = S.eproy[i];
    b.x += b.vx * dt; b.y += b.vy * dt;
    if (Math.hypot(b.x - n.x, b.y - n.y) < b.r + n.r) { nvDanoNave(S, b.dano); S.eproy.splice(i, 1); continue; }
    if ((b.vida -= dt) <= 0) S.eproy.splice(i, 1);
  }
}
function nvRestos(S, dt) {
  const n = S.nave, im = 70 + 45 * (S.mejoras.iman || 0) + 6 * n.rango;
  for (let i = S.restos.length - 1; i >= 0; i--) {
    const r = S.restos[i], d = Math.hypot(n.x - r.x, n.y - r.y);
    r.t += dt;
    if (d < im || r.t > 6) { const v = Math.min(1, dt * (d < im ? 7 : 0)); r.x += (n.x - r.x) * v; r.y += (n.y - r.y) * v; }
    if (d < n.r + 10) { S.restos.splice(i, 1); nvSumaChatarra(S, r.v); }
    else if (r.t > 25) S.restos.splice(i, 1);
  }
}
function nvSumaChatarra(S, v) {
  S.chat += v;
  const n = S.nave;
  while (n.rango < 5 && S.chat >= NV_CHATARRA_RANGO[n.rango - 1]) {
    n.rango++; n.escala = 1 + 0.07 * (n.rango - 1); n.r = 26 * n.escala;
    n.hp = Math.min(n.hpMax, n.hp + n.hpMax * 0.25);
    S.stats.rangoT.push(Math.round(S.t));
    S.aviso = { t: 2, txt: tr('Rango') + ' ' + n.rango + '!' };
    nvAjustaTamanos(S);
    nvAbrirCartas(S);
    break;
  }
}

// ---------- bucle y entrada ----------
function nvBucle(ahora) {
  const S = NVP.S;
  if (!S) return;
  const dt = Math.min(0.05, (ahora - (NVP.ult || ahora)) / 1000); NVP.ult = ahora;
  if (NVP.auto && S.estado === 'cartas') nvElegirCarta(S, 0);   // bot de pruebas (?auto=1): elige la primera carta
  for (let i = 0; i < NVP.vel; i++) nvPaso(S, dt);
  nvDibuja(S);
  NVP.raf = requestAnimationFrame(nvBucle);
}
function nvEmpieza() {
  nvNuevaPartida();
  NVP.ult = 0;
  cancelAnimationFrame(NVP.raf);
  NVP.raf = requestAnimationFrame(nvBucle);
}
function nvParar() { cancelAnimationFrame(NVP.raf); NVP.S = null; }

// Simulación sin dibujar, para el bot de pruebas: devuelve cuando acaba la partida o pasan `max` segundos.
function nvSimular(max, dt, bot) {
  const S = NVP.S || nvNuevaPartida();
  NVP.auto = true;
  let pasos = 0;
  while (S.estado !== 'victoria' && S.estado !== 'derrota' && S.t < max && pasos++ < 400000) {
    if (S.estado === 'cartas') { nvElegirCarta(S, bot ? bot(S) : 0); continue; }
    nvPaso(S, dt || 1 / 30);
  }
  return S;
}
