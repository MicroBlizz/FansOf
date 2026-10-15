// Fans of Rouflage · MÁS EXTRAS de la sala con amigos (modos.js): OJO DE HALCÓN (los colados suman mucho más por quedarse quietos dentro de la luz
// de un becario, y más cuanto más cerca: gana quien se esconde a la vista), EL BUFÓN (un colado recibe en secreto el papel de bufón: solo gana si lo
// despiden en el último minuto; antes, pierde) y el SILBATO CALIENTE (un colado lleva un silbato que silba solo cada poco y se oye el doble; se lo
// pasa a otro colado tocándole, y quien lo recibe se queda clavado tres segundos; cada SILBATO.plazo segundos explota y quien lo tenga sale despedido).
// En el PvP el bufón sale de la semilla de la sala (igual en todos) y el silbato lo lleva el anfitrión (va en su «a» como `sb`).
'use strict';

const HALCON = { peso: 30, pesoNormal: 12 };            // lo que vale cada segundo delante de sus narices
const BUFON = { ultimo: 60, premio: 300, castigo: 100 };   // el último minuto, lo que gana si lo logra y lo que pierde si lo despiden antes
const SILBATO = { cada: 8, plazo: 45, roce: 44, pasmo: 3, t: 0, quien: null, tPase: 0 };

// ---------- al empezar la caza: se reparten los papeles secretos ----------
function modoEmpiezaCaza() {
  idaEmpieza();      // Ida y vuelta: de cada colado sale su becario (modos-ida.js)
  const vivos = escondidos(); if (!vivos.length) return;
  const azar = J.pvp ? rfpAzar(RFP.info.semilla + 7) : Math.random;
  if (extraOn('bufon')) {
    const b = vivos[Math.floor(azar() * vivos.length)]; b.bufon = true;
    if (b.jugador) { cartel(tr('ERES EL BUFÓN'), tr('Solo ganas si te despiden en el último minuto. Nadie más lo sabe.'), true); play('recta'); }
  }
  if (extraOn('silbato')) { SILBATO.t = SILBATO.plazo; SILBATO.tPase = 0; if (!J.pvp || RFP.soyHost) silbatoPon(vivos[Math.floor(Math.random() * vivos.length)], true); }
}
function modoLimpia() { SILBATO.quien = null; SILBATO.t = 0; CHIVATO.apuestas = []; BOTE.gotas = []; BOTE.cubo = null; BOTE.n = 0; BOTE.lleno = false; }

// ---------- OJO DE HALCÓN: lo que vale cada segundo congelado dentro de una luz (1 normal; en el modo, de 1 a 3 según lo cerca que esté el becario) ----------
function modoNarices(e) {
  if (!extraOn('halcon')) return 1;
  let md = 1e9; for (const h of J.cazadores) if (!h.fuera && h.balas > 0) md = Math.min(md, lejos(h.x, h.y, e.x, e.y));
  const f = 1 + 2 * limita(1 - md / REGLAS.luzLargo, 0, 1);
  if (e.jugador && Math.random() < 0.08) fxTexto(e.x + rand(-10, 10), e.y - 64, '+' + Math.round(f * HALCON.peso / 10), '#7ee04a', 12);
  return f;
}

// ---------- SILBATO CALIENTE ----------
function silbatoPon(e, primero) {
  if (!e || e.fuera || SILBATO.quien === e) return;
  const antes = SILBATO.quien; if (antes) { antes.silbato = false; }
  SILBATO.quien = e; e.silbato = true; e.silbido = Math.min(e.silbido, SILBATO.cada); SILBATO.tPase = 1.5;
  if (!primero) { congela(e); e.pasmo = SILBATO.pasmo; }      // quien lo recibe se queda clavado un momento
  fxTexto(e.x, e.y - 70, tr('¡El silbato!'), '#ff4b5c'); play(primero ? 'tick' : 'pop');
  if (e.jugador) { avisa(primero ? tr('Te toca el silbato caliente: pásaselo a otro colado tocándole') : tr('¡Te han pasado el silbato caliente!'), 'malo'); refrescaHud(true); }
  else if (antes && antes.jugador) avisa(tr('Le has pasado el silbato a {a}', { a: e.nombre }), 'bueno');
}
function silbatoAvanza(dt) {
  if (!extraOn('silbato') || J.fase !== 'caza') return;
  for (const e of J.camaleones) if (e.pasmo > 0) { e.pasmo -= dt; if (!e.congelado && !e.fuera) congela(e); }
  SILBATO.tPase = Math.max(0, SILBATO.tPase - dt);
  const q = SILBATO.quien; if (!q) return;
  const manda = !J.pvp || RFP.soyHost;
  SILBATO.t -= dt;
  if (Math.floor(SILBATO.t) !== Math.floor(SILBATO.t + dt)) refrescaHud();
  if (!manda) return;
  if (q.fuera) { const v = escondidos(); if (v.length) silbatoPon(v[Math.floor(Math.random() * v.length)], true); SILBATO.t = SILBATO.plazo; return; }
  // el pase: el que lo lleva, en marcha, roza a otro colado
  if (!q.congelado && SILBATO.tPase <= 0) for (const e of J.camaleones) if (e !== q && !e.fuera && lejos(e.x, e.y, q.x, q.y) < SILBATO.roce) { silbatoPon(e, false); return; }
  // un bot con el silbato se pone nervioso y va a buscar a otro colado para endosárselo
  if (q.bot && SILBATO.t < 26 && q.bot.estado === 'quieto' && q.bot.mana > 0.3) {
    let cerca = null, md = 1e9; for (const e of J.camaleones) if (e !== q && !e.fuera) { const d = lejos(e.x, e.y, q.x, q.y); if (d < md) { md = d; cerca = e; } }
    if (cerca) { descongela(q); q.sitio = [cerca.x, cerca.y]; q.prisa = 1.06; if (ponRumbo(q, cerca.x, cerca.y)) { q.bot.estado = 'huir'; fxTexto(q.x, q.y - 70, tr('¡Ay!'), '#fff6ea'); } else congela(q); }
  }
  if (SILBATO.t <= 0) {      // ¡BUM!
    fxSalpica(q.x, q.y - 26, '#ff4b5c', 24); play('sello');
    avisa(tr('¡El silbato ha explotado en manos de {a}!', { a: q.jugador ? tr('ti') : q.nombre }), q.jugador ? 'malo' : 'aviso');
    despide(q, null); q.silbato = false; SILBATO.quien = null; SILBATO.t = SILBATO.plazo;
    const v = escondidos(); if (v.length > 1) silbatoPon(v[Math.floor(Math.random() * v.length)], true);
  }
}
// PvP: el anfitrión dice quién lleva el silbato (en su «a»): los demás se lo ponen
const silbatoSlot = () => extraOn('silbato') && SILBATO.quien ? SILBATO.quien.slot : undefined;
function silbatoRecibido(s) { if (s === undefined || !extraOn('silbato')) return; const e = RFP.slots[s] && RFP.slots[s].ente; if (e && e !== SILBATO.quien) silbatoPon(e, !SILBATO.quien); }
// lo que ve el que lo lleva, debajo del reloj
function silbatoTexto() { return extraOn('silbato') && SILBATO.quien ? tr('Silbato: {a} · {n} s', { a: SILBATO.quien.jugador ? tr('TÚ') : SILBATO.quien.nombre, n: Math.max(0, Math.ceil(SILBATO.t)) }) : ''; }

// ---------- al terminar: lo que cambian los extras en el resultado ----------
function modoResultado(r, victoria) {
  const yo = J.yo;
  if (extraOn('bufon')) for (const e of J.entes) if (e.bufon) {
    const logro = e.fuera && e.tDespido != null && e.tDespido <= BUFON.ultimo, fallo = e.fuera && !logro;
    e.bonus = (e.bonus || 0) + (logro ? BUFON.premio : fallo ? -BUFON.castigo : 0);
    const quien = e.jugador ? tr('Tú') : e.nombre;
    r.sub += ' ' + (logro ? tr('El bufón era {a}: le han despedido en el último minuto y gana.', { a: quien }) : fallo ? tr('El bufón era {a}: le han despedido demasiado pronto.', { a: quien }) : tr('El bufón era {a}: nadie le ha hecho caso.', { a: quien }));
    if (e === yo) { r.titulo = logro ? tr('¡EL BUFÓN GANA!') : fallo ? tr('BUFÓN DESPEDIDO ANTES DE HORA') : r.titulo; if (logro) { r.victoria = true; r.estrellas = Math.max(r.estrellas, 2); } }
  }
  if (extraOn('halcon')) { r.ranking = clasificacion(); const top = r.ranking[0]; if (top) r.sub += ' ' + tr('Ojo de halcón: gana {a} con {n} puntos.', { a: top.nombre, n: top.puntos }); }
  if (modoEs('retrato') || modoEs('ida')) { r.ranking = clasificacion(); const top = r.ranking[0]; if (top) { r.titulo = top.jugador ? tr('¡GANAS TÚ!') : tr('¡GANA {a}!', { a: top.nombre }); r.sub = modoEs('ida') ? tr('Ida y vuelta: solo gana uno, y es quien más puntos suma.') : tr('Retrato robot: solo gana uno, y es quien más puntos suma.') + ' ' + r.sub; r.victoria = !!top.jugador; r.estrellas = top.jugador ? 3 : Math.min(r.estrellas, 1); } }
  r.ranking = clasificacion(); r.puntos = marcadorDe(yo);
}
