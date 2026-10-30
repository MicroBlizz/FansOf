// Fans of Goose · El ritmo del Juego de la Oca: PARADO en una casilla (te defiendes, recoges plumas y decides cuándo tirar), el TRAMO
// (sales disparado las casillas que diga el dado) y la LLEGADA, que resuelve la casilla: de oca a oca, el Puente (6→12, un puente de
// cuerda que se cae), el Pozo (19: encerrado, caen ocas del cielo), la Posada (31: tienda y descanso, con dado maldito al salir),
// las tiradas de la suerte (26 y 53), la Cárcel (52: entre barrotes), la Muerte (58) y el Jardín (63).
'use strict';

const ESC = { pozoMata: 28, carcelMata: 20, puenteAncho: 64 };

// --- el tramo ---
function empiezaTramo(n) {
  const J = JUEGO;
  let destino = Math.min(CFG.jardin, J.casilla + n);
  // las puertas de las tierras y la Muerte no se saltan: el tramo se corta ahí (el minijefe te espera)
  for (let t = J.casilla + 1; t < destino; t++) if ((casillaEs.puerta(t) && !J.puertas.has(t)) || (casillaEs.muerte(t) && !J.parcaHecha)) { destino = t; break; }
  J.destino = destino; J.fase = 'tramo'; J.escena = null; J.quieto = 0; J.tramoT = 0;
  J.invul = Math.max(J.invul, 0.5); anillo(J.yo.x, J.yo.y, 40, '#f6e7b8', 0.4, 3); SONIDO.empieza();
}
const velTramo = () => JUEGO.st.vel * 1.6 * multiVel();
function avanzaTramo(dt) {
  const J = JUEGO, yo = J.yo; J.tramoT += dt;
  let mx = ENTRADA.mx; if (invertido()) mx = -mx;
  yo.x += mx * J.st.vel * 1.1 * dt;
  yo.y -= velTramo() * dt; yo.moviendo = true; yo.anda += dt * 14; yo.miraX = 0; yo.miraY = -1;
  if ((J.cuadro & 1) === 0) particula(yo.x + (Math.random() - 0.5) * 8, yo.y + 8, (Math.random() - 0.5) * 20, 30, 0.4, 2, '#c9b98a', 0, 0);
  if (yo.y <= yCentro(J.destino)) llegada(J.destino);
}

// --- la llegada: para en la casilla y la resuelve ---
function llegada(t) {
  const J = JUEGO, yo = J.yo;
  J.casilla = t; J.mejorCasilla = Math.max(J.mejorCasilla, t); J.fase = 'parado'; J.escena = null; J.quieto = 0; J.mejorY = Math.min(J.mejorY, yCentro(t)); J.sinAvanzar = 0;
  yo.y = yCentro(t); yo.moviendo = false;
  cierraEfectoDado();
  tiembla(2.5); anillo(yo.x, yo.y, 36, '#f6e7b8', 0.35, 3); SONIDO.aterriza(); vibra(15);
  const nombre = nombreCasilla(t);
  if (t === CFG.jardin) { aviso(tr('EL JARDÍN DE LA OCA'), '#7dff6b', 2.2); return; }
  if (CFG.ocaSalta[t]) { saltoOca(ESPECIALES.find(e => e.tipo === 'oca' && e.t === t)); return; }
  if (casillaEs.puerta(t) && !J.puertas.has(t)) { J.puertas.add(t); empiezaMinijefe(t); return; }
  if (casillaEs.puente(t)) { empiezaPuente(t, J.casillas.puenteA); return; }
  if (casillaEs.pozo(t)) { empiezaEncierro('pozo'); return; }
  if (casillaEs.carcel(t)) { empiezaEncierro('carcel'); return; }
  if (casillaEs.posada(t)) { if (maldita('sinposada')) { aviso(tr('POSADA CERRADA'), '#c9a0ff', 1.6); aviso2(tr('La maldición de esta noche')); return; } empiezaPosada(); return; }
  if (casillaEs.dado(t)) { aviso(tr('DE DADO A DADO'), '#ffe9a8', 1.2); J.suerteT = 0.9; return; }
  if (casillaEs.muerte(t)) { if (J.parcaHecha) { aviso(tr('LA MUERTE'), '#ff2d2d', 1.2); aviso2(tr('Ya no está. Sigue')); return; } empiezaParca(); return; }
  if (casillaEs.laberinto(t)) { J.dado.maldito = true; aviso(tr('EL LABERINTO'), '#c9a0ff', 1.6); aviso2(tr('Te pierdes: el próximo dado sale maldito')); return; }
  aviso(nombre ? tr(nombre) : tr('CASILLA {n}', { n: t }), '#f6e7b8', 1.1);
  if (t % 10 === 0) SONIDO.casilla();
}

// --- parado: te mueves por la casilla, las ocas aprietan cuanto más tardas ---
function avanzaParado(dt) {
  const J = JUEGO, yo = J.yo;
  J.quieto += dt;
  if (J.suerteT > 0) { J.suerteT -= dt; if (J.suerteT <= 0 && puedeTirar()) tiradaSuerte(); }
  let mx = ENTRADA.mx, my = ENTRADA.my; if (invertido()) { mx = -mx; my = -my; }
  const m = Math.hypot(mx, my), posada = J.escena && J.escena.tipo === 'posada';
  yo.moviendo = m > 0.12 && !posada;
  if (yo.moviendo) {
    const v = J.st.vel * multiVel() * velTierra() * Math.min(1, m);
    yo.x += mx / Math.max(1, m) * v * dt; yo.y += my / Math.max(1, m) * v * dt;
    yo.miraX = mx / m; yo.miraY = my / m; yo.anda += dt * 10;
  }
  // encerrado: el Pozo es un círculo, la Cárcel un cuadrado
  const E = J.escena;
  if (E && (E.tipo === 'pozo' || E.tipo === 'carcel')) {
    if (E.tipo === 'pozo') { const dx = yo.x - E.cx, dy = yo.y - E.cy, d = Math.hypot(dx, dy); if (d > E.r - 7) { yo.x = E.cx + dx / d * (E.r - 7); yo.y = E.cy + dy / d * (E.r - 7); } }
    else { yo.x = clamp(yo.x, E.cx - E.r + 7, E.cx + E.r - 7); yo.y = clamp(yo.y, E.cy - E.r + 7, E.cy + E.r - 7); }
    avanzaEncierro(dt);
    return;
  }
  // en la casilla: por delante y por detrás no se pasa (se avanza con el dado), pero por los lados está el vacío: si te sales, te caes
  const t = J.casilla;
  const top = t >= CFG.jardin ? yTecho() + 10 : -t * TH + 6, bottom = -(t - 1) * TH - 6;
  yo.y = clamp(yo.y, top, bottom);
}

// --- el Puente: de puente a puente y tiro porque me lleva la corriente ---
function empiezaPuente(de, a) {
  const J = JUEGO;
  J.fase = 'escena'; J.escena = { tipo: 'puente', de, a, x0: centroX(de), x1: centroX(a), y0: yCentro(de), y1: yCentro(a), tAlb: 0.6 };
  J.destino = a; J.yo.x = centroX(de);
  aviso(tr('¡DE PUENTE A PUENTE!'), '#9fe0ff', 1.8); aviso2(tr('y tiro porque me lleva la corriente'));
  SONIDO.oca(); tiembla(3);
}
function xPuente(y) { const E = JUEGO.escena, k = clamp((y - E.y0) / (E.y1 - E.y0), 0, 1); return E.x0 + (E.x1 - E.x0) * k; }
function avanzaPuente(dt) {
  const J = JUEGO, yo = J.yo, E = J.escena;
  let mx = ENTRADA.mx; if (invertido()) mx = -mx;
  yo.x += mx * J.st.vel * 1.2 * dt;
  yo.y -= velTramo() * 0.75 * dt; yo.moviendo = true; yo.anda += dt * 14; yo.miraY = -1;
  // tablas que crujen y saltan
  if ((J.cuadro % 3) === 0) particula(xPuente(yo.y) + (Math.random() - 0.5) * ESC.puenteAncho, yo.y + 10, (Math.random() - 0.5) * 30, 40, 0.5, 2.5, '#6e4426', 90, 3);
  E.tAlb -= dt;
  if (E.tAlb <= 0) { E.tAlb = 0.9; const lado = Math.random() < 0.5 ? -40 : CFG.W + 40; creaEnemigo('albatros', lado, yo.y - 40 - Math.random() * 60); }
  if (yo.y <= E.y1) { J.escena = null; llegada(E.a); }
}

// --- el Pozo y la Cárcel: encerrado hasta tumbar N ocas (que caen del cielo) ---
function empiezaEncierro(tipo) {
  const J = JUEGO, t = J.casilla, n = Math.round((tipo === 'pozo' ? ESC.pozoMata : ESC.carcelMata) * (1 + t * 0.012));
  J.fase = 'parado'; J.escena = { tipo, cx: centroX(t), cy: yCentro(t), r: tipo === 'pozo' ? 44 : 38, restan: n, total: n, tCae: 0.4, t: 0 };
  J.yo.x = centroX(t); J.yo.y = yCentro(t);
  for (let i = ENE.n - 1; i >= 0; i--) { const e = ENE.lista[i]; if (e.tipo !== 'jefe' && Math.hypot(e.x - J.yo.x, e.y - J.yo.y) < 110) e.hp = 0; }
  if (tipo === 'pozo') { aviso(tr('¡EL POZO!'), '#7dff6b', 1.8); aviso2(tr('Tumba {n} ocas para salir: dan el doble', { n })); SONIDO.pozo(); }
  else { aviso(tr('¡LA CÁRCEL!'), '#c9d3ff', 1.8); aviso2(tr('Entre barrotes hasta tumbar {n} ocas', { n })); SONIDO.muerte(); }
  tiembla(5); vibra(80);
}
function avanzaEncierro(dt) {
  const J = JUEGO, E = J.escena; E.t += dt;
  E.tCae -= dt;
  if (E.tCae <= 0 && E.restan > 0) {
    E.tCae = Math.max(0.12, 0.42 - E.t * 0.012);
    const n = 1 + (Math.random() < 0.4 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283, d = Math.random() * (E.r - 10);
      const e = creaEnemigo(Math.random() < 0.12 && E.tipo === 'carcel' ? 'gorda' : 'oca', E.cx + Math.cos(a) * d, E.cy + Math.sin(a) * d);
      if (e) { e.caida = 0.7; e.pozo = true; }
    }
  }
  if (E.restan <= 0) {
    J.escena = null; J.quieto = 0;
    estallidoPozo(); aviso(E.tipo === 'pozo' ? tr('¡FUERA DEL POZO!') : tr('¡LIBRE!'), '#7dff6b', 1.5);
    for (let i = 0; i < 6; i++) suelta('xp', E.cx + (Math.random() - 0.5) * 40, E.cy + (Math.random() - 0.5) * 40, 3);
    if (E.tipo === 'carcel') suelta('cofre', E.cx, E.cy - 20, 1);
  }
}
// cada oca del encierro que cae, una menos
function bajaEncierro(e) { const E = JUEGO.escena; if (E && E.restan > 0 && e.pozo) E.restan--; }

// --- la Posada: descanso, tienda y dado maldito al salir ---
const POSADA = [
  { id: 'asada', nombre: 'Oca asada', desc: 'Te cura del todo', coste: 12, icono: 'pollo' },
  { id: 'carta', nombre: 'Una ronda más', desc: 'Elige una mejora ahora', coste: 30, icono: 'cadencia' },
  { id: 'bendito', nombre: 'Dado bendito', desc: 'El próximo dado sale par, +1', coste: 20, icono: 'dado6' },
  { id: 'cofre', nombre: 'Cofre del posadero', desc: '1, 3 o 5 mejoras al azar', coste: 45, icono: 'moneda' },
];
function empiezaPosada() {
  const J = JUEGO;
  J.fase = 'parado'; J.escena = { tipo: 'posada', compradas: {} };
  for (let i = ENE.n - 1; i >= 0; i--) ENE.lista[i].hp = 0; BALAS.vacia();
  J.vida = Math.min(J.st.vidaMax, J.vida + J.st.vidaMax * 0.4);
  aviso(tr('LA POSADA'), '#ffb86b', 1.8); aviso2(tr('Descansa y compra. Al salir, el dado sale maldito'));
  anillo(J.yo.x, J.yo.y, 90, '#ffb86b', 0.8, 5); SONIDO.posada();
}
function compraPosada(o) {
  const J = JUEGO, E = J.escena; if (!E || E.compradas[o.id]) return;
  if (J.monedasPartida < o.coste) { toast(tr('Te faltan monedas')); SONIDO.dadoMalo(); return; }
  J.monedasPartida -= o.coste; E.compradas[o.id] = true; SONIDO.moneda();
  if (o.id === 'asada') { J.vida = J.st.vidaMax; texto(J.yo.x, J.yo.y - 16, tr('¡A tope!'), '#7dff6b', 9, 1); SONIDO.cura(); }
  else if (o.id === 'carta') { J.pendientes++; }
  else if (o.id === 'bendito') { J.dado.bendito = true; J.dado.maldito = false; }
  else if (o.id === 'cofre') { abreCofre(); }
}
// al tirar desde la Posada: maldito (salvo que hayas comprado el bendito)
function salePosada() { const J = JUEGO; if (J.escena && J.escena.tipo === 'posada' && !J.dado.bendito) J.dado.maldito = true; }

// --- dibujo de las escenas (en el mundo) ---
function pintaEscenas() {
  const J = JUEGO, E = J.escena;
  if (J.fase === 'parado' && !E) {   // la casilla en la que estás, resaltada
    const t = J.casilla, w = anchoDe(t), x0 = centroX(t) - w / 2, top = t >= CFG.jardin ? yTecho() : -t * TH, h = t >= CFG.jardin ? TH * 3 : TH;
    G.globalAlpha = 0.25 + Math.sin(J.t * 4) * 0.1; G.strokeStyle = '#ffd34d'; G.lineWidth = 2; G.strokeRect(x0 + 2, top + 2, w - 4, Math.min(h, J.yD - top) - 4); G.globalAlpha = 1;
  }
  if (!E) return;
  if (E.tipo === 'puente') {
    // el vacío a los lados y las tablas en medio
    const paso = 7;
    for (let y = E.y0 + TH / 2; y > E.y1 - TH / 2; y -= paso) {
      if (y > J.yD) continue;
      const x = xPuente(y), w = ESC.puenteAncho;
      if (SPR['s-tabla']) pinta('s-tabla', x, y, (Math.round(y / paso) & 1) === 1, false, (w + 4) / SPR['s-tabla'].w);   // la tabla ocupa todo el ancho por el que se puede pisar
      else { G.fillStyle = (Math.round(y / paso) & 1) ? '#8a5a30' : '#a06a3a'; G.fillRect(x - w / 2, y - paso / 2 + 0.6, w, paso - 1.2); G.fillStyle = '#120808'; G.fillRect(x - w / 2, y - paso / 2, w, 0.8); }
    }
    G.strokeStyle = '#d9c08a'; G.lineWidth = 1.5; G.beginPath(); G.moveTo(E.x0 - ESC.puenteAncho / 2 - 2, E.y0 + TH / 2); G.lineTo(E.x1 - ESC.puenteAncho / 2 - 2, E.y1 - TH / 2); G.moveTo(E.x0 + ESC.puenteAncho / 2 + 2, E.y0 + TH / 2); G.lineTo(E.x1 + ESC.puenteAncho / 2 + 2, E.y1 - TH / 2); G.stroke();
  } else if (E.tipo === 'pozo') {
    G.fillStyle = '#05060a'; G.beginPath(); G.arc(E.cx, E.cy, E.r + 6, 0, 6.283); G.fill();
    if (SPR['s-pozo']) pinta('s-pozo', E.cx, E.cy + 4, false, false, 1);
    else { G.strokeStyle = '#5c6b72'; G.lineWidth = 8; G.beginPath(); G.arc(E.cx, E.cy, E.r + 3, 0, 6.283); G.stroke(); G.strokeStyle = '#8a9098'; G.lineWidth = 2; G.stroke(); }
    if (!SPR['s-pozo']) { G.fillStyle = '#1a2a22'; G.beginPath(); G.arc(E.cx, E.cy, E.r - 2, 0, 6.283); G.fill(); }
    G.globalAlpha = 0.4 + Math.sin(J.t * 5) * 0.2; G.strokeStyle = '#7dff6b'; G.lineWidth = 1.5; G.beginPath(); G.arc(E.cx, E.cy, E.r - 2, 0, 6.283); G.stroke(); G.globalAlpha = 1;
  } else if (E.tipo === 'carcel') {
    G.fillStyle = 'rgba(0,0,0,.35)'; G.fillRect(E.cx - E.r - 4, E.cy - E.r - 4, E.r * 2 + 8, E.r * 2 + 8);
    G.strokeStyle = '#6e6e78'; G.lineWidth = 3; G.strokeRect(E.cx - E.r - 2, E.cy - E.r - 2, E.r * 2 + 4, E.r * 2 + 4);
  } else if (E.tipo === 'posada') {
    const t = J.casillas.posada, top = -t * TH;
    G.globalAlpha = 0.2 + Math.sin(J.t * 4) * 0.06; G.fillStyle = '#ffb86b'; G.fillRect(centroX(t) - anchoDe(t) / 2, top, anchoDe(t), TH); G.globalAlpha = 1;
    if (SPR['s-posada']) pinta('s-posada', centroX(t), top + 30, false, false, 1);
    if (SPR['s-cama']) pinta('s-cama', centroX(t) - 44, top + TH - 28, false, false, 1);
    if (SPR['s-posadera']) pinta('s-posadera', centroX(t) + 42, top + TH - 32 + Math.sin(J.t * 3) * 1.5, false, false, 1);
    dibujaFarol(centroX(t) - anchoDe(t) * 0.4, top + 14); dibujaFarol(centroX(t) + anchoDe(t) * 0.4, top + 14);
  }
}
// los barrotes van por encima de todo (el jugador está dentro)
function pintaEscenasEncima() {
  if (typeof pintaRestosParca === 'function') pintaRestosParca();
  const J = JUEGO, E = J.escena; if (!E || E.tipo !== 'carcel') return;
  for (let x = E.cx - E.r; x <= E.cx + E.r; x += 9) { G.fillStyle = '#120808'; G.fillRect(x - 1.6, E.cy - E.r - 4, 3.2, E.r * 2 + 8); G.fillStyle = '#8a8a94'; G.fillRect(x - 1, E.cy - E.r - 4, 2, E.r * 2 + 8); }
}
// lo de la escena en el marcador: lo que queda por tumbar, o la tienda de la Posada
function pintaEscenasHud() {
  const J = JUEGO, E = J.escena, W = PAN.W, H = PAN.H; if (!E) return;
  if (E.tipo === 'pozo' || E.tipo === 'carcel') {
    texto2(tr('QUEDAN'), W / 2, 66, 7, '#c9b98a');
    texto2(String(E.restan), W / 2, 80, 20, E.tipo === 'pozo' ? '#7dff6b' : '#c9d3ff', 'center', FUENTE_G, 400, 0.2);
  } else if (E.tipo === 'posada') {
    const y0 = H - 118;
    caja(8, y0, W - 16, 110, 8, 'rgba(26,14,8,.92)', '#ffb86b', 1.5);
    texto2(tr('LA POSADA'), W / 2, y0 + 10, 9, '#ffb86b', 'center', FUENTE_G, 400, 0.25);
    POSADA.forEach((o, i) => {
      const x = 14 + (i % 2) * ((W - 28) / 2 + 4), y = y0 + 20 + Math.floor(i / 2) * 36, w = (W - 32) / 2, hecha = E.compradas[o.id], puede = J.monedasPartida >= o.coste;
      caja(x, y, w, 32, 6, hecha ? '#160b08' : '#2a1610', hecha ? '#3a2016' : puede ? '#ffd34d' : '#6e4426', 1.2);
      icono(o.icono, x + 12, y + 16, 9);
      texto2(tr(o.nombre), x + 24, y + 9, 6.5, hecha ? '#6e4426' : '#fff4dc', 'left');
      texto2(hecha ? tr('comprado') : tr(o.desc), x + 24, y + 19, 5, hecha ? '#6e4426' : '#c9b98a', 'left', FUENTE, 700, 0);
      if (!hecha) { pinta('moneda', x + w - 22, y + 26, false, false, 0.7); texto2(String(o.coste), x + w - 16, y + 26.5, 6, puede ? '#ffcf33' : '#ff8a6b', 'left'); BOTONES.push({ x, y, w, h: 32, accion: () => compraPosada(o) }); }
    });
    texto2(tr('Tira el dado para irte (saldrá impar)'), W / 2, y0 + 101, 6, '#c9a0ff', 'center', FUENTE, 700, 0);
  }
}
