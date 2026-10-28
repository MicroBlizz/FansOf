// Fans of Goose · Enemigos: las ocas peón (van a por ti), los albatros (se quedan a distancia y escupen), la oca gorda (élite, suelta
// cofre), las bandadas (cruzan la pantalla en V) y la Oca Madre (el jefe de la casilla 63). Vuelan: el vacío no les afecta.
// También el daño (danar), las bajas (mata) y lo que sueltan: plumas de experiencia, monedas, cofres, oca asada e imán.
'use strict';

let SIG_ID = 1;
const escalaVida = () => 1 + CFG.escala.porCasilla * JUEGO.casilla + CFG.escala.porSegundo * JUEGO.t;

function creaEnemigo(tipo, x, y) {
  const e = ENE.saca(); if (!e) return null;
  const D = CFG.enemigos[tipo], f = tipo === 'jefe' ? 1 + JUEGO.t * 0.0012 : escalaVida();
  e.tipo = tipo; e.x = x; e.y = y; e.vx = 0; e.vy = 0; e.kx = 0; e.ky = 0; e.hpMax = e.hp = D.vida * f; e.r = D.r; e.vel = D.vel * (0.9 + Math.random() * 0.2);
  e.dano = D.dano * (1 + JUEGO.casilla * 0.015); e.xp = D.xp; e.flash = 0; e.cd = D.disparo ? D.disparo * Math.random() + 1 : 0; e.cdPl = 0; e.t = Math.random() * 6; e.fase = 0; e.f2 = 0; e.id = SIG_ID++; e.pozo = false; e.caida = 0; e.sx = 0; e.sy = 0; e.cx = 0; e.cy = 0; e.furia = false;
  return e;
}

// un punto en el borde de la pantalla (sobre todo por delante, que es hacia donde vas)
function puntoBorde() {
  const J = JUEGO, r = Math.random(), m = 18;
  if (r < 0.5) return [Math.random() * CFG.W, J.camY - m];
  if (r < 0.92) return [r < 0.71 ? -m : CFG.W + m, J.camY + Math.random() * PAN.H * 0.85];
  return [Math.random() * CFG.W, J.camY + PAN.H + m];
}

function avanzaOleadas(dt) {
  const J = JUEGO, O = CFG.oleada;
  if (J.jefe || J.fin || (J.carrera && J.carrera.llegada !== null)) return;
  const esc = J.escena;
  if (esc && esc.tipo !== 'puente') return;   // el Pozo y la Cárcel traen sus ocas; la Posada, ninguna
  // parado: cuanto más tardas en tirar, más ocas (la presión de la Oca). En el tramo, la horda te sale al paso
  let quiero = O.base + O.porCasilla * J.casilla * 0.55 + O.porSegundo * J.t * 0.5;
  if (J.fase === 'parado') quiero += J.quieto * 1.0;
  else quiero *= 1.25;
  quiero = Math.min(CFG.maxEnemigos - 14, quiero);
  if (J.dado.efecto === 1 && J.dado.quedan > 0) quiero = Math.min(CFG.maxEnemigos - 6, quiero * 1.8);
  J.tOla -= dt;
  if (J.tOla <= 0) {
    J.tOla = 0.2;
    const falta = Math.min(6, Math.floor(quiero - ENE.n));
    const pAlb = J.casilla >= 6 ? Math.min(0.28, 0.06 + J.casilla * 0.007) : 0;
    for (let i = 0; i < falta; i++) { const [x, y] = puntoBorde(); creaEnemigo(Math.random() < pAlb ? 'albatros' : 'oca', x, y); }
  }
  // oca gorda (élite)
  J.tGorda -= dt;
  if (J.tGorda <= 0 && J.t > 35) {
    J.tGorda = O.gordaCada; const n = 1 + Math.floor(J.t / 170);
    for (let i = 0; i < n; i++) { const [x, y] = puntoBorde(); const e = creaEnemigo('gorda', x, y); if (e) e.xp = 10; }
    aviso(tr('¡OCA GORDA!'), '#ff9b4d');
  }
  // bandada en V
  J.tBandada -= dt;
  if (J.tBandada <= 0 && J.casilla >= 5) {
    J.tBandada = O.bandadaCada * (0.8 + Math.random() * 0.4);
    lanzaBandada(false);
  }
}
// una bandada en V que cruza la pantalla (también la que te manda un rival en la Carrera: más larga)
function lanzaBandada(rival) {
  const J = JUEGO, izq = Math.random() < 0.5, y0 = J.yo.y - 40 - Math.random() * 60, n = 7 + Math.min(8, Math.floor(J.casilla / 6)) + (rival ? 4 : 0);
  for (let i = 0; i < n; i++) {
    const fila = Math.ceil(i / 2), lado = i % 2 ? 1 : -1;
    const e = creaEnemigo('bandada', izq ? -20 - fila * 12 : CFG.W + 20 + fila * 12, y0 + lado * fila * 9);
    if (e) { e.vx = (izq ? 1 : -1) * e.vel; e.vy = 8; }
  }
  if (!rival) aviso(tr('¡BANDADA!'), '#9fe0ff');
  SONIDO.bandada();
}

function avanzaEnemigos(dt) {
  const J = JUEGO, yo = J.yo, l = ENE.lista, par = J.cuadro & 1;
  // fuera los muertos de la ronda anterior
  for (let i = ENE.n - 1; i >= 0; i--) if (l[i].hp <= 0) ENE.quita(i);
  llenaRejilla(J.camY);
  for (let i = 0; i < ENE.n; i++) {
    const e = l[i]; e.t += dt; if (e.flash > 0) e.flash -= dt; if (e.cdPl > 0) e.cdPl -= dt;
    if (e.caida > 0) { e.caida -= dt; if (e.caida <= 0) { estallido(e.x, e.y + 4, 4, '#c9b98a', 30, 0.3, 2, 0); } continue; }   // cayendo del cielo (el Pozo): todavía no toca el suelo
    const dx = yo.x - e.x, dy = yo.y - e.y, d = Math.hypot(dx, dy) || 1;
    let qx = 0, qy = 0;
    if (e.tipo === 'bandada') {
      e.x += e.vx * dt; e.y += e.vy * dt;
      if ((e.vx > 0 && e.x > CFG.W + 150) || (e.vx < 0 && e.x < -150)) e.hp = 0;
    } else if (e.tipo === 'jefe') { avanzaJefe(e, dt, dx / d, dy / d, d); }
    else {
      if (e.tipo === 'albatros') {
        const D = CFG.enemigos.albatros, lejos = d > D.distancia;
        qx = lejos ? dx / d : -dx / d * 0.6 - dy / d * 0.8; qy = lejos ? dy / d : -dy / d * 0.6 + dx / d * 0.8;
        e.cd -= dt;
        if (e.cd <= 0 && d < 150) { e.cd = D.disparo * (0.8 + Math.random() * 0.4); disparaBala(e.x, e.y, dx / d * 70, dy / d * 70, D.bala * (1 + J.casilla * 0.015), 'bala'); }
      } else { qx = dx / d; qy = dy / d; }
      // separación entre vecinos (la mitad de las ocas cada fotograma)
      if ((i & 1) === par) {
        const n = enemigosCerca(e.x, e.y, e.r * 2.2); let sx = 0, sy = 0, c = 0;
        for (let k = 0; k < n && c < 6; k++) { const o = l[CERCA[k]]; if (o === e) continue; const ox = e.x - o.x, oy = e.y - o.y, dd = ox * ox + oy * oy, rr = (e.r + o.r) * 0.9; if (dd < rr * rr && dd > 0.01) { const di = Math.sqrt(dd); sx += ox / di * (rr - di); sy += oy / di * (rr - di); c++; } }
        e.sx = sx * 7; e.sy = sy * 7;
      }
      const vel = e.vel;
      e.vx += (qx * vel - e.vx) * Math.min(1, dt * 4); e.vy += (qy * vel - e.vy) * Math.min(1, dt * 4);
      e.x += (e.vx + e.kx + (e.sx || 0)) * dt; e.y += (e.vy + e.ky + (e.sy || 0)) * dt;
      const fr = Math.max(0, 1 - dt * 7); e.kx *= fr; e.ky *= fr;
      // muy lejos: vuelve a entrar por delante (como en los survivors)
      if (d > PAN.H * 1.25 && e.tipo !== 'gorda') { const [x, y] = puntoBorde(); e.x = x; e.y = y; }
    }
    // toca al jugador
    const rr = e.r * 0.8 + CFG.jugador.radio;
    if (e.hp > 0 && J.invul <= 0 && J.salto <= 0 && (e.x - yo.x) ** 2 + (e.y - yo.y) ** 2 < rr * rr) heridaJugador(e.dano, e.x, e.y);
  }
  avanzaBalas(dt);
}

function disparaBala(x, y, vx, vy, dano, spr, r = 3) {
  const b = BALAS.saca(); if (!b) return;
  b.x = x; b.y = y; b.vx = vx; b.vy = vy; b.dano = dano; b.vida = 4; b.spr = spr; b.r = r;
}
function avanzaBalas(dt) {
  const J = JUEGO, yo = J.yo, l = BALAS.lista;
  for (let i = BALAS.n - 1; i >= 0; i--) {
    const b = l[i]; b.x += b.vx * dt; b.y += b.vy * dt; b.vida -= dt;
    if (b.vida <= 0) { BALAS.quita(i); continue; }
    const rr = b.r + CFG.jugador.radio * 0.8;
    if (J.invul <= 0 && J.salto <= 0 && (b.x - yo.x) ** 2 + (b.y - yo.y) ** 2 < rr * rr) { heridaJugador(b.dano, b.x, b.y); BALAS.quita(i); }
  }
}

// --- daño y bajas ---
function danar(e, d, nx, ny, empuje, silencioso, critSeguro) {
  if (e.hp <= 0) return;
  const crit = critSeguro || Math.random() < JUEGO.st.crit;
  if (crit) d *= 2.2;
  e.hp -= d; e.flash = 0.09;
  if (e.tipo === 'jefe' && esCoop()) JUEGO.carrera.danoJefe += d;   // la vida de la Oca Madre es de todos
  const kb = e.tipo === 'jefe' ? empuje * 0.05 : e.tipo === 'gorda' ? empuje * 0.35 : empuje;
  e.kx += nx * kb; e.ky += ny * kb;
  JUEGO.danoTotal += d;
  if (!silencioso || crit) texto(e.x, e.y - e.r, crit ? Math.round(d) + '!' : String(Math.round(d)), crit ? '#ffd34d' : '#ffffff', crit ? 9 : 6, crit ? 0.8 : 0.55);
  if (crit) { estallido(e.x, e.y, 4, '#ffe680', 80, 0.25, 1.6, 2); }
  if (e.hp <= 0) mata(e);
}

function mata(e) {
  const J = JUEGO;
  J.bajas++; J.combo++; J.comboT = 2.2;
  bajaEncierro(e);
  estallido(e.x, e.y, e.tipo === 'gorda' ? 22 : 7, e.tipo === 'albatros' ? '#b9c4b0' : '#ece6d6', 70, 0.7, 2.4, 1, 30);
  estallido(e.x, e.y, 3, '#c21b1b', 50, 0.4, 1.8, 0, 60);
  const xp = e.xp * (e.pozo ? 2 : 1);
  if (e.tipo === 'jefe') { jefeMuere(e); return; }
  if (e.tipo === 'gorda') {
    suelta('cofre', e.x, e.y, 1); if (Math.random() < 0.35) suelta('iman', e.x + 10, e.y, 1);
    tiembla(4); congela(0.06); anillo(e.x, e.y, 40, '#ffb04d', 0.4, 4); SONIDO.muereGorda(); vibra(40);
  } else SONIDO.muere();
  if (xp > 0) suelta('xp', e.x, e.y, xp);
  if (Math.random() < CFG.monedaProb) suelta('moneda', e.x + 4, e.y, 1);
  if (Math.random() < 0.004) suelta('pollo', e.x - 4, e.y, 1);
  hitosCombo();
}

function suelta(tipo, x, y, valor) {
  let p = PLUMAS.saca();
  if (!p) {   // lleno: la experiencia se suma a una pluma que ya está (se vuelve de las gordas)
    if (tipo !== 'xp') { p = PLUMAS.lista.find(o => o.tipo === 'xp'); if (!p) return; }
    else { const o = PLUMAS.lista[(Math.random() * PLUMAS.n) | 0]; if (o.tipo === 'xp') o.valor += valor; return; }
  }
  p.tipo = tipo; p.x = x + (Math.random() - 0.5) * 6; p.y = y + (Math.random() - 0.5) * 6; p.valor = valor; p.atraida = false; p.t = 0;
  const a = Math.random() * 6.283; p.vx = Math.cos(a) * 30; p.vy = Math.sin(a) * 30;
}

// --- la Oca Madre ---
function apareceJefe() {
  const J = JUEGO, yc = yCentro(CFG.jardin) - CFG.altoCasilla * 0.6;
  const e = creaEnemigo('jefe', CFG.W / 2, yc - 30);
  J.jefe = e; e.fase = 0; e.f2 = 2.5;
  if (esCoop()) { e.hpMax = e.hp = e.hpMax * (1 + 0.8 * J.carrera.rivales.size); e.hp -= J.carrera.danoPendiente || 0; J.carrera.danoPendiente = 0; }
  aviso(tr('¡LA OCA MADRE!'), '#ff4d6b', 3); SONIDO.jefe(); tiembla(8); destella('#ff2d4d', 0.5); vibra(200);
  for (let i = ENE.n - 1; i >= 0; i--) { const o = ENE.lista[i]; if (o !== e) { o.hp = 0; estallido(o.x, o.y, 4, '#ece6d6', 40, 0.4, 2, 1); } }
}
function avanzaJefe(e, dt, ux, uy, d) {
  const J = JUEGO, furia = e.hp < e.hpMax * 0.5;
  e.f2 -= dt;
  if (e.fase === 0) {   // persigue despacio y llama a sus crías
    e.vx = ux * e.vel; e.vy = uy * e.vel;
    if (e.f2 <= 0) { e.fase = 1; e.f2 = 0.9; e.cd = 0; }
  } else if (e.fase === 1) {   // anillo de huevos
    e.vx *= 0.9; e.vy *= 0.9; e.cd -= dt;
    if (e.cd <= 0) {
      e.cd = furia ? 0.3 : 0.45; const n = furia ? 18 : 14, giro = e.t * 0.7;
      for (let i = 0; i < n; i++) { const a = giro + i * 6.283 / n; disparaBala(e.x + Math.cos(a) * 20, e.y + Math.sin(a) * 20, Math.cos(a) * 52, Math.sin(a) * 52, 12, 'huevojefe', 4); }
      SONIDO.jefeTiro();
    }
    if (e.f2 <= 0) { e.fase = 2; e.f2 = 0.7; aviso(tr('¡CARGA!'), '#ff4d6b', 0.8); SONIDO.jefeCarga(); }
  } else if (e.fase === 2) {   // se prepara y embiste
    e.vx = -ux * 10; e.vy = -uy * 10;
    if (e.f2 <= 0) { e.fase = 3; e.f2 = 0.55; e.cx = ux * (furia ? 260 : 210); e.cy = uy * (furia ? 260 : 210); }
  } else {
    e.vx = e.cx; e.vy = e.cy; if ((J.cuadro & 3) === 0) estallido(e.x, e.y + 14, 2, '#c9b98a', 30, 0.5, 2.5, 0);
    if (e.f2 <= 0) {
      e.fase = 0; e.f2 = furia ? 1.6 : 2.6; tiembla(3);
      const n = furia ? 6 : 4; for (let i = 0; i < n; i++) { const a = i * 6.283 / n; creaEnemigo('oca', e.x + Math.cos(a) * 34, e.y + Math.sin(a) * 34); }
    }
  }
  e.x += (e.vx + e.kx) * dt; e.y += (e.vy + e.ky) * dt; e.kx *= 0.9; e.ky *= 0.9;
  // no se sale del jardín
  const top = yTecho() + 30, fondo = yCentro(CFG.jardin) + CFG.altoCasilla * 1.4;
  e.x = clamp(e.x, 30, CFG.W - 30); e.y = clamp(e.y, top, fondo);
  if (!e.furia && furia) { e.furia = true; aviso(tr('¡FURIA!'), '#ff2d2d', 1.5); destella('#ff2d2d', 0.4); tiembla(6); }
}
function jefeMuere(e) {
  const J = JUEGO;
  J.jefe = null; J.victoria = true;
  if (esCoop()) mandaCarrera({ t: 'v' });
  for (let i = 0; i < 6; i++) estallido(e.x + (Math.random() - 0.5) * 50, e.y + (Math.random() - 0.5) * 50, 20, i % 2 ? '#ffd34d' : '#ece6d6', 160, 1.4, 3, 1, 20);
  for (let i = 0; i < 40; i++) suelta('moneda', e.x + (Math.random() - 0.5) * 60, e.y + (Math.random() - 0.5) * 40, 1);
  for (let i = ENE.n - 1; i >= 0; i--) ENE.lista[i].hp = 0;
  BALAS.vacia();
  tiembla(9); destella('#ffd34d', 1); congela(0.25); vibra([80, 40, 160]);
  SONIDO.victoria(); J.tVictoria = 3.2;
}
