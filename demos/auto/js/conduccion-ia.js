// Fans of Auto · CÓMO CONDUCE LA IA: el volante de todos los coches que no lleva el jugador (gira hacia un punto y busca una
// velocidad, sin derrapes, y se desatasca dando marcha atrás) y el tráfico normal: sigue su carril casilla a casilla, frena
// antes de girar, cruza los cruces por dentro, para en rojo, deja pasar a lo que tiene delante (coches, peatones y el jugador)
// y cada conductor tiene su carácter: tranquilo, bocinero, agresivo (si le das, te persigue) o miedica (si le das o le
// disparan, huye a toda prisa). Los Moderadores, las bandas y las emergencias añaden su forma de conducir en MODOS_IA.
'use strict';

// qué hace cada coche de la IA según su modo (policia.js y emergencias.js añaden los suyos)
const MODOS_IA = { trafico: c => pasoTrafico(c), venganza: c => pasoVenganza(c), huye: c => pasoTrafico(c) };
function pasoIA(c) { (MODOS_IA[c.ia.modo] || MODOS_IA.trafico)(c); }

const CARACTERES = ['tranquilo', 'tranquilo', 'tranquilo', 'tranquilo', 'tranquilo', 'tranquilo', 'bocinero', 'bocinero', 'agresivo', 'miedica'];
function nuevaIA(tipo) {
  const caracter = S.az.elige(CARACTERES), D = COCHES[tipo];
  const ritmo = caracter === 'agresivo' ? 0.66 : caracter === 'miedica' ? 0.5 : 0.56;
  return { modo: 'trafico', ambar: null, caracter, vCrucero: D.vmax * ritmo, ruta: null, i: 0, espera: 0, atasco: 0, atras: 0, totalAtasco: 0, bloqueado: 0, cuela: 0, hasta: 0 };
}

/* ---------- el volante ---------- */
// gira hacia obj (o con giroFijo si va marcha atrás sin objetivo) y acelera o frena hasta vObj; el coche no resbala
function conduce(c, obj, vObj, giroFijo = 0) {
  const D = COCHES[c.tipo], cs = Math.cos(c.ang), sn = Math.sin(c.ang);
  let v = c.vx * cs + c.vy * sn;
  const max = D.giro * 1.9 * Math.min(1, Math.abs(v) / 0.5 + 0.15);
  const a0 = c.ang;
  if (obj) {
    const dif = difAng(c.ang, Math.atan2(obj.y - c.y, obj.x - c.x));
    c.ang += acota(dif, -max, max);
    if (Math.abs(dif) > 1.1) vObj = Math.min(vObj, 0.75);
  } else c.ang += acota(giroFijo, -max, max);
  if (cocheChoca(c)) c.ang = a0;   // no girar si el morro o la cola se meten en una pared
  v += acota(vObj - v, -0.14, D.acel);
  // lo de lado (un empujón) se va apagando; lo de frente es exactamente la velocidad que quiere
  const vl = (-c.vx * sn + c.vy * cs) * 0.5, cs2 = Math.cos(c.ang), sn2 = Math.sin(c.ang);
  c.vx = cs2 * v - sn2 * vl; c.vy = sn2 * v + cs2 * vl;
  c.w = 0; c.derrapa = 0;
  mueveCoche(c, false);
  if (c.bocina > 0) c.bocina--;
}
// el volante con cuidado: si quiere andar y no se mueve, da marcha atrás un momento y rehace el camino
function conduceIA(c, obj, vObj) {
  const ia = c.ia;
  if (ia.atras > 0) { ia.atras--; conduce(c, null, -0.8, ia.giroAtras); if (ia.atras === 0) ia.ruta = null; return; }
  if (ia.espera > 0) { ia.espera--; vObj = 0; }
  conduce(c, obj, vObj);
  if (vObj > 0.4 && Math.hypot(c.vx, c.vy) < 0.12) {
    if (++ia.atasco > 50) { ia.atasco = 0; ia.atras = 40; ia.giroAtras = S.az() < 0.5 ? -0.06 : 0.06; ia.totalAtasco += 90; }
  } else ia.atasco = 0;
}
// perseguir un punto por las calles: en línea recta si se ve cerca, si no por el campo de caminos
function persigue(c, destino, vObj, campo) {
  const recto = seVe(c, destino, 90);
  const obj = recto ? destino : puntoCampo(campo, c.x, c.y, 2) || destino;
  conduceIA(c, obj, vObj);
}

/* ---------- el tráfico normal ---------- */
function pasoTrafico(c) {
  const ia = c.ia;
  if (!ia.ruta || ia.i >= ia.ruta.length) nuevaRuta(c);
  if (ia.fuera) { vuelveACarril(c); return; }
  const obj = esquiva(c, objetivoRuta(c));
  if (!obj) { conduceIA(c, null, 0); ia.totalAtasco++; return; }
  const huye = ia.modo === 'huye';
  if (huye && S.tick > ia.hasta) { ia.modo = 'trafico'; ia.ruta = null; }
  let vObj = huye ? COCHES[c.tipo].vmax * 0.8 : ia.vCrucero;
  vObj = Math.min(vObj, frenoCurva(c), huye ? 9 : frenoSemaforo(c), frenoObstaculo(c));
  conduceIA(c, obj, vObj);
  ia.totalAtasco = ia.bloqueado > 300 ? ia.totalAtasco + 1 : Math.max(0, ia.totalAtasco - 0.2);
}
// fuera de la red de carriles (una explanada, o lo han empujado): va por el campo de caminos hasta el carril más cercano
function vuelveACarril(c) {
  const ia = c.ia, [tx, ty] = ia.fuera;
  if (dist(c, centroCasilla(tx, ty)) < 10 || esCarril(...casillaDe(c.x, c.y))) { ia.fuera = null; ia.ruta = null; return; }
  persigue(c, centroCasilla(tx, ty), 1.2, campoA(tx, ty, costeCoche));
  ia.totalAtasco += 0.5;
}
// para adelantar a lo que no se mueve (un coche abandonado, chatarra, una barrera): el punto se aparta al otro carril
// hasta haberlo dejado atrás
function esquiva(c, obj) {
  const ia = c.ia, q = ia.esquivaDe;
  if (!obj || !q) return obj;
  const pasado = (q.x - c.x) * Math.cos(c.ang) + (q.y - c.y) * Math.sin(c.ang) < -26;
  if (pasado || --ia.esquiva <= 0) { ia.esquivaDe = null; return obj; }
  return { x: obj.x + Math.sin(c.ang) * 15, y: obj.y - Math.cos(c.ang) * 15 };
}
// el siguiente punto del camino (centro de la casilla); al llegar cerca pasa al siguiente
function objetivoRuta(c) {
  const ia = c.ia;
  while (ia.ruta && ia.i < ia.ruta.length) {
    const [tx, ty] = ia.ruta[ia.i], p = { x: tx * T + T / 2, y: ty * T + T / 2 }, d = dist(c, p);
    if (d > 44) { ia.ruta = null; return null; }   // se ha salido del camino: se rehace en el siguiente paso
    if (d >= 9) return p;
    ia.i++;
  }
  return null;
}
// el camino de aquí al otro lado del siguiente cruce
function nuevaRuta(c) {
  const ia = c.ia, [tx, ty] = casillaDe(c.x, c.y);
  ia.i = 0; ia.parada = -1; ia.linea = null; ia.fuera = null;
  if (esCarril(tx, ty)) ia.ruta = rutaPorCarril(c, tx, ty);
  else if (esCruce(tx, ty)) ia.ruta = rutaDesdeCruce(c, tx, ty);
  else { ia.ruta = null; ia.fuera = carrilCercano(tx, ty, 12); }
}
function rutaPorCarril(c, tx, ty) {
  const ia = c.ia, [dx, dy] = carrilEn(tx, ty), ruta = [];
  let x = tx, y = ty;
  for (let n = 0; n < 30; n++) {
    const nx = x + dx, ny = y + dy;
    if (esCruce(nx, ny)) {
      // la línea de parada está una casilla antes del cruce (el paso de cebra queda libre); se respeta hasta haber entrado
      ia.parada = ruta.length; ia.linea = { x: (x + nx + 1) * T / 2 - dx * T, y: (y + ny + 1) * T / 2 - dy * T };   // antes del paso de cebra
      ia.cruce = RUTAS.cruceDe[idx(nx, ny)]; ia.eje = ejeDe(dx, dy);
      return ruta.concat(pasoPorCruce(nx, ny, [dx, dy], eligeSalida(c, MAPA.cruces[ia.cruce], [dx, dy])));
    }
    if (!esCarril(nx, ny)) break;
    x = nx; y = ny; ruta.push([x, y]);
  }
  return ruta.length ? ruta : null;
}
// dentro de un cruce (al rehacer el camino ahí): directo a la salida que más se parece a hacia dónde mira, y de ahí a su carril
function rutaDesdeCruce(c, tx, ty) {
  const q = MAPA.cruces[RUTAS.cruceDe[idx(tx, ty)]], cs = Math.cos(c.ang), sn = Math.sin(c.ang);
  if (!q.salidas.length) return null;
  const s = q.salidas.reduce((m, o) => (o.d[0] * cs + o.d[1] * sn > m.d[0] * cs + m.d[1] * sn ? o : m));
  return [[s.x, s.y]];
}
// por dentro del cruce: se sigue recto hasta quedar alineado con la salida y entonces se gira hacia ella
function pasoPorCruce(ex, ey, dir, salida) {
  const ruta = [[ex, ey]];
  if (!salida) return ruta;
  let x = ex, y = ey;
  for (let n = 0; n < 6 && (x !== salida.x || y !== salida.y); n++) {
    const alineado = salida.d[0] !== 0 ? y === salida.y : x === salida.x;
    if (alineado) { x += salida.d[0]; y += salida.d[1]; } else { x += dir[0]; y += dir[1]; }
    ruta.push([x, y]);
  }
  return ruta;
}
// la salida del cruce: nunca dar la vuelta; recto la mitad de las veces; quien huye, la que más le aleja del jugador
function eligeSalida(c, q, dir) {
  const ops = q.salidas.filter(s => s.d[0] !== -dir[0] || s.d[1] !== -dir[1]);
  if (!ops.length) return null;
  if (c.ia.modo === 'huye') { const j = S.jugadores[0]; return ops.reduce((m, s) => (dist(centroCasilla(s.x, s.y), j) > dist(centroCasilla(m.x, m.y), j) ? s : m)); }
  const recto = ops.find(s => s.d[0] === dir[0] && s.d[1] === dir[1]);
  return recto && S.az() < 0.5 ? recto : S.az.elige(ops);
}
// la casilla de carril más cercana (para volver a la calzada si lo han sacado)
function carrilCercano(tx, ty, r) {
  if (esCarril(tx, ty)) return [tx, ty];
  for (let d = 1; d <= r; d++) for (let y = ty - d; y <= ty + d; y++) for (let x = tx - d; x <= tx + d; x++) {
    if (Math.max(Math.abs(x - tx), Math.abs(y - ty)) === d && esCarril(x, y)) return [x, y];
  }
  return null;
}

/* ---------- los frenos ---------- */
// antes de una curva, despacio
function frenoCurva(c) {
  const ia = c.ia, r = ia.ruta;
  if (!r) return 9;
  for (let k = ia.i; k < Math.min(r.length - 1, ia.i + 3); k++) {
    const a = k > 0 ? r[k - 1] : casillaDe(c.x, c.y), b = r[k], n = r[k + 1];
    if ((b[0] - a[0]) !== (n[0] - b[0]) || (b[1] - a[1]) !== (n[1] - b[1])) return 1.0;
  }
  return 9;
}
// en ámbar o en rojo para en la línea (salvo si ya está encima con el ámbar); ia.parada es el índice de la primera casilla
// del cruce en el camino: mientras no se haya llegado a ella, manda el semáforo
function frenoSemaforo(c) {
  const ia = c.ia;
  if (ia.parada < 0 || !ia.linea || ia.i > ia.parada + 1 || esCruce(...casillaDe(c.x, c.y))) { ia.ambar = null; return 9; }
  const color = luz(MAPA.cruces[ia.cruce], ia.eje, S.tick);
  if (color === 'verde') { ia.ambar = null; return 9; }
  const d = dist(c, ia.linea), v = Math.hypot(c.vx, c.vy);
  // en ámbar se decide una vez: si no le da tiempo a parar antes de la línea, pasa
  if (color === 'ambar' && ia.ambar === null) ia.ambar = d - 12 < v * v / 0.28 + 2 ? 'pasa' : 'para';
  if (color === 'ambar' && ia.ambar === 'pasa') return 9;
  return Math.max(0, (d - 12) * 0.09);
}
// lo que tiene delante: frena para quedarse a unos 16 píxeles
function frenoObstaculo(c) {
  const ia = c.ia;
  if (ia.cuela > 0) { ia.cuela--; return 9; }
  const o = delante(c, 60);
  if (!o) { ia.bloqueado = 0; return 9; }
  const v = Math.max(0, (o.d - 22) * 0.11);   // más de lo que miden dos coches, para no empujar al de delante
  if (v < 0.1) esperaDelante(c, o);
  return v;
}
// qué hay delante del coche y a qué distancia (otro coche, un peatón vivo o el jugador a pie)
function delante(c, alcance) {
  const cs = Math.cos(c.ang), sn = Math.sin(c.ang), j = S.jugadores[0];
  let mejor = null;
  const mira = (o, ancho, quien) => {
    const dx = o.x - c.x, dy = o.y - c.y, f = dx * cs + dy * sn;
    if (f > 0 && f < alcance && Math.abs(-dx * sn + dy * cs) < ancho && (!mejor || f < mejor.d)) mejor = { d: f, quien };
  };
  for (const o of S.coches) if (o !== c && o !== c.ia.esquivaDe) mira(o, 10, o);
  for (const p of S.peatones) if (!p.muerto) mira(p, 8, p);
  if (j.coche === null && !j.muerto && !j.baneado) mira(j, 8, j);
  return mejor;
}
// parado detrás de algo: el bocinero pita; si dos coches se esperan el uno al otro, pasa el más antiguo
function esperaDelante(c, o) {
  const ia = c.ia;
  ia.bloqueado++;
  if (ia.bloqueado === 50 && ia.caracter === 'bocinero') pita(c);
  if (ia.bloqueado % 120 === 90 && o.quien === S.jugadores[0]) pita(c);   // al jugador plantado en la calzada le pita cualquiera
  const q = o.quien, otro = q && q.ia;
  if (ia.bloqueado > 140 && otro && otro.bloqueado > 60 && c.id < q.id) { ia.cuela = 50; ia.bloqueado = 0; }
  if (ia.bloqueado > 90 && q && q.tipo && noSeMueve(q)) { ia.esquivaDe = q; ia.esquiva = 300; ia.bloqueado = 0; }
}
// un coche que no va a arrancar: sin conductor, chatarra o una barrera
function noSeMueve(q) { return q.chatarra || q.conductor === null || (q.ia && q.ia.rol === 'barrera'); }
function pita(c) {
  c.bocina = 40;
  if (dist(c, S.jugadores[0]) < 220) { play('claxon'); dice(c, ['¡PIIII!', '¡VAMOS, QUE ES PARA HOY!', '¡ESTO NO ES UNA BETA!']); }
}
function dice(o, frases) { S.fx.push({ tipo: 'frase', x: o.x, y: o.y - 12, t: 80, texto: S.az.elige(frases) }); }

/* ---------- el carácter: qué hace cuando le das o le disparan ---------- */
function reacciona(c, porque) {
  const ia = c.ia;
  if (!ia || ia.modo !== 'trafico') return;
  const R = REACCIONES[ia.caracter] || REACCIONES.tranquilo;
  R(c, porque);
}
const REACCIONES = {
  tranquilo: c => { c.ia.espera = 30; dice(c, ['¡OIGA!', '¡MI SEGURO NO CUBRE ESTO!']); },
  bocinero: c => { pita(c); c.ia.espera = 20; },
  agresivo: (c, porque) => {
    if (porque === 'tiro') return REACCIONES.miedica(c);
    c.ia.modo = 'venganza'; c.ia.hasta = S.tick + 1200; dice(c, ['¡TE VAS A ENTERAR!', '¡ESE COCHE ERA DE ESTRENO!', '¡TE DENUNCIO EN LOS FOROS!']);
  },
  miedica: c => { c.ia.modo = 'huye'; c.ia.hasta = S.tick + 600; c.ia.ruta = null; dice(c, ['¡SOCORRO!', '¡YO NO HE VISTO NADA!', '¡MAMÁ!']); },
};
// el agresivo te persigue y te embiste un rato; si te pierde o se cansa, vuelve a su carril
function pasoVenganza(c) {
  const ia = c.ia, j = S.jugadores[0], pj = posJugador(j);
  if (S.tick > ia.hasta || dist(c, pj) > 350 || j.muerto || j.baneado) { ia.modo = 'trafico'; ia.ruta = null; pasoTrafico(c); return; }
  const [tx, ty] = casillaDe(pj.x, pj.y);
  persigue(c, pj, COCHES[c.tipo].vmax * 0.85, campoA(tx, ty, costeCoche));
  if (S.tick % 90 === 0) pita(c);
}
// dónde está el jugador (su coche si conduce)
function posJugador(j) { return j.coche !== null ? (S.coches.find(c => c.id === j.coche) || j) : j; }
