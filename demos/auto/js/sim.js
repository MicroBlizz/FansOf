// Fans of Auto · LA SIMULACIÓN: todo el estado de la partida vive en un solo objeto (S) y avanza en pasos fijos (60 por
// segundo) con las ÓRDENES de cada jugador (mover, acelerar, girar, freno, disparar, entrar). Aquí no se dibuja nada ni se
// lee el teclado: así el día del multijugador el mismo código puede correr en el ordenador que haga de árbitro y repartir el
// estado. Aquí están el jugador a pie y en coche, la física de los coches, los choques, las balas, los objetos y el dinero.
// Lo que piensan los coches del tráfico, los peatones y los Moderadores está en ia.js; las misiones, en mision.js.
'use strict';

let S = null;   // el estado de la partida
const PUNTOS = { atropello: 100, peaton: 100, coche: 500, robo: 50, moderador: 300, objeto: 500 };
const DONATIVO = 5000, PINTURA = 1000;

function nuevoEstado(guardado) {
  const az = Azar(Date.now() & 0xffff);
  S = {
    tick: 0, semilla: az.semilla(), jugadores: [], coches: [], peatones: [], balas: [], objetos: [], fx: [], telefonos: [], mensaje: null, rotulo: null,
    mision: null, hechas: guardado ? guardado.hechas.slice() : [], sigId: 1, pausa: false,
  };
  S.az = Azar(S.semilla);
  const j = {
    id: 'j1', x: MAPA.lugares.templo.x, y: MAPA.lugares.templo.y + 24, ang: -Math.PI / 2, vx: 0, vy: 0, vida: 100, vidas: 3, coche: null, cuadro: 0, paso: 0,
    dinero: 0, mult: 1, racha: 0, rachaT: 0, respeto: [40, 40, 40], calor: 0, buscado: 0, visto: 0, muerto: 0, baneado: 0, disparoT: 0, carga: null, enTemplo: 0, enTaller: 0, aviso: 0,
  };
  if (guardado) Object.assign(j, { dinero: guardado.dinero, mult: guardado.mult, respeto: guardado.respeto.slice(), vidas: guardado.vidas });
  S.jugadores.push(j);
  for (const o of MAPA.objetos) S.objetos.push({ id: S.sigId++, tipo: o.tipo, x: o.x, y: o.y, t: 0 });
  for (const t of MAPA.telefonos) S.telefonos.push({ banda: t.banda, x: t.x, y: t.y, suena: false });
  creaTrafico();
  creaVecinos();
  // coches aparcados en los dos aparcamientos
  for (const k of ['aparcamiento1', 'aparcamiento3']) {
    const L = MAPA.lugares[k];
    for (let i = -2; i <= 2; i++) if (S.az() < 0.8) nuevoCoche(S.az.elige(['sedan', 'compacto', 'deportivo', 'furgon', 'taxi']), L.x + i * 30, L.y - 20, -Math.PI / 2, null);
    for (let i = -2; i <= 2; i++) if (S.az() < 0.6) nuevoCoche(S.az.elige(['sedan', 'compacto', 'deportivo', 'granizo']), L.x + i * 30, L.y + 24, Math.PI / 2, null);
  }
  return S;
}

function nuevoCoche(tipo, x, y, ang, conductor, extra = {}) {
  const D = COCHES[tipo];
  const c = Object.assign({ id: S.sigId++, tipo, color: D.policia ? '#f4f4f4' : D.taxi ? '#f0c020' : D.helados ? '#f7d9e3' : tipo === 'granizo' ? '#1d3f8f' : S.az.elige(COLORES_COCHE), x, y, ang, vx: 0, vy: 0, vida: D.vida, conductor, ia: conductor === 'ia' ? { objetivo: null, espera: 0 } : null, chatarra: false, fuego: 0, humo: 0, policia: !!D.policia, bocina: 0, derrapa: 0 }, extra);
  S.coches.push(c);
  return c;
}
function nuevoPeaton(x, y, banda = null, extra = {}) {
  const p = Object.assign({ id: S.sigId++, x, y, ang: S.az() * 6.283, estilo: estiloPeaton(S.az, banda), banda, estado: 'pasea', vel: 0.45, cuadro: 0, paso: 0, miedo: 0, huyeDe: null, disparoT: 0, vida: 10, muerto: 0, dir: null, espera: 0 }, extra);
  S.peatones.push(p);
  return p;
}

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const acota = (v, a, b) => Math.max(a, Math.min(b, v));
function anguloHacia(a, b) { return Math.atan2(b.y - a.y, b.x - a.x); }
function difAng(a, b) { let d = b - a; while (d > Math.PI) d -= 6.2832; while (d < -Math.PI) d += 6.2832; return d; }
function mensaje(texto, t = 180) { S.mensaje = { texto, t }; }
function rotulo(texto, t = 120, color) { S.rotulo = { texto, t, color }; }
function suma(j, puntos, x, y) {
  const n = puntos * j.mult; j.dinero += n;
  if (x !== undefined) S.fx.push({ tipo: 'dinero', x, y, t: 50, texto: '+' + n });
}
function calor(j, n) { j.calor = Math.min(220, j.calor + n); j.visto = 180; }

// ¿la caja del coche (girada) toca un edificio? mira los cuatro picos y el centro de cada lado
function cocheChoca(c) {
  const D = COCHES[c.tipo], hl = D.l / 2 - 1, ha = D.a / 2 - 1, cs = Math.cos(c.ang), sn = Math.sin(c.ang);
  for (const [fx, fy] of [[hl, ha], [hl, -ha], [-hl, ha], [-hl, -ha], [hl, 0], [-hl, 0], [0, ha], [0, -ha]]) {
    if (solidoPx(c.x + fx * cs - fy * sn, c.y + fx * sn + fy * cs)) return true;
  }
  return false;
}
// ¿el punto (px, py) está dentro del coche?
function puntoEnCoche(c, px, py, holgura = 0) {
  const D = COCHES[c.tipo], dx = px - c.x, dy = py - c.y, cs = Math.cos(c.ang), sn = Math.sin(c.ang);
  const lx = dx * cs + dy * sn, ly = -dx * sn + dy * cs;
  return Math.abs(lx) <= D.l / 2 + holgura && Math.abs(ly) <= D.a / 2 + holgura;
}

/* ---------- el jugador ---------- */
function pasoJugador(j, o) {
  if (j.muerto > 0) { j.muerto--; if (j.muerto === 0) revive(j, 'templo'); return; }
  if (j.baneado > 0) { j.baneado--; if (j.baneado === 0) revive(j, 'comisaria'); return; }
  if (j.disparoT > 0) j.disparoT--;
  if (j.aviso > 0) j.aviso--;
  if (j.rachaT > 0) { j.rachaT--; if (j.rachaT === 0) j.racha = 0; }
  const coche = j.coche !== null ? S.coches.find(c => c.id === j.coche) : null;
  if (coche) pasoConduce(j, coche, o); else pasoAPie(j, o);
  if (o.entrar) entrarSalir(j, coche);
  if (o.disparo && !coche && j.disparoT === 0) { dispara(j); j.disparoT = 14; }
  // el nivel de buscado: sube con el calor, baja cuando los Moderadores te pierden de vista
  if (j.visto > 0) j.visto--; else j.calor = Math.max(0, j.calor - 0.03);
  const b = Math.min(5, Math.floor(j.calor / 40));
  if (b > j.buscado) { play('martillo'); if (b === 1) mensaje(tr('Los Moderadores te buscan.')); }
  j.buscado = b;
}
function pasoAPie(j, o) {
  const v = 1.25, mx = o.mx, my = o.my, m = Math.hypot(mx, my);
  if (m > 0.2) {
    const k = Math.min(1, m); j.ang = Math.atan2(my, mx);
    const nx = j.x + mx / m * v * k, ny = j.y + my / m * v * k;
    if (!solidoPx(nx, j.y) && !cocheEn(nx, j.y, j)) j.x = nx;
    if (!solidoPx(j.x, ny) && !cocheEn(j.x, ny, j)) j.y = ny;
    j.paso += 0.25 * k; j.cuadro = Math.floor(j.paso) & 1;
  }
  // un coche que te lleva por delante
  for (const c of S.coches) {
    if (c.conductor === j.id || c.chatarra) continue;
    const vc = Math.hypot(c.vx, c.vy);
    if (vc > 1.2 && puntoEnCoche(c, j.x, j.y, 2)) { danaJugador(j, 8 + vc * 6, c); j.x += c.vx * 2; j.y += c.vy * 2; }
  }
  // los sitios: el Templo y la cabina
  const Tp = MAPA.lugares.templo;
  if (dist(j, Tp) < Tp.r) { if (!j.enTemplo) ofrecer('templo'); j.enTemplo = 2; } else if (j.enTemplo) j.enTemplo--;
  for (const t of S.telefonos) if (t.suena && dist(j, t) < 12) ofrecer('telefono', t);
}
function cocheEn(x, y, j) { for (const c of S.coches) if (c.conductor !== j.id && puntoEnCoche(c, x, y, 1)) return c; return null; }

function pasoConduce(j, c, o) {
  const D = COCHES[c.tipo];
  let acel = o.acel, giro = o.giro;
  if (o.palanca) {
    // mando del móvil: la palanca dice hacia dónde quieres ir y el coche gira solo hacia allí
    const m = Math.hypot(o.mx, o.my);
    if (m > 0.2) { const d = difAng(c.ang, Math.atan2(o.my, o.mx)); giro = acota(d * 2.5, -1, 1); acel = Math.abs(d) > 2.4 ? -0.8 : Math.min(1, m); } else { acel = 0; giro = 0; }
  }
  fisicaCoche(c, acel, giro, o.freno, true);
  if (c.derrapa > 0.9) play('derrape');
  if (o.claxon && c.bocina === 0) { play('claxon'); c.bocina = 30; asusta(c.x, c.y, 60); }
  // el taller: entras con calor y pagas la pintura
  const Ta = MAPA.lugares.taller;
  if (dist(c, Ta) < Ta.r && Math.hypot(c.vx, c.vy) < 0.6) {
    if (!j.enTaller) {
      if (j.calor > 0 || c.vida < D.vida) {
        if (j.dinero >= PINTURA) { j.dinero -= PINTURA; j.calor = 0; j.buscado = 0; c.color = S.az.elige(COLORES_COCHE); c.vida = D.vida; c.fuego = 0; play('guardado'); mensaje(tr('Pintura nueva: los Moderadores ya no reconocen el coche.')); }
        else mensaje(tr('Taller Pintura Día Uno: 1.000 por pintar. No fiamos.'));
      }
    }
    j.enTaller = 2;
  } else if (j.enTaller) j.enTaller--;
  if (c.vida <= 0 && !c.chatarra) { /* explota en pasoCoches */ }
}
// la física arcade: la velocidad se parte en «hacia delante» y «de lado»; el agarre quita la de lado (menos con el freno de mano)
function fisicaCoche(c, acel, giro, freno, jugador) {
  const D = COCHES[c.tipo], cs = Math.cos(c.ang), sn = Math.sin(c.ang);
  let vf = c.vx * cs + c.vy * sn, vl = -c.vx * sn + c.vy * cs;
  if (acel > 0) vf += D.acel * acel * (jugador ? 1 : 0.8); else if (acel < 0) vf += (vf > 0.3 ? 0.12 : D.acel * 0.6) * acel;
  vf *= 0.985;
  if (Math.abs(vf) < 0.02 && acel === 0) vf = 0;
  const vmax = jugador ? D.vmax : D.vmax * 0.6;
  vf = acota(vf, -vmax * 0.45, vmax);
  if (freno) { vf *= 0.96; vl *= 0.93; } else vl *= 0.72;
  c.derrapa = Math.abs(vl);
  // el giro depende de la velocidad (parado no gira)
  const k = acota(vf / 1.5, -1, 1);
  c.ang += giro * D.giro * k * (freno ? 1.4 : 1);
  const cs2 = Math.cos(c.ang), sn2 = Math.sin(c.ang);
  c.vx = vf * cs2 - vl * sn2; c.vy = vf * sn2 + vl * cs2;
  // mover y chocar con los edificios (se intenta deslizar; si no, rebota)
  const x0 = c.x, y0 = c.y;
  c.x += c.vx; c.y += c.vy;
  if (cocheChoca(c)) {
    c.x = x0 + c.vx; c.y = y0;
    if (cocheChoca(c)) { c.x = x0; c.y = y0 + c.vy; if (cocheChoca(c)) { c.x = x0; c.y = y0; } }
    const v = Math.hypot(c.vx, c.vy);
    if (v > 0.8) { c.vida -= v * 4; if (jugador) { play('choque', Math.min(1, v / 3)); sacude(v * 1.5); } }
    c.vx *= -0.3; c.vy *= -0.3;
    if (c.ia) c.ia.espera = 20;
  }
  if (c.bocina > 0) c.bocina--;
}
function entrarSalir(j, coche) {
  if (coche) {
    // bajar: a un lado del coche, donde no haya pared
    const D = COCHES[coche.tipo];
    if (Math.hypot(coche.vx, coche.vy) > 1.8) return;
    for (const lado of [1, -1]) {
      const x = coche.x - Math.sin(coche.ang) * (D.a / 2 + 6) * lado, y = coche.y + Math.cos(coche.ang) * (D.a / 2 + 6) * lado;
      if (!solidoPx(x, y)) { j.x = x; j.y = y; j.coche = null; coche.conductor = null; coche.vx *= 0.5; coche.vy *= 0.5; play('puerta'); return; }
    }
    return;
  }
  // subir al coche más cercano (si lleva a alguien, lo echas)
  let mejor = null, md = 26;
  for (const c of S.coches) { if (c.chatarra) continue; const d = dist(j, c); if (d < md) { md = d; mejor = c; } }
  if (!mejor) return;
  if (mejor.conductor === 'ia') {
    // el conductor sale corriendo
    const p = nuevoPeaton(mejor.x - Math.sin(mejor.ang) * 12, mejor.y + Math.cos(mejor.ang) * 12, mejor.policia ? 'moderador' : null);
    if (mejor.policia) p.estado = 'ataca'; else { p.estado = 'huye'; p.miedo = 240; p.huyeDe = { x: j.x, y: j.y }; }
    mejor.ia = null; suma(j, PUNTOS.robo, mejor.x, mejor.y - 10); calor(j, mejor.policia ? 60 : 15); play('golpe');
  }
  if (mejor.policia) calor(j, 20);
  mejor.conductor = j.id; mejor.ia = null; j.coche = mejor.id; play('arranque');
  j.enTaller = 2;
}
function dispara(j) {
  const cs = Math.cos(j.ang), sn = Math.sin(j.ang);
  S.balas.push({ x: j.x + cs * 7, y: j.y + sn * 7, dx: cs * 5, dy: sn * 5, t: 40, de: j.id });
  play('pistola'); asusta(j.x, j.y, 90); calor(j, 2);
}
function danaJugador(j, n, culpable) {
  if (j.muerto || j.baneado) return;
  j.vida -= n; play('golpe');
  if (j.vida <= 0) { j.vida = 0; muere(j); }
}
function muere(j) {
  if (j.coche !== null) { const c = S.coches.find(c => c.id === j.coche); if (c) c.conductor = null; j.coche = null; }
  j.muerto = 150; j.vidas--; j.mult = 1; j.calor = 0; j.buscado = 0;
  rotulo(tr('CANCELADO'), 150, 'rojo'); play('fallo'); fallaMision(tr('Te han cancelado.'));
}
function banea(j) {
  if (j.muerto || j.baneado) return;
  if (j.coche !== null) { const c = S.coches.find(c => c.id === j.coche); if (c) c.conductor = null; j.coche = null; }
  j.baneado = 150; j.mult = 1; j.calor = 0; j.buscado = 0;
  rotulo(tr('BANEADO'), 150, 'azul'); play('martillo'); fallaMision(tr('Los Moderadores te han baneado.'));
}
function revive(j, donde) {
  if (j.vidas < 0) return;   // el fin lo mira pantallas.js
  const L = MAPA.lugares[donde]; j.x = L.x; j.y = L.y + 20; j.vida = 100; j.vx = j.vy = 0;
}

/* ---------- los coches: motor de todos, choques entre ellos, atropellos y explosiones ---------- */
function pasoCoches() {
  const j = S.jugadores[0];
  for (const c of S.coches) {
    if (c.chatarra) { if (c.humo > 0) { c.humo--; if (c.humo % 8 === 0) S.fx.push({ tipo: 'humo', x: c.x + S.az.entre(-4, 4), y: c.y, t: 40 }); } continue; }
    if (c.conductor === 'ia') pasoTrafico(c); else if (c.conductor === null) { c.vx *= 0.9; c.vy *= 0.9; if (Math.hypot(c.vx, c.vy) > 0.05) fisicaCoche(c, 0, 0, false, false); }
    // humo y fuego cuando está mal
    const D = COCHES[c.tipo];
    if (c.vida < D.vida * 0.35 && S.tick % 6 === 0) S.fx.push({ tipo: 'humo', x: c.x, y: c.y, t: 30 });
    if (c.vida <= 0) { c.fuego++; if (S.tick % 4 === 0) S.fx.push({ tipo: 'fuego', x: c.x + S.az.entre(-5, 5), y: c.y + S.az.entre(-3, 3), t: 20 }); if (c.fuego > 90) explota(c); }
    // atropellos
    const v = Math.hypot(c.vx, c.vy);
    if (v > 0.9) for (const p of S.peatones) {
      if (p.muerto || !puntoEnCoche(c, p.x, p.y, 1)) continue;
      mataPeaton(p, c.conductor === j.id ? j : null, 'atropello'); p.x += c.vx * 3; p.y += c.vy * 3;
      if (c.conductor === j.id) play('golpe');
    }
  }
  // choques entre coches (círculos): se separan y se reparten el golpe
  for (let i = 0; i < S.coches.length; i++) for (let k = i + 1; k < S.coches.length; k++) {
    const a = S.coches[i], b = S.coches[k], ra = COCHES[a.tipo].l * 0.42, rb = COCHES[b.tipo].l * 0.42;
    const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
    if (d === 0 || d > ra + rb) continue;
    const nx = dx / d, ny = dy / d, sep = (ra + rb - d) / 2;
    a.x -= nx * sep; a.y -= ny * sep; b.x += nx * sep; b.y += ny * sep;
    const vr = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;   // qué tan rápido se acercan
    if (vr > 0) {
      a.vx -= vr * nx * 0.7; a.vy -= vr * ny * 0.7; b.vx += vr * nx * 0.7; b.vy += vr * ny * 0.7;
      if (vr > 0.8) {
        const golpe = vr * 5; a.vida -= golpe; b.vida -= golpe;
        const mio = a.conductor === j.id ? a : b.conductor === j.id ? b : null;
        if (mio) { play('choque', Math.min(1, vr / 3)); sacude(vr * 1.2); const otro = mio === a ? b : a; if (otro.policia) calor(j, 10); if (otro.conductor === 'ia' && otro.ia) otro.ia.espera = 40; }
        else if (vr > 1.5) play('chapa');
      }
    }
    if (a.ia && b.ia && Math.hypot(a.vx, a.vy) < 0.3) a.ia.espera = 10;
  }
}
function explota(c) {
  c.chatarra = true; c.humo = 600; c.vx = c.vy = 0; c.fuego = 0;
  const j = S.jugadores[0];
  if (c.conductor === j.id) { j.coche = null; danaJugador(j, 200, c); }
  if (c.conductor === j.id || c.ultimoGolpe === j.id) { suma(j, PUNTOS.coche, c.x, c.y - 12); calor(j, c.policia ? 40 : 20); }
  c.conductor = null;
  for (let i = 0; i < 10; i++) S.fx.push({ tipo: 'fuego', x: c.x + S.az.entre(-12, 12), y: c.y + S.az.entre(-8, 8), t: 25 + S.az.entero(0, 20) });
  // la onda: hace daño alrededor
  for (const o of S.coches) if (o !== c && !o.chatarra && dist(o, c) < 40) { o.vida -= 40; o.ultimoGolpe = c.ultimoGolpe; }
  for (const p of S.peatones) if (!p.muerto && dist(p, c) < 36) mataPeaton(p, c.ultimoGolpe === j.id ? j : null, 'explosion');
  if (!j.muerto && dist(j, c) < 36 && j.coche === null) danaJugador(j, 60, c);
  play('boom'); asusta(c.x, c.y, 160); sacude(dist(c, j) < 200 ? 7 : 3);
  for (let i = 0; i < 14; i++) S.fx.push({ tipo: 'humo', x: c.x + S.az.entre(-10, 10), y: c.y + S.az.entre(-8, 8), t: 40 + S.az.entero(0, 40) });
}
const FRASES_MIEDO = ['¡MI PASE DE BATALLA!', '¡SOCORRO, UN JUGADOR!', '¡NO ESTOY EN LA BETA!', '¡LLAMAD A UN MODERADOR!', '¡ESTO NO VENÍA EN EL PARCHE!', '¡QUIERO UN REEMBOLSO!', '¡AAAH!', '¡ME DESUSCRIBO!'];
function mataPeaton(p, j, como) {
  if (p.muerto) return;
  p.muerto = 1; p.estado = 'muerto';
  if (j) {
    // la racha: atropellos seguidos valen más
    if (como === 'atropello' && j.rachaT > 0) { j.racha++; if (j.racha >= 3) { rotulo(tr('RACHA x') + j.racha, 60, 'oro'); play('hype'); } } else j.racha = 1;
    j.rachaT = 150;
    suma(j, (como === 'atropello' ? PUNTOS.atropello : PUNTOS.peaton) * Math.max(1, j.racha), p.x, p.y - 8);
    if (S.az() < 0.5) S.fx.push({ tipo: 'frase', x: p.x, y: p.y - 10, t: 70, texto: S.az.elige(FRASES_MIEDO) });
    play('wail');
    calor(j, p.banda === 'moderador' ? 50 : 25);
    if (p.banda && p.banda !== 'moderador') { const z = ZONA[p.banda]; j.respeto[z] = Math.max(0, j.respeto[z] - 6); }
    if (S.az() < 0.4) S.objetos.push({ id: S.sigId++, tipo: 'dinero', x: p.x, y: p.y, t: 0, pequeno: true });
  }
}
// los peatones de alrededor se asustan
function asusta(x, y, r) {
  for (const p of S.peatones) if (!p.muerto && dist(p, { x, y }) < r && p.estado !== 'ataca') {
    if (p.estado !== 'huye' && S.az() < 0.25) S.fx.push({ tipo: 'frase', x: p.x, y: p.y - 10, t: 80, texto: S.az.elige(FRASES_MIEDO) });
    p.estado = 'huye'; p.miedo = 200 + S.az.entero(0, 100); p.huyeDe = { x, y };
  }
}
function sacude(n) { J.sacude = Math.max(J.sacude || 0, n); }

/* ---------- balas, objetos, mensajes ---------- */
function pasoBalas() {
  const j = S.jugadores[0];
  for (const b of S.balas) {
    b.x += b.dx; b.y += b.dy; b.t--;
    if (solidoPx(b.x, b.y)) { b.t = 0; continue; }
    if (b.de === j.id) {
      for (const p of S.peatones) if (!p.muerto && Math.abs(p.x - b.x) < 5 && Math.abs(p.y - b.y) < 5) { p.vida -= 10; if (p.vida <= 0) mataPeaton(p, j, 'bala'); else { p.estado = 'huye'; p.miedo = 200; p.huyeDe = { x: j.x, y: j.y }; } b.t = 0; break; }
      if (b.t) for (const c of S.coches) if (!c.chatarra && puntoEnCoche(c, b.x, b.y)) { c.vida -= 9; c.ultimoGolpe = j.id; if (c.policia) calor(j, 6); if (c.conductor === 'ia' && c.ia) { c.ia.huye = 300; } b.t = 0; play('chapa'); break; }
    } else if (!j.muerto && !j.baneado) {
      if (j.coche === null) { if (Math.abs(j.x - b.x) < 5 && Math.abs(j.y - b.y) < 5) { danaJugador(j, 6); b.t = 0; } }
      else { const c = S.coches.find(c => c.id === j.coche); if (c && puntoEnCoche(c, b.x, b.y)) { c.vida -= 4; b.t = 0; play('chapa'); } }
    }
  }
  S.balas = S.balas.filter(b => b.t > 0);
}
function pasoObjetos() {
  const j = S.jugadores[0];
  if (j.muerto || j.baneado) return;
  const pos = j.coche !== null ? S.coches.find(c => c.id === j.coche) || j : j;
  for (const o of S.objetos) {
    o.t++;
    if (dist(pos, o) > (j.coche !== null ? 14 : 9)) continue;
    o.cogido = true;
    if (o.tipo === 'dinero') { suma(j, o.pequeno ? 50 : PUNTOS.objeto, o.x, o.y - 8); play('moneda'); }
    else if (o.tipo === 'vida') { j.vida = 100; play('heal'); mensaje(tr('Vida al máximo. Microblizz te la cobrará luego.')); }
    else if (o.tipo === 'soborno') { j.calor = 0; j.buscado = 0; play('respeto'); mensaje(tr('Soborno: los Moderadores miran para otro lado.')); }
    else if (o.tipo === 'mochila' || o.tipo === 'disco') { objetoDeMision(o); }
  }
  S.objetos = S.objetos.filter(o => !o.cogido);
}
function pasoFx() {
  for (const f of S.fx) { f.t--; if (f.tipo === 'humo') { f.y -= 0.3; f.x += 0.15; } else if (f.tipo === 'dinero') f.y -= 0.4; }
  S.fx = S.fx.filter(f => f.t > 0);
  if (S.mensaje && --S.mensaje.t <= 0) S.mensaje = null;
  if (S.rotulo && --S.rotulo.t <= 0) S.rotulo = null;
}

/* ---------- un paso de la simulación con las órdenes de cada jugador ---------- */
function pasoSim(ordenes) {
  if (S.pausa) return;
  S.tick++;
  for (const j of S.jugadores) pasoJugador(j, ordenes[j.id] || ORDEN_VACIA);
  pasoCoches();
  pasoPeatones();
  pasoModeradores();
  pasoBalas();
  pasoObjetos();
  pasoMision();
  pasoFx();
  if (S.tick % 30 === 0) { reponeTrafico(); reponeVecinos(); }
}
const ORDEN_VACIA = { mx: 0, my: 0, acel: 0, giro: 0, freno: false, disparo: false, entrar: false, claxon: false, palanca: false };
