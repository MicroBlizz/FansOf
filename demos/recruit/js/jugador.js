// Fans of Recruit · CRAZYBUNNY: correr, saltar, agacharse, apuntar arriba (y abajo en el aire), la pistola, la metralleta,
// las zanahorias bomba, el culatazo de cerca, el Salto del Caos, las vidas, y subirse a la MechaVaca (que aguanta 3 golpes
// y, cuando revienta, suelta a la vaca).
'use strict';

const JG = { tipo: 'jugador', z: 0, x: 0, y: 0, vx: 0, vy: 0, dir: 1, suelo: true, agachado: false, mira: 0, anim: 0, t: 0, cad: 0, cadB: 0, fogon: 0,
  arma: 0, municion: 0, bombas: 10, vidas: 2, inv: 0, muerto: 0, mecha: null, caos: 0, corte: false };
const QUIETO = { x: 0, y: 0, fuego: false, salto: false, bomba: false, caos: false, p: {} };   // unos mandos que no tocan nada

function nuevoJugador() {
  Object.assign(JG, { x: -26, y: SUELO, vx: 0, vy: 0, dir: 1, suelo: true, agachado: false, mira: 0, anim: 0, t: 0, cad: 0, cadB: 0, fogon: 0,
    arma: 0, municion: 0, bombas: 10, vidas: 2, inv: 0, muerto: 0, mecha: null, caos: 0, corte: false });
}
// la caja donde le pueden dar: [izquierda, arriba, derecha, abajo]
function cajaJugador() {
  const j = JG;
  return j.mecha ? [j.x - 17, j.y - 54, j.x + 17, j.y] : j.agachado ? [j.x - 7, j.y - 18, j.x + 7, j.y] : [j.x - 6, j.y - 34, j.x + 6, j.y - 2];
}
function tocaJugador(x, y, m = 0) { const c = cajaJugador(); return x > c[0] - m && x < c[2] + m && y > c[1] - m && y < c[3] + m; }

// hasta dónde puede ir por la derecha: el borde de la pantalla o, si está el jefe, justo delante de él
function limiteDer() {
  const e = J.jefe;
  if (e && !e.muerto) return Math.min(J.camX + J.W - 10, e.x - e.r - (JG.mecha ? 20 : 8));
  return J.camX + J.W - (J.fase === 'jefe-aviso' ? 128 : 10);
}

/* ---------- qué dibujo le toca ahora ---------- */
function dibujoConejo() {
  const j = JG, C = SPR.conejo;
  if (j.muerto) return C.cae[!j.suelo && j.vy < 0 ? 0 : 1];
  if (j.caos) return j.caos < 22 ? C.salta[0] : C.saltaAbajo[1];
  if (J.fase === 'gana') return C.gana[(j.t >> 4) & 1];
  if (j.mecha) return C.agachado[0];
  if (!j.suelo) return (j.mira === -1 ? C.saltaArriba : j.mira === -0.5 ? C.saltaDiag : j.mira === 0.5 ? C.saltaDiagAbajo : j.mira === 1 ? C.saltaAbajo : C.salta)[j.vy < 0.4 ? 0 : 1];
  if (j.agachado) return C.agachado[j.vx ? (j.t >> 3) & 1 : (j.t >> 5) & 1];
  if (j.vx) return (j.mira === -1 ? C.correArriba : j.mira === -0.5 ? C.correDiag : C.corre)[(j.anim | 0) % 8];
  return (j.mira < 0 ? C.quietoArriba : C.quieto)[((j.t / 9) | 0) % 4];
}
function dibujoMecha() {
  const j = JG, V = SPR.mecha, a = j.mira < 0;   // a: con el cañón hacia arriba
  return !j.suelo ? (a ? V.saltaArr : V.salta) : j.fogon > 2 ? (a ? V.disparaArr : V.dispara) : j.vx ? (a ? V.andaArr : V.anda)[(j.anim | 0) % 6] : (a ? V.quietaArr : V.quieta)[(j.t >> 4) & 1];
}

/* ---------- un paso ---------- */
function pasoJugador() {
  const j = JG;
  j.t++;
  if (j.inv > 0) j.inv--;
  if (j.cad > -99) j.cad--;
  if (j.cadB > 0) j.cadB--;
  if (j.fogon > 0) j.fogon--;
  if (j.muerto) { pasoMuerte(); return; }
  if (j.caos) { pasoCaos(); return; }
  let m = MANDO;
  if (J.fase === 'entra') m = Object.assign({}, QUIETO, { x: j.x < 62 ? 1 : 0 });
  else if (J.fase === 'gana') m = QUIETO;
  // subirse a la MechaVaca (salto estando a su lado) y bajarse (abajo + salto)
  let salto = !!m.p.salto;
  if (salto && !j.mecha && j.y > SUELO - 30) { const v = J.cosas.find(c => c.tipo === 'mecha' && !c.fuera && Math.abs(c.x - j.x) < 24); if (v) { sube(v); salto = false; } }
  if (salto && j.mecha && m.y > 0 && j.suelo) { baja(); salto = false; }
  // moverse
  j.agachado = !j.mecha && j.suelo && m.y > 0;
  j.mira = m.y < 0 ? (m.x && !j.mecha ? -0.5 : -1) : m.y > 0 && !j.suelo && !j.mecha ? (m.x ? 0.5 : 1) : 0;
  j.vx = m.x * (j.mecha ? 1.2 : j.agachado ? 0.6 : 1.45);
  if (m.x) j.dir = m.x;
  if (salto && j.suelo) { j.vy = j.mecha ? -4.2 : -4.5; j.suelo = false; j.corte = true; play('salto'); polvo(j.x, SUELO); }
  if (j.corte && !m.salto && j.vy < -1.6) { j.vy = -1.6; j.corte = false; }   // soltar el botón pronto = salto corto
  j.vy += GRAV; j.x += j.vx; j.y += j.vy;
  if (j.y >= SUELO) {
    if (!j.suelo) { play(j.mecha ? 'land' : 'aterriza'); polvo(j.x - 6, SUELO); polvo(j.x + 6, SUELO); if (j.mecha) J.tiembla = Math.max(J.tiembla, 5); }
    j.y = SUELO; j.vy = 0; j.suelo = true;
  }
  if (J.fase !== 'entra') j.x = Math.max(J.camX + 10, Math.min(j.x, Math.max(limiteDer(), j.x - 3)));
  // las pisadas
  if (j.suelo && j.vx) {
    const a0 = j.anim | 0;
    j.anim += Math.abs(j.vx) * (j.mecha ? 0.13 : 0.24);
    const a1 = j.anim | 0;
    if (a1 !== a0 && a1 % (j.mecha ? 3 : 4) === 0) { play(j.mecha ? 'clank' : 'paso'); if (!j.agachado) polvo(j.x - j.dir * 7, SUELO); }
  }
  // las armas
  if (J.fase === 'entra' || J.fase === 'gana') return;
  if (j.mecha) { if (m.fuego && j.cad <= 0) disparaMecha(); embiste(); }
  else if (j.arma ? m.fuego && j.cad <= 0 : (m.p.fuego && j.cad <= 0) || (m.fuego && j.cad <= -6)) { if (!culatazo()) dispara(); }
  if (m.p.bomba && j.bombas > 0 && j.cadB <= 0) lanzaBomba();
  if (m.p.caos && J.caos >= 10) empiezaCaos();
}

/* ---------- las armas ---------- */
// hacia dónde sale la bala según a dónde apunta (en diagonal, en la misma dirección que el arma del dibujo)
function dirDisparo(j) {
  if (j.mira === -1) return [0, -1]; if (j.mira === 1) return [0, 1]; if (!j.mira) return [j.dir, 0];
  const a = j.mira < 0 ? AP_DIAG : AP_DIAG_ABAJO; return [j.dir * Math.cos(a), Math.sin(a)];
}
function dispara() {
  const j = JG, s = dibujoConejo(), b = s.boca || [20, -20], x = j.x + j.dir * b[0], y = j.y - 1 + b[1], mg = j.arma === 1;
  const d = dirDisparo(j), des = mg ? rand(-1.6, 1.6) : 0;
  J.balas.push({ tipo: 0, x: x - d[1] * des, y: y + d[0] * des, vx: d[0] * 6.5, vy: d[1] * 6.5, d: 1, t: 0 });
  j.cad = mg ? 4 : 7; j.fogon = 4;
  efecto(SPR.casquillo, j.x - j.dir * 2, j.y - (j.agachado ? 12 : 24), { vx: -j.dir * rand(0.5, 1.5), vy: rand(-2.8, -1.8), g: 0.2, dur: 56, gira: 4, bota: rand(1, 9), parp: true });
  play(mg ? 'ametralladora' : 'pistola');
  if (mg && --j.municion <= 0) { j.arma = 0; j.municion = 0; play('deny'); }
}
// de cerca no dispara: da un culatazo que tumba a un becario o rompe una caja
function culatazo() {
  const j = JG;
  if (j.mira || !j.suelo) return false;
  const cerca = o => !o.muerto && !o.fuera && (o.x - j.x) * j.dir > -4 && (o.x - j.x) * j.dir < 24;
  const e = J.enes.find(o => o.tipo === 'becario' && cerca(o)) || J.cosas.find(o => o.tipo === 'caja' && cerca(o));
  if (!e) return false;
  efecto(SPR.impacto, (e.x + j.x) / 2 + j.dir * 5, j.y - 20, { dur: 8 });
  play('golpe'); j.cad = 12;
  golpea(e, 6, false);
  return true;
}
function disparaMecha() {
  const j = JG, a = j.mira < 0, b = (a ? SPR.mecha.disparaArr : SPR.mecha.dispara).boca;   // hacia arriba, en diagonal: para los drones
  J.balas.push({ tipo: 1, x: j.x + j.dir * b[0], y: j.y + b[1], vx: j.dir * 5.5 * (a ? Math.cos(CANON_ARR) : 1), vy: a ? 5.5 * Math.sin(CANON_ARR) : 0, d: 3, t: 0 });
  j.cad = 11; j.fogon = 5; play('plasma');
}
// la MechaVaca se lleva por delante lo que toca
function embiste() {
  const j = JG;
  for (const e of J.enes.slice()) if (e.tipo !== 'jefe' && !e.muerto && Math.abs(e.x - j.x) < 20 + e.r && e.y - e.alto < j.y && e.y > j.y - 58) { play('golpe'); golpea(e, 10, true); }
  for (const c of J.cosas.slice()) if (c.tipo === 'caja' && Math.abs(c.x - j.x) < 28) golpea(c, 10, true);
}
function lanzaBomba() {
  const j = JG;
  j.bombas--; j.cadB = 18;
  J.balas.push({ tipo: 2, x: j.x + j.dir * 6, y: j.y - (j.mecha ? 60 : j.agachado ? 18 : 30), vx: j.dir * 2.4 + j.vx * 0.5, vy: -3.3, g: 0.17, d: 10, t: 0 });
  play('bomba');
}

/* ---------- el Salto del Caos: sube hasta salirse de la pantalla y cae reventándolo todo ---------- */
function empiezaCaos() {
  const j = JG;
  j.caos = 1; j.vx = 0; j.vy = 0; j.fogon = 0;
  J.caosP = 0; J.caos = 0; J.tinte = 50;
  play('caos'); chat('caos');
  rotulo([['¡SALTO DEL CAOS!', ['#f3e6ff', '#c79bff', '#8a4be0'], 2]], 70);
}
function pasoCaos() {
  const j = JG;
  j.caos++; j.suelo = false;
  if (j.caos < 22) { j.y -= 11; return; }
  j.x = acota(j.x + MANDO.x * 2, J.camX + 14, limiteDer());
  j.y += 13;
  if (j.y < SUELO) return;
  j.y = SUELO; j.suelo = true; j.vy = 0; j.caos = 0; j.inv = 80;
  // el golpe: tiembla todo, una explosión enorme y otras que se alejan por los dos lados
  const x0 = j.x;
  J.tiembla = 30; J.flash = 8; play('slam');
  explota(x0, SUELO - 14, 2);
  for (let k = 1; k <= 4; k++) for (const s of [-1, 1]) luego(k * 5, () => explota(x0 + s * k * 48, SUELO - 12, 1));
  for (const e of J.enes.slice()) if (enPantalla(e.x, 24)) golpea(e, e.tipo === 'jefe' ? 25 : 20, true);
  for (const c of J.cosas.slice()) if (c.tipo === 'caja' && enPantalla(c.x)) golpea(c, 20, true);
  J.tiros = [];
}

/* ---------- le dan ---------- */
// devuelve true si le ha hecho daño. forzado: se acabó el tiempo (da igual que esté parpadeando)
function danaJugador(forzado) {
  const j = JG;
  if (j.muerto || j.caos || (J.fase !== 'normal' && J.fase !== 'jefe')) return false;
  if (!forzado && (j.inv > 0 || DEV.inmortal)) return false;
  if (j.mecha) {
    j.mecha.hp -= forzado ? 9 : 1; j.inv = 70; J.tiembla = Math.max(J.tiembla, 8); play('clank');
    efecto(SPR.impacto, j.x, j.y - 34, { dur: 8 });
    if (j.mecha.hp <= 0) revientaMecha();
    if (!forzado) return true;
  }
  j.muerto = 1; j.vy = -3.4; j.vx = -j.dir * 1.3; j.suelo = false; j.fogon = 0; j.agachado = false;
  J.tiembla = Math.max(J.tiembla, 6); play('caida'); chat('dano');
  return true;
}
function pasoMuerte() {
  const j = JG;
  j.muerto++;
  if (!j.suelo) {
    j.vy += GRAV; j.x = acota(j.x + j.vx, J.camX + 10, limiteDer()); j.y += j.vy;
    if (j.y >= SUELO) { j.y = SUELO; j.vy = 0; j.suelo = true; polvo(j.x, SUELO); play('aterriza'); }
  }
  if (j.muerto < 100) return;
  if (j.vidas > 0) { j.vidas--; revive(); }
  else { J.estado = 'fin'; J.t = 0; musica('lose'); chat('fin'); }
}
// vuelve a caer del cielo, parpadeando un rato y con la pistola
function revive() {
  const j = JG;
  Object.assign(j, { muerto: 0, x: acota(j.x, J.camX + 40, J.camX + J.W - 40), y: -30, vx: 0, vy: 0, suelo: false, inv: 170, arma: 0, municion: 0, bombas: Math.max(j.bombas, 10), mecha: null, caos: 0, corte: false });
  J.tiempo = Math.max(J.tiempo, 30);
}

/* ---------- la MechaVaca ---------- */
function sube(v) {
  const j = JG;
  v.fuera = true;
  j.mecha = { hp: v.hp }; j.x = v.x; j.y = SUELO; j.vy = 0; j.suelo = true; j.anim = 0;
  play('summon'); flota('¡MECHAVACA!', j.x, j.y - 92, ['#ffe3ef', '#ffabd2', '#f07fb8'], true);
  if (!v.usada) chat('mecha');
}
function baja() {
  const j = JG;
  J.cosas.push({ tipo: 'mecha', x: j.x, y: SUELO, z: -2, hp: j.mecha.hp, t: 0, dir: j.dir, usada: true });
  j.mecha = null; j.vy = -3.6; j.suelo = false; j.corte = false; j.x -= j.dir * 6;
  play('eject');
}
// el mecha revienta: CrazyBunny sale por los aires y la vaca sigue peleando por su cuenta
function revientaMecha() {
  const j = JG;
  explota(j.x, SUELO - 30, 2); trozos(j.x, SUELO - 34, 9);
  J.cosas.push({ tipo: 'vaca', x: j.x, y: SUELO, z: 1, dir: j.dir, t: 0, anim: 0 });
  j.mecha = null; j.vy = -5; j.suelo = false; j.corte = false; j.inv = 140;
  flota('¡LA VACA SIGUE PELEANDO!', j.x, j.y - 80, ['#ffe3ef', '#ffabd2', '#f07fb8'], true);
  chat('mechaRota');
}
