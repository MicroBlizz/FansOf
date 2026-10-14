// Fans of Crush · PARTIDA: las reglas de un nivel. Movimientos, objetivos, puntos, estrellas, el jefe de RRHH, las HORAS EXTRA,
// los potenciadores y el final (ganar o perder). No dibuja nada: avisa con crEv y los efectos y las pantallas lo cuentan.
'use strict';
const CR_P = { N: null, movs: 0, puntos: 0, obj: [], estado: 'nada', jefe: null, bec: null, horas: 0, mas5: 0, estrellas: 0, quieto: 0, pista: null, premio: null, mejorOla: 0 };
const CR_PUNTOS = { ficha: 30, especial: 60, cinta: 50, capa: 20, traba: 120, becario: 1000, h: 120, v: 120, b: 200, l: 300, hora: 300 };

function crCuenta(fn) { let n = 0; for (let y = 0; y < CR_T.h; y++) for (let x = 0; x < CR_T.w; x++) if (fn(x, y)) n++; return n; }
function crEmpieza(id) {
  const N = crNivel(id); if (!N) return false;
  crParaTodo(); CR_CAYENDO.clear();
  Object.assign(CR_P, { N, movs: N.movs, puntos: 0, estado: 'jugando', horas: 0, mas5: 0, estrellas: 0, quieto: 0, pista: null, premio: null, mejorOla: 0 });
  CR_T.gen = crGenera;
  crTableroNuevo(N);
  CR_P.obj = N.obj.map(o => ({ t: o.t, c: o.c, n: o.n || 0, hecho: 0, total: o.n || 0 }));
  for (const o of CR_P.obj) {
    if (o.t === 'cinta') o.total = crCuenta((x, y) => CR_T.cinta[y][x]);
    if (o.t === 'hielo') o.total = crCuenta((x, y) => CR_T.traba[y][x] && CR_T.traba[y][x].t === 'hielo');
    if (o.t === 'caja') o.total = crCuenta((x, y) => CR_T.traba[y][x] && CR_T.traba[y][x].t === 'caja');
  }
  CR_P.bec = { tablero: crCuenta((x, y) => CR_T.p[y][x] && CR_T.p[y][x].t === 'e'), quedan: N.becarios || 0 };
  CR_P.jefe = N.jefe ? { vida: N.jefe.vida, max: N.jefe.vida, cada: N.jefe.cada, cuenta: N.jefe.cada, golpe: 0 } : null;
  crEv('empieza', N);
  return true;
}
const crObjListo = o => (o.t === 'puntos' ? CR_P.puntos >= o.n : o.t === 'jefe' ? CR_P.jefe && CR_P.jefe.vida <= 0 : o.hecho >= o.total);
const crTodoListo = () => CR_P.obj.every(crObjListo);
// las fichas nuevas que caen por arriba: casi siempre una cara al azar; a veces, un becario (si el nivel tiene más por salir)
function crGenera(x) {
  const B = CR_P.bec;
  if (B && B.quedan > 0 && B.tablero < 2 && CR_P.movs < CR_P.N.movs - 2 && Math.random() < 0.1) { B.quedan--; B.tablero++; return crNuevaFicha(-1, 'e'); }
  return crNuevaFicha(crColorAzar());
}

/* ---------- lo que cuenta: puntos, objetivos y el jefe ---------- */
const crMult = () => 1 + 0.5 * (CR_JUGADA.ola - 1);
function crSuma(n) { CR_P.puntos += Math.round(n); }
function crDanaJefe(n, x, y) {
  const J = CR_P.jefe; if (!J || J.vida <= 0) return;
  J.vida = Math.max(0, J.vida - n); J.golpe = 1;
  crEv('jefe-golpe', n, x, y);
}
crOye('despide', (p, x, y, causa) => {
  const especial = p.t !== 'n';
  crSuma((especial ? CR_PUNTOS.especial : CR_PUNTOS.ficha) * crMult());
  for (const o of CR_P.obj) if (o.t === 'color' && o.c === p.c && o.hecho < o.total) { o.hecho++; crEv('objetivo', o, p, x, y); break; }
  crDanaJefe(especial ? 3 : 1, x, y);
});
crOye('cinta', (x, y) => { crSuma(CR_PUNTOS.cinta); const o = CR_P.obj.find(q => q.t === 'cinta'); if (o && o.hecho < o.total) { o.hecho++; crEv('objetivo', o, null, x, y); } });
crOye('traba', () => crSuma(CR_PUNTOS.capa));
crOye('rompe', (x, y, t) => {
  crSuma(CR_PUNTOS.traba);
  const o = CR_P.obj.find(q => q.t === t); if (o && o.hecho < o.total) { o.hecho++; crEv('objetivo', o, null, x, y); }
  crDanaJefe(3, x, y);
});
crOye('rescate', (p, x, y) => {
  crSuma(CR_PUNTOS.becario); if (CR_P.bec) CR_P.bec.tablero--;
  const o = CR_P.obj.find(q => q.t === 'becario'); if (o && o.hecho < o.total) { o.hecho++; crEv('objetivo', o, p, x, y); }
});
crOye('especial', p => crSuma(CR_PUNTOS[p.t] || 0));
crOye('ola', n => { CR_P.mejorOla = Math.max(CR_P.mejorOla, n); });

/* ---------- el turno ---------- */
function crIntenta(ax, ay, bx, by) {
  if (CR_P.estado !== 'jugando' || crOcupado()) return false;
  if (!crMovible(ax, ay) || !crMovible(bx, by) || Math.abs(ax - bx) + Math.abs(ay - by) !== 1) return false;
  CR_P.quieto = 0; CR_P.pista = null;
  crArranca(crTurno(ax, ay, bx, by));
  return true;
}
function* crTurno(ax, ay, bx, by) {
  const r = {};
  yield* crJugada(ax, ay, bx, by, r);
  if (!r.vale) return;
  CR_P.movs--; crEv('movs', CR_P.movs);
  yield* crTrasJugada(true);
}
function* crTrasJugada(gasta) {
  if (crTodoListo()) { yield* crHorasExtra(); crGana(); return; }
  if (CR_P.movs <= 0) { crPierde(); return; }
  const J = CR_P.jefe;
  if (gasta && J && J.vida > 0 && --J.cuenta <= 0) yield* crJefeAtaca();
  if (!crJugadas(1).length) yield* crReestructura();
}
function* crReestructura() { crEv('baraja'); yield 0.7; crBaraja(); yield 0.6; yield* crResuelve(null); }
// el jefe de RRHH: «congelación salarial». Cambia unas cuantas caras por StarBots congelados
function* crJefeAtaca() {
  const J = CR_P.jefe, mitad = J.vida <= J.max / 2, n = mitad ? 4 : 3, sitios = [];
  for (let y = 0; y < CR_T.h; y++) for (let x = 0; x < CR_T.w; x++) { const p = CR_T.p[y][x]; if (p && p.t === 'n' && !p.muere && !CR_T.traba[y][x] && y > CR_T.boca[x]) sitios.push([x, y]); }   // nunca en la boca de una columna: la dejaría sin fichas nuevas
  shuffle(sitios); const elegidos = sitios.slice(0, n);
  J.cuenta = mitad ? Math.max(2, J.cada - 1) : J.cada;
  crEv('jefe-ataca', elegidos);
  yield 0.75;
  for (const [x, y] of elegidos) { CR_T.p[y][x] = null; CR_T.traba[y][x] = { t: 'hielo', vida: 1 }; crEv('congela', x, y); }
  yield 0.45;
}
// HORAS EXTRA: los movimientos que sobran se convierten en cohetes y después estalla todo lo especial que quede
function* crHorasExtra() {
  if (CR_P.movs > 0) {
    crEv('horas-extra', CR_P.movs);
    yield 1.2;
    while (CR_P.movs > 0) {
      const lista = [];
      for (let y = 0; y < CR_T.h; y++) for (let x = 0; x < CR_T.w; x++) { const p = CR_T.p[y][x]; if (p && p.t === 'n' && !p.muere && !CR_T.traba[y][x]) lista.push(p); }
      if (!lista.length) break;
      const p = lista[Math.floor(Math.random() * lista.length)];
      p.t = Math.random() < 0.5 ? 'h' : 'v'; p.nace = 1;
      CR_P.movs--; CR_P.horas++; crSuma(CR_PUNTOS.hora); crEv('horas-mov', p, CR_P.movs);
      yield 0.12;
    }
    yield 0.4;
  }
  for (let vuelta = 0; vuelta < 40; vuelta++) {
    const esp = [];
    for (let y = 0; y < CR_T.h; y++) for (let x = 0; x < CR_T.w; x++) { const p = CR_T.p[y][x]; if (p && !p.muere && p.t !== 'n' && p.t !== 'e' && !CR_T.traba[y][x]) esp.push(p); }
    if (!esp.length) break;
    CR_JUGADA.ola = 1; CR_JUGADA.n = (CR_JUGADA.n || 0) + 1;
    esp.forEach((p, i) => crProgramar(i * 0.07, () => { if (!p.muere && CR_T.p[p.y][p.x] === p) crDespide(p.x, p.y, 'especial'); }));
    yield* crResuelve(null);
  }
}
function crGana() {
  const N = CR_P.N, est = CR_P.puntos >= N.est[2] ? 3 : CR_P.puntos >= N.est[1] ? 2 : 1;
  CR_P.estado = 'gana'; CR_P.estrellas = est;
  const antes = SAVE.niveles[N.id] || { e: 0, p: 0 }, primera = !antes.e;
  const nuevas = Math.max(0, est - antes.e), oro = 30 + 15 * est + 10 * CR_P.horas + (primera ? 50 : 0);
  SAVE.niveles[N.id] = { e: Math.max(antes.e, est), p: Math.max(antes.p, CR_P.puntos) };
  SAVE.oro += oro; SAVE.maletin += nuevas;
  CR_P.premio = { oro, nuevas, primera, record: CR_P.puntos > antes.p && !primera };
  crGuarda();
  crEv('gana', CR_P);
}
function crPierde() { CR_P.estado = 'pierde'; crEv('pierde', CR_P); }
// la segunda oportunidad: +5 movimientos (con un café o con oro) y se sigue donde estaba
function crMasMovs(n) {
  CR_P.movs += n; CR_P.mas5++; CR_P.estado = 'jugando'; crEv('movs', CR_P.movs); crEv('cafe', n);
  if (!crJugadas(1).length) crArranca(crReestructura());
}

/* ---------- los potenciadores ---------- */
function crPuedePote(tipo) { return CR_P.estado === 'jugando' && !crOcupado() && (SAVE.potes[tipo] || 0) > 0; }
function crUsaPote(tipo, x, y) {
  if (!crPuedePote(tipo)) return false;
  if (tipo === 'martillo') {
    if (!crDentro(x, y)) return false;
    const p = CR_T.p[y][x]; if (!CR_T.traba[y][x] && (!p || p.t === 'e' || p.muere)) return false;
    SAVE.potes.martillo--; crGuarda(); CR_P.quieto = 0; CR_P.pista = null;
    crArranca((function* () { yield* crMartillo(x, y); yield* crTrasJugada(false); })());
  } else if (tipo === 'cafe') {
    SAVE.potes.cafe--; crGuarda(); CR_P.movs += 5; crEv('movs', CR_P.movs); crEv('cafe', 5);
  } else if (tipo === 'mezcla') {
    SAVE.potes.mezcla--; crGuarda(); CR_P.quieto = 0; CR_P.pista = null;
    crArranca(crReestructura());
  }
  crEv('pote', tipo, x, y);
  return true;
}
// la pista: tras unos segundos sin jugar, la mejor jugada (o una de las mejores) se mueve sola para avisar
function crBuscaPista() {
  const J = crJugadas();
  if (!J.length) return null;
  J.sort((a, b) => b.valor - a.valor);
  const top = J.filter(j => j.valor >= J[0].valor - 1);
  return top[Math.floor(Math.random() * top.length)];
}
