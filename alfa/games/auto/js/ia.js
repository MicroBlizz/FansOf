// Fans of Auto · LA GENTE DEL BARRIO: quién vive cerca del jugador (los coches del tráfico y los vecinos aparecen fuera de la
// vista y se quitan al quedar lejos) y cómo andan los peatones: pasean por la acera de casilla en casilla, cruzan solo por los
// pasos de cebra y solo si no viene ningún coche, y cuando se asustan huyen por la acera (a la calzada solo si no hay otra).
// Los que atacan (bandas, Moderadores a pie, conductores enfadados) están en policia.js y se enganchan en MODOS_PEATON.
'use strict';

// cuántos coches y vecinos viven a la vez (menos con el detalle bajo, para móviles flojos)
const TRAFICO_N = () => (AJUSTES.detalle === 'bajo' ? 8 : 14), VECINOS_N = () => (AJUSTES.detalle === 'bajo' ? 18 : 34);
const casillaDe = (x, y) => [Math.floor(x / T), Math.floor(y / T)];
const centroCasilla = (tx, ty) => ({ x: tx * T + T / 2, y: ty * T + T / 2 });

// una casilla de carril (no cruce) a cierta distancia del jugador
function calleLejos(j, dmin, dmax, intentos = 40) {
  for (let i = 0; i < intentos; i++) {
    const tx = S.az.entero(0, MAPA.W - 1), ty = S.az.entero(0, MAPA.H - 1);
    if (!esCarril(tx, ty)) continue;
    const c = centroCasilla(tx, ty), d = dist(c, j), [dx, dy] = carrilEn(tx, ty);
    if (d >= dmin && d <= dmax) return { tx, ty, x: c.x, y: c.y, dx, dy };
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

/* ---------- el tráfico: aparecer y quitarse ---------- */
function cocheDeTrafico(sitio) {
  const tipos = ['sedan', 'sedan', 'compacto', 'compacto', 'deportivo', 'furgon', 'taxi', 'taxi'];
  const z = zonaEn(sitio.tx, sitio.ty), tipo = z === ZONA.granizo && S.az() < 0.3 ? 'granizo' : z === ZONA.animales && S.az() < 0.15 ? 'helados' : S.az.elige(tipos);
  const c = nuevoCoche(tipo, sitio.x, sitio.y, Math.atan2(sitio.dy, sitio.dx), 'ia');
  c.vx = sitio.dx * 1.2; c.vy = sitio.dy * 1.2;
  return c;
}
const hueco = s => !S.coches.some(c => dist(c, s) < 30);
function creaTrafico() {
  const j = S.jugadores[0];
  for (let i = 0; i < TRAFICO_N(); i++) { const s = calleLejos(j, 80, 600); if (s && hueco(s)) cocheDeTrafico(s); }
}
// se quita lo lejano, la chatarra vieja y el coche que lleva mucho atascado fuera de la vista; y se repone fuera de la vista
function reponeTrafico() {
  const j = S.jugadores[0];
  S.coches = S.coches.filter(c => sigueCoche(c, j));
  const n = S.coches.filter(c => c.conductor === 'ia' && c.ia && c.ia.modo === 'trafico').length;
  if (n < TRAFICO_N()) { const s = calleLejos(j, 230, 400); if (s && hueco(s)) cocheDeTrafico(s); }
}
function sigueCoche(c, j) {
  const d = dist(c, j);
  if (c.conductor === j.id) return true;
  if (c.chatarra) return c.humo > 0 || d < 260;
  if (c.ia && c.ia.totalAtasco > 600 && d > 240) return false;
  return d < 460 || (c.conductor === null && !c.policia && d < 700);
}

/* ---------- los vecinos: aparecer y quitarse ---------- */
function bandaDeZona(z) { return z === ZONA.animales ? 'animales' : z === ZONA.granizo ? 'granizo' : 'extractores'; }
function vecinoEn(sitio) {
  const z = zonaEn(sitio.tx, sitio.ty), banda = S.az() < 0.3 ? bandaDeZona(z) : null;
  return nuevoPeaton(sitio.x, sitio.y, banda);
}
function creaVecinos() { const j = S.jugadores[0]; for (let i = 0; i < VECINOS_N(); i++) { const s = aceraLejos(j, 40, 600); if (s) vecinoEn(s); } }
function reponeVecinos() {
  const j = S.jugadores[0];
  S.peatones = S.peatones.filter(p => (p.muerto ? p.muerto < 1800 && dist(p, j) < 320 : dist(p, j) < 420));
  const n = S.peatones.filter(p => !p.muerto && p.banda !== 'moderador').length;
  if (n < VECINOS_N()) { const s = aceraLejos(j, 200, 380); if (s) vecinoEn(s); }
}

/* ---------- cómo anda un peatón ---------- */
const MODOS_PEATON = { pasea: p => pasoPasea(p), cruza: p => pasoCruza(p), huye: p => pasoHuye(p) };
function pasoPeatones() {
  for (const p of S.peatones) {
    if (p.muerto) { p.muerto++; continue; }
    if (p.disparoT > 0) p.disparoT--;
    if (p.banda && p.banda !== 'moderador') decideBanda(p);
    (MODOS_PEATON[p.estado] || MODOS_PEATON.pasea)(p);
  }
}
// va hacia el centro de la casilla p.meta; devuelve true al llegar
function andaHacia(p, v) {
  if (!p.meta) return true;
  const dx = p.meta.x - p.x, dy = p.meta.y - p.y, d = Math.hypot(dx, dy);
  if (d <= v) { p.x = p.meta.x; p.y = p.meta.y; p.meta = null; return true; }
  p.x += dx / d * v; p.y += dy / d * v;
  p.ang = Math.atan2(dy, dx); p.paso += v * 0.3; p.cuadro = Math.floor(p.paso) & 1;
  return false;
}
function vecinasAcera(tx, ty) { return VECINOS4.filter(([ax, ay]) => esAcera(tx + ax, ty + ay)); }
function pasoPasea(p) {
  if (p.espera > 0) { p.espera--; return; }
  if (!andaHacia(p, p.vel)) return;
  const [tx, ty] = casillaDe(p.x, p.y);
  if (!esAcera(tx, ty)) { vuelveAAcera(p, tx, ty); return; }
  if (intentaCruzar(p, tx, ty)) return;
  const ops = vecinasAcera(tx, ty), sigue = ops.find(d => d[0] === p.dir[0] && d[1] === p.dir[1]);
  const sinVolver = ops.filter(d => d[0] !== -p.dir[0] || d[1] !== -p.dir[1]);
  if (!ops.length) return;
  p.dir = sigue && S.az() > 0.12 ? sigue : S.az.elige(sinVolver.length ? sinVolver : ops);
  p.meta = centroCasilla(tx + p.dir[0], ty + p.dir[1]);
  if (S.az() < 0.03) p.espera = S.az.entero(20, 90);
}
// un peatón en la calzada (por ejemplo, al bajar de un coche) busca la acera más cercana
function vuelveAAcera(p, tx, ty) {
  for (let r = 1; r <= 3; r++) for (const [ax, ay] of VECINOS4) if (esAcera(tx + ax * r, ty + ay * r) && pisable(tx + ax, ty + ay)) { p.meta = centroCasilla(tx + ax, ty + ay); return; }
  const libre = VECINOS4.find(([ax, ay]) => pisable(tx + ax, ty + ay));
  if (libre) p.meta = centroCasilla(tx + libre[0], ty + libre[1]);
}
// en el extremo de un paso de cebra: a veces cruza, pero solo si no viene ningún coche
function intentaCruzar(p, tx, ty) {
  const lista = RUTAS.orillasDe.get(idx(tx, ty));
  if (!lista || S.az() > 0.35) return false;
  const o = RUTAS.orillas[S.az.elige(lista)], destino = o.a[0] === tx && o.a[1] === ty ? o.b : o.a;
  if (!pasoLibre(o)) { p.espera = 25; return true; }
  p.estado = 'cruza'; p.destino = centroCasilla(destino[0], destino[1]); p.meta = p.destino;
  return true;
}
// ¿viene algún coche hacia el paso de cebra?
function pasoLibre(o) {
  const m = centroCasilla((o.casillas[0][0] + o.casillas[1][0]) / 2, (o.casillas[0][1] + o.casillas[1][1]) / 2);
  return !S.coches.some(c => {
    const d = dist(c, m), v = Math.hypot(c.vx, c.vy);
    if (c.chatarra || d > 80) return false;
    if (d < 16) return true;
    return v > 0.3 && (m.x - c.x) * c.vx + (m.y - c.y) * c.vy > 0;
  });
}
function pasoCruza(p) {
  if (!andaHacia(p, p.vel * 1.3)) return;
  p.estado = 'pasea'; p.destino = null;
}
// huye por la acera, alejándose de lo que le asustó; a la calzada solo si no hay acera por donde ir
function pasoHuye(p) {
  if (--p.miedo <= 0) { p.estado = 'pasea'; return; }
  if (!andaHacia(p, 1.1)) return;
  const [tx, ty] = casillaDe(p.x, p.y), lejos = d => dist(centroCasilla(tx + d[0], ty + d[1]), p.huyeDe);
  let ops = vecinasAcera(tx, ty);
  if (!ops.length) ops = VECINOS4.filter(([ax, ay]) => pisable(tx + ax, ty + ay));
  if (!ops.length) return;
  p.dir = ops.reduce((m, d) => (lejos(d) > lejos(m) ? d : m));
  p.meta = centroCasilla(tx + p.dir[0], ty + p.dir[1]);
}
