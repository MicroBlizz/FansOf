// Fans of Goose · MEJORAS NUEVAS (31-10-2026, Daniel). En la partida, dos armas y dos pasivas:
//  · FICHA DE PARCHÍS (arma): salta en arco sobre la oca con más vida y «se la come» (mucho daño a una sola; si la tumba, cuenta 20: te curas).
//  · TINTERO DEL ESCRIBA (arma): vas dejando manchas de tinta que frenan a las ocas y les pican.
//  · RUEDA DE LA FORTUNA (pasiva): cada poco gira y te da 8 s de un poder al azar (fuerza, prisa, imán o cura).
//  · RELOJ DE ARENA (pasiva): cada poco se para el tiempo: las ocas se quedan quietas y sus balas caen al suelo.
// Evoluciones: Ficha + Rueda = PARCHÍS DE CUATRO COLORES; Tintero + Reloj = TINTA DEL TIEMPO.
// Y tres de la tienda: PACIENCIA (premio por esperar con el dado listo), SEGURO DE VIDA (al perder te devuelve parte de lo gastado en la
// Posada y el Mercader) y TALISMÁN DE LA NOCHE (en cada partida anula una regla de la noche al azar; lo llama modNoche).
// Lo llaman armasMas y pintaArmasMas (js/armas3.js), terminaPartida (js/partida.js) y modNoche (js/noches.js). Todo pixel art.
'use strict';

Object.assign(NIV, {
  ficha: { cd: [2.4, 2.2, 2.0, 1.8, 1.5], n: [1, 1, 2, 2, 3], dano: [40, 55, 70, 85, 110] },
  tintero: { cd: [1.4, 1.3, 1.2, 1.0, 0.8], r: [12, 14, 16, 18, 22], dps: [6, 8, 10, 13, 17] },
});
Object.assign(ARMAS, {
  ficha: { nombre: 'Ficha de parchís', icono: 'ficha', color: '#ff5a4d',
    niveles: ['Salta sobre la oca con más vida y se la come.', 'Muerde más fuerte.', 'Dos fichas.', 'Salta más a menudo.', 'Tres fichas que muerden fortísimo.'],
    evo: { pasiva: 'rueda', nombre: 'Parchís de cuatro colores', desc: 'Cuatro fichas que se comen el doble a los jefes.' } },
  tintero: { nombre: 'Tintero del escriba', icono: 'tintero', color: '#6b5bd6',
    niveles: ['Dejas manchas de tinta que frenan y pican.', 'Manchas más grandes.', 'Pican más.', 'Más a menudo.', 'Charcos de tinta enormes.'],
    evo: { pasiva: 'arena', nombre: 'Tinta del tiempo', desc: 'Las ocas que pisan la tinta se quedan clavadas.' } },
});
Object.assign(PASIVAS, {
  rueda: { nombre: 'Rueda de la fortuna', desc: 'Cada poco, 8 s de un poder al azar.', icono: 'rueda' },
  arena: { nombre: 'Reloj de arena', desc: 'Cada poco se para el tiempo 2,5 s.', icono: 'arena' },
});
Object.assign(ICONO_PNG, { ficha: 'i-ficha', tintero: 'i-tintero', rueda: 'i-rueda', arena: 'i-arena', paciencia: 'i-paciencia', seguro: 'i-seguro', talisman: 'i-talisman' });

const FICHAS = [], MANCHAS = [];
const RUEDA_PODERES = [
  { id: 'fuerza', nombre: '¡FUERZA!', color: '#ff5a4d' },
  { id: 'prisa', nombre: '¡PRISA!', color: '#6bf2ff' },
  { id: 'iman', nombre: '¡IMÁN!', color: '#ffd34d' },
  { id: 'cura', nombre: '¡CURA!', color: '#7dff6b' },
];
// el poder de la rueda en marcha (lo miran multiDado y multiVel de js/armas.js y js/dado.js)
const poderRueda = id => JUEGO.rueda && JUEGO.rueda.id === id && JUEGO.rueda.t > 0;

function armasCuatro(A, dt) {
  const J = JUEGO;
  if (A.ficha && A.ficha.t <= 0) armaFicha(A.ficha);
  if (A.tintero && A.tintero.t <= 0) armaTintero(A.tintero);
  avanzaFichas(dt); avanzaManchas(dt);
  // la Rueda de la fortuna
  const pr = J.pasivas.rueda || 0;
  if (J.rueda && J.rueda.t > 0) J.rueda.t -= dt;
  if (pr) { J.tRueda = (J.tRueda === undefined ? 12 : J.tRueda) - dt; if (J.tRueda <= 0) { J.tRueda = 30 - pr * 4; giraRueda(); } }
  // el Reloj de arena
  const pa = J.pasivas.arena || 0;
  if (pa) { J.tArena = (J.tArena === undefined ? 15 : J.tArena) - dt; if (J.tArena <= 0) { J.tArena = 42 - pa * 5; paraElTiempo(); } }
  if (J.tiempoParado > 0) J.tiempoParado -= dt;
  // la Paciencia de la tienda: con el dado listo y quieto, cada 6 s, plumas doradas y monedas
  const pc = nivelMejora('paciencia');
  if (pc && puedeTirar() && !ENTRADA.mx && !ENTRADA.my) {
    J.tPaciencia = (J.tPaciencia || 0) + dt;
    if (J.tPaciencia >= 6) {
      J.tPaciencia = 0; J.impulso = Math.min(plumasDado(), J.impulso + pc * 2); J.monedasPartida += Math.ceil(pc / 2);
      texto(J.yo.x, J.yo.y - 16, tr('¡PACIENCIA! +{n}', { n: Math.ceil(pc / 2) }), '#ffd34d', 7, 0.9); SONIDO.moneda();
    }
  } else J.tPaciencia = 0;
}
function vaciaArmasCuatro() { FICHAS.length = 0; MANCHAS.length = 0; const J = JUEGO; J.rueda = null; J.tRueda = undefined; J.tArena = undefined; J.tiempoParado = 0; J.tPaciencia = 0; J.gastado = 0; }

// --- ficha: salta en arco hasta la oca con más vida cercana y se la come ---
function armaFicha(a) {
  const yo = JUEGO.yo, n = a.evo ? 4 : nv('ficha', 'n'), dano = (a.evo ? 120 : nv('ficha', 'dano')) * JUEGO.st.dano * multiDado();
  const cerca = enemigosCerca(yo.x, yo.y, 150), lista = [];
  for (let k = 0; k < cerca; k++) { const e = ENE.lista[CERCA[k]]; if (e.hp > 0 && !e.oculta && Math.hypot(e.x - yo.x, e.y - yo.y) < 150) lista.push(e); }
  lista.sort((p, q) => q.hp - p.hp);
  for (let i = 0; i < n && i < lista.length && FICHAS.length < 12; i++) FICHAS.push({ x0: yo.x, y0: yo.y, e: lista[i], t: 0, dur: 0.4, dano, evo: a.evo, color: ['#ff5a4d', '#ffd34d', '#4dc96b', '#4d8aff'][i % 4] });
  a.t = (a.evo ? 1.3 : nv('ficha', 'cd')) * JUEGO.st.cd; if (lista.length) SONIDO.lanza();
}
function avanzaFichas(dt) {
  for (let i = FICHAS.length - 1; i >= 0; i--) {
    const f = FICHAS[i]; f.t += dt;
    if (f.t < f.dur) continue;
    FICHAS.splice(i, 1);
    const e = f.e; if (e.hp <= 0) continue;
    danar(e, f.dano * (f.evo && esJefeGrande(e) ? 2 : 1), 0, -1, 60, false);
    estallido(e.x, e.y, 8, f.color, 80, 0.35, 2, 1); tiembla(1);
    if (e.hp <= 0) { const J = JUEGO; J.vida = Math.min(J.st.vidaMax, J.vida + 2); texto(e.x, e.y - 10, tr('¡COMIDA!'), f.color, 6, 0.6); }
  }
}

// --- tintero: manchas en el suelo donde pisas ---
function armaTintero(a) {
  const yo = JUEGO.yo, r = (a.evo ? 24 : nv('tintero', 'r')) * multiArea();
  if (MANCHAS.length < 14) MANCHAS.push({ x: yo.x + (Math.random() - 0.5) * 8, y: yo.y + 4, r, t: a.evo ? 5 : 4, max: a.evo ? 5 : 4, dps: (a.evo ? 20 : nv('tintero', 'dps')) * JUEGO.st.dano, evo: a.evo, tic: 0 });
  a.t = (a.evo ? 0.7 : nv('tintero', 'cd')) * JUEGO.st.cd;
}
function avanzaManchas(dt) {
  for (let i = MANCHAS.length - 1; i >= 0; i--) {
    const m = MANCHAS[i]; m.t -= dt; if (m.t <= 0 || m.y > JUEGO.yD) { MANCHAS.splice(i, 1); continue; }
    m.tic -= dt; const pica = m.tic <= 0; if (pica) m.tic = 0.4;
    const n = enemigosCerca(m.x, m.y, m.r + 8);
    for (let k = 0; k < n; k++) {
      const e = ENE.lista[CERCA[k]]; if (e.hp <= 0 || e.oculta || (e.x - m.x) ** 2 + ((e.y - m.y) / 0.6) ** 2 > (m.r + e.r * 0.5) ** 2) continue;
      if (m.evo && !esJefeGrande(e)) e.raiz = Math.max(e.raiz || 0, 0.5);
      else e.lento = 0.2;   // la tinta frena a la mitad (lo mira avanzaEnemigos)
      if (pica) danar(e, m.dps * 0.4, 0, 0, 0, true);
    }
  }
}

// --- la rueda de la fortuna y el reloj de arena ---
function giraRueda() {
  const J = JUEGO, P = RUEDA_PODERES[Math.floor(Math.random() * RUEDA_PODERES.length)];
  J.rueda = { id: P.id, t: 8 };
  aviso(tr(P.nombre), P.color, 1.2); anillo(J.yo.x, J.yo.y, 30, P.color, 0.5, 3); SONIDO.nivel();
  if (P.id === 'cura') J.vida = Math.min(J.st.vidaMax, J.vida + J.st.vidaMax * 0.3);
  if (P.id === 'iman') { const l = PLUMAS.lista; for (let i = 0; i < PLUMAS.n; i++) l[i].atraida = true; }
}
function paraElTiempo() {
  const J = JUEGO, l = ENE.lista;
  J.tiempoParado = 2.5;
  for (let i = 0; i < ENE.n; i++) { const e = l[i]; if (e.hp > 0 && !esJefeGrande(e)) e.raiz = Math.max(e.raiz || 0, 2.5); }
  BALAS.vacia();
  aviso(tr('¡EL TIEMPO SE PARA!'), '#c9b98a', 1.2); destella('#e8dcb0', 0.3); SONIDO.dadoRueda();
}

// --- la tienda: Seguro de vida (lo llama terminaPartida) y Talismán de la Noche (lo llama modNoche) ---
function seguroDeVida(gana) {
  const J = JUEGO, n = nivelMejora('seguro');
  if (gana || !n || !J.gastado) return 0;
  return Math.round(J.gastado * 0.2 * n);
}
const REGLAS_NOCHE = ['vida', 'oleada', 'derrumbe', 'jefes', 'dano', 'cura', 'elites', 'vel', 'madre'];
const REGLA_NOMBRE = { vida: 'Ocas duras', oleada: 'La horda', derrumbe: 'Tablero impaciente', jefes: 'Jefes de hierro', dano: 'Picotazos', cura: 'Sin piedad', elites: 'Élites', vel: 'Prisa eterna', madre: 'La Noche de la Oca' };
function talismanNoche(M) {
  if (!nivelMejora('talisman') || JUEGO.diario || JUEGO.contrarreloj || JUEGO.carrera) return M;
  const activas = REGLAS_NOCHE.filter(k => M[k] !== 1);
  if (!activas.length) return M;
  const k = activas[Math.floor(Math.random() * activas.length)];
  M[k] = 1; if (k === 'madre') M.tuVida = 1;
  M.talisman = k;
  return M;
}

// --- dibujo: las fichas en arco (el icono de Yoshi, o un punto de píxeles) y las manchas de tinta ---
function pintaArmasCuatro() {
  const J = JUEGO;
  for (const m of MANCHAS) { G.globalAlpha = Math.min(0.85, m.t / m.max * 1.6); disco(m.x, m.y, Math.round(m.r), Math.round(m.r * 0.6), m.evo ? '#2a1d4d' : '#1a1430'); disco(m.x - m.r * 0.25, m.y - m.r * 0.12, Math.round(m.r * 0.3), Math.round(m.r * 0.15), m.evo ? '#6b5bd6' : '#3a2f66'); }
  G.globalAlpha = 1;
  for (const f of FICHAS) {
    const k = Math.min(1, f.t / f.dur), x = f.x0 + (f.e.x - f.x0) * k, y = f.y0 + (f.e.y - f.y0) * k - Math.sin(k * Math.PI) * 30;
    if (SPR['ic-ficha']) pinta('ic-ficha', x, y, false, false, 0.6); else { G.fillStyle = f.color; puntoPixel(x, y, 5); }
  }
  if (J.tiempoParado > 0) {   // el tiempo parado: la pantalla en sepia unos instantes
    G.globalAlpha = Math.min(0.18, J.tiempoParado * 0.2); G.fillStyle = '#c9b98a'; G.fillRect(-20, J.camY - 20, CFG.W + 40, PAN.H + 40); G.globalAlpha = 1;
  }
}
