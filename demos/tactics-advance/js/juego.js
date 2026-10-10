// Fans of Tactics Advance (prototipo) · EL JUEGO: el estado de la batalla (J), los turnos (tuyo y de Microblizz), lo que pasa al
// tocar (elegir, mover, atacar, técnicas), las animaciones de cada acción y el final. Las animaciones son esperas encadenadas.
'use strict';

const J = { unidades: [], marcas: {}, bocadillos: [], dichos: new Set() };
const TWEENS = [];
let GEN = 0;   // cada partida nueva deja tiradas las animaciones de la anterior
const espera = (dura, paso) => new Promise(res => TWEENS.push({ t: 0, dura, paso, res, gen: GEN }));
function avanzaTweens(dt) {
  for (const w of TWEENS.slice()) {
    w.t += dt; const k = Math.min(1, w.t / w.dura);
    if (w.paso) w.paso(k);
    if (k >= 1) { TWEENS.splice(TWEENS.indexOf(w), 1); if (w.gen === GEN) w.res(); }
  }
}

/* ---------- empezar una batalla ---------- */
function empieza(nombre) {
  GEN++; TWEENS.length = 0; EFECTOS.length = 0;
  preparaEscena(nombre);
  Object.assign(J, { fase: 'jugador', ronda: 1, sel: null, modo: null, menu: null, sub: null, menuActivo: -1, subActivo: -1, boton: null, marcas: {},
    cursor: null, previa: null, objetivos: [], tec: null, fichaA: null, fichaE: null, banner: null, bocadillos: [], fin: null, ocupado: false,
    destello: 0, temblor: 0, pan: [0, 0], toque: null, dichos: new Set() });
  J.unidades = [...SALIDA.aliados.map(([t, x, y]) => nuevaUnidad(t, x, y, 'a')), ...SALIDA[nombre].map(([t, x, y]) => nuevaUnidad(t, x, y, 'e'))];
  J.foco = pieMundo(4, 3.6, 2);
  CAM.x = 118 - J.foco[0]; CAM.y = 86 - J.foco[1]; CAMB.x = CAM.x; CAMB.y = CAM.y;
  actualizaPista();
  comienzaTuTurno();
}
async function cartel(texto, tono) {
  J.banner = { texto: tr(texto), tono, t: 0, dura: 1.3 };
  await espera(1.3);
  J.banner = null;
}
async function comienzaTuTurno() {
  const g = GEN;
  J.ocupado = true; J.fase = 'jugador';
  await cartel('Turno de los Fans', 'azul');
  if (g !== GEN) return;
  J.ocupado = false; deselecciona();
}
const botonFin = () => ({ t: tr('Fin del turno'), tono: 'oscuro', f: () => { for (const a of vivos('a')) a.hecho = true; turnoMicroblizz(); } });

/* ---------- tu turno: elegir y dar órdenes ---------- */
function deselecciona() {
  Object.assign(J, { sel: null, modo: null, menu: null, sub: null, marcas: {}, previa: null, fichaA: null, fichaE: null, boton: botonFin() });
  actualizaPista();
}
function selecciona(u) {
  const conTec = TIPOS_U[u.tipo].tec.some(id => u.caos >= TECNICAS[id].coste);
  Object.assign(J, { sel: u, modo: 'menu', sub: null, marcas: {}, previa: null, fichaA: u, fichaE: null, boton: null, pan: [0, 0] });
  J.foco = pieMundo(u.gx, u.gy, altura(u.gx, u.gy));
  J.menu = [
    { t: tr('Mover'), ok: !u.movido, f: () => modoMover(u) },
    { t: tr('Atacar'), ok: objetivosDe(u).length > 0, f: () => modoAtacar(u, null) },
    { t: tr('Técnica'), ok: conTec, f: () => abreTecnicas(u) },
    { t: tr('Esperar'), ok: true, f: () => termina(u) },
  ];
  J.menuActivo = J.menu.findIndex(i => i.ok);
  actualizaPista();
}
function modoMover(u) {
  J.mapa = alcanceMover(u);
  Object.assign(J, { modo: 'mover', menu: null, sub: null, boton: { t: tr('Volver'), tono: 'oscuro', f: volver } });
  J.marcas = { azul: new Set([...J.mapa].filter(([k, v]) => !v.ocupada && k !== u.gx + ',' + u.gy).map(([k]) => k)) };
  actualizaPista();
}
function abreTecnicas(u) {
  J.sub = TIPOS_U[u.tipo].tec.map(id => ({ t: tr(TECNICAS[id].nombre), coste: tr('{n} CAOS').replace('{n}', TECNICAS[id].coste), ok: u.caos >= TECNICAS[id].coste, f: () => modoAtacar(u, id) }));
  J.subActivo = J.sub.findIndex(i => i.ok);
}
function modoAtacar(u, tec) {
  const al = tec ? TECNICAS[tec].alcance : TIPOS_U[u.tipo].alcance, zona = new Set();
  for (let gy = 0; gy < N; gy++) for (let gx = 0; gx < N; gx++) {
    const d = Math.abs(gx - u.gx) + Math.abs(gy - u.gy);
    if (d > 0 && d <= al && !esAgua(gx, gy)) zona.add(gx + ',' + gy);
  }
  Object.assign(J, { modo: 'atacar', tec, menu: null, sub: null, objetivos: objetivosDe(u, tec), previa: null, boton: { t: tr('Volver'), tono: 'oscuro', f: volver } });
  J.marcas = { rojo: zona };
  if (J.objetivos.length === 1) apunta(J.objetivos[0]);
  actualizaPista();
}
function apunta(o) {
  J.previa = { o, acierto: aciertoDe(J.sel, o, J.tec), dano: danoDe(J.sel, o, J.tec) };
  J.fichaE = o; J.cursor = [o.gx, o.gy];
}
function volver() {
  if (J.sub) { J.sub = null; return; }
  if (J.sel && (J.modo === 'mover' || J.modo === 'atacar')) selecciona(J.sel); else deselecciona();
}
function termina(u) {
  u.hecho = true;
  deselecciona();
  if (vivos('a').every(a => a.hecho)) turnoMicroblizz();
}
async function ejecutaMover_(u, destino) {
  const g = GEN, camino = caminoA(J.mapa, destino[0], destino[1]);
  Object.assign(J, { ocupado: true, marcas: {}, boton: null });
  await mueve(u, camino);
  if (g !== GEN) return;
  u.movido = true; J.ocupado = false;
  selecciona(u);
}
async function ejecutaAtaque_(u, o, tec) {
  const g = GEN;
  Object.assign(J, { ocupado: true, marcas: {}, boton: null, menu: null, sub: null });
  await ataca(u, o, tec);
  if (g !== GEN) return;
  u.hecho = true; J.previa = null; J.ocupado = false;
  if (compruebaFin()) return;
  deselecciona();
  if (vivos('a').every(a => a.hecho)) turnoMicroblizz();
}

/* ---------- el turno de Microblizz ---------- */
async function turnoMicroblizz_() {
  const g = GEN;
  Object.assign(J, { ocupado: true, fase: 'enemigo', sel: null, menu: null, sub: null, boton: null, marcas: {}, previa: null, fichaA: null, fichaE: null });
  actualizaPista();
  await cartel('Turno de Microblizz', 'rojo');
  for (const u of vivos('e')) {
    if (g !== GEN) return;
    if (!u.vivo) continue;
    const { camino, objetivo } = decideEnemigo(u);
    J.foco = pieMundo(u.gx, u.gy, altura(u.gx, u.gy)); J.pan = [0, 0]; J.fichaE = u; J.fichaA = null;
    await espera(0.4);
    if (camino.length > 1) await mueve(u, camino);
    if (objetivo && objetivo.vivo && g === GEN) await ataca(u, objetivo, null);
    await espera(0.25);
    if (g !== GEN || compruebaFin()) return;
  }
  J.ronda++;
  for (const a of vivos('a')) { a.hecho = false; a.movido = false; a.caos = Math.min(a.caosMax, a.caos + AJUSTES.caosTurno); }
  J.fichaE = null;
  const primero = vivos('a')[0];
  if (primero) J.foco = pieMundo(primero.gx, primero.gy, altura(primero.gx, primero.gy));
  comienzaTuTurno();
}
function compruebaFin() {
  if (!vivos('e').length) J.fin = { titulo: tr('¡Victoria!'), lineas: [tr('Microblizz tendrá que'), tr('contratar más becarios.')], tono: 'azul' };
  else if (!vivos('a').length) J.fin = { titulo: tr('¡Te han despedido!'), lineas: [tr('Microblizz te agradece'), tr('los servicios prestados.')], tono: 'rojo' };
  else return false;
  Object.assign(J, { fase: 'fin', ocupado: false, menu: null, sub: null, boton: null, marcas: {}, sel: null });
  actualizaPista();
  return true;
}

/* ---------- las acciones, animadas ---------- */
const mira = (u, x, y) => { const s = (x - u.gx) - (y - u.gy); if (s) u.giro = s > 0 ? 1 : -1; };
async function mueve(u, camino) {
  for (let i = 1; i < camino.length; i++) {
    const [ax, ay] = camino[i - 1], [bx, by] = camino[i], ha = altura(ax, ay), hb = altura(bx, by);
    mira(u, bx, by);
    await espera(0.22 + Math.abs(hb - ha) * 0.04, k => {
      u.fx = ax + (bx - ax) * k; u.fy = ay + (by - ay) * k; u.fh = ha + (hb - ha) * k;
      u.arco = Math.sin(Math.PI * k) * (5 + Math.max(0, hb - ha) * 3); u.pose = 'aire';
    });
    Object.assign(u, { gx: bx, gy: by, fx: bx, fy: by, fh: hb, arco: 0, pose: 'aterriza' });
    efecto('polvo', ...pieMundo(bx, by, hb));
    J.foco = pieMundo(bx, by, hb);
    await espera(0.06);
  }
  u.pose = 'quieto';
}
function di(u, lineas, dura = 1.8) {
  const [x, y] = pieMundo(u.gx, u.gy, altura(u.gx, u.gy));
  const b = { lineas: lineas.map(tr), x, y: y - (u.tipo === 'conejo' ? 46 : 34) };
  J.bocadillos.push(b);
  espera(dura).then(() => { const i = J.bocadillos.indexOf(b); if (i >= 0) J.bocadillos.splice(i, 1); });
}
function impacto(u, o, acierta, dano, opciones = {}) {
  const [x, y] = pieMundo(o.gx, o.gy, altura(o.gx, o.gy));
  if (!acierta) { efecto('numero', x, y - 38, { texto: tr('Fallo'), fallo: true }); return; }
  o.vida = Math.max(0, o.vida - dano); o.flash = 0.3; o.pose = 'ay';
  espera(0.3).then(() => { if (o.pose === 'ay') o.pose = 'quieto'; });
  efecto('numero', x + 4, y - 38, { texto: String(dano) });
  efecto('chispas', x - 2, y - 20, opciones);
  if (opciones.onda) efecto('onda', x, y);
  J.destello = 0.08; J.temblor = 0.3;
  if (u.caosMax) u.caos = Math.min(u.caosMax, u.caos + AJUSTES.caosGolpe);
  if (o.eq === 'e' && o.vida > 0 && !J.dichos.has('queja')) { J.dichos.add('queja'); di(o, ESC.queja); }
}
async function ataca(u, o, tec) {
  mira(u, o.gx, o.gy);
  if (u.eq === 'a') { J.fichaA = u; J.fichaE = o; } else { J.fichaE = u; J.fichaA = o; }
  const [ux, uy] = pieMundo(u.gx, u.gy, altura(u.gx, u.gy)), [ox, oy] = pieMundo(o.gx, o.gy, altura(o.gx, o.gy));
  J.foco = [(ux + ox) / 2, (uy + oy) / 2 - 6]; J.pan = [0, 0];
  const acierta = Math.random() * 100 < aciertoDe(u, o, tec), dano = danoDe(u, o, tec, 0.9 + Math.random() * 0.2);
  if (tec) u.caos -= TECNICAS[tec].coste;
  if (tec === 'saltoCaos') {
    u.pose = 'agacha'; await espera(0.3);
    const sx = u.fx, sy = u.fy, sh = u.fh, oh = altura(o.gx, o.gy), lejos = distancia(u, o);
    await espera(0.5 + lejos * 0.06, k => {
      const kk = suave(k);
      u.fx = sx + (o.gx - sx) * kk * 0.86; u.fy = sy + (o.gy - sy) * kk * 0.86; u.fh = sh + (oh - sh) * kk;
      u.arco = Math.sin(Math.PI * k) * (30 + lejos * 5) + k * 21; u.pose = k < 0.7 ? 'vuela' : 'golpe'; u.encima = k > 0.5 ? o : null;
    });
    u.pose = 'pisa';
    impacto(u, o, acierta, dano, { onda: true, espirales: true });
    await espera(0.16);
    const px = u.fx, py = u.fy, ph = u.fh;
    await espera(0.36, k => {
      const kk = suave(k);
      u.fx = px + (sx - px) * kk; u.fy = py + (sy - py) * kk; u.fh = ph + (sh - ph) * kk;
      u.arco = 21 * (1 - k) + Math.sin(Math.PI * k) * 14; u.pose = 'aire'; u.encima = k < 0.3 ? o : null;
    });
    Object.assign(u, { fx: sx, fy: sy, fh: sh, arco: 0, pose: 'aterriza', encima: null });
    efecto('polvo', ...pieMundo(u.gx, u.gy, sh));
    await espera(0.1); u.pose = 'quieto';
  } else if (TIPOS_U[u.tipo].alcance > 1) {
    u.pose = 'golpe';
    efecto('laser', ox, oy - 14, { ax: ux + u.giro * 13, ay: uy - 8 });
    await espera(0.16);
    impacto(u, o, acierta, dano, { colores: ['#ffffff', '#5ee0f0', '#c8fbff'] });
    await espera(0.2); u.pose = 'quieto';
  } else {
    u.pose = 'golpe';
    const vx = (o.gx - u.gx) * 0.38, vy = (o.gy - u.gy) * 0.38;
    await espera(0.14, k => { u.dx = vx * k; u.dy = vy * k; });
    if (tec === 'tajoEpico') efecto('tajo', ox - 2, oy - 14);
    impacto(u, o, acierta, dano, tec ? { onda: true, colores: ['#ffffff', '#fff27a', '#ffb347'] } : {});
    await espera(0.18, k => { u.dx = vx * (1 - k); u.dy = vy * (1 - k); });
    u.dx = u.dy = 0; u.pose = 'quieto';
  }
  await espera(0.35);
  if (o.vida <= 0 && o.vivo) await muere(o);
}
async function muere(o) {
  o.muere = true;
  await espera(0.6);
  o.muere = false; o.vivo = false;
  if (ADIOS[o.tipo]) di(o, ADIOS[o.tipo]);
  if (J.fichaE === o) J.fichaE = null;
}

/* ---------- cámara (sigue al foco, se puede arrastrar, tiembla con los golpes) ---------- */
const CAMB = { x: 0, y: 0 };
function actualiza(dt) {
  avanzaTweens(dt); avanzaEfectos(dt);
  for (const u of J.unidades) { if (u.flash > 0) u.flash -= dt; u.vidaVista += (u.vida - u.vidaVista) * Math.min(1, dt * 8); }
  J.destello = Math.max(0, J.destello - dt);
  if (J.banner) J.banner.t += dt;
  const tx = 118 - J.foco[0] + J.pan[0], ty = 86 - J.foco[1] + J.pan[1], f = Math.min(1, dt * 6);
  CAMB.x += (tx - CAMB.x) * f; CAMB.y += (ty - CAMB.y) * f;
  CAM.x = CAMB.x; CAM.y = CAMB.y;
  if (J.temblor > 0) { J.temblor -= dt; const s = Math.max(0, J.temblor / 0.3) * 3; CAM.x += Math.round(Math.sin(J.temblor * 90) * s); CAM.y += Math.round(Math.cos(J.temblor * 70) * s * 0.6); }
}

// si algo falla a mitad de una acción, se avisa en la consola y el juego no se queda bloqueado
const seguro = f => async (...a) => { try { await f(...a); } catch (e) { console.error(e); J.ocupado = false; if (J.fase !== 'fin') { J.fase = 'jugador'; deselecciona(); } } };
const ejecutaMover = seguro(ejecutaMover_), ejecutaAtaque = seguro(ejecutaAtaque_), turnoMicroblizz = seguro(turnoMicroblizz_);
