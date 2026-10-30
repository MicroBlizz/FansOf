// Fans of Rouflage · FANTASMAS CHIVATOS (extra «chivato», modos.js): un fantasma (colado despedido) puede traicionar a los suyos. Con el botón
// CHIVARSE (tecla C) elige al becario más cercano y le manda una pista de un colado vivo al azar: su nombre y una onda cerca de donde está (a los
// bots se la cuela como un silbido). Si ese becario despide a ALGUIEN en los CHIVATO.plazo segundos siguientes, el fantasma resucita como colado
// (sale por la cafetería con su pintura, descongelado, a buscarse otro sitio). Si no, pierde su poder de fantasma el resto de la partida.
// En el PvP el fantasma manda `cv` (becario, colado, x, y); el anfitrión apunta la apuesta y, si sale bien, resucita y manda `rv` a todos.
'use strict';

const CHIVATO = { plazo: 20, alcance: 170, apuestas: [] };      // apuestas: { f: fantasma (ente), h: becario (ente), t: segundos que quedan }

// el botón: solo con el extra, siendo fantasma de colado y sin apuesta en marcha ni poder perdido
const chivatoPuedo = () => extraOn('chivato') && espectando() && J.yo && J.yo.clase === 'camaleon' && J.fantasma && !J.fantasma.chivado && !J.fantasma.perdido;
function accionChivato() {
  if (!chivatoPuedo()) return;
  const f = J.fantasma, h = chivatoBecario(f.x, f.y);
  if (!h) { play('deny'); pista(tr('Acércate más a un becario'), 1.5); return; }
  const vivos = escondidos().filter(e => e !== J.yo); if (!vivos.length) { play('deny'); return; }
  const k = pick(vivos), a = rand(0, TAU), d = rand(30, 70), x = k.x + Math.cos(a) * d, y = k.y - 22 + Math.sin(a) * d;
  f.chivado = true; play('select');
  avisa(tr('Le has chivado a {h} dónde anda {k}. Si despide a alguien en {n} s, resucitas.', { h: h.nombre, k: k.nombre, n: CHIVATO.plazo }), 'aviso');
  chivatoAplica(J.yo, h, k, x, y);
  if (J.pvp) rfpManda({ t: 'cv', h: h.slot, k: k.slot, x: Math.round(x), y: Math.round(y) });
  refrescaHud(true);
}
function chivatoBecario(x, y) {
  let mejor = null, md = CHIVATO.alcance;
  for (const h of J.cazadores) { if (h.fuera || h.balas <= 0) continue; const d = lejos(x, y, h.x, h.y - 20); if (d < md) { md = d; mejor = h; } }
  return mejor;
}
// la pista llega al becario (en cada navegador, para su becario o los de la máquina) y, quien manda, apunta la apuesta
function chivatoAplica(f, h, k, x, y) {
  if (h.jugador) { avisa(tr('Un fantasma chivato: {k} anda por aquí', { k: k.nombre }), 'bueno'); play('tick'); ondaSilbido(x, y, k); }
  else if (h.bot && (!J.pvp || RFP.soyHost)) { const antes = REGLAS.oido; REGLAS.oido = 1e9; oyeSilbido(h, x, y); REGLAS.oido = antes; }
  if (!J.pvp || RFP.soyHost) CHIVATO.apuestas.push({ f, h, t: CHIVATO.plazo });
}
function rfpChivatoRecibido(m, sl) {
  const f = sl.ente, h = RFP.slots[m.h] && RFP.slots[m.h].ente, k = RFP.slots[m.k] && RFP.slots[m.k].ente;
  if (!extraOn('chivato') || !f || !f.fuera || !h || h.clase !== 'cazador' || !k) return;
  chivatoAplica(f, h, k, m.x, m.y);
}
// cada fotograma (quien manda): las apuestas caducan
function chivatoAvanza(dt) {
  if (!extraOn('chivato') || !CHIVATO.apuestas.length) return;
  for (const a of CHIVATO.apuestas) a.t -= dt;
  const caducas = CHIVATO.apuestas.filter(a => a.t <= 0);
  for (const a of caducas) chivatoFalla(a.f);
  if (caducas.length) CHIVATO.apuestas = CHIVATO.apuestas.filter(a => a.t > 0);
}
// alguien ha despedido a alguien (lo llama despide): ¿cumple alguna apuesta?
function chivatoDespido(k, por) {
  if (!extraOn('chivato') || !por || !(!J.pvp || RFP.soyHost)) return;
  const hechas = CHIVATO.apuestas.filter(a => a.h === por && a.f !== k);
  if (!hechas.length) return;
  CHIVATO.apuestas = CHIVATO.apuestas.filter(a => a.h !== por);
  for (const a of hechas) { resucita(a.f); if (J.pvp) rfpManda({ t: 'rv', s: a.f.slot }); }
}
function chivatoFalla(f) {
  if (f.jugador && J.fantasma) { J.fantasma.perdido = true; J.fantasma.poder = null; avisa(tr('Tu chivatazo no ha servido: te quedas sin poderes'), 'malo'); refrescaHud(true); }
  if (J.pvp && !f.jugador) rfpManda({ t: 'rv', s: f.slot, no: 1 });
}
// ¡vuelve a la vida! Sale por la cafetería con su pintura, descongelado: que se busque otro sitio
function resucita(e) {
  if (!e || !e.fuera || e.clase !== 'camaleon') return;
  e.fuera = false; e.tFuera = 0; e.congelado = false; e.hielo = 0; e.vx = e.vy = 0; e.tDespido = null; e.silbido = REGLAS.primerSilbido; e.avisado = false; e.invis = 0;
  const n = Math.max(0, e.slot), p = SALIDA_CAMALEONES[n % SALIDA_CAMALEONES.length]; e.x = p[0]; e.y = p[1];
  if (e.red) e.red = { x: e.x, y: e.y, m: false, mi: 1, di: e.dir };
  if (e.bot) { e.bot.estado = 'ir'; e.bot.camino = null; e.sitio = eligeSitio(e, J.camaleones.filter(k => k !== e && k.sitio).map(k => k.sitio)); }
  fxSalpica(e.x, e.y - 30, '#cfe9ff', 14); fxTexto(e.x, e.y - 70, tr('¡Ha vuelto!'), '#cfe9ff'); play('crown');
  if (e.jugador) { J.fantasma = null; J.peligro = 0; cartel(tr('¡RESUCITADO!'), tr('Tu chivatazo ha funcionado: corre a esconderte otra vez'), true); refrescaHud(true); }
  else avisa(tr('{a} ha resucitado', { a: e.nombre }), J.yo && J.yo.clase === 'camaleon' ? 'bueno' : 'malo');
}
function rfpResucitaRecibido(m) {
  const e = RFP.slots[m.s] && RFP.slots[m.s].ente; if (!e || !extraOn('chivato')) return;
  if (m.no) { if (e.jugador) chivatoFalla(e); return; }
  resucita(e);
}
// el botón CHIVARSE (al lado del poder)
function refrescaChivato() {
  const b = E('b-chivato'); if (!b) return;
  const ver = chivatoPuedo(); if (b.hidden === ver) b.hidden = !ver;
}
