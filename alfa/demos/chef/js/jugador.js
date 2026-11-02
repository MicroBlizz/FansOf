// Fans of Chef · JUGADOR: el cocinero. Anda con el teclado, la palanca o hacia el punto tocado (ENTRADA.destino, deslizándose por los
// muros), ataca con el cuchillo apuntando solo al bicho más cercano (en modo tocar, ataca solo cuando lo tiene a mano), levanta la sartén
// (anda despacio; lo que llega de frente rebota y aturde) y recoge lo que hay por el suelo. Animación: los fotogramas de Yoshi
// (chef_<dir>_0/1/2, chef_ataque, chef_bloqueo) con estiramiento al andar y al golpear; si falta alguno, el más parecido que haya.
'use strict';

const J = {};   // el jugador (se rellena en jugadorNuevo)
const J_ANCHO = 16, J_ALTO = 10;   // la caja de los pies, para chocar
const ALCANCE_AUTO = 46;           // modo tocar: a esta distancia del bicho, ataca solo

function jugadorNuevo(x, y) {
  Object.assign(J, { x, y, dir: 'abajo', mx: 0, my: 1, ax: 0, ay: 1, vida: CIFRAS.vida, invul: 0, cuchilloT: 0, golpe: null, paso: 0, andando: false,
    bloqueando: false, herido: 0, mano: null, atacaT: 0, presa: null, atasco: 0, anduvo: 0 });
  ENTRADA.destino = null;
}
const vivo = () => J.vida > 0;
// mirar hacia un vector (cambia el dibujo: abajo, arriba o de lado)
function mira(dx, dy) {
  if (Math.abs(dx) > Math.abs(dy)) { J.dir = dx > 0 ? 'der' : 'izq'; J.mx = Math.sign(dx); J.my = 0; }
  else if (dy) { J.dir = dy > 0 ? 'abajo' : 'arriba'; J.mx = 0; J.my = Math.sign(dy); }
}
const bichoMasCerca = (max) => { let m = null, md = max; for (const e of ENEMIGOS) { if (e.muerto) continue; const d = Math.hypot(e.x - J.x, e.y - J.y); if (d < md) { md = d; m = e; } } return m; };

function avanzaJugador(dt) {
  if (!vivo()) return;
  J.invul = Math.max(0, J.invul - dt); J.cuchilloT = Math.max(0, J.cuchilloT - dt); J.herido = Math.max(0, J.herido - dt); J.atacaT = Math.max(0, J.atacaT - dt);
  if (J.golpe) { J.golpe.t -= dt; if (J.golpe.t <= 0) J.golpe = null; }
  const enCantina = JORNADA.fase === 'servicio';
  J.bloqueando = !enCantina && !!ENTRADA.bloqueo && !J.golpe;
  // modo tocar: qué se ha tocado (un bicho, el montacargas o el suelo)
  if (!enCantina && ENTRADA.toqueMundo) {
    const q = ENTRADA.toqueMundo, b = ENEMIGOS.find(e => !e.muerto && Math.abs(q.x - e.x) < e.def.ancho * 0.7 + 6 && q.y < e.y + 10 && q.y > e.y - e.def.alto - 6);
    const m = MAPA.montacargas;
    if (b) { J.presa = b; ENTRADA.destino = { x: b.x, y: b.y }; }
    else if (m && Math.abs(q.x - m.x) < 30 && q.y < m.y + 20 && q.y > m.y - 60) { J.presa = null; ENTRADA.destino = { x: m.x, y: m.y + 30, montacargas: true }; }
    else { J.presa = null; ENTRADA.destino = { x: q.x, y: q.y }; }
    J.atasco = 0;
  }
  if (J.presa && (J.presa.muerto || ENEMIGOS.indexOf(J.presa) < 0)) { J.presa = null; ENTRADA.destino = null; }
  if (J.presa) ENTRADA.destino = { x: J.presa.x, y: J.presa.y };
  // hacia dónde anda: teclado o palanca, y si no, hacia el destino
  let dx = ENTRADA.dir.x, dy = ENTRADA.dir.y;
  const D = ENTRADA.destino;
  if (!dx && !dy && D) {
    const vx = D.x - J.x, vy = D.y - J.y, d = Math.hypot(vx, vy), para = J.presa ? ALCANCE_AUTO - 10 : 4;
    if (d > para) { dx = vx / d; dy = vy / d; }
    else { if (!J.presa) { if (D.montacargas) JORNADA.pideSubir = true; ENTRADA.destino = null; } }
  }
  const vel = J.bloqueando ? CIFRAS.velocidadBloqueo : CIFRAS.velocidad;
  J.andando = Math.abs(dx) + Math.abs(dy) > 0.05;
  if (J.andando) {
    if (!J.bloqueando && J.atacaT <= 0) mira(dx, dy);
    const x0 = J.x, y0 = J.y;
    mueve(J, dx * vel * dt, dy * vel * dt, J_ANCHO, J_ALTO);
    const avance = Math.hypot(J.x - x0, J.y - y0);
    J.anduvo += avance;
    if (D && !ENTRADA.dir.x && !ENTRADA.dir.y) { if (avance < vel * dt * 0.2) { J.atasco += dt; if (J.atasco > 0.35) { if (D.montacargas) JORNADA.pideSubir = true; ENTRADA.destino = null; J.presa = null; } } else J.atasco = 0; }
    J.paso += dt * (J.bloqueando ? 5 : 10);
  }
  if (enCantina) return;
  // atacar: con el botón (apunta al más cercano) o, en modo tocar, solo al tener un bicho a mano
  const cerca = bichoMasCerca(ALCANCE_AUTO);
  const auto = modoControl() === 'tocar' && cerca && !J.bloqueando;
  if ((ENTRADA.ataquePulsa || auto) && !J.bloqueando && J.cuchilloT <= 0 && !(JORNADA.enMontacargas && ENTRADA.ataquePulsa && JORNADA.objetivosHechos())) cuchillada(cerca || bichoMasCerca(80));
  recoge(); compruebaSalidas();
  const m = MAPA.montacargas;
  JORNADA.enMontacargas = !!m && Math.abs(J.x - m.x) < 26 && J.y < m.y + 44 && J.y >= m.y - 2;
  const co = MAPA.cofre;
  if (co && !co.abierto && Math.abs(J.x - co.x) < 24 && Math.abs(J.y - co.y) < 20) abreCofre();
}
// mueve una caja (los pies de `e`) por el mapa, eje a eje, para deslizarse por los muros
function mueve(e, dx, dy, w, h) {
  const hw = w / 2;
  if (dx && !chocaCaja(e.x - hw + dx, e.y - h, w, h)) e.x += dx;
  if (dy && !chocaCaja(e.x - hw, e.y - h + dy, w, h)) e.y += dy;
}

// la cuchillada: hacia el bicho dado (si lo hay) o hacia donde mira; un arco delante que golpea a todo lo que pille
function cuchillada(objetivo) {
  J.cuchilloT = CIFRAS.cuchilloCada; J.atacaT = 0.18;
  let ax = J.mx, ay = J.my;
  if (objetivo) { const vx = objetivo.x - J.x, vy = (objetivo.y - objetivo.def.alto * 0.3) - (J.y - 16), d = Math.hypot(vx, vy) || 1; ax = vx / d; ay = vy / d; mira(ax, ay); }
  J.ax = ax; J.ay = ay;
  const a = CIFRAS.cuchilloAlcance, cx = J.x + ax * a * 0.75, cy = J.y - 16 + ay * a * 0.75;
  J.golpe = { x: cx, y: cy, r: a * 0.75, t: 0.15, ax, ay };
  SONIDO.cuchillo();
  let dio = false;
  for (const e of ENEMIGOS) {
    if (e.muerto) continue;
    const ex = e.x, ey = e.y - e.def.alto * 0.4;
    if (Math.hypot(ex - cx, ey - cy) < a * 0.75 + e.def.ancho * 0.45) { hiereEnemigo(e, 1, ax, ay); dio = true; }
  }
  if (dio) { PAN.pausa = 0.05; tiembla(0.25); }   // un instante de parón al acertar: el golpe se siente
}
function hiereJugador(n, dx, dy) {
  if (J.invul > 0 || !vivo()) return false;
  // con la sartén levantada, lo que viene de frente rebota (de lado también vale si no viene por la espalda)
  if (J.bloqueando && (dx * J.mx + dy * J.my) < 0.2) { SONIDO.sarten(); chispas(J.x + J.mx * 14, J.y - 18 + J.my * 10, PALETA.Y, 10, 60); PAN.pausa = 0.06; return 'bloqueado'; }
  J.vida -= n; J.invul = CIFRAS.invulnerableSeg; J.herido = 0.3; tiembla(0.9); SONIDO.herido(); PAN.pausa = 0.08;
  mueve(J, dx * 14, dy * 14, J_ANCHO, J_ALTO);
  if (J.vida <= 0) JORNADA.derrota();
  return true;
}
function recoge() {
  for (const b of BOTIN) {
    if (b.t < 0.25) continue;   // acaba de caer: que se vea
    if (Math.hypot(b.x - J.x, b.y - (J.y - 6)) < 22) {
      b.cogido = true; JORNADA.coge(b.que); SONIDO.coge();
      numero(J.x, J.y - 66, '+1 ' + tr(INGREDIENTES[b.que].nombre), INGREDIENTES[b.que].luz);
      if (GUIA.evento) GUIA.evento('recoge');
    }
  }
  for (let i = BOTIN.length - 1; i >= 0; i--) if (BOTIN[i].cogido) BOTIN.splice(i, 1);
}
function abreCofre() {
  MAPA.cofre.abierto = true; SONIDO.cofre(); aviso(tr('¡Un cofre con provisiones!'), 1.6);
  const tipos = Object.keys(INGREDIENTES);
  for (let i = 0; i < 3; i++) sueltaBotin(MAPA.cofre.x, MAPA.cofre.y, pick(tipos));
}

// --- dibujar: el fotograma que toca, con estiramiento al andar y al golpear ---
function fotogramaChef() {
  const lado = J.dir === 'izq' || J.dir === 'der', base = lado ? 'lado' : J.dir;
  if (J.atacaT > 0 && IMG.chef_ataque) return { n: 'chef_ataque', espejo: J.mx < 0 || (J.mx === 0 && J.ax < 0) };
  if (J.bloqueando && IMG.chef_bloqueo) return { n: 'chef_bloqueo', espejo: J.mx < 0 };
  const ciclo = [1, 0, 2, 0][Math.floor(J.paso / 1.6) % 4];
  const k = J.andando ? ciclo : 0;
  for (const n of ['chef_' + base + '_' + k, 'chef_' + base + '_0', 'chef_' + base, 'chef_abajo_0', 'chef_abajo']) if (IMG[n]) return { n, espejo: lado && J.dir === 'izq' && n.startsWith('chef_lado') };
  return { n: 'chef_abajo', espejo: false };
}
function pintaJugador(ctx, cam) {
  const x = Math.round(J.x - cam.x), y = Math.round(J.y - cam.y);
  // sombra en el suelo (elipse), siempre, también al parpadear
  ctx.globalAlpha = 0.35; ctx.fillStyle = PALETA.K; ctx.beginPath(); ctx.ellipse(x, y - 1, 13, 4, 0, 0, 6.283); ctx.fill(); ctx.globalAlpha = 1;
  if (J.invul > 0 && Math.floor(J.invul * 14) % 2) return;
  const f = fotogramaChef();
  const paso = J.andando ? Math.sin(J.paso / 1.6 * Math.PI) : 0;
  let sx = 1, sy = 1, rot = 0;
  if (J.andando && !IMG.chef_abajo_1) { sy = 1 - Math.abs(paso) * 0.06; sx = 1 + Math.abs(paso) * 0.04; rot = paso * 0.06; }   // sin fotogramas de paso: balanceo
  if (J.atacaT > 0) { const t = J.atacaT / 0.18; sx = 1 + t * 0.12; sy = 1 - t * 0.08; }
  const bote = J.andando ? Math.abs(paso) * 2 : Math.sin(PAN.t * 3) * 0.6;   // respirar cuando está quieto
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sx, sy);
  if (J.herido > 0) ctx.filter = 'brightness(2.2) saturate(0.3)';
  pintaSpr(ctx, f.n, 0, -Math.round(bote), { espejo: f.espejo });
  ctx.filter = 'none'; ctx.restore();
  if (J.mano) pintaItem(ctx, J.mano, x, y - 70 - bote, true);
  // la sartén levantada: el escudo delante, con brillo
  if (J.bloqueando && !IMG.chef_bloqueo) { const bx = x + J.mx * 20, by = y - 22 + J.my * 14; circulo(ctx, bx, by, 11, PALETA.K); circulo(ctx, bx, by, 10, PALETA.N); circulo(ctx, bx, by, 5, PALETA.n); circulo(ctx, bx - 3, by - 3, 2, PALETA.w); }
  // el tajo: un arco blanco que se abre y se apaga
  if (J.golpe) {
    const g = J.golpe, t = 1 - g.t / 0.15, a0 = Math.atan2(g.ay, g.ax);
    ctx.save(); ctx.globalAlpha = 1 - t; ctx.strokeStyle = PALETA.W; ctx.lineWidth = 4 - t * 2;
    ctx.beginPath(); ctx.arc(x, y - 16, g.r + t * 6, a0 - 1.1, a0 + 1.1); ctx.stroke();
    ctx.strokeStyle = PALETA.Y; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y - 16, g.r + t * 6 - 3, a0 - 0.8, a0 + 0.8); ctx.stroke(); ctx.restore();
  }
}
