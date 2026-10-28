// Fans of Goose · EL COOPERATIVO LIGERO (de 2 a 4, en línea): el mismo tablero, el mismo dado y el mismo derrumbe para todos, pero
// cada móvil lleva sus propias ocas (así se gasta muy poco cupo de mensajes del servidor; el cooperativo «de verdad», con las mismas
// ocas para todos, espera a Supabase Pro: docs/TODO.md). El anfitrión decide el dado y la línea del derrumbe, que persigue al que va
// más atrás. La Oca Madre tiene la vida compartida (cada uno pega a la suya y el daño se suma). Si caes, dejas una lápida: un
// compañero que se quede encima un momento te revive; si caes al abismo, vuelves solo junto a un compañero a los 10 s.
'use strict';

const esCoop = () => !!(JUEGO.carrera && JUEGO.carrera.modo === 'coop');
const anfitrionCoop = () => esCoop() && JUEGO.carrera.anfitrion;

function avanzaCoop(dt) {
  const J = JUEGO, C = J.carrera, yo = J.yo;
  C.tCoop = (C.tCoop || 0) - dt;
  if (C.tCoop <= 0) {
    C.tCoop = 1;
    if (C.anfitrion) mandaCarrera({ t: 'y', y: Math.round(J.yD) });
    if (C.danoJefe > 0) { mandaCarrera({ t: 'j', d: Math.round(C.danoJefe) }); C.danoJefe = 0; }
  }
  // los compañeros caídos: su lápida se revive quedándose encima
  if (!C.caido) {
    for (const [orden, r] of C.rivales) {
      if (!r.muerto || !r.tumba || r.abismo) { r.revT = 0; continue; }
      if (Math.hypot(yo.x - r.tumba.x, yo.y - r.tumba.y) < 16) {
        r.revT += dt;
        if (r.revT >= 1.5) { mandaCarrera({ t: 'r', a: orden }); r.tumba = null; r.revT = 0; texto(yo.x, yo.y - 22, tr('¡Has revivido a {n}!', { n: r.nombre }), r.color, 8, 1.4); SONIDO.cura(); anillo(yo.x, yo.y, 40, r.color, 0.5, 4); }
      } else r.revT = Math.max(0, r.revT - dt);
    }
  } else if (C.abismo) {   // caído al abismo: vuelves solo junto a un compañero
    C.autoRev -= dt;
    const vivo = [...C.rivales.values()].find(r => !r.muerto);
    if (C.autoRev <= 0 && vivo) revive(vivo.x, vivo.y);
  }
  // todos caídos: se acabó
  if (C.caido && [...C.rivales.values()].every(r => r.muerto || performance.now() - r.visto > 15000)) {
    C.tTodos = (C.tTodos || 0) + dt;
    if (C.tTodos > 2) terminaCoop(false);
  } else C.tTodos = 0;
}

function caidoCoop() {
  const J = JUEGO, C = J.carrera;
  C.caido = true; C.abismo = J.caidaAbismo; C.autoRev = 10;
  mandaCarrera({ t: 'm', c: J.mejorCasilla, x: Math.round(J.yo.x), y: Math.round(J.yo.y), ab: C.abismo ? 1 : 0 });
  aviso(C.abismo ? tr('Al abismo: vuelves en 10 s') : tr('¡Caído! Un compañero puede revivirte'), '#ff4d4d', 2.5);
}
function revive(x, y) {
  const J = JUEGO, C = J.carrera;
  C.caido = false; J.muerto = 0; J.caida = 0; J.vida = J.st.vidaMax * 0.5; J.invul = 2.5;
  J.yo.x = clamp(x, 10, CFG.W - 10); J.yo.y = Math.min(y, J.yD - 30);
  mandaCarrera({ t: 'R' });
  aviso(tr('¡DE VUELTA!'), '#7dff6b', 1.4); anillo(J.yo.x, J.yo.y, 50, '#7dff6b', 0.6, 5); SONIDO.posada(); vibra(60);
}
function terminaCoop(gana) {
  const J = JUEGO, C = J.carrera; if (!C || C.fin) return;
  C.fin = true;
  terminaPartida(gana);
  try { C.canal.cerrar(); } catch (e) { /* ya cerrado */ }
  if (AMIGOS.red) try { AMIGOS.red.salir(); } catch (e) { /* da igual */ }
  AMIGOS.red = null; AMIGOS.sala = null; AMIGOS.empezada = false;
}

// los mensajes propios del cooperativo (los demás los lleva mensajeCarrera)
function mensajeCoop(m, r) {
  const J = JUEGO, C = J.carrera;
  if (m.t === 'd') { if (!C.anfitrion) tiraDado(false, m.c); }
  else if (m.t === 'y') { C.yRemota = m.y; }
  else if (m.t === 'j') { if (J.jefe) { J.jefe.hp -= m.d; J.jefe.flash = 0.05; if (J.jefe.hp <= 0) mata(J.jefe); } else C.danoPendiente = (C.danoPendiente || 0) + m.d; }
  else if (m.t === 'v') { if (J.jefe) { J.jefe.hp = 0; mata(J.jefe); } else if (!J.victoria) { J.victoria = true; J.tVictoria = 3; J.muerto = 0; SONIDO.victoria(); aviso(tr('¡LA OCA MADRE HA CAÍDO!'), '#ffd34d', 2.5); } }
  else if (m.t === 'm') { r.muerto = true; r.c = m.c; r.abismo = !!m.ab; r.tumba = { x: m.x, y: m.y }; r.revT = 0; aviso(tr('¡{n} ha caído!', { n: r.nombre }), r.color, 1.6); }
  else if (m.t === 'R') { r.muerto = false; r.tumba = null; }
  else if (m.t === 'r') { if (m.a === C.yo && C.caido && !C.abismo) { revive(J.yo.x, J.yo.y); texto(J.yo.x, J.yo.y - 20, tr('{n} te ha revivido', { n: r.nombre }), r.color, 8, 1.6); } }
  else if (m.t === 'e') { anillo(r.x, r.y, 60, '#ffd34d', 0.5, 4); }
}

// el derrumbe en el cooperativo: el anfitrión lo calcula persiguiendo al más atrasado; los demás siguen su línea
function yReferenciaCoop() {   // la y del compañero vivo más atrasado (la más grande)
  const J = JUEGO; let y = J.muerto > 0 ? -1e9 : J.yo.y;
  for (const r of J.carrera.rivales.values()) if (!r.muerto && performance.now() - r.visto < 6000) y = Math.max(y, r.y);
  return y > -1e8 ? y : J.yo.y;
}
function derrumbeRemoto(dt) {
  const J = JUEGO, C = J.carrera; if (C.yRemota === undefined) return false;
  const antes = J.yD;
  J.yD += (C.yRemota - J.yD) * Math.min(1, dt * 2);
  J.yD = Math.max(J.yD, -(CFG.derrumbe.ultima - 1) * TH);
  return antes !== J.yD;
}

function pintaTumbas() {
  const J = JUEGO, C = J.carrera; if (!esCoop()) return;
  for (const r of C.rivales.values()) {
    if (!r.muerto || !r.tumba || r.abismo) continue;
    const t = r.tumba;
    pinta('ad-lapida', t.x, t.y, false, false, 1);
    G.globalAlpha = 0.5 + Math.sin(J.t * 6) * 0.2; G.strokeStyle = r.color; G.lineWidth = 1.5; G.beginPath(); G.arc(t.x, t.y, 16, 0, 6.283); G.stroke(); G.globalAlpha = 1;
    if (r.revT > 0) { G.strokeStyle = '#7dff6b'; G.lineWidth = 3; G.beginPath(); G.arc(t.x, t.y, 13, -1.57, -1.57 + 6.283 * Math.min(1, r.revT / 1.5)); G.stroke(); }
    etiqueta(tr('¡REVÍVEME!'), t.x, t.y - 14, r.color);
  }
}
