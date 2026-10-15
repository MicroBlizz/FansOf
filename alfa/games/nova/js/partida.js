// Fans of Nova · La partida: estado, bucle, movimiento de la nave, chatarra, rangos y fin de partida (prototipo de la fase 1).
// El dibujo está en dibujo.js y los menús en interfaz.js. Todo el estado vive en S; no se guarda nada (la partida dura 3-5 min).
'use strict';
const NV_ESCALA_NAVE = 0.2;                // tamaño inicial de la nave dibujada (1 = el PNG de arte tal cual); empiezas muy pequeño y creces; el hitbox sale de él
const NV_ARENA = 4200;                       // radio de la arena
// Sin rango máximo: chatarra acumulada para pasar del rango k al k+1.
// Unos 30 rangos con subidas pequeñas: cada rango es un 7 % más grande (tú y las naves enemigas, con la misma regla).
function nvUmbral(k) { return Math.round(250 * (Math.pow(1.3, k) - 1)); }
function nvUmbralS(S, k) { return Math.round(nvUmbral(k) * (S.cap === 'epicchampion' ? 0.8 : 1)); }
function nvFactor(r) { return Math.pow(1.07, r - 1); }
function nvEscalaRango(r) { return NV_ESCALA_NAVE * nvFactor(r); }
function nvVista(S) { return 560 * Math.pow(nvFactor(S.nave.rango), 0.9); }   // la cámara se aleja según creces
function nvZ(S) { return nvVista(S) / 560; }   // cuántas unidades de mundo mide «un píxel de rango 1»: los efectos y trazos fijos se multiplican por esto para verse igual a cualquier tamaño
function nvTier(r) { return Math.min(5, 1 + Math.floor((r - 1) / 5)); }   // el casco gana ranuras y motores cada 5 rangos
// Chatarra de un enemigo según su tamaño frente al tuyo: uno mayor da muchísimo, uno menor casi nada.
function nvValorKill(base, rangoE, rangoN) { const d = rangoE - rangoN; return base * (d >= 0 ? Math.pow(1.5, Math.min(d, 8)) : Math.pow(0.6, Math.min(-d, 6))); }

const NVP = { casco: 'caza', cap: 'progamer', ofi: null, S: null, ult: 0, raf: 0, entrada: { x: 0, y: 0 }, teclas: {}, joy: null, auto: false, vel: 1 };   // auto y vel solo para pruebas (?auto=1&vel=4)

// Cascos del prototipo: cada facción empieza con un arma de su clase ya montada (afinidad de datos-cascos.js).
const NV_CASCOS = {
  caza:    { hp: 220, vel: 215, arma: ['flak', 'cinetica'] },
  crucero: { hp: 230, vel: 190, arma: ['laser', 'termica'] },
  fragata: { hp: 330, vel: 160, arma: ['flak', 'explosiva'] }
};
function nvNuevaPartida(casco, cap, ofi) {
  casco = casco || 'caza'; cap = cap || NVP.cap || 'progamer'; ofi = ofi === undefined ? NVP.ofi : ofi;
  const H = NOVA_PIEZAS.cascos[casco], C = NV_CASCOS[casco], alas = NVA.meta[casco + '-alas'];
  const S = {
    t: 0, estado: 'juego', cartas: null, rerolls: 1, aviso: null, jefe: null, libre: false, casco, faccion: H.faccion, capMuertos: 0, cartera: 0,
    nave: { x: 0, y: 0, vx: 0, vy: 0, ang: 0, rango: 1, hp: C.hp, hpMax: C.hp, vel: C.vel, escala: NV_ESCALA_NAVE, armas: [], esc: null, golpeado: 0, r: 0 },
    enem: [], proy: [], eproy: [], restos: [], parts: [], nums: [], fx: [], o_t: {}, mejoras: {}, sist: {},
    chat: 0, cam: { x: 0, y: 0 },
    stats: { dano: 0, mayor: 0, muertos: 0, tragados: 0, recibido: 0, reacciones: {}, cartas: [], rangoT: [] }
  };
  S.nave.rAncho = alas ? alas.ancho / 2 : 200;   // semienvergadura en unidades de nave: el hitbox sale del dibujo
  S.nave.r = 0.42 * S.nave.rAncho * S.nave.escala;
  NVP.S = S;
  const sl = nvRanuras(1, S)[0];
  S.nave.armas.push(nvArmaNueva(sl, C.arma[0], C.arma[1]));
  nvGeneraMundo(S);
  S.cap = cap; S.ofi = ofi; S.kills = [];
  nvAplicaTripulacion(S);
  return S;
}

// ---------- un paso de simulación (dt en segundos) ----------
function nvPaso(S, dt) {
  if (S.estado !== 'juego') return;
  S.t += dt;
  const n = S.nave;
  nvMueve(S, dt);
  nvSpawn(S, dt);
  nvMundo(S, dt);
  nvTripulacionPaso(S);
  nvEnemigos(S, dt);
  nvSumaChatarra(S, 0);
  nvArmas(S, dt);
  nvProyectiles(S, dt);
  nvProyectilesEnemigos(S, dt);
  nvRestos(S, dt);
  if (n.esc) { if (n.esc.sin > 0) n.esc.sin -= dt; else n.esc.hp = Math.min(n.esc.cap, n.esc.hp + n.esc.reg * dt); }
  if (n.golpeado > 0) n.golpeado -= dt;
  if (S.mejoras.regen) n.hp = Math.min(n.hpMax, n.hp + S.mejoras.regen * dt);
  for (const l of [S.parts, S.nums, S.fx]) for (let i = l.length - 1; i >= 0; i--) { const o = l[i]; o.t -= dt; if (o.vx) { o.x += o.vx * dt; o.y += o.vy * dt; } else if (o.txt) o.y -= 30 * nvZ(S) * dt; if (o.t <= 0) l.splice(i, 1); }
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
  if (NVP.auto) { const g = nvBotMeta(S); ix = g[0]; iy = g[1]; }   // bot de pruebas
  const m = Math.hypot(ix, iy); if (m > 1) { ix /= m; iy /= m; }
  const vmax = (n.vel + 2.5 * Math.min(30, n.rango - 1)) * (S.mejoras.vel || 1);
  n.vx += (ix * vmax - n.vx) * Math.min(1, dt * 5); n.vy += (iy * vmax - n.vy) * Math.min(1, dt * 5);
  n.x += n.vx * dt; n.y += n.vy * dt;
  const d = Math.hypot(n.x, n.y); if (d > NV_ARENA) { n.x *= NV_ARENA / d; n.y *= NV_ARENA / d; }
  // la proa mira hacia donde te mueves (parado, se queda como estaba); las armas son las que apuntan a los enemigos
  if (m > 0.1) {
    let df = Math.atan2(n.vx, -n.vy) - n.ang; while (df > Math.PI) df -= 6.283; while (df < -Math.PI) df += 6.283;
    n.ang += Math.max(-7 * dt, Math.min(7 * dt, df));
  }
}
// Bot de pruebas: va a la estación si tiene chatarra, si no a lo comestible más cercano (rocas, pecios, nidos, capitanes) y huye si le queda poca vida.
function nvBotMeta(S) {
  const n = S.nave;
  let mejor = null, md = 1e12;
  const mira = (x, y, peso) => { const d = (Math.hypot(x - n.x, y - n.y) + 1) * peso; if (d < md) { md = d; mejor = [x, y]; } };
  let huir = null;
  for (const e of S.enem) {
    if (e.muerto) continue;
    if (!e.d.pasivo && e.rango >= n.rango + 3 && !e.d.jefe && Math.hypot(e.x - n.x, e.y - n.y) < 450 + e.r) huir = e;
    else if (e.d.pasivo === 1) mira(e.x, e.y, 1.3);
  }
  for (const r of S.restos) mira(r.x, r.y, 0.5);
  if (huir) { const hx = n.x - huir.x, hy = n.y - huir.y, hd = Math.hypot(hx, hy) || 1; return [hx / hd, hy / hd]; }
  for (const p of S.pecios) mira(p.x, p.y, 0.7);
  if (S.cartera >= 90) for (const st of S.estaciones) mira(st.x, st.y, 1);
  if (S.jefe && !S.jefe.muerto) mejor = [S.jefe.x, S.jefe.y];
  if (!mejor) return [Math.cos(S.t * 0.6), Math.sin(S.t * 0.7)];
  const dx = mejor[0] - n.x, dy = mejor[1] - n.y, d = Math.hypot(dx, dy) || 1, k = n.hp < n.hpMax * 0.25 ? -1 : 1;
  return [dx / d * k, dy / d * k];
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
    if (d < n.r + 10) { S.restos.splice(i, 1); S.stats.tragados++; nvSumaChatarra(S, r.v); }
    else if (r.t > 25) S.restos.splice(i, 1);
  }
}
function nvSumaChatarra(S, v) {
  S.chat += v; S.cartera += v;
  const n = S.nave;
  if (S.estado === 'juego' && S.chat >= nvUmbralS(S, n.rango)) {   // una subida cada vez; si queda chatarra, la siguiente llega tras elegir la carta
    n.rango++; n.escala = nvEscalaRango(n.rango); n.r = 0.42 * n.rAncho * n.escala;
    n.hpMax = Math.round(n.hpMax * 1.08); n.hp = Math.min(n.hpMax, n.hp + n.hpMax * 0.3);
    S.stats.rangoT.push(Math.round(S.t));
    S.aviso = { t: 2, txt: tr('Rango') + ' ' + n.rango + '!' };
    nvAjustaTamanos(S);
    nvAbrirCartas(S);
  }
}

// ---------- bucle y entrada ----------
function nvBucle(ahora) {
  const S = NVP.S;
  if (!S) return;
  const dt = Math.min(0.05, (ahora - (NVP.ult || ahora)) / 1000); NVP.ult = ahora;
  if (NVP.auto && S.estado === 'cartas') nvElegirCarta(S, 0);   // bot de pruebas (?auto=1): elige la primera carta
  if (NVP.auto && S.estado === 'estacion') nvBotEstacion(S);
  for (let i = 0; i < NVP.vel; i++) nvPaso(S, dt);
  nvDibuja(S);
  NVP.raf = requestAnimationFrame(nvBucle);
}
function nvEmpieza(casco, cap, ofi) {
  nvNuevaPartida(casco, cap, ofi);
  NVP.ult = 0;
  cancelAnimationFrame(NVP.raf);
  NVP.raf = requestAnimationFrame(nvBucle);
}
function nvParar() { cancelAnimationFrame(NVP.raf); NVP.S = null; }

// Simulación sin dibujar, para el bot de pruebas: devuelve cuando acaba la partida o pasan `max` segundos.
function nvSimular(max, dt, bot) {
  const S = NVP.S || nvNuevaPartida(NVP.casco);
  NVP.auto = true;
  let pasos = 0;
  while (S.estado !== 'victoria' && S.estado !== 'derrota' && S.t < max && pasos++ < 400000) {
    if (S.estado === 'cartas') { nvElegirCarta(S, bot ? bot(S) : 0); continue; }
    if (S.estado === 'estacion') { nvBotEstacion(S); continue; }
    nvPaso(S, dt || 1 / 30);
  }
  return S;
}

// Bot en la estación: repara si hace falta y, si no, se va (los cambios de arma son cosa del jugador).
function nvBotEstacion(S) {
  for (let hecho = true; hecho;) { hecho = false; const a = S.nave.armas.filter(w => w.portador !== 'defensa'); for (const x of a) { const y = a.find(w => nvPuedeUnir(x, w)); if (y) { nvUneArmas(S, x, y); hecho = true; break; } } }   // el bot une las armas iguales
  if (S.nave.hp < S.nave.hpMax * 0.6 && S.cartera >= 40) { S.cartera -= 40; S.nave.hp = S.nave.hpMax; }
  S.est.cd = 25; S.estado = 'juego'; S.est = null;
}

// ---------- tripulación: capitán (ventaja y pega) y un oficial (faceta). Solo los capitanes que ya tienen mecánica en el prototipo ----------
const NV_CAPITANES = ['progamer', 'bunny', 'necrolord', 'twitchking', 'epicchampion'];
const NV_OFICIALES = {   // faceta de datos-tripulacion.js → efecto en la partida
  fuego: S => { S.mejoras.dano = (S.mejoras.dano || 1) * 1.1; },
  defensa: S => { S.nave.hpMax = Math.round(S.nave.hpMax * 1.15); S.nave.hp = S.nave.hpMax; },
  ingenieria: S => { S.mejoras.regen = (S.mejoras.regen || 0) + 0.8; S.mejoras.robo = (S.mejoras.robo || 0) + 0.01; },
  tacticas: S => { S.rerollExtra = 1; },
  navegacion: S => { S.mejoras.vel = (S.mejoras.vel || 1) * 1.08; S.mejoras.iman = (S.mejoras.iman || 0) + 1; }
};
function nvAplicaTripulacion(S) {
  if (S.ofi && NV_OFICIALES[S.ofi]) NV_OFICIALES[S.ofi](S);
}
function nvTripulacionPaso(S) {
  const n = S.nave;
  if (S.cap === 'bunny') {   // +10 % de daño por enemigo cerca, hasta +50 %
    let k = 0; const R = 140 * nvFactor(n.rango);
    for (const e of S.enem) if (!e.muerto && !e.d.pasivo && Math.hypot(e.x - n.x, e.y - n.y) < R + e.r) k++;
    S.capDano = Math.min(0.5, 0.1 * k);
  }
  if (S.cap === 'twitchking') {   // cada baja en los últimos 2 s da +5 % de cadencia, hasta +50 %
    S.kills = S.kills.filter(t => S.t - t < 2);
    S.hype = 1 + Math.min(0.5, 0.05 * S.kills.length);
  }
}
