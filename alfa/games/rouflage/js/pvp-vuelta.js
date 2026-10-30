// Fans of Rouflage (prototipo) · PvP: volver a una partida abierta y dejarla del todo. Si se cae la conexión o se cierra la pestaña NO es irse: la plaza queda (los demás te dan por
// «desconectado», y un becario se queda en manos de la máquina) y, mientras la sala siga abierta, BUSCAR PARTIDA te devuelve a ella. Al volver pides el estado al anfitrión (hv) y él te manda
// una foto de cómo va todo (sn) y las pieles de los camaleones congelados; hasta que llega no mandas nada ni mandas tú. Irse a propósito (RENDIRSE) sí es definitivo: el servidor te saca
// de la sala y la siguiente búsqueda te mete en otra. Mensajes (t): hv «ponme al día» · sn la foto del anfitrión para quien volvió (a).
'use strict';

// ---------- la sala en la que estabas (en este navegador): vale unos minutos ----------
const RFP_VUELTA = { clave: 'rouflage-pvp-sala', minutos: 6, esperaFoto: 7 };
function rfpGuardaSala(sala) { try { localStorage.setItem(RFP_VUELTA.clave, JSON.stringify({ sala, t: Date.now() })); } catch (_) { /* da igual */ } }
function rfpOlvidaSala() { try { localStorage.removeItem(RFP_VUELTA.clave); } catch (_) { /* da igual */ } }
function rfpSalaGuardada() {
  try { const g = JSON.parse(localStorage.getItem(RFP_VUELTA.clave) || 'null'); return g && g.sala && Date.now() - g.t < RFP_VUELTA.minutos * 60000 ? g.sala : null; } catch (_) { return null; }
}

// ---------- el que vuelve: pide la foto cada segundo hasta que llega (o se rinde y sigue con lo que oiga) ----------
function rfpEmpiezaVuelta() {
  RFP.vuelta = true; RFP.sinPiel = true; RFP.tHv = 0.4; RFP.nHv = 0;
  cartel(tr('Volviendo a la partida…'), tr('Poniéndote al día con los demás'));
}
function rfpPideEstado(dt) {
  RFP.tHv -= dt; if (RFP.tHv > 0) return;
  RFP.tHv = 1; RFP.nHv++;
  if (RFP.nHv > RFP_VUELTA.esperaFoto) { RFP.vuelta = false; setTimeout(() => { RFP.sinPiel = false; }, 3000); return; }      // nadie contesta: sigue con lo que oiga
  rfpManda({ t: 'hv' });
}
// el anfitrión: la foto de cómo va todo y las pieles de los camaleones que ya están congelados (por si quien vuelve las perdió)
function rfpMandaEstado(a) {
  if (!RFP.soyHost || a === RFP.yo) return;
  const es = J.entes.map(e => [e.slot, r1(e.x), r1(e.y), e.congelado ? 1 : 0, e.fuera ? 1 : 0, e.balas | 0, e.mira, Math.round(e.dir * 100) / 100]);
  rfpManda({ t: 'sn', a, f: J.fase, r: r1(J.reloj), tf: r1(J.tFase), es, md: MODO, cg: contagiados(), ido: Object.keys(RFP.ido).filter(k => RFP.ido[k]).map(Number), ls: Array.from(RFP.listos) });
  let n = 0;
  for (const e of J.camaleones) if (!e.fuera && e.congelado) setTimeout(() => { if (RFP.activo && e.congelado) rfpMandaPiel(e); }, 150 + 90 * n++);
}
// quien volvió recibe la foto: se pone en la fase y el reloj de los demás y cada uno donde estaba
function rfpAplicaEstado(m) {
  if (!RFP.vuelta || m.a !== RFP.yo) return;
  RFP.vuelta = false; setTimeout(() => { RFP.sinPiel = false; }, 4000);      // da tiempo a que llegue mi piel (si no llega, tampoco había que mandar una en blanco)
  if (m.md) modoPon(m.md); contagiaSlots(m.cg);
  for (const [s, x, y, c, fu, ba, mi, di] of m.es || []) {
    const e = RFP.slots[s] && RFP.slots[s].ente; if (!e) continue;
    e.x = x; e.y = y; e.mira = mi; e.dir = di; if (e.clase === 'cazador') e.balas = ba;
    if (c) e.congelado = true;
    if (s !== RFP.yo) { const r = e.red || (e.red = {}); r.vx = 0; r.vy = 0; r.t = undefined; rfpFijaRed(r, x, y); r.m = false; r.mi = mi; r.di = di; }
    if (fu) rfpApartar(e);
  }
  RFP.listos = new Set(m.ls || []);
  if (m.f in FASES && m.f !== 'fin' && m.f !== J.fase) cambiaFase(m.f);
  J.reloj = m.r; J.tFase = m.tf || 0;
  for (const s of m.ido || []) rfpSeVa(s);
  E('cartel').hidden = true; avanzaCamara(0, true); refrescaHud(true);
}

// ---------- los demás: alguien se desconecta o vuelve (no es lo mismo que irse) ----------
function rfpAusente(sl) {
  if (!sl.humano || sl.ausente || RFP.ido[sl.s] || !sl.ente) return;
  sl.ausente = true; const e = sl.ente;
  avisa(tr('{a} se ha desconectado', { a: e.nombre }), 'aviso');
  if (e.fuera) return;
  if (e.clase === 'cazador') { e.humano = false; if (RFP.soyHost) rfpCogeIA(e, []); }      // su becario lo lleva la máquina mientras no está
  else if (!e.congelado) congela(e);      // el camaleón se queda quieto donde estaba
}
function rfpVuelve(sl) {
  if (!sl.ausente) return;
  sl.ausente = false; const e = sl.ente;
  avisa(tr('{a} ha vuelto', { a: e.nombre }), 'aviso');
  if (e.clase === 'cazador' && !e.fuera) { e.humano = true; if (!e.remoto) rfpSueltaIA(e); }
}
