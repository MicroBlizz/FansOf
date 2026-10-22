// Fans of Auto · LA INTELIGENCIA del barrio: los coches del tráfico siguen su carril y en los cruces eligen una salida; los
// peatones pasean por las aceras, cruzan de vez en cuando y huyen de los tiros y los choques; los de las bandas te atacan en
// su zona si te odian; los Moderadores (la policía) aparecen fuera de la vista según tu nivel de buscado y te embisten o te
// banean si te pillan a pie. Solo vive lo que está cerca del jugador: lo lejano se quita y aparece gente nueva.
'use strict';

// cuántos coches y vecinos viven a la vez (menos con el detalle bajo, para móviles flojos)
const TRAFICO_N = () => AJUSTES.detalle === 'bajo' ? 8 : 14, VECINOS_N = () => AJUSTES.detalle === 'bajo' ? 18 : 34;
const casillaDe = (x, y) => [Math.floor(x / T), Math.floor(y / T)];
const centroCasilla = (tx, ty) => ({ x: tx * T + T / 2, y: ty * T + T / 2 });

// una casilla de calle (con carril, no cruce) a cierta distancia del jugador
function calleLejos(j, dmin, dmax, intentos = 40) {
  for (let i = 0; i < intentos; i++) {
    const tx = S.az.entero(0, MAPA.W - 1), ty = S.az.entero(0, MAPA.H - 1), k = (ty * MAPA.W + tx) * 2;
    if (tipoEn(tx, ty) !== TIPO.CALLE || (MAPA.carril[k] === 0 && MAPA.carril[k + 1] === 0)) continue;
    const c = centroCasilla(tx, ty), d = dist(c, j);
    if (d >= dmin && d <= dmax) return { tx, ty, x: c.x, y: c.y, dx: MAPA.carril[k], dy: MAPA.carril[k + 1] };
  }
  return null;
}
function aceraLejos(j, dmin, dmax, intentos = 40) {
  for (let i = 0; i < intentos; i++) {
    const tx = S.az.entero(0, MAPA.W - 1), ty = S.az.entero(0, MAPA.H - 1), t = tipoEn(tx, ty);
    if (t !== TIPO.ACERA && t !== TIPO.HIERBA) continue;
    const c = centroCasilla(tx, ty), d = dist(c, j);
    if (d >= dmin && d <= dmax) return { tx, ty, x: c.x, y: c.y };
  }
  return null;
}

/* ---------- el tráfico ---------- */
function cocheDeTrafico(sitio) {
  const tipos = ['sedan', 'sedan', 'compacto', 'compacto', 'deportivo', 'furgon', 'taxi', 'taxi'];
  const z = zonaEn(sitio.tx, sitio.ty), tipo = z === ZONA.granizo && S.az() < 0.3 ? 'granizo' : z === ZONA.animales && S.az() < 0.15 ? 'helados' : S.az.elige(tipos);
  const c = nuevoCoche(tipo, sitio.x, sitio.y, Math.atan2(sitio.dy, sitio.dx), 'ia');
  c.vx = sitio.dx * 1.2; c.vy = sitio.dy * 1.2;
  return c;
}
function creaTrafico() {
  const j = S.jugadores[0];
  for (let i = 0; i < TRAFICO_N(); i++) { const s = calleLejos(j, 80, 600); if (s && !S.coches.some(c => dist(c, s) < 30)) cocheDeTrafico(s); }
}
function reponeTrafico() {
  const j = S.jugadores[0];
  // se quita lo lejano (y la chatarra vieja) y se repone fuera de la vista
  S.coches = S.coches.filter(c => c.conductor === j.id || dist(c, j) < 460 || (c.conductor === null && !c.chatarra && !c.policia && dist(c, j) < 700));
  S.coches = S.coches.filter(c => !(c.chatarra && c.humo === 0 && dist(c, j) > 260));
  const n = S.coches.filter(c => c.conductor === 'ia' && !c.policia).length;
  if (n < TRAFICO_N()) { const s = calleLejos(j, 230, 400); if (s && !S.coches.some(c => dist(c, s) < 30)) cocheDeTrafico(s); }
}
// ¿hay algo justo delante del coche? (otro coche o el jugador a pie)
function obstaculoDelante(c, alcance) {
  const cs = Math.cos(c.ang), sn = Math.sin(c.ang), j = S.jugadores[0];
  for (const o of S.coches) {
    if (o === c) continue;
    const dx = o.x - c.x, dy = o.y - c.y, f = dx * cs + dy * sn, l = Math.abs(-dx * sn + dy * cs);
    if (f > 0 && f < alcance && l < 11) return o;
  }
  if (j.coche === null && !j.muerto) { const dx = j.x - c.x, dy = j.y - c.y, f = dx * cs + dy * sn, l = Math.abs(-dx * sn + dy * cs); if (f > 0 && f < alcance * 0.8 && l < 10) return j; }
  return null;
}
function pasoTrafico(c) {
  const ia = c.ia, [tx, ty] = casillaDe(c.x, c.y), k = (ty * MAPA.W + tx) * 2, cdx = MAPA.carril[k], cdy = MAPA.carril[k + 1];
  let objetivo = ia.objetivo;
  if (objetivo && dist(c, objetivo) < 9) objetivo = ia.objetivo = null;
  if (!objetivo) {
    if (tipoEn(tx, ty) === TIPO.CALLE && cdx === 0 && cdy === 0) {
      // en un cruce: se elige una salida que no sea volver por donde venía
      const cr = MAPA.cruces.find(q => tx >= q.x && tx <= q.x + 1 && ty >= q.y && ty <= q.y + 1);
      if (cr && cr.salidas.length) {
        const cs = Math.cos(c.ang), sn = Math.sin(c.ang);
        const buenas = cr.salidas.filter(s => s.d[0] * cs + s.d[1] * sn > -0.5);
        const s = S.az.elige(buenas.length ? buenas : cr.salidas), cc = centroCasilla(s.x, s.y);
        objetivo = ia.objetivo = { x: cc.x + s.d[0] * T * 1.2, y: cc.y + s.d[1] * T * 1.2, d: s.d };
      }
    } else if (cdx || cdy) {
      // en su carril: hacia el centro del carril, un poco más adelante
      const cc = centroCasilla(tx, ty);
      objetivo = { x: (cdx ? c.x : cc.x) + cdx * 22, y: (cdy ? c.y : cc.y) + cdy * 22 };
    } else {
      // fuera de la calle (lo han empujado): busca la calle más cercana
      let mejor = null, md = 1e9;
      for (let j2 = -3; j2 <= 3; j2++) for (let i2 = -3; i2 <= 3; i2++) { const k2 = ((ty + j2) * MAPA.W + tx + i2) * 2; if (tipoEn(tx + i2, ty + j2) === TIPO.CALLE && (MAPA.carril[k2] || MAPA.carril[k2 + 1])) { const cc = centroCasilla(tx + i2, ty + j2), d = dist(c, cc); if (d < md) { md = d; mejor = cc; } } }
      objetivo = mejor ? ia.objetivo = { x: mejor.x, y: mejor.y } : { x: c.x + Math.cos(c.ang) * 20, y: c.y + Math.sin(c.ang) * 20 };
    }
  }
  const d = difAng(c.ang, anguloHacia(c, objetivo));
  let giro = acota(d * 3, -1, 1), acel = 1;
  const v = Math.hypot(c.vx, c.vy);
  if (Math.abs(d) > 1.0) acel = 0.4;
  const obs = obstaculoDelante(c, 26 + v * 12);
  if (ia.huye > 0) { ia.huye--; acel = 1; }
  else if (obs) { acel = v > 0.4 ? -1 : 0; if (obs.conductor === S.jugadores[0].id && S.az() < 0.01) { play('claxon'); } }
  if (ia.espera > 0) { ia.espera--; acel = Math.min(acel, 0); }
  // atascado: marcha atrás un momento
  if (v < 0.15 && acel > 0) { ia.atasco = (ia.atasco || 0) + 1; if (ia.atasco > 90) { acel = -0.6; giro = -giro; if (ia.atasco > 150) { ia.atasco = 0; ia.objetivo = null; } } } else ia.atasco = 0;
  fisicaCoche(c, acel, giro, false, false);
}

/* ---------- los vecinos ---------- */
function bandaDeZona(z) { return z === ZONA.animales ? 'animales' : z === ZONA.granizo ? 'granizo' : 'extractores'; }
function vecinoEn(sitio) {
  const z = zonaEn(sitio.tx, sitio.ty), banda = S.az() < 0.3 ? bandaDeZona(z) : null;
  const p = nuevoPeaton(sitio.x, sitio.y, banda);
  p.dir = S.az.elige([[1, 0], [-1, 0], [0, 1], [0, -1]]);
  return p;
}
function creaVecinos() { const j = S.jugadores[0]; for (let i = 0; i < VECINOS_N(); i++) { const s = aceraLejos(j, 40, 600); if (s) vecinoEn(s); } }
function reponeVecinos() {
  const j = S.jugadores[0];
  S.peatones = S.peatones.filter(p => (p.muerto ? p.muerto < 900 && dist(p, j) < 300 : dist(p, j) < 420));
  const n = S.peatones.filter(p => !p.muerto && p.banda !== 'moderador').length;
  if (n < VECINOS_N()) { const s = aceraLejos(j, 200, 380); if (s) vecinoEn(s); }
}
function pasoPeatones() {
  const j = S.jugadores[0], pj = j.coche !== null ? (S.coches.find(c => c.id === j.coche) || j) : j;
  for (const p of S.peatones) {
    if (p.muerto) { p.muerto++; continue; }
    if (p.disparoT > 0) p.disparoT--;
    // ¿esta banda te odia? (en su zona y con poco respeto)
    if (p.banda && p.banda !== 'moderador' && p.estado !== 'huye') {
      const z = ZONA[p.banda], odia = j.respeto[z] < 25 && !j.muerto && !j.baneado;
      if (odia && dist(p, pj) < 150 && zonaEn(...casillaDe(p.x, p.y)) === z) p.estado = 'ataca'; else if (p.estado === 'ataca' && (!odia || dist(p, pj) > 220)) p.estado = 'pasea';
    }
    if (p.estado === 'ataca') { pasoAtaca(p, pj, j); continue; }
    if (p.estado === 'huye') {
      p.miedo--; if (p.miedo <= 0) { p.estado = 'pasea'; p.dir = S.az.elige([[1, 0], [-1, 0], [0, 1], [0, -1]]); continue; }
      const a = anguloHacia(p.huyeDe, p) + Math.sin(S.tick * 0.05 + p.id) * 0.6;
      mueve(p, Math.cos(a), Math.sin(a), 1.1);
      continue;
    }
    // paseo por las aceras: al llegar al centro de una casilla decide si sigue o gira
    if (p.espera > 0) { p.espera--; continue; }
    const [tx, ty] = casillaDe(p.x, p.y), cc = centroCasilla(tx, ty);
    if (Math.abs(p.x - cc.x) < 0.6 && Math.abs(p.y - cc.y) < 0.6) {
      p.x = cc.x; p.y = cc.y;
      const sig = [tx + p.dir[0], ty + p.dir[1]], tSig = tipoEn(...sig), enCalle = tipoEn(tx, ty) === TIPO.CALLE;
      const vale = ([x, y]) => { const t = tipoEn(x, y); return t === TIPO.ACERA || t === TIPO.HIERBA; };
      if (enCalle ? !pisable(...sig) : (!vale(sig) || S.az() < 0.12)) {
        // girar hacia otra acera (o cruzar la calle de vez en cuando)
        const ops = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(d => vale([tx + d[0], ty + d[1]]));
        const cruzar = !enCalle && tSig === TIPO.CALLE && S.az() < 0.25;
        if (!cruzar && ops.length) p.dir = S.az.elige(ops); else if (!pisable(...sig)) p.dir = [-p.dir[0], -p.dir[1]];
        if (S.az() < 0.15) p.espera = S.az.entero(20, 90);
      }
    }
    mueve(p, p.dir[0], p.dir[1], p.vel);
  }
}
function mueve(p, dx, dy, v) {
  const nx = p.x + dx * v, ny = p.y + dy * v;
  if (!solidoPx(nx, p.y)) p.x = nx; else if (p.estado === 'huye') p.huyeDe = { x: p.x + dx * 30, y: p.y + S.az.entre(-30, 30) };
  if (!solidoPx(p.x, ny)) p.y = ny;
  p.ang = Math.atan2(dy, dx); p.paso += v * 0.3; p.cuadro = Math.floor(p.paso) & 1;
  // no se pisan con el jugador a pie
  const j = S.jugadores[0];
  if (j.coche === null && Math.abs(j.x - p.x) < 6 && Math.abs(j.y - p.y) < 6) { p.x += p.x >= j.x ? 1 : -1; }
}
function pasoAtaca(p, pj, j) {
  const d = dist(p, pj);
  if (j.muerto || j.baneado) { p.estado = 'pasea'; return; }
  if (d > 70) mueve(p, Math.cos(anguloHacia(p, pj)), Math.sin(anguloHacia(p, pj)), 0.8);
  else p.ang = anguloHacia(p, pj);
  if (d < 120 && p.disparoT === 0) {
    const a = anguloHacia(p, pj) + S.az.entre(-0.12, 0.12);
    S.balas.push({ x: p.x + Math.cos(a) * 6, y: p.y + Math.sin(a) * 6, dx: Math.cos(a) * 4, dy: Math.sin(a) * 4, t: 45, de: 'ia' });
    p.disparoT = p.banda === 'moderador' ? 50 : 70; if (d < 200) play('pistola');
  }
  // un Moderador a pie que te alcanza te banea
  if (p.banda === 'moderador' && j.coche === null && d < 9) banea(j);
}

/* ---------- los Moderadores ---------- */
function pasoModeradores() {
  const j = S.jugadores[0], pj = j.coche !== null ? (S.coches.find(c => c.id === j.coche) || j) : j;
  const coches = S.coches.filter(c => c.policia && c.conductor === 'ia' && !c.chatarra);
  const quiere = j.muerto || j.baneado ? 0 : Math.min(4, j.buscado);
  if (coches.length < quiere && S.tick % 45 === 0) {
    const s = calleLejos(j, 220, 360);
    if (s) { const c = nuevoCoche('moderador', s.x, s.y, Math.atan2(s.dy, s.dx), 'ia'); c.ia.sirena = 0; }
  }
  if (j.buscado >= 3 && S.tick % 120 === 0 && S.peatones.filter(p => p.banda === 'moderador' && !p.muerto).length < j.buscado - 1) {
    const s = aceraLejos(j, 120, 220); if (s) { const p = nuevoPeaton(s.x, s.y, 'moderador'); p.estado = 'ataca'; p.vida = 20; }
  }
  for (const c of coches) {
    const ia = c.ia;
    if (j.buscado === 0 || j.muerto || j.baneado) {
      // sin nada que perseguir vuelven al tráfico normal (y se van lejos)
      if (dist(c, pj) > 240) { c.policia = false; c.tipo = 'moderador'; }
      pasoTrafico(c); continue;
    }
    const d = dist(c, pj);
    if (d < 230) { j.visto = 180; if (S.tick % 90 === 0) play('sirena'); }
    // va a por ti: apunta un poco por delante de donde vas
    const obj = { x: pj.x + (pj.vx || 0) * 12, y: pj.y + (pj.vy || 0) * 12 };
    const da = difAng(c.ang, anguloHacia(c, obj)), v = Math.hypot(c.vx, c.vy);
    let giro = acota(da * 3, -1, 1), acel = 1;
    if (Math.abs(da) > 1.4 && v > 1) acel = -0.5;
    if (j.coche === null) {
      // a pie: frena al llegar y te banea
      if (d < 40) acel = v > 0.6 ? -1 : 0.2;
      if (d < 22 && v < 1.4) { banea(j); continue; }
    }
    // no se empotra en las paredes sin parar: si se atasca, da marcha atrás
    if (v < 0.15 && acel > 0) { ia.atasco = (ia.atasco || 0) + 1; if (ia.atasco > 60) { acel = -0.7; giro = -giro; if (ia.atasco > 120) ia.atasco = 0; } } else ia.atasco = 0;
    if (ia.espera > 0) { ia.espera--; acel = Math.min(acel, 0); }
    fisicaCoche(c, acel, giro, false, false);
  }
}
