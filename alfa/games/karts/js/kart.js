// Fans of Karts (prototipo) · EL KART: cómo se conduce. Cada kart tiene hacia dónde mira (ang) y hacia dónde se mueve (dir): casi siempre
// coinciden, pero en un derrape o en un charco el morro gira antes y el kart patina. Aquí están la aceleración, el giro, el bote y el
// derrape con miniturbo, lo que hace cada suelo (moqueta, barro, turbo, rampa, vacío), los muros, los golpes y por dónde va de la vuelta.
// Todas las cifras de la conducción están en AJ. Los mandos de cada kart (k.c) los ponen controles.js (jugador) o rivales.js (máquina).
'use strict';

const AJ = {
  vBase: 94, vPunto: 3.6,          // velocidad punta (unidades por segundo): la base y lo que suma cada punto de «velocidad»
  aBase: 50, aPunto: 9,            // aceleración
  gBase: 2.0, gPunto: 0.15,        // giro (vueltas… bueno, radianes por segundo) a poca velocidad; a tope gira un 30 % menos
  freno: 150, roce: 28, atras: 28,
  moneda: 0.012, maxMonedas: 10,   // cada moneda, un 1,2 % más de velocidad punta
  lento: 0.5, barro: 0.42,         // lo que queda de velocidad en moqueta/hierba y en barro
  turbo: 1.34, turboAcel: 240,
  gravedad: 300, bote: 36, rampa: 104,
  radio: 4.2,
  miniturbo: [0.7, 1.55],          // segundos de derrape para las chispas azules y para las naranjas
};

function creaKart(piloto, esJugador, g) {   // g: su casilla de salida { x, y, ang }
  return {
    piloto, fig: esJugador && !PANT.auto ? figuraJugador(piloto.id) : figuraDe(piloto.id), esJugador, ia: null,
    vmax: AJ.vBase + piloto.vel * AJ.vPunto, acel: AJ.aBase + piloto.ace * AJ.aPunto, giroMax: AJ.gBase + piloto.man * AJ.gPunto, masa: 0.7 + piloto.peso * 0.16,
    x: g.x, y: g.y, z: 0, vz: 0, ang: g.ang, dir: g.ang, angVis: g.ang, v: 0, giro: 0,
    derrape: 0, tDerrape: 0, nivel: 0, botado: false, tTurbo: 0, fTurbo: 1, tResbala: 0, giroRes: 1,
    estado: 'normal', tEstado: 0, tInmune: 0, tNerf: 0, tCola: 0, tDron: 0, tam: 1, vueltaTrompo: 0,
    monedas: 0, objeto: null, usos: 0, tRuleta: 0,
    idx: 0, lat: 0, avance: 0, vuelta: 0, puesto: 0, fin: 0, puestoFinal: 0, mejorVuelta: 0, tVuelta: 0,
    suelo: S_PISTA, tAtasco: 0, tContra: 0, tChoque: 0,
    c: { giro: 0, gas: false, freno: false, salta: false, derrapa: false, usa: false },
  };
}
// el sonido de lo que le pasa a un kart solo se oye si es el del jugador
const suena = (k, nombre, ...a) => { if (k.esJugador) play(nombre, ...a); };

// ---------- por dónde va: el trozo de vía más cercano, buscando solo alrededor de donde iba (así no salta a otro tramo que pase cerca) ----------
function sigueVia(k) {
  const P = PISTA, N = P.N, i0 = Math.floor(k.idx);
  let mejor = 1e9, mi = i0, mt = 0, ml = 0;
  const lejos = k.suelo === S_ATAJO || k.suelo === S_PUENTE ? 80 : 14;      // por un atajo se puede salir muy por delante
  for (let d = -5; d <= lejos; d++) {
    const i = (((i0 + d) % N) + N) % N, a = P.via[i], b = P.via[(i + 1) % N], dx = b.x - a.x, dy = b.y - a.y;
    const t = limita(((k.x - a.x) * dx + (k.y - a.y) * dy) / (dx * dx + dy * dy || 1), 0, 1), ex = k.x - a.x - dx * t, ey = k.y - a.y - dy * t, q = ex * ex + ey * ey;
    if (q < mejor) { mejor = q; mi = i0 + d; mt = t; ml = (ex * dy - ey * dx) > 0 ? -1 : 1; }
  }
  const nuevo = mi + mt;
  k.avance += nuevo - k.idx;
  k.idx = ((nuevo % N) + N) % N;
  k.lat = Math.sqrt(mejor) * ml;       // a cuántas unidades del centro (positivo = a la derecha de la marcha)
}

// ---------- turbos, caídas y golpes ----------
function daTurbo(k, t, f, patada) {
  k.tTurbo = Math.max(k.tTurbo, t); k.fTurbo = f;
  if (patada && k.v < k.vmax) k.v = k.vmax;
  suena(k, 'turbo');
}
function cae(k) {
  k.estado = 'cae'; k.tEstado = 0.85; k.derrape = 0; k.nivel = 0; k.tTurbo = 0;
  suena(k, 'caida');
  if (k.esJugador) { aviso('¡AL VACÍO!', 'Su caída es importante para nosotros.', '#22e3ff'); comenta('Soporte técnico: «Tiempo de espera estimado: Soon™».'); }
}
// lo devuelve a la pista por donde se salió, parado, con el dron de soporte encima
function rescata(k) {
  const P = PISTA, N = P.N, ok = i => { const s = supEn(P, P.via[i].x, P.via[i].y); return s === S_PISTA || s === S_TURBO || s === S_BORDILLO; };
  // un punto de la vía «sano»: ni su centro ni sus lados son hueco
  const sano = i => { const v = P.via[i], q = v.ancho * 0.3; return ok(i) && supEn(P, v.x - v.ty * q, v.y + v.tx * q) !== S_VACIO && supEn(P, v.x + v.ty * q, v.y - v.tx * q) !== S_VACIO; };
  let i = Math.floor(k.idx) % N, n = 0, ultimo = -1;
  // si hay un hueco justo delante (se ha caído en él, o al lado), sale por el otro lado: si no, volvería a caer una y otra vez
  for (let d = 0; d <= 14; d++) if (!sano((i + d) % N)) ultimo = d;
  if (ultimo >= 0) {
    let j = (i + ultimo + 1) % N;
    while (!sano(j) && n++ < 12) j = (j + 1) % N;
    if (sano(j)) i = (j + 1) % N; else { n = 0; while (!ok(i) && n++ < 80) i = (i - 1 + N) % N; }
  } else if (!ok(i)) { while (!ok(i) && n++ < 80) i = (i - 1 + N) % N; }
  const v = P.via[i], antes = k.idx;
  k.x = v.x; k.y = v.y; k.ang = k.dir = k.angVis = v.ang; k.v = 0; k.z = 13; k.vz = 0; k.tam = 1; k.estado = 'normal'; k.tInmune = 1.6; k.tDron = 1.1; k.derrape = 0; k.tTurbo = 0; k.tAtasco = 0;
  let d = i - antes; if (d > N / 2) d -= N; else if (d < -N / 2) d += N;
  k.avance += d; k.idx = i;
  pierdeMonedas(k, 2);
  if (k.esJugador) VISTA.listo = false;
}
function pierdeMonedas(k, n) {
  n = Math.min(n, k.monedas); k.monedas -= n;
  for (let i = 0; i < n * 3; i++) chispa(k.x, k.y, 4, azar(-40, 40), azar(-40, 40), azar(50, 110), 0.7, i % 3 ? '#ffcb3d' : '#fff3a0', 2.2, 260);
}
// le han dado: 'trompo' (Parche), 'nerf' (trompo corto y encoge), 'parado' (mantenimiento) o 'cola' (casi parado un rato)
function golpea(k, tipo, autor) {
  if (k.tInmune > 0 || k.estado === 'cae' || k.fin) return false;
  k.derrape = 0; k.nivel = 0; k.tTurbo = 0;
  if (tipo === 'trompo' || tipo === 'nerf') {
    k.estado = 'trompo'; k.tEstado = tipo === 'nerf' ? 0.75 : 1.1; k.vueltaTrompo = 0; k.tInmune = k.tEstado + 1.2;
    if (tipo === 'nerf') k.tNerf = 4.5;
    pierdeMonedas(k, 3);
    suena(k, tipo === 'nerf' ? 'nerfeado' : 'trompo');
  } else if (tipo === 'parado') { k.estado = 'parado'; k.tEstado = 1.6; k.tInmune = 2.6; suena(k, 'deny'); }
  else if (tipo === 'cola') { k.tCola = 3; k.tInmune = 3.6; suena(k, 'deny'); }
  return true;
}

// ---------- contra un muro: el kart resbala a lo largo y rebota un poco hacia la pista ----------
function chocaMuro(k, qx, qy) {
  const P = PISTA, xi = limita(qx | 0, 0, TM - 1), yi = limita(qy | 0, 0, TM - 1), i = P.campoI[yi * TM + xi], a = P.via[i], b = P.via[(i + 1) % P.N];
  const dx = b.x - a.x, dy = b.y - a.y, t = limita(((k.x - a.x) * dx + (k.y - a.y) * dy) / (dx * dx + dy * dy || 1), 0, 1);
  let nx = a.x + dx * t - k.x, ny = a.y + dy * t - k.y; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;     // hacia el centro de la pista
  const s = k.v >= 0 ? 1 : -1;
  let vx = Math.cos(k.dir) * k.v, vy = Math.sin(k.dir) * k.v;
  const vn = vx * nx + vy * ny;
  if (vn < 0) { vx -= 1.3 * vn * nx; vy -= 1.3 * vn * ny; }
  const golpe = -vn, vel = Math.hypot(vx, vy) * 0.96;
  if (vel > 1) { k.dir = Math.atan2(vy * s, vx * s); k.v = vel * s; }
  k.x += nx * 0.9; k.y += ny * 0.9;
  k.ang += difAng(k.ang, k.dir) * 0.3;
  if (golpe > 30) {
    k.v *= 0.78; k.derrape = 0; k.nivel = 0;
    if (k.tChoque <= 0) { suena(k, 'choque'); for (let j = 0; j < 5; j++) chispa(k.x - nx * 4, k.y - ny * 4, 3, azar(-30, 30) + nx * 30, azar(-30, 30) + ny * 30, azar(20, 70), 0.35, '#fff6d8', 1.6); }
    k.tChoque = 0.3;
  }
}
// dos karts que se tocan se separan y se empujan (el que pesa más, empuja más)
function chocanKarts(a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, R = AJ.radio * (a.tam + b.tam), d2 = dx * dx + dy * dy;
  if (d2 > R * R || d2 < 1e-6 || a.z > 5 || b.z > 5 || a.estado === 'cae' || b.estado === 'cae') return;
  const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, ma = a.masa * a.tam, mb = b.masa * b.tam, pen = R - d;
  a.x -= nx * pen * mb / (ma + mb); a.y -= ny * pen * mb / (ma + mb); b.x += nx * pen * ma / (ma + mb); b.y += ny * pen * ma / (ma + mb);
  let avx = Math.cos(a.dir) * a.v, avy = Math.sin(a.dir) * a.v, bvx = Math.cos(b.dir) * b.v, bvy = Math.sin(b.dir) * b.v;
  const rel = (bvx - avx) * nx + (bvy - avy) * ny;
  if (rel >= 0) return;
  const j = -1.45 * rel / (1 / ma + 1 / mb);
  avx -= (j / ma) * nx; avy -= (j / ma) * ny; bvx += (j / mb) * nx; bvy += (j / mb) * ny;
  for (const [k, vx, vy] of [[a, avx, avy], [b, bvx, bvy]]) {
    const vel = Math.hypot(vx, vy);
    if (vel > 6 && k.v >= 0) { k.dir = Math.atan2(vy, vx); k.v = vel; k.ang += difAng(k.ang, k.dir) * 0.25; }
  }
  if (-rel > 22) { suena(a, 'golpe'); suena(b, 'golpe'); }
}

// ---------- un paso de un kart (dt = 1/60 s) ----------
function mueveKart(k, dt) {
  const P = PISTA, c = k.c;
  if (k.tInmune > 0) k.tInmune -= dt;
  if (k.tNerf > 0) k.tNerf -= dt;
  if (k.tCola > 0) k.tCola -= dt;
  if (k.tDron > 0) k.tDron -= dt;
  if (k.tTurbo > 0) k.tTurbo -= dt;
  if (k.tResbala > 0) k.tResbala -= dt;
  if (k.tChoque > 0) k.tChoque -= dt;
  if (k.estado === 'cae') {      // cayendo al vacío: se hace pequeño y, al acabar, el dron lo devuelve
    k.tEstado -= dt; k.z -= 34 * dt; k.tam = Math.max(0.15, k.tam - dt); k.v *= 0.93;
    k.x += Math.cos(k.dir) * k.v * dt; k.y += Math.sin(k.dir) * k.v * dt; k.angVis += dt * 7;
    if (k.tEstado <= 0) rescata(k);
    return;
  }
  k.tam = acerca(k.tam, k.tNerf > 0 ? 0.62 : 1, dt * 2.5);
  const enSuelo = k.z <= 0, sup = enSuelo ? supEn(P, k.x, k.y) : S_PISTA;
  k.suelo = sup;
  if (enSuelo && sup === S_VACIO) { cae(k); return; }
  let puede = true;
  if (k.estado !== 'normal') {
    puede = false; k.tEstado -= dt;
    if (k.estado === 'trompo') k.vueltaTrompo += dt * 13;
    if (k.tEstado <= 0) { k.estado = 'normal'; k.vueltaTrompo = 0; }
  }
  // --- cuánto puede correr según lo que pisa ---
  const turbo = k.tTurbo > 0;
  let vmax = k.vmax * (1 + AJ.moneda * k.monedas), agarre = 9.5;
  if (k.ia) vmax *= k.ia.factor;
  if (k.tNerf > 0) vmax *= 0.74;
  if (k.tCola > 0) vmax *= 0.4;
  if (sup === S_LENTO) vmax *= turbo ? 0.82 : AJ.lento;
  else if (sup === S_BARRO) { vmax *= turbo ? 0.78 : AJ.barro; agarre = 5; }
  else if (sup === S_CHARCO) { if (k.tResbala <= 0 && k.v > 35 && k.tInmune <= 0) { k.tResbala = 0.7; k.giroRes = Math.random() < 0.5 ? -1 : 1; k.derrape = 0; suena(k, 'resbala'); } }
  else if (sup === S_ATAJO) vmax *= turbo ? 0.96 : 0.6;                                // el atajo es terreno malo: sin turbo no compensa tanto
  else if (sup === S_HIELO) agarre = turbo ? 2.4 : 1.5;                                 // en el hielo el kart va adonde quiere él
  else if (sup === S_CORRIENTE) empujaCorriente(k, P, dt);
  else if (sup === S_TURBO) { if (k.tTurbo < 0.6) daTurbo(k, 0.95, AJ.turbo, true); }
  else if (sup === S_RAMPA && k.v > 12) { k.vz = AJ.rampa; k.z = 0.01; k.botado = false; k.v = Math.max(k.v, 108); k.tTurbo = Math.max(k.tTurbo, 0.5); k.fTurbo = 1.2; suena(k, 'jump'); }   // la rampa lanza: el salto siempre llega al otro lado
  if (turbo) vmax *= k.fTurbo;
  if (k.tResbala > 0) { agarre = 1.2; k.ang += k.giroRes * 1.5 * dt; }
  const F = P.def.fisica;      // cada pista se conduce distinta: hielo, agua, asfalto mojado, viento… (pista-ambiente.js)
  if (F) { agarre *= F.agarre || 1; vmax *= F.vel || 1; if (F.viento && enSuelo) soplaViento(k, P, F.viento, dt); }
  // --- el volante ---
  k.giro = acerca(k.giro, puede ? c.giro : 0, dt * 6.5);
  let w = k.giroMax * (1 - 0.3 * Math.min(1, Math.abs(k.v) / k.vmax)) * Math.min(1, Math.abs(k.v) / 20);
  if (!enSuelo) w *= 0.55;
  if (puede && c.salta && enSuelo) { k.vz = AJ.bote; k.z = 0.01; k.botado = true; suena(k, 'bote'); }
  if (k.derrape) {
    // derrapando gira solo hacia ese lado; el volante cierra o abre la curva. Cuanto más se cierra, antes carga el miniturbo.
    const s = k.derrape, mando = k.giro * s;
    k.ang += s * w * (0.72 + 0.6 * mando) * dt;
    agarre = Math.min(agarre, 2.7);
    k.tDerrape += dt * (0.6 + 0.7 * Math.max(0, mando));
    const nv = k.tDerrape > AJ.miniturbo[1] ? 2 : k.tDerrape > AJ.miniturbo[0] ? 1 : 0;
    if (nv > k.nivel) { k.nivel = nv; suena(k, 'chispa', nv); }
    if (!c.derrapa || k.v < 36 || !puede) {
      if (!c.derrapa && k.nivel > 0 && puede) { daTurbo(k, k.nivel === 2 ? 1.05 : 0.6, 1.3, false); suena(k, 'miniturbo'); }
      k.derrape = 0; k.nivel = 0;
    }
  } else k.ang += k.giro * w * dt * (k.v < 0 ? -1 : 1);
  if (enSuelo) k.dir += difAng(k.dir, k.ang) * Math.min(1, agarre * dt);
  // --- acelerar y frenar ---
  if (k.estado === 'parado') k.v = acerca(k.v, 0, 320 * dt);
  else if (k.estado === 'trompo') k.v = Math.max(Math.min(k.v, 14), k.v - 150 * dt);
  else if (c.freno && enSuelo) k.v = k.v > 0 ? Math.max(0, k.v - AJ.freno * dt) : Math.max(-AJ.atras, k.v - 70 * dt);
  else if (c.gas) { if (k.v < vmax) k.v = Math.min(vmax, k.v + (turbo ? AJ.turboAcel : k.acel * (1.08 - 0.8 * Math.max(0, k.v) / vmax)) * dt); }
  else k.v = acerca(k.v, 0, AJ.roce * dt);
  if (k.v > vmax && enSuelo) k.v = Math.max(vmax, k.v - (sup === S_LENTO || sup === S_BARRO ? 200 : 60) * dt);      // en el aire no se frena: el salto llega siempre
  // --- avanzar; los muros se miran con el morro (o con la cola, marcha atrás) ---
  const cd = Math.cos(k.dir), sd = Math.sin(k.dir), nx = k.x + cd * k.v * dt, ny = k.y + sd * k.v * dt, s = k.v >= 0 ? 3.6 : -3.6;
  if (ES_MURO(supEn(P, nx + cd * s, ny + sd * s)) || ES_MURO(supEn(P, nx, ny))) chocaMuro(k, nx + cd * s, ny + sd * s);
  else { k.x = nx; k.y = ny; }
  // los adornos de fuera de la pista son sólidos
  for (const o of P.cosas) {
    if (!o.r) continue;
    const dx = k.x - o.x, dy = k.y - o.y, R = o.r + AJ.radio * 0.8;
    if (dx > R || dx < -R || dy > R || dy < -R) continue;
    const d2 = dx * dx + dy * dy;
    if (d2 >= R * R || d2 < 1e-6) continue;
    if (o.muerde) { if (golpea(k, 'trompo', null)) suena(k, 'golpe'); continue; }      // tiburones, bichos, coches…: no se apartan, te dan
    const d = Math.sqrt(d2), ux = dx / d, uy = dy / d, vn = Math.cos(k.dir) * k.v * ux + Math.sin(k.dir) * k.v * uy;
    k.x = o.x + ux * R; k.y = o.y + uy * R;
    if (vn < -12) { k.v *= 0.55; k.derrape = 0; k.nivel = 0; suena(k, 'choque'); }
  }
  // --- el bote, el salto de las rampas y la caída del dron ---
  if (k.z > 0) {
    k.vz -= AJ.gravedad * (k.botado ? 1 : P.def.fisica && P.def.fisica.gravedad || 1) * dt; k.z += k.vz * dt;      // bajo el agua se cae más despacio
    if (k.z <= 0) {
      k.z = 0; k.vz = 0;
      if (k.botado) {   // al caer de un bote con el botón apretado y el volante girado, empieza el derrape
        k.botado = false;
        if (puede && c.derrapa && Math.abs(c.giro) > 0.25 && k.v > 42 && !k.derrape) { k.derrape = c.giro > 0 ? 1 : -1; k.tDerrape = 0; k.nivel = 0; }
      } else suena(k, 'aterriza');
    }
  }
  k.angVis = k.ang + k.derrape * 0.42 + k.vueltaTrompo + (k.tResbala > 0 ? Math.sin(k.tResbala * 22) * 0.35 : 0);
  sigueVia(k);
  humos(k, sup, turbo);
}

// ---------- las chispas del derrape, el fuego del turbo y el polvo de la moqueta (solo cerca de la cámara) ----------
function humos(k, sup, turbo) {
  const dx = k.x - CAM.x, dy = k.y - CAM.y;
  if (dx * dx + dy * dy > 62500 || k.z > 1) return;
  const ca = Math.cos(k.ang), sa = Math.sin(k.ang), lado = Math.random() < 0.5 ? -3.6 : 3.6, rx = k.x - ca * 5 - sa * lado, ry = k.y - sa * 5 + ca * lado;
  if (k.derrape && Math.random() < 0.7) {
    const col = k.nivel === 2 ? (Math.random() < 0.5 ? '#ff8a1f' : '#ffe14d') : k.nivel === 1 ? (Math.random() < 0.5 ? '#22e3ff' : '#e8fbff') : colorHumo(k);
    chispa(rx, ry, 0.5, -ca * 20 + azar(-18, 18), -sa * 20 + azar(-18, 18), azar(20, 60), k.nivel ? 0.32 : 0.22, col, k.nivel ? 1.5 : 1.2, 200);
  }
  if (turbo && Math.random() < 0.8) chispa(k.x - ca * 6, k.y - sa * 6, 2.6, -ca * 50 + azar(-12, 12), -sa * 50 + azar(-12, 12), azar(0, 30), 0.25, Math.random() < 0.5 ? '#ff8a1f' : '#ffe14d', 2.4, 60);
  if ((sup === S_LENTO || sup === S_BARRO) && Math.abs(k.v) > 25 && Math.random() < 0.5) chispa(rx, ry, 0.5, azar(-14, 14), azar(-14, 14), azar(20, 45), 0.4, PISTA.def.polvo || '#c9c2b0', 2, 90);
}
