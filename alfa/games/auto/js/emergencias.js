// Fans of Auto · LAS EMERGENCIAS: si cerca del jugador hay alguien tirado en el suelo llega una ambulancia (con sirena, por
// las calles), para al lado y lo «reinicia» (se levanta y sigue paseando); si hay un coche ardiendo o echando humo llega el
// camión de bomberos y lo apaga con la manguera. Solo hay una de cada a la vez; al terminar vuelven al tráfico normal. Se
// pueden robar como cualquier otro coche.
'use strict';

MODOS_IA.ambulancia = c => pasoEmergencia(c);
MODOS_IA.bomberos = c => pasoEmergencia(c);

function pasoEmergencias() {
  if (S.tick % 60 !== 0) return;
  const j = S.jugadores[0];
  liberaAtendidos();
  if (!hayEmergencia('ambulancia')) { const p = S.peatones.find(q => q.muerto > 120 && !q.atendido && dist(q, j) < 300); if (p) envia('ambulancia', p, j); }
  if (!hayEmergencia('bomberos')) { const c = S.coches.find(o => ardiendo(o) && !o.atendido && dist(o, j) < 300); if (c) envia('bomberos', c, j); }
}
// una emergencia en marcha: con su conductor, entera y en su modo (la chatarra o la robada no cuentan)
const enServicio = c => !c.chatarra && c.conductor === 'ia' && c.ia && (c.ia.modo === 'ambulancia' || c.ia.modo === 'bomberos');
const hayEmergencia = modo => S.coches.some(c => enServicio(c) && c.ia.modo === modo);
// quien estaba «atendido» por una emergencia que ya no existe (explotó, la robaron o se fue) vuelve a poder llamarla
function liberaAtendidos() {
  const vivos = new Set(S.coches.filter(enServicio).map(c => c.ia.objetivo));
  for (const o of [...S.peatones, ...S.coches]) if (o.atendido && !vivos.has(o)) o.atendido = false;
}
const ardiendo = c => c.fuego > 0 || (c.chatarra && c.humo > 0);
function envia(modo, objetivo, j) {
  const s = calleLejos(j, 160, 260);
  if (!s) return;
  const c = nuevoCoche(modo, s.x, s.y, Math.atan2(s.dy, s.dx), 'ia');
  Object.assign(c.ia, { modo, objetivo, fase: 'va', t: 0, salida: S.tick });
  c.sirena = true; objetivo.atendido = true;
}
function pasoEmergencia(c) {
  const ia = c.ia, o = ia.objetivo;
  if (ia.fase === 'va') vaHacia(c, o);
  else if (ia.fase === 'trabaja') trabaja(c, o);
}
function vaHacia(c, o) {
  const ia = c.ia, sigue = ia.modo === 'ambulancia' ? o.muerto > 0 : ardiendo(o);
  if (!sigue || S.tick - ia.salida > 1800) { acaba(c); return; }
  if (dist(c, o) < 34) { ia.fase = 'trabaja'; ia.t = 150; return; }
  const [tx, ty] = casillaDe(o.x, o.y);
  persigue(c, o, COCHES[c.tipo].vmax * 0.8, campoA(tx, ty, costeCoche));
  if (S.tick % 90 === c.id % 90 && dist(c, S.jugadores[0]) < 230) play('sirena');
}
function trabaja(c, o) {
  const ia = c.ia;
  conduceIA(c, null, 0);
  if (ia.modo === 'bomberos') { if (S.tick % 2 === 0) manguera(c, o); if (o.fuego > 0) o.fuego = Math.max(1, o.fuego - 3); }   // el agua frena el fuego
  if (--ia.t > 0) return;
  if (ia.modo === 'ambulancia') reanima(c); else apaga(o);
  acaba(c);
}
function manguera(c, o) {
  const a = anguloHacia(c, o) + S.az.entre(-0.2, 0.2), v = S.az.entre(1.5, 2.5);
  S.fx.push({ tipo: 'agua', x: c.x, y: c.y, dx: Math.cos(a) * v, dy: Math.sin(a) * v, t: 16 });
}
function reanima(c) {
  for (const p of S.peatones) {
    if (!p.muerto || dist(p, c) > 50) continue;
    Object.assign(p, { muerto: 0, estado: 'pasea', meta: null, vida: 10, atendido: false, espera: 30 });
    dice(p, ['¡REINICIADO!', '¡PARCHE APLICADO!', '¡OTRA VIDA, COMO EN LOS JUEGOS!', '¡RESPAWN!']);
  }
}
function apaga(o) {
  o.fuego = 0; o.humo = 0; o.atendido = false;
  if (!o.chatarra) o.vida = Math.max(o.vida, 15);
  dice(o, ['¡APAGADO!', '¡SIN DAÑOS EN LA PARTIDA GUARDADA!']);
}
// vuelve al tráfico normal, sin sirena
function acaba(c) {
  const o = c.ia.objetivo;
  if (o) o.atendido = false;
  Object.assign(c.ia, { modo: 'trafico', objetivo: null, ruta: null });
  c.sirena = false;
}
