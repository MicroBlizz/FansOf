// Fans of Jump · La partida: CrazyBunny salta de tronco en tronco (arrastrar y soltar: hacia dónde y cuánto), rescata a los
// amigos atrapados y se los lleva a cuestas (cada uno multiplica los puntos), recoge zanahorias y huye de la ola de barro.
// Si cae lejos del centro de un tronco se le cae un amigo; si no cae en ninguno, al agua. Si la ola lo pilla, también.
// La primera partida la guía Lola (tutorial.js): mientras, la ola espera y el agua no acaba la partida.
// Saltar rápido sube la racha; tres ¡Perfecto! seguidos encienden la Fiebre arcoíris. Las metas (récord y misión) cruzan el río.
'use strict';

const SALTO_MAX = 125;     // lo más lejos que llega un salto (en medidas del mundo)
const BORDE_UY = 0.62;     // más allá de esta parte del radio, se cae un amigo
const CENTRO_PERFECTO = 0.3;
const GIRO_MAX = 1.1;      // lo más que se gira el conejo hacia un lado (radianes)
const RACHA_SEG = 1.1;     // si vuelves a saltar antes de esto, la racha sigue
const FIEBRE_SEG = 6;
const ROMPE_SEG = 0.85;    // lo que aguanta encima un tronco agrietado

const JUEGO = {
  modo: 'menu', t: 0, puntos: 0, metros: 0, zanas: 0, rescatados: 0, cuestas: [],
  conejo: null, caen: [], fin: null, tFin: 0, temblor: 0,
};
const APUNTA = { activo: false, x0: 0, y0: 0, x: 0, y: 0 };
const tengoAmigo = id => id === 'ardilla' || !!GUARDA.tengo[id];
const llevo = id => JUEGO.cuestas.includes(id);
// todos salen atrapados en el río; su poder solo funciona si lo has contratado en el puesto de Lola
const poder = id => llevo(id) && tengoAmigo(id);

// «modo»: 'menu' (la portada) o 'listo' (directo a saltar, al repetir)
function nuevaPartida(modo = 'menu') {
  const x = PAN.W / 2;
  CAM.y = -PAN.H * 0.3;
  preparaAzar();
  const t = reiniciaRio(x, preparaTuto());
  Object.assign(JUEGO, {
    modo, t: 0, puntos: 0, metros: 0, zanas: 0, rescatados: 0, cuestas: [], caen: [], fin: null, tFin: 0, temblor: 0,
    racha: 0, maxRacha: 0, enTronco: 0, perfSeguidos: 0, perfectos: 0, saltos: 0, maxCuestas: 0, fiebre: 0, fiebres: 0,
    liberados: [], viajes: {}, cayeron: 0, zorroUsado: false, tutoHecho: false, recordReto: false, lento: 0, mirilla: 0, iman: 0, super: 0, escudo: false, seguido: false, casi: null, duplicado: false, metas: [], hechas: [], kit: {}, casco: false, cafe: 0, ganadas: 0,
  });
  JUEGO.conejo = { x, wy: 0, tronco: t, ox: 0, owy: 0, ang: 0, salto: null, hunde: 0, cae: 0, ultimo: t };
  reiniciaOla(0); reiniciaDron(); acabaMuerte();
  FX.length = 0; LETREROS.length = 0;
  APUNTA.activo = false;
  preparaMetas();
}

// la partida empieza con el primer salto: se gasta el kit de sabotaje que hubiera comprado (casco de obra: te salva una vez
// del agua; pausa del café: la ola no sale hasta 8 s después; zanahoria de la suerte: empiezas con racha de 3;
// mirilla: ves dónde caes en los 8 primeros saltos)
function empieza() {
  const J = JUEGO;
  J.modo = 'juego'; OLA.activa = true; PANEL.abierto = null;
  empiezaHuella();
  for (const k of ['casco', 'cafe', 'suerte', 'mirilla']) if (GUARDA.kit[k] > 0) { GUARDA.kit[k]--; J.kit[k] = true; }
  if (J.kit.casco) J.casco = true;
  if (J.kit.cafe) { J.cafe = 8; bandera(tr('¡Pausa del café!'), PASTEL.melocoton); }
  if (J.kit.suerte) { J.racha = 3; J.suerte = true; }
  if (J.kit.mirilla) J.mirilla = 8;
  salvaGuarda();
}

// hacia dónde saltaría ahora (en el mundo): dirección contraria a lo arrastrado; la distancia crece con lo arrastrado
function saltoApuntado() {
  const vx = APUNTA.x0 - APUNTA.x, vy = APUNTA.y0 - APUNTA.y, l = Math.hypot(vx, vy);
  if (l < 6) return null;
  const lejos = SALTO_MAX * (JUEGO.super > 0 || JUEGO.conejo.muelle ? SUPER_LEJOS : 1), d = Math.min(lejos, l * 1.25 * lejos / SALTO_MAX), c = JUEGO.conejo;
  return { x: c.x + vx / l * d, wy: c.wy - vy / l * d, d, fuerza: d / lejos, ang: Math.atan2(vx, -vy) };
}
const giroDe = a => Math.max(-GIRO_MAX, Math.min(GIRO_MAX, a));

function salta() {
  const J = JUEGO, c = J.conejo, s = saltoApuntado();
  APUNTA.activo = false;
  if (!s || c.salto) return;
  if (J.super > 0 && !c.muelle) J.super--;
  c.muelle = false;
  if (J.mirilla > 0) J.mirilla--;   // antes de empezar: la del kit vale para los saltos de después del primero
  if (J.modo === 'menu' || J.modo === 'listo') empieza();
  // la racha: saltar enseguida después de caer
  J.racha = J.enTronco < RACHA_SEG && (J.saltos > 0 || J.suerte) ? J.racha + 1 : 0; J.suerte = false;
  J.maxRacha = Math.max(J.maxRacha, J.racha);
  if (J.racha > 0 && J.racha % 5 === 0) { bandera(tr('¡Racha x{n}!', { n: J.racha }), PASTEL.melocoton); SONIDO.racha(); }
  c.ang = giroDe(s.ang);
  c.salto = { x0: c.x, wy0: c.wy, x1: s.x, wy1: s.wy, t: 0, T: 0.32 + s.d / 380, alto: 6 + s.d * 0.14 };
  if (c.tronco) { c.tronco.hunde = 1; onda(c.x, c.wy, c.tronco.r * 0.8); }
  c.tronco = null;
  SONIDO.salto();
}

function puntosPor(base) {
  const J = JUEGO, r = J.racha >= 10 ? 2 : J.racha >= 5 ? 1.5 : 1;
  return Math.round(base * (1 + J.cuestas.length) * r * (J.fiebre > 0 ? 2 : 1));
}

function aterriza() {
  const J = JUEGO, c = J.conejo, s = c.salto;
  c.salto = null; c.x = s.x1; c.wy = s.wy1;
  let mejor = null, d = 1;
  const margen = 1 + facilidad(c.wy) * 5;   // al caer se perdona un poco el borde (más al principio)
  for (const t of RIO.troncos) { const v = dentroTronco(t, c.x, c.wy, margen); if (v <= d) { d = v; mejor = t; } }
  if (!mejor) return alAgua();
  const r = Math.sqrt(d);
  c.tronco = mejor; c.ultimo = mejor; c.ox = c.x - mejor.x; c.owy = c.wy - mejor.wy; c.cae = 1;
  J.enTronco = 0;
  mejor.hunde = 1;
  onda(mejor.x, mejor.wy, mejor.r); salpica(c.x, c.wy, 5, 'rgba(255,255,255,0.9)');
  J.temblor = GUARDA.suave ? 0 : 0.08;
  SONIDO.cae(); vibra(12);
  for (const id of J.cuestas) J.viajes[id] = (J.viajes[id] || 0) + 1;
  // el tronco embarrado por el dron: resbalas (se cae un amigo y adiós racha)
  const resbala = mejor.barro;
  if (resbala) { J.racha = 0; J.perfSeguidos = 0; aviso(tr('¡Resbala!'), c.x - 20, c.wy + 22, '#c99060', 10); vibra(50); }
  if ((r > BORDE_UY || resbala) && J.cuestas.length) {
    if (poder('zorro') && !J.zorroUsado) { J.zorroUsado = true; aviso(tr('¡SlyFox lo esquiva!'), c.x, c.wy + 14, '#ffb37a', 9); }
    else {
      const id = J.cuestas.pop(); J.cayeron++;
      J.caen.push({ id, x: c.x, wy: c.wy, vx: (c.ox >= 0 ? 1 : -1) * 34, vz: 40, z: 22, giro: 0, v: 1.4 });
      aviso(tr('¡Uy!'), c.x, c.wy + 14, '#ff8a7a', 11);
      SONIDO.uy(); vibra(60);
    }
  }
  if (!mejor.pisado) {
    mejor.pisado = true; J.saltos++;
    let p = puntosPor(10);
    if (r < CENTRO_PERFECTO && !resbala) {
      p += puntosPor(5); J.perfectos++; J.perfSeguidos++;
      aviso(tr('¡Perfecto!'), c.x, c.wy + 26, '#ffe066', 11); estrellas(c.x, c.wy); petalos(c.x, c.wy, 10); SONIDO.perfecto(); vibra(25);
      if (J.perfSeguidos >= 3 && J.fiebre <= 0) enciendeFiebre();
    } else J.perfSeguidos = 0;
    if (poder('ardilla')) p += 5;
    J.puntos += p;
    aviso('+' + p, c.x + 16, c.wy + 6, J.fiebre > 0 ? '#ffd0f0' : '#fff8ea', 9);
  }
  if (mejor.zanas) cogeZanas(mejor, c.x, c.wy);
  if (mejor.objeto) cogeObjeto(mejor, c.x, c.wy);
  if (mejor.tipo === 'muelle') { c.muelle = true; mejor.boing = 1; aviso(tr('¡Boing!'), c.x, c.wy + 34, '#ff9ac8', 11); SONIDO.racha(); vibra(30); }
  const rescate = mejor.amigo;
  if (mejor.amigo) {
    const id = mejor.amigo;
    J.cuestas.push(id); J.rescatados++; if (!J.liberados.includes(id)) J.liberados.push(id); J.maxCuestas = Math.max(J.maxCuestas, J.cuestas.length);
    GUARDA.visto[id] = true;
    aviso(tr('¡{n}!', { n: nombreAmigo(id) }), c.x, c.wy + 40, '#9fe3ff', 12);
    corazones(c.x, c.wy + 10); petalos(c.x, c.wy, 8);
    mejor.amigo = null; SONIDO.rescate(); vibra([20, 40, 20]);
    if (J.cuestas.length >= 3) bandera(tr('¡Rabia x{n}!', { n: 1 + J.cuestas.length }), PASTEL.lila);
    if (id === 'castor' && tengoAmigo('castor')) { OLA.wy -= 60; OLA.pala -= 20; bandera(tr('¡BUM! La ola retrocede'), PASTEL.melocoton); J.temblor = GUARDA.suave ? 0 : 0.25; salpica(PAN.W / 2, OLA.wy + 30, 20, '#9a6a40'); }
  }
  compruebaMisiones();
  apuntaHuella(c.x, c.wy);
  tutoCae(r < CENTRO_PERFECTO, rescate);
}

function cogeZanas(tr, x, wy) {
  const J = JUEGO, n = tr.zanas * (poder('mapache') ? 2 : 1);
  J.zanas += n; aviso('+' + n, x - 16, wy + 4, '#ffb347', 9);
  zanasVuelan(tr.x, tr.wy, tr.zanas); tr.zanas = 0; SONIDO.zana();
}

function enciendeFiebre() {
  const J = JUEGO;
  J.fiebre = FIEBRE_SEG; J.fiebres++; J.perfSeguidos = 0;
  bandera(tr('¡Fiebre arcoíris!'), 'arcoiris');
  confeti(PAN.W / 2, J.conejo.wy + 60, 40);
  SONIDO.fiebre();
}

// al agua: el casco de obra o MeerCat te salvan una vez (vuelves al último tronco)
function alAgua() {
  const J = JUEGO, c = J.conejo;
  if (tutoAgua()) return;
  if (J.casco || poder('suricata')) {
    const quien = J.casco ? tr('¡El casco te salva!') : tr('¡MeerCat te salva!');
    if (J.casco) J.casco = false; else J.cuestas.splice(J.cuestas.indexOf('suricata'), 1);
    onda(c.x, c.wy, 8); salpica(c.x, c.wy, 10, 'rgba(255,255,255,0.95)');
    const t = c.ultimo && RIO.troncos.includes(c.ultimo) ? c.ultimo : RIO.troncos.filter(o => o.wy <= c.wy + 10 && o.wy > OLA.wy + 20).sort((a, b) => b.wy - a.wy)[0];
    if (t) { c.tronco = t; c.ox = 0; c.owy = 0; c.x = t.x; c.wy = t.wy; c.cae = 1; J.enTronco = 0; aviso(quien, c.x, c.wy + 30, '#9fe3ff', 10); SONIDO.rescate(); return; }
  }
  muere('barro');
}

function acaba(motivo) {
  const J = JUEGO, c = J.conejo;
  if (J.modo === 'fin') return;
  J.modo = 'fin'; J.tFin = 0; c.salto = null; c.tronco = null;
  const record = J.puntos > GUARDA.mejor;
  cierraRetoYHuella(record);
  if (record) { GUARDA.mejorSeg = J.t - FANTASMA.t0; subeMarca(J.puntos, J.metros, GUARDA.mejorSeg); }   // al ranking mundial (ranking.js)
  GUARDA.mejor = Math.max(GUARDA.mejor, J.puntos); GUARDA.mejorM = Math.max(GUARDA.mejorM, J.metros);
  GUARDA.partidas++; GUARDA.rescatados += J.rescatados;
  const premio = cierraMisiones();
  J.ganadas = J.zanas + premio;
  GUARDA.zanas += J.ganadas;
  salvaGuarda();
  J.fin = { motivo, record, llevaba: J.cuestas.length, premio };
  J.temblor = GUARDA.suave ? 0 : 0.3;
  empiezaMuerte(motivo);
  SONIDO.chof();
  APUNTA.activo = false;
}

function avanzaJuego(dt) {
  const J = JUEGO, c = J.conejo;
  if (J.lento > 0) { J.lento -= dt; dt *= 0.35; }   // al caer, un instante a cámara lenta
  avanzaMuerte(dt);
  J.t += dt; J.temblor = Math.max(0, J.temblor - dt); c.cae = Math.max(0, c.cae - dt * 5);
  if (c.tronco) J.enTronco += dt;
  // el tronco agrietado: se rompe muy rápido; si sigues encima a los ROMPE_SEG, se parte en dos y caes al agua
  if (c.tronco && c.tronco.tipo === 'hunde' && J.modo === 'juego') {
    c.tronco.pisa += dt;
    if (c.tronco.pisa > ROMPE_SEG) { const t = c.tronco; RIO.troncos = RIO.troncos.filter(o => o !== t); c.tronco = null; rompeTronco(t); alAgua(); }
  }
  avanzaTuto(dt); avanzaCasi(dt); avanzaAnuncio(dt);
  if (J.modo === 'juego') { avanzaObjetos(dt); avanzaDron(dt); }
  avanzaRio(dt);
  if (c.salto) {
    const s = c.salto;
    s.t += dt;
    const k = Math.min(1, s.t / s.T);
    c.x = s.x0 + (s.x1 - s.x0) * k; c.wy = s.wy0 + (s.wy1 - s.wy0) * k;
    // la estela: la comprada en cada salto; el arcoíris, en la racha y en la Fiebre
    const tipo = J.fiebre > 0 || (J.racha >= 3 && GUARDA.estela === 'arcoiris') ? 'arcoiris' : GUARDA.estela !== 'arcoiris' ? GUARDA.estela : null;
    if (tipo) estela(c.x, c.wy, Math.sin(Math.PI * k) * s.alto, tipo);
    if (k >= 1) aterriza();
  } else if (c.tronco) { c.x = c.tronco.x + c.ox; c.wy = c.tronco.wy + c.owy; }
  // al apuntar, el conejo se gira hacia donde va a saltar; quieto, vuelve poco a poco a mirar al frente
  const s = APUNTA.activo && saltoApuntado();
  const obj = s ? giroDe(s.ang) : (c.salto ? c.ang : 0);
  c.ang += (obj - c.ang) * Math.min(1, dt * (s ? 14 : 2.5));
  if (J.modo === 'juego') {
    J.metros = Math.max(J.metros, Math.floor(c.wy / 10));
    J.fiebre = Math.max(0, J.fiebre - dt); J.cafe = Math.max(0, J.cafe - dt);
    if (J.cafe <= 0 && !tutoFrena()) avanzaOla(dt, c.wy, J.metros);
    // en la fiebre, las zanahorias de los troncos cercanos vienen solas
    if (J.fiebre > 0) for (const t of RIO.troncos) if (t.zanas && Math.hypot(t.x - c.x, t.wy - c.wy) < 70) cogeZanas(t, t.x, t.wy);
    if (OLA.wy >= c.wy - 2 && !usaEscudo()) muere('ola');
    cruzaMetas();
  }
  if (J.modo === 'fin') { J.tFin += dt; c.hunde = Math.min(1, c.hunde + dt * 1.4); }
  // la cámara solo sube: el conejo va por debajo del centro de la pantalla
  const camObj = c.wy - PAN.H * 0.36;
  if (camObj > CAM.y) CAM.y += (camObj - CAM.y) * Math.min(1, dt * 3);
  generaRio(CAM.y + PAN.H + 140);
  avanzaFx(dt); avanzaHumo(dt); avanzaBonito(dt);
  for (const f of J.caen) { f.x += f.vx * dt; f.z += f.vz * dt; f.vz -= 160 * dt; f.giro += dt * 6; f.v -= dt; if (f.z < 0 && !f.chof) { f.chof = true; onda(f.x, f.wy, 5); salpica(f.x, f.wy, 5, 'rgba(255,255,255,0.9)'); } }
  J.caen = J.caen.filter(f => f.v > 0 && f.z > -12);
}

/* ---------- las metas: líneas que cruzan el río (tu récord y la de la misión de distancia) ---------- */
function preparaMetas() {
  const J = JUEGO;
  if (GUARDA.mejorM > 3) J.metas.push({ wy: GUARDA.mejorM * 10, txt: tr('Mejor'), tipo: 'record', hecha: false });
  for (const m of misionesActivas()) if (m.tipo === 'metros') J.metas.push({ wy: m.n * 10, txt: m.n + ' m', tipo: 'meta', hecha: false });
}
function cruzaMetas() {
  const J = JUEGO, c = J.conejo;
  for (const m of J.metas) if (!m.hecha && c.wy >= m.wy) {
    m.hecha = true;
    m.rota = 0;
    bandera(m.tipo === 'record' ? tr('¡Caos récord!') : tr('¡Orden incumplida!'), m.tipo === 'record' ? PASTEL.oro : PASTEL.lila);
    confeti(PAN.W / 2, m.wy, 30); SONIDO.meta();
  }
}
