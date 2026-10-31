// Fans of Goose · LA OCA PARCA: el jefe de la casilla de la Muerte (58). Un esqueleto de oca con capucha y una guadaña de hueso de
// ala. Tres fases: las HOCES (lanza hoces que rebotan por la casilla), la COSECHA (a mitad de vida siega la casilla de lado a lado:
// hay que saltar con dos toques, y llama ocas zombi) y el REGATEO (casi muerta se para y te ofrece el trato: si pierdes, vuelves
// a la casilla 55 con la mitad de vida; si ganas, te deja pasar y suelta su guadaña, un arma única de esta partida).
// Sus 25 fotogramas (img/parca-*.png) salen de Yoshi; si faltan, se usa el base.
'use strict';

const PARCA = { vida: 1500, r: 24, hoces: 1.4, siega: 1.1, zombis: 4 };
// los fotogramas por estado: [nombres...] y su ritmo
const PARCA_ANIM = {
  aparece: ['parca-ap1', 'parca-ap2', 'parca-ap3', 'parca-ap4', 'parca-ap5'],
  flota: ['parca-fl1', 'parca-fl2', 'parca-fl3', 'parca-fl4'],
  lanza: ['parca-lz1', 'parca-lz2', 'parca-lz3'],
  alza: ['parca-al1', 'parca-al2', 'parca-al3'],
  siega: ['parca-sg1', 'parca-sg2', 'parca-sg3', 'parca-sg4'],
  llama: ['parca-ll1', 'parca-ll2'],
  herida: ['parca-he1'],
  regateo: ['parca-rg1', 'parca-rg2'],
  muere: ['parca-mu1', 'parca-mu2', 'parca-mu3'],
};
const PARCA_PNG = [...new Set(Object.values(PARCA_ANIM).flat())].concat(['parca', 'parca-hoz', 'parca-guadana', 'zombi']);

function empiezaParca() {
  const J = JUEGO, t = CFG.muerte;
  for (let i = ENE.n - 1; i >= 0; i--) ENE.lista[i].hp = 0;
  BALAS.vacia();
  const e = creaEnemigo('oca', centroX(t), yCentro(t) - 36); if (!e) return;
  e.tipo = 'parca'; e.hpMax = e.hp = PARCA.vida * (1 + J.nivel * 0.05) * J.mod.jefes; e.r = PARCA.r; e.vel = 18; e.dano = 20; e.xp = 0;
  e.estado = 'aparece'; e.f2 = 2.2; e.cd = 0; e.fase = 0; e.siegaX = 0; e.siegaDir = 1; e.animT = 0;
  J.minijefe = e; J.fase = 'parado'; J.escena = { tipo: 'parca', cx: centroX(t), cy: yCentro(t), r: 999, nombre: 'LA OCA PARCA' };
  J.farolApagado = 0.5;
  aviso(tr('LA MUERTE'), '#ff2d2d', 2.5); aviso2(tr('La Oca Parca viene a por ti'));
  SONIDO.muerte(); SONIDO.jefe(); tiembla(8); destella('#000', 0.7); vibra([200, 100, 300]);
}
const esParca = e => e.tipo === 'parca';

function mueveParca(e, dt, ux, uy, d) {
  const J = JUEGO, yo = J.yo, E = J.escena; e.f2 -= dt; e.cd -= dt; e.animT += dt;
  const mitad = e.hp < e.hpMax * 0.5, casi = e.hp < e.hpMax * 0.12;
  if (e.estado === 'aparece') { if (e.f2 <= 0) { e.estado = 'flota'; e.f2 = 1.5; } return [0, 0]; }
  if (e.estado === 'regateo') return [0, 0];
  avanzaJefe2(e, dt, mitad);   // escudo, zonas rojas y gran ataque (js/jefes2.js)
  if (casi && !e.regateado) { e.regateado = true; e.estado = 'regateo'; e.animT = 0; J.trato = { t: 0 }; aviso(tr('¿UN TRATO?'), '#c9a0ff', 2.5); aviso2(tr('Acepta y vuelves a la 55 con media vida. Rechaza y acábala')); SONIDO.posada(); return [0, 0]; }
  // fase 2: la cosecha
  if (mitad && e.fase === 0) { e.fase = 1; e.estado = 'alza'; e.f2 = 0.9; e.animT = 0; aviso(tr('¡LA COSECHA!'), '#ff2d2d', 1.6); aviso2(tr('Salta la guadaña con dos toques')); SONIDO.jefeCarga(); }
  if (e.estado === 'alza') { if (e.f2 <= 0) { e.estado = 'siega'; e.f2 = PARCA.siega; e.animT = 0; e.siegaDir = yo.x > e.x ? 1 : -1; e.siegaX = e.x; SONIDO.latigo(5); tiembla(5); } return [0, 0]; }
  if (e.estado === 'siega') {   // la hoja barre la casilla de lado a lado; si no estás en el aire, te corta
    const w = anchoDe(J.casilla), x0 = centroX(J.casilla) - w / 2, k = 1 - e.f2 / PARCA.siega;
    e.siegaX = e.siegaDir > 0 ? x0 + k * w : x0 + w - k * w;
    if (J.invul <= 0 && J.saltoParca <= 0 && Math.abs(yo.x - e.siegaX) < 8 && Math.abs(yo.y - e.y) < 70) heridaJugador(28, e.siegaX, yo.y + 10);
    if (e.f2 <= 0) { e.estado = 'llama'; e.f2 = 1; e.animT = 0; for (let i = 0; i < PARCA.zombis; i++) { const z = creaEnemigo('oca', e.x + (i - 1.5) * 22, e.y + 30); if (z) { z.tipo = 'zombi'; z.hp = z.hpMax *= 2.2; z.vel *= 0.7; z.caida = 0.5; } } SONIDO.pozo(); }
    return [0, 0];
  }
  if (e.estado === 'llama') { if (e.f2 <= 0) { e.estado = 'flota'; e.f2 = 2.5; } return [0, 0]; }
  // fase 1 (y entre cosechas): flota a tu alrededor y lanza hoces
  if (e.estado === 'lanza') { if (e.f2 <= 0) { e.estado = 'flota'; e.f2 = mitad ? 2.2 : 3; } return [0, 0]; }
  if (e.cd <= 0) {
    e.cd = PARCA.hoces * (mitad ? 0.7 : 1); e.estado = 'lanza'; e.f2 = 0.45; e.animT = 0;
    const n = mitad ? 3 : 2;
    for (let i = 0; i < n; i++) { const an = Math.atan2(uy, ux) + (i - (n - 1) / 2) * 0.5; disparaBala(e.x, e.y, Math.cos(an) * 75, Math.sin(an) * 75, 11, 'hoz', 4); const b = BALAS.lista[BALAS.n - 1]; if (b) { b.rebota = 2; b.vida = 5; } }
    SONIDO.dadoArma();
  }
  if (e.f2 <= 0 && mitad && e.fase === 1 && Math.random() < 0.004) { e.estado = 'alza'; e.f2 = 0.9; e.animT = 0; }   // otra cosecha de vez en cuando
  const a = e.t * 0.9, tx = yo.x + Math.cos(a) * 55, ty = yo.y - 20 + Math.sin(a) * 25, dd = Math.hypot(tx - e.x, ty - e.y) || 1;
  return [(tx - e.x) / dd, (ty - e.y) / dd];
}

// las hoces rebotan en los bordes de la casilla
function rebotaHoz(b) {
  if (!b.rebota) return;
  const J = JUEGO, w = anchoDe(J.casilla), cx = centroX(J.casilla), top = -J.casilla * TH + 4, bottom = -(J.casilla - 1) * TH - 4;
  if ((b.x < cx - w / 2 && b.vx < 0) || (b.x > cx + w / 2 && b.vx > 0)) { b.vx = -b.vx; b.rebota--; SONIDO.rebote(); }
  if ((b.y < top && b.vy < 0) || (b.y > bottom && b.vy > 0)) { b.vy = -b.vy; b.rebota--; SONIDO.rebote(); }
  if (b.rebota <= 0) b.rebota = 0;
}

// el salto para esquivar la guadaña (dos toques, como el dado)
function saltaParca() {
  const J = JUEGO; if (!J.minijefe || !esParca(J.minijefe) || J.saltoParca > 0) return false;
  J.saltoParca = 0.55; anillo(J.yo.x, J.yo.y + 8, 14, '#f6e7b8', 0.3, 2); SONIDO.lanza(); return true;
}

// el regateo: dos botones
function pintaTrato() {
  const J = JUEGO; if (!J.trato) return;
  const W = PAN.W, H = PAN.H; J.trato.t += 1 / 60;
  caja(14, H - 120, W - 28, 100, 10, 'rgba(10,4,16,.94)', '#c9a0ff', 2);
  texto2(tr('LA PARCA TE OFRECE UN TRATO'), W / 2, H - 106, 8, '#c9a0ff', 'center', FUENTE_G, 400, 0.25);
  parrafo(tr('«Vuelve a la casilla 55 con media vida y te dejo en paz. O quédate… y acaba lo que empezaste.»'), 24, H - 92, W - 48, 6.5, '#e8dcc0');
  boton(20, H - 56, (W - 50) / 2, 28, tr('ACEPTAR'), '#6e4a8a', () => aceptaTrato(), 9, tr('a la 55, media vida'));
  boton(30 + (W - 50) / 2, H - 56, (W - 50) / 2, 28, tr('RECHAZAR'), '#c0402f', () => rechazaTrato(), 9, tr('¡acábala!'));
}
function aceptaTrato() {
  const J = JUEGO, e = J.minijefe; if (!J.trato) return;
  J.trato = null; J.minijefe = null; J.escena = null; e.hp = 0; e.xp = 0;
  for (let i = ENE.n - 1; i >= 0; i--) ENE.lista[i].hp = 0; BALAS.vacia();
  const atras = CFG.muerte - CFG.muerteAtras;
  J.vida = Math.max(1, J.vida * 0.5); J.invul = 1.5; J.yo.x = centroX(atras); J.yo.y = yCentro(atras); J.casilla = atras; J.fase = 'parado'; J.quieto = 0; J.parcaHecha = true;
  J.yD = Math.max(J.yD, yCentro(atras) + TH * 1.6);
  aviso(tr('«Nos veremos, viajero»'), '#c9a0ff', 2); destella('#000', 0.6); SONIDO.muerte(); vibra(100);
}
function rechazaTrato() {
  const J = JUEGO, e = J.minijefe; if (!J.trato) return;
  J.trato = null; e.estado = 'flota'; e.f2 = 0.8; e.cd = 0.5; e.vel *= 1.4;
  aviso(tr('¡QUE ASÍ SEA!'), '#ff2d2d', 1.5); SONIDO.jefeCarga(); tiembla(5);
}
function muereParca(e) {
  const J = JUEGO;
  J.trato = null; J.minijefe = null; J.escena = null; J.quieto = 0; J.parcaHecha = true;
  J.restosParca = { x: e.x, y: e.y, t0: J.t };   // se deshace en huesos (PARCA_ANIM.muere) y se queda en el suelo
  for (let i = 0; i < 6; i++) estallido(e.x + (Math.random() - 0.5) * 40, e.y + (Math.random() - 0.5) * 40, 16, i % 2 ? '#c9a0ff' : '#ece6d6', 140, 1.2, 2.8, 1, 10);
  for (let i = 0; i < 25; i++) suelta('moneda', e.x + (Math.random() - 0.5) * 60, e.y + (Math.random() - 0.5) * 40, 1);
  // la guadaña: un arma única de esta partida
  J.armas.guadana = { nivel: 5, evo: true, t: 0.5, ang: 0 };
  aviso(tr('¡LA MUERTE HA MUERTO!'), '#ffd34d', 2.5); aviso2(tr('Su guadaña es tuya'));
  tiembla(9); destella('#fff', 0.8); congela(0.3); SONIDO.victoria(); vibra([80, 40, 80, 40, 200]);
}
// la guadaña del jugador: un tajo enorme en círculo cada segundo
function armaGuadana(a, dt) {
  a.t -= dt; if (a.t > 0) return;
  a.t = 1.0 * JUEGO.st.cd; a.ang += 1.2;
  azote(a.ang, 3.3, 60 * multiArea(), 55 * JUEGO.st.dano * multiDado(), true);
}

// el fotograma que toca
function fotogramaParca(e) {
  const A = PARCA_ANIM[e.estado] || PARCA_ANIM.flota, rit = e.estado === 'flota' ? 5 : e.estado === 'siega' ? 7 : 6;
  if (e.flash > 0 && SPR['parca-he1'] && e.estado === 'flota') return 'parca-he1';
  const n = A[Math.floor(e.animT * rit) % A.length];
  return SPR[n] ? n : SPR.parca ? 'parca' : 'jefe';
}
// la Parca vencida: se resquebraja, cae en un montón de huesos y el montón se desvanece
function pintaRestosParca() {
  const J = JUEGO, R = J.restosParca; if (!R) return;
  const k = J.t - R.t0, A = PARCA_ANIM.muere, n = A[Math.min(A.length - 1, Math.floor(k * 3))];
  if (k > 6) { J.restosParca = null; return; }
  if (SPR[n]) pinta(n, R.x, R.y, false, false, 1, k > 5 ? 6 - k : 1);
}
function pintaParcaExtra(e) {
  const J = JUEGO;
  if (e.estado === 'siega') { G.globalAlpha = 0.5; G.fillStyle = '#ff2d2d'; G.fillRect(e.siegaX - 3, e.y - 70, 6, 140); G.globalAlpha = 1; if (SPR['parca-guadana']) pintaGirado('parca-guadana', e.siegaX, e.y, e.siegaDir * 1.2, 1); }
  if (J.saltoParca > 0) { /* el salto lo pinta el jugador */ }
}
