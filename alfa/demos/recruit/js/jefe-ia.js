// Fans of Recruit · EL JEFE EN MARCHA: SurvivalBot, «director de cierres» de Microblizz. Cae del techo delante del ascensor de
// los ejecutivos y repite tres ataques, siempre avisando antes: lanza cartas de despido (apártate de donde caen), da un
// golpe con la pinza que manda una onda por el suelo (sáltala) y dispara el rayo del ojo a donde estabas (no te quedes
// quieto). A media vida echa humo, va más deprisa y llama a los drones.
'use strict';

const JEFE_VIDA = 300;

function avisaJefe() {
  J.zona = { x: J.camX, jefe: true };
  J.fase = 'jefe-aviso'; J.ft = 0;
  rotulo([['¡AVISO!', ROJO_ROTULO, 3], ['SE ACERCA EL JEFE DE DEPARTAMENTO', BLANCO_ROTULO, 1]], 168);
  musica(null); play('alarma'); chat('jefe');
}
function nuevoJefe() {
  const e = { tipo: 'jefe', x: J.camX + J.W - 84, y: -50, vy: 0, dir: -1, hp: JEFE_VIDA, t: 0, est: 'cae', flash: 0, z: -4, r: 30, alto: 112, n: 0, roto: false, intocable: true, tiro: null, espera: 70 };
  J.jefe = e; J.enes.push(e);
}
function jefeQuieto(e) { e.est = 'quieto'; e.t = 0; e.espera = e.roto ? rand(36, 64) : rand(70, 110); }
// a media vida: se queda tocado un momento y cambia de dibujos
function jefeTocado(e) {
  e.roto = true; e.est = 'dano'; e.t = 0; e.tiro = null;
  explota(e.x - 14, e.y - 70, 1); luego(10, () => explota(e.x + 12, e.y - 34, 0));
  flota('¡ESTÁ ECHANDO HUMO!', e.x - 30, e.y - 124, ORO_ROTULO, true);
  play('wail'); chat('jefe2');
}
function jefeMuere(e) {
  e.est = 'muere'; e.t = 0; e.intocable = true; e.tiro = null; e.hp = 0;
  J.fase = 'jefe-muere'; J.ft = 0; J.tiros = [];
  J.enes.forEach((d, k) => { if (d.tipo !== 'jefe') luego(8 + k * 6, () => mata(d, false)); });
  musica(null); chat('jefeMuerto');
}
// dónde tiene el ojo y la pinza (el dibujo mira a la derecha y se pinta en espejo)
function puntoJefe(e, s, cual) { const p = s[cual]; return [e.x - p[0], e.y + p[1]]; }
// ¿toca el rayo a CrazyBunny? El rayo va del ojo al punto del suelo al que apuntó
function rayoToca(e) {
  const [x0, y0] = puntoJefe(e, SPR.jefe.rayo[0], 'ojo'), c = cajaJugador(), n = 26;
  for (let k = 0; k <= n; k++) { const x = x0 + (e.tiro.gx - x0) * k / n, y = y0 + (SUELO - y0) * k / n; if (x > c[0] - 4 && x < c[2] + 4 && y > c[1] - 4 && y < c[3] + 6) return true; }
  return false;
}
function pasoJefe(e) {
  const j = JG, f2 = e.roto;
  if (e.est === 'cae') {
    e.vy += 0.4; e.y += e.vy;
    if (e.y >= SUELO) {
      e.y = SUELO; e.est = 'ruge'; e.t = 0; e.intocable = false;
      J.tiembla = 32; play('slam'); play('boom');
      for (let k = 0; k < 8; k++) polvo(e.x + rand(-44, 44), SUELO, k % 2);
      papeles(e.x - 30, 30, 5); papeles(e.x + 20, 24, 4);
      rotulo([['SURVIVALBOT', ORO_ROTULO, 2], ['DIRECTOR DE CIERRES', BLANCO_ROTULO, 1]], 130);
    }
    return;
  }
  if (e.est === 'muere') { pasoJefeMuere(e); return; }
  // tocarlo hace daño, y no se le puede atravesar
  if (!j.muerto && !j.caos && Math.abs(j.x - e.x) < e.r + (j.mecha ? 24 : 12) && j.y > e.y - e.alto) danaJugador();
  if (f2 && e.t % 12 === 0) efecto(SPR.humo, e.x + rand(-22, 22), e.y - rand(64, 112), { vy: -0.5, dur: 40 });
  if (e.est === 'ruge') { if (e.t > 84) jefeQuieto(e); }
  else if (e.est === 'dano') { if (e.t > 54) jefeQuieto(e); }
  else if (e.est === 'quieto') {
    // se coloca a unos 150 px de CrazyBunny, sin salir de su mitad de la pantalla
    const obj = acota(j.x + 150, J.camX + J.W * 0.5, J.camX + J.W - 62);
    if (Math.abs(obj - e.x) > 2) e.x += Math.sign(obj - e.x) * (f2 ? 0.55 : 0.4);
    if (e.t > e.espera && !j.muerto) {
      e.est = ['cartas', 'golpe', 'rayo'][e.n % 3]; e.n++; e.t = 0;
      if (f2 && e.n % 3 === 1 && J.enes.filter(d => d.tipo === 'dron').length < 2) { entraEnemigo('dron', 1); entraEnemigo('dron', -1); play('wail'); }
    }
  } else if (e.est === 'cartas') {
    // cartas de despido por los aires: caen alrededor de donde está CrazyBunny
    if (e.t === 26 || (f2 && e.t === 62)) {
      const [x0, y0] = puntoJefe(e, SPR.jefe.lanza[1], 'garra'), n = f2 ? 5 : 3;
      for (let k = 0; k < n; k++) { const tx = j.x + (k - (n - 1) / 2) * 42 + rand(-8, 8), T = 62 + k * 7; J.tiros.push({ tipo: 'carta', x: x0, y: y0, vx: (tx - x0) / T, vy: (SUELO - y0) / T - 0.11 * T / 2, t: 0 }); }
      play('card'); play('despido');
    }
    if (e.t > (f2 ? 100 : 70)) jefeQuieto(e);
  } else if (e.est === 'golpe') {
    // levanta la pinza, golpea el suelo y sale una onda (dos, cuando está tocado)
    const T0 = f2 ? 34 : 46, onda = () => { if (e.est === 'muere' || e.muerto) return; J.tiros.push({ tipo: 'onda', x: e.x - 46, y: SUELO, vx: -3.1, vy: 0, t: 0 }); J.tiembla = Math.max(J.tiembla, 16); play('slam'); polvo(e.x - 40, SUELO); polvo(e.x - 54, SUELO, true); };
    if (e.t === T0) { onda(); if (f2) luego(30, onda); }
    if (e.t > T0 + (f2 ? 56 : 44)) jefeQuieto(e);
  } else if (e.est === 'rayo') {
    // el rayo del ojo: apunta (línea fina que parpadea), dispara y vuelve a apuntar
    const A = f2 ? 30 : 42, ciclo = A + 22, k = (e.t / ciclo) | 0, u = e.t % ciclo;
    if (k >= (f2 ? 4 : 3)) { e.tiro = null; jefeQuieto(e); return; }
    if (!e.tiro && u < A) e.tiro = { gx: acota(j.x + j.vx * 14, J.camX + 14, e.x - 50), on: false };
    if (e.tiro && u === A) { e.tiro.on = true; play('eyelaser'); explota(e.tiro.gx, SUELO - 6, 0); J.tiembla = Math.max(J.tiembla, 6); }
    if (e.tiro && e.tiro.on && rayoToca(e)) danaJugador();
    if (u >= A + 10) e.tiro = null;
  }
}
// revienta poco a poco y, al final, del todo: deja el sello de «CANCELADO»
function pasoJefeMuere(e) {
  if (e.t < 150) { if (e.t % 7 === 0) explota(e.x + rand(-28, 28), e.y - rand(10, 106), e.t % 21 === 0 ? 1 : 0); return; }
  if (e.muerto) return;
  e.muerto = true; J.jefe = null;
  explota(e.x, e.y - 52, 2); explota(e.x - 26, e.y - 88, 1); explota(e.x + 22, e.y - 24, 1);
  J.flash = 12; J.tiembla = 46;
  trozos(e.x, e.y - 60, 12); papeles(e.x, e.y - 60, 10); sueltaMonedas(e.x, e.y - 50, 24);
  suma(10000, e.x, e.y - 124);
  luego(44, () => { J.sello = 1; J.tiembla = 12; play('slam'); play('despido'); });
  luego(190, () => { J.fase = 'gana'; J.ft = 0; musica('win'); });
}
// qué dibujo le toca
function dibujoJefe(e) {
  const S = e.roto ? SPR.jefeRoto : SPR.jefe, t = e.t;
  if (e.est === 'cae') return S.alza;
  if (e.est === 'ruge') return (t >> 3) & 1 ? S.alza : S.rayo[0];
  if (e.est === 'cartas') { const u = e.roto && t >= 50 ? t - 36 : t; return u < 26 ? S.lanza[0] : u < 50 ? S.lanza[1] : S.quieto[0]; }
  if (e.est === 'golpe') { const T0 = e.roto ? 34 : 46; return t < T0 ? S.alza : t < T0 + 30 ? S.golpe : S.quieto[0]; }
  if (e.est === 'rayo') return S.rayo[(t >> 2) & 1];
  if (e.est === 'dano' || e.est === 'muere') return S.dano;
  return S.quieto[(t >> 3) % 4];
}
